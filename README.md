# PCC-Summary

Interactive **prototype** for **PCC (Patient Care / program) summary generation**: a Health Cloud–style console shell with a persona-aware summary surface (member, patient, provider individual, provider facility). Use this repo to align **backend and prompt output** with **what the UI can render**, before or alongside production LWC work.

**GitHub:** [github.com/yuhakim-ux/PCC-Summary](https://github.com/yuhakim-ux/PCC-Summary)

---

## Who should use this

| Role | Why |
|------|-----|
| **Engineering** | Validate JSON/payload shape, section ordering, and empty states against a running UI. |
| **Prompt / GenAI** | Match the **generation spec** so model output deserializes into the same structure the client expects. |
| **Design / PM** | Review flows, density, and persona switching in a browser without a Salesforce org. |

---

## Source of truth for “what to generate”

| Document | Purpose |
|----------|---------|
| [**docs/PCC-Summary-Generation-Spec.md**](docs/PCC-Summary-Generation-Spec.md) | **Design spec for engineering:** summary types, envelope fields, persona-specific blocks, section registry behavior, and UI primitives. **Start here** when wiring generators or APIs. |
| [**docs/HIDDEN-FEATURES.md**](docs/HIDDEN-FEATURES.md) | Optional UI toggles (e.g. action bar) that are off by default and how to turn them on. |
| [**docs/VERSION-CONTROL.md**](docs/VERSION-CONTROL.md) | Branch conventions and remotes. |

Implementation touchpoints called out in the spec:

- Mock / contract data: `prototype/src/modules/data/ahis/ahis.js`
- Section routing: `prototype/src/modules/data/ahisSectionRegistry/ahisSectionRegistry.js`
- Record page + chrome: `prototype/src/modules/page/ahis/`
- Primitives: `prototype/src/modules/ui/ahisSummary/`, `ahisInsights/`, `ahisActions/`, `ahisDrillDown/`, etc.

---

## Run the prototype locally

All runnable UI lives under **`prototype/`** (Vite + LWC + SLDS + Lightning Base Components).

```bash
cd prototype
npm install
npm run dev
```

Open the URL shown in the terminal (default is often **http://localhost:3000**).

- **Default route** (`/`) is the record + summary experience.
- Use the **persona FAB** (bottom area) to switch summary types and confirm layout and copy.
- **Generate Summary** simulates on-demand loading; refresh regenerates mock data.

**Production build (smoke test):**

```bash
cd prototype
npm run build
npm run preview
```

**Deep dive (routing, SLDS, icons, namespaces):** see [**prototype/README.md**](prototype/README.md).

---

## Repository layout (high level)

```
PCC-Summary/
├── README.md                 ← You are here (team onboarding)
├── docs/
│   ├── PCC-Summary-Generation-Spec.md   # Generation + rendering contract
│   ├── HIDDEN-FEATURES.md
│   └── VERSION-CONTROL.md
└── prototype/                # Vite app — npm install && npm run dev
    ├── src/
    │   ├── router.js / routes.config.js
    │   └── modules/
    │       ├── shell/        # App chrome (header, nav, panel, theme)
    │       ├── page/         # Route views (e.g. page-ahis = record + summary)
    │       ├── ui/           # Summary primitives (ahisSummary, insights, …)
    │       └── data/         # Fixtures + section registry
    ├── package.json
    └── vite.config.js
```

---

## Aligning services with the UI

1. Read **PCC-Summary-Generation-Spec.md** for the envelope and persona payloads.
2. Emit JSON that matches the shapes used in `prototype/src/modules/data/ahis/ahis.js` (or a strict superset).
3. Run the prototype and paste or swap in API-driven data when you integrate—**sections are registry-driven**, not free-form markdown in this prototype.

---

## License

Internal use unless otherwise specified.
