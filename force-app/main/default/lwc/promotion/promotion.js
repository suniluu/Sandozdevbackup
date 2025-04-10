import { LightningElement, track,wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createPromoRecord from '@salesforce/apex/ProductController.createPromoRecord';
import getPromotionJsonData from '@salesforce/apex/ProductController.getPromotionJsonData';
import getProducts from '@salesforce/apex/ProductController.getProductsList';
import getAgreementLineItemFields from '@salesforce/apex/ProductController.getAgreementLineItemFields';
import getSObjectFields from '@salesforce/apex/ProductController.getSObjectFields';
import { getPicklistValues, getObjectInfo } from "lightning/uiObjectInfoApi";
import { CurrentPageReference } from 'lightning/navigation';
import LightningConfirm from "lightning/confirm";

import PROMOTION_OBJ from "@salesforce/schema/Promotions__c";
import RANGE_OBJ from "@salesforce/schema/Range__c";
import TYPE_PICKLIST from "@salesforce/schema/Promotions__c.Type__c";
import RATE_TYPE_PICKLIST from "@salesforce/schema/Promotions__c.Rate_Type__c";
import ADJUSTMENT_TYPE_PICKLIST from "@salesforce/schema/Promotions__c.Adjustment_Type__c";
import ADJUSTMENT_APPLY_PICKLIST from "@salesforce/schema/Promotions__c.Adjustment_Applies_To__c";
import UOM_PICKLIST from "@salesforce/schema/Range__c.UOM__c";
import RANGE_ADJUSTMENT_TYPE_PICKLIST from "@salesforce/schema/Range__c.Adjustment_Type__c";

const objectAPIName='Agreement_Line_Item__c';
const objectTYPE='REFERENCE';
const ALLPRODUCTSLABEL = 'All Products';
const PRODUCTFAMILYLABEL = 'Product Family';
const PRODUCTSLABEL = 'Products';
const SINGLETIER ='Single Rate';
const NOTIERRATE = 'Rate Table - No Tiers';
const WITHTIERRATE = 'Rate Table - With Tiers';
const ADJUSTMENTAPPLYTO = 'AdjusmentApplyTo';
const UOM = 'UOM';

//Functions of 1st Tab - 369
//Functions Of 2nd Tab - 414
//Functions of 3rd Tab - 466
//Functions of 4th Tab - 547
//Functions Before Saving the Whole Component - 692

export default class CreatePromo extends NavigationMixin(LightningElement) {
    @track Name = '';
    @track Active = false;
    @track IncludeOtherPromo = false;
    @track EffectiveDate = '';
    @track ExpirationDate = '';
    @track promoType = '';
    @track adjustmentAmount ;
    @track products = [];
    @track conditionalValue = 1;
    @track agreementFieldOptions = [];
    @track selectedValue = '';
    @track conditionOptions=[];
    @track showDropdown=false;
    @track objectName=objectAPIName;
    @track withtiersAdjustment = false;
    @track noTiersAdjustment =false;
    @track showAdjustmentType= false;
    @track forTrueStatement=true;
    @track forFalseStatement=false;
    @track isIncludeDelete = false;
    @track isExcludeDelete = false;
    @track isEdit=false;
    @track isSpinner=false;
	
	@track rateType; 
    @track adjustmentType; 
    @track adjustmentAppliesTo;
    @track adjustmentTo;
    @track currentStep = 'step1';
    @track UOMOptions=[];
    @track adjustmentTypeOptions = [];
    @track rangeAdjustmentTypeOptions =[];
    @track adjustmentAppliesToOptions = [];
    @track multipleSelectValues=[];
	@track rateTypeOptions = [];
    @track TypeOptions = [];
    @track rangeRows = [{ id: 1,rangeColumns:[],minValue:null,maxValue:null,tiersAdjustmentType: '',tiersAdjustmentAmount: null}];
    @track rows = [{ id: 1, field: '', operator: '', value: '' ,isreferenced: false,objectApiName:'',criteriaValue:'',criteriaLabel:''}];
    @track includedData = [{ id: 1, criteriaGroup: ALLPRODUCTSLABEL, selections: '' }];
    @track excludedData = [{id: 1, criteriaGroup: '', selections: ''}];
    
    allFieldLabelObject =[
        {Label:'Name',value:this.Name},
        {Label:'Type',value:this.promoType},
        {Label:'Active',value:this.Active},
        {Label:'Include with other promotions',value:this.IncludeOtherPromo},
        {Label:'Effective Date',value:this.EffectiveDate},
        {Label:'Expiration Date',value:this.ExpirationDate},
        {Label:'Adjustment Type',value:this.adjustmentType},
        {Label:'Adjustment Amount',value:this.adjustmentAmount},
        {Label:'Adjustment Applies To',value:this.adjustmentAppliesTo},
        {Label:'Rate Type',value:this.rateType},
    ];
    selectedProductCodes  = [];
    selectedProductFamilyCodes = [];
    excludedProductCodes = [];
    excludedProductFamilyCodes = [];
    wholePromoInfoData=[];
    wholePromoRangeRowsData=[];

    @api recordId;
    currentPageReference = null; 

    get isStep1() {
        return this.currentStep === 'step1';
    }
    get isStep2() {
        return this.currentStep === 'step2';
    }
    get isStep3() {
        return this.currentStep === 'step3';
    }
    get isStep4() {
        return this.currentStep === 'step4';
    }

    operatorOptions = [
        { label: 'Equals', value: '=' },
        { label: 'Greater Than', value: '>' },
        { label: 'Less Than', value: '<' },
        { label: 'Not Equals', value: '!=' },
        { label: 'In', value: 'IN' },
    ];
	
	@wire(getProducts,{filterString:''})
    wiredProducts({ data, error }) {
        if (data) {
            this.products = data.map(product => ({
                label: product.Name,
                value: product.ProductCode,
            }));
            this.selectedProductCodes = ['All'];
        } else if (error) {
            console.error('Error fetching Products:', error);
        }
    }
    
    @wire(getAgreementLineItemFields)
    wiredFields({ error, data }) {
        if (data) {
            this.agreementFieldOptions = data.map(field => ({ 
                label: field.label, 
                value: field.fieldName, 
                type: field.fieldtype,
                referValue:field.referenceValue
            }));
            this.baseOptions = this.conditionOptions = this.agreementFieldOptions.map(option => ({
                ...option,
                label: option.type === objectTYPE ? option.label + ' >' : option.label
            }));

        } else if (error) {
            console.error('Error fetching Agreement Line Item fields:', error);
        }
    }

	// Wire the getObjectInfo call to fetch metadata
    @wire(getObjectInfo, { objectApiName: PROMOTION_OBJ })
    promotionsObjectInfo;

    // Wire the getObjectInfo Range call to fetch metadata
    @wire(getObjectInfo, { objectApiName: RANGE_OBJ })
    rangeObjectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$promotionsObjectInfo.data.defaultRecordTypeId',
        fieldApiName: RATE_TYPE_PICKLIST
    })
    rateTypePicklistValues({ data, error }) {
        if (data) {
            this.rateTypeOptions = data.values;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
            console.error('Error fetching picklist values for Rate_Type__c', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$promotionsObjectInfo.data.defaultRecordTypeId',
        fieldApiName: ADJUSTMENT_TYPE_PICKLIST
    })
    adjustmentTypePicklistValues({ data, error }) {
        if (data) {
            this.adjustmentTypeOptions = data.values;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
            console.error('Error fetching picklist values for Adjustment_Type__c', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$promotionsObjectInfo.data.defaultRecordTypeId',
        fieldApiName: ADJUSTMENT_APPLY_PICKLIST
    })
    adjustmentAppliesToPicklistValues({ data, error }) {
        if (data) {
            this.adjustmentAppliesToOptions = data.values;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
            console.error('Error fetching picklist values for Adjustment_Applies_To__c', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$rangeObjectInfo.data.defaultRecordTypeId',
        fieldApiName: UOM_PICKLIST
    })
    unitOfMeasureToPicklistValues({ data, error }) {
        if (data) {
            this.UOMOptions = data.values;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
            console.error('Error fetching picklist values for UOM__c ', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$rangeObjectInfo.data.defaultRecordTypeId',
        fieldApiName: RANGE_ADJUSTMENT_TYPE_PICKLIST
    })
    rangeAdjustmentTypePicklistValues({ data, error }) {
        if (data) {
            this.rangeAdjustmentTypeOptions = data.values;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
            console.error('Error fetching picklist values for Adjustment_Type__c', error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$rangeObjectInfo.data.defaultRecordTypeId',
        fieldApiName: TYPE_PICKLIST
    })
    typeToPicklistValues({ data, error }) {
        if (data) {
            this.TypeOptions = data.values;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
            console.error('Error fetching picklist values for Type__c ', error);
        }
    }   

    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          this.recordId = currentPageReference.attributes.recordId || null;
          if(this.recordId){
            this.EditMode();
            this.isEdit=true;
            this.isSpinner=true;
          }
       }
    }

    EditMode(){
        getPromotionJsonData({promoId:this.recordId})
        .then((result)=>{
            if(result.length > 0 ){
                let promotionData = JSON.parse(result[0].Promotion_Data__c);
                promotionData.forEach((item)=>{
                    switch(item.fieldName) {
                        case 'Name':
                            this.Name = item.fieldValue;
                            break;
                        case 'Active':
                            this.Active = item.fieldValue;
                            break;
                        case 'Effective Date':
                            this.EffectiveDate = item.fieldValue;
                            break;
                        case 'Type':
                            this.promoType = item.fieldValue;
                            break;
                        case 'Include with other promotions':
                            this.IncludeOtherPromo = item.fieldValue;
                            break;
                        case 'Expiration Date':
                            this.ExpirationDate = item.fieldValue;
                            break;

                        //2nd Tab    
                        case 'selectedProductCodes':
                            this.selectedProductCodes = item.fieldValue;
                            break;
                        case 'selectedProductFamilyCodes':
                            this.selectedProductFamilyCodes = item.fieldValue;
                            break;
                        case 'prodIncludeData':
                            this.includedData = JSON.parse(JSON.stringify(item.fieldValue));
                            this.isIncludeDelete = this.includedData[0].criteriaGroup!='' && this.includedData[0].criteriaGroup!=ALLPRODUCTSLABEL;
                            break;
                        case 'prodExcludeData':
                            this.excludedData = JSON.parse(JSON.stringify(item.fieldValue));
                            this.isExcludeDelete = this.excludedData[0].criteriaGroup!='';
                            break;
                        case 'excludedProductCodes':
                            this.excludedProductCodes = item.fieldValue;
                            break;
                        case 'excludedProductFamilyCodes':
                            this.excludedProductFamilyCodes = item.fieldValue;
                            break;
                        
                        //3rd Tab
                        case 'conditionalValue':
                            this.conditionalValue = item.fieldValue;
                            break;
                        case 'Rows':
                            this.rows = item.fieldValue;
                            break;

                        //4th Tab
                        case 'Rate Type':
                            this.rateType = item.fieldValue;
                            this.rateTypeFunction();
                            break;
                        case 'Adjustment Amount':
                            this.adjustmentAmount = item.fieldValue;
                            break;
                        case 'Adjustment Type':
                            this.adjustmentType = item.fieldValue;
                            break;
                        case 'Adjustment Applies To':
                            this.adjustmentAppliesTo = item.fieldValue;
                            break;
                            default:
                    }
                });
                let rangeData = JSON.parse(result[0].Range_Data__c); 
                rangeData.forEach((item)=>{
                    switch(item.fieldName) {
                        case 'multipleSelectValues':
                            this.multipleSelectValues = item.fieldValue;
                            break;
                        case 'RangeRows':
                            this.rangeRows = item.fieldValue;
                            break;
                        case 'UOM':
                            this.unitOfMeasureValue = item.fieldValue;
                            break;
                        case 'AdjusmentApplyTo':
                            this.adjustmentTo = item.fieldValue;
                            break;
                            default:
                    }
                })  
                this.isSpinner=false;
            }
        })
    }
    callMethod() {
        getSObjectFields({ sObjectApiName: this.objectName })
        .then(result => {
            this.conditionOptions = result.map(field => ({
                label: field.label,
                value: field.fieldName, 
                type: field.fieldtype,
                referValue:field.referenceValue
            }));
            this.conditionOptions = this.conditionOptions.map(field => ({
                ...field,
                label: field.type === objectTYPE ? field.label + ' >' : field.label
            }));
        })
        .catch(error => {
            console.error('Error retrieving fields:', error);
            this.conditionOptions=[];
        });
    }
    
    //Functions of 1st Tab
    handleStepClick(event) {
        const clickedStep = event.target.value;
        if (clickedStep) {
            this.currentStep = clickedStep;
        }
    }
    handleFieldChange(event){
        switch(event.target.label) {
            case 'Name':
                this.Name = event.target.value;
                break;
            case 'Type':
                this.promoType = event.target.value;
                break;   
            case 'Active':
                this.Active = event.target.checked;
                break;
            case 'Include with other promotions':
                this.IncludeOtherPromo = event.target.checked;
                break;
            case 'Effective Date':
                this.EffectiveDate = event.target.value;
                break;
            case 'Expiration Date':
                this.ExpirationDate = event.target.value;
                break;
            case 'Adjustment Type':
                this.adjustmentType = event.detail.value;
                break;
            case 'Adjustment Amount':
                this.adjustmentAmount = event.target.value;
                break;
            case 'Adjustment Applies To':
                this.adjustmentAppliesTo = event.target.value;
                break;   
            case 'Rate Type':
                this.rateType = event.target.value;	
                this.rateTypeFunction(); 
                break;         
            default:
                break;
        }
    }

    //Functions of 2nd Tab
    handleProductIncludeData(event) {
        const prodIncludeData = event.detail;
        this.includedData = prodIncludeData;
        this.selectedProductCodes = [];
        this.selectedProductFamilyCodes = [];
    
        if (prodIncludeData[0].criteriaGroup === ALLPRODUCTSLABEL) {
            this.selectedProductCodes = ['All'];
        }else if(prodIncludeData[0].criteriaGroup == "" && this.excludedData[0].criteriaGroup == ""){
            this.selectedProductCodes = ['All'];
            this.includedData = [{ id: 1, criteriaGroup: ALLPRODUCTSLABEL, selections: '' }];
            this.rerenderChildCmp();
        } else {
            prodIncludeData.forEach(prod => {
                if (prod.criteriaGroup === PRODUCTFAMILYLABEL) {
                    this.selectedProductFamilyCodes.push(...prod.selections.map(select => select.value));
                } else if (prod.criteriaGroup === PRODUCTSLABEL) {
                    this.selectedProductCodes.push(...prod.selections.map(select => select.code));
                }
            });
        }
    }
    handleProductExcludeData(event){
        const prodExcludeData = event.detail;
        this.excludedData = prodExcludeData;
        this.excludedProductCodes =[];
        this.excludedProductFamilyCodes =[];
        if(prodExcludeData[0].criteriaGroup === '') {
            this.excludedProductCodes =[];
        }
        else{
            prodExcludeData.forEach(prod => {
                if (prod.criteriaGroup === PRODUCTFAMILYLABEL) {
                    this.excludedProductFamilyCodes.push(...prod.selections.map(select => select.value));
                } else if (prod.criteriaGroup === PRODUCTSLABEL) {
                    this.excludedProductCodes.push(...prod.selections.map(select => select.code));
                }
            })
        }
        if(prodExcludeData[0].criteriaGroup != '' && this.selectedProductCodes == 'All'){
            this.selectedProductCodes = [];
            this.includedData = [{id: 1, criteriaGroup: '', selections: ''}];
            this.rerenderChildCmp();
        }
        if (prodExcludeData[0].criteriaGroup == '' && (this.selectedProductFamilyCodes == '' || this.selectedProductCodes == '')) {
            this.selectedProductCodes = ['All'];
            this.includedData = [{id: 1, criteriaGroup: ALLPRODUCTSLABEL, selections: ''}];
            this.rerenderChildCmp();
        }
    }
    rerenderChildCmp(){
        let callChildCmp = this.template.querySelector(`c-product-criteria[data-id="Included"]`);
        callChildCmp.updatingIncludeData(this.includedData);
    }

    //Functions of 3rd Tab
    handleSelectedItems(event){
        let field = this.conditionOptions.find(option => option.value === event.detail);
        if(field.type==objectTYPE){
            this.objectName = field.referValue;
            this.callMethod();
        }
    }
    handleSendingOptions(event){
        this.objectName=objectAPIName;
        this.conditionOptions = this.baseOptions;
    }
    handleValueReceived(event){
        const { id: fieldId, field: fieldName } = event.target.dataset;
        const { value: fieldValue, label: fieldLabel } = event.detail;
        const selectedField = this.agreementFieldOptions.find(field => field.value === fieldValue);

        this.updateRowData(fieldId, fieldName, fieldValue);
        this.rows = this.rows.map(row => {
            if (row.id == fieldId) {
                row.criteriaValue = row.field;
                row.criteriaLabel = fieldLabel;
                row.isreferenced = selectedField && selectedField.type === objectTYPE;
                if (row.isreferenced) {
                    row.objectApiName = this.objectName;
                } else if (this.objectName === objectAPIName) {
                    row.isreferenced = false;
                } else {
                    row.isreferenced = false;
                }
            }
            return row;
        });
    }    
    handleOperatorChange(event) {
        const fieldId = event.target.dataset.id;
        const fieldName = event.target.dataset.field;
        const fieldValue = event.target.value;
        this.updateRowData(fieldId, fieldName, fieldValue);
    }
    handleValueChange(event) {
        const fieldId = event.target.dataset.id;
        const fieldName = event.target.dataset.field;
        const fieldValue = event.target.value;
        this.updateRowData(fieldId, fieldName, fieldValue);
    }
    updateRowData(fieldId, fieldName, fieldValue) {
        this.rows = this.rows.map(row => {
            if (row.id == fieldId) {
                return { ...row, [fieldName]: fieldValue };
            }
            return row;
        });
    }
    handleConditionalRequirmnt(event){
        this.conditionalValue = event.target.value;
    }
    addRow(event) {
        const rowId = event.target.dataset.id;
        let lastRow = this.rows[this.rows.length - 1];
        if (lastRow && (lastRow.field || lastRow.operator || lastRow.value)) {
            if (this.rows.some(row => row.id === parseInt(rowId) && (row.field || row.operator || row.value))) {
                const newRow = { id: this.rows.length + 1, field: '', operator: '', value: '', isreferenced: false, objectApiName: '' };
                this.rows = [...this.rows, newRow];
            }
        }
        this.conditionalValue = Array.from({ length: this.rows.length }, (_, i) => i + 1).join(' AND ');
    }
    removeRow(event) {
        const rowId = event.target.dataset.id;
        if(this.rows.length > 1){
            this.rows = this.rows.filter(row => row.id != rowId);
        }
        this.rows = this.rows.map((item, index) => {
            item.id = index + 1;
            return item;
        });
        this.conditionalValue = Array.from({ length: this.rows.length }, (_, i) => i + 1).join(' AND ');
    }
    

    //Functions of 4th Tab
    handleTierFieldChange(event){
        if(event.target.dataset.field == ADJUSTMENTAPPLYTO){
            this.adjustmentTo = event.target.value;
        }else if(event.target.dataset.field == UOM){
            this.unitOfMeasureValue = event.target.value;
        }
    }
    rateTypeFunction(){
        if (this.rateType === SINGLETIER) {
            this.showAdjustmentType = true;
            this.noTiersAdjustment = this.withtiersAdjustment = false;
        } 
        else if(this.rateType === NOTIERRATE){
            this.noTiersAdjustment = true;
            this.showAdjustmentType = this.withtiersAdjustment = false;
        } 
        else if(this.rateType === WITHTIERRATE){
            this.showAdjustmentType = false;
            this.withtiersAdjustment = this.noTiersAdjustment = true;
        } 
        else{
            this.noTiersAdjustment = this.showAdjustmentType = this.withtiersAdjustment = false;
        }
    }
    handleMultiSelectCriteriaValue(event) {
        const { value: selectedValue, label: selectedLabel , type:selectedType } = event.detail;
        if (selectedLabel && !this.multipleSelectValues.some(column => column.label === selectedLabel) && !selectedLabel.endsWith('>')) {
            this.multipleSelectValues = [
                ...this.multipleSelectValues,
                {
                    label: selectedLabel,
                    value: selectedValue,
                    type: 'avatar',
                    fallbackIconName: 'standard:user',
                    variant: 'circle',
                }
            ];
            this.rangeRows = this.rangeRows.map(row => {
                const existingColumn = row.rangeColumns.find(col => col.apiName === selectedLabel);
                if (!existingColumn) {
                    row.rangeColumns = [
                        ...row.rangeColumns,
                        { 
                            id: row.id,
                            label: selectedLabel, 
                            apiName: selectedValue, 
                            value: '' 
                        }
                    ];
                }
                return row;
            });
        }
    }
    handleRangeColumns(event) {
        const rowId = event.target.dataset.rowId;
        const FieldName = event.target.dataset.field;
        const FieldValue = event.target.value;
        
        this.rangeRows = this.rangeRows.map(row => {
            if (row.id ==rowId) {
                return {
                    ...row,
                    rangeColumns: row.rangeColumns.map(col => {
                        if (col.apiName === FieldName) {
                            return { ...col, value: FieldValue };
                        }
                        return col;
                    })
                };
            }
            return row;
        });
        this.updaterangeRowData(rowId, FieldName, FieldValue);
    }
    
    handleTierAdjusmentTypeChange(event) {
        const rowId =  event.target.dataset.id;
        const FieldValue= event.target.value;
        const FieldName = event.target.dataset.field;
        this.updaterangeRowData(rowId,FieldName,FieldValue);
    }
    handleTierAdjustmentAmountChange(event){
        const rowId =  event.target.dataset.id;
        const FieldValue= event.target.value;
        const FieldName = event.target.dataset.field;
        this.updaterangeRowData(rowId,FieldName,FieldValue);
    }
    handleTierMinValue(event){
        const rowId =  event.target.dataset.id;
        const FieldValue= event.target.value;
        const FieldName = event.target.dataset.field;
        this.updaterangeRowData(rowId,FieldName,FieldValue);
    }
    handleTierMaxValue(event){
        const rowId =  event.target.dataset.id;
        const FieldValue= event.target.value;
        const FieldName = event.target.dataset.field;
        this.updaterangeRowData(rowId,FieldName,FieldValue);
    }
    updaterangeRowData(fieldId, fieldName, fieldValue) {
        this.rangeRows = this.rangeRows.map(row => {
            if (row.id == fieldId) {
                return { ...row, [fieldName]: fieldValue };
            }
            return row;
        });
    }
    handlePillRemove(event) {
        const value = event.detail.item.value;
        const index = event.detail.index;
        this.multipleSelectValues.splice(index, 1);
        this.rangeRows = this.rangeRows.map(row => {
            return {
                ...row,
                rangeColumns: row.rangeColumns.filter(col => col.apiName !== value)
            };
        });
    }    
    addRowr() {
        const newRangeColumns = this.multipleSelectValues.map(col => ({
            id: this.rangeRows.length + 1,
            apiName:col.value,
            label:col.label,
            value:''
        }));
        const newRow = {
            id: this.rangeRows.length + 1,
            rangeColumns: newRangeColumns,
            minValue: null,
            maxValue: null,
            tiersAdjustmentType: '',
            tiersAdjustmentAmount: null
        };
    
        this.rangeRows = [...this.rangeRows, newRow];
    }    
    removeRowr(event) {
        const rowId = event.target.dataset.id;
        if(this.rangeRows.length > 1){
            this.rangeRows = this.rangeRows.filter(row => row.id !== parseInt(rowId));
        }
    }

    //Functions Before Saving the Whole Component
    passingProductInfotoObject(){
        this.updateWholePromoInfoData('excludedProductCodes',this.excludedProductCodes);
        this.updateWholePromoInfoData('excludedProductFamilyCodes',this.excludedProductFamilyCodes); 
        this.updateWholePromoInfoData('selectedProductCodes',this.selectedProductCodes);
        this.updateWholePromoInfoData('selectedProductFamilyCodes',this.selectedProductFamilyCodes);
    }
    updateWholePromoInfoData(fieldName, fieldValue) {
        const existingFieldIndex = this.wholePromoInfoData.findIndex(item => item.fieldName === fieldName);
        if (existingFieldIndex !== -1) {
            this.wholePromoInfoData[existingFieldIndex].fieldValue = fieldValue;
        } else {
            this.wholePromoInfoData.push({ fieldName, fieldValue });
        }
    }
    updatewholePromoRangeRowsData(fieldName, fieldValue) {
        const existingFieldIndex = this.wholePromoRangeRowsData.findIndex(item => item.fieldName === fieldName);
        if (existingFieldIndex !== -1) {
            this.wholePromoRangeRowsData[existingFieldIndex].fieldValue = fieldValue;
        } else {
            this.wholePromoRangeRowsData.push({ fieldName, fieldValue });
        }
    }
    updateConditionalValue() {
        if (!this.rows || this.rows.length == 0) return [];
    
        this.conditionalValue = this.rows.map(row => 
            `(${row.field} ${row.operator} ${row.value})`
        ).join(' AND ');
        
        let conditionalString= this.rows.map((row, index) => ({
            field: row.field,
            operator: row.operator,
            value: row.value,
            id: (index + 1).toString()
        }));
        return conditionalString;
    }
    generateRangeCriteriaContent(){
        let isSingleIndex = this.multipleSelectValues.length === 1;
        this.rangeRows.map((row) => {
            let combinedValue = '';
            row.rangeColumns.map((col, index) => {
                const fieldName = col.apiName;
                if (row.hasOwnProperty(fieldName)) {
                    const criteriaValue = isSingleIndex ? 
                                            fieldName + ' = ' + col.value : 
                                            '(' + fieldName + ' = ' + col.value + ')';
                    combinedValue += (index === 0) ? criteriaValue : ' And ' + criteriaValue;
                }
            });
            row.criteriaConditionalValue = combinedValue;
        });        
    }
    dispatchShowtoastEvent(stitle, smessage, svariant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: stitle,
                message: smessage,
                variant: svariant
            })
        );
    }
    handleSave() {
        this.allFieldLabelObject.map(field => { 
            if(field.Label =='Name'){
                field.value = this.Name;
            }else if(field.Label =='Type'){
                field.value = this.promoType;
            }else if(field.Label =='Active'){
                field.value = this.Active;
            }else if(field.Label =='Include with other promotions'){
                field.value = this.IncludeOtherPromo;
            }else if(field.Label =='Effective Date'){
                field.value = this.EffectiveDate;
            }else if(field.Label =='Expiration Date'){
                field.value = this.ExpirationDate;
            }else if(field.Label =='Adjustment Type'){
                field.value = this.adjustmentType;
            }else if(field.Label =='Adjustment Amount'){
                field.value = this.adjustmentAmount;
            }else if(field.Label =='Adjustment Applies To'){
                field.value = this.adjustmentAppliesTo;
            }else if(field.Label =='Rate Type'){
                field.value = this.rateType;
            }
        }); 
        this.allFieldLabelObject.forEach(field => { 
            this.updateWholePromoInfoData(field.Label, field.value); 
        });

        this.updateWholePromoInfoData('prodIncludeData',this.includedData);
        this.updateWholePromoInfoData('prodExcludeData',this.excludedData);
        this.passingProductInfotoObject();
        this.updateWholePromoInfoData('conditionalValue', this.conditionalValue);
        this.updateWholePromoInfoData('Rows', this.rows );
        this.updatewholePromoRangeRowsData('multipleSelectValues', this.multipleSelectValues);
        this.updatewholePromoRangeRowsData('RangeRows', this.rangeRows);
        this.updatewholePromoRangeRowsData('UOM', this.unitOfMeasureValue);
        this.updatewholePromoRangeRowsData('AdjusmentApplyTo', this.adjustmentTo);
        
        let conditionalstringfinal = this.updateConditionalValue();
        this.generateRangeCriteriaContent();

        const params = {
            //First Tab Data
            Name: this.Name,
            Active__c: this.Active, 
            Include_with_other_promotions__c: this.IncludeOtherPromo,
            Effective_Date__c: this.EffectiveDate ? new Date(this.EffectiveDate).toISOString() : null,
            Expiration_Date__c: this.ExpirationDate ? new Date(this.ExpirationDate).toISOString() : null,
            Type__c: this.promoType,

            //Second Tab Data
            Products__c: this.selectedProductCodes.join(';'),
            Product_Family__c :this.selectedProductFamilyCodes.join(';'),
            Excluded__c : this.excludedProductCodes.join(';'),
            Excluded_Product_Family__c: this.excludedProductFamilyCodes.join(';'),
          
            //Third Tab Data
            Field_Conditions__c:JSON.stringify(conditionalstringfinal),

            //Fourth Tab Data
            Rate_Type__c: this.rateType,
            Adjustment_Amount__c: this.rateType === SINGLETIER ? (this.adjustmentAmount ? parseFloat(this.adjustmentAmount) : 0 ): '',
            Adjustment_Type__c: this.rateType === SINGLETIER ? this.adjustmentType : '',
            Adjustment_Applies_To__c:this.rateType === SINGLETIER ? this.adjustmentAppliesTo : '',

            //Fourth Tab Additional Data For Range Obj
            UOM__c:this.unitOfMeasureValue,
            Range_Adjustment_Applies_To__c :this.adjustmentTo,
            RateTableRows:JSON.stringify(this.rangeRows),
            JSONPromotionInfo:JSON.stringify(this.wholePromoInfoData),
            JSONRangeInfo:JSON.stringify(this.wholePromoRangeRowsData),
        };
        createPromoRecord({params:params,PromoId:this.recordId })
        .then(result => {
            if(result){
                this.dispatchShowtoastEvent('Success', 'Promotion record created successfully', 'success');
                this[NavigationMixin.Navigate]({ 
                    type: 'standard__objectPage', 
                    attributes: { 
                        objectApiName: 'Promotions__c', 
                        actionName: 'list' 
                    } });
            }
            else{
                this.dispatchShowtoastEvent('Error','Error occured while creating Promotion record','error');
            }
        })
        .catch(error => {
            this.dispatchShowtoastEvent('Error creating promotion and range records', error.body.message, 'error');
        });
    }
    handleCancel(){
        LightningConfirm.open({
            message: "Are you sure you want to Cancel",
            variant: "headerless",
            label: "This is the aria-label value"
        }).then((result)=>{
            if(result){
                this[NavigationMixin.Navigate]({ 
                    type: 'standard__objectPage', 
                    attributes: { 
                        objectApiName: 'Promotions__c', 
                        actionName: 'list' 
                    } 
                });
            }
        })
    }
}