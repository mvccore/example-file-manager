Ext.define('App.controller.layout.Main', {
	extend: 'App.controller.layout.Layout',
	config: {
		routes: {
    		'/opened-tabs/:current/:tabs': {
    			action: 'onTabsChange',
    			before: 'beforeTabsChange',
    			conditions: {
    				':current': '([^/]*)',
    				':tabs': '(.*)'
    			}
    		}
		}
	},
	/*****************************************************************************************************************/
	WINDOW_BASE_NAME: 'admin_window_id_',
	LS_OPENED_WINDOWS_KEY: 'admin_windows',
	_openedTabsStore: { length: 0 },
	_openedTabsHashKeysToUniqueKeys: {},
	_openedTabRouteStr: '',
	_baseTitle: '',
	_startupRestoreProcess: false,
	_tabsRestored: false,
	_openedTabsSyncing: false,
	_openedTabsPatern: /\/opened\-tabs\/([^\/]*)\/(.*)/g,
	_windowName: '',
	_windowRestoreData: { tabs: {}, length: 0, index: -1 },
	_syncCalledByOtherBrowserTab: false,
	/*****************************************************************************************************************/
	_debug: function () {
		return;
		Ext.require('App.controller.files.file.TreeMgr', function () {
			var tree = this.mainNavigationTrees[0];
			tree.selectPath(
				'root/174059ed86edecf31552c0b7e90b9c6c', 'id', '/',
				function (success, lastNode, node) {

					var ctrl = this.$createAndPreDispatchTreeMgrController(
						lastNode.data,
						{ createView: true, pageX: 154, pageY: 136 }
					);
					var args = [tree, lastNode, lastNode, 0, { pageX: 154, pageY: 136 }/*, eOpts*/];
					return ctrl.fireEventArgs('itemcontextmenu', args);

				}.bind(this)
			);
		}.bind(this));
	},
	init: function () {
		this.callParent(arguments);
		if (this._startupChechIfAppIsNotInIframe()) {
			this._baseTitle = document.title;
		}
	},
    onLaunch: function () {
    	this.callParent(arguments);
        /*this.$buildLayout(
            this.$startup
        );*/
    	this.$buildLayout(function () {
    		//this.$startup();
    		this._debug();
    	});
    },
    beforeTabsChange: function (current, tabs, action) {
    	if (this.$hashInternalChange || !this._tabsRestored) {
    		action.stop();
    	} else {
    		action.resume();
    	}
    },
    onTabsChange: function (current, tabs) {
    	var tabs = tabs || '', tabsToLetAndCreate = [], tabsToClose = [];
		// set to true to not change hash by register or unregister method
    	this.$hashBrowserChange = true;
    	tabsToLetAndCreate = this.$onTabsChangeCompleteTabsToLetAndCreate(tabs);
    	tabsToClose = this.$onTabsChangeCompleteTabsToClose(tabsToLetAndCreate);
    	this.$onTabsChangeProcessTabsToClose(tabsToClose);
    	if (tabs) this.$onTabsChangeProcessTabsToLetAndCreate(tabsToLetAndCreate);
    	this.$onTabsChangeCompleteCurrentIndex(current);
    	this._changeDocumentTitleByTabHash();
    	// set back to false (as usual) to change hash by register or unregister method
    	this.$hashBrowserChange = false;
		// run sync after everything is created
    	this.$synchOpenedTabsToServer();
    },
    isTabRegistered: function (uniqueData) {
    	var uniqueKey = JSON.stringify(uniqueData).md5();
    	return typeof(this._openedTabsStore[uniqueKey]) != 'undefined' ? true : false;
    },
    registerTab: function (uniqueData, ctrlInstance) {
    	// called from tab init() method - only when controller is not created yet
    	var uniqueKey = this._completeTabUniqueKey(uniqueData), newIndex = 0,
    		controllerTabKey = '', key = '', hashKey = '',
			hashItems = [], tabsStoreItem = {};
    	// complete and change hash key
    	controllerTabKey = hashItems.push(
			App.instance.configuration.getTabKeyByControllerClassString(ctrlInstance.$className)
		);
    	for (key in uniqueData) {
    		hashItems.push(key + ':' + uniqueData[key]);
    	}
    	hashKey = hashItems.join(',');
    	// store in memory
    	newIndex = this.$creationProcess ? this.$currentTabIndex + 1 : this.$currentTabIndex;
    	for (key in this._openedTabsStore) {
    		if (key == 'length') continue;
    		tabsStoreItem = this._openedTabsStore[key];
    		if (tabsStoreItem.index >= newIndex) {
    			tabsStoreItem.index += 1;
    		}
    	}
		this._openedTabsStore[uniqueKey] = {
    		controller: ctrlInstance,
    		uniqueData: uniqueData,
    		hashKey: hashKey,
    		originalUrl: location.href,
    		index: newIndex
    	};
    	this._openedTabsHashKeysToUniqueKeys[hashKey] = uniqueKey;
    	this._openedTabsStore.length += 1;
		// update hash and run sync process if necessary
    	if (!this.$hashBrowserChange) this.$updateHashAndTitleByOpenedTabsAndSync();
    },
    unregisterTab: function (uniqueData) {
    	// called from tab close button and by history back/forward - create unique key
		var uniqueKey = this._completeTabUniqueKey(uniqueData),
			hashKey = '';
    	if (typeof (this._openedTabsStore[uniqueKey]) != 'undefined') {
    		hashKey = this._openedTabsStore[uniqueKey].hashKey;
    		// when changed - than confirm if necessary, if true - go throw uncatched error if necessary
    		if (this.$unregisterTabCheckTabChangeAndStopIfNecessary(this._openedTabsStore[uniqueKey].controller)) {
    			return false;
    		};
    		// unset from memory
    		delete this._openedTabsStore[uniqueKey];
    		delete this._openedTabsHashKeysToUniqueKeys[hashKey];
    		this._openedTabsStore.length -= 1;
    		this.$currentTabIndex = Math.max(0, this._openedTabsStore.length - 1);
    		// update hash and run sync process if necessary
    		if (!this.$hashBrowserChange) this.$updateHashAndTitleByOpenedTabsAndSync();
    	}
    	return true;
    },
    tabFocusChanged: function (currentTabIndex) {
    	this.$currentTabIndex = currentTabIndex;
    	this.$updateHashAndTitleByOpenedTabsAndSync();
    },
    getControllerByUniqueData: function (uniqueData) {
    	var uniqueKey = JSON.stringify(uniqueData).md5();
    	return typeof (this._openedTabsStore[uniqueKey]) != 'undefined' ? this._openedTabsStore[uniqueKey].controller : null ;
    },
    setTabHashTitle: function (uniqueData, title) {
    	var uniqueKey = JSON.stringify(uniqueData).md5(),
    		openedTabsStoreRecord = this._openedTabsStore[uniqueKey];
		try {
    		var originalUrl = openedTabsStoreRecord.originalUrl,
    			tabHashKey = openedTabsStoreRecord.hashKey,
				currentTabHash = this._getCurrentTabHashByLocationHash(true),
				newTitle = String.format('{0} | {1}', this._baseTitle, title);
    		if (tabHashKey == currentTabHash) {
    			document.title = newTitle;
    		}
		} catch (e) {
			console.log(e.message, e.stack);
		}
    },
    closeAllOtherTabs: function (ctrlInstance) {
    	this.$hashBrowserChange = true;
    	var currentUniqueData = ctrlInstance.getUniqueData(),
			currentUniqueKey = this._completeTabUniqueKey(currentUniqueData),
			uniqueKeysToClose = [],
			ctrlInstance = function () { };
    	for (var uniqueKey in this._openedTabsStore) {
    		if (uniqueKey == 'length') continue;
    		if (uniqueKey == currentUniqueKey) continue;
    		uniqueKeysToClose.push(uniqueKey);
    	}
    	for (var i = 0, l = uniqueKeysToClose.length; i < l; i += 1) {
    		uniqueKey = uniqueKeysToClose[i];
    		ctrlInstance = this._openedTabsStore[uniqueKey].controller;
    		ctrlInstance.onClose(); // this internaly calls this.unregisterTab() method
    		ctrlInstance.mainTabs.remove(
				ctrlInstance.currentTab, true/* autoDestroy */
			);
    		Ext.destroy(ctrlInstance);
    	}
    	this.$hashBrowserChange = false;
    	this.$updateHashAndTitleByOpenedTabsAndSync();
    },
    closeAllUnmodifiedTabs: function () {
    	var uniqueKeysToClose = [], ctrlInstance = function () { };
    	for (var uniqueKey in this._openedTabsStore) {
    		if (uniqueKey == 'length') continue;
    		ctrlInstance = this._openedTabsStore[uniqueKey].controller;
    		if (!ctrlInstance.getTabChanged()) {
    			uniqueKeysToClose.push(uniqueKey);
    		}
    	}
    	for (var i = 0, l = uniqueKeysToClose.length; i < l; i += 1) {
    		uniqueKey = uniqueKeysToClose[i];
    		ctrlInstance = this._openedTabsStore[uniqueKey].controller;
    		ctrlInstance.onClose(); // this internaly calls this.unregisterTab() method
    		ctrlInstance.mainTabs.remove(
				ctrlInstance.currentTab, true/* autoDestroy */
			);
    		Ext.destroy(ctrlInstance);
    	}
    },
    getActiveTabController: function () {
    	var activeTab,
    		mainTabs = this.getMainTabs();
    	if (mainTabs && mainTabs.items.getCount() > 0) {
    		return mainTabs.getActiveTab().$$controller;
    	} else {
    		return null;
    	}
    },
	/*****************************************************************************************************************/
    $startup: function () {
    	this.$startupInitHistory();
    	this.$startupTabsRestoreProcessBegin();
    },
    $startupInitHistory: function () {
    	Ext.History.init();
    	window.onhashchange = function () {
    		if (String(location.hash).trim('#') == '') {
    			this.onTabsChange('0', '');
    		}
    	}.bind(this);
    },
    $startupTabsRestoreProcessBegin: function () {
    	this._completeTabKeysDataToRestore(); // open tabs stored in session
    	if (!this._windowRestoreData.length) {
    		this._callAllOtherBrowserTabsSync();
    		this._tabsRestored = true;
    	} else {
    		this.$hashBrowserChange = true;
    		this._startupRestoreProcess = true;
    		for (var tabKey in this._windowRestoreData.tabs) {
    			this.$createTabByHashKey(tabKey);
    		}
    	}
	},
    $startupTabsRestoreProcessEnd: function (tabKey) {
    	if (this._windowRestoreData.tabs[tabKey]) {
    		delete this._windowRestoreData.tabs[tabKey];
    		this._windowRestoreData.length -= 1;
    		if (this._windowRestoreData.length === 0) {
    			this._startupRestoreProcess = false;
    			this.$hashBrowserChange = false;
    			this.$currentTabIndex = this._windowRestoreData.index;
    			this.getMainTabs().setActiveTab(this.$currentTabIndex);
    			this._callAllOtherBrowserTabsSync();
    			this.$updateHashAndTitleByOpenedTabsAndSync(); // run hash change at the end of restore process
    			this._tabsRestored = true;
    		}
    	}
    },
    $createTabByHashKey: function (tabKey) {
    	var tabBaseKey = '', tabData = tabKey.split(','), tabControllerClassStr = '';
    	if (tabData.length === 0) return;
    	tabBaseKey = tabData.shift(); // now array is shorter - without zeo element and zero element is in variable tabKey
    	tabControllerClassStr = App.instance.configuration.getControllerClassStringByTabKey(tabBaseKey);
    	this.$loadCreateAndDispatchTabController(
			tabControllerClassStr,
			this._parseTabControllerAdditionalData(tabData),
			function () {
				this.$startupTabsRestoreProcessEnd(tabKey);
			}.bind(this)
		);
    },
    $onTabsChangeProcessTabsToClose: function (tabsToClose) {
    	var uniqueKey = '', ctrlInstance = function () { };
    	for (var i = 0, l = tabsToClose.length; i < l; i += 1) {
    		uniqueKey = tabsToClose[i];
    		ctrlInstance = this._openedTabsStore[uniqueKey].controller;
    		ctrlInstance.onClose(); // this internaly calls this.unregisterTab() method
    		if (this.$hashBrowserChange) {
    			ctrlInstance.mainTabs.remove(
					ctrlInstance.currentTab, true/* autoDestroy */
				);
    		} else {
    			Ext.destroy(ctrlInstance);
    		}
    	}
    },
    $onTabsChangeProcessTabsToLetAndCreate: function (tabsToLetAndCreate) {
    	var f = function () { }, tabItem = {},
    		uniqueKey = '', hashKey = '',
			controller = f, mainTabs = f,
    		currentTab = f, tabPanel;
    	for (var i = 0, l = tabsToLetAndCreate.length; i < l; i += 1) {
    		tabItem = tabsToLetAndCreate[i];
    		uniqueKey = tabItem.uniqueKey;
    		hashKey = tabItem.hashKey;
    		if (tabItem.create) {
    			this.$createTabByHashKey(hashKey);
    		} else {
    			controller = tabItem.record.controller;
    			mainTabs = controller.mainTabs;
    			currentTab = controller.currentTab;
    			mainTabs.remove(currentTab, false);
    			tabPanel = mainTabs.add(currentTab);
    			// reset variables at the end
    			delete this._openedTabsStore[uniqueKey];
    			delete this._openedTabsHashKeysToUniqueKeys[hashKey];
    			this._openedTabsStore[uniqueKey] = tabItem.record;
    			this._openedTabsHashKeysToUniqueKeys[tabItem.hashKey];
    		}
    	}
    },
    $onTabsChangeCompleteTabsToLetAndCreate: function (tabs) {
    	var tabs = tabs || '', hashKeys = tabs.split('/'),
			hashKey = '', uniqueKey = '',
			tabsToLetAndCreate = [];
    	for (var i = 0, l = hashKeys.length; i < l; i += 1) {
    		hashKey = hashKeys[i];
    		if (typeof (this._openedTabsHashKeysToUniqueKeys[hashKey]) == 'string') {
    			uniqueKey = this._openedTabsHashKeysToUniqueKeys[hashKey];
    			tabsToLetAndCreate.push({
    				create: false,
    				uniqueKey: uniqueKey,
    				record: this._openedTabsStore[uniqueKey]
    			});
    		} else {
    			tabsToLetAndCreate.push({
    				create: true,
    				hashKey: hashKey
    			});
    		}
    	}
    	return tabsToLetAndCreate;
    },
    $onTabsChangeCompleteTabsToClose: function (tabsToLetAndCreate) {
    	var tabsToClose = [], tabsToLetKeys = {}, uniqueKey = '';
    	for (var i = 0, l = tabsToLetAndCreate.length; i < l; i += 1) {
    		tabsToLetKeys[tabsToLetAndCreate[i].uniqueKey] = true;
    	}
    	for (var uniqueKey in this._openedTabsStore) {
    		if (uniqueKey == 'length') continue;
    		if (typeof (tabsToLetKeys[uniqueKey]) == 'undefined') {
    			tabsToClose.push(uniqueKey);
    		}
    	}
    	return tabsToClose;
    },
    $onTabsChangeCompleteCurrentIndex: function (current) {
    	var currentInt = 0;
    	if (String(current).isInteger()) { // set up current tab index
    		currentInt = String(current).toInteger();
    		if (currentInt < 0) currentInt = 0;
    		if (currentInt > this._openedTabsStore.length - 1) currentInt = this._openedTabsStore.length - 1;
    		this.$currentTabIndex = currentInt;
    		this.getMainTabs().setActiveTab(currentInt); // set active tab by index
    	}
    },
    $unregisterTabCheckTabChangeAndStopIfNecessary: function (ctrlInstance) {
    	var tabTitle = '', confirmResult = true;
    	if (Settings.EDITOR.ALERT_ON_CHANGED_TAB_CLOSE && ctrlInstance.getTabChanged()) {
    		tabTitle = ctrlInstance.getTitle();
    		confirmResult = window.confirm(String.format(
				t("There are unsaved changes in tab: '{0}', do you realy want to continue?"),
				tabTitle
			));
    		if (!confirmResult) {
    			// if it was going back/forward by browser and not by close click - add closed tab hash back
    			if (!this.$hashBrowserChange) this.$updateHashAndTitleByOpenedTabsAndSync();
    			// return tru to stop current process
    			return true;
    		}
    	}
    	return false;
    },
    $updateHashAndTitleByOpenedTabsAndSync: function () {
    	this.$hashInternalChange = true;
    	this._prepareAndSetUpOpenedTabsHashRoute();
    	this._changeDocumentTitleByTabHash();
    	setTimeout(function () {
    		this.$hashInternalChange = false;
    		this.$synchOpenedTabsToServer(); // start requesting server if necessary
    	}.bind(this));
    },
    $synchOpenedTabsToServer: function () {
    	var openedTabsDataBefore = { index: -1, tabs: '', window: window.name, browser: Ext.browser.name },
    		openedTabsDataStrBefore = '';
    	if (this._openedTabsSyncing) return;
    	this._openedTabsSyncing = true;
    	if (this.$currentTabIndex > -1) {
    		openedTabsDataBefore = this._getOpenedTabsDataFromLocationHash(location.hash.trim('#'));
    	}
		openedTabsDataStrBefore = JSON.stringify(openedTabsDataBefore);
		console.log("Opened tabs synchronization not implemented.");
    	/*Ext.Ajax.request({
    		url: Settings.URLS.OPENED_TABS_SYNC,
    		method: 'GET',
    		params: openedTabsDataBefore,
    		success: function (response) {
    			// var text = response.responseText;
    			this.$synchOpenedTabsToServerResponse(openedTabsDataStrBefore);
    		}.bind(this)
    	});*/
    },
    $synchOpenedTabsToServerResponse: function (openedTabsDataStrBefore) {
    	var openedTabsDataAfter = { index: -1, tabs: '', window: window.name, browser: Ext.browser.name },
    		openedTabsDataStrAfter = '';
    	this._openedTabsSyncing = false;
    	if (this.$currentTabIndex > -1) {
    		openedTabsDataAfter = this._getOpenedTabsDataFromLocationHash(location.hash.trim('#'));
    	}
    	openedTabsDataStrAfter = JSON.stringify(openedTabsDataAfter);
    	if (openedTabsDataStrBefore != openedTabsDataStrAfter || this._syncCalledByOtherBrowserTab) {
    		this._syncCalledByOtherBrowserTab = false;
    		this.$synchOpenedTabsToServer();
    	}
    },
	/*****************************************************************************************************************/
    _prepareAndSetUpOpenedTabsHashRoute: function () {
    	var arr1 = [],
			arr2 = [],
			hashKey = '',
			index = 0,
			currentIndex = 0,
			tabStoreItem = {},
			mainTabs = function () { };
    	for (var uniqueKey in this._openedTabsStore) {
    		if (uniqueKey == 'length') continue;
    		tabStoreItem = this._openedTabsStore[uniqueKey];
    		index = tabStoreItem.index;
    		arr1[index] = tabStoreItem.hashKey;
    	}
    	for (var i = 0, l = arr1.length; i < l; i += 1) if (typeof (arr1[i]) != 'undefined') arr2.push(arr1[i]);
    	if (arr1.length) {
    		currentIndex = this.$creationProcess ? this.$currentTabIndex + 1 : this.$currentTabIndex;
    		this._setUpOpenedTabsHashRoute(currentIndex.toString(), arr2.join('/'));
    	} else {
    		this.$currentTabIndex = -1;
    		location.hash = '';
    	}
    },
    _setUpOpenedTabsHashRoute: function (current, tabs) {
    	if (!this._openedTabRouteStr) {
    		for (var routePath in this.config.routes) {
    			this._openedTabRouteStr = routePath.replace(':current', '{0}').replace(':tabs', '{1}');
    			break;
    		}
    	}
    	location.hash = String.format(
			this._openedTabRouteStr, 
			current,
			tabs
		);
    },
    _changeDocumentTitleByTabHash: function () {
    	var ctrlInstance = function () {},
			uniqueKey = '', docTitle = '',
			currentTabHash = this._getCurrentTabHashByLocationHash(false);
    	if (currentTabHash == '') {
    		// no opened tabs - set title to default value
    		docTitle = this._baseTitle;
    	} else {
    		uniqueKey = this._openedTabsHashKeysToUniqueKeys[currentTabHash];
    		ctrlInstance = this._openedTabsStore[uniqueKey].controller;
    		docTitle = ctrlInstance.isTabRegistered() ? ctrlInstance.getTitle() : t(this.DEFAULT_TAB_TITLE) ;
    		if (docTitle == t(this.DEFAULT_TAB_TITLE)) {
    			// set new title with index
    			this._tabTitleCounter += 1;
    			docTitle = String.format('{0} | ({1})', this._baseTitle, this._tabTitleCounter);
    		} else {
    			docTitle = String.format('{0} | {1}', this._baseTitle, docTitle);
    		}
    	}
    	document.title = docTitle;
    },
    _getOpenedTabsDataFromLocationHash: function (locHash) {
    	var openedTabsDataStr = locHash.replace(this._openedTabsPatern, '{index: $1, tabs: "$2", window: "' + window.name + '", browser: "' + Ext.browser.name + '"}');
    	return eval('(function(){return ' + openedTabsDataStr + ';})();');
    },
    _getCurrentTabHashByLocationHash: function (laterChanging) {
    	var locHash = location.hash.trim('#'),
			openedTabsData = {},
    		tabHashes = [],
			currentIndex = 0,
			currentTabHash = '';
    	if (!this._openedTabsPatern.test(locHash)) return '';
    	openedTabsData = this._getOpenedTabsDataFromLocationHash(locHash),
    	tabHashes = openedTabsData.tabs.split('/');
    	currentIndex = parseInt(openedTabsData.index, 10);
    	if (laterChanging) currentIndex = this.$creationProcess ? currentIndex + 1 : currentIndex;
    	if (typeof (tabHashes[currentIndex]) != 'undefined') {
    		currentTabHash = tabHashes[currentIndex];
    	}
    	return currentTabHash;
    },
    _startupChechIfAppIsNotInIframe: function () {
    	if (window !== window.top) {
    		window.top.location.href = location.href; // ensure we are not inside an iframe
    		return false;
    	}
    	return true;
    },
    _parseTabControllerAdditionalData: function (tabData) {
    	tabData = tabData || [];
    	var result = [], keyAndValue = [],
			tabDataItem = '', key = '', value = '';
    	for (var i = 0, l = tabData.length; i < l; i += 1) {
    		tabDataItem = tabData[i];
    		key = '';
    		value = tabDataItem;
    		if (tabDataItem.indexOf(':') > -1) {
    			keyAndValue = tabDataItem.split(':');
    			key = keyAndValue[0];
    			value = keyAndValue[1];
    		}
    		if (key) {
    			result[key] = this._tryToDeterminateBaseTypeAndRetype(value);
    		} else {
    			result.push(this._tryToDeterminateBaseTypeAndRetype(value));
    		}
    	}
    	return result;
    },
    _tryToDeterminateBaseTypeAndRetype: function (str) {
    	if (str.isBoolean()) return str.toBoolean();
    	if (str.isInteger()) return str.toInteger();
    	if (str.isFloat()) return str.toFloat();
    	return str;
    },
    _completeTabUniqueKey: function (uniqueData) {
    	return JSON.stringify(uniqueData).md5();
    },
    _completeTabKeysDataToRestore: function () {
    	var i = 0, l = 0,
			tabKeysToRestore = [],
			tabKey = '',
			windowName = '',
			data = {};
    	if (this._openedTabsPatern.test(location.hash.trim('#'))) {
    		data = this._completeTabKeysDataToRestoreFromLocationHash();
    		windowName = data.windowName;
    		tabKeysToRestore = data.tabKeysToRestore;
    	} else if (Settings.openedWindows && Settings.openedWindows.length > 0) {
    		data = this._completeTabKeysDataToRestoreFromSettingsOpenedWindows();
    		windowName = data.windowName;
    		tabKeysToRestore = data.tabKeysToRestore;
    	} else {
    		if (window.name.indexOf(this.WINDOW_BASE_NAME) == -1) {
    			windowName = this.WINDOW_BASE_NAME + Date.unixTimestamp();
    		} else {
    			windowName = window.name;
    		}
    	}
    	window.name = windowName;
    	for (i = 0, l = tabKeysToRestore.length; i < l; i += 1) {
    		tabKey = tabKeysToRestore[i];
    		if (tabKey) {
    			this._windowRestoreData.tabs[tabKey] = true;
    			this._windowRestoreData.length += 1;
    		}
    	}
    },
    _completeTabKeysDataToRestoreFromLocationHash: function ()
    {
    	var tabKeysToRestore = [],
			openedTabsData = {},
			windowName = '';
    	openedTabsData = this._getOpenedTabsDataFromLocationHash(location.hash.trim('#'));
    	tabKeysToRestore = openedTabsData.tabs.split('/');
    	this._windowRestoreData.index = openedTabsData.index;
    	windowName = (window.name.indexOf(this.WINDOW_BASE_NAME) > -1) ? window.name : this.WINDOW_BASE_NAME + Date.unixTimestamp();
    	return {
    		tabKeysToRestore: tabKeysToRestore,
    		windowName: windowName
    	};
    },
    _completeTabKeysDataToRestoreFromSettingsOpenedWindows: function ()
    {
    	var i = 0, l = 0,
			tabKeysToRestore = [],
			tabKeysMaxCount = 0,
			otherWindows = [],
			otherBrowsers = {},
			windowName = '',
			browserName = Ext.browser.name,
			restoreData = {},
			otherWindowsRestored = false;
    	// complete window to restore for current browser with most tabs count to restore
    	for (i = 0, l = Settings.openedWindows.length; i < l; i += 1) {
    		restoreData = Settings.openedWindows[i];
    		if (restoreData.browser == browserName) {
    			restoreData.tabsArr = restoreData.tabs.split('/');
    			if (restoreData.tabsArr.length > tabKeysMaxCount) {
    				tabKeysMaxCount = restoreData.tabsArr.length;
    				windowName = restoreData.name;
    				tabKeysToRestore = restoreData.tabsArr;
    				this._windowRestoreData.index = restoreData.index;
    			}
    		}
    	}
    	// try to complete other windows to restore in current browser
    	for (i = 0, l = Settings.openedWindows.length; i < l; i += 1) {
    		restoreData = Settings.openedWindows[i];
    		if (windowName == restoreData.name) continue;
    		if (restoreData.browser == browserName) {
    			otherWindows.push(restoreData);
    		} else {
    			if (typeof (otherBrowsers[restoreData.browser]) == 'undefined') {
    				otherBrowsers[restoreData.browser] = 0;
    				if (typeof (otherBrowsers.length) == 'undefined') otherBrowsers.length = 0;
    				otherBrowsers.length += 1;
    			}
    			otherBrowsers[restoreData.browser] += 1;
    		}
    	}
    	otherWindowsRestored = this._tryToOpenOtherAdminWindows(otherWindows, otherBrowsers);
    	if (!otherWindowsRestored) {
    		for (i = 0, l = otherWindows.length; i < l; i += 1) {
    			tabKeysToRestore = tabKeysToRestore.concat(otherWindows[i].tabsArr);
    		}
    	}
    	windowName = this.WINDOW_BASE_NAME + Date.unixTimestamp(); // to rewrite window.name assigned from Setting.openedWindows item
		return {
    		tabKeysToRestore: tabKeysToRestore,
    		windowName: windowName
    	};
    },
    _tryToOpenOtherAdminWindows: function (otherWindows, otherBrowsers)
    {
    	var result = true,
			otherWindow = {},
    		newWindow = {},
    		baseUrl = '',
			locHashCrossIndex = location.href.indexOf('#'),
			baseAlertMsg = '',
			otherBrowsersAlertMsgParts = [];
    	if (otherWindows.length > 0) {
    		msg = String.format(
				t("There are another browser tabs to be restored:") + "\n     {0} ({1})",
				Ext.browser.name, otherWindows.length
			);
    		if (otherBrowsers.length > 0) {
    			for (var browserName in otherBrowsers) {
    				if (browserName == 'length') continue;
    				otherBrowsersAlertMsgParts.push(String.format('{0} ({1})', browserName, otherBrowsers[browserName]));
    			}
    			msg += String.format(
					"\n" + t("but it's not possible from here to restore browser tabs in another browsers:") + "\n     {0}",
					otherBrowsersAlertMsgParts.join(', ')
    			);
    			msg += "\n" + t("To do it, there will be necessary to start these browsers manually and confirm restoration.");
    		}
    		msg += "\n\n" + t("Do you want to restore all current browser tabs now?") + "\n"
				+ t("If not, all dialogues will be restored in current browser tab.") + "\n";
			if (window.confirm(msg)) {
    			if (locHashCrossIndex > -1) {
    				baseUrl = location.href.substr(0, locHashCrossIndex);
    			} else {
    				baseUrl = location.href;
    			}
    			for (var i = 0, l = otherWindows.length; i < l; i += 1) {
    				otherWindow = otherWindows[i];
    				newWindow = window.open(
						baseUrl + String.format('#/opened-tabs/{0}/{1}', otherWindow.index, otherWindow.tabs), '_blank'
					);
    				if (typeof (newWindow) == 'undefined') {
    					result = false;
    					alert(t("It was not possible to restore other browser tabs, enable to open new browser tabs by JavaScript in your browser."));
    					break;
    				} else {
    					newWindow.name = otherWindow.name;
    					newWindow.blur();
    				}
    			}
    			window.focus();
			} else {
				result = false;
			}
    	}
    	return result;
    },
    _callAllOtherBrowserTabsSync: function ()
    {
    	var i = 0, l = 0,
			openedWindowsRaw = [],
			openedWindows = [],
			openedWindow = {},
			now = Date.unixTimestamp(),
			currentWindowCatched = false;
    	if (!window.localStorage) return;
		// cut off all old records
    	if (typeof (window.localStorage[this.LS_OPENED_WINDOWS_KEY]) != 'undefined') {
    		openedWindowsRaw = JSON.parse(window.localStorage[this.LS_OPENED_WINDOWS_KEY]);
    		for (i = 0, l = openedWindowsRaw.length; i < l; i += 1) {
    			openedWindow = openedWindowsRaw[i];
    			if (openedWindow.lastCheck + 15 > now) {
    				openedWindows.push(openedWindow);
    			}
    		}
    	}
    	// set up for all other windows sync property to true 
    	for (i = 0, l = openedWindows.length; i < l; i += 1) {
    		openedWindows[i].sync = 1;
    	}
    	// set up for current window sync to 0 and lastCheck property to now
    	for (i = 0, l = openedWindows.length; i < l; i += 1) {
    		openedWindow = openedWindowsRaw[i];
    		if (openedWindow.name == window.name) {
    			currentWindowCatched = true;
    			openedWindow.sync = 0;
    			openedWindow.lastCheck = now;
    		}
    	}
    	if (!currentWindowCatched) {
    		openedWindows.push({
				name: window.name,
    			sync: 0,
				lastCheck: now
    		});
    	}
    	window.localStorage[this.LS_OPENED_WINDOWS_KEY] = JSON.stringify(openedWindows);
    	// start checking process to recognize another window sync call (through sync property configured to 1)
    	this._checkOtherBrowserTabCall();
    	setInterval(this._checkOtherBrowserTabCall.bind(this), 5000);
    },
    _checkOtherBrowserTabCall: function () {
    	var i = 0, l = 0,
			openedWindowsRaw = [],
			openedWindows = [],
			openedWindow = {},
			now = Date.unixTimestamp();
    	if (typeof (window.localStorage[this.LS_OPENED_WINDOWS_KEY]) != 'undefined') {
    		openedWindowsRaw = JSON.parse(window.localStorage[this.LS_OPENED_WINDOWS_KEY]);
    		for (i = 0, l = openedWindowsRaw.length; i < l; i += 1) {
    			openedWindow = openedWindowsRaw[i];
    			if (openedWindow.lastCheck + 30 > now) openedWindows.push(openedWindow);
    		}
    	}
    	for (i = 0, l = openedWindows.length; i < l; i += 1) {
    		openedWindow = openedWindowsRaw[i];
    		if (openedWindow.name == window.name) {
    			if (openedWindow.sync) {
    				if (!this._openedTabsSyncing) {
    					this.$synchOpenedTabsToServer();
    				} else {
    					this._syncCalledByOtherBrowserTab = true;
    				}
    				openedWindow.sync = 0;
    			}
    			openedWindow.lastCheck = now;
    		}
    	}
    	window.localStorage[this.LS_OPENED_WINDOWS_KEY] = JSON.stringify(openedWindows);
    }
});
