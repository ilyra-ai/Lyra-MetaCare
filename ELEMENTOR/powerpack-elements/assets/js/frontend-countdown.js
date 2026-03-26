(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class CountdownWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				const config = JSON.parse( this.$element.find('[name=pp-countdown-settings]').val() ),
				settings = {
					timertype: config.timer_type,
					timer_format: config.timer_format,
					timer_layout: config.timer_layout,
					timer_labels: config.timer_labels,
					timer_labels_singular: config.timer_labels_singular,
					redirect_link: config.redirect_link.url,
					redirect_link_target: config.redirect_link_target,
					fixed_timer_action: config.fixed_timer_action,
					evergreen_timer_action: config.evergreen_timer_action,
					evergreen_date_days: config.days,
					evergreen_date_hour: config.hours,
					evergreen_date_minutes: config.minutes,
					evergreen_date_seconds: config.seconds,
					timezone: config.time_zone,
					id: this.getID()
				}

				if ( 'NULL' === config.time_zone || '' === config.time_zone ) {
					settings.timezone = null;
				}

				if ( 'evergreen' === config.timer_type ) {
					settings.timer_date = new Date();
				} else {
					settings.timer_date = new Date( config.years, (config.months - 1), config.days, config.hours, config.minutes );
				}

				if ( config.timer_exp_text ) {
					settings.timer_exp_text = config.timer_exp_text;
				}

				settings.selectors = {
					wrap: '.pp-countdown-wrapper',
				};

				return settings;
			}
		
			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$wrap: this.$element.find( selectors.wrap ),
				};
			}
		
			bindEvents() {
				const settings = this.getSettings();

				if ( 'fixed' == settings.timertype ) {
					this.initFixedTimer();
				}

				if ( 'evergreen' == settings.timertype ) {
					var currdate = '',
						timevar = 0;

					if ( undefined == $.cookie( 'countdown-' + settings.id ) ) {
						$.cookie( 'countdown-' + settings.id, true );
						$.cookie( 'countdown-' + settings.id + '-currdate', new Date() );
						$.cookie( 'countdown-' + settings.id + '-day', settings.evergreen_date_days );
						$.cookie( 'countdown-' + settings.id + '-hour', settings.evergreen_date_hour );
						$.cookie( 'countdown-' + settings.id + '-min', settings.evergreen_date_minutes );
						$.cookie( 'countdown-' + settings.id + '-sec', settings.evergreen_date_seconds );
					}

					currdate = new Date( $.cookie( 'countdown-' + settings.id + '-currdate' ) );

					timevar = ( parseFloat( settings.evergreen_date_days * 24 * 60 * 60 ) + parseFloat( settings.evergreen_date_hour * 60 * 60 ) + parseFloat( settings.evergreen_date_minutes * 60 ) + parseFloat( settings.evergreen_date_seconds ) ) * 1000;

					currdate.setTime( currdate.getTime() + timevar );

					settings.timer_date = currdate;

					this.initEverGreenTimer();
				}

				this.initCountdown();
			}

			initCountdown() {
				const settings = this.getSettings();
				var action = '';

				if ( 'fixed' === settings.timertype ) {
					action = settings.fixed_timer_action;
				} else {
					action = settings.evergreen_timer_action;
				}

				$.cookie( 'countdown-' + settings.id + 'expiremsg', null);
				$.cookie( 'countdown-' + settings.id + 'redirect', null);
				$.cookie( 'countdown-' + settings.id + 'redirectwindow', null);
				$.cookie( 'countdown-' + settings.id + 'hide', null);
				$.cookie( 'countdown-' + settings.id + 'reset', null);

				$.removeCookie( 'countdown-' + settings.id + 'expiremsg');
				$.removeCookie( 'countdown-' + settings.id + 'redirect');
				$.removeCookie( 'countdown-' + settings.id + 'redirectwindow');
				$.removeCookie( 'countdown-' + settings.id + 'hide');
				$.removeCookie( 'countdown-' + settings.id + 'reset');

				if ( 'msg' === action ) {

					$.cookie( 'countdown-' + settings.id + 'expiremsg', settings.expire_message, { expires: 365 });

				} else if ( 'redirect' === action ) {

					$.cookie( 'countdown-' + settings.id + 'redirect', settings.redirect_link, { expires: 365 });
					$.cookie( 'countdown-' + settings.id + 'redirectwindow', settings.redirect_link_target, { expires: 365 });

				} else if ( 'hide' === action ) {

					$.cookie( 'countdown-' + settings.id + 'hide', 'yes', { expires: 365 });

				} else if ( 'reset' === action ) {
					$.cookie( 'countdown-' + settings.id + 'reset', 'yes', { expires: 365 });
				}
			}

			countdownConfig(settings) {
				const config = {
					until: settings.timer_date,
					format: settings.timer_format,
					layout: settings.timer_layout,
					labels: settings.timer_labels.split(','),
					timezone: settings.timezone,
					labels1: settings.timer_labels_singular.split(','),
				};

				return config;
			}

			initFixedTimer() {
				const settings = this.getSettings(),
					dateNow = new Date();

				if ( ( dateNow.getTime() - settings.timer_date.getTime() ) > 0 ) {
					var config = this.countdownConfig(settings);

					if ( 'msg' === settings.fixed_timer_action ) {
						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							this.elements.$wrap.append( settings.timer_exp_text );
						} else {
							config.expiryText = settings.timer_exp_text;

							this.elements.$wrap.countdown(config);
						}

					} else if ( 'redirect' === settings.fixed_timer_action ) {

						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							window.open( settings.redirect_link, settings.redirect_link_target );
						} else {
							config.expiryText = settings.timer_exp_text;

							this.elements.$wrap.countdown(config);
						}

					} else if ( 'hide' === settings.fixed_timer_action ) {
						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							this.elements.$wrap.countdown('destroy');
						} else {
							config.expiryText = settings.timer_exp_text;

							this.elements.$wrap.countdown(config);
						}

					} else {
						this.elements.$wrap.countdown(config);
					}
				} else {
					var config = this.countdownConfig(settings);

					if ( 'msg' === settings.fixed_timer_action ) {

						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							config.expiryText = settings.timer_exp_text;

							this.elements.$wrap.countdown(config);
						} else {
							this.elements.$wrap.countdown(config);
						}
					} else if ( 'redirect' === settings.fixed_timer_action ) {
						config.expiryText = settings.timer_exp_text;
						config.onExpiry = settings.redirectCounter;

						this.elements.$wrap.countdown(config);

					} else if ( 'hide' === settings.fixed_timer_action ) {
						config.expiryText = settings.timer_exp_text;
						config.onExpiry = settings.destroyCounter;

						this.elements.$wrap.countdown(config);

					} else {
						config.expiryText = settings.timer_exp_text;

						this.elements.$wrap.countdown(config);
					}
				}
			}

			initEverGreenTimer() {
				const settings = this.getSettings(),
					dateNow = new Date();

				if ( ( dateNow.getTime() - settings.timer_date.getTime() ) > 0 ) {
					var config = this.countdownConfig(settings);

					if ( 'msg' === settings.evergreen_timer_action ) {
						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							this.elements.$wrap.append( $.cookie( 'countdown-' + this.settings.id + 'expiremsg' ) );
						} else {
							config.expiryText = $.cookie( 'countdown-' + settings.settings.id + 'expiremsg');

							this.elements.$wrap.countdown(config);
						}

					} else if ( 'redirect' === settings.evergreen_timer_action ) {

						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							window.open(settings.redirect_link, settings.redirect_link_target);
						} else {
							config.onExpiry = settings.redirectCounter;

							this.elements.$wrap.countdown(config);
						}

					} else if ( 'hide' === settings.evergreen_timer_action ) {
						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							this.elements.$wrap.countdown('destroy');
						} else {
							config.onExpiry = settings.destroyCounter;

							this.elements.$wrap.countdown(config);
						}

					} else if ( 'reset' === settings.evergreen_timer_action ) {
						config.onExpiry = settings.restartCountdown;

						this.elements.$wrap.countdown(config);

					} else {
						this.elements.$wrap.countdown(config);
					}
				} else {
					var config = this.countdownConfig(settings);

					if ( 'msg' === settings.evergreen_timer_action ) {

						if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
							config.expiryText = $.cookie( 'countdown-' + settings.settings.id + 'expiremsg');

							this.elements.$wrap.countdown(config);
						} else {
							this.elements.$wrap.countdown(config);
						}

					} else if ( 'redirect' === settings.evergreen_timer_action ) {
						config.onExpiry = settings.redirectCounter;

						this.elements.$wrap.countdown(config);

					} else if ( 'hide' === settings.evergreen_timer_action ) {
						config.onExpiry = settings.destroyCounter;

						this.elements.$wrap.countdown(config);

					} else if ( 'reset' === settings.evergreen_timer_action ) {
						config.onExpiry = settings.restartCountdown;

						this.elements.$wrap.countdown(config);

					} else {
						this.elements.$wrap.countdown(config);
					}
				}
			}

			redirectCounter() {
				var redirect_link = jQuery.cookie( jQuery(this)[0].id + 'redirect' );
				var redirect_link_target = jQuery.cookie( jQuery(this)[0].id + 'redirectwindow' );

				if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
					window.open( redirect_link, redirect_link_target );
				} else {
					return;
				}
			}

			destroyCounter() {
				if ( parseInt( window.location.href.toLowerCase().indexOf('?elementor') ) === parseInt(-1) ) {
					jQuery(this).countdown('destroy');
				}
			}

			restartCountdown() {
				const settings = this.getSettings();

				$.cookie( 'countdown-' + settings.id + '-currdate', new Date() );

				currdate = new Date($.cookie( 'countdown-' + settings.id + '-currdate') );

				var evergreen_date_days = $.cookie( 'countdown-' + settings.id + '-day' );
				var evergreen_date_hour = $.cookie( 'countdown-' + settings.id + '-hour' );
				var evergreen_date_minutes = $.cookie( 'countdown-' + settings.id + '-min' );
				var evergreen_date_seconds = $.cookie( 'countdown-' + settings.id + '-sec' );

				var timevar = ( parseFloat( evergreen_date_days * 24 * 60 * 60 ) + parseFloat( evergreen_date_hour * 60 * 60 ) + parseFloat( evergreen_date_minutes * 60 ) + parseFloat( evergreen_date_seconds ) ) * 1000;
				currdate.setTime( currdate.getTime() + timevar );

				settings.timer_date = currdate;

				jQuery(this).countdown('option', { until: settings.timer_date });
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-countdown', CountdownWidget );
    });

})(jQuery);
