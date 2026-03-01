/**
 * 项目通用布局配置
 * 统一卡片、间距、边距等样式规范
 */

// ==================== 卡片间距配置 ====================
const LAYOUT_CONFIG = {
  // 容器内边距
  container: {
    padding: 16,           // 页面容器内边距 (rpx)
  },

  // 卡片通用配置
  card: {
    padding: 16,           // 卡片内边距
    marginBottom: 12,      // 卡片底部间距
    borderRadius: 12,      // 圆角
    borderWidth: 1,        // 边框宽度
  },

  // 间距规范
  spacing: {
    xs: 4,                 // 超小间距
    sm: 8,                 // 小间距
    md: 12,                // 中间距
    lg: 16,                // 大间距
    xl: 24,                // 超大间距
  },

  // 间隙规范 (gap)
  gap: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  }
}

// ==================== WXSS 变量生成 ====================
function generateWXSSVariables() {
  return `
/* 自动生成的布局变量 - 由 layoutConfig.js 生成 */
:root {
  /* 容器 */
  --container-padding: ${LAYOUT_CONFIG.container.padding}px;

  /* 卡片 */
  --card-padding: ${LAYOUT_CONFIG.card.padding}px;
  --card-margin-bottom: ${LAYOUT_CONFIG.card.marginBottom}px;
  --card-border-radius: ${LAYOUT_CONFIG.card.borderRadius}px;
  --card-border-width: ${LAYOUT_CONFIG.card.borderWidth}px;

  /* 间距 */
  --spacing-xs: ${LAYOUT_CONFIG.spacing.xs}px;
  --spacing-sm: ${LAYOUT_CONFIG.spacing.sm}px;
  --spacing-md: ${LAYOUT_CONFIG.spacing.md}px;
  --spacing-lg: ${LAYOUT_CONFIG.spacing.lg}px;
  --spacing-xl: ${LAYOUT_CONFIG.spacing.xl}px;

  /* 间隙 */
  --gap-xs: ${LAYOUT_CONFIG.gap.xs}px;
  --gap-sm: ${LAYOUT_CONFIG.gap.sm}px;
  --gap-md: ${LAYOUT_CONFIG.gap.md}px;
  --gap-lg: ${LAYOUT_CONFIG.gap.lg}px;
  --gap-xl: ${LAYOUT_CONFIG.gap.xl}px;
}

/* 通用卡片类 */
.card {
  width: 100%;
  box-sizing: border-box;
  padding: var(--card-padding);
  margin-bottom: var(--card-margin-bottom);
  border-radius: var(--card-border-radius);
}

/* 页面容器 */
.page-container {
  min-height: 100vh;
  padding: var(--container-padding);
  box-sizing: border-box;
}
`
}

module.exports = {
  LAYOUT_CONFIG,
  generateWXSSVariables
}
