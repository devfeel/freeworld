/**
 * BattleStatistics - 战斗统计模块
 * 记录战斗过程中的各种数据，支持启用/禁用和重置
 */

class BattleStatistics {
  constructor() {
    this.enabled = true
    this.reset()
  }

  /**
   * 重置所有统计数据
   */
  reset() {
    this.stats = {
      // 基础统计
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      healingReceived: 0,

      // 战斗次数
      attacksLaunched: 0,
      attacksReceived: 0,
      hitsLanded: 0,
      hitsTaken: 0,

      // 特殊事件
      criticalHits: 0,
      criticalHitsTaken: 0,
      dodges: 0,
      dodged: 0,

      // 技能使用
      skillsUsed: {},
      totalSkillsUsed: 0,

      // 物品使用
      itemsUsed: {},
      totalItemsUsed: 0,

      // 回合统计
      totalTurns: 0,
      heroTurns: 0,
      enemyTurns: 0,

      // 时间统计
      battleStartTime: null,
      battleEndTime: null,

      // 结果
      victory: false,
      escaped: false
    }
  }

  /**
   * 启用统计
   */
  enable() {
    this.enabled = true
  }

  /**
   * 禁用统计
   */
  disable() {
    this.enabled = false
  }

  /**
   * 记录造成的伤害
   * @param {number} amount - 伤害数值
   * @param {boolean} isCritical - 是否暴击
   */
  recordDamageDealt(amount, isCritical = false) {
    if (!this.enabled) return

    this.stats.damageDealt += amount
    this.stats.attacksLaunched++
    this.stats.hitsLanded++

    if (isCritical) {
      this.stats.criticalHits++
    }
  }

  /**
   * 记录受到的伤害
   * @param {number} amount - 伤害数值
   * @param {boolean} isCritical - 是否暴击
   */
  recordDamageTaken(amount, isCritical = false) {
    if (!this.enabled) return

    this.stats.damageTaken += amount
    this.stats.attacksReceived++
    this.stats.hitsTaken++

    if (isCritical) {
      this.stats.criticalHitsTaken++
    }
  }

  /**
   * 记录治疗效果
   * @param {number} amount - 治疗数值
   * @param {boolean} isSelf - 是否自我治疗
   */
  recordHealing(amount, isSelf = true) {
    if (!this.enabled) return

    if (isSelf) {
      this.stats.healingReceived += amount
    } else {
      this.stats.healingDone += amount
    }
  }

  /**
   * 记录闪避成功
   */
  recordDodge() {
    if (!this.enabled) return
    this.stats.dodges++
  }

  /**
   * 记录被闪避
   */
  recordDodged() {
    if (!this.enabled) return
    this.stats.dodged++
    this.stats.attacksLaunched++
  }

  /**
   * 记录技能使用
   * @param {string} skillId - 技能ID
   * @param {string} skillName - 技能名称
   */
  recordSkillUse(skillId, skillName) {
    if (!this.enabled) return

    if (!this.stats.skillsUsed[skillId]) {
      this.stats.skillsUsed[skillId] = {
        name: skillName,
        count: 0
      }
    }

    this.stats.skillsUsed[skillId].count++
    this.stats.totalSkillsUsed++
  }

  /**
   * 记录物品使用
   * @param {string} itemId - 物品ID
   * @param {string} itemName - 物品名称
   */
  recordItemUse(itemId, itemName) {
    if (!this.enabled) return

    if (!this.stats.itemsUsed[itemId]) {
      this.stats.itemsUsed[itemId] = {
        name: itemName,
        count: 0
      }
    }

    this.stats.itemsUsed[itemId].count++
    this.stats.totalItemsUsed++
  }

  /**
   * 记录回合
   * @param {string} turn - 'hero' | 'enemy'
   */
  recordTurn(turn) {
    if (!this.enabled) return

    this.stats.totalTurns++

    if (turn === 'hero') {
      this.stats.heroTurns++
    } else if (turn === 'enemy') {
      this.stats.enemyTurns++
    }
  }

  /**
   * 开始战斗计时
   */
  startBattle() {
    if (!this.enabled) return
    this.stats.battleStartTime = Date.now()
  }

  /**
   * 结束战斗计时
   * @param {boolean} victory - 是否胜利
   * @param {boolean} escaped - 是否逃跑
   */
  endBattle(victory = false, escaped = false) {
    if (!this.enabled) return

    this.stats.battleEndTime = Date.now()
    this.stats.victory = victory
    this.stats.escaped = escaped
  }

  /**
   * 获取战斗持续时间(ms)
   * @returns {number}
   */
  getBattleDuration() {
    if (!this.stats.battleStartTime) return 0

    const endTime = this.stats.battleEndTime || Date.now()
    return endTime - this.stats.battleStartTime
  }

  /**
   * 计算DPS(每秒伤害)
   * @returns {number}
   */
  getDPS() {
    const duration = this.getBattleDuration()
    if (duration === 0) return 0

    return Math.round((this.stats.damageDealt / duration) * 1000)
  }

  /**
   * 计算暴击率
   * @returns {number} 0-100
   */
  getCriticalRate() {
    if (this.stats.hitsLanded === 0) return 0
    return Math.round((this.stats.criticalHits / this.stats.hitsLanded) * 100)
  }

  /**
   * 计算闪避率
   * @returns {number} 0-100
   */
  getDodgeRate() {
    const totalAttacks = this.stats.hitsTaken + this.stats.dodges
    if (totalAttacks === 0) return 0
    return Math.round((this.stats.dodges / totalAttacks) * 100)
  }

  /**
   * 获取最常用的技能
   * @returns {object|null}
   */
  getMostUsedSkill() {
    let maxCount = 0
    let mostUsed = null

    for (const skillId in this.stats.skillsUsed) {
      const skill = this.stats.skillsUsed[skillId]
      if (skill.count > maxCount) {
        maxCount = skill.count
        mostUsed = { skillId, ...skill }
      }
    }

    return mostUsed
  }

  /**
   * 获取统计摘要
   * @returns {object}
   */
  getSummary() {
    const duration = this.getBattleDuration()

    return {
      // 基础数据
      damageDealt: this.stats.damageDealt,
      damageTaken: this.stats.damageTaken,
      healingDone: this.stats.healingDone,
      healingReceived: this.stats.healingReceived,

      // 战斗表现
      attacksLaunched: this.stats.attacksLaunched,
      hitsLanded: this.stats.hitsLanded,
      criticalHits: this.stats.criticalHits,
      dodges: this.stats.dodges,

      // 计算指标
      dps: this.getDPS(),
      criticalRate: this.getCriticalRate(),
      dodgeRate: this.getDodgeRate(),
      accuracy: this.stats.attacksLaunched > 0
        ? Math.round((this.stats.hitsLanded / this.stats.attacksLaunched) * 100)
        : 0,

      // 回合统计
      totalTurns: this.stats.totalTurns,
      heroTurns: this.stats.heroTurns,
      enemyTurns: this.stats.enemyTurns,

      // 技能物品
      skillsUsed: this.stats.totalSkillsUsed,
      itemsUsed: this.stats.totalItemsUsed,
      mostUsedSkill: this.getMostUsedSkill(),

      // 时间和结果
      duration: duration,
      durationSeconds: Math.round(duration / 1000),
      victory: this.stats.victory,
      escaped: this.stats.escaped
    }
  }

  /**
   * 获取格式化后的统计报告（用于显示）
   * @returns {Array}
   */
  getFormattedReport() {
    const summary = this.getSummary()

    return [
      { label: '造成伤害', value: summary.damageDealt, icon: '⚔️' },
      { label: '承受伤害', value: summary.damageTaken, icon: '🛡️' },
      { label: '治疗量', value: summary.healingReceived, icon: '💚' },
      { label: '暴击次数', value: summary.criticalHits, icon: '💥' },
      { label: '闪避次数', value: summary.dodges, icon: '💨' },
      { label: '每秒伤害', value: summary.dps, icon: '📈' },
      { label: '战斗回合', value: summary.totalTurns, icon: '🔄' },
      { label: '战斗时长', value: `${summary.durationSeconds}秒`, icon: '⏱️' }
    ]
  }

  /**
   * 导出数据（用于保存或分享）
   * @returns {object}
   */
  export() {
    return {
      enabled: this.enabled,
      stats: { ...this.stats },
      summary: this.getSummary()
    }
  }

  /**
   * 导入数据
   * @param {object} data - 导出的数据
   */
  import(data) {
    if (data.enabled !== undefined) {
      this.enabled = data.enabled
    }
    if (data.stats) {
      this.stats = { ...this.stats, ...data.stats }
    }
  }
}

module.exports = BattleStatistics
