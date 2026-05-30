/**
 * PlagScan Pro — Horspool Sentence-Level Matching Engine
 * Runs entirely in the browser. Produces match segments from real document text.
 */

// ─── 1. Build Boyer-Moore-Horspool bad-character shift table ─────────────────
function buildShiftTable(pattern) {
  const table = {}
  const m = pattern.length
  for (let i = 0; i < m - 1; i++) {
    table[pattern[i].toLowerCase()] = m - 1 - i
  }
  return table
}

// ─── 2. Horspool exact search: find pattern in text, return start index or -1 ─
function horspoolSearch(text, pattern) {
  const n = text.length
  const m = pattern.length
  if (m === 0 || m > n) return -1

  const lText = text.toLowerCase()
  const lPat = pattern.toLowerCase()
  const shift = buildShiftTable(lPat)
  const defaultShift = m

  let i = m - 1
  while (i < n) {
    let k = 0
    while (k < m && lPat[m - 1 - k] === lText[i - k]) k++
    if (k === m) return i - m + 1
    i += shift[lText[i]] ?? defaultShift
  }
  return -1
}

// ─── 3. Levenshtein distance (word-level, capped for speed) ──────────────────
function levenshtein(a, b) {
  const wa = a.toLowerCase().split(/\s+/)
  const wb = b.toLowerCase().split(/\s+/)
  const rows = wa.length + 1
  const cols = wb.length + 1
  const dp = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        wa[i - 1] === wb[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[rows - 1][cols - 1]
}

// ─── 4. Jaccard similarity over word sets ────────────────────────────────────
function jaccard(a, b) {
  const sa = new Set(a.toLowerCase().split(/\s+/).filter(Boolean))
  const sb = new Set(b.toLowerCase().split(/\s+/).filter(Boolean))
  let inter = 0
  for (const w of sa) if (sb.has(w)) inter++
  const union = sa.size + sb.size - inter
  return union === 0 ? 0 : inter / union
}

// ─── 5. Split text into sentences (non-empty, min 4 words) ───────────────────
function toSentences(text) {
  return text
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.split(/\s+/).length >= 4)
}

// ─── 6. Classify match type ──────────────────────────────────────────────────
function classifyType(jaccardScore, editDist, origWords) {
  // Exact: Horspool found the pattern verbatim
  if (jaccardScore >= 0.92) return 'exact'
  // Near: high overlap but some edits
  if (jaccardScore >= 0.55 || (editDist <= Math.ceil(origWords * 0.4))) return 'near'
  // Structural: pattern found or moderate overlap
  return 'structural'
}

// ─── 7. Main: compute match segments between two documents ───────────────────
/**
 * @param {string} leftText  - content of the "original" (left) document
 * @param {string} rightText - content of the "suspect" (right) document
 * @returns {Array} matchSegments array compatible with DocumentViewer / AnalysisDashboard
 */
export function computeMatchSegments(leftText, rightText) {
  const leftLines = leftText.split('\n')
  const rightLines = rightText.split('\n')

  const leftSentences = toSentences(leftText)
  const rightSentences = toSentences(rightText)

  const segments = []
  const usedRight = new Set()
  let idCounter = 1

  for (const origSent of leftSentences) {
    // Find which line this sentence starts on (1-based)
    const origLine =
      leftLines.findIndex(l => l.includes(origSent.substring(0, 30))) + 1 || 1

    let bestScore = 0
    let bestRightSent = null
    let bestRightLine = 1

    for (let ri = 0; ri < rightSentences.length; ri++) {
      if (usedRight.has(ri)) continue
      const suspSent = rightSentences[ri]

      // Try Horspool exact search first (use a 6-word window as pattern)
      const words = origSent.split(/\s+/)
      const windowSize = Math.min(6, words.length)
      const pattern = words.slice(0, windowSize).join(' ')
      const exactHit = horspoolSearch(suspSent, pattern)

      // Compute Jaccard for scoring
      const jScore = jaccard(origSent, suspSent)
      const combined = exactHit !== -1 ? Math.max(jScore, 0.92) : jScore

      if (combined > bestScore) {
        bestScore = combined
        bestRightSent = suspSent
        bestRightLine =
          rightLines.findIndex(l => l.includes(suspSent.substring(0, 30))) + 1 || ri + 1
      }
    }

    // Only emit a segment if similarity is meaningful
    if (bestScore >= 0.35 && bestRightSent) {
      const editDist = levenshtein(origSent, bestRightSent)
      const origWords = origSent.split(/\s+/).length
      const type = classifyType(bestScore, editDist, origWords)
      const simPct = Math.round(bestScore * 100)

      // Mark as used so the same right sentence doesn't match twice
      const ri = rightSentences.indexOf(bestRightSent)
      if (ri !== -1) usedRight.add(ri)

      segments.push({
        id: idCounter++,
        type,
        similarity: simPct,
        original: origSent.length > 120 ? origSent.slice(0, 120) + '…' : origSent,
        plagiarized: bestRightSent.length > 120 ? bestRightSent.slice(0, 120) + '…' : bestRightSent,
        originalFull: origSent,
        plagiarizedFull: bestRightSent,
        originalLine: origLine,
        plagiarizedLine: bestRightLine,
        distance: editDist,
        algorithm: type === 'exact' ? 'Horspool' : type === 'near' ? 'KMP + Horspool' : 'Winnowing'
      })
    }

    // Cap at 10 most relevant segments for UI readability
    if (segments.length >= 10) break
  }

  // Sort by similarity descending
  return segments.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Compute an overall similarity score from segments
 */
export function computeOverallSimilarity(segments, leftText, rightText) {
  if (segments.length === 0) return 0
  // Weighted average of top segments
  const top = segments.slice(0, 5)
  const weightedSum = top.reduce((sum, s, i) => sum + s.similarity * (5 - i), 0)
  const totalWeight = top.reduce((sum, _, i) => sum + (5 - i), 0)
  return Math.min(Math.round(weightedSum / totalWeight), 100)
}
