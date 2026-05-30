import React, { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, Terminal, X } from 'lucide-react'

export default function LogBar({ logs, isAnalyzing, processedCount, totalCount }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const containerRef = useRef(null)

  // Auto-scroll to bottom on new log entries (only when expanded)
  useEffect(() => {
    if (!isCollapsed && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, isCollapsed])

  // Derive latest status line for the ticker
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null
  const statusText = isAnalyzing
    ? `Running… ${processedCount ?? 0}/${totalCount ?? 0} steps`
    : latestLog
    ? latestLog.replace(/^[►\s]+/, '').slice(0, 72) + (latestLog.length > 72 ? '…' : '')
    : 'Console idle — click Analyze to start'

  // Color coding for status
  const getLogColor = (log) => {
    if (!log) return 'text-slate-400'
    if (log.includes('Complete') || log.includes('complete') || log.includes('Done')) return 'text-teal-400'
    if (log.includes('Match found') || log.includes('plagiarized')) return 'text-red-400'
    if (log.includes('Warning') || log.includes('suspicious') || log.includes('structural')) return 'text-amber-400'
    if (log.includes('speed') || log.includes('Memory')) return 'text-indigo-400'
    return 'text-slate-400'
  }

  const tickerColor = getLogColor(latestLog)

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-slate-700 z-50 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'h-8' : 'h-[120px]'
      }`}
    >
      {/* Header / Ticker Bar — always visible */}
      <div
        className="flex items-center justify-between px-4 h-8 flex-shrink-0 cursor-pointer select-none border-b border-slate-800"
        onClick={() => setIsCollapsed((v) => !v)}
      >
        <div className="flex items-center space-x-2 min-w-0 overflow-hidden">
          <Terminal size={12} className="text-slate-500 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex-shrink-0 mr-1">
            Console
          </span>
          {/* Status ticker */}
          <span className={`text-[10px] font-mono truncate ${tickerColor}`}>
            {statusText}
          </span>
          {isAnalyzing && (
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse ml-1" />
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          {logs.length > 0 && (
            <span className="text-[9px] text-slate-600 font-mono">
              {logs.length} lines
            </span>
          )}
          <button
            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded"
            title={isCollapsed ? 'Expand console' : 'Collapse console'}
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(v => !v) }}
          >
            {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Scrollable log content — hidden when collapsed */}
      {!isCollapsed && (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-2 font-mono text-[10px] text-slate-400 space-y-0.5 custom-scrollbar"
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 italic select-none pt-1">
              ► Console idle. Click &quot;Analyze&quot; to run the plagiarism detection pipeline.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`whitespace-pre-wrap leading-relaxed ${getLogColor(log)}`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
