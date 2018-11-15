Ext.define('App.view.files.Link', {
	extend: 'App.view.files.Base',
	alias: 'widget.files-link',
	requires: [
		'App.view.layout.Tab',
        'App.view.files.Toolbar',
	],
	onParentAddressesChanged: function (newAddresses) {
		this.tabPanels.link.onParentAddressesChanged(newAddresses);
	},
	onReloaded: function (data) {
		var tp = this.tabPanels;
		tp.link.reinitValues(data.localized);
		this.callParent(arguments);
	},
	$buildTabPanels: function (data) {
		var tabPanelCfg = {
			data: data,
			$$view: this
		}
		this.mainToolbar = Ext.create('App.view.files.Toolbar', {
			data: data,
			$$view: this,
			region: 'north'
		});
		this.tabPanels = {
			link:		Ext.create('App.view.files.forms.Link', tabPanelCfg),
			versions:	Ext.create('App.view.files.forms.Versions', tabPanelCfg)
		};
		this.tabPanel = Ext.create('Ext.tab.Panel', {
			region: 'center',
			items: [
				this.tabPanels.link,
				this.tabPanels.versions
			]
		});
		this.add([
			this.mainToolbar,
			this.tabPanel
		]);
	},
	$initValues: function (data) {
		var tp = this.tabPanels;
		tp.link.initValues(data.localized);
		this.mainToolbar.initValues(data);
	},
	submitValues: function () {
		var activeStates = {},
			//localizedPanels = ['link'],
			commonPanels = ['link'],
			//lang = '',
			i = 0, l = 0,
			submitResult = this.$submitValuesCompleteEmptyResult();
		/*for (i = 0, l = localizedPanels.length; i < l; i += 1) {
			submitResult = this.$submitValuesProcessLocalizedTab(localizedPanels[i], submitResult);
		}*/
		for (i = 0, l = commonPanels.length; i < l; i += 1) {
			submitResult = this.$submitValuesProcessCommonTab(commonPanels[i], submitResult);
		}
		submitResult = this.callParent([submitResult]);
		return submitResult;
	}
});
