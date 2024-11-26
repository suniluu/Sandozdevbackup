public with sharing class UtilityController {
    @AuraEnabled(cacheable=true)
	public static String getCurrencySymbol() {
        ConnectApi.OrganizationSettings  orgSettings = ConnectApi.Organization.getSettings();
        //system.debug(orgSettings.UserSettings.currencySymbol);
        //system.debug(orgSettings.features.defaultCurrencyIsoCode);
        return orgSettings.UserSettings.currencySymbol != null ? orgSettings.UserSettings.currencySymbol : UserInfo.getDefaultCurrency();
    }
}