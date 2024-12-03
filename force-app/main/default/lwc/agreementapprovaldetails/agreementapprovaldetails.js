import { LightningElement, api, track } from 'lwc';
import getApprovalDetails1 from '@salesforce/apex/AgreementController.getApprovalDetails1';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AgreementApprovalDetails extends LightningElement {
    @api recordid;
    @track approvalDetails = [];
    @track error;

    connectedCallback() {
        this.fetchApprovalDetails();
    }

    @api
    refreshApprovalDetails() {
        this.fetchApprovalDetails();
    }

    fetchApprovalDetails() {
        getApprovalDetails1({ agreementId: this.recordid })
            .then((data) => {
                console.log('jj approvals');
                this.approvalDetails = data;
                console.log('jj approvals data is :', this.approvalDetails);
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
    }
}