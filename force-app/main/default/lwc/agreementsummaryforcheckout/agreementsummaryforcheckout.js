import { LightningElement, api, track, wire } from 'lwc';
import getColumns from '@salesforce/apex/ProductController.getColumns';
import getPricingColumn from '@salesforce/apex/ProductController.getSettingsinfo';
import getCurrencySymbol from '@salesforce/apex/UtilityController.getCurrencySymbol';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from 'lightning/navigation';
import LightningConfirm from 'lightning/confirm';
import getButtonsAction from '@salesforce/apex/ProductController.getButtonsAction';

export default class Agreementsummaryforcheckout extends LightningElement {
    @track selectedrows=[];
    @track selectedids='';
    @track columns;
    @api initialRecords=[{"recordId":1,"productId":"01tao0000000l0gAAA","productName":"SLA: Bronze","nationalId":"SL9020","options":[{"label":"TestAgreement7","value":"a02ao000000PlS4AAK","description":"1017"},{"label":"TestAgreement9","value":"a02ao000000PlS6AAK","description":"1019"},{"label":"TestAgreement8","value":"a02ao000000PlS5AAK","description":"1018"}],"selectedValue":"","price":90,"discount":45,"quantity":16,"listPrice":1440,"netPrice":792,"recordIndex":1}];
    @track sortBy;
    @track sortDirection = 'asc';
    @track isModalOpen = false;
    @track totalNetPrice = 0;
    @api index=2;
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
    @track isInlinepopup=false;
    @track flatdiscount=false;
    @track Volumediscount=false;
    @track keyIndex=0;
     @track itemList = [
            {
                id: 0
            }
        ];
    
    @api recordId;
    //@api productData=[{"recordId":1,"productId":"01tao0000000l0gAAA","productName":"SLA: Bronze","nationalId":"SL9020","options":[{"label":"TestAgreement7","value":"a02ao000000PlS4AAK","description":"1017"},{"label":"TestAgreement9","value":"a02ao000000PlS6AAK","description":"1019"},{"label":"TestAgreement8","value":"a02ao000000PlS5AAK","description":"1018"}],"selectedValue":"","price":90,"discount":45,"quantity":16,"listPrice":1440,"netPrice":792,"recordIndex":1}];
    @api productData;
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
    @track inlineEditCol=[];
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
    @api initialData=[{"recordId":1,"productId":"01tao0000000l0gAAA","productName":"SLA: Bronze","nationalId":"SL9020","options":[{"label":"TestAgreement7","value":"a02ao000000PlS4AAK","description":"1017"},{"label":"TestAgreement9","value":"a02ao000000PlS6AAK","description":"1019"},{"label":"TestAgreement8","value":"a02ao000000PlS5AAK","description":"1018"}],"selectedValue":"","price":90,"discount":45,"quantity":16,"listPrice":1440,"netPrice":792,"recordIndex":1}];
    @track fieldinlineAPIs=[];
    @track inlinerecordindex='';
    @track buttondata=[];
    
    get discountOption() {
        let options = [
            { label: "Discount Percent", value: "Percent" },
            { label: "Discount Amount", value: "Amount" }
        ];
    
    
        return options;
    }
    
    get typeOptions() {
        let options = [
            { label: "Flat", value: "Flat" },
            { label: "Volume", value: "Volume" }
        ];
    
    
        return options;
    }
      addRow() {
            ++this.keyIndex;
            let newItem = { id: this.keyIndex };
            this.itemList.push(newItem);
        }
    
        removeRow(event) {
           var rowIndex = event.currentTarget.dataset.index;
            if(this.itemList.length > 1) {
                this.itemList.splice(rowIndex, 1);
            } 
        }
    @wire(getPricingColumn, { fieldLabel: 'Pricing_Column' }) wiredPricingColumn(result){
        this.dataLoading=true;
        if (result.data) {
            this.priceField = result.data;
            this.dataLoading=false;
            //this.loadFastOrderData();
    
        } else if (result.error) {
            console.log(result.error);
        }
    }
    
    
    connectedCallback() {
        this.getUserCurrencySymbol();
    
      
        console.log('from Product summar11y >> '+JSON.stringify(this.productdatawithindex));
        
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
    
    @wire(getColumns, { columnData: 'agreementpriceproduct' }) wiredColumns({data, error}){
        if (data) {
            console.log('jj product data is :',this.productData);
            this.columns = JSON.parse(data.Column_JSON__c);
            console.log(JSON.stringify(this.columns+'columns'));
            for(var i = 0; i < this.columns.length; i++){
                this.fieldinlineAPIs.push(this.columns[i].fieldName);
                if(this.columns[i].editable == true || this.columns[i].editable == 'true'){
                    this.fieldAPIs.push(this.columns[i].fieldName);
                    if(this.columns[i].type == 'number' || this.columns[i].type == 'percent' || this.columns[i].type == 'currency'){
                        this.fieldsAPINumCurr.push(this.columns[i].fieldName);
                    }
                    if(this.columns[i].typeAttributes && this.columns[i].fieldName == 'productName'){
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
                            massColObj.reqDropdown = this.columns[i].typeAttributes.reqDropdown == 'true' ? true : false;
                                massColObj.label = this.columns[i].typeAttributes.reqDropdown == 'true' ? 'Discount Value' : this.columns[i].label;
                            massColObj.selectedDropdownValue = '';
                            massColObj.discountoption='';
                            massColObj.inputValue = '';
                        }
                        this.massColumnUpdates.push(massColObj);
                    }
                }
                    if(this.columns[i].typeAttributes && (this.columns[i].typeAttributes.inline == 'true'|| this.columns[i].typeAttributes.inline)){
                        var inlinecol = {};
                            inlinecol.type = this.columns[i].type;
                        inlinecol.fieldName = this.columns[i].fieldName;
                        if(this.columns[i].type == 'customName'){
                            inlinecol.lookup = true;
                            inlinecol.objname = this.columns[i].typeAttributes.objname;
                            inlinecol.fieldLookupName = this.columns[i].typeAttributes.fieldLookupName;
                            // this.fieldLookupName = this.columns[i].typeAttributes.fieldLookupName;
                            this.addfield = this.columns[i].typeAttributes.addfield;
                        } else if(this.columns[i].type == 'customCombox'){
                            inlinecol.combobox = true;
                            inlinecol.selectedField = this.columns[i].typeAttributes.selectedValue.fieldName;
                        } else {
                            inlinecol.regularType = true;
                            inlinecol.reqDropdown = this.columns[i].typeAttributes.reqDropdown == 'true' ? true : false;
                            inlinecol.label = this.columns[i].typeAttributes.reqDropdown == 'true' ? 'Discount Value' : this.columns[i].label;
                        
                            // inlinecol.label = this.columns[i].fieldName == 'price' ? 'Base Price Override' : this.columns[i].label;
                            inlinecol.selectedDropdownValue = '';
                            inlinecol.discountoption='';
                            inlinecol.inputValue = '';
                        }
                        this.inlineEditCol.push(inlinecol);
    
                    }
                    
                     this[this.columns[i].fieldName] = this.columns[i].fieldName ? this.columns[i].fieldName: '';
                     console.log(  this[this.columns[i].fieldName]  +'  this[this.columns[i].fieldName] ');
                    console.log(JSON.stringify(this.inlineEditCol)+'this.col ');
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
            for(var j = 0; j < this.massColumnUpdates.length; j++){
                this.massColumnUpdates[j].inputValue = '';
                 this.massColumnUpdates[j].selectedDropdownValue = '';
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
            for(var i = 0; i < this.productData.length; i++)
            {
                var obj = {...this.productData[i]};
                for(var l = 0; l < selectedRecords.length; l++){
                    if(selectedRecords[l].recordIndex == obj.recordIndex){
                        var draftObj = {};
                        for(var j = 0; j < this.massColumnUpdates.length; j++){
                              draftObj.recordIndex = obj.recordIndex;
                             console.log(this.massColumnUpdates[j].reqDropdown +'this.massColumnUpdates[j].reqDropdown');
                                        obj.selectedDropdownValue=this.massColumnUpdates[j].selectedDropdownValue;
                                        if(obj.selectedDropdownValue=='Volume'){
                                            const pq=obj[this.quantity];
                                            for(let z=0;z<this.itemList.length;z++){
                                                   console.log(pq +'  pq');
                                                 console.log( this.itemList[z].StartRange +'  this.itemList[z].StartRang');
                                                  console.log( this.itemList[z].EndRange +'  this.itemList[z].EndRange');
                                                   console.log( this.itemList[z].StartRange>=pq +'  this.itemList[z].StartRange>=pq');
                                                  console.log( this.itemList[z].EndRange<= pq+'   this.itemList[z].EndRange<= pq');
                                                if(pq>=this.itemList[z].StartRange && pq<= this.itemList[z].EndRange ){
                                                    draftObj.recordIndex = obj.recordIndex;
                                                    obj[this.StartRange]=this.itemList[z].StartRange;
                                                      obj[this.EndRange]=this.itemList[z].EndRange;
                                                         obj.discountoption=this.itemList[z].discountoption;
                                                            draftObj.discountoption=this.itemList[z].discountoption;
                                                         draftObj[this.StartRange]=this.itemList[z].StartRange;
                                                      draftObj[this.EndRange]=this.itemList[z].EndRange;
                                                    obj[this.discount]=this.itemList[z].Discount;
                                                    draftObj[this.discount]=this.itemList[z].Discount;
                                                     console.log( obj[this.discount] +'  obj[this.discount]');
                                                }
                                               
                                            }
                                             console.log( JSON.stringfy(obj) +'  obj');
                                            }
                                  
                    
                            if(this.massColumnUpdates[j].inputValue){
                             //   draftObj.recordIndex = obj.recordIndex;
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
                                    if(this.massColumnUpdates[j].reqDropdown){
                                        obj.selectedDropdownValue=this.massColumnUpdates[j].selectedDropdownValue;
                                        obj.discountoption=this.massColumnUpdates[j].discountoption;
                                        console.log(obj.discountoption+'obj.discountoption');
                                        console.log(this.massColumnUpdates[j].selectedDropdownValue+'obj.this.massColumnUpdates[j].selectedDropdownValue');
                                    }
                                    obj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                    draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                                }
                            }
                        }
                        editedArray.push(draftObj);
                    }
                }
                this.mapProductData[obj.recordIndex] = obj;
                dataArray.push(obj);
            }
            
                // var obj1 = {...this.productData[i]};
                // if(obj1[this.keyField]){
                //     this.mapProductPricing.set(obj1[this.keyField],obj1[this.lstAggrementPricing]);
                // }
                // if(this.productData[i][this.priceField]){
                //     this.totalNetPrice += this.productData[i][this.priceField];
                // }
            
            
            this.productData = dataArray;
            this.saveDraftValues = editedArray;
            this.itemList = [
            {
                id: 0
            }
        ];
    
            // this.totalNetPrice = this.totalNetPrice.toFixed(2);
            // console.log(' this.totalNetPrice 2 >>');
            // console.log(' this.totalNetPrice 2 >>'+ this.totalNetPrice);
            
        }
        this.closeMassEditPopup();
            this.selectedids=[];
    }
    updateinlineEditPopup(){
        var dataArray = [];
        var editedArray = [];
        this.cancelArray = [...this.productData];
    
        console.log(this.cancelArray+'this.cancelArray');    
        
        if(this.inlinerecordindex){
            for(var i = 0; i < this.productData.length; i++)
            {
                var obj = {...this.productData[i]};
                    if(this.inlinerecordindex == obj.recordIndex){
                        console.log(obj.recordIndex+'obj.recordIndex');
                        console.log(this.inlinerecordindex+'obj.inlinerecordindex');
                        var draftObj = {};
                        for(var j = 0; j < this.inlineEditCol.length; j++){
                            if(this.inlineEditCol[j].reqDropdown){
                                draftObj.recordIndex = obj.recordIndex;
     console.log(this.inlineEditCol[j].reqDropdown +'this.inlineEditCol[j].reqDropdown');
                                        obj.selectedDropdownValue=this.inlineEditCol[j].selectedDropdownValue;
                                        if(obj.selectedDropdownValue=='Volume'){
                                            const pq=obj[this.quantity];
                                            for(let z=0;z<this.itemList.length;z++){
                                                   console.log(pq +'  pq');
                                                 console.log( this.itemList[z].StartRange +'  this.itemList[z].StartRang');
                                                  console.log( this.itemList[z].EndRange +'  this.itemList[z].EndRange');
                                                   console.log( this.itemList[z].StartRange>=pq +'  this.itemList[z].StartRange>=pq');
                                                  console.log( this.itemList[z].EndRange<= pq+'   this.itemList[z].EndRange<= pq');
                                                if(pq>=this.itemList[z].StartRange && pq<= this.itemList[z].EndRange ){
                                                    draftObj.recordIndex = obj.recordIndex;
                                                    obj[this.StartRange]=this.itemList[z].StartRange;
                                                      obj[this.EndRange]=this.itemList[z].EndRange;
                                                         obj.discountoption=this.itemList[z].discountoption;
                                                            draftObj.discountoption=this.itemList[z].discountoption;
                                                         draftObj[this.StartRange]=this.itemList[z].StartRange;
                                                      draftObj[this.EndRange]=this.itemList[z].EndRange;
                                                    obj[this.discount]=this.itemList[z].Discount;
                                                    draftObj[this.discount]=this.itemList[z].Discount;
                                                     console.log( obj[this.discount] +'  obj[this.discount]');
                                                }
                                               
                                            }
                                             console.log( obj +'  obj');
                                            }}
                            if(this.inlineEditCol[j].inputValue){
                                  console.log(this.inlineEditCol[j].inputValue+' this.inlineEditCol[j].inputValue');
                               // draftObj.recordIndex = obj.recordIndex;
                                if(this.inlineEditCol[j].type == 'customName'){
                                    obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                    draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                } else if(this.inlineEditCol[j].type == 'customCombox'){
                                    var hasValue = false;
                                    for(var k = 0; k < obj.options.length; k++){
                                        if(obj.options[k].value == this.inlineEditCol[j].inputValue){
                                            hasValue = true;
                                        }
                                    }
                                    if(hasValue){
                                        obj[this.inlineEditCol[j].selectedField] = this.inlineEditCol[j].inputValue;
                                        draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                    }
                                } else {
                                    if(this.inlineEditCol[j].reqDropdown){
     console.log(this.inlineEditCol[j].reqDropdown +'this.inlineEditCol[j].reqDropdown');
                                        obj.selectedDropdownValue=this.inlineEditCol[j].selectedDropdownValue;
                                        obj.discountoption=this.inlineEditCol[j].discountoption;
                                       
                                        if(obj.selectedDropdownValue == 'PriceOverride'){
                                            obj[this.price] = this.inlineEditCol[j].inputValue;
                                                console.log(this.inlineEditCol[j].inputValue+'this.inlineEditCol[j].inputValue');
                                                    console.log(obj[this.price]+'this.pric');
                                            draftObj[this.price] = this.inlineEditCol[j].inputValue;
                                        } 
                                        
                                       
                                            else {
                                            obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                            draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                        }
                                        console.log(obj.selectedDropdownValue+'obj.selectedDropdownValue');
                                        console.log(this.inlineEditCol[j].selectedDropdownValue+'obj.this.inlineEditCol[j].selectedDropdownValue');
                                    } else {
                                        obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                                    }
                                    
                                        console.log( obj[this.inlineEditCol[j].fieldName]+' obj[this.inlineEditCol[j].fieldName]');
                                        console.log( this.inlineEditCol[j].inputValue+' inputValue');
                                    
                                }
                            }
                        }
                        editedArray.push(draftObj);
                    }
                
                this.mapProductData[obj.recordIndex] = obj;
                dataArray.push(obj);
                console.log(JSON.stringify(dataArray)+ 'dataArray');
                 this.flatdiscount=false;
    this.Volumediscount=false;
            }
            
            
            this.productData = dataArray;
            this.saveDraftValues = editedArray;
            
        }
        this.closeinlineEditPopup();
            this.selectedids=[];
            this.itemList = [
            {
                id: 0
            }
        ];
            
    
    }
        async onReset() {
            //this.productData = this.orderdata['selectedRecord'];
        const result = await LightningConfirm.open({
            message: 'Do you want undo discounts applied',
            variant: 'header',
            theme: 'gray',
            label: 'Undo Data',
        });
        if(result==true){
            this.handleConfirmClick(); 
        }
    }
    handleConfirmClick(){
    this.productData=this.initialData;
    this.initialRecords=this.initialData;
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
                this.initialRecords=this.productData;
        }
    }
    
    handleCancel(){
        if(this.cancelArray.length > 0){
            this.productData = this.cancelArray;
            this.cancelArray = [];
        }
    }
    
    handleInputType(event){
        if(this.isInlinepopup==true){
    for(var j = 0; j < this.inlineEditCol.length; j++){
    
            if(this.inlineEditCol[j].fieldName == event.target.fieldName){
                this.inlineEditCol[j].inputValue = this.inlineEditCol[j].type == 'customName' ? event.detail.recordId : event.detail.value;
            }
            else if( this.inlineEditCol[j].reqDropdown == true){
                if(event.target.fieldName == "DiscountType"){
                this.inlineEditCol[j].selectedDropdownValue = event.detail.value;
                if(event.detail.value=='Flat'){
                    this.flatdiscount=true;
                    this.Volumediscount=false;
                }
                else{
                    this.Volumediscount=true;
                     this.flatdiscount=false;
                }}
                else if(event.target.fieldName == "Type"){
                     this.inlineEditCol[j].discountoption = event.detail.value;
    
                }
             
            }
            
        }
        console.log(JSON.stringify(this.inlineEditCol)+'inline');
        }
        else{
        for(var j = 0; j < this.massColumnUpdates.length; j++){
            if(this.massColumnUpdates[j].fieldName == event.target.fieldName){
                this.massColumnUpdates[j].inputValue = this.massColumnUpdates[j].type == 'customName' ? event.detail.recordId : event.detail.value;
            }
               else if( this.massColumnUpdates[j].reqDropdown == true){
                if(event.target.fieldName == "DiscountType"){
                this.massColumnUpdates[j].selectedDropdownValue = event.detail.value;
                if(event.detail.value=='Flat'){
                    this.flatdiscount=true;
                    this.Volumediscount=false;
                }
                else{
                    this.Volumediscount=true;
                     this.flatdiscount=false;
                }}
                else if(event.target.fieldName == "Type"){
                     this.massColumnUpdates[j].discountoption = event.detail.value;
    
                }
             
            }
        
        }
        console.log(JSON.stringify(this.massColumnUpdates));
    }
    }
    closeMassEditPopup(){
        this.selectedids=[];
        this.isMassEditPopup = false;
        this.flatdiscount=false;
    this.Volumediscount=false;
    this.itemList = [
            {
                id: 0
            }
        ];
    }
    handleInputType1(event) {
        console.log(event.target.value + ' (event.target.value)');
        console.log(event.currentTarget.dataset.index + ' ([event.currentTarget.dataset.index)');
        console.log(event.target.fieldName + ' (event.target.fieldName)');
    
        const index = event.currentTarget.dataset.index;
    
        if (this.itemList[index]) {
            const item=this.itemList[index];
            console.log(JSON.stringify(item)+ 'item');
            if (event.target.fieldName === 'StartRange') {
                item.StartRange = event.target.value;
            } else if (event.target.fieldName === 'EndRange') {
                item.EndRange = event.target.value;
            } else if (event.target.fieldName === 'Discount') {
                item.Discount = event.target.value;
            } else if (event.target.fieldName === 'Type') {
                item.discountoption = event.target.value;
            }
            this.itemList[index]=item;
              console.log(JSON.stringify(item) + ' item');
            console.log(JSON.stringify(this.itemList) + ' this.item');
        } else {
            console.error("Item not found at index:", index);
        }
    }
    
    
    // handleInputType1(event){
    //     console.log(event.target.value+' (event.target.value)');
    //     console.log(event.currentTarget.dataset.index+' ([event.currentTarget.dataset.index)');
    //     console.log(event.target.fieldName+' (event.target.fieldName)');
    //         if(event.target.fieldName=='StartRange'){
       
    //            this.itemList[event.currentTarget.dataset.index].StartRange = event.target.value;
    //     }else if(event.target.fieldName=='EndRange'){
    //  this.itemList[event.currentTarget.dataset.index].EndRange = event.target.value;
    //     }else if(event.target.fieldName=='Discount'){
    //  this.itemList[event.currentTarget.dataset.index].Discount = event.target.value;
    //     }else if(event.target.fieldName=='Type'){
    //  this.itemList[event.currentTarget.dataset.index].discountoption = event.target.value;
    //     }
    //     console.log(JSON.stringify(this.itemList)+ 'this.item');
    // }
    
    handleButtonActions(event){
            console.log(event.target.label);
        console.log(JSON.stringify(this.productData));
        const prodids = this.productData.map(item => item.productId);
    
            console.log(JSON.stringify(prodids)+prodids);
        getButtonsAction({buttonLabel : event.target.label,productData : prodids})
        .then(result => {
            console.log('Buttons'+JSON.stringify(result));
            var dataArray = [];
            for(var i = 0; i < this.productData.length; i++){
                var obj = {...this.productData[i]}   
                console.log(obj.productId);  
                console.log(result[obj.productId]);               
                obj.atpcol = result[obj.productId];
                dataArray.push(obj);
            }
            this.productData = dataArray;
        })
        .catch(error => {
            this.error = error;
        })
    }
    
    
    handleSave(event){
            
        this.saveDraftValues = event.detail.draftValues;
        var dataArray = [];
        this.totalNetPrice = 0;
        for(var i = 0; i < this.productData.length; i++){
            var obj = {...this.productData[i]};
            console.log(JSON.stringify(obj)+ 'obj');
            console.log(JSON.stringify( this.saveDraftValues)+ ' this.saveDraftValues');
            for(var j = 0; j < this.saveDraftValues.length; j++){
                if(this.productData[i].recordIndex == this.saveDraftValues[j].recordIndex){
                        console.log(this.productData[i].recordIndex+ '658');
                    for(var k = 0; k < this.fieldinlineAPIs.length; k++){
                        console.log(this.fieldinlineAPIs[k] +'this.fieldinlineAPIs[k]');
                        console.log(this.saveDraftValues[j][this.fieldinlineAPIs[k]] +'this.saveDraftValues[j][this.fieldinlineAPIs[k]].fieldinlineAPIs[k]');
                        if(this.saveDraftValues[j][this.fieldinlineAPIs[k]]){
                            if(this.fieldinlineAPIs[k] == 'aggrementVal'){
                                obj.selectedValue = this.saveDraftValues[j][this.fieldinlineAPIs[k]];
                            } else {
                                obj[this.fieldinlineAPIs[k]] = this.saveDraftValues[j][this.fieldinlineAPIs[k]];
                            }
                                console.log( this.fieldinlineAPIs[k]+ '667');
                                console.log(this.discount+ '668this.discount');
                            if(this.fieldinlineAPIs[k] == this.quantity || this.fieldinlineAPIs[k] == this.discount ||  this.fieldinlineAPIs[k] == this.price){
                                // console.log(this.quantity+ '667');
                                // console.log(rangeValues+ '668');
                                // var rangeValues = this.mapProdAgreeRangeArr[obj.productId+''+obj.selectedValue];
                                //  console.log(this.discount+ 'rangeValues');
                                // var mapRangePrice = this.mapProdAgreeRange[obj.productId+''+obj.selectedValue];
                                //  console.log(mapRangePrice+ 'mapRangePrice');
                                // for(var k = 0; k < rangeValues.length; k++){
                                //     if(rangeValues[k] <= this.saveDraftValues[j][this.quantity]){
                                //         obj[this.price] = mapRangePrice[rangeValues[k]];
                                //     }
                                // }
                                        console.log( this.price+'pricesave');
                                            console.log(this.quantity+'this.quantity');
                                                console.log(obj[this.price]+'obj[this.price]');
                                                    console.log(obj[this.quantity]+'obj[this.quantity]');
                                                    console.log(this.listPrice+'listPrice');
                                if(this.price && this.quantity && obj[this.price] && obj[this.quantity] && this.listPrice){
                                    obj[this.listPrice] = obj[this.price] * obj[this.quantity];
                                
                                }
                                if(this.netPrice && this.listPrice && obj[this.discount] && obj[this.listPrice]){
                                        console.log(JSON.stringify(obj)+ 'insiedobj');
                                    console.log(obj.discountoption+'handle saveobj.selectedDropdownValue');
                                    if(obj.discountoption=='Amount'){
                                        obj[this.netPrice] = obj[this.listPrice]-obj[this.discount];
                                    }else{
                                        obj[this.netPrice] = obj[this.listPrice] - ((obj[this.listPrice] * obj[this.discount]) / 100);
                                    } 
                                }else if(this.listPrice && this.netPrice){
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
            
            this.mapProductData[obj.recordIndex] = obj;
            dataArray.push(obj);
        }
        this.productData = dataArray;
    //         const initrec = dataArray.map(updatedRecord => {
    //     const index = this.initialRecords.findIndex(record => record.recordIndex === updatedRecord.recordIndex);
    //     if (index == -1) {
    //         return updatedRecord;
    //     } else {
    //         return this.initialRecords[index];
    //     }
    // });
    // this.initialRecords=initrec;
    
    //  console.log(' initrec >>'+ JSON.stringify(initrec));
    //  console.log(' initialRecords >>'+ JSON.stringify(this.initialRecords));
            console.log(' this.totalNetPrice oonsave  >>'+ this.totalNetPrice);
            const netPriceEvent = new CustomEvent('totalnetprice', {
            detail: this.totalNetPrice, bubbles: true, composed: true
        });
        this.dispatchEvent(netPriceEvent);
        this.saveDraftValues = [];
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!!',
                message: 'Saved Successfully!!!',
                variant: 'success',
            }),
        );
        console.log(this.selectedids+'[cc]');
            this.selectedids=[];
            console.log(this.selectedids+'[]');
        
    }
    
    onrowaction(event) {
        const id = event.detail.index;
        this.totalNetPrice = 0;
    
        if(event.detail.name=='Discounts'){
            this.isInlinepopup=true;
               this.inlinerecordindex=event.detail.index;
            for(var j = 0; j < this.inlineEditCol.length; j++){
                this.inlineEditCol[j].inputValue = '';
                this.inlineEditCol[j].selectedDropdownValue = '';
            }
        }
    }
    closeinlineEditPopup(){
        this.isInlinepopup=false;
          this.flatdiscount=false;
    this.Volumediscount=false;
    this.itemList = [
            {
                id: 0
            }
        ];
    }
    
    
    toggleInput() {
        this.showInput = !this.showInput;
    }
    
    handleNumRowsChange(event) {
        this.numRows = event.target.value;
        console.log('User input'+this.numrows);
        
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
            obj = this.mapProductData[obj.recordIndex] ? this.mapProductData[obj.recordIndex] : obj;
            initialArray.push(obj);
        }
        console.log(JSON.stringify(initialArray));
        this.initialRecords = initialArray;
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
         this.selectedrows =  event.detail.selectedRows;
    // const selectedRows = event.detail.selectedRows;
    // console.log('selectedRows', JSON.stringify(selectedRows));
    
    // const updatedItems = [...selectedRows];
    // console.log('updatedItems', JSON.stringify(updatedItems));
    
    // const loadedItems = new Set(this.productData);
    // console.log('loadedItems', JSON.stringify([...loadedItems]));
    
    // const selectedItems = new Set(this.selectedrows);
    // console.log('selectedItems', JSON.stringify([...selectedItems]));
    
    // updatedItems.forEach(item => {
    //     if (!Array.from(selectedItems).some(existingItem => existingItem.recordIndex === item.recordIndex)) {
    //         selectedItems.add(item);
    //     }
    // });
    
    // console.log('selectedItems after adding', JSON.stringify(Array.from(selectedItems)));
    
    // Array.from(selectedItems).forEach(item => {
    //     if (selectedItems.has(item) && !updatedItems.some(updatedItem => updatedItem.recordIndex === item.recordIndex)) {
    //         selectedItems.delete(item);
    //     }
    // });
    
    // console.log('selectedItems after deleting', JSON.stringify(Array.from(selectedItems)));
    
    // const selectedIds = Array.from(selectedItems).map(item => item.recordIndex);
    // console.log('selectedIds', JSON.stringify(selectedIds));
    
    // this.selectedids = selectedIds;
    // this.selectedrows = [...selectedRows];
    
        }
    cloneProducts(){
       console.log('selectedrec');
       var selectedRecords =  this.template.querySelector("c-custom-type-datatable").getSelectedRows();
       console.log(selectedRecords+'selectedrec');
        this.selectedrows=selectedRecords;
        const selectedIds = Array.from(selectedRecords).map(item => item.recordIndex);
        this.selectedids = selectedIds;
    
    const productDataWithIndex = this.selectedrows.map((record, i) => {
    return { ...record, recordIndex: this.index++ };
    });
    
    const cloningdata = [...this.productData];
    cloningdata.push(...productDataWithIndex);
    this.productData = cloningdata;
    const initalrec=[...this.initialRecords];
    initalrec.push(...productDataWithIndex);
    this.initialRecords=initalrec;
    console.log(JSON.stringify(this.initialRecords)+'this.intial');
    console.log(JSON.stringify(productDataWithIndex)+'productDataWithIndex.intial');
    
    console.log(this.selectedids);
    
    this.selectedrows = [];
    this.selectedids = [];
    
    
    
        
    }
    deleterecords(){
        var selectedRecords =  this.template.querySelector("c-custom-type-datatable").getSelectedRows();
        this.selectedrows=selectedRecords;
        const selectedIds = Array.from(selectedRecords).map(item => item.recordIndex);
        this.selectedids = selectedIds;
        this.productData = this.productData.filter(record => {
        return !this.selectedrows.some(selected => selected.recordIndex === record.recordIndex);
        });
        this.initialRecords = this.initialRecords.filter(record => {
        return !this.selectedrows.some(selected => selected.recordIndex === record.recordIndex);
        });
        this.totalNetPrice = 0;
        for(var i = 0; i < this.productData.length; i++){
        if(this.productData[i].recordIndex){
        if(this.productData[i][this.priceField]){
            this.totalNetPrice = Number(this.totalNetPrice) + Number(this.productData[i][this.priceField]);
        }
        }
        }
        this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0; 
        const netPriceEvent = new CustomEvent('totalnetprice', {
        detail: this.totalNetPrice, bubbles: true, composed: true
        });
        this.dispatchEvent(netPriceEvent);
        
    }
    
    closeFilterModal(){
        this.isOpenFilterInput = false;
        this.filterAppliedValue = '';
    }
    
    renderedCallback() {
        const realWidth = window.screen.width;
        const realHeight = window.screen.height;
        const screenResolution = realWidth + '*' + realHeight;
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