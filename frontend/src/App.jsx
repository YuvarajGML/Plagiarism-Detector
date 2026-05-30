import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import DocumentViewer from './components/DocumentViewer'
import SimilarityMatrix from './components/SimilarityMatrix'
import AnalysisDashboard from './components/AnalysisDashboard'
import LogBar from './components/LogBar'
import { SAMPLE_DOCUMENTS, SAMPLE_FILES, LOG_MESSAGES } from './data/mockData'

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('horspool')
  const [files, setFiles] = useState(SAMPLE_FILES)
  const [leftDoc, setLeftDoc] = useState(null)
  const [rightDoc, setRightDoc] = useState(null)
  const [nextColumnToFill, setNextColumnToFill] = useState('left')

  // Analysis & Log states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [similarity, setSimilarity] = useState(73)
  const [logs, setLogs] = useState(LOG_MESSAGES)
  const [highlightedSegmentId, setHighlightedSegmentId] = useState(null)

  // Load initial documents on mount
  useEffect(() => {
    // Left column gets original essay
    const origFile = files.find(f => f.name === 'essay_original.txt')
    // Right column gets suspect essay
    const suspectFile = files.find(f => f.name === 'assignment_v1.txt')

    if (origFile && suspectFile) {
      setLeftDoc({
        ...origFile,
        content: SAMPLE_DOCUMENTS.original
      })
      setRightDoc({
        ...suspectFile,
        content: SAMPLE_DOCUMENTS.plagiarized
      })
      // The next file clicked will fill the left side (overwriting it)
      setNextColumnToFill('left')
    }
  }, [])

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

  // File selection logic
  const handleFileSelect = (file) => {
    if (isAnalyzing) return

    // If Compare All mode was active, switch back to single document view
    if (selectedAlgorithm === 'compare') {
      setSelectedAlgorithm('horspool')
    }

    const content = getFileContent(file.name)
    const fullFile = { ...file, content }

    if (nextColumnToFill === 'left') {
      setLeftDoc(fullFile)
      setNextColumnToFill('right')
      // Reset segment focus
      setHighlightedSegmentId(null)
    } else {
      setRightDoc(fullFile)
      setNextColumnToFill('left')
      // Reset segment focus
      setHighlightedSegmentId(null)
    }
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

  // Trigger analysis simulation
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

    const targetSim = getTargetSimilarity(leftDoc, rightDoc)
    let currentLogIndex = 0

    const intervalId = setInterval(() => {
      if (currentLogIndex < LOG_MESSAGES.length) {
        let logLine = LOG_MESSAGES[currentLogIndex]
        
        // Dynamically customize log comments based on documents being matched
        if (logLine.includes('essay_original.txt')) {
          logLine = logLine.replace('essay_original.txt', leftDoc.name)
        }
        if (logLine.includes('assignment_v1.txt')) {
          logLine = logLine.replace('assignment_v1.txt', rightDoc.name)
        }
        if (logLine.includes('73%')) {
          logLine = logLine.replace('73%', `${targetSim}%`)
        }

        setLogs((prev) => [...prev, logLine])

        // Slowly ramp up similarity score progress bar
        const progressPercent = Math.min(
          Math.round((currentLogIndex / (LOG_MESSAGES.length - 1)) * targetSim),
          targetSim
        )
        setSimilarity(progressPercent)

        currentLogIndex++
      } else {
        clearInterval(intervalId)
        setIsAnalyzing(false)
        
        // Finalize state values
        setSimilarity(targetSim)
        
        // Update statuses in the file queue if they were pending
        setFiles(prevFiles => 
          prevFiles.map(file => {
            if (file.name === leftDoc.name || file.name === rightDoc.name) {
              let nextStatus = 'clean'
              if (targetSim > 50) nextStatus = 'plagiarized'
              else if (targetSim >= 20) nextStatus = 'suspicious'
              
              return { ...file, status: nextStatus }
            }
            return file
          })
        )
      }
    }, 180)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background font-sans select-none overflow-hidden pb-20">
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
          onFileSelect={handleFileSelect}
          onBatchCompare={() => setSelectedAlgorithm('compare')}
          onUploadSuccess={handleUploadSuccess}
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
              highlightedSegmentId={highlightedSegmentId}
              onSegmentSelect={setHighlightedSegmentId}
            />
          )}
        </main>

        {/* Right Dashboard panel */}
        <AnalysisDashboard
          similarity={similarity}
          selectedAlgorithm={selectedAlgorithm}
          highlightedSegmentId={highlightedSegmentId}
          onSegmentSelect={setHighlightedSegmentId}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Console Log Console */}
      <LogBar logs={logs} />
    </div>
  )
}
