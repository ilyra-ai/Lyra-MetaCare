(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class ImageGalleryWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						container: '.pp-image-gallery-container',
						gallery: '.pp-image-gallery',
						justifiedGallery: '.pp-image-gallery-justified',
						filterItems: '.pp-gallery-filter',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$container: this.$element.find( selectors.container ),
					$gallery: this.$element.find( selectors.gallery ),
					$justifiedGallery: this.$element.find( selectors.justifiedGallery ),
					$filterItems: this.$element.find( selectors.filterItems ),
				};
			}

			bindEvents() {
				const settings  = this.elements.$container.data('settings'),
					gallery     = this.elements.$gallery,
					cachedItems = [],
					cachedIds   = [];

				if ( ! elementorFrontend.isEditMode() ) {
					if ( settings.layout != 'justified' ) {
						this.initMasonryLayout(gallery);
					}

					if ( gallery.hasClass('pp-image-gallery-filter-enabled') ) {
						this.initFilters(gallery, settings);
					}

					if ( settings.pagination === 'yes' ) {
						this.initLoadMore(gallery, settings, cachedItems, cachedIds);
					}
				}

				if ( settings.tilt_enable === 'yes' ) {
					this.initTilt();
				}

				if ( settings.layout === 'justified' ) {
					this.initjustifiedLayout();
				}

				this.initLightbox();
			}

			initMasonryLayout(gallery) {
				const layoutMode = gallery.hasClass('pp-image-gallery-masonry') ? 'masonry' : 'fitRows',
					filterItems  = this.elements.$filterItems
				let defaultFilter = '';

				$(filterItems).each(function() {
					if ( defaultFilter === '' || defaultFilter === undefined ) {
						defaultFilter = $(this).attr('data-default');
					}
				});

				let isotopeArgs = {
					itemSelector: '.pp-grid-item-wrap',
					layoutMode: layoutMode,
					percentPosition: true,
					filter: defaultFilter,
				};

				this.elements.$container.imagesLoaded( function() {
					gallery.isotope( isotopeArgs );

					gallery.find('.pp-gallery-slide-image').on('load', function() {
						if ( $(this).hasClass('lazyloaded') ) {
							return;
						}
						setTimeout(function() {
							gallery.isotope( 'layout' );
						}, 500);
					});
				});

				elementorFrontend.elements.$window.on('elementor-pro/motion-fx/recalc', function() {
					gallery.isotope( 'layout' );
				});

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

							if ( wrap.find( '.pp-image-gallery' ).length > 0 ) {
								setTimeout(function() {
									gallery.isotope( 'layout' );
								}, 100);
							}
						});
					}
				});
			}

			initFilters(gallery, settings) {
				const widgetId      = this.getID(),
					lightboxLibrary = this.getElementSettings('lightbox_library'),
					self            = this;

				this.elements.$container.on( 'click', '.pp-gallery-filter', function() {
					let $this = $(this),
						filterValue = $this.attr('data-filter'),
						filterIndex = $this.attr('data-gallery-index'),
						galleryItems = gallery.find(filterValue);

					if ( filterValue === '*' ) {
						galleryItems = gallery.find('.pp-grid-item-wrap');
					}

					$(galleryItems).each(function() {
						let imgLink = $(this).find('.pp-image-gallery-item-link');

						if ( lightboxLibrary === 'fancybox' ) {
							imgLink.attr('data-fancybox', filterIndex + '_' + widgetId);	
						} else {
							imgLink.attr('data-elementor-lightbox-slideshow', filterIndex + '_' + widgetId);
						}
					});

					$this.siblings().removeClass('pp-active');
					$this.addClass('pp-active');

					if ( settings.layout === 'justified' ) {
						self.initjustifiedLayout(filterValue);
					} else {
						gallery.isotope({ filter: filterValue });
					}
				});

				$('.pp-filters-dropdown').on( 'change', function() {
					// get filter value from option value.
					let filterValue = this.value,
						filterIndex = $(this).find(':selected').attr('data-gallery-index'),
						galleryItems = gallery.find(filterValue);

					if ( filterValue === '*' ) {
						galleryItems = gallery.find('.pp-grid-item-wrap');
					}

					$(galleryItems).each(function() {
						let imgLink = $(this).find('.pp-image-gallery-item-link');

						if ( lightboxLibrary === 'fancybox' ) {
							imgLink.attr('data-fancybox', filterIndex + '_' + widgetId);	
						} else {
							imgLink.attr('data-elementor-lightbox-slideshow', filterIndex + '_' + widgetId);
						}
					});

					gallery.isotope({ filter: filterValue });
				});

				// Trigger filter by hash parameter in URL.
				this.hashChange();

				// Trigger filter on hash change in URL.
				$(window).on( 'hashchange', function() {
					this.hashChange();
				}.bind(this) );
			}

			initjustifiedLayout(filterValue) {
				const settings       = this.elements.$container.data('settings'),
					justifiedGallery = this.elements.$justifiedGallery;
				let opts = {
					rowHeight : settings.row_height,
					lastRow : settings.last_row,
					selector : 'div',
					waitThumbnailsLoad : true,
					margins : settings.image_spacing,
					border : 0
				};

				if ( filterValue ) {
					opts.filter = filterValue;
				}

				justifiedGallery.imagesLoaded( function () {
					justifiedGallery.justifiedGallery(opts).on('jg.complete jg.resize', function(e) {
						let controller = $(this).data('jg.controller');

						if ( controller.rows === 0 && controller.settings.lastRow === 'hide' ){
							opts.lastRow = 'justify';
	
							$(this).justifiedGallery(opts);
						} 
					});
				}.bind( this ) );
			}

			initLoadMore(gallery, settings, cachedItems, cachedIds) {
				const self = this;

				gallery.find('.pp-grid-item-wrap').each(function() {
					cachedIds.push( $(this).data('item-id') );
				});

				this.elements.$container.find('.pp-gallery-load-more').off('click').on('click', function(e) {
					e.preventDefault();

					let $this = $(this);
					$this.addClass('disabled pp-loading');

					if ( cachedItems.length > 0 ) {
						self.renderGalleryItems(cachedItems, cachedIds);
					} else {
						self.getAjaxPhotos(cachedItems, cachedIds, settings);
					}
				});
			}

			getAjaxPhotos(cachedItems, cachedIds, settings) {
				const self = this;

				let data = {
					action: 'pp_gallery_get_images',
					pp_action: 'pp_gallery_get_images',
					settings: settings
				};

				$.ajax({
					type: 'post',
					url: window.location.href.split( '#' ).shift(),
					context: this,
					data: data,
					success: function(response) {
						if ( response.success ) {
							let items = response.data.items;

							if ( items ) {
								$(items).each(function() {
									if ( $(this).hasClass('pp-grid-item-wrap') ) {
										cachedItems.push(this);
									}
								});
							}

							self.renderGalleryItems(cachedItems, cachedIds);
						}
					},
					error: function(xhr, desc) {
						console.log(desc);
					}
				});
			}

			renderGalleryItems( cachedItems, cachedIds ) {
				const settings       = this.elements.$container.data('settings'),
					gallery          = this.elements.$gallery,
					galleryId        = gallery.attr( 'id' ),
					justifiedGallery = this.elements.$justifiedGallery,
					self             = this;

				this.elements.$container.find('.pp-gallery-load-more').removeClass( 'disabled pp-loading' );

				if ( cachedItems.length > 0 ) {
					let count = 1;
					let items = [];

					$(cachedItems).each(function() {
						let id = $(this).data('item-id');

						if ( -1 === $.inArray( id, cachedIds ) ) {
							if ( count <= parseInt( settings.per_page, 10 ) ) {
								cachedIds.push( id );
								items.push( this );
								count++;
							} else {
								return false;
							}
						}
					});

					if ( items.length > 0 ) {
						items = $(items);

						items.imagesLoaded( function() {
							if ( settings.layout != 'justified' ) {
								gallery.isotope('insert', items);

								setTimeout(function() {
									gallery.isotope('layout');
								}, 500);
							}

							if ( settings.layout === 'justified' ) {
								if ( justifiedGallery.length > 0 ) {
									gallery.append( items.fadeIn() );
									justifiedGallery.imagesLoaded( function() {
									})
									.done(function(instance) {
										setTimeout(function(){
											justifiedGallery.justifiedGallery( 'norewind' );
										}, 200 );
										
									});
								}
							}

							if ( settings.tilt_enable === 'yes' ) {
								self.initTilt();
							}

							self.initLightbox();
						} );
					}

					if ( cachedItems.length === cachedIds.length ) {
						this.elements.$container.find('.pp-gallery-pagination').hide();
					}
				}
			}

			hashChange() {
				setTimeout(function() {
					if ( location.hash && $(location.hash).length > 0 ) {
						if ( $(location.hash).parent().hasClass('pp-gallery-filters') ) {
							$(location.hash).trigger('click');
						}
					}
				}, 500);
			}

			initLightbox() {
				const galleryId      = this.elements.$gallery.attr( 'id' ),
					lightboxSelector = '.pp-grid-item-wrap .pp-image-gallery-item-link[data-fancybox="' + galleryId + '"]',
					fancyboxSettings = this.elements.$gallery.data('fancybox-settings');

				if ( $(lightboxSelector).length > 0 ) {
					$(lightboxSelector).fancybox( fancyboxSettings );
				}
			}

			initTilt() {
				const settings = this.elements.$container.data('settings'),
					gallery    = this.elements.$gallery;

				$(gallery).find('.pp-image-gallery-thumbnail-wrap').tilt({
					disableAxis: settings.tilt_axis,
					maxTilt: settings.tilt_amount,
					scale: settings.tilt_scale,
					speed: settings.tilt_speed,
					perspective: 1000
				});
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-image-gallery', ImageGalleryWidget );
	} );
})(jQuery);