import { LightningElement, api, track } from 'lwc';
import getAgreementHomePageFieldSet from '@salesforce/apex/AgreementController.getAgreementHomePageFieldSet';
import populateDefaultAgreementData from '@salesforce/apex/AgreementController.populateDefaultAgreementData';
import validateData from '@salesforce/apex/AgreementController.validateData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgreementHeaderPage extends LightningElement {
    @api recordId;
    @api objectName;
    @track fieldSetFields = []; // To store fetched field metadata
    @track showButtons = false;

    connectedCallback() {
        console.log('Object Name:', this.objectName);
        console.log('Record ID:', this.recordId);

        // Step 1: Fetch field metadata and values from Apex
        getAgreementHomePageFieldSet({ objectName: this.objectName, recordId: this.recordId })
            .then(result => {
                // Step 2: Process fetched fields
                this.fieldSetFields = result.map(field => ({
                    ...field,
                    resolvedValue: field.isLookup ? '--' : field.value // Placeholder for lookup fields
                }));
                console.log('Fetched FieldSet Fields:', JSON.stringify(this.fieldSetFields));


            this.dispatchEvent(new CustomEvent('headerloaded', {
                detail: {
                    fieldAttributes: this.fieldSetFields // Pass the field metadata
                }
            }));

                // Step 3: Check if it's a new record and populate defaults if necessary
                console.log('New record detected, populating default values...');
                return this.populateDefaults();
                
            })
            .catch(error => {
                console.error('Error fetching field set fields:', error);
                this.showToast('Error', 'Failed to load field data.', 'error');
            });
    }

    @api
    isPageValid() {
        return this.validateRequiredFields();
    }

    async populateDefaults() {
        try {
            // Step 4: Call Apex to populate default values
            const defaultedData = await populateDefaultAgreementData({
                fields: this.fieldSetFields,
                recordId: this.recordId
            });

            // Step 5: Update the fieldSetFields with defaulted data
            this.fieldSetFields = this.fieldSetFields.map(field => {
                const updatedField = defaultedData.find(f => f.fieldName === field.fieldName);
                return updatedField ? { ...field, value: updatedField.value } : field;
            });

            console.log('Updated FieldSet Fields with defaults:', JSON.stringify(this.fieldSetFields));
        } catch (error) {
            console.error('Error populating default values:', error);
            this.showToast('Error', 'Failed to populate default data.', 'error');
        }
    }

    handleFieldChange(event) {
        const fieldName = event.target.fieldName;
        const fieldValue = event.target.value;

        // Update field value in the fieldSetFields array
        this.fieldSetFields = this.fieldSetFields.map(field => {
            if (field.fieldName === fieldName) {
                return { ...field, value: fieldValue }; // Update the value for the matching field
            }
            return field;
        });

        this.showButtons = true; // Show Save/Cancel buttons when a field is changed
    }


    handleCancel() {
        // Reset fields to original values
        this.resetToOriginalFieldValues();
        this.showButtons = false; // Hide Save/Cancel buttons
    }

handleSave() {
    const isValid = this.validateRequiredFields();

    if (isValid) {
        const fieldData = {};

        // Iterate through all fields in fieldSetFields to include all fields in the payload
        this.fieldSetFields.forEach(field => {
            fieldData[field.fieldName] = field.value || '--'; // Include prepopulated, read-only, or default values
        });

        console.log('JJ field values for validation is :', JSON.stringify(fieldData));

        // Server-side validation
        validateData({ fieldValues: fieldData })
            .then((results) => {
                if (results.length === 0) {
                    // No validation errors, submit the form
                    const form = this.template.querySelector('lightning-record-edit-form');
                    if (form) {
                        form.submit(); // Submit the form
                    }

                    this.showButtons = false; // Hide Save/Cancel buttons
                    this.showToast('Success', 'Header data is saved successfully.', 'success');
                    console.log('jj fielddata is :',JSON.stringify(fieldData))
                    // Dispatch the custom event with saved data and field attributes
                    const headerSavedEvent = new CustomEvent('headersaved', {
                        detail: { 
                            fieldData, // Collected field data
                            fieldAttributes: this.fieldSetFields // Include field metadata
                        }
                    });
                    this.dispatchEvent(headerSavedEvent);
                } else {
                    // Handle validation errors
                    results.forEach(result => {
                        this.showToast(
                            'Error',
                            `Validation failed for field: ${result.fieldName}. ${result.errorMessage}`,
                            'error'
                        );
                    });
                }
            })
            .catch((error) => {
                console.error('Unexpected error during validation:', error);
                this.showToast('Error', 'An unexpected error occurred. Please try again.', 'error');
            });
    } else {
        this.showToast('Error', 'Validation failed. Please correct the fields.', 'error');
    }
}





    resetToOriginalFieldValues() {
        this.fieldSetFields = this.fieldSetFields.map(field => ({
            ...field,
            value: field.resolvedValue || '' // Reset to original resolved values
        }));
    }

    validateRequiredFields() {
        return this.fieldSetFields.every(field => {
            if (field.isRequired) {
                return field.value && field.value.trim().length > 0;
            }
            return true;
        });
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}