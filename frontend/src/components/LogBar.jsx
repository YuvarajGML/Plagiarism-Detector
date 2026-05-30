import React, { useEffect, useRef } from 'react'

export default function LogBar({ logs }) {
  const containerRef = useRef(null)

  // Auto-scroll to bottom on new log entries
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#1E293B] border-t border-slate-700 font-mono text-[10px] text-[#94A3B8] px-6 py-2.5 overflow-y-auto flex flex-col space-y-1 select-text custom-scrollbar z-50">
      <div ref={containerRef} className="h-full overflow-y-auto flex flex-col space-y-0.5 pr-2">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic select-none">
            ► Console idle. Click "Analyze" to run the plagiarism detection pipeline.
          </div>
        ) : (
          logs.map((log, index) => {
            let textColor = 'text-[#94A3B8]'
            if (log.includes('Complete') || log.includes('complete') || log.includes('Done')) {
              textColor = 'text-[#2DD4BF]' // Teal-400
            } else if (log.includes('Match found') || log.includes('plagiarized')) {
              textColor = 'text-[#F87171]' // Red-400
            } else if (log.includes('Warning') || log.includes('suspicious') || log.includes('structural')) {
              textColor = 'text-[#FBBF24]' // Amber-400
            } else if (log.includes('speed') || log.includes('Memory')) {
              textColor = 'text-[#818CF8]' // Indigo-400
            }

            return (
              <div key={index} className={`whitespace-pre-wrap leading-relaxed ${textColor}`}>
                {log}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
