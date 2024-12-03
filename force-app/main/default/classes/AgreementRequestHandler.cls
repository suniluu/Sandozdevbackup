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
    
    @AuraEnabled
    public static List<Map<String, Object>> populateDefaultAgreementData(List<Map<String, Object>> fields, Id recordId) {
        List<Map<String, Object>> updatedFields = new List<Map<String, Object>>();
    	Opportunity oppObj;
        for (Map<String, Object> field : fields) {
            Map<String, Object> updatedField = new Map<String, Object>(field);
    
            if (String.valueOf(field.get('fieldName')) == 'Agreement_Start_Date__c') {
                updatedField.put('value', Date.today());
            } else if (String.valueOf(field.get('fieldName')) == 'Agreement_End_Date__c') {
                updatedField.put('value', Date.today().addYears(1));
            } else if(String.valueOf(field.get('fieldName')) == 'Account__c'){
                oppObj = [SELECT AccountId FROM Opportunity WHERE ID =:recordId LIMIT 1];
                updatedField.put('value', oppObj.AccountId);
            }
            updatedFields.add(updatedField);
        }
        return updatedFields;
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


    
    public class ValidationResult {
        @AuraEnabled
        public Boolean isValid;
        @AuraEnabled
        public String fieldName;
        @AuraEnabled
        public String errorMessage;
    
        public ValidationResult(Boolean isValid, String fieldName, String errorMessage) {
            this.isValid = isValid;
            this.fieldName = fieldName;
            this.errorMessage = errorMessage;
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<Id, String> getLookupFieldNames(List<Id> ids) {
        Map<Id, String> idToNameMap = new Map<Id, String>();
    
        if (ids == null || ids.isEmpty()) {
            return idToNameMap;
        }
    
        // Identify object types based on ID prefixes
        Set<Id> accountIds = new Set<Id>();
        Set<Id> priceListIds = new Set<Id>();
    
        for (Id id : ids) {
            String prefix = String.valueOf(id).substring(0, 3);
            if (prefix == '001') { // Account ID prefix
                accountIds.add(id);
            } else if (prefix == 'a0F') { // Price List ID prefix
                priceListIds.add(id);
            }
            // Add more prefixes for additional objects
        }
    
        // Query Accounts
        if (!accountIds.isEmpty()) {
            for (Account acc : [SELECT Id, Name FROM Account WHERE Id IN :accountIds]) {
                idToNameMap.put(acc.Id, acc.Name);
            }
        }
    
        // Query Price Lists
        if (!priceListIds.isEmpty()) {
            for (Price_List__c pl : [SELECT Id, Name FROM Price_List__c WHERE Id IN :priceListIds]) {
                idToNameMap.put(pl.Id, pl.Name);
            }
        }
    
        // Add queries for other objects as necessary
        return idToNameMap;
    }


    
    
    @AuraEnabled
    public static List<ValidationResult> validateData(Map<String, String> fieldValues) {
        List<ValidationResult> validationResults = new List<ValidationResult>();
    
        for (String field : fieldValues.keySet()) {
            System.debug('Validating field: ' + field);
            String fieldValue = fieldValues.get(field);
    
            // Example validation logic
            if (field == 'Description__c' && fieldValue == 'test') {
                validationResults.add(
                    new ValidationResult(false, field, 'Please update the right description.')
                );
            }
        }
    
        // If no validation errors, return an empty list
        return validationResults;
    }

    

    @AuraEnabled(cacheable=true)
    public static List<Object> getFieldDataFromMetadata(String recordId, String objectName) {
        Agreement_Request_Setting__mdt metadata = [
            SELECT Agreement_Header_Fields__c 
            FROM Agreement_Request_Setting__mdt 
            WHERE Home_Page_Object_Name__c = :objectName 
            LIMIT 1
        ];        
    
        List<String> headerFields = new List<String>();
        if(metadata.Agreement_Header_Fields__c != null) {
            headerFields = metadata.Agreement_Header_Fields__c.split(',');
        }
    
        // Fetch field metadata
        Map<String, Schema.DescribeFieldResult> fieldDescriptions = new Map<String, Schema.DescribeFieldResult>();
        Map<String, Schema.SObjectField> sObjectFields = Schema.Aggrement__c.SObjectType.getDescribe().fields.getMap();
    
        for (String fieldApi : headerFields) {
            fieldDescriptions.put(fieldApi, sObjectFields.get(fieldApi).getDescribe());
        }
    
        // Prepare result
        List<EntryFormWrapper> lstEntryFormWrapper = new List<EntryFormWrapper>();
    
        if (recordId != null) {
            try {
                // Fetch record data if recordId is provided
                String query = 'SELECT Id';
                for (String fieldApi : headerFields) {
                    query += ', ' + fieldApi;
                }
                query += ' FROM Aggrement__c WHERE Id = :recordId';
    
                List<Aggrement__c> lstSampleProduct = Database.query(query);
    
                // Prepare related data
                Set<Id> accountIds = new Set<Id>();
                Set<Id> priceListIds = new Set<Id>();
    
                for (Aggrement__c record : lstSampleProduct) {
                    if (record.Account__c != null) accountIds.add(record.Account__c);
                    if (record.Price_List__c != null) priceListIds.add(record.Price_List__c);
                }
    
                Map<Id, Account> mapAccounts = accountIds.isEmpty() 
                    ? new Map<Id, Account>() 
                    : new Map<Id, Account>([SELECT Id, Name FROM Account WHERE Id IN :accountIds]);
    
                Map<Id, Price_List__c> mapPriceLists = priceListIds.isEmpty() 
                    ? new Map<Id, Price_List__c>() 
                    : new Map<Id, Price_List__c>([SELECT Id, Name FROM Price_List__c WHERE Id IN :priceListIds]);
    
                // Map fields to their values
                for (Aggrement__c record : lstSampleProduct) {
                    for (String fieldApi : headerFields) {
                        Schema.DescribeFieldResult fieldDescribe = fieldDescriptions.get(fieldApi);
                        EntryFormWrapper efw = new EntryFormWrapper();
                        efw.fieldName = fieldApi;
                        efw.label = fieldDescribe.getLabel();
                        efw.value = record.get(fieldApi) != null ? String.valueOf(record.get(fieldApi)) : null;
    
                        if (fieldDescribe.getType() == Schema.DisplayType.REFERENCE) {
                            if (fieldApi == 'Account__c' && record.Account__c != null) {
                                efw.value = mapAccounts.get(record.Account__c) != null ? mapAccounts.get(record.Account__c).Name : null;
                            } else if (fieldApi == 'Price_List__c' && record.Price_List__c != null) {
                                efw.value = mapPriceLists.get(record.Price_List__c) != null ? mapPriceLists.get(record.Price_List__c).Name : null;
                            }
                        }
    
                        if (fieldDescribe.getType() == Schema.DisplayType.DATE && efw.value != null) {
                            efw.value = efw.value.split(' ')[0];
                        }
    
                        lstEntryFormWrapper.add(efw);
                    }
                }
            } catch (Exception e) {
                System.debug('Error fetching record: ' + e.getMessage());
            }
        }
    
        // If no record is found, return metadata-based defaults
        if (lstEntryFormWrapper.isEmpty()) {
            for (String fieldApi : headerFields) {
                Schema.DescribeFieldResult fieldDescribe = fieldDescriptions.get(fieldApi);
                EntryFormWrapper efw = new EntryFormWrapper();
                efw.fieldName = fieldApi;
                efw.label = fieldDescribe.getLabel();
                efw.value = '--'; // Default placeholder value
                lstEntryFormWrapper.add(efw);
            }
        }
    
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
public static List<Map<String, Object>> getAgreementHomePageFieldSet(String objectName, Id recordId) {
    // Fetch metadata
    Agreement_Request_Setting__mdt reqMetadata = [
        SELECT Id, Home_Page_Object_Field_Set__c, Home_Page_Object_Name__c, 
               Home_Page_Read_Only_Fields__c, Home_Page_Required_Fields__c 
        FROM Agreement_Request_Setting__mdt 
        WHERE Home_Page_Object_Name__c = :objectName 
        LIMIT 1
    ];

    system.debug('JJ reqMetadata: ' + reqMetadata);

    // Initialize variables for field processing
    List<Map<String, Object>> fieldInfos = new List<Map<String, Object>>();
    Set<String> readOnlyFields = reqMetadata.Home_Page_Read_Only_Fields__c != null 
        ? new Set<String>(reqMetadata.Home_Page_Read_Only_Fields__c.split(',')) 
        : new Set<String>();
    Set<String> requiredFields = reqMetadata.Home_Page_Required_Fields__c != null 
        ? new Set<String>(reqMetadata.Home_Page_Required_Fields__c.split(',')) 
        : new Set<String>();
    SObjectType objectType = Schema.getGlobalDescribe().get(reqMetadata.Home_Page_Object_Name__c);
    DescribeSObjectResult describeResult = objectType.getDescribe();
    FieldSet fieldSet = describeResult.FieldSets.getMap().get(reqMetadata.Home_Page_Object_Field_Set__c);

    // Map to store record data
    Map<String, Object> recordData = new Map<String, Object>();
    try {
        if (recordId != null) {
            // Dynamically fetch record fields
            List<String> fieldPaths = new List<String>();
            for (Schema.FieldSetMember fsm : fieldSet.getFields()) {
                fieldPaths.add(fsm.getFieldPath());
            }

            String query = 'SELECT ' + String.join(fieldPaths, ',') +
                           ' FROM ' + reqMetadata.Home_Page_Object_Name__c +
                           ' WHERE Id = :recordId LIMIT 1';

            SObject record = Database.query(query);
            if (record != null) {
                for (String fieldPath : fieldPaths) {
                    recordData.put(fieldPath, record.get(fieldPath));
                }
            }
        }
    } catch (Exception e) {
        system.debug('Error fetching record: ' + e.getMessage());
    }

    // Process field set members
    for (Schema.FieldSetMember fsm : fieldSet.getFields()) {
        Schema.DescribeFieldResult fieldDescribe = describeResult.fields.getMap().get(fsm.getFieldPath()).getDescribe();
        String fieldName = fsm.getFieldPath();
        Boolean isLookup = fieldDescribe.getType() == Schema.DisplayType.Reference;
        Boolean isReadOnly = readOnlyFields.contains(fieldName);
        Boolean isRequired = requiredFields.contains(fieldName);
        Boolean isPriceList = fieldName == 'Price_List__c';

        Map<String, Object> fieldInfoMap = new Map<String, Object>();
        fieldInfoMap.put('fieldName', fieldName);
        fieldInfoMap.put('label', fieldDescribe.getLabel());
        fieldInfoMap.put('isLookup', isLookup);
        fieldInfoMap.put('isReadOnly', isReadOnly);
        fieldInfoMap.put('isRequired', isRequired);
        fieldInfoMap.put('isPriceList', isPriceList);
        fieldInfoMap.put('value', recordData.containsKey(fieldName) ? recordData.get(fieldName) : null); // Use record data if available

        fieldInfos.add(fieldInfoMap);
    }

    system.debug('JJ fieldInfos: ' + fieldInfos);
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
    
    
	public List<Object> getRecordTypeData(){
        return [select Id,Name from RecordType where sObjectType='Aggrement__c'];
    }
    
    public string getRecordTitle(Id recId){       
     string   objName = 'Aggrement__c';
        return objName;
    }
    @AuraEnabled
     public static List<Object>  AgreementPricevalidate(string agreementLineItemData){  
         System.debug( 'apw.discount'+agreementLineItemData);
         List<AgreementProductWrapper> lstProductData = (List<AgreementProductWrapper>)JSON.deserialize(agreementLineItemData, List<AgreementProductWrapper>.class);
         System.debug( 'apw.lstProductData'+lstProductData);
         for(AgreementProductWrapper apw:lstProductData){
             System.debug( 'apw'+apw);
             if(apw.productCode=='SL9060'&&apw.discount==10){
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
     public static boolean Agreementlineitemsvalidate(string agreementLineItemData){ 
         boolean error;
          List<AggrementPricingWrapper> lstProductData = (List<AggrementPricingWrapper>)JSON.deserialize(agreementLineItemData, List<AggrementPricingWrapper>.class);
         for(AggrementPricingWrapper apw:lstProductData){
             if(apw.productCode=='SL9040'&&apw.discount>10){
                 error=true;
             }
             
         }
    		
   System.debug(error+'error');
            return error;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getObjectNameById(Id recordId) {
        // Use the getSObjectType method to retrieve the object type from the record ID
        String objectName = String.valueOf(recordId.getSObjectType());
        return objectName;
    }
    
    @AuraEnabled(cacheable=true)
    public static Boolean validateAgreementCreation(Id recordId) {
        Boolean hasAgreement= false;
        List<Aggrement__c> agrLst =[Select id,Opportunity__c from Aggrement__c where Opportunity__c =: recordId];
        if(agrLst.size()>0){
            hasAgreement = true;
            system.debug('hasAttribute true :: '+hasAgreement );
        }else{
            hasAgreement= false;
             system.debug('hasAttribute false :: '+hasAgreement );
        }
        return hasAgreement;
    }
    
     @AuraEnabled(cacheable=true)
    public static String getObjectMetaData() {
        // Use the getObjectMetaData method to retrieve the object from custom setting
       String objectApiName = [Select Object_API_Name__c from Pricing_Object_API__mdt limit 1].Object_API_Name__c;
        return objectApiName;
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
    public static List<Object> getAgreementCatalogData(String recId, String fieldsData, string objApi){
        
       List<String> filterproducts = getFilterProducts(recId);
      
        system.debug('Selected fieldsData catalog ::: '+fieldsData);
        system.debug('Selected recId catalog ::: '+recId);
         system.debug('Selected objApi catalog ::: '+objApi);
        String selectedPriceList = '';
        Id priceListId;
        Integer i=1;
        Id selectedAgrId = recId;
        //System.debug('Size of lstEntryFormWrap 797 : ' + (Aggrement__c)JSON.deserialize(fieldsData, Aggrement__c.class));
		//Aggrement__c lstEntryFormWrap = (Aggrement__c)JSON.deserialize(fieldsData, Aggrement__c.class);
        List<Object> fieldList = (List<Object>) JSON.deserializeUntyped(fieldsData);
        Aggrement__c lstEntryFormWrap = new Aggrement__c();
        
        for (Object fieldObj : fieldList) {
            Map<String, Object> fieldMap = (Map<String, Object>) fieldObj;
            
            String fieldName = (String) fieldMap.get('fieldName');
            Object value = fieldMap.get('value');
            
            if (fieldName == 'Price_List__c') {
                lstEntryFormWrap.Price_List__c = (String) value;
            } else if (fieldName == 'Agreement_Start_Date__c') {
                lstEntryFormWrap.Agreement_Start_Date__c = Date.valueOf((String) value);
            } else if (fieldName == 'Agreement_End_Date__c') {
                lstEntryFormWrap.Agreement_End_Date__c = Date.valueOf((String) value);
            } else if (fieldName == 'Account__c') {
                lstEntryFormWrap.Account__c = (String) value;
            }
        }
        System.debug('Deserialized Aggrement__c: ' + lstEntryFormWrap);
        if(lstEntryFormWrap.Price_List__c != Null){
                selectedPriceList = lstEntryFormWrap.Price_List__c;
         }
        system.debug('Selected Price catalog ::: '+selectedPriceList);
        
        List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Price_List_Item__c> pricelist = new List<Price_List_Item__c>();
        if (selectedPriceList != null) {
            try {
                 Pattern idPattern = Pattern.compile('^[a-zA-Z0-9]{15,18}$'); 
           		 Matcher idMatcher = idPattern.matcher(selectedPriceList);
                if (idMatcher.matches() && selectedPriceList.toUpperCase() == selectedPriceList) {
                   
                    String query = 'SELECT Id, Name FROM ' + objApi + ' WHERE Id = :selectedPriceList';
                    system.debug('Selected Price catalog query by ID ::: ' + query);
                    List<SObject> results = Database.query(query);
                    system.debug('Selected Price catalog results by ID ::: ' + results);
    
                    if (!results.isEmpty()) {
                        priceListId = (Id) results[0].get('Id');
                    }
                } else {
                    
                    String query = 'SELECT Id, Name FROM ' + objApi + ' WHERE Name = :selectedPriceList';
                    system.debug('Selected Price catalog query by Name ::: ' + query);
                    List<SObject> results = Database.query(query);
                    system.debug('Selected Price catalog results by Name ::: ' + results);
                    
                    if (!results.isEmpty()) {
                        priceListId = (Id) results[0].get('Id');
                    }
                }
               /* String query = 'SELECT Id,Name FROM ' + objApi + ' WHERE Id = \'' + selectedPriceList + '\'';
				// String query = 'SELECT Id FROM ' + objApi + ' WHERE Name = :selectedPriceList';
                system.debug('Selected Price catalog query 613 ::: '+query);
				List<SObject> results = Database.query(query);	
                system.debug('Selected Price catalog 614 ::: '+results);
                priceListId = (Id) results[0].get('Id');
                 system.debug('Selected Price catalog pricelistId ::: '+pricelistId);
               // Price_List__c pricList = [SELECT Id FROM Price_List__c WHERE Name = :selectedPriceList];
               // priceListId = pricList.Id;*/
            } catch (QueryException e) {
                priceListId = selectedPriceList;
            }
        }
        system.debug('PriceList catalog ::: '+priceListId);
        if(priceListId != null){
            if(!filterproducts.isEmpty()){
               pricelist=[Select Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:priceListId and Product_Name__r.Name NOT IN :filterProducts ]; 
            }else{
                pricelist=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:priceListId];
            }
             
        }
        Set<String> uniqueProductNames = new Set<String>();
		List<Price_List_Item__c> uniquePricelist = new List<Price_List_Item__c>();
        for (Price_List_Item__c item : pricelist) {
            // Check uniqueness based on a field, e.g., Product_Name__r.Name
            if (!uniqueProductNames.contains(item.Product_Name__r.Name)) {
                uniqueProductNames.add(item.Product_Name__r.Name);
                uniquePricelist.add(item);
            }
        }
         system.debug('Pricelist products ::: '+pricelist);
         system.debug('Pricelist count ::: '+pricelist.size());
        for(Price_List_Item__c pr :uniquePricelist){
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
    
    public static List<String> getFilterProducts(String recId){
        List<String> objectList = new List<String>();
        if (String.isBlank(recId) || recId.length() < 3) {
            throw new IllegalArgumentException('Invalid record ID');
        }
        String prefix = recId.substring(0, 3);

        String effCountry = '';
        switch on prefix {
            when 'a02' { // Agreement
                effCountry = [
                    SELECT Account__c, Account__r.Effective_Country__c 
                    FROM Aggrement__c 
                    WHERE Id = :recId
                ].Account__r.Effective_Country__c;
            }
            when '006' { // Opportunity
                effCountry = [
                    SELECT AccountId, Account.Effective_Country__c 
                    FROM Opportunity 
                    WHERE Id = :recId
                ].Account.Effective_Country__c;
            }
        }

       // String effCountry = [Select Id,Account__c,Account__r.Effective_Country__c from Aggrement__c where Id =: recId].Account__r.Effective_Country__c;
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
    
     @AuraEnabled(cacheable=true)
     public static List<Object> getAgreementFastData(String recId,String productId, String fieldsData,string objApi){
      	List<String> filterproducts = getFilterProducts(recId);
        System.debug('Fast filter prodcts 713 ::: ' + filterproducts);
        String selectedPriceList = '';
        Id priceListId;
        Id selectedAgrId = recId;
        Integer i=1;
		//Aggrement__c lstEntryFormWrap = (Aggrement__c)JSON.deserialize(fieldsData, Aggrement__c.class);
		 List<Object> fieldList = (List<Object>) JSON.deserializeUntyped(fieldsData);
        Aggrement__c lstEntryFormWrap = new Aggrement__c();
        
        for (Object fieldObj : fieldList) {
            Map<String, Object> fieldMap = (Map<String, Object>) fieldObj;
            
            String fieldName = (String) fieldMap.get('fieldName');
            Object value = fieldMap.get('value');
            
            if (fieldName == 'Price_List__c') {
                lstEntryFormWrap.Price_List__c = (String) value;
            } else if (fieldName == 'Agreement_Start_Date__c') {
                lstEntryFormWrap.Agreement_Start_Date__c = Date.valueOf((String) value);
            } else if (fieldName == 'Agreement_End_Date__c') {
                lstEntryFormWrap.Agreement_End_Date__c = Date.valueOf((String) value);
            } else if (fieldName == 'Account__c') {
                lstEntryFormWrap.Account__c = (String) value;
            }
        }
       	System.debug('Size of lstEntryFormWrap: ' + lstEntryFormWrap);
        if(lstEntryFormWrap.Price_List__c != Null){
            selectedPriceList = lstEntryFormWrap.Price_List__c;
        }
        List<AgreementProductWrapper> agreProductWrapper = new List<AgreementProductWrapper>();
        List<Price_List_Item__c> pricelist = new List<Price_List_Item__c>();
        if (selectedPriceList != null) {
            try {
                 Pattern idPattern = Pattern.compile('^[a-zA-Z0-9]{15,18}$'); 
           		 Matcher idMatcher = idPattern.matcher(selectedPriceList);
                if (idMatcher.matches() && selectedPriceList.toUpperCase() == selectedPriceList) {
                   
                    String query = 'SELECT Id, Name FROM ' + objApi + ' WHERE Id = :selectedPriceList';
                    system.debug('Selected Price fast query by ID ::: ' + query);
                    List<SObject> results = Database.query(query);
                    system.debug('Selected Price fast results by ID ::: ' + results);
    
                    if (!results.isEmpty()) {
                        priceListId = (Id) results[0].get('Id');
                    }
                } else {
                    
                    String query = 'SELECT Id, Name FROM ' + objApi + ' WHERE Name = :selectedPriceList';
                    system.debug('Selected Price fast query by Name ::: ' + query);
                    List<SObject> results = Database.query(query);
                    system.debug('Selected Price fast results by Name ::: ' + results);
                    
                    if (!results.isEmpty()) {
                        priceListId = (Id) results[0].get('Id');
                    }
                }
              /*  String query = 'SELECT Id,Name FROM ' + objApi + ' WHERE Name = \'' + selectedPriceList + '\'';
                List<SObject> results = Database.query(query);	
                system.debug('Selected Price fast 667 ::: '+results);
                priceListId = (Id) results[0].get('Id');
                system.debug('Selected priceListId fast 669 ::: '+priceListId);*/
               // Price_List__c pricList = [SELECT Id FROM Price_List__c WHERE Name = :selectedPriceList];
               // priceListId = pricList.Id;
            } catch (QueryException e) {
                priceListId = selectedPriceList;
                 system.debug('Selected Price fast priceListId 688 ::: '+priceListId);
            }
        }
        system.debug('PriceList catalog ::: '+priceListId);
        if(priceListId != null){
            if(!filterproducts.isEmpty()){
                 pricelist=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:priceListId And  Product_Name__r.Name NOT IN :filterProducts And Product_Name__c =:productId]; 
                system.debug(' Price list iem with filterprods 767 ::: '+pricelist);
            }else{
            pricelist=[Select Id,Product_Name__r.Name,Product_Name__r.Family,Product_Name__r.ProductCode,Price_List__c,Product_Name__c,List_Price__c
                                            from Price_List_Item__c
                                            where  Price_List__c =:priceListId and Product_Name__c =:productId]; 
                system.debug(' Price list iem without filterprods773 ::: '+pricelist);
            }
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
    
    public List<Object> getButtonData(String compName){
        return [Select id,Button_Label__c,Component_Name__c,Hide_Button__c from Agreement_Button_Configuration__mdt where Component_Name__c =: compName  WITH SECURITY_ENFORCED];
    }
    
     public List<Object> getSignatureSection(String compName){
        return [Select id,Section_Name__c,Component_Name__c,Hide_Section__c,Label  from Agreement_Signature_Configuration__mdt where Component_Name__c =: compName  WITH SECURITY_ENFORCED];
    }

    /* public List<SObjectQueryResult> getSignatoryDetails(String objectName,
                                                String fieldAPINames,
                                                String filterFieldAPIName,
                                                String strInput,String recId){
        // List<Agreement_Contacts__c> signatoryList =[SELECT Id,Name,Aggreement__c,Contact__r.Name FROM Agreement_Contacts__c where Aggreement__c =: recId];
        // return signatoryList;

         
        List<SObjectQueryResult> lstReturnResult = new List<SObjectQueryResult>();
        if(strInput.equals('*')){
            strInput = '';
        }
        String str = strInput + '%';
        String strQueryField = '';
        List<String> fieldList = fieldAPINames.split(',');
        
        //check if Id is already been passed
        if(!fieldList.contains('Id')){
            fieldList.add('Id');
            strQueryField = String.join(fieldList, ',');
        }else {
            strQueryField = fieldAPINames;
        }
        
       String strQuery = 'SELECT ' + String.escapeSingleQuotes(strQueryField) 
                        + ' FROM ' 
                        + String.escapeSingleQuotes(objectName) 
                        + ' WHERE Aggreement__c = :recId AND ' + filterFieldAPIName + ' LIKE :str'
                        + ' ORDER BY ' + filterFieldAPIName
                        + ' LIMIT 50';
        
        System.debug('strQuery=' + strQuery);
        
        List<SObject> lstResult = database.query(strQuery);
        //create list of records that can be easily be parsable at js controller.
        for(String strField:fieldList){
            for(SObject sobj:lstResult){                
                if(strField != 'Id'){
                    SObjectQueryResult result = new SObjectQueryResult();
                    result.recordId = (String) sobj.get('Id');
                    result.recordName = (String) sobj.get(strField);
                    //result.conName = (String) sobj.get(filterFieldAPIName);
                    lstReturnResult.add(result);
                }                
            }
        }
         System.debug('lstReturnResult = :: ' + lstReturnResult);
        return lstReturnResult;
     }
    */
    public List<SObjectQueryResult> getSignatoryDetails(String objectName,
                                                    String fieldAPINames,
                                                    String filterFieldAPIName,
                                                    String strInput,
                                                    String recId) {

    System.debug('getSignatoryDetails called with: objectName=' + objectName +
                 ', fieldAPINames=' + fieldAPINames +
                 ', filterFieldAPIName=' + filterFieldAPIName +
                 ', strInput=' + strInput +
                 ', recId=' + recId);

    List<SObjectQueryResult> lstReturnResult = new List<SObjectQueryResult>();
    Set<String> processedIds = new Set<String>(); 
    
    if (strInput.equals('*')) {
        strInput = '';
    }
    String str = strInput + '%';
    String strQueryField = '';
    List<String> fieldList = fieldAPINames.split(',');
    
    if (!fieldList.contains('Id')) {
        fieldList.add('Id');
        strQueryField = String.join(fieldList, ',');
    } else {
        strQueryField = fieldAPINames;
    }

    if (!fieldList.contains(filterFieldAPIName)) {
        fieldList.add(filterFieldAPIName);
    }
    
    String strQuery = 'SELECT ' + String.escapeSingleQuotes(strQueryField) 
                    + ' FROM ' 
                    + String.escapeSingleQuotes(objectName) 
                    + ' WHERE Aggreement__c = :recId AND ' + filterFieldAPIName + ' LIKE :str'
                    + ' ORDER BY ' + filterFieldAPIName
                    + ' LIMIT 50';
    
    System.debug('Generated Query: ' + strQuery);
    
    List<SObject> lstResult = Database.query(strQuery);
    System.debug('Number of records returned: ' + lstResult);
    
    for (SObject sobj : lstResult) {
        String recordId = (String) sobj.get('Id');
         System.debug('recordId inside : ' + recordId);
    
        if (!processedIds.contains(recordId)) {
            processedIds.add(recordId);
             System.debug('recordId inside if con : ' + recordId);
            SObjectQueryResult result = new SObjectQueryResult();
            result.recordId = recordId;
            if (sobj.getSObject('Contact__r') != null) {
                result.recordName = (String) sobj.getSObject('Contact__r').get('Name');
            } else {
                result.recordName = 'No Contact Name'; // Fallback value
            }
            System.debug('result.recordName inside if con : ' + recordId);
            lstReturnResult.add(result);
        }
    }
    
    System.debug('Final lstReturnResult: ' + lstReturnResult);
    return lstReturnResult;
}



     @AuraEnabled
    public static List<ResultWrapper> fetchLookupRecords(String objectApiName, String fieldApiName,
       	String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId,String recId) {
        String pluginName = [SELECT Plugin__c,DeveloperName FROM Agreement_Request_Setting__mdt where DeveloperName ='AgreementRequest'].Plugin__c;
               
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

    public class SObjectQueryResult {
        @AuraEnabled
        public String recordId;
        
        @AuraEnabled
        public String recordName;

        @AuraEnabled
        public String conName;
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
        public String productCode { get; set; }
        
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