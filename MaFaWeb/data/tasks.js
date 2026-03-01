/**
 * 任务数据配置
 * 100个任务，分为剧情任务、每日任务、成就任务
 */

// 任务类型
const TASK_TYPES = {
  STORY: 'story',      // 剧情任务 - 影响地图开启
  DAILY: 'daily',      // 每日任务 - 每天刷新
  ACHIEVEMENT: 'achievement'  // 成就任务 - 一次性完成
}

// 任务状态
const TASK_STATUS = {
  NOT_STARTED: 'not_started',  // 未开始
  IN_PROGRESS: 'in_progress',  // 进行中
  COMPLETED: 'completed'    // 已完成
}

// 任务配置
const TASKS = {}

// ========== 剧情任务（40个） ==========
const STORY_TASKS = [
  // 第一章：初入玛法
  {
    id: 'story_001',
    type: TASK_TYPES.STORY,
    name: '初入玛法',
    description: '创建你的角色，开启冒险之旅',
    target: '创建角色',
    requirement: { heroLevel: 1 },
    rewards: { exp: 25, gold: 20, items: ['potion_small_hp'] },
    unlockMap: [1],
    status: TASK_STATUS.NOT_STARTED,
    priority: 1,
    chapter: 1
  },
  {
    id: 'story_002',
    type: TASK_TYPES.STORY,
    name: '首次战斗',
    description: '在地下城中完成首次战斗',
    target: '完成1次战斗',
    requirement: { battleCount: 1 },
    rewards: { exp: 50, gold: 40 },
    unlockMap: [1, 2],
    status: TASK_STATUS.NOT_STARTED,
    priority: 2,
    chapter: 1
  },
  {
    id: 'story_003',
    type: TASK_TYPES.STORY,
    name: '装备升级',
    description: '穿戴一件武器',
    target: '穿戴武器',
    requirement: {
      equipWeapon: true,
      heroLevel: 2  // 需要达到2级才能接取
    },
    rewards: { exp: 40, gold: 35 },
    unlockMap: [1, 2],
    status: TASK_STATUS.NOT_STARTED,
    priority: 3,
    chapter: 1
  },
  {
    id: 'story_004',
    type: TASK_TYPES.STORY,
    name: '首次胜利',
    description: '赢得一场战斗胜利',
    target: '战斗胜利1次',
    requirement: { battleWin: 1 },
    rewards: { exp: 75, gold: 60 },
    unlockMap: [1, 2, 3],
    status: TASK_STATUS.NOT_STARTED,
    priority: 4,
    chapter: 1
  },
  {
    id: 'story_005',
    type: TASK_TYPES.STORY,
    name: '探索者',
    description: '探索地下城5层',
    target: '探索5层',
    requirement: { exploreFloors: 5 },
    rewards: { exp: 100, gold: 80 },
    unlockMap: [1, 2, 3, 4],
    status: TASK_STATUS.NOT_STARTED,
    priority: 5,
    chapter: 1
  },
  {
    id: 'story_006',
    type: TASK_TYPES.STORY,
    name: '等级突破',
    description: '角色达到5级',
    target: '达到5级',
    requirement: { heroLevel: 5 },
    rewards: { exp: 150, gold: 120, items: ['potion_small_mp'] },
    unlockMap: [1, 2, 3, 4, 5],
    status: TASK_STATUS.NOT_STARTED,
    priority: 6,
    chapter: 1
  },
  {
    id: 'story_007',
    type: TASK_TYPES.STORY,
    name: '地下城征服者',
    description: '击败地下城BOSS',
    target: '击败BOSS',
    requirement: { defeatBoss: true },
    rewards: { exp: 250, gold: 200, items: ['potion_medium_hp'] },
    unlockMap: [1, 2, 3, 4, 5, 6],
    status: TASK_STATUS.NOT_STARTED,
    priority: 7,
    chapter: 1
  },
  {
    id: 'story_008',
    type: TASK_TYPES.STORY,
    name: '勇士之路',
    description: '角色达到10级',
    target: '达到10级',
    requirement: { heroLevel: 10 },
    rewards: { exp: 250, gold: 200, items: ['potion_medium_hp'] },
    unlockMap: [2],
    status: TASK_STATUS.NOT_STARTED,
    priority: 8,
    chapter: 1
  },

  // 第二章：阴暗墓穴
  {
    id: 'story_009',
    type: TASK_TYPES.STORY,
    name: '深入地下',
    description: '完成地下城1的所有层数',
    target: '完成地下城1',
    requirement: {
      dungeonClear: 1,
      requiredDungeons: [1]  // 需要解锁地下城1
    },
    rewards: { exp: 200, gold: 180 },
    unlockMap: [2, 3],
    status: TASK_STATUS.NOT_STARTED,
    priority: 9,
    chapter: 2
  },
  {
    id: 'story_010',
    type: TASK_TYPES.STORY,
    name: '装备大师',
    description: '穿戴3件装备',
    target: '穿戴3件装备',
    requirement: { equipCount: 3 },
    rewards: { exp: 150, gold: 150 },
    unlockMap: [2, 3, 4],
    status: TASK_STATUS.NOT_STARTED,
    priority: 10,
    chapter: 2
  },
  {
    id: 'story_011',
    type: TASK_TYPES.STORY,
    name: '连战大师',
    description: '连续赢得3场战斗',
    target: '连胜3场',
    requirement: { winStreak: 3 },
    rewards: { exp: 200, gold: 200 },
    unlockMap: [2, 3, 4, 5],
    status: TASK_STATUS.NOT_STARTED,
    priority: 11,
    chapter: 2
  },
  {
    id: 'story_012',
    type: TASK_TYPES.STORY,
    name: '装备强化',
    description: '收集5件稀有度以上装备',
    target: '收集稀有装备',
    requirement: { rareEquipment: 5 },
    rewards: { exp: 300, gold: 300, items: ['potion_small_mp'] },
    unlockMap: [2, 3, 4, 5, 6],
    status: TASK_STATUS.NOT_STARTED,
    priority: 12,
    chapter: 2
  },
  {
    id: 'story_013',
    type: TASK_TYPES.STORY,
    name: '等级飞跃',
    description: '角色达到15级',
    target: '达到15级',
    requirement: { heroLevel: 15 },
    rewards: { exp: 400, gold: 400, items: ['potion_medium_hp'] },
    unlockMap: [3],
    status: TASK_STATUS.NOT_STARTED,
    priority: 13,
    chapter: 2
  },
  {
    id: 'story_014',
    type: TASK_TYPES.STORY,
    name: '双BOSS猎手',
    description: '击败2个地下城BOSS',
    target: '击败2个BOSS',
    requirement: { defeatBossCount: 2 },
    rewards: { exp: 400, gold: 400 },
    unlockMap: [3, 4],
    status: TASK_STATUS.NOT_STARTED,
    priority: 14,
    chapter: 2
  },

  // 第三章：骸骨要塞
  {
    id: 'story_015',
    type: TASK_TYPES.STORY,
    name: '要塞征服者',
    description: '完成地下城2的所有层数',
    target: '完成地下城2',
    requirement: {
      dungeonClear: 2,
      prerequisiteTasks: ['story_009'],  // 需要先完成"深入地下"任务
      requiredDungeons: [2]  // 需要解锁地下城2
    },
    rewards: { exp: 300, gold: 300 },
    unlockMap: [3, 4, 5],
    status: TASK_STATUS.NOT_STARTED,
    priority: 15,
    chapter: 3
  },
  {
    id: 'story_016',
    type: TASK_TYPES.STORY,
    name: '全副武装',
    description: '穿戴全套装备（6件）',
    target: '穿戴6件装备',
    requirement: { equipFullSet: true },
    rewards: { exp: 250, gold: 250 },
    unlockMap: [3, 4, 5, 6],
    status: TASK_STATUS.NOT_STARTED,
    priority: 16,
    chapter: 3
  },
  {
    id: 'story_017',
    type: TASK_TYPES.STORY,
    name: '财富猎人',
    description: '累计获得2000金币',
    target: '获得2000金币',
    requirement: { totalGold: 2000 },
    rewards: { exp: 300, gold: 400 },
    unlockMap: [3, 4, 5, 6, 7],
    status: TASK_STATUS.NOT_STARTED,
    priority: 17,
    chapter: 3
  },
  {
    id: 'story_018',
    type: TASK_TYPES.STORY,
    name: '连胜传奇',
    description: '连续赢得5场战斗',
    target: '连胜5场',
    requirement: { winStreak: 5 },
    rewards: { exp: 300, gold: 300 },
    unlockMap: [3, 4, 5, 6, 7, 8],
    status: TASK_STATUS.NOT_STARTED,
    priority: 18,
    chapter: 3
  },
  {
    id: 'story_019',
    type: TASK_TYPES.STORY,
    name: '等级巅峰',
    description: '角色达到20级',
    target: '达到20级',
    requirement: { heroLevel: 20 },
    rewards: { exp: 500, gold: 500, items: ['potion_medium_mp'] },
    unlockMap: [4],
    status: TASK_STATUS.NOT_STARTED,
    priority: 19,
    chapter: 3
  },
  {
    id: 'story_020',
    type: TASK_TYPES.STORY,
    name: 'BOSS杀手',
    description: '击败3个地下城BOSS',
    target: '击败3个BOSS',
    requirement: { defeatBossCount: 3 },
    rewards: { exp: 500, gold: 500 },
    unlockMap: [4, 5],
    status: TASK_STATUS.NOT_STARTED,
    priority: 20,
    chapter: 3
  },

  // 第四章：瘟疫深渊
  {
    id: 'story_021',
    type: TASK_TYPES.STORY,
    name: '深渊探索者',
    description: '完成地下城3的所有层数',
    target: '完成地下城3',
    requirement: { dungeonClear: 3 },
    rewards: { exp: 400, gold: 400 },
    unlockMap: [4, 5, 6],
    status: TASK_STATUS.NOT_STARTED,
    priority: 21,
    chapter: 4
  },
  {
    id: 'story_022',
    type: TASK_TYPES.STORY,
    name: '装备收藏家',
    description: '收集8件稀有度以上装备',
    target: '收集稀有装备',
    requirement: { rareEquipment: 8 },
    rewards: { exp: 400, gold: 400 },
    unlockMap: [4, 5, 6, 7],
    status: TASK_STATUS.NOT_STARTED,
    priority: 22,
    chapter: 4
  },
  {
    id: 'story_023',
    type: TASK_TYPES.STORY,
    name: '精英猎手',
    description: '击败5个精英怪物',
    target: '击败5个精英',
    requirement: { eliteKills: 5 },
    rewards: { exp: 450, gold: 450 },
    unlockMap: [4, 5, 6, 7, 8],
    status: TASK_STATUS.NOT_STARTED,
    priority: 23,
    chapter: 4
  },
  {
    id: 'story_024',
    type: TASK_TYPES.STORY,
    name: '连胜王者',
    description: '连续赢得7场战斗',
    target: '连胜7场',
    requirement: { winStreak: 7 },
    rewards: { exp: 450, gold: 450 },
    unlockMap: [4, 5, 6, 7, 8, 9],
    status: TASK_STATUS.NOT_STARTED,
    priority: 24,
    chapter: 4
  },
  {
    id: 'story_025',
    type: TASK_TYPES.STORY,
    name: '等级超越',
    description: '角色达到25级',
    target: '达到25级',
    requirement: { heroLevel: 25 },
    rewards: { exp: 600, gold: 600, items: ['potion_dual_small'] },
    unlockMap: [5],
    status: TASK_STATUS.NOT_STARTED,
    priority: 25,
    chapter: 4
  },
  {
    id: 'story_026',
    type: TASK_TYPES.STORY,
    name: 'BOSS毁灭者',
    description: '击败4个地下城BOSS',
    target: '击败4个BOSS',
    requirement: { defeatBossCount: 4 },
    rewards: { exp: 600, gold: 600 },
    unlockMap: [5, 6],
    status: TASK_STATUS.NOT_STARTED,
    priority: 26,
    chapter: 4
  },

  // 第五章：僵尸王国
  {
    id: 'story_027',
    type: TASK_TYPES.STORY,
    name: '王国征服者',
    description: '完成地下城4的所有层数',
    target: '完成地下城4',
    requirement: { dungeonClear: 4 },
    rewards: { exp: 500, gold: 500 },
    unlockMap: [5, 6, 7],
    status: TASK_STATUS.NOT_STARTED,
    priority: 27,
    chapter: 5
  },
  {
    id: 'story_028',
    type: TASK_TYPES.STORY,
    name: '装备达人',
    description: '收集12件稀有度以上装备',
    target: '收集稀有装备',
    requirement: { rareEquipment: 12 },
    rewards: { exp: 500, gold: 500 },
    unlockMap: [5, 6, 7, 8],
    status: TASK_STATUS.NOT_STARTED,
    priority: 28,
    chapter: 5
  },
  {
    id: 'story_029',
    type: TASK_TYPES.STORY,
    name: '探索大师',
    description: '探索地下城15层',
    target: '探索15层',
    requirement: { exploreFloors: 15 },
    rewards: { exp: 550, gold: 550 },
    unlockMap: [5, 6, 7, 8, 9],
    status: TASK_STATUS.NOT_STARTED,
    priority: 29,
    chapter: 5
  },
  {
    id: 'story_030',
    type: TASK_TYPES.STORY,
    name: '连胜神将',
    description: '连续赢得10场战斗',
    target: '连胜10场',
    requirement: { winStreak: 10 },
    rewards: { exp: 550, gold: 550 },
    unlockMap: [5, 6, 7, 8, 9, 10],
    status: TASK_STATUS.NOT_STARTED,
    priority: 30,
    chapter: 5
  },
  {
    id: 'story_031',
    type: TASK_TYPES.STORY,
    name: '等级传奇',
    description: '角色达到30级',
    target: '达到30级',
    requirement: { heroLevel: 30 },
    rewards: { exp: 750, gold: 750, items: ['potion_medium_mp'] },
    unlockMap: [6],
    status: TASK_STATUS.NOT_STARTED,
    priority: 31,
    chapter: 5
  },
  {
    id: 'story_032',
    type: TASK_TYPES.STORY,
    name: 'BOSS终结者',
    description: '击败5个地下城BOSS',
    target: '击败5个BOSS',
    requirement: { defeatBossCount: 5 },
    rewards: { exp: 750, gold: 750 },
    unlockMap: [6, 7],
    status: TASK_STATUS.NOT_STARTED,
    priority: 32,
    chapter: 5
  },

  // 第六章至十章（剩余剧情任务）
  {
    id: 'story_033',
    type: TASK_TYPES.STORY,
    name: '深渊征服者',
    description: '完成地下城5的所有层数',
    target: '完成地下城5',
    requirement: { dungeonClear: 5 },
    rewards: { exp: 600, gold: 600 },
    unlockMap: [6, 7],
    status: TASK_STATUS.NOT_STARTED,
    priority: 33,
    chapter: 6
  },
  {
    id: 'story_034',
    type: TASK_TYPES.STORY,
    name: '装备传说',
    description: '收集15件稀有度以上装备',
    target: '收集稀有装备',
    requirement: { rareEquipment: 15 },
    rewards: { exp: 600, gold: 600 },
    unlockMap: [6, 7, 8],
    status: TASK_STATUS.NOT_STARTED,
    priority: 34,
    chapter: 6
  },
  {
    id: 'story_035',
    type: TASK_TYPES.STORY,
    name: '连胜霸主',
    description: '连续赢得15场战斗',
    target: '连胜15场',
    requirement: { winStreak: 15 },
    rewards: { exp: 600, gold: 600 },
    unlockMap: [6, 7, 8, 9],
    status: TASK_STATUS.NOT_STARTED,
    priority: 35,
    chapter: 6
  },
  {
    id: 'story_036',
    type: TASK_TYPES.STORY,
    name: '等级神话',
    description: '角色达到40级',
    target: '达到40级',
    requirement: { heroLevel: 40 },
    rewards: { exp: 1000, gold: 1000, items: ['potion_large_hp'] },
    unlockMap: [7],
    status: TASK_STATUS.NOT_STARTED,
    priority: 36,
    chapter: 7
  },
  {
    id: 'story_037',
    type: TASK_TYPES.STORY,
    name: 'BOSS毁灭者',
    description: '击败6个地下城BOSS',
    target: '击败6个BOSS',
    requirement: { defeatBossCount: 6 },
    rewards: { exp: 1000, gold: 1000 },
    unlockMap: [7, 8],
    status: TASK_STATUS.NOT_STARTED,
    priority: 37,
    chapter: 7
  },
  {
    id: 'story_038',
    type: TASK_TYPES.STORY,
    name: '冥界征服者',
    description: '完成地下城6的所有层数',
    target: '完成地下城6',
    requirement: { dungeonClear: 6 },
    rewards: { exp: 1000, gold: 1000 },
    unlockMap: [7, 8, 9],
    status: TASK_STATUS.NOT_STARTED,
    priority: 38,
    chapter: 8
  },
  {
    id: 'story_039',
    type: TASK_TYPES.STORY,
    name: '装备神话',
    description: '收集20件稀有度以上装备',
    target: '收集稀有装备',
    requirement: { rareEquipment: 20 },
    rewards: { exp: 1000, gold: 1000 },
    unlockMap: [7, 8, 9, 10],
    status: TASK_STATUS.NOT_STARTED,
    priority: 39,
    chapter: 8
  },
  {
    id: 'story_040',
    type: TASK_TYPES.STORY,
    name: '等级神圣',
    description: '角色达到50级',
    target: '达到50级',
    requirement: { heroLevel: 50 },
    rewards: { exp: 1500, gold: 1500, items: ['potion_large_mp'] },
    unlockMap: [8, 9, 10],
    status: TASK_STATUS.NOT_STARTED,
    priority: 40,
    chapter: 9
  }
]

// ========== 每日任务（30个） ==========
const DAILY_TASKS = []
for (let i = 1; i <= 30; i++) {
  DAILY_TASKS.push({
    id: `daily_${i.toString().padStart(3, '0')}`,
    type: TASK_TYPES.DAILY,
    name: `每日任务 ${i}`,
    description: getDailyTaskDescription(i),
    target: getDailyTaskTarget(i),
    requirement: getDailyTaskRequirement(i),
    rewards: getDailyTaskRewards(i),
    unlockMap: [],
    status: TASK_STATUS.NOT_STARTED,
    priority: i,
    resetType: 'daily'
  })
}

function getDailyTaskDescription(index) {
  const tasks = [
    '完成3次战斗', '获得200金币', '使用1次药水', '完成2个地下城层数',
    '击败5个怪物', '穿戴1件装备', '探索3层', '击败1个精英怪物',
    '出售1件物品', '购买1件商城物品', '击败2个精英怪物', '获得300经验',
    '完成3个地下城层数', '击败8个怪物', '升级1次', '完成5次战斗',
    '获得400金币', '使用2次药水', '击败10个怪物', '完成1次BOSS挑战',
    '购买2件商城物品', '获得1件稀有装备', '探索5层', '击败15个怪物',
    '完成4个地下城层数', '出售2件物品', '达到等级+1', '穿戴2件装备',
    '击败1个BOSS', '完成10次战斗'
  ]
  return tasks[(index - 1) % tasks.length]
}

function getDailyTaskTarget(index) {
  const tasks = [
    '完成3次战斗', '获得200金币', '使用1次药水', '完成2个地下城层数',
    '击败5个怪物', '穿戴1件装备', '探索3层', '击败1个精英怪物',
    '出售1件物品', '购买1件商城物品', '击败2个精英怪物', '获得300经验',
    '完成3个地下城层数', '击败8个怪物', '升级1次', '完成5次战斗',
    '获得400金币', '使用2次药水', '击败10个怪物', '完成1次BOSS挑战',
    '购买2件商城物品', '获得1件稀有装备', '探索5层', '击败15个怪物',
    '完成4个地下城层数', '出售2件物品', '达到等级+1', '穿戴2件装备',
    '击败1个BOSS', '完成10次战斗'
  ]
  return tasks[(index - 1) % tasks.length]
}

function getDailyTaskRequirement(index) {
  const tasks = [
    { battleCount: 3 },
    { goldGain: 200 },
    { potionUse: 1 },
    { floorComplete: 2 },
    { monsterKill: 5 },
    { equipChange: 1 },
    { exploreFloor: 3 },
    { eliteKill: 1 },
    { sellItem: 1 },
    { shopBuy: 1 },
    { eliteKill: 2 },
    { expGain: 300 },
    { floorComplete: 3 },
    { monsterKill: 8 },
    { levelUp: 1 },
    { battleCount: 5 },
    { goldGain: 400 },
    { potionUse: 2 },
    { monsterKill: 10 },
    { bossChallenge: 1 },
    { shopBuy: 2 },
    { rareItemGet: 1 },
    { exploreFloor: 5 },
    { monsterKill: 15 },
    { floorComplete: 4 },
    { sellItem: 2 },
    { levelUp: 1 },
    { equipChange: 2 },
    { bossDefeat: 1 },
    { battleCount: 10 }
  ]
  return tasks[(index - 1) % tasks.length]
}

function getDailyTaskRewards(index) {
  const baseReward = Math.floor(index * 5 + 10)  // 降低奖励幅度
  return {
    exp: baseReward,
    gold: baseReward
  }
}

// ========== 成就任务（30个） ==========
const ACHIEVEMENT_TASKS = [
  {
    id: 'achievement_001',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '初露锋芒',
    description: '累计赢得20场战斗',
    target: '累计胜利20场',
    requirement: { totalWin: 20 },
    rewards: { exp: 200, gold: 200, title: '初露锋芒' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 1
  },
  {
    id: 'achievement_002',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '战斗新星',
    description: '累计赢得100场战斗',
    target: '累计胜利100场',
    requirement: { totalWin: 100 },
    rewards: { exp: 500, gold: 500, title: '战斗新星' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 2
  },
  {
    id: 'achievement_003',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '战斗专家',
    description: '累计赢得200场战斗',
    target: '累计胜利200场',
    requirement: { totalWin: 200 },
    rewards: { exp: 1000, gold: 1000, title: '战斗专家' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 3
  },
  {
    id: 'achievement_004',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '战斗大师',
    description: '累计赢得500场战斗',
    target: '累计胜利500场',
    requirement: { totalWin: 500 },
    rewards: { exp: 2000, gold: 2000, title: '战斗大师' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 4
  },
  {
    id: 'achievement_005',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '战斗传说',
    description: '累计赢得1000场战斗',
    target: '累计胜利1000场',
    requirement: { totalWin: 1000 },
    rewards: { exp: 4000, gold: 4000, title: '战斗传说' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 5
  },
  {
    id: 'achievement_006',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '杀怪新手',
    description: '累计击败200个怪物',
    target: '击败200怪物',
    requirement: { totalMonsterKills: 200 },
    rewards: { exp: 150, gold: 150, title: '杀怪新手' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 6
  },
  {
    id: 'achievement_007',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '杀怪高手',
    description: '累计击败1000个怪物',
    target: '击败1000怪物',
    requirement: { totalMonsterKills: 1000 },
    rewards: { exp: 500, gold: 500, title: '杀怪高手' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 7
  },
  {
    id: 'achievement_008',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '杀怪大师',
    description: '累计击败2000个怪物',
    target: '击败2000怪物',
    requirement: { totalMonsterKills: 2000 },
    rewards: { exp: 1000, gold: 1000, title: '杀怪大师' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 8
  },
  {
    id: 'achievement_009',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '杀怪传说',
    description: '累计击败5000个怪物',
    target: '击败5000怪物',
    requirement: { totalMonsterKills: 5000 },
    rewards: { exp: 2000, gold: 2000, title: '杀怪传说' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 9
  },
  {
    id: 'achievement_010',
    type: TASK_TYPES.ACHIEVEMENT,
    name: 'BOSS杀手',
    description: '累计击败5个BOSS',
    target: '击败5个BOSS',
    requirement: {
      totalBossKills: 5,
      requiredMaxLevel: 10  // 需要达到10级才能解锁此成就
    },
    rewards: { exp: 500, gold: 500, title: 'BOSS杀手' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 10
  },
  {
    id: 'achievement_011',
    type: TASK_TYPES.ACHIEVEMENT,
    name: 'BOSS猎人',
    description: '累计击败10个BOSS',
    target: '击败10个BOSS',
    requirement: { totalBossKills: 10 },
    rewards: { exp: 1000, gold: 1000, title: 'BOSS猎人' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 11
  },
  {
    id: 'achievement_012',
    type: TASK_TYPES.ACHIEVEMENT,
    name: 'BOSS毁灭者',
    description: '累计击败20个BOSS',
    target: '击败20个BOSS',
    requirement: { totalBossKills: 20 },
    rewards: { exp: 1500, gold: 1500, title: 'BOSS毁灭者' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 12
  },
  {
    id: 'achievement_013',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '收藏家',
    description: '累计获得5件稀有装备',
    target: '收集5稀有装备',
    requirement: { rareEquipmentTotal: 5 },
    rewards: { exp: 250, gold: 250, title: '收藏家' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 13
  },
  {
    id: 'achievement_014',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '装备大师',
    description: '累计获得10件稀有装备',
    target: '收集10稀有装备',
    requirement: { rareEquipmentTotal: 10 },
    rewards: { exp: 500, gold: 500, title: '装备大师' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 14
  },
  {
    id: 'achievement_015',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '装备传说',
    description: '累计获得20件稀有装备',
    target: '收集20稀有装备',
    requirement: { rareEquipmentTotal: 20 },
    rewards: { exp: 1000, gold: 1000, title: '装备传说' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 15
  },
  {
    id: 'achievement_016',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '土豪',
    description: '累计获得5000金币',
    target: '获得5000金币',
    requirement: { totalGold: 5000 },
    rewards: { exp: 250, gold: 250, title: '土豪' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 16
  },
  {
    id: 'achievement_017',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '大富翁',
    description: '累计获得20000金币',
    target: '获得20000金币',
    requirement: { totalGold: 20000 },
    rewards: { exp: 750, gold: 750, title: '大富翁' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 17
  },
  {
    id: 'achievement_018',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '亿万富翁',
    description: '累计获得50000金币',
    target: '获得50000金币',
    requirement: { totalGold: 50000 },
    rewards: { exp: 1500, gold: 1500, title: '亿万富翁' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 18
  },
  {
    id: 'achievement_019',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '等级达人',
    description: '角色达到15级',
    target: '达到15级',
    requirement: { heroLevelMax: 15 },
    rewards: { exp: 250, gold: 250, title: '等级达人' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 19
  },
  {
    id: 'achievement_020',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '等级高手',
    description: '角色达到25级',
    target: '达到25级',
    requirement: { heroLevelMax: 25 },
    rewards: { exp: 500, gold: 500, title: '等级高手' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 20
  },
  {
    id: 'achievement_021',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '等级大师',
    description: '角色达到35级',
    target: '达到35级',
    requirement: { heroLevelMax: 35 },
    rewards: { exp: 1000, gold: 1000, title: '等级大师' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 21
  },
  {
    id: 'achievement_022',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '等级神话',
    description: '角色达到50级',
    target: '达到50级',
    requirement: { heroLevelMax: 50 },
    rewards: { exp: 1500, gold: 1500, title: '等级神话' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 22
  },
  {
    id: 'achievement_023',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '地下城探险家',
    description: '累计探索100个地下城层数',
    target: '探索100层',
    requirement: { totalExploreFloors: 100 },
    rewards: { exp: 500, gold: 500, title: '地下城探险家' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 23
  },
  {
    id: 'achievement_024',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '地下城征服者',
    description: '累计探索200个地下城层数',
    target: '探索200层',
    requirement: { totalExploreFloors: 200 },
    rewards: { exp: 1000, gold: 1000, title: '地下城征服者' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 24
  },
  {
    id: 'achievement_025',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '地下城大师',
    description: '累计探索500个地下城层数',
    target: '探索500层',
    requirement: { totalExploreFloors: 500 },
    rewards: { exp: 1500, gold: 1500, title: '地下城大师' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 25
  },
  {
    id: 'achievement_026',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '地下城传说',
    description: '累计探索1000个地下城层数',
    target: '探索1000层',
    requirement: { totalExploreFloors: 1000 },
    rewards: { exp: 2500, gold: 2500, title: '地下城传说' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 26
  },
  {
    id: 'achievement_027',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '连胜新手',
    description: '累计3次连胜',
    target: '3连胜',
    requirement: { maxWinStreak: 3 },
    rewards: { exp: 250, gold: 250, title: '连胜新手' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 27
  },
  {
    id: 'achievement_028',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '连胜高手',
    description: '累计7次连胜',
    target: '7连胜',
    requirement: { maxWinStreak: 7 },
    rewards: { exp: 500, gold: 500, title: '连胜高手' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 28
  },
  {
    id: 'achievement_029',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '连胜大师',
    description: '累计15次连胜',
    target: '15连胜',
    requirement: { maxWinStreak: 15 },
    rewards: { exp: 1000, gold: 1000, title: '连胜大师' },
    status: TASK_STATUS.NOT_STARTED,
    priority: 29
  },
  {
    id: 'achievement_030',
    type: TASK_TYPES.ACHIEVEMENT,
    name: '全任务完成',
    description: '完成所有剧情任务',
    target: '完成所有剧情',
    requirement: { allStoryCompleted: true },
    rewards: { exp: 5000, gold: 5000, title: '全任务完成', specialReward: true },
    status: TASK_STATUS.NOT_STARTED,
    priority: 30
  }
]

// 将所有任务添加到 TASKS 对象
STORY_TASKS.forEach(task => TASKS[task.id] = task)
DAILY_TASKS.forEach(task => TASKS[task.id] = task)
ACHIEVEMENT_TASKS.forEach(task => TASKS[task.id] = task)

// 获取所有任务
function getAllTasks() {
  return Object.values(TASKS)
}

// 根据类型获取任务
function getTasksByType(type) {
  return Object.values(TASKS).filter(task => task.type === type)
}

// 根据状态获取任务
function getTasksByStatus(status) {
  return Object.values(TASKS).filter(task => task.status === status)
}

// 获取可接取的任务（根据玩家等级、已完成任务、解锁地图等条件）
function getAvailableTasks(playerLevel, completedTaskIds, unlockedMaps, hero) {
  return Object.values(TASKS).filter(task => {
    // 检查是否已完成
    if (completedTaskIds.includes(task.id)) {
      return false
    }

    const req = task.requirement || {}

    // 检查等级要求
    if (req.heroLevel && hero && hero.level < req.heroLevel) {
      return false
    }

    // 检查前置任务要求
    if (req.prerequisiteTasks && Array.isArray(req.prerequisiteTasks)) {
      const allPrerequisitesCompleted = req.prerequisiteTasks.every(prereqId =>
        completedTaskIds.includes(prereqId)
      )
      if (!allPrerequisitesCompleted) {
        return false
      }
    }

    // 检查前置地下城要求
    if (req.requiredDungeons && Array.isArray(req.requiredDungeons)) {
      const allDungeonsUnlocked = req.requiredDungeons.every(dungeonId =>
        unlockedMaps.includes(dungeonId)
      )
      if (!allDungeonsUnlocked) {
        return false
      }
    }

    // 检查前置剧情任务数量要求
    if (req.requiredStoryTaskCount) {
      const completedStoryCount = completedTaskIds.filter(id => id.startsWith('story_')).length
      if (completedStoryCount < req.requiredStoryTaskCount) {
        return false
      }
    }

    // 检查前置成就任务数量要求
    if (req.requiredAchievementTaskCount) {
      const completedAchievementCount = completedTaskIds.filter(id => id.startsWith('achievement_')).length
      if (completedAchievementCount < req.requiredAchievementTaskCount) {
        return false
      }
    }

    // 检查前置地下城层数要求
    if (req.requiredFloor && hero && hero.dungeonProgress) {
      // 检查是否有达到指定层数的地下城
      let hasReachedFloor = false
      for (const dungeonId in hero.dungeonProgress) {
        if (hero.dungeonProgress[dungeonId] >= req.requiredFloor) {
          hasReachedFloor = true
          break
        }
      }
      if (!hasReachedFloor) {
        return false
      }
    }

    // 检查前置金币要求
    if (req.requiredGold && hero && hero.gold < req.requiredGold) {
      return false
    }

    // 检查前置等级要求（最大等级）
    if (req.requiredMaxLevel && hero && hero.level < req.requiredMaxLevel) {
      return false
    }

    // 检查前置装备要求（需要装备某类装备）
    if (req.requiredEquipmentType && hero && hero.equipment) {
      const hasRequiredEquipment = !!hero.equipment[req.requiredEquipmentType]
      if (!hasRequiredEquipment) {
        return false
      }
    }

    // 检查前置职业要求（如果是多职业系统）
    if (req.requiredJob && hero && hero.job !== req.requiredJob) {
      return false
    }

    return true
  })
}

// 检查任务是否完成
function checkTaskCompletion(taskId, playerData) {
  const task = TASKS[taskId]
  if (!task) return { completed: false, progress: 0 }

  const requirement = task.requirement
  let progress = 0
  let completed = false

  // 检查角色等级要求
  if (requirement.heroLevel && playerData.hero && playerData.hero.level >= requirement.heroLevel) {
    progress = 100
    completed = true
  }

  // 检查战斗次数要求
  if (requirement.battleCount && playerData.battleCount >= requirement.battleCount) {
    progress = Math.min(100, (playerData.battleCount / requirement.battleCount) * 100)
    completed = true
  }

  // 检查是否装备武器
  if (requirement.equipWeapon && playerData.hasWeapon) {
    completed = true
    progress = 100
  }

  // 检查战斗胜利次数
  if (requirement.battleWin && playerData.battleWin >= requirement.battleWin) {
    progress = Math.min(100, (playerData.battleWin / requirement.battleWin) * 100)
    completed = true
  }

  // 检查探索楼层
  if (requirement.exploreFloors && playerData.exploreFloors >= requirement.exploreFloors) {
    progress = Math.min(100, (playerData.exploreFloors / requirement.exploreFloors) * 100)
    completed = true
  }

  // 检查地下城通关
  if (requirement.dungeonClear && playerData.dungeonClears && Array.isArray(playerData.dungeonClears) && playerData.dungeonClears.includes(requirement.dungeonClear)) {
    completed = true
    progress = 100
  }

  // 检查击败BOSS
  if (requirement.defeatBoss && playerData.defeatBosses >= 1) {
    completed = true
    progress = 100
  }

  // 检查总胜利次数（成就任务）
  if (requirement.totalWin && playerData.totalWins >= requirement.totalWin) {
    progress = Math.min(100, (playerData.totalWins / requirement.totalWin) * 100)
    completed = true
  }

  // 检查总怪物击杀数
  if (requirement.totalMonsterKills && playerData.totalMonsterKills >= requirement.totalMonsterKills) {
    progress = Math.min(100, (playerData.totalMonsterKills / requirement.totalMonsterKills) * 100)
    completed = true
  }

  // 检查总BOSS击杀数
  if (requirement.totalBossKills && playerData.totalBossKills >= requirement.totalBossKills) {
    progress = Math.min(100, (playerData.totalBossKills / requirement.totalBossKills) * 100)
    completed = true
  }

  // 检查稀有装备数量
  if (requirement.rareEquipment && playerData.rareEquipmentCount >= requirement.rareEquipment) {
    progress = Math.min(100, (playerData.rareEquipmentCount / requirement.rareEquipment) * 100)
    completed = true
  }

  // 检查金币总数
  if (requirement.totalGold && playerData.totalGold >= requirement.totalGold) {
    progress = Math.min(100, (playerData.totalGold / requirement.totalGold) * 100)
    completed = true
  }

  // 检查总探索楼层
  if (requirement.totalExploreFloors && playerData.totalExploreFloors >= requirement.totalExploreFloors) {
    progress = Math.min(100, (playerData.totalExploreFloors / requirement.totalExploreFloors) * 100)
    completed = true
  }

  // 新增检查项 - 检查全套装备
  if (requirement.equipFullSet && playerData.equipFullSet) {
    completed = true
    progress = 100
  }

  // 新增检查项 - 检查连胜次数
  if (requirement.winStreak && playerData.maxWinStreak >= requirement.winStreak) {
    completed = true
    progress = 100
  }

  // 新增检查项 - 检查精英怪物击杀
  if (requirement.eliteKills && playerData.eliteKills >= requirement.eliteKills) {
    progress = Math.min(100, (playerData.eliteKills / requirement.eliteKills) * 100)
    completed = true
  }

  // 新增检查项 - 检查稀有装备总数（成就任务）
  if (requirement.rareEquipmentTotal && playerData.rareEquipmentTotal >= requirement.rareEquipmentTotal) {
    progress = Math.min(100, (playerData.rareEquipmentTotal / requirement.rareEquipmentTotal) * 100)
    completed = true
  }

  // 新增检查项 - 检查最大等级（成就任务）
  if (requirement.heroLevelMax && playerData.hero && playerData.hero.level >= requirement.heroLevelMax) {
    completed = true
    progress = 100
  }

  // 新增检查项 - 检查最大连胜（成就任务）
  if (requirement.maxWinStreak && playerData.maxWinStreak >= requirement.maxWinStreak) {
    completed = true
    progress = 100
  }

  // 新增检查项 - 检查完成所有剧情任务
  if (requirement.allStoryCompleted) {
    const storyTaskCount = STORY_TASKS.length
    const completedStoryCount = playerData.completedStoryCount || 0
    if (completedStoryCount >= storyTaskCount) {
      completed = true
      progress = 100
    }
  }

  // 如果没有找到匹配的要求，但progress仍为0，说明可能不需要任何特殊检查
  if (!completed && progress === 0) {
    // 一些任务可能通过其他方式被标记为完成
    if (task.status === TASK_STATUS.COMPLETED) {
      completed = true
      progress = 100
    }
  }

  return { completed, progress }
}

module.exports = {
  TASKS,
  TASK_TYPES,
  TASK_STATUS,
  getAllTasks,
  getTasksByType,
  getTasksByStatus,
  getAvailableTasks,
  checkTaskCompletion
}