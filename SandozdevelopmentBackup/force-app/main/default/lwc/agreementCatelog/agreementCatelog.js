import { LightningElement,track,wire,api } from 'lwc';
import getPricingRecords from '@salesforce/apex/AgreementController.getAgreementCatalog';
import getColumns from '@salesforce/apex/AgreementController.getColumns';

export default class AgreementCatelog extends LightningElement {

    @track data=[];
    @track initialrecords=[];
    @track rowSelectedProds=[];
    @track columns;
    @track dataLoading=false;
    @track sortDirection = 'asc';
    @track isOpenFilterInput = false;
    @track filterAppliedValue = '';
    @track preSelectedRowValues;
    @api preSelectedRows;
    mapFilterData = new Map();
    columnFilterValues = new Map();
    @api recId;
    @track searchKey='';
    @api fields;

    connectedCallback() {
       this.loadCatelogData();
    }
    
    @wire(getColumns, { columnData: 'Agreement_Catelog_Selection' })
    wiredColumns({data, error}){
        if (data) {
            this.columns = JSON.parse(data.Column_JSON__c);
        } else if (error) {
            console.log(error);
        }
    }

    loadCatelogData() {
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
         console.log('loadMoreData'+this.filterAppliedValue);
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
            console.log(this.initialRecords+'initail');
            if(this.initialRecords.length>20){
                 console.log(this.initialRecords.length>20+'this.initialRecords.length>20');
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
                 console.log(updatedata+'updatedata');
                 console.log(this.initialRecords+'initailif');
            } else {
                  console.log(this.initialRecords+'initailelse');
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

    handleRowSelection(event){
        this.rowSelectedProds = event.detail.selectedRows;
        this.preSelectedRows =  event.detail.selectedRows.map( (item) => item.recordId );
        let selectedrowsdata ={selectedrows : this.rowSelectedProds , preselected :this.preSelectedRows}
       const selectFastOrder = new CustomEvent("getagreementcatelogprods",{
                detail:selectedrowsdata, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);
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
          console.log(this.searchKey+'this.searchKey');
         console.log(JSON.stringify(dataArray)+'dataArray');
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
      
      console.log(JSON.stringify(dataArray)+'dataArrayafter');
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
}