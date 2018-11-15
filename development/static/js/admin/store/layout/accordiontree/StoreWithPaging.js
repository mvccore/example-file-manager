Ext.define('App.store.layout.accordiontree.StoreWithPaging', {
	extend: 'Ext.data.TreeStore',
	requires: [
		'App.view.layout.accordiontree.Tree'
	],
	autoLoad: true,
	autoSync: false,
	nodeParam: 'id', // default: 'node'
	// proxy: {type: 'ajax', url: 'url is set dynamicly by Main controller '} 
	root: {
    	expanded: true
    },
	ptb: false, // paging toolbar button
	pageSize: App.view.layout.accordiontree.Tree.ITEMS_PER_PAGE,
    listeners: {
    	beforeload: function (store, operation, eOpts) {
    		var nodeRawValues = operation.node.data,
				operationParams = operation.config.params;
			if (typeof(nodeRawValues) == 'undefined') {
				operationParams.rootId = '';
				operationParams.fullPath = '';
            } else {
				operationParams.rootId = nodeRawValues.rootId;
				operationParams.fullPath = nodeRawValues.fullPath;
            }
            return true;
        }
    },
	onProxyLoad: function (operation) {
    	try {
    		var options = operation.initialConfig,
    			node = options.node,
    			response = {},
    			data = {},
    			total = 0,
    			text = '';
    		response = operation.getResponse();
    		if (!response) {
    			this.superclass.onProxyLoad.call(this, operation);
    			return;
    		} else {
    			data = Ext.decode(response.responseText);
    			total = data.total;
    			text = node.data.text;
    		}
    		// console.log("total nodes for  " + text + " (" + total + ")");
    		if (typeof total == 'undefined') total = 0;
    		//if (!node.decorated) {
    		//    node.decorated = true;
    		//    if (node.data && node.data.text) {
    		//        node.data.text = node.data.text + " (" + total + ")" ;
    		//    }
    		//}
    		node.addListener('expand', function (node) {
    			var tree = node.getOwnerTree();
    			if (tree) {
    				var view = tree.getView();
    				if (view.updatePaging) view.updatePaging();
    			}
    		}.bind(this));
    		//to hide or show the expanding icon depending if childs are available or not
    		node.addListener('remove', function (node, removedNode, isMove) {
    			if (!node.hasChildNodes()) node.set('expandable', false);
    		});
    		node.addListener('append', function (node) {
    			node.set('expandable', true);
    		});
    		if (this.pageSize < total) {
    			node.needsPaging = true;
    			node.pagingData = {
    				total: data.total,
    				offset: data.offset,
    				limit: data.limit
    			}
    		}
    		this.superclass.onProxyLoad.call(this, operation);
    		//var store = node.getTreeStore();
    		var proxy = this.getProxy();
    		proxy.setExtraParam('offset', 0);
    	} catch (e) {
    		console.log(e);
    	}
    }
});
