/****************************************************
* FCKEditor Extension
*****************************************************/

Ext.define('Ext.ux.form.Wysiwyg', {
	extend: 'Ext.form.field.TextArea',
	alias: [
        'widget.wysiwygfield',
        'widget.wysiwyg'
    ],
    alternateClassName: [
		'Ext.form.Wysiwyg',
		'Ext.form.field.Wysiwyg'
	],
    requires: [
        'Ext.ux.form.ckeditor.ckeditor'
    ],
	config: {
		cls: 'x-form-type-wysiwyg'
		/*,defaultToolbarGroups: [
			{ name: 'clipboard', groups: [ "sourcedialog", 'clipboard', 'undo', "find" ] },
			{ name: 'basicstyles', groups: [ 'basicstyles', 'list'] },
			'/',
			{ name: 'paragraph', groups: [ 'align', 'indent'] },
			{ name: 'blocks' },
			{ name: 'links' },
			{ name: 'insert' },
			"/",
			{ name: 'styles' },
			{ name: 'tools', groups: ['colors', "tools", 'cleanup', 'mode', "others"] }
		]*/
	},
	_id: null,
	_ct: null,
	_position: null,
	_noLabel: false,
	_rendered: false,
	_editorReady: false,
	_instance: null,
	_textarea: null,
	_originalValue: '',
	constructor: function (config) {
		this.config = config;
		this.callParent([config]);
		this.on({
			boxready: this._renderWysiwyg,
			scope: this
		});
	},
	onRender: function (ct, position)
	{
		this._ct = ct;
		this._position = position;
		this.callParent([ct, position]);
		if (this.el) {
			this._textarea = this.el.dom.querySelector('div > textarea');
		}
		if (typeof (this.initialConfig.noLabel) == 'boolean') {
			this._noLabel = this.initialConfig.noLabel;
		}
		if (this.isVisible()) {
			this._renderWysiwyg();
		}
		this.callParent(arguments);
	},
	_renderWysiwyg: function () {
		if (this._rendered) return;
		var replaceElm;
		if (!this.el) {
            this.defaultAutoCreate = { 
                tag: "textarea", 
                autocomplete: "off" 
            };
			this._id = this.id;
		} else if (this._noLabel) {
			this.el = Ext.get(this._textarea.id);
			this.el.addCls(this.config.cls);
			this._id = this.el.dom.id;
		} else {
			replaceElm = this.el.child('div.x-form-textarea-body');
			this.el.addCls(this.config.cls);
			this._id = replaceElm.id;
		}
		var wysiwygConfig = this.initialConfig.config || {};
		if (typeof (this.initialConfig.width) != 'undefined') {
			wysiwygConfig.width = this.initialConfig.width;
			if (!this._noLabel && this._textarea) {
				wysiwygConfig.width = this._textarea.offsetWidth;
			}
		};
		/*if (typeof(wysiwygConfig.toolbarGroups) == 'undefined') {
			wysiwygConfig.toolbarGroups = this.config.defaultToolbarGroups;
		}*/
		if (typeof (this.initialConfig.readOnly) != 'undefined') {
			wysiwygConfig.readOnly = this.initialConfig.readOnly;
		};
		wysiwygConfig.langCode = Settings.ADMIN_LANG;
		wysiwygConfig.removePlugins = 'bgcolor';
		wysiwygConfig.allowedContent = true; // disables CKEditor ACF (will remove pimcore_* attributes from links, etc.)

		wysiwygConfig.on = {
			instanceReady: function (evt) {
				this._editorReady = true;
				if (this.newSizes.length > 0) {
					this._instance.resize.apply(this._instance, this.newSizes);
					this.newSizes = [];
				}
				this.fireEventArgs('instanceReady', [this._instance]);
			}.bind(this)
		};
		this.newSizes = [];
			
		if (typeof (this.initialConfig.height) != 'undefined') wysiwygConfig.height = this.initialConfig.height;
		this._originalValue = this.getRawValue();
		
		if (CKEDITOR.instances[this._id]) CKEDITOR.remove(CKEDITOR.instances[this._id]);
		this._instance = CKEDITOR.replace(this._id, wysiwygConfig);

		this._rendered = true;

		this.setValue(this._originalValue);
		
		this._instance.on('change', this._checkChange.bind(this));
		// any other events you can init here in the same way like change event above
    },
	_checkChange: function (ckeditorEvent)
	{
		this._instance.updateElement();
		this.fireEvent('change');
	},
    getValue: function () {
    	if (this._rendered) this._instance.updateElement();
        return this.callParent();
    },
    setValue: function (value) {
		this.callParent([value]);
		if (this._rendered) this._instance.setData(value);
    },
    getData: function () {
        if (this._rendered) this._instance.updateElement();
        return this.callParent();
    },
    setData: function (value) {
		this.callParent([value]);
		if (this._rendered) this._instance.setData(value);
    },
    getRawValue: function () {
		if (this._rendered) this._instance.updateElement();
        return this.callParent();
    },
    setRawValue: function (value) {
		this.callParent([value]);
        if (this._rendered) this._instance.insertHtml(value);
    },
	enable: function (silent) {
		this.callParent(arguments);
		this._instance.setReadOnly(true);
	},
	disable: function (silent) {
		this.callParent(arguments);
		this._instance.setReadOnly(false);
	},
	setReadOnly: function (readOnly) {
		this.callParent(arguments);
		this._instance.setReadOnly(true);
	},
	resize: function (w, h, isContentHeight, resizeInner) {
		if (this._editorReady) {
			this._instance.resize(w, h, isContentHeight, resizeInner);
		} else {
			this.newSizes = [w, h, isContentHeight, resizeInner];
		}
	},
	isValid: function () {
		var initCfg = this.initialConfig,
			value = String(this.getValue()).trim(),
			required = typeof (initCfg.allowBlank) == 'boolean' && !initCfg.allowBlank;
		return required && value.length === 0 ? false : true;
	},
	destroyInstance: function(){
		if (this._rendered) delete CKEDITOR.instances[this._id];
    }
});