import { LightningElement, api, track } from 'lwc';

export default class AhisCitation extends LightningElement {
    @api label = '';
    @api sourceName = '';
    @api sourceType = '';
    @api sourceIconName = '';
    @api sourceId = '';

    @track isOpen = false;

    get tooltipText() {
        return `Source: ${this.sourceName}`;
    }

    handleClick(event) {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    handleClose() {
        this.isOpen = false;
    }

    handleNavigate() {
        this.isOpen = false;
        this.dispatchEvent(
            new CustomEvent('navigate', {
                detail: { sourceId: this.sourceId, sourceName: this.sourceName },
                bubbles: true,
                composed: true,
            })
        );
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
