package main

import (
	"github.com/devfeel/dotweb"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"strconv"
	"sync"
	"time"
)

// 内存存储 (演示用)
var (
	userStore    = make(map[int64]*User)
	playerStore  = make(map[int64]*Player)
	heroStore    = make(map[int64]*Hero)
	bagStore     = make(map[int64]*Bag)
	battleStore  = make(map[int64]*Battle)
	itemStore    = make(map[int64]*Item)
	dungeonStore = make(map[int64]*Dungeon)
	monsterStore = make(map[int64]*Monster)
	shopStore    = make(map[int64]*ShopItem)
	
	userIDCounter    int64 = 1
	playerIDCounter  int64 = 1
	heroIDCounter   int64 = 1
	bagIDCounter    int64 = 1
	battleIDCounter int64 = 1
	
	storeMutex sync.RWMutex
	
	jwtSecret = []byte("mafagame-secret-key-2024")
	jwtExpire = 7 * 24 * time.Hour
)

// 初始化测试数据
func initTestData() {
	// 初始化物品
	items := []*Item{
		{ID: 1, Name: "新手剑", Type: "weapon", SubType: "sword", Level: 1, Rarity: 1, Price: 100, Attack: 5},
		{ID: 2, Name: "新手甲", Type: "armor", SubType: "chest", Level: 1, Rarity: 1, Price: 100, Defense: 5},
		{ID: 3, Name: "生命药水", Type: "potion", SubType: "hp", Level: 1, Rarity: 1, Price: 10, HPBonus: 50},
		{ID: 4, Name: "魔法药水", Type: "potion", SubType: "mp", Level: 1, Rarity: 1, Price: 10, MPBonus: 30},
		{ID: 5, Name: "战士剑", Type: "weapon", SubType: "sword", Level: 10, Rarity: 2, Price: 1000, Attack: 25},
		{ID: 6, Name: "法师杖", Type: "weapon", SubType: "staff", Level: 10, Rarity: 2, Price: 1000, MagicAttack: 30},
		{ID: 7, Name: "精良战甲", Type: "armor", SubType: "chest", Level: 10, Rarity: 3, Price: 2000, Defense: 20},
	}
	for _, item := range items {
		itemStore[item.ID] = item
	}
	
	// 初始化副本
	dungeons := []*Dungeon{
		{ID: 1, Name: "比奇省", Description: "新手副本", Difficulty: 1, Levels: 10, RequireLevel: 1, EntryFee: 0},
		{ID: 2, Name: "盟重省", Description: "中级副本", Difficulty: 2, Levels: 20, RequireLevel: 10, EntryFee: 100},
		{ID: 3, Name: "苍月岛", Description: "高级副本", Difficulty: 3, Levels: 30, RequireLevel: 20, EntryFee: 500},
		{ID: 4, Name: "牛魔寺", Description: "专家副本", Difficulty: 4, Levels: 40, RequireLevel: 30, EntryFee: 1000},
		{ID: 5, Name: "赤月峡谷", Description: "大师副本", Difficulty: 5, Levels: 50, RequireLevel: 40, EntryFee: 2000},
	}
	for _, d := range dungeons {
		dungeonStore[d.ID] = d
	}
	
	// 初始化怪物
	monsters := []*Monster{
		{ID: 1, Name: "鸡", Level: 1, HP: 10, Attack: 1, Defense: 0, Exp: 5, Gold: 1},
		{ID: 2, Name: "鹿", Level: 2, HP: 20, Attack: 2, Defense: 1, Exp: 10, Gold: 2},
		{ID: 3, Name: "半兽战士", Level: 5, HP: 50, Attack: 5, Defense: 3, Exp: 30, Gold: 10},
		{ID: 4, Name: "半兽勇士", Level: 10, HP: 100, Attack: 10, Defense: 5, Exp: 80, Gold: 30},
		{ID: 5, Name: "沃玛教主", Level: 20, HP: 500, Attack: 30, Defense: 15, Exp: 500, Gold: 100},
		{ID: 6, Name: "祖玛教主", Level: 30, HP: 1000, Attack: 50, Defense: 25, Exp: 1000, Gold: 200},
		{ID: 7, Name: "赤月恶魔", Level: 40, HP: 2000, Attack: 80, Defense: 40, Exp: 2000, Gold: 500},
	}
	for _, m := range monsters {
		monsterStore[m.ID] = m
	}
	
	// 初始化商店
	shopItems := []ShopItem{
		{ItemID: 1, Price: 100, Stock: -1},
		{ItemID: 2, Price: 100, Stock: -1},
		{ItemID: 3, Price: 10, Stock: -1},
		{ItemID: 4, Price: 10, Stock: -1},
		{ItemID: 5, Price: 1000, Stock: -1},
		{ItemID: 6, Price: 1000, Stock: -1},
		{ItemID: 7, Price: 2000, Stock: -1},
	}
	for i, item := range shopItems {
		shopStore[int64(i+1)] = &item
	}
}

func init() {
	initTestData()
}

// ==================== 认证 handlers ====================

// RegisterHandler 注册
func RegisterHandler(ctx dotweb.Context) error {
	var req RegisterRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	if req.Username == "" || req.Password == "" {
		return ctx.WriteJson(Response{Code: 1, Msg: "Username and password required"})
	}
	
	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Server error"})
	}
	
	// 创建用户
	storeMutex.Lock()
	user := &User{
		ID:        userIDCounter,
		Username:  req.Username,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	userStore[user.ID] = user
	userIDCounter++
	
	// 创建玩家
	player := &Player{
		ID:        playerIDCounter,
		UserID:    user.ID,
		Name:      req.Name,
		Gold:      1000, // 初始金币
		Yuanbao:   0,
		Level:     1,
		Exp:       0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	playerStore[player.ID] = player
	playerIDCounter++
	
	// 创建角色
	hero := &Hero{
		ID:          heroIDCounter,
		PlayerID:    player.ID,
		Name:        req.Name,
		Class:       req.Class,
		Level:       1,
		HP:          100,
		MaxHP:       100,
		MP:          50,
		MaxMP:       50,
		Attack:      10,
		Defense:     5,
		MagicAttack: 0,
		Speed:       10,
		Crit:        5,
		Dodge:       3,
		Skills:      []int64{1},
	}
	heroStore[hero.ID] = hero
	heroIDCounter++
	
	// 创建背包
	bag := &Bag{
		ID:       bagIDCounter,
		PlayerID: player.ID,
		Items:    []BagItem{{ID: 1, ItemID: 1, Count: 1}},
		Capacity: 50,
		Used:     1,
	}
	bagStore[player.ID] = bag
	bagIDCounter++
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"player_id": player.ID,
			"name":      player.Name,
		},
	})
}

// LoginHandler 登录
func LoginHandler(ctx dotweb.Context) error {
	var req LoginRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.RLock()
	var user *User
	var userID int64
	for id, u := range userStore {
		if u.Username == req.Username {
			user = u
			userID = id
			break
		
		}
	}
	storeMutex.RUnlock()
	
	if user == nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "User not found"})
	}
	
	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid password"})
	}
	
	// 生成 JWT token
	claims := jwt.MapClaims{
		"user_id":  float64(userID),
		"username": user.Username,
		"exp":      time.Now().Add(jwtExpire).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Generate token failed"})
	}
	
	// 找到玩家
	var player *Player
	for _, p := range playerStore {
		if p.UserID == userID {
			player = p
			break
		
		}
	}
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"token":     tokenString,
			"player_id": player.ID,
			"name":      player.Name,
		},
	})
}

// LogoutHandler 登出
func LogoutHandler(ctx dotweb.Context) error {
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// ==================== 玩家 handlers ====================

// GetPlayerInfoHandler 获取玩家信息
func GetPlayerInfoHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	if playerID == 0 {
		return ctx.WriteJson(Response{Code: 1, Msg: "Unauthorized"})
	}
	
	storeMutex.RLock()
	player, ok := playerStore[playerID]
	hero := heroStore[playerID]
	storeMutex.RUnlock()
	
	if !ok {
		return ctx.WriteJson(Response{Code: 1, Msg: "Player not found"})
	}
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"player": player,
			"hero":   hero,
		},
	})
}

// UpdatePlayerHandler 更新玩家
func UpdatePlayerHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	if playerID == 0 {
		return ctx.WriteJson(Response{Code: 1, Msg: "Unauthorized"})
	}
	
	var req PlayerUpdateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	if player, ok := playerStore[playerID]; ok {
		if req.Name != "" {
			player.Name = req.Name
		}
		player.UpdatedAt = time.Now()
	}
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// PlayerHeartbeatHandler 心跳
func PlayerHeartbeatHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	if playerID == 0 {
		return ctx.WriteJson(Response{Code: 1, Msg: "Unauthorized"})
	}
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"timestamp": time.Now().Unix(),
		},
	})
}

// ==================== 角色 handlers ====================

// GetHeroInfoHandler 获取角色信息
func GetHeroInfoHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	storeMutex.RLock()
	hero, ok := heroStore[playerID]
	storeMutex.RUnlock()
	
	if !ok {
		return ctx.WriteJson(Response{Code: 1, Msg: "Hero not found"})
	}
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success", Data: hero})
}

// EquipHandler 穿戴装备
func EquipHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req EquipRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	hero, ok := heroStore[playerID]
	if !ok {
		storeMutex.Unlock()
		return ctx.WriteJson(Response{Code: 1, Msg: "Hero not found"})
	}
	
	// 检查背包是否有这个装备
	bag := bagStore[playerID]
	hasItem := false
	for _, item := range bag.Items {
		if item.ItemID == req.ItemID {
			hasItem = true
			break
		
		}
	}
	if !hasItem {
		storeMutex.Unlock()
		return ctx.WriteJson(Response{Code: 1, Msg: "Item not in bag"})
	}
	
	// 穿戴装备
	switch req.Slot {
	case "weapon":
		hero.Weapon = req.ItemID
	case "armor":
		hero.Armor = req.ItemID
	case "helmet":
		hero.Helmet = req.ItemID
	case "boots":
		hero.Boots = req.ItemID
	case "shield":
		hero.Shield = req.ItemID
	case "necklace":
		hero.Necklace = req.ItemID
	case "ring1":
		hero.Ring1 = req.ItemID
	case "ring2":
		hero.Ring2 = req.ItemID
	case "belt":
		hero.Belt = req.ItemID
	case "bracer":
		hero.Bracer = req.ItemID
	}
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// UnequipHandler 卸下装备
func UnequipHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req EquipRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	hero, ok := heroStore[playerID]
	if !ok {
		storeMutex.Unlock()
		return ctx.WriteJson(Response{Code: 1, Msg: "Hero not found"})
	}
	
	// 卸下装备
	switch req.Slot {
	case "weapon":
		hero.Weapon = 0
	case "armor":
		hero.Armor = 0
	case "helmet":
		hero.Helmet = 0
	case "boots":
		hero.Boots = 0
	case "shield":
		hero.Shield = 0
	case "necklace":
		hero.Necklace = 0
	case "ring1":
		hero.Ring1 = 0
	case "ring2":
		hero.Ring2 = 0
	case "belt":
		hero.Belt = 0
	case "bracer":
		hero.Bracer = 0
	}
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// ==================== 背包 handlers ====================

// GetBagListHandler 获取背包列表
func GetBagListHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	storeMutex.RLock()
	bag, ok := bagStore[playerID]
	storeMutex.RUnlock()
	
	if !ok {
		return ctx.WriteJson(Response{Code: 1, Msg: "Bag not found"})
	}
	
	// 填充物品详情
	type BagItemWithDetail struct {
		ID     int64  `json:"id"`
		ItemID int64  `json:"item_id"`
		Count  int    `json:"count"`
		Item   *Item  `json:"item"`
	}
	
	items := make([]BagItemWithDetail, len(bag.Items))
	for idx, item := range bag.Items {
		items[idx] = BagItemWithDetail{
			ID:     item.ID,
			ItemID: item.ItemID,
			Count:  item.Count,
			Item:   itemStore[item.ItemID],
		}
	}
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"bag": map[string]interface{}{
				"capacity": bag.Capacity,
				"used":     bag.Used,
				"items":    items,
			},
		},
	})
}

// UseItemHandler 使用物品
func UseItemHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req UseItemRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	bag := bagStore[playerID]
	hero := heroStore[playerID]
	
	// 查找物品
	found := false
	foundIdx := -1
	for idx, item := range bag.Items {
		if item.ItemID == req.ItemID {
			found = true
			foundIdx = idx
			itemInfo := itemStore[item.ItemID]
			if itemInfo.Type == "potion" {
				// 使用药水
				if itemInfo.SubType == "hp" {
					hero.HP += itemInfo.HPBonus
					if hero.HP > hero.MaxHP {
						hero.HP = hero.MaxHP
					}
				} else if itemInfo.SubType == "mp" {
					hero.MP += itemInfo.MPBonus
					if hero.MP > hero.MaxMP {
						hero.MP = hero.MaxMP
					}
				}
			}
			// 消耗物品
			item.Count--
			if item.Count <= 0 {
				bag.Items = append(bag.Items[:foundIdx], bag.Items[foundIdx+1:]...)
				bag.Used--
			}
			break
		
		}
	}
	storeMutex.Unlock()
	
	if !found {
		return ctx.WriteJson(Response{Code: 1, Msg: "Item not found"})
	}
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// DeleteItemHandler 删除物品
func DeleteItemHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req UseItemRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	bag := bagStore[playerID]
	
	for idx, item := range bag.Items {
		if item.ItemID == req.ItemID {
			bag.Items = append(bag.Items[:idx], bag.Items[idx+1:]...)
			bag.Used--
			storeMutex.Unlock()
			return ctx.WriteJson(Response{Code: 0, Msg: "success"})
		}
	}
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{Code: 1, Msg: "Item not found"})
}

// ==================== 商店 handlers ====================

// GetShopListHandler 获取商店列表
func GetShopListHandler(ctx dotweb.Context) error {
	storeMutex.RLock()
	items := make([]map[string]interface{}, len(shopStore))
	i := 0
	for _, shopItem := range shopStore {
		item := itemStore[shopItem.ItemID]
		items[i] = map[string]interface{}{
			"id":       shopItem.ItemID,
			"name":     item.Name,
			"type":     item.Type,
			"sub_type": item.SubType,
			"level":    item.Level,
			"rarity":   item.Rarity,
			"price":    shopItem.Price,
			"stock":    shopItem.Stock,
		}
		i++
	}
	storeMutex.RUnlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success", Data: items})
}

// BuyItemHandler 购买物品
func BuyItemHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req BuyItemRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	player := playerStore[playerID]
	bag := bagStore[playerID]
	shopItem := shopStore[req.ItemID]
	itemInfo := itemStore[req.ItemID]
	
	if shopItem == nil || itemInfo == nil {
		storeMutex.Unlock()
		return ctx.WriteJson(Response{Code: 1, Msg: "Item not found"})
	}
	
	totalPrice := shopItem.Price * int64(req.Count)
	if player.Gold < totalPrice {
		storeMutex.Unlock()
		return ctx.WriteJson(Response{Code: 1, Msg: "Not enough gold"})
	}
	
	// 检查背包容量
	if bag.Used+1 > bag.Capacity {
		storeMutex.Unlock()
		return ctx.WriteJson(Response{Code: 1, Msg: "Bag is full"})
	}
	
	// 扣钱
	player.Gold -= totalPrice
	
	// 添加物品到背包
	found := false
	for i := range bag.Items {
		if bag.Items[i].ItemID == req.ItemID {
			bag.Items[i].Count += req.Count
			found = true
			break
		
		}
	}
	if !found {
		bag.Items = append(bag.Items, BagItem{
			ID:     bagIDCounter,
			ItemID: req.ItemID,
			Count:  req.Count,
		})
		bagIDCounter++
		bag.Used++
	}
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// ==================== 排行榜 handlers ====================

// GetRankListHandler 获取排行榜
func GetRankListHandler(ctx dotweb.Context) error {
	storeMutex.RLock()
	ranks := make([]RankItem, 0)
	rank := 1
	for playerID, hero := range heroStore {
		player := playerStore[playerID]
		power := int64(hero.Attack*2 + hero.Defense*2 + hero.HP/10)
		ranks = append(ranks, RankItem{
			Rank:    rank,
			PlayerID: playerID,
			Name:     player.Name,
			Level:    hero.Level,
			Power:    power,
			Class:    hero.Class,
		})
		rank++
	}
	storeMutex.RUnlock()
	
	// 简单排序
	for i := 0; i < len(ranks)-1; i++ {
		for j := i + 1; j < len(ranks); j++ {
			if ranks[i].Power < ranks[j].Power {
				ranks[i], ranks[j] = ranks[j], ranks[i]
				ranks[i].Rank = j + 1
				ranks[j].Rank = i + 1
			}
		}
	}
	
	// 重新设置排名
	for i := range ranks {
		ranks[i].Rank = i + 1
	}
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success", Data: ranks})
}

// ==================== 副本 handlers ====================

// GetDungeonListHandler 获取副本列表
func GetDungeonListHandler(ctx dotweb.Context) error {
	storeMutex.RLock()
	dungeons := make([]*Dungeon, 0, len(dungeonStore))
	for _, d := range dungeonStore {
		dungeons = append(dungeons, d)
	}
	storeMutex.RUnlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success", Data: dungeons})
}

// GetDungeonDetailHandler 获取副本详情
func GetDungeonDetailHandler(ctx dotweb.Context) error {
	dungeonID, _ := strconv.ParseInt(ctx.QueryString("dungeon_id"), 10, 64)
	
	storeMutex.RLock()
	dungeon := dungeonStore[dungeonID]
	storeMutex.RUnlock()
	
	if dungeon == nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Dungeon not found"})
	}
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success", Data: dungeon})
}

// EnterDungeonHandler 进入副本
func EnterDungeonHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req EnterDungeonRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.RLock()
	dungeon := dungeonStore[req.DungeonID]
	player := playerStore[playerID]
	hero := heroStore[playerID]
	storeMutex.RUnlock()
	
	if dungeon == nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Dungeon not found"})
	}
	
	if hero.Level < dungeon.RequireLevel {
		return ctx.WriteJson(Response{Code: 1, Msg: "Level not enough"})
	}
	
	if player.Gold < dungeon.EntryFee {
		return ctx.WriteJson(Response{Code: 1, Msg: "Entry fee not enough"})
	}
	
	storeMutex.Lock()
	player.Gold -= dungeon.EntryFee
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"dungeon_id": req.DungeonID,
			"floor":      req.Floor,
			"entry_fee":  dungeon.EntryFee,
		},
	})
}

// ExploreDungeonHandler 探索副本
func ExploreDungeonHandler(ctx dotweb.Context) error {
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// ==================== 战斗 handlers ====================

// StartBattleHandler 开始战斗
func StartBattleHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	var req StartBattleRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	hero := heroStore[playerID]
	monster := monsterStore[req.MonsterID]
	
	battle := &Battle{
		ID:        battleIDCounter,
		PlayerID:  playerID,
		DungeonID: req.DungeonID,
		MonsterID: req.MonsterID,
		Status:    "fighting",
		HeroHP:    hero.HP,
		MonsterHP: monster.HP,
		Round:     0,
		StartTime: time.Now(),
	}
	battleStore[battle.ID] = battle
	battleIDCounter++
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"battle_id": battle.ID,
			"hero_hp":   hero.HP,
			"monster":   monster,
		},
	})
}

// AttackHandler 攻击
func AttackHandler(ctx dotweb.Context) error {
	var req AttackRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	battle := battleStore[req.BattleID]
	hero := heroStore[battle.PlayerID]
	monster := monsterStore[battle.MonsterID]
	storeMutex.Unlock()
	
	if battle == nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Battle not found"})
	}
	
	// 简单伤害计算
	damage := hero.Attack - monster.Defense/2
	if damage < 1 {
		damage = 1
	}
	battle.MonsterHP -= damage
	battle.Round++
	
	// 怪物反击
	monsterDamage := monster.Attack - hero.Defense/2
	if monsterDamage < 1 {
		monsterDamage = 1
	}
	battle.HeroHP -= monsterDamage
	
	win := battle.MonsterHP <= 0
	lose := battle.HeroHP <= 0
	
	if win {
		battle.Status = "won"
		// 发放奖励
		player := playerStore[hero.PlayerID]
		player.Gold += monster.Gold
		player.Exp += monster.Exp
	}
	
	if lose {
		battle.Status = "lost"
	}
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"battle_id":      battle.ID,
			"hero_hp":        battle.HeroHP,
			"monster_hp":     battle.MonsterHP,
			"damage":         damage,
			"monster_damage": monsterDamage,
			"round":           battle.Round,
			"status":         battle.Status,
			"win":            win,
			"lose":           lose,
		},
	})
}

// UseSkillHandler 使用技能
func UseSkillHandler(ctx dotweb.Context) error {
	var req UseSkillRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	// 简化实现，类似攻击
	return AttackHandler(ctx)
}

// DefendHandler 防御
func DefendHandler(ctx dotweb.Context) error {
	// 防御减伤 50%
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// RunAwayHandler 逃跑
func RunAwayHandler(ctx dotweb.Context) error {
	var req AttackRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	battle := battleStore[req.BattleID]
	battle.Status = "run"
	storeMutex.Unlock()
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success"})
}

// BattleResultHandler 战斗结果
func BattleResultHandler(ctx dotweb.Context) error {
	var req BattleResultRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Invalid request"})
	}
	
	storeMutex.Lock()
	battle := battleStore[req.BattleID]
	storeMutex.Unlock()
	
	if battle == nil {
		return ctx.WriteJson(Response{Code: 1, Msg: "Battle not found"})
	}
	
	return ctx.WriteJson(Response{Code: 0, Msg: "success", Data: battle})
}

// ==================== 经验 handlers ====================

// GetExpInfoHandler 获取经验信息
func GetExpInfoHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	storeMutex.RLock()
	player := playerStore[playerID]
	storeMutex.RUnlock()
	
	// 升级所需经验
	requiredExp := int64(player.Level * player.Level * 100)
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"level":        player.Level,
			"exp":          player.Exp,
			"required_exp": requiredExp,
			"progress":     float64(player.Exp) / float64(requiredExp) * 100,
		},
	})
}

// GetExpRemainingHandler 获取剩余经验
func GetExpRemainingHandler(ctx dotweb.Context) error {
	playerID := int64(ctx.Items().GetInt("player_id"))
	
	storeMutex.RLock()
	player := playerStore[playerID]
	storeMutex.RUnlock()
	
	requiredExp := int64(player.Level * player.Level * 100)
	remaining := requiredExp - player.Exp
	
	return ctx.WriteJson(Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"remaining": remaining,
		},
	})
}
