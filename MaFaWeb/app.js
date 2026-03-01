// app.js
const dataService = require('./services/dataService')
const { taskTracker } = require('./utils/taskTracker')
const { updateTaskProgress, onExpGained, onGoldGained } = require('./utils/taskUtils')
const { getExpForLevel } = require('./utils/game-utils')
const { SkillManager } = require('./utils/skill-system')
const { getSkillEffect, SKILL_TYPES } = require('./data/skills')

App({
  globalData: {
    // 游戏状态
    gameStatus: 'idle', // idle, battling

    // 角色数据
    hero: {},

    // 背包数据
    bag: {
      items: [],
      gold: 0
    },

    // 当前战斗
    currentBattle: null,

    // 当前选择的地下城ID
    currentDungeonId: null,

    // 网络状态
    networkConnected: true
  },

  // 初始化
  onLaunch() {
    console.log('应用启动')

    // 初始化任务追踪器
    taskTracker.initialize()

    // 检查每日任务是否需要刷新
    taskTracker.checkDailyRefresh()

    // 监听网络状态变化
    this.setupNetworkListener()

    // 加载游戏数据
    this.loadGameData()
  },

  // 设置网络状态监听
  setupNetworkListener() {
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkConnected = res.isConnected
      console.log('网络状态变更:', res.networkType, '连接:', res.isConnected)
    })
  },

  // 加载游戏数据
  async loadGameData() {
    try {
      console.log('开始加载游戏数据...')
      const data = await dataService.getGameData()

      this.globalData.hero = data.hero
      this.globalData.bag = data.bag

      console.log('游戏数据加载成功', {
        level: data.hero.level,
        gold: data.hero.gold,
        item_count: data.bag.items.length
      })
    } catch (error) {
      console.error('游戏数据加载失败', error)
      // 使用默认数据
      this.initDefaultData()
    }
  },

  // 初始化默认数据
  initDefaultData() {
    const initialData = dataService.getInitialGameData()
    this.globalData.hero = initialData.hero
    this.globalData.bag = initialData.bag
    console.log('已初始化默认数据')
  },

  // 计算角色总属性
  getTotalStats(heroData) {
    // 如果传入了特定hero数据，使用该数据，否则使用全局数据
    let hero = heroData || this.globalData?.hero

    // 添加额外的安全检查，确保即使globalData.hero是undefined也不出错
    if (!hero) {
      // 如果没有可用的hero数据，使用一个空对象作为默认值
      hero = {}
    }

    return dataService.getTotalStats(hero)
  },

  // 添加经验值
  addExp(exp) {
    const hero = this.globalData.hero
    hero.exp += exp

    // 获取当前等级所需的经验值
    const currentLevelExp = getExpForLevel(hero.level)

    // 检查升级
    while (hero.exp >= currentLevelExp) {
      hero.exp -= currentLevelExp
      hero.level += 1

      // 更新下一级所需经验值
      hero.maxExp = getExpForLevel(hero.level)

      // 升级属性提升 - 减少属性提升以增加游戏难度
      hero.attack += 2      // 从3降至2
      hero.defense += 1     // 从2降至1
      hero.speed += 0.5     // 从1降至0.5
      hero.maxHp += 12      // 从20降至12
      hero.maxMp += 6       // 从10降至6
      hero.hp = hero.maxHp
      hero.mp = hero.maxMp

      console.log(`角色升级到 Lv.${hero.level}`)
    }

    // 更新任务追踪器 - 经验值获取事件
    onExpGained(exp)

    // 检查任务完成情况
    taskTracker.checkAndCompleteTasks(this.globalData.hero)

    this.saveGameData()
  },

  // 添加物品到背包
  addItem(item) {
    this.globalData.bag.items.push(item)

    // 更新任务追踪器 - 获取物品事件
    taskTracker.updateStats('item_acquire', 1)

    // 检查任务完成情况
    taskTracker.checkAndCompleteTasks(this.globalData.hero)

    this.saveGameData()
  },

  // 使用物品
  async useItem(index) {
    const result = await dataService.useItem(index)
    if (result) {
      this.globalData.hero = result.hero
      this.globalData.bag = result.bag
    }
    return result
  },

  // 装备物品
  async equipItem(index, slot) {
    const result = await dataService.equipItem(index, slot)
    if (result && result.hero) {
      this.globalData.hero = result.hero
      this.globalData.bag = result.bag

      // 更新任务追踪器 - 装备物品事件
      taskTracker.updateStats('item_equip', 1)

      // 检查是否装备了全套装备
      const equipmentCount = Object.keys(result.hero.equipment || {}).filter(key =>
        result.hero.equipment[key] !== null
      ).length

      // 如果装备了6件装备，认为是全套
      if (equipmentCount >= 6) {
        taskTracker.updateStats('equip_full_set', true)
      }
    }

    // 检查任务完成情况
    taskTracker.checkAndCompleteTasks(this.globalData.hero)

    return result
  },

  // 卸下装备
  unequipItem(slot) {
    const hero = this.globalData.hero
    const oldEquipment = hero.equipment[slot]

    if (!oldEquipment) return false

    // 放回背包
    this.addItem({ ...oldEquipment, uid: Date.now() + Math.random() })

    // 卸下装备
    hero.equipment[slot] = null

    this.saveGameData()
    return true
  },

  // 出售物品
  async sellItem(index) {
    const result = await dataService.sellItem(index)
    if (result) {
      // 计算获得的金币差额
      const goldGained = result.hero.gold - this.globalData.hero.gold

      this.globalData.hero = result.hero
      this.globalData.bag = result.bag

      // 更新任务追踪器 - 金币获取事件
      if (goldGained > 0) {
        onGoldGained(goldGained)
      }
    }

    // 更新任务追踪器 - 出售物品事件
    taskTracker.updateStats('item_sell', 1)

    // 检查任务完成情况
    taskTracker.checkAndCompleteTasks(this.globalData.hero)

    return result
  },

  // 保存游戏数据
  async saveGameData() {
    const result = await dataService.saveGameData(this.globalData.hero, this.globalData.bag)
    return result
  },

  // 检查网络状态
  isOnline() {
    return this.globalData.networkConnected && dataService.dataManager.networkStatus
  },

  // 设置API模式
  setUseApiMode(useApi) {
    dataService.setUseApi(useApi)
  },

  // 同步数据到服务器（如果在线）
  async syncGameData() {
    if (this.isOnline()) {
      try {
        await this.saveGameData()
        console.log('数据同步到服务器成功')
        return true
      } catch (error) {
        console.error('数据同步失败:', error)
        return false
      }
    }
    return false
  }
})
