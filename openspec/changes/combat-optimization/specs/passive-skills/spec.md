# Passive Skills Specification

## ADDED Requirements

### Requirement: Passive Skill System
The system SHALL support passive skills that provide constant bonuses without manual activation.

#### Scenario: Passive skill provides stat bonus
- **GIVEN** hero has equipped passive skill
- **WHEN** battle starts or skill is equipped
- **THEN** the skill's stat bonuses are applied to hero's total stats

#### Scenario: Multiple passive skills stack
- **GIVEN** hero has multiple passive skills
- **WHEN** stats are calculated
- **THEN** all passive skill bonuses stack additively

### Requirement: Aura/Permanent Passive Skills
The system SHALL support aura skills that affect the entire party.

#### Scenario: Aura skill affects party members
- **GIVEN** hero has equipped aura skill
- **WHEN** battle starts
- **THEN** all party members receive the aura's stat bonuses
