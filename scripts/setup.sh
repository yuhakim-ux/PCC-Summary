#!/bin/bash

# AHIS Prototype Setup Script
# This script helps set up the AHIS prototype in a Salesforce org

echo "=========================================="
echo "AHIS Prototype Setup"
echo "=========================================="

# Check if SFDX CLI is installed
if ! command -v sf &> /dev/null; then
    echo "Error: Salesforce CLI (sf) is not installed."
    echo "Please install it from: https://developer.salesforce.com/tools/sfdxcli"
    exit 1
fi

# Check for org alias argument
ORG_ALIAS=${1:-""}
if [ -z "$ORG_ALIAS" ]; then
    echo "Usage: ./setup.sh <org-alias>"
    echo "Example: ./setup.sh myHealthCloudOrg"
    exit 1
fi

echo ""
echo "Target org: $ORG_ALIAS"
echo ""

# Step 1: Deploy metadata
echo "Step 1: Deploying AHIS metadata..."
sf project deploy start --target-org $ORG_ALIAS --wait 10

if [ $? -ne 0 ]; then
    echo "Error: Deployment failed."
    exit 1
fi

echo "Deployment successful!"
echo ""

# Step 2: Assign permission set
echo "Step 2: Assigning AHIS_User permission set..."
sf org assign permset --name AHIS_User --target-org $ORG_ALIAS

if [ $? -ne 0 ]; then
    echo "Warning: Could not assign permission set. Please assign manually."
fi

echo ""

# Step 3: Remind about Named Credential setup
echo "=========================================="
echo "IMPORTANT: Manual Setup Required"
echo "=========================================="
echo ""
echo "Please complete the following steps in Salesforce Setup:"
echo ""
echo "1. Configure Named Credential for OpenAI:"
echo "   - Go to Setup > Named Credentials"
echo "   - Edit 'OpenAI' credential"
echo "   - Set your OpenAI API key in the Password field"
echo ""
echo "2. Activate Lightning Record Pages:"
echo "   - Go to Setup > Lightning App Builder"
echo "   - Open 'AHIS Member Record Page'"
echo "   - Click 'Activation' and assign to desired profiles"
echo "   - Repeat for 'AHIS Care Plan Record Page'"
echo ""
echo "3. Create test data (optional):"
echo "   - Open Developer Console"
echo "   - Run: AHISTestDataFactory.createAllScenarios();"
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
