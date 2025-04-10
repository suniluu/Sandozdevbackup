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
    public static Map<String, Object> getNavigationSettings(){
        Map<String, Object> result = new Map<String, Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                result = customPlugin.getNavigationSettings();
            } catch(Exception e){
                system.debug('Error encountered');
            }
        }
        return result;
    }

     @AuraEnabled(cacheable=true)
    public static List<object> getFields(){
        List<object> lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.getFields();
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;        
    } 

        @AuraEnabled(cacheable=true)
    public static List<object> getPicklistValues(String objectApiName,string fieldApiName){
        List<object> lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.getPicklistValues(objectApiName,fieldApiName);
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;        
    } 

    @AuraEnabled(cacheable=true)
    public static List<object> getSObjectFields(String sObjectApiName){
        List<object> lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.getSObjectFields(sObjectApiName);
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;        
    }
    

    @AuraEnabled(cacheable=true)
    public static List<String> getApprovalsRelatedData(){
        List<String> result = new List<String>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                result = customPlugin.getApprovalsRelatedData();
            } catch(Exception e){
                system.debug('Error encountered');
            }
        }
        return result;
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
    public static List<Object> getApprovalObjMetadata( ) {
        List<Object> accList = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	accList = customPlugin.getApprovalObjMetadata( );
            } catch(Exception e){
              system.debug('Error encountered');
            }
        }
        return accList;
    }


     @AuraEnabled(cacheable=true)
    public static List<Object> customPriceCalculation(string agreementdata ) {
        List<Object> accList = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	accList = customPlugin.customPriceCalculation( agreementdata );
            } catch(Exception e){
              system.debug('Error encountered');
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
    public static Object validateData(Map<String, String> fieldValues, String cartcount) {
        List<Object> result = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	result = customPlugin.validateData(fieldValues,cartcount);
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
        List<Object> lstOrderData = (List<Object>) JSON.deserializeUntyped(agreementData);
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
    public static Object getApprovalDetails1(String agreementId,string approvalProduct){
        Object lstrecord;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.getApprovalDetails1(agreementId,approvalProduct);
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
                system.debug(e);
            }
        }
        return lstrecord;        
    }
    
        @AuraEnabled
    public static string Agreementlineitemsvalidate(string agreementLineItemData){
        string lstrecord;
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
        List<Object> lstOrderData = (List<Object>) JSON.deserializeUntyped(agreementLineItemData);
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.updateAgreementLineItemData(recordId, agreementLineItemData);
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

    @AuraEnabled(cacheable=true)
    public static String objectApiname(){
        String objectApiname;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	objectApiname = customPlugin.objectApiname();
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return objectApiname;
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
        Data_Table_Column__mdt columns;
       if(columnData=='Agreement_Catelog_Selection'){
           Enable_Agreement_Line_Level_Filter__mdt checkbox =[select id,Enable_Agreement_Line_Filters__c from Enable_Agreement_Line_Level_Filter__mdt];
            
            if(checkbox.Enable_Agreement_Line_Filters__c==true){
           columns= [select id, Column_JSON__c from Data_Table_Column__mdt  where DeveloperName = 'Agreement_Catelog_Selection' WITH SECURITY_ENFORCED];
            }else{
              columns= [select id, Column_JSON__c from Data_Table_Column__mdt  where DeveloperName = 'Agreement_Catelog_Wihtout_Filters' WITH SECURITY_ENFORCED];
            
            }
        }
        else{
        columns= [select id, Column_JSON__c from Data_Table_Column__mdt  where DeveloperName = :columnData WITH SECURITY_ENFORCED];
        }
        return columns;
        //return [select id, Column_JSON__c from Data_Table_Column__mdt  where DeveloperName = :columnData WITH SECURITY_ENFORCED];
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
    public static List<Object> getAgreementRequestSettingMetadata(String devName){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstButtonInfo = customPlugin.getAgreementRequestSettingMetadata(devName);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstButtonInfo;
    }

  

    @AuraEnabled(cacheable=true)
    public static List<Object> retrieveSignatoryRecords(String recId){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lstButtonInfo = customPlugin.retrieveSignatoryRecords(recId);
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
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getTemplateOptions() 
    {
        List<Map<String, String>> lineitems ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lineitems = customPlugin.getTemplateOptions();
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lineitems;
    }
    
     @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getClausesOptions() 
    {
        List<Map<String, String>> lineitems ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lineitems = customPlugin.getClausesOptions();
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lineitems;
    }
    
    @AuraEnabled(cacheable=true)
    public static Id generatePDFAndSave(Id recordId,Id templateId) 
    {
        Id lineitems ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lineitems = customPlugin.generatePDFAndSave(recordId,templateId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lineitems;
    }
    
     @AuraEnabled(cacheable=true)
    public static String previewPDF(Id recordId,Id templateId) 
    {
        String lineitems ;
        IGenerateAgreementController customPlugin = AgreementRequestController.getCerPluginInstance('AgreementRequest');
        if(customPlugin != null){
            try{
            	lineitems = customPlugin.previewPDF(recordId,templateId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lineitems;
    }

    /*@AuraEnabled
    public static Boolean savePDF(Id recordId, String fileName, String base64Data) {
        try {
            // Create a ContentVersion record
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.VersionData = EncodingUtil.base64Decode(base64Data);
            insert contentVersion;

            // Retrieve the ContentDocument ID
            ContentDocument contentDocument = [
                SELECT Id
                FROM ContentDocument
                WHERE Id IN (
                    SELECT ContentDocumentId
                    FROM ContentVersion
                    WHERE Id = :contentVersion.Id
                )
            ];

            // Link the file to the record using ContentDocumentLink
            ContentDocumentLink link = new ContentDocumentLink();
            link.LinkedEntityId = recordId;
            link.ContentDocumentId = contentDocument.Id;
            link.ShareType = 'V';
            link.Visibility = 'AllUsers';
            insert link;

            return true;
        } catch (Exception e) {
            System.debug('Error saving PDF: ' + e.getMessage());
            throw new AuraHandledException('Failed to save PDF. ' + e.getMessage());
        }
    }

    
    @AuraEnabled(cacheable=true)
    public static List<Agreement_Line_Item__c> getALIRecordData(String recordId) {
        try {
                        System.debug('recordIdKK: ' + recordId); 
            List<Agreement_Line_Item__c> aliList = [SELECT Id, Aggreement__r.Name, Product__r.Name, Product_Code__c, List_Price__c
                                                    FROM Agreement_Line_Item__c
                                                    WHERE Aggreement__c = :recordId];
            System.debug('Fetched Line Items: ' + aliList); 
            return aliList;
        } catch (Exception e) {
            System.debug('Error in Apex: ' + e.getMessage());
            return new List<Agreement_Line_Item__c>(); 
        }
    }*/

    @AuraEnabled
    public static List<Agreement_Line_Item__c> getAgreementLineItems(Id agreementId) {
        System.debug('kkrecordID'+agreementId);
        try {
            List<Agreement_Line_Item__c> aliList = [SELECT Id, Aggreement__r.Name, Product__r.Name, Product_Code__c, List_Price__c
                                                    FROM Agreement_Line_Item__c
                                                    WHERE Aggreement__c = :agreementId];
            System.debug('Fetched Line Items: ' + aliList); 
            return aliList;
        } catch (Exception e) {
            System.debug('Error in Apex: ' + e.getMessage());
            return new List<Agreement_Line_Item__c>(); 
        }
    }


     @AuraEnabled
    public static void savePdfToContentVersion(String fileName, String base64Data, Id agreementId) {
        try {
            // Decode the Base64 string to get the binary data
            Blob pdfBlob = EncodingUtil.base64Decode(base64Data);
            if (pdfBlob == null) {
                throw new AuraHandledException('Invalid PDF data');
            }

            // Create a new ContentVersion record
            ContentVersion contentVersion = new ContentVersion(
                Title = fileName,
                PathOnClient = fileName,
                VersionData = pdfBlob
            );

            insert contentVersion;

            ContentDocument contentDocument = [
                SELECT Id
                FROM ContentDocument
                WHERE Id IN (
                    SELECT ContentDocumentId
                    FROM ContentVersion
                    WHERE Id = :contentVersion.Id
                )
            ];

            ContentDocumentLink link = new ContentDocumentLink();
            link.LinkedEntityId = agreementId;
            link.ContentDocumentId = contentDocument.Id;
            link.ShareType = 'V';
            link.Visibility = 'AllUsers';
            insert link;

        } catch (Exception e) {
            System.debug('Error saving PDF: ' + e.getMessage());
            throw new AuraHandledException('Error saving PDF: ' + e.getMessage());
        }
    }

}