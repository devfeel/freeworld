package main

import "time"

// Response 标准响应
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

// User 用户
type User struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Player 玩家
type Player struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Name      string    `json:"name"`
	Gold      int64     `json:"gold"`
	Yuanbao   int64     `json:"yuanbao"`
	Level     int       `json:"level"`
	Exp       int64     `json:"exp"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Hero 角色
type Hero struct {
	ID          int64   `json:"id"`
	PlayerID    int64   `json:"player_id"`
	Name        string  `json:"name"`
	Class       string  `json:"class"` // 战士/法师/道士
	Level       int     `json:"level"`
	HP          int     `json:"hp"`
	MaxHP       int     `json:"max_hp"`
	MP          int     `json:"mp"`
	MaxMP       int     `json:"max_mp"`
	Attack      int     `json:"attack"`
	Defense     int     `json:"defense"`
	MagicAttack int     `json:"magic_attack"`
	Speed       int     `json:"speed"`
	Crit        int     `json:"crit"`
	Dodge       int     `json:"dodge"`
	Skills      []int64 `json:"skills"`
	Weapon       int64   `json:"weapon"`
	Armor       int64   `json:"armor"`
	Helmet      int64   `json:"helmet"`
	Boots       int64   `json:"boots"`
	Shield      int64   `json:"shield"`
	Necklace    int64   `json:"necklace"`
	Ring1       int64   `json:"ring1"`
	Ring2       int64   `json:"ring2"`
	Belt        int64   `json:"belt"`
	Bracer      int64   `json:"bracer"`
}

// Item 物品
type Item struct {
	ID          int64             `json:"id"`
	Name        string            `json:"name"`
	Type        string            `json:"type"` // weapon/armor/potion/material
	SubType     string            `json:"sub_type"`
	Level       int               `json:"level"`
	Rarity      int               `json:"rarity"` // 1-8
	Price       int64             `json:"price"`
	Attack      int               `json:"attack"`
	Defense     int               `json:"defense"`
	HPBonus     int               `json:"hp_bonus"`
	MPBonus     int               `json:"mp_bonus"`
	MagicAttack int               `json:"magic_attack"`
	Stats       map[string]int    `json:"stats"`
	Description string            `json:"description"`
	Icon        string            `json:"icon"`
}

// BagItem 背包物品
type BagItem struct {
	ID     int64 `json:"id"`
	ItemID int64 `json:"item_id"`
	Count  int   `json:"count"`
}

// Bag 背包
type Bag struct {
	ID       int64      `json:"id"`
	PlayerID int64      `json:"player_id"`
	Items    []BagItem  `json:"items"`
	Capacity int        `json:"capacity"`
	Used     int        `json:"used"`
}

// ShopItem 商品
type ShopItem struct {
	ItemID   int64 `json:"item_id"`
	Price    int64 `json:"price"`
	Stock    int   `json:"stock"` // -1 表示无限
	Discount int   `json:"discount"` // 100=原价
}

// Shop 商品列表
type Shop struct {
	Items []ShopItem `json:"items"`
}

// Dungeon 副本
type Dungeon struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Difficulty  int      `json:"difficulty"` // 1-5
	Levels      int      `json:"levels"`
	Monsters    []int64  `json:"monsters"`
	RequireLevel int     `json:"require_level"`
	EntryFee    int64    `json:"entry_fee"`
}

// Monster 怪物
type Monster struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Level       int    `json:"level"`
	HP          int    `json:"hp"`
	Attack      int    `json:"attack"`
	Defense     int    `json:"defense"`
	MagicAttack int    `json:"magic_attack"`
	Speed       int    `json:"speed"`
	Crit        int    `json:"crit"`
	Dodge       int    `json:"dodge"`
	IsBoss     bool   `json:"is_boss"`
	Exp         int64  `json:"exp"`
	Gold        int64  `json:"gold"`
	Drops       []int64 `json:"drops"`
}

// Battle 战斗
type Battle struct {
	ID          int64     `json:"id"`
	PlayerID    int64     `json:"player_id"`
	DungeonID   int64     `json:"dungeon_id"`
	MonsterID   int64     `json:"monster_id"`
	Status      string    `json:"status"` // fighting/won/lost
	HeroHP      int       `json:"hero_hp"`
	MonsterHP   int       `json:"monster_hp"`
	Round       int       `json:"round"`
	StartTime   time.Time `json:"start_time"`
}

// RankItem 排行榜项
type RankItem struct {
	Rank    int    `json:"rank"`
	PlayerID int64  `json:"player_id"`
	Name     string `json:"name"`
	Level    int    `json:"level"`
	Power    int64  `json:"power"`
	Class    string `json:"class"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Class    string `json:"class"` // 战士/法师/道士
}

// PlayerUpdateRequest 玩家更新请求
type PlayerUpdateRequest struct {
	Name string `json:"name"`
}

// EquipRequest 穿戴装备请求
type EquipRequest struct {
	ItemID int64 `json:"item_id"`
	Slot   string `json:"slot"` // weapon/armor/helmet/etc
}

// UseItemRequest 使用物品请求
type UseItemRequest struct {
	ItemID int64 `json:"item_id"`
}

// BuyItemRequest 购买物品请求
type BuyItemRequest struct {
	ItemID int64 `json:"item_id"`
	Count  int   `json:"count"`
}

// EnterDungeonRequest 进入副本请求
type EnterDungeonRequest struct {
	DungeonID int64 `json:"dungeon_id"`
	Floor     int   `json:"floor"`
}

// StartBattleRequest 开始战斗请求
type StartBattleRequest struct {
	DungeonID int64 `json:"dungeon_id"`
	Floor     int   `json:"floor"`
	MonsterID int64 `json:"monster_id"`
}

// AttackRequest 攻击请求
type AttackRequest struct {
	BattleID int64 `json:"battle_id"`
}

// UseSkillRequest 技能请求
type UseSkillRequest struct {
	BattleID int64 `json:"battle_id"`
	SkillID  int64 `json:"skill_id"`
}

// BattleResultRequest 战斗结果请求
type BattleResultRequest struct {
	BattleID int64 `json:"battle_id"`
	Win      bool  `json:"win"`
}
