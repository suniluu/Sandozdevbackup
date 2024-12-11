import { LightningElement, api, track } from 'lwc';
import getApprovalDetails1 from '@salesforce/apex/AgreementController.getApprovalDetails1';
import getApprovalObjMetadata from '@salesforce/apex/AgreementController.getApprovalObjMetadata';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgreementApprovalDetails extends LightningElement {
    @api recordid;
    @api approvalDetails = [];
    @track error;
    @api approvaldata=false;
    @api agreementId;

    connectedCallback() {
        this.fetchApprovalDetails();
        console.log('Aprrovals page Agreement record Id :: '+this.recordid);
    }

    @api
    refreshApprovalDetails() {
        this.fetchApprovalDetails();
    }

    fetchApprovalDetails() {
         getApprovalObjMetadata({})
            .then((data) => {
                const productToUsed = data[0].Approval_Product_To_Be_Used__c;
                console.log('Product to used ::: '+productToUsed);
                   getApprovalDetails1({ agreementId: this.recordid, approvalProduct :productToUsed})
                    .then((data) => {
                       if (data && Array.isArray(data)) {
    this.approvalDetails = data.map(item => item.Actor);
     console.log('jj approvals data is :', JSON.stringify(this.approvalDetails));
    this.approvaldata=true;


                        console.log('jj approvals data is :', this.approvalDetails);
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
     
    }
}