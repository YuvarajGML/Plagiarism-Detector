import React, { useMemo, useState } from 'react'
import { Info, HelpCircle } from 'lucide-react'

export default function SimilarityMatrix({ files, getFileContent, getCorpusSimilarity, onCellClick }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const matrixValues = useMemo(() => {
    const values = new Map()
    files.forEach((rowFile) => {
      files.forEach((colFile) => {
        values.set(`${rowFile.id}:${colFile.id}`, getCorpusSimilarity(rowFile, colFile, getFileContent))
      })
    })
    return values
  }, [files, getCorpusSimilarity, getFileContent])

  const getMatrixValue = (fileA, fileB) => matrixValues.get(`${fileA.id}:${fileB.id}`) ?? 0

  // Get color based on similarity score
  const getCellColor = (score) => {
    if (score === 100) return 'bg-slate-100 text-slate-400 border-slate-200'
    if (score < 20) return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100'
    if (score < 50) return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100'
    return 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200 font-semibold'
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-base font-bold text-text-primary">Cross-Document Similarity Matrix</h2>
          <p className="text-xs text-text-secondary mt-1">
            Live corpus index over all queued documents. Click any intersecting cell to inspect matching segments.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-text-secondary bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
          <Info size={12} className="text-primary" />
          <span>Symmetric N×N Heatmap</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                {/* Top-left empty cell */}
                <th className="w-1/5 py-2 px-1 text-[10px] font-semibold text-text-secondary text-left truncate"></th>
                {files.map((file) => (
                  <th
                    key={`th-${file.id}`}
                    className="py-3 px-1 text-[10px] font-semibold text-text-secondary text-center truncate border-b border-slate-200"
                    title={file.name}
                  >
                    {file.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map((rowFile) => (
                <tr key={`tr-${rowFile.id}`} className="hover:bg-slate-50/40">
                  {/* Row header */}
                  <td
                    className="py-4 pr-3 text-[10px] font-semibold text-text-primary text-left truncate border-r border-slate-200"
                    title={rowFile.name}
                  >
                    {rowFile.name}
                  </td>
                  
                  {files.map((colFile) => {
                    const score = getMatrixValue(rowFile, colFile)
                    const isSelf = rowFile.id === colFile.id
                    const colorClass = getCellColor(score)

                    return (
                      <td
                        key={`cell-${rowFile.id}-${colFile.id}`}
                        onMouseEnter={() =>
                          setHoveredCell({ row: rowFile.name, col: colFile.name, score, isSelf })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => !isSelf && onCellClick(rowFile, colFile)}
                        className={`border border-slate-200 py-6 text-center text-xs transition-all duration-150 cursor-pointer relative ${colorClass}`}
                      >
                        {isSelf ? '-' : `${score}%`}

                        {/* Cell hover highlight */}
                        {!isSelf && (
                          <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity bg-black rounded" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-8 flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center space-x-6">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                Risk Levels
              </span>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                  <span className="text-text-secondary text-[11px]">&lt; 20% (Clean)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
                  <span className="text-text-secondary text-[11px]">20% - 50% (Suspicious)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                  <span className="text-text-secondary text-[11px]">&gt; 50% (Flagged)</span>
                </div>
              </div>
            </div>

            {/* Live Hover Info */}
            <div className="h-6 flex items-center text-xs font-medium text-text-primary">
              {hoveredCell ? (
                hoveredCell.isSelf ? (
                  <span className="text-text-secondary italic">Identity Match (Self)</span>
                ) : (
                  <span>
                    <span className="text-primary font-semibold">{hoveredCell.row}</span> vs{' '}
                    <span className="text-indigo-600 font-semibold">{hoveredCell.col}</span> :{' '}
                    <span className="font-bold">{hoveredCell.score}% match</span>
                  </span>
                )
              ) : (
                <span className="text-text-secondary flex items-center space-x-1">
                  <HelpCircle size={12} />
                  <span>Hover over intersections for info</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
