/**
 * @description Mock data service for AHIS prototype demonstration
 * Provides realistic Health Cloud-like data without requiring Health Cloud license
 */
public with sharing class AHISMockDataService {
    
    /**
     * @description Generates mock AHIS data for demonstration purposes
     * @param recordId The record ID (used to vary the mock data slightly)
     * @param userRole The user's role for role-specific content
     * @return Mock AHISData response
     */
    public static AHISController.AHISData getMockAHISData(Id recordId, String userRole) {
        AHISController.AHISData data = new AHISController.AHISData();
        data.recordId = recordId;
        data.objectType = 'Account';
        data.userRole = userRole;
        data.success = true;
        data.generatedAt = Datetime.now();
        
        // Generate role-specific mock data
        if (userRole == 'CONTACT_CENTER_AGENT') {
            data.summary = getMockContactCenterSummary();
            data.insights = getMockContactCenterInsights();
            data.suggestedActions = getMockContactCenterActions();
            data.changesSinceLastVisit = getMockContactCenterChanges();
        } else if (userRole == 'CARE_MANAGER') {
            data.summary = getMockCareManagerSummary();
            data.insights = getMockCareManagerInsights();
            data.suggestedActions = getMockCareManagerActions();
            data.changesSinceLastVisit = getMockCareManagerChanges();
        } else if (userRole == 'FIELD_CAREGIVER') {
            data.summary = getMockFieldCaregiverSummary();
            data.insights = getMockFieldCaregiverInsights();
            data.suggestedActions = getMockFieldCaregiverActions();
            data.changesSinceLastVisit = getMockFieldCaregiverChanges();
        } else if (userRole == 'SUPERVISOR') {
            data.summary = getMockSupervisorSummary();
            data.insights = getMockSupervisorInsights();
            data.suggestedActions = getMockSupervisorActions();
            data.changesSinceLastVisit = getMockSupervisorChanges();
        } else {
            data.summary = getMockDefaultSummary();
            data.insights = getMockDefaultInsights();
            data.suggestedActions = getMockDefaultActions();
            data.changesSinceLastVisit = getMockChanges();
        }
        
        return data;
    }
    
    // ============ Contact Center Agent Mock Data ============
    
    private static String getMockContactCenterSummary() {
        return 'Maria Santos is a 67-year-old Medicare Advantage member with an active HMO plan (ID: MA-2024-78432). ' +
               'She has a scheduled cardiology follow-up on February 15th and recently filled her Metformin prescription. ' +
               'Her primary care provider is Dr. Rebecca Chen at Sunrise Medical Group. No outstanding balance on account.';
    }
    
    private static List<OpenAIService.AHISInsight> getMockContactCenterInsights() {
        List<OpenAIService.AHISInsight> insights = new List<OpenAIService.AHISInsight>();
        
        OpenAIService.AHISInsight insight1 = new OpenAIService.AHISInsight();
        insight1.title = 'Upcoming Specialist Appointment';
        insight1.description = 'Cardiology follow-up scheduled for Feb 15, 2024 at 2:30 PM with Dr. James Wilson. Member may call about appointment details or transportation needs.';
        insight1.riskCategory = 'Operational';
        insight1.confidence = 'High';
        insight1.sourceRecords = new List<String>{'ServiceAppointment-001', 'CarePlan-2024-001'};
        insights.add(insight1);
        
        OpenAIService.AHISInsight insight2 = new OpenAIService.AHISInsight();
        insight2.title = 'Medication Adherence Concern';
        insight2.description = 'Lisinopril refill is 5 days overdue. Previous adherence rate was 92%. May need reminder or pharmacy follow-up.';
        insight2.riskCategory = 'Clinical';
        insight2.confidence = 'Medium';
        insight2.sourceRecords = new List<String>{'RxClaim-88721', 'PharmacyRecord-445'};
        insights.add(insight2);
        
        OpenAIService.AHISInsight insight3 = new OpenAIService.AHISInsight();
        insight3.title = 'Plan Benefits Question Likely';
        insight3.description = 'Member recently received EOB for lab work. May have questions about coverage or copay amounts.';
        insight3.riskCategory = 'Operational';
        insight3.confidence = 'Medium';
        insight3.sourceRecords = new List<String>{'Claim-2024-11234'};
        insights.add(insight3);
        
        return insights;
    }
    
    private static List<OpenAIService.AHISAction> getMockContactCenterActions() {
        List<OpenAIService.AHISAction> actions = new List<OpenAIService.AHISAction>();
        
        OpenAIService.AHISAction action1 = new OpenAIService.AHISAction();
        action1.actionId = 'ACT-CC-001';
        action1.title = 'Confirm Cardiology Appointment';
        action1.description = 'Verify member has transportation arranged for Feb 15th appointment. Offer to schedule medical transport if needed.';
        action1.actionType = 'outreach';
        action1.priority = 'Medium';
        action1.status = 'pending';
        actions.add(action1);
        
        OpenAIService.AHISAction action2 = new OpenAIService.AHISAction();
        action2.actionId = 'ACT-CC-002';
        action2.title = 'Transfer to Pharmacy Services';
        action2.description = 'If member mentions medication issues, warm transfer to Pharmacy Services (ext. 4422) for Lisinopril refill assistance.';
        action2.actionType = 'escalate';
        action2.priority = 'High';
        action2.status = 'pending';
        actions.add(action2);
        
        OpenAIService.AHISAction action3 = new OpenAIService.AHISAction();
        action3.actionId = 'ACT-CC-003';
        action3.title = 'Send Benefits Summary';
        action3.description = 'Email updated benefits summary document explaining lab work coverage under preventive care.';
        action3.actionType = 'outreach';
        action3.priority = 'Low';
        action3.status = 'pending';
        actions.add(action3);
        
        return actions;
    }
    
    // ============ Care Manager Mock Data ============
    
    private static String getMockCareManagerSummary() {
        return 'Maria Santos (67F) is enrolled in the Chronic Care Management program for diabetes and hypertension. ' +
               'Care plan is 78% on track with 3 of 4 quarterly goals met. A1C reduced from 8.2 to 7.4 over 6 months. ' +
               'Blood pressure control remains a challenge with recent readings averaging 145/92. ' +
               'High engagement score (8/10) with consistent portal usage and appointment attendance.';
    }
    
    private static List<OpenAIService.AHISInsight> getMockCareManagerInsights() {
        List<OpenAIService.AHISInsight> insights = new List<OpenAIService.AHISInsight>();
        
        OpenAIService.AHISInsight insight1 = new OpenAIService.AHISInsight();
        insight1.title = 'Blood Pressure Control Gap';
        insight1.description = 'Despite medication compliance, BP readings remain elevated (avg 145/92 vs target <140/90). Consider medication adjustment or lifestyle intervention referral.';
        insight1.riskCategory = 'Clinical';
        insight1.confidence = 'High';
        insight1.sourceRecords = new List<String>{'Vital-2024-001', 'Vital-2024-002', 'Vital-2024-003'};
        insights.add(insight1);
        
        OpenAIService.AHISInsight insight2 = new OpenAIService.AHISInsight();
        insight2.title = 'Social Determinant Risk Identified';
        insight2.description = 'Member mentioned difficulty affording fresh vegetables during last call. Food insecurity may impact diabetes management.';
        insight2.riskCategory = 'Social';
        insight2.confidence = 'Medium';
        insight2.sourceRecords = new List<String>{'CaseNote-445', 'SDOH-Assessment-2024'};
        insights.add(insight2);
        
        OpenAIService.AHISInsight insight3 = new OpenAIService.AHISInsight();
        insight3.title = 'Positive Trend: A1C Improvement';
        insight3.description = 'A1C dropped from 8.2 to 7.4 (0.8 point reduction) over past 6 months. Current interventions are effective for glycemic control.';
        insight3.riskCategory = 'Clinical';
        insight3.confidence = 'High';
        insight3.sourceRecords = new List<String>{'LabResult-7821', 'LabResult-6543'};
        insights.add(insight3);
        
        OpenAIService.AHISInsight insight4 = new OpenAIService.AHISInsight();
        insight4.title = 'Care Gap: Eye Exam Overdue';
        insight4.description = 'Annual diabetic retinopathy screening is 3 months overdue. HEDIS measure at risk.';
        insight4.riskCategory = 'Compliance';
        insight4.confidence = 'High';
        insight4.sourceRecords = new List<String>{'CareGap-DRE-2024'};
        insights.add(insight4);
        
        return insights;
    }
    
    private static List<OpenAIService.AHISAction> getMockCareManagerActions() {
        List<OpenAIService.AHISAction> actions = new List<OpenAIService.AHISAction>();
        
        OpenAIService.AHISAction action1 = new OpenAIService.AHISAction();
        action1.actionId = 'ACT-CM-001';
        action1.title = 'Schedule PCP Follow-up for BP Review';
        action1.description = 'Coordinate with Dr. Chen\'s office to schedule appointment for hypertension medication review within 2 weeks.';
        action1.actionType = 'schedule';
        action1.priority = 'High';
        action1.status = 'pending';
        actions.add(action1);
        
        OpenAIService.AHISAction action2 = new OpenAIService.AHISAction();
        action2.actionId = 'ACT-CM-002';
        action2.title = 'Refer to Food Assistance Program';
        action2.description = 'Connect member with community food bank and SNAP benefits enrollment. Medically-tailored meal program may also be appropriate.';
        action2.actionType = 'outreach';
        action2.priority = 'High';
        action2.status = 'pending';
        actions.add(action2);
        
        OpenAIService.AHISAction action3 = new OpenAIService.AHISAction();
        action3.actionId = 'ACT-CM-003';
        action3.title = 'Schedule Diabetic Eye Exam';
        action3.description = 'Book retinopathy screening with in-network ophthalmologist. Member prefers morning appointments.';
        action3.actionType = 'schedule';
        action3.priority = 'Medium';
        action3.status = 'pending';
        actions.add(action3);
        
        OpenAIService.AHISAction action4 = new OpenAIService.AHISAction();
        action4.actionId = 'ACT-CM-004';
        action4.title = 'Update Care Plan Goals';
        action4.description = 'Revise Q1 blood pressure goal and add nutrition counseling intervention based on SDOH findings.';
        action4.actionType = 'update';
        action4.priority = 'Medium';
        action4.status = 'pending';
        actions.add(action4);
        
        return actions;
    }
    
    // ============ Field Caregiver Mock Data ============
    
    private static String getMockFieldCaregiverSummary() {
        return 'PRE-VISIT BRIEF: Maria Santos, 67F, lives alone in a single-story home. ' +
               'Mobility concern: Member reported increased difficulty walking since last visit. Verify grab bars in bathroom. ' +
               'Medications to verify: Metformin 500mg (twice daily), Lisinopril 10mg (daily), Aspirin 81mg (daily). ' +
               'Key discussion: Food access challenges identified - may need community resource referral. ' +
               'Safety note: No known fall history, but osteoarthritis may increase risk.';
    }
    
    private static List<OpenAIService.AHISInsight> getMockFieldCaregiverInsights() {
        List<OpenAIService.AHISInsight> insights = new List<OpenAIService.AHISInsight>();
        
        OpenAIService.AHISInsight insight1 = new OpenAIService.AHISInsight();
        insight1.title = 'Mobility Assessment Needed';
        insight1.description = 'Member reported increased difficulty walking. Assess gait, balance, and home environment for fall risks. Check if walker or cane would be beneficial.';
        insight1.riskCategory = 'Clinical';
        insight1.confidence = 'High';
        insight1.sourceRecords = new List<String>{'CaseNote-445', 'Assessment-2024-001'};
        insights.add(insight1);
        
        OpenAIService.AHISInsight insight2 = new OpenAIService.AHISInsight();
        insight2.title = 'Home Safety Check';
        insight2.description = 'Verify grab bars installed in bathroom. Check for trip hazards (rugs, cords). Ensure adequate lighting in hallways and stairs.';
        insight2.riskCategory = 'Social';
        insight2.confidence = 'Medium';
        insight2.sourceRecords = new List<String>{'HomeAssessment-2023', 'CarePlan-2024-001'};
        insights.add(insight2);
        
        OpenAIService.AHISInsight insight3 = new OpenAIService.AHISInsight();
        insight3.title = 'Medication Verification';
        insight3.description = 'Confirm member is taking all medications as prescribed. Check pill organizer and verify Lisinopril refill status (may be overdue).';
        insight3.riskCategory = 'Clinical';
        insight3.confidence = 'High';
        insight3.sourceRecords = new List<String>{'MedList-2024', 'RxClaim-88721'};
        insights.add(insight3);
        
        OpenAIService.AHISInsight insight4 = new OpenAIService.AHISInsight();
        insight4.title = 'Food Security Discussion';
        insight4.description = 'Member mentioned difficulty affording fresh vegetables. Bring information about local food bank and Meals on Wheels program.';
        insight4.riskCategory = 'Social';
        insight4.confidence = 'Medium';
        insight4.sourceRecords = new List<String>{'SDOH-Assessment-2024'};
        insights.add(insight4);
        
        return insights;
    }
    
    private static List<OpenAIService.AHISAction> getMockFieldCaregiverActions() {
        List<OpenAIService.AHISAction> actions = new List<OpenAIService.AHISAction>();
        
        OpenAIService.AHISAction action1 = new OpenAIService.AHISAction();
        action1.actionId = 'ACT-FC-001';
        action1.title = 'Complete Fall Risk Assessment';
        action1.description = 'Use standardized fall risk tool during visit. Document findings and recommend interventions if score indicates high risk.';
        action1.actionType = 'review';
        action1.priority = 'High';
        action1.status = 'pending';
        actions.add(action1);
        
        OpenAIService.AHISAction action2 = new OpenAIService.AHISAction();
        action2.actionId = 'ACT-FC-002';
        action2.title = 'Medication Reconciliation';
        action2.description = 'Review all medications with member. Count pills, check expiration dates, and note any adherence concerns for care manager.';
        action2.actionType = 'review';
        action2.priority = 'High';
        action2.status = 'pending';
        actions.add(action2);
        
        OpenAIService.AHISAction action3 = new OpenAIService.AHISAction();
        action3.actionId = 'ACT-FC-003';
        action3.title = 'Provide Food Resource Information';
        action3.description = 'Leave printed materials about community food bank (located at 123 Main St) and SNAP application assistance.';
        action3.actionType = 'outreach';
        action3.priority = 'Medium';
        action3.status = 'pending';
        actions.add(action3);
        
        OpenAIService.AHISAction action4 = new OpenAIService.AHISAction();
        action4.actionId = 'ACT-FC-004';
        action4.title = 'Document Visit Findings';
        action4.description = 'Complete visit note with mobility observations, home safety findings, and any concerns to escalate to care manager.';
        action4.actionType = 'update';
        action4.priority = 'Medium';
        action4.status = 'pending';
        actions.add(action4);
        
        return actions;
    }
    
    private static List<String> getMockFieldCaregiverChanges() {
        return new List<String>{
            'NEW: Mobility concern reported by member (Jan 30, 2024)',
            'UPDATED: Lisinopril refill overdue by 5 days',
            'NEW: SDOH assessment flagged food insecurity',
            'REMINDER: Cardiology follow-up scheduled Feb 15'
        };
    }
    
    // ============ Supervisor Mock Data ============
    
    private static String getMockSupervisorSummary() {
        return 'MEMBER RISK PROFILE: Maria Santos | Risk Score: MEDIUM-HIGH (72/100) | ' +
               'Escalation Triggers: 2 active (BP control gap, SDOH food insecurity) | ' +
               'Assigned Care Manager: Sarah Johnson, RN | Last CM Contact: 3 days ago | ' +
               'Care Plan Status: 78% on track, 1 goal at risk (BP), 1 overdue (eye exam) | ' +
               'Compliance Gaps: Diabetic retinopathy exam 3 months overdue (HEDIS impact) | ' +
               'Team Workload: Sarah Johnson has 23 active members (above target of 20).';
    }
    
    private static List<OpenAIService.AHISInsight> getMockSupervisorInsights() {
        List<OpenAIService.AHISInsight> insights = new List<OpenAIService.AHISInsight>();
        
        OpenAIService.AHISInsight insight1 = new OpenAIService.AHISInsight();
        insight1.title = 'Escalation Required: BP Control';
        insight1.description = 'Blood pressure goal at risk for 6+ weeks despite medication compliance. May need physician review and medication adjustment. Consider escalating to medical director.';
        insight1.riskCategory = 'Clinical';
        insight1.confidence = 'High';
        insight1.sourceRecords = new List<String>{'CarePlanGoal-002', 'Vital-2024-001', 'Vital-2024-002'};
        insights.add(insight1);
        
        OpenAIService.AHISInsight insight2 = new OpenAIService.AHISInsight();
        insight2.title = 'SDOH Intervention Needed';
        insight2.description = 'Food insecurity identified but no intervention initiated yet. Community Health Worker assignment recommended. Task overdue by 5 days.';
        insight2.riskCategory = 'Social';
        insight2.confidence = 'High';
        insight2.sourceRecords = new List<String>{'SDOH-Assessment-2024', 'Task-003'};
        insights.add(insight2);
        
        OpenAIService.AHISInsight insight3 = new OpenAIService.AHISInsight();
        insight3.title = 'HEDIS Gap: Eye Exam';
        insight3.description = 'Diabetic retinopathy screening 3 months overdue. Impacts HEDIS measure DRE. 15 similar gaps across your team this quarter.';
        insight3.riskCategory = 'Compliance';
        insight3.confidence = 'High';
        insight3.sourceRecords = new List<String>{'CareGap-DRE-2024', 'QualityMetric-Q1'};
        insights.add(insight3);
        
        OpenAIService.AHISInsight insight4 = new OpenAIService.AHISInsight();
        insight4.title = 'Care Manager Workload Alert';
        insight4.description = 'Sarah Johnson, RN currently managing 23 active high-risk members (target: 20). Consider redistributing 3 members or adding support.';
        insight4.riskCategory = 'Operational';
        insight4.confidence = 'Medium';
        insight4.sourceRecords = new List<String>{'TeamCapacity-2024', 'CaseloadReport-Feb'};
        insights.add(insight4);
        
        return insights;
    }
    
    private static List<OpenAIService.AHISAction> getMockSupervisorActions() {
        List<OpenAIService.AHISAction> actions = new List<OpenAIService.AHISAction>();
        
        OpenAIService.AHISAction action1 = new OpenAIService.AHISAction();
        action1.actionId = 'ACT-SUP-001';
        action1.title = 'Review BP Escalation';
        action1.description = 'Schedule case review with Sarah Johnson to discuss Maria Santos BP management. Consider involving medical director for medication review.';
        action1.actionType = 'escalate';
        action1.priority = 'High';
        action1.status = 'pending';
        actions.add(action1);
        
        OpenAIService.AHISAction action2 = new OpenAIService.AHISAction();
        action2.actionId = 'ACT-SUP-002';
        action2.title = 'Assign CHW for SDOH';
        action2.description = 'Assign Maria Garcia, CHW to support food insecurity intervention. Current CHW caseload: 18/25 capacity.';
        action2.actionType = 'update';
        action2.priority = 'High';
        action2.status = 'pending';
        actions.add(action2);
        
        OpenAIService.AHISAction action3 = new OpenAIService.AHISAction();
        action3.actionId = 'ACT-SUP-003';
        action3.title = 'Run HEDIS Gap Report';
        action3.description = 'Generate team-wide diabetic eye exam gap report. 15 members overdue - consider bulk outreach campaign.';
        action3.actionType = 'review';
        action3.priority = 'Medium';
        action3.status = 'pending';
        actions.add(action3);
        
        OpenAIService.AHISAction action4 = new OpenAIService.AHISAction();
        action4.actionId = 'ACT-SUP-004';
        action4.title = 'Rebalance Caseloads';
        action4.description = 'Review team caseload distribution. Sarah Johnson over capacity. Consider reassigning 3 stable members to Tom Wilson (17/20 capacity).';
        action4.actionType = 'update';
        action4.priority = 'Medium';
        action4.status = 'pending';
        actions.add(action4);
        
        return actions;
    }
    
    private static List<String> getMockSupervisorChanges() {
        return new List<String>{
            'ESCALATION: BP goal at risk for 6+ weeks',
            'OVERDUE: SDOH intervention task (5 days)',
            'HEDIS ALERT: Eye exam gap impacts Q1 metrics',
            'CAPACITY: Sarah Johnson at 115% caseload'
        };
    }
    
    // ============ Role-Specific Changes ============
    
    private static List<String> getMockContactCenterChanges() {
        return new List<String>{
            'Prescription filled: Metformin 500mg (Jan 28)',
            'EOB received for lab work (Jan 30)',
            'Cardiology appointment confirmed (Feb 15)',
            'No outstanding balance on account'
        };
    }
    
    private static List<String> getMockCareManagerChanges() {
        return new List<String>{
            'Lab results: A1C improved to 7.4 (from 7.8)',
            'BP readings still elevated (avg 145/92)',
            'SDOH assessment completed - food insecurity flagged',
            'Eye exam now 3 months overdue'
        };
    }
    
    // ============ Default Mock Data ============
    
    private static String getMockDefaultSummary() {
        return 'Maria Santos is an active member with comprehensive healthcare coverage. ' +
               'She has upcoming appointments scheduled and is generally engaged with her care plan. ' +
               'Review the insights below for key information about her health status and recommended actions.';
    }
    
    private static List<OpenAIService.AHISInsight> getMockDefaultInsights() {
        List<OpenAIService.AHISInsight> insights = new List<OpenAIService.AHISInsight>();
        
        OpenAIService.AHISInsight insight1 = new OpenAIService.AHISInsight();
        insight1.title = 'Active Care Plan';
        insight1.description = 'Member has an active chronic care management plan with multiple goals in progress.';
        insight1.riskCategory = 'Clinical';
        insight1.confidence = 'High';
        insight1.sourceRecords = new List<String>{'CarePlan-2024-001'};
        insights.add(insight1);
        
        OpenAIService.AHISInsight insight2 = new OpenAIService.AHISInsight();
        insight2.title = 'Upcoming Appointments';
        insight2.description = 'Member has 2 appointments scheduled in the next 30 days.';
        insight2.riskCategory = 'Operational';
        insight2.confidence = 'High';
        insight2.sourceRecords = new List<String>{'Appointment-001', 'Appointment-002'};
        insights.add(insight2);
        
        return insights;
    }
    
    private static List<OpenAIService.AHISAction> getMockDefaultActions() {
        List<OpenAIService.AHISAction> actions = new List<OpenAIService.AHISAction>();
        
        OpenAIService.AHISAction action1 = new OpenAIService.AHISAction();
        action1.actionId = 'ACT-DEF-001';
        action1.title = 'Review Member Profile';
        action1.description = 'Review complete member profile and recent activity for context.';
        action1.actionType = 'review';
        action1.priority = 'Medium';
        action1.status = 'pending';
        actions.add(action1);
        
        return actions;
    }
    
    // ============ Mock Changes Since Last Visit ============
    
    private static List<String> getMockChanges() {
        return new List<String>{
            'New lab results received (Feb 1, 2024)',
            'Prescription filled: Metformin 500mg (Jan 28, 2024)',
            'Care plan goal updated by Dr. Chen (Jan 25, 2024)',
            'Member completed health assessment survey (Jan 20, 2024)'
        };
    }
    
    /**
     * @description Generates mock drill-down data for demonstration
     * @param insightType The type of drill-down requested
     * @return Mock DrillDownData response
     */
    public static AHISController.DrillDownData getMockDrillDownData(String insightType) {
        AHISController.DrillDownData data = new AHISController.DrillDownData();
        data.insightType = insightType;
        
        if (insightType == 'memberPlan') {
            data.records = getMockMemberPlanRecords();
        } else if (insightType == 'appointments') {
            data.records = getMockAppointmentRecords();
        } else if (insightType == 'goals') {
            data.records = getMockGoalRecords();
        } else if (insightType == 'careTasks') {
            data.records = getMockCareTaskRecords();
        } else {
            data.records = new List<Map<String, Object>>();
        }
        
        return data;
    }
    
    private static List<Map<String, Object>> getMockMemberPlanRecords() {
        List<Map<String, Object>> records = new List<Map<String, Object>>();
        
        records.add(new Map<String, Object>{
            'id' => 'MP-001',
            'name' => 'Medicare Advantage HMO',
            'productName' => 'SilverCare Plus HMO',
            'effectiveFrom' => Date.newInstance(2024, 1, 1),
            'effectiveTo' => Date.newInstance(2024, 12, 31),
            'status' => 'Active',
            'payerName' => 'HealthFirst Insurance'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'MP-002',
            'name' => 'Dental Coverage',
            'productName' => 'Dental Plus',
            'effectiveFrom' => Date.newInstance(2024, 1, 1),
            'effectiveTo' => Date.newInstance(2024, 12, 31),
            'status' => 'Active',
            'payerName' => 'DentaCare'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'MP-003',
            'name' => 'Vision Benefits',
            'productName' => 'Vision Essential',
            'effectiveFrom' => Date.newInstance(2024, 1, 1),
            'effectiveTo' => Date.newInstance(2024, 12, 31),
            'status' => 'Active',
            'payerName' => 'VisionCorp'
        });
        
        return records;
    }
    
    private static List<Map<String, Object>> getMockAppointmentRecords() {
        List<Map<String, Object>> records = new List<Map<String, Object>>();
        
        records.add(new Map<String, Object>{
            'id' => 'APT-001',
            'name' => 'Cardiology Follow-up',
            'appointmentNumber' => 'APT-2024-0215',
            'status' => 'Scheduled',
            'startTime' => Datetime.newInstance(2024, 2, 15, 14, 30, 0),
            'endTime' => Datetime.newInstance(2024, 2, 15, 15, 0, 0),
            'workType' => 'Specialist Visit',
            'description' => 'Follow-up with Dr. Wilson for cardiac monitoring'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'APT-002',
            'name' => 'Lab Work',
            'appointmentNumber' => 'APT-2024-0220',
            'status' => 'Scheduled',
            'startTime' => Datetime.newInstance(2024, 2, 20, 8, 0, 0),
            'endTime' => Datetime.newInstance(2024, 2, 20, 8, 30, 0),
            'workType' => 'Lab Services',
            'description' => 'Quarterly A1C and lipid panel'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'APT-003',
            'name' => 'PCP Annual Wellness',
            'appointmentNumber' => 'APT-2024-0301',
            'status' => 'Scheduled',
            'startTime' => Datetime.newInstance(2024, 3, 1, 10, 0, 0),
            'endTime' => Datetime.newInstance(2024, 3, 1, 11, 0, 0),
            'workType' => 'Wellness Visit',
            'description' => 'Annual wellness exam with Dr. Chen'
        });
        
        return records;
    }
    
    private static List<Map<String, Object>> getMockGoalRecords() {
        List<Map<String, Object>> records = new List<Map<String, Object>>();
        
        records.add(new Map<String, Object>{
            'id' => 'GOAL-001',
            'name' => 'Reduce A1C to < 7.0',
            'status' => 'In Progress',
            'priority' => 'High',
            'progress' => 0.85,
            'targetDate' => Date.newInstance(2024, 6, 30),
            'description' => 'Achieve A1C below 7.0 through medication and lifestyle changes',
            'lastModified' => Datetime.now().addDays(-5)
        });
        
        records.add(new Map<String, Object>{
            'id' => 'GOAL-002',
            'name' => 'Blood Pressure < 140/90',
            'status' => 'At Risk',
            'priority' => 'High',
            'progress' => 0.45,
            'targetDate' => Date.newInstance(2024, 3, 31),
            'description' => 'Maintain blood pressure below 140/90 mmHg',
            'lastModified' => Datetime.now().addDays(-2)
        });
        
        records.add(new Map<String, Object>{
            'id' => 'GOAL-003',
            'name' => 'Walk 30 min/day, 5 days/week',
            'status' => 'On Track',
            'priority' => 'Medium',
            'progress' => 0.75,
            'targetDate' => Date.newInstance(2024, 12, 31),
            'description' => 'Increase physical activity through daily walking',
            'lastModified' => Datetime.now().addDays(-7)
        });
        
        records.add(new Map<String, Object>{
            'id' => 'GOAL-004',
            'name' => 'Complete Diabetic Eye Exam',
            'status' => 'Not Started',
            'priority' => 'Medium',
            'progress' => 0.0,
            'targetDate' => Date.newInstance(2024, 2, 28),
            'description' => 'Annual retinopathy screening',
            'lastModified' => Datetime.now().addDays(-30)
        });
        
        return records;
    }
    
    private static List<Map<String, Object>> getMockCareTaskRecords() {
        List<Map<String, Object>> records = new List<Map<String, Object>>();
        
        records.add(new Map<String, Object>{
            'id' => 'TASK-001',
            'name' => 'Schedule Eye Exam',
            'subject' => 'Schedule diabetic retinopathy screening',
            'status' => 'Open',
            'priority' => 'High',
            'dueDate' => Date.newInstance(2024, 2, 10),
            'description' => 'Contact ophthalmology to schedule annual eye exam',
            'ownerName' => 'Sarah Johnson, RN'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'TASK-002',
            'name' => 'Follow-up Call',
            'subject' => 'Weekly check-in call with member',
            'status' => 'Open',
            'priority' => 'Medium',
            'dueDate' => Date.newInstance(2024, 2, 7),
            'description' => 'Discuss BP readings and medication adherence',
            'ownerName' => 'Sarah Johnson, RN'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'TASK-003',
            'name' => 'SDOH Resource Connection',
            'subject' => 'Connect member with food assistance program',
            'status' => 'In Progress',
            'priority' => 'High',
            'dueDate' => Date.newInstance(2024, 2, 14),
            'description' => 'Provide information about local food bank and SNAP enrollment',
            'ownerName' => 'Maria Garcia, CHW'
        });
        
        records.add(new Map<String, Object>{
            'id' => 'TASK-004',
            'name' => 'Care Plan Review',
            'subject' => 'Quarterly care plan review with PCP',
            'status' => 'Scheduled',
            'priority' => 'Medium',
            'dueDate' => Date.newInstance(2024, 2, 28),
            'description' => 'Review care plan progress and update goals',
            'ownerName' => 'Dr. Rebecca Chen'
        });
        
        return records;
    }
}
