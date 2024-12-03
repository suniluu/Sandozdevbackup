public with sharing class CustomMetadataService {
	/**
    * @description 
    * @author CommerceCx | 15-02-2024 
    * @return Order_Request_Setting__mdt 
    **/
    @testVisible 
    public static Order_Request_Setting__mdt contractSetting(String orderRequestSetting) {
    	return [Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName =: orderRequestSetting  WITH SECURITY_ENFORCED limit 1];        
    }
    
    @testVisible 
    public static List<Object> buttonSetting(String compName) {
    	return [Select id,Button_Label__c,Component_Name__c,Hide_Button__c from Button_Configuration__mdt where Component_Name__c =: compName  WITH SECURITY_ENFORCED];        
    }
}