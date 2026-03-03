## Why

当前战斗界面视觉单一，Canvas 区域仅 150px 高度，缺乏环境氛围和战斗反馈。玩家无法直观看到状态效果（Buff/Debuff），战斗日志信息密度低，缺乏动作节奏感，影响战斗体验。

## What Changes

- **扩大战斗场景**：Canvas 高度从 300rpx 扩展至 400rpx，添加背景装饰（环境元素、地面透视、氛围光效）
- **新增状态效果系统**：添加 Buff/Debuff 图标显示，持续时间和效果说明
- **改进战斗日志**：增强日志样式（颜色分类、图标标识、动作时间轴）
- **添加粒子特效**：伤害、暴击、技能释放时的粒子效果
- **添加屏幕震动**：受击、暴击时的屏幕震动反馈
- **性能平衡**：粒子池复用、设备性能检测、可选的低功耗模式

## Capabilities

### New Capabilities

- `battle-scene-enhanced`: 增强的战斗场景，包含背景装饰、状态效果显示
- `battle-particle-effects`: 战斗粒子特效系统
- `battle-screen-shake`: 战斗屏幕震动反馈
- `status-effect-display`: 状态效果（Buff/Debuff）显示系统
- `battle-log-enhanced`: 增强的战斗日志样式

### Modified Capabilities

- `battle-ui`: 战斗界面布局和视觉样式

## Impact

- 修改文件：`pages/battle/battle.wxml`, `pages/battle/battle.wxss`, `pages/battle/battle.js`, `utils/canvas-draw.js`
- 新增文件：`utils/particle-system.js`, `utils/screen-shake.js`, `components/status-effect`
- 破坏性变更：无（向后兼容现有数据）
- 性能影响：通过粒子池和性能检测优化，支持低功耗模式
