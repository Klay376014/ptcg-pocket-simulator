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
