import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchHeaderData from '@salesforce/apex/ProductController.fetchHeaderData';
import getRecord from '@salesforce/apex/ProductController.getRecord';
import getRecordName from '@salesforce/apex/ProductController.getRecordName';
import getCurrencySymbol from '@salesforce/apex/UtilityController.getCurrencySymbol';
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
    @api orderdate;
    @api datefield;
    @api priceList;
    @api cerApi;
    @track selectedLocation;
    @track userCurrencySymbol;
    @track userCurrencyCode;
    @track userLocale;
    @track netTotal = 0;
    @track preSelectedRows ;
    @track preFastSelectedRows;
    componentLoaded=false;

    connectedCallback() {
        this.fetchRecord();
        this.loadHeaderData();
        this.getUserCurrencySymbol();
         console.log('recId ::: '+ JSON.stringify(this.recId));
          console.log('priceList ::: '+ JSON.stringify(this.priceList));
           console.log('cerApi ::: '+ JSON.stringify(this.cerApi));
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
                        this.orderdate = this.fields[i].value;
                    }
                    if (this.fields[i].isLocation) {
                        this.selectedLocation = this.fields[i].value;
                        this.locationfield = this.fields[i].fieldName;
                    }
                }
                this.relatedobject = this.fields[0].relatedObject;
                this.showLoader = false;
            }
        })
        .catch(error => {
            this.error = error;
        })
    }

    loadHeaderData() {
        fetchHeaderData({ recId: this.recId, typename: this.typename, orderId: this.orderid })
        .then(result => {
            console.log(result);
            this.orderData = result;
        })
        .catch(error => {
            this.error = error;
        })
    }

    handlevaluerecieved(event) {
        const { fieldName, value, label } = event.detail;

        var fieldSetArray = [];
        for (var i = 0; i < this.fields.length; i++) {
            var obj = { ...this.fields[i] };
            if (this.fields[i].fieldName == fieldName) {
                obj.value = value;
            }
            if (this.locationfield == fieldName) {
                this.selectedLocation = value;
            }
            if (this.datefield == fieldName) {
                this.orderdate = value;
            }
            fieldSetArray.push(obj);
        }
        this.fields = fieldSetArray;

        var hasfieldName = false;
        var hasReference = false;
        var objName = '';
        var fieldLookupName = '';
        for (var i = 0; i < this.orderData.length; i++) {
            if (this.orderData[i].fieldName == fieldName) {
                hasfieldName = true;
                if (this.orderData[i].isReference && value) {
                    hasReference = true;
                    objName = this.orderData[i].objName;
                    fieldLookupName = this.orderData[i].fieldLookupName;
                }
            }
        }

        if (hasfieldName) {
            if (hasReference) {
                getRecordName({ objName: objName, recId: value, fieldLookupName: fieldLookupName, addfield: '' })
                    .then(result => {
                        var dataArray = [];
                        for (var i = 0; i < this.orderData.length; i++) {
                            var obj = { ...this.orderData[i] };
                            if (this.orderData[i].fieldName == fieldName) {
                                obj.value = result[this.orderData[i].fieldLookupName];
                            }
                            dataArray.push(obj);
                        }
                        this.orderData = dataArray;
                    })
                    .catch(error => {
                        this.error = error;
                    })
            } else {
                var dataArray = [];
                for (var i = 0; i < this.orderData.length; i++) {
                    var obj = { ...this.orderData[i] };
                    if (this.orderData[i].fieldName == fieldName) {
                        obj.value = value;
                    }
                    dataArray.push(obj);
                }
                this.orderData = dataArray;
            }
        }
    }

    handlegetrecorddata(event) {
        this.prodData = event.detail.orderproductdata;
        this.preFastSelectedRows = event.detail.fastpreSelect;
        this.preSelectedRows = event.detail.preselected;
        console.log('Main cmp fast pre :: ' + JSON.stringify( this.preFastSelectedRows));
        console.log('Main cmp catlog pre :: ' + JSON.stringify( this.preSelectedRows));
    }

    handleparentloader(event) {
        this.showLoader = event.detail;
    }

}