import { LightningElement, api } from 'lwc';

export default class AhisSummary extends LightningElement {
    @api summary = '';
    @api generatedAt;
    @api changesSinceLastVisit = [];
    @api userRole = 'DEFAULT';
    @api isExpanded = false;
    
    // Role configuration
    roleConfig = {
        'CONTACT_CENTER_AGENT': {
            label: 'Call Center View',
            icon: 'utility:call',
            message: 'Optimized for quick member assistance during calls'
        },
        'CARE_MANAGER': {
            label: 'Care Manager View',
            icon: 'utility:heart',
            message: 'Focused on care plan progress and clinical priorities'
        },
        'FIELD_CAREGIVER': {
            label: 'Field View',
            icon: 'utility:location',
            message: 'Tailored for home visit preparation'
        },
        'SUPERVISOR': {
            label: 'Supervisor View',
            icon: 'utility:metrics',
            message: 'Aggregated risk and performance overview'
        },
        'DEFAULT': {
            label: null,
            icon: 'utility:user',
            message: null
        }
    };
    
    get hasChanges() {
        return this.changesSinceLastVisit && this.changesSinceLastVisit.length > 0;
    }
    
    get roleLabel() {
        return this.roleConfig[this.userRole]?.label || null;
    }
    
    get showRoleContext() {
        return this.roleConfig[this.userRole]?.message !== null;
    }
    
    get roleContextIcon() {
        return this.roleConfig[this.userRole]?.icon || 'utility:user';
    }
    
    get roleContextMessage() {
        return this.roleConfig[this.userRole]?.message || '';
    }
    
    get containerClass() {
        return this.isExpanded 
            ? 'ahis-summary-container expanded' 
            : 'ahis-summary-container';
    }
}
