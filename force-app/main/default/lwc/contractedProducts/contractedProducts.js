import { LightningElement, wire, track,api } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getContractedRecords from '@salesforce/apex/ProductController.getContractedRecords';
import contractedProductsAddToCart from '@salesforce/apex/OrderRequestAddToCart.contractedProductsAddToCart';

export default class ContractedProducts extends LightningElement {
    @track columns;
    @track sortBy;
    @track sortDirection = 'asc';
    @track initialRecords;
    @track dataLoading=false;
    @track isOpenFilterInput = false;
    @track filterValue = '';
    @track data;
    @track filterAppliedValue = '';
    @api recId;
    componentLoaded = false;
    mapFilterData = new Map();
    columnFilterValues = new Map();

    @wire(getColumns, { columnData: 'Contracted_Products_Table' }) wiredColumns({data, error}){
        if (data) {
            this.columns = JSON.parse(data.Column_JSON__c);
        } else if (error) {
            console.log(error);
        }
    }

    connectedCallback() {
        this.loadContractedData();
    }

    loadContractedData(){
        this.dataLoading=true;
        getContractedRecords({ recId : this.recId})
        .then(result => {
            console.log(result);
            this.data = result;
            this.initialRecords = this.data;
            this.dataLoading=false;
        })
        .catch(error => {
            this.error = error;
        })
    }

    handleAddToCart(){
        var selectedRecords =  this.template.querySelector("c-custom-type-datatable").getSelectedRows();
        contractedProductsAddToCart({ recId : this.recId,scopeObjectLst: JSON.stringify(selectedRecords)})
        .then(result => {
            console.log(result);
            const selectedEvent = new CustomEvent('addedtocart', {
                bubbles: true, composed: true
            });
            this.dispatchEvent(selectedEvent);
        })
        .catch(error => {
            this.error = error;
        })
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
        const fieldNameWithC = this.columns[this.columnIndex].label;
        this.inputLabel = 'Filter for ' + this.columns[this.columnIndex].label;

        switch (actionName) {
			case 'filter':
				this.handleOpenFilterInput();
                break;
			case 'clear':
				const filterColumnName = this.columns[this.columnIndex].fieldName;
                delete this.columnFilterValues[filterColumnName];
                //this.columns = [...this.columns];
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
            console.log('ouside if---'+filterValue);
            if(filterValue){
                console.log('inside if---'+filterValue);
                dataArray = dataArray.filter(row => {
                    var recName;
                    if(column.type == 'customName'){
                        recName = row[column.typeAttributes.fieldapiname] && row[column.typeAttributes.fieldapiname][column.typeAttributes.fieldLookupName] ? row[column.typeAttributes.fieldapiname][column.typeAttributes.fieldLookupName] : '';
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
        if(this.template.querySelector('.contractedproducts')){
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

    addCustomStyle(selector, backgroundColor) {
        let style = document.createElement('style');
        style.innerText = '.contractedproducts .slds-table thead th:nth-child(' + (this.columnIndex + 3) + ') ' + selector + ' { background-color: ' + backgroundColor + ';}';
        this.template.querySelector('.contractedproducts').appendChild(style);
    }

    handleChange(event){
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.columnFilterValues[filterColumnName] = event.target.value;
        this.filterAppliedValue = event.target.value;
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

    renderedCallback(){
        if(this.template.querySelector('.contractedproducts')){
            if(!this.componentLoaded){
                const style1 = document.createElement('style');
                style1.innerText = '.contractedproducts .dt-outer-container .slds-table_header-fixed_container {background-color : white}';
                this.template.querySelector('.contractedproducts').appendChild(style1);
                let style5 = document.createElement('style');
                style5.innerText = '.slds-table_header-fixed_container .slds-scrollable_y {height: 20.5rem}';
                this.template.querySelector('.contractedproducts').appendChild(style5);
                this.componentLoaded = true;
            }
        }
    }
}