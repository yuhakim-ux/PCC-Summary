/**
 * Mock AHIS data keyed by persona summary type.
 * Three distinct summary types per the PRD: Member, Patient, Provider.
 * Each has a unique data schema matching its domain.
 */

const PERSONA_DATA = {
    MEMBER: {
        badge: 'Member Summary',
        label: 'Payer CSR View',
        icon: 'utility:identity',
        message: 'Plan, claims, and financial overview for member calls',
        persona: 'member',
        microSummary:
            'Active Medicare Advantage member. 1 denied knee claim under appeal — SLA in 3 days. Insulin PA pending clinical review. Severe Penicillin allergy on file.',
        identityPlan: {
            memberId: '982734',
            name: 'Carole White',
            dob: '03/15/1958',
            gender: 'Female',
            language: 'English',
            planName: 'Medicare Advantage (HMO)',
            planStatus: 'Active',
            planStatusIndicator: 'green',
            effectiveDates: '01/01/2026 – 12/31/2026',
            pcp: 'Dr. Adams',
            groupNumber: 'GRP-40221',
            lastInteraction: { daysAgo: 12, reason: 'Prior Auth status' },
        },
        alerts: [
            { level: 'error', text: 'Severe Penicillin Allergy — Anaphylaxis history (2023)' },
            { level: 'error', text: 'On Insulin + Warfarin (high-risk medication combination)' },
            { level: 'error', text: 'Knee procedure claim denied — $2,400 patient responsibility' },
            { level: 'warning', text: 'Insulin Prior Auth pending clinical review (Auth #PA-992)' },
            { level: 'warning', text: 'Care Barrier: Transportation difficulty (moderate)' },
            { level: 'info', text: 'Open Case #1234: Medication Access — Status: New' },
        ],
        conditions: [
            { name: 'Type 2 Diabetes', status: 'Active', severity: 'Moderate' },
            { name: 'Hypertension', status: 'Active', severity: 'Moderate' },
            { name: 'Osteoarthritis (Knee)', status: 'Active', severity: 'Moderate' },
        ],
        claimsOverview: [
            { service: 'Knee Arthroscopy', claimId: 'CLM-2026-K12', status: 'Denied', statusIndicator: 'red', billedAmount: '$8,200', patientResponsibility: '$2,400', appealStatus: 'Appeal in progress — SLA 3 days' },
            { service: 'Diabetes Consult', claimId: 'CLM-2026-D05', status: 'Paid', statusIndicator: 'green', billedAmount: '$350', patientResponsibility: '$25 copay', appealStatus: null },
            { service: 'Lab Work — Lipid Panel', claimId: 'CLM-2026-L19', status: 'Pending', statusIndicator: 'yellow', billedAmount: '$180', patientResponsibility: 'TBD', appealStatus: null },
            { service: 'ER Visit — Chest Pain', claimId: 'CLM-2026-E01', status: 'Paid', statusIndicator: 'green', billedAmount: '$4,500', patientResponsibility: '$250 copay', appealStatus: null },
        ],
        priorAuthAppeals: {
            priorAuths: [
                { service: 'Knee Arthroscopy', authId: 'PA-881', status: 'Approved', statusIndicator: 'green' },
                { service: 'Insulin Refill', authId: 'PA-992', status: 'Pending', statusIndicator: 'yellow' },
            ],
            appeals: [
                { description: 'Knee claim denial appeal', appealId: 'APL-2026-01', slaDaysRemaining: 3 },
            ],
        },
        openCases: [
            { caseNumber: 'CS-1234', subject: 'Medication Access — Insulin', status: 'New', assignedTo: 'Sarah Johnson' },
        ],
        careGaps: {
            gaps: ['Flu Immunization overdue', 'HbA1c test overdue (last: 4 months ago)'],
            barriers: ['Transportation difficulty (moderate severity)'],
            careProgram: { name: 'Diabetes Management Program', status: 'Enrolled' },
        },
        insights: [
            { title: 'Knee Claim Denial — Active Appeal', riskCategory: 'Financial', confidence: 'High', description: 'Knee procedure claim denied with $2,400 patient responsibility. Appeal is in progress with SLA expiring in 3 days. Member may be calling about this.', sourceRecords: ['Claim #CLM-2026-K12', 'Appeal #APL-2026-01'] },
            { title: 'Insulin Prior Auth Pending', riskCategory: 'Compliance', confidence: 'High', description: 'Prior Auth #PA-992 for insulin refill is pending clinical review. Insulin is a high-risk medication — any gap could lead to adverse event.', sourceRecords: ['Prior Auth #PA-992'] },
            { title: 'Flu Immunization Overdue', riskCategory: 'Operational', confidence: 'Medium', description: 'Flu vaccine status is Pending. Member is in a high-risk group (age 58, diabetes, on immunosuppressant-adjacent meds).', sourceRecords: ['Immunization Record', 'Care Gap'] },
        ],
        suggestedActions: [
            { id: 'ma1', title: 'Check Appeal SLA Status', actionType: 'review', priority: 'High', description: 'Knee claim appeal SLA expires in 3 days. If member is calling about the denied claim, provide appeal status and expected resolution timeline.', status: 'pending' },
            { id: 'ma2', title: 'Expedite Insulin Prior Auth', actionType: 'escalate', priority: 'High', description: 'Insulin is a high-risk medication. Escalate Prior Auth #PA-992 to clinical review if member reports running low.', status: 'pending' },
            { id: 'ma3', title: 'Schedule Flu Vaccination', actionType: 'schedule', priority: 'Medium', description: 'Member is overdue for flu immunization and in a high-risk group. Offer to schedule at next visit or nearest pharmacy.', status: 'pending' },
        ],
    },

    PATIENT: {
        badge: 'Patient Summary',
        label: 'Provider CSR View',
        icon: 'utility:heart',
        message: 'Clinical details, medications, and referrals for patient care',
        persona: 'patient',
        microSummary:
            '68F with Type 2 Diabetes — HbA1c trending up (7.2% → 8.1% over 6 months). Metformin refill due in 5 days; stomach upset reported. Overdue for diabetic eye exam (14 months). Transportation barrier flagged.',
        identityDemographics: {
            name: 'Carole White',
            age: 68,
            gender: 'Female',
            language: 'English',
            mrn: 'MRN-441029',
            pcp: 'Dr. Adams',
            careCoordinator: 'Jennifer Williams, RN',
            lastContact: { daysAgo: 3, channel: 'Telehealth', topic: 'Medication Review' },
            riskLevel: 'High Risk (Complex Care)',
        },
        clinicalSnapshot: [
            { name: 'Type 2 Diabetes (T2D)', status: 'Active', severity: 'Moderate', stage: 'Chronic', onsetDate: '2018' },
            { name: 'Hypertension', status: 'Active', severity: 'Moderate', stage: '', onsetDate: '2016' },
            { name: 'Mild Osteoarthritis', status: 'Active', severity: 'Mild', stage: '', onsetDate: '2022' },
        ],
        medications: [
            { name: 'Metformin', dose: '500mg', frequency: '2x daily', prescriber: 'Dr. Adams', refillAlert: 'Refill due in 5 days', interactionWarning: null, sideEffects: 'Stomach upset reported' },
            { name: 'Lisinopril', dose: '10mg', frequency: '1x daily', prescriber: 'Dr. Adams', refillAlert: null, interactionWarning: null, sideEffects: null },
            { name: 'Atorvastatin', dose: '20mg', frequency: '1x daily', prescriber: 'Dr. Adams', refillAlert: null, interactionWarning: null, sideEffects: null },
        ],
        recentActivity: {
            encounters: [
                { type: 'Annual Wellness Visit', reason: 'Routine checkup', date: '2026-03-28', provider: 'Dr. Adams' },
                { type: 'Telehealth', reason: 'Medication review', date: '2026-03-15', provider: 'Dr. Adams' },
                { type: 'Lab Visit', reason: 'HbA1c + Lipid Panel', date: '2026-04-02', provider: 'Quest Diagnostics' },
            ],
            scheduledProcedures: [
                { name: 'Cardiology Consultation', date: '2026-04-20', status: 'Scheduled' },
            ],
            pendingLabs: [
                { name: 'Lipid Panel', orderedDate: '2026-04-02', status: 'Pending lab signature' },
            ],
            immunizations: [
                { name: 'Flu', status: 'Current' },
                { name: 'Pneumovax', status: 'Overdue' },
                { name: 'COVID-19 Booster', status: 'Due Soon' },
            ],
        },
        referrals: [
            { specialty: 'Ophthalmology (Diabetic Eye Exam)', referringProvider: 'Dr. Adams', status: 'Pending', date: '2026-03-28' },
            { specialty: 'Cardiology', referringProvider: 'Dr. Adams', status: 'Active', date: '2026-03-15' },
        ],
        careGaps: [
            { description: 'Diabetic Eye Exam overdue (last: 14 months ago)', urgency: 'error' },
            { description: 'Pneumovax immunization overdue', urgency: 'warning' },
            { description: 'HbA1c above target — trending up over 6 months', urgency: 'error' },
            { description: 'BP elevated: 142/90 at last visit', urgency: 'warning' },
        ],
        careManagement: {
            carePrograms: [{ name: 'Diabetes Management Program', status: 'Enrolled', startDate: '01/2026' }],
            carePlanStatus: 'Active — mixed progress',
            barriers: ['Transportation: difficulty getting to pharmacy', 'Limited health literacy'],
            careTeam: [
                { name: 'Dr. Adams', role: 'PCP' },
                { name: 'Jennifer Williams, RN', role: 'Care Coordinator' },
                { name: 'Mark Chen, PharmD', role: 'Clinical Pharmacist' },
            ],
        },
        insights: [
            { title: 'HbA1c Above Target — Trending Up', riskCategory: 'Clinical', confidence: 'High', description: 'Latest HbA1c reading of 8.1% exceeds target of <7.0%. Trend shows consistent increase over 6 months (7.2% → 8.1%), indicating need for medication adjustment or intensified dietary counseling.', sourceRecords: ['Lab Result #LR-2026-0402', 'Goal: HbA1c Management'] },
            { title: 'Diabetic Eye Exam Overdue', riskCategory: 'Clinical', confidence: 'High', description: 'Last diabetic eye exam was 14 months ago. Annual screening is required per care plan. If patient reports blurry vision, prioritize immediate nurse callback.', sourceRecords: ['Care Gap: Eye Exam', 'Referral: Ophthalmology'] },
            { title: 'Transportation Barrier — Pharmacy Access', riskCategory: 'Social', confidence: 'Medium', description: 'Patient noted difficulty reaching the pharmacy during last intake. Metformin refill is due in 5 days — consider mail-order pharmacy switch.', sourceRecords: ['SDOH Screening', 'Care Notes'] },
            { title: 'Upcoming Cardiology Consult', riskCategory: 'Operational', confidence: 'High', description: 'Cardiology consultation scheduled for April 20. Elevated BP (142/90) at last visit. Ensure recent labs are available for cardiologist review.', sourceRecords: ['Appointment #EVT-2026-420', 'Vitals'] },
        ],
        suggestedActions: [
            { id: 'pa1', title: 'Schedule Diabetic Eye Exam', actionType: 'schedule', priority: 'High', description: 'Overdue by 2 months. Ophthalmology referral is pending — coordinate scheduling. If patient reports blurry vision, escalate to nurse callback.', status: 'pending' },
            { id: 'pa2', title: 'Switch Metformin to Mail-Order', actionType: 'outreach', priority: 'High', description: 'Resolve transportation barrier by switching Metformin refill to mail-order pharmacy. Refill due in 5 days.', status: 'pending' },
            { id: 'pa3', title: 'Review HbA1c Trend with PCP', actionType: 'escalate', priority: 'High', description: 'HbA1c trending up over 6 months (7.2→8.1%). Coordinate with Dr. Adams to discuss medication adjustment before cardiology consult on Apr 20.', status: 'pending' },
            { id: 'pa4', title: 'Initiate SDOH Screening', actionType: 'review', priority: 'Medium', description: 'Complete Social Determinants of Health screening to formally assess transportation, food access, and health literacy barriers.', status: 'pending' },
        ],
    },

    PROVIDER_INDIVIDUAL: {
        badge: 'Provider Summary',
        label: 'PRM CSR View — Individual',
        icon: 'utility:user',
        message: 'Credentialing, compliance, and network status for this provider',
        persona: 'provider',
        providerSubType: 'individual',
        microSummary:
            'Board-certified cardiologist. State license expires in 45 days. 2 open cases (1 grievance, 1 inquiry). No adverse actions on file.',
        providerSnapshot: {
            npi: '1234567890',
            npiType: 'Type 1',
            name: 'Dr. Sarah Patel, MD, FACC',
            specialty: 'Cardiology',
            taxId: 'TIN-XX-4829',
            address: '450 Medical Center Dr, Suite 200, San Francisco, CA 94107',
            phone: '(415) 555-0142',
            email: 's.patel@heartcare-sf.com',
            acceptingNewPatients: true,
            rosterSize: null,
            specialtiesOffered: [],
            lastInteraction: { daysAgo: 5, reason: 'Credentialing inquiry' },
        },
        credentialing: {
            stateLicense: { number: 'CA-A-098234', state: 'California', status: 'Expiring', statusIndicator: 'yellow', expiryDate: '05/22/2026' },
            boardCertifications: [
                { name: 'Cardiovascular Disease (ABIM)', status: 'Active' },
                { name: 'Internal Medicine (ABIM)', status: 'Active' },
                { name: 'Nuclear Cardiology (CBNC)', status: 'Active' },
            ],
            dea: { number: 'FP-1234567', status: 'Active', expiryDate: '12/31/2027' },
            malpracticeInsurance: { carrier: 'NORCAL Mutual', expiryDate: '09/30/2026', status: 'Active', statusIndicator: 'green' },
            lastCredentialingDate: '03/15/2024',
            nextRecredentialingDue: '03/15/2027',
            facilityLicense: null,
            cmsCertification: null,
            accreditation: null,
            cliaCertificate: null,
        },
        networkParticipation: [
            { networkName: 'Blue Shield PPO', effectiveDate: '01/01/2022', termDate: null, contractStatus: 'Active', panelStatus: 'Open', feeScheduleTier: 'Tier 1' },
            { networkName: 'Medicare Advantage (Makana)', effectiveDate: '07/01/2023', termDate: null, contractStatus: 'Active', panelStatus: 'Closed', feeScheduleTier: 'Tier 1' },
            { networkName: 'Aetna HMO', effectiveDate: '01/01/2024', termDate: '12/31/2026', contractStatus: 'Active', panelStatus: 'Open', feeScheduleTier: 'Tier 2' },
        ],
        openCases: [
            { caseNumber: 'PRV-CS-2201', type: 'Grievance', status: 'Under Review', priority: 'Medium', assignedTo: 'Provider Relations Team' },
            { caseNumber: 'PRV-CS-2198', type: 'Inquiry', status: 'Open', priority: 'Low', assignedTo: 'Contract Admin' },
        ],
        adverseActions: [],
        roster: [],
        insights: [
            { title: 'State License Expiring in 45 Days', riskCategory: 'Compliance', confidence: 'High', description: 'California medical license #CA-A-098234 expires on 05/22/2026. If not renewed, provider will be non-compliant and may require temporary network suspension per policy.', sourceRecords: ['License Record', 'Credentialing File'] },
            { title: 'Open Grievance — Under Review', riskCategory: 'Operational', confidence: 'Medium', description: 'Grievance case #PRV-CS-2201 filed by a member regarding wait times. Currently under review by Provider Relations. No escalation required yet.', sourceRecords: ['Case #PRV-CS-2201'] },
            { title: 'Medicare Panel Closed', riskCategory: 'Operational', confidence: 'High', description: 'Medicare Advantage (Makana) panel is closed. New Medicare member referrals to this provider will be rejected. Consider discussing panel reopening at next contract review.', sourceRecords: ['Network Contract #NC-MA-2023'] },
        ],
        suggestedActions: [
            { id: 'pra1', title: 'Send License Renewal Reminder', actionType: 'outreach', priority: 'High', description: 'State license expires in 45 days. Send renewal reminder to provider and flag for follow-up if not renewed within 30 days.', status: 'pending' },
            { id: 'pra2', title: 'Review Grievance Case', actionType: 'review', priority: 'Medium', description: 'Grievance #PRV-CS-2201 is under review. Check if additional information is needed from the provider to resolve.', status: 'pending' },
            { id: 'pra3', title: 'Discuss Panel Reopening', actionType: 'schedule', priority: 'Low', description: 'Medicare Advantage panel is closed. Flag for discussion at the next quarterly contract review meeting.', status: 'pending' },
        ],
    },

    PROVIDER_FACILITY: {
        badge: 'Provider Summary',
        label: 'PRM CSR View — Facility',
        icon: 'utility:company',
        message: 'Facility credentialing, accreditation, and roster overview',
        persona: 'provider',
        providerSubType: 'facility',
        microSummary:
            'Level II Trauma Center. Joint Commission accredited. CMS certification current. 24 physicians on roster. 1 open complaint case. 1 provider on roster with expiring license.',
        providerSnapshot: {
            npi: '9876543210',
            npiType: 'Type 2',
            name: 'Makana Valley Medical Center',
            specialty: 'General Acute Care Hospital',
            taxId: 'TIN-XX-7710',
            address: '1200 Valley Health Blvd, Makana, HI 96768',
            phone: '(808) 555-0300',
            email: 'admin@makanavalleymc.org',
            acceptingNewPatients: true,
            rosterSize: 24,
            specialtiesOffered: ['Cardiology', 'Orthopedics', 'Internal Medicine', 'Emergency Medicine', 'Pediatrics', 'Radiology'],
        },
        credentialing: {
            stateLicense: null,
            boardCertifications: [],
            dea: { number: '', status: '', expiryDate: '' },
            malpracticeInsurance: { carrier: 'ProAssurance', expiryDate: '12/31/2026', status: 'Active', statusIndicator: 'green' },
            lastCredentialingDate: '06/01/2024',
            nextRecredentialingDue: '06/01/2027',
            facilityLicense: 'Active — HI Dept. of Health #FH-2024-0891',
            cmsCertification: 'Active — CMS #15-0042 (expires 12/2027)',
            accreditation: 'Joint Commission — Accredited (last survey 03/2025)',
            cliaCertificate: 'Active — CLIA #12D4567890 (Lab)',
        },
        networkParticipation: [
            { networkName: 'HMSA (PPO)', effectiveDate: '01/01/2020', termDate: null, contractStatus: 'Active', panelStatus: 'Open', feeScheduleTier: 'Tier 1' },
            { networkName: 'Kaiser Permanente', effectiveDate: '07/01/2021', termDate: null, contractStatus: 'Active', panelStatus: 'Open', feeScheduleTier: 'Tier 1' },
            { networkName: 'UHA Health Insurance', effectiveDate: '01/01/2023', termDate: '12/31/2026', contractStatus: 'Active', panelStatus: 'Open', feeScheduleTier: 'Tier 2' },
        ],
        openCases: [
            { caseNumber: 'FAC-CS-0445', type: 'Complaint', status: 'Under Investigation', priority: 'High', assignedTo: 'Compliance Team' },
        ],
        adverseActions: [],
        roster: [
            { name: 'Dr. Sarah Patel', npi: '1234567890', specialty: 'Cardiology', credentialStatus: 'yellow' },
            { name: 'Dr. James Koa', npi: '1234567891', specialty: 'Orthopedics', credentialStatus: 'green' },
            { name: 'Dr. Lisa Chang', npi: '1234567892', specialty: 'Internal Medicine', credentialStatus: 'green' },
            { name: 'Dr. Robert Tanaka', npi: '1234567893', specialty: 'Emergency Medicine', credentialStatus: 'green' },
            { name: 'Dr. Maria Santos', npi: '1234567894', specialty: 'Pediatrics', credentialStatus: 'green' },
        ],
        insights: [
            { title: 'Roster Provider License Expiring', riskCategory: 'Compliance', confidence: 'High', description: 'Dr. Sarah Patel (Cardiology) has a state license expiring in 45 days. This could affect the facility\'s credentialing compliance if not renewed in time.', sourceRecords: ['Roster Record', 'Dr. Patel License #CA-A-098234'] },
            { title: 'Active Complaint Under Investigation', riskCategory: 'Operational', confidence: 'High', description: 'Complaint case #FAC-CS-0445 is under investigation by the Compliance Team. High priority — may require facility response within 10 business days.', sourceRecords: ['Case #FAC-CS-0445'] },
            { title: 'Specialty Gap: No Neurology on Roster', riskCategory: 'Operational', confidence: 'Medium', description: 'Facility offers 6 specialties but has no neurologist on roster. Referral patterns show 12% of consult requests are for neurology — currently routed to external providers.', sourceRecords: ['Referral Analytics', 'Roster Data'] },
        ],
        suggestedActions: [
            { id: 'fa1', title: 'Follow Up on Dr. Patel License Renewal', actionType: 'outreach', priority: 'High', description: 'Dr. Patel\'s CA license expires in 45 days. Contact provider to confirm renewal status. If not renewed in 30 days, initiate temporary suspension protocol.', status: 'pending' },
            { id: 'fa2', title: 'Respond to Complaint Case', actionType: 'review', priority: 'High', description: 'Complaint #FAC-CS-0445 requires facility response. Coordinate with Compliance Team to prepare documentation within the 10-day window.', status: 'pending' },
            { id: 'fa3', title: 'Evaluate Neurology Roster Gap', actionType: 'review', priority: 'Medium', description: 'Consider recruiting a neurologist to the roster. 12% of consult requests require external neurology referrals, adding cost and delays.', status: 'pending' },
        ],
    },
};

const DRILL_DOWN_RECORDS = {
    Financial: [
        { id: 'clm-001', name: 'Claim: Knee Arthroscopy', status: 'Denied', priority: 'High', dueDate: 'Appeal SLA: 3 days', ownerName: 'Claims Review Team' },
        { id: 'clm-002', name: 'Claim: Diabetes Consult', status: 'Paid', priority: 'Low', dueDate: 'Closed', ownerName: 'Auto-adjudicated' },
        { id: 'clm-003', name: 'Claim: Lab Work — Lipid Panel', status: 'Pending', priority: 'Medium', dueDate: 'In processing', ownerName: 'Claims Team' },
    ],
    Clinical: [
        { id: 'tsk-001', name: 'HbA1c Follow-up Review', status: 'Open', priority: 'High', dueDate: '2026-04-15', ownerName: 'Dr. Adams' },
        { id: 'tsk-002', name: 'Diabetic Eye Exam Referral', status: 'Pending', priority: 'High', dueDate: '2026-04-10', ownerName: 'Jennifer Williams, RN' },
        { id: 'tsk-003', name: 'Medication Reconciliation', status: 'In Progress', priority: 'Medium', dueDate: '2026-04-12', ownerName: 'Mark Chen, PharmD' },
        { id: 'tsk-004', name: 'Cardiology Pre-visit Lab Review', status: 'Open', priority: 'Medium', dueDate: '2026-04-18', ownerName: 'Dr. Adams' },
    ],
    Social: [
        { id: 'tsk-005', name: 'SDOH Transportation Assessment', status: 'Open', priority: 'Medium', dueDate: '2026-04-20', ownerName: 'Community Health Worker' },
        { id: 'tsk-006', name: 'Mail-Order Pharmacy Setup', status: 'Not Started', priority: 'High', dueDate: '2026-04-09', ownerName: 'Pharmacy Team' },
        { id: 'tsk-007', name: 'Health Literacy Assessment', status: 'Not Started', priority: 'Low', dueDate: '2026-04-25', ownerName: 'Jennifer Williams, RN' },
    ],
    Operational: [
        { id: 'evt-001', name: 'Cardiology Consultation', status: 'Scheduled', startTime: '2026-04-20T14:00:00', location: 'HeartCare SF', workType: 'Specialist Consult' },
        { id: 'evt-002', name: 'Diabetic Eye Exam', status: 'To Be Scheduled', startTime: '', location: 'TBD', workType: 'Screening' },
    ],
    Compliance: [
        { id: 'cs-001', name: 'License Renewal — Dr. Patel', caseNumber: 'CRED-2026-0098', status: 'Pending Renewal', priority: 'High', ownerName: 'Credentialing Team' },
        { id: 'cs-002', name: 'Grievance Review', caseNumber: 'PRV-CS-2201', status: 'Under Review', priority: 'Medium', ownerName: 'Provider Relations' },
        { id: 'cs-003', name: 'Facility Complaint Investigation', caseNumber: 'FAC-CS-0445', status: 'Under Investigation', priority: 'High', ownerName: 'Compliance Team' },
    ],
};

const AVAILABLE_PERSONAS = [
    { value: 'MEMBER', label: 'Member Summary' },
    { value: 'PATIENT', label: 'Patient Summary' },
    { value: 'PROVIDER_INDIVIDUAL', label: 'Provider — Individual' },
    { value: 'PROVIDER_FACILITY', label: 'Provider — Facility' },
];

export function getAvailableRoles() {
    return AVAILABLE_PERSONAS;
}

export function getAHISData(role) {
    const data = PERSONA_DATA[role] || PERSONA_DATA.MEMBER;
    return {
        success: true,
        generatedAt: new Date().toISOString(),
        ...data,
    };
}

export function getDrillDownRecords(riskCategory) {
    return DRILL_DOWN_RECORDS[riskCategory] || [];
}
