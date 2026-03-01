# 测试执行指南

## 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

## 安装步骤

1. 进入测试目录：
```bash
cd test
```

2. 安装依赖：
```bash
npm install
```

## 运行测试

### 交互式运行（推荐）
```bash
# Windows
run-tests.bat

# Linux/Mac
./run-tests.sh
```

### 命令行参数运行
```bash
# Windows
run-tests.bat all
run-tests.bat unit
run-tests.bat integration
run-tests.bat coverage

# Linux/Mac
./run-tests.sh all
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh coverage
```

### 直接使用 npm
```bash
# 所有测试
npm test

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 覆盖率
npm run test:coverage

# 监听模式
npm run test:watch
```

## 查看结果

### 控制台输出
测试运行后会显示：
- 测试套件数量
- 通过/失败数量
- 执行时间
- 覆盖率统计

### 覆盖率报告
```bash
npm run test:coverage
```

然后在浏览器中打开：
```
test/coverage/lcov-report/index.html
```

## 故障排除

### 问题1：'jest' 不是内部或外部命令
**解决**：重新安装依赖
```bash
npm install
```

### 问题2：测试超时
**解决**：检查是否有异步操作未正确处理，或增加超时时间：
```javascript
test('长时间测试', async () => {
  // 测试代码
}, 10000); // 10秒超时
```

### 问题3：微信 API Mock 不生效
**解决**：确保测试文件顶部正确引入了模拟环境：
```javascript
// setup.js 会自动在每个测试前运行
// 不需要手动引入
```

## 扩展测试

### 添加新测试文件
1. 在 `test/unit/` 或 `test/integration/` 创建 `.test.js` 文件
2. Jest 会自动发现和运行该文件

### 修改测试配置
编辑 `test/package.json` 中的 `jest` 配置：
```json
{
  "jest": {
    "testMatch": ["**/test/**/*.test.js"],
    "collectCoverageFrom": [
      "utils/**/*.js"
    ]
  }
}
```
