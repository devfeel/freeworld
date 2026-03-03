# Buff System Specification

## ADDED Requirements

### Requirement: Buff Effects
The system SHALL support temporary buff effects that modify stats or abilities.

#### Scenario: Apply buff to character
- **GIVEN** character receives a buff
- **WHEN** buff is applied
- **THEN** character's specified stats are modified for buff duration

#### Scenario: Buff expires
- **GIVEN** character has an active buff with duration
- **WHEN** buff duration reaches zero
- **THEN** buff is removed and stat modifiers are reverted

### Requirement: Debuff Effects
The system SHALL support debuff effects that impair the target.

#### Scenario: Apply debuff to enemy
- **GIVEN** enemy receives a debuff (e.g., poison, stun)
- **WHEN** debuff is applied
- **THEN** enemy's stats are reduced or actions are limited for debuff duration

#### Scenario: Debuff damage over time
- **GIVEN** enemy has DoT (Damage over Time) debuff
- **WHEN** each turn passes
- **THEN** enemy takes specified damage
