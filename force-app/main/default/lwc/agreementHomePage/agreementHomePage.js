import { LightningElement, wire, api, track } from 'lwc';
import Scalefluidly from "@salesforce/resourceUrl/Scalefluidly";
import getexistinglineitems from '@salesforce/apex/AgreementController.getexistinglineitems';
import getFieldDataFromMetadata from '@salesforce/apex/AgreementController.getFieldDataFromMetadata';
import getLookupFieldNames from '@salesforce/apex/AgreementController.getLookupFieldNames';
import getApprovalDetails1 from '@salesforce/apex/AgreementController.getApprovalDetails1';
import getApprovalObjMetadata from '@salesforce/apex/AgreementController.getApprovalObjMetadata';
import getAgreementRequestSettingMetadata from '@salesforce/apex/AgreementController.getAgreementRequestSettingMetadata';

import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class AgreementHomePage extends LightningElement {
    scalefluidlyLogo = Scalefluidly;
    @api recordId;
    @api objectapiname;
    @api objectName;
    @api recordtypename;
    @api recordtype;
    @api productdata;
    @api rawFieldSetData;
    @api fieldValues = {};
    @api childFieldData = [];
    @api deleteRecordData;
    @api currentStep = '1';
    @track displayerror = false;
    @track checkingvalue = false;

    @track cartCount = 0;
    @api index = 1;
    @track initialRecords = [];
    @track orderReduestLoaded = false;
    @track discountdataprod = [];
    @track initialData = [];
    @track lineitems = [];
    @track prodDatas = [];
    @track fieldDataWithLabels = [];
    @track preSelecteCatelog;
    @track preSelectedRows;
    @track preFastSelectedRows;
    @track preSelectedFast;
    @track oldstep = '';
    @track agreementId = '';
    @track approvalDetails = [];
    @track approvaldata;
    @track isAgreementPath = [];
    @track isAgreement = '';
    @track notAgreement = '';
    @track approvalDetailPath;
    @track signaturePath;

    firstPageClass = 'show-div';
    secondPageClass = 'hide-div';
    thirdPageClass = 'hide-div';
    fourthPageClass = 'hide-div';
    fifthPageClass = 'hide-div';
    sixthPageClass = 'hide-div';

    handleTabClick(event) {
        const selectedStep = event.target.value;
        if (this.checkingvalue == true && selectedStep > 3) {
            const event = new ShowToastEvent({
                title: "Error",
                message: "PLS click on validate pricing button once",
                variant: "error",
                mode: "dismissable"
            });
            this.dispatchEvent(event);
        } else {
            console.log(this.oldstep < selectedStep + '  this.oldstep < selectedStep');
            console.log(this.oldstep + 'oldstep');

            if (this.displayerror == true && this.oldstep < selectedStep) {
                const event = new ShowToastEvent({
                    title: "Error",
                    message: "There are error in cuurent You cant got to nxt page",
                    variant: "error",
                    mode: "dismissable"
                });
                this.dispatchEvent(event);
            } else {

                if (parseInt(selectedStep) > parseInt(this.currentStep)) {
                    const canNavigate = this.validateCurrentStep();
                    if (canNavigate) {
                        this.currentStep = selectedStep;

                        this.handleSetUpSteps();
                    } else {
                        console.error('Validation failed. Please complete all required fields.');
                    }
                } else {
                    this.currentStep = selectedStep;
                    this.handleSetUpSteps();
                }
            }
            if (parseInt(selectedStep) > parseInt(this.currentStep)) {
                const canNavigate = this.validateCurrentStep();
                if (canNavigate) {
                    this.currentStep = selectedStep;
                    this.handleSetUpSteps();
                } else {
                    this.showToast('Error', 'Please complete all required fields before proceeding.', 'error');
                }
            } else {
                this.currentStep = selectedStep;
                this.handleSetUpSteps();
            }
        }

    }
    discount(event) {
        this.discountdataprod = event.detail.productdata;
        this.index = event.detail.index;
        this.cartCount = this.discountdataprod.length;
    }

    /*handleHeaderSaved(event) {
        const { fieldData, fieldAttributes } = event.detail;
        this.fieldValues = { ...this.fieldValues, ...fieldData };

        this.fieldDataWithLabels = fieldAttributes.map(field => ({
            fieldName: field.fieldName,
            label: field.label,
            value: fieldData[field.fieldName],
            isReadOnly: field.isReadOnly,
            isPriceList: field.isPriceList,
            isRequired: field.isRequired
        }));

        console.log('JJ Parent Updated fieldDataWithLabels:', JSON.stringify(this.fieldDataWithLabels));
    }*/

    handleHeaderSaved(event) {
        const { fieldData, fieldAttributes } = event.detail;
        const mergedFieldAttributes = fieldAttributes.map(attribute => ({
            ...attribute,
            value: fieldData[attribute.fieldName] || attribute.value || '--', // Populate value from fieldData or fallback
        }));
        // Store the merged field attributes in rawFieldSetData
        this.rawFieldSetData = [...mergedFieldAttributes];

        console.log('JJ Filtered rawFieldSetData (Before Lookup):', JSON.stringify(this.rawFieldSetData));
        const metadataFieldNames = this.fieldDataWithLabels.map(field => field.fieldName);

        const filteredFieldSet = metadataFieldNames.map(fieldName => {
            const rawField = this.rawFieldSetData.find(field => field.fieldName === fieldName) || {};
            const updatedField = { ...rawField };

            updatedField.fieldName = fieldName;
            updatedField.label = rawField.label || this.fieldDataWithLabels.find(f => f.fieldName === fieldName)?.label || '--';
            updatedField.value = fieldData[fieldName] || rawField.value || '--';

            return updatedField;
        });

        console.log('JJ Filtered FieldSet (Before Lookup):', JSON.stringify(filteredFieldSet));

        const lookupFields = filteredFieldSet.filter(field => field.isLookup && field.value && field.value !== '--');

        if (lookupFields.length > 0) {
            const idsToResolve = lookupFields.map(field => field.value);

            console.log('JJ Lookup IDs to resolve:', idsToResolve);

            getLookupFieldNames({ ids: idsToResolve })
                .then(nameMap => {
                    filteredFieldSet.forEach(field => {
                        if (field.isLookup && nameMap[field.value]) {
                            field.value = nameMap[field.value];
                        }
                    });

                    this.fieldDataWithLabels = filteredFieldSet;
                    console.log('jj fieldDataWithLabels 147 :: ' + JSON.stringify(this.fieldDataWithLabels));
                    this.navigateNext();
                })
                .catch(error => {
                    console.error('Error fetching lookup field names:', error);
                });
        } else {
            this.fieldDataWithLabels = filteredFieldSet;
            this.navigateNext();
        }
    }

    navigateNext() {
        if (parseInt(this.currentStep) < 6) {
            this.currentStep = (parseInt(this.currentStep) + 1).toString();
            this.handleSetUpSteps();
            console.log('Navigated to Step:', this.currentStep);
        } else {
            console.log('Already at the last step.');
        }
    }

    validateCurrentStep() {
        const headerComponent = this.template.querySelector('c-agreement-header-page');
        if (headerComponent && this.currentStep === '1') {
            // Use the child's validation method to determine if the page is valid
            return headerComponent.isPageValid();
        }
        return true;
    }


    handleGenerateApprovalRequests(event) {
        const approvalsResponse = event.detail.approvalsResponse;
        this.agreementId = event.detail.agreementId;
        if (approvalsResponse.success) {
            getApprovalObjMetadata({})
                .then((data) => {
                    const productToUsed = data[0].Approval_Product_To_Be_Used__c;
                    console.log('agreement home page Product to used ::: ' + productToUsed);
                    getApprovalDetails1({ agreementId: this.agreementId, approvalProduct: productToUsed })
                        .then((data) => {
                            if (data && Array.isArray(data)) {
                                this.approvalDetails = data.map(item => item.Actor);
                                console.log('agreement home page jj approvals data is :', JSON.stringify(this.approvalDetails));
                                this.approvaldata = true;


                                console.log('agreement home page jj approvals data is :', this.approvalDetails);
                            }
                            this.error = undefined;
                        })
                        .catch((error) => {
                            this.error = error;
                            this.approvalDetails = [];
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error loading approval details',
                                    message: error.body.message,
                                    variant: 'error',
                                })
                            );
                        });
                })
                .catch((error) => {
                    this.error = error;
                    this.approvalDetails = [];
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error loading approval details',
                            message: error.body.message,
                            variant: 'error',
                        })
                    );
                });
            this.refreshApprovals = true;
            setTimeout(() => {
                this.refreshApprovals = false;
            }, 0);
        } else {
            this.showToast('Error', approvalsResponse.message, 'error');
        }
    }

    handleSetUpSteps() {

        if (!this.orderReduestLoaded && this.currentStep == 2) {
            this.orderReduestLoaded = true;
        } else if (this.orderReduestLoaded && this.currentStep == 1) {
            this.orderReduestLoaded = false;
        }
        this.firstPageClass = this.currentStep === '1' ? 'show-div' : 'hide-div';
        this.secondPageClass = this.currentStep === '2' ? 'show-div' : 'hide-div';
        this.thirdPageClass = this.currentStep === '3' ? 'show-div' : 'hide-div';
        this.fourthPageClass = this.currentStep === '4' ? 'show-div' : 'hide-div';
        this.fifthPageClass = this.currentStep === '5' ? 'show-div' : 'hide-div';
        this.sixthPageClass = this.currentStep === '6' ? 'show-div' : 'hide-div';

    }

    handleFieldChange(event) {
        const { fieldName, fieldValue, relatedId } = event.detail;
        console.log('Field Change Detected:', fieldName, '=', fieldValue, 'Related ID:', relatedId);

        this.fieldValues[fieldName] = fieldValue;

        this.fieldDataWithLabels = this.fieldDataWithLabels.map(field => {
            if (field.fieldName === fieldName) {
                return { ...field, value: fieldValue, relatedId: relatedId };
            }
            return field;
        });
        console.log('Updated fieldDataWithLabels in Parent:', JSON.stringify(this.fieldDataWithLabels));
    }


    handleFieldValuesChange(event) {
        this.fieldValues = event.detail.fieldValues;
    }

    connectedCallback() {
        getAgreementRequestSettingMetadata({ devName: 'Agreement_Settings' })
            .then(result => {
                let conditionMet = result.some(obj =>
                    obj.DeveloperName === 'Agreement_Settings' && obj.Is_Agreement_Accelerator__c === true);
                let approvaldetail = result.some(obj =>
                    obj.DeveloperName === 'Agreement_Settings' && obj.Is_Approval_Detail__c === true);
                let signature = result.some(obj =>
                    obj.DeveloperName === 'Agreement_Settings' && obj.Is_Signature__c === true);
                console.log('condition :: ' + conditionMet);
                console.log('approvaldetail :: ' + approvaldetail);
                console.log('signature :: ' + signature);
                if (conditionMet) {
                    this.isAgreement = true;
                    this.notAgreement = false;
                }else {
                    this.isAgreement = false;
                    this.notAgreement = true;
                }
                this.approvalDetailPath = approvaldetail ? true : false;
                this.signaturePath = signature ? true : false;

            })
            .catch(error => {
                console.error('Error:', error);
            });
        console.log('JJ Connected callback parent Filtered rawFieldSetData (Before Lookup):', JSON.stringify(this.rawFieldSetData));
        console.log('JJ Filtered objectapiname :', JSON.stringify(this.objectapiname));
        getFieldDataFromMetadata({ recordId: this.recordId, objectName: this.objectName })
            .then(result => {
                this.fieldDataWithLabels = result.map(field => ({
                    fieldName: field.fieldName,
                    label: field.label,
                    value: field.value || '--',
                    isReadOnly: field.isReadOnly,
                    isRequired: field.isRequired
                }));
                console.log('JJ parent the fieldData is :', JSON.stringify(this.fieldDataWithLabels));
            })
            .catch(error => {
                console.error('Error:', error);
            });

        getexistinglineitems({ recordId: this.recordId })
            .then(result => {
                this.cartCount = result.length;
                this.lineitems = result;
                let productDataWithIndex = result;
                const existLines = result.map(item => {
                    return { ...item, recordId: item.productId };
                });
                const existindRecords = existLines.map((item) => item.recordId);
                this.preSelectedRows = existindRecords;
                this.preSelecteCatelog = this.preSelectedRows;
                if (result && Array.isArray(result) && result.length > 0) {
                    this.checkingvalue = false;
                    console.log('inside jj check');
                    this.currentStep = '4';
                    this.fourthPageClass = '4';
                    this.firstPageClass = 'hide-div';
                    this.fourthPageClass = 'show-div';
                }
                let productsArray = [];
                let valuesArray = [];

                if (this.discountdataprod.length > 0) {
                    for (let i = 0; i < productDataWithIndex.length; i++) {
                        let found = false;
                        for (let j = 0; j < this.discountdataprod.length; j++) {
                            if (productDataWithIndex[i].productId === this.discountdataprod[j].productId) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            productsArray.push(productDataWithIndex[i]);
                        }
                    }
                    valuesArray = productsArray;
                } else {
                    valuesArray = productDataWithIndex
                }

                var dataArray = [];
                for (var i = 0; i < valuesArray.length; i++) {
                    var obj = { ...valuesArray[i] };
                    obj.recordIndex = this.index++;
                    dataArray.push(obj);
                }
                productDataWithIndex = dataArray;
                if (this.discountdataprod.length > 0) {
                    this.productdata = productDataWithIndex.concat(this.discountdataprod);
                    this.initialData = this.initialData ? this.initialData.concat(productDataWithIndex) : productDataWithIndex;
                    this.initialRecords = this.productdata;
                    this.discountdataprod = productDataWithIndex.concat(this.discountdataprod);
                } else {
                    this.productdata = productDataWithIndex;
                    this.initialData = this.initialData ? this.initialData.concat(productDataWithIndex) : productDataWithIndex;
                    this.initialRecords = this.productdata;
                    this.discountdataprod = productDataWithIndex;
                }
            })
            .catch(error => {
                this.error = error;
                console.log(JSON.stringify(error) + 'error');
            })
        console.log('getAgreementRequestSettingMetadata');





    }



    handleHeaderLoaded(event) {
        this.rawFieldSetData = event.detail.fieldAttributes;
        console.log('JJ Parent received initial field attributes:', JSON.stringify(this.rawFieldSetData));
    }


    deletedata(event) {
        this.deleteRecordData = event.detail;
        if (this.deleteRecordData.length > 0) {
            this.deletedRecord = this.deleteRecordData.map(item => {
                if (!item.recordId) {
                    return { ...item, recordId: item.productId };
                } else {
                    return item;
                }

            });
            if (this.preSelecteCatelog) {
                const deletedIds = this.deletedRecord.map(
                    (item) => item.recordId
                );
                console.log('deletedIds: ', JSON.stringify(deletedIds));
                this.preSelectedRows = this.preSelecteCatelog.filter(item => !deletedIds.includes(item));
                this.preSelecteCatelog = this.preSelectedRows;
            }
            if (this.preSelectedFast) {
                const deletedIds = this.deleteRecordData.map(
                    (item) => item.recordId
                );
                this.preFastSelectedRows = this.preSelectedFast.filter(item => !deletedIds.includes(item));
                this.preSelectedFast = this.preFastSelectedRows;
            }
             this.checkingvalue = true ;
        }
        
       
   

    }

    handlegetproductselections(event) {
        this.prodDatas = event.detail.selectedrows;
        this.preSelecteCatelog = event.detail.preselected;
        this.preSelectedFast = event.detail.fastpreSelect;
        let productDataWithIndex = event.detail.selectedrows;


        let productsArray = [];
        let valuesArray = [];

        if (this.discountdataprod.length > 0) {
            for (let i = 0; i < productDataWithIndex.length; i++) {
                let found = false;
                for (let j = 0; j < this.discountdataprod.length; j++) {
                    if (productDataWithIndex[i].productId === this.discountdataprod[j].productId) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    productsArray.push(productDataWithIndex[i]);
                }
            }
            valuesArray = productsArray;
        } else {
            valuesArray = productDataWithIndex
        }
        var dataArray = [];
        for (var i = 0; i < valuesArray.length; i++) {

            var obj = { ...valuesArray[i] };
            obj.recordIndex = this.index++;
            obj.netPrice = obj.listPrice ? obj.listPrice : 0;
            dataArray.push(obj);

        }
        productDataWithIndex = dataArray;
        this.checkingvalue = true;
        console.log(this.checkingvalue + 'this.checkingvalue');
        if (this.discountdataprod.length > 0) {
            this.productdata = this.discountdataprod.concat(productDataWithIndex);
            this.initialData = this.initialData ? this.initialData.concat(productDataWithIndex) : productDataWithIndex;
            this.initialRecords = this.productdata;
            this.discountdataprod = this.discountdataprod.concat(productDataWithIndex);
        } else {
            this.productdata = productDataWithIndex;
            this.initialData = this.initialData ? this.initialData.concat(productDataWithIndex) : productDataWithIndex;
            this.initialRecords = this.productdata;
            this.discountdataprod = productDataWithIndex;
        }
        this.cartCount = this.productdata.length;
        console.log(JSON.stringify(this.productdata) + ' product data');
    }
    errormsg(event) {
        this.oldstep = this.currentStep;


        const errormsg = event.detail.errormsg ? event.detail.errormsg : '';
        console.log('home this.errormsg  ' + event.detail.errormsg);
        this.displayerror = event.detail.displayerror ? event.detail.displayerror : '';
        console.log(' this.displayerror  ' + event.detail.displayerror);
        this.checkingvalue = event.detail.checkingvalue ? event.detail.checkingvalue : '';
        console.log(' this.checkingvalue' + this.checkingvalue);
       
        if (this.displayerror == true) {
            const event = new ShowToastEvent({
                title: "Error",
                message: errormsg,
                variant: "error",
                mode: "dismissable"
            });
            console.log('event' + JSON.stringify(event));
            this.dispatchEvent(event);
        }
    }
}