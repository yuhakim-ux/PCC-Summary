import { LightningElement, api } from 'lwc';

export default class AhisChipGroup extends LightningElement {
    @api items = [];
    @api summary = '';

    get hasItems() {
        return this.items?.length > 0;
    }
}
