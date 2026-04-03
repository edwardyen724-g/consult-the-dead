# Great Mind Company Builder — Project Bible

## Document Purpose

This document captures the complete vision, architecture, design philosophy, and implementation details for the **Great Mind Company Builder**. It is written so that any AI agent reading this can understand the full scope of the project and recreate or continue building it.

---

## 1. Origin & Core Insight

The creator developed a proprietary method called the **Great Mind Framework** — a system for cloning the thinking patterns, decision-making styles, and cognitive signatures of historical figures. The framework has already been validated: it was used to recreate a "Steve Jobs" archetype that successfully designed a beautiful website.

The key insight: rather than productizing the framework itself (which would expose the IP), the framework should remain **proprietary and hidden** — used as an invisible engine behind products that showcase its power without revealing how it works.

---

## 2. Product Vision

### What It Is

An **AI-powered company simulator** where users build virtual organizations staffed by cloned historical geniuses. Each "great mind" is a fully realized AI archetype that thinks, debates, creates, and executes in the style of its historical counterpart.

### The Metaphor

Think of it as a **drag-and-drop company builder** — like an org chart tool that comes alive. Each node on the chart is a historical mind. The connections between them define reporting lines, collaboration channels, and power dynamics.

### Why It's Different

Most AI tools give you one generic assistant. This gives you a **team of specialized minds** with distinct thinking styles, natural tensions, complementary strengths, and emergent chemistry. The variation in team composition IS the product.

---

## 3. Core Features

### 3.1 Drag-and-Drop Org Chart (THE Control Panel)

This is the primary interface. The user:

- Drags historical minds from a sidebar library onto a canvas
- Assigns each mind a role (CEO, CTO, CMO, VP Engineering, Head of R&D, etc.)
- Draws connection lines between nodes to define reporting structure and collaboration paths
- Can rearrange, swap roles, and restructure at any time

The org chart is not decorative — it is the **configuration layer** that determines how the company operates.

### 3.2 Company as a Project

Each company is a self-contained project with:

- A company name and stated goal/mission
- An org structure (the drag-and-drop chart)
- Memory and history of all decisions, debates, and outputs
- Multiple products, strategies, and research threads running in parallel

### 3.3 Great Mind Archetypes

Each mind is not a shallow persona. The Great Mind Framework captures:

- **Thinking patterns**: How this person approached problems (first principles, intuition, empirical, strategic, etc.)
- **Decision-making style**: Risk tolerance, speed, collaboration preference
- **Domain expertise**: What they were known for and how it translates to modern business
- **Communication style**: How they would express ideas, argue, persuade
- **Strengths and weaknesses**: What roles they naturally excel at, where they struggle

Example archetypes discussed:

| Mind | Domain | Natural Strengths |
|------|--------|-------------------|
| Albert Einstein | Physics & Innovation | Abstract thinking, thought experiments, paradigm shifts |
| Alexander the Great | Military & Leadership | Conquest strategy, team loyalty, bold execution |
| Leonardo da Vinci | Art & Engineering | Cross-disciplinary thinking, visual thinking, invention |
| Cleopatra VII | Diplomacy & Power | Negotiation, alliance building, brand & image |
| Sun Tzu | Strategy & Warfare | Competitive analysis, resource efficiency, deception |
| Nikola Tesla | Invention & Engineering | Visionary R&D, systems thinking, obsessive focus |
| Catherine the Great | Governance & Reform | Organizational reform, talent recruitment, expansion |
| Isaac Newton | Mathematics & Science | First-principles thinking, rigorous analysis, foundational work |
| Niccolò Machiavelli | Political Strategy | Realpolitik, power dynamics, pragmatism |
| Marie Curie | Research & Discovery | Deep research, persistence, breaking barriers |
| Genghis Khan | Empire & Logistics | Scalable systems, meritocracy, rapid expansion |
| Ada Lovelace | Computing & Vision | Algorithmic thinking, future vision, math-art fusion |

The library should be **expandable** — the creator can add any historical figure using the Great Mind Framework.

### 3.4 Simulation Engine (The Minds Come Alive)

When the user hits "run," the company starts operating:

- **Debate mode**: Minds discuss strategy, disagree, form alliances, challenge each other's ideas. Alexander the Great as CEO might push for aggressive expansion while Sun Tzu as Head of Strategy argues for patience.
- **Cooperation mode**: Minds collaborate on shared goals. Da Vinci and Tesla co-designing a product. Curie and Newton doing joint research.
- **Competing teams**: The user can divide minds into teams that compete against each other for the best product, highest revenue, or best strategy. This creates a natural selection mechanism.
- **Document production**: Minds produce real artifacts — strategy memos, product specs, research reports, marketing plans, financial models.
- **Tool use / execution**: Minds don't just talk — they can use tool calls to actually build things. Write code, search the web, create files, analyze data. The company isn't just planning, it's DOING.

### 3.5 Analytics & Meta-Analysis

The tool should provide:

- **Contribution tracking**: Visualize how much each node (mind) is contributing to outcomes
- **Chemistry analysis**: Score the working relationships between pairs and groups — who works well together, where friction exists, what combinations produce breakthrough results
- **Role-fit scoring**: Is Alexander the Great actually better as Marketing Lead than CEO? The system should surface these insights
- **Mid-run adjustments**: The user can pause, swap roles, restructure the org, and resume — then compare performance before and after
- **Structure comparison**: A/B test different company structures against the same problem

### 3.6 Autonomous Operation

The ultimate goal: the user sets a company goal and lets it **run itself**. The minds:

- Hold meetings
- Make decisions
- Assign tasks to each other
- Research markets
- Build products
- Execute marketing strategies
- Report results

The user becomes the board of directors — observing, intervening when needed, but mostly watching the company operate.

---

## 4. Architecture Layers

The system should be built in progressive layers:

### Layer 1 — Visual Interface (Drag-and-Drop Org Chart)
The control panel. Configuration. The user's window into the company. A working prototype of this already exists as a React component (see Section 6).

### Layer 2 — Simulation Engine (Minds Thinking & Interacting)
The Great Mind Framework powering each node. Minds receive context (their role, their connections, company goal, current state) and produce outputs consistent with their archetype.

### Layer 3 — Analytics Dashboard
Contribution metrics, chemistry scores, role-fit analysis, performance comparisons. Overlaid on the org chart or in a separate panel.

### Layer 4 — Tool Use & Execution
Minds get access to real tools — code execution, web search, file creation, data analysis. The company can actually produce deliverables.

### Layer 5 — Autonomous Loop
Minds operate on a loop — perceive state, deliberate, decide, act, report. The user can step in at any point or let it run.

---

## 5. Strategic Decisions

### IP Protection
The Great Mind Framework is NEVER exposed to end users. Users interact with the org chart and the mind outputs. The framework is the invisible engine. This is a deliberate strategic decision to prevent copying.

### Build for Self First
The creator is building this for personal use first. The tool should optimize for a power user who wants to experiment with different team compositions, run simulations, and analyze results. Consumer polish comes later.

### Company = Project
Each company configuration is a saved project. The user can run multiple companies simultaneously, compare them, and iterate. Projects persist with full history.

---

## 6. Existing Prototype

A working React (JSX) prototype exists for the drag-and-drop org chart. Key features implemented:

- Sidebar with 12 great minds, searchable and filterable
- Drag-and-drop onto a dark canvas with dot-grid background
- Role assignment via dropdown (CEO, CTO, CMO, CFO, COO, VP Engineering, VP Sales, VP Product, Head of R&D, Head of Strategy, Head of Operations, Advisor)
- Visual connection lines between nodes (curved Bezier paths with glow effect)
- Node selection with detail panel showing profile, strengths, connections, and chemistry hints
- Editable company name and goal
- Color-coded roles and mind-specific accent colors
- Remove nodes and connections
- Clean, dark, monospace aesthetic (JetBrains Mono / SF Mono / Fira Code)

### Design Language
- Background: Deep dark (#0a0a0f) with subtle dot grid
- Cards: Dark glass-morphic (#13131f → #111118) with colored borders on selection
- Typography: Monospace, uppercase labels with letter-spacing for section headers
- Color: Each mind has a signature color; roles have distinct colors
- Connections: Curved lines with glow filter
- Interaction: Hover states, click-to-select, drag-to-move

---

## 7. What Comes Next

Priority order for the creator:

1. **Refine the drag-and-drop interface** — this is the daily-use control panel
2. **Wire up the Great Mind Framework** — each node calls the framework to generate archetype-consistent outputs
3. **Build the debate/cooperation engine** — minds interacting in threads, producing documents
4. **Add contribution tracking** — visualize who's doing what
5. **Add chemistry analysis** — score pairs and suggest optimal structures
6. **Enable tool use** — let minds execute real actions
7. **Build the autonomous loop** — set a goal and let it run
8. **Add competing teams** — divide and compare

---

## 8. Key Principles for Any Agent Continuing This Work

1. **The framework is secret.** Never expose how archetypes are generated. The user sees outputs, not methods.
2. **The org chart is the interface.** Everything flows from the visual structure. If it's not on the chart, it doesn't exist in the company.
3. **Minds must feel distinct.** Einstein should never sound like Alexander the Great. The whole point is that different compositions produce genuinely different outcomes.
4. **Build for experimentation.** The user wants to swap, restructure, compare, and iterate. Make this frictionless.
5. **Start simple, go deep.** Text debates first. Then documents. Then tool use. Then autonomy. Each layer builds on the last.
6. **Every company is a project.** Persistent state, full history, resumable at any point.
7. **Show the chemistry.** The interactions between minds are the magic. Surface tensions, synergies, and surprises.

---

*This document was generated from a conversation between the creator and Claude. It represents the creator's vision as of April 2026. The Great Mind Framework methodology is proprietary and intentionally not detailed here.*
