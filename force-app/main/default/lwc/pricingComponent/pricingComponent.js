import { LightningElement,track,wire,api } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getPricingRecords from '@salesforce/apex/ProductController.getPricingRecords';

export default class PricingComponent extends LightningElement {
    @track columns;
    @track sortBy;
    @track sortDirection = 'asc';
    @track initialRecords;
    @api loading;
    @track isOpenFilterInput = false;
    @track filterAppliedValue = '';
    @track data;

    @api recId;
    @api fields;
    @api preSelectedRows;
    @api priceListApi;
    @api cerApi;
    @track searchKey='';
    @track filterdata=[];

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
        console.log('selected price list catalog req ::; '+ JSON.stringify(this.fields));
        console.log('priceList'+ JSON.stringify(this.priceListApi));
        console.log('cerApi'+ JSON.stringify(this.cerApi));
        console.log('recIdd catalog req ::; '+ JSON.stringify(this.recId));
    }

    loadPricingData() {
        this.loading = true;
        console.log('selected price list catlog load ::; '+ JSON.stringify(this.fields));
        getPricingRecords({ recId: this.recId, fieldsData: JSON.stringify(this.fields), cerApi: this.cerApi,priceListApi: this.priceListApi})
        .then(result => {
            this.initialRecords = result;
            if(result.length>50){
                this.data = result.slice(0, 50); 
            } else {
                this.data = result;
            }
            this.loading = false;
        })
        .catch(error => {
            this.error = error;
        })
    }
   
    loadMoreData(event) {
            console.log('filetr filterdata :: '+JSON.stringify(this.filterdata));
              console.log('this.filterdata>0'+this.filterdata.length);
         if(this.filterdata.length>0 ){
            console.log('this.filterdata>0'+this.filterdata.length);
             const { target } = event;
            target.isLoading = true;
            const startIndex = this.data.length;
            const remainingRecords = this.filterdata.length - startIndex;

            if (remainingRecords > 0) {
                const endIndex = Math.min(startIndex + 20, this.filterdata.length);
                const newData = this.filterdata.slice(startIndex, endIndex);
                this.data = this.data.concat(newData);
            } else {
                this.data = this.filterdata;
                target.enableInfiniteLoading=false;
            }
            target.isLoading = false;

        } else{
            console.log('this.filterdata else'+this.filterdata.length);
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
        if(event.detail.config.action!=undefined){
    let updatedItemsSet = new Set();
        let selectedItemsSet = new Set(this.preSelectedRows);
        let loadedItemsSet = new Set();

        this.data.map((ele) => {
            loadedItemsSet.add(ele.Id);
        });
      console.log('loadedItemsSet==> ' + JSON.stringify(loadedItemsSet));
        if (event.detail.selectedRows) {
            event.detail.selectedRows.map((ele) => {
                updatedItemsSet.add(ele.Id);
            });
             console.log('updatedItemsSet==> ' + JSON.stringify(updatedItemsSet));
            updatedItemsSet.forEach((id) => {
                if (!selectedItemsSet.has(id)) {
                    selectedItemsSet.add(id);
                }
            });
        }

        loadedItemsSet.forEach((id) => {
            if (selectedItemsSet.has(id) && !updatedItemsSet.has(id)) {
                selectedItemsSet.delete(id);
            }
        });
        console.log('selectedItemsSet==> ' + JSON.stringify(selectedItemsSet));
this.preSelectedRows = [...selectedItemsSet];
        console.log('preSelectedRows==> ' + JSON.stringify(this.preSelectedRows));
        let selectedids=[...selectedItemsSet];
        console.log('selectedids==> ' + JSON.stringify(this.selectedids));
         this.pricingCompare = this.initialRecords.filter((ele) => 
        selectedids.includes(ele.Id)
      );
       console.log('selectedrows==> ' + JSON.stringify(this.pricingCompare));
    }
    
    console.log('preSelectedRows rows :::handlesearch ' + this.preSelectedRows);
     console.log('selectedrows==> ' + JSON.stringify(this.pricingCompare));
        let selectedData = {selectedRecord: this.pricingCompare, preselected :this.preSelectedRows};
        const selectFastOrder = new CustomEvent("getpricingcompareproduct",{
            detail:selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);    
    }
   /* handleRowSelection(event) {
        if (event.detail.config.action) {
            let updatedItemsSet = new Set(event.detail.selectedRows?.map((ele) => ele.Id) || []);
            let selectedItemsSet = new Set(this.preSelectedRows);
            let loadedItemsSet = new Set(this.data.map((ele) => ele.Id));

            // Add newly selected rows
            updatedItemsSet.forEach((id) => selectedItemsSet.add(id));

            // Remove deselected rows
            loadedItemsSet.forEach((id) => {
                if (!updatedItemsSet.has(id)) {
                    selectedItemsSet.delete(id);
                }
            });

            this.preSelectedRows = [...selectedItemsSet];

            // Filter selected records for pricing comparison
            this.pricingCompare = this.initialRecords.filter((ele) =>
                selectedItemsSet.has(ele.Id)
            );

            // Dispatch event with updated data
            const selectedData = {
                selectedRecord: this.pricingCompare,
                preselected: this.preSelectedRows,
            };

            this.dispatchEvent(
                new CustomEvent("getpricingcompareproduct", {
                    detail: selectedData,
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }*/


    handleSearch(event){
        console.log(this.initialRecords.length+'len');
        const searchKey = event.target.value.toLowerCase();
        this.searchKey=searchKey;
            const baseTableEle = this.template.querySelector('c-custom-type-datatable');
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
    if(searchRecords.length>50){
                this.filterdata=searchRecords;
                this.data = searchRecords.slice(0,50);
    }else{
         this.data = searchRecords;
            this.filterdata=searchRecords;
    }
            }
        } else {
            if(this.initialRecords.length>50){
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
     
        console.log(updatedata.length+' updatedatalen');
                      this.filterdata=updatedata;
                       console.log(this.filterdata.length+' filterdatalen');
                this.data = updatedata.slice(0, 50);
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
                  this.filterdata=updatedata;
                this.data = updatedata;
            }
        }
         if (baseTableEle) {
       baseTableEle.enableInfiniteLoading = this.filterdata.length > 50;
         baseTableEle.selectedRows = Array.isArray(this.preSelectedRows) && this.preSelectedRows.length > 0
                ? this.preSelectedRows
                : [];
                console.log('end');
        
//  baseTableEle.selectedRows=this.preSelectedRows.length>0 ? this.preSelectedRows : [];
    }
    //this.template.querySelector("c-custom-type-datatable").selectedRows=this.preSelectedRows.length>0 ? this.preSelectedRows : [];
    }

    closeFilterModal(){
        this.isOpenFilterInput = false;
        this.filterAppliedValue = '';
         const baseTableEle = this.template.querySelector('c-custom-type-datatable');
            if (baseTableEle) {
        baseTableEle.enableInfiniteLoading = this.filterdata.length>50;
      }
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
         const baseTableEle = this.template.querySelector('c-custom-type-datatable');
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
           if (baseTableEle) {
        baseTableEle.enableInfiniteLoading = this.filterdata.length>50;
      }
        this.filterdata=dataArray;
        this.data = dataArray.slice(0, 50); 
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