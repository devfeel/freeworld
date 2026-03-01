/**
 * 技能系统管理器
 * 处理技能学习、升级、效果计算
 */

const { skillDataService } = require('../services/skillService')
const { SKILL_TYPES } = require('../data/skills')

class SkillManager {
  constructor(hero) {
    this.hero = hero
    // 确保英雄有技能数据
    if (!this.hero.skills) {
      this.hero.skills = {}
    }
    if (!this.hero.skillPoints) {
      this.hero.skillPoints = 0
    }
    if (!this.hero.activeSkills) {
      this.hero.activeSkills = [] // 装备栏中的主动技能（最多4个）
    }
  }

  /**
   * 学习新技能
   * @param {string} skillId - 技能ID
   * @returns {object} { success: boolean, message: string }
   */
  async learnSkill(skillId) {
    const skill = await skillDataService.getSkill(skillId)
    if (!skill) {
      return { success: false, message: '技能不存在' }
    }

    // 检查是否已学习
    if (this.hero.skills[skillId]) {
      return { success: false, message: '已经学会该技能' }
    }

    // 检查等级要求
    if (this.hero.level < skill.unlockLevel) {
      return { success: false, message: `需要等级${skill.unlockLevel}` }
    }

    // 检查金币
    if (this.hero.gold < skill.unlockCost) {
      return { success: false, message: `需要${skill.unlockCost}金币` }
    }

    // 调用服务层学习技能
    const result = await skillDataService.learnSkill(skillId)
    if (!result.success) {
      return result
    }

    // 扣除金币
    this.hero.gold -= skill.unlockCost

    // 学习技能
    this.hero.skills[skillId] = {
      id: skillId,
      level: 1,
      learnedAt: Date.now()
    }

    // 如果是主动技能，自动装备到空位
    if (skill.type === SKILL_TYPES.ACTIVE && this.hero.activeSkills.length < 4) {
      this.hero.activeSkills.push(skillId)
    }

    return { success: true, message: `学会${skill.name}！` }
  }

  /**
   * 升级技能
   * @param {string} skillId - 技能ID
   * @returns {object} { success: boolean, message: string }
   */
  async upgradeSkill(skillId) {
    const skill = await skillDataService.getSkill(skillId)
    if (!skill) {
      return { success: false, message: '技能不存在' }
    }

    const heroSkill = this.hero.skills[skillId]
    if (!heroSkill) {
      return { success: false, message: '尚未学会该技能' }
    }

    // 检查是否已满级
    if (heroSkill.level >= skill.maxLevel) {
      return { success: false, message: '技能已满级' }
    }

    // 获取升级费用
    const upgradeCost = skillDataService.getUpgradeCost(skillId, heroSkill.level)
    if (upgradeCost === null) {
      return { success: false, message: '无法升级' }
    }

    // 检查金币
    if (this.hero.gold < upgradeCost) {
      return { success: false, message: `需要${upgradeCost}金币` }
    }

    // 调用服务层升级
    const result = await skillDataService.upgradeSkill(skillId)
    if (!result.success) {
      return result
    }

    // 扣除金币并升级
    this.hero.gold -= upgradeCost
    heroSkill.level++

    return { success: true, message: `${skill.name}升级到Lv.${heroSkill.level}！` }
  }

  /**
   * 获取所有已学技能
   * @returns {array} 技能列表
   */
  async getLearnedSkills() {
    const learned = []
    for (const skillId of Object.keys(this.hero.skills)) {
      const skill = await skillDataService.getSkill(skillId)
      const heroSkill = this.hero.skills[skillId]
      if (skill) {
        learned.push({
          ...skill,
          level: heroSkill.level,
          learnedAt: heroSkill.learnedAt,
          currentEffects: skillDataService.getSkillEffect(skillId, heroSkill.level)
        })
      }
    }
    return learned
  }

  /**
   * 获取已装备的主动技能
   * @returns {array} 主动技能列表
   */
  async getEquippedActiveSkills() {
    const equipped = []
    for (const skillId of this.hero.activeSkills) {
      const skill = await skillDataService.getSkill(skillId)
      const heroSkill = this.hero.skills[skillId]
      if (skill && heroSkill) {
        equipped.push({
          ...skill,
          level: heroSkill.level,
          currentEffects: skillDataService.getSkillEffect(skillId, heroSkill.level)
        })
      }
    }
    return equipped
  }

  /**
   * 装备主动技能到快捷栏
   * @param {string} skillId - 技能ID
   * @param {number} slotIndex - 快捷栏位置(0-3)
   * @returns {boolean} 是否成功
   */
  async equipActiveSkill(skillId, slotIndex) {
    if (slotIndex < 0 || slotIndex > 3) return false

    // 检查是否已学习
    if (!this.hero.skills[skillId]) return false

    const skill = await skillDataService.getSkill(skillId)
    if (!skill || skill.type !== SKILL_TYPES.ACTIVE) return false

    // 移除已存在的同一技能
    const existingIndex = this.hero.activeSkills.indexOf(skillId)
    if (existingIndex !== -1) {
      this.hero.activeSkills.splice(existingIndex, 1)
    }

    // 插入到指定位置
    this.hero.activeSkills[slotIndex] = skillId

    // 清理undefined
    this.hero.activeSkills = this.hero.activeSkills.filter(Boolean)

    return true
  }

  /**
   * 卸下主动技能
   * @param {number} slotIndex - 快捷栏位置
   * @returns {boolean} 是否成功
   */
  unequipActiveSkill(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.hero.activeSkills.length) return false

    this.hero.activeSkills.splice(slotIndex, 1)
    return true
  }

  /**
   * 计算被动技能对属性的加成
   * @returns {object} 属性加成 { attack, defense, hp, speed, crit }
   */
  calculatePassiveBonuses() {
    const bonuses = {
      attack: 0,
      defense: 0,
      hp: 0,
      speed: 0,
      crit: 0,
      magicDamage: 0,
      mpRegen: 0
    }

    const learnedSkills = this.hero.skills || {}

    for (const [skillId, heroSkill] of Object.entries(learnedSkills)) {
      const effects = skillDataService.getSkillEffect(skillId, heroSkill.level)
      if (!effects) continue

      if (effects.attackBonus) bonuses.attack += effects.attackBonus
      if (effects.defenseBonus) bonuses.defense += effects.defenseBonus
      if (effects.hpBonus) bonuses.hp += effects.hpBonus
      if (effects.speedBonus) bonuses.speed += effects.speedBonus
      if (effects.critBonus) bonuses.crit += effects.critBonus
      if (effects.magicDamageBonus) bonuses.magicDamage += effects.magicDamageBonus
      if (effects.mpRegenPercent) bonuses.mpRegen = effects.mpRegenPercent
    }

    return bonuses
  }

  /**
   * 获取技能在战斗中的效果
   * @param {string} skillId - 技能ID
   * @returns {object} 技能效果和消耗
   */
  async getBattleSkillData(skillId) {
    const skill = await skillDataService.getSkill(skillId)
    const heroSkill = this.hero.skills[skillId]

    if (!skill || !heroSkill) return null

    const effects = skillDataService.getSkillEffect(skillId, heroSkill.level)

    return {
      id: skillId,
      name: skill.name,
      icon: skill.icon,
      description: skill.description,
      type: skill.type,
      mpCost: effects.mpCost || skill.mpCost,
      cooldown: skill.cooldown,
      effects: effects
    }
  }

  /**
   * 检查技能是否可以使用
   * @param {string} skillId - 技能ID
   * @returns {object} { usable: boolean, reason: string }
   */
  async canUseSkill(skillId) {
    const skill = await skillDataService.getSkill(skillId)
    const heroSkill = this.hero.skills[skillId]

    if (!skill || !heroSkill) {
      return { usable: false, reason: '未学会该技能' }
    }

    if (skill.type !== SKILL_TYPES.ACTIVE) {
      return { usable: false, reason: '不是主动技能' }
    }

    const effects = skillDataService.getSkillEffect(skillId, heroSkill.level)
    const mpCost = effects.mpCost || skill.mpCost

    if (this.hero.mp < mpCost) {
      return { usable: false, reason: 'MP不足' }
    }

    return { usable: true, reason: '' }
  }
}

module.exports = { SkillManager }
