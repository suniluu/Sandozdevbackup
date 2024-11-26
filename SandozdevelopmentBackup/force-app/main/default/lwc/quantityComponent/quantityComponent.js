import { LightningElement,api } from 'lwc';
export default class QuantityComponent extends LightningElement {
    @api value;

    connectedCallback() {
        console.log(this.value);
    }
}