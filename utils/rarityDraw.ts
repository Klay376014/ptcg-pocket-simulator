import type { Card, RarityWeight, PackRarityConfig } from "~/types";

/**
 * 根據權重配置隨機選擇稀有度
 */
export function selectRarityByWeight(rarityWeights: RarityWeight[]): string {
  const totalWeight = rarityWeights.reduce((sum, item) => sum + item.weight, 0);
  const random = Math.random() * totalWeight;

  let currentWeight = 0;
  for (const rarity of rarityWeights) {
    currentWeight += rarity.weight;
    if (random <= currentWeight) {
      return rarity.rarityCode;
    }
  }

  // 備用：如果沒有選中，返回第一個
  return rarityWeights[0]?.rarityCode || "C";
}

/**
 * 根據稀有度從卡片池中隨機選擇一張卡片
 * 特殊處理：當targetRarity為'SARSR'時，從SAR和SR卡片中隨機選擇
 */
export function selectCardByRarity(
  cards: Card[],
  targetRarity: string,
): Card | null {
  let cardsOfRarity: Card[];
  
  // 特殊處理：SAR+SR合併
  if (targetRarity === 'SARSR') {
    cardsOfRarity = cards.filter(
      (card) => card.rarityCode === 'SAR' || card.rarityCode === 'SR',
    );
  } else {
    cardsOfRarity = cards.filter(
      (card) => card.rarityCode === targetRarity,
    );
  }

  if (cardsOfRarity.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * cardsOfRarity.length);
  return cardsOfRarity[randomIndex];
}

/**
 * 根據卡片位置選擇對應的稀有度權重配置
 */
function getRarityWeightsForPosition(
  rarityConfig: PackRarityConfig,
  cardPosition: number,
): RarityWeight[] {
  // 卡片位置從0開始計算
  if (cardPosition === 3) {
    // 第4張卡使用特殊權重
    return rarityConfig.fourthCardWeights;
  } else if (cardPosition === 4) {
    // 第5張卡使用保底權重
    return rarityConfig.fifthCardWeights;
  } else {
    // 第1-3張卡使用正常權重
    return rarityConfig.normalRarityWeights;
  }
}

/**
 * 使用稀有度系統抽取多張卡片 - 支援不同位置使用不同機率
 */
export function drawCardsWithRarity(
  allCards: Card[],
  packId: string,
  rarityConfig: PackRarityConfig,
  count: number = 5,
): Card[] {
  // 篩選出該卡包的所有卡片
  const cardsInPack = allCards.filter((card) => card.packs?.includes(packId));

  if (cardsInPack.length === 0) {
    return [];
  }

  const drawnCards: Card[] = [];

  for (let i = 0; i < count; i++) {
    // 根據卡片位置選擇對應的稀有度權重
    const rarityWeights = getRarityWeightsForPosition(rarityConfig, i);

    // 第一階段：根據位置權重選擇稀有度
    const selectedRarity = selectRarityByWeight(rarityWeights);

    // 第二階段：從該稀有度中隨機選擇一張卡片
    const selectedCard = selectCardByRarity(cardsInPack, selectedRarity);

    if (selectedCard) {
      drawnCards.push(selectedCard);
    } else {
      // 如果該稀有度沒有卡片，隨機選一張作為備用
      const randomIndex = Math.floor(Math.random() * cardsInPack.length);
      drawnCards.push(cardsInPack[randomIndex]);
    }
  }

  return drawnCards;
}

/**
 * 默認稀有度配置示例（可以作為模板）
 */
export const defaultRarityConfigs: PackRarityConfig[] = [
  {
    packId: "Charizard",
    normalRarityWeights: [{ rarityCode: "C", weight: 100 }],
    fourthCardWeights: [
      { rarityCode: "U", weight: 90 },
      { rarityCode: "R", weight: 5 },
      { rarityCode: "RR", weight: 1.666 },
      { rarityCode: "AR", weight: 2.572 },
      { rarityCode: "SARSR", weight: 0.5 },
      { rarityCode: "IM", weight: 0.222 },
      { rarityCode: "UR", weight: 0.04 },
    ],
    fifthCardWeights: [
      { rarityCode: "U", weight: 60 },
      { rarityCode: "R", weight: 20 },
      { rarityCode: "RR", weight: 6.664 },
      { rarityCode: "AR", weight: 10.288 },
      { rarityCode: "SARSR", weight: 2 },
      { rarityCode: "IM", weight: 0.888 },
      { rarityCode: "UR", weight: 0.160 },
    ],
  },
  {
    packId: "Pikachu",
    normalRarityWeights: [{ rarityCode: "C", weight: 100 }],
    fourthCardWeights: [
      { rarityCode: "U", weight: 90 },
      { rarityCode: "R", weight: 5 },
      { rarityCode: "RR", weight: 1.666 },
      { rarityCode: "AR", weight: 2.572 },
      { rarityCode: "SARSR", weight: 0.5 },
      { rarityCode: "IM", weight: 0.222 },
      { rarityCode: "UR", weight: 0.04 },
    ],
    fifthCardWeights: [
      { rarityCode: "U", weight: 60 },
      { rarityCode: "R", weight: 20 },
      { rarityCode: "RR", weight: 6.664 },
      { rarityCode: "AR", weight: 10.288 },
      { rarityCode: "SARSR", weight: 2 },
      { rarityCode: "IM", weight: 0.888 },
      { rarityCode: "UR", weight: 0.160 },
    ],
  },
  {
    packId: "Mewtwo",
    normalRarityWeights: [{ rarityCode: "C", weight: 100 }],
    fourthCardWeights: [
      { rarityCode: "U", weight: 90 },
      { rarityCode: "R", weight: 5 },
      { rarityCode: "RR", weight: 1.666 },
      { rarityCode: "AR", weight: 2.572 },
      { rarityCode: "SARSR", weight: 0.5 },
      { rarityCode: "IM", weight: 0.222 },
      { rarityCode: "UR", weight: 0.04 },
    ],
    fifthCardWeights: [
      { rarityCode: "U", weight: 60 },
      { rarityCode: "R", weight: 20 },
      { rarityCode: "RR", weight: 6.664 },
      { rarityCode: "AR", weight: 10.288 },
      { rarityCode: "SARSR", weight: 2 },
      { rarityCode: "IM", weight: 0.888 },
      { rarityCode: "UR", weight: 0.160 },
    ],
  },
];
