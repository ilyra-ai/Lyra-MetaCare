<?php
namespace PowerpackElements\Modules\Categories\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Posts_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Icons_Manager;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Categories Widget
 */
class Categories extends Powerpack_Widget {

	public $slides_count = 3;
	public $categories_count = 0;

	/**
	 * Retrieve Categories Widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Categories' );
	}

	/**
	 * Retrieve Categories Widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Categories' );
	}

	/**
	 * Retrieve Categories Widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Categories' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Categories widget belongs to.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Categories' );
	}

	protected function is_dynamic_content(): bool {
		return true;
	}

	/**
	 * Retrieve the list of scripts the Categories Widget depended on.
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
				'pp-categories',
			);
		}

		$settings = $this->get_settings_for_display();
		$scripts = [];

		if ( 'carousel' === $settings['layout'] ) {
			array_push( $scripts, 'swiper', 'pp-categories' );
		} else {
			if ( 'list' !== $settings['skin'] ) {
				array_push( $scripts, 'pp-categories' );
			}
		}

		return $scripts;
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
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return array(
				'e-swiper',
				'pp-swiper',
				'widget-pp-categories'
			);
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'widget-pp-categories' ];

		if ( 'carousel' === $settings['layout'] ) {
			array_push( $styles, 'e-swiper', 'pp-swiper' );
		}

		return $styles;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Categories Widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_content_controls();
		$this->register_content_layout_controls();
		$this->register_content_carousel_settings_controls();
		$this->register_content_pagination_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_layout_controls();
		$this->register_style_box_controls();
		$this->register_style_list_controls();
		$this->register_style_cat_content_controls();
		$this->register_style_cat_description_controls();
		$this->register_style_overlay_controls();
		$this->register_style_arrows_controls();
		$this->register_style_dots_controls();
		$this->register_style_fraction_controls();
		$this->register_style_pagination_controls();
	}

	/*-----------------------------------------------------------------------------------*/
	/* Content Tab
	/*-----------------------------------------------------------------------------------*/

	/**
	 * Content Tab: Content
	 */
	protected function register_content_content_controls() {
		$this->start_controls_section(
			'section_content',
			array(
				'label' => esc_html__( 'Content', 'powerpack' ),
			)
		);

		$post_types    = array();
		$taxonomy_type = array();

		foreach ( PP_Posts_Helper::get_post_types() as $slug => $type ) {
			$taxonomies = PP_Posts_Helper::get_post_taxonomies( $slug );

			if ( ! empty( $taxonomies ) ) {
				$post_types[ $slug ] = $type;

				foreach ( $taxonomies as $tax_slug => $tax ) {
					$taxonomy_type[ $slug ][ $tax_slug ] = $tax->label;
				}
			}
		}

		$this->add_control(
			'post_type',
			array(
				'label'   => esc_html__( 'Post Type', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => $post_types,
				'default' => 'post',
			)
		);

		foreach ( $post_types as $post_type_slug => $post_type_label ) {
			$taxonomy = PP_Posts_Helper::get_post_taxonomies( $post_type_slug );

			if ( ! empty( $taxonomy ) ) {

				$taxonomy_keys        = array_keys( $taxonomy_type[ $post_type_slug ] );
				$taxonomy_default_val = $taxonomy_keys[0];

				// Taxonomy filter type
				$this->add_control(
					$post_type_slug . '_tax_type',
					array(
						/* translators: %s Label */
						'label'       => esc_html__( 'Taxonomy', 'powerpack' ),
						'type'        => Controls_Manager::SELECT,
						'default'     => $taxonomy_default_val,
						'label_block' => true,
						'options'     => $taxonomy_type[ $post_type_slug ],
						'condition'   => array(
							'post_type' => $post_type_slug,
						),
					)
				);

				foreach ( $taxonomy as $taxonomy_name => $tax ) {
					$terms = get_terms( $taxonomy_name );

					if ( ! empty( $terms ) ) {
						$this->add_control(
							'tax_' . $post_type_slug . '_' . $taxonomy_name . '_filter_rule',
							array(
								'label'       => sprintf( esc_html__( '%s Filter Rule', 'powerpack' ), $tax->label ),
								'type'        => Controls_Manager::SELECT,
								'label_block' => true,
								'default'     => 'all',
								'options'     => array(
									'all'     => esc_html__( 'Show All', 'powerpack' ),
									'top'     => esc_html__( 'Only Top Level', 'powerpack' ),
									'include' => sprintf( esc_html__( 'Match These %s', 'powerpack' ), $tax->label ),
									'exclude' => sprintf( esc_html__( 'Exclude These %s', 'powerpack' ), $tax->label ),
									'child'   => sprintf( esc_html__( 'Child Categories', 'powerpack' ), $tax->label ),
								),
								'condition'   => array(
									'post_type' => $post_type_slug,
									$post_type_slug . '_tax_type' => $taxonomy_name,
								),
							)
						);

						// Add control for all taxonomies.
						$this->add_control(
							'tax_' . $post_type_slug . '_' . $taxonomy_name . '_parent',
							array(
								'label'       => esc_html__( 'Parent Type', 'powerpack' ),
								'type'        => Controls_Manager::SELECT,
								'multiple'    => false,
								'default'     => 'current_cat',
								'label_block' => true,
								'options'     => array(
									'current_cat' => esc_html__( 'Current Category', 'powerpack' ),
									'sel_parent'  => esc_html__( 'Choose Parent', 'powerpack' ),
								),
								'condition'   => array(
									'post_type' => $post_type_slug,
									$post_type_slug . '_tax_type' => $taxonomy_name,
									'tax_' . $post_type_slug . '_' . $taxonomy_name . '_filter_rule' => 'child',
								),
							)
						);

						$this->add_control(
							'tax_' . $post_type_slug . '_' . $taxonomy_name . '_child_notice',
							array(
								'raw'             => esc_html__( 'Current category option works best on Category Archive pages.', 'powerpack' ),
								'type'            => Controls_Manager::RAW_HTML,
								'content_classes' => 'pp-editor-info',
								'condition'       => array(
									'post_type' => $post_type_slug,
									$post_type_slug . '_tax_type' => $taxonomy_name,
									'tax_' . $post_type_slug . '_' . $taxonomy_name . '_filter_rule' => 'child',
									'tax_' . $post_type_slug . '_' . $taxonomy_name . '_parent' => 'current_cat',
								),
							)
						);

						// Add control for all taxonomies.
						$this->add_control(
							'tax_' . $post_type_slug . '_' . $taxonomy_name . '_parent_term',
							array(
								'label'         => esc_html__( 'Parent Category', 'powerpack' ),
								'type'          => 'pp-query',
								'post_type'     => '',
								'options'       => [],
								'label_block'   => true,
								'multiple'      => false,
								'query_type'    => 'terms',
								'object_type'   => $taxonomy_name,
								'include_type'  => true,
								'condition'   => array(
									'post_type' => $post_type_slug,
									$post_type_slug . '_tax_type' => $taxonomy_name,
									'tax_' . $post_type_slug . '_' . $taxonomy_name . '_filter_rule' => 'child',
									'tax_' . $post_type_slug . '_' . $taxonomy_name . '_parent' => 'sel_parent',
								),
							)
						);

						// Add control for all taxonomies.
						$this->add_control(
							'tax_' . $post_type_slug . '_' . $taxonomy_name,
							array(
								'label'         => $tax->label,
								'type'          => 'pp-query',
								'post_type'     => '',
								'options'       => [],
								'label_block'   => true,
								'multiple'      => true,
								'query_type'    => 'terms',
								'object_type'   => $taxonomy_name,
								'include_type'  => true,
								'condition'     => array(
									'post_type' => $post_type_slug,
									$post_type_slug . '_tax_type' => $taxonomy_name,
									'tax_' . $post_type_slug . '_' . $taxonomy_name . '_filter_rule' => array( 'include', 'exclude', 'related' ),
								),
							)
						);

					}
				}
			}
		}

		$this->add_control(
			'display_empty_cat',
			array(
				'label'        => esc_html__( 'Display Empty Categories', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => 'Yes',
				'label_off'    => 'No',
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'orderby',
			[
				'label'             => esc_html__( 'Order By', 'powerpack' ),
				'type'              => Controls_Manager::SELECT,
				'options'           => [
					'name'        => esc_html__( 'Name', 'powerpack' ),
					'slug'        => esc_html__( 'Slug', 'powerpack' ),
					'id'          => esc_html__( 'ID', 'powerpack' ),
					'count'       => esc_html__( 'Taxonomy Count', 'powerpack' ),
					'description' => esc_html__( 'Description', 'powerpack' ),
				],
				'default'           => 'name',
			]
		);

		$this->add_control(
			'order',
			[
				'label'             => esc_html__( 'Order', 'powerpack' ),
				'type'              => Controls_Manager::SELECT,
				'options'           => [
					'DESC'       => esc_html__( 'Descending', 'powerpack' ),
					'ASC'        => esc_html__( 'Ascending', 'powerpack' ),
				],
				'default'           => 'ASC',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Layout
	 */
	protected function register_content_layout_controls() {
		$this->start_controls_section(
			'section_layout',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
			)
		);

		$this->add_control(
			'skin',
			array(
				'label'   => esc_html__( 'Skin', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => array(
					'classic' => esc_html__( 'Classic', 'powerpack' ),
					'cover'   => esc_html__( 'Cover', 'powerpack' ),
					'list'    => esc_html__( 'List', 'powerpack' ),
				),
				'default' => 'classic',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'layout',
			array(
				'label'              => esc_html__( 'Layout', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'options'            => array(
					'grid'     => esc_html__( 'Grid', 'powerpack' ),
					'carousel' => esc_html__( 'Carousel', 'powerpack' ),
				),
				'default'            => 'grid',
				'frontend_available' => true,
				'condition'          => array(
					'skin!' => 'list',
				),
			)
		);

		$this->add_responsive_control(
			'columns',
			array(
				'label'          => esc_html__( 'Columns', 'powerpack' ),
				'type'           => Controls_Manager::SELECT,
				'default'        => '3',
				'tablet_default' => '2',
				'mobile_default' => '1',
				'options'        => array(
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
				),
				'prefix_class'   => 'elementor-grid%s-',
				'condition'      => array(
					'skin!' => 'list',
				),
			)
		);

		$this->add_control(
			'categories_per_page',
			array(
				'label'     => __( 'Categories Per Page', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => '6',
				'condition' => array(
					'skin!'  => 'list',
					'layout' => 'grid',
				),
			)
		);

		$this->add_control(
			'list_style',
			array(
				'label'        => esc_html__( 'List Style', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'stacked',
				'options'      => array(
					'inline'  => esc_html__( 'Inline', 'powerpack' ),
					'stacked' => esc_html__( 'Stacked', 'powerpack' ),
				),
				'prefix_class' => 'pp-category-list-style-',
				'condition'    => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_control(
			'list_icon_type',
			array(
				'label'       => esc_html__( 'List Icon', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => false,
				'options'     => array(
					'none'  => array(
						'title' => esc_html__( 'None', 'powerpack' ),
						'icon'  => 'eicon-ban',
					),
					'icon'  => array(
						'title' => esc_html__( 'Icon', 'powerpack' ),
						'icon'  => 'eicon-star',
					),
					'image' => array(
						'title' => esc_html__( 'Image', 'powerpack' ),
						'icon'  => 'eicon-image-bold',
					),
				),
				'default'     => 'icon',
				'condition'   => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_control(
			'list_icon',
			array(
				'label'     => esc_html__( 'Icon', 'powerpack' ),
				'type'      => Controls_Manager::ICONS,
				'default'   => array(
					'value'   => 'fas fa-angle-right',
					'library' => 'fa-solid',
				),
				'condition' => array(
					'skin'           => 'list',
					'list_icon_type' => 'icon',
				),
			)
		);

		$this->add_control(
			'list_image_source',
			array(
				'label'     => esc_html__( 'Image Source', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'custom_image',
				'options'   => array(
					'category_image' => esc_html__( 'Category Images', 'powerpack' ),
					'custom_image'   => esc_html__( 'Custom Image', 'powerpack' ),
				),
				'condition' => array(
					'skin'           => 'list',
					'list_icon_type' => 'image',
				),
			)
		);

		$this->add_control(
			'list_image',
			array(
				'label'     => esc_html__( 'Image', 'powerpack' ),
				'type'      => Controls_Manager::MEDIA,
				'dynamic'   => array(
					'active' => true,
				),
				'default'   => array(
					'url' => Utils::get_placeholder_image_src(),
				),
				'condition' => array(
					'skin'              => 'list',
					'list_icon_type'    => 'image',
					'list_image_source' => 'custom_image',
				),
			)
		);

		$this->add_control(
			'equal_height',
			array(
				'label'              => esc_html__( 'Equal Height', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'label_on'           => esc_html__( 'Show', 'powerpack' ),
				'label_off'          => esc_html__( 'Hide', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'skin' => 'classic',
				),
			)
		);

		$this->add_control(
			'cat_thumbnails',
			array(
				'label'        => esc_html__( 'Category Thumbnails', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'skin' => 'classic',
				),
			)
		);

		$this->add_control(
			'cat_thumbnails_note',
			array(
				'label'           => '',
				'type'            => \Elementor\Controls_Manager::RAW_HTML,
				'raw'             => sprintf(
					/* translators: 1: Link opening tag, 2: Link closing tag. */
					esc_html__( '%1$sClick here%2$s to enable thumbnail for taxonomies.', 'powerpack' ),
					sprintf( '<a href="%s" target="_blank">', admin_url( 'admin.php?page=powerpack-settings&tab=extensions' ) ),
					'</a>'
				),
				'content_classes' => 'pp-editor-info',
				'conditions'      => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'classic',
								),
								array(
									'name'     => 'cat_thumbnails',
									'operator' => '==',
									'value'    => 'yes',
								),
							),
						),
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'list',
								),
								array(
									'name'     => 'list_icon_type',
									'operator' => '==',
									'value'    => 'image',
								),
							),
						),
						array(
							'name'     => 'skin',
							'operator' => '==',
							'value'    => 'cover',
						),
					),
				),
			)
		);

		$this->add_control(
			'image_height',
			array(
				'label'       => esc_html__( 'Image height', 'powerpack' ),
				'description' => esc_html__( 'Leave blank for auto height', 'powerpack' ),
				'type'        => \Elementor\Controls_Manager::NUMBER,
				'min'         => 50,
				'step'        => 1,
				'default'     => 300,
				'selectors'   => array(
					'{{WRAPPER}} .pp-categories .pp-category-inner img' => 'height: {{SIZE}}px;',
				),
				'condition'   => array(
					'skin'           => 'classic',
					'cat_thumbnails' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'       => 'cat_thumbnails',
				'label'      => esc_html__( 'Image Size', 'powerpack' ),
				'default'    => 'medium_large',
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'classic',
								),
								array(
									'name'     => 'cat_thumbnails',
									'operator' => '==',
									'value'    => 'yes',
								),
							),
						),
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'list',
								),
								array(
									'name'     => 'list_icon_type',
									'operator' => '==',
									'value'    => 'image',
								),
							),
						),
						array(
							'name'     => 'skin',
							'operator' => '==',
							'value'    => 'cover',
						),
					),
				),
			)
		);

		$this->add_control(
			'fallback_image',
			array(
				'label'      => esc_html__( 'Fallback Image', 'powerpack' ),
				'type'       => Controls_Manager::SELECT,
				'options'    => array(
					''            => esc_html__( 'None', 'powerpack' ),
					'placeholder' => esc_html__( 'Placeholder', 'powerpack' ),
					'custom'      => esc_html__( 'Custom', 'powerpack' ),
				),
				'default'    => 'placeholder',
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'classic',
								),
								array(
									'name'     => 'cat_thumbnails',
									'operator' => '==',
									'value'    => 'yes',
								),
							),
						),
						array(
							'name'     => 'skin',
							'operator' => '==',
							'value'    => 'cover',
						),
					),
				),
			)
		);

		$this->add_control(
			'fallback_image_custom',
			array(
				'label'      => esc_html__( 'Fallback Image Custom', 'powerpack' ),
				'type'       => Controls_Manager::MEDIA,
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'classic',
								),
								array(
									'name'     => 'cat_thumbnails',
									'operator' => '==',
									'value'    => 'yes',
								),
								array(
									'name'     => 'fallback_image',
									'operator' => '==',
									'value'    => 'custom',
								),
							),
						),
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'cover',
								),
								array(
									'name'     => 'fallback_image',
									'operator' => '==',
									'value'    => 'custom',
								),
							),
						),
					),
				),
			)
		);

		$this->add_control(
			'cat_title',
			array(
				'label'        => esc_html__( 'Category Title', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'cat_title_html_tag',
			array(
				'label'     => esc_html__( 'Title HTML Tag', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'div',
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
					'cat_title' => 'yes',
				),
			)
		);

		$this->add_control(
			'posts_count',
			array(
				'label'        => esc_html__( 'Posts Count', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'count_text_singular',
			array(
				'label'     => esc_html__( 'Count Text (Singular)', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => esc_html__( 'Post', 'powerpack' ),
				'condition' => array(
					'posts_count' => 'yes',
				),
			)
		);

		$this->add_control(
			'count_text_plural',
			array(
				'label'     => esc_html__( 'Count Text (Plural)', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => esc_html__( 'Posts', 'powerpack' ),
				'condition' => array(
					'posts_count' => 'yes',
				),
			)
		);

		$this->add_control(
			'cat_description',
			array(
				'label'        => esc_html__( 'Category Description', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Content Tab: Carousel Settings
	 * -------------------------------------------------
	 */
	protected function register_content_carousel_settings_controls() {
		$this->start_controls_section(
			'section_carousel_settings',
			array(
				'label'     => esc_html__( 'Carousel Settings', 'powerpack' ),
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'slider_speed',
			array(
				'label'       => esc_html__( 'Slider Speed', 'powerpack' ),
				'description' => esc_html__( 'Duration of transition between slides (in ms)', 'powerpack' ),
				'type'        => Controls_Manager::SLIDER,
				'default'     => array( 'size' => 600 ),
				'range'       => array(
					'px' => array(
						'min'  => 100,
						'max'  => 3000,
						'step' => 1,
					),
				),
				'size_units'  => '',
				'condition'   => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'autoplay',
			array(
				'label'        => esc_html__( 'Autoplay', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'separator'    => 'before',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'autoplay_speed',
			array(
				'label'      => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array( 'size' => 2400 ),
				'range'      => array(
					'px' => array(
						'min'  => 500,
						'max'  => 5000,
						'step' => 1,
					),
				),
				'size_units' => '',
				'condition'  => array(
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'infinite_loop',
			array(
				'label'        => esc_html__( 'Infinite Loop', 'powerpack' ),
				'description'  => '',
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'carousel',
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
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'grab_cursor',
			array(
				'label'        => esc_html__( 'Grab Cursor', 'powerpack' ),
				'description'  => esc_html__( 'Shows grab cursor when you hover over the slider', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Show', 'powerpack' ),
				'label_off'    => esc_html__( 'Hide', 'powerpack' ),
				'return_value' => 'yes',
				'separator'    => 'before',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'navigation_heading',
			array(
				'label'     => esc_html__( 'Navigation', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'arrows',
			array(
				'label'        => esc_html__( 'Arrows', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'dots',
			array(
				'label'        => esc_html__( 'Pagination', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'pagination_type',
			array(
				'label'     => esc_html__( 'Pagination Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'bullets',
				'options'   => array(
					'bullets'  => esc_html__( 'Dots', 'powerpack' ),
					'fraction' => esc_html__( 'Fraction', 'powerpack' ),
				),
				'condition' => array(
					'layout' => 'carousel',
					'dots'   => 'yes',
				),
			)
		);

		$this->add_control(
			'direction',
			array(
				'label'     => esc_html__( 'Direction', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'left',
				'options'   => array(
					'auto'  => esc_html__( 'Auto', 'powerpack' ),
					'left'  => esc_html__( 'Left', 'powerpack' ),
					'right' => esc_html__( 'Right', 'powerpack' ),
				),
				'separator' => 'before',
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register Pagination Controls.
	 *
	 * @access protected
	 */
	protected function register_content_pagination_controls() {

		$this->start_controls_section(
			'section_pagination_field',
			array(
				'label'     => __( 'Pagination', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_CONTENT,
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
				),
			)
		);

		$this->add_control(
			'categories_pagination_type',
			array(
				'label'     => __( 'Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'none',
				'options'   => array(
					'none'                  => __( 'None', 'powerpack' ),
					'numbers'               => __( 'Numbers', 'powerpack' ),
					'numbers_and_prev_next' => __( 'Numbers', 'powerpack' ) . ' + ' . __( 'Previous/Next', 'powerpack' ),
					'load_more'             => __( 'Load More Button', 'powerpack' ),
					'infinite'              => __( 'Infinite', 'powerpack' ),
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
				),
			)
		);

		$this->add_control(
			'pagination_page_limit',
			array(
				'label'     => __( 'Page Limit', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 5,
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type' => array(
						'numbers',
						'numbers_and_prev_next',
					),
				),
			)
		);

		$this->add_control(
			'pagination_numbers_shorten',
			array(
				'label'     => __( 'Shorten', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => '',
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type' => array(
						'numbers',
						'numbers_and_prev_next',
					),
				),
			)
		);

		$this->add_control(
			'pagination_load_more_label',
			array(
				'label'     => __( 'Button Label', 'powerpack' ),
				'default'   => __( 'Load More', 'powerpack' ),
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type' => 'load_more',
				),
			)
		);

		$this->add_control(
			'pagination_load_more_button_icon',
			array(
				'label'       => __( 'Button Icon', 'powerpack' ),
				'type'        => Controls_Manager::ICONS,
				'label_block' => false,
				'skin'        => 'inline',
				'condition'   => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type' => 'load_more',
				),
			)
		);

		$this->add_control(
			'pagination_load_more_button_icon_position',
			array(
				'label'     => __( 'Icon Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'after',
				'options'   => array(
					'after'  => __( 'After', 'powerpack' ),
					'before' => __( 'Before', 'powerpack' ),
				),
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type'           => 'load_more',
					'pagination_load_more_button_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'pagination_prev_label',
			array(
				'label'     => __( 'Previous Label', 'powerpack' ),
				'default'   => __( '&laquo; Previous', 'powerpack' ),
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type' => 'numbers_and_prev_next',
				),
			)
		);

		$this->add_control(
			'pagination_next_label',
			array(
				'label'     => __( 'Next Label', 'powerpack' ),
				'default'   => __( 'Next &raquo;', 'powerpack' ),
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type' => 'numbers_and_prev_next',
				),
			)
		);

		$this->add_control(
			'pagination_align',
			array(
				'label'     => __( 'Alignment', 'powerpack' ),
				'type'      => Controls_Manager::CHOOSE,
				'options'   => array(
					'left'   => array(
						'title' => __( 'Left', 'powerpack' ),
						'icon'  => 'eicon-text-align-left',
					),
					'center' => array(
						'title' => __( 'Center', 'powerpack' ),
						'icon'  => 'eicon-text-align-center',
					),
					'right'  => array(
						'title' => __( 'Right', 'powerpack' ),
						'icon'  => 'eicon-text-align-right',
					),
				),
				'default'   => 'center',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination' => 'text-align: {{VALUE}};',
				),
				'condition' => array(
					'layout'                  => 'grid',
					'skin!'                   => 'list',
					'categories_pagination_type!' => 'none',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Categories' );
		if ( ! empty( $help_docs ) ) {
			/**
			 * Content Tab: Docs Links
			 *
			 * @since 2.6.1
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
	/* STYLE TAB
	/*-----------------------------------------------------------------------------------*/

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
			'column_gap',
			array(
				'label'       => esc_html__( 'Columns Gap', 'powerpack' ),
				'type'        => Controls_Manager::SLIDER,
				'size_units'  => array( 'px', 'em', 'rem', 'custom' ),
				'default'     => array(
					'size' => 20,
				),
				'range'       => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors'   => array(
					'{{WRAPPER}}' => '--grid-column-gap: {{SIZE}}{{UNIT}}',
				),
				'render_type' => 'template',
				'condition'   => array(
					'skin!' => 'list',
				),
			)
		);

		$this->add_responsive_control(
			'row_gap',
			array(
				'label'      => esc_html__( 'Rows Gap', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => 20,
				),
				'range'      => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}}' => '--grid-row-gap: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .pp-categories-list .pp-category' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'name'     => 'layout',
							'operator' => '==',
							'value'    => 'grid',
						),
						array(
							'name'     => 'skin',
							'operator' => '==',
							'value'    => 'list',
						),
					),
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Box
	 */
	protected function register_style_box_controls() {
		$this->start_controls_section(
			'section_box_style',
			array(
				'label'     => esc_html__( 'Box', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'skin' => array( 'classic', 'cover' ),
				),
			)
		);

		$this->add_control(
			'height',
			array(
				'label'      => esc_html__( 'Height', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'vh', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 100,
						'max'  => 1000,
						'step' => 1,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 300,
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-category-inner' => 'height: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'skin' => 'cover',
				),
			)
		);

		$this->start_controls_tabs( 'cat_box_tabs_style' );

		$this->start_controls_tab(
			'cat_box_normal',
			array(
				'label' => esc_html__( 'Normal', 'powerpack' ),
			)
		);

		$this->add_control(
			'cat_box_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories .pp-category' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'cat_box_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-categories .pp-category',
			)
		);

		$this->add_control(
			'cat_box_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories .pp-category' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'category_box_shadow',
				'selector' => '{{WRAPPER}} .pp-categories .pp-category',
			)
		);

		$this->add_control(
			'category_box_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories .pp-category' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'cat_box_hover',
			array(
				'label' => esc_html__( 'Hover', 'powerpack' ),
			)
		);

		$this->add_control(
			'cat_box_bg_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories .pp-category:hover' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'cat_box_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories .pp-category:hover' => 'border-color: {{VALUE}}',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'     => 'category_box_shadow_hover',
				'selector' => '{{WRAPPER}} .pp-categories .pp-category:hover',
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: List
	 */
	protected function register_style_list_controls() {
		$this->start_controls_section(
			'section_list_style',
			array(
				'label'     => esc_html__( 'List', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_control(
			'cat_list_background',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-list .pp-category' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'cat_list_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-categories-list .pp-category',
				'condition'   => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'cat_list_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-categories-list .pp-category',
				'condition' => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_control(
			'cat_list_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-list .pp-category' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'skin' => 'list',
				),
			)
		);

		$this->add_control(
			'list_icon_heading',
			array(
				'label'     => esc_html__( 'List Icon', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'skin'           => 'list',
					'list_icon_type' => 'icon',
				),
			)
		);

		$this->add_control(
			'list_icon_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-list .pp-category-icon' => 'color: {{VALUE}}; fill: {{VALUE}}',
				),
				'condition' => array(
					'skin'           => 'list',
					'list_icon_type' => 'icon',
				),
			)
		);

		$this->add_control(
			'list_icon_size',
			array(
				'label'      => esc_html__( 'Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 5,
						'max'  => 100,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-list .pp-category-icon' => 'font-size: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'skin'           => 'list',
					'list_icon_type' => 'icon',
				),
			)
		);

		$this->add_control(
			'list_image_heading',
			array(
				'label'     => esc_html__( 'List Icon Image', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'skin'           => 'list',
					'list_icon_type' => 'image',
				),
			)
		);

		$this->add_control(
			'list_image_size',
			array(
				'label'      => esc_html__( 'Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 400,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-list .pp-category-icon img' => 'width: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'skin'           => 'list',
					'list_icon_type' => 'image',
				),
			)
		);

		$this->add_control(
			'list_icon_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'    => array(
					'unit' => 'px',
					'size' => 10,
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-list .pp-category-icon' => 'margin-right: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'skin'           => 'list',
					'list_icon_type' => array( 'icon', 'image' ),
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Content
	 */
	protected function register_style_cat_content_controls() {
		$this->start_controls_section(
			'section_style_cat_content',
			array(
				'label' => esc_html__( 'Content', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'cat_content_vertical_align',
			array(
				'label'                => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
				'label_block'          => false,
				'default'              => 'middle',
				'options'              => array(
					'top'    => array(
						'title' => esc_html__( 'Top', 'powerpack' ),
						'icon'  => 'eicon-v-align-top',
					),
					'middle' => array(
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-v-align-middle',
					),
					'bottom' => array(
						'title' => esc_html__( 'Bottom', 'powerpack' ),
						'icon'  => 'eicon-v-align-bottom',
					),
				),
				'selectors'            => array(
					'{{WRAPPER}} .pp-categories-cover .pp-category .pp-category-content-wrap'   => 'justify-content: {{VALUE}};',
				),
				'selectors_dictionary' => array(
					'top'    => 'flex-start',
					'middle' => 'center',
					'bottom' => 'flex-end',
				),
				'condition'            => array(
					'skin' => 'cover',
				),
			)
		);

		$this->add_control(
			'cat_content_horizontal_align',
			array(
				'label'                => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
				'label_block'          => false,
				'options'              => array(
					'left'    => array(
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-h-align-left',
					),
					'center'  => array(
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon'  => 'eicon-h-align-center',
					),
					'right'   => array(
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-h-align-right',
					),
					'justify' => array(
						'title' => esc_html__( 'Stretch', 'powerpack' ),
						'icon'  => 'eicon-h-align-stretch',
					),
				),
				'default'              => 'center',
				'selectors_dictionary' => array(
					'left'    => 'flex-start',
					'center'  => 'center',
					'right'   => 'flex-end',
					'justify' => 'stretch',
				),
				'selectors'            => array(
					'{{WRAPPER}} .pp-categories-cover .pp-category .pp-category-content-wrap' => 'align-items: {{VALUE}};',
				),
				'condition'            => array(
					'skin' => 'cover',
				),
			)
		);

		$this->add_control(
			'cat_content_text_align',
			array(
				'label'       => esc_html__( 'Text Alignment', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => false,
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
					'{{WRAPPER}} .pp-categories .pp-category .pp-category-content' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->start_controls_tabs( 'cat_content_tabs_style' );

		$this->start_controls_tab(
			'cat_content_normal',
			array(
				'label' => esc_html__( 'Normal', 'powerpack' ),
			)
		);

		$this->add_control(
			'cat_content_background',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories .pp-category .pp-category-content' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'cat_content_margin',
			array(
				'label'      => esc_html__( 'Margin', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories .pp-category .pp-category-content' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'cat_content_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories .pp-category .pp-category-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'cat_content_opacity',
			array(
				'label'     => esc_html__( 'Opacity', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => array(
					'size' => 1,
				),
				'range'     => array(
					'px' => array(
						'min'  => 0,
						'max'  => 1,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-cover .pp-category .pp-category-content' => 'opacity: {{SIZE}};',
				),
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'cat_content_hover',
			array(
				'label' => esc_html__( 'Hover', 'powerpack' ),
			)
		);

		$this->add_control(
			'cat_content_background_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories .pp-category:hover .pp-category-content' => 'background-color: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'cat_content_opacity_hover',
			array(
				'label'     => esc_html__( 'Opacity', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => array(
					'size' => 1,
				),
				'range'     => array(
					'px' => array(
						'min'  => 0,
						'max'  => 1,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-cover .pp-category:hover .pp-category-content' => 'opacity: {{SIZE}};',
				),
				'separator' => 'before',
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->add_control(
			'category_title_image_style',
			array(
				'label'     => esc_html__( 'Image', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'     => 'image_border',
				'selector' => '{{WRAPPER}} .pp-category-inner > img',
			]
		);

		$this->add_responsive_control(
			'image_border_radius',
			[
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'  => [
					'{{WRAPPER}} .pp-category-inner > img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'category_title_heading_style',
			array(
				'label'     => esc_html__( 'Title', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'cat_title' => 'yes',
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
					'{{WRAPPER}} .pp-category-title' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'cat_title' => 'yes',
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
					'{{WRAPPER}} .pp-category:hover .pp-category-title' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'cat_title' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'title_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-category-title',
				'condition' => array(
					'cat_title' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'title_margin_bottom',
			array(
				'label'      => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-category-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'list',
								),
								array(
									'name'     => 'list_style',
									'operator' => '==',
									'value'    => 'stacked',
								),
							),
						),
						array(
							'name'     => 'skin',
							'operator' => '!=',
							'value'    => 'list',
						),
					),
				),
			)
		);

		$this->add_control(
			'category_posts_count_heading_style',
			array(
				'label'     => esc_html__( 'Posts Count', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'posts_count' => 'yes',
				),
			)
		);

		$this->add_control(
			'counter_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-category-count' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'posts_count' => 'yes',
				),
			)
		);

		$this->add_control(
			'counter_text_color_hover',
			array(
				'label'     => esc_html__( 'Hover Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-category:hover .pp-category-count' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'posts_count' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'counter_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-category-count',
				'condition' => array(
					'posts_count' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'counter_margin_bottom',
			array(
				'label'      => esc_html__( 'Margin Bottom', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-category-count' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'conditions' => array(
					'relation' => 'or',
					'terms'    => array(
						array(
							'relation' => 'and',
							'terms'    => array(
								array(
									'name'     => 'skin',
									'operator' => '==',
									'value'    => 'list',
								),
								array(
									'name'     => 'list_style',
									'operator' => '==',
									'value'    => 'stacked',
								),
							),
						),
						array(
							'name'     => 'skin',
							'operator' => '!=',
							'value'    => 'list',
						),
					),
				),
			)
		);

		$this->add_responsive_control(
			'counter_margin_left',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'    => array( 'size' => 5 ),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-category-count' => 'margin-left: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'skin'        => 'list',
					'posts_count' => 'yes',
					'list_style'  => 'inline',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Category Description
	 */
	protected function register_style_cat_description_controls() {
		$this->start_controls_section(
			'section_cat_description_style',
			array(
				'label'     => esc_html__( 'Category Description', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'cat_description' => 'yes',
				),
			)
		);

		$this->add_control(
			'cat_description_text_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-category-description' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'cat_description' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'cat_description_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-category-description',
				'condition' => array(
					'cat_description' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'cat_description_margin_left',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'    => array( 'size' => 5 ),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-category-description' => 'margin-left: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'skin'        => 'list',
					'posts_count' => 'yes',
					'list_style'  => 'inline',
				),
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
				'label'     => esc_html__( 'Overlay', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_overlay_style' );

		$this->start_controls_tab(
			'tab_overlay_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'post_overlay_bg',
				'label'     => esc_html__( 'Overlay Background', 'powerpack' ),
				'types'     => array( 'classic', 'gradient' ),
				'exclude'   => array( 'image' ),
				'selector'  => '{{WRAPPER}} .pp-media-overlay',
				'condition' => array(
					'skin' => 'cover',
				),
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
					'{{WRAPPER}} .pp-media-overlay' => 'opacity: {{SIZE}};',
				),
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_overlay_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'post_overlay_bg_hover',
				'label'     => esc_html__( 'Overlay Background', 'powerpack' ),
				'types'     => array( 'classic', 'gradient' ),
				'exclude'   => array( 'image' ),
				'selector'  => '{{WRAPPER}} .pp-category:hover .pp-media-overlay',
				'condition' => array(
					'skin' => 'cover',
				),
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
					'{{WRAPPER}} .pp-category:hover .pp-media-overlay' => 'opacity: {{SIZE}};',
				),
				'condition' => array(
					'skin' => 'cover',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Arrows
	 * -------------------------------------------------
	 */
	protected function register_style_arrows_controls() {
		$this->start_controls_section(
			'section_arrows_style',
			array(
				'label'     => esc_html__( 'Arrows', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout' => 'carousel',
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
				'condition' => array(
					'layout' => 'carousel',
					'arrows' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'arrows_size',
			array(
				'label'      => esc_html__( 'Arrows Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array( 'size' => '22' ),
				'range'      => array(
					'px' => array(
						'min'  => 15,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .elementor-swiper-button-next, {{WRAPPER}} .elementor-swiper-button-prev' => 'font-size: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'carousel',
					'arrows' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'align_arrows',
			array(
				'label'      => esc_html__( 'Align Arrows', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => -100,
						'max'  => 40,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .elementor-swiper-button-prev' => 'left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-swiper-button-next' => 'right: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'carousel',
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
					'layout' => 'carousel',
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
					'{{WRAPPER}} .elementor-swiper-button-next, {{WRAPPER}} .elementor-swiper-button-prev' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'carousel',
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
					'{{WRAPPER}} .elementor-swiper-button-next, {{WRAPPER}} .elementor-swiper-button-prev' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'carousel',
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
				'selector'    => '{{WRAPPER}} .elementor-swiper-button-next, {{WRAPPER}} .elementor-swiper-button-prev',
				'condition'   => array(
					'layout' => 'carousel',
					'arrows' => 'yes',
				),
			)
		);

		$this->add_control(
			'arrows_border_radius_normal',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .elementor-swiper-button-next, {{WRAPPER}} .elementor-swiper-button-prev' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'carousel',
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
					'layout' => 'carousel',
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
					'{{WRAPPER}} .elementor-swiper-button-next:hover, {{WRAPPER}} .elementor-swiper-button-prev:hover' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'carousel',
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
					'{{WRAPPER}} .elementor-swiper-button-next:hover, {{WRAPPER}} .elementor-swiper-button-prev:hover' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'carousel',
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
					'{{WRAPPER}} .elementor-swiper-button-next:hover, {{WRAPPER}} .elementor-swiper-button-prev:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'carousel',
					'arrows' => 'yes',
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
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .elementor-swiper-button-next, {{WRAPPER}} .elementor-swiper-button-prev' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'separator'  => 'before',
				'condition'  => array(
					'layout' => 'carousel',
					'arrows' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Pagination: Dots
	 * -------------------------------------------------
	 */
	protected function register_style_dots_controls() {
		$this->start_controls_section(
			'section_dots_style',
			array(
				'label'     => esc_html__( 'Pagination: Dots', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_control(
			'dots_position',
			array(
				'label'     => esc_html__( 'Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					'inside'  => esc_html__( 'Inside', 'powerpack' ),
					'outside' => esc_html__( 'Outside', 'powerpack' ),
				),
				'default'   => 'outside',
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_responsive_control(
			'dots_size',
			array(
				'label'      => esc_html__( 'Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 2,
						'max'  => 40,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .swiper-pagination-bullet' => 'height: {{SIZE}}{{UNIT}}; width: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_responsive_control(
			'dots_spacing',
			array(
				'label'      => esc_html__( 'Gap Between Dots', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 1,
						'max'  => 30,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .swiper-pagination-bullet' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					// The opacity property will override the default inactive dot color which is opacity 0.2.
					'{{WRAPPER}} .swiper-pagination-bullet' => 'background: {{VALUE}}; opacity: 1',
				),
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->add_control(
			'active_dot_color_normal',
			array(
				'label'     => esc_html__( 'Active Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .swiper-pagination-bullet-active' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
				'selector'    => '{{WRAPPER}} .swiper-pagination-bullet',
				'condition'   => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'{{WRAPPER}} .swiper-pagination-bullet' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullets' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'          => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'{{WRAPPER}} .swiper-pagination-bullet:hover' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'{{WRAPPER}} .swiper-pagination-bullet:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Style Tab: Pagination: Dots
	 * -------------------------------------------------
	 */
	protected function register_style_fraction_controls() {
		$this->start_controls_section(
			'section_fraction_style',
			array(
				'label'     => esc_html__( 'Pagination: Fraction', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'layout'          => 'carousel',
					'dots'            => 'yes',
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
					'layout'          => 'carousel',
					'dots'            => 'yes',
					'pagination_type' => 'fraction',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_pagination_controls() {

		$this->start_controls_section(
			'section_pagination_style',
			array(
				'label'     => __( 'Pagination', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type!' => 'none',
				),
			)
		);

		$this->add_responsive_control(
			'pagination_margin_top',
			array(
				'label'     => __( 'Gap between Posts & Pagination', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => array(
					'size' => '',
				),
				'range'     => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination-top .pp-categories-pagination' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-categories-pagination-bottom .pp-categories-pagination' => 'margin-top: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_control(
			'load_more_button_size',
			array(
				'label'     => __( 'Size', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'sm',
				'options'   => array(
					'xs' => __( 'Extra Small', 'powerpack' ),
					'sm' => __( 'Small', 'powerpack' ),
					'md' => __( 'Medium', 'powerpack' ),
					'lg' => __( 'Large', 'powerpack' ),
					'xl' => __( 'Extra Large', 'powerpack' ),
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => 'load_more',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'pagination_typography',
				'selector'  => '{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a',
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->start_controls_tabs( 'tabs_pagination' );

		$this->start_controls_tab(
			'tab_pagination_normal',
			array(
				'label'     => __( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_control(
			'pagination_link_bg_color_normal',
			array(
				'label'     => __( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_control(
			'pagination_color',
			array(
				'label'     => __( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'pagination_link_border_normal',
				'label'       => __( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a',
				'condition'   => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_responsive_control(
			'pagination_link_border_radius',
			array(
				'label'      => __( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_responsive_control(
			'pagination_link_padding',
			array(
				'label'      => __( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', 'em', '%' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'pagination_link_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-categories-pagination .page-numbers, {{WRAPPER}} .pp-categories-pagination a',
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_pagination_hover',
			array(
				'label'     => __( 'Hover', 'powerpack' ),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_control(
			'pagination_link_bg_color_hover',
			array(
				'label'     => __( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination a:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_control(
			'pagination_color_hover',
			array(
				'label'     => __( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination a:hover' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_control(
			'pagination_border_color_hover',
			array(
				'label'     => __( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination a:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'pagination_link_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-categories-pagination a:hover',
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next', 'load_more' ),
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_pagination_active',
			array(
				'label'     => __( 'Active', 'powerpack' ),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next' ),
				),
			)
		);

		$this->add_control(
			'pagination_link_bg_color_active',
			array(
				'label'     => __( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers.current' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next' ),
				),
			)
		);

		$this->add_control(
			'pagination_color_active',
			array(
				'label'     => __( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers.current' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next' ),
				),
			)
		);

		$this->add_control(
			'pagination_border_color_active',
			array(
				'label'     => __( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-categories-pagination .page-numbers.current' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next' ),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'pagination_link_box_shadow_active',
				'selector'  => '{{WRAPPER}} .pp-categories-pagination .page-numbers.current',
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next' ),
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'pagination_spacing',
			array(
				'label'     => __( 'Space Between', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'separator' => 'before',
				'default'   => array(
					'size' => 10,
				),
				'range'     => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors' => array(
					'body:not(.rtl) {{WRAPPER}} .pp-categories-pagination .page-numbers:not(:first-child)' => 'margin-left: calc( {{SIZE}}{{UNIT}}/2 );',
					'body:not(.rtl) {{WRAPPER}} .pp-categories-pagination .page-numbers:not(:last-child)' => 'margin-right: calc( {{SIZE}}{{UNIT}}/2 );',
					'body.rtl {{WRAPPER}} .pp-categories-pagination .page-numbers:not(:first-child)' => 'margin-right: calc( {{SIZE}}{{UNIT}}/2 );',
					'body.rtl {{WRAPPER}} .pp-categories-pagination .page-numbers:not(:last-child)' => 'margin-left: calc( {{SIZE}}{{UNIT}}/2 );',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'numbers', 'numbers_and_prev_next' ),
				),
			)
		);

		$this->add_control(
			'heading_loader',
			array(
				'label'     => __( 'Loader', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'load_more', 'infinite' ),
				),
			)
		);

		$this->add_control(
			'loader_color',
			array(
				'label'     => __( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-loader:after, {{WRAPPER}} .pp-categories-loader:after' => 'border-bottom-color: {{VALUE}}; border-top-color: {{VALUE}};',
				),
				'condition' => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'load_more', 'infinite' ),
				),
			)
		);

		$this->add_responsive_control(
			'loader_size',
			array(
				'label'      => __( 'Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'range'      => array(
					'px' => array(
						'min'  => 10,
						'max'  => 80,
						'step' => 1,
					),
				),
				'default'    => array(
					'size' => 46,
				),
				'size_units' => array( 'px' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-categories-loader' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout' => 'grid',
					'skin!'  => 'list',
					'categories_pagination_type' => array( 'load_more', 'infinite' ),
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Get slides count
	 *
	 * @since 2.7.10
	 * @access protected
	 */
	public function get_slides_count() {

		return $this->slides_count;
	}

	/**
	 * Slider Settings.
	 *
	 * @access public
	 */
	public function slider_settings() {
		$settings = $this->get_settings();

		$slides_count = $this->get_slides_count();

		$items        = ( isset( $settings['columns'] ) && $settings['columns'] ) ? absint( $settings['columns'] ) : 3;
		$items_tablet = ( isset( $settings['columns_tablet'] ) && $settings['columns_tablet'] ) ? absint( $settings['columns_tablet'] ) : 2;
		$items_mobile = ( isset( $settings['columns_mobile'] ) && $settings['columns_mobile'] ) ? absint( $settings['columns_mobile'] ) : 1;
		$spacing      = ( isset( $settings['column_gap']['size'] ) && $settings['column_gap']['size'] ) ? $settings['column_gap']['size'] : 10;
		$spacing_tablet = ( isset( $settings['column_gap_tablet']['size'] ) && $settings['column_gap_tablet']['size'] ) ? $settings['column_gap_tablet']['size'] : 10;
		$spacing_mobile = ( isset( $settings['column_gap_mobile']['size'] ) && $settings['column_gap_mobile']['size'] ) ? $settings['column_gap_mobile']['size'] : 10;

		$slides_per_view        = min( $slides_count, $items );
		$slides_per_view_tablet = min( $slides_count, $items_tablet );
		$slides_per_view_mobile = min( $slides_count, $items_mobile );

		$slider_options = array(
			'speed'           => ( $settings['slider_speed']['size'] ) ? $settings['slider_speed']['size'] : 400,
			'slides_per_view' => absint( $slides_per_view ),
			'space_between'   => ( $settings['column_gap']['size'] ) ? $settings['column_gap']['size'] : 10,
			'auto_height'     => true,
			'loop'            => ( 'yes' === $settings['infinite_loop'] ) ? 'yes' : '',
		);

		if ( 'yes' === $settings['grab_cursor'] ) {
			$slider_options['grab_cursor'] = true;
		}

		if ( 'yes' === $settings['autoplay'] ) {
			$autoplay_speed = 999999;
			$slider_options['autoplay'] = 'yes';

			if ( ! empty( $settings['autoplay_speed']['size'] ) ) {
				$autoplay_speed = $settings['autoplay_speed']['size'];
			}

			$slider_options['autoplay_speed'] = $autoplay_speed;
		}

		if ( 'yes' === $settings['dots'] && $settings['pagination_type'] ) {
			$slider_options['pagination'] = $settings['pagination_type'];
		}

		if ( 'yes' === $settings['arrows'] ) {
			$slider_options['show_arrows'] = true;
		}

		$breakpoints = PP_Helper::elementor()->breakpoints->get_active_breakpoints();

		foreach ( $breakpoints as $device => $breakpoint ) {
			if ( in_array( $device, [ 'mobile', 'tablet', 'desktop' ] ) ) {
				switch ( $device ) {
					case 'desktop':
						$slider_options['slides_per_view'] = absint( $slides_per_view );
						$slider_options['space_between'] = absint( $spacing );
						break;
					case 'tablet':
						$slider_options['slides_per_view_tablet'] = absint( $slides_per_view_tablet );
						$slider_options['space_between_tablet'] = absint( $spacing_tablet );
						break;
					case 'mobile':
						$slider_options['slides_per_view_mobile'] = absint( $slides_per_view_mobile );
						$slider_options['space_between_mobile'] = absint( $spacing_mobile );
						break;
				}
			} else {
				if ( isset( $settings['columns_' . $device]['size'] ) && $settings['columns_' . $device]['size'] ) {
					$slider_options['slides_per_view_' . $device] = absint( $settings['columns_' . $device]['size'] );
				}

				if ( isset( $settings['column_gap_' . $device]['size'] ) && $settings['column_gap_' . $device]['size'] ) {
					$slider_options['space_between_' . $device] = absint( $settings['column_gap_' . $device]['size'] );
				}
			}
		}

		$this->add_render_attribute(
			'container',
			array(
				'data-slider-settings' => wp_json_encode( $slider_options ),
			)
		);
	}

	/**
	 * Get post type.
	 *
	 * @since 2.7.10
	 * @access protected
	 */
	protected function get_post_type() {
		$settings = $this->get_settings();

		if ( ! isset( $settings['post_type'] ) ) {
			$post_type = 'post';
		} else {
			$post_type = $settings['post_type'];
		}

		return $post_type;
	}

	/**
	 * Get all categories.
	 *
	 * @since 2.7.10
	 * @access protected
	 */
	protected function get_all_categories( $taxonomy ) {
		$args = $this->get_categories_query_arguments( false );

		$all_categories = get_terms( $taxonomy, $args );

		$this->slides_count = count( $all_categories );

		return $all_categories;
	}

	/**
	 * Render category title output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_category_title( $settings, $cat ) {
		if ( 'yes' === $settings['cat_title'] ) {
			$title_tag = PP_Helper::validate_html_tag( $settings['cat_title_html_tag'] );
			echo '<' . esc_html( $title_tag ) . ' class="pp-category-title">';
				echo esc_attr( $cat->name );
			echo '</' . esc_html( $title_tag ) . '>';
		}
	}

	/**
	 * Render category title output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_category_description( $settings, $cat ) {
		if ( 'yes' === $settings['cat_description'] ) { ?>
			<div class="pp-category-description">
				<?php echo wp_kses_post( $cat->description ); ?>
			</div>
			<?php
		}
	}

	/**
	 * Render category title output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_category_posts_count( $settings, $cat ) {
		if ( 'yes' === $settings['posts_count'] ) {
			?>
			<div class="pp-category-count">
				<?php
					printf(
						esc_html(
							/* translators: number of posts in category */
							_nx(
								'%1$s %2$s',
								'%1$s %3$s',
								$cat->count,
								'posts count',
								'powerpack'
							)
						),
						intval( number_format_i18n( $cat->count ) ),
						esc_attr( $settings['count_text_singular'] ),
						esc_attr( $settings['count_text_plural'] )
					);
				?>
			</div>
			<?php
		}
	}

	/**
	 * Render overlay skin output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_cat_thumbnail( $settings, $cat ) {
		$enabled_thumbnails = get_option( 'pp_elementor_taxonomy_thumbnail_enable', 'enabled' );

		$category_image = '';

		$cat_thumb_id = get_term_meta( $cat->term_id, 'thumbnail_id', true );
		if ( $enabled_thumbnails ) {
			$taxonomy_thumbnail_id = get_term_meta( $cat->term_id, 'taxonomy_thumbnail_id', true );

			if ( empty( $cat_thumb_id ) ) {
				$cat_thumb_id = $taxonomy_thumbnail_id;
			}
		}
		$category_image = wp_get_attachment_image_src( $cat_thumb_id, $settings['cat_thumbnails_size'] );

		if ( is_array( $category_image ) && ! empty( $category_image ) ) {
			?>
			<img src="<?php echo esc_url( $category_image[0] ); ?>" alt="<?php echo esc_attr( $cat->name ); ?>">
			<?php
		} elseif ( 'custom' === $settings['fallback_image'] && ! empty( $settings['fallback_image_custom']['url'] ) ) {
			?>
				<?php echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'cat_thumbnails', 'fallback_image_custom' ) ); ?>
			<?php
		} elseif ( ! empty( $settings['fallback_image'] ) ) {
			?>
				<img src="<?php echo esc_url( Utils::get_placeholder_image_src() ); ?>" alt="<?php echo esc_attr( $cat->name ); ?>">
			<?php
		}
	}

	/**
	 * Render overlay skin output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_skin_classic( $settings, $cat ) {
		?>
		<div class="pp-category-inner">
			<?php
			if ( 'yes' === $settings['cat_thumbnails'] ) {
				$this->render_cat_thumbnail( $settings, $cat );
			}
			?>
			<div class="pp-category-content">
				<?php
					$this->render_category_title( $settings, $cat );

					$this->render_category_posts_count( $settings, $cat );

					$this->render_category_description( $settings, $cat );
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render cover skin output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_skin_cover( $settings, $cat ) {
		?>
		<div class="pp-category-inner">
			<?php
				$this->render_cat_thumbnail( $settings, $cat );
			?>
			<div class="pp-media-overlay"></div>
			<div class="pp-category-content-wrap">
				<div class="pp-category-content">
					<?php
						$this->render_category_title( $settings, $cat );

						$this->render_category_posts_count( $settings, $cat );

						$this->render_category_description( $settings, $cat );
					?>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render cover skin output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_skin_list( $settings, $cat ) {
		?>
		<div class="pp-category-inner">
			<div class="pp-category-icon pp-icon">
				<?php
				if ( 'icon' === $settings['list_icon_type'] ) {
					Icons_Manager::render_icon( $settings['list_icon'], array( 'aria-hidden' => 'true' ) );
				} elseif ( 'image' === $settings['list_icon_type'] ) {
					if ( 'custom_image' === $settings['list_image_source'] ) {
						echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'list_image', 'list_image' ) );
					} elseif ( 'category_image' === $settings['list_image_source'] ) {
						$this->render_cat_thumbnail( $settings, $cat );
					}
				}
				?>
			</div>
			<div class="pp-category-content">
				<?php
					$this->render_category_title( $settings, $cat );

					$this->render_category_posts_count( $settings, $cat );

					$this->render_category_description( $settings, $cat );
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render coupons carousel dots output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_dots() {
		$settings = $this->get_settings_for_display();

		if ( 'yes' === $settings['dots'] ) {
			?>
			<!-- Add Pagination -->
			<div class="swiper-pagination swiper-pagination-<?php echo esc_attr( $this->get_id() ); ?>"></div>
			<?php
		}
	}

	/**
	 * Render coupons carousel arrows output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_arrows() {
		PP_Helper::render_arrows( $this );
	}

	/**
	 * Render Categories Widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings();

		$pagination_type = $settings['categories_pagination_type'];
		$post_type       = $this->get_post_type();
		$var_tax_type    = $post_type . '_tax_type';
		$taxonomy        = $settings[ $var_tax_type ];

		$all_categories = $this->get_all_categories( $taxonomy );

		$this->add_render_attribute(
			'container',
			'class',
			array(
				'pp-categories',
				'pp-categories-' . $settings['layout'],
				'pp-categories-' . $settings['skin'],
			)
		);

		if ( 'carousel' === $settings['layout'] ) {
			$this->slider_settings();
		}

		if ( 'right' === $settings['direction'] || ( 'auto' === $settings['direction'] && is_rtl() ) ) {
			$this->add_render_attribute( 'container', 'dir', 'rtl' );
		}

		if ( 'infinite' === $pagination_type ) {
			$this->add_render_attribute( 'container', 'class', 'pp-categories-infinite-scroll' );
		}

		$this->add_render_attribute( 'grid', 'class', 'pp-category' );

		if ( 'list' !== $settings['skin'] ) {
			if ( 'carousel' === $settings['layout'] ) {
				if ( 'outside' === $settings['dots_position'] ) {
					$this->add_render_attribute( 'container', 'class', 'swiper-container-wrap-dots-outside' );
				}

				$this->add_render_attribute(
					'container',
					array(
						'class'           => array( 'pp-swiper-slider', 'swiper' ),
						'data-pagination' => '.swiper-pagination-' . esc_attr( $this->get_id() ),
						'data-arrow-next' => '.swiper-button-next-' . esc_attr( $this->get_id() ),
						'data-arrow-prev' => '.swiper-button-prev-' . esc_attr( $this->get_id() ),
					)
				);

				$this->add_render_attribute( 'wrapper', 'class', 'swiper-wrapper' );
				$this->add_render_attribute( 'grid', 'class', 'swiper-slide' );
			} else {
				$page_id = '';
				if ( null !== \Elementor\Plugin::$instance->documents->get_current() ) {
					$page_id = \Elementor\Plugin::$instance->documents->get_current()->get_main_id();
				}
				$this->add_render_attribute( 'wrapper', 'class', 'elementor-grid pp-categories-grid-wrapper' );
				$this->add_render_attribute( 'wrapper', 'data-page', $page_id );
				$this->add_render_attribute( 'grid', 'class', 'pp-grid-item elementor-grid-item' );
			}
		}
		?>
		<?php if ( 'carousel' === $settings['layout'] ) { ?>
			<div class="swiper-container-wrap">
		<?php } ?>
				<div <?php $this->print_render_attribute_string( 'container' ); ?>>
					<div <?php $this->print_render_attribute_string( 'wrapper' ); ?>>
						<?php
						if ( ! empty( $all_categories ) ) {
							foreach ( $all_categories as $index => $cat ) {
								$this->render_category_body( $cat );
							}
						}
						?>
					</div>
					<?php
					if ( ( isset( $settings['categories_pagination_type'] ) && 'none' !== $settings['categories_pagination_type'] )
						&& 'list' !== $settings['skin'] && 'grid' === $settings['layout'] ) {
						?>
						<div class="pp-categories-pagination-wrap pp-categories-pagination-bottom">
							<?php
								$coupons = $this->render_pagination();
							?>
						</div>
						<?php
						if ( 'load_more' === $pagination_type || 'infinite' === $pagination_type ) {
							?>
							<div class="pp-categories-loader"></div>
							<?php
						}
					}
					?>
				</div>
				<?php
				if ( 'carousel' === $settings['layout'] ) {
					if ( !empty( $all_categories ) ) {
						$this->render_dots();

						$this->render_arrows();
					}
				}
				?>
		<?php if ( 'carousel' === $settings['layout'] ) { ?>
			</div>
		<?php }
	}

	/**
	 * Get post title length.
	 *
	 * @access protected
	 */
	protected function get_cat_description_length( $title ) {
		$settings = $this->get_settings();

		$length = absint( $settings['cat_description_length'] );

		if ( $length ) {
			if ( strlen( $title ) > $length ) {
				$title = substr( $title, 0, $length ) . '&hellip;';
			}
		}

		return $title;
	}

	/**
	 * Render Category body output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_category_body( $cat ) {
		$settings     = $this->get_settings();
		$post_type    = $this->get_post_type();
		$var_tax_type = $post_type . '_tax_type';
		$taxonomy     = $settings[ $var_tax_type ];
		$term_link    = get_term_link( $cat, $taxonomy );
		?>
		<div <?php $this->print_render_attribute_string( 'grid' ); ?> id="pp-cat-<?php echo esc_attr( $cat->term_id ); ?>">
			<a href="<?php echo esc_url( $term_link ); ?>" class="pp-category-link">
				<?php
				switch ( $settings['skin'] ) {
					case 'classic':
						$this->render_skin_classic( $settings, $cat );
						break;

					case 'cover':
						$this->render_skin_cover( $settings, $cat );
						break;

					case 'list':
						$this->render_skin_list( $settings, $cat );
						break;
				}
				?>
			</a>
		</div>
		<?php
	}

	/**
	 * Render Category body output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	public function render_ajax_category_body() {
		ob_start();

		$settings     = $this->get_settings();
		$post_type    = $this->get_post_type();
		$var_tax_type = $post_type . '_tax_type';
		$taxonomy     = $settings[ $var_tax_type ];

		$args = $this->get_categories_query_arguments( false );
		$all_categories = get_terms( $taxonomy, $args );

		$this->add_render_attribute( 'grid', 'class', 'pp-category pp-grid-item elementor-grid-item' );

		foreach ( $all_categories as $index => $cat ) {
			$this->render_category_body( $cat );
		}

		return ob_get_clean();
	}

	/**
	 * Render Category body output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	public function render_ajax_pagination() {
		ob_start();
		$this->render_pagination();
		return ob_get_clean();
	}

	/**
	 * Get Pagination.
	 *
	 * Returns the Pagination HTML.
	 *
	 * @since 2.11.1
	 * @access public
	 */
	public function render_pagination() {
		$settings  = $this->get_settings_for_display();

		$pagination_type    = $settings['categories_pagination_type'];
		$page_limit         = $settings['pagination_page_limit'];
		$pagination_shorten = $settings['pagination_numbers_shorten'];

		if ( 'none' === $pagination_type ) {
			return;
		}

		// Get current page number.
		$paged = $this->get_paged();

		$args         = $this->get_categories_query_arguments();
		$post_type    = $this->get_post_type();
		$var_tax_type = $post_type . '_tax_type';
		$taxonomy     = $settings[ $var_tax_type ];

		$all_categories   = get_terms( $taxonomy, $args );
		$total_categories = ( count( $all_categories ) > 0 ) ? count( $all_categories ) : 1;

		$per_page = isset( $settings['categories_per_page'] ) ? $settings['categories_per_page'] : 6;

		$total_pages = ceil( $total_categories / $per_page );

		if ( 'load_more' !== $pagination_type && 'infinite' !== $pagination_type ) {

			if ( '' !== $page_limit && null !== $page_limit ) {
				$total_pages = min( $page_limit, $total_pages );
			}
		}

		if ( 2 > $total_pages ) {
			return;
		}

		$has_numbers   = in_array( $pagination_type, array( 'numbers', 'numbers_and_prev_next' ) );
		$has_prev_next = ( 'numbers_and_prev_next' === $pagination_type );
		$is_load_more  = ( 'load_more' === $pagination_type );
		$is_infinite   = ( 'infinite' === $pagination_type );

		$links = array();

		if ( $has_numbers || $is_infinite ) {

			$current_page = $paged;
			if ( ! $current_page ) {
				$current_page = 1;
			}

			$paginate_args = array(
				'type'      => 'array',
				'current'   => $current_page,
				'total'     => $total_pages,
				'prev_next' => false,
				'show_all'  => 'yes' !== $pagination_shorten,
			);
		}

		if ( $has_prev_next ) {
			$prev_label = $settings['pagination_prev_label'];
			$next_label = $settings['pagination_next_label'];

			$paginate_args['prev_next'] = true;

			if ( $prev_label ) {
				$paginate_args['prev_text'] = $prev_label;
			}
			if ( $next_label ) {
				$paginate_args['next_text'] = $next_label;
			}
		}

		if ( $has_numbers || $has_prev_next || $is_infinite ) {

			if ( is_singular() && ! is_front_page() && ! is_singular( 'page' ) ) {
				global $wp_rewrite;
				if ( $wp_rewrite->using_permalinks() ) {
					$paginate_args['base']   = trailingslashit( get_permalink() ) . '%_%';
					$paginate_args['format'] = user_trailingslashit( '%#%', 'single_paged' );
				} else {
					$paginate_args['format'] = '?page=%#%';
				}
			}

			$links = paginate_links( $paginate_args );

		}

		if ( ! $is_load_more ) {
			?>
			<nav class="pp-categories-pagination pp-categories-pagination-ajax elementor-pagination" role="navigation" aria-label="<?php esc_attr_e( 'Pagination', 'powerpack' ); ?>" data-total="<?php echo esc_html( $total_pages ); ?>">
				<?php echo implode( PHP_EOL, $links ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</nav>
			<?php
		}

		if ( $is_load_more ) {
			$load_more_label                = $settings['pagination_load_more_label'];
			$load_more_button_icon          = $settings['pagination_load_more_button_icon'];
			$load_more_button_icon_position = $settings['pagination_load_more_button_icon_position'];
			$load_more_button_size          = $settings['load_more_button_size'];
			?>
			<div class="pp-category-load-more-wrap pp-categories-pagination" data-total="<?php echo esc_html( $total_pages ); ?>">
				<a class="pp-category-load-more elementor-button elementor-size-<?php echo esc_attr( $load_more_button_size ); ?>" href="javascript:void(0);">
					<?php if ( $load_more_button_icon['value'] && 'before' === $load_more_button_icon_position ) { ?>
						<span class="pp-button-icon pp-icon">
							<?php \Elementor\Icons_Manager::render_icon( $settings['pagination_load_more_button_icon'], [ 'aria-hidden' => 'true' ] ); ?>
						</span>
					<?php } ?>
					<?php if ( $load_more_label ) { ?>
						<span class="pp-button-text">
							<?php echo esc_html( $load_more_label ); ?>
						</span>
					<?php } ?>
					<?php if ( $load_more_button_icon['value'] && 'after' === $load_more_button_icon_position ) { ?>
						<span class="pp-button-icon pp-icon">
							<?php \Elementor\Icons_Manager::render_icon( $settings['pagination_load_more_button_icon'], [ 'aria-hidden' => 'true' ] ); ?>
						</span>
					<?php } ?>
				</a>
			</div>
			<?php
		}
	}

	/**
	 * Return Categories arguments.
	 *
	 * @since 2.11.1
	 * @return array
	 */
	protected function get_categories_query_arguments( $total_result = true ) {
		$settings     = $this->get_settings();
		$post_type    = $this->get_post_type();
		$var_tax_type = $post_type . '_tax_type';
		$taxonomy     = $settings[ $var_tax_type ];

		$paged    = $this->get_paged();
		$per_page = isset( $settings['categories_per_page'] ) ? $settings['categories_per_page'] : 6;
		$offset   = ( ( intval( $paged ) - 1 ) * $per_page );

		$args = array(
			'order'         => $settings['order'],
			'orderby'       => $settings['orderby'],
			'pad_counts'    => 1,
			'hierarchical'  => 1,
			'hide_empty'    => ( 'yes' === $settings['display_empty_cat'] ) ? false : true,
		);

		if ( ( isset( $settings['categories_pagination_type'] ) && 'none' !== $settings['categories_pagination_type'] )
			&& 'list' !== $settings['skin'] && 'grid' === $settings['layout'] && false === $total_result ) {
			$args['offset'] = $offset;
			$args['number'] = $per_page;
		}

		$post_type            = $this->get_post_type();
		$category_filter_type = $settings[ 'tax_' . $post_type . '_' . $taxonomy . '_filter_rule' ];
		$filter_categories    = $settings[ 'tax_' . $post_type . '_' . $taxonomy ];

		if ( 'top' === $category_filter_type ) {
			$args['parent'] = 0;
		}

		if ( 'child' === $category_filter_type ) {
			if ( 'current_cat' === $settings[ 'tax_' . $post_type . '_' . $taxonomy . '_parent' ] ) {
				$term = get_queried_object();
				$term_id = ( is_object( $term ) ) ? $term->term_id : '';
			} elseif ( 'sel_parent' === $settings[ 'tax_' . $post_type . '_' . $taxonomy . '_parent' ] ) {
				$term_id = $settings[ 'tax_' . $post_type . '_' . $taxonomy . '_parent_term' ];
			}
			$args['parent'] = $term_id;
		}

		if ( ! empty( $filter_categories ) ) {
			if ( 'include' === $category_filter_type ) {
				$args['include'] = $filter_categories;
			} elseif ( 'exclude' === $category_filter_type ) {
				$args['exclude'] = $filter_categories;
			}
		}

		$args = apply_filters( 'pp_categories_args', $args );

		return $args;
	}

	/**
	 * Return the paged number for the query.
	 *
	 * @since 2.11.1
	 * @return int
	 */
	public function get_paged() {
		$settings = $this->get_settings_for_display();

		global $wp_the_query, $paged;

		$pagination_type = $settings['categories_pagination_type'];

		if ( isset( $_POST['nonce'] ) && wp_verify_nonce( $_POST['nonce'], 'pp-categories-widget-nonce' ) ) {
			if ( isset( $_POST['page_number'] ) && '' !== $_POST['page_number'] ) {
				return $_POST['page_number'];
			}
		}

		// Check the 'paged' query var.
		$paged_qv = $wp_the_query->get( 'paged' );
		$paged_qv = max( 1, $paged_qv );

		if ( is_numeric( $paged_qv ) ) {
			return $paged_qv;
		}

		// Check the 'page' query var.
		$page_qv = $wp_the_query->get( 'page' );
		$page_qv = max( 1, $page_qv );

		if ( is_numeric( $page_qv ) ) {
			return $page_qv;
		}

		// Check the $paged global?
		if ( is_numeric( $paged ) ) {
			return max( 1, $paged );
		}

		return 1;
	}
}
