(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class AlbumWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						album: '.pp-album',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$album: this.$element.find( selectors.album ),
				};
			}

			bindEvents() {
				this.initFancybox();
			}

			initFancybox() {
				const elementSettings = this.getElementSettings(),
					$id               = this.elements.$album.data('id'),
					fancyboxThumbs    = this.elements.$album.data('fancybox-class'),
					fancyboxAxis	  = this.elements.$album.data('fancybox-axis'),
					lightboxSelector  = '[data-fancybox="' + $id + '"]';

				if ( 'fancybox' === elementSettings.lightbox_library ) {
					$(lightboxSelector).fancybox({
						loop:             'yes' === elementSettings.loop,
						arrows:           'yes' === elementSettings.arrows,
						infobar:          'yes' === elementSettings.slides_counter,
						keyboard:         'yes' === elementSettings.keyboard,
						toolbar:          'yes' === elementSettings.toolbar,
						buttons:          elementSettings.toolbar_buttons,
						animationEffect:  elementSettings.lightbox_animation,
						transitionEffect: elementSettings.transition_effect,
						baseClass:        fancyboxThumbs,
						thumbs: {
							autoStart: 'yes' === elementSettings.thumbs_auto_start,
							axis:      fancyboxAxis
						}
					});
				}
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-album', AlbumWidget );
	} );
})(jQuery);