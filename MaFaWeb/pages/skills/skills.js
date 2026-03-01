// pages/skills/skills.js
const app = getApp()
const { SkillManager } = require('../../utils/skill-system')
const { getAllSkills, getSkill, getSkillEffect, getUpgradeCost, SKILL_TYPES, SKILL_CATEGORIES } = require('../../data/skills')

Page({
  data: {
    hero: {},
    skillManager: null,
    currentCategory: 'all',
    categorizedSkills: [],
    equippedSkills: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const hero = app.globalData.hero
    const skillManager = new SkillManager(hero)

    // 更新被动技能加成
    this.applyPassiveBonuses(hero, skillManager)

    this.setData({
      hero,
      skillManager
    })

    this.refreshSkillsList()
    this.refreshEquippedSkills()
  },

  // 应用被动技能加成到英雄属性
  applyPassiveBonuses(hero, skillManager) {
    const bonuses = skillManager.calculatePassiveBonuses()

    // 保存原始属性（如果没有保存过）
    if (!hero.baseStats) {
      hero.baseStats = {
        attack: hero.attack,
        defense: hero.defense,
        maxHp: hero.maxHp,
        speed: hero.speed
      }
    }

    // 应用加成
    hero.attack = (hero.baseStats.attack || hero.attack) + bonuses.attack
    hero.defense = (hero.baseStats.defense || hero.defense) + bonuses.defense
    hero.maxHp = (hero.baseStats.maxHp || hero.maxHp) + bonuses.hp
    hero.speed = (hero.baseStats.speed || hero.speed) + bonuses.speed
    hero.crit = bonuses.crit
    hero.magicDamageBonus = bonuses.magicDamage
    hero.mpRegen = bonuses.mpRegen
  },

  // 刷新技能列表
  refreshSkillsList() {
    const allSkills = getAllSkills()
    const { hero } = this.data

    // 处理技能数据
    const processedSkills = allSkills.map(skill => {
      const learnedSkill = hero.skills ? hero.skills[skill.id] : null
      const isLearned = !!learnedSkill
      const currentLevel = learnedSkill ? learnedSkill.level : 0
      const canLearn = hero.level >= skill.unlockLevel

      // 获取当前等级的效果
      const currentEffects = isLearned ? getSkillEffect(skill.id, currentLevel) : skill.effects

      // 获取升级费用
      const upgradeCost = isLearned && currentLevel < skill.maxLevel
        ? getUpgradeCost(skill.id, currentLevel)
        : null

      // 检查是否已装备
      const equipped = hero.activeSkills && hero.activeSkills.includes(skill.id)

      return {
        ...skill,
        learned: isLearned,
        level: currentLevel,
        canLearn,
        currentEffects,
        upgradeCost,
        equipped,
        mpCost: currentEffects.mpCost || skill.mpCost
      }
    })

    // 按分类分组
    const categories = [
      { key: 'warrior', name: '战士系' },
      { key: 'mage', name: '法师系' },
      { key: 'ranger', name: '游侠系' },
      { key: 'common', name: '通用系' }
    ]

    const { currentCategory } = this.data
    let categorizedSkills = []

    if (currentCategory === 'all') {
      // 显示所有分类
      categorizedSkills = categories.map(cat => ({
        category: cat.key,
        categoryName: cat.name,
        skills: processedSkills.filter(s => s.category === cat.key)
      })).filter(cat => cat.skills.length > 0)
    } else {
      // 只显示选中分类
      const cat = categories.find(c => c.key === currentCategory)
      if (cat) {
        categorizedSkills = [{
          category: cat.key,
          categoryName: cat.name,
          skills: processedSkills.filter(s => s.category === currentCategory)
        }]
      }
    }

    this.setData({ categorizedSkills })
  },

  // 刷新已装备技能
  refreshEquippedSkills() {
    const { hero, skillManager } = this.data
    const equipped = skillManager.getEquippedActiveSkills()

    // 填充到4个槽位
    const equippedSkills = []
    for (let i = 0; i < 4; i++) {
      equippedSkills.push(equipped[i] || null)
    }

    this.setData({ equippedSkills })
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    this.refreshSkillsList()
  },

  // 点击技能
  onSkillTap(e) {
    const skill = e.currentTarget.dataset.skill
    if (!skill.learned && !skill.canLearn) {
      wx.showToast({ title: `需要等级${skill.unlockLevel}`, icon: 'none' })
      return
    }

    // 显示技能详情
    const effects = skill.currentEffects
    let effectText = ''

    if (skill.type === SKILL_TYPES.ACTIVE) {
      if (effects.damageMultiplier) effectText += `伤害: ${Math.floor(effects.damageMultiplier * 100)}%\n`
      if (effects.healPercent) effectText += `恢复: ${Math.floor(effects.healPercent * 100)}%生命\n`
      if (effects.defenseBoost) effectText += `防御+${Math.floor(effects.defenseBoost * 100)}%\n`
      if (effects.attackBoost) effectText += `攻击+${Math.floor(effects.attackBoost * 100)}%\n`
    } else {
      if (effects.attackBonus) effectText += `攻击+${effects.attackBonus}\n`
      if (effects.defenseBonus) effectText += `防御+${effects.defenseBonus}\n`
      if (effects.hpBonus) effectText += `生命+${effects.hpBonus}\n`
      if (effects.speedBonus) effectText += `速度+${effects.speedBonus}\n`
      if (effects.critBonus) effectText += `暴击+${effects.critBonus}%\n`
    }

    wx.showModal({
      title: `${skill.icon} ${skill.name} Lv.${skill.level}/${skill.maxLevel}`,
      content: `${skill.description}\n\n${effectText}`,
      showCancel: false
    })
  },

  // 学习技能
  onLearnTap(e) {
    const skill = e.currentTarget.dataset.skill
    const { skillManager } = this.data

    wx.showModal({
      title: `学习 ${skill.name}`,
      content: `消耗 ${skill.unlockCost} 金币学习该技能？`,
      success: (res) => {
        if (res.confirm) {
          const result = skillManager.learnSkill(skill.id)

          if (result.success) {
            wx.showToast({ title: result.message, icon: 'success' })
            app.saveGameData()
            this.loadData()
          } else {
            wx.showToast({ title: result.message, icon: 'none' })
          }
        }
      }
    })
  },

  // 升级技能
  onUpgradeTap(e) {
    const skill = e.currentTarget.dataset.skill
    const { skillManager } = this.data

    wx.showModal({
      title: `升级 ${skill.name}`,
      content: `消耗 ${skill.upgradeCost} 金币升级到 Lv.${skill.level + 1}？`,
      success: (res) => {
        if (res.confirm) {
          const result = skillManager.upgradeSkill(skill.id)

          if (result.success) {
            wx.showToast({ title: result.message, icon: 'success' })
            app.saveGameData()
            this.loadData()
          } else {
            wx.showToast({ title: result.message, icon: 'none' })
          }
        }
      }
    })
  },

  // 装备/卸下技能
  onEquipTap(e) {
    const skill = e.currentTarget.dataset.skill
    const { skillManager, equippedSkills } = this.data

    if (skill.equipped) {
      // 卸下
      const index = equippedSkills.findIndex(s => s && s.id === skill.id)
      if (index !== -1) {
        skillManager.unequipActiveSkill(index)
        wx.showToast({ title: '已卸下', icon: 'success' })
        app.saveGameData()
        this.loadData()
      }
    } else {
      // 装备 - 找空位
      const emptyIndex = equippedSkills.findIndex(s => !s)
      if (emptyIndex === -1) {
        wx.showToast({ title: '技能栏已满', icon: 'none' })
        return
      }

      skillManager.equipActiveSkill(skill.id, emptyIndex)
      wx.showToast({ title: '已装备', icon: 'success' })
      app.saveGameData()
      this.loadData()
    }
  },

  // 点击已装备槽位
  onEquippedSlotTap(e) {
    const index = e.currentTarget.dataset.index
    const skill = this.data.equippedSkills[index]

    if (!skill) {
      wx.showToast({ title: '点击下方的主动技能进行装备', icon: 'none' })
      return
    }

    wx.showActionSheet({
      itemList: [`卸下 ${skill.name}`, '查看详情'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const { skillManager } = this.data
          skillManager.unequipActiveSkill(index)
          wx.showToast({ title: '已卸下', icon: 'success' })
          app.saveGameData()
          this.loadData()
        } else if (res.tapIndex === 1) {
          this.onSkillTap({ currentTarget: { dataset: { skill } } })
        }
      }
    })
  }
})
