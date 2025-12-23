sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("customviewbookshop.controller.View1", {

        onInit: function () {
            this.byId("addBookPanel").setVisible(false);
            this.byId("viewDetailsPanel").setVisible(false);
        },

        /* ================= ADD BOOK ================= */

        submit: function () {
            var oView = this.getView();
            var oModel = oView.getModel();

            var oContext = oModel.bindList("/Books").create({
                title: oView.byId("title").getValue(),
                author: oView.byId("author").getValue(),
                price: parseInt(oView.byId("price").getValue(), 10),
                stock: parseInt(oView.byId("stock").getValue(), 10),
                location: oView.byId("location").getValue(),
                genre: oView.byId("genre").getValue()
            });

            oContext.created().then(() => {
                MessageBox.success("Book Added Successfully");

                ["title", "author", "price", "stock", "location", "genre"]
                    .forEach(id => oView.byId(id).setValue(""));
            }).catch(err => {
                MessageBox.error("Error adding book");
                console.error(err);
            });
        },

        /* ================= NAVIGATION ================= */

        onAddBookPressed: function () {
            this.hideAllPanels();
            this.byId("addBookPanel").setVisible(true);
        },

        onViewDetailsBookPressed: function () {
            this.hideAllPanels();

            var oTable = this.byId("booksTable");
            if (oTable) {
                oTable.getBinding("items").refresh();
            }

            this.byId("viewDetailsPanel").setVisible(true);
        },

        hideAllPanels: function () {
            this.byId("addBookPanel").setVisible(false);
            this.byId("viewDetailsPanel").setVisible(false);
        },

        onCollapseExpandPress: function () {
            var oSideNavigation = this.byId("sideNavigation");
            oSideNavigation.setExpanded(!oSideNavigation.getExpanded());
        },

        /* ================= ACTION COLUMN ================= */

        onActionPressed: function (oEvent) {
            this._oSelectedContext = oEvent
                .getSource()
                .getParent()
                .getBindingContext();

            if (!this._oActionSheet) {
                this._oActionSheet = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "customviewbookshop.view.ActionSheet",
                    this
                );
                this.getView().addDependent(this._oActionSheet);
            }

            this._oActionSheet.openBy(oEvent.getSource());
        },

        onViewPress: function () {
            var oBook = this._oSelectedContext.getObject();

            MessageBox.information(
                "Title: " + oBook.title + "\n" +
                "Author: " + oBook.author + "\n" +
                "Price: " + oBook.price + "\n" +
                "Stock: " + oBook.stock + "\n" +
                "Location: " + oBook.location + "\n" +
                "Genre: " + oBook.genre
            );
        },

        onDeletePress: function () {
            var oContext = this._oSelectedContext;

            MessageBox.confirm("Are you sure you want to delete this book?", {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        oContext.delete().then(() => {
                            MessageBox.success("Book deleted successfully");
                            this.byId("booksTable")
                                .getBinding("items")
                                .refresh();
                        });
                    }
                }
            });
        },

        /* ================= FETCH SALES ORDER (VIDEO STYLE) ================= */
        onFetchSalesOrderData: async function () {
            try {
                const oModel = this.getView().getModel();

                const oInput = new sap.m.Input({
                    placeholder: "Sales Order",
                    width: "100%"
                });

                const oLabel = new sap.m.Label({
                    text: "Enter the Sales Order Number",
                    labelFor: oInput
                });

                const oDialog = new sap.m.Dialog({
                    title: "Sales Order",
                    content: [oLabel, oInput],
                    beginButton: new sap.m.Button({
                        text: "Submit",
                        type: "Emphasized",
                       press: async () => {
    const sOrderID = oInput.getValue();

    if (!sOrderID) {
        sap.m.MessageBox.warning("Please enter Sales Order Number");
        return;
    }

    try {
        const oFunction = oModel.bindContext("/readInvoiceNumber(...)");
        oFunction.setParameter("salesOrderID", sOrderID);

        await oFunction.execute();

        const oResponse = oFunction.getBoundContext().getObject();

        if (oResponse && oResponse.value && oResponse.value.length > 0) {
            const oItem = oResponse.value[0];

            const sText =
                "Sales Order: " + oItem.SalesOrder + "\n" +
                "Sales Order Item: " + oItem.SalesOrderItem + "\n" +
                "Requested Quantity: " + oItem.RequestedQuantity;

            // ✅ CORRECT MessageBox usage
            sap.m.MessageBox.information(
                sText,
                { title: "Sales Order Details" }
            );
        } else {
            sap.m.MessageBox.information("No data found");
        }

        oDialog.close();

    } catch (err) {
        console.error(err);
        sap.m.MessageBox.error("Error fetching Sales Order data");
    }
}

                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: () => oDialog.close()
                    }),
                    afterClose: () => oDialog.destroy()
                });

                oDialog.open();

            } catch (err) {
                console.error(err);
                sap.m.MessageBox.error("Failed to fetch Sales Order data");
            }
        }


    });
});
