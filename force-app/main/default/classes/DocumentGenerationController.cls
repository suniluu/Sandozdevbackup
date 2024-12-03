public with sharing class DocumentGenerationController {

    @AuraEnabled
    public static Id generatePDFAndSave(Id recordId,Id templateId) {

        Aggrement__c agreement = [SELECT Id, Name FROM Aggrement__c WHERE Id = :recordId LIMIT 1];
        PageReference pdfPage = Page.DocumentTemplate;
        pdfPage.getParameters().put('Id', recordId);
        pdfPage.getParameters().put('templateId', templateId);

        system.debug('templateId'+templateId+'recordId'+recordId);
        Blob pdfBlob = pdfPage.getContentAsPDF();

        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Contract PDF';
        contentVersion.PathOnClient = 'Contract.pdf';
        contentVersion.VersionData = pdfBlob;
        contentVersion.FirstPublishLocationId = recordId;
        insert contentVersion;
        
        return contentVersion.Id;
    }


    @AuraEnabled
    public static Blob previewPDFAndSave(Id recordId,Id templateId) {

        Aggrement__c agreement = [SELECT Id, Name FROM Aggrement__c WHERE Id = :recordId LIMIT 1];
        PageReference pdfPage = Page.DocumentTemplate;
        pdfPage.getParameters().put('Id', recordId);
        pdfPage.getParameters().put('templateId', templateId);

        system.debug('templateId'+templateId+'recordId'+recordId);
        Blob pdfBlob = pdfPage.getContentAsPDF();
        return pdfBlob;
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getTemplateOptions() {

        List<Template__c> templates = [SELECT Id, Name FROM Template__c];
        
        List<Map<String, String>> options = new List<Map<String, String>>();
        
        for (Template__c template : templates) {
            Map<String, String> option = new Map<String, String>();
            option.put('label', template.Name);  
            option.put('value', template.Id);  
            options.add(option);
        }

        return options;
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getClausesOptions() {

        List<Clause__c> clauses = [SELECT Id, Name FROM Clause__c];
        
        List<Map<String, String>> options = new List<Map<String, String>>();
        
        for (Clause__c clause : clauses) {
            Map<String, String> option = new Map<String, String>();
            option.put('label', clause.Name);  
            option.put('value', clause.Id);  
            options.add(option);
        }

        return options;
    }

}