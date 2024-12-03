({
    doInit: function (component) {
        var action = component.get("c.getObjectNameById");
        action.setParams({ "recordId": component.get("v.recordId") });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var objectName = response.getReturnValue();

                var action2 = component.get('c.getObjectMetaData');
                action2.setCallback(this, function (response) {
                    if (response.getState() === "SUCCESS") {
                        var objectApiName = response.getReturnValue();
                        component.set('v.objectApiName', objectApiName);

                        // Now set up the pageReference after objectApiName is retrieved
                        var pageReference = {
                            type: 'standard__component',
                            attributes: {
                                componentName: 'c__agreementNavigation'
                            },
                            state: {
                                c__refRecordId: component.get("v.recordId"),
                                c__refobjName: objectName,
                                c__refobjectApiName: objectApiName
                            }
                        };
                        console.log('Page reference is:', pageReference);
                        $A.get("e.force:closeQuickAction").fire();
                        component.set("v.pageReference", pageReference);

                        const navService = component.find('navService');
                        const pageRef = component.get('v.pageReference');
                        const handleUrl = (url) => {
                            window.open(url, "_blank");
                            console.log(component.get("v.recordId"));
                        };
                        const handleError = (error) => {
                            console.log(error);
                        };
                        navService.generateUrl(pageRef).then(handleUrl, handleError);
                    } else {
                        console.error("Failed to retrieve object API name");
                        // Handle the error (e.g., show a toast notification)
                    }
                });
                $A.enqueueAction(action2); // Enqueue action2 here after defining it

            } else {
                console.error("Failed to retrieve object name");
                // Handle the error (e.g., show a toast notification)
            }
        });
        $A.enqueueAction(action); // Enqueue action here after defining it
    }
});