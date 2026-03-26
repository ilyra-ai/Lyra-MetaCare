;(function($) {
	PPAdvancedMenu = function( $scope, elementSettings ) {
		this.node         = $scope;
		this.menu_wrap    = $scope.find( '.pp-advanced-menu-main-wrapper' );
		this.wrap         = $scope.find( '.pp-advanced-menu__container' );
		this.menu         = $scope.find( '.pp-advanced-menu' );
		this.dropdownMenu = $scope.find( '.pp-advanced-menu__container.pp-advanced-menu--dropdown' );
		this.anchorLink   = $scope.find( '.pp-advanced-menu--main .pp-menu-item-anchor' );
		this.menuItemLink = $scope.find( '.pp-advanced-menu--main .pp-menu-item' );
		this.menuToggle   = $scope.find( '.pp-menu-toggle' ); // hamburger icon
		this.settings     = $scope.find( '.pp-advanced-menu__container' ).data( 'settings' );

		if ( ! this.settings ) {
			return;
		}

		this.menuId             = this.settings.menu_id;
		this.menuType           = elementSettings.menu_type;
		this.fullWidth          = elementSettings.full_width;
		this.menuLayout         = elementSettings.layout;
		this.showSubmenuOn      = elementSettings.show_submenu_on;
		this.showSubmenuOnClick = ( this.showSubmenuOn == 'click' );
		this.showResponsiveSubmenuOn = elementSettings.show_responsive_submenu_on ? elementSettings.show_responsive_submenu_on : 'icon';
		this.onepage_menu       = elementSettings.onepage_menu;
		this.duration           = 400;

		//this.iconValue = this.settings.submenu_icon.value;
		this.iconValue            = elementSettings.submenu_icon.value;
		this.subIndicatorsContent = '';

		if ( this.iconValue ) {
			// this.subIndicatorsContent = this.iconValue.indexOf( '<' ) > -1 ? this.iconValue : `<i class="${this.iconValue}"></i>`;
			if ( 'svg' === elementSettings.submenu_icon.library && elementorFrontend.isEditMode() ) {
				// var svgimage = this.iconValue.url;
				this.subIndicatorsContent = this.menu_wrap.attr( 'data-subicon-indicator' );
			} else {
				const iconVal = String(this.iconValue);
				this.subIndicatorsContent = iconVal.indexOf('<') > -1 ? iconVal : `<i class="${iconVal}"></i>`;
			}
		}

		this.init();
	};

	PPAdvancedMenu.prototype = {
		stretchElement: null,

		init: function () {

			if ( ! this.menu.length ) {
				return;
			}

			if ( jQuery.fn.smartmenus ) {
				// Override the default stupid detection
				jQuery.SmartMenus.prototype.isCSSOn = function() {
					return true;
				};

				if ( elementorFrontend.config.is_rtl  ) {
					jQuery.fn.smartmenus.defaults.rightToLeftSubMenus = true;
				}
			}

			if ( 'horizontal' === this.menuLayout ) {
				if ('undefined' !== typeof $.fn.smartmenus) {
					var showResponsiveSubmenuOn = this.showResponsiveSubmenuOn,
					subMenuSel;

					if ( 'icon' === this.showResponsiveSubmenuOn ) {
						subMenuSel = 'span.sub-arrow';
					} else {
						subMenuSel = '.pp-menu-item, .pp-sub-item';
					}

					this.menu.smartmenus(
						{
							subIndicators: '' !== this.subIndicatorsContent,
							subIndicatorsText: this.subIndicatorsContent,
							subIndicatorsPos: 'append',
							subMenusMaxWidth: '1000px',
							subMenusMinWidth: '',
							showOnClick: this.showSubmenuOnClick,
							noMouseOver: this.showSubmenuOnClick,
							collapsibleBehavior: 'link',
						}
					).on('click', subMenuSel, function(e) {
						if ( $(this).parents('.pp-advanced-menu--dropdown').length ) {
							var menuToggle = false;

							if ( 'icon' !== showResponsiveSubmenuOn ) {
								if ( $(this).hasClass('has-submenu') ) {
									var ppanchorsubMenuObj = $(this);
									menuToggle = true;
								}
							} else {
								var ppanchorsubMenuObj = $(this).closest( 'a.has-submenu' );
								menuToggle = true;
							}

							if ( menuToggle ) {
								ppanchorsubMenuObj.toggleClass( 'highlighted' );
								ppanchorsubMenuObj.attr( 'aria-expanded',
									ppanchorsubMenuObj.attr( 'aria-expanded' ) == 'false' ? 'true' : 'false'
								);

								var ppsubMenuObj = ppanchorsubMenuObj.siblings( 'ul' );

								ppsubMenuObj.attr( 'aria-hidden',
									ppsubMenuObj.attr( 'aria-hidden' ) == 'false' ? 'true' : 'false'
								);

								ppsubMenuObj.attr( 'aria-expanded',
									ppsubMenuObj.attr( 'aria-expanded' ) == 'false' ? 'true' : 'false'
								);

								if ( 'true' === ppsubMenuObj.attr( 'aria-expanded' ) ) {
									ppsubMenuObj.css( { width: 'auto', display: 'block' } );
								} else {
									ppsubMenuObj.css( { width: 'auto', display: 'none' } );
								}

								e.preventDefault();
								e.stopPropagation();
							}
						}
					});
				}
			}

			if ( 'vertical' === this.menuLayout ) {
				if ('undefined' !== typeof $.fn.smartmenus) {
					var showResponsiveSubmenuOn = this.showResponsiveSubmenuOn,
					subMenuSel;

					if ( 'icon' === this.showResponsiveSubmenuOn ) {
						subMenuSel = 'span.sub-arrow';
					} else {
						subMenuSel = '.pp-menu-item, .pp-sub-item';
					}

					var that = this;

					this.menu.smartmenus(
						{
							subIndicators: '' !== this.subIndicatorsContent,
							subIndicatorsText: this.subIndicatorsContent,
							subIndicatorsPos: 'append',
							subMenusMaxWidth: '',
							subMenusMinWidth: '',
							mainMenuSubOffsetX: '0px',
							mainMenuSubOffsetY: '0px',
							subMenusSubOffsetX: '0px',
							subMenusSubOffsetY: '0px',
							showOnClick: this.showSubmenuOnClick,
							noMouseOver: this.showSubmenuOnClick,
							collapsibleBehavior: 'link',
						}
					).on('click', subMenuSel, function(e) {
						if ( $(this).parents('.pp-advanced-menu--dropdown').length ) {
							var menuToggle = false;

							if ( 'icon' !== showResponsiveSubmenuOn ) {
								if ( $(this).hasClass('has-submenu') ) {
									var ppanchorsubMenuObj = $(this);
									menuToggle = true;
								}
							} else {
								var ppanchorsubMenuObj = $(this).closest( 'a.has-submenu' );
								menuToggle = true;
							}

							if ( menuToggle ) {
								ppanchorsubMenuObj.toggleClass( 'highlighted' );
								ppanchorsubMenuObj.attr( 'aria-expanded',
									ppanchorsubMenuObj.attr( 'aria-expanded' ) == 'false' ? 'true' : 'false'
								);

								var ppsubMenuObj = ppanchorsubMenuObj.siblings( 'ul' );

								ppsubMenuObj.attr( 'aria-hidden',
									ppsubMenuObj.attr( 'aria-hidden' ) == 'false' ? 'true' : 'false'
								);

								ppsubMenuObj.attr( 'aria-expanded',
									ppsubMenuObj.attr( 'aria-expanded' ) == 'false' ? 'true' : 'false'
								);

								if ( 'icon' === that.showResponsiveSubmenuOn ) {
									if ( 'true' === ppsubMenuObj.attr( 'aria-expanded' ) ) {
										ppsubMenuObj.css( { width: 'auto', display: 'block' } );
									} else {
										ppsubMenuObj.css( { width: 'auto', display: 'none' } );
									}
								} else {
									if ( 'false' === ppsubMenuObj.attr( 'aria-expanded' ) ) {
										ppsubMenuObj.css( { width: 'auto', display: 'block' } );
									} else {
										ppsubMenuObj.css( { width: 'auto', display: 'none' } );
									}
								}

								e.preventDefault();
								e.stopPropagation();
							}
						}
					});
				}
			}

			if ( 'default' === this.menuType ) {
				this.initStretchElement();
				this.stretchMenu();
			}

			if ('off-canvas' === this.menuType) {
				this.initOffCanvas();
			}

			if ('full-screen' === this.menuType) {
				this.initFullScreen();
			}

			this.bindEvents();

			if ( ! elementorFrontend.isEditMode() ) {
				this.followMenuAnchors();
			}

			$( window ).on( 'load', $.proxy( this.resetDimensions, this ) );

			this.menu.smartmenus( 'refresh' );

			this.menu.attr( 'aria-label', this.menu.parent().attr( 'aria-label' ) );
			this.menu.attr( 'role', 'menubar' );

			let ulAttrs = this.menu.find( 'ul' );
			ulAttrs.attr( 'role', 'menu' );
			ulAttrs.each( function() {
				$( this ).attr( 'aria-label', $( this ).siblings( 'a' ).text() );
			} );

			this.menu.find( 'li' ).attr( 'role', 'none' );

			this.menu.find( 'a' ).attr( 'role', 'menuitem' );
		},

		getElementSettings: function( setting ) {
			if ( 'undefined' !== typeof this.settings[setting] ) {
				return this.settings[setting];
			}

			return false;
		},

		bindEvents: function () {
			var self = this;

			if ( ! this.menu.length ) {
				return;
			}

			this.menuToggle.on( 'click', $.proxy( this.toggleMenu, this ) );

			if ( 'yes' === this.onepage_menu ) {
				this.menu.on(
					'click',
					'.menu-item > a[href*="#"]',
					function(e) {

						var $href = $( this ).attr( 'href' ),
						$targetID = '';

						if ( $href !== '#' ) {
							$targetID = $href.split( '#' )[1];

							if ( $( 'body' ).find( '#' + $targetID ).length > 0 ) {
								e.preventDefault();
								$( this ).toggleClass( 'pp-active' );

								setTimeout(function() {
									$('html, body').animate({
										scrollTop: $('#'+ $targetID).offset().top
									}, 50, 'linear', function() {
										window.location.hash = $targetID;
									});
								}, 50);
							}

							self.closeMenu();
						}
					}
				);
			}

			if ('default' === this.menuType) {
				elementorFrontend.addListenerOnce( this.node.data( 'model-cid' ), 'resize', $.proxy( this.stretchMenu, this ) );
			}

			//self.panelUpdate();

			this.closeMenuESC();
		},

		panelUpdate: function() {
			var self = this;

			if ('undefined' !== typeof elementor && $( 'body' ).hasClass( 'elementor-editor-active' )) {
				elementor.hooks.addAction(
					'panel/open_editor/widget/pp-advanced-menu',
					function (panel, model, view) {
						panel.$el.find( 'select[data-setting="dropdown"]' ).on(
							'change',
							function () {
								if (model.attributes.id === self.menuId) {
									if ($( this ).val() === 'all') {
										self.node.find( '.pp-advanced-menu--main' ).hide();
									}
									if ($( this ).val() !== 'all') {
										self.node.find( '.pp-advanced-menu--main' ).show();
									}
								}
							}
						);

						if (model.attributes.id === self.menuId && 'all' === self.settings.breakpoint) {
							self.toggleMenu();
						}
					}
				);
			}
		},

		initStretchElement: function () {
			this.stretchElement = new elementorFrontend.modules.StretchElement( { element: this.dropdownMenu } );
		},

		stretchMenu: function () {
			if ( 'stretch' == this.fullWidth ) {
				this.stretchElement.stretch();

				this.dropdownMenu.css( 'top', this.menuToggle.outerHeight() );
			} else {
				this.stretchElement.reset();
			}
		},

		initOffCanvas: function () {
			$( '.pp-menu-' + this.settings.menu_id ).each(
				function(id, el) {
					if ($( el ).parent().is( 'body' ) ) {
						$( el ).remove();
					}
				}
			);

			/* if ( $('.pp-offcanvas-container').length === 0 ) {
				$('body').wrapInner( '<div class="pp-offcanvas-container" />' );
				this.node.find( '.pp-menu-' + this.settings.menu_id ).insertBefore('.pp-offcanvas-container');
			} */

			if ( this.menu_wrap.find( '.pp-menu-off-canvas' ).length > 0 ) {
				if ( $( '.pp-offcanvas-container > .pp-menu-' + this.settings.menu_id ).length > 0 ) {
					$( '.pp-offcanvas-container > .pp-menu-' + this.settings.menu_id ).remove();
				}
				if ( $( 'body > .pp-menu-' + this.settings.menu_id ).length > 0 ) {
					$( 'body > .pp-menu-' + this.settings.menu_id ).remove();
				}
				$( 'body' ).prepend( this.node.find( '.pp-menu-' + this.settings.menu_id ) );
			}

			$( '.pp-menu-clear' ).fadeOut(
				400,
				function() {
					$( this ).remove();
				}
			);

			$( '.pp-menu-' + this.settings.menu_id ).css( 'height', window.innerHeight + 150 + 'px' );
			$( '.pp-menu-' + this.settings.menu_id ).find( '.pp-menu-close' ).on( 'click', $.proxy( this.closeMenu, this ) );
		},

		initFullScreen: function () {
			$( 'body' ).addClass( 'pp-menu--full-screen' );
			$( '.pp-menu-' + this.settings.menu_id ).css( 'height', window.innerHeight + 150 + 'px' );
			$( '.pp-menu-' + this.settings.menu_id ).find( '.pp-menu-close' ).on( 'click', $.proxy( this.closeMenu, this ) );
			//$('.pp-menu-' + this.settings.menu_id).find('.menu-item a').on('click', $.proxy(this.closeMenu, this));
		},

		resetDimensions: function() {
			if ( 'full-screen' === this.menuType ) {
				$( '.pp-menu-' + this.settings.menu_id ).css( 'height', window.innerHeight + 150 + 'px' );
			}
		},

		toggleMenu: function () {
			this.menuToggle.toggleClass( 'pp-active' );

			var menuType = this.menuType;
			var isActive = this.menuToggle.hasClass( 'pp-active' );

			$( 'html' ).removeClass( 'pp-menu-toggle-open' );

			if ( isActive ) {
				$( 'html' ).addClass( 'pp-menu-toggle-open' );
			}

			if ('default' === menuType) {
				var $dropdownMenu = this.dropdownMenu;

				if (isActive) {
					$dropdownMenu.hide().slideDown(
						250,
						function () {
							$dropdownMenu.css( 'display', '' );
						}
					);

					this.stretchMenu();
				} else {
					$dropdownMenu.show().slideUp(
						250,
						function () {
							$dropdownMenu.css( 'display', '' );
						}
					);
				}
			}

			if ('off-canvas' === menuType) {
				this.toggleOffCanvas();
			}
			if ('full-screen' === menuType) {
				this.toggleFullScreen();
			}
		},

		toggleOffCanvas: function() {
			var isActive = this.menuToggle.hasClass( 'pp-active' ),
				element  = $( 'body' ).find( '.pp-menu-' + this.menuId ),
				time     = this.duration,
				self     = this;

			$( 'html' ).removeClass( 'pp-menu-toggle-open' );

			if ( isActive ) {
				$( 'body' ).addClass( 'pp-menu--off-canvas' );
				$( 'html' ).addClass( 'pp-menu-toggle-open' );
				time = 0;
			} else {
				time = this.duration;
			}

			$( '.pp-menu-open' ).removeClass( 'pp-menu-open' );
			$( '.pp-advanced-menu--toggle .pp-menu-toggle' ).not( this.menuToggle ).removeClass( 'pp-active' );

			setTimeout(
				function() {
					$( '.pp-menu-off-canvas' ).removeAttr( 'style' );

					if (isActive) {
						$( 'body' ).addClass( 'pp-menu-open' );
						element.addClass( 'pp-menu-open' ).css( 'z-index', '999999' );
						if ( $( '.pp-menu-clear' ).length === 0 ) {
							$( 'body' ).append( '<div class="pp-menu-clear" style="transition: none !important;"></div>' );
						}
						$( '.pp-menu-clear' ).off( 'click' ).on( 'click', $.proxy( self.closeMenu, self ) );
						$( '.pp-menu-clear' ).fadeIn();
					} else {
						$( '.pp-menu-open' ).removeClass( 'pp-menu-open' );
						$( 'body' ).removeClass( 'pp-menu--off-canvas' );
						$( 'html' ).removeClass( 'pp-menu-toggle-open' );
						$( '.pp-menu-clear' ).fadeOut();
					}
				},
				time
			);
		},

		toggleFullScreen: function() {
			var isActive = this.menuToggle.hasClass( 'pp-active' ),
				element  = $( 'body' ).find( '.pp-menu-' + this.menuId );

			$( 'html' ).removeClass( 'pp-menu-toggle-open' );

			if ( isActive ) {
				$( 'html' ).addClass( 'pp-menu-toggle-open' );
				this.node.find( '.pp-menu-full-screen' ).addClass( 'pp-menu-open' );
				/* this.node.find('.pp-menu-full-screen').attr('data-scroll', $(window).scrollTop());
				$(window).scrollTop(0); */
			}
		},

		closeMenu: function() {
			if ( 'default' !== this.menuType ) {
				$( '.pp-menu-open' ).removeClass( 'pp-menu-open' );
				this.menuToggle.removeClass( 'pp-active' );

				$( 'html' ).removeClass( 'pp-menu-toggle-open' );

				if ( 'full-screen' === this.menuType ) {
					var scrollTop = this.node.find( '.pp-menu-full-screen' ).data( 'scroll' );
					$( window ).scrollTop( scrollTop );
				}

				$( '.pp-menu-clear' ).fadeOut();
			}
		},

		closeMenuESC: function() {
			var self = this;

			// menu close on ESC key
			$( document ).on(
				'keydown',
				function (e) {
					if (e.keyCode === 27) { // ESC
						self.closeMenu();
					}
				}
			);
		},

		followMenuAnchors: function() {
			var self = this;
			/* this.menuItemLink.not( '.pp-menu-item-anchor' ).each( function () {
				if ( location.pathname === this.pathname ) {
					$( this ).addClass( 'pp-menu-item-active' );
					$( this ).attr('aria-current', 'location');
				}
			} ); */

			this.anchorLink.each( function () {
				if (location.pathname === this.pathname && '' !== this.hash) {
					self.followMenuAnchorEle( $( this ) );
				}
			} );
		},

		followMenuAnchorEle: function( $element ) {
			const anchorSelector = $element[0].hash,
			activeAnchorClass = 'pp-menu-item-active',
			anchorClass = 'pp-menu-item-anchor',
			$targetElement = $element.hasClass(anchorClass) ? $element : $element.closest(`.${anchorClass}`);
			let rootMargin = '300px 0px -50% 0px',
			$anchor;

			try {
				// `decodeURIComponent` for UTF8 characters in the hash.
				$anchor = $( decodeURIComponent( anchorSelector ) );
			} catch ( e ) {
				return;
			}

			if ( ! $anchor.length ) {
				return;
			}

			if (!$anchor.hasClass('pp-menu-anchor')) {
				rootMargin = this.calculateRootMargin($anchor);
			  }
			  const threshold = this.buildThreshold($anchor);
			  const options = {
				root: null,
				rootMargin,
				threshold
			  };
			  const observer = this.createObserver($targetElement, activeAnchorClass, $element, options);
			  observer.observe($anchor[0]);
		},

		calculateRootMargin: function( $anchor ) {
			const viewportHeight = jQuery(window).height();
			const anchorHeight = $anchor.outerHeight();
			let rootMargin;
			if (anchorHeight > viewportHeight) {
				rootMargin = 0;
			} else {
				const boxViewport = viewportHeight - anchorHeight;
				rootMargin = boxViewport / 2;
			}
			return `${rootMargin}px`;
		},

		buildThreshold: function( $anchor ) {
			const viewportHeight = jQuery(window).height();
			const anchorHeight = $anchor.outerHeight();
			let threshold = 0.5;
			if (anchorHeight > viewportHeight) {
				const halfViewport = viewportHeight / 2;
				threshold = halfViewport / anchorHeight;
			}
			return threshold;
		},

		createObserver: function($targetElement, activeAnchorClass, $element, options) {
			return new IntersectionObserver(entries => {
				entries.forEach(entry => {
					$targetElement.toggleClass(activeAnchorClass, entry.isIntersecting);
					$element.attr('aria-current', entry.isIntersecting ? 'location' : '');
				});
			}, options);
		}
	};

    var isEditMode = false;

    var getElementSettings = function( $element ) {
		var elementSettings = {},
			modelCID 		= $element.data( 'model-cid' );

		if ( isEditMode && modelCID ) {
			var settings     = elementorFrontend.config.elements.data[ modelCID ],
				settingsKeys = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];

			jQuery.each( settings.getActiveControls(), function( controlKey ) {
				if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
					elementSettings[ controlKey ] = settings.attributes[ controlKey ];
				}
			} );
		} else {
			elementSettings = $element.data('settings') || {};
		}

		return elementSettings;
	};

	var AdvancedMenuHandler = function ($scope) {
		var elementSettings  = getElementSettings( $scope );

		new PPAdvancedMenu( $scope, elementSettings );
		
	};

	$(window).on('elementor/frontend/init', function () {
        if ( elementorFrontend.isEditMode() ) {
			isEditMode = true;
		}

		elementorFrontend.hooks.addAction( 'frontend/element_ready/pp-advanced-menu.default', AdvancedMenuHandler );
    });

})( jQuery );
