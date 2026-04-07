import { LightningElement, api, track } from 'lwc';

export default class AhisFeedback extends LightningElement {
    @api contentId = '';
    @api hideOverflow = false;

    get showOverflow() {
        return !this.hideOverflow;
    }

    @track _feedback = null; // 'up' | 'down' | null

    get isThumbUp() {
        return this._feedback === 'up';
    }

    get isThumbDown() {
        return this._feedback === 'down';
    }

    get thumbUpClass() {
        return `feedback-btn${this._feedback === 'up' ? ' feedback-btn-active' : ''}`;
    }

    get thumbDownClass() {
        return `feedback-btn${this._feedback === 'down' ? ' feedback-btn-active feedback-btn-negative' : ''}`;
    }

    handleThumbUp() {
        this._feedback = this._feedback === 'up' ? null : 'up';
        this.dispatchFeedback();
    }

    handleThumbDown() {
        this._feedback = this._feedback === 'down' ? null : 'down';
        this.dispatchFeedback();
    }

    dispatchFeedback() {
        this.dispatchEvent(
            new CustomEvent('feedback', {
                detail: {
                    contentId: this.contentId,
                    value: this._feedback,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    handleOverflowSelect(event) {
        this.dispatchEvent(
            new CustomEvent('secondaryaction', {
                detail: {
                    contentId: this.contentId,
                    action: event.detail.value,
                },
                bubbles: true,
                composed: true,
            })
        );
    }
}
