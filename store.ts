import { useSyncExternalStore } from 'react'

const EVENT = 'store-change'
const PREFIX = 'qzw_'

const cache = new Map<string, unknown>()

export function load<T>(key: string, def: T): T {
  if (cache.has(key)) return cache.get(key) as T
  try {
    const raw = localStorage.getItem(PREFIX + key)
    const val = raw ? (JSON.parse(raw) as T) : def
    cache.set(key, val)
    return val
  } catch {
    return def
  }
}

export function save(key: string, value: unknown) {
  cache.set(key, value)
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
  window.dispatchEvent(new Event(EVENT))
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

/** 跨组件同步的 localStorage 状态 */
export function useStore<T>(key: string, def: T): [T, (v: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => load<T>(key, def),
    () => def,
  )
  const set = (v: T) => save(key, v)
  return [value, set]
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

/** 本地时区日期，避免 UTC 偏移导致日期差一天 */
export const toLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const today = () => toLocalDate(new Date())

export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)
}
