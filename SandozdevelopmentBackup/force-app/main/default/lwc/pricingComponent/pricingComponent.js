import { LightningElement,track,wire,api } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getPricingRecords from '@salesforce/apex/ProductController.getPricingRecords';

export default class PricingComponent extends LightningElement {
    @track columns;
    @track sortBy;
    @track sortDirection = 'asc';
    @track initialRecords;
    @track dataLoading=false;
    @track isOpenFilterInput = false;
    @track filterAppliedValue = '';
    @track data;

    @api recId;
    @api fields;
    @api preSelectedRows;
    
    @track searchKey='';

    pricingCompare =[];
    componentLoaded = false;
    mapFilterData = new Map();
    columnFilterValues = new Map();

    @wire(getColumns, { columnData: 'Pricing_Table' }) wiredColumns({data, error}){
        if (data) {
            this.columns = JSON.parse(data.Column_JSON__c);
        } else if (error) {
            console.log(error);
        }
    }

    connectedCallback() {
        this.loadPricingData();
    }

    loadPricingData() {
        this.dataLoading = true;
        getPricingRecords({ recId: this.recId, fieldsData: JSON.stringify(this.fields) })
        .then(result => {
            this.initialRecords = result;
            if(result.length>50){
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
                target.enableInfiniteLoading=false;
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
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }

    handleRowSelection(event){
        this.pricingCompare = event.detail.selectedRows;
        this.preSelectedRows =  event.detail.selectedRows.map(
                (item) => item.Id
        );
        let selectedData = {selectedRecord: this.pricingCompare, preselected :this.preSelectedRows};
        const selectFastOrder = new CustomEvent("getpricingcompareproduct",{
            detail:selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);    
    }

    handleSearch(event){
        const searchKey = event.target.value.toLowerCase();
        this.searchKey=searchKey;
        if (searchKey.length>=3) {
            this.data = this.initialRecords;
            if (this.data) {
                let searchRecords = [];
                for (let record of this.data) {
                    let valuesArray = Object.values(record);
                    for (let val of valuesArray) {
                        let strVal = String(val);
                        if (strVal) {
                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }
                  this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        searchRecords = searchRecords.filter((row) => {
          var recName;
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, "i");
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
      }
    });
                this.data = searchRecords;
            }
        } else {
            if(this.initialRecords.length>20){
                  let updatedata=this.initialRecords;
                    this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        updatedata = updatedata.filter((row) => {
          var recName;
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, "i");
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
      }
    });
    
                this.data = updatedata.slice(0, 20);
            } else {
                let updatedata=this.initialRecords;
                    this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        updatedata = updatedata.filter((row) => {
          var recName;
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, "i");
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
      }
    });
                this.data = updatedata;
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
           if (this.searchKey.length>=3) {
      if (dataArray) {
        let searchRecords = [];
        for (let record of dataArray) {
          let valuesArray = Object.values(record);
          for (let val of valuesArray) {
            let strVal = String(val);
            if (strVal) {
              if (strVal.toLowerCase().includes(this.searchKey)) {
                searchRecords.push(record);
                break;
              }
            }
          }
        }
        dataArray = searchRecords;
      }
    }
        this.columns = [...this.columns];
        this.data = dataArray; 
        this.closeFilterModal();
        if(this.template.querySelector('.pricing')){
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
        style.innerText = '.pricing .slds-table thead th:nth-child(' + (this.columnIndex + 2) + ') ' + selector + ' { background-color: ' + backgroundColor + ';}';
        this.template.querySelector('.pricing').appendChild(style);
    }

    handleChange(event){
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.columnFilterValues[filterColumnName] = event.target.value;
        this.filterAppliedValue = event.target.value;
    }

    renderedCallback(){
        if(this.template.querySelector('.pricing')){
            if(!this.componentLoaded){
                const style1 = document.createElement('style');
                style1.innerText = '.pricing .dt-outer-container .slds-table_header-fixed_container {background-color : white}';
                this.template.querySelector('.pricing').appendChild(style1);
                this.componentLoaded = true;
            }
        }
    }
}