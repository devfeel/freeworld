# 地下城传说 - 自动化测试套件

## 快速开始

### Windows 系统
```bash
cd test
run-tests.bat
```

### Linux/Mac 系统
```bash
cd test
chmod +x run-tests.sh
./run-tests.sh
```

## 测试结构

```
test/
├── plan/                          # 测试计划和用例
│   ├── TEST_PLAN.md              # 测试计划文档
│   └── TEST_CASES.md             # 详细测试用例
├── unit/                          # 单元测试
│   ├── game-utils.test.js        # 游戏工具函数测试
│   ├── battle-system.test.js     # 战斗系统测试
│   ├── equipment-system.test.js  # 装备系统测试
│   ├── enhance-system.test.js    # 强化系统测试
│   ├── app-core.test.js          # 应用核心测试
│   └── data-validation.test.js   # 数据验证测试
├── integration/                   # 集成测试
│   ├── inventory-integration.test.js  # 背包集成测试
│   └── battle-flow.test.js       # 战斗流程测试
├── setup.js                       # 测试环境初始化
├── package.json                   # 测试依赖配置
├── run-tests.bat                  # Windows 测试脚本
├── run-tests.sh                   # Linux/Mac 测试脚本
└── README.md                      # 本文件
```

## 运行测试

### 运行所有测试
```bash
npm test
# 或
./run-tests.sh all
```

### 运行单元测试
```bash
npm run test:unit
# 或
./run-tests.sh unit
```

### 运行集成测试
```bash
npm run test:integration
# 或
./run-tests.sh integration
```

### 生成覆盖率报告
```bash
npm run test:coverage
# 或
./run-tests.sh coverage
```
报告生成在 `coverage/lcov-report/index.html`

### 监听模式（开发时使用）
```bash
npm run test:watch
# 或
./run-tests.sh watch
```

## 测试覆盖范围

### 单元测试
- ✅ 游戏工具函数 (game-utils.js)
  - 随机数生成
  - 伤害计算
  - 闪避检查
  - 数字格式化
  - 节流/防抖函数

- ✅ 战斗系统 (battle-system.js)
  - 战斗初始化
  - 回合顺序
  - 攻击逻辑
  - 技能系统
  - 逃跑机制
  - 战斗结算

- ✅ 装备系统
  - 装备穿戴/卸下
  - 等级/职业限制
  - 属性计算
  - 套装效果

- ✅ 强化系统
  - 强化成功率
  - 资源消耗
  - 失败惩罚
  - 属性提升

### 集成测试
- ✅ 背包系统
  - 添加/移除物品
  - 堆叠逻辑
  - 使用消耗品
  - 出售物品
  - 背包整理

- ✅ 战斗流程
  - 完整战斗流程
  - 多回合交互
  - 经验值获取
  - 掉落处理

## 添加新测试

### 1. 创建测试文件
在 `test/unit/` 或 `test/integration/` 目录下创建 `.test.js` 文件：

```javascript
describe('功能名称', () => {
  beforeEach(() => {
    // 测试前准备
  });

  test('测试用例描述', () => {
    // 测试代码
    expect(result).toBe(expected);
  });
});
```

### 2. 使用测试工具

#### Mock 英雄数据
```javascript
const hero = testUtils.createMockHero({
  level: 10,
  attack: 50,
  // ... 其他属性
});
```

#### Mock 物品数据
```javascript
const item = testUtils.createMockItem({
  id: 'test_item',
  type: 'weapon',
  // ... 其他属性
});
```

#### 固定随机种子
```javascript
testUtils.setRandomSeed(12345);
// 执行随机操作
```

#### Mock 微信 API
```javascript
// 存储模拟
wx.setStorageSync('key', data);
const data = wx.getStorageSync('key');

// Toast 模拟
expect(wx.showToast).toHaveBeenCalled();
```

## 测试规范

### 命名规范
- 测试文件：`*.test.js`
- 测试套件：`describe('功能模块', () => {})`
- 测试用例：`test('应...当...', () => {})`

### 断言风格
```javascript
// 基本相等
expect(value).toBe(expected);

// 对象相等
expect(object).toEqual(expected);

// 真值检查
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// 范围检查
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);

// 包含检查
expect(array).toContain(item);
expect(string).toContain(substring);

// 异常检查
expect(() => fn()).toThrow();

// Mock 检查
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(3);
```

## 持续集成

可以将测试集成到 CI/CD 流程中：

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd test && npm install
      - run: cd test && npm test
```

## 常见问题

### 1. 测试失败：找不到模块
确保所有依赖已安装：
```bash
cd test
npm install
```

### 2. 随机测试不稳定
使用固定随机种子：
```javascript
testUtils.setRandomSeed(12345);
```

### 3. 需要模拟微信小程序 API
所有微信 API 已在 `setup.js` 中自动 Mock，直接使用即可。

### 4. 覆盖率不达标
检查 `package.json` 中的 `collectCoverageFrom` 配置，确保包含要测试的文件。

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-02-27 | 1.0.0 | 初始版本，包含核心功能测试 |
