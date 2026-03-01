// Canvas 绘图工具 - 方块风格
class BlockDrawer {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
  }

  // 绘制方块角色
  drawCharacter(x, y, size, colors, isHero = false) {
    const ctx = this.ctx

    // 头部
    ctx.fillStyle = colors.head
    ctx.fillRect(x + size * 0.2, y, size * 0.6, size * 0.4)

    // 眼睛
    ctx.fillStyle = colors.eye
    ctx.fillRect(x + size * 0.3, y + size * 0.15, size * 0.12, size * 0.1)
    ctx.fillRect(x + size * 0.58, y + size * 0.15, size * 0.12, size * 0.1)

    // 嘴巴
    if (colors.mouth) {
      ctx.fillStyle = colors.mouth
      ctx.fillRect(x + size * 0.4, y + size * 0.3, size * 0.2, size * 0.05)
    }

    // 身体
    ctx.fillStyle = colors.body
    ctx.fillRect(x + size * 0.15, y + size * 0.4, size * 0.7, size * 0.35)

    // 手臂
    ctx.fillStyle = colors.body
    ctx.fillRect(x, y + size * 0.45, size * 0.15, size * 0.25)
    ctx.fillRect(x + size * 0.85, y + size * 0.45, size * 0.15, size * 0.25)

    // 腿
    ctx.fillStyle = colors.legs
    ctx.fillRect(x + size * 0.25, y + size * 0.75, size * 0.2, size * 0.25)
    ctx.fillRect(x + size * 0.55, y + size * 0.75, size * 0.2, size * 0.25)
  }

  // 绘制骷髅怪物
  drawSkeleton(x, y, size, color) {
    const ctx = this.ctx

    // 骷髅颜色
    const colors = {
      head: color,
      body: color,
      legs: color,
      eye: '#000000',
      mouth: '#000000'
    }

    this.drawCharacter(x, y, size, colors, false)

    // 额外的骨骼细节
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1

    // 肋骨
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(x + size * 0.25, y + size * 0.45 + i * size * 0.07)
      ctx.lineTo(x + size * 0.75, y + size * 0.45 + i * size * 0.07)
      ctx.stroke()
    }

    // 骷髅武器（骨剑）
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(x - size * 0.15, y + size * 0.3, size * 0.06, size * 0.55)

    // 剑尖
    ctx.beginPath()
    ctx.moveTo(x - size * 0.16, y + size * 0.85)
    ctx.lineTo(x - size * 0.12, y + size * 0.25)
    ctx.lineTo(x - size * 0.08, y + size * 0.85)
    ctx.fill()

    // 剑柄
    ctx.fillStyle = '#8b7355'
    ctx.fillRect(x - size * 0.18, y + size * 0.8, size * 0.14, size * 0.12)
  }

  // 绘制僵尸怪物
  drawZombie(x, y, size, color) {
    const ctx = this.ctx

    // 僵尸颜色
    const colors = {
      head: color,
      body: color,
      legs: '#2a2a2a',
      eye: '#8b0000',
      mouth: '#2a2a2a'
    }

    this.drawCharacter(x, y, size, colors, false)

    // 腐烂效果 - 随机孔洞
    ctx.fillStyle = '#1a1a1a'
    const holes = [
      [x + size * 0.5, y + size * 0.5, size * 0.05],
      [x + size * 0.3, y + size * 0.6, size * 0.04],
      [x + size * 0.7, y + size * 0.55, size * 0.04]
    ]
    holes.forEach(hole => {
      ctx.fillRect(hole[0], hole[1], hole[2], hole[2])
    })

    // 僵尸武器（生锈的铁斧）
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(x - size * 0.1, y + size * 0.35, size * 0.08, size * 0.45)

    // 斧头
    ctx.fillStyle = '#a0522d'
    ctx.fillRect(x - size * 0.15, y + size * 0.3, size * 0.18, size * 0.12)

    // 斧刃
    ctx.fillStyle = '#6b4c3a'
    ctx.fillRect(x - size * 0.15, y + size * 0.38, size * 0.04, size * 0.35)
  }

  // 绘制英雄
  drawHero(x, y, size, color = '#4a7c59', hasWeapon = true) {
    const ctx = this.ctx

    // 英雄颜色
    const colors = {
      head: '#ffd5b5',
      body: color,
      legs: '#2f2f2f',
      eye: '#000000',
      mouth: '#000000'
    }

    this.drawCharacter(x, y, size, colors, true)

    // 英雄头盔/头饰
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(x + size * 0.18, y, size * 0.64, size * 0.15)

    // 绘制武器（剑）
    if (hasWeapon) {
      // 剑刃
      ctx.fillStyle = '#c0c0c0'
      ctx.fillRect(x + size * 0.7, y + size * 0.2, size * 0.08, size * 0.5)

      // 剑尖
      ctx.beginPath()
      ctx.moveTo(x + size * 0.68, y + size * 0.7)
      ctx.lineTo(x + size * 0.74, y + size * 0.15)
      ctx.lineTo(x + size * 0.8, y + size * 0.7)
      ctx.fill()

      // 剑柄
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(x + size * 0.66, y + size * 0.65, size * 0.16, size * 0.15)

      // 护手
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(x + size * 0.6, y + size * 0.6, size * 0.28, size * 0.08)
    }
  }

  // 绘制Boss怪物
  drawBoss(x, y, size, color, type) {
    const ctx = this.ctx

    // Boss更大更华丽
    const bossSize = size * 1.5

    if (type === 'skeleton') {
      this.drawSkeleton(x - size * 0.25, y - size * 0.25, bossSize, color)

      // 王冠
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(x + size * 0.3, y - size * 0.2, size * 0.4, size * 0.1)
      ctx.fillRect(x + size * 0.25, y - size * 0.25, size * 0.1, size * 0.08)
      ctx.fillRect(x + size * 0.65, y - size * 0.25, size * 0.1, size * 0.08)
      ctx.fillRect(x + size * 0.45, y - size * 0.3, size * 0.1, size * 0.08)
    } else if (type === 'zombie') {
      this.drawZombie(x - size * 0.25, y - size * 0.25, bossSize, color)

      // 领主披风
      ctx.fillStyle = '#4a0000'
      ctx.fillRect(x, y + size * 0.7, size, size * 0.3)
    } else {
      // 最终Boss
      this.drawCharacter(x - size * 0.5, y - size * 0.5, size * 2, {
        head: color,
        body: '#1a0000',
        legs: '#000000',
        eye: '#ff0000',
        mouth: '#8b0000'
      }, false)

      // 角
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.moveTo(x + size * 0.3, y)
      ctx.lineTo(x + size * 0.4, y - size * 0.3)
      ctx.lineTo(x + size * 0.5, y)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(x + size * 0.5, y)
      ctx.lineTo(x + size * 0.6, y - size * 0.3)
      ctx.lineTo(x + size * 0.7, y)
      ctx.fill()
    }
  }

  // 绘制生命条 - 添加缓存优化
  drawHpBar(x, y, width, height, current, max, label = '') {
    const ctx = this.ctx

    // 背景条
    ctx.fillStyle = '#333333'
    ctx.fillRect(x, y, width, height)

    // 生命值
    const hpPercent = Math.max(0, current / max)
    const hpWidth = width * hpPercent

    // 颜色根据血量变化
    if (hpPercent > 0.6) {
      ctx.fillStyle = '#44ff44'
    } else if (hpPercent > 0.3) {
      ctx.fillStyle = '#ffff44'
    } else {
      ctx.fillStyle = '#ff4444'
    }

    ctx.fillRect(x, y, hpWidth, height)

    // 边框
    ctx.strokeStyle = '#555555'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)

    // 文字
    if (label) {
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(label, x + width / 2, y - 5)
    }

    // 生命值数字
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.floor(current)}/${max}`, x + width / 2, y + height - 3)
  }

  // 绘制经验条 - 添加缓存优化
  drawExpBar(x, y, width, height, current, max) {
    const ctx = this.ctx

    // 背景条
    ctx.fillStyle = '#333333'
    ctx.fillRect(x, y, width, height)

    // 经验值
    const expPercent = Math.max(0, current / max)
    const expWidth = width * expPercent

    ctx.fillStyle = '#ffd700'
    ctx.fillRect(x, y, expWidth, height)

    // 边框
    ctx.strokeStyle = '#555555'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
  }

  // 绘制魔法条 - 添加缓存优化
  drawMpBar(x, y, width, height, current, max) {
    const ctx = this.ctx

    // 背景条
    ctx.fillStyle = '#333333'
    ctx.fillRect(x, y, width, height)

    // 魔法值
    const mpPercent = Math.max(0, current / max)
    const mpWidth = width * mpPercent

    ctx.fillStyle = '#4444ff' // 蓝色代表魔法值
    ctx.fillRect(x, y, mpWidth, height)

    // 边框
    ctx.strokeStyle = '#555555'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)

    // 魔法值数字
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.floor(current)}/${max}`, x + width / 2, y + height - 3)
  }

  // 绘制武器图标 - 使用缓存优化
  drawWeapon(x, y, size, color = '#888888') {
    const ctx = this.ctx

    // 剑刃
    ctx.fillStyle = color
    ctx.fillRect(x + size * 0.4, y, size * 0.2, size * 0.6)

    // 剑尖
    ctx.beginPath()
    ctx.moveTo(x + size * 0.3, y + size * 0.5)
    ctx.lineTo(x + size * 0.5, y)
    ctx.lineTo(x + size * 0.7, y + size * 0.5)
    ctx.fill()

    // 剑柄
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(x + size * 0.35, y + size * 0.6, size * 0.3, size * 0.15)

    // 护手
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(x + size * 0.2, y + size * 0.55, size * 0.6, size * 0.08)
  }

  // 绘制盾牌图标 - 使用缓存优化
  drawShield(x, y, size, color = '#888888') {
    const ctx = this.ctx

    ctx.fillStyle = color

    // 盾牌形状
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y)
    ctx.lineTo(x + size, y + size * 0.6)
    ctx.quadraticCurveTo(x + size / 2, y + size, x, y + size * 0.6)
    ctx.closePath()
    ctx.fill()

    // 盾牌纹理
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // 绘制药水图标 - 使用缓存优化
  drawPotion(x, y, size, color = '#ff0000') {
    const ctx = this.ctx

    // 瓶身
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(x + size * 0.3, y + size * 0.2, size * 0.4, size * 0.6)

    // 药水液体
    ctx.fillStyle = color
    ctx.fillRect(x + size * 0.32, y + size * 0.35, size * 0.36, size * 0.43)

    // 瓶口
    ctx.fillStyle = '#888888'
    ctx.fillRect(x + size * 0.35, y + size * 0.1, size * 0.3, size * 0.12)
  }

  // 绘制攻击效果
  drawAttackEffect(x, y, size, color = '#ff0000') {
    const ctx = this.ctx

    ctx.strokeStyle = color
    ctx.lineWidth = 3

    // 攻击线
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + size, y + size * 0.5)
    ctx.stroke()

    // 星星效果
    ctx.fillStyle = '#ffff00'
    for (let i = 0; i < 5; i++) {
      const starX = x + size * 0.8 + Math.random() * size * 0.2
      const starY = y + size * 0.3 + Math.random() * size * 0.4
      ctx.fillRect(starX, starY, 4, 4)
    }
  }

  // 绘制伤害数字
  drawDamage(x, y, damage, isCritical = false) {
    const ctx = this.ctx

    ctx.fillStyle = isCritical ? '#ff0000' : '#ff6666'
    ctx.font = isCritical ? 'bold 24px Arial' : 'bold 16px Arial'
    ctx.textAlign = 'center'

    // 阴影
    ctx.fillStyle = '#000000'
    ctx.fillText(`-${damage}`, x + 2, y + 2)

    // 主文字
    ctx.fillStyle = isCritical ? '#ff0000' : '#ffffff'
    ctx.fillText(`-${damage}`, x, y)
  }

  // 绘制闪避效果
  drawDodgeEffect(x, y, size) {
    const ctx = this.ctx

    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3

    // 闪避图标
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + size * 0.5, y - size * 0.3)
    ctx.lineTo(x + size, y)
    ctx.stroke()

    ctx.fillStyle = '#00ffff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('闪避!', x + size / 2, y + size * 0.2)
  }

  // 清空画布
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
module.exports = BlockDrawer
