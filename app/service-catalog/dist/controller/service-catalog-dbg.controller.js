sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, Filter, FilterOperator, MessageToast, MessageBox) => {
    "use strict";
    const FORM_GROUP = "serviceForm";
    return Controller.extend("servicecatalog.controller.service-catalog", {
        onInit() {

        },
        onFilter() {
            const aFilters = [];

            const sQuery = this.byId("searchField").getValue().trim();
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, sQuery),
                        new Filter("plan", FilterOperator.Contains, sQuery),
                        new Filter("techFeature", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            const sStatus = this.byId("statusFilter").getSelectedKey();
            if (sStatus === "active") {
                aFilters.push(new Filter("status", FilterOperator.EQ, true));
            } else if (sStatus === "inactive") {
                aFilters.push(new Filter("status", FilterOperator.EQ, false));
            }

            this.byId("servicesTable").getBinding("items").filter(aFilters);
        },

        onClearFilters() {
            this.byId("searchField").setValue("");
            this.byId("statusFilter").setSelectedKey("all");
            this.byId("nameFilter").setSelectedKey("all");
            this.byId("servicesTable").getBinding("items").filter([]);
        },

        async _openServiceDialog(sTitle, sButtonText) {
            if (!this.byId("serviceDialog")) {
                await this.loadFragment({ name: "servicecatalog.view.ServiceDialog" });
            }
            const oDialog = this.byId("serviceDialog");
            oDialog.setTitle(sTitle);
            oDialog.getBeginButton().setText(sButtonText);
            return oDialog;
        },
        async onAddService() {
            const oDialog = await this._openServiceDialog("Add Service", "Add");
            const oList = this.byId("servicesTable").getBinding("items");
            this._oCtx = oList.create({ status: true, currency_code: "USD" }, true);
            this._bCreate = true;
            oDialog.setBindingContext(this._oCtx);
            oDialog.open();
        },

        async onEditService(oEvent) {
            const oDialog = await this._openServiceDialog("Edit Service", "Save");
            this._oCtx = oEvent.getSource().getBindingContext();   // the row's Services entity
            this._bCreate = false;
            oDialog.setBindingContext(this._oCtx);
            oDialog.open();
        },

        async onDialogSave() {
            const oCtx = this._oCtx;
            if (!oCtx.getProperty("name") || !oCtx.getProperty("plan")) {
                MessageToast.show("Service Name and Plan Coverage are required.");
                return;
            }
            const oModel = this.getView().getModel();
            await oModel.submitBatch(FORM_GROUP);

            if (oCtx.isTransient() || oModel.hasPendingChanges(FORM_GROUP)) {
                MessageBox.error("Could not save. Please check your input.");
                return;
            }
            MessageBox.success(this._bCreate ? "New Service created." : "Service updated.");
            this.byId("serviceDialog").close();
            this._oCtx = null;
        },

        onDialogCancel() {
            const oModel = this.getView().getModel();
            if (this._bCreate && this._oCtx.isTransient()) {
                this._oCtx.delete(FORM_GROUP);        // drop the pending new row
            } else {
                oModel.resetChanges(FORM_GROUP);      // revert the edits made by two-way binding
            }
            this.byId("serviceDialog").close();
            this._oCtx = null;
        },

        onDeleteService(oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            const oModel = this.getView().getModel();

            MessageBox.confirm(`Delete service "${oCtx.getProperty("name")}"?`, {
                title: "Confirm Deletion",
                onClose: async (sAction) => {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }
                    const pDelete = oCtx.delete(FORM_GROUP);   // marks row for deletion (deferred)
                    oModel.submitBatch(FORM_GROUP);            // send it
                    try {
                        await pDelete;
                        MessageBox.success("Service deleted.");
                    } catch (e) {
                        MessageBox.error("Could not delete the service.");
                    }
                }
            });
        },

        onUpload() {
            MessageToast.show("Upload - coming in a later step");
        }
    });
});