import { LightningElement, track } from 'lwc';
import { getAHISData, getAvailableRoles } from 'data/ahis';
import { buildSections } from 'data/ahisSectionRegistry';
import AhisDrillDown from 'ui/ahisDrillDown';

const COLLAPSED_ALLOW_IDS = new Set(['alerts', 'patientCareGaps', 'adverseActions']);

const ACTIVITY_ITEMS = [
    { id: 'a1', type: 'call', iconName: 'standard:log_a_call', subject: 'Medication review call', date: 'Apr 4, 2026', description: 'Discussed Metformin side effects and refill timing.' },
    { id: 'a2', type: 'event', iconName: 'standard:event', subject: 'Telehealth — Dr. Adams', date: 'Mar 28, 2026', description: 'Annual wellness visit. Noted elevated BP (142/90).' },
    { id: 'a3', type: 'task', iconName: 'standard:task', subject: 'Referral: Ophthalmology', date: 'Mar 28, 2026', description: 'Diabetic eye exam referral created. Pending scheduling.' },
    { id: 'a4', type: 'email', iconName: 'standard:email', subject: 'Care plan update sent', date: 'Mar 20, 2026', description: 'Updated care plan mailed to member with diabetes goals.' },
    { id: 'a5', type: 'call', iconName: 'standard:log_a_call', subject: 'Inbound — claim inquiry', date: 'Mar 12, 2026', description: 'Member called about denied knee arthroscopy claim.' },
];

const RELATED_LISTS = [
    { id: 'r1', label: 'Cases', count: '2', iconName: 'standard:case' },
    { id: 'r2', label: 'Claims', count: '4', iconName: 'standard:custom_notification' },
    { id: 'r3', label: 'Care Plans', count: '1', iconName: 'standard:capacity_plan' },
    { id: 'r4', label: 'Referrals', count: '2', iconName: 'standard:document_reference' },
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
    @track isCollapsed = true;

    showGenerateButton = true;
    showActionBar = false;
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

    get resolvedPersona() {
        return this.ahisData?.persona || 'member';
    }

    get identityData() {
        const all = buildSections(this.resolvedPersona, this.ahisData);
        const id = all.find((s) => s.isIdentityGrid);
        return id ? id.data : {};
    }

    get showContent() {
        return this.hasGenerated && !this.isLoading && !this.hasError && this.ahisData?.success;
    }

    get showGenerateState() {
        return this.showGenerateButton && !this.hasGenerated && !this.isLoading;
    }

    get showAiLabel() {
        return this.hasGenerated || this.isLoading;
    }

    get formattedTimestamp() {
        if (!this.ahisData?.generatedAt) return '';
        const d = new Date(this.ahisData.generatedAt);
        const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return `Today at ${time}`;
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

    get isExpanded() {
        return !this.isCollapsed;
    }

    get toggleLabel() {
        if (!this.isCollapsed) return 'Show less';
        const all = buildSections(this.resolvedPersona, this.ahisData);
        const hidden = all.filter((s) => !s.isIdentityGrid && !COLLAPSED_ALLOW_IDS.has(s.id));
        return `Show more (${hidden.length})`;
    }

    get primaryActionLabel() {
        const labels = {
            member: 'Check Appeal SLA',
            patient: 'Schedule Referral',
            provider: 'Renew Credential',
        };
        return labels[this.resolvedPersona] || 'Take Action';
    }

    get primaryActionIcon() {
        const icons = {
            member: 'utility:clock',
            patient: 'utility:event',
            provider: 'utility:refresh',
        };
        return icons[this.resolvedPersona] || 'utility:check';
    }

    get secondaryActionLabel() {
        const labels = {
            member: 'Create Case',
            patient: 'Order Labs',
            provider: 'Resolve Case',
        };
        return labels[this.resolvedPersona] || 'View Details';
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

    handleToggleExpand() {
        this.isCollapsed = !this.isCollapsed;
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

    handleFeedback(event) {
        const { contentId, value } = event.detail;
        console.log(`Feedback for ${contentId}: ${value}`);
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
