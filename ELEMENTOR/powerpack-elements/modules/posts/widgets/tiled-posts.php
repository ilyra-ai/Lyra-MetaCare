<?php
namespace PowerpackElements\Modules\Posts\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Modules\Posts\Widgets\Posts_Base;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Posts_Helper;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Group_Control_Transition;

// Elementor Classes.
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Css_Filter;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Tiled Posts Widget
 */
class Tiled_Posts extends Posts_Base {

	/**
	 * Retrieve tiled posts widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Tiled_Posts' );
	}

	/**
	 * Retrieve tiled posts widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Tiled_Posts' );
	}

	/**
	 * Retrieve tiled posts widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Tiled_Posts' );
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
		return parent::get_widget_keywords( 'Tiled_Posts' );
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
			'widget-pp-tiled-posts'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register tiled posts widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {

		/* Content Tab: Layout */
		$this->register_content_layout_controls();

		/* Content Tab: Other Posts */
		$this->register_content_other_posts_controls();

		/* Content Tab: Query */
		$this->register_query_section_controls( '', 'tiled_posts', 'yes' );

		/* Content Tab: Post Meta */
		$this->register_content_post_meta_controls();

		/* Content Tab: Help Docs */
		$this->register_content_help_docs();

		/* Style Tab: Layout */
		$this->register_style_layout_controls();

		/* Style Tab: Image */
		$this->register_style_image_controls();

		/* Style Tab: Content */
		$this->register_style_content_controls();

		/* Style Tab: Title */
		$this->register_style_title_controls();

		/* Style Tab: Post Category */
		$this->register_style_post_category_controls();

		/* Style Tab: Post Meta */
		$this->register_style_post_meta_controls();

		/* Style Tab: Post Excerpt */
		$this->register_style_post_excerpt_controls();

		/* Style Tab: Button */
		$this->register_style_button_controls();

		/* Style Tab: Post Overlay */
		$this->register_style_overlay_controls();
	}

	/**
	 * Content Tab: Layout
	 */
	protected function register_content_layout_controls() {
		$this->start_controls_section(
			'section_post_settings',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
			)
		);

		$this->add_control(
			'layout',
			array(
				'label'       => esc_html__( 'Layout', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => true,
				'toggle'      => false,
				'options'     => array(
					'layout-1' => array(
						'title' => esc_html__( 'Layout 1', 'powerpack' ),
						'icon'  => 'ppicon-layout-1',
					),
					'layout-2' => array(
						'title' => esc_html__( 'Layout 2', 'powerpack' ),
						'icon'  => 'ppicon-layout-2',
					),
					'layout-3' => array(
						'title' => esc_html__( 'Layout 3', 'powerpack' ),
						'icon'  => 'ppicon-layout-3',
					),
					'layout-4' => array(
						'title' => esc_html__( 'Layout 4', 'powerpack' ),
						'icon'  => 'ppicon-layout-4',
					),
					'layout-5' => array(
						'title' => esc_html__( 'Layout 5', 'powerpack' ),
						'icon'  => 'ppicon-layout-5',
					),
					'layout-6' => array(
						'title' => esc_html__( 'Layout 6', 'powerpack' ),
						'icon'  => 'ppicon-layout-6',
					),
				),
				'separator'   => 'none',
				'default'     => 'layout-1',
			)
		);

		$this->add_control(
			'content_vertical_position',
			array(
				'label'       => esc_html__( 'Content Position', 'powerpack' ),
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
				'separator'   => 'before',
				'default'     => 'bottom',
			)
		);

		$this->add_control(
			'content_text_alignment',
			array(
				'label'       => esc_html__( 'Text Alignment', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => false,
				'default'     => 'left',
				'options'     => array(
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
				'selectors'   => array(
					'{{WRAPPER}} .pp-tiled-post-content' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'post_title',
			array(
				'label'        => esc_html__( 'Post Title', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'post_title_length',
			array(
				'label'       => esc_html__( 'Title Length', 'powerpack' ),
				'title'       => esc_html__( 'In characters', 'powerpack' ),
				'description' => esc_html__( 'Leave blank to show full title', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'step'        => 1,
				'condition'   => array(
					'post_title' => 'yes',
				),
			)
		);

		$this->add_control(
			'post_title_html_tag',
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
				'condition' => array(
					'post_title' => 'yes',
				),
			)
		);

		$this->add_control(
			'read_more_button',
			array(
				'label'        => esc_html__( 'Read More Button', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'read_more_button_text',
			array(
				'label'       => esc_html__( 'Button Text', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Read More', 'powerpack' ),
				'placeholder' => esc_html__( 'Read More', 'powerpack' ),
				'condition'   => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'fallback_image',
			array(
				'label'     => esc_html__( 'Fallback Image', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''            => esc_html__( 'None', 'powerpack' ),
					'placeholder' => esc_html__( 'Placeholder', 'powerpack' ),
					'custom'      => esc_html__( 'Custom', 'powerpack' ),
				),
				'default'   => '',
				'separator' => 'before',
			)
		);

		$this->add_control(
			'fallback_image_custom',
			array(
				'label'     => esc_html__( 'Fallback Image Custom', 'powerpack' ),
				'type'      => Controls_Manager::MEDIA,
				'condition' => array(
					'fallback_image' => 'custom',
				),
			)
		);

		$this->add_control(
			'large_tile_heading',
			array(
				'label'     => esc_html__( 'Large Tile', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout!' => 'layout-5',
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
					'layout!' => 'layout-5',
				),
			)
		);

		$this->add_control(
			'post_excerpt',
			array(
				'label'        => esc_html__( 'Post Excerpt', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'no',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout!' => 'layout-5',
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
					'layout!'      => 'layout-5',
					'post_excerpt' => 'yes',
				),
			)
		);

		$this->add_control(
			'small_tiles_heading',
			array(
				'label'     => esc_html__( 'Small Tiles', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'    => 'image_size_small',
				'label'   => esc_html__( 'Image Size', 'powerpack' ),
				'default' => 'medium_large',
			)
		);

		$this->add_control(
			'post_excerpt_small',
			array(
				'label'        => esc_html__( 'Post Excerpt', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'no',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'excerpt_length_small',
			array(
				'label'     => esc_html__( 'Excerpt Length', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 20,
				'min'       => 0,
				'max'       => 58,
				'step'      => 1,
				'condition' => array(
					'post_excerpt_small' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Other Posts
	 */
	protected function register_content_other_posts_controls() {
		$this->start_controls_section(
			'section_other_posts',
			array(
				'label' => esc_html__( 'Other Posts', 'powerpack' ),
			)
		);

		$this->add_control(
			'other_posts',
			array(
				'label'        => esc_html__( 'Show Other Posts', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'no',
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'other_posts_count',
			array(
				'label'       => esc_html__( 'Posts Count', 'powerpack' ),
				'description' => esc_html__( 'Leave blank to show all posts', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'step'        => 1,
				'default'     => 4,
				'condition'   => array(
					'other_posts' => 'yes',
				),
			)
		);

		$this->add_control(
			'other_posts_columns',
			array(
				'label'     => esc_html__( 'Columns', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					'1' => esc_html__( '1', 'powerpack' ),
					'2' => esc_html__( '2', 'powerpack' ),
					'3' => esc_html__( '3', 'powerpack' ),
					'4' => esc_html__( '4', 'powerpack' ),
				),
				'default'   => '2',
				'condition' => array(
					'other_posts' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Post Meta
	 */
	protected function register_content_post_meta_controls() {
		$this->start_controls_section(
			'section_post_meta',
			array(
				'label' => esc_html__( 'Post Meta', 'powerpack' ),
			)
		);

		$this->add_control(
			'post_meta',
			array(
				'label'        => esc_html__( 'Post Meta', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'post_meta_divider',
			array(
				'label'     => esc_html__( 'Post Meta Divider', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '-',
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-posts-meta > span:not(:last-child):after' => 'content: "{{UNIT}}";',
				),
				'condition' => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'post_author',
			array(
				'label'        => esc_html__( 'Post Author', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'post_category',
			array(
				'label'        => esc_html__( 'Post Category', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'post_date',
			array(
				'label'        => esc_html__( 'Post Date', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'date_type',
			array(
				'label'     => esc_html__( 'Date Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''         => esc_html__( 'Published Date', 'powerpack' ),
					'modified' => esc_html__( 'Last Modified Date', 'powerpack' ),
					'ago'      => esc_html__( 'Time Ago', 'powerpack' ),
					'key'      => esc_html__( 'Custom Meta Key', 'powerpack' ),
				),
				'default'   => '',
				'condition' => array(
					'post_meta' => 'yes',
					'post_date' => 'yes',
				),
			)
		);

		$this->add_control(
			'date_format',
			array(
				'label'     => esc_html__( 'Date Format', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''       => esc_html__( 'Default', 'powerpack' ),
					'F j, Y' => gmdate( 'F j, Y' ),
					'Y-m-d'  => gmdate( 'Y-m-d' ),
					'm/d/Y'  => gmdate( 'm/d/Y' ),
					'd/m/Y'  => gmdate( 'd/m/Y' ),
					'custom' => esc_html__( 'Custom', 'powerpack' ),
				),
				'default'   => '',
				'condition' => array(
					'post_meta' => 'yes',
					'post_date' => 'yes',
					'date_type' => [ '', 'modified' ],
				),
			)
		);

		$this->add_control(
			'date_custom_format',
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
				'default'     => 'F j, Y',
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'post_meta'   => 'yes',
					'post_date'   => 'yes',
					'date_type'   => [ '', 'modified' ],
					'date_format' => 'custom',
				),
			)
		);

		$this->add_control(
			'date_meta_key',
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
					'post_meta' => 'yes',
					'post_date' => 'yes',
					'date_type' => 'key',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Help Docs
	 *
	 * @since 1.4.8
	 * @access protected
	 */
	protected function register_content_help_docs() {

		$help_docs = PP_Config::get_widget_help_links( 'Tiled_Posts' );

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
			'height',
			array(
				'label'      => esc_html__( 'Height', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'vh', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 200,
						'max'  => 1000,
						'step' => 1,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 535,
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-post' => 'height: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-tiled-post-medium, {{WRAPPER}} .pp-tiled-post-small, {{WRAPPER}} .pp-tiled-post-xs, {{WRAPPER}} .pp-tiled-post-large' => 'height: calc( ({{SIZE}}{{UNIT}} - {{vertical_spacing.SIZE}}px)/2 );',
					'(mobile){{WRAPPER}} .pp-tiled-post' => 'height: calc( ({{SIZE}}{{UNIT}} - {{vertical_spacing.SIZE}}px)/2 );',
				),
			)
		);

		$this->add_responsive_control(
			'horizontal_spacing',
			array(
				'label'      => esc_html__( 'Horizontal Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 50,
						'step' => 1,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 5,
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-posts'       => 'margin-left: -{{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-tiled-post, {{WRAPPER}} .pp-tiled-posts-layout-6 .pp-tiles-posts-left .pp-tiled-post, {{WRAPPER}} .pp-tiled-posts-layout-6 .pp-tiles-posts-right .pp-tiled-post' => 'margin-left: {{SIZE}}{{UNIT}}; width: calc( 100% - {{SIZE}}{{UNIT}} );',
					'{{WRAPPER}} .pp-tiled-post-medium' => 'width: calc( 50% - {{SIZE}}{{UNIT}} );',
					'{{WRAPPER}} .pp-tiled-post-small'  => 'width: calc( 33.333% - {{SIZE}}{{UNIT}} );',
					'{{WRAPPER}} .pp-tiled-post-xs'     => 'width: calc( 25% - {{SIZE}}{{UNIT}} );',
				),
			)
		);

		$this->add_responsive_control(
			'vertical_spacing',
			array(
				'label'      => esc_html__( 'Vertical Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 50,
						'step' => 1,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 5,
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-post' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'tiles_style_heading',
			array(
				'label'     => esc_html__( 'Tiles', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'fallback_img_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-media-background' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'fallback_image' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'tiles_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-tiled-post',
			)
		);

		$this->add_responsive_control(
			'tiles_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-post' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'tiles_box_shadow',
				'selector' => '{{WRAPPER}} .pp-tiled-post',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Image
	 */
	protected function register_style_image_controls() {
		$this->start_controls_section(
			'section_post_image_style',
			array(
				'label' => esc_html__( 'Image', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'image_position',
			array(
				'label'     => esc_html__( 'Image Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''              => _x( 'Default', 'Background Image Position', 'powerpack' ),
					'center center' => _x( 'Center Center', 'Background Image Position', 'powerpack' ),
					'center left'   => _x( 'Center Left', 'Background Image Position', 'powerpack' ),
					'center right'  => _x( 'Center Right', 'Background Image Position', 'powerpack' ),
					'top center'    => _x( 'Top Center', 'Background Image Position', 'powerpack' ),
					'top left'      => _x( 'Top Left', 'Background Image Position', 'powerpack' ),
					'top right'     => _x( 'Top Right', 'Background Image Position', 'powerpack' ),
					'bottom center' => _x( 'Bottom Center', 'Background Image Position', 'powerpack' ),
					'bottom left'   => _x( 'Bottom Left', 'Background Image Position', 'powerpack' ),
					'bottom right'  => _x( 'Bottom Right', 'Background Image Position', 'powerpack' ),
				),
				'default'   => '',
				'selectors' => [
					'{{WRAPPER}} .pp-media-background' => 'background-position: {{VALUE}};',
				],
			)
		);

		$this->start_controls_tabs( 'thumbnail_effects_tabs' );

		$this->start_controls_tab(
			'normal',
			array(
				'label' => esc_html__( 'Normal', 'powerpack' ),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name'      => 'thumbnail_filters',
				'selector'  => '{{WRAPPER}} .pp-media-background',
			)
		);

		$this->add_group_control(
			Group_Control_Transition::get_type(),
			array(
				'name'      => 'image_transition',
				'selector'  => '{{WRAPPER}} .pp-media-background, {{WRAPPER}} .pp-post-link:before',
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'hover',
			array(
				'label' => esc_html__( 'Hover', 'powerpack' ),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name'      => 'thumbnail_hover_filters',
				'selector'  => '{{WRAPPER}} .pp-tiled-post:hover .pp-media-background',
			)
		);

		$this->add_control(
			'hover_animation',
			[
				'label' => esc_html__( 'Hover Animation', 'powerpack' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Content
	 */
	protected function register_style_content_controls() {
		$this->start_controls_section(
			'section_post_content_style',
			array(
				'label' => esc_html__( 'Content', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'     => 'post_content_bg',
				'label'    => esc_html__( 'Post Content Background', 'powerpack' ),
				'types'    => array( 'classic', 'gradient' ),
				'exclude'  => array( 'image' ),
				'selector' => '{{WRAPPER}} .pp-tiled-post-content',
			)
		);

		$this->add_responsive_control(
			'post_content_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-post-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Title
	 */
	protected function register_style_title_controls() {
		$this->start_controls_section(
			'section_title_style',
			array(
				'label'     => esc_html__( 'Title', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'post_title' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post-title' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'post_title' => 'yes',
				),
			)
		);

		$this->add_control(
			'title_text_color_hover',
			array(
				'label'     => esc_html__( 'Hover Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-post-title' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'post_title' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'title_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector'  => '{{WRAPPER}} .pp-tiled-post-title',
				'condition' => array(
					'post_title' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'     => 'title_text_shadow',
				'selector' => '{{WRAPPER}} .pp-tiled-post-title',
			]
		);

		$this->add_responsive_control(
			'title_margin_bottom',
			array(
				'label'      => esc_html__( 'Margin Bottom', 'powerpack' ),
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
					'{{WRAPPER}} .pp-tiled-post-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'post_title' => 'yes',
				),
			)
		);

		$this->add_control(
			'large_tile_title_heading',
			array(
				'label'     => esc_html__( 'Large Tile', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout!'    => 'layout-5',
					'post_title' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'large_title_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector'  => '{{WRAPPER}} .pp-tiled-post-featured .pp-tiled-post-title',
				'condition' => array(
					'layout!'    => 'layout-5',
					'post_title' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Post Category
	 */
	protected function register_style_post_category_controls() {
		$this->start_controls_section(
			'section_cat_style',
			array(
				'label'     => esc_html__( 'Post Category', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'post_category' => 'yes',
				),
			)
		);

		$this->add_control(
			'category_style',
			array(
				'label'     => esc_html__( 'Category Style', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					'style-1' => esc_html__( 'Style 1', 'powerpack' ),
					'style-2' => esc_html__( 'Style 2', 'powerpack' ),
				),
				'default'   => 'style-1',
				'condition' => array(
					'post_category' => 'yes',
				),
			)
		);

		$this->add_control(
			'cat_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'                => [
					'default' => Global_Colors::COLOR_PRIMARY,
				],
				'selectors' => array(
					'{{WRAPPER}} .pp-post-categories-style-2 span' => 'background: {{VALUE}}',
				),
				'condition' => array(
					'post_category'  => 'yes',
					'category_style' => 'style-2',
				),
			)
		);

		$this->add_control(
			'cat_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#fff',
				'selectors' => array(
					'{{WRAPPER}} .pp-post-categories' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'post_category' => 'yes',
				),
			)
		);

		$this->add_control(
			'cat_text_color_hover',
			array(
				'label'     => esc_html__( 'Hover Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-post:hover .pp-post-categories' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'post_category' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'cat_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-post-categories',
				'condition' => array(
					'post_category' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'cat_margin_bottom',
			array(
				'label'      => esc_html__( 'Margin Bottom', 'powerpack' ),
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
					'{{WRAPPER}} .pp-post-categories' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'post_category' => 'yes',
				),
			)
		);

		$this->add_control(
			'cat_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-post-categories-style-2 span' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'post_category'  => 'yes',
					'category_style' => 'style-2',
				),
			)
		);

		$this->add_control(
			'large_tile_cat_heading',
			array(
				'label'     => esc_html__( 'Large Tile', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout!'       => 'layout-5',
					'post_category' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'large_cat_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-tiled-post-featured .pp-post-categories',
				'condition' => array(
					'layout!'       => 'layout-5',
					'post_category' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Post Meta
	 */
	protected function register_style_post_meta_controls() {
		$this->start_controls_section(
			'section_meta_style',
			array(
				'label'     => esc_html__( 'Post Meta', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'meta_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#fff',
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-posts-meta' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'meta_text_color_hover',
			array(
				'label'     => esc_html__( 'Hover Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-posts-meta' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'meta_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-tiled-posts-meta',
				'condition' => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'meta_items_spacing',
			array(
				'label'      => esc_html__( 'Items Spacing', 'powerpack' ),
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
					'{{WRAPPER}} .pp-tiled-posts-meta > span:not(:last-child):after' => 'margin-left: calc({{SIZE}}{{UNIT}}/2); margin-right: calc({{SIZE}}{{UNIT}}/2);',
				),
				'condition'  => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'meta_margin_bottom',
			array(
				'label'      => esc_html__( 'Margin Bottom', 'powerpack' ),
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
					'{{WRAPPER}} .pp-tiled-posts-meta' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_control(
			'large_tile_meta_heading',
			array(
				'label'     => esc_html__( 'Large Tile', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout!'   => 'layout-5',
					'post_meta' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'large_meta_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-tiled-post-featured .pp-tiled-posts-meta',
				'condition' => array(
					'layout!'   => 'layout-5',
					'post_meta' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Post Excerpt
	 */
	protected function register_style_post_excerpt_controls() {
		$this->start_controls_section(
			'section_excerpt_style',
			array(
				'label'      => esc_html__( 'Post Excerpt', 'powerpack' ),
				'tab'        => Controls_Manager::TAB_STYLE,
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name'  => 'post_excerpt',
							'operator'  => '==',
							'value' => 'yes',
						],
						[
							'name'  => 'post_excerpt_small',
							'operator'  => '==',
							'value' => 'yes',
						],
					],
				],
			)
		);

		$this->add_control(
			'excerpt_text_color',
			array(
				'label'      => esc_html__( 'Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '#fff',
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-post-excerpt' => 'color: {{VALUE}}',
				),
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name'  => 'post_excerpt',
							'operator'  => '==',
							'value' => 'yes',
						],
						[
							'name'  => 'post_excerpt_small',
							'operator'  => '==',
							'value' => 'yes',
						],
					],
				],
			)
		);

		$this->add_control(
			'excerpt_text_color_hover',
			array(
				'label'      => esc_html__( 'Hover Color', 'powerpack' ),
				'type'       => Controls_Manager::COLOR,
				'default'    => '',
				'selectors'  => array(
					'{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-post-excerpt' => 'color: {{VALUE}}',
				),
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name'  => 'post_excerpt',
							'operator'  => '==',
							'value' => 'yes',
						],
						[
							'name'  => 'post_excerpt_small',
							'operator'  => '==',
							'value' => 'yes',
						],
					],
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'       => 'excerpt_typography',
				'label'      => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
				'selector'   => '{{WRAPPER}} .pp-tiled-post-excerpt',
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name'  => 'post_excerpt',
							'operator'  => '==',
							'value' => 'yes',
						],
						[
							'name'  => 'post_excerpt_small',
							'operator'  => '==',
							'value' => 'yes',
						],
					],
				],
			)
		);

		$this->add_control(
			'large_tile_excerpt_heading',
			array(
				'label'      => esc_html__( 'Large Tile', 'powerpack' ),
				'type'       => Controls_Manager::HEADING,
				'separator'  => 'before',
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'relation' => 'and',
							'terms' => [
								[
									'name'  => 'post_excerpt',
									'operator'  => '==',
									'value' => 'yes',
								],
								[
									'name'  => 'layout',
									'operator'  => '!==',
									'value' => 'layout-5',
								],
							],
						],
						[
							'relation' => 'and',
							'terms' => [
								[
									'name'  => 'post_excerpt_small',
									'operator'  => '==',
									'value' => 'yes',
								],
								[
									'name'  => 'layout',
									'operator'  => '!==',
									'value' => 'layout-5',
								],
							],
						],
					],
				],
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'       => 'large_excerpt_typography',
				'label'      => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
				'selector'   => '{{WRAPPER}} .pp-tiled-post-featured .pp-tiled-post-excerpt',
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'relation' => 'and',
							'terms' => [
								[
									'name'  => 'post_excerpt',
									'operator'  => '==',
									'value' => 'yes',
								],
								[
									'name'  => 'layout',
									'operator'  => '!==',
									'value' => 'layout-5',
								],
							],
						],
						[
							'relation' => 'and',
							'terms' => [
								[
									'name'  => 'post_excerpt_small',
									'operator'  => '==',
									'value' => 'yes',
								],
								[
									'name'  => 'layout',
									'operator'  => '!==',
									'value' => 'layout-5',
								],
							],
						],
					],
				],
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Overlay
	 */
	protected function register_style_overlay_controls() {
		$this->start_controls_section(
			'section_overlay_style',
			array(
				'label' => esc_html__( 'Overlay', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->start_controls_tabs( 'tabs_overlay_style' );

		$this->start_controls_tab(
			'tab_overlay_normal',
			array(
				'label' => esc_html__( 'Normal', 'powerpack' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'     => 'post_overlay_bg',
				'label'    => esc_html__( 'Overlay Background', 'powerpack' ),
				'types'    => array( 'classic', 'gradient' ),
				'exclude'  => array( 'image' ),
				'selector' => '{{WRAPPER}} .pp-tiled-posts .pp-post-link:before',
			)
		);

		$this->add_control(
			'post_overlay_opacity',
			array(
				'label'     => esc_html__( 'Opacity', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'range'     => array(
					'px' => array(
						'min'  => 0,
						'max'  => 1,
						'step' => 0.1,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-posts .pp-post-link:before' => 'opacity: {{SIZE}};',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_overlay_hover',
			array(
				'label' => esc_html__( 'Hover', 'powerpack' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'     => 'post_overlay_bg_hover',
				'label'    => esc_html__( 'Overlay Background', 'powerpack' ),
				'types'    => array( 'classic', 'gradient' ),
				'exclude'  => array( 'image' ),
				'selector' => '{{WRAPPER}} .pp-tiled-post:hover .pp-post-link:before',
			)
		);

		$this->add_control(
			'post_overlay_opacity_hover',
			array(
				'label'     => esc_html__( 'Opacity', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'range'     => array(
					'px' => array(
						'min'  => 0,
						'max'  => 1,
						'step' => 0.1,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-post:hover .pp-post-link:before' => 'opacity: {{SIZE}};',
				),
			)
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
				'label'     => esc_html__( 'Read More Button', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post-button' => 'margin-top: {{SIZE}}px;',
				),
				'condition'  => array(
					'read_more_button' => 'yes',
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
					'read_more_button' => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_button_style' );

		$this->start_controls_tab(
			'tab_button_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post-button' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'button_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'                => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-tiled-post-button' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'read_more_button' => 'yes',
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
				'selector'    => '{{WRAPPER}} .pp-tiled-post-button',
				'condition'   => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'read_more_button' => 'yes',
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
				'selector'  => '{{WRAPPER}} .pp-tiled-post-button',
				'condition' => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-tiled-post-button',
				'condition' => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-post-button' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-post-button' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'read_more_button' => 'yes',
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
					'{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-post-button' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'button_animation',
			array(
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::HOVER_ANIMATION,
				'condition' => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-tiled-post:hover .pp-tiled-post-button',
				'condition' => array(
					'read_more_button' => 'yes',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Render tiled posts widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings();

		$this->add_render_attribute(
			array(
				'tiled-posts'     => array(
					'class' => array(
						'pp-tiled-posts',
						'pp-tiled-posts-' . $settings['layout'],
						'clearfix',
					),
				),
				'post-content'    => array(
					'class' => array(
						'pp-tiled-post-content',
						'pp-tiled-post-content-' . $settings['content_vertical_position'],
					),
				),
				'post-categories' => array(
					'class' => array(
						'pp-post-categories',
						'pp-post-categories-' . $settings['category_style'],
					),
				),
			)
		);
		?>
		<div <?php $this->print_render_attribute_string( 'tiled-posts' ); ?>>
			<?php
			$count = 1;

			$layout = $settings['layout'];

			switch ( $layout ) {
				case 'layout-1':
					$posts_count = 4;
					break;

				case 'layout-2':
				case 'layout-3':
					$posts_count = 3;
					break;

				case 'layout-4':
				case 'layout-5':
				case 'layout-6':
					$posts_count = 5;
					break;

				default:
					$posts_count = 3;
					break;
			}

			if ( 'yes' === $settings['other_posts'] ) {
				if ( ! empty( $settings['other_posts_count'] ) && is_numeric( $settings['other_posts_count'] ) ) {
					$number_of_posts = absint( $settings['other_posts_count'] );
					$posts_count    += $number_of_posts;
				} else {
					$posts_count = '-1';
				}
			}

			/* $args = $this->query_posts_args( '', '', '', '', '', 'tiled_posts', 'yes', '', $posts_count );

			$posts_query = new \WP_Query( $args ); */
			$this->query_posts( '', '', '', '', '', 'tiled_posts', 'yes', '', $posts_count );
			$posts_query = $this->get_query();

			if ( 'yes' === $settings['other_posts'] ) {
				if ( ( ! empty( $settings['other_posts_count'] ) && is_numeric( $settings['other_posts_count'] ) )
					&& ( $posts_count > $posts_query->found_posts ) ) {
						$posts_count = $posts_query->found_posts;
				}
			}

			if ( $posts_query->have_posts() ) :
				while ( $posts_query->have_posts() ) :
					$posts_query->the_post();
					if ( 1 === $count && 'layout-5' !== $layout ) {
						echo '<div class="pp-tiles-posts-left">';
					}

					if ( 3 === $count && 'layout-6' === $layout ) {
						echo '<div class="pp-tiles-posts-center">';
					}

					if (
						( 2 === $count && ( 'layout-1' === $layout || 'layout-2' === $layout || 'layout-3' === $layout || 'layout-4' === $layout ) ) ||
						( 4 === $count && 'layout-6' === $layout ) ) {
						echo '<div class="pp-tiles-posts-right">';
					}

					if ( 'yes' === $settings['other_posts'] && (
						( 5 === $count && 'layout-1' === $layout ) ||
						( 4 === $count && ( 'layout-2' === $layout || 'layout-3' === $layout ) ) ||
						( 6 === $count && ( 'layout-4' === $layout || 'layout-5' === $layout || 'layout-6' === $layout ) )
						) ) {
						echo '<div class="pp-tiled-post-group pp-tiled-post-col-' . esc_attr( $settings['other_posts_columns'] ) . '">';
					}

					$this->render_post_body( $count, $layout );

					if (
						( 1 === $count && ( 'layout-1' === $layout || 'layout-2' === $layout || 'layout-3' === $layout || 'layout-4' === $layout ) ) ||
						( 2 === $count && 'layout-6' === $layout ) ||
						( 3 === $count && 'layout-6' === $layout ) ) {
						echo '</div>';
					}

					if ( 'yes' === $settings['other_posts'] && $count === $posts_count ) {
						echo '</div>';
					}

					if ( 'layout-1' === $layout ) {
						if ( 4 === $count ) {
							echo '</div>';
						}
					} elseif ( 'layout-2' === $layout || 'layout-3' === $layout ) {
						if ( 3 === $count ) {
							echo '</div>';
						}
					} elseif ( 'layout-4' === $layout ) {
						if ( 5 === $count ) {
							echo '</div>';
						}
					} elseif ( 'layout-6' === $layout ) {
						if ( 5 === $count ) {
							echo '</div>';
						}
					}

					$count++;
				endwhile;
			endif;
			wp_reset_postdata();
			?>
		</div>
		<?php
	}

	/**
	 * Get post date
	 *
	 * @since 2.3.7
	 * @access protected
	 */
	protected function get_post_date() {
		$settings = $this->get_settings_for_display();
		$date_type = $settings['date_type'];
		$date_format = $settings['date_format'];
		$date_custom_format = $settings['date_custom_format'];
		$date = '';

		if ( 'custom' === $date_format && $date_custom_format ) {
			$date_format = $date_custom_format;
		}

		if ( 'ago' === $date_type ) {
			$date = sprintf( _x( '%s ago', '%s = human-readable time difference', 'powerpack' ), human_time_diff( get_the_time( 'U' ), current_time( 'timestamp' ) ) );
		} elseif ( 'modified' === $date_type ) {
			$date = get_the_modified_date( $date_format, get_the_ID() );
		} elseif ( 'key' === $date_type ) {
			$date_meta_key = $settings['date_meta_key'];
			if ( $date_meta_key ) {
				$date = get_post_meta( get_the_ID(), $date_meta_key, 'true' );
			}
		} else {
			$date = get_the_date( $date_format );
		}

		if ( '' === $date ) {
			$date = get_the_date( $date_format );
		}

		return apply_filters( 'ppe_tiled_posts_date', $date, get_the_ID() );
	}

	/**
	 * Render posts body output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @param  mixed  $count   Post count.
	 * @param  string $layout  Posts layout.
	 *
	 * @access protected
	 */
	protected function render_post_body( $count, $layout ) {
		$settings = $this->get_settings();

		$this->add_render_attribute(
			'post-' . $count,
			'class',
			array(
				'pp-tiled-post',
				'pp-tiled-post-' . intval( $count ),
				$this->get_post_class( $count, $layout ),
			)
		);

		$post_type_name = $settings['post_type'];
		if ( has_post_thumbnail() || 'attachment' === $post_type_name ) {
			if ( 'attachment' === $post_type_name ) {
				$image_id = get_the_ID();
			} else {
				$image_id = get_post_thumbnail_id( get_the_ID() );
			}
			if (
				( 1 === $count && ( 'layout-1' === $layout || 'layout-2' === $layout || 'layout-3' === $layout || 'layout-4' === $layout ) ) ||
				( 3 === $count && 'layout-6' === $layout ) ) {
				$thumb_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image_size', $settings );
			} else {
				$thumb_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image_size_small', $settings );
			}
		} else {
			if ( 'placeholder' === $settings['fallback_image'] ) {
				$thumb_url = Utils::get_placeholder_image_src();
			} elseif ( 'custom' === $settings['fallback_image'] && ! empty( $settings['fallback_image_custom']['url'] ) ) {
				$custom_image_id = $settings['fallback_image_custom']['id'];
				if ( 1 === $count && 'layout-5' !== $layout ) {
					$thumb_url = Group_Control_Image_Size::get_attachment_image_src( $custom_image_id, 'image_size', $settings );
				} else {
					$thumb_url = Group_Control_Image_Size::get_attachment_image_src( $custom_image_id, 'image_size_small', $settings );
				}
			} else {
				$thumb_url = '';
			}
		}

		$image_class = ! empty( $settings['hover_animation'] ) ? 'elementor-animation-' . $settings['hover_animation'] : '';
		$posts_link  = apply_filters( 'ppe_tiled_posts_link', get_the_permalink(), get_the_ID(), $settings );

		$this->add_render_attribute(
			'post-bg-' . $count,
			'class',
			array(
				'pp-tiled-post-bg',
				'pp-media-background',
				esc_attr( $image_class ),
			)
		);

		if ( $thumb_url ) {
			$this->add_render_attribute(
				'post-bg-' . $count,
				'style',
				'background-image:url(' . esc_url( $thumb_url ) . ')',
			);
		}
		?>
		<div <?php $this->print_render_attribute_string( 'post-' . $count ); ?>>
			<div <?php $this->print_render_attribute_string( 'post-bg-' . $count ); ?>>
				<a class="pp-post-link" href="<?php echo $posts_link; ?>" title="<?php the_title_attribute(); ?>"></a>
			</div>
			<div <?php $this->print_render_attribute_string( 'post-content' ); ?>>
				<?php if ( 'yes' === $settings['post_meta'] ) { ?>
					<?php if ( 'yes' === $settings['post_category'] ) { ?>
						<div <?php $this->print_render_attribute_string( 'post-categories' ); ?>>
							<span>
								<?php
									$category = get_the_category();
								if ( $category ) {
									echo esc_attr( $category[0]->name );
								}
								?>
							</span>
						</div>
					<?php } ?>
				<?php } ?>

				<?php if ( 'yes' === $settings['post_title'] ) { ?>
					<?php $title_tag = PP_Helper::validate_html_tag( $settings['post_title_html_tag'] ); ?>
					<header>
						<<?php PP_Helper::print_validated_html_tag( $title_tag ); ?> class="pp-tiled-post-title">
							<?php echo wp_kses_post( $this->get_post_title_length( get_the_title() ) ); ?>
						</<?php PP_Helper::print_validated_html_tag( $title_tag ); ?>>
					</header>
				<?php } ?>

				<?php if ( 'yes' === $settings['post_meta'] ) { ?>
					<div class="pp-tiled-posts-meta">
						<?php if ( 'yes' === $settings['post_author'] ) { ?>
							<span class="pp-post-author">
								<?php echo get_the_author(); ?>
							</span>
						<?php } ?>
						<?php if ( 'yes' === $settings['post_date'] ) { ?>
							<?php
								printf(
									'<span class="pp-post-date"><span class="screen-reader-text">%1$s </span>%2$s</span>',
									esc_html__( 'Posted on', 'powerpack' ),
									wp_kses_post( $this->get_post_date() )
								);
							?>
						<?php } ?>
					</div>
				<?php } ?>

				<?php $this->render_post_excerpt( $count, $layout ); ?>

				<?php if ( 'yes' === $settings['read_more_button'] ) { ?>
					<?php
					$this->add_render_attribute(
						'button',
						'class',
						array(
							'pp-tiled-post-button',
							'elementor-button',
							'elementor-size-' . $settings['button_size'],
						)
					);
					?>
					<a <?php $this->print_render_attribute_string( 'button' ); ?> href="<?php esc_url( the_permalink() ); ?>">
						<span class="pp-tiled-post-button-text">
							<?php echo esc_attr( $settings['read_more_button_text'] ); ?>
						</span>
					</a>
				<?php } ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render posts body output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @param  mixed  $count   Post count.
	 * @param  string $layout  Posts layout.
	 *
	 * @access protected
	 */
	protected function render_post_excerpt( $count, $layout ) {
		$settings = $this->get_settings();

		if (
			( 1 === $count && ( 'layout-1' === $layout || 'layout-2' === $layout || 'layout-3' === $layout || 'layout-4' === $layout ) ) ||
			( 3 === $count && 'layout-6' === $layout ) ) {
			$post_excerpt = $settings['post_excerpt'];
			$limit        = $settings['excerpt_length'];
		} else {
			$post_excerpt = $settings['post_excerpt_small'];
			$limit        = $settings['excerpt_length_small'];
		}

		if ( 'yes' === $post_excerpt ) {
			?>
			<div class="pp-tiled-post-excerpt">
				<?php echo wp_kses_post( $this->get_custom_post_excerpt( $limit ) ); ?>
			</div>
			<?php
		}
	}

	/**
	 * Get post class.
	 *
	 * @param  mixed  $count   Post count.
	 * @param  string $layout  Posts layout.
	 *
	 * @access protected
	 */
	protected function get_post_class( $count, $layout ) {
		$settings = $this->get_settings();

		$class = '';

		if (
			( 1 === $count && ( 'layout-1' === $layout || 'layout-2' === $layout || 'layout-3' === $layout || 'layout-4' === $layout ) ) ||
			( 3 === $count && 'layout-6' === $layout ) ) {
			$class = 'pp-tiled-post-featured';
		} elseif (
			( 2 === $count && 'layout-1' === $layout ) ||
			( ( 2 === $count || 3 === $count ) && ( 'layout-2' === $layout || 'layout-3' === $layout ) ) ) {
			$class = 'pp-tiled-post-large';
		} elseif (
			( ( 3 === $count || 4 === $count ) && 'layout-1' === $layout ) ||
			( ( 1 === $count || 2 === $count ) && 'layout-5' === $layout ) ||
			( ( 1 === $count || 2 === $count || 4 === $count || 5 === $count ) && 'layout-6' === $layout ) ) {
			$class = 'pp-tiled-post-medium';
		} elseif ( $count > 1 && $count < 6 && 'layout-4' === $layout ) {
			$class = 'pp-tiled-post-medium';
		} elseif ( ( 3 === $count || 4 === $count || 5 === $count ) && 'layout-5' === $layout ) {
			$class = 'pp-tiled-post-small';
		}

		if ( $this->check_other_posts( $count, $layout ) ) {
			switch ( $settings['other_posts_columns'] ) {
				case '4':
					$class = 'pp-tiled-post-xs';
					break;

				case '3':
					$class = 'pp-tiled-post-small';
					break;

				case '2':
					$class = 'pp-tiled-post-medium';
					break;

				case '1':
					$class = 'pp-tiled-post-large';
					break;
			}
		}

		return $class;
	}

	/**
	 * Check other posts.
	 *
	 * @param  mixed  $count   Post count.
	 * @param  string $layout  Posts layout.
	 *
	 * @access protected
	 */
	protected function check_other_posts( $count, $layout ) {
		$settings = $this->get_settings();

		if ( 'yes' === $settings['other_posts'] && (
			( $count >= 5 && 'layout-1' === $layout ) ||
			( $count >= 4 && ( 'layout-2' === $layout || 'layout-3' === $layout ) ) ||
			( $count >= 6 && ( 'layout-4' === $layout || 'layout-5' === $layout ) ||
			( $count >= 6 && 'layout-6' === $layout ) ) ) ) {
			return true;
		}
	}

	/**
	 * Get post title length.
	 *
	 * @param  string $title Post title.
	 *
	 * @access protected
	 */
	protected function get_post_title_length( $title ) {
		$settings = $this->get_settings();

		$length = absint( $settings['post_title_length'] );

		if ( $length ) {
			if ( strlen( $title ) > $length ) {
				$title = substr( $title, 0, $length ) . '&hellip;';
			}
		}

		return $title;
	}

	/**
	 * Get custom post excerpt.
	 *
	 * @param  int $limit Excerpt limit.
	 *
	 * @access protected
	 */
	protected function get_custom_post_excerpt( $limit ) {
		$excerpt = explode( ' ', get_the_excerpt(), $limit );

		if ( count( $excerpt ) >= $limit ) {
			array_pop( $excerpt );
			$excerpt = implode( ' ', $excerpt ) . '...';
		} else {
			$excerpt = implode( ' ', $excerpt );
		}

		$excerpt = preg_replace( '`[[^]]*]`', '', $excerpt );

		return $excerpt;
	}
}
