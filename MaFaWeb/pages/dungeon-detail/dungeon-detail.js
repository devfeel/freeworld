// pages/dungeon-detail/dungeon-detail.js
const app = getApp()
const { getDungeon, getMonstersByDungeon } = require('../../data/dungeons')
const { getMonster } = require('../../data/monsters')
const { random, showToast } = require('../../utils/game-utils')

Page({
  data: {
    dungeon: null,
    hero: {},
    monsterList: [],
    boss: null,
    progress: 1,
    isCompleted: false,
    isBossDefeated: false,
    // 探索相关状态
    showExploreModal: false,
    exploreResult: null,
    exploreFloor: 1
  },

  onLoad(options) {
    const dungeonId = parseInt(options.id)
    this.loadDungeonDetail(dungeonId)
  },

  onShow() {
    // 刷新数据
    if (this.data.dungeon) {
      this.loadDungeonDetail(this.data.dungeon.id)
    }
  },

  loadDungeonDetail(dungeonId) {
    const dungeon = getDungeon(dungeonId)
    const hero = app.globalData.hero

    // 获取怪物列表
    const monsterIds = getMonstersByDungeon(dungeonId)
    const monsterList = monsterIds.map(id => getMonster(id))

    // 获取BOSS信息
    const boss = getMonster(dungeon.boss)

    // 获取进度（兼容旧格式和新格式）
    const progressData = hero.dungeonProgress?.[dungeonId]
    let progress = 1
    let savedExploreResult = null

    if (typeof progressData === 'number') {
      // 旧格式：直接是层数
      progress = progressData
    } else if (progressData && typeof progressData === 'object') {
      // 新格式：包含层数和探索结果
      progress = progressData.floor || 1
      // 检查探索结果是否在24小时内
      if (progressData.exploreResult && progressData.lastExploreTime) {
        const hoursPassed = (Date.now() - progressData.lastExploreTime) / (1000 * 60 * 60)
        if (hoursPassed < 24) {
          savedExploreResult = progressData.exploreResult
        }
      }
    }

    const defeatedBosses = hero.defeatedBosses || []

    // 检查是否击败BOSS
    const isBossDefeated = defeatedBosses.includes(dungeonId)
    const isCompleted = isBossDefeated

    this.setData({
      dungeon,
      hero,
      monsterList,
      boss,
      progress,
      isCompleted,
      isBossDefeated,
      exploreFloor: progress,
      // 如果有保存的探索结果，恢复它
      exploreResult: savedExploreResult,
      showExploreModal: false
    })
  },

  goBack() {
    wx.navigateBack()
  },

  // 打开探索模态框
  openExploreModal() {
    const { dungeon, progress, exploreResult } = this.data

    // 如果有未处理的探索结果，直接显示探索结果
    if (exploreResult) {
      this.setData({
        showExploreModal: false
      })
      return
    }

    this.setData({
      showExploreModal: true,
      exploreFloor: progress
    })
  },

  // 关闭探索模态框
  closeExploreModal() {
    this.setData({
      showExploreModal: false,
      exploreResult: null
    })
  },

  // 生成宝箱奖励
  generateChestReward(dungeonId, floor) {
    // 从 mockData 获取奖励生成函数（后续迁移到数据库）
    const { generateChestGold, generateChestYuanbao, CHEST_CONFIG } = require('../../mock/mockData')
    const { getEquipmentsByLevel } = require('../../data/items')

    // 生成金币奖励
    const goldReward = generateChestGold(floor)

    // 生成元宝奖励
    const yuanbaoReward = generateChestYuanbao(floor)

    // 随机物品奖励 - 使用 items.js 中定义的装备
    let itemReward = null
    if (Math.random() < CHEST_CONFIG.equipment.probability) {
      // 获取该等级范围内的装备
      const availableEquipments = getEquipmentsByLevel(floor)
      if (availableEquipments && availableEquipments.length > 0) {
        // 随机选择一件装备
        const randomIndex = Math.floor(Math.random() * availableEquipments.length)
        const baseItem = availableEquipments[randomIndex]

        // 创建唯一实例
        itemReward = {
          ...baseItem,
          uid: `${baseItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      }
    }

    return {
      gold: goldReward,
      yuanbao: yuanbaoReward,
      item: itemReward
    }
  },

  // 探索
  explore() {
    const { dungeon, exploreFloor } = this.data

    // 检查是否到达Boss层
    if (exploreFloor >= dungeon.floor) {
      showToast('已到达地下城底层，请挑战Boss！')
      return
    }

    // 随机探索结果：60%概率发现怪物，15%发现宝箱，25%什么都没发现
    const randomValue = Math.random()
    let result = null

    if (randomValue < 0.6) {
      // 发现怪物
      const monsters = getMonstersByDungeon(dungeon.id)
      const monsterId = monsters[Math.floor(Math.random() * monsters.length)]
      const monster = getMonster(monsterId)

      result = {
        foundMonster: true,
        foundChest: false,
        monster: monster,
        chestReward: null,
        event: '',
        canContinue: false
      }
    } else if (randomValue < 0.75) {
      // 发现宝箱
      const chestReward = this.generateChestReward(dungeon.id, exploreFloor)
      result = {
        foundMonster: false,
        foundChest: true,
        monster: null,
        chestReward: chestReward,
        event: '',
        canContinue: false
      }
    } else {
      // 没有发现怪物或宝箱
      const events = [
        '发现了一些奇怪的声音',
        '什么也没发现',
        '前方似乎很安全',
        '发现了一些可疑的痕迹'
      ]
      result = {
        foundMonster: false,
        foundChest: false,
        monster: null,
        chestReward: null,
        event: events[Math.floor(Math.random() * events.length)],
        canContinue: true
      }
    }

    // 显示探索结果时，关闭探索模态框
    this.setData({
      showExploreModal: false,  // 关闭探索模态框
      exploreResult: result  // 显示探索结果弹窗
    })

    // 保存探索状态（包含探索结果）
    this.saveDungeonProgress(dungeon.id, exploreFloor, result)
  },

  // 关闭探索结果弹窗
  closeExploreResult() {
    // 关闭探索结果弹窗，重新打开探索模态框
    this.setData({
      exploreResult: null,
      showExploreModal: true
    })
  },

  // 打开宝箱
  openChest() {
    const { exploreResult } = this.data

    if (!exploreResult || !exploreResult.foundChest || !exploreResult.chestReward) {
      showToast('宝箱数据错误')
      return
    }

    const reward = exploreResult.chestReward

    // 发放金币奖励
    if (reward.gold > 0) {
      app.globalData.hero.gold = (app.globalData.hero.gold || 0) + reward.gold
      showToast(`获得 ${reward.gold} 金币！`)
    }

    // 发放元宝奖励
    if (reward.yuanbao > 0) {
      app.globalData.hero.yuanbao = (app.globalData.hero.yuanbao || 0) + reward.yuanbao
      showToast(`获得 ${reward.yuanbao} 元宝！`)
    }

    // 发放装备奖励
    if (reward.item) {
      // 添加装备到背包
      app.addItem(reward.item)
      showToast(`获得装备：${reward.item.name}！`)
    }

    // 保存游戏
    app.saveGameData()

    // 清除探索结果状态（已处理完当前层事件）
    const { dungeon, exploreFloor } = this.data
    this.saveDungeonProgress(dungeon.id, exploreFloor, null)

    // 关闭探索结果，重新打开探索模态框
    this.setData({
      exploreResult: null,
      showExploreModal: true
    })
  },

  // 存放到包裹
  saveChestToBag() {
    const { exploreResult } = this.data

    if (!exploreResult || !exploreResult.foundChest || !exploreResult.chestReward) {
      showToast('宝箱数据错误')
      return
    }

    const reward = exploreResult.chestReward

    // 将金币和元宝存入包裹（增加hero的gold和yuanbao）
    if (reward.gold > 0) {
      app.globalData.hero.gold = (app.globalData.hero.gold || 0) + reward.gold
    }
    if (reward.yuanbao > 0) {
      app.globalData.hero.yuanbao = (app.globalData.hero.yuanbao || 0) + reward.yuanbao
    }

    // 存放到包裹（添加到背包物品中，显示为"未开启的宝箱"）
    if (reward.item || reward.gold > 0 || reward.yuanbao > 0) {
      const chestItem = {
        id: 'chest_' + Date.now(),
        uid: 'chest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: '未开启的宝箱',
        type: 'chest',
        subType: 'exploration',
        gold: reward.gold,
        yuanbao: reward.yuanbao,
        item: reward.item,
        description: '探索获得的宝箱，可以在这里开启'
      }

      app.addItem(chestItem)

      showToast('已存放到包裹！')
    }

    // 保存游戏
    app.saveGameData()

    // 清除探索结果状态（宝箱已存放到包裹）
    const { dungeon, exploreFloor } = this.data
    this.saveDungeonProgress(dungeon.id, exploreFloor, null)

    // 关闭探索结果，重新打开探索模态框
    this.setData({
      exploreResult: null,
      showExploreModal: true
    })
  },

  // 继续探索
  continueExplore() {
    const { dungeon, exploreResult, exploreFloor } = this.data

    // 先保存需要的信息，再关闭浮层
    this.setData({ exploreResult: null })

    // 如果没有发现怪物和宝箱，继续探索到下一层
    if (!exploreResult.foundMonster && !exploreResult.foundChest) {
      // 进入下一层
      const newFloor = exploreFloor + 1
      this.setData({ exploreFloor: newFloor })

      // 保存地下城进度
      this.saveDungeonProgress(dungeon.id, newFloor)

      // 重新打开探索模态框
      this.setData({ showExploreModal: true })

      // 短暂延迟后重新探索
      setTimeout(() => {
        this.explore()
      }, 300)
      return
    }

    // 如果有怪物，进入战斗，关闭所有模态框
    if (exploreResult.foundMonster) {
      this.setData({ showExploreModal: false })
      wx.navigateTo({
        url: `/pages/battle/battle?monsterId=${exploreResult.monster.id}&isBoss=false&dungeonId=${dungeon.id}&floor=${exploreFloor}`
      })
    }
  },

  // 进入战斗
  goToBattle() {
    const { dungeon, exploreResult, exploreFloor } = this.data

    // 检查是否有怪物
    if (!exploreResult.foundMonster || !exploreResult.monster) {
      showToast('没有发现怪物，请返回后重新探索')
      return
    }

    const monster = exploreResult.monster

    // 保存当前层进度（战斗胜利后会进入下一层）
    this.saveDungeonProgress(dungeon.id, exploreFloor)

    // 关闭所有模态框
    this.setData({
      showExploreModal: false,
      exploreResult: null
    })

    wx.navigateTo({
      url: `/pages/battle/battle?monsterId=${monster.id}&isBoss=false&dungeonId=${dungeon.id}&floor=${exploreFloor}`
    })
  },

  // Boss战
  bossBattle() {
    const { dungeon } = this.data

    // 关闭所有模态框
    this.setData({
      showExploreModal: false,
      exploreResult: null
    })

    wx.navigateTo({
      url: `/pages/battle/battle?monsterId=${dungeon.boss}&isBoss=true&dungeonId=${dungeon.id}&floor=${dungeon.floor}`
    })
  },

  // 重置地下城挑战
  resetDungeon() {
    const { dungeon } = this.data
    const dungeonId = dungeon.id

    // 重置层数
    this.setData({
      exploreFloor: 1
    })

    // 清除该地下城的进度记录
    if (app.globalData.hero.dungeonProgress) {
      delete app.globalData.hero.dungeonProgress[dungeonId]
      app.saveGameData()
    }

    showToast('已重置到第1层')
  },

  // 保存地下城进度（包含探索状态）
  saveDungeonProgress(dungeonId, floor, exploreResult = null) {
    if (!app.globalData.hero.dungeonProgress) {
      app.globalData.hero.dungeonProgress = {}
    }

    // 如果到达底层，不保存进度（挑战Boss后可能会重置或解锁新地下城）
    const dungeon = getDungeon(dungeonId)
    if (dungeon && floor >= dungeon.floor) {
      return
    }

    // 保存进度和探索状态
    app.globalData.hero.dungeonProgress[dungeonId] = {
      floor: floor,
      exploreResult: exploreResult,
      lastExploreTime: Date.now()
    }
    app.saveGameData()
  },

  // 战斗胜利后调用
  onBattleWin(isBoss) {
    const { dungeon } = this.data

    if (isBoss) {
      // 发放Boss首通奖励
      const reward = dungeon.reward || {}
      if (reward.gold) {
        app.globalData.hero.gold = (app.globalData.hero.gold || 0) + reward.gold
      }
      if (reward.yuanbao) {
        app.globalData.hero.yuanbao = (app.globalData.hero.yuanbao || 0) + reward.yuanbao
        showToast(`获得 ${reward.yuanbao} 元宝奖励！`)
      }

      // 击败Boss，解锁下一层地下城
      const nextDungeonId = dungeon.id + 1
      const nextDungeon = getDungeon(nextDungeonId)

      if (nextDungeon && !app.globalData.hero.unlockedDungeons.includes(nextDungeonId)) {
        app.globalData.hero.unlockedDungeons.push(nextDungeonId)
        app.saveGameData()
        showToast(`解锁新地下城：${nextDungeon.name}！`)
      }

      // 清除该地下城的进度记录（Boss战胜利后不需要保留进度）
      if (app.globalData.hero.dungeonProgress) {
        delete app.globalData.hero.dungeonProgress[dungeon.id]
        app.saveGameData()
      }

      // 保存游戏
      app.saveGameData()

      // 重置层数并刷新详情
      this.setData({
        exploreFloor: 1,
        isCompleted: true,
        isBossDefeated: true
      })
      this.loadDungeonDetail(dungeon.id)
    } else {
      // 普通战斗胜利，进入下一层
      const newFloor = this.data.exploreFloor + 1

      this.setData({
        exploreFloor: newFloor
      })

      // 保存新的进度（如果没有到达底层）
      if (newFloor < dungeon.floor) {
        this.saveDungeonProgress(dungeon.id, newFloor)
      }
    }
  },

  enterDungeon() {
    const { dungeon, isCompleted, hero } = this.data
    const defeatedBosses = hero.defeatedBosses || []

    // 检查前置地下城BOSS是否被击败（除了第一个地下城）
    if (dungeon.id > 1) {
      const prevDungeonId = dungeon.id - 1
      if (!defeatedBosses.includes(prevDungeonId)) {
        const prevDungeon = getDungeon(prevDungeonId)
        wx.showToast({
          title: `需先击败「${prevDungeon.name}」的BOSS`,
          icon: 'none'
        })
        return
      }
    }

    // 记录当前地下城ID到全局
    app.globalData.currentDungeonId = dungeon.id

    // 如果已完成且要再次挑战，重置进度
    if (isCompleted) {
      wx.showModal({
        title: '再次挑战',
        content: '将重置该地下城进度，是否继续？',
        success: (res) => {
          if (res.confirm) {
            // 重置进度
            app.globalData.hero.dungeonProgress[dungeon.id] = 1
            this.setData({ progress: 1, isCompleted: false, isBossDefeated: false, exploreFloor: 1 })
            this.openExploreModal()
          }
        }
      })
    } else {
      // 直接打开探索模态框
      this.openExploreModal()
    }
  },

  challengeBoss() {
    const { dungeon } = this.data

    // 设置当前地下城
    app.globalData.currentDungeonId = dungeon.id

    wx.navigateTo({
      url: '/pages/battle/battle?mode=boss&dungeonId=' + dungeon.id
    })
  }
})
