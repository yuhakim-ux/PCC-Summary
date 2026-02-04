import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getDrillDownData from '@salesforce/apex/AHISController.getDrillDownData';

export default class AhisDrillDown extends NavigationMixin(LightningElement) {
    @api recordId;
    @api drillDownType;
    @api drillDownTitle;
    
    @track records = [];
    @track isLoading = true;
    @track hasError = false;
    @track errorMessage = '';
    @track searchTerm = '';
    
    // Drill down type configuration - maps risk categories to real Salesforce objects
    drillDownConfig = {
        // Risk category mappings (primary)
        'Clinical': {
            icon: 'standard:task',
            objectName: 'Task',
            label: 'Clinical Tasks',
            fields: ['status', 'dueDate', 'priority', 'ownerName', 'description']
        },
        'Social': {
            icon: 'standard:task',
            objectName: 'Task',
            label: 'Social Tasks',
            fields: ['status', 'dueDate', 'priority', 'ownerName', 'description']
        },
        'Operational': {
            icon: 'standard:event',
            objectName: 'Event',
            label: 'Events & Appointments',
            fields: ['startTime', 'endTime', 'workType', 'status', 'location', 'description']
        },
        'Compliance': {
            icon: 'standard:case',
            objectName: 'Case',
            label: 'Compliance Cases',
            fields: ['caseNumber', 'status', 'priority', 'ownerName', 'description']
        },
        // Legacy mappings (for backward compatibility)
        'memberPlan': {
            icon: 'standard:entitlement',
            objectName: 'MemberPlan',
            label: 'Member Plans',
            fields: ['productName', 'effectiveFrom', 'effectiveTo', 'status', 'payerName']
        },
        'appointments': {
            icon: 'standard:event',
            objectName: 'Event',
            label: 'Appointments',
            fields: ['startTime', 'endTime', 'workType', 'status', 'description']
        },
        'goals': {
            icon: 'standard:goals',
            objectName: 'Goal',
            label: 'Goals',
            fields: ['status', 'targetDate', 'progress', 'priority', 'description']
        },
        'careTasks': {
            icon: 'standard:task',
            objectName: 'Task',
            label: 'Care Tasks',
            fields: ['status', 'dueDate', 'priority', 'ownerName', 'description']
        },
        'general': {
            icon: 'standard:record',
            objectName: 'SObject',
            label: 'Related Records',
            fields: ['status', 'priority', 'description']
        }
    };
    
    // Field label mapping
    fieldLabels = {
        'productName': 'Plan',
        'effectiveFrom': 'Start Date',
        'effectiveTo': 'End Date',
        'status': 'Status',
        'payerName': 'Payer',
        'startTime': 'Start Time',
        'endTime': 'End Time',
        'workType': 'Type',
        'description': 'Description',
        'targetDate': 'Target Date',
        'progress': 'Progress',
        'priority': 'Priority',
        'dueDate': 'Due Date',
        'ownerName': 'Assigned To',
        'appointmentNumber': 'Appt #',
        'subject': 'Subject',
        'name': 'Name',
        'caseNumber': 'Case #',
        'location': 'Location'
    };
    
    // Status styling - covers Task, Event, and Case statuses
    statusStyles = {
        // Task statuses
        'Open': 'slds-badge slds-badge_inverse',
        'Not Started': 'slds-badge slds-badge_lightest',
        'In Progress': 'slds-badge slds-badge_inverse',
        'Completed': 'slds-badge slds-badge_success',
        'Waiting on someone else': 'slds-badge slds-badge_lightest',
        'Deferred': 'slds-badge slds-badge_lightest',
        // Event statuses
        'Scheduled': 'slds-badge slds-badge_inverse',
        'Active': 'slds-badge slds-badge_success',
        // Case statuses
        'New': 'slds-badge slds-badge_inverse',
        'Working': 'slds-badge slds-badge_inverse',
        'Escalated': 'slds-badge slds-badge_warning',
        'Closed': 'slds-badge slds-badge_success',
        // General
        'Overdue': 'slds-badge slds-badge_error',
        'At Risk': 'slds-badge slds-badge_error',
        'Cancelled': 'slds-badge slds-badge_lightest'
    };
    
    connectedCallback() {
        this.loadDrillDownData();
    }
    
    async loadDrillDownData() {
        this.isLoading = true;
        this.hasError = false;
        
        try {
            const data = await getDrillDownData({
                recordId: this.recordId,
                insightType: this.drillDownType
            });
            
            this.records = this.formatRecords(data.records || []);
            this.hasError = false;
        } catch (error) {
            console.error('Error loading drill-down data:', error);
            this.hasError = true;
            this.errorMessage = error.body?.message || 'Failed to load details';
        } finally {
            this.isLoading = false;
        }
    }
    
    formatRecords(records) {
        const config = this.drillDownConfig[this.drillDownType] || this.drillDownConfig['general'];
        
        return records.map((record, index) => {
            // Build display fields from config
            const displayFields = config.fields
                .filter(field => record[field] !== undefined && record[field] !== null)
                .map((field, fieldIndex) => ({
                    key: `${record.id || index}-${field}-${fieldIndex}`,
                    label: this.fieldLabels[field] || field,
                    value: this.formatFieldValue(field, record[field]),
                    valueClass: this.getValueClass(field, record[field]),
                    isChanged: this.isFieldChanged(record, field),
                    isStatus: field === 'status',
                    isName: field === 'name'
                }));
            
            return {
                ...record,
                rowKey: record.id || `record-${index}`,
                name: record.name || record.subject || record.caseNumber || record.appointmentNumber || 'Record',
                recordUrl: `/${record.id}`,
                formattedFields: displayFields,
                displayFields: displayFields, // Keep for backward compatibility
                statusBadge: record.status,
                statusBadgeClass: this.statusStyles[record.status] || 'slds-badge'
            };
        });
    }
    
    formatFieldValue(field, value) {
        if (value === null || value === undefined) return '-';
        
        // Format dates
        if (field.includes('Date') || field.includes('Time') || field.includes('From') || field.includes('To')) {
            try {
                const date = new Date(value);
                if (field.includes('Time')) {
                    return date.toLocaleString();
                }
                return date.toLocaleDateString();
            } catch (e) {
                return value;
            }
        }
        
        // Format progress as percentage
        if (field === 'progress') {
            return `${value}%`;
        }
        
        return String(value);
    }
    
    getValueClass(field, value) {
        let baseClass = 'slds-text-body_small slds-m-left_xx-small field-value';
        
        // Add special styling for certain values
        if (field === 'status') {
            if (value === 'Overdue' || value === 'At Risk') {
                return baseClass + ' value-warning';
            }
            if (value === 'Completed' || value === 'Active') {
                return baseClass + ' value-success';
            }
        }
        
        if (field === 'priority') {
            if (value === 'High') {
                return baseClass + ' value-warning';
            }
        }
        
        return baseClass;
    }
    
    isFieldChanged(record, field) {
        // Check if record has change indicators
        // In production, this would compare with previous values
        if (record.lastModified) {
            const lastMod = new Date(record.lastModified);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return lastMod > oneWeekAgo;
        }
        return false;
    }
    
    get showContent() {
        return !this.isLoading && !this.hasError;
    }
    
    get hasRecords() {
        return this.filteredRecords && this.filteredRecords.length > 0;
    }
    
    get filteredRecords() {
        if (!this.searchTerm) return this.records;
        
        const term = this.searchTerm.toLowerCase();
        return this.records.filter(record => {
            const nameMatch = record.name?.toLowerCase().includes(term);
            const fieldMatch = record.displayFields?.some(f => 
                f.value?.toLowerCase().includes(term)
            );
            return nameMatch || fieldMatch;
        });
    }
    
    get titleIcon() {
        const config = this.drillDownConfig[this.drillDownType] || this.drillDownConfig['general'];
        return config.icon;
    }
    
    get typeIcon() {
        return this.titleIcon;
    }
    
    get panelTitle() {
        const config = this.drillDownConfig[this.drillDownType] || this.drillDownConfig['general'];
        return this.drillDownTitle || config.label || 'Related Records';
    }
    
    get recordCount() {
        return this.filteredRecords ? this.filteredRecords.length : 0;
    }
    
    get formattedRecords() {
        return this.filteredRecords;
    }
    
    handleSearch(event) {
        this.searchTerm = event.target.value;
    }
    
    handleRefresh() {
        this.loadDrillDownData();
    }
    
    handleClose() {
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
    }
    
    handleRecordClick(event) {
        event.preventDefault();
        const recordId = event.currentTarget.dataset.recordId;
        
        // Navigate to record
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }
    
    handleViewAll() {
        const config = this.drillDownConfig[this.drillDownType] || this.drillDownConfig['general'];
        
        // Navigate to list view
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: config.objectName,
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            }
        });
    }
}
