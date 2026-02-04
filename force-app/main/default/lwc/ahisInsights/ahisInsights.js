import { LightningElement, api, track } from 'lwc';

export default class AhisInsights extends LightningElement {
    @api insights = [];
    @api userRole = 'DEFAULT';
    @api isExpanded = false;
    
    @track activeSections = [];
    
    // Risk category configuration
    riskConfig = {
        'Clinical': {
            icon: 'utility:heart',
            badgeClass: 'slds-badge risk-badge risk-clinical',
            cardClass: 'risk-card risk-card-clinical'
        },
        'Social': {
            icon: 'utility:people',
            badgeClass: 'slds-badge risk-badge risk-social',
            cardClass: 'risk-card risk-card-social'
        },
        'Operational': {
            icon: 'utility:settings',
            badgeClass: 'slds-badge risk-badge risk-operational',
            cardClass: 'risk-card risk-card-operational'
        },
        'Compliance': {
            icon: 'utility:shield',
            badgeClass: 'slds-badge risk-badge risk-compliance',
            cardClass: 'risk-card risk-card-compliance'
        }
    };
    
    // Confidence level configuration
    confidenceConfig = {
        'High': {
            class: 'confidence-badge confidence-high',
            title: 'High confidence in this insight'
        },
        'Medium': {
            class: 'confidence-badge confidence-medium',
            title: 'Medium confidence - review recommended'
        },
        'Low': {
            class: 'confidence-badge confidence-low',
            title: 'Low confidence - additional verification needed'
        }
    };
    
    get hasInsights() {
        return this.insights && this.insights.length > 0;
    }
    
    get insightCount() {
        return this.insights ? this.insights.length : 0;
    }
    
    get formattedInsights() {
        if (!this.insights) return [];
        
        return this.insights.map((insight, index) => {
            const riskCfg = this.riskConfig[insight.riskCategory] || this.riskConfig['Clinical'];
            const confCfg = this.confidenceConfig[insight.confidence] || this.confidenceConfig['Medium'];
            
            return {
                ...insight,
                id: `insight-${index}`,
                riskIcon: riskCfg.icon,
                riskBadgeClass: riskCfg.badgeClass,
                cardClass: `insight-card insight-card-${(insight.riskCategory || 'clinical').toLowerCase()}`,
                confidenceClass: confCfg.class,
                confidenceTitle: confCfg.title,
                hasSourceRecords: insight.sourceRecords && insight.sourceRecords.length > 0,
                drillDownType: this.getDrillDownType(insight)
            };
        });
    }
    
    get showRiskSummary() {
        return this.isExpanded && this.hasInsights;
    }
    
    get riskCategories() {
        const counts = {
            'Clinical': 0,
            'Social': 0,
            'Operational': 0,
            'Compliance': 0
        };
        
        if (this.insights) {
            this.insights.forEach(insight => {
                if (counts.hasOwnProperty(insight.riskCategory)) {
                    counts[insight.riskCategory]++;
                }
            });
        }
        
        return Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            icon: this.riskConfig[name]?.icon || 'utility:info',
            cardClass: this.riskConfig[name]?.cardClass || 'risk-card'
        }));
    }
    
    getDrillDownType(insight) {
        // Use riskCategory directly for drill-down type
        // This maps to real records: Clinical->Tasks, Operational->Events, Compliance->Cases
        return insight.riskCategory || 'general';
    }
    
    handleDrillDown(event) {
        const insightType = event.currentTarget.dataset.insightType;
        const insightTitle = event.currentTarget.dataset.insightTitle;
        const riskCategory = event.currentTarget.dataset.riskCategory;
        const sourceRecords = event.currentTarget.dataset.sourceRecords;
        
        // Dispatch custom event to parent with riskCategory for real record queries
        const drillDownEvent = new CustomEvent('drildown', {
            detail: {
                insightType: riskCategory || insightType, // Use riskCategory for Apex query mapping
                insightTitle,
                riskCategory,
                sourceRecords
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(drillDownEvent);
    }
    
    connectedCallback() {
        // Auto-expand first insight
        if (this.insights && this.insights.length > 0) {
            this.activeSections = ['insight-0'];
        }
    }
}
