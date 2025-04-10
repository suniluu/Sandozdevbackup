import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import validateData from '@salesforce/apex/OrderRequestAddToCart.validateData';

export default class EntryComponent extends LightningElement {
    @api objectName;
    @api recId
    @api fieldSet;
    @api fields;
    @api preSelectedRows ;
    @api preFastSelectedRows;
    @api cartCount;
    @track isLoading = false;
    @track showButtons = false;
    accumulatedFieldData = {};
    modifiedFields={};

    connectedCallback() {
        this.isLoading=true;
        this.accumulatedFieldData = [...this.fields];
    }

    onloaded(){
        this.isLoading=false;
    }

    handleFieldChange(event){
        this.modifiedFields[event.target.fieldName] = true;
        this.fields = this.fields.map(field => {
            if (field.fieldName === event.target.fieldName) {
                return { ...field, value: event.target.value };
            }
            return field;
        });
        this.showButtons = true;
    }

    saveClick(e){
        const inputFields = e.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(inputFields);
    }

    validateFields() {
        let isValid = true;

        // Iterate over all lightning-input-field elements and validate them
        isValid = [...this.template.querySelectorAll("lightning-input-field")].reduce((validSoFar, field) => {
            return (validSoFar && field.reportValidity());
        }, isValid);
        
        return isValid;
    }


    handleSuccess(e)
    {
        this.showMessage('Record Saved Successfully','success');
    }

    resetToOriginalFieldValues() {
        this.fields = this.fields.map(field => {
            if (this.modifiedFields[field.fieldName]) {
                const originalFieldData = this.accumulatedFieldData.find(data => data.fieldName === field.fieldName);
                return {
                    ...field,
                    value: originalFieldData ? originalFieldData.value : ' '
                };
            }
            return field;
        });
        this.modifiedFields = {};
        this.showButtons = false;
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
    handleCancel() {
        // Reset fields to original values
        this.resetToOriginalFieldValues();
        this.showButtons = false; // Hide Save/Cancel buttons
    }
    showToastEvent(etitle,emessage,evariant){
        const event = new ShowToastEvent({
            title: etitle,
            message: emessage,
            variant: evariant
        });
        this.dispatchEvent(event);
    }

    handleSave(){
        if (this.validateFields()) {
            const fieldData = {};
            this.fields.forEach(field => {
                fieldData[field.fieldName] = field.value;
            });
            const modifiedfieldData = {};
            this.fields.forEach(field => {
                if(this.modifiedFields[field.fieldName] == true){
                    modifiedfieldData[field.fieldName] = field.value;
                }   
            });
            let cartProductCount =0;
            if(this.cartCount){
                cartProductCount = this.cartCount?this.cartCount:0;
            }
            validateData({ fieldValues: fieldData ,updatedfieldValues:modifiedfieldData, cartcount:cartProductCount})
                .then((results) => {
                    if (results.length === 0) {
                        // No validation errors, submit the form
                        const form = this.template.querySelector('lightning-record-edit-form');
                        if (form) {
                            form.submit(); // Submit the form
                        }
                        this.showButtons = false; // Hide Save/Cancel buttons
                        // Dispatch the custom event with saved data and field attributes
                        const entrySavedEvent = new CustomEvent('entrysaved', {
                            detail: { 
                                fieldData, // Collected field data
                                fieldAttributes: this.fields // Include field metadata
                            }
                        });
                        this.dispatchEvent(entrySavedEvent);
                        this.accumulatedFieldData = [...this.fields];
                        this.modifiedFields={};

                    } else {
                        // Handle validation errors
                        results.forEach(result => {
                            this.showToastEvent('Error',`Validation failed for field: ${result.fieldName}. ${result.errorMessage}`,'error');
                        });
                    }
                })
                .catch((error) => {
                    console.error('Unexpected error during validation:', error);
                    this.showToastEvent('Error', 'An unexpected error occurred. Please try again.', 'error');
                });
        } else {
            this.showToastEvent('Error', 'Validation failed. Please correct the fields.', 'error');
        }
    }
}