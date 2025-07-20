import { defineEventHandler, readBody } from 'h3'
import type { Card } from '~/types'
import cardsData from 'pokemon-tcg-pocket-database/dist/cards.json'
import { drawCardsWithRarity, defaultRarityConfigs } from '~/utils/rarityDraw'

export default defineEventHandler(async (event) => {
  const { packId, useRarity = true } = await readBody(event)

  if (!packId) {
    throw new Error('packId is required')
  }

  const allCards = cardsData as Card[]
  
  if (useRarity) {
    const rarityConfig = defaultRarityConfigs.find(config => config.packId === packId)
    
    if (rarityConfig) {
      const drawnCards = drawCardsWithRarity(allCards, packId, rarityConfig, 5)
      return drawnCards
    }
  }
  
  const cardsInPack = allCards.filter(c => c.packs?.includes(packId))
  if (cardsInPack.length === 0) {
    return []
  }

  const newCards: Card[] = []
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * cardsInPack.length)
    newCards.push(cardsInPack[randomIndex])
  }

  return newCards
})
