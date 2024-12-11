import { LightningElement, api, track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import updateAgreementData from '@salesforce/apex/AgreementController.updateAgreementData';
import updateAgreementLineItemData from '@salesforce/apex/AgreementController.updateAgreementLineItemData';
import generateApprovalRequests from '@salesforce/apex/AgreementController.generateApprovalRequests';
import saveAgreementDetails from '@salesforce/apex/AgreementController.saveAgreementDetails';
import getApprovalsRelatedData from '@salesforce/apex/AgreementController.getApprovalsRelatedData';
import getNavigationSettings from '@salesforce/apex/AgreementController.getNavigationSettings';
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
    @api rawdata = {};
    @api approvalProduct = null;
     @track buttondata = [];
    @api autoApprovals = null; 
     @api notAgreement;
    @api isAgreement;

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

    /*connectedCallback() {
        console.log('jj summary page raw data is :', JSON.stringify(this.rawdata));
        getApprovalsRelatedData()
            .then((result) => {
                if (result.length > 0) {
                    this.approvalProduct = result[0];
                    this.autoApprovals = result[1] === 'true'; // Convert string to boolean
                }
                console.log('Approval Product:', this.approvalProduct);
                console.log('Automatic Approvals:', this.autoApprovals);

                // Dynamically set steps based on autoApprovals
                if (this.autoApprovals) {
                    this.steps = [
                        { id: 1, label: 'Step 1: Updating Agreement', completed: false },
                        { id: 2, label: 'Step 2: Updating Agreement Line Items', completed: false },
                        { id: 3, label: 'Step 3: Raising Approval Requests if any', completed: false },
                    ];
                } else {
                    this.steps = [
                        { id: 1, label: 'Step 1: Updating Agreement', completed: false },
                        { id: 2, label: 'Step 2: Updating Agreement Line Items', completed: false },
                    ];
                }

                console.log('Steps:', JSON.stringify(this.steps));
            })
            .catch((error) => {
                console.error('Error fetching approvals-related data:', error);
                this.showToast('Error', 'Failed to fetch approvals-related data.', 'error');
            });

            
    }*/

    connectedCallback() {
    console.log('jj summary page raw data is :', JSON.stringify(this.rawdata));

    // Fetch approvals-related data
    getApprovalsRelatedData()
        .then((result) => {
            if (result.length > 0) {
                this.approvalProduct = result[0];
                this.autoApprovals = result[1] === 'true'; // Convert string to boolean
            }
            console.log('Approval Product:', this.approvalProduct);
            console.log('Automatic Approvals:', this.autoApprovals);

            // Dynamically set steps based on autoApprovals
            if (this.autoApprovals) {
                this.steps = [
                    { id: 1, label: 'Step 1: Updating Agreement', completed: false },
                    { id: 2, label: 'Step 2: Updating Agreement Line Items', completed: false },
                    { id: 3, label: 'Step 3: Raising Approval Requests if any', completed: false },
                ];
            } else {
                this.steps = [
                    { id: 1, label: 'Step 1: Updating Agreement', completed: false },
                    { id: 2, label: 'Step 2: Updating Agreement Line Items', completed: false },
                ];
            }

            console.log('Steps:', JSON.stringify(this.steps));

            // Fetch navigation settings
            return getNavigationSettings();
        })
        .then((navigationSettings) => {
            this.navigateToAgreement = navigationSettings.NavigateToAgreement === true || navigationSettings.NavigateToAgreement === 'true';
            this.homePageObjectName = navigationSettings.HomePageObjectName;

            console.log('Navigate to Agreement:', this.navigateToAgreement);
            console.log('Home Page Object Name:', this.homePageObjectName);
        })
        .catch((error) => {
            console.error('Error initializing component:', error);
            this.showToast('Error', 'Failed to initialize component.', 'error');
        });
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
        // Step 1: Start with rawdata
        let resultArray = this.rawdata.map(item => ({
            fieldName: item.fieldName, // Use the actual fieldName from the object
            value: item.value || '--' // Default to '--' if value is null or undefined
        }));

        // Step 2: Incorporate fieldValues (if any) to override or add
        Object.keys(this.fieldValues).forEach(key => {
            let existingEntry = resultArray.find(entry => entry.fieldName === key);
            if (existingEntry) {
                existingEntry.value = this.fieldValues[key];
            } else {
                resultArray.push({ fieldName: key, value: this.fieldValues[key] });
            }
        });

        return resultArray;
    }



    /*handleProceed(){
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
    }*/

    handleProceed() {
        const combinedValues = this.combineFieldValues();
        console.log('jj final values for agreements is :', JSON.stringify(combinedValues));
        console.log('jj final values for products is :', JSON.stringify(this.productData));

        if (combinedValues.length === 0 && (this.productData == null || this.productData.length === 0)) {
            this.isFirstModalOpen = false;
            this.showToast('Error', 'Error: Agreement data is unchanged and ALI data is empty.', 'error');
        } else if (combinedValues.length > 0) {
            this.isSecondModalOpen = true;
            this.isFirstModalOpen = false;

            updateAgreementData({ recordId: this.recordId, agreementData: JSON.stringify(combinedValues) })
                .then(response => {
                    console.log('jj after first method:', JSON.stringify(response));
                    const parsedResponse = response instanceof Object ? response : JSON.parse(response);

                    const isSuccess = parsedResponse.success === true || parsedResponse.success === 'true';
                    if (isSuccess) {
                        const updatedRecordId = parsedResponse?.agr?.Id;
                        if (!updatedRecordId) {
                            throw new Error('Response does not contain a valid Agreement ID.');
                        }
                        console.log('Updated Agreement Record ID:', updatedRecordId);

                        this.markStepCompleted(1);

                        if (this.productData != null && this.productData.length > 0) {
                            return updateAgreementLineItemData({
                                recordId: updatedRecordId,
                                agreementLineItemData: JSON.stringify(this.productData)
                            }).then(configResponse1 => {
                                if (configResponse1.success === true || configResponse1.success === 'true') {
                                    this.markStepCompleted(2);

                                    if (this.autoApprovals) {
                                        return generateApprovalRequests({ agreementId: updatedRecordId })
                                            .then(approvalsResponse => {
                                                this.markStepCompleted(3);

                                                if (approvalsResponse.success === true || approvalsResponse.success === 'true') {
                                                    this.showToast('Success', 'Agreement and ALI are processed successfully.', 'success');
                                                    this.isSecondModalOpen = false;
                                                    this.handleNavigation(updatedRecordId);
                                                } else {
                                                    throw new Error(approvalsResponse.message);
                                                }
                                            });
                                    } else {
                                        this.showToast('Success', 'Agreement and ALI are processed successfully.', 'success');
                                        this.isSecondModalOpen = false;
                                        this.handleNavigation(updatedRecordId);
                                    }
                                } else {
                                    throw new Error(configResponse1.message);
                                }
                            });
                        } else {
                            this.markStepCompleted(2);
                            this.showToast('Success', 'Agreement is updated successfully.', 'success');
                            this.isSecondModalOpen = false;
                            this.handleNavigation(updatedRecordId);
                        }
                    } else {
                        throw new Error(parsedResponse.message);
                    }
                })
                .catch(error => {
                    this.isSecondModalOpen = false;
                    console.error('Error processing data:', error);
                    this.showToast('Error', error.message || 'An unexpected error occurred.', 'error');
                });
        } else if (this.productData != null) {
    this.isSecondModalOpen = true;
    this.isFirstModalOpen = false;
    this.markStepCompleted(1);

    updateAgreementLineItemData({
        recordId: this.recordId,
        agreementLineItemData: JSON.stringify(this.productData)
    })
        .then(configResponse1 => {
            if (configResponse1.success === true || configResponse1.success === 'true') {
                this.markStepCompleted(2);
                this.showToast('Success', 'ALI are processed successfully.', 'success');

                if (this.autoApprovals) {
                    generateApprovalRequests({ agreementId: this.recordId })
                        .then(approvalsResponse => {
                            console.log('Approval response:', approvalsResponse);

                            if (approvalsResponse.success === true || approvalsResponse.success === 'true') {
                                this.markStepCompleted(3);
                                this.showToast('Success', 'Approval process completed successfully.', 'success');
                            } else {
                                console.warn('Approval process not required or failed:', approvalsResponse.message);
                            }

                            // Proceed to navigation after approvals
                            this.isSecondModalOpen = false;
                            this.handleNavigation(this.recordId);
                        })
                        .catch(error => {
                            console.error('Error generating approvals:', error);
                            this.showToast('Error', 'An error occurred while generating approvals.', 'error');
                            this.isSecondModalOpen = false;
                            // Proceed to navigation even if approval fails
                            this.handleNavigation(this.recordId);
                        });
                } else {
                    // If approvals are not required, proceed to navigation
                    this.isSecondModalOpen = false;
                    this.handleNavigation(this.recordId);
                }
            } else {
                throw new Error(configResponse1.message);
            }
        })
        .catch(error => {
            this.isSecondModalOpen = false;
            console.error('Error updating ALI:', error);
            this.showToast('Error', error.message || 'An unexpected error occurred.', 'error');
        });
    }
    }

    handleNavigation(recordId) {
        console.log('jj this.navigateToAgreement',this.navigateToAgreement);
        console.log('jj this.homePageObjectName',this.homePageObjectName);
        if ((this.navigateToAgreement === true || this.navigateToAgreement === 'true') && this.homePageObjectName) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recordId,
                    objectApiName: this.homePageObjectName,
                    actionName: 'view'
                }
            });
        } else {
            console.log('Navigation is disabled. Staying on the current page.');
        }
    }



    handleSave() {
        const combinedValues = this.combineFieldValues();
        console.log('jj final values for agreements is :', JSON.stringify(combinedValues));
        console.log('jj final values for products is :', JSON.stringify(this.productData));

        if (this.productData != null && combinedValues.length > 0) {
            this.isThirdModalOpen = true;
            saveAgreementDetails({
                recordId: this.recordId, 
                agreementData: JSON.stringify(combinedValues), 
                agreementLineItemData: JSON.stringify(this.productData)
            })
            .then(response => {
                console.log('jj after first method:', JSON.stringify(response));

                // Ensure the response is parsed correctly
                const parsedResponse = response instanceof Object ? response : JSON.parse(response);
                console.log('Parsed response:', parsedResponse);
                console.log('Parsed response.success:', parsedResponse.success);
                console.log('Type of parsed response.success:', typeof parsedResponse.success);

                // Check if the response indicates success
                const isSuccess = parsedResponse.success === true || parsedResponse.success === 'true';
                console.log('isSuccess:', isSuccess);

                if (isSuccess) {
                    console.log('jj after if');
                    const updatedRecordId = parsedResponse?.agreement?.Id;
                    const objectName = parsedResponse?.objectName?.trim();

                    // Ensure we have both the ID and objectName
                    if (!updatedRecordId || !objectName) {
                        console.error('Updated Agreement ID or Object Name is missing in the response.');
                        throw new Error('Response does not contain valid Agreement ID or Object Name.');
                    }

                    // Mark step as completed
                    this.markStepCompleted1(1);

                    // Show success toast
                    this.showToast('Success', 'Agreement and Line Items saved successfully.', 'success');

                    // Navigate to the saved object record
                    console.log('Navigating to record:', updatedRecordId, 'Object Name:', objectName);
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: updatedRecordId,
                            objectApiName: objectName,
                            actionName: 'view'
                        },
                    });

                    // Close modal after a delay
                    setTimeout(() => {
                        this.isThirdModalOpen = false;
                        this.markStepNotComplete(1);
                    }, 500);
                } else {
                    // Handle error case
                    console.error('Error response received:', parsedResponse);
                    this.isThirdModalOpen = false;
                    this.showToast('Error', parsedResponse.message || 'An error occurred.', 'error');
                    throw new Error(parsedResponse.message || 'Unknown error in response.');
                }
            })
            .catch(error => {
                console.error('Error saving agreement:', error);
                this.showToast('Error', 'An error occurred while saving agreement.', 'error');
                this.isThirdModalOpen = false;
            });
        } else {
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