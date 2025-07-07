<template>
  <div class="flex flex-col lg:flex-row p-4 pt-8 gap-8">
    <!-- Left Section: Packs & Mode Switch -->
    <div class="w-full lg:w-1/4 flex flex-col gap-4">
      <div class="flex items-center space-x-2">
        <Switch id="multi-pack-mode" :model-value="isMultiPackMode" @update:model-value="toggleMultiPackMode" />
        <Label html-for="multi-pack-mode">五連抽模式</Label>
      </div>
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
                @click="startDrawing(pack)"
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
      <!-- Card Display Area -->
      <div class="w-full md:w-2/3 flex flex-col items-center justify-center gap-4">
        <div class="relative">
          <PokemonCard 
            v-if="card" 
            :card="card" 
            :pack-id="selectedPackId"
            :is-last-card="isLastCard"
            :is-multi-pack-mid-draw="isMultiPackMidDraw"
            @draw-again="startDrawing(selectedPackId)"
            @click="showNextCard"
          />
          <div v-else class="text-center text-gray-500 h-96 flex items-center justify-center">
            <p>Select a pack to draw cards.</p>
          </div>

          <!-- Loading Overlay -->
          <div v-if="isLoading" class="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div class="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
          </div>
        </div>

        <Button v-if="showNextPackButton" :disabled="isLoading" @click="fetchNextPack">
          Next Pack ({{ currentPackInMultiDraw }}/5)
        </Button>
      </div>

      <!-- Revealed Cards History -->
      <div v-if="revealedCardsThisPack.length > 0" class="w-full md:w-1/3 flex flex-col h-64 md:h-[calc(100vh-10rem)]">
        <h3 class="text-lg font-semibold mb-2 text-center md:text-left flex-shrink-0">本次紀錄</h3>
        <div class="overflow-y-auto scrollbar-hide">
          <!-- Multi-pack mode history -->
          <div v-if="isMultiPackMode">
            <div v-for="(pack, index) in multiPackHistory" :key="`pack-${index}`">
              <h4 class="font-semibold text-sm mt-2 mb-1">第 {{ index + 1 }} 包</h4>
              <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <img
                  v-for="historyCard in pack"
                  :key="historyCard.imageName + '-hist'"
                  :src="`https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/${historyCard.imageName}`"
                  :alt="historyCard.label.eng"
                  class="w-full rounded-md shadow-md object-contain"
                />
              </div>
            </div>
            <div v-if="showCurrentPackInHistory">
              <h4 class="font-semibold text-sm mt-2 mb-1">第 {{ currentPackInMultiDraw }} 包</h4>
              <transition-group 
                tag="div" 
                class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-2 lg:grid-cols-3 gap-2"
                enter-active-class="transition-all duration-500 ease-out"
                enter-from-class="opacity-0 transform translate-y-[30px]"
                :leave-active-class="isLoading ? '' : 'transition-all duration-500 ease-in'"
                :leave-to-class="isLoading ? '' : 'opacity-0 transform translate-y-[30px]'"
              >
                <img
                  v-for="revealedCard in revealedCardsThisPack"
                  :key="revealedCard.imageName"
                  :src="`https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/${revealedCard.imageName}`"
                  :alt="revealedCard.label.eng"
                  class="w-full rounded-md shadow-md object-contain"
                />
              </transition-group>
            </div>
          </div>
          <!-- Single-pack mode history -->
          <transition-group 
            v-else-if="showCurrentPackInHistory"
            tag="div" 
            class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-2 lg:grid-cols-3 gap-2"
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 transform translate-y-[30px]"
            :leave-active-class="isLoading ? '' : 'transition-all duration-500 ease-in'"
            :leave-to-class="isLoading ? '' : 'opacity-0 transform translate-y-[30px]'"
          >
            <img
              v-for="revealedCard in revealedCardsThisPack"
              :key="revealedCard.imageName"
              :src="`https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/${revealedCard.imageName}`"
              :alt="revealedCard.label.eng"
              class="w-full rounded-md shadow-md object-contain"
            />
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card } from '~/types'
import { useSetsStore } from '~/store/sets'
import PokemonCard from '~/components/PokemonCard.vue'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const drawnCards = ref<Card[]>([])
const currentCardIndex = ref(0)
const selectedPackId = ref<string | null>(null)
const setsStore = useSetsStore()
const isLoading = ref(false)

// 5-pack mode state
const isMultiPackMode = ref(false)
const multiPackHistory = ref<Card[][]>([])
const currentPackInMultiDraw = ref(0)

const card = computed(() => {
  if (drawnCards.value.length === 0) return null
  return drawnCards.value[currentCardIndex.value]
})

const revealedCardsThisPack = computed(() => {
  if (drawnCards.value.length === 0) return []
  return drawnCards.value.slice(0, currentCardIndex.value + 1)
})

const isLastCard = computed(() => currentCardIndex.value === drawnCards.value.length - 1 && drawnCards.value.length > 0)

const showNextPackButton = computed(() => {
  return isMultiPackMode.value && isLastCard.value && currentPackInMultiDraw.value < 5
})

const isMultiPackMidDraw = computed(() => {
  return isMultiPackMode.value && currentPackInMultiDraw.value > 0 && currentPackInMultiDraw.value < 5
})

const showCurrentPackInHistory = computed(() => {
  return drawnCards.value.length > 0 && !isLoading.value
})

const filteredSets = computed(() => {
  return setsStore.sets.filter(set => set.code !== 'PROMO-A')
})

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
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
      img.onerror = (e) => reject(new Error(`Failed to load image: ${url}. Error: ${e}`))
    })
  })
  return Promise.all(promises)
}

async function drawSinglePack(packId: string) {
  try {
    const newCards = await $fetch('/api/draw', {
      method: 'POST',
      body: { packId }
    })
    return newCards as Card[]
  } catch (error) {
    console.error('Error fetching cards:', error)
    return []
  }
}

async function fetchCards(packId: string) {
  if (!packId || isLoading.value) return

  isLoading.value = true

  try {
    const newCards = await drawSinglePack(packId)
    if (newCards.length > 0) {
      const imageUrls = newCards.map(c => `https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/${c.imageName}`)
      await preloadImages(imageUrls)
      
      // Update state after loading is complete
      drawnCards.value = newCards
      currentCardIndex.value = 0
    }
  } catch (error) {
    console.error("Failed to preload card images", error)
  } finally {
    isLoading.value = false
  }
}

function startDrawing(packId: string | null) {
  if (!packId) return;
  // Clear all relevant states for a new draw cycle
  drawnCards.value = []
  currentCardIndex.value = 0
  selectedPackId.value = packId

  if (isMultiPackMode.value) {
    multiPackHistory.value = []
    currentPackInMultiDraw.value = 1
  }
  fetchCards(packId)
}

async function fetchNextPack() {
  if (!selectedPackId.value || !isMultiPackMode.value || isLoading.value) return

  multiPackHistory.value.push([...drawnCards.value])

  if (currentPackInMultiDraw.value < 5) {
    currentPackInMultiDraw.value++
    // No need to clear drawnCards.value here, it will be updated by fetchCards
    currentCardIndex.value = 0
    await fetchCards(selectedPackId.value)
  } 
}

function showNextCard() {
  if (currentCardIndex.value < drawnCards.value.length - 1) {
    currentCardIndex.value++
  }
}

function toggleMultiPackMode(checked: boolean) {
  isMultiPackMode.value = checked
  multiPackHistory.value = []
  drawnCards.value = []
  currentCardIndex.value = 0
  currentPackInMultiDraw.value = 0
}

</script>

<style>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

