import { LightningElement, track,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createPromoRecord from '@salesforce/apex/PromotionController.createPromoRecord';
import getPicklistValues from '@salesforce/apex/PromotionController.getPicklistValues';
import getProducts from '@salesforce/apex/PromotionController.getProducts';

export default class CreatePromo extends NavigationMixin(LightningElement) {
    @track Name = '';
    @track Active = false;
    @track IncludeOtherPromo = false;
    @track EffectiveDate = '';
    @track ExpirationDate = '';
    @track picklistValues = [];
    @track picklistValue = '';
    @track AdjustmentAmount = 0;
    @track selectedProductCodes = [];
    @track products = [];

    @wire(getPicklistValues, { fieldApiName: 'Adjustment_Type__c' })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.picklistValues = data.map(item => ({ label: item, value: item }));
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }
    
    @wire(getProducts)
    wiredProducts({ data, error }) {
        if (data) {
            this.products = data.map(product => ({
                label: product.Name,
                value: product.ProductCode
            }));
        } else if (error) {
            console.error('Error fetching Products:', error);
        }
    }

    handleSelectionChange(event) {
    this.selectedProductCodes = event.detail.value;
    } 


    handleNameChange(event) {
        this.Name = event.target.value;
    }

    handleCheckboxChange(event) {
        this.Active = event.target.checked;
    }

    handleCheckboxChange1(event) {
        this.IncludeOtherPromo = event.target.checked;
    }
    
    handleDateChange(event) {
        this.EffectiveDate = event.target.value;
    }

    handleDateChange1(event) {
        this.ExpirationDate = event.target.value;
    }

    handlePicklistChange(event) {
    this.picklistValue = event.detail.value;
    }

    handleAmountChange(event){
        this.AdjustmentAmount = parseFloat(event.target.value);
    }


    handleSave() {
        const selectedProductsStr = this.selectedProductCodes.join(';');
        const params = {
            Name: this.Name,
            Active__c: this.Active, 
            Include_with_other_promotions__c: this.IncludeOtherPromo,
            Effective_Date__c: this.EffectiveDate ? new Date(this.EffectiveDate).toISOString() : null,
            Expiration_Date__c: this.ExpirationDate ? new Date(this.ExpirationDate).toISOString() : null,
            Adjustment_Type__c: this.picklistValue,
            Adjustment_Amount__c:this.AdjustmentAmount,
            Products__c: selectedProductsStr

        };

        createPromoRecord({ params })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Promotion record created successfully',
                        variant: 'success'
                    })
                );
                    this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'Promotions__c',
                        actionName: 'list'
                    }
                });
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating promotion record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                console.error('Error creating promotion record: ' + JSON.stringify(error));
            });
    }
}