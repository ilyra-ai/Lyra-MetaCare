(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class TestimonialsWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						testimonials: '.pp-testimonials',
						testimonialsWrap: '.pp-testimonials-wrap',
						slickSlide: '.pp-testimonial-slide',
					},
					slidesToShow: {
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
					$testimonials: this.$element.find( selectors.testimonials ),
					$testimonialsWrap: this.$element.find( selectors.testimonialsWrap ),
					$slickSlide: this.$element.find( selectors.slickSlide ),
				};
			}

			getSlidesCount() {
				return this.elements.$slickSlide.length;
			}

			getDeviceSlidesPerView(device) {
				const slidesPerViewKey = 'slides_per_view' + ('desktop' === device ? '' : '_' + device);
				return Math.min(this.getSlidesCount(), +this.getSliderSettings(slidesPerViewKey) || this.getSettings('slidesToShow')[device]);
			}

			getDeviceSlidesToScroll(device) {
				const slidesToScrollKey = 'slides_to_scroll' + ('desktop' === device ? '' : '_' + device);
				return Math.min(this.getSlidesCount(), +this.getSliderSettings(slidesToScrollKey) || 1);
			}

			getCenterPadding(device) {
				let propertyName = 'center_padding';
				if (device && 'desktop' !== device) {
					propertyName += '_' + device;
				}

				return elementorFrontend.utils.controls.getResponsiveControlValue(this.getSliderSettings(), 'center_padding', 'size', device) || 0;
			}

			getSliderSettings(prop) {
				const sliderSettings = ( undefined !== this.elements.$testimonialsWrap.data('slider-settings') ) ? this.elements.$testimonialsWrap.data('slider-settings') : '';

				if ( 'undefined' !== typeof prop && 'undefined' !== sliderSettings[prop] ) {
					return sliderSettings[prop];
				}

				return sliderSettings;
			}

			getSlickOptions() {
				const sliderSettings = this.getSliderSettings();

				const slickOptions = {
					slidesToShow:   sliderSettings.slides_per_view,
					slidesToScroll: sliderSettings.slides_to_scroll,
					autoplay:       sliderSettings.autoplay,
					speed:          sliderSettings.speed,
					fade:           sliderSettings.fade,
					vertical:       sliderSettings.vertical,
					adaptiveHeight: false,
					loop:           sliderSettings.loop,
					rtl:            sliderSettings.rtl,
					arrows:         sliderSettings.arrows,
					dots:           sliderSettings.dots,
				};

				if ( sliderSettings.autoplay && sliderSettings.autoplay_speed ) {
					slickOptions.autoplaySpeed = sliderSettings.autoplay_speed;
				}

				if ( sliderSettings.center_mode ) {
					slickOptions.centerMode = sliderSettings.center_mode;
					slickOptions.centerPadding = sliderSettings.center_padding;
				};

				if ( sliderSettings.arrows ) {
					slickOptions.prevArrow = '.pp-arrow-prev-' + this.getID();
					slickOptions.nextArrow = '.pp-arrow-next-' + this.getID();
				}

				const breakpointsSettings = {},
				breakpoints = elementorFrontend.config.responsive.activeBreakpoints;

				Object.keys(breakpoints).forEach((breakpointName, index) => {
					if ( 'widescreen' !== breakpointName ) {
						breakpointsSettings[index] = {
							breakpoint: breakpoints[breakpointName].value + 1,
							settings: {
								slidesToShow: this.getDeviceSlidesPerView(breakpointName),
								slidesToScroll: this.getDeviceSlidesToScroll(breakpointName)
							}
						}

						if ( this.getCenterPadding(breakpointName) ) {
							breakpointsSettings[index]['settings']['centerPadding'] = this.getCenterPadding(breakpointName);
						}
					}
				});

				slickOptions.responsive = Object.values(breakpointsSettings);

				return slickOptions;
			}

			bindEvents() {
				const $testimonials = this.elements.$testimonials,
					layout          = this.elements.$testimonials.data( 'layout' ),
					elementSettings = this.getElementSettings();

				if ( 'carousel' === layout || 'slideshow' === layout ) {
					this.initSlider();

					if ( 'slideshow' === layout && 'yes' === elementSettings.thumbnail_nav ) {
						this.thumbsNav($testimonials);
					}

					$testimonials.slick( 'setPosition' );

					this.ppWidgetUpdate( $testimonials );

					this.widgetResize($testimonials);
				}

				if ( 'masonry' === layout ) {
					this.initMasonryLayout();
				}
			}

			initMasonryLayout() {
				const grid = $('.pp-testimonials-masonry').imagesLoaded( function() {

					grid.masonry({
						itemSelector    : '.pp-grid-item-wrap',
						percentPosition : true
					});
				});
			}

			initSlider() {
				const $testimonials = this.elements.$testimonials,
					slickOptions    = this.getSlickOptions();

				$testimonials.slick( slickOptions );
			}

			thumbsNav($testimonials) {
				const thumbsNav = this.$element.find( '.pp-testimonials-thumb-item-wrap' );

				thumbsNav.removeClass('pp-active-slide');
				thumbsNav.eq(0).addClass('pp-active-slide');

				$testimonials.on('beforeChange', function ( event, slick, currentSlide, nextSlide ) {
					currentSlide = nextSlide;
					thumbsNav.removeClass('pp-active-slide');
					thumbsNav.eq( currentSlide ).addClass('pp-active-slide');
				});

				thumbsNav.each( function( currentSlide ) {
					$(this).on( 'click', function ( e ) {
						e.preventDefault();
						$testimonials.slick( 'slickGoTo', currentSlide );
					});
				});
			}

			widgetResize($testimonials) {
				const testimonialsWrap = this.elements.$testimonialsWrap;

				if ( elementorFrontend.isEditMode ) {
					testimonialsWrap.resize( function() {
						$testimonials.slick( 'setPosition' );
					});
				}
			}

			ppWidgetUpdate(slider) {
				var $triggers = [
					'ppe-tabs-switched',
					'ppe-toggle-switched',
					'ppe-accordion-switched',
					'ppe-popup-opened',
				];

				$triggers.forEach(function(trigger) {
					if ( 'undefined' !== typeof trigger ) {
						$(document).on(trigger, function(e, wrap) {
							if ( 'ppe-popup-opened' == trigger ) {
								wrap = $('.pp-modal-popup-' + wrap);
							}

							if ( wrap.find( '.pp-testimonials' ).length > 0 ) {
								setTimeout(function() {
									slider.slick( 'setPosition' );
								}, 100);
							}
						});
					}
				});
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-testimonials', TestimonialsWidget );
	} );
})(jQuery);