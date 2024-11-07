sap.ui.define([
    "sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel"
],
function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("globalintakeform.controller.IntakeForm", {
        onInit: function () {
            var oModel = this.getOwnerComponent().getModel("jsonData");
            this.getView().setModel(oModel, "jsonModel");
            console.log(oModel);
        },
        onRequestTypeSelect: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey(); // Get the selected RequestType_ID
        
            // Step 2: Use OData v4 to fetch corresponding RequestConfigs based on RequestType_ID
            var oModel = this.getView().getModel(); // OData V4 model instance
            var oFilter = new sap.ui.model.Filter("requestType_ID", sap.ui.model.FilterOperator.EQ, sSelectedKey); // Filter for selected RequestType_ID
        
            // Bind the RequestConfigs entity to the list and apply the filter
            var oBindList = oModel.bindList("/RequestConfigs", undefined, undefined, [oFilter]);
        
            // Fetch and handle the contexts (data) based on the filter
            oBindList.requestContexts().then(function (aContexts) {
                var aFields = [];
        
                // Loop through the contexts and extract the data (attribute, isDisplay, isRequired)
                aContexts.forEach(function (oContext) {
                    var oObject = oContext.getObject(); // Get the object of each context
                    aFields.push(oObject); // Push each field object to the fields array
                });
        
                // Step 3: Update the form fields based on the fetched data
                this._updateFormFields(aFields);
            }.bind(this)).catch(function (oError) {
                console.error("Error fetching RequestConfigs: ", oError);
            });
        },
        
        // Step 3: Update the form fields dynamically based on the fetched data
        _updateFormFields: function (aFields) {
            console.log("Fetched Fields: ", aFields);
        
            // Get the form (VBox or container) by ID
            var oForm = this.byId("234dd");  // "234dd" is the ID of the form container you want to update
        
            // Clear previous fields (if any)
            oForm.removeAllContent(); 
        
            // Create new form content dynamically
            var formContent = [];
            aFields.forEach(function (oField) {
                var sFieldName = oField.attribute; // Get the field name (attribute)
                var bIsDisplay = oField.isDisplay; // Get visibility flag
                var bIsRequired = oField.isRequired; // Get required flag
        
                // Only create form fields where DISP is true
                if (bIsDisplay) {
                    formContent.push(new sap.m.Label({
                        text: sFieldName,  // Set label text
                        required: bIsRequired  // Set label as required
                    }));
        
                    formContent.push(new sap.m.Input({
                        placeholder: `Enter ${sFieldName}`,  // Set placeholder text
                        required: bIsRequired  // Set input as required
                    }));
                }
            });
        
            // Add the dynamically created form fields to the container
            formContent.forEach(function (content) {
                oForm.addContent(content);
            });
        },
        
    
        
        
        onPurGroupSelect: function (oEvent) {
            const selectedRequestType = oEvent.getSource().getSelectedKey(); // Get selected Req. Type from ComboBox
            const dataModel = this.getView().getModel("jsonModel"); // Access jsonModel
            const allFields = dataModel.getProperty("/data"); // Assuming data is under /data in jsonModel
        
            // Filter fields based on selected Req. Type
            const filteredFields = allFields.filter(item => item["Req. Type"] === selectedRequestType);
        
            // Dynamically create form fields for Step 2 based on DISP and REQ values
            const formContent = [];
            filteredFields.forEach(field => {
                if (field.DISP) { // Only display fields where DISP is true
                    formContent.push(new sap.m.Label({
                        text: field.Fields,
                        required: field.REQ // Set as required if REQ is true
                    }));
                    formContent.push(new sap.m.Input({ // Add input field for each field
                        placeholder: `Enter ${field.Fields}`,
                        required: field.REQ
                    }));
                }
            });
        
            // Get reference to the Step 2 form and update its content
            const form = this.byId("234dd");
            form.removeAllContent(); // Clear previous fields
            formContent.forEach(content => form.addContent(content)); // Add new content
        },
        
        onRequestTypeChange: function(oEvent) {
            var sSelectedKey = oEvent.getSource().getSelectedKey();
            var oView = this.getView();
            
            // Example logic: Show/hide fields based on selected key
            if (sSelectedKey === "specificKeyForBudget") {
                oView.byId("idBudget").setVisible(true);
                oView.byId("idFunding").setVisible(false);
                oView.byId("idCyberRiskLevel").setVisible(false);
            } else if (sSelectedKey === "specificKeyForFunding") {
                oView.byId("idBudget").setVisible(false);
                oView.byId("idFunding").setVisible(true);
                oView.byId("idCyberRiskLevel").setVisible(true);
            } else {
                // Default visibility for other options
                oView.byId("idBudget").setVisible(false);
                oView.byId("idFunding").setVisible(false);
                oView.byId("idCyberRiskLevel").setVisible(false);
            }
        },
        

        // Called when a selection is made in the ComboBoxes
        // onMaterialGroupSelect: function (oEvent) {
        //     this._checkWizardStep();
        // },

        // onPurGroupSelect: function (oEvent) {
        //     this._checkWizardStep();
        // },

        // This function checks the selections and determines which control to show in the next step
       // _checkWizardStep: function () {
            // var oView = this.getView();
            // var sMaterialGroup = oView.byId("materialgroupID").getSelectedKey();
            // var sPurGroup = oView.byId("idPurchaseGroup").getSelectedKey();

            // var oTable = oView.byId("stakeholderTable");
            // var oForm = oView.byId("234dd");

            // // // Logic: Show Table if both selections are MIG_03 and PG_03, otherwise show Form
            // // if (sMaterialGroup === "MTG_03" && sPurGroup === "PG_03") {
            // //     oTable.setVisible(true);
            // //     oForm.setVisible(false);
            // // } else {
            // //     oTable.setVisible(false);
            // //     oForm.setVisible(true);
            // // }
      //  },

        onComplete: function () {
            console.log("Submit button clicked")

            var screatedBy = this.byId("createdByid").getValue();
            var sRequestedFor = this.byId("RequestedforID").setSelectedKey();
            var sMaterialGroup = this.byId("materialgroupID").setSelectedKey();
            var sPurchaseGroup = this.byId("idPurchaseGroup").setSelectedKey();
            var senterprise = this.byId("enterpriseID").getValue();

            var sOrganizationUnit = this.byId("OrganizationUnitID").setSelectedKey();
            var sFor = this.byId("for").getValue();
            var sRequestType = this.byId("idRequestType").setSelectedKey();
            var sCommodityType = this.byId("idCommodity").setSelectedKey();
            var sBudget = this.byId("idBudget").setSelectedKey();

            var sProjectName = this.byId("ProjectName").getValue();
            var sFunding = this.byId("idFunding").setSelectedKey();
            var sProjectAmount = this.byId("projectAmount").getValue();
            var sDate = this.byId("Date").getValue();
            var sDateA = this.byId("DateA").getValue();

            console.log(sDate, sDateA)

            var sCyberrisklevel = this.byId("idCyberrisklevel").setSelectedKey();
            var sPotential = this.byId("idPotential").setSelectedKey();
            var sNERC = this.byId("idNERC").setSelectedKey();
            var sFRMApproval = this.byId("FRMApproval").getValue();
            var sPriority = this.byId("idPriority").setSelectedKey();

            var sEdisonRep = this.byId("EdisonRep").getValue();
            var sDetails = this.byId("Details").getValue();
            var sComments = this.byId("Comments").getValue();

            let oModel = this.getView().getModel();
            let oBindList = oModel.bindList("/Comments");

            oBindList.create({
                createdBy: screatedBy,
                requestedFor: sRequestedFor,
                materialGroup: sMaterialGroup,
                purchaseGroup: sPurchaseGroup,
                enterpriseProcurement: senterprise,

                enterpriseProcurementOrganizationUnit: sOrganizationUnit,
                stakeFor: sFor,
                requestType: sRequestType,
                commodityType: sCommodityType,
                budgetApproved: sBudget,

                projectName: sProjectName,
                typeOfFunding: sFunding,
                estimatedProjAmount: sProjectAmount,
                estimatedProjStartDate: sDate,
                estimatedProjEndDate: sDateA,

                cyberRiskLevel: sCyberrisklevel,
                potentialSupplier: sPotential,
                nercCIP: sNERC,
                frmApproval: sFRMApproval,
                priority: sPriority,

                edisonRep: sEdisonRep,
                provideProcReqDetails: sDetails,
                comments: sComments,




            });
        }
    });
    });

