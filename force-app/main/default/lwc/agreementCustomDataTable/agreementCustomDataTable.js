import LightningDatatable from "lightning/datatable";
import productTemplate from "./productname.html";
import comboboxTemplate from "./combobox.html";
import combo2 from "./combobox2.html";
import familyCombo from "./familybox.html";
import priceruleTemplate from "./pricerule.html";
import discountTemplate from "./discount.html";
import checkbox from "./agreementcheckbox.html";
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
        },
        pricerulecol: {
            template: priceruleTemplate
        },
        customcheckbox: {
            template: checkbox,
             typeAttributes: ['recordIndex']
        },
        combo2: {
            template: combo2,
            typeAttributes: ['recordIndex','productId','options','selectedValue','discount','quantity','productType']
        }

    }
}