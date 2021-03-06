/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/base/security/encodeCSS"],
	function(library, encodeCSS) {
	"use strict";

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = library.GenericTileMode;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	// shortcut for sap.m.FrameType
	var frameTypes = library.FrameType;

	/**
	 * GenericTile renderer.
	 * @namespace
	 */
	var GenericTileRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	GenericTileRenderer.render = function(oRm, oControl) {
		// Write the HTML into the render manager.
		var sTooltipText = oControl._getTooltipText();
		var sAriaText = oControl._getAriaText();
		var sHeaderImage = oControl.getHeaderImage();
		var bHasPress = oControl.hasListeners("press");
		var sState = oControl.getState();
		var sStateClass = encodeCSS("sapMGTState" + sState);
		var sScopeClass;
		var frameType = oControl.getFrameType();

		// Render a link when URL is provided, not in action scope and the state is enabled
		var bRenderLink = oControl.getUrl() && !oControl._isInActionScope() && sState !== LoadState.Disabled;

		if (oControl._isInActionScope()) {
			sScopeClass = encodeCSS("sapMGTScopeActions");
		} else {
			sScopeClass = encodeCSS("sapMGTScopeDisplay");
		}

		if (bRenderLink) {
			oRm.write("<a");
			oRm.writeAttributeEscaped("href", oControl.getUrl());
			oRm.writeAttribute("draggable", "false"); // <a> elements are draggable per default, use UI5 DnD instead
		} else {
			oRm.write("<div");
		}

		oRm.writeControlData(oControl);
		if (sTooltipText) {
			oRm.writeAttributeEscaped("title", sTooltipText);
		}

		oRm.addClass("sapMGT");
		oRm.addClass(sStateClass);
		oRm.addClass(sScopeClass);
		// render actions view for SlideTile actions scope
		if (!oControl._isInActionScope() && oControl._bShowActionsView) {
			oRm.addClass("sapMGTScopeActions");
		}
		oRm.addClass(frameType);
		if (!bRenderLink) { // buttons only; <a> elements always have the default role
			oRm.writeAttribute("role", bHasPress ? "button" : "presentation");
		}
		oRm.writeAttributeEscaped("aria-label", sAriaText);
		if (sState !== LoadState.Disabled) {
			if (!oControl.isInActionRemoveScope()) {
				oRm.addClass("sapMPointer");
			}
			oRm.writeAttribute("tabindex", "0");
		}
		if (oControl.getWidth()) {
			oRm.write(" style='width: " + oControl.getWidth() + ";");
		}
		if (oControl.getBackgroundImage()) {
			oRm.write(oControl.getWidth() ? " background-image:url(\"" : "style='background-image:url(\"");
			oRm.writeEscaped(oControl.getBackgroundImage());
			oRm.write("\");'");
			oRm.addClass("sapMGTBackgroundImage");
		} else {
			oRm.write("'");
		}
		if (oControl.getMode() === GenericTileMode.HeaderMode) {
			oRm.addClass("sapMGTHeaderMode");
		}
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapMGTHdrContent");
		oRm.addClass(frameType);
		if (sTooltipText) {
			oRm.writeAttributeEscaped("title", sTooltipText);
		}
		oRm.writeClasses();
		oRm.write(">");
		if (sHeaderImage) {
			oRm.renderControl(oControl._oImage);
		}

		this._renderHeader(oRm, oControl);
		var aTileContent = oControl.getTileContent();
		var iLength = aTileContent.length;
		var isHalfFrame = frameType === frameTypes.OneByHalf || frameType === frameTypes.TwoByHalf;
		var isContentPresent = false;
		for (var i = 0; i < iLength; i++) {
			if (aTileContent[i].getAggregation("content") !== null){
				if (frameType === frameTypes.OneByHalf && aTileContent[i].getAggregation("content").getMetadata()._sClassName === "sap.m.ImageContent") {
					isContentPresent = false;
				} else {
					isContentPresent = true;
					break;
				}
			}
		}
		if (!(isHalfFrame && isContentPresent)) {
			if (oControl.getSubheader()) {
				this._renderSubheader(oRm, oControl);
			}
		}

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMGTContent");
		oRm.writeClasses();

		oRm.writeAttribute("id", oControl.getId() + "-content");
		oRm.write(">");
		for (var i = 0; i < iLength; i++) {
			oControl._checkFooter(aTileContent[i], oControl);
			oRm.renderControl(aTileContent[i]);
		}
		oRm.write("</div>");

		if (sState !== LoadState.Loaded) {
			this._renderStateOverlay(oRm, oControl, sTooltipText);
		}

		if (sState !== LoadState.Disabled) {
			this._renderHoverOverlay(oRm, oControl);
			this._renderFocusDiv(oRm, oControl);
		}

		if (oControl._isInActionScope()) {
			this._renderActionsScope(oRm, oControl);
		}
		if (bRenderLink) {
			oRm.write("</a>");
		} else {
			oRm.write("</div>");
		}
	};

	GenericTileRenderer._renderFocusDiv = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTFocusDiv");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-focus");
		oRm.write(">");
		oRm.write("</div>");
	};

	GenericTileRenderer._renderStateOverlay = function(oRm, oControl, sTooltipText) {
		var sState = oControl.getState();
		oRm.write("<div");
		oRm.addClass("sapMGTOverlay");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-overlay");
		if (sTooltipText) {
			oRm.writeAttributeEscaped("title", sTooltipText);
		}
		oRm.write(">");
		switch (sState) {
			case LoadState.Loading :
				oControl._oBusy.setBusy(sState == LoadState.Loading);
				oRm.renderControl(oControl._oBusy);
				break;
			case LoadState.Failed :
				oRm.write("<div");
				oRm.writeAttribute("id", oControl.getId() + "-failed-ftr");
				oRm.addClass("sapMGenericTileFtrFld");
				oRm.writeClasses();
				oRm.write(">");
				oRm.write("<div");
				oRm.writeAttribute("id", oControl.getId() + "-failed-icon");
				oRm.addClass("sapMGenericTileFtrFldIcn");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl._oWarningIcon);
				oRm.write("</div>");

				if (!oControl._isInActionScope() && !oControl._bShowActionsView) {
					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-text");
					oRm.addClass("sapMGenericTileFtrFldTxt");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("_failedMessageText"));
					oRm.write("</div>");
				}

				oRm.write("</div>");
				break;
			default :
		}
		oRm.write("</div>");
	};

	GenericTileRenderer._renderActionsScope = function(oRm, oControl) {
		if (oControl.getState() !== LoadState.Disabled) {
			oRm.renderControl(oControl._oRemoveButton);
			oRm.renderControl(oControl._oMoreIcon);
		}
	};

	GenericTileRenderer._renderHoverOverlay = function(oRm, oControl) {
		oRm.write("<div");
		if (oControl.getBackgroundImage()) {
			oRm.addClass("sapMGTWithImageHoverOverlay");
		} else {
			oRm.addClass("sapMGTWithoutImageHoverOverlay");
		}
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hover-overlay");
		oRm.write(">");
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the header of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 */
	GenericTileRenderer._renderHeader = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.renderControl(oControl._oTitle);
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the subheader of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose description should be rendered
	 */
	GenericTileRenderer._renderSubheader = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.renderControl(oControl._oSubTitle);
		oRm.write("</div>");
	};

	return GenericTileRenderer;

}, /* bExport= */true);
