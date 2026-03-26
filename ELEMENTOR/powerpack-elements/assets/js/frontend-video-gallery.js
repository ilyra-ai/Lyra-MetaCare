(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class VideoGalleryWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						gallery: '.pp-video-gallery',
						swiperContainer: '.pp-swiper-slider',
						swiperSlide: '.swiper-slide',
						itemWrap: '.pp-grid-item-wrap',
						pagination: '.pp-video-gallery-pagination',
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
					$gallery: this.$element.find( selectors.gallery ),
					$swiperContainer: this.$element.find( selectors.swiperContainer ),
					$swiperSlide: this.$element.find( selectors.swiperSlide ),
					$itemWrap: this.$element.find( selectors.itemWrap ),
					$pagination: this.$element.find( selectors.pagination ),
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
				const isEditMode         = this.isEdit,
					sliderSettings       = this.getSliderSettings(),
					effect               = this.getEffect(),
					isLoopEnabled        = 'yes' === sliderSettings.loop,
					isCenteredSlides     = 'yes' === sliderSettings.centered_slides,
					isGrabCursor         = 'yes' === sliderSettings.grab_cursor,
					isAutoplayEnabled    = sliderSettings.autoplay,
					isPauseOnInteraction = !!sliderSettings.pause_on_interaction;

				const swiperOptions = {
					grabCursor:                isGrabCursor,
					slidesPerView:              this.getSlidesPerView('desktop'),
					slidesPerGroup:             this.getSlidesToScroll('desktop'),
					spaceBetween:               this.getSpaceBetween(),
					loop:                       isLoopEnabled,
					centeredSlides:             isCenteredSlides,
					speed:                      sliderSettings.speed,
					autoHeight:                 sliderSettings.auto_height,
					effect:                     effect,
					watchSlidesVisibility:      true,
					watchSlidesProgress:        true,
					preventClicksPropagation:   false,
					slideToClickedSlide:        true,
					handleElementorBreakpoints: true
				};

				if ( 'fade' === effect ) {
					swiperOptions.fadeEffect = { crossFade: true };
				}

				if ( sliderSettings.show_arrows ) {
					let prevEle = (isEditMode) ? '.elementor-swiper-button-prev' : '.swiper-button-prev-' + this.getID();
					let nextEle = (isEditMode) ? '.elementor-swiper-button-next' : '.swiper-button-next-' + this.getID();

					swiperOptions.navigation = {
						prevEl: prevEle,
						nextEl: nextEle,
					};
				}

				if ( sliderSettings.pagination ) {
					let paginationEle = (isEditMode) ? '.swiper-pagination' : '.swiper-pagination-' + this.getID();

					swiperOptions.pagination = {
						el: paginationEle,
						type: sliderSettings.pagination,
						clickable: true
					};
				}

				if ( 'cube' !== effect ) {
					const breakpointsSettings = {},
					breakpoints = elementorFrontend.config.responsive.activeBreakpoints;

					Object.keys(breakpoints).forEach(breakpointName => {
						const breakpointValue = breakpoints[breakpointName].value;
						breakpointsSettings[breakpointValue] = {
							slidesPerView: this.getSlidesPerView(breakpointName),
							slidesPerGroup: this.getSlidesToScroll(breakpointName),
						};

						if ( this.getSpaceBetween(breakpointName) ) {
							breakpointsSettings[breakpointValue].spaceBetween = this.getSpaceBetween(breakpointName);
						}
					});

					swiperOptions.breakpoints = breakpointsSettings;
				}

				if ( !isEditMode && isAutoplayEnabled ) {
					swiperOptions.autoplay = {
						delay: sliderSettings.autoplay_speed,
						disableOnInteraction: isPauseOnInteraction
					};
				}

				return swiperOptions;
			}

			bindEvents() {
				const elementSettings = this.getElementSettings(),
					$action = this.elements.$gallery.data( 'action' );

				if ( $action === 'inline') {
					this.inlineVideoPlay();
				} else if ( $action === 'lightbox') {
					this.lightboxVideoPlay();
				}

				if ( ! elementorFrontend.isEditMode() ) {
					if ( 'grid' === elementSettings.layout ) {
						this.initFilters();
					}
				}

				if ( 'carousel' === elementSettings.layout ) {
					this.initSlider();
				} else {
					this.initPagination();
				}
			}

			inlineVideoPlay() {
				const videoPlay = this.$element.find('.pp-video-play'),
					elementSettings = this.getElementSettings(),
					items = (elementSettings.layout === 'carousel') ? this.elements.$swiperSlide : this.elements.$itemWrap;

				videoPlay.off('click').on('click', function (e) {
					e.preventDefault();
			
					// Remove any existing iframe and show video thumbnails
					items.each(function () {
						const $this = $(this);
						const $videoPlayer = $this.find('.pp-video-player');
						const $videoThumb = $this.find('.pp-video-thumb-wrap');
						const $iframe = $videoPlayer.find('iframe');
			
						if ($iframe.length) {
							$iframe.remove();
							$videoThumb.show();
						}
					});
			
					// Get video data
					const $clickedElement = $(this),
						vidSrc = $clickedElement.data('src'),
						$videoPlayer = $clickedElement.find('.pp-video-player'),
						$videoThumb = $clickedElement.find('.pp-video-thumb-wrap');
			
					// Create iframe with attributes
					const $iframe = $('<iframe/>', {
						src: vidSrc,
						frameborder: '0',
						allowfullscreen: '1',
						allow: 'autoplay;encrypted-media;',
					});
			
					// Hide the thumbnail and append the iframe
					$videoThumb.hide();
					$videoPlayer.append($iframe);
				});
			}

			lightboxVideoPlay() {
				$.fancybox.defaults.media.dailymotion = {
					matcher: /dailymotion.com\/video\/(.*)\/?(.*)/,
					params: {
						additionalInfos : 0,
						autoStart : 1
					},
					type: 'iframe',
					url: '//www.dailymotion.com/embed/video/$1'
				};
			}

			initFilters() {
				const $gallery = this.elements.$gallery;

				if ( $gallery.hasClass('pp-video-gallery-filter-enabled') ) {
					const $isotopeArgs = {
						itemSelector: '.pp-grid-item-wrap',
						layoutMode: 'fitRows',
						percentPosition: true
					};

					this.$element.imagesLoaded(() => {
						const $isotopeGallery = $gallery.isotope($isotopeArgs);

						this.$element.on('click', '.pp-gallery-filter', function() {
							const $this = $(this),
								filterValue = $this.data('filter');

							$this.siblings().removeClass('pp-active');
							$this.addClass('pp-active');

							$isotopeGallery.isotope({ filter: filterValue });
						});
					});
				}
			}

			async initSlider() {
				const elementSettings = this.getElementSettings();
				const Swiper = elementorFrontend.utils.swiper;

    			this.swiper = await new Swiper(this.elements.$swiperContainer, this.getSwiperOptions());

				if ('yes' === elementSettings.pause_on_hover) {
					this.togglePauseOnHover(true);
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

			initPagination() {
				if ( ! this.elements.$pagination.length ) {
					return;
				}

				var $items   = $( this.$element.find( 'script.pp-video-gallery-pagination-items' ).html() );
				var perPage  = this.elements.$pagination.data( 'per-page' );
				var offset   = 0;
				var rendered = perPage;
				var self     = this;
				
				const $isotopeArgs = {
					itemSelector: '.pp-grid-item-wrap',
					layoutMode: 'fitRows',
					percentPosition: true
				};

				this.$element.imagesLoaded(() => {
					const $isotopeGallery = self.elements.$gallery.isotope($isotopeArgs);

					this.elements.$pagination.find('a').on( 'click', function(e) {
						e.preventDefault();

						for( var i = offset; i < rendered; i++ ) {
							$isotopeGallery.isotope( 'insert', $items[ i ] );
							offset += 1;
						}

						rendered += offset;

						if ( $items.length < offset ) {
							offset = $items.length;
						}

						if ( $items.length == offset ) {
							self.elements.$pagination.remove();
						}
					} );
				});
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-video-gallery', VideoGalleryWidget );
	} );
})(jQuery);