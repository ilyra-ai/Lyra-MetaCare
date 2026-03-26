<?php
/**
 * PowerPack WooCommerce Cart widget.
 *
 * @package PowerPack
 */

namespace PowerpackElements\Modules\Woocommerce\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;

use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Image_Size;

if ( ! defined( 'ABSPATH' ) ) {
	exit;   // Exit if accessed directly.
}

/**
 * Class Woo_Offcanvas_Cart.
 */
class Woo_Offcanvas_Cart extends Powerpack_Widget {

	/**
	 * Retrieve Woo - Offcanvas Cart widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Woo_Offcanvas_Cart' );
	}

	/**
	 * Retrieve Woo - Offcanvas Cart widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Woo_Offcanvas_Cart' );
	}

	/**
	 * Retrieve Woo - Offcanvas Cart widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Woo_Offcanvas_Cart' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Woo - Offcanvas Cart widget belongs to.
	 *
	 * @since 1.3.7
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Woo_Offcanvas_Cart' );
	}

	/**
	 * Retrieve the list of scripts the Woo - Offcanvas Cart widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'pp-offcanvas-content',
		];
	}

	/**
	 * Retrieve the list of styles the Woo - Offcanvas Cart depended on.
	 *
	 * Used to set style dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_style_depends() {
		return [
			'pp-woocommerce',
			'widget-pp-offcanvas-content'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Woo - Offcanvas Cart widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* General Settings */
		$this->register_content_general_controls();

		/* Cart Button Settings */
		$this->register_content_cart_button_controls();

		/* Offcanvas Panel Settings */
		$this->register_panel_controls();

		/* Close Button Settings */
		$this->register_close_button_controls();

		/* Help Docs */
		$this->register_content_help_docs();

		/* Style Tab: Cart Button */
		$this->register_style_cart_button_controls();

		/* Style Tab: Off Canvas Panel */
		$this->register_style_offcanvas_controls();

		/* Style Tab: Item */
		$this->register_style_items_controls();

		/* Style Tab: Empty Cart Message */
		$this->register_style_empty_cart_message_controls();

		/* Style Tab: Subtotal */
		$this->register_style_subtotal_controls();

		/* Style Tab: Action Buttons */
		$this->register_style_buttons_controls();

		/* Style Tab: Close Button */
		$this->register_style_close_button_controls();
	}

	/**
	 * Register cat button controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_content_general_controls() {

		/**
		 * Content Tab: Toggle
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_general_settings',
			[
				'label'                 => esc_html__( 'General', 'powerpack' ),
			]
		);

		$this->add_control(
			'toggle_source',
			[
				'label'                 => esc_html__( 'Trigger', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'button',
				'options'               => [
					'button'        => esc_html__( 'Button', 'powerpack' ),
					'element-class' => esc_html__( 'Element Class', 'powerpack' ),
					'element-id'    => esc_html__( 'Element ID', 'powerpack' ),
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'toggle_class',
			[
				'label'                 => esc_html__( 'Trigger CSS Class', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active' => true,
				],
				'ai'                    => [
					'active' => false,
				],
				'default'               => '',
				'frontend_available'    => true,
				'condition'             => [
					'toggle_source'     => 'element-class',
				],
			]
		);

		$this->add_control(
			'toggle_id',
			[
				'label'                 => esc_html__( 'Trigger CSS ID', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active' => true,
				],
				'ai'                    => [
					'active' => false,
				],
				'default'               => '',
				'frontend_available'    => true,
				'condition'             => [
					'toggle_source'     => 'element-id',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register cat button controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_content_cart_button_controls() {

		$this->start_controls_section(
			'section_settings',
			[
				'label'                 => esc_html__( 'Cart Button', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_CONTENT,
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'icon_style',
			[
				'label'                 => esc_html__( 'Style', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'icon',
				'options'               => [
					'icon'      => esc_html__( 'Icon only', 'powerpack' ),
					'icon_text' => esc_html__( 'Icon + Text', 'powerpack' ),
					'text'      => esc_html__( 'Text only', 'powerpack' ),
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_text',
			[
				'label'                 => esc_html__( 'Text', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => esc_html__( 'Cart', 'powerpack' ),
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'text' ],
				],
			]
		);

		$this->add_control(
			'icon_type',
			[
				'label'                 => esc_html__( 'Icon Type', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'options'               => [
					'icon'  => array(
						'title' => esc_html__( 'Icon', 'powerpack' ),
						'icon'  => 'eicon-star',
					),
					'image' => array(
						'title' => esc_html__( 'Image', 'powerpack' ),
						'icon'  => 'eicon-image-bold',
					),
				],
				'default'               => 'icon',
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
				],
			]
		);

		$this->add_control(
			'icon',
			[
				'label'                 => esc_html__( 'Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'default'               => [
					'value'     => 'fas fa-shopping-cart',
					'library'   => 'fa-solid',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style'    => [ 'icon_text', 'icon' ],
					'icon_type'     => 'icon',
				],
			]
		);

		$this->add_control(
			'icon_image',
			[
				'label'                 => esc_html__( 'Image Icon', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'   => true,
				],
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
					'icon_type' => 'image',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'icon_image',
				'default'               => 'full',
				'separator'             => 'none',
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
					'icon_type' => 'image',
				],
			]
		);

		$this->add_control(
			'counter_position',
			[
				'label'                 => esc_html__( 'Counter Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'top',
				'options'               => [
					'none'      => esc_html__( 'None', 'powerpack' ),
					'top'       => esc_html__( 'Bubble', 'powerpack' ),
					'after'     => esc_html__( 'After Button', 'powerpack' ),
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'hide_empty',
			[
				'label'                 => esc_html__( 'Hide Empty', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'default'               => '',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'show_subtotal',
			[
				'label'                 => esc_html__( 'Subtotal', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'return_value'          => 'yes',
				'default'               => 'yes',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'toggle_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'inline',
				'options'               => [
					'inline'        => esc_html__( 'Inline', 'powerpack' ),
					'floating'      => esc_html__( 'Floating', 'powerpack' ),
				],
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
				],
			]
		);

		$this->add_control(
			'floating_toggle_placement',
			[
				'label'                 => esc_html__( 'Placement', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'middle-right',
				'options'               => [
					'top-left'      => esc_html__( 'Top Left', 'powerpack' ),
					'top-center'    => esc_html__( 'Top Center', 'powerpack' ),
					'top-right'     => esc_html__( 'Top Right', 'powerpack' ),
					'middle-left'   => esc_html__( 'Middle Left', 'powerpack' ),
					'middle-right'  => esc_html__( 'Middle Right', 'powerpack' ),
					'bottom-right'  => esc_html__( 'Bottom Right', 'powerpack' ),
					'bottom-center' => esc_html__( 'Bottom Center', 'powerpack' ),
					'bottom-left'   => esc_html__( 'Bottom Left', 'powerpack' ),
				],
				'prefix_class'          => 'pp-floating-element-align-',
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
					'toggle_position'   => 'floating',
				],
			]
		);

		$this->add_control(
			'toggle_zindex',
			[
				'label'                 => esc_html__( 'Z-Index', 'powerpack' ),
				'description'           => esc_html__( 'Adjust the z-index of the floating toggle. Defaults to 999', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => '999',
				'min'                   => 0,
				'step'                  => 1,
				'selectors'             => [
					'{{WRAPPER}} .pp-floating-element' => 'z-index: {{SIZE}};',
				],
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
					'toggle_position'   => 'floating',
				],
			]
		);

		$this->add_responsive_control(
			'button_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container'   => 'text-align: {{VALUE}};',
				],
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register toggle widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_panel_controls() {

		/**
		 * Content Tab: Off Canvas Panel
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_panel_settings',
			[
				'label'                 => esc_html__( 'Off Canvas Panel', 'powerpack' ),
			]
		);

		$this->add_control(
			'open_panel_add_to_cart',
			[
				'label'                 => esc_html__( 'Open Panel on Cart Button Click', 'powerpack' ),
				'description'           => esc_html__( 'Open Off Canvas cart panel when product is added to cart.', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'default'               => '',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'direction',
			[
				'label'                 => esc_html__( 'Direction', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'left',
				'options'               => [
					'left'          => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
					'top'         => [
						'title'     => esc_html__( 'Top', 'powerpack' ),
						'icon'      => 'eicon-v-align-top',
					],
					'bottom'         => [
						'title'     => esc_html__( 'Bottom', 'powerpack' ),
						'icon'      => 'eicon-v-align-bottom',
					],
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'content_transition',
			[
				'label'                 => esc_html__( 'Transition', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'slide',
				'options'               => [
					'slide'                 => esc_html__( 'Slide', 'powerpack' ),
					'reveal'                => esc_html__( 'Reveal', 'powerpack' ),
					'push'                  => esc_html__( 'Push', 'powerpack' ),
					'slide-along'           => esc_html__( 'Slide Along', 'powerpack' ),
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'cart_title',
			[
				'label'                 => esc_html__( 'Cart Title', 'powerpack' ),
				'description'           => esc_html__( 'Cart title is displayed on top of cart items.', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => esc_html__( 'PowerPack Off Canvas Cart', 'powerpack' ),
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'cart_message',
			[
				'label'                 => esc_html__( 'Cart Message', 'powerpack' ),
				'description'           => esc_html__( 'Cart message is displayed on bottom of cart items.', 'powerpack' ),
				'type'                  => Controls_Manager::TEXTAREA,
				'default'               => esc_html__( '100% Secure Checkout!', 'powerpack' ),
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register close button controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_close_button_controls() {

		/**
		 * Content Tab: Close Button
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_close_button_settings',
			[
				'label'                 => esc_html__( 'Close Button', 'powerpack' ),
			]
		);

		$this->add_control(
			'close_button',
			[
				'label'                 => esc_html__( 'Show Close Button', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'close_button_align',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'toggle'                => false,
				'options'               => [
					'left'          => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
				],
				'default'               => 'right',
				'condition'             => [
					'close_button'      => 'yes',
				],
			]
		);

		$this->add_control(
			'close_button_icon_type',
			[
				'label'                 => esc_html__( 'Close Icon', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'default',
				'options'               => [
					'default'   => esc_html__( 'Defaul Icon', 'powerpack' ),
					'icon'      => esc_html__( 'Choose Icon', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'close_button_icon',
			[
				'label'                 => esc_html__( 'Choose Close Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'default'               => [
					'value'     => 'fas fa-times',
					'library'   => 'fa-solid',
				],
				'recommended'           => [
					'fa-regular' => [
						'times-circle',
					],
					'fa-solid' => [
						'times',
						'times-circle',
					],
				],
				'condition'             => [
					'close_button'           => 'yes',
					'close_button_icon_type' => 'icon',
				],
			]
		);

		$this->add_control(
			'close_button_hover_animation',
			[
				'label'             => esc_html__( 'Hover Animation', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => '',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
			]
		);

		$this->add_control(
			'esc_close',
			[
				'label'             => esc_html__( 'Esc to Close', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => 'yes',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
			]
		);

		$this->add_control(
			'body_click_close',
			[
				'label'             => esc_html__( 'Click Overlay to Close', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => 'yes',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab
	 */
	/**
	 * Register Layout Controls.
	 *
	 * @access protected
	 */

	/**
	 * Style Tab: Cart
	 * -------------------------------------------------
	 */
	protected function register_style_offcanvas_controls() {

		$this->start_controls_section(
			'section_offcanvas_style',
			[
				'label' => esc_html__( 'Off Canvas Panel', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'offcanvas_bar_width',
			[
				'label'                 => esc_html__( 'Width', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'vw', 'custom' ],
				'default'               => [
					'size'      => 340,
					'unit'      => 'px',
				],
				'range'                 => [
					'px'        => [
						'min'   => 100,
						'max'   => 1000,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'#pp-offcanvas-{{ID}}' => 'width: {{SIZE}}{{UNIT}}',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-left .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-left .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-left .pp-offcanvas-container' => 'transform: translate3d({{SIZE}}{{UNIT}}, 0, 0)',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-right .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-right .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-right .pp-offcanvas-container' => 'transform: translate3d(-{{SIZE}}{{UNIT}}, 0, 0)',
				],
				'condition' => [
					'direction' => [ 'left', 'right' ],
				],
			]
		);

		$this->add_responsive_control(
			'offcanvas_bar_height',
			[
				'label'                 => esc_html__( 'Height', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'vh', 'custom' ],
				'default'               => [
					'size'      => 300,
					'unit'      => 'px',
				],
				'range'                 => [
					'px'        => [
						'min'   => 100,
						'max'   => 1000,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'#pp-offcanvas-{{ID}}.pp-offcanvas-top, #pp-offcanvas-{{ID}}.pp-offcanvas-bottom' => 'width: 100%; height: {{SIZE}}{{UNIT}}',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-top .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-top .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-top .pp-offcanvas-container' => 'transform: translate3d(0, {{SIZE}}{{UNIT}}, 0)',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-bottom .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-bottom .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-bottom .pp-offcanvas-container' => 'transform: translate3d(0, -{{SIZE}}{{UNIT}}, 0)',
				],
				'condition' => [
					'direction' => [ 'top', 'bottom' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'offcanvas_bar_bg',
				'label'                 => esc_html__( 'Background', 'powerpack' ),
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-inner',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'offcanvas_bar_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-inner',
			]
		);

		$this->add_responsive_control(
			'offcanvas_bar_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'default'               => [
					'top' => '10',
					'right' => '10',
					'bottom' => '10',
					'left' => '10',
					'unit' => 'px',
					'isLinked' => true,
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-inner' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'offcanvas_bar_box_shadow',
				'selector'              => '.pp-offcanvas-{{ID}}',
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'cart_title_heading',
			[
				'label'                 => esc_html__( 'Cart Title', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'cart_title!' => '',
				],
			]
		);

		$this->add_control(
			'cart_title_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-title' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'cart_title!' => '',
				],
			]
		);

		$this->add_control(
			'cart_title_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-title' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'cart_title!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'cart_title_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .pp-woo-menu-cart-title',
				'condition'             => [
					'cart_title!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'cart_title_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-title' => 'text-align: {{VALUE}};',
				],
				'condition'             => [
					'cart_title!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'cart_title_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-title' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'cart_title!' => '',
				],
			]
		);

		$this->add_control(
			'cart_message_heading',
			[
				'label'                 => esc_html__( 'Cart Message', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'cart_message!' => '',
				],
			]
		);

		$this->add_control(
			'cart_message_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-message' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'cart_message!' => '',
				],
			]
		);

		$this->add_control(
			'cart_message_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-message' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'cart_message!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'cart_message_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .pp-woo-menu-cart-message',
				'condition'             => [
					'cart_message!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'cart_message_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-message' => 'text-align: {{VALUE}};',
				],
				'condition'             => [
					'cart_message!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'cart_message_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'default'               => [
					'top' => '10',
					'right' => '0',
					'bottom' => '0',
					'left' => '0',
					'unit' => 'px',
					'isLinked' => false,
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-woo-menu-cart-message' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'cart_message!' => '',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Empty Cart Message
	 * -------------------------------------------------
	 */
	protected function register_style_empty_cart_message_controls() {
		$this->start_controls_section(
			'section_empty_cart_message_style',
			[
				'label'                 => esc_html__( 'Empty Cart Message', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'empty_cart_message_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-cart.pp-offcanvas-{{ID}} .woocommerce-mini-cart__empty-message' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'empty_cart_message_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-cart.pp-offcanvas-{{ID}} .woocommerce-mini-cart__empty-message',
			]
		);

		$this->add_responsive_control(
			'empty_cart_message_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-cart.pp-offcanvas-{{ID}} .woocommerce-mini-cart__empty-message' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Subtotal
	 * -------------------------------------------------
	 */
	protected function register_style_subtotal_controls() {
		$this->start_controls_section(
			'section_items_container_style',
			[
				'label'                 => esc_html__( 'Subtotal', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'subtotal_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .woocommerce-mini-cart__total' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'subtotal_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .woocommerce-mini-cart__total' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'subtotal_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}} .woocommerce-mini-cart__total',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'subtotal_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .woocommerce-mini-cart__total',
			]
		);

		$this->add_responsive_control(
			'subtotal_text_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .woocommerce-mini-cart__total'   => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'subtotal_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .woocommerce-mini-cart__total' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Cart Table
	 * -------------------------------------------------
	 */
	protected function register_style_items_controls() {
		$this->start_controls_section(
			'section_items_style',
			[
				'label'                 => esc_html__( 'Item', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'cart_items_row_separator_type',
			[
				'label'                 => esc_html__( 'Separator Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'solid',
				'options'               => [
					'none'      => esc_html__( 'None', 'powerpack' ),
					'solid'     => esc_html__( 'Solid', 'powerpack' ),
					'dotted'    => esc_html__( 'Dotted', 'powerpack' ),
					'dashed'    => esc_html__( 'Dashed', 'powerpack' ),
					'double'    => esc_html__( 'Double', 'powerpack' ),
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.product_list_widget li:not(:last-child)' => 'border-bottom-style: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_row_separator_color',
			[
				'label'                 => esc_html__( 'Separator Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.product_list_widget li:not(:last-child)' => 'border-bottom-color: {{VALUE}};',
				],
				'condition'             => [
					'cart_items_row_separator_type!' => 'none',
				],
			]
		);

		$this->add_responsive_control(
			'cart_items_row_separator_size',
			[
				'label'                 => esc_html__( 'Separator Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.product_list_widget li:not(:last-child)' => 'border-bottom-width: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'cart_items_row_separator_type!' => 'none',
				],
			]
		);

		$this->add_responsive_control(
			'cart_items_spacing',
			[
				'label'                 => esc_html__( 'Items Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items ul.product_list_widget li.woocommerce-mini-cart-item' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'cart_items_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items ul.product_list_widget li.woocommerce-mini-cart-item' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->start_controls_tabs( 'cart_items_rows_tabs_style' );

		$this->start_controls_tab(
			'cart_items_even_row',
			[
				'label'                 => esc_html__( 'Even Row', 'powerpack' ),
			]
		);

		$this->add_control(
			'cart_items_even_row_text_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item:nth-child(2n)' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_even_row_links_color',
			[
				'label'                 => esc_html__( 'Links Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item:nth-child(2n) a' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_even_row_background_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item:nth-child(2n)' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'cart_items_odd_row',
			[
				'label'                 => esc_html__( 'Odd Row', 'powerpack' ),
			]
		);

		$this->add_control(
			'cart_items_odd_row_text_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item:nth-child(2n+1)' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_odd_row_links_color',
			[
				'label'                 => esc_html__( 'Links Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item:nth-child(2n+1) a' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_odd_row_background_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item:nth-child(2n+1)' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'item_name_heading',
			[
				'label'                 => esc_html__( 'Item Name', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'item_name_text_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item a:not(.remove)' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'item_name_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item a:not(.remove)',
			]
		);

		$this->add_responsive_control(
			'item_name_bottom_spacing',
			[
				'label'                 => esc_html__( 'Bottom Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .mini_cart_item a:not(.remove)' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'cart_items_row_separator_type!' => 'none',
				],
			]
		);

		$this->add_control(
			'cart_items_image_heading',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'cart_items_image_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'options'               => [
					'left'  => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
				],
				'default'               => 'left',
				'selectors' => [
					'.pp-offcanvas-cart.pp-offcanvas-{{ID}} ul li.woocommerce-mini-cart-item a img' => 'float: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'cart_items_image_spacing',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-cart.pp-offcanvas-{{ID}} ul li.woocommerce-mini-cart-item a img' => 'margin-right: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'cart_items_image_width',
			[
				'label'                 => esc_html__( 'Width', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 10,
						'max' => 250,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-cart.pp-offcanvas-{{ID}} ul li.woocommerce-mini-cart-item a img' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'cart_items_price_heading',
			[
				'label'                 => esc_html__( 'Item Quantity & Price', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'cart_items_price_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .cart_list .quantity' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'cart_items_price_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .cart_list .quantity',
			]
		);

		$this->add_control(
			'cart_items_remove_icon_heading',
			[
				'label'                 => esc_html__( 'Remove Item Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'cart_items_remove_icon_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove' => 'font-size: {{SIZE}}{{UNIT}}; width: calc({{SIZE}}{{UNIT}} + 6px); height: calc({{SIZE}}{{UNIT}} + 6px);',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_cart_items_remove_icon_style' );

		$this->start_controls_tab(
			'tab_cart_items_remove_icon_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'cart_items_remove_icon_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove' => 'color: {{VALUE}} !important;',
				],
			]
		);

		$this->add_control(
			'cart_items_remove_icon_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_remove_icon_border_color',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove' => 'border-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_cart_items_remove_icon_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'cart_items_remove_icon_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove:hover' => 'color: {{VALUE}} !important;',
				],
			]
		);

		$this->add_control(
			'cart_items_remove_icon_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove:hover' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'cart_items_remove_icon_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'.pp-offcanvas-{{ID}} ul.cart_list li a.remove:hover' => 'border-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Buttons
	 * -------------------------------------------------
	 */
	protected function register_style_buttons_controls() {

		$this->start_controls_section(
			'section_buttons_style',
			[
				'label'                 => esc_html__( 'Buttons', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'buttons_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button',
			]
		);

		$this->add_control(
			'buttons_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'bottom',
				'options'               => [
					'after'     => esc_html__( 'After Products', 'powerpack' ),
					'bottom'    => esc_html__( 'Bottom', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'buttons_layout',
			[
				'label'                 => esc_html__( 'Layout', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'inline',
				'options'               => [
					'inline'        => esc_html__( 'Inline', 'powerpack' ),
					'stacked'       => esc_html__( 'Stacked', 'powerpack' ),
				],
			]
		);

		$this->add_responsive_control(
			'buttons_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					],
					'center'    => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					],
					'right'     => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					],
				],
				'default'               => '',
				'prefix_class'          => 'pp-woo-menu-cart-align-',
				'selectors'             => [
					'.pp-offcanvas-{{ID}}.pp-woo-cart-buttons-inline .buttons'   => 'text-align: {{VALUE}};',
				],
				'condition'             => [
					'buttons_layout' => 'inline',
				],
			]
		);

		$this->add_responsive_control(
			'buttons_gap',
			[
				'label'                 => esc_html__( 'Space Between', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 60,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}}.pp-woo-cart-buttons-inline .buttons .button.checkout.checkout' => 'margin-left: {{SIZE}}{{UNIT}};',
					'.pp-offcanvas-{{ID}}.pp-woo-cart-buttons-stacked .buttons .button.checkout.checkout' => 'margin-top: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'buttons_margin_top',
			[
				'label'                 => esc_html__( 'Margin Top', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 60,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-cart-items .buttons' => 'margin-top: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'buttons_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'view_cart_button_heading',
			[
				'label'                 => esc_html__( 'View Cart Button', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->start_controls_tabs( 'tabs_view_cart_button_style' );

		$this->start_controls_tab(
			'tab_view_cart_button_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'view_cart_button_bg_color_normal',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button:not(.checkout)' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'view_cart_button_text_color_normal',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button:not(.checkout)' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'view_cart_button_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button:not(.checkout)',
			]
		);

		$this->add_control(
			'view_cart_button_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button:not(.checkout)' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'view_cart_button_box_shadow',
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button:not(.checkout)',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_view_cart_button_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'view_cart_button_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button:not(.checkout):hover' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'view_cart_button_text_color_hover',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button:not(.checkout):hover' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'view_cart_button_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button:not(.checkout):hover' => 'border-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'view_cart_button_box_shadow_hover',
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button:not(.checkout):hover',
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->add_control(
			'checkout_button_heading',
			[
				'label'                 => esc_html__( 'Checkout Button', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->start_controls_tabs( 'tabs_checkout_button_style' );

		$this->start_controls_tab(
			'tab_checkout_button_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'checkout_button_bg_color_normal',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button.checkout' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'checkout_button_text_color_normal',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button.checkout' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'checkout_button_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button.checkout',
			]
		);

		$this->add_control(
			'checkout_button_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button.checkout' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'checkout_button_box_shadow',
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button.checkout',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_checkout_button_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'checkout_button_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button.checkout:hover' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'checkout_button_text_color_hover',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button.checkout:hover' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'checkout_button_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .buttons .button.checkout:hover' => 'border-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'checkout_button_box_shadow_hover',
				'selector'              => '.pp-offcanvas-{{ID}} .buttons .button.checkout:hover',
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Close Button
	 * -------------------------------------------------
	 */
	protected function register_style_close_button_controls() {

		$this->start_controls_section(
			'section_close_button_style',
			[
				'label'                 => esc_html__( 'Close Button', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'close_button'      => 'yes',
				],
			]
		);

		$this->add_control(
			'close_button_size',
			[
				'label'                 => esc_html__( 'Icon Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 10,
						'max' => 80,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'close_button'      => 'yes',
				],
			]
		);

		$this->add_control(
			'close_button_thickness',
			[
				'label'                 => esc_html__( 'Icon Thickness', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 1,
						'max' => 8,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close-icon:after, .pp-offcanvas-{{ID}} .pp-offcanvas-close-icon:before' => 'height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'close_button'      => 'yes',
					'close_button_icon_type' => 'default',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_close_button' );

		$this->start_controls_tab(
			'tab_close_button_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'close_button_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close' => 'color: {{VALUE}}',
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close-icon:after, .pp-offcanvas-{{ID}} .pp-offcanvas-close-icon:before' => 'background: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'close_button_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'close_button_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-close',
			]
		);

		$this->add_control(
			'close_button_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'close_button_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_close_button_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'close_button_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close:hover' => 'color: {{VALUE}}',
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close-icon:hover:after, .pp-offcanvas-{{ID}} .pp-offcanvas-close-icon:hover:before' => 'background: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'close_button_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close:hover' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_content_help_docs() {

		$help_docs = PP_Config::get_widget_help_links( 'Woo_Offcanvas_Cart' );

		if ( ! empty( $help_docs ) ) {

			/**
			 * Content Tab: Help Docs
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
			foreach ( $help_docs as $hd_title => $hd_link ) {
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
	 * Style Tab: Cart Button
	 * -------------------------------------------------
	 */
	protected function register_style_cart_button_controls() {

		$this->start_controls_section(
			'section_cart_button_style',
			[
				'label'                 => esc_html__( 'Cart Button', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'cart_button_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_cart_button' );

		$this->start_controls_tab(
			'tab_cart_button_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents' => 'background-color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'cart_button_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_responsive_control(
			'cart_button_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_cart_button_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents:hover' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents:hover' => 'background-color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-cart-container .pp-woo-cart-contents:hover' => 'border-color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->add_control(
			'cart_button_icon_heading',
			[
				'label'                 => esc_html__( 'Button Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
				],
			]
		);

		$this->add_control(
			'cart_button_icon_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-mini-cart-button-icon' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-icon svg' => 'fill: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
					'icon_type' => 'icon',
				],
			]
		);

		$this->add_control(
			'cart_button_icon_color_hover',
			[
				'label'                 => esc_html__( 'Hover Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-mini-cart-button-icon:hover' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-mini-cart-button-icon:hover svg' => 'fill: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
					'icon_type' => 'icon',
				],
			]
		);

		$this->add_responsive_control(
			'cart_button_icon_size',
			[
				'label'                 => esc_html__( 'Icon Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 5,
						'max' => 40,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-mini-cart-button-icon' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
					'icon_type' => 'icon',
				],
			]
		);

		$this->add_responsive_control(
			'cart_button_icon_img_size',
			[
				'label'                 => esc_html__( 'Icon Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => '',
				],
				'range'                => [
					'px' => [
						'min' => 10,
						'max' => 60,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-cart-contents-icon-image img' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
					'icon_type' => 'image',
				],
			]
		);

		$this->add_responsive_control(
			'cart_button_icon_spacing',
			[
				'label'                 => esc_html__( 'Icon Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 5,
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 40,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-menu-cart-button .pp-icon' => 'margin-left: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'icon_style' => [ 'icon_text', 'icon' ],
				],
			]
		);

		$this->add_control(
			'cart_button_counter_heading',
			[
				'label'                 => esc_html__( 'Counter', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_counter_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-cart-counter' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_counter_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-cart-counter' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-woo-menu-cart-counter-after .pp-cart-counter:before' => 'border-right-color: {{VALUE}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'cart_button_counter_gap',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'unit' => 'px',
				],
				'range'                 => [
					'px' => [
						'min' => 0,
						'max' => 20,
						'step' => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-menu-cart-counter-after .pp-cart-contents-count-after' => 'margin-left: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'counter_position' => 'after',
				],
			]
		);

		$this->add_control(
			'cart_button_counter_distance',
			[
				'label'                 => esc_html__( 'Distance', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'unit' => 'em',
				],
				'range'                 => [
					'em' => [
						'min' => 0,
						'max' => 4,
						'step' => 0.1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-cart-counter' => 'right: -{{SIZE}}{{UNIT}}; top: -{{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'counter_position' => 'top',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_counter() {
		$count = WC()->cart->get_cart_contents_count();
		?>
		<span class="pp-cart-counter" data-counter="<?php echo esc_attr( $count ); ?>"><?php echo esc_html( $count ); ?></span>
		<?php
	}

	/**
	 * Render output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_cart_icon() {
		$settings = $this->get_settings();

		if ( 'icon' === $settings['icon_type'] ) {
			?>
			<span class="pp-mini-cart-button-icon pp-icon">
				<?php
					\Elementor\Icons_Manager::render_icon( $settings['icon'], [
						'class' => 'pp-cart-contents-icon',
						'aria-hidden' => 'true',
					] );
				?>
			</span>
			<?php
		} elseif ( 'image' === $settings['icon_type'] && $settings['icon_image']['url'] ) { ?>
			<span class="pp-icon pp-cart-contents-icon-image">
				<?php
					echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'icon_image', 'icon_image' ) );
				?>
			</span>
			<?php
		}
	}

	/**
	 * Render output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_text() {
		$settings = $this->get_settings();
		?>
		<span class="pp-cart-contents-text"><?php echo wp_kses_post( $settings['cart_text'] ); ?></span>
		<?php
	}

	/**
	 * Render output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_subtotal() {
		$settings = $this->get_settings();

		$sub_total = WC()->cart->get_cart_subtotal();

		if ( 'yes' === $settings['show_subtotal'] ) {
			?>
			<span class="pp-cart-subtotal"><?php echo wp_kses_post( $sub_total ); ?></span>
			<?php
		}
	}

	/**
	 * Render output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		if ( null === WC()->cart ) {
			return;
		}

		$settings = $this->get_settings();

		$settings_attr = array(
			'toggle_source'           => esc_attr( $settings['toggle_source'] ),
			'toggle_id'               => esc_attr( $settings['toggle_id'] ),
			'toggle_class'            => esc_attr( $settings['toggle_class'] ),
			'content_id'              => esc_attr( $this->get_id() ),
			'transition'              => esc_attr( $settings['content_transition'] ),
			'direction'               => esc_attr( $settings['direction'] ),
			'esc_close'               => esc_attr( $settings['esc_close'] ),
			'body_click_close'        => esc_attr( $settings['body_click_close'] ),
			'buttons_position'        => esc_attr( $settings['buttons_position'] ),
			'open_panel_add_to_cart'  => esc_attr( $settings['open_panel_add_to_cart'] ),
		);

		$this->add_render_attribute( 'wrapper', 'class',
			[
				'pp-offcanvas-content-wrap',
				'pp-offcanvas-cart-container',
				'pp-woo-menu-cart-counter-' . $settings['counter_position'],
			]
		);

		if ( 'yes' === $settings['hide_empty'] ) {
			$this->add_render_attribute( 'wrapper', 'class', 'pp-woo-menu-cart-hide-empty' );
		}

		$this->add_render_attribute( 'wrapper', 'data-settings', htmlspecialchars( wp_json_encode( $settings_attr ) ) );

		$this->add_render_attribute( 'button', [
			'class' => [
				'pp-woo-cart-contents',
				'pp-offcanvas-toggle',
				'pp-woo-cart-' . $settings['icon_style'],
			],
			'title' => esc_html__( 'View your shopping cart', 'powerpack' ),
		] );

		$this->add_render_attribute( 'button', 'href', '#' );

		$this->add_render_attribute( 'offcanvas',
			[
				'class' => [
					'woocommerce',
					'pp-woo-menu-cart',
					'pp-offcanvas-cart',
					'pp-offcanvas-content',
					'pp-offcanvas-' . $this->get_id(),
					'pp-offcanvas-' . $settings_attr['transition'],
					'pp-offcanvas-' . $settings_attr['direction'],
					'pp-woo-cart-buttons-' . $settings['buttons_layout'],
				],
				'id' => [
					'pp-offcanvas-' . $this->get_id(),
				],
			]
		);

		$this->add_render_attribute( 'cart-button', 'class', 'pp-woo-menu-cart-button' );

		if ( 'floating' === $settings['toggle_position'] ) {
			$this->add_render_attribute( 'cart-button', 'class', 'pp-floating-element' );
		}
		?>
		<?php do_action( 'pp_woo_before_offcanvas_cart_wrap' ); ?>

		<div <?php $this->print_render_attribute_string( 'wrapper' ); ?>>
			<div <?php $this->print_render_attribute_string( 'offcanvas' ); ?>>
				<div class="pp-offcanvas-inner">
					<div class="pp-offcanvas-wrap">
						<div class="pp-offcanvas-cart-header">
							<?php if ( 'yes' === $settings['close_button'] ) { ?>
								<?php
									$close_animation = $settings['close_button_hover_animation'];

									$close_animation_class = ( 'yes' === $close_animation ) ? 'pp-offcanvas-close-animation' : '';
								?>
								<?php if ( 'default' === $settings['close_button_icon_type'] ) { ?>
									<div class="pp-offcanvas-close pp-offcanvas-close-<?php echo esc_attr( $settings['close_button_align'] ) . ' ' . esc_attr( $close_animation_class ); ?> pp-offcanvas-close-icon">
									</div>
								<?php } else { ?>
									<div class="pp-offcanvas-close pp-offcanvas-close-<?php echo esc_attr( $settings['close_button_align'] ) . ' ' . esc_attr( $close_animation_class ); ?> pp-icon">
										<?php
											\Elementor\Icons_Manager::render_icon( $settings['close_button_icon'], [ 'aria-hidden' => 'true' ] );
										?>
									</div>
								<?php } ?>
							<?php } ?>

							<?php if ( $settings['cart_title'] ) { ?>
								<div class="pp-woo-menu-cart-title">
									<?php echo wp_kses_post( $settings['cart_title'] ); ?>
								</div>
							<?php } ?>
						</div>

						<div class="pp-offcanvas-cart-items">
							<div class="widget_shopping_cart_content"><?php woocommerce_mini_cart(); ?></div>
						</div>

						<?php if ( $settings['cart_message'] ) { ?>
							<div class="pp-woo-menu-cart-message">
								<?php echo wp_kses_post( $this->parse_text_editor( $settings['cart_message'] ) ); ?>
							</div>
						<?php } ?>
					</div>
				</div>
			</div>

			<?php
				$has_placeholder = true;
				$placeholder = '';
			?>

			<?php if ( 'button' === $settings['toggle_source'] ) { ?>
				<?php
				if ( 'floating' === $settings['toggle_position'] ) {
					$has_placeholder = true;
					$placeholder .= esc_html__( 'Offcanvas toggle is floating.', 'powerpack' );
				} else {
					$has_placeholder = false;
				}
				?>
				<span <?php $this->print_render_attribute_string( 'cart-button' ); ?>>
					<a <?php $this->print_render_attribute_string( 'button' ); ?>>
						<span class="pp-cart-button-wrap">
							<?php
							if ( 'icon' === $settings['icon_style'] ) {

								$this->render_subtotal();
								$this->render_cart_icon();

							} elseif ( 'icon_text' === $settings['icon_style'] ) {

								$this->render_text();
								$this->render_subtotal();
								$this->render_cart_icon();

							} else {

								$this->render_text();
								$this->render_subtotal();

							}
							?>
						</span>

						<?php if ( 'top' === $settings['counter_position'] ) { ?>
							<span class="pp-cart-contents-count">
								<?php $this->render_counter(); ?>
							</span>
						<?php } ?>
					</a>

					<?php if ( 'after' === $settings['counter_position'] ) { ?>
						<span class="pp-cart-contents-count-after">
							<?php $this->render_counter(); ?>
						</span>
					<?php } ?>
				</span>
			<?php } else {
				$has_placeholder = true;
				$placeholder .= esc_html__( 'You have selected to open offcanvas bar using another element.', 'powerpack' );
			}

			if ( $has_placeholder ) {
				$placeholder .= ' ' . esc_html__( 'This placeholder will not be shown on the live page.', 'powerpack' );

				echo wp_kses_post( $this->render_editor_placeholder( [
					'body' => $placeholder,
				] ) );
			}
			?>
		</div>

		<?php do_action( 'pp_woo_after_offcanvas_cart_wrap' ); ?>
		<?php
	}
}
