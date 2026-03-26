<?php
namespace PowerpackElements\Modules\Devices\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Modules\Devices\Module;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Control_Media;
use Elementor\Utils;
use Elementor\Icons_Manager;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Border;
use Elementor\Embed;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Devices Widget
 */
class Devices extends Powerpack_Widget {

	/**
	 * Retrieve Devices widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Devices' );
	}

	/**
	 * Retrieve Devices widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Devices' );
	}

	/**
	 * Retrieve Devices widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Devices' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Devices widget belongs to.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Devices' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the Devices widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'swiper',
			'powerpack-devices',
		];
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
		return [ 'e-swiper', 'pp-swiper', 'widget-pp-devices' ];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	private static function get_network_icon_data( $network_name ) {
		$prefix = 'fa ';
		$library = '';

		if ( Icons_Manager::is_migration_allowed() ) {
			$prefix = 'fas ';
			$library = 'fa-solid';
		}

		return [
			'value' => $prefix . 'fa-' . $network_name,
			'library' => $library,
		];
	}

	/**
	 * Register Devices widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_device_controls();
		$this->register_content_image_controls();
		$this->register_content_video_controls();
		$this->register_content_video_options_controls();
		$this->register_content_slider_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_device_controls();
		$this->register_style_video_overlay_controls();
		$this->register_style_video_interface_controls();
		$this->register_style_video_buttons_controls();
		$this->register_style_arrows_controls();
	}

	/*-----------------------------------------------------------------------------------*/
	/*	CONTENT TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_content_device_controls() {

		/**
		 * Content Tab: Device
		 */
		$this->start_controls_section(
			'section_device',
			[
				'label'                 => esc_html__( 'Device', 'powerpack' ),
			]
		);

		$this->add_control(
			'device_type',
			[
				'label'                 => esc_html__( 'Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'phone',
				'options'               => [
					'phone'     => esc_html__( 'Phone', 'powerpack' ),
					'tablet'    => esc_html__( 'Tablet', 'powerpack' ),
					'laptop'    => esc_html__( 'Laptop', 'powerpack' ),
					'desktop'   => esc_html__( 'Desktop', 'powerpack' ),
					'window'    => esc_html__( 'Window', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'mobile_device_type',
			[
				'label'                 => esc_html__( 'Mobile Device', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'iphone-6',
				'options'               => [
					'iphone-6'  => esc_html__( 'iPhone 6S', 'powerpack' ),
					'iphone-13' => esc_html__( 'iPhone 13', 'powerpack' ),
					'iphone-16' => esc_html__( 'iPhone 16', 'powerpack' ),
				],
				'condition'             => [
					'device_type' => 'phone',
				],
			]
		);

		$this->add_control(
			'media_type',
			[
				'label'                 => esc_html__( 'Media Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'image',
				'options'               => [
					'image'     => esc_html__( 'Image', 'powerpack' ),
					'video'     => esc_html__( 'Video', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'orientation',
			[
				'label'                 => esc_html__( 'Orientation', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'portrait',
				'options'               => [
					'portrait'      => esc_html__( 'Portrait', 'powerpack' ),
					'landscape'     => esc_html__( 'Landscape', 'powerpack' ),
				],
				'condition'             => [
					'device_type'   => [ 'phone', 'tablet' ],
				],
			]
		);

		$this->add_control(
			'orientation_control',
			[
				'label'                 => esc_html__( 'Orientation Control', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => '',
				'condition'             => [
					'device_type'   => [ 'phone', 'tablet' ],
				],
			]
		);

		$this->add_responsive_control(
			'device_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
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
				],
				'default'               => 'center',
				'selectors' => [
					'{{WRAPPER}} .pp-device-container' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_image_controls() {
		/**
		 * Content Tab: Image
		 */
		$this->start_controls_section(
			'section_image',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'image',
				],
			]
		);

		$this->add_control(
			'image_type',
			[
				'label'                 => __( 'Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'single_image',
				'options'               => [
					'single_image' => __( 'Single Image', 'powerpack' ),
					'slider'       => __( 'Slider', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'image',
			[
				'label'                 => esc_html__( 'Choose Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'    => true,
				],
				'default'               => [
					'url'       => Utils::get_placeholder_image_src(),
				],
				'condition'             => [
					'media_type' => 'image',
					'image_type' => 'single_image',
				],
			]
		);

		$this->add_control(
			'gallery_images',
			array(
				'label'   => __( 'Add Images', 'powerpack' ),
				'type'    => Controls_Manager::GALLERY,
				'dynamic' => array(
					'active' => true,
				),
				'condition'             => [
					'media_type' => 'image',
					'image_type' => 'slider',
				],
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'image',
				'label'                 => esc_html__( 'Image Size', 'powerpack' ),
				'default'               => 'large',
				'condition'             => [
					'image[url]!'   => '',
					'media_type'    => 'image',
				],
			]
		);

		$this->add_control(
			'fit_type',
			[
				'label'                 => esc_html__( 'Fit Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'cover',
				'options'               => [
					'default'   => esc_html__( 'Default', 'powerpack' ),
					'cover'     => esc_html__( 'Cover', 'powerpack' ),
					'fill'      => esc_html__( 'Fill', 'powerpack' ),
				],
				'prefix_class'          => 'pp-device-image-fit-',
				'condition'             => [
					'media_type'    => 'image',
				],
			]
		);

		$this->add_control(
			'scrollable',
			[
				'label'                 => esc_html__( 'Scrollable', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'default'               => '',
				'condition'             => [
					'media_type'  => 'image',
					'image_type!' => 'slider',
				],
			]
		);

		$this->add_control(
			'image_align',
			[
				'label'                 => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'top',
				'options'               => [
					'top'           => [
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
					'custom'        => [
						'title' => esc_html__( 'Custom', 'powerpack' ),
						'icon'      => 'eicon-exchange',
					],
				],
				'selectors_dictionary'  => [
					'top'      => 'flex-start',
					'bottom'   => 'flex-end',
					'middle'   => 'center',
					'custom'   => 'flex-start',
				],
				'selectors'     => [
					'{{WRAPPER}} .pp-device-screen-image' => 'align-items: {{VALUE}};',
					'{{WRAPPER}} .pp-device-screen-image .pp-device-image-slide' => 'align-items: {{VALUE}};',
				],
				'condition'             => [
					'image[url]!'   => '',
					'device_type!'  => 'window',
					'media_type'    => 'image',
					'fit_type'      => 'default',
					'scrollable!'   => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'image_align_custom',
			[
				'label'                 => esc_html__( 'Top Offset', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ],
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 800,
						'step'  => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-device-screen' => 'top: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'image[url]!'   => '',
					'device_type!'  => 'window',
					'media_type'    => 'image',
					'fit_type'      => 'default',
					'image_align'   => 'custom',
					'scrollable!'   => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_video_controls() {
		/**
		 * Content Tab: Video
		 */
		$this->start_controls_section(
			'section_video',
			[
				'label'                 => esc_html__( 'Video', 'powerpack' ),
				'condition'             => [
					'media_type' => 'video',
				],
			]
		);

		$this->add_control(
			'video_source',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'youtube',
				'options'               => [
					'youtube'       => esc_html__( 'YouTube', 'powerpack' ),
					'vimeo'         => esc_html__( 'Vimeo', 'powerpack' ),
					'dailymotion'   => esc_html__( 'Dailymotion', 'powerpack' ),
					'hosted'        => esc_html__( 'Self Hosted/URL', 'powerpack' ),
				],
				'frontend_available'    => true,
				'condition'             => [
					'media_type' => 'video',
				],
			]
		);

		$this->add_control(
			'youtube_url',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'       => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => esc_html__( 'Enter your YouTube URL', 'powerpack' ),
				'default'               => 'https://www.youtube.com/watch?v=XHOmBV4js_E',
				'label_block'           => true,
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type' => 'video',
					'video_source' => 'youtube',
				],
			]
		);

		$this->add_control(
			'vimeo_url',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'       => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => esc_html__( 'Enter your Vimeo URL', 'powerpack' ),
				'default'               => 'https://vimeo.com/235215203',
				'label_block'           => true,
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'video_source' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'dailymotion_url',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'       => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'placeholder'           => esc_html__( 'Enter your Dailymotion URL', 'powerpack' ),
				'default'               => 'https://www.dailymotion.com/video/x6tqhqb',
				'label_block'           => true,
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'video_source' => 'dailymotion',
				],
			]
		);

		$this->start_controls_tabs(
			'tabs_sources',
			[
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->start_controls_tab(
			'tab_source_mp4',
			[
				'label'                 => esc_html__( 'MP4', 'powerpack' ),
			]
		);

		$this->add_control(
			'video_source_mp4',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'url',
				'options'               => [
					'url'       => esc_html__( 'URL', 'powerpack' ),
					'file'      => esc_html__( 'File', 'powerpack' ),
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_url_mp4',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'    => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_mp4'  => 'url',
				],
			]
		);

		$this->add_control(
			'video_file_mp4',
			[
				'label'                 => esc_html__( 'Upload Video', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'        => true,
					'categories'    => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::MEDIA_CATEGORY,
					],
				],
				'media_type'            => 'video',
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_mp4'  => 'file',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_source_m4v',
			[
				'label'                 => esc_html__( 'M4V', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_source_m4v',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'url',
				'options'               => [
					'url'       => esc_html__( 'URL', 'powerpack' ),
					'file'      => esc_html__( 'File', 'powerpack' ),
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_url_m4v',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'    => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_m4v'  => 'url',
				],
			]
		);

		$this->add_control(
			'video_file_m4v',
			[
				'label'                 => esc_html__( 'Upload Video', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'        => true,
					'categories'    => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::MEDIA_CATEGORY,
					],
				],
				'media_type'            => 'video',
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_m4v'  => 'file',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_source_ogg',
			[
				'label'                 => esc_html__( 'OGG', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_source_ogg',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'url',
				'options'               => [
					'url'       => esc_html__( 'URL', 'powerpack' ),
					'file'      => esc_html__( 'File', 'powerpack' ),
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_url_ogg',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'    => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_ogg'  => 'url',
				],
			]
		);

		$this->add_control(
			'video_file_ogg',
			[
				'label'                 => esc_html__( 'Upload Video', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'        => true,
					'categories'    => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::MEDIA_CATEGORY,
					],
				],
				'media_type'            => 'video',
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_ogg'  => 'file',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_source_webm',
			[
				'label'                 => esc_html__( 'WEBM', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_source_webm',
			[
				'label'                 => esc_html__( 'Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'url',
				'options'               => [
					'url'       => esc_html__( 'URL', 'powerpack' ),
					'file'      => esc_html__( 'File', 'powerpack' ),
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_url_webm',
			[
				'label'                 => esc_html__( 'URL', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'    => true,
					'categories'   => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_webm' => 'url',
				],
			]
		);

		$this->add_control(
			'video_file_webm',
			[
				'label'                 => esc_html__( 'Upload Video', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'dynamic'               => [
					'active'        => true,
					'categories'    => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::MEDIA_CATEGORY,
					],
				],
				'media_type'            => 'video',
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'video_source_webm' => 'file',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'thumbnail_size',
			[
				'label'                 => esc_html__( 'Thumbnail Size', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'separator'             => 'before',
				'default'               => 'maxresdefault',
				'options'               => [
					'maxresdefault' => esc_html__( 'Maximum Resolution', 'powerpack' ),
					'hqdefault'     => esc_html__( 'High Quality', 'powerpack' ),
					'mqdefault'     => esc_html__( 'Medium Quality', 'powerpack' ),
					'sddefault'     => esc_html__( 'Standard Quality', 'powerpack' ),
				],
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'youtube',
				],
			]
		);

		$this->add_control(
			'cover_image_show',
			[
				'label'                 => esc_html__( 'Show Cover Image', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'separator'             => 'before',
				'condition'             => [
					'media_type'        => 'video',
				],
			]
		);

		$this->add_control(
			'cover_image',
			[
				'label'                 => esc_html__( 'Cover Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'dynamic'               => [
					'active'        => true,
				],
				'condition'             => [
					'media_type'        => 'video',
					'cover_image_show'  => 'yes',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'cover_image',
				'label'                 => esc_html__( 'Image Size', 'powerpack' ),
				'default'               => 'large',
				'condition'             => [
					'cover_image[url]!' => '',
					'media_type'        => 'video',
					'cover_image_show'  => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_video_options_controls() {
		/**
		 * Content Tab: Video Options
		 */
		$this->start_controls_section(
			'section_video_options',
			[
				'label'                 => esc_html__( 'Video Options', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_settings',
			[
				'label'                 => esc_html__( 'Video Settings', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'cc_load_policy',
			[
				'label'                 => esc_html__( 'Captions', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'youtube',
					'controls'      => 'yes',
				],
			]
		);

		$this->add_control(
			'yt_privacy',
			[
				'label'                 => esc_html__( 'Privacy Mode', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'description'           => esc_html__( 'When you turn on privacy mode, YouTube won\'t store information about visitors on your website unless they play the video.', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'youtube',
				],
			]
		);

		$this->add_control(
			'rel',
			[
				'label'                 => esc_html__( 'Suggested Videos', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					''     => esc_html__( 'Current Video Channel', 'powerpack' ),
					'yes'  => esc_html__( 'Any Video', 'powerpack' ),
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'youtube',
				],
			]
		);

		// Dailymotion
		$this->add_control(
			'showinfo',
			[
				'label'                 => esc_html__( 'Video Info', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => 'yes',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => [ 'dailymotion' ],
				],
			]
		);

		$this->add_control(
			'logo',
			[
				'label'                 => esc_html__( 'Logo', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => 'yes',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => [ 'dailymotion' ],
				],
			]
		);

		// Vimeo.
		$this->add_control(
			'vimeo_title',
			[
				'label'                 => esc_html__( 'Intro Title', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => 'yes',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_portrait',
			[
				'label'                 => esc_html__( 'Intro Portrait', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => 'yes',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_byline',
			[
				'label'                 => esc_html__( 'Intro Byline', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => 'yes',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'vimeo',
				],
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
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'stop_others',
			[
				'label'                 => esc_html__( 'Stop Others', 'powerpack' ),
				'description'           => esc_html__( 'Stop all other videos on page when this video is played.', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'restart_on_pause',
			[
				'label'                 => esc_html__( 'Restart on pause', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'loop',
			[
				'label'                 => esc_html__( 'Loop', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
					'video_source!' => 'dailymotion',
				],
			]
		);

		$this->add_control(
			'start_time',
			[
				'label'                 => esc_html__( 'Start Time', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'description'           => esc_html__( 'Enter start time in seconds', 'powerpack' ),
				'default'               => '',
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source!' => 'hosted',
					'loop'         => '',
				],
			]
		);

		$this->add_control(
			'end_time',
			[
				'label'                 => esc_html__( 'End Time', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'description'           => esc_html__( 'Enter end time in seconds', 'powerpack' ),
				'default'               => '',
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source' => [ 'youtube', 'hosted' ],
					'loop'         => '',
				],
			]
		);

		$this->add_control(
			'end_at_last_frame',
			[
				'label'                 => esc_html__( 'End at last frame', 'powerpack' ),
				'description'           => esc_html__( 'End the video at the last frame instead of showing the first one', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
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
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'playback_speed',
			[
				'label'                 => esc_html__( 'Playback Speed', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [
					'size'  => 1,
				],
				'range'                 => [
					'px'    => [
						'max'   => 5,
						'min'   => 0.1,
						'step'  => 0.01,
					],
				],
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_controls_heading',
			[
				'label'                 => esc_html__( 'Controls', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'controls',
			[
				'label'                 => esc_html__( 'Player Controls', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'label_off'             => esc_html__( 'Hide', 'powerpack' ),
				'label_on'              => esc_html__( 'Show', 'powerpack' ),
				'default'               => 'yes',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => [ 'youtube', 'dailymotion' ],
				],
			]
		);

		$this->add_control(
			'color',
			[
				'label'                 => esc_html__( 'Controls Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => [ 'vimeo', 'dailymotion' ],
				],
			]
		);

		$this->add_control(
			'video_show_buttons',
			[
				'label'                 => esc_html__( 'Show Buttons', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'frontend_available'    => true,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'show_bar',
			[
				'label'                 => esc_html__( 'Show Bar', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'show_rewind',
			[
				'label'                 => esc_html__( 'Show Rewind', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'        => 'video',
					'video_source'      => 'hosted',
					'show_bar!'         => '',
					'restart_on_pause!' => 'yes',
				],
			]
		);

		$this->add_control(
			'show_time',
			[
				'label'                 => esc_html__( 'Show Time', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
				],
			]
		);

		$this->add_control(
			'show_progress',
			[
				'label'                 => esc_html__( 'Show Progress', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
				],
			]
		);

		$this->add_control(
			'show_duration',
			[
				'label'                 => esc_html__( 'Show Duration', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
				],
			]
		);

		$this->add_control(
			'show_fs',
			[
				'label'                 => esc_html__( 'Show Fullscreen', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
				],
			]
		);

		$this->add_control(
			'volume_heading',
			[
				'label'                 => esc_html__( 'Volume', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
				],
			]
		);

		$this->add_control(
			'show_volume',
			[
				'label'                 => esc_html__( 'Show Volume', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
				],
			]
		);

		$this->add_control(
			'show_volume_icon',
			[
				'label'                 => esc_html__( 'Show Volume Icon', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
					'show_volume!'  => '',
				],
			]
		);

		$this->add_control(
			'show_volume_bar',
			[
				'label'                 => esc_html__( 'Show Volume Bar', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'show',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'show',
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
					'show_bar!'     => '',
					'show_volume!'  => '',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register Slider Options Controls
	 *
	 * @return void
	 */
	protected function register_content_slider_controls() {
		/**
		 * Content Tab: Slider Options
		 */
		$this->start_controls_section(
			'section_additional_options',
			array(
				'label'     => __( 'Slider Options', 'powerpack' ),
				'condition' => [
					'media_type' => 'image',
					'image_type' => 'slider',
				],
			)
		);

		$this->add_control(
			'effect',
			array(
				'type'      => Controls_Manager::SELECT,
				'label'     => __( 'Effect', 'powerpack' ),
				'default'   => 'slide',
				'options'   => array(
					'slide' => __( 'Slide', 'powerpack' ),
					'fade'  => __( 'Fade', 'powerpack' ),
				),
				'condition' => [
					'media_type' => 'image',
					'image_type' => 'slider',
				],
			)
		);

		$this->add_control(
			'animation_speed',
			array(
				'label'   => __( 'Animation Speed', 'powerpack' ),
				'type'    => Controls_Manager::NUMBER,
				'default' => 600,
				'condition' => [
					'media_type' => 'image',
					'image_type' => 'slider',
				],
			)
		);

		$this->add_control(
			'slider_autoplay',
			array(
				'label'        => __( 'Autoplay', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => __( 'Yes', 'powerpack' ),
				'label_off'    => __( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => [
					'media_type' => 'image',
					'image_type' => 'slider',
				],
			)
		);

		$this->add_control(
			'autoplay_speed',
			array(
				'label'     => __( 'Autoplay Speed', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 3000,
				'condition' => array(
					'slider_autoplay' => 'yes',
					'media_type'      => 'image',
					'image_type'      => 'slider',
				),
			)
		);

		$this->add_control(
			'pause_on_hover',
			array(
				'label'              => __( 'Pause on Hover', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => __( 'Yes', 'powerpack' ),
				'label_off'          => __( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'slider_autoplay' => 'yes',
					'media_type'      => 'image',
					'image_type'      => 'slider',
				),
			)
		);

		$this->add_control(
			'pause_on_interaction',
			array(
				'label'              => esc_html__( 'Pause on Interaction', 'powerpack' ),
				'description'        => esc_html__( 'Disables autoplay completely on first interaction with the slider.', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'condition'          => array(
					'slider_autoplay' => 'yes',
					'media_type'      => 'image',
					'image_type'      => 'slider',
				),
			)
		);

		$this->add_control(
			'infinite_loop',
			array(
				'label'              => __( 'Infinite Loop', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => __( 'Yes', 'powerpack' ),
				'label_off'          => __( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'condition'          => [
					'media_type' => 'image',
					'image_type' => 'slider',
				],
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
					'media_type' => 'image',
					'image_type' => 'slider',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Devices' );

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

	/*-----------------------------------------------------------------------------------*/
	/*	STYLE TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_style_device_controls() {
		/**
		 * Style Tab: Device
		 */
		$this->start_controls_section(
			'section_device_style',
			[
				'label'                 => esc_html__( 'Device', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'device_width',
			[
				'label'                 => esc_html__( 'Width', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range'                 => [
					'px'  => [
						'min'   => 100,
						'max'   => 1200,
						'step'  => 1,
					],
					'em'  => [
						'min'   => 1,
						'max'   => 100,
					],
					'rem' => [
						'min'   => 1,
						'max'   => 100,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-device-container .pp-device-wrap' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'override_style',
			[
				'label'                 => esc_html__( 'Style', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'predefined',
				'options'               => [
					'predefined'    => esc_html__( 'Predefined', 'powerpack' ),
					'custom'        => esc_html__( 'Custom', 'powerpack' ),
				],
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'skin',
			[
				'label'                 => esc_html__( 'Choose Skin', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'jet_black',
				'options'               => [
					'jet_black' => esc_html__( 'Jet black', 'powerpack' ),
					'black'     => esc_html__( 'Black', 'powerpack' ),
					'silver'    => esc_html__( 'Silver', 'powerpack' ),
					'gold'      => esc_html__( 'Gold', 'powerpack' ),
					'rose_gold' => esc_html__( 'Rose Gold', 'powerpack' ),
				],
				'selectors_dictionary'  => [
					'jet_black' => '#000000',
					'black'     => '#343639',
					'silver'    => '#e4e6e7',
					'gold'      => '#fbe6cf',
					'rose_gold' => '#fde4dc',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-device-body svg .side-shape, {{WRAPPER}} .pp-device-body svg .back-shape' => 'fill: {{VALUE}};',
					'{{WRAPPER}} .pp-device-body svg .overlay-shape' => 'fill: #fff;',
				],
				'condition'             => [
					'override_style'    => 'predefined',
				],
			]
		);

		$this->add_control(
			'device_color',
			[
				'label'                 => esc_html__( 'Device Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-device-body svg .side-shape, {{WRAPPER}} .pp-device-body svg .back-shape' => 'fill: {{VALUE}};',
				],
				'condition'             => [
					'override_style'    => 'custom',
				],
			]
		);

		$this->add_control(
			'device_bg_color',
			[
				'label'                 => esc_html__( 'Device Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-device-media-inner' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'override_style'    => 'custom',
				],
			]
		);

		$this->add_control(
			'tone',
			[
				'label'                 => esc_html__( 'Tone', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'light',
				'options'               => [
					'dark'  => esc_html__( 'Dark', 'powerpack' ),
					'light' => esc_html__( 'Light', 'powerpack' ),
				],
				'selectors_dictionary'  => [
					'dark'  => '#000000',
					'light' => '#ffffff',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-device-body svg .overlay-shape' => 'fill: {{VALUE}};',
				],
				'prefix_class'          => 'pp-device-tone-',
				'condition'             => [
					'override_style'    => 'custom',
				],
			]
		);

		$this->add_control(
			'opacity',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'  => 0.1,
						'max'  => 1,
						'step' => 0.01,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-device-body svg .overlay-shape' => 'fill-opacity: {{SIZE}};',
				],
				'condition'             => [
					'override_style'    => 'custom',
				],
			]
		);

		$this->add_control(
			'orientation_control_heading',
			[
				'label'                 => esc_html__( 'Orientation Control', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'orientation_control'   => 'yes',
				],
			]
		);

		$this->add_control(
			'orientation_control_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-device-orientation' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'orientation_control'   => 'yes',
				],
			]
		);

		$this->add_control(
			'orientation_control_color_hover',
			[
				'label'                 => esc_html__( 'Hover Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-device-orientation:hover' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'orientation_control'   => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'orientation_control_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px'  => [
						'min'   => 10,
						'max'   => 50,
						'step'  => 1,
					],
					'em'  => [
						'min'   => 1,
					],
					'rem' => [
						'min'   => 1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-device-orientation' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'orientation_control'   => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_video_overlay_controls() {
		/**
		 * Style Tab: Video Overlay
		 */
		$this->start_controls_section(
			'section_video_overlay_style',
			[
				'label'                 => esc_html__( 'Video Overlay', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_overlay_background_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => 'rgba(0,0,0,0.4)',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-overlay' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_overlay_opacity',
			[
				'label'                 => esc_html__( 'Opacity', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'range'                 => [
					'px' => [
						'min'   => 0,
						'max'   => 1,
						'step'  => 0.1,
					],
				],
				'selectors'         => [
					'{{WRAPPER}} .pp-video-overlay' => 'opacity: {{SIZE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_video_interface_controls() {
		/**
		 * Style Tab: Video Interface
		 */
		$this->start_controls_section(
			'section_video_interface_style',
			[
				'label'                 => esc_html__( 'Video Interface', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_video_interface_style' );

		$this->start_controls_tab(
			'tab_video_interface_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_interface_color',
			[
				'label'                 => esc_html__( 'Controls Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-player-control' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_interface_background_color',
			[
				'label'                 => esc_html__( 'Controls Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-player-controls-bar' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_video_interface_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_interface_color_hover',
			[
				'label'                 => esc_html__( 'Controls Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-player-control:hover' => 'color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->add_control(
			'video_interface_background_color_hover',
			[
				'label'                 => esc_html__( 'Controls Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-player-controls-bar:hover' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_video_buttons_controls() {
		/**
		 * Style Tab: Video Buttons
		 */
		$this->start_controls_section(
			'section_video_buttons_style',
			[
				'label'                 => esc_html__( 'Video Buttons', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_responsive_control(
			'video_buttons_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'  => '',
				],
				'range'                 => [
					'px'    => [
						'min'   => 10,
						'max'   => 50,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-video-button' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_responsive_control(
			'video_buttons_spacing',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'  => '',
				],
				'range'                 => [
					'px'    => [
						'min'   => 0,
						'max'   => 50,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-video-button' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}};',
				],
				'condition'             => [
					'media_type'    => 'video',
					'video_source'  => 'hosted',
				],
			]
		);

		$this->start_controls_tabs(
			'tabs_video_buttons',
			[
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->start_controls_tab(
			'tab_video_buttons_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_buttons_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-buttons .pp-video-button' => 'color: {{VALUE}}; fill: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_buttons_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-buttons .pp-video-button' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'video_buttons_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '',
				'selector'              => '{{WRAPPER}} .pp-video-button',
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_buttons_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-video-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_responsive_control(
			'video_buttons_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'default'           => [
					'top'       => '1',
					'right'     => '1',
					'bottom'    => '1',
					'left'      => '1',
					'unit'      => 'em',
					'isLinked'  => true,
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-video-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_video_buttons_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'video_buttons_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-buttons .pp-video-button:hover' => 'color: {{VALUE}}; fill: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_buttons_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-buttons .pp-video-button:hover' => 'background-color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
		);

		$this->add_control(
			'video_buttons_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-video-buttons .pp-video-button:hover' => 'border-color: {{VALUE}};',
				],
				'condition'             => [
					'media_type'    => 'video',
				],
			]
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
				),
			)
		);

		$this->add_control(
			'select_arrow',
			array(
				'label'                  => esc_html__( 'Choose Arrow', 'powerpack' ),
				'type'                   => Controls_Manager::ICONS,
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
				'condition'  => array(
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_arrows_style' );

		$this->start_controls_tab(
			'tab_arrows_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_arrows_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
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
					'media_type' => 'image',
					'image_type' => 'slider',
					'arrows'     => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function render_image() {
		$settings = $this->get_settings_for_display();

		if ( '' !== $settings['image']['url'] ) { ?>
			<figure><?php echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'image' ) ); ?></figure>
		<?php }
	}

	/**
	 * Get embed params.
	 *
	 * Retrieve video widget embed parameters.
	 *
	 * @access public
	 *
	 * @return array Video embed parameters.
	 */
	public function get_embed_params() {
		$settings = $this->get_settings_for_display();

		$params = [];

		$params_dictionary = [];

		if ( 'youtube' === $settings['video_source'] ) {

			$params_dictionary = [
				'loop',
				'controls',
				'mute',
				'rel',
				'cc_load_policy',
			];

			if ( $settings['loop'] ) {
				$video_properties = Embed::get_video_properties( $settings['youtube_url'] );

				$params['playlist'] = $video_properties['video_id'];
			}

			$params['autoplay'] = 1;

			$params['wmode'] = 'opaque';

			$params['start'] = (int) $settings['start_time'];

			$params['end'] = (int) $settings['end_time'];
		} elseif ( 'vimeo' === $settings['video_source'] ) {

			$params_dictionary = [
				'loop',
				'mute' => 'muted',
				'vimeo_title' => 'title',
				'vimeo_portrait' => 'portrait',
				'vimeo_byline' => 'byline',
			];

			$params['color'] = str_replace( '#', '', $settings['color'] );

			$params['autopause'] = '0';
			$params['autoplay'] = '1';
		} elseif ( 'dailymotion' === $settings['video_source'] ) {

			$params_dictionary = [
				'controls',
				'mute',
				'showinfo' => 'ui-start-screen-info',
				'logo' => 'ui-logo',
			];

			$params['ui-highlight'] = str_replace( '#', '', $settings['color'] );

			$params['start'] = (int) $settings['start_time'];

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
	private function get_embed_options() {
		$settings = $this->get_settings_for_display();

		$embed_options = [];

		if ( 'youtube' === $settings['video_source'] ) {
			$embed_options['privacy'] = $settings['yt_privacy'];
		} elseif ( 'vimeo' === $settings['video_source'] ) {
			$embed_options['start'] = (int) $settings['start_time'];
		}

		//$embed_options['lazy_load'] = ! empty( $settings['lazy_load'] );

		return $embed_options;
	}

	protected function render_video() {
		$settings = $this->get_settings_for_display();

		if ( 'hosted' === $settings['video_source'] ) {

			$this->render_video_hosted();
			echo wp_kses_post( $this->render_video_overlay() );
			$this->render_controls();

		} else {
			$video_url_src = '';
			$thumb_size = '';
			if ( 'youtube' === $settings['video_source'] ) {
				$video_url_src = $settings['youtube_url'];
				$thumb_size = $settings['thumbnail_size'];
			} elseif ( 'vimeo' === $settings['video_source'] ) {
				$video_url_src = $settings['vimeo_url'];
			} elseif ( 'dailymotion' === $settings['video_source'] ) {
				$video_url_src = $settings['dailymotion_url'];
			}

			$this->add_render_attribute( 'video-container', 'class', [ 'pp-video-container' ] );
			$this->add_render_attribute( 'video-play', 'class', 'pp-video-play' );
			$this->add_render_attribute( 'video-player', 'class', 'pp-video-player' );
			$this->add_render_attribute( 'video', 'class', 'pp-video' );

			$gallery_settings['widget_id'] = $this->get_id();

			$this->add_render_attribute( [
				'video' => [
					'class'         => [ 'pp-video', 'pp-video-type-' . $settings['video_source'] ],
					'data-settings' => wp_json_encode( $gallery_settings ),
				],
			] );

			$embed_params = $this->get_embed_params();
			$embed_options = $this->get_embed_options();

			if ( preg_match( '/youtube\.com\/shorts\/(\w+\s*\/?)*([0-9]+)*(.*)$/i', $video_url_src, $matches ) ) {
				$video_id = $matches[1];
				$video_url = $this->get_yt_short_embed_url( $video_id, $embed_params, $embed_options );
			} else {
				$video_url = Embed::get_embed_url( $video_url_src, $embed_params, $embed_options );
			}

			$this->add_render_attribute( 'video-player', 'data-src', $video_url );

			$autoplay = ( 'yes' === $settings['autoplay'] ) ? '1' : '0';

			$this->add_render_attribute( 'video-play', 'data-autoplay', $autoplay );
			?>
			<div <?php $this->print_render_attribute_string( 'video' ); ?>>
				<div <?php $this->print_render_attribute_string( 'video-container' ); ?>>
					<div <?php $this->print_render_attribute_string( 'video-play' ); ?>>
						<?php
							// Video Overlay
							echo wp_kses_post( $this->render_video_overlay() );
						?>
						<div <?php $this->print_render_attribute_string( 'video-player' ); ?>>
							<img class="pp-video-thumb" src="<?php echo esc_url( $this->get_video_thumbnail( $thumb_size ) ); ?>">
							<?php $this->render_video_buttons(); ?>
						</div>
					</div>
				</div>
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
	private function get_yt_short_embed_url( $video_id, $embed_params, $embed_options ) {
		if ( 'yes' === $embed_options['privacy'] ) {
			$yt_url = 'https://www.youtube-nocookie.com/embed/' . $video_id;
		} else {
			$yt_url = 'https://www.youtube.com/embed/' . $video_id;
		}
		return add_query_arg( $embed_params, $yt_url );
	}

	protected function render_video_hosted() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'video', [
			'class' => [
				'pp-video-player-source',
			],
			'playsinline' => 'true',
			'webkit-playsinline' => 'true',
			'width' => '100%',
			'height' => '100%',
		] );

		if ( 'yes' === $settings['autoplay'] ) {
			$this->add_render_attribute( 'video', 'autoplay', 'true' );
		}

		if ( 'yes' === $settings['mute'] ) {
			$this->add_render_attribute( 'video', 'muted', 'true' );
		}

		if ( 'yes' === $settings['loop'] ) {
			$this->add_render_attribute( 'video', 'loop', 'true' );
		}

		if ( ! empty( $settings['cover_image']['url'] ) ) {
			$url = Group_Control_Image_Size::get_attachment_image_src( $settings['cover_image']['id'], 'cover_image', $settings );
			$this->add_render_attribute( 'video', 'poster', $url );
		}
		?>
		<div class="pp-video-player">
			<video <?php $this->print_render_attribute_string( 'video' ); ?>><?php

				$video_url = ( 'file' === $settings['video_source_mp4'] ) ? $settings['video_file_mp4']['url'] : $settings['video_url_mp4'];
				$video_url_m4v = ( 'file' === $settings['video_source_m4v'] ) ? $settings['video_file_m4v']['url'] : $settings['video_url_m4v'];
				$video_url_ogg = ( 'file' === $settings['video_source_ogg'] ) ? $settings['video_file_ogg']['url'] : $settings['video_url_ogg'];
				$video_url_webm = ( 'file' === $settings['video_source_webm'] ) ? $settings['video_file_webm']['url'] : $settings['video_url_webm'];

			if ( $video_url ) {
				$this->add_render_attribute( 'source-mp4', [
					'src' => $video_url,
					'type' => 'video/mp4',
				] );
				?><source <?php $this->print_render_attribute_string( 'source-mp4' ); ?>><?php } ?>

				<?php if ( $video_url_m4v ) {
					$this->add_render_attribute( 'source-m4v', [
						'src' => $video_url_m4v,
						'type' => 'video/m4v',
					] );
					?><source <?php $this->print_render_attribute_string( 'source-m4v' ); ?>><?php } ?>

				<?php if ( $video_url_ogg ) {
					$this->add_render_attribute( 'source-ogg', [
						'src' => $video_url_ogg,
						'type' => 'video/ogg',
					] );
					?><source <?php $this->print_render_attribute_string( 'source-wav' ); ?>><?php } ?>

				<?php if ( $video_url_webm ) {
					$this->add_render_attribute( 'source-webm', [
						'src' => $video_url_webm,
						'type' => 'video/webm',
					] );
					?><source <?php $this->print_render_attribute_string( 'source-webm' ); ?>><?php } ?>

			</video>
		</div><?php
	}

	protected function render_video_cover() {
		$settings = $this->get_settings_for_display();
		?>
		<div class="pp-video-player-cover pp-player-cover">
		</div>
		<?php
	}

	private static function render_video_icon( $network_name ) {
		$network_icon_data = self::get_network_icon_data( $network_name );

		if ( PP_Helper::is_feature_active( 'e_font_icon_svg' ) ) {
			if ( 'pause' === $network_name ) {
				$icon = Icons_Manager::render_font_icon( $network_icon_data, [ 'style' => 'display:none' ] );
			} else {
				$icon = Icons_Manager::render_font_icon( $network_icon_data );
			}
		} else {
			if ( 'pause' === $network_name ) {
				$icon = sprintf( '<i class="%s" style="display:none" aria-hidden="true"></i>', $network_icon_data['value'] );
			} else {
				$icon = sprintf( '<i class="%s" aria-hidden="true"></i>', $network_icon_data['value'] );
			}
		}

		\Elementor\Utils::print_unescaped_internal_string( $icon );
	}

	protected function render_video_buttons() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'play-icon', [
			'class' => [ 'pp-video-button', 'pp-player-controls-play', 'pp-play', 'pp-icon' ],
			'title' => esc_html__( 'Play / Pause', 'powerpack' ),
		] );

		if ( 'hosted' === $settings['video_source'] && 'show' === $settings['video_show_buttons'] ) {
			$show_buttons = true;
		} elseif ( 'hosted' !== $settings['video_source'] ) {
			$show_buttons = true;
		} else {
			$show_buttons = false;
		}

		if ( $show_buttons ) {
			?>
		<div class="pp-player-controls-overlay pp-video-player-overlay">
			<div class="pp-video-buttons">
				<?php if ( 'hosted' === $settings['video_source'] ) { ?>
				<span class="pp-player-controls-rewind pp-video-button pp-icon" title="<?php echo esc_attr__( 'Rewind', 'powerpack' ); ?>">
					<?php self::render_video_icon( 'redo' ); ?>
				</span>
				<?php } ?>

				<span <?php $this->print_render_attribute_string( 'play-icon' ); ?>>
					<?php self::render_video_icon( 'play' ); ?>
					<?php self::render_video_icon( 'pause' ); ?>
				</span>
			</div>
		</div>
			<?php
		}
	}

	protected function render_controls() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( [
			'controls' => [
				'class' => [
					'pp-video-player-controls',
				],
			],
			'bar-wrapper' => [
				'class' => [
					'pp-video-player-controls-bar-wrapper',
				],
			],
			'bar' => [
				'class' => [
					'pp-player-controls-bar',
				],
			],
			'control-play' => [
				'class' => [
					'pp-player-control',
					'pp-player-controls-play',
					'pp-player-control-icon',
					'fa',
					'fa-play',
				],
			],
		] );

		?>
		<div <?php $this->print_render_attribute_string( 'controls' ); ?>><?php

			$this->render_video_buttons();

		if ( 'show' === $settings['show_bar'] ) {
			?><div <?php $this->print_render_attribute_string( 'bar-wrapper' ); ?>>
					<div <?php $this->print_render_attribute_string( 'bar' ); ?>>

					<?php if ( 'yes' !== $settings['restart_on_pause'] && 'show' === $settings['show_rewind'] ) {
							$this->add_render_attribute( 'control-rewind', [
								'class' => [
									'pp-player-control',
									'pp-player-controls-rewind',
									'pp-player-control-icon',
									'fa',
									'fa-redo',
								],
							] );
						?><div <?php $this->print_render_attribute_string( 'control-rewind' ); ?>></div><?php } ?>

						<div <?php $this->print_render_attribute_string( 'control-play' ); ?>></div>

						<?php if ( $settings['show_time'] ) {
							$this->add_render_attribute( 'control-time', [
								'class' => [
									'pp-player-control',
									'pp-player-control-indicator',
									'pp-player-controls-time',
								],
							] );
							?><div <?php $this->print_render_attribute_string( 'control-time' ); ?>>00:00</div><?php } ?>

						<?php if ( $settings['show_progress'] ) {
							$this->add_render_attribute( [
								'control-progress' => [
									'class' => [
										'pp-player-control',
										'pp-player-controls-progress',
										'pp-player-control-progress',
									],
								],
								'control-progress-time' => [
									'class' => [
										'pp-player-controls-progress-time',
										'pp-player-control-progress-inner',
									],
								],
								'control-progress-track' => [
									'class' => [
										'pp-player-control-progress-inner',
										'pp-player-control-progress-track',
									],
								],
							] );
							?><div <?php $this->print_render_attribute_string( 'control-progress' ); ?>>
							<div <?php $this->print_render_attribute_string( 'control-progress-time' ); ?>></div>
							<div <?php $this->print_render_attribute_string( 'control-progress-track' ); ?>></div>
						</div><?php } ?>

						<?php if ( $settings['show_duration'] ) {
							$this->add_render_attribute( 'control-duration', [
								'class' => [
									'pp-player-control',
									'pp-player-controls-duration',
									'pp-player-control-indicator',
								],
							] );
							?><div <?php $this->print_render_attribute_string( 'control-duration' ); ?>>00:00</div><?php } ?>

						<?php if ( $settings['show_volume'] ) {
							$this->add_render_attribute( 'control-volume', [
								'class' => [
									'pp-player-control',
									'pp-player-controls-volume',
								],
							] );
							?><div <?php $this->print_render_attribute_string( 'control-volume' ); ?>>

							<?php if ( $settings['show_volume_icon'] ) {
								if ( 'yes' === $settings['mute'] ) {
									$vol_icon = 'fa-volume-mute';
								} else {
									$vol_icon = 'fa-volume-up';
								}

								$this->add_render_attribute( 'control-volume-icon', [
									'class' => [
										'pp-player-controls-volume-icon',
										'pp-player-control-icon',
										'fa',
										$vol_icon,
									],
								] );
								?><div <?php $this->print_render_attribute_string( 'control-volume-icon' ); ?>></div><?php } ?>

							<?php if ( $settings['show_volume_bar'] ) {
								$this->add_render_attribute( [
									'control-volume-bar' => [
										'class' => [
											'pp-player-control',
											'pp-player-controls-volume-bar',
											'pp-player-controls-progress',
										],
									],
									'control-volume-bar-amount' => [
										'class' => [
											'pp-player-controls-volume-bar-amount',
											'pp-player-control-progress-inner',
										],
									],
									'control-volume-bar-track' => [
										'class' => [
											'pp-player-controls-volume-bar-track',
											'pp-player-control-progress-inner',
											'pp-player-controls-progress-track',
										],
									],
								] );
								?><div <?php $this->print_render_attribute_string( 'control-volume-bar' ); ?>>
								<div <?php $this->print_render_attribute_string( 'control-volume-bar-amount' ); ?>></div>
								<div <?php $this->print_render_attribute_string( 'control-volume-bar-track' ); ?>></div>
							</div><?php } ?>

						</div><?php } ?>

						<?php if ( $settings['show_fs'] ) {
							$this->add_render_attribute( 'control-fullscreen', [
								'class' => [
									'pp-player-control',
									'pp-player-controls-fs',
									'pp-player-control-icon',
									'fa',
									'fa-expand',
								],
							] );
							?><div <?php $this->print_render_attribute_string( 'control-fullscreen' ); ?>></div><?php } ?>

					</div>
				</div>
			<?php } ?>
		</div>
		<?php
	}

	protected function render_video_overlay() {
		$this->add_render_attribute( 'overlay', 'class', [
			'pp-image-overlay',
			'pp-video-overlay',
		] );

		return '<div ' . wp_kses_post( $this->get_render_attribute_string( 'overlay' ) ) . '></div>';
	}

	/**
	 * Returns Video Thumbnail.
	 *
	 * @access protected
	 */
	protected function get_video_thumbnail( $thumb_size ) {
		$settings = $this->get_settings_for_display();

		$thumb_url  = '';
		$video_id   = $this->get_video_id();

		if ( 'yes' === $settings['cover_image_show'] && $settings['cover_image']['url'] ) {

			$thumb_url = $settings['cover_image']['url'];

		} elseif ( 'youtube' === $settings['video_source'] ) {

			if ( $video_id ) {
				$thumb_url = 'https://i.ytimg.com/vi/' . $video_id . '/' . $thumb_size . '.jpg';
			}
		} elseif ( 'vimeo' === $settings['video_source'] ) {

			if ( $video_id ) {
				$vimeo = unserialize( file_get_contents( "https://vimeo.com/api/v2/video/$video_id.php" ) );
				$thumb_url = $vimeo[0]['thumbnail_large'];
			}
		} elseif ( 'dailymotion' === $settings['video_source'] ) {

			if ( $video_id ) {
				$dailymotion = 'https://api.dailymotion.com/video/' . $video_id . '?fields=thumbnail_url';
				$get_thumbnail = json_decode( file_get_contents( $dailymotion ), true );
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
	protected function get_video_id() {
		$settings = $this->get_settings_for_display();

		$video_id = '';

		if ( 'youtube' === $settings['video_source'] ) {
			$url = $settings['youtube_url'];

			if ( preg_match( '#(?<=v=|v\/|vi=|vi\/|youtu.be\/)[a-zA-Z0-9_-]{11}#', $url, $matches ) ) {
				$video_id = $matches[0];
			} else {
				if ( preg_match( '/youtube\.com\/shorts\/(\w+\s*\/?)*([0-9]+)*(.*)$/i', $url, $matches ) ) {
					$video_id = $matches[1];
				}
			}
		} elseif ( 'vimeo' === $settings['video_source'] ) {
			$url = $settings['vimeo_url'];

			$video_id = preg_replace( '/[^\/]+[^0-9]|(\/)/', '', rtrim( $url, '/' ) );

		} elseif ( 'dailymotion' === $settings['video_source'] ) {
			$url = $settings['dailymotion_url'];

			if ( preg_match( '/^.+dailymotion.com\/(?:video|swf\/video|embed\/video|hub|swf)\/([^&?]+)/', $url, $matches ) ) {
				$video_id = $matches[1];
			}
		}

		return $video_id;
	}

	protected function get_device_type() {
		$settings = $this->get_settings_for_display();

		$device_type = $settings['device_type'];

		if ( 'phone' === $settings['device_type'] ) {
			$device_type = $settings['mobile_device_type'];
		}

		return $device_type;
	}

	/**
	 * Render Slider output.
	 *
	 * @access protected
	 */
	protected function render_slider() {
		$settings = $this->get_settings_for_display();
		$gallery  = $settings['gallery_images'];

		foreach ( $gallery as $index => $item ) {
			$image_url = Group_Control_Image_Size::get_attachment_image_src( $item['id'], 'image', $settings );
			
			echo '<div class="pp-device-image-slide pp-swiper-slide swiper-slide"><figure><img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( Control_Media::get_image_alt( $item ) ) . '" /></figure></div>';
		}
	}

	/**
	 * Slider Settings.
	 *
	 * @access public
	 */
	public function slider_settings() {
		$settings = $this->get_settings_for_display();

		$slider_options = array(
			'direction'      => 'horizontal',
			'speed'          => ( '' !== $settings['animation_speed'] ) ? $settings['animation_speed'] : 600,
			'effect'         => $settings['effect'],
			'slidesPerView'  => 1,
			'slidesPerGroup' => 1,
			'centerMode'     => true,
			'loop'           => ( 'yes' === $settings['infinite_loop'] ) ? 'yes' : '',
		);

		$slider_options['fadeEffect'] = array(
			'crossFade' => true,
		);

		$autoplay_speed = 999999;

		if ( 'yes' === $settings['slider_autoplay'] ) {
			$slider_options['autoplay'] = 'yes';

			if ( '' !== $settings['autoplay_speed'] ) {
				$autoplay_speed = $settings['autoplay_speed'];
			}

			$slider_options['autoplay_speed'] = $autoplay_speed;
			$slider_options['pause_on_interaction'] = ( 'yes' === $settings['pause_on_interaction'] ) ? 'yes' : '';
		}

		if ( 'yes' === $settings['arrows'] ) {
			$slider_options['show_arrows'] = true;
		}

		$this->add_render_attribute(
			'device-slider',
			array(
				'data-slider-settings' => wp_json_encode( $slider_options ),
			)
		);
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
	 * Render widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( [
			'device-container' => [
				'class' => [
					'pp-device-container',
				],
			],
			'device-wrap' => [
				'class' => [
					'pp-device-wrap',
				],
			],
			'device' => [
				'class' => [
					'pp-device',
				],
			],
			'device-media' => [
				'class' => [
					'pp-device-media',
				],
			],
			'device-media-inner' => [
				'class' => [
					'pp-device-media-inner',
				],
			],
			'screen' => [
				'class' => [
					'pp-device-screen',
					'pp-device-screen-' . $settings['media_type'],
				],
			],
		] );

		if ( 'phone' === $settings['device_type'] && ( 'iphone-13' === $settings['mobile_device_type'] || 'iphone-16' === $settings['mobile_device_type'] ) ) {
			$this->add_render_attribute( 'device-container', 'class', 'pp-device-type-' . $settings['mobile_device_type'] );
		} else {
			$this->add_render_attribute( 'device-container', 'class', 'pp-device-type-' . $settings['device_type'] );
		}

		if ( 'image' === $settings['media_type'] && 'slider' === $settings['image_type'] ) {
			$this->add_render_attribute( 'device-slider', 'class', [ 'pp-device-slider', 'pp-swiper-slider', 'swiper' ] );
			$this->add_render_attribute( 'device-media', 'class', [ 'pp-device-slider-wrapper' ] );

			$this->slider_settings();

			if ( is_rtl() ) {
				$this->add_render_attribute( 'device-media-inner', 'dir', 'rtl' );
			}
		}

		if ( 'show' !== $settings['video_show_buttons'] ) {
			$this->add_render_attribute( 'screen', 'class', 'pp-device-screen-play' );
		}

		if ( 'phone' === $settings['device_type'] || 'tablet' === $settings['device_type'] ) {
			$this->add_render_attribute( 'device-container', 'class', 'pp-device-orientation-' . $settings['orientation'] );
		}

		if ( 'yes' === $settings['orientation_control'] ) {
			$this->add_render_attribute( 'device', 'class', 'pp-has-orientation-control' );
		}

		if ( 'slider' !== $settings['image_type'] && 'yes' === $settings['scrollable'] ) {
			$this->add_render_attribute( 'device', 'class', 'pp-scrollable' );
		}
		?>
		<div <?php $this->print_render_attribute_string( 'device-container' ); ?>>
			<div <?php $this->print_render_attribute_string( 'device-wrap' ); ?>>
				<div <?php $this->print_render_attribute_string( 'device' ); ?>>
					<div class="pp-device-body">
						<?php require POWERPACK_ELEMENTS_PATH . 'assets/images/devices/' . $this->get_device_type() . '.svg'; ?>
					</div>
					<div <?php $this->print_render_attribute_string( 'device-media' ); ?>>
						<div <?php $this->print_render_attribute_string( 'device-media-inner' ); ?>>
							<div <?php $this->print_render_attribute_string( 'screen' ); ?>>
								<?php
								if ( 'image' === $settings['media_type'] ) {
									if ( 'slider' === $settings['image_type'] ) {
										?>
										<div class="swiper-container-wrap">
											<div <?php $this->print_render_attribute_string( 'device-slider' ); ?>>
												<div class="swiper-wrapper">
													<?php $this->render_slider(); ?>
												</div>
											</div>
											<?php
											if ( 'image' === $settings['media_type'] && 'slider' === $settings['image_type'] ) {
												$this->render_arrows();
											}
											?>
										</div>
										<?php
									} else {
										$this->render_image();
									}
								} elseif ( 'video' === $settings['media_type'] ) {
									$this->render_video();
								}
								?>
							</div>
						</div>
					</div>
					<?php if ( 'yes' === $settings['orientation_control'] ) { ?>
						<?php
							$this->add_render_attribute( 'device-icon', [
								'class' => 'fas fa-mobile',
								'aria-hidden' => 'true',
							]);

							$this->add_render_attribute( 'device-icon', 'class', 'pp-mobile-icon-' . $settings['orientation'] );
						?>
						<div class="pp-device-orientation">
							<i <?php $this->print_render_attribute_string( 'device-icon' ); ?>></i>
						</div>
					<?php } ?>
				</div>
			</div>
		</div>
		<?php
	}
}
