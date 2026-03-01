# 游戏数据更新摘要

## 更新日期
2026-02-23

## 更新内容

### 1. 装备系统 (data/items.js)

**20类装备，每类20个级别，间隔5级**

#### 装备类别：
1. 武器类（5种）：
   - weapon_sword（剑类）
   - weapon_axe（斧类）
   - weapon_bow（弓类）
   - weapon_staff（法杖类）
   - weapon_dagger（匕首类）

2. 防具类（5种）：
   - helmet（头盔）
   - armor_chest（胸甲）
   - armor_legs（护腿）
   - armor_boots（鞋子）
   - armor_gloves（护手）

3. 饰品类（10种）：
   - shield（盾牌）
   - necklace（项链）
   - ring_left（左戒指）
   - ring_right（右戒指）
   - belt（腰带）
   - cloak（披风）
   - bracer（护腕）
   - earring（耳环）
   - amulet（护身符）
   - gem（宝石）

#### 稀有度系统（10级）：
1. 破碎（灰色）- 50% 属性
2. 陈旧（灰色）- 70% 属性
3. 普通（白色）- 100% 属性
4. 优秀（绿色）- 120% 属性
5. 精良（蓝色）- 150% 属性
6. 稀有（紫色）- 200% 属性
7. 史诗（橙色）- 250% 属性
8. 传说（金色）- 350% 属性
9. 神话（红色）- 500% 属性
10. 神圣（黄色）- 800% 属性

#### 装备等级：
- 范围：1级 - 96级
- 间隔：每5级一个新装备
- 数量：每类20个，共400件装备

### 2. 怪物系统 (data/monsters.js)

**30个级别怪物，从1级到200级**

#### 怪物系列分布：

**1-10级：骷髅系列（普通）**
- skeleton_1, skeleton_3, skeleton_5, skeleton_7, skeleton_9

**11-30级：僵尸系列（普通）**
- zombie_11, zombie_15, zombie_19, zombie_23, zombie_27

**31-50级：骷髅精英（精英）**
- skeleton_elite_31 ~ skeleton_elite_47

**51-70级：僵尸精英（精英）**
- zombie_elite_51 ~ zombie_elite_67

**71-90级：骷髅BOSS（BOSS）**
- boss_skeleton_71 ~ boss_skeleton_87

**91-110级：僵尸BOSS（BOSS）**
- boss_zombie_91 ~ boss_zombie_107

**111-130级：混合精英（精英）**
- hybrid_elite_111 ~ hybrid_elite_127

**131-150级：混合BOSS（BOSS）**
- boss_hybrid_131 ~ boss_hybrid_147

**151-170级：远古怪物（精英）**
- ancient_151 ~ ancient_167

**171-200级：最终BOSS（BOSS）**
- boss_final_171 ~ boss_final_192

#### 怪物属性缩放：
- 普通怪：基础属性 × 1
- 精英怪：基础属性 × 2
- BOSS怪：基础属性 × 5

#### 基础属性公式：
- HP = (50 + level × 30) × multiplier
- 攻击 = (5 + level × 2) × multiplier
- 防御 = (2 + level × 1) × multiplier × 0.6
- 经验 = (10 + level × 15) × multiplier
- 金币 = (5 + level × 8) × multiplier

### 3. 地下城系统 (data/dungeons.js)

**50个地下城，从1级到200级**

#### 地下城分布：

**第1-5个地下城（1-9级）：废弃墓穴系列**
- 骷髅主题，5层

**第6-10个地下城（11-27级）：阴暗墓穴系列**
- 僵尸主题，8层

**第11-15个地下城（31-47级）：骸骨要塞系列**
- 骷髅精英主题，10层

**第16-20个地下城（51-67级）：瘟疫深渊系列**
- 僵尸精英主题，12层

**第21-25个地下城（71-87级）：骷髅王座系列**
- 骷髅BOSS主题，15层

**第26-30个地下城（91-107级）：僵尸王国系列**
- 僵尸BOSS主题，18层

**第31-35个地下城（111-127级）：深渊试炼系列**
- 混合精英主题，20层

**第36-40个地下城（131-147级）：冥界神殿系列**
- 混合BOSS主题，25层

**第41-45个地下城（151-167级）：远古遗迹系列**
- 远古怪物主题，30层

**第46-50个地下城（171-199级）：末日降临系列**
- 最终BOSS主题，35层

#### 地下城主题：
- skeleton（骷髅）
- zombie（僵尸）
- elite（精英）
- boss（BOSS）
- hybrid（混合）
- ancient（远古）
- final（最终）

### 4. 更新的文件

1. **data/items.js** - 完全重写
   - 生成400件装备
   - 10种稀有度
   - 装备ID格式：{type}_{subType}_lv{level}

2. **data/monsters.js** - 完全重写
   - 50种怪物配置
   - 自动生成掉落表
   - 支持技能系统

3. **data/dungeons.js** - 完全重写
   - 50个地下城
   - 动态主题配置
   - 根据等级推荐地下城

4. **data/gameData.js** - 新增
   - 统一导出游戏数据

5. **mock/mockData.js** - 更新
   - 适配新的数据结构
   - 支持装备掉落
   - 根据玩家等级生成怪物

6. **services/dataService.js** - 更新
   - 新的装备槽位系统（16个槽位）
   - 更新装备/使用物品逻辑
   - 新的属性计算（包括暴击、闪避等）

### 5. 装备槽位系统

新增装备槽位：
- helmet（头盔）
- armor_chest（胸甲）
- armor_legs（护腿）
- armor_boots（鞋子）
- armor_gloves（护手）
- shield（盾牌）
- necklace（项链）
- ring_left（左戒指）
- ring_right（右戒指）
- belt（腰带）
- cloak（披风）
- bracer（护腕）
- earring（耳环）
- amulet（护身符）
- gem（宝石）
- weapon（武器）

### 6. 药水系统

药水类型：
- potion_small_hp/mp - 小型药水
- potion_medium_hp/mp - 中型药水
- potion_large_hp/mp - 大型药水
- potion_giant_hp/mp - 巨型药水
- potion_dual_small/medium/large - 双效药水
- potion_elixir - 恢复药剂

### 7. 数据结构变更

#### 旧格式：
```javascript
{ id: 'weapon_wooden_sword', type: 'weapon', subType: null, ... }
```

#### 新格式：
```javascript
{ id: 'weapon_sword_lv1', type: 'weapon', subType: 'weapon_sword', level: 1, quality: 1, ... }
```

#### 药水属性格式：
```javascript
// 旧格式
{ value: 50 }  // 单一数值

// 新格式
{ value: { hp: 50, mp: 30 } }  // 对象格式
```

## 使用说明

### 初始装备
新角色初始获得：
- potion_small_hp × 1
- potion_small_mp × 1
- weapon_sword_lv1 × 1
- armor_chest_lv1 × 1
- shield_lv1 × 1
- 金币: 100

### 装备ID命名规则
- 武器: weapon_{type}_lv{level}
  - 例: weapon_sword_lv1, weapon_axe_lv5
- 防具: {slot}_lv{level}
  - 例: helmet_lv1, armor_chest_lv1, shield_lv1
- 饰品: {slot}_lv{level}
  - 例: necklace_lv1, ring_left_lv1, gem_lv1

### 获取装备
```javascript
const { getItem } = require('./data/items')
const sword = getItem('weapon_sword_lv1')
```

### 获取地下城
```javascript
const { getDungeon, getRecommendedDungeons } = require('./data/dungeons')
const dungeon = getDungeon(1)
const recommended = getRecommendedDungeons(10) // 获取推荐地下城
```

### 获取怪物
```javascript
const { getMonster, getMonstersByLevelRange } = require('./data/monsters')
const monster = getMonster('skeleton_1')
const monsters = getMonstersByLevelRange(1, 10)
```

## 注意事项

1. **数据迁移**：旧存档可能无法直接使用，建议清空后重新开始
2. **装备槽位**：新增的槽位需要UI更新才能显示
3. **稀有度颜色**：需要在CSS中添加新的稀有度颜色类
4. **怪物掉落**：掉落逻辑已更新，支持根据怪物类型和等级生成掉落

## 下一步建议

1. 更新角色页装备栏UI以支持16个槽位
2. 添加稀有度颜色的CSS样式
3. 更新战斗系统以支持新的怪物属性
4. 添加装备强化/升级系统
5. 实现装备套装效果
