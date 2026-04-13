import { LightningElement, track } from 'lwc';
import { getAHISData, getAvailableRoles, getRecordHeader, getSidebarData } from 'data/ahis';
import { buildSections } from 'data/ahisSectionRegistry';
import AhisDrillDown from 'ui/ahisDrillDown';

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

    connectedCallback() {
        this._boundDismissOverlays = () => { this.isPersonaPickerOpen = false; };
        document.addEventListener('dismissoverlays', this._boundDismissOverlays);
        if (!this.showGenerateButton) {
            this.loadData();
        }
    }

    disconnectedCallback() {
        document.removeEventListener('dismissoverlays', this._boundDismissOverlays);
    }

    get roleOptions() {
        return getAvailableRoles();
    }

    get recordHeader() {
        return getRecordHeader(this.currentRole);
    }

    get sidebarData() {
        return getSidebarData(this.currentRole);
    }

    get activityItems() {
        return this.sidebarData.activityItems;
    }

    get relatedLists() {
        return this.sidebarData.relatedLists;
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

    get microSummaryItems() {
        const raw = this.ahisData?.microSummary;
        if (!raw) return [];
        const lines = Array.isArray(raw) ? raw : [raw];
        return lines.map((text, i) => ({ key: `ms-${i}`, text }));
    }

    get hasMicroSummary() {
        return this.microSummaryItems.length > 0;
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
        const sections = all.filter((s) => !s.isIdentityGrid);
        return `Show Details (${sections.length})`;
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
        if (!this.isPersonaPickerOpen) {
            document.dispatchEvent(new CustomEvent('dismissoverlays'));
        }
        this.isPersonaPickerOpen = !this.isPersonaPickerOpen;
    }

    handlePersonaBackdropClick() {
        this.isPersonaPickerOpen = false;
    }

    loadData() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.hasError = false;

        const token = Symbol();
        this._loadToken = token;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            if (this._loadToken !== token) return;
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
