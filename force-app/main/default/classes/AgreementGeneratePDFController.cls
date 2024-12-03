public with sharing class AgreementGeneratePDFController {
    
    @AuraEnabled
    public static Id generatePDFAndSave(Id recordId) {

        PageReference pdfPage = Page.DocumentTemplate;
        pdfPage.getParameters().put('id', recordId);
        
        Blob pdfBlob = pdfPage.getContentAsPDF();

        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Contract PDF';
        contentVersion.PathOnClient = 'Contract.pdf';
        contentVersion.VersionData = pdfBlob;
        contentVersion.FirstPublishLocationId = recordId;
        insert contentVersion;
        
        return contentVersion.Id;
    }
}