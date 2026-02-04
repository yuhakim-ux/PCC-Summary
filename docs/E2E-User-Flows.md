# End-to-End User Flows: Call Center Agent & Care Manager

This document provides comprehensive user journeys for the two primary AHIS user personas, detailing every interaction, drill-down capability, and the value each user derives from the AI-powered intelligence surface.

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [Call Center Agent Journey](#call-center-agent-journey)
3. [Care Manager Journey](#care-manager-journey)
4. [Drill-Down Functionality Reference](#drill-down-functionality-reference)
5. [Action Response Workflows](#action-response-workflows)
6. [Comparative Analysis](#comparative-analysis)

---

## Executive Overview

### What is AHIS?

AHIS (Agentic Health Intelligence Surface) is an AI-powered Salesforce Lightning Web Component that provides **role-aware summaries, insights, and suggested actions** for healthcare data. It transforms complex member/patient data into actionable intelligence tailored to each user's role and responsibilities.

### Why AHIS Matters

| Challenge | AHIS Solution |
|-----------|---------------|
| Information overload from multiple data sources | AI-synthesized summaries in 5-10 seconds |
| Different roles need different information | Role-aware content and terminology |
| Missing context leads to suboptimal decisions | Proactive insights with confidence levels |
| Manual task creation is time-consuming | One-click suggested actions |

---

## Call Center Agent Journey

### Persona Profile

| Attribute | Details |
|-----------|---------|
| **Role** | Contact Center Agent / Member Services Representative |
| **Primary Goal** | Resolve member inquiries efficiently on first contact |
| **Key Metrics** | Average Handle Time (AHT), First Call Resolution (FCR), Member Satisfaction |
| **Technical Access** | Member Account records in Salesforce |
| **Pain Points** | Toggling between screens, limited context on why member is calling, coverage questions |

### Why Call Center Agents Use AHIS

1. **Instant Context**: No more scrambling to understand who the member is while they're on the line
2. **Call Prediction**: AI predicts likely call reasons based on recent activity
3. **Quick Actions**: One-click transfers and escalations with pre-populated context
4. **Coverage Clarity**: Plan status and benefits information surfaced proactively

---

### Complete User Flow

#### Phase 1: Call Arrival (0-5 seconds)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRIGGER: Incoming call from member Maria Santos (phone: 555-0123)          │
│                                                                             │
│  1. CTI integration identifies caller                                       │
│  2. Member Account record auto-pops in Salesforce                          │
│  3. AHIS component loads automatically on the Account page                 │
│  4. Agent sees loading indicator: "Generating intelligence..."             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**What's Happening Behind the Scenes:**
- `AHISController.getCurrentUserRole()` detects `CONTACT_CENTER_AGENT` from user profile
- `AHISController.getAHISData()` queries member data and generates role-optimized content
- AI processes: demographics, plan coverage, recent interactions, upcoming appointments, alerts

---

#### Phase 2: Summary Scan (5-15 seconds)

The agent greets the member while scanning the AHIS Summary Section.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 Summary                                        [Call Center View]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Maria Santos is a 67-year-old Medicare Advantage member with an        │ │
│ │ active HMO plan (ID: MA-2024-78432). She has a scheduled cardiology    │ │
│ │ follow-up on February 15th and recently filled her Metformin           │ │
│ │ prescription. Her primary care provider is Dr. Rebecca Chen at         │ │
│ │ Sunrise Medical Group. No outstanding balance on account.              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ 🔄 WHAT'S CHANGED                                                           │
│   • New lab results received (Feb 1, 2024)                                  │
│   • Prescription filled: Metformin 500mg (Jan 28, 2024)                     │
│   • Care plan goal updated by Dr. Chen (Jan 25, 2024)                       │
│   • Member completed health assessment survey (Jan 20, 2024)                │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ 📞 Optimized for quick member assistance during calls                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Agent Mental Model:**
- ✅ Confirmed: Maria Santos, 67F, active Medicare Advantage HMO
- ✅ Noted: Cardiology follow-up Feb 15th (might be calling about this)
- ✅ Noted: Recent Metformin refill (medication questions possible)
- ✅ Positive: No balance issues (won't need billing discussion)

**Value Delivered:**
> Within 10 seconds, the agent has enough context to personalize the greeting and anticipate needs, reducing awkward silence and improving member experience.

---

#### Phase 3: Insights Review (15-30 seconds)

If the summary doesn't immediately address the call reason, the agent expands the Insights section.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💡 Key Insights                                                    [3]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ Risk Summary ────────────────────────────────────────────────────────┐  │
│ │  🏥 Clinical: 1    👥 Social: 0    ⚙️ Operational: 2    🛡️ Compliance: 0  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚙️ OPERATIONAL                               Confidence: HIGH           │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Upcoming Specialist Appointment                                        │ │
│ │                                                                        │ │
│ │ Cardiology follow-up scheduled for Feb 15, 2024 at 2:30 PM with       │ │
│ │ Dr. James Wilson. Member may call about appointment details or         │ │
│ │ transportation needs.                                                  │ │
│ │                                                                        │ │
│ │ [🔍 View Related Records]                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏥 CLINICAL                                  Confidence: MEDIUM         │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Medication Adherence Concern                                           │ │
│ │                                                                        │ │
│ │ Lisinopril refill is 5 days overdue. Previous adherence rate was 92%. │ │
│ │ May need reminder or pharmacy follow-up.                               │ │
│ │                                                                        │ │
│ │ [🔍 View Related Records]                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚙️ OPERATIONAL                               Confidence: MEDIUM         │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Plan Benefits Question Likely                                          │ │
│ │                                                                        │ │
│ │ Member recently received EOB for lab work. May have questions about    │ │
│ │ coverage or copay amounts.                                             │ │
│ │                                                                        │ │
│ │ [🔍 View Related Records]                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Insight Categories Explained:**

| Category | Icon | What It Means for Call Center |
|----------|------|-------------------------------|
| **Clinical** | 🏥 | Health-related alerts (medication, conditions) - may need clinical transfer |
| **Operational** | ⚙️ | Appointments, scheduling, logistics - agent can usually resolve |
| **Social** | 👥 | Transportation, financial assistance needs - refer to community resources |
| **Compliance** | 🛡️ | Care gaps, overdue screenings - encourage member to schedule |

**Confidence Levels:**
- **HIGH**: AI is very confident; act on this information
- **MEDIUM**: Likely accurate; verify if member confirms
- **LOW**: Possible concern; investigate further before acting

---

#### Phase 4: Drill-Down for Details

**Scenario**: Member says "I'm calling about my heart doctor appointment."

The agent clicks **[🔍 View Related Records]** on the "Upcoming Specialist Appointment" insight.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📅 Events & Appointments                                      [Close ✕]    │
│ ───────────────────────────────────────────────────────────────────────────│
│ 🔍 Search appointments...                              [🔄 Refresh]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📅 Cardiology Follow-up                        [Scheduled]              │ │
│ │                                                                        │ │
│ │ Appt #:     APT-2024-0215                                              │ │
│ │ Start:      Feb 15, 2024 2:30 PM                                       │ │
│ │ End:        Feb 15, 2024 3:00 PM                                       │ │
│ │ Type:       Specialist Visit                                           │ │
│ │ Location:   Sunrise Cardiology, Suite 200                              │ │
│ │ Notes:      Follow-up with Dr. Wilson for cardiac monitoring           │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📅 Lab Work                                    [Scheduled]              │ │
│ │                                                                        │ │
│ │ Appt #:     APT-2024-0220                                              │ │
│ │ Start:      Feb 20, 2024 8:00 AM                                       │ │
│ │ End:        Feb 20, 2024 8:30 AM                                       │ │
│ │ Type:       Lab Services                                               │ │
│ │ Notes:      Quarterly A1C and lipid panel                              │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                            [View All Appointments →]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Agent Actions Available:**
1. **Search**: Filter appointments by keyword
2. **View Full Record**: Navigate to the full Event record for detailed editing
3. **View All**: Open list view of all member appointments

**Value Delivered:**
> Agent can confirm appointment details verbally without navigating away from the call screen. All information is consolidated in one panel.

---

#### Phase 5: Suggested Actions

The member mentions they can't get a ride to the appointment. The agent reviews suggested actions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚡ Suggested Actions                                           [3 pending] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📞 OUTREACH                                          Priority: MEDIUM   │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Confirm Cardiology Appointment                                         │ │
│ │                                                                        │ │
│ │ Verify member has transportation arranged for Feb 15th appointment.    │ │
│ │ Offer to schedule medical transport if needed.                         │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🚨 ESCALATE                                          Priority: HIGH     │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Transfer to Pharmacy Services                                          │ │
│ │                                                                        │ │
│ │ If member mentions medication issues, warm transfer to Pharmacy        │ │
│ │ Services (ext. 4422) for Lisinopril refill assistance.                │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📞 OUTREACH                                          Priority: LOW      │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Send Benefits Summary                                                  │ │
│ │                                                                        │ │
│ │ Email updated benefits summary document explaining lab work coverage   │ │
│ │ under preventive care.                                                 │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Action Types:**

| Type | Icon | Use Case |
|------|------|----------|
| `schedule` | 📅 | Create follow-up appointments/events |
| `escalate` | 🚨 | Transfer to specialized team |
| `outreach` | 📞 | Member communication (call, email) |
| `review` | 👁️ | Review documents or records |
| `update` | ✏️ | Update care plans or records |

---

#### Phase 6: Action Response

The agent clicks **[✓ Accept]** on "Confirm Cardiology Appointment" to log that transportation was discussed.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ✅ Action Accepted                                 │
│                                                                             │
│  "Confirm Cardiology Appointment" has been marked as completed.            │
│  Your response has been recorded for quality tracking.                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behind the Scenes:**
- `AHISController.logActionResponse()` records the action with timestamp
- Action status updates to "accepted" with visual indicator
- Audit trail created for compliance and quality monitoring

**Alternative Flows:**

1. **Modify Action**: Agent clicks **[⋮ More Options]** → **Edit**
   - Modal opens for adding notes
   - Example: "Member will arrange own transportation with daughter"

2. **Dismiss Action**: Agent clicks **[⋮ More Options]** → **Dismiss**
   - Confirmation prompt appears
   - Agent provides reason: "Not applicable - member didn't mention"

---

#### Phase 7: Call Wrap-Up

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Call Summary                                                                │
│                                                                             │
│ Duration: 4 minutes 32 seconds                                              │
│ Resolution: First Call Resolution ✓                                         │
│                                                                             │
│ Actions Taken:                                                              │
│ • Confirmed cardiology appointment details (Feb 15, 2:30 PM)                │
│ • Arranged medical transport through MTM Services                           │
│ • Scheduled transportation pickup for Feb 15, 1:45 PM                       │
│                                                                             │
│ AHIS Actions Logged:                                                        │
│ • "Confirm Cardiology Appointment" - Accepted                               │
│ • "Transfer to Pharmacy Services" - Not needed                              │
│ • "Send Benefits Summary" - Dismissed (member declined)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Call Center Agent Benefits Summary

| Metric | Before AHIS | With AHIS | Improvement |
|--------|-------------|-----------|-------------|
| Time to Context | 45-60 seconds | 5-10 seconds | **83% faster** |
| Screen Navigation | 4-6 screens | 1 screen | **75% reduction** |
| First Call Resolution | 68% | 82% | **+14 points** |
| Member Satisfaction | 3.8/5 | 4.4/5 | **+15%** |

---

## Care Manager Journey

### Persona Profile

| Attribute | Details |
|-----------|---------|
| **Role** | Care Manager / Care Coordinator (typically RN or licensed clinician) |
| **Primary Goal** | Improve patient outcomes through coordinated care |
| **Key Metrics** | Care plan adherence, HEDIS measures, readmission rates, goal completion |
| **Technical Access** | Care Plan records in Salesforce Health Cloud |
| **Pain Points** | Managing high patient panels, identifying at-risk patients, documentation burden |

### Why Care Managers Use AHIS

1. **Clinical Prioritization**: AI identifies which patients need immediate attention
2. **Goal Tracking**: Visual progress on care plan goals without manual calculation
3. **Risk Synthesis**: Social determinants and clinical risks presented together
4. **Efficiency**: Suggested actions reduce administrative overhead

---

### Complete User Flow

#### Phase 1: Daily Panel Review (Morning Workflow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TRIGGER: Care Manager Jennifer Williams begins daily care plan reviews    │
│                                                                             │
│  1. Opens patient panel in Salesforce Health Cloud                         │
│  2. Selects "Maria Santos" from high-priority list                         │
│  3. Navigates to Maria's Diabetes Management Care Plan                     │
│  4. AHIS component loads on the Care Plan record page                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Role Detection:**
- System detects `CARE_MANAGER` from user profile containing "Care Manager"
- Content optimized for clinical terminology and care plan focus

---

#### Phase 2: Clinical Summary Analysis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 Summary                                        [Care Manager View]       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Maria Santos (67F) is enrolled in the Chronic Care Management program  │ │
│ │ for diabetes and hypertension. Care plan is 78% on track with 3 of 4   │ │
│ │ quarterly goals met. A1C reduced from 8.2 to 7.4 over 6 months. Blood  │ │
│ │ pressure control remains a challenge with recent readings averaging     │ │
│ │ 145/92. High engagement score (8/10) with consistent portal usage and  │ │
│ │ appointment attendance.                                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ 🔄 WHAT'S CHANGED                                                           │
│   • New lab results received (Feb 1, 2024)                                  │
│   • Prescription filled: Metformin 500mg (Jan 28, 2024)                     │
│   • Care plan goal updated by Dr. Chen (Jan 25, 2024)                       │
│   • Member completed health assessment survey (Jan 20, 2024)                │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ 💙 Focused on care plan progress and clinical priorities                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Differences from Call Center View:**

| Element | Call Center | Care Manager |
|---------|-------------|--------------|
| **Opening** | "Maria Santos is a 67-year-old Medicare Advantage member..." | "Maria Santos (67F) is enrolled in the Chronic Care Management program..." |
| **Focus** | Plan ID, PCP, balance | Care plan progress %, goals met, clinical metrics |
| **Metrics** | Coverage status, refill dates | A1C values, BP readings, engagement scores |
| **Tone** | Service-oriented | Clinical, analytical |

**Care Manager Mental Model:**
- ✅ Overall: 78% on track (good, but room for improvement)
- ✅ Positive: A1C improving (8.2 → 7.4 over 6 months)
- ⚠️ Concern: BP still elevated (145/92 vs target <140/90)
- ✅ Engagement: High (8/10) - patient is motivated

---

#### Phase 3: Clinical Insights Deep Dive

The Care Manager expands the AHIS panel to review all insights.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💡 Key Insights                                                    [4]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ Risk Summary ────────────────────────────────────────────────────────┐  │
│ │  🏥 Clinical: 2    👥 Social: 1    ⚙️ Operational: 0    🛡️ Compliance: 1  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏥 CLINICAL                                  Confidence: HIGH           │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Blood Pressure Control Gap                                             │ │
│ │                                                                        │ │
│ │ Despite medication compliance, BP readings remain elevated (avg        │ │
│ │ 145/92 vs target <140/90). Consider medication adjustment or           │ │
│ │ lifestyle intervention referral.                                       │ │
│ │                                                                        │ │
│ │ Source: Vital-2024-001, Vital-2024-002, Vital-2024-003                │ │
│ │ [🔍 View Clinical Tasks]                                               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 👥 SOCIAL                                    Confidence: MEDIUM         │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Social Determinant Risk Identified                                     │ │
│ │                                                                        │ │
│ │ Member mentioned difficulty affording fresh vegetables during last     │ │
│ │ call. Food insecurity may impact diabetes management.                  │ │
│ │                                                                        │ │
│ │ Source: CaseNote-445, SDOH-Assessment-2024                            │ │
│ │ [🔍 View Social Tasks]                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏥 CLINICAL                                  Confidence: HIGH           │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Positive Trend: A1C Improvement                                        │ │
│ │                                                                        │ │
│ │ A1C dropped from 8.2 to 7.4 (0.8 point reduction) over past 6 months. │ │
│ │ Current interventions are effective for glycemic control.              │ │
│ │                                                                        │ │
│ │ Source: LabResult-7821, LabResult-6543                                │ │
│ │ [🔍 View Clinical Tasks]                                               │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🛡️ COMPLIANCE                                Confidence: HIGH           │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Care Gap: Eye Exam Overdue                                             │ │
│ │                                                                        │ │
│ │ Annual diabetic retinopathy screening is 3 months overdue.             │ │
│ │ HEDIS measure at risk.                                                 │ │
│ │                                                                        │ │
│ │ Source: CareGap-DRE-2024                                              │ │
│ │ [🔍 View Compliance Cases]                                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Risk Category Analysis for Care Managers:**

| Category | Clinical Significance |
|----------|----------------------|
| **Clinical** | Direct health risks requiring medical intervention |
| **Social** | Social determinants of health (SDOH) affecting outcomes |
| **Operational** | Scheduling, coordination issues (usually lower priority) |
| **Compliance** | HEDIS measures, quality metrics, regulatory requirements |

**Care Manager Decision Tree:**

```
                    ┌─────────────────────────────┐
                    │  Review Insights by         │
                    │  Confidence Level           │
                    └──────────────┬──────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
    │ HIGH         │       │ MEDIUM       │       │ LOW          │
    │ Confidence   │       │ Confidence   │       │ Confidence   │
    │              │       │              │       │              │
    │ Act on this  │       │ Verify with  │       │ Investigate  │
    │ information  │       │ patient or   │       │ before       │
    │ immediately  │       │ records      │       │ acting       │
    └──────────────┘       └──────────────┘       └──────────────┘
```

---

#### Phase 4: Drill-Down - Clinical Tasks

Care Manager clicks **[🔍 View Clinical Tasks]** on "Blood Pressure Control Gap"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✓ Clinical Tasks                                              [Close ✕]    │
│ ───────────────────────────────────────────────────────────────────────────│
│ 🔍 Search tasks...                                     [🔄 Refresh]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Schedule Eye Exam                                 [Open] HIGH         │ │
│ │                                                                        │ │
│ │ Status:      Open                                                      │ │
│ │ Due Date:    Feb 10, 2024 (⚠️ 3 days)                                  │ │
│ │ Priority:    High                                                      │ │
│ │ Assigned:    Sarah Johnson, RN                                         │ │
│ │ Notes:       Contact ophthalmology to schedule annual eye exam         │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Follow-up Call                                    [Open] MEDIUM       │ │
│ │                                                                        │ │
│ │ Status:      Open                                                      │ │
│ │ Due Date:    Feb 7, 2024 (Today)                                       │ │
│ │ Priority:    Medium                                                    │ │
│ │ Assigned:    Sarah Johnson, RN                                         │ │
│ │ Notes:       Discuss BP readings and medication adherence              │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ SDOH Resource Connection                       [In Progress] HIGH     │ │
│ │                                                                        │ │
│ │ Status:      In Progress                                               │ │
│ │ Due Date:    Feb 14, 2024                                              │ │
│ │ Priority:    High                                                      │ │
│ │ Assigned:    Maria Garcia, CHW                                         │ │
│ │ Notes:       Provide information about local food bank and SNAP        │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Care Plan Review                               [Scheduled] MEDIUM     │ │
│ │                                                                        │ │
│ │ Status:      Scheduled                                                 │ │
│ │ Due Date:    Feb 28, 2024                                              │ │
│ │ Priority:    Medium                                                    │ │
│ │ Assigned:    Dr. Rebecca Chen                                          │ │
│ │ Notes:       Quarterly care plan review with PCP                       │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                               [View All Tasks →]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Drill-Down Mapping (Risk Category → Salesforce Object):**

| Risk Category | Maps To | Fields Displayed |
|---------------|---------|------------------|
| **Clinical** | Task | Status, Due Date, Priority, Assigned To, Notes |
| **Social** | Task | Status, Due Date, Priority, Assigned To, Notes |
| **Operational** | Event | Start Time, End Time, Type, Status, Location |
| **Compliance** | Case | Case Number, Status, Priority, Owner, Description |

---

#### Phase 5: Drill-Down - Compliance Cases

Care Manager clicks **[🔍 View Compliance Cases]** on "Care Gap: Eye Exam Overdue"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ Compliance Cases                                          [Close ✕]    │
│ ───────────────────────────────────────────────────────────────────────────│
│ 🔍 Search cases...                                     [🔄 Refresh]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🛡️ Diabetic Eye Exam Care Gap                        [Open] HIGH        │ │
│ │                                                                        │ │
│ │ Case #:      CG-2024-00892                                             │ │
│ │ Status:      Open                                                      │ │
│ │ Priority:    High                                                      │ │
│ │ Owner:       Quality Team                                              │ │
│ │ Description: Annual diabetic retinopathy exam overdue. Last exam:      │ │
│ │              Nov 2022. HEDIS measure: CDC - Comprehensive Diabetes     │ │
│ │              Care - Eye Exam.                                          │ │
│ │                                                                        │ │
│ │ [View Full Record →]                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                               [View All Cases →]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Value for Care Manager:**
> Direct visibility into compliance-tracked care gaps without navigating to separate quality dashboards. Can immediately prioritize based on HEDIS impact.

---

#### Phase 6: Taking Clinical Actions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚡ Suggested Actions                                           [4 pending] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📅 SCHEDULE                                          Priority: HIGH     │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Schedule PCP Follow-up for BP Review                                   │ │
│ │                                                                        │ │
│ │ Coordinate with Dr. Chen's office to schedule appointment for          │ │
│ │ hypertension medication review within 2 weeks.                         │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📞 OUTREACH                                          Priority: HIGH     │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Refer to Food Assistance Program                                       │ │
│ │                                                                        │ │
│ │ Connect member with community food bank and SNAP benefits enrollment.  │ │
│ │ Medically-tailored meal program may also be appropriate.               │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📅 SCHEDULE                                          Priority: MEDIUM   │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Schedule Diabetic Eye Exam                                             │ │
│ │                                                                        │ │
│ │ Book retinopathy screening with in-network ophthalmologist.            │ │
│ │ Member prefers morning appointments.                                   │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✏️ UPDATE                                            Priority: MEDIUM   │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Update Care Plan Goals                                                 │ │
│ │                                                                        │ │
│ │ Revise Q1 blood pressure goal and add nutrition counseling             │ │
│ │ intervention based on SDOH findings.                                   │ │
│ │                                                                        │ │
│ │ [✓ Accept]  [⋮ More Options]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### Phase 7: Schedule Action - Automatic Event Creation

Care Manager clicks **[✓ Accept]** on "Schedule PCP Follow-up for BP Review"

**Special Behavior for Schedule Actions:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🔄 Creating follow-up event...                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

         │
         ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ Follow-up Scheduled                                                      │
│                                                                             │
│ Event has been created successfully.                                        │
│ Click to view the scheduled event.                                         │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│ Event Details:                                                              │
│ • Subject: Schedule PCP Follow-up for BP Review                             │
│ • Related To: Maria Santos (Account)                                        │
│ • Start: Feb 14, 2024 9:00 AM (7 days from now)                            │
│ • Duration: 30 minutes                                                      │
│                                                                             │
│                                            [View Event →]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behind the Scenes:**
```
AHISController.executeScheduleAction() is called:
  1. Creates new Event record
  2. Links to current Account (WhatId)
  3. Sets StartDateTime to 7 days from now
  4. Populates Subject and Description from action
  5. Returns Event ID for navigation
```

**Value for Care Manager:**
> One-click scheduling eliminates manual event creation. Follow-ups are automatically linked to the patient record with pre-populated context.

---

#### Phase 8: Modify Action with Notes

Care Manager wants to modify "Refer to Food Assistance Program" to add specific resources.

1. Clicks **[⋮ More Options]** → **Edit**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Edit Action: Refer to Food Assistance Program                    [✕]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Please provide any notes or modifications for this action:                  │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Contacted St. Mary's Food Bank - they have a diabetes-friendly food    │ │
│ │ box program. Member added to waitlist. Also provided SNAP application  │ │
│ │ assistance hotline: 1-800-555-SNAP. Will follow up in 1 week.          │ │
│ │                                                                        │ │
│ │                                                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                        [Cancel]  [Save Changes]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

2. Clicks **[Save Changes]**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📞 OUTREACH                                        [Modified] ✏️        │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Refer to Food Assistance Program                                       │ │
│ │                                                                        │ │
│ │ Connect member with community food bank and SNAP benefits enrollment.  │ │
│ │ Medically-tailored meal program may also be appropriate.               │ │
│ │                                                                        │ │
│ │ Note: Contacted St. Mary's Food Bank - they have a diabetes-friendly   │ │
│ │ food box program. Member added to waitlist...                          │ │
│ │                                                                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### Phase 9: End-of-Day Panel Summary

After reviewing multiple patients, the Care Manager can see their action history.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Daily Activity Summary - Jennifer Williams, RN                              │
│ February 7, 2024                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Patients Reviewed: 12                                                       │
│ AHIS Insights Reviewed: 47                                                  │
│                                                                             │
│ Actions Taken:                                                              │
│ • Accepted: 8                                                               │
│ • Modified: 4                                                               │
│ • Dismissed: 2                                                              │
│                                                                             │
│ Follow-ups Scheduled: 6                                                     │
│ Care Gaps Addressed: 3                                                      │
│ SDOH Referrals Made: 2                                                      │
│                                                                             │
│ High-Priority Items Remaining: 4                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Care Manager Benefits Summary

| Metric | Before AHIS | With AHIS | Improvement |
|--------|-------------|-----------|-------------|
| Time per Care Plan Review | 15-20 minutes | 5-8 minutes | **60% faster** |
| Risk Identification | Manual chart review | AI-synthesized | **Proactive** |
| Care Gap Detection | Quarterly reports | Real-time | **Immediate** |
| SDOH Visibility | Buried in notes | Highlighted | **Surfaced** |
| Action Documentation | Manual entry | One-click logging | **75% faster** |

---

## Drill-Down Functionality Reference

### Risk Category to Object Mapping

| Risk Category | Salesforce Object | Use Case |
|---------------|-------------------|----------|
| **Clinical** | Task | Medication tasks, follow-ups, clinical activities |
| **Social** | Task | SDOH interventions, community resource referrals |
| **Operational** | Event | Appointments, scheduling, logistics |
| **Compliance** | Case | Care gaps, HEDIS measures, quality tracking |

### Drill-Down Data Flow

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ User clicks      │      │ AHISController.  │      │ DrillDown        │
│ "View Related    │ ──▶  │ getDrillDownData │ ──▶  │ Component        │
│  Records"        │      │ (recordId,       │      │ renders data     │
│                  │      │  insightType)    │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │ SOQL Query based on         │
                    │ insightType:                │
                    │                             │
                    │ Clinical → Task WHERE       │
                    │   WhatId = :recordId        │
                    │                             │
                    │ Operational → Event WHERE   │
                    │   WhatId = :recordId        │
                    │                             │
                    │ Compliance → Case WHERE     │
                    │   AccountId = :recordId     │
                    └─────────────────────────────┘
```

### Drill-Down Panel Features

| Feature | Description | User Benefit |
|---------|-------------|--------------|
| **Search** | Filter records by keyword | Quickly find specific items |
| **Refresh** | Reload data from server | Get latest updates |
| **View Full Record** | Navigate to Salesforce record | Full editing capabilities |
| **View All** | Navigate to object list view | See complete history |
| **Status Badges** | Color-coded status indicators | Quick visual scanning |

---

## Action Response Workflows

### Action Types and Behaviors

| Action Type | Icon | Accept Behavior | Use Case |
|-------------|------|-----------------|----------|
| `schedule` | 📅 | Creates Event record automatically | Follow-up appointments |
| `escalate` | 🚨 | Logs action, may trigger workflow | Transfers, escalations |
| `outreach` | 📞 | Logs action for tracking | Member communication |
| `review` | 👁️ | Logs action | Document/record review |
| `update` | ✏️ | Logs action, may prompt for details | Care plan updates |

### Action Status Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Pending    │ ──▶ │  Accepted   │     │  Dismissed  │
│             │     │     or      │     │             │
│  (default)  │ ──▶ │  Modified   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       ▲
       │                                       │
       └───────────────────────────────────────┘
```

### Action Response Logging

All action responses are logged via `AHISController.logActionResponse()`:

```apex
public static void logActionResponse(
    String actionId,      // Unique action identifier
    String actionStatus,  // accepted, modified, dismissed
    String notes          // User-provided notes (optional)
)
```

**Audit Trail Captured:**
- User ID and timestamp
- Action ID and original content
- Response status
- User notes (if provided)
- Related record context

---

## Comparative Analysis

### Side-by-Side: Same Patient, Different Roles

#### Summary Comparison

| Aspect | Call Center Agent | Care Manager |
|--------|-------------------|--------------|
| **Opening Line** | Demographics + Plan ID | Demographics + Program enrollment |
| **Key Metrics** | Coverage status, PCP, balance | Care plan %, A1C, BP |
| **Terminology** | "Member", "Plan", "Coverage" | "Patient", "Care Plan", "Clinical" |
| **Focus** | Service resolution | Clinical outcomes |
| **Urgency Cues** | Appointments, refills due | Goal progress, care gaps |

#### Insight Comparison (Same Data, Different Framing)

**Blood Pressure Concern:**

| Role | Insight Title | Description |
|------|---------------|-------------|
| **Call Center** | "Medication Adherence Concern" | "Lisinopril refill is 5 days overdue. May need reminder or pharmacy follow-up." |
| **Care Manager** | "Blood Pressure Control Gap" | "Despite medication compliance, BP readings remain elevated (avg 145/92 vs target <140/90). Consider medication adjustment or lifestyle intervention." |

**Key Difference:** Call Center sees actionable service item; Care Manager sees clinical pattern requiring intervention.

#### Suggested Actions Comparison

**Call Center Actions:**
1. Confirm appointment (service)
2. Transfer to pharmacy (escalate)
3. Send benefits summary (outreach)

**Care Manager Actions:**
1. Schedule PCP follow-up (clinical)
2. Refer to food assistance (SDOH intervention)
3. Schedule eye exam (compliance)
4. Update care plan goals (documentation)

---

## Appendix: Technical Reference

### Component Hierarchy

```
ahisContainer
├── ahisSummary
│   ├── Role Badge
│   ├── Summary Text
│   └── What's Changed
├── ahisInsights
│   ├── Risk Summary
│   └── Insight Cards (expandable)
├── ahisActions
│   ├── Action Cards
│   └── Action Modals
└── ahisDrillDown (conditional)
    ├── Search/Filter
    └── Record Cards
```

### Apex Controllers

| Method | Purpose |
|--------|---------|
| `getAHISData(recordId)` | Fetch AI-generated summaries, insights, actions |
| `getCurrentUserRole()` | Detect user role from profile/user role |
| `getDrillDownData(recordId, insightType)` | Query related records for drill-down |
| `logActionResponse(actionId, status, notes)` | Record user action responses |
| `executeScheduleAction(recordId, actionId, subject, description)` | Create Event for schedule actions |

### Event Architecture

| Event Name | Dispatched By | Handled By | Purpose |
|------------|---------------|------------|---------|
| `drildown` | ahisInsights | ahisContainer | Open drill-down panel |
| `close` | ahisDrillDown | ahisContainer | Close drill-down panel |
| `actionresponse` | ahisActions | ahisContainer | Log action response |
| `scheduleaction` | ahisActions | ahisContainer | Create scheduled event |

---

*Document created: February 3, 2026*  
*Last updated: February 3, 2026*  
*Version: 1.0*
