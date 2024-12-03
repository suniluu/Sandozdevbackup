global Interface IGenerateAgreementController {
 	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    
	List<Map<String, Object>> populateDefaultAgreementData(List<Map<String, Object>> fields, Id recordId); 
    
    List<Map<String, Object>> getAgreementHomePageFieldSet(String objectName, Id recordId);
    
    List<Object> validateData(Map<String, String> fieldValues);
    
    Map<Id, String> getLookupFieldNames(List<Id> ids);

    List<Object> getAgreementSummaryPageFieldSet(String objectName);

    void errorHandleling(String recId, Exception e);
    
    List<Object> getAgreementCatalogData(String recId, String fieldsData , string objApi);
    
    List<Object> getAgreementFastData(String recId,String productId, String fieldsData,string objApi);
    
    List<Object> fileUpload(String recId,String base64Data, String fieldsData);
    
    Object getAgreementFamilyProducts(String selectedvalue);
    
    List<Object> getAgreementProducts(String recordId);
    
    Object updateAgreementData(String recordId, List<Object> agreementData);

    Object updateAgreementLineItemData(String recordId, List<Object> agreementLineItemData);
    
    List<Object> updateProducts(String recordId, String saveDraftValues, String productData);
    
    List<Account> getCompanyLocations(String agrID);
    
    List<Object> getAgreementLineitems(String recordId);
    
    List<Object> getVolumeRange(String recordId, String productId, String productFamily);
    
    List<Object> getFieldDataFromMetadata(String recordId, String objectName);
    
    List<Object> fetchDynamicNames(String objectName, Map<String, String> fieldValues);
    
    Object saveAgreementDetails(String agreementId, List<Object> agreementData, List<Object> agreementLineItemData);

    Object generateApprovalRequests(String agreementId);
    
    Object getApprovalDetails1(String agreementId);
    
     List<Object> getRecordTypeData();
    
   	 string getRecordTitle(Id recId);
	
    String getObjectMetaData();
    
    String getObjectNameById(Id recordId);
    
    Boolean validateAgreementCreation(Id recordId);
    
    List<Object> AgreementPricevalidate(string agreementLineItemData);
    
    List<String> Agreementlineitemsvalidate(string agreementLineItemData);  

    List<Object> getButtonData(String compName); 
	
    List<Object> getSignatureSection(String compName); 

    List<Object> getSignatoryMetaDatas(String devName); 

     List<Object> getSignatoryDetails(String objectName,
                                                String fieldAPINames,
                                                String filterFieldAPIName,
                                                String strInput,String recId); 
    
    List<Object> fetchLookupRecords(String objectApiName, String fieldApiName,String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId);
}