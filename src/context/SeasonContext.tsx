import React, { createContext, useContext, useState } from 'react'
import type { Season } from '@/utils/constants'

interface SeasonContextType {
  activeSeason: Season | null
  setActiveSeason: (season: Season | null) => void
  toggleSeason: (season: Season) => void
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined)

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [activeSeason, setActiveSeason] = useState<Season | null>('spring')

  const toggleSeason = (season: Season) => {
    setActiveSeason((prev) => (prev === season ? null : season))
  }

  return (
    <SeasonContext.Provider value={{ activeSeason, setActiveSeason, toggleSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const context = useContext(SeasonContext)
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider')
  }
  return context
}
