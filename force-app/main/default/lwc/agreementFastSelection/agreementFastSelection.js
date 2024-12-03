import { LightningElement,track,wire,api } from 'lwc';
import getColumns from '@salesforce/apex/AgreementController.getColumns';
import getAgreementFamilyProds from '@salesforce/apex/AgreementController.getAgreementFamilyProds';
import getPricingRecords from '@salesforce/apex/AgreementController.getAgreementFastRecords';
import saveFile from '@salesforce/apex/AgreementController.saveFile';
import {getObjectInfo,getPicklistValues } from 'lightning/uiObjectInfoApi';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import prodfamily from '@salesforce/schema/Product2.Family';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class AgreementFastSelection extends LightningElement {

    @track columns;
    @track data=[];
    @track initialrecords=[];
    @track rowSelectedProds=[];
    @track sortDirection = 'asc';
    @track dataLoading=false;
    @track isOpenFilterInput = false;
    @track isModalOpen = false;
    @track isDisabled = false;
    @track filterAppliedValue = '';
    @track numRows = 1;
    @track rowIndex = 1;
    @track selectedValue;

    @api recId;
    @api fields;
    @api fieldDataWithLabels;
    @api options = [
        { label: 'Product Name', value: 'Product Name' },
        { label: 'Product Family', value: 'Product Family' }
    ];
    @api options1 =[];
    @api preFastSelectedRows;
    @api objectapiname;

    filesUploaded = [];
    fileName;
    fileContents;
    fileReader;
    fileloaded = false;

    mapFilterData = new Map();
    columnFilterValues = new Map();
    
    connectedCallback() {
        console.log('Field data in agreement fast slection '+JSON.stringify(this.fields));
         console.log('Field data fast slection@api objectapiname; '+this.objectapiname);
         console.log('fieldDataWithLabels agreement fast slection '+JSON.stringify(this.fieldDataWithLabels));
        this.loadCatelogData();
    }
    
    @wire(getColumns, { columnData: 'Agreement_Fast_Selection' })
    wiredColumns({data, error}){
        if (data) {
            this.columns = JSON.parse(data.Column_JSON__c);
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId',fieldApiName: prodfamily})
    ProductFieldInfo({ data, error }) {   
        if (data) {
            this.options1 = data.values.map(picklistValue => ({
                label: picklistValue.label,
                value: picklistValue.value
            }));
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }   
    }

    loadCatelogData() {
        this.dataLoading = true;
        const productId ='';
        getPricingRecords({ recId: this.recId,productId: productId,fieldsData : JSON.stringify(this.fieldDataWithLabels),objApi : this.objectapiname})
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

    handledropdownfamilyselected(event){
        const {selectedRecord, rowId} = event.detail;
        var dataArray = [];
        for(let i=0; i < this.data.length; i++){
            var obj = {...this.data[i]};
            if(obj.recordId == rowId){
                obj.productFamily = selectedRecord;
            }
            dataArray.push(obj);
        }
        this.data = dataArray;
    }

    handledropdownselected(event){
        const {selectedRecord, rowId} = event.detail;
        this.selectedValue =selectedRecord;
        if(this.selectedValue == 'Product Family'){
            getAgreementFamilyProds({ selectedvalue :'Product Family'})
            .then(result => {
                console.log(result);
                var dataArray = [];
                for(let i=0; i < this.data.length; i++){
                    var obj = {...this.data[i]};
                    if(obj.recordId == rowId && result){
                        obj.productType = selectedRecord;
                        obj.productId = result.productId;
                        obj.productName = result.productName;
                        obj.productCode = result.productCode;
                        obj.dropdownoptions = this.options1;
                        obj.productFamily = '';
                        obj.isFamily =true;
                        obj.listPrice = result.listPrice;
                        obj.isDisabled = false;
                        obj.hasValue = true;
                    }
                    dataArray.push(obj);
                }
                this.data = dataArray;
            })
            .catch(error => {
                this.error = error;
            })
        } else {
            var dataArray = [];
            for(let i=0; i < this.data.length; i++){
                var obj = {...this.data[i]};
                if(obj.recordId == rowId){
                    obj.isDisabled = true;
                    obj.productId = '';
                    obj.productName = '';
                    obj.dropdownoptions = [];
                    obj.productFamily = '';
                    obj.isFamily = false;
                }
                dataArray.push(obj);
            }
            this.data = dataArray;
        }
        
    }

    handleproductchanged(event){
        const {productId, rowId} = event.detail;
        if(productId){    
            getPricingRecords({ recId: this.recId,productId: productId,fieldsData : JSON.stringify(this.fieldDataWithLabels),objApi : this.objectapiname})
            .then(result => {
                console.log(result);
                 var dataArray = [];
                for(i=0; i < this.data.length; i++){
                    var obj = {...this.data[i]};
                    if(obj.recordId == rowId && result){
                        obj.productType='Product Name';
                        obj.isFamily=false;
                        obj.productId = result[0].productId;
                        obj.productName = result[0].productName;
                        obj.productCode = result[0].productCode;
                        obj.dropdownValue = result[0].productFamily;
                        obj.productFamily = result[0].productFamily;
                        obj.listPrice = result[0].listPrice;
                        obj.isDisabled = true;
                    }
                    dataArray.push(obj);
                }
                this.data = dataArray;
            })
            .catch(error => {
                this.error = error;
            })
        } else {
            var dataArray = [];
            for(var i = 0; i < this.data.length; i++){
                var obj = {...this.data[i]};
                if(obj.recordId == rowId){
                    obj.productType='Product Name';
                    obj.isFamily = false;
                    obj.productName = '';
                    obj.productCode = '';
                    obj.dropdownValue = '';
                    obj.productFamily = '';
                    obj.listPrice = '';
                    obj.isDisabled = true;
                }
                dataArray.push(obj);
            }
            this.data = dataArray;
            this.initialRecords = this.data;
        }
    }
    
    handleNumRowsChange(event) {
        this.numRows = event.target.value;
    }

    addRows() {
        var uploadedData = [];
        var pricelistId='';
        var valuesofpl='';
        console.log('if agreemenet fast fieldDataWithLabels :: '+this.fieldDataWithLabels);
        for (var row of this.fieldDataWithLabels) {
            if(row.isPriceList){
                console.log('priceList fast agreement :: 2');
                pricelistId = row.value;
                 console.log('priceList fast agreement :: 2 :: '+pricelistId);
            }
            // if (row.priceListId != '' && row.isPriceList == true && row.relatedId == '' || row.relatedId == null ) {
            //    // pricelistId = row.priceListId;
            //    pricelistId = row.value;
            //    console.log('if agreemenet fast pricelistId :: '+pricelistId);
            //     valuesofpl =row.value;
            //     break;
                
            // }else if(row.priceListId != '' && row.isPriceList == true && row.relatedId != '' ){
            //     pricelistId = row.relatedId;
            //    // break;
            //      console.log('if else agreemenet fast  :: '+pricelistId);
            // }
        }
        console.log('priceList outside agreemenet fast  :: '+pricelistId);
        console.log('valuesofpl agreemenet fast  :: '+valuesofpl);
        for (let i = 1; i <= this.numRows; i++) {
            var rowData = {"recordId": this.rowIndex,"isDisabled":true,"isFamily":false,"options":this.options,"selectedValue":"Product Name","priceList" : pricelistId,"recId" : this.recId};
            uploadedData.push(rowData);
            this.rowIndex++;
        }
        this.data = this.data ? this.data : [];
        this.data = this.data.concat(uploadedData);
        this.initialRecords = this.data;
    }

    handleRowSelection(event){
        this.rowSelectedProds = event.detail.selectedRows;
        this.preFastSelectedRows =  event.detail.selectedRows.map((item) => item.recordId );
        let selectedrowsdata ={selectedrows : this.rowSelectedProds , preselected :this.preFastSelectedRows}
        const selectFastOrder = new CustomEvent("getagreementfastprods",{
                detail:selectedrowsdata, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);        
    }

    openPopup(){
        this.isModalOpen = true;
    }

    closeModal(){
        this.isModalOpen = false;
        this.fileName = '';
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = this.filesUploaded[0].name;
            this.fileloaded = true;
        }
    }

    handleFileUpload() {
        if (this.filesUploaded.length > 0) {
            this.uploadFile();
        } else {
            this.fileName = 'Please select a CSV file to upload!!';
        }
    }

    uploadFile() {
        console.log(this.filesUploaded);
        if (this.filesUploaded[0].size > this.MAX_FILE_SIZE) {
            this.dispatchEvent(
                    new ShowToastEvent({
                    title: 'File Upload.',
                    message: 'File size is too huge.',
                    variant: 'error',
                }),
            );
            console.log('File Size is too large');
            return;
        }
        this.fileReader = new FileReader();
        this.fileReader.onloadend = () => {
            this.fileContents = this.fileReader.result;
            var arrayRows = this.fileContents.split('\n');
            var isValidData = true;
            for(var i = 0; i < arrayRows.length; i++){
                var arrayCell = arrayRows[i].split(',');
                console.log(JSON.stringify(arrayCell));
                if(arrayCell.length > 1 && !arrayCell[0] && !arrayCell[1]){
                    isValidData = false;
                }
            }
            console.log(isValidData);
            if(isValidData){
                this.saveFile();
            } else {
                this.dispatchEvent(
                        new ShowToastEvent({
                        title: 'File Upload.',
                        message: 'Please enter valid data.',
                        variant: 'error',
                    }),
                );
            }
        };
        this.fileReader.readAsText(this.filesUploaded[0]);
    }

    saveFile() {
        try {
            this.showLoader = true;
            console.log(JSON.stringify(this.fields));
            this.isDisabled = true;
            saveFile({ base64Data: JSON.stringify(this.fileContents), recId: this.recId,fieldsData : JSON.stringify(this.fields) })
            .then(result => {
                this.fileName = '';
                this.isDisabled = false;
                this.isModalOpen = false;
                this.showLoader = false;
                if (result === null || result.length === 0) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Warning',
                            message: 'The CSV file does not valid data.',
                            variant: 'warning',
                        }),
                    );
                } else {
                    this.data = this.data ? this.data : [];
                    this.data = this.data.concat(result);
                    this.initialRecords = this.data;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success!!',
                            message: this.filesUploaded[0].name + ' – Uploaded Successfully!!!',
                            variant: 'success',
                        }),
                    );
                }
            })
            .catch(error => {
                this.dispatchEvent(
                        new ShowToastEvent({
                        title: 'Error while uploading File',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An unexpected error occurred.',
                    variant: 'error',
                }),
            );
        }
    }

    async handleMassDelete() {
        const result = await LightningConfirm.open({
            message: 'Do you really want delete records ?',
            variant: 'header',
            theme: 'error',
            label: 'Delete Records',
        });
        if(result==true){
           this.handleDeleteRecords(); 
        }
    }

    handleDeleteRecords(){ 
        console.log('handleDelete');
        const selectedRowIds = this.rowSelectedProds.map(row => row.recordId);
        if(selectedRowIds){
            this.data = this.data.filter(row => !selectedRowIds.includes(row.recordId));    
            this.rowSelectedProds = []; 
        }else{
             this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select the row !!! ',
                    variant: 'error',
                }),
            );
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
        const fieldNameWithC = this.columns[this.columnIndex].label;
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
        this.columns = [...this.columns];
        this.data = dataArray; 
        this.closeFilterModal();
        if(this.template.querySelector('.pricing')){
            console.log(actionName);
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
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }

    renderedCallback(){   
        if(this.template.querySelector('.inputbox-1')){
            const style1 = document.createElement('style');
            style1.innerText = '.inputbox-1 .slds-form-element__control .slds-input {border-top-right-radius: 0px; border-bottom-right-radius: 0px; }';
            this.template.querySelector('.inputbox-1').appendChild(style1);
        }
        if(this.template.querySelector('.button_radius')){
            const style2 = document.createElement('style');
            style2.innerText = '.button_radius .slds-button {border-top-left-radius: 0px; border-bottom-left-radius: 0px; padding-left: 7px; padding-right: 7px !important; padding-right:0px; }';
            this.template.querySelector('.button_radius').appendChild(style2);
        }
        if(this.template.querySelector('.divDataTable')){
            const style3 = document.createElement('style');
            style3.innerText = '.divDataTable .dt-outer-container .slds-table_header-fixed_container .slds-scrollable_y {height: 22rem;}';
            this.template.querySelector('.divDataTable').appendChild(style3);
        }
    }
}