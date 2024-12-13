import { LightningElement, track,wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createPromoRecord from '@salesforce/apex/ProductController.createPromoRecord';
import getPicklistValues from '@salesforce/apex/ProductController.getPicklistValues';
import getProducts from '@salesforce/apex/ProductController.getProducts';
import getAgreementLineItemFields from '@salesforce/apex/ProductController.getAgreementLineItemFields';
import getObjectFields from '@salesforce/apex/ProductController.getObjectFields';



export default class CreatePromo extends NavigationMixin(LightningElement) {
    @track Name = '';
    @track Active = false;
    @track IncludeOtherPromo = false;
    @track EffectiveDate = '';
    @track ExpirationDate = '';
    @track picklistValues = [];
    @track picklistValue = '';
    @track AdjustmentAmount = 0;
    @track selectedProductCodes = [];
    @track products = [];
    //@track fieldOptions = [];
    //@track selectedField;
    //@api objectApiName = 'Agreement_Line_Item__c';

    agreementFieldOptions = [];

   /* connectedCallback() {
        this.fetchFields();
    }*/


    displayInfo = {
        primaryField: 'Name'
    };
    matchingInfo = {
        primaryField: { fieldPath: 'Name', mode: 'startsWith' }
    };
    filter = {
        criteria: [
            {
                fieldPath: "Name",
                operator: "ne",
                value: "",
            }
        ],
    };

    handleChange(event) {
        console.log(`Selected record: ${event.detail.recordId}`);
    }

    @track rows = [
        { id: 1, field: '', operator: '', value: '' ,isreferenced: false,objectApiName:''}
    ];
    
    @wire(getPicklistValues, { fieldApiName: 'Adjustment_Type__c' })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.picklistValues = data.map(item => ({ label: item, value: item }));
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }
    
    @wire(getProducts)
    wiredProducts({ data, error }) {
        if (data) {
            this.products = data.map(product => ({
                label: product.Name,
                value: product.ProductCode
            }));
        } else if (error) {
            console.error('Error fetching Products:', error);
        }
    }
    
    @wire(getAgreementLineItemFields)
    wiredFields({ error, data }) {
        if (data) {
            this.agreementFieldOptions = data.map(field => ({ 
                label: field.label, 
                value: field.fieldName, //Api Name Of field
                type: field.fieldtype //Field Type 
            }));
        } else if (error) {
            console.error('Error fetching Agreement Line Item fields:', error);
        }
    }
    
    handleFieldChange(event){
        switch(event.target.label) {
            case 'Select Products':
                this.selectedProductCodes = event.detail.value;
                break;
            case 'Name':
                this.Name = event.target.value;
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
                this.picklistValue = event.detail.value;
                break;
            case 'Adjustment Amount':
                this.AdjustmentAmount = parseFloat(event.target.value);
                break;
            default:
                break;
        }
    }

    handleSave() {
        const selectedProductsStr = this.selectedProductCodes.join(';');
        const params = {
            Name: this.Name,
            Active__c: this.Active, 
            Include_with_other_promotions__c: this.IncludeOtherPromo,
            Effective_Date__c: this.EffectiveDate ? new Date(this.EffectiveDate).toISOString() : null,
            Expiration_Date__c: this.ExpirationDate ? new Date(this.ExpirationDate).toISOString() : null,
            Adjustment_Type__c: this.picklistValue,
            Adjustment_Amount__c:this.AdjustmentAmount,
            Products__c: selectedProductsStr

        };

        createPromoRecord({ params })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Promotion record created successfully',
                        variant: 'success'
                    })
                );
                    this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'Promotions__c',
                        actionName: 'list'
                    }
                });
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating promotion record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                console.error('Error creating promotion record: ' + JSON.stringify(error));
            });
    }

    operatorOptions = [
        { label: 'Equals', value: 'equals' },
        { label: 'Greater Than', value: 'gt' },
        { label: 'Less Than', value: 'lt' },
        { label: 'Not Equals', value: 'neq' },
        { label: 'In', value: 'in' },
    ];

    handleRowFieldChange(event) {
        const fieldId = event.target.dataset.id;
        const fieldName = event.target.dataset.field;
        const fieldValue = event.target.value;
        const selectedField = this.agreementFieldOptions.find(field => field.value === fieldValue);


        this.updateRowData(fieldId, fieldName, fieldValue);
        
        if(selectedField.type =='REFERENCE'){
            this.rows = this.rows.map(row => {
                if (row.id == fieldId) {
                    row.isreferenced = true;
                    row.objectApiName='Account';
                }
                return row;
            });
        }
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

    addRow(event) {
        const rowId = event.target.dataset.id;
        
        let lastRow = this.rows[this.rows.length - 1];
        if (lastRow && (lastRow.field || lastRow.operator || lastRow.value)) {
            if (this.rows.some(row => row.id === parseInt(rowId) && (row.field || row.operator || row.value))) {
                const newRow = { id: this.rows.length + 1, field: '', operator: '', value: '', isreferenced: false, objectApiName: '' };
                this.rows = [...this.rows, newRow];
            }
        }
    }

    removeRow(event) {
        const rowId = event.target.dataset.id;
        if(this.rows.length>1){
            this.rows = this.rows.filter(row => row.id != rowId);
        }
    }

    /*async fetchFields() {
        try {
            const fields = await getObjectFields({ objectApiName: this.objectApiName });
            this.fieldOptions = this.buildHierarchy(fields);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    }

    buildHierarchy(fields) {
        const fieldMap = fields.reduce((map, field) => {
            if (field.isReference) {
                // Add a placeholder for relationships
                map[field.apiName] = {
                    label: `${field.label} (Related Object)`,
                    value: field.apiName,
                    children: []
                };
            } else {
                map[field.apiName] = {
                    label: field.label,
                    value: field.apiName
                };
            }
            return map;
        }, {});

        // Dynamically fetch related fields if necessary (future enhancement)
        return Object.values(fieldMap);
    }

    handleFieldChange(event) {
        this.selectedField = event.target.value;
        console.log('Selected Field:', this.selectedField);
    }*/
}