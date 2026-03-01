/**
 * 经验值系统模拟
 * 与游戏逻辑保持一致，确保前后端数据一致性
 */

/**
 * 根据等级计算所需经验
 * 与 utils/game-utils.js 中的 getExpForLevel 保持一致
 */
function getExpForLevel(level) {
  if (level <= 10) {
    // 前10级较难成长 - 基础值更高
    return Math.floor(150 + (level - 1) * 30)
  } else if (level <= 30) {
    // 11-30级中等难度增长 - 更陡峭的增长曲线
    return Math.floor(400 + (level - 10) * 70)
  } else if (level <= 50) {
    // 31-50级更高难度增长 - 快速增长
    return Math.floor(1800 + (level - 30) * 150)
  } else {
    // 50级以后非常快速增长
    return Math.floor(4800 + (level - 50) * 300)
  }
}

/**
 * 计算角色升级所需的经验总数（从1级到指定等级的累计经验）
 */
function getTotalExpForLevel(level) {
  let totalExp = 0
  for (let i = 1; i < level; i++) {
    totalExp += getExpForLevel(i)
  }
  return totalExp
}

/**
 * 根据当前经验值估算等级
 */
function getLevelForExp(exp) {
  let currentExp = 0
  let level = 1

  while (currentExp < exp) {
    currentExp += getExpForLevel(level)
    if (currentExp > exp) {
      break
    }
    level++
  }

  return level
}

/**
 * 获取下一级还需要多少经验
 */
function getRemainingExp(currentLevel, currentExp) {
  const expForNextLevel = getExpForLevel(currentLevel)
  return expForNextLevel - currentExp
}

module.exports = {
  getExpForLevel,
  getTotalExpForLevel,
  getLevelForExp,
  getRemainingExp
}