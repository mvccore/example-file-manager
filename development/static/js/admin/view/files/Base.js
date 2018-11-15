Ext.define('App.view.files.Base', {
	extend: 'App.view.layout.Tab',
	onData: function (data) {
		this.$buildTabPanels(data);
		this.$initValues(data);
	},
	setTabChanged: function (changed) {
		this.$$controller.setTabChanged(changed);
	},
	onParentAddressesChanged: function (newAddresses) {
		// allways completed in extended class
	},
	onActiveStateChanged: function (newActiveStates) {
		//this.mainToolbar.buttons.activeStates.setValue(newActiveStates);
	},
	onReloaded: function (data) {
		this.mainToolbar.reinitValues(data);
	},
	onSaved: function (data) {
		this.mainToolbar.reinitValues(data);
		//this.mainToolbar.buttons.open.setValue(data.system.previewUrls);
	},
	$buildTabPanels: function (data) {
		// allways completed in extended class
	},
	$initValues: function (data) {
		// allways completed in extended class
	},
	submitValues: function (submitResult) {
		/*var activeStates = this.mainToolbar.buttons.activeStates.getValue(),
			localizedData = {};*/
		if (typeof (submitResult) == 'undefined') {
			submitResult = this.$submitValuesCompleteEmptyResult();
		}
		/*localizedData = submitResult.data.localized;
		for (var lang in activeStates) {
			localizedData[lang].Active = activeStates[lang];
		}*/
		return submitResult;
	},
	$submitValuesCompleteEmptyResult: function () {
		return {
			success: true,
			data: {
				common: {},
				//localized: {}
			},
			errors: {
				common: {},
				//localized: {}
			}
		};
	},
	$submitValuesProcessCommonTab: function (panelKey, submitResult) {
		var tabPanels = this.tabPanels,
			panelSubmitResult = {},
			data = {},
			resultValues = {},
			resultErrors = submitResult.errors,
			valueKey = '';
		panelSubmitResult = tabPanels[panelKey].submitValues();
		data = panelSubmitResult.data;
		resultValues = submitResult.data.common;
		for (valueKey in data) {
			resultValues[valueKey] = data[valueKey];
		}
		if (!panelSubmitResult.success) {
			submitResult.success = false;
			data = panelSubmitResult.errors;
			if (typeof (resultErrors.common[panelKey]) == 'undefined') {
				resultErrors.common[panelKey] = {};
			}
			resultErrors = resultErrors.common[panelKey];
			for (valueKey in data) {
				resultErrors[valueKey] = data[valueKey];
			}
		}
		return submitResult;
	}
});
