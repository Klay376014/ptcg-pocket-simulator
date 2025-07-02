
<template>
  <div v-if="card" class="relative">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
      <div class="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
    </div>
    <Card :class="{ 'invisible': isLoading }">
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle>{{ card.label.eng }}</CardTitle>
          <span v-if="rarityInfo" class="px-2 py-1 text-xs font-semibold text-white rounded-full">
            {{ card.rarity }}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <img 
          :src="'https://raw.githubusercontent.com/flibustier/pokemon-tcg-exchange/refs/heads/main/public/images/cards/' + card.imageName"
          :alt="card.label.slug"
          class="rounded-md"
          @load="onImageLoad"
        >
      </CardContent>
      <CardFooter class="flex flex-col justify-center items-center">
        <p v-if="setInfo" class="mb-2">{{ setInfo.label.en }} - {{ packId }}</p>
        <Button :disabled="isLoading" class="cursor-pointer" @click="$emit('drawAgain')">
          Draw Again
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Card as PokemonCardType } from '~/store/cards'
import { useSetsStore } from '~/store/sets'
import { useRarityStore } from '~/store/rarity'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const props = defineProps<{
  card?: PokemonCardType
  packId?: string | null
}>()

const emit = defineEmits(['update:isLoading', 'drawAgain'])

const setsStore = useSetsStore()
const rarityStore = useRarityStore()
const isLoading = ref(false)

const setInfo = computed(() => {
  if (!props.card) return null
  return setsStore.sets.find(s => s.code === props.card?.set)
})

const rarityInfo = computed(() => {
  if (!props.card) return null
  return rarityStore.rarity[props.card.rarityCode as keyof typeof rarityStore.rarity]
})

watch(() => props.card, () => {
  if (props.card) {
    isLoading.value = true
    emit('update:isLoading', true)
  }
}, { immediate: true })

function onImageLoad() {
  isLoading.value = false
  emit('update:isLoading', false)
}
</script>


