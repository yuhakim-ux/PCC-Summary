# Agentic Health Intelligence Surface (AHIS)

A GenAI-powered LWC component for Salesforce Health Cloud that provides role-aware summaries, insights, and suggested actions for member intelligence.

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
| `release/v2` | `ahisContainer` | Visual updates, sourced records modal |
| `release/v3` | `ahisContainer` + `ahisContainerV3` | V3: persona switcher, inline sourced records |

### Latest (release/v3)
- **V3 Component**: Streamlined UI with Summary, What's Changed, and inline collapsible Sourced Records
- **Persona Switcher**: Dropdown to demo all 4 user roles without re-authentication
- **Sourced Records**: Inline collapsible section showing data lineage (replaces modal)

## Components

### V2: AHIS - Health Intelligence Surface
The full-featured component for production use.
- Auto-detects user role from Salesforce profile
- **Summary**: AI-generated member intelligence summary
- **What's Changed**: Key changes and signals detected
- **Key Insights**: Risk-categorized insights (Clinical, Social, Operational, Compliance)
- **Suggested Actions**: Human-in-the-loop action recommendations
- **Sourced Records Modal**: Click expand icon to see data sources

### V3: AHIS V3 - Health Intelligence (Persona Demo)
Streamlined demo component with persona switcher.
- **Persona Dropdown**: Switch between 4 roles instantly in the header
- **Summary**: Role-tailored AI summary
- **What's Changed**: Role-specific change detection
- **Inline Sourced Records**: Collapsible section showing data lineage
- Ideal for demos, stakeholder presentations, and UX testing

| Feature | V2 | V3 |
|---------|----|----|
| Role Detection | Auto (from profile) | Manual (dropdown) |
| Key Insights | ✅ | ❌ |
| Suggested Actions | ✅ | ❌ |
| Sourced Records | Modal | Inline collapsible |
| Use Case | Production | Demo/Prototype |

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

### 4. Demo the Persona Switcher (V3)

On the V3 component, use the dropdown in the header to switch between:
- **Care Manager** - Clinical trends & intervention priorities
- **Contact Center Agent** - Quick reference for member calls
- **Field Caregiver** - Pre-visit preparation & safety focus
- **Supervisor** - Risk distribution & team workload

Watch the summary and what's changed sections update based on the selected persona. Expand the "Sourced Records" section to see which records informed the AI summary.

---

## Component Architecture

```
force-app/main/default/
├── lwc/
│   ├── ahisContainer/        # V2 main container (full features)
│   ├── ahisContainerV3/      # V3 container (persona switcher, streamlined)
│   ├── ahisSummary/          # GenAI summary display (shared)
│   ├── ahisInsights/         # Risk-categorized insights (V2 only)
│   ├── ahisActions/          # Suggested actions (V2 only)
│   └── ahisDrillDown/        # Detail panel for record navigation
├── classes/
│   ├── AHISController.cls    # Main Apex controller
│   ├── AHISMockDataService.cls # Mock data generator
│   └── OpenAIService.cls     # OpenAI integration
└── flexipages/               # Lightning page layouts
```

## Apex Controllers

| Class | Purpose |
|-------|---------|
| `AHISController` | Main controller with `getAHISData()` (V2) and `getAHISDataForPersona(recordId, userRole)` (V3) |
| `AHISMockDataService` | Generates role-specific mock data for all 4 personas |
| `OpenAIService` | OpenAI API integration for real AI summaries (when enabled) |

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

## For Engineering Team

### Branch Strategy
- `main` - Primary development branch
- `release/v1` - Tag for initial release
- `release/v2` - Visual updates and V2 features
- `release/v3` - Latest: V3 persona switcher + inline sourced records

### Development Workflow
```bash
# Clone and setup
git clone https://github.com/yuhakim-ux/AHIIS.git
cd AHIIS
git checkout release/v3

# Create a scratch org (optional)
sf org create scratch -f config/project-scratch-def.json -a ahis-dev

# Deploy to your org
sf org login web -a my-org
sf project deploy start -o my-org

# Run demo data script
sf apex run -f scripts/createDemoData.apex -o my-org
```

### Key Files to Know
| File | Description |
|------|-------------|
| `AHISController.cls` | Entry point - handles data fetching and persona routing |
| `AHISMockDataService.cls` | All mock data lives here - edit to customize demo content |
| `ahisContainerV3.js` | V3 component logic - persona switching, data loading |
| `ahisContainerV3.html` | V3 template - summary, changes, sourced records sections |
| `createDemoData.apex` | Creates Maria Santos account with related records |

### Customizing Mock Data
To change the demo content for a specific persona, edit `AHISMockDataService.cls`:
- `getMockCareManagerSummary()` - Care Manager view
- `getMockContactCenterSummary()` - Contact Center Agent view
- `getMockFieldCaregiverSummary()` - Field Caregiver view
- `getMockSupervisorSummary()` - Supervisor view

### Testing in Org
1. Navigate to any Account record
2. Edit the Lightning page
3. Add "AHIS V3 - Health Intelligence (Persona Demo)" component
4. Save and test the persona dropdown

---

## License

Internal Salesforce Prototype
