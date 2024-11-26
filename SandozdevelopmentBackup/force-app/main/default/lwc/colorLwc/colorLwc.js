import { LightningElement, track, api } from 'lwc';
import createAccount from '@salesforce/apex/ColorController.createAccount';
import createContact from '@salesforce/apex/ColorController.createContact';
import createLead from '@salesforce/apex/ColorController.createLead';
import createOpportunity from '@salesforce/apex/ColorController.createOpportunity';

export default class ProcessSteps extends LightningElement {
    @track showModal = false;
    @track steps = [
        { id: 1, label: 'Create Account', completed: false },
        { id: 2, label: 'Create Contact', completed: false },
        { id: 3, label: 'Create Lead', completed: false },
        { id: 4, label: 'Create Opportunity', completed: false }
    ];
    @api recordId; // Placeholder for record Id if needed

    // Corrected getter
    get processedSteps() {
        return this.steps.map(step => ({
            ...step,
            cssClass: step.completed ? 'icon-success-wrapper' : ''
        }));
    }
    openModal() {
        this.showModal = true;
        this.executeSteps();
    }

    executeSteps() {
        let accountId, contactId;
        
        createAccount({ accountName: 'New Account' })
            .then(result => {
                accountId = result;
                this.markStepCompleted(1);
                return createContact({ contactName: 'New Contact', accountId });
            })
            .then(result => {
                contactId = result;
                this.markStepCompleted(2);
                return createLead({ leadName: 'New Lead' });
            })
            .then(result => {
                this.markStepCompleted(3);
                return createOpportunity({ opportunityName: 'New Opportunity', accountId, contactId });
            })
            .then(result => {
                this.markStepCompleted(4);
            })
            .catch(error => {
                console.error('Error executing steps:', error);
            });
    }

    markStepCompleted(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
        }
    }
}