import { LightningElement, api } from 'lwc';
import { buildSections } from 'data/ahisSectionRegistry';

export default class AhisSummary extends LightningElement {
    @api ahisData = {};
    @api persona = 'member';
    sectionResetTokens = {};

    get renderedSections() {
        return buildSections(this.persona, this.ahisData)
            .filter((s) => !s.isIdentityGrid)
            .map((section) => ({
                ...section,
                resetToken: this.sectionResetTokens[section.id] || 0,
            }));
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
