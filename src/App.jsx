import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { ErrorBoundary } from './components/ui.jsx'
import { useStore } from './lib/store.jsx'
import { detectSource } from './lib/db.js'

import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import SubjectPage from './pages/SubjectPage.jsx'
import Papers from './pages/Papers.jsx'
import PaperView from './pages/PaperView.jsx'
import ImportantQuestions from './pages/ImportantQuestions.jsx'
import Resources from './pages/Resources.jsx'
import ResourceView from './pages/ResourceView.jsx'
import Dashboard from './pages/Dashboard.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import SearchPage from './pages/SearchPage.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const { setDataSource } = useStore()

  // Detect data source (Supabase tables vs demo mode) on boot.
  useEffect(() => {
    detectSource().then(setDataSource)
  }, [setDataSource])

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Browse />} />
          <Route path="/subject/:id" element={<SubjectPage />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/papers/:id" element={<PaperView />} />
          <Route path="/important-questions" element={<ImportantQuestions />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resource/:id" element={<ResourceView />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
