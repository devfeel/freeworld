// Buff/Debuff 系统

/**
 * Buff/Debuff 类型
 */
const BUFF_TYPES = {
  // 属性加成
  ATTACK_UP: 'attackUp',      // 攻击力提升
  ATTACK_DOWN: 'attackDown',  // 攻击力下降
  DEFENSE_UP: 'defenseUp',    // 防御力提升
  DEFENSE_DOWN: 'defenseDown',// 防御力下降
  SPEED_UP: 'speedUp',        // 速度提升
  SPEED_DOWN: 'speedDown',    // 速度下降
  HP_REGEN: 'hpRegen',        // 生命回复
  MP_REGEN: 'mpRegen',        // 魔法回复
  
  // 特殊效果
  INVINCIBLE: 'invincible',   // 无敌
  SILENT: 'silent',           // 沉默（无法使用技能）
  STUN: 'stun',               // 眩晕（无法行动）
  
  // 持续伤害
  POISON: 'poison',           // 中毒
  BURN: 'burn',               // 燃烧
  BLEED: 'bleed'              // 出血
}

/**
 * Buff 类
 */
class Buff {
  constructor(config) {
    this.id = config.id || `buff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.type = config.type
    this.name = config.name || ''
    this.description = config.description || ''
    this.duration = config.duration || 3  // 持续回合数
    this.maxDuration = config.duration || 3
    this.value = config.value || 0        // 效果数值
    this.isDebuff = config.isDebuff || false
    
    // 属性修正
    this.statModifiers = config.statModifiers || {}
  }

  /**
   * 应用属性修正
   * @param {object} stats 原始属性
   * @returns {object} 修正后的属性
   */
  apply(stats) {
    const modified = { ...stats }
    
    if (this.statModifiers.attack) {
      modified.attack = (modified.attack || 0) + this.statModifiers.attack
    }
    if (this.statModifiers.defense) {
      modified.defense = (modified.defense || 0) + this.statModifiers.defense
    }
    if (this.statModifiers.speed) {
      modified.speed = (modified.speed || 0) + this.statModifiers.speed
    }
    if (this.statModifiers.crit) {
      modified.crit = (modified.crit || 0) + this.statModifiers.crit
    }
    if (this.statModifiers.dodge) {
      modified.dodge = (modified.dodge || 0) + this.statModifiers.dodge
    }
    if (this.statModifiers.magicAttack) {
      modified.magicAttack = (modified.magicAttack || 0) + this.statModifiers.magicAttack
    }
    
    return modified
  }

  /**
   * 每回合衰减
   * @returns {boolean} 是否应该移除
   */
  tick() {
    this.duration--
    return this.duration <= 0
  }

  /**
   * 获取效果描述
   */
  getDescription() {
    const sign = this.value > 0 ? '+' : ''
    switch (this.type) {
      case BUFF_TYPES.ATTACK_UP:
        return `${this.name}: 攻击力${sign}${this.value}，${this.duration}回合`
      case BUFF_TYPES.DEFENSE_UP:
        return `${this.name}: 防御力${sign}${this.value}，${this.duration}回合`
      case BUFF_TYPES.SPEED_UP:
        return `${this.name}: 速度${sign}${this.value}，${this.duration}回合`
      case BUFF_TYPES.POISON:
        return `${this.name}: 每回合损失${this.value}HP，${this.duration}回合`
      default:
        return `${this.name}: ${this.duration}回合`
    }
  }
}

/**
 * Buff 管理器
 */
class BuffManager {
  constructor() {
    this.buffs = []
  }

  /**
   * 添加 Buff
   * @param {Buff} buff 
   */
  addBuff(buff) {
    // 检查是否相同类型的 Buff 已存在，如果是则刷新时间
    const existing = this.buffs.find(b => b.type === buff.type)
    if (existing) {
      existing.duration = existing.maxDuration
      existing.value = buff.value
    } else {
      this.buffs.push(buff)
    }
  }

  /**
   * 移除 Buff
   * @param {string} buffId 
   */
  removeBuff(buffId) {
    this.buffs = this.buffs.filter(b => b.id !== buffId)
  }

  /**
   * 移除指定类型的 Buff
   * @param {string} type 
   */
  removeBuffByType(type) {
    this.buffs = this.buffs.filter(b => b.type !== type)
  }

  /**
   * 获取所有属性修正
   * @returns {object}
   */
  getTotalModifiers() {
    const modifiers = {
      attack: 0,
      defense: 0,
      speed: 0,
      crit: 0,
      dodge: 0,
      magicAttack: 0,
      lifeSteal: 0,
      reflectDamage: 0,
      hpRegen: 0,
      mpRegen: 0
    }

    this.buffs.forEach(buff => {
      if (buff.statModifiers) {
        Object.keys(buff.statModifiers).forEach(key => {
          if (modifiers.hasOwnProperty(key)) {
            modifiers[key] += buff.statModifiers[key]
          }
        })
      }
    })

    return modifiers
  }

  /**
   * 检查是否有控制效果
   * @returns {object} {stun: boolean, silent: boolean}
   */
  getControlEffects() {
    return {
      stun: this.buffs.some(b => b.type === BUFF_TYPES.STUN),
      silent: this.buffs.some(b => b.type === BUFF_TYPES.SILENT),
      invincible: this.buffs.some(b => b.type === BUFF_TYPES.INVINCIBLE)
    }
  }

  /**
   * 每回合处理
   * @param {object} target 目标（英雄或敌人）
   * @returns {Array} 效果日志
   */
  tick(target) {
    const logs = []
    const expiredBuffs = []

    this.buffs.forEach(buff => {
      // 处理持续伤害
      if (buff.type === BUFF_TYPES.POISON || buff.type === BUFF_TYPES.BURN || buff.type === BUFF_TYPES.BLEED) {
        const damage = buff.value
        target.hp = Math.max(0, target.hp - damage)
        logs.push(`${target.name} 因 ${buff.name} 损失了 ${damage} HP`)
      }

      // 处理生命/魔法回复
      if (buff.type === BUFF_TYPES.HP_REGEN) {
        const healAmount = buff.value
        target.hp = Math.min(target.maxHp, target.hp + healAmount)
        logs.push(`${target.name} 因 ${buff.name} 恢复了 ${healAmount} HP`)
      }
      if (buff.type === BUFF_TYPES.MP_REGEN) {
        const mp恢复 = buff.value
        target.mp = Math.min(target.maxMp, target.mp + mp恢复)
        logs.push(`${target.name} 因 ${buff.name} 恢复了 ${mp恢复} MP`)
      }

      // 衰减持续时间
      if (buff.tick()) {
        expiredBuffs.push(buff.id)
        logs.push(`${buff.name} 效果结束`)
      }
    })

    // 移除过期的 Buff
    this.buffs = this.buffs.filter(b => !expiredBuffs.includes(b.id))

    return logs
  }

  /**
   * 获取 Buff 列表描述
   */
  getBuffList() {
    return this.buffs.map(b => b.getDescription())
  }

  /**
   * 清除所有 Buff
   */
  clear() {
    this.buffs = []
  }
}

// 预定义 Buff 创建函数
const BuffFactory = {
  /**
   * 攻击力提升
   */
  createAttackUp(value, duration = 3) {
    return new Buff({
      type: BUFF_TYPES.ATTACK_UP,
      name: '攻击强化',
      value,
      duration,
      statModifiers: { attack: value }
    })
  },

  /**
   * 防御力提升
   */
  createDefenseUp(value, duration = 3) {
    return new Buff({
      type: BUFF_TYPES.DEFENSE_UP,
      name: '防御强化',
      value,
      duration,
      statModifiers: { defense: value }
    })
  },

  /**
   * 中毒
   */
  createPoison(damage, duration = 3) {
    return new Buff({
      type: BUFF_TYPES.POISON,
      name: '中毒',
      value: damage,
      duration,
      isDebuff: true
    })
  },

  /**
   * 眩晕
   */
  createStun(duration = 1) {
    return new Buff({
      type: BUFF_TYPES.STUN,
      name: '眩晕',
      duration,
      isDebuff: true
    })
  },

  /**
   * 无敌
   */
  createInvincible(duration = 1) {
    return new Buff({
      type: BUFF_TYPES.INVINCIBLE,
      name: '无敌',
      duration
    })
  }
}

module.exports = {
  BUFF_TYPES,
  Buff,
  BuffManager,
  BuffFactory
}
