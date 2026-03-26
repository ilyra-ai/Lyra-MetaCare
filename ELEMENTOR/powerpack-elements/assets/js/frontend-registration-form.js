(function ($) {
	$( window ).on( 'elementor/frontend/init', () => {
		class RegistrationFormWidget extends elementorModules.frontend.handlers.Base {
			getDefaultSettings() {
				const elementSettings = this.getElementSettings();
				return {
					selectors: {
						form: '.pp-registration-form',
					},
					min_pass_length: this.$element.find('.pp-registration-form').data('password-length'),
					pws_meter: ( 'yes' === elementSettings.enable_pws_meter ),
					i18n: {
						messages: {
							error: {
								invalid_username: ppRegistration.invalid_username,
								username_exists: ppRegistration.username_exists,
								empty_email: ppRegistration.empty_email,
								invalid_email: ppRegistration.invalid_email,
								email_exists: ppRegistration.email_exists,
								password: ppRegistration.password,
								password_length: ppRegistration.password_length,
								password_mismatch: ppRegistration.password_mismatch,
								invalid_url: ppRegistration.invalid_url,
								recaptcha_php_ver: ppRegistration.recaptcha_php_ver,
								recaptcha_missing_key: ppRegistration.recaptcha_missing_key,
							},
							success: elementSettings.success_message,
						},
						pw_toggle_text: {
							show: ppRegistration.show_password,
							hide: ppRegistration.hide_password,
						},
					},
					ajaxurl: ppRegistration.ajax_url
				};
			}

			getDefaultElements() {
				const selectors = this.getSettings( 'selectors' );
				return {
					$form: this.$element.find( selectors.form ),
				};
			}

			bindEvents() {
				if ( this.elements.$form.length < 1 ) {
					return;
				}

				const settings = this.getSettings();

				this.initFields();
				this.bindErrorCodes();

				if ( this.fields.user_pass.find( '.pp-rf-toggle-pw' ).length > 0 ) {
					this.fields.user_pass.find( '.pp-rf-toggle-pw' )
						.on( 'click', $.proxy( this.passwordToggle, this ) );
				}

				if ( settings.pws_meter && 'undefined' !== typeof wp.passwordStrength ) {
					this.fields.user_pass.control.on( 'input', $.proxy( this.beginPwsMeter, this ) );
				}

				this.$element.find( '.pp-button' ).on( 'click', $.proxy( this.submit, this ) );

				this.initReCaptcha();
			}

			initReCaptcha() {
				var reCaptchaField = this.$element.find( '.pp-grecaptcha' );

				if ( elementorFrontend.isEditMode() && undefined == reCaptchaField.attr( 'data-widgetid' ) ) {
					onLoadPPReCaptcha();
				}
			}

			initFields() {
				const form = this.elements.$form;

				this.fields = {
					'user_login': form.find( '.pp-rf-field[data-field-type="user_login"]' ),
					'user_email': form.find( '.pp-rf-field[data-field-type="user_email"]' ),
					'user_pass': form.find( '.pp-rf-field[data-field-type="user_pass"]' ),
					'confirm_user_pass': form.find( '.pp-rf-field[data-field-type="confirm_user_pass"]' ),
					'user_url': form.find( '.pp-rf-field[data-field-type="user_url"]' ),
					'first_name': form.find( '.pp-rf-field[data-field-type="first_name"]' ),
					'last_name': form.find( '.pp-rf-field[data-field-type="last_name"]' ),
					'consent': form.find( '.pp-rf-field[data-field-type="consent"]' ),
					'recaptcha': form.find( '.pp-rf-field[data-field-type="recaptcha"]' ),
				};

				// Bind control.
				Object.keys( this.fields ).forEach( $.proxy( function( fieldName ) {
					if ( 'undefined' !== typeof fieldName ) {
						var field = this.fields[ fieldName ];
						var control = field.find( '.pp-rf-control[name="' + fieldName + '"]' );
						if ( control.length > 0 ) {
							this.fields[ fieldName ].control = control;
						}
					}
				}, this ) );
			}

			bindErrorCodes() {
				this.errorCodes = {
					'empty_email': 'user_email',
					'invalid_email': 'user_email',
					'email_exists': 'user_email',
					'username_wp_error': 'user_login',
					'invalid_username': 'user_login',
					'username_exists': 'user_login',
					'password': 'user_pass',
					'password_mismatch': 'confirm_user_pass',
					'invalid_url': 'user_url',
					'recaptcha_php_ver': 'recaptcha',
					'recaptcha_missing_key': 'recaptcha',
				};
			}

			getFieldByCode(code) {
				if ( 'undefined' !== typeof this.errorCodes[ code ] ) {
					var fieldType = this.errorCodes[ code ];
					var field = this.fields[ fieldType ];

					return field;
				}

				return false;
			}

			getFormData() {
				var formData = new FormData( this.$element.find( '.pp-registration-form' )[0] );
				formData.append( 'referrer', location.toString() );

				return formData;
			}

			passwordToggle() {
				const settings = this.getSettings();
				var pwField = this.fields.user_pass;

				this.pw_toggle_text = settings.i18n.pw_toggle_text;

				if ( 'text' === pwField.control.attr( 'type' ) ) {
					pwField.control.attr( 'type', 'password' );
					pwField.find( '.pp-rf-toggle-pw' )
						.attr( 'aria-label', this.pw_toggle_text.show )
						.find( 'span' )
						.removeClass( 'fa-eye-slash' )
						.addClass( 'fa-eye' );
				} else {
					pwField.control.attr( 'type', 'text' );
					pwField.find( '.pp-rf-toggle-pw' )
						.attr( 'aria-label', this.pw_toggle_text.hide )
						.find( 'span' )
						.removeClass( 'fa-eye' )
						.addClass( 'fa-eye-slash' );
				}
			}

			beginPwsMeter(e) {
				var password1 	= $(e.target).val(),
					password2 	= false,
					pwsStatus 	= this.fields.user_pass.find( '.pp-rf-pws-status' ),
					blacklist	= wp.passwordStrength.userInputBlacklist();

				if ( this.fields.confirm_user_pass.length > 0 ) {
					//password2 = this.fields.confirm_user_pass.control.val();
				}

				pwsStatus.removeClass( 'short bad good strong' );

				// calculate the password strength.
				var pws = wp.passwordStrength.meter( password1, blacklist, password2 );
				
				switch ( pws ) {
					case 0:
						pwsStatus.addClass( 'short' ).html( pwsL10n.short );
						break;
					case 1:
						pwsStatus.addClass( 'bad' ).html( pwsL10n.bad );
						break;
					case 2:
					case 3:
						pwsStatus.addClass( 'good' ).html( pwsL10n.good );
						break;	
					case 4:
						pwsStatus.addClass( 'strong' ).html( pwsL10n.strong );
						break;
				}

				if ( '' === password1 ) {
					pwsStatus.removeClass( 'short bad good strong' ).html('');
				} else {
					this.removeErrorClass( this.fields.user_pass );
				}
			}

			submit(e) {
				const settings = this.getSettings();

				this.isValid  = true;
				this.messages = settings.i18n.messages;

				var theForm         = this.elements.$form,
					submit          = this.$element.find( '.pp-button' ),
					formData        = this.getFormData(),
					reCaptchaField 	= this.$element.find( '.pp-grecaptcha' ),
					reCaptchaValue 	= reCaptchaField.data('pp-grecaptcha-response'),
					ajaxurl         = settings.ajaxurl,
					email_regex     = /\S+@\S+\.\S+/,
					postId          = theForm.closest( '.pp-rf-wrap' ).data( 'post-id' ),
					templateId      = theForm.data( 'template-id' ),
					templateNodeId  = theForm.data( 'template-node-id' ),
					nodeId          = theForm.closest( '.elementor-widget-pp-registration-form' ).data( 'id' );

				e.preventDefault();

				// End if button is disabled (sent already)
				if ( submit.hasClass( 'pp-disabled' ) ) {
					return;
				}

				theForm.find('.pp-rf-field').removeClass('pp-rf-field-error');

				// Validate Required.
				var self = this;
				theForm.find('.pp-rf-field.elementor-mark-required').each(function() {
					var field    = $(this),
						name     = field.data( 'field-type' ),
						selector = $(this).find( '[name="' + name + '"]' );

					if ( selector.length > 0 ) {
						if ( 'checkbox' === selector.attr( 'type' ) || 'radio' === selector.attr( 'type' ) ) {
							if ( ! selector.is(':checked') ) {
								self.isValid = false;
								self.addErrorClass( field );
							} else if ( self.fieldHasError( field ) ) {
								self.removeErrorClass( field );
							}
						} else {
							if ( ! selector.val() || '' === selector.val() ) {
								self.isValid = false;
								self.addErrorClass( field );
							} else if ( self.fieldHasError( field ) ) {
								self.removeErrorClass( field );
							}
						}
					}
				});

				// Validate Email
				if ( this.fields.user_email.length > 0 ) {
					var email = this.fields.user_email.find('input[type="email"]'); 

					if ( email.val() === '' ) {
						this.isValid = false;
						this.addErrorClass( this.fields.user_email );
					} else if ( ! email_regex.test( email.val() ) ) {
						this.isValid = false;
						this.removeErrorClass( this.fields.user_email );
						this.addInlineError( this.fields.user_email, settings.messages.error.invalid_email );
					} else if ( this.fieldHasError( this.fields.user_email ) ) {
						this.removeErrorClass( this.fields.user_email );
					}
				}

				// Validate password length.
				if ( this.fields.user_pass.length > 0 ) {
					var password = this.fields.user_pass.control;

					if ( '' !== password.val() && password.val().length < settings.min_pass_length ) {
						this.isValid = false;
						this.addInlineError( this.fields.user_pass, this.messages.error.password_length );
					}
				}

				// Validate confirm password.
				if ( this.fields.confirm_user_pass.length > 0 ) {
					var confirmPwd = this.fields.confirm_user_pass.find('input[name="confirm_user_pass"]').val();
					var password = this.fields.user_pass.find('input[name="user_pass"]').val();

					if ( '' !== confirmPwd && btoa( confirmPwd ) !== btoa( password ) ) {
						this.isValid = false;
						this.addInlineError( this.fields.confirm_user_pass, settings.messages.error.password_mismatch );
					}
				}

				// validate reCAPTCHA
				if ( reCaptchaField.length > 0 && this.isValid ) {
					if ( 'undefined' === typeof reCaptchaValue || reCaptchaValue === false ) {
						if ( 'normal' == reCaptchaField.data( 'validate' ) ) {
							this.isValid = false;
							this.addErrorClass( this.fields.recaptcha );
						} else if ( 'invisible' == reCaptchaField.data( 'validate' ) ) {
							// Invoke the reCAPTCHA check.
							grecaptcha.execute( reCaptchaField.data( 'widgetid' ) );
						}
					} else {
						this.removeErrorClass( this.fields.recaptcha );
					}
				}

				if ( ! this.isValid ) {
					return;
				} else {
					// Disable send button
					submit.addClass( 'pp-disabled' );

					if ( reCaptchaField.length > 0 ) {
						formData.append( 'recaptcha', true );
					}
					if ( reCaptchaValue ) {
						formData.append( 'recaptcha_response', reCaptchaValue );
					}

					/* if ( 'undefined' !== typeof templateId ) {
						formData.append( 'template_id', templateId );
						formData.append( 'template_node_id', templateNodeId );
					} */
					formData.append( 'node_id', nodeId );
					formData.append( 'action', 'ppe_register_user' );
					formData.append( 'security', theForm.data('nonce') );
					formData.append( 'post_id', postId );

					$.ajax( {
						url: ajaxurl,
						type: 'POST',
						dataType: 'json',
						data: formData,
						processData: false,
						contentType: false,
						success: $.proxy( this.submitComplete, this ),
						error: this.onError,
					} );
				}
			}

			submitComplete(response) {
				var noMessage = this.$element.find( ' .pp-rf-success-none' );

				// On success show the success message
				if ( typeof response.success !== 'undefined' && response.success === true ) {
					this.$element.find( ' .pp-rf-failed-error' ).fadeOut();
					if ( 'yes' === response.data.auto_login && ( ( 'undefined' === typeof response.data.redirect_url ) || ( '' === response.data.redirect_url ) ) ) {
						window.location.reload();
					} else if ( 'undefined' !== typeof response.data.redirect_url ) {
						window.location.href = response.data.redirect_url;
					} else if ( noMessage.length > 0 ) {
						noMessage.fadeIn();
					} else {
						this.$element.find( '.pp-registration-form' ).hide();
						this.$element.find( '.pp-after-submit-action.pp-rf-success' ).fadeIn();
					}
				} else { // On failure show fail message and re-enable the send button
					$(this.$element).find( '.pp-button' ).removeClass('pp-disabled');
					if ( typeof response.data.message !== 'undefined' ) {
						var error = response.data;
						var field = this.getFieldByCode( error.code );
						var message = 'undefined' !== typeof this.messages.error[ error.code ] ? this.messages.error[ error.code ] : error.message;

						if ( field && field.length > 0 ) {
							this.addInlineError( field, message );
						} else {
							this.$element.find( ' .pp-rf-failed-error').html( message );
							this.$element.find( ' .pp-rf-failed-error').fadeIn();
						}
					} else {
						this.$element.find( ' .pp-rf-failed-error').fadeIn();
					}
					return false;
				}
			}

			onError(xhr, status) {
				console.log(status);
			}

			addInlineError(field, message) {
				field.find('.pp-rf-error-inline').remove();
				field.addClass('pp-rf-field-error').append( '<span class="pp-rf-error-inline">' + message + '</span>' );
			}

			addErrorClass(field) {
				field.addClass( 'pp-rf-validation-error' );
			}

			removeErrorClass(field) {
				field.removeClass( 'pp-rf-validation-error' );
			}

			fieldHasError(field) {
				return field.hasClass( 'pp-rf-validation-error' );
			}
		}

		elementorFrontend.elementsHandler.attachHandler( 'pp-registration-form', RegistrationFormWidget );
	} );
})(jQuery);