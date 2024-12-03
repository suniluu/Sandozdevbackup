import { LightningElement, track, wire, api } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getReorderRecords from '@salesforce/apex/ProductController.getReorderRecords';
import getLineItemRelations from '@salesforce/apex/ProductController.getSettingsinfo';

export default class Reorder extends LightningElement {
    @track data = [];
    @track columns;
    @track liClass = 'slds-vertical-tabs__nav-item';
    @track sortBy;
    @track sortDirection = 'asc';
    @track initialRecords;
    @track tabs;
    @track orderName='';
    @track dataLoading=false;
    @track isOpenFilterInput = false;
    @track filterValue = '';
    @track filterAppliedValue = '';
    @track preSelectedRows = [];
    @track mapPreSelectedRows = new Map();

    @api recId;

    componentLoaded = false;
    initialData;
    tableData = [];
    selectedOrder = [];
    lineItems;
    
    columnFilterValues = new Map();
    mapFilterData = new Map();
    mapReorderData = new Map();

    @wire(getLineItemRelations, { fieldLabel: 'Line_Items_Relation' }) wiredLineItemRelations(result){
        if (result.data) {
            this.lineItems = result.data;
            this.loadReOrderData();
        } else if (result.error) {
            console.log(result.error);
        }
    }

    @wire(getColumns, { columnData: 'Reorder_Table' }) wiredColumns({data, error}){
       if (data) {
            this.columns = JSON.parse(data.Column_JSON__c);
         } else if (error) {
            console.log(error);
        }
    }

    loadReOrderData(){
        this.dataLoading=true;
        getReorderRecords({ recId : this.recId})
        .then(result => {
            var dataRows = [];
            result.forEach(row => {
                let rowData = new Object();
                rowData = {...row}
                rowData.liClass = 'slds-vertical-tabs__nav-item';
                if(!this.initialData){
                    this.initialData = row.Id;
                    this.orderName = row.Name;
                    rowData.liClass = 'slds-vertical-tabs__nav-item slds-is-active';
                }
                this.mapReorderData[row.Id] = row;
                dataRows.push(rowData);
            });
            this.tabs = dataRows;
            if(this.mapReorderData[this.initialData][this.lineItems]){
                this.tableData = this.mapReorderData[this.initialData][this.lineItems];
            }
            this.initialRecords = this.tableData;
            this.dataLoading=false;
        })
        .catch(error => {
            this.error = error;
        })
    }

    handleRowSelection(event){
        this.reorderprod = event.detail.selectedRows;
        var selectedArray = [];
         if(event.detail.selectedRows){
            var selectedArray = [];
            if(event.detail.selectedRows.length > 0){
                if(!this.selectedOrder.includes(this.initialData)){
                    this.selectedOrder.push(this.initialData);
                }
            } else {
                const indexOfObject = this.selectedOrder.findIndex(recId => {
                    return recId === this.initialData;
                });
                this.selectedOrder.splice(indexOfObject, 1);
            }
            for(var i = 0; i < event.detail.selectedRows.length; i++){
                selectedArray.push(event.detail.selectedRows[i].Id);
            }
            this.mapPreSelectedRows[this.initialData] = selectedArray;
        }
        let selectedData = {selectedRecord: event.detail.selectedRows,selectedId:this.initialData};
        const selectFastOrder = new CustomEvent("getreorderproduct",{
            detail:selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);
    }

    handleClick(event) {
        this.tabs = this.tabs.map(tab => {
            if(tab.Id === event.target.dataset.link) {
                tab.cssClass = 'slds-p-around_x-small slds-tabs_default__content slds-show';
                tab.liClass = 'slds-vertical-tabs__nav-item slds-is-active';
            } else {
                tab.cssClass = 'slds-p-around_x-small slds-tabs_default__content slds-hide';
                tab.liClass = 'slds-vertical-tabs__nav-item';
            }
            return tab;
        });
        this.orderName = event.target.textContent.trim();
        this.initialData = event.target.dataset.link;
        this.preSelectedRows = this.mapPreSelectedRows[this.initialData] ? this.mapPreSelectedRows[this.initialData] : [];
        this.tableData = [];
        this.template.querySelector("c-custom-type-datatable").selectedRows = [];
        if(this.mapReorderData[event.target.dataset.link][this.lineItems]){
            this.tableData = this.mapReorderData[event.target.dataset.link][this.lineItems];
        }
        this.initialRecords = this.tableData;
    }
    
    renderedCallback() {
        this.componentLoaded = true;
        if(this.template.querySelector('.reordertable')){
            if(this.componentLoaded){
                this.applyCustomStyle('.reordertable','.reordertable .dt-outer-container .slds-table_header-fixed_container {background-color : white}');
                this.applyCustomStyle('.reordertable','.dt-outer-container .slds-table_header-fixed_container .slds-scrollable_y {height: 20.5rem}');
            }
        }
    }

    applyCustomStyle(selector, innerText){
        if(this.template.querySelector(selector)){
            let style = document.createElement('style');
            style.innerText = innerText;
            this.template.querySelector(selector).appendChild(style);
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
            if(filterValue){
                dataArray = dataArray.filter(row => {
                    var recName = row[column.fieldName];
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
        this.tableData = dataArray; 
        this.closeFilterModal();
        if(this.template.querySelector('.reordertable')){
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
        style.innerText = '.reordertable .slds-table thead th:nth-child(' + (this.columnIndex + 2) + ') ' + selector + ' { background-color: ' + backgroundColor + ';}';
        this.template.querySelector('.reordertable').appendChild(style);
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
}