import { useState, useEffect } from 'react'
import type { Rarity } from './constants'

export interface SpinRecord {
  prizeId: number
  label: string
  icon: string
  rarity: Rarity
  timestamp: number
}

const STORAGE_KEY = 'roulette_history'
const MAX_HISTORY = 5

function loadHistory(): SpinRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function useSpinHistory() {
  const [history, setHistory] = useState<SpinRecord[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const addSpin = (prize: { id: number; label: string; icon: string; rarity: Rarity }) => {
    const record: SpinRecord = {
      prizeId: prize.id,
      label: prize.label,
      icon: prize.icon,
      rarity: prize.rarity,
      timestamp: Date.now(),
    }
    const updated = [record, ...history].slice(0, MAX_HISTORY)
    setHistory(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  return { history, addSpin }
}

// Streak counter
const STREAK_KEY = 'roulette_streak'

interface StreakData {
  lastDate: string // YYYY-MM-DD
  count: number
}

export function useStreak() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const data = localStorage.getItem(STREAK_KEY)
      const today = new Date().toISOString().split('T')[0]

      if (!data) {
        localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: 1 }))
        setStreak(1)
        return
      }

      const parsed: StreakData = JSON.parse(data)
      if (parsed.lastDate === today) {
        setStreak(parsed.count)
        return
      }

      // Check if yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (parsed.lastDate === yesterdayStr) {
        const newCount = parsed.count + 1
        localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: newCount }))
        setStreak(newCount)
      } else {
        // Streak broken
        localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: 1 }))
        setStreak(1)
      }
    } catch {
      setStreak(1)
    }
  }, [])

  return streak
}
