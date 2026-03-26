<?php
namespace PowerpackElements\Modules\Posts\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Modules\Posts\Widgets\Posts_Base;
use PowerpackElements\Classes\PP_Posts_Helper;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;

// Elementor Classes.
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Icons_Manager;
use Elementor\Repeater;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Timeline Widget
 */
class Timeline extends Posts_Base {

	/**
	 * Retrieve timeline widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Timeline' );
	}

	/**
	 * Retrieve timeline widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Timeline' );
	}

	/**
	 * Retrieve timeline widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Timeline' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Timeline' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the timeline widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return [
				'pp-slick',
				'pp-timeline',
			];
		}

		$settings = $this->get_settings_for_display();
		$scripts = [ 'pp-timeline' ];

		if ( 'horizontal' === $settings['layout'] ) {
			array_push( $scripts, 'pp-slick' );
		}

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
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return [ 'pp-swiper', 'widget-pp-timeline' ];
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'widget-pp-timeline' ];

		if ( 'horizontal' === $settings['layout'] ) {
			array_push( $styles, 'pp-swiper' );
		}

		return $styles;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register timeline widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {

		/* Content Tab: Settings */
		$this->register_content_settings_controls();

		/* Content Tab: Timeline */
		$this->register_content_timeline_items_controls();

		/* Content Tab: Query */
		$this->register_query_section_controls( array( 'source' => 'posts' ), 'timeline', 'yes' );

		/* Content Tab: Posts */
		$this->register_content_posts_controls();

		/* Content Tab: Help Docs */
		$this->register_content_help_docs();

		/* Style Tab: Layout */
		$this->register_style_layout_controls();

		/* Style Tab: Cards */
		$this->register_style_cards_controls();

		/* Style Tab: Marker */
		$this->register_style_marker_controls();

		/* Style Tab: Dates */
		$this->register_style_dates_controls();

		/* Style Tab: Connector */
		$this->register_style_connector_controls();

		/* Style Tab: Arrows */
		$this->register_style_arrows_controls();

		/* Style Tab: Dots */
		$this->register_style_dots_controls();

		/* Style Tab: Button */
		$this->register_style_button_controls();
	}

	/**
	 * Content Tab: Settings
	 */
	protected function register_content_settings_controls() {
		$this->start_controls_section(
			'section_post_settings',
			array(
				'label' => esc_html__( 'Settings', 'powerpack' ),
			)
		);

		$this->add_control(
			'source',
			array(
				'label'   => esc_html__( 'Source', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => array(
					'custom' => esc_html__( 'Custom', 'powerpack' ),
					'posts'  => esc_html__( 'Posts', 'powerpack' ),
				),
				'default' => 'custom',
			)
		);

		$this->add_control(
			'layout',
			array(
				'label'              => esc_html__( 'Layout', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'options'            => array(
					'horizontal' => esc_html__( 'Horizontal', 'powerpack' ),
					'vertical'   => esc_html__( 'Vertical', 'powerpack' ),
				),
				'default'            => 'vertical',
				'frontend_available' => true,
			)
		);

		$slides_per_view = range( 1, 8 );
		$slides_per_view = array_combine( $slides_per_view, $slides_per_view );

		$this->add_responsive_control(
			'columns',
			array(
				'label'              => esc_html__( 'Columns', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => '3',
				'tablet_default'     => '2',
				'mobile_default'     => '1',
				'options'            => $slides_per_view,
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'horizontal',
				),
			)
		);

		$this->add_responsive_control(
			'slides_to_scroll',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Cards to Scroll', 'powerpack' ),
				'description'           => esc_html__( 'Set how many card are scrolled per swipe.', 'powerpack' ),
				'options'               => $slides_per_view,
				'default'               => '1',
				'tablet_default'        => '1',
				'mobile_default'        => '1',
				'frontend_available'    => true,
				'condition'             => [
					'layout'       => 'horizontal',
					'center_mode!' => 'yes',
				],
			]
		);

		$this->add_control(
			'title_html_tag',
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
					'div'  => esc_html__( 'div', 'powerpack' ),
					'span' => esc_html__( 'span', 'powerpack' ),
					'p'    => esc_html__( 'p', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'media_position',
			array(
				'label'   => esc_html__( 'Image Position', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'above-title',
				'options' => array(
					'above-title'   => esc_html__( 'Above Title', 'powerpack' ),
					'below-title'   => esc_html__( 'Below Title', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'equal_height',
			array(
				'label'        => esc_html__( 'Equal Height', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'horizontal',
				),
			)
		);

		$this->add_control(
			'posts_per_page',
			array(
				'label'     => esc_html__( 'Posts Count', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 4,
				'condition' => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'dates',
			array(
				'label'              => esc_html__( 'Date', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'return_value'       => 'yes',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'date_format',
			array(
				'label'     => esc_html__( 'Date Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''         => esc_html__( 'Published Date', 'powerpack' ),
					'ago'      => esc_html__( 'Time Ago', 'powerpack' ),
					'modified' => esc_html__( 'Last Modified Date', 'powerpack' ),
					'key'      => esc_html__( 'Custom Meta Key', 'powerpack' ),
				),
				'default'   => '',
				'condition' => array(
					'source' => 'posts',
					'dates'  => 'yes',
				),
			)
		);

		$this->add_control(
			'timeline_post_date_key',
			array(
				'label'       => esc_html__( 'Custom Meta Key', 'powerpack' ),
				'description' => esc_html__( 'Display the post date stored in custom meta key.', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'label_block' => false,
				'default'     => '',
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'source'      => 'posts',
					'dates'       => 'yes',
					'date_format' => 'key',
				),
			)
		);

		$this->add_control(
			'date_format_select',
			array(
				'label'     => esc_html__( 'Date Format', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''       => esc_html__( 'Default', 'powerpack' ),
					'F j, Y' => date( 'F j, Y' ),
					'Y-m-d'  => date( 'Y-m-d' ),
					'm/d/Y'  => date( 'm/d/Y' ),
					'd/m/Y'  => date( 'd/m/Y' ),
					'custom' => esc_html__( 'Custom', 'powerpack' ),
				),
				'default'   => '',
				'condition' => array(
					'source' => 'posts',
					'dates'  => 'yes',
					'date_format' => [ '', 'modified', 'key' ],
				),
			)
		);

		$this->add_control(
			'timeline_post_date_format',
			array(
				'label'       => esc_html__( 'Custom Format', 'powerpack' ),
				'description' => sprintf(
					/* translators: 1: Link opening tag, 2: 2: Link closing tag. */
					esc_html__( 'Refer to PHP date formats %1$shere%2$s', 'powerpack' ),
					sprintf( '<a href="%s" target="_blank">', 'https://wordpress.org/support/article/formatting-date-and-time/' ),
					'</a>'
				),
				'type'        => Controls_Manager::TEXT,
				'label_block' => false,
				'default'     => get_option( 'date_format' ),
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'source'      => 'posts',
					'dates'       => 'yes',
					'date_format' => [ '', 'modified', 'key' ],
					'date_format_select' => 'custom',
				),
			)
		);

		$this->add_control(
			'card_arrow',
			array(
				'label'              => esc_html__( 'Card Arrow', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'return_value'       => 'yes',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'animate_cards',
			array(
				'label'              => esc_html__( 'Animate Cards', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'vertical',
				),
			)
		);

		$this->add_control(
			'arrows',
			array(
				'label'              => esc_html__( 'Arrows', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'horizontal',
				),
			)
		);

		$this->add_control(
			'dots',
			array(
				'label'              => esc_html__( 'Dots', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'horizontal',
				),
			)
		);

		$this->add_control(
			'infinite_loop',
			array(
				'label'              => esc_html__( 'Infinite Loop', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'horizontal',
				),
			)
		);

		$this->add_control(
			'center_mode',
			array(
				'label'              => esc_html__( 'Center Mode', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout'        => 'horizontal',
					'infinite_loop' => 'yes',
				),
			)
		);

		$this->add_control(
			'autoplay',
			array(
				'label'              => esc_html__( 'Autoplay', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'horizontal',
				),
			)
		);

		$this->add_control(
			'autoplay_speed',
			array(
				'label'              => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'               => Controls_Manager::NUMBER,
				'default'            => 3000,
				'frontend_available' => true,
				'condition'          => array(
					'layout'   => 'horizontal',
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'pause_on_hover',
			array(
				'label'              => esc_html__( 'Pause on Hover', 'powerpack' ),
				'description'        => '',
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout'   => 'horizontal',
					'autoplay' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Timeline
	 */
	protected function register_content_timeline_items_controls() {
		$this->start_controls_section(
			'section_timeline_items',
			array(
				'label'     => esc_html__( 'Timeline', 'powerpack' ),
				'condition' => array(
					'source' => 'custom',
				),
			)
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'timeline_items_tabs' );

		$repeater->start_controls_tab( 'tab_timeline_items_content', array( 'label' => esc_html__( 'Content', 'powerpack' ) ) );

			$repeater->add_control(
				'timeline_item_date',
				array(
					'label'       => esc_html__( 'Date', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => false,
					'default'     => esc_html__( '1 June 2018', 'powerpack' ),
					'dynamic'     => array(
						'active' => true,
					),
					'ai'          => [
						'active' => false,
					],
				)
			);

			$repeater->add_control(
				'timeline_item_title',
				array(
					'label'       => esc_html__( 'Title', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => false,
					'default'     => '',
					'dynamic'     => array(
						'active' => true,
					),
				)
			);

			$repeater->add_control(
				'timeline_item_content',
				array(
					'label'   => esc_html__( 'Content', 'powerpack' ),
					'type'    => Controls_Manager::WYSIWYG,
					'default' => '',
					'dynamic' => array(
						'active' => true,
					),
				)
			);

			$repeater->add_control(
				'timeline_item_link',
				array(
					'label'       => esc_html__( 'Link', 'powerpack' ),
					'type'        => Controls_Manager::URL,
					'dynamic'     => array(
						'active'     => true,
						'categories' => array(
							TagsModule::POST_META_CATEGORY,
							TagsModule::URL_CATEGORY,
						),
					),
					'placeholder' => 'https://www.your-link.com',
					'default'     => array(
						'url' => '',
					),
					'dynamic'     => array(
						'active' => true,
					),
				)
			);

			$repeater->add_control(
				'single_marker_side',
				array(
					'label'     => esc_html__( 'Direction', 'powerpack' ),
					'type'      => Controls_Manager::SELECT,
					'options'   => array(
						''      => esc_html__( 'Default', 'powerpack' ),
						'left'  => esc_html__( 'Left', 'powerpack' ),
						'right' => esc_html__( 'Right', 'powerpack' ),
					),
					'default'   => '',
				)
			);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab( 'tab_timeline_items_image', array( 'label' => esc_html__( 'Image', 'powerpack' ) ) );

		$repeater->add_control(
			'card_image',
			array(
				'label'        => esc_html__( 'Show Image', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$repeater->add_control(
			'image',
			array(
				'label'      => esc_html__( 'Choose Image', 'powerpack' ),
				'type'       => \Elementor\Controls_Manager::MEDIA,
				'default'    => array(
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				),
				'dynamic'    => array(
					'active' => true,
				),
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'card_image',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'       => 'image',
				'exclude'    => array( 'custom' ),
				'include'    => array(),
				'default'    => 'large',
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'card_image',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab( 'tab_timeline_items_style', array( 'label' => esc_html__( 'Style', 'powerpack' ) ) );

		$repeater->add_control(
			'custom_style',
			array(
				'label'        => esc_html__( 'Custom Style', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$repeater->add_control(
			'single_heading_marker',
			array(
				'label'     => esc_html__( 'Marker', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'condition' => array(
					'custom_style' => 'yes',
				),
			)
		);

		$repeater->add_control(
			'single_marker_type',
			array(
				'label'     => esc_html__( 'Marker Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					'global' => esc_html__( 'Global', 'powerpack' ),
					'none'   => esc_html__( 'None', 'powerpack' ),
					'icon'   => esc_html__( 'Icon', 'powerpack' ),
					'image'  => esc_html__( 'Image', 'powerpack' ),
					'text'   => esc_html__( 'Text', 'powerpack' ),
				),
				'default'   => 'global',
				'condition' => array(
					'custom_style' => 'yes',
				),
			)
		);

		$repeater->add_control(
			'marker_icon_single',
			array(
				'label'            => esc_html__( 'Choose Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'single_marker_icon',
				'default'          => array(
					'value'   => 'fas fa-calendar',
					'library' => 'fa-solid',
				),
				'condition'        => array(
					'custom_style'       => 'yes',
					'single_marker_type' => 'icon',
				),
			)
		);

		$repeater->add_control(
			'single_marker_icon_image',
			array(
				'label'     => esc_html__( 'Choose Image', 'powerpack' ),
				'type'      => \Elementor\Controls_Manager::MEDIA,
				'default'   => array(
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				),
				'condition' => array(
					'custom_style'       => 'yes',
					'single_marker_type' => 'image',
				),
			)
		);

		$repeater->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'      => 'single_marker_icon_image',
				'include'   => array(),
				'default'   => 'large',
				'condition' => array(
					'custom_style'       => 'yes',
					'single_marker_type' => 'image',
				),
			)
		);

		$repeater->add_control(
			'single_marker_text',
			array(
				'label'     => esc_html__( 'Enter Marker Text', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '',
				'condition' => array(
					'custom_style'       => 'yes',
					'single_marker_type' => 'text',
				),
			)
		);

		$repeater->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'single_marker_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} {{CURRENT_ITEM}} .pp-timeline-marker',
				'condition' => array(
					'custom_style'       => 'yes',
					'single_marker_type' => 'text',
				),
			)
		);

		$repeater->add_control(
			'single_marker_color',
			array(
				'label'      => esc_html__( 'Marker Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} {{CURRENT_ITEM}} .pp-timeline-marker' => 'color: {{VALUE}}',
					'{{WRAPPER}} {{CURRENT_ITEM}} .pp-timeline-marker svg' => 'fill: {{VALUE}}',
				),
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'custom_style',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_control(
			'single_marker_bg_color',
			array(
				'label'      => esc_html__( 'Background Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} {{CURRENT_ITEM}} .pp-timeline-marker' => 'background-color: {{VALUE}}',
				),
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'custom_style',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_control(
			'single_heading_card',
			array(
				'label'     => esc_html__( 'Card', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'custom_style' => 'yes',
				),
			)
		);

		$repeater->add_control(
			'single_card_background_color',
			array(
				'label'      => esc_html__( 'Background Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline {{CURRENT_ITEM}} .pp-timeline-card' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline {{CURRENT_ITEM}} .pp-timeline-arrow' => 'color: {{VALUE}}',
				),
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'custom_style',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_control(
			'single_card_border_color',
			array(
				'label'      => esc_html__( 'Border Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline {{CURRENT_ITEM}} .pp-timeline-card' => 'border-color: {{VALUE}}',
				),
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'custom_style',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_control(
			'single_heading_title',
			array(
				'label'     => esc_html__( 'Content', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'custom_style' => 'yes',
				),
			)
		);

		$repeater->add_control(
			'single_title_color',
			array(
				'label'      => esc_html__( 'Title Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline {{CURRENT_ITEM}} .pp-timeline-card-title' => 'color: {{VALUE}}',
				),
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'custom_style',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_control(
			'single_content_color',
			array(
				'label'      => esc_html__( 'Content Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline {{CURRENT_ITEM}} .pp-timeline-card-content' => 'color: {{VALUE}}',
				),
				'separator'  => 'after',
				'conditions' => array(
					'terms' => array(
						array(
							'name'     => 'custom_style',
							'operator' => '==',
							'value'    => 'yes',
						),
					),
				),
			)
		);

		$repeater->add_control(
			'timeline_item_css_classes',
			array(
				'label'     => esc_html__( 'CSS Classes', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '',
				'ai'        => [
					'active' => false,
				],
			)
		);

		$repeater->end_controls_tab();

		$repeater->end_controls_tabs();

		$this->add_control(
			'items',
			array(
				'label'       => '',
				'type'        => Controls_Manager::REPEATER,
				'default'     => array(
					array(
						'timeline_item_date'    => esc_html__( '1 May 2018', 'powerpack' ),
						'timeline_item_title'   => esc_html__( 'Timeline Item 1', 'powerpack' ),
						'timeline_item_content' => esc_html__( 'I am timeline item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
					array(
						'timeline_item_date'    => esc_html__( '1 June 2018', 'powerpack' ),
						'timeline_item_title'   => esc_html__( 'Timeline Item 2', 'powerpack' ),
						'timeline_item_content' => esc_html__( 'I am timeline item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
					array(
						'timeline_item_date'    => esc_html__( '1 July 2018', 'powerpack' ),
						'timeline_item_title'   => esc_html__( 'Timeline Item 3', 'powerpack' ),
						'timeline_item_content' => esc_html__( 'I am timeline item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
					array(
						'timeline_item_date'    => esc_html__( '1 August 2018', 'powerpack' ),
						'timeline_item_title'   => esc_html__( 'Timeline Item 4', 'powerpack' ),
						'timeline_item_content' => esc_html__( 'I am timeline item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
				),
				'fields'      => $repeater->get_controls(),
				'title_field' => '{{{ timeline_item_date }}}',
				'condition'   => array(
					'source' => 'custom',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Posts
	 */
	protected function register_content_posts_controls() {
		$this->start_controls_section(
			'section_posts',
			array(
				'label'     => esc_html__( 'Posts', 'powerpack' ),
				'condition' => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'post_title',
			array(
				'label'        => esc_html__( 'Post Title', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'show',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'show',
				'condition'    => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'post_image',
			array(
				'label'        => esc_html__( 'Post Image', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'show',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'show',
				'condition'    => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'      => 'image_size',
				'label'     => esc_html__( 'Image Size', 'powerpack' ),
				'default'   => 'medium_large',
				'condition' => array(
					'source'     => 'posts',
					'post_image' => 'show',
				),
			)
		);

		$this->add_control(
			'post_content',
			array(
				'label'        => esc_html__( 'Post Content', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'show',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'show',
				'condition'    => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'content_type',
			array(
				'label'     => esc_html__( 'Content Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					'excerpt'         => esc_html__( 'Excerpt', 'powerpack' ),
					'limited-content' => esc_html__( 'Limited Content', 'powerpack' ),
				),
				'default'   => 'excerpt',
				'condition' => array(
					'source'       => 'posts',
					'post_content' => 'show',
				),
			)
		);

		$this->add_control(
			'content_length',
			array(
				'label'     => esc_html__( 'Content Limit', 'powerpack' ),
				'title'     => esc_html__( 'Words', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 40,
				'min'       => 0,
				'step'      => 1,
				'condition' => array(
					'source'       => 'posts',
					'post_content' => 'show',
					'content_type' => 'limited-content',
				),
			)
		);

		$this->add_control(
			'link_type',
			array(
				'label'     => esc_html__( 'Link Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''       => esc_html__( 'None', 'powerpack' ),
					'title'  => esc_html__( 'Title', 'powerpack' ),
					'button' => esc_html__( 'Button', 'powerpack' ),
					'card'   => esc_html__( 'Card', 'powerpack' ),
				),
				'default'   => 'title',
				'condition' => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'posts_link_to',
			[
				'label'     => esc_html__( 'Link to', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'post_url',
				'options'   => [
					'post_url'  => esc_html__( 'Post URL', 'powerpack' ),
					'custom'    => esc_html__( 'Custom URL', 'powerpack' ),
				],
				'condition' => [
					'source' => 'posts',
				],
			]
		);

		$this->add_control(
			'posts_link',
			[
				'label'       => esc_html__( 'Link', 'powerpack' ),
				'show_label'  => false,
				'type'        => Controls_Manager::URL,
				'dynamic'     => [
					'active'  => true,
				],
				'condition'   => [
					'source'        => 'posts',
					'posts_link_to' => 'custom',
				],
			]
		);

		$this->add_control(
			'button_text',
			array(
				'label'       => esc_html__( 'Button Text', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'label_block' => false,
				'default'     => esc_html__( 'Read More', 'powerpack' ),
				'condition'   => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'post_meta',
			array(
				'label'        => esc_html__( 'Post Meta', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'show',
				'condition'    => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'meta_items_divider',
			array(
				'label'     => esc_html__( 'Meta Items Divider', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '-',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-meta > span:not(:last-child):after' => 'content: "{{UNIT}}";',
				),
				'ai'        => [
					'active' => false,
				],
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->add_control(
			'post_author',
			array(
				'label'        => esc_html__( 'Post Author', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'show',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'show',
				'condition'    => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->add_control(
			'post_category',
			array(
				'label'        => esc_html__( 'Post Terms', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'show',
				'condition'    => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$post_types = PP_Posts_Helper::get_post_types();

		foreach ( $post_types as $post_type_slug => $post_type_label ) {

			$taxonomy = PP_Posts_Helper::get_post_taxonomies( $post_type_slug );

			if ( ! empty( $taxonomy ) ) {

				$related_tax = array();

				// Get all taxonomy values under the taxonomy.
				foreach ( $taxonomy as $index => $tax ) {

					$terms = get_terms( $index );

					$related_tax[ $index ] = $tax->label;
				}

				// Add control for all taxonomies.
				$this->add_control(
					'tax_badge_' . $post_type_slug,
					array(
						'label'       => esc_html__( 'Select Taxonomy', 'powerpack' ),
						'type'        => Controls_Manager::SELECT2,
						'label_block' => true,
						'options'     => $related_tax,
						'multiple'    => true,
						'default'     => array_keys( $related_tax )[0],
						'condition'   => array(
							'source'        => 'posts',
							'post_type'     => $post_type_slug,
							'post_meta'     => 'show',
							'post_category' => 'show',
						),
					)
				);
			}
		}

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Help Docs
	 *
	 * @since 1.4.8
	 * @access protected
	 */
	protected function register_content_help_docs() {

		$help_docs = PP_Config::get_widget_help_links( 'Timeline' );

		if ( ! empty( $help_docs ) ) {

			/**
			 * Content Tab: Help Docs
			 *
			 * @since 1.4.8
			 * @access protected
			 */
			$this->start_controls_section(
				'section_help_docs',
				array(
					'label' => esc_html__( 'Help Docs', 'powerpack' ),
				)
			);

			$hd_counter = 1;
			foreach ( $help_docs as $hd_title => $hd_link ) {
				$this->add_control(
					'help_doc_' . $hd_counter,
					array(
						'type'            => Controls_Manager::RAW_HTML,
						'raw'             => sprintf( '%1$s ' . $hd_title . ' %2$s', '<a href="' . $hd_link . '" target="_blank" rel="noopener">', '</a>' ),
						'content_classes' => 'pp-editor-doc-links',
					)
				);

				$hd_counter++;
			}

			$this->end_controls_section();
		}
	}

	/**
	 * Style Tab: Layout
	 */
	protected function register_style_layout_controls() {
		$this->start_controls_section(
			'section_layout_style',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'direction',
			array(
				'label'              => esc_html__( 'Direction', 'powerpack' ),
				'type'               => Controls_Manager::CHOOSE,
				'toggle'             => true,
				'default'            => 'center',
				'tablet_default'     => 'left',
				'mobile_default'     => 'left',
				'options'            => array(
					'left'   => array(
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-h-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-h-align-center',
					),
					'right'  => array(
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-h-align-right',
					),
				),
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'vertical',
				),
			)
		);

		$this->add_control(
			'cards_arrows_alignment',
			array(
				'label'       => esc_html__( 'Arrows Alignment', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => false,
				'options'     => array(
					'top'    => array(
						'title' => esc_html__( 'Top', 'powerpack' ),
						'icon'  => 'eicon-v-align-top',
					),
					'middle' => array(
						'title' => esc_html__( 'Middle', 'powerpack' ),
						'icon'  => 'eicon-v-align-middle',
					),
					'bottom' => array(
						'title' => esc_html__( 'Bottom', 'powerpack' ),
						'icon'  => 'eicon-v-align-bottom',
					),
				),
				'default'     => 'top',
				'condition'   => array(
					'layout' => 'vertical',
				),
			)
		);

		$this->add_responsive_control(
			'items_spacing',
			array(
				'label'      => esc_html__( 'Items Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => '',
				),
				'range'      => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-vertical .pp-timeline-item:not(:last-child)' => 'margin-bottom: {{SIZE}}px;',
					'{{WRAPPER}} .pp-timeline-horizontal .pp-timeline-item' => 'padding-left: {{SIZE}}px;',
					'{{WRAPPER}} .pp-timeline-horizontal .slick-list'       => 'margin-left: -{{SIZE}}px;',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Cards
	 */
	protected function register_style_cards_controls() {
		$this->start_controls_section(
			'section_cards_style',
			array(
				'label' => esc_html__( 'Cards', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'cards_padding',
			array(
				'label'      => esc_html__( 'Cards Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'content_padding',
			array(
				'label'      => esc_html__( 'Content Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'cards_text_align',
			array(
				'label'     => esc_html__( 'Text Align', 'powerpack' ),
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
				'default'   => 'left',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->start_controls_tabs( 'card_tabs' );

		$this->start_controls_tab( 'tab_card_normal', array( 'label' => esc_html__( 'Normal', 'powerpack' ) ) );

		$this->add_control(
			'cards_bg',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline .pp-timeline-arrow' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'cards_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-timeline .pp-timeline-card',
			)
		);

		$this->add_responsive_control(
			'cards_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'cards_box_shadow',
			array(
				'label'        => esc_html__( 'Box Shadow', 'powerpack' ),
				'type'         => \Elementor\Controls_Manager::POPOVER_TOGGLE,
				'label_off'    => esc_html__( 'Default', 'powerpack' ),
				'label_on'     => esc_html__( 'Custom', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->start_popover();

			$this->add_control(
				'cards_box_shadow_color',
				array(
					'label'     => esc_html__( 'Color', 'powerpack' ),
					'type'      => Controls_Manager::COLOR,
					'default'   => 'rgba(0,0,0,0.5)',
					'selectors' => array(
						'{{WRAPPER}} .pp-timeline-card-wrapper' => 'filter: drop-shadow({{cards_box_shadow_horizontal.SIZE}}px {{cards_box_shadow_vertical.SIZE}}px {{cards_box_shadow_blur.SIZE}}px {{VALUE}}); -webkit-filter: drop-shadow({{cards_box_shadow_horizontal.SIZE}}px {{cards_box_shadow_vertical.SIZE}}px {{cards_box_shadow_blur.SIZE}}px {{VALUE}});',
					),
					'condition' => array(
						'cards_box_shadow' => 'yes',
					),
				)
			);

			$this->add_control(
				'cards_box_shadow_horizontal',
				array(
					'label'     => esc_html__( 'Horizontal', 'powerpack' ),
					'type'      => Controls_Manager::SLIDER,
					'default'   => array(
						'size' => 0,
						'unit' => 'px',
					),
					'range'     => array(
						'px' => array(
							'min'  => -100,
							'max'  => 100,
							'step' => 1,
						),
					),
					'condition' => array(
						'cards_box_shadow' => 'yes',
					),
				)
			);

			$this->add_control(
				'cards_box_shadow_vertical',
				array(
					'label'     => esc_html__( 'Vertical', 'powerpack' ),
					'type'      => Controls_Manager::SLIDER,
					'default'   => array(
						'size' => 0,
						'unit' => 'px',
					),
					'range'     => array(
						'px' => array(
							'min'  => -100,
							'max'  => 100,
							'step' => 1,
						),
					),
					'condition' => array(
						'cards_box_shadow' => 'yes',
					),
				)
			);

			$this->add_control(
				'cards_box_shadow_blur',
				array(
					'label'     => esc_html__( 'Blur', 'powerpack' ),
					'type'      => Controls_Manager::SLIDER,
					'default'   => array(
						'size' => 4,
						'unit' => 'px',
					),
					'range'     => array(
						'px' => array(
							'min'  => 1,
							'max'  => 10,
							'step' => 1,
						),
					),
					'condition' => array(
						'cards_box_shadow' => 'yes',
					),
				)
			);

		$this->end_popover();

		$this->add_control(
			'heading_image',
			array(
				'label'     => esc_html__( 'Image', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_responsive_control(
			'image_width',
			[
				'label'      => esc_html__( 'Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'default'    => [
					'unit' => '%',
				],
				'range' => [
					'%' => [
						'min' => 1,
						'max' => 100,
					],
					'px' => [
						'min' => 1,
						'max' => 1000,
					],
					'vw' => [
						'min' => 1,
						'max' => 100,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-timeline-card-image img' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'image_max_width',
			[
				'label'      => esc_html__( 'Max Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'default'    => [
					'unit' => '%',
				],
				'range'      => [
					'%' => [
						'min' => 1,
						'max' => 100,
					],
					'px' => [
						'min' => 1,
						'max' => 1000,
					],
					'vw' => [
						'min' => 1,
						'max' => 100,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-timeline-card-image img' => 'max-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'image_height',
			[
				'label'      => esc_html__( 'Height', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vh', 'custom' ],
				'range'      => [
					'px' => [
						'min' => 1,
						'max' => 500,
					],
					'vh' => [
						'min' => 1,
						'max' => 100,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-timeline-card-image img' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'image_object_fit',
			[
				'label'     => esc_html__( 'Object Fit', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					''        => esc_html__( 'Default', 'powerpack' ),
					'fill'    => esc_html__( 'Fill', 'powerpack' ),
					'cover'   => esc_html__( 'Cover', 'powerpack' ),
					'contain' => esc_html__( 'Contain', 'powerpack' ),
				],
				'default'   => '',
				'selectors' => [
					'{{WRAPPER}} .pp-timeline-card-image img' => 'object-fit: {{VALUE}};',
				],
				'condition' => [
					'image_height[size]!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'image_object_position',
			[
				'label'     => esc_html__( 'Object Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'center center' => esc_html__( 'Center Center', 'powerpack' ),
					'center left'   => esc_html__( 'Center Left', 'powerpack' ),
					'center right'  => esc_html__( 'Center Right', 'powerpack' ),
					'top center'    => esc_html__( 'Top Center', 'powerpack' ),
					'top left'      => esc_html__( 'Top Left', 'powerpack' ),
					'top right'     => esc_html__( 'Top Right', 'powerpack' ),
					'bottom center' => esc_html__( 'Bottom Center', 'powerpack' ),
					'bottom left'   => esc_html__( 'Bottom Left', 'powerpack' ),
					'bottom right'  => esc_html__( 'Bottom Right', 'powerpack' ),
				],
				'default'   => 'center center',
				'selectors' => [
					'{{WRAPPER}} .pp-timeline-card-image img' => 'object-position: {{VALUE}};',
				],
				'condition' => [
					'image_height[size]!' => '',
					'image_object_fit' => 'cover',
				],
			]
		);

		$this->add_responsive_control(
			'image_align',
			[
				'label' => esc_html__( 'Alignment', 'powerpack' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .pp-timeline-card-image' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'     => 'image_border',
				'label'    => esc_html__( 'Border', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-timeline-card-image img',
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'image_box_shadow',
				'selector' => '{{WRAPPER}} .pp-timeline-card-image img',
			)
		);

		$this->add_responsive_control(
			'image_margin_bottom',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => 20,
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-card-image' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'heading_title',
			array(
				'label'     => esc_html__( 'Title', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'title_bg',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card-title-wrap' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'title_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card-title' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'title_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-timeline-card-title',
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'title_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-timeline .pp-timeline-card-title-wrap',
			)
		);

		$this->add_responsive_control(
			'title_margin_bottom',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-card-title-wrap' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'title_padding',
			array(
				'label'      => esc_html__( 'Title Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card-title-wrap' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'heading_content',
			array(
				'label'     => esc_html__( 'Content', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'card_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-card' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'card_text_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-timeline-card',
			)
		);

		$this->add_control(
			'meta_content',
			array(
				'label'     => esc_html__( 'Post Meta', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->add_control(
			'meta_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-meta' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'meta_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-timeline-meta',
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->add_responsive_control(
			'meta_items_gap',
			array(
				'label'      => esc_html__( 'Meta Items Gap', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => 10,
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 60,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-meta > span:not(:last-child)' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-timeline-meta > span:not(:last-child):after' => 'margin-left: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->add_responsive_control(
			'meta_margin_bottom',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => 20,
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 60,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-meta' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'source'    => 'posts',
					'post_meta' => 'show',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'tab_card_hover', array( 'label' => esc_html__( 'Hover', 'powerpack' ) ) );

		$this->add_control(
			'card_bg_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-card' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-arrow' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'title_bg_hover',
			array(
				'label'     => esc_html__( 'Title Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-card-title-wrap' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_title_color_hover',
			array(
				'label'     => esc_html__( 'Title Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-card-title' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_title_border_color_hover',
			array(
				'label'     => esc_html__( 'Title Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-card-title-wrap' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_color_hover',
			array(
				'label'     => esc_html__( 'Content Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-card' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item:hover .pp-timeline-card' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'tab_card_focused', array( 'label' => esc_html__( 'Focused', 'powerpack' ) ) );

		$this->add_control(
			'card_bg_focused',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-card, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-card' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-arrow, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-arrow' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'title_bg_focused',
			array(
				'label'     => esc_html__( 'Title Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-card-title-wrap, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-card-title-wrap' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_title_color_focused',
			array(
				'label'     => esc_html__( 'Title Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-card-title, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-card-title' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_title_border_color_focused',
			array(
				'label'     => esc_html__( 'Title Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-card-title-wrap, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-card-title-wrap' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_color_focused',
			array(
				'label'     => esc_html__( 'Content Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-card, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-card' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'card_border_color_focused',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline .pp-timeline-item-active .pp-timeline-card, {{WRAPPER}} .pp-timeline .slick-current .pp-timeline-card' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Marker
	 */
	protected function register_style_marker_controls() {
		$this->start_controls_section(
			'section_marker_style',
			array(
				'label' => esc_html__( 'Marker', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'marker_type',
			array(
				'label'       => esc_html__( 'Type', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => false,
				'toggle'      => false,
				'options'     => array(
					'none'   => array(
						'title' => esc_html__( 'None', 'powerpack' ),
						'icon'  => 'eicon-ban',
					),
					'icon'   => array(
						'title' => esc_html__( 'Icon', 'powerpack' ),
						'icon'  => 'eicon-star',
					),
					'image'  => array(
						'title' => esc_html__( 'Icon Image', 'powerpack' ),
						'icon'  => 'eicon-image-bold',
					),
					'number' => array(
						'title' => esc_html__( 'Number', 'powerpack' ),
						'icon'  => 'eicon-number-field',
					),
					'letter' => array(
						'title' => esc_html__( 'Letter', 'powerpack' ),
						'icon'  => 'eicon-t-letter-bold',
					),
				),
				'default'     => 'icon',
			)
		);

		$this->add_control(
			'select_marker_icon',
			array(
				'label'            => esc_html__( 'Choose Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'marker_icon',
				'default'          => array(
					'value'   => 'fas fa-calendar',
					'library' => 'fa-solid',
				),
				'condition'        => array(
					'marker_type' => 'icon',
				),
			)
		);

		$this->add_control(
			'icon_image',
			array(
				'label'     => esc_html__( 'Choose Icon Image', 'powerpack' ),
				'type'      => \Elementor\Controls_Manager::MEDIA,
				'default'   => array(
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				),
				'condition' => array(
					'marker_type' => 'image',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'      => 'icon_image',
				'include'   => array(),
				'default'   => 'large',
				'condition' => array(
					'marker_type' => 'image',
				),
			)
		);

		$this->add_responsive_control(
			'marker_size',
			array(
				'label'      => esc_html__( 'Marker Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 5,
						'max'  => 150,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-marker'     => 'font-size: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .pp-timeline-marker img' => 'width: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'marker_type!' => 'none',
				),
			)
		);

		$this->add_responsive_control(
			'marker_box_size',
			array(
				'label'      => esc_html__( 'Marker Box Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 10,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-marker' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .pp-timeline-connector-wrap' => 'width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-timeline-navigation:before, {{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow' => 'bottom: calc( {{SIZE}}{{UNIT}}/2 );',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'marker_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-timeline-marker',
				'condition' => array(
					'marker_type' => [ 'number', 'letter' ],
				),
			)
		);

		$this->start_controls_tabs( 'marker_tabs' );

		$this->start_controls_tab( 'tab_marker_normal', array( 'label' => esc_html__( 'Normal', 'powerpack' ) ) );

		$this->add_control(
			'marker_color',
			array(
				'label'     => esc_html__( 'Marker Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#ffffff',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-marker'     => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline-marker svg' => 'fill: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'marker_bg',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-marker' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'marker_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-timeline-marker',
			)
		);

		$this->add_responsive_control(
			'marker_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-marker' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'marker_box_shadow',
				'selector' => '{{WRAPPER}} .pp-timeline-marker',
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'tab_marker_hover', array( 'label' => esc_html__( 'Hover', 'powerpack' ) ) );

		$this->add_control(
			'marker_color_hover',
			array(
				'label'     => esc_html__( 'Marker Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item:hover .pp-timeline-marker, {{WRAPPER}} .pp-timeline-marker-wrapper:hover .pp-timeline-marker' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline-item:hover .pp-timeline-marker svg, {{WRAPPER}} .pp-timeline-marker-wrapper:hover .pp-timeline-marker svg' => 'fill: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'marker_bg_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item:hover .pp-timeline-marker, {{WRAPPER}} .pp-timeline-marker-wrapper:hover .pp-timeline-marker' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'marker_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item:hover .pp-timeline-marker, {{WRAPPER}} .pp-timeline-marker-wrapper:hover .pp-timeline-marker' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'tab_marker_focused', array( 'label' => esc_html__( 'Focused', 'powerpack' ) ) );

		$this->add_control(
			'marker_color_focused',
			array(
				'label'     => esc_html__( 'Marker Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-marker, {{WRAPPER}} .slick-current .pp-timeline-marker' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-marker svg, {{WRAPPER}} .slick-current .pp-timeline-marker svg' => 'fill: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'marker_bg_focused',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-marker, {{WRAPPER}} .slick-current .pp-timeline-marker' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'marker_border_color_focused',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-marker, {{WRAPPER}} .slick-current .pp-timeline-marker' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Dates
	 */
	protected function register_style_dates_controls() {
		$this->start_controls_section(
			'section_dates_style',
			array(
				'label'     => esc_html__( 'Dates', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'dates_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-timeline-card-date',
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'dates_tabs' );

		$this->start_controls_tab( 'tab_dates_normal', array( 'label' => esc_html__( 'Normal', 'powerpack' ) ) );

		$this->add_control(
			'dates_bg',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card-date' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_control(
			'dates_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card-date' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'dates_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-timeline-card-date',
				'condition'   => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'dates_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-card-date' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'dates_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-card-date' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'dates_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-timeline-card-date',
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'tab_dates_hover', array( 'label' => esc_html__( 'Hover', 'powerpack' ) ) );

		$this->add_control(
			'dates_bg_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card-date:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_control(
			'dates_color_hover',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card-date:hover' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_control(
			'dates_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-card-date:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'tab_dates_focused', array( 'label' => esc_html__( 'Focused', 'powerpack' ) ) );

		$this->add_control(
			'dates_bg_focused',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-card-date, {{WRAPPER}} .slick-current .pp-timeline-card-date' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_control(
			'dates_color_focused',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-card-date, {{WRAPPER}} .slick-current .pp-timeline-card-date' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->add_control(
			'dates_border_color_focused',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-item-active .pp-timeline-card-date, {{WRAPPER}} .slick-current .pp-timeline-card-date' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'dates' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Connector
	 */
	protected function register_style_connector_controls() {
		$this->start_controls_section(
			'section_connector_style',
			array(
				'label' => esc_html__( 'Connector', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'connector_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => '',
				),
				'range'      => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-vertical.pp-timeline-left .pp-timeline-marker-wrapper' => 'margin-right: {{SIZE}}px;',
					'{{WRAPPER}} .pp-timeline-vertical.pp-timeline-right .pp-timeline-marker-wrapper' => 'margin-left: {{SIZE}}px;',
					'{{WRAPPER}} .pp-timeline-vertical.pp-timeline-center .pp-timeline-marker-wrapper' => 'margin-left: {{SIZE}}px; margin-right: {{SIZE}}px',

					'(tablet){{WRAPPER}} .pp-timeline-vertical.pp-timeline-tablet-left .pp-timeline-marker-wrapper' => 'margin-right: {{SIZE}}px;',
					'(tablet){{WRAPPER}} .pp-timeline-vertical.pp-timeline-tablet-right .pp-timeline-marker-wrapper' => 'margin-left: {{SIZE}}px;',
					'(tablet){{WRAPPER}} .pp-timeline-vertical.pp-timeline-tablet-center .pp-timeline-marker-wrapper' => 'margin-left: {{SIZE}}px; margin-right: {{SIZE}}px',

					'(mobile){{WRAPPER}} .pp-timeline-vertical.pp-timeline-mobile-left .pp-timeline-marker-wrapper' => 'margin-right: {{SIZE}}px !important;',
					'(mobile){{WRAPPER}} .pp-timeline-vertical.pp-timeline-mobile-right .pp-timeline-marker-wrapper' => 'margin-left: {{SIZE}}px !important;',
					'(mobile){{WRAPPER}} .pp-timeline-vertical.pp-timeline-mobile-center .pp-timeline-marker-wrapper' => 'margin-left: {{SIZE}}px !important; margin-right: {{SIZE}}px !important;',

					'{{WRAPPER}} .pp-timeline-horizontal' => 'margin-top: {{SIZE}}px;',
					'{{WRAPPER}} .pp-timeline-navigation .pp-timeline-card-date-wrapper' => 'margin-bottom: {{SIZE}}px;',
				),
			)
		);

		$this->add_responsive_control(
			'connector_thickness',
			array(
				'label'      => esc_html__( 'Thickness', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 1,
						'max'  => 12,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-vertical .pp-timeline-connector' => 'width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-timeline-navigation:before' => 'height: {{SIZE}}{{UNIT}}; transform: translateY(calc({{SIZE}}{{UNIT}}/2))',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_connector' );

		$this->start_controls_tab(
			'tab_connector_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout' => 'vertical',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'     => 'connector_bg',
				'label'    => esc_html__( 'Background', 'powerpack' ),
				'types'    => array( 'classic', 'gradient' ),
				'exclude'  => array( 'image' ),
				'selector' => '{{WRAPPER}} .pp-timeline-connector, {{WRAPPER}} .pp-timeline-navigation:before',
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_connector_progress',
			array(
				'label'     => esc_html__( 'Progress', 'powerpack' ),
				'condition' => array(
					'layout' => 'vertical',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'connector_bg_progress',
				'label'     => esc_html__( 'Background', 'powerpack' ),
				'types'     => array( 'classic', 'gradient' ),
				'exclude'   => array( 'image' ),
				'selector'  => '{{WRAPPER}} .pp-timeline-connector-inner',
				'condition' => array(
					'layout' => 'vertical',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Arrows
	 */
	protected function register_style_arrows_controls() {
		$this->start_controls_section(
			'section_arrows_style',
			array(
				'label'     => esc_html__( 'Arrows', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
				'frontend_available' => true,
				'condition'          => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow' => 'font-size: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'arrows_box_size',
			array(
				'label'      => esc_html__( 'Arrows Box Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array( 'size' => '40' ),
				'range'      => array(
					'px' => array(
						'min'  => 15,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}}; transform: translateY(calc({{SIZE}}{{UNIT}}/2))',
				),
				'condition'  => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'align_arrows',
			array(
				'label'      => esc_html__( 'Align Arrows', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => -40,
						'max'  => 0,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-arrow-prev' => 'left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-arrow-next' => 'right: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_arrows_style' );

		$this->start_controls_tab(
			'tab_arrows_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
				'selector'    => '{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow',
				'condition'   => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_arrows_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow:hover' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow:hover' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .pp-timeline-navigation-wrap .pp-slider-arrow:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'horizontal',
					'arrows' => 'yes',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register Dots Style Controls
	 *
	 * @since 2.2.5
	 * @return void
	 */
	protected function register_style_dots_controls() {
		$this->start_controls_section(
			'section_dots_style',
			[
				'label'                 => esc_html__( 'Dots', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'dots_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 2,
						'max'   => 40,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li button' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'dots_spacing',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 1,
						'max'   => 30,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_dots_style' );

		$this->start_controls_tab(
			'tab_dots_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_control(
			'dots_color_normal',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_control(
			'active_dot_color_normal',
			[
				'label'                 => esc_html__( 'Active Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li.slick-active' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'dots_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-slick-slider .slick-dots li',
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_control(
			'dots_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'dots_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'allowed_dimensions'    => 'vertical',
				'placeholder'           => [
					'top'      => '',
					'right'    => 'auto',
					'bottom'   => '',
					'left'     => 'auto',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_control(
			'dots_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li:hover' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->add_control(
			'dots_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slick-slider .slick-dots li:hover' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'layout' => 'horizontal',
					'dots'   => 'yes',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Button
	 * -------------------------------------------------
	 */
	protected function register_style_button_controls() {
		$this->start_controls_section(
			'section_button_style',
			array(
				'label'     => esc_html__( 'Button', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
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
					'{{WRAPPER}} .pp-timeline-button' => 'margin-top: {{SIZE}}px;',
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_size',
			array(
				'label'     => esc_html__( 'Size', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'md',
				'options'   => array(
					'xs' => esc_html__( 'Extra Small', 'powerpack' ),
					'sm' => esc_html__( 'Small', 'powerpack' ),
					'md' => esc_html__( 'Medium', 'powerpack' ),
					'lg' => esc_html__( 'Large', 'powerpack' ),
					'xl' => esc_html__( 'Extra Large', 'powerpack' ),
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_button_style' );

		$this->start_controls_tab(
			'tab_button_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-button' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_text_color_normal',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-button' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'button_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-timeline-button',
				'condition'   => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_responsive_control(
			'button_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'button_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-timeline-button',
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_responsive_control(
			'button_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-timeline-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-timeline-button',
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'info_box_button_icon_heading',
			array(
				'label'     => esc_html__( 'Button Icon', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'source'       => 'posts',
					'link_type'    => 'button',
					'button_icon!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'button_icon_margin',
			array(
				'label'       => esc_html__( 'Margin', 'powerpack' ),
				'type'        => Controls_Manager::DIMENSIONS,
				'size_units'  => array( 'px', 'em', 'rem', 'custom' ),
				'placeholder' => array(
					'top'    => '',
					'right'  => '',
					'bottom' => '',
					'left'   => '',
				),
				'condition'   => array(
					'source'       => 'posts',
					'link_type'    => 'button',
					'button_icon!' => '',
				),
				'selectors'   => array(
					'{{WRAPPER}} .pp-info-box .pp-button-icon' => 'margin-top: {{TOP}}{{UNIT}}; margin-left: {{LEFT}}{{UNIT}}; margin-right: {{RIGHT}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
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
					'{{WRAPPER}} .pp-timeline-button:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_text_color_hover',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-timeline-button:hover' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
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
					'{{WRAPPER}} .pp-timeline-button:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_animation',
			array(
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::HOVER_ANIMATION,
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-timeline-button:hover',
				'condition' => array(
					'source'    => 'posts',
					'link_type' => 'button',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Render timeline widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$timeline_classes = array();

		$timeline_classes[] = 'pp-timeline';

		// Layout.
		if ( $settings['layout'] ) {
			$timeline_classes[] = 'pp-timeline-' . $settings['layout'];
		}

		// Direction.
		if ( isset( $settings['direction'] ) && $settings['direction'] ) {
			$timeline_classes[] = 'pp-timeline-' . $settings['direction'];
		}

		if ( 'yes' === $settings['dates'] ) {
			$timeline_classes[] = 'pp-timeline-dates';
		}

		if ( $settings['cards_arrows_alignment'] ) {
			$timeline_classes[] = 'pp-timeline-arrows-' . $settings['cards_arrows_alignment'];
		}

		$this->add_render_attribute( 'timeline', 'class', $timeline_classes );

		$this->add_render_attribute( 'timeline-wrapper', 'class', 'pp-timeline-wrapper' );
		$this->add_render_attribute( 'timeline-items', 'class', 'pp-timeline-items' );

		if ( 'horizontal' === $settings['layout'] ) {
			$this->add_render_attribute( 'timeline-items', 'class', 'pp-slick-slider' );

			if ( 'yes' === $settings['equal_height'] ) {
				$this->add_render_attribute( 'timeline-items', 'class', 'pp-timeline-equal-height' );
			}
		}

		if ( 'horizontal' === $settings['layout'] && is_rtl() ) {
			$this->add_render_attribute( 'timeline-wrapper', 'data-rtl', 'yes' );
		}

		$this->add_render_attribute( 'post-categories', 'class', 'pp-post-categories' );
		?>
		<div <?php $this->print_render_attribute_string( 'timeline-wrapper' ); ?>>
			<?php $this->render_horizontal_timeline_nav(); ?>

			<div <?php $this->print_render_attribute_string( 'timeline' ); ?>>
				<?php if ( 'vertical' === $settings['layout'] ) { ?>
					<div class="pp-timeline-connector-wrap">
						<div class="pp-timeline-connector">
							<div class="pp-timeline-connector-inner">
							</div>
						</div>
					</div>
				<?php } ?>
				<div <?php $this->print_render_attribute_string( 'timeline-items' ); ?>>
					<?php
					if ( 'posts' === $settings['source'] ) {
						$this->render_source_posts();
					} elseif ( 'custom' === $settings['source'] ) {
						$this->render_source_custom();
					}
					?>
				</div>
			</div>
		</div>
		<?php
	}

	protected function render_arrows() {
		$settings = $this->get_settings_for_display();

		if ( 'yes' === $settings['arrows'] ) {
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
				<div class="pp-slider-arrow pp-arrow-prev pp-arrow-prev-<?php echo esc_attr( $this->get_id() ); ?>" role="button" tabindex="0">
					<?php if ( $is_new || $migrated ) :
						Icons_Manager::render_icon( $prev_arrow, [ 'aria-hidden' => 'true' ] );
					else : ?>
						<i <?php $this->print_render_attribute_string( 'arrow-icon' ); ?>></i>
					<?php endif; ?>
				</div>
				<div class="pp-slider-arrow pp-arrow-next pp-arrow-next-<?php echo esc_attr( $this->get_id() ); ?>" role="button" tabindex="0">
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
	 * Render vertical timeline output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_horizontal_timeline_nav() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'navigation', 'class', 'pp-timeline-navigation' );

		if ( 'horizontal' === $settings['layout'] ) { ?>
			<div class="pp-timeline-navigation-wrap">
				<?php $this->render_arrows(); ?>

				<div <?php $this->print_render_attribute_string( 'navigation' ); ?>>
					<?php
					$i = 1;
					if ( 'custom' === $settings['source'] ) {
						foreach ( $settings['items'] as $index => $item ) {
							$item_key = $this->get_repeater_setting_key( 'h_custom_item', 'items', $index );

							$this->add_render_attribute(
								$item_key,
								'class',
								array(
									'pp-timeline-nav-item',
									'elementor-repeater-item-' . esc_attr( $item['_id'] ),
								)
							);
				
							if ( $item['timeline_item_css_classes'] ) {
								$this->add_render_attribute( $item_key, 'class', $item['timeline_item_css_classes'] );
							}
							?>
							<div <?php $this->print_render_attribute_string( $item_key ); ?>>
								<?php
								$date = $item['timeline_item_date'];

								$this->render_connector_marker( $i, $date, $item );

								$i++;
								?>
							</div>
							<?php
						}
					} if ( 'posts' === $settings['source'] ) {
						/* $args        = $this->query_posts_args( '', '', '', '', '', 'timeline', 'yes' );
						$posts_query = new \WP_Query( $args ); */
						$this->query_posts( '', '', '', '', '', 'timeline', 'yes' );
						$posts_query = $this->get_query();

						if ( $posts_query->have_posts() ) :
							while ( $posts_query->have_posts() ) :
								$posts_query->the_post();
								?>
								<div class="pp-timeline-nav-item pp-timeline-item-<?php echo esc_attr( $i ); ?>">
								<?php
								$date = $this->pp_get_date( $settings );

								$this->render_connector_marker( $i, $date );
								?>
								</div>
								<?php
								$i++;
							endwhile;
						endif;
						wp_reset_postdata();
					}
					?>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * Render custom content output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @param  int    $number  Item count.
	 * @param  string $date    Item Date.
	 * @param  array  $item    Item.
	 *
	 * @access protected
	 */
	protected function render_connector_marker( $number = '', $date = '', $item = '' ) {
		$settings = $this->get_settings_for_display();

		$fallback_defaults = array(
			'fa fa-check',
			'fa fa-calendar',
		);

		$migration_allowed = Icons_Manager::is_migration_allowed();

		// add old default.
		if ( ! isset( $item['single_marker_icon'] ) && ! $migration_allowed ) {
			$item['single_marker_icon'] = isset( $fallback_defaults[ $index ] ) ? $fallback_defaults[ $index ] : 'fa fa-calendar';
		}

		$migrated_single = isset( $item['__fa4_migrated']['marker_icon_single'] );
		$is_new_single   = ! isset( $item['single_marker_icon'] ) && $migration_allowed;

		// Global Icon.
		if ( ! isset( $settings['marker_icon'] ) && ! $migration_allowed ) {
			// add old default.
			$settings['marker_icon'] = 'fa fa-calendar';
		}

		$has_icon = ! empty( $settings['marker_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['marker_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_icon && ! empty( $settings['select_marker_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_marker_icon'] );
		$is_new   = ! isset( $settings['marker_icon'] ) && $migration_allowed;
		?>
		<div class="pp-timeline-marker-wrapper">
			<?php if ( 'horizontal' === $settings['layout'] && 'yes' === $settings['dates'] ) { ?>
				<div class="pp-timeline-card-date-wrapper">
					<div class="pp-timeline-card-date">
						<?php echo esc_html( $date ); ?>
					</div>
				</div>
			<?php } ?>

			<div class="pp-timeline-marker">
				<?php
				if ( 'custom' === $settings['source'] && 'yes' === $item['custom_style'] && 'global' !== $item['single_marker_type'] ) {
					if ( 'icon' === $item['single_marker_type'] ) {
						if ( ! empty( $item['single_marker_icon'] ) || ( ! empty( $item['marker_icon_single']['value'] ) && $is_new_single ) ) {
							echo '<span class="pp-icon">';
							if ( $is_new_single || $migrated_single ) {
								Icons_Manager::render_icon( $item['marker_icon_single'], array( 'aria-hidden' => 'true' ) );
							} else {
								?>
								<i class="<?php echo esc_attr( $item['single_marker_icon'] ); ?>" aria-hidden="true"></i>
								<?php
							}
							echo '</span>';
						}
					} elseif ( 'image' === $item['single_marker_type'] ) {
						echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $item, 'single_marker_icon_image', 'single_marker_icon_image' ) );
					} elseif ( 'text' === $item['single_marker_type'] ) {
						echo wp_kses_post( $item['single_marker_text'] );
					}
				} else {
					if ( 'icon' === $settings['marker_type'] && $has_icon ) {
						?>
						<span class="pp-icon">
						<?php
						if ( $is_new || $migrated ) {
							Icons_Manager::render_icon( $settings['select_marker_icon'], array( 'aria-hidden' => 'true' ) );
						} elseif ( ! empty( $settings['marker_icon'] ) ) {
							?>
							<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
							<?php
						}
						?>
						</span>
						<?php
					} elseif ( 'image' === $settings['marker_type'] ) {
						echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'icon_image', 'icon_image' ) );
					} elseif ( 'number' === $settings['marker_type'] ) {
						echo wp_kses_post( $number );
					} elseif ( 'letter' === $settings['marker_type'] ) {
						$alphabets = range( 'A', 'Z' );

						$alphabets = array_combine( range( 1, count( $alphabets ) ), $alphabets );

						echo wp_kses_post( $alphabets[ $number ] );
					}
				}
				?>
			</div>
		</div>
		<?php if ( 'vertical' === $settings['layout'] ) { ?>
			<div class="pp-timeline-card-date-wrapper">
				<?php if ( 'yes' === $settings['dates'] ) { ?>
					<div class="pp-timeline-card-date">
						<?php echo wp_kses_post( $date ); ?>
					</div>
				<?php } ?>
			</div>
		<?php } ?>
		<?php
	}

	/**
	 * Render custom content output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_source_custom() {
		$settings = $this->get_settings_for_display();

		$i = 1;

		foreach ( $settings['items'] as $index => $item ) {
			$item_key    = $this->get_repeater_setting_key( 'item', 'items', $index );
			$title_key   = $this->get_repeater_setting_key( 'timeline_item_title', 'items', $index );
			$content_key = $this->get_repeater_setting_key( 'timeline_item_content', 'items', $index );

			$this->add_inline_editing_attributes( $title_key, 'basic' );
			$this->add_inline_editing_attributes( $content_key, 'advanced' );

			if ( 0 === $i % 2 ) {
				$item_side = 'right';
			} else {
				$item_side = 'left';
			}

			if ( '' !== $item['single_marker_side'] ) {
				$item_side = $item['single_marker_side'];
			}

			$this->add_render_attribute(
				$item_key,
				'class',
				array(
					'pp-timeline-item',
					'pp-timeline-item-' . $item_side,
					'elementor-repeater-item-' . esc_attr( $item['_id'] ),
				)
			);

			if ( 'yes' === $settings['animate_cards'] ) {
				$this->add_render_attribute( $item_key, 'class', 'pp-timeline-item-hidden' );
			}

			if ( $item['timeline_item_css_classes'] ) {
				$this->add_render_attribute( $item_key, 'class', $item['timeline_item_css_classes'] );
			}

			$this->add_render_attribute( $title_key, 'class', 'pp-timeline-card-title' );

			$this->add_render_attribute( $content_key, 'class', 'pp-timeline-card-content' );

			if ( ! empty( $item['timeline_item_link']['url'] ) ) {
				$link_key = $this->get_repeater_setting_key( 'link', 'items', $index );

				$this->add_link_attributes( $link_key, $item['timeline_item_link'] );
			}
			?>
			<div <?php $this->print_render_attribute_string( $item_key ); ?>>
				<div class="pp-timeline-card-wrapper">
					<?php if ( $item['timeline_item_link']['url'] ) { ?>
					<a <?php $this->print_render_attribute_string( $link_key ); ?>>
					<?php } ?>
					<?php if ( 'yes' === $settings['card_arrow'] ) { ?>
					<div class="pp-timeline-arrow"></div>
					<?php } ?>
					<div class="pp-timeline-card">
						<?php
							if ( 'below-title' !== $settings['media_position'] ) {
								$this->render_image( $settings, $item );
							}
						?>
						<?php if ( $item['timeline_item_title'] || 'yes' === $settings['dates'] ) { ?>
							<div class="pp-timeline-card-title-wrap">
								<?php if ( 'vertical' === $settings['layout'] ) { ?>
									<?php if ( 'yes' === $settings['dates'] ) { ?>
										<div class="pp-timeline-card-date">
											<?php echo wp_kses_post( $item['timeline_item_date'] ); ?>
										</div>
									<?php } ?>
								<?php } ?>
								<?php if ( $item['timeline_item_title'] ) { ?>
									<?php $title_tag = PP_Helper::validate_html_tag( $settings['title_html_tag'] ); ?>
									<<?php echo esc_html( $title_tag ); ?> <?php $this->print_render_attribute_string( $title_key ); ?>>
										<?php
											echo wp_kses_post( $item['timeline_item_title'] );
										?>
									</<?php echo esc_html( $title_tag ); ?>>
								<?php } ?>
							</div>
						<?php } ?>
						<?php
							if ( 'below-title' === $settings['media_position'] ) {
								$this->render_image( $settings, $item );
							}
						?>
						<?php if ( $item['timeline_item_content'] ) { ?>
							<div <?php $this->print_render_attribute_string( $content_key ); ?>>
								<?php
									echo $this->parse_text_editor( $item['timeline_item_content'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								?>
							</div>
						<?php } ?>
					</div>
					<?php if ( $item['timeline_item_link'] ) { ?>
					</a>
					<?php } ?>
				</div>

				<?php if ( 'vertical' === $settings['layout'] ) { ?>
					<?php $this->render_connector_marker( $i, $item['timeline_item_date'], $item ); ?>
				<?php } ?>
			</div>
			<?php
			$i++;
		}
	}

	/**
	 * Render post terms output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_terms() {
		$settings   = $this->get_settings_for_display();
		$post_meta  = $settings['post_meta'];
		$post_terms = $settings['post_category'];

		if ( 'show' !== $post_meta ) {
			return;
		}

		if ( 'show' !== $post_terms ) {
			return;
		}

		$post_type = $settings['post_type'];

		if ( 'related' === $settings['post_type'] ) {
			$post_type = get_post_type();
		}

		$taxonomies = $settings[ 'tax_badge_' . $post_type ];

		$terms = array();

		if ( is_array( $taxonomies ) ) {
			foreach ( $taxonomies as $taxonomy ) {
				$terms_tax = wp_get_post_terms( get_the_ID(), $taxonomy );
				$terms     = array_merge( $terms, $terms_tax );
			}
		} else {
			$terms = wp_get_post_terms( get_the_ID(), $taxonomies );
		}

		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return;
		}

		$max_terms = 1;

		if ( $max_terms ) {
			$terms = array_slice( $terms, 0, $max_terms );
		}

		$format = '<span class="pp-post-term">%1$s</span>';
		?>
		<span class="pp-timeline-category">
			<?php
			foreach ( $terms as $term ) {
				printf( wp_kses_post( $format ), esc_attr( $term->name ), esc_attr( get_term_link( (int) $term->term_id ) ) );
			}
			?>
		</span>
		<?php
	}

	/**
	 * Render posts output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_source_posts() {
		$settings = $this->get_settings_for_display();

		$i = 1;

		// Query Arguments
		$this->query_posts( '', '', '', '', '', 'timeline', 'yes' );
		$posts_query = $this->get_query();

		if ( $posts_query->have_posts() ) :
			while ( $posts_query->have_posts() ) :
				$posts_query->the_post();

				if ( '' !== $settings['link_type'] ) {
					$link_key = $this->get_repeater_setting_key( 'post_link', 'items', $i );

					$link = [];

					if ( 'custom' === $settings['posts_link_to'] && ! empty( $settings['posts_link']['url'] ) ) {
						$link = $settings['posts_link'];
					} else {
						$link = [
							'url'         => esc_url( get_permalink() ),
							'is_external' => '',
							'nofollow'    => '',
						];
					}

					if ( ! empty( $link ) ) {
						$this->add_link_attributes( $link_key, $link );
					}
				}				

				$item_key = 'timeline-item' . $i;

				if ( has_post_thumbnail() || 'attachment' === $settings['post_type'] ) {
					if ( 'attachment' === $settings['post_type'] ) {
						$image_id = get_the_ID();
					} else {
						$image_id = get_post_thumbnail_id( get_the_ID() );
					}

					$thumb_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image_size', $settings );
					$image_alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
				} else {
					$thumb_url = '';
					$image_alt    = '';
				}

				if ( 0 === $i % 2 ) {
					$item_side = 'right';
				} else {
					$item_side = 'left';
				}

				$this->add_render_attribute(
					$item_key,
					'class',
					array(
						'pp-timeline-item',
						'pp-timeline-item-' . $item_side,
						'pp-timeline-item-' . intval( $i ),
					)
				);

				if ( 'yes' === $settings['animate_cards'] ) {
					$this->add_render_attribute( $item_key, 'class', 'pp-timeline-item-hidden' );
				}

				$post_date = $this->pp_get_date( $settings );
				?>
				<div <?php $this->print_render_attribute_string( $item_key ); ?>>
					<div class="pp-timeline-card-wrapper">
						<?php if ( 'card' === $settings['link_type'] ) { ?>
						<a <?php $this->print_render_attribute_string( $link_key ); ?>>
						<?php } ?>
						<?php if ( 'yes' === $settings['card_arrow'] ) { ?>
						<div class="pp-timeline-arrow"></div>
						<?php } ?>
						<div class="pp-timeline-card">
							<?php
								if ( 'below-title' !== $settings['media_position'] ) {
									$this->render_image( $settings, '', 'post', $thumb_url, $image_alt );
								}
							?>
							<?php if ( 'show' === $settings['post_title'] || 'yes' === $settings['dates'] ) { ?>
								<div class="pp-timeline-card-title-wrap">
									<?php if ( 'vertical' === $settings['layout'] ) { ?>
										<?php if ( 'yes' === $settings['dates'] ) { ?>
											<div class="pp-timeline-card-date">
												<?php
													echo wp_kses_post( $post_date );
												?>
											</div>
										<?php } ?>
									<?php } ?>
									<?php if ( 'show' === $settings['post_title'] ) { ?>
										<?php $title_tag = PP_Helper::validate_html_tag( $settings['title_html_tag'] ); ?>
										<<?php echo esc_html( $title_tag ); ?> class="pp-timeline-card-title">
											<?php
											if ( 'title' === $settings['link_type'] ) {
												printf( '<a %1$s>%2$s</a>', wp_kses_post( $this->get_render_attribute_string( $link_key ) ), wp_kses_post( get_the_title() ) );
											} else {
												the_title();
											}
											?>
										</<?php echo esc_html( $title_tag ); ?>>
									<?php } ?>
									<?php if ( 'show' === $settings['post_meta'] ) { ?>
										<div class="pp-timeline-meta">
											<?php if ( 'show' === $settings['post_author'] ) { ?>
												<span class="pp-timeline-author">
													<?php the_author(); ?>
												</span>
											<?php } ?>
											<?php $this->render_terms(); ?>
										</div>
									<?php } ?>
								</div>
							<?php } ?>
							<?php
								if ( 'below-title' === $settings['media_position'] ) {
									$this->render_image( $settings, '', 'post', $thumb_url, $image_alt );
								}
							?>
							<div class="pp-timeline-card-content">
								<?php if ( 'show' === $settings['post_content'] ) { ?>
									<div class="pp-timeline-card-excerpt">
										<?php $this->render_post_content(); ?>
									</div>
								<?php } ?>
								<?php if ( 'button' === $settings['link_type'] && $settings['button_text'] ) { ?>
									<?php
									$this->add_render_attribute(
										'button',
										'class',
										array(
											'pp-timeline-button',
											'elementor-button',
											'elementor-size-' . $settings['button_size'],
										)
									);
									?>
									<a <?php $this->print_render_attribute_string( 'button' ); ?> <?php $this->print_render_attribute_string( $link_key ); ?>>
										<span class="pp-timeline-button-text">
											<?php echo esc_attr( $settings['button_text'] ); ?>
										</span>
									</a>
								<?php } ?>
							</div>
						</div>
						<?php if ( 'card' === $settings['link_type'] ) { ?>
						</a>
						<?php } ?>
					</div>

					<?php
					if ( 'vertical' === $settings['layout'] ) {
						$this->render_connector_marker( $i, $post_date );
					}
					?>
				</div>
				<?php
				$i++;
		endwhile;
		endif;
		wp_reset_postdata();
	}

	/**
	 * Get post date.
	 *
	 * Returns the post date.
	 *
	 * @since 1.4.11.0
	 * @param array $settings object.
	 * @access public
	 */
	public function pp_get_date( $settings ) {
		$date_type = $settings['date_format'];
		$date_format = $settings['date_format_select'];
		$date_custom_format = $settings['timeline_post_date_format'];
		$date        = '';

		if ( ! $date_format ) {
			$date_format = 'F j, Y';
		}

		if ( 'custom' === $date_format && $date_custom_format ) {
			$date_format = $date_custom_format;
		}

		if ( 'ago' === $date_type ) {
			$date = sprintf( _x( '%s ago', '%s = human-readable time difference', 'powerpack' ), human_time_diff( get_the_time( 'U' ), current_time( 'timestamp' ) ) );
		} elseif ( 'modified' === $date_type ) {
			$date = get_the_modified_date( $date_format, get_the_ID() );
		} elseif ( 'key' === $date_type ) {
			$date_meta_key = $settings['timeline_post_date_key'];

			if ( $date_meta_key ) {
				$date = get_post_meta( get_the_ID(), $date_meta_key, 'true' );
			}

			if ( $date ) {
				$date = date( $date_format, strtotime( $date ) );
			}
		} else {
			$date = get_the_date( $date_format );
		}

		if ( $date == '' ) {
			$date = get_the_date( $date_format );
		}

		return apply_filters( 'pp_timeline_date_format', $date, get_option( 'date_format' ), '', '' );
	}

	/**
	 * Get post content.
	 *
	 * @access protected
	 */
	protected function render_image( $settings, $item = '', $image_type = 'custom', $thumb_url = '', $image_alt = '' ) {
		if ( 'post' === $image_type ) {
			if ( 'show' === $settings['post_image'] ) { ?>
				<div class="pp-timeline-card-image">
					<img src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $image_alt ); ?>">
				</div>
			<?php }
		} else {
			if ( 'yes' === $item['card_image'] && ! empty( $item['image']['url'] ) ) { ?>
				<div class="pp-timeline-card-image">
					<?php echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $item, 'image', 'image' ) ); ?>
				</div>
				<?php
			}
		}
	}

	/**
	 * Get post content.
	 *
	 * @access protected
	 */
	protected function render_post_content() {
		$settings = $this->get_settings_for_display();

		$content_length = $settings['content_length'];

		if ( $content_length == '' ) {
			$content = get_the_excerpt();
		} else {
			$content = wp_trim_words( get_the_content(), $content_length );
		}

		echo wp_kses_post( $content );
	}
}
