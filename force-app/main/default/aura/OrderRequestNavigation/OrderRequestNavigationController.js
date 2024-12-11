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
        console.log('component.get("v.pageReference").state.c__refRecordId :: '+component.get("v.pageReference").state.c__refRecordId); 
        console.log('component.get("v.pageReference").state.c__refobjName :: '+component.get("v.pageReference").state.c__refobjName); 
        console.log('component.get("v.pageReference").state.c__refTypeName :: '+component.get("v.pageReference").state.c__refTypeName); 
        console.log('component.get("v.pageReference").state.c__refName :: '+component.get("v.pageReference").state.c__refName); 
        console.log('component.get("v.pageReference").state.c__refOrderId :: '+component.get("v.pageReference").state.c__refOrderId); 
		console.log('component.get("v.pageReference").state.c__refobjIcon :: '+component.get("v.pageReference").state.c__refobjIcon); 
        console.log('component.get("v.pageReference").state.c__refpriceList :: '+component.get("v.pageReference").state.c__refpriceList); 
        console.log('component.get("v.pageReference").state.c__refcerApi :: '+component.get("v.pageReference").state.c__refcerApi); 
    }
})