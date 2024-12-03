public class AgreementRequestHandler implements IGenerateAgreementController {    
    public static List<Object> getAgreementLineitems(String recordId) {
        system.debug(recordId+'recordId');
        list<AggrementlineitemWrapper> lineitems=new list<AggrementlineitemWrapper>();
          JSON_Data__c jsonData = new JSON_Data__c();
        for(JSON_Data__c jd : [SELECT Id,Data_Object_Id__c,Agreement_Header_Data__c,Agreement_Line_Items_Data__c FROM JSON_Data__c WHERE Data_Object_Id__c = :recordId]){
            jsonData = jd;
        }
        if(jsonData.Agreement_Line_Items_Data__c != null){
            lineitems = (List<AggrementlineitemWrapper>)JSON.deserialize(jsonData.Agreement_Line_Items_Data__c, List<AggrementlineitemWrapper>.class);
        for (AggrementlineitemWrapper pw :lineitems) {
            pw.discountApplied = false;
        }
        }
        else{
        for(Agreement_Line_Item__c ali:[select id,Product__r.Name, Product__r.Family, Product_Code__c,Product__c, List_Price__c,Aggreement__c from Agreement_Line_Item__c where Aggreement__c=:recordId])
        {
            
            AggrementlineitemWrapper alw =new AggrementlineitemWrapper();
            alw.productName=ali.Product__r.Name;
            alw.productId=ali.Product__c;
            alw.productFamily=ali.Product__r.Family;
            alw.productCode=ali.Product_Code__c;
            alw.listPrice=ali.List_Price__c;
            alw.agreement=ali.Aggreement__c;
            alw.Id=ali.id;
            
            lineitems.add(alw);     
        }
        }
        return lineitems;
    }
    
    public class FieldValueWrapper {
        @AuraEnabled
        public String fieldName { get; set; }
        @AuraEnabled
        public String fieldValue { get; set; }
        @AuraEnabled
        public String relatedName { get; set; }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> fetchDynamicNames(String objectName, Map<String, String> fieldValues) {
        List<FieldValueWrapper> result = new List<FieldValueWrapper>();
        
        for (String fieldName : fieldValues.keySet()) {
            String fieldValue = fieldValues.get(fieldName);
            DescribeFieldResult fieldDescribe = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();
            
            FieldValueWrapper wrapper = new FieldValueWrapper();
            wrapper.fieldName = fieldName;
            wrapper.fieldValue = fieldValue;
            
            if (fieldDescribe.getType() == Schema.DisplayType.Reference) {
                List<Schema.SObjectType> refTypes = fieldDescribe.getReferenceTo();
                if (!refTypes.isEmpty()) {
                    String relatedObjectName = refTypes[0].getDescribe().getName();
                    String query = 'SELECT Name FROM ' + relatedObjectName + ' WHERE Id = :fieldValue';
                    SObject relatedRecord = Database.query(String.escapeSingleQuotes(query));
                    wrapper.relatedName = relatedRecord != null ? (String)relatedRecord.get('Name') : null;
                }
            }
            
            result.add(wrapper);
        }
        
        system.debug('Result in fetchDynamicNames: ' + result);
        return result;
    }



    @AuraEnabled(cacheable=true)
    public static List<Object> getFieldDataFromMetadata(String recordId, String objectName) {
        Agreement_Request_Setting__mdt metadata = [
            SELECT Home_Page__c FROM Agreement_Request_Setting__mdt WHERE Summary_Page__c = :objectName LIMIT 1
        ];        
        List<String> headerFields = new List<String>();
        if(metadata.Home_Page__c != null){
            headerFields = metadata.Home_Page__c.split(',');
        }
        
        String query = 'Select Id ';
        
        for(String fieldApi : headerFields){
            query = query + ' , ' + fieldApi;
        }
        query = query + ' from Aggrement__c where Id =: recordId';
        System.debug(query);
        List<Aggrement__c> lstSampleProduct = Database.query(query);
        
        set<Id> accountIds = new set<Id>();
        for(Aggrement__c sp : lstSampleProduct){
            if(sp.Account__c != null){
                accountIds.add(sp.Account__c);
            }
        }
        map<Id,Account> mapAccounts = new map<Id,Account>([select id,Name from Account where Id IN : accountIds]);
        
        set<Id> priceListIds = new set<Id>();
        for(Aggrement__c sp : lstSampleProduct){
            if(sp.Price_List__c != null){
                priceListIds.add(sp.Price_List__c);
            }
        }
        map<Id,Price_List__c> mapPriceList = new map<Id,Price_List__c>([select id,Name from Price_List__c where Id IN : priceListIds]);
        
        map<String,Schema.DescribeFieldResult> mapFieldLabel = new map<String,Schema.DescribeFieldResult>();
        
        Map<String,Schema.SObjectField> mfields = Schema.Aggrement__c.SObjectType.getDescribe().fields.getMap();
        for(String fieldApi : headerFields){
            Schema.DescribeFieldResult fieldResult = mfields.get(fieldApi).getDescribe();
            mapFieldLabel.put(fieldApi,fieldResult);
        }
        
        List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
        for(Aggrement__c sp : lstSampleProduct){
            for(String f : headerFields){
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = f;
                efw.value = sp.get(f) != null ? ''+sp.get(f) : null;
                efw.label = mapFieldLabel.get(f).getLabel();
                efw.isPriceList = false;
                if(String.valueOf(mapFieldLabel.get(f).getType()) == 'REFERENCE' && f == 'Account__c'){
                    efw.objName = 'Account';
                    efw.fieldLookupName = 'Name';
                    efw.value = sp.get(f) != null && mapAccounts != null && mapAccounts.get(''+sp.get(f)) != null ? mapAccounts.get(''+sp.get(f)).Name : '';
                }
                if(String.valueOf(mapFieldLabel.get(f).getType()) == 'REFERENCE' && f == 'Price_List__c'){
                    efw.objName = 'Price_List__c';
                    efw.fieldLookupName = 'Name';
                    efw.isPriceList = true;
                    efw.value = sp.get(f) != null && mapPriceList != null && mapPriceList.get(''+sp.get(f)) != null ? mapPriceList.get(''+sp.get(f)).Name : '';
                    efw.priceListId = sp.get(f) != null && mapPriceList != null && mapPriceList.get(''+sp.get(f)) != null ? mapPriceList.get(''+sp.get(f)).id : '';
                    system.debug('efw value for price list is :'+efw.value);
                }
                if(String.valueOf(mapFieldLabel.get(f).getType()) == 'DATE' && efw.value != null){
                    List<String> lstDate = efw.value.split(' ');
                    efw.value = lstDate[0] != 'null' ? lstDate[0] : '';
                }
                lstEntryFormWrapper.add(efw);
            }
        }
        system.debug('jj result is :'+lstEntryFormWrapper);
        return lstEntryFormWrapper;
    }
    
    /*@AuraEnabled(cacheable=true)
    public static Map<String, Object> getFieldDataFromMetadata(String recordId, String objectName) {
        Agreement_Request_Setting__mdt metadata = [
            SELECT Home_Page__c FROM Agreement_Request_Setting__mdt where Summary_Page__c = :objectName LIMIT 1
        ];
        
        // Parse the field names from the metadata
        String[] fieldNames = metadata.Home_Page__c.split(',');
        
        // Build a dynamic SOQL query string
        String queryString = 'SELECT ' + String.join(fieldNames, ',') + ' FROM ' + objectName + ' WHERE Id = :recordId';
        
        // Query the record to get the field values
        SObject record = Database.query(queryString);
        
        // Extract the field values
        Map<String, Object> fieldData = new Map<String, Object>();
        for (String fieldName : fieldNames) {
            fieldData.put(fieldName.trim(), record.get(fieldName.trim()));
        }
        return fieldData;
        
        
    }*/

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getAgreementHomePageFieldSet(String objectName) {
        Agreement_Request_Setting__mdt reqMetadata = [
            SELECT Id, Plugin__c, Object_Api_Name__c, Home_Page__c, Summary_Page__c 
            FROM Agreement_Request_Setting__mdt 
            WHERE Plugin__c = :objectName 
            LIMIT 1
        ];
        system.debug('jj id is :'+reqMetadata.Id);
        SObjectType objectType = Schema.getGlobalDescribe().get(reqMetadata.Plugin__c);
        DescribeSObjectResult describeResult = objectType.getDescribe();
        FieldSet fs = describeResult.FieldSets.getMap().get(reqMetadata.Home_Page__c);
        
        Set<String> readOnlyFields = new Set<String>();
        if (reqMetadata.Object_Api_Name__c != null) {
            readOnlyFields.addAll(reqMetadata.Object_Api_Name__c.split(','));
        }
        system.debug('jj readonly fields are :'+readOnlyFields);
        
        Set<String> requiredFields = new Set<String>();
        if (reqMetadata.Summary_Page__c != null) {
            requiredFields.addAll(reqMetadata.Summary_Page__c.split(','));
        }
        
        List<Map<String, Object>> fieldInfos = new List<Map<String, Object>>();
        for (Schema.FieldSetMember fsm : fs.getFields()) {
            Map<String, Object> fieldInfoMap = new Map<String, Object>();
            Schema.DescribeFieldResult fieldDescribe = describeResult.fields.getMap().get(fsm.getFieldPath()).getDescribe();
            Boolean isLookup = fieldDescribe.getType() == Schema.DisplayType.Reference;
            Boolean isFieldRequired = requiredFields.contains(fsm.getFieldPath());
            Boolean isReadOnly = readOnlyFields.contains(fsm.getFieldPath());
            Boolean isPriceList = false;
            if(fsm.getFieldPath() == 'Price_List__c'){
                isPriceList = true;
            }            
            fieldInfoMap.put('fieldName', fsm.getFieldPath());
            fieldInfoMap.put('isRequired', isFieldRequired);
            fieldInfoMap.put('isLookup', isLookup);
            fieldInfoMap.put('isReadOnly', isReadOnly);
            fieldInfoMap.put('isPriceList', isPriceList);
            fieldInfos.add(fieldInfoMap);
        }
        system.debug('jj fieldinfos is :' + fieldInfos);
        return fieldInfos;
    }
    
    
    

    /*@AuraEnabled(cacheable=true)
    public static List<Object> getAgreementHomePageFieldSet(String objectName) {
        Agreement_Request_Setting__mdt reqMetadata = [SELECT Id, Object_Api_Name__c, Home_Page__c, Summary_Page__c FROM Agreement_Request_Setting__mdt WHERE Object_Api_Name__c = :objectName LIMIT 1];
        SObjectType objectType = Schema.getGlobalDescribe().get(reqMetadata.Object_Api_Name__c);
        DescribeSObjectResult describeResult = objectType.getDescribe();
        FieldSet fs = describeResult.FieldSets.getMap().get(reqMetadata.Home_Page__c);

        List<Object> fieldInfos = new List<Object>();
        for (Schema.FieldSetMember fsm : fs.getFields()) {
            Map<String, Object> fieldInfoMap = new Map<String, Object>();
            Schema.DescribeFieldResult fieldDescribe = describeResult.fields.getMap().get(fsm.getFieldPath()).getDescribe();
            Boolean isFieldRequired = !fieldDescribe.isNillable() && !fieldDescribe.isDefaultedOnCreate();

            fieldInfoMap.put('fieldName', fsm.getFieldPath());
            fieldInfoMap.put('isRequired', isFieldRequired);
            fieldInfos.add(fieldInfoMap);
        }

        return fieldInfos;
    }*/

    
    @AuraEnabled(cacheable=true)
    public static List<Object> getAgreementSummaryPageFieldSet(String objectName) {
        Agreement_Request_Setting__mdt reqMetadata = [SELECT Id, Object_Api_Name__c, Home_Page__c, Summary_Page__c FROM Agreement_Request_Setting__mdt WHERE Object_Api_Name__c = :objectName LIMIT 1];
        SObjectType objectType = Schema.getGlobalDescribe().get(reqMetadata.Object_Api_Name__c);
        DescribeSObjectResult describeResult = objectType.getDescribe();
        FieldSet fs = describeResult.FieldSets.getMap().get(reqMetadata.Summary_Page__c);

        List<Object> fieldInfos = new List<Object>();
        for (Schema.FieldSetMember fsm : fs.getFields()) {
            Map<String, Object> fieldInfoMap = new Map<String, Object>();
            Schema.DescribeFieldResult fieldDescribe = describeResult.fields.getMap().get(fsm.getFieldPath()).getDescribe();
            Boolean isFieldRequired = !fieldDescribe.isNillable() && !fieldDescribe.isDefaultedOnCreate();

            fieldInfoMap.put('fieldName', fsm.getFieldPath());
            fieldInfoMap.put('isRequired', isFieldRequired);
            fieldInfos.add(fieldInfoMap);
        }

        return fieldInfos;
    }
    
    public class AgreementField {
        public String fieldName;
        public String value;
    }
    
    public class AgreementUpdateResponse {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Aggrement__c agr;
        
        public AgreementUpdateResponse(Boolean success, String message, Aggrement__c agr) {
            this.success = success;
            this.message = message;
            this.agr = agr;
        }
    }

    public Object saveAgreementDetails(String agreementId, List<Object> agreementData, List<Object> agreementLineItemData){        
        try {
			JSON_Data__c jsonDataObj = new JSON_Data__c();
            String agreementJson = JSON.serialize(agreementData);
            String agreementLineItemsJson = JSON.serialize(agreementLineItemData);
            jsonDataObj.Data_Object_Id__c = agreementId;
            jsonDataObj.Agreement_Header_Data__c = agreementJson;
            jsonDataObj.Agreement_Line_Items_Data__c = agreementLineItemsJson;
            insert jsonDataObj;
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(true, 'Saved Agreement Successfully.', null);
            String jsonResponse = JSON.serialize(agrResponse);
            return agrResponse;
        } catch (DmlException e) {
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(false, 'Error updating Agreement: '+ e.getMessage(), null);           
            String jsonResponse = JSON.serialize(agrResponse);
            return jsonResponse;
        }
    }
    
    public Object generateApprovalRequests(String agreementId){        
        try {
            Aggrement__c agrObj = [SELECT Id, Owner.Id FROM Aggrement__c WHERE Id = :agreementId];
            Approval__c approvalObj = new Approval__c();
            approvalObj.Related_Agreement__c = agreementId;
            approvalObj.Approval_Description__c = 'This is an approval request created';
            approvalObj.Approval_Owner__c = agrObj.Owner.Id;
            insert approvalObj;
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(true, 'Approval Generated Successfully.', null);
            String jsonResponse = JSON.serialize(agrResponse);
            return agrResponse;
        } catch (DmlException e) {
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(false, 'Error generating approvals: '+ e.getMessage(), null);           
            String jsonResponse = JSON.serialize(agrResponse);
            return jsonResponse;
        }
    }

    @AuraEnabled(cacheable=true)
    public static Object getApprovalDetails1(String agreementId){        
        List<ApprovalDetails> apprDetails = new List<ApprovalDetails>();
        Set<Id> userIds = new Set<Id>();
        List<Approval__c> apprObj = [SELECT Id, Approval_Owner__c FROM Approval__c WHERE Related_Agreement__c = :agreementId];
        for(Approval__c obj : apprObj){
            userIds.add(obj.Approval_Owner__c);
        }
        List<User> userObj = [SELECT Id, UserRole.Name, Name, Department, Email, Phone FROM User WHERE Id IN :userIds];
        for(Approval__c obj1 : apprObj){
            if(obj1.Approval_Owner__c != null){
                for(User obj : userObj){
                    ApprovalDetails adObj = new ApprovalDetails();
                    if(obj.Name != null){
                        adObj.Name = obj.Name;
                    }
                    if(obj.UserRole.Name != null){
                        adObj.Role = obj.UserRole.Name;
                    }
                    if(obj.Email != null){
                        adObj.Email = obj.Email;
                    }
                    if(obj.Department != null){
                        adObj.Department = obj.Department;
                    }
                    if(obj.Phone != null){
                        adObj.Phone = obj.Phone;
                    }
                    system.debug(adObj);
                    apprDetails.add(adObj);
                    system.debug(apprDetails);
                }
            }
        }
        return apprDetails;
    }
        
    
    public Object updateAgreementData(String recordId, List<Object> agreementData){
        List<AgreementField> orderFields = new List<AgreementField>();
        Aggrement__c agrObj = [Select Id FROM Aggrement__c WHERE Id =:recordId];
		String accName;
		String priceListName;
		Account accObj;
		Price_List__c plObj;
        try {
            for (Object item : agreementData) {
                Map<String, Object> fieldMap = (Map<String, Object>)item;
                String fieldName = (String)fieldMap.get('fieldName');
                Object value = fieldMap.get('value');  // Use Object to handle any type
            
                if (String.isNotBlank(fieldName) && !fieldName.equals('Account__c') && !fieldName.equals('Price_List__c') && !fieldName.equals('Name')) {
                    if (fieldName.equals('Agreement_Start_Date__c') && value instanceof String) {
                        Date startDate = Date.valueOf((String)value);
                        agrObj.put(fieldName, startDate);
                    } else if (fieldName.equals('Agreement_End_Date__c') && value instanceof String) {
                        Date endDate = Date.valueOf((String)value);
                        agrObj.put(fieldName, endDate);
                    } else if (fieldName.equals('Active__c') && value instanceof Boolean) {
                        agrObj.put(fieldName, value);  // Directly use Boolean value
                    } else {
                        agrObj.put(fieldName, value != null ? String.valueOf(value) : null);  // Convert to string if needed
                    }
                }
                if(fieldName.equals('Account__c')){
                    accName = (String)value;
                }
                if(fieldName.equals('Price_List__c')){
                    priceListName = (String)value;
                }
            }
			if(accName!=null && !accName.startsWith('001')){
                system.debug('jj accName is :'+accName);
                accObj = [SELECT Id FROM Account WHERE Name = :accName];
                if(accObj!=null){
                    agrObj.Account__c = accObj.Id;
                }
			}
			if(priceListName!=null && !priceListName.startsWith('a0F')){
                system.debug('jj priceListName is :'+priceListName);
                plObj = [SELECT Id FROM Price_List__c WHERE Name = :priceListName];
                if(plObj!=null){
                    agrObj.Price_List__c = plObj.Id;
                }
			}
            update agrObj;
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(true, 'Updated Agreement Successfully.', agrObj);
            String jsonResponse = JSON.serialize(agrResponse);
            return agrResponse;
        } catch (Exception e) {
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(false, 'Error updating Agreement: '+ e.getMessage(), null);           
            String jsonResponse = JSON.serialize(agrResponse);
            return jsonResponse;
        }
    }    
    
    public class AgreementLineItemData {
        public Decimal listPrice;
        public String productCode;
        public String productFamily;
        public String productId;
        public String productName;
        
        // Add an empty constructor if needed by serialization/deserialization mechanisms
        public AgreementLineItemData() {}
        
        public AgreementLineItemData(Decimal listPrice, String productCode, String productFamily, String productId, String productName) {
            this.listPrice = listPrice;
            this.productCode = productCode;
            this.productFamily = productFamily;
            this.productId = productId;
            this.productName = productName;
        }
    }
    
    public List<Account> getCompanyLocations(String agrID){
       Aggrement__c agrObj = [SELECT Id, Account__r.Name from Aggrement__c WHERE Id =:agrID];  
       if(agrObj.Account__r.Name != null){
        String str = agrObj.Account__r.Name + '%';
        return [SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry 
               FROM Account 
               WHERE Name LIKE :str];
        }else{
            return null;
        }       
   }

    
    public Object updateAgreementLineItemData(String recordId, List<Object> agreementLineItemData) {
        List<Agreement_Line_Item__c > itemsToDelete = [SELECT Id FROM Agreement_Line_Item__c WHERE Aggreement__c= :recordId];
        if(!itemsToDelete.isEmpty()){
            Delete itemsToDelete;
        }
        Decimal listprice = 0;
        List<Agreement_Line_Item__c > itemsToInsert = new List<Agreement_Line_Item__c>();
        try{
            String productDataJSON = JSON.serialize(agreementLineItemData);
            List<Object> scopeObjectsData = (List<Object>) JSON.deserializeUntyped(
                productDataJSON
            );
            for (Object scopeObject : scopeObjectsData) {
                Map<String, Object> scopeMap = (Map<String, Object>) scopeObject;
                Agreement_Line_Item__c agrLI = new Agreement_Line_Item__c();
                if (scopeMap.containsKey('listPrice') && scopeMap.get('listPrice') != null) {
                    agrLI.List_Price__c = Decimal.valueOf(String.valueOf(scopeMap.get('listPrice')));      
                }
                if (scopeMap.containsKey('netPrice') && scopeMap.get('netPrice') != null) {
                    agrLI.Contract_Net_Price__c = Decimal.valueOf(String.valueOf(scopeMap.get('netPrice')));      
                }
                if (scopeMap.containsKey('productId') && scopeMap.get('productId') != null) {
                    agrLI.Product__c = String.valueOf(scopeMap.get('productId'));      
                }
                agrLI.Aggreement__c = recordId;
                system.debug('jj the agreement is :'+agrLI);
                itemsToInsert.add(agrLI);
                system.debug('jj the agreement line item list is :'+itemsToInsert);
            }
            if(!itemsToInsert.isEmpty()){
                insert itemsToInsert;
            }
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(true, 'Updated Agreement Successfully.', null);
            String jsonResponse = JSON.serialize(agrResponse);
            return agrResponse;
        } catch (Exception e) {
            AgreementUpdateResponse agrResponse =  new AgreementUpdateResponse(false, 'Error updating Agreement: '+ e.getMessage(), null);           
            String jsonResponse = JSON.serialize(agrResponse);
            return agrResponse;
        }   
    }
    
    public List<Object> updateProducts(String recordId, String saveDraftValues, String productData){
        System.debug('---saveDraftValues--->'+saveDraftValues);
        System.debug('---productData--->'+productData);
        List<AggrementPricingWrapper> lstAggrementPricingWrap = (List<AggrementPricingWrapper>)JSON.deserialize(saveDraftValues, List<AggrementPricingWrapper>.class);
        
        set<String> setIds = new set<String>();
        for(AggrementPricingWrapper apw : lstAggrementPricingWrap){
            setIds.add(apw.Id);
        }
        
        List<Aggrement_Info__c> lsAggrementInfo = [SELECT Id,Aggreement__c,Aggreement__r.Name,Aggreement__r.Agreement_Code__c,Quantity__c,Price__c,Product__r.name,Product__c,Product__r.ProductCode,Discount__c,Range__c,Agreement_Line_Item__c,Agreement_Line_Item__r.Name FROM Aggrement_Info__c where Id IN: setIds];
        
        for(Aggrement_Info__c ai : lsAggrementInfo){
            for(AggrementPricingWrapper apw : lstAggrementPricingWrap){
                if(apw.Id == ai.Id){
                    ai.Price__c = apw.price;
                }
            }
        }
        
        if(!lsAggrementInfo.isEmpty()){
            update lsAggrementInfo;
        }
        
        return AgreementRequestHandler.getAgreementProducts(recordId);
    }
    
    public void errorHandleling(String recId, Exception e) {
        // Implement error handling logic here, potentially logging to a custom object or sending email notifications
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getVolumeRange(String recordId, String productId, String productFamily){
        
        List<VolumeDiscountWrapper> lstVolumeDiscountWrapper = new List<VolumeDiscountWrapper>();
        
        VolumeDiscountWrapper vdw = new VolumeDiscountWrapper();
        vdw.value = Integer.valueof(Math.random() * 100);
        vdw.discountType = 'Percent';
        vdw.discountValue = Integer.valueof(Math.random() * 100);
        lstVolumeDiscountWrapper.add(vdw);
        
        VolumeDiscountWrapper vdw1 = new VolumeDiscountWrapper();
        vdw1.value = Integer.valueof(Math.random() * 100);
        vdw1.discountType = 'Amount';
        vdw1.discountValue = Integer.valueof(Math.random() * 100);
        lstVolumeDiscountWrapper.add(vdw1);
        
        VolumeDiscountWrapper vdw2 = new VolumeDiscountWrapper();
        vdw2.value = Integer.valueof(Math.random() * 100);
        vdw2.discountType = 'Amount';
        vdw2.discountValue = Integer.valueof(Math.random() * 100);
        lstVolumeDiscountWrapper.add(vdw2);
        
        return lstVolumeDiscountWrapper;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Object> getAgreementCatalogData(String recId, String fieldsData){
       /* Id pricelistId;
        List<Aggrement__c> agrRec =[select id,Price_List__c from Aggrement__c where id=:recId limit 1];
        for(Aggrement__c ag:agrRec){
            pricelistId=ag.Price_List__c;
        }
        List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Product2> prodList = [SELECT Id, ProductCode, Name, Family, (SELECT Id, List_Price__c,Price_List__c FROM Price_List_Item__r where Price_List__c =:pricelistId ) FROM Product2];
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
        }*/
        system.debug('Selected fieldsData catalog ::: '+fieldsData);
        system.debug('Selected recId catalog ::: '+recId);
        String selectedPriceList = '';
        Id priceListId;
        Integer i=1;
        Id selectedAgrId = recId;
		Aggrement__c lstEntryFormWrap = (Aggrement__c)JSON.deserialize(fieldsData, Aggrement__c.class);
       	System.debug('Size of lstEntryFormWrap: ' + lstEntryFormWrap);
        if(lstEntryFormWrap.Price_List__c != Null){
                selectedPriceList = lstEntryFormWrap.Price_List__c;
         }
        system.debug('Selected Price catalog ::: '+selectedPriceList);
        
        List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Price_List_Item__c> pricelist = new List<Price_List_Item__c>();
        if (selectedPriceList != null) {
            try {
                Price_List__c pricList = [SELECT Id FROM Price_List__c WHERE Name = :selectedPriceList];
                priceListId = pricList.Id;
            } catch (QueryException e) {
                priceListId = selectedPriceList;
            }
        }
        system.debug('PriceList catalog ::: '+priceListId);
        if(priceListId != null){
            pricelist=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:priceListId ]; 
        }
        
        for(Price_List_Item__c pr :pricelist){
            Product2 prod = pr.Product_Name__r;
            AgreementProductWrapper agr = new AgreementProductWrapper();
            agr.recordId= pr.Product_Name__c;
            agr.productName = prod.Name;
            agr.productId = prod.Id;
            agr.productCode = prod.ProductCode;
            agr.productFamily = prod.Family;
            agr.listPrice = pr.List_Price__c;
            agreProductWrapper.add(agr);
         }        
        return agreProductWrapper;
    }
    
     @AuraEnabled(cacheable=true)
     public static List<Object> getAgreementFastData(String recId,String productId, String fieldsData){
      
        String selectedPriceList = '';
        Id priceListId;
        Id selectedAgrId = recId;
        Integer i=1;
		Aggrement__c lstEntryFormWrap = (Aggrement__c)JSON.deserialize(fieldsData, Aggrement__c.class);
       	System.debug('Size of lstEntryFormWrap: ' + lstEntryFormWrap);
        if(lstEntryFormWrap.Price_List__c != Null){
            selectedPriceList = lstEntryFormWrap.Price_List__c;
        }
        system.debug('Selected Price fast  ::: '+selectedPriceList);
        system.debug('Selected AgrId fast ::: '+selectedAgrId);
         List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Price_List_Item__c> pricelist = new List<Price_List_Item__c>();
        if (selectedPriceList != null) {
            try {
                Price_List__c pricList = [SELECT Id FROM Price_List__c WHERE Name = :selectedPriceList];
                priceListId = pricList.Id;
            } catch (QueryException e) {
                priceListId = selectedPriceList;
            }
        }
        system.debug('PriceList catalog ::: '+priceListId);
        if(priceListId != null){
            pricelist=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:priceListId and Product_Name__c =:productId]; 
        }
       /*	List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Price_List_Item__c> pricelist=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:selectedPriceList and Product_Name__c =:productId ];*/
        for(Price_List_Item__c pr :pricelist){
            Product2 prod = pr.Product_Name__r;
            AgreementProductWrapper agr = new AgreementProductWrapper();
            agr.recordId =pr.Product_Name__c;
            agr.productName = prod.Name;
            agr.productId = prod.Id;
            agr.productCode = prod.ProductCode;
            agr.productFamily = prod.Family;
            agr.listPrice = pr.List_Price__c;
            agreProductWrapper.add(agr);
         }
        /*Id pricelistId;
        List<Aggrement__c> agrRec =[select id,Price_List__c from Aggrement__c where id=:recId limit 1];
        for(Aggrement__c ag:agrRec){
            pricelistId=ag.Price_List__c;
        }
        List<Product2> prodList = [SELECT Id, ProductCode, Name, Family, (SELECT Id, List_Price__c,Price_List__c FROM Price_List_Item__r where Price_List__c =:pricelistId) FROM Product2 where Id =:productId]; 
       if(selectedvalue == 'Name' || selectedvalue == 'Code'){
             prodList = [SELECT Id, ProductCode, Name, Family, (SELECT Id, List_Price__c FROM Price_List_Item__r) FROM Product2 where Id =:productId];
         }else if(selectedvalue == 'Family'){
             prodList = [SELECT Id, ProductCode, Name, Family, (SELECT Id, List_Price__c FROM Price_List_Item__r) FROM Product2 where Id =:productId];
         }
       
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
        }*/
         return agreProductWrapper;
     }
    
    public static object getAgreementFamilyProducts(String selectedValue) {
        AgreementProductWrapper agr = new AgreementProductWrapper();
        Product2 prod = new Product2();
        if (selectedValue.equals('Product Family')) {
            prod = [SELECT Id, ProductCode, Name, Family, 
                    (SELECT Id, List_Price__c FROM Price_List_Item__r) 
                    FROM Product2 
                    WHERE Id = '01tao000001UZB3AAO' LIMIT 1];
        }
        if (prod != null) {
            Price_List_Item__c priceListItem = prod.Price_List_Item__r.isEmpty() ? null : prod.Price_List_Item__r[0];
            agr.productName = prod.Name;
            agr.productId = prod.Id;
            agr.productCode = prod.ProductCode;
            agr.productFamily = prod.Family;
            agr.listPrice = (priceListItem != null) ? priceListItem.List_Price__c : null;
        }
         return agr;
    }
    
    
    public List<Object> fileUpload(String recId, String base64Data, String fieldsData){
        String data = JSON.deserializeUntyped(base64Data).toString();
		list<String> lstCSVLines = data.split('\n');
		for(Integer i = 1; i < lstCSVLines.size(); i++){
            String csvLine = lstCSVLines[i];
            String prevLine = csvLine;
            List<String> csvRowData = new List<String>();
			for(String column : csvLine.split(',')){
				column = column.replaceAll(':quotes:', '').replaceAll(':comma:', ',');
				csvRowData.add(column);
			}
            System.debug(csvRowData);
		}
         List<Object> objlst = new List<Object>();
         return objlst;
     }
   
    public static List<Object> getAgreementProducts(String recordId){
        List<AggrementPricingWrapper> lstAggrementPricingWrapper = new List<AggrementPricingWrapper>();
        for(Aggrement_Info__c agrInfo : [SELECT Id,Aggreement__c,Aggreement__r.Name,Aggreement__r.Agreement_Code__c,Quantity__c,Price__c,Product__r.name,Product__c,Product__r.ProductCode,Discount__c,Range__c,Agreement_Line_Item__c,Agreement_Line_Item__r.Name FROM Aggrement_Info__c where Aggreement__c =: recordId]){
            AggrementPricingWrapper apw = new AggrementPricingWrapper();
            apw.Id = agrInfo.Id;
            apw.price = agrInfo.Price__c;
            apw.productId = agrInfo.Product__c;
            apw.productName = agrInfo.Product__r.name;
            apw.nationalId = agrInfo.Product__r.ProductCode;
            apw.agreementLineItem = agrInfo.Agreement_Line_Item__r.Name;
            apw.priceListName = 'US Country General Price List';
            apw.discount = agrInfo.Discount__c;
            apw.range = agrInfo.Range__c;
            lstAggrementPricingWrapper.add(apw);
        }
        
        return lstAggrementPricingWrapper;
    }
    
    public class VolumeDiscountWrapper {
        @AuraEnabled
        public Decimal value {get; set;}
        
        @AuraEnabled
        public String discountType {get; set;}
        
        @AuraEnabled
        public Decimal discountValue {get; set;}
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

    public class AggrementPricingWrapper {
        @AuraEnabled
        public String Id { get; set; }
        
        @AuraEnabled
        public String productName { get; set; }
        
        @AuraEnabled
        public String productId { get; set; }
        
        @AuraEnabled
        public String nationalId { get; set; }
        
        @AuraEnabled
        public String agreementLineItem { get; set; }
        
        @AuraEnabled
        public String priceListName { get; set; }
        
        @AuraEnabled
        public Decimal price { get; set; }
        
        @AuraEnabled
        public Decimal discount { get; set; }
        
        @AuraEnabled
        public Decimal range { get; set; }
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
        public Boolean isPriceList {get; set;}
         
        @AuraEnabled
        public String priceListId {get; set;}
     }
    
    public class FieldInfo {
        public String fieldName;
        public Boolean isRequired;
        public Boolean isReadOnly;
        
        public FieldInfo(String fieldName, Boolean isRequired,Boolean isReadOnly) {
            this.fieldName = fieldName;
            this.isRequired = isRequired;
            this.isReadOnly = isReadOnly;
        }
    }
      public class AggrementlineitemWrapper {
        @AuraEnabled
        public String Id { get; set; }
        
        @AuraEnabled
        public String productName { get; set; }
        
        @AuraEnabled
        public String productId { get; set; }
        
          @AuraEnabled
        public String agreement { get; set; }
        
        @AuraEnabled
        public String productFamily { get; set; }
        
        @AuraEnabled
        public String productCode { get; set; }
       
         @AuraEnabled
        public Decimal listPrice { get; set; }
         
          @AuraEnabled  
        public Boolean discountApplied {get; set;}
    
    }
    
     public class ApprovalDetails{
        @AuraEnabled
        public String Name {get; set;}
        
        @AuraEnabled
        public String Department {get; set;}
        
        @AuraEnabled
        public String Email {get; set;}
        
        @AuraEnabled
        public String Role {get; set;}
        
        @AuraEnabled
        public String Mail {get; set;}
        
        @AuraEnabled
        public String Phone {get; set;}
     }
}