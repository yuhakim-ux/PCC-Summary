/**
 * @description Service class for OpenAI API integration
 * Handles GenAI summary generation for AHIS component
 */
public with sharing class OpenAIService {
    
    private static final String OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    private static final String DEFAULT_MODEL = 'gpt-4o-mini';
    private static final Integer MAX_TOKENS = 1500;
    
    /**
     * @description Gets the OpenAI API key from Custom Metadata
     */
    private static String getApiKey() {
        try {
            AHIS_Config__mdt config = [
                SELECT OpenAI_API_Key__c, OpenAI_Model__c 
                FROM AHIS_Config__mdt 
                WHERE DeveloperName = 'AHIS_Default' 
                LIMIT 1
            ];
            return config.OpenAI_API_Key__c;
        } catch (Exception e) {
            System.debug('Error getting API key: ' + e.getMessage());
            return null;
        }
    }
    
    /**
     * @description Generates a role-aware summary using OpenAI
     * @param context The data context to summarize
     * @param userRole The current user's role
     * @param entityType The type of entity being summarized
     * @return AHISSummaryResponse containing summary, insights, and actions
     */
    public static AHISSummaryResponse generateSummary(String context, String userRole, String entityType) {
        try {
            // Get API key from Custom Metadata
            String apiKey = getApiKey();
            if (String.isBlank(apiKey)) {
                return getErrorResponse('OpenAI API key not configured. Go to Setup > Custom Metadata Types > AHIS Config > AHIS_Default and add your API key.');
            }
            
            String systemPrompt = getSystemPrompt(userRole, entityType);
            String userPrompt = buildUserPrompt(context, userRole);
            
            HttpRequest req = buildRequest(systemPrompt, userPrompt, apiKey);
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            System.debug('OpenAI Response Status: ' + res.getStatusCode());
            
            if (res.getStatusCode() == 200) {
                return parseResponse(res.getBody());
            } else {
                System.debug('OpenAI API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
                return getErrorResponse('API Error: ' + res.getStatusCode() + ' - ' + res.getStatus());
            }
        } catch (System.CalloutException e) {
            System.debug('OpenAI Callout Exception: ' + e.getMessage());
            if (e.getMessage().contains('Unauthorized endpoint')) {
                return getErrorResponse('Please configure Remote Site Setting for api.openai.com in Setup');
            }
            return getErrorResponse('Callout Error: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('OpenAI Service Exception: ' + e.getMessage());
            return getErrorResponse(e.getMessage());
        }
    }
    
    /**
     * @description Builds the HTTP request for OpenAI API
     */
    private static HttpRequest buildRequest(String systemPrompt, String userPrompt, String apiKey) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(OPENAI_ENDPOINT);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Authorization', 'Bearer ' + apiKey);
        req.setTimeout(60000); // 60 second timeout
        
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
        basePrompt += 'Analyze the provided patient/member data and generate actionable insights. ';
        basePrompt += 'Always respond with valid JSON in this exact format:\n';
        basePrompt += '{\n';
        basePrompt += '  "summary": "2-3 sentence overview of the member/patient status",\n';
        basePrompt += '  "insights": [\n';
        basePrompt += '    {\n';
        basePrompt += '      "title": "Brief insight title",\n';
        basePrompt += '      "description": "Detailed description of the insight",\n';
        basePrompt += '      "riskCategory": "Clinical|Social|Operational|Compliance",\n';
        basePrompt += '      "confidence": "High|Medium|Low",\n';
        basePrompt += '      "sourceRecords": ["Record names that support this insight"]\n';
        basePrompt += '    }\n';
        basePrompt += '  ],\n';
        basePrompt += '  "suggestedActions": [\n';
        basePrompt += '    {\n';
        basePrompt += '      "title": "Action title",\n';
        basePrompt += '      "description": "What to do and why",\n';
        basePrompt += '      "actionType": "schedule|escalate|review|outreach|update",\n';
        basePrompt += '      "priority": "High|Medium|Low"\n';
        basePrompt += '    }\n';
        basePrompt += '  ],\n';
        basePrompt += '  "changesSinceLastVisit": ["List of notable recent changes"]\n';
        basePrompt += '}\n\n';
        
        if (userRole == 'CONTACT_CENTER_AGENT') {
            basePrompt += 'You are assisting a Contact Center Agent. Focus on:\n';
            basePrompt += '- Quick, clear summaries for phone conversations\n';
            basePrompt += '- Member plan details and coverage information\n';
            basePrompt += '- Upcoming appointments and scheduling needs\n';
            basePrompt += '- When to escalate to a Care Manager\n';
            basePrompt += '- Use simple, non-clinical language\n';
        } else if (userRole == 'CARE_MANAGER') {
            basePrompt += 'You are assisting a Care Manager. Focus on:\n';
            basePrompt += '- Care plan progress and goal achievement\n';
            basePrompt += '- Clinical trends and risk indicators\n';
            basePrompt += '- Intervention effectiveness\n';
            basePrompt += '- Prioritization of care tasks\n';
            basePrompt += '- Social determinants of health\n';
            basePrompt += '- Use clinical terminology appropriately\n';
        }
        
        if (entityType == 'Account') {
            basePrompt += '\nContext: Member/Patient record - provide comprehensive health overview.';
        } else if (entityType == 'CarePlan') {
            basePrompt += '\nContext: Care Plan record - focus on goals, progress, and interventions.';
        } else if (entityType == 'Case') {
            basePrompt += '\nContext: Case/Service request - focus on resolution and follow-up.';
        }
        
        return basePrompt;
    }
    
    /**
     * @description Builds the user prompt with context data
     */
    private static String buildUserPrompt(String context, String userRole) {
        String prompt = 'Analyze the following healthcare data and provide insights for a ' + 
                       (userRole == 'CONTACT_CENTER_AGENT' ? 'Contact Center Agent' : 'Care Manager') + 
                       ':\n\n';
        prompt += context;
        prompt += '\n\nGenerate a role-appropriate summary, 3-4 key insights with risk categories, ';
        prompt += 'and 2-3 suggested next actions. Be specific and actionable.';
        return prompt;
    }
    
    /**
     * @description Parses the OpenAI API response
     */
    private static AHISSummaryResponse parseResponse(String responseBody) {
        try {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            List<Object> choices = (List<Object>) responseMap.get('choices');
            
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> choice = (Map<String, Object>) choices[0];
                Map<String, Object> message = (Map<String, Object>) choice.get('message');
                String content = (String) message.get('content');
                
                System.debug('OpenAI Content: ' + content);
                
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
            
            return getErrorResponse('No response content from AI');
        } catch (Exception e) {
            System.debug('Parse Error: ' + e.getMessage());
            return getErrorResponse('Failed to parse AI response: ' + e.getMessage());
        }
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
                action.status = 'pending';
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
                if (item != null) {
                    result.add(String.valueOf(item));
                }
            }
        }
        return result;
    }
    
    /**
     * @description Generates a unique action ID
     */
    private static String generateActionId() {
        return 'ACT-' + String.valueOf(Datetime.now().getTime()) + '-' + 
               String.valueOf(Math.abs(Crypto.getRandomInteger())).substring(0, 4);
    }
    
    /**
     * @description Returns an error response
     */
    private static AHISSummaryResponse getErrorResponse(String errorMessage) {
        AHISSummaryResponse response = new AHISSummaryResponse();
        response.success = false;
        response.errorMessage = errorMessage;
        response.summary = 'Unable to generate AI summary: ' + errorMessage;
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
        @AuraEnabled public String status;
    }
}
