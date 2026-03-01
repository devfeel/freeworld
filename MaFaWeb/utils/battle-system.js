// 战斗系统
const { calculateDamage, checkDodge, processDrops, delay } = require('./game-utils')
const { getSkill, getSkillEffect, SKILL_TYPES } = require('../data/skills')

class BattleSystem {
  constructor(app, canvas, ctx) {
    this.app = app
    this.canvas = canvas
    this.ctx = ctx
    this.battle = null
    this.turn = 'hero' // 'hero' or 'enemy'
    this.isBattling = false
    this.animationFrame = null
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
   * 英雄攻击
   * @param {number} skillIndex 技能索引
   */
  async heroAttack(skillIndex = 0) {
    if (this.battle.turn !== 'hero' || !this.isBattling) return

    // 将 skills 对象转为数组获取技能
    const skillEntries = Object.entries(this.battle.hero.skills || {})
    const [skillId, heroSkill] = skillEntries[skillIndex] || []
    if (!heroSkill || !skillId) return

    // 获取技能定义（包含名称等完整信息）
    const { getSkill, getSkillEffect } = require('../data/skills')
    const skillDef = await getSkill(skillId)
    if (!skillDef) {
      this.addBattleLog('技能数据错误！')
      return
    }

    // 获取技能效果
    const effects = getSkillEffect(skillId, heroSkill.level)
    const mpCost = effects.mpCost || skillDef.mpCost || 0

    // 检查MP
    if (mpCost > this.battle.hero.mp) {
      this.addBattleLog('MP不足！')
      return
    }

    // 消耗MP
    this.battle.hero.mp -= mpCost

    // 技能冷却
    if (heroSkill.cooldown > 0) {
      this.addBattleLog(`技能冷却中，还需 ${heroSkill.cooldown} 回合`)
      return
    }

    // 设置冷却
    const maxCooldown = skillDef.cooldown || 0
    if (maxCooldown > 0) {
      heroSkill.cooldown = maxCooldown
    }

    // 触发攻击动画
    this.emitEvent('heroAttack', { skillId, skillName: skillDef.name })

    const hero = this.battle.hero
    const enemy = this.battle.enemy

    // 判断攻击类型（物理或魔法）
    const isMagicAttack = skillDef.category === 'mage'
    const attackPower = isMagicAttack ? (hero.magicAttack || hero.attack) : hero.attack

    // 计算伤害
    const { damage, isCritical } = calculateDamage(
      attackPower,
      enemy.defense,
      skill.damage
    )

    // 暴击判断（使用暴击率）
    const finalIsCritical = isCritical || (hero.crit > 0 && Math.random() * 100 < hero.crit)

    // 计算最终伤害（暴击1.5倍）
    const finalDamage = finalIsCritical ? Math.floor(damage * 1.5) : damage

    // 判断闪避（使用闪避率，考虑敌人精准）
    // 未来可添加 accuracy 属性降低敌人闪避概率
    const canDodge = enemy.dodge > 0 && Math.random() * 100 < enemy.dodge

    if (canDodge) {
      this.addBattleLog(`${enemy.name} 闪避了攻击！`)
      this.emitEvent('dodge', { target: 'enemy' })
    } else {
      // 造成伤害
      enemy.currentHp = Math.max(0, enemy.currentHp - finalDamage)

      const damageText = isMagicAttack ? '魔法' : '物理'
      this.addBattleLog(
        `你使用 ${skillDef.name} 对 ${enemy.name} 造成了 ${finalDamage} 点${damageText}伤害！${finalIsCritical ? '暴击！' : ''}`
      )

      this.emitEvent('damage', {
        target: 'enemy',
        damage: finalDamage,
        isCritical: finalIsCritical,
        damageType: isMagicAttack ? 'magic' : 'physical'
      })

      // ========== 未来可扩展：吸血等效果 ==========
      // 例如：
      // if (hero.lifeSteal > 0 && damage > 0) {
      //   const healAmount = Math.floor(damage * hero.lifeSteal / 100)
      //   hero.hp = Math.min(hero.maxHp, hero.hp + healAmount)
      //   this.addBattleLog(`吸血回复了 ${healAmount} 点生命！`)
      //   this.emitEvent('heal', { amount: healAmount })
      // }
    }

    // 检查战斗结束
    if (enemy.currentHp <= 0) {
      await this.endBattle('hero')
      return
    }

    // 切换回合
    this.battle.turn = 'enemy'
    this.emitEvent('turnChange', { turn: 'enemy' })

    // 延迟后敌方行动
    await delay(1000)
    this.enemyAttack()
  }

  /**
   * 使用战斗技能（新技能系统）
   * @param {string} skillId 技能ID
   */
  async useBattleSkill(skillId) {
    if (this.battle.turn !== 'hero' || !this.isBattling) return

    const { getSkill, getSkillEffect } = require('../data/skills')
    const skillDef = getSkill(skillId)

    if (!skillDef) return

    const heroSkill = this.app.globalData.hero.skills[skillId]
    if (!heroSkill) return

    const effects = getSkillEffect(skillId, heroSkill.level)
    const mpCost = effects.mpCost || skillDef.mpCost

    // 检查MP
    if (this.battle.hero.mp < mpCost) {
      this.addBattleLog('MP不足！')
      return
    }

    // 消耗MP
    this.battle.hero.mp -= mpCost

    // 触发攻击动画
    this.emitEvent('heroAttack', { skillId, skillName: skillDef.name })

    const hero = this.battle.hero
    const enemy = this.battle.enemy

    // 根据技能类型处理效果
    let damage = 0
    let isHeal = false
    let healAmount = 0

    // 处理不同技能效果
    if (effects.damageMultiplier) {
      const isMagicAttack = skillDef.category === 'mage'
      const attackPower = isMagicAttack ? (hero.magicAttack || hero.attack) : hero.attack
      damage = Math.floor(attackPower * effects.damageMultiplier)

      // 暴击判断
      const isCritical = hero.crit > 0 && Math.random() * 100 < hero.crit
      if (isCritical) {
        damage = Math.floor(damage * 1.5)
      }

      // 应用伤害
      enemy.currentHp = Math.max(0, enemy.currentHp - damage)

      this.addBattleLog(
        `你使用 ${skillDef.name} 对 ${enemy.name} 造成 ${damage} 点伤害！${isCritical ? '暴击！' : ''}`
      )

      this.emitEvent('damage', {
        target: 'enemy',
        damage: damage,
        isCritical: isCritical,
        element: effects.element || 'physical'
      })
    }

    // 治疗技能
    if (effects.healPercent) {
      isHeal = true
      healAmount = Math.floor(hero.maxHp * effects.healPercent)
      hero.hp = Math.min(hero.maxHp, hero.hp + healAmount)

      this.addBattleLog(`${skillDef.name} 恢复了 ${healAmount} 点生命！`)
      this.emitEvent('heal', { amount: healAmount })
    }

    // 检查战斗结束
    if (enemy.currentHp <= 0) {
      await this.endBattle('hero')
      return
    }

    // 切换回合
    this.battle.turn = 'enemy'
    this.emitEvent('turnChange', { turn: 'enemy' })

    // 延迟后敌方行动
    await delay(1000)
    this.enemyAttack()
  }

  /**
   * 敌方攻击
   */
  async enemyAttack() {
    if (!this.isBattling) return

    const enemy = this.battle.enemy
    const hero = this.battle.hero

    // 触发敌人攻击动画
    this.emitEvent('enemyAttack', {})

    // 延迟后执行攻击
    await delay(400)

    // 随机选择技能
    const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)]
    if (!skill) return

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
    }

    // 检查战斗结束
    if (hero.hp <= 0) {
      await this.endBattle('enemy')
      return
    }

    // 切换回合
    this.battle.turn = 'hero'

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

      this.emitEvent('victory', {
        exp: totalExp,
        gold: totalGold,
        items: rewards.filter(r => r.type === 'item')
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

      this.emitEvent('defeat', {})
    }

    app.globalData.gameStatus = 'idle'
  }

  /**
   * 添加战斗日志
   */
  addBattleLog(message) {
    this.battle.logs.push({
      message,
      time: Date.now()
    })

    // 只保留最近20条
    if (this.battle.logs.length > 20) {
      this.battle.logs.shift()
    }
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
      logs: (this.battle && this.battle.logs) || []
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

      this.emitEvent('escape', {})
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
