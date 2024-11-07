/*global QUnit*/

sap.ui.define([
	"globalintakeform/controller/IntakeForm.controller"
], function (Controller) {
	"use strict";

	QUnit.module("IntakeForm Controller");

	QUnit.test("I should test the IntakeForm controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
