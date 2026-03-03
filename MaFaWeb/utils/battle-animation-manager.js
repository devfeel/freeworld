/**
 * BattleAnimationManager - 战斗动画管理器
 * 统一管理所有战斗动画，支持动画队列、优先级和自动清理
 */

class BattleAnimationManager {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.animations = []
    this.isRunning = false
    this.animationId = null
    this.lastFrameTime = 0

    // 动画配置
    this.config = {
      damageNumberDuration: 1500,
      damageNumberFloatHeight: 50,
      effectDuration: 400,
      maxConcurrentAnimations: 20
    }

    // 动画对象池（避免频繁创建对象）
    this.damageNumberPool = []
    this.effectPool = []
    this.maxPoolSize = 30
  }

  /**
   * 添加伤害数字动画
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} value - 伤害值
   * @param {boolean} isCritical - 是否暴击
   * @param {boolean} isHeal - 是否治疗
   */
  addDamageNumber(x, y, value, isCritical = false, isHeal = false) {
    const damageNumber = this.getDamageNumberFromPool()
    damageNumber.x = x
    damageNumber.y = y
    damageNumber.value = value
    damageNumber.isCritical = isCritical
    damageNumber.isHeal = isHeal
    damageNumber.startTime = Date.now()
    damageNumber.isActive = true

    this.animations.push({
      type: 'damageNumber',
      data: damageNumber,
      priority: isCritical ? 2 : 1
    })

    this.startIfNeeded()
  }

  /**
   * 添加攻击特效
   * @param {number} startX - 起始X坐标
   * @param {number} startY - 起始Y坐标
   * @param {number} endX - 结束X坐标
   * @param {number} endY - 结束Y坐标
   * @param {string} type - 特效类型 (slash, magic, arrow等)
   */
  addAttackEffect(startX, startY, endX, endY, type = 'slash') {
    const effect = this.getEffectFromPool()
    effect.startX = startX
    effect.startY = startY
    effect.endX = endX
    effect.endY = endY
    effect.type = type
    effect.startTime = Date.now()
    effect.isActive = true

    this.animations.push({
      type: 'attackEffect',
      data: effect,
      priority: 1
    })

    this.startIfNeeded()
  }

  /**
   * 添加技能特效
   * @param {string} skillId - 技能ID
   * @param {object} positions - 位置信息 {startX, startY, endX, endY}
   * @param {number} duration - 持续时间(ms)
   */
  addSkillEffect(skillId, positions, duration = 800) {
    this.animations.push({
      type: 'skillEffect',
      data: {
        skillId,
        ...positions,
        startTime: Date.now(),
        duration,
        isActive: true
      },
      priority: 3
    })

    this.startIfNeeded()
  }

  /**
   * 添加屏幕震动效果
   * @param {string} target - 震动目标 ('hero' | 'enemy' | 'screen')
   * @param {number} intensity - 震动强度 (1-3)
   * @param {number} duration - 持续时间(ms)
   */
  addShake(target, intensity = 2, duration = 500) {
    this.animations.push({
      type: 'shake',
      data: {
        target,
        intensity,
        duration,
        startTime: Date.now(),
        isActive: true
      },
      priority: 2
    })

    this.startIfNeeded()
  }

  /**
   * 启动动画循环（如果未运行）
   */
  startIfNeeded() {
    if (!this.isRunning) {
      this.isRunning = true
      this.lastFrameTime = Date.now()
      this.animationLoop()
    }
  }

  /**
   * 动画主循环 - 使用 requestAnimationFrame
   */
  animationLoop() {
    if (!this.isRunning || this.animations.length === 0) {
      this.isRunning = false
      this.animationId = null
      return
    }

    const currentTime = Date.now()
    const deltaTime = currentTime - this.lastFrameTime
    this.lastFrameTime = currentTime

    // 按优先级排序动画
    this.animations.sort((a, b) => b.priority - a.priority)

    // 限制并发动画数量
    const activeAnimations = this.animations.slice(0, this.config.maxConcurrentAnimations)

    // 更新和绘制动画
    for (let i = activeAnimations.length - 1; i >= 0; i--) {
      const animation = activeAnimations[i]
      const isComplete = this.updateAnimation(animation, currentTime)

      if (isComplete) {
        this.recycleAnimation(animation)
        this.animations.splice(this.animations.indexOf(animation), 1)
      }
    }

    // 继续下一帧
    this.animationId = requestAnimationFrame(() => this.animationLoop())
  }

  /**
   * 更新单个动画
   * @param {object} animation - 动画对象
   * @param {number} currentTime - 当前时间
   * @returns {boolean} 是否完成
   */
  updateAnimation(animation, currentTime) {
    const { type, data } = animation

    switch (type) {
      case 'damageNumber':
        return this.updateDamageNumber(data, currentTime)
      case 'attackEffect':
        return this.updateAttackEffect(data, currentTime)
      case 'skillEffect':
        return this.updateSkillEffect(data, currentTime)
      case 'shake':
        return this.updateShake(data, currentTime)
      default:
        return true
    }
  }

  /**
   * 更新伤害数字动画
   */
  updateDamageNumber(data, currentTime) {
    const age = currentTime - data.startTime

    if (age > this.config.damageNumberDuration) {
      return true // 动画完成
    }

    const progress = age / this.config.damageNumberDuration
    const alpha = 1 - progress
    const yOffset = -progress * this.config.damageNumberFloatHeight

    const x = data.x
    const y = data.y + yOffset

    // 绘制阴影
    this.ctx.font = data.isCritical ? 'bold 24px Arial' : 'bold 18px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillText(`${data.isHeal ? '+' : '-'}${data.value}`, x + 2, y + 2)

    // 绘制主文字
    if (data.isHeal) {
      this.ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`
    } else if (data.isCritical) {
      this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`
    } else {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    }
    this.ctx.fillText(`-${data.value}`, x, y)

    // 暴击特效
    if (data.isCritical && !data.isHeal) {
      this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.8})`
      this.ctx.font = 'bold 12px Arial'
      this.ctx.fillText('暴击!', x, y - 25)
    }

    return false
  }

  /**
   * 更新攻击特效
   */
  updateAttackEffect(data, currentTime) {
    const age = currentTime - data.startTime

    if (age > this.config.effectDuration) {
      return true
    }

    const progress = age / this.config.effectDuration
    const alpha = 1 - progress

    if (data.type === 'slash') {
      // 绘制剑光轨迹
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
      this.ctx.lineWidth = 4 * alpha
      this.ctx.beginPath()
      this.ctx.moveTo(data.startX, data.startY)
      this.ctx.lineTo(data.endX, data.endY)
      this.ctx.stroke()

      // 绘制发光效果
      this.ctx.fillStyle = `rgba(255, 223, 100, ${alpha * 0.8})`
      this.ctx.beginPath()
      this.ctx.moveTo(data.startX, data.startY)
      this.ctx.lineTo(data.endX, data.endY)
      this.ctx.lineTo(data.endX + 3, data.endY + 6)
      this.ctx.closePath()
      this.ctx.fill()

      // 外圈发光
      this.ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.6})`
      this.ctx.lineWidth = 6 * alpha
      this.ctx.beginPath()
      this.ctx.moveTo(data.startX - 2, data.startY - 3)
      this.ctx.lineTo(data.endX + 2, data.endY + 3)
      this.ctx.stroke()
    }

    return false
  }

  /**
   * 更新技能特效
   */
  updateSkillEffect(data, currentTime) {
    const age = currentTime - data.startTime

    if (age > data.duration) {
      return true
    }

    const progress = age / data.duration

    // 基础技能特效绘制（可由具体技能扩展）
    const x = data.startX + (data.endX - data.startX) * progress
    const y = data.startY + (data.endY - data.startY) * progress

    // 绘制技能光球
    const radius = 10 * (1 - progress * 0.5)
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${1 - progress})`)
    gradient.addColorStop(0.5, `rgba(255, 100, 50, ${0.8 - progress * 0.8})`)
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)')

    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()

    return false
  }

  /**
   * 更新震动效果
   */
  updateShake(data, currentTime) {
    const age = currentTime - data.startTime

    if (age > data.duration) {
      return true
    }

    const progress = age / data.duration
    const decay = 1 - progress

    // 震动逻辑由外部处理，这里只返回是否完成
    // 实际偏移计算在 battle.js 中进行
    return false
  }

  /**
   * 获取震动偏移量
   * @param {string} target - 目标
   * @returns {object} {x, y} 偏移量
   */
  getShakeOffset(target) {
    const shakeAnimation = this.animations.find(
      a => a.type === 'shake' && a.data.target === target && a.data.isActive
    )

    if (!shakeAnimation) {
      return { x: 0, y: 0 }
    }

    const data = shakeAnimation.data
    const age = Date.now() - data.startTime
    const progress = age / data.duration
    const decay = 1 - progress

    const intensityMap = { 1: 5, 2: 10, 3: 15 }
    const maxShake = intensityMap[data.intensity] || 10

    // 使用正弦波产生震动效果
    const shakeX = Math.sin(age * 0.1) * maxShake * decay
    const shakeY = Math.cos(age * 0.15) * maxShake * 0.5 * decay

    return { x: shakeX, y: shakeY }
  }

  /**
   * 从对象池获取伤害数字对象
   */
  getDamageNumberFromPool() {
    if (this.damageNumberPool.length > 0) {
      return this.damageNumberPool.pop()
    }
    return {
      x: 0, y: 0, value: 0,
      isCritical: false, isHeal: false,
      startTime: 0, isActive: false
    }
  }

  /**
   * 从对象池获取特效对象
   */
  getEffectFromPool() {
    if (this.effectPool.length > 0) {
      return this.effectPool.pop()
    }
    return {
      startX: 0, startY: 0, endX: 0, endY: 0,
      type: 'slash', startTime: 0, isActive: false
    }
  }

  /**
   * 回收动画对象到对象池
   */
  recycleAnimation(animation) {
    animation.data.isActive = false

    if (animation.type === 'damageNumber') {
      if (this.damageNumberPool.length < this.maxPoolSize) {
        this.damageNumberPool.push(animation.data)
      }
    } else if (animation.type === 'attackEffect') {
      if (this.effectPool.length < this.maxPoolSize) {
        this.effectPool.push(animation.data)
      }
    }
  }

  /**
   * 清空所有动画
   */
  clear() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.animations = []
    this.isRunning = false
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.clear()
    this.damageNumberPool = []
    this.effectPool = []
    this.canvas = null
    this.ctx = null
  }
}

module.exports = BattleAnimationManager
