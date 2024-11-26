public inherited sharing class OrderRequestAddToCart {
	
    public class CEServiceException extends exception {
    }
    
    @AuraEnabled
    public static Object addProductsToCart(String orderData, String orderId){
		Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        System.debug(orderData);
        List<Object> lstOrderData = (List<Object>) JSON.deserializeUntyped(orderData);
        System.debug(lstOrderData);
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.fastOrderAddToCart(lstOrderData, orderId);
            } catch(Exception e){
                system.debug('Error in creating order');
            }
        }
        return lstrecord;
        
    }
    
    @AuraEnabled
    public static Object createConfiguration(String orderId){
		Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.createConfiguration(orderId);
            } catch(Exception e){
                system.debug('Error in creating cart');
            }
        }
        return lstrecord;      
    }
    
    @AuraEnabled
    public static Object saveConfiguration(String orderId, List<Object> orderData, List<Object> productData){
        Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.saveConfiguration(orderId, orderData, productData);
            } catch(Exception e){
                system.debug('Error in creating cart');
            }
        }
        return lstrecord;      
    }    
    
    @AuraEnabled
    public static Object generateApprovalRequests(String orderId, String configId){
        Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
               lstrecord = customPlugin.generateApprovalRequests(orderId,configId);
            } catch(Exception e){
                system.debug('Error in generating approvals');
            }
        }
        return lstrecord;       
    }

    @AuraEnabled
    public static Boolean createConfigLineItems(String configId, String productData){
        Boolean lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        System.debug(productData);
        List<Object> lstProductData = (List<Object>) JSON.deserializeUntyped(productData);
        System.debug(lstProductData);
        if(customPlugin != null){
            try{
                lstrecord = customPlugin.createConfigLineItems(configId,lstProductData);
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;        
    }    
    
    @AuraEnabled
    public static Object finalizeCart(String configId){
		Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
               lstrecord = customPlugin.finalizeCart(configId);
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;
        
    }

    @AuraEnabled
    public static Object saveCart(String configId){
		Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
               lstrecord = customPlugin.saveCart(configId);
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;
        
    }
    
    @AuraEnabled
    public static Object createOrderLineItems(String orderId, String configId){
		Object lstrecord;
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
               lstrecord = customPlugin.createOrderLineItems(orderId, configId);
            } catch(Exception e){
                system.debug('Error in adding products to cart');
            }
        }
        return lstrecord;        
    }
    
    @AuraEnabled
    public static void saveProductConfiguration(String orderData, String productData){
        IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        System.debug(orderData);
        System.debug(productData);
        List<Object> lstOrderData = (List<Object>) JSON.deserializeUntyped(orderData);
        List<Object> lstProductData = (List<Object>) JSON.deserializeUntyped(productData);
        System.debug(lstOrderData);
        System.debug(lstProductData);
        if(customPlugin != null){
            try{
                customPlugin.saveProductConfiguration(lstOrderData,lstProductData);
            } catch(Exception e){
                system.debug('Error in saving the cart');
            }
        }
    }

    @AuraEnabled
    public static void deleteCartConfiguration(String recId){
    	IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        if(customPlugin != null){
            try{
            	customPlugin.deleteCartConfiguration(recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }    
    }
    
    @AuraEnabled
    public static void contractedProductsAddToCart(String recId,String scopeObjectLst){
    	IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        List<Object> lstRecordData = (List<Object>) JSON.deserializeUntyped(scopeObjectLst);
        if(customPlugin != null){
            try{
            	customPlugin.contractedProductsAddToCart(recId,lstRecordData);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
    }
    
    @AuraEnabled
    public static void reorderAddToCart(String recId,String scopeObjectLst){
    	IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        List<Object> lstRecordData = (List<Object>) JSON.deserializeUntyped(scopeObjectLst);
        if(customPlugin != null){
            try{
            	customPlugin.reorderAddToCart(recId,lstRecordData);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
    }
    
    @AuraEnabled
    public static String backToCart(String recId){
    	IGenerateReqestOrder customPlugin = getCerPluginInstance('OrderEntry');
        String returnURL = '';
        if(customPlugin != null){
            try{
            	returnURL = customPlugin.onBackToCart(recId);
            } catch(Exception e){
                customPlugin.errorHandleling(recId,e);
            }
        }
        return returnURL;
    }
    
    public static IGenerateReqestOrder getCerPluginInstance(String controllerName){
        IGenerateReqestOrder pluginHandler;      
        if(CustomMetadataService.contractSetting(controllerName) != null && CustomMetadataService.contractSetting(controllerName).plugin__c != null && CustomMetadataService.contractSetting(controllerName).plugin__c != ''){
            try{
                Type plugin = Type.forName(CustomMetadataService.contractSetting(controllerName).plugin__c);            
                pluginHandler = (IGenerateReqestOrder) plugin.newInstance();  
            }
            catch(NullPointerException ex){
                throw new CEServiceException('Plugin is not Configured/Defined as Expected');
            }     
        }
        return pluginHandler;
    }
}