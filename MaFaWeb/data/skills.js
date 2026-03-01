/**
 * 技能数据配置（代理到服务层）
 * 所有数据通过 skillDataService 获取，支持mock和API切换
 */

const { skillDataService } = require('../services/skillService')

// 技能类型枚举
const SKILL_TYPES = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  TRIGGER: 'trigger'
}

// 技能分类枚举
const SKILL_CATEGORIES = {
  WARRIOR: 'warrior',
  MAGE: 'mage',
  RANGER: 'ranger',
  COMMON: 'common'
}

// 元素类型枚举
const ELEMENT_TYPES = {
  NONE: 'none',
  FIRE: 'fire',
  ICE: 'ice',
  LIGHTNING: 'lightning',
  POISON: 'poison',
  HOLY: 'holy'
}

// 导出所有技能定义（异步获取）
async function getAllSkills() {
  return await skillDataService.getAllSkills()
}

// 获取技能定义
async function getSkill(skillId) {
  return await skillDataService.getSkill(skillId)
}

// 按分类获取技能
async function getSkillsByCategory(category) {
  return await skillDataService.getSkillsByCategory(category)
}

// 按类型获取技能
async function getSkillsByType(type) {
  const allSkills = await skillDataService.getAllSkills()
  return allSkills.filter(skill => skill.type === type)
}

// 获取某等级可解锁的技能
async function getUnlockableSkills(heroLevel) {
  return await skillDataService.getUnlockableSkills(heroLevel)
}

// 获取技能的当前效果值（根据等级）
function getSkillEffect(skillId, level) {
  return skillDataService.getSkillEffect(skillId, level)
}

// 获取技能升级所需金币
function getUpgradeCost(skillId, currentLevel) {
  return skillDataService.getUpgradeCost(skillId, currentLevel)
}

// 获取技能MP消耗
function getSkillMpCost(skillId, level) {
  const skill = skillDataService.getSkillEffect(skillId, level)
  return (skill && skill.mpCost) || 0
}

// 获取技能冷却回合
async function getSkillCooldown(skillId) {
  const skill = await skillDataService.getSkill(skillId)
  return (skill && skill.cooldown) || 0
}

module.exports = {
  SKILL_TYPES,
  SKILL_CATEGORIES,
  ELEMENT_TYPES,
  getAllSkills,
  getSkill,
  getSkillsByCategory,
  getSkillsByType,
  getUnlockableSkills,
  getSkillEffect,
  getUpgradeCost,
  getSkillMpCost,
  getSkillCooldown,
  // 导出服务层供直接访问
  skillDataService
}
