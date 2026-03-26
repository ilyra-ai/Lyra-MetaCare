<?php
namespace PowerpackElements\Modules\Showcase\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Modules\Showcase\Module;
use PowerpackElements\Classes\PP_Posts_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Icons_Manager;
use Elementor\Repeater;
use Elementor\Control_Media;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Css_Filter;
use Elementor\Embed;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Showcase Widget
 */
class Showcase extends Powerpack_Widget {

	/**
	 * Retrieve showcase widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Showcase' );
	}

	/**
	 * Retrieve showcase widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Showcase' );
	}

	/**
	 * Retrieve showcase widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Showcase' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 1.3.6
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Showcase' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the showcase widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'jquery-fancybox',
			'jquery-resize',
			'pp-slick',
			'pp-showcase',
		];
	}

	/**
	 * Retrieve the list of styles the showcase widget depended on.
	 *
	 * Used to set styles dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_style_depends() {
		return [
			'fancybox',
			'pp-swiper',
			'widget-pp-showcase'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register showcase widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_general_controls();
		$this->register_content_items_controls();
		$this->register_content_query_controls();
		$this->register_content_navigation_controls();
		$this->register_content_preview_controls();
		$this->register_content_additional_options_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_preview_controls();
		$this->register_style_preview_content_controls();
		$this->register_style_preview_overlay_controls();
		$this->register_style_navigation_controls();
		$this->register_style_play_icon_controls();
		$this->register_style_arrows_controls();
		$this->register_style_dots_controls();
	}

	/*-----------------------------------------------------------------------------------*/
	/*	CONTENT TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_content_general_controls() {
		/**
		 * Content Tab: General
		 */
		$this->start_controls_section(
			'section_general',
			[
				'label'                 => esc_html__( 'General', 'powerpack' ),
			]
		);

		$this->add_control(
			'source',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'custom'     => esc_html__( 'Custom', 'powerpack' ),
					'posts'      => esc_html__( 'Posts', 'powerpack' ),
				],
				'default'               => 'custom',
			]
		);

		$this->add_control(
			'posts_per_page',
			[
				'label'                 => esc_html__( 'Posts Count', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 4,
				'condition'             => [
					'source'    => 'posts',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_items_controls() {
		/**
		 * Content Tab: Items
		 */
		$this->start_controls_section(
			'section_items',
			[
				'label'                 => esc_html__( 'Items', 'powerpack' ),
				'condition'             => [
					'source'    => 'custom',
				],
			]
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'content_tabs' );

		$repeater->start_controls_tab(
			'tab_content',
			[
				'label'                 => esc_html__( 'Content', 'powerpack' ),
			]
		);

		$repeater->add_control(
			'title',
			[
				'label'             => esc_html__( 'Title', 'powerpack' ),
				'type'              => Controls_Manager::TEXT,
				'default'           => '',
				'dynamic'           => [
					'active'   => true,
				],
			]
		);

		$repeater->add_control(
			'description',
			[
				'label'             => esc_html__( 'Description', 'powerpack' ),
				'type'              => Controls_Manager::TEXTAREA,
				'default'           => '',
				'dynamic'           => [
					'active'   => true,
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab(
			'tab_preview',
			[
				'label'                 => esc_html__( 'Preview', 'powerpack' ),
			]
		);

		$repeater->add_control(
			'content_type',
			[
				'label'                 => esc_html__( 'Content Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'label_block'           => false,
				'options'               => [
					'image'     => esc_html__( 'Image', 'powerpack' ),
					'video'     => esc_html__( 'Video', 'powerpack' ),
					'section'   => esc_html__( 'Saved Section', 'powerpack' ),
					'widget'    => esc_html__( 'Saved Widget', 'powerpack' ),
					'template'  => esc_html__( 'Saved Page Template', 'powerpack' ),
				],
				'default'               => 'image',
			]
		);

		$repeater->add_control(
			'image',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'   => true,
				],
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'condition'             => [
					'content_type'  => 'image',
				],
			]
		);

		$repeater->add_control(
			'link_to',
			[
				'label'                 => esc_html__( 'Link to', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'none',
				'options'               => [
					'none'      => esc_html__( 'None', 'powerpack' ),
					'file'      => esc_html__( 'Media File', 'powerpack' ),
					'custom'    => esc_html__( 'Custom URL', 'powerpack' ),
				],
				'condition'             => [
					'content_type'  => 'image',
				],
			]
		);

		$repeater->add_control(
			'link',
			[
				'label'                 => esc_html__( 'Link', 'powerpack' ),
				'type'                  => Controls_Manager::URL,
				'dynamic'               => [
					'active'        => true,
					'categories'    => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => 'https://www.your-link.com',
				'default'               => [
					'url' => '#',
				],
				'condition'             => [
					'content_type'  => 'image',
					'link_to'       => 'custom',
				],
			]
		);

		$repeater->add_control(
			'open_lightbox',
			[
				'label'                 => esc_html__( 'Lightbox', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'default',
				'options'               => [
					'default'   => esc_html__( 'Default', 'powerpack' ),
					'yes'       => esc_html__( 'Yes', 'powerpack' ),
					'no'        => esc_html__( 'No', 'powerpack' ),
				],
				'condition'             => [
					'content_type'  => 'image',
					'link_to'       => 'file',
				],
			]
		);

		$repeater->add_control(
			'video_source',
			[
				'label'                 => esc_html__( 'Video Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'youtube',
				'options'               => [
					'youtube'     => esc_html__( 'YouTube', 'powerpack' ),
					'vimeo'       => esc_html__( 'Vimeo', 'powerpack' ),
					'dailymotion' => esc_html__( 'Dailymotion', 'powerpack' ),
					'hosted'      => esc_html__( 'Self Hosted', 'powerpack' ),
				],
				'condition'             => [
					'content_type'  => 'video',
				],
			]
		);

		$repeater->add_control(
			'insert_url',
			[
				'label'     => esc_html__( 'External URL', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'condition' => [
					'content_type' => 'video',
					'video_source' => 'hosted',
				],
			]
		);

		$repeater->add_control(
			'hosted_url',
			[
				'label'      => esc_html__( 'Choose File', 'powerpack' ),
				'type'       => Controls_Manager::MEDIA,
				'dynamic'    => [
					'active' => true,
					'categories' => [
						TagsModule::MEDIA_CATEGORY,
					],
				],
				'media_type' => 'video',
				'condition'  => [
					'content_type' => 'video',
					'video_source' => 'hosted',
					'insert_url'   => '',
				],
			]
		);

		$repeater->add_control(
			'external_url',
			[
				'label'        => esc_html__( 'URL', 'powerpack' ),
				'type'         => Controls_Manager::URL,
				'autocomplete' => false,
				'options'      => false,
				'label_block'  => true,
				'show_label'   => false,
				'dynamic'      => [
					'active' => true,
					'categories' => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'media_type'   => 'video',
				'placeholder'  => esc_html__( 'Enter your URL', 'powerpack' ),
				'condition'    => [
					'content_type' => 'video',
					'video_source' => 'hosted',
					'insert_url'   => 'yes',
				],
			]
		);

		$repeater->add_control(
			'video_url',
			[
				'label'                 => esc_html__( 'Video URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'label_block'           => true,
				'default'               => 'https://www.youtube.com/watch?v=XHOmBV4js_E',
				'dynamic'               => [
					'active'   => true,
				],
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'content_type' => 'video',
					'video_source' => [ 'youtube', 'vimeo', 'dailymotion' ],
				],
			]
		);

		$repeater->add_control(
			'start',
			[
				'label'       => esc_html__( 'Start Time', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'description' => esc_html__( 'Specify a start time (in seconds)', 'powerpack' ),
				'condition'   => [
					'content_type' => 'video',
				],
			]
		);

		$repeater->add_control(
			'end',
			[
				'label'       => esc_html__( 'End Time', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'description' => esc_html__( 'Specify an end time (in seconds)', 'powerpack' ),
				'condition'   => [
					'content_type' => 'video',
					'video_source' => [ 'youtube', 'hosted' ],
				],
			]
		);

		$repeater->add_control(
			'cc_load_policy',
			[
				'label'     => esc_html__( 'Captions', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'condition' => [
					'content_type'  => 'video',
					'video_source'  => 'youtube',
				],
			]
		);

		$repeater->add_control(
			'thumbnail_size',
			[
				'label'                 => esc_html__( 'Thumbnail Size', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'maxresdefault',
				'options'               => [
					'maxresdefault' => esc_html__( 'Maximum Resolution', 'powerpack' ),
					'hqdefault'     => esc_html__( 'High Quality', 'powerpack' ),
					'mqdefault'     => esc_html__( 'Medium Quality', 'powerpack' ),
					'sddefault'     => esc_html__( 'Standard Quality', 'powerpack' ),
				],
				'condition'             => [
					'content_type'  => 'video',
					'video_source'  => 'youtube',
				],
			]
		);

		$repeater->add_control(
			'saved_widget',
			[
				'label'                 => esc_html__( 'Choose Widget', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-widget',
				'conditions'        => [
					'terms' => [
						[
							'name'      => 'content_type',
							'operator'  => '==',
							'value'     => 'widget',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'saved_section',
			[
				'label'                 => esc_html__( 'Choose Section', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-section',
				'conditions'        => [
					'terms' => [
						[
							'name'      => 'content_type',
							'operator'  => '==',
							'value'     => 'section',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'templates',
			[
				'label'                 => esc_html__( 'Choose Template', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-page',
				'conditions'        => [
					'terms' => [
						[
							'name'      => 'content_type',
							'operator'  => '==',
							'value'     => 'template',
						],
					],
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab(
			'tab_navigation',
			[
				'label'                 => esc_html__( 'Navigation', 'powerpack' ),
			]
		);

		$repeater->add_control(
			'nav_icon_type',
			[
				'label'             => esc_html__( 'Icon Type', 'powerpack' ),
				'type'              => Controls_Manager::CHOOSE,
				'label_block'       => false,
				'options'           => [
					'none'        => [
						'title'   => esc_html__( 'None', 'powerpack' ),
						'icon'    => 'eicon-ban',
					],
					'icon'        => [
						'title'   => esc_html__( 'Icon', 'powerpack' ),
						'icon'    => 'eicon-star',
					],
					'image'       => [
						'title'   => esc_html__( 'Image', 'powerpack' ),
						'icon'    => 'eicon-image-bold',
					],
				],
				'default'           => 'none',
			]
		);

		$repeater->add_control(
			'select_nav_icon',
			[
				'label'             => esc_html__( 'Icon', 'powerpack' ),
				'type'              => Controls_Manager::ICONS,
				'fa4compatibility'  => 'nav_icon',
				'default'           => [
					'value'     => 'far fa-image',
					'library'   => 'fa-regular',
				],
				'condition'         => [
					'nav_icon_type' => 'icon',
				],
			]
		);

		$repeater->add_control(
			'nav_icon_image',
			[
				'label'             => esc_html__( 'Icon Image', 'powerpack' ),
				'type'              => Controls_Manager::MEDIA,
				'default'           => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'condition'         => [
					'nav_icon_type' => 'image',
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->end_controls_tabs();

		$this->add_control(
			'items',
			[
				'label'     => '',
				'type'      => Controls_Manager::REPEATER,
				'default'   => [
					[
						'content_type'   => 'image',
						'image'         => [
							'url' => Utils::get_placeholder_image_src(),
						],
						'title'         => esc_html__( 'Item 1', 'powerpack' ),
						'description'   => esc_html__( 'I am the description for item 1', 'powerpack' ),
					],
					[
						'content_type'   => 'image',
						'image'         => [
							'url' => Utils::get_placeholder_image_src(),
						],
						'title'         => esc_html__( 'Item 2', 'powerpack' ),
						'description'   => esc_html__( 'I am the description for item 2', 'powerpack' ),
					],
					[
						'content_type'   => 'image',
						'image'         => [
							'url' => Utils::get_placeholder_image_src(),
						],
						'title'         => esc_html__( 'Item 3', 'powerpack' ),
						'description'   => esc_html__( 'I am the description for item 3', 'powerpack' ),
					],
				],
				'fields'        => $repeater->get_controls(),
				'title_field'   => '{{ title }}',
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_query_controls() {
		/**
		 * Content Tab: Query
		 */
		$this->start_controls_section(
			'section_post_query',
			[
				'label'                 => esc_html__( 'Query', 'powerpack' ),
				'condition'             => [
					'source'    => 'posts',
				],
			]
		);

		$this->add_control(
			'post_type',
			[
				'label'                 => esc_html__( 'Post Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => PP_Posts_Helper::get_post_types(),
				'default'               => 'post',

			]
		);

		$post_types = PP_Posts_Helper::get_post_types();

		foreach ( $post_types as $post_type_slug => $post_type_label ) {

			$taxonomy = PP_Posts_Helper::get_post_taxonomies( $post_type_slug );

			if ( ! empty( $taxonomy ) ) {

				foreach ( $taxonomy as $index => $tax ) {

					$terms = get_terms( $index );

					$tax_terms = array();

					if ( ! empty( $terms ) ) {

						foreach ( $terms as $term_index => $term_obj ) {

							$tax_terms[ $term_obj->term_id ] = $term_obj->name;
						}

						if ( 'post' === $post_type_slug ) {
							if ( 'post_tag' === $index ) {
								$tax_control_key = 'tags';
							} elseif ( 'category' === $index ) {
								$tax_control_key = 'categories';
							} else {
								$tax_control_key = $index . '_' . $post_type_slug;
							}
						} else {
							$tax_control_key = $index . '_' . $post_type_slug;
						}

						// Taxonomy filter type
						$this->add_control(
							$index . '_' . $post_type_slug . '_filter_type',
							[
								/* translators: %s Label */
								'label'       => sprintf( esc_html__( '%s Filter Type', 'powerpack' ), $tax->label ),
								'type'        => Controls_Manager::SELECT,
								'default'     => 'IN',
								'label_block' => true,
								'options'     => [
									/* translators: %s label */
									'IN'     => sprintf( esc_html__( 'Include %s', 'powerpack' ), $tax->label ),
									/* translators: %s label */
									'NOT IN' => sprintf( esc_html__( 'Exclude %s', 'powerpack' ), $tax->label ),
								],
								'separator'         => 'before',
								'condition'   => [
									'post_type' => $post_type_slug,
								],
							]
						);

						$this->add_control(
							$tax_control_key,
							[
								'label'         => $tax->label,
								'type'          => 'pp-query',
								'post_type'     => $post_type_slug,
								'options'       => [],
								'label_block'   => true,
								'multiple'      => true,
								'query_type'    => 'terms',
								'object_type'   => $index,
								'include_type'  => true,
								'condition'   => [
									'post_type' => $post_type_slug,
								],
							]
						);

					}
				}
			}
		}

		$this->add_control(
			'author_filter_type',
			[
				'label'       => esc_html__( 'Authors Filter Type', 'powerpack' ),
				'type'        => Controls_Manager::SELECT,
				'default'     => 'author__in',
				'label_block' => true,
				'separator'         => 'before',
				'options'     => [
					'author__in'     => esc_html__( 'Include Authors', 'powerpack' ),
					'author__not_in' => esc_html__( 'Exclude Authors', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'authors',
			[
				'label'                 => esc_html__( 'Authors', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => true,
				'multiple'              => true,
				'query_type'            => 'authors',
			]
		);

		foreach ( $post_types as $post_type_slug => $post_type_label ) {

			if ( 'post' === $post_type_slug ) {
				$posts_control_key = 'exclude_posts';
			} else {
				$posts_control_key = $post_type_slug . '_filter';
			}

			$this->add_control(
				$post_type_slug . '_filter_type',
				[
					'label'             => sprintf( esc_html__( '%s Filter Type', 'powerpack' ), $post_type_label ),
					'type'              => Controls_Manager::SELECT,
					'default'           => 'post__not_in',
					'label_block'       => true,
					'separator'         => 'before',
					'options'           => [
						'post__in'     => sprintf( esc_html__( 'Include %s', 'powerpack' ), $post_type_label ),
						'post__not_in' => sprintf( esc_html__( 'Exclude %s', 'powerpack' ), $post_type_label ),
					],
					'condition'   => [
						'post_type' => $post_type_slug,
					],
				]
			);

			$this->add_control(
				$posts_control_key,
				[
					/* translators: %s Label */
					'label'             => $post_type_label,
					'type'              => 'pp-query',
					'default'           => '',
					'multiple'          => true,
					'label_block'       => true,
					'query_type'        => 'posts',
					'object_type'       => $post_type_slug,
					'condition'         => [
						'post_type' => $post_type_slug,
					],
				]
			);
		}

		$this->add_control(
			'select_date',
			[
				'label'             => esc_html__( 'Date', 'powerpack' ),
				'type'              => Controls_Manager::SELECT,
				'options'           => [
					'anytime'   => esc_html__( 'All', 'powerpack' ),
					'today'     => esc_html__( 'Past Day', 'powerpack' ),
					'week'      => esc_html__( 'Past Week', 'powerpack' ),
					'month'     => esc_html__( 'Past Month', 'powerpack' ),
					'quarter'   => esc_html__( 'Past Quarter', 'powerpack' ),
					'year'      => esc_html__( 'Past Year', 'powerpack' ),
					'exact'     => esc_html__( 'Custom', 'powerpack' ),
				],
				'default'           => 'anytime',
				'label_block'       => false,
				'multiple'          => false,
				'separator'         => 'before',
			]
		);

		$this->add_control(
			'date_before',
			[
				'label'             => esc_html__( 'Before', 'powerpack' ),
				'description'       => esc_html__( 'Setting a ‘Before’ date will show all the posts published until the chosen date (inclusive).', 'powerpack' ),
				'type'              => Controls_Manager::DATE_TIME,
				'label_block'       => false,
				'multiple'          => false,
				'placeholder'       => esc_html__( 'Choose', 'powerpack' ),
				'condition'         => [
					'select_date' => 'exact',
				],
			]
		);

		$this->add_control(
			'date_after',
			[
				'label'             => esc_html__( 'After', 'powerpack' ),
				'description'       => esc_html__( 'Setting an ‘After’ date will show all the posts published since the chosen date (inclusive).', 'powerpack' ),
				'type'              => Controls_Manager::DATE_TIME,
				'label_block'       => false,
				'multiple'          => false,
				'placeholder'       => esc_html__( 'Choose', 'powerpack' ),
				'condition'         => [
					'select_date' => 'exact',
				],
			]
		);

		$this->add_control(
			'order',
			[
				'label'             => esc_html__( 'Order', 'powerpack' ),
				'type'              => Controls_Manager::SELECT,
				'options'           => [
					'DESC'           => esc_html__( 'Descending', 'powerpack' ),
					'ASC'       => esc_html__( 'Ascending', 'powerpack' ),
				],
				'default'           => 'DESC',
				'separator'         => 'before',
			]
		);

		$this->add_control(
			'orderby',
			[
				'label'             => esc_html__( 'Order By', 'powerpack' ),
				'type'              => Controls_Manager::SELECT,
				'options'           => [
					'date'           => esc_html__( 'Date', 'powerpack' ),
					'modified'       => esc_html__( 'Last Modified Date', 'powerpack' ),
					'rand'           => esc_html__( 'Random', 'powerpack' ),
					'comment_count'  => esc_html__( 'Comment Count', 'powerpack' ),
					'title'          => esc_html__( 'Title', 'powerpack' ),
					'ID'             => esc_html__( 'Post ID', 'powerpack' ),
					'author'         => esc_html__( 'Post Author', 'powerpack' ),
				],
				'default'           => 'date',
			]
		);

		$this->add_control(
			'sticky_posts',
			[
				'label'             => esc_html__( 'Sticky Posts', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => '',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
				'separator'         => 'before',
			]
		);

		$this->add_control(
			'all_sticky_posts',
			[
				'label'             => esc_html__( 'Show Only Sticky Posts', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => '',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
				'condition'         => [
					'sticky_posts' => 'yes',
				],
			]
		);

		$this->add_control(
			'offset',
			[
				'label'             => esc_html__( 'Offset', 'powerpack' ),
				'description'       => esc_html__( 'Use this setting to skip this number of initial posts', 'powerpack' ),
				'type'              => Controls_Manager::NUMBER,
				'default'           => '',
				'separator'         => 'before',
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_navigation_controls() {
		/**
		 * Content Tab: Navigation
		 */
		$this->start_controls_section(
			'section_navigation',
			[
				'label'                 => esc_html__( 'Navigation', 'powerpack' ),
			]
		);

		$this->add_control(
			'navigation_title',
			[
				'label'                 => esc_html__( 'Show Title', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'navigation_description',
			[
				'label'                 => esc_html__( 'Show Description/Excerpt', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'navigation_description_visibility',
			[
				'label'                 => esc_html__( 'Description Visibility', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					''          => esc_html__( 'Always', 'powerpack' ),
					'active'    => esc_html__( 'Active Tab Only', 'powerpack' ),
				],
				'condition'         => [
					'navigation_description' => 'yes',
				],
			]
		);

		$this->add_control(
			'navigation_excerpt_length',
			[
				'label'             => esc_html__( 'Excerpt Length', 'powerpack' ),
				'type'              => Controls_Manager::NUMBER,
				'default'           => 8,
				'min'               => 0,
				'max'               => 58,
				'step'              => 1,
				'condition'         => [
					'source'                 => 'posts',
					'navigation_description' => 'yes',
				],
			]
		);

		$this->add_control(
			'scrollable_nav',
			[
				'label'                 => esc_html__( 'Scrollable Navigation', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'nav_center_mode',
			[
				'label'                 => esc_html__( 'Center Mode', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
				'condition'             => [
					'scrollable_nav'    => 'yes',
				],
			]
		);

		$slides_to_show = range( 1, 10 );
		$slides_to_show = array_combine( $slides_to_show, $slides_to_show );

		$this->add_responsive_control(
			'nav_items',
			[
				'label'                 => esc_html__( 'Items to Show', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'' => esc_html__( 'Default', 'powerpack' ),
				] + $slides_to_show,
				'frontend_available'    => true,
				'condition'             => [
					'scrollable_nav'    => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_columns',
			[
				'label'                 => esc_html__( 'Columns', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => '1',
				'tablet_default'        => '1',
				'mobile_default'        => '1',
				'options'               => [
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
				],
				'prefix_class'          => 'elementor-grid%s-',
				'condition'             => [
					'scrollable_nav!'   => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_preview_controls() {
		/**
		 * Content Tab: Preview
		 */
		$this->start_controls_section(
			'section_preview',
			[
				'label'                 => esc_html__( 'Preview', 'powerpack' ),
			]
		);

		$this->add_control(
			'images_heading',
			[
				'label'                 => esc_html__( 'Images', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'image',
				'label'                 => esc_html__( 'Image Size', 'powerpack' ),
				'default'               => 'full',
				'exclude'               => [ 'custom' ],
			]
		);

		$this->add_control(
			'preview_caption',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Caption', 'powerpack' ),
				'default'               => '',
				'options'               => [
					''         => esc_html__( 'None', 'powerpack' ),
					'caption'  => esc_html__( 'Caption', 'powerpack' ),
					'title'    => esc_html__( 'Title', 'powerpack' ),
				],
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'preview_title',
			[
				'label'                 => esc_html__( 'Show Title', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'preview_description',
			[
				'label'                 => esc_html__( 'Show Description/Excerpt', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'preview_excerpt_length',
			[
				'label'             => esc_html__( 'Excerpt Length', 'powerpack' ),
				'type'              => Controls_Manager::NUMBER,
				'default'           => 25,
				'min'               => 0,
				'max'               => 58,
				'step'              => 1,
				'condition'         => [
					'source'                 => 'posts',
					'preview_description'    => 'yes',
				],
			]
		);

		$this->add_control(
			'posts_link_to',
			[
				'label'                 => esc_html__( 'Link to', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'none',
				'options'               => [
					'none'      => esc_html__( 'None', 'powerpack' ),
					'file'      => esc_html__( 'Media File', 'powerpack' ),
					'post_url'  => esc_html__( 'Post URL', 'powerpack' ),
					'custom'    => esc_html__( 'Custom URL', 'powerpack' ),
				],
				'condition'             => [
					'source'        => 'posts',
				],
			]
		);

		$this->add_control(
			'posts_link',
			[
				'label'                 => esc_html__( 'Link', 'powerpack' ),
				'show_label'            => false,
				'type'                  => Controls_Manager::URL,
				'dynamic'               => [
					'active'  => true,
				],
				'placeholder'           => esc_html__( 'http://your-link.com', 'powerpack' ),
				'condition'             => [
					'source'        => 'posts',
					'posts_link_to' => 'custom',
				],
			]
		);

		$this->add_control(
			'posts_link_external',
			[
				'label'                 => esc_html__( 'Open in new window', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'condition'             => [
					'source'        => 'posts',
					'posts_link_to' => 'post_url',
				],
			]
		);

		$this->add_control(
			'posts_link_nofollow',
			[
				'label'                 => esc_html__( 'Add nofollow', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'condition'             => [
					'source'        => 'posts',
					'posts_link_to' => 'post_url',
				],
			]
		);

		$this->add_control(
			'posts_open_lightbox',
			[
				'label'                 => esc_html__( 'Lightbox', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'default',
				'options'               => [
					'default'   => esc_html__( 'Default', 'powerpack' ),
					'yes'       => esc_html__( 'Yes', 'powerpack' ),
					'no'        => esc_html__( 'No', 'powerpack' ),
				],
				'condition'             => [
					'source'        => 'posts',
					'posts_link_to' => 'file',
				],
			]
		);

		$this->add_control(
			'videos_heading',
			[
				'label'                 => esc_html__( 'Videos', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'aspect_ratio',
			[
				'label'                 => esc_html__( 'Aspect Ratio', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'169' => '16:9',
					'219' => '21:9',
					'916' => '9:16',
					'43'  => '4:3',
					'32'  => '3:2',
					'11'  => '1:1',
				],
				'selectors_dictionary'  => [
					'169' => '1.77777', // 16 / 9
					'219' => '2.33333', // 21 / 9
					'43'  => '1.33333', // 4 / 3
					'32'  => '1.5', // 3 / 2
					'11'  => '1', // 1 / 1
					'916' => '0.5625', // 9 / 16
				],
				'default'               => '169',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-container' => 'aspect-ratio: {{VALUE}}',
				],
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'mute',
			[
				'label'                 => esc_html__( 'Mute', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'loop',
			array(
				'label'     => esc_html__( 'Loop', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'condition' => array(
					'source'        => 'custom',
				),
			)
		);

		$this->add_control(
			'hosted_videos_heading',
			[
				'label'     => esc_html__( 'Hosted Videos', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'controls',
			array(
				'label'     => esc_html__( 'Player Controls', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Hide', 'powerpack' ),
				'label_on'  => esc_html__( 'Show', 'powerpack' ),
				'default'   => 'yes',
				'condition' => array(
					'source'        => 'custom',
				),
			)
		);

		$this->add_control(
			'play_icon_heading',
			[
				'label'                 => esc_html__( 'Play Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'play_icon_type',
			[
				'label'                 => esc_html__( 'Icon Type', 'powerpack' ),
				'label_block'           => false,
				'toggle'                => false,
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'none'        => [
						'title'   => esc_html__( 'None', 'powerpack' ),
						'icon'    => 'eicon-ban',
					],
					'icon'        => [
						'title'   => esc_html__( 'Icon', 'powerpack' ),
						'icon'    => 'eicon-star',
					],
					'image'       => [
						'title'   => esc_html__( 'Image', 'powerpack' ),
						'icon'    => 'eicon-image-bold',
					],
				],
				'default'               => 'icon',
				'condition'             => [
					'source'        => 'custom',
				],
			]
		);

		$this->add_control(
			'select_play_icon',
			[
				'label'                 => esc_html__( 'Select Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'fa4compatibility'      => 'play_icon',
				'default'               => [
					'value'     => 'fas fa-play-circle',
					'library'   => 'fa-solid',
				],
				'recommended'           => [
					'fa-regular' => [
						'play-circle',
					],
					'fa-solid' => [
						'play',
						'play-circle',
					],
				],
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
				],
			]
		);

		$this->add_control(
			'play_icon_image',
			[
				'label'                 => esc_html__( 'Select Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'image',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_additional_options_controls() {
		/**
		 * Content Tab: Additional Options
		 */
		$this->start_controls_section(
			'section_additional_options',
			[
				'label'                 => esc_html__( 'Additional Options', 'powerpack' ),
			]
		);

		$this->add_control(
			'effect',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Effect', 'powerpack' ),
				'default'               => 'slide',
				'options'               => [
					'slide'    => esc_html__( 'Slide', 'powerpack' ),
					'fade'     => esc_html__( 'Fade', 'powerpack' ),
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'animation_speed',
			[
				'label'                 => esc_html__( 'Animation Speed', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 600,
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'arrows',
			[
				'label'                 => esc_html__( 'Arrows', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'dots',
			[
				'label'                 => esc_html__( 'Dots', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label'                 => esc_html__( 'Autoplay', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'autoplay_speed',
			[
				'label'                 => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 3000,
				'frontend_available'    => true,
				'condition'             => [
					'autoplay'  => 'yes',
				],
			]
		);

		$this->add_control(
			'pause_on_hover',
			[
				'label'                 => esc_html__( 'Pause on Hover', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
				'condition'             => [
					'autoplay'  => 'yes',
				],
			]
		);

		$this->add_control(
			'infinite_loop',
			[
				'label'                 => esc_html__( 'Infinite Loop', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'adaptive_height',
			[
				'label'                 => esc_html__( 'Adaptive Height', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'lightbox_heading',
			[
				'label'                 => esc_html__( 'Lightbox', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'lightbox_library',
			[
				'label'                 => esc_html__( 'Lightbox Library', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => '',
				'options'               => [
					''          => esc_html__( 'Elementor', 'powerpack' ),
					'fancybox'  => esc_html__( 'Fancybox', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'lightbox_caption',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Lightbox Caption', 'powerpack' ),
				'default'               => '',
				'options'               => [
					''         => esc_html__( 'None', 'powerpack' ),
					'caption'  => esc_html__( 'Caption', 'powerpack' ),
					'title'    => esc_html__( 'Title', 'powerpack' ),
				],
				'condition'             => [
					'lightbox_library'  => 'fancybox',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Showcase' );
		if ( ! empty( $help_docs ) ) {
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

	/*-----------------------------------------------------------------------------------*/
	/*	STYLE TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_style_preview_controls() {
		/**
		 * Style Tab: Preview
		 */
		$this->start_controls_section(
			'section_preview_style',
			[
				'label'                 => esc_html__( 'Preview', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'preview_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'right',
				'options'               => [
					'left'          => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'top'           => [
						'title'     => esc_html__( 'Top', 'powerpack' ),
						'icon'      => 'eicon-v-align-top',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
					'bottom'           => [
						'title'     => esc_html__( 'Bottom', 'powerpack' ),
						'icon'      => 'eicon-v-align-bottom',
					],
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'preview_vertical_align',
			[
				'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'right',
				'options'               => [
					'top'           => [
						'title'     => esc_html__( 'Top', 'powerpack' ),
						'icon'      => 'eicon-v-align-top',
					],
					'middle'        => [
						'title'     => esc_html__( 'Middle', 'powerpack' ),
						'icon'      => 'eicon-v-align-middle',
					],
					'bottom'           => [
						'title'     => esc_html__( 'Bottom', 'powerpack' ),
						'icon'      => 'eicon-v-align-bottom',
					],
				],
				'default'               => 'top',
				'selectors_dictionary'  => [
					'top'      => 'flex-start',
					'bottom'   => 'flex-end',
					'middle'   => 'center',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase' => 'align-items: {{VALUE}};',
				],
				'condition'             => [
					'preview_position'  => [ 'left', 'right' ],
				],
			]
		);

		$this->add_responsive_control(
			'preview_image_align',
			[
				'label'                 => esc_html__( 'Image Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'  => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-text-align-left',
					],
					'center'        => [
						'title'     => esc_html__( 'Center', 'powerpack' ),
						'icon'      => 'eicon-text-align-center',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-text-align-right',
					],
				],
				'default'               => 'left',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-image' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'preview_stack',
			[
				'label'                 => esc_html__( 'Stack On', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'tablet',
				'options'               => [
					'tablet'    => esc_html__( 'Tablet', 'powerpack' ),
					'mobile'    => esc_html__( 'Mobile', 'powerpack' ),
				],
				'prefix_class'          => 'pp-showcase-preview-stack-',
				'frontend_available'    => true,
				'condition'             => [
					'preview_position'  => [ 'left', 'right' ],
				],
			]
		);

		$this->add_responsive_control(
			'preview_width',
			[
				'label'                 => esc_html__( 'Width', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices'               => [ 'widescreen', 'desktop', 'laptop', 'tablet_extra', 'tablet' ],
				'range'                 => [
					'%'     => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default'               => [
					'size'  => 70,
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview-align-left .pp-showcase-preview-wrap' => 'width: {{SIZE}}%',
					'{{WRAPPER}} .pp-showcase-preview-align-right .pp-showcase-preview-wrap' => 'width: {{SIZE}}%',
					'{{WRAPPER}} .pp-showcase-preview-align-right .pp-showcase-navigation' => 'width: calc(100% - {{SIZE}}%)',
					'{{WRAPPER}} .pp-showcase-preview-align-left .pp-showcase-navigation' => 'width: calc(100% - {{SIZE}}%)',
				],
				'condition'             => [
					'preview_position'  => [ 'left', 'right' ],
				],
			]
		);

		$this->add_responsive_control(
			'preview_spacing',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px'    => [
						'min' => 0,
						'max' => 200,
					],
				],
				'default'               => [
					'size'  => 20,
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase' => 'gap: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'preview_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'preview_background',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-showcase-preview',
				'exclude'               => [
					'image',
				],
				'separator'             => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'preview_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-showcase-preview',
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'preview_box_shadow',
				'selector'              => '{{WRAPPER}} .pp-showcase-preview',
				'separator'             => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			[
				'name'                  => 'preview_css_filters',
				'selector'              => '{{WRAPPER}} .pp-showcase-preview img',
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_preview_content_controls() {
		/**
		 * Style Tab: Preview Content
		 */
		$this->start_controls_section(
			'section_preview_captions_style',
			[
				'label'                 => esc_html__( 'Preview Content', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'preview_captions_vertical_align',
			[
				'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'top'   => [
						'title'     => esc_html__( 'Top', 'powerpack' ),
						'icon'      => 'eicon-v-align-top',
					],
					'middle'        => [
						'title'     => esc_html__( 'Middle', 'powerpack' ),
						'icon'      => 'eicon-v-align-middle',
					],
					'bottom'        => [
						'title'     => esc_html__( 'Bottom', 'powerpack' ),
						'icon'      => 'eicon-v-align-bottom',
					],
				],
				'default'               => 'bottom',
				'selectors' => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-content' => 'justify-content: {{VALUE}};',
				],
				'selectors_dictionary'  => [
					'top'      => 'flex-start',
					'bottom'   => 'flex-end',
					'middle'   => 'center',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'preview_captions_horizontal_align',
			[
				'label'                 => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'  => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'center'        => [
						'title'     => esc_html__( 'Center', 'powerpack' ),
						'icon'      => 'eicon-h-align-center',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
					'justify'       => [
						'title'     => esc_html__( 'Justify', 'powerpack' ),
						'icon'      => 'eicon-h-align-stretch',
					],
				],
				'default'               => 'left',
				'selectors' => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-content' => 'align-items: {{VALUE}};',
				],
				'selectors_dictionary'  => [
					'left'     => 'flex-start',
					'right'    => 'flex-end',
					'center'   => 'center',
					'justify'  => 'stretch',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'preview_captions_align',
			[
				'label'                 => esc_html__( 'Text Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'  => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-text-align-left',
					],
					'center'        => [
						'title'     => esc_html__( 'Center', 'powerpack' ),
						'icon'      => 'eicon-text-align-center',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-text-align-right',
					],
				],
				'default'               => 'center',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info' => 'text-align: {{VALUE}};',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'relation' => 'and',
							'terms' => [
								[
									'name' => 'preview_caption',
									'operator' => '!=',
									'value' => '',
								],
								[
									'name' => 'preview_captions_horizontal_align',
									'operator' => '==',
									'value' => 'justify',
								],
							],
						],
						[
							'relation' => 'and',
							'terms' => [
								[
									'name' => 'preview_title',
									'operator' => '==',
									'value' => 'yes',
								],
								[
									'name' => 'preview_captions_horizontal_align',
									'operator' => '==',
									'value' => 'justify',
								],
							],
						],
						[
							'relation' => 'and',
							'terms' => [
								[
									'name' => 'preview_description',
									'operator' => '==',
									'value' => 'yes',
								],
								[
									'name' => 'preview_captions_horizontal_align',
									'operator' => '==',
									'value' => 'justify',
								],
							],
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'preview_captions_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'preview_captions_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->start_controls_tabs( 'tabs_preview_captions_style' );

		$this->start_controls_tab(
			'tab_preview_captions_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'preview_captions_background',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info',
				'exclude'               => [
					'image',
				],
			]
		);

		$this->add_control(
			'preview_caption_style_heading',
			[
				'label'                 => esc_html__( 'Caption', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'preview_caption!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_captions_text_color',
			[
				'label'                 => esc_html__( 'Caption Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'preview_caption!'  => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'preview_captions_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-caption',
				'condition'             => [
					'preview_caption!'  => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'preview_text_shadow',
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-caption',
				'condition'             => [
					'preview_caption!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_title_style_heading',
			[
				'label'                 => esc_html__( 'Title', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'preview_title!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_title_color',
			[
				'label'                 => esc_html__( 'Title Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-title' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'preview_title!'  => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'preview_title_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-title',
				'condition'             => [
					'preview_title!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_description_style_heading',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'preview_description!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_description_color',
			[
				'label'                 => esc_html__( 'Description/Excerpt Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-description' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'preview_description!'  => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'preview_description_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-description',
				'condition'             => [
					'preview_description!'  => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'preview_captions_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info',
				'separator'             => 'before',
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_control(
			'preview_captions_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_preview_captions_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'preview_captions_background_hover',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-info',
				'exclude'               => [
					'image',
				],
			]
		);

		$this->add_control(
			'preview_captions_text_color_hover',
			[
				'label'                 => esc_html__( 'Caption Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-caption' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'preview_caption!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_title_color_hover',
			[
				'label'                 => esc_html__( 'Title Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-title' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'preview_title!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_description_color_hover',
			[
				'label'                 => esc_html__( 'Description/Excerpt Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-description' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'preview_description!'  => '',
				],
			]
		);

		$this->add_control(
			'preview_captions_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-info' => 'border-color: {{VALUE}}',
				],
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'preview_text_shadow_hover',
				'selector'              => '{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-caption',
				'condition'             => [
					'preview_caption!'  => '',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'preview_captions_blend_mode',
			[
				'label'                 => esc_html__( 'Blend Mode', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					''             => esc_html__( 'Normal', 'powerpack' ),
					'multiply'     => 'Multiply',
					'screen'       => 'Screen',
					'overlay'      => 'Overlay',
					'darken'       => 'Darken',
					'lighten'      => 'Lighten',
					'color-dodge'  => 'Color Dodge',
					'saturation'   => 'Saturation',
					'color'        => 'Color',
					'difference'   => 'Difference',
					'exclusion'    => 'Exclusion',
					'hue'          => 'Hue',
					'luminosity'   => 'Luminosity',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .pp-showcase-preview-info' => 'mix-blend-mode: {{VALUE}}',
				],
				'separator'             => 'before',
				'conditions'            => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'preview_caption',
							'operator' => '!=',
							'value' => '',
						],
						[
							'name' => 'preview_title',
							'operator' => '==',
							'value' => 'yes',
						],
						[
							'name' => 'preview_description',
							'operator' => '==',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_preview_overlay_controls() {
		/**
		 * Style Tab: Preview Overlay
		 */
		$this->start_controls_section(
			'section_preview_overlay_style',
			[
				'label'                 => esc_html__( 'Preview Overlay', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_preview_overlay_style' );

		$this->start_controls_tab(
			'tab_preview_overlay_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'preview_overlay_background',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-showcase-preview-overlay',
				'exclude'               => [
					'image',
				],
			]
		);

		$this->add_responsive_control(
			'preview_overlay_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview-overlay' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_preview_overlay_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'preview_overlay_background_hover',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-showcase-preview:hover .pp-showcase-preview-overlay',
				'exclude'               => [
					'image',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_navigation_controls() {
		/**
		 * Style Tab: Navigation
		 */
		$this->start_controls_section(
			'section_navigation_style',
			[
				'label'                 => esc_html__( 'Navigation', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'navigation_items_horizontal_spacing',
			[
				'label'                 => esc_html__( 'Column Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px'    => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default'               => [
					'size'  => '',
				],
				'selectors'             => [
					'{{WRAPPER}}' => '--grid-column-gap: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'source'            => 'custom',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_items_vertical_spacing',
			[
				'label'                 => esc_html__( 'Row Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px'    => [
						'min' => 0,
						'max' => 200,
					],
				],
				'default'               => [
					'size'  => 15,
				],
				'selectors'             => [
					'{{WRAPPER}}' => '--grid-row-gap: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_text_align',
			[
				'label'                 => esc_html__( 'Text Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
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
				'default'               => 'left',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-items .pp-showcase-navigation-item' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'navigation_background',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-items' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-items' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_title_style' );

		$this->start_controls_tab(
			'tab_title_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'title_heading',
			[
				'label'                 => esc_html__( 'Title', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'title_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-title' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'title_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-showcase-navigation-title',
			]
		);

		$this->add_responsive_control(
			'title_margin',
			[
				'label'                 => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'  => 5,
				],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
					'%' => [
						'min'   => 0,
						'max'   => 30,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-title' => 'margin-bottom: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .pp-showcase-navigation-icon-left' => 'margin-bottom: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .pp-showcase-navigation-icon-left .pp-showcase-navigation-title' => 'margin-bottom: 0',
				],
			]
		);

		$this->add_control(
			'description_heading',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'description_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-description' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'description_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-showcase-navigation-description',
			]
		);

		$this->add_control(
			'navigation_icon_heading',
			[
				'label'                 => esc_html__( 'Navigation Icon/Image', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'navigation_icon_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'above' => esc_html__( 'Above Heading', 'powerpack' ),
					'left'  => esc_html__( 'Left of Heading', 'powerpack' ),
				],
				'default'               => 'above',
			]
		);

		$this->add_control(
			'navigation_icon_color',
			[
				'label'                 => esc_html__( 'Icon Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-icon' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_icon_size',
			[
				'label'                 => esc_html__( 'Icon Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min' => 10,
						'max' => 400,
					],
				],
				'default'               => [
					'size' => 20,
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-icon' => 'font-size: {{SIZE}}{{UNIT}}; line-height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'source'            => 'custom',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_icon_img_size',
			[
				'label'                 => esc_html__( 'Icon Image Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min' => 10,
						'max' => 400,
					],
				],
				'default'               => [
					'size' => 80,
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-icon img' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_icon_margin',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'  => 5,
				],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
					'%' => [
						'min'   => 0,
						'max'   => 30,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-icon-wrap' => 'margin-bottom: {{SIZE}}{{UNIT}}; margin-right: 0;',
					'{{WRAPPER}} .pp-showcase-navigation-icon-left .pp-showcase-navigation-icon-wrap' => 'margin-bottom: 0; margin-right: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'navigation_item_heading',
			[
				'label'                 => esc_html__( 'Navigation Item', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'navigation_item_background_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'navigation_item_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-showcase-navigation-item',
			]
		);

		$this->add_control(
			'navigation_item_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_item_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'navigation_item_box_shadow',
				'selector'              => '{{WRAPPER}} .pp-showcase-navigation-item',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_title_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'title_heading_hover',
			[
				'label'                 => esc_html__( 'Title', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'title_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item:hover .pp-showcase-navigation-title' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'description_heading_hover',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'description_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item:hover .pp-showcase-navigation-description' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'navigation_icon_hover_heading',
			[
				'label'                 => esc_html__( 'Navigation Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'navigation_icon_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item:hover .pp-showcase-navigation-icon' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'navigation_item_hover_heading',
			[
				'label'                 => esc_html__( 'Navigation Item', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'navigation_item_background_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item:hover' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'navigation_item_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-navigation-item:hover' => 'border-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'navigation_item_box_shadow_hover',
				'selector'              => '{{WRAPPER}} .pp-showcase-navigation-item:hover',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_color_active',
			[
				'label'                 => esc_html__( 'Active', 'powerpack' ),
			]
		);

		$this->add_control(
			'title_heading_active',
			[
				'label'                 => esc_html__( 'Title', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'title_color_active',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-active-slide .pp-showcase-navigation-item .pp-showcase-navigation-title, {{WRAPPER}} .slick-current .pp-showcase-navigation-item .pp-showcase-navigation-title' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'description_heading_active',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'description_color_active',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-active-slide .pp-showcase-navigation-item .pp-showcase-navigation-description, {{WRAPPER}} .slick-current .pp-showcase-navigation-item .pp-showcase-navigation-description' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'navigation_icon_active_heading',
			[
				'label'                 => esc_html__( 'Navigation Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'navigation_icon_active_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-active-slide .pp-showcase-navigation-item .pp-showcase-navigation-icon, {{WRAPPER}} .slick-current .pp-showcase-navigation-item .pp-showcase-navigation-icon' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'navigation_item_active_heading',
			[
				'label'                 => esc_html__( 'Navigation Item', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'navigation_item_background_color_active',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-active-slide .pp-showcase-navigation-item, {{WRAPPER}} .slick-current .pp-showcase-navigation-item' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'navigation_item_border_color_active',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-active-slide .pp-showcase-navigation-item, {{WRAPPER}} .slick-current .pp-showcase-navigation-item' => 'border-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'navigation_item_box_shadow_active',
				'selector'              => '{{WRAPPER}} .pp-active-slide .pp-showcase-navigation-item, {{WRAPPER}} .slick-current .pp-showcase-navigation-item',
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_play_icon_controls() {
		/**
		 * Style Tab: Play Icon
		 */
		$this->start_controls_section(
			'section_play_icon_style',
			[
				'label'                 => esc_html__( 'Play Icon', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type!'   => 'none',
				],
			]
		);

		$this->add_responsive_control(
			'play_icon_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min' => 10,
						'max' => 400,
					],
				],
				'default'               => [
					'size' => 80,
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}}' => '--pp-play-icon-size: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type!'   => 'none',
				],
			]
		);

		$this->add_control(
			'play_icon_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-video-play-icon img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'image',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_play_icon_style' );

		$this->start_controls_tab(
			'tab_play_icon_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
					'select_play_icon[value]!' => '',
				],
			]
		);

		$this->add_control(
			'play_icon_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'{{WRAPPER}} .pp-video-play-icon' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-video-play-icon svg' => 'fill: {{VALUE}}',
				],
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
					'select_play_icon[value]!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'play_icon_text_shadow',
				'selector'              => '{{WRAPPER}} .pp-video-play-icon',
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
					'select_play_icon[value]!' => '',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_play_icon_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
					'select_play_icon[value]!' => '',
				],
			]
		);

		$this->add_control(
			'play_icon_hover_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'selectors'             => [
					'{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon svg' => 'fill: {{VALUE}}',
				],
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
					'select_play_icon[value]!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'play_icon_hover_text_shadow',
				'selector'              => '{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon',
				'condition'             => [
					'source'            => 'custom',
					'play_icon_type'    => 'icon',
					'select_play_icon[value]!' => '',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_arrows_controls() {
		/**
		 * Style Tab: Arrows
		 */
		$this->start_controls_section(
			'section_arrows_style',
			[
				'label'                 => esc_html__( 'Arrows', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
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
				'condition'             => [
					'arrows'        => 'yes',
				],
			)
		);

		$this->add_responsive_control(
			'arrows_size',
			[
				'label'                 => esc_html__( 'Arrows Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [ 'size' => '22' ],
				'range'                 => [
					'px' => [
						'min'   => 15,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'font-size: {{SIZE}}{{UNIT}}; line-height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'arrows_position',
			[
				'label'                 => esc_html__( 'Align Arrows', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => -100,
						'max'   => 50,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-arrow-next' => 'right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-arrow-prev' => 'left: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_arrows_style' );

		$this->start_controls_tab(
			'tab_arrows_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_color_normal',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_bg_color_normal',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'arrows_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-slider-arrow',
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_arrows_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow:hover',
				],
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'arrows_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-slider-arrow' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'separator'             => 'before',
				'condition'             => [
					'arrows'        => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_dots_controls() {
		/**
		 * Style Tab: Dots
		 */
		$this->start_controls_section(
			'section_dots_style',
			[
				'label'                 => esc_html__( 'Dots', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'dots'      => 'yes',
				],
			]
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
				'prefix_class'          => 'pp-slick-slider-dots-',
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li button' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'dots'      => 'yes',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_dots_style' );

		$this->start_controls_tab(
			'tab_dots_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li.slick-active' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'dots'      => 'yes',
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
				'selector'              => '{{WRAPPER}} .pp-showcase-preview .slick-dots li',
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'dots'      => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'dots_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'allowed_dimensions'    => 'vertical',
				'placeholder'           => [
					'top'      => '',
					'right'    => 'auto',
					'bottom'   => '',
					'left'     => 'auto',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-showcase-preview .slick-dots' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'dots'      => 'yes',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li:hover' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'dots'      => 'yes',
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
					'{{WRAPPER}} .pp-showcase-preview .slick-dots li:hover' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'dots'      => 'yes',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
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
	 * Get post query arguments.
	 *
	 * @access protected
	 */
	protected function get_posts_query_arguments() {
		$settings = $this->get_settings();
		$posts_count = absint( $settings['posts_per_page'] );
		$post_type   = $settings['post_type'];

		// Query Arguments
		$query_args = array(
			'post_status'           => array( 'publish' ),
			'post_type'             => $settings['post_type'],
			'orderby'               => $settings['orderby'],
			'order'                 => $settings['order'],
			'offset'                => $settings['offset'],
			'ignore_sticky_posts'   => ( 'yes' === $settings['sticky_posts'] ) ? 0 : 1,
			'showposts'             => $posts_count,
		);

		if ( 'attachment' === $post_type ) {
			$query_args['post_status'] = array( 'inherit' );
		}

		// Author Filter
		if ( ! empty( $settings['authors'] ) ) {
			$query_args[ $settings['author_filter_type'] ] = $settings['authors'];
		}

		// Posts Filter
		if ( 'post' === $post_type ) {
			$posts_control_key = 'exclude_posts';
		} else {
			$posts_control_key = $post_type . '_filter';
		}

		if ( ! empty( $settings[ $posts_control_key ] ) ) {
			$query_args[ $settings[ $post_type . '_filter_type' ] ] = $settings[ $posts_control_key ];
		}

		// Taxonomy Filter
		$taxonomy = PP_Posts_Helper::get_post_taxonomies( $post_type );

		if ( ! empty( $taxonomy ) && ! is_wp_error( $taxonomy ) ) {

			foreach ( $taxonomy as $index => $tax ) {

				if ( 'post' === $post_type ) {
					if ( 'post_tag' === $index ) {
						$tax_control_key = 'tags';
					} elseif ( 'category' === $index ) {
						$tax_control_key = 'categories';
					} else {
						$tax_control_key = $index . '_' . $post_type;
					}
				} else {
					$tax_control_key = $index . '_' . $post_type;
				}

				if ( ! empty( $settings[ $tax_control_key ] ) ) {

					$operator = $settings[ $index . '_' . $post_type . '_filter_type' ];

					$query_args['tax_query'][] = [
						'taxonomy' => $index,
						'field'    => 'term_id',
						'terms'    => $settings[ $tax_control_key ],
						'operator' => $operator,
					];
				}
			}
		}

		if ( 'anytime' !== $settings['select_date'] ) {
			$select_date = $settings['select_date'];
			if ( ! empty( $select_date ) ) {
				$date_query = [];
				switch ( $select_date ) {
					case 'today':
						$date_query['after'] = '-1 day';
						break;

					case 'week':
						$date_query['after'] = '-1 week';
						break;

					case 'month':
						$date_query['after'] = '-1 month';
						break;

					case 'quarter':
						$date_query['after'] = '-3 month';
						break;

					case 'year':
						$date_query['after'] = '-1 year';
						break;

					case 'exact':
						$after_date = $settings['date_after'];
						if ( ! empty( $after_date ) ) {
							$date_query['after'] = $after_date;
						}
						$before_date = $settings['date_before'];
						if ( ! empty( $before_date ) ) {
							$date_query['before'] = $before_date;
						}
						$date_query['inclusive'] = true;
						break;
				}

				$query_args['date_query'] = $date_query;
			}
		}

		// Sticky Posts Filter
		if ( 'yes' === $settings['sticky_posts'] && 'yes' === $settings['all_sticky_posts'] ) {
			$post__in = get_option( 'sticky_posts' );

			$query_args['post__in'] = $post__in;
		}

		return $query_args;
	}

	/**
	 * Get custom post excerpt.
	 *
	 * @access protected
	 */
	protected function get_custom_post_excerpt( $limit ) {
		$pp_excerpt = explode( ' ', get_the_excerpt(), $limit );

		if ( count( $pp_excerpt ) >= $limit ) {
			array_pop( $pp_excerpt );
			$pp_excerpt = implode( ' ', $pp_excerpt ) . '...';
		} else {
			$pp_excerpt = implode( ' ', $pp_excerpt );
		}

		$pp_excerpt = preg_replace( '`[[^]]*]`', '', $pp_excerpt );

		return $pp_excerpt;
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( [
			'showcase-wrap' => [
				'class' => [
					'pp-showcase-wrap',
					'pp-showcase-preview-align-' . $settings['preview_position'],
				],
			],
			'preview-wrap' => [
				'class' => [
					'pp-showcase-preview-wrap',
				],
			],
			'preview' => [
				'class' => [
					'pp-showcase-preview',
					'pp-slick-slider',
				],
				'id' => [
					'pp-showcase-preview-' . esc_attr( $this->get_id() ),
				],
			],
		] );

		if ( 'active' === $settings['navigation_description_visibility'] ) {
			$this->add_render_attribute( 'showcase-wrap', 'class', 'pp-showcase-description-visible-active' );
		}

		if ( is_rtl() ) {
			$this->add_render_attribute( 'preview', 'data-rtl', 'yes' );
		}
		?>
		<div <?php $this->print_render_attribute_string( 'showcase-wrap' ); ?>>
			<div class="pp-showcase">
				<div <?php $this->print_render_attribute_string( 'preview-wrap' ); ?>>
					<?php $this->render_arrows(); ?>

					<div <?php $this->print_render_attribute_string( 'preview' ); ?>>
						<?php
							$this->render_preview();
						?>
					</div>
				</div>
				<?php
					// Items Navigation
					$this->render_navigation();
				?>
			</div>
		</div>
		<?php
	}

	protected function render_preview() {
		$settings = $this->get_settings_for_display();

		if ( 'posts' === $settings['source'] ) {
			$this->render_preview_posts();
		} else {
			$this->render_preview_custom();
		}
	}

	protected function render_preview_custom() {
		$settings = $this->get_settings_for_display();

		foreach ( $settings['items'] as $index => $item ) {
			?>
			<div class="pp-showcase-preview-item">
				<?php
				if ( 'image' === $item['content_type'] && $item['image']['url'] ) {

					$image_id  = apply_filters( 'wpml_object_id', $item['image']['id'], 'attachment', true );
					$image_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image', $settings );

					if ( ! $image_url ) {
						$image_url = $item['image']['url'];
					}

					$image_html = '<div class="pp-showcase-preview-image">';

					$image_html .= '<img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( Control_Media::get_image_alt( $item['image'] ) ) . '">';

					$image_html .= '</div>';

					$image_html .= $this->render_image_overlay();

					if ( $settings['preview_caption'] || 'yes' === $settings['preview_title'] || 'yes' === $settings['preview_description'] ) {
						$image_html .= '<div class="pp-showcase-preview-content pp-media-content">';
						$image_html .= '<div class="pp-showcase-preview-info">';
						if ( $settings['preview_caption'] ) {
							$image_html .= $this->render_image_caption( $image_id, $settings['preview_caption'] );
						}

						if ( 'yes' === $settings['preview_title'] && $item['title'] ) {
							$image_html .= '<div class="pp-showcase-preview-title">';
								$image_html .= $item['title'];
							$image_html .= '</div>';
						}

						if ( 'yes' === $settings['preview_description'] && $item['description'] ) {
							$image_html .= '<div class="pp-showcase-preview-description">';
								$image_html .= $item['description'];
							$image_html .= '</div>';
						}
						$image_html .= '</div>';
						$image_html .= '</div>';
					}

					if ( 'none' !== $item['link_to'] ) {

						$link_key = $this->get_repeater_setting_key( 'link', 'items', $index );

						if ( 'file' === $item['link_to'] ) {

							$lightbox_library = $settings['lightbox_library'];
							$lightbox_caption = $settings['lightbox_caption'];

							$link = wp_get_attachment_url( $image_id );

							if ( 'fancybox' === $lightbox_library ) {
								$this->add_render_attribute( $link_key, [
									'data-elementor-open-lightbox' => 'no',
									'data-fancybox'                => 'pp-showcase-preview-' . $this->get_id(),
								] );

								if ( $lightbox_caption ) {
									$caption = Module::get_image_caption( $image_id, $settings['lightbox_caption'] );

									$this->add_render_attribute( $link_key, [
										'data-caption' => $caption,
									] );
								}

								$this->add_render_attribute( $link_key, [
									'data-src' => $link,
								] );
							} else {
								$this->add_render_attribute( $link_key, [
									'data-elementor-open-lightbox'      => $item['open_lightbox'],
									'data-elementor-lightbox-slideshow' => $this->get_id(),
									'data-elementor-lightbox-index'     => $index,
								] );

								$this->add_render_attribute( $link_key, [
									'href'  => $link,
									'class' => 'elementor-clickable',
								] );
							}
						} elseif ( 'custom' === $item['link_to'] && $item['link']['url'] ) {
							$link = $item['link']['url'];

							$this->add_link_attributes( $link_key, $item['link'] );
						}

						$this->add_render_attribute( $link_key, [
							'class' => 'pp-showcase-item-link',
						] );

						$image_html = '<a ' . $this->get_render_attribute_string( $link_key ) . '>' . $image_html . '</a>';
					}

					echo wp_kses_post( $image_html );

				} elseif ( 'video' === $item['content_type'] ) {

					$embed_params  = $this->get_embed_params( $item );
					$embed_options = $this->get_embed_options( $item );

					if ( 'hosted' === $item['video_source'] ) {
						$video_url = $this->get_hosted_video_url( $item );
					} else {
						if ( preg_match( '/youtube\.com\/shorts\/(\w+\s*\/?)*([0-9]+)*(.*)$/i', $item['video_url'], $matches ) ) {
							$video_id = $matches[1];
							$video_url = $this->get_yt_short_embed_url( $video_id, $embed_params, $embed_options );
						} else {
							$video_url = Embed::get_embed_url( $item['video_url'], $embed_params, $embed_options );
						}
					}

					$thumb_size   = $item['thumbnail_size'];

					$video_setting_key = $this->get_repeater_setting_key( 'video', 'showcase_items', $index );

					$this->add_render_attribute(
						$video_setting_key,
						array(
							'class' => [ 'pp-video', 'pp-video-type-' . $item['video_source'] ],
						),
					);

					if ( 'hosted' === $item['video_source'] ) {
						$video_url = $this->get_hosted_video_url( $item );
			
						ob_start();
			
						$this->render_hosted_video( $item );
						$video_html = ob_get_clean();
						$video_html = wp_json_encode( $video_html );
						$video_html = htmlspecialchars( $video_html, ENT_QUOTES );
			
						$this->add_render_attribute(
							$video_setting_key,
							array(
								'data-hosted-html' => $video_html,
							)
						);
					}
					?>
					<div <?php $this->print_render_attribute_string( $video_setting_key ); ?>>
						<div class="pp-video-container elementor-fit-aspect-ratio">
							<div class="pp-video-play">
								<div class="pp-video-player" data-src="<?php echo esc_url( $video_url ); ?>">
									<?php $video_thumb = $this->get_video_thumbnail( $item, $thumb_size ); ?>
									<div class="pp-video-thumb-wrap">
										<?php if ( 'hosted' === $item['video_source'] ) { ?>
											<?php $video_url = $this->get_hosted_video_url( $item ); ?>
											<?php if ( $video_thumb ) { ?>
												<img class="pp-video-thumb" src="<?php echo esc_url( $this->get_video_thumbnail( $item, $thumb_size ) ); ?>" alt="<?php echo esc_attr( $item['filter_label'] ); ?>">
											<?php } else { ?>
												<video class="pp-hosted-video" src="<?php echo esc_url( $video_url ); ?>" preload="<?php //echo esc_attr( $settings['preload'] ); ?>"></video>
											<?php } ?>
										<?php } else { ?>
											<?php if ( $video_thumb ) { ?>
												<img class="pp-video-thumb" src="<?php echo esc_url( $this->get_video_thumbnail( $item, $thumb_size ) ); ?>">
											<?php } ?>
										<?php } ?>
										<?php $this->render_play_icon(); ?>
									</div>
								</div>
							</div>
						</div>
					</div>
					<?php

				} elseif ( 'section' === $item['content_type'] && ! empty( $item['saved_section'] ) ) {

					if ( 'publish' === get_post_status( $item['saved_section'] ) ) {
						echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $item['saved_section'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

				} elseif ( 'template' === $item['content_type'] && ! empty( $item['templates'] ) ) {

					if ( 'publish' === get_post_status( $item['templates'] ) ) {
						echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $item['templates'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

				} elseif ( 'widget' === $item['content_type'] && ! empty( $item['saved_widget'] ) ) {

					if ( 'publish' === get_post_status( $item['saved_widget'] ) ) {
						echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $item['saved_widget'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

				}
				?>
			</div>
			<?php
		}
	}

	/**
	 * Render youtube short embed URL.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	private function get_yt_short_embed_url( $video_id, $embed_params ) {
		$yt_url = 'https://www.youtube.com/embed/' . $video_id;
		return add_query_arg( $embed_params, $yt_url );
	}

	/**
	 * Render posts output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_preview_posts() {
		$settings = $this->get_settings();

		$i = 0;

		// Query Arguments
		$query_args = $this->get_posts_query_arguments();
		$posts_query = new \WP_Query( $query_args );

		if ( $posts_query->have_posts() ) :
			while ( $posts_query->have_posts() ) :
				$posts_query->the_post();
				$post_type_name = $settings['post_type'];

				if ( has_post_thumbnail() || 'attachment' === $post_type_name ) {
					?>
					<div class="pp-showcase-preview-item">
						<?php
						if ( 'attachment' === $post_type_name ) {
							$image_id = get_the_ID();
						} else {
							$image_id = get_post_thumbnail_id( get_the_ID() );
						}
						$image_url = Group_Control_Image_Size::get_attachment_image_src( $image_id, 'image', $settings );

						$image_html = '<div class="pp-showcase-preview-image">';
						$image_html .= '<img src="' . esc_url( $image_url ) . '" alt="' . get_the_title() . '">';
						$image_html .= '</div>';

						$image_html .= $this->render_image_overlay();

						if ( 'yes' === $settings['preview_title'] || 'yes' === $settings['preview_description'] ) {
							$image_html .= '<div class="pp-showcase-preview-content">';
							$image_html .= '<div class="pp-showcase-preview-info">';
							if ( 'yes' === $settings['preview_title'] ) {
								$image_html .= '<div class="pp-showcase-preview-title">';
									$image_html .= get_the_title();
								$image_html .= '</div>';
							}

							if ( 'yes' === $settings['preview_description'] ) {
								$image_html .= '<div class="pp-showcase-preview-description">';
									$limit = $settings['preview_excerpt_length'];
									$image_html .= $this->get_custom_post_excerpt( $limit );
								$image_html .= '</div>';
							}

							$image_html .= '</div>';
							$image_html .= '</div>';
						}

						if ( 'none' !== $settings['posts_link_to'] ) {

							$link_key = 'post-link-' . $i;

							if ( 'file' === $settings['posts_link_to'] ) {

								$lightbox_library = $settings['lightbox_library'];
								$lightbox_caption = $settings['lightbox_caption'];

								$link = wp_get_attachment_url( $image_id );

								if ( 'fancybox' === $lightbox_library ) {
									$this->add_render_attribute( $link_key, [
										'data-elementor-open-lightbox' => 'no',
										'data-fancybox'                => 'pp-showcase-preview-' . $this->get_id(),
									] );

									if ( $lightbox_caption ) {
										$caption = Module::get_image_caption( $image_id, $settings['lightbox_caption'] );

										$this->add_render_attribute( $link_key, [
											'data-caption' => $caption,
										] );
									}

									$this->add_render_attribute( $link_key, [
										'data-src' => $link,
									] );
								} else {
									$this->add_render_attribute( $link_key, [
										'data-elementor-open-lightbox'      => $settings['posts_open_lightbox'],
										'data-elementor-lightbox-slideshow' => $this->get_id(),
										'data-elementor-lightbox-index'     => $i,
									] );

									$this->add_render_attribute( $link_key, [
										'href'  => $link,
										'class' => 'elementor-clickable',
									] );
								}
							} elseif ( 'custom' === $settings['posts_link_to'] && $settings['posts_link']['url'] ) {
								$link = $settings['posts_link']['url'];

								$this->add_link_attributes( $link_key, $settings['posts_link'] );
							} elseif ( 'post_url' === $settings['posts_link_to'] ) {
								$link = get_permalink();

								$this->add_render_attribute( $link_key, [
									'href' => $link,
								] );

								if ( 'yes' === $settings['posts_link_external'] ) {
									$this->add_render_attribute( $link_key, 'target', '_blank' );
								}

								if ( 'yes' === $settings['posts_link_nofollow'] ) {
									$this->add_render_attribute( $link_key, 'rel', 'nofollow' );
								}
							}

							$this->add_render_attribute( $link_key, [
								'class' => 'pp-showcase-item-link',
							] );

							$image_html = '<a ' . $this->get_render_attribute_string( $link_key ) . '>' . $image_html . '</a>';
						}

						echo wp_kses_post( $image_html );
						?>
					</div>
					<?php
				}
				$i++;
		endwhile;
		endif;
		wp_reset_postdata();
	}

	protected function render_navigation() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'navigation', 'class', 'pp-showcase-navigation-items' );

		if ( ! $settings['scrollable_nav'] ) {
			$this->add_render_attribute( 'navigation', 'class', 'elementor-grid' );
		}
		?>
		<div class="pp-showcase-navigation">
			<div <?php $this->print_render_attribute_string( 'navigation' ); ?>>
				<?php
				if ( 'posts' === $settings['source'] ) {
					$this->render_navigation_posts();
				} else {
					$this->render_navigation_custom();
				}
				?>
			</div>
		</div>
		<?php
	}

	protected function render_navigation_icon( $item ) {
		if ( 'none' !== $item['nav_icon_type'] ) { ?>
			<div class="pp-showcase-navigation-icon-wrap">
				<?php
				if ( 'icon' === $item['nav_icon_type'] ) {

					if ( ! isset( $item['nav_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
						// add old default
						$item['nav_icon'] = 'eicon-image-bold';
					}

					$has_nav_icon = ! empty( $item['nav_icon'] );

					if ( $has_nav_icon ) {
						$this->add_render_attribute( 'i', 'class', $item['nav_icon'] );
						$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
					}

					$icon_attributes = $this->get_render_attribute_string( 'nav_icon' );

					if ( ! $has_nav_icon && ! empty( $item['select_nav_icon']['value'] ) ) {
						$has_nav_icon = true;
					}
					$migrated_nav_icon = isset( $item['__fa4_migrated']['select_nav_icon'] );
					$is_new_nav_icon = ! isset( $item['nav_icon'] ) && Icons_Manager::is_migration_allowed();
					?>
					<span class="pp-showcase-navigation-icon pp-icon">
					<?php
					if ( $is_new_nav_icon || $migrated_nav_icon ) {
						Icons_Manager::render_icon( $item['select_nav_icon'], [ 'aria-hidden' => 'true' ] );
					} elseif ( ! empty( $item['icon'] ) ) {
						?><i <?php $this->print_render_attribute_string( 'i' ); ?>></i><?php
					}
					?>
					</span>
					<?php
				} elseif ( 'image' === $item['nav_icon_type'] ) {
					printf( '<span class="pp-showcase-navigation-icon"><img src="%1$s" alt="%2$s"></span>', esc_url( $item['nav_icon_image']['url'] ), esc_attr( Control_Media::get_image_alt( $item['nav_icon_image'] ) ) );
				}
				?>
			</div>
		<?php }
	}

	protected function render_navigation_custom() {
		$settings = $this->get_settings_for_display();

		$i = 1;
		$item_wrap_key = 'navigation-item-wrap-' . $i;
		$item_key = 'navigation-item-' . $i;
		$this->add_render_attribute( $item_wrap_key, 'class', 'pp-showcase-navigation-item-wrap' );
		$this->add_render_attribute( $item_key, 'class', 'pp-showcase-navigation-item' );

		if ( ! $settings['scrollable_nav'] ) {
			$this->add_render_attribute( $item_wrap_key, 'class', 'pp-grid-item-wrap elementor-grid-item' );
			$this->add_render_attribute( $item_key, 'class', 'pp-grid-item' );
		}

		foreach ( $settings['items'] as $item ) {
			?>
			<div <?php $this->print_render_attribute_string( $item_wrap_key ); ?>>
				<div <?php $this->print_render_attribute_string( $item_key ); ?>>
					<?php
					if ( 'above' === $settings['navigation_icon_position'] ) {
						$this->render_navigation_icon( $item );

						if ( 'yes' === $settings['navigation_title'] && $item['title'] ) { ?>
							<h4 class="pp-showcase-navigation-title">
								<?php echo wp_kses_post( $item['title'] ); ?>
							</h4>
							<?php
						}
					}

					if ( 'left' === $settings['navigation_icon_position'] ) { ?>
						<div class="pp-showcase-navigation-icon-left">
							<?php
							$this->render_navigation_icon( $item );

							if ( 'yes' === $settings['navigation_title'] && $item['title'] ) { ?>
								<h4 class="pp-showcase-navigation-title">
									<?php echo wp_kses_post( $item['title'] ); ?>
								</h4>
								<?php
							}
							?>
						</div>
					<?php } ?>

					<?php if ( 'yes' === $settings['navigation_description'] && $item['description'] ) { ?>
						<div class="pp-showcase-navigation-description">
							<?php echo wp_kses_post( $this->parse_text_editor( $item['description'] ) ); ?>
						</div>
					<?php } ?>
				</div>
			</div>
			<?php
			$i++;
		}
	}

	/**
	 * Render navigation posts output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_navigation_posts() {
		$settings = $this->get_settings();

		$i = 1;

		$item_wrap_key = 'navigation-item-wrap-' . $i;
		$item_key = 'navigation-item-' . $i;
		$this->add_render_attribute( $item_wrap_key, 'class', 'pp-showcase-navigation-item-wrap' );
		$this->add_render_attribute( $item_key, 'class', 'pp-showcase-navigation-item' );

		if ( ! $settings['scrollable_nav'] ) {
			$this->add_render_attribute( $item_wrap_key, 'class', 'pp-grid-item-wrap' );
			$this->add_render_attribute( $item_key, 'class', 'pp-grid-item' );
		}

		// Query Arguments
		$query_args = $this->get_posts_query_arguments();
		$posts_query = new \WP_Query( $query_args );

		if ( $posts_query->have_posts() ) :
			while ( $posts_query->have_posts() ) :
				$posts_query->the_post();
				$post_type_name = $settings['post_type'];

				if ( has_post_thumbnail() || 'attachment' === $post_type_name ) {
					?>
					<div <?php $this->print_render_attribute_string( $item_wrap_key ); ?>>
						<div <?php $this->print_render_attribute_string( $item_key ); ?>>
							<?php if ( 'yes' === $settings['navigation_title'] ) { ?>
								<h4 class="pp-showcase-navigation-title">
									<?php the_title(); ?>
								</h4>
							<?php } ?>

							<?php if ( 'yes' === $settings['navigation_description'] ) { ?>
								<div class="pp-showcase-navigation-description">
									<?php
										$limit = $settings['navigation_excerpt_length'];
										echo wp_kses_post( $this->get_custom_post_excerpt( $limit ) );
									?>
								</div>
							<?php } ?>
						</div>
					</div>
					<?php
				}
				$i++;
		endwhile;
		endif;
		wp_reset_postdata();
	}

	/**
	 * Render image overlay output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_image_overlay() {
		return '<div class="pp-showcase-preview-overlay pp-media-overlay"></div>';
	}

	/**
	 * Render play icon output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_play_icon() {
		$settings = $this->get_settings_for_display();

		if ( 'none' === $settings['play_icon_type'] ) {
			return;
		}

		$this->add_render_attribute( 'play-icon', 'class', 'pp-video-play-icon' );

		if ( 'icon' === $settings['play_icon_type'] ) {
			if ( ! isset( $settings['play_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
				// add old default
				$settings['play_icon'] = 'fa fa-play-circle';
			}

			$has_icon = ! empty( $settings['play_icon'] );

			if ( $has_icon ) {
				$this->add_render_attribute( 'play-icon', 'class', $settings['play_icon'] );
				$this->add_render_attribute( 'play-icon', 'aria-hidden', 'true' );
			}

			$icon_attributes = $this->get_render_attribute_string( 'play_icon' );

			if ( ! $has_icon && ! empty( $settings['select_play_icon']['value'] ) ) {
				$has_icon = true;
			}
			$migrated = isset( $settings['__fa4_migrated']['select_play_icon'] );
			$is_new = ! isset( $settings['play_icon'] ) && Icons_Manager::is_migration_allowed();
			?>
			<span <?php $this->print_render_attribute_string( 'play-icon' ); ?>>
				<?php
				if ( $is_new || $migrated ) {
					Icons_Manager::render_icon( $settings['select_play_icon'], [ 'aria-hidden' => 'true' ] );
				} elseif ( ! empty( $settings['play_icon'] ) ) {
					?><i <?php $this->print_render_attribute_string( 'play-icon-i' ); ?>></i><?php
				}
				?>
			</span>
			<?php

		} elseif ( 'image' === $settings['play_icon_type'] ) {
			if ( $settings['play_icon_image']['url'] ) {
				?>
				<span <?php $this->print_render_attribute_string( 'play-icon' ); ?>>
					<img src="<?php echo esc_url( $settings['play_icon_image']['url'] ); ?>">
				</span>
				<?php
			}
		}
	}

	protected function render_image_caption( $id, $caption_type = 'caption' ) {
		$settings = $this->get_settings_for_display();

		$caption = Module::get_image_caption( $id, $caption_type );

		if ( ! $caption ) {
			return '';
		}

		ob_start();
		?>
		<div class="pp-showcase-preview-caption">
			<?php echo wp_kses_post( $caption ); ?>
		</div>
		<?php
		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	/**
	 * @param bool $from_media
	 *
	 * @return string
	 * @since 2.9.19
	 * @access private
	 */
	protected function get_hosted_video_url( $item ) {
		if ( ! empty( $item['insert_url'] ) ) {
			$video_url = $item['external_url']['url'];
		} else {
			$video_url = $item['hosted_url']['url'];
		}

		if ( empty( $video_url ) ) {
			return '';
		}

		if ( $item['start'] || $item['end'] ) {
			$video_url .= '#t=';
		}

		if ( $item['start'] ) {
			$video_url .= (int) $item['start'];
		}

		if ( $item['end'] ) {
			$video_url .= ',' . (int) $item['end'];
		}

		return $video_url;
	}

	/**
	 * @since 2.9.19
	 * @access private
	 */
	protected function get_hosted_params() {
		$settings = $this->get_settings_for_display();

		$video_params = [];

		foreach ( [ 'loop', 'controls' ] as $option_name ) {
			if ( $settings[ $option_name ] ) {
				$video_params[ $option_name ] = '';
			}
		}

		$video_params['controlsList'] = 'nodownload';

		if ( $settings['mute'] ) {
			$video_params['muted'] = 'muted';
		}

		return $video_params;
	}

	/**
	 * Render hosted video.
	 *
	 * @since 2.9.19
	 * @access protected
	 */
	private function render_hosted_video( $item ) {
		$video_url = $this->get_hosted_video_url( $item );
		if ( empty( $video_url ) ) {
			return;
		}

		$video_params = $this->get_hosted_params();
		?>
		<video class="pp-hosted-video" src="<?php echo esc_url( $video_url ); ?>" <?php echo esc_attr( Utils::render_html_attributes( $video_params ) ); ?>></video>
		<?php
	}

	/**
	 * Returns Video Thumbnail.
	 *
	 * @access protected
	 */
	protected function get_video_thumbnail( $item, $thumb_size ) {
		$thumb_url  = '';
		$video_id   = $this->get_video_id( $item );

		if ( 'youtube' === $item['video_source'] ) {

			if ( $video_id ) {
				$thumb_url = 'https://i.ytimg.com/vi/' . $video_id . '/' . $thumb_size . '.jpg';
			}
		} elseif ( 'vimeo' === $item['video_source'] ) {

			if ( $video_id ) {
				$response = wp_remote_get( "https://vimeo.com/api/v2/video/$video_id.php" );

				if ( is_wp_error( $response ) ) {
					return;
				}
				$vimeo = maybe_unserialize( $response['body'] );
				$thumb_url = $vimeo[0]['thumbnail_large'];
			}
		} elseif ( 'dailymotion' === $item['video_source'] ) {

			if ( $video_id ) {
				$response = wp_remote_get( 'https://api.dailymotion.com/video/' . $video_id . '?fields=thumbnail_url' );

				if ( is_wp_error( $response ) ) {
					return;
				}
				$dailymotion = maybe_unserialize( $response['body'] );
				$get_thumbnail = json_decode( $dailymotion, true );
				$thumb_url = $get_thumbnail['thumbnail_url'];
			}
		}

		return $thumb_url;

	}

	/**
	 * Returns Video ID.
	 *
	 * @access protected
	 */
	protected function get_video_id( $item ) {
		$video_id = '';
		$url      = $item['video_url'];

		if ( 'youtube' === $item['video_source'] ) {

			if ( preg_match( '#(?<=v=|v\/|vi=|vi\/|youtu.be\/)[a-zA-Z0-9_-]{11}#', $url, $matches ) ) {
				$video_id = $matches[0];
			} else {
				if ( preg_match( '/youtube\.com\/shorts\/(\w+\s*\/?)*([0-9]+)*(.*)$/i', $url, $matches ) ) {
					$video_id = $matches[1];
				}
			}
		} elseif ( 'vimeo' === $item['video_source'] ) {

			$video_id = preg_replace( '/[^\/]+[^0-9]|(\/)/', '', rtrim( $url, '/' ) );

		} elseif ( 'dailymotion' === $item['video_source'] ) {

			if ( preg_match( '/^.+dailymotion.com\/(?:video|swf\/video|embed\/video|hub|swf)\/([^&?]+)/', $url, $matches ) ) {
				$video_id = $matches[1];
			}
		}

		return $video_id;
	}

	/**
	 * Get embed params.
	 *
	 * Retrieve video widget embed parameters.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @return array Video embed parameters.
	 */
	public function get_embed_params( $item ) {
		$settings = $this->get_settings_for_display();

		$params = [];
		$params_dictionary = [];

		if ( 'youtube' === $item['video_source'] ) {
			$params_dictionary = [
				'mute',
			];

			if ( 'yes' === $item['cc_load_policy'] ) {
				$params['cc_load_policy'] = 1;
			}

			$params['autoplay'] = 1;

			$params['wmode'] = 'opaque';

			$params['start'] = (int) $item['start'];

			$params['end'] = (int) $item['end'];
		} elseif ( 'vimeo' === $item['video_source'] ) {
			$params_dictionary = [
				'mute' => 'muted',
			];

			$params['autopause'] = '0';
			$params['autoplay'] = '1';
		} elseif ( 'dailymotion' === $item['video_source'] ) {
			$params_dictionary = [
				'mute',
			];

			$params['start'] = (int) $settings['start'];

			$params['endscreen-enable'] = '0';
			$params['autoplay'] = 1;

		}

		foreach ( $params_dictionary as $key => $param_name ) {
			$setting_name = $param_name;

			if ( is_string( $key ) ) {
				$setting_name = $key;
			}

			$setting_value = $settings[ $setting_name ] ? '1' : '0';

			$params[ $param_name ] = $setting_value;
		}

		return $params;
	}

	/**
	 * Get embed options.
	 *
	 * @access private
	 *
	 * @return array Video embed options.
	 */
	private function get_embed_options( $item ) {
		$settings = $this->get_settings_for_display();

		$embed_options = array();

		if ( 'vimeo' === $item['video_source'] ) {
			$embed_options['start'] = (int) $item['start'];
		}

		// $embed_options['lazy_load'] = ! empty( $settings['lazy_load'] );

		return $embed_options;
	}
}
