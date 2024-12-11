global Interface IGenerateReqestOrder {
 	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    Object fastOrderAddToCart(List<Object> orderData, String orderId);
    
    Object createConfiguration(String configId);
    
    Boolean createConfigLineItems(String configId, List<Object> productData);
    
    Object finalizeCart(String configId);

    Object saveCart(String configId);
    
    Object generateApprovalRequests(String orderId, String configId);
    
    Object createOrderLineItems(String orderId, String configId);
        
    void saveProductConfiguration(List<Object> orderData, List<Object> productData);    

    void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst);

    void deleteCartConfiguration(String recId);
    
    void reorderAddToCart(String recId,List<Object> scopeObjectLst);
    
    String onBackToCart(String recId);
    
    List<Object> getQuickOrderData(String recId);
    
    List<Object> getReOrderData(String recId);
    
    List<Object> getPricingData(String recId, String fieldsData,String cerApi,String priceListApi);
    
    List<Object> getContractedData(String recId);
    
    List<Object> getPricingAggrementData(String productId, String fieldsData);
    
    List<Object> fileUpload(String recId,String base64Data, String fieldsData);
    
    Integer getCartRecordCount(String recId);
    
    void errorHandleling(String recId, Exception e);
    
    List<Object> getRecordTypeData();
    
    List<Object> getRecordValues(Id recId, String fieldSetName, Id orderId);

    List<Object> getRecordValuesCheckOutScreen(Id recId, String fieldSetName,Id orderId);
    
    Object getRecordTitle(Id recId);
    
    List<Object> getButtonData(String compName);
    
    List<Object> getButtonDetails(String buttonLabel, String productData);

    List<Object> getPromotionButtonDetails(String buttonLabel, String productData);

    List<promotions__c> getRecordsFromPromoDetails(String productData);

    List<Object> applyPromotionToProductDetail(String productData, String promotionId);
    
    List<Object> headerInfo(String fieldLabel);
    
    List<Object> getHeaderData(Id recId, String typename, Id orderId);
    
    List<Object> getRangePricing(String fields, String saveDraftValues,String productData);
    
    List<Object> bestcontractpricing(String fields,String productdata);
    
    Object getOrderDetails(Id recId);
    
    List<Object> getOrderLineItems(Id orderId);
    
    Object saveConfiguration(String orderId, List<Object> orderData, List<Object> productData);

    List<Object> fetchLookupRecords(String objectApiName, String fieldApiName,String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId);
    
    //List<String> getOrderPricingMeta();
    Map<String, String> getOrderPricingMetadata();
    
    List<Object> orderPricevalidate(string agreementLineItemData);
    
    String orderlineitemsvalidate(string agreementLineItemData); 
    
    List<Object> validateData(Map<string,string> fieldValues);

    Boolean checkIsCongaUsed(String devName);

    Object createOrderLineItemsForNonConga(String orderId, List<Object> productData);

    Object generateApprovalRequestsForNonConga(String orderId);
    
      List<Object> customPriceCalculation(string orderdata);
}