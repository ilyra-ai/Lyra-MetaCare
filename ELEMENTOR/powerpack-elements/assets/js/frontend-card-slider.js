(function ($) {

	$(window).on( 'elementor/frontend/init', () => {

		class CardSliderWidget extends elementorModules.frontend.handlers.Base {

			getDefaultSettings() {
				return {
					selectors: {
						swiperContainer: '.pp-swiper-slider',
						swiperSlide: '.swiper-slide',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings('selectors');

				return {
					$swiperContainer: this.$element.find(selectors.swiperContainer),
					$swiperSlide: this.$element.find(selectors.swiperSlide),
				};
			}

			getSliderSettings(settingName) {
				const sliderSettings = this.elements.$swiperContainer.data('slider-settings') || {};

				return (typeof settingName !== 'undefined')
					? sliderSettings[settingName]
					: sliderSettings;
			}

			getEffect() {
				return this.getSliderSettings('effect');
			}

			getSwiperOptions() {
				const sliderSettings = this.getSliderSettings();
				const isEditorMode = this.isEdit;
				const widgetId = this.getID();

				const swiperOptions = {
					grabCursor: sliderSettings.grab_cursor === 'yes',
					slidesPerView: 1,
					slidesPerGroup: 1,
					loop: sliderSettings.loop === 'yes',
					centeredSlides: sliderSettings.centered_slides === 'yes',
					speed: sliderSettings.speed || 500,
					autoHeight: !!sliderSettings.auto_height,
					effect: this.getEffect(),
					preventClicksPropagation: false,
					slideToClickedSlide: true,
				};

				if (swiperOptions.effect === 'fade') {
					swiperOptions.fadeEffect = { crossFade: true };
				}

				if (sliderSettings.keyboard === 'yes') {
					swiperOptions.keyboard = { enabled: true };
				}

				/** Navigation */
				if (sliderSettings.show_arrows) {
					const prevSelector = isEditorMode ? '.elementor-swiper-button-prev' : `.swiper-button-prev-${widgetId}`;
					const nextSelector = isEditorMode ? '.elementor-swiper-button-next' : `.swiper-button-next-${widgetId}`;

					swiperOptions.navigation = {
						prevEl: prevSelector,
						nextEl: nextSelector,
					};
				}

				/** Pagination */
				if (sliderSettings.pagination) {
					const paginationSelector = isEditorMode ? '.swiper-pagination' : `.swiper-pagination-${widgetId}`;

					swiperOptions.pagination = {
						el: paginationSelector,
						type: sliderSettings.pagination,
						clickable: true,
					};
				}

				/** Autoplay */
				if (!isEditorMode && sliderSettings.autoplay) {
					swiperOptions.autoplay = {
						delay: sliderSettings.autoplay_speed || 3000,
						disableOnInteraction: !!sliderSettings.pause_on_interaction,
					};
				}

				return swiperOptions;
			}

			bindEvents() {
				const elementSettings = this.getElementSettings();

				this.stackOn = elementSettings.responsive_breakpoint;

				if ( this.stackOn !== 'none' ) {
					this.stackIt();
					this.bindResizeEvent();
				}

				this.initSlider();
			}

			/**
			 * Apply breakpoint classes based on Elementor device mode
			 */
			stackIt() {
				if ( this.stackOn == 'none' ) {
					return;
				}

				const breakpoints = elementorFrontend.config.responsive.activeBreakpoints;
				let stackOn = breakpoints[this.stackOn].value;

				if ( window.innerWidth <= stackOn ) {
					this.$element.find('.pp-card-slider').addClass('pp-card-slider-breakpoint-active');
				} else {
					this.$element.find('.pp-card-slider').removeClass('pp-card-slider-breakpoint-active');
				}
			}

			/**
			 * Handle browser resize
			 */
			bindResizeEvent() {
				elementorFrontend.elements.$window.on('resize', this.stackIt.bind(this));
			}

			async initSlider() {
				const Swiper = elementorFrontend.utils.swiper;
				const elementSettings = this.getElementSettings();

				if (!this.elements.$swiperContainer.length) {
					return;
				}

				this.swiper = await new Swiper(
					this.elements.$swiperContainer,
					this.getSwiperOptions()
				);

				if (elementSettings.pause_on_hover === 'yes') {
					this.enablePauseOnHover();
				}

				this.setEqualHeight();

				if (elementSettings.open_lightbox !== 'no') {
					this.removeDuplicateLightboxAttributes();
				}
			}

			enablePauseOnHover() {
				this.elements.$swiperContainer
					.on('mouseenter', () => this.swiper.autoplay.stop())
					.on('mouseleave', () => this.swiper.autoplay.start());
			}

			setEqualHeight() {
				let maxSlideHeight = 0;

				this.elements.$swiperSlide.each(function () {
					const slideHeight = $(this).outerHeight();
					if (slideHeight > maxSlideHeight) {
						maxSlideHeight = slideHeight;
					}
				});

				if (maxSlideHeight > 0) {
					this.elements.$swiperContainer.css('height', `${maxSlideHeight + 70}px`);
				}
			}

			removeDuplicateLightboxAttributes() {
				this.$element.find('.pp-card-slider-item.swiper-slide-duplicate').each(function () {
					let lightboxItem = $(this).find('.pp-card-slider-image a');

					lightboxItem.removeAttr( 'data-elementor-open-lightbox data-elementor-lightbox-slideshow data-elementor-lightbox-index' );
					lightboxItem.removeClass( 'elementor-clickable' );
				});
			}
		}

		elementorFrontend.elementsHandler.attachHandler('pp-card-slider', CardSliderWidget);

	});

})(jQuery);
