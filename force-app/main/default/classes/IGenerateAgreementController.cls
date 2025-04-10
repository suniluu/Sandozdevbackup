global Interface IGenerateAgreementController {
 	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    
    Map<String, Object> getNavigationSettings();

    List<String> getApprovalsRelatedData();

	List<Map<String, Object>> populateDefaultAgreementData(List<Map<String, Object>> fields, Id recordId); 
    
    List<Map<String, Object>> getAgreementHomePageFieldSet(String objectName, Id recordId);
    
    List<Object> validateData(Map<String, String> fieldValues, String cartcount);
    
    Map<Id, String> getLookupFieldNames(List<Id> ids);

    List<Object> getAgreementSummaryPageFieldSet(String objectName);

    void errorHandleling(String recId, Exception e);
    
    List<Object> getAgreementCatalogData(String recId, String fieldsData , string objApi);
    
    List<Object> getAgreementFastData(String recId,String productId, String fieldsData,string objApi);
    
    List<Object> fileUpload(String recId,String base64Data, String fieldsData);
    
    Object getAgreementFamilyProducts(String selectedvalue);
    
    List<Object> getAgreementProducts(String recordId);
    
    Object updateAgreementData(String recordId, List<Object> agreementData);

    Object updateAgreementLineItemData(String recordId, string agreementLineItemData);
    
    List<Object> updateProducts(String recordId, String saveDraftValues, String productData);
    
    List<Account> getCompanyLocations(String agrID);
    
    List<Object> getAgreementLineitems(String recordId);
    
    List<Object> getVolumeRange(String recordId, String productId, String productFamily);
    
    List<Object> getFieldDataFromMetadata(String recordId, String objectName);
    
    List<Object> fetchDynamicNames(String objectName, Map<String, String> fieldValues);
    
    Object saveAgreementDetails(String agreementId, List<Object> agreementData, List<Object> agreementLineItemData);

    Object generateApprovalRequests(String agreementId);
    
    Object getApprovalDetails1(String agreementId,string approvalProduct);
    
     List<Object> getRecordTypeData();
    
   	 string getRecordTitle(Id recId);
	
    String getObjectMetaData();
    
    String getObjectNameById(Id recordId);
    
    Boolean validateAgreementCreation(Id recordId);
    
    List<Object> AgreementPricevalidate(string agreementLineItemData);
    
    String Agreementlineitemsvalidate(string agreementLineItemData);  

    List<Object> getButtonData(String compName); 
	
    List<Object> getSignatureSection(String compName); 

    List<Object> retrieveSignatoryRecords(String recId);

    List<Object> getAgreementRequestSettingMetadata(String devName);
    
    list<Object> getApprovalObjMetadata();

     List<Object> getSignatoryDetails(String objectName,
                                                String fieldAPINames,
                                                String filterFieldAPIName,
                                                String strInput,String recId); 
    
    List<Object> fetchLookupRecords(String objectApiName, String fieldApiName,String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId);
    
    List<Map<String, String>> getTemplateOptions();
    List<Map<String, String>> getClausesOptions();
    Id generatePDFAndSave(Id recordId,Id templateId);

    String previewPDF(Id recordId,Id templateId);
     List<Object> customPriceCalculation(string agreementdata);

         List<object> getFields();
    List<object> getSObjectFields(String sObjectApiName);

        String objectApiname();
            
     List<object> getPicklistValues(String objectApiName,string fieldApiName);
    
}