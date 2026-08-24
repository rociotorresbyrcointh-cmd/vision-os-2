'use client'

import { createContext, useContext } from 'react'
import { vocab, type Vocab } from '@/lib/vocab'

const VocabContext = createContext<Vocab>(vocab(false))

export function VocabProvider({ clinical, children }: { clinical: boolean; children: React.ReactNode }) {
  return <VocabContext.Provider value={vocab(clinical)}>{children}</VocabContext.Provider>
}

export function useVocab(): Vocab {
  return useContext(VocabContext)
}
