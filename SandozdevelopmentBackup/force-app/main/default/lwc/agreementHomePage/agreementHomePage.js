import { LightningElement, wire, api,track } from 'lwc';
import Scalefluidly from "@salesforce/resourceUrl/Scalefluidly";
import getexistinglineitems from '@salesforce/apex/AgreementController.getexistinglineitems';
import getFieldDataFromMetadata from '@salesforce/apex/AgreementController.getFieldDataFromMetadata';

export default class AgreementHomePage extends LightningElement {
    scalefluidlyLogo = Scalefluidly;
    @api recordId;
    @api objectName;
    @api productdata;
    @api fieldValues = {};
    @api deleteRecordData;
    @api currentStep = '1';

    @track cartCount =0;
    @track index = 1;
    @track initialRecords=[];
    @track orderReduestLoaded = false;
    @track discountdataprod=[];
    @track initialData=[];
    @track lineitems=[];  
    @track prodDatas =[];
    @track fieldDataWithLabels = [];
    @track preSelecteCatelog;
    @track preSelectedRows;
    @track preFastSelectedRows;
    @track preSelectedFast;

    firstPageClass = 'show-div';
    secondPageClass = 'hide-div';
    thirdPageClass='hide-div';
    fourthPageClass='hide-div';
    fifthPageClass='hide-div';
    sixthPageClass='hide-div';

    handleTabClick(event) {
        const selectedStep = event.target.value;
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
    discount(event){
        this.discountdataprod = event.detail.productdata;
        this.index=event.detail.index;
        this.cartCount= this.discountdataprod.length;
    }

    validateCurrentStep() {
        const headerComponent = this.template.querySelector('c-agreement-header-page');
        if (headerComponent && this.currentStep === '1') {
            return headerComponent.validateRequiredFields();
        }
        return true; 
    }

    handleGenerateApprovalRequests(event) {
        const approvalsResponse = event.detail;
        if (approvalsResponse.success) {
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
        console.log('jj Updated Field Values in Parent:', JSON.stringify(this.fieldValues));
    }

    connectedCallback() {
        console.log('jj record id in home page is :',this.recordId);
        console.log('jj object name in home is :',this.objectName);

        getFieldDataFromMetadata({ recordId: this.recordId, objectName: this.objectName })
        .then(result => {
            this.fieldDataWithLabels = result;
            console.log('JJ the fieldData is :',JSON.stringify(this.fieldDataWithLabels));
        })
        .catch(error => {
            console.error('Error:', error);
        });

        getexistinglineitems({recordId:this.recordId})
        .then(result => {
            this.cartCount = result.length;
            this.lineitems=result;
            let productDataWithIndex =result;
           const existLines = result.map(item => {
                return {...item, recordId: item.productId };
            });
            const existindRecords = existLines.map( (item) => item.recordId );
            this.preSelectedRows = existindRecords;
            this.preSelecteCatelog= this.preSelectedRows;
            if (result && Array.isArray(result) && result.length > 0) {
                console.log('inside jj check');
                this.currentStep = '4';
                this.fourthPageClass = '4';
                this.firstPageClass = 'hide-div';
                this.fourthPageClass='show-div';         
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
            for(var i = 0; i < valuesArray.length; i++){
                var obj = {...valuesArray[i]};
                obj.recordIndex = this.index++;
                dataArray.push(obj);
            }
            productDataWithIndex = dataArray;
            if(this.discountdataprod.length>0){
                this.productdata = productDataWithIndex.concat(this.discountdataprod);
                this.initialData = this.initialData? this.initialData.concat(productDataWithIndex):productDataWithIndex;
                this.initialRecords = this.productdata;
                this.discountdataprod = productDataWithIndex.concat(this.discountdataprod);
            }else{
                this.productdata = productDataWithIndex;
                this.initialData = this.initialData? this.initialData.concat(productDataWithIndex):productDataWithIndex;
                this.initialRecords = this.productdata;
                this.discountdataprod = productDataWithIndex;
            }
        })
        .catch(error => {
            this.error = error;
            console.log(JSON.stringify(error)+'error');
        })
    }

    deletedata(event){
        this.deleteRecordData =event.detail;
        if(this.deleteRecordData.length > 0){
            this.deletedRecord = this.deleteRecordData.map(item => {
                if(!item.recordId){
                    return {...item, recordId: item.productId};
                }else{
                    return item;
                }
                  
            });
            if(this.preSelecteCatelog){
                const deletedIds = this.deletedRecord.map(
                            (item) => item.recordId
                        );
                console.log('deletedIds: ', JSON.stringify(deletedIds));
                this.preSelectedRows = this.preSelecteCatelog.filter(item => !deletedIds.includes(item));
                this.preSelecteCatelog= this.preSelectedRows;
            }
            if(this.preSelectedFast){
                const deletedIds = this.deleteRecordData.map(
                                (item) => item.recordId
                    );
                this.preFastSelectedRows = this.preSelectedFast.filter(item => !deletedIds.includes(item));
                this.preSelectedFast = this.preFastSelectedRows;
            }
        }
        
    }
    
    handlegetproductselections(event){
        this.prodDatas = event.detail.selectedrows;    
        this.preSelecteCatelog = event.detail.preselected; 
        this.preSelectedFast = event.detail.fastpreSelect;
        let productDataWithIndex =event.detail.selectedrows;
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
            for(var i = 0; i < valuesArray.length; i++){
               
                    var obj = {...valuesArray[i]};
                    obj.recordIndex = this.index++;
                      obj.netPrice = obj.listPrice ? obj.listPrice : 0;
                    dataArray.push(obj);
               
            }
            productDataWithIndex = dataArray;  
            if(this.discountdataprod.length>0){
                    this.productdata = productDataWithIndex.concat(this.discountdataprod);
                    this.initialData = this.initialData? this.initialData.concat(productDataWithIndex):productDataWithIndex;
                    this.initialRecords = this.productdata;
                    this.discountdataprod = productDataWithIndex.concat(this.discountdataprod);
                }else{
                    this.productdata = productDataWithIndex;
                   this.initialData = this.initialData? this.initialData.concat(productDataWithIndex):productDataWithIndex;
                    this.initialRecords = this.productdata;
                    this.discountdataprod = productDataWithIndex;
                }
            this.cartCount = this.productdata.length;            
    }
}