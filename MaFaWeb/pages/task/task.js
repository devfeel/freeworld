// pages/task/task.js
const app = getApp()
const { STORAGE_KEYS } = require('../../config/storageKeys')
const { TASKS, TASK_TYPES, TASK_STATUS, getAllTasks, getTasksByType, getTasksByStatus, getAvailableTasks, checkTaskCompletion } = require('../../data/tasks')

Page({
  data: {
    // 当前标签页
    currentTab: 'story',  // story, daily, achievement

    // 任务列表
    storyTasks: [],
    dailyTasks: [],
    achievementTasks: [],

    // 已完成数量
    storyCompleted: 0,
    dailyCompleted: 0,
    achievementCompleted: 0,

    // 玩家任务进度
    playerTaskProgress: {
      completedStoryIds: [],
      completedDailyIds: [],
      completedAchievementIds: [],
      unlockedMaps: []
    },

    // 筛选状态
    showCompleted: false,
    showAll: false
  },

  onLoad() {
    console.log('=== 任务页面 onLoad ===');
    this.loadTasks()
  },

  onShow() {
    console.log('=== 任务页面 onShow ===');
    this.loadTasks()
  },

// 加载任务数据
  loadTasks() {
    console.log('=== 开始加载任务数据 ===');

    // 获取任务追踪器的统计信息
    const globalStats = require('../../utils/taskTracker').taskTracker.getPlayerStats()
    console.log('获取到玩家统计数据:', globalStats);

    // 按类型分组 - 从TASKS对象获取最新状态
    const allTasks = Object.values(require('../../data/tasks').TASKS);
    console.log('从TASKS对象获取到的总任务数:', allTasks.length);

    const storyTasks = allTasks.filter(task => task.type === require('../../data/tasks').TASK_TYPES.STORY)
    const dailyTasks = allTasks.filter(task => task.type === require('../../data/tasks').TASK_TYPES.DAILY)
    const achievementTasks = allTasks.filter(task => task.type === require('../../data/tasks').TASK_TYPES.ACHIEVEMENT)

    console.log(`剧情任务数: ${storyTasks.length}, 每日任务数: ${dailyTasks.length}, 成就任务数: ${achievementTasks.length}`);

    // 计算已完成数量（用于标签显示）
    const storyCompleted = storyTasks.filter(task => task.status === require('../../data/tasks').TASK_STATUS.COMPLETED).length
    const dailyCompleted = dailyTasks.filter(task => task.status === require('../../data/tasks').TASK_STATUS.COMPLETED).length
    const achievementCompleted = achievementTasks.filter(task => task.status === require('../../data/tasks').TASK_STATUS.COMPLETED).length

    console.log(`各类型已完成任务数 - 剧情: ${storyCompleted}, 每日: ${dailyCompleted}, 成就: ${achievementCompleted}`);

    // 根据当前标签页选择对应的任务类型
    let displayTasks = storyTasks
    if (this.data.currentTab === 'daily') {
      displayTasks = dailyTasks
      console.log('选择了每日任务标签页');
    } else if (this.data.currentTab === 'achievement') {
      displayTasks = achievementTasks
      console.log('选择了成就任务标签页');
    } else {
      console.log('选择了剧情任务标签页');
    }

    console.log('筛选前的显示任务数:', displayTasks.length);

    // 应用筛选条件
    if (this.data.showCompleted && !this.data.showAll) {
      displayTasks = displayTasks.filter(task => task.status === require('../../data/tasks').TASK_STATUS.COMPLETED)
      console.log('应用了仅显示已完成任务筛选');
    } else if (!this.data.showAll && !this.data.showCompleted) {
      displayTasks = displayTasks.filter(task => task.status === require('../../data/tasks').TASK_STATUS.NOT_STARTED)
      console.log('应用了仅显示未开始任务筛选');
    } else {
      console.log('显示所有任务（无筛选）');
    }

    console.log('筛选后的显示任务数:', displayTasks.length);
    console.log('当前筛选状态 - showAll:', this.data.showAll, 'showCompleted:', this.data.showCompleted);

    // 输出前几个任务供调试
    if (displayTasks.length > 0) {
      console.log('前3个显示任务:', displayTasks.slice(0, 3).map(t => ({id: t.id, name: t.name, status: t.status})));
    } else {
      console.log('警告：没有找到任何要显示的任务！');
    }

    this.setData({
      storyTasks,
      dailyTasks,
      achievementTasks,
      storyCompleted,
      dailyCompleted,
      achievementCompleted,
      [`${this.data.currentTab}Tasks`]: displayTasks
    })

    console.log(`=== 任务数据加载完成 - 设置了${displayTasks.length}个显示任务 ===`);
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
    this.loadTasks()
  },

  // 切换显示全部
  toggleShowAll() {
    this.setData({
      showAll: !this.data.showAll,
      showCompleted: false
    })
    this.loadTasks()
  },

  // 切换显示已完成
  toggleShowCompleted() {
    this.setData({
      showCompleted: !this.data.showCompleted,
      showAll: false
    })
    this.loadTasks()
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      showAll: false,
      showCompleted: false
    })
    this.loadTasks()
  },

  // 显示任务详情
  showTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    const tasks = this.data[`${this.data.currentTab}Tasks`]
    const task = tasks.find(t => t.id === taskId)

    if (!task) return

    let requirementText = ''
    if (task.requirement) {
      const req = task.requirement
      if (req.heroLevel) requirementText += `\n等级要求: ${req.heroLevel}`
      if (req.prerequisiteTasks) requirementText += `\n前置任务: ${req.prerequisiteTasks.join(', ')}`
      if (req.requiredDungeons) requirementText += `\n解锁地下城: ${req.requiredDungeons.join(', ')}`
      if (req.requiredStoryTaskCount) requirementText += `\n需完成剧情任务: ${req.requiredStoryTaskCount}个`
      if (req.requiredGold) requirementText += `\n需拥有金币: ${req.requiredGold}`
      if (req.requiredEquipmentType) requirementText += `\n需装备: ${req.requiredEquipmentType}`
    }

    wx.showModal({
      title: task.name,
      content: `${task.description}\n\n目标：${task.target}${requirementText}\n奖励：经验 ${task.rewards.exp}，金币 ${task.rewards.gold}${task.rewards.title ? `\n成就：${task.rewards.title}` : ''}`,
      showCancel: false
    })
  },

  // 领取任务
  acceptTask(e) {
    const taskId = e.currentTarget.dataset.id
    const tasks = this.data[`${this.data.currentTab}Tasks`]
    const taskIndex = tasks.findIndex(t => t.id === taskId)

    if (taskIndex === -1) return

    // 检查是否可接取
    const hero = app.globalData.hero || {}
    const { TASKS, getAvailableTasks, TASK_STATUS } = require('../../data/tasks')

    // 更新getAvailableTasks的调用参数
    const availableTasks = getAvailableTasks(
      hero.level || 1,
      this.data.playerTaskProgress.completedStoryIds,
      this.data.playerTaskProgress.unlockedMaps,
      hero
    )

    const isAvailable = availableTasks.some(t => t.id === taskId)

    if (!isAvailable) {
      // 如果不可接取，显示具体原因
      const task = TASKS[taskId]
      if (this.data.playerTaskProgress.completedStoryIds.includes(taskId)) {
        wx.showToast({
          title: '该任务已完成',
          icon: 'none'
        })
      } else if (task.requirement && task.requirement.heroLevel && hero.level < task.requirement.heroLevel) {
        wx.showToast({
          title: `需要等级 ${task.requirement.heroLevel}`,
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '该任务暂未开放',
          icon: 'none'
        })
      }
      return
    }

    // 更新任务状态（在共享的TASKS对象中）
    const sharedTask = TASKS[taskId]
    if (sharedTask) {
      sharedTask.status = TASK_STATUS.IN_PROGRESS
    }

    // 更新显示的本地副本
    tasks[taskIndex].status = TASK_STATUS.IN_PROGRESS

    // 更新显示
    this.setData({
      [`${this.data.currentTab}Tasks`]: tasks
    })

    wx.showToast({
      title: '任务已接取',
      icon: 'success'
    })
  },

  // 提交任务
  submitTask(e) {
    const taskId = e.currentTarget.dataset.id
    const tasks = this.data[`${this.data.currentTab}Tasks`]
    const taskIndex = tasks.findIndex(t => t.id === taskId)

    if (taskIndex === -1) return

    const task = tasks[taskIndex]

    // 检查任务是否可提交
    const hero = app.globalData.hero || {}

    // 从全局数据获取玩家统计数据
    const globalStats = require('../../utils/taskTracker').taskTracker.getPlayerStats()
    const { TASKS, checkTaskCompletion } = require('../../data/tasks')

    const { completed, progress } = checkTaskCompletion(taskId, {
      hero,
      battleCount: 0, // 需要从玩家数据获取
      battleWin: 0,
      exploreFloors: 0,
      dungeonClears: globalStats.dungeonClears || [],
      totalWins: globalStats.totalWins || 0,
      totalMonsterKills: globalStats.totalMonsterKills || 0,
      totalBossKills: globalStats.totalBossKills || 0,
      totalGold: hero.gold || 0,
      rareEquipmentCount: globalStats.rareEquipmentCount || 0,
      totalExploreFloors: globalStats.totalExploreFloors || 0,
      eliteKills: globalStats.eliteKills || 0,
      equipFullSet: globalStats.equipFullSet || false,
      maxWinStreak: globalStats.maxWinStreak || 0,
      rareEquipmentTotal: globalStats.rareEquipmentTotal || 0,
      completedStoryCount: globalStats.completedIds ? globalStats.completedIds.filter(id => id.startsWith('story_')).length : 0,
      ...globalStats
    })

    if (!completed) {
      wx.showToast({
        title: `任务进度：${Math.round(progress)}%`,
        icon: 'none'
      })
      return
    }

    // 更新任务状态为已完成（在共享的TASKS对象中）
    const sharedTask = TASKS[taskId]
    if (sharedTask) {
      sharedTask.status = require('../../data/tasks').TASK_STATUS.COMPLETED
    }

    // 更新显示的本地副本
    tasks[taskIndex].status = require('../../data/tasks').TASK_STATUS.COMPLETED

    // 更新玩家任务进度
    const progressKey = this.getProgressKey(task.type)
    if (progressKey) {
      this.data.playerTaskProgress[progressKey].push(taskId)
    }

    // 解锁地图
    if (task.unlockMap) {
      task.unlockMap.forEach(mapId => {
        if (!this.data.playerTaskProgress.unlockedMaps.includes(mapId)) {
          this.data.playerTaskProgress.unlockedMaps.push(mapId)
        }
      })
    }

    // 给予奖励
    this.giveRewards(task.rewards)

    // 保存数据
    if (app && app.globalData && app.globalData.hero) {
      app.globalData.hero.gold += task.rewards.gold || 0
      if (typeof app.addExp === 'function') {
        app.addExp(task.rewards.exp || 0)
      }
      // 保存游戏
      if (typeof app.saveGame === 'function') {
        app.saveGame()
      }
    }

    // 更新显示
    this.setData({
      [`${this.data.currentTab}Tasks`]: tasks,
      playerTaskProgress: this.data.playerTaskProgress
    })

    wx.showToast({
      title: '任务完成！',
      icon: 'success'
    })

    // 检查成就奖励
    if (task.rewards.title) {
      wx.showModal({
        title: '获得成就',
        content: `恭喜获得成就：${task.rewards.title}`,
        showCancel: false
      })
    }
  },

  // 给予奖励
  giveRewards(rewards) {
    // 安全获取app实例
    const appInstance = getApp()
    if (!appInstance) {
      console.error('发放任务奖励失败: app不存在')
      wx.showToast({
        title: '奖励发放失败',
        icon: 'none'
      })
      return
    }

    if (rewards.items && rewards.items.length > 0) {
      rewards.items.forEach(itemId => {
        const { getItem } = require('../../data/items')
        const item = getItem(itemId)
        if (item && appInstance.addItem) {
          appInstance.addItem({
            ...item,
            uid: Date.now() + Math.random()
          })
        }
      })
    }
  },

  // 获取进度存储键
  getProgressKey(taskType) {
    switch (taskType) {
      case TASK_TYPES.STORY:
        return 'completedStoryIds'
      case TASK_TYPES.DAILY:
        return 'completedDailyIds'
      case TASK_TYPES.ACHIEVEMENT:
        return 'completedAchievementIds'
      default:
        return null
    }
  },

  // 获取任务类型名称
  getTypeName(type) {
    const names = {
      [TASK_TYPES.STORY]: '剧情',
      [TASK_TYPES.DAILY]: '每日',
      [TASK_TYPES.ACHIEVEMENT]: '成就'
    }
    return names[type] || '未知'
  },

  // 获取任务状态名称
  getStatusName(status) {
    const names = {
      [TASK_STATUS.NOT_STARTED]: '未开始',
      [TASK_STATUS.IN_PROGRESS]: '进行中',
      [TASK_STATUS.COMPLETED]: '已完成'
    }
    return names[status] || '未知'
  },

  // 获取任务状态类名
  getStatusClass(status) {
    const classes = {
      [TASK_STATUS.NOT_STARTED]: 'status-not-started',
      [TASK_STATUS.IN_PROGRESS]: 'status-in-progress',
      [TASK_STATUS.COMPLETED]: 'status-completed'
    }
    return classes[status] || 'status-not-started'
  },

  // 获取优先级颜色
  getPriorityColor(priority) {
    if (priority <= 10) return '#ff6b6b'
    if (priority <= 20) return '#4caf50'
    if (priority <= 30) return '#ffd700'
    return '#ffffff'
  },

  // 检查任务是否可接取
  isTaskAvailable(taskId) {
    const hero = app.globalData.hero || {}
    const { getAvailableTasks, TASKS } = require('../../data/tasks')

    // 获取可接取的任务列表
    const availableTasks = getAvailableTasks(
      hero.level || 1,
      this.data.playerTaskProgress.completedStoryIds,
      this.data.playerTaskProgress.unlockedMaps,
      hero
    )

    // 检查指定任务是否在可接取列表中
    return availableTasks.some(t => t.id === taskId)
  },

  // 进入地下城
  goToDungeon() {
    wx.switchTab({
      url: '/pages/dungeon/dungeon'
    })
  },

  // 刷新每日任务（每天0点重置）
  refreshDailyTasks() {
    const now = new Date()
    const lastRefresh = wx.getStorageSync(STORAGE_KEYS.LAST_DAILY_REFRESH) || 0
    const today = Math.floor(now.getTime() / (1000 * 60 * 60 * 24))

    if (today > lastRefresh) {
      // 重置每日任务状态 - 在共享的TASKS对象中更新
      Object.values(TASKS)
        .filter(task => task.type === TASK_TYPES.DAILY && task.status === TASK_STATUS.COMPLETED)
        .forEach(task => {
          task.status = TASK_STATUS.NOT_STARTED
        })

      this.data.playerTaskProgress.completedDailyIds = []
      wx.setStorageSync(STORAGE_KEYS.LAST_DAILY_REFRESH, today)

      this.loadTasks()

      wx.showToast({
        title: '每日任务已刷新',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '每日任务已刷新',
        icon: 'none'
      })
    }
  }
})
