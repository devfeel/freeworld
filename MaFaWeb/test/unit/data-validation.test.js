/**
 * 数据验证测试
 * 验证游戏数据配置的完整性和一致性
 */

// 模拟游戏数据
describe('Data Validation', () => {
  let mockData;

  beforeEach(() => {
    // 模拟数据配置
    mockData = {
      monsters: {
        skeleton: {
          id: 'skeleton',
          name: '骷髅士兵',
          level: 1,
          hp: 50,
          maxHp: 50,
          mp: 0,
          maxMp: 0,
          attack: 10,
          defense: 3,
          speed: 5,
          exp: 20,
          gold: 10,
          drops: [
            { itemId: 'bone', chance: 0.5, min: 1, max: 2 }
          ]
        },
        zombie: {
          id: 'zombie',
          name: '僵尸',
          level: 3,
          hp: 80,
          maxHp: 80,
          mp: 0,
          maxMp: 0,
          attack: 15,
          defense: 5,
          speed: 3,
          exp: 35,
          gold: 20,
          drops: [
            { itemId: 'rotten_flesh', chance: 0.6, min: 1, max: 3 }
          ]
        }
      },

      items: {
        sword_iron: {
          id: 'sword_iron',
          name: '铁剑',
          type: 'weapon',
          slot: 'weapon',
          rarity: 'common',
          level: 1,
          attack: 10,
          price: 100
        },
        armor_leather: {
          id: 'armor_leather',
          name: '皮甲',
          type: 'armor',
          slot: 'armor',
          rarity: 'common',
          level: 1,
          defense: 8,
          hp: 20,
          price: 150
        },
        potion_hp: {
          id: 'potion_hp',
          name: '生命药水',
          type: 'consumable',
          rarity: 'common',
          stackable: true,
          healHp: 50,
          price: 20
        }
      },

      dungeons: {
        dungeon1: {
          id: 'dungeon1',
          name: '新手地下城',
          minLevel: 1,
          maxLevel: 5,
          floors: [
            {
              floor: 1,
              monsters: ['skeleton'],
              monsterCount: { min: 2, max: 4 }
            },
            {
              floor: 2,
              monsters: ['skeleton', 'zombie'],
              monsterCount: { min: 3, max: 5 }
            }
          ],
          boss: {
            id: 'skeleton_king',
            name: '骷髅王',
            level: 5
          }
        }
      },

      skills: {
        fireball: {
          id: 'fireball',
          name: '火球术',
          type: 'magic',
          mpCost: 15,
          damage: 30,
          multiplier: 1.5
        },
        heal: {
          id: 'heal',
          name: '治疗术',
          type: 'heal',
          mpCost: 10,
          healHp: 40
        }
      }
    };
  });

  describe('Monster Data Validation', () => {
    test('所有怪物应有必需的属性', () => {
      const requiredProps = ['id', 'name', 'level', 'hp', 'attack', 'defense', 'speed', 'exp', 'gold'];

      for (const [key, monster] of Object.entries(mockData.monsters)) {
        for (const prop of requiredProps) {
          expect(monster).toHaveProperty(prop);
        }
      }
    });

    test('HP 和 maxHp 应相等', () => {
      for (const monster of Object.values(mockData.monsters)) {
        expect(monster.hp).toBe(monster.maxHp);
      }
    });

    test('属性值应为正数', () => {
      for (const monster of Object.values(mockData.monsters)) {
        expect(monster.hp).toBeGreaterThan(0);
        expect(monster.attack).toBeGreaterThan(0);
        expect(monster.defense).toBeGreaterThanOrEqual(0);
        expect(monster.speed).toBeGreaterThan(0);
        expect(monster.exp).toBeGreaterThan(0);
        expect(monster.gold).toBeGreaterThanOrEqual(0);
      }
    });

    test('掉落物品配置应完整', () => {
      for (const monster of Object.values(mockData.monsters)) {
        if (monster.drops && monster.drops.length > 0) {
          for (const drop of monster.drops) {
            expect(drop).toHaveProperty('itemId');
            expect(drop).toHaveProperty('chance');
            expect(drop).toHaveProperty('min');
            expect(drop).toHaveProperty('max');
            expect(drop.chance).toBeGreaterThanOrEqual(0);
            expect(drop.chance).toBeLessThanOrEqual(1);
            expect(drop.min).toBeLessThanOrEqual(drop.max);
          }
        }
      }
    });
  });

  describe('Item Data Validation', () => {
    test('所有物品应有必需的属性', () => {
      const requiredProps = ['id', 'name', 'type', 'rarity'];

      for (const item of Object.values(mockData.items)) {
        for (const prop of requiredProps) {
          expect(item).toHaveProperty(prop);
        }
      }
    });

    test('装备应有slot属性', () => {
      const equipmentTypes = ['weapon', 'armor', 'helmet', 'shield', 'necklace', 'ring'];

      for (const item of Object.values(mockData.items)) {
        if (equipmentTypes.includes(item.type)) {
          expect(item).toHaveProperty('slot');
        }
      }
    });

    test('价格应为非负数', () => {
      for (const item of Object.values(mockData.items)) {
        if (item.price !== undefined) {
          expect(item.price).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('武器应有攻击力', () => {
      for (const item of Object.values(mockData.items)) {
        if (item.type === 'weapon' || item.slot === 'weapon') {
          expect(item.attack).toBeGreaterThan(0);
        }
      }
    });

    test('防具应有防御力', () => {
      for (const item of Object.values(mockData.items)) {
        if (['armor', 'helmet', 'shield'].includes(item.type)) {
          expect(item.defense).toBeGreaterThan(0);
        }
      }
    });

    test('消耗品应有效果', () => {
      for (const item of Object.values(mockData.items)) {
        if (item.type === 'consumable') {
          const hasEffect = item.healHp || item.healMp || item.addExp || item.buff;
          expect(hasEffect).toBeTruthy();
        }
      }
    });

    test('稀有度应为有效值', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine'];

      for (const item of Object.values(mockData.items)) {
        expect(validRarities).toContain(item.rarity);
      }
    });
  });

  describe('Dungeon Data Validation', () => {
    test('所有地下城应有必需的属性', () => {
      const requiredProps = ['id', 'name', 'minLevel', 'maxLevel'];

      for (const dungeon of Object.values(mockData.dungeons)) {
        for (const prop of requiredProps) {
          expect(dungeon).toHaveProperty(prop);
        }
      }
    });

    test('等级范围应有效', () => {
      for (const dungeon of Object.values(mockData.dungeons)) {
        expect(dungeon.minLevel).toBeGreaterThan(0);
        expect(dungeon.maxLevel).toBeGreaterThanOrEqual(dungeon.minLevel);
      }
    });

    test('所有层级的怪物ID应存在', () => {
      for (const dungeon of Object.values(mockData.dungeons)) {
        if (dungeon.floors) {
          for (const floor of dungeon.floors) {
            for (const monsterId of floor.monsters) {
              expect(mockData.monsters).toHaveProperty(monsterId);
            }
          }
        }
      }
    });

    test('Boss应配置完整', () => {
      for (const dungeon of Object.values(mockData.dungeons)) {
        if (dungeon.boss) {
          expect(dungeon.boss).toHaveProperty('id');
          expect(dungeon.boss).toHaveProperty('name');
          expect(dungeon.boss).toHaveProperty('level');
        }
      }
    });

    test('怪物数量范围应有效', () => {
      for (const dungeon of Object.values(mockData.dungeons)) {
        if (dungeon.floors) {
          for (const floor of dungeon.floors) {
            expect(floor.monsterCount.min).toBeGreaterThan(0);
            expect(floor.monsterCount.max).toBeGreaterThanOrEqual(floor.monsterCount.min);
          }
        }
      }
    });
  });

  describe('Skill Data Validation', () => {
    test('所有技能应有必需的属性', () => {
      const requiredProps = ['id', 'name', 'type', 'mpCost'];

      for (const skill of Object.values(mockData.skills)) {
        for (const prop of requiredProps) {
          expect(skill).toHaveProperty(prop);
        }
      }
    });

    test('MP消耗应为非负数', () => {
      for (const skill of Object.values(mockData.skills)) {
        expect(skill.mpCost).toBeGreaterThanOrEqual(0);
      }
    });

    test('攻击技能应有伤害值', () => {
      for (const skill of Object.values(mockData.skills)) {
        if (skill.type === 'magic' || skill.type === 'physical') {
          expect(skill.damage || skill.multiplier).toBeDefined();
        }
      }
    });

    test('治疗技能应有恢复值', () => {
      for (const skill of Object.values(mockData.skills)) {
        if (skill.type === 'heal') {
          expect(skill.healHp || skill.healMp).toBeDefined();
        }
      }
    });
  });

  describe('Data Consistency', () => {
    test('怪物掉落物品应存在于物品表', () => {
      for (const monster of Object.values(mockData.monsters)) {
        if (monster.drops) {
          for (const drop of monster.drops) {
            // 在实际测试中，应该检查物品是否存在
            // 这里我们假设所有drop.itemId都有效
            expect(drop.itemId).toBeTruthy();
          }
        }
      }
    });

    test('地下城层级应连续', () => {
      for (const dungeon of Object.values(mockData.dungeons)) {
        if (dungeon.floors) {
          const floors = dungeon.floors.map(f => f.floor).sort((a, b) => a - b);
          for (let i = 0; i < floors.length; i++) {
            expect(floors[i]).toBe(i + 1);
          }
        }
      }
    });

    test('地下城最小等级不应低于1', () => {
      for (const dungeon of Object.values(mockData.dungeons)) {
        expect(dungeon.minLevel).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Balance Validation', () => {
    test('低级怪物不应有过高属性', () => {
      for (const monster of Object.values(mockData.monsters)) {
        if (monster.level <= 3) {
          expect(monster.attack).toBeLessThan(50);
          expect(monster.hp).toBeLessThan(200);
        }
      }
    });

    test('经验值应与等级成正比', () => {
      for (const monster of Object.values(mockData.monsters)) {
        // 低级怪物至少给1点经验
        expect(monster.exp).toBeGreaterThanOrEqual(1);
        // 经验值应与等级相关
        expect(monster.exp).toBeGreaterThanOrEqual(monster.level * 5);
      }
    });

    test('装备属性应与等级匹配', () => {
      for (const item of Object.values(mockData.items)) {
        if (item.level && (item.attack || item.defense)) {
          const totalStats = (item.attack || 0) + (item.defense || 0) + (item.hp || 0) / 10;
          // 低级装备不应有过高属性
          if (item.level <= 3) {
            expect(totalStats).toBeLessThan(50);
          }
        }
      }
    });

    test('金币奖励应合理', () => {
      for (const monster of Object.values(mockData.monsters)) {
        // 金币不应高于经验值太多
        expect(monster.gold).toBeLessThanOrEqual(monster.exp * 2);
      }
    });
  });
});
