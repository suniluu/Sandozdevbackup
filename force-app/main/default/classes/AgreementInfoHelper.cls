public with sharing class AgreementInfoHelper {
    @AuraEnabled(cacheable=true)
    public static String getObjectNameById(Id recordId) {
        // Use the getSObjectType method to retrieve the object type from the record ID
        String objectName = String.valueOf(recordId.getSObjectType());
        return objectName;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getFieldSetFields(String objectName, String fieldSetName) {
        SObjectType objectType = Schema.getGlobalDescribe().get(objectName);
        DescribeSObjectResult describeResult = objectType.getDescribe();
        FieldSet fs = describeResult.FieldSets.getMap().get(fieldSetName);
        
        List<String> fieldNames = new List<String>();
        for (Schema.FieldSetMember fsm : fs.getFields()) {
            fieldNames.add(fsm.getFieldPath());
        }
        
        return fieldNames;
    }
}