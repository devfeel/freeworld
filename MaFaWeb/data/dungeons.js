/**
 * 地下城地图配置
 * 扩展到200级，包含40个地下城
 */

const DUNGEONS = {}

// 地下城主题配置
const DUNGEON_THEMES = {
  // 1. 废弃墓穴 - 骷髅主题
  tomb: {
    bgColor: '#1a1512',
    borderColor: '#3d2817',
    accentColor: '#6b5344',
    icon: '🪦',
    pattern: 'bone',
    atmosphere: '古老的墓地，白骨森森'
  },
  // 2. 阴暗墓穴 - 地下墓穴主题
  crypt: {
    bgColor: '#1a1a2a',
    borderColor: '#2d2d4a',
    accentColor: '#3d3d5a',
    icon: '⚰️',
    pattern: 'crypt',
    atmosphere: '阴暗的地下墓穴，寂静无声'
  },
  // 3. 废弃矿洞 - 矿洞主题
  mine: {
    bgColor: '#1a1a1a',
    borderColor: '#3d3d3d',
    accentColor: '#5a5a5a',
    icon: '⛏️',
    pattern: 'cave',
    atmosphere: '废弃的矿洞，蕴含着珍贵的矿石'
  },
  // 4. 瘟疫深渊 - 毒气主题
  plague: {
    bgColor: '#1a2a1a',
    borderColor: '#2d4a2d',
    accentColor: '#4a6a4a',
    icon: '☠️',
    pattern: 'poison',
    atmosphere: '剧毒瘴气弥漫，致命的瘟疫之地'
  },
  // 5. 僵尸王国 - 沼泽主题
  swamp: {
    bgColor: '#1a2a1a',
    borderColor: '#2d3d2d',
    accentColor: '#3d5d3d',
    icon: '🧟‍♂️',
    pattern: 'swamp',
    atmosphere: '腐烂的沼泽，僵尸的领地'
  },
  // 6. 元素圣殿 - 圣殿主题
  temple: {
    bgColor: '#1a1a2a',
    borderColor: '#2d2d4a',
    accentColor: '#4a4a6a',
    icon: '⚡',
    pattern: 'sacred',
    atmosphere: '元素之力汇聚的圣殿'
  },
  // 7. 深渊地牢 - 地牢主题
  dungeon: {
    bgColor: '#1a0a0a',
    borderColor: '#3d1a1a',
    accentColor: '#5a2d2d',
    icon: '⛓️',
    pattern: 'prison',
    atmosphere: '阴暗潮湿的地牢，关押着最凶恶的罪犯'
  },
  // 8. 元素王座 - 王座主题
  throne: {
    bgColor: '#2a1a3a',
    borderColor: '#4a2d5a',
    accentColor: '#6a4a7a',
    icon: '👑',
    pattern: 'royal',
    atmosphere: '王者之力凝聚的王座'
  },
  // 9. 绝望之地 - 荒地主题
  wasteland: {
    bgColor: '#2a2a1a',
    borderColor: '#4a4a2d',
    accentColor: '#6a6a3d',
    icon: '🏚️',
    pattern: 'ruin',
    atmosphere: '一片荒芜的绝望之地'
  },
  // 10. 扭曲虚空 - 虚空主题
  void: {
    bgColor: '#0a0a1a',
    borderColor: '#1a1a3d',
    accentColor: '#2d2d5a',
    icon: '🌀',
    pattern: 'void',
    atmosphere: '空间扭曲的虚空世界'
  },
  // 11. 无尽炼狱 - 炼狱主题
  hell: {
    bgColor: '#1a0a0a',
    borderColor: '#4a1a1a',
    accentColor: '#7a2d2d',
    icon: '🔥',
    pattern: 'inferno',
    atmosphere: '炽热的炼狱，火焰的深渊'
  }
}

// 地下城生成函数
function generateDungeon(id, name, level, floors, themeType, monsters, bossId, reward) {
  const theme = DUNGEON_THEMES[themeType] || DUNGEON_THEMES.skeleton

  return {
    id,
    name,
    description: `推荐等级 ${level}，地下城共 ${floors} 层`,
    level,
    floor: floors,
    monsters,
    boss: bossId,
    bossAt: floors,
    theme: {
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      accentColor: theme.accentColor,
      icon: theme.icon,
      mapPattern: theme.pattern,
      atmosphere: theme.atmosphere
    },
    reward
  }
}

// =========== 骷髅系列地下城 (1-10级) ===========
// 1-5级：废弃墓穴系列
for (let i = 1; i <= 5; i++) {
  const level = i * 2 - 1
  const monsters = [
    `skeleton_${level}`,
    `skeleton_${Math.min(level + 2, 10)}`
  ]
  const bossLevel = (i <= 2) ? 5 : 10
  const bossId = `boss_skeleton_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `废弃墓穴·${getRomanNumeral(i)}`,
    level,
    5,
    'tomb',
    monsters,
    bossId,
    {
      exp: level * 20,
      gold: level * 10,
      yuanbao: level,
      items: ['potion_small_hp']
    }
  )
}

// =========== 僵尸系列地下城 (11-30级) ==========
// 6-10级：阴暗墓穴系列
for (let i = 6; i <= 10; i++) {
  const level = (i - 5) * 4 + 7
  const monsters = [
    `zombie_${level}`,
    `zombie_${Math.min(level + 4, 30)}`,
    `skeleton_${Math.min(level - 5, 10)}`
  ]
  const bossLevel = Math.min(Math.ceil((level - 11) / 4) * 5 + 15, 30)
  const bossId = `boss_zombie_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `阴暗墓穴·${getRomanNumeral(i - 5)}`,
    level,
    8,
    'crypt',
    monsters,
    bossId,
    {
      exp: level * 30,
      gold: level * 15,
      yuanbao: level * 2,
      items: ['potion_medium_hp', 'potion_medium_mp']
    }
  )
}

// =========== 骷髅精英地下城 (31-50级) ==========
// 11-15级：骸骨要塞系列
for (let i = 11; i <= 15; i++) {
  const level = (i - 10) * 4 + 29
  const monsters = [
    `skeleton_elite_${level}`,
    `skeleton_elite_${Math.min(level + 4, 50)}`,
    `zombie_${Math.min(level - 15, 30)}`
  ]
  const bossLevel = 50 + Math.min((i - 11), 4) * 5
  const bossId = `boss_skeleton_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `骸骨要塞·${getRomanNumeral(i - 10)}`,
    level,
    10,
    'mine',
    monsters,
    bossId,
    {
      exp: level * 50,
      gold: level * 25,
      yuanbao: level * 3,
      items: ['potion_large_hp', 'potion_large_mp']
    }
  )
}

// =========== 僵尸精英地下城 (51-70级) ==========
// 16-20级：瘟疫深渊系列
for (let i = 16; i <= 20; i++) {
  const level = (i - 15) * 5 + 46
  const monsters = [
    `zombie_elite_${level}`,
    `zombie_elite_${Math.min(level + 5, 70)}`,
    `skeleton_elite_${Math.min(level - 20, 50)}`
  ]
  const bossLevel = 70 + Math.min((i - 16), 4) * 5
  const bossId = `boss_zombie_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `瘟疫深渊·${getRomanNumeral(i - 15)}`,
    level,
    12,
    'plague',
    monsters,
    bossId,
    {
      exp: level * 80,
      gold: level * 40,
      yuanbao: level * 4,
      items: ['potion_giant_hp', 'potion_giant_mp']
    }
  )
}

// =========== 骷髅BOSS地下城 (71-90级) ==========
// 21-25级：骷髅王座系列
for (let i = 21; i <= 25; i++) {
  const level = (i - 20) * 4 + 67
  const monsters = [
    `boss_skeleton_${level - 4}`,
    `skeleton_elite_${Math.min(level, 50)}`,
    `zombie_elite_${Math.min(level - 10, 70)}`
  ]
  const bossLevel = Math.min(level + 4, 90)
  const bossId = `boss_skeleton_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `骷髅王座·${getRomanNumeral(i - 20)}`,
    level,
    15,
    'throne',
    monsters,
    bossId,
    {
      exp: level * 120,
      gold: level * 60,
      yuanbao: level * 5,
      items: ['potion_elixir', 'potion_dual_large']
    }
  )
}

// =========== 僵尸BOSS地下城 (91-110级) ==========
// 26-30级：僵尸王国系列
for (let i = 26; i <= 30; i++) {
  const level = (i - 25) * 4 + 87
  const monsters = [
    `boss_zombie_${level - 4}`,
    `zombie_elite_${Math.min(level, 70)}`,
    `boss_skeleton_${Math.min(level - 20, 90)}`
  ]
  const bossLevel = Math.min(level + 4, 110)
  const bossId = `boss_zombie_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `僵尸王国·${getRomanNumeral(i - 25)}`,
    level,
    18,
    'swamp',
    monsters,
    bossId,
    {
      exp: level * 180,
      gold: level * 90,
      yuanbao: level * 6,
      items: ['potion_elixir', 'potion_giant_hp', 'potion_giant_mp']
    }
  )
}

// =========== 混合精英地下城 (111-130级) ==========
// 31-35级：深渊试炼系列
for (let i = 31; i <= 35; i++) {
  const level = (i - 30) * 4 + 107
  const monsters = [
    `hybrid_elite_${level}`,
    `hybrid_elite_${Math.min(level + 4, 130)}`,
    `boss_zombie_${Math.min(level - 20, 110)}`
  ]
  const bossLevel = 110 + Math.min((i - 31), 4) * 5
  const bossId = `boss_hybrid_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `深渊试炼·${getRomanNumeral(i - 30)}`,
    level,
    20,
    'dungeon',
    monsters,
    bossId,
    {
      exp: level * 250,
      gold: level * 125,
      yuanbao: level * 7,
      items: ['potion_elixir', 'mythic_gem']
    }
  )
}

// =========== 混合BOSS地下城 (131-150级) ==========
// 36-40级：冥界神殿系列
for (let i = 36; i <= 40; i++) {
  const level = (i - 35) * 4 + 127
  const monsters = [
    `boss_hybrid_${level - 4}`,
    `hybrid_elite_${Math.min(level, 130)}`,
    `boss_zombie_${Math.min(level - 20, 110)}`
  ]
  const bossLevel = Math.min(level + 4, 150)
  const bossId = `boss_hybrid_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `冥界神殿·${getRomanNumeral(i - 35)}`,
    level,
    25,
    'temple',
    monsters,
    bossId,
    {
      exp: level * 350,
      gold: level * 175,
      yuanbao: level * 8,
      items: ['potion_elixir', 'mythic_gem', 'legendary_gem']
    }
  )
}

// =========== 远古怪物地下城 (151-170级) ==========
// 41-45级：远古遗迹系列
for (let i = 41; i <= 45; i++) {
  const level = (i - 40) * 4 + 147
  const monsters = [
    `ancient_${level}`,
    `ancient_${Math.min(level + 4, 170)}`,
    `boss_hybrid_${Math.min(level - 20, 150)}`
  ]
  const bossLevel = Math.min(level + 4, 167)
  const bossId = `boss_hybrid_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `远古遗迹·${getRomanNumeral(i - 40)}`,
    level,
    30,
    'wasteland',
    monsters,
    bossId,
    {
      exp: level * 500,
      gold: level * 250,
      yuanbao: level * 9,
      items: ['potion_elixir', 'mythic_gem', 'divine_gem']
    }
  )
}

// =========== 最终BOSS地下城 (171-200级) ==========
// 46-50级：末日降临系列
for (let i = 46; i <= 50; i++) {
  const level = (i - 45) * 7 + 164
  const monsters = [
    `boss_final_${level - 7}`,
    `ancient_${Math.min(level, 170)}`,
    `boss_hybrid_${Math.min(level - 30, 150)}`
  ]
  const bossLevel = Math.min(level + 7, 200)
  const bossId = `boss_final_${bossLevel}`

  DUNGEONS[i] = generateDungeon(
    i,
    `末日降临·${getRomanNumeral(i - 45)}`,
    level,
    35,
    'hell',
    monsters,
    bossId,
    {
      exp: level * 800,
      gold: level * 400,
      yuanbao: level * 10,
      items: ['potion_elixir', 'divine_gem', 'eternal_gem']
    }
  )
}

// 罗马数字转换
function getRomanNumeral(num) {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  return romans[num - 1] || num
}

// 获取地下城数据
function getDungeon(id) {
  return DUNGEONS[id]
}

// 获取所有地下城列表
function getAllDungeons() {
  return Object.values(DUNGEONS).sort((a, b) => a.level - b.level)
}

// 根据玩家等级获取推荐地下城
function getRecommendedDungeons(playerLevel) {
  const minLevel = Math.max(1, playerLevel - 5)
  const maxLevel = playerLevel + 5

  return Object.values(DUNGEONS).filter(d =>
    d.level >= minLevel && d.level <= maxLevel
  ).sort((a, b) => a.level - b.level)
}

// 获取地下城的怪物列表
function getMonstersByDungeon(dungeonId) {
  const dungeon = DUNGEONS[dungeonId]
  if (!dungeon) return []
  return dungeon.monsters || []
}

// 根据等级获取地下城
function getDungeonByLevel(level) {
  return Object.values(DUNGEONS).find(d =>
    d.level <= level && d.level >= level - 5
  ) || DUNGEONS[1]
}

module.exports = {
  DUNGEONS,
  getDungeon,
  getAllDungeons,
  getMonstersByDungeon,
  getRecommendedDungeons,
  getDungeonByLevel
}
