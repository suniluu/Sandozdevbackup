import { LightningElement,api } from 'lwc';

export default class FamilyCombobox extends LightningElement {

    @api dropdownoptions;
    @api dropdownValue;
    @api value;
    @api recordId;
    @api productId;
    @api isFamily;

    connectedCallback() {
        //code
    }

    handleChange(event){
        let selectedData = {selectedRecord: event.detail.value, rowId: this.recordId,productId: this.productId, discount: this.discount, quantity: this.quantity };
        const selectedEvent = new CustomEvent('dropdownfamilyselected', {
            detail: selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
}