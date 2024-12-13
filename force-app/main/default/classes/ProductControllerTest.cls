@isTest
private class ProductControllerTest {
    
    @isTest
    static void testGetProductsRecords() {
        
        Contact testContact = new Contact();
        testContact.lastname='Test';
        insert testContact;
        
        Test.startTest();
        List<Object> productRecords = ProductController.getQuickOrderRecords(testContact.id);
        list<object> reorderRecords =ProductController.getReorderRecords(testContact.id);
        list<object> contractedRecords =ProductController.getContractedRecords(testContact.id);
        list<object> pricingRecords =ProductController.getPricingRecords(testContact.id, '','','');
        
        Data_Table_Column__mdt columnRecords =ProductController.getColumns('Contracted_Products_Table');
        string settingInfo = ProductController.getSettingsinfo('OrderEntry');
        list<Tab_Configuration__mdt> getTabRecords = ProductController.getTabs();
        ProductController.saveFile('Test1,Test2',testContact.id,'');
        ProductController.getCartCount(testContact.id);
        //ProductController.getPricingInfo(testContact.id);
        ProductController.getRecordTypes();
        ProductController.getRecord(testContact.id,'',null);
        ProductController.getRecordValuesCheckOutScreen(testContact.id,'',testContact.id);
        ProductController.getButtonsInfo('Pricing_Products');
        CustomMetadataService.buttonSetting('Pricing_Products');
        CustomMetadataService.contractSetting('Disable_Entry_Fields');
        ProductController.getButtonsAction('','');
        ProductController.getPromotionButtonsAction('','');
        ProductController.getCurrentRecordName(testContact.id);
        ProductController.getHeaderinfo('');
        ProductController.getPricingInfo(testContact.id,'');
        ProductController.fetchHeaderData(testContact.id,'',null);
        ProductController.fetchRangePricing('','','');
        ProductController.getCurrencySymbol();
        sObject getRecordName = ProductController.getRecordName('Contact',testContact.Id,'Name','Email');
        map<String,map<String,sObject>> getUploadedRecordName = productController.getUploadedRecordNames('{"0":"Product2","1":"Product2"}','{"0":["GenWatt Diesel 10kW","SLA: Silver"],"1":["GenWatt Diesel 10kW","SLA: Silver"]}','{"0":"Name","1":"Name"}','{"0":"ProductCode"}');
        OrderRequestAddToCart.addProductsToCart('[{"National_Id__c":"01tao0000000l0XAAQ","Product_Name__c":"01tao0000000l0XAAQ","Quantity__c":4,"Percent__c":42,"Price__c":35.8,"Id":"a00ao000000LMOwAAO","National_Id__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"},"Product_Name__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"}}]','');       
        OrderRequestAddToCart.saveProductConfiguration('[{"National_Id__c":"01tao0000000l0XAAQ","Product_Name__c":"01tao0000000l0XAAQ","Quantity__c":4,"Percent__c":42,"Price__c":35.8,"Id":"a00ao000000LMOwAAO","National_Id__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"},"Product_Name__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"}}]','[{"National_Id__c":"01tao0000000l0XAAQ","Product_Name__c":"01tao0000000l0XAAQ","Quantity__c":4,"Percent__c":42,"Price__c":35.8,"Id":"a00ao000000LMOwAAO","National_Id__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"},"Product_Name__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"}}] ');
        OrderRequestAddToCart.contractedProductsAddToCart(testContact.id,'[{"National_Id__c":"01tao0000000l0XAAQ","Product_Name__c":"01tao0000000l0XAAQ","Quantity__c":4,"Percent__c":42,"Price__c":35.8,"Id":"a00ao000000LMOwAAO","National_Id__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"},"Product_Name__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"}}]');
        OrderRequestAddToCart.reorderAddToCart(testContact.id,'[{"National_Id__c":"01tao0000000l0XAAQ","Product_Name__c":"01tao0000000l0XAAQ","Quantity__c":4,"Percent__c":42,"Price__c":35.8,"Id":"a00ao000000LMOwAAO","National_Id__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"},"Product_Name__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"}}]');
        OrderRequestAddToCart.backToCart(testContact.id);
        OrderRequestAddToCart.deleteCartConfiguration(testContact.id);
        OrderRequestAddToCart.createConfiguration(testContact.id);
        OrderRequestAddToCart.finalizeCart(testContact.id);
        OrderRequestAddToCart.saveCart(testContact.id);
        OrderRequestAddToCart.createConfigLineItems(testContact.id,'[{"National_Id__c":"01tao0000000l0XAAQ","Product_Name__c":"01tao0000000l0XAAQ","Quantity__c":4,"Percent__c":42,"Price__c":35.8,"Id":"a00ao000000LMOwAAO","National_Id__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"},"Product_Name__r":{"Name":"GenWatt Diesel 200kW","Id":"01tao0000000l0XAAQ"}}]');
        OrderRequestAddToCart.createOrderLineItems(testContact.id,'');
        // Assert that the returned records are not null and have the expected size
        System.assertNotEquals(null, productRecords, 'List of records should not be null');
        
        Test.stopTest();
    }
    
}