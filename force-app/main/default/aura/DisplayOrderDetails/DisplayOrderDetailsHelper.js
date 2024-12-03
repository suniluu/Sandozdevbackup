({
	getRecDetails : function(component, event, helper) {
        var action = component.get('c.getOrderDetails');
        action.setParams({ recId : component.get("v.recordId") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            var data = response.getReturnValue();
            if(response.getState() == "SUCCESS"){
                $A.get("e.force:closeQuickAction").fire();
                var pageReference = {
                    type: 'standard__component',
                    attributes: {
                        componentName: 'c__orderRequestNavigation'
                    },
                    state: {
                        c__refRecordId: data.accId,
                        c__refTypeName: data.orderType,
                        c__refName: data.name,
                        c__refobjName: data.objName,
                        c__refobjIcon: data.iconName,
                        c__refOrderId: component.get("v.recordId")
                    }
                };
                
                component.set("v.pageReference", pageReference);
                const navService = component.find('navService');
                const pageRef = component.get('v.pageReference');
                const handleUrl = (url) => {
                    window.open(url, "_blank");
                    console.log(component.get("v.recordId"))
                };
                const handleError = (error) => {
                    console.log(error);
                };
                navService.generateUrl(pageRef).then(handleUrl, handleError);
            } 
        });
        $A.enqueueAction(action);
    }
})