# 地下城传说 - 微信小程序 RPG 游戏

一款基于微信小程序的像素风 RPG 游戏，玩家需要探索地下城，击败骷髅和僵尸怪物，收集装备，挑战 Boss，最终通关游戏。

## 游戏特色

- 🎮 **回合制战斗系统** - 经典的回合制战斗，支持普通攻击、技能攻击、药水使用
- 🧟 **多样的怪物** - 骷髅兵、僵尸等不同等级的怪物，更有强大的 Boss 挑战
- ⚔️ **装备系统** - 收集不同稀有度的武器、防具、饰品，提升战力
- 📈 **角色成长** - 击杀怪物获得经验值升级，提升基础属性
- 🗺️ **多层级地下城** - 5 个不同难度的地下城，每层都有独特的挑战

## 项目结构

```
GameCode/
├── app.js                 # 全局逻辑和游戏状态管理
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── sitemap.json          # 搜索配置
├── data/                  # 游戏数据配置
│   ├── monsters.js        # 怪物数据
│   ├── items.js           # 装备和道具数据
│   └── dungeons.js        # 地下城数据
├── utils/                 # 工具函数
│   ├── canvas-draw.js     # Canvas 绘图工具（方块风格）
│   ├── game-utils.js      # 游戏工具函数
│   └── battle-system.js   # 战斗系统逻辑
└── pages/                 # 页面文件
    ├── main/              # 主界面
    ├── dungeon/           # 地下城选择
    ├── battle/            # 战斗界面
    ├── hero/              # 角色详情
    └── bag/               # 背包界面
```

## 开发指南

### 环境要求

- 微信开发者工具
- 微信小程序账号（可以使用测试账号）

### 快速开始

1. 打开微信开发者工具
2. 导入项目，选择 `GameCode` 目录
3. AppID 选择"测试号"或填写你的 AppID
4. 点击编译即可运行

### 核心系统说明

#### 1. 战斗系统 (`utils/battle-system.js`)
- 回合制战斗逻辑
- 支持技能释放、伤害计算、闪避判定
- 战斗胜利/失败处理
- 掉落奖励计算

#### 2. Canvas 绘图 (`utils/canvas-draw.js`)
- 方块风格的绘图工具
- 支持绘制英雄、骷髅、僵尸、Boss
- 生命条、经验条、伤害数字显示

#### 3. 游戏数据 (`data/`)
- `monsters.js`: 定义怪物属性、技能、掉落
- `items.js`: 定义装备、药水等物品
- `dungeons.js`: 定义地下城层级、怪物分布、Boss

#### 4. 存档系统
- 自动保存到微信小程序本地存储
- 保存角色属性、装备、背包、进度

### 添加新内容

#### 添加新怪物
编辑 `data/monsters.js`，添加新的怪物配置：
```javascript
new_monster: {
  id: 'new_monster',
  name: '怪物名称',
  type: 'skeleton', // or 'zombie'
  level: 10,
  hp: 500,
  attack: 50,
  defense: 20,
  speed: 15,
  exp: 100,
  gold: 50,
  color: '#ff0000',
  size: 1.2,
  skills: [
    { name: '技能名', damage: 1.5, chance: 0.8 }
  ],
  drops: [
    { type: 'gold', chance: 0.9, amount: [40, 60] },
    { type: 'exp', chance: 1.0, amount: [90, 110] }
  ]
}
```

#### 添加新装备
编辑 `data/items.js`，添加新的装备：
```javascript
new_weapon: {
  id: 'new_weapon',
  name: '武器名称',
  type: 'weapon', // or 'armor', 'accessory'
  rarity: 'rare', // common, uncommon, rare, epic, legendary
  description: '武器描述',
  attack: 50,
  price: 2000
}
```

#### 添加新地下城
编辑 `data/dungeons.js`，添加新的地下城：
```javascript
6: {
  id: 6,
  name: '新地下城',
  description: '地下城描述',
  level: 20,
  floor: 20,
  monsters: ['skeleton_1', 'zombie_1'],
  boss: 'boss_new',
  bossAt: 20,
  reward: {
    exp: 5000,
    gold: 3000,
    items: ['potion_large']
  }
}
```

### 美术资源

当前使用 Canvas 绘制临时的方块风格角色。如需替换为美术资源：

1. 准备图片资源，放入 `assets/` 目录
2. 在页面中使用 `<image>` 标签替代 Canvas
3. 或修改 `utils/canvas-draw.js` 使用 `drawImage` 方法

### 常见问题

**Q: 如何重置游戏进度？**
A: 清除小程序缓存，或在 `app.js` 的 `loadGame()` 中删除存储数据

**Q: 如何调整战斗难度？**
A: 修改 `data/monsters.js` 中怪物的属性值

**Q: 如何添加新技能？**
A: 在 `data/monsters.js` 中添加技能配置，在 `utils/battle-system.js` 中实现技能逻辑

## 许可证

本项目仅供学习交流使用。

---

祝你在游戏开发的道路上越走越远！🎮
