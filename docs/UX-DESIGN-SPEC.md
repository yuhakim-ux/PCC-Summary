# PCC Summary — UX & UI Design Specification

**Document type:** UX/UI design spec for engineering implementation  
**Feature:** Agentforce Health Intelligence Surface (AHIS) — Custom LWC  
**Release:** 264 — PCC Provider Agents  
**Prepared by:** Yuha Kim, UX Designer — Salesforce Industries (Health Cloud)  
**Figma references:**  
- [Agentic Summary Custom LWC](https://www.figma.com/design/4p5hFM6CgwXzaoUskfTz1V/262.8---Agentic-Summary-Custom-LWC)  
- [SLDS 2 Agentic Experiences](https://www.figma.com/design/ggbYUUT1b480AGhqAJGQUV/%F0%9F%86%95-SLDS-2---Agentic-Experiences?node-id=88677-54146)  

---

## 1. Design Goals

In 15 seconds, an agent should understand **who the patient is, why they might be calling, what care is active, and what financial or coverage constraints exist** — without navigating 10 tabs or 5 systems.

The AHIS panel is not a chart viewer or a clinical decision tool. It is an operational orientation surface. Every design decision — section order, alert prominence, section collapse behavior, action wording — is made in service of speed and accuracy at the start of a call.

---

## 2. Persona System

### Why persona-based, not role-based

Persona is determined by **Permission Set**, not by profile name. Profile names differ per org; permission sets are portable.

| Permission Set | Summary Shown | Primary User |
|---|---|---|
| `View_Payer_Summary` | Member Summary | Payer call center rep — plan, claims, financial, appeals |
| `View_Provider_Summary` | Patient Summary | Provider call center rep — clinical, meds, referrals |
| `View_Care_Summary` | Care Summary | Care manager — care plan, barriers, care team |

**Payvider edge case:** A single CSR may have both `View_Payer_Summary` and `View_Provider_Summary`. In this case, the UI should offer a picker (the persona FAB pattern in the prototype). The agent selects the context that matches the current call type.

### Provider sub-types

Both Provider Individual and Provider Facility map to the `provider` runtime persona. The distinction is purely in the **data shape** — not separate permission sets or separate UI templates.

| Sub-type | Expected data fields |
|---|---|
| Individual | `stateLicense`, `dea`, `boardCertifications`, `malpractice`, personal network contracts |
| Facility | `facilityLicense`, `cmsCertification`, `accreditation`, `cliaCertificate`, `roster[]` chips |

---

## 3. Page Layout

The AHIS surface occupies a **custom LWC tab or component** on the Member/Patient/Provider 360 record page. It does **not** replace the standard record detail — it supplements it.

### Layout regions (top to bottom)

1. **Record header** — Standard Salesforce record header (name, account number, follow button, edit). Not part of the custom LWC.
2. **AHIS card** — Custom LWC. Contains all elements below.
3. **Identity grid** — Always visible. First thing an agent reads. Non-collapsible.
4. **Micro-summary blurb** — AI-generated plain-language paragraph. Always visible. Non-collapsible.
5. **AI label + timestamp** — Small inline label ("AI · Today at 2:34 PM"). Always visible once generated.
6. **Alerts section** — Always visible. Cannot be collapsed. Highest urgency items.
7. **Collapsed sections** — Hidden behind "Show more (N)" until expanded. See §5.
8. **Insights tab** — Always accessible. Parallel tab to summary sections.
9. **Actions tab** — Always accessible. Parallel tab to insights.
10. **Action bar** — Currently hidden. See Prototype Handoff §7.

---

## 4. Identity Grid

The identity grid is the first thing an agent sees. It must load fast and be scannable in under 3 seconds.

### Member identity fields

| Field | Source |
|---|---|
| Member ID | `identityPlan.memberId` |
| Name, DOB, Gender, Language | `identityPlan.name`, `.dob`, `.gender`, `.language` |
| Plan name + status | `identityPlan.planName`, `.planStatus` |
| Effective dates | `identityPlan.effectiveDates` |
| PCP | `identityPlan.pcp` |
| Group number | `identityPlan.groupNumber` |
| Last interaction | `identityPlan.lastInteraction.daysAgo` + `.reason` |

### Patient identity fields

| Field | Source |
|---|---|
| MRN | `identityDemographics.mrn` |
| Name, Age, Gender, Language | `identityDemographics.name`, `.age`, `.gender`, `.language` |
| PCP | `identityDemographics.pcp` |
| Care coordinator | `identityDemographics.careCoordinator` |
| Risk level | `identityDemographics.riskLevel` |
| Last contact | `identityDemographics.lastContact.daysAgo`, `.channel`, `.topic` |

### Provider identity fields

| Field | Source |
|---|---|
| NPI | `providerSnapshot.npi` |
| Specialty | `providerSnapshot.specialty` |
| Facility / group | `providerSnapshot.facility` or `.group` |
| Network status | `providerSnapshot.networkStatus` |

---

## 5. Section Collapse Behavior

### Design rationale

Not every section is relevant on every call. The collapse pattern keeps the most critical information above the fold while making the full picture available within one click.

### Always visible (never collapses)

| Section ID | Persona | Reason |
|---|---|---|
| `alerts` | All | Safety-critical items; agents must see these immediately |
| `patientCareGaps` | Patient | Overdue care gaps often drive the call |
| `adverseActions` | Provider | Compliance risk; always requires an explicit "none" confirmation |

### Collapsed by default (revealed by "Show more")

All other sections. The toggle label reads **"Show more (N)"** where N = the number of hidden sections for the current persona.

### Always-empty section rule

The **Adverse Actions** section (provider persona only) must always render — even when the array is empty. Use the `bullet-list-or-empty` primitive. The empty message reads: *"No adverse actions on record."* This is a deliberate compliance design decision: absence of adverse actions must be explicitly confirmed, not inferred from a missing section.

---

## 6. Indicator System (Badges and Dots)

The prototype implements a two-track indicator system. Engineering must not deviate from this mapping — it is the visual language agents use to triage at a glance.

### When to use a badge (pill) vs. a dot

| Indicator | Use when | Visual weight |
|---|---|---|
| **Badge (pill)** | Status is actionable, time-sensitive, or carries high urgency (e.g., Denied, Overdue, SLA expiry) | High — draws the eye |
| **Status dot** | Status is informational or routine (e.g., Approved, Paid, Scheduled) | Low — confirms state without alarming |

### Special rules by section

| Section | Rule |
|---|---|
| Claims | `Denied` → badge. All other statuses → dot. |
| Immunizations | `Overdue` → badge. All other statuses → dot. |
| Credentials | `Expiring` or `Expired` → badge. All other statuses → dot. |
| Appeals | SLA always renders as badge: "SLA: N days" with error styling. |

### Badge class vocabulary

| Status / trigger | Badge class |
|---|---|
| Denied, Overdue, Expired, Closed | `badge-error` (red) |
| Expiring, Pending, Pending approval, Under Review, Under Investigation | `badge-warning` (yellow/orange) |
| Approved, Paid, Active, Accredited, Complete | `badge-success` (green) |
| Open, New | `badge-info` (blue) |
| Not Started | `badge-neutral` (gray) |

### Severity dot vocabulary (conditions, clinical)

| Severity value | Dot class |
|---|---|
| `high`, `severe` | `status-dot-error` |
| `moderate` | `status-dot-warning` |
| anything else / missing | `status-dot-neutral` |

### Alert list level vocabulary

| `level` value | Meaning |
|---|---|
| `error` | Highest urgency — allergy, denial, critical safety flag |
| `warning` | Time-sensitive or operational risk |
| `info` | Informational — open case, barrier note |

**Do not invent new level values.** Map all upstream statuses into this three-level vocabulary before sending to the client.

---

## 7. Micro-Summary (AI Blurb)

The micro-summary is a plain-language paragraph that appears immediately below the identity grid. It is the only free-text field in the payload — all other content is structured.

### Design requirements

- **Length:** 350–600 characters or 3–5 sentences. Do not exceed.
- **No bullet characters inside this string.** The sections below carry structure.
- **Content order:** Lead with plan/clinical stability → top risks (SLA deadlines, denials, allergies, credential expiry) → care gaps.
- **Tone:** Operational, not clinical. Written for a call center agent, not a clinician.
- **Example (member):** "Active Medicare Advantage member. 1 denied knee claim under appeal — SLA in 3 days. Insulin PA pending clinical review. Severe Penicillin allergy on file."

---

## 8. Insights Panel

### Risk category icons and colors

| Category | Icon | Card accent |
|---|---|---|
| Clinical | `utility:heart` | `risk-card-clinical` |
| Social | `utility:people` | `risk-card-social` |
| Operational | `utility:settings` | `risk-card-operational` |
| Compliance | `utility:shield` | `risk-card-compliance` |
| Financial | `utility:moneybag` | `risk-card-financial` |

These five categories are the **only valid values** for `riskCategory`. Do not add new categories without a design review.

### Confidence badge classes

| Value | Class |
|---|---|
| `High` | `confidence-high` |
| `Medium` | `confidence-medium` |
| `Low` | `confidence-low` |

### Drill-down behavior

Each insight card has a "View Records" link. Clicking it fires a `drilldown` custom event with `{ riskCategory, insightTitle }`. The receiving modal (`AhisDrillDown`) should query Salesforce for records matching the `sourceRecords[]` identifiers on that insight.

**In the prototype:** Modal opens with placeholder content.  
**In production:** Modal should show actual related records (cases, claims, prior auths, etc.) filtered by the insight's `sourceRecords[]` values.

### Recommended count

3–5 insights per summary. Prioritize time-bound and financial/clinical risk items. Do not surface more than 5.

---

## 9. Actions Panel

### Action type icons

| `actionType` | Icon | Label |
|---|---|---|
| `schedule` | `utility:event` | Schedule |
| `escalate` | `utility:priority` | Escalate |
| `review` | `utility:preview` | Review |
| `outreach` | `utility:call` | Outreach |
| `update` | `utility:edit` | Update |

These are the **only valid action type values**.

### Priority badge classes

| `priority` | Badge class |
|---|---|
| `High` | `priority-high` |
| `Medium` | `priority-medium` |
| `Low` | `priority-low` |

### Action status states

| `status` | UI behavior |
|---|---|
| `pending` | Default. Shows Accept and Dismiss buttons. |
| `accepted` | Card label appended with "(Accepted)". Buttons hidden. |
| `modified` | Card label appended with "(Modified)". Notes saved. |
| `dismissed` | Card label appended with "(Dismissed)". Card de-emphasized. |

### Notes modal

Triggered by overflow menu → "Edit". A small modal (`AhisNotesModal`) collects free-text notes and sets the action to `modified` on confirm.

### Recommended count

3–5 actions per summary. Each action should trace to at least one insight or alert. Do not create actions that don't map to a visible risk in the summary.

---

## 10. Content Limits

These limits are a **generation policy**, not a hard client cap. The prototype does not enforce them. The backend/prompt layer must.

| Content area | Maximum | Truncation strategy |
|---|---|---|
| Micro-summary | ~600 characters or 5 sentences | Drop lowest-priority clause first |
| Alerts | 8 | Severity order: error → warning → info; drop oldest info |
| Claims | 6 | Most recent + any Denied/Pending first |
| Conditions / Clinical Snapshot | 10 | Active problems first; chronic stable last |
| Medications | 12 | Active meds only |
| Encounters | 5 | Most recent |
| Insights | 5 | Highest severity/risk first |
| Suggested Actions | 5 | Match top risks; dedupe titles |
| Care Gaps (patient) | 6 | `error` before `warning` |
| Network Participation (provider) | 8 | Active contracts first |
| Roster chips (facility) | 20 visible | Show "Showing 20 of N" when truncating |

---

## 11. Empty States

| Scenario | UI behavior |
|---|---|
| Pre-generation (no summary yet) | Show "Generate Summary" button. No sections visible. |
| Loading | Show spinner inside the summary card. |
| API error | Show inline error state with retry option. |
| Section with empty data | Omit the section entirely — do not show an empty accordion. **Exception:** Adverse Actions always shows with empty message. |
| No insights | Insights tab shows "No insights available" placeholder. |
| No actions | Actions tab shows "No actions available" placeholder. |

---

## 12. Accessibility Notes

- All badge and dot indicators must include accessible text (not color alone). The prototype uses visible text labels alongside color.
- The persona picker FAB must be keyboard navigable and include `aria-expanded` state.
- Accordion sections (Show more / Show less) must use `aria-expanded` on the toggle control.
- Insight drill-down modal must trap focus and return focus to the triggering element on close.
- Do not rely on emoji characters in annotation pills or Einstein insight banners — use SLDS icons instead.

---

## 13. Design Decisions Log

| Decision | Rationale |
|---|---|
| No emoji in annotation pills or Einstein banners | Inconsistent rendering across platforms; SLDS icons provide accessible, consistent alternatives |
| Adverse Actions always shows even when empty | Compliance requirement — agents must explicitly confirm absence, not infer it |
| Alerts section never collapses | Safety-critical; a collapsed allergy alert that an agent misses is a patient safety risk |
| Persona by Permission Set, not profile | Profile names differ per org; permission sets are portable and admin-configurable |
| Status → badge vs. dot distinction | Badges are reserved for actionable/urgent states to preserve their signal value; overusing badges = agents ignore them |
| Micro-summary capped at 600 chars | Agents have 5–10 seconds before a patient starts talking; a wall of text defeats the purpose |
| Parallel insights + actions tabs | Separating structured data (sections) from AI interpretation (insights) and AI recommendations (actions) prevents cognitive overload |
