# Damage Formula Specification

## ADDED Requirements

### Requirement: Enhanced Damage Calculation
The system SHALL use an improved damage formula that accounts for all combat attributes.

#### Scenario: Calculate physical damage with attributes
- **GIVEN** attacker has attack, defense, crit, and other relevant attributes
- **WHEN** attacker performs physical attack
- **THEN** damage = (attack - defense × defenseFactor) × (1 + critBonus) × attributeMultipliers

#### Scenario: Calculate magical damage
- **GIVEN** attacker has magicAttack and enemy has magicDefense
- **WHEN** attacker performs magical attack
- **THEN** damage = (magicAttack - enemyMagicDefense × defenseFactor) × skillMultiplier

### Requirement: Critical Hit Bonus
The system SHALL calculate critical hit damage with configurable multiplier.

#### Scenario: Critical hit damage
- **GIVEN** attacker crit >= random(0, 100)
- **WHEN** critical hit occurs
- **THEN** damage is multiplied by critDamage multiplier (default 1.5)

### Requirement: Defense Diminishing Returns
The system SHALL implement diminishing returns on defense to prevent excessive mitigation.

#### Scenario: Defense scaling
- **GIVEN** defender has high defense value
- **WHEN** damage is calculated
- **THEN** defense effectiveness decreases logarithmically with higher values
