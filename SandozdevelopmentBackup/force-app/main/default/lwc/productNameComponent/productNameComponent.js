import { LightningElement, api, track } from 'lwc';
import getRecordName from '@salesforce/apex/ProductController.getRecordName';
export default class ProductNameComponent extends LightningElement {
    @api value;
    @api objname;
    @api recordId;
    @api fieldapi;
    @api fieldapiname;
    @api fieldLookupName;
    @api addfield; 
    @api addcol;
    @api aggrementId;
    @api isDisabled ;
    @api hasValue;
    @api priceList;
    @api productName ;
    @track isProduct = true;
    
    // matchingInfo = {
    //     primaryField: { fieldPath: this.fieldLookupName }
    // };

    // displayInfo = {
    //     primaryField: this.fieldLookupName
    // }
    
    connectedCallback() {
      /*  console.log('price list in product name comp :: '+this.priceList);
       // var additionalSearch = this.addfield ? this.addfield : this.fieldLookupName;
          var additionalSearch = this.addfield ? this.addfield : 'Name';
        this.matchingInfo = {
           // primaryField: { fieldPath: this.fieldLookupName },
            primaryField: { fieldPath: 'Name' },
            additionalFields: [{ fieldPath: additionalSearch }],
        };
        if(this.addfield){
            this.displayInfo = {
               // primaryField: this.fieldLookupName,
                 primaryField: 'Name',
                additionalFields: [this.addfield],
            };
        } else {
            this.displayInfo = {
               // primaryField: this.fieldLookupName
                primaryField: 'Name'
            };
        }*/
    }

    handleRecordRemove(event){
        let selectedData = {rowId: this.recordId, fieldapi : this.fieldapi, recordfieldAPI: this.fieldapiname, addcol: this.addcol};
            const selectedEvent = new CustomEvent('productchanged', {
                detail: selectedData, bubbles: true, composed: true
            });
            this.dispatchEvent(selectedEvent);
    }

    handleRecordSelect(event){
        console.log('handleRecordSelect '+event.detail);
      //  if(this.aggrementId){
           let selectedData = {productId: event.detail.id, rowId: this.recordId, fieldapi : this.fieldapi, recordfieldAPI: this.fieldapiname, addcol: this.addcol};
            const selectedEvent = new CustomEvent('productchanged', {
                detail: selectedData, bubbles: true, composed: true
            });
            this.dispatchEvent(selectedEvent);
       /* } else {
            getRecordName({ objName: this.objname, recId: event.detail.id, fieldLookupName: this.fieldLookupName, addfield: this.addfield})
            .then(result => {
                let selectedData = {selectedRecord: event.detail.id, rowId: this.recordId, fieldapi: this.fieldapi, recordname: result[this.fieldLookupName], recordfieldAPI: this.fieldapiname, addfieldVal : result[this.addfield], addcol : this.addcol };
                const selectedEvent = new CustomEvent('productselected', {
                    detail: selectedData, bubbles: true, composed: true
                });
                this.dispatchEvent(selectedEvent);
            })
            .catch(error => {
                this.error = error;
            })
        }*/
    }
}