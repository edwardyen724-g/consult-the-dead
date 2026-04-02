# Sprint 2: Connections, Detail Panel, Persistence

## Objective
Add connection lines between minds, the detail panel for inspecting minds, role-fit indicators, and save/load/export. After this sprint, the user can build a complete org structure, inspect any mind in detail, and save their work.

## Features to Implement
1. **F04: Connection Lines** — Click-drag from one node's port to another. Curved Bezier paths with glow effect blending the two minds' accent colors. Right-click to delete. Connection type: reporting vs collaboration.
2. **F05: Mind Detail Panel** — Right-side glass-morphic panel on node selection. Shows: name, dates, domain, thinking pattern summary, communication style, strengths, weaknesses, role, connections list, signature quote in serif italic.
3. **F10: Role-Fit Indicators** — Subtle color ring on node: green (strong fit), amber (moderate), red (poor). Based on predefined role-affinity matrix.
4. **F08: Save / Load / Export** — Autosave to localStorage. Export as JSON. Import from JSON. All state preserved: positions, roles, connections, company identity.
5. **Connection Ports** — Visual connection points on each node (left/right or top/bottom) that highlight on hover to indicate draggability.

## Success Criteria
- [ ] Dragging from one node's port to another creates a visible connection line
- [ ] Connection lines are curved with glow effect using blended accent colors
- [ ] Connections can be deleted via right-click context menu or button
- [ ] Clicking a node opens the detail panel with all mind metadata
- [ ] Detail panel shows strengths, weaknesses, and signature quote
- [ ] Role-fit indicator shows on nodes (green/amber/red)
- [ ] Company state autosaves to localStorage
- [ ] Export button downloads a JSON file with full state
- [ ] Importing a JSON file restores the full company state
- [ ] At least 6 connections between 5+ nodes render without visual overlap issues
- [ ] Zero console errors

## Out of Scope
- Debate engine (Sprint 3)
- Chemistry text/scores on connections (Sprint 3)
- Canvas ambience layer (Sprint 3)
- Debate history (Sprint 3)
