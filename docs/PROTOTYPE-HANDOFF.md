# PCC Summary — Prototype Handoff

**Document type:** Engineering handoff  
**Prototype:** `PCC-Summary` (Vite + LWC + SLDS)  
**Prepared by:** Yuha Kim, UX Designer — Salesforce Industries (Health Cloud)  
**Status:** Ready for engineering review  
**Related PRD:** Release 264 — PCC Provider Agents Product Brief  

---

## 1. Purpose of This Document

This document bridges the interactive prototype and the production LWC implementation. It describes what the prototype contains, how to navigate every interactive state, which behaviors are intentional design decisions vs. prototype scaffolding, and where the production implementation diverges from the prototype.

Read the [Generation Spec](./PCC-Summary-Generation-Spec.md) alongside this doc — it covers the JSON schema contract. This doc covers the **UI behavior**.

---

## 2. Prototype Overview

The prototype simulates the **Agentforce Health Intelligence Surface (AHIS)** — a custom LWC panel that surfaces a persona-aware, AI-generated summary on the Member/Patient/Provider 360 record page.

### What it covers

| Area | In Prototype |
|---|---|
| All 4 summary personas (Member, Patient, Provider Individual, Provider Facility) | ✅ |
| AI-generated micro-summary blurb | ✅ (mocked, 800ms delay) |
| Collapsible section layout (Show more / Show less) | ✅ |
| Insights panel with risk categories and drill-down | ✅ |
| Suggested actions with accept / dismiss / modify | ✅ |
| Salesforce record page chrome (header, activity, related lists) | ✅ (simulated shell) |
| SLDS 1 / SLDS 2 theme switching | ✅ |
| Dark mode | ✅ |
| Action Bar (primary + secondary CTA + feedback widget) | ⚠️ Hidden — see §7 |
| Real data from Health Cloud / EHR / Data 360 | ❌ Mock only |
| Agentforce panel integration | ❌ Out of scope for prototype |

---

## 3. Running the Prototype

### Local development

```bash
cd prototype
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Hot reload is active.

### Production build (smoke test)

```bash
cd prototype
npm run build
npm run preview
```

### GitHub Pages (deployed previews)

- **Production:** `https://yuhakim-ux.github.io/PCC-Summary/`
- **Branch preview:** `https://yuhakim-ux.github.io/PCC-Summary/previews/<branch-slug>/`
- **PR preview:** `https://yuhakim-ux.github.io/PCC-Summary/previews/pr-<number>/`

Deployments run automatically via GitHub Actions on push to `main` or `feature/*`, `fix/*`, `prototype/*` branches.

---

## 4. Navigating the Prototype

### Default route (`/`)

This is the primary experience — the record page with the AHIS summary panel. It loads in a **pre-generation state** by default: the summary card is empty and a **"Generate Summary"** button is shown.

### Navigation tabs

| Tab | Route | Notes |
|---|---|---|
| Home | `/` | Record page — primary prototype view |
| Contacts | `/contacts` | Stub — not relevant to this handoff |
| Settings | `/settings` | Stub — not relevant to this handoff |

All prototype work is on the `/` route.

---

## 5. Interactive States — Step by Step

### State 1: Pre-generation (empty state)

**What the user sees:** The AHIS card with header, identity placeholder, and a "Generate Summary" button.  
**What to test:** Confirm the empty state renders correctly before any generation call is made.

### State 2: Loading

**Trigger:** Click "Generate Summary"  
**What happens:** An 800ms simulated delay fires. A loading spinner appears inside the summary card.  
**In production:** Replace the `setTimeout` in `ahis.js → loadData()` with the real API call.

### State 3: Summary rendered (default — collapsed)

**What the user sees after generation:**
- **Identity grid** at the top (name, plan/MRN, PCP, last contact)
- **Micro-summary blurb** — 2–4 sentence plain-language paragraph
- **"AI" label + timestamp** — e.g., "Today at 2:34 PM"
- **Alerts section** — always visible, not collapsible
- **"Show more (N)" toggle** — reveals remaining sections
- **Insights tab** — accessible immediately
- **Actions tab** — accessible immediately

Sections collapsed by default (hidden behind "Show more"):
- Conditions / Clinical Snapshot
- Claims / Medications / Encounters / Labs / Immunizations (persona-specific)
- Care Gaps / Care Barriers / Care Team / Care Programs
- Provider: Credentialing, Network, Cases, Adverse Actions, Roster

Sections always visible regardless of collapse state:
- `alerts` (all personas)
- `patientCareGaps` (patient persona)
- `adverseActions` (provider persona — always shows section even when empty)

### State 4: Expanded

**Trigger:** Click "Show more (N)"  
**What happens:** All sections for the current persona are rendered. Toggle label changes to "Show less."

### State 5: Persona switch

**Trigger:** The **persona FAB** (floating pill, bottom of the page)  
**What happens:**
1. Persona picker opens (list of 4 role options)
2. Selecting a role triggers an immediate re-load with the new persona's data
3. All sections, the identity grid, micro-summary, insights, and actions all update
4. The FAB closes

**Four available personas:**

| Picker Label | Role Key | Runtime Persona |
|---|---|---|
| Member Summary | `MEMBER` | `member` |
| Patient Summary | `PATIENT` | `patient` |
| Provider — Individual | `PROVIDER_INDIVIDUAL` | `provider` |
| Provider — Facility | `PROVIDER_FACILITY` | `provider` |

**Note:** Provider Individual and Provider Facility share the `provider` runtime persona. The distinction is in the data — facility payloads use `facilityLicense`, `cmsCertification`, `accreditation`, and `roster` chips instead of personal license/DEA/board certs.

### State 6: Insight drill-down

**Trigger:** Click "View Records" on any insight card in the Insights tab  
**What happens:** A modal opens (`AhisDrillDown`) displaying the risk category and insight title. In production, this modal should show the related Salesforce records referenced in `sourceRecords[]`.  
**Current prototype state:** Modal opens but shows placeholder content only.

### State 7: Action response

**Trigger:** Click "Accept", "Dismiss", or the overflow menu on any action card in the Actions tab  
**What happens:**
- **Accept** → Action card updates to "Accepted" state (green badge)
- **Dismiss** → Action card updates to "Dismissed" state
- **Overflow → Edit** → Opens `AhisNotesModal` for notes input → On confirm, sets status to "Modified"
- **Overflow → Schedule** → Fires a `scheduleaction` custom event (no modal in prototype — wired in production to calendar)

State changes are local to the current session and reset on page refresh.

### State 8: Follow toggle

**Trigger:** "Follow" button in the record header  
**What happens:** Button toggles between "Follow" (neutral) and "Following" (success / green).  
**In production:** Wire to standard Salesforce Follow/Unfollow API.

### State 9: Refresh

**Trigger:** Refresh icon button in the AHIS card header  
**What happens:** Re-runs `loadData()` with the same persona. Simulates regenerating the summary.  
**In production:** Re-calls the summary generation endpoint.

### State 10: Theme switching

**Trigger:** Theme switcher in the global header (top-right)  
**Options:** SLDS 2 Light (default), SLDS 2 Dark, SLDS 1 Light  
**What to check:** All badge colors, status dots, and section styles render correctly across all three themes.

---

## 6. Section Behavior Reference

Sections are **registry-driven**, not free-form. The registry (`ahisSectionRegistry.js`) controls which sections appear per persona, in what order, and which UI primitive renders each one.

| Primitive | What it renders |
|---|---|
| `identity-grid` | Multi-field header row (name, plan/MRN, PCP, last contact, risk level) |
| `alert-list` | Labeled rows with severity icon. Always shown; never collapses |
| `bullet-list` | Structured rows with status dot or badge + optional detail sub-text |
| `bullet-list-or-empty` | Same as bullet-list but renders a fixed empty message when empty (used for Adverse Actions) |
| `chip-group` | Compact tag chips (care programs, facility roster names) |

**Empty section behavior:** If a section's data array is empty, the entire section is omitted — **except** `bullet-list-or-empty`, which always renders with an empty message. Engineering should not hide the Adverse Actions section even when empty.

---

## 7. Hidden Feature: Action Bar

The action bar was temporarily hidden on 2026-04-07 pending a design review decision.

**What it contains:**
- Primary CTA button (persona-aware): "Check Appeal SLA" / "Schedule Referral" / "Renew Credential"
- Secondary CTA button (persona-aware): "Create Case" / "Order Labs" / "Resolve Case"
- Feedback widget (thumbs up / thumbs down + reason dropdown)

**How to restore for testing:**

In `prototype/src/modules/page/ahis/ahis.js`, change:

```javascript
showActionBar = false;
```

to:

```javascript
showActionBar = true;
```

No HTML changes needed — it is already wrapped in `<template lwc:if={showActionBar}>`.

---

## 8. Prototype vs. Production Delta

| Behavior | Prototype | Production LWC |
|---|---|---|
| Data source | `data/ahis/ahis.js` (static mock) | Agentforce summary generation API / Data Graph |
| Loading delay | 800ms `setTimeout` | Real API latency |
| Insight drill-down | Modal with placeholder content | Modal with related HC records |
| Action "Schedule" | Fires custom event only | Wires to HC appointment / calendar flow |
| Persona switching | Dropdown FAB | Driven by logged-in user's Permission Set (`View_Payer_Summary`, `View_Provider_Summary`, `View_Care_Summary`) |
| Follow button | Local toggle | Salesforce standard Follow API |
| Feedback widget | `console.log` only | Einstein Trust Layer feedback endpoint |
| SLDS theme | Switchable via UI | Set by org theme; no runtime switcher in production |
| Record page chrome | Simulated shell | Standard Salesforce Lightning record page layout |

---

## 9. File Reference

| File | Purpose |
|---|---|
| `prototype/src/modules/data/ahis/ahis.js` | All mock payloads — one object per persona. Edit here to test data edge cases. |
| `prototype/src/modules/data/ahisSectionRegistry/ahisSectionRegistry.js` | Section order, persona assignment, primitive routing, status → badge/dot mapping. |
| `prototype/src/modules/page/ahis/ahis.js` | Page controller — persona state, load, collapse, action handlers. |
| `prototype/src/modules/page/ahis/ahis.html` | Record page layout template. |
| `prototype/src/modules/ui/ahisSummary/` | Main summary card — renders sections from registry. |
| `prototype/src/modules/ui/ahisInsights/` | Insights tab — risk categories, confidence badges, drill-down. |
| `prototype/src/modules/ui/ahisActions/` | Actions tab — accept/dismiss/modify flow, notes modal. |
| `prototype/src/modules/ui/ahisDrillDown/` | Drill-down modal (stub — needs production wiring). |
| `prototype/src/modules/ui/ahisIdentityGrid/` | Identity header primitive. |
| `prototype/src/modules/ui/ahisAlertList/` | Alert list primitive. |
| `prototype/src/modules/ui/ahisBulletList/` | Bullet list primitive. |
| `prototype/src/modules/ui/ahisChipGroup/` | Chip group primitive. |
| `prototype/src/modules/ui/ahisFeedback/` | Feedback widget (thumbs + dropdown). Hidden with action bar. |

---

## 10. Key Contacts

| Role | Name |
|---|---|
| UX Designer | Yuha Kim |
| Product Owner | Rucha Patki |
| Engineering Manager | Shobha Setty |
| Architect | Kamlesh Mahajan |
| Senior PM (Health Cloud) | Mittali Tak |
