import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fetchOrderLineItems from "@salesforce/apex/ProductController.fetchOrderLineItems";

import linestatus from '@salesforce/label/c.Order_lineItem_Status';
import newlinestatus from '@salesforce/label/c.New_Order_LineItem';
export default class Body extends LightningElement {
    @api orderdata;
    @api orderproductdata; 
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
    @api fielddata;
    @track enablecancelbutton=false;
    
    @track orderReduestLoaded = false;
    @track discountdataprod = [];
    @track totalNetPrice=0;
    @track index = 1;
    @track preSelecteCatelog;
    @api preSelectedRows = [];
    @api preFastSelectedRows = [];
    @track preSelectedFast;
    @track oldstep='';
    @track displayerror='';
    @track checkingvalue=false;
    @track newlineitems=[];
    @api datefield;


    @api locationfield; 
    @api wholesalerfield;
    step = 1;
    currentStep = "1";
    firstPageClass = 'show-div';
    secondPageClass = 'hide-div';
    thirdPageClass = 'hide-div';
    fourthPageClass = 'hide-div';
        @track orderlinestatus=linestatus;
        @track neworderlinestatus=newlinestatus;
    connectedCallback() {
           console.log(this.orderlinestatus+' orderlinestatus');
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
        if (this.displayerror == true && 3 < this.step) {
            const event = new ShowToastEvent({
                title: "Error",
                message: "There are error in cuurent You cant got to nxt page",
                variant: "error",
                mode: "dismissable"
            });
            this.dispatchEvent(event);
        } else {
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
                if (this.checkingvalue == true && this.step > 3) {
                const event = new ShowToastEvent({
                    title: "Error",
                    message: "Please click on validate pricing button once",
                    variant: "error",
                    mode: "dismissable"
                });
                this.dispatchEvent(event);
                } else {
                        this.firstPageClass = this.step == 1 ? 'show-div' : 'hide-div';
                        this.secondPageClass = this.step == 2 ? 'show-div' : 'hide-div';
                        this.thirdPageClass = this.step == 3 ? 'show-div' : 'hide-div';
                        this.fourthPageClass = this.step == 4 ? 'show-div' : 'hide-div';
                        this.currentStep = "" + this.step;
                        this.oldstep=this.currentStep;
                }
            }
        }
    }
    handleEntrySaved(event){
        const { fieldData, fieldAttributes } = event.detail;
        console.log(JSON.stringify(fieldData)+' fieldData');
         console.log(JSON.stringify(fieldAttributes)+' fieldAttributes');

        const selectedEvent = new CustomEvent('valuerecieved', {
                detail: fieldData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectedEvent);
        this.fields=fieldAttributes;
        this.fielddata=fieldData;
        this.step++;
        let dataArray=[];
          for(var i = 0; i < this.discountdataprod.length; i++){
                   if(this.discountdataprod[i].productName != ''){
                           var obj = {...this.discountdataprod[i]}; 
                   // obj.orderdate = this.orderdate;
                    obj.location =  this.locationfield? this.fielddata[ this.locationfield]? this.fielddata[ this.locationfield]:'':'';
                 
                    obj.wholesaler=this.wholesalerfield?this.fielddata[ this.wholesalerfield]? this.fielddata[ this.wholesalerfield]:'':'';
                        obj.isDisabled = false;
                        obj.hasValue=true;
                           obj.orderdate=this.datefield? this.fielddata[ this.datefield]? this.fielddata[ this.datefield]:'':'';    
                      //  obj.hasValue = obj.location ? true : false;

                    dataArray.push(obj);
                    console.log(JSON.stringify(obj)+' objbody');
                }
            }
              console.log(JSON.stringify(this.productData)+' productData');
            this.productData=[...dataArray];
        this.handleSetUpSteps();
    }

    handleDatafromOrderReq(event) {
          console.time("handleDatafromOrderReq Execution Time"); // Start timer
        console.log(JSON.stringify(this.fielddata)+' fieldsdata start');
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
                   // obj.orderdate = this.orderdate;
                    obj.location =  this.locationfield? this.fielddata[ this.locationfield]? this.fielddata[ this.locationfield]:'':'';
                 obj.checkboxorder=false;
                 obj.status=this.neworderlinestatus;
                 
                    obj.wholesaler=this.wholesalerfield?this.fielddata[ this.wholesalerfield]? this.fielddata[ this.wholesalerfield]:'':'';
                        obj.isDisabled = false;
                        obj.hasValue=true;
                           obj.orderdate=this.datefield? this.fielddata[ this.datefield]? this.fielddata[ this.datefield]:'':'';    
                      //  obj.hasValue = obj.location ? true : false;

                    dataArray.push(obj); 
                }
            }
            productDataWithIndex = dataArray;
         
        this.checkingvalue = true ;
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
      //  this.productData=this.productData.slice(0, 50); 
         console.timeEnd("handleDatafromOrderReq Execution Time");
    }

    getOrderLineItems(){
        let dataArray=[];
        fetchOrderLineItems({ orderId: this.orderid })
        .then((result) => {
            if(result){
                console.log(JSON.stringify( result)+'  result body');
                this.checkingvalue=false;
                let selectedids=[];
                for(var i = 0; i < result.length; i++){
                    if(result[i].productName != ''){
                           console.log(result[i].status +' result.status ');
                         if(result[i].status!='' &&result[i].status!=null && result[i].status==this.orderlinestatus){
                            this.enablecancelbutton=true;
                            
                        }
                        let obj = { ...result[i] };
                        // obj.orderdate = this.orderdate?this.orderdate:'';
                        // obj.location = this.selectedLocation?this.selectedLocation:'';
                        //                             obj.selectedwholesaler=this.selectedwholesaler?this.selectedwholesaler:'';
                        obj.isDisabled = false;
                        obj.hasValue=true;
                       // obj.hasValue = this.selectedLocation ? true : false;
                        obj.recordIndex=this.index++;
                        dataArray.push(obj);
                        selectedids.push(result[i].Id);
                    }
                    this.preSelectedRows=selectedids?selectedids:'';
                }
                this.productData = dataArray;
                this.discountdataprod = dataArray;
                this.initialData = dataArray;
                this.initialRecords = dataArray;
                //this.index = dataArray.length;
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
                console.log(JSON.stringify( this.productData)+'  this.productData body');
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
            this.checkingvalue = true ;  
        } 
    }

    discountdata(event) {
        this.discountdataprod = event.detail.productdata;
        this.index=event.detail.index;
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
    errormsg(event) {
        this.oldstep = this.currentStep;
        const errormsg=event.detail.errormsg ? event.detail.errormsg : '';
        this.displayerror = event.detail.displayerror ? event.detail.displayerror : '';
        this.checkingvalue = event.detail.checkingvalue ? event.detail.checkingvalue : '';
      
        if (this.displayerror == true) {
            const event = new ShowToastEvent({
                title: "Error",
                message: errormsg,
                variant: "error",
                mode: "dismissable"
            });
            this.dispatchEvent(event);
        }
    }
}