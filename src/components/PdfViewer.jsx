import React, { useState } from 'react'
import { I } from './Icons.jsx'
import { Spinner, EmptyState } from './ui.jsx'
import { downloadFile } from '../lib/utils.js'
import { useStore } from '../lib/store.jsx'

export default function PdfViewer({ url, fileName, title }) {
  const [state, setState] = useState('loading')
  const { toast } = useStore()

  if (!url) {
    return (
      <EmptyState
        icon={I.file}
        title="Paper PDF not available yet"
        hint="The record exists but the PDF file has not been uploaded. An admin can attach it from the admin panel."
      />
    )
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="flex items-center gap-2"><I.file size={16} className="text-blue-500" /> {title || fileName}</span>
        </p>
        <button
          className="btn-primary !px-3.5 !py-2 text-xs"
          onClick={async () => {
            try {
              await downloadFile(url, fileName)
              toast('Download started')
            } catch {
              toast('Download failed — please try again', 'error')
            }
          }}
        >
          <I.download size={15} /> Download PDF
        </button>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
        {state === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 py-40 text-slate-500">
            <Spinner size={28} className="text-blue-600" />
            <p className="text-sm font-medium">Loading PDF…</p>
          </div>
        )}
        <iframe
          src={url}
          title={title || fileName || 'Question paper'}
          className="h-[70vh] w-full"
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
        />
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Could not display this PDF. Try the download button instead.</p>
          </div>
        )}
      </div>
    </div>
  )
}
