# Great Mind Company Builder -- Product Specification

**Version:** 1.0
**Scope:** Layers 1-2 (Visual Interface + Basic Simulation Engine)
**Target:** Solo developer with AI assistance. Steve Jobs evaluator: 9/10.

---

## 1. Product Vision

The Great Mind Company Builder is a dark, immersive command center where a single user orchestrates virtual organizations staffed by AI-cloned historical geniuses. The drag-and-drop canvas is the instrument -- not a form, not a dashboard, but a living surface where Einstein, da Vinci, Sun Tzu, and Cleopatra are placed into roles, wired into reporting structures, and then activated to debate, collaborate, and challenge each other in real time. Every interaction on the canvas produces immediate, visible feedback: cognitive chemistry between connected minds, role-fit tension indicators, and pulsing energy along connection lines. The product exists at the intersection of strategic simulation and creative play -- it should feel like arranging constellations that then speak to each other.

---

## 2. Feature List

### P0 -- Must Ship (Core Experience)

**F01: The Canvas**
The centerpiece. A dark, infinite-scroll workspace with a subtle dot grid rendered at depth. Minds exist as floating, glowing nodes on this surface. The canvas supports pan, zoom, and spatial arrangement. It must feel like a void with presence -- not empty, but waiting. Built on React Flow with heavy custom styling, or a fully custom canvas if React Flow constrains the visual language.

**F02: Mind Library Sidebar**
A collapsible panel on the left containing all 12+ historical archetypes. Each entry shows: portrait silhouette or icon, name, domain tag, and signature accent color. Searchable by name or domain. Filterable by category (Science, Strategy, Governance, Art, Computing). Drag a mind from the sidebar onto the canvas to instantiate it. The sidebar should feel like a roster of power -- dense, scrollable, with each mind radiating its own visual energy even at rest.

**F03: Mind Nodes on Canvas**
Each placed mind renders as a substantial, glowing node -- not a flat card. The node has: the mind's name, assigned role (editable dropdown), accent-colored border or aura, and a subtle ambient animation (a slow pulse, a rotating ring, a breathing glow). The node should feel like it contains a presence. Selecting a node expands its visual footprint slightly and triggers the detail panel. Nodes are freely draggable with smooth inertia and snap-to-grid optional.

**F04: Connection Lines**
Click-drag from one node's connection port to another to create a link. Lines are curved Bezier paths with a glow effect matching the color blend of the two connected minds. Connection lines represent reporting structure or collaboration channels. Lines should pulse subtly when the simulation is active. A right-click or context menu on a line allows deletion or type change (reporting vs. collaboration). When a new connection is made, a brief chemistry hint animates into view along the line.

**F05: Mind Detail Panel**
When a mind node is selected, a glass-morphic panel slides in from the right showing: full name, historical dates, domain expertise, thinking pattern summary, communication style, strengths (3-4 bullet points), weaknesses (2-3 bullet points), current role assignment, list of connections with chemistry scores, and a signature quote in serif italic. This panel is the player's scouting report. It must be dense with information but visually calm -- no clutter, just layered depth.

**F06: Company Identity Bar**
A minimal top bar or floating header where the user sets: company name (editable inline, large monospace text) and company mission/goal (editable, appears as a subtitle). This context feeds into every simulation prompt. The bar should feel permanent but unobtrusive -- the company's banner, always visible but never competing with the canvas.

**F07: Run Debate (Layer 2 Core)**
The signature simulation feature. The user selects 2-3 connected minds and enters a topic or question. The system generates a threaded debate where each mind argues from its archetype's perspective, using distinct voice, reasoning style, and rhetorical approach. Output renders as a conversation thread in a dedicated panel -- each message color-coded to its mind, with monospace labels and serif body text. The debate must feel like eavesdropping on a conversation between titans.

**F08: Save / Load / Export**
All company state persists to localStorage automatically (autosave on every change). Users can also export a company configuration as a JSON file and import it back. The export includes: all placed minds with positions, roles, connections, company identity, and debate history. No database, no accounts -- everything lives locally.

### P1 -- Should Ship (Depth and Polish)

**F09: Chemistry Engine**
When two minds are connected, the system computes and displays a compatibility assessment: a brief text note ("Explosive creative tension -- both think in images but disagree on method" or "Natural hierarchy -- one leads through logic, the other through loyalty") and a visual chemistry indicator on the connection line (color warmth from cool blue for tension to warm amber for synergy). Chemistry data is derived from predefined archetype metadata, not API calls -- it must be instant.

**F10: Role-Fit Indicators**
When a mind is assigned a role, the node displays a subtle fit signal. A green inner ring for strong fit, amber for moderate, red for poor. Einstein as Head of R&D: green. Einstein as VP Sales: red. This data comes from a predefined role-affinity matrix per archetype. The indicator should be non-judgmental but informative -- the user can ignore it, but it teaches them something about the mind.

**F11: Canvas Ambience Layer**
Beneath the functional elements, the canvas has a living ambience: faint particle drift, colored light pools around each mind that blend where nodes are close together, a noise texture overlay for depth, and connection lines that cast soft reflected light onto the grid. This is not decoration -- it is the difference between a tool and an instrument. The ambience should respond to simulation state: idle = calm, debate running = energized with faster particles and brighter glows.

**F12: Debate History Archive**
All debates are stored per company and accessible from a collapsible history panel. Each entry shows: timestamp, participating minds, topic, and a preview of the first exchange. Clicking expands the full thread. This gives the company a sense of institutional memory.

### P2 -- Nice to Have (Delight)

**F13: Mind Placement Ceremony**
When a mind is first dragged onto the canvas, a brief arrival animation plays: a flash of the mind's accent color, a quote that fades in and out ("Imagination is more important than knowledge"), and the node materializing from a point of light. This takes under 2 seconds but transforms a mundane action into a moment.

**F14: Connection Spark**
When two minds are connected for the first time, a brief visual spark travels along the new line -- a particle burst at the midpoint with the chemistry hint text appearing. This reinforces that connections are meaningful, not just lines.

**F15: Keyboard Shortcuts and Command Palette**
Power users can press Cmd+K to open a command palette: search minds, jump to a node, start a debate, save/export, toggle panels. Every mouse action has a keyboard equivalent. The palette uses the same dark glass-morphic style as the rest of the interface.

**F16: Sound Design Hooks (Architecture Only)**
The data model and event system should emit events that a future sound layer can subscribe to: `mind.placed`, `connection.created`, `debate.started`, `debate.message`, `debate.ended`. No audio ships in v1, but the hooks are there so sound can be layered in without refactoring.

---

## 3. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | Server components for initial load, client components for canvas interactivity |
| Styling | Tailwind CSS + CSS custom properties | Utility-first with design tokens for accent colors and theming |
| Animation | Framer Motion | Drag-and-drop physics, layout animations, presence transitions |
| Canvas | React Flow (custom node/edge renderers) | Provides pan/zoom/connection infrastructure; heavy custom styling overrides default look |
| AI | Anthropic SDK (@anthropic-ai/sdk) | Claude API for debate generation |
| Persistence | localStorage + JSON export/import | Zero infrastructure, instant save/load |
| State | Zustand | Lightweight, outside React tree, supports middleware for autosave |

### Project Structure

```
company-builder/
  src/
    app/
      layout.tsx              -- Root layout, font loading, global styles
      page.tsx                -- Main application shell
      api/
        debate/
          route.ts            -- Server-side debate API (Anthropic calls)
    components/
      canvas/
        Canvas.tsx            -- React Flow wrapper with custom config
        MindNode.tsx          -- Custom node renderer
        ConnectionEdge.tsx    -- Custom edge renderer with glow and chemistry
        CanvasAmbience.tsx    -- Background particle/light layer
      sidebar/
        MindLibrary.tsx       -- Sidebar with search, filter, drag source
        MindCard.tsx          -- Individual mind entry in library
      panels/
        DetailPanel.tsx       -- Right-side mind detail view
        DebatePanel.tsx       -- Debate thread renderer
        DebateHistory.tsx     -- Archived debates list
      company/
        CompanyBar.tsx        -- Top bar with name and mission
      shared/
        GlassPanel.tsx        -- Reusable glass-morphic container
        CommandPalette.tsx    -- Cmd+K overlay
    data/
      minds.ts               -- All 12+ mind archetypes with full metadata
      roles.ts                -- Role definitions and display metadata
      chemistry.ts            -- Pairwise chemistry matrix and computation
      roleFit.ts              -- Role-affinity matrix per mind
    store/
      companyStore.ts         -- Zustand store: nodes, edges, company info
      debateStore.ts          -- Zustand store: active/archived debates
      uiStore.ts              -- Zustand store: panel states, selection
    lib/
      persistence.ts          -- localStorage save/load, JSON export/import
      debateEngine.ts         -- Prompt construction and streaming logic
      events.ts               -- Event emitter for sound/ambience hooks
    types/
      index.ts                -- All TypeScript interfaces
    styles/
      globals.css             -- Tailwind base, noise texture, custom fonts
```

### Key Technical Decisions

**React Flow with Maximum Customization:** React Flow provides the hard infrastructure (pan, zoom, node dragging, edge routing, viewport management) but every visual element is a custom renderer. The default React Flow look is completely overridden. If React Flow proves too constraining for the desired visual language (particularly for the ambience layer and custom glow effects), the fallback plan is a custom canvas using HTML elements with absolute positioning and SVG for edges -- Framer Motion handles the drag physics either way.

**Server-Side Debate API:** Debate generation hits the Anthropic API through a Next.js route handler. This keeps the API key server-side. The route accepts: participating mind IDs, topic, company context, and conversation history. It streams responses back to the client for real-time rendering.

**Zustand Over Context:** React context causes unnecessary re-renders on a canvas with many nodes. Zustand's selector-based subscriptions mean only the affected node re-renders when a single mind is moved or updated.

**Autosave to localStorage:** Every state mutation triggers a debounced write to localStorage (500ms debounce). The user never thinks about saving. Export/import is for portability and backup.

---

## 4. Data Model

### Mind Archetype

```typescript
interface MindArchetype {
  id: string;                          // "einstein", "davinci", "suntzu"
  name: string;                        // "Albert Einstein"
  born: number;                        // 1879
  died: number;                        // 1955
  domain: string;                      // "Physics & Innovation"
  domainCategory: DomainCategory;      // "science" | "strategy" | "governance" | "art" | "computing"
  accentColor: string;                 // "#6C63FF" -- unique per mind
  portrait: string;                    // Path to silhouette/icon SVG
  quote: string;                       // Signature quote
  thinkingPattern: string;             // 2-3 sentence description
  communicationStyle: string;          // How they argue, persuade, express
  decisionStyle: string;               // Risk tolerance, speed, method
  strengths: string[];                 // 3-4 items
  weaknesses: string[];                // 2-3 items
  roleFit: Record<RoleId, FitLevel>;   // { "ceo": "moderate", "head_rd": "strong" }
  systemPromptCore: string;            // The hidden framework prompt -- NEVER exposed to UI
}

type DomainCategory = "science" | "strategy" | "governance" | "art" | "computing";
type FitLevel = "strong" | "moderate" | "poor";
```

### Placed Mind (Node on Canvas)

```typescript
interface PlacedMind {
  id: string;                    // Unique instance ID (uuid)
  archetypeId: string;           // Reference to MindArchetype.id
  role: RoleId;                  // Currently assigned role
  position: { x: number; y: number };
}
```

### Role

```typescript
interface Role {
  id: RoleId;
  label: string;                 // "Chief Executive Officer"
  shortLabel: string;            // "CEO"
  color: string;                 // Role accent color
  description: string;           // What this role does in the company
}

type RoleId =
  | "ceo" | "cto" | "cmo" | "cfo" | "coo"
  | "vp_engineering" | "vp_sales" | "vp_product"
  | "head_rd" | "head_strategy" | "head_operations"
  | "advisor";
```

### Connection

```typescript
interface Connection {
  id: string;                    // Unique edge ID
  sourceId: string;              // PlacedMind.id
  targetId: string;              // PlacedMind.id
  type: "reporting" | "collaboration";
  chemistry: ChemistryResult;    // Computed on creation
}

interface ChemistryResult {
  score: number;                 // 0-100
  warmth: "tension" | "neutral" | "synergy";
  summary: string;               // "Explosive creative tension..."
  detail: string;                // Longer explanation for detail panel
}
```

### Company

```typescript
interface Company {
  id: string;
  name: string;
  mission: string;
  minds: PlacedMind[];
  connections: Connection[];
  createdAt: string;             // ISO timestamp
  updatedAt: string;
}
```

### Debate

```typescript
interface Debate {
  id: string;
  companyId: string;
  topic: string;
  participantIds: string[];      // PlacedMind.id references
  messages: DebateMessage[];
  status: "running" | "complete";
  startedAt: string;
  completedAt?: string;
}

interface DebateMessage {
  id: string;
  mindId: string;                // Which mind is speaking
  content: string;               // The message text
  timestamp: string;
  round: number;                 // Which round of the debate (1, 2, 3...)
}
```

### Chemistry Matrix

```typescript
// Predefined pairwise data -- not all pairs need entries; missing pairs get "neutral"
interface ChemistryEntry {
  mindA: string;                 // MindArchetype.id
  mindB: string;                 // MindArchetype.id
  score: number;
  warmth: "tension" | "neutral" | "synergy";
  summary: string;
  detail: string;
}
```

### Persistence Envelope (localStorage / JSON export)

```typescript
interface SaveState {
  version: number;               // Schema version for migration
  company: Company;
  debates: Debate[];
  savedAt: string;
}
```

---

## 5. User Flows

### Flow 1: First Launch -- Building a Company from Scratch

1. User opens the app. The canvas is empty except for a faint dot grid and a centered prompt: "Drag a mind onto the canvas to begin." The company name reads "Untitled Company" with a blinking cursor inviting edit.
2. User clicks the company name, types "Prometheus Labs", then edits the mission to "Build the world's first fusion reactor."
3. User opens the mind library sidebar. Browses the 12 minds. Hovers over Einstein -- a tooltip shows domain and signature quote.
4. User drags Einstein onto the canvas. The placement ceremony plays: accent color flash, quote fade, node materializes. Einstein appears with no role assigned (dropdown shows "Assign Role...").
5. User clicks the role dropdown on Einstein's node, selects "Head of R&D". A green fit indicator pulses briefly, confirming strong fit.
6. User drags Tesla onto the canvas. Assigns "VP Engineering". Drags a connection from Einstein to Tesla. A spark animation plays. The chemistry hint appears along the line: "Rival innovators -- Tesla's applied engineering grounds Einstein's theoretical leaps. Productive friction." The line glows in a blended purple-cyan.
7. User continues adding minds: da Vinci as VP Product, Sun Tzu as Head of Strategy, Cleopatra as CEO. Each placement triggers its ceremony, each connection reveals chemistry.
8. The canvas now has 5 minds with 6 connections. The ambience layer shows overlapping light pools. The company feels alive.

### Flow 2: Running a Debate

1. User has a company with Einstein (Head of R&D), Tesla (VP Engineering), and da Vinci (VP Product) all connected.
2. User clicks the "Run Debate" button (or Cmd+D). A modal appears: select participants (checkboxes on connected minds) and enter a topic.
3. User selects Einstein and Tesla, enters topic: "Should we pursue theoretical research or applied prototyping first?"
4. User hits "Start Debate". The debate panel slides in from the bottom or right. Connection lines between the two minds begin pulsing faster.
5. Messages stream in one at a time. Einstein's messages appear in his accent color with a serif font, arguing for theoretical foundations. Tesla responds in his own color, pushing for working prototypes.
6. After 3-4 rounds, the debate concludes. A summary line appears: "Einstein advocates theory-first; Tesla demands tangible output. Unresolved -- both hold ground."
7. The debate is saved to history. The connection line between them now shows a small activity indicator (it has been exercised).

### Flow 3: Exploring Mind Chemistry

1. User clicks on a connection line between Cleopatra (CEO) and Machiavelli (Head of Strategy).
2. The detail panel updates to show the connection's chemistry: score 87/100, warmth "synergy", summary: "Master politicians -- Cleopatra's charisma meets Machiavelli's calculus. They understand each other's games."
3. User clicks on Cleopatra's node. The detail panel shows her profile, including a connections section listing all her links with chemistry scores. She has strong synergy with Machiavelli, moderate tension with Einstein, and neutral chemistry with Tesla.
4. User considers swapping Cleopatra out of CEO for Catherine the Great. Drags Catherine onto the canvas, assigns CEO, reconnects. The chemistry indicators update instantly -- Catherine has different relationships with the same team.

### Flow 4: Restructuring Mid-Session

1. User has a 6-mind company. Realizes Sun Tzu is underperforming as Head of Operations (red fit indicator).
2. User clicks Sun Tzu's role dropdown, changes it to "Head of Strategy". The fit indicator shifts to green.
3. User drags Genghis Khan from the sidebar, assigns "Head of Operations" (green fit). Connects Khan to Sun Tzu and to the CEO.
4. New chemistry hints appear. The org chart visually reshuffles as nodes are moved to reflect the new hierarchy.
5. User runs a debate with the restructured team to see if the new configuration produces different strategic thinking.

### Flow 5: Save, Export, and Resume

1. User has been building for 30 minutes. The autosave indicator in the corner shows "Saved" with a timestamp.
2. User clicks the export button. A JSON file downloads: `prometheus-labs-2026-04-02.json`.
3. User closes the browser. Reopens the app the next day. The company loads instantly from localStorage -- all minds, connections, positions, and debate history intact.
4. User wants to try an alternate structure. Exports current state as backup. Makes radical changes. Doesn't like the result. Imports the backup JSON. Original structure restored.
5. User shares the JSON file with a collaborator. Collaborator imports it and sees the exact same company configuration.

### Flow 6: Discovering a Mind Before Placement

1. User is unsure which mind to assign as CFO. Opens the mind library and hovers over Newton.
2. A tooltip shows: domain "Mathematics & Science", strengths preview, and role-fit hint "Strong: Head of R&D, Advisor. Moderate: CFO. Poor: CMO."
3. User drags Newton onto canvas, assigns CFO. Amber fit indicator -- moderate. User decides to try it and see how debates play out.
4. After running a debate on budget allocation, Newton's rigorous analytical style proves surprisingly effective. The user keeps the assignment.

---

## 6. Design Direction

### The Guiding Metaphor

This is not a SaaS application. It is a **dark observatory** -- a place where you look into a void and arrange points of light that happen to be the greatest minds in human history. The aesthetic is closer to a planetarium control room than a Notion board. Closer to the interface in *Minority Report* than Trello. Every pixel serves atmosphere or function. Nothing is decorative in the conventional sense -- but everything is crafted.

### Color System

**Background:** Near-black with depth. Not flat `#000`. A gradient from `#07070d` to `#0c0c14` with a faint noise texture overlay (2-3% opacity) to prevent banding and add tactile grain. The dot grid is `#1a1a28` at 30% opacity -- visible enough to provide spatial reference, invisible enough to not compete.

**Mind Accent Colors:** Each mind owns a color. These are saturated but not neon -- they should glow, not scream.

| Mind | Color | Rationale |
|------|-------|-----------|
| Einstein | `#6C63FF` (electric violet) | Otherworldly, theoretical, cerebral |
| Da Vinci | `#D4A853` (burnished gold) | Renaissance warmth, artistic mastery |
| Sun Tzu | `#2D7A4F` (jade green) | Eastern strategy, patience, nature |
| Cleopatra | `#C2185B` (royal crimson) | Power, seduction, command |
| Tesla | `#00BCD4` (electric cyan) | Electricity, future, precision |
| Newton | `#7B8794` (silver steel) | Rigor, gravity, foundational |
| Machiavelli | `#8B0000` (dark blood) | Political darkness, pragmatism |
| Alexander | `#FFB300` (conquest gold) | Ambition, sunlight, empire |
| Catherine | `#9C27B0` (imperial purple) | Governance, reformation, royalty |
| Curie | `#26A69A` (radium teal) | Discovery, science, glow |
| Genghis Khan | `#5D4037` (steppe brown) | Earth, endurance, scale |
| Ada Lovelace | `#EC407A` (computational rose) | Vision, elegance, machine poetry |

**Role Colors:** Muted complements to mind colors. CEO is warm white. CTO is cool blue. CMO is soft amber. These are secondary -- the mind's own color always dominates.

**Surfaces:** Panels use `rgba(15, 15, 25, 0.85)` with a `backdrop-filter: blur(20px)`. Borders are `1px solid rgba(255, 255, 255, 0.06)`. Selected states add the mind's accent color at 30% opacity to the border. Hover states add a `box-shadow` with the accent color at 10% opacity, spread 20px.

### Typography

**Primary (UI labels, headers, role tags):** `JetBrains Mono` or `Fira Code`. Uppercase with `letter-spacing: 0.12em` for section headers. Regular weight for body labels. The monospace font gives the interface a technical, control-room quality.

**Secondary (mind quotes, debate text, narrative content):** `Playfair Display` or `Cormorant Garamond` -- a high-contrast serif that feels historical and authoritative. Used for: mind quotes in the detail panel, debate message bodies, chemistry summary text.

**Sizing Scale:**
- Company name: 28px monospace, bold
- Section headers: 11px monospace, uppercase, tracked wide
- Node labels (mind name): 14px monospace, medium weight
- Node role: 11px monospace, uppercase, accent colored
- Body text: 14px serif
- Detail panel content: 13px serif for descriptions, 12px monospace for metadata

### Node Design (The Mind as Presence)

Each mind node is not a rectangle with text. It is a **contained energy source**:

- **Shape:** Rounded rectangle, 200px wide, variable height based on content. Corner radius 16px.
- **Fill:** Radial gradient from the mind's accent color at 8% opacity in the center to transparent at the edges, over a base of `rgba(18, 18, 30, 0.9)`.
- **Border:** 1px solid accent color at 20% opacity. On selection: 2px solid accent at 60% opacity.
- **Glow:** A soft `box-shadow` using the accent color: `0 0 30px rgba(accent, 0.15)`. On hover: `0 0 50px rgba(accent, 0.25)`. On selection: `0 0 60px rgba(accent, 0.3)`.
- **Inner content:** Name (monospace, white, 14px), role tag (monospace, uppercase, accent-colored, 11px), a thin horizontal divider line at 10% white opacity.
- **Ambient animation:** A slow, continuous `opacity` oscillation on the glow (0.15 to 0.2 over 4 seconds, eased). Each node has a slightly different phase offset so they don't pulse in unison -- like heartbeats.
- **Fit indicator:** A thin colored ring (4px) inside the border. Green `#4CAF50`, amber `#FFC107`, red `#F44336`. Only visible when a role is assigned.

### Connection Lines (The Alchemy)

Connections are not boring lines. They are **energy conduits**:

- **Path:** Smooth cubic Bezier. Curvature increases with distance between nodes.
- **Stroke:** 2px base. Color is a 50/50 blend of the two connected minds' accent colors.
- **Glow:** An SVG filter applies a Gaussian blur (stdDeviation 4) to a duplicate of the line at 40% opacity, creating a neon tube effect.
- **Chemistry encoding:** The line's opacity and pulse rate encode chemistry. High synergy: brighter, slower pulse. High tension: dimmer base with sharper, faster pulse. Neutral: steady dim glow.
- **Activity state:** During a debate involving connected minds, the line animates with traveling particles (small dots moving along the Bezier path) in the blended color.
- **Creation animation (F14):** On first connection, a burst of particles explodes from the midpoint outward, then settles into the steady glow. The chemistry text fades in over 1 second, holds for 3 seconds, then fades to invisible (always accessible via hover or detail panel).

### Panel Design (Glass and Depth)

All panels (sidebar, detail panel, debate panel) use the glass-morphic language:

- **Background:** `rgba(12, 12, 20, 0.88)` with `backdrop-filter: blur(24px) saturate(1.2)`.
- **Border:** `1px solid rgba(255, 255, 255, 0.05)` with a subtle inner highlight at the top edge (`border-top: 1px solid rgba(255, 255, 255, 0.08)`).
- **Shadow:** `0 8px 32px rgba(0, 0, 0, 0.4)` -- panels float above the canvas.
- **Entry animation:** Panels slide in from their edge with Framer Motion (`x: 300` to `x: 0` for right panels, `x: -300` for left) with a spring physics curve (`stiffness: 300, damping: 30`).
- **Scrollbar:** Custom thin scrollbar (6px) in `rgba(255, 255, 255, 0.1)` with `rgba(255, 255, 255, 0.2)` thumb. Invisible until hover.

### Debate Thread Design

The debate thread is the showpiece of Layer 2. Each message:

- **Layout:** Full-width within the debate panel. Left-aligned with a colored vertical accent bar (4px) on the left edge matching the speaking mind's color.
- **Header:** Mind name in monospace, accent-colored, 12px. Round number as a muted badge.
- **Body:** Serif font, 14px, `rgba(255, 255, 255, 0.87)` -- slightly off-white for reading comfort.
- **Spacing:** 20px between messages. A thin hairline divider at 5% white between speakers.
- **Streaming:** Messages appear with a typing animation -- characters stream in at 30ms intervals, giving the feeling of the mind thinking in real time.
- **Scroll behavior:** Auto-scroll to latest message during active debate, but the user can scroll up to review without being yanked back.

### Canvas Ambience (The Soul of the Interface)

This layer is what separates a 7/10 from a 9/10:

- **Light pools:** Each mind node emits a soft radial gradient on a layer beneath the nodes. Radius 150-200px. Color matches the mind's accent at 5-8% opacity. Where two pools overlap, the colors blend additively -- creating emergent hues in the negative space between minds. This makes the canvas feel like it has atmosphere.
- **Particle drift:** A canvas-wide particle system with 30-50 small dots (1-2px) drifting slowly in random directions at 0.1-0.3 px/frame. Color: white at 10-15% opacity. During active simulation, particle count doubles and speed increases.
- **Noise texture:** A full-canvas overlay of static film grain at 2% opacity. Applied via CSS `background-image` using a tiling noise PNG. This adds analog warmth to the digital surface.
- **Depth layers:** The dot grid is at z-0. Light pools at z-1. Particles at z-2. Connection line glows at z-3. Connection lines at z-4. Nodes at z-5. Panels at z-6. This layering creates genuine depth without 3D.

### Micro-Interactions Inventory

Every interaction must have tactile feedback:

| Action | Visual Response | Duration |
|--------|----------------|----------|
| Hover mind in library | Accent color glow appears on card, quote fades in | 200ms |
| Drag mind from library | Ghost node follows cursor at 50% opacity with accent glow | Continuous |
| Drop mind on canvas | Placement ceremony: flash, quote, materialize | 1.5s |
| Hover node on canvas | Glow intensifies, subtle scale up (1.02x) | 200ms |
| Select node | Glow brightens, border accent increases, detail panel slides in | 300ms |
| Change role | Role text cross-fades, fit ring color transitions smoothly | 400ms |
| Create connection | Line draws from source to target, spark burst at midpoint | 800ms |
| Hover connection | Chemistry text fades in at midpoint, line brightens | 300ms |
| Delete node | Node dissolves outward into particles matching accent color | 600ms |
| Delete connection | Line fades and retracts to both endpoints simultaneously | 400ms |
| Start debate | Connected lines begin particle animation, panel slides in | 500ms |
| Debate message arrives | Typing animation, accent bar pulses once | Per message |

### Sound Design Opportunities (Future, Architecture Only)

The event system (F16) should emit events at these moments. When sound is eventually added, the palette should be: low ambient drone (always present, shifts with simulation state), soft tonal chime on node placement (pitch varies by mind), metallic resonance on connection creation, distant murmur texture during active debate, and a clean click on UI interactions. Think Brian Eno's generative music principles -- not notification sounds, but environmental audio.

### Responsive Behavior

This is a desktop-first power tool. Minimum viewport: 1280px wide. Below that, a message suggests using a larger screen. No mobile layout. The sidebar collapses to icons at narrow widths. The detail panel overlays the canvas on smaller screens rather than pushing it. The canvas itself is always full-viewport with panels overlaid.

### Performance Targets

- Canvas with 12 nodes and 20 connections: 60fps pan and zoom.
- Node drag: Zero perceptible lag. Framer Motion layout animations must not block pointer events.
- Panel open/close: Under 300ms total animation time.
- Debate message streaming: First token visible within 500ms of API response start.
- Initial page load: Under 2 seconds to interactive canvas (no heavy assets blocking first paint).

---

## Appendix A: Mind Archetype Roster (Launch Set)

| # | Mind | Domain | Category | Accent Color |
|---|------|--------|----------|-------------|
| 1 | Albert Einstein | Physics & Innovation | Science | Electric Violet |
| 2 | Leonardo da Vinci | Art & Engineering | Art | Burnished Gold |
| 3 | Sun Tzu | Strategy & Warfare | Strategy | Jade Green |
| 4 | Cleopatra VII | Diplomacy & Power | Governance | Royal Crimson |
| 5 | Nikola Tesla | Invention & Engineering | Science | Electric Cyan |
| 6 | Isaac Newton | Mathematics & Science | Science | Silver Steel |
| 7 | Niccolo Machiavelli | Political Strategy | Strategy | Dark Blood |
| 8 | Alexander the Great | Military & Leadership | Strategy | Conquest Gold |
| 9 | Catherine the Great | Governance & Reform | Governance | Imperial Purple |
| 10 | Marie Curie | Research & Discovery | Science | Radium Teal |
| 11 | Genghis Khan | Empire & Logistics | Strategy | Steppe Brown |
| 12 | Ada Lovelace | Computing & Vision | Computing | Computational Rose |

## Appendix B: Debate Prompt Architecture

Each debate turn is generated by a single API call with a system prompt structured as:

```
[HIDDEN FRAMEWORK PROMPT FOR MIND ARCHETYPE]

You are {mind.name}, serving as {mind.role} at {company.name}.
The company's mission: {company.mission}.

You are in a debate with: {otherMinds.map(m => m.name + " (" + m.role + ")")}.
Topic: {debate.topic}

Conversation so far:
{debate.messages.map(m => m.mindName + ": " + m.content)}

Respond as {mind.name} would -- in their voice, with their reasoning style,
drawing on their domain expertise. Be substantive. Take a position.
Disagree if you would disagree. Concede if convinced. Be yourself.

Keep your response to 2-4 paragraphs.
```

The framework prompt (the `systemPromptCore` from the archetype data) is prepended to the system message. It is never visible in the UI, never logged to the client, and never included in exported JSON. The API route strips it before returning the response.

Debate flow:
1. Client sends: participant IDs, topic, conversation history.
2. Server selects the next speaker (round-robin among participants).
3. Server constructs the prompt with that mind's framework.
4. Server streams the response back to the client.
5. Client appends the message to the thread and displays it.
6. Repeat for N rounds (default 3 rounds per participant, configurable).

## Appendix C: Chemistry Computation

Chemistry is not AI-generated at runtime. It is a predefined dataset of pairwise scores based on historical relationships, cognitive compatibility, and domain complementarity. This ensures instant feedback on connection creation.

The matrix covers all 66 unique pairs of the 12-mind roster. Each entry includes a numeric score (0-100), a warmth classification, a one-line summary, and a 2-3 sentence detail.

For minds not in the predefined matrix (future expansion), a fallback algorithm computes chemistry from archetype metadata: shared domain categories increase score, opposing thinking patterns create tension (productive or unproductive), and complementary strengths produce synergy.

---

*This specification describes Layers 1-2 of the Great Mind Company Builder. It is designed to be built by a solo developer with AI assistance, targeting a 9/10 score on Design, Originality, Craft, and Functionality. The canvas is the instrument. The minds are the players. The user is the conductor.*
