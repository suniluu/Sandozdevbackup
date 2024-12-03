import { LightningElement, api, wire,track } from 'lwc';
import getCompanyLocations from '@salesforce/apex/AgreementController.getCompanyLocations';
import generatePDFAndSave from '@salesforce/apex/DocumentGenerationController.generatePDFAndSave';
import getTemplateOptions from '@salesforce/apex/DocumentGenerationController.getTemplateOptions';
import getClausesOptions from '@salesforce/apex/DocumentGenerationController.getClausesOptions';
import getButtonsInfo from "@salesforce/apex/AgreementController.getButtonsInfo";
import getSignatureSectionInfo from "@salesforce/apex/AgreementController.getSignatureSectionInfo"
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class Agreementsummary extends NavigationMixin(LightningElement) {
    @track error; 
    @track mapMarkers = [];
     @track buttondata = [];
     @track sectiondata=[];
     @track signatorydata =[];
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

    @track selectedTemplate = '';
    @track newoptions = [];

    @track selectedClauses = [];
    @track clauseOptions =[];
    @track allClausesValues=[];

    @track selectedItemsToDisplay = []; 
    @track values = [];
    @api signatoryList;
    @api globalSelectedItems=[];
    /*@track newoptions = [
        { label: 'Template 1', value: 'Template 1' },
        { label: 'Template 2', value: 'Template 2' }
    ];*/

    @wire(getTemplateOptions)
    wiredTemplates({ error, data }) {
        if (data) {
            this.newoptions = data.map(option => ({
                label: option.label,
                value: option.value
            }));
        } else if (error) {
            console.error('Error fetching templates: ', error);
        }
    }

    @wire(getClausesOptions)
    wiredClauses({ error, data }) {
        if (data) {
            this.clauseOptions = data.map(option => ({
                label: option.label,
                value: option.value
            }));
            console.log('clauses options ::: '+JSON.stringify(this.clauseOptions));
        } else if (error) {
            console.error('Error fetching clauses : ', error);
        }
    }
        
    /*handleTemplateSelection(event) {
        const selectedTemplate = event.target.label;
        console.log('template selected :: '+ selectedTemplate);
    }*/

    connectedCallback() {
    console.log('Connected callback, Record ID:', this.recordId);
    this.loadButtons();
    this.loadSections();
   // this.loadSignatorydata();
    }

    /*loadSignatorydata(){
        getSignatoryDetails({recId :this.recordId})
        .then((result) => {
            this.signatorydata =result;
            console.log('signatorydata Data ::: '+JSON.stringify(this.signatorydata));
        })
        .catch((error) => {
                this.error = error;
        });
    }*/

    selectItemEventHandler(event){
        let args = event.detail.arrItems;
        this.displayItem(args); 
    }

    deleteItemEventHandler(event){
        let args = event.detail.arrItems;
        this.displayItem(args);
    }

    displayItem(args){
        this.values = []; 
        args.map(element=>{
            this.values.push(element.value);
        });
      
        this.selectedItemsToDisplay = this.values.join(', ');
        this.signatoryList = this.selectedItemsToDisplay.split(',').map(item => item.trim());
        console.log('Selected signatory list ::: '+ JSON.stringify(this.signatoryList));
    //    const evtCustomEvent = new CustomEvent('taglistevent', {
    //     detail:  this.signatoryList

    //     });
    //      this.dispatchEvent(evtCustomEvent);
  
    }

    loadButtons() {
        getButtonsInfo({ compName: "agreementsummary" })
        .then((result) => {
            this.buttondata = result;
            console.log('Button Data ::: '+JSON.stringify(this.buttondata));
        })
        .catch((error) => {
            this.error = error;
        });
    }

    get isClauseTemplate() {
        return this.sectiondata.some(
            obj => obj.Label === "ClauseTemplate" && obj.Hide_Section__c === false
        );
    }

    get isSignature() {
        return this.sectiondata.some(
            obj => obj.Label === "Signature" && obj.Hide_Section__c === false
        );
    }

    loadSections() {
    getSignatureSectionInfo({ compName: "agreementsummary" })
      .then((result) => {
        this.sectiondata = result;
        console.log('sectiondata Data ::: '+JSON.stringify(this.sectiondata));
      })
      .catch((error) => {
        this.error = error;
      });
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

    handleNewTemplateChange(event) {
    this.selectedTemplate = event.detail.value; 
    console.log('Template selected KK::', this.selectedTemplate);
    }

    handleSearch(event) {
        
    }
    
    /*handleNewTemplateChange(event){
        var selectedTemplate = event.detail.value;
        console.log('template selected KK:: '+ selectedTemplate);
    }*/

    handleClauseChange(event) {
        const selectedValue = event.target.value;
        const selectedOption = this.clauseOptions.find(option => option.value === selectedValue);
        console.log('Selected clause :: ' + JSON.stringify(selectedOption));
        if (!this.allClausesValues.some(option => option.value === selectedOption.value)) {
            this.allClausesValues.push(selectedOption);
        }
        this.selectedClauses = selectedValue;
        console.log('All selected clauses :: ' + JSON.stringify(this.allClausesValues));
        //const clauseIds = this.allClausesValues.map(clause => clause.value); to get ids of all clause and share to apex
    }

    handleRemove(event) {
        const valueRemoved = event.target.name;
        console.log('Clause to remove :: ' + valueRemoved);
        this.allClausesValues = this.allClausesValues.filter(option => option.value !== valueRemoved);
        console.log('All clauses after removal :: ' + JSON.stringify(this.allClausesValues));
    }

    modifyOptions()
    {
        this.clauseOptions =this.clauseOptions.filter(elem=>{
        if(!this.allClausesValues.includes(elem.value)){
            return elem;
        }    
        })
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

    handleButtonActions(event) {
        if (event.target.label == "Send for Approval") {
            this.handleAprrovals();
        }else if (event.target.label == "Generate") {
            this.handleGenerate();
        }else if (event.target.label == "Sign") {
            this.handleSignature();
        }
    }

    handleAprrovals(){
        console.log('handleAprrovals called');
    }

    handleGenerate(){
        console.log('handleGenerate called');
        console.log('Record IDKeer:', this.recordId);
        console.log('Selected Template:', this.selectedTemplate);
        if (this.selectedTemplate) {
        generatePDFAndSave({ recordId: this.recordId, templateId: this.selectedTemplate})
            .then((fileId) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'PDF has been generated and saved to Files',
                        variant: 'success',
                    })
                );
            })
            .catch((error) => {                
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'An error occurred: ' + error.body.message,
                        variant: 'error',
                    })
                );
            });
        } 
        /*else {
            alert('Please select a template first!');
        }*/
    }   

    handleSignature(){
        console.log('handleSignature called');
    }
}