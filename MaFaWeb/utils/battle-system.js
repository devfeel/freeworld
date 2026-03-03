// 战斗系统
const { calculateDamage, checkDodge, processDrops, delay } = require('./game-utils')
const { getSkill, getSkillEffect, SKILL_TYPES } = require('../data/skills')
const BattleStatistics = require('./battle-statistics')
const BattleAnimationManager = require('./battle-animation-manager')

class BattleSystem {
  constructor(app, canvas, ctx) {
    this.app = app
    this.canvas = canvas
    this.ctx = ctx
    this.battle = null
    this.turn = 'hero' // 'hero' or 'enemy'
    this.isBattling = false
    this.animationFrame = null

    // 初始化统计模块
    this.statistics = new BattleStatistics()

    // 初始化动画管理器
    if (canvas && ctx) {
      this.animationManager = new BattleAnimationManager(canvas, ctx)
    }
  }

  /**
   * 开始战斗
   * @param {object} monster 怪物数据
   */
  async startBattle(monster) {
    if (this.isBattling) return false

    const app = getApp()
    const hero = app.globalData.hero

    // 获取包含装备加成的总属性
    const totalStats = app.getTotalStats(hero)

    // 计算最大生命/魔法（基础值 + 装备加成）
    const maxHp = (hero.maxHp || 100) + (totalStats.hpBonus || 0)
    const maxMp = (hero.maxMp || 100) + (totalStats.mpBonus || 0)

    // 初始化战斗数据 - 包含所有支持的属性
    this.battle = {
      hero: {
        // 基础属性
        hp: hero.hp || maxHp,
        maxHp: maxHp,
        mp: hero.mp || maxMp,
        maxMp: maxMp,
        // 战斗属性
        attack: totalStats.attack || hero.attack || 15,
        magicAttack: totalStats.magicAttack || 0,
        defense: totalStats.defense || hero.defense || 5,
        speed: totalStats.speed || hero.speed || 10,
        crit: totalStats.crit || 0,
        dodge: totalStats.dodge || 0,
        block: totalStats.block || 0,
        // ========== 未来可扩展属性 ==========
        // 要添加新属性，只需在此初始化即可
        // 例如：
        // lifeSteal: totalStats.lifeSteal || 0,      // 吸血率
        // accuracy: totalStats.accuracy || 0,        // 精准
        // hpRegen: totalStats.hpRegen || 0,         // 生命恢复/回合
        // mpRegen: totalStats.mpRegen || 0,         // 魔法恢复/回合
        // reflectDamage: totalStats.reflectDamage || 0, // 伤害反射
        skills: hero.skills || []
      },
      enemy: {
        ...monster,
        currentHp: monster.hp,
        // 敌人也可能有扩展属性（未来可添加）
        magicAttack: monster.magicAttack || 0,
        crit: monster.crit || 0,
        dodge: monster.dodge || 0
      },
      turn: this.getFasterCharacter(totalStats, monster) ? 'hero' : 'enemy',
      round: 0,
      logs: []
    }

    // 添加战斗开始日志
    this.addBattleLog(`遭遇了 ${monster.name}！`)

    this.isBattling = true
    app.globalData.gameStatus = 'battling'

    // 开始统计
    this.statistics.startBattle()

    // 触发回合变化事件
    if (this.onEvent) {
      this.onEvent('turnChange', { turn: this.battle.turn })
    }

    // 如果是敌方先手，自动进行敌方攻击
    if (this.battle.turn === 'enemy') {
      setTimeout(() => {
        this.enemyAttack()
      }, 1000)
    }

    return true
  }

  /**
   * 判断谁先手
   */
  getFasterCharacter(heroStats, enemy) {
    // 使用 heroStats（包含装备加成的总属性）进行比较
    const heroSpeed = heroStats.speed || 0
    const enemySpeed = enemy.speed || 0

    // 速度高者先手，相同则随机
    if (heroSpeed !== enemySpeed) {
      return heroSpeed > enemySpeed
    }
    return Math.random() > 0.5
  }

  /**
   * 统一的技能执行入口
   * @param {string} skillId - 技能ID
   * @param {object} options - 执行选项
   * @returns {Promise<boolean>} 是否执行成功
   */
  async executeSkill(skillId, options = {}) {
    if (this.battle.turn !== 'hero' || !this.isBattling) {
      return false
    }

    try {
      const { getSkill, getSkillEffect } = require('../data/skills')
      const skillDef = await getSkill(skillId)

      if (!skillDef) {
        this.addBattleLog('技能数据错误！')
        return false
      }

      const heroSkill = this.app.globalData.hero.skills[skillId]
      if (!heroSkill) {
        this.addBattleLog('未学会该技能！')
        return false
      }

      const effects = getSkillEffect(skillId, heroSkill.level)
      const mpCost = effects.mpCost || skillDef.mpCost || 0

      // 检查MP
      if (this.battle.hero.mp < mpCost) {
        this.addBattleLog('MP不足！')
        this.emitEvent('error', { type: 'insufficient_mp', message: 'MP不足' })
        return false
      }

      // 检查冷却
      if (heroSkill.cooldown > 0) {
        this.addBattleLog(`技能冷却中，还需 ${heroSkill.cooldown} 回合`)
        this.emitEvent('error', { type: 'skill_cooldown', message: `技能冷却中 (${heroSkill.cooldown}回合)` })
        return false
      }

      // 消耗MP
      this.battle.hero.mp -= mpCost

      // 设置冷却
      const maxCooldown = skillDef.cooldown || 0
      if (maxCooldown > 0) {
        heroSkill.cooldown = maxCooldown
      }

      // 记录技能使用统计
      this.statistics.recordSkillUse(skillId, skillDef.name)

      // 触发攻击动画事件
      this.emitEvent('heroAttack', { skillId, skillName: skillDef.name })

      const hero = this.battle.hero
      const enemy = this.battle.enemy

      // 根据技能类型执行不同效果
      const result = await this.processSkillEffects(skillDef, effects, hero, enemy)

      // 记录攻击统计
      this.statistics.recordTurn('hero')

      // 检查战斗结束
      if (enemy.currentHp <= 0) {
        await this.endBattle('hero')
        return true
      }

      // 切换回合
      this.battle.turn = 'enemy'
      this.emitEvent('turnChange', { turn: 'enemy' })

      // 延迟后敌方行动
      await delay(1000)
      this.enemyAttack()

      return true

    } catch (error) {
      console.error('[BattleSystem] 技能执行错误:', error)
      this.addBattleLog('技能执行出错！')
      this.emitEvent('error', { type: 'execution_error', message: '技能执行出错', error })
      return false
    }
  }

  /**
   * 处理技能效果
   * @param {object} skillDef - 技能定义
   * @param {object} effects - 技能效果
   * @param {object} hero - 英雄数据
   * @param {object} enemy - 敌人数据
   * @returns {object} 执行结果
   */
  async processSkillEffects(skillDef, effects, hero, enemy) {
    const result = {
      damage: 0,
      isCritical: false,
      isHeal: false,
      healAmount: 0,
      hit: true
    }

    const isMagicAttack = skillDef.category === 'mage'

    // 处理伤害效果
    if (effects.damageMultiplier || skillDef.damage) {
      const attackPower = isMagicAttack ? (hero.magicAttack || hero.attack) : hero.attack
      let damage = effects.damageMultiplier
        ? Math.floor(attackPower * effects.damageMultiplier)
        : skillDef.damage || 0

      // 计算暴击
      const isCritical = hero.crit > 0 && Math.random() * 100 < hero.crit
      result.isCritical = isCritical

      if (isCritical) {
        damage = Math.floor(damage * 1.5)
      }

      result.damage = damage

      // 判断闪避
      const canDodge = enemy.dodge > 0 && Math.random() * 100 < enemy.dodge

      if (canDodge) {
        result.hit = false
        this.addBattleLog(`${enemy.name} 闪避了攻击！`)
        this.emitEvent('dodge', { target: 'enemy' })
        this.statistics.recordDodged()
      } else {
        // 造成伤害
        enemy.currentHp = Math.max(0, enemy.currentHp - damage)

        const damageText = isMagicAttack ? '魔法' : '物理'
        this.addBattleLog(
          `你使用 ${skillDef.name} 对 ${enemy.name} 造成 ${damage} 点${damageText}伤害！${isCritical ? '暴击！' : ''}`
        )

        this.emitEvent('damage', {
          target: 'enemy',
          damage: damage,
          isCritical: isCritical,
          damageType: isMagicAttack ? 'magic' : 'physical'
        })

        // 记录统计
        this.statistics.recordDamageDealt(damage, isCritical)
      }
    }

    // 处理治疗效果
    if (effects.healPercent) {
      result.isHeal = true
      result.healAmount = Math.floor(hero.maxHp * effects.healPercent)
      hero.hp = Math.min(hero.maxHp, hero.hp + result.healAmount)

      this.addBattleLog(`${skillDef.name} 恢复了 ${result.healAmount} 点生命！`)
      this.emitEvent('heal', { amount: result.healAmount, type: 'hp' })

      // 记录统计
      this.statistics.recordHealing(result.healAmount, true)
    }

    return result
  }

  /**
   * 英雄攻击（兼容旧接口，委托到 executeSkill）
   * @param {number} skillIndex - 技能索引
   */
  async heroAttack(skillIndex = 0) {
    // 将 skills 对象转为数组获取技能
    const skillEntries = Object.entries(this.battle.hero.skills || {})
    const [skillId, heroSkill] = skillEntries[skillIndex] || []

    if (!heroSkill || !skillId) {
      this.addBattleLog('没有可用技能！')
      return false
    }

    return await this.executeSkill(skillId)
  }

  /**
   * 使用战斗技能（兼容旧接口，委托到 executeSkill）
   * @param {string} skillId - 技能ID
   */
  async useBattleSkill(skillId) {
    return await this.executeSkill(skillId)
  }

  /**
   * 敌方攻击
   */
  async enemyAttack() {
    console.log('[BattleSystem] enemyAttack 被调用, isBattling:', this.isBattling)
    if (!this.isBattling) return

    const enemy = this.battle.enemy
    const hero = this.battle.hero

    console.log('[BattleSystem] 敌人攻击开始:', enemy.name)

    // 触发敌人攻击动画
    this.emitEvent('enemyAttack', {})

    // 延迟后执行攻击
    await delay(400)

    // 随机选择技能
    console.log('[BattleSystem] 敌人技能列表:', enemy.skills)
    const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)]
    console.log('[BattleSystem] 选择的技能:', skill)
    if (!skill) {
      console.log('[BattleSystem] 没有可用技能，攻击取消')
      return
    }

    // 判断攻击类型（物理或魔法）
    const isMagicAttack = skill.damageType === 'magic'
    const attackPower = (isMagicAttack ? enemy.magicAttack : enemy.attack) || enemy.attack

    // 计算伤害
    const { damage, isCritical } = calculateDamage(
      attackPower,
      hero.defense,
      skill.damage
    )

    // 敌人暴击判断
    const finalIsCritical = isCritical || (enemy.crit > 0 && Math.random() * 100 < enemy.crit)

    // 计算最终伤害（暴击1.5倍）
    let finalDamage = finalIsCritical ? Math.floor(damage * 1.5) : damage

    // 判断闪避（使用英雄的闪避率）
    const canDodge = hero.dodge > 0 && Math.random() * 100 < hero.dodge

    if (canDodge) {
      this.addBattleLog(`你闪避了 ${enemy.name} 的 ${skill.name}！`)
      this.emitEvent('dodge', { target: 'hero' })
      this.statistics.recordDodge()
    } else {
      // 格挡判断（仅对物理攻击有效）
      if (!isMagicAttack && hero.block > 0) {
        const blockedDamage = Math.min(hero.block, finalDamage)
        finalDamage -= blockedDamage
        if (blockedDamage > 0) {
          this.addBattleLog(`格挡了 ${blockedDamage} 点伤害！`)
        }
      }

      // 造成伤害
      hero.hp = Math.max(0, hero.hp - finalDamage)

      const damageText = isMagicAttack ? '魔法' : '物理'
      this.addBattleLog(
        `${enemy.name} 使用 ${skill.name} 对你造成了 ${finalDamage} 点${damageText}伤害！${finalIsCritical ? '暴击！' : ''}`
      )

      this.emitEvent('damage', {
        target: 'hero',
        damage: finalDamage,
        isCritical: finalIsCritical,
        damageType: isMagicAttack ? 'magic' : 'physical'
      })

      // 记录统计
      this.statistics.recordDamageTaken(finalDamage, finalIsCritical)
    }

    // 检查战斗结束
    if (hero.hp <= 0) {
      await this.endBattle('enemy')
      return
    }

    // 切换回合
    this.battle.turn = 'hero'

    // 记录敌方回合
    this.statistics.recordTurn('enemy')

    // 减少技能冷却
    Object.values(this.battle.hero.skills || {}).forEach(skill => {
      if (skill.cooldown > 0) {
        skill.cooldown--
      }
    })

    // 回复少量MP
    hero.mp = Math.min(hero.maxMp, hero.mp + 5)

    this.emitEvent('turnChange', { turn: 'hero' })
  }

  /**
   * 使用物品
   * @param {object} item 物品对象
   */
  useItem(item) {
    if (this.battle.turn !== 'hero' || !this.isBattling) return

    const hero = this.battle.hero

    if (item.type === 'potion') {
      // 根据药剂类型恢复
      if (item.subType === 'hp') {
        const healAmount = item.value || 50
        hero.hp = Math.min(hero.maxHp, hero.hp + healAmount)
        this.addBattleLog(`使用了 ${item.name}，恢复了 ${healAmount} 点生命值！`)
        this.emitEvent('heal', { amount: healAmount })
      } else if (item.subType === 'mp') {
        const healAmount = item.value || 30
        hero.mp = Math.min(hero.maxMp, hero.mp + healAmount)
        this.addBattleLog(`使用了 ${item.name}，恢复了 ${healAmount} 点魔法值！`)
        this.emitEvent('heal', { amount: healAmount, type: 'mp' })
      } else if (item.subType === 'dual') {
        const hpAmount = (item.value && item.value.hp) || 50
        const mpAmount = (item.value && item.value.mp) || 30
        hero.hp = Math.min(hero.maxHp, hero.hp + hpAmount)
        hero.mp = Math.min(hero.maxMp, hero.mp + mpAmount)
        this.addBattleLog(`使用了 ${item.name}，恢复了 ${hpAmount} 点生命值和 ${mpAmount} 点魔法值！`)
        this.emitEvent('heal', { amount: hpAmount, mpAmount })
      }
    }
  }

  /**
   * 结束战斗
   * @param {string} winner 胜利方 'hero' or 'enemy'
   */
  async endBattle(winner) {
    this.isBattling = false

    const app = getApp()

    if (winner === 'hero') {
      // 胜利奖励
      const rewards = processDrops(this.battle.enemy.drops)

      // 计算总奖励
      let totalExp = this.battle.enemy.exp
      let totalGold = this.battle.enemy.gold

      rewards.forEach(reward => {
        if (reward.type === 'exp') totalExp += reward.amount
        if (reward.type === 'gold') totalGold += reward.amount
      })

      this.addBattleLog(`战斗胜利！获得 ${totalExp} 经验，${totalGold} 金币！`)

      // 应用奖励
      app.addExp(totalExp)
      app.globalData.hero.gold += totalGold

      // 处理物品掉落
      const { getItem } = require('../data/items')
      rewards.forEach(reward => {
        if (reward.type === 'item') {
          const item = getItem(reward.itemId)
          if (item) {
            app.addItem({ ...item, uid: Date.now() + Math.random() })
            this.addBattleLog(`获得了 ${item.name}！`)
          }
        }
      })

      // 更新英雄当前生命值
      app.globalData.hero.hp = Math.floor(this.battle.hero.hp)
      app.globalData.hero.mp = Math.floor(this.battle.hero.mp)

      // 保存游戏
      app.saveGameData()

      this.statistics.endBattle(true, false)

      this.emitEvent('victory', {
        exp: totalExp,
        gold: totalGold,
        items: rewards.filter(r => r.type === 'item'),
        statistics: this.statistics.getSummary()
      })
    } else {
      // 战败
      this.addBattleLog('战斗失败...')

      // 惩罚：返回地下城入口，生命值恢复到50%
      // 使用战斗中的 maxHp（包含装备加成）
      const maxHp = this.battle.hero.maxHp
      app.globalData.hero.hp = Math.floor(maxHp * 0.5)
      app.globalData.hero.mp = Math.floor(this.battle.hero.maxMp * 0.5)

      // 保存游戏
      app.saveGameData()

      this.statistics.endBattle(false, false)

      this.emitEvent('defeat', {
        statistics: this.statistics.getSummary()
      })
    }

    app.globalData.gameStatus = 'idle'
  }

  /**
   * 添加战斗日志
   * @param {string} message - 日志消息
   * @param {object} options - 日志选项 {icon, actor, style, badges}
   */
  addBattleLog(message, options = {}) {
    const now = new Date()
    const timeText = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const logEntry = {
      message,
      time: Date.now(),
      timeText,
      icon: options.icon || '📝',
      actor: options.actor || 'system',
      actorText: options.actorText || '',
      style: options.style || '',
      badges: options.badges || [],
      isNew: true
    }

    this.battle.logs.push(logEntry)

    // 只保留最近20条
    if (this.battle.logs.length > 20) {
      this.battle.logs.shift()
    }

    // 触发日志更新事件
    this.emitEvent('logUpdate', { log: logEntry })
  }

  /**
   * 添加伤害日志
   */
  addDamageLog(actor, target, damage, isCritical = false, isDodge = false) {
    const actorText = actor === 'hero' ? '[你]' : `[${this.battle.enemy.name}]`
    const targetName = target === 'hero' ? '你' : this.battle.enemy.name

    if (isDodge) {
      this.addBattleLog(
        `${targetName} 闪避了攻击！`,
        {
          icon: '💨',
          actor,
          actorText,
          style: 'dodge',
          badges: [{ type: 'dodge', text: '闪避' }]
        }
      )
    } else {
      const badges = []
      if (isCritical) {
        badges.push({ type: 'critical', text: '暴击' })
      }

      this.addBattleLog(
        `对 ${targetName} 造成 ${damage} 点伤害`,
        {
          icon: '⚔️',
          actor,
          actorText,
          style: 'damage',
          badges
        }
      )
    }
  }

  /**
   * 添加治疗日志
   */
  addHealLog(actor, amount, type = 'hp') {
    const actorText = actor === 'hero' ? '[你]' : `[${this.battle.enemy.name}]`

    this.addBattleLog(
      `恢复了 ${amount} 点${type === 'hp' ? '生命值' : '魔法值'}`,
      {
        icon: '💚',
        actor,
        actorText,
        style: 'heal',
        badges: [{ type: 'heal', text: type === 'hp' ? '治疗' : '回蓝' }]
      }
    )
  }

  /**
   * 添加系统日志
   */
  addSystemLog(message, icon = '⚡') {
    this.addBattleLog(message, {
      icon,
      actor: 'system',
      actorText: '[系统]',
      style: 'system'
    })
  }

  /**
   * 发送战斗事件
   */
  emitEvent(eventName, data) {
    // 优先使用直接注册的回调
    if (this.onEvent && typeof this.onEvent === 'function') {
      this.onEvent(eventName, data)
      return
    }

    // 回退到页面回调
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]

    if (currentPage && typeof currentPage.onBattleEvent === 'function') {
      currentPage.onBattleEvent(eventName, data)
    }
  }

  /**
   * 获取战斗状态
   */
  getBattleStatus() {
    return {
      isBattling: this.isBattling,
      turn: this.battle && this.battle.turn,
      hero: this.battle && this.battle.hero,
      enemy: this.battle && this.battle.enemy,
      logs: (this.battle && this.battle.logs) || [],
      statistics: this.statistics ? this.statistics.getSummary() : null
    }
  }

  /**
   * 获取战斗统计
   */
  getStatistics() {
    return this.statistics ? this.statistics.getSummary() : null
  }

  /**
   * 重置统计
   */
  resetStatistics() {
    if (this.statistics) {
      this.statistics.reset()
    }
  }

  /**
   * 逃跑
   */
  async escape() {
    if (!this.isBattling) return false

    // 50% 逃跑成功率
    if (Math.random() > 0.5) {
      this.addBattleLog('逃跑成功！')
      this.isBattling = false

      const app = getApp()
      app.globalData.hero.hp = Math.floor(this.battle.hero.hp)
      app.globalData.gameStatus = 'idle'

      this.statistics.endBattle(false, true)

      this.emitEvent('escape', {
        statistics: this.statistics.getSummary()
      })
      return true
    } else {
      this.addBattleLog('逃跑失败！')
      this.battle.turn = 'enemy'
      this.emitEvent('turnChange', { turn: 'enemy' })

      await delay(1000)
      this.enemyAttack()
      return false
    }
  }
}

module.exports = BattleSystem
