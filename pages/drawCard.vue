<template>
  <div class="flex flex-col lg:flex-row p-4 pt-8 gap-8">
    <!-- Left Section: Packs -->
    <div class="w-full lg:w-1/4">
      <Accordion type="single" collapsible class="w-full">
        <AccordionItem v-for="(set) in filteredSets" :key="set.code" :value="set.code">
          <AccordionTrigger>{{ set.label.en }}</AccordionTrigger>
          <AccordionContent>
            <div class="flex flex-wrap justify-center md:justify-start gap-2">
              <Button
                v-for="(pack, packIndex) in set.packs"
                :key="pack"
                :disabled="isLoading"
                :class="buttonColor(packIndex)"
                class="cursor-pointer"
                @click="fetchRandomCards(pack)"
              >
                {{ pack }}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <!-- Main Content Section: Card Display and History -->
    <div class="w-full lg:w-3/4 flex flex-col md:flex-row items-start gap-4">
      <!-- Card Display Area (Top on mobile, Left on desktop) -->
      <div class="w-full md:w-2/3 flex flex-col items-center justify-center">
        <div v-if="isLoading" class="text-center h-96 flex items-center justify-center">
          <div class="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
          <p class="mt-2 sr-only">Loading cards...</p>
        </div>
        <PokemonCard 
          v-else-if="card" 
          :card="card" 
          :pack-id="selectedPackId"
          :is-last-card="isLastCard"
          @draw-again="fetchRandomCards(selectedPackId)"
          @click="showNextCard"
        />
        <div v-else class="text-center text-gray-500 h-96 flex items-center justify-center">
          <p>Select a pack to draw 5 random cards.</p>
        </div>
      </div>

      <!-- Revealed Cards History (Bottom on mobile, Right on desktop) -->
      <div v-if="revealedCards.length > 0" class="w-full md:w-1/3">
        <h3 class="text-lg font-semibold mb-2 text-center md:text-left">本次紀錄</h3>
        <transition-group 
          name="list" 
          tag="div" 
          class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          <img
            v-for="revealedCard in revealedCards"
            :key="revealedCard.number"
            :src="`https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/${revealedCard.imageName}`"
            :alt="revealedCard.label.eng"
            class="w-full rounded-md shadow-md object-contain"
          >
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCardsStore, type Card } from '~/store/cards'
import { useSetsStore } from '~/store/sets'
import PokemonCard from '~/components/PokemonCard.vue'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const drawnCards = ref<Card[]>([])
const currentCardIndex = ref(0)
const selectedPackId = ref<string | null>(null)
const cardsStore = useCardsStore()
const setsStore = useSetsStore()
const isLoading = ref(false)

const card = computed(() => {
  if (drawnCards.value.length === 0) return null
  return drawnCards.value[currentCardIndex.value]
})

const revealedCards = computed(() => {
  if (drawnCards.value.length === 0) return []
  // Return cards from the beginning up to and including the current index
  return drawnCards.value.slice(0, currentCardIndex.value + 1)
})

const isLastCard = computed(() => currentCardIndex.value === drawnCards.value.length - 1 && drawnCards.value.length > 0)

const filteredSets = computed(() => {
  return setsStore.sets.filter(set => set.code !== 'PROMO-A')
})

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
]

function buttonColor(index: number) {
  return `${colors[index % colors.length]} text-white`;
}

function preloadImages(urls: string[]): Promise<Array<void>> {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    })
  })
  return Promise.all(promises)
}

async function fetchRandomCards(packId: string | null) {
  if (!packId || isLoading.value) return

  isLoading.value = true
  drawnCards.value = []
  currentCardIndex.value = 0
  selectedPackId.value = packId
  
  const cardsInPack = cardsStore.cards.filter(c => c.packs?.includes(packId))
  if (cardsInPack.length > 0) {
    const newCards: Card[] = []
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * cardsInPack.length)
      newCards.push(cardsInPack[randomIndex])
    }
    
    const imageUrls = newCards.map(c => `https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/${c.imageName}`)
    
    try {
      await preloadImages(imageUrls)
      drawnCards.value = newCards
    } catch (error) {
      console.error("Failed to preload card images", error)
    } finally {
      isLoading.value = false
    }
  } else {
    isLoading.value = false
  }
}

function showNextCard() {
  if (currentCardIndex.value < drawnCards.value.length - 1) {
    currentCardIndex.value++
  }
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
