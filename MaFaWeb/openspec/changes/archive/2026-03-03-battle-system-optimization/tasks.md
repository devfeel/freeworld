## 1. Setup and Foundation

- [ ] 1.1 Create `utils/battle-animation-manager.js` module structure
- [ ] 1.2 Create `utils/battle-statistics.js` module structure
- [ ] 1.3 Add basic class skeletons for new modules

## 2. Battle Statistics Implementation

- [ ] 2.1 Implement `BattleStatistics` class with counters (damage dealt, damage taken, critical hits, dodges)
- [ ] 2.2 Add skill usage tracking to `BattleStatistics`
- [ ] 2.3 Implement statistics reset method
- [ ] 2.4 Add enable/disable toggle for statistics recording
- [ ] 2.5 Implement `getStatistics()` method for retrieving summary

## 3. Animation Manager Implementation

- [ ] 3.1 Implement `BattleAnimationManager` class with animation queue
- [ ] 3.2 Add damage number animation support
- [ ] 3.3 Add skill effect animation support
- [ ] 3.4 Implement animation cleanup on completion
- [ ] 3.5 Replace `setTimeout` with `requestAnimationFrame` for animations

## 4. Battle System Refactoring - Phase 1

- [ ] 4.1 Add `executeSkill()` unified method to `BattleSystem`
- [ ] 4.2 Modify `heroAttack()` to delegate to `executeSkill()`
- [ ] 4.3 Modify `useBattleSkill()` to delegate to `executeSkill()`
- [ ] 4.4 Test unified skill execution for physical attacks
- [ ] 4.5 Test unified skill execution for magic attacks
- [ ] 4.6 Test unified skill execution for healing skills

## 5. Battle System Refactoring - Phase 2

- [ ] 5.1 Add `BattleStatistics` instance integration to `BattleSystem`
- [ ] 5.2 Record damage dealt when hero attacks
- [ ] 5.3 Record damage taken when enemy attacks
- [ ] 5.4 Record critical hit occurrences
- [ ] 5.5 Record dodge occurrences
- [ ] 5.6 Record skill usage statistics

## 6. Battle System Refactoring - Phase 3 - Error Handling

- [ ] 6.1 Add try-catch blocks around skill execution
- [ ] 6.2 Implement error message display for insufficient MP
- [ ] 6.3 Implement error message display for skill on cooldown
- [ ] 6.4 Add error logging for invalid skills
- [ ] 6.5 Add battle state validation before operations

## 7. Battle System Refactoring - Phase 4 - Event System

- [ ] 7.1 Review and standardize event emission in `BattleSystem`
- [ ] 7.2 Ensure all damage events are emitted correctly
- [ ] 7.3 Ensure all heal events are emitted correctly
- [ ] 7.4 Ensure all dodge events are emitted correctly
- [ ] 7.5 Ensure all turn change events are emitted correctly
- [ ] 7.6 Ensure battle end events are emitted correctly

## 8. Battle Page Refactoring

- [ ] 8.1 Initialize `BattleAnimationManager` in `battle.js`
- [ ] 8.2 Migrate damage number animation to `BattleAnimationManager`
- [ ] 8.3 Migrate skill effect animation to `BattleAnimationManager`
- [ ] 8.4 Remove redundant animation logic from `battle.js`
- [ ] 8.5 Connect `BattleStatistics` to battle result display

## 9. Performance Optimization

- [ ] 9.1 Implement dirty flag for Canvas rendering
- [ ] 9.2 Add conditional rendering based on dirty flags
- [ ] 9.3 Optimize animation loop with requestAnimationFrame
- [ ] 9.4 Verify log entry limit (20 entries) is enforced
- [ ] 9.5 Add animation queue cleanup to prevent memory leaks

## 10. Testing

- [ ] 10.1 Test physical attack execution
- [ ] 10.2 Test magic attack execution
- [ ] 10.3 Test healing skill execution
- [ ] 10.4 Test MP cost validation
- [ ] 10.5 Test cooldown validation
- [ ] 10.6 Test statistics recording throughout battle
- [ ] 10.7 Test statistics reset between battles
- [ ] 10.8 Test error handling scenarios
- [ ] 10.9 Test animation performance
- [ ] 10.10 Test battle statistics summary display

## 11. Cleanup and Documentation

- [ ] 11.1 Remove commented-out old code
- [ ] 11.2 Add JSDoc comments to new methods
- [ ] 11.3 Update CLAUDE.md with new architecture changes
- [ ] 11.4 Verify no console warnings or errors
