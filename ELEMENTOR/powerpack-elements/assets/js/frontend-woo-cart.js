(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class WooCartWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						quantityInput: '.qty',
						updateCartButton: 'button[name=update_cart]',
					},
				};
			}

			getDefaultElements() {
				return {};
			}

			bindEvents() {
				const elementSettings = this.getElementSettings(),
					selectors         = this.getSettings( 'selectors' );

				var that = this;
				if ( 'yes' === elementSettings.update_cart_automatically ) {
					this.$element.on( 'input', selectors.quantityInput, function ( e ) {
						that.updateCart();
					} );
				}
			}

			updateCart() {
				const selectors = this.getSettings( 'selectors' );
				let timeout;
				var that = this;
				clearTimeout( timeout );
				timeout = setTimeout( function() {
					that.$element.find( selectors.updateCartButton ).trigger( 'click' );
				}, 1500 );
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-woo-cart', WooCartWidget );
	} );
})(jQuery);