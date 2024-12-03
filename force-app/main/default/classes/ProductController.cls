/**
 * @description: Product controller to fetch default data for order request and all business logic
 */
public with sharing class ProductController {

    /**
     * @description getQuickOrderRecords to get all the related products for the selected order
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getQuickOrderRecords(String recId) {
        List<Object> lstProductData = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstProductData = customPlugin.getQuickOrderData(recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lstProductData;
    }
    
    /**
     * @description getQuickOrderRecords to get all the related products for the selected order
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getRecordTypes() {
        List<Object> lstRecordTypesData = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
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
    public static List<Object> getRecord(Id recId, String fieldSetName, Id orderId){
        List<Object> lstrecord = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstrecord = customPlugin.getRecordValues(recId, fieldSetName, orderId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstrecord;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> getRecordValuesCheckOutScreen(Id recId, String fieldSetName,Id orderId){
        List<Object> lstrecord = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstrecord = customPlugin.getRecordValuesCheckOutScreen(recId, fieldSetName,orderId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstrecord;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> contractpricing(String fields,String productdata){
        List<Object> lstrecord = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstrecord = customPlugin.bestcontractpricing(fields,productdata);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstrecord;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> fetchHeaderData(Id recId, String typename, Id orderId){
        List<Object> lstHeaderData = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstHeaderData = customPlugin.getHeaderData(recId, typename, orderId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstHeaderData;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getButtonsInfo(String compName){
        List<Object> lstButtonInfo = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
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
    public static List<Object> getButtonsAction(String buttonLabel, String productData){
        List<Object> lstWrapper = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstWrapper = customPlugin.getButtonDetails(buttonLabel, productData);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstWrapper;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> getPromotionButtonsAction(String buttonLabel, String productData){
        system.debug('productdatanewbutton'+productdata);
        List<Object> lstWrapper = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	lstWrapper = customPlugin.getPromotionButtonDetails(buttonLabel, productData);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstWrapper;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> applyPromotionToProduct(String productData, String promotionId){
        List<Object> lstWrapper = new List<Object>();
        system.debug('productdatanew'+productData);
        system.debug('promotionId'+promotionId);
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        system.debug('customPlugin'+customPlugin);
        if(customPlugin != null){
            try{
                system.debug('*********************');
            	lstWrapper = customPlugin.applyPromotionToProductDetail(productData, promotionId);
                system.debug('lstWrapper'+lstWrapper);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstWrapper;
    }

    @AuraEnabled(cacheable=true)
    public static List<promotions__c> getRecordsFromPromoAction(String productData) {
        List<promotions__c> promo = new List<promotions__c>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	promo = customPlugin.getRecordsFromPromoDetails(productData);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return promo;
    }
    
    @AuraEnabled(cacheable=true)
    public static Object getCurrentRecordName(Id recId){
        Object titleDetails;
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
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
    public static Object getOrderDetails(Id recId){
        Object titleDetails;
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	titleDetails = customPlugin.getOrderDetails(recId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return titleDetails;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> fetchOrderLineItems(Id orderId){
        List<Object> productData = new List<Object>();
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	productData = customPlugin.getOrderLineItems(orderId);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return productData;
    }
    
    /**
     * @description getQuickOrderRecords to get all the related products for the selected order
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getPricingInfo(String productId, String fieldsData) {
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstProductData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstProductData = customPlugin.getPricingAggrementData(productId,fieldsData);
            } catch(Exception e){
                customPlugin.errorHandleling(productId,e);
            }
        }
        return lstProductData;
    }

    /**
     * @description: getReorderRecords to get all the orders and order line items records for the selected parent records
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getReorderRecords(String recId){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstReorderData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstReorderData = customPlugin.getReOrderData(recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lstReorderData;
    }
    
    /**
     * @description: getPricingRecords to get all the orders and order line items records for the selected parent records
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getPricingRecords(String recId, String fieldsData,String cerApi,String priceListApi){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstPricingData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstPricingData = customPlugin.getPricingData(recId, fieldsData,cerApi,priceListApi);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lstPricingData;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> fetchRangePricing(String fields, String saveDraftValues, String productData){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstPricingData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstPricingData = customPlugin.getRangePricing(fields, saveDraftValues, productData);
            } catch(Exception e){
                customPlugin.errorHandleling('',e);
            }
        }
        return lstPricingData;
    }
    
    /**
     * @description: getContractedRecords to get all the orders and order line items records for the selected parent records
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> getContractedRecords(String recId){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstContractedData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstContractedData = customPlugin.getContractedData(recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return lstContractedData;
    }
    
    @AuraEnabled(cacheable=true)
    public static Integer getCartCount(String recId){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        Integer cartCount = 0;
        if(customPlugin != null){
            try{
            	cartCount = customPlugin.getCartRecordCount(recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return cartCount;
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

    @AuraEnabled
	public static List<Object> saveFile(String base64Data, String recId, String fieldsData){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
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
    
    @AuraEnabled
    public static List<Object> getHeaderinfo(String fieldLabel){
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstHeaderData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstHeaderData = customPlugin.headerInfo(fieldLabel);
            } catch(Exception e){
                customPlugin.errorHandleling(fieldLabel,e);
            }
        }
        return lstHeaderData;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getSettingsinfo(String fieldLabel){
        Order_Request_Setting__mdt ors = CustomMetadataService.contractSetting(fieldLabel);
        return ors.Plugin__c;
    }
    
    /**
     * @description: getTabs to get all the tabs on the order request page based on the order of the tab
     * @return: return type list of Data_Table_Column__mdt
     */
    @AuraEnabled(cacheable=true)
    public static List<Tab_Configuration__mdt> getTabs(){
        String query = ProductController.getQuery('Tabs_Query');
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
     * @description: getRecordName to fetch the record Name based on the record id which is based for generic object using object name and the field
     * @return: return type string
     */
    @AuraEnabled(cacheable=true)
    public static sObject getRecordName(String objName, String recId, String fieldLookupName, String addfield){
        addfield = addfield != null && addfield != '' ? String.escapeSingleQuotes(addfield)+',' : '';
        String query = 'Select id,'+addfield+''+String.escapeSingleQuotes(fieldLookupName)+' from '+String.escapeSingleQuotes(objName)+' Where Id =:recId  WITH SECURITY_ENFORCED';
        sObject s = Database.query(query);
        return s;  
    }
    
    /**
     * @description: getUploadedRecordNames to get the record names which are mass uploaded for all related fields
     * @return: return type map<String,map<String,String>>
     */
    @AuraEnabled(cacheable=true)
    public static map<String,map<String,sObject>> getUploadedRecordNames(String mapLookupColumns, String mapLookupNames, String mapfieldLookupName, String addSearchField){
        Map<String,Object> mapLookupColumnsObj = (Map<String,Object>) JSON.deserializeUntyped(mapLookupColumns);
        Map<String,Object> mapLookupNamesObj = (Map<String,Object>) JSON.deserializeUntyped(mapLookupNames);
        Map<String,Object> mapfieldLookupNameObj = (Map<String,Object>) JSON.deserializeUntyped(mapfieldLookupName);
        Map<String,Object> mapaddSearchField = (Map<String,Object>) JSON.deserializeUntyped(addSearchField);
        System.debug(mapaddSearchField);
        map<String, List<String>> mapRecordNames = new map<String,List<String>>();
        for(String row : mapLookupColumnsObj.keySet()){
            System.debug(mapLookupNamesObj.get(row));
            List<String> lstRecordNames = (String.valueOf(mapLookupNamesObj.get(row)).replaceAll('\\(','').replaceAll('\\)','')).split(',');
            List<String> lstRecordNamesAfterTrim = new List<String>();
            for(String str : lstRecordNames){
                lstRecordNamesAfterTrim.add(str.trim());
            }
            mapRecordNames.put(''+row,lstRecordNamesAfterTrim);
        }
        System.debug(mapRecordNames);
        
        map<String, map<String,sObject>> mapRecordwithIds = new map<String, map<String,sObject>>();
        for(String row : mapRecordNames.keyset()){
            map<String,sObject> mapRecordNamesWithIds = ProductController.getRecordIds(''+mapLookupColumnsObj.get(row),mapRecordNames.get(row), ''+mapfieldLookupNameObj.get(row), ''+mapaddSearchField.get(row));
            mapRecordwithIds.put(row, mapRecordNamesWithIds);
        }
        
        return mapRecordwithIds;
    }
    
    /**
     * @description: getRecordIds to get record ids based on the name which are passed while mass uploaded
     * @return: return type map<String,String>
     */
    public static map<String,sObject> getRecordIds(String objName, List<String> recordNames, String fieldName, String searchField){
        String query = 'Select id,';
        if(searchField != 'null'){
            query += String.escapeSingleQuotes(searchField)+',';
        }
        query += String.escapeSingleQuotes(fieldName)+' from '+String.escapeSingleQuotes(objName)+' Where ('+String.escapeSingleQuotes(fieldName)+' IN:recordNames or ';
        if(searchField != 'null'){
            query += String.escapeSingleQuotes(searchField)+' IN:recordNames or ';
        }
        query += ' Id IN:recordNames) WITH SECURITY_ENFORCED';
        System.debug('query-->'+query);
        List<sObject> sObjectData = Database.query(query);
        System.debug('sObjectData'+sObjectData);
        map<String,sObject> mapRecordNamesWithIds = new map<String,sObject>();
        for(sObject s : sObjectData){
            mapRecordNamesWithIds.put(''+s.get(fieldName), s);
            if(searchField != 'null'){
            	mapRecordNamesWithIds.put(''+s.get(searchField), s);
            }
        }
        return mapRecordNamesWithIds;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> fetchLookupRecords(String objectApiName, String fieldApiName,
            String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId) {
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
        List<Object> lstData = new List<Object>();
        if(customPlugin != null){
            try{
            	lstData = customPlugin.fetchLookupRecords(objectApiName,fieldApiName,otherFieldApiName,searchString,selectedRecordId,pricelistId,recId);
            } catch(Exception e){
                customPlugin.errorHandleling(pricelistId,e);
            }
        }
        return lstData;
    }
    
    
    
     /**
     * @description getQuickOrderRecords to get all the related products for the selected order
     * @return: return type list of sobject.
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> orderPricevalidate(string orderLineItemData) {
         List<Object> lstrecord;
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
   
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.orderPricevalidate( orderLineItemData);
            } catch(Exception e){
                system.debug('Error in Pricevalidation');
            }
        }
        return lstrecord;  
    }
    
     @AuraEnabled(cacheable=true)
     public static Boolean orderlineitemsvalidate(string orderLineItemData){
       boolean lstrecord;
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
 
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.orderlineitemsvalidate(orderLineItemData);
            } catch(Exception e){
                system.debug('Error in lineitems  validation');
            }
        }
        return lstrecord;   
    }
     @AuraEnabled(cacheable=true)
     public static Map<String, String> getOrderPricingMeta(){
       Map<String, String> lstrecord ;
        IGenerateReqestOrder customPlugin = OrderRequestAddToCart.getCerPluginInstance('OrderEntry');
 
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.getOrderPricingMetadata();
            } catch(Exception e){
                system.debug('Error in lineitems  validation');
            }
        }
        return lstrecord;   
    }
    
     
}