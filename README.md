# NodeHunt 2026 — Frontend Application

Modern, immersive tournament client for **NodeHunt 2026**, built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide React**.

---

## Overview & Gameplay Flow

NodeHunt 2026 is an interactive cybersecurity and algorithms tournament interface created for SIAM-VIT. Participants traverse an interconnected graph of challenges under a **Fog of War** topology.

### Key Features

- **Obsidian & Muted Crimson Palette**: Sleek dark-mode aesthetic with atmospheric glows, balanced dot-matrix radar overlays, and high-contrast typography.
- **Fog of War Topology Radar**: Participants only see traversed nodes, their current position, and immediately adjacent branches upon unlock.
- **Topological Route Selection**: Dynamic choice tiles appear only after node clearance, preventing arbitrary node teleportation.
- **Invigilator Verification Window**: Clean in-room solution presentation interface with live attempt counter and potential score readout.
- **Organizer Command Deck (`/admin`)**:
  - Live metric KPIs (Total Teams, Active Contenders, Finishers, Average Score).
  - Full 10-node topology density visualizer showing team clusters in real time.
  - Team creation tool (exclusive to organizers; participants log in with assigned credentials).
  - Teams roster with password lookup, live location, and lock/unlock actions.
  - Dedicated Live Standings synchronized directly with the tournament leaderboard.
- **Official Tournament Standings (`/results`)**: Dynamic leaderboard showcasing completed finishers, exact solve times, points, and traversed paths.

---

## System Requirements

- **Node.js**: v18.17.0 or higher (Node.js 20 LTS recommended)
- **Package Manager**: `npm` (comes with Node), `pnpm`, or `yarn`
- **Git**

---

## Installation & Setup Guide

### Windows Setup (PowerShell / Command Prompt)

1. **Clone the Repository**:
   ```powershell
   git clone https://github.com/harshtiwari0225-commits/nodehunt-2026-FE.git
   cd nodehunt-2026-FE
   ```

2. **Install Node Dependencies**:
   ```powershell
   npm install
   ```

3. **Configure Environment (Optional)**:
   By default, the client communicates with the backend at `http://localhost:8000`. To point to a custom API server or production URL, create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the Development Server**:
   ```powershell
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production**:
   ```powershell
   npm run build
   npm run start
   ```

---

### macOS & Linux Setup

1. **Clone and Enter Directory**:
   ```bash
   git clone https://github.com/harshtiwari0225-commits/nodehunt-2026-FE.git
   cd nodehunt-2026-FE
   ```

2. **Install Packages**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Project Structure

```text
NodeHunt_FE_26/
├── app/
│   ├── page.tsx               # Landing page with tournament overview
│   ├── layout.tsx             # Root document layout and global metadata
│   ├── globals.css            # Tailwind base styling, dark themes, and fonts
│   ├── admin/page.tsx         # Organizer Command Deck portal
│   ├── game/page.tsx          # Active tournament challenge & radar view
│   ├── join/page.tsx          # Team authentication portal
│   ├── locked/page.tsx        # Screen shown when team is locked by admin
│   ├── results/page.tsx       # Live tournament leaderboard and scorecard
│   └── winner/page.tsx        # Tournament finale screen
├── components/
│   ├── AdminPreview.tsx       # Organizer control panel, telemetry, and team creation
│   ├── DarkGradientBg.tsx     # Obsidian & crimson atmospheric background
│   ├── GameClient.tsx         # Challenge statement, verification, and route branching
│   ├── JoinForm.tsx           # Team login interface
│   ├── Navbar.tsx             # SIAM-VIT logo header with direct route navigation
│   ├── NodeGraph.tsx          # SVG radar map supporting Fog of War & Admin topology
│   ├── ResultsClient.tsx      # Leaderboard table and personal score scorecard
│   └── ui/                    # Reusable shadcn/ui and graphical primitives
├── data/
│   └── graph.ts               # 10-node topological coordinates and edge configurations
├── lib/
│   ├── api.ts                 # API client, network resilience, and state handling
│   ├── constants.ts           # Centralized session storage keys
│   ├── passcodes.ts           # Master configuration for invigilator verification
│   └── utils.ts               # Tailwind class merging helper (cn)
└── public/
    └── siamvit-logo-white.png # SIAM-VIT equation typography logo
```

---

## Available Application Routes

- `/` — Homepage: Tournament introduction and visual briefing.
- `/join` — Team Access: Authentication portal for registered teams.
- `/game` — Arena: Active node challenge statement, invigilator verification tile, and radar topology.
- `/results` — Standings: Official ranked tournament results and individual team path audits.
- `/admin` — Control Deck: Organizer telemetry, team creation, live rosters, and emergency controls.
- `/locked` — Lockout Screen: Displays notice when team progression has been paused by an organizer.
