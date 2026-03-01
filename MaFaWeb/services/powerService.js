/**
 * 战力计算服务
 * 支持 mock 和 API 两种模式
 */

const {
  POWER_WEIGHTS,
  ATTRIBUTE_MAPPING,
  RANK_TIERS,
  POWER_API_CONFIG,
  POWER_MOCK_DATA
} = require('../config/powerConfig')

const { dataManager } = require('./dataService')

// 是否使用 API 模式（可以从全局配置读取）
let useApiMode = false

/**
 * 战力计算器类
 */
class PowerCalculator {
  constructor(config = {}) {
    this.weights = config.weights || POWER_WEIGHTS
    this.attributeMapping = config.attributeMapping || ATTRIBUTE_MAPPING
  }

  /**
   * 计算单个属性的战力贡献
   * @param {string} attrName - 属性名
   * @param {number} value - 属性值
   * @returns {number} 战力贡献值
   */
  calculateAttributePower(attrName, value) {
    if (!value || value <= 0) return 0

    const mapping = this.attributeMapping[attrName]
    if (!mapping) return 0

    const weight = this.weights[mapping.weight] || 0
    return value * weight
  }

  /**
   * 计算总战力（核心方法）
   * @param {object} stats - 角色属性对象
   * @param {object} hero - 角色基础数据（用于获取HP/MP）
   * @returns {object} 战力计算结果详情
   */
  calculate(stats, hero = null) {
    if (!stats) {
      return { total: 0, breakdown: {}, details: [] }
    }

    const breakdown = {}
    const details = []
    let total = 0

    // 遍历所有属性计算战力
    Object.keys(this.attributeMapping).forEach(attrName => {
      const mapping = this.attributeMapping[attrName]
      let value = 0

      // 从 stats 获取属性值
      if (mapping.source === 'derived' && hero) {
        // 派生属性（如 HP/MP 需要从 hero 获取）
        value = hero[mapping.baseKey] || 0
      } else {
        value = stats[attrName] || 0
      }

      // 跳过无效值
      if (!value || value <= 0) return

      // 计算该属性的战力贡献
      const contribution = this.calculateAttributePower(attrName, value)

      if (contribution > 0) {
        breakdown[attrName] = {
          value,
          weight: this.weights[mapping.weight],
          contribution: Math.floor(contribution)
        }
        details.push({
          name: attrName,
          label: this.getAttributeLabel(attrName),
          value,
          weight: this.weights[mapping.weight],
          contribution: Math.floor(contribution)
        })
        total += contribution
      }
    })

    // 处理全属性加成
    if (stats.allStats && stats.allStats > 0) {
      const allStatsContribution = this.calculateAllStatsPower(stats.allStats)
      breakdown.allStats = {
        value: stats.allStats,
        contribution: Math.floor(allStatsContribution)
      }
      details.push({
        name: 'allStats',
        label: '全属性',
        value: stats.allStats,
        weight: this.weights.allStats,
        contribution: Math.floor(allStatsContribution)
      })
      total += allStatsContribution
    }

    return {
      total: Math.floor(total),
      breakdown,
      details: details.sort((a, b) => b.contribution - a.contribution)
    }
  }

  /**
   * 计算全属性加成的战力
   * @param {number} allStats - 全属性值
   * @returns {number} 战力贡献
   */
  calculateAllStatsPower(allStats) {
    // 全属性影响所有数值属性
    const affectedAttributes = ['attack', 'defense', 'magicAttack', 'magicDefense', 'speed', 'hp', 'mp']
    let totalContribution = 0

    affectedAttributes.forEach(attrName => {
      const mapping = this.attributeMapping[attrName]
      if (mapping) {
        const weight = this.weights[mapping.weight] || 0
        // 全属性加成 = allStats * 权重 * 全属性系数
        totalContribution += allStats * weight * this.weights.allStats
      }
    })

    return totalContribution
  }

  /**
   * 获取属性中文标签
   * @param {string} attrName - 属性名
   * @returns {string} 中文标签
   */
  getAttributeLabel(attrName) {
    const labels = {
      attack: '攻击',
      defense: '防御',
      magicAttack: '魔攻',
      magicDefense: '魔防',
      speed: '速度',
      hp: '生命',
      mp: '魔法',
      crit: '暴击',
      dodge: '闪避',
      block: '格挡',
      hit: '命中',
      lifesteal: '吸血',
      allStats: '全属性'
    }
    return labels[attrName] || attrName
  }

  /**
   * 获取战力段位信息
   * @param {number} power - 战力值
   * @returns {object} 段位信息
   */
  getRankInfo(power) {
    for (const rank of RANK_TIERS) {
      if (power >= rank.min) {
        return rank
      }
    }
    return RANK_TIERS[RANK_TIERS.length - 1]
  }

  /**
   * 获取战力排名（基于 mock 数据或 API）
   * @param {number} power - 当前战力
   * @returns {number} 预估排名
   */
  getEstimatedRank(power) {
    // 基于 mock 数据的排行榜估算排名
    const leaderboard = POWER_MOCK_DATA.leaderboard
    let rank = leaderboard.length + 1

    for (let i = 0; i < leaderboard.length; i++) {
      if (power > leaderboard[i].power) {
        rank = i + 1
        break
      }
    }

    return rank
  }
}

// ==================== Mock 实现 ====================

/**
 * Mock 战力计算
 * @param {object} stats - 角色属性
 * @param {object} hero - 角色基础数据
 * @returns {Promise<object>} 战力计算结果
 */
async function mockCalculatePower(stats, hero) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, POWER_API_CONFIG.calculate.mockDelay))

  const calculator = new PowerCalculator()
  const result = calculator.calculate(stats, hero)
  const rankInfo = calculator.getRankInfo(result.total)
  const estimatedRank = calculator.getEstimatedRank(result.total)

  return {
    code: 0,
    data: {
      ...result,
      rankInfo,
      estimatedRank,
      nextRank: getNextRankInfo(result.total)
    }
  }
}

/**
 * Mock 批量计算战力
 * @param {array} heroes - 角色列表
 * @returns {Promise<object>}
 */
async function mockBatchCalculatePower(heroes) {
  await new Promise(resolve => setTimeout(resolve, POWER_API_CONFIG.batchCalculate.mockDelay))

  const calculator = new PowerCalculator()
  const results = heroes.map(hero => ({
    heroId: hero.id,
    ...calculator.calculate(hero.stats, hero),
    rankInfo: calculator.getRankInfo(calculator.calculate(hero.stats, hero).total)
  }))

  return {
    code: 0,
    data: results
  }
}

/**
 * Mock 获取战力配置
 * @returns {Promise<object>}
 */
async function mockGetPowerConfig() {
  await new Promise(resolve => setTimeout(resolve, POWER_API_CONFIG.getConfig.mockDelay))

  return {
    code: 0,
    data: {
      weights: POWER_WEIGHTS,
      attributeMapping: ATTRIBUTE_MAPPING,
      rankTiers: RANK_TIERS
    }
  }
}

// ==================== API 实现 ====================

/**
 * API 战力计算
 * @param {object} stats - 角色属性
 * @param {object} hero - 角色基础数据
 * @returns {Promise<object>}
 */
async function apiCalculatePower(stats, hero) {
  const apiService = require('./apiService')

  return apiService.request(POWER_API_CONFIG.calculate.url, {
    stats,
    heroData: {
      maxHp: hero?.maxHp,
      maxMp: hero?.maxMp,
      level: hero?.level
    }
  }, POWER_API_CONFIG.calculate.method)
}

/**
 * API 批量计算战力
 * @param {array} heroes - 角色列表
 * @returns {Promise<object>}
 */
async function apiBatchCalculatePower(heroes) {
  const apiService = require('./apiService')

  return apiService.request(POWER_API_CONFIG.batchCalculate.url, {
    heroes: heroes.map(h => ({
      id: h.id,
      stats: h.stats,
      maxHp: h.maxHp,
      maxMp: h.maxMp,
      level: h.level
    }))
  }, POWER_API_CONFIG.batchCalculate.method)
}

/**
 * API 获取战力配置
 * @returns {Promise<object>}
 */
async function apiGetPowerConfig() {
  const apiService = require('./apiService')

  return apiService.request(
    POWER_API_CONFIG.getConfig.url,
    {},
    POWER_API_CONFIG.getConfig.method
  )
}

// ==================== 工具函数 ====================

/**
 * 获取下一段位信息
 * @param {number} currentPower - 当前战力
 * @returns {object|null}
 */
function getNextRankInfo(currentPower) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (RANK_TIERS[i].min > currentPower) {
      return {
        ...RANK_TIERS[i],
        need: RANK_TIERS[i].min - currentPower
      }
    }
  }
  return null
}

/**
 * 设置 API 模式
 * @param {boolean} useApi - 是否使用 API
 */
function setPowerApiMode(useApi) {
  useApiMode = useApi
}

// ==================== 统一接口 ====================

/**
 * 计算战力（自动选择 mock/api）
 * @param {object} stats - 角色属性
 * @param {object} hero - 角色基础数据
 * @returns {Promise<object>}
 */
async function calculatePower(stats, hero) {
  if (useApiMode && dataManager.networkStatus) {
    return apiCalculatePower(stats, hero)
  }
  return mockCalculatePower(stats, hero)
}

/**
 * 批量计算战力
 * @param {array} heroes - 角色列表
 * @returns {Promise<object>}
 */
async function batchCalculatePower(heroes) {
  if (useApiMode && dataManager.networkStatus) {
    return apiBatchCalculatePower(heroes)
  }
  return mockBatchCalculatePower(heroes)
}

/**
 * 获取战力配置
 * @returns {Promise<object>}
 */
async function getPowerConfig() {
  if (useApiMode && dataManager.networkStatus) {
    return apiGetPowerConfig()
  }
  return mockGetPowerConfig()
}

/**
 * 本地快速计算（不调用 API/Mock，用于页面快速渲染）
 * @param {object} stats - 角色属性
 * @param {object} hero - 角色基础数据
 * @returns {object}
 */
function calculatePowerLocal(stats, hero) {
  const calculator = new PowerCalculator()
  const result = calculator.calculate(stats, hero)
  const rankInfo = calculator.getRankInfo(result.total)

  return {
    ...result,
    rankInfo,
    estimatedRank: calculator.getEstimatedRank(result.total),
    nextRank: getNextRankInfo(result.total)
  }
}

module.exports = {
  // 主要接口
  calculatePower,
  batchCalculatePower,
  getPowerConfig,
  calculatePowerLocal,
  setPowerApiMode,

  // 类和方法（供高级使用）
  PowerCalculator,

  // Mock 接口（测试用）
  mockCalculatePower,
  mockBatchCalculatePower,
  mockGetPowerConfig,

  // 工具函数
  getNextRankInfo,
  RANK_TIERS
}
