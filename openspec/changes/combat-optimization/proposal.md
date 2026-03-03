# Proposal: 战斗系统优化

## Why

当前战斗系统功能较为基础，仅支持基本的攻击、暴击、闪避、格挡机制。代码中已有多个扩展属性的占位符（如吸血、伤害反射、生命回复等），但尚未实现。随着游戏内容增加，需要丰富战斗机制提升游戏可玩性和策略深度。

## What Changes

1. **新增战斗属性系统**
   - 吸血属性 (lifeSteal)
   - 伤害反射 (reflectDamage)
   - 生命/魔法回复 (hpRegen/mpRegen)
   - 精准/命中 (accuracy)

2. **扩展技能系统**
   - 被动技能（光环效果）
   - Buff/Debuff机制
   - 技能连锁/联动

3. **优化战斗体验**
   - 伤害数字动画优化
   - 战斗特效增强
   - 智能怪物AI

4. **数值平衡调整**
   - 伤害计算公式优化
   - 属性收益曲线调整

## Capabilities

### New Capabilities
- `combat-attributes`: 扩展战斗属性系统（吸血、反射、回复、精准）
- `passive-skills`: 被动技能/光环系统
- `buff-system`: Buff/Debuff机制
- `damage-formula`: 伤害计算公式优化
- `monster-ai`: 怪物AI行为扩展

### Modified Capabilities
- `battle-system`: 现有战斗流程需要适配新属性和机制

## Impact

- **前端**: `MaFaWeb/utils/battle-system.js`, `MaFaWeb/data/skills.js`, `MaFaWeb/pages/battle/`
- **数据模型**: 英雄属性扩展、怪物属性扩展
- **无后端影响**: 战斗逻辑纯前端处理
