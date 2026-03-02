package main

import (
	"log"
	"os"
	"strconv"

	"github.com/devfeel/dotweb"
)

func main() {
	// 初始化 DotWeb
	app := dotweb.New()
	
	// 配置
	app.SetDevelopmentMode()
	app.SetLogPath("./logs")
	app.SetEnabledLog(true)
	
	// 初始化路由和处理器
	InitRouters(app)
	
	// 启动服务器
	port := 8080
	if p := os.Getenv("PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}
	
	log.Printf("MaFaServer starting on port %d...", port)
	app.StartServer(port)
}
