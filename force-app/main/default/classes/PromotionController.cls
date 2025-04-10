public with sharing class PromotionController {

    // Method to create a new Promotion record based on input PromotionData
    @AuraEnabled
    public static Id createPromoRecord(Map<String, Object> params) {
        try{
        system.debug('params'+params);
        String Name = (String) params.get('Name');
        Boolean Active = (Boolean)params.get('Active__c');
        Boolean IncludeOtherPromo = (Boolean)params.get('Include_with_other_promotions__c');
        Date effectiveDate = params.get('Effective_Date__c') != null ? Date.valueOf((String)params.get('Effective_Date__c')) : null;
        Date expirationDate = params.get('Expiration_Date__c') != null ? Date.valueOf((String)params.get('Expiration_Date__c')) : null;
        String AdjustmentType = (String)params.get('Adjustment_Type__c');
        Decimal AdjustmentAmount = (Decimal)params.get('Adjustment_Amount__c');
        String selectedProductsStr = (string)params.get('Products__c');
        List<String> selectedProductCodes = selectedProductsStr != null ? selectedProductsStr.split(';') : new List<String>();

            Promotions__c Promo = new Promotions__c(
                Name = Name,
                Active__c = Active,
                Include_with_other_promotions__c = IncludeOtherPromo,
                Effective_Date__c = EffectiveDate,
                Expiration_Date__c = ExpirationDate,
                Adjustment_Type__c = AdjustmentType,
                Adjustment_Amount__c = AdjustmentAmount          
            );

            if (!selectedProductCodes.isEmpty()) {               
                Promo.Products__c = String.join(selectedProductCodes, ';'); 
            }

            insert Promo;
            return promo.Id;
    }
    Catch(exception e){
        throw new AuraHandledException('Error creating Promotion: ' + e.getMessage());
    }

    }

    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(String fieldApiName) {
        List<String> picklistValues = new List<String>();

        try {
            Schema.DescribeFieldResult fieldResult = Promotions__c.Adjustment_Type__c.getDescribe();
            
            if (fieldResult.getType() == Schema.DisplayType.Picklist) {
                List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
                for (Schema.PicklistEntry entry : ple) {
                    picklistValues.add(entry.getLabel());
                }
            }
        } catch (Exception e) {
            System.debug('Error fetching picklist values: ' + e.getMessage());
        }
        
        return picklistValues;
    }

    @AuraEnabled(cacheable=true)
    public static List<product2> getProducts() {
        List<Product2> products = new List<Product2>();
        try {
            products = [SELECT Id, Name, ProductCode FROM Product2];
        } catch (Exception e) {
            System.debug('Error fetching Products: ' + e.getMessage());
        }

        return products;
    }

    public class FieldInfo {
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public String fieldName { get; set; }
        @AuraEnabled public String fieldtype { get; set; }
        
        public FieldInfo(String label, String fieldName, String fieldtype) {
            this.label = label;
            this.fieldName = fieldName;
            this.fieldtype = fieldtype;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<FieldInfo> getAgreementLineItemFields() {
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Agreement_Line_Item__c.fields.getMap();
        Map<String, Schema.SObjectField> customFieldMap = new Map<String, Schema.SObjectField>();
        List<FieldInfo> fieldDetails = new List<FieldInfo>();
        
        for (String fieldName : fieldMap.keySet()) {
            if (fieldName.endsWith('__c') || fieldName == 'Name' || fieldName == 'Id' ) {
                customFieldMap.put(fieldName, fieldMap.get(fieldName));
                
                Schema.SObjectField field = customFieldMap.get(fieldName);
                String label = field.getDescribe().getLabel();
                String fieldtype = field.getDescribe().getType().name(); 
                fieldDetails.add(new FieldInfo(label, fieldName, fieldtype));
            }
        }
        return fieldDetails;
    } 

     @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getObjects() {
        List<Map<String, Object>> objects = new List<Map<String, Object>>();

        for (Schema.SObjectType objType : Schema.getGlobalDescribe().values()) {
            Schema.DescribeSObjectResult describeResult = objType.getDescribe();
            if (describeResult.isCreateable()) {
                Map<String, Object> objInfo = new Map<String, Object>();
                objInfo.put('label', describeResult.getLabel());
                objInfo.put('apiName', describeResult.getName());
                objects.add(objInfo);
            }
        }

        return objects;
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getFields(String objectApiName) {
        Schema.DescribeSObjectResult describeResult = Schema.getGlobalDescribe().get(objectApiName).getDescribe();
        return getFieldDetails(describeResult, 1);
    }

    private static List<Map<String, Object>> getFieldDetails(Schema.DescribeSObjectResult describeResult, Integer level) {
        List<Map<String, Object>> fields = new List<Map<String, Object>>();
        if (level > 5) return fields; // Limit to 5 levels of recursion

        for (Schema.SObjectField field : describeResult.fields.getMap().values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            Map<String, Object> fieldInfo = new Map<String, Object>();
            fieldInfo.put('label', fieldDescribe.getLabel());
            fieldInfo.put('apiName', fieldDescribe.getName());
            fieldInfo.put('type', fieldDescribe.getType().name());

            if (fieldDescribe.getType() == Schema.DisplayType.REFERENCE) {
                fieldInfo.put('hasChildren', true);
            } else {
                fieldInfo.put('hasChildren', false);
            }

            fields.add(fieldInfo);
        }
        return fields;
    } 
}