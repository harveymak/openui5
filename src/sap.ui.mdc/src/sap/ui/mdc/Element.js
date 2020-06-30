/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element", "sap/ui/mdc/mixin/DelegateMixin"
], function(CoreElement, DelegateMixin) {
	"use strict";

	/**
 	 * Creates and initializes a new MDC element with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new element; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class The base class for MDC composite elements providing delegate-related functionality (see {@link sap.ui.mdc.mixin.DelegateMixin}).
	 *
	 * @extends sap.ui.core.Element
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.Element
	 *
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.awaitControlDelegate as awaitControlDelegate
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getControlDelegate as getControlDelegate
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getPayload as getPayload
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getTypeUtil as getTypeUtil
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.initControlDelegate as initControlDelegate
	 * @private
	 * @experimental
	 * @since 1.74
	*/
	var Element = CoreElement.extend("sap.ui.mdc.Element", /** @lends sap.ui.mdc.Element.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Path to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 *
				 * @experimental
				 */
				delegate: {
					type: "object",
					group: "Data"
				}
			}
		},
		renderer: CoreElement.renderer
	});

	DelegateMixin.call(Element.prototype);

	return Element;
});