({
    doInit : function(component) {
        var action = component.get("c.getObjectNameById");
        action.setParams({ "recordId": component.get("v.recordId") });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var objectName = response.getReturnValue();
                var pageReference = {
                    type: 'standard__component',
                    attributes: {
                        componentName: 'c__agreementNavigation'
                    },
                    state: {
                        c__refRecordId: component.get("v.recordId"),
                        c__refobjName: objectName,
                    }
                };
                console.log('jj page reference is :',pageReference);
                $A.get("e.force:closeQuickAction").fire();
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
            } else {
                console.error("Failed to retrieve object name");
                // Handle the error (e.g., show a toast notification)
            }
        });
        $A.enqueueAction(action);
    }
})