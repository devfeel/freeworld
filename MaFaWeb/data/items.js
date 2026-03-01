/**
 * 物品/装备数据配置
 * 20类装备，每类20个级别，间隔5级（1,5,10,15...96级）
 */

const { POTION_ICON_MAP, SLOT_ICONS, DEFAULT_ITEM_ICON, DEFAULT_POTION_ICON } = require('../config/itemIconMap')

// 基础属性计算函数 - 改进版，低等级也有合理属性
function calculateBaseStats(level) {
  // 确保最低等级有基础属性
  const effectiveLevel = Math.max(1, level)
  return {
    attack: Math.floor(effectiveLevel * 1.5 + 5),      // 基础攻击从8开始(1级)
    defense: Math.floor(effectiveLevel * 1.0 + 3),     // 基础防御从5开始(1级)
    hpBonus: Math.floor(effectiveLevel * 12 + 20),     // 基础生命从32开始(1级)
    mpBonus: Math.floor(effectiveLevel * 10 + 15),     // 基础魔法从25开始(1级)
    crit: Math.floor(effectiveLevel * 0.15 + 1),      // 基础暴击从2开始(1级)
    dodge: Math.floor(effectiveLevel * 0.1 + 1)       // 基础闪避从2开始(1级)
  }
}

// 稀有度配置 - 修正映射，从普通开始
const RARITY_CONFIG = {
  1: { name: '普通', color: '#ffffff', prefix: '', suffix: '', bonus: 1.0, displayName: '普通' },
  2: { name: '优秀', color: '#1eff00', prefix: '优秀的', suffix: '', bonus: 1.2, displayName: '优秀' },
  3: { name: '精良', color: '#0070dd', prefix: '精良的', suffix: '', bonus: 1.5, displayName: '精良' },
  4: { name: '稀有', color: '#a335ee', prefix: '稀有的', suffix: '', bonus: 2.0, displayName: '稀有' },
  5: { name: '史诗', color: '#ff8000', prefix: '史诗', suffix: '', bonus: 2.5, displayName: '史诗' },
  6: { name: '传说', color: '#e6cc80', prefix: '传说', suffix: '', bonus: 3.5, displayName: '传说' },
  7: { name: '神话', color: '#ff0000', prefix: '神话', suffix: '', bonus: 5.0, displayName: '神话' },
  8: { name: '神圣', color: '#ffff00', prefix: '神圣', suffix: '', bonus: 8.0, displayName: '神圣' }
}

// 套装名称配置 - 同一等级统一命名
const SET_EQUIPMENT_NAMES = {
  weapon_dao: ['新手刀', '战士刀', '勇士刀', '冠军刀', '英雄刀', '王者刀', '传奇刀', '神话刀', '神圣刀', '永恒刀'],
  weapon_jian: ['新剑', '战士剑', '勇士剑', '冠军剑', '英雄剑', '王者剑', '传奇剑', '神话剑', '神圣剑', '永恒剑'],
  weapon_axe: ['新手斧', '战士斧', '勇士斧', '冠军斧', '英雄斧', '王者斧', '传奇斧', '神话斧', '神圣斧', '永恒斧'],
  weapon_staff: ['新手杖', '战士杖', '勇士杖', '冠军杖', '英雄杖', '王者杖', '传奇杖', '神话杖', '神圣杖', '永恒杖'],
  weapon_bow: ['新手弓', '战士弓', '勇士弓', '冠军弓', '英雄弓', '王者弓', '传奇弓', '神话弓', '神圣弓', '永恒弓'],
  helmet: ['新手帽', '战士盔', '勇士盔', '冠军盔', '英雄盔', '王者盔', '传奇盔', '神话盔', '神圣盔', '永恒盔'],
  armor_chest: ['新手甲', '战士甲', '勇士甲', '冠军甲', '英雄甲', '王者甲', '传奇甲', '神话甲', '神圣甲', '永恒甲'],
  armor_legs: ['新手腿', '战士腿', '勇士腿', '冠军腿', '英雄腿', '王者腿', '传奇腿', '神话腿', '神圣腿', '永恒腿'],
  armor_boots: ['新手靴', '战士靴', '勇士靴', '冠军靴', '英雄靴', '王者靴', '传奇靴', '神话靴', '神圣靴', '永恒靴'],
  armor_gloves: ['新手手套', '战士手套', '勇士手套', '冠军手套', '英雄手套', '王者手套', '传奇手套', '神话手套', '神圣手套', '永恒手套'],
  shield: ['新手盾', '战士盾', '勇士盾', '冠军盾', '英雄盾', '王者盾', '传奇盾', '神话盾', '神圣盾', '永恒盾'],
  necklace: ['新手链', '战士链', '勇士链', '冠军链', '英雄链', '王者链', '传奇链', '神话链', '神圣链', '永恒链'],
  ring: ['新戒指', '战士戒', '勇士戒', '冠军戒', '英雄戒', '王者戒', '传奇戒', '神话戒', '神圣戒', '永恒戒'],
  belt: ['新手带', '战士带', '勇士带', '冠军带', '英雄带', '王者带', '传奇带', '神话带', '神圣带', '永恒带'],
  bracer: ['新手腕', '战士腕', '勇士腕', '冠军腕', '英雄腕', '王者腕', '传奇腕', '神话腕', '神圣腕', '永恒腕'],
  amulet: ['新法符', '战士符', '勇士符', '冠军符', '英雄符', '王者符', '传奇符', '神话符', '神圣符', '永恒符'],
  gem: ['凡品宝石', '精品宝石', '极品宝石', '珍品宝石', '名品宝石', '圣品宝石', '神器宝石', '神话宝石', '神圣宝石', '永恒宝石'],
  mount: ['骑幼马', '骑战马', '骑骏马', '骑良驹', '骑宝驹', '骑赤兔', '骑乌云', '骑狮子', '骑独角', '骑龙鹰']
}

// ========== 可扩展的属性系统配置 ==========
// 定义所有支持的属性类型，方便未来扩展新属性
const ATTRIBUTE_CONFIG = {
  // 核心战斗属性
  hp: {
    name: '生命值',
    key: 'hpBonus',
    baseKey: 'maxHp',
    display: '生命',
    icon: '♥',
    color: '#ff4444'
  },
  mp: {
    name: '魔法值',
    key: 'mpBonus',
    baseKey: 'maxMp',
    display: '魔法',
    icon: '♦',
    color: '#4444ff'
  },
  attack: {
    name: '物理攻击',
    key: 'attack',
    baseKey: 'attack',
    display: '攻击',
    icon: '⚔',
    color: '#ffaa00'
  },
  magicAttack: {
    name: '魔法攻击',
    key: 'magicAttack',
    baseKey: 'magicAttack',
    display: '魔攻',
    icon: '✦',
    color: '#aa44ff'
  },
  magicDefense: {
    name: '魔法防御',
    key: 'magicDefense',
    baseKey: 'magicDefense',
    display: '魔防',
    icon: '✧',
    color: '#44aaff'
  },
  defense: {
    name: '防御力',
    key: 'defense',
    baseKey: 'defense',
    display: '防御',
    icon: '🛡',
    color: '#44aaff'
  },
  speed: {
    name: '速度',
    key: 'speed',
    baseKey: 'speed',
    display: '速度',
    icon: '⚡',
    color: '#ffff44'
  },
  crit: {
    name: '暴击率',
    key: 'crit',
    baseKey: 'crit',
    display: '暴击',
    icon: '★',
    color: '#ff44ff',
    isPercent: true
  },
  dodge: {
    name: '闪避率',
    key: 'dodge',
    baseKey: 'dodge',
    display: '闪避',
    icon: '🌀',
    color: '#44ffaa',
    isPercent: true
  },
  block: {
    name: '格挡值',
    key: 'block',
    baseKey: 'block',
    display: '格挡',
    icon: '▣',
    color: '#aaaaaa'
  },

  // ========== 未来可扩展的属性 ==========
  // 要添加新属性，只需在此配置中添加即可
  // 例如：吸血、精准、生命恢复等

  // lifeSteal: {
  //   name: '吸血',
  //   key: 'lifeSteal',
  //   baseKey: 'lifeSteal',
  //   display: '吸血',
  //   icon: '🩸',
  //   color: '#aa0000',
  //   isPercent: true
  // },
  // accuracy: {
  //   name: '精准',
  //   key: 'accuracy',
  //   baseKey: 'accuracy',
  //   display: '精准',
  //   icon: '◎',
  //   color: '#00aa00',
  //   isPercent: true
  // },
  // hpRegen: {
  //   name: '生命恢复',
  //   key: 'hpRegen',
  //   baseKey: 'hpRegen',
  //   display: '回血',
  //   icon: '💚',
  //   color: '#00ff00'
  // },
  // mpRegen: {
  //   name: '魔法恢复',
  //   key: 'mpRegen',
  //   baseKey: 'mpRegen',
  //   display: '回蓝',
  //   icon: '💙',
  //   color: '#0000ff'
  // }
}

// 获取所有属性配置
function getAttributeConfig() {
  return ATTRIBUTE_CONFIG
}

// 获取单个属性配置
function getAttribute(attrKey) {
  return ATTRIBUTE_CONFIG[attrKey]
}

// 获取所有支持的属性键名列表
function getSupportedAttributeKeys() {
  return Object.keys(ATTRIBUTE_CONFIG)
}

// 宝石全属性分配权重配置
// 定义 allStats 值如何分配到各个属性
const ALL_STATS_DISTRIBUTION = {
  attack: 0.25,      // 25% 分配到攻击
  magicAttack: 0.15, // 15% 分配到魔法攻击
  magicDefense: 0.10, // 10% 分配到魔法防御
  defense: 0.20,     // 20% 分配到防御
  speed: 0.10,       // 10% 分配到速度
  crit: 0.15,        // 15% 分配到暴击（转换为百分比）
  dodge: 0.15        // 15% 分配到闪避（转换为百分比）
}

// 装备类别
const EQUIPMENT_TYPES = [
  'weapon_dao',      // 刀类
  'weapon_jian',     // 剑类
  'weapon_axe',      // 斧类
  'weapon_staff',    // 法杖类
  'weapon_bow',      // 弓类
  'helmet',          // 头盔
  'armor_chest',     // 胸甲
  'armor_legs',      // 护腿
  'armor_boots',     // 鞋子
  'armor_gloves',    // 护手
  'shield',          // 盾牌
  'necklace',        // 项链
  'ring',            // 戒指
  'belt',            // 腰带
  'bracer',          // 护腕
  'amulet',          // 护身符
  'gem',             // 宝石
  'mount'            // 坐骑
]

// 非套装装备名称配置 - 传统命名方式
const EQUIPMENT_NAMES = {
  weapon_dao: ['木刀', '铁刀', '钢刀', '精钢刀', '银刀', '秘银刀', '精金刀', '龙鳞刀', '泰坦刀', '弑神刀'],
  weapon_jian: ['木剑', '铁剑', '钢剑', '精钢剑', '银剑', '秘银剑', '精金剑', '龙鳞剑', '泰坦剑', '弑神剑'],
  weapon_axe: ['战斧', '双手斧', '巨斧', '狂暴斧', '破军斧', '碎骨斧', '雷斧', '风暴斧', '毁灭斧', '世界斧'],
  weapon_staff: ['木杖', '法杖', '魔杖', '奥术杖', '秘法杖', '元素杖', '星光杖', '虚空杖', '时空杖', '命运法杖'],
  weapon_bow: ['短弓', '长弓', '猎弓', '精良弓', '鹰眼弓', '追风弓', '裂空弓', '星辰弓', '陨星弓', '神射弓'],
  helmet: ['皮帽', '铁盔', '钢盔', '秘银盔', '精金盔', '龙鳞盔', '泰坦盔', '神盔', '圣光头盔', '不朽头盔'],
  armor_chest: ['皮甲', '锁子甲', '板甲', '精钢甲', '秘银甲', '精金甲', '龙鳞甲', '泰坦甲', '神甲', '不朽甲'],
  armor_legs: ['皮裤', '铁腿甲', '钢腿甲', '秘银护腿', '精金护腿', '龙鳞护腿', '泰坦护腿', '神护腿', '圣光护腿', '不朽护腿'],
  armor_boots: ['皮靴', '铁靴', '钢靴', '秘银靴', '精金靴', '龙鳞靴', '泰坦靴', '神靴', '圣光靴', '不朽靴'],
  armor_gloves: ['皮手套', '铁手套', '钢手套', '秘银手套', '精金手套', '龙鳞手套', '泰坦手套', '神手套', '圣光手套', '不朽手套'],
  shield: ['木盾', '铁盾', '钢盾', '秘银盾', '精金盾', '龙鳞盾', '泰坦盾', '神盾', '圣光盾', '不朽盾'],
  necklace: ['项链', '银项链', '金项链', '秘银项链', '精金项链', '龙骨项链', '泰坦项链', '神项链', '圣光项链', '不朽项链'],
  ring: ['戒指', '银戒', '金戒', '秘银戒', '精金戒', '龙骨戒', '泰坦戒', '神戒', '圣光戒', '不朽戒'],
  belt: ['皮带', '铁腰带', '钢腰带', '秘银腰带', '精金腰带', '龙鳞腰带', '泰坦腰带', '神腰带', '圣光腰带', '不朽腰带'],
  bracer: ['皮护腕', '铁护腕', '钢护腕', '秘银护腕', '精金护腕', '龙鳞护腕', '泰坦护腕', '神护腕', '圣光护腕', '不朽护腕'],
  amulet: ['护身符', '银护身符', '金护身符', '秘银护身符', '精金护身符', '龙骨护身符', '泰坦护身符', '神护身符', '圣光护身符', '不朽护身符'],
  gem: ['劣质宝石', '普通宝石', '精致宝石', '完美宝石', '无瑕宝石', '极品宝石', '传说宝石', '神话宝石', '神圣宝石', '永恒宝石'],
  mount: ['代步马', '战马', '骏马', '良驹', '宝驹', '赤兔', '乌云', '照夜玉狮子', '独角兽', '龙鹰']
}

// 装备等级段配置 - 每10级一个品质
const EQUIPMENT_TIER_CONFIG = [
  { minLevel: 1, maxLevel: 10, quality: 1, rarity: 'common' },    // 1-10级: 普通
  { minLevel: 11, maxLevel: 20, quality: 2, rarity: 'uncommon' }, // 11-20级: 优秀
  { minLevel: 21, maxLevel: 30, quality: 3, rarity: 'rare' },    // 21-30级: 精良
  { minLevel: 31, maxLevel: 40, quality: 4, rarity: 'rare' },   // 31-40级: 稀有
  { minLevel: 41, maxLevel: 50, quality: 5, rarity: 'epic' },   // 41-50级: 史诗
  { minLevel: 51, maxLevel: 60, quality: 6, rarity: 'legendary' }, // 51-60级: 传说
  { minLevel: 61, maxLevel: 70, quality: 7, rarity: 'mythic' },  // 61-70级: 神话
  { minLevel: 71, maxLevel: 80, quality: 8, rarity: 'divine' }, // 71-80级: 神圣
  { minLevel: 81, maxLevel: 90, quality: 8, rarity: 'divine' },  // 81-90级: 神圣
  { minLevel: 91, maxLevel: 100, quality: 8, rarity: 'divine' }  // 91-100级: 神圣
]

// 根据等级获取装备品质配置
function getTierConfig(level) {
  for (let i = EQUIPMENT_TIER_CONFIG.length - 1; i >= 0; i--) {
    if (level >= EQUIPMENT_TIER_CONFIG[i].minLevel) {
      return EQUIPMENT_TIER_CONFIG[i]
    }
  }
  return EQUIPMENT_TIER_CONFIG[0]
}

const ITEMS = {}

// ========== 生成药水类物品 ==========
const POTIONS = [
  { id: 'potion_small_hp', name: '小型生命药水', subType: 'hp', value: 50, price: 10 },
  { id: 'potion_small_mp', name: '小型魔法药水', subType: 'mp', value: 30, price: 10 },
  { id: 'potion_medium_hp', name: '中型生命药水', subType: 'hp', value: 150, price: 30 },
  { id: 'potion_medium_mp', name: '中型魔法药水', subType: 'mp', value: 90, price: 30 },
  { id: 'potion_large_hp', name: '大型生命药水', subType: 'hp', value: 400, price: 80 },
  { id: 'potion_large_mp', name: '大型魔法药水', subType: 'mp', value: 240, price: 80 },
  { id: 'potion_giant_hp', name: '巨型生命药水', subType: 'hp', value: 1000, price: 200 },
  { id: 'potion_giant_mp', name: '巨型魔法药水', subType: 'mp', value: 600, price: 200 },
  { id: 'potion_dual_small', name: '小型双效药水', subType: 'dual', value: 50, hpRestore: 50, mpRestore: 30, price: 20 },
  { id: 'potion_dual_medium', name: '中型双效药水', subType: 'dual', value: 150, hpRestore: 150, mpRestore: 90, price: 50 },
  { id: 'potion_dual_large', name: '大型双效药水', subType: 'dual', value: 400, hpRestore: 400, mpRestore: 240, price: 150 },
  { id: 'potion_elixir', name: '恢复药剂', subType: 'dual', value: 2000, hpRestore: 2000, mpRestore: 1200, price: 500 }
]

POTIONS.forEach(p => {
  // Map potion subType to icon path
  const potionIconMap = {
    'hp': '/assets/icons/items/potion_hp.png',
    'mp': '/assets/icons/items/potion_mp.png',
    'dual': '/assets/icons/items/potion_dual.png'
  }

  ITEMS[p.id] = {
    ...p,
    id: p.id,
    type: 'potion',
    rarity: 'common',
    iconKey: p.subType,
    icon: POTION_ICON_MAP[p.subType] || DEFAULT_POTION_ICON,
    description: p.subType === 'dual'
      ? `恢复 ${p.hpRestore} 点生命和 ${p.mpRestore} 点魔法`
      : (p.subType === 'hp' ? `恢复 ${p.value} 点生命` : `恢复 ${p.value} 点魔法`)
  }
})

// ========== 特殊道具（强化相关）==========
const SPECIAL_ITEMS = [
  {
    id: 'scroll_transfer_enhance',
    name: '强化转移卷轴',
    type: 'consumable',
    subType: 'scroll',
    rarity: 'rare',
    price: 50,
    currency: 'yuanbao',
    icon: '/assets/icons/items/scroll_transfer.png',
    description: '可将一件装备的强化等级转移至同类型新装备，转移后原装备强化清零'
  },
  {
    id: 'scroll_protect',
    name: '强化保护卷轴',
    type: 'consumable',
    subType: 'scroll',
    rarity: 'epic',
    price: 100,
    currency: 'yuanbao',
    icon: '/assets/icons/items/scroll_protect.png',
    description: '强化失败时保护装备不降级，一次性消耗品'
  },
  {
    id: 'enhance_stone_lucky',
    name: '幸运强化石',
    type: 'consumable',
    subType: 'material',
    rarity: 'uncommon',
    price: 500,
    currency: 'gold',
    icon: '/assets/icons/items/enhance_lucky.png',
    description: '强化时使用，可提高10%成功率'
  }
]

SPECIAL_ITEMS.forEach(item => {
  ITEMS[item.id] = {
    ...item,
    usable: false,
    equipable: false
  }
})

// 装备类型到槽位的映射
const EQUIPMENT_SLOT_MAP = {
  'weapon_dao': 'weapon',
  'weapon_jian': 'weapon',
  'weapon_axe': 'weapon',
  'weapon_staff': 'weapon',
  'weapon_bow': 'weapon',
  'helmet': 'helmet',
  'armor_chest': 'armor',
  'armor_legs': 'armor',
  'armor_boots': 'armor',
  'armor_gloves': 'armor',
  'shield': 'shield',
  'necklace': 'necklace',
  'ring': 'ring',
  'belt': 'belt',
  'bracer': 'bracer',
  'amulet': 'amulet',
  'gem': 'gem',
  'mount': 'mount'
}

// ========== 生成20类装备，每类20个级别 ==========
// 每类装备生成两种：套装(set)和非套装(non-set)
EQUIPMENT_TYPES.forEach((equipType, typeIndex) => {
  // 商城只出售1-20级装备，所以每个等级生成一个
  for (let itemLevel = 1; itemLevel <= 20; itemLevel++) {
    const stats = calculateBaseStats(itemLevel)

    // 使用新的等级段配置
    const tierConfig = getTierConfig(itemLevel)
    const quality = tierConfig.quality
    const rarity = tierConfig.rarity
    const rarityConfig = RARITY_CONFIG[quality]

    const baseNames = EQUIPMENT_NAMES[equipType]
    const setNames = SET_EQUIPMENT_NAMES[equipType]
    // 使用模运算循环使用名称数组（20个等级，10个名称）
    const nameIndex = (itemLevel - 1) % 10

    // 获取装备槽位名和子类型
    const slotName = EQUIPMENT_SLOT_MAP[equipType] || equipType
    // 武器保留具体类型作为 subType，其他装备使用 slotName
    const subTypeName = equipType.includes('weapon_')
      ? equipType.replace('weapon_', '')  // 'dao', 'jian', 'axe', 'staff', 'bow'
      : slotName

    // ========== 生成非套装装备 ==========
    const nonSetName = baseNames[nameIndex]
    let item = {
      id: `${equipType}_lv${itemLevel}`,
      name: `${rarityConfig.prefix}${nonSetName} Lv.${itemLevel}`,
      type: equipType.includes('weapon') ? 'weapon' : 'equipment',
      subType: subTypeName,
      slot: slotName,
      rarity: rarity,
      level: itemLevel,
      quality: quality,
      isSet: false,
      description: `${rarityConfig.displayName}${equipType.includes('weapon') ? '武器' : '装备'}，等级需求：${itemLevel}`,
      price: Math.floor(itemLevel * 10 * rarityConfig.bonus)
    }

    // 根据装备类型添加属性 - 使用 rarityConfig
    if (equipType === 'weapon_dao') {
      // 刀：高攻击，高暴击
      item.attack = Math.floor(stats.attack * 1.4 * rarityConfig.bonus)
      item.crit = Math.floor(stats.crit * 0.5)
    } else if (equipType === 'weapon_jian') {
      // 剑：均衡攻击，略高暴击
      item.attack = Math.floor(stats.attack * 1.2 * rarityConfig.bonus)
      item.crit = Math.floor(stats.crit * 0.8)
    } else if (equipType === 'weapon_axe') {
      // 斧：极高攻击，速度惩罚
      item.attack = Math.floor(stats.attack * 1.6 * rarityConfig.bonus)
      item.speed = -3
    } else if (equipType === 'weapon_bow') {
      // 弓：高暴击
      item.attack = Math.floor(stats.attack * 1.0 * rarityConfig.bonus)
      item.crit = Math.floor(stats.crit * 1.5)
    } else if (equipType === 'weapon_staff') {
      // 法杖：魔法攻击为主
      item.attack = Math.floor(stats.attack * 0.5 * rarityConfig.bonus)
      item.magicAttack = Math.floor(stats.attack * 1.5 * rarityConfig.bonus)
      item.mpBonus = Math.floor(stats.mpBonus * 0.5)
    } else if (equipType === 'helmet') {
      item.defense = Math.floor(stats.defense * 0.6 * rarityConfig.bonus)
      item.hpBonus = Math.floor(stats.hpBonus * 0.3)
    } else if (equipType === 'armor_chest') {
      item.defense = Math.floor(stats.defense * 1.5 * rarityConfig.bonus)
      item.hpBonus = Math.floor(stats.hpBonus * 0.6)
    } else if (equipType === 'armor_legs') {
      item.defense = Math.floor(stats.defense * 0.4 * rarityConfig.bonus)
      item.hpBonus = Math.floor(stats.hpBonus * 0.3)
    } else if (equipType === 'armor_boots') {
      item.defense = Math.floor(stats.defense * 0.3 * rarityConfig.bonus)
      item.speed = Math.floor(itemLevel * 0.2)
    } else if (equipType === 'armor_gloves') {
      item.attack = Math.floor(stats.attack * 0.2 * rarityConfig.bonus)
      item.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus)
    } else if (equipType === 'shield') {
      item.defense = Math.floor(stats.defense * 1.0 * rarityConfig.bonus)
      item.block = Math.floor(itemLevel * 1.0)
    } else if (equipType === 'necklace') {
      item.attack = Math.floor(stats.attack * 0.3 * rarityConfig.bonus)
      item.defense = Math.floor(stats.defense * 0.3 * rarityConfig.bonus)
      item.mpBonus = Math.floor(stats.mpBonus * 0.3)
    } else if (equipType === 'ring_left' || equipType === 'ring_right') {
      item.attack = Math.floor(stats.attack * 0.2 * rarityConfig.bonus)
      item.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus)
    } else if (equipType === 'belt') {
      item.hpBonus = Math.floor(stats.hpBonus * 0.4)
      item.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus)
    } else if (equipType === 'cloak') {
      item.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus)
      item.dodge = Math.floor(stats.dodge * 2.0)
    } else if (equipType === 'bracer') {
      item.attack = Math.floor(stats.attack * 0.3 * rarityConfig.bonus)
      item.hpBonus = Math.floor(stats.hpBonus * 0.2)
    } else if (equipType === 'earring') {
      item.mpBonus = Math.floor(stats.mpBonus * 0.4)
      item.magicAttack = Math.floor(stats.magicAttack * 0.3 * rarityConfig.bonus)
    } else if (equipType === 'amulet') {
      item.attack = Math.floor(stats.attack * 0.2 * rarityConfig.bonus)
      item.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus)
      item.crit = Math.floor(stats.crit * 0.5)
    } else if (equipType === 'gem') {
      item.allStats = Math.floor(itemLevel * 0.5 * rarityConfig.bonus)
    } else if (equipType === 'mount') {
      // 坐骑主要提供速度和生命加成
      item.speed = Math.floor(itemLevel * 0.5)
      item.hpBonus = Math.floor(itemLevel * 15)
      item.dodge = Math.floor(itemLevel * 0.1)
    }

    // 特殊效果（高等级装备）
    if (quality >= 6) {
      item.special = generateSpecialEffect(equipType, quality)
    }

    // 添加图标 - 使用27个基础类型图标 (方案一)
    // 装备的品质/等级通过CSS滤镜在UI层显示颜色区分
    const slotIcons = {
      // 武器类 - 使用剑作为默认
      'weapon': '/assets/icons/items/weapon.png',
      // 防具类
      'helmet': '/assets/icons/items/helmet.png',
      'armor': '/assets/icons/items/armor_chest.png',
      'shield': '/assets/icons/items/shield.png',
      'belt': '/assets/icons/items/belt.png',
      'cloak': '/assets/icons/items/cloak.png',
      // 饰品类
      'necklace': '/assets/icons/items/necklace.png',
      'ring': '/assets/icons/items/ring.png',
      'bracer': '/assets/icons/items/bracer.png',
      'amulet': '/assets/icons/items/amulet.png',
      'gem': '/assets/icons/items/gem.png',
      'earring': '/assets/icons/items/earring.png',
      'mount': '/assets/icons/items/mount.png'
    }
    item.icon = slotIcons[slotName] || '/assets/icons/items/item.png'
    item.iconKey = slotName

    ITEMS[item.id] = item

    // ========== 生成套装装备 ==========
    // 套装装备拥有更高的属性加成
    const setName = setNames[nameIndex]
    let setItem = {
      id: `${equipType}_set_lv${itemLevel}`,
      name: `${rarityConfig.prefix}${setName} Lv.${itemLevel}`,
      type: equipType.includes('weapon') ? 'weapon' : 'equipment',
      subType: subTypeName,
      slot: slotName,
      rarity: rarity,
      level: itemLevel,
      quality: quality,
      isSet: true,
      setName: `${setName}套装`,
      description: `${rarityConfig.displayName}套装${equipType.includes('weapon') ? '武器' : '装备'}，等级需求：${itemLevel}`,
      price: Math.floor(itemLevel * 15 * rarityConfig.bonus) // 套装价格更高
    }

    // 套装属性加成 - 约1.3倍基础属性
    const setBonus = 1.3
    if (equipType === 'weapon_dao') {
      // 刀：高攻击，高暴击
      setItem.attack = Math.floor(stats.attack * 1.4 * rarityConfig.bonus * setBonus)
      setItem.crit = Math.floor(stats.crit * 0.5)
    } else if (equipType === 'weapon_jian') {
      // 剑：均衡攻击，略高暴击
      setItem.attack = Math.floor(stats.attack * 1.2 * rarityConfig.bonus * setBonus)
      setItem.crit = Math.floor(stats.crit * 0.8)
    } else if (equipType === 'weapon_axe') {
      // 斧：极高攻击，速度惩罚
      setItem.attack = Math.floor(stats.attack * 1.6 * rarityConfig.bonus * setBonus)
      setItem.speed = -3
    } else if (equipType === 'weapon_bow') {
      // 弓：高暴击
      setItem.attack = Math.floor(stats.attack * 1.0 * rarityConfig.bonus * setBonus)
      setItem.crit = Math.floor(stats.crit * 1.5)
    } else if (equipType === 'weapon_staff') {
      // 法杖：魔法攻击为主
      setItem.attack = Math.floor(stats.attack * 0.5 * rarityConfig.bonus * setBonus)
      setItem.magicAttack = Math.floor(stats.attack * 1.5 * rarityConfig.bonus * setBonus)
      setItem.mpBonus = Math.floor(stats.mpBonus * 0.5)
    } else if (equipType === 'helmet') {
      setItem.defense = Math.floor(stats.defense * 0.6 * rarityConfig.bonus * setBonus)
      setItem.hpBonus = Math.floor(stats.hpBonus * 0.3)
    } else if (equipType === 'armor_chest') {
      setItem.defense = Math.floor(stats.defense * 1.5 * rarityConfig.bonus * setBonus)
      setItem.hpBonus = Math.floor(stats.hpBonus * 0.6)
    } else if (equipType === 'armor_legs') {
      setItem.defense = Math.floor(stats.defense * 0.4 * rarityConfig.bonus * setBonus)
      setItem.hpBonus = Math.floor(stats.hpBonus * 0.3)
    } else if (equipType === 'armor_boots') {
      setItem.defense = Math.floor(stats.defense * 0.3 * rarityConfig.bonus * setBonus)
      setItem.speed = Math.floor(itemLevel * 0.2)
    } else if (equipType === 'armor_gloves') {
      setItem.attack = Math.floor(stats.attack * 0.2 * rarityConfig.bonus * setBonus)
      setItem.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus * setBonus)
    } else if (equipType === 'shield') {
      setItem.defense = Math.floor(stats.defense * 1.0 * rarityConfig.bonus * setBonus)
      setItem.block = Math.floor(itemLevel * 1.0)
    } else if (equipType === 'necklace') {
      setItem.attack = Math.floor(stats.attack * 0.3 * rarityConfig.bonus * setBonus)
      setItem.defense = Math.floor(stats.defense * 0.3 * rarityConfig.bonus * setBonus)
      setItem.mpBonus = Math.floor(stats.mpBonus * 0.3)
    } else if (equipType === 'ring_left' || equipType === 'ring_right') {
      setItem.attack = Math.floor(stats.attack * 0.2 * rarityConfig.bonus * setBonus)
      setItem.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus * setBonus)
    } else if (equipType === 'belt') {
      setItem.hpBonus = Math.floor(stats.hpBonus * 0.4 * setBonus)
      setItem.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus * setBonus)
    } else if (equipType === 'cloak') {
      setItem.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus * setBonus)
      setItem.dodge = Math.floor(stats.dodge * 2.0)
    } else if (equipType === 'bracer') {
      setItem.attack = Math.floor(stats.attack * 0.3 * rarityConfig.bonus * setBonus)
      setItem.hpBonus = Math.floor(stats.hpBonus * 0.2)
    } else if (equipType === 'earring') {
      setItem.mpBonus = Math.floor(stats.mpBonus * 0.4 * setBonus)
      setItem.magicAttack = Math.floor(stats.magicAttack * 0.3 * rarityConfig.bonus * setBonus)
    } else if (equipType === 'amulet') {
      setItem.attack = Math.floor(stats.attack * 0.2 * rarityConfig.bonus * setBonus)
      setItem.defense = Math.floor(stats.defense * 0.2 * rarityConfig.bonus * setBonus)
      setItem.crit = Math.floor(stats.crit * 0.5)
    } else if (equipType === 'gem') {
      setItem.allStats = Math.floor(itemLevel * 0.5 * rarityConfig.bonus * setBonus)
    } else if (equipType === 'mount') {
      // 坐骑主要提供速度和生命加成
      setItem.speed = Math.floor(itemLevel * 0.5 * setBonus)
      setItem.hpBonus = Math.floor(itemLevel * 15 * setBonus)
      setItem.dodge = Math.floor(itemLevel * 0.1)
    }

    // 套装特殊效果（更高等级开始有）
    if (quality >= 4) {
      setItem.special = generateSpecialEffect(equipType, quality + 1)
    }

    // 套装图标添加标识
    setItem.icon = SLOT_ICONS[slotName] || DEFAULT_ITEM_ICON
    setItem.iconKey = slotName

    ITEMS[setItem.id] = setItem
  }
})

// 生成特殊效果
function generateSpecialEffect(equipType, quality) {
  const effects = {
    weapon: [
      { type: 'life_steal', value: 0.05 * quality, name: '吸血' },
      { type: 'fire_damage', value: quality * 10, name: '火焰伤害' },
      { type: 'ice_damage', value: quality * 10, name: '冰冻伤害' },
      { type: 'lightning_damage', value: quality * 10, name: '雷击伤害' },
      { type: 'holy_damage', value: quality * 15, name: '神圣伤害' }
    ],
    armor: [
      { type: 'damage_reduction', value: 0.02 * quality, name: '伤害减免' },
      { type: 'hp_regen', value: quality * 5, name: '生命恢复' },
      { type: 'mp_regen', value: quality * 3, name: '魔法恢复' },
      { type: 'reflect_damage', value: quality * 10, name: '伤害反射' }
    ],
    accessory: [
      { type: 'exp_bonus', value: 0.05 * quality, name: '经验加成' },
      { type: 'gold_bonus', value: 0.05 * quality, name: '金币加成' },
      { type: 'drop_bonus', value: 0.05 * quality, name: '掉落加成' },
      { type: 'all_stats', value: quality * 5, name: '全属性提升' }
    ]
  }

  let effectList = []
  if (equipType.includes('weapon')) {
    effectList = effects.weapon
  } else if (['necklace', 'ring', 'belt', 'cloak', 'bracer', 'earring', 'amulet', 'gem', 'mount'].includes(equipType)) {
    effectList = effects.accessory
  } else {
    effectList = effects.armor
  }

  return effectList[Math.floor(Math.random() * effectList.length)]
}

// 获取道具数据
function getItem(id) {
  return ITEMS[id]
}

// 获取稀有度标签类名
function getRarityClass(rarity) {
  const rarityMap = {
    'common': 'tag-common',
    'uncommon': 'tag-rare',
    'rare': 'tag-rare',
    'epic': 'tag-epic',
    'legendary': 'tag-legendary',
    'mythic': 'tag-mythic',
    'divine': 'tag-divine',
    'ancient': 'tag-ancient',
    'primordial': 'tag-primordial',
    'eternal': 'tag-eternal'
  }
  return rarityMap[rarity] || 'tag-common'
}

// 获取稀有度中文名
function getRarityName(rarity) {
  const rarityMap = {
    'common': '普通',
    'uncommon': '优秀',
    'rare': '稀有',
    'epic': '史诗',
    'legendary': '传说',
    'mythic': '神话',
    'divine': '神圣',
    'ancient': '远古',
    'primordial': '太古',
    'eternal': '永恒'
  }
  return rarityMap[rarity] || '普通'
}

// 获取稀有度颜色
function getRarityColor(rarity) {
  const colorMap = {
    'common': '#888888',
    'uncommon': '#1eff00',
    'rare': '#0070dd',
    'epic': '#a335ee',
    'legendary': '#ff8000',
    'mythic': '#ff0000',
    'divine': '#ffff00',
    'ancient': '#e6cc80',
    'primordial': '#00ffff',
    'eternal': '#ff69b4'
  }
  return colorMap[rarity] || '#888888'
}

// 根据等级获取可穿戴装备
function getEquipmentsByLevel(level) {
  return Object.values(ITEMS).filter(item =>
    (item.type === 'equipment' || item.type === 'weapon') &&
    item.level <= level
  )
}

// 根据类型和等级范围获取装备
function getEquipmentsByType(type, minLevel, maxLevel) {
  return Object.values(ITEMS).filter(item =>
    (item.subType === type || (type === 'weapon' && item.type === 'weapon')) &&
    item.level >= minLevel &&
    item.level <= maxLevel
  )
}

// ========== 商城固定装备数据 ==========
// 每种类型最低2件（1级和5级）
const SHOP_WEAPONS = [
  // 刀
  { id: 'weapon_dao_lv1', name: '木刀 Lv.1', subType: 'dao', level: 1, attack: 3, price: 30 },
  { id: 'weapon_dao_lv5', name: '铁刀 Lv.5', subType: 'dao', level: 5, attack: 8, price: 100 },
  // 剑
  { id: 'weapon_jian_lv1', name: '木剑 Lv.1', subType: 'jian', level: 1, attack: 3, price: 30 },
  { id: 'weapon_jian_lv5', name: '铁剑 Lv.5', subType: 'jian', level: 5, attack: 8, price: 100 },
  // 斧
  { id: 'weapon_axe_lv1', name: '战斧 Lv.1', subType: 'axe', level: 1, attack: 4, price: 35 },
  { id: 'weapon_axe_lv5', name: '双手斧 Lv.5', subType: 'axe', level: 5, attack: 10, price: 120 },
  // 法杖
  { id: 'weapon_staff_lv1', name: '木杖 Lv.1', subType: 'staff', level: 1, attack: 2, magicAttack: 3, price: 30 },
  { id: 'weapon_staff_lv5', name: '法杖 Lv.5', subType: 'staff', level: 5, attack: 4, magicAttack: 8, price: 100 },
  // 弓
  { id: 'weapon_bow_lv1', name: '短弓 Lv.1', subType: 'bow', level: 1, attack: 3, price: 30 },
  { id: 'weapon_bow_lv5', name: '长弓 Lv.5', subType: 'bow', level: 5, attack: 8, price: 100 }
]

const SHOP_ARMORS = [
  // 头盔
  { id: 'helmet_lv1', name: '皮帽 Lv.1', subType: 'helmet', level: 1, defense: 2, hpBonus: 10, price: 25 },
  { id: 'helmet_lv5', name: '铁盔 Lv.5', subType: 'helmet', level: 5, defense: 6, hpBonus: 25, price: 80 },
  // 护甲
  { id: 'armor_chest_lv1', name: '皮甲 Lv.1', subType: 'armor', level: 1, defense: 3, hpBonus: 15, price: 30 },
  { id: 'armor_chest_lv5', name: '锁子甲 Lv.5', subType: 'armor', level: 5, defense: 10, hpBonus: 40, price: 100 },
  // 盾牌
  { id: 'shield_lv1', name: '木盾 Lv.1', subType: 'shield', level: 1, defense: 2, block: 5, price: 25 },
  { id: 'shield_lv5', name: '铁盾 Lv.5', subType: 'shield', level: 5, defense: 6, block: 12, price: 80 },
  // 项链
  { id: 'necklace_lv1', name: '项链 Lv.1', subType: 'necklace', level: 1, attack: 1, defense: 1, price: 30 },
  { id: 'necklace_lv5', name: '项链 Lv.5', subType: 'necklace', level: 5, attack: 3, defense: 3, price: 90 },
  // 戒指
  { id: 'ring_lv1', name: '戒指 Lv.1', subType: 'ring', level: 1, attack: 1, price: 25 },
  { id: 'ring_lv5', name: '戒指 Lv.5', subType: 'ring', level: 5, attack: 3, price: 80 },
  // 腰带
  { id: 'belt_lv1', name: '腰带 Lv.1', subType: 'belt', level: 1, hpBonus: 10, price: 20 },
  { id: 'belt_lv5', name: '腰带 Lv.5', subType: 'belt', level: 5, hpBonus: 25, price: 60 },
  // 护腕
  { id: 'bracer_lv1', name: '护腕 Lv.1', subType: 'bracer', level: 1, attack: 1, hpBonus: 5, price: 20 },
  { id: 'bracer_lv5', name: '护腕 Lv.5', subType: 'bracer', level: 5, attack: 3, hpBonus: 15, price: 60 },
  // 护身符
  { id: 'amulet_lv1', name: '护身符 Lv.1', subType: 'amulet', level: 1, attack: 1, defense: 1, price: 30 },
  { id: 'amulet_lv5', name: '护身符 Lv.5', subType: 'amulet', level: 5, attack: 3, defense: 3, price: 90 }
]

// 获取商城可购买物品
function getShopItems(category = 'all') {
  const items = []

  // 药水（使用ITEMS中的数据）
  const potions = Object.values(ITEMS).filter(item => item.type === 'potion')
  potions.forEach(potion => {
    items.push({
      ...potion,
      type: 'potion'
    })
  })

  // 装备（使用固定数据）
  if (category === 'all' || category === 'weapon' || category === 'equipment') {
    // 武器
    if (category === 'all' || category === 'weapon') {
      SHOP_WEAPONS.forEach(weapon => {
        items.push({
          ...weapon,
          type: 'weapon',
          rarity: 'common',
          quality: 1,
          isSet: false,
          description: `${weapon.name}，等级需求：${weapon.level}`
        })
      })
    }

    // 防具
    if (category === 'all' || category === 'armor' || category === 'equipment') {
      SHOP_ARMORS.forEach(armor => {
        items.push({
          ...armor,
          type: 'equipment',
          rarity: 'common',
          quality: 1,
          isSet: false,
          description: `${armor.name}，等级需求：${armor.level}`
        })
      })
    }
  }

  // 按类型过滤
  if (category === 'potion') {
    return items.filter(item => item.type === 'potion')
  } else if (category === 'weapon') {
    return items.filter(item => item.type === 'weapon')
  } else if (category === 'armor' || category === 'equipment') {
    return items.filter(item => item.type === 'equipment')
  }

  return items
}

// 根据掉落等级获取装备列表
function getEquipmentDrops(playerLevel) {
  const minLevel = Math.max(1, playerLevel - 10)
  const maxLevel = playerLevel + 5
  return Object.values(ITEMS).filter(item =>
    (item.type === 'equipment' || item.type === 'weapon') &&
    item.level >= minLevel &&
    item.level <= maxLevel
  )
}

module.exports = {
  ITEMS,
  getItem,
  getRarityClass,
  getRarityName,
  getRarityColor,
  getShopItems,
  getEquipmentsByLevel,
  getEquipmentsByType,
  getEquipmentDrops,
  RARITY_CONFIG,
  SET_EQUIPMENT_NAMES,
  EQUIPMENT_TIER_CONFIG,
  getTierConfig,
  // 属性系统相关导出
  getAttributeConfig,
  getAttribute,
  getSupportedAttributeKeys,
  ALL_STATS_DISTRIBUTION
}
