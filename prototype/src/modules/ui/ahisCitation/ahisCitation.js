import { LightningElement, api, track } from 'lwc';

export default class AhisCitation extends LightningElement {
    @api sources = [];

    @track isOpen = false;

    get hasSources() {
        return Array.isArray(this.sources) && this.sources.length > 0;
    }

    get pillLabel() {
        return String((this.sources || []).length);
    }

    get tooltipText() {
        const count = (this.sources || []).length;
        return `${count} source${count !== 1 ? 's' : ''}`;
    }

    get popoverTitle() {
        return `Sources (${(this.sources || []).length})`;
    }

    handleClick(event) {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    handleClose(event) {
        event.stopPropagation();
        this.isOpen = false;
    }

    connectedCallback() {
        this._clickOutsideHandler = () => {
            if (this.isOpen) this.isOpen = false;
        };
        document.addEventListener('click', this._clickOutsideHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('click', this._clickOutsideHandler);
    }
}
