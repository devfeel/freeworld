/**
 * 技能特效绘制模块
 * 提供各种技能释放时的视觉效果
 */

const { skillDataService } = require('../services/skillService')

class SkillEffectDrawer {
  constructor(ctx, canvas) {
    this.ctx = ctx
    this.canvas = canvas
    this.particles = []
    this.effects = []
    this.skillCache = {} // 缓存技能数据
  }

  /**
   * 预加载技能数据
   */
  async preloadSkills() {
    const skills = await skillDataService.getAllSkills()
    skills.forEach(skill => {
      this.skillCache[skill.id] = skill
    })
  }

  /**
   * 获取技能数据（优先从缓存）
   */
  getSkillData(skillId) {
    return this.skillCache[skillId] || null
  }

  /**
   * 清空特效
   */
  clear() {
    this.particles = []
    this.effects = []
  }

  /**
   * 创建粒子
   */
  createParticle(x, y, color, size, velocity, life) {
    return {
      x, y, color, size,
      vx: velocity.x,
      vy: velocity.y,
      life, maxLife: life,
      alpha: 1
    }
  }

  /**
   * 更新和绘制所有粒子
   */
  updateAndDrawParticles() {
    const ctx = this.ctx

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      // 更新位置
      p.x += p.vx
      p.y += p.vy
      p.life--
      p.alpha = p.life / p.maxLife

      // 绘制粒子
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.size, p.size)
      ctx.restore()

      // 移除死亡粒子
      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  // ========== 火系技能特效 ==========

  /**
   * 火球术特效
   * @param {number} startX 起始X
   * @param {number} startY 起始Y
   * @param {number} endX 目标X
   * @param {number} endY 目标Y
   * @param {number} progress 进度(0-1)
   */
  drawFireball(startX, startY, endX, endY, progress) {
    const ctx = this.ctx
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    // 火球主体
    const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 25)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.2, '#ffeb3b')
    gradient.addColorStop(0.5, '#ff9800')
    gradient.addColorStop(0.8, '#ff5722')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(currentX - 30, currentY - 30, 60, 60)

    // 火焰粒子
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 20
      const px = currentX + Math.cos(angle) * distance
      const py = currentY + Math.sin(angle) * distance

      this.particles.push(this.createParticle(
        px, py,
        ['#ff5722', '#ff9800', '#ffeb3b'][Math.floor(Math.random() * 3)],
        Math.random() * 6 + 2,
        { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
        Math.floor(Math.random() * 10 + 5)
      ))
    }
  }

  /**
   * 火球爆炸特效
   */
  drawFireExplosion(x, y, progress) {
    const ctx = this.ctx
    const maxRadius = 60
    const currentRadius = maxRadius * progress

    // 爆炸核心
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.3, '#ffeb3b')
    gradient.addColorStop(0.6, '#ff5722')
    gradient.addColorStop(0.9, '#8b0000')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(x - currentRadius, y - currentRadius, currentRadius * 2, currentRadius * 2)

    // 爆炸火花
    if (progress < 0.5) {
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 / 15) * i
        const distance = currentRadius * (0.5 + Math.random() * 0.5)
        const px = x + Math.cos(angle) * distance
        const py = y + Math.sin(angle) * distance

        this.particles.push(this.createParticle(
          px, py,
          '#ff5722',
          Math.random() * 4 + 2,
          { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 },
          Math.floor(Math.random() * 15 + 10)
        ))
      }
    }
  }

  // ========== 冰系技能特效 ==========

  /**
   * 冰冻术特效
   */
  drawIceBolt(startX, startY, endX, endY, progress) {
    const ctx = this.ctx
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    // 冰晶轨迹
    ctx.strokeStyle = '#81d4fa'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()

    // 冰晶头部
    const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 20)
    gradient.addColorStop(0, '#e1f5fe')
    gradient.addColorStop(0.5, '#81d4fa')
    gradient.addColorStop(0.8, '#0288d1')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(currentX - 25, currentY - 25, 50, 50)

    // 冰霜粒子
    for (let i = 0; i < 3; i++) {
      this.particles.push(this.createParticle(
        currentX + (Math.random() - 0.5) * 20,
        currentY + (Math.random() - 0.5) * 20,
        '#b3e5fc',
        Math.random() * 4 + 2,
        { x: (Math.random() - 0.5), y: (Math.random() - 0.5) },
        Math.floor(Math.random() * 12 + 8)
      ))
    }
  }

  /**
   * 冰冻爆炸特效
   */
  drawIceExplosion(x, y, progress) {
    const ctx = this.ctx
    const maxRadius = 50
    const currentRadius = maxRadius * progress

    // 冰霜扩散
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius)
    gradient.addColorStop(0, '#e1f5fe')
    gradient.addColorStop(0.4, '#81d4fa')
    gradient.addColorStop(0.7, '#4fc3f7')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(x - currentRadius, y - currentRadius, currentRadius * 2, currentRadius * 2)

    // 冰晶碎片
    if (progress < 0.6) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + progress * Math.PI
        const distance = currentRadius * 0.8
        const px = x + Math.cos(angle) * distance
        const py = y + Math.sin(angle) * distance

        ctx.fillStyle = '#b3e5fc'
        ctx.fillRect(px - 3, py - 3, 6, 6)
      }
    }
  }

  // ========== 雷系技能特效 ==========

  /**
   * 闪电链特效
   */
  drawLightning(startX, startY, endX, endY, progress) {
    const ctx = this.ctx
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    // 绘制闪电路径（锯齿状）
    ctx.strokeStyle = '#ffeb3b'
    ctx.lineWidth = 3
    ctx.shadowColor = '#ff9800'
    ctx.shadowBlur = 10

    ctx.beginPath()
    ctx.moveTo(startX, startY)

    const segments = 5
    for (let i = 1; i <= segments; i++) {
      const segProgress = i / segments
      if (segProgress > progress) break

      const segX = startX + (endX - startX) * segProgress
      const segY = startY + (endY - startY) * segProgress
      const offset = (Math.random() - 0.5) * 20

      ctx.lineTo(segX + offset, segY)
    }

    ctx.stroke()
    ctx.shadowBlur = 0

    // 电光粒子
    this.particles.push(this.createParticle(
      currentX, currentY,
      '#ffeb3b',
      Math.random() * 6 + 3,
      { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 },
      Math.floor(Math.random() * 5 + 3)
    ))
  }

  /**
   * 闪电爆炸特效
   */
  drawLightningExplosion(x, y, progress) {
    const ctx = this.ctx

    // 闪电放射状线条
    ctx.strokeStyle = '#ffeb3b'
    ctx.lineWidth = 2
    ctx.shadowColor = '#ff9800'
    ctx.shadowBlur = 15

    const numBolts = 6
    for (let i = 0; i < numBolts; i++) {
      const angle = (Math.PI * 2 / numBolts) * i
      const length = 40 * progress

      ctx.beginPath()
      ctx.moveTo(x, y)

      // 锯齿状闪电
      for (let j = 1; j <= 3; j++) {
        const segLength = (length / 3) * j
        const offset = (Math.random() - 0.5) * 15
        ctx.lineTo(
          x + Math.cos(angle) * segLength + offset,
          y + Math.sin(angle) * segLength + offset
        )
      }

      ctx.stroke()
    }

    ctx.shadowBlur = 0
  }

  // ========== 毒系技能特效 ==========

  /**
   * 毒箭特效
   */
  drawPoison(startX, startY, endX, endY, progress) {
    const ctx = this.ctx
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    // 毒液轨迹
    ctx.fillStyle = '#7b1fa2'
    ctx.fillRect(currentX - 4, currentY - 4, 8, 8)

    // 毒雾粒子
    for (let i = 0; i < 4; i++) {
      this.particles.push(this.createParticle(
        currentX + (Math.random() - 0.5) * 15,
        currentY + (Math.random() - 0.5) * 15,
        '#9c27b0',
        Math.random() * 5 + 3,
        { x: (Math.random() - 0.5) * 1.5, y: -Math.random() * 2 },
        Math.floor(Math.random() * 20 + 10)
      ))
    }
  }

  /**
   * 毒爆特效
   */
  drawPoisonExplosion(x, y, progress) {
    const ctx = this.ctx
    const maxRadius = 45
    const currentRadius = maxRadius * progress

    // 毒雾扩散
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius)
    gradient.addColorStop(0, '#e1bee7')
    gradient.addColorStop(0.4, '#9c27b0')
    gradient.addColorStop(0.7, '#7b1fa2')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(x - currentRadius, y - currentRadius, currentRadius * 2, currentRadius * 2)

    // 毒气泡
    if (progress < 0.7) {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = currentRadius * Math.random()
        const px = x + Math.cos(angle) * distance
        const py = y + Math.sin(angle) * distance

        ctx.fillStyle = '#ba68c8'
        ctx.fillRect(px - 2, py - 2, 4, 4)
      }
    }
  }

  // ========== 治疗技能特效 ==========

  /**
   * 治疗特效
   */
  drawHeal(x, y, progress) {
    const ctx = this.ctx

    // 绿色光环扩散
    const maxRadius = 50
    const currentRadius = maxRadius * progress

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius)
    gradient.addColorStop(0, 'rgba(129, 199, 132, 0.8)')
    gradient.addColorStop(0.5, 'rgba(76, 175, 80, 0.5)')
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fillRect(x - currentRadius, y - currentRadius, currentRadius * 2, currentRadius * 2)

    // 治疗符号（十字）
    if (progress > 0.3 && progress < 0.8) {
      ctx.fillStyle = '#4caf50'
      const size = 20 * (1 - Math.abs(progress - 0.5) * 2)
      ctx.fillRect(x - size / 2, y - size * 0.15, size, size * 0.3)
      ctx.fillRect(x - size * 0.15, y - size / 2, size * 0.3, size)
    }

    // 治疗粒子（向上飘）
    for (let i = 0; i < 3; i++) {
      this.particles.push(this.createParticle(
        x + (Math.random() - 0.5) * 40,
        y + (Math.random() - 0.5) * 20,
        '#81c784',
        Math.random() * 4 + 2,
        { x: (Math.random() - 0.5), y: -2 - Math.random() },
        Math.floor(Math.random() * 15 + 10)
      ))
    }
  }

  // ========== 物理攻击特效 ==========

  /**
   * 重击特效
   */
  drawHeavyStrike(x, y, progress) {
    const ctx = this.ctx

    // 冲击波
    const maxRadius = 40
    const currentRadius = maxRadius * progress

    ctx.strokeStyle = '#ff5722'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, currentRadius, 0, Math.PI * 2)
    ctx.stroke()

    // 裂痕效果
    if (progress > 0.3 && progress < 0.7) {
      ctx.strokeStyle = '#795548'
      ctx.lineWidth = 2

      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + Math.PI / 4
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(
          x + Math.cos(angle) * 30 * progress,
          y + Math.sin(angle) * 30 * progress
        )
        ctx.stroke()
      }
    }
  }

  /**
   * 连射特效
   */
  drawRapidShot(startX, startY, endX, endY, progress, shotIndex = 0) {
    const ctx = this.ctx
    const offset = shotIndex * 0.15
    const adjustedProgress = Math.max(0, Math.min(1, (progress - offset) / 0.7))

    if (adjustedProgress <= 0) return

    const currentX = startX + (endX - startX) * adjustedProgress
    const currentY = startY + (endY - startY) * adjustedProgress

    // 箭矢
    ctx.fillStyle = '#8d6e63'
    ctx.fillRect(currentX - 3, currentY - 2, 12, 4)

    // 箭头
    ctx.fillStyle = '#bdbdbd'
    ctx.beginPath()
    ctx.moveTo(currentX + 9, currentY)
    ctx.lineTo(currentX + 15, currentY - 4)
    ctx.lineTo(currentX + 15, currentY + 4)
    ctx.fill()
  }

  /**
   * 盾墙特效
   */
  drawShieldWall(x, y, progress) {
    const ctx = this.ctx

    // 护盾光环
    const alpha = 0.3 + Math.sin(progress * Math.PI * 4) * 0.2
    ctx.fillStyle = `rgba(255, 193, 7, ${alpha})`

    // 六边形护盾
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const px = x + Math.cos(angle) * 40
      const py = y + Math.sin(angle) * 40
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()

    // 护盾边框
    ctx.strokeStyle = '#ffc107'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // ========== 通用特效 ==========

  /**
   * 伤害数字
   */
  drawDamageNumber(x, y, damage, isCritical, element = 'physical') {
    const colors = {
      physical: '#ffffff',
      fire: '#ff5722',
      ice: '#03a9f4',
      lightning: '#ffeb3b',
      poison: '#9c27b0',
      heal: '#4caf50'
    }

    return {
      type: 'damage',
      x, y,
      damage,
      color: colors[element] || colors.physical,
      isCritical,
      life: 40,
      vy: -2
    }
  }

  /**
   * 绘制伤害数字
   */
  drawDamageNumbers() {
    const ctx = this.ctx

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i]

      if (effect.type === 'damage') {
        effect.y += effect.vy
        effect.life--

        const alpha = Math.min(1, effect.life / 20)
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = effect.color
        ctx.font = effect.isCritical ? 'bold 24px Arial' : '18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(effect.damage.toString(), effect.x, effect.y)
        ctx.restore()

        if (effect.life <= 0) {
          this.effects.splice(i, 1)
        }
      }
    }
  }

  /**
   * 根据元素类型获取主色调
   */
  getElementColor(element) {
    const colors = {
      fire: '#ff5722',
      ice: '#03a9f4',
      lightning: '#ffeb3b',
      poison: '#9c27b0',
      holy: '#fff59d',
      physical: '#bdbdbd'
    }
    return colors[element] || colors.physical
  }

  /**
   * 绘制技能特效（主入口）
   * @param {string} skillId 技能ID
   * @param {object} params 参数 {startX, startY, endX, endY, progress, ...}
   */
  drawSkillEffect(skillId, params) {
    const { startX, startY, endX, endY, progress, x, y } = params

    switch (skillId) {
      // 火系
      case 'fireball':
        if (progress < 0.8) {
          this.drawFireball(startX, startY, endX, endY, progress / 0.8)
        } else {
          this.drawFireExplosion(endX, endY, (progress - 0.8) / 0.2)
        }
        break

      // 冰系
      case 'iceBolt':
        if (progress < 0.8) {
          this.drawIceBolt(startX, startY, endX, endY, progress / 0.8)
        } else {
          this.drawIceExplosion(endX, endY, (progress - 0.8) / 0.2)
        }
        break

      // 雷系
      case 'lightningChain':
        if (progress < 0.6) {
          this.drawLightning(startX, startY, endX, endY, progress / 0.6)
        } else {
          this.drawLightningExplosion(endX, endY, (progress - 0.6) / 0.4)
        }
        break

      // 毒系
      case 'poisonArrow':
        if (progress < 0.8) {
          this.drawPoison(startX, startY, endX, endY, progress / 0.8)
        } else {
          this.drawPoisonExplosion(endX, endY, (progress - 0.8) / 0.2)
        }
        break

      // 治疗
      case 'heal':
        this.drawHeal(x, y, progress)
        break

      // 物理攻击
      case 'heavyStrike':
        this.drawHeavyStrike(endX, endY, progress)
        break

      case 'shieldWall':
        this.drawShieldWall(x, y, progress)
        break

      // 默认：普通攻击特效
      default:
        this.drawHeavyStrike(endX, endY, progress)
    }

    // 更新和绘制粒子
    this.updateAndDrawParticles()

    // 绘制伤害数字
    this.drawDamageNumbers()
  }

  /**
   * 添加伤害数字效果
   */
  addDamageEffect(x, y, damage, isCritical, element) {
    this.effects.push(this.drawDamageNumber(x, y, damage, isCritical, element))
  }
}

module.exports = { SkillEffectDrawer }
