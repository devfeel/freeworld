# 地下城传说 - 测试套件总结

## 项目测试结构

```
D:\AICode\MaFaGame\MaFaWeb\test/
├── README.md                      # 测试套件说明文档
├── QUICKSTART.md                  # 快速开始指南
├── package.json                   # npm 配置和依赖
├── setup.js                       # Jest 环境初始化
├── run-tests.bat                  # Windows 测试脚本 ⭐
├── run-tests.sh                   # Linux/Mac 测试脚本 ⭐
│
├── plan/                          # 📋 测试计划和用例
│   ├── TEST_PLAN.md              # 测试计划文档
│   └── TEST_CASES.md             # 详细测试用例 (50+ 条)
│
├── unit/                          # 🔬 单元测试
│   ├── game-utils.test.js        # 游戏工具函数测试 (9 个测试套件)
│   ├── battle-system.test.js     # 战斗系统测试 (7 个测试套件)
│   ├── equipment-system.test.js  # 装备系统测试 (6 个测试套件)
│   ├── enhance-system.test.js    # 强化系统测试 (6 个测试套件)
│   ├── app-core.test.js          # 应用核心测试 (10 个测试套件)
│   └── data-validation.test.js   # 数据验证测试 (6 个测试套件)
│
├── integration/                   # 🔗 集成测试
│   ├── inventory-integration.test.js  # 背包系统集成测试 (6 个测试套件)
│   └── battle-flow.test.js       # 战斗流程集成测试 (4 个测试套件)
│
└── coverage/                      # 📊 覆盖率报告 (运行后生成)
    └── lcov-report/
        └── index.html
```

## 快速使用

### 一键运行全部测试
```bash
cd test
run-tests.bat        # Windows
./run-tests.sh       # Linux/Mac
```

### 查看测试报告
```bash
cd test
npm run test:coverage
# 然后打开 coverage/lcov-report/index.html
```

## 测试覆盖范围

### 单元测试覆盖模块

| 模块 | 测试文件 | 测试套件数 | 主要测试内容 |
|------|---------|-----------|-------------|
| 游戏工具 | game-utils.test.js | 9 | 随机数、伤害计算、闪避、格式化、节流防抖 |
| 战斗系统 | battle-system.test.js | 7 | 战斗初始化、回合顺序、攻击、技能、逃跑、结算 |
| 装备系统 | equipment-system.test.js | 6 | 穿戴/卸下、等级限制、属性计算、套装效果 |
| 强化系统 | enhance-system.test.js | 6 | 成功率、成本、资源检查、失败降级、属性提升 |
| 应用核心 | app-core.test.js | 10 | 经验值、升级、存档/读档、金币管理 |
| 数据验证 | data-validation.test.js | 6 | 怪物/物品/地下城/技能数据完整性和一致性 |

### 集成测试覆盖场景

| 场景 | 测试文件 | 测试套件数 | 主要测试内容 |
|------|---------|-----------|-------------|
| 背包系统 | inventory-integration.test.js | 6 | 添加/移除/使用物品、堆叠、出售、整理、搜索 |
| 战斗流程 | battle-flow.test.js | 4 | 完整战斗流程、经验获取、掉落处理、逃跑 |

## 测试统计

- **总测试套件数**: 54 个 describe 块
- **总测试用例数**: 200+ 个 test 用例
- **覆盖率目标**: 70%+
- **优先级P0测试**: 全部核心功能

## 测试环境

- **测试框架**: Jest 29.x
- **运行环境**: Node.js 18.x
- **Mock 支持**: 微信小程序 API 全模拟
- **覆盖率工具**: Istanbul (内置于 Jest)

## 核心测试用例示例

### 1. 伤害计算测试
```javascript
test('暴击时应增加伤害', () => {
  const attacker = { attack: 20, critical: 1.0 };
  const defender = { defense: 5 };
  const result = calculateDamage(attacker, defender);
  expect(result.isCritical).toBe(true);
});
```

### 2. 装备穿戴测试
```javascript
test('等级不足应失败', () => {
  const hero = { level: 5 };
  const item = { requiredLevel: 10 };
  const result = equip(hero, item);
  expect(result.success).toBe(false);
  expect(result.reason).toBe('level_requirement');
});
```

### 3. 战斗胜利测试
```javascript
test('击败敌人应获得奖励', () => {
  battle.startBattle(hero, weakEnemy);
  battle.executeTurn({ type: 'attack' });
  expect(battle.battle.result).toBe('victory');
  expect(battle.battle.rewards.exp).toBeDefined();
});
```

## 持续集成配置

可以将测试集成到 GitHub Actions：

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd test && npm ci
      - run: cd test && npm test
      - run: cd test && npm run test:coverage
```

## 扩展指南

### 添加新测试
1. 在 `test/unit/` 或 `test/integration/` 创建 `.test.js` 文件
2. 遵循 AAA 模式 (Arrange-Act-Assert)
3. 使用 `testUtils` 辅助函数创建模拟数据
4. 运行测试验证

### 更新测试用例
修改 `test/plan/TEST_CASES.md` 文档，保持用例与代码同步。

## 注意事项

1. **微信小程序环境**: 所有微信 API 已在 `setup.js` 中 Mock，测试时直接使用 `wx.*`
2. **随机数**: 使用 `testUtils.setRandomSeed()` 固定随机种子以确保测试可重复
3. **异步代码**: 使用 `async/await` 或 `done` 回调处理异步测试
4. **覆盖率**: 运行 `npm run test:coverage` 生成报告，检查未覆盖的代码

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-02-27 | 1.0.0 | 初始版本，包含完整测试套件 |
  - 6 个单元测试文件
  - 2 个集成测试文件
  - 1 个测试计划文档
  - 1 个详细测试用例文档 (50+ 条)
  - Windows/Linux/Mac 执行脚本
