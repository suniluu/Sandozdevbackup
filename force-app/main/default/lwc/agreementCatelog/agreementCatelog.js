import { LightningElement, track, wire, api } from 'lwc';
import getPricingRecords from '@salesforce/apex/AgreementController.getAgreementCatalog';
import getColumns from '@salesforce/apex/AgreementController.getColumns';

export default class AgreementCatelog extends LightningElement {

  @track productdata = [];
  @track initialrecords = [];
  @track rowSelectedProds = [];
  @track columns = [];
  @track dataLoading = false;
  @track sortDirection = 'asc';
  @track isOpenFilterInput = false;
  @track filterAppliedValue = '';
  @track preSelectedRowValues = [];
  @api preSelectedRows = [];
  mapFilterData = new Map();
  columnFilterValues = new Map();
  @api recId = '';
  @track searchKey = '';
  @api fields = [];
  @api objectapiname = '';

  connectedCallback() {
    console.log('objApi from catelog callbck :: ' + this.objectapiname);
    console.log('fields from catelog callbck :: ' + JSON.stringify(this.fields));
    this.loadCatelogData();
  }

  @wire(getColumns, { columnData: 'Agreement_Catelog_Selection' })
  wiredColumns({ data, error }) {
    if (data) {
      this.columns = JSON.parse(data.Column_JSON__c);
    } else if (error) {
      console.log(error);
    }
  }

  loadCatelogData() {
    console.log('loadcatelogData');
    this.dataLoading = true;
    getPricingRecords({ recId: this.recId, fieldsData: JSON.stringify(this.fields), objApi: this.objectapiname })
      .then(result => {
        console.log('objApi from catelog 2:: ' + this.objectapiname);
        console.log('catelog result :: ' + JSON.stringify(result));
        console.log(' catelog JSON.stringify(this.fields):: ' + JSON.stringify(this.fields));
        this.initialRecords = result;
        console.log('initialRecords result :: ' + JSON.stringify(this.initialRecords));
        if (result.length > 50) {
          this.productdata = result.slice(0, 50);
        } else {
          this.productdata = result;
        }
        this.dataLoading = false;
      })
      .catch(error => {
        this.error = error;
      })
  }

  loadMoreData(event) {
    console.log('loadMoreData' + this.filterAppliedValue);
    if (this.filterAppliedValue) {

      const { target } = event;
      target.isLoading = true;
      const startIndex = this.productdata.length;
      const remainingRecords = this.initialRecords.length - startIndex;
      if (remainingRecords > 0) {
        const endIndex = Math.min(startIndex + 20, this.initialRecords.length);
        const newData = this.initialRecords.slice(startIndex, endIndex);

        this.productdata = this.productdata.concat(newData);
      } else {
        this.productdata = this.initialRecords;
        target.enableInfiniteLoading = false;
      }
      target.isLoading = false;
    }
    console.log('lastloadMoreData' + this.productdata);
  }

  handleSearch(event) {
    console.log('handleSearch');
    var searchKey = event.target.value.toLowerCase();
    console.log(searchKey + ' serachkey');
    this.searchKey = searchKey;
    this.dataLoading = true;
    if (this.searchKey.length >= 3) {
      let records = [...this.initialRecords];
      if (records) {
        let searchRecords = [];
        for (let record of records) {
          let valuesArray = Object.values(record);
          console.log(JSON.stringify(valuesArray) + ' valuesarray');
          for (let val of valuesArray) {
            console.log(JSON.stringify(val) + ' val');
            let strVal = String(val);

            if (strVal) {
              console.log(strVal + ' strValinside');
              if (strVal.toLowerCase().includes(searchKey)) {
                console.log(strVal.toLowerCase().includes(searchKey) + ' strVal.toLowerCase().includes(searchKey)');
                console.log(JSON.stringify(record) + ' record');
                searchRecords.push(record);
                break;
              }
            }
          }
        }
        if (this.columnFilterValues.length >= 1) {
          console.log('ifif111');
          console.log(this.columnFilterValues.length >= 1 + ' this.columnFilterValues.length>=1');
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
        }
        console.log(JSON.stringify(searchRecords) + ' searchRecords');
        this.productdata = searchRecords;

        console.log(JSON.stringify(this.productdata) + ' this.data 134');
      }
    } else {
      let updatedata = [...this.initialRecords];
      console.log(JSON.stringify(updatedata) + 'updatedata');
      console.log(JSON.stringify(this.initialRecords) + 'initail');
      if (this.columnFilterValues.length >= 1) {
        console.log('elseifif');
        console.log(this.columnFilterValues.length >= 1 + ' this.columnFilterValues.length>=1');
        if (this.initialRecords.length > 20) {
          console.log(this.initialRecords.length > 20 + 'this.initialRecords.length>20');

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

          this.productdata = updatedata.slice(0, 20);
          console.log(updatedata + 'updatedata');
          console.log(this.initialRecords + 'initailif');
        } else {
          console.log(this.initialRecords + 'initailelse');
          let updatedata = this.initialRecords;
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
          this.productdata = updatedata;
        }
      } else {
        this.productdata = [...updatedata];
      }
    }
    console.log(JSON.stringify(this.productdata) + ' lastthis.data');
    this.dataLoading = false;
    this.template.querySelector("c-agreement-custom-data-table").selectedRows = this.preSelectedRows;
    console.log(JSON.stringify(this.preSelectedRows) + ' preSelectedRows.data');
  }

  // handleClear(event){
  //    this.data = this.initialRecords;
  // }

  handleRowSelection(event) {
    // this.rowSelectedProds = event.detail.selectedRows;
    // this.preSelectedRows = event.detail.selectedRows.map((item) => item.recordId);
    // let selectedrowsdata = { selectedrows: this.rowSelectedProds, preselected: this.preSelectedRows };
    // const selectFastOrder = new CustomEvent("getagreementcatelogprods", {
    //   detail: selectedrowsdata, bubbles: true, composed: true
    // });
    // this.dispatchEvent(selectFastOrder);
   
    console.log('hi');
    if (event.detail.config.action != undefined) {
      console.log('hiif');
      let updatedItemsSet = new Set();
      let selectedItemsSet = new Set(this.preSelectedRows);
      let loadedItemsSet = new Set();
      console.log('hiif218' + JSON.stringify(this.productdata));
      this.productdata.map((ele) => {
        loadedItemsSet.add(ele.recordId);
      });
      console.log('hiif222');
      if (event.detail.selectedRows) {
        event.detail.selectedRows.map((ele) => {
          updatedItemsSet.add(ele.recordId);
        });
        updatedItemsSet.forEach((id) => {
          if (!selectedItemsSet.has(id)) {
            selectedItemsSet.add(id);
          }
        });
      }
      console.log('hiif232');

      loadedItemsSet.forEach((id) => {
        if (selectedItemsSet.has(id) && !updatedItemsSet.has(id)) {
          selectedItemsSet.delete(id);
        }
      });
  
      

        this.preSelectedRows = [...selectedItemsSet];
        console.log('selectedItemsSet' + JSON.stringify(selectedItemsSet));
      let selectedids= [...selectedItemsSet];
          console.log('hiif250' + JSON.stringify(this.initialRecords));
      console.log('selectedids' + JSON.stringify(selectedids)); 
  
      this.rowSelectedProds = this.initialRecords.filter((ele) => 
        selectedids.includes(ele.recordId)
      );
      console.log('Catalog rowSelectedProds 256 :: '+JSON.stringify(this.rowSelectedProds));
    
      console.log('Catalog preSelectedRows 254 :: '+JSON.stringify(this.preSelectedRows));
      let selectedrowsdata = { selectedrows: this.rowSelectedProds, preselected: this.preSelectedRows };
      console.log('selectedrowsdata' + JSON.stringify(selectedrowsdata));
      console.log('if');
      const selectFastOrder = new CustomEvent("getagreementcatelogprods", {
        detail: selectedrowsdata, bubbles: true, composed: true
      });
      this.dispatchEvent(selectFastOrder);
      console.log('completed');
    }
     console.log('hi');
    
    // // Check if there is a configuration action
    // if (event.detail.config.action !== undefined) {
    //     console.log('hiif');
        
    //     // Initialize sets
    //     let updatedItemsSet = new Set();
    //     let selectedItemsSet = new Set(this.preSelectedRows || []); // Handle empty preSelectedRows
    //     let loadedItemsSet = new Set();

    //     console.log('hiif218', JSON.stringify(this.productdata));

    //     // Populate loadedItemsSet with all record IDs in product data
    //     this.productdata.forEach((ele) => {
    //         loadedItemsSet.add(ele.recordId);
    //     });

    //     console.log('hiif222');

    //     // Add currently selected rows to updatedItemsSet
    //     if (event.detail.selectedRows) {
    //         event.detail.selectedRows.forEach((ele) => {
    //             updatedItemsSet.add(ele.recordId);
    //         });

    //         // Add new selections to selectedItemsSet
    //         updatedItemsSet.forEach((id) => {
    //             if (!selectedItemsSet.has(id)) {
    //                 selectedItemsSet.add(id);
    //             }
    //         });
    //     }

    //     console.log('hiif232');
    //      console.log('updatedItemsSet :: '+JSON.stringify(updatedItemsSet));
    //       console.log('selectedItemsSet :: '+JSON.stringify(selectedItemsSet));
    //     // Remove deselected rows from selectedItemsSet
    //     loadedItemsSet.forEach((id) => {
    //         if (selectedItemsSet.has(id) && !updatedItemsSet.has(id)) {
    //             selectedItemsSet.delete(id);
    //         }
    //     });

    //     console.log('hiif239', [...selectedItemsSet]);

    //     // Filter the final selected products
    //     this.rowSelectedProds = this.productdata.filter((ele) =>
    //         selectedItemsSet.has(ele.recordId)
    //     );

    //     console.log('Catalog rowSelectedProds 252 :: ', JSON.stringify(this.rowSelectedProds));

    //     // Update preSelectedRows to reflect current selections
    //     this.preSelectedRows = [...selectedItemsSet];

    //     console.log('Catalog preSelectedRows 254 :: ', JSON.stringify(this.preSelectedRows));
        
    //     // Prepare the event data
    //     let selectedrowsdata = {
    //         selectedrows: this.rowSelectedProds,
    //         preselected: this.preSelectedRows,
    //     };

    //     console.log('selectedrowsdata', JSON.stringify(selectedrowsdata));
    //     console.log('if');

    //     // Dispatch the event with updated data
    //     const selectFastOrder = new CustomEvent("getagreementcatelogprods", {
    //         detail: selectedrowsdata,
    //         bubbles: true,
    //         composed: true,
    //     });
    //     this.dispatchEvent(selectFastOrder);
    //     console.log('completed');
    //}
  }

  closeFilterModal() {
    console.log('closeFilterModal');
    this.isOpenFilterInput = false;
    this.filterAppliedValue = '';
  }

  handleOpenFilterInput() {
    console.log('handleOpenFilterInput');
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.filterAppliedValue = this.mapFilterData[filterColumnName];
    this.isOpenFilterInput = true;
  }

  handleHeaderAction(event) {
    console.log('handleHeaderAction');
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
    console.log('handleFilterRecords');
    var dataArray = [...this.initialRecords];
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.mapFilterData[filterColumnName] = this.filterAppliedValue;
    console.log(this.searchKey + 'this.searchKey');
    console.log(JSON.stringify(dataArray) + 'dataArray');
    this.columns.forEach(column => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        dataArray = dataArray.filter(row => {
          var recName;
          if (column.type == 'customName') {
            recName = row[column.typeAttributes.fieldapiname] ? row[column.typeAttributes.fieldapiname] : '';
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, 'i');
          if (regex.test(recName)) {
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
    if (this.searchKey.length >= 3) {
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

    console.log(JSON.stringify(dataArray) + 'dataArrayafter');
    this.productdata = dataArray;
    this.closeFilterModal();
    if (this.template.querySelector('.pricing')) {
      if (actionName === 'clear') {
        this.addCustomStyle('span', '#f3f3f3');
        this.addCustomStyle('span a.slds-th__action', '#f3f3f3');
        this.addCustomStyle('.slds-has-focus.slds-is-resizable .slds-th__action', '#f3f3f3');
      } else {
        this.addCustomStyle('span', '#a0cfa0');
        this.addCustomStyle('span a.slds-th__action', '#a0cfa0');
        this.addCustomStyle('.slds-has-focus.slds-is-resizable .slds-th__action', '#a0cfa0');
        this.addCustomStyle('.slds-dropdown__item', 'transparent');
        this.addCustomStyle('.slds-dropdown__item span', 'transparent');
        this.addCustomStyle('span a.slds-th__action:focus:hover', '#a0cfa0');
      }
    }
  }

  addCustomStyle(selector, backgroundColor) {
    console.log('addCustomStyle');
    let style = document.createElement('style');
    style.innerText = '.pricing .slds-table thead th:nth-child(' + (this.columnIndex + 2) + ') ' + selector + ' { background-color: ' + backgroundColor + ';}';
    this.template.querySelector('.pricing').appendChild(style);
  }

  handleChange(event) {
    console.log('handleChange');
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.columnFilterValues[filterColumnName] = event.target.value;
    this.filterAppliedValue = event.target.value;
  }

  doSorting(event) {
    console.log('doSorting');
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortData(this.sortBy, this.sortDirection);
  }

  sortData(fieldname, direction) {
    console.log('sortData');
    let parseData = JSON.parse(JSON.stringify(this.productdata));
    let keyValue = (a) => {
      return a[fieldname];
    };
    let isReverse = direction === 'asc' ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : '';
      y = keyValue(y) ? keyValue(y) : '';
      return isReverse * ((x > y) - (y > x));
    });
    this.productdata = parseData;
  }
}