# Combat System Optimization - Technical Design

## Context

当前战斗系统位于 `MaFaWeb/utils/battle-system.js`，处理所有战斗逻辑。系统采用前端处理模式，无后端战斗计算。现有代码已预留扩展接口，便于添加新属性。

**当前架构：**
- `BattleSystem` 类处理核心战斗逻辑
- 属性通过 `totalStats` 计算（含装备加成）
- 技能系统已有基础框架

## Goals / Non-Goals

**Goals:**
1. 实现吸血、伤害反射、HP/MP回复、精准属性
2. 添加被动技能/光环系统
3. 实现Buff/Debuff机制
4. 优化伤害计算公式
5. 扩展怪物AI行为模式

**Non-Goals:**
- 后端战斗计算（保持纯前端）
- PVP战斗系统
- 装备系统大规模重构

## Decisions

### 1. 属性扩展方式
**决策：** 在 `battle-system.js` 中扩展 `hero` 对象属性

**理由：** 代码已有占位符，直接扩展影响最小

### 2. Buff系统架构
**决策：** 采用栈式Buff管理，每回合自动衰减

**理由：** 简单高效，便于实现和调试

### 3. 技能数据结构
**决策：** 新增 `skillType` 字段区分主动/被动/光环技能

**理由：** 保持数据模型一致性

### 4. 伤害公式
**决策：** 保留现有公式结构，添加属性修正因子

**理由：** 最小化对现有平衡的影响

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 属性数值失衡 | 分阶段实现，每阶段测试平衡性 |
| 代码复杂度增加 | 保持模块化，注释清晰 |
| 现有功能回归 | 保留原有逻辑，新增可选 |

## Migration Plan

1. **Phase 1**: 扩展属性系统（lifeSteal, reflectDamage, hpRegen, mpRegen）
2. **Phase 2**: 伤害公式优化
3. **Phase 3**: Buff/Debuff系统
4. **Phase 4**: 被动技能系统
5. **Phase 5**: 怪物AI扩展

每阶段独立测试，确保无回归后再进行下一阶段。

## Open Questions

- [ ] 最终属性数值平衡需要实际测试调整
- [ ] 光环技能对多成员的支持（未来PVP）
- [ ] 是否需要配置化的公式参数
