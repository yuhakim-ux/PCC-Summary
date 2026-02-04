# Agentic Health Intelligence Surface (AHIS) Prototype

A GenAI-powered LWC component for Salesforce Health Cloud that provides role-aware summaries, insights, and suggested actions.

## Overview

AHIS transforms complex Health Cloud data into actionable intelligence:
- **Contact Center Agent View**: Quick member summaries, plan details, escalation options
- **Care Manager View**: Care plan health, goal progress, intervention recommendations

## Two Versions Available

| Version | Directory | Use Case |
|---------|-----------|----------|
| **Standard/Demo** | `force-app/` | Any Salesforce org (uses mock data) |
| **Health Cloud** | `force-app-healthcloud/` | Health Cloud orgs with real data + OpenAI |

---

## Demo Mode (No Health Cloud Required)

This prototype includes a **demo mode** with realistic mock Health Cloud data. You can deploy to any Salesforce org to see the full UI and functionality.

### Quick Start - Demo Mode

1. **Get a Free Salesforce Developer Org** (if needed):
   - Sign up at: https://developer.salesforce.com/signup

2. **Authenticate and Deploy**:
```bash
# Login to your org
sf org login web -a demo-org

# Deploy the prototype
sf project deploy start -o demo-org
```

3. **Add Component to Any Account Record**:
   - Go to any Account record
   - Click ⚙️ > Edit Page
   - Drag "AHIS - Health Intelligence Surface" to the page
   - Save and Activate

The component will display realistic healthcare data (Maria Santos - a sample Medicare member) with role-specific summaries, insights, and suggested actions.

---

## Production Mode (Health Cloud Required)

### Prerequisites

- Salesforce org with Health Cloud installed
- System Administrator access
- OpenAI API key

### 1. Disable Mock Data

Edit `AHISController.cls` and change:
```apex
private static final Boolean USE_MOCK_DATA = false;
```

### 2. Configure Named Credential

1. Go to Setup > Named Credentials
2. Create a new Named Credential called `OpenAI`
3. Set URL: `https://api.openai.com`
4. Authentication: Custom Header
5. Header Name: `Authorization`
6. Header Value: `Bearer YOUR_API_KEY`

### 3. Deploy Source

```bash
# Authenticate to your org
sf org login web -a myorg

# Deploy all components
sf project deploy start -o myorg
```

### 4. Add Component to Record Pages

1. Go to a Member (Account) record page
2. Edit Page > Drag `ahisContainer` to the right column
3. Save and Activate

Repeat for Care Plan record pages.

## Component Structure

- `ahisContainer` - Main orchestrator component
- `ahisSummary` - GenAI-generated summary display
- `ahisInsights` - Expandable key insights with risk badges
- `ahisActions` - Suggested actions with Accept/Modify/Dismiss
- `ahisDrillDown` - Detail panel for record navigation

## Configuration

Edit `AHIS_Config__mdt` custom metadata to configure:
- Entity whitelist
- Prompt templates
- Role mappings
- Related entity limits

## License

Internal Salesforce Prototype
