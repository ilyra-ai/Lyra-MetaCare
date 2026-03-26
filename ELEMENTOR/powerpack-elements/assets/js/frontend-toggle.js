(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class ToggleWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				return {
					selectors: {
						container: '.pp-toggle-container',
						switchContainer: '.pp-toggle-switch-container',
						toggleSwitch: '.pp-toggle-switch',
						labelPrimary: '.pp-primary-toggle-label',
						labelSecondary: '.pp-secondary-toggle-label',
						sectionPrimary: '.pp-toggle-section-primary',
						sectionSecondary: '.pp-toggle-section-secondary',
					},
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$container: this.$element.find( selectors.container ),
					$switchContainer: this.$element.find( selectors.switchContainer ),
					$toggleSwitch: this.$element.find( selectors.toggleSwitch ),
					$labelPrimary: this.$element.find( selectors.labelPrimary ),
					$labelSecondary: this.$element.find( selectors.labelSecondary ),
					$sectionPrimary: this.$element.find( selectors.sectionPrimary ),
					$sectionSecondary: this.$element.find( selectors.sectionSecondary ),
				};
			}

			bindEvents() {
				this.initToggle();
			}

			initToggle() {
				// Label Click
				this.onToggleClick();

				// Primary Label Click
				this.onPrimaryLabelClick();

				// Secondary Label Click
				this.onSecondaryLabelClick();
			}

			onToggleClick() {
				let self = this;

				this.elements.$toggleSwitch.on('click', function() {
					self.elements.$sectionPrimary.toggle(0, 'swing', function() {
						self.elements.$switchContainer.toggleClass('pp-toggle-switch-on');
					});
					self.elements.$sectionSecondary.toggle();

					self.elements.$toggleSwitch.prop('checked', false);
					if ( self.elements.$labelPrimary.hasClass('pp-toggle-active') ) {
						self.elements.$labelPrimary.removeClass('pp-toggle-active');
						self.elements.$labelSecondary.addClass('pp-toggle-active');
					} else {
						self.elements.$labelPrimary.addClass('pp-toggle-active');
						self.elements.$labelSecondary.removeClass('pp-toggle-active');
					}

					if ( self.elements.$sectionPrimary.is(":visible") ) {
						$(document).trigger('ppe-toggle-switched', [ self.elements.$sectionPrimary ]);
					} else {
						$(document).trigger('ppe-toggle-switched', [ self.elements.$sectionSecondary ]);
					}
				});
			}

			onPrimaryLabelClick() {
				let self = this;

				this.elements.$labelPrimary.on('click', function() {
					self.elements.$toggleSwitch.prop('checked', false);
					self.elements.$switchContainer.removeClass('pp-toggle-switch-on');
					$(this).addClass('pp-toggle-active');
					self.elements.$labelSecondary.removeClass('pp-toggle-active');
					self.elements.$sectionPrimary.show();
					self.elements.$sectionSecondary.hide();

					$(document).trigger('ppe-toggle-switched', [ self.elements.$sectionPrimary ]);
				});
			}

			onSecondaryLabelClick() {
				let self = this;

				this.elements.$labelSecondary.on('click', function() {
					self.elements.$toggleSwitch.prop('checked', true);
					self.elements.$switchContainer.addClass('pp-toggle-switch-on');
					$(this).addClass('pp-toggle-active');
					self.elements.$labelPrimary.removeClass('pp-toggle-active');
					self.elements.$sectionSecondary.show();
					self.elements.$sectionPrimary.hide();

					$(document).trigger('ppe-toggle-switched', [ self.elements.$sectionSecondary ]);
				});
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-toggle', ToggleWidget );
	} );
})(jQuery);