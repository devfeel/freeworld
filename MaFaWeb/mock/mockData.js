/**
 * Mock 数据模块
 * 模拟所有 API 接口的返回数据
 */

const { API_ENDPOINTS } = require('../config/apiEndpoints')
const { STORAGE_KEYS } = require('../config/storageKeys')
const { MONSTERS, DUNGEONS } = require('../data/gameData')
const { getItem, getEquipmentDrops } = require('../data/items')
const { getExpForLevel } = require('./expSystem')

/**
 * 模拟网络延迟
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 统一 Mock 请求处理
 */
async function request(url, data, method) {
  // 模拟 200ms 网络延迟
  await delay(200)

  // 移除查询参数
  const path = url.split('?')[0]

  switch (path) {
    // ========== 认证模块 ==========
    case API_ENDPOINTS.AUTH.REGISTER:
      return mockRegister(data)

    case API_ENDPOINTS.AUTH.LOGIN:
      return mockLogin(data)

    case API_ENDPOINTS.AUTH.LOGOUT:
      return { code: 0, msg: 'success', data: true }

    // ========== 玩家模块 ==========
    case API_ENDPOINTS.PLAYER.INFO:
      return { code: 0, msg: 'success', data: getMockPlayerData() }

    case API_ENDPOINTS.PLAYER.UPDATE:
      return { code: 0, msg: 'success', data: true }

    case API_ENDPOINTS.PLAYER.HEARTBEAT:
      return { code: 0, msg: 'success', data: { timestamp: Date.now() } }

    // ========== 角色模块 ==========
    case API_ENDPOINTS.HERO.INFO:
      return { code: 0, msg: 'success', data: getMockHeroData() }

    case API_ENDPOINTS.HERO.UPDATE:
      return { code: 0, msg: 'success', data: true }

    case API_ENDPOINTS.HERO.EQUIP:
      return { code: 0, msg: 'success', data: true }

    case API_ENDPOINTS.HERO.UNEQUIP:
      return { code: 0, msg: 'success', data: true }

    // ========== 背包模块 ==========
    case API_ENDPOINTS.BAG.LIST:
      return { code: 0, msg: 'success', data: getMockBagList() }

    case API_ENDPOINTS.BAG.USE:
      return { code: 0, msg: 'success', data: true }

    case API_ENDPOINTS.BAG.DELETE:
      return { code: 0, msg: 'success', data: true }

    // ========== 商城模块 ==========
    case API_ENDPOINTS.SHOP.LIST:
      return { code: 0, msg: 'success', data: getMockShopList() }

    case API_ENDPOINTS.SHOP.BUY:
      return { code: 0, msg: 'success', data: true }

    // ========== 排行榜模块 ==========
    case API_ENDPOINTS.RANK.LIST:
      return { code: 0, msg: 'success', data: getMockRankList() }

    // ========== 地下城模块 ==========
    case API_ENDPOINTS.DUNGEON.LIST:
      return { code: 0, msg: 'success', data: getMockDungeonList() }

    case API_ENDPOINTS.DUNGEON.DETAIL:
      return { code: 0, msg: 'success', data: getMockDungeonDetail(data?.dungeon_id) }

    case API_ENDPOINTS.DUNGEON.ENTER:
      return { code: 0, msg: 'success', data: { floor: data?.floor || 1 } }

    case API_ENDPOINTS.DUNGEON.EXPLORE:
      return { code: 0, msg: 'success', data: getMockExploreResult(data?.player_level || 1) }

    // ========== 战斗模块 ==========
    case API_ENDPOINTS.BATTLE.START:
      return { code: 0, msg: 'success', data: getMockMonster(data?.player_level || 1) }

    case API_ENDPOINTS.BATTLE.ATTACK:
      return { code: 0, msg: 'success', data: getMockBattleResult('attack') }

    case API_ENDPOINTS.BATTLE.SKILL:
      return { code: 0, msg: 'success', data: getMockBattleResult('skill', data?.skill_id) }

    case API_ENDPOINTS.BATTLE.DEFEND:
      return { code: 0, msg: 'success', data: getMockBattleResult('defend') }

    case API_ENDPOINTS.BATTLE.RUN:
      return { code: 0, msg: 'success', data: { success: Math.random() > 0.5 } }

    case API_ENDPOINTS.BATTLE.RESULT:
      return { code: 0, msg: 'success', data: getMockBattleDrops(data?.monster_level || 1, data?.monster_type || 'normal') }

    // ========== 经验值系统模块 ==========
    case API_ENDPOINTS.EXP.INFO:
      return { code: 0, msg: 'success', data: getMockExpInfo(data?.level || 1) }

    case API_ENDPOINTS.EXP.REMAINING:
      return { code: 0, msg: 'success', data: getMockRemainingExp(data?.level || 1, data?.current_exp || 0) }

    default:
      return { code: 404, msg: '接口不存在' }
  }
}

// ========== Mock 数据生成函数 ==========

/**
 * Mock 注册
 */
function mockRegister(data) {
  return {
    code: 0,
    msg: 'success',
    data: {
      player_id: 1,
      username: data.username,
      nickname: data.nickname || data.username
    }
  }
}

/**
 * Mock 登录
 */
function mockLogin(data) {
  return {
    code: 0,
    msg: 'success',
    data: {
      token: 'mock_token_' + Date.now(),
      player: getMockPlayerData()
    }
  }
}

/**
 * Mock 玩家数据
 */
function getMockPlayerData() {
  return {
    id: 1,
    username: 'player1',
    nickname: '冒险者',
    gold: 50,
    yuanbao: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

/**
 * Mock 角色数据
 */
function getMockHeroData() {
  const hero = wx.getStorageSync(STORAGE_KEYS.HERO_INFO) || {
    id: 1,
    player_id: 1,
    name: '勇者',
    level: 1,
    exp: 0,
    max_exp: getExpForLevel(1),  // 使用统一的经验值计算函数
    hp: 100,
    max_hp: 100,
    mp: 100,
    max_mp: 100,
    attack: 15,
    defense: 5,
    speed: 10,
    gold: 50,
    yuanbao: 0,
    physical_defense: 0,
    magic_defense: 0,
    attack_power: 0,
    magic_power: 0,
    taoism_power: 0,
    attack_speed: 0,
    accuracy: 0,
    agility: 0,
    luck: 0,
    x: 100,
    y: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // 确保max_exp总是等于当前等级所需经验
  if (hero.level) {
    hero.max_exp = getExpForLevel(hero.level)
  }

  return hero
}

// ========== 宝箱奖励配置 ==========
// 后续迁移到数据库中管理
const CHEST_CONFIG = {
  // 金币奖励配置
  gold: {
    base: 10,      // 基础值
    multiplier: 5,  // 等级乘数
    variance: 5     // 浮动值
  },
  // 元宝奖励配置
  yuanbao: {
    probability: 0.3,  // 出现概率
    base: 0.5,
    multiplier: 0.5,
    min: 1
  },
  // 装备奖励配置
  equipment: {
    probability: 0.4   // 出现概率
  }
}

// 生成宝箱金币奖励
function generateChestGold(floor) {
  const { gold } = CHEST_CONFIG
  return Math.floor(gold.base + floor * gold.multiplier + Math.random() * gold.variance * floor)
}

// 生成宝箱元宝奖励
function generateChestYuanbao(floor) {
  const { yuanbao } = CHEST_CONFIG
  if (Math.random() > yuanbao.probability) {
    return 0
  }
  const amount = Math.floor(yuanbao.base + floor * yuanbao.multiplier + Math.random() * floor * 0.5)
  return Math.max(yuanbao.min, amount)
}

/**
 * Mock 背包列表
 */
function getMockBagList() {
  const bag = wx.getStorageSync(STORAGE_KEYS.BAG_INFO)
  if (bag && bag.items) {
    return bag.items.map(item => ({
      id: item.id || Date.now(),
      item_id: item.id || item.item_id,
      name: item.name,
      type: item.type,
      sub_type: item.subType || item.sub_type,
      rarity: item.rarity,
      count: item.count || 1,
      level: item.level || 1,
      quality: item.quality || 1
    }))
  }

  return [
    { id: 1, item_id: 'potion_small_hp', name: '小生命药水', type: 'potion', sub_type: 'hp', rarity: 'common', count: 1, price: 10 },
    { id: 2, item_id: 'potion_small_mp', name: '小魔法药水', type: 'potion', sub_type: 'mp', rarity: 'common', count: 1, price: 10 },
    { id: 3, item_id: 'weapon_sword_lv1', name: '木剑 Lv.1', type: 'weapon', sub_type: 'weapon_sword', rarity: 'common', count: 1, price: 50, level: 1, quality: 1 },
    { id: 4, item_id: 'armor_chest_lv1', name: '皮甲 Lv.1', type: 'equipment', sub_type: 'armor_chest', rarity: 'common', count: 1, price: 50, level: 1, quality: 1 }
  ]
}

/**
 * Mock 商城列表
 */
function getMockShopList() {
  const potions = [
    { id: 'potion_small_hp', name: '小生命药水', type: 'potion', sub_type: 'hp', rarity: 'common', price: 10, stock: 999 },
    { id: 'potion_small_mp', name: '小魔法药水', type: 'potion', sub_type: 'mp', rarity: 'common', price: 10, stock: 999 },
    { id: 'potion_medium_hp', name: '中生命药水', type: 'potion', sub_type: 'hp', rarity: 'uncommon', price: 30, stock: 999 },
    { id: 'potion_medium_mp', name: '中魔法药水', type: 'potion', sub_type: 'mp', rarity: 'uncommon', price: 30, stock: 999 },
    { id: 'potion_large_hp', name: '大生命药水', type: 'potion', sub_type: 'hp', rarity: 'rare', price: 80, stock: 999 },
    { id: 'potion_large_mp', name: '大魔法药水', type: 'potion', sub_type: 'mp', rarity: 'rare', price: 80, stock: 999 },
    { id: 'potion_elixir', name: '恢复药剂', type: 'potion', sub_type: 'dual', rarity: 'epic', price: 500, stock: 99 }
  ]

  // 添加一些低级装备
  const lowLevelEquipment = [
    { id: 'weapon_sword_lv1', name: '木剑 Lv.1', type: 'weapon', sub_type: 'weapon_sword', rarity: 'common', price: 50, stock: 99, level: 1, quality: 1 },
    { id: 'weapon_axe_lv1', name: '战斧 Lv.1', type: 'weapon', sub_type: 'weapon_axe', rarity: 'common', price: 50, stock: 99, level: 1, quality: 1 },
    { id: 'armor_chest_lv1', name: '皮甲 Lv.1', type: 'equipment', sub_type: 'armor_chest', rarity: 'common', price: 50, stock: 99, level: 1, quality: 1 },
    { id: 'shield_lv1', name: '木盾 Lv.1', type: 'equipment', sub_type: 'shield', rarity: 'common', price: 50, stock: 99, level: 1, quality: 1 },
    { id: 'necklace_lv1', name: '项链 Lv.1', type: 'equipment', sub_type: 'necklace', rarity: 'common', price: 50, stock: 99, level: 1, quality: 1 },
    { id: 'ring_left_lv1', name: '戒指 Lv.1', type: 'equipment', sub_type: 'ring_left', rarity: 'common', price: 50, stock: 99, level: 1, quality: 1 }
  ]

  return [...potions, ...lowLevelEquipment]
}

/**
 * Mock 排行榜
 */
function getMockRankList() {
  const ranks = [
    { rank: 1, name: '传奇勇士', level: 200, power: 5000 },
    { rank: 2, name: '暗影刺客', level: 195, power: 4875 },
    { rank: 3, name: '圣光法师', level: 190, power: 4750 },
    { rank: 4, name: '狂战士', level: 185, power: 4625 },
    { rank: 5, name: '游侠', level: 180, power: 4500 }
  ]

  // 添加一些随机玩家
  for (let i = 6; i <= 50; i++) {
    const level = Math.floor(Math.random() * 180) + 20
    ranks.push({
      rank: i,
      name: `玩家${i}`,
      level: level,
      power: level * 25
    })
  }

  return ranks.sort((a, b) => b.power - a.power).slice(0, 100)
}

/**
 * Mock 地下城列表
 */
function getMockDungeonList() {
  return Object.values(DUNGEONS).map(d => ({
    id: d.id,
    name: d.name,
    level: d.level,
    floor: d.floor,
    description: d.description,
    icon: d.theme?.icon || '🏰',
    status: 'unlocked'
  })).sort((a, b) => a.level - b.level)
}

/**
 * Mock 地下城详情
 */
function getMockDungeonDetail(dungeonId) {
  const dungeon = DUNGEONS[dungeonId || 1]
  if (!dungeon) {
    return null
  }
  return {
    id: dungeon.id,
    name: dungeon.name,
    level: dungeon.level,
    floor: dungeon.floor,
    description: dungeon.description,
    monsters: dungeon.monsters,
    boss: dungeon.boss,
    boss_at: dungeon.bossAt || dungeon.floor,
    theme: dungeon.theme,
    reward: dungeon.reward,
    unlocked: true
  }
}

/**
 * Mock 探索结果
 */
function getMockExploreResult(playerLevel) {
  const events = ['monster', 'treasure', 'nothing', 'trap']
  const event = events[Math.floor(Math.random() * events.length)]

  if (event === 'monster') {
    // 根据玩家等级获取对应的怪物
    const monsterKeys = Object.keys(MONSTERS).filter(key => {
      const m = MONSTERS[key]
      return m.level <= playerLevel + 5 && m.level >= playerLevel - 5 && !m.isBoss
    })
    const monsterId = monsterKeys[Math.floor(Math.random() * monsterKeys.length)] || 'skeleton_1'

    return {
      type: 'monster',
      monster_id: monsterId
    }
  } else if (event === 'treasure') {
    // 根据玩家等级获取掉落
    const equipments = getEquipmentDrops(playerLevel)
    const randomEquipment = equipments[Math.floor(Math.random() * equipments.length)]

    return {
      type: 'treasure',
      items: randomEquipment ? [{ ...randomEquipment, count: 1 }] : [{ id: 'potion_small_hp', name: '小生命药水', count: 1 }],
      gold: Math.floor(playerLevel * 10) + Math.floor(Math.random() * 50)
    }
  } else {
    return {
      type: 'nothing'
    }
  }
}

/**
 * Mock 怪物数据
 */
function getMockMonster(playerLevel) {
  const monsterKeys = Object.keys(MONSTERS).filter(key => {
    const m = MONSTERS[key]
    return m.level <= playerLevel + 5 && m.level >= playerLevel - 5
  })

  const monsterId = monsterKeys[Math.floor(Math.random() * monsterKeys.length)] || 'skeleton_1'
  const monster = MONSTERS[monsterId]

  return {
    id: monsterId,
    name: monster.name,
    hp: monster.hp,
    max_hp: monster.hp,
    attack: monster.attack,
    defense: monster.defense,
    exp: monster.exp,
    gold: monster.gold,
    level: monster.level,
    type: monster.type,
    is_boss: monster.isBoss || false,
    drops: monster.drops
  }
}

/**
 * Mock 战斗结果
 */
function getMockBattleResult(action, skillId) {
  return {
    action,
    skill_id: skillId,
    damage: Math.floor(Math.random() * 20) + 5,
    crit: Math.random() > 0.8,
    dodge: Math.random() > 0.9,
    enemy_damage: Math.floor(Math.random() * 15) + 3
  }
}

/**
 * Mock 战斗掉落
 */
function getMockBattleDrops(monsterLevel, monsterType) {
  const baseExp = 10 + monsterLevel * 15
  const baseGold = 5 + monsterLevel * 8
  const multiplier = monsterType === 'boss' ? 5 : (monsterType === 'elite' ? 2 : 1)

  // 随机掉落装备
  const equipments = getEquipmentDrops(monsterLevel)
  const dropChance = monsterType === 'boss' ? 1.0 : (monsterType === 'elite' ? 0.4 : 0.05)

  const drops = {
    exp: Math.floor(baseExp * multiplier),
    gold: Math.floor(baseGold * multiplier)
  }

  if (Math.random() < dropChance && equipments.length > 0) {
    const randomEquipment = equipments[Math.floor(Math.random() * equipments.length)]
    drops.items = [
      {
        id: randomEquipment.id,
        name: randomEquipment.name,
        count: 1,
        type: randomEquipment.type,
        sub_type: randomEquipment.subType,
        rarity: randomEquipment.rarity,
        level: randomEquipment.level,
        quality: randomEquipment.quality
      }
    ]
  } else {
    // 掉落药水
    drops.items = [
      {
        id: 'potion_elixir',
        name: '恢复药剂',
        count: 1,
        type: 'potion',
        sub_type: 'dual',
        rarity: 'epic'
      }
    ]
  }

  return drops
}

/**
 * Mock 经验值信息
 */
function getMockExpInfo(level) {
  return {
    level: level,
    exp_for_level: getExpForLevel(level),
    total_exp_for_level: getTotalExpForLevel(level),
    exp_multiplier: 1.0 // 未来可用来实现双倍经验等活动
  }
}

/**
 * Mock 剩余经验值
 */
function getMockRemainingExp(level, currentExp) {
  const expForCurrentLevel = getExpForLevel(level)
  const remaining = expForCurrentLevel - currentExp

  return {
    level: level,
    current_exp: currentExp,
    exp_for_level: expForCurrentLevel,
    remaining_exp: Math.max(0, remaining),
    progress: currentExp / expForCurrentLevel
  }
}

/**
 * 获取总经验（从1级到指定等级）
 */
function getTotalExpForLevel(level) {
  let totalExp = 0
  for (let i = 1; i < level; i++) {
    totalExp += getExpForLevel(i)
  }
  return totalExp
}

module.exports = {
  request,
  getMockPlayerData,
  getMockHeroData,
  getMockBagList,
  getMockShopList,
  getMockDungeonList,
  getMockDungeonDetail,
  // 宝箱奖励相关
  CHEST_CONFIG,
  generateChestGold,
  generateChestYuanbao,
  // 经验值相关
  getMockExpInfo,
  getMockRemainingExp
}
