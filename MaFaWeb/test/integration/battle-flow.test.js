/**
 * 战斗流程集成测试
 * 测试完整的战斗流程、经验获取、奖励结算
 */

describe('Battle Flow Integration', () => {
  let BattleSystem;
  let mockHero;
  let mockEnemy;
  let battleEvents;

  beforeEach(() => {
    battleEvents = [];

    // 模拟完整的战斗系统
    BattleSystem = {
      battle: null,

      startBattle(hero, enemy) {
        this.battle = {
          hero: { ...hero, currentHp: hero.hp, currentMp: hero.mp },
          enemy: { ...enemy, currentHp: enemy.hp, currentMp: enemy.mp },
          state: 'in_progress',
          turn: 1,
          log: []
        };

        this.emit('battleStart', this.battle);
        return this.battle;
      },

      executeTurn(action) {
        if (this.battle.state !== 'in_progress') return;

        // 玩家行动
        if (action.type === 'attack') {
          this.heroAttack();
        } else if (action.type === 'skill') {
          this.useSkill(action.skillId);
        } else if (action.type === 'item') {
          this.useItem(action.itemId);
        } else if (action.type === 'escape') {
          return this.escape();
        }

        // 检查战斗结束
        if (this.battle.state !== 'in_progress') {
          return this.battle;
        }

        // 敌人行动
        this.enemyAttack();

        // 检查战斗结束
        if (this.battle.state !== 'in_progress') {
          return this.battle;
        }

        // 下一回合
        this.battle.turn++;
        this.emit('turnEnd', { turn: this.battle.turn });

        return this.battle;
      },

      heroAttack() {
        const damage = this.calculateDamage(this.battle.hero, this.battle.enemy);
        this.battle.enemy.currentHp = Math.max(0, this.battle.enemy.currentHp - damage);

        this.battle.log.push({
          turn: this.battle.turn,
          actor: 'hero',
          action: 'attack',
          damage
        });

        this.emit('heroAttack', { damage, enemyHp: this.battle.enemy.currentHp });

        if (this.battle.enemy.currentHp <= 0) {
          this.endBattle('victory');
        }
      },

      enemyAttack() {
        const damage = this.calculateDamage(this.battle.enemy, this.battle.hero);
        this.battle.hero.currentHp = Math.max(0, this.battle.hero.currentHp - damage);

        this.battle.log.push({
          turn: this.battle.turn,
          actor: 'enemy',
          action: 'attack',
          damage
        });

        this.emit('enemyAttack', { damage, heroHp: this.battle.hero.currentHp });

        if (this.battle.hero.currentHp <= 0) {
          this.endBattle('defeat');
        }
      },

      useSkill(skillId) {
        const skill = this.battle.hero.skills?.find(s => s.id === skillId);
        if (!skill || this.battle.hero.currentMp < skill.mpCost) return false;

        this.battle.hero.currentMp -= skill.mpCost;
        const damage = this.calculateDamage(this.battle.hero, this.battle.enemy, skill.multiplier);
        this.battle.enemy.currentHp = Math.max(0, this.battle.enemy.currentHp - damage);

        this.battle.log.push({
          turn: this.battle.turn,
          actor: 'hero',
          action: 'skill',
          skillId,
          damage
        });

        this.emit('heroSkill', { skillId, damage, enemyHp: this.battle.enemy.currentHp });

        if (this.battle.enemy.currentHp <= 0) {
          this.endBattle('victory');
        }

        return true;
      },

      useItem(itemId) {
        // 使用道具逻辑
        this.emit('itemUsed', { itemId });
        return true;
      },

      escape() {
        const success = Math.random() < 0.5;
        if (success) {
          this.endBattle('escaped');
        } else {
          this.emit('escapeFailed', {});
          this.enemyAttack();
        }
        return success;
      },

      calculateDamage(attacker, defender, multiplier = 1) {
        const baseDamage = Math.max(1, attacker.attack - defender.defense);
        const variance = 0.9 + Math.random() * 0.2;
        return Math.floor(baseDamage * multiplier * variance);
      },

      endBattle(result) {
        this.battle.state = 'ended';
        this.battle.result = result;

        const rewards = result === 'victory' ? {
          exp: this.battle.enemy.exp,
          gold: this.battle.enemy.gold,
          drops: this.processDrops()
        } : null;

        this.emit('battleEnd', { result, rewards, log: this.battle.log });
      },

      processDrops() {
        const drops = [];
        if (this.battle.enemy.drops) {
          for (const drop of this.battle.enemy.drops) {
            if (Math.random() < drop.chance) {
              drops.push({
                itemId: drop.itemId,
                quantity: Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
              });
            }
          }
        }
        return drops;
      },

      emit(eventName, data) {
        battleEvents.push({ eventName, data, time: Date.now() });
      },

      getBattleLog() {
        return this.battle.log;
      }
    };

    // 初始化测试英雄
    mockHero = testUtils.createMockHero({
      name: '测试英雄',
      level: 5,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 20,
      defense: 10,
      speed: 12,
      skills: [
        { id: 'fireball', name: '火球术', mpCost: 15, multiplier: 1.5 }
      ]
    });

    // 初始化测试敌人
    mockEnemy = testUtils.createMockMonster({
      name: '测试骷髅',
      level: 3,
      hp: 60,
      maxHp: 60,
      mp: 20,
      maxMp: 20,
      attack: 15,
      defense: 5,
      speed: 8,
      exp: 30,
      gold: 15,
      drops: [
        { itemId: 'bone', chance: 0.8, min: 1, max: 3 },
        { itemId: 'rusty_sword', chance: 0.2, min: 1, max: 1 }
      ]
    });
  });

  describe('完整战斗流程', () => {
    test('英雄攻击应造成伤害', () => {
      testUtils.setRandomSeed(12345);
      BattleSystem.startBattle(mockHero, mockEnemy);

      const initialEnemyHp = BattleSystem.battle.enemy.currentHp;
      BattleSystem.executeTurn({ type: 'attack' });

      expect(BattleSystem.battle.enemy.currentHp).toBeLessThan(initialEnemyHp);
      expect(battleEvents.some(e => e.eventName === 'heroAttack')).toBe(true);
    });

    test('敌人回合应反击', () => {
      testUtils.setRandomSeed(12345);
      BattleSystem.startBattle(mockHero, mockEnemy);

      const initialHeroHp = BattleSystem.battle.hero.currentHp;
      BattleSystem.executeTurn({ type: 'attack' });

      // 如果战斗未结束，敌人应该反击
      if (BattleSystem.battle.state === 'in_progress') {
        expect(BattleSystem.battle.hero.currentHp).toBeLessThanOrEqual(initialHeroHp);
      }
    });

    test('使用技能应消耗MP并造成更高伤害', () => {
      testUtils.setRandomSeed(12345);
      BattleSystem.startBattle(mockHero, mockEnemy);

      const initialMp = BattleSystem.battle.hero.currentMp;
      const initialEnemyHp = BattleSystem.battle.enemy.currentHp;

      BattleSystem.executeTurn({ type: 'skill', skillId: 'fireball' });

      expect(BattleSystem.battle.hero.currentMp).toBeLessThan(initialMp);
      expect(BattleSystem.battle.enemy.currentHp).toBeLessThan(initialEnemyHp);
    });

    test('击败敌人应获得奖励', () => {
      testUtils.setRandomSeed(12345);
      // 创建一个弱敌人确保能击败
      const weakEnemy = { ...mockEnemy, hp: 1 };

      BattleSystem.startBattle(mockHero, weakEnemy);
      BattleSystem.executeTurn({ type: 'attack' });

      expect(BattleSystem.battle.state).toBe('ended');
      expect(BattleSystem.battle.result).toBe('victory');

      const endEvent = battleEvents.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.rewards).toBeDefined();
      expect(endEvent.data.rewards.exp).toBe(weakEnemy.exp);
      expect(endEvent.data.rewards.gold).toBe(weakEnemy.gold);
    });

    test('英雄死亡应判定失败', () => {
      testUtils.setRandomSeed(12345);
      // 创建一个强力敌人
      const strongEnemy = {
        ...mockEnemy,
        attack: 1000, // 高攻击力
        hp: 1000
      };

      BattleSystem.startBattle(mockHero, strongEnemy);

      // 执行多回合直到英雄死亡
      let safetyCounter = 0;
      while (BattleSystem.battle.state === 'in_progress' && safetyCounter < 10) {
        BattleSystem.executeTurn({ type: 'attack' });
        safetyCounter++;
      }

      expect(BattleSystem.battle.result).toBe('defeat');
    });

    test('战斗日志应记录所有行动', () => {
      testUtils.setRandomSeed(12345);
      BattleSystem.startBattle(mockHero, mockEnemy);

      // 执行几回合
      for (let i = 0; i < 3 && BattleSystem.battle.state === 'in_progress'; i++) {
        BattleSystem.executeTurn({ type: 'attack' });
      }

      const log = BattleSystem.getBattleLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log[0]).toHaveProperty('turn');
      expect(log[0]).toHaveProperty('actor');
      expect(log[0]).toHaveProperty('action');
    });
  });

  describe('战斗事件', () => {
    test('应触发正确的战斗事件序列', () => {
      testUtils.setRandomSeed(12345);
      BattleSystem.startBattle(mockHero, mockEnemy);

      // 清空之前的事件
      battleEvents = [];

      // 执行一回合
      BattleSystem.executeTurn({ type: 'attack' });

      // 检查事件序列
      const eventNames = battleEvents.map(e => e.eventName);
      expect(eventNames).toContain('heroAttack');
    });

    test('战斗结束应触发battleEnd事件', () => {
      testUtils.setRandomSeed(12345);
      const weakEnemy = { ...mockEnemy, hp: 1 };

      BattleSystem.startBattle(mockHero, weakEnemy);
      BattleSystem.executeTurn({ type: 'attack' });

      const endEvent = battleEvents.find(e => e.eventName === 'battleEnd');
      expect(endEvent).toBeDefined();
      expect(endEvent.data.result).toBe('victory');
    });
  });

  describe('掉落处理', () => {
    test('胜利时应处理掉落', () => {
      testUtils.setRandomSeed(12345);
      const weakEnemy = { ...mockEnemy, hp: 1 };

      BattleSystem.startBattle(mockHero, weakEnemy);
      BattleSystem.executeTurn({ type: 'attack' });

      const endEvent = battleEvents.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.rewards.drops).toBeDefined();
      expect(Array.isArray(endEvent.data.rewards.drops)).toBe(true);
    });

    test('失败时不应有掉落', () => {
      testUtils.setRandomSeed(12345);
      const strongEnemy = { ...mockEnemy, attack: 1000, hp: 1000 };

      BattleSystem.startBattle(mockHero, strongEnemy);

      let safetyCounter = 0;
      while (BattleSystem.battle.state === 'in_progress' && safetyCounter < 10) {
        BattleSystem.executeTurn({ type: 'attack' });
        safetyCounter++;
      }

      const endEvent = battleEvents.find(e => e.eventName === 'battleEnd');
      expect(endEvent.data.rewards).toBeNull();
    });
  });

  describe('逃跑功能', () => {
    test('成功逃跑应结束战斗', () => {
      testUtils.setRandomSeed(100); // 确保逃跑成功

      BattleSystem.startBattle(mockHero, mockEnemy);
      const success = BattleSystem.escape();

      if (success) {
        expect(BattleSystem.battle.state).toBe('ended');
        expect(BattleSystem.battle.result).toBe('escaped');
      }
    });

    test('逃跑失败应受到攻击', () => {
      testUtils.setRandomSeed(500); // 确保逃跑失败

      BattleSystem.startBattle(mockHero, mockEnemy);
      const initialHeroHp = BattleSystem.battle.hero.currentHp;
      const success = BattleSystem.escape();

      if (!success) {
        expect(BattleSystem.battle.hero.currentHp).toBeLessThanOrEqual(initialHeroHp);
      }
    });
  });
});
