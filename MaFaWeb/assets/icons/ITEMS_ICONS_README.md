# 物品图标配置说明

## 📂 文件夹结构
在 `assets/icons/` 目录下创建 `items/` 子文件夹，用于存放物品图标：

```
assets/icons/
├── items/
│   ├── weapon_sword.png      # 剑图标
│   ├── weapon_axe.png        # 斧图标
│   ├── weapon_bow.png         # 弓箭图标
│   ├── weapon_staff.png       # 法杖图标
│   ├── weapon_dagger.png     # 匕首图标
│   ├── helmet.png            # 头盔图标
│   ├── armor_chest.png       # 护甲图标
│   ├── armor_legs.png        # 护腿图标
│   ├── armor_boots.png       # 护靴图标
│   ├── armor_gloves.png      # 护手图标
│   ├── shield.png             # 盾牌图标
│   ├── necklace.png           # 项链图标
│   ├── ring.png               # 戒指图标
│   ├── potion_hp.png          # 生命药水图标
│   ├── potion_mp.png          # 魔法药水图标
│   ├── potion_dual.png        # 双效药水图标
│   ├── belt.png               # 腰带图标
│   ├── cloak.png              # 披风图标
│   ├── bracer.png             # 护腕图标
│   ├── earring.png            # 耳环图标
│   ├── amulet.png             # 护身符图标
│   └── gem.png               # 宝石图标
```

## 📥 推荐图标资源

### 1. 爱给网 - 496像素艺术图标（CC0完全免费）
- 下载链接: [https://www.aigei.com/item/496_pixel_art_i.html](https://www.aigei.com/item/496_pixel_art_i.html)
- 包含武器、护甲、道具等多种图标
- 许可: CC0（可商用，无需署名）

### 2. Fantasy RPG Icons 500+
- 下载链接: [https://www.interestcreator.com/fantasy-rpg-icons/](https://www.interestcreator.com/fantasy-rpg-icons/)
- 包含: 武器(170+)、装备(150+)、药水(18+)等
- 格式: 1080×1080 PNG

### 3. RPG技能和道具图标 789枚
- 下载链接: [https://www.sucaijishi.com/png-20-812-1.html](https://www.sucaijishi.com/png-20-812-1.html)
- 格式: 400×400px PNG

## 🎨 图标规格要求

- **格式**: PNG
- **推荐尺寸**: 64×64 或 128×128 像素
- **背景**: 透明（推荐）
- **单个文件大小**: 建议≤ 10KB
- **总大小**: 建议≤ 2MB（微信小程序限制）

## ⚙️ 使用方法

### 方式1: 添加图片文件
1. 下载所需的图标资源
2. 将图片复制到 `assets/icons/items/` 目录
3. 确保文件名与上面列出的名称一致
4. 重新编译项目

### 方式2: 临时使用Emoji（当前方案）
在添加图片文件之前，系统会自动使用emoji作为临时图标：
- ⚔️ 武器
- 🛡️ 装备
- 🧪 药水
- 💍 饰品

## 📝 更新代码后

如果需要添加新的图标类型，只需：

1. 在 `items.js` 中添加图标字段：
   ```javascript
   item.icon = '/assets/icons/items/new_item.png'
   ```

2. 在 `pages/hero/hero.wxs` 的 `itemIconMap` 中添加映射：
   ```javascript
   'new_item': '/assets/icons/items/new_item.png'
   ```

## 🔧 故障排查

**问题**: 图标不显示
**解决**: 检查图片路径是否正确，确认文件存在于项目中

**问题**: 显示空白图标
**解决**: 检查图片格式是否为PNG，背景是否透明

**问题**: 图标显示过大/过小
**解决**: 在 `hero.wxss` 中调整 `.item-type-icon` 的样式
