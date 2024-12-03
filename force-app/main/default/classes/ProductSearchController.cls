public with sharing class ProductSearchController {
    
    @AuraEnabled(cacheable=false) 
    public static List<AgreementProductWrapper> searchProducts(String searchType, String searchKey) {
        // Prepare the search pattern before the query
        String searchPattern = '%' + searchKey + '%';

        // Initialize the base query
        String query = 'SELECT Id, Name, ProductCode, Family,(SELECT Id, List_Price__c FROM Price_List_Item__r) FROM Product2 WHERE ';

        // Dynamically append the where clause based on searchType
        if ('Code'.equals(searchType)) {
            query += 'ProductCode LIKE :searchPattern ';
        } else if ('Name'.equals(searchType)) {
            query += 'Name LIKE :searchPattern ';
        } else if ('Family'.equals(searchType)) {
            query += 'Family LIKE :searchPattern ';
        }

        // Add a limit to the query for performance reasons
        query += 'LIMIT 100';

        //return Database.query(query);

        List<Product2> prodList = Database.query(query);
        List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        for (Product2 prod : prodList) {
            for (Price_List_Item__c priceListItem : prod.Price_List_Item__r) {
                AgreementProductWrapper agr = new AgreementProductWrapper();
                agr.productName = prod.Name;
                agr.productId = prod.Id;
                agr.productCode = prod.ProductCode;
                agr.productFamily = prod.Family;
                agr.listPrice = priceListItem.List_Price__c;
                agreProductWrapper.add(agr);
            }
        }
        return agreProductWrapper;
    }
    
    @AuraEnabled
    public static List<AgreementProductWrapper> getViewAllProductsData() {
        List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Product2> prodList = [SELECT Id, ProductCode, Name, Family, (SELECT Id, List_Price__c FROM Price_List_Item__r) FROM Product2];
        for (Product2 prod : prodList) {
            for (Price_List_Item__c priceListItem : prod.Price_List_Item__r) {
                AgreementProductWrapper agr = new AgreementProductWrapper();
                agr.productName = prod.Name;
                agr.productId = prod.Id;
                agr.productCode = prod.ProductCode;
                agr.productFamily = prod.Family;
                agr.listPrice = priceListItem.List_Price__c;
                agreProductWrapper.add(agr);
            }
        }
        return agreProductWrapper;
    }

    public class AgreementProductWrapper {
        @AuraEnabled
        public String productName { get; set; }

        @AuraEnabled
        public String productId { get; set; }

        @AuraEnabled
        public String productCode { get; set; }

        @AuraEnabled
        public String productFamily { get; set; }

        @AuraEnabled
        public Decimal discount { get; set; }

        @AuraEnabled
        public Decimal netPrice { get; set; }

        @AuraEnabled
        public Decimal listPrice { get; set; }
    }

}