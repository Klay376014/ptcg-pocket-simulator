
<template>
  <div v-if="card" class="relative cursor-pointer">
    <Card>
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
        >
      </CardContent>
      <CardFooter class="flex flex-col justify-center items-center">
        <p v-if="setInfo" class="mb-2">{{ setInfo.label.en }} - {{ packId }}</p>
        <Button v-if="isLastCard && !isMultiPackMidDraw" class="cursor-pointer" @click.stop="$emit('drawAgain')">
          Draw Again
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card as PokemonCardType } from '~/types'
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
  isLastCard?: boolean
  isMultiPackMidDraw?: boolean
}>()

defineEmits(['drawAgain'])

const setsStore = useSetsStore()
const rarityStore = useRarityStore()

const setInfo = computed(() => {
  if (!props.card) return null
  return setsStore.sets.find(s => s.code === props.card?.set)
})

const rarityInfo = computed(() => {
  if (!props.card) return null
  return rarityStore.rarity[props.card.rarityCode as keyof typeof rarityStore.rarity]
})
</script>


