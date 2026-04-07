import { LightningElement, api } from 'lwc';
import AhisNotesModal from 'ui/ahisNotesModal';

const ACTION_TYPE_CONFIG = {
    schedule: { icon: 'utility:event', label: 'Schedule' },
    escalate: { icon: 'utility:priority', label: 'Escalate' },
    review: { icon: 'utility:preview', label: 'Review' },
    outreach: { icon: 'utility:call', label: 'Outreach' },
    update: { icon: 'utility:edit', label: 'Update' },
};

const PRIORITY_CONFIG = {
    High: { icon: 'utility:warning', badgeClass: 'slds-badge priority-badge priority-high' },
    Medium: { icon: 'utility:info', badgeClass: 'slds-badge priority-badge priority-medium' },
    Low: { icon: 'utility:check', badgeClass: 'slds-badge priority-badge priority-low' },
};

const STATUS_LABELS = { accepted: 'Accepted', modified: 'Modified', dismissed: 'Dismissed' };

export default class AhisActions extends LightningElement {
    @api actions = [];
    @api userRole = 'DEFAULT';

    get hasActions() {
        return this.actions?.length > 0;
    }

    get noActions() {
        return !this.hasActions;
    }

    get actionCountLabel() {
        return String(this.actions?.length || 0);
    }

    get pendingCount() {
        return this.actions?.filter((a) => !a.status || a.status === 'pending').length || 0;
    }

    get hasPending() {
        return this.pendingCount > 0;
    }

    get pendingLabel() {
        return `${this.pendingCount} pending`;
    }

    get formattedActions() {
        if (!this.actions) return [];
        return this.actions.map((action) => {
            const typeCfg = ACTION_TYPE_CONFIG[action.actionType] || ACTION_TYPE_CONFIG.review;
            const priorityCfg = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.Medium;
            const statusLabel = STATUS_LABELS[action.status] || '';
            return {
                ...action,
                actionIcon: typeCfg.icon,
                actionTypeLabel: typeCfg.label,
                priorityIcon: priorityCfg.icon,
                priorityClass: priorityCfg.badgeClass,
                accordionLabel: action.status && action.status !== 'pending'
                    ? `${action.title} (${statusLabel})`
                    : action.title,
                isPending: !action.status || action.status === 'pending',
                isAccepted: action.status === 'accepted',
                isModified: action.status === 'modified',
                isDismissed: action.status === 'dismissed',
            };
        });
    }

    handleAccept(event) {
        const actionId = event.currentTarget.dataset.actionId;
        this.dispatchActionResponse(actionId, 'accepted', '');
    }

    handleDismissClick(event) {
        const actionId = event.currentTarget.dataset.actionId;
        this.dispatchActionResponse(actionId, 'dismissed', '');
    }

    async handleMenuSelect(event) {
        const selectedValue = event.detail.value;
        const actionId = event.target.dataset.actionId;
        const action = this.actions.find((a) => a.id === actionId);

        if (selectedValue === 'edit') {
            const result = await AhisNotesModal.open({
                size: 'small',
                label: `Edit Action: ${action?.title || ''}`,
                message: 'Please provide any notes or modifications for this action:',
            });
            if (result?.confirmed) {
                this.dispatchActionResponse(actionId, 'modified', result.notes);
            }
        } else if (selectedValue === 'schedule') {
            this.dispatchEvent(
                new CustomEvent('scheduleaction', {
                    detail: { actionId, title: action?.title, description: action?.description },
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }

    dispatchActionResponse(actionId, status, notes) {
        this.dispatchEvent(
            new CustomEvent('actionresponse', {
                detail: { actionId, status, notes },
                bubbles: true,
                composed: true,
            })
        );
    }
}
