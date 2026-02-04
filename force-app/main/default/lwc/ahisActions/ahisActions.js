import { LightningElement, api, track } from 'lwc';

export default class AhisActions extends LightningElement {
    @api actions = [];
    @api userRole = 'DEFAULT';
    @api isExpanded = false;
    
    @track showModifyModal = false;
    @track showDismissModal = false;
    @track modifyingActionId = '';
    @track modifyingActionTitle = '';
    @track dismissingActionId = '';
    @track modifyNotes = '';
    
    // Action type configuration
    actionTypeConfig = {
        'schedule': {
            icon: 'utility:event',
            iconContainerClass: 'action-icon-container action-icon-schedule'
        },
        'escalate': {
            icon: 'utility:priority',
            iconContainerClass: 'action-icon-container action-icon-escalate'
        },
        'review': {
            icon: 'utility:preview',
            iconContainerClass: 'action-icon-container action-icon-review'
        },
        'outreach': {
            icon: 'utility:call',
            iconContainerClass: 'action-icon-container action-icon-outreach'
        },
        'update': {
            icon: 'utility:edit',
            iconContainerClass: 'action-icon-container action-icon-update'
        }
    };
    
    // Priority configuration
    priorityConfig = {
        'High': {
            icon: 'utility:warning',
            badgeClass: 'slds-badge priority-badge priority-high'
        },
        'Medium': {
            icon: 'utility:info',
            badgeClass: 'slds-badge priority-badge priority-medium'
        },
        'Low': {
            icon: 'utility:check',
            badgeClass: 'slds-badge priority-badge priority-low'
        }
    };
    
    // Status configuration
    statusConfig = {
        'accepted': {
            label: 'Accepted',
            icon: 'utility:check',
            badgeClass: 'slds-badge status-badge status-accepted'
        },
        'modified': {
            label: 'Modified',
            icon: 'utility:edit',
            badgeClass: 'slds-badge status-badge status-modified'
        },
        'dismissed': {
            label: 'Dismissed',
            icon: 'utility:close',
            badgeClass: 'slds-badge status-badge status-dismissed'
        }
    };
    
    get hasActions() {
        return this.actions && this.actions.length > 0;
    }
    
    get actionCount() {
        return this.actions ? this.actions.length : 0;
    }
    
    get pendingCount() {
        if (!this.actions) return 0;
        return this.actions.filter(a => !a.status || a.status === 'pending').length;
    }
    
    get containerClass() {
        return this.isExpanded ? 'ahis-actions-container expanded' : 'ahis-actions-container';
    }
    
    // Modal display - show if either modify or dismiss modal is open
    get showNotesModal() {
        return this.showModifyModal || this.showDismissModal;
    }
    
    // Modal title based on which modal is open
    get modalTitle() {
        if (this.showModifyModal) {
            return `Edit Action: ${this.modifyingActionTitle}`;
        } else if (this.showDismissModal) {
            return 'Dismiss Action';
        }
        return '';
    }
    
    // Modal message based on which modal is open
    get modalMessage() {
        if (this.showModifyModal) {
            return 'Please provide any notes or modifications for this action:';
        } else if (this.showDismissModal) {
            return 'Are you sure you want to dismiss this action? You can add a reason below:';
        }
        return '';
    }
    
    // Notes value for the textarea
    get notesValue() {
        return this.modifyNotes;
    }
    
    get formattedActions() {
        if (!this.actions) return [];
        
        return this.actions.map(action => {
            const typeCfg = this.actionTypeConfig[action.actionType] || this.actionTypeConfig['review'];
            const priorityCfg = this.priorityConfig[action.priority] || this.priorityConfig['Medium'];
            const statusCfg = action.status ? this.statusConfig[action.status] : null;
            
            return {
                ...action,
                actionIcon: typeCfg.icon,
                iconContainerClass: typeCfg.iconContainerClass,
                priorityIcon: priorityCfg.icon,
                priorityClass: priorityCfg.badgeClass,
                hasStatus: !!action.status,
                statusLabel: statusCfg?.label,
                statusIcon: statusCfg?.icon,
                statusBadgeClass: statusCfg?.badgeClass,
                containerClass: action.status 
                    ? 'slds-item action-item action-completed' 
                    : 'slds-item action-item',
                // Accordion label shows title and status indicator
                accordionLabel: action.status 
                    ? `${action.title} (${statusCfg?.label || action.status})`
                    : action.title,
                // Status flags for template
                // 'pending' status or no status means the action is still pending
                isPending: !action.status || action.status === 'pending',
                isAccepted: action.status === 'accepted',
                isModified: action.status === 'modified',
                isDismissed: action.status === 'dismissed'
            };
        });
    }
    
    // Accept action handler
    handleAccept(event) {
        const actionId = event.currentTarget.dataset.actionId;
        
        // Find the action to check its type
        const action = this.actions.find(a => 
            a.id === actionId || a.actionId === actionId
        );
        
        // For schedule actions, dispatch a special event for e2e flow
        if (action && action.actionType === 'schedule') {
            this.dispatchEvent(new CustomEvent('scheduleaction', {
                detail: {
                    actionId: actionId,
                    title: action.title,
                    description: action.description,
                    actionType: action.actionType
                },
                bubbles: true,
                composed: true
            }));
        } else {
            // For other action types, dispatch the standard response
            this.dispatchActionResponse(actionId, 'accepted', '');
        }
    }
    
    // Handle dropdown menu selection (Edit/Dismiss)
    handleMenuSelect(event) {
        const selectedValue = event.detail.value;
        const actionId = event.target.dataset.actionId;
        
        if (selectedValue === 'edit') {
            // Trigger modify flow
            this.modifyingActionId = actionId;
            const action = this.actions.find(a => a.id === actionId);
            this.modifyingActionTitle = action ? action.title : '';
            this.modifyNotes = '';
            this.showModifyModal = true;
        } else if (selectedValue === 'dismiss') {
            // Trigger dismiss flow
            this.dismissingActionId = actionId;
            this.showDismissModal = true;
        }
    }
    
    // Modify action handler - opens modal
    handleModify(event) {
        this.modifyingActionId = event.currentTarget.dataset.actionId;
        this.modifyingActionTitle = event.currentTarget.dataset.actionTitle;
        this.modifyNotes = '';
        this.showModifyModal = true;
    }
    
    // Submit modified action
    handleSubmitModify() {
        if (this.modifyingActionId) {
            this.dispatchActionResponse(this.modifyingActionId, 'modified', this.modifyNotes);
            this.handleCloseModal();
        }
    }
    
    // Dismiss action handler - opens confirmation
    handleDismiss(event) {
        this.dismissingActionId = event.currentTarget.dataset.actionId;
        this.showDismissModal = true;
    }
    
    // Confirm dismiss
    handleConfirmDismiss() {
        if (this.dismissingActionId) {
            this.dispatchActionResponse(this.dismissingActionId, 'dismissed', '');
            this.handleCloseModal();
        }
    }
    
    // Close any open modal
    handleCloseModal() {
        this.showModifyModal = false;
        this.showDismissModal = false;
        this.modifyingActionId = '';
        this.modifyingActionTitle = '';
        this.dismissingActionId = '';
        this.modifyNotes = '';
    }
    
    // Alias for template - cancel modal
    handleModalCancel() {
        this.handleCloseModal();
    }
    
    // Alias for template - confirm modal action
    handleModalConfirm() {
        if (this.showModifyModal) {
            this.handleSubmitModify();
        } else if (this.showDismissModal) {
            this.handleConfirmDismiss();
        }
    }
    
    // Handle notes change
    handleNotesChange(event) {
        this.modifyNotes = event.target.value;
    }
    
    // Dispatch action response event to parent
    dispatchActionResponse(actionId, status, notes) {
        const actionEvent = new CustomEvent('actionresponse', {
            detail: {
                actionId,
                status,
                notes
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(actionEvent);
    }
}