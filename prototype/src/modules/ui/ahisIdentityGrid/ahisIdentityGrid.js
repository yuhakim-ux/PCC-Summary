import { LightningElement, api } from 'lwc';

export default class AhisIdentityGrid extends LightningElement {
    @api rows = {};

    get hasLines() {
        return this.rows?.lines?.length > 0;
    }

    get lines() {
        return (this.rows?.lines || []).map((l) => ({
            ...l,
            computedClass: l.isPrimary ? 'id-line-primary' : 'id-line',
        }));
    }
}
