<?php
namespace PowerpackElements\Modules\Video\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Modules\Video\Module;
use PowerpackElements\Classes\PP_Admin_Settings;

// Elementor Classes.
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Icons_Manager;
use Elementor\Repeater;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Embed;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Video Gallery Widget
 */
class Video_Gallery extends Powerpack_Widget {

	/**
	 * Retrieve video gallery widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Video_Gallery' );
	}

	/**
	 * Retrieve video gallery widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Video_Gallery' );
	}

	/**
	 * Retrieve video gallery widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Video_Gallery' );
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
		return parent::get_widget_keywords( 'Video_Gallery' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the video gallery widget depended on.
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
				'isotope',
				'swiper',
				'jquery-resize',
				'imagesloaded',
				'pp-video-gallery',
			];
		}

		$settings = $this->get_settings_for_display();
		$scripts = [];

		if ( 'lightbox' === $settings['click_action'] ) {
			array_push( $scripts, 'jquery-fancybox', 'pp-video-gallery' );
		}

		if ( 'grid' === $settings['layout'] || 'yes' === $settings['filter_enable'] || 'yes' === $settings['pagination'] ) {
			array_push( $scripts, 'isotope', 'imagesloaded', 'pp-video-gallery' );
		}

		if ( 'carousel' === $settings['layout'] ) {
			array_push( $scripts, 'swiper', 'jquery-resize', 'pp-video-gallery' );
		}

		return $scripts;
	}

	/**
	 * Retrieve the list of styles the video gallery widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_style_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return array(
				'fancybox',
				'pp-elementor-grid',
				'pp-filter-animations',
				'widget-pp-video-gallery'
			);
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'widget-pp-video-gallery' ];

		if ( 'grid' === $settings['layout'] && 'yes' === $settings['filter_enable'] ) {
			array_push( $styles, 'pp-elementor-grid' );

			if ( 'none' !== $settings['pointer'] ) {
				array_push( $styles, 'pp-filter-animations' );
			}
		}

		if ( 'carousel' === $settings['layout'] ) {
			array_push( $styles, 'e-swiper', 'pp-swiper' );
		}

		if ( 'lightbox' === $settings['click_action'] ) {
			array_push( $styles, 'fancybox' );
		}

		return $styles;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register video gallery widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_gallery_controls();
		$this->register_content_filter_controls();
		$this->register_content_play_icon_controls();
		$this->register_content_settings_controls();
		$this->register_content_load_more_controls();
		$this->register_content_carousel_controls();

		/* Style Tab */
		$this->register_style_layout_controls();
		$this->register_style_overlay_controls();
		$this->register_style_play_icon_controls();
		$this->register_style_content_controls();
		$this->register_style_filter_controls();
		$this->register_style_arrows_controls();
		$this->register_style_pagination_dots_controls();
		$this->register_style_pagination_fraction_controls();
		$this->register_style_load_more_controls();
	}

	protected function register_content_gallery_controls() {
		/**
		 * Content Tab: Gallery
		 */
		$this->start_controls_section(
			'section_gallery',
			array(
				'label' => esc_html__( 'Gallery', 'powerpack' ),
			)
		);

		$this->add_control(
			'source',
			array(
				'label'   => esc_html__( 'Source', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'custom',
				'options' => array(
					'custom'      => esc_html__( 'Custom', 'powerpack' ),
					'yt-playlist' => esc_html__( 'YouTube Playlist', 'powerpack' ),
					'yt-channel'  => esc_html__( 'YouTube Channel', 'powerpack' ),
				),
			)
		);

		$admin_link = PP_Admin_Settings::get_form_action( '&tab=integration' );
		if ( ! $this->get_youtube_api() ) {
			$this->add_control(
				'youtube_api_error_msg',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						/* translators: 1: Link opening tag, 2: Link closing tag. */
						esc_html__( 'To display videos from YouTube Playlist or Channel, you must have a YouTube API key. %1$sClick here%2$s to setup your YouTube API key.', 'powerpack' ),
						sprintf( '<a href="%s" target="_blank">', $admin_link ),
						'</a>'
					),
					'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
					'condition'       => array(
						'source' => [ 'yt-playlist', 'yt-channel' ],
					),
				)
			);
		}

		$this->add_control(
			'yt_playlist_id',
			array(
				'label'       => esc_html__( 'YouTube Playlist ID', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => array(
					'active'     => true,
				),
				'placeholder' => esc_html__( 'Enter YouTube Playlist ID', 'powerpack' ),
				'default'     => '',
				'label_block' => true,
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'source' => [ 'yt-playlist' ],
				),
			)
		);

		$this->add_control(
			'yt_channel_id',
			array(
				'label'       => esc_html__( 'YouTube channel ID', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => array(
					'active'     => true,
				),
				'placeholder' => esc_html__( 'Enter YouTube channel ID', 'powerpack' ),
				'default'     => '',
				'label_block' => true,
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'source' => [ 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'yt_vides_count',
			array(
				'label'       => esc_html__( 'Number of Videos', 'powerpack' ),
				'description' => esc_html__( 'PowerPack allows fetching 200 videos from an API due to performance issues.', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 9,
				'min'         => 1,
				'max'         => 200,
				'step'        => 1,
				'condition'   => array(
					'source' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'yt_video_title_show',
			array(
				'label'        => esc_html__( 'Show Video Title', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'no',
				'condition'    => array(
					'source' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'yt_video_title',
			[
				'label'                 => esc_html__( 'Video Title', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'label_block'           => true,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
				'condition'   => array(
					'source'              => [ 'yt-playlist', 'yt-channel' ],
					'yt_video_title_show' => 'yes',
				),
			]
		);

		$this->add_control(
			'yt_title_length',
			array(
				'label'       => esc_html__( 'Title Length', 'powerpack' ),
				'title'       => esc_html__( 'Words', 'powerpack' ),
				'description' => esc_html__( 'Number of words to be displayed from the video title', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 10,
				'min'         => 0,
				'step'        => 1,
				'condition'   => array(
					'source'              => [ 'yt-playlist', 'yt-channel' ],
					'yt_video_title_show' => 'yes',
				),
			)
		);

		$this->add_control(
			'yt_video_description_show',
			array(
				'label'        => esc_html__( 'Show Video Description', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'no',
				'condition'    => array(
					'source' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'yt_video_description',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::TEXTAREA,
				'label_block'           => true,
				'rows'                  => 3,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
				'condition'   => array(
					'source'                    => [ 'yt-playlist', 'yt-channel' ],
					'yt_video_description_show' => 'yes',
				),
			]
		);

		$this->add_control(
			'yt_content_length',
			array(
				'label'       => esc_html__( 'Description Length', 'powerpack' ),
				'title'       => esc_html__( 'Words', 'powerpack' ),
				'description' => esc_html__( 'Number of words to be displayed from the video description', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 30,
				'min'         => 0,
				'step'        => 1,
				'condition'   => array(
					'source'                    => [ 'yt-playlist', 'yt-channel' ],
					'yt_video_description_show' => 'yes',
				),
			)
		);

		$this->add_control(
			'yt_thumbnail_size',
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
				'condition'   => array(
					'source' => [ 'yt-playlist', 'yt-channel' ],
				),
			]
		);

		$this->add_control(
			'videos_refresh_time',
			array(
				'label'   => esc_html__( 'Refresh Videos after', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'day',
				'options' => array(
					'hour'  => esc_html__( 'Hour', 'powerpack' ),
					'day'   => esc_html__( 'Day', 'powerpack' ),
					'week'  => esc_html__( 'Week', 'powerpack' ),
					'month' => esc_html__( 'Month', 'powerpack' ),
					'year'  => esc_html__( 'Year', 'powerpack' ),
				),
				'condition'   => array(
					'source' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'tabs_video_gallery' );

		$repeater->start_controls_tab(
			'tab_content',
			array(
				'label' => esc_html__( 'Content', 'powerpack' ),
			)
		);

		$repeater->add_control(
			'video_source',
			array(
				'label'   => esc_html__( 'Source', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'youtube',
				'options' => array(
					'youtube'     => esc_html__( 'YouTube', 'powerpack' ),
					'vimeo'       => esc_html__( 'Vimeo', 'powerpack' ),
					'dailymotion' => esc_html__( 'Dailymotion', 'powerpack' ),
					'hosted'      => esc_html__( 'Self Hosted', 'powerpack' ),
				),
			)
		);

		$repeater->add_control(
			'insert_url',
			[
				'label'     => esc_html__( 'External URL', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'ai'        => [
					'active' => false,
				],
				'condition' => [
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
				'ai'         => [
					'active' => false,
				],
				'condition'  => [
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
				'ai'           => [
					'active' => false,
				],
				'condition'    => [
					'video_source' => 'hosted',
					'insert_url'   => 'yes',
				],
			]
		);

		$repeater->add_control(
			'start',
			[
				'label'       => esc_html__( 'Start Time', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'description' => esc_html__( 'Specify a start time (in seconds)', 'powerpack' ),
				'dynamic'     => [
					'active' => true,
				],
				'condition'   => [
					'video_source' => 'hosted',
				],
			]
		);

		$repeater->add_control(
			'end',
			[
				'label'       => esc_html__( 'End Time', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'description' => esc_html__( 'Specify an end time (in seconds)', 'powerpack' ),
				'dynamic'     => [
					'active' => true,
				],
				'condition'   => [
					'video_source' => 'hosted',
				],
			]
		);

		$repeater->add_control(
			'youtube_url',
			array(
				'label'       => esc_html__( 'URL', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => array(
					'active'     => true,
					'categories' => array(
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					),
				),
				'placeholder' => esc_html__( 'Enter your YouTube URL', 'powerpack' ),
				'default'     => 'https://www.youtube.com/watch?v=XHOmBV4js_E',
				'label_block' => true,
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'video_source' => 'youtube',
				),
			)
		);

		$repeater->add_control(
			'vimeo_url',
			array(
				'label'       => esc_html__( 'URL', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => array(
					'active'     => true,
					'categories' => array(
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					),
				),
				'placeholder' => esc_html__( 'Enter your Vimeo URL', 'powerpack' ),
				'default'     => 'https://vimeo.com/235215203',
				'label_block' => true,
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'video_source' => 'vimeo',
				),
			)
		);

		$repeater->add_control(
			'dailymotion_url',
			array(
				'label'       => esc_html__( 'URL', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => array(
					'active'     => true,
					'categories' => array(
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					),
				),
				'placeholder' => esc_html__( 'Enter your Dailymotion URL', 'powerpack' ),
				'default'     => 'https://www.dailymotion.com/video/x6tqhqb',
				'label_block' => true,
				'ai'          => [
					'active' => false,
				],
				'condition'   => array(
					'video_source' => 'dailymotion',
				),
			)
		);

		$repeater->add_control(
			'cc_load_policy',
			[
				'label'     => esc_html__( 'Captions', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'condition' => array(
					'video_source' => 'youtube',
				),
			]
		);

		$repeater->add_control(
			'filter_label',
			[
				'label'                 => esc_html__( 'Filter Label', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
			]
		);

		$repeater->add_control(
			'video_title',
			[
				'label'                 => esc_html__( 'Video Title', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'label_block'           => true,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
			]
		);

		$repeater->add_control(
			'video_description',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::TEXTAREA,
				'label_block'           => true,
				'rows'                  => 3,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
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
				'condition'             => array(
					'video_source' => 'youtube',
				),
			]
		);

		$repeater->add_control(
			'custom_thumbnail',
			[
				'label'                 => esc_html__( 'Custom Thumbnail', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
			]
		);

		$repeater->add_control(
			'custom_image',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'dynamic'               => array(
					'active' => true,
				),
				'conditions'            => [
					'terms' => [
						[
							'name'      => 'custom_thumbnail',
							'operator'  => '==',
							'value'     => 'yes',
						],
					],
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab(
			'tab_schema',
			array(
				'label' => esc_html__( 'Schema', 'powerpack' ),
			)
		);

		$repeater->add_control(
			'video_schema_title',
			[
				'label'                 => esc_html__( 'Video Title', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'label_block'           => true,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
			]
		);

		$repeater->add_control(
			'video_schema_description',
			[
				'label'                 => esc_html__( 'Description', 'powerpack' ),
				'type'                  => Controls_Manager::TEXTAREA,
				'label_block'           => true,
				'rows'                  => 3,
				'default'               => '',
				'placeholder'           => '',
				'dynamic'               => [
					'active' => true,
				],
			]
		);

		$repeater->add_control(
			'video_schema_image',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'dynamic'               => array(
					'active' => true,
				),
			]
		);

		$repeater->add_control(
			'video_schema_upload_date',
			[
				'label'                 => __( 'Upload Date & Time', 'powerpack' ),
				'type'                  => Controls_Manager::DATE_TIME,
				'default'               => gmdate( 'Y-m-d H:i' ),
			]
		);

		$repeater->end_controls_tab();

		$repeater->end_controls_tabs();

		$this->add_control(
			'gallery_videos',
			array(
				'label'       => '',
				'type'        => Controls_Manager::REPEATER,
				'default'     => array(
					array(
						'video_source' => 'youtube',
						'youtube_url'  => 'https://www.youtube.com/watch?v=XHOmBV4js_E',
						'filter_label' => 'YouTube',
					),
					array(
						'video_source' => 'vimeo',
						'vimeo_url'    => 'https://vimeo.com/235215203',
						'filter_label' => 'Vimeo',
					),
					array(
						'video_source'    => 'dailymotion',
						'dailymotion_url' => 'https://www.dailymotion.com/video/x6tqhqb',
						'filter_label'    => 'Dailymotion',
					),
					array(
						'video_source' => 'vimeo',
						'vimeo_url'    => 'https://vimeo.com/235215203',
						'filter_label' => 'Vimeo',
					),
					array(
						'video_source'    => 'dailymotion',
						'dailymotion_url' => 'https://www.dailymotion.com/video/x6tqhqb',
						'filter_label'    => 'Dailymotion',
					),
					array(
						'video_source' => 'youtube',
						'youtube_url'  => 'https://www.youtube.com/watch?v=XHOmBV4js_E',
						'filter_label' => 'YouTube',
					),
				),
				'fields'      => $repeater->get_controls(),
				'title_field' => '{{{ video_title }}}',
				'condition'   => array(
					'source' => [ 'custom' ],
				),
			)
		);

		$this->add_control(
			'enable_schema',
			[
				'label'        => esc_html__( 'Enable Schema', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'return_value' => 'yes',
				'separator'    => 'before',
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_filter_controls() {
		/**
		 * Content Tab: Filter
		 */
		$this->start_controls_section(
			'section_filter',
			array(
				'label'     => esc_html__( 'Filter', 'powerpack' ),
				'condition' => array(
					'layout' => 'grid',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'filter_enable',
			array(
				'label'     => esc_html__( 'Enable Filter', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => '',
				'condition' => array(
					'layout' => 'grid',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'filter_all_label',
			array(
				'label'     => esc_html__( '"All" Filter Label', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => esc_html__( 'All', 'powerpack' ),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_responsive_control(
			'filter_alignment',
			array(
				'label'       => esc_html__( 'Alignment', 'powerpack' ),
				'label_block' => false,
				'type'        => Controls_Manager::CHOOSE,
				'default'     => 'center',
				'options'     => array(
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
				'selectors'   => array(
					'{{WRAPPER}} .pp-gallery-filters' => 'text-align: {{VALUE}};',
				),
				'condition'   => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				),
			)
		);

		$this->add_control(
			'pointer',
			[
				'label'          => esc_html__( 'Pointer', 'powerpack' ),
				'type'           => Controls_Manager::SELECT,
				'default'        => 'underline',
				'options'        => [
					'none'        => esc_html__( 'None', 'powerpack' ),
					'underline'   => esc_html__( 'Underline', 'powerpack' ),
					'overline'    => esc_html__( 'Overline', 'powerpack' ),
					'double-line' => esc_html__( 'Double Line', 'powerpack' ),
					'framed'      => esc_html__( 'Framed', 'powerpack' ),
					'background'  => esc_html__( 'Background', 'powerpack' ),
					'text'        => esc_html__( 'Text', 'powerpack' ),
				],
				'style_transfer' => true,
				'condition'      => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				),
			]
		);

		$this->add_control(
			'animation_line',
			[
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'fade',
				'options'   => [
					'fade'     => 'Fade',
					'slide'    => 'Slide',
					'grow'     => 'Grow',
					'drop-in'  => 'Drop In',
					'drop-out' => 'Drop Out',
					'none'     => 'None',
				],
				'condition' => [
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'pointer'       => [ 'underline', 'overline', 'double-line' ],
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				],
			]
		);

		$this->add_control(
			'animation_framed',
			[
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'fade',
				'options'   => [
					'fade'    => 'Fade',
					'grow'    => 'Grow',
					'shrink'  => 'Shrink',
					'draw'    => 'Draw',
					'corners' => 'Corners',
					'none'    => 'None',
				],
				'condition' => [
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'pointer'       => 'framed',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				],
			]
		);

		$this->add_control(
			'animation_background',
			[
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'fade',
				'options'   => [
					'fade' => 'Fade',
					'grow' => 'Grow',
					'shrink' => 'Shrink',
					'sweep-left' => 'Sweep Left',
					'sweep-right' => 'Sweep Right',
					'sweep-up' => 'Sweep Up',
					'sweep-down' => 'Sweep Down',
					'shutter-in-vertical' => 'Shutter In Vertical',
					'shutter-out-vertical' => 'Shutter Out Vertical',
					'shutter-in-horizontal' => 'Shutter In Horizontal',
					'shutter-out-horizontal' => 'Shutter Out Horizontal',
					'none' => 'None',
				],
				'condition' => [
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'pointer'       => 'background',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				],
			]
		);

		$this->add_control(
			'animation_text',
			[
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'grow',
				'options'   => [
					'grow'   => 'Grow',
					'shrink' => 'Shrink',
					'sink'   => 'Sink',
					'float'  => 'Float',
					'skew'   => 'Skew',
					'rotate' => 'Rotate',
					'none'   => 'None',
				],
				'condition' => [
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'pointer'       => 'text',
					'source!' => [ 'yt-playlist', 'yt-channel' ],
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_play_icon_controls() {
		/**
		 * Content Tab: Play Icon
		 */
		$this->start_controls_section(
			'section_play_icon_settings',
			array(
				'label' => esc_html__( 'Play Icon', 'powerpack' ),
			)
		);

		$this->add_control(
			'play_icon_type',
			array(
				'label'       => esc_html__( 'Icon Type', 'powerpack' ),
				'label_block' => false,
				'toggle'      => false,
				'type'        => Controls_Manager::CHOOSE,
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
			)
		);

		$this->add_control(
			'select_play_icon',
			array(
				'label'            => esc_html__( 'Select Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'play_icon',
				'default'          => array(
					'value'   => 'fas fa-play-circle',
					'library' => 'fa-solid',
				),
				'recommended'      => array(
					'fa-regular' => array(
						'play-circle',
					),
					'fa-solid'   => array(
						'play',
						'play-circle',
					),
				),
				'condition'        => array(
					'play_icon_type' => 'icon',
				),
			)
		);

		$this->add_control(
			'play_icon_image',
			array(
				'label'     => esc_html__( 'Select Image', 'powerpack' ),
				'type'      => Controls_Manager::MEDIA,
				'default'   => array(
					'url' => Utils::get_placeholder_image_src(),
				),
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'play_icon_type' => 'image',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_settings_controls() {
		/**
		 * Content Tab: Gallery Settings
		 */
		$this->start_controls_section(
			'section_settings',
			array(
				'label' => esc_html__( 'Gallery Settings', 'powerpack' ),
			)
		);

		$this->add_control(
			'layout',
			array(
				'label'              => esc_html__( 'Layout', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'grid',
				'options'            => array(
					'grid'     => esc_html__( 'Grid', 'powerpack' ),
					'carousel' => esc_html__( 'Carousel', 'powerpack' ),
				),
				'frontend_available' => true,
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
					'7' => '7',
					'8' => '8',
				),
				'prefix_class'   => 'elementor-grid%s-',
				'render_type'    => 'template',
			)
		);

		$this->add_control(
			'aspect_ratio',
			array(
				'label'                => esc_html__( 'Aspect Ratio', 'powerpack' ),
				'type'                 => Controls_Manager::SELECT,
				'options'              => array(
					'169' => '16:9',
					'219' => '21:9',
					'916' => '9:16',
					'43'  => '4:3',
					'32'  => '3:2',
					'11'  => '1:1',
				),
				'selectors_dictionary'  => [
					'169' => '1.77777', // 16 / 9
					'219' => '2.33333', // 21 / 9
					'43'  => '1.33333', // 4 / 3
					'32'  => '1.5', // 3 / 2
					'11'  => '1', // 1 / 1
					'916' => '0.5625', // 9 / 16
				],
				'default'              => '169',
				'selectors'            => [
					'{{WRAPPER}} .pp-video-container' => 'aspect-ratio: {{VALUE}}',
				],
			)
		);

		$this->add_control(
			'preload',
			array(
				'label'       => esc_html__( 'Preload', 'powerpack' ),
				'description' => esc_html__( 'Use in case of self hosted video', 'powerpack' ),
				'type'        => Controls_Manager::SELECT,
				'options'     => array(
					'auto'     => 'Auto',
					'metadata' => 'Meta data',
					'none'     => 'None',
				),
				'default'     => 'auto',
			)
		);

		$this->add_control(
			'mute',
			array(
				'label'        => esc_html__( 'Mute', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'click_action',
			array(
				'label'   => esc_html__( 'Click Action', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'inline',
				'options' => array(
					'inline'   => esc_html__( 'Play Inline', 'powerpack' ),
					'lightbox' => esc_html__( 'Play in Lightbox', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'ordering',
			array(
				'label'   => esc_html__( 'Ordering', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					''       => esc_html__( 'Default', 'powerpack' ),
					'random' => esc_html__( 'Random', 'powerpack' ),
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_load_more_controls() {
		/**
		 * Content Tab: Load More Button
		 */
		$this->start_controls_section(
			'section_pagination',
			array(
				'label'     => esc_html__( 'Load More Button', 'powerpack' ),
				'condition' => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
				),
			)
		);

		$this->add_control(
			'pagination',
			array(
				'label'     => esc_html__( 'Load More Button', 'powerpack' ),
				'type'      => Controls_Manager::SWITCHER,
				'default'   => '',
				'condition' => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
				),
			)
		);

		$this->add_control(
			'images_per_page',
			array(
				'label'     => esc_html__( 'Images Per Page', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => 6,
				'ai'        => [
					'active' => false,
				],
				'condition' => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
					'pagination' => 'yes',
				),
			)
		);

		$this->add_control(
			'load_more_text',
			array(
				'label'     => esc_html__( 'Button Text', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => esc_html__( 'Load More', 'powerpack' ),
				'condition' => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
					'pagination' => 'yes',
				),
			)
		);

		$this->add_control(
			'select_load_more_icon',
			array(
				'label'            => esc_html__( 'Button Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'load_more_icon',
				'condition'        => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
					'pagination' => 'yes',
				),
			)
		);

		$this->add_control(
			'button_icon_position',
			array(
				'label'     => esc_html__( 'Icon Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'after',
				'options'   => array(
					'after'  => esc_html__( 'After', 'powerpack' ),
					'before' => esc_html__( 'Before', 'powerpack' ),
				),
				'condition' => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
					'pagination' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'load_more_align',
			array(
				'label'     => esc_html__( 'Alignment', 'powerpack' ),
				'type'      => Controls_Manager::CHOOSE,
				'options'   => array(
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
				'default'   => 'center',
				'selectors' => array(
					'{{WRAPPER}} .pp-video-gallery-pagination' => 'text-align: {{VALUE}};',
				),
				'condition' => array(
					'layout!' => 'carousel',
					'filter_enable!' => 'yes',
					'pagination' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_content_carousel_controls() {
		/**
		 * Content Tab: Carousel Settings
		 */
		$this->start_controls_section(
			'section_additional_options',
			array(
				'label'     => esc_html__( 'Carousel Settings', 'powerpack' ),
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'animation_speed',
			array(
				'label'   => esc_html__( 'Animation Speed', 'powerpack' ),
				'type'    => Controls_Manager::NUMBER,
				'default' => 500,
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
			)
		);

		$this->add_control(
			'autoplay_speed',
			array(
				'label'     => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 3000,
				'condition' => array(
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'pause_on_hover',
			array(
				'label'              => esc_html__( 'Pause on Hover', 'powerpack' ),
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
			'infinite_loop',
			array(
				'label'        => esc_html__( 'Infinite Loop', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'adaptive_height',
			array(
				'label'        => esc_html__( 'Adaptive Height', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'direction',
			array(
				'label'       => esc_html__( 'Direction', 'powerpack' ),
				'type'        => Controls_Manager::CHOOSE,
				'label_block' => false,
				'toggle'      => false,
				'options'     => array(
					'left'  => array(
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon'  => 'eicon-h-align-left',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon'  => 'eicon-h-align-right',
					),
				),
				'default'     => 'left',
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
			'arrows',
			array(
				'label'        => esc_html__( 'Arrows', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
			)
		);

		$this->add_control(
			'dots',
			array(
				'label'        => esc_html__( 'Pagination', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'no',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
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
					'dots' => 'yes',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_layout_controls() {
		/**
		 * Style Tab: Layout
		 */
		$this->start_controls_section(
			'section_layout_style',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'columns_gap',
			array(
				'label'          => esc_html__( 'Columns Gap', 'powerpack' ),
				'type'           => Controls_Manager::SLIDER,
				'size_units'     => array( 'px', '%', 'em', 'rem', 'custom' ),
				'default'        => array(
					'size' => 20,
					'unit' => 'px',
				),
				'range'          => array(
					'px' => array(
						'max' => 100,
					),
				),
				'tablet_default' => array(
					'unit' => 'px',
				),
				'mobile_default' => array(
					'unit' => 'px',
				),
				'render_type'    => 'template',
				'selectors'      => array(
					'{{WRAPPER}}' => '--grid-column-gap: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-elementor-grid' => 'margin-left: -{{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-elementor-grid .pp-grid-item-wrap' => 'padding-left: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'rows_gap',
			array(
				'label'          => esc_html__( 'Rows Gap', 'powerpack' ),
				'type'           => Controls_Manager::SLIDER,
				'size_units'     => array( 'px', '%', 'em', 'rem', 'custom' ),
				'default'        => array(
					'size' => 20,
					'unit' => 'px',
				),
				'range'          => array(
					'px' => array(
						'max' => 100,
					),
				),
				'tablet_default' => array(
					'unit' => 'px',
				),
				'mobile_default' => array(
					'unit' => 'px',
				),
				'selectors'      => array(
					'{{WRAPPER}}' => '--grid-row-gap: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-elementor-grid .pp-grid-item-wrap' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'      => array(
					'layout' => 'grid',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_overlay_controls() {
		/**
		 * Style Tab: Overlay
		 */
		$this->start_controls_section(
			'section_overlay_style',
			array(
				'label' => esc_html__( 'Overlay', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'overlay_blend_mode',
			array(
				'label'     => esc_html__( 'Blend Mode', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'normal',
				'options'   => array(
					'normal'      => esc_html__( 'Normal', 'powerpack' ),
					'multiply'    => esc_html__( 'Multiply', 'powerpack' ),
					'screen'      => esc_html__( 'Screen', 'powerpack' ),
					'overlay'     => esc_html__( 'Overlay', 'powerpack' ),
					'darken'      => esc_html__( 'Darken', 'powerpack' ),
					'lighten'     => esc_html__( 'Lighten', 'powerpack' ),
					'color-dodge' => esc_html__( 'Color Dodge', 'powerpack' ),
					'color'       => esc_html__( 'Color', 'powerpack' ),
					'hue'         => esc_html__( 'Hue', 'powerpack' ),
					'hard-light'  => esc_html__( 'Hard Light', 'powerpack' ),
					'soft-light'  => esc_html__( 'Soft Light', 'powerpack' ),
					'difference'  => esc_html__( 'Difference', 'powerpack' ),
					'exclusion'   => esc_html__( 'Exclusion', 'powerpack' ),
					'saturation'  => esc_html__( 'Saturation', 'powerpack' ),
					'luminosity'  => esc_html__( 'Luminosity', 'powerpack' ),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-video-overlay' => 'mix-blend-mode: {{VALUE}};',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_overlay_style' );

		$this->start_controls_tab(
			'tab_overlay_normal',
			array(
				'label' => esc_html__( 'Normal', 'powerpack' ),
			)
		);

		$this->add_control(
			'overlay_background_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-video-overlay' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'overlay_margin_normal',
			array(
				'label'      => esc_html__( 'Margin', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 50,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-video-overlay' => 'top: {{SIZE}}{{UNIT}}; bottom: {{SIZE}}{{UNIT}}; left: {{SIZE}}{{UNIT}}; right: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'overlay_opacity_normal',
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
					'{{WRAPPER}} .pp-video-overlay' => 'opacity: {{SIZE}};',
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

		$this->add_control(
			'overlay_background_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-grid-item-wrap:hover .pp-video-overlay' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'overlay_margin_hover',
			array(
				'label'      => esc_html__( 'Margin', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 50,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-grid-item-wrap:hover .pp-video-overlay' => 'top: {{SIZE}}{{UNIT}}; bottom: {{SIZE}}{{UNIT}}; left: {{SIZE}}{{UNIT}}; right: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'overlay_opacity_hover',
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
					'{{WRAPPER}} .pp-grid-item-wrap:hover .pp-video-overlay' => 'opacity: {{SIZE}};',
				),
			)
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
			array(
				'label'     => esc_html__( 'Play Icon', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'play_icon_type!' => 'none',
				),
			)
		);

		$this->add_responsive_control(
			'play_icon_size',
			array(
				'label'      => esc_html__( 'Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min' => 10,
						'max' => 400,
					),
				),
				'default'    => array(
					'size' => 50,
					'unit' => 'px',
				),
				'selectors'  => array(
					'{{WRAPPER}}' => '--pp-play-icon-size: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'play_icon_type!' => 'none',
				),
			)
		);

		$this->add_control(
			'play_icon_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-video-play-icon img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'play_icon_type' => 'image',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_play_icon_style' );

		$this->start_controls_tab(
			'tab_play_icon_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'play_icon_type'           => 'icon',
					'select_play_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'play_icon_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-video-play-icon'     => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-video-play-icon svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'play_icon_type'           => 'icon',
					'select_play_icon[value]!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name'      => 'play_icon_text_shadow',
				'label'     => esc_html__( 'Shadow', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-video-play-icon',
				'condition' => array(
					'play_icon_type'           => 'icon',
					'select_play_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'play_icon_opacity',
			array(
				'label'     => esc_html__( 'Opacity', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'range'     => array(
					'px' => array(
						'max'  => 1,
						'min'  => 0,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-video-play-icon' => 'opacity: {{SIZE}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_play_icon_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'play_icon_type'           => 'icon',
					'select_play_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'play_icon_hover_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'play_icon_type'           => 'icon',
					'select_play_icon[value]!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name'      => 'play_icon_hover_text_shadow',
				'selector'  => '{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon',
				'condition' => array(
					'play_icon_type'           => 'icon',
					'select_play_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'play_icon_hover_opacity',
			array(
				'label'     => esc_html__( 'Opacity', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'range'     => array(
					'px' => array(
						'max'  => 1,
						'min'  => 0,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-video-container:hover .pp-video-play-icon' => 'opacity: {{SIZE}}',
				),
				'condition' => array(
					'play_icon_type!' => 'none',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_content_controls() {
		/**
		 * Style Tab: Content
		 */
		$this->start_controls_section(
			'section_video_content_style',
			array(
				'label' => esc_html__( 'Content', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'video_title_position',
			array(
				'label'     => esc_html__( 'Content Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'below-video',
				'options'   => array(
					'over-image'  => esc_html__( 'Over Thumbnail', 'powerpack' ),
					'hover'       => esc_html__( 'Over Thumbnail on Hover', 'powerpack' ),
					'above-video' => esc_html__( 'Above Video', 'powerpack' ),
					'below-video' => esc_html__( 'Below Video', 'powerpack' ),
				),
				'prefix_class' => 'pp-video-gallery-content-',
				'render_type'  => 'template',
			)
		);

		$this->add_control(
			'video_title_vertical_align',
			array(
				'label'                => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
				'label_block'          => false,
				'toggle'               => false,
				'default'              => 'bottom',
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
				'selectors_dictionary' => array(
					'top'    => 'flex-start',
					'middle' => 'center',
					'bottom' => 'flex-end',
				),
				'selectors'            => array(
					'{{WRAPPER}} .pp-media-content' => 'justify-content: {{VALUE}};',
				),
				'condition'            => array(
					'video_title_position' => array( 'over-image', 'hover' ),
				),
			)
		);

		$this->add_control(
			'video_title_horizontal_align',
			array(
				'label'                => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
				'label_block'          => false,
				'toggle'               => false,
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
						'title' => esc_html__( 'Justify', 'powerpack' ),
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
					'{{WRAPPER}} .pp-media-content' => 'align-items: {{VALUE}};',
				),
				'condition'            => array(
					'video_title_position' => array( 'over-image', 'hover' ),
				),
			)
		);

		$this->add_responsive_control(
			'video_title_text_align',
			array(
				'label'     => esc_html__( 'Text Align', 'powerpack' ),
				'type'      => Controls_Manager::CHOOSE,
				'default'   => '',
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
				'selectors' => array(
					'{{WRAPPER}} .pp-video-content' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'video_title_background_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-video-content' => 'background-color: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'video_title_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-video-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'video_title_heading',
			array(
				'label'     => esc_html__( 'Video Title', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'video_title_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-video-title' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'video_title_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-video-title',
			)
		);

		$this->add_responsive_control(
			'video_title_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 80,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-video-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'video_description_heading',
			array(
				'label'     => esc_html__( 'Video Description', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'video_description_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-video-description' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'     => 'video_description_typography',
				'label'    => esc_html__( 'Typography', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-video-description',
			)
		);

		$this->end_controls_section();
	}

	protected function register_style_filter_controls() {
		/**
		 * Style Tab: Filters
		 */
		$this->start_controls_section(
			'section_filter_style',
			array(
				'label'     => esc_html__( 'Filters', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'filter_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'selector'  => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter-text',
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'filters_gap_horizontal',
			array(
				'label'      => esc_html__( 'Horizontal Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default'    => array(
					'size' => 5,
				),
				'range'      => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'filters_gap_vertical',
			array(
				'label'       => esc_html__( 'Vertical Spacing', 'powerpack' ),
				'description' => esc_html__( 'You can use vertical spacing to distance filters from one another, if they are stacked.', 'powerpack' ),
				'type'        => Controls_Manager::SLIDER,
				'size_units'  => array( 'px', 'em', 'rem', 'custom' ),
				'default'     => array(
					'size' => 5,
				),
				'range'       => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'selectors'   => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'   => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'filters_margin_bottom',
			array(
				'label'      => esc_html__( 'Filters Bottom Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 80,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-gallery-filters' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_filter_style' );

		$this->start_controls_tab(
			'tab_filter_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_color_normal',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_background_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'filter_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter',
				'condition'   => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_border_radius_normal',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'filter_padding',
			array(
				'label'       => esc_html__( 'Padding', 'powerpack' ),
				'type'        => Controls_Manager::DIMENSIONS,
				'size_units'  => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'placeholder' => array(
					'top'    => '',
					'right'  => '',
					'bottom' => '',
					'left'   => '',
				),
				'selectors'   => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'   => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'filter_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter',
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_filter_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_color_hover',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_background_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'filter_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter:hover',
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'galleries_pointer_color_hover',
			[
				'label'     => esc_html__( 'Pointer Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--filters-pointer-bg-color-hover: {{VALUE}}',
				],
				'condition' => [
					'layout'        => 'grid',
					'filter_enable' => 'yes',
					'pointer!'      => [ 'none', 'text' ],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_filter_active',
			array(
				'label'     => esc_html__( 'Active', 'powerpack' ),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_color_active',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_background_color_active',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active' => 'background-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'filter_border_color_active',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active' => 'border-color: {{VALUE}};',
				),
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'filter_box_shadow_active',
				'selector'  => '{{WRAPPER}} .pp-gallery-filters .pp-gallery-filter.pp-active',
				'condition' => array(
					'layout'        => 'grid',
					'filter_enable' => 'yes',
				),
			)
		);

		$this->add_control(
			'galleries_pointer_color_active',
			[
				'label'     => esc_html__( 'Pointer Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--filters-pointer-bg-color-active: {{VALUE}}',
				],
				'condition' => [
					'layout'   => 'grid',
					'pointer!' => [ 'none', 'text' ],
				],

			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'pointer_width',
			[
				'label'      => esc_html__( 'Pointer Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range'      => [
					'px' => [
						'max' => 30,
					],
				],
				'selectors'  => [
					'{{WRAPPER}}' => '--filters-pointer-border-width: {{SIZE}}{{UNIT}}',
				],
				'separator'  => 'before',
				'condition'  => [
					'pointer' => [ 'underline', 'overline', 'double-line', 'framed' ],
				],
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
					'layout' => 'carousel',
					'arrows' => 'yes',
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
					'{{WRAPPER}} .elementor-swiper-button-next' => 'right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-swiper-button-prev' => 'left: {{SIZE}}{{UNIT}};',
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
					'{{WRAPPER}} .pp-slider-arrow' => 'background-color: {{VALUE}};',
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
					'{{WRAPPER}} .pp-slider-arrow' => 'color: {{VALUE}};',
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
				'selector'    => '{{WRAPPER}} .pp-slider-arrow',
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
					'{{WRAPPER}} .pp-slider-arrow' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
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
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'background-color: {{VALUE}};',
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
					'{{WRAPPER}} .pp-slider-arrow:hover' => 'color: {{VALUE}};',
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
					'{{WRAPPER}} .pp-slider-arrow:hover',
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
					'{{WRAPPER}} .pp-slider-arrow' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
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

	protected function register_style_pagination_dots_controls() {
		/**
		 * Style Tab: Dots
		 */
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
				'label'        => esc_html__( 'Position', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'options'      => array(
					'inside'  => esc_html__( 'Inside', 'powerpack' ),
					'outside' => esc_html__( 'Outside', 'powerpack' ),
				),
				'default'      => 'outside',
				'prefix_class' => 'pp-swiper-slider-pagination-',
				'condition'    => array(
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
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 2,
						'max'  => 40,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .swiper-pagination-bullet' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
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
					'{{WRAPPER}} .swiper-pagination-bullet' => 'background: {{VALUE}};',
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
					'{{WRAPPER}} .swiper-pagination-bullet.swiper-pagination-bullet-active' => 'background: {{VALUE}};',
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
				'size_units'         => array( 'px', '%', 'em', 'rem', 'custom' ),
				'allowed_dimensions' => 'vertical',
				'placeholder'        => array(
					'top'    => '',
					'right'  => 'auto',
					'bottom' => '',
					'left'   => 'auto',
				),
				'selectors'          => array(
					'{{WRAPPER}} .swiper-pagination' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
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

	protected function register_style_pagination_fraction_controls() {
		/**
		 * Style Tab: Pagination: Fraction
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
				'global'    => [
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

	protected function register_style_load_more_controls() {
		/**
		 * Style Tab: Load More Button
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_load_more_button_style',
			array(
				'label'     => esc_html__( 'Load More Button', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
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
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'button_margin_top',
			array(
				'label'      => esc_html__( 'Top Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 80,
						'step' => 1,
					),
				),
				'selectors'  => array(
					'{{WRAPPER}} .pp-video-gallery-pagination' => 'margin-top: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_load_more_button_style' );

		$this->start_controls_tab(
			'tab_load_more_button_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_control(
			'load_more_button_text_color_normal',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-load-more' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-gallery-load-more .pp-icon svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_control(
			'load_more_button_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-load-more' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'load_more_button_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-gallery-load-more',
				'condition'   => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_control(
			'load_more_button_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-gallery-load-more' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'load_more_button_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-gallery-load-more',
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'load_more_button_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-gallery-load-more' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'load_more_button_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-gallery-load-more',
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_control(
			'load_more_button_icon_heading',
			array(
				'label'     => esc_html__( 'Button Icon', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout!'                       => 'carousel',
					'filter_enable!'                => 'yes',
					'pagination'                    => 'yes',
					'select_load_more_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'load_more_button_icon_margin',
			array(
				'label'       => esc_html__( 'Margin', 'powerpack' ),
				'type'        => Controls_Manager::DIMENSIONS,
				'size_units'  => array( 'px', '%', 'em', 'rem', 'custom' ),
				'placeholder' => array(
					'top'    => '',
					'right'  => '',
					'bottom' => '',
					'left'   => '',
				),
				'selectors'   => array(
					'{{WRAPPER}} .pp-video-gallery-pagination .pp-gallery-load-more-icon' => 'margin-top: {{TOP}}{{UNIT}}; margin-left: {{LEFT}}{{UNIT}}; margin-right: {{RIGHT}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
				),
				'condition'   => array(
					'layout!'                       => 'carousel',
					'filter_enable!'                => 'yes',
					'pagination'                    => 'yes',
					'select_load_more_icon[value]!' => '',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
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
					'{{WRAPPER}} .pp-gallery-load-more:hover' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-gallery-load-more:hover .pp-icon svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
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
					'{{WRAPPER}} .pp-gallery-load-more:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
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
					'{{WRAPPER}} .pp-gallery-load-more:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'button_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-gallery-load-more:hover',
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->add_control(
			'load_more_button_animation_heading',
			array(
				'label'     => esc_html__( 'Loading Animation', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->add_control(
			'load_more_button_animation_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-gallery-load-more.pp-loading .pp-button-loader:after' => 'border-top-color: {{VALUE}}; border-bottom-color: {{VALUE}};',
				),
				'condition' => array(
					'layout!'         => 'carousel',
					'filter_enable!'  => 'yes',
					'pagination'      => 'yes',
					'load_more_text!' => '',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render Video Gallery output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$gallery        = array();
		$is_editor      = \Elementor\Plugin::instance()->editor->is_edit_mode();

		if ( 'yt-playlist' === $settings['source'] || 'yt-channel' === $settings['source'] ) {
			$gallery = $this->get_youtube_videos();

			if ( is_wp_error( $gallery ) ) {
				$error_message = $gallery->get_error_message();

				if ( $is_editor ) {
					return $this->render_editor_placeholder(
						[
							'title' => esc_html__( 'YouTube Videos', 'powerpack' ),
							'body' => $error_message,
						]
					);
				}
				return;
			}
		} else {
			$gallery_videos = $settings['gallery_videos'];

			if ( 'random' === $settings['ordering'] ) {
				$keys = array_keys( $gallery_videos );
				shuffle( $keys );
	
				foreach ( $keys as $key ) {
					$gallery[ $key ] = $gallery_videos[ $key ];
				}
			} else {
				$gallery = $gallery_videos;
			}
		}

		$classes = array(
			'pp-video-gallery',
		);

		$this->add_render_attribute(
			array(
				'gallery-container' => array(
					'class' => array(
						'pp-video-gallery-container',
						'pp-video-gallery-' . $settings['layout'],
					),
				),
				'gallery-wrap'      => array(
					'class' => 'pp-video-gallery-wrap',
				),
			)
		);

		if ( 'carousel' === $settings['layout'] ) {
			$classes[] = 'pp-swiper-slider';
		}

		if ( 'grid' === $settings['layout'] && 'yes' !== $settings['filter_enable'] && 'yes' !== $settings['pagination'] ) {
			$classes[] = 'elementor-grid';
		}

		if ( 'grid' === $settings['layout'] && ( 'yes' === $settings['filter_enable'] || 'yes' === $settings['pagination'] ) ) {
			$classes[] = 'pp-elementor-grid';
			$classes[] = 'pp-video-gallery-filter-enabled';
		}

		$this->add_render_attribute(
			'gallery',
			array(
				'class'       => $classes,
				'data-action' => $settings['click_action'],
			)
		);

		if ( 'carousel' === $settings['layout'] ) {
			$slider_options = $this->slider_settings();
			$this->add_render_attribute( 'gallery', 'data-slider-settings', wp_json_encode( $slider_options ) );

			$direction = ( 'right' === $settings['direction'] ) ? 'rtl' : 'ltr';

			$this->add_render_attribute(
				array(
					'gallery-wrap' => array(
						'class' => 'swiper-container-wrap'
					),
					'gallery'      => array(
						'class' => 'swiper',
						'dir'   => $direction,
					),
				)
			);
		}
		?>
		<div <?php $this->print_render_attribute_string( 'gallery-container' ); ?>>
			<div <?php $this->print_render_attribute_string( 'gallery-wrap' ); ?>>
				<?php $this->render_filters(); ?>
				<div <?php $this->print_render_attribute_string( 'gallery' ); ?>>
					<?php if ( 'carousel' === $settings['layout'] ) { ?>
					<div class="swiper-wrapper">
					<?php } ?>
						<?php $this->render_videos( $gallery ); ?>
					<?php if ( 'carousel' === $settings['layout'] ) { ?>
					</div>
					<?php } ?>
				</div>
				<?php
					// Load more pagination
					$this->render_pagination();

					// Carousel pagination
					$this->render_dots();
					$this->render_arrows();
				?>
			</div>
		</div>
		<?php

		if ( \Elementor\Plugin::instance()->editor->is_edit_mode() ) {

			if ( ( 'grid' === $settings['layout'] && 'yes' === $settings['filter_enable'] ) ) {
				$this->render_editor_script();
			}
		}
	}

	/**
	 * Carousel Settings.
	 *
	 * @access public
	 */
	public function slider_settings() {
		$settings = $this->get_settings();

		$slides_to_show        = ( isset( $settings['columns'] ) && '' !== $settings['columns'] ) ? absint( $settings['columns'] ) : 3;
		$slides_to_show_tablet = ( isset( $settings['columns_tablet'] ) && '' !== $settings['columns_tablet'] ) ? absint( $settings['columns_tablet'] ) : 2;
		$slides_to_show_mobile = ( isset( $settings['columns_mobile'] ) && '' !== $settings['columns_mobile'] ) ? absint( $settings['columns_mobile'] ) : 2;
		$spacing               = ( isset( $settings['columns_gap']['size'] ) && $settings['columns_gap']['size'] ) ? $settings['columns_gap']['size'] : 10;
		$spacing_tablet        = ( isset( $settings['columns_gap_tablet']['size'] ) && $settings['columns_gap_tablet']['size'] ) ? $settings['columns_gap_tablet']['size'] : 10;
		$spacing_mobile        = ( isset( $settings['columns_gap_mobile']['size'] ) && $settings['columns_gap_mobile']['size'] ) ? $settings['columns_gap_mobile']['size'] : 10;

		$slider_options = array(
			'speed'            => ( '' !== $settings['animation_speed'] ) ? $settings['animation_speed'] : 500,
			'slides_per_view'  => $slides_to_show,
			'slides_to_scroll' => 1,
			'space_between'    => $spacing,
			'auto_height'      => ( 'yes' === $settings['adaptive_height'] ) ? 'yes' : '',
			'loop'             => ( 'yes' === $settings['infinite_loop'] ) ? 'yes' : '',
		);

		if ( 'yes' === $settings['autoplay'] ) {
			$autoplay_speed = 3000;
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
						$slider_options['slides_per_view'] = absint( $slides_to_show );
						$slider_options['space_between'] = absint( $spacing );
						break;
					case 'tablet':
						$slider_options['slides_per_view_tablet'] = absint( $slides_to_show_tablet );
						$slider_options['space_between_tablet'] = absint( $spacing_tablet );
						break;
					case 'mobile':
						$slider_options['slides_per_view_mobile'] = absint( $slides_to_show_mobile );
						$slider_options['space_between_mobile'] = absint( $spacing_mobile );
						break;
				}
			} else {
				if ( isset( $settings['columns_' . $device]['size'] ) && $settings['columns_' . $device]['size'] ) {
					$slider_options['slides_per_view_' . $device] = absint( $settings['columns_' . $device]['size'] );
				}

				if ( isset( $settings['columns_gap_' . $device]['size'] ) && $settings['columns_gap_' . $device]['size'] ) {
					$slider_options['space_between_' . $device] = absint( $settings['columns_gap_' . $device]['size'] );
				}
			}
		}

		return $slider_options;
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
	 * Render Video Gallery Filters
	 *
	 * @return void
	 */
	protected function render_filters() {
		$settings = $this->get_settings_for_display();

		if ( 'grid' === $settings['layout'] && 'yes' === $settings['filter_enable'] ) {
			$all_text = ( $settings['filter_all_label'] ) ? $settings['filter_all_label'] : esc_html__( 'All', 'powerpack' );

			$this->add_render_attribute( 'filters-wrapper', 'class', 'pp-filters-wrapper' );
			$this->add_render_attribute( 'filters-container', 'class', 'pp-gallery-filters' );

			if ( $settings['pointer'] ) {
				if ( 'underline' === $settings['pointer'] || 'overline' === $settings['pointer'] || 'double-line' === $settings['pointer'] ) {
					$this->add_render_attribute( 'filters-container', 'class', 'pp-pointer-line' );
				}

				$this->add_render_attribute( 'filters-container', 'class', 'pp-pointer-' . $settings['pointer'] );

				foreach ( $settings as $key => $value ) {
					if ( 0 === strpos( $key, 'animation' ) && $value ) {
						$this->add_render_attribute( 'filters-container', 'class', 'pp-animation-' . $value );
						break;
					}
				}
			}

			$gallery  = $this->get_filter_values();
			?>
			<div <?php $this->print_render_attribute_string( 'filters-wrapper' ); ?>>
				<div <?php $this->print_render_attribute_string( 'filters-container' ); ?>>
					<div class="pp-gallery-filter pp-active" data-filter="*">
						<span class="pp-gallery-filter-text">
							<?php echo esc_attr( $all_text ); ?>
						</span>
					</div>
					<?php
					foreach ( $gallery as $index => $item ) {
						$filter_label = $item;
						if ( $item ) {
							?>
						<div class="pp-gallery-filter" data-filter=".<?php echo esc_attr( $index ); ?>">
							<span class="pp-gallery-filter-text"><?php echo esc_attr( $filter_label ); ?></span>
						</div>
						<?php } ?>
					<?php } ?>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * @param bool $from_media
	 *
	 * @return string
	 * @since 2.2.7
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
	 * @since 2.2.7
	 * @access private
	 */
	protected function get_hosted_params( $item ) {
		$settings = $this->get_settings_for_display();

		$video_params = [];

		$video_params['controls'] = '';

		$video_params['controlsList'] = 'nodownload';

		if ( $settings['mute'] ) {
			$video_params['muted'] = 'muted';
		}

		if ( 'yes' === $item['custom_thumbnail'] ) {
			if ( $item['custom_image']['url'] ) {
				$video_params['poster'] = $item['custom_image']['url'];
			}
		}

		return $video_params;
	}

	/**
	 * Render Video Content
	 *
	 * @access protected
	 */
	protected function render_video_content( $item, $index ) {
		$settings              = $this->get_settings_for_display();
		$content_container_key = $this->get_repeater_setting_key( 'content-container', 'video', $index );

		$this->add_render_attribute( $content_container_key, 'class', 'pp-video-content-container' );

		if ( 'hover' === $settings['video_title_position'] || 'over-image' === $settings['video_title_position'] ) {
			$this->add_render_attribute( $content_container_key, 'class', 'pp-media-content' );
		}

		if ( $item['video_title'] || $item['video_description'] ) { ?>
			<div <?php $this->print_render_attribute_string( $content_container_key ); ?>>
				<div class="pp-video-content">
					<?php if ( $item['video_title'] ) { ?>
						<div class="pp-video-title">
							<?php echo wp_kses_post( $item['video_title'] ); ?>
						</div>
					<?php } ?>

					<?php if ( $item['video_description'] ) { ?>
						<div class="pp-video-description">
							<?php echo wp_kses_post( $this->parse_text_editor( $item['video_description'] ) ); ?>
						</div>
					<?php } ?>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * Render Videos
	 *
	 * @access protected
	 */
	protected function render_video( $item, $index ) {
		$settings = $this->get_settings_for_display();
		$per_page = $settings['images_per_page'];

		$video_container_key = $this->get_repeater_setting_key( 'container', 'video', $index );
		$item_wrap_key = $this->get_repeater_setting_key( 'item_wrap', 'video', $index );
		$this->add_render_attribute( $video_container_key, 'class', 'pp-video-container' );
		$this->add_render_attribute( $item_wrap_key, 'class', array( 'pp-video' ) );

		if ( 'carousel' === $settings['layout'] ) {
			$this->add_render_attribute( $item_wrap_key, 'class', array( 'swiper-slide' ) );
		} else {
			$tags = $this->get_filter_keys( $item );

			$this->add_render_attribute( $item_wrap_key, 'class', array( 'pp-grid-item-wrap', 'elementor-grid-item' ) );

			$this->add_render_attribute( $item_wrap_key, 'class', array_keys( $tags ) );
		}

		if ( 'yes' === $settings['enable_schema'] ) {
			$video_index = $index + 1;
			$this->add_render_attribute( $item_wrap_key, 'id', 'pp-video-gallery-item-' . $video_index );
		}
		?>
		<div <?php $this->print_render_attribute_string( $item_wrap_key ); ?>>
				<?php
				if ( 'above-video' === $settings['video_title_position'] ) {
					$this->render_video_content( $item, $index );
				}

				$video_url_src = '';
				$thumb_size    = '';

				if ( 'youtube' === $item['video_source'] ) {
					$video_url_src = $item['youtube_url'];
					if ( 'yt-playlist' === $settings['source'] || 'yt-channel' === $settings['source'] ) {
						$thumb_size = ( isset( $settings['yt_thumbnail_size'] ) ? $settings['yt_thumbnail_size'] : 'maxresdefault' );
					} else {
						$thumb_size = ( isset( $item['thumbnail_size'] ) ? $item['thumbnail_size'] : 'maxresdefault' );
					}
				} elseif ( 'vimeo' === $item['video_source'] ) {
					$video_url_src = $item['vimeo_url'];
				} elseif ( 'dailymotion' === $item['video_source'] ) {
					$video_url_src = $item['dailymotion_url'];
				}

				$video_play_key = $this->get_repeater_setting_key( 'play', 'video', $index );
				$this->add_render_attribute( $video_play_key, 'class', 'pp-video-play' );

				if ( 'inline' === $settings['click_action'] ) {
					$embed_params = $this->get_embed_params( $item );
					if ( 'hosted' === $item['video_source'] ) {
						$video_url = $this->get_hosted_video_url( $item );
					} else {
						if ( preg_match( '/youtube\.com\/shorts\/(\w+\s*\/?)*([0-9]+)*(.*)$/i', $video_url_src, $matches ) ) {
							$video_id = $matches[1];
							$video_url = $this->get_yt_short_embed_url( $video_id, $embed_params );
						} else {
							$video_url = Embed::get_embed_url( $video_url_src, $embed_params, array() );
						}
					}

					$this->add_render_attribute( $video_play_key, 'data-src', $video_url );
				} else {
					if ( 'hosted' === $item['video_source'] ) {
						$video_url = $this->get_hosted_video_url( $item );
					} else {
						$video_url = $video_url_src;
					}

					$this->add_render_attribute( $video_play_key, 'data-fancybox', 'video-gallery-' . $this->get_id() );
				}

				$this->add_render_attribute( $video_play_key, 'href', $video_url );
				?>
				<div <?php $this->print_render_attribute_string( $video_container_key ); ?>>
					<div <?php $this->print_render_attribute_string( $video_play_key ); ?>>
						<?php
							// Video Overlay.
							echo wp_kses_post( $this->render_video_overlay( $index ) );
						?>
						<div class="pp-video-player">
							<?php $video_thumb = $this->get_video_thumbnail( $item, $thumb_size ); ?>
							<div class="pp-video-thumb-wrap">
								<?php if ( 'hosted' === $item['video_source'] ) { ?>
									<?php $video_url = $this->get_hosted_video_url( $item ); ?>
									<?php if ( $video_thumb ) { ?>
										<img class="pp-video-thumb" src="<?php echo esc_url( $this->get_video_thumbnail( $item, $thumb_size ) ); ?>" alt="<?php echo esc_attr( $item['filter_label'] ); ?>">
									<?php } else { ?>
										<video class="pp-hosted-video" src="<?php echo esc_url( $video_url ); ?>" preload="<?php echo esc_attr( $settings['preload'] ); ?>"></video>
									<?php } ?>
								<?php } else { ?>
									<?php if ( $video_thumb ) { ?>
										<img class="pp-video-thumb" src="<?php echo esc_url( $this->get_video_thumbnail( $item, $thumb_size ) ); ?>" alt="<?php echo esc_attr( $item['filter_label'] ); ?>">
									<?php }
								}
								$this->render_play_icon( $index );

								if ( 'over-image' === $settings['video_title_position'] || 'hover' === $settings['video_title_position'] ) {
									$this->render_video_content( $item, $index );	
								}
								?>
							</div>
						</div>
					</div>
				</div>
				<?php
				if ( 'below-video' === $settings['video_title_position'] ) {
					$this->render_video_content( $item, $index );
				}
				?>
		</div>
		<?php
	}

	/**
	 * Render Videos
	 *
	 * @access protected
	 */
	protected function render_videos( $gallery ) {
		$settings       = $this->get_settings_for_display();
		$per_page       = $settings['images_per_page'];
		$has_pagination = ( 'carousel' !== $settings['layout'] && 'yes' === $settings['pagination'] && 'yes' !== $settings['filter_enable'] && ! empty( $per_page ) );

		foreach ( $gallery as $index => $item ) {
			if ( $has_pagination && $index >= $per_page ) {
				break;
			}

			$this->render_video( $item, $index );
		}
	}

	/**
	 * Returns Video Thumbnail.
	 *
	 * @param  array $item       Video.
	 * @param  mixed $thumb_size Thumbnail size.
	 *
	 * @access protected
	 */
	protected function get_video_thumbnail( $item, $thumb_size = '' ) {
		$thumb_url = '';
		$video_id  = $this->get_video_id( $item );

		if ( 'hosted' === $item['video_source'] ) {
			if ( 'yes' === $item['custom_thumbnail'] ) {
				if ( $item['custom_image']['url'] ) {
					$thumb_url = $item['custom_image']['url'];

					return $thumb_url;
				}
			}
		}

		if ( isset( $item['custom_thumbnail'] ) && 'yes' === $item['custom_thumbnail'] ) {
			if ( $item['custom_image']['url'] ) {
				$thumb_url = $item['custom_image']['url'];
			}
		} elseif ( 'youtube' === $item['video_source'] ) {
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
				$thumb_url = ( isset( $vimeo[0]['thumbnail_large'] ) && ! empty( $vimeo[0]['thumbnail_large'] ) ) ? str_replace( '_640', '_840', $vimeo[0]['thumbnail_large'] ) : '';
			}
		} elseif ( 'dailymotion' === $item['video_source'] ) {
			if ( $video_id ) {
				$response = wp_remote_get( 'https://api.dailymotion.com/video/' . $video_id . '?fields=thumbnail_url' );

				if ( is_wp_error( $response ) ) {
					return;
				}
				$dailymotion = maybe_unserialize( $response['body'] );
				$get_thumbnail = json_decode( $dailymotion, true );
				$thumb_url     = $get_thumbnail['thumbnail_url'];
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

		if ( 'youtube' === $item['video_source'] ) {
			$url = $item['youtube_url'];

			if ( preg_match( '#(?<=v=|v\/|vi=|vi\/|youtu.be\/)[a-zA-Z0-9_-]{11}#', $url, $matches ) ) {
				$video_id = $matches[0];
			} else {
				if ( preg_match( '/youtube\.com\/shorts\/(\w+\s*\/?)*([0-9]+)*(.*)$/i', $url, $matches ) ) {
					$video_id = $matches[1];
				}
			}
		} elseif ( 'vimeo' === $item['video_source'] ) {
			$url = $item['vimeo_url'];

			$video_id = preg_replace( '/[^\/]+[^0-9]|(\/)/', '', rtrim( $url, '/' ) );

		} elseif ( 'dailymotion' === $item['video_source'] ) {
			$url = $item['dailymotion_url'];

			if ( preg_match( '/^.+dailymotion.com\/(?:video|swf\/video|embed\/video|hub|swf)\/([^&?]+)/', $url, $matches ) ) {
				$video_id = $matches[1];
			}
		}

		return $video_id;

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
	 * Get embed params.
	 *
	 * Retrieve video widget embed parameters.
	 *
	 * @access public
	 *
	 * @return array Video embed parameters.
	 */
	public function get_embed_params( $item ) {
		$settings = $this->get_settings_for_display();

		$params = array();

		$params_dictionary = array();

		if ( 'youtube' === $item['video_source'] ) {

			$params_dictionary = array(
				'mute',
			);

			if ( 'yes' === $item['cc_load_policy'] ) {
				$params['cc_load_policy'] = 1;
			}

			$params['autoplay'] = 1;

			$params['wmode'] = 'opaque';
		} elseif ( 'vimeo' === $item['video_source'] ) {

			$params_dictionary = array(
				'mute' => 'muted',
			);

			$params['autopause'] = '0';
			$params['autoplay']  = '1';
		} elseif ( 'dailymotion' === $item['video_source'] ) {

			$params_dictionary = array(
				'mute',
			);

			$params['endscreen-enable'] = '0';
			$params['autoplay']         = 1;

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

	protected function render_video_overlay( $index ) {
		$overlay_setting_key = $this->get_repeater_setting_key( 'overlay', 'gallery_videos', $index );

		$this->add_render_attribute(
			$overlay_setting_key,
			'class',
			array(
				'pp-media-overlay',
				'pp-video-overlay',
			)
		);

		return '<div ' . $this->get_render_attribute_string( $overlay_setting_key ) . '></div>';
	}

	/**
	 * Render play icon output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_play_icon( $index ) {
		$settings = $this->get_settings_for_display();

		if ( 'none' === $settings['play_icon_type'] ) {
			return;
		}

		$play_icon_key = $this->get_repeater_setting_key( 'container', 'play-icon', $index );
		$this->add_render_attribute( $play_icon_key, 'class', 'pp-video-play-icon' );

		if ( 'icon' === $settings['play_icon_type'] ) {
			if ( ! isset( $settings['play_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
				// add old default
				$settings['play_icon'] = 'fa fa-play-circle';
			}

			$has_icon = ! empty( $settings['play_icon'] );

			if ( $has_icon ) {
				$this->add_render_attribute( 'play-icon-i', 'class', $settings['play_icon'] );
				$this->add_render_attribute( 'play-icon-i', 'aria-hidden', 'true' );
			}

			if ( ! $has_icon && ! empty( $settings['select_play_icon']['value'] ) ) {
				$has_icon = true;
			}
			$migrated = isset( $settings['__fa4_migrated']['select_play_icon'] );
			$is_new   = ! isset( $settings['play_icon'] ) && Icons_Manager::is_migration_allowed();
			?>
			<span <?php $this->print_render_attribute_string( $play_icon_key ); ?>>
				<?php
				if ( $is_new || $migrated ) {
					Icons_Manager::render_icon( $settings['select_play_icon'], array( 'aria-hidden' => 'true' ) );
				} elseif ( ! empty( $settings['play_icon'] ) ) {
					?>
					<i <?php $this->print_render_attribute_string( 'play-icon-i' ); ?>></i>
					<?php
				}
				?>
			</span>
			<?php

		} elseif ( 'image' === $settings['play_icon_type'] ) {

			if ( $settings['play_icon_image']['url'] ) {
				?>
				<span <?php $this->print_render_attribute_string( $play_icon_key ); ?>>
					<img src="<?php echo esc_url( $settings['play_icon_image']['url'] ); ?>">
				</span>
				<?php
			}
		}
	}

	/**
	 * Clean string - Removes spaces and special chars.
	 *
	 * @param  String $string String to be cleaned.
	 * @return array Google Map languages List.
	 */
	public function clean( $string ) {

		// Replaces all spaces with hyphens.
		$string = str_replace( ' ', '-', $string );

		// Encode non-English letters.
		$string = json_encode( $string );

		// Removes special chars.
		$string = preg_replace( '/[^A-Za-z0-9\-]/', '', $string );

		// Turn into lower case characters.
		return strtolower( $string );
	}

	/**
	 * Render filter keys array.
	 *
	 * @access public
	 */
	public function get_filter_keys( $item ) {

		$filters = explode( ',', $item['filter_label'] );
		$filters = array_map( 'trim', $filters );

		$filters_array = [];

		foreach ( $filters as $key => $value ) {
			$filters_array[ 'filter-' . $this->clean( $value ) ] = $value;
		}

		return $filters_array;
	}

	/**
	 * Get Filter values array.
	 *
	 * Returns the Filter array of objects.
	 *
	 * @access public
	 */
	public function get_filter_values() {

		$settings = $this->get_settings_for_display();

		$filters = array();

		if ( ! empty( $settings['gallery_videos'] ) ) {

			foreach ( $settings['gallery_videos'] as $key => $value ) {

				$filter_keys = $this->get_filter_keys( $value );

				if ( ! empty( $filter_keys ) ) {

					$filters = array_unique( array_merge( $filters, $filter_keys ) );
				}
			}
		}

		return $filters;
	}

	/**
	 * Render pagination
	 */
	protected function render_pagination() {
		$settings       = $this->get_settings_for_display();
		$per_page       = $settings['images_per_page'];
		$has_pagination = ( 'carousel' !== $settings['layout'] && 'yes' === $settings['pagination'] && 'yes' !== $settings['filter_enable'] && ! empty( $per_page ) );

		if ( ! $has_pagination ) {
			return;
		}

		$videos       = $settings['gallery_videos'];
		$videos_count = count( $videos );
		$per_page     = $settings['images_per_page'];

		if ( 'yes' === $settings['pagination'] && $videos_count > $per_page ) {

			if ( ! isset( $settings['load_more_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
				// add old default.
				$settings['load_more_icon'] = '';
			}

			$has_icon = ! empty( $settings['load_more_icon'] );

			if ( $has_icon ) {
				$this->add_render_attribute( 'i', 'class', $settings['load_more_icon'] );
				$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
			}

			if ( ! $has_icon && ! empty( $settings['select_load_more_icon']['value'] ) ) {
				$has_icon = true;
			}
			$migrated = isset( $settings['__fa4_migrated']['select_load_more_icon'] );
			$is_new   = ! isset( $settings['load_more_icon'] ) && Icons_Manager::is_migration_allowed();

			$this->add_render_attribute(
				'load-more-button',
				'class',
				array(
					'pp-gallery-load-more',
					'elementor-button',
					'elementor-size-' . $settings['button_size'],
				)
			);
			?>
			<div class="pp-video-gallery-pagination" data-per-page="<?php echo esc_attr( $settings['images_per_page'] ); ?>" data-total="<?php echo $videos_count; ?>">
				<a href="javascript:void(0)" <?php $this->print_render_attribute_string( 'load-more-button' ); ?>>
					<span class="pp-button-loader"></span>
					<?php if ( $has_icon && 'before' === $settings['button_icon_position'] ) { ?>
						<span class="pp-gallery-load-more-icon pp-icon pp-no-trans">
							<?php
							if ( $is_new || $migrated ) {
								Icons_Manager::render_icon( $settings['select_load_more_icon'], array( 'aria-hidden' => 'true' ) );
							} elseif ( ! empty( $settings['load_more_icon'] ) ) {
								?>
								<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
								<?php
							}
							?>
						</span>
					<?php } ?>
					<span class="pp-gallery-load-more-text">
						<?php echo wp_kses_post( $settings['load_more_text'] ); ?>
					</span>
					<?php if ( $has_icon && 'after' === $settings['button_icon_position'] ) { ?>
						<span class="pp-gallery-load-more-icon pp-icon pp-no-trans">
							<?php
							if ( $is_new || $migrated ) {
								Icons_Manager::render_icon( $settings['select_load_more_icon'], array( 'aria-hidden' => 'true' ) );
							} elseif ( ! empty( $settings['load_more_icon'] ) ) {
								?>
								<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
								<?php
							}
							?>
						</span>
					<?php } ?>
				</a>
				<?php
				$offset_videos = array_slice( $videos, $settings['images_per_page'] );
				$offset_items = '';
				ob_start();

				foreach ( $offset_videos as $index => $video ) {
					if ( ! is_array( $video ) ) {
						continue;
					}

					$this->render_video( $video, $index );
				}

				$offset_items = ob_get_clean();
				?>
				<script type="text/html" class="pp-video-gallery-pagination-items">
					<?php echo preg_replace( '/\>\s+\</m', '><', $offset_items ); ?>
				</script>
			</div>
			<?php
		}
	}

	/**
	 * Render isotope script
	 *
	 * @access protected
	 */
	protected function render_editor_script() {
		?>
		<script type="text/javascript">
			jQuery( document ).ready( function( $ ) {
				$( '.pp-video-gallery' ).each( function() {
					var $node_id 	= '<?php echo esc_attr( $this->get_id() ); ?>',
						$scope 		= $( '[data-id="' + $node_id + '"]' ),
						$gallery 	= $(this);

					if ( $gallery.closest( $scope ).length < 1 ) {
						return;
					}

					var $layout_mode = 'fitRows';

					var $isotope_args = {
						itemSelector:   '.pp-grid-item-wrap',
						layoutMode		: $layout_mode,
						percentPosition : true,
					},
						$isotope_gallery = {};

					$gallery.imagesLoaded( function(e) {
						$isotope_gallery = $gallery.isotope( $isotope_args );

						$gallery.find('.pp-grid-item-wrap').resize( function() {
							$gallery.isotope( 'layout' );
						});
					});

					$('.pp-gallery-filters').on( 'click', '.pp-gallery-filter', function() {
						var $this = $(this),
							filterValue = $this.attr('data-filter');

						$this.siblings().removeClass('pp-active');
						$this.addClass('pp-active');
						$isotope_gallery.isotope({ filter: filterValue });
					});
				});
			});
		</script>
		<?php
	}

	/**
	 * Gets expire time of transient.
	 *
	 * @since 2.10.18
	 * @param array $settings The settings array.
	 * @return the reviews transient expire time.
	 * @access public
	 */
	public function get_transient_expire( $settings ) {

		$expire_value = isset( $settings['videos_refresh_time'] ) ? $settings['videos_refresh_time'] : 'day';
		$expire_time  = 24 * HOUR_IN_SECONDS;

		if ( 'hour' === $expire_value ) {
			$expire_time = 60 * MINUTE_IN_SECONDS;
		} elseif ( 'week' === $expire_value ) {
			$expire_time = 7 * DAY_IN_SECONDS;
		} elseif ( 'month' === $expire_value ) {
			$expire_time = 30 * DAY_IN_SECONDS;
		} elseif ( 'year' === $expire_value ) {
			$expire_time = 365 * DAY_IN_SECONDS;
		}

		return $expire_time;
	}

	/**
	 * Get YouTube API from PowerPack Addons options.
	 *
	 * @since 2.10.18
	 * @return string
	 */
	public function get_youtube_api() {
		return PP_Admin_Settings::get_option( 'pp_youtube_api_key' );
	}

	public function get_youtube_api_data( $yt_data, $token = '', $page = 0 ) {
		$settings = $this->get_settings_for_display();

		$api_key = $this->get_youtube_api();
		$source  = ( 'yt-channel' === $settings['source'] ) ? 'channel' : 'playlist';

		if ( empty( $api_key ) ) {
			return new \WP_Error( 'missing_api_key', sprintf( esc_html__( 'To display videos from YouTube %s, you need to setup API key.', 'powerpack' ), $source ) );
		}

		if ( 'channel' === $source ) {
			$channel_id = ! empty( $settings['yt_channel_id'] ) ? esc_html( $settings['yt_channel_id'] ) : '';

			if ( empty( $channel_id ) ) {
				return new \WP_Error( 'missing_channel_id', esc_html__( 'To display videos from YouTube channel, you need to provide valid Channel ID.', 'powerpack' ) );
			}
		} else {
			$playlist_id = ! empty( $settings['yt_playlist_id'] ) ? esc_html( $settings['yt_playlist_id'] ) : '';

			if ( empty( $playlist_id ) ) {
				return new \WP_Error( 'missing_plylist_id', esc_html__( 'To display videos from YouTube playlist, you need to provide valid Playlist ID.', 'powerpack' ) );
			}
		}

		$api_args = array(
			'method'      => 'GET',
			'timeout'     => 60,
			'httpversion' => '1.0',
			'sslverify'   => false,
		);

		if ( 'yt-channel' === $settings['source'] ) {
			$yt_args = array(
				'part'       => 'snippet,id',
				'order'      => 'date',
				'maxResults' => 50,
				'key'        => $api_key,
				'channelId'  => $channel_id,
			);
			if ( ! empty( $token ) ) {
				$yt_args['pageToken'] = $token;
			}
			$url = add_query_arg(
				$yt_args,
				'https://www.googleapis.com/youtube/v3/search'
			);
		} else {
			$yt_args = array(
				'part'       => 'snippet',
				'maxResults' => 50,
				'key'        => $api_key,
				'playlistId' => $playlist_id,
			);
			if ( ! empty( $token ) ) {
				$yt_args['pageToken'] = $token;
			}
			$url = add_query_arg(
				$yt_args,
				'https://www.googleapis.com/youtube/v3/playlistItems'
			);
		}

		$api_data = wp_remote_post(
			esc_url_raw( $url ),
			$api_args
		);

		$response = array(
			'data'	=> array(),
			'error' => false,
		);

		if ( is_wp_error( $api_data ) ) {
			$response['error'] = $api_data;
		} else {
			if ( 200 === wp_remote_retrieve_response_code( $api_data ) ) {
				$data = json_decode( wp_remote_retrieve_body( $api_data ), false );

				$yt_videos = $yt_data;
				if ( $data->pageInfo->totalResults ) {

					foreach ( $data->items as $item ) {
						$yt_videos[] = $item;
					}

					if ( 4 >= $page ) {
					$nextPageToken = ! empty( $data->nextPageToken ) ? $data->nextPageToken : '';
					if ( ! empty( $nextPageToken ) ) {
							$page++;
							$next_page_data = $this->get_youtube_api_data( $data->items, $nextPageToken, $page );
							foreach ( $next_page_data['data']['video'] as $new_item ) {
								if ( ! in_array( $new_item, $yt_videos ) ) {
									$yt_videos[] = $new_item;
								}
							}
						}
					}

					$response['data'] = array(
						'video' => $yt_videos,
					);

					$response['error'] = false;
				} else {
					$response['error'] = esc_html__( 'This playlist doesn\'t have any videos.', 'powerpack' );
				}
			}
		}

		return $response;
	}

	public function get_youtube_playlist_videos_data() {
		$settings = $this->get_settings_for_display();

		$response = array(
			'data'	=> array(),
			'error' => false,
		);

		$transient_name = '';

		if ( 'yt-channel' === $settings['source'] ) {
			if ( isset( $settings['yt_channel_id'] ) ) {
				$transient_name = 'pp_yt_videos_' . esc_html( $settings['yt_channel_id'] );
			}
		} else {
			if ( isset( $settings['yt_playlist_id'] ) ) {
				$transient_name = 'pp_yt_videos_' . esc_html( $settings['yt_playlist_id'] );
			}
		}

		$response['data'] = get_transient( $transient_name );

		if ( empty( $response['data'] ) ) {
			$yt_data = [];

			$api_datas = $this->get_youtube_api_data( $yt_data, '', 0 );

			if ( is_wp_error( $api_datas ) ) {
				$response['error'] = $api_datas;

				return $response;
			}

			$final_yt_data = array();

			if ( isset( $api_datas['data'] ) && ! empty( $api_datas['data'] ) ) {

				foreach ( $api_datas['data'] as $api_datas ) {
					foreach ( $api_datas as $api_data ) {
						$final_yt_data[] = $api_data;
					}
				}

				$response['data'] = array(
					'video' => $final_yt_data,
				);

				set_transient( $transient_name, $response['data'], $this->get_transient_expire( $settings ) );

				$response['error'] = false;
			}
		}

		return $response;
	}

	public function get_youtube_videos() {
		$settings = $this->get_settings_for_display();

		$videos = $this->get_youtube_playlist_videos_data();

		if ( is_wp_error( $videos['error'] ) ) {
			return $videos['error'];
		}

		if ( empty( $videos['data'] ) ) {
			return;
		}

		$parsed_videos = array();

		$data = $videos['data']['video'];

		$videos_count = isset( $settings['yt_vides_count'] ) ? $settings['yt_vides_count'] : 9;
		$data = array_slice( $data, 0, $videos_count );

		foreach ( $data as $video ) {
			if ( ! empty( $video->snippet->title ) && 'Private video' !== $video->snippet->title ) {
				$_video = array();

				if ( 'yt-channel' === $settings['source'] ) {
					$video_id = isset( $video->id->videoId ) ? $video->id->videoId : '';
				} elseif ( 'yt-playlist' === $settings['source'] ) {
					$video_id = $video->snippet->resourceId->videoId;
				}

				if ( $video_id ) {
					$_video['video_source'] = 'youtube';
					$_video['filter_label'] = 'youtube';
					$_video['_id']          = $video_id;

					if ( 'yes' === $settings['yt_video_title_show'] ) {
						$post_title = ( ! empty( $settings['yt_video_title'] ) ) ? esc_html( $settings['yt_video_title'] ) : $video->snippet->title;
						$title_length = $settings['yt_title_length'];
						$more = '...';
						$post_title = wp_trim_words( $post_title, $title_length, apply_filters( 'pp_yt_video_title_limit_more', $more ) );
						$_video['video_title'] = $post_title;
					} else {
						$_video['video_title'] = '';
					}

					if ( 'yes' === $settings['yt_video_description_show'] ) {
						$post_content = ( ! empty( $settings['yt_video_description'] ) ) ? esc_html( $settings['yt_video_description'] ) : $video->snippet->description;
						$content_length = $settings['yt_content_length'];
						$more = '...';
						$post_content = wp_trim_words( $post_content, $content_length, apply_filters( 'pp_yt_video_content_limit_more', $more ) );
						$_video['video_description'] = $post_content;
					} else {
						$_video['video_description'] = '';
					}

					$youtube_url           = 'https://www.youtube.com/watch?v=' . $video_id;
					$_video['youtube_url'] = $youtube_url;
				}

				array_push( $parsed_videos, $_video );
			}
		}

		return $parsed_videos;
	}
}
