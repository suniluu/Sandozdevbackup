import { LightningElement,track,wire,api } from 'lwc';
import Scalefluidly from "@salesforce/resourceUrl/Scalefluidly";
//import getCurrencySymbol from '@salesforce/apex/ProductController.getCurrencySymbol';
export default class Header extends LightningElement {
    scalefluidlyLogo = Scalefluidly;
    @api cartCount;
    @api orderData;
    @api recname;
    @api objname;
    @api objicon;
    @api totalPrice;
    
    renderedCallback() {
        if(!this.componentLoaded){
            const style2 = document.createElement('style');
            style2.innerText = '.container .slds-icon-custom-custom93 .slds-icon {background-color: rgb(1, 118, 221);}';
            this.template.querySelector('.container').appendChild(style2);
            this.componentLoaded = true;
        }
    }
}