## ADDED Requirements

### Requirement: Record battle statistics
The system SHALL record combat statistics during battle, including damage dealt, damage taken, number of attacks, and kills.

#### Scenario: Record damage dealt
- **WHEN** the hero deals damage to an enemy
- **THEN** the system SHALL record the damage amount to the statistics tracker

#### Scenario: Record damage taken
- **WHEN** the enemy deals damage to the hero
- **THEN** the system SHALL record the damage amount to the statistics tracker

#### Scenario: Record critical hits
- **WHEN** a critical hit occurs
- **THEN** the system SHALL increment the critical hit counter

#### Scenario: Record dodged attacks
- **WHEN** an attack is dodged
- **THEN** the system SHALL increment the dodge counter

#### Scenario: Record skill usage
- **WHEN** a skill is used
- **THEN** the system SHALL increment the usage count for that skill

#### Scenario: Retrieve battle statistics
- **WHEN** the battle ends or statistics are requested
- **THEN** the system SHALL provide a summary of all recorded statistics

### Requirement: Reset battle statistics
The system SHALL provide a method to reset battle statistics between separate battles.

#### Scenario: Reset statistics before new battle
- **WHEN** a new battle begins
- **THEN** the system SHALL reset all statistics counters to zero

### Requirement: Toggle statistics recording
The system SHALL allow statistics recording to be enabled or disabled.

#### Scenario: Disable statistics recording
- **WHEN** statistics recording is disabled
- **THEN** the system SHALL NOT record any battle data

#### Scenario: Enable statistics recording
- **WHEN** statistics recording is enabled
- **THEN** the system SHALL resume recording battle data
