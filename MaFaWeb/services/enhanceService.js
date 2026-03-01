/**
 * 装备强化数据服务
 * 支持mock数据和后端API切换
 */

const {
  ENHANCE_CONFIG,
  ENHANCE_TRANSFER,
  ENHANCE_MATERIALS,
  getEnhanceColor,
  getFailureConfig,
  getSuccessRate,
  getStatBonus,
  calculateEnhanceCost
} = require('../data/enhance')

// 配置：是否使用mock数据
const USE_MOCK = true

// API 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 10000

/**
 * 强化数据服务类
 */
class EnhanceDataService {
  constructor() {
    this.useMock = USE_MOCK
  }

  /**
   * 获取强化预览信息
   * @param {Object} item - 装备数据
   * @param {String} materialId - 强化石ID（可选）
   * @returns {Promise<Object>} 预览信息
   */
  async getEnhancePreview(item, materialId = null) {
    if (this.useMock) {
      return this.mockGetEnhancePreview(item, materialId)
    }

    try {
      return await this.fetchFromAPI('/api/enhance/preview', {
        itemId: item.id,
        currentLevel: item.enhance?.level || 0,
        materialId
      }, 'POST')
    } catch (error) {
      console.error('获取强化预览失败:', error)
      return this.mockGetEnhancePreview(item, materialId)
    }
  }

  /**
   * Mock: 获取强化预览
   */
  mockGetEnhancePreview(item, materialId) {
    const currentLevel = item.enhance?.level || 0

    // 检查是否可以强化
    if (!item || (item.type !== 'weapon' && item.type !== 'equipment')) {
      return { canEnhance: false, reason: '该物品无法强化' }
    }

    if (currentLevel >= ENHANCE_CONFIG.maxLevel) {
      return { canEnhance: false, reason: '已达最高强化等级' }
    }

    const targetLevel = currentLevel + 1
    const cost = calculateEnhanceCost(item.price, targetLevel)

    // 计算成功率
    let baseRate = getSuccessRate(targetLevel)
    if (materialId) {
      const material = ENHANCE_MATERIALS[materialId]
      if (material?.bonus) {
        baseRate = Math.min(100, baseRate + material.bonus)
      }
    }

    // 计算属性预览
    const currentBonus = getStatBonus(currentLevel)
    const targetBonus = getStatBonus(targetLevel)

    const statPreview = []
    const statKeys = ['attack', 'defense', 'hpBonus', 'mpBonus', 'crit', 'dodge']
    const statNames = {
      attack: '攻击', defense: '防御', hpBonus: '生命',
      mpBonus: '魔法', crit: '暴击', dodge: '闪避'
    }

    statKeys.forEach(key => {
      if (item[key] && item[key] > 0) {
        const base = item[key]
        const currentBonusVal = Math.floor(base * currentBonus)
        const targetBonusVal = Math.floor(base * targetBonus)

        statPreview.push({
          key, name: statNames[key], base,
          currentBonus: currentBonusVal,
          targetBonus: targetBonusVal,
          diff: targetBonusVal - currentBonusVal
        })
      }
    })

    const failConfig = getFailureConfig(targetLevel)

    return {
      canEnhance: true,
      currentLevel,
      targetLevel,
      cost,
      successRate: baseRate,
      statPreview,
      failureWarning: failConfig.type === 'degrade' ? `强化失败将降级至 +${failConfig.level}` : '',
      canProtect: failConfig.type === 'degrade'
    }
  }

  /**
   * 执行强化
   * @param {Object} item - 装备数据
   * @param {Object} hero - 英雄数据
   * @param {Object} options - 强化选项
   * @returns {Promise<Object>} 强化结果
   */
  async enhance(item, hero, options = {}) {
    const { materialId = null, useProtect = false } = options

    if (this.useMock) {
      return this.mockEnhance(item, hero, options)
    }

    try {
      const result = await this.fetchFromAPI('/api/enhance/enhance', {
        itemId: item.uid || item.id,
        heroId: hero.id,
        materialId,
        useProtect
      }, 'POST')

      // 更新本地数据
      if (result.success && result.data) {
        item.enhance = result.data.enhance
        hero.gold = result.data.heroGold
      }

      return result
    } catch (error) {
      console.error('强化请求失败:', error)
      return this.mockEnhance(item, hero, options)
    }
  }

  /**
   * Mock: 执行强化
   */
  mockEnhance(item, hero, options) {
    const { materialId = null, useProtect = false } = options
    const currentLevel = item.enhance?.level || 0

    // 检查
    if (currentLevel >= ENHANCE_CONFIG.maxLevel) {
      return { success: false, message: '已达最高强化等级' }
    }

    const targetLevel = currentLevel + 1
    const cost = calculateEnhanceCost(item.price, targetLevel)

    if (hero.gold < cost) {
      return { success: false, message: `需要 ${cost} 金币` }
    }

    // 扣除金币
    hero.gold -= cost

    // 计算成功率
    let baseRate = getSuccessRate(targetLevel)
    if (materialId) {
      const material = ENHANCE_MATERIALS[materialId]
      if (material?.bonus) baseRate += material.bonus
    }

    // 判定
    const isSuccess = Math.random() * 100 <= baseRate

    if (isSuccess) {
      // 成功
      if (!item.enhance) item.enhance = {}
      item.enhance.level = targetLevel
      this.recalculateBonusStats(item)

      return {
        success: true,
        message: `强化成功！${item.name} +${targetLevel}`,
        isSuccess: true,
        newLevel: targetLevel,
        cost,
        data: { enhance: item.enhance, heroGold: hero.gold }
      }
    } else {
      // 失败
      const failConfig = getFailureConfig(targetLevel)

      if (failConfig.type === 'degrade' && !useProtect) {
        item.enhance.level = failConfig.level
        this.recalculateBonusStats(item)

        return {
          success: false,
          message: `强化失败，装备降级至 +${failConfig.level}`,
          isSuccess: false,
          degradeTo: failConfig.level,
          cost,
          data: { enhance: item.enhance, heroGold: hero.gold }
        }
      }

      return {
        success: false,
        message: useProtect ? '强化失败，保护卷轴生效' : '强化失败，等级不变',
        isSuccess: false,
        protected: useProtect,
        cost,
        data: { heroGold: hero.gold }
      }
    }
  }

  /**
   * 获取转移预览
   */
  async getTransferPreview(sourceItem, targetItem) {
    if (this.useMock) {
      return this.mockGetTransferPreview(sourceItem, targetItem)
    }

    try {
      return await this.fetchFromAPI('/api/enhance/transfer-preview', {
        sourceId: sourceItem.uid || sourceItem.id,
        targetId: targetItem.uid || targetItem.id
      }, 'POST')
    } catch (error) {
      console.error('获取转移预览失败:', error)
      return this.mockGetTransferPreview(sourceItem, targetItem)
    }
  }

  /**
   * Mock: 获取转移预览
   */
  mockGetTransferPreview(sourceItem, targetItem) {
    // 检查
    if (!sourceItem || !targetItem) {
      return { canTransfer: false, reason: '装备不存在' }
    }

    const sourceLevel = sourceItem.enhance?.level || 0
    if (sourceLevel <= 0) {
      return { canTransfer: false, reason: '源装备没有强化等级' }
    }

    // 检查类型
    const getSlot = (item) => {
      if (item.type === 'weapon') return 'weapon'
      if (item.slot) return item.slot
      const id = item.id || ''
      if (id.includes('helmet')) return 'helmet'
      if (id.includes('armor')) return 'armor'
      if (id.includes('shield')) return 'shield'
      return item.subType
    }

    if (getSlot(sourceItem) !== getSlot(targetItem)) {
      return { canTransfer: false, reason: '装备类型不匹配' }
    }

    if (targetItem.level < sourceItem.level) {
      return { canTransfer: false, reason: '目标装备等级过低' }
    }

    if (targetItem.enhance?.level > 0) {
      return { canTransfer: false, reason: '目标装备已有强化等级' }
    }

    const newLevel = ENHANCE_TRANSFER.calculateTransferLevel(sourceLevel)

    return {
      canTransfer: true,
      sourceLevel,
      targetLevel: newLevel,
      levelLost: sourceLevel - newLevel,
      scrollPrice: ENHANCE_TRANSFER.price,
      scrollCurrency: ENHANCE_TRANSFER.currency
    }
  }

  /**
   * 执行转移
   */
  async transferEnhance(sourceItem, targetItem, bagItems, hero) {
    if (this.useMock) {
      return this.mockTransferEnhance(sourceItem, targetItem, bagItems, hero)
    }

    try {
      const result = await this.fetchFromAPI('/api/enhance/transfer', {
        sourceId: sourceItem.uid || sourceItem.id,
        targetId: targetItem.uid || targetItem.id,
        heroId: hero.id
      }, 'POST')

      if (result.success && result.data) {
        // 更新本地数据
        sourceItem.enhance = { level: 0, bonusStats: {}, color: getEnhanceColor(0) }
        targetItem.enhance = result.data.targetEnhance
        this.recalculateBonusStats(targetItem)

        // 消耗卷轴
        const scrollIndex = bagItems.findIndex(i => i.id === ENHANCE_TRANSFER.itemId)
        if (scrollIndex > -1) bagItems.splice(scrollIndex, 1)
      }

      return result
    } catch (error) {
      console.error('转移请求失败:', error)
      return this.mockTransferEnhance(sourceItem, targetItem, bagItems, hero)
    }
  }

  /**
   * Mock: 执行转移
   */
  mockTransferEnhance(sourceItem, targetItem, bagItems, hero) {
    // 检查卷轴
    const scrollIndex = bagItems.findIndex(item => item.id === ENHANCE_TRANSFER.itemId)
    if (scrollIndex === -1) {
      return { success: false, message: '需要强化转移卷轴' }
    }

    const preview = this.mockGetTransferPreview(sourceItem, targetItem)
    if (!preview.canTransfer) {
      return { success: false, message: preview.reason }
    }

    const newLevel = preview.targetLevel

    // 执行转移
    sourceItem.enhance = { level: 0, bonusStats: {}, color: getEnhanceColor(0) }
    targetItem.enhance = { level: newLevel, bonusStats: {}, color: getEnhanceColor(newLevel) }
    this.recalculateBonusStats(targetItem)

    // 消耗卷轴
    bagItems.splice(scrollIndex, 1)

    return {
      success: true,
      message: `转移成功！${targetItem.name} 获得 +${newLevel} 强化`,
      sourceLevel: 0,
      targetLevel: newLevel,
      data: {
        sourceEnhance: sourceItem.enhance,
        targetEnhance: targetItem.enhance
      }
    }
  }

  /**
   * 重新计算强化属性
   */
  recalculateBonusStats(item) {
    const level = item.enhance?.level || 0

    if (level === 0) {
      item.enhance = item.enhance || {}
      item.enhance.bonusStats = {}
      item.enhance.color = getEnhanceColor(0)
      return
    }

    const bonusPercent = getStatBonus(level)
    const bonusStats = {}
    const statKeys = ['attack', 'defense', 'hpBonus', 'mpBonus', 'crit', 'dodge', 'block', 'magicAttack', 'magicDefense']

    statKeys.forEach(key => {
      if (item[key] && item[key] > 0) {
        bonusStats[key] = Math.floor(item[key] * bonusPercent)
      }
    })

    item.enhance.bonusStats = bonusStats
    item.enhance.color = getEnhanceColor(level)
  }

  /**
   * 从API获取数据
   * @param {string} endpoint - API 端点
   * @param {Object} data - 请求数据
   * @param {string} method - HTTP 方法
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Object>} API 响应
   */
  async fetchFromAPI(endpoint, data, method = 'GET', timeout = DEFAULT_TIMEOUT) {
    const app = getApp()
    const baseURL = app?.globalData?.apiBaseURL || 'https://api.example.com'

    return new Promise((resolve, reject) => {
      // 创建超时定时器
      const timeoutTimer = setTimeout(() => {
        reject(new Error(`请求超时: ${endpoint}`))
      }, timeout)

      wx.request({
        url: `${baseURL}${endpoint}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wx.getStorageSync('token') || ''}`
        },
        success: (res) => {
          clearTimeout(timeoutTimer)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`API错误: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          clearTimeout(timeoutTimer)
          reject(err)
        }
      })
    })
  }

  /**
   * 切换数据模式
   */
  setUseMock(useMock) {
    this.useMock = useMock
  }
}

// 导出单例
const enhanceDataService = new EnhanceDataService()

module.exports = {
  enhanceDataService,
  EnhanceDataService
}
