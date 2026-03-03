# Monster AI Specification

## ADDED Requirements

### Requirement: Smart Monster Actions
The system SHALL support intelligent monster behavior beyond random attacks.

#### Scenario: Monster selects optimal target
- **GIVEN** monster faces multiple party members (future)
- **WHEN** monster attacks
- **THEN** monster targets the lowest HP member

#### Scenario: Monster uses skills strategically
- **GIVEN** monster has multiple skills available
- **WHEN** monster's turn comes
- **THEN** monster selects skill based on battle situation (HP, buffs, etc.)

### Requirement: Monster AI Modes
The system SHALL support different AI behavior modes.

#### Scenario: Aggressive AI
- **GIVEN** monster has aggressive AI type
- **WHEN** battle starts
- **THEN** monster always attacks, prioritizing hero

#### Scenario: Defensive AI
- **GIVEN** monster has defensive AI type
- **WHEN** monster's HP is below 30%
- **THEN** monster may use defensive skills or potions

### Requirement: Boss AI Patterns
The system SHALL support special AI patterns for boss monsters.

#### Scenario: Boss phase transitions
- **GIVEN** boss monster has phase abilities
- **WHEN** boss HP reaches certain thresholds
- **THEN** boss enters new phase with increased stats or new abilities
