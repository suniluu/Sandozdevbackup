import { LightningElement,track,wire,api } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getProductsData from '@salesforce/apex/AgreementController.getProductsData';
import updateProductsData from '@salesforce/apex/AgreementController.updateProductsData';
import fetchVolumeRange from '@salesforce/apex/AgreementController.fetchVolumeRange';

export default class AgreementProducts extends LightningElement {
    @track columns;
    @track sortBy;
    @track sortDirection = 'asc';
    @track initialRecords = [];
    @track dataLoading = false;
    @track isOpenFilterInput = false;
    @track filterValue = '';
    @track filterAppliedValue = '';
    @track data;
    @track saveDraftValues = [];

    @api recordId;

    get discountOption() {
        let options = [
            { label: "Discount Percent", value: "Percent" },
            { label: "Discount Amount", value: "Amount" }
        ];
        return options;
    }

    get typeOptions() {
        let options = [
            { label: "Flat", value: "Flat" },
            { label: "Volume", value: "Volume" }
        ];
        return options;
    }

    @track flatdiscount = false;
    @track volumediscount = false;
    @track isInlinepopup = false;

    @track discountTypeValue = 'Flat';
    @track flatDiscountValue = 'Percent';
    @track discountValue = 20;

    @track itemList = [
        
    ];

    mapFilterData = new Map();
    columnFilterValues = new Map();

    connectedCallback() {
        this.fetchColumns();
        this.loadProductsData();
    }

    fetchColumns(){
        getColumns({ columnData: 'Agreement_Products' })
        .then(result => {
            this.columns = JSON.parse(result.Column_JSON__c);
        })
        .catch(error => {
            this.error = error;
        })
    }

    loadProductsData(){
        getProductsData({ recordId: this.recordId })
        .then(result => {
            this.initialRecords = result;
            if(result.length > 50){
                this.data = result.slice(0, 50); 
            } else {
                this.data = result;
            }
            this.dataLoading = false;
        })
        .catch(error => {
            this.error = error;
        })
    }

    handleSave(event){
        this.saveDraftValues = event.detail.draftValues;
        updateProductsData({ recordId: this.recordId, saveDraftValues: JSON.stringify(this.saveDraftValues), productData : JSON.stringify(this.data) })
        .then(result => {
            this.data = result;
            this.saveDraftValues = [];
        })
        .catch(error => {
            this.error = error;
        })
    }

    handleInputType(event){
        if(event.detail.value=='Flat'){
            this.flatdiscount=true;
            this.volumediscount = false;
        } else{
            this.volumediscount=true;
            this.flatdiscount=false;
        }
    }

    handleDiscount(event){
        const {index,name} = event.detail;
        this.isInlinepopup = true;
        this.flatdiscount = false;
        this.volumediscount = false;

        let productId;
        let isVolume = false;
        var productFamily = '';
        
        if(this.data){
            for (let record of this.data) {
                if(record.Id == index){
                    if(!record.range){
                        this.flatdiscount = true;
                        this.volumediscount = false;
                        this.discountTypeValue = 'Flat';
                        this.flatDiscountValue = record.adjustmentType ? record.adjustmentType : 'Percent';
                        this.discountValue = record.discount;
                    } else {
                        isVolume = true;
                        productFamily = record.productFamily;
                    }
                    productId = record.productId;
                    break;
                }
            }
            if(isVolume){
                fetchVolumeRange({ recordId: this.recordId, productId: productId, productFamily: productFamily })
                .then(result => {
                    console.log(result);
                    this.itemList = result;
                    this.discountTypeValue = 'Volume';
                    this.volumediscount = true;
                    this.flatdiscount = false;
                })
                .catch(error => {
                    this.error = error;
                })
            }
        }
    }

    closeinlineEditPopup(){
        this.isInlinepopup=false;
        this.flatdiscount=false;
        this.volumediscount=false;
        this.itemList = [];
        this.discountValue = 0;
    }

    loadMoreData(event) {
        if(this.filterAppliedValue){
            const { target } = event;
            target.isLoading = true;
            const startIndex = this.data.length;
            const remainingRecords = this.initialRecords.length - startIndex;
            if (remainingRecords > 0) {
                const endIndex = Math.min(startIndex + 20, this.initialRecords.length);
                const newData = this.initialRecords.slice(startIndex, endIndex);
                this.data = this.data.concat(newData);
            } else {
                this.data = this.initialRecords;
                target.enableInfiniteLoading = false;
            }
            target.isLoading = false;
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }

    handleSearch(event){
        const searchKey = event.target.value.toLowerCase();
        if (searchKey.length>=3) {
            this.data = this.initialRecords;
            if (this.data) {
                let searchRecords = [];
                for (let record of this.data) {
                    let valuesArray = Object.values(record);
                    for (let val of valuesArray) {
                        console.log('val is ' + val);
                        let strVal = String(val);
                        if (strVal) {
                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }
                console.log('Matched Accounts are ' + JSON.stringify(searchRecords));
                this.data = searchRecords;
            }
        } else {
            //this.data = this.initialRecords;
            if(this.initialRecords.length>20){
                this.data = this.initialRecords.slice(0, 20); 
            } else {
               this.data = this.initialRecords;
            }
        }
    }

    closeFilterModal(){
        this.isOpenFilterInput = false;
        this.filterAppliedValue = '';
    }

    handleOpenFilterInput(){
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.filterAppliedValue = this.mapFilterData[filterColumnName];
        this.isOpenFilterInput = true;
    }

    handleHeaderAction(event){
        const actionName = event.detail.action.name;
        if (actionName.search('filter') === -1 && actionName.search('clear') === -1) return;
        const colDef = event.detail.columnDefinition;
        const columnName = colDef.fieldName;
        const findIndexByName = (name) => {
            const lowerCaseName = name.toLowerCase();
            return this.columns.findIndex(column =>
                column.fieldName.toLowerCase() === lowerCaseName || column.fieldName.toLowerCase().endsWith(`${lowerCaseName}__c`)
            );
        };
        this.columnIndex = findIndexByName(columnName);
        this.inputLabel = 'Filter for ' + this.columns[this.columnIndex].label;

        switch (actionName) {
			case 'filter':
				this.handleOpenFilterInput();
                break;
			case 'clear':
				const filterColumnName = this.columns[this.columnIndex].fieldName;
                delete this.columnFilterValues[filterColumnName];
                this.handleFilterRecords(actionName);
                this.columns[this.columnIndex].actions = this.columns[this.columnIndex].actions.map(action => {
                    if (action.name === 'clear') {
                        return { ...action, disabled: true };
                    }
                    return action;
                });
			    break;

            default:
		}
    }
   
    handleFilterRecords(actionName) {
        var dataArray = [...this.initialRecords];
        // Apply individual column filters
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.mapFilterData[filterColumnName] = this.filterAppliedValue;
        this.columns.forEach(column => {
            var filterValue = this.columnFilterValues[column.fieldName];
            if(filterValue){
                dataArray = dataArray.filter(row => {
                    var recName;
                    if(column.type == 'customName'){
                        recName = row[column.typeAttributes.fieldapiname] ? row[column.typeAttributes.fieldapiname] : '';
                    } else {
                        recName = row[column.fieldName];
                    }
                    const regex = new RegExp(filterValue, 'i');
                    if(regex.test(recName)){
                        return true;
                    }
                    return false;
                });
            }
        });
        this.columns[this.columnIndex].actions = this.columns[this.columnIndex].actions.map(action => {
            if (action.name === 'clear') {
                return { ...action, disabled: false };
            }
            return action;
        });
        this.columns = [...this.columns];
        this.data = dataArray; 
        this.closeFilterModal();
        if(this.template.querySelector('.products')){
            if(actionName === 'clear'){
                this.addCustomStyle('span','#f3f3f3');
                this.addCustomStyle('span a.slds-th__action','#f3f3f3');
                this.addCustomStyle('.slds-has-focus.slds-is-resizable .slds-th__action','#f3f3f3');
            } else {
                this.addCustomStyle('span','#a0cfa0');
                this.addCustomStyle('span a.slds-th__action','#a0cfa0');
                this.addCustomStyle('.slds-has-focus.slds-is-resizable .slds-th__action','#a0cfa0');
                this.addCustomStyle('.slds-dropdown__item','transparent');
                this.addCustomStyle('.slds-dropdown__item span','transparent');
                this.addCustomStyle('span a.slds-th__action:focus:hover','#a0cfa0');
            }
        }
    }

    handleChange(event){
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.columnFilterValues[filterColumnName] = event.target.value;
        this.filterAppliedValue = event.target.value;
    }

    addCustomStyle(selector, backgroundColor) {
        let style = document.createElement('style');
        style.innerText = '.products .slds-table thead th:nth-child(' + (this.columnIndex + 2) + ') ' + selector + ' { background-color: ' + backgroundColor + ';}';
        this.template.querySelector('.products').appendChild(style);
    }

    renderedCallback() {
        let style = document.createElement('style');
        style.innerText = '.products lightning-button-icon .slds-button_icon svg {width: 1rem;height: 1rem;}';
        this.template.querySelector('.products').appendChild(style);
    }
}