import { LightningElement, api, track } from 'lwc';
import retrieveRecords from '@salesforce/apex/AgreementController.getSignatoryDetails';

export default class AgreementMultiSelectLookUp extends LightningElement {

    @track globalSelectedItems = []; 
    @api labelName;
    @api objectApiName; 
    @api fieldApiNames;
    @api filterFieldApiName;
    @api iconName;  
    @api recId;
    @api globalselecteditems=[] ;
   
    @track items = []; 
    @track selectedItems = [];

    @track previousSelectedItems = []; 
    @track value = []; 
    searchInput ='';    
    isDisplayCheckbox = false; 
    
    connectedCallback(){
        if(this.globalselecteditems.length>0){
             this.globalSelectedItems.push(...this.globalselecteditems);
        }
    }
    onchangeSearchInput(event){

        this.searchInput = event.target.value;
        if(this.searchInput.trim().length>2){
            retrieveRecords({objectName: this.objectApiName,
                            fieldAPINames: this.fieldApiNames,
                            filterFieldAPIName: this.filterFieldApiName,
                            strInput: this.searchInput,recId :this.recId
                            })
            .then(result=>{ 
                console.log('Multisearch result ::: '+JSON.stringify(result));
                this.items = []; 
                this.value = [];
                this.previousSelectedItems = [];

                if(result.length>0){
                    result.map(resElement=>{
                        this.items = [...this.items,{value:resElement.recordId, 
                                                    label:resElement.recordName}];
                        this.globalSelectedItems.map(element =>{
                            if(element.value == resElement.recordId){
                                this.value.push(element.value);
                                this.previousSelectedItems.push(element);                      
                            }
                        });
                    });
                    this.isDisplayCheckbox = true; 
                        
                }
                else{
                    this.isDisplayCheckbox = false;                   
                }
            })
            .catch(error=>{
                this.error = error;
              
                this.isDisplayCheckbox = false;
            })
        }else{
            this.isDisplayCheckbox = false;
        }   
                
    }

    handleCheckboxChange(event){
        
        let selectItemTemp = event.detail.value;
        this.selectedItems = [];      
        selectItemTemp.map(p=>{            
            let arr = this.items.find(element => element.value == p);
            if(arr != undefined){
                this.selectedItems.push(arr);
            }  
        });   
        this.handleDoneClick();  
    }

    handleDoneClick(){
        this.previousSelectedItems.map(p=>{
            this.globalSelectedItems = this.globalSelectedItems.filter(item => item.value != p.value);
        });
        this.globalSelectedItems.push(...this.selectedItems); 
        const arrItems = this.globalSelectedItems;
        this.previousSelectedItems = this.selectedItems;
        const evtCustomEvent = new CustomEvent('retrieve', { 
            detail: {arrItems}
            });
        this.dispatchEvent(evtCustomEvent);
        this.isDisplayCheckbox = false;
    }
    
    handleRemoveRecord(event){        
        const removeItem = event.target.dataset.item;
        this.globalSelectedItems = this.globalSelectedItems.filter(item => item.value  != removeItem);
        const arrItems = this.globalSelectedItems;
        this.initializeValues();
        this.value =[]; 

        const evtCustomEvent = new CustomEvent('remove', {   
            detail: {removeItem,arrItems}
            });
        this.dispatchEvent(evtCustomEvent);
    }

   
    initializeValues() {
        this.searchInput = '';
        this.isDisplayCheckbox = false;
    }
}