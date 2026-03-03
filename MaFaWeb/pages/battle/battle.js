// pages/battle/battle.js
const app = getApp()
const { getMonster } = require('../../data/monsters')
const BattleSystem = require('../../utils/battle-system')
const BlockDrawer = require('../../utils/canvas-draw')
const { SkillEffectDrawer } = require('../../utils/skill-effects')
const ParticleSystem = require('../../utils/particle-system')
const ScreenShake = require('../../utils/screen-shake')
const PerformanceConfig = require('../../utils/performance-config')

Page({
  data: {
    hero: {},
    enemy: {},
    battle: null,
    battleResult: null,
    hasPotion: true,
    potions: [],
    heroHpPercent: 100,
    enemyHpPercent: 100,
    heroMpPercent: 100,
    isAutoBattle: false,
    logsScrollTop: 0,
    isLastMonster: false,
    equippedSkills: [], // 装备的技能
    heroStatusEffects: [], // 英雄状态效果
    enemyStatusEffects: [] // 敌人状态效果
  },

  battleSystem: null,
  drawer: null,
  effectDrawer: null, // 技能特效绘制器
  particleSystem: null, // 粒子系统
  screenShake: null, // 屏幕震动
  canvas: null,
  ctx: null,
  dungeonId: 0,
  floor: 0,
  monstersQueue: [],
  animationId: null,
  currentAnimation: null,
  effectLoopId: null, // 特效动画循环ID
  heroOffset: { x: 0, y: 0 },
  enemyOffset: { x: 0, y: 0 },
  heroShake: 0,
  enemyShake: 0,
  attackPhase: null, // prepare, strike, recover
  enemyAttackPhase: null, // prepare, strike, recover
  damageNumbers: [], // 存储伤害数字 (兼容旧代码)
  attackEffects: [], // 存储攻击特效 (兼容旧代码)
  currentSkillEffect: null, // 当前播放的技能特效

  onLoad(options) {
    const monsterId = options.monsterId
    const isBoss = options.isBoss === 'true'
    this.dungeonId = parseInt(options.dungeonId)
    this.floor = parseInt(options.floor)

    // 加载地下城配置获取怪物队列
    const { DUNGEONS, getDungeon } = require('../../data/dungeons')
    const dungeon = getDungeon(this.dungeonId)

    // 如果不是Boss战，生成怪物队列（3个随机怪物）
    if (!isBoss && dungeon) {
      this.monstersQueue = []
      const monsterPool = dungeon.monsters || []
      for (let i = 0; i < 3; i++) {
        const randomMonsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)]
        this.monstersQueue.push(randomMonsterId)
      }
      this.setData({ isLastMonster: this.monstersQueue.length === 1 })
    } else {
      this.monstersQueue = []
      this.setData({ isLastMonster: true })
    }

    let monster = getMonster(monsterId)
    if (!monster) {
      wx.showToast({
        title: '怪物数据错误',
        icon: 'none'
      })
      return
    }

    // 确保Boss有正确的isBoss属性
    if (isBoss && !monster.isBoss) {
      monster = { ...monster, isBoss: true }
    }

    const hero = app.globalData.hero || {}
    this.setData({
      hero,
      enemy: monster,
      hasPotion: this.checkPotion(),
      potions: this.checkPotion()
    })

    // 准备Canvas
    this.initCanvas().then(() => {
      // 开始战斗
      this.startBattle(monster, isBoss)
    }).catch((err) => {
      console.error('[Battle] Canvas初始化失败:', err)
      wx.showToast({
        title: '战斗初始化失败',
        icon: 'none'
      })
    })
  },

  onUnload() {
    // 清理战斗系统
    if (this.battleSystem) {
      this.battleSystem.isBattling = false
      this.isAutoBattle = false
    }
    // 清理动画定时器
    if (this.animationId) {
      clearTimeout(this.animationId)
      this.animationId = null
    }
    // 清理特效循环
    this.stopEffectLoop()
    // 清理状态计时器
    if (this.statusTimer) {
      clearInterval(this.statusTimer)
      this.statusTimer = null
    }
    // 清理自动战斗计时器
    if (this.autoBattleTimer) {
      clearInterval(this.autoBattleTimer)
      this.autoBattleTimer = null
    }
    // 清理粒子系统
    if (this.particleSystem) {
      this.particleSystem.destroy()
      this.particleSystem = null
    }

    // 清理屏幕震动
    if (this.screenShake) {
      this.screenShake = null
    }

    // 清理Canvas上下文
    if (this.ctx) {
      this.ctx = null
    }
    if (this.canvas) {
      this.canvas = null
    }
  },

  // 检查是否有药水
  checkPotion() {
    const bag = app.globalData.bag || { items: [] }
    const items = bag.items || []
    return items.filter(item => item.type === 'potion')
  },

  // 初始化Canvas
  async initCanvas() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery()

      // 初始化战斗场景Canvas
      query.select('#battleCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0]) {
            console.error('[Battle] Canvas元素未找到')
            resolve()
            return
          }

          this.canvas = res[0].node
          this.ctx = this.canvas.getContext('2d')

          const windowInfo = wx.getWindowInfo()
          const deviceInfo = wx.getDeviceInfo()
          const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 2

          console.log('设备像素比:', dpr, 'Canvas尺寸:', res[0].width, res[0].height)

          this.canvas.width = res[0].width * dpr
          this.canvas.height = res[0].height * dpr
          this.ctx.scale(dpr, dpr)

          this.drawer = new BlockDrawer(this.canvas, this.ctx)
          this.battleSystem = new BattleSystem(app, this.canvas, this.ctx)
          this.effectDrawer = new SkillEffectDrawer(this.ctx, this.canvas)

          // 初始化粒子系统和屏幕震动
          this.particleSystem = new ParticleSystem(this.canvas, this.ctx, 50)
          this.screenShake = new ScreenShake()

          // 应用性能配置
          PerformanceConfig.apply(this.particleSystem, this.screenShake, null)

          resolve()
        })
    })
  },

  // Canvas准备完成
  onCanvasReady() {
    // Canvas已经通过onLoad中的initCanvas初始化
  },

  // 开始战斗
  async startBattle(monster, isBoss) {
    const success = await this.battleSystem.startBattle(monster)

    if (!success) {
      wx.showToast({
        title: '战斗初始化失败',
        icon: 'none'
      })
      return
    }

    // 加载装备的技能
    await this.loadEquippedSkills()

    // 绘制初始画面
    this.drawBattleScene()

    // 更新战斗状态
    this.updateBattleStatus()

    // 注册战斗事件回调
    if (this.battleSystem) {
      this.battleSystem.onEvent = (eventName, data) => {
        this.onBattleEvent(eventName, data)
      }
    }
  },

  // 加载装备的技能
  async loadEquippedSkills() {
    const app = getApp()
    const hero = app.globalData.hero || {}
    // 如果没有设置 activeSkills，默认使用所有已学习的技能
    let activeSkillIds = hero.activeSkills || []
    if (activeSkillIds.length === 0 && hero.skills) {
      // 从对象格式的 skills 中获取所有技能ID（取前4个）
      activeSkillIds = Object.keys(hero.skills).slice(0, 4)
    }

    // 获取技能详情
    const { getSkill, getSkillEffect } = require('../../data/skills')
    const heroSkills = hero.skills || {}

    const equippedSkills = await Promise.all(activeSkillIds.map(async skillId => {
      const skillDef = await getSkill(skillId)
      const heroSkill = heroSkills[skillId]

      if (!skillDef || !heroSkill) return null

      const skillEffect = await getSkillEffect(skillId, heroSkill.level)

      return {
        id: skillId,
        name: skillDef.name,
        icon: skillDef.icon,
        level: heroSkill.level,
        mpCost: skillEffect.mpCost || skillDef.mpCost,
        cooldown: 0, // 战斗开始时重置冷却
        maxCooldown: skillDef.cooldown
      }
    }))

    // 过滤掉 null 值并填充空位到4个
    const validSkills = equippedSkills.filter(Boolean)
    while (validSkills.length < 4) {
      validSkills.push(null)
    }

    this.setData({ equippedSkills: validSkills })
  },

  // 绘制战斗场景
  drawBattleScene() {
    if (!this.drawer || !this.canvas) {
      return
    }

    if (!this.data.enemy) {
      return
    }

    // 获取Canvas实际显示的CSS尺寸
    const windowInfo = wx.getWindowInfo()
    const deviceInfo = wx.getDeviceInfo()
    const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 2

    const cssWidth = this.canvas.width / dpr
    const cssHeight = this.canvas.height / dpr

    // 清空画布
    this.drawer.clear()

    // 绘制背景
    this.drawer.ctx.fillStyle = '#1a0f0a'
    this.drawer.ctx.fillRect(0, 0, cssWidth, cssHeight)

    // 角色大小 - 使用固定尺寸确保可见
    const size = 60

    // 绘制怪物（左侧）
    const enemy = this.data.enemy
    const enemyX = 80 + this.enemyOffset.x + this.enemyShake
    const enemyY = (cssHeight - size) / 2 + this.enemyOffset.y

    try {
      if (enemy.isBoss) {
        // 根据Boss ID判断类型
        let monsterType = 'skeleton'
        if (enemy.id.includes('zombie')) {
          monsterType = 'zombie'
        } else if (enemy.id.includes('final')) {
          monsterType = 'final'
        }
        this.drawer.drawBoss(enemyX, enemyY, size, enemy.color, monsterType)
      } else if (enemy.type === 'skeleton') {
        this.drawer.drawSkeleton(enemyX, enemyY, size, enemy.color)
      } else if (enemy.type === 'zombie') {
        this.drawer.drawZombie(enemyX, enemyY, size, enemy.color)
      } else if (enemy.type === 'boss') {
        // 处理type为'boss'的情况
        let monsterType = 'skeleton'
        if (enemy.id.includes('zombie')) {
          monsterType = 'zombie'
        } else if (enemy.id.includes('final')) {
          monsterType = 'final'
        }
        this.drawer.drawBoss(enemyX, enemyY, size, enemy.color, monsterType)
      } else {
        // 默认绘制骷髅
        this.drawer.drawSkeleton(enemyX, enemyY, size, '#ffffff')
      }
    } catch (e) {
      console.error('[Battle] 绘制怪物失败:', e)
    }

    // 绘制英雄（右侧）
    const heroX = cssWidth - size - 80 + this.heroOffset.x + this.heroShake
    const heroY = (cssHeight - size) / 2 + this.heroOffset.y

    try {
      this.drawer.drawHero(heroX, heroY, size)
    } catch (e) {
      console.error('[Battle] 绘制英雄失败:', e)
    }

    // 绘制伤害数字
    this.drawDamageNumbers(cssWidth, cssHeight)

    // 绘制攻击特效
    this.drawAttackEffects(cssWidth, cssHeight)

    // 绘制粒子效果
    if (this.particleSystem) {
      this.particleSystem.render()
    }

    // 更新屏幕震动
    if (this.screenShake) {
      const shake = this.screenShake.update()
      if (shake.active) {
        if (shake.target === 'hero') {
          this.heroShake = shake.x
        } else if (shake.target === 'enemy') {
          this.enemyShake = shake.x
        } else {
          // 全屏震动
          this.heroShake = shake.x * 0.5
          this.enemyShake = -shake.x * 0.5
        }
      } else {
        // 重置震动
        if (this.heroShake !== 0) this.heroShake = 0
        if (this.enemyShake !== 0) this.enemyShake = 0
      }
    }
  },

  // 绘制背景装饰元素
  drawBackgroundElements(canvasWidth, canvasHeight) {
    const ctx = this.drawer.ctx;

    // 绘制一些环境装饰（比如石柱、地面纹理等）
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';

    // 绘制底部阴影效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, canvasHeight - 30, canvasWidth, 30);

    // 绘制一些简单的装饰性线条
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = (canvasWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
  },

  // 绘制生命条和状态信息
  drawHealthBars(canvasWidth, canvasHeight) {
    const ctx = this.drawer.ctx;

    // 计算战斗状态
    const status = this.battleSystem.getBattleStatus();
    if (!status.hero || !status.enemy) return;

    // 敌人生命条 - 顶部居中
    const enemyHpPercent = Math.floor(status.enemy.currentHp / status.enemy.hp * 100);
    this.drawer.drawEnhancedHpBar(
      canvasWidth / 2 - 100,
      20,
      200,
      15,
      status.enemy.currentHp,
      status.enemy.hp,
      status.enemy.name,
      false
    );

    // 英雄生命条 - 底部居中
    const heroHpPercent = Math.floor(status.hero.hp / status.hero.maxHp * 100);
    this.drawer.drawEnhancedHpBar(
      canvasWidth / 2 - 100,
      canvasHeight - 40,
      200,
      15,
      status.hero.hp,
      status.hero.maxHp,
      '勇者',
      true
    );

    // 英雄魔法条 - 底部靠下
    this.drawer.drawEnhancedMpBar(
      canvasWidth / 2 - 100,
      canvasHeight - 20,
      200,
      10,
      status.hero.mp,
      status.hero.maxMp
    );
  },

  // 绘制伤害数字
  drawDamageNumbers(canvasWidth, canvasHeight) {
    const ctx = this.drawer.ctx

    this.damageNumbers = this.damageNumbers.filter(damage => {
      const age = Date.now() - damage.time

      if (age > 1500) {
        return false // 移除超过1.5秒的伤害数字
      }

      const progress = age / 1500
      const alpha = 1 - progress
      const yOffset = -progress * 50 // 向上飘动50像素

      const x = damage.x
      const y = damage.y + yOffset

      // 绘制伤害数字
      ctx.font = damage.isCritical ? 'bold 24px Arial' : 'bold 18px Arial'
      ctx.textAlign = 'center'

      // 阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillText(`-${damage.value}`, x + 2, y + 2)

      // 主文字
      ctx.fillStyle = damage.isCritical ?
        `rgba(255, 0, 0, ${alpha})` :
        `rgba(255, 255, 255, ${alpha})`
      ctx.fillText(`-${damage.value}`, x, y)

      // 暴击特效
      if (damage.isCritical) {
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.8})`
        ctx.font = 'bold 12px Arial'
        ctx.fillText('暴击!', x, y - 25)
      }

      return true
    })
  },

  // 绘制攻击特效
  drawAttackEffects(canvasWidth, canvasHeight) {
    const ctx = this.drawer.ctx

    this.attackEffects = this.attackEffects.filter(effect => {
      const age = Date.now() - effect.time

      if (age > 400) {
        return false // 移除超过400ms的特效
      }

      const progress = age / 400
      const alpha = 1 - progress

      // 绘制攻击轨迹
      if (effect.type === 'slash') {
        // 绘制短促的剑光轨迹
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = 4 * alpha
        ctx.beginPath()
        ctx.moveTo(effect.startX, effect.startY)
        ctx.lineTo(effect.endX, effect.endY)
        ctx.stroke()

        // 绘制剑光效果（更短更亮）
        ctx.fillStyle = `rgba(255, 223, 100, ${alpha * 0.8})`
        ctx.beginPath()
        ctx.moveTo(effect.startX, effect.startY)
        ctx.lineTo(effect.endX, effect.endY)
        // 三角形剑光
        ctx.lineTo(effect.endX + 3, effect.endY + 6)
        ctx.closePath()
        ctx.fill()

        // 添加发光效果（外圈）
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.6})`
        ctx.lineWidth = 6 * alpha
        ctx.beginPath()
        ctx.moveTo(effect.startX - 2, effect.startY - 3)
        ctx.lineTo(effect.endX + 2, effect.endY + 3)
        ctx.stroke()
      }

      return true
    })
  },

  // 添加伤害数字
  addDamageNumber(x, y, value, isCritical = false) {
    this.damageNumbers.push({
      x,
      y,
      value,
      isCritical,
      time: Date.now()
    })
  },

  // 添加攻击特效
  addAttackEffect(startX, startY, endX, endY, type = 'slash') {
    this.attackEffects.push({
      type,
      startX,
      startY,
      endX,
      endY,
      time: Date.now()
    })
  },

  // 更新战斗状态
  updateBattleStatus() {
    const status = this.battleSystem.getBattleStatus()

    // 计算生命百分比
    const heroHpPercent = status.hero ? Math.floor(status.hero.hp / status.hero.maxHp * 100) : 100
    const heroMpPercent = status.hero ? Math.floor(status.hero.mp / status.hero.maxMp * 100) : 100
    const enemyHpPercent = status.enemy ? Math.floor(status.enemy.currentHp / status.enemy.hp * 100) : 100

    this.setData({
      battle: status,
      heroHpPercent,
      heroMpPercent,
      enemyHpPercent
    })

    if (status.isBattling) {
      this.drawBattleScene()
      // 持续更新特效（伤害数字和攻击轨迹）
      this.startEffectLoop()
    }
  },

  // 启动特效动画循环
  startEffectLoop() {
    if (this.effectLoopId) {
      return // 已经在运行
    }

    const loop = () => {
      if (!this.data.battle || !this.data.battle.isBattling) {
        this.effectLoopId = null
        return
      }

      // 重新绘制场景以更新特效
      this.drawBattleScene()

      this.effectLoopId = setTimeout(loop, 30)
    }

    this.effectLoopId = setTimeout(loop, 30)
  },

  // 停止特效循环
  stopEffectLoop() {
    if (this.effectLoopId) {
      clearTimeout(this.effectLoopId)
      this.effectLoopId = null
    }
  },

  // 战斗事件回调
  onBattleEvent(eventName, data) {
    switch (eventName) {
      case 'damage':
        this.showDamageEffect(data)
        break
      case 'heal':
        this.showHealEffect(data)
        break
      case 'dodge':
        this.showDodgeEffect(data)
        break
      case 'victory':
        this.showVictory(data)
        break
      case 'defeat':
        this.showDefeat()
        break
      case 'escape':
        this.showEscape()
        break
      case 'turnChange':
        this.updateBattleStatus()
        this.scrollLogToBottom()
        this.checkAutoBattle()
        break
      case 'heroAttack':
        // 英雄攻击，等待页面处理
        break
      case 'enemyAttack':
        // 敌人攻击，等待页面处理
        this.animateEnemyAttack(() => {
          // 动画完成后继续
        })
        break
    }
  },

  // 显示伤害效果
  showDamageEffect(data) {
    this.updateBattleStatus()

    const target = data.target
    const isCritical = data.isCritical

    // 计算伤害数字显示位置
    const deviceInfo = wx.getDeviceInfo()
    const windowInfo = wx.getWindowInfo()
    const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 2
    const cssWidth = this.canvas.width / dpr
    const cssHeight = this.canvas.height / dpr

    const size = 60

    if (target === 'enemy') {
      // 敌人受伤
      const enemyX = 80 + size / 2
      const enemyY = (cssHeight - size) / 2

      // 使用旧的 damage number 系统（兼容）
      this.addDamageNumber(enemyX, enemyY - 20, data.damage, isCritical)

      // 添加粒子效果
      if (this.particleSystem) {
        if (isCritical) {
          this.particleSystem.emitCritical(enemyX, enemyY)
        } else {
          this.particleSystem.emitDamage(enemyX, enemyY, data.damage, isCritical)
        }
      }

      // 触发屏幕震动（英雄攻击敌人）
      if (this.screenShake) {
        this.screenShake.onEnemyAttack()
      }

      // 开始受伤抖动动画
      this.animateDamage('enemy')
    } else {
      // 英雄受伤
      const heroX = cssWidth - size - 80 + size / 2
      const heroY = (cssHeight - size) / 2

      // 使用旧的 damage number 系统（兼容）
      this.addDamageNumber(heroX, heroY - 20, data.damage, isCritical)

      // 添加粒子效果
      if (this.particleSystem) {
        this.particleSystem.emitDamage(heroX, heroY, data.damage, isCritical)
      }

      // 触发屏幕震动（英雄受伤）
      if (this.screenShake) {
        if (isCritical) {
          this.screenShake.onCriticalHit()
        } else {
          this.screenShake.onDamage()
        }
      }

      // 开始受伤抖动动画
      this.animateDamage('hero')
    }
  },

  // 伤害动画
  animateDamage(target) {
    let frame = 0
    const maxFrames = 8
    let maxShake = 15
    let shakeDirection = 1

    const step = () => {
      frame++

      if (target === 'enemy') {
        if (frame === 1) {
          // 第一帧：大幅度向右猛晃
          this.enemyShake = maxShake
          this.enemyOffset.x = 10 // 受击后退效果
        } else if (frame === 2) {
          // 第二帧：向左回弹
          this.enemyShake = -maxShake * 0.8
          this.enemyOffset.x = -5
        } else if (frame === 3) {
          // 第三帧：轻微右晃
          this.enemyShake = maxShake * 0.5
          this.enemyOffset.x = 3
        } else if (frame === 4) {
          // 第四帧：向左回正
          this.enemyShake = -maxShake * 0.3
          this.enemyOffset.x = -2
        } else {
          // 逐渐恢复
          this.enemyShake *= -0.5
          this.enemyOffset.x *= 0.5
        }

        if (frame >= maxFrames) {
          this.enemyShake = 0
          this.enemyOffset.x = 0
          this.drawBattleScene()
          return
        }
      } else {
        if (frame === 1) {
          this.heroShake = maxShake
          this.heroOffset.x = -8 // 受击后退效果
        } else if (frame === 2) {
          this.heroShake = -maxShake * 0.8
          this.heroOffset.x = 5
        } else if (frame === 3) {
          this.heroShake = maxShake * 0.5
          this.heroOffset.x = -3
        } else if (frame === 4) {
          this.heroShake = -maxShake * 0.3
          this.heroOffset.x = 2
        } else {
          this.heroShake *= -0.5
          this.heroOffset.x *= 0.5
        }

        if (frame >= maxFrames) {
          this.heroShake = 0
          this.heroOffset.x = 0
          this.drawBattleScene()
          return
        }
      }

      this.drawBattleScene()

      if (frame < maxFrames) {
        this.animationId = setTimeout(step, 25)
      }
    }
    step()
  },

  // 显示治疗效果
  showHealEffect(data) {
    this.setData({ hasPotion: this.checkPotion() })
    this.updateBattleStatus()

    // 添加治疗粒子效果
    if (this.particleSystem) {
      const deviceInfo = wx.getDeviceInfo()
      const windowInfo = wx.getWindowInfo()
      const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 2
      const cssWidth = this.canvas.width / dpr
      const cssHeight = this.canvas.height / dpr

      const size = 60
      const heroX = cssWidth - size - 80 + size / 2
      const heroY = (cssHeight - size) / 2

      this.particleSystem.emitHeal(heroX, heroY, data.amount)
    }
  },

  // 显示闪避效果
  showDodgeEffect(data) {
    this.updateBattleStatus()
  },

  // 显示胜利
  showVictory(data) {
    this.isAutoBattle = false
    this.setData({ isAutoBattle: false })

    // 获取元宝奖励（如果是Boss战）
    let yuanbao = 0
    if (this.data.enemy.isBoss && this.dungeonId) {
      const { getDungeon } = require('../../data/dungeons')
      const dungeon = getDungeon(this.dungeonId)
      if (dungeon && dungeon.reward) {
        yuanbao = dungeon.reward.yuanbao || 0
      }
    }

    this.setData({
      battleResult: {
        victory: true,
        exp: data.exp,
        gold: data.gold,
        yuanbao: yuanbao,
        items: data.items
      }
    })

    // 通知地下城详情页面
    const pages = getCurrentPages()
    const dungeonDetailPage = pages.find(page => page.route === 'pages/dungeon-detail/dungeon-detail')
    if (dungeonDetailPage && typeof dungeonDetailPage.onBattleWin === 'function') {
      const isBoss = this.data.enemy.isBoss
      dungeonDetailPage.onBattleWin(isBoss)
    }
  },

  // 显示失败
  showDefeat() {
    this.isAutoBattle = false
    this.setData({ isAutoBattle: false })

    this.setData({
      battleResult: {
        victory: false
      }
    })
  },

  // 显示逃跑
  showEscape() {
    this.isAutoBattle = false
    this.setData({ isAutoBattle: false })

    this.setData({
      battleResult: {
        victory: false,
        escaped: true
      }
    })
  },

  // 英雄普通攻击
  heroAttack() {
    if (!this.battleSystem || !this.data.battle) return
    if (this.data.battle.turn !== 'hero') return

    // 攻击动画
    this.animateHeroAttack(() => {
      this.battleSystem.heroAttack()
    })
  },

  // 使用技能
  useSkill(e) {
    const skillId = e.currentTarget.dataset.skillid
    const index = e.currentTarget.dataset.index

    if (!skillId) return

    const skill = this.data.equippedSkills[index]
    if (!skill) return

    // 检查冷却
    if (skill.cooldown > 0) {
      wx.showToast({
        title: `技能冷却中 (${skill.cooldown}回合)`,
        icon: 'none'
      })
      return
    }

    // 检查MP
    if (this.data.battle.hero.mp < skill.mpCost) {
      wx.showToast({
        title: 'MP不足',
        icon: 'none'
      })
      return
    }

    // 设置冷却
    const equippedSkills = this.data.equippedSkills
    equippedSkills[index].cooldown = skill.maxCooldown
    this.setData({ equippedSkills })

    // 播放技能特效
    this.playSkillEffect(skillId)

    // 攻击动画
    this.animateHeroAttack(() => {
      this.battleSystem.useBattleSkill(skillId)
    })
  },

  // 播放技能特效
  playSkillEffect(skillId) {
    if (!this.effectDrawer) return

    const { getSkill } = require('../../data/skills')
    const skillDef = getSkill(skillId)
    if (!skillDef) return

    // 获取英雄和敌人位置
    const heroX = 80 + (this.heroOffset?.x || 0)
    const heroY = 120 + (this.heroOffset?.y || 0)
    const enemyX = 220 + (this.enemyOffset?.x || 0)
    const enemyY = 120 + (this.enemyOffset?.y || 0)

    // 设置当前特效
    this.currentSkillEffect = {
      skillId,
      startTime: Date.now(),
      duration: 800, // 特效持续时间ms
      startX: heroX,
      startY: heroY,
      endX: enemyX,
      endY: enemyY,
      x: heroX,
      y: heroY
    }

    // 开始特效动画
    this.startSkillEffectLoop()
  },

  // 技能特效动画循环
  startSkillEffectLoop() {
    if (!this.currentSkillEffect) return

    const now = Date.now()
    const elapsed = now - this.currentSkillEffect.startTime
    const progress = Math.min(1, elapsed / this.currentSkillEffect.duration)

    // 绘制特效
    this.effectDrawer.drawSkillEffect(this.currentSkillEffect.skillId, {
      startX: this.currentSkillEffect.startX,
      startY: this.currentSkillEffect.startY,
      endX: this.currentSkillEffect.endX,
      endY: this.currentSkillEffect.endY,
      progress: progress,
      x: this.currentSkillEffect.x,
      y: this.currentSkillEffect.y
    })

    // 继续动画或结束
    if (progress < 1) {
      setTimeout(() => this.startSkillEffectLoop(), 16) // 约60fps
    } else {
      this.currentSkillEffect = null
    }
  },

  // 显示药水菜单
  showPotionMenu() {
    const potions = this.data.potions || []

    if (potions.length === 0) {
      wx.showToast({
        title: '没有药水了',
        icon: 'none'
      })
      return
    }

    const itemList = potions.map(item => {
      return `${item.name} (${this.getPotionEffectText(item)})`
    })

    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedIndex = res.tapIndex
        const selectedItem = potions[selectedIndex]
        this.usePotion(selectedItem)
      }
    })
  },

  // 获取药水效果描述
  getPotionEffectText(item) {
    if (item.subType === 'hp') {
      return `HP+${item.value}`
    } else if (item.subType === 'mp') {
      return `MP+${item.value}`
    } else if (item.subType === 'dual') {
      return `HP+${item.value.hp}/MP+${item.value.mp}`
    }
    return ''
  },

  // 使用药水
  usePotion(item) {
    this.battleSystem.useItem(item)

    // 从背包移除物品
    const bag = app.globalData.bag || { items: [] }
    const items = bag.items || []
    const index = items.findIndex(i => i.uid === item.uid)
    if (index !== -1) {
      items.splice(index, 1)
      app.saveGameData()
    }

    // 更新药水列表
    this.setData({
      potions: this.checkPotion()
    })
  },

  // 逃跑
  escape() {
    this.battleSystem.escape()
  },

  // 切换自动战斗
  toggleAutoBattle(e) {
    this.isAutoBattle = e.detail.value
    this.setData({ isAutoBattle: e.detail.value })

    if (this.isAutoBattle && this.data.battle.turn === 'hero') {
      this.autoBattle()
    }
  },

  // 自动战斗逻辑
  async autoBattle() {
    if (!this.isAutoBattle || !this.battleSystem) return

    const status = this.battleSystem.getBattleStatus()
    if (!status.isBattling || status.turn !== 'hero') return

    // 简单的AI：优先使用可用技能
    const skills = status.hero.skills
    const availableSkill = skills.find(skill =>
      skill.mpCost <= status.hero.mp && skill.cooldown === 0
    )

    if (availableSkill) {
      const skillIndex = skills.indexOf(availableSkill)
      await this.battleSystem.heroAttack(skillIndex)
    }

    // 如果还有MP且有技能，继续自动战斗
    if (this.isAutoBattle && status.hero.mp > 0) {
      // 等待下一回合
      setTimeout(() => {
        const newStatus = this.battleSystem.getBattleStatus()
        if (newStatus.isBattling && newStatus.turn === 'hero') {
          this.autoBattle()
        }
      }, 1500)
    }
  },

  // 英雄攻击动画
  animateHeroAttack(callback) {
    const enemy = this.data.enemy
    const deviceInfo = wx.getDeviceInfo()
    const windowInfo = wx.getWindowInfo()
    const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 2
    const cssWidth = this.canvas.width / dpr
    const cssHeight = this.canvas.height / dpr

    const size = 60
    const heroBaseX = cssWidth - size - 80
    const heroBaseY = (cssHeight - size) / 2
    const enemyBaseX = 80
    const enemyBaseY = (cssHeight - size) / 2

    let progress = 0
    const attackDistance = 60
    const totalFrames = 25
    let currentFrame = 0
    this.attackPhase = 'prepare'
    let hasTriggeredEffect = false

    const animate = () => {
      currentFrame++
      progress = currentFrame / totalFrames

      if (progress <= 0.15) {
        // 准备阶段：蓄力动作
        this.attackPhase = 'prepare'
        this.heroOffset.x = -Math.sin(progress * Math.PI * 6) * 15
        this.heroOffset.y = 8 * Math.sin(progress * 3 * Math.PI) // 添加上下浮动
      } else if (progress <= 0.4) {
        // 冲刺阶段：快速前进
        this.attackPhase = 'strike'
        const strikeProgress = (progress - 0.15) / 0.25

        this.heroOffset.x = Math.sin(strikeProgress * Math.PI) * attackDistance
        this.heroOffset.y = -Math.sin(strikeProgress * Math.PI) * 20

        // 触发多重攻击特效
        if (strikeProgress >= 0.3 && !hasTriggeredEffect) {
          hasTriggeredEffect = true

          // 绘制多重攻击轨迹
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              const weaponX = heroBaseX + this.heroOffset.x + size * 0.7
              const weaponY = heroBaseY + this.heroOffset.y + size * 0.5
              const effectEndX = enemyBaseX + size * 0.6
              const effectEndY = enemyBaseY + size * 0.5 + (Math.random() - 0.5) * 20

              this.addAttackEffect(weaponX, weaponY, effectEndX, effectEndY, 'slash')
            }, i * 50)
          }
        }
      } else {
        // 恢复阶段：回位
        this.attackPhase = 'recover'
        const recoverProgress = (progress - 0.4) / 0.6
        this.heroOffset.x = -Math.sin(recoverProgress * Math.PI) * 12
        this.heroOffset.y = Math.sin(recoverProgress * Math.PI) * 8
      }

      this.drawBattleScene()

      if (currentFrame < totalFrames) {
        this.animationId = setTimeout(animate, 18) // 提高帧率
      } else {
        // 重置位置并执行回调
        this.heroOffset.x = 0
        this.heroOffset.y = 0
        this.attackPhase = null
        this.drawBattleScene()
        if (callback) callback()
      }
    }

    // 取消之前的动画
    if (this.animationId) {
      clearTimeout(this.animationId)
    }

    animate()
  },

  // 检查自动战斗
  checkAutoBattle() {
    if (this.isAutoBattle && this.data.battle.turn === 'hero') {
      setTimeout(() => {
        this.autoBattle()
      }, 500)
    }
  },

  // 滚动日志到底部
  scrollLogToBottom() {
    const logs = this.data.battle?.logs || []
    if (logs.length > 0) {
      this.setData({
        logsScrollTop: 999999
      })
    }
  },

  // 敌人攻击动画
  animateEnemyAttack(callback) {
    const enemy = this.data.enemy
    const deviceInfo = wx.getDeviceInfo()
    const windowInfo = wx.getWindowInfo()
    const dpr = deviceInfo.pixelRatio || windowInfo.pixelRatio || 2
    const cssWidth = this.canvas.width / dpr
    const cssHeight = this.canvas.height / dpr

    const size = 60
    const enemyBaseX = 80
    const enemyBaseY = (cssHeight - size) / 2
    const heroBaseX = cssWidth - size - 80
    const heroBaseY = (cssHeight - size) / 2

    let progress = 0
    const attackDistance = 55
    const totalFrames = 22
    let currentFrame = 0
    this.enemyAttackPhase = 'prepare'
    let hasTriggeredEffect = false

    const animate = () => {
      currentFrame++
      progress = currentFrame / totalFrames

      if (progress <= 0.2) {
        // 准备阶段：向后退，准备攻击姿势
        this.enemyAttackPhase = 'prepare'
        this.enemyOffset.x = -Math.sin(progress * Math.PI * 5) * 12
        this.enemyOffset.y = 5 + 8 * Math.sin(progress * 3 * Math.PI) // 添加上下浮动
      } else if (progress <= 0.5) {
        // 攻击阶段：快速向前冲刺
        this.enemyAttackPhase = 'strike'
        const strikeProgress = (progress - 0.2) / 0.3

        this.enemyOffset.x = Math.sin(strikeProgress * Math.PI) * attackDistance
        this.enemyOffset.y = -Math.sin(strikeProgress * Math.PI) * 15

        // 在攻击中间触发特效
        if (strikeProgress >= 0.4 && !hasTriggeredEffect) {
          hasTriggeredEffect = true

          // 绘制多重攻击轨迹
          for (let i = 0; i < 2; i++) {
            setTimeout(() => {
              // 敌人的武器位置（左手）
              const weaponX = enemyBaseX + this.enemyOffset.x + size * 0.2
              const weaponY = enemyBaseY + this.enemyOffset.y + size * 0.4
              // 特效终点在英雄前方一点
              const effectEndX = heroBaseX + size * 0.35
              const effectEndY = heroBaseY + size * 0.5 + (Math.random() - 0.5) * 15

              this.addAttackEffect(weaponX, weaponY, effectEndX, effectEndY, 'slash')
            }, i * 60)
          }
        }
      } else {
        // 恢复阶段：缓慢退回
        this.enemyAttackPhase = 'recover'
        const recoverProgress = (progress - 0.5) / 0.5
        this.enemyOffset.x = -Math.sin(recoverProgress * Math.PI) * 10
        this.enemyOffset.y = Math.sin(recoverProgress * Math.PI) * 5
      }

      this.drawBattleScene()

      if (currentFrame < totalFrames) {
        this.animationId = setTimeout(animate, 20)
      } else {
        // 重置位置并执行回调
        this.enemyOffset.x = 0
        this.enemyOffset.y = 0
        this.enemyAttackPhase = null
        this.drawBattleScene()
        if (callback) callback()
      }
    }

    // 取消之前的动画
    if (this.animationId) {
      clearTimeout(this.animationId)
    }

    animate()
  },

  // 下一战
  nextBattle() {
    if (this.monstersQueue.length > 0) {
      // 获取下一个怪物
      const nextMonsterId = this.monstersQueue.shift()
      const nextMonster = getMonster(nextMonsterId)

      if (nextMonster) {
        // 先确保Canvas已初始化
        if (!this.canvas || !this.drawer) {
          // 如果Canvas未初始化，先初始化
          this.initCanvas().then(() => {
            this.startNextBattle(nextMonster)
          })
        } else {
          this.startNextBattle(nextMonster)
        }
      }
    }
  },

  // 开始下一场战斗
  startNextBattle(nextMonster) {
    // 更新状态
    this.setData({
      enemy: nextMonster,
      battleResult: null,
      isLastMonster: this.monstersQueue.length === 0
    }, () => {
      // 等待页面渲染完成后，重新初始化 Canvas 并开始战斗
      setTimeout(() => {
        // 重新获取 Canvas 并初始化
        this.initCanvas().then(() => {
          // 开始新战斗
          this.battleSystem.startBattle(nextMonster).then(() => {
            this.drawBattleScene()
            this.updateBattleStatus()

            // 如果开启自动战斗，继续自动
            if (this.isAutoBattle) {
              setTimeout(() => {
                this.checkAutoBattle()
              }, 500)
            }
          })
        })
      }, 100)
    })
  },

  // 返回地下城
  returnToDungeon() {
    this.isAutoBattle = false

    // 清除地下城页面的探索浮层状态
    const pages = getCurrentPages()
    const dungeonPage = pages.find(page => page.route === 'pages/dungeon/dungeon')
    if (dungeonPage) {
      dungeonPage.setData({
        exploreResult: null
      })
    }

    wx.navigateBack()
  },

  // ========== 状态效果管理 ==========

  /**
   * 添加状态效果
   * @param {string} target - 'hero' 或 'enemy'
   * @param {object} effect - 效果对象 {id, name, icon, type, duration}
   */
  addStatusEffect(target, effect) {
    const key = target === 'hero' ? 'heroStatusEffects' : 'enemyStatusEffects'
    const currentEffects = this.data[key]

    // 检查是否已存在相同效果，如果存在则刷新持续时间
    const existingIndex = currentEffects.findIndex(e => e.id === effect.id)
    if (existingIndex >= 0) {
      currentEffects[existingIndex].duration = effect.duration
      this.setData({ [key]: [...currentEffects] })
    } else {
      // 限制最多6个状态效果
      if (currentEffects.length >= 6) {
        currentEffects.shift() // 移除最旧的效果
      }
      this.setData({ [key]: [...currentEffects, effect] })
    }
  },

  /**
   * 移除状态效果
   * @param {string} target - 'hero' 或 'enemy'
   * @param {string} effectId - 效果ID
   */
  removeStatusEffect(target, effectId) {
    const key = target === 'hero' ? 'heroStatusEffects' : 'enemyStatusEffects'
    const currentEffects = this.data[key]
    const newEffects = currentEffects.filter(e => e.id !== effectId)
    this.setData({ [key]: newEffects })
  },

  /**
   * 更新状态效果持续时间（在回合结束时调用）
   * @param {string} target - 'hero' 或 'enemy'
   */
  updateStatusEffectsDuration(target) {
    const key = target === 'hero' ? 'heroStatusEffects' : 'enemyStatusEffects'
    const currentEffects = this.data[key]

    const updatedEffects = currentEffects
      .map(effect => ({
        ...effect,
        duration: effect.duration - 1
      }))
      .filter(effect => effect.duration > 0)

    this.setData({ [key]: updatedEffects })
  },

  /**
   * 清除所有状态效果
   */
  clearAllStatusEffects() {
    this.setData({
      heroStatusEffects: [],
      enemyStatusEffects: []
    })
  },

  /**
   * 获取状态效果图标
   * @param {string} effectType - 效果类型
   * @returns {string} 图标字符
   */
  getStatusEffectIcon(effectType) {
    const iconMap = {
      // Buffs
      attackUp: '⚔️',
      defenseUp: '🛡️',
      speedUp: '💨',
      regen: '💚',
      shield: '🔰',
      focus: '🎯',

      // Debuffs
      poison: '☠️',
      burn: '🔥',
      freeze: '❄️',
      stun: '💫',
      attackDown: '💔',
      defenseDown: '📉',
      slow: '🐌',

      // 中性
      reflect: '🔮',
      invisible: '👻',
      berserk: '😤'
    }

    return iconMap[effectType] || '✨'
  }
})
