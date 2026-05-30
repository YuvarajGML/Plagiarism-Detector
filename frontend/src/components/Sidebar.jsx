import React, { useState } from 'react'
import { FileText, UploadCloud, CheckCircle, AlertTriangle, XCircle, Clock, Trash2, PanelLeft, PanelRight } from 'lucide-react'

export default function Sidebar({
  files,
  leftDoc,
  rightDoc,
  onLoadLeft,
  onLoadRight,
  onBatchCompare,
  onUploadSuccess,
  onClearQueue
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0]
      const extension = file.name.split('.').pop().toLowerCase()
      const allowed = ['txt', 'pdf', 'docx', 'py', 'java']
      if (allowed.includes(extension)) {
        const newFile = {
          id: Date.now(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          status: 'pending'
        }
        onUploadSuccess(newFile)
      } else {
        alert('Unsupported file format. Please upload .txt, .pdf, .docx, .py, or .java files.')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        status: 'pending'
      }
      onUploadSuccess(newFile)
    }
  }

  const getStatusPill = (status) => {
    switch (status) {
      case 'clean':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={10} />
            <span>Clean</span>
          </span>
        )
      case 'suspicious':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle size={10} />
            <span>Suspicious</span>
          </span>
        )
      case 'plagiarized':
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle size={10} />
            <span>Flagged</span>
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
            <Clock size={10} />
            <span>Pending</span>
          </span>
        )
    }
  }

  return (
    <aside className="w-1/5 min-w-[260px] max-w-[320px] bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary tracking-wide">Documents</h2>
        {files.length > 0 && (
          <button
            onClick={onClearQueue}
            title="Clear all files from queue"
            className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-red-500 transition-colors duration-150 group"
          >
            <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="p-4">
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-primary bg-primary-light/30 scale-[0.98]'
              : 'border-slate-300 hover:border-primary/60 bg-slate-50 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pb-2 text-center px-4">
            <UploadCloud
              size={24}
              className={`mb-2 transition-colors duration-200 ${isDragOver ? 'text-primary' : 'text-text-secondary'}`}
            />
            <p className="text-[11px] font-medium text-text-primary">
              Drop files or folders here
            </p>
            <p className="text-[9px] text-text-secondary mt-1">
              Supports .txt, .pdf, .docx, .py, .java
            </p>
          </div>
          <input
            type="file"
            accept=".txt,.pdf,.docx,.py,.java"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Legend for L/R panels */}
      <div className="px-4 pb-2 flex items-center space-x-3 text-[9px] text-text-secondary">
        <span className="flex items-center space-x-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-primary" />
          <span>Left panel</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-indigo-500" />
          <span>Right panel</span>
        </span>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          File Queue ({files.length})
        </p>

        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText size={24} className="text-slate-300 mb-2" />
            <p className="text-[11px] text-slate-400">No files in queue.</p>
            <p className="text-[10px] text-slate-300 mt-1">Upload files above to get started.</p>
          </div>
        )}

        {files.map((file) => {
          const isLeft = leftDoc && leftDoc.name === file.name
          const isRight = rightDoc && rightDoc.name === file.name

          return (
            <div
              key={file.id}
              className={`p-3 rounded-lg border transition-all duration-200 select-none relative overflow-hidden group ${
                isLeft
                  ? 'border-primary/50 bg-primary-light/20 shadow-sm ring-1 ring-primary/30'
                  : isRight
                  ? 'border-indigo-200 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-200/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
              }`}
            >
              {/* File Info */}
              <div className="flex items-start space-x-2.5">
                <FileText
                  size={16}
                  className={`mt-0.5 flex-shrink-0 transition-colors ${
                    isLeft ? 'text-primary' : isRight ? 'text-indigo-500' : 'text-text-secondary'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">{file.size}</p>
                </div>
                {/* Panel badges */}
                <div className="flex space-x-1 flex-shrink-0">
                  {isLeft && (
                    <span className="text-[9px] px-1 py-0.5 bg-primary text-white font-bold rounded uppercase leading-none">
                      L
                    </span>
                  )}
                  {isRight && (
                    <span className="text-[9px] px-1 py-0.5 bg-indigo-600 text-white font-bold rounded uppercase leading-none">
                      R
                    </span>
                  )}
                </div>
              </div>

              {/* Status pill + Load buttons */}
              <div className="flex items-center justify-between mt-2.5">
                {getStatusPill(file.status)}

                {/* Load Left / Load Right explicit controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onLoadLeft(file) }}
                    title="Load into Left panel"
                    className={`flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all duration-150 border ${
                      isLeft
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-primary border-primary/40 hover:bg-primary hover:text-white hover:border-primary'
                    }`}
                  >
                    <PanelLeft size={9} />
                    <span>L</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onLoadRight(file) }}
                    title="Load into Right panel"
                    className={`flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all duration-150 border ${
                      isRight
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                    }`}
                  >
                    <PanelRight size={9} />
                    <span>R</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Batch Compare All Trigger */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={onBatchCompare}
          className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-primary hover:text-white border border-primary hover:bg-primary transition-all duration-200 active:scale-95 text-center"
        >
          Batch Compare All
        </button>
      </div>
    </aside>
  )
}
