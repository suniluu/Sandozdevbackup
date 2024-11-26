import { LightningElement,track,api } from 'lwc';
export default class CustomCombobox extends LightningElement {
    @api options;
    @api selectedValue;
    @api value;
    @api recordId;
    @api productId;
    @api discount;
    @api quantity;

    handleChange(event){
        let selectedData = {selectedRecord: event.detail.value, rowId: this.recordId,productId: this.productId, discount: this.discount, quantity: this.quantity };
        const selectedEvent = new CustomEvent('dropdownselected', {
            detail: selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
}