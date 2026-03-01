/**
 * 战力计算配置系统
 * 支持 mock 和 API 两种数据源
 */

// ==================== 战力权重配置 ====================
const POWER_WEIGHTS = {
  // 基础属性权重
  attack: 2.0,      // 攻击力
  defense: 1.5,     // 防御力
  magicAttack: 1.8, // 魔法攻击
  magicDefense: 1.2,// 魔法防御
  speed: 3.0,       // 速度
  hp: 0.1,          // 生命值 (除以10)
  mp: 0.1,          // 魔法值 (除以10)

  // 百分比属性权重
  crit: 5.0,        // 暴击率
  dodge: 5.0,       // 闪避率
  block: 4.0,       // 格挡率
  hit: 3.0,         // 命中率
  lifesteal: 4.0,   // 吸血

  // 特殊属性
  allStats: 0.5,    // 全属性加成 (每项属性)
}

// ==================== 属性映射配置 ====================
const ATTRIBUTE_MAPPING = {
  // 属性名到权重的映射
  attack: { weight: 'attack', baseKey: 'attack', type: 'number' },
  defense: { weight: 'defense', baseKey: 'defense', type: 'number' },
  magicAttack: { weight: 'magicAttack', baseKey: 'magicAttack', type: 'number' },
  magicDefense: { weight: 'magicDefense', baseKey: 'magicDefense', type: 'number' },
  speed: { weight: 'speed', baseKey: 'speed', type: 'number' },
  hp: { weight: 'hp', baseKey: 'maxHp', type: 'number', source: 'derived' },
  mp: { weight: 'mp', baseKey: 'maxMp', type: 'number', source: 'derived' },
  crit: { weight: 'crit', baseKey: 'crit', type: 'percent' },
  dodge: { weight: 'dodge', baseKey: 'dodge', type: 'percent' },
  block: { weight: 'block', baseKey: 'block', type: 'percent' },
  hit: { weight: 'hit', baseKey: 'hit', type: 'percent' },
}

// ==================== 称号段位配置 ====================
const RANK_TIERS = [
  { min: 100000, title: '传说王者', color: '#ff0000', bgColor: 'rgba(255, 0, 0, 0.2)' },
  { min: 50000, title: '荣耀战神', color: '#ff8000', bgColor: 'rgba(255, 128, 0, 0.2)' },
  { min: 20000, title: '史诗英雄', color: '#a335ee', bgColor: 'rgba(163, 53, 238, 0.2)' },
  { min: 10000, title: '精锐勇士', color: '#0070dd', bgColor: 'rgba(0, 112, 221, 0.2)' },
  { min: 5000, title: '优秀战士', color: '#1eff00', bgColor: 'rgba(30, 255, 0, 0.2)' },
  { min: 2000, title: '熟练冒险者', color: '#1eff00', bgColor: 'rgba(30, 255, 0, 0.15)' },
  { min: 500, title: '初级冒险者', color: '#a0a0a0', bgColor: 'rgba(160, 160, 160, 0.2)' },
  { min: 0, title: '见习新手', color: '#a0a0a0', bgColor: 'rgba(160, 160, 160, 0.15)' }
]

// ==================== API 配置 ====================
const POWER_API_CONFIG = {
  // 战力计算接口
  calculate: {
    url: '/api/v1/power/calculate',
    method: 'POST',
    mockDelay: 100
  },
  // 战力配置获取接口
  getConfig: {
    url: '/api/v1/power/config',
    method: 'GET',
    mockDelay: 50
  },
  // 批量计算接口（用于排行榜等）
  batchCalculate: {
    url: '/api/v1/power/batch',
    method: 'POST',
    mockDelay: 200
  }
}

// ==================== Mock 数据 ====================
const POWER_MOCK_DATA = {
  // 模拟不同等级的基础战力范围
  levelRanges: [
    { level: 1, min: 50, max: 150 },
    { level: 10, min: 200, max: 500 },
    { level: 20, min: 800, max: 2000 },
    { level: 30, min: 2500, max: 5000 },
    { level: 40, min: 6000, max: 12000 },
    { level: 50, min: 15000, max: 30000 },
    { level: 60, min: 35000, max: 70000 },
    { level: 70, min: 80000, max: 150000 },
    { level: 80, min: 200000, max: 500000 },
  ],

  // 模拟战力排行榜数据
  leaderboard: [
    { rank: 1, name: '传说勇者', power: 999999, level: 99, title: '传说王者' },
    { rank: 2, name: '暗影刺客', power: 850000, level: 95, title: '荣耀战神' },
    { rank: 3, name: '圣光骑士', power: 720000, level: 92, title: '荣耀战神' },
    { rank: 4, name: '元素法师', power: 650000, level: 90, title: '史诗英雄' },
    { rank: 5, name: '狂暴战士', power: 580000, level: 88, title: '史诗英雄' },
  ]
}

module.exports = {
  // 配置导出
  POWER_WEIGHTS,
  ATTRIBUTE_MAPPING,
  RANK_TIERS,
  POWER_API_CONFIG,
  POWER_MOCK_DATA
}
