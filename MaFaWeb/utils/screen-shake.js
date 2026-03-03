/**
 * ScreenShake - 屏幕震动效果
 * 支持不同强度和触发方式，优化性能避免重叠
 */

class ScreenShake {
  constructor() {
    this.isShaking = false
    this.startTime = 0
    this.duration = 0
    this.intensity = 0
    this.target = 'screen' // 'screen', 'hero', 'enemy'

    // 配置
    this.config = {
      light: { amplitude: 5, frequency: 0.02, decay: 0.9 },
      medium: { amplitude: 10, frequency: 0.03, decay: 0.85 },
      heavy: { amplitude: 20, frequency: 0.05, decay: 0.8 }
    }

    // 防止重叠的冷却时间
    this.cooldown = 0
    this.cooldownTime = 100 // ms

    // 当前偏移量
    this.offset = { x: 0, y: 0 }
  }

  /**
   * 触发震动
   * @param {string} level - 强度级别 'light' | 'medium' | 'heavy'
   * @param {number} duration - 持续时间(ms)
   * @param {string} target - 震动目标 'screen' | 'hero' | 'enemy'
   * @returns {boolean} 是否成功触发
   */
  trigger(level = 'medium', duration = 300, target = 'screen') {
    // 检查冷却
    const now = Date.now()
    if (now - this.cooldown < this.cooldownTime) {
      return false
    }

    // 如果正在震动，新震动的强度必须更大才能覆盖
    if (this.isShaking) {
      const levels = { light: 1, medium: 2, heavy: 3 }
      if (levels[level] <= levels[this.currentLevel]) {
        return false
      }
    }

    this.isShaking = true
    this.startTime = now
    this.duration = duration
    this.currentLevel = level
    this.target = target
    this.cooldown = now

    return true
  }

  /**
   * 更新震动状态
   * @returns {object} 当前偏移量 {x, y, target}
   */
  update() {
    if (!this.isShaking) {
      return { x: 0, y: 0, target: this.target, active: false }
    }

    const now = Date.now()
    const elapsed = now - this.startTime

    if (elapsed >= this.duration) {
      this.isShaking = false
      this.offset = { x: 0, y: 0 }
      return { x: 0, y: 0, target: this.target, active: false }
    }

    // 计算震动
    const config = this.config[this.currentLevel]
    const progress = elapsed / this.duration
    const decay = Math.pow(config.decay, progress * 10)

    // 使用正弦波产生震动
    const shakeX = Math.sin(elapsed * config.frequency) * config.amplitude * decay
    const shakeY = Math.cos(elapsed * config.frequency * 1.3) * config.amplitude * 0.5 * decay

    this.offset = {
      x: Math.round(shakeX),
      y: Math.round(shakeY)
    }

    return {
      x: this.offset.x,
      y: this.offset.y,
      target: this.target,
      active: true,
      intensity: decay
    }
  }

  /**
   * 快速触发（用于特定事件）
   */
  onDamage() {
    return this.trigger('light', 200, 'hero')
  }

  onCriticalHit() {
    return this.trigger('heavy', 400, 'screen')
  }

  onEnemyAttack() {
    return this.trigger('medium', 250, 'hero')
  }

  onSkillCast() {
    return this.trigger('light', 150, 'screen')
  }

  onBossAttack() {
    return this.trigger('heavy', 500, 'screen')
  }

  /**
   * 停止震动
   */
  stop() {
    this.isShaking = false
    this.offset = { x: 0, y: 0 }
  }

  /**
   * 获取CSS transform字符串
   */
  getCSSTransform() {
    if (!this.isShaking) return ''
    return `translate(${this.offset.x}px, ${this.offset.y}px)`
  }

  /**
   * 设置性能模式
   */
  setPerformanceMode(mode) {
    const configs = {
      high: {
        light: { amplitude: 5, frequency: 0.02, decay: 0.9 },
        medium: { amplitude: 10, frequency: 0.03, decay: 0.85 },
        heavy: { amplitude: 20, frequency: 0.05, decay: 0.8 }
      },
      balanced: {
        light: { amplitude: 4, frequency: 0.02, decay: 0.9 },
        medium: { amplitude: 8, frequency: 0.03, decay: 0.85 },
        heavy: { amplitude: 15, frequency: 0.05, decay: 0.8 }
      },
      low: {
        light: { amplitude: 2, frequency: 0.01, decay: 0.95 },
        medium: { amplitude: 4, frequency: 0.02, decay: 0.9 },
        heavy: { amplitude: 8, frequency: 0.03, decay: 0.85 }
      }
    }

    this.config = configs[mode] || configs.balanced
  }
}

module.exports = ScreenShake
