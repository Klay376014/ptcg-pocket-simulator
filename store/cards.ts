import { defineStore } from 'pinia'
import { ref } from 'vue'
import cardsData from 'pokemon-tcg-pocket-database/dist/cards.json'

export type Card = {
    set: string
    number: number
    rarity: string
    rarityCode: string
    imageName: string
    label: {
        slug: string
        eng: string
    }
    packs?: string[]
}

export const useCardsStore = defineStore('cards', () => {
  const cards = ref<Card[]>(cardsData)
  return { cards }
})