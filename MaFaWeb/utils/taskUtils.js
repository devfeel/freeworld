/**
 * 任务系统通用工具函数
 * 提供各种辅助功能，用于处理任务相关的操作
 */

const { taskTracker } = require('./taskTracker')

// 获取全局app实例的安全函数
function getAppInstance() {
  try {
    const app = getApp()
    return app
  } catch (e) {
    console.error('获取全局app实例失败:', e)
    return null
  }
}

// 在战斗完成后调用此函数，更新任务进度
function onBattleComplete(isWin, monsterType, isElite = false, isBoss = false) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  // 更新战斗统计
  if (isWin) {
    taskTracker.updateStats('battle_win', 1)

    // 如果是精英怪或BOSS，更新相应统计
    if (isElite) {
      taskTracker.updateStats('elite_kill', 1)
    }

    if (isBoss) {
      taskTracker.updateStats('boss_kill', 1)
    } else {
      // 普通怪物击杀
      taskTracker.updateStats('monster_kill', 1)
    }
  } else {
    taskTracker.updateStats('battle_loss', 1)
  }

  // 检查是否有任务完成
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 在探索新楼层时调用
function onFloorExplored(floorNumber) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  taskTracker.updateStats('explore_floor', 1)
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 在通关地下城时调用
function onDungeonCleared(dungeonId) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  taskTracker.updateStats('dungeon_clear', dungeonId)
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 在获得稀有装备时调用
function onRareEquipmentAcquired(rarity) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  // 假设稀有度大于等于3为稀有装备
  if (rarity >= 3) {
    taskTracker.updateStats('rare_equipment_get', 1)
  }
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 在装备物品时调用
function onItemEquipped(item) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  // 检查是否是套装装备
  const equipmentCount = Object.keys(app.globalData.hero.equipment || {}).filter(key =>
    app.globalData.hero.equipment[key] !== null
  ).length

  // 如果装备了6件装备，认为是全套
  if (equipmentCount >= 6) {
    taskTracker.updateStats('equip_full_set', true)
  }

  taskTracker.updateStats('item_equip', 1)
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 在获得金币时调用
function onGoldGained(amount) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  taskTracker.updateStats('gold_gain', amount)
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 在获得经验值时调用
function onExpGained(amount) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  taskTracker.updateStats('exp_gain', amount)
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

// 手动重置连胜
function resetWinStreak() {
  taskTracker.resetWinStreak()
}

// 获取任务完成统计
function getTaskStats() {
  return taskTracker.getPlayerStats()
}

// 获取指定类型的任务完成数量
function getCompletedTaskCount(type) {
  return taskTracker.getCompletedCountByType(type)
}

// 专门处理任务进度更新的函数
function updateTaskProgress(event, value) {
  const app = getAppInstance()
  if (!app) {
    console.error('app实例不可用，无法更新任务进度')
    return
  }

  taskTracker.updateStats(event, value)
  taskTracker.checkAndCompleteTasks(app.globalData.hero)
}

module.exports = {
  onBattleComplete,
  onFloorExplored,
  onDungeonCleared,
  onRareEquipmentAcquired,
  onItemEquipped,
  onGoldGained,
  onExpGained,
  resetWinStreak,
  getTaskStats,
  getCompletedTaskCount,
  updateTaskProgress
}