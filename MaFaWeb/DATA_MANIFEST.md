# 数据源清单

## 概述
本项目使用 mock 数据源模拟后端 API。所有数据通过 `services/dataService.js` 统一管理，页面通过 `app.js` 的方法获取数据。

## 架构原则
1. **单一数据源**: 所有游戏数据从 `services/dataService.js` 统一获取
2. **页面无状态**: 页面不直接存储数据，通过 `app.js` 全局数据层访问
3. **配置化切换**: 通过 `USE_API` 标志切换 mock 数据和真实 API

## 配置
- **API 开关**: `api/index.js` 中的 `CONFIG.USE_MOCK = true`
- **数据服务**: `services/dataService.js` - 统一数据访问层
- **数据存储键**: `gameData` - 本地存储键名

## 数据源分类

### 1. 游戏数据 (data/gameData.js)
```
状态: 已整合到 mock 数据层
说明: 该文件中的初始数据已由 mock/mockData.js 的 getMockPlayerData() 提供
```

### 2. 物品数据 (data/items.js)
```
路径: services/dataService.js -> data/items.js
用途: getItem(id) - 根据ID获取物品数据
类型: 装备和药剂定义
```

**包含的数据:**
- **POTIONS**: 药剂列表 (hp/mp/dual 三种，每种多个级别)
- **EQUIPMENT_TYPES**: 20类装备，每类20个级别
- **EQUIPMENT_SLOT_MAP**: 类型到槽位映射
  - weapon_* -> 'weapon'
  - helmet -> 'helmet'
  - armor_* -> 'armor'
  - shield -> 'shield'
  - necklace -> 'necklace'
  - ring_left -> 'ring1'
  - ring_right -> 'ring2'
  - 其他饰品 -> 同名槽位

### 3. 怪物数据 (data/monsters.js)
```
状态: 未在当前流程中使用
说明: 怪物定义已整合到 mock/mockData.js 中
```

### 4. 地下城数据 (data/dungeons.js)
```
状态: 未在当前流程中使用
说明: 地下城定义已整合到 mock/mockData.js 中
```

### 5. 任务数据 (data/tasks.js)
```
状态: 未在当前流程中使用
说明: 任务定义已整合到 mock/mockData.js 中
```

### 6. Mock 数据 (mock/mockData.js)
```
路径: api/index.js -> mock/mockData.js
用途: 模拟所有API接口返回数据
类型: Mock数据层
```

**包含的函数:**
- `mockRegister(data)` - 模拟用户注册
- `mockLogin(data)` - 模拟用户登录
- `mockLogout()` - 模拟用户登出
- `getMockPlayerData()` - 获取玩家信息
- `mockUpdatePlayerInfo(data)` - 更新玩家信息
- `mockHeartbeat()` - 心跳保活
- `getMockHeroData()` - 获取角色信息
- `mockUpdateHeroInfo(data)` - 更新角色信息
- `getMockBagList()` - 获取背包列表
- `mockUseItem(itemId)` - 使用物品
- `mockDeleteItem(itemId)` - 删除物品
- `getMockShopList()` - 获取商城列表
- `mockBuyItem(itemId)` - 购买物品
- `getMockRankList()` - 获取排行榜
- `getMockDungeonList()` - 获取地下城列表
- `getMockDungeonDetail(dungeonId)` - 获取地下城详情
- `getMockExploreResult(playerLevel)` - 模拟探索结果
- `getMockMonster(playerLevel)` - 获取怪物数据
- `getMockBattleResult(action, skillId)` - 模拟战斗结果
- `getMockBattleDrops(monsterLevel, monsterType)` - 模拟战斗掉落

### 7. API 接口层 (api/index.js)
```
路径: services/dataService.js -> api/index.js
用途: HTTP请求封装
类型: 请求路由处理
```

**包含的模块:**
- **认证模块**: register, login, logout
- **玩家模块**: getPlayerInfo, updatePlayerInfo, heartbeat
- **角色模块**: getHeroInfo, updateHeroInfo, equipItem, unequipItem
- **背包模块**: getBagList, useItem, deleteItem
- **商城模块**: getShopList, buyItem
- **排行榜模块**: getRankList
- **地下城模块**: getDungeonList, getDungeonDetail, enterDungeon, exploreDungeon
- **战斗模块**: startBattle, attack, useSkill, defend, run, submitBattleResult

### 8. 数据服务层 (services/dataService.js)
```
职责: 统一数据访问和本地存储管理
```

**配置:**
- `USE_API = false` - 当前使用 mock 数据
  - true: 连接真实后端
  - false: 使用 mock 数据 (当前配置)

**提供的函数:**
- `getGameData()` - 获取游戏数据
  - USE_API=true: 调用 api.getHeroInfo() 和 api.getBagList()
  - USE_API=false: 调用 getLocalGameData() 从本地存储加载

- `saveGameData(hero, bag)` - 保存游戏数据
  - USE_API=true: 调用 api 模块
  - USE_API=false: 调用 wx.setStorageSync('gameData', {hero, bag})

- `getLocalGameData()` - 从本地存储加载
  - 读取 'gameData' 键
  - 如果不存在则调用 getInitialGameData()

- `getInitialGameData()` - 获取初始游戏数据
  - 定义完整的初始角色和背包结构
  - 包含基础属性、装备槽位、技能、金币等

- `equipItem(itemIndex, slot)` - 装备物品
  - USE_API=true: 调用 api.equipItem(itemId, slot)
  - USE_API=false: 调用 equipLocalItem()

- `equipLocalItem(itemIndex, slot)` - 本地装备逻辑
  - 验证物品类型（weapon 或 equipment）
  - 如果未指定槽位，根据 item.subType 推断
  - 获取旧装备，将新物品放入对应槽位
  - 旧装备放回背包或从背包删除

- `unequipItem(slot)` - 卸下装备
  - 将槽位中的装备放回背包

- `useItem(itemIndex)` - 使用物品
  - 验证物品类型
  - 根据物品类型恢复 HP/MP
  - 减少物品数量或删除

- `sellItem(itemIndex, price)` - 出售物品
  - USE_API=true: 调用 api.sellItem()
  - USE_API=false: 调用 sellLocalItem()

- `addItem(item)` - 添加物品到背包
  - 添加到 globalData.bag.items 数组

- `getTotalStats()` - 计算角色总属性
  - 遍历所有装备槽位
  - 累加装备属性（attack, defense, hpBonus, mpBonus, crit, dodge）
  - 返回总属性对象

- `getSlotFromItemId(itemId)` - 根据物品ID推断装备槽位

### 9. 应用层 (app.js)
```
职责: 全局数据管理和生命周期
```

**全局数据 (globalData):**
- `gameStatus`: 游戏状态（idle/battling）
- `hero`: 角色数据（由 dataService 更新）
- `bag`: 背包数据（由 dataService 更新）
- `currentBattle`: 当前战斗引用

**提供的方法:**
- `loadGameData()` - 加载游戏数据
  - 调用 dataService.getGameData()
  - 更新 globalData.hero 和 globalData.bag

- `saveGameData()` - 保存游戏数据
  - 调用 dataService.saveGameData(globalData.hero, globalData.bag)

- `getTotalStats()` - 计算角色总属性
  - 调用 dataService.getTotalStats()

- `addExp(exp)` - 添加经验值
  - 更新 hero.exp
  - 检查升级并提升属性

- `addItem(item)` - 添加物品到背包
  - 直接操作 globalData.bag.items.push()

- `useItem(index)` - 使用物品
  - 调用 dataService.useItem(index)

- `equipItem(index, slot)` - 装备物品
  - 调用 dataService.equipItem(index, slot)
  - 接收返回的 hero 和 bag 数据更新

- `unequipItem(slot)` - 卸下装备
  - 直接操作 hero.equipment 和 globalData.bag

- `sellItem(index, price)` - 出售物品
  - 调用 dataService.sellItem(index, price)

### 10. 页面层 (pages/*.js)
```
职责: UI 渲染和用户交互
```

**数据获取方式:**
- 所有页面通过 app.js 的方法获取数据
- 不直接访问 app.globalData
- 不直接操作 globalData

**页面列表:**
- `main/` - 主页
- `dungeon/` - 地下城选择
- `dungeon-detail/` - 地下城详情
- `hero/` - 角色信息
- `bag/` - 背包管理
- `shop/` - 商城
- `battle/` - 战斗界面
- `task/` - 任务系统

### 11. 本地存储
```
存储键: 'gameData'
存储内容: { hero: {...}, bag: {...}}
使用方式: wx.getStorageSync('gameData') 和 wx.setStorageSync('gameData', {...})
生命周期: 应用启动时加载，数据变更时保存
```

## 数据流向

```
用户操作（如装备/使用药剂）
        ↓
页面方法调用（app.equipItem/app.useItem）
        ↓
dataService 方法（equipItem/useItem）
        ↓
数据源（API/Mock）
        ↓
返回数据到 app.js
        ↓
更新 globalData
        ↓
页面 loadHeroData() 刷新 UI
```

## Mock 数据测试

### 模拟的网络延迟
- 所有 API 请求模拟 200ms 网络延迟（通过 delay() 函数）

### 测试场景
1. **首次启动**: loadGameData() 从本地加载（空）-> 调用 getInitialGameData() 返回初始数据
2. **装备物品**: equipItem() -> 装备成功 -> 更新 hero.equipment 和 bag.items
3. **使用药剂**: useItem() -> 恢复 HP/MP -> 更新 hero.hp/hero.mp
4. **出售物品**: sellItem() -> 移除物品并增加金币
5. **升级**: addExp() -> 提升等级和基础属性

## 开关控制

### 连接真实后端

**操作步骤:**
1. 在 `api/index.js` 中设置 `CONFIG.USE_MOCK = false`
2. 确保后端服务器地址正确：修改 `CONFIG.BASE_URL`
3. 在 `api/index.js` 中添加真实的请求头处理（如 Token）
4. 在 `dataService.js` 中确认 API 路径处理正确

### 使用 Mock 数据

**当前配置:**
- `CONFIG.USE_MOCK = true` (api/index.js)
- `USE_API = false` (dataService.js)

**注意事项:**
- 所有页面都通过 app.js 的方法获取数据
- app.js 通过 dataService.js 获取数据
- dataService.js 根据 USE_API 决定使用 mock 或 API
- Mock 数据层提供完整的游戏数据（角色、背包、商城、地下城、战斗）

## 技术特性

### 数据一致性
- 所有装备使用统一的槽位映射（EQUIPMENT_SLOT_MAP）
- 所有物品包含完整的属性（type, subType, rarity, icon, iconKey）
- 角色属性计算包含装备加成（getTotalStats）

### 装备系统
- 槽位验证：只装备到存在的槽位
- 装备替换：旧装备自动放回背包或被覆盖
- 类型检查：只允许 weapon 和 equipment 类型装备

### 错误处理
- 所有数据操作都有 try-catch 包装
- API 请求失败时返回错误信息
- 本地存储异常时返回初始数据

## 更新日志

- **2024-02-23**: 初始化项目架构文档，说明数据源和流向
- **2024-02-23**: 修复装备槽位映射，统一使用槽位名
- **2024-02-23**: 添加装备属性显示（魔法攻击、生命加成、暴击、闪避、攻击速度、格挡、特殊效果）
- **2024-02-23**: 修复装备功能，添加调试日志和错误处理
- **2024-02-23**: 修复装备后属性同步问题（loadHeroData 中同步 hero.attack/defense 等）
- **2024-02-23**: 确认 USE_API = false 使用 mock 数据模式
- **2024-02-23**: 创建 DATA_MANIFEST.md 清单文档


## 数据源分类

### 1. 游戏数据 (data/gameData.js)
```
路径: services/dataService.js -> data/gameData.js
用途: getInitialGameData() - 返回初始角色和背包数据
类型: 初始游戏数据（首次启动）
```

**包含的数据:**
- `hero`: 角色基础信息
  - id, name, level, exp, maxExp
  - hp, maxHp, mp, maxMp
  - attack, defense, speed, gold
  - physicalDefense, magicDefense, attackPower, magicPower, taoismPower, attackSpeed, accuracy, agility, luck
  - x, y
  - equipment: 装备槽位 { helmet, armor, shield, necklace, ring1, ring2, belt, cloak, bracer, earring, amulet, gem, weapon }
  - skills: 技能列表

- `bag`: 背包数据
  - items: 物品列表
  - gold: 金币

### 2. 物品数据 (data/items.js)
```
路径: services/dataService.js -> data/items.js
用途: getItem(id) - 根据ID获取物品数据
类型: 装备和药剂定义
```

**包含的数据:**
- **POTIONS**: 药剂列表
  - id, name, type: 'potion', subType: 'hp'/'mp'/'dual', value/hpRestore/mpRestore, price, rarity: 'common'

- **EQUIPMENT_TYPES**: 装备类型数组
  - ['weapon_sword', 'weapon_axe', 'weapon_bow', 'weapon_staff', 'weapon_dagger',
     'helmet', 'armor_chest', 'armor_legs', 'armor_boots', 'armor_gloves',
     'shield', 'necklace', 'ring_left', 'ring_right',
     'belt', 'cloak', 'bracer', 'earring', 'amulet', 'gem']

- **EQUIPMENT_NAMES**: 装备名称映射
  - 每类装备有20个级别（1-96），间隔5级

- **EQUIPMENT_SLOT_MAP**: 类型到槽位映射
  - weapon_* -> 'weapon'
  - helmet -> 'helmet'
  - armor_chest/armor_legs/armor_boots/armor_gloves -> 'armor'
  - shield -> 'shield'
  - necklace -> 'necklace'
  - ring_left -> 'ring1'
  - ring_right -> 'ring2'
  - belt/cloak/bracer/earring/amulet/gem -> 同名槽位

- **RARITY_CONFIG**: 稀有度配置
  - 10个品质阶层，每个有名称、颜色、加成倍数

### 3. 怪物数据 (data/monsters.js)
```
路径: data/gameData.js -> data/monsters.js
用途: 未在当前流程中使用（在 mock 中直接定义）
类型: 怪物定义和生成
```

### 4. 地下城数据 (data/dungeons.js)
```
路径: mock/mockData.js
用途: getMockDungeonList() - 返回地下城列表
类型: 地下城定义
```

**包含的数据:**
- 地下城ID、名称、等级、层数
- 怪物分布、BOSS配置
- 奖励配置

### 5. 任务数据 (data/tasks.js)
```
路径: mock/mockData.js
用途: getMockDungeonDetail() 返回任务详情
类型: 任务定义（未在当前流程中使用）
```

### 6. Mock 数据 (mock/mockData.js)
```
路径: api/index.js -> mock/mockData.js
用途: 模拟所有API接口返回数据
类型: Mock数据层
```

**包含的函数:**
- `mockRegister(data)` - 模拟用户注册
- `mockLogin(data)` - 模拟用户登录
- `mockLogout()` - 模拟用户登出
- `getMockPlayerData()` - 获取玩家信息
- `mockUpdatePlayerInfo(data)` - 更新玩家信息
- `mockHeartbeat()` - 心跳保活
- `getMockHeroData()` - 获取角色信息
- `mockUpdateHeroInfo(data)` - 更新角色信息
- `getMockBagList()` - 获取背包列表
- `mockUseItem(itemId)` - 使用物品
- `mockDeleteItem(itemId)` - 删除物品
- `getMockShopList()` - 获取商城列表
- `mockBuyItem(itemId)` - 购买物品
- `getMockRankList()` - 获取排行榜
- `getMockDungeonList()` - 获取地下城列表
- `getMockDungeonDetail(dungeonId)` - 获取地下城详情
- `getMockExploreResult(playerLevel)` - 模拟探索结果
- `getMockMonster(playerLevel)` - 获取怪物数据
- `getMockBattleResult(action, skillId)` - 模拟战斗结果
- `getMockBattleDrops(monsterLevel, monsterType)` - 模拟战斗掉落

### 7. API 接口层 (api/index.js)
```
路径: services/dataService.js -> api/index.js
用途: 统一所有后端API调用
类型: HTTP请求封装
```

**包含的模块:**
- **认证模块**: register, login, logout
- **玩家模块**: getPlayerInfo, updatePlayerInfo, heartbeat
- **角色模块**: getHeroInfo, updateHeroInfo, equipItem, unequipItem
- **背包模块**: getBagList, useItem, deleteItem
- **商城模块**: getShopList, buyItem
- **排行榜模块**: getRankList
- **地下城模块**: getDungeonList, getDungeonDetail, enterDungeon, exploreDungeon
- **战斗模块**: startBattle, attack, useSkill, defend, run, submitBattleResult

### 8. 页面使用 (pages/*.js)
```
所有页面通过以下方式获取数据:
- app.globalData.hero - 直接访问全局角色数据
- app.equipItem() - 装备物品
- app.unequipItem() - 卸下装备
- app.addItem() - 添加物品到背包
- app.useItem() - 使用物品
- app.sellItem() - 出售物品
- app.getTotalStats() - 获取总属性

### 9. 数据服务层 (services/dataService.js)
```
主要职责: 数据源统一管理
```

**配置:**
- `USE_API = false` - false表示使用mock数据

**提供的函数:**
- `getGameData()` - 获取游戏数据
  - USE_API=true: 调用 api.getHeroInfo() 和 api.getBagList()
  - USE_API=false: 调用 getLocalGameData()
- `saveGameData(hero, bag)` - 保存游戏数据
- `getLocalGameData()` - 从本地存储加载数据
- `getInitialGameData()` - 获取初始游戏数据

- `equipItem(itemIndex, slot)` - 装备物品
- `unequipItem(slot)` - 卸下装备
- `useItem(itemIndex)` - 使用物品
- `sellItem(itemIndex, price)` - 出售物品
- `addItem(item)` - 添加物品到背包
- `getTotalStats()` - 计算角色总属性（含装备加成）
- `getSlotFromItemId(itemId)` - 根据物品ID推断槽位

### 数据流向

```
┌─────────────────┐
│   Mock 数据源   │
│   (mockData.js)    │
│         ↓          │
│   api/index.js      │
│         ↓          │
│ dataService.js    │
│         ↓          │
│   app.js          │
│         ↓          │
│    各页面.js      │
└─────────────────┘
```

### 开关控制

在 `api/index.js` 中修改 `CONFIG.USE_MOCK` 的值：
- `true`: 使用 mock 数据（开发测试用）
- `false`: 连接真实后端服务器

### 注意事项

1. **数据同步**:
   - 装备/使用药剂后，通过 `app.equipItem()` / `app.useItem()` 更新
   - 页面通过 `onShow()` 生命周期调用 `loadHeroData()`
   - `loadHeroData()` 会自动从 `app.globalData.hero` 获取最新数据

2. **本地存储**:
   - 数据存储在 `gameData` 键中
   - 通过 `wx.getStorageSync('gameData')` 和 `wx.setStorageSync('gameData')` 读写

3. **装备系统**:
   - 槽位映射：详见 items.js 中的 `EQUIPMENT_SLOT_MAP`
   - 所有装备使用槽位名（weapon, helmet, armor, shield, necklace, ring1, ring2 等）
   - 装备会替换/添加到对应槽位

4. **属性系统**:
   - 基础属性：attack, defense, hp, mp
   - 扩展属性：physicalDefense, magicDefense, attackPower, magicPower, taoismPower, attackSpeed, accuracy, agility, luck
   - 装备属性在物品中定义（attack, defense, crit, dodge, magicAttack, speed, hpBonus, mpBonus）
   - 总属性通过 `getTotalStats()` 计算（基础属性 + 装备属性）

### 更新日志

- 2024-xx-xx: 初始化 mock 数据层
- 2024-xx-xx: 完善装备槽位映射，统一使用槽位名
- 2024-xx-xx: 修复装备功能，添加调试日志和错误处理
- 2024-xx-xx: 同步角色属性，装备/药剂后自动更新 hero.attack/defense 等

### 未来优化建议

1. **分离数据层**: 考虑将数据存储改为更规范的结构
2. **添加数据验证**: 在 dataService 中添加数据校验函数
3. **性能优化**: 减少不必要的数据计算和存储
4. **状态管理**: 考虑使用 Redux 或 MobX 进行全局状态管理
