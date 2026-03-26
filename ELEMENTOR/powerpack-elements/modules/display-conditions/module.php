<?php
namespace PowerpackElements\Modules\DisplayConditions;

use PowerpackElements\Base\Module_Base;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * \Modules\DisplayConditions\Module
 *
 * @since  2.2.2
 */
class Module extends Module_Base {

	/**
	 * Display Conditions
	 *
	 * Holds all the conditions for display on the frontend
	 *
	 * @since 1.4.7
	 * @access protected
	 *
	 * @var bool
	 */
	protected $conditions = [];

	/**
	 * Display Conditions
	 *
	 * Holds all the conditions classes
	 *
	 * @since 1.4.7
	 * @access protected
	 *
	 * @var bool
	 */
	protected $_conditions = [];

	/**
	 * Conditions Repeater
	 *
	 * The repeater control
	 *
	 * @since 1.4.13
	 * @access protected
	 *
	 * @var bool
	 */
	protected $_conditions_repeater;

	const USER_GROUP        = 'user';
	const SINGLE_GROUP      = 'single';
	const ARCHIVE_GROUP     = 'archive';
	const DATE_TIME_GROUP   = 'date_time';
	const ACF_GROUP         = 'acf';
	const PODS_GROUP        = 'pods';
	const EDD_GROUP         = 'edd';
	const MISC_GROUP        = 'misc';
	const WOO_GROUP         = 'woo';

	public function get_groups() {
		return [
			self::USER_GROUP => [
				'label' => esc_html__( 'User', 'powerpack' ),
			],
			self::SINGLE_GROUP => [
				'label' => esc_html__( 'Singular', 'powerpack' ),
			],
			self::ARCHIVE_GROUP => [
				'label' => esc_html__( 'Archive', 'powerpack' ),
			],
			self::DATE_TIME_GROUP => [
				'label' => esc_html__( 'Date and Time', 'powerpack' ),
			],
			self::ACF_GROUP => [
				'label' => esc_html__( 'Advanced Custom Fields', 'powerpack' ),
			],
			self::PODS_GROUP => [
				'label' => esc_html__( 'Pods', 'powerpack' ),
			],
			self::MISC_GROUP => [
				'label' => esc_html__( 'Misc', 'powerpack' ),
			],
			self::WOO_GROUP => [
				'label' => esc_html__( 'WooCommerce', 'powerpack' ),
			],
		];
	}

	/**
	 * Display Conditions
	 *
	 * Holds all the conditions for display on the frontend
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var bool
	 */
	protected $conditions_options = [];

	public function __construct() {
		parent::__construct();

		$this->register_conditions();
	}

	/**
	 * @since 1.4.7
	 */
	public function register_conditions() {

		$available_conditions = [
			// User
			'authentication',
			'user',
			'role',
			'visitor_type',

			// Singular
			'page',
			'post',
			'static_page',
			'post_term',
			'post_type',

			// Archive
			'taxonomy_archive',
			'term_archive',
			'post_type_archive',
			'date_archive',
			'author_archive',
			'search_results',

			// Date & Time
			'date',
			'date_time_before',
			'time',
			'day',

			// ACF
			'acf_text',
			'acf_choice',
			'acf_true_false',
			'acf_post',
			'acf_taxonomy',
			'acf_date_time',

			// ACF
			'pods_text',
			'pods_date_time',
			'pods_yes_no',

			// Misc
			'os',
			'browser',
			'device_type',
			'search_bot',
			'shortcode',
			'request_parameter',

			// WooCommerce
			'woo_product_category',
			'woo_product_price',
			'woo_product_rating',
			'woo_product_stock',
			'woo_product_type',
			'woo_cart_products_category',
			'woo_cart_products_count',
			'woo_cart_products',
			'woo_cart_total',
			'woo_cart_subtotal',
			'woo_category_page',
			'woo_last_purchase',
			'woo_orders_placed',
			'woo_purchased_category',
		];

		foreach ( $available_conditions as $condition_name ) {

			$class_name = str_replace( '-', ' ', $condition_name );
			$class_name = str_replace( ' ', '', ucwords( $class_name ) );
			$class_name = __NAMESPACE__ . '\\Conditions\\' . $class_name;

			if ( class_exists( $class_name ) ) {
				if ( $class_name::is_supported() ) {
					$this->_conditions[ $condition_name ] = $class_name::instance();
				}
			}
		}
	}

	/**
	 * @param string $condition_name
	 *
	 * @return Module_Base|Module_Base[]
	 */
	public function get_conditions( $condition_name = null ) {
		if ( $condition_name ) {
			if ( isset( $this->_conditions[ $condition_name ] ) ) {
				return $this->_conditions[ $condition_name ];
			}
			return null;
		}

		return $this->_conditions;
	}

	/**
	 * Set conditions.
	 *
	 * Sets the conditions property to all conditions comparison values
	 *
	 * @since 1.4.7
	 * @access protected
	 * @static
	 *
	 * @param mixed  $conditions  The conditions from the repeater field control
	 *
	 * @return void
	 */
	protected function set_conditions( $id, $conditions = [] ) {
		if ( ! $conditions ) {
			return;
		}

		foreach ( $conditions as $index => $condition ) {

			$key        = $condition['pp_condition_key'];
			$name       = null;

			if ( array_key_exists( 'pp_condition_' . $key . '_name', $condition ) ) {
				$name = $condition[ 'pp_condition_' . $key . '_name' ];
			}

			if ( 'woo_cart_total' === $key || 'woo_cart_subtotal' === $key || 'woo_product_price' === $key || 'woo_product_rating' === $key || 'woo_product_stock' === $key || 'woo_cart_items_count' === $key || 'woo_orders_placed' === $key ) {
				$operator = $condition['pp_condition_operator_advanced'];
			} else if ( 'woo_last_purchase' === $key ) {
				$operator = $condition['pp_condition_operator_date'];
			} else {
				$operator = $condition['pp_condition_operator'];
			}
			$value      = $condition[ 'pp_condition_' . $key . '_value' ];

			$_condition = $this->get_conditions( $key );

			if ( ! $_condition ) {
				continue;
			}

			$_condition->set_element_id( $id );

			$check = $_condition->check( $name, $operator, $value );

			$this->conditions[ $id ][ $key . '_' . $condition['_id'] ] = $check;
		}
	}

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since  1.4.7
	 * @return string
	 */
	public function get_name() {
		return 'display-conditions';
	}

	/**
	 * Add Actions
	 *
	 * @since 1.4.7
	 *
	 * @access protected
	 */
	public function add_actions() {
		// Activate controls for widgets
		add_action( 'elementor/element/common/section_powerpack_elements_advanced/before_section_end', function( $element, $args ) {
			$this->add_controls( $element, $args );
		}, 10, 2 );

		// Activate controls for columns
		add_action( 'elementor/element/column/section_powerpack_elements_advanced/before_section_end', function( $element, $args ) {
			$this->add_controls( $element, $args );
		}, 10, 2 );

		// Activate controls for sections
		add_action( 'elementor/element/section/section_powerpack_elements_advanced/before_section_end', function( $element, $args ) {
			$this->add_controls( $element, $args );
		}, 10, 2 );

		// Activate controls for containers
		add_action( 'elementor/element/container/section_powerpack_elements_advanced/before_section_end', function( $element, $args ) {
			$this->add_controls( $element, $args );
		}, 10, 2 );

		// Conditions for widgets
		add_filter( 'elementor/frontend/widget/should_render', array( $this, 'render_content' ), 10, 2 );
		add_action( 'elementor/frontend/widget/before_render', array( $this, 'before_render' ), 10, 1 );

		// Conditions for columns
		add_filter( 'elementor/frontend/column/should_render', array( $this, 'render_content' ), 10, 2 );
		add_action( 'elementor/frontend/column/before_render', array( $this, 'before_render' ), 10, 1 );

		// Conditions for sections
		add_filter( 'elementor/frontend/section/should_render', array( $this, 'render_content' ), 10, 2 );
		add_action( 'elementor/frontend/section/before_render', array( $this, 'before_render' ), 10, 1 );

		// Conditions for containers
		add_filter( 'elementor/frontend/container/should_render', array( $this, 'render_content' ), 10, 2 );
		add_action( 'elementor/frontend/container/before_render', array( $this, 'before_render' ), 10, 1 );
	}

	/**
	 * Render content based on conditions
	 *
	 * @since 2.7.2
	 *
	 * @param bool  $should_render return boolean value.
	 * @param array $element return controls.
	 *
	 * @return bool
	 */
	public function render_content( $should_render, $element ) {
		$settings = $element->get_settings();

		if ( ! empty( $settings['pp_display_conditions_enable'] ) && 'yes' === $settings['pp_display_conditions_enable'] ) {
			$id = $element->get_id();

			// Set the conditions
			$this->set_conditions( $id, $settings['pp_display_conditions'] );

			if ( ! $this->is_visible( $id, $settings['pp_display_conditions_relation'] ) ) { // Check the conditions
				if ( 'yes' === $settings['pp_display_conditions_output'] ) {
					$should_render = true;
				} else {
					$should_render = false;
				}
			}
		}

		return $should_render;
	}

	/**
	 * Render Display Conditions output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 2.8.3
	 * @access public
	 * @param object $element for current element.
	 */
	public function before_render( $element ) {
		$settings = $element->get_settings();

		if ( ! empty( $settings['pp_display_conditions_enable'] ) && 'yes' === $settings['pp_display_conditions_enable'] ) {

			// Set the conditions
			$this->set_conditions( $element->get_id(), $settings['pp_display_conditions'] );

			if ( ! $this->is_visible( $element->get_id(), $settings['pp_display_conditions_relation'] ) ) { // Check the conditions
				$element->add_render_attribute( '_wrapper', 'class', 'pp-visibility-hidden' );
			}
		}
	}

	/**
	 * Add Controls
	 *
	 * @since 1.4.7
	 *
	 * @access private
	 */
	public function add_controls( $element, $args ) {

		$element_type = $element->get_type();

		$element->add_control(
			'pp_display_conditions_enable',
			[
				'label'         => esc_html__( 'Display Conditions', 'powerpack' ),
				'type'          => Controls_Manager::SWITCHER,
				'default'       => '',
				'label_on'      => esc_html__( 'Yes', 'powerpack' ),
				'label_off'     => esc_html__( 'No', 'powerpack' ),
				'return_value'  => 'yes',
			]
		);

		$element->add_control(
			'pp_display_conditions_output',
			[
				'label'         => esc_html__( 'Output HTML', 'powerpack' ),
				'description'   => sprintf( esc_html__( 'If enabled, the HTML code will exist on the page but the %s will be hidden using CSS.', 'powerpack' ), $element_type ),
				'default'       => '',
				'type'          => Controls_Manager::SWITCHER,
				'label_on'      => esc_html__( 'Yes', 'powerpack' ),
				'label_off'     => esc_html__( 'No', 'powerpack' ),
				'return_value'  => 'yes',
				'condition'     => [
					'pp_display_conditions_enable' => 'yes',
				],
			]
		);

		$element->add_control(
			'pp_display_conditions_relation',
			[
				'label'         => esc_html__( 'Display on', 'powerpack' ),
				'type'          => Controls_Manager::SELECT,
				'default'       => 'all',
				'options'       => [
					'all' => esc_html__( 'All conditions met', 'powerpack' ),
					'any' => esc_html__( 'Any condition met', 'powerpack' ),
				],
				'condition'     => [
					'pp_display_conditions_enable' => 'yes',
				],
			]
		);

		$this->_conditions_repeater = new Repeater();

		$this->_conditions_repeater->add_control(
			'pp_condition_key',
			[
				'type'          => Controls_Manager::SELECT,
				'default'       => 'authentication',
				'label_block'   => true,
				'groups'        => $this->get_conditions_options(),
			]
		);

		$this->add_name_controls();

		$this->_conditions_repeater->add_control(
			'pp_condition_operator',
			[
				'type'          => Controls_Manager::SELECT,
				'default'       => 'is',
				'label_block'   => true,
				'options'       => [
					'is'        => esc_html__( 'Is', 'powerpack' ),
					'not'       => esc_html__( 'Is not', 'powerpack' ),
				],
				'condition'     => [
					'pp_condition_key!' => [
						'woo_cart_items_count',
						'woo_cart_total',
						'woo_cart_subtotal',
						'woo_product_price',
						'woo_product_rating',
						'woo_product_stock',
						'woo_orders_placed',
						'woo_last_purchase'
					],
				],
			]
		);

		$this->_conditions_repeater->add_control(
			'pp_condition_operator_advanced',
			[
				'type'          => Controls_Manager::SELECT,
				'default'       => '>',
				'label_block'   => true,
				'options'       => [
					'==' => esc_html__( 'Is equal to', 'powerpack' ),
					'!=' => esc_html__( 'Is not equal to', 'powerpack' ),
					'<'  => esc_html__( 'Is less than', 'powerpack' ),
					'>'  => esc_html__( 'Is greater than', 'powerpack' ),
					'<=' => esc_html__( 'Is less than equal to', 'powerpack' ),
					'>=' => esc_html__( 'Is greater than equal to', 'powerpack' ),
				],
				'condition'     => [
					'pp_condition_key' => [
						'woo_cart_items_count',
						'woo_cart_total',
						'woo_cart_subtotal',
						'woo_product_price',
						'woo_product_rating',
						'woo_product_stock',
						'woo_orders_placed'
					],
				],
			]
		);

		$this->_conditions_repeater->add_control(
			'pp_condition_operator_date',
			[
				'type'          => Controls_Manager::SELECT,
				'default'       => '<',
				'label_block'   => true,
				'options'       => [
					'==' => esc_html__( 'On', 'powerpack' ),
					'<'  => esc_html__( 'Before', 'powerpack' ),
					'>'  => esc_html__( 'After', 'powerpack' ),
					'<=' => esc_html__( 'On or Before', 'powerpack' ),
					'>=' => esc_html__( 'On or After', 'powerpack' ),
				],
				'condition'     => [
					'pp_condition_key' => 'woo_last_purchase',
				],
			]
		);

		$this->add_value_controls();

		$element->add_control(
			'pp_display_conditions',
			[
				'label'     => esc_html__( 'Conditions', 'powerpack' ),
				'type'      => Controls_Manager::REPEATER,
				'default'   => [
					[
						'pp_condition_key'                  => 'authentication',
						'pp_condition_operator'             => 'is',
						'pp_condition_authentication_value' => 'authenticated',
					],
				],
				'condition'     => [
					'pp_display_conditions_enable' => 'yes',
				],
				'fields'        => $this->_conditions_repeater->get_controls(),
				'title_field'   => 'Condition',
			]
		);
	}

	/**
	 * Add Value Controls
	 *
	 * Loops through conditions and adds the controls
	 * which select the value to check
	 *
	 * @since 1.4.13.4
	 *
	 * @access private
	 * @return void
	 */
	private function add_name_controls() {
		if ( ! $this->_conditions ) {
			return;
		}

		foreach ( $this->_conditions as $_condition ) {

			if ( false === $_condition->get_name_control() ) {
				continue;
			}

			$condition_name     = $_condition->get_name();
			$control_key        = 'pp_condition_' . $condition_name . '_name';
			$control_settings   = $_condition->get_name_control();

			// Show this only if the user select this specific condition
			$control_settings['condition'] = [
				'pp_condition_key' => $condition_name,
			];

			//
			$this->_conditions_repeater->add_control( $control_key, $control_settings );
		}
	}

	/**
	 * Add Value Controls
	 *
	 * Loops through conditions and adds the controls
	 * which select the value to check
	 *
	 * @since 1.4.13
	 *
	 * @access private
	 * @return void
	 */
	private function add_value_controls() {
		if ( ! $this->_conditions ) {
			return;
		}

		foreach ( $this->_conditions as $_condition ) {

			$condition_name     = $_condition->get_name();
			$control_key        = 'pp_condition_' . $condition_name . '_value';
			$control_settings   = $_condition->get_value_control();

			// Show this only if the user select this specific condition
			$control_settings['condition'] = [
				'pp_condition_key' => $condition_name,
			];

			//
			$this->_conditions_repeater->add_control( $control_key, $control_settings );
		}
	}

	/**
	 * Set the Conditions options array
	 *
	 * @since 1.4.13
	 *
	 * @access private
	 */
	private function get_conditions_options() {

		$groups = $this->get_groups();

		foreach ( $this->_conditions as $_condition ) {
			$groups[ $_condition->get_group() ]['options'][ $_condition->get_name() ] = $_condition->get_title();
		}

		return $groups;
	}

	/**
	 * Check conditions.
	 *
	 * Checks for all or any conditions and returns true or false
	 * depending on wether the content can be shown or not
	 *
	 * @since 1.4.7
	 * @access protected
	 * @static
	 *
	 * @param mixed  $relation  Required conditions relation
	 *
	 * @return bool
	 */
	protected function is_visible( $id, $relation ) {

		if ( ! array_key_exists( $id, $this->conditions ) ) {
			return;
		}

		if ( ! \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			if ( 'any' === $relation ) {
				if ( ! in_array( true, $this->conditions[ $id ] ) ) {
					return false;
				}
			} else {
				if ( in_array( false, $this->conditions[ $id ] ) ) {
					return false;
				}
			}
		}

		return true;
	}
}
