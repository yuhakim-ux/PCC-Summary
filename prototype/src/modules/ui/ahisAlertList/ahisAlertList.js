import { LightningElement, api, track } from 'lwc';

const DEFAULT_LIMIT = 4;

export default class AhisAlertList extends LightningElement {
    @api items = [];
    @api initialLimit = DEFAULT_LIMIT;

    @track showAll = false;

    get hasItems() {
        return this.items?.length > 0;
    }

    get normalizedItems() {
        return (this.items || []).map((item, i) => ({
            key: item.key || `alert-${i}`,
            text: item.text,
            className: `alert-item alert-${item.level || 'info'}`,
            dotClass: `dot dot-${item.level || 'info'}`,
        }));
    }

    get visibleItems() {
        return this.showAll ? this.normalizedItems : this.normalizedItems.slice(0, this.initialLimit);
    }

    get hasMore() {
        return !this.showAll && this.normalizedItems.length > this.initialLimit;
    }

    get hiddenCount() {
        return this.normalizedItems.length - this.initialLimit;
    }

    handleShowAll() {
        this.showAll = true;
    }
}
