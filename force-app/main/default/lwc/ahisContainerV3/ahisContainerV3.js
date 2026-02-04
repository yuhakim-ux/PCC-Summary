import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAHISDataForPersona from '@salesforce/apex/AHISController.getAHISDataForPersona';
import logActionResponse from '@salesforce/apex/AHISController.logActionResponse';
import executeScheduleAction from '@salesforce/apex/AHISController.executeScheduleAction';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/**
 * AHIS Container V3 - With Persona Switcher for Demo
 * Shows "same intelligence, different experience" for 4 user roles
 */
export default class AhisContainerV3 extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectApiName;
    
    @track ahisData = {};
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';
    @track isExpanded = false;
    @track showDrillDown = false;
    @track drillDownType = '';
    @track drillDownTitle = '';
    
    // Persona switcher - V3 feature
    @track selectedPersona = 'CARE_MANAGER';
    
    // Persona options for dropdown
    get personaOptions() {
        return [
            { label: 'Care Manager', value: 'CARE_MANAGER' },
            { label: 'Contact Center Agent', value: 'CONTACT_CENTER_AGENT' },
            { label: 'Field Caregiver', value: 'FIELD_CAREGIVER' },
            { label: 'Supervisor', value: 'SUPERVISOR' }
        ];
    }
    
    // Role badge mapping
    roleBadgeMap = {
        'CONTACT_CENTER_AGENT': 'Contact Center Agent',
        'CARE_MANAGER': 'Care Manager',
        'FIELD_CAREGIVER': 'Field Caregiver',
        'SUPERVISOR': 'Supervisor',
        'DEFAULT': 'Default View'
    };
    
    // Role descriptions for the UI
    roleDescriptions = {
        'CONTACT_CENTER_AGENT': 'Quick reference for member calls',
        'CARE_MANAGER': 'Clinical trends & intervention priorities',
        'FIELD_CAREGIVER': 'Pre-visit preparation & safety focus',
        'SUPERVISOR': 'Risk distribution & team workload'
    };
    
    connectedCallback() {
        this.loadAHISData();
    }
    
    /**
     * Load AHIS data based on selected persona
     */
    async loadAHISData() {
        if (!this.recordId) {
            this.hasError = true;
            this.errorMessage = 'No record ID provided';
            this.isLoading = false;
            return;
        }
        
        this.isLoading = true;
        this.hasError = false;
        
        try {
            // Pass the selected persona to get role-specific data
            const data = await getAHISDataForPersona({ 
                recordId: this.recordId,
                userRole: this.selectedPersona 
            });
            
            if (data.success) {
                this.ahisData = data;
                this.hasError = false;
            } else {
                this.hasError = true;
                this.errorMessage = data.errorMessage || 'Failed to generate intelligence';
            }
        } catch (error) {
            console.error('Error loading AHIS data:', error);
            this.hasError = true;
            this.errorMessage = error.body?.message || 'An unexpected error occurred';
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Handle persona change from dropdown
     */
    handlePersonaChange(event) {
        this.selectedPersona = event.detail.value;
        this.loadAHISData();
    }
    
    // Computed properties
    get showContent() {
        return !this.isLoading && !this.hasError && this.ahisData.summary;
    }
    
    get userRole() {
        return this.selectedPersona;
    }
    
    get userRoleBadge() {
        return this.roleBadgeMap[this.selectedPersona];
    }
    
    get roleDescription() {
        return this.roleDescriptions[this.selectedPersona] || '';
    }
    
    get expandIcon() {
        return this.isExpanded ? 'utility:contract_alt' : 'utility:expand_alt';
    }
    
    get expandAltText() {
        return this.isExpanded ? 'Collapse' : 'Expand';
    }
    
    get contentClass() {
        return this.isExpanded 
            ? 'ahis-content ahis-content-expanded' 
            : 'ahis-content';
    }
    
    get formattedTimestamp() {
        if (!this.ahisData.generatedAt) return '';
        const date = new Date(this.ahisData.generatedAt);
        return date.toLocaleString();
    }
    
    // Event handlers
    handleRefresh() {
        this.loadAHISData();
    }
    
    handleExpandToggle() {
        this.isExpanded = !this.isExpanded;
    }
    
    handleDrillDown(event) {
        const { insightType, insightTitle } = event.detail;
        this.drillDownType = insightType;
        this.drillDownTitle = insightTitle;
        this.showDrillDown = true;
    }
    
    handleCloseDrillDown() {
        this.showDrillDown = false;
        this.drillDownType = '';
        this.drillDownTitle = '';
    }
    
    async handleActionResponse(event) {
        const { actionId, status, notes } = event.detail;
        
        try {
            await logActionResponse({ 
                actionId: actionId, 
                actionStatus: status, 
                notes: notes 
            });
            
            // Update local state
            this.updateActionStatus(actionId, status);
            
            // Show success toast
            const statusLabel = status === 'accepted' ? 'accepted' : 
                               status === 'modified' ? 'modified' : 'dismissed';
            
            this.dispatchEvent(new ShowToastEvent({
                title: 'Action ' + statusLabel,
                message: 'Your response has been recorded.',
                variant: 'success'
            }));
            
        } catch (error) {
            console.error('Error logging action response:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Failed to record action response.',
                variant: 'error'
            }));
        }
    }
    
    /**
     * Handle schedule action - creates an Event record for follow-up scheduling
     */
    async handleScheduleAction(event) {
        const { actionId, title, description } = event.detail;
        
        try {
            // Call Apex to create the Event
            const eventId = await executeScheduleAction({
                recordId: this.recordId,
                actionId: actionId,
                subject: title,
                description: description
            });
            
            // Update local action status
            this.updateActionStatus(actionId, 'accepted');
            
            // Show success toast with navigation option
            this.dispatchEvent(new ShowToastEvent({
                title: 'Follow-up Scheduled',
                message: 'Event has been created successfully.',
                variant: 'success',
                mode: 'dismissable'
            }));
            
            // Navigate to the created event
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: eventId,
                    objectApiName: 'Event',
                    actionName: 'view'
                }
            });
            
        } catch (error) {
            console.error('Error scheduling follow-up:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body?.message || 'Failed to schedule follow-up. Please try again.',
                variant: 'error'
            }));
        }
    }
    
    /**
     * Helper to update action status in local state
     */
    updateActionStatus(actionId, status) {
        if (this.ahisData.suggestedActions) {
            this.ahisData = {
                ...this.ahisData,
                suggestedActions: this.ahisData.suggestedActions.map(action => {
                    if (action.actionId === actionId || action.id === actionId) {
                        return { ...action, status: status };
                    }
                    return action;
                })
            };
        }
    }
}
