/**
 * @description Service class for OpenAI API integration
 * Health Cloud Version - Handles GenAI summary generation for AHIS component
 * 
 * REQUIREMENTS:
 * - Named Credential "OpenAI" configured with API key
 */
public with sharing class OpenAIService {
    
    private static final String NAMED_CREDENTIAL = 'callout:OpenAI';
    private static final String COMPLETION_ENDPOINT = '/v1/chat/completions';
    private static final String DEFAULT_MODEL = 'gpt-4o-mini';
    private static final Integer MAX_TOKENS = 1000;
    
    /**
     * @description Generates a role-aware summary using OpenAI
     * @param context The data context to summarize
     * @param userRole The current user's role
     * @param entityType The type of entity being summarized
     * @return AHISSummaryResponse containing summary, insights, and actions
     */
    public static AHISSummaryResponse generateSummary(String context, String userRole, String entityType) {
        try {
            String systemPrompt = getSystemPrompt(userRole, entityType);
            String userPrompt = buildUserPrompt(context, userRole);
            
            HttpRequest req = buildRequest(systemPrompt, userPrompt);
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                return parseResponse(res.getBody());
            } else {
                System.debug('OpenAI API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
                return getErrorResponse('API Error: ' + res.getStatusCode());
            }
        } catch (Exception e) {
            System.debug('OpenAI Service Exception: ' + e.getMessage());
            return getErrorResponse(e.getMessage());
        }
    }
    
    /**
     * @description Builds the HTTP request for OpenAI API
     */
    private static HttpRequest buildRequest(String systemPrompt, String userPrompt) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + COMPLETION_ENDPOINT);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(60000);
        
        Map<String, Object> requestBody = new Map<String, Object>{
            'model' => DEFAULT_MODEL,
            'messages' => new List<Map<String, String>>{
                new Map<String, String>{ 'role' => 'system', 'content' => systemPrompt },
                new Map<String, String>{ 'role' => 'user', 'content' => userPrompt }
            },
            'max_tokens' => MAX_TOKENS,
            'temperature' => 0.7,
            'response_format' => new Map<String, String>{ 'type' => 'json_object' }
        };
        
        req.setBody(JSON.serialize(requestBody));
        return req;
    }
    
    /**
     * @description Gets the system prompt based on user role and entity type
     */
    private static String getSystemPrompt(String userRole, String entityType) {
        String basePrompt = 'You are a healthcare intelligence assistant helping Salesforce Health Cloud users. ';
        basePrompt += 'Analyze the provided patient/member data and generate insights. ';
        basePrompt += 'Always respond with valid JSON in this exact format: ';
        basePrompt += '{"summary": "2-3 sentence overview", "insights": [{"title": "string", "description": "string", "riskCategory": "Clinical|Social|Operational|Compliance", "confidence": "High|Medium|Low", "sourceRecords": ["Record Name"]}], "suggestedActions": [{"title": "string", "description": "string", "actionType": "schedule|escalate|review|outreach|update", "priority": "High|Medium|Low"}], "changesSinceLastVisit": ["string"]}';
        
        if (userRole == 'CONTACT_CENTER_AGENT') {
            basePrompt += '\n\nYou are assisting a Contact Center Agent. Focus on: ';
            basePrompt += '- Quick, clear summaries for phone conversations ';
            basePrompt += '- Member plan details and coverage information ';
            basePrompt += '- Upcoming appointments and scheduling needs ';
            basePrompt += '- When to escalate to a Care Manager ';
            basePrompt += '- Use simple, non-clinical language';
        } else if (userRole == 'CARE_MANAGER') {
            basePrompt += '\n\nYou are assisting a Care Manager. Focus on: ';
            basePrompt += '- Care plan progress and goal achievement ';
            basePrompt += '- Clinical trends and risk indicators ';
            basePrompt += '- Intervention effectiveness ';
            basePrompt += '- Prioritization of care tasks ';
            basePrompt += '- Use clinical terminology appropriately';
        }
        
        if (entityType == 'Account' || entityType == 'Member') {
            basePrompt += '\n\nEntity context: Member/Patient record with related health data.';
        } else if (entityType == 'CarePlan') {
            basePrompt += '\n\nEntity context: Care Plan with goals, problems, and interventions.';
        }
        
        return basePrompt;
    }
    
    /**
     * @description Builds the user prompt with context data
     */
    private static String buildUserPrompt(String context, String userRole) {
        String prompt = 'Analyze the following healthcare data and provide insights:\n\n';
        prompt += context;
        prompt += '\n\nGenerate a role-appropriate summary, key insights with risk categories, and suggested next actions.';
        return prompt;
    }
    
    /**
     * @description Parses the OpenAI API response
     */
    private static AHISSummaryResponse parseResponse(String responseBody) {
        Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
        List<Object> choices = (List<Object>) responseMap.get('choices');
        
        if (choices != null && !choices.isEmpty()) {
            Map<String, Object> choice = (Map<String, Object>) choices[0];
            Map<String, Object> message = (Map<String, Object>) choice.get('message');
            String content = (String) message.get('content');
            
            // Parse the JSON content from the AI response
            Map<String, Object> aiResponse = (Map<String, Object>) JSON.deserializeUntyped(content);
            
            AHISSummaryResponse response = new AHISSummaryResponse();
            response.success = true;
            response.summary = (String) aiResponse.get('summary');
            response.insights = parseInsights((List<Object>) aiResponse.get('insights'));
            response.suggestedActions = parseActions((List<Object>) aiResponse.get('suggestedActions'));
            response.changesSinceLastVisit = parseStringList((List<Object>) aiResponse.get('changesSinceLastVisit'));
            response.generatedAt = Datetime.now();
            
            return response;
        }
        
        return getErrorResponse('No response from AI');
    }
    
    /**
     * @description Parses insights from AI response
     */
    private static List<AHISInsight> parseInsights(List<Object> insightsData) {
        List<AHISInsight> insights = new List<AHISInsight>();
        
        if (insightsData != null) {
            for (Object item : insightsData) {
                Map<String, Object> data = (Map<String, Object>) item;
                AHISInsight insight = new AHISInsight();
                insight.title = (String) data.get('title');
                insight.description = (String) data.get('description');
                insight.riskCategory = (String) data.get('riskCategory');
                insight.confidence = (String) data.get('confidence');
                insight.sourceRecords = parseStringList((List<Object>) data.get('sourceRecords'));
                insights.add(insight);
            }
        }
        
        return insights;
    }
    
    /**
     * @description Parses suggested actions from AI response
     */
    private static List<AHISAction> parseActions(List<Object> actionsData) {
        List<AHISAction> actions = new List<AHISAction>();
        
        if (actionsData != null) {
            for (Object item : actionsData) {
                Map<String, Object> data = (Map<String, Object>) item;
                AHISAction action = new AHISAction();
                action.title = (String) data.get('title');
                action.description = (String) data.get('description');
                action.actionType = (String) data.get('actionType');
                action.priority = (String) data.get('priority');
                action.actionId = generateActionId();
                actions.add(action);
            }
        }
        
        return actions;
    }
    
    /**
     * @description Parses a list of strings from JSON
     */
    private static List<String> parseStringList(List<Object> items) {
        List<String> result = new List<String>();
        if (items != null) {
            for (Object item : items) {
                result.add(String.valueOf(item));
            }
        }
        return result;
    }
    
    /**
     * @description Generates a unique action ID
     */
    private static String generateActionId() {
        return 'ACT-' + String.valueOf(Datetime.now().getTime()) + '-' + String.valueOf(Math.random()).substring(2, 6);
    }
    
    /**
     * @description Returns an error response
     */
    private static AHISSummaryResponse getErrorResponse(String errorMessage) {
        AHISSummaryResponse response = new AHISSummaryResponse();
        response.success = false;
        response.errorMessage = errorMessage;
        response.summary = 'Unable to generate summary. Please try again.';
        response.insights = new List<AHISInsight>();
        response.suggestedActions = new List<AHISAction>();
        response.changesSinceLastVisit = new List<String>();
        response.generatedAt = Datetime.now();
        return response;
    }
    
    // ============ Inner Classes for Response Structure ============
    
    public class AHISSummaryResponse {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String errorMessage;
        @AuraEnabled public String summary;
        @AuraEnabled public List<AHISInsight> insights;
        @AuraEnabled public List<AHISAction> suggestedActions;
        @AuraEnabled public List<String> changesSinceLastVisit;
        @AuraEnabled public Datetime generatedAt;
    }
    
    public class AHISInsight {
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public String riskCategory;
        @AuraEnabled public String confidence;
        @AuraEnabled public List<String> sourceRecords;
    }
    
    public class AHISAction {
        @AuraEnabled public String actionId;
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public String actionType;
        @AuraEnabled public String priority;
        @AuraEnabled public String status; // pending, accepted, modified, dismissed
    }
}
