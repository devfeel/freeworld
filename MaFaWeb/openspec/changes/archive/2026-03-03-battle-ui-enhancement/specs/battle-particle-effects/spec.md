## ADDED Requirements

### Requirement: Particle system
The system SHALL provide a particle system for rendering visual effects during battle.

#### Scenario: Create particle pool
- **WHEN** the battle page initializes
- **THEN** the system SHALL create a pool of reusable particles

#### Scenario: Emit damage particle
- **WHEN** damage is dealt
- **THEN** the system SHALL emit damage particles at the target location

#### Scenario: Emit critical hit particle
- **WHEN** a critical hit occurs
- **THEN** the system SHALL emit gold-colored particles with explosion effect

#### Scenario: Emit skill effect particles
- **WHEN** a skill is used
- **THEN** the system SHALL emit skill-specific particles matching the skill type

### Requirement: Particle lifecycle management
The system SHALL manage particle creation, update, and destruction to prevent memory leaks.

#### Scenario: Update particle position
- **WHEN** a frame renders
- **THEN** each active particle SHALL update its position based on velocity

#### Scenario: Remove expired particles
- **WHEN** a particle reaches its lifetime
- **THEN** the system SHALL remove it from the active particles list
- **AND** return it to the particle pool

#### Scenario: Maximum particle limit
- **WHEN** the active particle count exceeds the configured maximum
- **THEN** the system SHALL NOT create new particles until space is available

### Requirement: Performance-based particle limits
The system SHALL adjust particle limits based on performance mode.

#### Scenario: High performance mode
- **WHEN** performance mode is set to "high"
- **THEN** the system SHALL allow up to 100 active particles

#### Scenario: Balanced performance mode
- **WHEN** performance mode is set to "balanced"
- **THEN** the system SHALL allow up to 50 active particles

#### Scenario: Low power mode
- **WHEN** performance mode is set to "low"
- **THEN** the system SHALL allow up to 10 active particles

### Requirement: Particle types
The system SHALL support different particle types with distinct visual properties.

#### Scenario: Damage number particle
- **WHEN** a damage number particle renders
- **THEN** it SHALL display as a floating number with red color
- **AND** fade out over 1.5 seconds

#### Scenario: Heal number particle
- **WHEN** a heal number particle renders
- **THEN** it SHALL display as a floating number with green color
- **AND** fade out over 1.5 seconds

#### Scenario: Spark particle
- **WHEN** a spark particle renders
- **THEN** it SHALL display as small yellow dots moving outward
- **AND** fade out over 0.5 seconds
