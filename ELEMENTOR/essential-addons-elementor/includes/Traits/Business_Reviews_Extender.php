<?php

namespace Essential_Addons_Elementor\Pro\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Business_Reviews_Extender {

	/**
	 * Initialize Business Reviews hooks
	 */
	public function init_business_reviews_hooks() {
		add_filter( 'eael/admin/modal/businessReviewsSetting', [ $this, 'add_business_profile_dashboard_settings' ] );
		add_action( 'eael/admin/after_save_settings', [ $this, 'save_business_profile_credentials' ] );
		add_action( 'admin_init', [ $this, 'handle_business_profile_oauth_callback' ] );		
		add_action( 'init', [ $this, 'init_business_profile_token_refresh' ] );

		// Token refresh cron hook
		add_action( 'eael_business_profile_token_refresh', [ $this, 'refresh_business_profile_token_cron' ] );
		
		add_filter( 'eael/business_reviews/google_api_options', [ $this, 'add_business_profile_api_option' ] );
		add_action( 'eael/business_reviews/controls', [ $this, 'add_business_profile_controls' ] );
		add_filter( 'eael/business_reviews/settings', [ $this, 'add_business_profile_settings' ], 10, 2 );
		add_filter( 'eael/business_reviews/fetch_api', [ $this, 'fetch_business_profile_api' ], 10, 3 );
		add_filter( 'eael/business_reviews/render', [ $this, 'render_business_profile_reviews' ], 10, 4 );
	}

	/**
	 * Add Business Profile settings to dashboard modal
	 */
	public function add_business_profile_dashboard_settings( $settings ) {
		// Add Business Profile accordion section
		$redirect_uri = esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_auth=1' ) );

		$settings['accordion']['businessProfile'] = [
			'title'  => __( 'Google Business Profile API', 'essential-addons-elementor' ),
			'icon'   => 'images/map.svg',
			'isPro'  => true,
			'fields' => [
				[
					'name'        => 'br_business_profile_client_id',
					'value'       => sanitize_text_field( get_option( 'eael_br_business_profile_client_id', '' ) ),
					'label'       => __( 'Client ID:', 'essential-addons-elementor' ),
					'placeholder' => __( 'Enter Google Business Profile Client ID', 'essential-addons-elementor' ),
				],
				[
					'name'        => 'br_business_profile_client_secret',
					'value'       => sanitize_text_field( get_option( 'eael_br_business_profile_client_secret', '' ) ),
					'label'       => __( 'Client Secret:', 'essential-addons-elementor' ),
					'placeholder' => __( 'Enter Google Business Profile Client Secret', 'essential-addons-elementor' ),
				],
			],
			'info'         => sprintf(
				__( 'Get your Google Business Profile API credentials from Google Cloud Console. Add this URL to your Authorized Redirect URIs: %s', 'essential-addons-elementor' ),
				$redirect_uri
			),
			'redirect_uri' => $redirect_uri,
		];

		// Add authorization button if credentials are set
		$client_id     = sanitize_text_field( get_option( 'eael_br_business_profile_client_id', '' ) );
		$client_secret = sanitize_text_field( get_option( 'eael_br_business_profile_client_secret', '' ) );
		$access_token  = sanitize_text_field( get_option( 'eael_br_business_profile_access_token', '' ) );

		if ( ! empty( $client_id ) && ! empty( $client_secret ) ) {
			if ( empty( $access_token ) ) {
				$auth_url = $this->get_business_profile_auth_url( $client_id );
				$settings['accordion']['businessProfile']['auth_button'] = [
					'text' => __( 'Authorize Access', 'essential-addons-elementor' ),
					'url'  => $auth_url,
				];
			} else {
				$settings['accordion']['businessProfile']['auth_status'] = [
					'text'   => __( 'Authorized', 'essential-addons-elementor' ),
					'status' => 'success',
				];

				// Add refresh locations button
				$settings['accordion']['businessProfile']['refresh_button'] = [
					'text' => __( 'Refresh Locations', 'essential-addons-elementor' ),
					'url'  => esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_refresh=1' ) ),
				];

				// Add disconnect button
				$settings['accordion']['businessProfile']['disconnect_button'] = [
					'text' => __( 'Disconnect', 'essential-addons-elementor' ),
					'url'  => esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_disconnect=1' ) ),
				];
			}
		}

		// Add status/error messages from URL parameters
		if ( isset( $_GET['eael_business_profile_success'] ) ) {
			$settings['accordion']['businessProfile']['status_message'] = [
				'text'   => __( 'Authorization successful! Locations have been fetched.', 'essential-addons-elementor' ),
				'type'   => 'success',
			];
		} elseif ( isset( $_GET['eael_business_profile_locations_refreshed'] ) ) {
			$last_error = get_option( 'eael_br_business_profile_last_error', '' );
			if ( ! empty( $last_error ) ) {
				$settings['accordion']['businessProfile']['status_message'] = [
					'text'   => $last_error,
					'type'   => 'error',
				];
			} else {
				$settings['accordion']['businessProfile']['status_message'] = [
					'text'   => __( 'Locations refreshed successfully!', 'essential-addons-elementor' ),
					'type'   => 'success',
				];
			}
		} elseif ( isset( $_GET['eael_business_profile_disconnected'] ) ) {
			$settings['accordion']['businessProfile']['status_message'] = [
				'text'   => __( 'Account disconnected successfully.', 'essential-addons-elementor' ),
				'type'   => 'success',
			];
		} elseif ( isset( $_GET['eael_business_profile_error'] ) ) {
			$last_error = get_option( 'eael_br_business_profile_last_error', '' );
			$error_text = ! empty( $last_error ) ? $last_error : __( 'Authorization failed. Please try again.', 'essential-addons-elementor' );
			$settings['accordion']['businessProfile']['status_message'] = [
				'text'   => $error_text,
				'type'   => 'error',
			];
		}

		// Add stored locations display
		$locations = get_option( 'eael_br_business_profile_locations', [] );
		if ( ! empty( $locations ) && ! empty( $access_token ) ) {
			$locations_updated = strtotime( get_option( 'eael_br_business_profile_locations_updated', 0 ) );
			$locations_list = [];

			foreach ( $locations as $location_id => $location_data ) {
				$locations_list[] = [
					'id'   => esc_html( $location_id ),
					'name' =>  esc_html( $location_data['name'] ),
				];
			}

			$settings['accordion']['businessProfile']['locations'] = [
				'title'   => __( 'Available Locations', 'essential-addons-elementor' ),
				'count'   => count( $locations_list ),
				'items'   => $locations_list,
				'updated' => $locations_updated > 0 ? human_time_diff( $locations_updated, current_time( 'timestamp' ) ) . ' ' . __( 'ago', 'essential-addons-elementor' ) : '',
			];
		}

		return $settings;
	}

	/**
	 * Get Business Profile OAuth authorization URL
	 */
	private function get_business_profile_auth_url( $client_id ) {
		$redirect_uri = admin_url( 'admin.php?page=eael-settings&eael_business_profile_auth=1' );
		$scope        = 'https://www.googleapis.com/auth/business.manage';

		$params = [
			'client_id'     => $client_id,
			'redirect_uri'  => $redirect_uri,
			'response_type' => 'code',
			'scope'         => $scope,
			'access_type'   => 'offline',
			'prompt'        => 'consent',
		];

		return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query( $params );
	}

	/**
	 * Save Business Profile credentials from dashboard
	 */
	public function save_business_profile_credentials( $settings ) {
		if ( isset( $settings['br_business_profile_client_id'] ) ) {
			update_option( 'eael_br_business_profile_client_id', sanitize_text_field( $settings['br_business_profile_client_id'] ) );
		}

		if ( isset( $settings['br_business_profile_client_secret'] ) ) {
			update_option( 'eael_br_business_profile_client_secret', sanitize_text_field( $settings['br_business_profile_client_secret'] ) );
		}
	}

	/**
	 * Handle Business Profile OAuth callback
	 */
	public function handle_business_profile_oauth_callback() {
		// Handle disconnect request
		if ( isset( $_GET['eael_business_profile_disconnect'] ) && current_user_can( 'manage_options' ) ) {
			$this->disconnect_business_profile();
			wp_safe_redirect( esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_disconnected=1' ) ) );
			exit;
		}

		// Handle refresh locations request
		if ( isset( $_GET['eael_business_profile_refresh'] ) && current_user_can( 'manage_options' ) ) {
			$access_token = sanitize_text_field( get_option( 'eael_br_business_profile_access_token', '' ) );
			if ( ! empty( $access_token ) ) {
				$this->fetch_and_store_business_profile_locations( $access_token );
			}
			wp_safe_redirect( esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_locations_refreshed=1' ) ) );
			exit;
		}

		if ( ! isset( $_GET['eael_business_profile_auth'] ) || ! isset( $_GET['code'] ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Clear previous error
		delete_option( 'eael_br_business_profile_last_error' );

		$code          = sanitize_text_field( $_GET['code'] );
		$client_id     = sanitize_text_field( get_option( 'eael_br_business_profile_client_id', '' ) );
		$client_secret = sanitize_text_field( get_option( 'eael_br_business_profile_client_secret', '' ) );
		$redirect_uri  = esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_auth=1' ) );

		if ( empty( $client_id ) || empty( $client_secret ) ) {
			return;
		}

		// Exchange authorization code for access token
		$response = wp_remote_post(
			'https://oauth2.googleapis.com/token',
			[
				'body' => [
					'code'          => $code,
					'client_id'     => $client_id,
					'client_secret' => $client_secret,
					'redirect_uri'  => $redirect_uri,
					'grant_type'    => 'authorization_code',
				],
				'timeout' => 60,
			]
		);

		if ( is_wp_error( $response ) ) {
			$error_message = sprintf(
				__( 'OAuth token exchange failed: %s', 'essential-addons-elementor' ),
				$response->get_error_message()
			);
			update_option( 'eael_br_business_profile_last_error', $error_message );
			wp_safe_redirect( esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_error=1' ) ) );
			exit;
		}

		$body        = wp_remote_retrieve_body( $response );
		$data        = json_decode( $body, true );
		$status_code = wp_remote_retrieve_response_code( $response );

		if ( ! empty( $data['access_token'] ) && ! empty( $data['refresh_token'] ) ) {
			// Save tokens
			update_option( 'eael_br_business_profile_access_token', sanitize_text_field( $data['access_token'] ) );
			update_option( 'eael_br_business_profile_refresh_token', sanitize_text_field( $data['refresh_token'] ) );
			update_option( 'eael_br_business_profile_token_expires', time() + intval( $data['expires_in'] ) );

			// Schedule token refresh
			$this->schedule_business_profile_token_refresh( intval( $data['expires_in'] ) );

			// Fetch and store business profile locations
			$this->fetch_and_store_business_profile_locations( sanitize_text_field( $data['access_token'] ) );

			wp_safe_redirect( esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_success=1' ) ) );
			exit;
		}

		// Handle OAuth error response
		$error_message = __( 'Authorization failed. Please check your credentials and try again.', 'essential-addons-elementor' );
		if ( ! empty( $data['error_description'] ) ) {
			$error_message = sprintf(
				__( 'OAuth Error: %s', 'essential-addons-elementor' ),
				sanitize_text_field( $data['error_description'] )
			);
		} elseif ( ! empty( $data['error'] ) ) {
			$error_message = sprintf(
				__( 'OAuth Error: %s', 'essential-addons-elementor' ),
				sanitize_text_field( $data['error'] )
			);
		}

		update_option( 'eael_br_business_profile_last_error', $error_message );
		wp_safe_redirect( esc_url_raw( admin_url( 'admin.php?page=eael-settings&eael_business_profile_error=1' ) ) );
		exit;
	}

	/**
	 * Schedule Business Profile token refresh
	 */
	private function schedule_business_profile_token_refresh( $expires_in ) {
		$timestamp = wp_next_scheduled( 'eael_business_profile_token_refresh' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'eael_business_profile_token_refresh' );
		}

		// Schedule refresh 10 minutes before expiration
		$refresh_time = time() + $expires_in - 600;
		if ( $refresh_time <= time() ) {
			$refresh_time = time() + 60; // If already expired, refresh in 1 minute
		}

		wp_schedule_single_event( $refresh_time, 'eael_business_profile_token_refresh' );
	}

	/**
	 * Initialize Business Profile token refresh on init
	 */
	public function init_business_profile_token_refresh() {
		$token_expires = sanitize_text_field( get_option( 'eael_br_business_profile_token_expires', 0 ) );
		$refresh_token = sanitize_text_field( get_option( 'eael_br_business_profile_refresh_token', '' ) );

		// Only schedule if we have a refresh token and expiration time
		if ( ! empty( $refresh_token ) && $token_expires > 0 ) {
			// Check if already scheduled
			if ( ! wp_next_scheduled( 'eael_business_profile_token_refresh' ) ) {
				$expires_in = $token_expires - time();
				if ( $expires_in > 0 ) {
					$this->schedule_business_profile_token_refresh( $expires_in );
				}
			}
		}
	}

	/**
	 * Cron job to refresh Business Profile token
	 */
	public function refresh_business_profile_token_cron() {
		$client_id     = sanitize_text_field( get_option( 'eael_br_business_profile_client_id', '' ) );
		$client_secret = sanitize_text_field( get_option( 'eael_br_business_profile_client_secret', '' ) );
		$refresh_token = sanitize_text_field( get_option( 'eael_br_business_profile_refresh_token', '' ) );

		if ( empty( $client_id ) || empty( $client_secret ) || empty( $refresh_token ) ) {
			return;
		}

		$new_token_data = $this->refresh_business_profile_access_token( $client_id, $client_secret, $refresh_token );

		if ( ! empty( $new_token_data['access_token'] ) ) {
			update_option( 'eael_br_business_profile_access_token', sanitize_text_field( $new_token_data['access_token'] ) );
			update_option( 'eael_br_business_profile_token_expires', time() + intval( $new_token_data['expires_in'] ) );

			// Schedule next refresh
			$this->schedule_business_profile_token_refresh( intval( $new_token_data['expires_in'] ) );
		} else {
			// Retry in 1 hour if refresh failed
			wp_schedule_single_event( time() + HOUR_IN_SECONDS, 'eael_business_profile_token_refresh' );
		}
	}

	/**
	 * Refresh Business Profile access token using refresh token
	 */
	private function refresh_business_profile_access_token( $client_id, $client_secret, $refresh_token ) {
		$response = wp_remote_post(
			'https://oauth2.googleapis.com/token',
			[
				'body' => [
					'client_id'     => $client_id,
					'client_secret' => $client_secret,
					'refresh_token' => $refresh_token,
					'grant_type'    => 'refresh_token',
				],
				'timeout' => 60,
			]
		);

		if ( is_wp_error( $response ) ) {
			return [];
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		return $data;
	}

	/**
	 * Disconnect Business Profile - Clear all tokens and locations
	 */
	private function disconnect_business_profile() {
		// Delete all Business Profile related options
		delete_option( 'eael_br_business_profile_access_token' );
		delete_option( 'eael_br_business_profile_refresh_token' );
		delete_option( 'eael_br_business_profile_token_expires' );
		delete_option( 'eael_br_business_profile_locations' );
		delete_option( 'eael_br_business_profile_locations_updated' );

		// Cancel scheduled token refresh cron job
		$timestamp = wp_next_scheduled( 'eael_business_profile_token_refresh' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'eael_business_profile_token_refresh' );
		}
	}

	/**
	 * Fetch and store business profile locations
	 */
	private function fetch_and_store_business_profile_locations( $access_token ) {
		// Clear previous error
		delete_option( 'eael_br_business_profile_last_error' );

		// Fetch accounts
		$accounts_endpoint = add_query_arg(
			[
				'pageSize' => 10,
			],
			'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
		);

		$accounts_response = wp_remote_get(
			$accounts_endpoint,
			[
				'headers' => [
					'Authorization' => 'Bearer ' . $access_token,
					'Content-Type'  => 'application/json',
				],
				'timeout' => 60,
			]
		);
		if ( is_wp_error( $accounts_response ) ) {
			$error_message = sprintf(
				__( 'Failed to fetch accounts: %s', 'essential-addons-elementor' ),
				$accounts_response->get_error_message()
			);
			update_option( 'eael_br_business_profile_last_error', $error_message );
			return;
		}

		$accounts_body = wp_remote_retrieve_body( $accounts_response );
		$accounts_data = json_decode( $accounts_body, true );
		$status_code   = wp_remote_retrieve_response_code( $accounts_response );
		// Check for API errors
		if ( $status_code !== 200 ) {
			$error_message = __( 'Failed to fetch accounts.', 'essential-addons-elementor' );

			if ( ! empty( $accounts_data['error']['message'] ) ) {
				$error_message = sprintf(
					__( 'Google API Error: %s', 'essential-addons-elementor' ),
					sanitize_text_field( $accounts_data['error']['message'] )
				);
			}

			update_option( 'eael_br_business_profile_last_error', $error_message );
			return;
		}
		if ( empty( $accounts_data['accounts'] ) ) {
			$error_message = __( 'No Google Business Profile accounts found. Please ensure you have access to at least one business profile.', 'essential-addons-elementor' );
			update_option( 'eael_br_business_profile_last_error', $error_message );
			return;
		}
		$locations = [];

		// Fetch locations for first account
		$account = empty( $accounts_data['accounts'][0] ) ? [] : $accounts_data['accounts'][0];
		if ( ! empty( $account ) ) {
			$account_name = untrailingslashit( sanitize_text_field( $account['name'] ) );
			$locations_endpoint = add_query_arg(
				[
					'readMask' => 'name,title',
					'pageSize' => 100,
				],
				"https://mybusinessbusinessinformation.googleapis.com/v1/{$account_name}/locations"
			);

			$locations_response = wp_remote_get(
				$locations_endpoint,
				[
					'headers' => [
						'Authorization' => 'Bearer ' . $access_token,
						'Content-Type'  => 'application/json',
					],
					'timeout' => 60,
				]
			);
			if ( is_wp_error( $locations_response ) ) {
				$error_message = sprintf(
					__( 'Failed to fetch locations: %s', 'essential-addons-elementor' ),
					$locations_response->get_error_message()
				);
				update_option( 'eael_br_business_profile_last_error', $error_message );
				return;
			}

			$locations_body = wp_remote_retrieve_body( $locations_response );
			$locations_data = json_decode( $locations_body, true );
			$status_code    = wp_remote_retrieve_response_code( $locations_response );
			// Check for API errors
			if ( $status_code !== 200 ) {
				$error_message = __( 'Failed to fetch locations.', 'essential-addons-elementor' );

				if ( ! empty( $locations_data['error']['message'] ) ) {
					$error_message = sprintf(
						__( 'Google API Error: %s', 'essential-addons-elementor' ),
						sanitize_text_field( $locations_data['error']['message'] )
					);
				}

				update_option( 'eael_br_business_profile_last_error', $error_message );
				return;
			}
			if ( ! empty( $locations_data['locations'] ) ) {
				foreach ( $locations_data['locations'] as $location ) {
					$location_resource_name = sanitize_text_field( $location['name'] );
					$location_id            = sprintf(
						'%s/%s',
						$account_name,
						ltrim( $location_resource_name, '/' )
					);
					$location_name = ! empty( $location['title'] ) ? sanitize_text_field( $location['title'] ) : $location['name'];

					$locations[ $location_id ] = [
						'name'         => $location_name,
						'last_updated' => time(),
					];
				}
			}
		}

		// Store locations
		if ( ! empty( $locations ) ) {
			update_option( 'eael_br_business_profile_locations', $locations );
			update_option( 'eael_br_business_profile_locations_updated', time() );
		} else {
			$error_message = __( 'No locations found for this account.', 'essential-addons-elementor' );
			update_option( 'eael_br_business_profile_last_error', $error_message );
		}
	}

	/**
	 * Add Business Profile API option to Google API types
	 */
	public function add_business_profile_api_option( $options ) {
		$options['business-profile'] = __( 'Google Business Profile API', 'essential-addons-elementor' );

		return $options;
	}

	/**
	 * Add Business Profile controls
	 */
	public function add_business_profile_controls( $widget ) {
		// Check if credentials are configured
		$client_id     = sanitize_text_field( get_option( 'eael_br_business_profile_client_id', '' ) );
		$client_secret = sanitize_text_field( get_option( 'eael_br_business_profile_client_secret', '' ) );
		$access_token  = sanitize_text_field( get_option( 'eael_br_business_profile_access_token', '' ) );

		if ( empty( $client_id ) || empty( $client_secret ) ) {
			$widget->add_control(
				'eael_br_business_profile_credentials_missing',
				[
					'type'            => \Elementor\Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						__( 'Google Business Profile API credentials are missing. Please add them from EA Dashboard » Elements » <a href="%s" target="_blank">Business Reviews Settings</a>', 'essential-addons-elementor' ),
						esc_attr( site_url( '/wp-admin/admin.php?page=eael-settings' ) )
					),
					'content_classes' => 'eael-warning',
					'condition'       => [
						'eael_business_reviews_sources' => 'google-reviews',
						'eael_business_reviews_google_api_type' => 'business-profile',
					],
				]
			);
		} elseif ( empty( $access_token ) ) {
			$widget->add_control(
				'eael_br_business_profile_not_authorized',
				[
					'type'            => \Elementor\Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						__( 'Please authorize access to Google Business Profile API from EA Dashboard » Elements » <a href="%s" target="_blank">Business Reviews Settings</a>', 'essential-addons-elementor' ),
						esc_attr( site_url( '/wp-admin/admin.php?page=eael-settings' ) )
					),
					'content_classes' => 'eael-warning',
					'condition'       => [
						'eael_business_reviews_sources' => 'google-reviews',
						'eael_business_reviews_google_api_type' => 'business-profile',
					],
				]
			);
		}

		// Get stored locations
		$locations        = get_option( 'eael_br_business_profile_locations', [] );
		$location_options = [];

		if ( ! empty( $locations ) ) {
			foreach ( $locations as $location_id => $location_data ) {
				$display_name = $location_data['name'];
				
				$location_options[ $location_id ] = esc_html( $display_name );
			}
		}

		// Location control - dropdown if locations available, text input as fallback
		$widget->add_control(
			'eael_business_reviews_business_profile_location_id',
			[
				'label'       => esc_html__( 'Select Location', 'essential-addons-elementor' ),
				'type'        => \Elementor\Controls_Manager::SELECT,
				'options'     => $location_options,
				'default'     => ! empty( $location_options ) ? array_key_first( $location_options ) : '',
				'label_block' => true,
				'condition'   => [
					'eael_business_reviews_sources' => 'google-reviews',
					'eael_business_reviews_google_api_type' => 'business-profile',
				],
			]
		);

		// Add refresh notice
		$widget->add_control(
			'eael_br_business_profile_refresh_notice',
			[
				'type'            => \Elementor\Controls_Manager::RAW_HTML,
				'raw'             => sprintf(
					__( 'To refresh locations list, visit <a href="%s" target="_blank">Business Reviews Settings</a> and click "Refresh Locations".', 'essential-addons-elementor' ),
					esc_attr( site_url( '/wp-admin/admin.php?page=eael-settings' ) )
				),
				'content_classes' => 'elementor-descriptor',
				'condition'       => [
					'eael_business_reviews_sources' => 'google-reviews',
					'eael_business_reviews_google_api_type' => 'business-profile',
				],
			]
		);

		// Max reviews control for Business Profile API
		$widget->add_control(
			'eael_business_reviews_max_reviews_business_profile',
			[
				'label'       => __( 'Reviews to Show', 'essential-addons-elementor' ),
				'type'        => \Elementor\Controls_Manager::NUMBER,
				'min'         => 0,
				'max'         => 100,
				'default'     => 10,
				'condition'   => [
					'eael_business_reviews_sources' => 'google-reviews',
					'eael_business_reviews_google_api_type' => 'business-profile',
				],
			]
		);
	}

	/**
	 * Add Business Profile settings to business_reviews array
	 */
	public function add_business_profile_settings( $business_reviews, $settings ) {
		$is_business_profile = 'google-reviews' === $business_reviews['source'] && ! empty( $business_reviews['google_api_type'] ) && 'business-profile' === $business_reviews['google_api_type'];
		
		if ( $is_business_profile ) {
			$business_reviews['location_id'] = ! empty( $settings['eael_business_reviews_business_profile_location_id'] )
				? sanitize_text_field( $settings['eael_business_reviews_business_profile_location_id'] )
				: '';

			$business_reviews['client_id']     = sanitize_text_field( get_option( 'eael_br_business_profile_client_id', '' ) );
			$business_reviews['client_secret'] = sanitize_text_field( get_option( 'eael_br_business_profile_client_secret', '' ) );
			$business_reviews['access_token']  = sanitize_text_field( get_option( 'eael_br_business_profile_access_token', '' ) );
			$business_reviews['refresh_token'] = sanitize_text_field( get_option( 'eael_br_business_profile_refresh_token', '' ) );
			$business_reviews['token_expires']  = sanitize_text_field( get_option( 'eael_br_business_profile_token_expires', 0 ) );
			$business_reviews['reviews_max_count'] = ! empty( $settings['eael_business_reviews_max_reviews_business_profile'] ) ? intval( $settings['eael_business_reviews_max_reviews_business_profile'] ) : 10;
		}

		return $business_reviews;
	}

	/**
	 * Fetch Business Profile reviews from API
	 */
	public function fetch_business_profile_api( $data, $business_reviews, $widget ) {
		$is_business_profile = 'google-reviews' === $business_reviews['source'] && ! empty( $business_reviews['google_api_type'] ) && 'business-profile' === $business_reviews['google_api_type'];
		if ( ! $is_business_profile ) {
			return $data;
		}

		if ( empty( $business_reviews['location_id'] ) ) {
			return [
				'items'         => false,
				'error_message' => __( 'Location ID is required for Google Business Profile API.', 'essential-addons-elementor' ),
			];
		}

		if ( empty( $business_reviews['client_id'] ) || empty( $business_reviews['client_secret'] ) ) {
			return [
				'items'         => false,
				'error_message' => __( 'Google Business Profile API credentials are not configured.', 'essential-addons-elementor' ),
			];
		}

		// Refresh token if needed
		$access_token = $this->get_valid_business_profile_token( $business_reviews );

		if ( empty( $access_token ) ) {
			return [
				'items'         => false,
				'error_message' => __( 'Unable to authenticate with Google Business Profile API. Please check your credentials.', 'essential-addons-elementor' ),
			];
		}

		// Fetch reviews from Business Profile API
		$location_id = sanitize_text_field( $business_reviews['location_id'] );
		$api_url     = "https://mybusiness.googleapis.com/v4/{$location_id}/reviews";

		$response = wp_remote_get(
			$api_url,
			[
				'headers' => [
					'Authorization' => 'Bearer ' . $access_token,
					'Content-Type'  => 'application/json',
				],
				'timeout' => 240,
			]
		);

		if ( is_wp_error( $response ) ) {
			return [
				'items'         => false,
				'error_message' => $response->get_error_message(),
			];
		}

		$body        = wp_remote_retrieve_body( $response );
		$api_data    = json_decode( $body );
		$status_code = wp_remote_retrieve_response_code( $response );

		if ( 200 !== $status_code ) {
			$error_message = isset( $api_data->error->message )
				? $api_data->error->message
				: __( 'Failed to fetch Google Business Profile reviews.', 'essential-addons-elementor' );

			return [
				'items'         => false,
				'error_message' => $error_message,
			];
		}

		// Process and cache the data
		if ( ! empty( $api_data->reviews ) ) {
			// Transform Business Profile API format to Google Places API format
			$transformed_data = $this->transform_business_profile_response( $api_data );

			set_transient( sanitize_text_field( $business_reviews['cache_key'] ), $transformed_data, intval( $business_reviews['expiration'] ) );

			return [
				'items'         => $transformed_data,
				'error_message' => '',
			];
		}

		return [
			'items'         => false,
			'error_message' => __( 'No reviews found for this location.', 'essential-addons-elementor' ),
		];
	}

	/**
	 * Transform Business Profile API response to Google Places API format
	 */
	private function transform_business_profile_response( $api_data ) {
		$transformed = new \stdClass();

		$transformed->name = '';
		$transformed->formatted_address = '';
		$transformed->international_phone_number = '';
		$transformed->website = '';
		$transformed->url = '#';
		$transformed->photos = [];

		$total_rating = 0;
		$review_count = 0;

		if ( ! empty( $api_data->reviews ) ) {
			foreach ( $api_data->reviews as $review ) {
				if ( ! empty( $review->starRating ) ) {
					$rating_value = $this->convert_star_rating_to_number( $review->starRating );
					$total_rating += $rating_value;
					$review_count++;
				}
			}
		}

		// Use API provided values or calculate from reviews
		$transformed->rating = ! empty( $api_data->averageRating ) ? floatval( $api_data->averageRating ) : ( $review_count > 0 ? round( $total_rating / $review_count, 1 ) : 0 );
		$transformed->user_ratings_total = ! empty( $api_data->totalReviewCount ) ? intval( $api_data->totalReviewCount ) : $review_count;

		// Transform reviews array
		$transformed->reviews = [];
		if ( ! empty( $api_data->reviews ) ) {
			foreach ( $api_data->reviews as $review ) {
				$transformed_review = new \stdClass();

				$transformed_review->author_name = ! empty( $review->reviewer->displayName ) ? sanitize_text_field( $review->reviewer->displayName ) : '';
				$transformed_review->profile_photo_url = ! empty( $review->reviewer->profilePhotoUrl ) ? esc_url_raw( $review->reviewer->profilePhotoUrl ) : '';
				$transformed_review->rating = ! empty( $review->starRating ) ? $this->convert_star_rating_to_number( $review->starRating ) : 0;
				$transformed_review->text = ! empty( $review->comment ) ? esc_textarea( $review->comment ) : '';
				$transformed_review->time = ! empty( $review->createTime ) ? strtotime( $review->createTime ) : time();
				$transformed_review->reviewId = ! empty( $review->reviewId ) ? sanitize_text_field( $review->reviewId ) : '';

				$transformed->reviews[] = $transformed_review;
			}
		}

		return $transformed;
	}

	/**
	 * Convert star rating enum to numeric value
	 */
	private function convert_star_rating_to_number( $star_rating ) {
		switch ( $star_rating ) {
			case 'ONE':
				return 1;
			case 'TWO':
				return 2;
			case 'THREE':
				return 3;
			case 'FOUR':
				return 4;
			case 'FIVE':
				return 5;
			default:
				return 0;
		}
	}

	/**
	 * Get valid Business Profile access token (refresh if needed)
	 */
	private function get_valid_business_profile_token( $business_reviews ) {
		$access_token  = sanitize_text_field( $business_reviews['access_token'] );
		$token_expires = sanitize_text_field( $business_reviews['token_expires'] );

		// Check if token is still valid (with 5 minute buffer)
		if ( ! empty( $access_token ) && $token_expires > ( time() + 300 ) ) {
			return $access_token;
		}

		// Token expired or about to expire, refresh it
		$refresh_token = sanitize_text_field( $business_reviews['refresh_token'] );

		if ( empty( $refresh_token ) ) {
			// No refresh token, need to re-authenticate
			return '';
		}

		// Refresh the token
		$new_token_data = $this->refresh_business_profile_access_token(
			sanitize_text_field( $business_reviews['client_id'] ),
			sanitize_text_field( $business_reviews['client_secret'] ),
			$refresh_token
		);

		if ( ! empty( $new_token_data['access_token'] ) ) {
			// Update stored tokens
			update_option( 'eael_br_business_profile_access_token', sanitize_text_field( $new_token_data['access_token'] ) );
			update_option( 'eael_br_business_profile_token_expires', time() + intval( $new_token_data['expires_in'] ) );

			// Schedule next refresh
			$this->schedule_business_profile_token_refresh( intval( $new_token_data['expires_in'] ) );

			return $new_token_data['access_token'];
		}

		return '';
	}

	/**
	 * Render Business Profile reviews
	 */
	public function render_business_profile_reviews( $handled, $business_reviews, $business_reviews_items, $widget ) {
		$is_business_profile = 'google-reviews' === $business_reviews['source'] && ! empty( $business_reviews['google_api_type'] ) && 'business-profile' === $business_reviews['google_api_type'];
		if ( ! $is_business_profile ) {
			return $handled;
		}

		if ( ! empty( $business_reviews_items['data'] ) ) {
			$widget->print_business_reviews_google( $business_reviews_items );
			return true;
		}

		return $handled;
	}
}

