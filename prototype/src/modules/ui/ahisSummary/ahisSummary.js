import { LightningElement, api } from 'lwc';
import { buildSections } from 'data/ahisSectionRegistry';

const COLLAPSED_ALLOW_IDS = new Set(['alerts', 'patientCareGaps', 'adverseActions']);

export default class AhisSummary extends LightningElement {
    @api ahisData = {};
    @api persona = 'member';
    @api collapsed = false;
    sectionResetTokens = {};

    get allSections() {
        return buildSections(this.persona, this.ahisData).filter((s) => !s.isIdentityGrid);
    }

    get renderedSections() {
        const all = this.allSections;
        const visible = this.collapsed ? all.filter((s) => COLLAPSED_ALLOW_IDS.has(s.id)) : all;
        return visible.map((section) => ({
            ...section,
            resetToken: this.sectionResetTokens[section.id] || 0,
        }));
    }

    get hiddenSectionCount() {
        if (!this.collapsed) return 0;
        return this.allSections.length - this.renderedSections.length;
    }

    get hasHiddenSections() {
        return this.hiddenSectionCount > 0;
    }

    handleSectionToggle(event) {
        const { sectionKey, expanded } = event.detail || {};
        if (!sectionKey || expanded) return;
        this.sectionResetTokens = {
            ...this.sectionResetTokens,
            [sectionKey]: (this.sectionResetTokens[sectionKey] || 0) + 1,
        };
    }
}
