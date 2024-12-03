import { LightningElement, api,track } from 'lwc';

export default class AgreementTabComp extends LightningElement {
    @api tablabel;
    @api recId;
    @api fields;
    @api preSelectedRows;
    @api preFastSelectedRows;
    @api fieldDataWithLabels;
    @api objectapiname;

    @track agreementcatelog;
    @track agreementfast;

   renderedCallback(){
        console.log('objApi from tab comp :: '+this.objectapiname);
        console.log('fields from tab comp :: '+this.fields);
    }
    get agreementCatelog(){
        return this.tablabel == 'Agreement_Catelog';
    }

    get agreementSelection(){
        return this.tablabel == 'Agreement_Products';
    }

    handlegetagreementcatelogprods(event){
        this.agreementcatelog=event.detail;
        console.log('Catalog tabcmp pre and selec :: '+ JSON.stringify(this.agreementcatelog));
        const selectFastOrder = new CustomEvent("getagreementcatelog",{
            detail:this.agreementcatelog, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);
    }

    handlegetagreementfastprods(event){
        this.agreementfast=event.detail;
        const selectFastOrder = new CustomEvent("getagreementfast",{
            detail:this.agreementfast, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);
    }
}