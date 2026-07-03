import { computeMatchSegments, computeOverallSimilarity } from './horspool.js'

const EXTERNAL_SOURCES = [
  {
    id: 'web-ml-overview',
    type: 'Web',
    title: 'What is Machine Learning?',
    url: 'https://www.ibm.com/topics/machine-learning',
    author: 'IBM Think',
    published: '2026-05-26',
    language: 'en',
    citationHints: ['ibm', 'what is machine learning', 'machine learning ibm'],
    text: `Machine learning is the subset of artificial intelligence focused on algorithms that learn the patterns of training data and make accurate inferences about new data. This pattern recognition ability enables machine learning models to make decisions or predictions without explicit hard-coded instructions. Machine learning provides the backbone of many modern AI systems, from forecasting models to autonomous vehicles and large language models.`
  },
  {
    id: 'academic-horspool',
    type: 'Academic',
    title: 'Text Documents Plagiarism Detection using Rabin-Karp and Jaro-Winkler Distance Algorithms',
    url: 'https://www.researchgate.net/publication/316681173_Text_Documents_Plagiarism_Detection_using_Rabin-Karp_and_Jaro-Winkler_Distance_Algorithms',
    author: 'ResearchGate publication page',
    published: '2017-05-04',
    language: 'en',
    citationHints: ['rabin-karp', 'jaro-winkler', 'researchgate', 'text documents plagiarism detection'],
    text: `Plagiarism detection systems commonly implement string matching algorithms in text documents to search for common words between documents. Rabin-Karp can identify matching text patterns, while Jaro-Winkler distance can support similarity scoring for near matches in plagiarism detection.`
  },
  {
    id: 'web-paraphrase-ai',
    type: 'Publisher Policy',
    title: 'IEEE Access Preparing Your Article',
    url: 'https://ieeeaccess.ieee.org/authors/preparing-your-article/',
    author: 'IEEE Access',
    published: '2026-06-02',
    language: 'en',
    citationHints: ['ieee access', 'preparing your article', 'plagiarism'],
    text: `Each article submitted to IEEE Access is scanned for plagiarism, including similarity to an author's own work. If overlap is high or the source article is not referenced, the article can be rejected.`
  },
  {
    id: 'cross-lang-ml-es',
    type: 'Cross-language',
    title: 'Machine Learning: What it is and why it matters',
    url: 'https://www.sas.com/en_us/insights/analytics/machine-learning.html',
    author: 'SAS Insights',
    published: '2026-06-07',
    language: 'es',
    citationHints: ['sas', 'machine learning what it is and why it matters'],
    text: `El aprendizaje automatico es una rama de la inteligencia artificial que permite a las computadoras aprender de los datos sin programacion explicita. Los sistemas mejoran con la experiencia, identifican patrones en conjuntos de datos y hacen predicciones.`
  }
]

const TRANSLATION_LEXICON = {
  aprendizaje: 'learning',
  automatico: 'machine',
  inteligencia: 'intelligence',
  artificial: 'artificial',
  computadoras: 'computers',
  aprender: 'learn',
  datos: 'data',
  programacion: 'programming',
  explicita: 'explicit',
  sistemas: 'systems',
  experiencia: 'experience',
  patrones: 'patterns',
  predicciones: 'predictions'
}

const normalizeWords = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

const toSentences = (text) =>
  String(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 18 && sentence.split(/\s+/).length >= 4)

export const buildSearchQueries = (text, maxQueries = 4) =>
  toSentences(text)
    .map((sentence) => ({
      sentence,
      query: normalizeWords(sentence).slice(0, 10).join(' ')
    }))
    .filter((item) => item.query.length > 20)
    .slice(0, maxQueries)

const translateForComparison = (text) =>
  normalizeWords(text)
    .map((word) => TRANSLATION_LEXICON[word] || word)
    .join(' ')

const containment = (a, b) => {
  const left = new Set(normalizeWords(a))
  const right = new Set(normalizeWords(b))
  if (!left.size || !right.size) return 0

  let intersection = 0
  for (const word of left) {
    if (right.has(word)) intersection += 1
  }
  return intersection / Math.min(left.size, right.size)
}

const shingleSet = (text, size = 3) => {
  const words = normalizeWords(text)
  const grams = new Set()
  for (let i = 0; i <= words.length - size; i += 1) {
    grams.add(words.slice(i, i + size).join(' '))
  }
  return grams
}

const shingleContainment = (a, b) => {
  const left = shingleSet(a, 3)
  const right = shingleSet(b, 3)
  if (!left.size || !right.size) return 0

  let intersection = 0
  for (const gram of left) {
    if (right.has(gram)) intersection += 1
  }
  return intersection / Math.min(left.size, right.size)
}

const bestSentenceEvidence = (suspectText, sourceText) => {
  const suspectSentences = toSentences(suspectText)
  const sourceSentences = toSentences(sourceText)
  let best = null

  suspectSentences.forEach((suspectSentence) => {
    sourceSentences.forEach((sourceSentence) => {
      const lexicalScore = Math.max(
        containment(suspectSentence, sourceSentence),
        shingleContainment(suspectSentence, sourceSentence)
      )
      const crossLanguageScore = containment(
        translateForComparison(suspectSentence),
        translateForComparison(sourceSentence)
      )
      const score = Math.max(lexicalScore, crossLanguageScore * 0.92)

      if (!best || score > best.score) {
        best = {
          score,
          suspectSentence,
          sourceSentence,
          crossLanguage: crossLanguageScore > lexicalScore + 0.08
        }
      }
    })
  })

  return best
}

export const getKnownExternalSources = () => EXTERNAL_SOURCES

export const buildCorpusIndex = (files, getFileContent) => {
  const docs = files.map((file) => {
    const content = file.content || getFileContent(file.name) || ''
    const words = normalizeWords(content)
    return {
      id: file.id,
      name: file.name,
      content,
      wordCount: words.length,
      vocabulary: new Set(words),
      shingles: shingleSet(content, 3)
    }
  })

  return {
    docs,
    documentCount: docs.length,
    tokenCount: docs.reduce((sum, doc) => sum + doc.wordCount, 0),
    shingleCount: docs.reduce((sum, doc) => sum + doc.shingles.size, 0)
  }
}

export const getCorpusSimilarity = (fileA, fileB, getFileContent) => {
  if (!fileA || !fileB) return 0
  if (fileA.id === fileB.id || fileA.name === fileB.name) return 100

  const leftText = fileA.content || getFileContent(fileA.name) || ''
  const rightText = fileB.content || getFileContent(fileB.name) || ''
  const segments = computeMatchSegments(leftText, rightText)
  return computeOverallSimilarity(segments, leftText, rightText)
}

export const analyzeCitationCoverage = (text, sources = EXTERNAL_SOURCES) => {
  const lower = String(text).toLowerCase()
  const hasReferenceSection = /\b(references|bibliography|works cited)\b/i.test(text)

  return sources.map((source) => {
    const cited = source.citationHints.some((hint) => lower.includes(hint.toLowerCase()))
    return {
      sourceId: source.id,
      title: source.title,
      cited,
      status: cited ? 'Cited' : hasReferenceSection ? 'Missing citation' : 'No citation section'
    }
  })
}

export const findExternalSources = (suspectText, sources = EXTERNAL_SOURCES) => {
  const citationCoverage = analyzeCitationCoverage(suspectText, sources)

  return sources
    .map((source) => {
      const evidence = bestSentenceEvidence(suspectText, source.text)
      const citation = citationCoverage.find((item) => item.sourceId === source.id)
      const confidence = evidence ? Math.min(Math.round(evidence.score * 118), 100) : 0
      const attributionPenalty = citation?.cited ? 0 : 8

      return {
        ...source,
        confidence: Math.max(confidence - attributionPenalty, 0),
        evidence,
        citationStatus: citation?.status || 'Unknown',
        cited: Boolean(citation?.cited),
        detectionMode: evidence?.crossLanguage ? 'Cross-language semantic' : source.type === 'Academic' ? 'Academic source' : 'Web source'
      }
    })
    .filter((source) => source.confidence >= 24)
    .sort((a, b) => b.confidence - a.confidence)
}

export const getNovelFeatures = () => [
  {
    name: 'Source Radar',
    novelty: 'Ranks likely web and academic origins instead of stopping at local pairwise overlap.'
  },
  {
    name: 'Corpus Fingerprint Index',
    novelty: 'Turns the queued files into a searchable mini-corpus with computed N-by-N scores.'
  },
  {
    name: 'Citation Trust Layer',
    novelty: 'Separates cited reuse from unattributed reuse using reference and source-hint checks.'
  },
  {
    name: 'Cross-Language Similarity Probe',
    novelty: 'Uses a lightweight multilingual lexicon path to catch translated source reuse in-browser.'
  },
  {
    name: 'Evidence-First Reports',
    novelty: 'Exports source URL, attribution status, and matched evidence with the usual similarity score.'
  }
]
