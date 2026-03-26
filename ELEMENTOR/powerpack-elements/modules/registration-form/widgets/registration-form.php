<?php
/**
 * PowerPack Registration Form
 *
 * @package PowerPack Elements
 */

namespace PowerpackElements\Modules\RegistrationForm\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Admin_Settings;

// Elementor Classes.
use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Icons_Manager;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registration Form Widget
 */
class Registration_Form extends Powerpack_Widget {
	/**
	 * Holds directory path of fields.
	 *
	 * @since 1.5.0
	 * @var string $fields_dir
	 */
	public $fields_dir = POWERPACK_ELEMENTS_PATH . 'modules/registration-form/fields/';

	/**
	 * Holds site information like admin email, site title.
	 *
	 * @since 1.5.0
	 * @var array $site_info
	 */
	public static $site_info = array();

	/**
	 * Holds minimum length of password for the password field.
	 *
	 * @since 1.5.0
	 * @var int $password_length
	 */
	public $password_length = 8;

	/**
	 * Retrieve registration form widget name.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Registration_Form' );
	}

	/**
	 * Retrieve registration form widget title.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Registration_Form' );
	}

	/**
	 * Retrieve registration form widget icon.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Registration_Form' );
	}

	/**
	 * Retrieve registration form widget keywords.
	 *
	 * @return array List of keywords
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Registration_Form' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the registration form widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return array(
				'pp-google-recaptcha',
				'password-strength-meter',
				'pp-registration-form',
			);
		}

		$settings = $this->get_settings_for_display();
		$scripts = [];

		if ( 'yes' === $settings['enable_recaptcha'] ) {
			array_push( $scripts, 'pp-google-recaptcha' );
		}

		if ( 'yes' === $settings['enable_pws_meter'] ) {
			array_push( $scripts, 'password-strength-meter' );
		}

		array_push( $scripts, 'pp-registration-form' );

		return $scripts;
	}

	/**
	 * Retrieve the list of styles the offcanvas content widget depended on.
	 *
	 * Used to set styles dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget styles dependencies.
	 */
	public function get_style_depends() {
		return [
			'widget-pp-registration-form'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Get array of fields type.
	 *
	 * @since 1.5.0
	 * @access protected
	 * @return array fields.
	 */
	protected function get_field_type() {
		$fields = array(
			'user_login'        => esc_html__( 'Username', 'powerpack' ),
			'user_pass'         => esc_html__( 'Password', 'powerpack' ),
			'confirm_user_pass' => esc_html__( 'Confirm Password', 'powerpack' ),
			'user_email'        => esc_html__( 'Email', 'powerpack' ),
			'phone'             => esc_html__( 'Phone', 'powerpack' ),
			'first_name'        => esc_html__( 'First Name', 'powerpack' ),
			'last_name'         => esc_html__( 'Last Name', 'powerpack' ),
			'user_url'          => esc_html__( 'Website', 'powerpack' ),
			'consent'           => esc_html__( 'Consent', 'powerpack' ),
			'static_text'       => esc_html__( 'Static Text', 'powerpack' ),
		);

		$fields = apply_filters( 'pp_registration_form_fields', $fields );

		return $fields;
	}

	/**
	 * Retrieve WP user roles.
	 *
	 * @since 1.5.0
	 *
	 * @global object $wp_roles
	 * @return array
	 */
	public static function get_user_roles() {
		$is_editor = \Elementor\Plugin::instance()->editor->is_edit_mode();
		if ( $is_editor ) {
			return array();
		}

		global $wp_roles;

		$_wp_roles = $wp_roles;

		if ( ! isset( $wp_roles ) || empty( $_wp_roles ) ) {
			$_wp_roles = get_editable_roles();
		}

		$roles      = isset( $_wp_roles->roles ) ? $_wp_roles->roles : array();
		$user_roles = array(
			'' => esc_html__( 'Default', 'powerpack' ),
		);

		unset( $roles['administrator'] );

		foreach ( $roles as $role_key => $role ) {
			$user_roles[ $role_key ] = $role['name'];
		}

		/**
		 * Filters the user roles.
		 *
		 * @since 1.5.0
		 * @param array $user   An array of user roles.
		 */
		return apply_filters( 'pp_registration_form_user_roles', $user_roles );
	}

	/**
	 * Get site information.
	 *
	 * @since 1.5.0
	 *
	 * @param string|bool $prop Optional. Property to retrieve.
	 * @return string|array
	 */
	public static function get_site_info( $prop = false ) {
		if ( empty( self::$site_info ) ) {
			self::$site_info = array(
				'site_url'    => site_url(),
				'admin_email' => get_option( 'admin_email' ),
				'blogname'    => wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES ),
			);
		}

		if ( ! empty( $prop ) && isset( self::$site_info[ $prop ] ) ) {
			return self::$site_info[ $prop ];
		}

		return self::$site_info;
	}

	/**
	 * Register registration form widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_general_controls();
		$this->register_button_controls();
		$this->register_recaptcha_controls();
		$this->register_action_after_submit_controls();
		$this->register_email_controls();
		$this->register_validation_message_controls();
		$this->register_settings_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_form_style_controls();
		$this->register_label_style_controls();
		$this->register_input_style_controls();
		$this->register_pws_meter_style_controls();
		$this->register_submit_style_controls();
		$this->register_loggedin_message_style_controls();
		$this->register_error_style_controls();
	}

	/**
	 * Register Registration Form General Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_general_controls() {

		$this->start_controls_section(
			'section_general_field',
			array(
				'label' => esc_html__( 'Form Fields', 'powerpack' ),
			)
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'form_fields_tabs' );

		$repeater->start_controls_tab( 'form_fields_tab_general', array( 'label' => esc_html__( 'General', 'powerpack' ) ) );

		$repeater->add_control(
			'field_type',
			array(
				'label'   => esc_html__( 'Type', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => $this->get_field_type(),
				'default' => 'first_name',
			)
		);

		$repeater->add_control(
			'field_label',
			array(
				'label'   => esc_html__( 'Label', 'powerpack' ),
				'type'    => Controls_Manager::TEXT,
				'default' => '',
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$repeater->add_control(
			'placeholder',
			array(
				'label'     => esc_html__( 'Placeholder', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '',
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'field_type!' => array( 'consent', 'static_text' ),
				),
			)
		);

		$repeater->add_control(
			'min_pass_length',
			array(
				'label'       => esc_html__( 'Minimum Password Length', 'powerpack' ),
				'description' => esc_html__( 'Set minimum length of the password. Default is 8 characters.', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 8,
				'min'         => 1,
				'step'        => 1,
				'condition'   => array(
					'field_type' => 'user_pass',
				),
			)
		);

		$repeater->add_control(
			'password_toggle',
			array(
				'label'        => esc_html__( 'Password Visibility Toggle', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => array(
					'field_type' => 'user_pass',
				),
			)
		);

		$repeater->add_control(
			'default_value',
			array(
				'label'     => esc_html__( 'Default Value', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '',
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'field_type!' => array( 'user_pass', 'confirm_user_pass', 'consent', 'static_text', 'phone' ),
				),
			)
		);

		$repeater->add_control(
			'default_checked',
			array(
				'label'        => esc_html__( 'Default Checked?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => array(
					'field_type' => 'consent',
				),
			)
		);

		$repeater->add_control(
			'static_text',
			array(
				'label'     => esc_html__( 'Static Text', 'powerpack' ),
				'type'      => Controls_Manager::TEXTAREA,
				'default'   => '',
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'field_type' => 'static_text',
				),
			)
		);

		$repeater->add_control(
			'required',
			array(
				'label'        => esc_html__( 'Required?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => array(
					'field_type' => array( 'user_login', 'user_email', 'user_pass', 'user_login', 'first_name', 'last_name', 'user_url', 'consent', 'phone' ),
				),
			)
		);

		$repeater->add_control(
			'required_note',
			array(
				'type'            => Controls_Manager::RAW_HTML,
				'raw'             => esc_html__( 'Note: This field is required by default.', 'powerpack' ),
				'condition'       => array(
					'field_type' => array( 'user_email', 'user_pass' ),
				),
				'content_classes' => 'pp-editor-info',
			)
		);

		$repeater->add_responsive_control(
			'col_width',
			array(
				'label'   => esc_html__( 'Column Width', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => array(
					''    => esc_html__( 'Default', 'powerpack' ),
					'100' => '100%',
					'80'  => '80%',
					'75'  => '75%',
					'66'  => '66%',
					'60'  => '60%',
					'50'  => '50%',
					'40'  => '40%',
					'33'  => '33%',
					'25'  => '25%',
					'20'  => '20%',
				),
				'default' => '100',
			)
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab( 'form_fields_tab_advanced', array( 'label' => esc_html__( 'Advanced', 'powerpack' ) ) );

		$repeater->add_control(
			'css_class',
			array(
				'label'       => esc_html__( 'Custom CSS Class', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'label_block' => true,
				'default'     => '',
				'ai'          => [
					'active' => false,
				],
				'dynamic'     => array(
					'active' => true,
				),
			)
		);

		$repeater->add_control(
			'validation_msg',
			array(
				'label'       => esc_html__( 'Custom Validation Message', 'powerpack' ),
				'description' => esc_html__( 'You can display your own validation message when the field is left emptied.', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'label_block' => true,
				'default'     => '',
				'dynamic'     => array(
					'active' => true,
				),
			)
		);

		$repeater->end_controls_tab();

		$repeater->end_controls_tabs();

		$this->add_control(
			'form_fields',
			array(
				'type'        => Controls_Manager::REPEATER,
				'fields'      => $repeater->get_controls(),
				'default'     => array(
					array(
						'field_type'  => 'user_login',
						'field_label' => esc_html__( 'Username', 'powerpack' ),
						'placeholder' => esc_html__( 'Username', 'powerpack' ),
						'width'       => '100',
					),
					array(
						'field_type'  => 'user_email',
						'field_label' => esc_html__( 'Email', 'powerpack' ),
						'placeholder' => esc_html__( 'Email', 'powerpack' ),
						'required'    => 'yes',
						'width'       => '100',
					),
					array(
						'field_type'  => 'user_pass',
						'field_label' => esc_html__( 'Password', 'powerpack' ),
						'placeholder' => esc_html__( 'Password', 'powerpack' ),
						'required'    => 'yes',
						'width'       => '100',
					),
				),
				'title_field' => '{{{ field_label }}}',
			)
		);

		$this->add_control(
			'input_size',
			array(
				'label'     => esc_html__( 'Input Size', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					'xs' => esc_html__( 'Extra Small', 'powerpack' ),
					'sm' => esc_html__( 'Small', 'powerpack' ),
					'md' => esc_html__( 'Medium', 'powerpack' ),
					'lg' => esc_html__( 'Large', 'powerpack' ),
					'xl' => esc_html__( 'Extra Large', 'powerpack' ),
				),
				'default'   => 'sm',
				'separator' => 'before',
			)
		);

		$this->add_control(
			'show_labels',
			array(
				'label'        => esc_html__( 'Label', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'mark_required',
			array(
				'label'     => esc_html__( 'Required Mark', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'label_on'  => esc_html__( 'Show', 'powerpack' ),
				'label_off' => esc_html__( 'Hide', 'powerpack' ),
				'default'   => '',
				'condition' => array(
					'show_labels' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form Button Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_button_controls() {

		$this->start_controls_section(
			'section_button_field',
			array(
				'label' => esc_html__( 'Register Button', 'powerpack' ),
			)
		);

		$this->add_control(
			'button_text',
			array(
				'label'   => esc_html__( 'Text', 'powerpack' ),
				'type'    => Controls_Manager::TEXT,
				'default' => esc_html__( 'Register', 'powerpack' ),
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_control(
			'button_size',
			array(
				'label'   => esc_html__( 'Size', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'md',
				'options' => array(
					'xs' => esc_html__( 'Extra Small', 'powerpack' ),
					'sm' => esc_html__( 'Small', 'powerpack' ),
					'md' => esc_html__( 'Medium', 'powerpack' ),
					'lg' => esc_html__( 'Large', 'powerpack' ),
					'xl' => esc_html__( 'Extra Large', 'powerpack' ),
				),
			)
		);

		$this->add_responsive_control(
			'button_width',
			array(
				'label'   => esc_html__( 'Column Width', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => array(
					''    => esc_html__( 'Default', 'powerpack' ),
					'100' => '100%',
					'80'  => '80%',
					'75'  => '75%',
					'66'  => '66%',
					'60'  => '60%',
					'50'  => '50%',
					'40'  => '40%',
					'33'  => '33%',
					'25'  => '25%',
					'20'  => '20%',
				),
				'default' => '100',
			)
		);

		$this->add_responsive_control(
			'button_align',
			array(
				'label'        => esc_html__( 'Alignment', 'powerpack' ),
				'type'         => Controls_Manager::CHOOSE,
				'options'      => array(
					'start'   => array(
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					),
					'center'  => array(
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					),
					'end'     => array(
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					),
					'stretch' => array(
						'title' => esc_html__( 'Justified', 'powerpack' ),
						'icon'  => 'eicon-text-align-justify',
					),
				),
				'default'      => 'stretch',
				'prefix_class' => 'elementor%s-button-align-',
			)
		);

		$this->add_control(
			'button_icon',
			array(
				'label'       => esc_html__( 'Icon', 'powerpack' ),
				'type'        => Controls_Manager::ICONS,
				'label_block' => true,
			)
		);

		$this->add_control(
			'button_icon_align',
			array(
				'label'     => esc_html__( 'Icon Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'left',
				'options'   => array(
					'left'  => esc_html__( 'Before', 'powerpack' ),
					'right' => esc_html__( 'After', 'powerpack' ),
				),
				'condition' => array(
					'button_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'button_icon_indent',
			array(
				'label'      => esc_html__( 'Icon Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range'      => array(
					'px' => array(
						'max' => 50,
					),
				),
				'condition'  => array(
					'button_icon[value]!' => '',
				),
				'selectors'  => array(
					'{{WRAPPER}} .elementor-button .elementor-align-icon-right' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-button .elementor-align-icon-left' => 'margin-right: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();

	}

	/**
	 * Register Registration Form reCaptcha Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_recaptcha_controls() {
		$this->start_controls_section(
			'section_recaptcha',
			array(
				'label' => esc_html__( 'reCAPTCHA', 'powerpack' ),
			)
		);

		$this->add_control(
			'enable_recaptcha',
			array(
				'label'     => esc_html__( 'Enable reCAPTCHA', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => 'no',
				'label_off' => esc_html__( 'No', 'powerpack' ),
				'label_on'  => esc_html__( 'Yes', 'powerpack' ),
			)
		);

		if ( ! $this->is_recaptcha() ) {
			$this->add_control(
				'google_clientid_setting',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => PP_Helper::get_recaptcha_desc(),
					'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
					'condition'       => array(
						'enable_recaptcha' => 'yes',
					),
				)
			);
		}

		if ( $this->is_recaptcha() ) {
			$this->add_control(
				'recaptcha_validate_type',
				array(
					'label'       => esc_html__( 'Validate Type', 'powerpack' ),
					'description' => esc_html__( 'Validate users with checkbox or in the background.<br />Note: Checkbox and Invisible types use seperate API keys.', 'powerpack' ),
					'type'        => Controls_Manager::SELECT,
					'multiple'    => true,
					'label_block' => true,
					'default'     => 'normal',
					'options'     => array(
						'normal'       => esc_html__( '"I\'m not a robot" checkbox (V2)', 'powerpack' ),
						'invisible'    => esc_html__( 'Invisible (V2)', 'powerpack' ),
						'invisible_v3' => esc_html__( 'Invisible (V3)', 'powerpack' ),
					),
					'condition'   => array(
						'enable_recaptcha' => 'yes',
					),
				)
			);

			$this->add_control(
				'recaptcha_theme',
				array(
					'label'     => esc_html__( 'Theme', 'powerpack' ),
					'type'      => Controls_Manager::SELECT,
					'default'   => 'light',
					'options'   => array(
						'light' => esc_html__( 'Light', 'powerpack' ),
						'dark'  => esc_html__( 'Dark', 'powerpack' ),
					),
					'condition' => array(
						'enable_recaptcha' => 'yes',
					),
				)
			);
		}

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form Action afetr submit Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_action_after_submit_controls() {

		$this->start_controls_section(
			'section_action_after_submit_field',
			array(
				'label' => esc_html__( 'Actions After Register', 'powerpack' ),
			)
		);

		$this->add_control(
			'actions_array',
			array(
				'label'       => esc_html__( 'Add Action', 'powerpack' ),
				// translators: %s denotes doc link for registration form.
				'description' => sprintf( esc_html__( 'Choose from above actions to perform after successful user registration. Click %1$s here %2$s to learn more.', 'powerpack' ), '<a href="https://powerpackelements.com/docs/post-registration-actions/?utm_source=widget&utm_medium=panel&utm_campaign=userkb" target="_blank" rel="noopener">', '</a>' ),
				'type'        => Controls_Manager::SELECT2,
				'multiple'    => true,
				'label_block' => true,
				'default'     => 'send_email',
				'options'     => array(
					'redirect'   => esc_html__( 'Redirect', 'powerpack' ),
					'auto_login' => esc_html__( 'Auto Login', 'powerpack' ),
					'send_email' => esc_html__( 'Send Email', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'redirect_url',
			array(
				'label'     => esc_html__( 'Redirect To', 'powerpack' ),
				'type'      => Controls_Manager::URL,
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'actions_array' => 'redirect',
				),
			)
		);

		$this->end_controls_section();

	}

	/**
	 * Register Registration Form Email Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_email_controls() {

		$this->start_controls_section(
			'section_action_email',
			array(
				'label'     => esc_html__( 'Email Notification', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_CONTENT,
				'condition' => array(
					'actions_array' => 'send_email',
				),
			)
		);

		$this->start_controls_tabs( 'action_email_tabs' );

		$this->start_controls_tab( 'action_email_tab_user', array( 'label' => esc_html__( 'User', 'powerpack' ) ) );

		$this->add_control(
			'send_email_note',
			array(
				'type'            => Controls_Manager::RAW_HTML,
				/* translators: %1$s doc link */
				'raw'             => sprintf( esc_html__( 'Send the new user an email about their account. Click %1$s here %2$s to learn more.', 'powerpack' ), '<a href="https://powerpackelements.com/docs/configure-admin-user-email/?utm_source=widget&utm_medium=panel&utm_campaign=userkb" target="_blank" rel="noopener">', '</a>' ),
				'content_classes' => 'pp-editor-info',
			)
		);

		$site_title = get_option( 'blogname' );
		$login_url  = site_url() . '/wp-admin';

		/* translators: %s: Site title. */
		$default_message = sprintf( esc_html__( 'Thank you for registering with "%s"!', 'powerpack' ), $site_title );

		$this->add_control(
			'email_subject',
			array(
				'label'       => esc_html__( 'Subject', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				/* translators: %s: Subject */
				'placeholder' => sprintf( esc_html__( 'New message from "%s"', 'powerpack' ), $this->get_site_info( 'blogname' ) ),
				/* translators: %s: Subject */
				'default'     => sprintf( esc_html__( 'New message from "%s"', 'powerpack' ), $this->get_site_info( 'blogname' ) ),
				'label_block' => true,
				'render_type' => 'none',
			)
		);

		$this->add_control(
			'email_content',
			array(
				'label'       => esc_html__( 'Message', 'powerpack' ),
				'type'        => Controls_Manager::WYSIWYG,
				'placeholder' => esc_html__( 'Enter the Email Content', 'powerpack' ),
				/* translators: %s: Message. */
				'default'     => sprintf( __( "Thanks for signing up for %s. Please find your details below.\n\n ---- \n{{all-fields}}", 'powerpack' ), $this->get_site_info( 'blogname' ) ),
				'description' => esc_html__( 'By default, all form fields are sent via tag: {{all-fields}}. Want to customize sent fields? Copy any of these supported tags {{user_login}}, {{user_pass}}, {{user_pass}}, {{first_name}}, {{last_name}}, {{user_url}} and paste here. Additionally, you can include blog/site name by using {{blogname}}, site URL {{site_url}}, admin email {{admin_email}}', 'powerpack' ),
				'label_block' => true,
				'render_type' => 'none',
			)
		);

		$this->add_control(
			'email_from',
			array(
				'label'       => esc_html__( 'From Email', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				/* translators: %s: Message. */
				'default'     => $this->get_site_info( 'admin_email' ),
				'description' => esc_html__( 'Please make sure to use an email from the same domain or using an authorized SMTP service, otherwise email will not be delivered or landed up in junk.', 'powerpack' ),
				'label_block' => true,
				'render_type' => 'none',
				'ai'          => [
					'active' => false,
				],
			)
		);

		$this->add_control(
			'email_from_name',
			array(
				'label'       => esc_html__( 'From Name', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				/* translators: %s: Message. */
				'default'     => $this->get_site_info( 'blogname' ),
				'label_block' => true,
				'render_type' => 'none',
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'action_email_tab_admin', array( 'label' => esc_html__( 'Admin', 'powerpack' ) ) );

		$this->add_control(
			'enable_admin_email',
			array(
				'label'        => esc_html__( 'Enable Admin Notification', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'admin_email_to',
			array(
				'label'       => esc_html__( 'Send To Email', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				/* translators: %s: Message. */
				'default'     => $this->get_site_info( 'admin_email' ),
				'placeholder' => $this->get_site_info( 'admin_email' ),
				'description' => esc_html__( 'Notfication will be sent to this email. Defaults to the admin email.', 'powerpack' ),
				'label_block' => true,
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'enable_admin_email' => 'yes',
				),
			)
		);

		$this->add_control(
			'admin_email_subject',
			array(
				'label'       => esc_html__( 'Email Subject', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'New User Registration', 'powerpack' ),
				'label_block' => true,
				'condition'   => array(
					'enable_admin_email' => 'yes',
				),
			)
		);

		$this->add_control(
			'admin_email_content',
			array(
				'label'       => esc_html__( 'Email Content', 'powerpack' ),
				'type'        => Controls_Manager::WYSIWYG,
				'placeholder' => esc_html__( 'Enter the Email Content', 'powerpack' ),
				/* translators: %s: Message. */
				'default'     => sprintf( __( "The following user is registered on the site: \n\n ---- \n %s", 'powerpack' ), '{{all-fields}}' ),
				'description' => esc_html__( 'By default, all form fields are sent via tag: {{all-fields}}. Want to customize sent fields? Copy any of these supported tags {{user_login}}, {{user_pass}}, {{user_pass}}, {{first_name}}, {{last_name}}, {{user_url}} and paste here. Additionally, you can include blog/site name by using {{blogname}}, site URL {{site_url}}, admin email {{admin_email}}', 'powerpack' ),
				'label_block' => true,
				'condition'   => array(
					'enable_admin_email' => 'yes',
				),
			)
		);

		$this->add_control(
			'email_metadata',
			array(
				'label'     => esc_html__( 'Meta Data', 'powerpack' ),
				'type'      => Controls_Manager::SELECT2,
				'options'   => array(
					'date'       => esc_html__( 'Date', 'powerpack' ),
					'time'       => esc_html__( 'Time', 'powerpack' ),
					'page_url'   => esc_html__( 'Page URL', 'powerpack' ),
					'user_agent' => esc_html__( 'User Agent', 'powerpack' ),
					'remote_ip'  => esc_html__( 'Remote IP', 'powerpack' ),
				),
				'multiple'  => true,
				'condition' => array(
					'enable_admin_email' => 'yes',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();

	}

	/**
	 * Register Success / Error Messages Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_validation_message_controls() {
		$this->start_controls_section(
			'section_validation_fields',
			array(
				'label' => esc_html__( 'Success Messages', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'show_success_message',
			array(
				'label'        => esc_html__( 'Show Message', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'success_message',
			array(
				'label'       => esc_html__( 'Success Message', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'New user is registered successfully!', 'powerpack' ),
				'dynamic'     => array(
					'active' => true,
				),
				'label_block' => true,
				'condition'   => array(
					'show_success_message' => 'yes',
				),
			)
		);

		$this->end_controls_section();

	}

	/**
	 * Register Registration Form user settings Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_settings_controls() {

		$this->start_controls_section(
			'section_settings_field',
			array(
				'label' => esc_html__( 'Additional Options', 'powerpack' ),
			)
		);

			$this->add_control(
				'hide_form',
				array(
					'label'        => esc_html__( 'Hide Form from Logged in Users', 'powerpack' ),
					'description'  => esc_html__( 'Enable this option if you wish to hide the form at the frontend from logged in users.', 'powerpack' ),
					'type'         => Controls_Manager::SWITCHER,
					'label_on'     => esc_html__( 'Yes', 'powerpack' ),
					'label_off'    => esc_html__( 'No', 'powerpack' ),
					'return_value' => 'yes',
					'default'      => 'yes',
				)
			);

			$this->add_control(
				'logged_in_text',
				array(
					'label'       => esc_html__( 'Message For Logged In Users', 'powerpack' ),
					'description' => esc_html__( 'Enter the message to display at the frontend for Logged in users.', 'powerpack' ),
					'type'        => Controls_Manager::WYSIWYG,
					'dynamic'     => array(
						'active' => true,
					),
					'condition'   => array(
						'hide_form' => 'yes',
					),
				)
			);

			if ( current_user_can( 'manage_options' ) ) {
				$this->add_control(
					'user_role',
					array(
						'label'     => esc_html__( 'New User Role', 'powerpack' ),
						'type'      => Controls_Manager::SELECT,
						'default'   => '',
						'options'   => $this->get_user_roles(),
						'separator' => 'before',
					)
				);

				$this->add_control(
					'default_role_note',
					array(
						'type'            => Controls_Manager::RAW_HTML,
						'raw'             => esc_html__( 'The default option will assign the user role as per the WordPress backend setting.', 'powerpack' ),
						'content_classes' => 'pp-editor-info',
						'condition'       => array(
							'user_role' => '',
						),
					)
				);
			}

			$this->add_control(
				'login',
				array(
					'label'        => esc_html__( 'Login', 'powerpack' ),
					'description'  => esc_html__( 'Add the “Login” link below the register button.', 'powerpack' ),
					'type'         => Controls_Manager::SWITCHER,
					'label_on'     => esc_html__( 'Yes', 'powerpack' ),
					'label_off'    => esc_html__( 'No', 'powerpack' ),
					'return_value' => 'yes',
					'default'      => 'no',
					'separator'    => 'before',
				)
			);

			$this->add_control(
				'login_text',
				array(
					'label'       => esc_html__( 'Text', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => esc_html__( 'Login', 'powerpack' ),
					'placeholder' => esc_html__( 'Login', 'powerpack' ),
					'dynamic'     => array(
						'active' => true,
					),
					'condition'   => array(
						'login' => 'yes',
					),
				)
			);

			$this->add_control(
				'login_select',
				array(
					'label'     => esc_html__( 'Link to', 'powerpack' ),
					'type'      => Controls_Manager::SELECT,
					'options'   => array(
						'default' => esc_html__( 'Default WordPress Page', 'powerpack' ),
						'custom'  => esc_html__( 'Custom URL', 'powerpack' ),
					),
					'default'   => 'default',
					'condition' => array(
						'login' => 'yes',
					),
				)
			);

			$this->add_control(
				'login_url',
				array(
					'label'     => esc_html__( 'Enter URL', 'powerpack' ),
					'type'      => Controls_Manager::URL,
					'dynamic'   => array(
						'active' => true,
					),
					'condition' => array(
						'login_select' => 'custom',
						'login'        => 'yes',
					),
				)
			);

			$this->add_control(
				'lost_password',
				array(
					'label'        => esc_html__( 'Lost Your Password', 'powerpack' ),
					'description'  => esc_html__( 'Add the “Lost Password” link below the register button', 'powerpack' ),
					'type'         => Controls_Manager::SWITCHER,
					'label_on'     => esc_html__( 'Yes', 'powerpack' ),
					'label_off'    => esc_html__( 'No', 'powerpack' ),
					'return_value' => 'yes',
					'default'      => 'no',
					'separator'    => 'before',
				)
			);

			$this->add_control(
				'lost_password_text',
				array(
					'label'       => esc_html__( 'Text', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'default'     => esc_html__( 'Lost Your Password?', 'powerpack' ),
					'placeholder' => esc_html__( 'Lost Your Password?', 'powerpack' ),
					'dynamic'     => array(
						'active' => true,
					),
					'condition'   => array(
						'lost_password' => 'yes',
					),
				)
			);

			$this->add_control(
				'lost_password_select',
				array(
					'label'     => esc_html__( 'Link to', 'powerpack' ),
					'type'      => Controls_Manager::SELECT,
					'options'   => array(
						'default' => esc_html__( 'Default WordPress Page', 'powerpack' ),
						'custom'  => esc_html__( 'Custom URL', 'powerpack' ),
					),
					'default'   => 'default',
					'condition' => array(
						'lost_password' => 'yes',
					),
				)
			);

			$this->add_control(
				'lost_password_url',
				array(
					'label'     => esc_html__( 'Enter URL', 'powerpack' ),
					'type'      => Controls_Manager::URL,
					'dynamic'   => array(
						'active' => true,
					),
					'condition' => array(
						'lost_password_select' => 'custom',
						'lost_password'        => 'yes',
					),
				)
			);

			$this->add_control(
				'enable_pws_meter',
				array(
					'label'              => esc_html__( 'Password Strength Meter', 'powerpack' ),
					'type'               => Controls_Manager::SWITCHER,
					'label_on'           => esc_html__( 'Show', 'powerpack' ),
					'label_off'          => esc_html__( 'Hide', 'powerpack' ),
					'return_value'       => 'yes',
					'default'            => 'no',
					'separator'          => 'before',
					'frontend_available' => true,
				)
			);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links('Registration_Form');
		if ( !empty($help_docs) ) {
			/**
			 * Content Tab: Docs Links
			 *
			 * @since 1.4.8
			 * @access protected
			 */
			$this->start_controls_section(
				'section_help_docs',
				[
					'label' => esc_html__( 'Help Docs', 'powerpack' ),
				]
			);

			$hd_counter = 1;
			foreach( $help_docs as $hd_title => $hd_link ) {
				$this->add_control(
					'help_doc_' . $hd_counter,
					[
						'type'            => Controls_Manager::RAW_HTML,
						'raw'             => sprintf( '%1$s ' . $hd_title . ' %2$s', '<a href="' . $hd_link . '" target="_blank" rel="noopener">', '</a>' ),
						'content_classes' => 'pp-editor-doc-links',
					]
				);

				$hd_counter++;
			}

			$this->end_controls_section();
		}
	}

	/**
	 * Register Registration Form General Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_form_style_controls() {
		$this->start_controls_section(
			'section_form_fields_style',
			array(
				'label' => esc_html__( 'Form', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

			$this->add_responsive_control(
				'column_gap',
				array(
					'label'      => esc_html__( 'Columns Gap', 'powerpack' ),
					'type'       => Controls_Manager::SLIDER,
					'size_units' => [ 'px', 'em', 'rem', 'custom' ],
					'default'    => array(
						'size' => 10,
					),
					'range'      => array(
						'px' => array(
							'min' => 0,
							'max' => 60,
						),
					),
					'selectors'  => array(
						'{{WRAPPER}} .elementor-field-group' => 'padding-right: calc( {{SIZE}}{{UNIT}}/2 ); padding-left: calc( {{SIZE}}{{UNIT}}/2 );',
						'{{WRAPPER}} .elementor-form-fields-wrapper' => 'margin-left: calc( -{{SIZE}}{{UNIT}}/2 ); margin-right: calc( -{{SIZE}}{{UNIT}}/2 );',
					),
				)
			);

			$this->add_responsive_control(
				'row_gap',
				array(
					'label'      => esc_html__( 'Rows Gap', 'powerpack' ),
					'type'       => Controls_Manager::SLIDER,
					'size_units' => [ 'px', 'em', 'rem', 'custom' ],
					'default'    => array(
						'size' => 20,
					),
					'range'      => array(
						'px' => array(
							'min' => 0,
							'max' => 60,
						),
					),
					'selectors'  => array(
						'{{WRAPPER}} .elementor-field-group:not( .elementor-field-type-submit ):not( .pp-rf-links ):not( .pp-recaptcha-align-bottomright ):not( .pp-recaptcha-align-bottomleft )' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					),
				)
			);

			$this->add_control(
				'links_heading_style',
				array(
					'label'     => esc_html__( 'Links', 'powerpack' ),
					'type'      => Controls_Manager::HEADING,
					'separator' => 'before',
				)
			);

			$this->add_responsive_control(
				'links_align',
				array(
					'label'      => esc_html__( 'Alignment', 'powerpack' ),
					'type'       => Controls_Manager::CHOOSE,
					'options'    => array(
						'flex-start' => array(
							'title' => esc_html__( 'Left', 'powerpack' ),
							'icon'  => 'eicon-text-align-left',
						),
						'center'     => array(
							'title' => esc_html__( 'Center', 'powerpack' ),
							'icon'  => 'eicon-text-align-center',
						),
						'flex-end'   => array(
							'title' => esc_html__( 'Right', 'powerpack' ),
							'icon'  => 'eicon-text-align-right',
						),
					),
					'default'    => 'flex-start',
					'selectors'  => array(
						'{{WRAPPER}} .pp-rf-links' => 'justify-content: {{VALUE}};',
					),
					'conditions' => array(
						'relation' => 'or',
						'terms'    => array(
							array(
								'name'     => 'login',
								'operator' => '==',
								'value'    => 'yes',
							),
							array(
								'name'     => 'lost_password',
								'operator' => '==',
								'value'    => 'yes',
							),
						),
					),
				)
			);

			$this->add_control(
				'links_color',
				array(
					'label'      => esc_html__( 'Color', 'powerpack' ),
					'type'       => Controls_Manager::COLOR,
					'selectors'  => array(
						'{{WRAPPER}} .pp-rf-links > a' => 'color: {{VALUE}};',
					),
					'global'     => [
						'default' => Global_Colors::COLOR_TEXT,
					],
					'conditions' => array(
						'relation' => 'or',
						'terms'    => array(
							array(
								'name'     => 'login',
								'operator' => '==',
								'value'    => 'yes',
							),
							array(
								'name'     => 'lost_password',
								'operator' => '==',
								'value'    => 'yes',
							),
						),
					),
				)
			);

			$this->add_control(
				'links_hover_color',
				array(
					'label'      => esc_html__( 'Hover Color', 'powerpack' ),
					'type'       => Controls_Manager::COLOR,
					'selectors'  => array(
						'{{WRAPPER}} .pp-rf-links > a:hover' => 'color: {{VALUE}};',
					),
					'global'     => [
						'default' => Global_Colors::COLOR_ACCENT,
					],
					'conditions' => array(
						'relation' => 'or',
						'terms'    => array(
							array(
								'name'     => 'login',
								'operator' => '==',
								'value'    => 'yes',
							),
							array(
								'name'     => 'lost_password',
								'operator' => '==',
								'value'    => 'yes',
							),
						),
					),
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'       => 'links_typography',
					'selector'   => '{{WRAPPER}} .pp-rf-links > a',
					'conditions' => array(
						'relation' => 'or',
						'terms'    => array(
							array(
								'name'     => 'login',
								'operator' => '==',
								'value'    => 'yes',
							),
							array(
								'name'     => 'lost_password',
								'operator' => '==',
								'value'    => 'yes',
							),
						),
					),
				)
			);

			$this->add_control(
				'links_divider',
				array(
					'label'      => esc_html__( 'Divider', 'powerpack' ),
					'type'       => Controls_Manager::TEXT,
					'default'    => '|',
					'selectors'  => array(
						'{{WRAPPER}} .pp-rf-links a.pp-rf-footer-link:not(:last-child):after' => 'content: "{{VALUE}}"; margin: 0 0.2em;',
					),
					'conditions' => array(
						'relation' => 'and',
						'terms'    => array(
							array(
								'name'     => 'login',
								'operator' => '==',
								'value'    => 'yes',
							),
							array(
								'name'     => 'lost_password',
								'operator' => '==',
								'value'    => 'yes',
							),
						),
					),
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form label Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_label_style_controls() {
		$this->start_controls_section(
			'section_label_style',
			array(
				'label'     => esc_html__( 'Label', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'show_labels!' => '',
				),
			)
		);

			$this->add_control(
				'label_color',
				array(
					'label'     => esc_html__( 'Text Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'global'    => [
						'default' => Global_Colors::COLOR_TEXT,
					],
					'selectors' => array(
						'{{WRAPPER}} .elementor-field-group > label, {{WRAPPER}} .elementor-field-subgroup label' => 'color: {{VALUE}};',
					),
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'     => 'label_typography',
					'selector' => '{{WRAPPER}} .elementor-field-group > label',
					'global'   => [
						'default' => Global_Typography::TYPOGRAPHY_TEXT,
					],
				)
			);

			$this->add_control(
				'mark_required_color',
				array(
					'label'     => esc_html__( 'Required Mark Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'default'   => '',
					'selectors' => array(
						'{{WRAPPER}} .elementor-mark-required .elementor-field-label:after' => 'color: {{COLOR}};',
					),
					'condition' => array(
						'mark_required' => 'yes',
					),
				)
			);

			$this->add_responsive_control(
				'label_spacing',
				array(
					'label'      => esc_html__( 'Label Bottom Spacing', 'powerpack' ),
					'type'       => Controls_Manager::SLIDER,
					'size_units' => [ 'px', 'em', 'rem', 'custom' ],
					'default'    => array(
						'size' => 0,
					),
					'range'      => array(
						'px' => array(
							'min' => 0,
							'max' => 60,
						),
					),
					'selectors'  => array(
						'body.rtl {{WRAPPER}} .elementor-labels-inline .elementor-field-group > label' => 'padding-left: {{SIZE}}{{UNIT}};',
						// for the label position = inline option.
						'body:not(.rtl) {{WRAPPER}} .elementor-labels-inline .elementor-field-group > label' => 'padding-right: {{SIZE}}{{UNIT}};',
						// for the label position = inline option.
						'body {{WRAPPER}} .elementor-labels-above .elementor-field-group > label' => 'padding-bottom: {{SIZE}}{{UNIT}};',
						// for the label position = above option.
					),
					'condition'  => array(
						'show_labels!' => '',
					),
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form Input Fields Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_input_style_controls() {
		$this->start_controls_section(
			'section_input_style',
			array(
				'label' => esc_html__( 'Input Fields', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

			$this->add_control(
				'field_text_color',
				array(
					'label'     => esc_html__( 'Text Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'selectors' => array(
						'{{WRAPPER}} .elementor-field-group .elementor-field' => 'color: {{VALUE}};',
					),
					'global'    => [
						'default' => Global_Colors::COLOR_TEXT,
					],
				)
			);

			$this->add_control(
				'field_background_color',
				array(
					'label'     => esc_html__( 'Background Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'default'   => '#ffffff',
					'selectors' => array(
						'{{WRAPPER}} .elementor-field-group .elementor-field' => 'background-color: {{VALUE}};',
					),
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'     => 'field_typography',
					'selector' => '{{WRAPPER}} .elementor-field-group .elementor-field',
					'global'   => [
						'default' => Global_Typography::TYPOGRAPHY_TEXT,
					],
				)
			);

			$this->add_group_control(
				Group_Control_Border::get_type(),
				array(
					'name'     => 'field_border',
					'selector' => '{{WRAPPER}} .elementor-field',
				)
			);

			$this->add_responsive_control(
				'field_border_radius',
				array(
					'label'      => esc_html__( 'Border Radius', 'powerpack' ),
					'type'       => Controls_Manager::DIMENSIONS,
					'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
					'default'    => array(
						'top'    => '2',
						'bottom' => '2',
						'left'   => '2',
						'right'  => '2',
						'unit'   => 'px',
					),
					'selectors'  => array(
						'{{WRAPPER}} .elementor-field-group .elementor-field' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					),
				)
			);

			$this->add_responsive_control(
				'input_padding',
				array(
					'label'      => esc_html__( 'Padding', 'powerpack' ),
					'type'       => Controls_Manager::DIMENSIONS,
					'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
					'selectors'  => array(
						'{{WRAPPER}} .elementor-field-group .elementor-field' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					),
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Password Strength Meter Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_pws_meter_style_controls() {

		$this->start_controls_section(
			'section_pws_meter_field',
			array(
				'label'     => esc_html__( 'Password Strength Meter', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'enable_pws_meter' => 'yes',
				),
			)
		);

		$this->add_control(
			'pws_meter_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-rf-pws-status' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'enable_pws_meter' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'pws_meter_typography',
				'selector'  => '{{WRAPPER}} .pp-rf-pws-status',
				'condition' => array(
					'enable_pws_meter' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form Register Button Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_submit_style_controls() {
		$this->start_controls_section(
			'section_submit_style',
			array(
				'label' => esc_html__( 'Register Button', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

			$this->add_responsive_control(
				'button_spacing',
				array(
					'label'              => esc_html__( 'Button Spacing', 'powerpack' ),
					'type'               => Controls_Manager::DIMENSIONS,
					'default'            => array(
						'isLinked' => false,
					),
					'allowed_dimensions' => 'vertical',
					'size_units'         => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
					'selectors'          => array(
						'{{WRAPPER}} .pp-registration-form .elementor-field-group.elementor-field-type-submit' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					),
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'     => 'button_typography',
					'global'   => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
					'selector' => '{{WRAPPER}} .elementor-button',
				)
			);

			$this->start_controls_tabs( 'tabs_button_style' );

				$this->start_controls_tab(
					'tab_button_normal',
					array(
						'label' => esc_html__( 'Normal', 'powerpack' ),
					)
				);

					$this->add_control(
						'button_text_color',
						array(
							'label'     => esc_html__( 'Text Color', 'powerpack' ),
							'type'      => Controls_Manager::COLOR,
							'default'   => '',
							'selectors' => array(
								'{{WRAPPER}} .elementor-button' => 'color: {{VALUE}};',
								'{{WRAPPER}} .elementor-button svg' => 'fill: {{VALUE}};',
							),
						)
					);

					$this->add_group_control(
						Group_Control_Background::get_type(),
						array(
							'name'           => 'button_background_color',
							'label'          => esc_html__( 'Background Color', 'powerpack' ),
							'types'          => array( 'classic', 'gradient' ),
							'exclude'        => array( 'image' ),
							'selector'       => '{{WRAPPER}} .elementor-button',
							'fields_options' => array(
								'color' => array(
									'global' => [
										'default' => Global_Colors::COLOR_ACCENT,
									],
								),
							),
						)
					);

					$this->add_group_control(
						Group_Control_Border::get_type(),
						array(
							'name'     => 'button_border',
							'selector' => '{{WRAPPER}} .elementor-button',
						)
					);

					$this->add_responsive_control(
						'button_border_radius',
						array(
							'label'      => esc_html__( 'Border Radius', 'powerpack' ),
							'type'       => Controls_Manager::DIMENSIONS,
							'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
							'selectors'  => array(
								'{{WRAPPER}} .elementor-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
							),
						)
					);

					$this->add_responsive_control(
						'button_text_padding',
						array(
							'label'      => esc_html__( 'Padding', 'powerpack' ),
							'type'       => Controls_Manager::DIMENSIONS,
							'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
							'selectors'  => array(
								'{{WRAPPER}} .elementor-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
							),
						)
					);

				$this->end_controls_tab();

				$this->start_controls_tab(
					'tab_button_hover',
					array(
						'label' => esc_html__( 'Hover', 'powerpack' ),
					)
				);

					$this->add_control(
						'button_hover_color',
						array(
							'label'     => esc_html__( 'Text Color', 'powerpack' ),
							'type'      => Controls_Manager::COLOR,
							'selectors' => array(
								'{{WRAPPER}} .elementor-button:hover' => 'color: {{VALUE}};',
							),
						)
					);

					$this->add_group_control(
						Group_Control_Background::get_type(),
						array(
							'name'           => 'button_background_hover_color',
							'label'          => esc_html__( 'Hover Background Color', 'powerpack' ),
							'types'          => array( 'classic', 'gradient' ),
							'exclude'        => array( 'image' ),
							'selector'       => '{{WRAPPER}} .elementor-button:hover',
							'fields_options' => array(
								'color' => array(
									'global' => [
										'default' => Global_Colors::COLOR_ACCENT,
									],
								),
							),
						)
					);

					$this->add_control(
						'button_hover_border_color',
						array(
							'label'     => esc_html__( 'Border Color', 'powerpack' ),
							'type'      => Controls_Manager::COLOR,
							'selectors' => array(
								'{{WRAPPER}} .elementor-button:hover' => 'border-color: {{VALUE}};',
							),
							'condition' => array(
								'button_border_border!' => '',
							),
						)
					);

					$this->add_control(
						'button_hover_animation',
						array(
							'label' => esc_html__( 'Animation', 'powerpack' ),
							'type'  => Controls_Manager::HOVER_ANIMATION,
						)
					);

				$this->end_controls_tab();

			$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form Success & Error Messages Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_loggedin_message_style_controls() {
		$this->start_controls_section(
			'section_oggedin_message_style',
			array(
				'label'     => esc_html__( 'Logged In Message', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'hide_form' => 'yes',
				),
			)
		);

		$this->add_control(
			'loggedin_message_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_TEXT,
				],
				'selectors' => array(
					'{{WRAPPER}} .pp-rf-loggedin-message' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'hide_form' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'loggedin_message_typography',
				'selector'  => '{{WRAPPER}} .pp-rf-loggedin-message',
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
				'condition' => array(
					'hide_form' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register Registration Form Success & Error Messages Style Controls.
	 *
	 * @since 1.5.0
	 * @access protected
	 */
	protected function register_error_style_controls() {
		$this->start_controls_section(
			'section_messages_style',
			array(
				'label' => esc_html__( 'Success / Error Messages', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

			$this->add_control(
				'field_error_heading',
				array(
					'label' => esc_html__( 'Error Field Validation', 'powerpack' ),
					'type'  => Controls_Manager::HEADING,
				)
			);

			$this->add_control(
				'error_form_error_msg_color',
				array(
					'label'     => esc_html__( 'Message Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'default'   => '#ff0000',
					'selectors' => array(
						'{{WRAPPER}} .pp-rf-error' => 'color: {{VALUE}}',
					),
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'    => 'error_message_typography',
					'global'  => [
						'default' => Global_Typography::TYPOGRAPHY_TEXT,
					],
					'selector' => '{{WRAPPER}} .pp-rf-error',
				)
			);

			$this->add_control(
				'success_message_heading',
				array(
					'label'     => esc_html__( 'Form Success Messages', 'powerpack' ),
					'type'      => Controls_Manager::HEADING,
					'separator' => 'before',
				)
			);

			$this->add_control(
				'preview_message',
				array(
					'label'        => esc_html__( 'Preview Messages', 'powerpack' ),
					'type'         => Controls_Manager::SWITCHER,
					'return_value' => 'yes',
					'default'      => 'no',
				)
			);

			$this->add_control(
				'message_wrap_style',
				array(
					'label'   => esc_html__( 'Message Style', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'default',
					'options' => array(
						'default' => esc_html__( 'Default', 'powerpack' ),
						'custom'  => esc_html__( 'Custom', 'powerpack' ),
					),
				)
			);

			$this->add_control(
				'success_message_color',
				array(
					'label'     => esc_html__( 'Success Message Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'default'   => '#008000',
					'selectors' => array(
						'{{WRAPPER}} .pp-rf-success-msg' => 'color: {{VALUE}};',
					),
					'condition' => array(
						'message_wrap_style' => 'custom',
					),
				)
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				array(
					'name'     => 'message_validation_typo',
					'global'   => [
						'default' => Global_Typography::TYPOGRAPHY_TEXT,
					],
					'selector' => '{{WRAPPER}} .pp-rf-success-msg',
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Get HTML attributes for form element.
	 *
	 * @since 1.5.0
	 *
	 * @access public
	 */
	public function get_form_attrs() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute(
			array(
				'form' => array(
					'class'                => array(
						'pp-registration-form',
						'elementor-form',
					),
					'id'                   => array(
						'pp-rf-' . $this->get_id(),
					),
					'method'               => 'post',
					'data-password-length' => $this->password_length,
					'data-nonce'           => wp_create_nonce( 'ppe-registration-nonce' ),
				),
			)
		);
	}

	/**
	 * Set minimum password length
	 *
	 * @since 1.5.0
	 *
	 * @return void
	 */
	public function set_min_pass_length() {
		$settings    = $this->get_settings_for_display();
		$form_fields = $settings['form_fields'];

		foreach ( $form_fields as $field ) {
			if ( 'user_pass' === $field['field_type'] && isset( $field['min_pass_length'] ) ) {
				$this->password_length = ! empty( absint( $field['min_pass_length'] ) ) ? absint( $field['min_pass_length'] ) : 8;
			} else {
				unset( $field['min_pass_length'] );
				if ( isset( $field['password_toggle'] ) ) {
					unset( $field['password_toggle'] );
				}
			}
		}
	}

	/**
	 * Get HTML attributes for the field wrapper.
	 *
	 * @since 1.5.0
	 *
	 * @param Object $field Field data.
	 * @param string $field_wrap_key Field data.
	 * @access public
	 */
	public function get_field_wrap_attrs( $field, $field_wrap_key ) {
		$field_wrap_class = array(
			'pp-rf-field',
			'elementor-field-group',
			'elementor-column',
			'elementor-col-' . $field['col_width'],
		);

		if ( 'yes' === $field['required'] ) {
			$field_wrap_class[] = 'elementor-mark-required';
		} else {
			if ( in_array( $field['field_type'], array( 'user_email', 'user_pass', 'confirm_user_pass' ), true ) ) {
				$field_wrap_class[] = 'elementor-mark-required';
			}
		}

		if ( 'user_pass' === $field['field_type'] ) {
			if ( isset( $field['password_toggle'] ) && 'yes' === $field['password_toggle'] ) {
				$field_wrap_class[] = 'pp-rf-field-pw-toggle';
			}
		}

		if ( ! empty( $field['css_class'] ) ) {
			$field_wrap_class[] = $field['css_class'];
		}

		$this->add_render_attribute(
			array(
				$field_wrap_key => array(
					'class'           => $field_wrap_class,
					'data-field-type' => $field['field_type'],
				),
			)
		);
	}

	/**
	 * Get HTML attributes for the fields.
	 *
	 * @since 1.5.0
	 *
	 * @param array  $field Field data.
	 * @param string $field_key Field data.
	 * @access public
	 */
	public function get_field_attrs( $field, $field_key ) {
		$settings   = $this->get_settings_for_display();
		$field_id   = 'field-' . $field['_id'];
		$field_name = $field['field_type'];

		$field_class = array(
			'elementor-field',
			'elementor-size-' . $settings['input_size'],
			$field_id,
		);

		if ( in_array( $field['field_type'], array( 'user_login', 'first_name', 'last_name', 'user_email', 'user_pass', 'confirm_user_pass', 'user_url' ), true ) ) {
			$field_class[] = 'elementor-field-textual';
		}

		$this->add_render_attribute(
			array(
				$field_key => array(
					'class' => $field_class,
					'name'  => $field_name,
					'id'    => $field_id,
				),
			)
		);
	}

	/**
	 * Renders the label HTML for field.
	 *
	 * @since 1.5.0
	 *
	 * @param object $field Field data.
	 * @param string $label_key field key.
	 * @access public
	 */
	public function render_field_label( $field, $label_key ) {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute(
			$label_key,
			array(
				'class' => 'elementor-field-label',
				'for'   => 'field-' . $field['_id'],
			)
		);

		if ( 'yes' !== $settings['show_labels'] ) {
			$this->add_render_attribute( $label_key, 'class', 'elementor-screen-only' );
		}

		if ( ! empty( $field['field_label'] ) && ! in_array( $field['field_type'], array( 'hidden', 'consent', 'static_text' ), true ) ) { ?>
			<label <?php $this->print_render_attribute_string( $label_key ); ?>>
				<?php echo wp_kses_post( $field['field_label'] ); ?>
			</label>
			<?php
		}
	}

	/**
	 * Renders the control HTML for field.
	 *
	 * @since 1.5.0
	 *
	 * @param object $field Field data.
	 * @param string $field_key field key.
	 * @return void
	 */
	public function render_field_control( $field, $field_key ) {
		$settings   = $this->get_settings_for_display();
		$field_id   = 'field-' . $field['_id'];
		$field_name = $field['field_type'];
		$this->get_field_attrs( $field, $field_key );

		switch ( $field['field_type'] ) {
			case 'user_login':
			case 'first_name':
			case 'last_name':
				include $this->fields_dir . 'text.php';
				break;
			case 'user_email':
				include $this->fields_dir . 'email.php';
				break;
			case 'phone':
				include $this->fields_dir . 'phone.php';
				break;
			case 'user_pass':
			case 'confirm_user_pass':
				include $this->fields_dir . 'password.php';
				break;
			case 'user_url':
				include $this->fields_dir . 'url.php';
				break;
			case 'consent':
				include $this->fields_dir . 'consent.php';
				break;
			case 'static_text':
				include $this->fields_dir . 'static-text.php';
				break;
			default:
				if ( file_exists( $this->fields_dir . $field['field_type'] . '.php' ) ) {
					include $this->fields_dir . $field['field_type'] . '.php';
				}
				break;
		}
	}

	/**
	 * Renders the validation message HTML for field.
	 *
	 * @since 1.5.0
	 *
	 * @param object $field Object of field data.
	 */
	public function render_validation_msg( $field ) {
		if ( in_array( $field['field_type'], array( 'hidden', 'static_text' ), true ) ) {
			return;
		}
		if ( ! empty( $field['validation_msg'] ) ) {
			?>
			<span class="pp-rf-error pp-rf-error-custom"><?php echo wp_kses_post( $field['validation_msg'] ); ?></span>
		<?php } else { ?>
			<span class="pp-rf-error"><?php echo wp_kses_post( $this->get_custom_messages( 'field_required' ) ); ?></span>
			<?php
		}
	}

	/**
	 * Renders reCAPTCHA field.
	 *
	 * @since 1.5.0
	 *
	 * @return void
	 */
	public function render_recaptcha_field() {
		$settings              = $this->get_settings_for_display();
		$id                    = $this->get_id();
		$recaptcha_v2_site_key = PP_Admin_Settings::get_option( 'pp_recaptcha_site_key' );
		// Get reCAPTCHA V3 Site Key from PP admin settings.
		$recaptcha_v3_site_key = PP_Admin_Settings::get_option( 'pp_recaptcha_v3_site_key' );
		?>
		<div class="elementor-field-group pp-rf-field elementor-column elementor-col-100 elementor-mark-required" data-field-type="recaptcha">
			<?php
			$recaptcha_site_key      = 'invisible_v3' === $settings['recaptcha_validate_type'] ? $recaptcha_v3_site_key : $recaptcha_v2_site_key;
			$recaptcha_validate_type = 'invisible_v3' === $settings['recaptcha_validate_type'] ? 'invisible' : $settings['recaptcha_validate_type'];
			$recaptcha_theme         = $settings['recaptcha_theme'];
			include $this->fields_dir . 'recaptcha.php';
			?>
			<span class="pp-rf-error"><?php esc_attr_e( 'Please check the captcha to verify you are not a robot.', 'powerpack' ); ?></span>
		</div>
		<?php
	}

	/**
	 * Renders form button element.
	 *
	 * @since 1.5.0
	 *
	 * @return void
	 */
	public function render_button() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute(
			array(
				'button-wrap'            => array(
					'class' => array(
						'pp-rf-field',
						'pp-rf-button-wrap',
						'elementor-field-group',
						'elementor-column',
						'elementor-field-type-submit',
						'elementor-col-' . wp_kses_post( $settings['button_width'] ),
					),
				),
				'button'                 => array(
					'class' => 'elementor-button pp-button pp-submit-button',
					'role'  => 'button',
				),
				'button-content-wrapper' => array(
					'class' => 'pp-button-content',
				),
				'icon-align'             => array(
					'class' => array(
						empty( $settings['button_icon_align'] ) ? '' :
							'elementor-align-icon-' . $settings['button_icon_align'],
						'elementor-button-icon',
					),
				),
			)
		);

		if ( ! empty( $settings['button_size'] ) ) {
			$this->add_render_attribute( 'button', 'class', 'elementor-size-' . $settings['button_size'] );
		}

		/**
		 * Hook to add custom logic before rendering button.
		 *
		 * @since 1.5.0
		 *
		 * @param object $settings  Module settings.
		 */
		do_action( 'pp_rf_before_button_wrap', $settings );
		?>
		<div <?php $this->print_render_attribute_string( 'button-wrap' ); ?>>
			<button type="submit" <?php $this->print_render_attribute_string( 'button' ); ?>>
				<span <?php $this->print_render_attribute_string( 'button-content-wrapper' ); ?>>
					<?php if ( ! empty( $settings['button_icon'] ) && '' !== $settings['button_icon']['value'] ) : ?>
						<span <?php $this->print_render_attribute_string( 'icon-align' ); ?>>
							<?php Icons_Manager::render_icon( $settings['button_icon'], array( 'aria-hidden' => 'true' ) ); ?>
							<?php if ( empty( $settings['button_text'] ) ) : ?>
								<span class="elementor-screen-only"><?php esc_attr_e( 'Submit', 'powerpack' ); ?></span>
							<?php endif; ?>
						</span>
					<?php endif; ?>
					<?php if ( ! empty( $settings['button_text'] ) ) : ?>
						<span class="elementor-button-text pp-button-text"><?php echo wp_kses_post( $settings['button_text'] ); ?></span>
					<?php endif; ?>
				</span>
			</button>
		</div>
		<?php
		/**
		 * Hook to add custom logic after rendering button.
		 *
		 * @since 1.5.0
		 *
		 * @param object $settings  Module settings.
		 */
		do_action( 'pp_rf_after_button_wrap', $settings );
	}

	/**
	 * Custom messages for form.
	 *
	 * @since 1.5.0
	 *
	 * @param string $type Optional. Type of message.
	 * @return string|array
	 */
	public function get_custom_messages( $type = '' ) {
		$messages = array(
			'no_message'         => esc_html__( 'Registration successful!', 'powerpack' ),
			'on_fail'            => esc_html__( 'An error occurred. Please try again.', 'powerpack' ),
			'field_required'     => esc_html__( 'This field is required.', 'powerpack' ),
			'already_registered' => esc_html__( 'You are already registered.', 'powerpack' ),
		);

		/**
		 * Filters the array of messages.
		 *
		 * @since 1.5.0
		 *
		 * @param array $messages An array of messages to be printend in form.
		 */
		$filtered_msgs = apply_filters( 'pp_registration_form_custom_messages', $messages );

		if ( ! empty( $type ) ) {
			if ( isset( $filtered_msgs[ $type ] ) ) {
				return $filtered_msgs[ $type ];
			} elseif ( isset( $messages[ $type ] ) ) {
				return $messages[ $type ];
			} else {
				return '';
			}
		}

		return $filtered_msgs;
	}

	/**
	 * Check if reCaptcha is enabled
	 *
	 * @return bool
	 */
	public function is_recaptcha() {
		// Get reCAPTCHA Site Key from PP admin settings.
		$recaptcha_v2_site_key = PP_Admin_Settings::get_option( 'pp_recaptcha_site_key' );
		// Get reCAPTCHA Secret Key from PP admin settings.
		$recaptcha_v2_secret_key = PP_Admin_Settings::get_option( 'pp_recaptcha_secret_key' );
		// Get reCAPTCHA V3 Site Key from PP admin settings.
		$recaptcha_v3_site_key = PP_Admin_Settings::get_option( 'pp_recaptcha_v3_site_key' );
		// Get reCAPTCHA V3 Secret Key from PP admin settings.
		$recaptcha_v3_secret_key = PP_Admin_Settings::get_option( 'pp_recaptcha_v3_secret_key' );

		if ( ( $recaptcha_v2_site_key && $recaptcha_v2_secret_key ) || ( $recaptcha_v3_site_key && $recaptcha_v3_secret_key ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Render coupons widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings                    = $this->get_settings_for_display();
		$is_editor                   = \Elementor\Plugin::instance()->editor->is_edit_mode();
		$is_user_email_exists        = 0;
		$is_user_login_exists        = 0;
		$is_user_pass_exists         = 0;
		$is_confirm_user_pass_exists = 0;
		$is_first_name_exists        = 0;
		$is_last_name_exists         = 0;
		$is_user_url_exists          = 0;
		$is_phone_exists             = 0;
		$is_consent_exists           = 0;
		$is_static_text_exists       = 0;
		$is_pass_valid               = false;
		$is_confirm_pass             = false;

		$this->set_min_pass_length();
		$this->get_form_attrs();

		$fields = $settings['form_fields'];
		?>
		<?php if ( count( $fields ) ) : ?>

			<?php if ( 'yes' === $settings['hide_form'] && is_user_logged_in() && ! $is_editor ) { ?>
				<div class="pp-rf-loggedin-message">
					<?php
					if ( '' !== $settings['logged_in_text'] ) {
						echo wp_kses_post( $settings['logged_in_text'] );
					} else {
						echo wp_kses_post( $this->get_custom_messages( 'already_registered' ) );
					}
					?>
				</div>
			<?php } else { ?>
					<?php
					/**
					 * Solution Link: https://github.com/elementor/elementor/issues/7495#issuecomment-1019656235
					 */
					$exception = new \Exception();
					$trace = $exception->getTrace();
					$key = array_search( 'get_builder_content', array_column( $trace, 'function' ) );
					if ( $key ) {
						$template_id = $trace[ $key ]['args'][0];
					} else {
						$template_id = get_the_ID();
					}
					?>
					<?php ob_start(); ?>
					<div class="pp-rf-wrap" data-post-id="<?php echo esc_attr( $template_id ); ?>">
					<form <?php $this->print_render_attribute_string( 'form' ); ?>>
						<?php
						/**
						 * Hook to add custom content just after form opening tag.
						 *
						 * @since 1.5.0
						 *
						 * @param object $settings  Module settings.
						 */
						do_action( 'pp_rf_form_start', $settings );
						?>

						<div class="pp-rf-fields-wrap elementor-form-fields-wrapper elementor-labels-above">
							<?php
							$fields_rendered = array();
							$fields_missed   = array();

							$field_count = 0;
							foreach ( $fields as $field ) {
								$field_wrap_key = $this->get_repeater_setting_key( 'form_fields', 'field-wrap', $field_count );
								$field_key      = $this->get_repeater_setting_key( 'form_fields', 'field', $field_count );
								$label_key      = $this->get_repeater_setting_key( 'form_fields', 'label', $field_count );
								$this->get_field_wrap_attrs( $field, $field_wrap_key );

								if ( ! in_array( $field['field_type'], $fields_rendered, true ) ) {
									$fields_rendered[] = $field['field_type'];
								} else {
									echo '<span class="pp-rf-failed-error pp-rf-field-exist">';
									// translators: %1$s - field label, %2$s - field type.
									echo sprintf( esc_html__( '%1$s (%2$s) field is already exist.', 'powerpack' ), esc_html( $field['field_label'] ), esc_html( $field['field_type'] ) );
									echo '</span>';
									continue;
								}
								?>
								<div <?php $this->print_render_attribute_string( $field_wrap_key ); ?>>
									<?php $this->render_field_label( $field, $label_key ); ?>
									<?php $this->render_field_control( $field, $field_key ); ?>
									<?php $this->render_validation_msg( $field ); ?>
								</div>
								<?php
								$field_count++;
							}

							if ( ! in_array( 'user_email', $fields_rendered, true ) ) {
								echo '<span class="pp-rf-failed-error pp-error-fields-count">Email field is required!</span>';
								$fields_missed[] = 'user_email';
							}
							if ( ! in_array( 'user_pass', $fields_rendered, true ) ) {
								echo '<span class="pp-rf-failed-error pp-error-fields-count">Password field is required!</span>';
								$fields_missed[] = 'user_pass';
							}

							// Render reCAPTCHA field.
							if ( 'yes' === $settings['enable_recaptcha'] ) {
								$this->render_recaptcha_field();
							}

							// Render button.
							if ( count( $fields_missed ) < 1 ) {
								$this->render_button();
							}
							?>
						</div>

						<div class="pp-rf-links elementor-field-group elementor-column elementor-col-100">
						<?php if ( 'yes' === $settings['login'] && '' !== $settings['login_text'] ) { ?>
							<?php
							$login_url = wp_login_url();

							$this->add_render_attribute( 'login', 'class', 'pp-rf-footer-link' );

							if ( 'custom' === $settings['login_select'] && ! empty( $settings['login_url'] ) ) {

								$this->add_render_attribute( 'login', 'href', $settings['login_url']['url'] );

								if ( $settings['login_url']['is_external'] ) {
									$this->add_render_attribute( 'login', 'target', '_blank' );
								}

								if ( $settings['login_url']['nofollow'] ) {
									$this->add_render_attribute( 'login', 'rel', 'nofollow' );
								}
							} else {
								$this->add_render_attribute( 'login', 'href', $login_url );
							}
							?>

							<a <?php $this->print_render_attribute_string( 'login' ); ?>>
								<span><?php echo wp_kses_post( $settings['login_text'] ); ?></span>
							</a>
						<?php } ?>

							<?php
							if ( 'yes' === $settings['lost_password'] && '' !== $settings['lost_password_text'] ) {

								$lost_pass_url = wp_lostpassword_url();

								$this->add_render_attribute( 'lost_pass', 'class', 'pp-rf-footer-link' );

								if ( 'custom' === $settings['lost_password_select'] && ! empty( $settings['lost_password_url'] ) ) {

									$this->add_render_attribute( 'lost_pass', 'href', $settings['lost_password_url']['url'] );

									if ( $settings['lost_password_url']['is_external'] ) {
										$this->add_render_attribute( 'lost_pass', 'target', '_blank' );
									}

									if ( $settings['lost_password_url']['nofollow'] ) {
										$this->add_render_attribute( 'lost_pass', 'rel', 'nofollow' );
									}
								} else {
									$this->add_render_attribute( 'lost_pass', 'href', $lost_pass_url );
								}
								?>

								<a <?php $this->print_render_attribute_string( 'lost_pass' ); ?>>
									<span><?php echo wp_kses_post( $settings['lost_password_text'] ); ?></span>
								</a>
							<?php } ?>
						</div>

						<div class="pp-after-submit-action">
							<?php if ( ! empty( $settings['actions_array'] ) ) { ?>
								<?php if ( is_array( $settings['actions_array'] ) ) { ?>
									<?php if ( ! in_array( 'redirect', $settings['actions_array'], true ) && '' === $settings['show_success_message'] ) { ?>
										<span class="pp-rf-success-none" style="display:none;"><?php echo wp_kses_post( $this->get_custom_messages( 'no_message' ) ); ?></span>
									<?php } ?>
								<?php } else { ?>
									<?php if ( 'redirect' !== $settings['actions_array'] && '' === $settings['show_success_message'] ) { ?>
										<span class="pp-rf-success-none" style="display:none;"><?php echo wp_kses_post( $this->get_custom_messages( 'no_message' ) ); ?></span>
									<?php } ?>
								<?php } ?>
							<?php } ?>

							<span class="pp-rf-failed-error" style="display:none;"><?php echo wp_kses_post( $this->get_custom_messages( 'on_fail' ) ); ?></span>
						</div>

						<?php
						/**
						 * Hook to add custom content just before form closing tag.
						 *
						 * @since 1.5.0
						 *
						 * @param object $settings  Module settings.
						 */
						do_action( 'pp_rf_form_end', $settings );
						?>
					</form>

					<?php
						$this->add_render_attribute( 'success_messages', 'class', array( 'pp-after-submit-action', 'pp-rf-success' ) );

						if ('default' === $settings['message_wrap_style'] ) {
							$this->add_render_attribute( 'success_messages', 'class', 'elementor-alert elementor-alert-success' );
						} else {
							$this->add_render_attribute( 'success_messages', 'class', 'pp-success-custom-message' );
						}
					?>

					<?php if ( ! empty( $settings['actions_array'] ) && is_array( $settings['actions_array'] ) ) { ?>
						<?php if ( ! in_array( 'redirect', $settings['actions_array'], true ) && 'yes' === $settings['show_success_message'] ) { ?>
							<div <?php $this->print_render_attribute_string( 'success_messages' ); ?> style="display:none;">
								<span class="pp-rf-success-msg"><?php echo wp_kses_post( $settings['success_message'] ); ?></span>
							</div>
						<?php } ?>
					<?php } else { ?>
						<?php if ( 'redirect' !== $settings['actions_array'] && 'yes' === $settings['show_success_message'] ) { ?>
							<div <?php $this->print_render_attribute_string( 'success_messages' ); ?> style="display:none;">
								<span class="pp-rf-success-msg"><?php echo wp_kses_post( $settings['success_message'] ); ?></span>
							</div>
						<?php } ?>
					<?php } ?>
					</div>

					<?php
					$html                = ob_get_clean();
					$is_allowed_register = get_option( 'users_can_register' );
					$fields_check        = $this->get_field_type();
					$error_string        = '';

					foreach ( $settings['form_fields'] as $item_index => $item ) :
						$field_type = $item['field_type'];
						${ 'is_' . $field_type . '_exists' }++;

						if ( 'user_pass' === $field_type ) {
							$is_pass_valid = true;
						} elseif ( 'confirm_user_pass' === $field_type ) {
							$is_confirm_pass  = true;
						}
					endforeach;

					if ( $is_editor ) {
						//$form_fields = $settings['form_fields'];

						if ( $is_allowed_register ) {
							foreach ( $fields_check as $key => $value ) {
								$is_repeated = ${ 'is_' . $key . '_exists' };

								if ( isset( $is_repeated ) && 1 < $is_repeated ) {
									$error_string .= $value . ', ';
								}
							}
							if ( '' !== $error_string ) {
								$error_string = rtrim( $error_string, ', ' );
								?>
								<div class="pp-rf-register-error">
									<?php
									echo '<div class="elementor-alert elementor-alert-warning">';
									/* translators: %s: Error String */
									echo sprintf( esc_html__( 'Error! It seems you have added %s field in the form more than once.', 'powerpack' ), wp_kses_post( '<b>' . $error_string . '</b>' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
									echo '</div>';
									?>
								</div>
								<?php
								return false;
							}

							if ( isset( $is_user_email_exists ) && 0 === $is_user_email_exists ) {
								echo '<span class="pp-rf-failed-error pp-error-fields-count">';
								echo '<div class="elementor-alert elementor-alert-warning">';
								echo esc_attr__( 'Email field is required!', 'powerpack' );
								echo '</span>';
								return false;
							} elseif ( isset( $is_user_pass_exists ) && 0 === $is_user_pass_exists ) {
								echo '<span class="pp-rf-failed-error pp-error-fields-count">';
								echo '<div class="elementor-alert elementor-alert-warning">';
								echo esc_attr__( 'Password field is required!', 'powerpack' );
								echo '</span>';
								return false;
							} elseif ( $is_confirm_pass && ! $is_pass_valid ) {
								echo '<span class="pp-rf-failed-error pp-error-fields-count">';
								echo '<div class="elementor-alert elementor-alert-warning">';
								echo esc_attr__( 'Password field is required to use the Confirm Password field!', 'powerpack' );
								echo '</span>';
								return false;
							}

						} elseif ( is_multisite() ) {
							?>
							<div class="pp-rf-register-error">
								<?php echo esc_attr__( 'You must enable "User accounts may be registered" setting under Network Admin > Dashboard > Settings > "Allow new registrations"', 'powerpack' ); ?>
							</div>
							<?php
						} else {
							?>
							<div class="pp-rf-register-error">
								<?php echo esc_attr__( 'You must enable "Anyone can register" setting under Dashboard > Settings > General > Membership.', 'powerpack' ); ?>
							</div>
							<?php
						}
					} elseif ( ( ( ! $is_user_email_exists ) || ( ! $is_user_pass_exists ) || ( $is_confirm_pass && ! $is_pass_valid ) ) && ( ! $is_editor ) ) {
						return false;
					} elseif ( ! $is_allowed_register ) {
						return false;
					}
					echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				} ?>
			<?php
		endif;
	}

}
