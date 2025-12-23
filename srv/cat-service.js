const { entitySerializer } = require('@sap-cloud-sdk/generator')
module.exports = (srv) => {

  srv.on('readInvoiceNumber', async (req) => {

    const salesOrderID = String(req.data.salesOrderID).padStart(10, '0');

    const { apiSalesOrderSrv } = require('../srv/generated/API_SALES_ORDER_SRV');
    const { salesOrderItemApi } = apiSalesOrderSrv();

    const sdkDest = {
      url: 'https://sandbox.api.sap.com/s4hanacloud',
      headers: {
        apikey: '026haFAFErgJV49jVzwd46jaeXXRn0yk'
      }
    };

    try {
      const result = await salesOrderItemApi
        .requestBuilder()
        .getAll()
        .select(
          salesOrderItemApi.schema.SALES_ORDER,
          salesOrderItemApi.schema.SALES_ORDER_ITEM,
          salesOrderItemApi.schema.REQUESTED_QUANTITY,
          
          
        )
        .filter(
          salesOrderItemApi.schema.SALES_ORDER.equals(salesOrderID)
        )
        .execute(sdkDest);

      console.log('S/4 result:', result);

      // ✅ MAP EXACTLY TO CDS RETURN TYPE
      return result.map(item => ({
        SalesOrder: item.salesOrder,
        SalesOrderItem: item.salesOrderItem,
        RequestedQuantity: item.requestedQuantity
        
      }));

    } catch (err) {
      console.error('S/4 Error:', err.rootCause?.response?.data);
      return [];
    }
  });
};


