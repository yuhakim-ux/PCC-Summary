import { LightningElement, api, track } from 'lwc';

const RISK_CONFIG = {
    Clinical: { icon: 'utility:heart', badgeClass: 'slds-badge risk-badge risk-clinical', cardClass: 'risk-card risk-card-clinical' },
    Social: { icon: 'utility:people', badgeClass: 'slds-badge risk-badge risk-social', cardClass: 'risk-card risk-card-social' },
    Operational: { icon: 'utility:settings', badgeClass: 'slds-badge risk-badge risk-operational', cardClass: 'risk-card risk-card-operational' },
    Compliance: { icon: 'utility:shield', badgeClass: 'slds-badge risk-badge risk-compliance', cardClass: 'risk-card risk-card-compliance' },
    Financial: { icon: 'utility:moneybag', badgeClass: 'slds-badge risk-badge risk-financial', cardClass: 'risk-card risk-card-financial' },
};

const CONFIDENCE_CONFIG = {
    High: { class: 'confidence-badge confidence-high' },
    Medium: { class: 'confidence-badge confidence-medium' },
    Low: { class: 'confidence-badge confidence-low' },
};

export default class AhisInsights extends LightningElement {
    @api insights = [];
    @api userRole = 'DEFAULT';

    @track activeSections = [];

    connectedCallback() {
        if (this.insights?.length > 0) {
            this.activeSections = ['insight-0'];
        }
    }

    get hasInsights() {
        return this.insights?.length > 0;
    }

    get noInsights() {
        return !this.hasInsights;
    }

    get insightCountLabel() {
        return String(this.insights?.length || 0);
    }

    get formattedInsights() {
        if (!this.insights) return [];
        return this.insights.map((insight, index) => {
            const riskCfg = RISK_CONFIG[insight.riskCategory] || RISK_CONFIG.Clinical;
            const confCfg = CONFIDENCE_CONFIG[insight.confidence] || CONFIDENCE_CONFIG.Medium;
            return {
                ...insight,
                id: `insight-${index}`,
                riskBadgeClass: riskCfg.badgeClass,
                confidenceClass: confCfg.class,
                hasSourceRecords: insight.sourceRecords?.length > 0,
            };
        });
    }

    get riskCategories() {
        const counts = { Clinical: 0, Social: 0, Operational: 0, Compliance: 0, Financial: 0 };
        this.insights?.forEach((i) => {
            if (Object.prototype.hasOwnProperty.call(counts, i.riskCategory)) {
                counts[i.riskCategory]++;
            }
        });
        return Object.entries(counts)
            .filter(([, count]) => count > 0)
            .map(([name, count]) => ({
                name,
                count,
                icon: RISK_CONFIG[name]?.icon || 'utility:info',
                cardClass: RISK_CONFIG[name]?.cardClass || 'risk-card',
            }));
    }

    handleDrillDown(event) {
        const riskCategory = event.currentTarget.dataset.riskCategory;
        const insightTitle = event.currentTarget.dataset.insightTitle;
        this.dispatchEvent(
            new CustomEvent('drilldown', {
                detail: { riskCategory, insightTitle },
                bubbles: true,
                composed: true,
            })
        );
    }
}
