import { LightningElement,api } from 'lwc';
export default class Atpcomp extends LightningElement {
    @api value;

    connectedCallback() {
        this.value = 'dot';
    }

    removeRow(event){
        let data={index: this.value,name: event.target.title};
        const selectEvent = new CustomEvent('remove', {
            detail: data ,bubbles: true, composed: true
        });
        this.dispatchEvent(selectEvent);
    }
}