import { LightningElement, api, track } from 'lwc';

export default class AhisSection extends LightningElement {
    @api sectionKey = '';
    @api title = '';
    @api iconName = '';
    @api iconClass = '';

    _expanded = true;

    @api
    get expanded() {
        return this._expanded;
    }
    set expanded(value) {
        this._expanded = value !== false;
    }

    @track isExpanded = true;

    connectedCallback() {
        this.isExpanded = this._expanded;
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
}
