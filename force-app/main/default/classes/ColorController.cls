public with sharing class ColorController {
    @AuraEnabled
    public static Id createAccount(String accountName) {
        Account acc = new Account(Name = accountName);
        insert acc;
        return acc.Id;
    }

    @AuraEnabled
    public static Id createContact(String contactName, Id accountId) {
        Contact con = new Contact(LastName = contactName, AccountId = accountId);
        insert con;
        return con.Id;
    }

    @AuraEnabled
    public static Id createLead(String leadName) {
        Lead ld = new Lead(LastName = leadName, Company = 'New Company');
        insert ld;
        return ld.Id;
    }

    @AuraEnabled
    public static Id createOpportunity(String opportunityName, Id accountId, Id contactId) {
        Opportunity opp = new Opportunity(Name = opportunityName, AccountId = accountId, StageName = 'Prospecting', CloseDate = Date.today().addDays(30));
        insert opp;
        return opp.Id;
    }
}