# 暗黑风格RPG游戏装备图标需求文档 v2.0

## 文档说明
本文档用于指导图标设计与生成，包含完整的装备类型清单、规格要求和解决方案。

---

## 一、图标规格要求

### 1.1 基础规格
- **图片格式**: PNG (带透明背景)
- **建议尺寸**: 64×64 像素 (或 128×128 像素)
- **风格**: 暗黑奇幻 (Dark Fantasy)
- **色系**: 深色系为主，金色/暗红色点缀

### 1.2 命名规范
```
{类型}_{等级}.png        # 非套装
{类型}_set_{等级}.png   # 套装

示例:
weapon_dao_1.png        # 1级木刀 (非套装)
weapon_dao_set_1.png   # 1级木刀 (套装)
```

### 1.3 存放路径
```
assets/icons/items/
```

---

## 二、完整装备清单 (共732个图标)

### 2.1 药水类 (12个)

| 等级 | HP药水 | MP药水 | 双效药水 |
|------|--------|--------|----------|
| 小型 | potion_small_hp.png | potion_small_mp.png | potion_dual_small.png |
| 中型 | potion_medium_hp.png | potion_medium_mp.png | potion_dual_medium.png |
| 大型 | potion_large_hp.png | potion_large_mp.png | potion_dual_large.png |
| 巨型 | potion_giant_hp.png | potion_giant_mp.png | - |
| 至尊 | - | - | potion_elixir.png |

**共12个** - 按品质/等级区分颜色即可

---

### 2.2 武器类 (200个 = 5类型 × 20等级 × 2)

#### 刀类 (weapon_dao) - 40个
```
非套装: weapon_dao_1.png ~ weapon_dao_20.png (20个)
套装:   weapon_dao_set_1.png ~ weapon_dao_set_20.png (20个)
```

| 等级 | 非套装名称 | 套装名称 | 图标命名 |
|------|-----------|----------|----------|
| 1 | 木刀 | 新手刀 | weapon_dao_1.png |
| 5 | 铁刀 | 战士刀 | weapon_dao_5.png |
| 10 | 钢刀 | 勇士刀 | weapon_dao_10.png |
| 15 | 精钢刀 | 冠军刀 | weapon_dao_15.png |
| ... | ... | ... | ... |
| 20 | 弑神刀 | 永恒刀 | weapon_dao_20.png |

#### 剑类 (weapon_jian) - 40个
```
非套装: weapon_jian_1.png ~ weapon_jian_20.png
套装:   weapon_jian_set_1.png ~ weapon_jian_set_20.png
```

#### 斧类 (weapon_axe) - 40个
```
非套装: weapon_axe_1.png ~ weapon_axe_20.png
套装:   weapon_axe_set_1.png ~ weapon_axe_set_20.png
```

#### 法杖 (weapon_staff) - 40个
```
非套装: weapon_staff_1.png ~ weapon_staff_20.png
套装:   weapon_staff_set_1.png ~ weapon_staff_set_20.png
```

#### 弓类 (weapon_bow) - 40个
```
非套装: weapon_bow_1.png ~ weapon_bow_20.png
套装:   weapon_bow_set_1.png ~ weapon_bow_set_20.png
```

---

### 2.3 防具类 (160个 = 8类型 × 20等级 × 2)

| 类型 | 非套装命名 | 套装命名 | 数量 |
|------|-----------|----------|------|
| 头盔 | helmet_1.png ~ helmet_20.png | helmet_set_1.png ~ helmet_set_20.png | 40 |
| 胸甲 | armor_chest_1.png ~ armor_chest_20.png | armor_chest_set_1.png ~ armor_chest_set_20.png | 40 |
| 护腿 | armor_legs_1.png ~ armor_legs_20.png | armor_legs_set_1.png ~ armor_legs_set_20.png | 40 |
| 鞋子 | armor_boots_1.png ~ armor_boots_20.png | armor_boots_set_1.png ~ armor_boots_set_20.png | 40 |
| 护手 | armor_gloves_1.png ~ armor_gloves_20.png | armor_gloves_set_1.png ~ armor_gloves_set_20.png | 40 |
| 盾牌 | shield_1.png ~ shield_20.png | shield_set_1.png ~ shield_set_20.png | 40 |
| 腰带 | belt_1.png ~ belt_20.png | belt_set_1.png ~ belt_set_20.png | 40 |
| 披风 | cloak_1.png ~ cloak_20.png | cloak_set_1.png ~ cloak_set_20.png | 40 |

---

### 2.4 饰品类 (360个 = 9类型 × 20等级 × 2)

| 类型 | 非套装命名 | 套装命名 | 数量 |
|------|-----------|----------|------|
| 项链 | necklace_1.png ~ necklace_20.png | necklace_set_1.png ~ necklace_set_20.png | 40 |
| 戒指 | ring_1.png ~ ring_20.png | ring_set_1.png ~ ring_set_20.png | 40 |
| 护腕 | bracer_1.png ~ bracer_20.png | bracer_set_1.png ~ bracer_set_20.png | 40 |
| 护身符 | amulet_1.png ~ amulet_20.png | amulet_set_1.png ~ amulet_set_20.png | 40 |
| 宝石 | gem_1.png ~ gem_20.png | gem_set_1.png ~ gem_set_20.png | 40 |
| 耳环 | earring_1.png ~ earring_20.png | earring_set_1.png ~ earring_set_20.png | 40 |
| 坐骑 | mount_1.png ~ mount_20.png | mount_set_1.png ~ mount_set_20.png | 40 |

---

## 三、解决方案

### 方案一：按品质着色 (推荐)

**核心思路**: 每个类型只设计1个基础图标，通过不同颜色区分等级/品质

| 品质 | 颜色滤镜 | 适用等级 |
|------|----------|----------|
| 普通 (common) | 灰色 | 1-10级 |
| 优秀 (uncommon) | 绿色 | 11-20级 |
| 精良 (rare) | 蓝色 | 21-30级 |
| 稀有 (epic) | 紫色 | 31-40级 |
| 史诗 (legendary) | 橙色 | 41-50级 |
| 传说 (mythic) | 红色 | 51-60级 |
| 神圣 (divine) | 金色 | 61-70级 |
| 永恒 | 彩虹渐变 | 71级以上 |

**优势**: 只需27个基础图标
**实现**: 代码中添加CSS滤镜或颜色叠加

### 方案二：按等级分组

**核心思路**: 每10级一组图标

| 等级段 | 图标数量 | 说明 |
|--------|----------|------|
| 1-10级 | 27个 | 初级装备 |
| 11-20级 | 27个 | 中级装备 |
| 21-30级 | 27个 | 高级装备 |
| ... | ... | ... |

**优势**: 81个图标覆盖所有等级
**实现**: 根据装备level选择对应图标

### 方案三：完整图标 (全部732个)

**核心思路**: 每个装备独立图标

**优势**: 最精细的效果
**劣势**: 工作量大

---

## 四、推荐方案 - 方案二 (按等级分组)

### 4.1 基础图标 (27个)

```
武器类 (5个):
weapon_dao.png     # 刀
weapon_jian.png    # 剑
weapon_axe.png     # 斧
weapon_staff.png   # 法杖
weapon_bow.png     # 弓

防具类 (8个):
helmet.png         # 头盔
armor_chest.png   # 胸甲
armor_legs.png    # 护腿
armor_boots.png   # 鞋子
armor_gloves.png  # 护手
shield.png         # 盾牌
belt.png           # 腰带
cloak.png          # 披风

饰品类 (7个):
necklace.png       # 项链
ring.png           # 戒指
bracer.png         # 护腕
amulet.png         # 护身符
gem.png            # 宝石
earring.png        # 耳环
mount.png          # 坐骑

药水类 (3个):
potion_hp.png      # 生命药水
potion_mp.png      # 魔法药水
potion_dual.png    # 双效药水

通用 (4个):
weapon.png         # 通用武器
armor.png          # 通用防具
accessory.png      # 通用饰品
item.png           # 通用物品
```

### 4.2 等级区分 (可选)

如果需要更精细的区分，可以为每个类型额外生成：
- _lv1_10.png (1-10级)
- _lv11_20.png (11-20级)
- _lv21_30.png (21-30级)
- 等等...

---

## 五、设计规范

### 5.1 配色方案

```
主色调:
- 钢铁灰: #4A4A4A
- 暗铁色: #2D2D2D
- 锈蚀棕: #5C4033

强调色:
- 亡灵金: #B8860B
- 恶魔红: #8B0000
- 魔法蓝: #4169E1
- 毒素绿: #228B22
```

### 5.2 品质边框颜色

```
普通:     灰色 #808080
优秀:     绿色 #00FF00
精良:     蓝色 #0070DD
稀有:     紫色 #A335EE
史诗:     橙色 #FF8000
传说:     红色 #FF0000
神话:     金色 #FFD700
```

### 5.3 风格参考
- 暗黑破坏神 (Diablo)
- 泰坦之旅 (Titan Quest)
- 火炬之光 (Torchlight)

---

## 六、AI生成提示词

### 基础图标生成 (Midjourney)

```
Dark fantasy RPG equipment icon, {物品名称}, pixel art style,
dark grey metal texture, subtle scratches and rust,
transparent background, 64x64, game asset, centered

示例:
Dark fantasy RPG sword icon, steel broadsword, pixel art style,
dark grey metal texture, subtle scratches and rust,
transparent background, 64x64, game asset, centered
```

### 药水图标生成

```
Dark fantasy RPG potion icon, {颜色} glowing liquid in glass bottle,
pixel art style, translucent glass, magical glow effect,
transparent background, 64x64, game asset, centered

示例:
Dark fantasy RPG health potion icon, red glowing liquid in glass bottle,
pixel art style, translucent glass, magical glow effect,
transparent background, 64x64, game asset, centered
```

---

## 七、文件命名规范 (完整版)

### 7.1 药水 (12个)
```
potion_small_hp.png      # 小型生命药水
potion_medium_hp.png     # 中型生命药水
potion_large_hp.png      # 大型生命药水
potion_giant_hp.png      # 巨型生命药水
potion_small_mp.png      # 小型魔法药水
potion_medium_mp.png     # 中型魔法药水
potion_large_mp.png      # 大型魔法药水
potion_giant_mp.png      # 巨型魔法药水
potion_dual_small.png    # 小型双效药水
potion_dual_medium.png   # 中型双效药水
potion_dual_large.png    # 大型双效药水
potion_elixir.png        # 恢复药剂
```

### 7.2 武器 - 非套装 (20个等级/类型)
```
weapon_dao_1.png ~ weapon_dao_20.png
weapon_jian_1.png ~ weapon_jian_20.png
weapon_axe_1.png ~ weapon_axe_20.png
weapon_staff_1.png ~ weapon_staff_20.png
weapon_bow_1.png ~ weapon_bow_20.png
```

### 7.3 武器 - 套装 (20个等级/类型)
```
weapon_dao_set_1.png ~ weapon_dao_set_20.png
weapon_jian_set_1.png ~ weapon_jian_set_20.png
weapon_axe_set_1.png ~ weapon_axe_set_20.png
weapon_staff_set_1.png ~ weapon_staff_set_20.png
weapon_bow_set_1.png ~ weapon_bow_set_20.png
```

### 7.4 防具 - 非套装 (20个等级/类型)
```
helmet_1.png ~ helmet_20.png
armor_chest_1.png ~ armor_chest_20.png
armor_legs_1.png ~ armor_legs_20.png
armor_boots_1.png ~ armor_boots_20.png
armor_gloves_1.png ~ armor_gloves_20.png
shield_1.png ~ shield_20.png
belt_1.png ~ belt_20.png
cloak_1.png ~ cloak_20.png
```

### 7.5 饰品 - 非套装 (20个等级/类型)
```
necklace_1.png ~ necklace_20.png
ring_1.png ~ ring_20.png
bracer_1.png ~ bracer_20.png
amulet_1.png ~ amulet_20.png
gem_1.png ~ gem_20.png
earring_1.png ~ earring_20.png
mount_1.png ~ mount_20.png
```

### 7.6 套装版本
所有非套装图标添加 `_set_` 前缀即可

---

## 八、总结

### 推荐实施步骤

1. **第一阶段**: 基础图标 (27个) - 方案一
2. **第二阶段**: 等级区分图标 (81个) - 方案二
3. **第三阶段**: 完整图标 (732个) - 方案三

### 图标数量总结

| 方案 | 数量 | 工作量 | 效果 |
|------|------|--------|------|
| 方案一 | 27个 | 低 | 一般 |
| 方案二 | 81个 | 中 | 较好 |
| 方案三 | 732个 | 高 | 最好 |

---

*文档版本: 2.0*
*更新日期: 2024-02-24*
*项目: 地下城传说 (MaFaGame)*
