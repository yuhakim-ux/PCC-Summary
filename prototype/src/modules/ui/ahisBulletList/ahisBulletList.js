import { LightningElement, api, track } from 'lwc';

const DEFAULT_LIMIT = 4;

export default class AhisBulletList extends LightningElement {
    @api items = [];
    @api initialLimit = DEFAULT_LIMIT;
    _resetToken;

    @track showAll = false;

    @api
    get resetToken() {
        return this._resetToken;
    }
    set resetToken(value) {
        if (value !== this._resetToken) {
            this._resetToken = value;
            this.showAll = false;
        }
    }

    get hasItems() {
        return this.items?.length > 0;
    }

    get visibleItems() {
        return this.showAll ? this.items : (this.items || []).slice(0, this.initialLimit);
    }

    get hasMore() {
        return !this.showAll && (this.items || []).length > this.initialLimit;
    }

    get hiddenCount() {
        return (this.items || []).length - this.initialLimit;
    }

    handleShowAll() {
        this.showAll = true;
    }
}
