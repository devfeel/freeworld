## 1. Canvas Extension and Layout

- [ ] 1.1 Update battle canvas height from 300rpx to 400rpx
- [ ] 1.2 Adjust battle page layout for larger canvas
- [ ] 1.3 Verify canvas rendering on different screen sizes
- [ ] 1.4 Test safe area compatibility on devices with notches

## 2. Background Decoration System

- [ ] 2.1 Implement pillar drawing function in canvas-draw.js
- [ ] 2.2 Implement floor texture with perspective effect
- [ ] 2.3 Add ambient lighting effects based on dungeon theme
- [ ] 2.4 Create background layer in rendering pipeline
- [ ] 2.5 Implement background redraw optimization (only when changed)

## 3. Particle System Implementation

- [ ] 3.1 Create `utils/particle-system.js` module structure
- [ ] 3.2 Implement Particle class with position, velocity, lifetime properties
- [ ] 3.3 Implement ParticlePool class for object reuse
- [ ] 3.4 Add particle types: damage number, heal number, spark
- [ ] 3.5 Implement particle update and rendering loop
- [ ] 3.6 Add particle emission methods for different events
- [ ] 3.7 Implement particle cleanup on expiration

## 4. Screen Shake Implementation

- [ ] 4.1 Create `utils/screen-shake.js` module
- [ ] 4.2 Implement shake intensity levels (light, medium, heavy)
- [ ] 4.3 Add CSS classes for different shake effects
- [ ] 4.4 Implement shake trigger function in battle.js
- [ ] 4.5 Integrate shake with damage events
- [ ] 4.6 Integrate shake with critical hit events
- [ ] 4.7 Add shake cooldown to prevent overlapping

## 5. Status Effect Display System

- [ ] 5.1 Add status effect data structure to battle system
- [ ] 5.2 Create status effect UI component in WXML
- [ ] 5.3 Implement status effect icon rendering
- [ ] 5.4 Add duration display on status icons
- [ ] 5.5 Implement status effect tooltip/tap handler
- [ ] 5.6 Style Buff vs Debuff indicators (green/red borders)
- [ ] 5.7 Add status appearance/disappearance animations
- [ ] 5.8 Implement status priority and limit (max 6)

## 6. Enhanced Battle Log

- [ ] 6.1 Update log WXML structure with icon support
- [ ] 6.2 Add color coding for different action types
- [ ] 6.3 Implement damage log styling (red + sword icon)
- [ ] 6.4 Implement heal log styling (green + heart icon)
- [ ] 6.5 Implement dodge log styling (cyan + dodge icon)
- [ ] 6.6 Add critical hit badge for critical actions
- [ ] 6.7 Add actor indicators ([你]/[敌])
- [ ] 6.8 Implement turn counter in log header
- [ ] 6.9 Add new entry highlighting animation
- [ ] 6.10 Implement auto-scroll to latest entry

## 7. Performance Configuration System

- [ ] 7.1 Create performance mode configuration structure
- [ ] 7.2 Implement device performance detection
- [ ] 7.3 Add performance mode selector in settings
- [ ] 7.4 Implement high performance mode (100 particles, full effects)
- [ ] 7.5 Implement balanced mode (50 particles, medium effects)
- [ ] 7.6 Implement low power mode (10 particles, minimal effects)
- [ ] 7.7 Apply performance limits to particle system
- [ ] 7.8 Apply performance limits to screen shake
- [ ] 7.9 Add local storage persistence for performance setting

## 8. Integration and Event Handling

- [ ] 8.1 Connect damage events to particle emission
- [ ] 8.2 Connect critical hit events to screen shake
- [ ] 8.3 Connect skill usage to status effect display
- [ ] 8.4 Connect heal events to heal particles
- [ ] 8.5 Update battle log with enhanced formatting

## 9. Boss Battle Enhancements

- [ ] 9.1 Detect boss battles in battle system
- [ ] 9.2 Apply enhanced atmosphere for boss battles
- [ ] 9.3 Add boss glow effect in canvas rendering
- [ ] 9.4 Adjust background theme for boss battles

## 10. Testing and Optimization

- [ ] 10.1 Test canvas rendering on different screen sizes
- [ ] 10.2 Test particle system with high particle counts
- [ ] 10.3 Test screen shake on various events
- [ ] 10.4 Test status effect display with multiple effects
- [ ] 10.5 Test battle log readability
- [ ] 10.6 Performance test on low-end device simulation
- [ ] 10.7 Performance test on high-end device
- [ ] 10.8 Verify memory usage with particle pool
- [ ] 10.9 Check for memory leaks with extended battles
- [ ] 10.10 Test all performance modes

## 11. Cleanup and Documentation

- [ ] 11.1 Update CLAUDE.md with new visual systems
- [ ] 11.2 Add JSDoc comments to particle system
- [ ] 11.3 Add JSDoc comments to screen shake module
- [ ] 11.4 Document performance mode configuration
- [ ] 11.5 Verify no console warnings or errors
- [ ] 11.6 Clean up unused temporary code
