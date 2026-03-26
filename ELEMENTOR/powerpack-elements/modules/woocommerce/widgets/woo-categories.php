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
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Image_Size;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;   // Exit if accessed directly.
}

/**
 * Woo - Categories Widget
 */
class Woo_Categories extends Powerpack_Widget {

	/**
	 * Retrieve Woo - Categories widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Woo_Categories' );
	}

	/**
	 * Retrieve Woo - Categories widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Woo_Categories' );
	}

	/**
	 * Retrieve Woo - Categories widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Woo_Categories' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Woo - Categories widget belongs to.
	 *
	 * @since 1.4.11.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Woo_Categories' );
	}

	/**
	 * Retrieve the list of scripts the Woo - Categories widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return array(
				'swiper',
				'pp-carousel',
			);
		}

		$settings = $this->get_settings_for_display();
		$scripts = [];

		if ( 'carousel' === $settings['layout'] ) {
			array_push( $scripts, 'swiper', 'pp-carousel' );
		}

		return $scripts;
	}

	/**
	 * Retrieve the list of styles the Woo - Categories depended on.
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
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Woo - Categories widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Product Control */
		$this->register_content_general_controls();
		$this->register_content_grid_controls();
		$this->register_content_carousel_controls();
		$this->register_content_filter_controls();

		/* Style */
		$this->register_style_layout_controls();
		$this->register_style_category_controls();
		/* Style Tab: Arrows */
		$this->register_style_arrows_controls();
		/* Style Tab: Dots */
		$this->register_style_dots_controls();
	}

	/**
	 * Register toggle widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_content_general_controls() {

		$this->start_controls_section(
			'section_layout',
			[
				'label'                 => esc_html__( 'Layout', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'layout',
			[
				'label'                 => esc_html__( 'Layout', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'grid',
				'options'               => [
					'grid'      => esc_html__( 'Grid', 'powerpack' ),
					'carousel'  => esc_html__( 'Carousel', 'powerpack' ),
					'tiles'     => esc_html__( 'Tiles', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'tiles_style',
			[
				'label'                 => esc_html__( 'Tiles Style', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => '1',
				'options'               => [
					'1'     => esc_html__( 'Style 1', 'powerpack' ),
					'2'     => esc_html__( 'Style 2', 'powerpack' ),
				],
				'condition'             => [
					'layout'    => 'tiles',
				],
			]
		);

		$this->add_control(
			'cats_count',
			[
				'label'                 => esc_html__( 'Categories Count', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => '4',
			]
		);

		$this->add_control(
			'content_position',
			[
				'label'                 => esc_html__( 'Content Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'overlay',
				'options'               => [
					'default'   => esc_html__( 'Below Image', 'powerpack' ),
					'overlay'   => esc_html__( 'Over Image', 'powerpack' ),
				],
				'condition'             => [
					'layout!'   => 'tiles',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'    => 'image_size',
				'label'   => esc_html__( 'Image Size', 'powerpack' ),
				'default' => 'woocommerce_thumbnail',
			)
		);

		$this->add_control(
			'cat_title',
			[
				'label'                 => esc_html__( 'Category Title', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'product_count',
			[
				'label'                 => esc_html__( 'Product Count', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'cat_desc',
			[
				'label'                 => esc_html__( 'Category Description', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'category_desc_limit',
			[
				'label'                 => esc_html__( 'Words Limit', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => '',
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'cat_desc' => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register Grid Controls.
	 *
	 * @access protected
	 */
	protected function register_content_grid_controls() {

		$this->start_controls_section(
			'section_grid_settings',
			[
				'label'                 => esc_html__( 'Grid Options', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_CONTENT,
				'condition'             => [
					'layout!' => 'carousel',
				],
			]
		);

		$this->add_responsive_control(
			'columns',
			[
				'label'                 => esc_html__( 'Columns', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => '3',
				'tablet_default'        => '2',
				'mobile_default'        => '1',
				'options'               => [
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
					'7' => '7',
					'8' => '8',
				],
				'prefix_class'          => 'elementor-grid%s-',
				'frontend_available'    => true,
				'condition'             => [
					'layout!' => 'carousel',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register Carousel Controls.
	 *
	 * @access protected
	 */
	protected function register_content_carousel_controls() {
		$this->start_controls_section(
			'section_carousel_options',
			[
				'label'                 => esc_html__( 'Carousel Options', 'powerpack' ),
				'type'                  => Controls_Manager::SECTION,
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_responsive_control(
			'slides_to_show',
			[
				'label'                 => esc_html__( 'Categories to Show', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 4,
				'tablet_default'        => 3,
				'mobile_default'        => 1,
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_responsive_control(
			'slides_to_scroll',
			[
				'label'                 => esc_html__( 'Categories to Scroll', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 1,
				'tablet_default'        => 1,
				'mobile_default'        => 1,
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label'                 => esc_html__( 'Autoplay', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'return_value'          => 'yes',
				'default'               => '',
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);
		$this->add_control(
			'autoplay_speed',
			[
				'label'                 => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 3000,
				'condition'             => [
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				],
			]
		);
		$this->add_control(
			'pause_on_hover',
			[
				'label'                 => esc_html__( 'Pause on Hover', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'return_value'          => 'yes',
				'default'               => 'yes',
				'frontend_available'    => true,
				'condition'             => [
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				],
			]
		);

		$this->add_control(
			'infinite',
			[
				'label'                 => esc_html__( 'Infinite Loop', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'return_value'          => 'yes',
				'default'               => 'yes',
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_control(
			'transition_speed',
			[
				'label'                 => esc_html__( 'Transition Speed (ms)', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 600,
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_control(
			'navigation',
			[
				'label'                 => esc_html__( 'Navigation', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_control(
			'arrows',
			[
				'label'                 => esc_html__( 'Arrows', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'return_value'          => 'yes',
				'default'               => 'yes',
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->add_control(
			'dots',
			[
				'label'                 => esc_html__( 'Dots', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'return_value'          => 'yes',
				'default'               => 'yes',
				'condition'             => [
					'layout'   => 'carousel',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register Woo Products Filter Controls.
	 *
	 * @access protected
	 */
	protected function register_content_filter_controls() {

		$this->start_controls_section(
			'section_filter_field',
			[
				'label'                 => esc_html__( 'Filters', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_CONTENT,
			]
		);

			$this->add_control(
				'category_filter_rule',
				[
					'label'   => esc_html__( 'Category Filter Rule', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'all',
					'options' => [
						'all'     => esc_html__( 'Show All', 'powerpack' ),
						'top'     => esc_html__( 'Only Top Level', 'powerpack' ),
						'include' => esc_html__( 'Match These Categories', 'powerpack' ),
						'exclude' => esc_html__( 'Exclude These Categories', 'powerpack' ),
					],
				]
			);
			$this->add_control(
				'category_filter',
				[
					'label'         => esc_html__( 'Categories', 'powerpack' ),
					'type'          => 'pp-query',
					'post_type'     => '',
					'options'       => [],
					'label_block'   => true,
					'multiple'      => true,
					'query_type'    => 'terms',
					'object_type'   => 'product_cat',
					'include_type'  => true,
					'condition'     => [
						'category_filter_rule' => [ 'include', 'exclude' ],
					],
				]
			);
			$this->add_control(
				'display_empty_cat',
				[
					'label'                 => esc_html__( 'Display Empty Categories', 'powerpack' ),
					'type'                  => Controls_Manager::SWITCHER,
					'default'               => '',
					'label_on'     => 'Yes',
					'label_off'    => 'No',
					'return_value'          => 'yes',
				]
			);
			$this->add_control(
				'orderby',
				[
					'label'   => esc_html__( 'Order by', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'name',
					'options' => [
						'name'  => esc_html__( 'Name', 'powerpack' ),
						'slug'  => esc_html__( 'Slug', 'powerpack' ),
						'desc'  => esc_html__( 'Description', 'powerpack' ),
						'count' => esc_html__( 'Count', 'powerpack' ),
						'menu_order' => esc_html__( 'Menu Order', 'powerpack' ),
					],
				]
			);

			$this->add_control(
				'order',
				[
					'label'   => esc_html__( 'Order', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'desc',
					'options' => [
						'desc' => esc_html__( 'Descending', 'powerpack' ),
						'asc'  => esc_html__( 'Ascending', 'powerpack' ),
					],
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
	 * @since 1.3.3
	 * @access protected
	 */
	protected function register_style_layout_controls() {
		$this->start_controls_section(
			'section_design_layout',
			[
				'label'                 => esc_html__( 'Layout', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'column_gap',
			[
				'label'                 => esc_html__( 'Columns Gap', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 20,
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'render_type'           => 'template',
				'selectors'             => [
					'{{WRAPPER}}' => '--grid-column-gap: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'row_gap',
			[
				'label'                 => esc_html__( 'Rows Gap', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 35,
				],
				'range'                => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors'             => [
					'{{WRAPPER}}' => '--grid-row-gap: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-woo-categories-tiles .product' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-woo-cat-tiles-1 .pp-woo-cat-tiles-center .product, {{WRAPPER}} .pp-woo-cat-tiles-2 .pp-woo-cat-tiles-right .product' => 'height: calc((550px - {{SIZE}}{{UNIT}}) / 2);',
				],
				'condition'             => [
					'layout' => [ 'grid', 'tiles' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'column_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'separator'             => 'before',
				'selector'              => '{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item',
			]
		);

			$this->add_control(
				'column_border_color_hover',
				[
					'label'                 => esc_html__( 'Border Hover Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item:hover' => 'border-color: {{VALUE}};',
					],
				]
			);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'     => 'column_box_shadow',
				'separator' => 'before',
				'selector'  => '{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register Category Content Controls.
	 *
	 * @since 1.3.3
	 * @access protected
	 */
	protected function register_style_category_controls() {
		$this->start_controls_section(
			'section_design_cat_content',
			[
				'label'                 => esc_html__( 'Category Content', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'cat_content_vertical_align',
			[
				'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'default'               => 'middle',
				'options'               => [
					'top'          => [
						'title'    => esc_html__( 'Top', 'powerpack' ),
						'icon'     => 'eicon-v-align-top',
					],
					'middle'       => [
						'title'    => esc_html__( 'Center', 'powerpack' ),
						'icon'     => 'eicon-v-align-middle',
					],
					'bottom'       => [
						'title'    => esc_html__( 'Bottom', 'powerpack' ),
						'icon'     => 'eicon-v-align-bottom',
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-categories-overlay .product .pp-product-cat-content-wrap'   => 'justify-content: {{VALUE}};',
				],
				'selectors_dictionary'  => [
					'top'          => 'flex-start',
					'middle'       => 'center',
					'bottom'       => 'flex-end',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'relation' => 'and',
							'terms' => [
								[
									'relation' => 'or',
									'terms' => [
										[
											'name' => 'layout',
											'operator' => '==',
											'value' => 'grid',
										],
										[
											'name' => 'layout',
											'operator' => '==',
											'value' => 'carousel',
										],
									],
								],
								[
									'name' => 'content_position',
									'operator' => '==',
									'value' => 'overlay',
								],
							],
						],
						[
							'name' => 'layout',
							'operator' => '==',
							'value' => 'tiles',
						],
					],
				],
			]
		);

		$this->add_control(
			'cat_content_horizontal_align',
			[
				'label'                 => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'options'               => [
					'left'      => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-h-align-left',
					],
					'center'           => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-h-align-center',
					],
					'right'            => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-h-align-right',
					],
					'justify'   => [
						'title'    => esc_html__( 'Stretch', 'powerpack' ),
						'icon'     => 'eicon-h-align-stretch',
					],
				],
				'default'               => 'center',
				'selectors_dictionary'  => [
					'left'     => 'flex-start',
					'center'   => 'center',
					'right'    => 'flex-end',
					'justify'  => 'stretch',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-woo-categories-overlay .product .pp-product-cat-content-wrap' => 'align-items: {{VALUE}};',
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'relation' => 'and',
							'terms' => [
								[
									'relation' => 'or',
									'terms' => [
										[
											'name' => 'layout',
											'operator' => '==',
											'value' => 'grid',
										],
										[
											'name' => 'layout',
											'operator' => '==',
											'value' => 'carousel',
										],
									],
								],
								[
									'name' => 'content_position',
									'operator' => '==',
									'value' => 'overlay',
								],
							],
						],
						[
							'name' => 'layout',
							'operator' => '==',
							'value' => 'tiles',
						],
					],
				],
			]
		);
			$this->add_control(
				'cat_content_text_align',
				[
					'label'                 => esc_html__( 'Text Alignment', 'powerpack' ),
					'type'                  => Controls_Manager::CHOOSE,
					'label_block'  => false,
					'options'      => [
						'left'   => [
							'title' => esc_html__( 'Left', 'powerpack' ),
							'icon'  => 'eicon-text-align-left',
						],
						'center' => [
							'title' => esc_html__( 'Center', 'powerpack' ),
							'icon'  => 'eicon-text-align-center',
						],
						'right'  => [
							'title' => esc_html__( 'Right', 'powerpack' ),
							'icon'  => 'eicon-text-align-right',
						],
					],
					'default'               => 'center',
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content' => 'text-align: {{VALUE}};',
					],
					'separator'             => 'after',
				]
			);

			$this->start_controls_tabs( 'cat_content_tabs_style' );

			$this->start_controls_tab(
				'cat_content_normal',
				[
					'label'                 => esc_html__( 'Normal', 'powerpack' ),
				]
			);

			$this->add_group_control(
				Group_Control_Background::get_type(),
				[
					'name'                  => 'cat_content_background',
					'types'                 => [ 'classic', 'gradient' ],
					'selector'              => '{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content',
				]
			);

			$this->add_control(
				'cat_content_margin',
				[
					'label'                 => esc_html__( 'Margin', 'powerpack' ),
					'type'                  => Controls_Manager::DIMENSIONS,
					'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					],
					'separator'             => 'before',
				]
			);

			$this->add_control(
				'cat_content_padding',
				[
					'label'                 => esc_html__( 'Padding', 'powerpack' ),
					'type'                  => Controls_Manager::DIMENSIONS,
					'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
					'default'               => [
						'top'      => '10',
						'right'    => '10',
						'bottom'   => '10',
						'left'     => '10',
						'isLinked' => true,
					],
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					],
				]
			);

			$this->add_control(
				'cat_content_title_heading',
				[
					'label'                 => esc_html__( 'Title', 'powerpack' ),
					'type'                  => Controls_Manager::HEADING,
					'separator'             => 'before',
					'condition'             => [
						'cat_title' => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_title_color',
				[
					'label'                 => esc_html__( 'Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .woocommerce-loop-category__title' => 'color: {{VALUE}};',
					],
					'condition'             => [
						'cat_title' => 'yes',
					],
				]
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				[
					'name'                 => 'cat_content_title_typography',
					'label'                => esc_html__( 'Typography', 'powerpack' ),
					'global'                => [
						'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
					],
					'selector'             => '{{WRAPPER}} .pp-woo-categories .product .woocommerce-loop-category__title',
					'condition'            => [
						'cat_title' => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_content_count_heading',
				[
					'label'                 => esc_html__( 'Product Count', 'powerpack' ),
					'type'                  => Controls_Manager::HEADING,
					'separator'             => 'before',
					'condition'             => [
						'product_count' => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_count_color',
				[
					'label'                 => esc_html__( 'Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content .pp-count' => 'color: {{VALUE}};',
					],
					'condition'             => [
						'product_count' => 'yes',
					],
				]
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				[
					'name'                 => 'cat_content_count_typography',
					'label'                => esc_html__( 'Typography', 'powerpack' ),
					'global'                => [
						'default' => Global_Typography::TYPOGRAPHY_ACCENT,
					],
					'selector'             => '{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content .pp-count',
					'condition'            => [
						'product_count' => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_desc_heading',
				[
					'label'                 => esc_html__( 'Category Description', 'powerpack' ),
					'type'                  => Controls_Manager::HEADING,
					'separator'             => 'before',
					'condition'             => [
						'cat_desc'  => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_desc_color',
				[
					'label'                 => esc_html__( 'Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content .pp-product-cat-desc' => 'color: {{VALUE}};',
					],
					'condition'             => [
						'cat_desc'  => 'yes',
					],
				]
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				[
					'name'                 => 'cat_desc_typography',
					'label'                => esc_html__( 'Typography', 'powerpack' ),
					'selector'             => '{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content .pp-product-cat-desc',
					'condition'             => [
						'cat_desc'  => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_content_opacity',
				[
					'label'                 => esc_html__( 'Opacity', 'powerpack' ),
					'type'                  => Controls_Manager::SLIDER,
					'default'               => [
						'size' => 1,
					],
					'range'                 => [
						'px' => [
							'min'   => 0,
							'max'   => 1,
							'step'  => 0.01,
						],
					],
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-product-cat-content' => 'opacity: {{SIZE}};',
					],
					'separator'             => 'before',
					'condition'             => [
						'content_position' => 'overlay',
					],
				]
			);

			$this->end_controls_tab();

			$this->start_controls_tab(
				'cat_content_hover',
				[
					'label'                 => esc_html__( 'Hover', 'powerpack' ),
				]
			);

			$this->add_group_control(
				Group_Control_Background::get_type(),
				[
					'name'                  => 'cat_content_background_hover',
					'types'                 => [ 'classic', 'gradient' ],
					'selector'              => '{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item:hover .pp-product-cat-content',
					'separator'             => 'after',
				]
			);

			$this->add_control(
				'cat_content_hover_title_color',
				[
					'label'                 => esc_html__( 'Title Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item:hover .woocommerce-loop-category__title' => 'color: {{VALUE}};',
					],
					'condition'             => [
						'cat_title' => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_content_hover_count_color',
				[
					'label'                 => esc_html__( 'Product Count Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item:hover .pp-product-cat-content .pp-count' => 'color: {{VALUE}};',
					],
					'condition'             => [
						'product_count' => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_hover_desc_color',
				[
					'label'                 => esc_html__( 'Description Color', 'powerpack' ),
					'type'                  => Controls_Manager::COLOR,
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product-category .pp-grid-item:hover .pp-product-cat-content .pp-product-cat-desc' => 'color: {{VALUE}};',
					],
					'condition'             => [
						'cat_desc'  => 'yes',
					],
				]
			);

			$this->add_control(
				'cat_content_opacity_hover',
				[
					'label'                 => esc_html__( 'Opacity', 'powerpack' ),
					'type'                  => Controls_Manager::SLIDER,
					'default'               => [
						'size' => 1,
					],
					'range'                 => [
						'px' => [
							'min'   => 0,
							'max'   => 1,
							'step'  => 0.01,
						],
					],
					'selectors'             => [
						'{{WRAPPER}} .pp-woo-categories .product .pp-grid-item:hover .pp-product-cat-content' => 'opacity: {{SIZE}};',
					],
					'separator'             => 'before',
					'condition'             => [
						'content_position' => 'overlay',
					],
				]
			);

			$this->end_controls_tab();

			$this->end_controls_tabs();

		$this->end_controls_section();
	}

	public function register_style_arrows_controls() {
		$this->start_controls_section(
			'section_arrows_style',
			array(
				'label'     => esc_html__( 'Arrows', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_control(
			'select_arrow',
			array(
				'label'                  => esc_html__( 'Choose Arrow', 'powerpack' ),
				'type'                   => Controls_Manager::ICONS,
				'fa4compatibility'       => 'arrow',
				'label_block'            => false,
				'default'                => array(
					'value'   => 'fas fa-angle-right',
					'library' => 'fa-solid',
				),
				'skin'                   => 'inline',
				'exclude_inline_options' => 'svg',
				'recommended'            => array(
					'fa-regular' => array(
						'arrow-alt-circle-right',
						'caret-square-right',
						'hand-point-right',
					),
					'fa-solid'   => array(
						'angle-right',
						'angle-double-right',
						'chevron-right',
						'chevron-circle-right',
						'arrow-right',
						'long-arrow-alt-right',
						'caret-right',
						'caret-square-right',
						'arrow-circle-right',
						'arrow-alt-circle-right',
						'toggle-right',
						'hand-point-right',
					),
				),
				'condition'          => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'arrows_size',
			array(
				'label'      => esc_html__( 'Arrows Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array( 'size' => '22' ),
				'range'      => array(
					'px' => array(
						'min'  => 15,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-slider-arrow' => 'font-size: {{SIZE}}{{UNIT}}; line-height: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'arrows_position',
			array(
				'label'      => esc_html__( 'Align Arrows', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => -100,
						'max'  => 50,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-arrow-next' => 'right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-arrow-prev' => 'left: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_arrows_style' );

		$this->start_controls_tab(
			'tab_arrows_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_control(
			'arrows_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-slider-arrow' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_control(
			'arrows_color_normal',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-slider-arrow' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'arrows_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-slider-arrow',
				'condition'   => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'arrows_border_radius_normal',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-slider-arrow' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_arrows_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_control(
			'arrows_bg_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_control(
			'arrows_color_hover',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->add_control(
			'arrows_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'arrows_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-slider-arrow' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'separator'  => 'before',
				'condition'  => array(
					'layout'   => 'carousel',
					'arrows'   => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	public function register_style_dots_controls() {
		$this->start_controls_section(
			'section_dots_style',
			array(
				'label'     => esc_html__( 'Dots', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_control(
			'dots_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'inside'     => esc_html__( 'Inside', 'powerpack' ),
					'outside'    => esc_html__( 'Outside', 'powerpack' ),
				],
				'default'               => 'outside',
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			]
		);

		$this->add_responsive_control(
			'dots_size',
			array(
				'label'      => esc_html__( 'Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 2,
						'max'  => 40,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'dots_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 1,
						'max'  => 30,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_dots_style' );

		$this->start_controls_tab(
			'tab_dots_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_control(
			'dots_color_normal',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'dots_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet',
				'condition'   => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'dots_border_radius_normal',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'dots_margin',
			array(
				'label'              => esc_html__( 'Margin', 'powerpack' ),
				'type'               => Controls_Manager::DIMENSIONS,
				'size_units'         => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'allowed_dimensions' => 'vertical',
				'placeholder'        => array(
					'top'    => '',
					'right'  => 'auto',
					'bottom' => '',
					'left'   => 'auto',
				),
				'selectors'          => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullets' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'          => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_active',
			array(
				'label'     => esc_html__( 'Active', 'powerpack' ),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_control(
			'dots_color_active',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_control(
			'dots_border_color_active',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_control(
			'dots_color_hover',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet:hover' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->add_control(
			'dots_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-container-wrap .swiper-pagination-bullet:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'    => 'carousel',
					'dots'      => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * List all product categories.
	 *
	 * @return string
	 */
	public function query_product_categories() {

		$settings    = $this->get_settings();
		$include_ids = array();
		$exclude_ids = array();

		$atts = array(
			'limit'   => ( $settings['cats_count'] ) ? $settings['cats_count'] : '-1',
			'columns' => ( $settings['columns'] ) ? $settings['columns'] : '4',
			'parent'  => '',
		);

		if ( 'top' === $settings['category_filter_rule'] ) {
			$atts['parent'] = 0;
		} elseif ( 'include' === $settings['category_filter_rule'] && is_array( $settings['category_filter'] ) ) {
			$include_ids = array_filter( array_map( 'trim', $settings['category_filter'] ) );
		} elseif ( 'exclude' === $settings['category_filter_rule'] && is_array( $settings['category_filter'] ) ) {
			$exclude_ids = array_filter( array_map( 'trim', $settings['category_filter'] ) );
		}

		$hide_empty = ( 'yes' === $settings['display_empty_cat'] ) ? 0 : 1;

		// Get terms and workaround WP bug with parents/pad counts.
		$args = array(
			'orderby'    => ( $settings['orderby'] ) ? $settings['orderby'] : 'name',
			'order'      => ( $settings['order'] ) ? $settings['order'] : 'ASC',
			'hide_empty' => $hide_empty,
			'pad_counts' => true,
			'child_of'   => $atts['parent'],
			'include'    => $include_ids,
			'exclude'    => $exclude_ids,
		);

		$args = apply_filters( 'ppe_woo_categories_query_args', $args, $settings );

		$product_categories = get_terms( 'product_cat', $args );

		if ( '' !== $atts['parent'] ) {
			$product_categories = wp_list_filter(
				$product_categories, array(
					'parent' => $atts['parent'],
				)
			);
		}

		if ( $hide_empty ) {
			foreach ( $product_categories as $key => $category ) {
				if ( 0 === $category->count ) {
					unset( $product_categories[ $key ] );
				}
			}
		}

		$atts['limit'] = intval( $atts['limit'] );

		if ( $atts['limit'] > 0 ) {
			$product_categories = array_slice( $product_categories, 0, $atts['limit'] );
		}

		$columns = absint( $atts['columns'] );

		wc_set_loop_prop( 'columns', $columns );

		/* Category Image */
		remove_action( 'woocommerce_before_subcategory_title', 'woocommerce_subcategory_thumbnail', 10 );
		add_action( 'woocommerce_before_subcategory_title', array( $this, 'woocommerce_category_thumbnail_size' ), 10 );

		/* Category Link */
		remove_action( 'woocommerce_before_subcategory', 'woocommerce_template_loop_category_link_open', 10 );
		add_action( 'woocommerce_before_subcategory', array( $this, 'template_loop_category_link_open' ), 10 );

		/* Category Wrapper */
		add_action( 'woocommerce_before_subcategory', array( $this, 'category_wrap_start' ), 15 );
		add_action( 'woocommerce_after_subcategory', array( $this, 'category_wrap_end' ), 8 );

		/* Content Wrapper */
		add_action( 'woocommerce_before_subcategory_title', array( $this, 'category_content_start' ), 15 );
		add_action( 'woocommerce_after_subcategory_title', array( $this, 'category_content_end' ), 8 );

		if ( 'yes' === $settings['cat_desc'] ) {
			add_action( 'woocommerce_shop_loop_subcategory_title', array( $this, 'category_description' ), 12 );
		}

		/* Category Title */
		remove_action( 'woocommerce_shop_loop_subcategory_title', 'woocommerce_template_loop_category_title', 10 );
		add_action( 'woocommerce_shop_loop_subcategory_title', array( $this, 'template_loop_category_title' ), 10 );

		ob_start();

		if ( $product_categories ) {
			$i = 1;
			$products_count = count( $product_categories );

			if ( 'tiles' === $settings['layout'] ) {
				echo '<div class="products">';

				$tiles_template = ( 'tiles' === $settings['layout'] && $settings['tiles_style'] ) ? $settings['tiles_style'] : '1';

				foreach ( $product_categories as $category ) {

					include POWERPACK_ELEMENTS_PATH . 'modules/woocommerce/templates/content-product-cat-tiles-' . $tiles_template . '.php';
					$i++;
				}

				echo '</div>';

				if ( '1' === $tiles_template ) {
					if ( 4 > $products_count ) {
						echo '</div>';
					}
				} elseif ( '2' === $tiles_template ) {
					if ( 3 > $products_count ) {
						echo '</div>';
					}
				}
			} elseif ( 'carousel' === $settings['layout'] ) {
				echo '<div class="products swiper-wrapper">';

				foreach ( $product_categories as $category ) {

					include POWERPACK_ELEMENTS_PATH . 'modules/woocommerce/templates/content-product-cat-carousel.php';
					$i++;
				}

				echo '</div>';
			} else {
				echo '<ul class="elementor-grid columns-' . esc_attr( $settings['columns'] ) . '">';

				foreach ( $product_categories as $category ) {

					include POWERPACK_ELEMENTS_PATH . 'modules/woocommerce/templates/content-product-cat.php';
					$i++;
				}

				echo '</ul>';
			}
		}

		woocommerce_reset_loop();

		$this->add_render_attribute( 'categories-inner', 'class', [
			'pp-woo-categories-inner',
		] );

		if ( 'carousel' === $settings['layout'] ) {
			$this->add_render_attribute(
				'categories-inner', [
					'class' => [
						'pp-swiper-slider',
						'swiper'
					],
				]
			);

			if ( is_rtl() ) {
				$this->add_render_attribute( 'categories-inner', 'dir', 'rtl' );
			}
		}

		$inner_content = ob_get_clean();

		/* Category Image */
		remove_action( 'woocommerce_before_subcategory_title', array( $this, 'woocommerce_category_thumbnail_size' ), 10 );
		add_action( 'woocommerce_before_subcategory_title', 'woocommerce_subcategory_thumbnail', 10 );

		/* Category Link */
		add_action( 'woocommerce_before_subcategory', 'woocommerce_template_loop_category_link_open', 10 );
		remove_action( 'woocommerce_before_subcategory', array( $this, 'template_loop_category_link_open' ), 10 );

		/* Category Wrapper */
		remove_action( 'woocommerce_before_subcategory', array( $this, 'category_wrap_start' ), 15 );
		remove_action( 'woocommerce_after_subcategory', array( $this, 'category_wrap_end' ), 8 );

		if ( 'yes' === $settings['cat_desc'] ) {
			remove_action( 'woocommerce_after_subcategory', array( $this, 'category_description' ), 8 );
		}

		/* Category Title */
		remove_action( 'woocommerce_shop_loop_subcategory_title', array( $this, 'template_loop_category_title' ), 10 );
		add_action( 'woocommerce_shop_loop_subcategory_title', 'woocommerce_template_loop_category_title', 10 );

		return '<div ' . $this->get_render_attribute_string( 'categories-inner' ) . '>' . $inner_content . '</div>';
	}

	/**
	 * Get Product Image size.
	 *
	 * @param object $size Category Image Size.
	 */
	public function woocommerce_category_thumbnail_size( $category ) {
		$settings = $this->get_settings();
		$thumbnail_id = get_term_meta( $category->term_id, 'thumbnail_id', true );
		if ( empty( $thumbnail_id ) ) {
			woocommerce_subcategory_thumbnail( $category );
		} else {
			$post_thumb_url = Group_Control_Image_Size::get_attachment_image_src( $thumbnail_id, 'image_size', $settings );
			printf(
				'<img src="%1$s" alt="%2$s">',
				esc_url( $post_thumb_url ),
				esc_attr( $category->name )
			);
		}
	}

	/**
	 * Wrapper Start.
	 *
	 * @param object $category Category object.
	 */
	public function template_loop_category_link_open( $category ) {
		$link = apply_filters( 'pp_woo_category_link', esc_url( get_term_link( $category, 'product_cat' ) ) );

		echo '<a href="' . esc_url( $link ) . '">';
	}

	/**
	 * Wrapper Start.
	 *
	 * @param object $category Category object.
	 */
	public function category_wrap_start( $category ) {
		echo '<div class="pp-product-cat-inner">';
	}


	/**
	 * Wrapper End.
	 *
	 * @param object $category Category object.
	 */
	public function category_wrap_end( $category ) {
		echo '</div>';
	}

	/**
	 * Content Start.
	 *
	 * @param object $category Category object.
	 */
	public function category_content_start( $category ) {
		echo '<div class="pp-product-cat-content-wrap">';
		echo '<div class="pp-product-cat-content">';
	}


	/**
	 * Content End.
	 *
	 * @param object $category Category object.
	 */
	public function category_content_end( $category ) {
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Category Description.
	 *
	 * @param object $category Category object.
	 */
	public function category_description( $category ) {

		$settings = $this->get_settings();

		if ( $category && ! empty( $category->description ) ) {

			echo '<div class="pp-product-cat-desc">';
			if ( $settings['category_desc_limit'] ) {
				echo '<div class="pp-term-description">' . wp_trim_words( wc_format_content( $category->description ), $settings['category_desc_limit'], '' ) . '</div>';//phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			} else {
				echo '<div class="pp-term-description">' . wc_format_content( $category->description ) . '</div>';//phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
			echo '</div>';
		}
	}


	/**
	 * Show the subcategory title in the product loop.
	 *
	 * @param object $category Category object.
	 */
	public function template_loop_category_title( $category ) {

		$settings = $this->get_settings();

		$output         = '<div class="pp-category__title-wrap">';
		$output         .= '<div class="pp-category__title-inner">';
		if ( 'yes' === $settings['cat_title'] ) {
			$output     .= '<h2 class="woocommerce-loop-category__title">';
				$output .= esc_html( $category->name );
			$output     .= '</h2>';
		}

		if ( 'yes' === $settings['product_count'] ) {
			if ( $category->count > 0 ) {
					$output .= sprintf( // WPCS: XSS OK.
						/* translators: 1: number of products */
						_nx( '<mark class="pp-count">%1$s Product</mark>', '<mark class="pp-count">%1$s Products</mark>', $category->count, 'product categories', 'powerpack' ),
						number_format_i18n( $category->count )
					);
			}
		}
		$output .= '</div>';
		$output .= '</div>';

		echo wp_kses_post( $output );
	}

	/**
	 * Set slider attributes.
	 *
	 * @access public
	 */
	public function set_slider_attr() {

		$settings = $this->get_settings();

		if ( 'carousel' !== $settings['layout'] ) {
			return;
		}

		$slides_to_show = ( isset( $settings['slides_to_show'] ) && '' !== $settings['slides_to_show'] ) ? absint( $settings['slides_to_show'] ) : 4;
		$slides_to_show_tablet  = ( isset( $settings['slides_to_show_tablet'] ) && '' !== $settings['slides_to_show_tablet'] ) ? absint( $settings['slides_to_show_tablet'] ) : 3;
		$slides_to_show_mobile  = ( isset( $settings['slides_to_show_mobile'] ) && '' !== $settings['slides_to_show_mobile'] ) ? absint( $settings['slides_to_show_mobile'] ) : 1;

		$slides_to_scroll = ( isset( $settings['slides_to_scroll'] ) && $settings['slides_to_scroll'] ) ? absint( $settings['slides_to_scroll'] ) : 1;
		$slides_to_scroll_tablet  = ( isset( $settings['slides_to_scroll_tablet'] ) && $settings['slides_to_scroll_tablet'] ) ? absint( $settings['slides_to_scroll_tablet'] ) : 1;
		$slides_to_scroll_mobile  = ( isset( $settings['slides_to_scroll_mobile'] ) && $settings['slides_to_scroll_mobile'] ) ? absint( $settings['slides_to_scroll_mobile'] ) : 1;

		$slider_options = [
			'direction'        => 'horizontal',
			'slides_per_view'  => $slides_to_show,
			'slides_to_scroll' => $slides_to_scroll,
			'speed'            => ( $settings['transition_speed'] ) ? absint( $settings['transition_speed'] ) : 600,
			'space_between'    => ( $settings['column_gap']['size'] ) ? $settings['column_gap']['size'] : 10,
			'loop'             => ( 'yes' === $settings['infinite'] ),
			'auto_height'      => true,
		];

		if ( 'yes' === $settings['autoplay'] ) {
			$autoplay_speed = 999999;
			$slider_options['autoplay'] = 'yes';

			if ( ! empty( $settings['autoplay_speed'] ) ) {
				$autoplay_speed = absint( $settings['autoplay_speed'] );
			}

			$slider_options['autoplay_speed'] = $autoplay_speed;
		}

		if ( 'yes' === $settings['dots'] ) {
			$slider_options['pagination'] = 'bullets';
		}

		if ( 'yes' === $settings['arrows'] ) {
			$slider_options['show_arrows'] = true;
		}

		$breakpoints = PP_Helper::elementor()->breakpoints->get_active_breakpoints();

		foreach ( $breakpoints as $device => $breakpoint ) {
			if ( in_array( $device, [ 'mobile', 'tablet', 'desktop' ] ) ) {
				switch ( $device ) {
					case 'desktop':
						$slider_options['slides_per_view'] = absint( $slides_to_show );
						$slider_options['slides_to_scroll'] = absint( $slides_to_scroll );
						$slider_options['space_between'] = ( isset( $settings['column_gap']['size'] ) && $settings['column_gap']['size'] ) ? absint( $settings['column_gap']['size'] ) : 10;
						break;
					case 'tablet':
						$slider_options['slides_per_view_tablet'] = absint( $slides_to_show_tablet );
						$slider_options['slides_to_scroll_tablet'] = absint( $slides_to_scroll_tablet );
						$slider_options['space_between_tablet'] = ( isset( $settings['column_gap_tablet']['size'] ) && $settings['column_gap_tablet']['size'] ) ? absint( $settings['column_gap_tablet']['size'] ) : 10;
						break;
					case 'mobile':
						$slider_options['slides_per_view_mobile'] = absint( $slides_to_show_mobile );
						$slider_options['slides_to_scroll_mobile'] = absint( $slides_to_scroll_mobile );
						$slider_options['space_between_mobile'] = ( isset( $settings['column_gap_mobile']['size'] ) && $settings['column_gap_mobile']['size'] ) ? absint( $settings['column_gap_mobile']['size'] ) : 10;
						break;
				}
			} else {
				if ( isset( $settings['slides_to_show_' . $device]['size'] ) && $settings['slides_to_show_' . $device]['size'] ) {
					$slider_options['slides_to_show_' . $device] = absint( $settings['slides_to_show_' . $device]['size'] );
				}

				if ( isset( $settings['slides_to_scroll_' . $device]['size'] ) && $settings['slides_to_scroll_' . $device]['size'] ) {
					$slider_options['slides_to_scroll_' . $device] = absint( $settings['slides_to_scroll_' . $device]['size'] );
				}

				if ( isset( $settings['column_gap_' . $device]['size'] ) && $settings['column_gap_' . $device]['size'] ) {
					$slider_options['space_between_' . $device] = absint( $settings['column_gap_' . $device]['size'] );
				}
			}
		}

		$this->add_render_attribute(
			'categories-inner', [
				'data-slider-settings' => wp_json_encode( $slider_options ),
			]
		);
	}

			/**
	 * Render team member carousel dots output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_dots() {
		$settings = $this->get_settings();

		if ( 'carousel' !== $settings['layout'] ) {
			return;
		}

		if ( 'yes' === $settings['dots'] ) {
			?>
			<!-- Add Pagination -->
			<div class="swiper-pagination swiper-pagination-<?php echo esc_attr( $this->get_id() ); ?>"></div>
			<?php
		}
	}

	/**
	 * Render team member carousel arrows output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_arrows() {
		$settings = $this->get_settings();

		if ( 'carousel' !== $settings['layout'] ) {
			return;
		}

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
			$this->add_render_attribute( 'arrow-icon', 'class', $settings['arrow'] );
			$this->add_render_attribute( 'arrow-icon', 'aria-hidden', 'true' );
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
				<div class="pp-slider-arrow elementor-swiper-button-prev swiper-button-prev-<?php echo esc_attr( $this->get_id() ); ?>">
					<?php if ( $is_new || $migrated ) :
						Icons_Manager::render_icon( $prev_arrow, [ 'aria-hidden' => 'true' ] );
					else : ?>
						<i <?php $this->print_render_attribute_string( 'arrow-icon' ); ?>></i>
					<?php endif; ?>
				</div>
				<div class="pp-slider-arrow elementor-swiper-button-next swiper-button-next-<?php echo esc_attr( $this->get_id() ); ?>">
					<?php if ( $is_new || $migrated ) :
						Icons_Manager::render_icon( $next_arrow, [ 'aria-hidden' => 'true' ] );
					else : ?>
						<i <?php $this->print_render_attribute_string( 'arrow-icon' ); ?>></i>
					<?php endif; ?>
				</div>
			<?php }
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
		$settings = $this->get_settings();

		$this->add_render_attribute( 'container', 'class', [
			'pp-woocommerce',
			'pp-woo-categories',
			'pp-woo-categories-' . $settings['layout'],
		] );

		if ( 'tiles' === $settings['layout'] ) {
			$this->add_render_attribute( 'container', 'class', [
				'pp-woo-categories-overlay',
			] );
		} else {
			$this->add_render_attribute( 'container', 'class', [
				'pp-woo-categories-' . $settings['content_position'],
			] );
		}

		if ( 'carousel' === $settings['layout'] ) {
			$this->add_render_attribute( 'container', 'class', [
				'swiper-container-wrap',
				//'swiper',
			] );

			if ( $settings['dots_position'] ) {
				$this->add_render_attribute( 'container', 'class', 'swiper-container-wrap-dots-' . $settings['dots_position'] );
			}
		}

		$this->set_slider_attr();
		?>
		<div <?php $this->print_render_attribute_string( 'container' ); ?>>
			<?php echo wp_kses_post( $this->query_product_categories() ); ?>
			<?php
			if ( 'carousel' === $settings['layout'] ) {
				$this->render_dots();
				$this->render_arrows();
			}
			?>
		</div>
		<?php
	}
}
