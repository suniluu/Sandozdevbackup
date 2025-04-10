import { LightningElement, track,wire ,api} from 'lwc';
import getTabs from '@salesforce/apex/AgreementController.getTabs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProductSelectionComponent extends LightningElement {
    @track tabsData = [];
    @track agreementcatelogdata=[];
    @track agreementfastdata=[];
    @track disableButton = true;
    @track count =0;
    @track tabName;
    @track agreementdata=[];
    @track catelogPreselected;
    @track fastPreselected;
    @track isLoading = false;
    @api preSelectedRecord =[];
    @api fieldValues; 
    @api recordId;
    @api deleterecorddata;
    @api preSelectedRows;
    @api preFastSelectedRows;
    @api fieldDataWithLabels;
     @api objectapiname; 
     @track loading=false;
     @api rows;
     @api index;
     @api conditionalValue;
     @api filterfield;

    connectedCallback() {
        this.isLoading = true;
        this.loadTabData(); 
        console.log('jj prod selection objectapi :',this.objectapiname);
        console.log('jj prod selection fields :',JSON.stringify(this.fieldValues));
        console.log('jj prod selection fieldDataWithLabels :',JSON.stringify(this.fieldDataWithLabels));
    }      
    
    loadTabData() {
        getTabs()
        .then(result => {
            this.tabsData = result;
            this.isLoading = false;
        })
        .catch(error => {
            console.log(error);
            this.isLoading = false;
        })
    }

    handlegetagreementcatelog(event){
        this.agreementcatelogdata=event.detail.selectedrows;
        this.catelogPreselected= event.detail.preselected;
         console.log('Catalog preseec prdselec :: '+ JSON.stringify(this.catelogPreselected));
         console.log('Catalog agreCatl prdselec :: '+ JSON.stringify(this.agreementcatelogdata));
        if(this.preFastSelectedRows){
            this.agreementfastdata = this.agreementfastdata.filter(row => this.preFastSelectedRows.includes(row.recordId));
        }
        this.tabName = 'Agreement_Catelog';
        this.count = this.agreementcatelogdata.length;
        if (this.count > 0) {
            this.disableButton = false;
        }
        else {
            this.disableButton = true;
        }
    }

    handlegetagreementfast(event){
        this.agreementfastdata=event.detail.selectedrows;
        this.fastPreselected =event.detail.preselected;
        this.agreementfastdata = this.agreementfastdata.filter(row => row.productId !== '' &&  row.productId !== null && row.productId !== undefined);
         if(this.preSelectedRows){
            this.agreementcatelogdata = this.agreementcatelogdata.filter(row => this.preSelectedRows.includes(row.recordId));
        }
         const uniqueProductsMap = new Map();
        this.agreementfastdata.forEach(row => {
            if (!uniqueProductsMap.has(row.productId)) {
                uniqueProductsMap.set(row.productId, row);
            }
        });
        this.agreementfastdata = Array.from(uniqueProductsMap.values());
        this.tabName = 'Agreement_Catelog';
        this.count = this.agreementfastdata.length;
        if (this.count > 0) {
            this.disableButton = false;
        } else {
            this.disableButton = true;
        }
    }

    handleAddLineItems(event){
        this.agreementdata =[];
        this.loading = true;
        setTimeout(() => {
        this.agreementdata = this.agreementdata.concat(this.agreementcatelogdata);
        this.agreementdata = this.agreementdata.concat(this.agreementfastdata);
       
        if(this.agreementdata){
            let agreementRecord = {selectedrows : this.agreementdata , preselected :this.catelogPreselected,fastpreSelect :this.fastPreselected}
            const selectRecord = new CustomEvent("getproductselections",{
                detail:agreementRecord, bubbles: true, composed: true
            });
            this.dispatchEvent(selectRecord);

            let toastMessage = '';
            if (this.tabName === 'Agreement_Catelog') {
                toastMessage = 'Products added to cart Successfully from Catalog!!!';
            } else if (this.tabName === 'Agreement_Products') {
                toastMessage = 'Products added to cart Successfully from Quick Agreement lines!!!';
            } 

            if (toastMessage) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!!',
                        message: toastMessage,
                        variant: 'success',
                    }),
                );
            }
            this.disableButton = true;
        } else if(this.agreementdata === 0){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Selected atleast one Agreement line items !!!',
                    variant: 'error',
                }),
            );
        }
        this.loading = false;
         }, 0);  
    } 
    /*handleAddLineItems(event) {
        console.log(this.isLoading + ' before setting to true');
        this.loading = true; // Show spinner when action starts
       // this.agreementdata =[];
        // Introduce a delay before processing to allow for the spinner to render
        setTimeout(() => {
            console.log(this.isLoading + ' after setting to true');
             console.log(' after setting to true preSelectedRows :; '+JSON.stringify(this.preSelectedRows));
            // Combine all data sources using the spread operator
            this.agreementdata = [
                ...this.agreementcatelogdata,
                ...this.agreementfastdata
            ];

            if (this.agreementdata.length > 0) {
                let agreementRecord = {
                    selectedrows: this.agreementdata,
                    preselected: this.catelogPreselected,
                    fastpreSelect: this.fastPreselected
                };
                const selectRecord = new CustomEvent("getproductselections", {
                    detail: agreementRecord, bubbles: true, composed: true
                });
                this.dispatchEvent(selectRecord);

                let toastMessage = '';
                if (this.tabName === 'Agreement_Catelog') {
                    toastMessage = 'Products added to cart Successfully from Catalog !';
                } else if (this.tabName === 'Agreement_Products') {
                    toastMessage = 'Products added to cart Successfully from Quick Agreement lines !';
                }

                if (toastMessage) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success!!',
                            message: toastMessage,
                            variant: 'success',
                        })
                    );
                }
                this.disableButton = true;
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!!',
                        message: 'Select at least one Agreement line item !',
                        variant: 'error',
                    })
                );
            }

            // Ensure spinner is disabled after processing is complete
            this.loading = false; // Hide spinner after processing is complete
            console.log(this.loading + ' after processing');
        }, 0); // Delay of 0 ms to allow for rendering the spinner
    }*/
    updatepricefiltertab(event){
         const filter=event.detail;
        console.log(JSON.stringify(filter)+' filter product selection');
         const pricefilter = new CustomEvent("updatepricefilterselection", {
        detail: filter, bubbles: true, composed: true
      });
      this.dispatchEvent(pricefilter);
      
    }

}