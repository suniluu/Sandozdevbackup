import { LightningElement, api, track } from 'lwc';
import getAgreementHomePageFieldSet from '@salesforce/apex/AgreementController.getAgreementHomePageFieldSet';
import populateDefaultAgreementData from '@salesforce/apex/AgreementController.populateDefaultAgreementData';
import validateData from '@salesforce/apex/AgreementController.validateData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgreementHeaderPage extends LightningElement {
    @api recordId;
    @api objectName;
    @track fieldSetFields = [];
    @track showButtons = false;
    @api notAgreement;
    @api isAgreement;
    originalFieldValues = {}; // Store original field values
    modifiedFields = {}; // Track which fields have been updated by the user

    connectedCallback() {
        console.log('Object Name:', this.objectName);
        console.log('Record ID:', this.recordId);

        getAgreementHomePageFieldSet({ objectName: this.objectName, recordId: this.recordId })
            .then(result => {
                this.fieldSetFields = result.map(field => ({
                    ...field,
                    resolvedValue: field.isLookup ? '--' : field.value
                }));
                
                // Store original values for resetting
                this.originalFieldValues = this.fieldSetFields.reduce((acc, field) => {
                    acc[field.fieldName] = field.value;
                    return acc;
                }, {});

                console.log('Fetched FieldSet Fields:', JSON.stringify(this.fieldSetFields));

                this.dispatchEvent(new CustomEvent('headerloaded', {
                    detail: {
                        fieldAttributes: this.fieldSetFields
                    }
                }));

                return this.populateDefaults();
            })
            .catch(error => {
                console.error('Error fetching field set fields:', error);
                this.showToast('Error', 'Failed to load field data.', 'error');
            });
    }

    async populateDefaults() {
        try {
            const defaultedData = await populateDefaultAgreementData({
                fields: this.fieldSetFields,
                recordId: this.recordId
            });

            this.fieldSetFields = this.fieldSetFields.map(field => {
                const updatedField = defaultedData.find(f => f.fieldName === field.fieldName);
                return updatedField ? { ...field, value: updatedField.value } : field;
            });

            // Update original values after defaults
            this.originalFieldValues = this.fieldSetFields.reduce((acc, field) => {
                acc[field.fieldName] = field.value;
                return acc;
            }, {});

            console.log('Updated FieldSet Fields with defaults:', JSON.stringify(this.fieldSetFields));
        } catch (error) {
            console.error('Error populating default values:', error);
            this.showToast('Error', 'Failed to populate default data.', 'error');
        }
    }

    handleFieldChange(event) {
        const fieldName = event.target.fieldName;
        const fieldValue = event.target.value;

        // Track the fields that were modified
        this.modifiedFields[fieldName] = true;

        // Update field value in the fieldSetFields array
        this.fieldSetFields = this.fieldSetFields.map(field => {
            if (field.fieldName === fieldName) {
                return { ...field, value: fieldValue };
            }
            return field;
        });

        this.showButtons = true;
    }

    handleCancel() {
        // Revert only the modified fields to their original values
        this.fieldSetFields = this.fieldSetFields.map(field => {
            if (this.modifiedFields[field.fieldName]) {
                return {
                    ...field,
                    value: this.originalFieldValues[field.fieldName] || ''
                };
            }
            return field;
        });

        // Clear modified fields tracking
        this.modifiedFields = {};

        this.showButtons = false; // Hide Save/Cancel buttons
    }

    handleSave() {
        const isValid = this.validateRequiredFields();

        if (isValid) {
            const fieldData = {};

            this.fieldSetFields.forEach(field => {
                fieldData[field.fieldName] = field.value || '--';
            });

            validateData({ fieldValues: fieldData })
                .then(results => {
                    if (results.length === 0) {
                        const form = this.template.querySelector('lightning-record-edit-form');
                        if (form) {
                            form.submit();
                        }

                        this.showButtons = false;
                        this.showToast('Success', 'Header data is saved successfully.', 'success');

                        const headerSavedEvent = new CustomEvent('headersaved', {
                            detail: {
                                fieldData,
                                fieldAttributes: this.fieldSetFields
                            }
                        });
                        this.dispatchEvent(headerSavedEvent);
                    } else {
                        results.forEach(result => {
                            this.showToast(
                                'Error',
                                `Validation failed for field: ${result.fieldName}. ${result.errorMessage}`,
                                'error'
                            );
                        });
                    }
                })
                .catch(error => {
                    console.error('Unexpected error during validation:', error);
                    this.showToast('Error', 'An unexpected error occurred. Please try again.', 'error');
                });
        } else {
            this.showToast('Error', 'Validation failed. Please correct the fields.', 'error');
        }
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