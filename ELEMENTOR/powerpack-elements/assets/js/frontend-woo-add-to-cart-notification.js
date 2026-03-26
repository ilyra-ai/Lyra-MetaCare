(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class WooAddToCartNotificationHandler extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {};
			}

			getDefaultElements() {
				return {
					$cartForm: $(".single-product .cart"),
					$stickyCartBtnArea: $(".pp-add-to-cart-sticky"),
				};
			}

			bindEvents() {
				if ( this.elements.$stickyCartBtnArea.length <= 0 || this.elements.$cartForm.length <= 0 ) {
					return;
				}
				this.addToCartStickyToggler();
				$(window).on( 'scroll', function() {
					this.addToCartStickyToggler();
				}.bind( this ) );

				// If Variations Product
				$(".pp-sticky-add-to-cart").on("click", function (e) {
					e.preventDefault();
					$("html, body").animate(
						{
							scrollTop: $(".single-product .cart").offset().top - 30,
						},
						500
					);
				});
			}

			addToCartStickyToggler() {
				var totalOffset    = this.elements.$cartForm.offset().top + this.elements.$cartForm.outerHeight(),
					windowScroll   = $( window ).scrollTop(),
					windowHeight   = $( window ).height(),
					documentHeight = $( document ).height();

					if (
						totalOffset < windowScroll &&
						windowScroll + windowHeight != documentHeight
					) {
						this.elements.$stickyCartBtnArea.addClass("pp-sticky-shown");
					} else if (
						windowScroll + windowHeight == documentHeight ||
						totalOffset > windowScroll
					) {
						this.elements.$stickyCartBtnArea.removeClass("pp-sticky-shown");
					}
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-woo-add-to-cart-notification', WooAddToCartNotificationHandler );
	} );
})(jQuery);