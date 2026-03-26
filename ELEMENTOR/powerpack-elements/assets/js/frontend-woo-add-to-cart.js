(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class WidgetPPWooAddToCart extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {};
			}

			getDefaultElements() {
				return {};
			}

			bindEvents() {
				if ( this.$element.length > 0 ) {
					var ppAddToCartQtyAjax =  this.$element.find( ".pp-woo-add-to-cart input.pp-add-to-cart-qty-ajax" );
				} else {
					var ppAddToCartQtyAjax =  $( ".pp-woo-add-to-cart input.pp-add-to-cart-qty-ajax" );
				}

				if ( $( ".pp-woo-add-to-cart input" ).hasClass( 'pp-add-to-cart-qty-ajax' ) ) {
					ppAddToCartQtyAjax.bind( 'keyup mouseup', function () {
						var ppAddToCartQtyAjaxVal = ppAddToCartQtyAjax.val();
						ppAddToCartQtyAjax.siblings( '.ajax_add_to_cart' ).attr( 'data-quantity', ppAddToCartQtyAjaxVal );
					} );
				}

				$("body")
					.off("added_to_cart.pp_cart")
					.on("added_to_cart.pp_cart", function (
						e,
						fragments,
						cart_hash,
						this_button
					) {
						if (
							$(this_button)
								.parent()
								.parent()
								.parent()
								.hasClass("elementor-widget-pp-woo-add-to-cart")
						) {
							var $btn = $(this_button);

							if ($btn.length > 0) {
								// View cart text.
								if (
									!pp_woo_products_script.is_cart &&
									$btn.hasClass("added")
								) {
									if( $btn.hasClass( 'pp-redirect' ) ) {
										setTimeout(function () {
											window.location =
												pp_woo_products_script.cart_url;
										}, 500);
									}
								}
							}
						}
					});
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-woo-add-to-cart', WidgetPPWooAddToCart );
	} );
})(jQuery);