import { LightningElement, api, track } from 'lwc';
export default class ReorderTable extends LightningElement {
    @api childdata;
    @api selectedId;
    @api columns;

    @track recordSelected;

    connectedCallback() {
        if(this.childdata.Id == this.selectedId){
            this.recordSelected = true;
        }
    }
}