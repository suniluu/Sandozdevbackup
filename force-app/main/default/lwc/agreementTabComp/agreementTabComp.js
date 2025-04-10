import { LightningElement, api,track } from 'lwc';

export default class AgreementTabComp extends LightningElement {
    @api tablabel;
    @api recId;
    @api fields;
    @api preSelectedRows;
    @api preFastSelectedRows;
    @api fieldDataWithLabels;
    @api objectapiname;
    @api loading;
    @api filterfield;

    @track agreementcatelog;
    @track agreementfast;
         @api rows;
     @api index;
     @api conditionalValue;


   renderedCallback(){
        console.log('objApi from tab comp :: '+this.objectapiname);
        console.log('fields from tab comp :: '+JSON.stringify(this.fields));
    }
    get agreementCatelog(){
        return this.tablabel == 'Agreement_Catelog';
    }

    get agreementSelection(){
        return this.tablabel == 'Agreement_Products';
    }

    get agreementFilter(){
        return this.tablabel == 'Agreement_Filter';
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

    updatepricefilter(event){
        const filter=event.detail;
        console.log(JSON.stringify(filter)+' filter');
         const pricefilter = new CustomEvent("updatepricefiltertab", {
        detail: filter, bubbles: true, composed: true
      });
      this.dispatchEvent(pricefilter);
    }
}