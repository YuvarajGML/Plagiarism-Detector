import React, { useState, useRef } from 'react'
import { FileText, AlignLeft, Info } from 'lucide-react'
import { MATCH_SEGMENTS } from '../data/mockData'
import MatchTooltip from './MatchTooltip'

export default function DocumentViewer({
  leftDoc,
  rightDoc,
  highlightedSegmentId,
  onSegmentSelect
}) {
  const [hoveredMatch, setHoveredMatch] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  const leftContainerRef = useRef(null)
  const rightContainerRef = useRef(null)

  // Split texts into lines
  const leftLines = leftDoc ? leftDoc.content.split('\n') : []
  const rightLines = rightDoc ? rightDoc.content.split('\n') : []

  // Word count calculators
  const getWordCount = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  const handleSpanMouseEnter = (e, match) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Position tooltip just below the hovered span
    setTooltipPos({
      top: rect.bottom + window.scrollY + 8,
      left: Math.min(rect.left + window.scrollX, window.innerWidth - 320)
    })
    setHoveredMatch(match)
  }

  const handleSpanMouseLeave = () => {
    setHoveredMatch(null)
  }

  const handleSpanClick = (match, isLeftClick) => {
    onSegmentSelect(match.id)
    
    // Find the matching element in the other column
    const targetId = isLeftClick ? `right-match-${match.id}` : `left-match-${match.id}`
    const element = document.getElementById(targetId)
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
      
      // Temporarily highlight the scroll destination
      element.classList.add('ring-4', 'ring-primary', 'scale-105')
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary', 'scale-105')
      }, 1500)
    }
  }

  const renderLineWithHighlights = (text, lineNum, isLeft) => {
    // Match segment line index is 1-based in mockData
    const matchesForLine = MATCH_SEGMENTS.filter((m) =>
      isLeft ? m.originalLine === lineNum : m.plagiarizedLine === lineNum
    )

    if (matchesForLine.length === 0) return <span>{text}</span>

    const match = matchesForLine[0]
    const query = isLeft ? match.original : match.plagiarized
    
    // Perform case insensitive search
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return <span>{text}</span>

    const before = text.substring(0, index)
    const matchText = text.substring(index, index + query.length)
    const after = text.substring(index + query.length)

    const isFocused = highlightedSegmentId === match.id

    let highlightBg = ''
    if (match.type === 'exact') {
      highlightBg = isFocused ? 'bg-red-300/40 text-red-950 font-medium' : 'bg-red-500/25 text-red-900'
    } else if (match.type === 'near') {
      highlightBg = isFocused ? 'bg-orange-300/40 text-orange-950 font-medium' : 'bg-orange-500/25 text-orange-900'
    } else {
      highlightBg = isFocused ? 'bg-yellow-300/40 text-yellow-950 font-medium' : 'bg-yellow-500/25 text-yellow-900'
    }

    return (
      <span>
        {before}
        <span
          id={isLeft ? `left-match-${match.id}` : `right-match-${match.id}`}
          onMouseEnter={(e) => handleSpanMouseEnter(e, match)}
          onMouseLeave={handleSpanMouseLeave}
          onClick={() => handleSpanClick(match, isLeft)}
          className={`cursor-pointer rounded px-1 py-0.5 inline transition-all duration-300 hover:opacity-90 ${highlightBg} ${
            isFocused ? 'ring-2 ring-primary ring-offset-1 shadow-md' : 'border-b border-slate-400/40'
          }`}
        >
          {matchText}
        </span>
        {after}
      </span>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none">
      
      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-5 text-[11px] font-medium text-text-secondary">
          <span className="uppercase text-[10px] tracking-wider font-semibold">Highlight Legend:</span>
          
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-red-500/25 border border-red-300" />
            <span>Exact Match</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-orange-500/25 border border-orange-300" />
            <span>Near Match</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-yellow-500/25 border border-yellow-300" />
            <span>Structural Match</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] text-text-secondary">
          <Info size={12} className="text-text-secondary" />
          <span>Click on highlighted spans to cross-reference</span>
        </div>
      </div>

      {/* Main Dual Document Viewers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Document Column */}
        <div className="w-1/2 border-r border-slate-100 flex flex-col h-full">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <FileText size={14} className="text-primary" />
              <span className="text-xs font-bold text-text-primary truncate max-w-[180px]">
                {leftDoc ? leftDoc.name : 'Select a document (Left)'}
              </span>
            </div>
            {leftDoc && (
              <span className="text-[10px] font-semibold text-text-secondary bg-slate-100 px-2 py-0.5 rounded-full">
                {getWordCount(leftDoc.content)} words
              </span>
            )}
          </div>

          <div
            ref={leftContainerRef}
            className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed text-slate-800 bg-slate-50/50 custom-scrollbar"
          >
            {leftDoc ? (
              <div className="space-y-1">
                {leftLines.map((line, idx) => (
                  <div key={`left-l-${idx + 1}`} className="flex items-start hover:bg-slate-100/30 py-0.5 rounded px-1 transition-colors">
                    <span className="w-8 text-[10px] text-slate-400 select-none text-right pr-3 font-semibold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">
                      {line.trim() === '' ? '\u00A0' : renderLineWithHighlights(line, idx + 1, true)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-4 space-y-2">
                <AlignLeft size={36} className="stroke-[1.5] text-slate-300" />
                <p className="text-xs font-medium">Original Document Column</p>
                <p className="text-[10px] text-slate-400">Click a file from the sidebar to load here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Document Column */}
        <div className="w-1/2 flex flex-col h-full">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <FileText size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-text-primary truncate max-w-[180px]">
                {rightDoc ? rightDoc.name : 'Select a document (Right)'}
              </span>
            </div>
            {rightDoc && (
              <span className="text-[10px] font-semibold text-text-secondary bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                {getWordCount(rightDoc.content)} words
              </span>
            )}
          </div>

          <div
            ref={rightContainerRef}
            className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed text-slate-800 bg-slate-50/50 custom-scrollbar"
          >
            {rightDoc ? (
              <div className="space-y-1">
                {rightLines.map((line, idx) => (
                  <div key={`right-l-${idx + 1}`} className="flex items-start hover:bg-slate-100/30 py-0.5 rounded px-1 transition-colors">
                    <span className="w-8 text-[10px] text-slate-400 select-none text-right pr-3 font-semibold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">
                      {line.trim() === '' ? '\u00A0' : renderLineWithHighlights(line, idx + 1, false)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-4 space-y-2">
                <AlignLeft size={36} className="stroke-[1.5] text-slate-300" />
                <p className="text-xs font-medium">Suspect Document Column</p>
                <p className="text-[10px] text-slate-400">Click a second file from the sidebar to compare</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Hover Match Tooltip */}
      {hoveredMatch && (
        <MatchTooltip
          match={hoveredMatch}
          position={tooltipPos}
          onClose={() => setHoveredMatch(null)}
        />
      )}
    </div>
  )
}
