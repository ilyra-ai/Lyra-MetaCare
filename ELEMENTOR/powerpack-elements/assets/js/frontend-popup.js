(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class PopupBoxWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				const config = this.$element.find('.pp-modal-popup').data('popup-settings');
				return {
					selectors: {
						popup: '.pp-modal-popup',
					},
					popupType: config.popupType,
					src: config.src,
					triggerElement: config.triggerElement,
					popupDisableOn: undefined !== config.disableOn ? config.disableOn : '',
					iframeClass: undefined !== config.iframeClass ? config.iframeClass : '',
					displayAfter: undefined !== config.displayAfter ? config.displayAfter : '',
					queryParameter: config.queryParameter,
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$popup: this.$element.find( selectors.popup ),
				};
			}

			getPopupArgs() {
				const elementSettings = this.getElementSettings(),
					settings          = this.getSettings(),
					closeButtonPos    = elementSettings.close_button_position,
					preventScroll     = ( 'yes' === elementSettings.prevent_scroll ) ? true : false;

				let popupArgs = {
					disableOn			: settings.popupDisableOn,
					showCloseBtn		: ( 'yes' === elementSettings.close_button ) ? true : false,
					enableEscapeKey		: ( 'yes' ===  elementSettings.esc_exit ) ? true : false,
					closeOnBgClick		: ( 'yes' ===  elementSettings.click_exit ) ? true : false,
					closeOnContentClick	: ( 'yes' ===  elementSettings.content_close ) ? true : false,
					closeMarkup			: '<div class="mfp-close">&#215;</div>',
					closeBtnInside		: ( 'win-top-left' === closeButtonPos || 'win-top-right' === closeButtonPos ) ? false : true,
					removalDelay		: 500,
					callbacks			: {
						open : function() {
							$(document).trigger('ppe-popup-opened', [ this.getID() ]);
							if ( !preventScroll ) {
								$('html').css({ 'overflow' : '' });
							}
						}.bind(this),
						close : function() {
							if ( !preventScroll ) {
								$('html').css({ 'overflow' : 'hidden' });
							}
						}
					}
				};

				return popupArgs;
			}

			bindEvents() {
				if ( this.$element.hasClass('pp-visibility-hidden') ) {
					return;
				}

				this.initPreview();

				const elementSettings = this.getElementSettings(),
					settings          = this.getSettings(),
					trigger           = elementSettings.trigger,
					queryParameter    = settings.queryParameter,
					enableUrlTrigger  = elementSettings.enable_url_trigger;

				let triggerButtonElement = $('.pp-modal-popup-link');

				$(window).on( 'load', function() {
					if ( 'yes' === enableUrlTrigger ) {
						this.initTriggerPopup();
					}
				}.bind(this) );

				let popupArgs = this.getPopupArgs();

				// If is not disabled for particular device size then show the popup button.
				if ( ( undefined !== popupArgs.disableOn &&  $(window).width() > popupArgs.disableOn ) || ( undefined === popupArgs.disableOn ) ) {
					triggerButtonElement.show(); // Show button when device disabled off.

					if ( 'exit-intent' === trigger ) {
						this.initExitIntentPopup();
					}
					else if ( 'page-load' === trigger ) {
						this.initPageLoadPopup();
					} else if ( 'query_parameter' === trigger ) {
						if ( queryParameter === 1 ) {
							popupArgs.items = {
								src: settings.src 
							};
							$.magnificPopup.open( popupArgs );
						}
					} else {
						this.initOnClickPopup();
					}
				} else {
					triggerButtonElement.hide(); // Hide button when device disabled on.
				}
			}

			getMainClass() {
				const elementSettings = this.getElementSettings(),
					overlay           = elementSettings.overlay_switch,
					popupLayout       = 'pp-modal-popup-' + elementSettings.layout_type,
					closeButtonPos    = elementSettings.close_button_position,
					effect            = 'animated' + ' ' + elementSettings.popup_animation_in;

				let mainClass = ' ' + 'pp-modal-popup-' + this.getID() + ' ' + popupLayout + ' ' + closeButtonPos + ' ' + effect;

				if ( 'yes' !== overlay ) {
					mainClass += ' ' + 'pp-no-overlay';
				}

				return mainClass;
			}

			initPreview() {
				const widgetId = this.getID(),
					settings   = this.getSettings();

				let popupArgs = this.getPopupArgs();

				$.magnificPopup.close();

				if ( $('#pp-modal-popup-wrap-' + widgetId).hasClass('pp-popup-preview') ) {
					popupArgs.items = {
						src:  settings.src,
						type: settings.popupType
					};
					popupArgs.mainClass = this.getMainClass();

					$.magnificPopup.open( popupArgs );
				}
			}

			initTriggerPopup() {
				const urlLink = window.location.href,
					hashPopupId = urlLink.split('#')[1];

				this.loadURLPopup(hashPopupId);

				let self = this;

				$('a').click(function(evt) {
					const url = $(this).attr('href');

					if (url && url.startsWith('#')) {
						const hashPopupId = url.slice(1); // Remove '#' from the URL fragment

						// Check if the hashPopupId corresponds to a popup
						const popupElement = $("[data-url-identifier='" + hashPopupId + "']");
						if (popupElement.length > 0) {
							evt.preventDefault(); // Prevent anchor scrolling
							self.loadURLPopup(hashPopupId); // Load the popup
						}
					}
				});
			}

			loadURLPopup(hashPopupId) {
				const settings = this.getSettings();

				let src = settings.src,
					popupArgs = this.getPopupArgs();

				if (hashPopupId) {
					const popupElement = $("[data-url-identifier='" + hashPopupId + "']");
					src = popupElement.data('src');

					if (src) {
						popupArgs.items = {
							src: src,
							type: settings.popupType
						};
						popupArgs.mainClass = this.getMainClass();
						$.magnificPopup.open(popupArgs);
					}
				}
			}

			initExitIntentPopup() {
				const settings   = this.getSettings(),
					displayAfter = settings.displayAfter,
					popupId      = 'popup_' + this.getID();

				let popupArgs = this.getPopupArgs(),
					mouseY    = 0,
					topValue  = 0;

				if ( 0 === displayAfter ) {
					$.removeCookie(popupId, { path: '/' });
				}

				popupArgs.items = {
					src: settings.src
				};
				popupArgs.type = settings.popupType;
				popupArgs.mainClass = 'mfp-fade mfp-fade-side';

				$(document).on( 'mouseleave', function( e ) {
					mouseY = e.clientY;

					if ( mouseY < topValue && !$.cookie(popupId) ) {
						$.magnificPopup.open( popupArgs );

						if ( displayAfter > 0 ) {
							$.cookie(popupId, displayAfter, { expires: displayAfter, path: '/' });
						} else {
							$.removeCookie( popupId );
						}
					}
				} );
			}

			initPageLoadPopup() {
				const settings   = this.getSettings(),
					displayAfter = settings.displayAfter,
					popupId      = 'popup_' + this.getID();

				let popupArgs = this.getPopupArgs();

				if ( 0 === displayAfter ) {
					$.removeCookie(popupId, { path: '/' });
				}

				popupArgs.items = {
					src: settings.src
				};
				popupArgs.type = settings.popupType;

				if ( !$.cookie(popupId) ) {
					setTimeout(function() {
						$.magnificPopup.open( popupArgs );

						if ( displayAfter > 0 ) {
							$.cookie(popupId, displayAfter, { expires: displayAfter, path: '/' });
						} else {
							$.removeCookie( popupId );
						}
					}, settings.delay);
				}
			}

			initOnClickPopup() {
				const settings = this.getSettings();

				let popupArgs      = this.getPopupArgs(),
					triggerElement = settings.triggerElement;

				if ( typeof 'undefined' === triggerElement || '' === triggerElement ) {
					triggerElement = '.pp-modal-popup-link';
				}

				popupArgs.iframe = {
					markup: '<div class="' + settings.iframeClass + '">' +
						'<div class="modal-popup-window-inner">' +
						'<div class="mfp-iframe-scaler">' +
							'<div class="mfp-close"></div>' +
							'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
						'</div>' +
						'</div>' +
						'</div>'
				};

				popupArgs.items = {
					src: settings.src,
					type: settings.popupType
				};
				popupArgs.mainClass = this.getMainClass();

				$(triggerElement).magnificPopup(popupArgs);
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-modal-popup', PopupBoxWidget );
	} );
})(jQuery);
