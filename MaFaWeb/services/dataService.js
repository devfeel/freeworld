/**
 * 数据服务层
 * 统一处理本地存储和API调用
 */

const { API_ENDPOINTS } = require('../config/apiEndpoints')
const { request: mockRequest, API_CONFIG: MOCK_CONFIG } = require('../mock/mockData')
const { STORAGE_KEYS } = require('../config/storageKeys')

// 配置
// 开发模式使用 mock 数据，生产模式使用 API
const USE_API = false  // 设置为true时使用API，false使用mock数据

// 缓存配置
const CACHE_CONFIG = {
  DEFAULT_TIMEOUT: 300000, // 5分钟默认缓存超时
  KEYS: {
    HERO: 'hero_data_cached',
    BAG: 'bag_data_cached',
    SHOP: 'shop_data_cached',
    DUNGEON: 'dungeon_data_cached'
  }
}

class DataManager {
  constructor() {
    this.cache = new Map()
    this.networkStatus = true
    this.syncQueue = [] // 同步队列
  }

  // 检查网络状态
  async checkNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          this.networkStatus = res.networkType !== 'none'
          resolve(this.networkStatus)
        },
        fail: () => {
          this.networkStatus = false
          resolve(false)
        }
      })
    })
  }

  // 带缓存的数据获取
  async getCachedData(key, fetchFn, cacheTime = CACHE_CONFIG.DEFAULT_TIMEOUT) {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp < cacheTime)) {
      return cached.data
    }

    try {
      const data = await fetchFn()
      this.cache.set(key, {
        data,
        timestamp: now
      })
      return data
    } catch (error) {
      console.error(`Failed to fetch data for key ${key}:`, error)

      // 尝试从本地存储获取备份
      const localBackup = wx.getStorageSync(`backup_${key}`)
      if (localBackup) {
        return localBackup
      }

      throw error
    }
  }

  // 清理过期缓存
  clearExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache) {
      if (now - value.timestamp >= CACHE_CONFIG.DEFAULT_TIMEOUT) {
        this.cache.delete(key)
      }
    }
  }

  // 同步数据到本地存储
  syncToLocal(key, data) {
    wx.setStorageSync(key, data)

    // 如果在线，加入同步队列
    if (this.networkStatus && USE_API) {
      this.addToSyncQueue(key, data)
    }
  }

  // 添加到同步队列
  addToSyncQueue(key, data) {
    this.syncQueue.push({ key, data, timestamp: Date.now() })

    // 立即尝试同步（如果可能）
    this.processSyncQueue()
  }

  // 处理同步队列
  async processSyncQueue() {
    if (!this.networkStatus || !USE_API || this.syncQueue.length === 0) {
      return
    }

    const item = this.syncQueue.shift()
    try {
      // 这里将来会调用真正的API
      console.log('Syncing to server:', item)
    } catch (error) {
      // 如果同步失败，放回队列头部
      this.syncQueue.unshift(item)
      console.error('Sync failed, will retry:', error)
    }
  }

  // 获取API请求函数
  getApiRequest() {
    if (USE_API) {
      // 引入真实的API模块
      const apiService = require('../api/index')
      return apiService.request
    }
    return mockRequest
  }
}

const dataManager = new DataManager()

/**
 * 获取游戏数据
 */
async function getGameData() {
  await dataManager.checkNetworkStatus()

  if (USE_API && dataManager.networkStatus) {
    try {
      const apiRequest = dataManager.getApiRequest()
      const [heroData, bagData] = await Promise.all([
        apiRequest(API_ENDPOINTS.HERO.INFO, {}, 'GET'),
        apiRequest(API_ENDPOINTS.BAG.LIST, {}, 'GET')
      ])

      if (heroData.code === 0 && bagData.code === 0) {
        const processedData = {
          hero: heroData.data,
          bag: {
            items: bagData.data.map(item => ({
              uid: item.id, // 使用id作为唯一标识
              id: item.item_id,
              name: item.name,
              type: item.type,
              subType: item.sub_type,
              rarity: item.rarity,
              count: item.count,
              // 从item_id推断装备槽位
              slot: getSlotFromItemId(item.item_id)
            }))
          }
        }

        // 同步到本地缓存
        dataManager.syncToLocal(CACHE_CONFIG.KEYS.HERO, processedData.hero)
        dataManager.syncToLocal(CACHE_CONFIG.KEYS.BAG, processedData.bag)

        return processedData
      }
    } catch (error) {
      console.error('API获取游戏数据失败:', error)
    }
  }

  return getLocalGameData()
}

/**
 * 保存游戏数据
 */
async function saveGameData(hero, bag) {
  await dataManager.checkNetworkStatus()

  if (USE_API && dataManager.networkStatus) {
    try {
      // API模式下，只需要保存本地缓存，由API自动同步
      dataManager.syncToLocal(`${STORAGE_KEYS.GAME_DATA}_cache`, {
        hero,
        bag
      })
      return true
    } catch (error) {
      console.error('保存游戏数据失败:', error)
      return false
    }
  }

  // 本地存储模式
  return saveLocalGameData(hero, bag)
}

/**
 * 使用物品
 */
async function useItem(itemIndex) {
  await dataManager.checkNetworkStatus()

  if (USE_API && dataManager.networkStatus) {
    try {
      const apiRequest = dataManager.getApiRequest()
      const bagData = await apiRequest(API_ENDPOINTS.BAG.LIST, {}, 'GET')
      const item = bagData.data[itemIndex]
      if (!item) return false

      const result = await apiRequest(API_ENDPOINTS.BAG.USE, { item_id: item.item_id }, 'POST')
      if (result.code === 0) {
        // 刷新数据
        const newData = await getGameData()
        return newData
      }
      return false
    } catch (error) {
      console.error('API使用物品失败:', error)
      return false
    }
  }
  return useLocalItem(itemIndex)
}

/**
 * 装备物品
 */
async function equipItem(itemIndex, slot) {
  await dataManager.checkNetworkStatus()

  if (USE_API && dataManager.networkStatus) {
    try {
      const apiRequest = dataManager.getApiRequest()
      const bagData = await apiRequest(API_ENDPOINTS.BAG.LIST, {}, 'GET')
      const item = bagData.data[itemIndex]
      if (!item) return false

      const result = await apiRequest(API_ENDPOINTS.HERO.EQUIP, { item_id: item.item_id, slot }, 'POST')
      if (result.code === 0) {
        // 刷新数据
        const newData = await getGameData()
        return newData
      }
      return false
    } catch (error) {
      console.error('API装备物品失败:', error)
      return false
    }
  }
  return equipLocalItem(itemIndex, slot)
}

/**
 * 出售物品
 */
async function sellItem(itemIndex) {
  await dataManager.checkNetworkStatus()

  if (USE_API && dataManager.networkStatus) {
    try {
      const apiRequest = dataManager.getApiRequest()
      const bagData = await apiRequest(API_ENDPOINTS.BAG.LIST, {}, 'GET')
      const item = bagData.data[itemIndex]
      if (!item) return false

      // 模拟调用删除接口（服务端没有出售接口）
      await apiRequest(API_ENDPOINTS.BAG.DELETE, { item_id: item.item_id }, 'POST')

      // 刷新数据
      const newData = await getGameData()
      return newData
    } catch (error) {
      console.error('API出售物品失败:', error)
      return false
    }
  }
  return sellLocalItem(itemIndex)
}

// ========== 本地存储实现 ==========

/**
 * 获取本地游戏数据
 */
function getLocalGameData() {
  try {
    // 检查是否有缓存的数据
    const heroData = wx.getStorageSync(CACHE_CONFIG.KEYS.HERO)
    const bagData = wx.getStorageSync(CACHE_CONFIG.KEYS.BAG)

    if (heroData && bagData) {
      return {
        hero: heroData,
        bag: bagData
      }
    }

    const gameData = wx.getStorageSync(STORAGE_KEYS.GAME_DATA)
    if (gameData) {
      return gameData
    }
    return getInitialGameData()
  } catch (error) {
    console.error('加载本地游戏数据失败:', error)
    return getInitialGameData()
  }
}

/**
 * 保存本地游戏数据
 */
function saveLocalGameData(hero, bag) {
  try {
    // 同步到缓存
    dataManager.syncToLocal(CACHE_CONFIG.KEYS.HERO, hero)
    dataManager.syncToLocal(CACHE_CONFIG.KEYS.BAG, bag)

    wx.setStorageSync(STORAGE_KEYS.GAME_DATA, {
      hero,
      bag
    })
    return true
  } catch (error) {
    console.error('保存本地游戏数据失败:', error)
    return false
  }
}

/**
 * 获取初始游戏数据
 */
function getInitialGameData() {
  const { getItem } = require('../data/items')
  const { getExpForLevel } = require('../utils/game-utils')

  return {
    hero: {
      id: 1,
      name: '勇者',
      level: 1,
      exp: 0,
      maxExp: getExpForLevel(1),  // 使用统一的经验值计算函数
      hp: 100,
      maxHp: 100,
      mp: 100,
      maxMp: 100,
      // ========== 核心战斗属性 ==========
      attack: 15,        // 物理攻击
      magicAttack: 0,    // 魔法攻击
      magicDefense: 0,   // 魔法防御
      defense: 5,        // 防御力
      speed: 10,         // 速度（影响先手和闪避）
      crit: 0,           // 暴击率（数值，例如 5 = 5%）
      dodge: 0,          // 闪避率（数值，例如 5 = 5%）
      // ========== 游戏资源 ==========
      gold: 100,         // 金币
      yuanbao: 0,        // 元宝（高级货币）
      // ========== 位置数据（未来扩展地图系统使用）==========
      x: 100,
      y: 100,
      // ========== 装备槽位 ==========
      equipment: {
        weapon: null,
        helmet: null,
        armor: null,
        shield: null,
        necklace: null,
        ring: null,
        belt: null,
        bracer: null,
        amulet: null,
        gem: null,
        mount: null
      },
      // ========== 武器熟练度 ==========
      weaponProficiency: {
        sword: 0,      // 剑熟练度
        axe: 0,        // 斧熟练度
        bow: 0,        // 弓熟练度
        staff: 0,      // 法杖熟练度
        dagger: 0      // 匕首熟练度
      },
      // ========== 技能系统 ==========
      // 已学习的技能（对象格式，key为skillId）
      // normalAttack 是默认普通攻击，无需学习
      skills: {
        'normalAttack': { level: 1, cooldown: 0 }
      },
      // 装备的技能（最多4个，对应战斗界面的4个技能槽）
      activeSkills: ['normalAttack'],
      // ========== 游戏进度 ==========
      defeatedBosses: [],
      dungeonProgress: {}
    },
    bag: {
      items: [
        { ...getItem('potion_small_hp'), uid: Date.now() + Math.random() },
        { ...getItem('potion_small_mp'), uid: Date.now() + Math.random() + 1 },
        { ...getItem('weapon_dao_lv1'), uid: Date.now() + Math.random() + 2 },
        { ...getItem('armor_chest_lv1'), uid: Date.now() + Math.random() + 3 },
        { ...getItem('shield_lv1'), uid: Date.now() + Math.random() + 4 },
        { ...getItem('potion_small_hp'), uid: Date.now() + Math.random() + 5 },
        { ...getItem('potion_small_mp'), uid: Date.now() + Math.random() + 6 }
      ],
      gold: 200
    }
  }
}

/**
 * 本地使用物品
 */
function useLocalItem(itemIndex) {
  const gameData = getLocalGameData()
  const item = gameData.bag.items[itemIndex]
  if (!item) return false

  const hero = gameData.hero

  // 根据物品类型恢复属性
  if (item.type === 'potion') {
    if (item.subType === 'hp') {
      hero.hp = Math.min(hero.hp + (item.hpRestore || 0), hero.maxHp)
    } else if (item.subType === 'mp') {
      hero.mp = Math.min(hero.mp + (item.mpRestore || 0), hero.maxMp)
    } else if (item.subType === 'dual') {
      hero.hp = Math.min(hero.hp + (item.hpRestore || 0), hero.maxHp)
      hero.mp = Math.min(hero.mp + (item.mpRestore || 0), hero.maxMp)
    }
  }

  // 移除使用的物品（如果有数量，减少数量；否则删除）
  if (item.count > 1) {
    item.count -= 1
  } else {
    gameData.bag.items.splice(itemIndex, 1)
  }

  // 保存并返回更新后的数据
  saveLocalGameData(hero, gameData.bag)

  // 返回更新后的 hero 和 bag
  return {
    hero: hero,
    bag: gameData.bag
  }
}

/**
 * 本地装备物品
 */
function equipLocalItem(itemIndex, slot) {
  const gameData = getLocalGameData()
  const item = gameData.bag.items[itemIndex]
  if (!item) return { hero: null, bag: null }

  const hero = gameData.hero

  console.log('装备调试 - 物品:', item, '槽位:', slot, '目标槽位:', item.subType)

  // 验证物品类型（武器或装备）
  if (item.type !== 'weapon' && item.type !== 'equipment') {
    console.log('装备失败 - 物品类型无效:', item.type)
    return { hero: null, bag: null }
  }

  // 验证角色等级是否满足装备需求
  if (item.level && hero.level < item.level) {
    console.log('装备失败 - 角色等级不足:', hero.level, '需要:', item.level)
    return { hero: null, bag: null, message: `需要等级 ${item.level}` }
  }

  let targetSlot = slot

  // 如果没有指定槽位，根据物品类型确定槽位
  if (!targetSlot) {
    // 武器类型统一使用 'weapon' 槽位
    if (item.type === 'weapon') {
      targetSlot = 'weapon'
    } else {
      // 装备类型使用 subType 或从 ID 推断
      targetSlot = item.subType || getSlotFromItemId(item.id)
    }
  }

  console.log('装备调试 - 目标槽位:', targetSlot, '装备槽位:', Object.keys(hero.equipment))

  // 验证槽位是否存在
  if (!hero.equipment.hasOwnProperty(targetSlot)) {
    console.log('装备失败 - 槽位不存在:', targetSlot)
    return { hero: null, bag: null }
  }

  // 获取旧装备
  const oldEquipment = hero.equipment[targetSlot]
  console.log('装备调试 - 旧装备:', oldEquipment)

  // 装备新物品
  hero.equipment[targetSlot] = item

  // 旧装备放回背包或删除
  if (oldEquipment) {
    // 确保旧装备有uid字段
    const itemToBag = oldEquipment.uid ? oldEquipment : { ...oldEquipment, uid: Date.now() + Math.random() }
    gameData.bag.items[itemIndex] = itemToBag
    console.log('装备调试 - 旧装备放回背包')
  } else {
    gameData.bag.items.splice(itemIndex, 1)
    console.log('装备调试 - 从背包删除物品')
  }

  saveLocalGameData(gameData.hero, gameData.bag)
  console.log('装备调试 - 装备成功')

  // 返回更新后的数据
  return {
    hero: gameData.hero,
    bag: gameData.bag
  }
}

/**
 * 本地出售物品
 */
function sellLocalItem(itemIndex) {
  const gameData = getLocalGameData()
  const item = gameData.bag.items[itemIndex]
  if (!item) return false

  const price = item.price || 0

  // 扣除金币
  gameData.hero.gold += price

  // 从背包移除
  gameData.bag.items.splice(itemIndex, 1)

  saveLocalGameData(gameData.hero, gameData.bag)
  return true
}

/**
 * 从物品ID推断装备槽位
 */
function getSlotFromItemId(itemId) {
  if (itemId.includes('helmet')) return 'helmet'
  if (itemId.includes('armor_chest') || itemId.includes('armor_legs') || itemId.includes('armor_boots') || itemId.includes('armor_gloves')) return 'armor'
  if (itemId.includes('shield')) return 'shield'
  if (itemId.includes('necklace')) return 'necklace'
  if (itemId.includes('belt')) return 'belt'
  if (itemId.includes('bracer')) return 'bracer'
  if (itemId.includes('amulet')) return 'amulet'
  if (itemId.includes('gem')) return 'gem'
  if (itemId.includes('ring')) return 'ring'
  if (itemId.includes('mount')) return 'mount'
  if (itemId.includes('weapon_dao') || itemId.includes('weapon_jian') || itemId.includes('weapon_axe') || itemId.includes('weapon_staff') || itemId.includes('weapon_bow')) return 'weapon'
  return 'armor' // 默认
}

/**
 * 计算角色总属性
 * 使用可扩展的属性配置系统，支持未来添加新属性
 * @param {object} heroData - 可选的hero对象，如果不传则从globalData获取
 */
function getTotalStats(heroData = null) {
  let hero = heroData

  // 如果没有传入heroData，则尝试从全局app获取
  if (!hero) {
    try {
      const app = getApp()
      if (app) {
        hero = app.globalData?.hero || getLocalGameData().hero
      } else {
        // 在非微信环境中，直接使用本地数据
        hero = getLocalGameData().hero
      }
    } catch (e) {
      // getApp() 不存在于当前环境，使用本地数据
      hero = getLocalGameData().hero
    }
  }

  if (!hero) {
    console.error('Hero data is undefined or null')
    // 返回一个默认的空对象
    return {}
  }

  const { getAttributeConfig, ALL_STATS_DISTRIBUTION } = require('../data/items')

  const config = getAttributeConfig()
  const result = {}

  // 确保config存在且为对象
  if (config && typeof config === 'object') {
    // 初始化属性：从角色基础属性开始
    Object.keys(config).forEach(attrKey => {
      const attr = config[attrKey]
      // 使用 baseKey 获取角色基础属性
      const baseValue = hero[attr.baseKey] || 0
      result[attrKey] = baseValue
    })
  }

  // 计算装备提供的属性
  const equipment = hero.equipment

  // 确保equipment存在且为对象
  if (equipment && typeof equipment === 'object') {
    Object.keys(equipment).forEach(slot => {
      const item = equipment[slot]
      if (!item) return

      // 确保config存在且为对象
      if (config && typeof config === 'object') {
        // 普通属性直接累加
        Object.keys(config).forEach(attrKey => {
          const attr = config[attrKey]
          const itemValue = item[attr.key] || 0
          if (itemValue > 0) {
            result[attrKey] = (result[attrKey] || 0) + itemValue
          }
        })
      }

      // 处理特殊属性：allStats（全属性加成）
      if (item.allStats && item.allStats > 0) {
        const allStatsValue = item.allStats

        // 确保ALL_STATS_DISTRIBUTION存在且为对象
        if (ALL_STATS_DISTRIBUTION && typeof ALL_STATS_DISTRIBUTION === 'object') {
          // 按权重分配到各项属性
          Object.keys(ALL_STATS_DISTRIBUTION).forEach(attrKey => {
            const weight = ALL_STATS_DISTRIBUTION[attrKey]
            const attr = config && config[attrKey]

            if (attr && attr.isPercent) {
              // 百分比属性（如暴击、闪避），转换为百分比
              result[attrKey] = (result[attrKey] || 0) + Math.floor(allStatsValue * weight / 10)
            } else {
              // 数值属性直接分配
              result[attrKey] = (result[attrKey] || 0) + Math.floor(allStatsValue * weight)
            }
          })
        }
      }
    })
  }

  // 确保最小值为0（防止负值）
  if (result && typeof result === 'object') {
    Object.keys(result).forEach(key => {
      if (result[key] < 0) {
        result[key] = 0
      }
    })
  }

  // 返回结果对象，包含所有属性
  return result || {}
}

/**
 * 设置API模式
 */
function setUseApi(useApi) {
  if (useApi) {
    USE_API = true
  }
}

// ========== 武器熟练度系统 ==========

// 熟练度等级配置（提高要求，更有阶梯性）
const PROFICIENCY_TIER = [
  { min: 0, max: 1000, name: '新手', bonus: 0 },           // 0-1000 (0%)
  { min: 1001, max: 3000, name: '进阶', bonus: 0.02 },     // 1001-3000 (+2%)
  { min: 3001, max: 6000, name: '熟练', bonus: 0.04 },     // 3001-6000 (+4%)
  { min: 6001, max: 10000, name: '精英', bonus: 0.06 },    // 6001-10000 (+6%)
  { min: 10001, max: 15000, name: '专家', bonus: 0.08 },   // 10001-15000 (+8%)
  { min: 15001, max: 22000, name: '大师', bonus: 0.10 },   // 15001-22000 (+10%)
  { min: 22001, max: 32000, name: '宗师', bonus: 0.12 },   // 22001-32000 (+12%)
  { min: 32001, max: 50000, name: '传奇', bonus: 0.15 },   // 32001-50000 (+15%)
  { min: 50001, max: 80000, name: '神话', bonus: 0.18 },   // 50001-80000 (+18%)
  { min: 80001, max: 999999999, name: '不朽', bonus: 0.20 } // 80001+ (+20%)
]

// 武器装备所需的熟练度要求（根据武器等级）
const WEAPON_PROFICIENCY_REQUIRE = {
  1: 0,      // 1级武器不需要熟练度
  11: 50,    // 11级武器需要50熟练度
  21: 150,   // 21级武器需要150熟练度
  31: 350,   // 31级武器需要350熟练度
  41: 650,   // 41级武器需要650熟练度
  51: 1050,  // 51级武器需要1050熟练度
  61: 1600,  // 61级武器需要1600熟练度
  71: 2300,  // 71级武器需要2300熟练度
  81: 3200,  // 81级武器需要3200熟练度
  91: 4500   // 91级武器需要4500熟练度
}

/**
 * 获取武器类型对应的熟练度键名
 * @param {string} weaponType - 武器类型 (weapon_dao, weapon_jian, weapon_axe, weapon_staff, weapon_bow)
 * @returns {string} 熟练度键名
 */
function getProficiencyKey(weaponType) {
  const keyMap = {
    'weapon_dao': 'dao',
    'weapon_jian': 'jian',
    'weapon_axe': 'axe',
    'weapon_staff': 'staff',
    'weapon_bow': 'bow'
  }
  return keyMap[weaponType] || null
}

/**
 * 获取武器装备所需的熟练度
 * @param {number} weaponLevel - 武器等级
 * @returns {number} 所需熟练度
 */
function getRequiredProficiency(weaponLevel) {
  // 找到最接近但不高于武器等级的阈值
  let required = 0
  const levels = Object.keys(WEAPON_PROFICIENCY_REQUIRE).map(Number).sort((a, b) => a - b)

  for (const level of levels) {
    if (weaponLevel >= level) {
      required = WEAPON_PROFICIENCY_REQUIRE[level]
    }
  }
  return required
}

/**
 * 检查是否可以装备武器
 * @param {object} hero - 英雄对象
 * @param {object} weapon - 武器对象
 * @returns {object} { canEquip: boolean, message: string }
 */
function checkWeaponRequirement(hero, weapon) {
  if (!weapon || !weapon.subType) {
    return { canEquip: true, message: '' }
  }

  const profKey = getProficiencyKey(weapon.subType)
  if (!profKey) {
    return { canEquip: true, message: '' }
  }

  const required = getRequiredProficiency(weapon.level || 1)
  const current = hero.weaponProficiency?.[profKey] || 0

  if (current < required) {
    const tier = getProficiencyTier(current)
    return {
      canEquip: false,
      message: `需要${weapon.subType}熟练度 ${required} (当前: ${current} ${tier ? '['+tier.name+']' : '[新手]'})`
    }
  }
  return { canEquip: true, message: '' }
}

/**
 * 增加武器熟练度（战斗胜利后）
 * @param {object} hero - 英雄对象
 * @param {string} weaponType - 武器类型
 * @param {number} amount - 增加量（每次战斗基础+3，等级越高加成越多）
 */
function addWeaponProficiency(hero, weaponType, baseAmount = 3) {
  if (!hero.weaponProficiency) {
    hero.weaponProficiency = {
      dao: 0,
      jian: 0,
      axe: 0,
      staff: 0,
      bow: 0
    }
  }

  const profKey = getProficiencyKey(weaponType)
  if (!profKey) return

  // 熟练度获取量 = 基础 + (角色等级 / 5)，每5级多+1
  const bonus = Math.floor(hero.level / 5)
  const amount = baseAmount + bonus

  hero.weaponProficiency[profKey] = (hero.weaponProficiency[profKey] || 0) + amount
}

/**
 * 获取熟练度等级信息
 * @param {number} proficiency - 熟练度值
 * @returns {object} 等级信息
 */
function getProficiencyTier(proficiency) {
  for (const tier of PROFICIENCY_TIER) {
    if (proficiency >= tier.min && proficiency <= tier.max) {
      return tier
    }
  }
  return PROFICIENCY_TIER[0]
}

/**
 * 获取武器熟练度加成（阶梯式）
 * @param {number} proficiency - 熟练度值
 * @returns {number} 攻击力加成倍数
 */
function getProficiencyBonus(proficiency) {
  const tier = getProficiencyTier(proficiency)
  return tier.bonus
}

/**
 * 计算武器攻击伤害（含熟练度加成）
 * @param {object} hero - 英雄对象
 * @param {object} weapon - 武器对象
 * @param {number} baseAttack - 基础攻击力
 * @returns {number} 最终攻击力
 */
function calculateWeaponDamage(hero, weapon, baseAttack) {
  if (!weapon || !weapon.subType) {
    return baseAttack
  }

  const profKey = getProficiencyKey(weapon.subType)
  if (!profKey) {
    return baseAttack
  }

  const proficiency = hero.weaponProficiency?.[profKey] || 0
  const bonus = getProficiencyBonus(proficiency)

  return Math.floor(baseAttack * (1 + bonus))
}

module.exports = {
  getGameData,
  saveGameData,
  useItem,
  equipItem,
  sellItem,
  getTotalStats,
  setUseApi,
  // 武器熟练度相关
  addWeaponProficiency,
  getProficiencyBonus,
  getProficiencyKey,
  getProficiencyTier,
  getRequiredProficiency,
  checkWeaponRequirement,
  calculateWeaponDamage,
  // 熟练度等级配置
  PROFICIENCY_TIER,
  WEAPON_PROFICIENCY_REQUIRE,
  // 内部管理函数
  dataManager
}
