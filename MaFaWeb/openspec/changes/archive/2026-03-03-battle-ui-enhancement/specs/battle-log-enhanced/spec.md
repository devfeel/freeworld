## ADDED Requirements

### Requirement: Enhanced battle log styling
The system SHALL display battle logs with color coding and icon indicators for different action types.

#### Scenario: Damage log styling
- **WHEN** a damage action is logged
- **THEN** the entry SHALL be displayed with red color
- **AND** include a sword icon indicator

#### Scenario: Heal log styling
- **WHEN** a heal action is logged
- **THEN** the entry SHALL be displayed with green color
- **AND** include a heart icon indicator

#### Scenario: Dodge log styling
- **WHEN** a dodge action is logged
- **THEN** the entry SHALL be displayed with cyan color
- **AND** include a dodge icon indicator

#### Scenario: Critical hit log styling
- **WHEN** a critical hit occurs
- **THEN** the entry SHALL include a gold-colored "CRITICAL" badge

### Requirement: Action type indicators
The system SHALL display the actor of each action (hero or enemy).

#### Scenario: Hero action indicator
- **WHEN** the hero performs an action
- **THEN** the log entry SHALL display "[你]" prefix with appropriate color

#### Scenario: Enemy action indicator
- **WHEN** the enemy performs an action
- **THEN** the log entry SHALL display "[敌]" prefix with appropriate color

### Requirement: Turn information display
The system SHALL display the current turn number in the battle log header.

#### Scenario: Display turn counter
- **WHEN** the battle is active
- **THEN** the log panel SHALL show "回合 X" in the header
- **AND** increment the counter each turn

### Requirement: Log organization
The system SHALL organize battle logs with clear visual separation.

#### Scenario: Log entry separation
- **WHEN** multiple log entries exist
- **THEN** each entry SHALL be separated by a subtle divider
- **AND** have alternating background for readability

#### Scenario: New log highlighting
- **WHEN** a new log entry is added
- **THEN** it SHALL briefly highlight with a flash animation
- **AND** the scroll view SHALL auto-scroll to the new entry

### Requirement: Log filtering
The system SHALL provide options to filter log entries by type.

#### Scenario: Show all logs
- **WHEN** log filter is set to "all"
- **THEN** the system SHALL display all battle log entries

#### Scenario: Filter by damage
- **WHEN** log filter is set to "damage"
- **THEN** the system SHALL display only damage-related entries

#### Scenario: Filter by healing
- **WHEN** log filter is set to "healing"
- **THEN** the system SHALL display only healing-related entries
