# 物品图标使用指南

## 当前状态
- 已创建 `assets/icons/items/` 文件夹，包含图标文件
- 物品图标路径直接从数据源返回（data/items.js）
- 代码中使用 `item.icon` 字段显示图标，无硬编码逻辑

## 替换图标步骤

### 1. 下载图标资源
从以下推荐链接下载图标：
- [496像素艺术图标](https://www.aigei.com/item/496_pixel_art_i.html) - CC0 完全免费
- [Fantasy RPG Icons 500+](https://www.interestcreator.com/fantasy-rpg-icons/) - 武器/护甲/药水
- [RPG技能和道具图标789枚](https://www.sucaijishi.com/png-20-812-1.html) - 400×400px PNG

### 2. 替换图标文件
将下载的图标放入 `assets/icons/items/` 目录，文件名保持不变：
```
weapon_sword.png    剑图标
weapon_axe.png        斧图标
weapon_bow.png        弓图标
weapon_staff.png      法杖图标
weapon_dagger.png     匕首图标
helmet.png            头盔图标
armor_chest.png       护甲图标
shield.png            盾牌图标
necklace.png          项链图标
ring.png              戒指图标
belt.png              腰带图标
cloak.png             披风图标
bracer.png            护腕图标
earring.png           耳环图标
amulet.png            护身符图标
gem.png               宝石图标
potion_hp.png         生命药水图标
potion_mp.png         魔法药水图标
potion_dual.png       双效药水图标
potion.png            通用药水图标
weapon.png            通用武器图标
armor.png             通用装备图标
accessory.png         通用饰品图标
item.png              通用物品图标
```

### 3. 修改数据源（可选）
如果需要添加新图标或修改图标映射，修改 `data/items.js` 中的 `icon` 字段：

```javascript
// 药水示例
const potionIconMap = {
  'hp': '/assets/icons/items/potion_hp.png',
  'mp': '/assets/icons/items/potion_mp.png',
  'dual': '/assets/icons/items/potion_dual.png'
}

// 装备示例
const equipIcons = {
  'weapon_sword': '/assets/icons/items/weapon_sword.png',
  'helmet': '/assets/icons/items/helmet.png',
  // ... 其他映射
}
```

### 4. 重新编译项目
在微信开发者工具中：
1. 点击"编译"按钮
2. 确保所有图标文件都显示在文件列表中

## 架构说明

### 数据流向
```
data/items.js (定义物品数据和icon字段)
    ↓
hero.js (从data获取物品，使用item.icon)
    ↓
hero.wxml (显示 {{item.iconPath}})
```

### 优势
- 无需修改显示逻辑代码
- 图标映射集中在数据文件中管理
- 易于扩展和维护
- 支持从接口动态获取图标路径

## 技巧提示
1. 如果图标不显示，检查文件名是否正确匹配
2. 建议图片尺寸：64×64 或 128×128 像素
3. 使用透明背景的 PNG
4. 单个图片建议≤ 50KB
