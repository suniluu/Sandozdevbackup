public class DocumentAgreementlineItemController {
    public Aggrement__c agreement { get; set; }
    public List<Agreement_Line_Item__c> lineItems { get; set; }
    public List<Agreement_Contacts__c> signatories { get; set; }
    public Template__c template { get; set; }

    public DocumentAgreementlineItemController(ApexPages.StandardController controller) {
        Id agreementId = controller.getId();
        system.debug('agreementId'+agreementId);
        agreement = [SELECT Id, Name FROM Aggrement__c WHERE Id = :agreementId LIMIT 1];

        lineItems = [SELECT Id,Aggreement__r.Name,Product__r.name, Product_Code__c, List_Price__c FROM Agreement_Line_Item__c WHERE Aggreement__c = :agreementId];
        
        signatories = [SELECT Id,Name,Contact__r.name,Contact__r.Title, Contact__r.email, Role__c, Is_Primary_Contact__c, Aggreement__c from Agreement_Contacts__c where Role__c ='Signatory' and Aggreement__c = :agreementId];

        String templateId = ApexPages.currentPage().getParameters().get('templateId');
        system.debug('templateId****'+templateId);
        if (templateId != null) {
            template = [SELECT Id, Name, Long_Text_Area_1__c, Long_Text_Area_2__c FROM Template__c WHERE Id = :templateId LIMIT 1];
        }
    
    }
}