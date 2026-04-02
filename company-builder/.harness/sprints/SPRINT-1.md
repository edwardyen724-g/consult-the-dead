# Sprint 1: Canvas Foundation + Mind Library

## Objective
Set up the project and build the core visual experience: the dark immersive canvas with pan/zoom, the mind library sidebar with 12 draggable archetypes, mind nodes that glow with presence on the canvas, and the company identity bar. No simulation yet — this sprint proves the canvas feels like an instrument, not a form.

## Features to Implement
1. **Project Scaffolding** — Next.js 14+ App Router, Tailwind CSS with dark design tokens, Framer Motion, React Flow, Zustand, Google Fonts (JetBrains Mono + Newsreader)
2. **F01: The Canvas** — Dark infinite workspace with subtle dot grid. Pan and zoom via React Flow. Deep dark background (#0a0a0f). The canvas should feel like a void with presence.
3. **F02: Mind Library Sidebar** — Collapsible left panel with all 12 minds. Each shows: archetype name, domain tag, accent color indicator. Searchable by name. Filterable by category (Science, Strategy, Governance, Art, Computing). Drag from sidebar onto canvas to place.
4. **F03: Mind Nodes on Canvas** — Custom React Flow node renderer. Each node shows: mind name, assigned role (dropdown), accent-colored border/aura, subtle ambient pulse animation. Nodes are draggable with smooth movement. Selection expands the node slightly.
5. **F06: Company Identity Bar** — Floating top bar with editable company name (large monospace) and editable mission/goal subtitle. Dark glass-morphic styling.
6. **Mind Data Layer** — All 12 minds loaded from JSON config files with full metadata (archetype_name, domain, accent_color, strengths, weaknesses, best_roles, communication_style, etc.)

## Success Criteria (Evaluator will verify)
- [ ] App loads with dark canvas (#0a0a0f or similar deep dark) with visible dot grid
- [ ] Canvas supports pan (drag background) and zoom (scroll wheel)
- [ ] Mind library sidebar shows all 12 minds with names, domains, and accent colors
- [ ] Search filters minds by name in the sidebar
- [ ] Dragging a mind from sidebar onto canvas creates a node at drop position
- [ ] Mind nodes display name, role dropdown, and accent-colored visual identity
- [ ] Changing role via dropdown updates the node display
- [ ] Multiple minds can be placed simultaneously (at least 5)
- [ ] Company name is editable inline in the top bar
- [ ] Company mission/goal is editable below the name
- [ ] The canvas feels immersive — dark, focused, not a generic white canvas
- [ ] Mobile: not required (this is a desktop power tool)
- [ ] Zero console errors on `npm run dev`

## Technical Requirements
- Next.js 14+ App Router, single-page app (all client-side)
- React Flow for canvas infrastructure with custom node renderer
- Zustand store for company state (minds, positions, roles)
- Tailwind CSS with custom dark theme tokens
- Framer Motion for node animations (pulse, placement, selection)
- Mind data loaded from static JSON files in `/data/`
- JetBrains Mono (monospace for UI labels) + Newsreader (serif for quotes)
- No backend API routes yet (Sprint 2)

## Design Requirements
- Background: #0a0a0f (or similar deep void) with subtle dot grid at 5-8% opacity
- Nodes: glass-morphic dark panels (#13131f → #111118 gradient) with accent-colored border/glow
- Sidebar: dark glass-morphic, collapsible, accent color chips per mind
- Company bar: floating, glass-morphic, monospace typography
- Role dropdown: dark-themed, matches the command center aesthetic
- Every element should feel like it belongs in a dark command center
- NO bright colors except mind accent colors — those are the life in the void
- Node pulse animation: subtle, 3-4 second cycle, accent color glow breathing

## Out of Scope
- Connection lines between nodes (Sprint 2)
- Detail panel (Sprint 2)
- Debate/simulation engine (Sprint 3)
- Chemistry engine (Sprint 3)
- Role-fit indicators (Sprint 2)
- Save/Load/Export (Sprint 2)
- Canvas ambience layer (Sprint 3)
