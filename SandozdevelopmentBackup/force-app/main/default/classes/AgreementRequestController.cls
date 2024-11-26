public inherited sharing class AgreementRequestController {
    
    public class CEServiceException extends exception {
        
    }
    
    public static IGenerateAgreementController getCerPluginInstance(String controllerName){
        IGenerateAgreementController pluginHandler;      
        if(CustomAgreementMetadataService.contractSetting(controllerName) != null && CustomAgreementMetadataService.contractSetting(controllerName).plugin__c != null && CustomAgreementMetadataService.contractSetting(controllerName).plugin__c != ''){
            try{
                Type plugin = Type.forName(CustomAgreementMetadataService.contractSetting(controllerName).plugin__c);            
                pluginHandler = (IGenerateAgreementController) plugin.newInstance();  
            }
            catch(NullPointerException ex){
                throw new CEServiceException('Plugin is not Configured/Defined as Expected');
            }     
        }
        return pluginHandler;
    }
}