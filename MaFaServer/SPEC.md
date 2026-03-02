# MaFaServer 后端规范文档

## 项目概述
- 项目名称: MaFaServer
- 类型: 微信小程序游戏后端 API 服务
- 技术栈: Go + dotweb

## 功能模块

### 1. 认证模块 (Auth)
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 用户登出

### 2. 玩家模块 (Player)
- GET /api/player/info - 获取玩家信息
- POST /api/player/update - 更新玩家信息
- POST /api/player/heartbeat - 玩家心跳

### 3. 角色模块 (Hero)
- GET /api/hero/info - 获取角色信息
- POST /api/hero/update - 更新角色
- POST /api/hero/equip - 穿戴装备
- POST /api/hero/unequip - 卸下装备

### 4. 背包模块 (Bag)
- GET /api/bag/list - 物品列表
- POST /api/bag/use - 使用物品
- POST /api/bag/delete - 删除物品

### 5. 商店模块 (Shop)
- GET /api/shop/list - 商品列表
- POST /api/shop/buy - 购买商品

### 6. 排行榜模块 (Rank)
- GET /api/rank/list - 排行榜

### 7. 副本模块 (Dungeon)
- GET /api/dungeon/list - 副本列表
- GET /api/dungeon/detail - 副本详情
- POST /api/dungeon/enter - 进入副本
- POST /api/dungeon/explore - 探索副本

### 8. 战斗模块 (Battle)
- POST /api/battle/start - 开始战斗
- POST /api/battle/attack - 攻击
- POST /api/battle/skill - 使用技能
- POST /api/battle/defend - 防御
- POST /api/battle/run - 逃跑
- POST /api/battle/result - 战斗结果

### 9. 经验模块 (Exp)
- GET /api/exp/info - 经验信息
- GET /api/exp/remaining - 剩余经验

## 数据模型

### User (用户)
- id, username, password, created_at, updated_at

### Player (玩家)
- id, user_id, gold, yuanbao, level, exp

### Hero (角色)
- id, player_id, name, class, level, hp, mp, attack, defense, skills

### Item (物品)
- id, name, type, rarity, level, stats

### Bag (背包)
- id, player_id, items[]

### Dungeon (副本)
- id, name, difficulty, monsters[]

### Battle (战斗)
- id, player_id, dungeon_id, enemy_id, status

## 认证
- JWT Token
- Header: Authorization: Bearer <token>

## 响应格式
{
  "code": 0,
  "msg": "success",
  "data": {}
}
