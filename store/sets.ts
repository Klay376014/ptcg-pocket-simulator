import { defineStore } from 'pinia'
import { ref } from 'vue'
import setsData from 'pokemon-tcg-pocket-database/dist/sets.json'

export type Set = {
    code: string
    releaseDate: string
    count?: number
    label: {
        en: string
    };
    packs: string[]
}

export const useSetsStore = defineStore('sets', () => {
  const sets = ref<Set[]>(setsData)
  return { sets }
})