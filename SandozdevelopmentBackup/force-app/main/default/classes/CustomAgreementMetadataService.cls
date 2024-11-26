public with sharing class CustomAgreementMetadataService {
	/**
    * @description 
    * @author CommerceCx | 15-02-2024 
    * @return Agreement_Setting__mdt 
    **/
    @testVisible 
    public static Agreement_Request_Setting__mdt contractSetting(String orderRequestSetting) {
    	return [Select id,Plugin__c from Agreement_Request_Setting__mdt where DeveloperName =: orderRequestSetting  WITH SECURITY_ENFORCED limit 1];        
    }    
}