<template>
  <div class="flex flex-col md:flex-row p-4 pt-8 gap-4">
    <!-- Left/Top Section: Packs -->
    <div class="w-full md:w-1/3 lg:w-1/4">
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
                @click="fetchRandomCard(pack)"
              >
                {{ pack }}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <!-- Right/Bottom Section: Card Display -->
    <div class="w-full md:w-2/3 lg:w-3/4 flex items-center justify-center">
      <PokemonCard 
        v-if="card" 
        :card="card" 
        :pack-id="selectedPackId" 
        @update:is-loading="updateIsLoading"
        @draw-again="fetchRandomCard(selectedPackId)"
      />
      <div v-else class="text-center text-gray-500">
        Select a pack to draw a random card.
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

const card = ref<Card | null>(null)
const selectedPackId = ref<string | null>(null)
const cardsStore = useCardsStore()
const setsStore = useSetsStore()
const isLoading = ref(false)

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

function fetchRandomCard(packId: string | null) {
  if (!packId) return
  selectedPackId.value = packId
  const cardsInPack = cardsStore.cards.filter(c => c.packs?.includes(packId))
  if (cardsInPack.length > 0) {
    const randomIndex = Math.floor(Math.random() * cardsInPack.length)
    card.value = cardsInPack[randomIndex]
  }
}

function updateIsLoading(loading: boolean) {
  isLoading.value = loading
}
</script>
