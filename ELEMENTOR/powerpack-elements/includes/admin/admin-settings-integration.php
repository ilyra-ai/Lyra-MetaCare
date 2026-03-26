<?php
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Admin_Settings;

$settings   = PP_Admin_Settings::get_settings();
$languages  = PP_Helper::get_google_map_languages();
?>
<div class="pp-settings-section">
	<div class="pp-settings-section-header">
		<h3 class="pp-settings-section-title"><?php esc_html_e( 'Integration', 'powerpack' ); ?></h3>
	</div>

	<div class="pp-settings-section-content">
		<h3><?php esc_html_e( 'Login Form - Facebook App', 'powerpack' ); ?></h3>
		<p><?php esc_html_e( 'Facebook App details are required only if you want to use Login with Facebook functionality on your website.', 'powerpack' ); ?></p>

		<table class="form-table">
			<tr align="top" id="pp-settings__fb-app-id">
				<th scope="row" valign="top">
					<label for="pp_fb_app_id"><?php esc_html_e( 'App ID', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_fb_app_id" name="pp_fb_app_id" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_fb_app_id', true ) ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag, 3: Link open tag, 4: Link close tag */
								esc_html__( 'To get your Facebook App ID, you need to %1$sregister and configure%2$s an app. Once registered, add the domain to your %3$sApp Domains%4$s.', 'powerpack' ),
								'<a href="https://developers.facebook.com/docs/apps/register/" target="_blank">',
								'</a>',
								'<a href="' . esc_url( PP_Helper::get_fb_app_settings_url() ) . '" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
			<tr align="top" id="pp-settings__fb-app-secret" >
				<th scope="row" valign="top">
					<label for="pp_fb_app_secret"><?php esc_html_e( 'App Secret', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_fb_app_secret" name="pp_fb_app_secret" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_fb_app_secret', true ) ); ?>" autofill="false" autocomplete="false" autosuggest="false" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag, 3: Link open tag, 4: Link close tag */
								esc_html__( 'To get your Facebook App Secret, you need to %1$sregister and configure%2$s an app. Once registered, you will find App Secret under %3$sApp Domains%4$s.', 'powerpack' ),
								'<a href="https://developers.facebook.com/docs/apps/register/" target="_blank">',
								'</a>',
								'<a href="' . esc_url( PP_Helper::get_fb_app_settings_url() ) . '" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'Login Form - Google Client ID', 'powerpack' ); ?></h3>
		<p><?php echo esc_html__( 'Google Client ID is required only if you want to use Login with Google functionality on your website.', 'powerpack' ); ?></p>

		<table class="form-table">
			<tr align="top" id="pp-settings__google-client-id" >
				<th scope="row" valign="top">
					<label for="pp_google_client_id"><?php esc_html_e( 'Google Client ID', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_google_client_id" name="pp_google_client_id" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_google_client_id', true ) ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'To get your Google Client ID, read %1$sthis document%2$s.', 'powerpack' ),
								'<a href="https://powerpackelements.com/docs/create-google-client-id/" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'Google Maps', 'powerpack' ); ?></h3>

		<table class="form-table">
			<tr valign="top">
				<th scope="row" valign="top">
					<?php esc_html_e( 'API Key', 'powerpack' ); ?>
				</th>
				<td>
					<input id="pp_google_map_api" name="pp_google_map_api" type="text" class="regular-text" value="<?php echo esc_attr( $settings['google_map_api'] ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'To get your Google API Key, read %1$sthis document%2$s.', 'powerpack' ),
								'<a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
			<tr valign="top">
				<th scope="row" valign="top">
					<?php esc_html_e( 'Google Maps Localization', 'powerpack' ); ?>
				</th>
				<td>
					<select name="pp_google_map_lang" id="pp-google-map-language" class="placeholder placeholder-active">
						<option value=""><?php esc_html_e( 'Default', 'powerpack' ); ?></option>
						<?php foreach ( $languages as $key => $value ) { ?>
							<?php
							$selected = '';
							if ( $key === $settings['google_map_lang'] ) {
								$selected = 'selected="selected" ';
							}
							?>
							<option value="<?php echo esc_attr( $key ); ?>" <?php echo esc_attr( $selected ); ?>><?php echo esc_attr( $value ); ?></option>
						<?php } ?>
					</select>
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'Business Reviews', 'powerpack' ); ?></h3>
		<table class="form-table">
			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_google_places_api_key"><?php esc_html_e( 'Google Places API Key', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_google_places_api_key" name="pp_google_places_api_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_google_places_api_key', true ) ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'To get your Google Places API Key, read %1$sthis document%2$s. It\'s now mandatory to have an active billing account associated with your Google API Key. %3$sClick here%2$s to enable your billing account.', 'powerpack' ),
								'<a href="https://developers.google.com/places/web-service/get-api-key" target="_blank">',
								'</a>',
								'<a href="https://console.cloud.google.com/projectselector2/billing/enable" target="_blank">',
							);
						?>
					</p>
				</td>
			</tr>

			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_yelp_api_key"><?php esc_html_e( 'Yelp API Key', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_yelp_api_key" name="pp_yelp_api_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_yelp_api_key', true ) ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'To get your Yelp API Key, read %1$sthis document%2$s.', 'powerpack' ),
								'<a href="https://www.yelp.com/developers/documentation/v3/authentication" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'Instagram Feed', 'powerpack' ); ?></h3>

		<table class="form-table">
			<tr valign="top">
				<th scope="row" valign="top">
					<?php esc_html_e( 'Instagram Access Token', 'powerpack' ); ?>
				</th>
				<td>
					<input id="pp_instagram_access_token" name="pp_instagram_access_token" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_instagram_access_token', true ) ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'To get your Instagram Access Token, read %1$sthis document%2$s.', 'powerpack' ),
								'<a href="https://powerpackelements.com/docs/create-instagram-access-token-for-instagram-feed-widget/" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'Video Gallery - YouTube', 'powerpack' ); ?></h3>

		<table class="form-table">
			<tr valign="top">
				<th scope="row" valign="top">
					<?php esc_html_e( 'YouTube API Key', 'powerpack' ); ?>
				</th>
				<td>
					<input id="pp_youtube_api_key" name="pp_youtube_api_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_youtube_api_key', true ) ); ?>" />
					<p class="description">
						<?php
							printf(
								/* translators: 1: Link open tag, 2: Link close tag */
								esc_html__( 'To get your YouTube API Key, read %1$sthis document%2$s.', 'powerpack' ),
								'<a href="https://console.cloud.google.com/apis/dashboard" target="_blank">',
								'</a>'
							);
						?>
					</p>
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'reCAPTCHA V2', 'powerpack' ); ?></h3>

		<p>
			<?php
				printf(
					/* translators: 1: Link open tag, 2: Link close tag */
					esc_html__( 'Register keys for your website at the %1$sGoogle Admin Console%2$s.', 'powerpack' ),
					'<a href="https://www.google.com/recaptcha/admin" target="_blank">',
					'</a>'
				);
			?>
		</p>

		<table class="form-table">
			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_recaptcha_site_key"><?php esc_html_e( 'Site Key', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_recaptcha_site_key" name="pp_recaptcha_site_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_recaptcha_site_key', true ) ); ?>" />
				</td>
			</tr>
			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_recaptcha_secret_key"><?php esc_html_e( 'Secret Key', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_recaptcha_secret_key" name="pp_recaptcha_secret_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_recaptcha_secret_key', true ) ); ?>" />
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'reCAPTCHA V3', 'powerpack' ); ?></h3>

		<p>
			<?php
				printf(
					/* translators: 1: Link open tag, 2: Link close tag */
					esc_html__( 'Register keys for your website at the %1$sGoogle Admin Console%2$s.', 'powerpack' ),
					'<a href="https://www.google.com/recaptcha/admin" target="_blank">',
					'</a>'
				);
			?>
			<br />
			<?php
				printf(
					/* translators: 1: Link open tag, 2: Link close tag */
					esc_html__( 'For more info about reCAPTCHA V3, read %1$sthis document%2$s.', 'powerpack' ),
					'<a href="https://developers.google.com/recaptcha/docs/v3" target="_blank">',
					'</a>'
				);
			?>
		</p>

		<table class="form-table">
			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_recaptcha_v3_site_key"><?php esc_html_e( 'Site Key', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_recaptcha_v3_site_key" name="pp_recaptcha_v3_site_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_recaptcha_v3_site_key', true ) ); ?>" />
				</td>
			</tr>
			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_recaptcha_v3_secret_key"><?php esc_html_e( 'Secret Key', 'powerpack' ); ?></label>
				</th>
				<td>
					<input id="pp_recaptcha_v3_secret_key" name="pp_recaptcha_v3_secret_key" type="text" class="regular-text" value="<?php echo esc_attr( PP_Admin_Settings::get_option( 'pp_recaptcha_v3_secret_key', true ) ); ?>" />
				</td>
			</tr>
		</table>

		<h3><?php esc_html_e( 'CSV Upload', 'powerpack' ); ?></h3>

		<table class="form-table">
			<tr align="top">
				<th scope="row" valign="top">
					<label for="pp_enable_csv_upload"><?php esc_html_e( 'Enable CSV Upload', 'powerpack' ); ?></label>
				</th>
				<td>
				<?php $selected = PP_Admin_Settings::get_option( 'pp_enable_csv_upload', true ); ?>
					<select name="pp_enable_csv_upload" id="pp_enable_csv_upload" class="placeholder placeholder-active">
						<option value="disabled" <?php echo ( 'disbaled' == $selected ) ? ' selected="selected"' : ''; ?>><?php esc_html_e( 'Disabled', 'powerpack' ); ?></option>
						<option value="enabled" <?php echo ( 'enabled' == $selected ) ? ' selected="selected"' : ''; ?>><?php esc_html_e( 'Enabled', 'powerpack' ); ?></option>
					</select>
					<p class="description">
						<?php // translators: %s: Enable CSV Upload ?>
						<?php echo esc_html__( 'Latest versions of WordPress have enabled more stringent security checks for file types that can be uploaded via Media Uploader.', 'powerpack' ) . '<br/>' .
						esc_html__( 'Please enable the CSV Upload option in case you\'re facing troubles in uploading CSV file in the Table Widget.', 'powerpack' ); ?>
					</p>
				</td>
			</tr>
		</table>
	</div>
</div>

<?php wp_nonce_field( 'pp-integration-settings', 'pp-modules-integration-nonce' ); ?>
