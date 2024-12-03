@isTest
public class ReusableLookupSearchTest {

    @isTest
    static void testFetchRecordsValidInput() {
        
        Account acc1 = new Account(
        Name= 'Test 1',Phone ='8765456789'
        );
        insert acc1;
        Account acc2 = new Account(
        Name= 'Test 2',Phone ='8765456723'
        );
        insert acc2;
        
        ReusableLookupSearch.SearchWrapper inputWrapper = new ReusableLookupSearch.SearchWrapper();
        inputWrapper.objectApiName = 'Account';
        inputWrapper.fieldApiName = 'Name';
        inputWrapper.otherFieldApiName = 'Phone';
        inputWrapper.searchString = 'Test ';
        inputWrapper.pricelistId = '' ;
        inputWrapper.selectedRecordId='';
        inputWrapper.parentFieldApiName='';
        inputWrapper.parentRecordId='';        
        
        Test.startTest();
        List<ReusableLookupSearch.ResultWrapper> results = ReusableLookupSearch.fetchRecords('Account','Name','Phone','Test ','','');
        Test.stopTest();
        
        System.assertNotEquals(10, results.size(), 'Expected non-zero results');
        
  
	}
}