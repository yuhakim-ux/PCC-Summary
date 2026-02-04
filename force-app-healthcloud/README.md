# AHIS - Health Cloud Version

This directory contains the **Health Cloud-specific** version of the AHIS component with real OpenAI integration.

## Requirements

- **Salesforce Health Cloud license** (required for CarePlan, MemberPlan, Goal objects)
- **OpenAI API key** (for AI-generated summaries)
- **Named Credential** configured for OpenAI
- **Remote Site Setting** for api.openai.com

## Health Cloud Objects Used

This version queries the following Health Cloud objects:
- `CarePlan` - Care plans for members
- `Goal` - Care plan goals
- `MemberPlan` - Insurance/benefit plans
- `CareRegisteredPatient` - Registered patients in care programs
- `ServiceAppointment` - Scheduled appointments
- Person Account fields (`HealthCloudGA__Gender__pc`, `HealthCloudGA__PrimaryLanguage__pc`)

---

## Setup Instructions

### Step 1: Create Remote Site Setting

This allows Salesforce to make HTTP callouts to OpenAI's API.

1. Go to **Setup** > Search for **"Remote Site Settings"**
2. Click **New Remote Site**
3. Fill in the details:
   - **Remote Site Name**: `OpenAI_API`
   - **Remote Site URL**: `https://api.openai.com`
   - **Description**: `OpenAI API for AHIS GenAI summaries`
   - **Active**: ✅ Checked
4. Click **Save**

### Step 2: Create Named Credential

This securely stores your OpenAI API key and handles authentication.

#### Option A: Legacy Named Credential (Simpler)

1. Go to **Setup** > Search for **"Named Credentials"**
2. Click **New Legacy**
3. Fill in the details:
   - **Label**: `OpenAI`
   - **Name**: `OpenAI` (auto-populated)
   - **URL**: `https://api.openai.com`
   - **Identity Type**: `Named Principal`
   - **Authentication Protocol**: `No Authentication`
4. Click **Save**
5. After saving, go back and edit the Named Credential
6. Under **Callout Options**, check **"Generate Authorization Header"**: No
7. Add a **Custom Header**:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer sk-your-openai-api-key-here`
8. Click **Save**

#### Option B: External Credential (More Secure - Recommended for Production)

1. Go to **Setup** > Search for **"Named Credentials"**
2. Click **External Credentials** tab
3. Click **New**
4. Fill in:
   - **Label**: `OpenAI_External`
   - **Name**: `OpenAI_External`
   - **Authentication Protocol**: `Custom`
5. Add a **Principal**:
   - **Parameter Name**: `Authorization`
   - **Sequence Number**: `1`
   - **Identity Type**: `Named Principal`
6. Add the API key as a **Custom Header** parameter
7. Create a **Named Credential** that references this External Credential:
   - **URL**: `https://api.openai.com`
   - **External Credential**: `OpenAI_External`

### Step 3: Deploy the Code

```bash
# 1. Login to your Health Cloud org
sf org login web -a healthcloud-prod

# 2. Deploy the Health Cloud Apex classes
sf project deploy start -d force-app-healthcloud -o healthcloud-prod

# 3. Deploy the base LWC components (if not already deployed)
sf project deploy start -d force-app/main/default/lwc -o healthcloud-prod
```

### Step 4: Add Component to Record Pages

1. Navigate to an **Account** or **CarePlan** record
2. Click **⚙️ Gear Icon** > **Edit Page**
3. In the Components panel, search for **"AHIS"**
4. Drag **"AHIS - Health Intelligence Surface"** to the page
5. Click **Save** > **Activation** > **Assign as Org Default**

---

## Troubleshooting

### "Unable to find apex action class referenced as 'AHISController'"
- Ensure the Apex classes deployed successfully
- Check for compilation errors in Setup > Apex Classes

### "System.CalloutException: Unauthorized endpoint"
- Verify Remote Site Setting is active for `https://api.openai.com`

### "API Error: 401"
- Check that the Named Credential has the correct API key
- Verify the API key is valid at platform.openai.com

### "Invalid type: CarePlan"
- The org doesn't have Health Cloud installed
- Use the standard demo version (`force-app/`) instead

---

## Differences from Standard Version

| Feature | Standard Version | Health Cloud Version |
|---------|-----------------|---------------------|
| Data Source | Mock data | Real Health Cloud objects |
| AI Integration | None | OpenAI via Named Credential |
| Objects | Account, Contact, Case | + CarePlan, MemberPlan, Goal |
| License Required | Any Salesforce | Health Cloud |

## Cost Considerations

- **Model**: `gpt-4o-mini` (cost-effective)
- **Tokens**: ~500-1500 per request
- **Estimated cost**: $0.001-0.003 per summary generated
