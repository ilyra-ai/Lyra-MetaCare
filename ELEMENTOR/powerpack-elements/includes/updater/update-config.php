<?php

use PowerpackElements\Classes\PP_Admin_Settings;

// this is the URL our updater / license checker pings. This should be the URL of the site with EDD installed
define( 'POWERPACK_SL_URL', 'https://powerpackelements.com' ); // you should use your own CONSTANT name, and be sure to replace it throughout this file

// the name of your product. This should match the download name in EDD exactly
define( 'POWERPACK_ITEM_NAME', 'PowerPack Pro for Elementor' ); // you should use your own CONSTANT name, and be sure to replace it throughout this file

define( 'POWERPACK_LICENSE_PAGE', PP_Admin_Settings::get_form_action( '&tab=general' ) );

if ( ! class_exists( 'PP_Plugin_Updater' ) ) {
	// load our custom updater
	include('class-pp-plugin-updater.php' );
}

function pp_elements_get( $key ) {
	if ( is_network_admin() ) {
		return get_site_option( $key );
	} else {
		return get_option( $key );
	}
}

function pp_elements_update( $key, $value ) {
	if ( is_network_admin() ) {
		return update_site_option( $key, $value );
	} else {
		return update_option( $key, $value );
	}
}

function pp_elements_delete( $key ) {
	if ( is_network_admin() ) {
		return delete_site_option( $key );
	} else {
		return delete_option( $key );
	}
}

function pp_elements_get_license_key() {
	if ( defined( 'PP_ELEMENTS_LICENSE_KEY' ) ) {
		return PP_ELEMENTS_LICENSE_KEY ? trim( PP_ELEMENTS_LICENSE_KEY ) : '';
	} else {
		return trim( pp_elements_get( 'pp_license_key' ) );
	}
}

function pp_elements_license( $action = '', $license_key = '' ) {
	$license = trim( $license_key );

	if ( empty( $license ) ) {
		$license = pp_elements_get_license_key();
	}

	// data to send in our API request
	$api_params = array(
		'edd_action'=> $action,
		'license' 	=> $license,
		'item_name' => urlencode( POWERPACK_ITEM_NAME ), // the name of our product in EDD
		'url'       => network_home_url(),
		'environment' => function_exists( 'wp_get_environment_type' ) ? wp_get_environment_type() : 'production',
	);

	// Call the custom API.
	$response = wp_remote_post(
		POWERPACK_SL_URL,
		array(
			'timeout' => 15,
			//'sslverify' => false,
			'body' => $api_params
		) );

	return $response;
}

/**
 * Initialize the updater. Hooked into `init` to work with the
 * wp_version_check cron job, which allows auto-updates.
 */
function pp_elements_plugin_updater() {

	// To support auto-updates, this needs to run during the wp_version_check cron job for privileged users.
	$doing_cron = defined( 'DOING_CRON' ) && DOING_CRON;
	if ( ! current_user_can( 'manage_options' ) && ! $doing_cron ) {
		return;
	}

	// retrieve our license key from the DB
	$license_key = pp_elements_get_license_key();

	// setup the updater
	$edd_updater = new PP_Plugin_Updater(
		POWERPACK_SL_URL,
		POWERPACK_ELEMENTS_PATH . '/powerpack-elements.php',
		array(
			'version' 	=> POWERPACK_ELEMENTS_VER, 					// current version number
			'license' 	=> $license_key, 						// license key (used pp_elements_get above to retrieve from DB)
			'item_name' => POWERPACK_ITEM_NAME, 			// name of this plugin
			'author' 	=> 'IdeaBox Creations' 	// author of this plugin
		)
	);

}
add_action( 'init', 'pp_elements_plugin_updater' );

/***********************************************
* Activate license key.
***********************************************/
function pp_elements_activate_license() {

	if ( ! isset( $_POST['pp_license_activate'] ) ) {
		return;
	}

	// run a quick security check
	if ( ! isset( $_POST['pp_elements_license_nonce'] ) || ! wp_verify_nonce( $_POST['pp_elements_license_nonce'], 'pp_elements_license_nonce' ) ) {
		return; // get out if we didn't click the Activate button
	}

	$license = '';

	if ( isset( $_POST['pp_license_key'] ) ) {
		$license = trim( $_POST['pp_license_key'] );
	} else {
		$license = pp_elements_get_license_key();
	}

	$response = pp_elements_license( 'activate_license', $license );

	// make sure the response came back okay
	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {

		if ( is_wp_error( $response ) ) {
			$message = $response->get_error_message();
		} else {
			$message = __( 'An error occurred, please try again.', 'powerpack' );
		}
	} else {
		// decode the license data
		$license_data = json_decode( wp_remote_retrieve_body( $response ) );

		if ( false === $license_data->success ) {
			$message = pp_elements_license_messages( $license_data->error );
		}
	}

	// Check if anything passed on a message constituting a failure
	if ( ! empty( $message ) ) {
		$base_url = POWERPACK_LICENSE_PAGE;
		$redirect = add_query_arg( array(
				'sl_activation' => 'false',
				'message' => urlencode( $message ),
		), $base_url );

		wp_redirect( $redirect );
		exit();
	}

	// $license_data->license will be either "valid" or "invalid"

	pp_elements_update( 'pp_license_status', $license_data->license );
	pp_elements_update( 'pp_license_user_action', 'activated' );

	wp_redirect( POWERPACK_LICENSE_PAGE );
	exit();
}
add_action( 'admin_init', 'pp_elements_activate_license' );

/***********************************************
* Deactivate license key.
***********************************************/
function pp_elements_deactivate_license() {

	// listen for our activate button to be clicked
	if ( isset( $_POST['pp_license_deactivate'] ) ) {

		// run a quick security check
		if ( ! isset( $_POST['pp_elements_license_nonce'] ) || ! wp_verify_nonce( $_POST['pp_elements_license_nonce'], 'pp_elements_license_nonce' ) ) {
			return; // get out if we didn't click the Activate button
		}

		$license = pp_elements_get_license_key();

		$response = pp_elements_license( 'deactivate_license', $license );

		// make sure the response came back okay
		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {

			if ( is_wp_error( $response ) ) {
				$message = $response->get_error_message();
			} else {
				$message = __( 'An error occurred, please try again.', 'powerpack' );
			}

			$redirect = add_query_arg( array(
				'sl_activation' => 'false',
				'message' => urlencode( $message ),
			), POWERPACK_LICENSE_PAGE );

			wp_redirect( $redirect );
			exit();
		}

		// decode the license data
		$license_data = json_decode( wp_remote_retrieve_body( $response ) );

		// $license_data->license will be either "deactivated" or "failed"
		if ( 'deactivated' === $license_data->license || 'failed' === $license_data->license ) {
			pp_elements_delete( 'pp_license_status' );
		}

		pp_elements_update( 'pp_license_user_action', 'deactivated' );

		$redirect = add_query_arg( array(
			'status' => $license_data->license,
		), POWERPACK_LICENSE_PAGE );

		wp_redirect( $redirect );
		exit();
	} // End if().
}
add_action( 'admin_init', 'pp_elements_deactivate_license' );

/************************************
* check if
* a license key is still valid
* so this is only needed if we
* want to do something custom
*************************************/

function pp_elements_check_license() {
	global $wp_version;

	$license = pp_elements_get_license_key();

	$api_params = array(
		'edd_action'  => 'check_license',
		'license' 	  => $license,
		'item_name'   => urlencode( POWERPACK_ITEM_NAME ),
		'url'         => network_home_url(),
		'environment' => function_exists( 'wp_get_environment_type' ) ? wp_get_environment_type() : 'production',
	);

	// Call the custom API.
	$response = wp_remote_post(
		POWERPACK_SL_URL,
		array(
			'timeout'   => 15,
			//'sslverify' => false,
			'body'      => $api_params,
		)
	);

	if ( is_wp_error( $response ) ) {
		return array(
			'message' => $response->get_error_message(),
		);
	}

	$license_data = json_decode( wp_remote_retrieve_body( $response ) );

	$license_action = pp_elements_get( 'pp_license_user_action' );

	if ( 'activated' !== $license_action && 'valid' === $license_data->license ) {
		$response = pp_elements_license( 'activate_license' );

		if ( 'valid' === $license_data->license ) {
			pp_elements_update( 'pp_license_status', $license_data->license );
			pp_elements_update( 'pp_license_user_action', 'activated' );
		}
	}
	if ( 'activated' === $license_action && 'valid' !== $license_data->license ) {
		pp_elements_delete( 'pp_license_status' );
		pp_elements_delete( 'pp_license_user_action' );
	}
	// Delete the license key if the site is inactive or deactivated from remote.
	if ( 'site_removed' === $license_data->license && ! isset( $_REQUEST['pp_license_key'] ) ) { 
		pp_elements_delete( 'pp_license_key' );
	}

	// if ( 'valid' === $license_data->license ) {
	// 	return 'valid';
	// 	// this license is still valid.
	// } elseif ( 'deactivated' !== $license_data->license ) {
	// 	// this license is no longer valid
	// 	// delete license status.
	// 	pp_elements_delete( 'pp_license_status' );

	// 	if ( in_array( $license_data->license, array( 'site_inactive' ) ) ) {
	// 		$response = pp_elements_license( 'activate_license' );

	// 		if ( ! is_wp_error( $response ) ) {
	// 			// decode the license data
	// 			$license_data = json_decode( wp_remote_retrieve_body( $response ) );

	// 			if ( 'valid' === $license_data->license ) {
	// 				pp_elements_update( 'pp_license_status', $license_data->license );
	// 			}
	// 		}
	// 	}
	// }

	return $license_data->license;
}

 /**
  * Show update message on plugins page
  */
function pp_elements_update_message( $plugin_data, $response ) {
	$status = pp_elements_check_license();

	if ( 'valid' != $status ) {

		if ( is_array( $status ) ) {
			$main_msg = $status['message'];
		} else {
			$main_msg = sprintf( __( 'Please activate the license to enable automatic updates for this plugin. License status: %s', 'powerpack' ), $status );
		}

		$message  = '';
		$message .= '<div style="padding: 5px 10px; margin-top: 10px; background: #d54e21; color: #fff; margin-bottom: 10px;">';
		$message .= __( '<strong>UPDATE UNAVAILABLE!</strong>', 'powerpack' );
		$message .= '&nbsp;&nbsp;&nbsp;';
		$message .= $main_msg;
		$message .= ' <a href="' . POWERPACK_SL_URL . '" target="_blank" style="color: #fff; text-decoration: underline;">';
		$message .= __( 'Buy Now', 'powerpack' );
		$message .= ' &raquo;</a>';
		$message .= '</div>';
		$message .= '<style>#pp-elements-update .notice p:empty {display:none;}</style>';

		echo $message;
	}
}
add_action( 'in_plugin_update_message-' . POWERPACK_ELEMENTS_BASE, 'pp_elements_update_message', 1, 2 );

function pp_elements_license_messages( $status ) {
	$message = '';

	switch ( $status ) {

		case 'expired' :

			$message = sprintf(
				__('Your license key expired on %s.', 'powerpack'),
				date_i18n(get_option('date_format'), strtotime($license_data->expires, current_time('timestamp')))
			);
			break;

		case 'revoked' :
		case 'disabled':

			$message = __('Your license key has been disabled.', 'powerpack');
			break;

		case 'missing' :
		case 'invalid' :

			$message = __('Invalid license.', 'powerpack');
			break;

		case 'site_inactive' :

			$message = __('Your license is not active for this URL.', 'powerpack');
			break;

		case 'item_name_mismatch' :

			$message = sprintf(__('This appears to be an invalid license key for %s.', 'powerpack'), POWERPACK_ITEM_NAME);
			break;

		case 'no_activations_left':

			$message = __('Your license key has reached its activation limit.', 'powerpack');
			break;

		default :
			// translators: %s for license status.
			$message = sprintf( __('An error occurred, please try again. Status: %s', 'powerpack'), $status );
			break;
	}

	return $message;
}
