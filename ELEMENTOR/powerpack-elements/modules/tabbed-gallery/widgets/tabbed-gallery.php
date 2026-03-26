<?php
namespace PowerpackElements\Modules\TabbedGallery\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Modules\Gallery\Module;
use PowerpackElements\Group_Control_Transition;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Icons_Manager;
use Elementor\Repeater;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Tabbed Gallery Widget
 */
class Tabbed_Gallery extends Powerpack_Widget {

	/**
	 * Retrieve tabbed gallery widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Tabbed_Gallery' );
	}

	/**
	 * Retrieve tabbed gallery widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Tabbed_Gallery' );
	}

	/**
	 * Retrieve tabbed gallery widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Tabbed_Gallery' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 1.3.4
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Tabbed_Gallery' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the tabbed gallery widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return [
				'jquery-fancybox',
				'imagesloaded',
				'swiper',
				'pp-tabbed-gallery',
			];
		}

		$settings = $this->get_settings_for_display();
		$scripts = [ 'imagesloaded', 'swiper', 'pp-tabbed-gallery' ];

		if ( 'file' === $settings['link_to'] && 'no' !== $settings['open_lightbox'] && 'fancybox' === $settings['lightbox_library'] ) {
			array_push( $scripts, 'jquery-fancybox' );
		}

		return $scripts;
	}

	/**
	 * Retrieve the list of styles the image slider widget depended on.
	 *
	 * Used to set styles dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_style_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return [
				'e-swiper',
				'pp-swiper',
				'fancybox',
				'widget-pp-tabbed-gallery'
			];
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'e-swiper', 'pp-swiper', 'widget-pp-tabbed-gallery' ];

		if ( 'file' === $settings['link_to'] && 'no' !== $settings['open_lightbox'] && 'fancybox' === $settings['lightbox_library'] ) {
			array_push( $styles, 'fancybox' );
		}

		return $styles;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register tabbed gallery widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_gallery_controls();
		$this->register_content_settings_controls();
		$this->register_content_additional_options_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_layout_controls();
		$this->register_style_images_controls();
		$this->register_style_caption_controls();
		$this->register_style_link_icon_controls();
		$this->register_style_overlay_controls();
		$this->register_style_tabs_controls();
		$this->register_style_arrows_controls();
		$this->register_style_dots_controls();
	}

	/*-----------------------------------------------------------------------------------*/
	/*	CONTENT TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_content_gallery_controls() {
		/**
		 * Content Tab: Gallery
		 */
		$this->start_controls_section(
			'section_gallery',
			[
				'label'                 => esc_html__( 'Gallery', 'powerpack' ),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'tab_label',
			[
				'label'                 => esc_html__( 'Tab Label', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
			]
		);

		$repeater->add_control(
			'tab_title_icon',
			[
				'label'                 => esc_html__( 'Tab Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'label_block'           => true,
				'fa4compatibility'      => 'tab_icon',
			]
		);

		$repeater->add_control(
			'image_group',
			[
				'label'                 => esc_html__( 'Add Images', 'powerpack' ),
				'type'                  => Controls_Manager::GALLERY,
				'dynamic'               => [
					'active' => true,
				],
			]
		);

		$this->add_control(
			'gallery_images',
			[
				'label'                 => '',
				'type'                  => Controls_Manager::REPEATER,
				'fields'                => $repeater->get_controls(),
				'title_field'           => '{{tab_label}}',
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_settings_controls() {
		/**
		 * Content Tab: Settings
		 */
		$this->start_controls_section(
			'section_settings',
			[
				'label'                 => esc_html__( 'Settings', 'powerpack' ),
			]
		);

		$slides_per_view = range( 1, 10 );
		$slides_per_view = array_combine( $slides_per_view, $slides_per_view );

		$this->add_responsive_control(
			'slides_per_view',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Slides Per View', 'powerpack' ),
				'options'               => $slides_per_view,
				'default'               => '3',
				'tablet_default'        => '2',
				'mobile_default'        => '2',
			]
		);

		$this->add_responsive_control(
			'slides_to_scroll',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Slides to Scroll', 'powerpack' ),
				'description'           => esc_html__( 'Set how many slides are scrolled per swipe.', 'powerpack' ),
				'options'               => $slides_per_view,
				'default'               => 1,
				'tablet_default'        => 1,
				'mobile_default'        => 1,
				'condition'             => [
					'center_mode!' => 'yes',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'image',
				'label'                 => esc_html__( 'Image Size', 'powerpack' ),
				'default'               => 'full',
				'exclude'   => [ 'custom' ],
			]
		);

		$this->add_control(
			'equal_height',
			[
				'label'                 => esc_html__( 'Equal Height', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'no',
				'options'               => [
					'yes'   => esc_html__( 'Yes', 'powerpack' ),
					'no'    => esc_html__( 'No', 'powerpack' ),
				],
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'custom_height',
			[
				'label'                 => esc_html__( 'Custom Height', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'vh', 'custom' ],
				'default'               => [
					'size' => 300,
					'unit' => 'px',
				],
				'range'                 => [
					'px' => [
						'step' => 1,
						'min'  => 100,
						'max' => 800,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-swiper-equal-height .pp-tabbed-gallery-thumbnail-wrap' => 'height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'equal_height'  => 'yes',
				],
			]
		);

		$this->add_control(
			'caption',
			[
				'label'                 => esc_html__( 'Caption', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'show',
				'options'               => [
					'show'  => esc_html__( 'Show', 'powerpack' ),
					'hide'  => esc_html__( 'Hide', 'powerpack' ),
				],
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'caption_type',
			[
				'label'                 => esc_html__( 'Caption Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'caption',
				'options'               => [
					'title'         => esc_html__( 'Title', 'powerpack' ),
					'caption'       => esc_html__( 'Caption', 'powerpack' ),
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_position',
			[
				'label'                 => esc_html__( 'Caption Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'over_image',
				'options'               => [
					'over_image'    => esc_html__( 'Over Image', 'powerpack' ),
					'below_image'   => esc_html__( 'Below Image', 'powerpack' ),
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'link_to',
			[
				'label'                 => esc_html__( 'Link to', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'none',
				'options'               => [
					'none'          => esc_html__( 'None', 'powerpack' ),
					'file'          => esc_html__( 'Media File', 'powerpack' ),
					'custom'        => esc_html__( 'Custom URL', 'powerpack' ),
					'attachment'    => esc_html__( 'Attachment Page', 'powerpack' ),
				],
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'important_note',
			[
				'label'                 => '',
				'type'                  => Controls_Manager::RAW_HTML,
				'raw'                   => esc_html__( 'Add custom link in media uploader.', 'powerpack' ),
				'content_classes'       => 'pp-editor-info',
				'condition'             => [
					'link_to' => 'custom',
				],
			]
		);

		$this->add_control(
			'link_target',
			[
				'label'                 => esc_html__( 'Link Target', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => '_blank',
				'options'               => [
					'_self'         => esc_html__( 'Same Window', 'powerpack' ),
					'_blank'        => esc_html__( 'New Window', 'powerpack' ),
				],
				'condition'             => [
					'link_to' => [ 'custom', 'attachment' ],
				],
				'conditions'            => [
					'relation'  => 'or',
					'terms'     => [
						[
							'name'      => 'link_to',
							'operator'  => '==',
							'value'     => 'custom',
						],
						[
							'name'      => 'link_to',
							'operator'  => '==',
							'value'     => 'attachment',
						],
						[
							'relation'  => 'and',
							'terms'     => [
								[
									'name'      => 'link_to',
									'operator'  => '==',
									'value'     => 'file',
								],
								[
									'name'      => 'open_lightbox',
									'operator'  => '==',
									'value'     => 'no',
								],
							],
						],
					],
				],
			]
		);

		$this->add_control(
			'select_link_icon',
			[
				'label'                 => esc_html__( 'Link Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'label_block'           => true,
				'fa4compatibility'      => 'link_icon',
				'condition'             => [
					'link_to!' => 'none',
				],
			]
		);

		$this->add_control(
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
				'separator'             => 'before',
				'condition'             => [
					'link_to' => 'file',
				],
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
				'condition'             => [
					'link_to'           => 'file',
					'open_lightbox!'    => 'no',
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
					'link_to'           => 'file',
					'open_lightbox!'    => 'no',
					'lightbox_library'  => 'fancybox',
				],
			]
		);

		$this->add_control(
			'global_lightbox',
			[
				'type'                  => Controls_Manager::SELECT,
				'label'                 => esc_html__( 'Global Lightbox', 'powerpack' ),
				'description'           => esc_html__( 'Enabling this option will show images from all image gallery widgets in lightbox', 'powerpack' ),
				'default'               => 'no',
				'options'               => [
					'yes'      => esc_html__( 'Yes', 'powerpack' ),
					'no'       => esc_html__( 'No', 'powerpack' ),
				],
				'condition'             => [
					'link_to'           => 'file',
					'open_lightbox!'    => 'no',
					'lightbox_library'  => 'fancybox',
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

		$this->add_responsive_control(
			'margin',
			[
				'label'                 => esc_html__( 'Items Gap', 'powerpack' ),
				'description'           => esc_html__( 'Distance between slides (in px)', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [ 'size' => 10 ],
				'tablet_default'        => [ 'size' => 10 ],
				'mobile_default'        => [ 'size' => 10 ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
			]
		);

		$this->add_control(
			'animation_speed',
			[
				'label'                 => esc_html__( 'Animation Speed', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 600,
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
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label'                 => esc_html__( 'Autoplay', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'autoplay_speed',
			[
				'label'                 => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => 3000,
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
			'center_mode',
			[
				'label'                 => esc_html__( 'Center Mode', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'center_padding',
			[
				'label'                 => esc_html__( 'Center Padding', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 40,
					'unit' => 'px',
				],
				'range'                 => [
					'px' => [
						'max' => 500,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel' => 'padding-left: {{SIZE}}{{UNIT}}; padding-right: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'center_mode'   => 'yes',
				],
			]
		);

		$this->add_control(
			'side_blur',
			[
				'label'                 => esc_html__( 'Side Blur', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'condition'             => [
					'center_mode'   => 'yes',
				],
			]
		);

		$this->add_control(
			'navigation_heading',
			[
				'label'                 => esc_html__( 'Navigation', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'arrows',
			[
				'label'                 => esc_html__( 'Arrows', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
		);

		$this->add_control(
			'dots',
			[
				'label'                 => esc_html__( 'Dots', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'no',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
			]
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
					'dots' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Tabbed_Gallery' );
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

	protected function register_style_layout_controls() {
		/**
		 * Style Tab: Layout
		 */
		$this->start_controls_section(
			'section_layout_style',
			[
				'label'                 => esc_html__( 'Layout', 'powerpack' ),
				'tab'               => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'columns_gap',
			[
				'label'                 => esc_html__( 'Columns Gap', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [
					'size' => 20,
					'unit' => 'px',
				],
				'range'                 => [
					'px' => [
						'max' => 100,
					],
				],
			]
		);

		$this->add_control(
			'center_slide_style_heading',
			[
				'label'                 => esc_html__( 'Center Slide', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'center_mode'   => 'yes',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'center_slide_box_shadow',
				'selector'          => '{{WRAPPER}} .pp-tabbed-carousel .swiper-slide-active .pp-tabbed-gallery-thumbnail-wrap',
				'condition'             => [
					'center_mode'   => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'slide_padding',
			[
				'label'                 => esc_html__( 'Slide Padding', 'powerpack' ),
				'description'           => esc_html__( 'Add top and bottom padding to show box shadow properly', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'allowed_dimensions'    => 'vertical',
				'placeholder'           => [
					'top'      => '',
					'right'    => 'auto',
					'bottom'   => '',
					'left'     => 'auto',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel .pp-tabbed-carousel-slide' => 'padding-top: {{TOP}}{{UNIT}}; padding-bottom: {{BOTTOM}}{{UNIT}};',
				],
				'condition'             => [
					'center_mode'   => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_images_controls() {
		/**
		 * Style Tab: Images
		 */
		$this->start_controls_section(
			'section_images_style',
			[
				'label'                 => esc_html__( 'Images', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$pp_image_filters = [
			'normal'            => esc_html__( 'Normal', 'powerpack' ),
			'filter-1977'       => esc_html__( '1977', 'powerpack' ),
			'filter-aden'       => esc_html__( 'Aden', 'powerpack' ),
			'filter-amaro'      => esc_html__( 'Amaro', 'powerpack' ),
			'filter-ashby'      => esc_html__( 'Ashby', 'powerpack' ),
			'filter-brannan'    => esc_html__( 'Brannan', 'powerpack' ),
			'filter-brooklyn'   => esc_html__( 'Brooklyn', 'powerpack' ),
			'filter-charmes'    => esc_html__( 'Charmes', 'powerpack' ),
			'filter-clarendon'  => esc_html__( 'Clarendon', 'powerpack' ),
			'filter-crema'      => esc_html__( 'Crema', 'powerpack' ),
			'filter-dogpatch'   => esc_html__( 'Dogpatch', 'powerpack' ),
			'filter-earlybird'  => esc_html__( 'Earlybird', 'powerpack' ),
			'filter-gingham'    => esc_html__( 'Gingham', 'powerpack' ),
			'filter-ginza'      => esc_html__( 'Ginza', 'powerpack' ),
			'filter-hefe'       => esc_html__( 'Hefe', 'powerpack' ),
			'filter-helena'     => esc_html__( 'Helena', 'powerpack' ),
			'filter-hudson'     => esc_html__( 'Hudson', 'powerpack' ),
			'filter-inkwell'    => esc_html__( 'Inkwell', 'powerpack' ),
			'filter-juno'       => esc_html__( 'Juno', 'powerpack' ),
			'filter-kelvin'     => esc_html__( 'Kelvin', 'powerpack' ),
			'filter-lark'       => esc_html__( 'Lark', 'powerpack' ),
			'filter-lofi'       => esc_html__( 'Lofi', 'powerpack' ),
			'filter-ludwig'     => esc_html__( 'Ludwig', 'powerpack' ),
			'filter-maven'      => esc_html__( 'Maven', 'powerpack' ),
			'filter-mayfair'    => esc_html__( 'Mayfair', 'powerpack' ),
			'filter-moon'       => esc_html__( 'Moon', 'powerpack' ),
		];

		$this->add_group_control(
			Group_Control_Transition::get_type(),
			[
				'name'      => 'image_transition',
				'selector'  => '{{WRAPPER}} .pp-tabbed-gallery-thumbnail',
				'separator' => '',
			]
		);

		$this->add_control(
			'image_fit',
			[
				'label'                 => esc_html__( 'Image Fit', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'cover',
				'options'               => [
					'cover'     => esc_html__( 'Cover', 'powerpack' ),
					'contain'   => esc_html__( 'Contain', 'powerpack' ),
					'auto'      => esc_html__( 'Auto', 'powerpack' ),
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-swiper-equal-height .pp-tabbed-gallery-thumbnail' => 'background-size: {{VALUE}};',
				],
				'condition'             => [
					'equal_height'  => 'yes',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_image_filter_style' );

		$this->start_controls_tab(
			'tab_image_filter_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'image_scale',
			[
				'label'                 => esc_html__( 'Scale', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'  => 1,
						'max'  => 2,
						'step' => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-gallery-thumbnail' => 'transform: scale({{SIZE}});',
				],
			]
		);

		$this->add_control(
			'image_opacity',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'max'  => 1,
						'min'  => 0,
						'step' => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-gallery-thumbnail-wrap' => 'opacity: {{SIZE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'thumbnail_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-tabbed-gallery-thumbnail-wrap',
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'thumbnail_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-gallery-thumbnail-wrap' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'thumbnail_filter',
			[
				'label'                 => esc_html__( 'Image Filter', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'normal',
				'options'               => $pp_image_filters,
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_image_filter_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'thumbnail_scale_hover',
			[
				'label'                 => esc_html__( 'Scale', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'  => 1,
						'max'  => 2,
						'step' => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-gallery-thumbnail-wrap:hover .pp-tabbed-gallery-thumbnail' => 'transform: scale({{SIZE}});',
				],
			]
		);

		$this->add_control(
			'thumbnail_opacity_hover',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'max'  => 1,
						'min'  => 0,
						'step' => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-gallery-thumbnail-wrap:hover' => 'opacity: {{SIZE}}',
				],
			]
		);

		$this->add_control(
			'thumbnail_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-gallery-thumbnail-wrap:hover' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'thumbnail_hover_filter',
			[
				'label'                 => esc_html__( 'Image Filter', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'normal',
				'options'               => $pp_image_filters,
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_caption_controls() {
		/**
		 * Style Tab: Caption
		 */
		$this->start_controls_section(
			'section_caption_style',
			[
				'label'                 => esc_html__( 'Caption', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'caption_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-gallery-image-caption',
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_vertical_align',
			[
				'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'bottom',
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
				'selectors_dictionary'  => [
					'top'          => 'flex-start',
					'middle'       => 'center',
					'bottom'       => 'flex-end',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-content'   => 'justify-content: {{VALUE}};',
				],
				'condition'             => [
					'caption'           => 'show',
					'caption_position'  => 'over_image',
				],
			]
		);

		$this->add_control(
			'caption_horizontal_align',
			[
				'label'                 => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
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
					'justify'          => [
						'title' => esc_html__( 'Justify', 'powerpack' ),
						'icon'  => 'eicon-h-align-stretch',
					],
				],
				'default'               => 'left',
				'selectors_dictionary'  => [
					'left'     => 'flex-start',
					'center'   => 'center',
					'right'    => 'flex-end',
					'justify'  => 'stretch',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-content' => 'align-items: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_text_align',
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
				'default'               => 'center',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'text-align: {{VALUE}};',
				],
				'condition'             => [
					'caption'                  => 'show',
					'caption_horizontal_align' => 'justify',
				],
			]
		);

		$this->add_responsive_control(
			'caption_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_responsive_control(
			'caption_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_caption_style' );

		$this->start_controls_tab(
			'tab_caption_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'caption_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-gallery-image-caption',
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-image-caption' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'caption_text_shadow',
				'label'                 => esc_html__( 'Text Shadow', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-gallery-image-caption',
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_caption_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-caption' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_color_hover',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-caption' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_control(
			'caption_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-caption' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name'                  => 'caption_text_shadow_hover',
				'label'                 => esc_html__( 'Text Shadow', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-caption',
				'condition'             => [
					'caption'   => 'show',
				],
			]
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_link_icon_controls() {
		/**
		 * Style Tab: Link Icon
		 */
		$this->start_controls_section(
			'section_link_icon_style',
			[
				'label'                 => esc_html__( 'Link Icon', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_link_icon_style' );

		$this->start_controls_tab(
			'tab_link_icon_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon' => 'color: {{VALUE}};',
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon svg' => 'fill: {{VALUE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'link_icon_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon',
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_responsive_control(
			'link_icon_size',
			[
				'label'                 => esc_html__( 'Icon Size', 'powerpack' ),
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
					'icon_type'     => 'icon',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon' => 'font-size: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_opacity_normal',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 1,
						'step'  => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon' => 'opacity: {{SIZE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_responsive_control(
			'link_icon_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'placeholder'           => [
					'top'      => '',
					'right'    => '',
					'bottom'   => '',
					'left'     => '',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide .pp-gallery-image-icon' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_link_icon_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-icon' => 'color: {{VALUE}};',
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-icon svg' => 'fill: {{VALUE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-icon' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-icon' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->add_control(
			'link_icon_opacity_hover',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 1,
						'step'  => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-gallery-image-icon' => 'opacity: {{SIZE}};',
				],
				'condition'             => [
					'link_icon!'   => '',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_overlay_controls() {
		/**
		 * Style Tab: Overlay
		 */
		$this->start_controls_section(
			'section_overlay_style',
			[
				'label'                 => esc_html__( 'Overlay', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'overlay_blend_mode',
			[
				'label'                 => esc_html__( 'Blend Mode', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'normal',
				'options'               => [
					'normal'        => esc_html__( 'Normal', 'powerpack' ),
					'multiply'      => esc_html__( 'Multiply', 'powerpack' ),
					'screen'        => esc_html__( 'Screen', 'powerpack' ),
					'overlay'       => esc_html__( 'Overlay', 'powerpack' ),
					'darken'        => esc_html__( 'Darken', 'powerpack' ),
					'lighten'       => esc_html__( 'Lighten', 'powerpack' ),
					'color-dodge'   => esc_html__( 'Color Dodge', 'powerpack' ),
					'color'         => esc_html__( 'Color', 'powerpack' ),
					'hue'           => esc_html__( 'Hue', 'powerpack' ),
					'hard-light'    => esc_html__( 'Hard Light', 'powerpack' ),
					'soft-light'    => esc_html__( 'Soft Light', 'powerpack' ),
					'difference'    => esc_html__( 'Difference', 'powerpack' ),
					'exclusion'     => esc_html__( 'Exclusion', 'powerpack' ),
					'saturation'    => esc_html__( 'Saturation', 'powerpack' ),
					'luminosity'    => esc_html__( 'Luminosity', 'powerpack' ),
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-image-overlay' => 'mix-blend-mode: {{VALUE}};',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_overlay_style' );

		$this->start_controls_tab(
			'tab_overlay_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'overlay_background_color_normal',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-image-overlay',
				'exclude'               => [
					'image',
				],
			]
		);

		$this->add_control(
			'overlay_margin_normal',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 50,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-image-overlay' => 'top: {{SIZE}}{{UNIT}}; bottom: {{SIZE}}{{UNIT}}; left: {{SIZE}}{{UNIT}}; right: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'overlay_opacity_normal',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 1,
						'step'  => 0.01,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-image-overlay' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_overlay_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'overlay_background_color_hover',
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-image-overlay',
				'exclude'               => [
					'image',
				],
			]
		);

		$this->add_control(
			'overlay_margin_hover',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 50,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-image-overlay' => 'top: {{SIZE}}{{UNIT}}; bottom: {{SIZE}}{{UNIT}}; left: {{SIZE}}{{UNIT}}; right: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'overlay_opacity_hover',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 1,
						'step'  => 0.01,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-tabbed-carousel-slide:hover .pp-image-overlay' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_tabs_controls() {
		/**
		 * Style Tab: Tabs
		 */
		$this->start_controls_section(
			'section_tabs_style',
			[
				'label'                 => esc_html__( 'Tabs', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'filter_alignment',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'label_block'           => false,
				'type'                  => Controls_Manager::CHOOSE,
				'default'               => 'left',
				'options'               => [
					'left'          => [
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
				],
				'selectors_dictionary'  => [
					'left'      => 'flex-start',
					'center'    => 'center',
					'right'     => 'flex-end',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters'   => 'justify-content: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'tabs_container_style_heading',
			[
				'label'                 => esc_html__( 'Container', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'filters_margin_bottom',
			[
				'label'                 => esc_html__( 'Tabs Bottom Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 80,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'filters_container_background_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'filters_container_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'filters_container_margin',
			[
				'label'                 => esc_html__( 'Margin', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'allowed_dimensions'    => 'horizontal',
				'placeholder'           => [
					'top'      => 'auto',
					'right'    => '',
					'bottom'   => 'auto',
					'left'     => '',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'filters_container_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'tabs_title_style_heading',
			[
				'label'                 => esc_html__( 'Title', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'filter_items_gap',
			[
				'label'                 => esc_html__( 'Gap Between', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 80,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => '--space-between: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'filter_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-gallery-filters',
			]
		);

		$this->start_controls_tabs( 'tabs_filter_style' );

		$this->start_controls_tab(
			'tab_filter_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'filter_color_normal',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'color: {{VALUE}};',
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter svg' => 'fill: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'filter_background_color_normal',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'filter_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter',
			]
		);

		$this->add_control(
			'filter_border_radius_normal',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'filter_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'placeholder'           => [
					'top'      => '',
					'right'    => '',
					'bottom'   => '',
					'left'     => '',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'filter_box_shadow',
				'selector'          => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_filter_active',
			[
				'label'                 => esc_html__( 'Active', 'powerpack' ),
			]
		);

		$this->add_control(
			'filter_color_active',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide' => 'color: {{VALUE}};',
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide svg' => 'fill: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'filter_background_color_active',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'filter_border_color_active',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide' => 'border-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'filter_box_shadow_active',
				'selector'          => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active-slide',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_filter_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'filter_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'color: {{VALUE}};',
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover svg' => 'fill: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'filter_background_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'filter_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'border-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'              => 'filter_box_shadow_hover',
				'selector'          => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover',
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'tab_icon_style_heading',
			[
				'label'                 => esc_html__( 'Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_responsive_control(
			'tab_icons_gap',
			[
				'label'                 => esc_html__( 'Icon Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 80,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}}.pp-filter-icon-inline .pp-gallery-filters .pp-gallery-filter-icon' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.pp-filter-icon-block .pp-gallery-filters .pp-gallery-filter-icon' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_position',
			[
				'label'                 => esc_html__( 'Icon Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'inline'     => esc_html__( 'Inline', 'powerpack' ),
					'block'      => esc_html__( 'Block', 'powerpack' ),
				],
				'default'               => 'inline',
				'prefix_class'          => 'pp-filter-icon-',
			]
		);

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
			[
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
					'arrows'    => 'yes',
				],
			]
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
					'{{WRAPPER}} .elementor-swiper-button-next' => 'right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-swiper-button-prev' => 'left: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'arrows' => 'yes',
				),
			)
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
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'border-color: {{VALUE}};',
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
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				],
			]
		);

		$this->add_control(
			'dots_position',
			array(
				'label'        => esc_html__( 'Position', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'options'      => array(
					'inside'  => esc_html__( 'Inside', 'powerpack' ),
					'outside' => esc_html__( 'Outside', 'powerpack' ),
				),
				'default'      => 'outside',
				'prefix_class' => 'pp-swiper-slider-pagination-',
				'condition'    => array(
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				),
			)
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
					'{{WRAPPER}} .swiper-pagination-bullet' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullet' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_dots_style' );

		$this->start_controls_tab(
			'tab_dots_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullet' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
				'selector'              => '{{WRAPPER}} .swiper-pagination-bullet',
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullet' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_dots_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullet:hover' => 'background: {{VALUE}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
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
					'{{WRAPPER}} .swiper-pagination-bullet:hover' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'dots'            => 'yes',
					'pagination_type' => 'bullets',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		/**
		 * Style Tab: Pagination: Dots
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_fraction_style',
			array(
				'label'     => esc_html__( 'Pagination: Fraction', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
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
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .swiper-pagination-fraction',
				'condition' => array(
					'dots'            => 'yes',
					'pagination_type' => 'fraction',
				),
			)
		);

		$this->add_control(
			'fraction_position',
			array(
				'label'        => esc_html__( 'Position', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'options'      => array(
					'inside'  => esc_html__( 'Inside', 'powerpack' ),
					'outside' => esc_html__( 'Outside', 'powerpack' ),
				),
				'default'      => 'outside',
				'prefix_class' => 'pp-swiper-slider-pagination-',
				'condition'    => array(
					'dots'            => 'yes',
					'pagination_type' => 'fraction',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		$classes = [
			'pp-tabbed-carousel',
		];

		if ( 'yes' === $settings['center_mode'] ) {
			$classes[] = 'pp-swiper-center-mode';
		}

		if ( 'yes' === $settings['center_mode'] && 'yes' === $settings['side_blur'] ) {
			$classes[] = 'pp-carousel-side-blur';
		}

		if ( 'yes' === $settings['equal_height'] ) {
			$classes[] = 'pp-swiper-equal-height';
		}

		if ( $settings['thumbnail_filter'] ) {
			$classes[] = 'pp-ins-' . $settings['thumbnail_filter'];
		}

		if ( $settings['thumbnail_hover_filter'] ) {
			$classes[] = 'pp-ins-hover-' . $settings['thumbnail_hover_filter'];
		}

		$this->add_render_attribute( 'carousel', [
			'class' => $classes,
			'id'    => 'pp-tabbed-gallery-' . $this->get_id(),
		] );

		if ( is_rtl() ) {
			$this->add_render_attribute( 'carousel', 'dir', 'rtl' );
		}

		$this->add_render_attribute( 'carousel', [
			'class' => [
				'pp-swiper-slider',
				'pp-tabbed-gallery-carousel',
				'swiper'
			],
		] );

		$this->add_render_attribute( 'swiper-wrap', [
			'class' => [ 'swiper-wrapper' ],
		] );

		$this->slider_settings();
		$image_gallery = $this->get_photos();

		if ( ! empty( $image_gallery ) ) { ?>
			<?php $this->render_filters(); ?>
			<div class="swiper-container-wrap">
				<div <?php $this->print_render_attribute_string( 'carousel' ); ?>>
					<div <?php $this->print_render_attribute_string( 'swiper-wrap' ); ?>>
						<?php $this->render_gallery_items(); ?>
					</div>
				</div>
				<?php
					$this->render_dots();
					$this->render_arrows();
				?>
			</div>
		<?php } else {
			$placeholder = sprintf( esc_html__( 'Click here to edit the "%1$s" settings and choose some images.', 'powerpack' ), esc_attr( $this->get_title() ) );

			echo wp_kses_post( $this->render_editor_placeholder( [
				'title' => esc_html__( 'Gallery is empty!', 'powerpack' ),
				'body' => $placeholder,
			] ) );
		}
	}

	/**
	 * Carousel Settings.
	 *
	 * @access public
	 */
	public function slider_settings() {
		$settings = $this->get_settings();

		$slides_to_show          = ( isset( $settings['slides_per_view'] ) && $settings['slides_per_view'] ) ? absint( $settings['slides_per_view'] ) : 3;
		$slides_to_show_tablet   = ( isset( $settings['slides_per_view_tablet'] ) && $settings['slides_per_view_tablet'] ) ? absint( $settings['slides_per_view_tablet'] ) : 2;
		$slides_to_show_mobile   = ( isset( $settings['slides_per_view_mobile'] ) && $settings['slides_per_view_mobile'] ) ? absint( $settings['slides_per_view_mobile'] ) : 2;
		$slides_to_scroll        = ( isset( $settings['slides_to_scroll'] ) && $settings['slides_to_scroll'] ) ? absint( $settings['slides_to_scroll'] ) : 1;
		$slides_to_scroll_tablet = ( isset( $settings['slides_to_scroll_tablet'] ) && $settings['slides_to_scroll_tablet'] ) ? absint( $settings['slides_to_scroll_tablet'] ) : 1;
		$slides_to_scroll_mobile = ( isset( $settings['slides_to_scroll_mobile'] ) && $settings['slides_to_scroll_mobile'] ) ? absint( $settings['slides_to_scroll_mobile'] ) : 1;
		$spacing                 = ( isset( $settings['columns_gap']['size'] ) && $settings['columns_gap']['size'] ) ? absint( $settings['columns_gap']['size'] ) : 10;
		$spacing_tablet          = ( isset( $settings['columns_gap_tablet']['size'] ) && $settings['columns_gap_tablet']['size'] ) ? absint( $settings['columns_gap_tablet']['size'] ) : 10;
		$spacing_mobile          = ( isset( $settings['columns_gap_mobile']['size'] ) && $settings['columns_gap_mobile']['size'] ) ? absint( $settings['columns_gap_mobile']['size'] ) : 10;

		$slider_options = [
			'speed'            => ( '' !== $settings['animation_speed'] ) ? $settings['animation_speed'] : 600,
			'slides_per_view'  => $slides_to_show,
			'slides_to_scroll' => $slides_to_scroll,
			'space_between'    => $spacing,
			'loop'             => ( 'yes' === $settings['infinite_loop'] ) ? 'yes' : '',
			'observer'         => true,
			'observeParents'   => true,
		];

		if ( 'yes' === $settings['autoplay'] ) {
			$autoplay_speed = 999999;
			$slider_options['autoplay'] = 'yes';

			if ( ! empty( $settings['autoplay_speed'] ) ) {
				$autoplay_speed = $settings['autoplay_speed'];
			}

			$slider_options['autoplay_speed'] = $autoplay_speed;
		}

		if ( 'yes' === $settings['arrows'] ) {
			$slider_options['navigation'] = array(
				'nextEl' => '.swiper-button-next-' . esc_attr( $this->get_id() ),
				'prevEl' => '.swiper-button-prev-' . esc_attr( $this->get_id() ),
			);
		}

		if ( 'yes' === $settings['dots'] && $settings['pagination_type'] ) {
			$slider_options['pagination'] = $settings['pagination_type'];
		}

		if ( 'yes' === $settings['arrows'] ) {
			$slider_options['show_arrows'] = true;
		}

		if ( 'yes' === $settings['center_mode'] ) {
			$slider_options['centered_slides'] = 'yes';
		}

		$breakpoints = PP_Helper::elementor()->breakpoints->get_active_breakpoints();

		foreach ( $breakpoints as $device => $breakpoint ) {
			if ( in_array( $device, [ 'mobile', 'tablet', 'desktop' ] ) ) {
				switch ( $device ) {
					case 'desktop':
						$slider_options['slides_per_view'] = absint( $slides_to_show );
						$slider_options['slides_to_scroll'] = absint( $slides_to_scroll );
						$slider_options['space_between'] = absint( $spacing );
						break;
					case 'tablet':
						$slider_options['slides_per_view_tablet'] = absint( $slides_to_show_tablet );
						$slider_options['slides_to_scroll_tablet'] = absint( $slides_to_scroll_tablet );
						$slider_options['space_between_tablet'] = absint( $spacing_tablet );
						break;
					case 'mobile':
						$slider_options['slides_per_view_mobile'] = absint( $slides_to_show_mobile );
						$slider_options['slides_to_scroll_mobile'] = absint( $slides_to_scroll_mobile );
						$slider_options['space_between_mobile'] = absint( $spacing_mobile );
						break;
				}
			} else {
				if ( isset( $settings['slides_per_view_' . $device]['size'] ) && $settings['slides_per_view_' . $device]['size'] ) {
					$slider_options['slides_per_view_' . $device] = absint( $settings['slides_per_view_' . $device]['size'] );
				}

				if ( isset( $settings['slides_to_scroll_' . $device]['size'] ) && $settings['slides_to_scroll_' . $device]['size'] ) {
					$slider_options['slides_to_scroll_' . $device] = absint( $settings['slides_to_scroll_' . $device]['size'] );
				}

				if ( isset( $settings['columns_gap_' . $device]['size'] ) && $settings['columns_gap_' . $device]['size'] ) {
					$slider_options['space_between_' . $device] = absint( $settings['columns_gap_' . $device]['size'] );
				}
			}
		}

		$this->add_render_attribute(
			'carousel',
			[
				'data-slider-settings' => wp_json_encode( $slider_options ),
			]
		);
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

	protected function render_filters() {
		$settings = $this->get_settings_for_display();

		$gallery    = $settings['gallery_images'];
		?>
		<div class="pp-gallery-filters pp-tabbed-carousel-filters">
			<?php
				$label_index = 0;

			foreach ( $gallery as $index => $item ) {
				$tab_label = $item['tab_label'];
				$image_group = $item['image_group'];
				$images_count = count( $image_group );

				if ( empty( $tab_label ) ) {
					$tab_label = esc_html__( 'Group ', 'powerpack' );
					$tab_label .= ( $index + 1 );
				}

				$migration_allowed = Icons_Manager::is_migration_allowed();

				// Tab Icon - add old default
				if ( ! isset( $item['tab_icon'] ) && ! $migration_allowed ) {
					$item['tab_icon'] = isset( $fallback_defaults[ $index ] ) ? $fallback_defaults[ $index ] : '';
				}

				$migrated_tab_icon = isset( $item['__fa4_migrated']['tab_title_icon'] );
				$is_new_tab_icon = ! isset( $item['tab_icon'] ) && $migration_allowed;
				?>
				<div class="pp-gallery-filter" data-index=<?php echo esc_attr( $label_index ); ?> data-filter=".pp-group-<?php echo esc_attr( $index + 1 ); ?>" data-group=<?php echo esc_attr( $index ); ?>>
				<?php if ( ! empty( $item['tab_icon'] ) || ( ! empty( $item['tab_title_icon']['value'] ) && $is_new_tab_icon ) ) { ?>
						<span class="pp-gallery-filter-icon pp-icon">
							<?php
							if ( $is_new_tab_icon || $migrated_tab_icon ) {
								Icons_Manager::render_icon( $item['tab_title_icon'], [ 'aria-hidden' => 'true' ] );
							} else { ?>
								<i class="<?php echo esc_attr( $item['tab_icon'] ); ?>" aria-hidden="true"></i>
							<?php } ?>
						</span>
					<?php } ?>
					<span class="pp-gallery-filter-label">
						<?php echo wp_kses_post( $tab_label ); ?>
					</span>
				</div>
				<?php
				$current_label_index = $label_index + 1;

				$label_index = $label_index + $images_count;

				$hidden_divs_count = ( $label_index - $current_label_index );

				if ( $hidden_divs_count > 0 ) {
					for ( $i = 0; $i < $hidden_divs_count; $i++ ) {
						echo '<div class="pp-gallery-filter pp-hidden" data-group=' . esc_attr( $index ) . '></div>';
					}
				}
				?>
			<?php } ?>
		</div>
		<?php
	}

	protected function render_gallery_items() {
		$settings   = $this->get_settings_for_display();
		$tab_labels = $this->get_filter_ids( $settings['gallery_images'], true );
		$photos     = $this->get_photos();
		$count      = 0;

		foreach ( $photos as $photo ) {
			$overlay_key = $this->get_repeater_setting_key( 'overlay', 'gallery_images', $count );

			$image_id        = apply_filters( 'wpml_object_id', $photo->id, 'attachment', true );
			$tab_label       = $tab_labels[ $image_id ];
			$final_tab_label = preg_replace( '/[^\sA-Za-z0-9]/', '-', $tab_label ); ?>

			<div class="pp-tabbed-carousel-slide swiper-slide <?php echo esc_attr( $final_tab_label ); ?>" data-item-id="<?php echo esc_attr( $image_id ); ?>">
				<?php
					$image_html = '<div class="pp-tabbed-gallery-thumbnail-wrap pp-ins-filter-hover">';

					if ( $settings['equal_height'] == 'yes' ) {
						$image_html .= '<div class="pp-ins-filter-target pp-tabbed-gallery-thumbnail" style="background-image:url(' . esc_attr( $photo->src ) . ')"></div>';
					} else {
						$image_html .= '<div class="pp-ins-filter-target pp-tabbed-gallery-thumbnail"><img class="pp-gallery-slide-image" src="' . esc_attr( $photo->src ) . '" alt="' . $photo->alt . '" data-no-lazy="1" /></div>';
					}

					$image_html .= $this->render_image_overlay( $overlay_key );

					$image_html .= '<div class="pp-gallery-image-content pp-media-content">';

					// Link Icon
					$image_html .= $this->render_link_icon();

					if ( 'over_image' === $settings['caption_position'] ) {
						// Image Caption
						$image_html .= $this->render_image_caption( $image_id );
					}

					$image_html .= '</div>';
					$image_html .= '</div>';

					if ( 'none' !== $settings['link_to'] ) {

						$link_key = $this->get_repeater_setting_key( 'link', 'gallery_images', $count );

						if ( 'file' === $settings['link_to'] ) {

							$lightbox_library = $settings['lightbox_library'];
							$lightbox_caption = $settings['lightbox_caption'];

							$link = wp_get_attachment_url( $image_id );

							if ( 'fancybox' === $lightbox_library ) {
								$this->add_render_attribute( $link_key, [
									'data-elementor-open-lightbox' => 'no',
								] );

								if ( 'yes' === $settings['global_lightbox'] ) {
									$this->add_render_attribute( $link_key, [
										'data-fancybox' => 'pp-tabbed-gallery',
									] );
								} else {
									$this->add_render_attribute( $link_key, [
										'data-fancybox' => 'pp-tabbed-gallery-' . $this->get_id(),
									] );
								}

								if ( $lightbox_caption ) {
									$caption = Module::get_image_caption( $image_id, $settings['lightbox_caption'] );

									$this->add_render_attribute( $link_key, [
										'data-caption' => $caption,
									] );
								}

								$link_attr = 'href';
							} else {
								$this->add_lightbox_data_attributes( $link_key, $image_id, $settings['open_lightbox'], $this->get_id() );

								$link_attr = 'href';

								if ( PP_Helper::is_edit_mode() ) {
									$this->add_render_attribute( $link_key, [
										'class' => 'elementor-clickable',
									] );
								}
							}
						} elseif ( 'custom' === $settings['link_to'] ) {
							$link = get_post_meta( $image_id, 'pp-custom-link', true );

							if ( $link ) {
								$link_attr = 'href';
							}
						} elseif ( 'attachment' === $settings['link_to'] ) {
							$link = get_attachment_link( $image_id );
							$link_attr = 'href';
						}

						if ( 'attachment' === $settings['link_to'] || ( 'custom' === $settings['link_to'] && $link ) || ( 'file' === $settings['link_to'] && 'no' === $settings['open_lightbox'] ) ) {
							$link_target = $settings['link_target'];

							$this->add_render_attribute( $link_key, [
								'target' => $link_target,
							] );
						}

						if ( $link && $link_attr ) {
							$this->add_render_attribute( $link_key, [
								$link_attr => $link,
								'class'    => 'pp-tabbed-gallery-item-link',
							] );

							$image_html = '<a ' . $this->get_render_attribute_string( $link_key ) . '>' . $image_html . '</a>';
						}
					}

					echo wp_kses_post( $image_html );

					if ( 'below_image' === $settings['caption_position'] ) {
						?>
						<div class="pp-gallery-image-content">
						<?php
							// Image Caption
							echo wp_kses_post( $this->render_image_caption( $image_id ) );
						?>
						</div>
						<?php
					}
				?>
			</div>
			<?php
			$count++;
		}
	}

	protected function render_image_caption( $id ) {
		$settings = $this->get_settings_for_display();

		if ( 'hide' === $settings['caption'] ) {
			return '';
		}

		$caption_type = $this->get_settings( 'caption_type' );

		$caption = Module::get_image_caption( $id, $caption_type );

		if ( $caption == '' ) {
			return '';
		}

		ob_start();
		?>
		<div class="pp-gallery-image-caption">
			<?php echo wp_kses_post( $caption ); ?>
		</div>
		<?php
		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	protected function render_link_icon() {
		$settings = $this->get_settings_for_display();

		if ( ! isset( $settings['link_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['link_icon'] = '';
		}

		$has_icon = ! empty( $settings['link_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'link-icon', 'class', $settings['link_icon'] );
			$this->add_render_attribute( 'link-icon', 'aria-hidden', 'true' );
		}

		if ( ! $has_icon && ! empty( $settings['select_link_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_link_icon'] );
		$is_new = ! isset( $settings['link_icon'] ) && Icons_Manager::is_migration_allowed();

		if ( ! $has_icon ) {
			return '';
		}

		ob_start();
		?>
		<div class="pp-gallery-image-icon-wrap">
			<span class="pp-gallery-image-icon pp-icon">
				<?php
				if ( $is_new || $migrated ) {
					Icons_Manager::render_icon( $settings['select_link_icon'], [ 'aria-hidden' => 'true' ] );
				} elseif ( ! empty( $settings['link_icon'] ) ) {
					?><i <?php $this->print_render_attribute_string( 'link-icon' ); ?>></i><?php
				}
				?>
			</span>
		</div>
		<?php
		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	protected function render_image_overlay( $overlay_key ) {
		$this->add_render_attribute( $overlay_key, 'class', [
			'pp-image-overlay',
			'pp-gallery-image-overlay',
		] );

		return '<div ' . $this->get_render_attribute_string( $overlay_key ) . '></div>';
	}

	protected function get_filter_ids( $items = array(), $get_labels = false ) {
		$ids = array();
		$labels = array();

		if ( ! count( $items ) ) {
			return $ids;
		}

		foreach ( $items as $index => $item ) {
			$image_group = $item['image_group'];
			$filter_ids = array();
			$tab_label = '';

			foreach ( $image_group as $group ) {
				$ids[] = $group['id'];
				$filter_ids[] = $group['id'];
				$tab_label = 'pp-group-' . ( $index + 1 );
			}

			$labels[ $tab_label ] = $filter_ids;
		}

		if ( ! count( $ids ) ) {
			return $ids;
		}

		$unique_ids = array_unique( $ids );

		if ( $get_labels ) {
			$tab_labels = array();

			foreach ( $unique_ids as $unique_id ) {
				if ( empty( $unique_id ) ) {
					continue;
				}

				foreach ( $labels as $key => $filter_ids ) {
					if ( in_array( $unique_id, $filter_ids ) ) {
						if ( isset( $tab_labels[ $unique_id ] ) ) {
							$tab_labels[ $unique_id ] = $tab_labels[ $unique_id ] . ' ' . str_replace( ' ', '-', strtolower( $key ) );
						} else {
							$tab_labels[ $unique_id ] = str_replace( ' ', '-', strtolower( $key ) );
						}
					}
				}
			}

			return $tab_labels;
		}

		return $unique_ids;
	}

	protected function get_wordpress_photos() {
		$settings   = $this->get_settings_for_display();
		$image_size = $settings['image_size'];
		$photos     = array();
		$ids        = array();

		if ( ! count( $settings['gallery_images'] ) ) {
			return $photos;
		}

		$filter_ids = $this->get_filter_ids( $settings['gallery_images'] );

		foreach ( $filter_ids as $id ) {
			if ( empty( $id ) ) {
				continue;
			}

			$photo = $this->get_attachment_data( $id );

			if ( ! $photo ) {
				continue;
			}

			// Only use photos who have the sizes object.
			if ( isset( $photo->sizes ) ) {
				$data = new \stdClass();

				// Photo data object
				$data->id           = $id;
				$data->alt          = $photo->alt;
				$data->caption      = $photo->caption;
				$data->description  = $photo->description;
				$data->title        = $photo->title;

				if ( 'thumbnail' === $image_size && isset( $photo->sizes->thumbnail ) ) {
					$data->src = $photo->sizes->thumbnail->url;
				} elseif ( 'medium' === $image_size && isset( $photo->sizes->medium ) ) {
					$data->src = $photo->sizes->medium->url;
				} else {
					$data->src = $photo->sizes->full->url;
				}

				// Photo Link
				if ( isset( $photo->sizes->large ) ) {
					$data->link = $photo->sizes->large->url;
				} else {
					$data->link = $photo->sizes->full->url;
				}

				$photos[ $id ] = $data;
			}
		}

		return $photos;
	}

	protected function get_photos() {
		$photos     = $this->get_wordpress_photos();
		$settings   = $this->get_settings_for_display();
		$ordered    = array();

		$ordered = $photos;

		return $ordered;
	}

	protected function get_attachment_data( $id ) {
		$data = wp_prepare_attachment_for_js( $id );

		if ( gettype( $data ) == 'array' ) {
			return json_decode( json_encode( $data ) );
		}

		return $data;
	}
}
