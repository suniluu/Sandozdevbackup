import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fetchOrderLineItems from "@salesforce/apex/ProductController.fetchOrderLineItems";
export default class Body extends LightningElement {
    @api orderdata;
    @api orderproductdata;
    @api orderdate;
    @api selectedLocation;
    @api productData;
    @api initialRecords;
    @api initialData;
    @api fields;
    @api typename;
    @api recId;
    @api objname;
    @api entryselecteddata = {};
    @api cartCount;
    @api deleteRecordData;
    @api orderid;
     @api priceList;
    @api cerApi;
    
    @track orderReduestLoaded = false;
    @track discountdataprod = [];
    @track totalNetPrice=0;
    @track index = 1;
    @track preSelecteCatelog;
    @api preSelectedRows = [];
    @api preFastSelectedRows = [];
    @track preSelectedFast;

    step = 1;
    currentStep = "1";
    firstPageClass = 'show-div';
    secondPageClass = 'hide-div';
    thirdPageClass = 'hide-div';
    fourthPageClass = 'hide-div';
    
    connectedCallback() {
        this.typename = this.typename.replaceAll(' ', '');
        this.initialDataloaded=true;
        if(this.orderid){
            this.firstPageClass = 'hide-div';
            this.thirdPageClass = 'show-div';
            this.currentStep = "3"; 
            this.getOrderLineItems();
        }
    }

    handleFieldChange(event) {
        this.entryselecteddata = event.detail.allFields;

    }

    handleTabClick(event) {
        this.step = event.target.value;
        this.handleSetUpSteps();
    }

    handleSetUpSteps() {
        var hasError = false;
        if (this.step != 1) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].isRequired && !this.fields[i].value) {
                    hasError = true;
                }
            }
        }
        if (hasError) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Required Fields',
                    message: 'Please enter required fields',
                    variant: 'error',
                }),
            );
        } else {
            if (!this.orderReduestLoaded && this.step == 2) {
                this.orderReduestLoaded = true;
            } else if (this.orderReduestLoaded && this.step == 1) {
                this.orderReduestLoaded = false;
            }
           /* if(this.orderid != null){
                // this.firstPageClass = this.step == 1 ? 'show-div' : 'hide-div';
                // this.secondPageClass = this.step == 2 ? 'show-div' : 'hide-div';
                this.thirdPageClass = this.step == 3 ? 'show-div' : 'hide-div';
                this.fourthPageClass = this.step == 4 ? 'show-div' : 'hide-div';
                this.currentStep = "" + this.step;
            }else{*/
                this.firstPageClass = this.step == 1 ? 'show-div' : 'hide-div';
                this.secondPageClass = this.step == 2 ? 'show-div' : 'hide-div';
                this.thirdPageClass = this.step == 3 ? 'show-div' : 'hide-div';
                this.fourthPageClass = this.step == 4 ? 'show-div' : 'hide-div';
                this.currentStep = "" + this.step;
           // }
           
        }
    }

    handleDatafromOrderReq(event) {
        this.orderproductdata = event.detail.selectedrows;
        this.preSelectedFast = event.detail.fastpreSelect;
        this.preSelecteCatelog = event.detail.preselected;
         let orderdata = {orderproductdata : this.orderproductdata , preselected :this.preSelecteCatelog,fastpreSelect :this.preSelectedFast} 
        if (this.orderproductdata) {
            const selectCount = new CustomEvent("getrecorddata", {
                detail: orderdata,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectCount);
            let productDataWithIndex;
            let productsArray = [];
            let valuesArray = [];
            if (this.discountdataprod.length > 0) { 
                for (let i = 0; i < this.orderproductdata.length; i++) {
                    let found = false;
                    for (let j = 0; j < this.discountdataprod.length; j++) {
                        if (this.orderproductdata[i].nationalId === this.discountdataprod[j].nationalId) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        productsArray.push(this.orderproductdata[i]);
                    }
                }
                valuesArray = productsArray;
            } else {
                valuesArray = this.orderproductdata; 
            }
            productDataWithIndex = valuesArray;
            var dataArray = [];
            for(var i = 0; i < productDataWithIndex.length; i++){
                if(productDataWithIndex[i].productName != ''){
                    var obj = {...productDataWithIndex[i]};
                    obj.recordIndex = this.index++;
                    obj.orderdate = this.orderdate;
                    obj.location = this.selectedLocation;
                    obj.isDisabled = false;
                    obj.hasValue = this.selectedLocation ? true : false;
                    dataArray.push(obj);
                }
            }
            productDataWithIndex = dataArray;
            if(this.discountdataprod != null){
                this.productData = productDataWithIndex.concat(this.discountdataprod);
                this.initialData = this.initialData? this.initialData.concat(productDataWithIndex):productDataWithIndex;
                this.initialRecords = this.productData;
                this.discountdataprod = productDataWithIndex.concat(this.discountdataprod);
            }else{
                this.productData = productDataWithIndex;
                this.initialData = this.initialData? this.initialData.concat(productDataWithIndex):productDataWithIndex;
                this.initialRecords = this.productData;
                this.discountdataprod = productDataWithIndex;
            }
            console.log(JSON.stringify(this.productData)+'Productdata');
            this.totalNetPrice = 0;
            for (var i = 0; i < this.productData.length; i++) {
                if (this.productData[i].netPrice) {
                    this.totalNetPrice += parseFloat(this.productData[i].netPrice);
                }
            }
            this.totalNetPrice = this.totalNetPrice.toFixed(2);
            this.cartCount=this.productData.length;
            let totalwithcount = { netTotal: this.totalNetPrice, count: this.cartCount };
            const netPriceEvent = new CustomEvent('totalnetpricebody', {
                detail: totalwithcount, bubbles: true, composed: true
            });
            this.dispatchEvent(netPriceEvent);
        } else {
            console.log('orderdata is not an object.');
        }
    }

    getOrderLineItems(){
        let dataArray=[];
        fetchOrderLineItems({ orderId: this.orderid })
        .then((result) => {
            if(result){
                console.log(JSON.stringify(result)+' bodyresult');
                let selectedids=[];
                for(var i = 0; i < result.length; i++){
                    console.log(JSON.stringify(result[i])+' bodyresult[i]');
                    if(result[i].productName != ''){
                        let obj = { ...result[i] };
                        obj.orderdate = this.orderdate?this.orderdate:'';
                        obj.location = this.selectedLocation?this.selectedLocation:'';
                        obj.isDisabled = false;
                        obj.hasValue = this.selectedLocation ? true : false;
                        dataArray.push(obj);
                        selectedids.push(result[i].Id);
                    }
                    this.preSelectedRows=selectedids?selectedids:'';
                }
                this.productData = dataArray;
                console.log(JSON.stringify(dataArray)+' dataArray');
                console.log(JSON.stringify(this.productData)+' this.productData');
                this.discountdataprod = dataArray;
                this.initialData = dataArray;
                this.initialRecords = dataArray;
                this.index = dataArray.length;
                console.log(this.preSelectedRows);
                this.totalNetPrice = 0;
                for (var i = 0; i < this.productData.length; i++) {
                    if (this.productData[i].netPrice) {
                        this.totalNetPrice += parseFloat(this.productData[i].netPrice);
                    }
                }
                this.totalNetPrice = this.totalNetPrice.toFixed(2);
                this.cartCount=this.productData.length;
                let totalwithcount = { netTotal: this.totalNetPrice, count: this.cartCount };
                const netPriceEvent = new CustomEvent('totalnetpricebody', {
                    detail: totalwithcount, bubbles: true, composed: true
                });
                this.dispatchEvent(netPriceEvent);
                }
        })
        .catch((error) => {
            this.error = error;
        });
    }

    deletedata(event){
        this.deleteRecordData = event.detail;
        if(this.deleteRecordData.length >0){
             if(this.preSelecteCatelog){
                const deletedIds = this.deleteRecordData.map(
                    (item) => item.Id
                );
                this.preSelectedRows = this.preSelecteCatelog.filter(item => !deletedIds.includes(item));
                this.preSelecteCatelog= this.preSelectedRows;
            }
            if(this.preSelectedFast){
                const deletedIds = this.deleteRecordData.map(
                    (item) => item.recordId
                );
                this.preFastSelectedRows = this.preSelectedFast.filter(item => !deletedIds.includes(item));
                this.preSelectedFast = this.preFastSelectedRows;
            }
        }   
    }

    discountdata(event) {
        this.discountdataprod = event.detail.productdata;
        this.index=event.detail.index;
    }

    handlevalueselected(event) {
        const { fieldName, value, label } = event.detail;
         console.log('Selected field body cmp ::: '+ JSON.stringify(event.detail));
        let selectedData = { fieldName: fieldName, value: value, label: label };
        const selectedEvent = new CustomEvent('valuerecieved', {
            detail: selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }

    handletotalnetprice(event) {
       const  totalPrice = event.detail;
        const selectedEvent = new CustomEvent('totalnetpricebody', {
            detail: totalPrice, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }

    handleloadercompletion(event) {
        const selectedEvent = new CustomEvent('parentloader', {
            detail: event.detail, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
}