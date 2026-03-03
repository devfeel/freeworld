## ADDED Requirements

### Requirement: Screen shake effect
The system SHALL provide screen shake feedback when significant battle events occur.

#### Scenario: Shake on damage
- **WHEN** a character takes damage
- **THEN** the system SHALL apply a screen shake effect

#### Scenario: Shake on critical hit
- **WHEN** a critical hit occurs
- **THEN** the system SHALL apply a stronger screen shake effect

#### Scenario: Shake on skill usage
- **WHEN** a powerful skill is used
- **THEN** the system SHALL apply a screen shake effect

### Requirement: Shake intensity levels
The system SHALL support multiple shake intensity levels.

#### Scenario: Light shake
- **WHEN** a light shake effect is triggered
- **THEN** the screen SHALL shake with small displacement (2px)
- **AND** the effect SHALL last for 200ms

#### Scenario: Medium shake
- **WHEN** a medium shake effect is triggered
- **THEN** the screen SHALL shake with medium displacement (5px)
- **AND** the effect SHALL last for 300ms

#### Scenario: Heavy shake
- **WHEN** a heavy shake effect is triggered
- **THEN** the screen SHALL shake with large displacement (10px)
- **AND** the effect SHALL last for 400ms

### Requirement: CSS-based shake animation
The system SHALL use CSS transform animations for screen shaking.

#### Scenario: Add shake class
- **WHEN** a shake effect triggers
- **THEN** the system SHALL add a CSS class to the battle container

#### Scenario: Remove shake class
- **WHEN** the shake animation completes
- **THEN** the system SHALL remove the shake CSS class

### Requirement: Performance-based shake
The system SHALL adjust shake effects based on performance mode.

#### Scenario: Shake in high performance mode
- **WHEN** performance mode is "high"
- **THEN** the system SHALL use full shake intensity

#### Scenario: Shake in low power mode
- **WHEN** performance mode is "low"
- **THEN** the system SHALL use reduced shake intensity or disable shaking

### Requirement: Shake cooldown
The system SHALL prevent shake effects from overlapping excessively.

#### Scenario: Shake cooldown
- **WHEN** a shake effect is already active
- **THEN** the system SHALL delay or skip subsequent shake requests
