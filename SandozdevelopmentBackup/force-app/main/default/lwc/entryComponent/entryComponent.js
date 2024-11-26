import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EntryComponent extends LightningElement {
    @api objectName;
    @api recId
    @api fieldSet;
    @api fields;
    @track isLoading = false;
    accumulatedFieldData = [];

    connectedCallback() {
        this.isLoading=true;
        this.accumulatedFieldData = this.fields.map(field => ({
            fieldName: field.fieldName,
            value: field.value || '',
            label: field.label
        }));
    }

    onloaded(){
        this.isLoading=false;
    }

    handleFieldChange(event){
        let selectedData = {fieldName: event.target.fieldName, value: event.target.value, label : event.target.fieldLabel};
        const selectedEvent = new CustomEvent('valueselected', {
            detail: selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }

    saveClick(e){
        const inputFields = e.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(inputFields);
    }

    validateFields() {
        return [...this.template.querySelectorAll("lightning-input-field")].reduce((validSoFar, field) => {
            return (validSoFar && field.reportValidity());
        }, true);
    }

    handleSuccess(e)
    {
        this.showMessage('Record Saved Successfully','success');
    }

    handleError(e)
    {
        this.template.querySelector('[data-id="message"]').setError(e.detail.detail);
        e.preventDefault();
    }

    showMessage(message,variant)
    {
        const event = new ShowToastEvent({
            title: 'Record Save',
            variant: variant,
            mode: 'dismissable',
            message: message
        });
        this.dispatchEvent(event);
    }
}