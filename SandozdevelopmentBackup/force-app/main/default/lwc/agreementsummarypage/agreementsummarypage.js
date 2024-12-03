import { LightningElement, api, track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import updateAgreementData from '@salesforce/apex/AgreementController.updateAgreementData';
import updateAgreementLineItemData from '@salesforce/apex/AgreementController.updateAgreementLineItemData';
import generateApprovalRequests from '@salesforce/apex/AgreementController.generateApprovalRequests';
import saveAgreementDetails from '@salesforce/apex/AgreementController.saveAgreementDetails';
import getColumns from '@salesforce/apex/AgreementController.getColumns';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Agreementsummarypage extends NavigationMixin(LightningElement) {
    @track isFirstModalOpen = false;
    @track isSecondModalOpen = false;
    @track isThirdModalOpen = false;
    @api recordId;
    @api objectname;
    @track isDialogOpen = false;
    @api productData=[];
    @api fieldValues = {};
    @track formFieldChanges = [];
    @track columns=[];

    @track steps = [
        { id: 1, label: 'Step 1: Updating Agreement', completed: false },
        { id: 2, label: 'Step 2: Updating Agreement Line Items', completed: false },
        { id: 3, label: 'Step 3: Raising Approval Requests if any', completed: false },
        ];

    @track steps1 = [
        { id: 1, label: 'Step 1: Saving Agreement and Agreement Line Items Details', completed: false  },
    ];   

    @wire(getColumns, { columnData: 'agreementsummary' }) wiredColumns({data, error}){
            if (data) {
                this.dataLoading=true;
                this.columns = JSON.parse(data.Column_JSON__c);
                console.log('summarycol'+this.columns);
                }}
        handleSubmit() {
            this.isFirstModalOpen = true;
        }

    handleModalClose() {
        this.isFirstModalOpen = false;
    }

    handleSecondModalClose(){
        this.isSecondModalOpen = false;
    }

    handleThirdModalClose(){
        this.isThirdModalOpen = false;
    }

    markStepCompleted(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
        }
    }

    markStepCompleted1(stepId) {
        const step = this.steps1.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
            this.steps1 = [...this.steps1];
        }
    }

    get processedSteps1() {
        return this.steps1.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }

    markStepNotComplete(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = false;
        }
    }

    markStepNotComplete(stepId) {
        const step = this.steps1.find(s => s.id === stepId);
        if (step) {
            step.completed = false;
        }
    }

    get processedSteps() {
        return this.steps.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }

    connectedCallback() {

    }

    handleCancel() {
        this.isDialogOpen = true;
    }

    handleDialogClose() {
        this.isDialogOpen = false;
    }

    handleRedirect() {
        this.isDialogOpen = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.objectname,
                actionName: 'view'
            }
        });
    }

    combineFieldValues() {
        let resultArray = Object.keys(this.fieldValues).map(key => ({ fieldName: key, value: this.fieldValues[key] }));
        this.formFieldChanges.forEach(change => {
            let existingEntry = resultArray.find(entry => entry.fieldName === change.fieldName);
            if (existingEntry) {
                existingEntry.value = change.value;
            } else {
                resultArray.push({ fieldName: change.fieldName, value: change.value });
            }
        });
        return resultArray;
    }

    handleProceed(){
        const combinedValues = this.combineFieldValues();
        console.log('jj final values for agreements is :',JSON.stringify(combinedValues));
        console.log('jj final values for products is :',JSON.stringify(this.productData));

        if (combinedValues.length === 0 && (this.productData == null || this.productData.length === 0)) {
            this.isFirstModalOpen = false;
            this.showToast('Error', 'Error: Agreement data is unchanged and ALI data is empty.', 'error');
            this.isFirstModalOpen = false;
        }else if (combinedValues.length > 0) {
            this.isSecondModalOpen = true;
            this.isFirstModalOpen = false;
    
            updateAgreementData({ recordId: this.recordId, agreementData: JSON.stringify(combinedValues)})
            .then(response => {
                console.log('jj after first method:', response);
                if (response.success) {
                    this.markStepCompleted(1);
                    if(this.productData != null){
                        if(this.productData.length > 0){
                            updateAgreementLineItemData({ recordId: this.recordId, agreementLineItemData: JSON.stringify(this.productData)})
                            .then(configResponse1 => {
                                console.log('jj is here after second method configResponse :',configResponse1);
                                if (configResponse1.success) {
                                    console.log('jj after second method json parse :',configResponse1);
                                    this.markStepCompleted(2);
                                    generateApprovalRequests({agreementId : this.recordId})
                                    .then(approvalsResponse => {
                                        console.log('jj is here after approvals method configResponse :',configResponse1);
                                        this.markStepCompleted(3);
                                        if (approvalsResponse.success) {
                                            this.showToast('Success', 'Agreement and ALI are processed successfully.', 'success');
                                            this.dispatchEvent(new CustomEvent('generateapprovalrequests', {
                                                detail: approvalsResponse,
                                            }));
                                            setTimeout(() => {
                                            this.isSecondModalOpen = false;
                                            this.markStepNotComplete(1);
                                            this.markStepNotComplete(2);
                                            this.markStepNotComplete(3);
                                            }, 500); 
                                        }  else {
                                            this.isSecondModalOpen = false;
                                            throw new Error(approvalsResponse.message);
                                        }
                                    })
                                } else {
                                    this.isSecondModalOpen = false;
                                    throw new Error(configResponse1.message);
                                }
                            })
                        }
                    }else{
                        this.markStepCompleted(2);
                        this.showToast('Success', 'Agreement is updated successfully.', 'success');
                        setTimeout(() => {
                            this.isSecondModalOpen = false;
                            this.markStepNotComplete(1);
                            this.markStepNotComplete(2);
                        }, 500);                  
                    }
                } else {
                    this.isSecondModalOpen = false;
                    throw new Error(response.message);
                }
            })
        }
        else if (this.productData != null) {
            this.isSecondModalOpen = true;
            this.isFirstModalOpen = false;
            this.markStepCompleted(1);
    
            updateAgreementLineItemData({ recordId: this.recordId, agreementLineItemData: JSON.stringify(this.productData)})
            .then(configResponse1 => {
                console.log('jj after second method configResponse :',configResponse1);
                if (configResponse1.success) {
                    console.log('jj after second method json parse :',configResponse1);
                    this.markStepCompleted(2);
                    this.showToast('Success', 'ALI are processed successfully.', 'success');
                    setTimeout(() => {
                        this.isSecondModalOpen = false;
                        this.markStepNotComplete(1);
                        this.markStepNotComplete(2);
                    }, 500); 
                } else {
                    this.isSecondModalOpen = false;
                    throw new Error(configResponse1.message);
                }
            })
        }
    }

    handleSave(){
        const combinedValues = this.combineFieldValues();
        console.log('jj final values for agreements is :',JSON.stringify(combinedValues));
        console.log('jj final values for products is :',JSON.stringify(this.productData));

        if (this.productData != null && combinedValues.length > 0) {
            this.isThirdModalOpen = true;
    
            saveAgreementDetails({ recordId: this.recordId, agreementData: JSON.stringify(combinedValues), agreementLineItemData: JSON.stringify(this.productData)})
            .then(configResponse1 => {
                console.log('jj after second method configResponse :',configResponse1);
                if (configResponse1.success) {
                    console.log('jj after second method json parse :',configResponse1);
                    this.markStepCompleted1(1);
                    this.showToast('Success', 'Agreement and Line Items saved successfully.', 'success');
                    setTimeout(() => {
                        this.isThirdModalOpen = false;
                        this.markStepNotComplete(1);
                    }, 500); 
                } else {
                    this.isThirdModalOpen = false;
                    throw new Error(configResponse1.message);
                }
            })
        }
        else{
            this.showToast('Error', 'Error: Agreement data is unchanged and ALI data is empty.', 'error');
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}