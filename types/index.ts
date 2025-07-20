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

export type RarityWeight = {
    rarityCode: string
    weight: number // 權重 (如 50 = 50%)
}

export type PackRarityConfig = {
    packId: string
    normalRarityWeights: RarityWeight[]
    fourthCardWeights: RarityWeight[]
    fifthCardWeights: RarityWeight[]
}
