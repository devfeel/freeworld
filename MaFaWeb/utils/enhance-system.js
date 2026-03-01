/**
 * 装备强化系统管理器
 * 处理装备强化、属性计算、强化转移等功能
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

class EnhanceSystem {
  constructor(hero) {
    this.hero = hero
  }

  /**
   * 计算强化成功率
   * @param {Object} item - 要强化的装备
   * @param {String} materialId - 使用的强化石（可选）
   * @returns {Number} 成功率 0-100
   */
  calculateSuccessRate(item, materialId = null) {
    const currentLevel = item.enhance?.level || 0
    const targetLevel = currentLevel + 1

    // 获取基础成功率
    const baseRate = getSuccessRate(targetLevel)

    // 强化石加成
    let bonus = 0
    if (materialId) {
      const material = ENHANCE_MATERIALS[materialId]
      if (material) {
        bonus = material.bonus || 0
      }
    }

    return Math.min(100, baseRate + bonus)
  }

  /**
   * 计算强化费用
   * @param {Object} item - 要强化的装备
   * @param {Number} targetLevel - 目标等级
   * @returns {Number} 所需金币
   */
  calculateCost(item, targetLevel) {
    return calculateEnhanceCost(item.price, targetLevel)
  }

  /**
   * 检查是否可以强化
   * @param {Object} item - 装备
   * @returns {Object} { canEnhance: boolean, reason: string }
   */
  canEnhance(item) {
    if (!item) {
      return { canEnhance: false, reason: '装备不存在' }
    }

    // 检查装备类型
    if (item.type !== 'weapon' && item.type !== 'equipment') {
      return { canEnhance: false, reason: '该物品无法强化' }
    }

    const currentLevel = item.enhance?.level || 0

    // 检查等级上限
    if (currentLevel >= ENHANCE_CONFIG.maxLevel) {
      return { canEnhance: false, reason: '已达最高强化等级' }
    }

    // 检查金币
    const targetLevel = currentLevel + 1
    const cost = this.calculateCost(item, targetLevel)
    if (this.hero.gold < cost) {
      return { canEnhance: false, reason: `需要 ${cost} 金币` }
    }

    return { canEnhance: true, cost, targetLevel }
  }

  /**
   * 执行强化
   * @param {Object} item - 要强化的装备
   * @param {String} materialId - 强化石ID（可选）
   * @param {Boolean} useProtect - 是否使用保护卷轴
   * @returns {Object} 强化结果
   */
  enhance(item, materialId = null, useProtect = false) {
    // 检查是否可以强化
    const check = this.canEnhance(item)
    if (!check.canEnhance) {
      return { success: false, message: check.reason }
    }

    const { cost, targetLevel } = check
    const currentLevel = item.enhance?.level || 0

    // 扣除金币
    this.hero.gold -= cost

    // 如果有使用强化石，扣除强化石
    if (materialId) {
      // 注意：强化石扣除需要在调用方处理（从背包中移除）
    }

    // 计算成功率并判定
    const successRate = this.calculateSuccessRate(item, materialId)
    const roll = Math.random() * 100
    const isSuccess = roll <= successRate

    if (isSuccess) {
      // 强化成功
      if (!item.enhance) {
        item.enhance = {}
      }
      item.enhance.level = targetLevel
      this.recalculateBonusStats(item)

      return {
        success: true,
        message: `强化成功！${item.name} +${targetLevel}`,
        newLevel: targetLevel,
        isSuccess: true,
        cost
      }
    } else {
      // 强化失败
      const failConfig = getFailureConfig(targetLevel)

      if (failConfig.type === 'degrade' && !useProtect) {
        // 降级处理
        item.enhance.level = failConfig.level
        this.recalculateBonusStats(item)

        return {
          success: false,
          message: `强化失败，装备降级至 +${failConfig.level}`,
          degradeTo: failConfig.level,
          isSuccess: false,
          cost
        }
      }

      // 无惩罚或已保护
      return {
        success: false,
        message: useProtect ? '强化失败，保护卷轴生效，等级不变' : '强化失败，等级不变',
        isSuccess: false,
        protected: useProtect,
        cost
      }
    }
  }

  /**
   * 重新计算强化带来的属性加成
   * @param {Object} item - 装备
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

    // 可强化的属性列表
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
   * 获取装备的显示名称（带强化等级）
   * @param {Object} item - 装备
   * @returns {String} 显示名称
   */
  getDisplayName(item) {
    if (!item) return ''
    const enhanceLevel = item.enhance?.level || 0
    const enhancePrefix = enhanceLevel > 0 ? `+${enhanceLevel} ` : ''
    return `${enhancePrefix}${item.name}`
  }

  /**
   * 获取装备的总属性（基础+强化）
   * @param {Object} item - 装备
   * @param {String} statKey - 属性名
   * @returns {Number} 总属性值
   */
  getTotalStat(item, statKey) {
    if (!item) return 0
    const baseStat = item[statKey] || 0
    const bonusStat = item.enhance?.bonusStats?.[statKey] || 0
    return baseStat + bonusStat
  }

  // ========== 强化转移功能 ==========

  /**
   * 获取装备槽位
   * @param {Object} item - 装备
   * @returns {String} 槽位名称
   */
  getEquipSlot(item) {
    if (!item) return null

    // 武器类型
    if (item.type === 'weapon') return 'weapon'

    // 从 slot 或 subType 获取
    if (item.slot) return item.slot

    // 从 id 推断
    const itemId = item.id || ''
    if (itemId.includes('helmet')) return 'helmet'
    if (itemId.includes('armor')) return 'armor'
    if (itemId.includes('shield')) return 'shield'
    if (itemId.includes('necklace')) return 'necklace'
    if (itemId.includes('ring')) return 'ring'
    if (itemId.includes('belt')) return 'belt'
    if (itemId.includes('bracer')) return 'bracer'
    if (itemId.includes('amulet')) return 'amulet'

    return item.subType || null
  }

  /**
   * 检查是否可以转移强化
   * @param {Object} sourceItem - 源装备
   * @param {Object} targetItem - 目标装备
   * @returns {Object} { canTransfer: boolean, reason: string }
   */
  canTransfer(sourceItem, targetItem) {
    if (!sourceItem || !targetItem) {
      return { canTransfer: false, reason: '装备不存在' }
    }

    const rules = ENHANCE_TRANSFER.rules

    // 检查源装备是否有强化
    const sourceLevel = sourceItem.enhance?.level || 0
    if (sourceLevel <= 0) {
      return { canTransfer: false, reason: '源装备没有强化等级' }
    }

    // 检查是否是同类型装备
    if (rules.sameTypeRequired) {
      const sourceSlot = this.getEquipSlot(sourceItem)
      const targetSlot = this.getEquipSlot(targetItem)
      if (sourceSlot !== targetSlot) {
        return { canTransfer: false, reason: '装备类型不匹配，只能转移到同类型装备' }
      }
    }

    // 检查目标装备等级
    if (targetItem.level < sourceItem.level * rules.minLevelRatio) {
      return { canTransfer: false, reason: `目标装备等级过低，需要至少Lv.${Math.ceil(sourceItem.level * rules.minLevelRatio)}` }
    }

    // 检查目标装备是否已有强化
    const targetLevel = targetItem.enhance?.level || 0
    if (targetLevel > 0) {
      return { canTransfer: false, reason: '目标装备已有强化等级，请先清零' }
    }

    return { canTransfer: true, sourceLevel }
  }

  /**
   * 计算转移后的强化等级
   * @param {Number} sourceLevel - 源装备强化等级
   * @returns {Number} 转移后的等级
   */
  calculateTransferLevel(sourceLevel) {
    return ENHANCE_TRANSFER.calculateTransferLevel(sourceLevel)
  }

  /**
   * 执行强化转移
   * @param {Object} sourceItem - 源装备
   * @param {Object} targetItem - 目标装备
   * @param {Array} bagItems - 背包物品列表
   * @returns {Object} 转移结果
   */
  transferEnhance(sourceItem, targetItem, bagItems) {
    // 检查转移卷轴
    const scrollIndex = bagItems.findIndex(item =>
      item.id === ENHANCE_TRANSFER.itemId
    )

    if (scrollIndex === -1) {
      return { success: false, message: '需要强化转移卷轴' }
    }

    // 检查可行性
    const check = this.canTransfer(sourceItem, targetItem)
    if (!check.canTransfer) {
      return { success: false, message: check.reason }
    }

    const sourceLevel = check.sourceLevel
    const newLevel = this.calculateTransferLevel(sourceLevel)

    // 执行转移
    // 1. 源装备清零
    sourceItem.enhance = { level: 0, bonusStats: {}, color: getEnhanceColor(0) }
    this.recalculateBonusStats(sourceItem)

    // 2. 目标装备获得强化
    targetItem.enhance = { level: newLevel, bonusStats: {}, color: getEnhanceColor(newLevel) }
    this.recalculateBonusStats(targetItem)

    // 3. 消耗转移卷轴
    bagItems.splice(scrollIndex, 1)

    return {
      success: true,
      message: `转移成功！${targetItem.name} 获得 +${newLevel} 强化`,
      sourceLevel: 0,
      targetLevel: newLevel,
      scrollConsumed: 1
    }
  }

  /**
   * 获取强化预览信息
   * @param {Object} item - 装备
   * @returns {Object} 预览信息
   */
  getEnhancePreview(item) {
    const check = this.canEnhance(item)
    if (!check.canEnhance) {
      return { canEnhance: false, reason: check.reason }
    }

    const { cost, targetLevel } = check
    const currentLevel = item.enhance?.level || 0
    const successRate = this.calculateSuccessRate(item)

    // 计算属性预览
    const currentBonus = getStatBonus(currentLevel)
    const targetBonus = getStatBonus(targetLevel)

    const statPreview = []
    const statKeys = ['attack', 'defense', 'hpBonus', 'mpBonus', 'crit', 'dodge']
    const statNames = {
      attack: '攻击',
      defense: '防御',
      hpBonus: '生命',
      mpBonus: '魔法',
      crit: '暴击',
      dodge: '闪避'
    }

    statKeys.forEach(key => {
      if (item[key] && item[key] > 0) {
        const current = item[key]
        const currentBonusVal = Math.floor(current * currentBonus)
        const targetBonusVal = Math.floor(current * targetBonus)

        statPreview.push({
          key,
          name: statNames[key],
          base: current,
          currentBonus: currentBonusVal,
          targetBonus: targetBonusVal,
          diff: targetBonusVal - currentBonusVal
        })
      }
    })

    // 失败惩罚预览
    const failConfig = getFailureConfig(targetLevel)
    let failureWarning = ''
    if (failConfig.type === 'degrade') {
      failureWarning = `强化失败将降级至 +${failConfig.level}`
    }

    return {
      canEnhance: true,
      currentLevel,
      targetLevel,
      cost,
      successRate,
      statPreview,
      failureWarning,
      canProtect: failConfig.type === 'degrade'
    }
  }

  /**
   * 获取转移预览信息
   * @param {Object} sourceItem - 源装备
   * @param {Object} targetItem - 目标装备
   * @returns {Object} 预览信息
   */
  getTransferPreview(sourceItem, targetItem) {
    const check = this.canTransfer(sourceItem, targetItem)
    if (!check.canTransfer) {
      return { canTransfer: false, reason: check.reason }
    }

    const sourceLevel = check.sourceLevel
    const newLevel = this.calculateTransferLevel(sourceLevel)

    // 计算属性变化
    const sourceStatBonus = getStatBonus(sourceLevel)
    const targetStatBonus = getStatBonus(newLevel)

    return {
      canTransfer: true,
      sourceLevel,
      targetLevel: newLevel,
      levelLost: sourceLevel - newLevel,
      sourceStatBonus: Math.floor(sourceStatBonus * 100),
      targetStatBonus: Math.floor(targetStatBonus * 100),
      scrollPrice: ENHANCE_TRANSFER.price,
      scrollCurrency: ENHANCE_TRANSFER.currency
    }
  }
}

// 创建增强系统实例的工厂函数
function createEnhanceSystem(hero) {
  return new EnhanceSystem(hero)
}

module.exports = {
  EnhanceSystem,
  createEnhanceSystem
}
