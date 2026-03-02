/**
 * API 服务层
 * 提供统一的API访问接口，支持mock数据和真实API的无缝切换
 */

// 导入配置和mock数据
const { API_ENDPOINTS } = require('../config/apiEndpoints')
const { STORAGE_KEYS } = require('../config/storageKeys')
const { request: mockRequest } = require('../mock/mockData')

// 配置API基础信息
const API_CONFIG = {
  // 开发环境使用本地服务器，生产环境使用线上
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080', // 实际API地址
  TIMEOUT: 10000,
  ENABLE_MOCK: false, // 控制是否启用mock数据 (false=使用真实API)
  MOCK_DELAY: 200 // mock数据延迟（毫秒）
}

// 网络请求封装
function request(url, data = {}, method = 'POST') {
  if (API_CONFIG.ENABLE_MOCK) {
    // 使用mock数据
    return mockRequest(url, data, method)
  } else {
    // 使用实际API
    return actualRequest(url, data, method)
  }
}

// 实际API请求函数
async function actualRequest(url, data = {}, method = 'POST') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_CONFIG.BASE_URL + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      timeout: API_CONFIG.TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('API请求失败:', err)
        reject(err)
      }
    })
  })
}

// 获取认证token
function getAuthToken() {
  return wx.getStorageSync(STORAGE_KEYS.AUTH_TOKEN) || ''
}

// 设置API配置
function setConfig(config) {
  Object.assign(API_CONFIG, config)
}

// 认证相关API
const authAPI = {
  register(userData) {
    return request(API_ENDPOINTS.AUTH.REGISTER, userData, 'POST')
  },

  login(loginData) {
    return request(API_ENDPOINTS.AUTH.LOGIN, loginData, 'POST')
  },

  logout() {
    return request(API_ENDPOINTS.AUTH.LOGOUT, {}, 'POST')
  }
}

// 玩家相关API
const playerAPI = {
  getInfo() {
    return request(API_ENDPOINTS.PLAYER.INFO, {}, 'GET')
  },

  update(playerData) {
    return request(API_ENDPOINTS.PLAYER.UPDATE, playerData, 'POST')
  },

  heartbeat() {
    return request(API_ENDPOINTS.PLAYER.HEARTBEAT, {}, 'POST')
  }
}

// 角色相关API
const heroAPI = {
  getInfo() {
    return request(API_ENDPOINTS.HERO.INFO, {}, 'GET')
  },

  update(heroData) {
    return request(API_ENDPOINTS.HERO.UPDATE, heroData, 'POST')
  },

  equip(equipData) {
    return request(API_ENDPOINTS.HERO.EQUIP, equipData, 'POST')
  },

  unequip(unequipData) {
    return request(API_ENDPOINTS.HERO.UNEQUIP, unequipData, 'POST')
  }
}

// 背包相关API
const bagAPI = {
  getList() {
    return request(API_ENDPOINTS.BAG.LIST, {}, 'GET')
  },

  useItem(useData) {
    return request(API_ENDPOINTS.BAG.USE, useData, 'POST')
  },

  deleteItem(deleteData) {
    return request(API_ENDPOINTS.BAG.DELETE, deleteData, 'POST')
  }
}

// 商城相关API
const shopAPI = {
  getList() {
    return request(API_ENDPOINTS.SHOP.LIST, {}, 'GET')
  },

  buy(buyData) {
    return request(API_ENDPOINTS.SHOP.BUY, buyData, 'POST')
  }
}

// 地下城相关API
const dungeonAPI = {
  getList() {
    return request(API_ENDPOINTS.DUNGEON.LIST, {}, 'GET')
  },

  getDetail(dungeonId) {
    return request(API_ENDPOINTS.DUNGEON.DETAIL, { dungeon_id: dungeonId }, 'POST')
  },

  enter(enterData) {
    return request(API_ENDPOINTS.DUNGEON.ENTER, enterData, 'POST')
  },

  explore(exploreData) {
    return request(API_ENDPOINTS.DUNGEON.EXPLORE, exploreData, 'POST')
  }
}

// 战斗相关API
const battleAPI = {
  getMonster(monsterData) {
    return request(API_ENDPOINTS.BATTLE.START, monsterData, 'POST')
  },

  attack(attackData) {
    return request(API_ENDPOINTS.BATTLE.ATTACK, attackData, 'POST')
  },

  useSkill(skillData) {
    return request(API_ENDPOINTS.BATTLE.SKILL, skillData, 'POST')
  },

  defend(defendData) {
    return request(API_ENDPOINTS.BATTLE.DEFEND, defendData, 'POST')
  },

  run(runData) {
    return request(API_ENDPOINTS.BATTLE.RUN, runData, 'POST')
  },

  getResult(resultData) {
    return request(API_ENDPOINTS.BATTLE.RESULT, resultData, 'POST')
  }
}

// 排行榜相关API
const rankAPI = {
  getList() {
    return request(API_ENDPOINTS.RANK.LIST, {}, 'GET')
  }
}

// 统一导出所有API
module.exports = {
  // 配置相关
  API_CONFIG,
  setConfig,
  getAuthToken,

  // 各模块API
  authAPI,
  playerAPI,
  heroAPI,
  bagAPI,
  shopAPI,
  dungeonAPI,
  battleAPI,
  rankAPI,

  // 通用请求函数
  request
}