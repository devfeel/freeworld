/**
 * API 客户端模块
 * 统一处理所有后端 API 请求
 */

const { API_ENDPOINTS } = require('../config/apiEndpoints')
const { STORAGE_KEYS } = require('../config/storageKeys')

// 从环境变量获取基础URL，如果未设置则使用默认值
const BASE_URL = process.env.API_BASE_URL || 'https://mafagame-api.example.com'

const CONFIG = {
  /**
   * 是否使用 Mock 数据
   * true: 使用本地 mock 数据（开发测试用）
   * false: 连接真实后端服务器
   */
  USE_MOCK: true,

  /**
   * API 基础 URL
   */
  BASE_URL: BASE_URL,

  /**
   * API 超时时间（毫秒）
   */
  TIMEOUT: 10000,

  /**
   * Token 存储 key
   */
  TOKEN_KEY: STORAGE_KEYS.TOKEN_KEY,

  /**
   * 用户信息存储 key
   */
  USER_INFO_KEY: STORAGE_KEYS.USER_INFO,

  /**
   * 角色信息存储 key
   */
  HERO_INFO_KEY: STORAGE_KEYS.HERO_INFO,

  /**
   * 背包数据存储 key
   */
  BAG_INFO_KEY: STORAGE_KEYS.BAG_INFO
}

// 当前 Token
let currentToken = wx.getStorageSync(CONFIG.TOKEN_KEY) || ''

/**
 * 统一请求函数
 */
function request(url, data = null, method = 'POST') {
  return new Promise((resolve, reject) => {
    if (CONFIG.USE_MOCK) {
      // 使用 Mock 数据
      const mock = require('../mock/mockData')
      mock.request(url, data, method)
        .then(resolve)
        .catch(reject)
      return
    }

    // 真实 API 调用
    wx.request({
      url: CONFIG.BASE_URL + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': currentToken ? `Bearer ${currentToken}` : ''
      },
      timeout: CONFIG.TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          const result = res.data
          if (result.code === 0) {
            resolve(result.data || true)
          } else {
            reject(new Error(result.msg || '请求失败'))
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 设置 Token
 */
function setToken(token) {
  currentToken = token
  if (token) {
    wx.setStorageSync(CONFIG.TOKEN_KEY, token)
  } else {
    wx.removeStorageSync(CONFIG.TOKEN_KEY)
  }
}

/**
 * 获取 Token
 */
function getToken() {
  return currentToken
}

// ========== 认证模块 ==========

/**
 * 用户注册
 */
function register(username, password, nickname) {
  return request(API_ENDPOINTS.AUTH.REGISTER, {
    username,
    password,
    nickname
  })
}

/**
 * 用户登录
 */
function login(username, password) {
  return request(API_ENDPOINTS.AUTH.LOGIN, {
    username,
    password
  }).then(data => {
    if (data.token) {
      setToken(data.token)
      // 保存用户信息
      if (data.player) {
        wx.setStorageSync(CONFIG.USER_INFO_KEY, data.player)
      }
    }
    return data
  })
}

/**
 * 用户登出
 */
function logout() {
  return request(API_ENDPOINTS.AUTH.LOGOUT)
    .then(() => {
      setToken(null)
      wx.removeStorageSync(CONFIG.USER_INFO_KEY)
      wx.removeStorageSync(CONFIG.HERO_INFO_KEY)
      wx.removeStorageSync(CONFIG.BAG_INFO_KEY)
    })
}

// ========== 玩家模块 ==========

/**
 * 获取玩家信息
 */
function getPlayerInfo() {
  return request(API_ENDPOINTS.PLAYER.INFO, null, 'GET')
}

/**
 * 更新玩家信息
 */
function updatePlayerInfo(data) {
  return request(API_ENDPOINTS.PLAYER.UPDATE, data)
}

/**
 * 心跳保活
 */
function heartbeat() {
  return request(API_ENDPOINTS.PLAYER.HEARTBEAT)
}

// ========== 角色模块 ==========

/**
 * 获取角色信息
 */
function getHeroInfo() {
  return request(API_ENDPOINTS.HERO.INFO, null, 'GET')
}

/**
 * 更新角色信息
 */
function updateHeroInfo(data) {
  return request(API_ENDPOINTS.HERO.UPDATE, data)
}

/**
 * 穿戴装备
 */
function equipItem(itemId, slot) {
  return request(API_ENDPOINTS.HERO.EQUIP, {
    item_id: itemId,
    slot: slot
  })
}

/**
 * 卸下装备
 */
function unequipItem(slot) {
  return request(API_ENDPOINTS.HERO.UNEQUIP, {
    slot: slot
  })
}

// ========== 背包模块 ==========

/**
 * 获取背包物品列表
 */
function getBagList() {
  return request(API_ENDPOINTS.BAG.LIST, null, 'GET')
}

/**
 * 使用物品
 */
function useItem(itemId) {
  return request(API_ENDPOINTS.BAG.USE, {
    item_id: itemId
  })
}

/**
 * 删除物品
 */
function deleteItem(itemId) {
  return request(API_ENDPOINTS.BAG.DELETE, {
    item_id: itemId
  })
}

// ========== 商城模块 ==========

/**
 * 获取商城列表
 */
function getShopList() {
  return request(API_ENDPOINTS.SHOP.LIST, null, 'GET')
}

/**
 * 购买物品
 */
function buyItem(itemId, count = 1) {
  return request(API_ENDPOINTS.SHOP.BUY, {
    item_id: itemId,
    count: count
  })
}

// ========== 排行榜模块 ==========

/**
 * 获取排行榜
 */
function getRankList() {
  return request(API_ENDPOINTS.RANK.LIST, null, 'GET')
}

// ========== 地下城模块 ==========

/**
 * 获取地下城列表
 */
function getDungeonList() {
  return request(API_ENDPOINTS.DUNGEON.LIST, null, 'GET')
}

/**
 * 获取地下城详情
 */
function getDungeonDetail(dungeonId) {
  return request(API_ENDPOINTS.DUNGEON.DETAIL, { dungeon_id: dungeonId })
}

/**
 * 进入地下城
 */
function enterDungeon(dungeonId, floor = 1) {
  return request(API_ENDPOINTS.DUNGEON.ENTER, {
    dungeon_id: dungeonId,
    floor: floor
  })
}

/**
 * 探索地下城
 */
function exploreDungeon() {
  return request(API_ENDPOINTS.DUNGEON.EXPLORE)
}

// ========== 战斗模块 ==========

/**
 * 开始战斗
 */
function startBattle() {
  return request(API_ENDPOINTS.BATTLE.START)
}

/**
 * 攻击
 */
function attack() {
  return request(API_ENDPOINTS.BATTLE.ATTACK)
}

/**
 * 使用技能
 */
function useSkill(skillId) {
  return request(API_ENDPOINTS.BATTLE.SKILL, {
    skill_id: skillId
  })
}

/**
 * 防御
 */
function defend() {
  return request(API_ENDPOINTS.BATTLE.DEFEND)
}

/**
 * 逃跑
 */
function run() {
  return request(API_ENDPOINTS.BATTLE.RUN)
}

/**
 * 提交战斗结果
 */
function submitBattleResult(result) {
  return request(API_ENDPOINTS.BATTLE.RESULT, result)
}

module.exports = {
  // 配置
  CONFIG,

  // 通用
  setToken,
  getToken,

  // 认证
  register,
  login,
  logout,

  // 玩家
  getPlayerInfo,
  updatePlayerInfo,
  heartbeat,

  // 角色
  getHeroInfo,
  updateHeroInfo,
  equipItem,
  unequipItem,

  // 背包
  getBagList,
  useItem,
  deleteItem,

  // 商城
  getShopList,
  buyItem,

  // 排行榜
  getRankList,

  // 地下城
  getDungeonList,
  getDungeonDetail,
  enterDungeon,
  exploreDungeon,

  // 战斗
  startBattle,
  attack,
  useSkill,
  defend,
  run,
  submitBattleResult
}
