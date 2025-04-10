import { LightningElement,track } from 'lwc';
import getAllActivePCRs from '@salesforce/apex/SCT_AgreementDeepCloneController.getAllActivePCRs';
import fetchAllProductsData from '@salesforce/apex/SCT_AgreementDeepCloneController.fetchAllProductsData';
import createClonePCR from '@salesforce/apex/SCT_AgreementDeepCloneController.createClonePCR';
import LOCALE from '@salesforce/i18n/locale';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import LightningConfirm from "lightning/confirm";

export default class PcrDeepClone extends NavigationMixin(LightningElement) {
    
    @track filters=[
        {id:"1",filterName:"",filterOperator:"",filterValue:null,filterValueDate:null,
                IsPicklistField:false,IsDateField:false,IsOperatorBetween:false}
    ];
    @track filterOptions = [
        { label: 'PCR ID', value: 'Name' , type :'Text'},
        { label: 'Product Code', value: 'ALIProductCode' ,type :'Text'},
        { label: 'Product Name', value: 'ALIProductName' ,type :'Text'},
        { label: 'Customer Code', value: 'AccountCode' ,type :'Text'},
        { label: 'Customer Name', value: 'AccountName' ,type :'Text'},
        { label: 'PCR Created By', value: 'CreatedBy' ,type :'Text'},
        { label: 'Price List', value: 'PriceListName' ,type :'Text'},
        { label: 'Contract Start Date', value: 'AgreementStartDate' ,type :'Date' },
        { label: 'Contract End Date', value: 'AgreementEndDate' ,type :'Date'},
        { label: 'Record Type', value: 'RecordTypeName' ,type :'Text'},
        { label: 'Requestor Name', value: 'RequestorName' ,type :'Text'},
        { label: 'MR Code', value: 'MRCode' ,type :'Text'},
        { label: 'Status', value: 'Status' ,type :'Picklist'},
        { label: 'Parent Agreement', value: 'ParentAgreementName' ,type :'Text'},
    ];
    @track operatorOptions = [
        { label: 'Equal', value: '=' },
        { label: 'Not Equal', value: '!=' },
        { label: 'Contains', value: 'Contains' },
        { label: 'Between', value: 'Between' },
        { label: 'Greater Than', value: '>' },
        { label: 'Less Than', value: '<' },
        { label: 'Greater or Equal', value: '>=' },   
        { label: 'Less or Equal', value: '<=' }   
    ]
    @track statusOptions = [
        { label: 'Approval Required', value: 'Approval Required' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Generated', value: 'Generated' },
        { label: 'Activated', value: 'Activated' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Expired', value: 'Expired' }
    ];
    @track isSearchDisabled = true;
    @track displaydata = false;
    @track isCloneDisabled = true;
    @track isClonePCR = true;
    @track filteredData=[];
    @track columns=[
        { label: 'Name', fieldName: 'PCRLink', type: 'url', 
            typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' } 
        },
        { label: 'Account', fieldName: 'AccountName', type: 'text'},
        { label: 'PCR Start Date', fieldName: 'AgreementStartDate', type: 'text'},
        { label: 'PCR End Date', fieldName: 'AgreementEndDate', type: 'text'},
        { label: 'Price List', fieldName: 'PriceListName', type: 'text'},
        { label: 'Requestor', fieldName: 'RequestorName', type: 'text'}
    ];
    @track isOpenProductInput = false;
    @track isLoading = false;
    @track isDataFound = false;
    
    activeAgreementsData = [];
    agreementSelections = [];
    allProductData = [];
    oldProductId = null;
    newProductId = null;
    userLocal = LOCALE;

    matchingInfo = {
        primaryField: { fieldPath: "Name" },
        additionalFields: [{ fieldPath: "ProductCode" }],
    };

    displayInfo = {
        primaryField: 'ProductCode',
        additionalFields: ['Name'],
    };

    filter = {
        criteria: [
            {
                fieldPath: "IsActive",
                operator: "eq",
                value: true,
            }
        ],
    };
    
    async connectedCallback() {
        try {
            // Fetching active agreements data
            this.activeAgreementsData = await getAllActivePCRs();
            // Fetching all product data
            this.allProductData = await fetchAllProductsData();
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!',
                    variant: 'error',
                    message: error
                })
            );
        }
    }

    handleChange(event) {
        const filterId = event.target.dataset.id;
        const fieldName = event.target.name;
        const fieldValue = event.target.value.trim();
        const selectedOption = this.filterOptions.find(option => option.value == fieldValue);
        const selectedType = selectedOption ? selectedOption.type : null;

        if (fieldName == "filterName") {
            this.filters = this.filters.map(filter => 
                filter.id == filterId
                    ? {
                        ...filter,
                        [fieldName]: fieldValue,
                        IsPicklistField: selectedType == "Picklist",
                        IsDateField: selectedType == "Date"
                    }
                    : filter
            );
        } else if (fieldName == "filterOperator") {
            this.filters = this.filters.map(filter =>
                filter.id == filterId
                    ? {
                        ...filter,
                        [fieldName]: fieldValue,
                        IsOperatorBetween: fieldValue == "Between" && this.filters.find(f => f.id == filterId)?.IsDateField
                    }
                    : filter
            );
        } else {
            this.filters = this.filters.map(filter =>
                filter.id == filterId
                    ? { 
                        ...filter, 
                        [fieldName]: fieldValue 
                    }
                    : filter
            );
        }

        //Disabling Search button based on the Input Data
        this.isSearchDisabled = !this.filters.some(filter => filter.filterName && filter.filterOperator && filter.filterValue && filter.filterValue.trim() != '');
        this.filters = [...this.filters];
    }

    
    handleSearchPCR(){
        let filteredData = [...this.activeAgreementsData];
        let filtersData = this.filters.filter(fit => fit.filterName && fit.filterOperator);

        // if (this.userLocal == 'th-TH') {}
        filtersData.forEach(filter => {
            filteredData = filteredData.filter(agreement => {
                let fieldValue = agreement[filter.filterName];

                // Handling nested fields were LineItems
                if (filter.filterName === 'ALIProductCode' && agreement.LineItems) {
                    return agreement.LineItems.some(item => this.applyFilter(item.ALIProductCode, filter));
                }
                if (filter.filterName === 'ALIProductName' && agreement.LineItems) {
                    return agreement.LineItems.some(item => this.applyFilter(item.ALIProductName, filter));
                }
                return this.applyFilter(fieldValue, filter);
            });
        });
        this.filteredData = [...filteredData];
        this.displaydata = true;
        this.isDataFound = this.filteredData.length > 0 ? true : false ;
    }

    applyFilter(fieldValue, filter) {
        if (filter.IsDateField && fieldValue) {
            fieldValue = new Date(fieldValue).toISOString().split('T')[0];
        }else if(!filter.IsPicklistField && !filter.IsDateField && fieldValue){
            fieldValue = fieldValue.toLowerCase();
            filter.filterValue =  filter.filterValue.toLowerCase();
        }else{
            return false;
        }
        switch (filter.filterOperator) {
            case '=':
                return fieldValue == filter.filterValue;
            case '!=':
                return fieldValue != filter.filterValue;
            case 'Between':
                return fieldValue >= filter.filterValue && fieldValue <= filter.filterValueDate;
            case 'Contains':
                return fieldValue.includes(filter.filterValue);
            case '>':
                return fieldValue > filter.filterValue;
            case '<':
                return fieldValue < filter.filterValue;
            case '>=':
                return fieldValue >= filter.filterValue;
            case '<=':
                return fieldValue <= filter.filterValue;    
            default:
                return false;
        }
    }

    handleRowSelection(event) {
        const { selectedRows } = event.detail;
        const length = selectedRows.length;
        this.agreementSelections = selectedRows;
        
        const isProductMentioned = this.filters.some(({ filterName }) =>
            ['ALIProductCode', 'ALIProductName'].includes(filterName)
        );

        this.isCloneDisabled = length < 1 || (length > 1 && !isProductMentioned);
        if (length > 1 && !isProductMentioned) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!',
                    variant: 'error',
                    message: 'You can clone only one agreement at a time for the selected criteria!',
                })
            );
        }
    }

    addRow(event) {
        const rowId = event.target.dataset.id;
        const newRow = { id: this.filters.length + 1, filterName:"",filterOperator:"",filterValue:null,
                            filterValueDate:null,IsPicklistField:false,IsDateField:false,IsOperatorBetween:false};
        this.filters = [...this.filters, newRow];
    }

    removeRow(event) {
        const rowId = event.target.dataset.id;
        
        if (this.filters.length > 1) {
            this.filters = this.filters.filter(row => row.id != rowId);
        } else {
            this.filters = [{
                id: 1,
                filterName: "",
                filterOperator: "",
                filterValue: null,
                filterValueDate: null,
                IsPicklistField: false,
                IsDateField: false,
                IsOperatorBetween: false,
            }];
        }
        this.isSearchDisabled = !this.filters.some(filter =>
            filter.filterName && filter.filterOperator && filter.filterValue?.trim()
        );
        this.filters.forEach((row, index) => row.id = index + 1);
        this.displaydata = false;
        this.isCloneDisabled = true;
    }

    closeProductModal(){
        this.isOpenProductInput = false;
    }

    handleProductSelectionPCR(){
        this.isOpenProductInput = true;
        this.oldProductId = this.agreementSelections[0].LineItems && this.agreementSelections[0].LineItems[0].ALIProduct;
    }

    handleExistingProductChange(event){
        this.oldProductId = event.detail.recordId;
        if(this.newProductId && this.oldProductId){
            this.isClonePCR = false;
        }
    }
    handleNewProductChange(event) {
        this.newProductId = event.detail.recordId;

        if (this.newProductId && this.oldProductId && this.newProductId != this.oldProductId) {
            this.isClonePCR = false;
        } 
        else if (this.newProductId == this.oldProductId) {
            this.isClonePCR = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!',
                    variant: 'error',
                    message: 'You cannot clone PCR by selecting the same product again.',
                })
            );
        }
    }

    async handleClonePCR() {
        const agreementNames = this.agreementSelections.map(agr => agr.Name).join(',');
        const oldProdCode = this.allProductData.find(prod => prod.Id == this.oldProductId)?.ProductCode;
        const newProdCode = this.allProductData.find(prod => prod.Id == this.newProductId)?.ProductCode;

        const resultConfirm = await LightningConfirm.open({
            message: `Are you sure to clone the following PCR's : ${agreementNames} from Existing product ${oldProdCode} to New product ${newProdCode} ?`,
            variant: "warning",
            label: "Clone Agreements"
        });

        if (resultConfirm) {
            this.isLoading = true;
            createClonePCR({
                selectedPCRs: JSON.stringify(this.agreementSelections),
                oldProductID: this.oldProductId,
                newProductID: this.newProductId
            })
            .then((result) => {
                if (result.includes('success')) {
                    const event1 = new ShowToastEvent({
                        title: 'Sucess!',
                        variant: 'success',
                        message: 'Agreements and Line Items cloned successfully',
                    });
                    this.dispatchEvent(event1);
                     
                    if(this.agreementSelections.length == 1){
                        const agreementId = result.replace(/success/g, ''); 
                        this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: agreementId.trim(),
                                objectApiName: 'SCF_PCR__Agreement__c',
                                actionName: 'view'
                            },
                        });
                    }
                }else{
                    const event2 = new ShowToastEvent({
                        title: 'Error!',
                        variant: 'error',
                        message: result,
                    });
                    this.dispatchEvent(event2);
                    this.isLoading = false;
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        variant: 'error',
                        message: error,
                    })
                );
            })
            .finally(() => {
                if(this.agreementSelections.length > 1){
                    this.isLoading = false;
                    location.reload();
                }
            });
        } else {
            this.isOpenProductInput = false;
            this.isClonePCR = true;
        }
    }
}