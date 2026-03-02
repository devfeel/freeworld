package main

import (
	"github.com/devfeel/dotweb"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

// InitRouters 初始化所有路由
func InitRouters(app *dotweb.DotWeb) {
	jwtMiddleware := NewJWTMiddleware(jwtSecret, jwtExpire)
	
	// 路由组
	apiGroup := app.HttpServer.Group("/api")
	
	// 认证路由 (不需要认证)
	authGroup := apiGroup.Group("/auth")
	authGroup.POST("/register", RegisterHandler)
	authGroup.POST("/login", LoginHandler)
	authGroup.POST("/logout", LogoutHandler)
	
	// 需要认证的路由
	protectedGroup := apiGroup.Group("")
	protectedGroup.Use(jwtMiddleware)
	
	// 玩家路由
	protectedGroup.GET("/player/info", GetPlayerInfoHandler)
	protectedGroup.POST("/player/update", UpdatePlayerHandler)
	protectedGroup.POST("/player/heartbeat", PlayerHeartbeatHandler)
	
	// 角色路由
	protectedGroup.GET("/hero/info", GetHeroInfoHandler)
	protectedGroup.POST("/hero/equip", EquipHandler)
	protectedGroup.POST("/hero/unequip", UnequipHandler)
	
	// 背包路由
	protectedGroup.GET("/bag/list", GetBagListHandler)
	protectedGroup.POST("/bag/use", UseItemHandler)
	protectedGroup.POST("/bag/delete", DeleteItemHandler)
	
	// 商店路由
	protectedGroup.GET("/shop/list", GetShopListHandler)
	protectedGroup.POST("/shop/buy", BuyItemHandler)
	
	// 排行榜路由
	protectedGroup.GET("/rank/list", GetRankListHandler)
	
	// 副本路由
	protectedGroup.GET("/dungeon/list", GetDungeonListHandler)
	protectedGroup.GET("/dungeon/detail", GetDungeonDetailHandler)
	protectedGroup.POST("/dungeon/enter", EnterDungeonHandler)
	protectedGroup.POST("/dungeon/explore", ExploreDungeonHandler)
	
	// 战斗路由
	protectedGroup.POST("/battle/start", StartBattleHandler)
	protectedGroup.POST("/battle/attack", AttackHandler)
	protectedGroup.POST("/battle/skill", UseSkillHandler)
	protectedGroup.POST("/battle/defend", DefendHandler)
	protectedGroup.POST("/battle/run", RunAwayHandler)
	protectedGroup.POST("/battle/result", BattleResultHandler)
	
	// 经验路由
	protectedGroup.GET("/exp/info", GetExpInfoHandler)
	protectedGroup.GET("/exp/remaining", GetExpRemainingHandler)
	
	app.Logger().Debug("All routes initialized", "MaFaServer")
}

// JWTMiddleware JWT认证中间件
func NewJWTMiddleware(secret []byte, expire time.Duration) dotweb.Middleware {
	return &JWTMiddleware{
		secret: secret,
		expire: expire,
	}
}

type JWTMiddleware struct {
	dotweb.BaseMiddleware
	secret []byte
	expire time.Duration
}

func (m *JWTMiddleware) Handle(ctx dotweb.Context) error {
	// 获取 token
	authHeader := ctx.Request().QueryHeader("Authorization")
	if authHeader == "" {
		return ctx.WriteJson(Response{Code: 401, Msg: "Unauthorized"})
	}
	
	// 解析 Bearer token
	token := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token = authHeader[7:]
	}
	
	// 验证 token
	tokenPart, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return m.secret, nil
	})
	
	if err != nil || !tokenPart.Valid {
		return ctx.WriteJson(Response{Code: 401, Msg: "Invalid token"})
	}
	
	// 提取 user_id
	claims, ok := tokenPart.Claims.(jwt.MapClaims)
	if !ok {
		return ctx.WriteJson(Response{Code: 401, Msg: "Invalid token claims"})
	}
	
	// 将用户ID存入 context
	if userID, ok := claims["user_id"].(float64); ok {
		ctx.Items().Set("user_id", int64(userID))
	}
	
	return m.Next(ctx)
}
