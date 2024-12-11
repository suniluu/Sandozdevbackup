import { LightningElement, track, wire, api } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getPricingInfo from '@salesforce/apex/ProductController.getPricingInfo';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import LightningConfirm from 'lightning/confirm';
import saveFile from '@salesforce/apex/ProductController.saveFile';

export default class FastOrder extends LightningElement {
    @track columns;
    @track productData;
    @track initialRecords;
    @track sortBy;
    @track sortDirection = 'asc';
    @track isModalOpen = false;
    @track rowIndex = 1;
    @track isOpenFilterInput = false;
    @track filterAppliedValue = '';
    @track numRows = 1;
    @track dataLoading = false;
    @track isDisabled = false;
    @track showLoader = false;
    
    @api recId;
    @api fields;
    @api preFastSelectedRows;
    @api priceListApi;
    @api cerApi;

    mapFilterData = new Map();
    columnFilterValues = new Map();
    mapSortColumn = new Map();
    mapProductData = new Map();

    discount;
    quantity;
    price;
    listPrice;
    netPrice;
    columnIndex;
    selectedRows;
    fileName;
    fileContents;
    fileReader;
    fastSelection =[];
    filesUploaded = [];
    fileloaded = false;
    componentLoaded = false;
    fieldLookupName = 'Name';
    addfield = '';
    MAX_FILE_SIZE = 1500000;

    connectedCallback() {
       console.log('fast order redId ::: '+ this.recId);
    }
    @wire(getColumns, { columnData: 'Quick_Order_Table' }) wiredColumns({data, error}){
        if (data) {
            this.columns = JSON.parse(data.Column_JSON__c);
            for(var i = 0; i < this.columns.length; i++){
                if(this.columns[i].typeAttributes && this.columns[i].type == 'customName'){
                    this.discount = this.columns[i].typeAttributes.discount ? this.columns[i].typeAttributes.discount : '';
                    this.quantity = this.columns[i].typeAttributes.quantity ? this.columns[i].typeAttributes.quantity : '';
                    this.price = this.columns[i].typeAttributes.price ? this.columns[i].typeAttributes.price : '';
                    this.listPrice = this.columns[i].typeAttributes.listPrice ? this.columns[i].typeAttributes.listPrice : '';
                    this.netPrice = this.columns[i].typeAttributes.netPrice ? this.columns[i].typeAttributes.netPrice : '';
                }
                if(this.columns[i].typeAttributes && this.columns[i].typeAttributes.sortField){
                    this.mapSortColumn[this.columns[i].fieldName] = this.columns[i].typeAttributes.sortField;
                }
            }
            this.columns = this.columns.map((column, index) => {
                const columnWithNumber = {...column,columnNumber: index};
                return columnWithNumber;
            });
        } else if (error) {
            console.log(error);
        }
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
                if(arrayCell.length > 1 && !arrayCell[0] && !arrayCell[1]){
                    isValidData = false;
                }
            }
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
                    this.productData = this.productData ? this.productData : [];
                    this.productData = this.productData.concat(result);
                    this.initialRecords = this.productData;
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
                console.error(error);
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

    handleproductchanged(event){
        const {productId, rowId, fieldapi, recordfieldAPI, addcol} = event.detail;
        if(productId){    
            getPricingInfo({ productId: productId,fieldsData : JSON.stringify(this.fields)})
            .then(result => {
                this.productchangedCalc(productId, rowId, fieldapi, recordfieldAPI, addcol, result);
            })
            .catch(error => {
                this.error = error;
            })
        } else {
            var dataArray = [];
            for(var i = 0; i < this.productData.length; i++){
                var obj = {...this.productData[i]};
                if(obj.recordId == rowId){
                    obj[fieldapi] = '';
                    if(recordfieldAPI){
                        obj[recordfieldAPI] = '';
                    }
                    if(addcol){
                        obj[addcol] = '';
                    }
                    if(this.price){
                        obj[this.price] = '';
                    }
                    if(this.discount){
                        obj[this.discount] = '';
                    }
                    if(this.quantity){    
                        obj[this.quantity] = '';
                    }
                    if(this.listPrice){
                        obj[this.listPrice] = '';
                    }
                    if(this.netPrice){
                        obj[this.netPrice] = '';
                    }
                }
                dataArray.push(obj);
            }
            this.productData = dataArray;
            this.initialRecords = this.productData;
        }
    }

    productchangedCalc(productId, rowId, fieldapi, recordfieldAPI, addcol, result){
        var dataArray = [];
        for(var i = 0; i < this.productData.length; i++){
            var obj = {...this.productData[i]};
            for(var j = 0; j < result.length; j++){
                if(obj.recordId == rowId){
                    obj[fieldapi] = productId;
                    if(recordfieldAPI){
                        obj[recordfieldAPI] = result[j][recordfieldAPI];
                    }
                    if(addcol){
                        obj[addcol] = result[j][addcol];
                    }
                    if(this.price){
                        obj[this.price] = result[j][this.price];
                    }
                    if(this.discount){
                        obj[this.discount] = result[j][this.discount];
                    }
                    if(this.quantity){    
                        obj[this.quantity] = result[j][this.quantity];
                    }
                    if(this.price && this.quantity && obj[this.price] && obj[this.quantity] && this.listPrice){
                        obj[this.listPrice] = obj[this.price] * obj[this.quantity];
                    }
                    if(this.netPrice && this.listPrice && obj[this.discount] && obj[this.listPrice]){
                        obj[this.netPrice] = obj[this.listPrice] - ((obj[this.listPrice] * obj[this.discount]) / 100);
                    } else if(this.listPrice && this.netPrice){
                        obj[this.netPrice] = obj[this.listPrice];
                    }
                }
            }
            dataArray.push(obj);
        }
        this.productData = dataArray;
        this.initialRecords = this.productData;
    }    

    handleproductselected(event){
        const {selectedRecord, rowId, fieldapi, recordname, recordfieldAPI, addfieldVal, addcol} = event.detail;
        var dataArray = [];
        for(var i = 0; i < this.productData.length; i++){
            var obj = {...this.productData[i]};
            if(obj.recordId == rowId){
                obj[fieldapi] = selectedRecord;
                obj[recordfieldAPI] = recordname;
                if(addcol){
                    obj[addcol] = addfieldVal;
                }
            }
            dataArray.push(obj);
        }
        this.productData = dataArray;
        this.initialRecords = this.productData;
    }

    handleRowSelection(event){
        this.selectedRows = event.detail.selectedRows;
        this.fastSelection = [...this.selectedRows];
        this.preFastSelectedRows =  event.detail.selectedRows.map(
                (item) => item.recordId
        );
        let selectedData = {selectedRecord: this.fastSelection, preselected :this.preFastSelectedRows};
        const selectFastOrder = new CustomEvent("getfastorderproduct",{
            detail:selectedData, bubbles: true, composed: true
        });
        this.dispatchEvent(selectFastOrder);
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
        const selectedRowIds = this.selectedRows.map(row => row.recordId);
        this.productData = this.productData.filter(row => !selectedRowIds.includes(row.recordId));    
        this.selectedRows = [];   
    }

    handleNumRowsChange(event) {
        this.numRows = event.target.value;
    }

    addRows() {
        var uploadedData = [];
        var pricelistId='';

        for (var row of this.fields) {
            if (row.isPriceList) {
                pricelistId = row.value;
            }
        }
        for (let i = 1; i <= this.numRows; i++) {
            var rowData = {"recordId": this.rowIndex,"isDisabled" :true,"priceList" : pricelistId,"recId":this.recId};
            uploadedData.push(rowData);
            this.rowIndex++;
        }
        this.productData = this.productData ? this.productData : [];
        this.productData = this.productData.concat(uploadedData);
        this.initialRecords = this.productData;
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.productData));
        // Return the value stored in the field

        if(this.mapSortColumn[fieldname]){
            fieldname = this.mapSortColumn[fieldname];
        }

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
        this.productData = parseData;
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

    handleOpenFilterInput(){
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.filterAppliedValue = this.mapFilterData[filterColumnName];
        this.isOpenFilterInput = true;
    }

    handleFilterRecords(actionName) {
        var initialArray = [];
        for(var i = 0; i < this.initialRecords.length; i++){
            var obj = {...this.initialRecords[i]};
            obj = this.mapProductData[obj.recordId] ? this.mapProductData[obj.recordId] : obj;
            initialArray.push(obj);
        }
        this.initialRecords = initialArray;
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
        this.productData = dataArray; 
        this.closeFilterModal();
        if(this.template.querySelector('.divDataTable')){
            if(actionName === 'clear'){
                this.addCustomStyle('span', '#f3f3f3');
                this.addCustomStyle('span a.slds-th__action', '#f3f3f3');
            } else {
                this.addCustomStyle('span','#a0cfa0');
                this.addCustomStyle('span a.slds-th__action','#a0cfa0');
                this.addCustomStyle('.slds-dropdown__item','transparent');
                this.addCustomStyle('.slds-dropdown__item span','transparent');
                this.addCustomStyle('.span a.slds-th__action:focus:hover','#a0cfa0');
            }
        }
    }

    addCustomStyle(selector, backgroundColor) {
        let style = document.createElement('style');
        style.innerText = '.divDataTable .slds-table thead th:nth-child(' + (this.columnIndex + 3) + ') ' + selector + ' { background-color: ' + backgroundColor + ';}';
        this.template.querySelector('.divDataTable').appendChild(style);
    }
    
    handleChange(event){
        const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
        this.columnFilterValues[filterColumnName] = event.target.value;
        this.filterAppliedValue = event.target.value;
    }

    closeFilterModal(){
        this.isOpenFilterInput = false;
        this.filterAppliedValue = '';
    }

    renderedCallback() {
        if(!this.componentLoaded){
            if(this.template.querySelector('.divDataTable')){
                this.applyCustomStyle('.divDataTable','.slds-icon_container.slds-combobox__input-entity-icon {z-index: 0;}');
                this.applyCustomStyle('.divDataTable','.slds-input__icon_right.slds-icon-utility-search {z-index: 0;}');
                this.applyCustomStyle('.divDataTable','.divDataTable .dt-outer-container .slds-table_header-fixed_container .slds-scrollable_y {height: 22rem;}');
                this.applyCustomStyle('.divDataTable','.slds-is-absolute {position: fixed;}');
                this.applyCustomStyle('.divDataTable','.slds-button_icon.slds-input__icon {z-index: 0;}');
                this.applyCustomStyle('.divDataTable','.slds-input__icon.slds-icon-utility-down {z-index: 0;}');
                this.applyCustomStyle('.divDataTable','.slds-truncate {overflow: visible;}');
                this.applyCustomStyle('.divDataTable','.divDataTable lightning-button-icon:nth-child(2) .slds-button_icon svg {width: 1.5rem;height: 1.5rem;}');
                this.applyCustomStyle('.divDataTable','.divDataTable .dt-outer-container .slds-table_header-fixed_container {background-color : white}');
            }
            this.applyCustomStyle('.inputbox-1','.inputbox-1 .slds-form-element__control .slds-input {border-top-right-radius: 0px; border-bottom-right-radius: 0px; }');
            this.applyCustomStyle('.button_radius','.button_radius .slds-button {border-top-left-radius: 0px; border-bottom-left-radius: 0px; padding-left: 7px; padding-right: 7px !important; padding-right:0px; }');
            this.applyCustomStyle('.button-div-width','.button-div-width .button-icons .slds-button {background-color: #bf1515; color: white; border-color: white;}');
            this.componentLoaded = true;
        }
    }

    applyCustomStyle(selector, innerText){
        if(this.template.querySelector(selector)){
            let style = document.createElement('style');
            style.innerText = innerText;
            this.template.querySelector(selector).appendChild(style);
        }
    }
}