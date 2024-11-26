import { LightningElement, track, wire, api } from 'lwc';
import getSampleProducts from '@salesforce/apex/ProductController.getQuickOrderRecords';
import getColumns from '@salesforce/apex/ProductController.getColumns';
//import getUploadedRecordNames from '@salesforce/apex/ProductController.getUploadedRecordNames';
import getPricingColumn from '@salesforce/apex/ProductController.getSettingsinfo';
// import addProductsToCart from '@salesforce/apex/OrderRequestAddToCart.addProductsToCart';
// import backToCart from '@salesforce/apex/OrderRequestAddToCart.backToCart';
import getCurrencySymbol from '@salesforce/apex/UtilityController.getCurrencySymbol';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from 'lightning/navigation';
//import saveFile from '@salesforce/apex/ProductController.saveFile';

export default class ProductsSummary extends NavigationMixin(LightningElement) {
    @track selectedrows=[];
    @track selectedids='';
    @track columns;
    @api productData;
    @track initialRecords;
    @track sortBy;
    @track sortDirection = 'asc';
    @track isModalOpen = false;
    @track productsDataCSV = '';
    @track totalNetPrice = 0;
    @track rowIndex = 1;
    @track isOpenFilterInput = false;
    @track filterAppliedValue = '';
    @track searchText;
    @track showInput = false;
    @track numRows = 1;
    @track dataLoading = false;
    @track userCurrencySymbol;
    @track appliedStyle;
    @track isDisabled = false;
    @track showLoader = false;
    @track isMassEditPopup = false;
    @track comboboxOptions;

    @api recordId;
@track recnumbers=0;
    componentLoaded = false;
    priceField;
    discount;
    quantity;
    price;
    listPrice;
    netPrice;
    keyField;
    lstAggrementPricing;

    columnIndex;
    columnNames = [];

    fieldAPIs = [];
    fieldsAPINumCurr = [];
    saveDraftValues = [];
    productDataClone = [];
    lstComboCols = [];
    massColumnUpdates = [];
    cancelArray = [];
    
    mapLookupColumns = new Map();
    mapLookupNames = new Map();
    mapfieldAPInames = new Map();
    mapfieldLookupName = new Map();
    mapFilterData = new Map();
    columnFilterValues = new Map();
    addSearchField = new Map();
    mapCombobox = new Map();
    mapComboboxResult = new Map();
    mapProductPricing = new Map();
    mapSortColumn = new Map();
    mapProductData = new Map();
    mapProdAgreeRange = new Map();
    mapProdAgreeRangeArr = new Map();

    filesUploaded = [];
    fileName;
    fileContents;
    fileReader;
    fileloaded = false;
    fieldLookupName = 'Name';
    addfield = '';
    MAX_FILE_SIZE = 1500000;

    matchingInfo = {
        primaryField: { fieldPath: this.fieldLookupName }
    };

    displayInfo = {
        primaryField: this.fieldLookupName
    }

  /*  @wire(getPricingColumn, { fieldLabel: 'Price_Products' }) wiredPricingColumn(result){
        this.dataLoading=true;
        if (result.data) {
            this.priceField = result.data;
            this.dataLoading=false;
            //this.loadFastOrderData();

        } else if (result.error) {
            console.log(result.error);
        }
    }*/

    connectedCallback() {
        this.getUserCurrencySymbol();
        this.loadFastOrderData();
        
    }

    loadFastOrderData(){
       // console.log(data+'data');
//             this.productData = data;
       
// console.log(JSON.stringify(this.productData)+'productdata');
//              console.log(this.productData+'this.productData');
        // getSampleProducts({ recId : this.recId})
        // .then(result => {
        //     console.log(result);
        //     this.productData = result;
        //     //var dataArray = [];
        //     for(var i = 0; i < this.productData.length; i++){
        //         var obj = {...this.productData[i]};
        //         if(obj[this.keyField]){
        //             this.mapProductPricing.set(obj[this.keyField],obj[this.lstAggrementPricing]);
        //         }
        //         if(this.productData[i][this.priceField]){
        //             this.totalNetPrice += this.productData[i][this.priceField];
        //         }
        //     }
        //     //this.productData = dataArray;
        //     this.initialRecords = this.productData;
        //     this.totalNetPrice = this.totalNetPrice.toFixed(2);
            
        // })
        // .catch(error => {
        //     this.error = error;
        // })
    }

    getUserCurrencySymbol() {
        getCurrencySymbol()
        .then(result => {
            this.userCurrencySymbol = result;
        })
        .catch(error => {
            this.error = error;
        })
    }

    @wire(getColumns, { columnData: 'Checkout_Page' }) wiredColumns({data, error}){
        if (data) {
             this.dataLoading=true;
            this.columns = JSON.parse(data.Column_JSON__c);
            for(var i = 0; i < this.columns.length; i++){
                if(this.columns[i].editable == true || this.columns[i].editable == 'true'){
                    this.fieldAPIs.push(this.columns[i].fieldName);
                    if(this.columns[i].type == 'number' || this.columns[i].type == 'percent' || this.columns[i].type == 'currency'){
                        this.fieldsAPINumCurr.push(this.columns[i].fieldName);
                    }
                    if(this.columns[i].typeAttributes && this.columns[i].type == 'customName'){
                        //this.mapLookupColumns.set(i, this.columns[i].typeAttributes.objname);
                        this.mapLookupColumns[i] = this.columns[i].typeAttributes.objname;
                        this.mapfieldAPInames[i] = this.columns[i].typeAttributes.fieldapiname;
                        this.mapfieldLookupName[i] = this.columns[i].typeAttributes.fieldLookupName;
                        this.addSearchField[i] = this.columns[i].typeAttributes.addField;
                        this.discount = this.columns[i].typeAttributes.discount ? this.columns[i].typeAttributes.discount : '';
                        this.quantity = this.columns[i].typeAttributes.quantity ? this.columns[i].typeAttributes.quantity : '';
                        this.price = this.columns[i].typeAttributes.price ? this.columns[i].typeAttributes.price : '';
                        this.listPrice = this.columns[i].typeAttributes.listPrice ? this.columns[i].typeAttributes.listPrice : '';
                        this.netPrice = this.columns[i].typeAttributes.netPrice ? this.columns[i].typeAttributes.netPrice : '';
                    }
                    if(this.columns[i].typeAttributes && this.columns[i].type == 'customCombox'){
                        this.mapCombobox[i] = this.columns[i].fieldName;
                        this.lstComboCols.push(i);
                        this.keyField = this.columns[i].typeAttributes.keyField;
                        this.lstAggrementPricing = this.columns[i].typeAttributes.lstAggrementPricing;
                    }
                    if(this.columns[i].typeAttributes && (this.columns[i].typeAttributes.massedit == 'true' || this.columns[i].typeAttributes.massedit)){
                        var massColObj = {};
                        massColObj.type = this.columns[i].type;
                        massColObj.label = this.columns[i].label;
                        massColObj.fieldName = this.columns[i].fieldName;
                        if(this.columns[i].type == 'customName'){
                            massColObj.lookup = true;
                            massColObj.objname = this.columns[i].typeAttributes.objname;
                            massColObj.fieldLookupName = this.columns[i].typeAttributes.fieldLookupName;
                            this.fieldLookupName = this.columns[i].typeAttributes.fieldLookupName;
                            this.addfield = this.columns[i].typeAttributes.addfield;
                        } else if(this.columns[i].type == 'customCombox'){
                            massColObj.combobox = true;
                            massColObj.selectedField = this.columns[i].typeAttributes.selectedValue.fieldName;
                        } else {
                            massColObj.regularType = true;
                            massColObj.inputValue = '';
                        }
                        this.massColumnUpdates.push(massColObj);
                    }
                }
                console.log(this.massColumnUpdates);
                if(this.columns[i].typeAttributes && this.columns[i].typeAttributes.sortField){
                    this.mapSortColumn[this.columns[i].fieldName] = this.columns[i].typeAttributes.sortField;
                }
            }
            const filteredColumnNames = this.columns
                .filter(column => column.fieldName)
                .map(column => column.fieldName);
            this.columnNames = filteredColumnNames;
            this.columns = this.columns.map((column, index) => {
                const columnWithNumber = {
                    ...column,
                    columnNumber: index,
                };
                return columnWithNumber;
            });
             this.dataLoading=false;
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

    openMassEditPopup(){
        var selectedRecords =  this.template.querySelector("c-custom-type-datatable").getSelectedRows();
        if(selectedRecords.length > 0){
            /*var additionalSearch = this.addfield ? this.addfield : this.fieldLookupName;
            this.matchingInfo = {
                primaryField: { fieldPath: this.fieldLookupName },
                additionalFields: [{ fieldPath: additionalSearch }],
            };

            if(this.addfield){
                this.displayInfo = {
                    primaryField: this.fieldLookupName,
                    additionalFields: [this.addfield],
                };
            }*/
            for(var j = 0; j < this.massColumnUpdates.length; j++){
                this.massColumnUpdates[j].inputValue = '';
            }
            this.comboboxOptions = [];
            var addedOptions = [];
            for(var i = 0; i < selectedRecords.length; i++){
                for(var j = 0; j < selectedRecords[i].options.length; j++){
                    if(!addedOptions.includes(selectedRecords[i].options[j].value)){
                        if(!this.comboboxValue){
                            this.comboboxValue = selectedRecords[i].options[j].value;
                        }
                        var optionObj = {};
                        optionObj.label = selectedRecords[i].options[j].label;
                        optionObj.value = selectedRecords[i].options[j].value;
                        optionObj.description = selectedRecords[i].options[j].description;
                        addedOptions.push(optionObj.value);
                        this.comboboxOptions.push(optionObj);
                    }
                }
            }
            this.isMassEditPopup = true;
        } else {
            this.dispatchEvent(
                    new ShowToastEvent({
                    title: 'Mass Edit.',
                    message: 'Please select atleast one row.',
                    variant: 'error',
                }),
            );
        }
    }

    updateMassEditPopup(){
        var dataArray = [];
        var editedArray = [];
        this.cancelArray = [...this.productData];
        var selectedRecords =  this.template.querySelector("c-custom-type-datatable").getSelectedRows();
        if(selectedRecords.length > 0){
            for(var i = 0; i < this.productData.length; i++){
                var obj = {...this.productData[i]};
                for(var l = 0; l < selectedRecords.length; l++){
                    if(selectedRecords[l].recordId == obj.recordId){
                        var draftObj = {};
                        for(var j = 0; j < this.massColumnUpdates.length; j++){
                            if(this.massColumnUpdates[j].inputValue){
                                draftObj.recordId = obj.recordId;
                                if(this.massColumnUpdates[j].type == 'customName'){
                                    obj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                    draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                } else if(this.massColumnUpdates[j].type == 'customCombox'){
                                    var hasValue = false;
                                    for(var k = 0; k < obj.options.length; k++){
                                        if(obj.options[k].value == this.massColumnUpdates[j].inputValue){
                                            hasValue = true;
                                        }
                                    }
                                    if(hasValue){
                                        obj[this.massColumnUpdates[j].selectedField] = this.massColumnUpdates[j].inputValue;
                                        draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                    }
                                } else {
                                    obj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                    draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                }
                            }
                        }
                        editedArray.push(draftObj);
                    }
                }
                this.mapProductData[obj.recordId] = obj;
                dataArray.push(obj);
            }
            this.productData = dataArray;
            this.saveDraftValues = editedArray;
        }
        this.closeMassEditPopup();
    }
handleSearch(event){
        const searchKey = event.target.value.toLowerCase();
        
        if (searchKey) {
           
            if (this.productData) {
                let searchRecords = [];
                for (let record of this.productData) {
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
                this.productData = searchRecords;
            }
        } else {
            this.productData=data;
        }
    }

    handleCancel(){
        if(this.cancelArray.length > 0){
            this.productData = this.cancelArray;
            this.cancelArray = [];
        }
    }

    handleInputType(event){
        for(var j = 0; j < this.massColumnUpdates.length; j++){
            if(this.massColumnUpdates[j].fieldName == event.target.fieldName){
                this.massColumnUpdates[j].inputValue = this.massColumnUpdates[j].type == 'customName' ? event.detail.recordId : event.detail.value;
            }
        }
        console.log(JSON.stringify(this.massColumnUpdates));
    }

    closeMassEditPopup(){
        this.isMassEditPopup = false;
    }

    onChangeData(event) {
        this.productsDataCSV = event.target.value;
    }

    // handleFilesChange(event) {
    //     if (event.target.files.length > 0) {
    //         this.filesUploaded = event.target.files;
    //         this.fileName = this.filesUploaded[0].name;

    //         this.fileloaded = true;
    //     }
    // }

    // handleFileUpload() {
    //     if (this.filesUploaded.length > 0) {
    //         this.uploadFile();
    //     } else {
    //         this.fileName = 'Please select a CSV file to upload!!';
    //     }
    // }

    // uploadFile() {
    //     console.log(this.filesUploaded);
    //     if (this.filesUploaded[0].size > this.MAX_FILE_SIZE) {
    //         this.dispatchEvent(
    //                 new ShowToastEvent({
    //                 title: 'File Upload.',
    //                 message: 'File size is too huge.',
    //                 variant: 'error',
    //             }),
    //         );
    //         console.log('File Size is too large');
    //         return;
    //     }
    //     this.fileReader = new FileReader();
    //     this.fileReader.onloadend = () => {
    //         this.fileContents = this.fileReader.result;
    //         var arrayRows = this.fileContents.split('\n');
    //         var isValidData = true;
    //         for(var i = 0; i < arrayRows.length; i++){
    //             var arrayCell = arrayRows[i].split(',');
    //             console.log(JSON.stringify(arrayCell));
    //             if(arrayCell.length > 1 && !arrayCell[0] && !arrayCell[1]){
    //                 isValidData = false;
    //             }
    //         }
    //         console.log(isValidData);
    //         if(isValidData){
    //             this.saveFile();
    //         } else {
    //             this.dispatchEvent(
    //                     new ShowToastEvent({
    //                     title: 'File Upload.',
    //                     message: 'Please enter valid data.',
    //                     variant: 'error',
    //                 }),
    //             );
    //         }
    //     };
    //     this.fileReader.readAsText(this.filesUploaded[0]);
    // }

    // saveFile() {
    //     try {
    //         this.showLoader = true;
    //         console.log(JSON.stringify(this.fileContents));
    //         this.isDisabled = true;
    //         saveFile({ base64Data: JSON.stringify(this.fileContents), recId: this.recId })
    //         .then(result => {
    //             this.fileName = '';
    //             this.isDisabled = false;
    //             this.isModalOpen = false;
    //             this.showLoader = false;
    //             if (result === null || result.length === 0) {
    //                 this.dispatchEvent(
    //                     new ShowToastEvent({
    //                         title: 'Warning',
    //                         message: 'The CSV file does not valid data.',
    //                         variant: 'warning',
    //                     }),
    //                 );
    //             } else {
    //                 this.productData = this.productData ? this.productData : [];
    //                 this.productData = this.productData.concat(result);
    //                 this.initialRecords = this.productData;
    //                 this.dispatchEvent(
    //                     new ShowToastEvent({
    //                         title: 'Success!!',
    //                         message: this.filesUploaded[0].name + ' – Uploaded Successfully!!!',
    //                         variant: 'success',
    //                     }),
    //                 );
    //             }
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             this.dispatchEvent(
    //                     new ShowToastEvent({
    //                     title: 'Error while uploading File',
    //                     message: error.message,
    //                     variant: 'error',
    //                 }),
    //             );
    //         });
    //     } catch (error) {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Error',
    //                 message: 'An unexpected error occurred.',
    //                 variant: 'error',
    //             }),
    //         );
    //     }
    // }

    // submitDetails(){
    //     if (!this.productsDataCSV || this.productsDataCSV.trim() === ''){
    //         const evt = new ShowToastEvent({
    //             title: 'Order Upload',
    //             message: 'Please Input Your Order',
    //             variant: 'Error',
    //           });
    //           this.dispatchEvent(evt);
    //         }
    //     else{
    //         var lstProducts = this.productsDataCSV.split(/\r?\n/);
    //         var arrayVals = [];
    //         if(lstProducts){
    //             for(var i = 0; i < lstProducts.length; i++){
    //                 if(lstProducts[i]){
    //                     var lstfieldvals = lstProducts[i].split(",");
    //                     for(var j = 0; j < lstfieldvals.length; j++){
    //                         if(this.mapLookupColumns[j]){
    //                             arrayVals = this.mapLookupNames[j] || [];
    //                             if(lstfieldvals[j]){
    //                                 arrayVals.push(lstfieldvals[j].trim());
    //                             }
    //                             this.mapLookupNames[j] = arrayVals;
    //                         }
    //                     }
    //                 }
    //             }
    //             getUploadedRecordNames({ mapLookupColumns: JSON.stringify(this.mapLookupColumns), mapLookupNames: JSON.stringify(this.mapLookupNames), mapfieldLookupName: JSON.stringify(this.mapfieldLookupName), addSearchField: JSON.stringify(this.addSearchField) })
    //             .then(result => {
    //                 console.log(result);
    //                 var uploadedData = [];
    //                 for(var i = 0; i < lstProducts.length; i++){
    //                     if(lstProducts[i]){
    //                         var lstfieldvals = lstProducts[i].split(",");
    //                         var rowData = {};
    //                         for(var j = 0; j < lstfieldvals.length; j++){
    //                             if(this.fieldsAPINumCurr.includes(this.fieldAPIs[j])){
    //                                 rowData[this.fieldAPIs[j]] = Number(lstfieldvals[j].trim());
    //                             } else if(this.mapLookupColumns[j]){
    //                                 rowData[this.fieldAPIs[j]] = result[j][lstfieldvals[j].trim()].Id || lstfieldvals[j].trim();
    //                                 rowData[this.mapfieldAPInames[j]] = result[j][lstfieldvals[j].trim()][this.mapfieldLookupName[j]];
    //                             } else {
    //                                 rowData[this.fieldAPIs[j]] = lstfieldvals[j].trim();
    //                             }
    //                         }
    //                         console.log(rowData);
    //                         rowData.Id = this.rowIndex;
    //                         uploadedData.push(rowData);
    //                         this.rowIndex++;
    //                     }
    //                 }
    //                 this.productData = this.productData.concat(uploadedData);
    //                 this.initialRecords = this.productData;
    //             })
    //             .catch(error => {
    //                 this.error = error;
    //             })
    //         }
    //         this.closeModal();
    //     }
    //     //this.productData = this.productData.concat(uploadedData);
    //     //this.initialRecords = this.productData;
       
    // }

    handleSave(event){
        this.saveDraftValues = event.detail.draftValues;
        var dataArray = [];
        this.totalNetPrice = 0;
        for(var i = 0; i < this.productData.length; i++){
            var obj = {...this.productData[i]};
            for(var j = 0; j < this.saveDraftValues.length; j++){
                if(this.productData[i].recordId == this.saveDraftValues[j].recordId){
                    for(var k = 0; k < this.fieldAPIs.length; k++){
                        if(this.saveDraftValues[j][this.fieldAPIs[k]]){
                            if(this.fieldAPIs[k] == 'aggrementVal'){
                                obj.selectedValue = this.saveDraftValues[j][this.fieldAPIs[k]];
                            } else {
                                obj[this.fieldAPIs[k]] = this.saveDraftValues[j][this.fieldAPIs[k]];
                            }
                            if(this.fieldAPIs[k] == this.quantity || this.fieldAPIs[k] == this.discount){
                                var rangeValues = this.mapProdAgreeRangeArr[obj.productId+''+obj.selectedValue];
                                var mapRangePrice = this.mapProdAgreeRange[obj.productId+''+obj.selectedValue];
                                for(var k = 0; k < rangeValues.length; k++){
                                    if(rangeValues[k] <= this.saveDraftValues[j][this.quantity]){
                                        obj[this.price] = mapRangePrice[rangeValues[k]];
                                    }
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
                    }
                }
            }
            if(obj[this.priceField]){
                this.totalNetPrice = Number(this.totalNetPrice) + Number(obj[this.priceField]);
            }
            this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
            this.mapProductData[obj.recordId] = obj;
            dataArray.push(obj);
        }
        this.productData = dataArray;
        //this.initialRecords = this.productData;
        this.saveDraftValues = [];
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!!',
                message: 'Saved Successfully!!!',
                variant: 'success',
            }),
        );
    }

    deleteRow(event) {
        const id = event.detail;
        var dataArray = [];
        this.totalNetPrice = 0;
        for(var i = 0; i < this.productData.length; i++){
            if(this.productData[i].recordId != id){
                dataArray.push(this.productData[i]);
            }
        }
        var initialArray = [];
        for(var i = 0; i < this.initialRecords.length; i++){
            if(this.initialRecords[i].recordId != id){
                initialArray.push(this.initialRecords[i]);
                if(this.productData[i][this.priceField]){
                    this.totalNetPrice = Number(this.totalNetPrice) + Number(this.productData[i][this.priceField]);
                }
            }
        }
        this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
        this.productData = dataArray;
        this.initialRecords = initialArray;
        console.log(dataArray);
    }

    /*handleSearch(event){
        this.searchText = event.target.value;
        const searchKey = event.target.value.toLowerCase();
        console.log(JSON.stringify(this.initialRecords));
        if (searchKey) {
            this.productData = this.initialRecords;
            if (this.productData) {
                let searchRecords = [];
                for (let record of this.productData) {
                    let valuesArray = Object.values(record);
                    for (let val of valuesArray) {
                        if(typeof val === 'object'){
                            let strVal = String(JSON.parse(JSON.stringify(val)).Name);
                            if (strVal) {
                                if (strVal.toLowerCase().includes(searchKey)) {
                                    searchRecords.push(record);
                                    break;
                                }
                            }
                        } else {
                            let strVal = String(val);
                            if (strVal) {
                                if (strVal.toLowerCase().includes(searchKey)) {
                                    searchRecords.push(record);
                                    break;
                                }
                            }
                        }
                    }
                }
                this.productData = searchRecords;
            }
        } else {
            this.productData = this.initialRecords;
        }
    }*/

    handleproductchanged(event){
        const {productId, rowId, fieldapi, recordfieldAPI, addcol, result, aggrementId,aggrementName,aggrementCode} = event.detail;
        this.mapProductPricing.set(productId,result);
        var dataArray = [];
        var aggrOptions = [];
        var selectedOption = '';
        this.totalNetPrice = 0;
        if(result){
            var addedAgreements = [];
            for(var i = 0; i < result.length; i++){
                if(productId && result[i][aggrementId]){
                    if(!addedAgreements.includes(result[i][aggrementId])){
                        if(!selectedOption){
                            selectedOption = result[i][aggrementId];
                        }
                        var ow = {};
                        ow.label = result[i][aggrementName];
                        ow.value = result[i][aggrementId];
                        ow.description = result[i][aggrementCode];
                        addedAgreements.push(ow.value);
                        aggrOptions.push(ow);
                    }
                    if(!this.mapProdAgreeRange[productId+''+result[i][aggrementId]]){
                        var mapRangePrice = new Map();
                        mapRangePrice[result[i].range] = result[i][this.price];
                        this.mapProdAgreeRange[productId+''+result[i][aggrementId]] = mapRangePrice;

                        var rangeArr = [];
                        rangeArr.push(result[i].range);
                        this.mapProdAgreeRangeArr[productId+''+result[i][aggrementId]] = rangeArr;
                    } else {
                        var mapRangePrice = this.mapProdAgreeRange[productId+''+result[i][aggrementId]];
                        mapRangePrice[result[i].range] = result[i][this.price];
                        this.mapProdAgreeRange[productId+''+result[i][aggrementId]] = mapRangePrice;

                        var rangeArr = this.mapProdAgreeRangeArr[productId+''+result[i][aggrementId]];
                        rangeArr.push(result[i].range);
                        this.mapProdAgreeRangeArr[productId+''+result[i][aggrementId]] = rangeArr;
                    }
                }
            }
            console.log(JSON.stringify(this.mapProdAgreeRange));
        }
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
                    obj.options = aggrOptions;
                    obj.selectedValue = selectedOption;
                    if(this.lstComboCols){
                        for(var k = 0; k <= this.lstComboCols.length; k++){
                            if(this.lstComboCols[k] && this.mapCombobox[this.lstComboCols[k]] && this.mapSortColumn[this.mapCombobox[this.lstComboCols[k]]]){
                                obj[this.mapSortColumn[this.mapCombobox[this.lstComboCols[k]]]] = selectedOption;
                            }
                        }
                    }
                    if(selectedOption == result[j][aggrementId]){
                        if(this.price){
                            obj[this.price] = result[j][this.price];
                        }
                        if(this.discount){
                            obj[this.discount] = result[j][this.discount];
                        }
                        if(this.quantity){    
                            obj[this.quantity] = result[j][this.quantity];
                        }
                        var rangeValues = this.mapProdAgreeRangeArr[productId+''+result[i][aggrementId]];
                        var mapRangePrice = this.mapProdAgreeRange[productId+''+result[i][aggrementId]];
                        for(var k = 0; k < rangeValues.length; k++){
                            if(rangeValues[k] <= obj[this.quantity]){
                                obj[this.price] = mapRangePrice[rangeValues[k]];
                            }
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
            }
            if(this.netPrice && obj[this.netPrice]){
                this.totalNetPrice = Number(this.totalNetPrice) + Number(obj[this.netPrice]);
            }
            dataArray.push(obj);
        }
        this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
        this.productData = dataArray;
        this.initialRecords = this.productData;
    }    

    handleproductselected(event){
        console.log('hi');
        const {selectedRecord, rowId, fieldapi, recordname, recordfieldAPI, addfieldVal, addcol} = event.detail;
        console.log(JSON.stringify(event.detail));
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
         console.log('dataArray'+dataArray);
        this.productData = dataArray;
        this.initialRecords = this.productData;
    }

    toggleInput() {
        this.showInput = !this.showInput;
    }

    handleNumRowsChange(event) {
        this.numRows = event.target.value;
        console.log('User input'+this.numrows);
       // this.addRows(event);
    }


    // addRows() {
    //     var uploadedData = [];
    //     for (let i = 1; i <= this.numRows; i++) {
    //         var rowData = {"recordId": this.rowIndex};
    //         uploadedData.push(rowData);
    //         this.rowIndex++;
    //     }
    //     this.productData = this.productData ? this.productData : [];
    //     this.productData = this.productData.concat(uploadedData);
    //     console.log('after concat----'+this.productData);
    //     this.initialRecords = this.productData;
    // }

    handledropdownselected(event){
        const {selectedRecord, rowId, discount, quantity} = event.detail;
        var dataArray = [];
        this.totalNetPrice = 0;
        for(var i = 0; i < this.productData.length; i++){
            var obj = {...this.productData[i]};
            if(obj.recordId == rowId){
                obj.selectedValue = selectedRecord;
                if(this.lstComboCols){
                    for(var j = 0; j <= this.lstComboCols.length; j++){
                        if(this.lstComboCols[j] && this.mapCombobox[this.lstComboCols[j]] && this.mapSortColumn[this.mapCombobox[this.lstComboCols[j]]]){
                            obj[this.mapSortColumn[this.mapCombobox[this.lstComboCols[j]]]] = selectedRecord;
                        }
                    }
                }
                if(this.keyField && obj[this.keyField] && this.mapProductPricing){
                    var productPrising = this.mapProductPricing.get(obj[this.keyField]);
                }
                if(productPrising && productPrising.length > 0){
                    for(var j = 0; j < productPrising.length; j++){
                        if(productPrising[j].aggrementId == selectedRecord){
                            if(this.price){
                                obj[this.price] = productPrising[j][this.price];
                            }
                            if(discount){
                                obj[discount] = productPrising[j][discount];
                            }
                            if(quantity){
                                obj[quantity] = productPrising[j][quantity];
                            }
                            if(obj[this.price] && obj[this.quantity] && this.listPrice){
                                obj[this.listPrice] = obj[this.price] * obj[this.quantity];
                            }
                            if(this.price && this.quantity && obj.listPrice && obj[this.discount] && this.listPrice && this.netPrice){
                                obj[this.netPrice] = obj[this.listPrice] - ((obj[this.listPrice] * obj[this.discount]) / 100);
                            } else if(this.listPrice && this.netPrice){
                                obj[this.netPrice] = obj[this.listPrice];
                            }
                        }
                    }
                }
            }
            if(this.netPrice && obj[this.netPrice]){
                this.totalNetPrice = Number(this.totalNetPrice) + Number(obj[this.netPrice]);
            }
            this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
            dataArray.push(obj);
        }
        this.productData = dataArray;
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
        console.log(actionName);
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
        console.log(JSON.stringify(initialArray));
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
            console.log(actionName);
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
onRowSelection( event ) {
const selectedRows = event.detail.selectedRows;
console.log('selectedRows', JSON.stringify(selectedRows));
const updatedItems = [...selectedRows];
console.log('updatedItems', JSON.stringify(updatedItems));
const loadedItems = [...this.productData];
console.log('loadedItems', JSON.stringify(loadedItems));
const selectedItems = new Set(this.selectedrows);
updatedItems.forEach(item => selectedItems.add(item));
console.log('selectedItems after adding', JSON.stringify(Array.from(selectedItems)));
loadedItems.forEach(item => {
    if (selectedItems.has(item) && !updatedItems.includes(item)) {
        selectedItems.delete(item);
    }
});
const selectedIds = Array.from(selectedItems).map(item => item.productId);
console.log('selectedIds', JSON.stringify(selectedIds));
this.selectedids = selectedIds;
this.selectedrows = [...selectedRows];

    }
    cloneProducts(){
      this.recnumbers=0;
        data.push(...this.selectedrows);
        console.log(
            'data are ',
            JSON.stringify(data)
        );
        let index = 1;
let productDataWithIndex = data.map((record, i, arr) => {
    const duplicateCount = arr.filter(item => item.recordIndex === record.recordIndex).length;
    if (duplicateCount > 1) {
        // return { ...record, recordIndex: `${record.productId}_${index++}` };
        return { ...record, recordIndex: index++ };
    } else {
        return { ...record, recordIndex: index++ };
    }
});
console.log(
            'yyyy  ',
            JSON.stringify(productDataWithIndex)
        );
        this.productData=[...productDataWithIndex];
console.log(
            'yyyy  ',
            JSON.stringify(  this.productData )
        );
        this.selectedrows=[];
        console.log(this.selectedrows+'this.clone');
    }
    deleterecords(){
        this.productData =this.productData.filter(record =>!this.selectedrows.includes(record));  
       
        console.log(
            'productData delete 1 ',
            JSON.stringify(  this.productData )
        );
        this.selectedrows=[];
        console.log(this.selectedrows+'this.delete');
    }
    // handleAddToCart(){
    //     this.showLoader = true;
    //     addProductsToCart({ recId : this.recId,scopeObjectLst: JSON.stringify(this.productData)})
    //     .then(result => {
    //         const selectedEvent = new CustomEvent('addedtocart', {
    //             bubbles: true, composed: true
    //         });
    //         this.dispatchEvent(selectedEvent);
    //         this.productData = []; 
    //         this.totalNetPrice = 0;
    //         this.showLoader = false;
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Success!!',
    //                 message: 'Added to cart Successfully!!!',
    //                 variant: 'success',
    //             }),
    //         );
    //     })
    //     .catch(error => {
    //         this.error = error;
    //     })
    // }

    // handleBackToCart(){
    //     backToCart({recId : this.recId})
    //     .then(result => {
    //         console.log(result);
    //         this.backToCartUrl = result;
    //         console.log(this.backToCartUrl);
    //         this[NavigationMixin.Navigate]({
    //         "type": "standard__webPage",
    //         "attributes": {
    //             "url": this.backToCartUrl
    //         }
    //     });
    //     })
    //     .catch(error => {
    //         this.error = error;
    //     })
    // }

    closeFilterModal(){
        this.isOpenFilterInput = false;
        this.filterAppliedValue = '';
    }

    renderedCallback() {
        const realWidth = window.screen.width;
        const realHeight = window.screen.height;
        const screenResolution = realWidth + '*' + realHeight;
        console.log(screenResolution);
    //     var tableHeight = 'height: 20.5rem;';
    //     if (screenResolution == '2561*1440') {
    //         tableHeight = 'height: 100rem;';
    //     }

    //    else if (screenResolution == '1366*768') {
    //         tableHeight = 'height: 22rem;';
    //     }
    //     else if (screenResolution == '1536*864') {
    //         tableHeight = 'height: 26rem;';
    //     }
    //     else if (screenResolution == '1280*720') {
    //         tableHeight = 'height: 17.8rem;';
    //     }
    //      else if (screenResolution == '1620*1080') {
    //         tableHeight = 'height: 35rem;';
    //     }
        //tableHeight='height: '+(window.screen.height/32)+'rem;';

        if(this.template.querySelector('.divDataTable')){
            // let style5 = document.createElement('style');
            // style5.innerText = '.divDataTable .dt-outer-container .slds-table_header-fixed_container .slds-scrollable_y {'+tableHeight+'}';
            // this.template.querySelector('.divDataTable').appendChild(style5);

            let style1 = document.createElement('style');
            style1.innerText = '.slds-is-absolute {position: fixed;}';
            this.template.querySelector('.divDataTable').appendChild(style1);

            let style2 = document.createElement('style');
            style2.innerText = '.slds-button_icon.slds-input__icon {z-index: 0;}';
            this.template.querySelector('.divDataTable').appendChild(style2);

            let style3 = document.createElement('style');
            style3.innerText = '.slds-input__icon.slds-icon-utility-down {z-index: 0;}';
            this.template.querySelector('.divDataTable').appendChild(style3);

            let style = document.createElement('style');
            style.innerText = '.slds-truncate {overflow: visible;}';
            this.template.querySelector('.divDataTable').appendChild(style);

            let style4 = document.createElement('style');
            style4.innerText = '.divDataTable lightning-button-icon:nth-child(2) .slds-button_icon svg {width: 1.5rem;height: 1.5rem;}';
            this.template.querySelector('.divDataTable').appendChild(style4);
        }
        if(!this.componentLoaded){
            this.applyStyles();
            
            if(this.template.querySelector('.inputbox-1')){
                const style1 = document.createElement('style');
                style1.innerText = '.inputbox-1 .slds-form-element__control .slds-input {border-top-right-radius: 0px; border-bottom-right-radius: 0px; }';
                this.template.querySelector('.inputbox-1').appendChild(style1);
            }
            if(this.template.querySelector('.button_radius')){
                const style1 = document.createElement('style');
                style1.innerText = '.button_radius .slds-button {border-top-left-radius: 0px; border-bottom-left-radius: 0px; padding-left: 7px; padding-right: 7px !important; padding-right:0px; }';
                this.template.querySelector('.button_radius').appendChild(style1);
            }
            if(this.template.querySelector('.divDataTable')){
                const style1 = document.createElement('style');
                style1.innerText = '.divDataTable .dt-outer-container .slds-table_header-fixed_container {background-color : white}';
                this.template.querySelector('.divDataTable').appendChild(style1);
            }
            this.componentLoaded = true;
        }
    }

    applyStyles(){
        if(this.template.querySelector('.divDataTable')){
            let style3 = document.createElement('style');
            style3.innerText = '.slds-icon_container.slds-combobox__input-entity-icon {z-index: 0;}';
            this.template.querySelector('.divDataTable').appendChild(style3);

            let style4 = document.createElement('style');
            style4.innerText = '.slds-input__icon_right.slds-icon-utility-search {z-index: 0;}';
            this.template.querySelector('.divDataTable').appendChild(style4);
        }
    }
}