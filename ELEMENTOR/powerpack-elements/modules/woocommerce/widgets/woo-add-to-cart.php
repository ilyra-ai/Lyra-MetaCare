<?php
/**
 * PowerPack WooCommerce Add To Cart Button.
 *
 * @package PowerPack
 */

namespace PowerpackElements\Modules\Woocommerce\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;

use Elementor\Controls_Manager;
use Elementor\Icons_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;

if ( ! defined( 'ABSPATH' ) ) {
	exit;   // Exit if accessed directly.
}

/**
 * Woo - Add To Cart widget
 */
class Woo_Add_To_Cart extends Powerpack_Widget {

	/**
	 * Retrieve Woo - Add To Cart Widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Woo_Add_To_Cart' );
	}

	/**
	 * Retrieve Woo - Add To Cart Widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Woo_Add_To_Cart' );
	}

	/**
	 * Retrieve Woo - Add To Cart Widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Woo_Add_To_Cart' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Woo - Add To Cart widget belongs to.
	 *
	 * @since 1.4.13.1
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Woo_Add_To_Cart' );
	}

	/**
	 * Retrieve the list of scripts the Woo - Add to Cart widget depended on.
	 *
	 * @access public
	 *
	 * @return array scripts.
	 */
	public function get_script_depends() {
		return array( 'pp-woo-add-to-cart' );
	}

	/**
	 * Retrieve the list of styles the Woo - Add to Cart widget depended on.
	 *
	 * Used to set style dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_style_depends() {
		return array(
			'pp-woocommerce',
		);
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Woo - Add to Cart widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Product Control */
		$this->register_content_product_controls();

		/* Button Control */
		$this->register_content_button_controls();

		/* Button Style */
		$this->register_style_button_controls();

		/* Quantity Style */
		$this->register_style_quantity_controls();

		/* Variations Style */
		$this->register_style_variations_controls();
	}

	public function unescape_html( $safe_text, $text ) {
		return $text;
	}

	/**
	 * Register Content Product Controls.
	 *
	 * @access protected
	 */
	protected function register_content_product_controls() {

		$this->start_controls_section(
			'section_product_field',
			array(
				'label' => esc_html__( 'Product', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'dynamic_product',
			array(
				'label'        => esc_html__( 'Dynamic Product?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => '',
				'description'  => esc_html__( 'Enable this option and can use on single product page.', 'powerpack' ),
			)
		);

		$this->add_control(
			'product_id',
			array(
				'label'     => esc_html__( 'Select Product', 'powerpack' ),
				'type'      => 'pp-query-posts',
				'post_type' => 'product',
				'condition' => array(
					'dynamic_product' => '',
				),
			)
		);

		$this->add_control(
			'show_quantity',
			array(
				'label'     => esc_html__( 'Show Quantity', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Hide', 'powerpack' ),
				'label_on'  => esc_html__( 'Show', 'powerpack' ),
				'condition' => array(
					'dynamic_product' => '',
				),
			)
		);

		$this->add_control(
			'quantity',
			array(
				'label'     => esc_html__( 'Quantity', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 1,
				'condition' => array(
					'show_quantity' => '',
					'dynamic_product' => '',
				),
			)
		);

		$this->add_control(
			'enable_redirect',
			array(
				'label'        => esc_html__( 'Auto Redirect', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => '',
				'description'  => esc_html__( 'Enable this option to redirect cart page after the product gets added to cart', 'powerpack' ),
				'condition'    => array(
					'show_quantity' => '',
					'dynamic_product' => '',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register Content Button Controls.
	 *
	 * @access protected
	 */
	protected function register_content_button_controls() {
		$this->start_controls_section(
			'section_button_field',
			array(
				'label' => esc_html__( 'Button', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);
			$this->add_control(
				'btn_text',
				array(
					'label'   => esc_html__( 'Text', 'powerpack' ),
					'type'    => Controls_Manager::TEXT,
					'default' => esc_html__( 'Add to cart', 'powerpack' ),
					'dynamic' => array(
						'active' => true,
					),
					'condition'    => array(
						'dynamic_product' => '',
					),
				)
			);
			$this->add_responsive_control(
				'align',
				array(
					'label'        => esc_html__( 'Alignment', 'powerpack' ),
					'type'         => Controls_Manager::CHOOSE,
					'options'      => array(
						'left'    => array(
							'title' => esc_html__( 'Left', 'powerpack' ),
							'icon'  => 'eicon-text-align-left',
						),
						'center'  => array(
							'title' => esc_html__( 'Center', 'powerpack' ),
							'icon'  => 'eicon-text-align-center',
						),
						'right'   => array(
							'title' => esc_html__( 'Right', 'powerpack' ),
							'icon'  => 'eicon-text-align-right',
						),
						'justify' => array(
							'title' => esc_html__( 'Justified', 'powerpack' ),
							'icon'  => 'eicon-text-align-justify',
						),
					),
					'prefix_class' => 'pp-add-to-cart%s-align-',
					'default'      => 'left',
				)
			);
			$this->add_control(
				'btn_size',
				array(
					'label'   => esc_html__( 'Size', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'sm',
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
				'btn_padding',
				array(
					'label'      => esc_html__( 'Padding', 'powerpack' ),
					'type'       => Controls_Manager::DIMENSIONS,
					'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
					'selectors'  => array(
						'{{WRAPPER}} .elementor-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					),

				)
			);
			$this->add_control(
				'select_btn_icon',
				array(
					'label'            => esc_html__( 'Icon', 'powerpack' ),
					'type'             => Controls_Manager::ICONS,
					'fa4compatibility' => 'btn_icon',
					'default'          => array(
						'value'   => 'fas fa-shopping-cart',
						'library' => 'fa-solid',
					),
					'condition'    => array(
						'dynamic_product' => '',
					),
				)
			);
			$this->add_control(
				'btn_icon_align',
				[
					'label'                => esc_html__( 'Icon Position', 'powerpack' ),
					'type'                 => Controls_Manager::SELECT,
					'default'              => is_rtl() ? 'right' : 'left',
					'options'              => [
						'left'  => esc_html__( 'Before', 'powerpack' ),
						'right' => esc_html__( 'After', 'powerpack' ),
					],
					'selectors_dictionary' => [
						'left'  => is_rtl() ? 'row-reverse' : 'row',
						'right' => is_rtl() ? 'row' : 'row-reverse',
					],
					'selectors'            => [
						'{{WRAPPER}} .elementor-button-content-wrapper' => 'flex-direction: {{VALUE}};',
					],
					'condition'            => [
						'dynamic_product' => '',
					],
				]
			);
			$this->add_control(
				'btn_icon_indent',
				array(
					'label'      => esc_html__( 'Icon Spacing', 'powerpack' ),
					'type'       => Controls_Manager::SLIDER,
					'size_units' => array( 'px', 'em', 'rem', 'custom' ),
					'range'      => array(
						'px' => array(
							'max' => 50,
						),
					),
					'selectors'  => array(
						'{{WRAPPER}} .elementor-button-content-wrapper' => 'gap: {{SIZE}}{{UNIT}};',
					),
					'condition'  => array(
						'dynamic_product' => '',
					),
				)
			);
		$this->end_controls_section();
	}

	/**
	 * Register Style Button Controls.
	 *
	 * @access protected
	 */
	protected function register_style_button_controls() {

		$this->start_controls_section(
			'section_design_button',
			array(
				'label' => esc_html__( 'Button', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'button_typography',
				'selector' => '{{WRAPPER}} .pp-button',
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
			)
		);

		$this->start_controls_tabs( 'button_tabs_style' );

			$this->start_controls_tab(
				'button_normal',
				array(
					'label' => esc_html__( 'Normal', 'powerpack' ),
				)
			);

				$this->add_control(
					'button_color',
					array(
						'label'     => esc_html__( 'Text Color', 'powerpack' ),
						'type'      => Controls_Manager::COLOR,
						'selectors' => array(
							'{{WRAPPER}} .pp-button'     => 'color: {{VALUE}};',
							'{{WRAPPER}} .pp-button svg' => 'fill: {{VALUE}};',
						),
					)
				);

				$this->add_group_control(
					Group_Control_Background::get_type(),
					array(
						'name'           => 'button_background_color',
						'label'          => esc_html__( 'Background Color', 'powerpack' ),
						'types'          => array( 'classic', 'gradient' ),
						'selector'       => '{{WRAPPER}} .pp-button',
						'fields_options' => array(
							'color' => array(
								'global'                => [
									'default' => Global_Colors::COLOR_ACCENT,
								],
							),
						),
					)
				);

				$this->add_group_control(
					Group_Control_Border::get_type(),
					array(
						'name'        => 'button_border',
						'placeholder' => '',
						'default'     => '',
						'selector'    => '{{WRAPPER}} .pp-button',
					)
				);

				$this->add_control(
					'border_radius',
					array(
						'label'      => esc_html__( 'Border Radius', 'powerpack' ),
						'type'       => Controls_Manager::DIMENSIONS,
						'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
						'selectors'  => array(
							'{{WRAPPER}} .pp-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
						),
					)
				);

				$this->add_group_control(
					Group_Control_Box_Shadow::get_type(),
					array(
						'name'     => 'button_box_shadow',
						'selector' => '{{WRAPPER}} .pp-button',
					)
				);

				$this->add_control(
					'view_cart_color',
					array(
						'label'     => esc_html__( 'View Cart Text Color', 'powerpack' ),
						'type'      => Controls_Manager::COLOR,
						'global'                => [
							'default' => Global_Colors::COLOR_SECONDARY,
						],
						'selectors' => array(
							'{{WRAPPER}} .added_to_cart' => 'color: {{VALUE}};',
						),
						'condition' => array(
							'show_quantity' => '',
						),
					)
				);
			$this->end_controls_tab();

			$this->start_controls_tab(
				'button_hover',
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
							'{{WRAPPER}} .pp-button:focus, {{WRAPPER}} .pp-button:hover' => 'color: {{VALUE}};',
							'{{WRAPPER}} .pp-button:focus svg, {{WRAPPER}} .pp-button:hover svg' => 'fill: {{VALUE}};',
						),
					)
				);

				$this->add_group_control(
					Group_Control_Background::get_type(),
					array(
						'name'           => 'button_background_hover_color',
						'label'          => esc_html__( 'Background Color', 'powerpack' ),
						'types'          => array( 'classic', 'gradient' ),
						'selector'       => '{{WRAPPER}} .pp-button:focus, {{WRAPPER}} .pp-button:hover',
						'fields_options' => array(
							'color' => array(
								'global'                => [
									'default' => Global_Colors::COLOR_ACCENT,
								],
							),
						),
					)
				);

				$this->add_control(
					'button_border_hover_color',
					array(
						'label'     => esc_html__( 'Border Hover Color', 'powerpack' ),
						'type'      => Controls_Manager::COLOR,
						'global'                => [
							'default' => Global_Colors::COLOR_ACCENT,
						],
						'condition' => array(
							'button_border_border!' => '',
						),
						'selectors' => array(
							'{{WRAPPER}} .pp-button:focus, {{WRAPPER}} .pp-button:hover' => 'border-color: {{VALUE}};',
						),
					)
				);

				$this->add_control(
					'hover_animation',
					array(
						'label' => esc_html__( 'Hover Animation', 'powerpack' ),
						'type'  => Controls_Manager::HOVER_ANIMATION,
					)
				);

				$this->add_control(
					'view_cart_hover_color',
					array(
						'label'     => esc_html__( 'View Cart Text Color', 'powerpack' ),
						'type'      => Controls_Manager::COLOR,
						'selectors' => array(
							'{{WRAPPER}} .added_to_cart:hover' => 'color: {{VALUE}};',
						),
						'condition' => array(
							'show_quantity' => '',
						),
					)
				);

			$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register Style Quantity Controls.
	 *
	 * @access protected
	 */
	protected function register_style_quantity_controls() {

		$this->start_controls_section(
			'section_atc_quantity_style',
			[
				'label' => esc_html__( 'Quantity', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'spacing',
			[
				'label' => esc_html__( 'Spacing', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}} .quantity + .button, body:not(.rtl) {{WRAPPER}} .pp-add-to-cart-qty-ajax + .pp-button' => 'margin-left: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}} .quantity + .button, body.rtl {{WRAPPER}} .pp-add-to-cart-qty-ajax + .pp-button' => 'margin-right: {{SIZE}}{{UNIT}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'quantity_typography',
				'selector' => '{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax',
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'quantity_border',
				'selector' => '{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax',
				'exclude' => [ 'color' ],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'powerpack' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => [
					'{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_padding',
			[
				'label' => esc_html__( 'Padding', 'powerpack' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->start_controls_tabs( 'quantity_style_tabs' );

		$this->start_controls_tab( 'quantity_style_normal',
			[
				'label' => esc_html__( 'Normal', 'powerpack' ),
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_text_color',
			[
				'label' => esc_html__( 'Text Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax' => 'color: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_bg_color',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax' => 'background-color: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_border_color',
			[
				'label' => esc_html__( 'Border Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax' => 'border-color: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'quantity_style_focus',
			[
				'label' => esc_html__( 'Focus', 'powerpack' ),
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_text_color_focus',
			[
				'label' => esc_html__( 'Text Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .quantity .qty:focus, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax:focus' => 'color: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_bg_color_focus',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .quantity .qty:focus, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax:focus' => 'background-color: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_border_color_focus',
			[
				'label' => esc_html__( 'Border Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .quantity .qty:focus, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax:focus' => 'border-color: {{VALUE}}',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'quantity_transition',
			[
				'label' => esc_html__( 'Transition Duration', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.2,
				],
				'range' => [
					'px' => [
						'max' => 2,
						'step' => 0.1,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .quantity .qty, {{WRAPPER}} .pp-woo-add-to-cart .pp-add-to-cart-qty-ajax' => 'transition: all {{SIZE}}s',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'dynamic_product',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'show_quantity',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register Style Variations Controls.
	 *
	 * @access protected
	 */
	protected function register_style_variations_controls() {

		$this->start_controls_section(
			'section_atc_variations_style',
			[
				'label'      => esc_html__( 'Variations', 'powerpack' ),
				'tab'        => Controls_Manager::TAB_STYLE,
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_width',
			[
				'label'      => esc_html__( 'Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'    => [
					'unit' => '%',
				],
				'selectors'  => [
					'{{WRAPPER}} form.cart .variations' => 'width: {{SIZE}}{{UNIT}}',
				],
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_spacing',
			[
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => [
					'{{WRAPPER}} form.cart .variations' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_space_between',
			[
				'label'      => esc_html__( 'Space Between', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => [
					'{{WRAPPER}} form.cart table.variations tr:not(:last-child)' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'heading_variations_label_style',
			[
				'label'      => esc_html__( 'Label', 'powerpack' ),
				'type'       => Controls_Manager::HEADING,
				'separator'  => 'before',
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_label_color_focus',
			[
				'label' => esc_html__( 'Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} form.cart table.variations label' => 'color: {{VALUE}}',
				],
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_label_bg_color',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} form.cart table.variations td.label' => 'background-color: {{VALUE}}',
				],
				'conditions'         => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'       => 'variations_label_typography',
				'selector'   => '{{WRAPPER}} form.cart table.variations label',
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'heading_variations_select_style',
			[
				'label'      => esc_html__( 'Select field', 'powerpack' ),
				'type'       => Controls_Manager::HEADING,
				'separator'  => 'before',
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_select_color',
			[
				'label' => esc_html__( 'Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} form.cart table.variations td.value select' => 'color: {{VALUE}}',
				],
				'conditions'         => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_select_bg_color',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} form.cart table.variations td.value' => 'background-color: {{VALUE}}',
				],
				'conditions'         => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_select_border_color',
			[
				'label' => esc_html__( 'Border Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} form.cart table.variations td.value' => 'border: 1px solid {{VALUE}}',
				],
				'conditions'         => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'variations_select_typography',
				'selector' => '{{WRAPPER}} form.cart table.variations td.value select, {{WRAPPER}} form.cart table.variations td.value',
				'conditions'         => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->add_control(
			'variations_select_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => [
					'{{WRAPPER}} form.cart table.variations td.value' => 'border-radius: {{SIZE}}{{UNIT}}',
				],
				'conditions'         => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'dynamic_product',
							'operator' => '===',
							'value'    => 'yes',
						),
						array(
							'name'     => 'show_quantity',
							'operator' => '===',
							'value'    => 'yes',
						),
					),
				),
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render Woo Product Grid output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$node_id  = $this->get_id();

		if ( 'yes' === $settings['dynamic_product'] ) {
			do_action( 'pp_woo_builder_widget_before_render', $this );
			global $product;

			$product = wc_get_product();

			if ( empty( $product ) ) {
				return;
			}

			echo '<div class="pp-woo-add-to-cart pp-woo-product-' . esc_attr( wc_get_product()->get_type() ) . '">';
				ob_start();
				woocommerce_template_single_add_to_cart();
				$form = ob_get_clean();
				$form = str_replace( 'single_add_to_cart_button', 'single_add_to_cart_button elementor-button elementor-size-' . $settings['btn_size'] . ' pp-button', $form );
				echo $form;
			echo '</div>';
			do_action( 'pp_woo_builder_widget_after_render', $this );
		} else {
			$product  = false;

			if ( ! empty( $settings['product_id'] ) ) {
				$product_data = get_post( $settings['product_id'] );
			}

			$product = ! empty( $product_data ) && in_array( $product_data->post_type, array( 'product', 'product_variation' ) ) ? wc_setup_product_data( $product_data ) : false;

			if ( $product ) {
				if ( 'yes' === $settings['show_quantity'] ) {
					// $this->render_form_button( $product );
					$this->render_ajax_button( $product, true );
				} else {
					$this->render_ajax_button( $product );
				}
			} elseif ( current_user_can( 'manage_options' ) ) {
				$class = implode(
					' ',
					array_filter(
						array(
							'button',
							'pp-button',
							'elementor-button',
							'elementor-size-' . $settings['btn_size'],
							'elementor-animation-' . $settings['hover_animation'],
						)
					)
				);
				$this->add_render_attribute(
					'button',
					array( 'class' => $class )
				);

				echo '<div class="pp-woo-add-to-cart">';
				echo '<a ' . wp_kses_post( $this->get_render_attribute_string( 'button' ) ) . '>';
				echo esc_attr__( 'Please select the product', 'powerpack' );
				echo '</a>';
				echo '</div>';
			}
		}
	}

	/**
	 * @param \WC_Product $product
	 */
	private function render_ajax_button( $product, $show_quantity = false ) {
		$settings = $this->get_settings_for_display();
		$atc_html = '';

		if ( $product ) {

			$product_id   = $product->get_id();
			$product_type = $product->get_type();

			$class = array(
				'pp-button',
				'elementor-button',
				'elementor-animation-' . $settings['hover_animation'],
				'elementor-size-' . $settings['btn_size'],
				'product_type_' . $product_type,
				$product->is_purchasable() && $product->is_in_stock() ? 'add_to_cart_button' : '',
				$product->supports( 'ajax_add_to_cart' ) ? 'ajax_add_to_cart' : '',
			);

			if ( 'yes' === $settings['enable_redirect'] ) {
				$class[] = 'pp-redirect';
			}

			$this->add_render_attribute(
				'button',
				array(
					'rel'             => 'nofollow',
					'href'            => $product->add_to_cart_url(),
					'data-quantity'   => ( isset( $settings['quantity'] ) ? $settings['quantity'] : 1 ),
					'data-product_id' => $product_id,
					'class'           => $class,
				)
			);

			$this->add_render_attribute(
				'icon-align',
				'class',
				array(
					'elementor-button-icon',
				)
			);

			if ( ! isset( $settings['btn_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
				// add old default
				$settings['btn_icon'] = 'fa fa-shopping-cart';
			}

			$has_icon = ! empty( $settings['btn_icon'] );

			if ( $has_icon ) {
				$this->add_render_attribute( 'i', 'class', $settings['btn_icon'] );
				$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
			}

			if ( ! $has_icon && ! empty( $settings['select_btn_icon']['value'] ) ) {
				$has_icon = true;
			}
			$migrated = isset( $settings['__fa4_migrated']['select_btn_icon'] );
			$is_new   = ! isset( $settings['btn_icon'] ) && Icons_Manager::is_migration_allowed();
			?>
			<div class="pp-woo-add-to-cart">
				<?php
				if ( true === $show_quantity ) {
					$total_get_stock_quantity = 0;
					$min_value                = 0;
					if ( $product->is_purchasable() && $product->is_in_stock() ) {
						if ( $product->get_stock_quantity() ) {
							$total_get_stock_quantity = ( ! empty( $product->get_stock_quantity() ) ) ? ( $product->get_stock_quantity() ) : 1;
						} else {
							$total_get_stock_quantity = 0;
						}
						$min_value = 1;
					}

					$quantity_class = array(
						'pp-add-to-cart-qty-ajax',
					);

					$quantity_attr = array(
						'type'  => 'number',
						'value' => $min_value,
						'min'   => $min_value,
						'class' => $quantity_class,
					);

					if ( ! empty( $total_get_stock_quantity ) ) {
						$quantity_attr['max'] = $total_get_stock_quantity;
					}

					$this->add_render_attribute(
						'input-number',
						$quantity_attr
					);
					printf( '<input %s >', $this->get_render_attribute_string( 'input-number' ) );
				}
				?>
				<a <?php $this->print_render_attribute_string( 'button' ); ?>>
					<span class="elementor-button-content-wrapper">
						<?php
						if ( $has_icon ) {
							echo '<span ' . wp_kses_post( $this->get_render_attribute_string( 'icon-align' ) ) . '>';
							if ( $is_new || $migrated ) {
								Icons_Manager::render_icon( $settings['select_btn_icon'], array( 'aria-hidden' => 'true' ) );
							} elseif ( ! empty( $settings['btn_icon'] ) ) {
								?>
								<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
								<?php
							}
							echo '</span>';
						}
						?>
						<span class="elementor-button-text"><?php echo wp_kses_post( $settings['btn_text'] ); ?></span>
					</span>
				</a>
			</div>
			<?php
		}
	}

	private function render_form_button( $product ) {
		$settings = $this->get_settings_for_display();

		echo '<div class="pp-woo-add-to-cart">';
		if ( ! $product && current_user_can( 'manage_options' ) ) {

			return;
		}

		$text_callback = function() {
			ob_start();
			$this->render_text();

			return ob_get_clean();
		};

		add_filter( 'woocommerce_get_stock_html', '__return_empty_string' );
		add_filter( 'woocommerce_product_single_add_to_cart_text', $text_callback );
		add_filter( 'esc_html', array( $this, 'unescape_html' ), 10, 2 );

		ob_start();
		woocommerce_template_single_add_to_cart();
		$form = ob_get_clean();
		$form = str_replace( 'single_add_to_cart_button', 'single_add_to_cart_button elementor-button elementor-size-' . $settings['btn_size'] . ' pp-button', $form );
		echo $form;

		remove_filter( 'woocommerce_product_single_add_to_cart_text', $text_callback );
		remove_filter( 'woocommerce_get_stock_html', '__return_empty_string' );
		remove_filter( 'esc_html', array( $this, 'unescape_html' ) );

		echo '</div>';
	}

	/**
	 * Render button text.
	 *
	 * Render button widget text.
	 *
	 * @access protected
	 */
	protected function render_text() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute(
			array(
				'content-wrapper' => array(
					'class' => 'elementor-button-content-wrapper',
				),
				'icon-align'      => array(
					'class' => array(
						'pp-icon',
						'elementor-button-icon',
						'elementor-align-icon-' . $settings['btn_icon_align'],
					),
				),
				'btn_text'        => array(
					'class' => 'elementor-button-text',
				),
			)
		);

		if ( ! isset( $settings['btn_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['btn_icon'] = 'fa fa-shopping-cart';
		}

		$has_icon = ! empty( $settings['btn_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['btn_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_icon && ! empty( $settings['select_btn_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_btn_icon'] );
		$is_new   = ! isset( $settings['btn_icon'] ) && Icons_Manager::is_migration_allowed();

		$this->add_inline_editing_attributes( 'btn_text', 'none' );
		?>
		<span <?php $this->print_render_attribute_string( 'content-wrapper' ); ?>>
			<?php
			if ( $has_icon ) {
				echo '<span ' . wp_kses_post( $this->get_render_attribute_string( 'icon-align' ) ) . '>';
				if ( $is_new || $migrated ) {
					Icons_Manager::render_icon( $settings['select_btn_icon'], array( 'aria-hidden' => 'true' ) );
				} elseif ( ! empty( $settings['btn_icon'] ) ) {
					?>
					<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
					<?php
				}
				echo '</span>';
			}
			?>
			<span <?php $this->print_render_attribute_string( 'btn_text' ); ?>>
				<?php echo wp_kses_post( $settings['btn_text'] ); ?>
			</span>
		</span>
		<?php
	}
}
