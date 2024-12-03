({
    doInit : function(component, event, helper) {
        console.log('doInit executed');
        var action2 = component.get('c.getOrderPricingMeta');
        action2.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var apiNames = response.getReturnValue();
                console.log('Pricing API Name:', apiNames.PricingAPI);
                console.log('CER API Name:', apiNames.CERAPI);
                component.set('v.priceList', apiNames.PricingAPI);
                component.set('v.cerApi', apiNames.CERAPI);
            } else if (response.getState() === "ERROR") {
                console.error('Error retrieving pricing metadata:', response.getError());
            }
        });
        $A.enqueueAction(action2);
        
        var action = component.get('c.getRecordTypes');
        action.setCallback(this, function(response) {
            var state = response.getState();
            var data = response.getReturnValue();
            if(response.getState() == "SUCCESS"){
                console.log(data);
                component.set('v.recordTypeData', data);                
            } 
        });
        $A.enqueueAction(action);
        
        var action1 = component.get('c.getCurrentRecordName');
        action1.setParams({ recId : component.get("v.recordId") });
        action1.setCallback(this, function(response) {
            var state = response.getState();
            var data = response.getReturnValue();
            if(response.getState() == "SUCCESS"){
                component.set('v.recordName', data.name); 
                component.set('v.objName', data.objName); 
                component.set('v.objIcon', data.iconName); 
            } 
        });
        $A.enqueueAction(action1);
    },
    cancelClick : function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },
    navigateToLC : function(component, event, helper) {
        if(component.get('v.selectedValue') == ''){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : 'Error',
                message:'Please select the type.',
                type: 'error',
            });
            toastEvent.fire();
        } else {
            $A.get("e.force:closeQuickAction").fire();
            var recordTypeName = '';
            var recordTypeData = component.get('v.recordTypeData');
            for(var i = 0; i < recordTypeData.length; i++){
                if(recordTypeData[i].Id == component.get('v.selectedValue')){
                    recordTypeName = recordTypeData[i].Name;
                }
            }
            var pageReference = {
                type: 'standard__component',
                attributes: {
                    componentName: 'c__orderRequestNavigation'
                },
                state: {
                    c__refRecordId: component.get("v.recordId"),
                    c__refType: component.get('v.selectedValue'),
                    c__refTypeName: recordTypeName,
                    c__refName: component.get('v.recordName'),
                    c__refobjName: component.get('v.objName'),
                    c__refobjIcon: component.get('v.objIcon'),
                    c__refpriceList: component.get('v.priceList'),
                    c__refcerApi: component.get('v.cerApi')
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
            }
            })