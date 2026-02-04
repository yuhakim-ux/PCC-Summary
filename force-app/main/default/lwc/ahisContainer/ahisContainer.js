import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import getAHISData from '@salesforce/apex/AHISController.getAHISData';
import getCurrentUserRole from '@salesforce/apex/AHISController.getCurrentUserRole';
import logActionResponse from '@salesforce/apex/AHISController.logActionResponse';
import executeScheduleAction from '@salesforce/apex/AHISController.executeScheduleAction';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AhisContainer extends NavigationMixin(LightningElement) {
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
    
    userRole = 'DEFAULT';
    
    // Role badge mapping
    roleBadgeMap = {
        'CONTACT_CENTER_AGENT': 'Contact Center',
        'CARE_MANAGER': 'Care Manager',
        'FIELD_CAREGIVER': 'Field Caregiver',
        'SUPERVISOR': 'Supervisor',
        'DEFAULT': null
    };
    
    connectedCallback() {
        this.loadUserRole();
    }
    
    async loadUserRole() {
        try {
            this.userRole = await getCurrentUserRole();
            this.loadAHISData();
        } catch (error) {
            console.error('Error loading user role:', error);
            this.loadAHISData();
        }
    }
    
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
            const data = await getAHISData({ recordId: this.recordId });
            
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
    
    // Computed properties
    get showContent() {
        return !this.isLoading && !this.hasError && this.ahisData.summary;
    }
    
    get userRoleBadge() {
        return this.roleBadgeMap[this.userRole];
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
                message: 'Event has been created successfully. Click to view.',
                variant: 'success',
                mode: 'dismissable'
            }));
            
            // Navigate to the created event (optional - user can dismiss toast)
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
