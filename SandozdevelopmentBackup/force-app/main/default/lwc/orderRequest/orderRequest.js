import { LightningElement, track, wire, api } from 'lwc';
import getTabs from '@salesforce/apex/ProductController.getTabs';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class OrderRequest extends LightningElement {
    @track orderproductdata = [];
    @track tabsData = [];
    @track isLoading = true;
    @track disableButton = true;
    @track fastSelection = [];
    @track pricingProds = [];
    @track reOrderProds = new Map();
    @track reorderIds = [];
    @track tabName = '';
    @track catelogPreselected;
    @track fastPreselected;

    @api deleterecorddata;
    @api recId;
    @api fields;
    @api preSelectedRows;
    @api preFastSelectedRows;

    componentLoaded = false;
    count = 0;

    handleAddToCart(event) {
        this.orderproductdata = [];
        this.orderproductdata = this.orderproductdata.concat(this.fastSelection);
        for (var i = 0; i < this.reorderIds.length; i++) {
            this.orderproductdata = this.orderproductdata.concat(this.reOrderProds[this.reorderIds[i]]);
        }
        this.orderproductdata = this.orderproductdata.concat(this.pricingProds);       
        var dataarray = [];
        for (var i = 0; i < this.orderproductdata.length; i++) {
            var obj = { ...this.orderproductdata[i] };
            obj.quantity = obj.quantity ? obj.quantity : 1;
            obj.price = obj.price ? obj.price : 0;
            obj.listPrice = obj.quantity * obj.price;
            obj.discount = obj.discount ? Math.floor(obj.discount) : 0;
            obj.contractdiscount = obj.discount ? Math.floor(obj.discount) : 0;
            obj.netPrice = obj.listPrice - ((obj.listPrice * obj.discount) / 100);
            obj.baseprice = obj.netPrice;
            dataarray.push(obj);
        }
        this.orderproductdata = dataarray;
        if (this.orderproductdata) {
             let orderRecords = {selectedrows : this.orderproductdata , preselected :this.catelogPreselected,fastpreSelect :this.fastPreselected}
            const selectFastOrder = new CustomEvent("getorderrequestdata", {
                detail: orderRecords,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(selectFastOrder);
            let toastMessage = '';
            if (this.tabName === 'Quick_Order') {
                toastMessage = 'Products added to cart Successfully from Quick_Order!!!';
            } else if (this.tabName === 'Re_Order') {
                toastMessage = 'Products added to cart Successfully from Re_Order!!!';
            } else if (this.tabName === 'Pricing') {
                toastMessage = 'Products added to cart Successfully from Catalog Products!!!';
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
        } else {
            console.log('No data to send for current tab');
        }
    }

    handlegetFastOrderfromTab(event) {
        this.fastSelection = event.detail.selectedRecord;
        this.fastPreselected= event.detail.preselected;
        this.fastSelection = this.fastSelection.filter(row => row.nationalId !== '' &&  row.nationalId !== null && row.nationalId !== undefined);
        if(this.preSelectedRows){
            this.pricingProds = this.pricingProds.filter(row => this.preSelectedRows.includes(row.recordId));
        }
        this.tabName = 'Quick_Order';
        this.count = this.fastSelection.length;
        if (this.count > 0) {
            this.disableButton = false;
        } else {
            this.disableButton = true;
        }
    }

    handlegetpricingcompareproduct(event) {
        this.pricingProds = event.detail.selectedRecord;
        this.catelogPreselected= event.detail.preselected;
        if(this.preFastSelectedRows){
            this.fastSelection = this.fastSelection.filter(row => this.preFastSelectedRows.includes(row.recordId));
        }
        this.tabName = 'Pricing';
        this.count = this.pricingProds.length;
        if (this.count > 0) {
            this.disableButton = false;
        } else {
            this.disableButton = true;
        }
    }

    handlegetreorderproduct(event) {
        if (!this.reorderIds.includes(event.detail.selectedId)) {
            this.reorderIds.push(event.detail.selectedId);
        }
        this.reOrderProds[event.detail.selectedId] = event.detail.selectedRecord;
        this.tabName = 'Re_Order';
        this.count = this.reorderIds.length;
        if (this.count > 0) {
            this.disableButton = false;
        } else {
            this.disableButton = true;
        }
    }

    connectedCallback() {
        this.loadTabData();
    }

    renderedCallback() {
        if (!this.componentLoaded) {
            if (this.template.querySelector('lightning-tabset')) {
                const style = document.createElement('style');
                style.innerText = 'lightning-tabset .slds-vertical-tabs lightning-tab-bar {width: 3.8rem; }}';
                this.template.querySelector('lightning-tabset').appendChild(style);

                const style1 = document.createElement('style');
                style1.innerText = 'lightning-tabset .slds-vertical-tabs slot lightning-tab {width: 80%}';
                this.template.querySelector('lightning-tabset').appendChild(style1);
            }
            this.componentLoaded = true;
        }
    }

    loadTabData() {
        getTabs()
        .then(result => {
            this.tabsData = result;
            this.isLoading = false;
        })
        .catch(error => {
            console.log(error);
        })
    }
}