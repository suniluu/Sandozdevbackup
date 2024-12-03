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
    
    @api preSelectedRecord =[];
    @api fieldValues; 
    @api recordId;
    @api deleterecorddata;
    @api preSelectedRows;
    @api preFastSelectedRows;
    @api fieldDataWithLabels;
      
    connectedCallback() {
        this.loadTabData(); 
    }      
    
    loadTabData() {
        getTabs()
        .then(result => {
            this.tabsData = result;
        })
        .catch(error => {

        })
    }

    handlegetagreementcatelog(event){
        this.agreementcatelogdata=event.detail.selectedrows;
        this.catelogPreselected= event.detail.preselected;
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
    } 
}