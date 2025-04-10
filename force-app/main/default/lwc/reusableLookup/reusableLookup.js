import { LightningElement, api, track } from 'lwc';
import fetchRecords from '@salesforce/apex/ProductController.fetchLookupRecords';

const DELAY = 500;

export default class ReusableLookup extends LightningElement {
    @api selectedIconName;
    @api objectLabel;
    @api objectApiName;
    @api fieldApiName;
    @api otherFieldApiName;
    @api searchString = "";
    @api selectedRecordId = "";
    @api parentRecordId;
    @api parentFieldApiName;
    @api fields;
    @api priceList;
    @api recId;
    
    recordsList = [];
    @api selectedRecordName;
    preventClosingOfSerachPanel = false;

    get showRecentRecords() {
        if (!this.recordsList) {
            return false;
        }
        return this.recordsList.length > 0;
    }

    connectedCallback() {
      
        if(this.fields){
            this.fetchSobjectRecords(true);
        }
    }

    //call the apex method
    fetchSobjectRecords(loadEvent) {
        fetchRecords({
            objectApiName: this.objectApiName,
            fieldApiName: this.fieldApiName,
            otherFieldApiName: this.otherFieldApiName,
            searchString: this.searchString,
            selectedRecordId: this.selectedRecordId,
            fieldData : this.fields,
            recId :this.recId
        }).then(result => {
            console.log('Reusable search :: '+JSON.stringify(result));
            if (loadEvent && result) {
                this.selectedRecordName = result[0].mainField;
            } else if (result) {
                this.recordsList = JSON.parse(JSON.stringify(result));
            } else {
                this.recordsList = [];
            }
        }).catch(error => {
            console.log(error);
        })
    }

    get isValueSelected() {
        return this.selectedRecordId;
    }

    //handler for calling apex when user change the value in lookup
    handleChange(event) {
        this.searchString = event.target.value;
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            this.fetchSobjectRecords();
        }, DELAY);
    }
    
     handleBlur() {
        this.recordsList = [];
        this.preventClosingOfSearchPanel = false;
    }

    handleDivClick() {
        this.preventClosingOfSearchPanel = true;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            if (this.recordsList && this.recordsList.length > 0) {
                const selectedRecord = this.recordsList.find(rec => 
                    rec.mainField.toLowerCase().includes(this.searchString.toLowerCase()) ||
                    rec.subField.toLowerCase().includes(this.searchString.toLowerCase())
                );
                if (selectedRecord) {
                    this.selectedRecordId = selectedRecord.id;
                    this.selectedRecordName = selectedRecord.mainField;
                    this.recordsList = [];
                    const selectedEvent = new CustomEvent('valueselected', {
                        detail: selectedRecord
                    });
                    this.dispatchEvent(selectedEvent);
                } else {
                    console.log('No matching record found.');
                }
            } else {
                console.log('No records available to select.');
            }
        }
    }

    handleCommit() {
        this.selectedRecordId = '';
        this.selectedRecordName = '';
        const selectedEvent = new CustomEvent('removeval', {
            detail: '',
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectedEvent);
    }

    handleSelect(event) {
        let selectedRecord = {
            mainField: event.currentTarget.dataset.mainfield,
            subField: event.currentTarget.dataset.subfield,
            id: event.currentTarget.dataset.id
        };
        this.selectedRecordId = selectedRecord.id;
        this.selectedRecordName = selectedRecord.mainField;
        this.recordsList = [];
        const selectedEvent = new CustomEvent('valueselected', {
            detail: selectedRecord
        });
        this.dispatchEvent(selectedEvent);
    }
    
    handleInputBlur() {
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            if (!this.preventClosingOfSearchPanel) {
                this.recordsList = [];
            }
            this.preventClosingOfSearchPanel = false;
        }, DELAY);
    }
}