import React, { useMemo, useState } from 'react'
import { Copy, ExternalLink, Globe2, Link2, Plus, Search, Trash2 } from 'lucide-react'
import { buildSearchQueries } from '../utils/sourceIntel'

export default function InternetSourceView({
  suspectDoc,
  externalSources = [],
  customSources = [],
  onAddSource,
  onClearSources
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [sourceText, setSourceText] = useState('')

  const queries = useMemo(
    () => buildSearchQueries(suspectDoc?.content || ''),
    [suspectDoc]
  )

  const handleAddSource = () => {
    const cleanText = sourceText.trim()
    if (!cleanText) {
      alert('Paste source text before comparing.')
      return
    }

    onAddSource({
      title: title.trim() || 'Imported internet source',
      url: url.trim() || 'manual-source',
      text: cleanText
    })
    setTitle('')
    setUrl('')
    setSourceText('')
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Globe2 size={16} className="text-primary" />
          <div>
            <h2 className="text-sm font-bold text-text-primary">Internet Source Comparison</h2>
            <p className="text-[10px] text-text-secondary">
              Suspect document: {suspectDoc ? suspectDoc.name : 'load a right-side document'}
            </p>
          </div>
        </div>
        {customSources.length > 0 && (
          <button
            onClick={onClearSources}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={11} />
            Clear Imported
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-[minmax(300px,38%)_1fr] overflow-hidden">
        <section className="border-r border-slate-100 p-5 overflow-y-auto custom-scrollbar space-y-5">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Search Queries
            </h3>
            {queries.length === 0 ? (
              <p className="text-xs text-text-secondary italic">Load a suspect document to generate source queries.</p>
            ) : (
              queries.map((item, index) => (
                <div key={item.query} className="border border-slate-100 rounded-lg p-3 bg-slate-50/60">
                  <p className="text-[10px] text-text-primary line-clamp-2">{item.sentence}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Search size={11} />
                      Query {index + 1}
                    </span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(`"${item.query}"`)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:underline"
                    >
                      <Copy size={11} />
                      Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Import Source Text
            </h3>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Source title"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Source URL"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary"
            />
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste text copied from an internet or academic source"
              className="w-full h-40 px-3 py-2 rounded-lg border border-slate-200 text-xs leading-relaxed resize-none focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAddSource}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark active:scale-95 transition-all"
            >
              <Plus size={13} />
              Add and Compare
            </button>
          </div>
        </section>

        <section className="p-5 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Ranked Source Evidence
            </h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-text-secondary border border-slate-200">
              {customSources.length} imported
            </span>
          </div>

          <div className="space-y-3">
            {externalSources.length === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-text-secondary">
                <Globe2 size={36} className="text-slate-300 mb-2" />
                <p className="text-xs font-medium">No internet source evidence yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Open a query, paste source text, then compare.</p>
              </div>
            ) : (
              externalSources.map((source) => (
                <article key={source.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link2 size={13} className="text-primary flex-shrink-0" />
                        <h4 className="text-sm font-bold text-text-primary truncate" title={source.title}>
                          {source.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1 truncate" title={source.url}>
                        {source.type} | {source.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {source.url && source.url !== 'manual-source' && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open exact source"
                          className="p-1.5 rounded-lg border border-slate-200 text-text-secondary hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <span className="text-xs font-bold text-primary bg-primary-light/20 border border-primary/20 rounded-lg px-2 py-1">
                        {source.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <p className="text-[9px] font-bold uppercase text-text-secondary mb-1">Suspect passage</p>
                      <p className="text-[10px] text-slate-700 line-clamp-4">{source.evidence?.suspectSentence}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <p className="text-[9px] font-bold uppercase text-text-secondary mb-1">Source passage</p>
                      <p className="text-[10px] text-slate-700 line-clamp-4">{source.evidence?.sourceSentence}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[10px]">
                    <span className="text-text-secondary">{source.detectionMode}</span>
                    <span className={source.cited ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {source.citationStatus}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
