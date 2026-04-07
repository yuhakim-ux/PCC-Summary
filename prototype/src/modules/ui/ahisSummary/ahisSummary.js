import { LightningElement, api } from 'lwc';
import { buildSections } from 'data/ahisSectionRegistry';

const COLLAPSED_ALLOW_IDS = new Set(['alerts', 'patientCareGaps', 'adverseActions']);

export default class AhisSummary extends LightningElement {
    @api ahisData = {};
    @api persona = 'member';
    @api collapsed = false;

    get allSections() {
        return buildSections(this.persona, this.ahisData).filter((s) => !s.isIdentityGrid);
    }

    get renderedSections() {
        const all = this.allSections;
        if (!this.collapsed) return all;
        return all.filter((s) => COLLAPSED_ALLOW_IDS.has(s.id));
    }

    get hiddenSectionCount() {
        if (!this.collapsed) return 0;
        return this.allSections.length - this.renderedSections.length;
    }

    get hasHiddenSections() {
        return this.hiddenSectionCount > 0;
    }
}
