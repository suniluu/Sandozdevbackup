public class FieldSetController {
    @AuraEnabled
    public static FieldSetForm getForm(String objectName, String fieldSetName) {
        FieldSetForm form = new FieldSetForm();        
        form.Fields = getFields(objectName, fieldSetName);
        
        return form;
    }
    
    private static List<FormField> getFields(String objectName, String fieldSetName) {
        Schema.SObjectType objectType = null;
        fieldSetName = 'US_'+fieldSetName;
        List<FormField> fields = new List<FormField>();
        if (String.isNotBlank(objectName)) {
            objectType = Schema.getGlobalDescribe().get(objectName);
            Schema.DescribeSObjectResult objectDescribe = objectType.getDescribe();
            Map<String, Schema.FieldSet> fieldSetMap = objectDescribe.fieldSets.getMap();
            Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
            List<Schema.FieldSetMember> fieldSetMembers = fieldSet.getFields();
            for (Schema.FieldSetMember fsm : fieldSetMembers) {
                FormField f = new FormField(fsm);
                fields.add(f);
            }
        }
        return fields;
    }
    
    public class FieldSetForm {
        @AuraEnabled
        public List<FormField> Fields { get; set; }
        
        public FieldSetForm() {
            Fields = new List<FormField>();
        }
    }
}