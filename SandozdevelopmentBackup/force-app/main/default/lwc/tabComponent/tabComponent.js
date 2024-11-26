import { LightningElement, api,track } from 'lwc';
export default class TabComponent extends LightningElement {
    @api tablabel;
    @api recId;
    @api fields;
    @api preSelectedRows;
    @api preFastSelectedRows;

    get quickOrder(){
        return this.tablabel == 'Quick_Order';
    }

    get reorder(){
        return this.tablabel == 'Re_Order';
    }

    get contractedProducts(){
        return this.tablabel == 'Contracted_Products';
    }

    get pricing(){
        return this.tablabel == 'Pricing';
    }

    handleFastOrderProduct(event){
        const selectRecords = new CustomEvent("getfastorderproduct1",{
            detail:event.detail, bubbles: true, composed: true 
        });
        this.dispatchEvent(selectRecords);
    }

    handlePricingComapareProds(event){
        const selectRecords = new CustomEvent("getpricingcompareproducttab",{
            detail:event.detail, bubbles: true, composed: true
        });
        this.dispatchEvent(selectRecords);
    }

    handleReorderProds(event){
        const selectRecords = new CustomEvent("getreorderproducttab",{
            detail:event.detail, bubbles: true, composed: true
        });
        this.dispatchEvent(selectRecords);
    }
}