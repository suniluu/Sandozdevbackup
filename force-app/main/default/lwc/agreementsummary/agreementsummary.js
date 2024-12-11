import { LightningElement, api, wire,track } from 'lwc';
import getCompanyLocations from '@salesforce/apex/AgreementController.getCompanyLocations';
import generatePDFAndSave from '@salesforce/apex/AgreementController.generatePDFAndSave';
import previewPDF from '@salesforce/apex/AgreementController.previewPDF';
import getTemplateOptions from '@salesforce/apex/AgreementController.getTemplateOptions';
import getClausesOptions from '@salesforce/apex/AgreementController.getClausesOptions';
import getButtonsInfo from "@salesforce/apex/AgreementController.getButtonsInfo";
import getSignatureSectionInfo from "@salesforce/apex/AgreementController.getSignatureSectionInfo";
import retrieveSignatoryRecords from '@salesforce/apex/AgreementController.retrieveSignatoryRecords';
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

    @track signatoryOptions =[];
    @track selectedSignatorys =[];
    @track allSignatoryValues =[];

    @track selectedItemsToDisplay = []; 
    @track values = [];
    @api signatoryList;
    @api globalSelectedItems=[];

    @track labelItems =[];

    @track signatoryObjeApi;
    @track signatoryFieldsApiNames;
    @track signatoryFilterFields;

    @track signerObjeApi;
    @track signerFieldsApiNames;
    @track signerFilterFields;
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
        if(this.recordId != '' && this.recordId != null){
            console.log('Connected callback, Record ID 2:', this.recordId);
            this.loadsignatoryPilldata();
        }
       
       // this.loadSignatorydata();
        //this.loadAuthorizeSignerdata();
    }

    loadsignatoryPilldata(){
        retrieveSignatoryRecords({ recId: this.recordId })
            .then((data) => {
                this.signatoryOptions = data.map((item) => ({
                    label: item.recordName,
                    value: item.recordId,
                }));
                console.log('pill container list :: '+JSON.stringify(this.labelItems));
            })
            .catch((error) => {
                console.error('Error fetching signatory records:', error);
            });
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

    handleNewTemplateChange(event) {
    this.selectedTemplate = event.detail.value; 
    console.log('Template selected KK::', this.selectedTemplate);
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
         this.selectedClauses =[];
         
    }

    handleSignatoryChange(event) {
        const selectedValue = event.target.value;
        const selectedOption = this.signatoryOptions.find(option => option.value === selectedValue);
        console.log('Selected SignatoryValues :: ' + JSON.stringify(selectedOption));
        if (!this.allSignatoryValues.some(option => option.value === selectedOption.value)) {
            this.allSignatoryValues.push(selectedOption);
        }
        this.selectedSignatorys = selectedValue;
        console.log('All selected allSignatoryValues :: ' + JSON.stringify(this.allSignatoryValues));
    }

    handleSignatoryRemove(event) {
        const valueRemoved = event.target.name;
        console.log('Clause to remove :: ' + valueRemoved);
        this.allSignatoryValues = this.allSignatoryValues.filter(option => option.value !== valueRemoved);
        console.log('All allSignatoryValues after removal :: ' + JSON.stringify(this.allSignatoryValues));
         this.selectedSignatorys =[];
         console.log('after removal selectedSignatorys :: ' + JSON.stringify(this.selectedSignatorys));

    }

    /*passSignatoryDataToVFPage(jsonString) {
            passJsonData({ jsonData: jsonString })
            .then(result => {
                console.log('Data sent to Apex successfully:', result);
            })
            .catch(error => {
                console.error('Error sending data to Apex:', error);
            });
    }*/

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
        if (!this.selectedTemplate) {
            this.dispatchEvent(
                new ShowToastEvent({
                    message: 'Please select a template to generate the document',
                    variant: 'Success',
                })
            );
            return;
        }

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

    handleSignature(){
        console.log('handleSignature called');
    }

    handlePreview() {

        if (!this.selectedTemplate) {
            this.dispatchEvent(
                new ShowToastEvent({
                    message: 'Please select a template to Preview the document',
                    variant: 'Success',
                })
            );
            return;
        }

        console.log('handlepreview called');
        console.log('Record IDKeerpreview:', this.recordId);
        console.log('Selected Templatepreview:', this.selectedTemplate);


        previewPDF({ recordId: this.recordId, templateId: this.selectedTemplate})
            .then((pdfUrl) => {
                this.openPdfFile(pdfUrl);
            })
            .catch((error) => {
                console.error('Error generating PDF:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to generate PDF. Please try again.',
                        variant: 'error',
                    })
                );
            });
    }

    openPdfFile(pdfUrl) {
        window.open(pdfUrl, '_blank');
    }
}