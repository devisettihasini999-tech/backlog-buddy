import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const StoreCtx = createContext(null)
const LS_KEY = 'bb_store_v1'

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return { defaults: {}, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return {}
}

export function StoreProvider({ children }) {
  const [store, setStore] = useState(loadStore)
  const [toasts, setToasts] = useState([])

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store))
    } catch {
      /* storage full or unavailable */
    }
  }, [store])

  // theme
  useEffect(() => {
    const saved = store.theme || 'light'
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [store.theme])

  const set = useCallback((key, value) => {
    setStore((s) => ({ ...s, [key]: value }))
  }, [])

  const toggleInList = useCallback((key, id) => {
    setStore((s) => {
      const list = s[key] || []
      return { ...s, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] }
    })
  }, [])

  const addRecent = useCallback((type, id) => {
    setStore((s) => {
      const list = (s.recent || []).filter((r) => !(r.type === type && r.id === id))
      return { ...s, recent: [{ type, id, at: new Date().toISOString() }, ...list].slice(0, 12) }
    })
  }, [])

  const toast = useCallback((msg, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const value = useMemo(
    () => ({
      // data source
      dataSource: store.dataSource || 'demo',
      setDataSource: (v) => set('dataSource', v),
      // preferences
      theme: store.theme || 'light',
      toggleTheme: () => set('theme', store.theme === 'dark' ? 'light' : 'dark'),
      // student data
      favorites: store.favorites || [],
      toggleFavorite: (id) => toggleInList('favorites', id),
      bookmarks: store.bookmarks || [],
      toggleBookmark: (id) => toggleInList('bookmarks', id),
      savedPapers: store.savedPapers || [],
      toggleSavedPaper: (id) => toggleInList('savedPapers', id),
      completed: store.completed || [],
      toggleCompleted: (id) => toggleInList('completed', id),
      recent: store.recent || [],
      addRecent,
      checklist: store.checklist || [],
      addChecklistItem: (text) =>
        setStore((s) => ({ ...s, checklist: [...(s.checklist || []), { id: Math.random().toString(36).slice(2), text, done: false }] })),
      toggleChecklistItem: (id) =>
        setStore((s) => ({ ...s, checklist: (s.checklist || []).map((c) => (c.id === id ? { ...c, done: !c.done } : c)) })),
      removeChecklistItem: (id) => setStore((s) => ({ ...s, checklist: (s.checklist || []).filter((c) => c.id !== id) })),
      // toasts
      toasts,
      toast,
    }),
    [store, toasts, set, toggleInList, addRecent, toast]
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
