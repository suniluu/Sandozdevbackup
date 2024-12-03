import LightningDatatable from "lightning/datatable";
import productTemplate from "./productname.html";
import actionTemplate from "./action.html";
import atpTemplate from "./atp.html";
import discountTemplate from "./discount.html";
import comboboxTemplate from "./combobox.html";
import familyCombo from "./familybox.html";
export default class CustomTypeDatatable extends LightningDatatable {
    static customTypes = {
        customName: {
            template: productTemplate,
            //typeAttributes: ['objname','recordId','fieldapi','fieldapiname','priceList','fieldLookupName', 'addField', 'addCol','productType','isDisabled','hasValue']
             typeAttributes: ['objname','recordId','fieldapi','fieldapiname','priceList','productName', 'addField', 'addCol','productType','isDisabled','hasValue']
        },
        action: {
            template: actionTemplate
        },
        atpcol: {
            template: atpTemplate
        },
          discountcol: {
            template: discountTemplate
        },
        customCombox: {
            template: comboboxTemplate,
            typeAttributes: ['recordId','productId','options','selectedValue','discount','quantity','productType']
        },
        familyCombobox: {
            template: familyCombo,
             typeAttributes: ['recordId','productId','dropdownoptions','dropdownValue','isFamily']
        }
    };
}