# Combat Attributes Specification

## ADDED Requirements

### Requirement: Life Steal Attribute
The system SHALL support life steal attribute that heals the attacker for a percentage of damage dealt.

#### Scenario: Life steal on successful attack
- **GIVEN** attacker has lifeSteal > 0
- **WHEN** attacker deals damage to defender
- **THEN** attacker heals for (damage × lifeSteal%) HP

#### Scenario: Life steal capped by max HP
- **GIVEN** attacker has lifeSteal > 0 and current HP is near max
- **WHEN** life steal would exceed max HP
- **THEN** healing is capped at max HP

### Requirement: Damage Reflection Attribute
The system SHALL support damage reflection that returns a portion of received damage to the attacker.

#### Scenario: Reflect damage on being attacked
- **GIVEN** defender has reflectDamage > 0
- **WHEN** defender takes damage from attacker
- **THEN** attacker takes (damage × reflectDamage%) as reflected damage

### Requirement: HP/MP Regen Attribute
The system SHALL support HP and MP regeneration at the end of each turn.

#### Scenario: HP regeneration
- **GIVEN** hero has hpRegen > 0
- **WHEN** hero's turn ends
- **THEN** hero heals for hpRegen amount

#### Scenario: MP regeneration
- **GIVEN** hero has mpRegen > 0
- **WHEN** hero's turn ends
- **THEN** hero recovers mpRegen amount

### Requirement: Accuracy Attribute
The system SHALL support accuracy attribute that increases hit chance.

#### Scenario: Accuracy affects hit chance
- **GIVEN** attacker has accuracy > 0
- **WHEN** attacker attempts to hit defender
- **THEN** hit chance increases by accuracy%
