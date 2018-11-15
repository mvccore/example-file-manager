Ext.define("App.model.files.File", {
	extend: 'Ext.data.Model',
    fields: [
		// type: auto - means no conversions
        { name: 'common',	type: 'auto' },
        { name: 'system',	type: 'auto' },
        { name: 'editing',	type: 'auto' },
        { name: 'changes',	type: 'auto' }
    ],
    statics: {
    	create: function (id) {
    		var initParams = {},
                instance;
    		initParams[this.prototype.idProperty] = id;
    		instance = new this(initParams);
    		return instance;
    	}
    },
	loadDetail: function (uniqueData, callback) {
    	Ext.Ajax.request({
    		url: Settings.URLS.FILE.READ,
    		method: "POST",
    		params: {
				fullPath: uniqueData.fullPath,
				rootId: uniqueData.rootId
    		},
			success: function (xhr, opts) {
				var response = Ext.decode(xhr.responseText);
				if (response.success) this._processDetailResponse(response);
    			callback(response);
    		}.bind(this)
    	});
    },
    update: function (newValues, callback) {
    	var data = this.getData();
		var newData = this._updateData(data, newValues);
		var params = {
			fullPath: data.common.fullPath,
			rootId: data.system.rootId,
			baseName: newData.common.baseName.base64Encode(),
			dirPath: newData.common.dirPath.base64Encode(),
			lastChange: data.system.lastChange,
			encoding: data.common.encoding
		}
		if (isset(newValues, 'common.content')) 
			params.content = newData.common.content.base64Encode();
		if (Settings.PLATFORM == 'win' && Settings.SYSTEM_CALLS) {
			params.attrs = [
				newData.common.archive, newData.common.readOnly,
				newData.common.hidden, newData.common.system
			].join(',');
		} else if (Settings.SYSTEM_CALLS || Settings.CHMOD) {
			params.attrs = newData.common.attrs;
		}
    	Ext.Ajax.request({
    		url: Settings.URLS.FILE.UPDATE,
    		method: "POST",
    		params: params,
			success: function (xhr, opts) {
				var response = Ext.decode(xhr.responseText);
				if (response.success) this._processDetailResponse(response);
    			callback(response);
    		}.bind(this)
    	});
    },
    move: function (uniqueData, callback) {
    	Ext.Ajax.request({
    		url: Settings.URLS.FILE.MOVE,
    		method: "POST",
    		params: {
				fullPath: uniqueData.fullPath,
				rootId: uniqueData.rootId
    		},
    		success: function (xhr, opts) {
    			var response = Ext.decode(xhr.responseText);
    			callback(response);
    		}.bind(this)
    	});
    },
	/*rename: function (uniqueData, callback) {
    	Ext.Ajax.request({
    		url: Settings.URLS.FILE.RENAME,
    		method: "POST",
    		params: {
				fullPath: uniqueData.fullPath,
				rootId: uniqueData.rootId
    		},
    		success: function (xhr, opts) {
    			var response = Ext.decode(xhr.responseText);
    			callback(response);
    		}.bind(this)
    	});
    },*/
	remove: function (uniqueData, callback) {
    	Ext.Ajax.request({
    		url: Settings.URLS.FILE.DELETE,
    		method: "POST",
    		params: {
				rootId: uniqueData.rootId,
				fullPath: uniqueData.fullPath
    		},
    		success: function (xhr, opts) {
    			var response = Ext.decode(xhr.responseText);
    			if (!response.success) 
    				App.instance.helpers.showNotification(t('Error'), response.message, 'error');
    			callback(response.removedFullPaths);
    		}.bind(this)
    	});
    },
    create: function (params, callback) {
    	params.data = Ext.encode(params.data).toUnicodeIndexes().join(',');
    	Ext.Ajax.request({
    		url: Settings.URLS.FILE.CREATE,
    		method: "POST",
    		params: params,
    		success: function (xhr, opts) {
    			var response = Ext.decode(xhr.responseText);
    			if (!response.success) {
    				App.instance.helpers.showNotification(t('Error'), response.message, 'error');
    				response.errors = response.errors || {};
    				response.errors.all = response.message;
    				response.created = false;
    			}
    			callback(response);
    		}.bind(this)
    	});
	},
	_processDetailResponse: function (response) {
		response.common.baseName = response.common.rawBaseName.base64Decode();
		response.common.dirPath = response.common.rawDirPath.base64Decode();
		if (typeof(response.common.rawContent) == 'string') {
			response.common.content = response.common.rawContent.base64Decode(
				response.common.encoding != 'binary' ? response.common.encoding : null
			);
			delete response.common.rawContent;
		}
		delete response.common.rawBaseName;
		delete response.common.rawDirPath;
    	this.set(response);
	},
    _updateData: function (data, newValues) {
    	if (RealTypeOf(data) == 'Null') data = {};
    	if (RealTypeOf(newValues) == 'Null') newValues = {};
		for (var key in newValues) {
			if (typeof (newValues[key]) == 'object') {
				data[key] = this._updateData(
					typeof (data[key]) != 'undefined' ? data[key] : {},
					typeof (newValues[key]) != 'undefined' ? newValues[key] : {}
				);
			} else {
				data[key] = newValues[key];
			}
		}
    	return data;
    }
});
