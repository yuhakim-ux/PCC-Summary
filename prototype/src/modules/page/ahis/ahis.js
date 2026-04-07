import { LightningElement, track } from 'lwc';
import { getAHISData, getAvailableRoles } from 'data/ahis';
import AhisDrillDown from 'ui/ahisDrillDown';

const ACTIVITY_ITEMS = [
    { id: 'a1', type: 'call', iconName: 'standard:log_a_call', subject: 'Medication review call', date: 'Apr 4, 2026', description: 'Discussed Metformin side effects and refill timing.' },
    { id: 'a2', type: 'event', iconName: 'standard:event', subject: 'Telehealth — Dr. Aris', date: 'Mar 28, 2026', description: 'Annual wellness visit. Noted elevated BP (142/90).' },
    { id: 'a3', type: 'task', iconName: 'standard:task', subject: 'Referral: Ophthalmology', date: 'Mar 28, 2026', description: 'Diabetic eye exam referral created. Pending scheduling.' },
    { id: 'a4', type: 'email', iconName: 'standard:email', subject: 'Care plan update sent', date: 'Mar 20, 2026', description: 'Updated care plan mailed to member with diabetes goals.' },
    { id: 'a5', type: 'call', iconName: 'standard:log_a_call', subject: 'Inbound — claim inquiry', date: 'Mar 12, 2026', description: 'Member called about denied knee arthroscopy claim.' },
];

const RELATED_LISTS = [
    { id: 'r1', label: 'Cases', count: '2', iconName: 'standard:case' },
    { id: 'r2', label: 'Claims', count: '4', iconName: 'standard:custom_notification' },
    { id: 'r3', label: 'Care Plans', count: '1', iconName: 'standard:care_plan' },
    { id: 'r4', label: 'Referrals', count: '2', iconName: 'standard:referral' },
    { id: 'r5', label: 'Appointments', count: '1', iconName: 'standard:event' },
];

export default class Ahis extends LightningElement {
    @track ahisData = {};
    @track isLoading = false;
    @track hasError = false;
    @track errorMessage = '';
    @track currentRole = 'MEMBER';
    @track isFollowing = false;
    @track isPersonaPickerOpen = false;

    showGenerateButton = true;
    hasGenerated = false;
    activityItems = ACTIVITY_ITEMS;
    relatedLists = RELATED_LISTS;

    connectedCallback() {
        if (!this.showGenerateButton) {
            this.loadData();
        }
    }

    get roleOptions() {
        return getAvailableRoles();
    }

    get cardTitle() {
        return this.ahisData?.badge || 'Health Intelligence Surface';
    }

    get cardSubtitle() {
        return this.ahisData?.message || 'Persona-aware overview for fast case decisions';
    }

    get footerRoleLabel() {
        return this.ahisData?.label || this.currentRole;
    }

    get resolvedPersona() {
        return this.ahisData?.persona || 'member';
    }

    get showContent() {
        return this.hasGenerated && !this.isLoading && !this.hasError && this.ahisData?.success;
    }

    get showGenerateState() {
        return this.showGenerateButton && !this.hasGenerated && !this.isLoading;
    }

    get formattedTimestamp() {
        if (!this.ahisData?.generatedAt) return '';
        return new Date(this.ahisData.generatedAt).toLocaleString();
    }

    get microSummaryText() {
        return this.ahisData?.microSummary || 'Generate a summary to see top context and alerts.';
    }

    get followVariant() {
        return this.isFollowing ? 'success' : 'neutral';
    }

    get followLabel() {
        return this.isFollowing ? 'Following' : 'Follow';
    }

    get followIconName() {
        return this.isFollowing ? 'utility:check' : 'utility:add';
    }

    handleFollow() {
        this.isFollowing = !this.isFollowing;
    }

    handlePersonaFabClick() {
        this.isPersonaPickerOpen = !this.isPersonaPickerOpen;
    }

    handlePersonaBackdropClick() {
        this.isPersonaPickerOpen = false;
    }

    loadData() {
        this.isLoading = true;
        this.hasError = false;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            try {
                this.ahisData = getAHISData(this.currentRole);
                this.hasGenerated = true;
                this.hasError = false;
            } catch (err) {
                this.hasError = true;
                this.errorMessage = err.message || 'Failed to generate intelligence';
            } finally {
                this.isLoading = false;
            }
        }, 800);
    }

    handleGenerate() {
        this.loadData();
    }

    handleRoleChange(event) {
        this.currentRole = event.detail.value;
        if (this.hasGenerated || !this.showGenerateButton) {
            this.loadData();
        }
    }

    handleRefresh() {
        this.loadData();
    }

    handleDrillDown(event) {
        const { riskCategory, insightTitle } = event.detail;
        AhisDrillDown.open({
            size: 'medium',
            label: insightTitle || 'Related Records',
            drillDownType: riskCategory,
            drillDownTitle: insightTitle,
        });
    }

    handleActionResponse(event) {
        const { actionId, status } = event.detail;
        if (this.ahisData?.suggestedActions) {
            this.ahisData = {
                ...this.ahisData,
                suggestedActions: this.ahisData.suggestedActions.map((action) => {
                    if (action.id === actionId) {
                        return { ...action, status };
                    }
                    return action;
                }),
            };
        }
    }
}
