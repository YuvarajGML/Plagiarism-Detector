import React, { useState } from 'react'
import { BookOpen, ExternalLink, Globe2, Languages, Network, ShieldCheck } from 'lucide-react'

const getSourceIcon = (type) => {
  if (type === 'Academic') return BookOpen
  if (type === 'Cross-language') return Languages
  return Globe2
}

export default function SourceIntelPanel({
  externalSources = [],
  corpusStats,
  citationCoverage = [],
  novelFeatures = []
}) {
  const [activeTab, setActiveTab] = useState('sources')

  const uncitedCount = externalSources.filter((source) => !source.cited).length
  const topSources = externalSources.slice(0, 4)

  return (
    <section className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Source Intelligence
          </h3>
          <p className="text-[10px] text-text-secondary mt-1">
            Web, academic, corpus, citation, and cross-language evidence.
          </p>
        </div>
        <span className="text-[9px] px-2 py-1 rounded-full bg-primary-light/30 text-primary font-bold border border-primary/20 whitespace-nowrap">
          Beyond Pairwise
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[9px] uppercase text-text-secondary font-semibold">
            <Network size={10} />
            Corpus
          </div>
          <p className="text-sm font-bold text-text-primary mt-1">
            {corpusStats?.documentCount || 0} docs
          </p>
          <p className="text-[9px] text-text-secondary">
            {corpusStats?.shingleCount || 0} shingles
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[9px] uppercase text-text-secondary font-semibold">
            <Globe2 size={10} />
            Sources
          </div>
          <p className="text-sm font-bold text-text-primary mt-1">{externalSources.length}</p>
          <p className="text-[9px] text-text-secondary">ranked hits</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[9px] uppercase text-text-secondary font-semibold">
            <ShieldCheck size={10} />
            Cites
          </div>
          <p className="text-sm font-bold text-text-primary mt-1">{uncitedCount}</p>
          <p className="text-[9px] text-text-secondary">uncited hits</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
        {[
          ['sources', 'Sources'],
          ['citations', 'Citations'],
          ['novelty', 'Novelty']
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeTab === id ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'sources' && (
        <div className="space-y-2">
          {topSources.length === 0 ? (
            <p className="text-xs text-text-secondary italic text-center py-3">
              No external source candidates for the loaded suspect document.
            </p>
          ) : (
            topSources.map((source) => {
              const Icon = getSourceIcon(source.type)
              return (
                <div key={source.id} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/60">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className="text-primary flex-shrink-0" />
                      {source.url && source.url !== 'manual-source' ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-text-primary truncate hover:text-primary hover:underline"
                          title={source.title}
                        >
                          {source.title}
                        </a>
                      ) : (
                        <p className="text-[11px] font-bold text-text-primary truncate" title={source.title}>
                          {source.title}
                        </p>
                      )}
                    </div>
                      <p className="text-[9px] text-text-secondary mt-0.5 truncate" title={source.url}>
                        {source.type} | {source.author} | {source.published}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {source.url && source.url !== 'manual-source' && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open exact source"
                          className="text-text-secondary hover:text-primary"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <span className="text-[10px] font-bold text-primary bg-white border border-primary/20 rounded px-1.5 py-0.5">
                        {source.confidence}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-2 line-clamp-2">
                    {source.evidence?.sourceSentence || 'No evidence sentence available.'}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-[9px] text-text-secondary">
                    <span>{source.detectionMode}</span>
                    <span className={source.cited ? 'text-green-700' : 'text-red-600'}>
                      {source.citationStatus}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'citations' && (
        <div className="space-y-2">
          {citationCoverage.map((item) => (
            <div key={item.sourceId} className="flex items-center justify-between gap-2 text-[10px] border border-slate-100 rounded-lg p-2 bg-slate-50/60">
              <span className="font-medium text-text-primary truncate">{item.title}</span>
              <span className={item.cited ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'novelty' && (
        <div className="space-y-2">
          {novelFeatures.map((feature) => (
            <div key={feature.name} className="border border-slate-100 rounded-lg p-2 bg-slate-50/60">
              <p className="text-[10px] font-bold text-text-primary">{feature.name}</p>
              <p className="text-[9px] text-text-secondary mt-0.5">{feature.novelty}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
