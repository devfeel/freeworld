/**
 * 技能数据服务
 * 支持mock数据和后端API切换
 */

// 配置：是否使用mock数据
const USE_MOCK = true

// Mock数据（开发测试用）
const mockSkillsData = {
  // 普通攻击（默认技能，无需学习）
  normalAttack: {
    id: 'normalAttack',
    name: '普通攻击',
    type: 'active',
    category: 'common',
    icon: '⚔️',
    description: '基础的普通攻击，造成100%物理伤害，无需MP',
    level: 1,
    maxLevel: 1,
    mpCost: 0,
    cooldown: 0,
    unlockLevel: 1,
    unlockCost: 0,
    effects: { damageMultiplier: 1.0, element: 'none' },
    upgrade: {
      damageMultiplier: [1.0],
      mpCost: [0],
      upgradeCost: [0]
    }
  },
  // 主动技能
  heavyStrike: {
    id: 'heavyStrike',
    name: '重击',
    type: 'active',
    category: 'warrior',
    icon: '🔨',
    description: '奋力一击，造成150%物理伤害',
    level: 1,
    maxLevel: 5,
    mpCost: 15,
    cooldown: 0,
    unlockLevel: 1,
    unlockCost: 0,
    effects: { damageMultiplier: 1.5, element: 'none' },
    upgrade: {
      damageMultiplier: [1.5, 1.7, 1.9, 2.1, 2.3],
      mpCost: [15, 18, 21, 24, 27],
      upgradeCost: [0, 500, 1500, 3000, 5000]
    }
  },
  fireball: {
    id: 'fireball',
    name: '火球术',
    type: 'active',
    category: 'mage',
    icon: '🔥',
    description: '发射火球造成120%伤害，附加灼烧效果',
    level: 1,
    maxLevel: 5,
    mpCost: 20,
    cooldown: 0,
    unlockLevel: 1,
    unlockCost: 0,
    effects: { damageMultiplier: 1.2, element: 'fire', burnDamage: 0.05, burnDuration: 3 },
    upgrade: {
      damageMultiplier: [1.2, 1.35, 1.5, 1.65, 1.8],
      mpCost: [20, 24, 28, 32, 36],
      upgradeCost: [0, 500, 1500, 3000, 5000]
    }
  },
  rapidShot: {
    id: 'rapidShot',
    name: '连射',
    type: 'active',
    category: 'ranger',
    icon: '🏹',
    description: '快速射出3支箭，每支造成50%伤害',
    level: 1,
    maxLevel: 4,
    mpCost: 20,
    cooldown: 1,
    unlockLevel: 1,
    unlockCost: 0,
    effects: { damageMultiplier: 0.5, shotCount: 3 },
    upgrade: {
      damageMultiplier: [0.5, 0.6, 0.7, 0.8],
      shotCount: [3, 3, 4, 4],
      mpCost: [20, 24, 28, 32],
      upgradeCost: [0, 600, 1800, 3500]
    }
  },
  heal: {
    id: 'heal',
    name: '治疗术',
    type: 'active',
    category: 'common',
    icon: '💚',
    description: '恢复自身30%最大生命值',
    level: 1,
    maxLevel: 5,
    mpCost: 25,
    cooldown: 3,
    unlockLevel: 1,
    unlockCost: 500,
    effects: { healPercent: 0.3 },
    upgrade: {
      healPercent: [0.3, 0.35, 0.4, 0.45, 0.5],
      mpCost: [25, 28, 31, 34, 37],
      upgradeCost: [500, 1000, 2500, 5000, 8000]
    }
  },
  // 被动技能
  vitality: {
    id: 'vitality',
    name: '活力',
    type: 'passive',
    category: 'common',
    icon: '❤️',
    description: '永久提升最大生命值',
    level: 1,
    maxLevel: 5,
    unlockLevel: 1,
    unlockCost: 200,
    effects: { hpBonus: 50 },
    upgrade: {
      hpBonus: [50, 100, 180, 280, 400],
      upgradeCost: [200, 600, 1500, 3000, 5500]
    }
  },
  strength: {
    id: 'strength',
    name: '力量强化',
    type: 'passive',
    category: 'common',
    icon: '⚔️',
    description: '永久提升攻击力',
    level: 1,
    maxLevel: 5,
    unlockLevel: 1,
    unlockCost: 200,
    effects: { attackBonus: 8 },
    upgrade: {
      attackBonus: [8, 18, 32, 50, 72],
      upgradeCost: [200, 600, 1500, 3000, 5500]
    }
  }
}

/**
 * 技能数据服务类
 */
class SkillDataService {
  constructor() {
    this.useMock = USE_MOCK
    this.cache = null
    this.lastFetch = 0
    this.cacheDuration = 5 * 60 * 1000 // 5分钟缓存
  }

  /**
   * 获取所有技能
   * @returns {Promise<Array>} 技能列表
   */
  async getAllSkills() {
    if (this.useMock) {
      return Object.values(mockSkillsData)
    }

    // 检查缓存
    if (this.cache && Date.now() - this.lastFetch < this.cacheDuration) {
      return this.cache
    }

    try {
      // 从后端API获取
      const response = await this.fetchFromAPI('/api/skills')
      this.cache = response
      this.lastFetch = Date.now()
      return response
    } catch (error) {
      console.error('获取技能数据失败，使用mock数据:', error)
      return Object.values(mockSkillsData)
    }
  }

  /**
   * 获取单个技能
   * @param {string} skillId 技能ID
   * @returns {Promise<Object>} 技能数据
   */
  async getSkill(skillId) {
    if (this.useMock) {
      return mockSkillsData[skillId] || null
    }

    try {
      return await this.fetchFromAPI(`/api/skills/${skillId}`)
    } catch (error) {
      console.error(`获取技能 ${skillId} 失败:`, error)
      return mockSkillsData[skillId] || null
    }
  }

  /**
   * 获取某等级可解锁的技能
   * @param {number} heroLevel 英雄等级
   * @returns {Promise<Array>} 可解锁技能列表
   */
  async getUnlockableSkills(heroLevel) {
    const allSkills = await this.getAllSkills()
    return allSkills.filter(skill => skill.unlockLevel <= heroLevel)
  }

  /**
   * 按分类获取技能
   * @param {string} category 分类
   * @returns {Promise<Array>} 技能列表
   */
  async getSkillsByCategory(category) {
    const allSkills = await this.getAllSkills()
    return allSkills.filter(skill => skill.category === category)
  }

  /**
   * 获取技能效果（根据等级）
   * @param {string} skillId 技能ID
   * @param {number} level 等级
   * @returns {Object} 效果数据
   */
  getSkillEffect(skillId, level) {
    const skill = mockSkillsData[skillId]
    if (!skill) return null

    const effects = {}
    const levelIndex = Math.max(0, level - 1)

    for (const [key, value] of Object.entries(skill.effects)) {
      if (skill.upgrade && skill.upgrade[key]) {
        effects[key] = skill.upgrade[key][Math.min(levelIndex, skill.upgrade[key].length - 1)]
      } else {
        effects[key] = value
      }
    }

    return effects
  }

  /**
   * 获取升级所需金币
   * @param {string} skillId 技能ID
   * @param {number} currentLevel 当前等级
   * @returns {number} 升级费用
   */
  getUpgradeCost(skillId, currentLevel) {
    const skill = mockSkillsData[skillId]
    if (!skill || !skill.upgrade || !skill.upgrade.upgradeCost) return null

    const levelIndex = Math.max(0, currentLevel - 1)
    return skill.upgrade.upgradeCost[Math.min(levelIndex, skill.upgrade.upgradeCost.length - 1)]
  }

  /**
   * 从API获取数据
   * @param {string} endpoint API端点
   * @returns {Promise<Object>} 响应数据
   */
  async fetchFromAPI(endpoint) {
    const app = getApp()
    const baseURL = app.globalData.apiBaseURL || 'https://api.example.com'

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseURL}${endpoint}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token') || ''}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`API错误: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
  }

  /**
   * 学习技能（调用后端API）
   * @param {string} skillId 技能ID
   * @returns {Promise<Object>} 结果
   */
  async learnSkill(skillId) {
    if (this.useMock) {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        message: '学习成功',
        skillId,
        goldCost: mockSkillsData[skillId]?.unlockCost || 0
      }
    }

    try {
      return await this.postToAPI('/api/skills/learn', { skillId })
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  /**
   * 升级技能（调用后端API）
   * @param {string} skillId 技能ID
   * @returns {Promise<Object>} 结果
   */
  async upgradeSkill(skillId) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        message: '升级成功',
        skillId
      }
    }

    try {
      return await this.postToAPI('/api/skills/upgrade', { skillId })
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  /**
   * POST请求
   */
  async postToAPI(endpoint, data) {
    const app = getApp()
    const baseURL = app.globalData.apiBaseURL || 'https://api.example.com'

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseURL}${endpoint}`,
        method: 'POST',
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wx.getStorageSync('token') || ''}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`API错误: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
  }
}

// 导出单例
const skillDataService = new SkillDataService()

module.exports = {
  skillDataService,
  mockSkillsData
}
