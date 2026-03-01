/**
 * 装备系统单元测试
 * 测试装备穿戴、卸下、属性计算等功能
 */

describe('EquipmentSystem', () => {
  let EquipmentSystem;
  let mockHero;
  let mockItems;

  beforeEach(() => {
    // 模拟装备系统
    EquipmentSystem = {
      // 装备槽位
      slots: ['weapon', 'helmet', 'armor', 'shield', 'necklace', 'ring1', 'ring2'],

      // 装备类型到槽位的映射
      slotMapping: {
        'sword': 'weapon',
        'axe': 'weapon',
        'staff': 'weapon',
        'bow': 'weapon',
        'dagger': 'weapon',
        'helmet': 'helmet',
        'armor': 'armor',
        'shield': 'shield',
        'necklace': 'necklace',
        'ring': 'ring'
      },

      // 获取物品应穿戴的槽位
      getSlotForItem(item) {
        // 检查是否有指定槽位
        if (item.slot) return item.slot;

        // 根据类型判断
        return this.slotMapping[item.type] || null;
      },

      // 穿戴装备
      equip(hero, item) {
        const slot = this.getSlotForItem(item);

        if (!slot) {
          return { success: false, reason: 'invalid_slot' };
        }

        // 检查等级要求
        if (item.requiredLevel && hero.level < item.requiredLevel) {
          return { success: false, reason: 'level_requirement' };
        }

        // 检查职业要求
        if (item.requiredClass && hero.class !== item.requiredClass) {
          return { success: false, reason: 'class_requirement' };
        }

        const oldItem = hero.equipment[slot];

        // 卸下旧装备
        if (oldItem) {
          this.unequip(hero, slot);
        }

        // 穿戴新装备
        hero.equipment[slot] = { ...item };

        // 应用装备属性
        this.applyEquipmentStats(hero);

        return {
          success: true,
          slot,
          oldItem,
          newItem: item
        };
      },

      // 卸下装备
      unequip(hero, slot) {
        const item = hero.equipment[slot];

        if (!item) {
          return { success: false, reason: 'no_item' };
        }

        // 从装备槽移除
        delete hero.equipment[slot];

        // 重新计算属性
        this.applyEquipmentStats(hero);

        return {
          success: true,
          slot,
          item
        };
      },

      // 应用装备属性到英雄
      applyEquipmentStats(hero) {
        // 重置基础属性（假设有baseStats存储基础值）
        if (!hero.baseStats) {
          hero.baseStats = {
            attack: hero.attack,
            defense: hero.defense,
            hp: hero.maxHp,
            speed: hero.speed
          };
        }

        // 从基础属性开始
        hero.attack = hero.baseStats.attack;
        hero.defense = hero.baseStats.defense;
        hero.maxHp = hero.baseStats.hp;
        hero.speed = hero.baseStats.speed;

        // 累加所有装备属性
        for (const slot in hero.equipment) {
          const item = hero.equipment[slot];
          if (item) {
            hero.attack += item.attack || 0;
            hero.defense += item.defense || 0;
            hero.maxHp += item.hp || 0;
            hero.speed += item.speed || 0;
          }
        }

        // 确保当前HP不超过最大HP
        hero.hp = Math.min(hero.hp, hero.maxHp);
      },

      // 计算总装备属性
      getTotalEquipmentStats(hero) {
        const stats = {
          attack: 0,
          defense: 0,
          hp: 0,
          speed: 0
        };

        for (const slot in hero.equipment) {
          const item = hero.equipment[slot];
          if (item) {
            stats.attack += item.attack || 0;
            stats.defense += item.defense || 0;
            stats.hp += item.hp || 0;
            stats.speed += item.speed || 0;
          }
        }

        return stats;
      },

      // 检查是否有套装效果
      getSetBonuses(hero) {
        const setCounts = {};

        // 统计套装部件
        for (const slot in hero.equipment) {
          const item = hero.equipment[slot];
          if (item && item.setId) {
            setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
          }
        }

        // 计算套装效果
        const bonuses = [];
        for (const setId in setCounts) {
          const count = setCounts[setId];
          // 2件套、4件套、6件套效果
          if (count >= 2) {
            bonuses.push({ setId, pieces: 2, bonus: this.getSetBonus(setId, 2) });
          }
          if (count >= 4) {
            bonuses.push({ setId, pieces: 4, bonus: this.getSetBonus(setId, 4) });
          }
          if (count >= 6) {
            bonuses.push({ setId, pieces: 6, bonus: this.getSetBonus(setId, 6) });
          }
        }

        return bonuses;
      },

      // 获取套装加成（模拟）
      getSetBonus(setId, pieces) {
        const setBonuses = {
          'warrior_set': {
            2: { attack: 20 },
            4: { attack: 50, defense: 30 },
            6: { attack: 100, defense: 60, hp: 200 }
          },
          'mage_set': {
            2: { mp: 50 },
            4: { mp: 100, attack: 40 },
            6: { mp: 200, attack: 100 }
          }
        };

        return (setBonuses[setId] && setBonuses[setId][pieces]) || null;
      },

      // 比较两件装备
      compareItems(item1, item2) {
        const stats1 = (item1.attack || 0) + (item1.defense || 0) + (item1.hp || 0) / 10;
        const stats2 = (item2.attack || 0) + (item2.defense || 0) + (item2.hp || 0) / 10;

        return {
          attackDiff: (item1.attack || 0) - (item2.attack || 0),
          defenseDiff: (item1.defense || 0) - (item2.defense || 0),
          hpDiff: (item1.hp || 0) - (item2.hp || 0),
          totalDiff: stats1 - stats2,
          isBetter: stats1 > stats2
        };
      }
    };

    // 初始化模拟英雄
    mockHero = testUtils.createMockHero({
      level: 10,
      class: 'warrior',
      attack: 50,
      defense: 30,
      maxHp: 200,
      speed: 10,
      hp: 200,
      mp: 100,
      equipment: {}
    });

    // 初始化模拟物品
    mockItems = {
      sword: {
        id: 'sword_001',
        name: '铁剑',
        type: 'sword',
        slot: 'weapon',
        attack: 20,
        requiredLevel: 5
      },
      helmet: {
        id: 'helmet_001',
        name: '铁头盔',
        type: 'helmet',
        slot: 'helmet',
        defense: 10,
        requiredLevel: 1
      },
      armor: {
        id: 'armor_001',
        name: '铁甲',
        type: 'armor',
        slot: 'armor',
        defense: 20,
        hp: 50,
        requiredLevel: 5
      },
      ring: {
        id: 'ring_001',
        name: '力量戒指',
        type: 'ring',
        slot: 'ring1',
        attack: 5,
        requiredLevel: 1
      },
      legendarySword: {
        id: 'sword_legendary',
        name: '传说之剑',
        type: 'sword',
        slot: 'weapon',
        attack: 100,
        requiredLevel: 50 // 等级要求很高
      },
      mageStaff: {
        id: 'staff_001',
        name: '法师杖',
        type: 'staff',
        slot: 'weapon',
        attack: 30,
        requiredClass: 'mage'
      },
      setItem1: {
        id: 'warrior_helm',
        name: '战士头盔',
        type: 'helmet',
        slot: 'helmet',
        defense: 15,
        setId: 'warrior_set'
      },
      setItem2: {
        id: 'warrior_armor',
        name: '战士铠甲',
        type: 'armor',
        slot: 'armor',
        defense: 25,
        setId: 'warrior_set'
      }
    };
  });

  describe('getSlotForItem()', () => {
    test('应根据类型返回正确的槽位', () => {
      expect(EquipmentSystem.getSlotForItem(mockItems.sword)).toBe('weapon');
      expect(EquipmentSystem.getSlotForItem(mockItems.helmet)).toBe('helmet');
      expect(EquipmentSystem.getSlotForItem(mockItems.armor)).toBe('armor');
    });

    test('应优先使用item.slot', () => {
      const customItem = { ...mockItems.ring, type: 'accessory', slot: 'ring2' };
      expect(EquipmentSystem.getSlotForItem(customItem)).toBe('ring2');
    });

    test('未知类型应返回null', () => {
      const unknownItem = { type: 'unknown_type' };
      expect(EquipmentSystem.getSlotForItem(unknownItem)).toBeNull();
    });
  });

  describe('equip()', () => {
    test('应成功穿戴装备', () => {
      const result = EquipmentSystem.equip(mockHero, mockItems.sword);

      expect(result.success).toBe(true);
      expect(mockHero.equipment.weapon).toBeDefined();
      expect(mockHero.equipment.weapon.id).toBe('sword_001');
    });

    test('应应用装备属性', () => {
      const baseAttack = mockHero.attack;
      EquipmentSystem.equip(mockHero, mockItems.sword);

      expect(mockHero.attack).toBe(baseAttack + 20);
    });

    test('等级不足应失败', () => {
      const result = EquipmentSystem.equip(mockHero, mockItems.legendarySword);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('level_requirement');
    });

    test('职业不匹配应失败', () => {
      const result = EquipmentSystem.equip(mockHero, mockItems.mageStaff);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('class_requirement');
    });

    test('替换装备应返回旧装备', () => {
      EquipmentSystem.equip(mockHero, mockItems.sword);
      const newSword = { ...mockItems.sword, id: 'sword_002', attack: 30 };

      const result = EquipmentSystem.equip(mockHero, newSword);

      expect(result.success).toBe(true);
      expect(result.oldItem).toBeDefined();
      expect(result.oldItem.id).toBe('sword_001');
    });

    test('多件装备应累加属性', () => {
      const baseAttack = mockHero.attack;
      const baseDefense = mockHero.defense;

      EquipmentSystem.equip(mockHero, mockItems.sword); // +20 attack
      EquipmentSystem.equip(mockHero, mockItems.helmet); // +10 defense
      EquipmentSystem.equip(mockHero, mockItems.ring); // +5 attack

      expect(mockHero.attack).toBe(baseAttack + 25);
      expect(mockHero.defense).toBe(baseDefense + 10);
    });
  });

  describe('unequip()', () => {
    beforeEach(() => {
      EquipmentSystem.equip(mockHero, mockItems.sword);
    });

    test('应成功卸下装备', () => {
      const result = EquipmentSystem.unequip(mockHero, 'weapon');

      expect(result.success).toBe(true);
      expect(mockHero.equipment.weapon).toBeUndefined();
    });

    test('卸下装备应恢复属性', () => {
      const baseAttack = mockHero.baseStats.attack;

      EquipmentSystem.unequip(mockHero, 'weapon');

      expect(mockHero.attack).toBe(baseAttack);
    });

    test('空槽位卸下应失败', () => {
      const result = EquipmentSystem.unequip(mockHero, 'armor');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('no_item');
    });
  });

  describe('getTotalEquipmentStats()', () => {
    test('应计算正确的总属性', () => {
      EquipmentSystem.equip(mockHero, mockItems.sword);
      EquipmentSystem.equip(mockHero, mockItems.helmet);
      EquipmentSystem.equip(mockHero, mockItems.armor);

      const stats = EquipmentSystem.getTotalEquipmentStats(mockHero);

      expect(stats.attack).toBe(20);
      expect(stats.defense).toBe(30);
      expect(stats.hp).toBe(50);
    });

    test('空装备应返回0', () => {
      const stats = EquipmentSystem.getTotalEquipmentStats(mockHero);

      expect(stats.attack).toBe(0);
      expect(stats.defense).toBe(0);
    });
  });

  describe('getSetBonuses()', () => {
    test('应检测套装效果', () => {
      EquipmentSystem.equip(mockHero, mockItems.setItem1);
      EquipmentSystem.equip(mockHero, mockItems.setItem2);

      const bonuses = EquipmentSystem.getSetBonuses(mockHero);

      expect(bonuses.length).toBeGreaterThan(0);
      expect(bonuses[0].setId).toBe('warrior_set');
    });

    test('应计算正确的套装件数', () => {
      EquipmentSystem.equip(mockHero, mockItems.setItem1);
      EquipmentSystem.equip(mockHero, mockItems.setItem2);

      const bonuses = EquipmentSystem.getSetBonuses(mockHero);
      const twoPiece = bonuses.find(b => b.pieces === 2);

      expect(twoPiece).toBeDefined();
      expect(twoPiece.bonus).toEqual({ attack: 20 });
    });
  });

  describe('compareItems()', () => {
    test('应正确比较两件装备', () => {
      const item1 = { attack: 30, defense: 10 };
      const item2 = { attack: 20, defense: 15 };

      const comparison = EquipmentSystem.compareItems(item1, item2);

      expect(comparison.attackDiff).toBe(10);
      expect(comparison.defenseDiff).toBe(-5);
      expect(comparison.isBetter).toBe(true);
    });

    test('较弱装备应返回isBetter为false', () => {
      const item1 = { attack: 10 };
      const item2 = { attack: 30, defense: 20 };

      const comparison = EquipmentSystem.compareItems(item1, item2);

      expect(comparison.isBetter).toBe(false);
    });
  });
});
