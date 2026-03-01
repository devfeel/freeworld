// pages/dungeon/dungeon.js
const app = getApp()
const { getAllDungeons, getDungeon } = require('../../data/dungeons')
const { getMonstersByDungeon, getMonster } = require('../../data/monsters')
const { random, showToast } = require('../../utils/game-utils')

Page({
  data: {
    hero: {},
    dungeons: [],
    currentDungeon: null,
    currentFloor: 1,
    exploreResult: null // 探索结果浮层数据
  },

  onLoad() {
    this.loadDungeons()
  },

  onShow() {
    const hero = app.globalData.hero || {}

    this.setData({ hero })

    // 只更新数据，不自动弹出模态框
    // 返回时重新加载地下城列表
    this.loadDungeons()
  },

  // 加载地下城列表
  loadDungeons() {
    const dungeons = getAllDungeons()
    const hero = app.globalData.hero || {}
    const defeatedBosses = hero.defeatedBosses || []

    // 添加前置状态（BOSS + 等级）
    dungeons.forEach((dungeon) => {
      if (dungeon.id > 1) {
        const prevBossDefeated = defeatedBosses.includes(dungeon.id - 1)
        const meetLevel = hero.level >= dungeon.level
        dungeon.prevCompleted = prevBossDefeated && meetLevel
      } else {
        dungeon.prevCompleted = hero.level >= dungeon.level
      }
    })

    this.setData({ dungeons })
  },

  // 跳转到详情页
  goToDetail(e) {
    const dungeonId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dungeon-detail/dungeon-detail?id=${dungeonId}`
    })
  },

  // 选择地下城（保留原功能）
  selectDungeon(e) {
    const dungeonId = e.currentTarget.dataset.id
    const dungeon = getDungeon(dungeonId)
    const hero = app.globalData.hero
    const defeatedBosses = hero.defeatedBosses || []

    // 检查等级要求
    if (hero.level < dungeon.level) {
      showToast(`需要等级 ${dungeon.level}`)
      return
    }

    // 检查前置地下城BOSS是否被击败 + 等级要求（除了第一个地下城）
    if (dungeonId > 1) {
      const prevDungeonId = dungeonId - 1
      const prevBossDefeated = defeatedBosses.includes(prevDungeonId)
      if (!prevBossDefeated) {
        const prevDungeon = getDungeon(prevDungeonId)
        showToast(`需先击败「${prevDungeon.name}」的BOSS`)
        return
      }
      if (hero.level < dungeon.level) {
        showToast(`需要等级 ${dungeon.level}`)
        return
      }
    } else if (hero.level < dungeon.level) {
      showToast(`需要等级 ${dungeon.level}`)
      return
    }

    // 读取保存的进度，如果没有记录则从第1层开始
    const savedFloor = hero.dungeonProgress?.[dungeonId] || 1

    this.setData({
      currentDungeon: dungeon,
      currentFloor: savedFloor
    })
  },

  // 探索
  explore() {
    if (!this.data.currentDungeon) return

    const dungeon = this.data.currentDungeon

    // 检查是否到达Boss层
    if (this.data.currentFloor >= dungeon.floor) {
      showToast('已到达地下城底层，请挑战Boss！')
      return
    }

    // 随机探索结果：70%概率发现怪物，30%什么都没发现
    const randomValue = Math.random()
    let result = null

    if (randomValue < 0.7) {
      // 发现怪物
      const monsters = getMonstersByDungeon(dungeon.id)
      const monsterId = monsters[Math.floor(Math.random() * monsters.length)]
      const monster = getMonster(monsterId)

      result = {
        foundMonster: true,
        monster: monster,
        event: '',
        canContinue: false
      }
    } else {
      // 没有发现怪物
      const events = [
        '发现了一个古老的宝箱',
        '发现了一些奇怪的声音',
        '什么也没发现',
        '前方似乎很安全'
      ]
      result = {
        foundMonster: false,
        monster: null,
        event: events[Math.floor(Math.random() * events.length)],
        canContinue: true
      }
    }

    // 显示探索结果弹窗时，先关闭地下城模态框
    this.setData({
      currentDungeon: null,  // 关闭地下城模态框
      exploreResult: result  // 显示探索结果弹窗
    })
  },

  // Boss战
  bossBattle() {
    const currentDungeonId = app.globalData.currentDungeonId
    if (!currentDungeonId) return

    const dungeon = getDungeon(currentDungeonId)
    if (!dungeon) return

    wx.navigateTo({
      url: `/pages/battle/battle?monsterId=${dungeon.boss}&isBoss=true&dungeonId=${dungeon.id}&floor=${dungeon.floor}`
    })
  },

  // 重置地下城挑战
  resetDungeon() {
    const currentDungeonId = app.globalData.currentDungeonId
    if (!currentDungeonId) return

    const dungeonId = currentDungeonId

    // 重置层数
    this.setData({
      currentFloor: 1
    })

    // 清除该地下城的进度记录
    if (app.globalData.hero.dungeonProgress) {
      delete app.globalData.hero.dungeonProgress[dungeonId]
      app.saveGameData()
    }

    showToast('已重置到第1层')
  },

  // 探索浮层操作
  closeExplore() {
    // 关闭探索弹窗时，重新显示地下城模态框
    const currentDungeonId = app.globalData.currentDungeonId
    const hero = app.globalData.hero || {}

    if (currentDungeonId) {
      const dungeon = getDungeon(currentDungeonId)
      if (dungeon) {
        this.setData({
          exploreResult: null,
          currentDungeon: dungeon,
          currentFloor: hero.dungeonProgress?.[dungeon.id] || 1
        })
        return
      }
    }

    // 如果没有地下城ID，只关闭探索弹窗
    this.setData({ exploreResult: null })
  },

  // 关闭地下城模态框
  closeDungeonModal() {
    this.setData({
      currentDungeon: null,
      currentFloor: 1
    })
  },

  continueExplore() {
    if (!this.data.exploreResult) return

    // 从全局变量中读取当前地下城ID
    const currentDungeonId = app.globalData.currentDungeonId
    if (!currentDungeonId) {
      showToast('地下城信息错误')
      return
    }

    const dungeon = getDungeon(currentDungeonId)
    if (!dungeon) {
      showToast('地下城信息错误')
      return
    }

    const exploreResult = this.data.exploreResult
    const hero = app.globalData.hero || {}
    const currentFloor = hero.dungeonProgress?.[currentDungeonId] || 1

    // 先保存需要的信息，再关闭浮层
    this.setData({ exploreResult: null })

    // 如果没有发现怪物，继续探索到下一层
    if (!exploreResult.foundMonster) {
      // 进入下一层
      const newFloor = currentFloor + 1
      this.setData({
        currentFloor: newFloor
      })

      // 保存地下城进度
      this.saveDungeonProgress(dungeon.id, newFloor)

      // 短暂延迟后重新探索
      setTimeout(() => {
        this.explore()
      }, 300)
      return
    }

    // 如果有怪物，进入战斗
    wx.navigateTo({
      url: `/pages/battle/battle?monsterId=${exploreResult.monster.id}&isBoss=false&dungeonId=${dungeon.id}&floor=${currentFloor}`
    })
  },

  goToBattle() {
    if (!this.data.exploreResult) return

    // 从全局变量中读取当前地下城ID
    const currentDungeonId = app.globalData.currentDungeonId
    if (!currentDungeonId) {
      showToast('地下城信息错误')
      return
    }

    const dungeon = getDungeon(currentDungeonId)
    if (!dungeon) {
      showToast('地下城信息错误')
      return
    }

    // 检查是否有怪物
    if (!this.data.exploreResult.foundMonster || !this.data.exploreResult.monster) {
      showToast('没有发现怪物，请返回后重新探索')
      return
    }

    const monster = this.data.exploreResult.monster

    // 保存当前层进度（战斗胜利后会进入下一层）
    this.saveDungeonProgress(dungeon.id, this.data.currentFloor)

    wx.navigateTo({
      url: `/pages/battle/battle?monsterId=${monster.id}&isBoss=false&dungeonId=${dungeon.id}&floor=${this.data.currentFloor}`
    })
  },

  // 保存地下城进度
  saveDungeonProgress(dungeonId, floor) {
    if (!app.globalData.hero.dungeonProgress) {
      app.globalData.hero.dungeonProgress = {}
    }

    // 如果到达底层，不保存进度（挑战Boss后可能会重置或解锁新地下城）
    const dungeon = getDungeon(dungeonId)
    if (dungeon && floor >= dungeon.floor) {
      return
    }

    app.globalData.hero.dungeonProgress[dungeonId] = floor
    app.saveGameData()
  },

  // 战斗胜利后调用
  onBattleWin(isBoss) {
    // 从全局变量中读取当前地下城ID
    const currentDungeonId = app.globalData.currentDungeonId
    if (!currentDungeonId) return

    const dungeon = getDungeon(currentDungeonId)
    if (!dungeon) return

    const hero = app.globalData.hero || {}

    if (isBoss) {
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

      // 重置层数
      this.setData({
        currentFloor: 1,
        currentDungeon: null
      })
    } else {
      // 普通战斗胜利，进入下一层
      const currentFloor = hero.dungeonProgress?.[currentDungeonId] || 1
      const newFloor = currentFloor + 1

      this.setData({
        currentFloor: newFloor
      })

      // 保存新的进度（如果没有到达底层）
      if (newFloor < dungeon.floor) {
        this.saveDungeonProgress(dungeon.id, newFloor)
      }
    }
  }
})
