import { LightningElement, track, wire, api } from "lwc";
import getColumns from "@salesforce/apex/AgreementController.getColumns";
import Agreementlineitemsvalidate from "@salesforce/apex/AgreementController.Agreementlineitemsvalidate";
import AgreementPricevalidate from "@salesforce/apex/AgreementController.AgreementPricevalidate";
import customPriceCalculation from "@salesforce/apex/AgreementController.customPriceCalculation";
import getRecordsFromPromoAction from "@salesforce/apex/ProductController.getRecordsFromPromoAction";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import LightningConfirm from "lightning/confirm";
export default class agreementpriceproduct extends NavigationMixin(
  LightningElement
) {
  @track selectedrows = [];
  @track selectedids = "";
  @track columns;
  @api initialRecords = [];
  @track sortBy;
  @track sortDirection = "asc";
  @track totalNetPrice = 0;
  @api index;
  @track isOpenFilterInput = false;
  @track filterAppliedValue = "";
  @track showInput = false;
  @track dataLoading = false;
  @track appliedStyle;
  @track isMassEditPopup = false;
  @track isInlinepopup = false;
  @track flatdiscount = false;
  @track Volumediscount = false;
  @track keyIndex = 0;
  @track itemList = [
    {
      id: 0
    }
  ];
  @track flatmap = new Map();
  @api recordId;
  @api productData;
  componentLoaded = false;
  discount;
  price;
  listPrice;
  contractPrice;
  netPrice;
  columnIndex;
  saveDraftValues = [];
  @track inlineEditCol = [];
  massColumnUpdates = [];
  cancelArray = [];
  @api itemListmap ;
  @track itemListmapbackup = new Map();
  @track flatmapbackup = new Map();
  mapFilterData = new Map();
  columnFilterValues = new Map();
  mapSortColumn = new Map();
  mapProductData = new Map();
  @track mapProductDatabackup=new Map();
  @track initialRecordsbackup=new Map();
  
  @api initialData = [];
  @track fieldinlineAPIs = [];
  @track inlinerecordindex = "";
  @track searchKey = '';
  @track disableicon;
  @track displayerror='';

  @track modalColumns = [
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Adjustment Type', fieldName: 'Adjustment_Type__c', type: 'text' },
    { label: 'Adjustment Amount', fieldName: 'Adjustment_Amount__c', type: 'currency' }
  ];
  @track promodata=[];
  @track isPromoModalOpen=false;

 

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
    let pusharr=[];
    pusharr=this.itemList.length>0?[...this.itemList]:[];
   pusharr.push(newItem);
   this.itemList=[...pusharr];
    this.disableicon = this.itemList.length > 1 ? false : true;
  }

  removeRow(event) {
    var rowIndex = event.currentTarget.dataset.index;
    console.log(rowIndex + 'rowindex');
    console.log(JSON.stringify(this.itemList[rowIndex]));
    console.log(JSON.stringify(this.itemList[rowIndex]));
    if (this.itemList.length > 1) {
      const itemRecord = this.itemList[rowIndex];
      if (itemRecord.dataindex) {
            const filteredList = this.itemList.filter(item => Object.keys(item).length > 1);
            if(filteredList.length>1){
        this.onRemove(itemRecord.dataindex, rowIndex);
            }else{
               this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: "You cannot Delete Record.",
                    variant: 'error'
                })
            );
            }
      } else {
        this.itemList.splice(rowIndex, 1);
        this.disableicon = this.itemList.length > 1 ? false : true;
      }
    }

  }
  connectedCallback() {
    console.log('agreementpriceproducts');
  }
  async onRemove(id, index) {
    const result = await LightningConfirm.open({
      message: "Do you want undo discounts applied",
      variant: "header",
      theme: "gray",
      label: "Undo Data"
    });
    if (result == true) {
      this.confirmClick(id, index);
    }
  }
  confirmClick(id, index) {
    console.log(id + 'id');
    console.log(index+' index');
    this.productData = this.productData.filter(
      (element) => element.recordIndex != id
    );
    this.initialRecords = this.initialRecords.filter(
      (element) => element.recordIndex != id
    );
 let keysToDelete = [];
console.log(JSON.stringify(this.itemListmap) + ' this.itemListmap');


    delete this.itemListmap[id];

  for (let key in this.itemListmap) {
      this.itemListmap[key] = this.itemListmap[key].filter(item => id != item.dataindex);
  }

  console.log(JSON.stringify(this.itemListmap) + ' this.itemListmap');

    let datawithindex = { productdata: this.productData, index: this.index };

    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.itemList.splice(index, 1);
    this.disableicon = this.itemList.length > 1 ? false : true;
      this.closeinlineEditPopup();
  }

  @wire(getColumns, { columnData: "agreementpriceproduct" }) wiredColumns({
    data,
    error
  }) {
    if (data) {
      this.columns = JSON.parse(data.Column_JSON__c);
      for (var i = 0; i < this.columns.length; i++) {
         this.fieldinlineAPIs.push(this.columns[i].fieldName);
         if (
            this.columns[i].editable == true ||
            this.columns[i].editable == "true"
         ) {
            if (
               this.columns[i].typeAttributes &&
               this.columns[i].fieldName == "productName"
            ) {
               this.discount = this.columns[i].typeAttributes.discount ?
                  this.columns[i].typeAttributes.discount :
                  "";
               this.price = this.columns[i].typeAttributes.price ?
                  this.columns[i].typeAttributes.price :
                  "";
               this.listPrice = this.columns[i].typeAttributes.listPrice ?
                  this.columns[i].typeAttributes.listPrice :
                  "";
               this.netPrice = this.columns[i].typeAttributes.netPrice ?
                  this.columns[i].typeAttributes.netPrice :
                  "";
            }
         }
         if (
            this.columns[i].typeAttributes &&
            (this.columns[i].typeAttributes.massedit == "true" ||
               this.columns[i].typeAttributes.massedit)
         ) {
            var massColObj = {};
            massColObj.type = this.columns[i].type;
            massColObj.label = this.columns[i].label;
            massColObj.fieldName = this.columns[i].fieldName;
            console.log('this.columns[i] :'+JSON.stringify(this.columns[i]));
            if (this.columns[i].type == "customName") {
               massColObj.lookup = true;
               massColObj.objname = this.columns[i].typeAttributes.objname;
               massColObj.fieldLookupName =
                  this.columns[i].typeAttributes.fieldLookupName;
               this.fieldLookupName =
                  this.columns[i].typeAttributes.fieldLookupName;
               this.addfield = this.columns[i].typeAttributes.addfield;
            } else if (this.columns[i].type == "customCombox") {
               massColObj.combobox = true;
               massColObj.selectedField =
                  this.columns[i].typeAttributes.selectedValue.fieldName;
            } else {
               massColObj.customdiscount = this.columns[i].typeAttributes.customdiscount == "true" ?
                  true :
                  false;
               massColObj.regularType = true;
               massColObj.reqDropdown =
                  this.columns[i].typeAttributes.reqDropdown == "true" ?
                  true :
                  false;
               massColObj.label =
                  this.columns[i].typeAttributes.reqDropdown == "true" ?
                  "Discount Value" :
                  this.columns[i].label;
               massColObj.selectedDropdownValue = "";
               massColObj.discountoption = "";
               massColObj.inputValue = "";
            }
            this.massColumnUpdates.push(massColObj);
         }
         if (
            this.columns[i].typeAttributes &&
            (this.columns[i].typeAttributes.inline == "true" ||
               this.columns[i].typeAttributes.inline)
         ) {
            var inlinecol = {};
            inlinecol.type = this.columns[i].type;
            inlinecol.fieldName = this.columns[i].fieldName;
            if (this.columns[i].type == "customName") {
               inlinecol.lookup = true;
               inlinecol.objname = this.columns[i].typeAttributes.objname;
               inlinecol.fieldLookupName =
                  this.columns[i].typeAttributes.fieldLookupName;
               // this.fieldLookupName = this.columns[i].typeAttributes.fieldLookupName;
               this.addfield = this.columns[i].typeAttributes.addfield;
            } else if (this.columns[i].type == "customCombox") {
               inlinecol.combobox = true;
               inlinecol.selectedField =
                  this.columns[i].typeAttributes.selectedValue.fieldName;
            } else {
               inlinecol.customdiscount = this.columns[i].typeAttributes.customdiscount == "true" ?
                  true :
                  false;
               inlinecol.regularType = true;
               inlinecol.reqDropdown =
                  this.columns[i].typeAttributes.reqDropdown == "true" ?
                  true :
                  false;
               inlinecol.label =
                  this.columns[i].typeAttributes.reqDropdown == "true" ?
                  "Discount Value" :
                  this.columns[i].label;
   
               // inlinecol.label = this.columns[i].fieldName == 'price' ? 'Base Price Override' : this.columns[i].label;
               inlinecol.selectedDropdownValue = "";
               inlinecol.discountoption = "";
               inlinecol.inputValue = "";
            }
            this.inlineEditCol.push(inlinecol);
         }
         console.log(JSON.stringify(this.inlineEditCol) + ' this.inlineEditCol255');
         this[this.columns[i].fieldName] = this.columns[i].fieldName ?
            this.columns[i].fieldName :
            "";
   
         if (
            this.columns[i].typeAttributes &&
            this.columns[i].typeAttributes.sortField
         ) {
            this.mapSortColumn[this.columns[i].fieldName] =
               this.columns[i].typeAttributes.sortField;
         }
      }
      this.columns = this.columns.map((column, index) => {
         const columnWithNumber = {
            ...column,
            columnNumber: index
         };
         return columnWithNumber;
      });
   }else if (error) {
      console.log(error + "priceproducterror");
    }
  }
  openMassEditPopup() {
    console.log(this.index + 'index');
    var selectedRecords =this.template
      .querySelector("c-agreement-custom-data-table")
      .getSelectedRows()?this.template
      .querySelector("c-agreement-custom-data-table")
      .getSelectedRows():'';

    if (selectedRecords.length > 0) {
      for (var j = 0; j < this.massColumnUpdates.length; j++) {
        this.massColumnUpdates[j].inputValue = "";
        this.massColumnUpdates[j].selectedDropdownValue = "";
        this.massColumnUpdates[j].discountoption = "";
      }

      this.isMassEditPopup = true;
    } else {
      this.errorEvent("Please select atleast one row.");
      // this.dispatchEvent(
      //   new ShowToastEvent({
      //     title: "Mass Edit.",
      //     message: "Please select atleast one row.",
      //     variant: "error"
      //   })
      // );
    }
    this.disableicon = this.itemList.length > 1 ? false : true;
  }
  updateMassEditPopup() {
    let typeval = true;
    let nullval = true;
    var dataArray = [];
    var editedArray = [];
    const ranges = [];
    this.cancelArray = [...this.productData];
    const prodrecordindex = {};
    this.flatmapbackup = this.flatmap;
    this.itemListmapbackup = this.itemListmap;
     this.mapProductDatabackup=Object.assign({}, this.mapProductData);
      console.log(JSON.stringify(this.mapProductData) + 'updatethis.mapProductData');
      console.log(JSON.stringify(this.mapProductDatabackup) + 'updatethis.mapProductDatabackup');
    var selectedRecords = this.template
      .querySelector("c-agreement-custom-data-table")
      .getSelectedRows()?this.template
      .querySelector("c-agreement-custom-data-table")
      .getSelectedRows():'';
    for (var j = 0; j < this.massColumnUpdates.length; j++) {
      for (var i = 0; i < selectedRecords.length; i++) {
        if (this.massColumnUpdates[j].inputValue) {
          nullval = false;
        }
        if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "" &&
          nullval == false &&
          this.massColumnUpdates[j].inputValue != ""
        ) {
          this.errorEvent("Please Select Discount Type");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Please Select Discount Type",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          typeval = false;
          break;
        }
        if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
          this.massColumnUpdates[j].discountoption == "" &&
          this.massColumnUpdates[j].inputValue != ""
        ) {
          this.errorEvent("Please Select Type");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Please Select  Type",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          typeval = false;
          break;
        } else if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Volume"
        ) {
          nullval = false;
          for (let z = 0; z < this.itemList.length; z++) {
            if (
              (!this.itemList[z].hasOwnProperty("UpperBound") ||
                this.itemList[z].UpperBound === "" ||
                this.itemList[z].UpperBound === undefined) &&
              (!this.itemList[z].hasOwnProperty("discountoption") ||
                this.itemList[z].discountoption === "" ||
                this.itemList[z].discountoption === undefined) &&
              (!this.itemList[z].hasOwnProperty("Discount") ||
                this.itemList[z].Discount === "" ||
                this.itemList[z].Discount === undefined)
            ) {
              nullval = true;
              break;
            } else if (
              this.itemList[z].UpperBound == "" ||
              this.itemList[z].UpperBound == undefined
            ) {
              this.errorEvent("UpperBound are Null");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "UpperBound are Null",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            } else if (
              this.itemList[z].discountoption == "" ||
              this.itemList[z].discountoption == undefined
            ) {
              this.errorEvent("Discountoption are Null");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "discountoption are Null",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            } else if (
              this.itemList[z].Discount == "" ||
              this.itemList[z].Discount == undefined
            ) {
              this.errorEvent("Discount are Null");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "Discount are Null",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            }
            else if (
              this.itemList[z].Discount <= 0 &&
              this.itemList[z].discountoption == "Percent"
            ) {
              this.errorEvent("Discount Should not be in negative");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "Discount Should not be in negative",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            }
            else if (
              this.itemList[z].Discount > 100 &&
              this.itemList[z].discountoption == "Percent"
            ) {
              this.errorEvent("Discount more than 100%");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "Discount more than 100%",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            }
            else if (
              this.itemList[z].Discount <= 0 &&
              this.itemList[z].discountoption == "Amount"
            ) {
              this.errorEvent("Discount Amount Should not be in negative");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "Discount Amount Should not be in negative",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            }
            else if (
              this.itemList[z].Discount > selectedRecords[i].listPrice &&
              this.itemList[z].discountoption == "Amount"
            ) {
              this.errorEvent("Discount Amount is more than List Price");
              // const event = new ShowToastEvent({
              //   title: "Error",
              //   message: "Discount more than List Price",
              //   variant: "error",
              //   mode: "dismissable"
              // });
              // this.dispatchEvent(event);
              typeval = false;
              break;
            }

          }
        }
        if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
          this.massColumnUpdates[j].discountoption == "Percent" &&
          this.massColumnUpdates[j].inputValue <= 0 &&
          nullval == false &&
          typeval == true
        ) {
          this.errorEvent("Discount Percent Should not be in negative");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Discount Should not be in negative",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          typeval = false;
          break;
        } else if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
          this.massColumnUpdates[j].discountoption == "Percent" &&
          this.massColumnUpdates[j].inputValue > 100 &&
          nullval == false &&
          typeval == true
        ) {
          this.errorEvent("Discount Percent more than 100%");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Discount more than 100%",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          typeval = false;
          break;
        }
        if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
          this.massColumnUpdates[j].discountoption == "Amount" &&
          this.massColumnUpdates[j].inputValue <= 0 &&
          nullval == false &&
          typeval == true
        ) {
          this.errorEvent("Discount Amount Should not be in negative");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Discount Should not be in negative",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          typeval = false;
          break;
        } else if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Flat" &&
          this.massColumnUpdates[j].discountoption == "Amount" &&
          this.massColumnUpdates[j].inputValue > selectedRecords[i].listPrice &&
          nullval == false &&
          typeval == true
        ) {
          this.errorEvent("Discount Amount is more than List Price");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Discount more than List Price",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          typeval = false;
          break;
        }
      }
    }
    for (let z = 0; z < this.itemList.length; z++) {
      console.log(JSON.stringify(ranges) + 'ranges');
      console.log(this.itemList[z].UpperBound + 'ranges');

      if (ranges.includes(this.itemList[z].UpperBound)) {
        this.errorEvent("You cannot enter the same endrange for different ranges");
        // const event = new ShowToastEvent({
        //   title: "Error",
        //   message:
        //     "You cannot enter the same endrange for different ranges",
        //   variant: "error",
        //   mode: "dismissable"
        // });
        // this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      } else {
        ranges.push(this.itemList[z].UpperBound);
      }
    }
    if (nullval == true) {
      this.errorEvent("No Values entered");
      // const event = new ShowToastEvent({
      //   title: "Error",
      //   message: "No Values entered",
      //   variant: "error",
      //   mode: "dismissable"
      // });
      // this.dispatchEvent(event);
      typeval = false;
    }

    let ab = 0;
    if (selectedRecords.length > 0 && typeval == true && nullval == false) {
      //let itemlst=[];
      for (var i = 0; i < selectedRecords.length; i++) {
        let itemLt = [...this.itemList];
        for (let z = 0; z < itemLt.length; z++) {
          let itemLst = Object.assign({}, itemLt[z]);
          itemLst.record = false;
          if (selectedRecords[i].discountoption == undefined) {
            var obj = { ...selectedRecords[i] };
            var draftObj = {};
            let previousRecordIndex = obj.recordIndex;
            draftObj.recordIndex = obj.recordIndex;

            for (var j = 0; j < this.massColumnUpdates.length; j++) {
              obj.selectedDropdownValue = this.massColumnUpdates[j].selectedDropdownValue;

              if (itemLst.UpperBound != null &&
                itemLst.discountoption != null &&
                itemLst.Discount != null &&
                itemLst.record != true) {

                if (!(obj.recordIndex in prodrecordindex)) {
                  prodrecordindex[obj.recordIndex] = true;
                  draftObj.recordIndex = obj.recordIndex;

                  obj[this.EndRange] = itemLst.UpperBound;
                  obj.discountoption = itemLst.discountoption;
                  draftObj.discountoption = itemLst.discountoption;
                  draftObj[this.EndRange] = itemLst.UpperBound;
                  obj[this.discount] = itemLst.Discount;
                  draftObj[this.discount] = itemLst.Discount;
                  itemLst.record = true;
                  itemLst.dataindex = obj.recordIndex;


                  let array = [];
                  array.push(itemLst);
                  console.log(JSON.stringify(array) + 'array');

                  this.itemListmap[obj.recordIndex] = array;
                } else {
                  obj.recordIndex = this.index++;
                  prodrecordindex[obj.recordIndex] = true;
                  draftObj.recordIndex = obj.recordIndex;
                  obj[this.EndRange] = itemLst.UpperBound;
                  obj.discountoption = itemLst.discountoption;
                  draftObj.discountoption = itemLst.discountoption;
                  draftObj[this.EndRange] = itemLst.UpperBound;
                  obj[this.discount] = itemLst.Discount;
                  draftObj[this.discount] = itemLst.Discount;
                  itemLst.record = true;
                  itemLst.dataindex = obj.recordIndex;

                  let itemlstarray = [];
                  itemlstarray.push(itemLst);
                  let arrayitemlst = this.itemListmap[previousRecordIndex].concat(itemlstarray);


                  this.itemListmap[previousRecordIndex] = arrayitemlst;
                  this.itemListmap[obj.recordIndex] = arrayitemlst;
                }
              }


              if (this.massColumnUpdates[j].inputValue) {
                if (this.massColumnUpdates[j].type == "customName") {
                  obj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                  draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                } else if (this.massColumnUpdates[j].type == "customCombox") {
                  var hasValue = false;
                  for (var k = 0; k < obj.options.length; k++) {
                    if (obj.options[k].value == this.massColumnUpdates[j].inputValue) {
                      hasValue = true;
                    }
                  }
                  if (hasValue) {
                    obj[this.massColumnUpdates[j].selectedField] = this.massColumnUpdates[j].inputValue;
                    draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                  }
                } else {
                  if (this.massColumnUpdates[j].reqDropdown) {
                    obj.selectedDropdownValue = this.massColumnUpdates[j].selectedDropdownValue;
                    obj.discountoption = this.massColumnUpdates[j].discountoption;
                  }
                    if(this.massColumnUpdates[j].customdiscount){
                     obj.customdiscount=this.massColumnUpdates[j].customdiscount?this.massColumnUpdates[j].customdiscount:'';
                  }
                  obj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                  draftObj[this.massColumnUpdates[j].fieldName] = this.massColumnUpdates[j].inputValue;
                }
                
              }
            }

            console.log(obj.selectedDropdownValue + 'obj.selectedDropdownValue');
            editedArray.push(draftObj);
            this.mapProductData[obj.recordIndex] = obj;
            dataArray.push(obj);
            if (obj.selectedDropdownValue == 'Volume') {
              // Handle Volume case if needed
            } else {
              this.flatmap[obj.recordIndex] = obj;
              console.log(JSON.stringify(this.flatmap) + 'flatmap');
            }
          } else {
            itemLst.record = true;
          }
        }


        console.log(JSON.stringify(this.itemListmap) + 'map');
      }
      const proddataa = dataArray.filter((record) => {
        return !selectedRecords.some(
          (selected) => selected.recordIndex === record.recordIndex
        );
      });
      const arrinit = [];
      for (var i = 0; i < this.initialRecords.length; i++) {
        var obj = { ...this.initialRecords[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arrinit.push(obj);
      }
      this.initialRecords = arrinit.concat(proddataa);

      const arr = [];
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }

      this.productData = arr.concat(proddataa);
      this.saveDraftValues =
        this.saveDraftValues.length > 0
          ? this.saveDraftValues.concat(editedArray)
          : editedArray;
      console.log(JSON.stringify(this.itemList) + 'this.itemListchanged');
      this.itemList = [
        {
          id: 0
        }
      ];
      this.closeMassEditPopup();
      this.selectedids = [];
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
  updateinlineEditPopup() {
    let inlinetypeval = true;
    let valuenull = true;
    const ranges = [];
    var dataArray = [];
    var editedArray = [];
    this.cancelArray = [...this.productData];
      console.log(JSON.stringify(this.cancelArray) + 'updatethis.cancelArray');
    this.flatmapbackup = [...this.flatmap];
     this.itemListmapbackup =Object.assign({}, this.itemListmap);
     this.mapProductDatabackup=Object.assign({}, this.mapProductData);
      console.log(JSON.stringify(this.mapProductData) + 'updatethis.mapProductData');
      console.log(JSON.stringify(this.mapProductDatabackup) + 'updatethis.mapProductDatabackup');
   
    const proddata = this.productData.filter(
      (element) => element.recordIndex == this.inlinerecordindex
    );
    for (var j = 0; j < this.inlineEditCol.length; j++) {
      if (this.inlineEditCol[j].inputValue) {
        valuenull = false;
      }
      if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "" &&
        valuenull == false &&
        this.inlineEditCol[j].inputValue != ""
      ) {
        this.errorEvent("Please Select Discount Type");
        // const event = new ShowToastEvent({
        //   title: "Error",
        //   message: "Please Select Discount Type",
        //   variant: "error",
        //   mode: "dismissable"
        // });
        // this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      }
      if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
        this.inlineEditCol[j].discountoption == "" &&
        this.inlineEditCol[j].inputValue != ""
      ) {
        this.errorEvent("Please Select  Type");
        // const event = new ShowToastEvent({
        //   title: "Error",
        //   message: "Please Select  Type",
        //   variant: "error",
        //   mode: "dismissable"
        // });
        // this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      } else if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Volume"
      ) {
        valuenull = false;
        for (let z = 0; z < this.itemList.length; z++) {
          if (
            (!this.itemList[z].hasOwnProperty("UpperBound") ||
              this.itemList[z].UpperBound === "" ||
              this.itemList[z].UpperBound === undefined) &&
            (!this.itemList[z].hasOwnProperty("discountoption") ||
              this.itemList[z].discountoption === "" ||
              this.itemList[z].discountoption === undefined) &&
            (!this.itemList[z].hasOwnProperty("Discount") ||
              this.itemList[z].Discount === "" ||
              this.itemList[z].Discount === undefined)
          ) {
            valuenull = true;

            break;
          } else if (
            this.itemList[z].UpperBound == "" ||
            this.itemList[z].UpperBound == undefined
          ) {
            this.errorEvent("UpperBound are Null");
            // const event = new ShowToastEvent({
            //   title: "Error",
            //   message: "UpperBound are Null",
            //   variant: "error",
            //   mode: "dismissable"
            // });
            // this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else if (
            this.itemList[z].discountoption == "" ||
            this.itemList[z].discountoption == undefined
          ) {
            this.errorEvent("Discountoption is Null");
            // const event = new ShowToastEvent({
            //   title: "Error",
            //   message: "discountoption are Null",
            //   variant: "error",
            //   mode: "dismissable"
            // });
            // this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else if (
            this.itemList[z].Discount == "" ||
            this.itemList[z].Discount == undefined ||
            !this.itemList[z].Discount
          ) {
            this.errorEvent("Discount is Null");
            // const event = new ShowToastEvent({
            //   title: "Error",
            //   message: "Discount are Null",
            //   variant: "error",
            //   mode: "dismissable"
            // });
            // this.dispatchEvent(event);
            inlinetypeval = false;
            break;

          }
          else if (
            this.itemList[z].Discount <= 0 &&
            this.itemList[z].discountoption == "Percent"
          ) {
            this.errorEvent("Discount  Percent Should not be in negative");
            // const event = new ShowToastEvent({
            //   title: "Error",
            //   message: "Discount Should not be in negative",
            //   variant: "error",
            //   mode: "dismissable"
            // });
            // this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          }
          else if (
            this.itemList[z].Discount > 100 &&
            this.itemList[z].discountoption == "Percent"
          ) {
            this.errorEvent("Discount Percent is more than 100%");
            // const event = new ShowToastEvent({
            //   title: "Error",
            //   message: "Discount more than 100%",
            //   variant: "error",
            //   mode: "dismissable"
            // });
            // this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          }
          if (
            this.itemList[z].discountoption == "Amount"
          ) {
            for (var i = 0; i < proddata.length; i++) {
              if (
                this.itemList[z].Discount <= 0
              ) {
                this.errorEvent("Discount Amount Should not be in negative");
                // const event = new ShowToastEvent({
                //   title: "Error",
                //   message: "Discount Should not be in negative",
                //   variant: "error",
                //   mode: "dismissable"
                // });
                // this.dispatchEvent(event);
                inlinetypeval = false;
                break;
              }
              else if (
                this.itemList[z].Discount > proddata[i].listPrice
              ) {
                this.errorEvent("Discount Amount is more than List Price");
                // const event = new ShowToastEvent({
                //   title: "Error",
                //   message: "Discount more than List Price",
                //   variant: "error",
                //   mode: "dismissable"
                // });
                // this.dispatchEvent(event);
                inlinetypeval = false;
                break;
              }

            }

          }
          if (ranges.includes(this.itemList[z].UpperBound)) {
            this.errorEvent("You cannot enter the same endrange for different ranges");
            // const event = new ShowToastEvent({
            //   title: "Error",
            //   message:
            //     "You cannot enter the same endrange for different ranges",
            //   variant: "error",
            //   mode: "dismissable"
            // });
            // this.dispatchEvent(event);
            inlinetypeval = false;
            break;
          } else {
            ranges.push(this.itemList[z].UpperBound);
          }
        }
      }
      if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
        this.inlineEditCol[j].discountoption == "Percent" &&
        this.inlineEditCol[j].inputValue > 100 &&
        valuenull == false &&
        inlinetypeval == true
      ) {
        this.errorEvent("Discount Percent is  more than 100%");
        // const event = new ShowToastEvent({
        //   title: "Error",
        //   message: "Discount more than 100%",
        //   variant: "error",
        //   mode: "dismissable"
        // });
        // this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      } else if (
        this.inlineEditCol[j].reqDropdown &&
        this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
        this.inlineEditCol[j].discountoption == "Percent" &&
        this.inlineEditCol[j].inputValue <= 0 &&
        valuenull == false &&
        inlinetypeval == true
      ) {
        this.errorEvent("Discount Percent  should not be in negative");
        // const event = new ShowToastEvent({
        //   title: "Error",
        //   message: "Discount Should not be in negative",
        //   variant: "error",
        //   mode: "dismissable"
        // });
        // this.dispatchEvent(event);
        inlinetypeval = false;
        break;
      }

      for (var i = 0; i < proddata.length; i++) {
        if (
          this.inlineEditCol[j].reqDropdown &&
          this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
          this.inlineEditCol[j].discountoption == "Amount" &&
          this.inlineEditCol[j].inputValue <= 0 &&
          valuenull == false &&
          inlinetypeval == true
        ) {
          this.errorEvent("Discount Amount should not be in negative");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Discount Should not be in negative",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          inlinetypeval = false;
          break;
        }
        else if (
          this.inlineEditCol[j].reqDropdown &&
          this.inlineEditCol[j].selectedDropdownValue == "Flat" &&
          this.inlineEditCol[j].discountoption == "Amount" &&
          this.inlineEditCol[j].inputValue > proddata[i].listPrice &&
          valuenull == false &&
          inlinetypeval == true
        ) {
          this.errorEvent("Discount Amount is more than List Price");
          // const event = new ShowToastEvent({
          //   title: "Error",
          //   message: "Discount more than List Price",
          //   variant: "error",
          //   mode: "dismissable"
          // });
          // this.dispatchEvent(event);
          inlinetypeval = false;
          break;
        }

      }
    }
    if (valuenull == true) {
      this.errorEvent("No Values entered");
      // const event = new ShowToastEvent({
      //   title: "Error",
      //   message: "No Values entered",
      //   variant: "error",
      //   mode: "dismissable"
      // });
      // this.dispatchEvent(event);
      inlinetypeval = false;
    }
let  itmlst=[];
    const prodrecordindex = {};
    for (let z = 0; z < this.itemList.length; z++) {
      const itm= Object.assign({}, this.itemList[z]);
        itmlst.push(itm);

      for (var i = 0; i < this.productData.length; i++) {
        console.log(JSON.stringify(this.itemList[z])+ 'itemlist');
        if (this.productData[i].EndRange == this.itemList[z].UpperBound &&
          this.productData[i].discountoption == this.itemList[z].discountoption &&
          this.productData[i].discount == this.itemList[z].Discount) {

          prodrecordindex[this.productData[i].recordIndex] = true;
        }

      }
    }
     console.log(JSON.stringify(itmlst)+'this.itmlst');
    console.log(JSON.stringify(this.productData) + 'this.productData');
    if (this.inlinerecordindex && valuenull == false && inlinetypeval == true) {
      for (let z = 0; z < this.itemList.length; z++) {
          console.log(z   +' z  ');
          console.log( this.itemList.length +'  this.itemList.length');
          console.log(z < this.itemList.length +' z < this.itemList.length');
        for (let i = 0; i < this.productData.length; i++) {
          console.log(i   +' i  ');
          console.log( this.productData.length +'  this.productData.length');
          console.log(i < this.productData.length +' i < this.productData.length');
          let changed = false;
          let obj = { ...this.productData[i] };
             let obj1 = { ...this.productData[i] };
             let recordchange=true;

          // console.log(this.itemList[z].record+'this.itemList[z].record==undefined');
          if ((this.inlinerecordindex == obj.recordIndex || obj.recordIndex == this.itemList[z].dataindex)) {
            //   console.log(JSON.stringify(this.productData[i]) + ' proddata[i]');

            let draftObj = {};
            draftObj.recordIndex = obj.recordIndex;
            for (let j = 0; j < this.inlineEditCol.length; j++) {
              //     console.log(JSON.stringify(this.inlineEditCol[j]) + ' this.inlineEditCol[j]');

              if (this.itemList[z].UpperBound != null &&
                this.itemList[z].discountoption != null &&
                this.itemList[z].Discount != null &&
                this.itemList[z].record != true) {

                if (this.inlineEditCol[j].reqDropdown) {
                  obj.selectedDropdownValue = this.inlineEditCol[j].selectedDropdownValue;
                  console.log(JSON.stringify(this.itemList[z]) + ' this.itemList[z]');

                  if (this.itemList[z].dataindex == obj.recordIndex) {

                    prodrecordindex[obj.recordIndex] = true;
                    draftObj.recordIndex = obj.recordIndex;

                    obj.EndRange = this.itemList[z].UpperBound;
                    obj.discountoption = this.itemList[z].discountoption;
                    draftObj.discountoption = this.itemList[z].discountoption;
                    draftObj.EndRange = this.itemList[z].UpperBound;
                    obj.discount = this.itemList[z].Discount;
                    draftObj.discount = this.itemList[z].Discount;
                    console.log(obj.discount + ' obj.discount');
                    console.log(JSON.stringify(obj) + ' obj');
                    this.itemList[z].record = true;
                    this.itemList[z].dataindex = obj.recordIndex;
                 //   const itmlst = [...this.itemList]; // Create a shallow copy of this.itemList
this.itemListmap[obj.recordIndex] = itmlst; // Store the copy in the map
                    console.log(JSON.stringify( this.itemList)+' constthis.itemlist');
                    recordchange=false;
                    // console.log(   obj.recordIndex+'  obj ');
                    //console.log( typeof  obj.recordIndex+'  typeof ');
                  } else if (!(obj.recordIndex in prodrecordindex) && !this.itemList[z].dataindex) {
                    prodrecordindex[obj.recordIndex] = true;

                    draftObj.recordIndex = obj.recordIndex;

                    obj.EndRange = this.itemList[z].UpperBound;
                    obj.discountoption = this.itemList[z].discountoption;
                    draftObj.discountoption = this.itemList[z].discountoption;
                    draftObj.EndRange = this.itemList[z].UpperBound;
                    obj.discount = this.itemList[z].Discount;
                    draftObj.discount = this.itemList[z].Discount;
                    console.log(obj.discount + ' obj.discount');
                    this.itemList[z].record = true;
                    this.itemList[z].dataindex = obj.recordIndex;
                  //  const itmlst = [...this.itemList]; // Create a shallow copy of this.itemList
this.itemListmap[obj.recordIndex] = itmlst; // Store the copy in the map
                    console.log(JSON.stringify( this.itemList)+'const this.itemlist');
                    recordchange=false;
                      console.log(   obj+'  obj if');
                    //  console.log( typeof  obj.recordIndex+'  typeof ');
                  } else if (!this.itemList[z].dataindex) {
                    prodrecordindex[obj.recordIndex] = true;
                    obj.recordIndex = this.index++;
                    draftObj.recordIndex = obj.recordIndex;
                    prodrecordindex[obj.recordIndex] = true;
                    obj.EndRange = this.itemList[z].UpperBound;
                    obj.discountoption = this.itemList[z].discountoption;
                    draftObj.discountoption = this.itemList[z].discountoption;
                    draftObj.EndRange = this.itemList[z].UpperBound;
                    obj.discount = this.itemList[z].Discount;
                    console.log(obj.discount + ' obj.discount');
                    draftObj.discount = this.itemList[z].Discount;
                    this.itemList[z].record = true;
                    this.itemList[z].dataindex = obj.recordIndex;
                 // const itmlst = [...this.itemList]; // Create a shallow copy of this.itemList
this.itemListmap[obj.recordIndex] = itmlst; // Store the copy in the map
                    console.log(JSON.stringify( this.itemList)+'const this.itemlist');
                    recordchange=false;
                    //   console.log(   obj.recordIndex+'  obj ');
                    //  console.log( typeof  obj.recordIndex+'  typeof ');
                  }
                   console.log(JSON.stringify(obj) + 'obj else');
                  console.log(JSON.stringify(this.itemListmap) + 'itemListmap');
                }
              }
   console.log(JSON.stringify(obj) + 'obj between');
      console.log(JSON.stringify( this.inlineEditCol[j])+'  this.inlineEditCol[j]');
              if (this.inlineEditCol[j].inputValue && this.inlinerecordindex == obj.recordIndex &&  this.inlineEditCol[j].isvaluechanged==false ) {
                if (this.inlineEditCol[j].type === "customName") {
                  obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                  draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                } else if (this.inlineEditCol[j].type === "customCombox") {
                  let hasValue = false;
                  for (let k = 0; k < obj.options.length; k++) {
                    if (obj.options[k].value === this.inlineEditCol[j].inputValue) {
                      hasValue = true;
                    }
                  }
                  if (hasValue) {
                    obj[this.inlineEditCol[j].selectedField] = this.inlineEditCol[j].inputValue;
                    draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                  }
                } else {
                  if (this.inlineEditCol[j].reqDropdown) {
                    if (obj.selectedDropdownValue === 'Volume' && this.inlineEditCol[j].selectedDropdownValue == 'Flat') {
                      changed = true;
                      obj.EndRange=obj.EndRange?'':'';
                    }
                     obj.selectedDropdownValue = this.inlineEditCol[j].selectedDropdownValue;
                       console.log(JSON.stringify(this.inlineEditCol[j]) + 'inlineEditCol[j]');
                    obj.discountoption = this.inlineEditCol[j].discountoption;
                      console.log(obj.selectedDropdownValue+'dropdown');
                      if( obj.selectedDropdownValue == 'Flat'){
                      recordchange=false;
                     
                    
                      obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                      draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                    }
                    

                  } else {
                         if( obj.selectedDropdownValue == 'Flat'){
                      recordchange=false;
                    
                    
                    obj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                    draftObj[this.inlineEditCol[j].fieldName] = this.inlineEditCol[j].inputValue;
                    }
                  }
                    if(this.inlineEditCol[j].customdiscount){
                   obj[this.inlineEditCol[j].fieldName] =
                      this.inlineEditCol[j].inputValue;
                draftObj[this.inlineEditCol[j].fieldName] =
                      this.inlineEditCol[j].inputValue;
                      obj.customdiscount=this.inlineEditCol[j].customdiscount;
                }
                }
                this.inlineEditCol[j].isvaluechanged=true;
              }
            }
            console.log(JSON.stringify(obj) + 'obj flat');
            console.log(JSON.stringify(this.itemList[z])+' this.itemList');
            //  editedArray.push(draftObj);

            const isOnlyRecordIndex2 = Object.keys(draftObj).length === 1;
            if (!isOnlyRecordIndex2) {
              //console.log(  draftObj.recordIndex+'  draftObj. ');
              console.log(JSON.stringify(draftObj) + '  draftObj');
              editedArray.push(draftObj);
            
              console.log(JSON.stringify(draftObj) + '  draftObj');
             console.log(JSON.stringify(obj) + 'obj ');
                console.log(JSON.stringify(obj1) + 'obj1 ');
             console.log(obj1===obj + '===editedArray===');
             
            this.mapProductData[obj.recordIndex] = obj;
            dataArray.push(obj);
            }
            this.flatdiscount = false;
            this.Volumediscount = false;
              console.log(JSON.stringify(dataArray) + 'dataArray');
            console.log(JSON.stringify(editedArray) + 'editedArray');

            if (obj.selectedDropdownValue === 'Volume' && this.itemList[z].record != true) {
             this.itemListmap[obj.recordIndex] = this.itemList;
            } else {
              if (changed) {
                let dataindexToRemove = [];             // Step 1: Delete the specific entry if it exists
                if (this.itemListmap.hasOwnProperty(this.inlinerecordindex)) {
                  // console.log(JSON.stringify(this.itemListmap[this.inlinerecordindex])+'this.itemListmap[this.inlinerecordindex]');
                  for (let key of this.itemListmap[this.inlinerecordindex]) {
                    // console.log(key+'key');
                    // console.log(key.dataindex+'key.dataindex');
                    if (key.dataindex != this.inlinerecordindex) {
                      dataindexToRemove.push(key.dataindex);
                    }
                  }
                  delete this.itemListmap[this.inlinerecordindex];
                }
                //  console.log(JSON.stringify(dataindexToRemove)+'dataindexToRemove');
                if (dataindexToRemove) {
                  let deletedrecords = [];
                  //const d = this.productData.filter(element => !dataindexToRemove.includes(element.recordIndex));
                  const d = [];
                  for (let data in this.productData) {
                    //  console.log(   dataindexToRemove[0]+'  dataindex ');
                    //  console.log(  this.productData[data].recordIndex+'  data. ');
                    //  console.log( typeof dataindexToRemove[0]+'  dataindexToRemove');
                    //  console.log(typeof this.productData[data].recordIndex+'  data.recordIndex');
                    //   console.log(!dataindexToRemove.includes(this.productData[data].recordIndex)+' !dataindexToRemove.includes(data.recordIndex)');
                    if (!dataindexToRemove.includes(this.productData[data].recordIndex)) {
                      d.push(this.productData[data]);
                    }
                    else {
                      deletedrecords.push(this.productData[data]);
                    }
                  }
                  console.log(JSON.stringify(d) + 'this.productDataafter');
                   this.initialRecords = this.initialRecords.filter((record) => {
                    if (!dataindexToRemove.includes(record.recordIndex)) {
                        return true;
                    } 
                    });
                    console.log(JSON.stringify(this.initialRecords) + 'this.initialRecords');
                  this.productData = d;
                  if (deletedrecords != '') {
                    const deletedata = new CustomEvent("productdatadelete", {
                      detail: deletedrecords,
                      bubbles: true,
                      composed: true
                    });
                    this.dispatchEvent(deletedata);
                  }
                }
                // const d= this.productData.filter(element => dataindexToRemove.includes(element.recordIndex));
                // console.log(JSON.stringify(d)+'d');
                // this.productData=d;

                // Step 2: Identify and remove entries with matching dataindex across all keys
                let keysToDelete = [];

                // Find keys where any item has a matching dataindex
                for (let key in this.itemListmap) {
                  let containsMatchingDataIndex = this.itemListmap[key].some(item => item.dataindex == this.inlinerecordindex);
                  if (containsMatchingDataIndex) {
                    keysToDelete.push(key);
                  }
                }

                // Delete the identified keys from itemListmap
                for (let key of keysToDelete) {
                  delete this.itemListmap[key];
                }

                // console.log(JSON.stringify(this.itemListmap) + ' After deletion');


                // console.log(JSON.stringify(this.itemListmap)+'Step2');

                this.flatmap[obj.recordIndex] = obj;
              }
              else {
                this.flatmap[obj.recordIndex] = obj;
              }

              //   if(changed){
              //            let dataindexToRemove = [];         
              //                           // Step 1: Delete the specific entry if it exists
              //               if (this.itemListmap.hasOwnProperty(this.inlinerecordindex)) {
              //                 for(let key of this.itemListmap){
              //                   if (key.dataindex != this.inlinerecordindex) {
              //                         dataindexToRemove.push(key.dataindex);
              //                     }
              //                 }
              //               delete this.itemListmap[this.inlinerecordindex];
              //               }


              //               // Step 2: Identify and remove entries with matching dataindex across all keys
              //               let keysToDelete = [];


              //               // Find keys where any item has a matching dataindex
              //               for (let key in this.itemListmap) {
              //               let containsMatchingDataIndex = this.itemListmap[key].some(item => item.dataindex == this.inlinerecordindex);
              //               if (containsMatchingDataIndex) {
              //                   keysToDelete.push(key);
              //               }

              //               }

              //               // Delete the identified keys from itemListmap
              //               for (let key of keysToDelete) {
              //               delete this.itemListmap[key];
              //               }

              //               console.log(JSON.stringify(this.itemListmap) + ' After deletion');


              //               console.log(JSON.stringify(this.itemListmap)+'Step2');

              //    this.flatmap[obj.recordIndex] = obj;
              // }
            }
          }
        }
        // this.itemList[this.itemList[z].id] = this.itemList[z]!=''||null?this.itemList[z]:[];

      }

      const arrinit = [];
      for (var i = 0; i < this.initialRecords.length; i++) {
        var obj = { ...this.initialRecords[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arrinit.push(obj);
      }
      const proddataa = dataArray.filter(
        (element) => element.recordIndex != this.inlinerecordindex
      );

      const seen1 = new Set();
      const datainit = arrinit.concat(proddataa);
      this.initialRecords = datainit.filter(record => {
        const duplicate = seen1.has(record.recordIndex);
        seen1.add(record.recordIndex);
        return !duplicate;
      });
      const arr = [];
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }
      console.log(JSON.stringify(this.productData) + 'Productdatabef  ');
      const data = arr.concat(proddataa);
      const seen = new Set();
      this.productData = data.filter(record => {
        const duplicate = seen.has(record.recordIndex);
        seen.add(record.recordIndex);
        return !duplicate;
      });
      console.log(JSON.stringify(this.productData) + 'Productdata final');
      this.saveDraftValues =
        this.saveDraftValues.length > 0
          ? this.saveDraftValues.concat(editedArray)
          : editedArray;
      this.closeinlineEditPopup();
      this.selectedids = [];

      this.itemList = [
        {
          id: 0
        }
      ];
    }
  }
  async onReset() {
    const result = await LightningConfirm.open({
      message: "Do you want undo discounts applied",
      variant: "header",
      theme: "gray",
      label: "Undo Data"
    });
    if (result == true) {
      this.handleConfirmClick();
    }
  }
  handleConfirmClick() {
    this.productData = this.initialData;
    this.initialRecords = this.initialData;
    for (let i = 0; i < this.initialData.length; i++) {
      this.mapProductData[this.initialData[i].recordIndex] = this.initialData[i];
    }
    let datawithindex = { productdata: this.initialData, index: this.index };

    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    let checkingvalue=true;
    const displayerror = { checkingvalue: checkingvalue };
    const errormsg1 = new CustomEvent("errormsg", {
      detail: displayerror,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(errormsg1);

  }
  handleSearch(event) {
    const searchKey = event.target.value.toLowerCase();
    this.searchKey = searchKey;
    var initialArray = [];
     let searchRecords = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      initialArray.push(obj);
    }

    if (searchKey) {
      if (initialArray) {
       
        for (let record of initialArray) {
          let valuesArray = Object.values(record);
          for (let val of valuesArray) {
            let strVal = String(val);
            if (strVal) {
              if (strVal.toLowerCase().includes(searchKey)) {
                searchRecords.push(record);
                break;
              }
            }
          }
        }
         if(this.columnFilterValues.length >=1){
        this.columns.forEach((column) => {
          var filterValue = this.columnFilterValues[column.fieldName];
          if (filterValue) {
            searchRecords = searchRecords.filter((row) => {
              var recName;
              if (column.type == "customName") {
                recName = row[column.typeAttributes.fieldapiname]
                  ? row[column.typeAttributes.fieldapiname]
                  : "";
              } else {
                recName = row[column.fieldName];
              }
              const regex = new RegExp(filterValue, "i");
              if (regex.test(recName)) {
                return true;
              }
              return false;
            });
          }
        });
      }
      }
    } else {
      if(this.columnFilterValues.length >=1){
      console.log(JSON.stringify(initialArray) + 'nefrorearr');
      this.columns.forEach((column) => {
        var filterValue = this.columnFilterValues[column.fieldName];
        console.log(JSON.stringify(filterValue) + 'filterValue');
        if (filterValue) {
          console.log(JSON.stringify(initialArray) + 'before in');
          searchRecords = initialArray.filter((row) => {
            var recName;
            console.log(JSON.stringify(recName) + 'recName in');
            if (column.type == "customName") {
              recName = row[column.typeAttributes.fieldapiname]
                ? row[column.typeAttributes.fieldapiname]
                : "";
            } else {
              recName = row[column.fieldName];
              console.log(JSON.stringify(recName) + 'recName in wlse');
            }
            const regex = new RegExp(filterValue, "i");
            console.log(regex.test(recName) + 'regex.test(recName) in wlse');
            if (regex.test(recName)) {
              return true;
            }
            return false;
          });
          console.log(JSON.stringify(searchRecords) + 'in');
        }
      });

      console.log(JSON.stringify(searchRecords) + 'after');
      }
     
    }
     this.productData = searchRecords.length>=1?searchRecords:initialArray;
     this.template.querySelector("c-agreement-custom-data-table").selectedRows=this.selectedids;
  }

  handleCancel() {
    if (this.cancelArray.length > 0) {
      this.productData = this.cancelArray;
      this.cancelArray = [];
            this.saveDraftValues=[];
      this.flatmap = this.flatmapbackup;
      this.itemListmap = this.itemListmapbackup;
      console.log(JSON.stringify(this.itemListmap) + 'afterthis.itemListmap');
      this.mapProductData=this.mapProductDatabackup;
      console.log(JSON.stringify(this.mapProductData) + 'afterthis.mapProductData');
    }

  }

  handleInputType(event) {
    if (this.isInlinepopup == true) {
      for (var j = 0; j < this.inlineEditCol.length; j++) {
        if (this.inlineEditCol[j].fieldName == event.target.name) {
          this.inlineEditCol[j].inputValue =
            this.inlineEditCol[j].type == "customName"
              ? event.detail.recordId
              : event.detail.value;
              this.inlineEditCol[j].isvaluechanged=false;
        } else if (this.inlineEditCol[j].reqDropdown == true) {
          if (event.target.name == "DiscountType"  &&
          this.inlineEditCol[j].reqDropdown == true) {
            this.inlineEditCol[j].selectedDropdownValue = event.detail.value;
           //  this.inlineEditCol[j].isvaluechanged=false;
            if (event.detail.value == "Flat") {
              this.flatdiscount = true;
              this.Volumediscount = false;
            } else {
              this.Volumediscount = true;
              this.flatdiscount = false;
            }
          } else if (event.target.name == "Type"  &&
          this.inlineEditCol[j].reqDropdown == true) {
            this.inlineEditCol[j].discountoption = event.detail.value;
             this.inlineEditCol[j].isvaluechanged=false;
          }
        }
      }
      console.log(JSON.stringify( this.inlineEditCol)+'  this.inlineEditCol');
    } else {
      for (var j = 0; j < this.massColumnUpdates.length; j++) {
        if (this.massColumnUpdates[j].fieldName == event.target.name) {
          this.massColumnUpdates[j].inputValue =
            this.massColumnUpdates[j].type == "customName"
              ? event.detail.recordId
              : event.detail.value;
        } else if (this.massColumnUpdates[j].reqDropdown == true) {
          if (event.target.name == "DiscountType") {
            this.massColumnUpdates[j].selectedDropdownValue =
              event.detail.value;
            if (event.detail.value == "Flat") {
              this.flatdiscount = true;
              this.Volumediscount = false;
            } else {
              this.Volumediscount = true;
              this.flatdiscount = false;
            }
          } else if (event.target.name == "Type") {
            this.massColumnUpdates[j].discountoption = event.detail.value;
          }
        }
      }
    }
  }
  closeMassEditPopup() {
    this.selectedids = [];
    this.isMassEditPopup = false;
    this.flatdiscount = false;
    this.Volumediscount = false;
    this.itemList = [
      {
        id: 0
      }
    ];
  }
  handleInputType1(event) {


    const index = event.currentTarget.dataset.index;

    if (this.itemList[index]) {
      const item = this.itemList[index];
      if (event.target.name === "UpperBound") {
        item.UpperBound = event.target.value;
        item.record = false;
      } else if (event.target.name === "Discount") {
        item.Discount = event.target.value;
        item.record = false;
      } else if (event.target.name === "Type") {
        item.discountoption = event.target.value;
          console.log(event.target.value +' event.target.value');
        console.log(item.discountoption+' item.discountoption');
        item.record = false;
      }
      this.itemList[index] = item;
      console.log(JSON.stringify(item)+' item');
    } else {
      console.error("Item not found at index:", index);
    }
  }
  handleButtonActions(event) {
    console.log(event.target.label);
    console.log(JSON.stringify(this.productData));
    const prodids = this.productData.map((item) => item.productId);

  }

  handleSave(event) {
    let prodatawithcustomdiscount=[];
    this.saveDraftValues = event.detail.draftValues;
    var dataArray = [];
    this.totalNetPrice = 0;
    let checkingvalue;
    let errormsg;
     console.log(JSON.stringify(this.saveDraftValues) + 'saveDraftValues');
    console.log(JSON.stringify(this.productData) + 'productdaaata');
      Agreementlineitemsvalidate({
      agreementLineItemData: JSON.stringify(this.productData)
    }).then((result) => {
         console.log('this.result' +result);
         
        if (result) {
          errormsg=result;
           console.log('this.result' +result);
        this.displayerror = true;
		checkingvalue=true;
    console.log('this.displayerror' +this.displayerror);
          let displayerror = { displayerror: this.displayerror, checkingvalue: checkingvalue,errormsg: errormsg };
           console.log('this.displayerror' +JSON.stringify(displayerror));
          let errormsg1 = new CustomEvent("errormsg", {
            detail: displayerror,
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(errormsg1);
           console.log('this.errormsg1if' +JSON.stringify(errormsg1));
        } else {
          this.displayerror = false;
           checkingvalue=true;
          const displayerror = { displayerror: this.displayerror, checkingvalue: checkingvalue };
          const errormsg1 = new CustomEvent("errormsg", {
            detail: displayerror,
            bubbles: true,
            composed: true
          });
          
          const event = new ShowToastEvent({
                title: "Success",
                message: "No errors found!",
                variant: "Success",
                mode: "dismissable"
            });
            this.dispatchEvent(event);
          this.dispatchEvent(errormsg1);
            console.log('this.errormsg1else' +JSON.stringify(errormsg1));
           for (var i = 0; i < this.productData.length; i++) {
      var obj = { ...this.productData[i] };

      for (var j = 0; j < this.saveDraftValues.length; j++) {
        if (
          this.productData[i].recordIndex == this.saveDraftValues[j].recordIndex
        ) {
          // console.log(   this.productData[i].recordIndex+'  this.productData[i].recordIndex ');
          // console.log( typeof this.productData[i].recordIndex+'  typeof  this.productData[i].recordIndex');
          // console.log(   obj.recordIndex+'  obj ');
          //                  console.log( typeof  obj.recordIndex+'  typeof ');
          //     console.log(   this.saveDraftValues[j].recordIndex+'  this.saveDraftValues[j].recordIndex ');
          // console.log( typeof this.saveDraftValues[j].recordIndex+'  typeof  this.saveDraftValues[j].recordIndex');
          for (var k = 0; k < this.fieldinlineAPIs.length; k++) {
if (this.saveDraftValues[j][this.fieldinlineAPIs[k]]=='') {
    obj[this.fieldinlineAPIs[k]] =
                  this.saveDraftValues[j][this.fieldinlineAPIs[k]]?this.saveDraftValues[j][this.fieldinlineAPIs[k]]:null;
}
            if (this.saveDraftValues[j][this.fieldinlineAPIs[k]]) {
              if (this.fieldinlineAPIs[k] == "aggrementVal") {
                obj.selectedValue =
                  this.saveDraftValues[j][this.fieldinlineAPIs[k]];
              } else {
                obj[this.fieldinlineAPIs[k]] =
                  this.saveDraftValues[j][this.fieldinlineAPIs[k]];
                  console.log(obj[this.fieldinlineAPIs[k]] + '  obj[this.fieldinlineAPIs[k]] ');
                  console.log(this.saveDraftValues[j][this.fieldinlineAPIs[k]] + '  this.saveDraftValues[j][this');
              }
              if (
                this.fieldinlineAPIs[k] == this.discount ||
                this.fieldinlineAPIs[k] == this.price
              ) {
                if (
                  this.netPrice &&
                  this.listPrice &&
                  obj[this.discount] &&
                  obj[this.listPrice]
                ) {
console.log(JSON.stringify(obj)+' HandleSave');
                  if (obj.discountoption == "Amount") {
                    obj[this.netPrice] =
                      obj[this.listPrice] - obj[this.discount];
                  } else {
                    obj[this.netPrice] =
                      obj[this.listPrice] -
                      (obj[this.listPrice] * obj[this.discount]) / 100;
                  }
                } else if (this.listPrice && this.netPrice) {
                  obj[this.netPrice] = obj[this.listPrice];
                }
              }
            }
          }
        }
      }

      this.mapProductData[obj.recordIndex] = obj;
      console.log(obj + '  obj ');
      //  console.log( typeof  obj.recordIndex+'  typeof ');
      obj.recordIndex = parseInt(obj.recordIndex);
      //    console.log(   obj.recordIndex+'  afterobj ');
      //  console.log( typeof  obj.recordIndex+'  aftertypeof ');
       if(obj.customdiscount){
          prodatawithcustomdiscount.push(obj);
       
        }
        else{
             dataArray.push(obj);
        }
    }

    if (prodatawithcustomdiscount.length > 0) {
 customPriceCalculation({ agreementdata: JSON.stringify(prodatawithcustomdiscount) })
        .then((result) => {
            console.log('Processed result:', JSON.stringify(result));
            result.forEach(res => {
    this.mapProductData[res.recordIndex] = res;
});
             this.productData =result.length>0?result.concat(dataArray):dataArray;
    
        })
        .catch((error) => {
            console.error('Error:', error);
        });
} else {
    
    this.productData = dataArray;
    if (dataArray.length >= 1) {
      let checkingvalue=true;
      this.displayerror = false;
      const displayerror = { displayerror: this.displayerror, checkingvalue: checkingvalue };
      const errormsg1 = new CustomEvent("errormsg", {
        detail: displayerror,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(errormsg1);
    }
}
    console.log(JSON.stringify(this.productData) + 'dataArray');

    this.saveDraftValues = [];
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Success!!",
        message: "Saved Successfully!!!",
        variant: "success"
      })
    );
    const arr = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      arr.push(obj);
    }
    let datawithindex = { productdata: arr, index: this.index };
    const discountdata = new CustomEvent("discount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.selectedids = [];

        
        }
      })
      .catch((error) => {
        this.error = error;
      });
   
  }
  handledropdownselected(event) {
    const { selectedRecord, rowId } = event.detail;
    this.productData = this.productData.map(product => {
        if (product.recordIndex === rowId) {
            return { ...product, bonus: selectedRecord,selectedValue: selectedRecord};
        }
        return product;
    });
    console.log(JSON.stringify(this.productData)+'prdouct data');
    const draftObj = { recordIndex: rowId, bonus: selectedRecord,selectedValue: selectedRecord };

    if (Object.keys(draftObj).length > 0) {
        this.mapProductData[draftObj.recordIndex] = draftObj;
        this.saveDraftValues = [
            ...this.saveDraftValues.filter(item => item.recordIndex !== rowId),
            draftObj,
        ];
    }
  }

  onrowaction(event) {
    const id = event.detail.index;
    this.totalNetPrice = 0;

    this.inlinerecordindex = event.detail.index;

    if (event.detail.name == "Discounts") {
      var obj = [];
      const proddata = this.productData.filter(
        (element) => element.recordIndex == this.inlinerecordindex
      ); for (var i = 0; i < proddata.length; i++) {
        if (this.inlinerecordindex == proddata[i].recordIndex && proddata[i].selectedDropdownValue != '') {
          obj = { ...proddata[i] };
          break
        }
      }
      this.isInlinepopup = true;
      console.log(obj.selectedDropdownValue + 'obj.selectedDropdownValue==');
       for (var j = 0; j < this.inlineEditCol.length; j++) {
       if (this.inlineEditCol[j].customdiscount == true &&  obj.customdiscount == true) {
                  this.inlineEditCol[j].inputValue = obj[this.inlineEditCol[j].fieldName]?obj[this.inlineEditCol[j].fieldName]:'';
          



          }
       }

      if (this.itemListmap[this.inlinerecordindex] && obj.selectedDropdownValue == 'Volume' ) {
        for (var j = 0; j < this.inlineEditCol.length; j++) {
            if( 
          this.inlineEditCol[j].reqDropdown == true){
          this.inlineEditCol[j].inputValue = "";
          this.inlineEditCol[j].selectedDropdownValue = "Volume";
          this.inlineEditCol[j].discountoption = "";

          }
        }
        this.itemList = this.itemListmap[this.inlinerecordindex];

        this.Volumediscount = true;
      }
      else if (obj.selectedDropdownValue == 'Flat' && this.flatmap[this.inlinerecordindex]) {

        console.log(this.flatmap[this.inlinerecordindex] + 'mappp');
        for (var j = 0; j < this.inlineEditCol.length; j++) {
            if( 
          this.inlineEditCol[j].reqDropdown == true){
          this.inlineEditCol[j].inputValue = obj.discount;
          this.inlineEditCol[j].selectedDropdownValue = "Flat";
          this.inlineEditCol[j].discountoption = obj.discountoption;
          }

        }
        this.flatdiscount = true;

      }
      
      else {
        for (var j = 0; j < this.inlineEditCol.length; j++) {
          this.inlineEditCol[j].inputValue = "";
          this.inlineEditCol[j].selectedDropdownValue = "";
          this.inlineEditCol[j].discountoption = "";
        }
      }
      console.log(JSON.stringify(this.inlineEditCol)+' This.inline');
    }
    else if (event.detail.name == "Apply Promotions") {
      const selectedProductIndex= event.detail.index;
      this.promoDataModal(selectedProductIndex);
    }
    this.disableicon = this.itemList.length > 1 ? false : true;
  }
  closeinlineEditPopup() {
    this.isInlinepopup = false;
    this.flatdiscount = false;
    this.Volumediscount = false;
    this.itemList = [
      {
        id: 0
      }
    ];
                    console.log(JSON.stringify( this.itemListmap)+' this.itemListmap');
  }

  toggleInput() {
    this.showInput = !this.showInput;
  }

  doSorting(event) {
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortData(this.sortBy, this.sortDirection);
  }

  sortData(fieldname, direction) {
    let parseData = JSON.parse(JSON.stringify(this.productData));

    if (this.mapSortColumn[fieldname]) {
      fieldname = this.mapSortColumn[fieldname];
    }

    let keyValue = (a) => {
      return a[fieldname];
    };
    // cheking reverse direction
    let isReverse = direction === "asc" ? 1 : -1;
    // sorting data
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : ""; // handling null values
      y = keyValue(y) ? keyValue(y) : "";
      // sorting values based on direction
      return isReverse * ((x > y) - (y > x));
    });
    this.productData = parseData;
  }

  handleHeaderAction(event) {
    const actionName = event.detail.action.name;
    if (actionName.search("filter") === -1 && actionName.search("clear") === -1)
      return;
    const colDef = event.detail.columnDefinition;
    const columnName = colDef.fieldName;
    const findIndexByName = (name) => {
      const lowerCaseName = name.toLowerCase();
      return this.columns.findIndex(
        (column) =>
          column.fieldName.toLowerCase() === lowerCaseName ||
          column.fieldName.toLowerCase().endsWith(`${lowerCaseName}__c`)
      );
    };
    this.columnIndex = findIndexByName(columnName);
    const fieldNameWithC = this.columns[this.columnIndex].label;
    this.inputLabel = "Filter for " + this.columns[this.columnIndex].label;

    switch (actionName) {
      case "filter":
        this.handleOpenFilterInput();
        break;
      case "clear":
        const filterColumnName = this.columns[this.columnIndex].fieldName;
        delete this.columnFilterValues[filterColumnName];
        this.handleFilterRecords(actionName);
        this.columns[this.columnIndex].actions = this.columns[
          this.columnIndex
        ].actions.map((action) => {
          if (action.name === "clear") {
            return { ...action, disabled: true };
          }
          return action;
        });
        break;

      default:
    }
  }

  handleOpenFilterInput() {
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.filterAppliedValue = this.mapFilterData[filterColumnName];
    this.isOpenFilterInput = true;
  }

  handleFilterRecords(actionName) {
    var initialArray = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      initialArray.push(obj);
    }
    this.initialRecords = initialArray;
    var dataArray = [...this.initialRecords];
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.mapFilterData[filterColumnName] = this.filterAppliedValue;
    this.columns.forEach((column) => {
      var filterValue = this.columnFilterValues[column.fieldName];
      if (filterValue) {
        dataArray = dataArray.filter((row) => {
          var recName;
          if (column.type == "customName") {
            recName = row[column.typeAttributes.fieldapiname]
              ? row[column.typeAttributes.fieldapiname]
              : "";
          } else {
            recName = row[column.fieldName];
          }
          const regex = new RegExp(filterValue, "i");
          if (regex.test(recName)) {
            return true;
          }
          return false;
        });
      }
    });
    this.columns[this.columnIndex].actions = this.columns[
      this.columnIndex
    ].actions.map((action) => {
      if (action.name === "clear") {
        return { ...action, disabled: false };
      }
      return action;
    });
    this.columns = [...this.columns];

    if (this.searchKey) {
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
    this.productData = dataArray;
    this.closeFilterModal();
    if (this.template.querySelector(".divDataTable")) {
      if (actionName === "clear") {
        this.addCustomStyle("span", "#f3f3f3");
        this.addCustomStyle("span a.slds-th__action", "#f3f3f3");
      } else {
        this.addCustomStyle("span", "#a0cfa0");
        this.addCustomStyle("span a.slds-th__action", "#a0cfa0");
        this.addCustomStyle(".slds-dropdown__item", "transparent");
        this.addCustomStyle(".slds-dropdown__item span", "transparent");
        this.addCustomStyle(".span a.slds-th__action:focus:hover", "#a0cfa0");
      }
    }
  }

  addCustomStyle(selector, backgroundColor) {
    let style = document.createElement("style");
    style.innerText =
      ".divDataTable .slds-table thead th:nth-child(" +
      (this.columnIndex + 3) +
      ") " +
      selector +
      " { background-color: " +
      backgroundColor +
      ";}";
    this.template.querySelector(".divDataTable").appendChild(style);
  }


  promoDataModal(selectedProductIndex){
    const selectedProduct = [this.productData[selectedProductIndex - 1]];
    getRecordsFromPromoAction({
      productData: JSON.stringify(selectedProduct)
    })
    .then(result => {
      this.promodata = result;
      this.isPromoModalOpen = true;
    })
    .catch(error => {
      console.error('Error fetching records:', error);
    });
  }
  handleRowSelection(event){
    const selectedRows = event.detail.selectedRows;
    console.log('selectedRows :'+JSON.stringify(selectedRows));
  }
  closePromoModal(){
    this.isPromoModalOpen=false;
  }
  applyPromotion(){
    //Apply Promotion on Product
  }




  handleChange(event) {
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.columnFilterValues[filterColumnName] = event.target.value;
    this.filterAppliedValue = event.target.value;
  }
  onRowSelection(event) {
    if(event.detail.config.action!=undefined){
        let updatedItemsSet = new Set();
        let selectedItemsSet = new Set(this.selectedids);
        let loadedItemsSet = new Set();

        this.productData.map((ele) => {
            loadedItemsSet.add(ele.recordIndex);
        });

        if (event.detail.selectedRows) {
            event.detail.selectedRows.map((ele) => {
                updatedItemsSet.add(ele.recordIndex);
            });
            updatedItemsSet.forEach((id) => {
                if (!selectedItemsSet.has(id)) {
                    selectedItemsSet.add(id);
                }
            });
        }

        loadedItemsSet.forEach((id) => {
            if (selectedItemsSet.has(id) && !updatedItemsSet.has(id)) {
                selectedItemsSet.delete(id);
            }
        });
          this.selectedids = [...selectedItemsSet];
          console.log('selectedids==> ' + JSON.stringify(this.selectedids));
      }
      
      console.log('event.detail.config.action'  + event.detail.config.action);
      console.log('selectedids rows :::handlesearch ' + this.selectedids);
    }
    cloneProducts() {
      var selectedRecords = this.template
        .querySelector("c-agreement-custom-data-table")
        .getSelectedRows()?this.template
        .querySelector("c-agreement-custom-data-table")
        .getSelectedRows():'';
        console.log('clone record :: '+selectedRecords);
      this.selectedrows = selectedRecords;
      const selectedIds = Array.from(selectedRecords).map(
        (item) => item.recordIndex
      );

      this.selectedids = selectedIds;
    console.log('selectedIds record :: '+selectedIds);
    console.log('this.itemListmap :: '+JSON.stringify(this.itemListmap));
      const productDataWithIndex = this.selectedrows.map((record, i) => {
        let oldrecindex = record.recordIndex;
        console.log('this.oldrecindex :: '+oldrecindex);
        let itemlstrec = this.itemListmap[record.recordIndex];
        let aa=[];
        console.log('this.itemlstrec :: '+itemlstrec);
        let index = this.index++;
        console.log('this.index :: '+index);
        if(itemlstrec){
        aa = itemlstrec.filter((record) => {
          if (record.dataindex == oldrecindex) {
            return { ...record };
          }
        })
          .map(record => ({ ...record, dataindex: index }));
        console.log(JSON.stringify(aa) + 'aa');
        console.log(JSON.stringify(itemlstrec) + 'itemlstrec');
        this.itemListmap[index] = aa;
        }else if(record.selectedDropdownValue == 'Flat'){
          this.flatmap[index]=[ { ...record, recordIndex: index }];
        }
        return { ...record, recordIndex: index };
      });
      console.log(JSON.stringify(productDataWithIndex) + 'productDataWithIndex');
      console.log(JSON.stringify(this.itemListmap) + 'itemListmap');
      const cloningdata = [...this.productData];
      cloningdata.push(...productDataWithIndex);
      this.productData = cloningdata;

      console.log(JSON.stringify(this.productData) + 'this.productData');
      const initalrec = [...this.initialRecords];
      initalrec.push(...productDataWithIndex);
      this.initialRecords = initalrec;
      const arr = [];
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }

      let datawithindex = { productdata: arr, index: this.index };

      const discountdata = new CustomEvent("discount", {
        detail: datawithindex,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(discountdata);

      this.selectedrows = [];
      this.selectedids = [];
  }
  deleterecords() {
    var selectedRecords = this.template
      .querySelector("c-agreement-custom-data-table")
      .getSelectedRows()?this.template
      .querySelector("c-agreement-custom-data-table")
      .getSelectedRows():'';
    if (selectedRecords) {
      this.selectedrows = selectedRecords;
      const selectedIds = Array.from(selectedRecords).map(
        (item) => item.recordIndex
      );
      this.selectedids = selectedIds;


      this.productData = this.productData.filter((record) => {
        return !this.selectedrows.some(
          (selected) => selected.recordIndex === record.recordIndex
        );
      });
      const initrec = this.initialRecords.filter((record) => {
        return !this.selectedrows.some(
          (selected) => selected.recordIndex == record.recordIndex
        );
      });
      this.initialRecords = initrec;
      selectedRecords.forEach((record) => {
        this.mapProductData.delete(record.recordIndex);
      });
      const arr = [];
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }
      for (let selectedid of this.selectedids) {
        let id = selectedid.toString();
        this.itemListmap.delete(id);
      }
      let datawithindex = { productdata: arr, index: this.index };
      selectedIds.forEach(id => {

        delete this.itemListmap[id];

      });
      let k = Object.keys(this.itemListmap);

      let newmap = new Map();
      for (let key of k) {
        let filteredRecords = this.itemListmap[key].filter(record => !selectedIds.includes(record.dataindex));
        newmap[key] = filteredRecords;
      }
      this.itemListmap = newmap;



      const discountdata = new CustomEvent("discount", {
        detail: datawithindex,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(discountdata);

      const deletedata = new CustomEvent("productdatadelete", {
        detail: selectedRecords,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(deletedata);
    }
    console.log(JSON.stringify(selectedRecords) + 'selectedRecords');
     this.selectedrows=[];
         this.selectedids=[];

  }

  closeFilterModal() {
    this.isOpenFilterInput = false;
    this.filterAppliedValue = "";
  }

  renderedCallback() {
    if (!this.componentLoaded) {
      if (this.template.querySelector(".divDataTable")) {
        this.applyStyles(
          ".divDataTable",
          ".slds-is-absolute {position: fixed;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".slds-button_icon.slds-input__icon {z-index: 0;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".slds-input__icon.slds-icon-utility-down {z-index: 0;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".slds-truncate {overflow: visible;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".divDataTable lightning-button-icon:nth-child(2) .slds-button_icon svg {width: 1.5rem;height: 1.5rem;}"
        );
        this.applyStyles(
          ".divDataTable",
          ".divDataTable lightning-button-icon:nth-child(1) .slds-button_icon svg {width: 1rem;height: 1rem;}"
        );
      }

      this.applyStyles(
        ".divDataTable",
        ".divDataTable .dt-outer-container .slds-table_header-fixed_container {background-color : white}"
      );

      this.componentLoaded = true;
    }
  }

  applyStyles(selector, innerText) {
    if (this.template.querySelector(selector)) {
      let style = document.createElement("style");
      style.innerText = innerText;
      this.template.querySelector(selector).appendChild(style);
    }
  }


  onvalidateProduct(event) {
    let checkingvalue;
    let errormsg;
    if(this.productData.length>0)
    {

     console.log(JSON.stringify(this.productData) + 'before result');
    Agreementlineitemsvalidate({
      agreementLineItemData: JSON.stringify(this.productData)
    })
      .then((result) => {
       console.log(JSON.stringify(result) + 'result');
        if (result) {
             this.displayerror = true;
        checkingvalue=true;
        errormsg=result;
           console.log('this.displayerror' +this.displayerror);
          let displayerror = { displayerror: this.displayerror, checkingvalue: checkingvalue,errormsg: errormsg };
           console.log('this.displayerror' +JSON.stringify(displayerror));
          let errormsg1 = new CustomEvent("errormsg", {
            detail: displayerror,
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(errormsg1);
           console.log('this.errormsg1' +JSON.stringify(errormsg1));
        } else {
          this.displayerror = false;
           checkingvalue=false;
          const displayerror = { displayerror: this.displayerror, checkingvalue: checkingvalue };
          const errormsg1 = new CustomEvent("errormsg", {
            detail: displayerror,
            bubbles: true,
            composed: true
          });
          const event = new ShowToastEvent({
                title: "Success",
                message: "Cart validated successfully! No errors found!",
                variant: "Success",
                mode: "dismissable"
            });


            this.dispatchEvent(event);
          this.dispatchEvent(errormsg1);

        }
        console.log(JSON.stringify(result) + 'result');
      })
      .catch((error) => {
        this.error = error;
      });
    }
    else
    {

    const event = new ShowToastEvent({
                title: "Error",
                message: "Add Products To Perform Cart Validations",
                variant: "Error",
                mode: "dismissable"
            });
          this.dispatchEvent(event);
            }
  }
  onValidatePricing(event) {
         console.log(JSON.stringify(this.productData) + 'before result');
    AgreementPricevalidate({
      agreementLineItemData: JSON.stringify(this.productData)
    })
      .then((result) => {
        this.productData = result.length>=1?result:this.productData;
        console.log(JSON.stringify(result) + 'result');
             console.log(JSON.stringify(this.productData) + 'after result');
        const event = new ShowToastEvent({
                title: "Success",
                message: "Cart calculations performed successfully!",
                variant: "Success",
                mode: "dismissable"
            });
            if(this.productData.length >0)
            {
                this.dispatchEvent(event);
            }

            else{
              const event = new ShowToastEvent({
                title: "Error",
                message: "Add Products To Perform Validations",
                variant: "Error",
                mode: "dismissable"
            });
          this.dispatchEvent(event);
            }
      })
      .catch((error) => {
        this.error = error;
        console.log(JSON.stringify(error)+'error');
         console.log(JSON.stringify(error.message)+'errormessage');
         this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: "Both Quantity in Invoice and qty out of invoice cannot have value simultaneously.",
                    variant: 'error'
                })
            );
            
      });
  }
}