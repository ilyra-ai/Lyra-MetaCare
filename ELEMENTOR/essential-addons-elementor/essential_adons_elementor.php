<?php
/**
 * Plugin Name: Essential Addons for Elementor - Pro
 * Description: Supercharge your Elementor page building experience with Essential Addons PRO. Get your hands on exclusive elements such as Instagram Feed, Protected Content, Smart Post List, and many more.
 * Plugin URI: https://essential-addons.com/
 * Author: WPDeveloper
 * Version: 6.7.11
 * Author URI: https://www.wpdeveloper.com
 * Text Domain: essential-addons-elementor
 * Domain Path: /languages
 *
 * WC tested up to: 10.0
 * Elementor tested up to: 3.35
 * Elementor Pro tested up to: 3.35
 */

if ( ! defined( 'WPINC' ) ) {
    exit;
}

/**
 * Defining plugin constants.
 *
 * @since 3.0.0
 */
define('EAEL_PRO_PLUGIN_FILE', __FILE__);
define('EAEL_PRO_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('EAEL_PRO_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('EAEL_PRO_PLUGIN_URL', plugins_url('/', __FILE__));
define('EAEL_PRO_PLUGIN_VERSION', '6.7.11');
define('EAEL_STORE_URL', 'https://api.wpdeveloper.com/');
define('EAEL_SL_ITEM_ID', 4372);
define('EAEL_SL_ITEM_SLUG', 'essential-addons-elementor');
define('EAEL_SL_ITEM_NAME', 'Essential Addons for Elementor');

if (!function_exists('eael_bypass_license_check')) {
    add_action('plugins_loaded', 'eael_bypass_license_check');
    function eael_bypass_license_check()
    {
        add_filter('pre_option_essential-addons-elementor-license-key', function () {
            return 'bypassed_license_key_123';
        });
        add_filter('pre_option_essential-addons-elementor-license-status', function () {
            return 'valid';
        });
        $mock_license_data = (object) [
            'success' => true,
            'license' => 'valid',
            'item_name' => 'Essential Addons for Elementor',
            'item_id' => 4372,
            'expires' => '2099-12-31 23:59:59',
            'payment_id' => 999999,
            'customer_name' => 'Bypassed User',
            'customer_email' => 'bypass@example.com',
            'price_id' => '1',
            'checksum' => 'valid_checksum'
        ];

        add_filter('pre_transient_essential-addons-elementor-license_data', function () use ($mock_license_data) {
            return $mock_license_data;
        });
        if (get_option('essential-addons-elementor-license-status') !== 'valid') {
            update_option('essential-addons-elementor-license-status', 'valid', 'no');
            update_option('essential-addons-elementor-license-key', 'bypassed_license_key_123', 'no');
        }
    }
}

add_filter('pre_http_request', 'eael_block_licensing_requests', 10, 3);
function eael_block_licensing_requests($pre, $args, $url)
{
    if (strpos($url, 'api.wpdeveloper.com') !== false) {
        if (strpos($url, 'check_license') !== false || strpos($url, 'activate_license') !== false) {
            return [
                'response' => ['code' => 200, 'message' => 'OK'],
                'body' => json_encode([
                    'success' => true,
                    'license' => 'valid',
                    'expires' => '2099-12-31 23:59:59',
                    'checksum' => 'valid_checksum'
                ])
            ];
        }
        if (strpos($url, 'get_version') !== false) {
            return [
                'response' => ['code' => 200, 'message' => 'OK'],
                'body' => json_encode([
                    'new_version' => '',
                    'sections' => [],
                ])
            ];
        }
        return new \WP_Error('http_request_failed', 'Blocked by License Bypass');
    }
    return $pre;
}

/**
 * Including autoloader.
 *
 * @since 3.0.0
 */
require_once EAEL_PRO_PLUGIN_PATH . 'autoload.php';

/**
 * Run plugin before lite version
 *
 * @since 3.0.0
 */
add_action( 'eael/before_init', function () {
    // compatibility with lite
    if ( version_compare( EAEL_PLUGIN_VERSION, '4.6.3', '<=' ) ) {
        return;
    }

    /**
     * Including plugin config.
     *
     * @since 3.0.0
     */
    $GLOBALS[ 'eael_pro_config' ] = require_once EAEL_PRO_PLUGIN_PATH . 'config.php';

    if ( class_exists( '\Essential_Addons_Elementor\Pro\Classes\Bootstrap' ) ) {
        \Essential_Addons_Elementor\Pro\Classes\Bootstrap::instance();
    }
} );

/**
 * Plugin migrator
 *
 * @since v3.0.0
 */
add_action( 'wp_loaded', function () {
    $migration = new \Essential_Addons_Elementor\Pro\Classes\Migration;
    $migration->migrator();
} );

/**
 * Activation hook
 *
 * @since v3.0.0
 */
register_activation_hook( __FILE__, function () {
    $migration = new \Essential_Addons_Elementor\Pro\Classes\Migration;
    $migration->plugin_activation_hook();
} );

/**
 * Deactivation hook
 *
 * @since v3.0.0
 */
register_deactivation_hook( __FILE__, function () {
    $migration = new \Essential_Addons_Elementor\Pro\Classes\Migration;
    $migration->plugin_deactivation_hook();
    delete_option( '_eael_initial_sync' );
    wp_clear_scheduled_hook( 'eael_sync_initial_orders' );
    wp_clear_scheduled_hook( 'eael_sync_daily_orders' );
} );

/**
 * Upgrade hook
 *
 * @since v3.0.0
 */
add_action( 'upgrader_process_complete', function ( $upgrader_object, $options ) {
    $migration = new \Essential_Addons_Elementor\Pro\Classes\Migration;
    $migration->plugin_upgrade_hook( $upgrader_object, $options );
}, 10, 2 );

/**
 * Admin Notices
 *
 * @since v3.0.0
 */
add_action( 'admin_notices', function () {
    $notice = new \Essential_Addons_Elementor\Pro\Classes\Notice;
    $notice->failed_to_load();
} );

/**
 * WooCommerce HPOS Support
 *
 * @since v5.4.13
 */
add_action( 'before_woocommerce_init', function () {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
    }
} );

add_action( 'admin_init', function () {
    // Register Figma Image Handler
    $figmaHandler = new \Essential_Addons_Elementor\Pro\Classes\FigmaImageHandler();
    $figmaHandler->register();
} );