## ADDED Requirements

### Requirement: Extended battle canvas
The system SHALL extend the battle canvas height from 300rpx to 400rpx to provide more visual space.

#### Scenario: Canvas dimensions
- **WHEN** the battle page loads
- **THEN** the canvas SHALL have a height of 400rpx
- **AND** the canvas SHALL maintain full width

### Requirement: Background decoration
The system SHALL draw background decorations including pillars, floor texture, and ambient lighting effects.

#### Scenario: Draw background pillars
- **WHEN** the battle scene renders
- **THEN** the system SHALL draw decorative pillars at the edges of the canvas

#### Scenario: Draw floor texture
- **WHEN** the battle scene renders
- **THEN** the system SHALL draw a textured floor with perspective effect

#### Scenario: Draw ambient lighting
- **WHEN** the battle scene renders
- **THEN** the system SHALL draw ambient lighting effects based on dungeon theme

### Requirement: Layered rendering
The system SHALL use a layered rendering approach (background, character, effects, UI layers) for optimized performance.

#### Scenario: Layer rendering order
- **WHEN** rendering the battle scene
- **THEN** the system SHALL render layers in the order: background → characters → effects → UI

#### Scenario: Optimized background redraw
- **WHEN** the background does not change
- **THEN** the system SHALL NOT redraw the background layer

### Requirement: Boss battle atmosphere
The system SHALL provide enhanced visual atmosphere for boss battles.

#### Scenario: Boss battle background
- **WHEN** fighting a boss enemy
- **THEN** the system SHALL display enhanced atmospheric effects (darker tone, special lighting)

#### Scenario: Boss visual emphasis
- **WHEN** a boss appears
- **THEN** the boss SHALL be rendered with a glow effect
