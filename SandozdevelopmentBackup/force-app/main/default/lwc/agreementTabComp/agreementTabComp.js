import { LightningElement, api,track } from 'lwc';

export default class AgreementTabComp extends LightningElement {
    @api tablabel;
    @api recId;
    @api fields;
    @api preSelectedRows;
    @api preFastSelectedRows;
    @api fieldDataWithLabels;
    @track agreementcatelog;
    @track agreementfast;


    get agreementCatelog(){
        return this.tablabel == 'Agreement_Catelog';
    }

    get agreementSelection(){
        return this.tablabel == 'Agreement_Products';
    }

    handlegetagreementcatelogprods(event){
        this.agreementcatelog=event.detail;
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