import { LightningElement, api, track } from 'lwc';

export default class AhisSection extends LightningElement {
    @api sectionKey = '';
    @api title = '';
    @api iconName = '';
    @api count;
    @api iconClass = '';
    @api sources = [];

    _expanded = true;

    @api
    get expanded() {
        return this._expanded;
    }
    set expanded(value) {
        this._expanded = value !== false;
    }

    @track isExpanded = true;
    @track popoverOpen = false;

    connectedCallback() {
        this.isExpanded = this._expanded;
    }

    get hasCount() {
        return this.count !== undefined && this.count !== null && this.count !== '';
    }

    get chevronIcon() {
        return this.isExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get hasIcon() {
        return !!this.iconName;
    }

    get iconComputedClass() {
        return `section-icon ${this.iconClass || ''}`.trim();
    }

    get hasSources() {
        return Array.isArray(this.sources) && this.sources.length > 0;
    }

    get sourceCountLabel() {
        return String((this.sources || []).length);
    }

    get popoverTitle() {
        return `Source (${(this.sources || []).length})`;
    }

    get citationClass() {
        return this.popoverOpen ? 'citation-btn citation-btn-selected' : 'citation-btn';
    }

    handleToggle() {
        this.isExpanded = !this.isExpanded;
        this.dispatchEvent(
            new CustomEvent('toggle', {
                detail: { sectionKey: this.sectionKey, expanded: this.isExpanded },
            })
        );
    }

    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleToggle();
        }
    }

    handleCitationClick(event) {
        event.stopPropagation();
        this.popoverOpen = !this.popoverOpen;
    }

    handleClosePopover(event) {
        event.stopPropagation();
        this.popoverOpen = false;
    }
}
