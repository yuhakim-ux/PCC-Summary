# AHIS Summary Section Examples

This document outlines the Agent Summary examples for the Summary Section across both user scenarios.

---

## Overview

The Summary Section is the first component users see in the AHIS panel. It provides a quick, role-optimized overview of the member or care plan, enabling users to understand context within seconds.

| Scenario | User Role | Record Context | Primary Purpose |
|----------|-----------|----------------|-----------------|
| Care Manager | Care Manager | Care Plan | Understand care plan progress and clinical priorities |
| Contact Center | Contact Center Agent | Member Account | Quick member context for call handling |

---

## Scenario 1: Care Manager View

### Context
- **User**: Jennifer Williams, RN (Care Manager)
- **Record**: John Doe's Diabetes Management Care Plan
- **Situation**: Reviewing care plan progress during scheduled case review

### User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Care Manager opens Care Plan record in Salesforce            │
│                           ↓                                      │
│  2. AHIS component auto-loads and calls Agentforce backend       │
│                           ↓                                      │
│  3. Summary section appears at top of AHIS panel                 │
│                           ↓                                      │
│  4. Care Manager scans summary to understand care plan status    │
│                           ↓                                      │
│  5. Proceeds to Insights/Actions tabs for detailed review        │
└──────────────────────────────────────────────────────────────────┘
```

### Summary Content

#### Role Badge
```
[Care Manager View]
```

#### Main Summary Text
> John Doe's Diabetes Management Plan shows mixed progress. While physical activity goals are on track (75% complete), the diabetes education program is overdue with only 2 of 5 modules completed. The primary HbA1c goal is progressing but the latest reading of 7.8% still exceeds the target of <7.0%. There is one high-priority overdue goal requiring immediate attention.

#### What's Changed Section
- Diabetes education goal became overdue (was due Nov 15)
- HbA1c goal progress increased from 55% to 60%
- Physical activity goal progress increased from 70% to 75%
- New medication review task created
- Nutritionist consultation scheduled for Dec 10

#### Role Context Footer
> 💙 Focused on care plan progress and clinical priorities

### Visual Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Summary                              [Care Manager View]     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ John Doe's Diabetes Management Plan shows mixed progress.   │ │
│ │ While physical activity goals are on track (75% complete),  │ │
│ │ the diabetes education program is overdue with only 2 of 5  │ │
│ │ modules completed. The primary HbA1c goal is progressing    │ │
│ │ but the latest reading of 7.8% still exceeds the target of  │ │
│ │ <7.0%. There is one high-priority overdue goal requiring    │ │
│ │ immediate attention.                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 🔄 WHAT'S CHANGED                                               │
│   • Diabetes education goal became overdue (was due Nov 15)     │
│   • HbA1c goal progress increased from 55% to 60%               │
│   • Physical activity goal progress increased from 70% to 75%   │
│   • New medication review task created                          │
│   • Nutritionist consultation scheduled for Dec 10              │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ 💙 Focused on care plan progress and clinical priorities        │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Goal-centric** | Highlights goal progress percentages and overdue items |
| **Clinical focus** | Mentions specific metrics (HbA1c values, activity minutes) |
| **Actionable** | Flags "high-priority overdue goal requiring immediate attention" |
| **Temporal awareness** | Changes show progression and new items since last visit |

---

## Scenario 2: Contact Center Agent View

### Context
- **User**: Contact Center Agent
- **Record**: Maria Santiago's Member Account
- **Situation**: Incoming call from member about plan coverage and prescription refill

### User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Agent receives incoming call; Member Account record pops up  │
│                           ↓                                      │
│  2. AHIS component auto-loads on Member/Account record page      │
│                           ↓                                      │
│  3. Summary section provides instant context for the call        │
│                           ↓                                      │
│  4. Agent scans summary while greeting the member                │
│                           ↓                                      │
│  5. Agent is prepared to address likely call reasons             │
└──────────────────────────────────────────────────────────────────┘
```

### Summary Content

#### Role Badge
```
[Call Center View]
```

#### Main Summary Text
> Maria Santiago is a 52-year-old female member with active Premium HDHP and Gold Dental coverage through Makana Health. She has been managing Type 2 Diabetes and Depression with regular physician visits. Her prescription for Metformin is due for refill, and she has an upcoming annual checkup scheduled for December 20th.

#### What's Changed Section
- New prescription refill alert generated
- Annual checkup appointment added to calendar
- Previous plan inquiry case was closed

#### Role Context Footer
> 📞 Optimized for quick member assistance during calls

### Visual Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Summary                                [Call Center View]    │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Maria Santiago is a 52-year-old female member with active   │ │
│ │ Premium HDHP and Gold Dental coverage through Makana Health.│ │
│ │ She has been managing Type 2 Diabetes and Depression with   │ │
│ │ regular physician visits. Her prescription for Metformin is │ │
│ │ due for refill, and she has an upcoming annual checkup      │ │
│ │ scheduled for December 20th.                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 🔄 WHAT'S CHANGED                                               │
│   • New prescription refill alert generated                     │
│   • Annual checkup appointment added to calendar                │
│   • Previous plan inquiry case was closed                       │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ 📞 Optimized for quick member assistance during calls           │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Identity-first** | Starts with member demographics (age, gender) for verification |
| **Coverage clarity** | Immediately confirms active plan status |
| **Predictive** | Surfaces likely call reasons (prescription refill due, upcoming appointment) |
| **Concise** | Designed to be read in seconds while on a live call |

---

## Comparison: Care Manager vs Contact Center

| Aspect | Care Manager | Contact Center |
|--------|--------------|----------------|
| **Primary Focus** | Care plan progress & goals | Member identity & coverage status |
| **Tone** | Clinical, analytical | Conversational, service-oriented |
| **Metrics Shown** | HbA1c, progress %, dates | Plan names, refill dates, appointments |
| **Key Question Answered** | "How is this patient doing on their care plan?" | "Who is this member and why might they be calling?" |
| **Urgency Indicators** | Overdue goals, unmet targets | Upcoming deadlines, alerts |
| **Summary Length** | ~60 words (more detail) | ~50 words (scan-friendly) |
| **Changes Focus** | Goal progress deltas | Recent alerts and case updates |

---

## Common UX Patterns

Both scenarios follow these shared design patterns:

### 1. Glanceable
Summary text should be readable in **5-10 seconds**

### 2. Prioritized
Most critical information comes **first** in the summary

### 3. Role-Aware Badge
Immediately tells the user what view they're seeing (top-right corner)

### 4. What's Changed
Diff-style list highlighting recent updates since last visit/interaction

### 5. Context Footer
Subtle reminder of the view's optimization focus

---

## Component Structure

```
Summary Section
├── Header
│   ├── Icon + Title ("Summary")
│   └── Role Badge (e.g., "Care Manager View")
├── Main Summary Box
│   └── AI-generated summary text (role-optimized)
├── What's Changed Section (conditional)
│   ├── Section header with icon
│   └── Bulleted list of changes
└── Role Context Footer (conditional)
    ├── Role-specific icon
    └── Context message
```

---

## Data Sources

### Care Manager Scenario
| Data Element | Source Object |
|--------------|---------------|
| Care Plan name & status | CarePlan |
| Goals & progress | Goal (related to CarePlan) |
| HbA1c readings | Lab Results / Clinical Data |
| Interventions | CareIntervention |
| Care Tasks | Task (related to CarePlan) |

### Contact Center Scenario
| Data Element | Source Object |
|--------------|---------------|
| Member demographics | Account / Contact |
| Plan coverage | MemberPlan |
| Health conditions | HealthCondition |
| Medications | Medication |
| Appointments | ServiceAppointment |
| Recent interactions | Case / Activity |

---

## Next Steps

- [ ] Review summary content with clinical SMEs
- [ ] Validate terminology with compliance team
- [ ] Test summary readability with target users
- [ ] Finalize "What's Changed" logic and data sources
- [ ] Confirm role detection mechanism

---

*Document created: February 2, 2026*
*Last updated: February 2, 2026*
