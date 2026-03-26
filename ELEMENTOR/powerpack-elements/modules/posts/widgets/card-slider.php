<?php
namespace PowerpackElements\Modules\Posts\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Modules\Posts\Widgets\Posts_Base;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Posts_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Control_Media;
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
 * Card Slider Widget
 */
class Card_Slider extends Posts_Base {

	/**
	 * Retrieve card slider widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Card_Slider' );
	}

	/**
	 * Retrieve card slider widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Card_Slider' );
	}

	/**
	 * Retrieve card slider widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Card_Slider' );
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
		return parent::get_widget_keywords( 'Card_Slider' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the card slider widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return array(
			'swiper',
			'pp-card-slider',
		);
	}

	/**
	 * Get style dependencies.
	 *
	 * Retrieve the list of style dependencies the widget requires.
	 *
	 * @since 2.11.0
	 * @access public
	 *
	 * @return array Widget style dependencies.
	 */
	public function get_style_depends(): array {
		return [ 'e-swiper', 'pp-swiper', 'widget-pp-card-slider' ];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register card slider widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_card_controls();
		$this->register_query_section_controls( array( 'source' => 'posts' ), 'content_ticker', 'yes' );
		$this->register_content_posts_controls();
		$this->register_content_additional_options_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_card_controls();
		$this->register_style_image_controls();
		$this->register_style_button_controls();
		$this->register_style_dots_controls();
		$this->register_style_fraction_controls();
	}

	protected function register_content_card_controls() {
		/**
		 * Content Tab: Settings
		 */
		$this->start_controls_section(
			'section_card',
			array(
				'label' => esc_html__( 'Card', 'powerpack' ),
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
			'posts_count',
			array(
				'label'     => esc_html__( 'Posts Count', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 4,
				'condition' => array(
					'source' => 'posts',
				),
			)
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'card_items_tabs' );

		$repeater->start_controls_tab( 'tab_card_items_content', array( 'label' => esc_html__( 'Content', 'powerpack' ) ) );

			$repeater->add_control(
				'card_date',
				array(
					'label'       => esc_html__( 'Date', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => false,
					'default'     => esc_html__( '1 June 2018', 'powerpack' ),
					'ai'          => [
						'active' => false,
					],
				)
			);

			$repeater->add_control(
				'card_title',
				array(
					'label'       => esc_html__( 'Title', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => false,
					'default'     => '',
				)
			);

			$repeater->add_control(
				'card_content',
				array(
					'label'   => esc_html__( 'Content', 'powerpack' ),
					'type'    => Controls_Manager::WYSIWYG,
					'default' => '',
				)
			);

			$repeater->add_control(
				'link',
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
				)
			);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab( 'tab_card_items_image', array( 'label' => esc_html__( 'Image', 'powerpack' ) ) );

		$repeater->add_control(
			'card_image',
			array(
				'label'        => esc_html__( 'Show Image', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
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

		$repeater->end_controls_tabs();

		$this->add_control(
			'items',
			array(
				'label'       => '',
				'type'        => Controls_Manager::REPEATER,
				'default'     => array(
					array(
						'card_date'    => esc_html__( '1 May 2018', 'powerpack' ),
						'card_title'   => esc_html__( 'Card Slider Item 1', 'powerpack' ),
						'card_content' => esc_html__( 'I am card slider Item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
					array(
						'card_date'    => esc_html__( '1 June 2018', 'powerpack' ),
						'card_title'   => esc_html__( 'Card Slider Item 2', 'powerpack' ),
						'card_content' => esc_html__( 'I am card slider Item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
					array(
						'card_date'    => esc_html__( '1 July 2018', 'powerpack' ),
						'card_title'   => esc_html__( 'Card Slider Item 3', 'powerpack' ),
						'card_content' => esc_html__( 'I am card slider Item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
					array(
						'card_date'    => esc_html__( '1 August 2018', 'powerpack' ),
						'card_title'   => esc_html__( 'Card Slider Item 4', 'powerpack' ),
						'card_content' => esc_html__( 'I am card slider Item content. Click here to edit this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'powerpack' ),
					),
				),
				'fields'      => $repeater->get_controls(),
				'title_field' => '{{{ card_date }}}',
				'condition'   => array(
					'source' => 'custom',
				),
			)
		);

		$this->add_control(
			'title_html_tag',
			array(
				'label'     => esc_html__( 'Title HTML Tag', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'h2',
				'options'   => array(
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
				'separator' => 'before',
			)
		);

		$this->add_control(
			'date',
			array(
				'label'        => esc_html__( 'Date', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'select_date_icon',
			array(
				'label'            => esc_html__( 'Date Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'date_icon',
				'label_block'      => false,
				'skin'             => 'inline',
				'default'          => array(
					'value'   => 'fas fa-calendar-alt',
					'library' => 'fa-solid',
				),
				'condition'        => array(
					'date' => 'yes',
				),
			)
		);

		$this->add_control(
			'link_type',
			array(
				'label'   => esc_html__( 'Link Type', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => array(
					''       => esc_html__( 'None', 'powerpack' ),
					'title'  => esc_html__( 'Title', 'powerpack' ),
					'image'  => esc_html__( 'Image', 'powerpack' ),
					'button' => esc_html__( 'Button', 'powerpack' ),
					'box'    => esc_html__( 'Box', 'powerpack' ),
				),
				'default' => '',
			)
		);

		$this->add_control(
			'button_text',
			array(
				'label'       => esc_html__( 'Button Text', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'label_block' => false,
				'default'     => esc_html__( 'Read More', 'powerpack' ),
				'condition'   => array(
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_icon',
			array(
				'label'       => esc_html__( 'Button Icon', 'powerpack' ),
				'type'        => Controls_Manager::ICONS,
				'label_block' => false,
				'skin'        => 'inline',
				'condition'   => array(
					'link_type' => 'button',
					'button_text!' => '',
				),
			)
		);

		$start = is_rtl() ? 'right' : 'left';
		$end = is_rtl() ? 'left' : 'right';

		$this->add_control(
			'button_icon_align',
			[
				'label'                => esc_html__( 'Icon Position', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
				'default'              => is_rtl() ? 'row-reverse' : 'row-reverse',
				'options'              => [
					'row' => [
						'title' => esc_html__( 'Start', 'powerpack' ),
						'icon'  => "eicon-h-align-{$start}",
					],
					'row-reverse' => [
						'title' => esc_html__( 'End', 'powerpack' ),
						'icon'  => "eicon-h-align-{$end}",
					],
				],
				'selectors_dictionary' => [
					'left'  => is_rtl() ? 'row-reverse' : 'row',
					'right' => is_rtl() ? 'row' : 'row-reverse',
				],
				'selectors'            => [
					'{{WRAPPER}} .elementor-button-content-wrapper' => 'flex-direction: {{VALUE}};',
				],
				'condition'            => array(
					'link_type' => 'button',
					'button_text!' => '',
					'button_icon[value]!' => '',
				),
			]
		);

		$this->add_responsive_control(
			'button_icon_spacing',
			array(
				'label'      => esc_html__( 'Icon Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => 8,
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'max' => 50,
					),
					'em' => array(
						'max' => 5,
					),
					'rem' => array(
						'max' => 5,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .elementor-button .elementor-button-content-wrapper' => 'gap: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'link_type' => 'button',
					'button_text!' => '',
					'button_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'open_lightbox',
			array(
				'label'              => esc_html__( 'Lightbox', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'description'        => sprintf(
					/* translators: 1: Link open tag, 2: Link close tag. */
					esc_html__( 'Manage your site’s lightbox settings in the %1$sLightbox panel%2$s.', 'powerpack' ),
					'<a href="javascript: $e.run( \'panel/global/open\' ).then( () => $e.route( \'panel/global/settings-lightbox\' ) )">',
					'</a>'
				),
				'default'            => 'default',
				'options'            => array(
					'default' => esc_html__( 'Default', 'powerpack' ),
					'yes'     => esc_html__( 'Yes', 'powerpack' ),
					'no'      => esc_html__( 'No', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'link_type' => array( '', 'title', 'button' ),
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_posts_controls() {
		/**
		 * Content Tab: Posts
		 */
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
			'post_excerpt',
			array(
				'label'        => esc_html__( 'Post Excerpt', 'powerpack' ),
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
			'excerpt_length',
			array(
				'label'     => esc_html__( 'Excerpt Length', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 20,
				'min'       => 0,
				'max'       => 58,
				'step'      => 1,
				'condition' => array(
					'source'       => 'posts',
					'post_excerpt' => 'show',
				),
			)
		);

		$this->add_control(
			'meta_heading',
			array(
				'label'     => esc_html__( 'Post Meta', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'post_meta',
			array(
				'label'        => esc_html__( 'Post Meta', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'return_value' => 'yes',
				'condition'    => array(
					'source' => 'posts',
				),
			)
		);

		$this->add_control(
			'post_author',
			array(
				'label'        => esc_html__( 'Author', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'return_value' => 'yes',
				'condition'    => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'select_author_icon',
			array(
				'label'            => esc_html__( 'Author Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'author_icon',
				'default'          => array(
					'value'   => 'fas fa-user',
					'library' => 'fa-solid',
				),
				'condition'        => array(
					'source'      => 'posts',
					'post_author' => 'yes',
					'post_meta'   => 'yes',
				),
			)
		);

		$this->add_control(
			'post_category',
			array(
				'label'        => esc_html__( 'Category', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'return_value' => 'yes',
				'condition'    => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'select_category_icon',
			array(
				'label'            => esc_html__( 'Category Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'category_icon',
				'default'          => array(
					'value'   => 'fas fa-folder-open',
					'library' => 'fa-solid',
				),
				'condition'        => array(
					'source'        => 'posts',
					'post_category' => 'yes',
					'post_meta'     => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_additional_options_controls() {
		/**
		 * Content Tab: Additional Options
		 */
		$this->start_controls_section(
			'section_additional_options',
			array(
				'label' => esc_html__( 'Additional Options', 'powerpack' ),
			)
		);

		$breakpoints = PP_Helper::elementor()->breakpoints->get_active_breakpoints();

		$stack_on_options = ['none' => esc_html__( 'None', 'powerpack' )];

		foreach ( $breakpoints as $breakpoint_key => $breakpoint ) {
			// This feature is meant for mobile screens.
			if ( 'widescreen' === $breakpoint_key ) {
				continue;
			}

			$stack_on_options[ $breakpoint_key ] = sprintf(
				/* translators: 1: `<` character, 2: Breakpoint value. */
				esc_html__( '%1$s (%2$s %3$dpx)', 'powerpack' ),
				$breakpoint->get_label(),
				'<',
				$breakpoint->get_value()
			);
		}

		$this->add_control(
			'responsive_breakpoint',
			[
				'label'              => esc_html__( 'Stack On', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'label_block'        => true,
				'default'            => 'tablet',
				'options'            => $stack_on_options,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'slider_speed',
			array(
				'label'       => esc_html__( 'Slider Speed', 'powerpack' ),
				'description' => esc_html__( 'Duration of transition between slides (in ms)', 'powerpack' ),
				'type'        => Controls_Manager::SLIDER,
				'default'     => array( 'size' => 500 ),
				'range'       => array(
					'px' => array(
						'min'  => 100,
						'max'  => 3000,
						'step' => 1,
					),
				),
				'separator'   => 'before',
			)
		);

		$this->add_control(
			'autoplay',
			array(
				'label'              => esc_html__( 'Autoplay', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'separator'          => 'before',
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
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'pause_on_interaction',
			array(
				'label'              => esc_html__( 'Pause on Interaction', 'powerpack' ),
				'description'        => esc_html__( 'Disables autoplay completely on first interaction with the carousel.', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'condition'          => array(
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'autoplay_speed',
			array(
				'label'              => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'               => Controls_Manager::NUMBER,
				'default'            => 3000,
				'min'                => 500,
				'max'                => 50000,
				'step'               => 1,
				'condition'          => array(
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'loop',
			array(
				'label'              => esc_html__( 'Infinite Loop', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
			)
		);

		$this->add_control(
			'grab_cursor',
			array(
				'label'              => esc_html__( 'Grab Cursor', 'powerpack' ),
				'description'        => esc_html__( 'Shows grab cursor when you hover over the slider', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'separator'          => 'before',
			)
		);

		$this->add_control(
			'navigation_heading',
			array(
				'label'     => esc_html__( 'Navigation', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'pagination',
			array(
				'label'              => esc_html__( 'Pagination', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
			)
		);

		$this->add_control(
			'pagination_type',
			array(
				'label'              => esc_html__( 'Pagination Type', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'bullets',
				'options'            => array(
					'bullets'  => esc_html__( 'Dots', 'powerpack' ),
					'fraction' => esc_html__( 'Fraction', 'powerpack' ),
				),
				'condition'          => array(
					'pagination' => 'yes',
				),
			)
		);

		$this->add_control(
			'keyboard_nav',
			array(
				'label'              => esc_html__( 'Keyboard Navigation', 'powerpack' ),
				'description'        => esc_html__( 'When the focus is on the widget, use left and right arrows of keyboard to scroll through the slides', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'no',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Card_Slider' );

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

	protected function register_style_card_controls() {
		/**
		 * Style Tab: Card
		 */
		$this->start_controls_section(
			'section_card_style',
			array(
				'label' => esc_html__( 'Card', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'card_max_width',
			array(
				'label'      => esc_html__( 'Max Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 200,
						'max'  => 1600,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider' => 'max-width: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'card_margin',
			array(
				'label'      => esc_html__( 'Margin', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'card_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'card_text_align',
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
					'{{WRAPPER}} .pp-card-slider-item' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->start_controls_tabs( 'card_tabs' );

		$this->start_controls_tab( 'tab_card_normal', array( 'label' => esc_html__( 'Normal', 'powerpack' ) ) );

		$this->add_control(
			'card_bg',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'card_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-card-slider',
			)
		);

		$this->add_control(
			'card_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'card_box_shadow',
				'selector' => '{{WRAPPER}} .pp-card-slider',
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
			'title_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider-title' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'title_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'global'   => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector' => '{{WRAPPER}} .pp-card-slider-title',
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
					'{{WRAPPER}} .pp-card-slider-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'heading_date',
			array(
				'label'     => esc_html__( 'Date', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'date' => 'yes',
				),
			)
		);

		$this->add_control(
			'date_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_SECONDARY,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider-date' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-card-slider-date .pp-icon svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'date' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'date_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-card-slider-date',
				'condition' => array(
					'date' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'date_margin_bottom',
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
					'{{WRAPPER}} .pp-card-slider-date' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'date' => 'yes',
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
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_TEXT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider-content' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'card_text_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'global'   => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
				'selector' => '{{WRAPPER}} .pp-card-slider-content',
			)
		);

		$this->add_control(
			'heading_meta',
			array(
				'label'     => esc_html__( 'Post Meta', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'meta_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_SECONDARY,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider-meta' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'meta_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-card-slider-meta',
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'meta_spacing',
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
					'{{WRAPPER}} .pp-card-slider-meta' => 'margin-bottom: {{SIZE}}px;',
				),
				'condition'  => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
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
					'{{WRAPPER}} .pp-card-slider:hover' => 'background-color: {{VALUE}}',
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
					'{{WRAPPER}} .pp-card-slider:hover' => 'border-color: {{VALUE}}',
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
					'{{WRAPPER}} .pp-card-slider:hover .pp-card-slider-title' => 'color: {{VALUE}}',
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
					'{{WRAPPER}} .pp-card-slider:hover .pp-card-slider-content' => 'color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'meta_color_hover',
			array(
				'label'     => esc_html__( 'Post Meta Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider:hover .pp-card-slider-meta' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'source'    => 'posts',
					'post_meta' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_image_controls() {
		/**
		 * Style Tab: Image
		 */
		$this->start_controls_section(
			'section_image_style',
			array(
				'label' => esc_html__( 'Image', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'image_direction',
			array(
				'label'        => esc_html__( 'Direction', 'powerpack' ),
				'type'         => Controls_Manager::CHOOSE,
				'label_block'  => false,
				'toggle'       => false,
				'default'      => 'left',
				'options'      => array(
					'left'  => array(
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-h-align-left',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-h-align-right',
					),
				),
				'prefix_class' => 'pp-card-slider-image-',
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'image_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-card-slider-image',
			)
		);

		$this->add_control(
			'image_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider-image, {{WRAPPER}} .pp-card-slider-image:after, {{WRAPPER}} .pp-card-slider-image img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'image_width',
			array(
				'label'      => esc_html__( 'Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 500,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider-image' => 'width: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'image_height',
			array(
				'label'      => esc_html__( 'Height', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 500,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider-image' => 'height: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'image_margin',
			array(
				'label'       => esc_html__( 'Margin', 'powerpack' ),
				'type'        => Controls_Manager::DIMENSIONS,
				'size_units'  => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'placeholder' => array(
					'top'    => '',
					'right'  => '',
					'bottom' => '',
					'left'   => '',
				),
				'selectors'   => array(
					'{{WRAPPER}} .pp-card-slider-image' => 'margin-top: {{TOP}}{{UNIT}}; margin-left: {{LEFT}}{{UNIT}}; margin-right: {{RIGHT}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'image_box_shadow',
				'selector' => '{{WRAPPER}} .pp-card-slider-image',
			)
		);

		$this->add_control(
			'image_overlay_heading',
			array(
				'label'     => esc_html__( 'Overlay', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'     => 'image_overlay',
				'label'    => esc_html__( 'Background', 'powerpack' ),
				'types'    => array( 'classic', 'gradient' ),
				'selector' => '{{WRAPPER}} .pp-card-slider-image:after',
				'exclude'  => array( 'image' ),
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_button_controls() {
		/**
		 * Style Tab: Button
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section__button_style',
			array(
				'label'     => esc_html__( 'Button', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
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
					'{{WRAPPER}} .pp-card-slider-button-wrap' => 'margin-top: {{SIZE}}px;',
				),
				'condition'  => array(
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_size',
			array(
				'label'     => esc_html__( 'Size', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'sm',
				'options'   => array(
					'xs' => esc_html__( 'Extra Small', 'powerpack' ),
					'sm' => esc_html__( 'Small', 'powerpack' ),
					'md' => esc_html__( 'Medium', 'powerpack' ),
					'lg' => esc_html__( 'Large', 'powerpack' ),
					'xl' => esc_html__( 'Extra Large', 'powerpack' ),
				),
				'condition' => array(
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
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider-button' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
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
					'{{WRAPPER}} .pp-card-slider-button' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-card-slider-button svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
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
				'selector'    => '{{WRAPPER}} .pp-card-slider-button',
				'condition'   => array(
					'link_type' => 'button',
				),
			)
		);

		$this->add_control(
			'button_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'button_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-card-slider-button',
				'condition' => array(
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
					'{{WRAPPER}} .pp-card-slider-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-card-slider-button',
				'condition' => array(
					'link_type' => 'button',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
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
					'{{WRAPPER}} .pp-card-slider-button:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
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
					'{{WRAPPER}} .pp-card-slider-button:hover' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-card-slider-button:hover svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
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
					'{{WRAPPER}} .pp-card-slider-button:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
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
					'link_type' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-card-slider-button:hover',
				'condition' => array(
					'link_type' => 'button',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_dots_controls() {
		/**
		 * Style Tab: Dots
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_dots_style',
			array(
				'label'     => esc_html__( 'Pagination: Dots', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_control(
			'dots_position',
			array(
				'label'        => esc_html__( 'Position', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'options'      => array(
					'aside'  => esc_html__( 'Aside', 'powerpack' ),
					'bottom' => esc_html__( 'Bottom', 'powerpack' ),
				),
				'default'      => 'aside',
				'prefix_class' => 'pp-card-slider-dots-',
			)
		);

		$this->add_responsive_control(
			'dots_margin',
			array(
				'label'       => esc_html__( 'Margin', 'powerpack' ),
				'type'        => Controls_Manager::DIMENSIONS,
				'size_units'  => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'placeholder' => array(
					'top'    => '',
					'right'  => '',
					'bottom' => '',
					'left'   => '',
				),
				'selectors'   => array(
					'{{WRAPPER}} .pp-card-slider .swiper-pagination' => 'margin-top: {{TOP}}{{UNIT}}; margin-left: {{LEFT}}{{UNIT}}; margin-right: {{RIGHT}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
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
					'(desktop){{WRAPPER}}.pp-card-slider-dots-aside .swiper-pagination-bullets .swiper-pagination-bullet' => 'margin-top: {{SIZE}}{{UNIT}}; margin-bottom: {{SIZE}}{{UNIT}}',
					'(desktop){{WRAPPER}}.pp-card-slider-dots-bottom .swiper-pagination-bullets .swiper-pagination-bullet' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
					'(tablet){{WRAPPER}}.pp-card-slider-dots-aside .swiper-pagination-bullets .swiper-pagination-bullet' => 'margin-top: {{SIZE}}{{UNIT}}; margin-bottom: {{SIZE}}{{UNIT}}',
					'(tablet){{WRAPPER}}.pp-card-slider-dots-bottom .swiper-pagination-bullets .swiper-pagination-bullet' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
					'(mobile){{WRAPPER}}.pp-card-slider-dots-aside .swiper-pagination-bullets .swiper-pagination-bullet' => 'margin-top: 0; margin-bottom: 0; margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
					'(mobile){{WRAPPER}}.pp-card-slider-dots-bottom .swiper-pagination-bullets .swiper-pagination-bullet' => 'margin-top: 0; margin-bottom: 0; margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_dots_style' );

		$this->start_controls_tab(
			'tab_dots_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_responsive_control(
			'dots_width',
			array(
				'label'      => esc_html__( 'Width', 'powerpack' ),
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet' => 'width: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_responsive_control(
			'dots_height',
			array(
				'label'      => esc_html__( 'Height', 'powerpack' ),
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet' => 'height: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
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
				'selector'    => '{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet',
				'condition'   => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_control(
			'dots_border_radius_normal',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet:hover' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_active',
			array(
				'label'     => esc_html__( 'Active', 'powerpack' ),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_control(
			'dot_color_active',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_responsive_control(
			'dots_width_active',
			array(
				'label'      => esc_html__( 'Width', 'powerpack' ),
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'width: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_responsive_control(
			'dots_height_active',
			array(
				'label'      => esc_html__( 'Height', 'powerpack' ),
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
					'{{WRAPPER}} .pp-card-slider .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'height: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'pagination'      => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Pagination: Fraction
	 * -------------------------------------------------
	 */
	protected function register_style_fraction_controls() {
		$this->start_controls_section(
			'section_fraction_style',
			array(
				'label'     => esc_html__( 'Pagination: Fraction', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'fraction',
				),
			)
		);

		$this->add_control(
			'fraction_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-pagination-fraction' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'fraction',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'fraction_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .swiper-pagination-fraction',
				'condition' => array(
					'pagination'      => 'yes',
					'pagination_type' => 'fraction',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Slider Settings.
	 *
	 * @access public
	 */
	public function slider_settings() {
		$settings = $this->get_settings_for_display();

		$slider_options = array(
			'effect'          => 'fade',
			'speed'           => ( $settings['slider_speed']['size'] ) ? $settings['slider_speed']['size'] : 500,
			'slides_per_view' => 1,
			'auto_height'     => false,
			'loop'            => ( 'yes' === $settings['loop'] ) ? 'yes' : '',
		);

		if ( 'yes' === $settings['grab_cursor'] ) {
			$slider_options['grab_cursor'] = true;
		}

		if ( 'yes' === $settings['autoplay'] ) {
			$autoplay_speed = 999999;
			$slider_options['autoplay'] = 'yes';

			if ( ! empty( $settings['autoplay_speed'] ) ) {
				$autoplay_speed = $settings['autoplay_speed'];
			}

			$slider_options['autoplay_speed'] = $autoplay_speed;
			$slider_options['pause_on_interaction'] = ( 'yes' === $settings['pause_on_interaction'] );
		}

		if ( 'yes' === $settings['keyboard_nav'] ) {
			$slider_options['keyboard'] = 'yes';
		}

		if ( 'yes' === $settings['pagination'] && $settings['pagination_type'] ) {
			$slider_options['pagination'] = $settings['pagination_type'];
		}

		$this->add_render_attribute(
			'card-slider',
			array(
				'data-slider-settings' => wp_json_encode( $slider_options ),
			)
		);
	}

	/**
	 * Render card slider widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'card-slider', 'class', array( 'pp-card-slider', 'pp-swiper-slider' ) );

		$this->slider_settings();
		?>
		<div <?php $this->print_render_attribute_string( 'card-slider' ); ?>>
			<div class="swiper-wrapper">
				<?php
				if ( 'posts' === $settings['source'] ) {
					$this->render_source_posts();
				} elseif ( 'custom' === $settings['source'] ) {
					$this->render_source_custom();
				}
				?>
			</div>
			<?php if ( 'yes' === $settings['pagination'] ) { ?>
				<div class="swiper-pagination swiper-pagination-<?php echo esc_attr( $this->get_id() ); ?>"></div>
			<?php } ?>
		</div>
		<?php
	}

	/**
	 * Get image
	 *
	 * @since  2.2.7
	 * @access protected
	 */
	protected function get_image( $image_type, $item = '' ) {
		$settings = $this->get_settings_for_display();
		$post_type_name = $settings['post_type'];
		$image = '';

		if ( 'custom' === $image_type ) {
			$image = Group_Control_Image_Size::get_attachment_image_html( $item );
		} else {
			if ( has_post_thumbnail() || 'attachment' === $post_type_name ) {
				if ( 'attachment' === $post_type_name ) {
					$image_id = get_the_ID();
				} else {
					$image_id = get_post_thumbnail_id( get_the_ID() );
				}
				$thumb_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image_size', $settings );
				$image_alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
			} else {
				$thumb_url = '';
				$image_alt = '';
			}

			if ( '' !== $thumb_url ) {
				$image = '<img src="' . esc_url( $thumb_url ) . '" alt="' . $image_alt . '">';
			}
		}

		return $image;
	}

	/**
	 * Render image output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since  2.2.7
	 * @access protected
	 */
	protected function render_image( $image_type, $index, $item = '' ) {
		$settings = $this->get_settings_for_display();

		if ( 'custom' === $image_type ) {
			$image_id = $item['image']['id'];
			$image_url = $item['image']['url'];
			$image = $this->get_image( 'custom', $item );
			$link = $item['link']['url'];
		} else {
			$image_id  = get_post_thumbnail_id( get_the_ID() );
			$image_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image_size', $settings );
			$image = $this->get_image( 'posts' );
			$link = get_permalink();
		}

		if ( $image ) { ?>
			<div class="pp-card-slider-image">
				<?php
				$image_key = $this->get_repeater_setting_key( 'image', 'items', $index );

				if ( ( '' === $settings['link_type'] || 'title' === $settings['link_type'] || 'button' === $settings['link_type'] ) && ( 'no' !== $settings['open_lightbox'] ) ) {
					$this->add_lightbox_data_attributes( $image_key, $image_id, $settings['open_lightbox'], $this->get_id() );

					$this->add_render_attribute( $image_key, 'href', esc_url( $image_url ) );

					if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
						$this->add_render_attribute( $image_key, [
							'class' => 'elementor-clickable',
						] );
					}

					printf( '<a %1$s>%2$s</a>', wp_kses_post( $this->get_render_attribute_string( $image_key ) ), wp_kses_post( $image ) );

				} elseif ( 'image' === $settings['link_type'] && $link ) {
					if ( 'custom' === $image_type ) {
						$this->add_link_attributes( 'image-link', $item['link'] );
						printf( '<a %1$s></a>%2$s', wp_kses_post( $this->get_render_attribute_string( 'image-link' ) ), wp_kses_post( $image ) );
					} else {
						printf( '<a href="%1$s"></a>%2$s', esc_url( get_permalink() ), wp_kses_post( $image ) );
					}
				} else {
					echo wp_kses_post( $image );
				}
				?>
			</div>
			<?php
		}
	}

	/**
	 * Render date output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since  2.2.7
	 * @access protected
	 */
	protected function render_date( $date_type, $item = '' ) {
		$settings = $this->get_settings_for_display();

		// Date Icon.
		if ( ! isset( $settings['date_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default.
			$settings['date_icon'] = 'fa fa-calendar';
		}

		$has_date_icon = ! empty( $settings['date_icon'] );

		if ( $has_date_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['date_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_date_icon && ! empty( $settings['select_date_icon']['value'] ) ) {
			$has_date_icon = true;
		}
		$migrated_date_icon = isset( $settings['__fa4_migrated']['select_date_icon'] );
		$is_new_date_icon   = ! isset( $settings['date_icon'] ) && Icons_Manager::is_migration_allowed();

		if ( 'yes' === $settings['date'] ) { ?>
			<div class="pp-card-slider-date">
				<?php if ( $has_date_icon ) { ?>
					<span class="pp-card-slider-meta-icon pp-icon">
						<?php
						if ( $is_new_date_icon || $migrated_date_icon ) {
							Icons_Manager::render_icon( $settings['select_date_icon'], array( 'aria-hidden' => 'true' ) );
						} elseif ( ! empty( $settings['date_icon'] ) ) {
							?>
							<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
							<?php
						}
						?>
					</span>
				<?php } ?>
				<span class="pp-card-slider-meta-text">
					<?php
					if ( 'custom' === $date_type ) {
						echo wp_kses_post( $item['card_date'] );
					} else {
						echo wp_kses_post( apply_filters( 'ppe_card_slider_date_format', get_the_date(), get_the_ID(), get_option( 'date_format' ), '', '' ) );
					}
					?>
				</span>
			</div>
			<?php
		}
	}

	/**
	 * Render button output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since  2.2.7
	 * @access protected
	 */
	protected function render_button( $item_type, $index, $item = '' ) {
		$settings = $this->get_settings_for_display();

		if ( 'button' === $settings['link_type'] && $settings['button_text'] ) {
			$button_key = $this->get_repeater_setting_key( 'button', 'items', $index );

			if ( 'custom' === $item_type ) {
				$link = $item['link']['url'];
				$this->add_link_attributes( $button_key, $item['link'] );
			} else {
				$link = get_permalink();
				$this->add_render_attribute( $button_key, 'href', $link );
			}

			if ( $link ) {
				$this->add_render_attribute(
					$button_key,
					'class',
					array(
						'pp-card-slider-button',
						'elementor-button',
						'elementor-size-' . $settings['button_size'],
					)
				);
				?>
				<div class="pp-card-slider-button-wrap">
					<a <?php $this->print_render_attribute_string( $button_key ); ?>>
						<span class="elementor-button-content-wrapper">
							<?php if ( ! empty( $settings['button_icon']['value'] ) ) : ?>
							<span class="elementor-button-icon">
								<?php Icons_Manager::render_icon( $settings['button_icon'], [ 'aria-hidden' => 'true' ] ); ?>
							</span>
							<?php endif; ?>
							<span class="elementor-button-text">
								<?php echo esc_attr( $settings['button_text'] ); ?>
							</span>
						</span>
					</a>
				</div>
				<?php
			}
		}
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

		$i = 0;

		foreach ( $settings['items'] as $index => $item ) {
			$item_key    = $this->get_repeater_setting_key( 'item', 'items', $index );

			$this->add_render_attribute(
				$item_key,
				'class',
				array(
					'pp-card-slider-item',
					'swiper-slide',
					'elementor-repeater-item-' . esc_attr( $item['_id'] ),
				)
			);
			?>
			<div <?php $this->print_render_attribute_string( $item_key ); ?>>
				<?php if ( 'box' === $settings['link_type'] && $item['link']['url'] ) { ?>
					<?php
						$box_link_key = 'card-slider-box-link-' . $i;

						$this->add_render_attribute(
							$box_link_key,
							array(
								'class' => 'pp-card-slider-box-link',
							)
						);

						$this->add_link_attributes( $box_link_key, $item['link'] );
					?>
					<a <?php $this->print_render_attribute_string( $box_link_key ); ?>></a>
				<?php } ?>
				<?php
				if ( 'yes' === $item['card_image'] ) {
					$this->render_image( 'custom', $index, $item );
				}
				?>
				<div class="pp-card-slider-content-wrap">
					<?php $this->render_date( 'custom', $item ); ?>
					<?php if ( $item['card_title'] ) { ?>
						<<?php echo wp_kses_post( $settings['title_html_tag'] ); ?> class="pp-card-slider-title">
							<?php
							if ( 'title' === $settings['link_type'] && $item['link']['url'] ) {
								$this->add_link_attributes( 'title-link', $item['link'] );
								printf( '<a %1$s>%2$s</a>', wp_kses_post( $this->get_render_attribute_string( 'title-link' ) ), wp_kses_post( $item['card_title'] ) );
							} else {
								echo wp_kses_post( $item['card_title'] );
							}
							?>
						</<?php echo wp_kses_post( $settings['title_html_tag'] ); ?>>
					<?php } ?>
					<?php if ( $item['card_content'] ) { ?>
						<div class="pp-card-slider-content">
							<?php
								echo $this->parse_text_editor( $item['card_content'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>
						</div>
					<?php } ?>
					<?php $this->render_button( 'custom', $index, $item ); ?>
				</div>
			</div>
			<?php
			$i++;
		}
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

		$i = 0;

		// Date Icon.
		if ( ! isset( $settings['date_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default.
			$settings['date_icon'] = 'fa fa-calendar';
		}

		$has_date_icon = ! empty( $settings['date_icon'] );

		if ( $has_date_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['date_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_date_icon && ! empty( $settings['select_date_icon']['value'] ) ) {
			$has_date_icon = true;
		}
		$migrated_date_icon = isset( $settings['__fa4_migrated']['select_date_icon'] );
		$is_new_date_icon   = ! isset( $settings['date_icon'] ) && Icons_Manager::is_migration_allowed();

		// Query Arguments.
		/* $args        = $this->query_posts_args( '', '', '', '', '', 'card_slider', 'yes', 'posts_count' );
		$posts_query = new \WP_Query( $args ); */
		$posts_count = $settings['posts_count'];
		$this->query_posts( '', '', '', '', '', 'card_slider', 'yes', '', $posts_count );
		$posts_query = $this->get_query();

		if ( $posts_query->have_posts() ) :
			while ( $posts_query->have_posts() ) :
				$posts_query->the_post();

				$item_key = 'card-slider-item' . $i;

				$this->add_render_attribute(
					$item_key,
					'class',
					array(
						'pp-card-slider-item',
						'swiper-slide',
						'pp-card-slider-item-' . intval( $i ),
					)
				);
				?>
				<div <?php $this->print_render_attribute_string( $item_key ); ?>>
					<?php if ( 'box' === $settings['link_type'] ) { ?>
						<?php
							$box_link_key = 'card-slider-box-link-' . $i;

							$this->add_render_attribute(
								$box_link_key,
								array(
									'class' => 'pp-card-slider-box-link',
									'href'  => get_permalink(),
								)
							);
						?>
						<a <?php $this->print_render_attribute_string( $box_link_key ); ?>></a>
					<?php } ?>
					<?php
					if ( 'show' === $settings['post_image'] ) {
						$this->render_image( 'posts', $i );
					}
					?>
					<div class="pp-card-slider-content-wrap">
						<?php $this->render_date( 'posts' ); ?>
						<?php if ( 'show' === $settings['post_title'] ) { ?>
							<<?php echo wp_kses_post( $settings['title_html_tag'] ); ?> class="pp-card-slider-title">
								<?php
								if ( 'title' === $settings['link_type'] ) {
									printf( '<a href="%1$s">%2$s</a>', esc_url( get_permalink() ), wp_kses_post( get_the_title() ) );
								} else {
									the_title();
								}
								?>
							</<?php echo wp_kses_post( $settings['title_html_tag'] ); ?>>
						<?php } ?>

						<?php $this->render_post_meta(); ?>

						<?php if ( 'show' === $settings['post_excerpt'] ) { ?>
							<div class="pp-card-slider-content">
								<?php echo wp_kses_post( PP_Posts_Helper::custom_excerpt( $settings['excerpt_length'] ) ); ?>
							</div>
						<?php } ?>
						<?php $this->render_button( 'posts', $i ); ?>
					</div>
				</div>
				<?php
				$i++;
			endwhile;
		endif;
		wp_reset_postdata();
	}

	/**
	 * Render post meta
	 *
	 * @access protected
	 */
	protected function render_post_meta() {
		$settings = $this->get_settings_for_display();

		// Author Icon
		if ( ! isset( $settings['author_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['author_icon'] = 'fa fa-user';
		}

		$has_author_icon = ! empty( $settings['author_icon'] );

		if ( $has_author_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['author_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_author_icon && ! empty( $settings['select_author_icon']['value'] ) ) {
			$has_author_icon = true;
		}
		$migrated_author_icon = isset( $settings['__fa4_migrated']['select_author_icon'] );
		$is_new_author_icon   = ! isset( $settings['author_icon'] ) && Icons_Manager::is_migration_allowed();

		// Category Icon
		if ( ! isset( $settings['category_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['category_icon'] = 'fa fa-folder-open';
		}

		$has_category_icon = ! empty( $settings['category_icon'] );

		if ( $has_category_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['category_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_category_icon && ! empty( $settings['select_category_icon']['value'] ) ) {
			$has_category_icon = true;
		}
		$migrated_category_icon = isset( $settings['__fa4_migrated']['select_category_icon'] );
		$is_new_category_icon   = ! isset( $settings['category_icon'] ) && Icons_Manager::is_migration_allowed();

		if ( 'yes' === $settings['post_meta'] ) {
			?>
			<div class="pp-card-slider-meta">
				<?php if ( 'yes' === $settings['post_author'] ) { ?>
					<span class="pp-content-author">
						<?php if ( $has_author_icon ) { ?>
							<span class="pp-card-slider-meta-icon pp-icon">
								<?php
								if ( $is_new_author_icon || $migrated_author_icon ) {
									Icons_Manager::render_icon( $settings['select_author_icon'], array( 'aria-hidden' => 'true' ) );
								} elseif ( ! empty( $settings['author_icon'] ) ) {
									?>
									<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
									<?php
								}
								?>
							</span>
						<?php } ?>
						<span class="pp-card-slider-meta-text">
							<?php echo get_the_author(); ?>
						</span>
					</span>
				<?php } ?>  
				<?php if ( 'yes' === $settings['post_category'] ) { ?>
					<span class="pp-post-category">
						<?php if ( $has_category_icon ) { ?>
							<span class="pp-card-slider-meta-icon pp-icon">
								<?php
								if ( $is_new_author_icon || $migrated_author_icon ) {
									Icons_Manager::render_icon( $settings['select_category_icon'], array( 'aria-hidden' => 'true' ) );
								} elseif ( ! empty( $settings['category_icon'] ) ) {
									?>
									<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
									<?php
								}
								?>
							</span>
						<?php } ?>
						<span class="pp-card-slider-meta-text">
							<?php
								$category = get_the_category();
							if ( $category ) {
								echo esc_attr( $category[0]->name );
							}
							?>
						</span>
					</span>
				<?php } ?>  
			</div>
			<?php
		}
	}
}
