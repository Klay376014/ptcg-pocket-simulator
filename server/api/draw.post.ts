import { defineEventHandler, readBody } from 'h3'
import type { Card } from '~/types'
import cardsData from 'pokemon-tcg-pocket-database/dist/cards.json'

export default defineEventHandler(async (event) => {
  const { packId } = await readBody(event)

  if (!packId) {
    throw new Error('packId is required')
  }

  const cardsInPack = (cardsData as Card[]).filter(c => c.packs?.includes(packId))
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
