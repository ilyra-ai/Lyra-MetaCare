(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class CategoriesWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						swiperContainer: '.pp-swiper-slider',
						swiperSlide: '.swiper-slide',
						categoriesContainer: '.pp-categories',
						categoriesGrid: '.pp-categories-grid-wrapper',
						category: '.pp-category',
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
					$categoriesContainer: this.$element.find( selectors.categoriesContainer ),
					$categoriesGrid: this.$element.find( selectors.categoriesGrid ),
					$category: this.$element.find( selectors.category ),
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
				// return this.getSliderSettings(propertyName) || '';
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
					var paginationEle = '.swiper-pagination-' + this.getID();

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
				const elementSettings = this.getElementSettings();

				if ( 'yes' === elementSettings.equal_height ) {
					this.setEqualHeight();
				}

				if ( 'carousel' === elementSettings.layout ) {
					this.initSlider();
				}
				
				if ( 'grid' === elementSettings.layout && 'list' !== elementSettings.skin ) {
					this.setCategoriesCount( 1 );

					this.initNumberedPagination();

					this.initLoadMore();

					this.initInfiniteScroll();
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

			setEqualHeight() {
				const catBox = this.$element.find('.pp-category');
				let highestBox = 0;

				catBox.each(function () {
					if ( $(this).outerHeight() > highestBox) {
						highestBox = $(this).outerHeight();
					}
				});

				catBox.css( 'height', highestBox + 'px' );
			}

			initNumberedPagination() {
				const self = this;

				$('body').on( 'click', '.pp-categories-pagination-ajax .page-numbers', function(e) {
					let $scope = $(this).closest( '.elementor-widget-pp-categories' );

					if ( $scope.length < 0 ) {
						return;
					}

					let lastItem  = $scope.find( '.pp-category' ).last(),
						container = $scope.find( '.pp-categories-grid-wrapper' ),
						pageID    = container.data('page');

					e.preventDefault();

					lastItem.after( '<div class="pp-category-loader"><div class="pp-loader"></div><div class="pp-loader-overlay"></div></div>' );

					let pageNumber = 1,
						curr = parseInt( $scope.find( '.pp-categories-pagination .page-numbers.current' ).html() );

					if ( $(this).hasClass( 'next' ) ) {
						pageNumber = curr + 1;
					} else if ( $(this).hasClass( 'prev' ) ) {
						pageNumber = curr - 1;
					} else {
						pageNumber = $(this).html();
					}

					let $args = {
						'page_id':     pageID,
						'widget_id':   self.getID(),
						'page_number': pageNumber,
					};

					$('html, body').animate({
						scrollTop: ( ( $scope.find( '.pp-categories-grid' ).offset().top ) - 30 )
					}, 'slow');

					self.callAjax( self, $args );
				} );
			}

			initLoadMore() {
				const self = this;
				this.loadStatus = true;

				$(document).on( 'click', '.pp-category-load-more', function(e) {

					e.preventDefault();

					let $scope = $(this).closest( '.elementor-widget-pp-categories' ),
						loader    = $scope.find( '.pp-categories-loader' ),
						pageCount = self.getCategoriesCount(),
						pageID    = $scope.find( '.pp-categories-grid-wrapper' ).data('page');

					if ( elementorFrontend.isEditMode() ) {
						loader.show();
						return false;
					}

					let $args = {
						'page_id':     pageID,
						'widget_id':   self.getID(),
						'page_number': ( pageCount + 1 ),
					};

					self.total = $scope.find( '.pp-categories-pagination' ).data( 'total' );

					if ( true == self.loadStatus ) {
						if ( pageCount < self.total ) {
							loader.show();
							$(this).hide();
							self.callAjax( self, $args, true, pageCount );
							pageCount++;
							self.loadStatus = false;
						}
					}
				} );
			}

			initInfiniteScroll() {
				let self   = this,
					count  = 1,
					loader = this.$element.find( '.pp-categories-loader' );

				this.loadStatus = true;

				if ( this.elements.$categoriesContainer.hasClass( 'pp-categories-infinite-scroll' ) ) {
					let windowHeight50 = jQuery(window).outerHeight() / 1.25;

					$(window).scroll( function () {
						if ( elementorFrontend.isEditMode() ) {
							loader.show();
							return false;
						}

						let $container = self.$element,
							$wrapper   = self.elements.$categoriesGrid,
							$lastItem  = $container.find( '.pp-category:last' );

						let $args = {
							'page_id':     $wrapper.data('page'),
							'widget_id':   self.getID(),
							'page_number': $container.find( '.page-numbers.current' ).next( 'a' ).html(),
						};

						self.total = $container.find( '.pp-categories-pagination' ).data( 'total' );

						if ( ( $(window).scrollTop() + windowHeight50 ) >= ( $lastItem.offset().top ) ) {
							if ( true == self.loadStatus ) {
								if ( count < self.total ) {
									loader.show();
									self.callAjax( self, $args, true );
									count++;
									self.loadStatus = false;
								}
							}
						}
					} );
				}
			}

			setCategoriesCount(count) {
				this.$element.find( '.pp-category-load-more' ).attr( 'data-count', count );
			}

			getCategoriesCount() {
				return this.$element.find('.pp-category-load-more').data('count');
			}

			callAjax( self, $obj, $append, $count ) {
				let loader = this.$element.find( '.pp-categories-loader' );

				$.ajax({
					url: ppCategoriesScript.ajax_url,
					data: {
						action:      'pp_get_categories',
						page_id:     $obj.page_id,
						widget_id:   $obj.widget_id,
						page_number: $obj.page_number,
						nonce:       ppCategoriesScript.categories_nonce,
					},
					dataType: 'json',
					type: 'POST',
					success: function( data ) {
						let $container = self.elements.$categoriesContainer,
							sel = $container.find( '.pp-categories-grid-wrapper' );

						let not_found = $container.find( '.pp-categories-empty' );

						not_found.remove();

						if ( $(not_found).length == 0 ) {
							$(data.data.not_found).insertBefore(sel);
						}

						if ( true == $append ) {
							let html_str = data.data.html;
							sel.append( html_str );
						} else {
							sel.html( data.data.html );
						}

						$container.find( '.pp-categories-pagination-wrap' ).html( data.data.pagination );

						//	Complete the process 'loadStatus'
						self.loadStatus = true;
						if ( true == $append ) {
							loader.hide();
							$container.find( '.pp-category-load-more' ).show();
						}

						self.setCategoriesCount( $obj.page_number );

						$count = $count + 1;

						if ( $count == self.total ) {
							$container.find( '.pp-category-load-more' ).hide();
						}

						self.$element.trigger('posts.rendered', [self.$element]);
					}
				} ).done( function() {
					if ( self.$element.find( '.elementor-invisible' ).length > 0 ) {
						self.$element.find( '.elementor-invisible' ).removeClass( 'elementor-invisible' );
					}
				} );
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-categories', CategoriesWidget );
	} );
})(jQuery);