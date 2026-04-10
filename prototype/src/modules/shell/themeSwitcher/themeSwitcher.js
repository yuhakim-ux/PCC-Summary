import { LightningElement, api, track } from 'lwc';

export default class ThemeSwitcher extends LightningElement {
    @api sldsVersion = 2;
    @api darkMode = false;
    @track isCardOpen = false;

    get sldsToggleLabel() {
        return this.sldsVersion === 2 ? 'Switch to SLDS 1' : 'Switch to SLDS 2';
    }

    get showDarkModeButton() {
        return this.sldsVersion === 2;
    }

    get darkModeLabel() {
        return this.darkMode ? 'Light Mode' : 'Dark Mode';
    }

    connectedCallback() {
        this._boundDismissOverlays = () => { this.isCardOpen = false; };
        document.addEventListener('dismissoverlays', this._boundDismissOverlays);
    }

    disconnectedCallback() {
        document.removeEventListener('dismissoverlays', this._boundDismissOverlays);
    }

    handleIconClick() {
        if (!this.isCardOpen) {
            document.dispatchEvent(new CustomEvent('dismissoverlays'));
        }
        this.isCardOpen = !this.isCardOpen;
    }

    handleBackdropClick() {
        this.isCardOpen = false;
    }

    handleToggleSLDSClick() {
        this.dispatchEvent(new CustomEvent('toggleslds', { bubbles: true, composed: true }));
    }

    handleToggleDarkModeClick() {
        this.dispatchEvent(new CustomEvent('toggledarkmode', { bubbles: true, composed: true }));
    }
}
