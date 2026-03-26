(function ($) {
	window.onLoadPPReCaptcha = function () {
		var reCaptchaFields = $('.pp-grecaptcha'),
			widgetID;

		if ( reCaptchaFields.length > 0 ) {
			reCaptchaFields.each(function (i) {
				var self = $(this),
					attrWidget = self.attr('data-widgetid'),
					newID = $(this).attr('id'); // + '-' + i;

				// Avoid re-rendering as it's throwing API error
				if ( ( typeof attrWidget !== typeof undefined && attrWidget !== false ) ) {
					return;
				}
				else {
					// Increment ID to avoid conflict with the same form.
					self.attr('id', newID);

					widgetID = grecaptcha.render(newID, {
						sitekey	: self.data('sitekey'),
						theme	: self.data('theme'),
						size	: self.data('validate'),
						callback: function (response) {
							if ( response != '' ) {
								self.attr('data-pp-grecaptcha-response', response);

								// Re-submitting the form after a successful invisible validation.
								if ( 'invisible' == self.data('validate') ) {
									self.closest('.elementor-widget').find('.pp-submit-button').trigger('click');
								}
							}
						}
					});

					self.attr('data-widgetid', widgetID);
				}
			});
		}
	};

	$( window ).on( 'elementor/frontend/init', () => {
		class LoginFormWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				const elementSettings = this.getElementSettings();
				return {
					selectors: {
						loginForm: '.pp-login-form',
						loginFormWrap: '.pp-login-form-wrap',
						passwordField: '.pp-lf-field-pw-toggle',
					},
					messages: {
						empty_username:   ppLogin.empty_username,
						empty_password:   ppLogin.empty_password,
						empty_password_1: ppLogin.empty_password_1,
						empty_password_2: ppLogin.empty_password_2,
						empty_recaptcha:  ppLogin.empty_recaptcha,
						email_sent:       ppLogin.email_sent,
						reset_success:    ppLogin.reset_success,
					},
					i18n: {
						pw_toggle_text: {
							show: ppLogin.show_password,
							hide: ppLogin.hide_password,
						},
					},
					page_url: this.$element.find('.pp-login-form-wrap').data('page-url'),
					facebook_login: ( 'yes' === elementSettings.facebook_login ) ? true : false,
					facebook_app_id:  this.$element.find('.pp-fb-login-button').data('appid'),
					enable_recaptcha: ( 'yes' === elementSettings.enable_recaptcha ) ? true : false,
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$loginForm: this.$element.find( selectors.loginForm ),
					$loginFormWrap: this.$element.find( selectors.loginFormWrap ),
					$passwordField: this.$element.find( selectors.passwordField ),
				};
			}

			bindEvents() {
				const elementSettings = this.getElementSettings(),
					settings = this.getSettings();

				if ( this.elements.$passwordField.find( '.pp-lf-toggle-pw' ).length > 0 ) {
					this.elements.$passwordField.find( '.pp-lf-toggle-pw' )
						.on( 'click', $.proxy( this.passwordToggle, this ) );
				}

				if ( settings.facebook_login ) {
					this.initFacebookLogin();
				}

				if ( this.$element.find( '#pp-form-' + this.getID() ).length > 0 && 'yes' === elementSettings.enable_ajax ) {
					this.$element.find( '#pp-form-' + this.getID() ).on( 'submit', $.proxy( this.loginFormSubmit, this ) );
				}

				if ( this.$element.find( '.pp-login-form--lost-pass' ).length > 0 ) {
					this.$element.find( '.pp-login-form--lost-pass' ).on( 'submit', $.proxy( this.lostPassFormSubmit, this ) );
				}

				if ( this.$element.find( '.pp-login-form--reset-pass' ).length > 0 ) {
					this.$element.find( '.pp-login-form--reset-pass' ).on( 'submit', $.proxy( this.resetPassFormSubmit, this ) );
				}

				if ( settings.enable_recaptcha ) {
					this.initReCaptcha();
				}
			}

			passwordToggle() {
				const settings = this.getSettings();

				var pwField = this.elements.$passwordField,
					pwFieldControl = pwField.find( '.elementor-field[name="pwd"]' )

				if ( 'text' === pwFieldControl.attr( 'type' ) ) {
					pwFieldControl.attr( 'type', 'password' );
					pwField.find( '.pp-lf-toggle-pw' )
						.attr( 'aria-label', settings.i18n.pw_toggle_text.show )
						.find( 'span' )
						.removeClass( 'fa-eye-slash' )
						.addClass( 'fa-eye' );
				} else {
					pwFieldControl.attr( 'type', 'text' );
					pwField.find( '.pp-lf-toggle-pw' )
						.attr( 'aria-label', settings.i18n.pw_toggle_text.hide )
						.find( 'span' )
						.removeClass( 'fa-eye' )
						.addClass( 'fa-eye-slash' );
				}
			}

			initReCaptcha() {
				var reCaptchaField = this.$element.find( '.pp-grecaptcha' );

				if ( elementorFrontend.isEditMode() && undefined == reCaptchaField.attr( 'data-widgetid' ) ) {
					onLoadPPReCaptcha();
				}
			}

			initFacebookLogin() {
				const settings = this.getSettings();

				if ( '' === settings.facebook_app_id ) {
					return;
				}
				if ( this.$element.find( '.pp-fb-login-button' ).length > 0 ) {
					this.initFacebookSDK();
				
					this.$element.find( '.pp-fb-login-button' ).on( 'click', $.proxy( this.facebookLoginClick, this ) );
				}
			}

			initFacebookSDK() {
				const settings = this.getSettings();
				let self = this;

				if ( $( '#fb-root' ).length === 0 ) {
					$('body').prepend('<div id="fb-root"></div>');
				}

				// Load the SDK asynchronously.
				var d = document, s = 'script', id = 'facebook-jssdk';
				var js, fjs = d.getElementsByTagName(s)[0];

				if (d.getElementById(id)) return;

				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);

				window.fbAsyncInit = function() {
					// Init.
					FB.init({
					  appId      : settings.facebook_app_id, // App ID.
					  cookie     : true,  // Enable cookies to allow the server to access the session.
					  xfbml      : true,  // Parse social plugins on this webpage.
					  version    : 'v2.12' // Use this Graph API version for this call.
					});
				};
			}

			facebookLoginClick() {
				const settings = this.getSettings();

				var self     = this,
					theForm  = this.$element.find( '.pp-login-form' ),
					redirect = theForm.find( 'input[name="redirect_to"]' );

				var args = {
					action: 'pp_lf_process_social_login',
					provider: 'facebook',
					page_url: settings.page_url,
					nonce: self.getNonce(),
				};

				if ( redirect.length > 0 && '' !== redirect.val() ) {
					args['redirect'] = redirect.val();
				}

				this.disableForm();

				FB.login( function( response ) {
					if ( 'connected' === response.status ) {
						FB.api( '/me', { fields: 'id, email, name, first_name, last_name' }, function( response ) {
							var authResponse = FB.getAuthResponse();
							args['user_data'] = response;
							args['auth_response'] = authResponse;
							self._ajax( args, function( response ) {
								if ( ! response.success ) {
									console.error( response.data );
									self.enableForm();
								} else {
									if ( response.data.redirect_url ) {
										window.location.href = response.data.redirect_url;
									} else {
										window.location.reload();
									}
								}
							} );
						} );
					} else {
						if ( response.authResponse ) {
							console.error( 'PP Login Form: Unable to connect Facebook account.' );
						}
						self.enableForm();
					}
				}, {
					scope: 'email',
					return_scopes: true
				} );
			}

			loginFormSubmit(e) {
				e.preventDefault();

				const settings = this.getSettings();

				var theForm         = $(e.target),
					username        = theForm.find( 'input[name="log"]' ),
					password        = theForm.find( 'input[name="pwd"]' ),
					passwordWrap    = password.closest('.pp-lf-field-inner'),
					remember        = theForm.find( 'input[name="rememberme"]' ),
					redirect        = theForm.find( 'input[name="redirect_to"]' ),
					reCaptchaField  = theForm.find( '.pp-grecaptcha' ),
					reCaptchaValue  = $( '#pp-form-' + this.getID() + ' .pp-grecaptcha' ).attr('data-pp-grecaptcha-response' ),
					self            = this;

				username.parent().find( '.pp-lf-error' ).remove();
				passwordWrap.parent().find( '.pp-lf-error' ).remove();
				reCaptchaField.parent().find( '.pp-lf-error' ).remove();

				// Validate username.
				if ( '' === username.val().trim() ) {
					$('<span class="pp-lf-error">').insertAfter( username ).html( settings.messages.empty_username );
					return;
				}

				// Validate password.
				if ( '' === password.val() ) {
					$('<span class="pp-lf-error">').insertAfter( passwordWrap ).html( settings.messages.empty_password );
					return;
				}

				// Validate reCAPTCHA.
				if ( reCaptchaField.length > 0 ) {
					if ( 'undefined' === typeof reCaptchaValue || reCaptchaValue === false ) {
						if ( 'normal' == reCaptchaField.data( 'validate' ) ) {
							$('<span class="pp-lf-error">').insertAfter( reCaptchaField ).html( settings.messages.empty_recaptcha );
							return;
						} else if ( 'invisible' == reCaptchaField.data( 'validate' ) ) {
							// Invoke the reCAPTCHA check.
							grecaptcha.execute( reCaptchaField.data( 'widgetid' ) );
						}
					}
				}

				var formData = new FormData( theForm[0] );

				formData.append( 'action', 'ppe_lf_process_login' );
				formData.append( 'page_url', settings.page_url );
				formData.append( 'username', username.val() );
				formData.append( 'password', password.val() );

				if ( redirect.length > 0 && '' !== redirect.val() ) {
					formData.append( 'redirect', redirect.val() );
				}

				if ( remember.length > 0 && remember.is(':checked') ) {
					formData.append( 'remember', '1' );
				}

				if ( reCaptchaField.length > 0 ) {
					formData.append( 'recaptcha', true );
					formData.append( 'recaptcha_validate', reCaptchaField.data( 'validate' ) );
					formData.append( 'recaptcha_validate_type', reCaptchaField.data( 'validate-type' ) );
				}
				if ( reCaptchaValue ) {
					formData.append( 'recaptcha_response', reCaptchaValue );
				}

				this.disableForm();

				this._ajax( formData, function( response ) {
					if ( ! response.success ) {
						self.enableForm();
						theForm.find( '.pp-lf-error' ).remove();
						$('<span class="pp-lf-error">').appendTo( theForm ).html( response.data );
					} else {
						if ( response.data.redirect_url ) {
							var hostUrl = location.protocol + '//' + location.host;
							var redirectUrl = '';

							if ( '' === response.data.redirect_url.split( hostUrl )[0] ) {
								redirectUrl = response.data.redirect_url.split( hostUrl )[1];
							} else {
								redirectUrl = response.data.redirect_url.split( hostUrl )[0];
							}

							if ( redirectUrl === location.href.split( hostUrl )[1] ) {
								window.location.reload();
							} else {
								window.location.href = response.data.redirect_url;
							}
						} else {
							window.location.reload();
						}
					}
				} );
			}

			lostPassFormSubmit(e) {
				e.preventDefault();

				const settings = this.getSettings();

				var theForm = $(e.target),
					username         = theForm.find( 'input[name="user_login"]' ),
					redirect         = theForm.find( 'input[name="lost_redirect_to"]' ),
					is_lost_redirect = theForm.find( 'input[name="is_lost_redirect"]' ),
					self = this;

				username.parent().find( '.pp-lf-error' ).remove();

				if ( '' === username.val().trim() ) {
					$('<span class="pp-lf-error">').insertAfter( username ).html( settings.messages.empty_username );
					return;
				}

				var formData = new FormData( theForm[0] );

				formData.append( 'action', 'pp_lf_process_lost_pass' );
				formData.append( 'page_url', settings.page_url );

				if ( redirect.length > 0 && '' !== redirect.val() ) {
					formData.append( 'redirect', redirect.val() );
				}

				this.disableForm();

				this._ajax( formData, function( response ) {

					self.enableForm();
					if ( ! response.success ) {
						username.parent().find( '.pp-lf-error' ).remove();
						$('<span class="pp-lf-error">').insertAfter( username ).html( response.data );
					} else {
						if ( '0' === is_lost_redirect.val() ) {
							$('<p class="pp-lf-success">').insertAfter( theForm ).html( settings.messages.email_sent );
							theForm.hide();
						} else {
							if ( response.data.redirect_url ) {
								var hostUrl = location.protocol + '//' + location.host;
								var redirectUrl = '';

								if ( '' === response.data.redirect_url.split( hostUrl )[0] ) {
									redirectUrl = response.data.redirect_url.split( hostUrl )[1];
								} else {
									redirectUrl = response.data.redirect_url.split( hostUrl )[0];
								}

								if ( redirectUrl === location.href.split( hostUrl )[1] ) {
									window.location.reload();
								} else {
									window.location.href = response.data.redirect_url;
									$('<p class="pp-lf-success">').insertAfter( theForm ).html( settings.messages.email_sent );
									theForm.hide();
								}
							} else {
								window.location.reload();
							}
						}
					}
				} );
			}

			resetPassFormSubmit(e) {
				e.preventDefault();

				const settings = this.getSettings();

				let theForm    = $(e.target),
					password_1 = theForm.find( 'input[name="password_1"]' ),
					password_2 = theForm.find( 'input[name="password_2"]' ),
					self	   = this;

				password_1.parent().find( '.pp-lf-error' ).remove();
				password_2.parent().find( '.pp-lf-error' ).remove();

				if ( '' === password_1.val() ) {
					$('<span class="pp-lf-error">').insertAfter( password_1 ).html( settings.messages.empty_password_1 );
					return;
				}

				if ( '' === password_2.val() ) {
					$('<span class="pp-lf-error">').insertAfter( password_2 ).html( settings.messages.empty_password_2 );
					return;
				}

				let formData = new FormData( theForm[0] );

				formData.append( 'action', 'pp_lf_process_reset_pass' );
				formData.append( 'page_url', settings.page_url );

				this.disableForm();

				this._ajax( formData, function( response ) {
					self.enableForm();
					if ( ! response.success ) {
						theForm.find( '.pp-lf-error' ).remove();
						$('<span class="pp-lf-error">').appendTo( theForm ).html( response.data );
					} else {
						$('<p class="pp-lf-success">').insertAfter( theForm ).html( settings.messages.reset_success );
						theForm.hide();
					}
				} );
			}

			enableForm() {
				this.$element.find( '.pp-login-form-wrap' ).removeClass( 'pp-event-disabled' );
			}

			disableForm() {
				this.$element.find( '.pp-login-form-wrap' ).addClass( 'pp-event-disabled' );
			}

			getNonce() {
				return this.$element.find( '.pp-login-form input[name="ppe-lf-login-nonce"]' ).val();
			}

			_ajax( data, callback ) {
				var ajaxArgs = {
					type: 'POST',
					url: ppLogin.ajax_url,
					data: data,
					dataType: 'json',
					success: function( response ) {
						if ( 'function' === typeof callback ) {
							callback( response );
						}
					},
					error: function(xhr, desc) {
						console.log(desc);
					}
				};

				if ( 'undefined' === typeof data.provider ) {
					ajaxArgs.processData = false,
					ajaxArgs.contentType = false;
				}

				$.ajax( ajaxArgs );
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-login-form', LoginFormWidget );
	} );
})(jQuery);