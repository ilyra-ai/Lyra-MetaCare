(function($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class ShowcaseWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						carousel: '.pp-showcase-preview',
						sliderWrap: '.pp-showcase-preview-wrap',
						item: '.pp-showcase-preview-item',
						navWrap: '.pp-showcase-navigation-items',
						nav: '.pp-showcase-navigation-item-wrap',
						videoPlay: '.pp-showcase .pp-video-play',
					},
					slidesPerView: {
						widescreen: 3,
						desktop: 3,
						laptop: 3,
						tablet_extra: 3,
						tablet: 2,
						mobile_extra: 2,
						mobile: 1
					}
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$carousel: this.$element.find( selectors.carousel ),
					$sliderWrap: this.$element.find( selectors.sliderWrap ),
					$item: this.$element.find( selectors.item ),
					$navWrap: this.$element.find( selectors.navWrap ),
					$nav: this.$element.find( selectors.nav ),
					$videoPlay: this.$element.find( selectors.videoPlay ),
				}
			}

			getSlidesCount() {
				return this.elements.$nav.length;
			}

			getDeviceSlidesPerView(device) {
				const slidesPerViewKey = 'nav_items' + ('desktop' === device ? '' : '_' + device);
				return Math.min(this.getSlidesCount(), +this.getElementSettings(slidesPerViewKey) || this.getSettings('slidesPerView')[device]);
			}

			getSlickOptions(type) {
				let sliderType = ( undefined !== type ) ? type : 'main';
				const elementSettings = this.getElementSettings(),
					$rtl              = this.elements.$carousel.data( 'rtl' ),
					scrollableNav     = elementSettings.scrollable_nav,
					previewPosition   = elementSettings.preview_position,
					stackOn           = elementSettings.preview_stack;
				let slidesToShow,
					arrows,
					dots;

				if ( 'main' === sliderType ) {
					slidesToShow = 1;
					arrows       = 'yes' === elementSettings.arrows;
					dots         = 'yes' === elementSettings.dots;
				} else {
					slidesToShow = ( undefined !== elementSettings.nav_items && '' !== elementSettings.nav_items ) ? parseInt( elementSettings.nav_items, 10 ) : 5;
					arrows       = false,
					dots         = false;
				}

				const slickOptions = {
					slidesToShow:   slidesToShow,
					slidesToScroll: 1,
					autoplay:       'yes' === elementSettings.autoplay,
					arrows:         arrows,
					dots:           dots,
					infinite:       'yes' === elementSettings.infinite_loop,
				};

				if ( 'yes' === elementSettings.autoplay ) {
					slickOptions.autoplaySpeed = elementSettings.autoplay_speed;
				}

				if ( 'main' === sliderType ) {
					slickOptions.rtl = 'yes' === $rtl;
					slickOptions.adaptiveHeight = 'yes' === elementSettings.adaptive_height;
					slickOptions.pauseOnHover = 'yes' === elementSettings.pause_on_hover;
					slickOptions.speed = elementSettings.animation_speed;
					slickOptions.fade = 'fade' === elementSettings.effect;
					slickOptions.prevArrow = '.pp-arrow-prev-' + this.getID();
					slickOptions.nextArrow = '.pp-arrow-next-' + this.getID();
					slickOptions.asNavFor = ( 'yes' === scrollableNav ) ? this.elements.$navWrap : '';
				} else {
					slickOptions.focusOnSelect = true;
					slickOptions.vertical = ( 'top' === previewPosition || 'bottom' === previewPosition ) ? false : true;
					slickOptions.centerMode = 'yes' === elementSettings.nav_center_mode;
					slickOptions.centerPadding = '0px';
					slickOptions.asNavFor = this.elements.$carousel;

					const breakpointsSettings = {},
					breakpoints = elementorFrontend.config.responsive.activeBreakpoints;
					
					Object.keys(breakpoints).forEach((breakpointName, index) => {
						if ( 'widescreen' !== breakpointName ) {
							const stackOnDevice = ( undefined === stackOn ) ? '' : stackOn;
							let vertical = true;

							if ( 'tablet' === stackOnDevice && ( 'tablet' === breakpointName || 'mobile_extra' === breakpointName || 'mobile' === breakpointName ) ) {
								vertical = false;
							}

							if ( 'mobile' === stackOnDevice && ( 'mobile_extra' === breakpointName || 'mobile' === breakpointName ) ) {
								vertical = false;
							}

							breakpointsSettings[index] = {
								breakpoint: breakpoints[breakpointName].value + 1,
								settings: {
									slidesToShow: this.getDeviceSlidesPerView(breakpointName),
									slidesToScroll: 1,
									vertical: vertical
								}
							}
						}
					});

					slickOptions.responsive = Object.values(breakpointsSettings);
				}

				return slickOptions;
			}

			bindEvents() {
				const elementSettings = this.getElementSettings(),
					scrollableNav = elementSettings.scrollable_nav;

				this.initSlider();

				if ( 'yes' === scrollableNav ) {
					this.initScrollableNav();
				} else {
					this.initSliderNav();
				}

				this.initFancybox();

				this.initVideo();

				const $tabs = this.$element.closest('.elementor-widget-n-tabs');
				if ( $tabs.length ) {
					$tabs.on('click', '.e-n-tab-title', (e) => {
						setTimeout(() => {
							this.refreshSlickSlider();
						}, 60);
					});

					$tabs.on('keyup', '.e-n-tab-title', () => {
						setTimeout(() => {
							this.refreshSlickSlider();
						}, 60);
					});
				}

				$(window).on('resize.pp-showcase-' + this.getID(), () => {
					this.refreshSlickSlider();
				});
			}

			refreshSlickSlider() {
				try {
					if ( this.elements.$carousel && this.elements.$carousel.hasClass('slick-initialized') ) {
						this.elements.$carousel.slick('refresh');
						this.elements.$carousel.slick('setPosition');
					}

					if ( this.elements.$navWrap && this.elements.$navWrap.hasClass('slick-initialized') ) {
						this.elements.$navWrap.slick('refresh');
						this.elements.$navWrap.slick('setPosition');
					}
				} catch ( err ) {
				}
			}

			initSlider() {
				const slickOptions = this.getSlickOptions();

				this.elements.$carousel.slick(slickOptions);

				this.elements.$carousel.slick( 'setPosition' );
			}

			initScrollableNav() {
				const slickOptions = this.getSlickOptions('nav');
					
				this.elements.$navWrap.slick(slickOptions);
			}

			initSliderNav() {
				const $nav    = this.elements.$nav,
					$carousel = this.elements.$carousel;
				let self = this;

				$nav.removeClass('pp-active-slide');
				$nav.eq(0).addClass('pp-active-slide');

				this.elements.$carousel.on('beforeChange', function ( event, slick, currentSlide, nextSlide ) {
					self.videoStop();
					currentSlide = nextSlide;
					$nav.removeClass('pp-active-slide');
					$nav.eq( currentSlide ).addClass('pp-active-slide');
				});

				$nav.each( function( currentSlide ) {
					$(this).on( 'click', function ( e ) {
						e.preventDefault();
						$carousel.slick( 'slickGoTo', currentSlide );
					});
				});
			}

			initFancybox() {
				const showcaseId     = this.elements.$carousel.attr( 'id' ),
					lightboxSelector = '.slick-slide:not(.slick-cloned) .pp-showcase-item-link[data-fancybox="' + showcaseId + '"]';

				if ( $(lightboxSelector).length > 0 ) {
					$(lightboxSelector).fancybox({
						loop: true
					});
				}
			}

			initVideo() {
				let self = this;

				this.elements.$videoPlay.off( 'click' ).on( 'click', function( e ) {
					e.preventDefault();

					let outerWrap   = $(this).closest('.pp-video' ),
						videoPlayer = $(this).find( '.pp-video-player' );

					self.videoPlay( videoPlayer, outerWrap );
				});
			}

			videoPlay(selector, outerWrap) {
				let $iframe    = $( '<iframe/>' ),
					vidSrc     = selector.data( 'src' ),
					videoThumb = outerWrap.find( '.pp-video-thumb-wrap' );

				if ( 0 === selector.find( 'iframe' ).length ) {
					if ( outerWrap.hasClass( 'pp-video-type-youtube' ) || outerWrap.hasClass( 'pp-video-type-vimeo' ) || outerWrap.hasClass( 'pp-video-type-dailymotion' ) ) {
						$iframe.attr( 'src', vidSrc );
					}

					$iframe.attr( 'frameborder', '0' );
					$iframe.attr( 'allowfullscreen', '1' );
					$iframe.attr( 'allow', 'autoplay;encrypted-media;' );
					videoThumb.hide();
					selector.append( $iframe );

					if ( outerWrap.hasClass( 'pp-video-type-hosted' ) ) {
						let hostedVideoHtml = JSON.parse( outerWrap.data( 'hosted-html' ) );

						$iframe.on( 'load', function() {
							let hostedVideoIframe = $iframe.contents().find( 'body' );
							hostedVideoIframe.html( hostedVideoHtml );
							$iframe.contents().find( 'video' ).css( {"width":"100%", "height":"100%"} );
							$iframe.contents().find( 'video' ).attr( 'autoplay','autoplay' );
					   });
				   }
			   }
		  	}

			videoStop() {
				this.elements.$item.each( function() {
					let selector   = $(this).find( '.pp-video-player' ),
						videoThumb = $(this).find( '.pp-video-thumb-wrap' ),
						$iframe    = $(this).find('iframe');

					if ( selector.find( 'iframe' ).length ) {
						$iframe.remove();
						videoThumb.show();
					}
				});
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-showcase', ShowcaseWidget );
	} );
})(jQuery);