Ext.define('App.controller.layout.Tab', {
	extend: 'Ext.app.Controller',
	MAX_TITLE_LENGTH: 35,
	data: null,
	mainTabs: null, 
	currentTab: null,
	_title: null,
	_registered: false,
	_uniqueData: null,
	_tabChanged: false,
	_mainCtrl: null,
	init: function (data) {
		this.callParent(arguments);
		this.data = data;
	},
	register: function (uniqueData) {
		this.setUniqueData(uniqueData);
		if (this.$getMainController().isTabRegistered(uniqueData)) {
			// set tab to front
			var ctrlInstance = this.$getMainController().getControllerByUniqueData(uniqueData);
			var tabIndex = ctrlInstance.mainTabs.items.indexOf(ctrlInstance.currentTab);
			ctrlInstance.mainTabs.setActiveTab(tabIndex);
			this.$getMainController().tabFocusChanged(tabIndex);
		} else {
			// add tab info to document hash
			// set new tab info collection for future synchronizing
			this.$getMainController().registerTab(uniqueData, this);
			this._registered = true;
		}
	},
	onClose: function () {
		// remove tab info from document hash
		// set new tab info collection for future synchronizing
		return this.$getMainController().unregisterTab(this.getUniqueData());
	},
	onShow: function (tabPanel, eOpts) {
		this.$getMainController().tabFocusChanged(
			this.mainTabs.items.indexOf(this.currentTab)
		);
	},
	onLaunch: function (mainTabs, currentTab) {
		this.mainTabs = mainTabs;
		this.currentTab = currentTab;
	},
	onData: function (data) {
		this.data = data;
		this.$getMainController().setTabHashTitle(
			this.getUniqueData(),
			this.getTitle()
		);
		if (this.$$view.onData) this.$$view.onData(data);
	},
	isTabRegistered: function () {
		return this._registered;
	},
	setTabChanged: function (changed) {
		changed = typeof (changed) != 'undefined' ? Boolean(changed) : true;
		var title = String(this.currentTab.getTitle()).replace('&nbsp;', ' ').trim('* ');
		if (changed) title += '&nbsp;*';
		this.currentTab.setTitle(title);
		this._tabChanged = changed;
		return this;
	},
	getTabChanged: function () {
		return this._tabChanged;
	},
	setTitle: function (title) {
		var t = '', pos = 0;
		this._title = title;
		if (isset(this, 'currentTab.tab.el.dom')) {
			this.currentTab.tab.el.dom.setAttribute('title', title);
		}
		if (title.length > this.MAX_TITLE_LENGTH) {
			t = title.substr(0, this.MAX_TITLE_LENGTH);
			pos = t.lastIndexOf(' ');
			if (pos > -1) {
				title = t.substr(0, pos) + '&hellip;';
			} else {
				title = t.substr(0, this.MAX_TITLE_LENGTH) + '&hellip;';
			}
		}
		this.currentTab.setTitle(title);
		return this;
	},
	getTitle: function () {
		return this._title;
	},
	getUniqueData: function () {
		return this._uniqueData;
	},
	setUniqueData: function (uniqueData) {
		this._uniqueData = uniqueData;
		return this;
	},
	$getMainController: function () {
		if (!this._mainCtrl)
			this._mainCtrl = App.instance.getController('layout.Main');
		return this._mainCtrl;
	}
});
