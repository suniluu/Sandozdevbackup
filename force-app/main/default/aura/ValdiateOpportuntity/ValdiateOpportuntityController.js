({
	  doInit : function(component, event, helper) {
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
                        message: 'Agreement already exists for this opportunity.',
                        type: 'error',
                    });
                    toastEvent.fire();
                    $A.get("e.force:closeQuickAction").fire();
            	} 
   			} 
        });
        $A.enqueueAction(action3);
		
	}
})