/**
 * @description Main controller for AHIS (Agentic Health Intelligence Surface) component
 * Health Cloud Version - Fetches real Health Cloud data and orchestrates AI summary generation
 * 
 * REQUIREMENTS:
 * - Salesforce Health Cloud license
 * - OpenAI Named Credential configured
 */
public with sharing class AHISController {
    
    private static final Integer MAX_RELATED_RECORDS = 5;
    
    /**
     * @description Gets AHIS data for a record including AI-generated summary
     * @param recordId The ID of the record to analyze
     * @return AHISData containing summary, insights, and actions
     */
    @AuraEnabled(cacheable=false)
    public static AHISData getAHISData(Id recordId) {
        try {
            String objectType = recordId.getSObjectType().getDescribe().getName();
            String userRole = getCurrentUserRole();
            
            // Fetch context data based on object type
            String contextData = fetchContextData(recordId, objectType);
            
            // Generate AI summary
            OpenAIService.AHISSummaryResponse aiResponse = OpenAIService.generateSummary(
                contextData, 
                userRole, 
                objectType
            );
            
            // Build response
            AHISData data = new AHISData();
            data.recordId = recordId;
            data.objectType = objectType;
            data.userRole = userRole;
            data.summary = aiResponse.summary;
            data.insights = aiResponse.insights;
            data.suggestedActions = aiResponse.suggestedActions;
            data.changesSinceLastVisit = aiResponse.changesSinceLastVisit;
            data.generatedAt = aiResponse.generatedAt;
            data.success = aiResponse.success;
            data.errorMessage = aiResponse.errorMessage;
            
            return data;
            
        } catch (Exception e) {
            AHISData errorData = new AHISData();
            errorData.success = false;
            errorData.errorMessage = e.getMessage();
            return errorData;
        }
    }
    
    /**
     * @description Gets the current user's role for role-aware rendering
     * @return String representing the user role
     */
    @AuraEnabled(cacheable=true)
    public static String getCurrentUserRole() {
        User currentUser = [
            SELECT Id, Profile.Name, UserRole.Name 
            FROM User 
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];
        
        String profileName = currentUser.Profile.Name;
        String roleName = currentUser.UserRole?.Name;
        
        // Determine role based on profile or role name
        if (profileName != null) {
            if (profileName.containsIgnoreCase('Contact Center') || 
                profileName.containsIgnoreCase('Call Center') ||
                profileName.containsIgnoreCase('Service Agent')) {
                return 'CONTACT_CENTER_AGENT';
            }
            if (profileName.containsIgnoreCase('Care Manager') || 
                profileName.containsIgnoreCase('Care Coordinator') ||
                profileName.containsIgnoreCase('Clinical')) {
                return 'CARE_MANAGER';
            }
            if (profileName.containsIgnoreCase('Field') || 
                profileName.containsIgnoreCase('Home Health') ||
                profileName.containsIgnoreCase('Caregiver')) {
                return 'FIELD_CAREGIVER';
            }
            if (profileName.containsIgnoreCase('Supervisor') || 
                profileName.containsIgnoreCase('Manager') ||
                profileName.containsIgnoreCase('Director')) {
                return 'SUPERVISOR';
            }
        }
        
        // Check role name as fallback
        if (roleName != null) {
            if (roleName.containsIgnoreCase('Contact Center')) return 'CONTACT_CENTER_AGENT';
            if (roleName.containsIgnoreCase('Care Manager')) return 'CARE_MANAGER';
        }
        
        return 'DEFAULT';
    }
    
    /**
     * @description Fetches context data for the given record
     */
    private static String fetchContextData(Id recordId, String objectType) {
        if (objectType == 'Account') {
            return fetchMemberContext(recordId);
        } else if (objectType == 'CarePlan') {
            return fetchCarePlanContext(recordId);
        } else {
            return fetchGenericContext(recordId, objectType);
        }
    }
    
    /**
     * @description Fetches context for Member (Account) records
     * Uses Health Cloud objects: MemberPlan, CarePlan, ServiceAppointment
     */
    private static String fetchMemberContext(Id accountId) {
        Map<String, Object> context = new Map<String, Object>();
        
        // Get Account/Member details (Person Account fields for Health Cloud)
        Account member = [
            SELECT Id, Name, PersonBirthdate, PersonEmail, Phone, 
                   BillingStreet, BillingCity, BillingState, BillingPostalCode,
                   HealthCloudGA__Gender__pc, HealthCloudGA__PrimaryLanguage__pc
            FROM Account 
            WHERE Id = :accountId
            LIMIT 1
        ];
        context.put('member', member);
        
        // Get Member Plans (Health Cloud object)
        List<MemberPlan> memberPlans = [
            SELECT Id, Name, Product2.Name, EffectiveFrom, EffectiveTo, 
                   Status, MemberId, PayerId
            FROM MemberPlan 
            WHERE MemberId = :accountId
            ORDER BY EffectiveFrom DESC
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('memberPlans', memberPlans);
        
        // Get Care Plans (Health Cloud object)
        List<CarePlan> carePlans = [
            SELECT Id, Name, Status, StartDate, EndDate, AccountId
            FROM CarePlan 
            WHERE AccountId = :accountId
            ORDER BY StartDate DESC
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('carePlans', carePlans);
        
        // Get Service Appointments (Field Service / Health Cloud)
        List<ServiceAppointment> appointments = [
            SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime,
                   WorkType.Name, Description
            FROM ServiceAppointment 
            WHERE AccountId = :accountId
            AND SchedStartTime >= TODAY
            ORDER BY SchedStartTime ASC
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('upcomingAppointments', appointments);
        
        // Get Cases (recent interactions)
        List<Case> cases = [
            SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate
            FROM Case 
            WHERE AccountId = :accountId
            ORDER BY CreatedDate DESC
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('recentCases', cases);
        
        // Get Care Barriers if available (custom object)
        try {
            List<SObject> barriers = Database.query(
                'SELECT Id, Name, Status__c, Type__c FROM CareBarrier__c ' +
                'WHERE Account__c = :accountId LIMIT ' + MAX_RELATED_RECORDS
            );
            context.put('careBarriers', barriers);
        } catch (Exception e) {
            // CareBarrier might not exist in all orgs
        }
        
        return JSON.serializePretty(context);
    }
    
    /**
     * @description Fetches context for Care Plan records
     * Uses Health Cloud objects: CarePlan, Goal, CareRegisteredPatient
     */
    private static String fetchCarePlanContext(Id carePlanId) {
        Map<String, Object> context = new Map<String, Object>();
        
        // Get Care Plan details
        CarePlan carePlan = [
            SELECT Id, Name, Status, StartDate, EndDate, 
                   Account.Name, Account.PersonBirthdate,
                   OwnerId, Owner.Name
            FROM CarePlan 
            WHERE Id = :carePlanId
            LIMIT 1
        ];
        context.put('carePlan', carePlan);
        
        // Get Goals (Health Cloud object)
        List<Goal> goals = [
            SELECT Id, Name, Status, TargetDate, Progress, Priority,
                   Description, CreatedDate, LastModifiedDate
            FROM Goal 
            WHERE CarePlanId = :carePlanId
            ORDER BY Priority, TargetDate
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('goals', goals);
        
        // Get Care Registered Patients / Problems
        List<CareRegisteredPatient> problems = [
            SELECT Id, Name
            FROM CareRegisteredPatient 
            WHERE CareProgramId IN (SELECT Id FROM CareProgram WHERE CarePlanId = :carePlanId)
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('problems', problems);
        
        // Get Care Plan Template Items (Interventions) - custom object
        try {
            List<SObject> interventions = Database.query(
                'SELECT Id, Name, Status__c, Type__c, StartDate__c, EndDate__c ' +
                'FROM CarePlanTemplateItem__c WHERE CarePlan__c = :carePlanId LIMIT ' + MAX_RELATED_RECORDS
            );
            context.put('interventions', interventions);
        } catch (Exception e) {
            // Custom object might not exist
        }
        
        // Get Tasks related to Care Plan
        List<Task> tasks = [
            SELECT Id, Subject, Status, Priority, ActivityDate, Description
            FROM Task 
            WHERE WhatId = :carePlanId
            AND Status != 'Completed'
            ORDER BY ActivityDate ASC
            LIMIT :MAX_RELATED_RECORDS
        ];
        context.put('careTasks', tasks);
        
        return JSON.serializePretty(context);
    }
    
    /**
     * @description Fetches generic context for other object types
     */
    private static String fetchGenericContext(Id recordId, String objectType) {
        Map<String, Object> context = new Map<String, Object>();
        
        // Get the main record
        String query = 'SELECT Id, Name FROM ' + objectType + ' WHERE Id = :recordId LIMIT 1';
        List<SObject> records = Database.query(query);
        if (!records.isEmpty()) {
            context.put('record', records[0]);
        }
        
        return JSON.serializePretty(context);
    }
    
    /**
     * @description Gets drill-down details for a specific insight
     * @param recordId The source record ID
     * @param insightType The type of insight to drill into
     * @return DrillDownData with detailed information
     */
    @AuraEnabled
    public static DrillDownData getDrillDownData(Id recordId, String insightType) {
        DrillDownData data = new DrillDownData();
        data.insightType = insightType;
        
        String objectType = recordId.getSObjectType().getDescribe().getName();
        
        if (insightType == 'memberPlan') {
            data.records = fetchMemberPlanDetails(recordId);
        } else if (insightType == 'appointments') {
            data.records = fetchAppointmentDetails(recordId);
        } else if (insightType == 'goals') {
            data.records = fetchGoalDetails(recordId);
        } else if (insightType == 'careTasks') {
            data.records = fetchCareTaskDetails(recordId);
        }
        
        return data;
    }
    
    private static List<Map<String, Object>> fetchMemberPlanDetails(Id accountId) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        List<MemberPlan> plans = [
            SELECT Id, Name, Product2.Name, EffectiveFrom, EffectiveTo, 
                   Status, MemberId, PayerId, Payer.Name
            FROM MemberPlan 
            WHERE MemberId = :accountId
            ORDER BY EffectiveFrom DESC
            LIMIT 10
        ];
        for (MemberPlan plan : plans) {
            result.add(new Map<String, Object>{
                'id' => plan.Id,
                'name' => plan.Name,
                'productName' => plan.Product2?.Name,
                'effectiveFrom' => plan.EffectiveFrom,
                'effectiveTo' => plan.EffectiveTo,
                'status' => plan.Status,
                'payerName' => plan.Payer?.Name
            });
        }
        return result;
    }
    
    private static List<Map<String, Object>> fetchAppointmentDetails(Id accountId) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        List<ServiceAppointment> appointments = [
            SELECT Id, AppointmentNumber, Status, SchedStartTime, SchedEndTime,
                   WorkType.Name, Description, Address
            FROM ServiceAppointment 
            WHERE AccountId = :accountId
            ORDER BY SchedStartTime ASC
            LIMIT 10
        ];
        for (ServiceAppointment appt : appointments) {
            result.add(new Map<String, Object>{
                'id' => appt.Id,
                'appointmentNumber' => appt.AppointmentNumber,
                'status' => appt.Status,
                'startTime' => appt.SchedStartTime,
                'endTime' => appt.SchedEndTime,
                'workType' => appt.WorkType?.Name,
                'description' => appt.Description
            });
        }
        return result;
    }
    
    private static List<Map<String, Object>> fetchGoalDetails(Id carePlanId) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        List<Goal> goals = [
            SELECT Id, Name, Status, TargetDate, Progress, Priority,
                   Description, CreatedDate, LastModifiedDate
            FROM Goal 
            WHERE CarePlanId = :carePlanId
            ORDER BY Priority, TargetDate
            LIMIT 10
        ];
        for (Goal g : goals) {
            result.add(new Map<String, Object>{
                'id' => g.Id,
                'name' => g.Name,
                'status' => g.Status,
                'targetDate' => g.TargetDate,
                'progress' => g.Progress,
                'priority' => g.Priority,
                'description' => g.Description,
                'lastModified' => g.LastModifiedDate
            });
        }
        return result;
    }
    
    private static List<Map<String, Object>> fetchCareTaskDetails(Id carePlanId) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        List<Task> tasks = [
            SELECT Id, Subject, Status, Priority, ActivityDate, Description,
                   Owner.Name, CreatedDate
            FROM Task 
            WHERE WhatId = :carePlanId
            ORDER BY ActivityDate ASC
            LIMIT 10
        ];
        for (Task t : tasks) {
            result.add(new Map<String, Object>{
                'id' => t.Id,
                'subject' => t.Subject,
                'status' => t.Status,
                'priority' => t.Priority,
                'dueDate' => t.ActivityDate,
                'description' => t.Description,
                'ownerName' => t.Owner?.Name
            });
        }
        return result;
    }
    
    /**
     * @description Logs action taken by user (accept/modify/dismiss)
     * @param actionId The unique action identifier
     * @param actionStatus The status (accepted, modified, dismissed)
     * @param notes Optional notes from user
     */
    @AuraEnabled
    public static void logActionResponse(String actionId, String actionStatus, String notes) {
        // In production, this would create a record to track AI action responses
        System.debug('AHIS Action Response - ID: ' + actionId + ', Status: ' + actionStatus + ', Notes: ' + notes);
        
        // Could create a custom object record here:
        // AHIS_Action_Log__c log = new AHIS_Action_Log__c(
        //     Action_Id__c = actionId,
        //     Status__c = actionStatus,
        //     Notes__c = notes,
        //     User__c = UserInfo.getUserId()
        // );
        // insert log;
    }
    
    // ============ Response Classes ============
    
    public class AHISData {
        @AuraEnabled public Id recordId;
        @AuraEnabled public String objectType;
        @AuraEnabled public String userRole;
        @AuraEnabled public String summary;
        @AuraEnabled public List<OpenAIService.AHISInsight> insights;
        @AuraEnabled public List<OpenAIService.AHISAction> suggestedActions;
        @AuraEnabled public List<String> changesSinceLastVisit;
        @AuraEnabled public Datetime generatedAt;
        @AuraEnabled public Boolean success;
        @AuraEnabled public String errorMessage;
    }
    
    public class DrillDownData {
        @AuraEnabled public String insightType;
        @AuraEnabled public List<Map<String, Object>> records;
    }
}
