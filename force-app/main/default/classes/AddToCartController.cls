public with sharing class AddToCartController implements IGenerateReqestOrder {
    
    /**
* @description Bar: sample class for deployment practice
* @return Bar: sample class for deployment practice
*/
    
    public class OrderField {
        public String displayValue;
        public String fieldName;
        public String label;
        public String relatedObject;
        public String relatedObjectId;
        public String value;
        public Boolean isAgreement;
        public Boolean isDisabled;
    }
    public Object fastOrderAddToCart(List<Object> orderData, String orderId){
        List<OrderField> orderFields = new List<OrderField>();
        Order orderObj = new Order();        
        
        try {
            if(orderId != null){
                System.debug('24 orderId'+ orderId);
                /*String query = 'SELECT Id';
system.debug('outside query is :'+query);
for (Object item : orderData) {
Map<String, Object> fieldMap = (Map<String, Object>)item;           
String fieldName = (String)fieldMap.get('fieldName');
if(fieldName!='Order_Type__c' && fieldName!='Payment_Terms__c' && fieldName!='Internal_Notes__c' && fieldName!='Wholesaler__c' && fieldName!='Delivery_Date__c' && fieldName!='PO_Number__c' && fieldName!='Order_Reason__c' && fieldName!='Delivery_Text__c' && fieldName!='Delivery_Type__c'  && fieldName!='Invoice_Text__c'){
query = query+','+fieldName;
}
system.debug('inside query :'+query);
}
query = query + ' FROM Order WHERE Id = :orderId';
System.debug('final query :' + query);
Order orderObj1 = Database.query(query.replace(':orderId', '\'' + String.escapeSingleQuotes(orderId) + '\''));
System.debug('Order retrieved :' + orderObj1);
return orderObj;*/
                orderObj = [SELECT Id FROM Order where Id = :orderId];
                OrderCreationResponse orderResponse =  new OrderCreationResponse(true, 'Order created successfully.', orderObj);
                String jsonResponse = JSON.serialize(orderResponse);
                return jsonResponse;
                
            }else{
                String orderStart = System.now().format('yyyy-MM-dd HH:mm:ss.SSS');
                System.debug('order start time is :'+orderStart);
                for (Object item : orderData) {
                    Map<String, Object> fieldMap = (Map<String, Object>)item;           
                    String fieldName = (String)fieldMap.get('fieldName');
                    String value = (String)fieldMap.get('value');
                    if(fieldName!='Order_Type__c' && fieldName!='Payment_Terms__c' && fieldName!='Internal_Notes__c' && fieldName!='Wholesaler__c' &&
                       fieldName!='Delivery_Date__c' && fieldName!='PO_Number__c' && fieldName!='Order_Reason__c' && fieldName!='Delivery_Text__c' && 
                       fieldName!='Delivery_Type__c'  && fieldName!='Invoice_Text__c'){
                        System.debug('fieldName is :'+fieldName);
                        System.debug('value is :'+value);
                        if((String)fieldMap.get('fieldName') == 'Account__c'){
                            orderObj.AccountId = (String)fieldMap.get('value');
                            System.debug('59 orderObj'+ orderObj);
                        }
                        if (String.isNotBlank(value)) {
                            orderObj.put(fieldName, value);
                        }
                    }
                }
                orderObj.Status = 'Draft';            
                orderObj.EffectiveDate = System.today();
                 System.debug('68 orderObj'+ orderObj);
                insert orderObj;
                
                String orderEnd = System.now().format('yyyy-MM-dd HH:mm:ss.SSS');
                System.debug('order end time is :'+orderEnd);
                
                OrderCreationResponse orderResponse =  new OrderCreationResponse(true, 'Order created successfully.', orderObj);
                String jsonResponse = JSON.serialize(orderResponse);
                return jsonResponse;
            }
        } catch (Exception e) {
            OrderCreationResponse orderResponse =  new OrderCreationResponse(false, 'Error creating order: '+ e.getMessage(), null);           
            String jsonResponse = JSON.serialize(orderResponse);
            return jsonResponse;
        }
    }
    
    public Boolean createConfigLineItems(String configId, List<Object> productData){
        Boolean result = false;
        List<Line_Item__c > itemsToInsert = new List<Line_Item__c>();
        try{
            String productDataJSON = JSON.serialize(productData);
            List<Object> scopeObjectsData = (List<Object>) JSON.deserializeUntyped(
                productDataJSON
            );            
            for (Object scopeObject : scopeObjectsData) {
                Map<String, Object> scopeMap = (Map<String, Object>) scopeObject;
                Line_Item__c agrLI = new Line_Item__c();
                if (scopeMap.containsKey('listPrice') && scopeMap.get('listPrice') != null) {
                    agrLI.List_Price__c = Decimal.valueOf(String.valueOf(scopeMap.get('listPrice')));      
                }
                if (scopeMap.containsKey('productName') && scopeMap.get('productName') != null) {
                    agrLI.Product__c = String.valueOf(scopeMap.get('productName'));      
                }
                if (scopeMap.containsKey('priceListName') && scopeMap.get('priceListName') != null) {
                    agrLI.Price_List_Name__c = String.valueOf(scopeMap.get('priceListName'));      
                }
                if (scopeMap.containsKey('productId') || scopeMap.containsKey('productCode')) {
                    String prodId = String.valueOf(scopeMap.get('productId'));
                    agrLI.Product_Name__c = prodId;
                }
                if (scopeMap.containsKey('netPrice') && scopeMap.get('netPrice') != null) {
                    agrLI.Net_Price__c = Decimal.valueOf(String.valueOf(scopeMap.get('netPrice')));      
                }
                if (scopeMap.containsKey('discount') && scopeMap.get('discount') != null) {
                    agrLI.Discount__c = Decimal.valueOf(String.valueOf(scopeMap.get('discount')));       
                }
                if (scopeMap.containsKey('quantity') && scopeMap.get('quantity') != null) {
                    agrLI.Quantity__c = Decimal.valueOf(String.valueOf(scopeMap.get('quantity')));       
                }                
                if (scopeMap.containsKey('selectedDropdownValue') && scopeMap.get('selectedDropdownValue') != null) {
                    try {
                        if(scopeMap.get('selectedDropdownValue') == 'Percent'){
                            agrLI.Adjustment_Percent__c = Decimal.valueOf(String.valueOf(scopeMap.get('discount')));
                        }
                        if(scopeMap.get('selectedDropdownValue') == 'Amount'){
                            agrLI.Adjustment_Amount__c = Decimal.valueOf(String.valueOf(scopeMap.get('discount')));
                        }
                    } catch (Exception e) {
                        System.debug('Error parsing price: ' + e.getMessage());
                    }
                }                                  
                
                agrLI.Configuration__c = configId;
                itemsToInsert.add(agrLI);
            }
            if(!itemsToInsert.isEmpty()){
                insert itemsToInsert;
                result = true;
            }
        } catch (Exception e) {
            result = false;
        }  
        return result;  
    }
    
    public Object saveConfiguration(String orderId, List<Object> orderData, List<Object> productData){        
        try {
            JSON_Data__c jsonDataObj = new JSON_Data__c();
            String orderDataJson = JSON.serialize(orderData);
            String productDataJson = JSON.serialize(productData);
            jsonDataObj.Data_Object_Id__c = orderId;
            jsonDataObj.Order_Header_Data__c = orderDataJson;
            jsonDataObj.Order_Line_Items_Data__c = productDataJson;
            insert jsonDataObj;
            ConfigurationCreationResponse configCreateResponse = new ConfigurationCreationResponse(true, 'Configuration data saved successfully.', jsonDataObj.Id);
            system.debug('jj ConfigurationCreationResponse is :'+configCreateResponse);
            String jsonResponse = JSON.serialize(configCreateResponse);
            return jsonResponse;
        } catch (DmlException e) {
            System.debug('Error creating configuration: ' + e.getMessage());
            ConfigurationCreationResponse configCreateResponse = new ConfigurationCreationResponse(false, 'Error while saving data: '+e.getMessage(), null);
            system.debug('jj failed ConfigurationCreationResponse is :'+configCreateResponse);
            String jsonResponse = JSON.serialize(configCreateResponse);
            return jsonResponse;
        }
    }
    
    public Object generateApprovalRequests(String orderId, String configId){        
        try {
            Order orderObj = [SELECT Id, Owner.Id FROM Order WHERE Id = :orderId];
            Approval__c approvalObj = new Approval__c();
            approvalObj.Related_Order__c = orderId;
            approvalObj.Approval_Description__c = 'This is an approval request created';
            approvalObj.Approval_Owner__c = orderObj.Owner.Id;
            insert approvalObj;
            ConfigurationCreationResponse configCreateResponse = new ConfigurationCreationResponse(true, 'Approvals generated successfully.', approvalObj.Id);
            system.debug('jj ConfigurationCreationResponse is :'+configCreateResponse);
            String jsonResponse = JSON.serialize(configCreateResponse);
            return jsonResponse;
        } catch (DmlException e) {
            System.debug('Error creating configuration: ' + e.getMessage());
            ConfigurationCreationResponse configCreateResponse = new ConfigurationCreationResponse(false, 'Error while generating approvals: '+e.getMessage(), null);
            system.debug('jj failed ConfigurationCreationResponse is :'+configCreateResponse);
            String jsonResponse = JSON.serialize(configCreateResponse);
            return jsonResponse;
        }
    }
    
    public Object createConfiguration(String orderId){        
        Id cartID;
        try {
            String configStart = System.now().format('yyyy-MM-dd HH:mm:ss.SSS');
            System.debug('config start time is :'+configStart);
            Configuration__c prodConfig = new Configuration__c();
            prodConfig.Status__c = 'New';
            prodConfig.Order__c = orderId;
            upsert prodConfig;
            cartID =  prodConfig.Id;
            System.debug('Configuration created, id is: ' + cartID);
            String configEnd = System.now().format('yyyy-MM-dd HH:mm:ss.SSS');
            System.debug('config end time is :'+configEnd);
            ConfigurationCreationResponse configCreateResponse = new ConfigurationCreationResponse(true, 'Configuration created successfully.', cartID);
            system.debug('jj ConfigurationCreationResponse is :'+configCreateResponse);
            String jsonResponse = JSON.serialize(configCreateResponse);
            return jsonResponse;
        } catch (DmlException e) {
            System.debug('Error creating configuration: ' + e.getMessage());
            ConfigurationCreationResponse configCreateResponse = new ConfigurationCreationResponse(false, 'Error creating configuration: '+e.getMessage(), null);
            system.debug('jj failed ConfigurationCreationResponse is :'+configCreateResponse);
            String jsonResponse = JSON.serialize(configCreateResponse);
            return jsonResponse;
        }
    }
    
    public Object finalizeCart(String configId){
        try {
            system.debug('jj finalize cart configId is :'+configId);
            String configFinStart = System.now().format('yyyy-MM-dd HH:mm:ss.SSS');
            System.debug('configFinStart is :'+configFinStart);
            Configuration__c productConfiguration = [SELECT Id, Status__c FROM Configuration__c WHERE Id = :configId];
            productConfiguration.Status__c = 'Finalized';
            update productConfiguration;
            String configFinEnd = System.now().format('yyyy-MM-dd HH:mm:ss.SSS');
            System.debug('configFinEnd is :'+configFinEnd);
            BooleanResponses boolResponse = new BooleanResponses(true, 'Cart finalized successfully.','Apttus_Config2__Order__c');
            String jsonResponse = JSON.serialize(boolResponse);
            return jsonResponse;
        } catch (Exception e) {
            BooleanResponses boolResponse = new BooleanResponses(false, 'Error finalizng cart: ' + e.getMessage(), null);
            String jsonResponse = JSON.serialize(boolResponse);
            return jsonResponse;
        }  
    }
    
    public Object saveCart(String configId){
        Object obj;
        return obj;
    }
    
    public Object createOrderLineItems(String orderId,String configId){
        List<Order_Line_Item__c> oliToUpdate = new List<Order_Line_Item__c>();
        try{
            List<Line_Item__c> existingLines = [SELECT Id, List_Price__c,Quantity__c, Net_Price__c, Price_List_Name__c,Product__c,Adjustment_Amount__c,Adjustment_Percent__c,Adjustment_Type__c,Discount__c FROM Line_Item__c where Configuration__c =:configId ];
            for(Line_Item__c liObj : existingLines){
                Order_Line_Item__c oliObj = new Order_Line_Item__c();
                if(liObj.List_Price__c!=null)
                    oliObj.List_Price_c__c = liObj.List_Price__c;
                if(liObj.Quantity__c!=null)
                    oliObj.Quantity__c = liObj.Quantity__c;
                if(liObj.Net_Price__c!=null)
                    oliObj.Price__c = liObj.Net_Price__c;
                if(liObj.Price_List_Name__c!=null)
                    oliObj.Price_List_Name__c = liObj.Price_List_Name__c;
                if(liObj.Product__c!=null)
                    oliObj.Product_Name__c = liObj.Product__c;
                if(liObj.Adjustment_Amount__c!=null)
                    oliObj.Adjustment_Amount__c = liObj.Adjustment_Amount__c;
                if(liObj.Adjustment_Percent__c!=null)
                    oliObj.Adjustment_Percent__c = liObj.Adjustment_Percent__c;
                if(liObj.Adjustment_Type__c!=null)
                    oliObj.Adjustment_Type__c = liObj.Adjustment_Type__c;
                if(liObj.Discount__c!=null)
                    oliObj.Discount__c = liObj.Discount__c;
                oliObj.Order__c = orderId;
                oliToUpdate.add(oliObj);    
            }
            if(!oliToUpdate.isEmpty()){
                insert oliToUpdate;
                BooleanResponses boolResponse = new BooleanResponses(true, 'Order Line Items created successfully', 'Order');
                String jsonResponse = JSON.serialize(boolResponse);
                return jsonResponse;
            }else{
                BooleanResponses boolResponse = new BooleanResponses(false, 'Order Line Items creation failed', null);
                String jsonResponse = JSON.serialize(boolResponse);
                return jsonResponse;
            }
        }catch(Exception e){
            BooleanResponses boolResponse = new BooleanResponses(false, 'Error creating order line items: ' + e.getMessage(), null);
            String jsonResponse = JSON.serialize(boolResponse);
            return jsonResponse;            
        }
    }
    
    public void saveProductConfiguration(List<Object> orderData, List<Object> productData){
        //System.debug(scopeObjectLst);
    }
    
    public void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst){
        //System.debug(scopeObjectLst);
    }
    
    public void reorderAddToCart(String recId,List<Object> scopeObjectLst){
        //System.debug(scopeObjectLst);
    }
    
    public void errorHandleling(String recId, Exception e){
        
    }
    
    public List<Object> headerInfo(String fieldLabel){
        return new List<Object>();
    }
    
    public List<Object> getRecordTypeData(){
        return [select Id,Name from RecordType where sObjectType='Sample_Product__c'];
    }
    
    public Object getRecordTitle(Id recId){
        TitleWrapper tw = new TitleWrapper();
        tw.name = [select Id,Name from Sample_Product__c where Id =: recId].Name;
        tw.objName = 'Account';
        tw.iconName = 'standard:account';
        return tw;
    }
    
    public Object getOrderDetails(Id recId){
        Order ord = [select id,AccountId,Account.Name from Order where Id =: recId];
        
        OrderDetailWrapper odw = new OrderDetailWrapper();
        odw.accId = ord.AccountId;
        odw.orderType = 'Quick Order';
        odw.name = ord.Account.Name;
        odw.objName = 'Account';
        odw.iconName = 'standard:account';
        return odw;
    }
    
    public List<Object> getButtonData(String compName){
        return CustomMetadataService.buttonSetting(compName);
    }
    
    public List<Object> getOrderLineItems(Id orderid){
        List<ProductWrapper> lstProductData = new List<ProductWrapper>();
        JSON_Data__c jsonData = new JSON_Data__c();
        for(JSON_Data__c jd : [SELECT Id,Data_Object_Id__c,Order_Header_Data__c,Order_Line_Items_Data__c FROM JSON_Data__c WHERE Data_Object_Id__c = :orderid]){
            jsonData = jd;
        }
        if(jsonData.Order_Line_Items_Data__c != null){
            lstProductData = (List<ProductWrapper>)JSON.deserialize(jsonData.Order_Line_Items_Data__c, List<ProductWrapper>.class);
        }
        for (productwrapper pw :lstProductData) {
            pw.discountApplied = false;
        }
        return lstProductData;
    }
    
    public List<Object> getButtonDetails(String buttonLabel, String productData){
        List<ProductWrapper> lstProductData = (List<ProductWrapper>)JSON.deserialize(productData, List<ProductWrapper>.class);
        map<String,String> mapStockCheck = new map<String,String>();
        System.debug(buttonLabel);
        List<ProductWrapper> lstProductWrapper = new List<ProductWrapper>();
        for(ProductWrapper pw : lstProductData){
            ProductWrapper newPW = new ProductWrapper();
            newPW = pw;
            Integer rem = math.mod(Integer.valueof(Math.random() * 100),3);
            newPW.atpcol = rem == 0 ? 'redClass' : rem == 1 ? 'yellowClass' : 'greenClass';
            lstProductWrapper.add(newPW);
        }
        return lstProductWrapper;
    }
    
    
    
    public List<Object> getPromotionButtonDetails(String buttonLabel, String productData) {
        List<ProductWrapper> lstProductData = (List<ProductWrapper>) JSON.deserialize(productData, List<ProductWrapper>.class);
        
        Set<String> productIds = new Set<String>();
        for (ProductWrapper pw : lstProductData) {
            productIds.add(pw.Id);
        }
        
        List<Product2> productlist = [SELECT Id, Name, ProductCode FROM Product2 WHERE Id IN :productIds];
        
        Map<String, String> prodIdCode = new Map<String, String>();
        for (Product2 prod : productlist) {
            prodIdCode.put(prod.Id, prod.ProductCode);
        }
        
        List<Promotions__c> promotionsList = [SELECT Id, Name, Adjustment_Type__c, Adjustment_Amount__c, products__c FROM Promotions__c];
        
        for (ProductWrapper pw : lstProductData) {
            String productCode = prodIdCode.get(pw.Id);
            
            for (Promotions__c promotion : promotionsList) {
                String[] productCodes = promotion.products__c.split(';'); 
                
                if (productCodes.contains(productCode)) {
                    if (promotion.Adjustment_Type__c == 'Discount Amount') {
                        pw.listPrice -= Integer.valueOf(promotion.Adjustment_Amount__c);
                    }
                }
            }
        }
        return (List<Object>) lstProductData;
    }
    
    public List<Promotions__c> getRecordsFromPromoDetails (String productData) {
        List<ProductWrapper> lstProductData = (List<ProductWrapper>) JSON.deserialize(productData, List<ProductWrapper>.class);
        system.debug('lstProductData'+lstProductData);
        Set<String> productIds = new Set<String>();
        for (ProductWrapper pw : lstProductData) {
            productIds.add(pw.productId);
            System.debug('pw'+pw.discountApplied);
        }
        system.debug('productIds'+productIds);
        List<Product2> productlist = [SELECT Id, Name, ProductCode FROM Product2 WHERE Id IN :productIds];

        Set<String> productCodes = new Set<String>();
        for (Product2 prod : productlist) {
            productCodes.add(prod.ProductCode);
        }

        system.debug('productCodes'+productCodes);
        
        List<Promotions__c> promotionsList = [SELECT Id, Name, Adjustment_Type__c, Adjustment_Amount__c, products__c 
                                              FROM Promotions__c];

        system.debug('promotionsList'+promotionsList);                                      
        
        List<Promotions__c> filteredPromotions = new List<Promotions__c>();
        
        for (Promotions__c promotion : promotionsList) {
            if (promotion != null && promotion.products__c != null) {
                System.debug('promotion'+promotion);
                String[] promoProductCodes = promotion.products__c.split(';');
                Boolean matchFound = false;
                
                for (String promoCode : promoProductCodes) {
                    if (productCodes.contains(promoCode.trim())) {
                        matchFound = true;
                        break; 
                    }
                }
                
                if (matchFound) {
                    filteredPromotions.add(promotion);
                }
            }
            else{
                System.debug('No Promotions');
            }
        }
        return filteredPromotions;
    }

    public static List<Object> applyPromotionToProductDetail(String productData, String promotionId) {
      List<ProductWrapper> lstProductData = (List<ProductWrapper>) JSON.deserialize(productData, List<ProductWrapper>.class);
      Promotions__c promotions = [SELECT Id, Name, Adjustment_Type__c, Adjustment_Amount__c, products__c FROM Promotions__c where Id =:promotionId];
      
      for (ProductWrapper pw : lstProductData) {
          if(pw.discountApplied == null){
              pw.discountApplied = false;
          }
          system.debug('pw.discountApplied'+pw.discountApplied);
          If(promotions.Adjustment_Type__c == 'Discount Amount' && pw.netprice >= promotions.Adjustment_Amount__c){
          pw.netPrice -= Integer.valueOf(promotions.Adjustment_Amount__c);
          pw.discountApplied = true;
      
      }
      else if(promotions.Adjustment_Type__c == '% Discount' && !pw.discountApplied){
          System.debug('discount***'+ pw.discountApplied);
          Integer discountPercentage = Integer.valueOf(promotions.Adjustment_Amount__c);
          Decimal Price = Decimal.valueOf(discountPercentage)/100;
          pw.netPrice = (pw.netPrice) * (1-Price);
          pw.discountApplied = true;

      }
      }
      system.debug('lstProductData'+lstProductData);
      return  (List<Object>) lstProductData;
    }
    
    
    
    /*    public List<Object> getHeaderData(Id recId, String typename){
Order_Request_Setting__mdt ors = CustomMetadataService.contractSetting(typename+'_Header');
List<String> headerFields = new List<String>();
if(ors.Plugin__c != null){
headerFields = ors.Plugin__c.split(',');
}

String query = 'Select Id ';

for(String fieldApi : headerFields){
query = query + ' , ' + fieldApi;
}
query = query + ' from Sample_Product__c where Id =: recId';
System.debug(query);
List<Sample_Product__c> lstSampleProduct = Database.query(query);

set<Id> accountIds = new set<Id>();
for(Sample_Product__c sp : lstSampleProduct){
if(sp.Account__c != null){
accountIds.add(sp.Account__c);
}
}
map<Id,Account> mapAccounts = new map<Id,Account>([select id,Name from Account where Id IN : accountIds]);

map<String,Schema.DescribeFieldResult> mapFieldLabel = new map<String,Schema.DescribeFieldResult>();

Map<String,Schema.SObjectField> mfields = Schema.Sample_Product__c.SObjectType.getDescribe().fields.getMap();
for(String fieldApi : headerFields){
Schema.DescribeFieldResult fieldResult = mfields.get(fieldApi).getDescribe();
mapFieldLabel.put(fieldApi,fieldResult);
}

List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
for(Sample_Product__c sp : lstSampleProduct){
for(String f : headerFields){
EntryFormWrapper efw = new EntryFormWrapper();
efw.fieldName = f;
efw.value = sp.get(f) != null ? ''+sp.get(f) : null;
efw.label = mapFieldLabel.get(f).getLabel();
efw.isReference = false;
if(String.valueOf(mapFieldLabel.get(f).getType()) == 'REFERENCE' && f == 'Account__c'){
efw.isReference = true;
efw.objName = 'Account';
efw.fieldLookupName = 'Name';
efw.value = sp.get(f) != null && mapAccounts != null && mapAccounts.get(''+sp.get(f)) != null ? mapAccounts.get(''+sp.get(f)).Name : '';
}
if(String.valueOf(mapFieldLabel.get(f).getType()) == 'DATE' && efw.value != null){
List<String> lstDate = efw.value.split(' ');
efw.value = lstDate[0] != 'null' ? lstDate[0] : '';
}
lstEntryFormWrapper.add(efw);
}
}
return lstEntryFormWrapper;
}

*/
    
    public List<Object> getHeaderData(Id recId, String typename, Id orderId){
        /*EntryFormWrapper[] lstEntryFormWrap = (List<EntryFormWrapper>)JSON.deserialize(fieldsData, List<EntryFormWrapper>.class);
String selectedPriceList = '';
Id selectedAgrId;
for(EntryFormWrapper obj : lstEntryFormWrap){
if(obj.fieldName == 'Apttus_Config2__PriceListId__c'){
selectedPriceList = obj.value;
}
if(obj.fieldName == 'Apttus_CMConfig__AgreementId__c'){
selectedAgrId = obj.value;
}
}*/
        List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
        Order_Request_Setting__mdt ors = [Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName =: typename+'_Header'  WITH SECURITY_ENFORCED limit 1];
        List<String> headerFields = new List<String>();
        if(ors.Plugin__c != null){
            headerFields = ors.Plugin__c.split(',');
        }
        
        
        if(orderId != Null){
            // List<EntryFormWrapper> lstEntryWrapper = new List<EntryFormWrapper>();
            Order ordedata = [SELECT ID,Account__c,Account__r.Name,Account__r.BillingCountry FROM ORDER where Id =:orderId];
            
            JSON_Data__c jsonData = new JSON_Data__c();
            for(JSON_Data__c jd : [SELECT Id,Data_Object_Id__c,Order_Header_Data__c,Order_Line_Items_Data__c FROM JSON_Data__c WHERE Data_Object_Id__c = :orderId]){
                jsonData = jd;
            }
            List<EntryFormWrapper> lstJSONEntryFormWrapper = new List<EntryFormWrapper>();
            if(jsonData.Order_Header_Data__c != null){
                lstJSONEntryFormWrapper = (List<EntryFormWrapper>)JSON.deserialize(jsonData.Order_Header_Data__c, List<EntryFormWrapper>.class);
            }
            
            map<String,EntryFormWrapper> mapEntryFormWrapper = new map<String,EntryFormWrapper>();
            for(EntryFormWrapper efw : lstJSONEntryFormWrapper){
                mapEntryFormWrapper.put(efw.fieldName , efw);
            }
            String accvalue = mapEntryFormWrapper.get('Account__c').value;
            Account acc = new Account();
            for(Account a : [select id,Name,BillingCountry from Account where Id =: accvalue]){
                acc = a;
            }
            Pricebook2 pl = new Pricebook2();
            for(Pricebook2 p : [select id,Name from Pricebook2 where Country__c =: acc.BillingCountry]){
                pl = p;
            }
            
            for(String f : headerFields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = mapEntryFormWrapper.get(f).fieldName;
                efw.value = mapEntryFormWrapper.get(f).value;
                efw.label = mapEntryFormWrapper.get(f).label;
                efw.isReference = false;
                if(mapEntryFormWrapper.get(f).fieldName == 'Aggreement__c'){
                    efw.isReference = true;
                    efw.objName = 'Aggreement__c';
                    efw.fieldLookupName = 'Name';
                    /*  String aggrmnt = mapEntryFormWrapper.get(f).value;
Aggrement__c  agrrec =[Select id,Name from Aggrement__c where Id =:aggrmnt];
efw.value =agrrec.Name; */
                    efw.value =mapEntryFormWrapper.get(f).displayValue;
                }
                if( mapEntryFormWrapper.get(f).fieldName == 'Price_List__c'){
                    efw.isReference = true;
                    efw.objName = 'Price_List__c';
                    efw.fieldLookupName = 'Name';
                    efw.value =pl.Name;
                    // efw.value  =mapEntryFormWrapper.get(f).displayValue;
                }
                if( mapEntryFormWrapper.get(f).fieldName == 'Account__c'){
                    efw.objName = 'Account';
                    efw.fieldLookupName = 'Name';
                    efw.value =acc.Name;
                    // efw.value =mapEntryFormWrapper.get(f).displayValue;
                }
                if(mapEntryFormWrapper.get(f).fieldName == 'Order_Type__c'){
                    efw.value = typename == 'DirectOrder' ? 'Direct' : 'Transfer';
                }
                lstEntryFormWrapper.add(efw);
            }
        }else{
            
            Account acc = new Account();
            for(Account a : [select id,Name,BillingCountry from Account where Id =: recId]){
                acc = a;
            }
            
            Pricebook2 pl = new Pricebook2();
            for(Pricebook2 p : [select id,Name from Pricebook2 where Country__c =: acc.BillingCountry]){
                pl = p;
            }
            
            map<Id,Aggrement__c> mapAgreement = new map<Id,Aggrement__c>([Select id,Name,Account__r.Name from   Aggrement__c where Account__c =: recId]);
            
            List<Aggrement__c> lstAgreement = mapAgreement.values();
            
            map<String,Schema.DescribeFieldResult> mapFieldLabel = new map<String,Schema.DescribeFieldResult>();
            
            Map<String,Schema.SObjectField> mfields = Schema.Sample_Product__c.SObjectType.getDescribe().fields.getMap();
            for(String fieldApi : headerFields){
                Schema.DescribeFieldResult fieldResult = mfields.get(fieldApi).getDescribe();
                mapFieldLabel.put(fieldApi,fieldResult);
            }
            for(String f : headerFields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = f;
                efw.value = '';
                efw.label = mapFieldLabel.get(f).getLabel();
                efw.isReference = false;
                if(String.valueOf(mapFieldLabel.get(f).getType()) == 'REFERENCE' && f == 'Aggreement__c'){
                    efw.isReference = true;
                    efw.objName = 'Aggreement__c';
                    efw.fieldLookupName = 'Name';
                    String agreementId = lstAgreement != null && !lstAgreement.isEmpty() ? lstAgreement[0].Id : '';
                    efw.value = mapAgreement.get(agreementId) != null ? mapAgreement.get(agreementId).Name : '';
                }
                if(String.valueOf(mapFieldLabel.get(f).getType()) == 'REFERENCE' && f == 'Price_List__c'){
                    efw.isReference = true;
                    efw.objName = 'Price_List__c';
                    efw.fieldLookupName = 'Name';
                    efw.value = pl.Name;
                }
                if(String.valueOf(mapFieldLabel.get(f).getType()) == 'REFERENCE' && f == 'Account__c'){
                    efw.objName = 'Account';
                    efw.fieldLookupName = 'Name';
                    efw.value = acc.Name;
                }
                if(f == 'Order_Type__c'){
                    efw.value = typename == 'DirectOrder' ? 'Direct' : 'Transfer';
                }
                /*if(f == 'SCT_Sub_type__c'){
efw.value = typename == 'DirectOrder' ? 'Standard' : 'Mixed';
}*/
                lstEntryFormWrapper.add(efw);
            }
        }
        return lstEntryFormWrapper;
    }
    
    public List<Object> getRecordValues(Id recId, String fieldSetName, Id orderId){
        List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
        if(orderId != Null){
            Schema.SObjectType objectType = null;
            List<FormField> fields = new List<FormField>();
            //String query = 'Select Id,Name ';
            objectType = Schema.getGlobalDescribe().get('Sample_Product__c');
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
            fieldSetName = 'US_'+fieldSetName;
            Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
            List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
            //List<String> disableFields = new List<String>{'Account__c','Order_Type__c'};
            Order_Request_Setting__mdt ors = [Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName =: 'Disable_Entry_Fields'  WITH SECURITY_ENFORCED limit 1];
            List<String> disableFields = new List<String>();
            if(ors.Plugin__c != null){
                disableFields = ors.Plugin__c.split(',');
            }
            
            Order_Request_Setting__mdt orsReq = [Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName =: 'Required_Entry_Fields'  WITH SECURITY_ENFORCED limit 1];
            List<String> reqFields = new List<String>();
            if(orsReq.Plugin__c != null){
                reqFields = orsReq.Plugin__c.split(',');
            }
            
            for (Schema.FieldSetMember fsm : fieldSetMembers) {
                FormField f = new FormField(fsm);
                fields.add(f);
            }
            
            JSON_Data__c jsonData = new JSON_Data__c();
            for(JSON_Data__c jd : [SELECT Id,Data_Object_Id__c,Order_Header_Data__c,Order_Line_Items_Data__c FROM JSON_Data__c WHERE Data_Object_Id__c = :orderId]){
                jsonData = jd;
            }
            List<EntryFormWrapper> lstJSONEntryFormWrapper = new List<EntryFormWrapper>();
            if(jsonData.Order_Header_Data__c != null){
                lstJSONEntryFormWrapper = (List<EntryFormWrapper>)JSON.deserialize(jsonData.Order_Header_Data__c, List<EntryFormWrapper>.class);
            }
            
            map<String,EntryFormWrapper> mapEntryFormWrapper = new map<String,EntryFormWrapper>();
            for(EntryFormWrapper efw : lstJSONEntryFormWrapper){
                mapEntryFormWrapper.put(efw.fieldName , efw);
            }
            
            for(FormField f : fields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = mapEntryFormWrapper.get(f.APIName).fieldName;
                efw.value = mapEntryFormWrapper.get(f.APIName).value;
                efw.label = mapEntryFormWrapper.get(f.APIName).label;
                efw.displayValue = mapEntryFormWrapper.get(f.APIName).displayValue;
                efw.isDisabled = mapEntryFormWrapper.get(f.APIName).isDisabled;
                efw.isRequired =mapEntryFormWrapper.get(f.APIName).isRequired;
                efw.isType = mapEntryFormWrapper.get(f.APIName).isType;
                efw.isDate = mapEntryFormWrapper.get(f.APIName).isDate;
                efw.isLocation = mapEntryFormWrapper.get(f.APIName).isLocation;
                efw.isAgreement = mapEntryFormWrapper.get(f.APIName).isAgreement;
                efw.isPriceList = mapEntryFormWrapper.get(f.APIName).isPriceList;
                efw.relatedObject = 'Sample_Product__c';
                efw.relatedObjectId = '';
                if( mapEntryFormWrapper.get(f.APIName).fieldName == 'Order_Type__c'){
                    efw.value = fieldSetName == 'DirectOrder' ? 'Direct' : 'Transfer';
                }
                /*if(f.APIName == 'SCT_Sub_type__c'){
efw.value = fieldSetName == 'DirectOrder' ? 'Standard' : 'Mixed';
}*/
                
                lstEntryFormWrapper.add(efw);
            }
        }else{
            Account acc = new Account();
            for(Account a : [select id,Name,BillingCountry from Account where Id =: recId]){
                acc = a;
            }
            
            /*Apttus_Config2__PriceList__c pl = new Apttus_Config2__PriceList__c();
for(Apttus_Config2__PriceList__c p : [select id,Name from Apttus_Config2__PriceList__c where SCT_Country__c =: acc.BillingCountry]){
pl = p;
}*/
            
            map<Id,Aggrement__c> mapAgreement = new map<Id,Aggrement__c>([Select id,Name,Account__c from Aggrement__c where Account__c =: recId]);
            
            List<Aggrement__c> lstAgreement = mapAgreement.values();
            
            Schema.SObjectType objectType = null;
            List<FormField> fields = new List<FormField>();
            //String query = 'Select Id,Name ';
            objectType = Schema.getGlobalDescribe().get('Sample_Product__c');
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
            system.debug('jj fieldsetmap is :'+fieldSetMap);
            system.debug('jj fieldSetName is :'+fieldSetName);
            fieldSetName = 'US_'+fieldSetName;
            Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
            List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
            //List<String> disableFields = new List<String>{'Account__c','Order_Type__c'};
            Order_Request_Setting__mdt ors = [Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName =: 'Disable_Entry_Fields'  WITH SECURITY_ENFORCED limit 1];
            List<String> disableFields = new List<String>();
            if(ors.Plugin__c != null){
                disableFields = ors.Plugin__c.split(',');
            }
            
            Order_Request_Setting__mdt orsReq = [Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName =: 'Required_Entry_Fields'  WITH SECURITY_ENFORCED limit 1];
            List<String> reqFields = new List<String>();
            if(orsReq.Plugin__c != null){
                reqFields = orsReq.Plugin__c.split(',');
            }
            
            for (Schema.FieldSetMember fsm : fieldSetMembers) {
                /*if(fsm.fieldPath != 'Name'){
query = query + ' , ' + fsm.fieldPath;
}*/
                FormField f = new FormField(fsm);
                fields.add(f);
            }
            /*recId = 'a461w000000Lgb3AAC';
query = query + ' from Apttus_Config2__Order__c where Id =: recId';
System.debug(query);
List<Apttus_Config2__Order__c> lstOrders = Database.query(query);
set<Id> accountIds = new set<Id>();
for(Apttus_Config2__Order__c sp : lstOrders){
if(sp.SCT_Wholesaler__c != null){
accountIds.add(sp.SCT_Wholesaler__c);
}
}
map<Id,Account> mapAccounts = new map<Id,Account>([select id,Name from Account where Id IN : accountIds]);*/
            
            //for(Apttus_Config2__Order__c sp : lstOrders){
            for(FormField f : fields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = f.APIName;
                efw.value = '';//sp.get(f.APIName) != null ? ''+sp.get(f.APIName) : null;
                efw.label = f.Label;
                efw.displayValue = '';//+sp.get(f.APIName);
                efw.isDisabled = disableFields.contains(f.APIName) ? true : false;
                efw.isRequired = reqFields.contains(f.APIName) ? true : false;
                efw.isType = f.APIName == 'Order_Type__c' ? true : false;
                efw.isDate = f.APIName == 'Delivery_Type__c' ? true : false;
                efw.isLocation = f.APIName == 'Location__c' ? true : false;
                efw.isAgreement = f.APIName == 'Aggreement__c' ? true : false;
                //efw.isPriceList = f.APIName == 'Price_List__c' ? true : false;
                 efw.isPriceList = f.APIName == 'Price_List_Name__c' ? true : false;
                efw.relatedObject = 'Sample_Product__c';
                efw.relatedObjectId = '';
                if(f.APIName == 'Order_Type__c'){
                    efw.value = fieldSetName == 'DirectOrder' ? 'Direct' : 'Transfer';
                }
                /*if(f.APIName == 'SCT_Sub_type__c'){
efw.value = fieldSetName == 'DirectOrder' ? 'Standard' : 'Mixed';
}*/
                if(f.Type == 'REFERENCE' && f.APIName == 'Aggreement__c'){
                    efw.value = lstAgreement != null && !lstAgreement.isEmpty() ? lstAgreement[0].Id : null;
                    efw.displayValue = mapAgreement.get(efw.value) != null ? mapAgreement.get(efw.value).Name : '';//sp.get(f.APIName) != null && mapAccounts != null && mapAccounts.get(''+sp.get(f.APIName)) != null ? mapAccounts.get(''+sp.get(f.APIName)).Name : '';
                }
                if(f.Type == 'REFERENCE' && f.APIName == 'Account__c'){
                    efw.value = recId;
                }
                /*if(f.Type == 'REFERENCE' && f.APIName == 'Price_List__c'){
                    efw.value = 'a0Fao0000019VvFEAU';
                }*/
                 if(f.Type == 'REFERENCE' && f.APIName == 'Price_List_Name__c'){
                   // efw.value = 'a0Fao0000019VvFEAU';
                   efw.value = 'a0Fao000005KV1ZEAW';
                }
                if(f.Type == 'DATE' && efw.value != null){
                    List<String> lstDate = efw.value.split(' ');
                    efw.displayValue = lstDate[0] != 'null' ? lstDate[0] : '';
                }
                lstEntryFormWrapper.add(efw);
            }
        }
        
        //}
        return lstEntryFormWrapper;
        /*Schema.SObjectType objectType = null;
fieldSetName = 'US_'+fieldSetName;
List<FormField> fields = new List<FormField>();
String query = 'Select Id,Name,Account__r.Name ';
objectType = Schema.getGlobalDescribe().get('Sample_Product__c');
Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
//List<String> disableFields = new List<String>{'Account__c','Order_Type__c'};
Order_Request_Setting__mdt ors = CustomMetadataService.contractSetting('Disable_Entry_Fields');
List<String> disableFields = new List<String>();
if(ors.Plugin__c != null){
disableFields = ors.Plugin__c.split(',');
}

Order_Request_Setting__mdt orsReq = CustomMetadataService.contractSetting('Required_Entry_Fields');
List<String> reqFields = new List<String>();
if(orsReq.Plugin__c != null){
reqFields = orsReq.Plugin__c.split(',');
}

for (Schema.FieldSetMember fsm : fieldSetMembers) {
if(fsm.fieldPath != 'Name'){
query = query + ' , ' + fsm.fieldPath;
}
FormField f = new FormField(fsm);
fields.add(f);
}
query = query + ' from Sample_Product__c where Id =: recId';
System.debug(query);
List<Sample_Product__c> lstSampleProduct = Database.query(query);
set<Id> accountIds = new set<Id>();
for(Sample_Product__c sp : lstSampleProduct){
if(sp.Account__c != null){
accountIds.add(sp.Account__c);
}
}
map<Id,Account> mapAccounts = new map<Id,Account>([select id,Name from Account where Id IN : accountIds]);
List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
for(Sample_Product__c sp : lstSampleProduct){
for(FormField f : fields){
EntryFormWrapper efw = new EntryFormWrapper();
efw.fieldName = f.APIName;
efw.value = sp.get(f.APIName) != null ? ''+sp.get(f.APIName) : null;
efw.label = f.Label;
efw.displayValue = ''+sp.get(f.APIName);
efw.isDisabled = disableFields.contains(f.APIName) ? true : false;
efw.isRequired = reqFields.contains(f.APIName) ? true : false;
efw.isAgreement = f.APIName == 'Aggreement__c' ? true : false;
efw.isPriceList = f.APIName == 'Price_List__c' ? true : false;
efw.isDate = f.APIName == 'Delivery_Date__c' ? true : false;
efw.isLocation = f.APIName == 'Primary_Contact_Person__c' ? true : false;
efw.relatedObject = 'Sample_Product__c';
efw.relatedObjectId = '';
if(f.Type == 'REFERENCE' && f.APIName == 'Account__c'){
efw.displayValue = sp.get(f.APIName) != null && mapAccounts != null && mapAccounts.get(''+sp.get(f.APIName)) != null ? mapAccounts.get(''+sp.get(f.APIName)).Name : '';
}
if(f.Type == 'DATE' && efw.value != null){
List<String> lstDate = efw.value.split(' ');
efw.displayValue = lstDate[0] != 'null' ? lstDate[0] : '';
}
lstEntryFormWrapper.add(efw);
}
}
return lstEntryFormWrapper;*/
    }
    
    public List<Object> getRecordValuesCheckOutScreen(Id recId, String fieldSetName,Id orderId){
        
        List<Object> fieldDetailsList = new List<Object>();
        List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
        
        if(orderId != null){
            Schema.SObjectType objectType = null;
            List<FormField> fields = new List<FormField>();
            objectType = Schema.getGlobalDescribe().get('Sample_Product__c');
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
            fieldSetName = fieldSetName+'_CheckoutScreen';
            Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
            List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
            for (Schema.FieldSetMember fsm : fieldSetMembers) {
                FormField f = new FormField(fsm);
                fields.add(f);
            }
            
            List<EntryFormWrapper> lstJSONEntryFormWrapper = new List<EntryFormWrapper>();
            JSON_Data__c jsonData = new JSON_Data__c();
            for(JSON_Data__c jd : [SELECT Id,Data_Object_Id__c,Order_Header_Data__c,Order_Line_Items_Data__c FROM JSON_Data__c WHERE Data_Object_Id__c = :orderId]){
                jsonData = jd;
            }
            if(jsonData.Order_Header_Data__c != null){
                lstJSONEntryFormWrapper = (List<EntryFormWrapper>)JSON.deserialize(jsonData.Order_Header_Data__c, List<EntryFormWrapper>.class);
            }
            map<String,EntryFormWrapper> mapEntryFormWrapper = new map<String,EntryFormWrapper>();
            for(EntryFormWrapper efw : lstJSONEntryFormWrapper){
                mapEntryFormWrapper.put(efw.fieldName , efw);
            }
            system.debug('mapEntryFormWrapper from if checkout'+mapEntryFormWrapper);
            system.debug('fields from if checkout'+fields);
            for(FormField f : fields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = mapEntryFormWrapper.get(f.APIName).fieldName;
                efw.value = mapEntryFormWrapper.get(f.APIName).value;
                efw.label = mapEntryFormWrapper.get(f.APIName).label;
                efw.displayValue = mapEntryFormWrapper.get(f.APIName).displayValue;
                efw.isDisabled = mapEntryFormWrapper.get(f.APIName).isDisabled;
                efw.isRequired =mapEntryFormWrapper.get(f.APIName).isRequired;
                efw.isType = mapEntryFormWrapper.get(f.APIName).isType;
                efw.relatedObject = 'Sample_Product__c';
                efw.relatedObjectId = '';
                lstEntryFormWrapper.add(efw);
            }
            
        }else{
            fieldSetName = fieldSetName+'_CheckoutScreen';        
            List<FormField> fields = new List<FormField>();
            Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe(); 
            Schema.SObjectType sObjectType = globalDescribe.get('Sample_Product__c');
            Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
            Schema.FieldSet fs = sObjectDescribe.fieldSets.getMap().get(fieldSetName);
            List<Schema.FieldSetMember> fieldSetMembers = fs.getFields();
            for (Schema.FieldSetMember fsm : fieldSetMembers) {
                FormField f = new FormField(fsm);
                fields.add(f);
            }
            /* fieldSetName = fieldSetName+'_CheckoutScreen';        
Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe(); 
Schema.SObjectType sObjectType = globalDescribe.get('Sample_Product__c');
Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
Schema.FieldSet fs = sObjectDescribe.fieldSets.getMap().get(fieldSetName);

if (fs != null) {
for(Schema.FieldSetMember fsm : fs.getFields()) {
Map<String, Object> fieldDetail = new Map<String, Object>();
fieldDetail.put('fieldName', fsm.getFieldPath());
fieldDetail.put('label', fsm.getLabel());                
Schema.DescribeFieldResult fieldDescribe = sObjectDescribe.fields.getMap().get(fsm.getFieldPath()).getDescribe();
fieldDetail.put('type', String.valueOf(fieldDescribe.getType()));                
fieldDetailsList.add(fieldDetail);
}
}   */
            system.debug('fields from else checkout'+fields);
            for(FormField f : fields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = f.APIName;
                efw.value = '';
                efw.label = f.Label;
                lstEntryFormWrapper.add(efw);
            }     
        }
        
        return lstEntryFormWrapper; 
        /*Schema.SObjectType objectType = null;
fieldSetName = fieldSetName+'_CheckoutScreen';
List<FormField> fields = new List<FormField>();
String query = 'Select Id,Name,Account__r.Name ';
objectType = Schema.getGlobalDescribe().get('Sample_Product__c');
Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
for (Schema.FieldSetMember fsm : fieldSetMembers) {
if(fsm.fieldPath != 'Name'){
query = query + ' , ' + fsm.fieldPath;
}
FormField f = new FormField(fsm);
fields.add(f);
}
query = query + ' from Sample_Product__c where Id =: recId';
System.debug(query);
List<Sample_Product__c> lstSampleProduct = Database.query(query);
set<Id> accountIds = new set<Id>();
for(Sample_Product__c sp : lstSampleProduct){
if(sp.Account__c != null){
accountIds.add(sp.Account__c);
}
}
map<Id,Account> mapAccounts = new map<Id,Account>([select id,Name from Account where Id IN : accountIds]);
List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
for(Sample_Product__c sp : lstSampleProduct){
for(FormField f : fields){
EntryFormWrapper efw = new EntryFormWrapper();
efw.fieldName = f.APIName;
efw.value = sp.get(f.APIName) != null ? ''+sp.get(f.APIName) : null;
efw.label = f.Label;
efw.displayValue = ''+sp.get(f.APIName);
efw.relatedObject = 'Sample_Product__c';
efw.relatedObjectId = '';
lstEntryFormWrapper.add(efw);
}
}
return lstEntryFormWrapper;*/
    }
    
    
    public List<Object> getPricingAggrementData(String productId, String fieldsData){
        //System.debug(scopeObjectLst);
        List<AggrementPricingWrapper> lstAggrementPricingWrapper = new List<AggrementPricingWrapper>();
        for(Aggrement_Info__c agrInfo : [SELECT Id,Aggreement__c,Aggreement__r.Name,Aggreement__r.Agreement_Code__c,Quantity__c,Price__c,Product__r.name,Product__c,Product__r.ProductCode,Discount__c,Range__c FROM Aggrement_Info__c where Product__c =:productId order by Range__c]){
            AggrementPricingWrapper apw = new AggrementPricingWrapper();
            apw.discount = agrInfo.Discount__c;
            apw.price = agrInfo.Price__c;
            apw.productID = agrInfo.Product__c;
            apw.productName = agrInfo.Product__r.name;
            apw.nationalId = agrInfo.Product__r.ProductCode;
            apw.quantity = 16;//agrInfo.Quantity__c;
            apw.aggrementId = agrInfo.Aggreement__c;
            apw.aggrementName = agrInfo.Aggreement__r.Name;
            apw.aggrementCode = agrInfo.Aggreement__r.Agreement_Code__c;
            apw.range = agrInfo.Range__c;
            lstAggrementPricingWrapper.add(apw);
        }
        return lstAggrementPricingWrapper;
    }
    
    public String onBackToCart(String recId ){
        return 'https://quickorderdev-dev-ed.develop.lightning.force.com/lightning/setup/ManageUsers/home';
    }
    
    public Integer getCartRecordCount(String recId){
        return 8;
    }
    
    public void deleteCartConfiguration(String recId){
        
    }
    public List<Object> bestcontractpricing(String fields,String productdata){
        
        List<EntryFormWrapper> lstEntryFormWrap = (List<EntryFormWrapper>)JSON.deserialize(fields, List<EntryFormWrapper>.class);
        List<ProductWrapper> lstProductData = (List<ProductWrapper>)JSON.deserialize(productdata, List<ProductWrapper>.class);
        String account = '';
        System.debug(fields+'fields');
        System.debug(productdata+'productdata');
        System.debug(lstProductData+'lstProductData');
        Id pricelist;
        for(EntryFormWrapper obj : lstEntryFormWrap){
            if(obj.fieldName == 'Account__c'){
                account = obj.value;
            }
            if(obj.fieldName == 'Price_List__c'){
                pricelist=obj.value;
            }
        }
        System.debug(account+'account');
        System.debug(pricelist+'pricelist');
        set<Id> productIds = new set<Id>();
        set<Id> agreementtIds = new set<Id>();
        
        map<Id,list<Agreement_Line_Item__c>> mapProduct = new map<Id,list<Agreement_Line_Item__c>>();
        for(ProductWrapper pw : lstProductData){
            productIds.add(pw.productId);
        }
        list<Aggrement__c>agreements=[select id,Account__c,Price_List__c from  Aggrement__c where Account__c=:account];
        System.debug(agreements+'agreements');
        for(Aggrement__c a:agreements){
            agreementtIds.add(a.id);
        }
        list<Agreement_Line_Item__c>ali=[select id,Aggreement__c,Agreement_Product__c,Adjustmentamount__c,Contract_Net_Price__c  from  Agreement_Line_Item__c where  Aggreement__c IN: agreementtIds and Agreement_Product__c IN:productIds];
        System.debug(ali+'ali');
        for(Agreement_Line_Item__c a:ali){
            for(ProductWrapper p:lstProductData){
                // System.debug(a.Agreement_Product__c==p.productId+' pa.Agreement_Product__c==p.productIddiscount');
                System.debug(p.discount>a.Adjustmentamount__c);
                System.debug(p.discount+'p.discount');
                System.debug(a.Adjustmentamount__c+'a');
                
                if(a.Agreement_Product__c==p.productId &&a.Adjustmentamount__c>p.discount){
                    p.discount=a.Adjustmentamount__c;
                    System.debug( p.discount+' p.discount');
                }
            }
            
        }
        System.debug(lstProductData+'lstProductData');
        return lstProductData;
    }
    
    
    public List<Object> getReOrderData(String recId){
        List<OrderWrapper> lstOrderWrapper = new List<OrderWrapper>();
        for(Sample_Product__c sp : [select Id,Name,(select id,Sample_Product__c,Product__r.Name,Product_Code__c,Price__c,Quantity__c,Discount__c from Order_Line_Items__r) from Sample_Product__c]){
            OrderWrapper ow = new OrderWrapper();
            ow.Id = sp.Id;
            ow.Name = sp.Name;
            List<OrderLineItem> lstOrderLineItem = new List<OrderLineItem>();
            for(Order_Line_Item__c oli : sp.Order_Line_Items__r){
                OrderLineItem oliWrap = new OrderLineItem();
                oliWrap.Id = oli.Id;
                oliWrap.parentId = oli.Sample_Product__c;
                oliWrap.productName = oli.Product__r.Name;
                oliWrap.productCode = oli.Product_Code__c;
                oliWrap.price = oli.Price__c;
                oliWrap.quantity = oli.Quantity__c;
                oliWrap.discount = oli.Discount__c;
                lstOrderLineItem.add(oliWrap);
            }
            ow.lstOrderLineItem = lstOrderLineItem;
            lstOrderWrapper.add(ow);
        }
        return lstOrderWrapper;
    }
    
    public List<Object> getRangePricing(String fields, String saveDraftValues, String productData){
        /*List<EntryFormWrapper> lstEntryFormWrapper = (List<EntryFormWrapper>)JSON.deserialize(fields, List<EntryFormWrapper>.class);
List<ProductWrapper> lstProductData = (List<ProductWrapper>)JSON.deserialize(productData, List<ProductWrapper>.class);
List<ProductWrapper> lstsaveDraftValues = (List<ProductWrapper>)JSON.deserialize(saveDraftValues, List<ProductWrapper>.class);

Id selectedAgrId;
for(EntryFormWrapper obj : lstEntryFormWrap){
if(obj.fieldName == 'Aggreement__c'){
selectedAgrId= obj.value;
}
}

set<Id> productIds = new set<Id>();



List<Aggrement_Info__c> lstAggrementInfo = [SELECT Id,Aggreement__c,Aggreement__r.Name,Aggreement__r.Agreement_Code__c,Quantity__c,Price__c,Product__r.name,Product__c,Product__r.ProductCode,Discount__c,Range__c FROM Aggrement_Info__c where Aggreement__c =:selectedAgrId order by Range__c];*/
        
        
        
        return new List<Object>();
    }
    
    public List<Object> getPricingData(String recId, String fieldsData,String cerApi,String priceListApi){
        system.debug('jj recid is :'+recId);
        system.debug('jj cerApi obj is :'+cerApi);
        system.debug('jj priceListApi obj is :'+priceListApi);
        List<String> filterproducts = getFilterProducts(recId);
        Id agreementId;
        Id pricelistId;
        List<PricingWrapper> lstPricingWrapper = new List<PricingWrapper>();
        Set<String> uniqueProductNames = new Set<String>();
		List<Price_List_Item__c> uniquePricelist = new List<Price_List_Item__c>();
		List<Agreement_Line_Item__c> uniqueALI = new List<Agreement_Line_Item__c>();
       
        if(fieldsData != Null || fieldsData != ''){
            EntryFormWrapper[] lstEntryFormWrap = (List<EntryFormWrapper>)JSON.deserialize(fieldsData, List<EntryFormWrapper>.class);
            for(EntryFormWrapper obj : lstEntryFormWrap){
                if(obj.fieldName == 'Aggreement__c'){
                    agreementId = obj.value;
                    system.debug('agreementId ::'+agreementId);
                }
                if(obj.fieldName == 'Price_List_Name__c'){
                    pricelistId = obj.value;
                    system.debug('Price_List_Name__c ::'+pricelistId);
                }
                
            }
        }
        Integer i = 1;
        if(agreementId != null || priceListId != null){
            if(!filterproducts.isEmpty()){ 
                List<Agreement_Line_Item__c> agreeLineList =[SELECT Id,Aggreement__c,Product__c, Product__r.Name,Product_Code__c, Product_Family__c,List_Price__c,Contract_Net_Price__c,Aggreement__r.Price_List__r.Name 
                                                             from Agreement_Line_Item__c where Aggreement__c =:agreementId and Product__r.Name NOT IN :filterProducts ];
                 for (Agreement_Line_Item__c item : agreeLineList) {
                    // Check uniqueness based on a field, e.g., Product_Name__r.Name
                    if (!uniqueProductNames.contains(item.Product__r.Name)) {
                        uniqueProductNames.add(item.Product__r.Name);
                        uniqueALI.add(item);
                    }
                }
                for(Agreement_Line_Item__c agr :uniqueALI){
                    Price_List__c pricelst = agr.Aggreement__r.Price_List__r;
                    Product2 prod = agr.Product__r;
                    PricingWrapper c = new PricingWrapper();
                    c.Id = agr.Product__c;
                    c.productName =prod.Name ;
                    c.nationalId = ''+(Integer.valueof((Math.random() * 100000)));
                    c.contractNumber = ''+(Integer.valueof((Math.random() * 100000)));
                    c.priceListName = pricelst.Name;
                    c.price =agr.Contract_Net_Price__c;
                    lstPricingWrapper.add(c);
                }
                system.debug('If Agrrelineitem ist ::: '+lstPricingWrapper);   
                
                List<Price_List_Item__c>  pricelistitem=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c,Price_List__r.Name
                                                         from Price_List_Item__c
                                                         where  Price_List__c =:priceListId and Product_Name__r.Name NOT IN :filterProducts];
                for (Price_List_Item__c item : pricelistitem) {
                    // Check uniqueness based on a field, e.g., Product_Name__r.Name
                    if (!uniqueProductNames.contains(item.Product_Name__r.Name)) {
                        uniqueProductNames.add(item.Product_Name__r.Name);
                        uniquePricelist.add(item);
                    }
                }
                for(Price_List_Item__c pli :uniquePricelist){
                    PricingWrapper c = new PricingWrapper();
                    c.Id = pli.Product_Name__c;
                    c.productName =pli.Product_Name__r.Name ;
                    c.nationalId = ''+(Integer.valueof((Math.random() * 100000)));
                    c.contractNumber = ''+(Integer.valueof((Math.random() * 100000)));
                    c.priceListName = pli.Price_List__r.Name;
                    c.price =pli.List_Price__c;
                    lstPricingWrapper.add(c);
                }
                
                system.debug('If Agrrelineitem and priclsit ist ::: '+lstPricingWrapper);
            }else{
                List<Agreement_Line_Item__c> agreeLineList =[SELECT Id,Aggreement__c,Product__c, Product__r.Name,Product_Code__c, Product_Family__c,List_Price__c,Contract_Net_Price__c,Aggreement__r.Price_List__r.Name 
                                                             from Agreement_Line_Item__c where Aggreement__c =:agreementId ];
                 for (Agreement_Line_Item__c item : agreeLineList) {
                    // Check uniqueness based on a field, e.g., Product_Name__r.Name
                    if (!uniqueProductNames.contains(item.Product__r.Name)) {
                        uniqueProductNames.add(item.Product__r.Name);
                        uniqueALI.add(item);
                    }
                }
                for(Agreement_Line_Item__c agr :uniqueALI){
                    Price_List__c pricelst = agr.Aggreement__r.Price_List__r;
                    Product2 prod = agr.Product__r;
                    PricingWrapper c = new PricingWrapper();
                    c.Id = agr.Product__c;
                    c.productName =prod.Name ;
                    c.nationalId = ''+(Integer.valueof((Math.random() * 100000)));
                    c.contractNumber = ''+(Integer.valueof((Math.random() * 100000)));
                    c.priceListName = pricelst.Name;
                    c.price =agr.Contract_Net_Price__c;
                    lstPricingWrapper.add(c);
                }
                system.debug('else Agrrelineitem ist ::: '+lstPricingWrapper);   
                
                List<Price_List_Item__c>  pricelistitem=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c,Price_List__r.Name
                                                         from Price_List_Item__c
                                                         where  Price_List__c =:priceListId ];
                 for (Price_List_Item__c item : pricelistitem) {
                    // Check uniqueness based on a field, e.g., Product_Name__r.Name
                    if (!uniqueProductNames.contains(item.Product_Name__r.Name)) {
                        uniqueProductNames.add(item.Product_Name__r.Name);
                        uniquePricelist.add(item);
                    }
                }
                for(Price_List_Item__c pli :uniquePricelist){
                    PricingWrapper c = new PricingWrapper();
                    c.Id = pli.Product_Name__c;
                    c.productName =pli.Product_Name__r.Name ;
                    c.nationalId = ''+(Integer.valueof((Math.random() * 100000)));
                    c.contractNumber = ''+(Integer.valueof((Math.random() * 100000)));
                    c.priceListName = pli.Price_List__r.Name;
                    c.price =pli.List_Price__c;
                    lstPricingWrapper.add(c);
                }
                
                system.debug('else Agrrelineitem and priclsit ist ::: '+lstPricingWrapper);
            }
            
        }            
        return lstPricingWrapper;
    }
        
        public static List<String> getFilterProducts(String recId){
            List<String> objectList = new List<String>();
            String effCountry = [Select Id,Effective_Country__c from Account where Id =: recId].Effective_Country__c;
            system.debug('Effective COuntry ::: '+ effCountry);
            List<Product2> productList;
            if(effCountry == 'AUSTRIA'){
                productList =[Select Id , Name From Product2 Where Name Like '%SLA%'];
                for(Product2 pr :productList){
                    objectList.add(pr.Name);
                }
            }
            system.debug('Effective productList::: '+ productList);
            
            return objectList ;
        }
        
        public List<Object> getContractedData(String recId){
            List<PricingWrapper> lstPricingWrapper = new List<PricingWrapper>();
            Integer counter = 0;
            for (integer i = 0; i < 20; i++)
            {
                PricingWrapper c = new PricingWrapper();
                c.Id = ''+i;
                c.productName = 'CLINDAMYCIN PHOSPHATE PLEDGET 1%';
                c.nationalId = ''+(Integer.valueof((Math.random() * 100000)));
                c.contractNumber = ''+(Integer.valueof((Math.random() * 100000)));
                c.quantity = 1;
                lstPricingWrapper.add(c);
            }
            return lstPricingWrapper;
        }
    
    public List<Object> fileUpload(String recId, String base64Data, String fieldsData){
        String data = JSON.deserializeUntyped(base64Data).toString();
        list<String> lstCSVLines = data.split('\n');
        List<String> productNames = new List<String>();
        for(Integer i = 1; i < lstCSVLines.size(); i++){
            String csvLine = lstCSVLines[i];
            String prevLine = csvLine;
            List<String> csvRowData = new List<String>();
            for(String column : csvLine.split(',')){
                column = column.replaceAll(':quotes:', '').replaceAll(':comma:', ',');
                csvRowData.add(column);
            }
            System.debug(csvRowData);
            if(csvRowData.size() > 1 && csvRowData[0] != null){
                productNames.add(csvRowData[0]);
            }
        }
        
        System.debug('---productNames-->'+productNames);
        map<String,Product2> mapProduct = new map<String,Product2>();
        map<Id,Product2> mapProductIds = new map<Id,Product2>();
        for(Product2 pro : [select id,Name,ProductCode from Product2 where Name IN: productNames]){
            mapProduct.put(pro.Name,pro);
            mapProductIds.put(pro.Id,pro);
        }
        
        List<EntryFormWrapper> lstEntryFormWrap = (List<EntryFormWrapper>)JSON.deserialize(fieldsData, List<EntryFormWrapper>.class);
        
        Integer index = 1000;
        List<ProductWrapper> lstProductWrapper = new List<ProductWrapper>();
        for(Integer i = 1; i < lstCSVLines.size(); i++){
            String csvLine = lstCSVLines[i];
            String prevLine = csvLine;
            List<String> csvRowData = new List<String>();
            for(String column : csvLine.split(',')){
                column = column.replaceAll(':quotes:', '').replaceAll(':comma:', ',');
                csvRowData.add(column);
            }
            ProductWrapper pw = new ProductWrapper();
            pw.isDisabled = true;
            pw.productId = csvRowData.size() > 0 && csvRowData[0] != null ? mapProduct.get(csvRowData[0].replace('\r','')).Id : '';
            pw.nationalId = csvRowData.size() > 1 && csvRowData[1] != null ? csvRowData[1].replace('\r','') : '';
            pw.quantity = csvRowData.size() > 2 && csvRowData[2] != null && csvRowData[2].trim() != '' ? Decimal.valueOf(csvRowData[2].replace('\r','')) : 1;
            pw.recordId = ''+index++;
            pw.price = 0;
            if(pw.productId != null){
                pw.price = 100;
                pw.listPrice = pw.quantity * pw.price;
                pw.discount = 0;
                pw.productName = mapProductIds.get(pw.productId).Name;
                pw.netPrice = (pw.listPrice*(1-(pw.discount/100)) ) ;
            }
            lstProductWrapper.add(pw);
        }
        return lstProductWrapper;
    }
    
    public List<Object> getQuickOrderData(String recId){
        //System.debug('recId'+recId);
        String query = ProductController.getQuery('Order_Query');
        List<sObject> lstsObject = Database.query(query);
        List<ProductWrapper> lstProductWrapper = new List<ProductWrapper>();
        set<String> productIds = new set<String>();
        set<String> opptyIds = new set<String>();
        for(sObject obj : lstsObject){
            if(obj.get('National_Id__c') != null){
                productIds.add(''+obj.get('National_Id__c'));
            }
            if(obj.get('Product_Name__c') != null){
                productIds.add(''+obj.get('Product_Name__c'));
            }
            /*if(obj.get('Opportunity__c') != null){
opptyIds.add(''+obj.get('Opportunity__c'));
}*/
        }
        
        List<Aggrement_Info__c> aggrInfo = [SELECT Id,Aggreement__c,Aggreement__r.name,Aggreement__r.Agreement_Code__c,Quantity__c,Price__c,Product__r.name,Product__c,Product__r.ProductCode,Discount__c FROM Aggrement_Info__c where Product__c IN:productIds];
        map<Id,Product2> mapProduct = new map<Id,Product2>([select Id,Name,ProductCode from Product2 where Id IN: productIds]);
        map<Id,Opportunity> mapOpportunity = new map<Id,Opportunity>([select id,Name from Opportunity where Id IN: opptyIds]);
        
        map<Id,ComboboxWrapper> mapComboboxWrapper = new map<Id,ComboboxWrapper>();
        map<Id,List<OptionsWrapper>> mapOptionsWrapper = new map<Id,List<OptionsWrapper>>();
        for(Aggrement_Info__c ai : aggrInfo){
            if(ai.Product__c != null){
                OptionsWrapper ow = new OptionsWrapper();
                ow.label = ai.Aggreement__r.Name;
                ow.value =  ai.Aggreement__c;
                ow.description = ai.Aggreement__r.Agreement_Code__c;
                if(mapOptionsWrapper.containsKey(ai.Product__c)){
                    mapOptionsWrapper.get(ai.Product__c).add(ow);
                } else {
                    mapOptionsWrapper.put(ai.Product__c, new List<OptionsWrapper>{ow});
                }
            }
        }
        
        map<Id,List<AggrementPricingWrapper>> mapAggrementPricingWrapper = new map<Id,List<AggrementPricingWrapper>>();
        map<String,Decimal> mapAgreementProductPrice = new map<String,Decimal>();
        for(Aggrement_Info__c ai : aggrInfo){
            if(ai.Product__c != null){
                ComboboxWrapper cw = new ComboboxWrapper();
                cw.selectedRecord = ai.Aggreement__c;
                cw.lstcomboboxOptions = mapOptionsWrapper.get(ai.Product__c);
                mapComboboxWrapper.put(ai.Product__c, cw);
                
                AggrementPricingWrapper apw = new AggrementPricingWrapper();
                apw.discount = ai.Discount__c;
                apw.price = ai.Price__c;
                apw.productID = ai.Product__c;
                apw.productName = ai.Product__r.name;
                apw.nationalId = ai.Product__r.ProductCode;
                apw.quantity = ai.Quantity__c;
                apw.aggrementId = ai.Aggreement__c;
                if(ai.Aggreement__c != null){
                    mapAgreementProductPrice.put(ai.Product__c+''+ai.Aggreement__c,ai.Price__c);
                }
                if(mapAggrementPricingWrapper.containsKey(ai.Product__c)){
                    mapAggrementPricingWrapper.get(ai.Product__c).add(apw);
                } else {
                    mapAggrementPricingWrapper.put(ai.Product__c, new List<AggrementPricingWrapper>{apw});
                }
            }
        }
        
        for(sObject obj : lstsObject){
            ProductWrapper pw = new ProductWrapper();
            //pw.recordId = ''+obj.get('Id');
            if(obj.get('National_Id__c') != null){
                pw.nationalId = mapProduct.get(''+obj.get('National_Id__c')).ProductCode;
                
            }
            pw.productId = obj.get('Product_Name__c') != null ? ''+obj.get('Product_Name__c') : null;
            pw.quantity = (Decimal)obj.get('Quantity__c');
            pw.discount = (Decimal)obj.get('Percent__c');
            //pw.opportunityId = obj.get('Opportunity__c') != null ? ''+obj.get('Opportunity__c') : null;
            /*if(obj.get('Opportunity__c') != null){
pw.opportunityName = mapOpportunity.get(''+obj.get('Opportunity__c')).Name;
}*/
            if(obj.get('National_Id__c') != null){
                pw.nationalName = mapProduct.get(''+obj.get('National_Id__c')).Name;
            }
            if(obj.get('Product_Name__c') != null){
                pw.productName = mapProduct.get(''+obj.get('Product_Name__c')).Name;
            }
            pw.lstAggrementPricing = new List<AggrementPricingWrapper>();
            pw.netPrice = 0;
            if(pw.productId != null){
                pw.options = mapOptionsWrapper.get(pw.productId);
                pw.selectedValue = pw.options != null && pw.options.size() > 0 ? pw.options[0].value : '';
                pw.aggrementName = pw.options != null && pw.options.size() > 0 ? pw.options[0].label : '';
                pw.lstAggrementPricing = mapAggrementPricingWrapper.get(pw.productId);
                pw.netPrice = mapAgreementProductPrice.get(pw.productId+''+pw.selectedValue) != null ? mapAgreementProductPrice.get(pw.productId+''+pw.selectedValue) : 0;
            }
            System.debug(obj);
            lstProductWrapper.add(pw);
        }
        return lstProductWrapper;
    }
    
   /*  @AuraEnabled(cacheable=true)
    public static List<String> getOrderPricingMeta() {
        // Use the getObjectMetaData method to retrieve the object from custom setting
        List<Order_Pricing_Object_API__mdt> metaList =[Select Pricing_API_Name__c,CER_API_Name__c from Order_Pricing_Object_API__mdt limit 1];
        list<String> objectApiName;
        for(Order_Pricing_Object_API__mdt mdt :metaList){
            objectApiName.add(mdt.Pricing_API_Name__c);
            objectApiName.add(mdt.CER_API_Name__c);
        }
        system.debug('Order_Pricing_Object_API__mdt list :::: '+ objectApiName);
        return objectApiName;
    }*/
    
    public static Map<String, String> getOrderPricingMetadata() {
        Map<String, String> objectApiName = new Map<String, String>();
        
        // Query the custom metadata type
        List<Order_Pricing_Object_API__mdt> metaList = [
            SELECT Pricing_API_Name__c, CER_API_Name__c 
            FROM Order_Pricing_Object_API__mdt 
            LIMIT 1
        ];
        
        // Populate the map
        if (!metaList.isEmpty()) {
            Order_Pricing_Object_API__mdt mdt = metaList[0];
            objectApiName.put('PricingAPI', mdt.Pricing_API_Name__c);
            objectApiName.put('CERAPI', mdt.CER_API_Name__c);
        }
        
        System.debug('Order_Pricing_Object_API__mdt map: ' + objectApiName);
        return objectApiName;
    }
    @AuraEnabled
     public static List<Object>  orderPricevalidate(string orderLineItemData){  
         System.debug( 'apw.discount'+orderLineItemData);
         List<ProductWrapper> lstProductData = (List<ProductWrapper>)JSON.deserialize(orderLineItemData, List<ProductWrapper>.class);
         System.debug( 'apw.lstProductData'+lstProductData);
         for(ProductWrapper apw:lstProductData){
             System.debug( 'apw'+apw);
             if(apw.nationalId=='10944'&&apw.discount==10){
                apw.discount=20;
                 System.debug(apw.discount+'apw.discount');
                 apw.netPrice= apw.netPrice-( apw.netPrice* 10)/100;
                 System.debug(apw.netPrice+'apw.netPrice');
             }
         }
    		System.debug(lstProductData+'lstProductDataq');
         return lstProductData;
    }
    
     @AuraEnabled
     public static boolean orderlineitemsvalidate(string orderLineItemData){ 
         boolean error;
          List<ProductWrapper> lstProductData = (List<ProductWrapper>)JSON.deserialize(orderLineItemData, List<ProductWrapper>.class);
        System.debug(lstProductData+'lstProductData');
         for(ProductWrapper apw:lstProductData){
             System.debug('lstProductData.apw.productId'+apw.Id);
             if(apw.Id=='01tao0000000l0aAAA'&&apw.discount>10){
                 error=true;
             }
             
         }
    	System.debug(error+'error');
            return error;
    }
    
   
    @AuraEnabled
    public static List<ResultWrapper> fetchLookupRecords(String objectApiName, String fieldApiName,
       	String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId) {
        String pluginName = [SELECT Plugin__c,DeveloperName FROM Agreement_Request_Setting__mdt where DeveloperName ='AgreementRequest'].Plugin__c;
        system.debug('pricelistId :: '+pricelistId);
        system.debug('recId :: '+recId);
		List<String> filterproducts = getFilterProducts(recId);
        List<ResultWrapper> returnWrapperList = new List<ResultWrapper>();
            if(pricelistId != null){
                Object_Query__mdt objQuery = [select id, Label, DeveloperName,Query__c from Object_Query__mdt where DeveloperName ='PriceListQuery' WITH SECURITY_ENFORCED];
       			system.debug(String.escapeSingleQuotes(pricelistId));
               	Order_Request_Setting__mdt priceListField =[Select id,Plugin__c from Order_Request_Setting__mdt where DeveloperName ='ProductlistId'  WITH SECURITY_ENFORCED limit 1];
                String fieldsToQuery = 'SELECT Id, ';
                if(string.isNotBlank(fieldApiName)){
                    fieldsToQuery = fieldsToQuery + fieldApiName;
                }
                if(string.isNotBlank(otherFieldApiName)){
                    fieldsToQuery = fieldsToQuery + ', ' + otherFieldApiName;
                }
                String query = fieldsToQuery + ' FROM '+ objectApiName;
		        String filterCriteria ='(' + fieldApiName + ' LIKE \'%' + String.escapeSingleQuotes(searchString.trim()) + '%\' ' +
                       						 'OR ' + otherFieldApiName + ' LIKE \'%' + String.escapeSingleQuotes(searchString.trim()) + '%\')';
               // String filterCriteria = fieldApiName + ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 10';
                String whereCriteria = ' WHERE Id != null ';

                if(!Test.isRunningTest()){
                    String queryPriceListItem;
                    if(!filterproducts.isEmpty()){
                         system.debug('reusuable filterproducts : '+filterproducts);
                       	queryPriceListItem = String.escapeSingleQuotes(objQuery.Query__c) +' = \'' + String.escapeSingleQuotes(pricelistId) + '\'';
                         queryPriceListItem = queryPriceListItem + ' AND Product_Name__r.Name NOT IN :filterProducts';
                        system.debug('reusuable queryPriceListItem : '+queryPriceListItem);
                    }else{
                    	queryPriceListItem = String.escapeSingleQuotes(objQuery.Query__c) +' = \'' + String.escapeSingleQuotes(pricelistId) + '\'';
                    }
                    set<Id> productIds = new set<Id>();
                    for(SObject s : Database.query(queryPriceListItem)) {
                        productIds.add((String)s.get(priceListField.Plugin__c));
                        //productIds.add((String)s.get('Apttus_Config2__ProductId__c'));
                    }
                	whereCriteria = ' WHERE Id IN : productIds ';
                }
                if(String.isNotBlank(fieldApiName)){
                    query += whereCriteria ;
                    query += ' AND ' + filterCriteria;
                    system.debug('Query data :::'+query);
                }
                
                for(SObject s : Database.query(query)) {
                    ResultWrapper wrap = new ResultWrapper(); 
                    wrap.mainField = (String)s.get(fieldApiName);
                    wrap.subField = (String)s.get(otherFieldApiName);
                    wrap.id = (String)s.get('id');
                    returnWrapperList.add(wrap);
                }
            }
        return returnWrapperList;
        
    }

    public class ResultWrapper{
        @AuraEnabled public String mainField{get;set;}
        @AuraEnabled public String subField{get;set;}
        @AuraEnabled public String id{get;set;}
    }
    
    public class PricingWrapper {
        @AuraEnabled
        public String Id {get; set;}
        
        @AuraEnabled
        public String productName {get; set;}
        
        @AuraEnabled
        public String nationalId {get; set;}
        
        @AuraEnabled
        public String contractNumber {get; set;}
        
        @AuraEnabled
        public String priceListName {get; set;}
        
        @AuraEnabled
        public Decimal price {get; set;}
        
        @AuraEnabled
        public Integer quantity {get; set;}
        
        @AuraEnabled
        public Integer recordIndex {get; set;}
    }
    
    public class ProductWrapper {
        @AuraEnabled
        public Boolean discountApplied {get; set;}

        @AuraEnabled
        public String recordId {get; set;}
        
        @AuraEnabled
        public String nationalId {get; set;}
        
        @AuraEnabled
        public String Id {get; set;}
        
        @AuraEnabled
        public String productId {get; set;}
        
        @AuraEnabled
        public Decimal quantity {get; set;}
        
        @AuraEnabled
        public Decimal discount {get; set;}
        
        @AuraEnabled
        public Decimal netPrice {get; set;}
        
        @AuraEnabled
        public Decimal listPrice {get; set;}
        
        @AuraEnabled
        public String nationalName {get; set;}
        
        @AuraEnabled
        public String productName {get; set;}
        
        @AuraEnabled
        public String productCode{get; set;}
        
        @AuraEnabled
        public String opportunityId {get; set;}
        
        @AuraEnabled
        public String opportunityName {get; set;}
        
        @AuraEnabled
        public List<AggrementPricingWrapper> lstAggrementPricing {get; set;}
        
        @AuraEnabled
        public List<OptionsWrapper> options {get; set;}
        
        @AuraEnabled
        public String selectedValue {get; set;}
        
        @AuraEnabled
        public String aggrementName {get; set;}
        
        @AuraEnabled
        public Integer recordIndex {get; set;}
        
        @AuraEnabled
        public Decimal contractdiscount {get; set;}
        
        @AuraEnabled
        public Decimal baseprice {get; set;}
        
        @AuraEnabled
        public Decimal price {get; set;}
        
        @AuraEnabled
        public String orderdate {get; set;}
        
        @AuraEnabled
        public String location {get; set;}
        
        @AuraEnabled
        public String atpcol {get; set;}
        
        @AuraEnabled
        public Boolean isDisabled {get; set;}
   
        public ProductWrapper(){
        this.discountApplied = false;
    }
   
    }


    
    public class ComboboxWrapper {
        @AuraEnabled
        public String selectedRecord {get; set;}
        
        @AuraEnabled
        public List<OptionsWrapper> lstcomboboxOptions {get; set;}
    }
    
    public class OptionsWrapper {
        @AuraEnabled
        public String label {get; set;}
        
        @AuraEnabled
        public String value {get; set;}
        
        @AuraEnabled
        public String description {get; set;}
    }
    
    public class AggrementPricingWrapper {
        @AuraEnabled
        public String productID {get; set;}
        
        @AuraEnabled
        public String productName {get; set;}
        
         @AuraEnabled
        public String productCode { get; set; }
        
        @AuraEnabled
        public String nationalId {get; set;}
        @AuraEnabled
        public Decimal quantity {get; set;}
        @AuraEnabled
        public Decimal discount {get; set;}
        @AuraEnabled
        public Decimal price {get; set;}
        @AuraEnabled
        public String aggrementId {get; set;}
        @AuraEnabled
        public String aggrementName {get; set;}
        @AuraEnabled
        public String aggrementCode {get; set;}
        
        @AuraEnabled
        public Decimal range {get; set;}
    }
    
    
    public class AgreementProductWrapper {
        @AuraEnabled
        public String productName { get; set; }

        @AuraEnabled
        public String productId { get; set; }
        
         @AuraEnabled
        public String recordId { get; set; }

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
    
    public class EntryFormWrapper{
        @AuraEnabled
        public String fieldName {get; set;}
        
        @AuraEnabled
        public String value {get; set;}
        
        @AuraEnabled
        public String label {get; set;}
        
        @AuraEnabled
        public String displayValue {get; set;}
        
        @AuraEnabled
        public String fieldLookupName {get; set;}
        
        @AuraEnabled
        public String objName {get; set;}
        
        @AuraEnabled
        public Boolean isDisabled {get; set;}
        
        @AuraEnabled
        public Boolean isReference {get; set;}
        
        @AuraEnabled
        public Boolean isRequired {get; set;}
        
        @AuraEnabled
        public Boolean isAgreement {get; set;}
        
        @AuraEnabled
        public Boolean isPriceList {get; set;}
        
        @AuraEnabled
        public Boolean isDate {get; set;}
        
        @AuraEnabled
        public Boolean isLocation {get; set;}
        
        @AuraEnabled
        public Boolean isType {get; set;}
        
        @AuraEnabled
        public String relatedObject {get; set;}
        
        @AuraEnabled
        public String relatedObjectId {get; set;}
    }
    
    public class TitleWrapper{
        @AuraEnabled
        public String name {get; set;}
        
        @AuraEnabled
        public String objName {get; set;}
        
        @AuraEnabled
        public String iconName {get; set;}     
    }
    
    public class OrderDetailWrapper{
        @AuraEnabled
        public String accId {get; set;}
        
        @AuraEnabled
        public String orderType {get; set;}
        
        @AuraEnabled
        public String name {get; set;}
        
        @AuraEnabled
        public String objName {get; set;}
        
        @AuraEnabled
        public String iconName {get; set;}     
    }
    
    public class OrderWrapper {
        @AuraEnabled
        public String Id {get; set;}
        
        @AuraEnabled
        public String Name {get; set;}
        
        @AuraEnabled
        public List<OrderLineItem> lstOrderLineItem {get; set;}
    }
    
    public class OrderLineItem {
        @AuraEnabled
        public String Id {get; set;}
        
        @AuraEnabled
        public String parentId {get; set;}
        
        @AuraEnabled
        public String productName {get; set;}
        
        @AuraEnabled
        public String productCode {get; set;}
        
        @AuraEnabled
        public Decimal price {get; set;}
        
        @AuraEnabled
        public Decimal quantity {get; set;}
        
        @AuraEnabled
        public Decimal discount {get; set;}
    }
    
    public class OrderCreationResponse {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Order order;
        
        public OrderCreationResponse(Boolean success, String message, Order order) {
            this.success = success;
            this.message = message;
            this.order = order;
        }
    }
    
    public class ConfigurationCreationResponse {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Id configId;
        
        public ConfigurationCreationResponse(Boolean success, String message, Id configId) {
            this.success = success;
            this.message = message;
            this.configId = configId;
        }
    }
    
    
    public class BooleanResponses {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public String objectName;
        
        public BooleanResponses(Boolean success, String message, String objectName) {
            this.success = success;
            this.message = message;
            this.objectName = objectName;           
        }
    }
    
    
}