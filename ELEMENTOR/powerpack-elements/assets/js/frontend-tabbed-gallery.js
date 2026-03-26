(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class TabbedGalleryWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						swiperContainer: '.pp-swiper-slider',
						swiperSlide: '.swiper-slide',
					},
					slidesPerView: {
						widescreen: 3,
						desktop: 3,
						laptop: 3,
						tablet_extra: 3,
						tablet: 2,
						mobile_extra: 2,
						mobile: 1
					},
					effect: 'slide'
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$swiperContainer: this.$element.find( selectors.swiperContainer ),
					$swiperSlide: this.$element.find( selectors.swiperSlide ),
				};
			}

			getSliderSettings(prop) {
				const sliderSettings = ( undefined !== this.elements.$swiperContainer.data('slider-settings') ) ? this.elements.$swiperContainer.data('slider-settings') : '';

				if ( 'undefined' !== typeof prop && 'undefined' !== sliderSettings[prop] ) {
					return sliderSettings[prop];
				}

				return sliderSettings;
			}

			getSlidesCount() {
				return this.elements.$swiperSlide.length;
			}

			getEffect() {
				return ( this.getSliderSettings('effect') || this.getSettings('effect') );
			}

			getDeviceSlidesPerView(device) {
				const slidesPerViewKey = 'slides_per_view' + ('desktop' === device ? '' : '_' + device);
				return Math.min(this.getSlidesCount(), +this.getSliderSettings(slidesPerViewKey) || this.getSettings('slidesPerView')[device]);
			}

			getSlidesPerView(device) {
				if ('slide' === this.getEffect()) {
					return this.getDeviceSlidesPerView(device);
				}
				return 1;
			}

			getDeviceSlidesToScroll(device) {
				const slidesToScrollKey = 'slides_to_scroll' + ('desktop' === device ? '' : '_' + device);
				return Math.min(this.getSlidesCount(), +this.getElementSettings(slidesToScrollKey) || 1);
			}

			getSlidesToScroll(device) {
				if ('slide' === this.getEffect()) {
					return this.getDeviceSlidesToScroll(device);
				}
				return 1;
			}

			getSpaceBetween(device) {
				let propertyName = 'space_between';
				if (device && 'desktop' !== device) {
					propertyName += '_' + device;
				}
				return elementorFrontend.utils.controls.getResponsiveControlValue(this.getSliderSettings(), 'space_between', 'size', device) || 0;
			}

			getSwiperOptions() {
				const sliderSettings = this.getSliderSettings();
				// const swiperOptions = ( undefined !== this.elements.$swiperContainer.data('slider-settings') ) ? this.elements.$swiperContainer.data('slider-settings') : '';

				const swiperOptions = {
					grabCursor:                'yes' === sliderSettings.grab_cursor,
					// initialSlide:               this.getInitialSlide(),
					slidesPerView:              this.getSlidesPerView('desktop'),
					slidesPerGroup:             this.getSlidesToScroll('desktop'),
					spaceBetween:               this.getSpaceBetween(),
					loop:                       'yes' === sliderSettings.loop,
					centeredSlides:             'yes' === sliderSettings.centered_slides,
					speed:                      sliderSettings.speed,
					autoHeight:                 sliderSettings.auto_height,
					effect:                     this.getEffect(),
					watchSlidesVisibility:      true,
					watchSlidesProgress:        true,
					preventClicksPropagation:   false,
					slideToClickedSlide:        true,
					observer:                   true,
					observeParents:             true,
					handleElementorBreakpoints: true
				};

				if ( 'fade' === this.getEffect() ) {
					swiperOptions.fadeEffect = {
						crossFade: true,
					};
				}

				if ( sliderSettings.show_arrows ) {
					var prevEle = ( this.isEdit ) ? '.elementor-swiper-button-prev' : '.swiper-button-prev-' + this.getID();
					var nextEle = ( this.isEdit ) ? '.elementor-swiper-button-next' : '.swiper-button-next-' + this.getID();

					swiperOptions.navigation = {
						prevEl: prevEle,
						nextEl: nextEle,
					};
				}

				if ( sliderSettings.pagination ) {
					var paginationEle = ( this.isEdit ) ? '.swiper-pagination' : '.swiper-pagination-' + this.getID();

					swiperOptions.pagination = {
						el: paginationEle,
						type: sliderSettings.pagination,
						clickable: true
					};
				}

				if ('cube' !== this.getEffect()) {
					const breakpointsSettings = {},
					breakpoints = elementorFrontend.config.responsive.activeBreakpoints;

					Object.keys(breakpoints).forEach(breakpointName => {
						breakpointsSettings[breakpoints[breakpointName].value] = {
							slidesPerView: this.getSlidesPerView(breakpointName),
							slidesPerGroup: this.getSlidesToScroll(breakpointName),
						};

						if ( this.getSpaceBetween(breakpointName) ) {
							breakpointsSettings[breakpoints[breakpointName].value].spaceBetween = this.getSpaceBetween(breakpointName);
						}
					});

					swiperOptions.breakpoints = breakpointsSettings;
				}

				if ( !this.isEdit && sliderSettings.autoplay ) {
					swiperOptions.autoplay = {
						delay: sliderSettings.autoplay_speed,
						disableOnInteraction: !!sliderSettings.pause_on_interaction
					};
				}

				return swiperOptions;
			}

			bindEvents() {
				this.initSlider();
			}

			async initSlider() {
				const elementSettings = this.getElementSettings();

				const Swiper = elementorFrontend.utils.swiper;
    			this.swiper = await new Swiper(this.elements.$swiperContainer, this.getSwiperOptions());

				if ('yes' === elementSettings.pause_on_hover) {
					this.togglePauseOnHover(true);
				}

				this.initTabs();

				this.initFancybox();
			}

			initTabs() {
				let tabsNav = this.$element.find( '.pp-gallery-filters .pp-gallery-filter' ),
					self = this;
				const sliderOptions = this.getSwiperOptions();
				const sliderSettings = this.getSliderSettings();

				tabsNav.removeClass('pp-active-slide');
				tabsNav.eq(0).addClass('pp-active-slide');

				if ( 'undefined' !== typeof this.swiper ) {
					this.swiper.on( 'slideChange', function () {
						var currentSlide = self.$element.find( '.swiper-slide.swiper-slide-active' ).data( 'swiper-slide-index' );
						var nextSlide    = self.$element.find( '.swiper-slide.swiper-slide-next' ).data( 'swiper-slide-index' );

						var tabGroupCurrent = tabsNav.eq( currentSlide ).data('group'),
							tabGroupNext    = tabsNav.eq( nextSlide ).data('group');
						
						if ( tabGroupCurrent !== tabGroupNext ) {
							tabsNav.removeClass('pp-active-slide');
							var $group = tabsNav.eq( nextSlide ).data('group');
							tabsNav.filter('[data-group="' + $group + '"]').addClass('pp-active-slide');
						}
					});

					tabsNav.each( function() {
						$(this).on( 'click', function ( e ) {
							e.preventDefault();

							if ( ( $( window ).width() <= 480 ) && sliderSettings.slides_per_view_mobile <= 2 ) {
								var currentSlide = $(this).data('index') + parseInt( sliderSettings.slides_per_view_mobile );
							} else if ( ( $( window ).width() <= 768 ) && sliderSettings.slides_per_view_tablet <= 2 ) {
								var currentSlide = $(this).data('index') + parseInt( sliderSettings.slides_per_view_tablet );
							} else {
								var currentSlide = $(this).data('index') + parseInt( sliderOptions.slidesPerView );
							}

							tabsNav.removeClass( 'pp-active-slide' );
							$(this).addClass( 'pp-active-slide' );

							self.swiper.slideTo( currentSlide );
						});
					});
				}
			}

			togglePauseOnHover(toggleOn) {
				if (toggleOn) {
					this.elements.$swiperContainer.on({
						mouseenter: () => {
							this.swiper.autoplay.stop();
						},
						mouseleave: () => {
							this.swiper.autoplay.start();
						}
					});
				} else {
					this.elements.$swiperContainer.off('mouseenter mouseleave');
				}
			}

			initFancybox() {
				const sliderId       = '.pp-tabbed-gallery-' + this.getID(),
					lightboxSelector = '.swiper-slide:not(.swiper-slide-duplicate) .pp-image-slider-slide-link[data-fancybox="' + sliderId + '"]';
	
				if ( $(lightboxSelector).length > 0 ) {
					$(lightboxSelector).fancybox({
						loop: true
					} );
				}
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-tabbed-gallery', TabbedGalleryWidget );
	} );
})(jQuery);