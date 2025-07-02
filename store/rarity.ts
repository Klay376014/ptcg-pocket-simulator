import { defineStore } from 'pinia'
import { ref } from 'vue'
import rarityData from 'pokemon-tcg-pocket-database/dist/rarity.json'

export const useRarityStore = defineStore('rarity', () => {
  const rarity = ref(rarityData)
  return { rarity }
})