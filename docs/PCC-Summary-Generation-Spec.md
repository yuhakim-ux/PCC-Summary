# PCC-Summary Generation — Design Specification

**Audience:** Engineering (backend, prompt engineering, LWC integration)  
**Goal:** Define a **consistent, machine-validatable output schema** and **generation rules** so GenAI (or rules engines) can produce **Member**, **Patient**, and **Provider** summaries that render uniformly in the **PCC-Summary** UI (prototype and future LWC).

**Scope:** This document reflects the **prototype contract** implemented in `prototype/src/modules/data/ahis/ahis.js` (payload shape), `prototype/src/modules/data/ahisSectionRegistry/ahisSectionRegistry.js` (section routing, status → UI indicators), and UI components (`ahisInsights`, `ahisActions`, `ahisSummary`). Production orgs may add fields or limits; treat this as the **baseline schema** to extend, not replace.

---

## 1. Summary types (personas)

The UI distinguishes **four selectable summary types** (role keys) that collapse into **three runtime personas** for section rendering:

| Role key (`summaryType` / picker value) | Runtime persona (`persona` on payload) | Primary user context |
|----------------------------------------|----------------------------------------|----------------------|
| `MEMBER` | `member` | Payer / contact center — plan, claims, financial, appeals |
| `PATIENT` | `patient` | Clinical / care — conditions, meds, encounters, care gaps |
| `PROVIDER_INDIVIDUAL` | `provider` | Individual provider — credentialing, network, cases |
| `PROVIDER_FACILITY` | `provider` | Facility — accreditation, CMS, roster (same persona as individual) |

**Rule:** Every generated document MUST set:

- `persona` to exactly one of: `member` | `patient` | `provider`.
- For provider summaries, `providerSubType`: `individual` | `facility` (drives copy and which credentialing rows exist in data).

**Display metadata (card chrome):** Optional but recommended for consistent headers:

- `badge` — short label (e.g. `"Member Summary"`).
- `label` — sub-label for tooling (e.g. `"Payer CSR View"`).
- `message` — one-line description of the view.
- `icon` — SLDS utility icon name for chrome.

---

## 2. Top-level document shape (generation envelope)

All summary types share this **logical envelope**. Field names match the prototype; keep types stable for deserialization.

```json
{
  "success": true,
  "generatedAt": "2026-04-08T12:00:00.000Z",
  "persona": "member",
  "providerSubType": "individual",
  "badge": "Member Summary",
  "label": "Payer CSR View",
  "message": "Plan, claims, and financial overview for member calls",
  "icon": "utility:identity",
  "microSummary": "Plain-language paragraph, 2–4 sentences.",
  "insights": [],
  "suggestedActions": []
}
```

**Required for rendering:**

| Field | Required | Notes |
|-------|----------|--------|
| `success` | Yes | Must be `true` for happy path. |
| `generatedAt` | Yes | ISO 8601; UI may show “Today at …”. |
| `persona` | Yes | Drives which sections appear. |
| `microSummary` | Yes | Non-empty string after generation. |
| Persona-specific body | Yes | See §4–6; omitting blocks yields empty sections or hidden rows. |

**`microSummary` (agentic blurb):**

- **Purpose:** Single dense paragraph above fold; answers “why should I care in 10 seconds?”
- **Content:** Lead with membership/plan or clinical stability, then top risks (denials, SLAs, allergies, credential expiry, etc.).
- **Length (recommended):** 350–600 characters or 3–5 sentences; avoid bullet characters inside this string (sections below carry structure).

---

## 3. Section structure (what the UI renders)

Sections are **not** a free-form markdown blob. The client builds a **fixed ordered list** from `persona` + data using a registry. Each **section** maps to one **primitive**:

| Primitive | Use |
|-----------|-----|
| `identity-grid` | Demographics / plan / provider snapshot (multi-line header). |
| `alert-list` | Alerts, care gaps as labeled rows with severity. |
| `bullet-list` | Structured rows with optional status dot/badge and detail layout. |
| `bullet-list-or-empty` | Same as bullet list, but allows a **fixed empty message** when array is empty (Provider **Adverse Actions**). |
| `chip-group` | Compact tags (care programs only). |

**Ordering:** Order is defined by the registry sequence for that persona. Generators should **populate objects in the same conceptual order** (e.g. Member: identity → alerts → conditions → claims → …) so diffs and tests are stable.

**Empty sections:** If a section’s data resolves to empty, that section is **omitted** from the UI **except**:

- `bullet-list-or-empty` always shows the section with `emptyMessage` when the list is empty.

---

## 4. Persona-specific payload requirements

### 4.1 Member (`persona: "member"`)

| Registry ID | Source fields on payload | Notes |
|-------------|---------------------------|--------|
| `identityPlan` | `identityPlan` | Member ID, DOB, plan, PCP, last interaction. |
| `alerts` (Clinical Profile) | `alerts[]` + `careGaps.gaps[]` + `careGaps.barriers[]` | Unified section. Alerts by `level`; gaps → warning; barriers → info. |
| `conditions` | `conditions[]` | Each: `name`, `severity` (drives dot color). |
| `claimsOverview` | `claimsOverview[]` | Claim lines; **Denied** uses badge; others use status dot. |
| `priorAuths` | `priorAuthAppeals.priorAuths[]` | Service + auth id + status. |
| `appeals` | `priorAuthAppeals.appeals[]` | Description + appeal id + `slaDaysRemaining` (badge). |
| `memberOpenCases` | `openCases[]` | Case subject, number, status. |

### 4.2 Patient (`persona: "patient"`)

| Registry ID | Source fields | Notes |
|-------------|---------------|--------|
| `identityDemographics` | `identityDemographics` | MRN, PCP, last contact line. |
| `clinicalSnapshot` | `clinicalSnapshot[]` | Conditions with stage/onset. |
| `medications` | `medications[]` | Detail rows: dose, frequency, prescriber, optional `refillAlert` badge. |
| `encounters` | `recentActivity.encounters[]` | |
| `scheduledProcedures` | `recentActivity.scheduledProcedures[]` | |
| `pendingLabs` | `recentActivity.pendingLabs[]` | |
| `immunizations` | `recentActivity.immunizations[]` | **Overdue** → error badge; else dot. |
| `referrals` | `referrals[]` | |
| `patientCareGaps` | `careGaps[]` | Each: `description`, `urgency` (`error` \| `warning` \| …). |
| `carePrograms` | `careManagement.carePrograms[]` | Chip labels. |
| `careBarriers` | `careManagement.barriers[]` | Strings → alert-style list, level `info`. |
| `careTeam` | `careManagement.careTeam[]` | Name + role. |

### 4.3 Provider (`persona: "provider"`)

| Registry ID | Source fields | Notes |
|-------------|---------------|--------|
| `providerSnapshot` | `providerSnapshot` | NPI, specialty, panel/roster hints. |
| `credentialing` | `credentialing` | Heterogeneous object; registry flattens to rows (license, DEA, malpractice, etc.). |
| `network` | `networkParticipation[]` | Contract + panel + optional fee tier meta. |
| `providerOpenCases` | `openCases[]` | |
| `adverseActions` | `adverseActions[]` | Always show section; use `emptyMessage` when empty. |
| `roster` | `roster[]` (facility) | Bullet list with status dots; uses universal 4-item truncation. Formerly “Showing X of Y” via `providerSnapshot.rosterSize`. |

**Provider individual vs facility:**

- **Individual:** Expect `stateLicense`, `dea`, `boardCertifications`, etc.
- **Facility:** May use `facilityLicense`, `cmsCertification`, `accreditation`, `cliaCertificate` instead of personal license; roster rendered as bullet list (not chips).

---

## 5. Indicator logic (badges, dots, alert levels)

The UI maps **discrete strings** to **badge classes** (pill) or **status dots** (colored dot + label). Generators must use **controlled vocabulary** so colors stay consistent.

### 5.1 Status → badge class (`STATUS_CLASS_MAP`)

Used when the row uses a **badge** (e.g. claim Denied, appeal SLA, refill alert).

| Status / label keyword | Badge class (semantic) |
|------------------------|-------------------------|
| Denied, Overdue, Expired | Error |
| Expiring, Pending, Pending approval, Under Review, Under Investigation | Warning |
| Approved, Paid, Active, Accredited, Complete | Success |
| Open, New | Info |
| Closed | Error |
| Not Started | Neutral |

**Appeals:** SLA is rendered as a badge like `SLA: {n} days` with error styling.

### 5.2 Status → dot class (`STATUS_DOT_MAP`)

Used for non-critical rows (prior auth status, case status, network contract, etc.).

Maps the same canonical statuses to: `status-dot-error` | `status-dot-warning` | `status-dot-success` | `status-dot-info` | `status-dot-neutral`.

**Special cases in registry:**

- **Claims:** `status === "Denied"` → **badge**; all other statuses → **dot**.
- **Immunizations:** `status === "Overdue"` → **badge**; else dot.
- **Credentials:** `Expiring` or `Expired` → badge; else dot.

### 5.3 Severity (conditions, clinical)

| Severity (case-insensitive) | Dot / badge |
|-----------------------------|-------------|
| high, severe | Error |
| moderate | Warning |
| other / missing | Neutral |

### 5.4 Alert list levels (`alerts`, merged care gap items)

| `level` | Meaning in UI |
|---------|----------------|
| `error` | Highest attention (allergy, denial, critical safety). |
| `warning` | Time-sensitive or operational risk. |
| `info` | Informational (open case, barrier note). |

Patient `careGaps[].urgency` should align: `error` / `warning` (and optionally other values mapped in the client theme).

---

## 6. Insights (`insights[]`)

Each insight renders as a card with **risk category**, **confidence**, title, description, and optional **source record** strings.

**Schema (logical):**

```json
{
  "title": "Short headline",
  "riskCategory": "Clinical | Social | Operational | Compliance | Financial",
  "confidence": "High | Medium | Low",
  "description": "2–4 sentences, actionable.",
  "sourceRecords": ["Record ref 1", "Record ref 2"]
}
```

**Rules:**

- `riskCategory` must be one of the five above (UI has icons/colors per category).
- `confidence` must be exactly `High`, `Medium`, or `Low` (drives badge class).
- `sourceRecords` is optional; if present, each entry should be a **short human-readable reference** (e.g. claim number, case id), not prose.
- **Recommended count:** 3–5 insights per summary; prioritize **time-bound** and **financial/clinical risk** items.

---

## 7. Suggested actions (`suggestedActions[]`)

**Schema:**

```json
{
  "id": "stable-string-id",
  "title": "Verb-led title",
  "actionType": "schedule | escalate | review | outreach | update",
  "priority": "High | Medium | Low",
  "description": "What to do and when to escalate.",
  "status": "pending | accepted | modified | dismissed"
}
```

**Rules:**

- `actionType` must match the supported set (maps to icons/labels in the UI).
- `priority` maps to priority badges.
- Default new actions as `pending`.
- **Recommended count:** 3–5 actions; should align with top insights (each action traceable to an insight or alert).

---

## 8. Source rules (attribution)

### 8.1 Section-level sources (registry)

Each section definition may declare `sources[]` for the **Sources** control in the section header. Entries are **catalog metadata**, not patient data:

```json
{
  "id": "stable-id",
  "name": "Health Cloud",
  "type": "CRM | External | Zero-Copy",
  "iconName": "utility:salesforce1",
  "recordUrl": "https://..."
}
```

**Rules:**

- Generators that **cannot** bind real URLs should still emit **consistent `id` + `name` + `type`** per system of record; `recordUrl` may be a placeholder in prototype.
- **Do not** invent clinical facts to match a source; sources label **provenance** for the section, not inline citations.

### 8.2 Insight source strings

`sourceRecords` on insights should reference **real identifiers** when available from RAG or structured fetch (e.g. `Claim #CLM-…`, `Case #CS-…`).

### 8.3 Inline citations (future / extended)

If the product adds **per-fact** citations, each bullet row should accept optional fields such as `citationLabel`, `citationSourceName`, `citationSourceType`, `citationSourceIcon` aligned with the citation popover component. Until wired end-to-end, **section-level sources + insight `sourceRecords`** are the contract.

---

## 9. Item limits and truncation

The prototype registry does **not** hard-cap array lengths; **generation policy** should enforce limits for latency, readability, and safety:

| Area | Recommended max | Truncation strategy |
|------|-------------------|---------------------|
| `microSummary` | ~600 characters or 5 sentences | Drop lowest-priority clause first. |
| `alerts` | 8 | Severity order: error → warning → info; drop oldest info. |
| `claimsOverview` | 6 | Most recent + any Denied/Pending first. |
| `conditions` / `clinicalSnapshot` | 10 | Active problems first; chronic stable last. |
| `medications` | 12 | Active meds; flag interactions in alerts instead of duplicating. |
| `encounters` | 5 | Most recent. |
| `insights` | 5 | Highest severity/risk first. |
| `suggestedActions` | 5 | Match top risks; dedupe titles. |
| `careGaps` (patient) | 6 | `error` before `warning`. |
| Provider `networkParticipation` | 8 | Active contracts first. |
| `roster` (bullet list) | No generation cap | Use `summary` pattern “Showing 20 of {rosterSize}” when truncating. |

**Client-side truncation:** All `bullet-list` and `alert-list` sections display max **4 items** by default with a "+ N more" expand button. This resets when the section accordion is collapsed.

**Collapsible UI:** The shell may collapse non-critical sections when `isCollapsed`; generation should still prefer **dense, ordered** lists over long prose inside section fields.

---

## 10. Consistency and validation checklist

Before returning JSON to the client:

1. **`persona`** matches the selected summary type; provider sets **`providerSubType`**.
2. **Required strings** are non-empty: `microSummary`, `generatedAt`.
3. **Enums** are exact matches: insight `riskCategory`, `confidence`; action `actionType`, `priority`, `status`.
4. **Status fields** on claims, cases, credentials use vocabulary from §5 (or map upstream values into it).
5. **No duplicate** `suggestedActions.id` values within a payload.
6. **PHI minimization in titles:** Prefer roles and initials where policy requires; follow org redaction rules (not encoded here).

---

## 11. Reference: controlled status vocabulary (generation)

Prefer normalizing upstream statuses to these **canonical** labels for dot/badge mapping:

**Claims / financial:** Denied, Paid, Pending  
**Appeals / tasks:** Under Review, Open, Closed, Not Started  
**Authorizations:** Approved, Pending, Pending approval  
**Credentials / insurance:** Active, Expiring, Expired, Accredited  
**Immunizations:** Current, Overdue, Due Soon  
**Network:** Active (contract), Open / Closed (panel)

---

## 12. File references (implementation)

| Concern | Location |
|---------|----------|
| Mock payloads & enums | `prototype/src/modules/data/ahis/ahis.js` |
| Section order, sources, mapping | `prototype/src/modules/data/ahisSectionRegistry/ahisSectionRegistry.js` |
| Insight risk/confidence | `prototype/src/modules/ui/ahisInsights/ahisInsights.js` |
| Action types / priorities | `prototype/src/modules/ui/ahisActions/ahisActions.js` |
| Section rendering | `prototype/src/modules/ui/ahisSummary/ahisSummary.html` |

---

*Document version: 1.0 — aligned with prototype data contracts as of repository snapshot.*
