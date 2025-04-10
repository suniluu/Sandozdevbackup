import { LightningElement, api, wire, track } from 'lwc';
import getTemplateOptions from '@salesforce/apex/AgreementController.getTemplateOptions';
import getClausesOptions from '@salesforce/apex/AgreementController.getClausesOptions';
import getButtonsInfo from "@salesforce/apex/AgreementController.getButtonsInfo";
import getSignatureSectionInfo from "@salesforce/apex/AgreementController.getSignatureSectionInfo";
import retrieveSignatoryRecords from '@salesforce/apex/AgreementController.retrieveSignatoryRecords';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import JS_PDF from '@salesforce/resourceUrl/jsPDF';
import { loadScript } from 'lightning/platformResourceLoader';
import getAgreementFiles from '@salesforce/apex/AgreementController.getAgreementFiles';
import getFileContent from '@salesforce/apex/AgreementController.getFileContent';
import getSignatureAsBase64 from '@salesforce/apex/AgreementController.getSignatureAsBase64';
import getAgreementLineItems from '@salesforce/apex/AgreementController.getAgreementLineItems';
import getAgreementContractsItems from '@salesforce/apex/AgreementController.getAgreementContractsItems';
import savePdfToContentVersion from '@salesforce/apex/AgreementController.savePdfToContentVersion';
import SANODOZ_LOGO from '@salesforce/resourceUrl/SandozLogo';


export default class Agreementsummary extends NavigationMixin(LightningElement) {
    @track error;
    @track mapMarkers = [];
    @track buttondata = [];
    @track sectiondata = [];
    @track signatorydata = [];
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
    lineItems = [];
    isDataLoaded = false;

    @track selectedTemplate = '';
    @track newoptions = [];

    @track selectedClauses = [];
    @track clauseOptions = [];
    @track allClausesValues = [];

    @track signatoryOptions = [];
    @track selectedSignatorys = [];
    @track allSignatoryValues = [];

    @track selectedItemsToDisplay = [];
    @track values = [];
    @api signatoryList;
    @api globalSelectedItems = [];

    @track labelItems = [];

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

    jsPdfInitialized = false;

    renderedCallback() {
        if (this.jsPdfInitialized) {
            return;
        }

        loadScript(this, JS_PDF)
            .then(() => {
                this.jsPdfInitialized = true;
                console.log('jsPDF loaded successfully in renderedCallback.');
            })
            .catch(error => {
                console.error('Error loading jsPDF:', error);
            });
    }


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
            console.log('clauses options ::: ' + JSON.stringify(this.clauseOptions));
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
        if (this.recordId != '' && this.recordId != null) {
            console.log('Connected callback, Record ID 2:', this.recordId);
            this.loadsignatoryPilldata();
        }

        // this.loadSignatorydata();
        //this.loadAuthorizeSignerdata();
    }



    loadsignatoryPilldata() {
        retrieveSignatoryRecords({ recId: this.recordId })
            .then((data) => {
                this.signatoryOptions = data.map((item) => ({
                    label: item.recordName,
                    value: item.recordId,
                }));
                console.log('pill container list :: ' + JSON.stringify(this.labelItems));
            })
            .catch((error) => {
                console.error('Error fetching signatory records:', error);
            });
    }

    loadButtons() {
        getButtonsInfo({ compName: "agreementsummary" })
            .then((result) => {
                this.buttondata = result;
                console.log('Button Data ::: ' + JSON.stringify(this.buttondata));
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
                console.log('sectiondata Data ::: ' + JSON.stringify(this.sectiondata));
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
        this.selectedClauses = [];

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
        this.selectedSignatorys = [];
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

    handleSave() {
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
        } else if (event.target.label == "Generate") {
            this.handleGenerate();
        } else if (event.target.label == "Sign") {
            this.handleSignature();
        } else if (event.target.label == "Save And Exit") {
            this.handleSave();
        }
    }

    handleAprrovals() {
        console.log('handleAprrovals called');
    }



    /*handleGenerate(){
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
    }*/

    /* handleGenerate() {
         if (this.jsPDFInitialized && window.jspdf) {
             try {
                 const doc = new window.jspdf.jsPDF();
                 doc.text('Hello PDF!', 10, 10);
                 doc.save('Sample.pdf');
             } catch (error) {
                 console.error('Error generating PDF:', error);
             }
         } else {
             console.error('jsPDF library not initialised or not available');
         }
     }*/

    /* handleGenerate() {
         console.log('Record ID:', this.recordId);
         console.log('Button clicked, starting PDF generation...');
 
         if (!this.jsPdfInitialized) {
             console.error('jsPDF is not loaded yet.');
             return;
         }
 
         getAgreementLineItems({ agreementId: this.recordId })
             .then(lineItems => {
                 console.log('Fetched line items:', lineItems);
                 if (!lineItems || lineItems.length === 0) {
                     this.dispatchEvent(new CustomEvent('error', { detail: 'No line items found!' }));
                     return;
                 }
 
                 const doc = new window.jspdf.jsPDF();
                 console.log('PDF instance created:', doc);
 
                 doc.text(`Hi`, 10, 10);
                 doc.text(`Please find the Agreement Line Items for the Agreement below, ${this.recordId}`, 10, 20);
 
                 doc.text(`Agreement Name`, 10, 40);
                 doc.text(`Product Name`, 60, 40);
                 doc.text(`Product Code`, 120, 40);
                 doc.text(`List Price`, 170, 40);
 
                 let y = 50;
                 lineItems.forEach(item => {
                     doc.text(item.Aggreement__r.Name, 10, y);
                     doc.text(item.Product__r.Name, 60, y);
                     doc.text(item.Product_Code__c, 120, y);
                     doc.text(item.List_Price__c.toString(), 170, y);
                     y += 10;
                 });
 
                 doc.text(`It's a pleasure to have you on board. Please do not hesitate to contact us should you have any questions or concerns.`, 10, y + 20);
                 doc.text(`Sincerely,`, 10, y + 30);
                 doc.text(`kiran kumar`, 10, y + 40);
 
                 //doc.save('AgreementDetails.pdf'); 
 
                 const pdfBase64 = doc.output('datauristring').split(',')[1]; // Get Base64 data
 
                 // Call Apex to save the PDF
                 savePdfToContentVersion({ fileName: 'AgreementDetails.pdf', base64Data: pdfBase64, agreementId: this.recordId })
                     .then(() => {
                         this.showToast('Success', 'PDF saved successfully!', 'success');
                     })
                     .catch(error => {
                         console.error('Error saving PDF:', error);
                         this.showToast('Error', 'Error saving PDF: ' + error.body.message, 'error');
                     });
             })
             .catch(error => {
                 console.error('Error fetching line items:', error);
                 this.showToast('Error', 'Error fetching line items: ' + error.body.message, 'error');
             });
     }
 
     showToast(title, message, variant) {
         const evt = new ShowToastEvent({
             title: title,
             message: message,
             variant: variant,
         });
         this.dispatchEvent(evt);
     }*/

    handleGenerate() {
        console.log('Record ID:', this.recordId);
        console.log('Button clicked, starting PDF generation...');

        if (!this.jsPdfInitialized) {
            console.error('jsPDF is not loaded yet.');
            return;
        }

        // Load the logo as Base64
        fetch(SANODOZ_LOGO)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const logoBase64 = reader.result.split(',')[1];
                    console.log('Logo Base64:', logoBase64);
                    this.generatePdfWithLogo(logoBase64);
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error fetching logo:', error);
                this.showToast('Error', 'Error fetching logo for the PDF.', 'error');
            });
    }

    generatePdfWithLogo(logoBase64) {
        getAgreementLineItems({ agreementId: this.recordId })
            .then(lineItems => {
                console.log('Fetched line items:', lineItems);
                if (!lineItems || lineItems.length === 0) {
                    this.dispatchEvent(new CustomEvent('error', { detail: 'No line items found!' }));
                    return;
                }

                const doc = new window.jspdf.jsPDF();
                console.log('PDF instance created:', doc);

                doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 10, 10, 50, 15);

                const pageWidth = doc.internal.pageSize.width;
                const marginRight = 10;

                const addressLines = [
                    "Sandoz",
                    "12 High Street",
                    "Example Town",
                    "EV1 EV1",
                ];

                let y = 15;
                doc.setFontSize(10);
                addressLines.forEach(line => {
                    const textWidth = doc.getTextWidth(line);
                    doc.text(line, pageWidth - textWidth - marginRight, y);
                    y += 6;
                });


                // Add text and table headers
                doc.text(`Hi`, 10, 60);
                doc.text(`Please find the Agreement Line Items for the Agreement below, ${this.recordId}`, 10, 70);

                doc.text(`Agreement Name`, 10, 90);
                doc.text(`Product Name`, 60, 90);
                doc.text(`Product Code`, 120, 90);
                doc.text(`List Price`, 170, 90);

                y += 60;

                lineItems.forEach(item => {
                    doc.text(item.Aggreement__r.Name, 10, y);
                    doc.text(item.Product__r.Name, 60, y);
                    doc.text(item.Product_Code__c, 120, y);
                    doc.text(item.List_Price__c.toString(), 170, y);
                    y += 10;
                });

                // Add footer
                doc.text(`It's a pleasure to have you on board. Please do not hesitate to contact us should you have any questions or concerns.`, 10, y + 20);
                doc.text(`Sincerely,`, 10, y + 30);
                doc.text(`Kiran Kumar`, 10, y + 40);

                doc.save('AgreementDetails.pdf');

                // Convert to Base64 and save the PDF
                const pdfBase64 = doc.output('datauristring').split(',')[1];
                savePdfToContentVersion({
                    fileName: 'AgreementDetails.pdf',
                    base64Data: pdfBase64,
                    agreementId: this.recordId,
                })
                    .then(() => {
                        this.showToast('Success', 'PDF saved successfully!', 'success');
                    })
                    .catch(error => {
                        console.error('Error saving PDF:', error);
                        this.showToast('Error', 'Error saving PDF: ' + error.body.message, 'error');
                    });
            })
            .catch(error => {
                console.error('Error fetching line items:', error);
                this.showToast('Error', 'Error fetching line items: ' + error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }

    handlePreview() {
        console.log('Record ID:', this.recordId);
        console.log('Button clicked, starting PDF generation...');

        if (!this.jsPdfInitialized) {
            console.error('jsPDF is not loaded yet.');
            return;
        }

        fetch(SANODOZ_LOGO)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const logoBase64 = reader.result.split(',')[1];
                    console.log('Logo Base64:', logoBase64);
                    this.generatePdfWithLogo1(logoBase64);
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error fetching logo:', error);
                this.showToast('Error', 'Error fetching logo for the PDF.', 'error');
            });
    }

    generatePdfWithLogo1(logoBase64) {
        Promise.all([
            getAgreementLineItems({ agreementId: this.recordId }),
            getAgreementContractsItems({ agreementId: this.recordId })
        ])
            .then(([lineItems, contracts]) => {
                console.log('Fetched line items:', lineItems);
                console.log('Fetched contracts:', contracts);

                if (!lineItems || lineItems.length === 0) {
                    this.dispatchEvent(new CustomEvent('error', { detail: 'No line items found!' }));
                    return;
                }

                const doc = new window.jspdf.jsPDF();
                console.log('PDF instance created:', doc);

                doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 10, 10, 50, 15);

                const pageWidth = doc.internal.pageSize.width;
                const marginRight = 10;

                const addressLines = [
                    "Sandoz",
                    "12 High Street",
                    "Example Town",
                    "EV1 EV1",
                ];

                let y = 15;
                doc.setFontSize(10);
                addressLines.forEach(line => {
                    const textWidth = doc.getTextWidth(line);
                    doc.text(line, pageWidth - textWidth - marginRight, y);
                    y += 6;
                });

                doc.text(`Hi`, 10, 60);
                doc.text(`Please find the Agreement Line Items for the Agreement below, ${this.recordId}`, 10, 70);

                doc.text(`Agreement Name`, 10, 90);
                doc.text(`Product Name`, 60, 90);
                doc.text(`Product Code`, 120, 90);
                doc.text(`List Price`, 170, 90);

                y += 60;

                lineItems.forEach(item => {
                    doc.text(item.Aggreement__r.Name, 10, y);
                    doc.text(item.Product__r.Name, 60, y);
                    doc.text(item.Product_Code__c, 120, y);
                    doc.text(item.List_Price__c.toString(), 170, y);
                    y += 10;
                });

                doc.text(`It's a pleasure to have you on board. Please do not hesitate to contact us should you have any questions or concerns.`, 10, y + 20);
                doc.text(`Sincerely,`, 10, y + 30);
                doc.text(`Kiran Kumar`, 10, y + 40);

                y += 50; // Adjust for spacing

                // Save or open PDF
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                this.showToast('Error', 'Error generating the PDF.', 'error');
            });
    }


    /*generatePdfWithLogo(logoBase64) {
        getAgreementLineItems({ agreementId: this.recordId })
            .then(lineItems => {
                console.log('Fetched line items:', lineItems);
                if (!lineItems || lineItems.length === 0) {
                    this.dispatchEvent(new CustomEvent('error', { detail: 'No line items found!' }));
                    return;
                }

                const doc = new window.jspdf.jsPDF();
                console.log('PDF instance created:', doc);

                doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 10, 10, 50, 15);

                const pageWidth = doc.internal.pageSize.width;
                const marginRight = 10;

                const addressLines = [
                    "Sandoz",
                    "12 High Street",
                    "Example Town",
                    "EV1 EV1",
                ];

                let y = 15;
                doc.setFontSize(10);
                addressLines.forEach(line => {
                    const textWidth = doc.getTextWidth(line);
                    doc.text(line, pageWidth - textWidth - marginRight, y);
                    y += 6;
                });

                doc.text(`Hi`, 10, 60);
                doc.text(`Please find the Agreement Line Items for the Agreement below, ${this.recordId}`, 10, 70);

                doc.text(`Agreement Name`, 10, 90);
                doc.text(`Product Name`, 60, 90);
                doc.text(`Product Code`, 120, 90);
                doc.text(`List Price`, 170, 90);

                y += 60;

                lineItems.forEach(item => {
                    doc.text(item.Aggreement__r.Name, 10, y);
                    doc.text(item.Product__r.Name, 60, y);
                    doc.text(item.Product_Code__c, 120, y);
                    doc.text(item.List_Price__c.toString(), 170, y);
                    y += 10;
                });

                doc.text(`It's a pleasure to have you on board. Please do not hesitate to contact us should you have any questions or concerns.`, 10, y + 20);
                doc.text(`Sincerely,`, 10, y + 30);
                doc.text(`Kiran Kumar`, 10, y + 40);
                

            const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
            });
    }*/
}