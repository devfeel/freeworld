/**
 * 卡片样式配置
 * 统一项目内所有卡片的背景色、边框等样式
 */

// ==================== 卡片主题配置 ====================
const CARD_THEME = {
  // 主卡片样式（大卡片，如角色卡片、装备面板）
  primary: {
    background: 'var(--panel-bg)',
    border: '2px solid var(--border-color)',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 212, 76, 0.1)'
  },

  // 次级卡片样式（小卡片，如包裹栏、熟练度面板）
  secondary: {
    background: 'var(--panel-bg)',
    border: '2px solid var(--border-color)',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 212, 76, 0.1)'
  },

  // 装备槽位样式
  equipSlot: {
    background: 'var(--panel-bg)',
    border: '2px solid var(--border-color)',
    borderRadius: '4px'
  },

  // 装备槽位激活状态
  equipSlotActive: {
    background: 'var(--panel-bg)',
    border: '2px solid var(--primary-color)',
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(212, 168, 76, 0.3)'
  },

  // 列表项样式（如商城商品、背包物品）
  listItem: {
    background: 'var(--panel-bg)',
    border: '2px solid var(--border-color)',
    borderRadius: '4px'
  }
}

// ==================== WXSS 类名生成 ====================
function generateCardStyles() {
  return `
/* 卡片样式 - 由 cardConfig.js 生成 */

/* 主卡片 */
.card-primary {
  background: ${CARD_THEME.primary.background};
  border: ${CARD_THEME.primary.border};
  border-radius: ${CARD_THEME.primary.borderRadius};
  padding: ${CARD_THEME.primary.padding};
  margin-bottom: ${CARD_THEME.primary.marginBottom};
  box-shadow: ${CARD_THEME.primary.boxShadow};
  width: 100%;
  box-sizing: border-box;
}

/* 次级卡片 */
.card-secondary {
  background: ${CARD_THEME.secondary.background};
  border: ${CARD_THEME.secondary.border};
  border-radius: ${CARD_THEME.secondary.borderRadius};
  padding: ${CARD_THEME.secondary.padding};
  margin-bottom: ${CARD_THEME.secondary.marginBottom};
  box-shadow: ${CARD_THEME.secondary.boxShadow};
  width: 100%;
  box-sizing: border-box;
}

/* 装备槽位 */
.card-equip-slot {
  background: ${CARD_THEME.equipSlot.background};
  border: ${CARD_THEME.equipSlot.border};
  border-radius: ${CARD_THEME.equipSlot.borderRadius};
}

.card-equip-slot.active {
  background: ${CARD_THEME.equipSlotActive.background};
  border: ${CARD_THEME.equipSlotActive.border};
  border-radius: ${CARD_THEME.equipSlotActive.borderRadius};
  box-shadow: ${CARD_THEME.equipSlotActive.boxShadow};
}

/* 列表项 */
.card-list-item {
  background: ${CARD_THEME.listItem.background};
  border: ${CARD_THEME.listItem.border};
  border-radius: ${CARD_THEME.listItem.borderRadius};
}
`
}

module.exports = {
  CARD_THEME,
  generateCardStyles
}
