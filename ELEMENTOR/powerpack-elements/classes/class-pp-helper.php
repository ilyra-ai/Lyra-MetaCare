<?php
namespace PowerpackElements\Classes;

use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Icons_Manager;
use PowerpackElements\Classes\PP_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class PP_Helper.
 */
class PP_Helper {

	/**
	 * Script debug
	 *
	 * @var script_debug
	 */
	private static $script_debug = null;

	/**
	 * Widgets List
	 *
	 * @var widgets_list
	 */
	private static $widgets_list = null;

	/**
	 * Widget Options
	 *
	 * @var widget_options
	 */
	private static $widget_options = null;

	/**
	 * A list of safe tage for `validate_html_tag` method.
	 */
	const ALLOWED_HTML_WRAPPER_TAGS = [
		'a',
		'article',
		'aside',
		'button',
		'div',
		'footer',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'header',
		'main',
		'nav',
		'p',
		'section',
		'span',
	];

	/**
	 * Convert Comma Separated List into Array
	 *
	 * @param string $list Comma separated list.
	 * @return array
	 * @since 1.4.13.2
	 */
	public static function comma_list_to_array( $list = '' ) {

		$list_array = explode( ',', $list );

		return $list_array;
	}

	/**
	 * Get widgets list.
	 *
	 * @since 2.3.0
	 * @return array()
	 */
	public static function get_widgets_list() {

		if ( ! isset( self::$widgets_list ) ) {
			self::$widgets_list = PP_Config::get_widget_info();
		}

		return apply_filters( 'ppe_widgets_list', self::$widgets_list );
	}

	/**
	 * Get Widget Name
	 *
	 * @param string $slug Module slug.
	 * @return string
	 * @since 1.4.13.1
	 */
	public static function get_widget_name( $slug = '' ) {

		self::$widgets_list = self::get_widgets_list();

		$widget_name = '';

		if ( isset( self::$widgets_list[ $slug ] ) ) {
			$widget_name = self::$widgets_list[ $slug ]['name'];
		}

		return apply_filters( 'pp_elements_widget_name', $widget_name );
	}

	/**
	 * Provide Widget Name
	 *
	 * @param string $slug Module slug.
	 * @return string
	 * @since 1.4.13.1
	 */
	public static function get_widget_title( $slug = '' ) {

		self::$widgets_list = self::get_widgets_list();

		$widget_name = '';

		if ( isset( self::$widgets_list[ $slug ] ) ) {
			$widget_name = self::$widgets_list[ $slug ]['title'];
		}

		return apply_filters( 'pp_elements_widget_title', $widget_name );
	}

	/**
	 * Provide Widget Name
	 *
	 * @param string $slug Module slug.
	 * @return string
	 * @since 1.4.13.1
	 */
	public static function get_widget_categories( $slug = '' ) {

		self::$widgets_list = self::get_widgets_list();

		$widget_categories = '';

		if ( isset( self::$widgets_list[ $slug ] ) ) {
			$widget_categories = self::$widgets_list[ $slug ]['categories'];
		}

		return apply_filters( 'pp_elements_widget_categories', $widget_categories );
	}

	/**
	 * Provide Widget Name
	 *
	 * @param string $slug Module slug.
	 * @return string
	 * @since 1.4.13.1
	 */
	public static function get_widget_icon( $slug = '' ) {

		self::$widgets_list = self::get_widgets_list();

		$widget_icon = '';

		if ( isset( self::$widgets_list[ $slug ] ) ) {
			$widget_icon = self::$widgets_list[ $slug ]['icon'];
		}

		return apply_filters( 'pp_elements_widget_icon', $widget_icon );
	}

	/**
	 * Provide Widget Name
	 *
	 * @param string $slug Module slug.
	 * @return string
	 * @since 1.4.13.1
	 */
	public static function get_widget_keywords( $slug = '' ) {

		self::$widgets_list = self::get_widgets_list();

		$widget_keywords = '';

		if ( isset( self::$widgets_list[ $slug ] ) ) {
			$widget_keywords = self::$widgets_list[ $slug ]['keywords'];
		}

		return apply_filters( 'pp_elements_widget_keywords', $widget_keywords );
	}

	/**
	 * Get widget styles.
	 *
	 * @since 1.5.0
	 * @return array
	 */
	public static function get_widget_style() {

		return PP_Config::get_widget_style();
	}

	/**
	 * Get Widget Options.
	 *
	 * @since 2.3.0
	 * @return array()
	 */
	public static function get_widget_options() {
		if ( null === self::$widget_options ) {
			if ( ! isset( self::$widgets_list ) ) {
				$widgets = self::get_widgets_list();
			} else {
				$widgets = self::$widgets_list;
			}

			$saved_widgets = pp_get_enabled_modules();

			if ( is_array( $widgets ) ) {

				foreach ( $widgets as $slug => $data ) {

					if ( is_array( $saved_widgets ) && in_array( $data['name'], $saved_widgets, true ) ) {
						$widgets[ $slug ]['is_activate'] = true;
					} else {
						$widgets[ $slug ]['is_activate'] = false;
					}
				}
			}

			self::$widget_options = $widgets;
		}

		return apply_filters( 'ppe_enabled_widgets', self::$widget_options );
	}

	/**
	 * Check if widget is active.
	 *
	 * @param string $slug Module slug.
	 * @return boolean
	 * @since 2.3.0
	 */
	public static function is_widget_active( $slug = '' ) {
		$widgets     = self::get_widget_options();
		$is_activate = false;

		if ( isset( $widgets[ $slug ] ) ) {
			$is_activate = $widgets[ $slug ]['is_activate'];
		}

		return $is_activate;
	}

	/**
	 * Elementor
	 *
	 * Retrieves the elementor plugin instance
	 *
	 * @since  1.4.13.2
	 * @return \Elementor\Plugin|$instace
	 */
	public static function elementor() {
		return \Elementor\Plugin::$instance;
	}

	/**
	 * Check if Elementor experimental feature is active.
	 *
	 * @param string $feature Feature slug.
	 * @return boolean
	 * @since 2.10.22
	 */
	public static function is_feature_active( $feature = '' ) {
		$is_active = false;

		if ( '' !== $feature && self::elementor()->experiments->is_feature_active( $feature ) ) {
			$is_active = true;
		}

		return $is_active;
	}

	/**
	 * Check if Elementor edit mode is active.
	 *
	 * Used to determine whether we are in the edit mode.
	 *
	 * @since 2.10.22
	 * @access public
	 *
	 * @param int $post_id Optional. Post ID. Default is `null`, the current post ID.
	 *
	 * @return bool Whether the edit mode is active.
	 */
	public static function is_edit_mode( $post_id = null ) {
		if ( self::elementor()->editor->is_edit_mode( $post_id ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if Elementor preview mode is active.
	 *
	 * Used to determine whether we are in the preview mode (iframe).
	 *
	 * @since 2.10.22
	 * @access public
	 *
	 * @param int $post_id Optional. Post ID. Default is `null`, the current post ID.
	 *
	 * @return bool Whether the edit mode is active.
	 */
	public static function is_preview_mode( $post_id = 0 ) {
		if ( self::elementor()->preview->is_preview_mode( $post_id ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if script debug is enabled.
	 *
	 * @since 1.5.0
	 *
	 * @return string The CSS suffix.
	 */
	public static function is_script_debug() {
		if ( null === self::$script_debug ) {

			self::$script_debug = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG;
		}

		return self::$script_debug;
	}

	/**
	 * Get Google Map Languages
	 *
	 * @since 1.4.11.2
	 * @access public
	 */
	public static function get_google_map_languages() {

		$languages = array(
			'af'     => __( 'AFRIKAAN', 'powerpack' ),
			'sq'     => __( 'ALBANIAN', 'powerpack' ),
			'am'     => __( 'AMHARIC', 'powerpack' ),
			'ar'     => __( 'ARABIC', 'powerpack' ),
			'hy'     => __( 'ARMENIAN', 'powerpack' ),
			'az'     => __( 'AZERBAIJANI', 'powerpack' ),
			'eu'     => __( 'BASQUE', 'powerpack' ),
			'be'     => __( 'BELARUSIAN', 'powerpack' ),
			'bn'     => __( 'BENGALI', 'powerpack' ),
			'bs'     => __( 'BOSNIAN', 'powerpack' ),
			'bg'     => __( 'BULGARIAN', 'powerpack' ),
			'my'     => __( 'BURMESE', 'powerpack' ),
			'ca'     => __( 'CATALAN', 'powerpack' ),
			'zh'     => __( 'CHINESE', 'powerpack' ),
			'zh-CN'  => __( 'CHINESE (SIMPLIFIED)', 'powerpack' ),
			'zh-HK'  => __( 'CHINESE (HONG KONG)', 'powerpack' ),
			'zh-TW'  => __( 'CHINESE (TRADITIONAL)', 'powerpack' ),
			'hr'     => __( 'CROATIAN', 'powerpack' ),
			'cs'     => __( 'CZECH', 'powerpack' ),
			'da'     => __( 'DANISH', 'powerpack' ),
			'nl'     => __( 'DUTCH', 'powerpack' ),
			'en'     => __( 'ENGLISH', 'powerpack' ),
			'en-AU'  => __( 'ENGLISH (AUSTRALIAN)', 'powerpack' ),
			'en-GB'  => __( 'ENGLISH (GREAT BRITAIN)', 'powerpack' ),
			'et'     => __( 'ESTONIAN', 'powerpack' ),
			'fa'     => __( 'FARSI', 'powerpack' ),
			'fi'     => __( 'FINNISH', 'powerpack' ),
			'fil'    => __( 'FILIPINO', 'powerpack' ),
			'fr'     => __( 'FRENCH', 'powerpack' ),
			'fr-CA'  => __( 'FRENCH (CANADA)', 'powerpack' ),
			'gl'     => __( 'GALICIAN', 'powerpack' ),
			'ka'     => __( 'GEORGIAN', 'powerpack' ),
			'de'     => __( 'GERMAN', 'powerpack' ),
			'el'     => __( 'GREEK', 'powerpack' ),
			'gu'     => __( 'GUJARATI', 'powerpack' ),
			'iw'     => __( 'HEBREW', 'powerpack' ),
			'hi'     => __( 'HINDI', 'powerpack' ),
			'hu'     => __( 'HUNGARIAN', 'powerpack' ),
			'is'     => __( 'ICELANDIC', 'powerpack' ),
			'id'     => __( 'INDONESIAN', 'powerpack' ),
			'it'     => __( 'ITALIAN', 'powerpack' ),
			'ja'     => __( 'JAPANESE', 'powerpack' ),
			'kn'     => __( 'KANNADA', 'powerpack' ),
			'kk'     => __( 'KAZAKH', 'powerpack' ),
			'km'     => __( 'KHMER', 'powerpack' ),
			'ko'     => __( 'KOREAN', 'powerpack' ),
			'ky'     => __( 'KYRGYZ', 'powerpack' ),
			'lo'     => __( 'LAO', 'powerpack' ),
			'lv'     => __( 'LATVIAN', 'powerpack' ),
			'lt'     => __( 'LITHUANIAN', 'powerpack' ),
			'mk'     => __( 'MACEDONIAN', 'powerpack' ),
			'ms'     => __( 'MALAY', 'powerpack' ),
			'ml'     => __( 'MALAYALAM', 'powerpack' ),
			'mr'     => __( 'MARATHI', 'powerpack' ),
			'mn'     => __( 'MONGOLIAN', 'powerpack' ),
			'ne'     => __( 'NEPALI', 'powerpack' ),
			'no'     => __( 'NORWEGIAN', 'powerpack' ),
			'pl'     => __( 'POLISH', 'powerpack' ),
			'pt'     => __( 'PORTUGUESE', 'powerpack' ),
			'pt-BR'  => __( 'PORTUGUESE (BRAZIL)', 'powerpack' ),
			'pt-PT'  => __( 'PORTUGUESE (PORTUGAL)', 'powerpack' ),
			'pa'     => __( 'PUNJABI', 'powerpack' ),
			'ro'     => __( 'ROMANIAN', 'powerpack' ),
			'ru'     => __( 'RUSSIAN', 'powerpack' ),
			'sr'     => __( 'SERBIAN', 'powerpack' ),
			'si'     => __( 'SINHALESE', 'powerpack' ),
			'sk'     => __( 'SLOVAK', 'powerpack' ),
			'sl'     => __( 'SLOVENIAN', 'powerpack' ),
			'es'     => __( 'SPANISH', 'powerpack' ),
			'es-419' => __( 'SPANISH (LATIN AMERICA)', 'powerpack' ),
			'sw'     => __( 'SWAHILI', 'powerpack' ),
			'sv'     => __( 'SWEDISH', 'powerpack' ),
			'ta'     => __( 'TAMIL', 'powerpack' ),
			'te'     => __( 'TELUGU', 'powerpack' ),
			'th'     => __( 'THAI', 'powerpack' ),
			'tr'     => __( 'TURKISH', 'powerpack' ),
			'uk'     => __( 'UKRAINIAN', 'powerpack' ),
			'ur'     => __( 'URDU', 'powerpack' ),
			'uz'     => __( 'UZBEK', 'powerpack' ),
			'vi'     => __( 'VIETNAMESE', 'powerpack' ),
			'zu'     => __( 'ZULU', 'powerpack' ),
		);

		return $languages;
	}

	public static function get_recaptcha_desc() {
		// translators: %s: Integration Setting Page link
		return sprintf( __( 'To use reCAPTCHA, you need to add the API keys in the <a href="%s" target="_blank">Integrations Settings</a> and complete the setup process.', 'powerpack' ), \PowerpackElements\Classes\PP_Admin_Settings::get_form_action( '&tab=integration' ) );
	}

	/**
	 * Get contact forms of supported forms plugins
	 *
	 * @since 1.4.14.1
	 * @access public
	 */
	public static function get_contact_forms( $plugin = '' ) {
		$options       = array();
		$contact_forms = array();

		// Contact Form 7
		if ( 'Contact_Form_7' == $plugin && function_exists( 'wpcf7' ) ) {
			$args = array(
				'post_type'      => 'wpcf7_contact_form',
				'posts_per_page' => -1,
			);

			$cf7_forms = get_posts( $args );

			if ( ! empty( $cf7_forms ) && ! is_wp_error( $cf7_forms ) ) {
				foreach ( $cf7_forms as $form ) {
					$contact_forms[ $form->ID ] = $form->post_title;
				}
			}
		}

		// Fluent Forms
		if ( 'Fluent_Forms' == $plugin && function_exists( 'wpFluentForm' ) ) {
			global $wpdb;

			$fluent_forms = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}fluentform_forms" );

			if ( $fluent_forms ) {
				foreach ( $fluent_forms as $form ) {
					$contact_forms[ $form->id ] = $form->title;
				}
			}
		}

		// Formidable Forms
		if ( 'Formidable_Forms' == $plugin && class_exists( 'FrmForm' ) ) {
			$formidable_forms = \FrmForm::get_published_forms( array(), 999, 'exclude' );
			if ( count( $formidable_forms ) ) {
				foreach ( $formidable_forms as $form ) {
					$contact_forms[ $form->id ] = $form->name;
				}
			}
		}

		// Gravity Forms
		if ( 'Gravity_Forms' == $plugin && class_exists( 'GFForms' ) ) {
			$gravity_forms = \RGFormsModel::get_forms( null, 'title' );

			if ( ! empty( $gravity_forms ) && ! is_wp_error( $gravity_forms ) ) {
				foreach ( $gravity_forms as $form ) {
					$contact_forms[ $form->id ] = $form->title;
				}
			}
		}

		// Ninja Forms
		if ( 'Ninja_Forms' == $plugin && class_exists( 'Ninja_Forms' ) ) {
			$ninja_forms = Ninja_Forms()->form()->get_forms();

			if ( ! empty( $ninja_forms ) && ! is_wp_error( $ninja_forms ) ) {
				foreach ( $ninja_forms as $form ) {
					$contact_forms[ $form->get_id() ] = $form->get_setting( 'title' );
				}
			}
		}

		// WPforms
		if ( 'WP_Forms' == $plugin && function_exists( 'wpforms' ) ) {
			$args = array(
				'post_type'      => 'wpforms',
				'posts_per_page' => -1,
			);

			$wpf_forms = get_posts( $args );

			if ( ! empty( $wpf_forms ) && ! is_wp_error( $wpf_forms ) ) {
				foreach ( $wpf_forms as $form ) {
					$contact_forms[ $form->ID ] = $form->post_title;
				}
			}
		}

		// Contact Forms List
		if ( ! empty( $contact_forms ) ) {
			$options[0] = esc_html__( 'Select a Contact Form', 'powerpack' );
			foreach ( $contact_forms as $form_id => $form_title ) {
				$options[ $form_id ] = $form_title;
			}
		}

		if ( empty( $options ) ) {
			$options[0] = esc_html__( 'No contact forms found!', 'powerpack' );
		}

		return $options;
	}

	/**
	 * Build the URL of Facebook SDK.
	 *
	 * @since 1.5.0
	 * @return string
	 */
	public static function get_fb_sdk_url( $app_id = '' ) {
		$fb_app_id = \PowerpackElements\Classes\PP_Admin_Settings::get_option( 'pp_fb_app_id' );

		$app_id = empty( $app_id ) ? $fb_app_id : $app_id;

		if ( $app_id && ! empty( $app_id ) ) {
			return sprintf( 'https://connect.facebook.net/%s/sdk.js#xfbml=1&version=v2.12&appId=%s', get_locale(), $app_id );
		}

		return sprintf( 'https://connect.facebook.net/%s/sdk.js#xfbml=1&version=v2.12', get_locale() );
	}

	/**
	 * Get Facebook app settings url
	 *
	 * @since 1.5.0
	 * @return string
	 */
	public static function get_fb_app_settings_url() {
		$app_id = \PowerpackElements\Classes\PP_Admin_Settings::get_option( 'pp_fb_app_id' );

		if ( $app_id ) {
			return sprintf( 'https://developers.facebook.com/apps/%d/settings/', $app_id );
		} else {
			return 'https://developers.facebook.com/apps/';
		}
	}

	/**
	 * Returns user agent.
	 *
	 * @since 1.5.0
	 * @return string
	 */
	public static function get_user_agent() {
		$user_agent = $_SERVER['HTTP_USER_AGENT'];

		if ( false !== stripos( $user_agent, 'Chrome' ) ) {
			return 'chrome';
		} elseif ( false !== stripos( $user_agent, 'Safari' ) ) {
			return 'safari';
		} elseif ( false !== stripos( $user_agent, 'Firefox' ) ) {
			return 'firefox';
		} elseif ( false !== stripos( $user_agent, 'MSIE' ) ) {
			return 'ie';
		} elseif ( false !== stripos( $user_agent, 'Trident/7.0; rv:11.0' ) ) {
			return 'ie';
		}

		return;
	}

	/**
	 * Get Client IP address
	 *
	 * @since 1.5.0
	 * @return string
	 */
	public static function get_client_ip() {
		$keys = array(
			'HTTP_CLIENT_IP',
			'HTTP_X_FORWARDED_FOR',
			'HTTP_X_FORWARDED',
			'HTTP_X_CLUSTER_CLIENT_IP',
			'HTTP_FORWARDED_FOR',
			'HTTP_FORWARDED',
			'REMOTE_ADDR',
		);

		foreach ( $keys as $key ) {
			if ( isset( $_SERVER[ $key ] ) && filter_var( $_SERVER[ $key ], FILTER_VALIDATE_IP ) ) {
				return $_SERVER[ $key ];
			}
		}

		// fallback IP address.
		return '127.0.0.1';
	}

	/**
	 * Compare conditions.
	 *
	 * Whether the two values comply the comparison operator.
	 *
	 * @since 2.10.0
	 * @access public
	 * @static
	 *
	 * @param mixed  $left_value  First value to compare.
	 * @param mixed  $right_value Second value to compare.
	 * @param string $operator    Comparison operator.
	 *
	 * @return bool Whether the two values complies the comparison operator.
	 */
	public static function compare( $left_value, $right_value, $operator ) {
		switch ( $operator ) {
			case '==':
				return $left_value == $right_value;
			case '!=':
				return $left_value != $right_value;
			case '!==':
				return $left_value !== $right_value;
			case 'in':
				return in_array( $left_value, $right_value, true );
			case '!in':
				return ! in_array( $left_value, $right_value, true );
			case 'contains':
				return in_array( $right_value, $left_value, true );
			case '!contains':
				return ! in_array( $right_value, $left_value, true );
			case '<':
				return $left_value < $right_value;
			case '<=':
				return $left_value <= $right_value;
			case '>':
				return $left_value > $right_value;
			case '>=':
				return $left_value >= $right_value;
			default:
				return $left_value === $right_value;
		}
	}

	/**
	 * Validate an HTML tag against a safe allowed list.
	 *
	 * @since 2.3.2
	 * @param string $tag specifies the HTML Tag.
	 * @access public
	 * @return string
	 */
	public static function validate_html_tag( $tag ) {
		// Check if Elementor method exists, else we will run custom validation code.
		if ( method_exists( 'Elementor\Utils', 'validate_html_tag' ) ) {
			return Utils::validate_html_tag( $tag );
		} else {
			return in_array( strtolower( $tag ), self::ALLOWED_HTML_WRAPPER_TAGS, true ) ? $tag : 'div';
		}
	}

	/**
	 * Safe print a validated HTML tag.
	 *
	 * @since 2.9.19
	 * @param string $tag
	 */
	public static function print_validated_html_tag( $tag ) {
		// PHPCS - the method validate_html_tag is safe.
		echo self::validate_html_tag( $tag ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	public static function is_tribe_events_post( $post_id ) {
		return ( class_exists( 'Tribe__Events__Main' ) && 'tribe_events' === get_post_type( $post_id ) );
	}

	public static function render_arrows( $widget ) {
		$settings = $widget->get_settings_for_display();

		$migration_allowed = Icons_Manager::is_migration_allowed();

		if ( ! isset( $settings['arrow'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default.
			$settings['arrow'] = 'fa fa-angle-right';
		}

		$has_icon = ! empty( $settings['arrow'] );

		if ( ! $has_icon && ! empty( $settings['select_arrow']['value'] ) ) {
			$has_icon = true;
		}

		if ( ! empty( $settings['arrow'] ) ) {
			$widget->add_render_attribute( 'arrow-icon', 'class', $settings['arrow'] );
			$widget->add_render_attribute( 'arrow-icon', 'aria-hidden', 'true' );
		}

		$migrated = isset( $settings['__fa4_migrated']['select_arrow'] );
		$is_new = ! isset( $settings['arrow'] ) && $migration_allowed;

		if ( 'yes' === $settings['arrows'] ) {
			if ( $has_icon ) {
				if ( $is_new || $migrated ) {
					$next_arrow = $settings['select_arrow'];
					$prev_arrow = str_replace( 'right', 'left', $settings['select_arrow'] );
				} else {
					$next_arrow = $settings['arrow'];
					$prev_arrow = str_replace( 'right', 'left', $settings['arrow'] );
				}
			} else {
				$next_arrow = 'fa fa-angle-right';
				$prev_arrow = 'fa fa-angle-left';
			}

			if ( ! empty( $settings['arrow'] ) || ( ! empty( $settings['select_arrow']['value'] ) && $is_new ) ) { ?>
				<div class="pp-slider-arrow elementor-swiper-button-prev swiper-button-prev-<?php echo esc_attr( $widget->get_id() ); ?>" role="button" tabindex="0">
					<?php if ( $is_new || $migrated ) :
						Icons_Manager::render_icon( $prev_arrow, [ 'aria-hidden' => 'true' ] );
					else : ?>
						<i <?php $widget->print_render_attribute_string( 'arrow-icon' ); ?>></i>
					<?php endif; ?>
				</div>
				<div class="pp-slider-arrow elementor-swiper-button-next swiper-button-next-<?php echo esc_attr( $widget->get_id() ); ?>" role="button" tabindex="0">
					<?php if ( $is_new || $migrated ) :
						Icons_Manager::render_icon( $next_arrow, [ 'aria-hidden' => 'true' ] );
					else : ?>
						<i <?php $widget->print_render_attribute_string( 'arrow-icon' ); ?>></i>
					<?php endif; ?>
				</div>
			<?php }
		}
	}

	/**
	 * Provide Widget Name
	 *
	 * @param string $slug Module slug.
	 * @return string
	 * @since 2.9.0
	 */
	public static function get_widget_presets( $slug = '' ) {
		self::$widgets_list = self::get_widgets_list();

		$widget_preset = '';

		if ( isset( self::$widgets_list[ $slug ] ) ) {
			$widget_preset = self::$widgets_list[ $slug ]['preset'];
		}

		return apply_filters( 'pp_widget_preset', $widget_preset );
	}

	/**
	 * Outputs the JSON schema markup.
	 *
	 * @since 2.12.4
	 * @param array $schema_data The schema data to be encoded and printed.
	 */
	public static function print_json_schema( $schema_data ) {
		if ( empty( $schema_data ) ) {
			return;
		}

		$encoded_data  = wp_json_encode( $schema_data, self::is_script_debug() ? JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES : JSON_UNESCAPED_SLASHES );

		echo '<script type="application/ld+json">' . $encoded_data . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Retrieves the type of the widget.
	 *
	 * This function determines the type of the widget by checking if the widget type is explicitly defined.
	 * If not defined, it defaults to the element type. Additionally, if the widget is a global widget,
	 * it retrieves the global widget type based on the template ID.
	 *
	 * @since 2.12.4
	 * @param array $element The element array containing widget details.
	 * @return string The type of the widget.
	 */
	public static function get_widget_type( $element ) {
		// Check if 'widgetType' is defined in the element array, otherwise use 'elType'.
		if ( empty( $element['widgetType'] ) ) {
			$type = $element['elType'];
		} else {
			$type = $element['widgetType'];
		}

		// If the widget type is 'global' and a template ID is provided, fetch the global widget type.
		if ( 'global' === $type && ! empty( $element['templateID'] ) ) {
			$type = self::get_global_widget_type( $element['templateID'] );
		}

		return $type;
	}

	/**
	* Retrieves the type of a global widget.
	*
	* This function fetches template data from a local source using the template ID.
	* It returns either the original widget type or an empty string if no type could be retrieved
	* or if the template data contains an error or lacks content.
	*
	* @since 2.12.4
	* @param int $template_id The ID of the template.
	* @param bool $return_type Whether to return the widget type object or just the type name.
	* @return mixed The original widget type or an empty string if not found.
	*/
	public static function get_global_widget_type( $template_id, $return_type = false ) {
		// Fetch template data using the template ID.
		$template_data = self::elementor()->templates_manager->get_template_data( [
			'source'      => 'local',
			'template_id' => $template_id,
		] );

		// If retrieving the template data results in an error, return an empty string.
		if ( is_wp_error( $template_data ) ) {
			return '';
		}

		// If the template data is empty, return an empty string.
		if ( empty( $template_data['content'] ) ) {
			return '';
		}

		// Retrieve the original widget type using the widget type of the first element in the template content.
		$original_widget_type = self::elementor()->widgets_manager->get_widget_types( $template_data['content'][0]['widgetType'] );

		// Return either the widget type object or just the widget type name, depending on $return_type.
		if ( $return_type ) {
			return $original_widget_type;
		}

		return $original_widget_type ? $template_data['content'][0]['widgetType'] : '';
	}
}
