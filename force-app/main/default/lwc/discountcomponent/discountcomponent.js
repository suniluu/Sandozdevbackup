import { LightningElement, wire, api, track } from 'lwc';
import getAgreementRequestSettingMetadata from '@salesforce/apex/AgreementController.getAgreementRequestSettingMetadata';

export default class Discountcomponent extends LightningElement {
    @api value;
    @track promotionsCheck = false;

    connectedCallback() {
        getAgreementRequestSettingMetadata({ devName: 'Agreement_Settings' })
        .then(result => {
            console.log('Result from Apex:', result);

            if (result && result.length > 0) {
                result.forEach(obj => {
                    console.log('Record:', JSON.stringify(obj)); 
                });

                this.promotionsCheck = result.some(obj => obj.Enable_Promotions__c === true);
                console.log('Computed promotionsCheck:', this.promotionsCheck);
            } else {
                    console.warn('No records found for DeveloperName: Agreement_Settings');
                }
                console.log('promotionsCheck:', this.promotionsCheck);
            })
            .catch(error => {
                console.error('Error fetching metadata:', error);
                this.promotionsCheck = false;
            });
    }

    removeRow(event){
        let data={index: this.value,name: event.target.title};
        const selectEvent = new CustomEvent('remove', {
            detail: data ,bubbles: true, composed: true
        });
        this.dispatchEvent(selectEvent);
    }
}