import React, { useEffect, useRef } from 'react'

export default function MatchTooltip({ match, position, onClose }) {
  const tooltipRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getTypeColor = (type) => {
    switch(type) {
      case 'exact':
        return 'bg-red-100 text-red-800'
      case 'near':
        return 'bg-orange-100 text-orange-800'
      case 'structural':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
      className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-sm"
    >
      <div className="mb-3">
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(match.type)}`}>
          {match.type.charAt(0).toUpperCase() + match.type.slice(1)} Match
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-700">
        <div>
          <p className="font-semibold text-slate-900">{match.similarity}% Similarity</p>
        </div>

        <div>
          <p className="text-slate-600">Distance: {match.distance}</p>
        </div>

        <div>
          <p className="text-slate-600">Algorithm: {match.algorithm}</p>
        </div>

        <div>
          <p className="text-slate-600">
            Location: Line {match.plagiarizedLine}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <p className="font-medium text-slate-900 mb-1">Match Preview:</p>
          <p className="text-slate-700 italic">{match.original.substring(0, 100)}...</p>
        </div>
      </div>
    </div>
  )
}
