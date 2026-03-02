// pages/main/main.js
const app = getApp()
const { calculatePower, getTitleByPower } = require('../../utils/game-utils')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 角色数据
    hero: {},
    totalStats: { attack: 0, defense: 0 },
    hpPercent: 100,
    mpPercent: 100,
    expPercent: 0,
    maxHp: 100,
    maxMp: 100,
    classEmoji: '🛡️',

    // 状态
    currentMap: '比奇省',
    playerStatus: 'resting',
    playerStatusText: '休息中',
    statusTime: '0分0秒',
    loginTime: Date.now(),

    // 签到系统
    signed: false,
    signDays: 0,
    signReward: 100,

    // Tab 导航
    currentTab: 'home',
    hasNewNotice: true,

    // 公告列表
    newsList: [
      { id: 1, date: '2024-01-20', title: '【重要】服务器维护通知', desc: '亲爱的玩家，我们将于1月25日凌晨2:00-6:00进行服务器维护。' },
      { id: 2, date: '2024-01-18', title: '【活动】新年庆典即将开启', desc: '新年庆典活动将于1月20日正式开启，双倍经验等你来！' },
      { id: 3, date: '2024-01-15', title: '【更新】装备强化系统优化', desc: '装备强化成功率提升，新增保底机制。' }
    ],

    // 竞技场数据
    arenaRank: 156,
    arenaWins: 23,
    arenaLosses: 15,
    arenaPoints: 680,

    // 排行榜数据
    rankList: [
      { rank: 1, name: '霸道总裁', score: 99999, badge: '🥇', className: 'top1' },
      { rank: 2, name: '无敌寂寞', score: 88888, badge: '🥈', className: 'top2' },
      { rank: 3, name: '传奇玩家', score: 77777, badge: '🥉', className: 'top3' },
      { rank: 4, name: '玛法勇士', score: 66666, badge: '4', className: '' },
      { rank: 5, name: '地下城主', score: 55555, badge: '5', className: '' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadHeroData()
    this.loadSignStatus()
    this.startStatusTimer()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadHeroData()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  /**
   * 启动状态计时器
   */
  startStatusTimer() {
    this.timer = setInterval(() => {
      const elapsed = Date.now() - this.data.loginTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      this.setData({
        statusTime: `${minutes}分${seconds}秒`
      })
    }, 1000)
  },

  /**
   * 加载角色数据
   */
  loadHeroData() {
    const hero = app.globalData.hero || {}
    const totalStats = app.getTotalStats(hero)

    const maxHp = totalStats.hp || hero.maxHp || 100
    const maxMp = totalStats.mp || hero.maxMp || 100

    const hpPercent = maxHp ? Math.floor((hero.hp || 0) / maxHp * 100) : 100
    const mpPercent = maxMp ? Math.floor((hero.mp || 0) / maxMp * 100) : 100
    const expPercent = hero.maxExp ? Math.floor((hero.exp || 0) / hero.maxExp * 100) : 0

    // 更新排行榜中自己的名字
    const rankList = this.data.rankList.map(item => ({
      ...item,
      isSelf: item.name === hero.name
    }))

    // 计算职业头像
    const classEmoji = this.getHeroClassEmoji(totalStats, hero)

    // 计算称号
    const title = this.getHeroTitle(hero.level || 1, totalStats)
    hero.title = title

    // 计算战力
    const power = calculatePower(totalStats)

    this.setData({
      hero,
      totalStats,
      hpPercent,
      mpPercent,
      expPercent,
      maxHp,
      maxMp,
      rankList,
      classEmoji,
      power
    })
  },

  // 获取英雄职业头像
  getHeroClassEmoji(stats, hero) {
    const equipment = hero.equipment || {}
    const hasShield = equipment.shield
    const hasBow = equipment.weapon && equipment.weapon.subType === 'bow'
    const hasStaff = equipment.weapon && equipment.weapon.subType === 'staff'
    const hasSword = equipment.weapon && (equipment.weapon.subType === 'jian' || equipment.weapon.subType === 'dao')

    if (hasShield) return '🛡️'
    if (hasBow) return '🏹'
    if (hasStaff) return '🧙‍♂️'
    if (hasSword) return '⚔️'
    return '🎒'
  },

  // 获取英雄称号
  getHeroTitle(level, stats) {
    const power = calculatePower(stats)
    return getTitleByPower(level, power)
  },

  /**
   * 加载签到状态
   */
  loadSignStatus() {
    try {
      const today = new Date().toDateString()
      const lastSignDate = wx.getStorageSync('lastSignDate') || ''
      const signDays = wx.getStorageSync('signDays') || 0
      const signed = (today === lastSignDate)
      const signReward = 100 + signDays * 10

      this.setData({ signed, signDays, signReward })
    } catch (e) {
      console.error('加载签到状态失败', e)
    }
  },

  /**
   * 签到
   */
  signIn() {
    if (this.data.signed) {
      wx.showToast({ title: '今天已签到', icon: 'none' })
      return
    }

    const today = new Date().toDateString()
    const signDays = this.data.signDays + 1
    const hero = app.globalData.hero
    const reward = this.data.signReward

    hero.gold = (hero.gold || 0) + reward

    try {
      wx.setStorageSync('lastSignDate', today)
      wx.setStorageSync('signDays', signDays)
      app.saveGameData()
    } catch (e) {
      console.error('保存签到状态失败', e)
    }

    this.setData({ signed: true, signDays })

    wx.showToast({
      title: `签到成功！+${reward}金币`,
      icon: 'success',
      duration: 2000
    })

    this.loadHeroData()
  },

  /**
   * 切换Tab
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  /**
   * 跳转到页面
   */
  goToPage(e) {
    const page = e.currentTarget.dataset.page
    const pages = {
      'dungeon': '/pages/dungeon/dungeon',
      'hero': '/pages/hero/hero',
      'bag': '/pages/bag/bag',
      'shop': '/pages/shop/shop',
      'task': '/pages/task/task',
      'arena': '/pages/arena/arena',
      'rank': '/pages/rank/rank'
    }

    if (pages[page]) {
      wx.switchTab({ url: pages[page] })
    }
  },

  /**
   * 进入战斗
   */
  goToBattle() {
    wx.navigateTo({
      url: '../battle/battle'
    })
  },

  /**
   * 进入地下城
   */
  goToDungeon() {
    wx.switchTab({
      url: '/pages/dungeon/dungeon'
    })
  },

  /**
   * 竞技场匹配
   */
  startArenaMatch() {
    wx.showToast({
      title: '正在匹配对手...',
      icon: 'loading',
      duration: 2000
    })

    setTimeout(() => {
      wx.navigateTo({
        url: '../battle/battle?mode=arena'
      })
    }, 1500)
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadHeroData()
    this.loadSignStatus()
    wx.stopPullDownRefresh()
  }
})
