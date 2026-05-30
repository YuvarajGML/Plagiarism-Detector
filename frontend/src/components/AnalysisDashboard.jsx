import React, { useEffect, useState } from 'react'
import { FileDown, FileJson, FileSpreadsheet } from 'lucide-react'
import BenchmarkChart from './BenchmarkChart'
import ShiftTableGrid from './ShiftTableGrid'

const escapePdfText = (text) =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ')

const wrapPdfText = (text, maxLength = 92) => {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ')
  const lines = []
  let line = ''

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word
    if (nextLine.length > maxLength && line) {
      lines.push(line)
      line = word
    } else {
      line = nextLine
    }
  })

  if (line) lines.push(line)
  return lines
}

const createPdfBlob = (lines) => {
  const pageWidth = 595
  const pageHeight = 842
  const marginX = 48
  const lineHeight = 14
  const startY = 790
  const pages = []

  let currentPage = []
  let y = startY

  lines.forEach((line) => {
    if (y < 54) {
      pages.push(currentPage)
      currentPage = []
      y = startY
    }
    currentPage.push({ text: line, y })
    y -= lineHeight
  })
  pages.push(currentPage)

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`
  ]

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2
    const contentObjectId = pageObjectId + 1
    const content = [
      'BT',
      '/F1 10 Tf',
      ...pageLines.map(({ text, y: lineY }) => `1 0 0 1 ${marginX} ${lineY} Tm (${escapePdfText(text)}) Tj`),
      'ET'
    ].join('\n')

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectId} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
    )
  })

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export default function AnalysisDashboard({
  similarity,
  selectedAlgorithm,
  matchSegments = [],
  highlightedSegmentId,
  onSegmentSelect,
  isAnalyzing
}) {
  const [activeSegment, setActiveSegment] = useState(null)

  // Find the selected match segment or default to the top similarity match
  useEffect(() => {
    if (highlightedSegmentId) {
      const match = matchSegments.find((m) => m.id === highlightedSegmentId)
      if (match) setActiveSegment(match)
    } else {
      const topMatch = [...matchSegments].sort((a, b) => b.similarity - a.similarity)[0] || null
      setActiveSegment(topMatch)
    }
  }, [highlightedSegmentId, matchSegments])

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
    const exactCount = matchSegments.filter(s => s.type === 'exact').length
    const nearCount = matchSegments.filter(s => s.type === 'near').length
    const structCount = matchSegments.filter(s => s.type === 'structural').length

    const reportData = {
      appName: "PlagScan Pro",
      timestamp: new Date().toISOString(),
      similarityScore: `${similarity}%`,
      algorithmSelected: selectedAlgorithm,
      exactMatchesCount: exactCount,
      nearMatchesCount: nearCount,
      structuralMatchesCount: structCount,
      matches: matchSegments
    };

    if (type === 'JSON') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `plagscan_pro_report_${similarity}percent.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === 'CSV') {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Match ID,Type,Similarity %,Original Line,Plagiarized Line,Edit Distance,Algorithm\n";
      matchSegments.forEach(m => {
        csvContent += `${m.id},${m.type},${m.similarity},${m.originalLine},${m.plagiarizedLine},${m.distance},${m.algorithm}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute("download", `plagscan_pro_report_${similarity}percent.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (type === 'PDF') {
      const reportLines = [
        'PLAGSCAN PRO ANALYSIS REPORT',
        '',
        `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        `Overall Similarity: ${similarity}%`,
        `Algorithm: ${selectedAlgorithm.toUpperCase()}`,
        '',
        'SUMMARY STATISTICS',
        `Exact Matches: ${exactCount}`,
        `Near Matches: ${nearCount}`,
        `Structural Matches: ${structCount}`,
        '',
        'MATCH DETAILS'
      ];

      matchSegments.forEach(m => {
        reportLines.push('')
        reportLines.push(`Match ID ${m.id}: ${m.type.toUpperCase()} | Similarity: ${m.similarity}%`)
        reportLines.push(`Original line ${m.originalLine}:`)
        reportLines.push(...wrapPdfText(m.originalFull || m.original))
        reportLines.push(`Suspect line ${m.plagiarizedLine}:`)
        reportLines.push(...wrapPdfText(m.plagiarizedFull || m.plagiarized))
        reportLines.push(`Edit Distance: ${m.distance} | Algorithm: ${m.algorithm}`)
      });

      const pdfBlob = createPdfBlob(reportLines);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", pdfUrl);
      downloadAnchor.setAttribute("download", `plagscan_pro_report_${similarity}percent.pdf`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(pdfUrl);
    }
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

          <div className="relative grid place-items-center w-36 h-36 mt-4">
            {/* SVG Thin circular progress ring */}
            <svg viewBox="0 0 108 108" className="w-full h-full transform -rotate-90">
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
            <div className="absolute inset-0 text-center leading-none">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[38px] font-extrabold text-text-primary">
                {isAnalyzing ? '...' : `${similarity}%`}
              </span>
              <span className="absolute left-1/2 top-[66%] -translate-x-1/2 text-[9px] text-text-secondary uppercase font-semibold whitespace-nowrap">
                {similarity < 20 ? 'Clean' : similarity <= 50 ? 'Suspicious' : 'Plagiarized'}
              </span>
            </div>
          </div>

          {/* Chips below */}
          <div className="flex items-center justify-center space-x-2.5 mt-5">
            <span className="text-[10px] font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Exact: {matchSegments.filter(s => s.type === 'exact').length}</span>
            </span>
            <span className="text-[10px] font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>Near: {matchSegments.filter(s => s.type === 'near').length}</span>
            </span>
            <span className="text-[10px] font-medium bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full border border-yellow-100 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              <span>Structural: {matchSegments.filter(s => s.type === 'structural').length}</span>
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
