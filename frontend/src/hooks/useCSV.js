import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export function useCSV(path, { filter } = {}) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!path) return
    setLoading(true)
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data: rows }) => {
        setData(filter ? rows.filter(filter) : rows)
        setLoading(false)
      },
      error: (err) => { setError(err); setLoading(false) },
    })
  }, [path])

  return { data, loading, error }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const last  = (arr) => arr[arr.length - 1]
export const byLoc = (arr, loc) => arr.filter(r => r.localidad === loc)

export const fmt = (n, decimals = 0) => {
  if (n == null || isNaN(n)) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(decimals)}K`
  return n.toFixed(decimals)
}
