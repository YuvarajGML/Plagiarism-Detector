import React, { useState } from 'react'
import { FileText, UploadCloud, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'

export default function Sidebar({
  files,
  leftDoc,
  rightDoc,
  onFileSelect,
  onBatchCompare,
  onUploadSuccess
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
    
    // Simulate reading files
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0]
      const extension = file.name.split('.').pop().toLowerCase()
      const allowed = ['txt', 'pdf', 'docx', 'py', 'java']
      
      if (allowed.includes(extension)) {
        // Add file simulation
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
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-text-primary tracking-wide">Documents</h2>
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

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          File Queue ({files.length})
        </p>

        {files.map((file) => {
          const isLeft = leftDoc && leftDoc.name === file.name
          const isRight = rightDoc && rightDoc.name === file.name
          
          return (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none relative overflow-hidden group ${
                isLeft
                  ? 'border-primary/50 bg-primary-light/20 shadow-sm ring-1 ring-primary/30'
                  : isRight
                  ? 'border-indigo-200 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-200/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
              }`}
            >
              <div className="flex items-start space-x-2.5">
                <FileText
                  size={16}
                  className={`mt-0.5 transition-colors ${
                    isLeft ? 'text-primary' : isRight ? 'text-indigo-500' : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">{file.size}</p>
                </div>
              </div>

              {/* Badges & Pills */}
              <div className="flex items-center justify-between mt-2.5">
                {getStatusPill(file.status)}
                
                {/* Column Indicators */}
                <div className="flex space-x-1">
                  {isLeft && (
                    <span className="text-[9px] px-1 bg-primary text-white font-semibold rounded uppercase">
                      L
                    </span>
                  )}
                  {isRight && (
                    <span className="text-[9px] px-1 bg-indigo-600 text-white font-semibold rounded uppercase">
                      R
                    </span>
                  )}
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
