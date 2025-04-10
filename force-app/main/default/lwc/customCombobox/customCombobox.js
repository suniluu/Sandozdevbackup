import { LightningElement,track,api } from 'lwc';
export default class CustomCombobox extends LightningElement {
    @api options;
    @api selectedValue;
    @api value;
    @api recordId;
    @api productId;
    @api discount;
    @api quantity;

    // renderedCallback() {
    //     if (!this.selectedValue && this.options.length > 0) {
    //         this.selectedValue = this.options[0].value; // Default to first option if not set
    //     }
    // }

    handleChange(event){
        let selectedData = {selectedRecord: event.detail.value, rowId: this.recordId,productId: this.productId, discount: this.discount, quantity: this.quantity };
        const selectedEvent = new CustomEvent('dropdownselected', {
            detail: selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
}