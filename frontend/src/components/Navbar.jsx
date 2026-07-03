import React from 'react'
import { GitCompare, Globe2, Play, Settings, Layers } from 'lucide-react'

export default function Navbar({
  selectedAlgorithm,
  setSelectedAlgorithm,
  analysisScope,
  setAnalysisScope,
  onAnalyze,
  isAnalyzing,
  onOpenSettings
}) {
  const algorithms = [
    { id: 'naive', label: 'Naive' },
    { id: 'kmp', label: 'KMP' },
    { id: 'horspool', label: 'Horspool' },
    { id: 'compare', label: 'Compare All' }
  ]

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-200 shadow-sm">
      {/* Left branding */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
          <Layers size={18} className="animate-pulse" />
        </div>
        <span className="text-xl font-bold tracking-tight text-text-primary">
          PlagScan <span className="text-primary">Pro</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[
            { id: 'pairwise', label: 'Local', icon: GitCompare },
            { id: 'internet', label: 'Internet', icon: Globe2 }
          ].map((scope) => {
            const Icon = scope.icon
            const isActive = analysisScope === scope.id
            return (
              <button
                key={scope.id}
                onClick={() => setAnalysisScope(scope.id)}
                disabled={isAnalyzing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={13} />
                <span>{scope.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {algorithms.map((algo) => {
            const isActive = selectedAlgorithm === algo.id
            return (
              <button
                key={algo.id}
                onClick={() => setSelectedAlgorithm(algo.id)}
                disabled={isAnalyzing || analysisScope === 'internet'}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                } ${isAnalyzing || analysisScope === 'internet' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {algo.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-dark shadow-sm transition-all duration-200 active:scale-95 ${
            isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              <span>Analyze</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200"
          title="Algorithm Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
