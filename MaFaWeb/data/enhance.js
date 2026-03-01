/**
 * 装备强化系统配置
 * 强化等级、成功率、费用、属性提升等配置
 */

// 常量定义
const MAX_ENHANCE_COST = 999999999
const ENHANCE_COLORS = {
  legendary: '#FF1493', // 15+ 粉红
  epic: '#FFD700',      // 13+ 金色
  rare: '#FF4500',      // 10+ 橙红
  superior: '#9400D3',  // 7+ 紫色
  good: '#4169E1',      // 4+ 蓝色
  normal: '#32CD32'     // 1+ 绿色
}

// 强化等级配置
const ENHANCE_CONFIG = {
  maxLevel: 15,

  // 各等级成功率 (%)
  successRate: {
    1: 100, 2: 95, 3: 90, 4: 85, 5: 80,
    6: 75, 7: 70, 8: 65, 9: 60, 10: 55,
    11: 50, 12: 45, 13: 40, 14: 35, 15: 30
  },

  // 属性提升比例 (每级提升 %)
  statBonus: {
    1: 0.05, 2: 0.10, 3: 0.15, 4: 0.20, 5: 0.25,
    6: 0.32, 7: 0.39, 8: 0.46, 9: 0.54, 10: 0.62,
    11: 0.70, 12: 0.79, 13: 0.88, 14: 0.98, 15: 1.10
  },

  // 失败处理配置
  failure: {
    // 1-5级: 无惩罚
    6: { type: 'degrade', level: 5 },   // 6级失败降级到5
    7: { type: 'degrade', level: 5 },
    8: { type: 'degrade', level: 5 },
    9: { type: 'degrade', level: 8 },   // 9级失败降级到8
    10: { type: 'degrade', level: 8 },
    11: { type: 'degrade', level: 8 },
    12: { type: 'degrade', level: 11 }, // 12级失败降级到11
    13: { type: 'degrade', level: 11 },
    14: { type: 'degrade', level: 11 },
    15: { type: 'degrade', level: 11 }
  }
}

// 独立函数：计算强化费用（添加上限保护）
function calculateEnhanceCost(basePrice, targetLevel) {
  const cost = Math.floor((basePrice || 100) * 0.2 * Math.pow(1.5, targetLevel))
  return Math.min(cost, MAX_ENHANCE_COST)
}

// 独立函数：获取失败配置
function getFailureConfig(level) {
  return ENHANCE_CONFIG.failure[level] || { type: 'none' }
}

// 独立函数：获取成功率
function getSuccessRate(level) {
  return ENHANCE_CONFIG.successRate[level] || 30
}

// 独立函数：获取属性加成比例
function getStatBonus(level) {
  return ENHANCE_CONFIG.statBonus[level] || 0
}

// 强化材料配置
const ENHANCE_MATERIALS = {
  // 基础强化石（可选，提供成功率加成）
  enhance_stone_normal: {
    id: 'enhance_stone_normal',
    name: '强化石',
    bonus: 0,
    price: 100,
    currency: 'gold',
    description: '基础强化材料'
  },
  enhance_stone_lucky: {
    id: 'enhance_stone_lucky',
    name: '幸运强化石',
    bonus: 10,  // +10%成功率
    price: 500,
    currency: 'gold',
    description: '提高10%强化成功率'
  }
}

// 强化转移配置
const ENHANCE_TRANSFER = {
  itemId: 'scroll_transfer_enhance',
  name: '强化转移卷轴',
  price: 50,
  currency: 'yuanbao',
  description: '可将一件装备的强化等级转移至同类型新装备',

  // 转移规则
  rules: {
    // 同类型装备才能转移（武器→武器，盔甲→盔甲）
    sameTypeRequired: true,

    // 新装备等级不能低于旧装备
    minLevelRatio: 1.0,

    // 转移时保留的强化等级比例（默认100%）
    preserveRate: 1.0,

    // 高等级转移有损耗
    highLevelPenalty: {
      10: 0.9,  // +10以上转移只保留90%
      13: 0.8,  // +13以上转移只保留80%
      15: 0.7   // +15转移只保留70%
    }
  },

  // 计算转移后的等级
  calculateTransferLevel(sourceLevel) {
    const penalty = this.rules.highLevelPenalty
    let preserveRate = this.rules.preserveRate

    // 从高到低查找适用的损耗率
    const levels = Object.keys(penalty).map(Number).sort((a, b) => b - a)
    for (const level of levels) {
      if (sourceLevel >= level) {
        preserveRate = penalty[level]
        break
      }
    }

    return Math.max(0, Math.floor(sourceLevel * preserveRate))
  }
}

// 保护道具配置
const ENHANCE_PROTECT = {
  scroll_protect: {
    id: 'scroll_protect',
    name: '强化保护卷轴',
    price: 100,
    currency: 'yuanbao',
    description: '强化失败时不降级',
    effect: 'prevent_degrade'
  }
}

// 获取强化等级颜色
function getEnhanceColor(level) {
  if (level >= 15) return ENHANCE_COLORS.legendary
  if (level >= 13) return ENHANCE_COLORS.epic
  if (level >= 10) return ENHANCE_COLORS.rare
  if (level >= 7) return ENHANCE_COLORS.superior
  if (level >= 4) return ENHANCE_COLORS.good
  return ENHANCE_COLORS.normal
}

// 获取强化等级名称
function getEnhanceName(level) {
  if (level >= 15) return '传说'
  if (level >= 13) return '史诗'
  if (level >= 10) return '精良'
  if (level >= 7) return '优秀'
  if (level >= 4) return '良好'
  return '普通'
}

module.exports = {
  MAX_ENHANCE_COST,
  ENHANCE_COLORS,
  ENHANCE_CONFIG,
  ENHANCE_MATERIALS,
  ENHANCE_TRANSFER,
  ENHANCE_PROTECT,
  calculateEnhanceCost,
  getFailureConfig,
  getSuccessRate,
  getStatBonus,
  getEnhanceColor,
  getEnhanceName
}
