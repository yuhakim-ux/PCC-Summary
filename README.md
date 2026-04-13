# PCC-Summary

Interactive **prototype** for the **PCC (Patient/Provider) Summary** feature — a Health Cloud Agentforce surface that gives call center agents a persona-aware, AI-generated patient or provider summary on the 360 record page.

**GitHub:** [github.com/yuhakim-ux/PCC-Summary](https://github.com/yuhakim-ux/PCC-Summary)  
**Deployed prototype:** [yuhakim-ux.github.io/PCC-Summary](https://yuhakim-ux.github.io/PCC-Summary/)

---

## Who should use this

| Role | Start here |
|---|---|
| **Engineering** | [docs/PROTOTYPE-HANDOFF.md](docs/PROTOTYPE-HANDOFF.md) — interactive states, file map, prototype vs. production delta |
| **Prompt / GenAI** | [docs/PCC-Summary-Generation-Spec.md](docs/PCC-Summary-Generation-Spec.md) — JSON schema, controlled vocabulary, output rules |
| **Design / PM** | [docs/UX-DESIGN-SPEC.md](docs/UX-DESIGN-SPEC.md) — design decisions, indicator system, content limits, accessibility |

---

## Quick start (prototype)

```bash
cd prototype
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default route (`/`) is the record + summary experience.

- Use the **persona FAB** (bottom of page) to switch between Member, Patient, Provider Individual, and Provider Facility views.
- Click **"Generate Summary"** to simulate loading.
- Click **"Show more"** to expand all sections.
- Explore **Insights** and **Actions** tabs for the full panel.

---

## Document index

| Document | Audience | Purpose |
|---|---|---|
| **This file** | Everyone | Onboarding and navigation |
| [docs/PROTOTYPE-HANDOFF.md](docs/PROTOTYPE-HANDOFF.md) | Engineering | Prototype navigation guide, interactive states, file reference, prototype vs. production delta |
| [docs/UX-DESIGN-SPEC.md](docs/UX-DESIGN-SPEC.md) | Engineering / Design | UI design rules — indicator system, collapse behavior, empty states, accessibility, design decisions log |
| [docs/PCC-Summary-Generation-Spec.md](docs/PCC-Summary-Generation-Spec.md) | Engineering / Prompt | JSON schema contract, persona payloads, controlled status vocabulary, content limits |
| [docs/HIDDEN-FEATURES.md](docs/HIDDEN-FEATURES.md) | Engineering | How to restore the temporarily hidden Action Bar |
| [docs/VERSION-CONTROL.md](docs/VERSION-CONTROL.md) | Engineering | Branch conventions and remotes |

---

## Repository layout

```
PCC-Summary/
├── README.md
├── docs/
│   ├── PROTOTYPE-HANDOFF.md         ← Engineering: what the prototype contains and how to use it
│   ├── UX-DESIGN-SPEC.md            ← Design rules for the production LWC
│   ├── PCC-Summary-Generation-Spec.md  ← JSON schema + generation contract
│   ├── HIDDEN-FEATURES.md
│   └── VERSION-CONTROL.md
└── prototype/                       ← Vite + LWC + SLDS app
    ├── src/
    │   └── modules/
    │       ├── shell/               # App chrome (header, nav, panel, theme)
    │       ├── page/ahis/           # Record page + AHIS controller
    │       ├── ui/                  # Summary primitives (ahisSummary, insights, actions, …)
    │       └── data/                # Mock payloads + section registry
    ├── package.json
    └── vite.config.js
```

---

## Production implementation path

1. Read [docs/PCC-Summary-Generation-Spec.md](docs/PCC-Summary-Generation-Spec.md) for the payload contract.
2. Read [docs/PROTOTYPE-HANDOFF.md](docs/PROTOTYPE-HANDOFF.md) for which behaviors are prototype scaffolding vs. real design intent.
3. Read [docs/UX-DESIGN-SPEC.md](docs/UX-DESIGN-SPEC.md) for indicator logic, section rules, and empty states before building the LWC.
4. Replace `prototype/src/modules/data/ahis/ahis.js` (static mock) with the real API call in `loadData()`.
5. Wire the Insight drill-down modal to real HC record queries.
6. Wire Action "Schedule" to HC appointment / calendar flow.
7. Validate persona switching against Permission Sets (`View_Payer_Summary`, `View_Provider_Summary`, `View_Care_Summary`).

---

## License

Internal use unless otherwise specified.
