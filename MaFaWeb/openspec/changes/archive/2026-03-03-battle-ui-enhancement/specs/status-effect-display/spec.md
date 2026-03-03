## ADDED Requirements

### Requirement: Status effect display
The system SHALL display active status effects (Buff/Debuff) during battle.

#### Scenario: Display status icons
- **WHEN** a character has active status effects
- **THEN** the system SHALL display status effect icons below the skill bar

#### Scenario: Show status duration
- **WHEN** a status effect icon is displayed
- **THEN** the icon SHALL show remaining duration in turns

#### Scenario: Show status tooltip
- **WHEN** the user taps on a status icon
- **THEN** the system SHALL display the status effect name and description

### Requirement: Status effect types
The system SHALL support different status effect types with distinct visual indicators.

#### Scenario: Buff status display
- **WHEN** a buff status is active
- **THEN** the icon SHALL display with a green border or glow

#### Scenario: Debuff status display
- **WHEN** a debuff status is active
- **THEN** the icon SHALL display with a red border or glow

#### Scenario: Status effect categories
- **WHEN** displaying status effects
- **THEN** each category SHALL have a distinct icon (fire, ice, poison, shield, etc.)

### Requirement: Status effect limits
The system SHALL limit the number of displayed status effects.

#### Scenario: Maximum status display
- **WHEN** there are more than 6 active status effects
- **THEN** the system SHALL display only the 6 most important effects

#### Scenario: Status priority
- **WHEN** filtering status effects for display
- **THEN** the system SHALL prioritize by effect type and remaining duration

### Requirement: Status effect animation
The system SHALL provide visual animation for status effects.

#### Scenario: Status appearance animation
- **WHEN** a status effect is applied
- **THEN** the icon SHALL animate in with a pop effect

#### Scenario: Status removal animation
- **WHEN** a status effect expires
- **THEN** the icon SHALL animate out with a fade effect

#### Scenario: Duration countdown animation
- **WHEN** a status effect has remaining turns
- **THEN** the duration display SHALL update each turn
- **AND** flash when duration reaches 1 turn

### Requirement: Status effect positioning
The system SHALL position status effects in a dedicated area below the skill bar.

#### Scenario: Status effect layout
- **WHEN** displaying status effects
- **THEN** they SHALL appear in a horizontal row below the skill slots
- **AND** be centered within the control panel

#### Scenario: Status effect responsiveness
- **WHEN** displaying status effects on different screen sizes
- **THEN** the icons SHALL scale appropriately
- **AND** wrap to a new line if space is insufficient
