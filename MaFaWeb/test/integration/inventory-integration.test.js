/**
 * 背包系统集成测试
 * 测试背包管理、物品操作、与英雄系统的交互
 */

describe('Inventory Integration', () => {
  let InventorySystem;
  let mockHero;
  let mockBag;

  beforeEach(() => {
    // 初始化模拟背包系统
    InventorySystem = {
      MAX_SLOTS: 100,
      MAX_STACK_SIZE: 99,

      // 初始化背包
      initBag() {
        return {
          items: [],
          gold: 0
        };
      },

      // 添加物品
      addItem(bag, item, quantity = 1) {
        // 检查可堆叠
        if (item.stackable) {
          const existingSlot = bag.items.find(i => i.id === item.id);
          if (existingSlot) {
            const newQuantity = existingSlot.quantity + quantity;
            if (newQuantity > this.MAX_STACK_SIZE) {
              return {
                success: false,
                reason: 'stack_overflow',
                overflow: newQuantity - this.MAX_STACK_SIZE
              };
            }
            existingSlot.quantity = newQuantity;
            return { success: true, added: quantity, total: newQuantity };
          }
        }

        // 检查背包空间
        if (bag.items.length >= this.MAX_SLOTS) {
          return { success: false, reason: 'bag_full' };
        }

        // 添加新物品
        bag.items.push({
          ...item,
          quantity: quantity,
          uid: this.generateUID()
        });

        return { success: true, added: quantity };
      },

      // 移除物品
      removeItem(bag, itemUid, quantity = 1) {
        const index = bag.items.findIndex(i => i.uid === itemUid);
        if (index === -1) {
          return { success: false, reason: 'item_not_found' };
        }

        const item = bag.items[index];
        if (item.quantity < quantity) {
          return { success: false, reason: 'insufficient_quantity' };
        }

        item.quantity -= quantity;
        if (item.quantity === 0) {
          bag.items.splice(index, 1);
        }

        return { success: true, removed: quantity, remaining: item.quantity };
      },

      // 使用物品
      useItem(bag, hero, itemUid) {
        const item = bag.items.find(i => i.uid === itemUid);
        if (!item) {
          return { success: false, reason: 'item_not_found' };
        }

        // 检查使用条件
        if (item.requiredLevel && hero.level < item.requiredLevel) {
          return { success: false, reason: 'level_requirement' };
        }

        // 根据物品类型处理效果
        const effect = this.applyItemEffect(hero, item);

        // 消耗物品
        if (item.consumable) {
          this.removeItem(bag, itemUid, 1);
        }

        return { success: true, effect };
      },

      // 应用物品效果
      applyItemEffect(hero, item) {
        const effects = [];

        if (item.healHp) {
          const oldHp = hero.hp;
          hero.hp = Math.min(hero.maxHp, hero.hp + item.healHp);
          effects.push({ type: 'heal', stat: 'hp', amount: hero.hp - oldHp });
        }

        if (item.healMp) {
          const oldMp = hero.mp;
          hero.mp = Math.min(hero.maxMp, hero.mp + item.healMp);
          effects.push({ type: 'heal', stat: 'mp', amount: hero.mp - oldMp });
        }

        if (item.addExp) {
          effects.push({ type: 'exp', amount: item.addExp });
        }

        return effects;
      },

      // 出售物品
      sellItem(bag, itemUid, quantity = 1) {
        const item = bag.items.find(i => i.uid === itemUid);
        if (!item) {
          return { success: false, reason: 'item_not_found' };
        }

        if (item.quantity < quantity) {
          return { success: false, reason: 'insufficient_quantity' };
        }

        const goldEarned = (item.price || 0) * quantity;

        this.removeItem(bag, itemUid, quantity);
        bag.gold += goldEarned;

        return { success: true, goldEarned, newGold: bag.gold };
      },

      // 整理背包
      sortBag(bag, sortBy = 'type') {
        const sortFunctions = {
          type: (a, b) => a.type.localeCompare(b.type),
          rarity: (a, b) => (b.rarityValue || 0) - (a.rarityValue || 0),
          level: (a, b) => (b.level || 0) - (a.level || 0),
          name: (a, b) => a.name.localeCompare(b.name)
        };

        const sortFn = sortFunctions[sortBy] || sortFunctions.type;
        bag.items.sort(sortFn);

        return { success: true, sortedBy: sortBy };
      },

      // 搜索物品
      findItems(bag, criteria) {
        return bag.items.filter(item => {
          if (criteria.type && item.type !== criteria.type) return false;
          if (criteria.rarity && item.rarity !== criteria.rarity) return false;
          if (criteria.minLevel && (item.level || 0) < criteria.minLevel) return false;
          if (criteria.name && !item.name.includes(criteria.name)) return false;
          return true;
        });
      },

      // 获取背包统计
      getBagStats(bag) {
        const stats = {
          totalSlots: this.MAX_SLOTS,
          usedSlots: bag.items.length,
          emptySlots: this.MAX_SLOTS - bag.items.length,
          totalItems: bag.items.reduce((sum, i) => sum + i.quantity, 0),
          gold: bag.gold,
          itemsByType: {},
          itemsByRarity: {}
        };

        for (const item of bag.items) {
          // 按类型统计
          stats.itemsByType[item.type] = (stats.itemsByType[item.type] || 0) + item.quantity;

          // 按稀有度统计
          const rarity = item.rarity || 'common';
          stats.itemsByRarity[rarity] = (stats.itemsByRarity[rarity] || 0) + item.quantity;
        }

        return stats;
      },

      // 生成唯一ID
      generateUID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
      }
    };

    // 初始化测试数据
    mockHero = testUtils.createMockHero({
      hp: 50,
      maxHp: 100,
      mp: 30,
      maxMp: 50,
      level: 10
    });

    mockBag = InventorySystem.initBag();
  });

  describe('addItem()', () => {
    test('应成功添加物品到背包', () => {
      const item = testUtils.createMockItem({ id: 'potion', name: '生命药水' });
      const result = InventorySystem.addItem(mockBag, item);

      expect(result.success).toBe(true);
      expect(mockBag.items.length).toBe(1);
      expect(mockBag.items[0].id).toBe('potion');
    });

    test('可堆叠物品应合并', () => {
      const item = testUtils.createMockItem({
        id: 'potion',
        name: '生命药水',
        stackable: true
      });

      InventorySystem.addItem(mockBag, item, 5);
      InventorySystem.addItem(mockBag, item, 3);

      expect(mockBag.items.length).toBe(1);
      expect(mockBag.items[0].quantity).toBe(8);
    });

    test('不可堆叠物品应占用多个格子', () => {
      const item = testUtils.createMockItem({
        id: 'sword',
        name: '剑',
        stackable: false
      });

      InventorySystem.addItem(mockBag, item);
      InventorySystem.addItem(mockBag, item);

      expect(mockBag.items.length).toBe(2);
    });

    test('超过堆叠上限应失败', () => {
      const item = testUtils.createMockItem({
        id: 'arrow',
        name: '箭',
        stackable: true
      });

      InventorySystem.addItem(mockBag, item, 90);
      const result = InventorySystem.addItem(mockBag, item, 20);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('stack_overflow');
    });

    test('背包满时应失败', () => {
      // 填满背包
      for (let i = 0; i < InventorySystem.MAX_SLOTS; i++) {
        const item = testUtils.createMockItem({
          id: `item_${i}`,
          stackable: false
        });
        InventorySystem.addItem(mockBag, item);
      }

      const newItem = testUtils.createMockItem({ id: 'new_item' });
      const result = InventorySystem.addItem(mockBag, newItem);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('bag_full');
    });
  });

  describe('removeItem()', () => {
    beforeEach(() => {
      const item = testUtils.createMockItem({ id: 'potion', quantity: 10 });
      InventorySystem.addItem(mockBag, item, 10);
    });

    test('应成功移除物品', () => {
      const uid = mockBag.items[0].uid;
      const result = InventorySystem.removeItem(mockBag, uid, 3);

      expect(result.success).toBe(true);
      expect(mockBag.items[0].quantity).toBe(7);
    });

    test('移除所有数量应删除物品', () => {
      const uid = mockBag.items[0].uid;
      const result = InventorySystem.removeItem(mockBag, uid, 10);

      expect(result.success).toBe(true);
      expect(mockBag.items.length).toBe(0);
    });

    test('数量不足应失败', () => {
      const uid = mockBag.items[0].uid;
      const result = InventorySystem.removeItem(mockBag, uid, 20);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_quantity');
    });

    test('不存在的UID应失败', () => {
      const result = InventorySystem.removeItem(mockBag, 'invalid_uid', 1);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('item_not_found');
    });
  });

  describe('useItem()', () => {
    test('生命药水应恢复HP', () => {
      const potion = {
        id: 'heal_potion',
        name: '生命药水',
        consumable: true,
        healHp: 30
      };
      InventorySystem.addItem(mockBag, potion);
      const uid = mockBag.items[0].uid;

      const result = InventorySystem.useItem(mockBag, mockHero, uid);

      expect(result.success).toBe(true);
      expect(mockHero.hp).toBe(80); // 50 + 30
      expect(mockBag.items.length).toBe(0); // 消耗品被消耗
    });

    test('魔法药水应恢复MP', () => {
      const potion = {
        id: 'mana_potion',
        name: '魔法药水',
        consumable: true,
        healMp: 25
      };
      InventorySystem.addItem(mockBag, potion);
      const uid = mockBag.items[0].uid;

      InventorySystem.useItem(mockBag, mockHero, uid);

      expect(mockHero.mp).toBe(50); // 30 + 25 (不超过maxMp)
    });

    test('治疗不应超过最大HP', () => {
      mockHero.hp = 80;
      const potion = {
        id: 'heal_potion',
        name: '生命药水',
        consumable: true,
        healHp: 50
      };
      InventorySystem.addItem(mockBag, potion);
      const uid = mockBag.items[0].uid;

      InventorySystem.useItem(mockBag, mockHero, uid);

      expect(mockHero.hp).toBe(100); // 不超过maxHp
    });

    test('非消耗品使用后不应消失', () => {
      const item = {
        id: 'scroll',
        name: '卷轴',
        consumable: false,
        addExp: 100
      };
      InventorySystem.addItem(mockBag, item);
      const uid = mockBag.items[0].uid;

      InventorySystem.useItem(mockBag, mockHero, uid);

      expect(mockBag.items.length).toBe(1);
    });
  });

  describe('sellItem()', () => {
    test('应成功出售物品并获得金币', () => {
      const item = testUtils.createMockItem({
        id: 'sword',
        price: 100,
        quantity: 5
      });
      InventorySystem.addItem(mockBag, item, 5);
      const uid = mockBag.items[0].uid;

      const result = InventorySystem.sellItem(mockBag, uid, 2);

      expect(result.success).toBe(true);
      expect(result.goldEarned).toBe(200);
      expect(mockBag.gold).toBe(200);
      expect(mockBag.items[0].quantity).toBe(3);
    });

    test('出售所有物品应移除物品', () => {
      const item = testUtils.createMockItem({ price: 50 });
      InventorySystem.addItem(mockBag, item);
      const uid = mockBag.items[0].uid;

      InventorySystem.sellItem(mockBag, uid, 1);

      expect(mockBag.items.length).toBe(0);
    });
  });

  describe('sortBag()', () => {
    beforeEach(() => {
      InventorySystem.addItem(mockBag, { id: 'c', name: '铁剑', type: 'weapon' });
      InventorySystem.addItem(mockBag, { id: 'a', name: '木盾', type: 'shield' });
      InventorySystem.addItem(mockBag, { id: 'b', name: '布甲', type: 'armor' });
    });

    test('应按类型排序', () => {
      InventorySystem.sortBag(mockBag, 'type');

      expect(mockBag.items[0].type).toBe('armor');
      expect(mockBag.items[1].type).toBe('shield');
      expect(mockBag.items[2].type).toBe('weapon');
    });

    test('应按名称排序', () => {
      InventorySystem.sortBag(mockBag, 'name');

      expect(mockBag.items[0].name).toBe('布甲');
      expect(mockBag.items[1].name).toBe('木盾');
      expect(mockBag.items[2].name).toBe('铁剑');
    });
  });

  describe('findItems()', () => {
    beforeEach(() => {
      InventorySystem.addItem(mockBag, { id: '1', name: '铁剑', type: 'weapon', rarity: 'common' });
      InventorySystem.addItem(mockBag, { id: '2', name: '银剑', type: 'weapon', rarity: 'rare' });
      InventorySystem.addItem(mockBag, { id: '3', name: '铁甲', type: 'armor', rarity: 'common' });
    });

    test('应按类型搜索', () => {
      const results = InventorySystem.findItems(mockBag, { type: 'weapon' });

      expect(results.length).toBe(2);
      expect(results.every(i => i.type === 'weapon')).toBe(true);
    });

    test('应按稀有度搜索', () => {
      const results = InventorySystem.findItems(mockBag, { rarity: 'common' });

      expect(results.length).toBe(2);
    });

    test('应按名称搜索', () => {
      const results = InventorySystem.findItems(mockBag, { name: '剑' });

      expect(results.length).toBe(2);
    });
  });

  describe('getBagStats()', () => {
    test('应返回正确的统计信息', () => {
      InventorySystem.addItem(mockBag, { id: '1', type: 'weapon', rarity: 'common' }, 5);
      InventorySystem.addItem(mockBag, { id: '2', type: 'armor', rarity: 'rare' }, 3);
      mockBag.gold = 1000;

      const stats = InventorySystem.getBagStats(mockBag);

      expect(stats.totalSlots).toBe(100);
      expect(stats.usedSlots).toBe(2);
      expect(stats.totalItems).toBe(8);
      expect(stats.gold).toBe(1000);
      expect(stats.itemsByType.weapon).toBe(5);
      expect(stats.itemsByType.armor).toBe(3);
    });
  });
});
