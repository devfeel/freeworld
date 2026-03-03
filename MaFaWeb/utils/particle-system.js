/**
 * ParticleSystem - 粒子系统
 * 高性能粒子效果管理，支持对象池复用
 */

class Particle {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.life = 0
    this.maxLife = 0
    this.size = 0
    this.color = ''
    this.alpha = 1
    this.type = 'spark'
    this.gravity = 0
    this.isActive = false
  }

  update(deltaTime) {
    if (!this.isActive) return false

    // 更新位置
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    // 应用重力
    this.vy += this.gravity * deltaTime

    // 更新生命值
    this.life -= deltaTime

    // 计算透明度（渐入渐出）
    const lifeRatio = this.life / this.maxLife
    if (lifeRatio > 0.8) {
      this.alpha = (1 - lifeRatio) * 5 // 渐入
    } else {
      this.alpha = lifeRatio // 渐出
    }

    // 检查是否死亡
    if (this.life <= 0) {
      this.isActive = false
      return false
    }

    return true
  }

  draw(ctx) {
    if (!this.isActive || this.alpha <= 0) return

    ctx.save()
    ctx.globalAlpha = this.alpha

    switch (this.type) {
      case 'spark':
        this.drawSpark(ctx)
        break
      case 'glow':
        this.drawGlow(ctx)
        break
      case 'trail':
        this.drawTrail(ctx)
        break
      case 'star':
        this.drawStar(ctx)
        break
    }

    ctx.restore()
  }

  drawSpark(ctx) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // 发光效果
    ctx.shadowBlur = this.size * 2
    ctx.shadowColor = this.color
    ctx.fill()
  }

  drawGlow(ctx) {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    )
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }

  drawTrail(ctx) {
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.size
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3)
    ctx.stroke()
  }

  drawStar(ctx) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI / 5) - Math.PI / 2
      const x = this.x + Math.cos(angle) * this.size
      const y = this.y + Math.sin(angle) * this.size
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
  }
}

class ParticleSystem {
  constructor(canvas, ctx, maxParticles = 100) {
    this.canvas = canvas
    this.ctx = ctx
    this.maxParticles = maxParticles

    // 对象池
    this.particlePool = []
    this.activeParticles = []

    // 初始化对象池
    for (let i = 0; i < maxParticles; i++) {
      this.particlePool.push(new Particle())
    }

    // 动画循环
    this.isRunning = false
    this.animationId = null
    this.lastTime = 0

    // 性能配置
    this.config = {
      maxActiveParticles: maxParticles,
      emissionRate: 1, // 每帧发射数量
      enableGlow: true
    }
  }

  /**
   * 获取一个空闲粒子
   */
  getParticle() {
    // 从对象池获取
    if (this.particlePool.length > 0) {
      return this.particlePool.pop()
    }

    // 如果活跃粒子太多，回收最旧的
    if (this.activeParticles.length >= this.config.maxActiveParticles) {
      const oldest = this.activeParticles.shift()
      oldest.reset()
      return oldest
    }

    return new Particle()
  }

  /**
   * 回收粒子到对象池
   */
  recycleParticle(particle) {
    particle.reset()
    if (this.particlePool.length < this.maxParticles) {
      this.particlePool.push(particle)
    }
  }

  /**
   * 发射粒子
   * @param {object} config - 粒子配置
   */
  emit(config) {
    const count = config.count || 1

    for (let i = 0; i < count; i++) {
      if (this.activeParticles.length >= this.config.maxActiveParticles) {
        break // 达到上限，停止发射
      }

      const particle = this.getParticle()
      this.initParticle(particle, config)
      this.activeParticles.push(particle)
    }

    this.startIfNeeded()
  }

  /**
   * 初始化粒子属性
   */
  initParticle(particle, config) {
    const angle = (config.angle || 0) + (Math.random() - 0.5) * (config.spread || 0)
    const speed = config.speed || 50

    particle.x = config.x || 0
    particle.y = config.y || 0
    particle.vx = Math.cos(angle) * speed
    particle.vy = Math.sin(angle) * speed
    particle.life = config.life || 1000
    particle.maxLife = particle.life
    particle.size = config.size || 2
    particle.color = config.color || '#ffffff'
    particle.type = config.type || 'spark'
    particle.gravity = config.gravity || 0
    particle.isActive = true

    // 随机变化
    if (config.sizeVar) {
      particle.size *= (1 + (Math.random() - 0.5) * config.sizeVar)
    }
    if (config.speedVar) {
      const speedFactor = 1 + (Math.random() - 0.5) * config.speedVar
      particle.vx *= speedFactor
      particle.vy *= speedFactor
    }
  }

  /**
   * 发射伤害数字粒子效果
   */
  emitDamage(x, y, damage, isCritical = false) {
    const count = isCritical ? 15 : 8
    const color = isCritical ? '#ff4444' : '#ffaa44'

    this.emit({
      x,
      y,
      count,
      color,
      size: isCritical ? 4 : 2,
      sizeVar: 0.5,
      speed: 80,
      speedVar: 0.5,
      spread: Math.PI * 1.5,
      life: 800,
      gravity: 100,
      type: 'spark'
    })
  }

  /**
   * 发射治疗粒子效果
   */
  emitHeal(x, y, amount) {
    this.emit({
      x,
      y,
      count: 12,
      color: '#44ff88',
      size: 3,
      sizeVar: 0.3,
      speed: 60,
      speedVar: 0.3,
      spread: Math.PI,
      life: 1000,
      gravity: -50, // 向上飘
      type: 'glow'
    })

    // 添加星星效果
    this.emit({
      x,
      y,
      count: 5,
      color: '#88ffaa',
      size: 6,
      speed: 40,
      spread: Math.PI * 2,
      life: 1200,
      gravity: -30,
      type: 'star'
    })
  }

  /**
   * 发射技能特效粒子
   */
  emitSkillEffect(x, y, element = 'fire') {
    const colorMap = {
      fire: '#ff6622',
      ice: '#44aaff',
      lightning: '#ffdd44',
      poison: '#88ff44',
      magic: '#ff44ff'
    }

    const color = colorMap[element] || colorMap.fire

    // 中心爆发
    this.emit({
      x,
      y,
      count: 20,
      color,
      size: 4,
      speed: 120,
      spread: Math.PI * 2,
      life: 600,
      gravity: 0,
      type: 'spark'
    })

    // 外圈光晕
    this.emit({
      x,
      y,
      count: 10,
      color: '#ffffff',
      size: 8,
      speed: 80,
      spread: Math.PI * 2,
      life: 800,
      gravity: 0,
      type: 'glow'
    })
  }

  /**
   * 发射暴击特效
   */
  emitCritical(x, y) {
    // 金色粒子爆发
    this.emit({
      x,
      y,
      count: 25,
      color: '#ffdd00',
      size: 5,
      speed: 150,
      spread: Math.PI * 2,
      life: 700,
      gravity: 50,
      type: 'spark'
    })

    // 闪光效果
    this.emit({
      x,
      y,
      count: 8,
      color: '#ffffff',
      size: 12,
      speed: 60,
      spread: Math.PI * 2,
      life: 500,
      gravity: 0,
      type: 'glow'
    })
  }

  /**
   * 启动动画循环
   */
  startIfNeeded() {
    if (!this.isRunning && this.activeParticles.length > 0) {
      this.isRunning = true
      this.lastTime = Date.now()
      this.animationLoop()
    }
  }

  /**
   * 动画主循环
   */
  animationLoop() {
    if (!this.isRunning) return

    const currentTime = Date.now()
    const deltaTime = (currentTime - this.lastTime) / 1000 // 转换为秒
    this.lastTime = currentTime

    // 更新所有粒子
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i]
      const isAlive = particle.update(deltaTime * 1000)

      if (!isAlive) {
        this.recycleParticle(particle)
        this.activeParticles.splice(i, 1)
      }
    }

    // 如果还有活跃粒子，继续动画
    if (this.activeParticles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animationLoop())
    } else {
      this.isRunning = false
      this.animationId = null
    }
  }

  /**
   * 渲染所有粒子
   */
  render() {
    if (!this.ctx) return

    for (const particle of this.activeParticles) {
      particle.draw(this.ctx)
    }
  }

  /**
   * 清空所有粒子
   */
  clear() {
    for (const particle of this.activeParticles) {
      this.recycleParticle(particle)
    }
    this.activeParticles = []

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.isRunning = false
  }

  /**
   * 设置性能模式
   */
  setPerformanceMode(mode) {
    const modes = {
      high: { maxActiveParticles: 100, enableGlow: true },
      balanced: { maxActiveParticles: 50, enableGlow: true },
      low: { maxActiveParticles: 20, enableGlow: false }
    }

    const config = modes[mode] || modes.balanced
    this.config = { ...this.config, ...config }

    // 如果当前粒子数超过新限制，移除多余的
    while (this.activeParticles.length > this.config.maxActiveParticles) {
      const particle = this.activeParticles.shift()
      this.recycleParticle(particle)
    }
  }

  /**
   * 销毁系统
   */
  destroy() {
    this.clear()
    this.particlePool = []
    this.canvas = null
    this.ctx = null
  }
}

module.exports = ParticleSystem
