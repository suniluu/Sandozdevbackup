({
	doInit : function(component, event, helper) {
        component.set("v.currentRecId",component.get("v.pageReference").state.c__refRecordId);
        component.set("v.objname",component.get("v.pageReference").state.c__refobjName);
        component.set("v.recordTypeName",component.get("v.pageReference").state.c__refTypeName);
        component.set("v.recordType",component.get("v.pageReference").state.c__refType);
        component.set("v.objectApiName",component.get("v.pageReference").state.c__refobjectApiName);
    }
})