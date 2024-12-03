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
               
           
           
}