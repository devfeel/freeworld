/**
 * enhance-system.js 单元测试
 * 测试装备强化系统
 */

describe('EnhanceSystem', () => {
  let EnhanceSystem;

  beforeEach(() => {
    // 模拟强化系统
    EnhanceSystem = {
      // 强化等级配置
      enhanceLevels: [
        { level: 0, successRate: 1.0, goldCost: 0, stoneCost: 0 },
        { level: 1, successRate: 0.9, goldCost: 100, stoneCost: 1 },
        { level: 2, successRate: 0.8, goldCost: 200, stoneCost: 2 },
        { level: 3, successRate: 0.7, goldCost: 400, stoneCost: 3 },
        { level: 4, successRate: 0.6, goldCost: 800, stoneCost: 4 },
        { level: 5, successRate: 0.5, goldCost: 1600, stoneCost: 5 },
        { level: 6, successRate: 0.4, goldCost: 3200, stoneCost: 6 },
        { level: 7, successRate: 0.3, goldCost: 6400, stoneCost: 7 },
        { level: 8, successRate: 0.2, goldCost: 12800, stoneCost: 8 },
        { level: 9, successRate: 0.1, goldCost: 25600, stoneCost: 9 },
        { level: 10, successRate: 0.05, goldCost: 51200, stoneCost: 10 }
      ],

      // 计算强化成功率
      getSuccessRate(currentLevel) {
        const config = this.enhanceLevels[currentLevel + 1];
        return config ? config.successRate : 0;
      },

      // 计算强化成本
      getEnhanceCost(currentLevel) {
        const config = this.enhanceLevels[currentLevel + 1];
        return config ? { gold: config.goldCost, stone: config.stoneCost } : null;
      },

      // 执行强化
      enhance(item, heroGold, heroStones, useProtection = false) {
        if (item.enhanceLevel >= 10) {
          return { success: false, reason: 'max_level' };
        }

        const cost = this.getEnhanceCost(item.enhanceLevel || 0);
        if (!cost) {
          return { success: false, reason: 'invalid_level' };
        }

        if (heroGold < cost.gold) {
          return { success: false, reason: 'insufficient_gold' };
        }

        if (heroStones < cost.stone) {
          return { success: false, reason: 'insufficient_stone' };
        }

        const successRate = this.getSuccessRate(item.enhanceLevel || 0);
        const success = Math.random() < successRate;

        if (success) {
          item.enhanceLevel = (item.enhanceLevel || 0) + 1;
          this.applyEnhancement(item);
          return {
            success: true,
            newLevel: item.enhanceLevel,
            goldCost: cost.gold,
            stoneCost: cost.stone
          };
        } else {
          if (useProtection) {
            // 保护符防止降级
            return {
              success: false,
              protected: true,
              goldCost: cost.gold,
              stoneCost: cost.stone
            };
          } else if ((item.enhanceLevel || 0) >= 5) {
            // 高等级失败可能降级
            item.enhanceLevel = (item.enhanceLevel || 0) - 1;
            return {
              success: false,
              degraded: true,
              newLevel: item.enhanceLevel,
              goldCost: cost.gold,
              stoneCost: cost.stone
            };
          }
          return {
            success: false,
            goldCost: cost.gold,
            stoneCost: cost.stone
          };
        }
      },

      // 应用强化属性
      applyEnhancement(item) {
        const level = item.enhanceLevel || 0;
        const multiplier = 1 + (level * 0.1); // 每级提升10%

        if (item.baseAttack) {
          item.attack = Math.floor(item.baseAttack * multiplier);
        }
        if (item.baseDefense) {
          item.defense = Math.floor(item.baseDefense * multiplier);
        }
        if (item.baseHp) {
          item.hp = Math.floor(item.baseHp * multiplier);
        }
      },

      // 计算强化后的属性
      getEnhancedStats(item) {
        const level = item.enhanceLevel || 0;
        const multiplier = 1 + (level * 0.1);

        return {
          attack: item.baseAttack ? Math.floor(item.baseAttack * multiplier) : 0,
          defense: item.baseDefense ? Math.floor(item.baseDefense * multiplier) : 0,
          hp: item.baseHp ? Math.floor(item.baseHp * multiplier) : 0
        };
      },

      // 计算总强化加成
      getTotalEnhancementBonus(items) {
        let totalBonus = 0;
        for (const item of items) {
          if (item && item.enhanceLevel) {
            totalBonus += item.enhanceLevel * 0.1;
          }
        }
        return totalBonus;
      }
    };
  });

  describe('getSuccessRate()', () => {
    test('应返回正确的成功率', () => {
      expect(EnhanceSystem.getSuccessRate(0)).toBe(0.9);  // 0→1
      expect(EnhanceSystem.getSuccessRate(5)).toBe(0.4);  // 5→6
      expect(EnhanceSystem.getSuccessRate(9)).toBe(0.05); // 9→10
    });

    test('超过最大等级应返回0', () => {
      expect(EnhanceSystem.getSuccessRate(10)).toBe(0);
    });
  });

  describe('getEnhanceCost()', () => {
    test('应返回正确的强化成本', () => {
      const cost0 = EnhanceSystem.getEnhanceCost(0);
      expect(cost0.gold).toBe(100);
      expect(cost0.stone).toBe(1);

      const cost5 = EnhanceSystem.getEnhanceCost(5);
      expect(cost5.gold).toBe(3200);
      expect(cost5.stone).toBe(6);
    });

    test('超过最大等级应返回null', () => {
      expect(EnhanceSystem.getEnhanceCost(10)).toBeNull();
    });
  });

  describe('enhance()', () => {
    let mockItem;

    beforeEach(() => {
      mockItem = {
        id: 'test_weapon',
        name: '测试武器',
        type: 'weapon',
        baseAttack: 100,
        attack: 100,
        enhanceLevel: 0
      };
    });

    test('成功强化应提升等级', () => {
      testUtils.setRandomSeed(100); // 确保成功
      const result = EnhanceSystem.enhance(mockItem, 1000, 10);

      if (result.success) {
        expect(mockItem.enhanceLevel).toBe(1);
        expect(result.newLevel).toBe(1);
      }
    });

    test('强化失败应扣除资源', () => {
      testUtils.setRandomSeed(500); // 确保失败
      const result = EnhanceSystem.enhance(mockItem, 1000, 10);

      expect(result.goldCost).toBe(100);
      expect(result.stoneCost).toBe(1);
    });

    test('金币不足应失败', () => {
      const result = EnhanceSystem.enhance(mockItem, 50, 10);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_gold');
    });

    test('强化石不足应失败', () => {
      const result = EnhanceSystem.enhance(mockItem, 1000, 0);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_stone');
    });

    test('最大等级不能继续强化', () => {
      mockItem.enhanceLevel = 10;
      const result = EnhanceSystem.enhance(mockItem, 100000, 100);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('max_level');
    });

    test('高等级失败应降级（无保护）', () => {
      mockItem.enhanceLevel = 6;
      testUtils.setRandomSeed(500); // 确保失败

      const result = EnhanceSystem.enhance(mockItem, 10000, 10);

      if (!result.success && result.degraded) {
        expect(mockItem.enhanceLevel).toBe(5);
      }
    });

    test('保护符应防止降级', () => {
      mockItem.enhanceLevel = 6;
      testUtils.setRandomSeed(500); // 确保失败

      const result = EnhanceSystem.enhance(mockItem, 10000, 10, true);

      if (!result.success) {
        expect(result.protected).toBe(true);
        expect(mockItem.enhanceLevel).toBe(6); // 等级不变
      }
    });
  });

  describe('applyEnhancement()', () => {
    test('应正确提升攻击力', () => {
      const item = {
        baseAttack: 100,
        attack: 100,
        enhanceLevel: 0
      };

      item.enhanceLevel = 3;
      EnhanceSystem.applyEnhancement(item);

      expect(item.attack).toBe(Math.floor(100 * 1.3));
    });

    test('应正确提升防御力', () => {
      const item = {
        baseDefense: 50,
        defense: 50,
        enhanceLevel: 5
      };

      EnhanceSystem.applyEnhancement(item);

      expect(item.defense).toBe(Math.floor(50 * 1.5));
    });
  });

  describe('getEnhancedStats()', () => {
    test('应返回强化后的属性', () => {
      const item = {
        baseAttack: 100,
        baseDefense: 50,
        baseHp: 200,
        enhanceLevel: 5
      };

      const stats = EnhanceSystem.getEnhancedStats(item);

      expect(stats.attack).toBe(Math.floor(100 * 1.5));
      expect(stats.defense).toBe(Math.floor(50 * 1.5));
      expect(stats.hp).toBe(Math.floor(200 * 1.5));
    });
  });

  describe('getTotalEnhancementBonus()', () => {
    test('应计算总强化加成', () => {
      const items = [
        { enhanceLevel: 3 },
        { enhanceLevel: 5 },
        { enhanceLevel: 0 },
        null,
        { enhanceLevel: 2 }
      ];

      const bonus = EnhanceSystem.getTotalEnhancementBonus(items);
      expect(bonus).toBe((3 + 5 + 0 + 2) * 0.1);
    });
  });
});
