import { LightningElement, track, wire, api } from 'lwc';
import getPricingRecords from '@salesforce/apex/AgreementController.getAgreementCatalog';
import getColumns from '@salesforce/apex/AgreementController.getColumns';
import getFields from '@salesforce/apex/AgreementController.getFields';
import getSObjectFields from '@salesforce/apex/AgreementController.getSObjectFields';
import objectApi from '@salesforce/apex/AgreementController.objectApiname';
import getPicklistValues from '@salesforce/apex/AgreementController.getPicklistValues';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

//const apiNameObject='Agreement_Line_Item__c';
const objectTYPE = 'REFERENCE';
export default class AgreementCatelog extends LightningElement {

  @track productdata = [];
  @track initialrecords = [];
  @track rowSelectedProds = [];
  @track columns = [];
  @api loading;
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
  @track rowsMap = new Map();
  @track conditionReqMap = new Map();
  @track popup = false;
  @track rowsrecid = '';
  @track conditionalValue = '';
  @track objectName = '';
  @track operatorOptions = [
    { label: 'Equals', value: '=' },
    { label: 'Greater Than', value: '>' },
    { label: 'Less Than', value: '<' },
    { label: 'Not Equals', value: '!=' },
    { label: 'In', value: 'IN' },
  ];
  @track disableicon = true;
  @track agreementFieldOptions = '';
  @track baseOptions = '';
  @track conditionOptions = '';
  @track apiNameObject = '';
  @track rows = [
    { id: 1, field: '', operator: '', value: '', isreferenced: false, objectApiName: '' }
  ];
  @track selectedValues = [];

  get options() {
    return [
      { label: 'New', value: 'new' },
      { label: 'In Progress', value: 'inProgress' },
      { label: 'Finished', value: 'finished' },
    ];
  }
  @track filterdata = [];


  connectedCallback() {
    console.log('objApi from catelog callbck :: ' + this.objectapiname);
    console.log('fields from catelog callbck :: ' + JSON.stringify(this.fields));
    objectApi({})
      .then(result => {
        this.apiNameObject = result;
        console.log(this.apiNameObject + '   this.objectAPIName');

      })
      .catch(error => {
        console.error('Error retrieving fields:', error);

      });
    this.loadCatelogData();
  }
  // @wire(objectApiname)
  // wiredColumns({ data, error }) {
  //    this.apiNameObject=data;
  //      console.log(  this.apiNameObject+'   this.objectAPIName');
  //   if (data) {
  //     this.apiNameObject=data;
  //      console.log(  this.apiNameObject+'   this.objectAPIName');
  //   } else if (error) {
  //     console.log(error);
  //   }
  // }
  @wire(getFields)
  wiredFields({ error, data }) {
    if (data) {
      this.agreementFieldOptions = data.map(field => ({
        label: field.label,
        value: field.fieldName,
        type: field.fieldtype,
        referValue: field.referenceValue
      }));
      console.log(JSON.stringify(this.agreementFieldOptions) + '  this.agreementFieldOptions');
      this.baseOptions = this.conditionOptions = this.agreementFieldOptions.map(option => ({
        ...option,
        label: option.type === objectTYPE ? option.label + ' >' : option.label
      }));
      console.log(JSON.stringify(this.baseOptions) + '  this.baseOptions');

    } else if (error) {
      console.error('Error fetching Agreement Line Item fields:', error);
    }
  }
  @wire(getColumns, { columnData: 'Agreement_Catelog_Selection' })
  wiredColumns({ data, error }) {
    if (data) {
      this.columns = JSON.parse(data.Column_JSON__c);
    } else if (error) {
      console.log(error);
    }
  }





  handlepricing(event) {
    console.log(this.apiNameObject + '   this.objectAPIName');
    console.log(JSON.stringify(event.detail) + ' pricing catelog');
    if (event.detail.index) {
      this.rowsrecid = event.detail.index;
      console.log(this.rowsrecid + ' this.rowsrecid');
      if (this.rowsMap[this.rowsrecid]) {
        this.rows = this.rowsMap[this.rowsrecid];
        console.log('this.rowsMap ' + JSON.stringify(this.rowsMap));
      }
      else {
        this.rows = [{ id: 1, field: '', operator: '', value: '', isreferenced: false, objectApiName: '' }];
      }
      if (this.conditionReqMap[this.rowsrecid]) {
        this.conditionalValue = this.conditionReqMap[this.rowsrecid];

      } else {
        this.conditionalValue = "1";

      }
      this.popup = true;
    }
    console.log(this.popup + ' poup');
  }

  handlechangefield(event) {
    console.log(event.detail + ' handlechangefield');
    console.log(event.target.dataset.id + ' event.target.dataset.id');
    console.log(event.target.dataset.field + ' event.target.dataset.field');
    console.log(event.target.value + ' event.target.value');

    const fieldId = event.target.dataset.id;
    const fieldName = event.target.dataset.field;
    const fieldValue = event.target.value;
    this.updateRowData(fieldId, fieldName, fieldValue);

  }

  closePopup() {
    this.popup = false;
  }

  updatePopup() {
    let emptycheck = false;

    console.log('updatePopup');
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].field == '' || undefined) {
        this.errorEvent("Field is Empty");
        emptycheck = true;
      }
      else if (this.rows[i].operator == '' || undefined) {
        this.errorEvent("Operator is Empty");
        emptycheck = true;
      }
      else if (this.rows[i].value === undefined || this.rows[i].value === null || this.rows[i].value === '') {
        console.log(this.rows[i].value + ' value');
        this.errorEvent("Value is Empty");
        emptycheck = true;
      }
    }
    if (emptycheck == false) {
      this.rowsMap[this.rowsrecid] = this.rows;
      this.conditionReqMap[this.rowsrecid] = this.conditionalValue;
      console.log('this.rowsMap ' + JSON.stringify(this.rowsMap));
      this.productdata = this.productdata.map((data) => {
        console.log('data.recordId: ' + data.recordId);
        console.log('this.rowsrecid: ' + this.rowsrecid);
        console.log('data.recordId == this.rowsrecid: ' + (data.recordId == this.rowsrecid));
        console.log('String(data.recordId).trim() === String(this.rowsrecid).trim(): ' + (String(data.recordId).trim() === String(this.rowsrecid).trim()));

        if (String(data.recordId).trim() === String(this.rowsrecid).trim()) {
          console.log('Matched data: ' + JSON.stringify(data));
          return {
            ...data,
            filterRequirements: this.rows.map((row) => ({
              id: row.id,
              field: row.field,
              operator: row.operator,
              value: row.value,
              selectedValues: row.selectedValues?.map((selected) => selected.value) || []
            })),
            condition: this.conditionalValue
          };
        }
        return { ...data };
      });

      this.initialRecords = this.initialRecords.map((data) => {

        if (String(data.recordId).trim() === String(this.rowsrecid).trim()) {
          return {
            ...data,
            filterRequirements: this.rows.map((row) => ({
              id: row.id,
              field: row.field,
              operator: row.operator,
              value: row.value,
              selectedValues: row.selectedValues?.map((selected) => selected.value) || []
            })),
            condition: this.conditionalValue
          };
        }
        return { ...data };
      });
      console.log('Updated this.rows: ' + JSON.stringify(this.rows));
      console.log('Updated this.productdata: ' + JSON.stringify(this.productdata));
      this.popup = false;

    }
  }
  errorEvent(msg) {
    const event = new ShowToastEvent({
      title: "Error",
      message: msg,
      variant: "error",
      mode: "dismissable"
    });
    this.dispatchEvent(event);

  }

  handleSelectedItems(event) {
    console.log(JSON.stringify(event.detail) + '  event.detail');
    let field = this.conditionOptions.find(option => option.value === event.detail);
    console.log(JSON.stringify(field) + '  this.field');
    if (field.type == objectTYPE) {
      this.objectName = field.referValue;
      console.log(JSON.stringify(this.objectName) + '  this.this.objectName');
      this.callMethod();
    }
  }
  handleSendingOptions(event) {
    if (event.detail != '') {
      //Need To be Change as of selected Value Showing options Of Object Refered..
      //its Just for Sample..
      this.objectName = this.apiNameObject;
      this.conditionOptions = this.baseOptions;
    }
    else {
      this.objectName = this.apiNameObject;
      this.conditionOptions = this.baseOptions;
    }
  }
  callMethod() {
    getSObjectFields({ sObjectApiName: this.objectName })
      .then(result => {
        this.conditionOptions = result.map(field => ({
          label: field.label,
          value: field.fieldName,
          type: field.fieldtype,
          referValue: field.referenceValue,

        }));
        console.log(JSON.stringify(this.conditionOptions) + '  this.conditionOptionscall method');
        this.conditionOptions = this.conditionOptions.map(field => ({
          ...field,
          label: field.type === objectTYPE ? field.label + ' >' : field.label
        }));

        console.log(JSON.stringify(this.conditionOptions) + '  this.conditionOptionscall methos after');
      })
      .catch(error => {
        console.error('Error retrieving fields:', error);
        this.conditionOptions = [];
      });
  }

  handleValueReceived(event) {

    console.log(JSON.stringify(event.detail) + ' event.detail');
    console.log(event.detail + ' handlechangefield');
    console.log(event.target.dataset.id + ' event.target.dataset.id');
    console.log(event.target.dataset.field + ' event.target.dataset.field');
    const fieldId = event.target.dataset.id;
    const fieldName = event.target.dataset.field;
    const fieldValue = event.detail.wholeFieldValue;
    const selectedField = this.agreementFieldOptions.find(field => field.value === fieldValue);

    this.updateRowData(fieldId, fieldName, fieldValue);
    console.log(JSON.stringify(fieldName) + ' fieldName');
    console.log(JSON.stringify(fieldValue) + ' fieldValue');
    console.log(JSON.stringify(selectedField) + ' selectedField');
    if (event.detail.field.type == 'PICKLIST' || event.detail.field.type == 'MULTIPICKLIST' ) {

      console.log(JSON.stringify(this.objectName) + ' this.objectNamecat');
      console.log(JSON.stringify(event.detail.field.value) + '  field.valuecat');
      getPicklistValues({ objectApiName: this.objectName, fieldApiName: event.detail.field.value })

        .then(result => {
          this.rows = this.rows.map(row => {
            if (row.id == fieldId) {
              row.picklist = true;
              row.pickoptions = result;
              row.checkbox = false;
              row.text = false;
              row.lookup = false;
              row.multiSelect = false;
            }
            return row;
          });
          console.log(JSON.stringify(result) + ' result');


        })
        .catch(error => {
          console.error('getPicklistValues ', error);

        });
    } else if (event.detail.field.type == 'BOOLEAN') {
      this.rows = this.rows.map(row => {
        if (row.id == fieldId) {
          row.checkbox = true;
          row.value = row.value == true ? true : false;
          row.text = false;
          row.lookup = false;
          row.picklist = false;
          row.multiSelect = false;

        }
        return row;
      });
    }
    else if (event.detail.field.type == 'ID') {
      this.rows = this.rows.map(row => {
        if (row.id == fieldId) {
          row.lookup = true;
          row.text = false;
          row.checkbox = false;
          row.picklist = false;
          row.multiSelect = false;
        }
        return row;
      });
      console.log(JSON.stringify(this.rows) + 'ID rows');
    }
    // else if(event.detail.field.type=='multiSelect'){
    //      this.rows = this.rows.map(row => {
    //               if (row.id == fieldId) {
    //                 row.lookup = false;
    //                 row.text = false;
    //                 row.checkbox = false;  
    //                 row.picklist = true; 
    //                 row.multiSelect=true;              
    //               }
    //               return row;
    //           });
    //            console.log(JSON.stringify(this.rows)+'ID rows'); 
    // }
    else {
      this.rows = this.rows.map(row => {
        if (row.id == fieldId) {
          row.text = true;
          row.checkbox = false;
          row.lookup = false;
          row.picklist = false;
          row.multiSelect = false;
        }
        return row;
      });
      console.log(JSON.stringify(this.rows) + 'else rows');
    }

    if (selectedField && selectedField.type == objectTYPE) {
      this.rows = this.rows.map(row => {
        if (row.id == fieldId) {
          row.isreferenced = true;
          row.objectApiName = this.objectName;
        }
        return row;
      });
    }
    else if (this.objectName == this.apiNameObject) {
      this.rows = this.rows.map(row => {
        if (row.id == fieldId) {
          row.isreferenced = false;
        }
        return row;
      });

    }
    console.log(JSON.stringify(this.rows) + ' rows');
  }



  handleOperatorChange(event) {
    const fieldId = event.target.dataset.id;
    const fieldName = event.target.dataset.field;
    const fieldValue = event.target.value;
    console.log(event.detail + ' handlechangefield');
    console.log(event.target.dataset.id + ' event.target.dataset.id');
    console.log(event.target.dataset.field + ' event.target.dataset.field');
    console.log(event.target.value + ' event.target.value');
    // this.rows = this.rows.map(row => {
    //     if (row.id == fieldId && fieldValue=='IN' ) {

    //       row.multiSelect=true;  
    //       row.selectedValues='';               
    //     }
    //     return row;
    // });
    console.log(JSON.stringify(this.rows) + ' this.rows');
    this.updateRowData(fieldId, fieldName, fieldValue);
  }


  handleValueChange(event) {
    const fieldId = event.target.dataset.id;
    const fieldName = event.target.dataset.field;
    const fieldValue = event.target.value ? event.target.value : event.detail.checked == true || event.detail.checked == false ? event.detail.checked : event.detail.recordId ? event.detail.recordId : '';

    console.log(JSON.stringify(fieldValue) + ' fieldValue');
    console.log(JSON.stringify(event.detail.recordId) + ' eventdetail.recordId');
    console.log(JSON.stringify(event.detail.checked) + ' eventdetail.checked');
    console.log(JSON.stringify(fieldValue) + ' fieldValue.value');
    console.log(JSON.stringify(event.target.dataset.id) + ' event.target.id');
    console.log(JSON.stringify(event.target.dataset.field) + ' event.target.field');
    console.log(JSON.stringify(event.target.dataset.type) + ' event.target.type');
    console.log(JSON.stringify(event.target.value) + ' event.target.value');

    this.updateRowData(fieldId, fieldName, fieldValue);
  }

  updateRowData(fieldId, fieldName, fieldValue) {
    this.rows = this.rows.map(row => {
      console.log(JSON.stringify(row) + ' row');
      console.log(fieldValue + ' fieldValue');
      if (row.id == fieldId) {
        if (row.multiSelect == true && fieldName == 'value') {
          let previousvalues = row.selectedValues.length > 0 ? row.selectedValues : [];
       let previousvalue = row.selectedValues.map(field => field.value);

           console.log(JSON.stringify(previousvalue) + ' previousvalue');
          let values = [];
          console.log(!previousvalue.includes(fieldValue)+ ' !previousvalues.includes(fieldValue)');
          row.selectedValues = [];
          if(!previousvalue.includes(fieldValue)){
          values.push(fieldValue);
          }
          values = values.length > 0 ? values.map(field => ({
            label: field,
            value: field

          })) : [];
          row.selectedValues = previousvalues.length > 0 ? previousvalues.concat(values) : values;
          console.log(JSON.stringify(values) + ' after values');
          row[fieldName] = fieldValue;
        }

        else if (row.operator != 'IN' && fieldValue == 'IN' && fieldName == 'operator' && row.picklist == true) {
          console.log(JSON.stringify(row) + ' row');
          row.multiSelect = true;
          row.selectedValues = [];
          let values = [];

          if (row.value != null && row.value != '') {
            values.push(row.value);
          }
          console.log(JSON.stringify(row) + ' row');

          values = values.length > 0 ? values.map(field => ({
            label: field,
            value: field

          })) : [];
          row.selectedValues = values.length > 0 ? values : [];
          row.value = row.value != null ? row.value : '';
          console.log(JSON.stringify(values) + ' after values');
          row[fieldName] = fieldValue;


        }
        else if (row.operator == 'IN' && fieldValue != 'IN' && fieldName == 'operator') {
          row.multiSelect = false;
          row.selectedValues = [];
          row.value = row.value != null ? row.value : '';
          row[fieldName] = fieldValue;
        }
        else if (row.field != fieldValue && fieldName == 'field') {
          row.multiSelect = false;
          row.selectedValues = [];
          row.value = '';
          row.text = false;
          row.checkbox = false;
          row.lookup = false;
          row.picklist = false;
          row[fieldName] = fieldValue;
        }
        else {
          return { ...row, [fieldName]: fieldValue };
        }
      }
      return row;
    });
    console.log(JSON.stringify(this.rows) + ' Rows');
    this.disableicon = this.rows.length > 1 ? false : true;
  }
  handleRemove(event) {
    const fieldId = event.target.dataset.id;
    const fieldName = event.target.dataset.field;
    console.log(JSON.stringify(event.detail) + ' handlechangefield');
    console.log(event.target.dataset.id + ' event.target.dataset.id');
    console.log(event.target.dataset.field + ' event.target.dataset.field');
    console.log(event.target.value + ' event.target.value');
    console.log(event.detail.value + ' event.target.value');
    console.log(event.detail.name + ' event.target.name');

    this.rows.forEach(item => {
      if (item.id == fieldId) {
        item.selectedValues = item.selectedValues.filter(value => value.value != fieldName);
        console.log(item.selectedValues + ' item.sval');
        console.log(item.selectedValues.length + ' item.length');
        // console.log(item.selectedValues[0].va+' item[0]');
        item.value = item.selectedValues.length == 1 ? item.selectedValues[0].value : item.selectedValues.length == 0 ? '' : item.value;

      }
    });

  }
  addRow(event) {
    const rowId = event.target.dataset.id;

    let lastRow = this.rows[this.rows.length - 1];
    if (lastRow) {
      if (this.rows.some(row => row.id === parseInt(rowId))) {
        const newRow = { id: this.rows.length + 1, field: '', operator: '', value: '', isreferenced: false, objectApiName: '', picklist: false };
        this.rows = [...this.rows, newRow];
      }
    }
    this.disableicon = this.rows.length > 1 ? false : true;
    this.conditionalValue = Array.from({ length: this.rows.length }, (_, i) => i + 1).join(' AND ');
  }

  removeRow(event) {
    const rowId = event.target.dataset.id;
    if (this.rows.length > 1) {
      this.rows = this.rows.filter(row => row.id != rowId);
    }
    this.conditionalValue = Array.from({ length: this.rows.length }, (_, i) => i + 1).join(' AND ');
    this.disableicon = this.rows.length > 1 ? false : true;
  }

  handleConditionalRequirmnt(event) {
    this.conditionalValue = event.target.value;
  }


  loadCatelogData() {
    console.log('loadcatelogData');
    this.loading = true;
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
        this.loading = false;
      })
      .catch(error => {
        this.error = error;
      })
  }

  loadMoreData(event) {
    console.log('loadMoreData' + this.filterAppliedValue);
    if (this.filterdata.length > 0) {

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
    } else {
      console.log('this.filterdata else' + this.filterdata.length);
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
    console.log('handleSearch initiated');
    const searchKey = event.target.value.toLowerCase();
    this.searchKey = searchKey;
    this.loading = true;


    const baseTableEle = this.template.querySelector('c-agreement-custom-data-table');


    let records = [...this.initialRecords];
    let filteredRecords = records;


    if (searchKey.length >= 3) {
      console.log('Applying search filter with key:', searchKey);
      filteredRecords = records.filter(record => {
        return Object.values(record).some(value => {
          const strVal = String(value || "").toLowerCase();
          return strVal.includes(searchKey);
        });
      });
    }


    if (this.columnFilterValues) {
      console.log('Applying column filters');
      this.columns.forEach(column => {
        const filterValue = this.columnFilterValues[column.fieldName];
        if (filterValue) {
          const regex = new RegExp(filterValue, "i");
          filteredRecords = filteredRecords.filter(row => {
            const recName = column.type === "customName"
              ? row[column.typeAttributes.fieldapiname] || ""
              : row[column.fieldName];
            return regex.test(recName);
          });
        }
      });
    }

    console.log('Filtered records:', filteredRecords.length);
    this.filterdata = filteredRecords;
    this.productdata = filteredRecords.slice(0, 50);

    if (baseTableEle) {
      baseTableEle.enableInfiniteLoading = this.filterdata.length > 50;

      baseTableEle.selectedRows = this.preSelectedRows.length > 0 ? this.preSelectedRows : [];
    }

    console.log('Pre-selected rows:', JSON.stringify(this.preSelectedRows));


    this.loading = false;
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
      console.log('preSelectedRows' + JSON.stringify(this.preSelectedRows));

      this.productdata.map((ele) => {
        loadedItemsSet.add(ele.recordId);
      });
      console.log('loadedItemsSet' + JSON.stringify(loadedItemsSet));
      if (event.detail.selectedRows) {
        event.detail.selectedRows.map((ele) => {
          updatedItemsSet.add(ele.recordId);
        });
        console.log('updatedItemsSet' + JSON.stringify(updatedItemsSet));
        updatedItemsSet.forEach((id) => {
          if (!selectedItemsSet.has(id)) {
            selectedItemsSet.add(id);
          }
        });
      }
      console.log('selectedItemsSet' + JSON.stringify(selectedItemsSet));

      loadedItemsSet.forEach((id) => {
        if (selectedItemsSet.has(id) && !updatedItemsSet.has(id)) {
          selectedItemsSet.delete(id);
        }
      });

      console.log('selectedItemsSet' + JSON.stringify(selectedItemsSet));

      this.preSelectedRows = [...selectedItemsSet];
      console.log('selectedItemsSet' + JSON.stringify(selectedItemsSet));
      let selectedids = [...selectedItemsSet];
      console.log('hiif250' + JSON.stringify(this.initialRecords));
      console.log('selectedids' + JSON.stringify(selectedids));

      this.rowSelectedProds = this.initialRecords.filter((ele) =>
        selectedids.includes(ele.recordId)
      );
      console.log('Catalog rowSelectedProds 256 :: ' + JSON.stringify(this.rowSelectedProds));

      console.log('Catalog preSelectedRows 254 :: ' + JSON.stringify(this.preSelectedRows));
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
    const baseTableEle = this.template.querySelector('c-agreement-custom-data-table');
    if (baseTableEle) {
      baseTableEle.enableInfiniteLoading = this.filterdata.length > 50;
    }
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
    const baseTableEle = this.template.querySelector('c-agreement-custom-data-table');
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
    this.filterdata = dataArray;
    this.productdata = dataArray.slice(0, 50);
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
    if (baseTableEle) {
      baseTableEle.enableInfiniteLoading = this.filterdata.length > 50;
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