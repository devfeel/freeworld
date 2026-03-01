@echo off
REM 测试执行脚本 for Windows
REM 地下城传说 - 自动化测试运行器

echo ==========================================
echo    地下城传说 - 自动化测试运行器
echo ==========================================
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18.x 或更高版本
    exit /b 1
)

echo [信息] Node.js 版本:
node --version
echo.

REM 进入测试目录
cd /d "%~dp0"

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        exit /b 1
    )
    echo [成功] 依赖安装完成
    echo.
)

REM 解析命令行参数
if "%~1"=="" goto :menu
if "%~1"=="all" goto :run_all
if "%~1"=="unit" goto :run_unit
if "%~1"=="integration" goto :run_integration
if "%~1"=="coverage" goto :run_coverage
if "%~1"=="watch" goto :run_watch
if "%~1"=="help" goto :show_help
goto :menu

:menu
echo 请选择要运行的测试类型：
echo.
echo   [1] 运行所有测试 (npm test)
echo   [2] 运行单元测试
echo   [3] 运行集成测试
echo   [4] 生成覆盖率报告
echo   [5] 监听模式 (开发时使用)
echo   [6] 显示帮助信息
echo   [0] 退出
echo.
set /p choice="请输入选项 (0-6): "

if "%choice%"=="1" goto :run_all
if "%choice%"=="2" goto :run_unit
if "%choice%"=="3" goto :run_integration
if "%choice%"=="4" goto :run_coverage
if "%choice%"=="5" goto :run_watch
if "%choice%"=="6" goto :show_help
if "%choice%"=="0" exit /b 0
goto :menu

:run_all
echo.
echo ==========================================
echo    运行所有测试
echo ==========================================
npm test
goto :end

:run_unit
echo.
echo ==========================================
echo    运行单元测试
echo ==========================================
npm run test:unit
goto :end

:run_integration
echo.
echo ==========================================
echo    运行集成测试
echo ==========================================
npm run test:integration
goto :end

:run_coverage
echo.
echo ==========================================
echo    生成覆盖率报告
echo ==========================================
npm run test:coverage
echo.
echo [信息] 覆盖率报告已生成在 coverage/ 目录下
echo [信息] 打开 coverage/lcov-report/index.html 查看详细报告
goto :end

:run_watch
echo.
echo ==========================================
echo    监听模式 - 自动运行修改的测试
echo ==========================================
echo [提示] 按 Ctrl+C 停止监听
npm run test:watch
goto :end

:show_help
echo.
echo ==========================================
echo    测试脚本使用帮助
echo ==========================================
echo.
echo 用法: run-tests.bat [选项]
echo.
echo 选项:
echo   all         运行所有测试
echo   unit        只运行单元测试
echo   integration 只运行集成测试
echo   coverage    生成覆盖率报告
echo   watch       监听模式，自动运行修改的测试
echo   help        显示此帮助信息
echo.
echo 示例:
echo   run-tests.bat all
echo   run-tests.bat unit
echo   run-tests.bat coverage
echo.
echo 测试目录结构:
echo   test/
echo   ├── unit/           # 单元测试
echo   ├── integration/    # 集成测试
echo   ├── plan/           # 测试计划和用例
echo   └── coverage/       # 覆盖率报告 (生成后)
echo.
goto :end

:end
echo.
echo ==========================================
echo    测试执行完成
echo ==========================================
echo.

REM 如果有错误，暂停显示
if errorlevel 1 (
    echo [警告] 测试执行过程中出现错误
    pause
)

exit /b %errorlevel%
