# Sprint 4: Delight, Polish, Ceremony

## Objective
Add the delightful micro-interactions that transform a functional tool into a captivating instrument. Placement ceremonies, connection sparks, command palette, and overall polish. This sprint targets the difference between 8/10 and 9/10.

## Features to Implement
1. **F13: Mind Placement Ceremony** — When a mind is first dragged onto canvas: accent color flash, signature quote fades in/out, node materializes from a point of light. Under 2 seconds. Transforms mundane drag-and-drop into a moment.
2. **F14: Connection Spark** — When two minds are first connected: particle burst at midpoint, chemistry hint text appears along the line. Reinforces that connections are meaningful.
3. **F15: Command Palette** — Cmd+K opens a dark glass-morphic overlay. Search minds, jump to node, start debate, save/export, toggle panels. Every mouse action has keyboard equivalent.
4. **F16: Sound Design Hooks** — Event emitter system: mind.placed, connection.created, debate.started, debate.message, debate.ended. No audio ships — just the wiring.
5. **Production Polish** — Error boundaries, loading states for debates, keyboard accessibility (focus management, tab order), smooth transitions on all panel open/close, canvas performance optimization.

## Success Criteria
- [ ] Dragging a mind onto canvas triggers a visible placement animation (color flash + quote)
- [ ] Creating a connection triggers a spark/particle effect at the midpoint
- [ ] Cmd+K (or Ctrl+K) opens command palette
- [ ] Command palette searches minds by name and executes actions
- [ ] Debate loading state is visible while waiting for API response
- [ ] All panels (sidebar, detail, debate) animate smoothly on open/close
- [ ] Canvas performs smoothly with 8+ nodes and 10+ connections
- [ ] Event emitter fires on key actions (verifiable via console.log in dev)
- [ ] Tab key navigates through interactive elements in logical order
- [ ] Zero console errors
- [ ] `npm run build` succeeds

## Out of Scope
- Actual audio implementation
- Analytics dashboard
- Tool use / execution
- Autonomous loop
- Mobile support
