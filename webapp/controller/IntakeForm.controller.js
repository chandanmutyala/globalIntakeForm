sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"
],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("globalintakeform.controller.IntakeForm", {
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel("jsonData");
                this.getView().setModel(oModel, "jsonModel");
                // Initialize array to store field IDs
                this._dynamicFieldIds = [];
            },

            onRequestTypeSelect: function (oEvent) {
                var oComboBox = oEvent.getSource();
                var sSelectedRequestType = oComboBox.getSelectedKey();
                var oModel = this.getView().getModel();
                var oFilter = new sap.ui.model.Filter("requestType_ID", sap.ui.model.FilterOperator.EQ, sSelectedRequestType);

                var oBindList = oModel.bindList("/RequestConfigs", undefined, undefined, [oFilter]);
                oBindList.requestContexts().then(function (aContexts) {
                    var aFields = [];
                    aContexts.forEach(function (oContext) {
                        var oObject = oContext.getObject();
                        aFields.push(oObject);
                    });
                    this._updateFormFields(aFields, sSelectedRequestType);
                }.bind(this)).catch(function (oError) {
                    console.error("Error fetching RequestConfigs: ", oError);
                });
            },

            _updateFormFields: function (aFields, sRequestType) {
                console.log("Fetched Fields: ", aFields);

                var oForm = this.byId("234dd");
                oForm.removeAllContent();

                // Clear existing field IDs
                this._dynamicFieldIds = [];

                const dropdownOptions = {
                    "TypeOfFunding": [
                        { key: "CAPITAL", text: "Capital" },
                        { key: "OM", text: "O & M" },
                        { key: "OTHER", text: "Other" }
                    ],
                    "BudgetApproved": [
                        { key: "YES", text: "Yes" },
                        { key: "NO", text: "No" },
                        { key: "NA", text: "N/A" }
                    ]
                };

                var formContent = [];
                var typeName = this.getView().byId("RequirementbcType").getValue();

                aFields.forEach(function (oField) {
                    var sFieldName = oField.attribute;
                    var bIsDisplay = oField.isDisplay;
                    var bIsRequired = oField.isRequired;

                    if (bIsDisplay) {
                        // Generate ID using the specified format
                        var sFieldId = `${typeName}${sFieldName}`.replace(/[^a-zA-Z0-9_]/g, "");
                        
                        // Store the field ID and original field name mapping
                        this._dynamicFieldIds.push({
                            id: sFieldId,
                            originalName: sFieldName
                        });

                        // Add Label
                        formContent.push(new sap.m.Label({
                            text: sFieldName,
                            required: bIsRequired
                        }));

                        // Add ComboBox or Input based on field type
                        if (dropdownOptions[sFieldName]) {
                            var oComboBox = new sap.m.ComboBox({
                                id: this.createId(sFieldId), // Use createId for proper view prefixing
                                required: bIsRequired,
                                placeholder: `Select ${sFieldName}`
                            });

                            dropdownOptions[sFieldName].forEach(function (option) {
                                oComboBox.addItem(new sap.ui.core.ListItem({
                                    key: option.key,
                                    text: option.text
                                }));
                            });

                            formContent.push(oComboBox);
                        } else {
                            formContent.push(new sap.m.Input({
                                id: this.createId(sFieldId), // Use createId for proper view prefixing
                                placeholder: `Enter ${sFieldName}`,
                                required: bIsRequired
                            }));
                        }
                    }
                }.bind(this));

                formContent.forEach(function (content) {
                    oForm.addContent(content);
                });

                // Log created field IDs for debugging
                console.log("Created field IDs:", this._dynamicFieldIds);
            },

            wizardCompletedHandler: function () {
                var oView = this.getView();
                var payload = [];
                console.log("Form submission initiated.");
                console.log("Dynamic field IDs: ", this._dynamicFieldIds);

                // Iterate through stored field IDs
                this._dynamicFieldIds.forEach(function (fieldInfo) {
                    console.log("Processing field ID: ", fieldInfo.id);
                    var oField = oView.byId(fieldInfo.id);

                    if (oField) {
                        console.log("Field found:", fieldInfo.id);
                        var fieldValue;

                        if (oField.isA("sap.m.ComboBox")) {
                            fieldValue = oField.getSelectedKey();
                            console.log("Field is ComboBox, selected key: ", fieldValue);
                        } else if (oField.isA("sap.m.Input")) {
                            fieldValue = oField.getValue();
                            console.log("Field is Input, entered value: ", fieldValue);
                        }

                        payload.push({
                            "fieldName": fieldInfo.originalName, // Use original field name
                            "fieldValue": fieldValue
                        });
                       
                    } else {
                        console.warn("Field not found for ID: ", fieldInfo.id);
                        
                        // Try finding the field without view prefix
                        var oFieldDirect = sap.ui.getCore().byId(fieldInfo.id);
                        if (oFieldDirect) {
                            console.log("Field found without view prefix:", fieldInfo.id);
                            var fieldValue = oFieldDirect.isA("sap.m.ComboBox") ? 
                                oFieldDirect.getSelectedKey() : 
                                oFieldDirect.getValue();
                            
                            payload.push({
                                "fieldName": fieldInfo.originalName,
                                "fieldValue": fieldValue
                            });
                        }
                    }
                });
                console.log("Form Submission Payload: ", payload);
                //console.log("Form Submission Payload: ", JSON.stringify(payload));

                if (payload.length === 0) {
                    console.warn("Payload is empty. No fields were processed.");
                }


                var oView = this.getView();
                var finalPayload = {
                    "data": {
                        "RequestType": oView.byId("RequirementbcType").getValue() || "", // Retrieve selected request type key
                        "OperatingUnit": oView.byId("OUID").getSelectedKey() || "", // Retrieve selected Operating Unit key
                        "department": oView.byId("Department").getValue() || "",
                        "supervisor": oView.byId("Supervisor").getValue() || "",
                        "needbyDate": "2005-05-20",
                        //"needbyDate": oView.byId("NeededbyDate").getValue() || "", // Retrieve date value
                        "onBehalfOf": oView.byId("OnBehalfof").getValue() || "",
                        "nercCip": oView.byId("idNERCCIP").getSelectedKey() || "",
                        "additionalDetails": payload // Initialize as empty array for dynamic fields
                    }
                };
                console.log("Final Submission Payload: ", finalPayload);
                let oModel = this.getView().getModel();
                let oBindList = oModel.bindList("/createFormData");

                oBindList.create(finalPayload);
            }
        });
    });





// sap.ui.define([
//     "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"
// ],
//     function (Controller, JSONModel) {
//         "use strict";

//         return Controller.extend("globalintakeform.controller.IntakeForm", {
//             onInit: function () {
//                 var oModel = this.getOwnerComponent().getModel("jsonData");
//                 this.getView().setModel(oModel, "jsonModel");
//                 console.log(oModel);
//             },
//             onRequestTypeSelect: function (oEvent) {
//                 var oComboBox = oEvent.getSource();
//                 var sSelectedRequestType = oComboBox.getSelectedKey(); // Selected request type ID
//                 var oModel = this.getView().getModel(); // OData V4 model instance
//                 var oFilter = new sap.ui.model.Filter("requestType_ID", sap.ui.model.FilterOperator.EQ, sSelectedRequestType);

//                 var oBindList = oModel.bindList("/RequestConfigs", undefined, undefined, [oFilter]);
//                 oBindList.requestContexts().then(function (aContexts) {
//                     var aFields = [];
//                     aContexts.forEach(function (oContext) {
//                         var oObject = oContext.getObject();
//                         aFields.push(oObject);
//                     });
//                     this._updateFormFields(aFields, sSelectedRequestType);
//                 }.bind(this)).catch(function (oError) {
//                     console.error("Error fetching RequestConfigs: ", oError);
//                 });
//             },

//             // Update the form fields dynamically with sanitized unique IDs
//             _updateFormFields: function (aFields, sRequestType) {
//                 console.log("Fetched Fields: ", aFields);

//                 var oForm = this.byId("234dd");
//                 oForm.removeAllContent();

//                 const dropdownOptions = {
//                     "TypeOfFunding": [
//                         { key: "CAPITAL", text: "Capital" },
//                         { key: "OM", text: "O & M" },
//                         { key: "OTHER", text: "Other" }
//                     ],
//                     "BudgetApproved": [
//                         { key: "YES", text: "Yes" },
//                         { key: "NO", text: "No" },
//                         { key: "NA", text: "N/A" }
//                     ]
//                 };

//                 // Array to store IDs of dynamically created fields
//                 this._dynamicFieldIds = [];

//                 var formContent = [];
//                 aFields.forEach(function (oField) {
//                     var sFieldName = oField.attribute;
//                     var bIsDisplay = oField.isDisplay;
//                     var bIsRequired = oField.isRequired;
//                     var typeName = this.getView().byId("RequirementbcType").getValue();

//                     if (bIsDisplay) {
//                         // Generate a sanitized, unique ID
//                         var sFieldId = `${typeName}${sFieldName}`.replace(/[^a-zA-Z0-9_]/g, "");
//                         this._dynamicFieldIds.push(sFieldId);

//                         // Add Label
//                         formContent.push(new sap.m.Label({
//                             text: sFieldName,
//                             required: bIsRequired
//                         }));

//                         // Add ComboBox or Input based on field type
//                         if (dropdownOptions[sFieldName]) {
//                             var oComboBox = new sap.m.ComboBox({
//                                 id: sFieldId,
//                                 required: bIsRequired,
//                                 placeholder: `Select ${sFieldName}`
//                             });

//                             dropdownOptions[sFieldName].forEach(function (option) {
//                                 oComboBox.addItem(new sap.ui.core.ListItem({
//                                     key: option.key,
//                                     text: option.text
//                                 }));
//                             });

//                             formContent.push(oComboBox);
//                         } else {
//                             formContent.push(new sap.m.Input({
//                                 id: sFieldId,
//                                 placeholder: `Enter ${sFieldName}`,
//                                 required: bIsRequired
//                             }));
//                         }
//                     }
//                 }.bind(this));

//                 formContent.forEach(function (content) {
//                     oForm.addContent(content);
//                 });
//             },
//             wizardCompletedHandler: function () {
//                 var oView = this.getView(); // Get the view to locate the fields
//                 var payload = []; // Array to store the field data
//                 console.log("Form submission initiated.");
            
//                 // Log the dynamic field IDs
//                 console.log("Dynamic field IDs: ", this._dynamicFieldIds);
            
//                 // Iterate through stored IDs and create the payload
//                 this._dynamicFieldIds.forEach(function (sFieldId) {
//                     console.log("Processing field ID: ", sFieldId);
//                     var oField = oView.byId(sFieldId); // Get the field by ID
            
//                     if (oField) {
//                         console.log("Field found:", sFieldId);
//                         var fieldValue;
            
//                         // Get value based on field type (Input or ComboBox)
//                         if (oField.isA("sap.m.ComboBox")) {
//                             fieldValue = oField.getSelectedKey(); // For ComboBox, get selected key
//                             console.log("Field is ComboBox, selected key: ", fieldValue);
//                         } else if (oField.isA("sap.m.Input")) {
//                             fieldValue = oField.getValue(); // For Input, get entered value
//                             console.log("Field is Input, entered value: ", fieldValue);
//                         } else {
//                             console.log("Unknown field type for field:", sFieldId);
//                             return; // Skip unsupported field types
//                         }
            
//                         // Add the field name and value to the payload array
//                         payload.push({
//                             "fieldName": sFieldId, // Field ID as the field name
//                             "fieldValue": fieldValue // Field value
//                         });
//                         console.log("Added to payload: ", {
//                             "fieldName": sFieldId,
//                             "fieldValue": fieldValue
//                         });
//                     } else {
//                         console.warn("Field not found for ID: ", sFieldId);
//                     }
//                 });
            
//                 // Log the final payload
//                 console.log("Form Submission Payload: ", JSON.stringify(payload));
            
//                 // If the payload is empty, log a warning
//                 if (payload.length === 0) {
//                     console.warn("Payload is empty. No fields were processed.");
//                 }
            
                
//             },


        




//             onPurGroupSelect: function (oEvent) {
//                 const selectedRequestType = oEvent.getSource().getSelectedKey(); // Get selected Req. Type from ComboBox
//                 const dataModel = this.getView().getModel("jsonModel"); // Access jsonModel
//                 const allFields = dataModel.getProperty("/data"); // Assuming data is under /data in jsonModel

//                 // Filter fields based on selected Req. Type
//                 const filteredFields = allFields.filter(item => item["Req. Type"] === selectedRequestType);

//                 // Dynamically create form fields for Step 2 based on DISP and REQ values
//                 const formContent = [];
//                 filteredFields.forEach(field => {
//                     if (field.DISP) { // Only display fields where DISP is true
//                         formContent.push(new sap.m.Label({
//                             text: field.Fields,
//                             required: field.REQ // Set as required if REQ is true
//                         }));
//                         formContent.push(new sap.m.Input({ // Add input field for each field
//                             placeholder: `Enter ${field.Fields}`,
//                             required: field.REQ
//                         }));
//                     }
//                 });

//                 // Get reference to the Step 2 form and update its content
//                 const form = this.byId("234dd");
//                 form.removeAllContent(); // Clear previous fields
//                 formContent.forEach(content => form.addContent(content)); // Add new content
//             },

//             onRequestTypeChange: function (oEvent) {
//                 var sSelectedKey = oEvent.getSource().getSelectedKey();
//                 var oView = this.getView();

//                 // Example logic: Show/hide fields based on selected key
//                 if (sSelectedKey === "specificKeyForBudget") {
//                     oView.byId("idBudget").setVisible(true);
//                     oView.byId("idFunding").setVisible(false);
//                     oView.byId("idCyberRiskLevel").setVisible(false);
//                 } else if (sSelectedKey === "specificKeyForFunding") {
//                     oView.byId("idBudget").setVisible(false);
//                     oView.byId("idFunding").setVisible(true);
//                     oView.byId("idCyberRiskLevel").setVisible(true);
//                 } else {
//                     // Default visibility for other options
//                     oView.byId("idBudget").setVisible(false);
//                     oView.byId("idFunding").setVisible(false);
//                     oView.byId("idCyberRiskLevel").setVisible(false);
//                 }
//             },


//             // Called when a selection is made in the ComboBoxes
//             // onMaterialGroupSelect: function (oEvent) {
//             //     this._checkWizardStep();
//             // },

//             // onPurGroupSelect: function (oEvent) {
//             //     this._checkWizardStep();
//             // },

//             // This function checks the selections and determines which control to show in the next step
//             // _checkWizardStep: function () {
//             // var oView = this.getView();
//             // var sMaterialGroup = oView.byId("materialgroupID").getSelectedKey();
//             // var sPurGroup = oView.byId("idPurchaseGroup").getSelectedKey();

//             // var oTable = oView.byId("stakeholderTable");
//             // var oForm = oView.byId("234dd");

//             // // // Logic: Show Table if both selections are MIG_03 and PG_03, otherwise show Form
//             // // if (sMaterialGroup === "MTG_03" && sPurGroup === "PG_03") {
//             // //     oTable.setVisible(true);
//             // //     oForm.setVisible(false);
//             // // } else {
//             // //     oTable.setVisible(false);
//             // //     oForm.setVisible(true);
//             // // }
//             //  },

//             onComplete: function () {
//                 console.log("Submit button clicked")

//                 var screatedBy = this.byId("createdByid").getValue();
//                 var sRequestedFor = this.byId("RequestedforID").setSelectedKey();
//                 var sMaterialGroup = this.byId("materialgroupID").setSelectedKey();
//                 var sPurchaseGroup = this.byId("idPurchaseGroup").setSelectedKey();
//                 var senterprise = this.byId("enterpriseID").getValue();

//                 var sOrganizationUnit = this.byId("OrganizationUnitID").setSelectedKey();
//                 var sFor = this.byId("for").getValue();
//                 var sRequestType = this.byId("idRequestType").setSelectedKey();
//                 var sCommodityType = this.byId("idCommodity").setSelectedKey();
//                 var sBudget = this.byId("idBudget").setSelectedKey();

//                 var sProjectName = this.byId("ProjectName").getValue();
//                 var sFunding = this.byId("idFunding").setSelectedKey();
//                 var sProjectAmount = this.byId("projectAmount").getValue();
//                 var sDate = this.byId("Date").getValue();
//                 var sDateA = this.byId("DateA").getValue();

//                 console.log(sDate, sDateA)

//                 var sCyberrisklevel = this.byId("idCyberrisklevel").setSelectedKey();
//                 var sPotential = this.byId("idPotential").setSelectedKey();
//                 var sNERC = this.byId("idNERC").setSelectedKey();
//                 var sFRMApproval = this.byId("FRMApproval").getValue();
//                 var sPriority = this.byId("idPriority").setSelectedKey();

//                 var sEdisonRep = this.byId("EdisonRep").getValue();
//                 var sDetails = this.byId("Details").getValue();
//                 var sComments = this.byId("Comments").getValue();

//                 let oModel = this.getView().getModel();
//                 let oBindList = oModel.bindList("/Comments");

//                 oBindList.create({
//                     createdBy: screatedBy,
//                     requestedFor: sRequestedFor,
//                     materialGroup: sMaterialGroup,
//                     purchaseGroup: sPurchaseGroup,
//                     enterpriseProcurement: senterprise,

//                     enterpriseProcurementOrganizationUnit: sOrganizationUnit,
//                     stakeFor: sFor,
//                     requestType: sRequestType,
//                     commodityType: sCommodityType,
//                     budgetApproved: sBudget,

//                     projectName: sProjectName,
//                     typeOfFunding: sFunding,
//                     estimatedProjAmount: sProjectAmount,
//                     estimatedProjStartDate: sDate,
//                     estimatedProjEndDate: sDateA,

//                     cyberRiskLevel: sCyberrisklevel,
//                     potentialSupplier: sPotential,
//                     nercCIP: sNERC,
//                     frmApproval: sFRMApproval,
//                     priority: sPriority,

//                     edisonRep: sEdisonRep,
//                     provideProcReqDetails: sDetails,
//                     comments: sComments,




//                 });
//             }
//         });
//     });

