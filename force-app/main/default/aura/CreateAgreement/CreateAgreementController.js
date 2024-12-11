({
    doInit : function(component, event, helper) {
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
                component.set('v.objName', data); 
   
            } 
        });
        $A.enqueueAction(action1);
        
        var action2 = component.get('c.getObjectMetaData');
       
        action2.setCallback(this, function(response) {
            var state = response.getState();
            var data = response.getReturnValue();
            if(response.getState() == "SUCCESS"){
                component.set('v.objectApiName', data); 
   
            } 
        });
        $A.enqueueAction(action2);
        
        var action3 = component.get('c.validateAgreementCreation');
        action3.setParams({ recordId : component.get("v.recordId") });
        action3.setCallback(this, function(response) {
            var state = response.getState();
            var data = response.getReturnValue();
            if(response.getState() == "SUCCESS"){
                component.set('v.hasAgreement', data); 
                console.log('Record ID:', component.get("v.hasAgreement"));
                if (component.get('v.hasAgreement') == true) {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Agreement already exists for this Account!',
                        type: 'error',
                    });
                    toastEvent.fire();
                    $A.get("e.force:closeQuickAction").fire();
            	} 
   			} 
        });
        $A.enqueueAction(action3);
        
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
                    componentName: 'c__AgreementNavigation'
                },
                state: {
                    c__refRecordId: component.get("v.recordId"),
                    c__refType: component.get('v.selectedValue'),
                    c__refTypeName: recordTypeName,
                    c__refobjName: component.get('v.objName'),
                    c__refobjectApiName :component.get('v.objectApiName')
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