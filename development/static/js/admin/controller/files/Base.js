Ext.define('App.controller.files.Base', {
	extend: 'App.controller.layout.Tab',
	models: ['App.model.files.File'],
	statics: {
		processOpenedDocsAndUpdateAddressesIfNecessary: function (changedDocumentsAddresses, module) {
			var i = 0, l = 0,
				docId = 0,
				lang = '',
				changedAddress = '',
				docIdAndModule = '',
				changedDocumentsAddressesCurrentLang = [],
				changedDocIdAndAddress = [],
				uniqueData = {},
				updateCollection = {},
				updateCollectionItem = {},
				mainController = App.instance.getController('layout.Main'),
				movedDocumentOpened = false,
				tabController;
			for (lang in changedDocumentsAddresses) {
				changedDocumentsAddressesCurrentLang = changedDocumentsAddresses[lang];
				for (i = 0, l = changedDocumentsAddressesCurrentLang.length; i < l; i += 1) {
					changedDocIdAndAddress = changedDocumentsAddressesCurrentLang[i];
					docId = changedDocIdAndAddress[0];
					changedAddress = changedDocIdAndAddress[1];
					docIdAndModule = String.format('{0}:{1}', docId, module);
					if (typeof (updateCollection[docIdAndModule]) == 'undefined') {
						updateCollection[docIdAndModule] = {
							uniqueData: { i: docId, m: module },
							addresses: {}
						};
					}
					updateCollection[docIdAndModule].addresses[lang] = changedAddress;
				}
			}
			for (docIdAndModule in updateCollection) {
				updateCollectionItem = updateCollection[docIdAndModule];
				uniqueData = updateCollectionItem.uniqueData;
				movedDocumentOpened = mainController.isTabRegistered(uniqueData);
				if (movedDocumentOpened) {
					tabController = mainController.getControllerByUniqueData(uniqueData);
					tabController.onParentAddressesChanged(updateCollectionItem.addresses);
				}
			}
		},
		processOpenedDocsAndUpdateTreePathsIfNecessary: function (changedDocumentsTreePaths, module) {
			var changeRecord,
				docId = 0,
				treePath = '',
				uniqueData = {},
				movedDocumentOpened = false,
				mainController = App.instance.getController('layout.Main'),
				tabController;
			for (var i = 0, l = changedDocumentsTreePaths.length; i < l; i += 1) {
				changeRecord = changedDocumentsTreePaths[i];
				docId = changeRecord[0];
				treePath = changeRecord[1];
				uniqueData = { i: docId, m: module };
				movedDocumentOpened = mainController.isTabRegistered(uniqueData);
				if (movedDocumentOpened) {
					tabController = mainController.getControllerByUniqueData(uniqueData);
					tabController.onParentTreePathChanged(treePath);
				}
			}
		}
	},
	//stores: 'App.store.documents.Base', // for versions and children tab in the future
	init: function (data) {
		this.callParent(arguments);
		// decide what will be chosen as unique data for current inside always init() method
		/*this.register({
			i: data.i,
			m: data.m
		});*/
		this.register({
			id: data.id,
			//rootId: data.rootId,
			//fullPath: data.fullPath
		});
	},
	onClose: function () {
		return this.callParent(arguments);
	},
	onShow: function (tabPanel, eOpts) {
		this.callParent(arguments);
	},
	onLaunch: function (mainTabs, currentTab) {
		this.callParent(arguments);
		this.model = this.getModel(this.models[0]).create(this.data.id);
		this.model.loadDetail(
			this.data,
			function (response) {
				if (response.success) {
					this.onData(response);
				} else {
					App.instance.helpers.showNotification(
						t('Error'), t('Error by opening the file.'), 'error',
						response.message
					);
					this.onClose();
					this.mainTabs.remove(this.currentTab, true/* autoDestroy */);
    				Ext.destroy(this);
				}
			}.bind(this)
		);
	},
	onData: function (data) {
		this.setTitle(this.$getModelTitleRecord());
		this.callParent(arguments);
		// TODO: if document is locked - display alert message and shadow already created tab
	},
	$getModelTitleRecord: function () {
		return this.model.data.common.baseName;
	},
	onActiveStateChanged: function (newActiveStates) {
		var lang = '',
			localizedData = this.model.data.localized;
		for (lang in newActiveStates) {
			localizedData[lang].Active = newActiveStates[lang];
		}
		this.$$view.onActiveStateChanged(newActiveStates);
	},
	handlerReload: function () {
		if (this.getTabChanged()) {
			Ext.create(this.views[2], {
				callback: function (yesOrNo, undef, win) {
					if (yesOrNo == 'yes') this._handlerReloadProcess();
				}.bind(this),
				title: this.getTitle()
			}).confirm();
		} else {
			this._handlerReloadProcess();
		}
	},
	handlerTreeSelect: function (callback) {
		this.$getNavigationTree().selectPath(
			'root/' + this.model.getData().system.treeIdPath,
			'id',		// field
			'/',		// separator
			callback	// function (success, lastSelectedNodeRecord, node) {}
		);
	},
	$handlerSaveDisplaySubmitErrors: function (errors) {
		var errorTexts = [],
			errorText = '',
			tabKey = '',
			lang = '',
			tabErrors = {},
			tabLocalizedErrors = {},
			commonTemplate = t("(tab: '{0}', field: '{1}')"),
			localizedTemplate = t("(tab: '{0}', lang: '{1}', field: '{2}')"),
			rowTemplate = '<b style="color:red;">{0}.</b> <i style="color:#888;">{1}</i>';
		for (tabKey in errors.common) {
			tabErrors = errors.common[tabKey];
			for (var fieldName in tabErrors) {
				errorText = String.format(
					rowTemplate,
					this.$handlerSaveTranslateAndJoinErrors(tabErrors[fieldName]),
					String.format(commonTemplate, tabKey, fieldName)
				);
				errorTexts.push(errorText);
			}
		}
		for (tabKey in errors.localized) {
			tabErrors = errors.localized[tabKey];
			for (lang in tabErrors) {
				tabLocalizedErrors = tabErrors[lang];
				for (var fieldName in tabLocalizedErrors) {
					errorText = String.format(
						rowTemplate,
						this.$handlerSaveTranslateAndJoinErrors(tabLocalizedErrors[fieldName]),
						String.format(
							localizedTemplate, tabKey, t(String.format('Language ({0})', lang)).toLocaleLowerCase(), fieldName
						)
					);
					errorTexts.push(errorText);
				}
			}
		}
		App.instance.helpers.showNotification(
			t('Please correct these values to save document.'), '', 'error', errorTexts.join('<br />')
		);
	},
	$handlerSaveTranslateAndJoinErrors: function (errors) {
		var result = [];
		for (var i = 0, l = errors.length; i < l; i += 1) {
			result.push(t(errors[i]));
		}
		return result.join(' ');
	},
	_handlerReloadProcess: function () {
		var commonData = this.data.common;
		this.model.loadDetail(
			commonData,
			function (detailData) {
				this.$$view.onReloaded(detailData);
				setTimeout(function () {
					this.setTabChanged(false);
				}.bind(this), 100);
			}.bind(this)
		);
	},
	$getNavigationTree: function () {
		return this.$getMainController().getNavigationTree(0);
	}
});
