import { LightningElement, track, wire, api } from "lwc";
import getColumns from "@salesforce/apex/ProductController.getColumns";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import getButtonsInfo from "@salesforce/apex/ProductController.getButtonsInfo";
import LightningConfirm from "lightning/confirm";
import getButtonsAction from "@salesforce/apex/ProductController.getButtonsAction";
import fetchRangePricing from "@salesforce/apex/ProductController.fetchRangePricing";
import contractpricing from "@salesforce/apex/ProductController.contractpricing";
/**import getPromotionButtonsAction from "@salesforce/apex/ProductController.getPromotionButtonsAction";**/
import getRecordsFromPromoAction from "@salesforce/apex/ProductController.getRecordsFromPromoAction";
import applyPromotionToProduct from "@salesforce/apex/ProductController.applyPromotionToProduct";


export default class ProductsSummary extends NavigationMixin(LightningElement) {
  @track selectedrows = [];
  @track selectedids = "";
  @track columns;
  @api initialRecords;
  @track sortBy;
  @track sortDirection = "asc";
  @track totalNetPrice = 0;
  @api index;
  @api fields;
  @track isOpenFilterInput = false;
  @track filterAppliedValue = "";
  @track dataLoading = false;
  @track appliedStyle;
  @track isMassEditPopup = false;
  @track isInlinepopup = false;
  @track cartCount = 1;
  @api recordId;
  @api productData;
  @track discountmap = new Map();
  componentLoaded = false;
  discount;
  quantity;
  price;
  listPrice;
  netPrice;
  columnIndex;
  saveDraftValues = [];
  inlineEditCol = [];
  massColumnUpdates = [];
  cancelArray = [];
  mapFilterData = new Map();
  columnFilterValues = new Map();
  mapSortColumn = new Map();
  mapProductData = new Map();
  @api initialData;
  @track fieldinlineAPIs = [];
  @track inlinerecordindex = "";
  @track buttondata = [];
  @track chartConfiguration;
  @track barchart = false;
  @track searchKey = '';

  //added by K
  @track isModalOpen = false;
  @track Promodata = [];
  @track selectedPromotion;
  modalColumns = [
    {label: 'Name', fieldName: 'Name', type: 'text' },
    {label: 'Adjustment Type', fieldName: 'Adjustment_Type__c', type: 'text' },
    {label: 'Adjustment Amount', fieldName: 'Adjustment_Amount__c', type: 'currency' }
  ];


  get typeOptions() {
    let options = [
      { label: "Discount %", value: "Percent" },
      { label: "Discount Amount", value: "Amount" }
    ];

    if (this.isInlinepopup) {
      options.push({ label: "Base Price Override", value: "PriceOverride" });
    }

    return options;
  }

  loadButtons() {
    getButtonsInfo({ compName: "Pricing_Products" })
      .then((result) => {
        this.buttondata = result;
      })
      .catch((error) => {
        this.error = error;
      });
  }

  connectedCallback() {
    this.loadButtons();
  }

  @wire(getColumns, { columnData: "Price_Products" }) wiredColumns({
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
            this.discount = this.columns[i].typeAttributes.discount
              ? this.columns[i].typeAttributes.discount
              : "";
            this.quantity = this.columns[i].typeAttributes.quantity
              ? this.columns[i].typeAttributes.quantity
              : "";
            this.price = this.columns[i].typeAttributes.price
              ? this.columns[i].typeAttributes.price
              : "";
            this.listPrice = this.columns[i].typeAttributes.listPrice
              ? this.columns[i].typeAttributes.listPrice
              : "";
            this.netPrice = this.columns[i].typeAttributes.netPrice
              ? this.columns[i].typeAttributes.netPrice
              : "";
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
            massColObj.regularType = true;
            massColObj.reqDropdown =
              this.columns[i].typeAttributes.reqDropdown == "true"
                ? true
                : false;
            massColObj.label =
              this.columns[i].typeAttributes.reqDropdown == "true"
                ? "Discount Value"
                : this.columns[i].label;
            massColObj.selectedDropdownValue = "";
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
            this.addfield = this.columns[i].typeAttributes.addfield;
          } else if (this.columns[i].type == "customCombox") {
            inlinecol.combobox = true;
            inlinecol.selectedField =
              this.columns[i].typeAttributes.selectedValue.fieldName;
          } else {
            inlinecol.regularType = true;
            inlinecol.reqDropdown =
              this.columns[i].typeAttributes.reqDropdown == "true"
                ? true
                : false;
            inlinecol.label =
              this.columns[i].typeAttributes.reqDropdown == "true"
                ? "Discount Value"
                : this.columns[i].label;
            inlinecol.selectedDropdownValue = "";
            inlinecol.inputValue = "";
          }
          this.inlineEditCol.push(inlinecol);
        }
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
    } else if (error) {
      console.log(error);
    }
  }

  openMassEditPopup() {
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
    if (selectedRecords.length > 0) {
      for (var j = 0; j < this.massColumnUpdates.length; j++) {
        this.massColumnUpdates[j].inputValue = "";
        this.massColumnUpdates[j].selectedDropdownValue = "";
      }
      var addedOptions = [];
      for (var i = 0; i < selectedRecords.length; i++) {
        if (selectedRecords[i].options) {
          for (var j = 0; j < selectedRecords[i].options.length; j++) {
            if (!addedOptions.includes(selectedRecords[i].options[j].value)) {
              if (!this.comboboxValue) {
                this.comboboxValue = selectedRecords[i].options[j].value;
              }
              var optionObj = {};
              optionObj.label = selectedRecords[i].options[j].label;
              optionObj.value = selectedRecords[i].options[j].value;
              optionObj.description = selectedRecords[i].options[j].description;
              addedOptions.push(optionObj.value);
            }
          }
        }
      }
      this.isMassEditPopup = true;
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Mass Edit.",
          message: "Please select atleast one row.",
          variant: "error"
        })
      );
    }
  }

  updateMassEditPopup() {
    let typeval = true;
    let nullval = true;
    var dataArray = [];
    var editedArray = [];
    this.cancelArray = [...this.productData];
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
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
          const event = new ShowToastEvent({
            title: "Error",
            message: "Please Select Discount Type",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          typeval = false;
          break;
        } else if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue != "" &&
          nullval == false &&
          this.massColumnUpdates[j].inputValue == ""
        ) {
          const event = new ShowToastEvent({
            title: "Error",
            message: "Please Enter Discount",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          typeval = false;
          break;
        }
        if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Percent" &&
          this.massColumnUpdates[j].inputValue > 100 &&
          nullval == false &&
          typeval == true
        ) {
          const event = new ShowToastEvent({
            title: "Error",
            message: "Discount more than 100%",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          typeval = false;
          break;
        }
        if (
          this.massColumnUpdates[j].reqDropdown &&
          this.massColumnUpdates[j].selectedDropdownValue == "Amount" &&
          this.massColumnUpdates[j].inputValue > selectedRecords[i].listPrice &&
          nullval == false &&
          typeval == true
        ) {
          const event = new ShowToastEvent({
            title: "Error",
            message: "Discount more than List Price",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          typeval = false;
          break;
        }
      }
    }
    if (nullval == true) {
      const event = new ShowToastEvent({
        title: "Error",
        message: "No Values entered",
        variant: "error",
        mode: "dismissable"
      });
      this.dispatchEvent(event);
      typeval = false;
    }

    if (selectedRecords.length > 0 && typeval == true && nullval == false) {
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        for (var l = 0; l < selectedRecords.length; l++) {
          if (selectedRecords[l].recordIndex == obj.recordIndex) {
            var draftObj = {};
            for (var j = 0; j < this.massColumnUpdates.length; j++) {
              if (this.massColumnUpdates[j].inputValue) {
                draftObj.recordIndex = obj.recordIndex;
                if (this.massColumnUpdates[j].type == "customName") {
                  obj[this.massColumnUpdates[j].fieldName] =
                    this.massColumnUpdates[j].inputValue;
                  draftObj[this.massColumnUpdates[j].fieldName] =
                    this.massColumnUpdates[j].inputValue;
                } else if (this.massColumnUpdates[j].type == "customCombox") {
                  var hasValue = false;
                  for (var k = 0; k < obj.options.length; k++) {
                    if (
                      obj.options[k].value ==
                      this.massColumnUpdates[j].inputValue
                    ) {
                      hasValue = true;
                    }
                  }
                  if (hasValue) {
                    obj[this.massColumnUpdates[j].selectedField] =
                      this.massColumnUpdates[j].inputValue;
                    draftObj[this.massColumnUpdates[j].fieldName] =
                      this.massColumnUpdates[j].inputValue;
                  }
                } else {
                  if (this.massColumnUpdates[j].reqDropdown) {
                    obj.selectedDropdownValue =
                      this.massColumnUpdates[j].selectedDropdownValue;
                  }
                  obj[this.massColumnUpdates[j].fieldName] =
                    this.massColumnUpdates[j].inputValue;
                  if (this.massColumnUpdates[j].fieldName == this.discount) {
                    obj.adddiscount = this.massColumnUpdates[j].inputValue;
                    console.log(obj.adddiscount + 'adddiscount');
                  }
                  draftObj[this.massColumnUpdates[j].fieldName] =
                    this.massColumnUpdates[j].inputValue;
                }
              }
              editedArray.push(draftObj);
              this.discountmap[obj.recordIndex] = obj;
            }
          }
        }
        this.mapProductData[obj.recordIndex] = obj;
        dataArray.push(obj);
      }
      this.productData = dataArray;
      this.saveDraftValues =
        this.saveDraftValues.length > 0
          ? this.saveDraftValues.concat(editedArray)
          : editedArray;
      this.closeMassEditPopup();
      this.selectedids = [];
    }
  }
  updateinlineEditPopup() {
    let inlinetypeval = true;
    let valuenull = true;
    var dataArray = [];
    var editedArray = [];
    this.cancelArray = [...this.productData];
    const proddata = this.productData.filter(
      (element) => element.recordIndex == this.inlinerecordindex
    );
    for (var j = 0; j < this.inlineEditCol.length; j++) {
      for (var i = 0; i < proddata.length; i++) {

        if (this.inlineEditCol[j].inputValue) {
          valuenull = false;
        }
        if (
          this.inlineEditCol[j].reqDropdown &&
          this.inlineEditCol[j].selectedDropdownValue == "" &&
          valuenull == false &&
          this.inlineEditCol[j].inputValue != ""
        ) {
          const event = new ShowToastEvent({
            title: "Error",
            message: "Please Select Discount Type",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          inlinetypeval = false;
          break;
        }
        if (
          this.inlineEditCol[j].reqDropdown &&
          this.inlineEditCol[j].selectedDropdownValue == "Percent" &&
          this.inlineEditCol[j].inputValue > 100 &&
          valuenull == false &&
          inlinetypeval == true
        ) {
          const event = new ShowToastEvent({
            title: "Error",
            message: "Discount more than 100%",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          inlinetypeval = false;
          break;
        }
        if (
          this.inlineEditCol[j].reqDropdown &&
          this.inlineEditCol[j].selectedDropdownValue == "Amount" &&
          this.inlineEditCol[j].inputValue > proddata[i].listPrice &&
          valuenull == false &&
          inlinetypeval == true
        ) {
          const event = new ShowToastEvent({
            title: "Error",
            message: "Discount more than List Price",
            variant: "error",
            mode: "dismissable"
          });
          this.dispatchEvent(event);
          inlinetypeval = false;
          break;
        }
      }
    }
    if (valuenull == true) {
      const event = new ShowToastEvent({
        title: "Error",
        message: "No Values entered",
        variant: "error",
        mode: "dismissable"
      });
      this.dispatchEvent(event);
      inlinetypeval = false;
    }
    if (this.inlinerecordindex && valuenull == false && inlinetypeval == true) {
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        if (this.inlinerecordindex == obj.recordIndex) {
          var draftObj = {};
          for (var j = 0; j < this.inlineEditCol.length; j++) {
            if (this.inlineEditCol[j].inputValue) {
              valuenull = false;
              draftObj.recordIndex = obj.recordIndex;
              if (this.inlineEditCol[j].type == "customName") {
                obj[this.inlineEditCol[j].fieldName] =
                  this.inlineEditCol[j].inputValue;
                draftObj[this.inlineEditCol[j].fieldName] =
                  this.inlineEditCol[j].inputValue;
              } else if (this.inlineEditCol[j].type == "customCombox") {
                var hasValue = false;
                for (var k = 0; k < obj.options.length; k++) {
                  if (
                    obj.options[k].value == this.inlineEditCol[j].inputValue
                  ) {
                    hasValue = true;
                  }
                }
                if (hasValue) {
                  obj[this.inlineEditCol[j].selectedField] =
                    this.inlineEditCol[j].inputValue;
                  draftObj[this.inlineEditCol[j].fieldName] =
                    this.inlineEditCol[j].inputValue;
                }
              } else {
                if (this.inlineEditCol[j].reqDropdown) {
                  obj.selectedDropdownValue =
                    this.inlineEditCol[j].selectedDropdownValue;

                  if (obj.selectedDropdownValue == "PriceOverride") {
                    obj[this.price] = this.inlineEditCol[j].inputValue;
                    draftObj[this.price] = this.inlineEditCol[j].inputValue;
                    obj.baseprice = this.inlineEditCol[j].inputValue;
                    draftObj.baseprice = this.inlineEditCol[j].inputValue;
                  } else {
                    obj[this.inlineEditCol[j].fieldName] =
                      this.inlineEditCol[j].inputValue;
                    if (obj.selectedDropdownValue == "Percent" || obj.selectedDropdownValue == "Amount") {
                      obj.adddiscount = this.inlineEditCol[j].inputValue;
                      console.log(obj.adddiscount + 'adddiscount');
                    }
                    draftObj[this.inlineEditCol[j].fieldName] =
                      this.inlineEditCol[j].inputValue;
                  }
                }
              }
            }
          }
          editedArray.push(draftObj);
          this.discountmap[obj.recordIndex] = obj;
        }

        this.mapProductData[obj.recordIndex] = obj;
        dataArray.push(obj);

      }

      this.productData = dataArray;
      this.saveDraftValues =
        this.saveDraftValues.length > 0
          ? this.saveDraftValues.concat(editedArray)
          : editedArray;
      this.closeinlineEditPopup();
      this.selectedids = [];
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
  handleConfirmClick(event) {
    this.productData = this.initialData;
    this.initialRecords = this.initialData;
    this.discountmap = new Map();
    this.mapProductData.clear();
    let datawithindex = { productdata: this.initialData, index: this.index };
    const discountdata = new CustomEvent("productdiscount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    for (var i = 0; i < this.initialData.length; i++) {
      var obj = { ...this.initialData[i] };
      this.totalNetPrice =
        Number(this.totalNetPrice) + Number(obj[this.netPrice]);
    }
    this.cartCount = this.initialRecords.length;
    let totalwithcount = {
      netTotal: this.totalNetPrice,
      count: this.cartCount
    };
    const netPriceEvent = new CustomEvent("totalnetprice", {
      detail: totalwithcount,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(netPriceEvent);
    this.totalNetPrice = 0;
  }
  handleSearch(event) {
    const searchKey = event.target.value.toLowerCase();
    this.searchKey = searchKey;
    var initialArray = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      initialArray.push(obj);
    }

    if (searchKey) {
      if (initialArray) {
        let searchRecords = [];
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
        this.productData = searchRecords;
      }
    } else {
      let arr = [];
      for (var i = 0; i < this.initialRecords.length; i++) {
        var obj = { ...this.initialRecords[i] };
        obj = this.mapProductData[obj.recordIndex]
          ? this.mapProductData[obj.recordIndex]
          : obj;
        arr.push(obj);
      }
      this.columns.forEach((column) => {
        var filterValue = this.columnFilterValues[column.fieldName];
        console.log(JSON.stringify(filterValue) + 'filterValue');
        if (filterValue) {
          console.log(JSON.stringify(arr) + 'before in');
          arr = arr.filter((row) => {
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
          console.log(JSON.stringify(arr) + 'in');
        }
      });

      this.productData = arr;
    }
  }

  handleCancel() {
    if (this.cancelArray.length > 0) {
      this.productData = this.cancelArray;
      this.cancelArray = [];
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
        } else if (
          event.target.name == "DiscountType" &&
          this.inlineEditCol[j].reqDropdown == true
        ) {
          this.inlineEditCol[j].selectedDropdownValue = event.detail.value;
        }
      }
    } else {
      for (var j = 0; j < this.massColumnUpdates.length; j++) {
        if (this.massColumnUpdates[j].fieldName == event.target.name) {
          this.massColumnUpdates[j].inputValue =
            this.massColumnUpdates[j].type == "customName"
              ? event.detail.recordId
              : event.detail.value;
        } else if (
          event.target.name == "DiscountType" &&
          this.massColumnUpdates[j].reqDropdown == true
        ) {
          this.massColumnUpdates[j].selectedDropdownValue = event.detail.value;
        }
      }
    }
  }
  closeMassEditPopup() {
    this.selectedids = [];
    this.isMassEditPopup = false;
  }

  handleButtonActions(event) {
    if (event.target.label == "ATP View and Stock") {
      getButtonsAction({
        buttonLabel: event.target.label,
        productData: JSON.stringify(this.productData)
      })
        .then((result) => {
          this.productData = result;
        })
        .catch((error) => {
          this.error = error;
        });
    } else if (event.target.label == "Apply Promotions") {
      console.log('keer');
      this.openmodal();
    }

    /*getPromotionButtonsAction({
      buttonLabel: event.target.label,
      productData: JSON.stringify(this.productData)
    })
      .then((result) => {
        this.productData = result;
      })
      .catch((error) => {
        this.error = error;
      });
  }*/
    else if (event.target.label == "Best Contract Price") {
      console.log(JSON.stringify(this.fields) + 'fields');
      contractpricing({
        fields: JSON.stringify(this.fields),
        productdata: JSON.stringify(this.productData)
      })
        .then((result) => {
          this.productData = result;
          for (let i = 0; i < result.length; i++) {
            this.mapProductData[result[i].recordIndex] = result[i];
          }
          this.handleAfterSave();
        })
        .catch((error) => {
          this.error = error;
        });
    }
  }

  handleSave(event) {
    this.saveDraftValues = event.detail.draftValues;
    var dataArray = [];
    let quantityUpdated = false;
    for (var i = 0; i < this.saveDraftValues.length; i++) {
      if (this.saveDraftValues[i][this.quantity]) {
        quantityUpdated = false;
      }
    }
    if (quantityUpdated) {
      fetchRangePricing({
        fields: JSON.stringify(this.fields),
        saveDraftValues: JSON.stringify(this.saveDraftValues),
        productData: JSON.stringify(this.productData)
      })
        .then((result) => {
          if (result.length > 0) {
            this.productData = result;
            this.saveDraftValues = [];
            for (var i = 0; i < this.productData.length; i++) {
              this.mapProductData[this.productData[i].recordIndex] =
                this.productData[i];
            }
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Success!!",
                message: "Saved Successfully!!!",
                variant: "success"
              })
            );
          } else {
            this.productData = this.productData;
            this.saveDraftValues = [];
          }
          this.handleAfterSave();
        })
        .catch((error) => {
          this.error = error;
        });
    } else {
      for (var i = 0; i < this.productData.length; i++) {
        var obj = { ...this.productData[i] };
        for (var j = 0; j < this.saveDraftValues.length; j++) {
          if (
            this.productData[i].recordIndex ==
            this.saveDraftValues[j].recordIndex
          ) {
            for (var k = 0; k < this.fieldinlineAPIs.length; k++) {
              if (this.saveDraftValues[j][this.fieldinlineAPIs[k]]) {
                if (this.fieldinlineAPIs[k] == "aggrementVal") {
                  obj.selectedValue =
                    this.saveDraftValues[j][this.fieldinlineAPIs[k]];
                } else {
                  obj[this.fieldinlineAPIs[k]] =
                    this.saveDraftValues[j][this.fieldinlineAPIs[k]];
                }
                if (
                  this.fieldinlineAPIs[k] == this.quantity ||
                  this.fieldinlineAPIs[k] == this.discount ||
                  this.fieldinlineAPIs[k] == this.price
                ) {
                  if (
                    this.price &&
                    this.quantity &&
                    obj[this.price] &&
                    obj[this.quantity] &&
                    this.listPrice
                  ) {
                    obj[this.listPrice] = obj[this.price] * obj[this.quantity];
                    obj.baseprice =
                      obj[this.listPrice] -
                      (obj[this.listPrice] * obj.contractdiscount) / 100;
                    if (!obj.baseprice) {
                      obj.baseprice = obj[this.listPrice] * obj[this.quantity];
                      obj.baseprice =
                        obj[this.listPrice] -
                        (obj[this.listPrice] * obj.contractdiscount) / 100;
                    }
                  }
                  if (
                    this.netPrice &&
                    this.listPrice &&
                    obj[this.discount] &&
                    obj[this.listPrice]
                  ) {
                    if (obj.selectedDropdownValue == "Amount") {
                      obj[this.netPrice] = obj.baseprice - obj[this.discount];
                      obj[this.discount] = Math.round(((obj[this.listPrice] - obj[this.netPrice]) / obj[this.listPrice]) * 100);
                      console.log(obj[this.discount] + 'this.dis');
                    } else if (obj.selectedDropdownValue == "PriceOverride") {
                      obj.baseprice = obj[this.listPrice] * obj[this.quantity];
                      obj.baseprice =
                        obj[this.listPrice] -
                        (obj[this.listPrice] * obj.contractdiscount) / 100;
                      obj[this.netPrice] =
                        obj.baseprice -
                        (obj.baseprice * obj[this.discount]) / 100;
                    } else if (obj.selectedDropdownValue == "Percent") {
                      obj[this.netPrice] =
                        obj.baseprice -
                        (obj.baseprice * obj[this.discount]) / 100;
                      obj[this.discount] =
                        Math.round(((obj[this.listPrice] - obj[this.netPrice]) /
                          obj[this.listPrice]) *
                          100);
                    } else {
                      obj[this.netPrice] =
                        obj.baseprice -
                        (obj.baseprice * obj[this.discount]) / 100;
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
        dataArray.push(obj);
      }
      this.productData = dataArray;
      this.handleAfterSave();
    }
  }

  handleAfterSave() {
    const arr = [];
    this.totalNetPrice = 0;
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      this.totalNetPrice =
        Number(this.totalNetPrice) + Number(obj[this.netPrice]);
      arr.push(obj);
    }
    this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
    let datawithindex = { productdata: arr, index: this.index };
    const discountdata = new CustomEvent("productdiscount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.cartCount = this.initialRecords.length;
    let totalwithcount = {
      netTotal: this.totalNetPrice,
      count: this.cartCount
    };
    const netPriceEvent = new CustomEvent("totalnetprice", {
      detail: totalwithcount,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(netPriceEvent);
    this.totalNetPrice = 0;
    this.saveDraftValues = [];
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Success!!",
        message: "Saved Successfully!!!",
        variant: "success"
      })
    );
    this.selectedids = [];
  }

  onrowaction(event) {
    const id = event.detail.index;
    this.totalNetPrice = 0;
    this.inlinerecordindex = event.detail.index;
    console.log('detailname'+event.detail.name);
    if (event.detail.name == "Apply Promotions"){
        const proddata = this.productData.filter(
        (element) => element.recordIndex == this.inlinerecordindex
      ); 
      getRecordsFromPromoAction({
      productData: JSON.stringify(proddata)
    })
      .then(result => {
        this.promodata = result;
        this.isModalOpen = true;
      })
      .catch(error => {
        console.error('Error fetching records:', error);
      });
    }
    else if (event.detail.name == "Discounts") {

      this.isInlinepopup = true;
      var obj = [];
      const proddata = this.productData.filter(
        (element) => element.recordIndex == this.inlinerecordindex
      ); 
      for (var i = 0; i < proddata.length; i++) {
        if (this.inlinerecordindex == proddata[i].recordIndex && proddata[i].selectedDropdownValue != '') {
          obj = { ...proddata[i] };
          break
        }
      }


      if (obj.selectedDropdownValue != '' && this.discountmap[this.inlinerecordindex]) {
        for (var j = 0; j < this.inlineEditCol.length; j++) {
          if (obj.selectedDropdownValue == 'PriceOverride') {
            this.inlineEditCol[j].inputValue = obj.listPrice;
          } else {
            this.inlineEditCol[j].inputValue = obj.adddiscount ? obj.adddiscount : obj.discount;
          }
          this.inlineEditCol[j].selectedDropdownValue = obj.selectedDropdownValue;
        }
      } else {
        for (var j = 0; j < this.inlineEditCol.length; j++) {
          this.inlineEditCol[j].inputValue = "";
          this.inlineEditCol[j].selectedDropdownValue = "";
        }
      }
    } else {
      let chartData = [];
      let chartLabels = [];

      this.productData.forEach((opp) => {
        if (opp.recordIndex == id) {
          chartData.push(opp.listPrice);
          chartData.push(opp.baseprice);
          chartData.push(opp.netPrice);
          chartLabels.push("List Price");
          chartLabels.push("Contracted Price");
          chartLabels.push("Net Price");
        }
      });
      this.chartConfiguration = {
        type: "bar",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Pricing",

              backgroundColor: "rgba(69, 183, 109, 1)",

              data: chartData
            }
          ]
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          }
        }
      };
      this.barchart = true;
    }
  }
  closebarchart() {
    this.barchart = false;
  }

  closeinlineEditPopup() {
    this.isInlinepopup = false;
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
    let isReverse = direction === "asc" ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";
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

  handleChange(event) {
    const filterColumnName = this.columns[this.columnIndex].fieldName.trim();
    this.columnFilterValues[filterColumnName] = event.target.value;
    this.filterAppliedValue = event.target.value;
  }

  onRowSelection(event) {
    this.selectedrows = event.detail.selectedRows;
  }

  cloneProducts(event) {
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
    this.selectedrows = selectedRecords;
    const selectedIds = Array.from(selectedRecords).map(
      (item) => item.recordIndex
    );
    this.selectedids = selectedIds;

    const productDataWithIndex = this.selectedrows.map((record, i) => {
      this.mapProductData[record.recordIndex] = record;
      return { ...record, recordIndex: this.index++ };
    });

    const cloningdata = [...this.productData];
    cloningdata.push(...productDataWithIndex);
    this.productData = cloningdata;
    const initalrec = [...this.initialRecords];
    initalrec.push(...productDataWithIndex);
    this.initialRecords = initalrec;
    this.totalNetPrice = 0;

    const arr = [];
    for (var i = 0; i < this.initialRecords.length; i++) {
      var obj = { ...this.initialRecords[i] };
      obj = this.mapProductData[obj.recordIndex]
        ? this.mapProductData[obj.recordIndex]
        : obj;
      this.totalNetPrice =
        Number(this.totalNetPrice) + Number(obj[this.netPrice]);
      arr.push(obj);
    }
    let datawithindex = { productdata: arr, index: this.index };
    const discountdata = new CustomEvent("productdiscount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
    this.cartCount = this.initialRecords.length;
    let totalwithcount = {
      netTotal: this.totalNetPrice,
      count: this.cartCount
    };
    const netPriceEvent = new CustomEvent("totalnetprice", {
      detail: totalwithcount,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(netPriceEvent);
    this.totalNetPrice = 0;
    this.selectedrows = [];
    this.selectedids = [];
  }

  deleterecords() {
    var selectedRecords = this.template
      .querySelector("c-custom-type-datatable")
      .getSelectedRows();
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
      this.totalNetPrice =
        Number(this.totalNetPrice) + Number(obj[this.netPrice]);
      arr.push(obj);
    }
    let datawithindex = { productdata: arr, index: this.index };

    const discountdata = new CustomEvent("productdiscount", {
      detail: datawithindex,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(discountdata);
    this.totalNetPrice = this.totalNetPrice ? this.totalNetPrice.toFixed(2) : 0;
    this.cartCount = this.productData.length;
    let totalwithcount = {
      netTotal: this.totalNetPrice,
      count: this.cartCount
    };

    const netPriceEvent = new CustomEvent("totalnetprice", {
      detail: totalwithcount,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(netPriceEvent);
    const deletedata = new CustomEvent("delete", {
      detail: selectedRecords,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(deletedata);
    this.totalNetPrice = 0;
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

  openmodal() {
    this.fetchRecords();
  }

  closeModal() {
    this.isModalOpen = false;
  }

handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows;
    if (selectedRows.length === 1) {
        this.selectedPromotion = selectedRows[0];
        console.log('Selected Promotion:', JSON.stringify(this.selectedPromotion));
    } else {
        this.selectedPromotion = null;
        console.warn('Please select exactly one promotion.');
        return;
    }
}


    applyPromotion() {
        if (this.selectedPromotion && this.productData) {
          let productDataPromo = JSON.stringify(this.productData);
          let promotionId = this.selectedPromotion.Id;
          console.log('productData'+JSON.stringify(this.productData));
            applyPromotionToProduct({productData: productDataPromo, promotionId: promotionId})
                .then(result => {
                  this.productData = result;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Promotion applied successfully.',
                            variant: 'success'
                        })
                    );
                   this.closeModal();
                
                })
                .catch(error => {
                    console.error('Error applying promotion:', error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Error applying promotion.',
                            variant: 'error'
                        })
                    );
                });
        } else {
            console.warn('Please select both a product and a promotion.');
        }
    }

  fetchRecords() {
    getRecordsFromPromoAction({
      productData: JSON.stringify(this.productData)
    })
      .then(result => {
        this.promodata = result;
        this.isModalOpen = true;
      })
      .catch(error => {
        console.error('Error fetching records:', error);
      });
  }

}