// 游戏工具函数

/**
 * 随机数生成器
 */
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 随机概率判断
 */
function chance(percent) {
  return Math.random() * 100 < percent
}

/**
 * 计算伤害
 * @param {number} attack 攻击力
 * @param {number} defense 防御力
 * @param {number} multiplier 伤害倍率
 * @param {number} crit 暴击率 (0-100)
 * @param {number} critDamage 暴击伤害倍率 (默认150%)
 * @returns {object} {damage, isCritical}
 */
function calculateDamage(attack, defense, multiplier = 1.0, crit = 10, critDamage = 150) {
  // ========== 防御递减机制 ==========
  // 防御越高，效果越差，使用对数递减
  // defenseFactor = 0.5 * (1 - log(1 + defense) / log(1 + maxDefense))
  // 假设最大有效防御为500，超过后收益明显递减
  const maxEffectiveDefense = 500
  const defenseFactor = 0.5 * (1 - Math.log(1 + defense) / Math.log(1 + maxEffectiveDefense))
  const effectiveDefense = defense * Math.max(0.1, defenseFactor)

  // 基础伤害
  let damage = Math.max(1, (attack * multiplier) - effectiveDefense)

  // 随机波动 +/- 10%
  damage = damage * random(90, 110) / 100

  // 暴击判断 (默认10%基础暴击率)
  const isCritical = chance(crit)
  if (isCritical) {
    damage *= (critDamage / 100)
  }

  return {
    damage: Math.floor(damage),
    isCritical
  }
}

/**
 * 判断命中
 * @param {number} attackerAccuracy 攻击方精准
 * @param {number} defenderDodge 防御方闪避率 (0-100)
 * @returns {boolean} 是否命中
 */
function checkHit(attackerAccuracy, defenderDodge) {
  // 基础命中率 90%，精准可以增加命中率
  let hitChance = 90 + attackerAccuracy
  // 减去对方的闪避率
  hitChance -= defenderDodge
  // 命中率范围 10% - 100%
  hitChance = Math.max(10, Math.min(100, hitChance))
  return chance(hitChance)
}

/**
 * 判断闪避
 * @param {number} speed 速度值
 * @param {boolean} isHit 是否命中
 */
function checkDodge(speed) {
  // 速度越高，闪避率越高
  const dodgeRate = Math.min(0.3, speed * 0.01)
  return chance(dodgeRate * 100)
}

/**
 * 处理掉落
 * @param {Array} drops 掉落列表
 * @param {number} dropBonus 额外掉落加成
 * @returns {Array} 掉落的物品列表
 */
function processDrops(drops, dropBonus = 0) {
  const result = []

  if (!drops || !Array.isArray(drops)) {
    return result
  }

  drops.forEach(drop => {
    if (!drop) return

    // 计算实际掉落概率
    const actualChance = (drop.chance || 0) * (1 + dropBonus)

    if (chance(actualChance * 100)) {
      if (drop.type === 'gold') {
        const amount = random((drop.amount && drop.amount[0]) || 0, (drop.amount && drop.amount[1]) || 0)
        result.push({ type: 'gold', amount })
      } else if (drop.type === 'exp') {
        const amount = random((drop.amount && drop.amount[0]) || 0, (drop.amount && drop.amount[1]) || 0)
        result.push({ type: 'exp', amount })
      } else if (drop.type === 'item') {
        result.push({ type: 'item', itemId: drop.itemId })
      }
    }
  })

  return result
}

/**
 * 格式化数字
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 深拷贝对象（性能优化版）
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  // 处理Date
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // 处理Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }

  // 处理Object
  const cloned = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 洗牌算法
 */
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 获取稀有度颜色
 */
function getRarityColor(rarity) {
  const colors = {
    common: '#808080',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
  }
  return colors[rarity] || '#ffffff'
}

/**
 * 显示Toast提示
 */
function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 1500
  })
}

/**
 * 显示模态框
 */
function showModal(title, content, confirmText = '确定') {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      confirmText,
      showCancel: false,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 节流函数
 */
function throttle(fn, delay) {
  let lastCall = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(this, args)
    }
  }
}

/**
 * 防抖函数
 */
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 平衡调整：根据等级缩放经验值
 * 早期升级更加困难，后期难度显著提升
 */
function getExpForLevel(level) {
  if (level <= 10) {
    // 前10级较难成长 - 基础值更高
    return Math.floor(150 + (level - 1) * 30)
  } else if (level <= 30) {
    // 11-30级中等难度增长 - 更陡峭的增长曲线
    return Math.floor(400 + (level - 10) * 70)
  } else if (level <= 50) {
    // 31-50级更高难度增长 - 快速增长
    return Math.floor(1800 + (level - 30) * 150)
  } else {
    // 50级以后非常快速增长
    return Math.floor(4800 + (level - 50) * 300)
  }
}

/**
 * 计算角色战力
 * @param {object} stats 角色属性 {attack, defense, hp, magicAttack, etc.}
 * @returns {number} 战力值
 */
function calculatePower(stats) {
  const attack = stats.attack || 0
  const defense = stats.defense || 0
  const hp = stats.hp || 0
  const magicAttack = stats.magicAttack || 0

  return Math.floor(attack * 2 + defense * 1.5 + hp / 10 + magicAttack * 1.8)
}

/**
 * 获取战力对应的称号
 * @param {number} level 等级
 * @param {number} power 战力值
 * @returns {string} 称号
 */
function getTitleByPower(level, power) {
  if (power >= 10000) return '传说英雄'
  if (power >= 5000) return '史诗勇士'
  if (power >= 2000) return '精英战士'
  if (level >= 30) return '大冒险家'
  if (level >= 20) return '资深冒险者'
  if (level >= 10) return '见习勇士'
  return '新手冒险者'
}

module.exports = {
  random,
  chance,
  calculateDamage,
  checkDodge,
  checkHit,
  processDrops,
  formatNumber,
  deepClone,
  delay,
  shuffle,
  getRarityColor,
  showToast,
  showModal,
  throttle,
  debounce,
  getExpForLevel,
  calculatePower,
  getTitleByPower
}
