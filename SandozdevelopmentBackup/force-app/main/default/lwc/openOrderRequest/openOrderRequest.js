import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class OpenOrderRequest extends NavigationMixin(LightningElement) {
    @api recordId;

    @api invoke() {
        this[ NavigationMixin.GenerateUrl ]( {
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view',
            },
        } ).then( url => {
            let completeURL = window.location.origin + url;
            window.open( completeURL, "_blank" );
        } );
    }
}