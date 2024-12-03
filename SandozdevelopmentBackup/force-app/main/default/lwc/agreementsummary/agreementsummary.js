import { LightningElement, api, wire,track } from 'lwc';
import getCompanyLocations from '@salesforce/apex/AgreementController.getCompanyLocations';
import { NavigationMixin } from 'lightning/navigation';


export default class Agreementsummary extends NavigationMixin(LightningElement) {
    @track error; 
    @track mapMarkers = [];
    //@track markersTitle = 'Account Location';
    @track zoomLevel = 15;
    @api recordId;
    @api objectname;
    accountName;
    accountCity;
    accountCountry;
    accountStreet;
    accountState;
    postalcode;
    @track selectedClauses = [];
    @track clauseOptions = [
        { label: 'Clause 1', value: 'clause1' },
        { label: 'Clause 2', value: 'clause2' },
        { label: 'Clause 3', value: 'clause3' },
        { label: 'Clause 4', value: 'clause4' },
        { label: 'Clause 5', value: 'clause5' },
        { label: 'Clause 6', value: 'clause6' },
    ];
        
    handleTemplateSelection(event) {
        const selectedTemplate = event.target.label;
    }

    @wire(getCompanyLocations, { agrID: '$recordId'})
    wiredOfficeLocations({ error, data }) {
        if (data) {            
            data.forEach(dataItem => {
                this.mapMarkers = [...this.mapMarkers ,
                    {
                        location: {
                            City: dataItem.BillingCity,
                            Country: dataItem.BillingCountry,
                        },
        
                        icon: 'custom:custom26',
                        title: 'Account Name: '+dataItem.Name,
                        description:'Account Location: '+dataItem.BillingCity+','+dataItem.BillingCountry,
                    }                                    
                ];
                this.accountName = dataItem.Name;
                this.accountStreet = dataItem.BillingStreet;
                this.accountCity = dataItem.BillingCity;
                this.accountState = dataItem.BillingState;
                this.postalcode = dataItem.BillingPostalCode;
                this.accountCountry =dataItem.BillingCountry;
              });            
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    handleSave(){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.objectname,
                actionName: 'view'
            }
        });
    }
}