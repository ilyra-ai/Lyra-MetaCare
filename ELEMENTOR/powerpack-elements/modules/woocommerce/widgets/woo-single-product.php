<?php
/**
 * PowerPack WooCommerce Single Product widget.
 *
 * @package PowerPack
 */

namespace PowerpackElements\Modules\Woocommerce\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Modules\Woocommerce\Module;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Image_Size;
use PowerpackElements\Modules\Woocommerce\Skins;

if ( ! defined( 'ABSPATH' ) ) {
	exit;   // Exit if accessed directly.
}

/**
 * Class Woo_Single_Product.
 */
class Woo_Single_Product extends Powerpack_Widget {

	/**
	 * Has Template content
	 *
	 * @var _has_template_content
	 */
	protected $_has_template_content = false;

	/**
	 * Retrieve Woo - Single Product widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Woo_Single_Product' );
	}

	/**
	 * Retrieve Woo - Single Product widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Woo_Single_Product' );
	}

	/**
	 * Retrieve Woo - Single Product widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Woo_Single_Product' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 1.4.13.1
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Woo_Single_Product' );
	}

	/**
	 * Retrieve the list of styles the Woo - Single Product depended on.
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
	 * Register Woo - Single Product Skins.
	 *
	 * @since 2.2.7
	 * @access protected
	 */
	protected function register_skins() {
		$this->add_skin( new Skins\Single_Product_Skin_1( $this ) );
		$this->add_skin( new Skins\Single_Product_Skin_2( $this ) );
		$this->add_skin( new Skins\Single_Product_Skin_3( $this ) );
		$this->add_skin( new Skins\Single_Product_Skin_4( $this ) );
	}

	/**
	 * Register woo checkout widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Single Product Content Control */
		$this->register_content_layout_controls();
		$this->register_content_product_controls();
		$this->register_content_sale_controls();
		$this->register_content_button_controls();
		$this->register_content_product_image_controls();
		$this->register_content_product_taxonomy_controls();

		/* Single Product Style Control */
		$this->register_style_box_controls();
		$this->register_style_content_controls();
		$this->register_style_button_controls();
		$this->register_style_typography_controls();
	}

	protected function register_content_layout_controls() {
		$this->start_controls_section(
			'section_layout',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_product_controls() {
		$this->start_controls_section(
			'section_product',
			array(
				'label' => esc_html__( 'Product', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'product_id',
			array(
				'label'       => esc_html__( 'Product', 'powerpack' ),
				'type'        => Controls_Manager::SELECT2,
				'label_block' => true,
				'options'     => Module::get_products_list(),
				'default'     => '',
				'multiple'    => false,
			)
		);

		$this->add_control(
			'product_title',
			array(
				'label'        => esc_html__( 'Show Product Title?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'product_price',
			array(
				'label'        => esc_html__( 'Show Price?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'product_rating',
			array(
				'label'        => esc_html__( 'Show Rating?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'product_rating_count',
			array(
				'label'        => esc_html__( 'Show Rating Count?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
				'condition'    => array(
					'product_rating' => 'yes',
				),
			)
		);

		$this->add_control(
			'product_rating_text',
			array(
				'label'       => esc_html__( 'Custom Text', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Customer Review', 'powerpack' ),
				'condition'   => array(
					'product_rating'       => 'yes',
					'product_rating_count' => 'yes',
				),
			)
		);

		$this->add_control(
			'product_short_description',
			array(
				'label'        => esc_html__( 'Show Short Description?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_sale_controls() {
		$this->start_controls_section(
			'section_sale_badge',
			array(
				'label' => esc_html__( 'Sale Badge', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'show_sale_badge',
			array(
				'label'        => esc_html__( 'Show Sale Badge?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_button_controls() {
		$this->start_controls_section(
			'section_product_button',
			array(
				'label' => esc_html__( 'Button', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'button_type',
			array(
				'label'     => esc_html__( 'Button Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'cart',
				'options'   => array(
					'cart'   => esc_html__( 'Add to Cart', 'powerpack' ),
					'custom' => esc_html__( 'Custom', 'powerpack' ),
					'none'   => esc_html__( 'None', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'button_text',
			array(
				'label'       => esc_html__( 'Custom Button Text', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => '',
				'condition'   => array(
					'button_type' => 'custom',
				),
			)
		);

		$this->add_control(
			'button_link',
			[
				'label' => esc_html__( 'Link', 'powerpack' ),
				'type' => Controls_Manager::URL,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'https://your-link.com', 'powerpack' ),
				'condition' => [
					'button_type' => 'custom',
				],
				'show_label' => false,
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_product_image_controls() {
		$this->start_controls_section(
			'section_product_image',
			array(
				'label' => esc_html__( 'Product Image', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'show_image',
			array(
				'label'        => esc_html__( 'Show Image?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'      => 'image_size',
				'label'     => esc_html__( 'Image Size', 'powerpack' ),
				'default'   => 'medium',
				'condition' => array(
					'show_image' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_product_taxonomy_controls() {
		$this->start_controls_section(
			'section_product_taxonomy',
			array(
				'label' => esc_html__( 'Product Meta', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'show_sku',
			array(
				'label'        => esc_html__( 'Show SKU?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => '',
			)
		);

		$this->add_control(
			'show_taxonomy',
			array(
				'label'        => esc_html__( 'Show Taxonomy?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => '',
			)
		);

		$this->add_control(
			'select_taxonomy',
			array(
				'label'     => esc_html__( 'Select Taxonomy', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => '',
				'options'   => Module::get_taxonomies_list(),
				'condition' => array(
					'show_taxonomy' => 'yes',
				),
			)
		);

		$this->add_control(
			'show_taxonomy_custom_text',
			array(
				'label'        => esc_html__( 'Use Custom Taxonomy Label?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => '',
				'condition' => array(
					'show_taxonomy' => 'yes',
				),
			)
		);

		$this->add_control(
			'taxonomy_custom_text',
			array(
				'label'       => esc_html__( 'Custom Label', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => '',
				'condition'   => array(
					'show_taxonomy_custom_text' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_box_controls() {
		$this->start_controls_section(
			'section_style_box',
			array(
				'label' => esc_html__( 'Box', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'content_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'content_bg_color_hover',
			array(
				'label'     => esc_html__( 'Background Hover Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product:hover' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'content_alignment',
			array(
				'label'     => esc_html__( 'Alignment', 'powerpack' ),
				'type'      => Controls_Manager::CHOOSE,
				'options'   => array(
					'left'   => array(
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					),
					'right'  => array(
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					),
				),
				'default'   => 'center',
				'prefix_class' => 'pp-single-product-align-',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product,
					{{WRAPPER}} .pp-single-product .woocommerce-product-rating,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .variations_form.cart
					' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'box_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-single-product' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'      => 'box_border_group',
				'label'     => esc_html__( 'Border Style', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-single-product',
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_content_controls() {
		$this->start_controls_section(
			'section_style_content',
			array(
				'label' => esc_html__( 'Content', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'content_padding',
			array(
				'label'      => esc_html__( 'Content Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-single-product .product-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'product_rating_style',
			array(
				'label'     => esc_html__( 'Rating', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'product_rating'       => 'yes',
					'product_rating_count' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'product_rating_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 5,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'condition'             => [
					'product_rating'       => 'yes',
					'product_rating_count' => 'yes',
				],
				'selectors'             => [
					'{{WRAPPER}} .woocommerce-product-rating' => 'font-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'product_rating_default_color',
			array(
				'label'     => esc_html__( 'Rating Star Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce-product-rating .star-rating:before' => 'color: {{VALUE}};',
				),
				'condition'             => [
					'product_rating'       => 'yes',
					'product_rating_count' => 'yes',
				],
			)
		);

		$this->add_control(
			'product_rating_color',
			array(
				'label'     => esc_html__( 'Rating Star Active Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce-product-rating .star-rating span:before' => 'color: {{VALUE}};',
				),
				'condition'             => [
					'product_rating'       => 'yes',
					'product_rating_count' => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'product_rating_margin',
			[
				'label'             => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'              => Controls_Manager::SLIDER,
				'size_units'        => [ 'px', 'em', 'rem', 'custom' ],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 80,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-single-product .woocommerce-product-rating' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'product_rating'       => 'yes',
					'product_rating_count' => 'yes',
				],
			]
		);

		$this->add_control(
			'sale_badge_style',
			array(
				'label'     => esc_html__( 'Sale Badge', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'show_sale_badge' => 'yes',
				],
			)
		);

		$this->add_control(
			'badge_position',
			[
				'label'                 => esc_html__( 'Sale Badge Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'top-left',
				'options'               => [
					'top-left'      => esc_html__( 'Top Left', 'powerpack' ),
					'top-center'    => esc_html__( 'Top Center', 'powerpack' ),
					'top-right'     => esc_html__( 'Top Right', 'powerpack' ),
					'bottom-right'  => esc_html__( 'Bottom Right', 'powerpack' ),
					'bottom-center' => esc_html__( 'Bottom Center', 'powerpack' ),
					'bottom-left'   => esc_html__( 'Bottom Left', 'powerpack' ),
				],
				'prefix_class'          => 'pp-badge-position-align-',
				'condition' => [
					'show_sale_badge' => 'yes',
				],
			]
		);

		$this->add_control(
			'badge_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#1e8cbe',
				'selectors' => array(
					'{{WRAPPER}} .onsale' => 'background-color: {{VALUE}};',
				),
				'condition' => [
					'show_sale_badge' => 'yes',
				],
			)
		);

		$this->add_control(
			'badge_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#ffffff',
				'selectors' => array(
					'{{WRAPPER}} .onsale' => 'color: {{VALUE}};',
				),
				'condition' => [
					'show_sale_badge' => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'badge_margin_left_right',
			[
				'label'             => esc_html__( 'Horizontal Spacing', 'powerpack' ),
				'type'              => Controls_Manager::SLIDER,
				'size_units'        => [ 'px', 'em', 'rem', 'custom' ],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .onsale' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'show_sale_badge' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'badge_margin_top_bottom',
			[
				'label'             => esc_html__( 'Vertical Spacing', 'powerpack' ),
				'type'              => Controls_Manager::SLIDER,
				'size_units'        => [ 'px', 'em', 'rem', 'custom' ],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .onsale' => 'margin-top: {{SIZE}}{{UNIT}}; margin-bottom: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'show_sale_badge' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'badge_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .onsale' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'             => [
					'show_sale_badge' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'      => 'sale_badge_border',
				'label'     => esc_html__( 'Border Style', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .onsale',
				'condition'             => [
					'show_sale_badge' => 'yes',
				],
			)
		);

		$this->add_control(
			'meta_style',
			array(
				'label'     => esc_html__( 'Product Meta', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			)
		);

		$this->add_control(
			'meta_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .product_meta' => 'color: {{VALUE}};',
				),
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			)
		);

		$this->add_control(
			'meta_link_color',
			array(
				'label'     => esc_html__( 'Link Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .product_meta .posted_in a' => 'color: {{VALUE}};',
				),
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			)
		);

		$this->add_control(
			'meta_border',
			array(
				'label'        => esc_html__( 'Show Divider?', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			)
		);

		$this->add_control(
			'meta_border_color',
			array(
				'label'     => esc_html__( 'Divider Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#eeeeee',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .product_meta' => 'border-color: {{VALUE}};',
				),
				'condition' => [
					'show_taxonomy' => 'yes',
					'meta_border'   => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'meta_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-single-product .product_meta' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			)
		);

		$this->add_control(
			'variation_style',
			array(
				'label'     => esc_html__( 'Variation Table', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'variation_table_style',
			array(
				'label'        => esc_html__( 'Use Custom Style', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => '',
			)
		);

		$this->add_control(
			'variation_table_width',
			[
				'label'                 => esc_html__( 'Width', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'full',
				'options'               => [
					'auto' => esc_html__( 'Auto', 'powerpack' ),
					'full' => esc_html__( 'Full Width', 'powerpack' ),
				],
				'prefix_class'          => 'pp-variation-table-width-',
				'condition' => [
					'variation_table_style' => 'yes',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'      => 'variation_table_border_style',
				'label'     => esc_html__( 'Border Style', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .woocommerce .pp-product-action .variations_form table,
								{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr,
								{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.label',
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'variation_table_cell_padding',
			[
				'label' => esc_html__( 'Spacing', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'default' => [
					'size' => 5,
					'unit' => 'px',
				],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td' => 'padding: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'variation_table_style' => 'yes',
				],
			]
		);

		$this->start_controls_tabs(
			'tabs_variation_table_label_style',
			array(
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->start_controls_tab(
			'tab_variation_table_label',
			array(
				'label'     => esc_html__( 'Label', 'powerpack' ),
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->add_control(
			'variation_table_label_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.label' => 'color: {{VALUE}};',
				),
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->add_control(
			'variation_table_label_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#fcfcfc',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.label' => 'background-color: {{VALUE}};',
				),
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_variation_table_value',
			array(
				'label'     => esc_html__( 'Value', 'powerpack' ),
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->add_control(
			'variation_table_value_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.value,
					{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.value *' => 'color: {{VALUE}};',
				),
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->add_control(
			'variation_table_value_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.value,
					{{WRAPPER}} .woocommerce .pp-product-action .variations_form table tr > td.value *' => 'background-color: {{VALUE}};',
				),
				'condition' => [
					'variation_table_style' => 'yes',
				],
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_button_controls() {
		$this->start_controls_section(
			'section_style_button',
			array(
				'label' => esc_html__( 'Button', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
				'condition' => [
					'button_type' => [ 'cart', 'custom' ],
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'button_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .woocommerce-product-add-to-cart .add_to_cart_inline a, 
				{{WRAPPER}} .woocommerce-product-add-to-cart a, 
				{{WRAPPER}} .woocommerce-product-add-to-cart .button',
			]
		);

		$this->add_control(
			'button_width',
			array(
				'label'        => esc_html__( 'Width', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'auto',
				'options'      => array(
					'auto'       => esc_html__( 'Auto', 'powerpack' ),
					'full-width' => esc_html__( 'Full Width', 'powerpack' ),
					'custom'     => esc_html__( 'Custom', 'powerpack' ),
				),
				'prefix_class' => 'pp-single-product-buttons-',
			)
		);

		$this->add_responsive_control(
			'button_width_custom',
			array(
				'label'      => esc_html__( 'Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 1,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations),
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.alt.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt' => 'width: {{SIZE}}{{UNIT}};',
				),
				'condition' => [
					'button_width' => 'custom',
				],
			)
		);

		$this->start_controls_tabs( 'tabs_button_style' );

		$this->start_controls_tab(
			'tab_button_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
			)
		);

		$this->add_control(
			'button_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce-product-add-to-cart .add_to_cart_inline a,
					{{WRAPPER}} .woocommerce-product-add-to-cart a,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations),
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.alt.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'button_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce-product-add-to-cart .add_to_cart_inline a,
					{{WRAPPER}} .woocommerce-product-add-to-cart a,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations),
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.alt.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'      => 'button_border',
				'label'     => esc_html__( 'Border', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .woocommerce-product-add-to-cart .add_to_cart_inline a,
				{{WRAPPER}} .woocommerce-product-add-to-cart a,
				{{WRAPPER}} .woocommerce-product-add-to-cart .button,
				{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations),
				{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.disabled,
				{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.alt.disabled,
				{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt',
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
			)
		);

		$this->add_control(
			'button_color_hover',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations):hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button:hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt:hover' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'button_bg_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce-product-add-to-cart .add_to_cart_inline a:hover,
					{{WRAPPER}} .woocommerce-product-add-to-cart a:hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations):hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button:hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt:hover' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'button_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .woocommerce-product-add-to-cart a:hover,
					{{WRAPPER}} .woocommerce-product-add-to-cart .button:hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations):hover,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt:hover' => 'border-color: {{VALUE}};',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'button_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'allowed_dimensions'    => 'vertical',
				'default'               => array(
					'top'      => '5',
					'right'    => 'auto',
					'bottom'   => '15',
					'left'     => 'auto',
					'isLinked' => false,
				),
				'placeholder'           => [
					'top'      => '',
					'right'    => 'auto',
					'bottom'   => '',
					'left'     => 'auto',
				],
				'separator'             => 'before',
				'selectors'             => [
					'{{WRAPPER}} .woocommerce-product-add-to-cart' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'button_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .woocommerce-product-add-to-cart .add_to_cart_inline a,
					{{WRAPPER}} .woocommerce-product-add-to-cart a,
					{{WRAPPER}} .woocommerce-product-add-to-cart .button,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart a:not(.reset_variations),
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.alt.disabled,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .button.single_add_to_cart_button.alt' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_typography_controls() {
		$this->start_controls_section(
			'section_style_typography',
			array(
				'label' => esc_html__( 'Typography', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'product_title_style',
			array(
				'label'     => esc_html__( 'Title', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'condition' => [
					'product_title' => 'yes',
				],
			)
		);

		$this->add_control(
			'product_title_heading_tag',
			array(
				'label'   => esc_html__( 'Title HTML Tag', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'h2',
				'options' => array(
					'h1'   => esc_html__( 'H1', 'powerpack' ),
					'h2'   => esc_html__( 'H2', 'powerpack' ),
					'h3'   => esc_html__( 'H3', 'powerpack' ),
					'h4'   => esc_html__( 'H4', 'powerpack' ),
					'h5'   => esc_html__( 'H5', 'powerpack' ),
					'h6'   => esc_html__( 'H6', 'powerpack' ),
				),
				'condition' => [
					'product_title' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'product_title_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-product-title',
				'condition' => [
					'product_title' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'product_title_margin',
			[
				'label'             => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'              => Controls_Manager::SLIDER,
				'size_units'        => [ 'px', 'em', 'rem', 'custom' ],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-single-product .pp-product-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'product_title' => 'yes',
				],
			]
		);

		$this->add_control(
			'rating_count_taxonomy_heading',
			array(
				'label'     => esc_html__( 'Rating Count Taxonomy', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'product_rating_count' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'      => 'rating_count_taxonomy_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-single-product .woocommerce-product-rating .woocommerce-rating-count',
				'condition' => [
					'product_rating_count' => 'yes',
				],
			]
		);

		$this->add_control(
			'regular_price_heading',
			array(
				'label'     => esc_html__( 'Regular Price', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'product_price' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'      => 'regular_price_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-single-product .price .amount',
				'condition' => [
					'product_price' => 'yes',
				],
			]
		);

		$this->add_control(
			'regular_price_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .price .amount' => 'color: {{VALUE}};',
				),
				'condition' => [
					'product_price' => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'product_price_margin',
			[
				'label'             => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'              => Controls_Manager::SLIDER,
				'size_units'        => [ 'px', 'em', 'rem', 'custom' ],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-single-product .price' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'product_price' => 'yes',
				],
			]
		);

		$this->add_control(
			'sale_price_heading',
			array(
				'label'     => esc_html__( 'Sale Price', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'product_price' => 'yes',
				],
			)
		);

		$this->add_control(
			'sale_price_font_size',
			array(
				'label'     => esc_html__( 'Font Size', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'default',
				'options'   => array(
					'default' => esc_html__( 'Default', 'powerpack' ),
					'custom'  => esc_html__( 'Custom', 'powerpack' ),
				),
				'condition' => [
					'product_price' => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'sale_price_font_size_custom',
			[
				'label'      => esc_html__( 'Custom Font Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range'      => [
					'px' => [
						'min'   => 5,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'default'    => array(
					'size' => 15,
				),
				'condition'  => [
					'product_price'        => 'yes',
					'sale_price_font_size' => 'custom',
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-single-product .price ins .amount' => 'font-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'sale_price_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .price ins .amount' => 'color: {{VALUE}};',
				),
				'condition' => [
					'product_price' => 'yes',
				],
			)
		);

		$this->add_control(
			'short_description_font',
			array(
				'label'     => esc_html__( 'Short Description', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'product_short_description' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'short_description_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-single-product .woocommerce-product-details__short-description,
								{{WRAPPER}} .pp-single-product .woocommerce-product-details__short-description p,
								{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .variations_form.cart,
								{{WRAPPER}} .pp-single-product .pp-single-product .woocommerce-product-add-to-cart label',
				'condition' => [
					'product_short_description' => 'yes',
				],
			]
		);

		$this->add_control(
			'short_description_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-single-product .woocommerce-product-details__short-description,
					{{WRAPPER}} .pp-single-product .woocommerce-product-details__short-description p,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart .variations_form.cart,
					{{WRAPPER}} .pp-single-product .woocommerce-product-add-to-cart label' => 'color: {{VALUE}};',
				),
				'condition' => [
					'product_short_description' => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'product_description_margin_bottom',
			[
				'label'             => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'              => Controls_Manager::SLIDER,
				'size_units'        => [ 'px', 'em', 'rem', 'custom' ],
				'range'             => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-single-product .woocommerce-product-details__short-description' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'product_short_description' => 'yes',
				],
			]
		);

		$this->add_control(
			'sale_badge_fonts',
			array(
				'label'     => esc_html__( 'Sale Badge', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'show_sale_badge' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'sale_badge_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-single-product .onsale',
				'condition' => [
					'show_sale_badge' => 'yes',
				],
			]
		);

		$this->add_control(
			'meta_fonts',
			array(
				'label'     => esc_html__( 'Product Taxonomy', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'meta_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-single-product .product_meta',
				'condition' => [
					'show_taxonomy' => 'yes',
				],
			]
		);

		$this->add_control(
			'variation_table_typography',
			array(
				'label'     => esc_html__( 'Variation Table', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'label_typography',
				'label'    => esc_html__( 'Label Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-single-product .pp-product-action .variations_form table tr > td.label',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'value_typography',
				'label'    => esc_html__( 'Value  Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-single-product .pp-product-action .variations_form table tr > td.value,
				{{WRAPPER}} .pp-single-product .pp-product-action .variations_form table tr > td.value *',
			]
		);

		$this->end_controls_section();
	}

}
