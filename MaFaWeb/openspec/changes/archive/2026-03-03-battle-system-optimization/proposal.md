## Why

当前战斗系统存在代码重复、职责不清晰和潜在的性能问题。技能使用存在两个独立的方法（`heroAttack` 和 `useBattleSkill`），特效动画逻辑分散，缺乏统一的错误处理和边界情况检查，影响代码可维护性和玩家体验。

## What Changes

- **重构技能系统**：统一技能使用逻辑，合并 `heroAttack` 和 `useBattleSkill` 为单一入口
- **优化动画系统**：创建统一的特效动画管理器，整合分散的动画逻辑
- **增强状态管理**：分离战斗逻辑与 UI 状态，建立清晰的数据流向
- **改进错误处理**：添加统一的错误捕获和用户友好的错误提示
- **性能优化**：优化特效循环和 Canvas 渲染，减少不必要的重绘
- **新增战斗统计**：记录战斗数据用于后续分析（伤害统计、击杀数等）

## Capabilities

### New Capabilities

- `battle-statistics`: 战斗数据统计和记录功能，包括伤害输出、承受伤害、击杀数等

### Modified Capabilities

- `battle-system`: 重构现有战斗系统，统一技能使用逻辑和动画管理

## Impact

- 修改文件：`utils/battle-system.js`, `pages/battle/battle.js`
- 新增文件：`utils/battle-animation-manager.js`, `utils/battle-statistics.js`
- 破坏性变更：无（保持现有 API 兼容）
- 依赖更新：无需新增依赖
