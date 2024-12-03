public with sharing class ReusableLookupSearch {

    @AuraEnabled
    public static List<ResultWrapper> fetchRecords(String objectApiName, String fieldApiName,
            String otherFieldApiName, String searchString, String selectedRecordId, String pricelistId) {

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
                    String queryPriceListItem = String.escapeSingleQuotes(objQuery.Query__c) +' = \'' + String.escapeSingleQuotes(pricelistId) + '\'';
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

   
}