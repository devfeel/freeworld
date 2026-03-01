/**
 * 怪物数据配置
 * 30个级别，从1级到200级
 * 分为骷髅系列、僵尸系列，包含普通、精英、BOSS
 */

const MONSTERS = {}

// 怪物基础属性计算
function calculateMonsterStats(level, isElite = false, isBoss = false) {
  let baseMultiplier = isBoss ? 5 : (isElite ? 2 : 1)

  return {
    level: level,
    hp: Math.floor((50 + level * 30) * baseMultiplier),
    attack: Math.floor((5 + level * 2) * baseMultiplier),
    defense: Math.floor((2 + level * 1) * baseMultiplier * 0.6),
    speed: Math.floor(10 + level * 0.3),
    exp: Math.floor((10 + level * 15) * baseMultiplier),
    gold: Math.floor((5 + level * 8) * baseMultiplier),
    isElite: isElite,
    isBoss: isBoss
  }
}

// 骷髅系列 - 1-10级（普通）
const SKELETON_NAMES = ['骷髅兵', '骷髅弓箭手', '骷髅战士', '骷髅法师', '骷髅骑士']
const SKELETON_COLORS = ['#e8e8e8', '#d0d0d0', '#b8b8b8', '#a0a0a0', '#888888']

for (let i = 0; i < 5; i++) {
  const level = 1 + i * 2
  const nameIndex = i % SKELETON_NAMES.length
  const stats = calculateMonsterStats(level, false, false)

  MONSTERS[`skeleton_${level}`] = {
    id: `skeleton_${level}`,
    name: SKELETON_NAMES[nameIndex],
    type: 'skeleton',
    subtype: 'normal',
    ...stats,
    color: SKELETON_COLORS[i],
    size: 1.0,
    skills: [
      { name: '骨爪', damage: 1.0, mpCost: 0, chance: 1.0 }
    ],
    drops: generateDrops(level, 'normal')
  }
}

// 僵尸系列 - 11-30级（普通）
const ZOMBIE_NAMES = ['行尸', '腐烂僵尸', '毒僵尸', '暴走僵尸', '腐烂巨人']
const ZOMBIE_COLORS = ['#6a6a6a', '#5a5a5a', '#4a4a4a', '#3a3a3a', '#2a2a2a']

for (let i = 0; i < 5; i++) {
  const level = 11 + i * 4
  const nameIndex = i % ZOMBIE_NAMES.length
  const stats = calculateMonsterStats(level, false, false)

  MONSTERS[`zombie_${level}`] = {
    id: `zombie_${level}`,
    name: ZOMBIE_NAMES[nameIndex],
    type: 'zombie',
    subtype: 'normal',
    ...stats,
    color: ZOMBIE_COLORS[i],
    size: 1.0,
    skills: [
      { name: '撕咬', damage: 1.1, mpCost: 0, chance: 1.0 }
    ],
    drops: generateDrops(level, 'normal')
  }
}

// 骷髅精英 - 31-50级（精英）
const SKELETON_ELITE_NAMES = ['白骨骷髅', '骸骨卫士', '骷髅将军', '骸骨狂战士', '骷髅领主']
const SKELETON_ELITE_COLORS = ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0']

for (let i = 0; i < 5; i++) {
  const level = 31 + i * 4
  const nameIndex = i % SKELETON_ELITE_NAMES.length
  const stats = calculateMonsterStats(level, true, false)

  MONSTERS[`skeleton_elite_${level}`] = {
    id: `skeleton_elite_${level}`,
    name: SKELETON_ELITE_NAMES[nameIndex],
    type: 'skeleton',
    subtype: 'elite',
    ...stats,
    color: SKELETON_ELITE_COLORS[i],
    size: 1.2,
    skills: [
      { name: '重击', damage: 1.3, mpCost: 0, chance: 0.4 },
      { name: '骨刺', damage: 1.1, mpCost: 0, chance: 0.6 }
    ],
    drops: generateDrops(level, 'elite')
  }
}

// 僵尸精英 - 51-70级（精英）
const ZOMBIE_ELITE_NAMES = ['腐烂领主', '毒瘴僵尸', '瘟疫使者', '尸暴君', '腐化巨尸']
const ZOMBIE_ELITE_COLORS = ['#8a0000', '#7a0000', '#6a0000', '#5a0000', '#4a0000']

for (let i = 0; i < 5; i++) {
  const level = 51 + i * 4
  const nameIndex = i % ZOMBIE_ELITE_NAMES.length
  const stats = calculateMonsterStats(level, true, false)

  MONSTERS[`zombie_elite_${level}`] = {
    id: `zombie_elite_${level}`,
    name: ZOMBIE_ELITE_NAMES[nameIndex],
    type: 'zombie',
    subtype: 'elite',
    ...stats,
    color: ZOMBIE_ELITE_COLORS[i],
    size: 1.2,
    skills: [
      { name: '腐蚀之触', damage: 1.2, mpCost: 0, chance: 0.5 },
      { name: '毒雾', damage: 0.8, mpCost: 0, chance: 0.5 }
    ],
    drops: generateDrops(level, 'elite')
  }
}

// 骷髅BOSS - 71-90级（BOSS）
const SKELETON_BOSS_NAMES = ['骷髅王', '骸骨大君', '白骨大帝', '亡灵君王', '冥界主宰']
const SKELETON_BOSS_COLORS = ['#ffd700', '#ffcc00', '#ff9900', '#ff6600', '#ff3300']

for (let i = 0; i < 5; i++) {
  const level = 71 + i * 4
  const nameIndex = i % SKELETON_BOSS_NAMES.length
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_skeleton_${level}`] = {
    id: `boss_skeleton_${level}`,
    name: SKELETON_BOSS_NAMES[nameIndex],
    type: 'boss',
    subtype: 'skeleton',
    ...stats,
    color: SKELETON_BOSS_COLORS[i],
    size: 1.8,
    skills: [
      { name: '骨雨', damage: 1.5, mpCost: 0, chance: 0.3 },
      { name: '亡灵召唤', damage: 0, mpCost: 0, chance: 0.2 },
      { name: '死亡凝视', damage: 1.8, mpCost: 0, chance: 0.2 },
      { name: '骸骨之怒', damage: 2.0, mpCost: 0, chance: 0.1 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// ========== 早期地下城 Boss ==========

// 骷髅早期 Boss (5-10级)
for (let i = 0; i < 2; i++) {
  const level = 5 + i * 5
  const nameIndex = i
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_skeleton_${level}`] = {
    id: `boss_skeleton_${level}`,
    name: ['骷髅将军', '骸骨领主'][nameIndex],
    type: 'boss',
    subtype: 'skeleton',
    ...stats,
    color: ['#ffcc00', '#ff9900'][i],
    size: 1.6,
    skills: [
      { name: '骨刺', damage: 1.3, mpCost: 0, chance: 0.3 },
      { name: '恐惧凝视', damage: 1.5, mpCost: 0, chance: 0.2 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// 僵尸早期 Boss (15-30级)
for (let i = 0; i < 4; i++) {
  const level = 15 + i * 5
  const nameIndex = i
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_zombie_${level}`] = {
    id: `boss_zombie_${level}`,
    name: ['僵尸统领', '腐化侯爵', '瘟疫公爵', '尸王'][nameIndex],
    type: 'boss',
    subtype: 'zombie',
    ...stats,
    color: ['#cc0000', '#bb0000', '#aa0000', '#990000'][i],
    size: 1.6,
    skills: [
      { name: '腐烂气息', damage: 1.4, mpCost: 0, chance: 0.3 },
      { name: '瘟疫召唤', damage: 0, mpCost: 0, chance: 0.2 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// 骷髅精英早期 Boss (50-70级)
for (let i = 0; i < 5; i++) {
  const level = 50 + i * 5
  const nameIndex = i
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_skeleton_${level}`] = {
    id: `boss_skeleton_${level}`,
    name: ['骨狱王', '骸骨君主', '白骨大帝', '亡灵君王', '冥界主宰'][nameIndex],
    type: 'boss',
    subtype: 'skeleton',
    ...stats,
    color: ['#ffd700', '#ffcc00', '#ff9900', '#ff6600', '#ff3300'][i],
    size: 1.7,
    skills: [
      { name: '骨雨', damage: 1.5, mpCost: 0, chance: 0.3 },
      { name: '死亡凝视', damage: 1.8, mpCost: 0, chance: 0.2 },
      { name: '骸骨之怒', damage: 2.0, mpCost: 0, chance: 0.1 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// 僵尸精英早期 Boss (70-90级)
for (let i = 0; i < 5; i++) {
  const level = 70 + i * 5
  const nameIndex = i
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_zombie_${level}`] = {
    id: `boss_zombie_${level}`,
    name: ['僵尸领主', '瘟疫之王', '腐化暴君', '尸神', '末日僵尸'][nameIndex],
    type: 'boss',
    subtype: 'zombie',
    ...stats,
    color: ['#8b0000', '#7b0000', '#6b0000', '#5b0000', '#4b0000'][i],
    size: 1.7,
    skills: [
      { name: '瘟疫爆发', damage: 1.6, mpCost: 0, chance: 0.3 },
      { name: '腐蚀光环', damage: 0.5, mpCost: 0, chance: 1.0 },
      { name: '死灵召唤', damage: 0, mpCost: 0, chance: 0.2 },
      { name: '腐化之怒', damage: 2.2, mpCost: 0, chance: 0.2 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// ========== 高级地下城 Boss ==========

// 僵尸BOSS - 91-110级（BOSS）
const ZOMBIE_BOSS_NAMES = ['僵尸领主', '瘟疫之王', '腐化暴君', '尸神', '末日僵尸']
const ZOMBIE_BOSS_COLORS = ['#8b0000', '#7b0000', '#6b0000', '#5b0000', '#4b0000']

for (let i = 0; i < 5; i++) {
  const level = 91 + i * 4
  const nameIndex = i % ZOMBIE_BOSS_NAMES.length
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_zombie_${level}`] = {
    id: `boss_zombie_${level}`,
    name: ZOMBIE_BOSS_NAMES[nameIndex],
    type: 'boss',
    subtype: 'zombie',
    ...stats,
    color: ZOMBIE_BOSS_COLORS[i],
    size: 1.8,
    skills: [
      { name: '瘟疫爆发', damage: 1.6, mpCost: 0, chance: 0.3 },
      { name: '腐蚀光环', damage: 0.5, mpCost: 0, chance: 1.0 },
      { name: '死灵召唤', damage: 0, mpCost: 0, chance: 0.2 },
      { name: '腐化之怒', damage: 2.2, mpCost: 0, chance: 0.2 }
    ],
    drops: generateDrops(level, 'boss')
  }
}
console.log('怪物数据加载 - 僵尸精英早期 Boss 已创建')

// 混合早期 Boss (110-130级)
for (let i = 0; i < 5; i++) {
  const level = 110 + i * 5
  const nameIndex = i
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_hybrid_${level}`] = {
    id: `boss_hybrid_${level}`,
    name: ['混合领主', '深渊之王', '黑暗暴君', '混合大帝', '深渊主宰'][nameIndex],
    type: 'boss',
    subtype: 'hybrid',
    ...stats,
    color: ['#700080', '#600080', '#500080', '#400080', '#300080'][i],
    size: 1.7,
    skills: [
      { name: '深渊冲击', damage: 1.8, mpCost: 0, chance: 0.3 },
      { name: '黑暗新星', damage: 2.0, mpCost: 0, chance: 0.2 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// 混合精英 - 111-130级（精英）
const HYBRID_ELITE_NAMES = ['混合狂战士', '亡灵卫士', '腐化骑士', '黑暗卫士', '深渊守卫']
const HYBRID_ELITE_COLORS = ['#800080', '#700080', '#600080', '#500080', '#400080']

for (let i = 0; i < 5; i++) {
  const level = 111 + i * 4
  const nameIndex = i % HYBRID_ELITE_NAMES.length
  const stats = calculateMonsterStats(level, true, false)

  MONSTERS[`hybrid_elite_${level}`] = {
    id: `hybrid_elite_${level}`,
    name: HYBRID_ELITE_NAMES[nameIndex],
    type: 'hybrid',
    subtype: 'elite',
    ...stats,
    color: HYBRID_ELITE_COLORS[i],
    size: 1.3,
    skills: [
      { name: '暗影斩', damage: 1.4, mpCost: 0, chance: 0.4 },
      { name: '腐蚀打击', damage: 1.2, mpCost: 0, chance: 0.4 },
      { name: '灵魂收割', damage: 1.6, mpCost: 0, chance: 0.2 }
    ],
    drops: generateDrops(level, 'elite')
  }
}

// 混合BOSS - 131-150级（BOSS）
const HYBRID_BOSS_NAMES = ['深渊领主', '冥界大君', '亡灵之神', '腐蚀之神', '深渊主宰']
const HYBRID_BOSS_COLORS = ['#ff00ff', '#ee00ee', '#dd00dd', '#cc00cc', '#bb00bb']

for (let i = 0; i < 5; i++) {
  const level = 131 + i * 4
  const nameIndex = i % HYBRID_BOSS_NAMES.length
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_hybrid_${level}`] = {
    id: `boss_hybrid_${level}`,
    name: HYBRID_BOSS_NAMES[nameIndex],
    type: 'boss',
    subtype: 'hybrid',
    ...stats,
    color: HYBRID_BOSS_COLORS[i],
    size: 2.0,
    skills: [
      { name: '深渊审判', damage: 2.0, mpCost: 0, chance: 0.3 },
      { name: '灵魂收割', damage: 1.8, mpCost: 0, chance: 0.3 },
      { name: '暗影领域', damage: 0.8, mpCost: 0, chance: 0.2 },
      { name: '深渊之怒', damage: 2.5, mpCost: 0, chance: 0.1 },
      { name: '死亡标记', damage: 0, mpCost: 0, chance: 0.1 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// 远古怪物 - 151-170级（精英）
const ANCIENT_NAMES = ['远古守卫', '上古卫士', '太古狂战士', '远古巨兽', '上古魔神']
const ANCIENT_COLORS = ['#00ced1', '#00b0b0', '#009090', '#007070', '#005050']

for (let i = 0; i < 5; i++) {
  const level = 151 + i * 4
  const nameIndex = i % ANCIENT_NAMES.length
  const stats = calculateMonsterStats(level, true, false)

  MONSTERS[`ancient_${level}`] = {
    id: `ancient_${level}`,
    name: ANCIENT_NAMES[nameIndex],
    type: 'ancient',
    subtype: 'elite',
    ...stats,
    color: ANCIENT_COLORS[i],
    size: 1.4,
    skills: [
      { name: '远古之力', damage: 1.5, mpCost: 0, chance: 0.5 },
      { name: '时间扭曲', damage: 0, mpCost: 0, chance: 0.2 },
      { name: '上古怒火', damage: 1.8, mpCost: 0, chance: 0.3 }
    ],
    drops: generateDrops(level, 'elite')
  }
}

// 最终BOSS - 171-200级（BOSS）
const FINAL_BOSS_NAMES = ['黑暗领主', '冥界皇帝', '魔神之王', '混沌之主', '宇宙毁灭者']
const FINAL_BOSS_COLORS = ['#ff0000', '#ee0000', '#dd0000', '#cc0000', '#bb0000']

for (let i = 0; i < 5; i++) {
  const level = 171 + i * 7
  const nameIndex = i % FINAL_BOSS_NAMES.length
  const stats = calculateMonsterStats(level, false, true)

  MONSTERS[`boss_final_${level}`] = {
    id: `boss_final_${level}`,
    name: FINAL_BOSS_NAMES[nameIndex],
    type: 'boss',
    subtype: 'final',
    ...stats,
    color: FINAL_BOSS_COLORS[i],
    size: 2.5,
    skills: [
      { name: '毁灭一击', damage: 3.0, mpCost: 0, chance: 0.2 },
      { name: '混沌风暴', damage: 2.5, mpCost: 0, chance: 0.2 },
      { name: '时间静止', damage: 0, mpCost: 0, chance: 0.1 },
      { name: '宇宙崩塌', damage: 2.8, mpCost: 0, chance: 0.2 },
      { name: '终极审判', damage: 3.5, mpCost: 0, chance: 0.1 },
      { name: '召唤混沌', damage: 0, mpCost: 0, chance: 0.1 }
    ],
    drops: generateDrops(level, 'boss')
  }
}

// 生成掉落配置
function generateDrops(level, monsterType) {
  const drops = []

  // 金币掉落
  const goldMultiplier = monsterType === 'boss' ? 3 : (monsterType === 'elite' ? 1.5 : 1)
  drops.push({
    type: 'gold',
    chance: 0.9,
    amount: [Math.floor(level * 5 * goldMultiplier), Math.floor(level * 10 * goldMultiplier)]
  })

  // 经验掉落
  drops.push({
    type: 'exp',
    chance: 1.0,
    amount: [Math.floor(level * 10), Math.floor(level * 20)]
  })

  // 药水掉落
  drops.push({
    type: 'item',
    chance: 0.15,
    itemId: 'potion_elixir'
  })

  // 装备掉落（根据怪物类型）
  if (monsterType === 'boss') {
    // BOSS 必掉一件装备
    drops.push({
      type: 'equipment',
      chance: 1.0,
      levelRange: [level - 5, level + 5],
      quality: { min: 7, max: 10 } // 史诗-永恒
    })
    // BOSS 可能掉第二件装备
    drops.push({
      type: 'equipment',
      chance: 0.5,
      levelRange: [level - 5, level + 5],
      quality: { min: 6, max: 9 }
    })
  } else if (monsterType === 'elite') {
    // 精英怪高概率掉装备
    drops.push({
      type: 'equipment',
      chance: 0.4,
      levelRange: [level - 3, level + 3],
      quality: { min: 5, max: 8 }
    })
  } else {
    // 普通怪物低概率掉装备
    drops.push({
      type: 'equipment',
      chance: 0.05,
      levelRange: [level - 5, level],
      quality: { min: 1, max: 5 }
    })
  }

  // 高级掉落（特殊物品）
  if (level >= 150) {
    drops.push({
      type: 'special',
      chance: 0.01,
      itemId: 'eternal_gem'
    })
  } else if (level >= 100) {
    drops.push({
      type: 'special',
      chance: 0.02,
      itemId: 'mythic_gem'
    })
  } else if (level >= 50) {
    drops.push({
      type: 'special',
      chance: 0.05,
      itemId: 'legendary_gem'
    })
  }

  return drops
}

// 根据地图获取可用怪物列表
function getMonstersByDungeon(dungeonLevel) {
  const monsters = []

  // 根据地下城等级返回对应怪物
  if (dungeonLevel <= 10) {
    // 1-10级地下城：骷髅系列
    monsters.push('skeleton_1', 'skeleton_3', 'skeleton_5', 'skeleton_7', 'skeleton_9')
  } else if (dungeonLevel <= 30) {
    // 11-30级地下城：僵尸系列
    monsters.push('zombie_11', 'zombie_15', 'zombie_19', 'zombie_23', 'zombie_27')
  } else if (dungeonLevel <= 50) {
    // 31-50级地下城：骷髅精英
    monsters.push('skeleton_elite_31', 'skeleton_elite_35', 'skeleton_elite_39', 'skeleton_elite_43', 'skeleton_elite_47')
  } else if (dungeonLevel <= 70) {
    // 51-70级地下城：僵尸精英
    monsters.push('zombie_elite_51', 'zombie_elite_55', 'zombie_elite_59', 'zombie_elite_63', 'zombie_elite_67')
  } else if (dungeonLevel <= 90) {
    // 71-90级地下城：骷髅BOSS
    monsters.push('skeleton_elite_67', 'boss_skeleton_75', 'skeleton_elite_71', 'boss_skeleton_79', 'boss_skeleton_83')
  } else if (dungeonLevel <= 110) {
    // 91-110级地下城：僵尸BOSS
    monsters.push('zombie_elite_67', 'boss_zombie_95', 'zombie_elite_71', 'boss_zombie_103', 'boss_zombie_107')
  } else if (dungeonLevel <= 130) {
    // 111-130级地下城：混合精英
    monsters.push('hybrid_elite_111', 'hybrid_elite_119', 'hybrid_elite_127', 'boss_skeleton_87', 'boss_zombie_111')
  } else if (dungeonLevel <= 150) {
    // 131-150级地下城：混合BOSS
    monsters.push('hybrid_elite_123', 'boss_hybrid_139', 'boss_hybrid_147', 'hybrid_elite_135', 'boss_hybrid_131')
  } else if (dungeonLevel <= 170) {
    // 151-170级地下城：远古怪物
    monsters.push('ancient_151', 'ancient_159', 'ancient_167', 'boss_hybrid_143', 'ancient_163')
  } else {
    // 171-200级地下城：最终BOSS
    monsters.push('ancient_159', 'ancient_167', 'boss_final_178', 'boss_final_185', 'boss_final_192')
  }

  return monsters
}

// 根据等级范围获取怪物
function getMonstersByLevelRange(minLevel, maxLevel) {
  return Object.values(MONSTERS).filter(m =>
    m.level >= minLevel && m.level <= maxLevel
  )
}

// 获取特定等级的BOSS
function getBossByLevel(level) {
  return Object.values(MONSTERS).find(m =>
    m.type === 'boss' && m.level >= level - 5 && m.level <= level + 5
  )
}

// 获取怪物数据
function getMonster(id) {
  return MONSTERS[id]
}

// 获取所有怪物ID列表
function getAllMonsterIds() {
  return Object.keys(MONSTERS)
}

module.exports = {
  MONSTERS,
  getMonster,
  getMonstersByDungeon,
  getMonstersByLevelRange,
  getBossByLevel,
  getAllMonsterIds
}
