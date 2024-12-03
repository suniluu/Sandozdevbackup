import LightningDatatable from "lightning/datatable";
import productTemplate from "./productname.html";
import comboboxTemplate from "./combobox.html";
import familyCombo from "./familybox.html";
import discountTemplate from "./discount.html";

export default class AgreementCustomDataTable extends LightningDatatable {

    static customTypes = {
        customName: {
            template: productTemplate,
             typeAttributes: ['objname','recordId','fieldapi','fieldapiname','priceList','productName', 'addField','productType','isDisabled','hasValue','recId']
        },
         customCombox: {
            template: comboboxTemplate,
            typeAttributes: ['recordId','productId','options','selectedValue','discount','quantity','productType']
        },
        familyCombobox: {
            template: familyCombo,
             typeAttributes: ['recordId','productId','dropdownoptions','dropdownValue','isFamily']
        },
        discountcol: {
            template: discountTemplate
        }
    }
}