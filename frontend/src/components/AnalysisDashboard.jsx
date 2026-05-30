import React, { useEffect, useState } from 'react'
import { FileDown, FileJson, FileSpreadsheet, AlertTriangle, ShieldCheck, Flame } from 'lucide-react'
import { MATCH_SEGMENTS } from '../data/mockData'
import BenchmarkChart from './BenchmarkChart'
import ShiftTableGrid from './ShiftTableGrid'

export default function AnalysisDashboard({
  similarity,
  selectedAlgorithm,
  highlightedSegmentId,
  onSegmentSelect,
  isAnalyzing
}) {
  const [activeSegment, setActiveSegment] = useState(null)

  // Find the selected match segment or default to the highest similarity match (id: 1)
  useEffect(() => {
    if (highlightedSegmentId) {
      const match = MATCH_SEGMENTS.find((m) => m.id === highlightedSegmentId)
      if (match) setActiveSegment(match)
    } else {
      // Default to highest similarity segment
      const topMatch = [...MATCH_SEGMENTS].sort((a, b) => b.similarity - a.similarity)[0]
      setActiveSegment(topMatch)
    }
  }, [highlightedSegmentId])

  // Get additional metrics based on segment
  const getSegmentExtraMetrics = (id) => {
    const extra = {
      1: { jaccard: '0.98', offset: '0', shingle: '9', caught: 'Both' },
      2: { jaccard: '0.81', offset: '242', shingle: '9', caught: 'Horspool' },
      3: { jaccard: '0.70', offset: '489', shingle: '12', caught: 'Winnowing' },
      4: { jaccard: '0.52', offset: '934', shingle: '15', caught: 'Both' }
    }
    return extra[id] || { jaccard: '0.50', offset: '100', shingle: '8', caught: 'Horspool' }
  }

  // Circular progress ring calculations
  const radius = 54
  const stroke = 5
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (similarity / 100) * circumference

  // Progress ring color categories
  const getProgressColor = (score) => {
    if (score < 20) return '#16A34A' // Green-600
    if (score <= 50) return '#EA580C' // Orange-600
    return '#DC2626' // Red-600
  }

  const getProgressBackground = (score) => {
    if (score < 20) return 'text-green-600 bg-green-50'
    if (score <= 50) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const progressColor = getProgressColor(similarity)
  const progressBgClass = getProgressBackground(similarity)

  const handleExport = (type) => {
    alert(`Exporting ${type} report for PlagScan Pro analysis results...`)
  }

  const extraMetrics = activeSegment ? getSegmentExtraMetrics(activeSegment.id) : null

  return (
    <aside className="w-[30%] min-w-[340px] max-w-[420px] bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden select-none">
      
      {/* Scrollable diagnostic content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-10">
        
        {/* SECTION 1: SIMILARITY SCORE */}
        <section className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50/50 rounded-2xl relative">
          <div className="flex items-center space-x-2 absolute top-3 left-4">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Similarity Score</span>
          </div>

          <div className="relative flex items-center justify-center w-36 h-36 mt-4">
            {/* SVG Thin circular progress ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                stroke="#E2E8F0"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="origin-center"
              />
              <circle
                stroke={progressColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="origin-center transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                {isAnalyzing ? '...' : `${similarity}%`}
              </span>
              <span className="text-[9px] text-text-secondary uppercase font-semibold tracking-wider mt-0.5">
                {similarity < 20 ? 'Clean' : similarity <= 50 ? 'Suspicious' : 'Plagiarized'}
              </span>
            </div>
          </div>

          {/* Chips below */}
          <div className="flex items-center justify-center space-x-2.5 mt-5">
            <span className="text-[10px] font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Exact: 12</span>
            </span>
            <span className="text-[10px] font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>Near: 8</span>
            </span>
            <span className="text-[10px] font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full border border-yellow-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              <span>Structural: 4</span>
            </span>
          </div>
        </section>

        {/* SECTION 2: ALGORITHM PERFORMANCE */}
        <section className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
          <BenchmarkChart />
        </section>

        {/* SECTION 3: HORSPOOL SHIFT TABLE */}
        <section className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
          <ShiftTableGrid />
        </section>

        {/* SECTION 4: SEGMENT DETAIL */}
        <section
          className={`p-4 border rounded-2xl transition-all duration-500 ${
            highlightedSegmentId
              ? 'border-primary bg-primary-light/5 shadow-md scale-[1.01]'
              : 'border-slate-100 bg-white shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Top Flagged Segment
            </h3>
            {extraMetrics && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-primary text-white">
                Detected: {selectedAlgorithm === 'compare' ? extraMetrics.caught : selectedAlgorithm.toUpperCase()}
              </span>
            )}
          </div>

          {activeSegment ? (
            <div className="space-y-4">
              {/* Quoted texts side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide mb-1">
                    Original
                  </p>
                  <p className="text-[10px] italic text-text-primary leading-relaxed line-clamp-4 select-text">
                    "{activeSegment.original}"
                  </p>
                  <p className="text-[9px] text-text-secondary font-mono mt-2 text-right">
                    Line {activeSegment.originalLine}
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-wide mb-1">
                    Suspect
                  </p>
                  <p className="text-[10px] italic text-text-primary leading-relaxed line-clamp-4 select-text">
                    "{activeSegment.plagiarized}"
                  </p>
                  <p className="text-[9px] text-text-secondary font-mono mt-2 text-right">
                    Line {activeSegment.plagiarizedLine}
                  </p>
                </div>
              </div>

              {/* Statistics metrics below */}
              {extraMetrics && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center font-mono">
                  <div>
                    <p className="text-[9px] text-text-secondary uppercase font-sans">Jaccard</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">{extraMetrics.jaccard}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-secondary uppercase font-sans">Offset</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">{extraMetrics.offset}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-secondary uppercase font-sans">Shingle</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">{extraMetrics.shingle}</p>
                  </div>
                </div>
              )}

              {/* Bottom tag indicator */}
              <div className="flex justify-between items-center text-[10px] text-text-secondary font-medium">
                <span>Edit Distance: {activeSegment.distance}</span>
                <span>Similarity: {activeSegment.similarity}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary italic text-center py-4">
              Select a matching segment in the document viewer.
            </p>
          )}
        </section>

        {/* SECTION 5: EXPORTS */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Export Report
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-semibold text-text-primary rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
            >
              <FileDown size={12} className="text-red-500" />
              <span>PDF Report</span>
            </button>
            <button
              onClick={() => handleExport('JSON')}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-semibold text-text-primary rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
            >
              <FileJson size={12} className="text-yellow-500" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-semibold text-text-primary rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
            >
              <FileSpreadsheet size={12} className="text-green-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

      </div>
    </aside>
  )
}
