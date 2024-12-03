public with sharing class AgreementController {

    @AuraEnabled(cacheable=true)
    public static List<Object> fetchDynamicNames(String objectName, Map<String, String> fieldValues) {
        List<Object> accList = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	accList = customPlugin.fetchDynamicNames(objectName,fieldValues);
            } catch(Exception e){
                customPlugin.errorHandleling(objectName,e);
            }
        }
        return accList;
    }
        
    @AuraEnabled(cacheable=true)
    public static List<Account> getCompanyLocations(String agrID) {
        List<Account> accList = new List<Account>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	accList = customPlugin.getCompanyLocations(agrID);
            } catch(Exception e){
                customPlugin.errorHandleling(agrId,e);
            }
        }
        return accList;
    }

	@AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> populateDefaultAgreementData(List<Map<String, Object>> fields, Id recordId){
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                result = customPlugin.populateDefaultAgreementData(fields,recordId);
            } catch(Exception e){
                system.debug('Error encountered');
            }
        }
        return result;
    }
        
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getFieldDataFromMetadata(String recordId, String objectName) {
        List<Object> result = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                result = customPlugin.getFieldDataFromMetadata(recordId,objectName);
            } catch(Exception e){
                customPlugin.errorHandleling(recordId,e);
            }
        }
        return result;
    }
    
    public class ValidationResult {
        @AuraEnabled
        public Boolean isValid;
        @AuraEnabled
        public String fieldName;
        @AuraEnabled
        public String errorMessage;
    
        public ValidationResult(Boolean isValid, String fieldName, String errorMessage) {
            this.isValid = isValid;
            this.fieldName = fieldName;
            this.errorMessage = errorMessage;
        }
    }
    
    

    @AuraEnabled(cacheable=true)
    public static Map<Id, String> getLookupFieldNames(List<Id> ids) {
        Map<Id, String> result = new Map<Id, String>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	result = customPlugin.getLookupFieldNames(ids);
            } catch(Exception e){
                system.debug('Error encountered');
            }
        }
        return result;
    }    
        
        
    @AuraEnabled(cacheable=true)
    public static Object validateData(Map<String, String> fieldValues) {
        List<Object> result = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	result = customPlugin.validateData(fieldValues);
            } catch(Exception e){
                system.debug('Error encountered');
            }
        }
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getAgreementHomePageFieldSet(String objectName, Id recordId) {
        List<Map<String, Object>> fieldSet = new List<Map<String, Object>>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                fieldSet = customPlugin.getAgreementHomePageFieldSet(objectName, recordId);
            } catch(Exception e){
                customPlugin.errorHandleling(objectName,e);
            }
        }
        return fieldSet;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getAgreementSummaryPageFieldSet(String objectName) {
        List<Object> fieldSet = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                fieldSet = customPlugin.getAgreementSummaryPageFieldSet(objectName);
            } catch(Exception e){
                customPlugin.errorHandleling(objectName,e);
            }
        }
        return fieldSet;
    }
    
    @AuraEnabled
    public static Object updateAgreementData(String recordId, String agreementData){
        Object lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        System.debug(agreementData);
        List<Object> lstOrderData = (List<Object>) JSON.deserializeUntyped(agreementData);
        System.debug(lstOrderData);
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.updateAgreementData(recordId, lstOrderData);
            } catch(Exception e){
                system.debug('Error in updating agreement');
            }
        }
        return lstrecord;
        
    }
    
    @AuraEnabled
    public static Object generateApprovalRequests(String agreementId){
        Object lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.generateApprovalRequests(agreementId);
            } catch(Exception e){
                system.debug('Error in generating approvals');
            }
        }
        return lstrecord;       
    }

    @AuraEnabled
    public static Object getApprovalDetails1(String agreementId){
        Object lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.getApprovalDetails1(agreementId);
            } catch(Exception e){
                system.debug('Error in generating approvals');
            }
        }
        return lstrecord;       
    }
        
    @AuraEnabled
    public static Object saveAgreementDetails(String recordId, List<Object> agreementData, List<Object> agreementLineItemData){
        Object lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        System.debug(agreementData);
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.saveAgreementDetails(recordId, agreementData, agreementLineItemData);
            } catch(Exception e){
                system.debug('Error in saving agreement');
            }
        }
        return lstrecord;        
    }
    
      @AuraEnabled
    public static List<Object> AgreementPricevalidate(string agreementLineItemData){
        List<Object> lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
   
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.AgreementPricevalidate( agreementLineItemData);
            } catch(Exception e){
                system.debug('Error in Pricevalidation');
            }
        }
        return lstrecord;        
    }
    
        @AuraEnabled
    public static List<String> Agreementlineitemsvalidate(string agreementLineItemData){
        List<String> lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
 
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.Agreementlineitemsvalidate(agreementLineItemData);
            } catch(Exception e){
                system.debug('Error in lineitems  validation');
            }
        }
        return lstrecord;        
    }
    
    
    @AuraEnabled
    public static Object updateAgreementLineItemData(String recordId, String agreementLineItemData){
        Object lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        System.debug(agreementLineItemData);
        List<Object> lstOrderData = (List<Object>) JSON.deserializeUntyped(agreementLineItemData);
        System.debug(lstOrderData);
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.updateAgreementLineItemData(recordId, lstOrderData);
            } catch(Exception e){
                system.debug('Error in updating agreement line items');
            }
        }
        return lstrecord;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> getProductsData(String recordId){
        List<Object> lstProductData = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstProductData = customPlugin.getAgreementProducts(recordId);
            } catch(Exception e){
                customPlugin.errorHandleling(recordId,e);
            }
        }
        return lstProductData;
    }
    
    @AuraEnabled
    public static List<Object> updateProductsData(String recordId, String saveDraftValues, String productData){
        List<Object> lstProductData = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstProductData = customPlugin.updateProducts(recordId, saveDraftValues, productData);
            } catch(Exception e){
                customPlugin.errorHandleling(recordId,e);
            }
        }
        return lstProductData;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getRecordTypes() {
        List<Object> lstRecordTypesData = new List<Object>();
         IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstRecordTypesData = customPlugin.getRecordTypeData();
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstRecordTypesData;
    }
    
    @AuraEnabled(cacheable=true)
    public static string getCurrentRecordName(Id recId){
        string titleDetails;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	titleDetails = customPlugin.getRecordTitle(recId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return titleDetails;
    }
    
       @AuraEnabled(cacheable=true)
    public static string getObjectMetaData(){
        string titleDetails;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	titleDetails = customPlugin.getObjectMetaData();
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return titleDetails;
    }
    
    @AuraEnabled(cacheable=true)
    public static string getObjectNameById(Id recordId){
        string titleDetails;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	titleDetails = customPlugin.getObjectNameById(recordId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return titleDetails;
    }
    
    @AuraEnabled(cacheable=true)
    public static Boolean validateAgreementCreation(Id recordId){
        Boolean titleDetails;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	titleDetails = customPlugin.validateAgreementCreation(recordId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return titleDetails;
    }
     /**
     * @description: getTabs to get all the tabs on the order request page based on the order of the tab
     * @return: return type list of Data_Table_Column__mdt
     */
    @AuraEnabled(cacheable=true)
    public static List<AgreementTab_Configuration__mdt> getTabs(){
        String query = AgreementController.getQuery('Agreement_Tabs_Query');
        return Database.query(query);
    }
    
    /**
     * @description: getQuery to fetch the query from custom meta data and pass it to the actual method to build dynamic query
     * @return: return type string
     */
    @AuraEnabled(cacheable=true)
    public static String getQuery(String queryName){
        Object_Query__mdt objQuery = [select id, Label, DeveloperName,Query__c from Object_Query__mdt where DeveloperName =: queryName WITH SECURITY_ENFORCED];
        return objQuery.Query__c;
    }
    
     /**
     * @description: getColumns to get all the columns for the selected datatable
     * @return: return type Data_Table_Column__mdt
     */
    @AuraEnabled(cacheable=true)
    public static Data_Table_Column__mdt getColumns(String columnData){
        return [select id, Column_JSON__c from Data_Table_Column__mdt  where DeveloperName = :columnData WITH SECURITY_ENFORCED];
        //return Data_Table_Column__mdt.getInstance('Table_Columns');
    }
    
    /**
     * @description: getAgreementCatalog to get all the orders and order line items records for the selected parent records
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getAgreementCatalog(String recId, String fieldsData,string objApi){
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        List<Object> lstPricingData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstPricingData = customPlugin.getAgreementCatalogData(recId, fieldsData,objApi);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lstPricingData;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getAgreementFastRecords(String recId,String productId, String fieldsData, string objApi ) {
        List<Object> lstProductData = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstProductData = customPlugin.getAgreementFastData(recId,productId,fieldsData,objApi);
            } catch(Exception e){
                customPlugin.errorHandleling(productId,e);
            }
        }
        return lstProductData;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> fetchVolumeRange(String recordId, String productId, String productFamily){
        List<Object> lstProductData = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstProductData = customPlugin.getVolumeRange(recordId,productId,productFamily);
            } catch(Exception e){
                customPlugin.errorHandleling(recordId,e);
            }
        }
        return lstProductData;
    }
    
    @AuraEnabled(cacheable=true)
    public static Object getAgreementFamilyProds(String selectedvalue) {
        Object lstProductData ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstProductData = customPlugin.getAgreementFamilyProducts(selectedvalue);
            } catch(Exception e){
                customPlugin.errorHandleling(selectedvalue,e);
            }
        }
        return lstProductData;
    }
    
    @AuraEnabled
	public static List<Object> saveFile(String base64Data, String recId, String fieldsData){
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        List<Object> lstUploadedData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstUploadedData = customPlugin.fileUpload(recId, base64Data, fieldsData);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lstUploadedData;
	}
    
     @AuraEnabled(cacheable=true)
    public static list<Object> getexistinglineitems(String recordId) {
        list<Object> lineitems ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lineitems = customPlugin.getAgreementLineitems(recordId);
            } catch(Exception e){
                customPlugin.errorHandleling(recordId,e);
            }
        }
        return lineitems;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getButtonsInfo(String compName){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstButtonInfo = customPlugin.getButtonData(compName);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstButtonInfo;
    }
    
     @AuraEnabled(cacheable=true)
    public static List<Object> getSignatureSectionInfo(String compName){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstButtonInfo = customPlugin.getSignatureSection(compName);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstButtonInfo;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> getSignatoryMetaDatas(String devName){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstButtonInfo = customPlugin.getSignatoryMetaDatas(devName);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstButtonInfo;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> getSignatoryDetails(String objectName,
                                                String fieldAPINames,
                                                String filterFieldAPIName,
                                                String strInput,String recId){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstButtonInfo = customPlugin.getSignatoryDetails(objectName,fieldAPINames,filterFieldAPIName,strInput,recId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstButtonInfo;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> fetchLookupRecords(String objectApiName, String fieldApiName,
            String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId) 
    {
        List<Object> lineitems ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lineitems = customPlugin.fetchLookupRecords(objectApiName,fieldApiName,otherFieldApiName,searchString,selectedRecordId,pricelistId,recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lineitems;
    }
}