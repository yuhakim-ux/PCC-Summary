import { LightningElement, api } from 'lwc';

export default class AhisBulletList extends LightningElement {
    @api items = [];
    @api variant = 'default';

    get hasItems() {
        return this.items?.length > 0;
    }
}
