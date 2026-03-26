<?php

namespace Essential_Addons_Elementor\Pro\Classes\License;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Exception;
use WP_Error;

/**
 * @property int             $item_id
 * @property string          $version
 * @property string          $storeURL
 * @property string          $db_prefix
 * @property string          $textdomain
 * @property string          $item_name
 * @property string          $plugin_file
 * @property string          $page_slug
 * @property string|string[] $screen_id
 * @property string          $scripts_handle
 * @property bool            $dev_mode
 * @property string          $api
 * @property string          $namespace
 */
#[\AllowDynamicProperties]
class Manager {
	private        $_version     = '2.1.0';
	private static $_instance    = null;
	protected      $license      = '';
	protected      $license_data = null;

	/**
	 * @var LicenseStore
	 */
	protected $store;

	/**
	 * @var string Cache key for tracking failed API requests.
	 */
	private $failed_request_cache_key;

	/**
	 * @var array
	 */
	protected $args = [
		'version'        => '',
		'plugin_file'    => '',
		'item_id'        => 0,
		'item_name'      => '',
		'item_slug'      => '',
		'storeURL'       => 'https://api.wpdeveloper.com',
		'textdomain'     => '',
		'db_prefix'      => '',
		'scripts_handle' => '',
		'screen_id'      => '',
		'page_slug'      => '',
		'api'            => ''
	];

	/**
	 * @var array
	 */
	private $endpoints = [
		'activate_license'   => '/activate-license',
		'activate_license_by_otp'   => '/activate-license',
		'resend_otp_for_license'   => '/activate-license',
		'deactivate_license' => '/deactivate-license',
		'check_license'      => '/check-license',
		'get_version'      => '/get-latest-license',
	];

	/**
	 * @var array
	 */
	private $error = [];

	/**
	 * Returns the singleton instance of the Manager.
	 *
	 * @param array $args Configuration arguments.
	 *
	 * @return self
	 *
	 * @throws Exception If required args are missing.
	 */
	public static function get_instance( $args ) {
		if ( null === self::$_instance ) {
			self::$_instance = new self( $args );
		}

		return self::$_instance;
	}

	/**
	 * Magic getter for accessing config values as properties.
	 *
	 * @param string $name Property name.
	 *
	 * @return mixed
	 */
	public function __get( $name ) {
		if ( property_exists( $this, $name ) ) {
			return $this->$name;
		}

		if ( isset( $this->args[ $name ] ) ) {
			return $this->args[ $name ];
		}

		return null;
	}

	/**
	 * Magic isset check for config values.
	 *
	 * @param string $name Property name.
	 *
	 * @return bool
	 */
	public function __isset( $name ) {
		return isset( $this->args[ $name ] );
	}

	/**
	 * Initializes the license manager with configuration, storage, API, and hooks.
	 *
	 * @param array $args Configuration arguments.
	 *
	 * @throws Exception If required args are missing.
	 */
	public function __construct( array $args ) {
		foreach ( $this->args as $property => $value ) {
			if ( ! array_key_exists( $property, $args ) && empty( $value ) ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				throw new Exception( "$property is missing in licensing." );
			}
		}

		$this->args = wp_parse_args( $args, $this->args );

		$this->failed_request_cache_key = 'wpdeveloper_sl_failed_http_' . md5( $this->storeURL );

		$this->store = new LicenseStore( $this->db_prefix );
		$this->store->maybe_migrate_error_key();

		if ( ! empty( $this->args['migrate_from'] ) && is_array( $this->args['migrate_from'] ) ) {
			$this->store->maybe_migrate_from( $this->args['migrate_from'] );
		}

		if ( true === $this->dev_mode ) {
			// Scope the external-host allowance to our store URL only, so other
			// plugins' wp_safe_remote_* calls are not affected.
			add_filter( 'http_request_host_is_external', [ $this, 'allow_store_host' ], 10, 2 );
		}

		add_action( 'admin_notices', [ $this, 'admin_notices' ] );

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ], 999 );

		if ( ! empty( $this->args['api'] ) ) {
			$api_type = strtolower( $this->args['api'] );

			if ( ! isset( $this->args[ $api_type ] ) ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				throw new Exception( "$api_type is missing in licensing." );
			}

			new Api( $this );
		}

		add_action( 'init', [ $this, 'plugin_updater' ] );

		$weekly_check = isset( $this->args['weekly_check'] ) ? $this->args['weekly_check'] : false;
		if ( $weekly_check ) {
			new CronChecker( $this );
		}

		$action_links = isset( $this->args['action_links'] ) ? $this->args['action_links'] : false;
		if ( $action_links ) {
			add_filter( 'plugin_action_links_' . plugin_basename( $this->plugin_file ), [ $this, 'plugin_action_links' ] );
		}
	}

	/**
	 * Returns the underlying LicenseStore instance.
	 *
	 * @return LicenseStore
	 */
	public function get_store(): LicenseStore {
		return $this->store;
	}

	/**
	 * Displays admin notices for license errors or activation prompts.
	 *
	 * @return void
	 */
	public function admin_notices(): void {
		if ( null === $this->license_data ) {
			$this->license_data = $this->get_license_data();
		}

		$this->error = $this->get_error();

		if ( ! empty( $this->error ) ) {
			$this->render_notice( $this->error['message'] );

			return;
		}

		if ( ! ( ( empty( $this->license_data ) ) && current_user_can( 'activate_plugins' ) ) ) {
			return;
		}

		/* translators: 1: opening anchor tag, 2: closing anchor tag, 3: plugin name */
		$message = sprintf( __( '%1$sActivate your %3$s License Key%2$s to receive regular updates and secure your WordPress website.', 'essential-addons-elementor' ), '<a style="text-decoration: underline; font-weight: bold;" href="' . esc_url( admin_url( 'admin.php?page=' . $this->page_slug ) ) . '">', '</a>', $this->item_name );

		if ( isset( $this->args['activation_notice'] ) ) {
			$message = $this->args['activation_notice'];
		}

		$this->render_notice( $message );
	}

	/**
	 * Renders an admin notice with an optional plugin icon.
	 *
	 * @param string $message The notice message HTML.
	 *
	 * @return void
	 */
	private function render_notice( $message ) {
		$icon_html = '';

		if ( ! empty( $this->args['item_icon'] ) ) {
			$icon_html = sprintf(
				'<img src="%s" alt="%s" style="width: 24px; height: 24px; margin-right: 10px; vertical-align: middle;" />',
				esc_url( $this->args['item_icon'] ),
				esc_attr( $this->item_name )
			);
		}

		$notice = sprintf(
			'<div style="padding: 10px; display: flex; align-items: center;" class="%1$s-notice wpdeveloper-licensing-notice notice notice-error">%2$s<p>%3$s</p></div>',
			sanitize_html_class( $this->textdomain ),
			$icon_html,
			$message
		);

		echo wp_kses_post( $notice );
	}

	/**
	 * Initializes the plugin updater to check for updates from the store API.
	 *
	 * @return void
	 */
	public function plugin_updater(): void {
		$doing_cron = defined( 'DOING_CRON' ) && DOING_CRON;

		if ( ! current_user_can( 'manage_options' ) && ! $doing_cron ) {
			return;
		}

		$_license = $this->store->get_license();

		new Updater( $this->storeURL, $this->plugin_file, [
			'sdk_version'     => $this->_version,
			'version'         => $this->version,
			'license'         => $_license,
			'item_id'         => $this->item_id,
			'update_endpoint' => true === $this->dev_mode ? 'staging-get-latest-version' : 'get-latest-version',
			'author'          => empty( $this->author ) ? 'WPDeveloper' : $this->author,
			'beta'            => isset( $this->beta ) ? $this->beta : false,
		] );
	}

	/**
	 * Retrieves configuration arguments, or a single argument by name.
	 *
	 * @param string $name
	 *
	 * @return mixed
	 */
	public function get_args( string $name = '' ) {
		return empty( $name ) ? $this->args : $this->args[ $name ];
	}

	/**
	 * Enqueues license data as a localized script on matching admin screens.
	 *
	 * @param string $hook The current admin page hook suffix.
	 *
	 * @return void
	 */
	public function enqueue( string $hook ): void {
		if ( is_array( $this->screen_id ) && ! in_array( $hook, $this->screen_id, true ) ) {
			return;
		}

		if ( ! is_array( $this->screen_id ) && $this->screen_id !== $hook ) {
			return;
		}

		wp_localize_script( $this->scripts_handle, 'wpdeveloperLicenseData', $this->get_license_data() );
	}

	/**
	 * Retrieves the full license data array including key, status, and cached API data.
	 *
	 * @return array
	 */
	public function get_license_data(): array {
		$_license        = $this->store->get_license();

		if ( empty( $_license ) ) {
			return [];
		}

		$_license_data   = $this->store->get_license_data();
		if ( false !== $_license_data ) {
			$_license_data = (array) $_license_data;
		}

		if ( empty( $_license_data ) ) {
			$response = $this->check();
			if ( is_wp_error( $response ) ) {
				return [];
			}

			$_license_data = (array) $response;
		}

		return array_merge( [
			'license_key'        => $_license,
			'hidden_license_key' => $this->hide_license_key( $_license ),
			'license_status'     => $this->store->get_status()
		], $_license_data );
	}

	/**
	 * Masks the middle portion of a license key for display purposes.
	 *
	 * @param string $_license The full license key.
	 *
	 * @return string
	 */
	public function hide_license_key( string $_license ): string {
		$length = mb_strlen( $_license ) - 10;

		return substr_replace( $_license, mb_substr( preg_replace( '/\S/', '*', $_license ), 5, $length ), 5, $length );
	}

	/**
	 * Activates a license key against the remote store.
	 *
	 * @param array $args Arguments containing 'license_key'.
	 *
	 * @return object|WP_Error The API response or error.
	 */
	public function activate( $args = [] ) {
		$this->license = sanitize_text_field( isset( $args['license_key'] ) ? trim( $args['license_key'] ) : '' );
		$response      = $this->remote_post( 'activate_license' );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		/**
		 * Return if license required OTP to activate.
		 */
		if ( isset( $response->license ) && 'required_otp' === $response->license ) {
			return $response;
		}

		$this->store->delete_error();

		$this->store->save_all( $this->license, $response );

		$this->maybe_schedule_cron();

		do_action( 'wpdeveloper_licensing_activated', $response, $this->license, $this );

		return $response;
	}

	/**
	 * Deactivates the current license key against the remote store.
	 *
	 * @return object|WP_Error The API response or error.
	 */
	public function deactivate() {
		$this->license = $this->store->get_license();
		$response      = $this->remote_post( 'deactivate_license' );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$this->store->purge_all();

		$this->maybe_unschedule_cron();

		do_action( 'wpdeveloper_licensing_deactivated', $response, $this );

		return $response;
	}

	/**
	 * Submits an OTP verification code to activate a license.
	 *
	 * @param array $args Arguments containing 'license_key' and 'otp'.
	 *
	 * @return object|WP_Error The API response or error.
	 */
	public function submit_otp( $args = [] ) {
		$this->license = sanitize_text_field( isset( $args['license_key'] ) ? trim( $args['license_key'] ) : '' );
		$response      = $this->remote_post( 'activate_license_by_otp', $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$this->store->save_all( $this->license, $response );

		$this->maybe_schedule_cron();

		do_action( 'wpdeveloper_licensing_activated', $response, $this->license, $this );

		return $response;
	}

	/**
	 * Requests the remote store to resend an OTP verification code.
	 *
	 * @param array $args Arguments containing 'license_key'.
	 *
	 * @return object|WP_Error The API response or error.
	 */
	public function resend_otp( $args ) {
		$this->license = sanitize_text_field( isset( $args['license_key'] ) ? trim( $args['license_key'] ) : '' );

		return $this->remote_post( 'resend_otp_for_license', $args );
	}

	/**
	 * Checks the current license status against the remote store.
	 *
	 * @return array|object|WP_Error The cached or fresh license data, or error.
	 */
	public function check() {
		$this->license = $this->store->get_license();
		$_license_data = $this->store->get_license_data();

		if ( false !== $_license_data ) {
			$_license_data = (array) $_license_data;
		}

		if ( ! empty( $_license_data ) ) {
			return $_license_data;
		}

		$response = $this->remote_post( 'check_license' );

		if ( is_wp_error( $response ) ) {
			$this->store->delete_license_data();

			return $response;
		}

		$this->store->set_license_data( $response );
		$this->store->delete_error();

		do_action( 'wpdeveloper_licensing_checked', $response, $this );

		return $response;
	}

	/**
	 * Sends a remote POST request to the licensing store API.
	 *
	 * @param string $action The EDD action to perform (e.g. 'activate_license').
	 * @param array  $args   Additional arguments to include in the request body.
	 *
	 * @return object|WP_Error The decoded API response or error.
	 */
	public function remote_post( $action, $args = [] ) {
		if ( empty( $this->license ) ) {
			return new WP_Error( 'empty_license', __( 'Please provide a valid license.', 'essential-addons-elementor' ) );
		}

		if ( $this->request_recently_failed() ) {
			return new WP_Error( 'request_backoff', __( 'The license server is temporarily unavailable. Please try again later.', 'essential-addons-elementor' ) );
		}

		$defaults = [
			'sdk_version' => $this->_version,
			'edd_action'  => $action,
			'license'     => $this->license,
			'item_id'     => $this->item_id,
			'item_name'   => rawurlencode( $this->item_name ), // the name of our product in EDD
			'url'         => home_url(),
			'version'     => $this->version,
			'environment' => function_exists( 'wp_get_environment_type' ) ? wp_get_environment_type() : 'production',
		];

		$args = wp_parse_args( $args, $defaults );

		$args = apply_filters( 'wpdeveloper_licensing_api_request_args', $args, $action, $this );

		// Re-enforce security-critical keys so no filter can tamper with them.
		$args['edd_action'] = $action;
		$args['license']    = $this->license;
		$args['item_id']    = $this->item_id;
		$args['url']        = home_url();

		$response = wp_safe_remote_post( $this->get_api_url( $action ), [
			'timeout'   => 15,
			'sslverify' => true !== $this->dev_mode,
			'body'      => $args,
		] );

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			$this->log_failed_request();

			if ( is_wp_error( $response ) ) {
				$this->store->set_error( [
					'code'    => $response->get_error_code(),
					'message' => $response->get_error_message()
				] );

				do_action( 'wpdeveloper_licensing_error', $response, $action, $this );

				return $response;
			}

			$error = new WP_Error( 'unknown', __( 'An error occurred, please try again.', 'essential-addons-elementor' ) );

			$this->store->set_error( [
				'code'    => 'unknown',
				'message' => __( 'An error occurred, please try again.', 'essential-addons-elementor' )
			] );

			do_action( 'wpdeveloper_licensing_error', $error, $action, $this );

			return $error;
		}

		$this->clear_failed_request();

		$license_data = json_decode( wp_remote_retrieve_body( $response ) );

		if ( null === $license_data ) {
			$this->store->set_error( [
				'code'    => 'invalid_response',
				'message' => __( 'An error occurred, please try again.', 'essential-addons-elementor' )
			] );

			$error = new WP_Error( 'invalid_response', __( 'An error occurred, please try again.', 'essential-addons-elementor' ) );

			do_action( 'wpdeveloper_licensing_error', $error, $action, $this );

			return $error;
		}

		$license_data = $this->maybe_error( $license_data );

		if ( is_wp_error( $license_data ) ) {
			$this->store->set_error( [
				'code'    => $license_data->get_error_code(),
				'message' => $license_data->get_error_message()
			] );

			do_action( 'wpdeveloper_licensing_error', $license_data, $action, $this );
		} else {
			$license_data->license_key = $this->hide_license_key( $this->license );
			$this->store->delete_error();
		}

		return $license_data;
	}

	/**
	 * Returns the API URL for a given action.
	 *
	 * Per-action endpoint routing (e.g. /activate-license, /deactivate-license) is
	 * currently disabled — all actions post to the bare storeURL regardless of the
	 * action name or dev_mode flag.
	 *
	 * @param string $action The EDD action name.
	 *
	 * @return string
	 */
	private function get_api_url( $action ) {
		if ( false && isset( $this->endpoints[ $action ] ) ) {
			$endpoint = $this->endpoints[ $action ];

			if ( true === $this->dev_mode ) {
				$endpoint = '/staging-' . ltrim( $endpoint, '/' );
			}

			return rtrim( $this->storeURL, '/' ) . $endpoint;
		}

		return $this->storeURL;
	}

	/**
	 * Checks the API response for error conditions and returns a WP_Error if found.
	 *
	 * @param object $license_data The decoded API response object.
	 *
	 * @return object|WP_Error The original data if successful, or a WP_Error.
	 */
	private function maybe_error( $license_data ) {
		if ( false === $license_data->success ) {
			$error_code = 'unknown';

			if ( isset( $license_data->error ) ) {
				$error_code = $license_data->error;
			} elseif ( isset( $license_data->license ) ) {
				$error_code = $license_data->license;
			}

			switch ( $error_code ) {
				case 'expired':
					/* translators: 1: plugin name, 2: license key expiration date */
					$message = sprintf( __( 'Your <strong>%1$s</strong> license key expired on %2$s.', 'essential-addons-elementor' ), $this->item_name, date_i18n( get_option( 'date_format' ), $license_data->expires ) );
					break;

				case 'invalid_otp':
					$message = __( 'Your license confirmation code is invalid.', 'essential-addons-elementor' );
					break;

				case 'expired_otp':
					$message = __( 'Your license confirmation code has been expired.', 'essential-addons-elementor' );
					break;

				case 'revalidate_license':
					/* translators: 1: opening strong tag, 2: closing strong tag, 3: opening anchor tag, 4: closing anchor tag, 5: plugin name */
					$message = sprintf( __( '%1$sAttention:%2$s Please %3$sVerify your %5$s License Key%4$s to get regular updates & secure your WordPress website.', 'essential-addons-elementor' ), '<strong>', '</strong>', '<a style="text-decoration: underline; font-weight: bold;" href="' . esc_url( admin_url( 'admin.php?page=' . $this->page_slug ) ) . '">', '</a>', $this->item_name );
					break;

				case 'disabled':
				case 'revoked':
					/* translators: 1: plugin name */
					$message = sprintf( __( 'Your <strong>%s</strong> license key has been disabled.', 'essential-addons-elementor' ), $this->item_name );
					break;

				case 'invalid':
				case 'missing':
					$message = __( 'Invalid license.', 'essential-addons-elementor' );
					break;

				case 'inactive':
				case 'site_inactive':
					/* translators: the plugin name */
					$message = sprintf( __( 'Your <strong>%s</strong> license is not active for this URL.', 'essential-addons-elementor' ), $this->item_name );
					break;

				case 'item_name_mismatch':
					/* translators: the plugin name */
					$message = sprintf( __( 'This appears to be an invalid license key for <strong>%s</strong>.', 'essential-addons-elementor' ), $this->item_name );
					break;

				case 'no_activations_left':
					$message = __( 'Your license key has reached its activation limit.', 'essential-addons-elementor' );
					break;

				case 'custom':
					$message = ! empty( $license_data->message ) ? $license_data->message : __( 'Something went wrong.', 'essential-addons-elementor' );
					break;

				default:
					$message = __( 'An error occurred, please try again.', 'essential-addons-elementor' );
					break;
			}

			return new WP_Error( $error_code, wp_kses( $message, 'post' ) );
		}

		return $license_data;
	}

	/**
	 * Deletes all local license data without contacting the remote server.
	 *
	 * @return void
	 */
	public function delete_license() {
		$this->store->purge_all();
		$this->license      = '';
		$this->license_data = null;

		$this->maybe_unschedule_cron();

		do_action( 'wpdeveloper_licensing_deleted', $this );
	}

	/**
	 * Adds a "Manage License" link to the plugin action links on the Plugins page.
	 *
	 * @param array $links Existing plugin action links.
	 *
	 * @return array
	 */
	public function plugin_action_links( $links ) {
		$license_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'admin.php?page=' . $this->page_slug ) ),
			__( 'Manage License', 'essential-addons-elementor' )
		);

		array_unshift( $links, $license_link );

		return $links;
	}

	/**
	 * Determines if a recent API request has failed.
	 *
	 * @return bool
	 */
	private function request_recently_failed() {
		$failed_request_details = get_option( $this->failed_request_cache_key );

		if ( empty( $failed_request_details ) || ! is_numeric( $failed_request_details ) ) {
			return false;
		}

		if ( time() > $failed_request_details ) {
			delete_option( $this->failed_request_cache_key );

			return false;
		}

		return true;
	}

	/**
	 * Logs a failed HTTP request. Prevents future requests for 1 hour.
	 *
	 * @return void
	 */
	private function log_failed_request() {
		update_option( $this->failed_request_cache_key, strtotime( '+1 hour' ), 'no' );
	}

	/**
	 * Clears the failed request flag after a successful response.
	 *
	 * @return void
	 */
	private function clear_failed_request() {
		delete_option( $this->failed_request_cache_key );
	}

	/**
	 * Allows outbound HTTP requests to the configured store host when dev_mode
	 * is active. Only the store's own hostname is allowed; all other hosts
	 * continue to be evaluated by WordPress's normal external-host policy.
	 *
	 * Hooked to 'http_request_host_is_external'.
	 *
	 * @param bool   $is_external Whether the host is considered external.
	 * @param string $host        The hostname being evaluated.
	 *
	 * @return bool
	 */
	public function allow_store_host( bool $is_external, string $host ): bool {
		$store_host = wp_parse_url( $this->storeURL, PHP_URL_HOST );

		if ( $store_host && $host === $store_host ) {
			return true;
		}

		return $is_external;
	}

	/**
	 * Schedules the weekly cron check if the weekly_check option is enabled.
	 *
	 * @return void
	 */
	private function maybe_schedule_cron() {
		$weekly_check = isset( $this->args['weekly_check'] ) ? $this->args['weekly_check'] : false;

		if ( $weekly_check ) {
			CronChecker::schedule( $this->db_prefix );
		}
	}

	/**
	 * Unschedules the weekly cron check if the weekly_check option is enabled.
	 *
	 * @return void
	 */
	private function maybe_unschedule_cron() {
		$weekly_check = isset( $this->args['weekly_check'] ) ? $this->args['weekly_check'] : false;

		if ( $weekly_check ) {
			CronChecker::unschedule( $this->db_prefix );
		}
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->get_license() instead.
	 *
	 * @param string $default
	 *
	 * @return string
	 */
	public function get_license( $default = '' ) {
		return $this->store->get_license( $default );
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->get_license_data() instead.
	 *
	 * @return mixed
	 */
	public function get_license_data_raw() {
		return $this->store->get_license_data();
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->set_license_data() instead.
	 *
	 * @param mixed    $response
	 * @param int|null $expiration
	 */
	public function set_license_data( $response, $expiration = null ) {
		$this->store->set_license_data( $response, $expiration );
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->delete_license_data() instead.
	 *
	 * @return bool
	 */
	public function remove_license_data() {
		return $this->store->delete_license_data();
	}

	/**
	 * Retrieves the stored error, clearing it if license data exists.
	 *
	 * @return array|string The error array, or empty string if no error.
	 */
	private function get_error() {
		if ( $this->license_data ) {
			$this->store->delete_error();

			return '';
		}

		return $this->store->get_error();
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->get_status() instead.
	 *
	 * @return string
	 */
	public function get_status() {
		return $this->store->get_status();
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->set_status() instead.
	 *
	 * @param string $status
	 *
	 * @return bool
	 */
	public function set_status( $status = 'valid' ) {
		return $this->store->set_status( $status );
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->purge_all() instead.
	 *
	 * @param bool $withError
	 */
	public function removeData( $withError = true ) {
		$this->store->purge_all( $withError );
	}

	/**
	 * @deprecated 2.0.0 Use get_store()->save_all() instead.
	 *
	 * @param object $response
	 */
	public function addData( $response ) {
		$this->store->save_all( $this->license, $response );
	}
}
