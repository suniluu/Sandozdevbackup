({
	doInit : function(component, event, helper) {
        component.set("v.currentRecId",component.get("v.pageReference").state.c__refRecordId);
        component.set("v.objname",component.get("v.pageReference").state.c__refobjName);
    }
})