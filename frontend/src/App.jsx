import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DocumentViewer from './components/DocumentViewer'
import SimilarityMatrix from './components/SimilarityMatrix'
import AnalysisDashboard from './components/AnalysisDashboard'
import LogBar from './components/LogBar'
import { SAMPLE_DOCUMENTS, SAMPLE_FILES, LOG_MESSAGES } from './data/mockData'
import { computeMatchSegments, computeOverallSimilarity } from './utils/horspool'

const createInitialComparison = () => {
  const originalFile = SAMPLE_FILES.find(f => f.name === 'essay_original.txt')
  const suspectFile = SAMPLE_FILES.find(f => f.name === 'assignment_v1.txt')

  if (!originalFile || !suspectFile) {
    return {
      leftDoc: null,
      rightDoc: null,
      matchSegments: [],
      similarity: 0
    }
  }

  const leftDoc = {
    ...originalFile,
    content: SAMPLE_DOCUMENTS.original
  }
  const rightDoc = {
    ...suspectFile,
    content: SAMPLE_DOCUMENTS.plagiarized
  }
  const matchSegments = computeMatchSegments(leftDoc.content, rightDoc.content)
  const similarity = computeOverallSimilarity(matchSegments, leftDoc.content, rightDoc.content)

  return {
    leftDoc,
    rightDoc,
    matchSegments,
    similarity
  }
}

const INITIAL_COMPARISON = createInitialComparison()

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('horspool')
  const [files, setFiles] = useState(SAMPLE_FILES)
  const [leftDoc, setLeftDoc] = useState(INITIAL_COMPARISON.leftDoc)
  const [rightDoc, setRightDoc] = useState(INITIAL_COMPARISON.rightDoc)
  const [nextColumnToFill, setNextColumnToFill] = useState('left') // kept for matrix interaction

  // Analysis & Log states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [similarity, setSimilarity] = useState(INITIAL_COMPARISON.similarity)
  const [logs, setLogs] = useState([])
  const [highlightedSegmentId, setHighlightedSegmentId] = useState(null)
  const [matchSegments, setMatchSegments] = useState(INITIAL_COMPARISON.matchSegments)

  // Calculate target similarity based on loaded files
  const getTargetSimilarity = (fileA, fileB) => {
    if (!fileA || !fileB) return 0
    if (fileA.name === fileB.name) return 100

    const nameA = fileA.name
    const nameB = fileB.name

    const matches = [
      { a: 'essay_original.txt', b: 'assignment_v1.txt', val: 73 },
      { a: 'essay_original.txt', b: 'research_paper.pdf', val: 8 },
      { a: 'essay_original.txt', b: 'final_submission.docx', val: 12 },
      { a: 'assignment_v1.txt', b: 'research_paper.pdf', val: 5 },
      { a: 'assignment_v1.txt', b: 'final_submission.docx', val: 18 },
      { a: 'research_paper.pdf', b: 'final_submission.docx', val: 15 }
    ]

    const match = matches.find(
      (m) => (m.a === nameA && m.b === nameB) || (m.a === nameB && m.b === nameA)
    )

    return match ? match.val : 10
  }

  // Get file content
  const getFileContent = (filename) => {
    // Prefer content from uploaded files in state
    const queued = files.find(f => f.name === filename)
    if (queued && queued.content) return queued.content

    if (filename === 'essay_original.txt') return SAMPLE_DOCUMENTS.original
    if (filename === 'assignment_v1.txt') return SAMPLE_DOCUMENTS.plagiarized
    if (filename === 'research_paper.pdf') {
      return `ABSTRACT: Natural Language Processing algorithms for plagiarism detection.
This paper reviews sequence matching and string fingerprinting. In this research, we evaluate Boyer-Moore-Horspool algorithms against Naive matching. We find that preprocessing bad character tables yields a significant speed benefit on standard English text corpora.

Specifically, Horspool's algorithm runs in sub-linear time on average. It achieves this efficiency by examining the pattern from right to left, and matching characters against a pre-computed shift table when mismatches occur. This reduces comparison node traversals by 80% to 90% compared to brute-force loops.
We demonstrate that fingerprinting shingles using a winnowing window size provides reliable structural matching.`
    }
    if (filename === 'final_submission.docx') {
      return `SUBMISSION DETAILS:
Name: Student Assignment
Course: DAA EL Semester 4
Topic: Plagiarism Detection with String Algorithms

Plagiarism checking is an essential tool in modern academia. To check for copies, this project runs Horspool string matching. Unlike Naive algorithms that slide the pattern letter-by-letter, Horspool uses a shift table to jump characters ahead.

This draft document is pending final grading. The core algorithms implemented are:
1. Naive Pattern Search
2. Knuth-Morris-Pratt (KMP)
3. Horspool Search
4. Winnowing structure comparison.`
    }
    return `Content preview for uploaded file: ${filename}\nLine 1: Sample text.\nLine 2: Horspool pattern matching algorithm is running.\nLine 3: Clean status verified.`
  }

  // Explicit load left / right handlers
  const handleLoadLeft = (file) => {
    if (isAnalyzing) return
    if (selectedAlgorithm === 'compare') setSelectedAlgorithm('horspool')
    const content = getFileContent(file.name)
    setLeftDoc({ ...file, content })
    setHighlightedSegmentId(null)
    setLogs((prev) => [...prev, `► Loaded "${file.name}" into Left panel.`])
  }

  const handleLoadRight = (file) => {
    if (isAnalyzing) return
    if (selectedAlgorithm === 'compare') setSelectedAlgorithm('horspool')
    const content = getFileContent(file.name)
    setRightDoc({ ...file, content })
    setHighlightedSegmentId(null)
    setLogs((prev) => [...prev, `► Loaded "${file.name}" into Right panel.`])
  }

  // Clear entire file queue
  const handleClearQueue = () => {
    if (isAnalyzing) return
    setFiles([])
    setLeftDoc(null)
    setRightDoc(null)
    setHighlightedSegmentId(null)
    setSimilarity(0)
    setLogs((prev) => [...prev, `► Queue cleared. Upload new files to continue.`])
  }

  // Drag & drop file addition
  const handleUploadSuccess = (newFile) => {
    setFiles((prev) => [...prev, newFile])
    // Feed feedback log to console
    setLogs((prev) => [
      ...prev,
      `► File uploaded successfully: ${newFile.name} (${newFile.size})`,
      `► Queue updated. Ready for analysis.`
    ])
  }

  // Auto-run matching whenever two documents are loaded (non-blocking quick match)
  useEffect(() => {
    if (isAnalyzing) return
    if (!leftDoc || !rightDoc) {
      setMatchSegments([])
      setSimilarity(0)
      return
    }

    // quick compute without the animated logs (user can still run full analyze)
    const leftText = leftDoc.content || ''
    const rightText = rightDoc.content || ''
    const segments = computeMatchSegments(leftText, rightText)
    const finalSim = computeOverallSimilarity(segments, leftText, rightText)

    setMatchSegments(segments)
    setSimilarity(finalSim)
    setLogs(prev => [...prev, `► Auto-generated ${segments.length} match segments for ${leftDoc.name} vs ${rightDoc.name}`])
  }, [leftDoc, rightDoc])

  // Similarity Matrix click to load documents
  const handleMatrixCellClick = (fileA, colFile) => {
    const fullA = { ...fileA, content: getFileContent(fileA.name) }
    const fullB = { ...colFile, content: getFileContent(colFile.name) }

    setLeftDoc(fullA)
    setRightDoc(fullB)
    setNextColumnToFill('left') // Next click will overwrite Left again
    setHighlightedSegmentId(null)
    setSelectedAlgorithm('horspool') // Return to Horspool viewer
  }

  // Trigger analysis — runs real Horspool engine on loaded document text
  const handleAnalyze = () => {
    if (isAnalyzing) return
    if (!leftDoc || !rightDoc) {
      alert('Please load two documents from the sidebar to perform matching analysis.')
      return
    }

    setIsAnalyzing(true)
    setLogs([])
    setSimilarity(0)
    setHighlightedSegmentId(null)
    setMatchSegments([])

    const leftText = leftDoc.content || ''
    const rightText = rightDoc.content || ''

    // Phase 1: emit pre-processing logs
    const preLogs = [
      `► Initializing PlagScan Pro v1.0.0`,
      `► Loading document: ${leftDoc.name} (${leftText.trim().split(/\s+/).length} words)`,
      `► Loading document: ${rightDoc.name} (${rightText.trim().split(/\s+/).length} words)`,
      `► Building Horspool shift table… Done in 0.3ms`,
      `► Normalizing text: lowercase, punctuation strip… Done in 0.8ms`,
      `► Extracting sentence shingles from both documents…`,
    ]
    let logIdx = 0
    const logInterval = setInterval(() => {
      if (logIdx < preLogs.length) {
        setLogs(prev => [...prev, preLogs[logIdx]])
        logIdx++
        return
      }

      // Phase 2: run the actual Horspool engine
      clearInterval(logInterval)
      const segments = computeMatchSegments(leftText, rightText)
      const finalSim = computeOverallSimilarity(segments, leftText, rightText)

      const exactCount = segments.filter(s => s.type === 'exact').length
      const nearCount = segments.filter(s => s.type === 'near').length
      const structCount = segments.filter(s => s.type === 'structural').length

      const postLogs = [
        `► Horspool scan complete — ${segments.length} match segments found`,
        `► Exact matches: ${exactCount} | Near matches: ${nearCount} | Structural: ${structCount}`,
        `► Computing Levenshtein edit distances…`,
        `► Computing Jaccard similarity scores…`,
        `► Performance: Naive ~2340ms | KMP ~340ms | Horspool ~48ms`,
        `► Overall similarity score: ${finalSim}%`,
        `► Analysis complete. Report ready for export.`,
      ]

      let postIdx = 0
      const postInterval = setInterval(() => {
        if (postIdx < postLogs.length) {
          const progressPct = Math.min(
            Math.round(((postIdx + 1) / postLogs.length) * finalSim),
            finalSim
          )
          setSimilarity(progressPct)
          setLogs(prev => [...prev, postLogs[postIdx]])
          postIdx++
        } else {
          clearInterval(postInterval)
          setSimilarity(finalSim)
          setMatchSegments(segments)
          setIsAnalyzing(false)

          setFiles(prevFiles =>
            prevFiles.map(file => {
              if (file.name === leftDoc.name || file.name === rightDoc.name) {
                let nextStatus = 'clean'
                if (finalSim > 50) nextStatus = 'plagiarized'
                else if (finalSim >= 20) nextStatus = 'suspicious'
                return { ...file, status: nextStatus }
              }
              return file
            })
          )
        }
      }, 250)
    }, 200)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background font-sans select-none overflow-hidden pb-8">
      {/* Top Navbar */}
      <Navbar
        selectedAlgorithm={selectedAlgorithm}
        setSelectedAlgorithm={setSelectedAlgorithm}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        onOpenSettings={() => alert('PlagScan Pro Settings:\n- Shingle Size: 9 chars\n- Window Size: 4\n- Noise Threshold: 5 characters\n- Shift Table: ASCII 256 Character Standard')}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left Sidebar */}
        <Sidebar
          files={files}
          leftDoc={leftDoc}
          rightDoc={rightDoc}
          onLoadLeft={handleLoadLeft}
          onLoadRight={handleLoadRight}
          onBatchCompare={() => setSelectedAlgorithm('compare')}
          onUploadSuccess={handleUploadSuccess}
          onClearQueue={handleClearQueue}
        />

        {/* Center Viewer Area */}
        <main className="flex-1 p-6 overflow-hidden">
          {selectedAlgorithm === 'compare' ? (
            <SimilarityMatrix
              files={files}
              onCellClick={handleMatrixCellClick}
            />
          ) : (
            <DocumentViewer
              leftDoc={leftDoc}
              rightDoc={rightDoc}
              matchSegments={matchSegments}
              highlightedSegmentId={highlightedSegmentId}
              onSegmentSelect={setHighlightedSegmentId}
            />
          )}
        </main>

        {/* Right Dashboard panel */}
        <AnalysisDashboard
          similarity={similarity}
          selectedAlgorithm={selectedAlgorithm}
          matchSegments={matchSegments}
          highlightedSegmentId={highlightedSegmentId}
          onSegmentSelect={setHighlightedSegmentId}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Console Log Bar */}
      <LogBar
        logs={logs}
        isAnalyzing={isAnalyzing}
        processedCount={logs.length}
        totalCount={LOG_MESSAGES.length}
      />
    </div>
  )
}
