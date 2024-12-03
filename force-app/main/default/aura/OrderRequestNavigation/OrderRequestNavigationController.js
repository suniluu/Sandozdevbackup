({
	doInit : function(component, event, helper) {
        component.set("v.currentRecId",component.get("v.pageReference").state.c__refRecordId);
        component.set("v.type",component.get("v.pageReference").state.c__refType);
        component.set("v.typename",component.get("v.pageReference").state.c__refTypeName);
        component.set("v.recname",component.get("v.pageReference").state.c__refName);
        component.set("v.objname",component.get("v.pageReference").state.c__refobjName);
        component.set("v.objicon",component.get("v.pageReference").state.c__refobjIcon);
        component.set("v.orderid",component.get("v.pageReference").state.c__refOrderId);
        component.set("v.priceList",component.get("v.pageReference").state.c__refpriceList);
        component.set("v.cerApi",component.get("v.pageReference").state.c__refcerApi);
    }
})