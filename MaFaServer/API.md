# MaFaServer API 文档

## 概述

MaFaServer 是为微信小程序 MaFaWeb 设计的游戏后端 API 服务，基于 Go + dotweb 框架开发。

**基础 URL**: `http://localhost:8080`

**认证方式**: JWT Token (Bearer Token)

---

## 响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 0=成功, 其他=错误 |
| msg | string | 消息 |
| data | object | 数据 |

---

## 认证模块

### 注册

```
POST /api/auth/register
```

**请求体**:
```json
{
  "username": "user123",
  "password": "password123",
  "name": "勇士",
  "class": "战士"
}
```

**响应**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "player_id": 1,
    "name": "勇士"
  }
}
```

---

### 登录

```
POST /api/auth/login
```

**请求体**:
```json
{
  "username": "user123",
  "password": "password123"
}
```

**响应**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "player_id": 1,
    "name": "勇士"
  }
}
```

---

### 登出

```
POST /api/auth/logout
```

**请求体**: 无

**响应**: 
```json
{
  "code": 0,
  "msg": "success"
}
```

---

## 玩家模块

### 获取玩家信息

```
GET /api/player/info
```

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "player": {
      "id": 1,
      "name": "勇士",
      "gold": 1000,
      "yuanbao": 0,
      "level": 1,
      "exp": 0
    },
    "hero": {
      "id": 1,
      "name": "勇士",
      "class": "战士",
      "level": 1,
      "hp": 100,
      "max_hp": 100,
      "mp": 50,
      "max_mp": 50,
      "attack": 10,
      "defense": 5
    }
  }
}
```

---

### 更新玩家信息

```
POST /api/player/update
```

**请求体**:
```json
{
  "name": "新名字"
}
```

---

### 心跳

```
POST /api/player/heartbeat
```

---

## 角色模块

### 获取角色信息

```
GET /api/hero/info
```

---

### 穿戴装备

```
POST /api/hero/equip
```

**请求体**:
```json
{
  "item_id": 1,
  "slot": "weapon"
}
```

---

### 卸下装备

```
POST /api/hero/unequip
```

**请求体**:
```json
{
  "item_id": 1,
  "slot": "weapon"
}
```

---

## 背包模块

### 获取背包列表

```
GET /api/bag/list
```

---

### 使用物品

```
POST /api/bag/use
```

**请求体**:
```json
{
  "item_id": 3
}
```

---

### 删除物品

```
POST /api/bag/delete
```

**请求体**:
```json
{
  "item_id": 3
}
```

---

## 商店模块

### 获取商品列表

```
GET /api/shop/list
```

---

### 购买商品

```
POST /api/shop/buy
```

**请求体**:
```json
{
  "item_id": 1,
  "count": 1
}
```

---

## 排行榜模块

### 获取排行榜

```
GET /api/rank/list
```

---

## 副本模块

### 获取副本列表

```
GET /api/dungeon/list
```

---

### 获取副本详情

```
GET /api/dungeon/detail?dungeon_id=1
```

---

### 进入副本

```
POST /api/dungeon/enter
```

**请求体**:
```json
{
  "dungeon_id": 1,
  "floor": 1
}
```

---

### 探索副本

```
POST /api/dungeon/explore
```

---

## 战斗模块

### 开始战斗

```
POST /api/battle/start
```

**请求体**:
```json
{
  "dungeon_id": 1,
  "floor": 1,
  "monster_id": 1
}
```

---

### 攻击

```
POST /api/battle/attack
```

**请求体**:
```json
{
  "battle_id": 1
}
```

---

### 使用技能

```
POST /api/battle/skill
```

**请求体**:
```json
{
  "battle_id": 1,
  "skill_id": 1
}
```

---

### 防御

```
POST /api/battle/defend
```

---

### 逃跑

```
POST /api/battle/run
```

---

### 战斗结果

```
POST /api/battle/result
```

**请求体**:
```json
{
  "battle_id": 1,
  "win": true
}
```

---

## 经验模块

### 获取经验信息

```
GET /api/exp/info
```

---

### 获取剩余经验

```
GET /api/exp/remaining
```

---

## 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
