import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchHeaderData from '@salesforce/apex/ProductController.fetchHeaderData';
import getRecord from '@salesforce/apex/ProductController.getRecord';
import getRecordName from '@salesforce/apex/ProductController.getRecordName';
import getCurrencySymbol from '@salesforce/apex/ProductController.getCurrencySymbol';
export default class QuickOrder extends NavigationMixin(LightningElement) {
    @api type;
    @api recId;
    @api typename;
    @api recname;
    @api objname;
    @api objicon;
    @api orderid;
    @api cartCount = 0;
    @api totalNetPrice =0;
    @track orderData = [];
    @api prodData;
    @track showLoader = false;
    @api fields;
    @api relatedobject; 
    @api datefield;
    @api priceList;
    @api cerApi; 
    @track userCurrencySymbol;
    @track userCurrencyCode;
    @track userLocale;
    @track fielddata=[];
    @track netTotal = 0;
    @track preSelectedRows ;
    @track preFastSelectedRows;
    componentLoaded=false;
  @track locationfield='';
    @track wholesalerfield=''; 
    connectedCallback() {
        this.fetchRecord();
        this.loadHeaderData();
        this.getUserCurrencySymbol();
    }

    getUserCurrencySymbol() {
        getCurrencySymbol()
        .then(result => {
            this.userCurrencySymbol = result;
            this.userLocale = this.getUserLocaleFromCurrencySymbol(result);
                this.userCurrencyCode = this.getCurrencyCodeFromSymbol(result);
        })
        .catch(error => {
            console.error('Error fetching currency symbol:', error);
            this.userCurrencySymbol = '$';
            this.userLocale = 'en-US';
            this.userCurrencyCode ='USD';
        });
    }

    getUserLocaleFromCurrencySymbol(currencySymbol) {
        switch (currencySymbol) {
            case '$':
                return 'en-US';
            case '€':
                return 'en-EU';
            case '₹':
                return 'en-IN';
            case 'USD':
                return 'en-US';
            case 'EUR':
                return 'en-EU';
            case 'INR':
                return 'en-IN';
            default:
                return 'en';
        }
    }
 
    getCurrencyCodeFromSymbol(currencySymbol) {
        const currencySymbolToCode = {
            '$': 'USD', 
            '€': 'EUR', 
            '¥': 'JPY', 
            '£': 'GBP', 
            '₹': 'INR',
        };
        return currencySymbolToCode[currencySymbol] || currencySymbol; 
    }

    handleTotalnetPrice(event) {
        this.netTotal = event.detail.netTotal;
        const formattedCurrency = new Intl.NumberFormat(this.userLocale, {
            style: 'currency',
            minimumFractionDigits: 0, 
            currency: this.userCurrencyCode
        }).format(this.netTotal );
        this.totalNetPrice = formattedCurrency;
        this.cartCount = event.detail.count;
    }

    fetchRecord() {
        this.typename = this.typename ? this.typename.replaceAll(' ', '') : '';
        getRecord({ recId: this.recId, fieldSetName: this.typename, orderId: this.orderid })
        .then(result => {
            this.fields = result;
            if (this.fields) {
                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].isDate) {
                        this.datefield = this.fields[i].fieldName; 
                    }
                    if (this.fields[i].isLocation) { 
                        this.locationfield = this.fields[i].fieldName; 
                    }
                    if(this.fields[i].iswholesale){ 
                        this.wholesalerfield = this.fields[i].fieldName;
                    }
                        this.fielddata[this.fields[i].fieldName]= this.fields[i].value;
                }
                this.relatedobject = this.fields[0].relatedObject;
                this.showLoader = false;
                console.log(JSON.stringify(this.fielddata)+' this.fielddata');
            }
        })
        .catch(error => {
            this.error = error;
        })
    }

    loadHeaderData() {
        fetchHeaderData({ recId: this.recId, typename: this.typename, orderId: this.orderid })
        .then(result => {
            this.orderData = result;
        })
        .catch(error => {
            this.error = error;
        })
    }

    handlevaluerecieved(event) {
        const fieldEntries = Object.entries(event.detail);
        fieldEntries.forEach(([fieldName, value]) => {
                // Update fields
            this.fields = this.fields.map(field => {
                const updatedField = { ...field };
                if (field.fieldName === fieldName) {
                    updatedField.value = value;
                }
              
                
                return updatedField;
            });

            let orderField = this.orderData.find(order => order.fieldName === fieldName);
            if (orderField) {
                if (orderField.isReference && value) {
                    getRecordName({ 
                        objName: orderField.objName, 
                        recId: value, 
                        fieldLookupName: orderField.fieldLookupName,
                        addField: '' 
                    })
                    .then(result => {
                        this.orderData = this.orderData.map(order => {
                            const updatedOrder = { ...order };
                            if (order.fieldName === fieldName) {
                                updatedOrder.value = result[order.fieldLookupName];
                            }
                            return updatedOrder;
                        });
                    })
                    .catch(error => {
                        this.error = error;
                    });
                } else {
                    this.orderData = this.orderData.map(order => {
                        const updatedOrder = { ...order };
                        if (order.fieldName === fieldName) {
                            updatedOrder.value = value;
                        }
                        return updatedOrder;
                    });
                }
            } 
        });
    }

    handlegetrecorddata(event) {
        this.prodData = event.detail.orderproductdata;
        this.preFastSelectedRows = event.detail.fastpreSelect;
        this.preSelectedRows = event.detail.preselected;
    }

    handleparentloader(event) {
        this.showLoader = event.detail;
    }

}