import { LightningElement, track, api } from 'lwc';
import addProductsToCart from '@salesforce/apex/OrderRequestAddToCart.addProductsToCart';
import createConfiguration from '@salesforce/apex/OrderRequestAddToCart.createConfiguration';
import saveConfiguration from '@salesforce/apex/OrderRequestAddToCart.saveConfiguration';
import createConfigLineItems from '@salesforce/apex/OrderRequestAddToCart.createConfigLineItems';
import finalizeCart from '@salesforce/apex/OrderRequestAddToCart.finalizeCart';
import saveCart from '@salesforce/apex/OrderRequestAddToCart.saveCart';
import checkIsCongaUsed from '@salesforce/apex/ProductController.checkIsCongaUsed';
import createOrderLineItemsForNonConga from '@salesforce/apex/ProductController.createOrderLineItemsForNonConga';
import generateApprovalRequestsForNonConga from '@salesforce/apex/ProductController.generateApprovalRequestsForNonConga';
import createOrderLineItems from '@salesforce/apex/OrderRequestAddToCart.createOrderLineItems';
import generateApprovalRequests from '@salesforce/apex/OrderRequestAddToCart.generateApprovalRequests';
import getRecordValuesCheckOutScreen from '@salesforce/apex/ProductController.getRecordValuesCheckOutScreen';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class CheckoutPage extends NavigationMixin(LightningElement) {
    @track isFirstModalOpen = false;
    @track isSecondModalOpen = false;
    @track isModalOpen = false;
    @track isSaveModalOpen = false;
    @api objectname;
    @track orderData = [];
    @track fieldArray = [];
    @api recId;
    @api fields;
    @api productData;
    @api typename;
    @api entryselecteddata;
    @api orderid;
    @track formFieldChanges = [];
    orderId;
    configurationId;
    isCongaUsed;

    @track steps = [
        { id: 1, label: 'Step 1: Creating Order', completed: false },
        { id: 2, label: 'Step 2: Creating Configuration', completed: false },
        { id: 3, label: 'Step 3: Creating Line Items', completed: false },
        { id: 4, label: 'Step 4: Finalizing the Configuration', completed: false },
        { id: 5, label: 'Step 5: Raising Approval Requests if any', completed: false },
        { id: 6, label: 'Step 6: Creating Order Line Items', completed: false }
    ];

    @track step2 = [
        { id: 1, label: 'Step 1: Creating Order', completed: false },
        { id: 2, label: 'Step 2: Creating Order Line Items', completed: false },
        { id: 3, label: 'Step 3: Raising Approval Requests if any', completed: false }
    ];
    
    @track steps1 = [
        { id: 1, label: 'Step 1: Creating Order', completed: false  },
        { id: 2, label: 'Step 2: Saving Configuration Details', completed: false  },
    ];   

    @api cartredirectenabled = {
        cartredirect: false
    };
    
    recId; 
    productData = [];

    connectedCallback()
    {
        console.log('jj new order data is :',JSON.stringify(this.entryselecteddata));
         console.log('jj new order data orderid :',this.orderid);
        checkIsCongaUsed({devName :'IsCongaUsed'})
        .then(result => {
            this.isCongaUsed = result;
            console.log('Is conga used :: '+result);
        })
        .catch(error => {
            this.error = error;
        });
        getRecordValuesCheckOutScreen({ recId : this.recId, fieldSetName: this.typename,orderId :this.orderid })
        .then(result => {
            this.fields = result;
            this.formFieldChanges = this.fields.map(field => ({
                fieldName: field.fieldName,
                value: field.value,
            }));
        })
        .catch(error => {
            this.error = error;
        });
    }

    /*markStepCompleted(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
        }
    }*/
    markStepCompleted(stepId) {
        const stepsToUse = this.isCongaUsed ? this.steps : this.step2;
        const step = stepsToUse.find(s => s.id === stepId);
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

    handleSubmit() {
        this.isFirstModalOpen = true;
    }

   /* get processedSteps() {
        return this.steps.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }*/
    get processedSteps() {
        const stepsToUse = this.isCongaUsed ? this.steps : this.step2;
        console.log('Step to be used ::: '+stepsToUse);
        return stepsToUse.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }
    
    get processedSteps1() {
        return this.steps1.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }

    updateStepStatus(stepId, status) {
        const steps = [...this.processSteps];
        console.log('jj steps are +',steps);
        const stepIndex = steps.findIndex(step => step.id === stepId);
        console.log('jj stepIndex are +',stepIndex);
        if (stepIndex !== -1) {
            steps[stepIndex] = { ...steps[stepIndex], status }; 
            this.processSteps = steps;
            console.log('jj processStep is :',this.processSteps);
        }
    }    

    handleModalClose() {
        this.isFirstModalOpen = false;
    }

    handleFieldChange(event) {
        const fieldName = event.target.fieldName;
        const value = event.target.value;
        const index = this.formFieldChanges.findIndex(field => field.fieldName === fieldName);
        if (index !== -1) {
            this.formFieldChanges[index].value = value;
        } else {
            this.formFieldChanges.push({ fieldName, value });
        }
    }

    handleProceed() {
        console.log('JJ new order data in handle proceed is:', JSON.stringify(this.entryselecteddata));
        this.entryselecteddata = [...this.entryselecteddata, ...this.formFieldChanges];
        console.log('JJ checkout page after appending data is:', JSON.stringify(this.entryselecteddata));
        console.log('JJ checkout page after product data is:', JSON.stringify(this.productData));
       
        this.formFieldChanges = [];
        if(this.isCongaUsed){
            console.log('Is conga used checkout  :: '+ this.isCongaUsed);
            if (this.entryselecteddata.length > 0 && this.productData.length > 0) {
                this.isSecondModalOpen = true;
                this.isFirstModalOpen = false;
        
                addProductsToCart({ orderData: JSON.stringify(this.entryselecteddata), orderId : this.orderid})
                    .then(result => {
                        console.log('jj after first method :',JSON.stringify(result));
                        const orderCreationResponse = JSON.parse(result);
                        console.log('jj after first method  orderCreationResponse :',orderCreationResponse);
                        if (orderCreationResponse.success) {
                            this.markStepCompleted(1);
                            console.log('jj inside first method :',this.updateStepStatus);
                            console.log('jj after first method orderCreationResponse.order :',orderCreationResponse.order);
                            this.orderId = orderCreationResponse.order.Id;
                            console.log('jj order id in 2nd method start is :',this.orderId);              
                            return createConfiguration({ orderId: this.orderId });
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(orderCreationResponse.message);
                        }
                    })
                    .then(configResponse => {
                        console.log('jj after second method configResponse :',configResponse);
                        const configResponse1 = JSON.parse(configResponse);
                        if (configResponse1.success) {
                            console.log('jj after second method json parse :',configResponse1);
                            this.configurationId = configResponse1.configId;
                            console.log('jj this.configurationId parse :',this.configurationId);
                            console.log('jj after second method json parse :',configResponse1.configId);
                            this.markStepCompleted(2);
                            return createConfigLineItems({ configId: this.configurationId, productData: JSON.stringify(this.productData) });
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(configResponse1.message);
                        }
                    })
                    .then(lineItemsResponse => {
                        console.log('jj after third method:', lineItemsResponse);
                    
                        if (lineItemsResponse) {
                            this.markStepCompleted(3);
                            return finalizeCart({ configId: this.configurationId });
                        } else {
                            this.isSecondModalOpen = false;
                            const firstMessageOrError = lineItemsResponse.find(item => item.hasOwnProperty('message') || item.hasOwnProperty('error'));
                            const errorMessage = firstMessageOrError.error || firstMessageOrError.message || 'Line items creation failed';
                            throw new Error(errorMessage);
                        }
                    })               
                    .then(finalizeCartResponse => {
                        console.log('jj after fourth method:', finalizeCartResponse);
                        const finalizeResponse = JSON.parse(finalizeCartResponse);
                        console.log('jj finalizeResponse method:', finalizeResponse);
                        if (finalizeResponse.success) {
                            this.markStepCompleted(4);
                            console.log('jj order id in 4th method start is :',this.orderId);              
                            return generateApprovalRequests({ orderId : this.orderId, configId: this.configurationId });
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(finalizeResponse.message);
                        }
                    })
                    .then(approvalsResponse => {
                        console.log('jj after fourth method:', approvalsResponse);
                        const approvalsResponse1 = JSON.parse(approvalsResponse);
                        console.log('jj finalizeResponse method:', approvalsResponse);
                        if (approvalsResponse1.success) {
                            this.markStepCompleted(5);
                            console.log('jj order id in 5th method start is :',this.orderId);              
                            return createOrderLineItems({ orderId : this.orderId, configId: this.configurationId });
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(approvalsResponse1.message);
                        }
                    })                
                    .then(createOrderLineItemsResponse => {
                        console.log('jj after fifth method :',createOrderLineItemsResponse);
                        const orderLineItemsResponse = JSON.parse(createOrderLineItemsResponse);
                        console.log('jj after first method  orderLineItemsResponse :',orderLineItemsResponse);
                        if (orderLineItemsResponse.success) {
                            this.markStepCompleted(6);
                            this.showToast('Success', 'Order process completed successfully. Redirecting you to the order', 'success');
                            this.isSecondModalOpen = false;
                            console.log('jj order id in 6th method completion is :',this.orderId);
                            console.log('jj object name in 6th method is :',orderLineItemsResponse.objectName);

                            this[NavigationMixin.Navigate]({
                                type: 'standard__recordPage',
                                attributes: {
                                    recordId: this.orderId, 
                                    objectApiName: orderLineItemsResponse.objectName, 
                                    actionName: 'view'
                                },
                            });
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(orderLineItemsResponse.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error in the order process:', error);
                        this.showToast('Error', error.message, 'error');
                    });
            } else {
                this.showToast('Error', 'Error creating order: Order data or product data is empty.', 'error');
            }
        }else{
            console.log('Is conga not used checkout  :: '+ this.isCongaUsed);
             if (this.entryselecteddata.length > 0 && this.productData.length > 0) {
                this.isSecondModalOpen = true;
                this.isFirstModalOpen = false;
                let objName;
                addProductsToCart({ orderData: JSON.stringify(this.entryselecteddata), orderId : this.orderid})
                    .then(result => {
                        console.log('jj after first method :',JSON.stringify(result));
                        const orderCreationResponse = JSON.parse(result);
                        console.log('jj after first method  orderCreationResponse :',orderCreationResponse);
                        if (orderCreationResponse.success) {
                            this.markStepCompleted(1);
                            console.log('jj inside first method :',this.updateStepStatus);
                            console.log('jj after first method orderCreationResponse.order :',orderCreationResponse.order);
                            this.orderId = orderCreationResponse.order.Id;
                            console.log('jj order id in 1st method start is :',this.orderId);
                            console.log('jj JSON.stringify(this.productData) in 1st method start is :',JSON.stringify(this.productData));
                            return createOrderLineItemsForNonConga({ orderId : this.orderId, productData: JSON.stringify(this.productData)});
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(orderCreationResponse.message);
                        }
                    })
                    .then(createOrderLineItemsResponse => {
                        console.log('jj after second method :', createOrderLineItemsResponse);
                        const orderLineItemsResponse = JSON.parse(createOrderLineItemsResponse);
                        console.log('jj after second method  orderLineItemsResponse :', orderLineItemsResponse);
                        if (orderLineItemsResponse.success) {
                            this.markStepCompleted(2);
                            this.isSecondModalOpen = false;
                            objName = orderLineItemsResponse.objectName;
                            console.log('jj order objName in 2th method completion is :', objName);
                            console.log('jj order id in 2th method completion is :', this.orderId);
                            console.log('jj object name in 2th method is :', orderLineItemsResponse.objectName);
                            return generateApprovalRequestsForNonConga({ orderId: this.orderId});

                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(orderLineItemsResponse.message);
                        }
                    })
                    .then(approvalsResponse => {
                        console.log('jj after third method:', approvalsResponse);
                        const approvalsResponse1 = JSON.parse(approvalsResponse);
                        console.log('jj finalizeResponse method:', approvalsResponse);
                        if (approvalsResponse1.success) {
                            this.markStepCompleted(3);
                            this.showToast('Success', 'Order process completed successfully. Redirecting you to the order', 'success');
                            console.log('jj order id in 3th method start is :', this.orderId);
                            this[NavigationMixin.Navigate]({
                                type: 'standard__recordPage',
                                attributes: {
                                    recordId: this.orderId,
                                    objectApiName: objName,
                                    actionName: 'view'
                                },
                            });
                        } else {
                            this.isSecondModalOpen = false;
                            throw new Error(approvalsResponse1.message);
                        }
                    })

                    .catch(error => {
                        console.error('Error in the order process:', error);
                        this.showToast('Error', error.message, 'error');
                    });
            } else {
                this.showToast('Error', 'Error creating order: Order data or product data is empty.', 'error');
            }
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

    handleSecondModalClose() {
        this.isSecondModalOpen = false;
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    deleteCart() {
        if (this.recId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.recId,
                    actionName: 'view',
                },
            });
        } else {
            console.error('AccountId not found in payload');
            this.showToast('Error', 'Account not found.', 'error');
        }
    }
    
    handleSave(){
        this.entryselecteddata = [...this.entryselecteddata, ...this.formFieldChanges];
        console.log('JJ after entry selectedData :',JSON.stringify(this.entryselecteddata));
        this.formFieldChanges = [];       
        if ((this.entryselecteddata && this.entryselecteddata.length > 0) && (this.productData && this.productData.length > 0)) {
            this.isSaveModalOpen = true;
			     addProductsToCart({ orderData: JSON.stringify(this.entryselecteddata)})
                .then(result => {
                    console.log('jj after first method :',result);
                    const orderCreationResponse = JSON.parse(result);
                    console.log('jj after first method  orderCreationResponse :',orderCreationResponse);
                    if (orderCreationResponse.success) {
                        this.markStepCompleted1(1);
                        console.log('jj inside first method :',this.updateStepStatus);
                        console.log('jj after first method orderCreationResponse.order :',orderCreationResponse.order);
                        this.orderId = orderCreationResponse.order.Id;
                        console.log('jj order id in 2nd method start is :',this.orderId);              
                        return saveConfiguration({ orderId: this.orderId, orderData: JSON.stringify(this.entryselecteddata),productData: JSON.stringify(this.productData)  });
                    } else {
                        this.isSaveModalOpen = false;
                        throw new Error(orderCreationResponse.message);
                    }
                })
                .then(configResponse => {
                    console.log('jj after second method configResponse :',configResponse);
                    const configResponse1 = JSON.parse(configResponse);
                    var objectId = configResponse1.configId;
                    var objectName = configResponse1.objectName;
                    if (configResponse1.success) {
                        console.log('jj after second method json parse :',configResponse1);
                        this.configurationId = configResponse1.configId;
                        console.log('jj this.configurationId parse :',this.configurationId);
                        console.log('jj after second method json parse :',configResponse1.configId);
                        this.markStepCompleted1(2);
                        //return createConfigLineItems({ configId: this.configurationId, productData: JSON.stringify(this.productData) });
                        this.showToast('Success', 'Order and Configuration created and saved successfully!', 'success');
                        this.isSaveModalOpen = false;
                         this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: objectId,
                                objectApiName: objectName,
                                actionName: 'view'
                            },
                        });

                        
                    } else {
                        this.isSaveModalOpen = false;
                        throw new Error(configResponse1.message);
                    }
                })
                .catch(error => {
                    console.error('Error in the order process:', error);
                    this.showToast('Error', error.message, 'error');
                });
 
        } else {
            this.showToast('Error', 'Error saving cart: Order data or product data is empty.', 'error');
        }
    }

    closeSaveModal(){
        this.isSaveModalOpen = false;        
    }
}