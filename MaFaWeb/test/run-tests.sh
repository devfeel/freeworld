#!/bin/bash
# 测试执行脚本 for Linux/Mac
# 地下城传说 - 自动化测试运行器

echo "=========================================="
echo "   地下城传说 - 自动化测试运行器"
echo "=========================================="
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误] 未检测到 Node.js，请先安装 Node.js 18.x 或更高版本${NC}"
    exit 1
fi

echo -e "${GREEN}[信息] Node.js 版本: $(node --version)${NC}"
echo

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[信息] 首次运行，正在安装依赖...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[错误] 依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}[成功] 依赖安装完成${NC}"
    echo
fi

# 显示菜单
show_menu() {
    echo "请选择要运行的测试类型："
    echo
    echo "  [1] 运行所有测试"
    echo "  [2] 运行单元测试"
    echo "  [3] 运行集成测试"
    echo "  [4] 生成覆盖率报告"
    echo "  [5] 监听模式 (开发时使用)"
    echo "  [6] 显示帮助信息"
    echo "  [0] 退出"
    echo
}

# 显示帮助
show_help() {
    echo
    echo "=========================================="
    echo "   测试脚本使用帮助"
    echo "=========================================="
    echo
    echo "用法: ./run-tests.sh [选项]"
    echo
    echo "选项:"
    echo "  all         运行所有测试"
    echo "  unit        只运行单元测试"
    echo "  integration 只运行集成测试"
    echo "  coverage    生成覆盖率报告"
    echo "  watch       监听模式，自动运行修改的测试"
    echo "  help        显示此帮助信息"
    echo
    echo "示例:"
    echo "  ./run-tests.sh all"
    echo "  ./run-tests.sh unit"
    echo "  ./run-tests.sh coverage"
    echo
    echo "测试目录结构:"
    echo "  test/"
    echo "  ├── unit/           # 单元测试"
    echo "  ├── integration/    # 集成测试"
    echo "  ├── plan/           # 测试计划和用例"
    echo "  └── coverage/       # 覆盖率报告 (生成后)"
    echo
}

# 运行所有测试
run_all() {
    echo
    echo "=========================================="
    echo "   运行所有测试"
    echo "=========================================="
    npm test
}

# 运行单元测试
run_unit() {
    echo
    echo "=========================================="
    echo "   运行单元测试"
    echo "=========================================="
    npm run test:unit
}

# 运行集成测试
run_integration() {
    echo
    echo "=========================================="
    echo "   运行集成测试"
    echo "=========================================="
    npm run test:integration
}

# 生成覆盖率报告
run_coverage() {
    echo
    echo "=========================================="
    echo "   生成覆盖率报告"
    echo "=========================================="
    npm run test:coverage
    echo
    echo -e "${GREEN}[信息] 覆盖率报告已生成在 coverage/ 目录下${NC}"
    echo -e "${GREEN}[信息] 打开 coverage/lcov-report/index.html 查看详细报告${NC}"

    # 尝试自动打开报告
    if command -v open &> /dev/null; then
        open coverage/lcov-report/index.html
    elif command -v xdg-open &> /dev/null; then
        xdg-open coverage/lcov-report/index.html
    fi
}

# 监听模式
run_watch() {
    echo
    echo "=========================================="
    echo "   监听模式 - 自动运行修改的测试"
    echo "=========================================="
    echo "[提示] 按 Ctrl+C 停止监听"
    npm run test:watch
}

# 主逻辑
case "${1:-}" in
    all)
        run_all
        ;;
    unit)
        run_unit
        ;;
    integration)
        run_integration
        ;;
    coverage)
        run_coverage
        ;;
    watch)
        run_watch
        ;;
    help)
        show_help
        ;;
    *)
        # 交互式菜单
        while true; do
            show_menu
            read -p "请输入选项 (0-6): " choice

            case $choice in
                1) run_all; break ;;
                2) run_unit; break ;;
                3) run_integration; break ;;
                4) run_coverage; break ;;
                5) run_watch; break ;;
                6) show_help ;;
                0) exit 0 ;;
                *) echo -e "${RED}无效选项，请重新输入${NC}" ;;
            esac
        done
        ;;
esac

echo
echo "=========================================="
echo "   测试执行完成"
echo "=========================================="
echo

# 检查退出码
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[警告] 测试执行过程中出现错误${NC}"
fi

exit $?
