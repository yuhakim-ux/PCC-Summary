import { LightningElement, api } from 'lwc';

export default class AhisIdentityGrid extends LightningElement {
    @api rows = [];

    get hasRows() {
        return this.rows?.length > 0;
    }
}
