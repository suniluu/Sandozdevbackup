import { LightningElement, wire, track } from 'lwc';
import getSampleProducts from '@salesforce/apex/ProductController.getSampleProducts';
import getColumns from '@salesforce/apex/ProductController.getColumns';

export default class ProductTable extends LightningElement {

    @track columns;
    @track productData;

    @wire(getSampleProducts) wiredProducts({data,error}){
        if (data) {
            console.log(data);
            this.productData = data;
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getColumns, { columnData: 'Quick_Order_Table' }) wiredColumns({data, error}){
        if (data) {
            console.log(data.Column_JSON__c);
            this.columns = JSON.parse(data.Column_JSON__c);
            console.log(this.columns);
        } else if (error) {
            console.log(error);
        }
    }
}