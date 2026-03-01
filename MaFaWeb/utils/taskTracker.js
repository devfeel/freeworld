/**
 * 任务追踪系统
 * 负责管理玩家任务进度、奖励发放等
 */

// 延迟获取 app 实例，确保 App 已初始化
const getAppInstance = () => getApp()

const { taskNotifier } = require('./taskNotifier')
const { TASKS, TASK_TYPES, TASK_STATUS, checkTaskCompletion } = require('../data/tasks')

// 任务追踪器类
class TaskTracker {
  constructor() {
    // 任务追踪数据
    this.taskProgress = {
      // 剧情任务进度
      storyTasks: [],
      // 每日任务进度
      dailyTasks: [],
      // 成就任务进度
      achievementTasks: [],
      // 已完成任务ID
      completedIds: [],
      // 每日任务刷新时间
      lastDailyRefresh: 0,
      // 玩家统计数据
      stats: {
        totalWins: 0,
        totalMonsterKills: 0,
        totalBossKills: 0,
        totalGold: 0,
        totalExploreFloors: 0,
        rareEquipmentCount: 0,  // 当前拥有的稀有装备数量
        rareEquipmentTotal: 0,  // 总共获得的稀有装备数量
        maxWinStreak: 0,
        currentWinStreak: 0,
        dungeonClears: [],
        eliteKills: 0,         // 精英怪物击杀数
        equipFullSet: false    // 是否拥有全套装备
      }
    }
  }

  // 初始化任务追踪器
  initialize() {
    try {
      // 从本地存储加载任务进度
      const storedProgress = wx.getStorageSync('taskProgress')
      if (storedProgress) {
        // 确保新字段存在，如果不存在则提供默认值
        this.taskProgress = {
          ...this.taskProgress,
          ...storedProgress,
          stats: {
            ...this.taskProgress.stats,
            ...(storedProgress.stats || {})
          }
        }

        // 重要：将存储的完成状态同步到全局TASKS对象
        this.taskProgress.completedIds.forEach(completedId => {
          if (TASKS[completedId]) {
            TASKS[completedId].status = TASK_STATUS.COMPLETED;
          }
        });
      }
    } catch (error) {
      console.error('初始化任务追踪器失败:', error)
      // 如果读取失败，使用默认值
    }
  }

  // 保存任务进度到本地存储
  saveProgress() {
    try {
      wx.setStorageSync('taskProgress', this.taskProgress)
    } catch (error) {
      console.error('保存任务进度失败:', error)
    }
  }

  // 检查每日任务是否需要刷新
  checkDailyRefresh() {
    const now = new Date()
    const today = Math.floor(now.getTime() / (1000 * 60 * 60 * 24))

    if (today > this.taskProgress.lastDailyRefresh) {
      // 重置每日任务状态 - 同时更新TASKS对象中的状态
      Object.values(TASKS)
        .filter(task => task.type === TASK_TYPES.DAILY && task.status === TASK_STATUS.COMPLETED)
        .forEach(task => {
          task.status = TASK_STATUS.NOT_STARTED
          // 也要更新TASKS对象中的任务状态
          if (TASKS[task.id]) {
            TASKS[task.id].status = TASK_STATUS.NOT_STARTED;
          }
        })

      // 清空已完成的每日任务ID
      this.taskProgress.completedIds = this.taskProgress.completedIds
        .filter(id => !id.startsWith('daily_'))

      this.taskProgress.lastDailyRefresh = today
      this.saveProgress()

      console.log('每日任务已刷新')
    }
  }

  // 更新玩家统计数据
  updateStats(event, value) {
    switch (event) {
      case 'battle_win':
        this.taskProgress.stats.totalWins += value || 1
        this.taskProgress.stats.currentWinStreak += value || 1
        if (this.taskProgress.stats.currentWinStreak > this.taskProgress.stats.maxWinStreak) {
          this.taskProgress.stats.maxWinStreak = this.taskProgress.stats.currentWinStreak
        }
        break

      case 'battle_loss':
        this.taskProgress.stats.currentWinStreak = 0
        break

      case 'monster_kill':
        this.taskProgress.stats.totalMonsterKills += value || 1
        break

      case 'boss_kill':
        this.taskProgress.stats.totalBossKills += value || 1
        break

      case 'gold_gain':
        this.taskProgress.stats.totalGold += value || 0
        break

      case 'explore_floor':
        this.taskProgress.stats.totalExploreFloors += value || 1
        break

      case 'rare_equipment_get':
        this.taskProgress.stats.rareEquipmentCount += value || 1
        this.taskProgress.stats.rareEquipmentTotal += value || 1
        break

      case 'dungeon_clear':
        if (!this.taskProgress.stats.dungeonClears.includes(value)) {
          this.taskProgress.stats.dungeonClears.push(value)
        }
        break

      case 'win_streak':
        // 特定的连胜事件，例如连续战斗胜利
        this.taskProgress.stats.currentWinStreak = value || 1
        if (this.taskProgress.stats.currentWinStreak > this.taskProgress.stats.maxWinStreak) {
          this.taskProgress.stats.maxWinStreak = this.taskProgress.stats.currentWinStreak
        }
        break

      case 'elite_kill':
        // 精英怪物击杀
        this.taskProgress.stats.eliteKills += value || 1
        break

      case 'equip_full_set':
        // 全套装备
        this.taskProgress.stats.equipFullSet = true
        break

      case 'exp_gain':
        // 这里可以跟踪经验获取统计，暂时不做特殊处理
        break

      case 'item_acquire':
        // 这里可以跟踪物品获取统计，暂时不做特殊处理
        break

      case 'item_sell':
        // 这里可以跟踪出售物品统计，暂时不做特殊处理
        break

      case 'item_equip':
        // 这里可以跟踪装备统计，暂时不做特殊处理
        break
    }

    this.saveProgress()
  }

  // 检查并完成任务
  checkAndCompleteTasks(hero) {
    // 计算已完成的剧情任务数量
    const completedStoryCount = this.taskProgress.completedIds.filter(id => id.startsWith('story_')).length

    // 获取所有未完成的任务
    const pendingTasks = Object.values(TASKS).filter(
      task => !this.taskProgress.completedIds.includes(task.id) &&
              task.status !== TASK_STATUS.COMPLETED
    )

    const completedTasks = []

    pendingTasks.forEach(task => {
      const app = getApp()
      const playerData = {
        hero: hero || (app && app.globalData && app.globalData.hero),
        ...this.taskProgress.stats,
        completedStoryCount: completedStoryCount  // 添加已完成剧情任务数量
      }

      const { completed, progress } = checkTaskCompletion(task.id, playerData)

      if (completed) {
        // 更新任务状态 - 同时更新TASKS对象和本地状态
        TASKS[task.id].status = TASK_STATUS.COMPLETED;
        task.status = TASK_STATUS.COMPLETED;
        this.taskProgress.completedIds.push(task.id)

        // 发放奖励
        this.grantTaskRewards(task)

        // 更新显示的完成数量
        completedTasks.push(task)

        // 显示完成提示
        taskNotifier.showTaskCompletion(task)

        console.log(`任务完成: ${task.name}`)
      }
    })

    // 保存进度
    this.saveProgress()

    return completedTasks
  }

  // 发放任务奖励
  grantTaskRewards(task) {
    const rewards = task.rewards

    if (!rewards) return

    // 动态获取 app 实例
    const app = getApp()

    // 确保 app 和 hero 存在
    if (!app) {
      console.error('发放任务奖励失败: app 不存在')
      return
    }

    if (!app.globalData || !app.globalData.hero) {
      console.error('发放任务奖励失败: hero 不存在')
      return
    }

    const hero = app.globalData.hero

    // 发放经验
    if (rewards.exp) {
      if (typeof app.addExp === 'function') {
        app.addExp(rewards.exp)
      } else {
        // 如果 addExp 方法不存在，手动增加经验
        hero.exp += rewards.exp
      }
    }

    // 发放金币
    if (rewards.gold) {
      hero.gold += rewards.gold
    }

    // 发放物品
    if (rewards.items && Array.isArray(rewards.items)) {
      rewards.items.forEach(itemId => {
        const { getItem } = require('../data/items')
        const item = getItem(itemId)
        if (item) {
          if (typeof app.addItem === 'function') {
            app.addItem({
              ...item,
              uid: Date.now() + Math.random()
            })
          }
        }
      })
    }

    // 保存数据
    if (typeof app.saveGameData === 'function') {
      app.saveGameData()
    }
  }

  // 获取当前玩家统计信息
  getPlayerStats() {
    return this.taskProgress.stats
  }

  // 获取指定类型的未完成任务
  getPendingTasksByType(type) {
    return Object.values(TASKS)
      .filter(task =>
        task.type === type &&
        !this.taskProgress.completedIds.includes(task.id) &&
        task.status !== TASK_STATUS.COMPLETED
      )
  }

  // 获取指定类型的已完成任务数量
  getCompletedCountByType(type) {
    return this.taskProgress.completedIds.filter(id => id.startsWith(type)).length
  }

  // 重置连胜计数
  resetWinStreak() {
    this.taskProgress.stats.currentWinStreak = 0
    this.saveProgress()
  }
}

// 创建单例任务追踪器
const taskTracker = new TaskTracker()

module.exports = {
  taskTracker
}
