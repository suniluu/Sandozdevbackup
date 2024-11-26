global Interface IGenerateAgreementController {
 	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    
    List<Map<String, Object>> getAgreementHomePageFieldSet(String objectName);

    List<Object> getAgreementSummaryPageFieldSet(String objectName);

    void errorHandleling(String recId, Exception e);
    
    List<Object> getAgreementCatalogData(String recId, String fieldsData);
    
    List<Object> getAgreementFastData(String recId,String productId, String fieldsData);
    
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


}