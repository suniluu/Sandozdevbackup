public with sharing class GoogleMapController 
{
  
    @AuraEnabled(cacheable=true)
    public static List<Account> getCompanyLocations(String agrID){
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
   
}