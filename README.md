# Agentic Health Intelligence Surface (AHIS)

A GenAI-powered LWC component for Salesforce Health Cloud that provides role-aware summaries, insights, and suggested actions.

## Overview

AHIS transforms complex Health Cloud data into actionable intelligence with **"same intelligence, different experience"** for 4 user roles:

| Role | Focus | Key Features |
|------|-------|--------------|
| **Care Manager** | Clinical trends & interventions | Care plan progress, A1C trends, SDOH risks, care gaps |
| **Contact Center Agent** | Quick call reference | Plan ID, appointments, Rx status, escalation options |
| **Field Caregiver** | Pre-visit preparation | Home safety, medications to verify, visit checklist |
| **Supervisor** | Risk distribution & workload | Risk scores, escalations, team capacity, compliance |

## Version History

| Branch | Component | Description |
|--------|-----------|-------------|
| `release/v1` | `ahisContainer` | Initial release - basic summary and insights |
| `release/v2` | `ahisContainer` | Visual updates and styling improvements |
| `release/v3` | `ahisContainer` + `ahisContainerV3` | V3 adds persona switcher for demo |

## Components

### V2: AHIS - Health Intelligence Surface
The production-ready component with updated visuals.
- Auto-detects user role from profile
- Summary, insights, and suggested actions
- Drill-down to related records

### V3: AHIS V3 - Health Intelligence (Persona Demo)
Demo component with persona switcher dropdown.
- Switch between 4 personas instantly
- Shows how the same data renders differently per role
- Ideal for demos and stakeholder presentations

---

## Quick Start - Demo Mode

### 1. Clone and Deploy

```bash
# Clone the repository
git clone https://github.com/yuhakim-ux/AHIIS.git
cd AHIIS

# Checkout the version you want
git checkout release/v3  # Includes both V2 and V3 components

# Login to your Salesforce org
sf org login web -a demo-org

# Deploy
sf project deploy start -o demo-org
```

### 2. Create Demo Data

Run the demo data script in Developer Console:
1. Open Developer Console (Setup > Developer Console)
2. Debug > Open Execute Anonymous Window
3. Paste contents of `scripts/createDemoData.apex`
4. Click Execute

This creates "Maria Santos" - a 67-year-old Medicare member with Tasks, Events, and Cases.

### 3. Add Components to Account Page

1. Navigate to the Maria Santos account record
2. Click ⚙️ > Edit Page
3. Add components from the left panel:
   - **"AHIS - Health Intelligence Surface"** (V2)
   - **"AHIS V3 - Health Intelligence (Persona Demo)"** (V3)
4. Save and Activate

### 4. Demo the Persona Switcher

On the V3 component, use the dropdown to switch between:
- Care Manager
- Contact Center Agent
- Field Caregiver
- Supervisor

Watch the summary, insights, and actions change based on the selected persona.

---

## Component Architecture

```
force-app/main/default/lwc/
├── ahisContainer/        # V2 main container
├── ahisContainerV3/      # V3 container with persona switcher
├── ahisSummary/          # GenAI summary display
├── ahisInsights/         # Risk-categorized insights
├── ahisActions/          # Suggested actions (accept/modify/dismiss)
└── ahisDrillDown/        # Detail panel for record navigation
```

## Apex Controllers

| Class | Purpose |
|-------|---------|
| `AHISController` | Main controller - `getAHISData()` and `getAHISDataForPersona()` |
| `AHISMockDataService` | Mock data for all 4 personas |
| `OpenAIService` | OpenAI integration (when enabled) |

---

## Production Mode (Health Cloud)

### Prerequisites
- Salesforce org with Health Cloud
- OpenAI API key (optional - can use mock data)

### Enable Real Data

Edit `AHISController.cls`:
```apex
private static final Boolean USE_OPENAI = true;  // Change from false
```

### Configure OpenAI Named Credential

1. Setup > Named Credentials
2. Create "OpenAI" credential
3. URL: `https://api.openai.com`
4. Authentication: Custom Header
5. Header: `Authorization` = `Bearer YOUR_API_KEY`

---

## Configuration

Edit `AHIS_Config__mdt` custom metadata to configure:
- Entity whitelist
- OpenAI model selection
- Related entity limits
- Feature toggles

---

## Demo Data Details

The `createDemoData.apex` script creates:

| Object | Records | Purpose |
|--------|---------|---------|
| Account | 1 | Maria Santos - 67F, Medicare Advantage |
| Task | 5 | Care tasks, medication reminders, follow-ups |
| Event | 3 | Cardiology appt, lab work, wellness visit |
| Case | 3 | Care gaps, benefits inquiry, SDOH |

---

## License

Internal Salesforce Prototype
