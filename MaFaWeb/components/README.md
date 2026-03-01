# 公共组件使用指南

## 已创建的组件

### 1. progress-bar (进度条)

**功能：** 统一的生命值/魔法值/经验值进度条

**属性：**
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| percent | Number | 0 | 进度值 0-100 |
| type | String | 'custom' | 类型: hp/mp/exp/stamina/custom |
| showText | Boolean | true | 是否显示文字 |
| text | String | '' | 自定义文字 |
| className | String | '' | 自定义类名 |
| customStyle | String | '' | 容器自定义样式 |
| fillStyle | String | '' | 填充区自定义样式 |

**使用示例：**
```xml
<!-- 在页面 JSON 中引入 -->
{
  "usingComponents": {
    "progress-bar": "../../components/progress-bar/progress-bar"
  }
}

<!-- 在 WXML 中使用 -->
<progress-bar
  type="hp"
  percent="{{hero.hp / hero.maxHp * 100}}"
  text="{{hero.hp + '/' + hero.maxHp}}"
/>

<progress-bar
  type="exp"
  percent="{{hero.exp / hero.maxExp * 100}}"
/>
```

---

### 2. equipment-slot (装备槽位)

**功能：** 统一的装备槽位显示，支持空槽位提示、稀有度光晕、强化等级等

**属性：**
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| slotType | String | 'weapon' | 槽位类型 |
| slotName | String | '' | 槽位名称(自动推断) |
| slotLabel | String | '' | 空槽位标签 |
| defaultEmoji | String | '⚔️' | 默认图标(自动推断) |
| equipment | Object | null | 装备数据 |
| size | String | 'medium' | 尺寸: small/medium/large |
| showName | Boolean | false | 是否显示名称 |
| isNew | Boolean | false | 是否新物品 |

**装备数据格式：**
```javascript
{
  icon: '图片路径',
  emoji: '🗡️',  // 如果没有图片则显示emoji
  rarity: 'legendary',  // common/uncommon/rare/epic/legendary/mythic/divine
  enhanceLevel: 5,
  isSet: true
}
```

**使用示例：**
```xml
<!-- 页面 JSON -->
{
  "usingComponents": {
    "equipment-slot": "../../components/equipment-slot/equipment-slot"
  }
}

<!-- WXML -->
<equipment-slot
  slotType="weapon"
  equipment="{{hero.equipment.weapon}}"
  size="large"
  bind:tap="onEquipTap"
  bind:longpress="onEquipLongPress"
/>

<equipment-slot
  slotType="helmet"
  showName
/>
```

**事件：**
- `tap` - 点击槽位
- `longpress` - 长按槽位

---

### 3. modal (模态框)

**功能：** 统一的弹窗组件，支持自定义内容

**属性：**
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| title | String | '' | 标题 |
| showClose | Boolean | true | 显示关闭按钮 |
| showFooter | Boolean | true | 显示底部按钮 |
| showCancel | Boolean | true | 显示取消按钮 |
| confirmText | String | '确定' | 确认按钮文字 |
| cancelText | String | '取消' | 取消按钮文字 |
| animation | String | 'scale' | 动画: scale/slide-up/fade |
| closeOnOverlay | Boolean | true | 点击遮罩关闭 |

**使用示例：**
```xml
<!-- 页面 JSON -->
{
  "usingComponents": {
    "modal": "../../components/modal/modal"
  }
}

<!-- WXML -->
<modal
  title="确认删除"
  visible="{{showDeleteModal}}"
  confirmText="删除"
  cancelText="取消"
  bind:confirm="onDeleteConfirm"
  bind:cancel="onDeleteCancel"
  bind:close="onModalClose"
>
  <view>确定要删除这件装备吗？</view>
</modal>
```

**事件：**
- `confirm` - 点击确认
- `cancel` - 点击取消
- `close` - 关闭弹窗

---

## 设计系统更新

### CSS 变量

已添加完整的设计系统变量：

```css
/* 颜色系统 */
--color-primary, --color-success, --color-warning, --color-error, --color-info

/* 间距系统 (4px基准) */
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px

/* 圆角系统 */
--radius-sm: 2px
--radius-md: 4px
--radius-lg: 8px

/* 阴影系统 */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl

/* 过渡动画 */
--transition-fast: 0.1s
--transition-normal: 0.2s
--transition-slow: 0.3s
```

### 动效类

添加的动画工具类：

```css
.animate-fade-in        /* 淡入 */
.animate-slide-up       /* 上滑进入 */
.animate-slide-in-right /* 右滑进入 */
.animate-pulse          /* 脉冲 */
.animate-glow           /* 光晕 */
.animate-bounce         /* 弹跳 */
```

### 布局工具类

```css
.flex, .flex-col, .items-center, .justify-center
.gap-xs, .gap-sm, .gap-md
.m-xs, .m-sm, .p-xs, .p-sm
.text-primary, .text-danger, .text-success
```

---

## 页面使用示例

### 优化后的角色页装备网格

```xml
<view class="equipment-grid">
  <equipment-slot
    wx:for="{{equipmentSlots}}"
    wx:key="type"
    slotType="{{item.type}}"
    equipment="{{hero.equipment[item.type]}}"
    size="medium"
    bind:tap="onEquipTap"
  />
</view>
```

### 优化后的属性条

```xml
<view class="stat-bar">
  <text class="stat-label">生命值</text>
  <progress-bar
    type="hp"
    percent="{{hpPercent}}"
    text="{{hero.hp + '/' + hero.maxHp}}"
    className="stat-progress"
  />
</view>
```

---

## 迁移指南

### 替换原有进度条

**旧代码：**
```xml
<view class="progress-bar hp-bar">
  <view class="progress-fill" style="width: {{hpPercent}}%"></view>
</view>
```

**新代码：**
```xml
<progress-bar type="hp" percent="{{hpPercent}}" />
```

### 替换原有装备槽位

**旧代码：**
```xml
<view class="equipment-slot" bindtap="onEquipTap">
  <image src="{{equipment.icon}}" />
</view>
```

**新代码：**
```xml
<equipment-slot
  slotType="weapon"
  equipment="{{equipment}}"
  bind:tap="onEquipTap"
/>
```
