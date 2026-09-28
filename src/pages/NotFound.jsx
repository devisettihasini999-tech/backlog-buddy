import React from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui.jsx'
import { I } from '../components/Icons.jsx'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        icon={I.alert}
        title="404 — this page cleared itself"
        hint="The page you're looking for doesn't exist. Maybe it was removed, or the link is wrong."
        action={
          <div className="flex gap-2">
            <Link to="/" className="btn-primary">Go home</Link>
            <Link to="/subjects" className="btn-outline">Browse subjects</Link>
          </div>
        }
      />
    </div>
  )
}
