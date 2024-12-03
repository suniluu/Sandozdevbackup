import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class AgreementParentComponent extends LightningElement {
    @api recordId;
    @api objectName;
    @track showChildComponent = false;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        if (currentPageReference) {
            const state = currentPageReference.state;
            this.recordId = state.c__recordId;
            this.objectName = state.c__objectName;
            console.log('JJ Parent Received recordId from URL:', this.recordId);
            console.log('JJ Parent Received object from URL:', this.objectName);    
            this.showChildComponent = true;        
        }
    }
}