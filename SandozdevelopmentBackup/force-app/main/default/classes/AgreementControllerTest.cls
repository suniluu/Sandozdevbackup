@isTest
private class AgreementControllerTest {
	
    @isTest
    static void testAgreements() {
    	Contact testContact = new Contact();
        testContact.lastname='Test';
        insert testContact;
        
        Test.startTest();
        AgreementController.getCompanyLocations(testContact.Id);
        AgreementController.getAgreementHomePageFieldSet('Account');
        AgreementController.getAgreementSummaryPageFieldSet('Account');
        AgreementController.updateAgreementData(testContact.Id,'[]');
        AgreementController.updateAgreementLineItemData(testContact.Id,'[]');
        List<Object> lstProducts = AgreementController.getProductsData(testContact.Id);
        AgreementController.updateProductsData(testContact.Id,'[]','[]');
        AgreementController.getTabs();
        AgreementController.getQuery('Tabs_Query');
        AgreementController.getColumns('Pricing_Table');
        AgreementController.getAgreementCatalog(testContact.Id, '[]');
        AgreementController.getAgreementFastRecords(testContact.Id,'[]','');
        AgreementController.getAgreementFamilyProds('');
        AgreementController.saveFile('Test1,Test2',testContact.id,'');
        AgreementController.fetchVolumeRange(testContact.Id,'','');
        AgreementController.getexistinglineitems(testContact.Id);
        
        System.assertNotEquals(null, lstProducts, 'List of records should not be null');
        
        Test.stopTest();
    }
}