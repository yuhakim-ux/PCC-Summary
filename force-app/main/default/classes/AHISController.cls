/**
 * @description Main controller for AHIS (Agentic Health Intelligence Surface) component
 * Hybrid version - uses real OpenAI with context data from the org
 */
public with sharing class AHISController {
    
    // Toggle between mock data and OpenAI
    private static final Boolean USE_OPENAI = false;
    
    /**
     * @description Gets AHIS data for a record including AI-generated summary
     * @param recordId The ID of the record to analyze
     * @return AHISData containing summary, insights, and actions
     */
    @AuraEnabled(cacheable=false)
    public static AHISData getAHISData(Id recordId) {
        try {
            String userRole = getCurrentUserRole();
            
            if (USE_OPENAI) {
                // Try to use OpenAI with real or mock context
                return getAHISDataWithOpenAI(recordId, userRole);
            } else {
                // Fallback to pure mock data
                return AHISMockDataService.getMockAHISData(recordId, userRole);
            }
        } catch (Exception e) {
            System.debug('AHIS Error: ' + e.getMessage() + '\n' + e.getStackTraceString());
            AHISData errorData = new AHISData();
            errorData.success = false;
            errorData.errorMessage = e.getMessage();
            return errorData;
        }
    }
    
    /**
     * @description Gets AHIS data using OpenAI for generation
     */
    private static AHISData getAHISDataWithOpenAI(Id recordId, String userRole) {
        String objectType = recordId.getSObjectType().getDescribe().getName();
        
        // Fetch context data
        String contextData = fetchContextData(recordId, objectType);
        
        // Generate AI summary using OpenAI
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
    }
    
    /**
     * @description Fetches context data for the given record
     */
    private static String fetchContextData(Id recordId, String objectType) {
        Map<String, Object> context = new Map<String, Object>();
        
        try {
            if (objectType == 'Account') {
                context = fetchAccountContext(recordId);
            } else if (objectType == 'CarePlan') {
                context = fetchCarePlanContext(recordId);
            } else if (objectType == 'Case') {
                context = fetchCaseContext(recordId);
            } else {
                context = fetchGenericContext(recordId, objectType);
            }
        } catch (Exception e) {
            System.debug('Error fetching context: ' + e.getMessage());
            // Return sample context if real data fetch fails
            context = getSampleHealthContext();
        }
        
        return JSON.serializePretty(context);
    }
    
    /**
     * @description Fetches context for Account records
     */
    private static Map<String, Object> fetchAccountContext(Id accountId) {
        Map<String, Object> context = new Map<String, Object>();
        
        // Get Account details
        Account acct = [
            SELECT Id, Name, Phone, BillingCity, BillingState,
                   Type, Industry, Description
            FROM Account 
            WHERE Id = :accountId
            LIMIT 1
        ];
        context.put('account', acct);
        
        // Get related Cases
        List<Case> cases = [
            SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate
            FROM Case 
            WHERE AccountId = :accountId
            ORDER BY CreatedDate DESC
            LIMIT 5
        ];
        context.put('recentCases', cases);
        
        // Get related Tasks
        List<Task> tasks = [
            SELECT Id, Subject, Status, Priority, ActivityDate
            FROM Task 
            WHERE WhatId = :accountId
            ORDER BY ActivityDate DESC
            LIMIT 5
        ];
        context.put('tasks', tasks);
        
        // Try to get CarePlans if available
        try {
            List<SObject> carePlans = Database.query(
                'SELECT Id, Name, Status, StartDate, EndDate FROM CarePlan ' +
                'WHERE ParticipantId = :accountId OR CaseId IN ' +
                '(SELECT Id FROM Case WHERE AccountId = :accountId) ' +
                'ORDER BY StartDate DESC LIMIT 5'
            );
            context.put('carePlans', carePlans);
        } catch (Exception e) {
            // CarePlan might not be accessible
        }
        
        // Try to get MemberPlans
        try {
            List<SObject> memberPlans = Database.query(
                'SELECT Id, Name, Status FROM MemberPlan ' +
                'WHERE MemberId = :accountId LIMIT 5'
            );
            context.put('memberPlans', memberPlans);
        } catch (Exception e) {
            // MemberPlan might not be accessible
        }
        
        return context;
    }
    
    /**
     * @description Fetches context for CarePlan records
     */
    private static Map<String, Object> fetchCarePlanContext(Id carePlanId) {
        Map<String, Object> context = new Map<String, Object>();
        
        // Get CarePlan details
        CarePlan cp = [
            SELECT Id, Name, Status, StartDate, EndDate, Description,
                   ParticipantId, CaseId
            FROM CarePlan 
            WHERE Id = :carePlanId
            LIMIT 1
        ];
        context.put('carePlan', cp);
        
        // Get related participant (Account)
        if (cp.ParticipantId != null) {
            Account participant = [
                SELECT Id, Name, Phone, BillingCity, BillingState
                FROM Account WHERE Id = :cp.ParticipantId LIMIT 1
            ];
            context.put('participant', participant);
        }
        
        // Get Tasks related to CarePlan
        List<Task> tasks = [
            SELECT Id, Subject, Status, Priority, ActivityDate, Description
            FROM Task 
            WHERE WhatId = :carePlanId
            ORDER BY ActivityDate ASC
            LIMIT 5
        ];
        context.put('careTasks', tasks);
        
        // Try to get CarePlanGoals if available
        try {
            List<SObject> goals = Database.query(
                'SELECT Id, Name FROM HealthCloudGA__CarePlanGoal__c ' +
                'WHERE HealthCloudGA__CarePlan__c = :carePlanId LIMIT 5'
            );
            context.put('goals', goals);
        } catch (Exception e) {
            // Goals might not be accessible
        }
        
        return context;
    }
    
    /**
     * @description Fetches context for Case records
     */
    private static Map<String, Object> fetchCaseContext(Id caseId) {
        Map<String, Object> context = new Map<String, Object>();
        
        Case c = [
            SELECT Id, CaseNumber, Subject, Status, Priority, Description,
                   Account.Name, Contact.Name, CreatedDate
            FROM Case 
            WHERE Id = :caseId
            LIMIT 1
        ];
        context.put('case', c);
        
        // Get related Tasks
        List<Task> tasks = [
            SELECT Id, Subject, Status, Priority, ActivityDate
            FROM Task 
            WHERE WhatId = :caseId
            ORDER BY ActivityDate DESC
            LIMIT 5
        ];
        context.put('tasks', tasks);
        
        return context;
    }
    
    /**
     * @description Fetches generic context for other object types
     */
    private static Map<String, Object> fetchGenericContext(Id recordId, String objectType) {
        Map<String, Object> context = new Map<String, Object>();
        
        try {
            String query = 'SELECT Id, Name FROM ' + String.escapeSingleQuotes(objectType) + ' WHERE Id = :recordId LIMIT 1';
            List<SObject> records = Database.query(query);
            if (!records.isEmpty()) {
                context.put('record', records[0]);
            }
        } catch (Exception e) {
            context.put('recordId', recordId);
            context.put('objectType', objectType);
        }
        
        return context;
    }
    
    /**
     * @description Returns sample health context for demo purposes
     */
    private static Map<String, Object> getSampleHealthContext() {
        Map<String, Object> context = new Map<String, Object>();
        
        context.put('member', new Map<String, Object>{
            'name' => 'Maria Santos',
            'age' => 67,
            'gender' => 'Female',
            'primaryLanguage' => 'English',
            'city' => 'San Francisco',
            'state' => 'CA'
        });
        
        context.put('memberPlans', new List<Map<String, Object>>{
            new Map<String, Object>{
                'name' => 'Medicare Advantage HMO',
                'status' => 'Active',
                'effectiveFrom' => '2024-01-01',
                'effectiveTo' => '2024-12-31'
            }
        });
        
        context.put('conditions', new List<String>{
            'Type 2 Diabetes (controlled)',
            'Hypertension (under treatment)',
            'Mild Osteoarthritis'
        });
        
        context.put('medications', new List<String>{
            'Metformin 500mg twice daily',
            'Lisinopril 10mg daily',
            'Aspirin 81mg daily'
        });
        
        context.put('recentActivity', new List<String>{
            'Lab work completed Jan 28 - A1C: 7.4',
            'Cardiology follow-up scheduled Feb 15',
            'Pharmacy filled Metformin Jan 25'
        });
        
        context.put('careTeam', new List<Map<String, Object>>{
            new Map<String, Object>{ 'role' => 'PCP', 'name' => 'Dr. Rebecca Chen' },
            new Map<String, Object>{ 'role' => 'Care Manager', 'name' => 'Sarah Johnson, RN' },
            new Map<String, Object>{ 'role' => 'Cardiologist', 'name' => 'Dr. James Wilson' }
        });
        
        return context;
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
        }
        
        // Check role name as fallback
        if (roleName != null) {
            if (roleName.containsIgnoreCase('Contact Center')) return 'CONTACT_CENTER_AGENT';
            if (roleName.containsIgnoreCase('Care Manager')) return 'CARE_MANAGER';
        }
        
        // Default to Care Manager for demo purposes
        return 'CARE_MANAGER';
    }
    
    /**
     * @description Gets drill-down details for a specific insight
     * @param recordId The source record ID
     * @param insightType The type of insight to drill into (Clinical, Social, Operational, Compliance)
     * @return DrillDownData with detailed information from real records
     */
    @AuraEnabled
    public static DrillDownData getDrillDownData(Id recordId, String insightType) {
        DrillDownData data = new DrillDownData();
        data.insightType = insightType;
        
        try {
            // Map insight categories to real record queries
            if (insightType == 'Clinical' || insightType == 'Social') {
                // Clinical and Social insights map to Tasks
                data.records = queryRelatedTasks(recordId);
            } else if (insightType == 'Operational') {
                // Operational insights map to Events (appointments, follow-ups)
                data.records = queryRelatedEvents(recordId);
            } else if (insightType == 'Compliance') {
                // Compliance insights map to Cases
                data.records = queryRelatedCases(recordId);
            } else {
                // Default: return all related records
                data.records = queryAllRelatedRecords(recordId);
            }
        } catch (Exception e) {
            System.debug('Error in getDrillDownData: ' + e.getMessage());
            // Fallback to mock data if real query fails
            return AHISMockDataService.getMockDrillDownData(insightType);
        }
        
        return data;
    }
    
    /**
     * @description Queries Tasks related to a record
     */
    private static List<Map<String, Object>> queryRelatedTasks(Id recordId) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        for (Task t : [
            SELECT Id, Subject, Status, Priority, ActivityDate, Description, Owner.Name, CreatedDate
            FROM Task 
            WHERE WhatId = :recordId 
            ORDER BY ActivityDate DESC NULLS LAST
            LIMIT 10
        ]) {
            results.add(new Map<String, Object>{
                'id' => t.Id,
                'name' => t.Subject,
                'subject' => t.Subject,
                'status' => t.Status,
                'priority' => t.Priority,
                'dueDate' => t.ActivityDate,
                'description' => t.Description,
                'ownerName' => t.Owner.Name,
                'lastModified' => t.CreatedDate
            });
        }
        
        return results;
    }
    
    /**
     * @description Queries Events related to a record
     */
    private static List<Map<String, Object>> queryRelatedEvents(Id recordId) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        for (Event e : [
            SELECT Id, Subject, StartDateTime, EndDateTime, Description, Location, 
                   Owner.Name, Type, CreatedDate
            FROM Event 
            WHERE WhatId = :recordId 
            ORDER BY StartDateTime DESC
            LIMIT 10
        ]) {
            String status = e.StartDateTime > Datetime.now() ? 'Scheduled' : 'Completed';
            results.add(new Map<String, Object>{
                'id' => e.Id,
                'name' => e.Subject,
                'subject' => e.Subject,
                'status' => status,
                'startTime' => e.StartDateTime,
                'endTime' => e.EndDateTime,
                'description' => e.Description,
                'location' => e.Location,
                'workType' => e.Type,
                'ownerName' => e.Owner.Name,
                'lastModified' => e.CreatedDate
            });
        }
        
        return results;
    }
    
    /**
     * @description Queries Cases related to a record (Account)
     */
    private static List<Map<String, Object>> queryRelatedCases(Id recordId) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        for (Case c : [
            SELECT Id, CaseNumber, Subject, Status, Priority, Description, 
                   Owner.Name, CreatedDate, ClosedDate
            FROM Case 
            WHERE AccountId = :recordId 
            ORDER BY CreatedDate DESC
            LIMIT 10
        ]) {
            results.add(new Map<String, Object>{
                'id' => c.Id,
                'name' => c.CaseNumber + ': ' + c.Subject,
                'caseNumber' => c.CaseNumber,
                'subject' => c.Subject,
                'status' => c.Status,
                'priority' => c.Priority,
                'description' => c.Description,
                'ownerName' => c.Owner.Name,
                'lastModified' => c.CreatedDate
            });
        }
        
        return results;
    }
    
    /**
     * @description Queries all related records (Tasks, Events, Cases)
     */
    private static List<Map<String, Object>> queryAllRelatedRecords(Id recordId) {
        List<Map<String, Object>> results = new List<Map<String, Object>>();
        
        // Add Tasks
        results.addAll(queryRelatedTasks(recordId));
        
        // Add Events
        results.addAll(queryRelatedEvents(recordId));
        
        // Add Cases (only for Account records)
        String objectType = recordId.getSObjectType().getDescribe().getName();
        if (objectType == 'Account') {
            results.addAll(queryRelatedCases(recordId));
        }
        
        return results;
    }
    
    /**
     * @description Logs action taken by user (accept/modify/dismiss)
     * @param actionId The unique action identifier
     * @param actionStatus The status (accepted, modified, dismissed)
     * @param notes Optional notes from user
     */
    @AuraEnabled
    public static void logActionResponse(String actionId, String actionStatus, String notes) {
        // Log the action response
        System.debug('AHIS Action Response - ID: ' + actionId + ', Status: ' + actionStatus + ', Notes: ' + notes);
    }
    
    /**
     * @description Executes a schedule action by creating an Event record
     * @param recordId The related record ID (Account, CarePlan, etc.)
     * @param actionId The action identifier for logging
     * @param subject The subject/title for the scheduled event
     * @param description The description for the event
     * @return The ID of the created Event record
     */
    @AuraEnabled
    public static Id executeScheduleAction(Id recordId, String actionId, String subject, String description) {
        try {
            Event newEvent = new Event();
            newEvent.WhatId = recordId;
            newEvent.Subject = subject;
            newEvent.Description = description;
            newEvent.StartDateTime = Datetime.now().addDays(7); // Default 1 week out
            newEvent.EndDateTime = Datetime.now().addDays(7).addHours(1); // 1 hour duration
            newEvent.OwnerId = UserInfo.getUserId();
            
            insert newEvent;
            
            // Log the action
            System.debug('AHIS Schedule Action - Created Event: ' + newEvent.Id + ' for action: ' + actionId);
            
            return newEvent.Id;
        } catch (Exception e) {
            System.debug('Error creating scheduled event: ' + e.getMessage());
            throw new AuraHandledException('Failed to schedule follow-up: ' + e.getMessage());
        }
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
