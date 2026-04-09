# PCC-Summary

**PCC-Summary** is the program for **persona-aware PCC (Patient Care / payer–care) summaries** in a Health Cloud–style console. This repository holds the **interactive LWC + Vite prototype** and the **engineering spec** for summary generation and UI rendering.

| | |
|---|---|
| **GitHub** | [github.com/yuhakim-ux/PCC-Summary](https://github.com/yuhakim-ux/PCC-Summary) |
| **Primary artifact** | `prototype/` — runnable UI (SLDS, Lightning base components, client-side routing) |
| **Spec (eng)** | [`docs/PCC-Summary-Generation-Spec.md`](docs/PCC-Summary-Generation-Spec.md) — payload schema, personas, section rules |

---

## For engineering

1. **Read the generation spec** — [`docs/PCC-Summary-Generation-Spec.md`](docs/PCC-Summary-Generation-Spec.md) defines summary types (Member / Patient / Provider), the JSON envelope, and how sections map to UI. Align backend and prompts with that contract so the prototype (and future LWC) stay in sync.

2. **Run the prototype locally** — Same UX patterns as a Salesforce console shell; use it to validate layout, density, and persona switching before platform integration.

3. **Code map (prototype)** — Mock data and section wiring live next to the UI:
   - Payload shape: `prototype/src/modules/data/ahis/ahis.js`
   - Section registry: `prototype/src/modules/data/ahisSectionRegistry/ahisSectionRegistry.js`
   - Record + summary page: `prototype/src/modules/page/ahis/`
   - Building blocks: `prototype/src/modules/ui/ahis*/`

   Module and file names may still use the **`ahis`** prefix from earlier naming; treat that as the **PCC-Summary UI surface** unless renamed in a dedicated refactor.

4. **Optional UI toggles** — [`docs/HIDDEN-FEATURES.md`](docs/HIDDEN-FEATURES.md) documents flags (e.g. action bar) that are off by default.

---

## Run the prototype

Requirements: **Node.js** (LTS recommended) and **npm**.

```bash
cd prototype
npm install
npm run dev
```

Open the URL printed in the terminal (default is often `http://localhost:3000`). The **home** route is the **record / summary** experience; use the global nav and the persona FAB (demo control) as needed.

**Production-style bundle (optional):**

```bash
cd prototype
npm run build
npm run preview
```

More detail on stack, routing, SLDS 1/2, and icons: [`prototype/README.md`](prototype/README.md).

---

## Clone this repo

```bash
git clone https://github.com/yuhakim-ux/PCC-Summary.git
cd PCC-Summary
```

If you still have an older remote named `AHIIS`, update it:

```bash
git remote set-url origin https://github.com/yuhakim-ux/PCC-Summary.git
```

---

## License

Internal use.
