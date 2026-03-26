<?php
namespace PowerpackElements\Modules\Album\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Modules\Album\Module;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Icons_Manager;
use Elementor\Control_Media;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Css_Filter;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Album Widget
 */
class Album extends Powerpack_Widget {

	/**
	 * Retrieve Album widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Album' );
	}

	/**
	 * Retrieve Album widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Album' );
	}

	/**
	 * Retrieve Album widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Album' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Album widget belongs to.
	 *
	 * @since 1.4.13.1
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Album' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the Album widget depended on.
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
				'pp-album',
			];
		}

		$settings = $this->get_settings_for_display();
		$scripts = [];

		if ( 'fancybox' !== $settings['lightbox_library'] ) {
			array_push( $scripts, 'swiper' );
		}

		if ( 'fancybox' === $settings['lightbox_library'] ) {
			array_push( $scripts, 'jquery-fancybox', 'pp-album' );
		}

		return $scripts;
	}

	/**
	 * Retrieve the list of styles the Album widget depended on.
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
				'widget-pp-album',
				'fancybox',
			];
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'widget-pp-album' ];

		if ( 'fancybox' !== $settings['lightbox_library'] ) {
			array_push( $styles, 'e-swiper' );
		}

		if ( 'fancybox' === $settings['lightbox_library'] ) {
			array_push( $styles, 'fancybox' );
		}

		return $styles;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Album widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {

		/**
		 * Content Tab: Album
		 */
		$this->start_controls_section(
			'section_album',
			array(
				'label' => esc_html__( 'Album', 'powerpack' ),
			)
		);

		$this->add_control(
			'album_images',
			array(
				'label'   => esc_html__( 'Add Images', 'powerpack' ),
				'type'    => Controls_Manager::GALLERY,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->end_controls_section();

		/**
		 * Content Tab: Trigger
		 */
		$this->start_controls_section(
			'section_album_cover_settings',
			array(
				'label' => esc_html__( 'Trigger', 'powerpack' ),
			)
		);

		$this->add_control(
			'trigger',
			array(
				'label'   => esc_html__( 'Trigger', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'cover',
				'options' => array(
					'cover'  => esc_html__( 'Album Cover', 'powerpack' ),
					'button' => esc_html__( 'Button', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'album_cover_type',
			array(
				'label'     => esc_html__( 'Cover Image', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'first_img',
				'options'   => array(
					'custom_img' => esc_html__( 'Custom', 'powerpack' ),
					'first_img'  => esc_html__( 'First Image of Album', 'powerpack' ),
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover',
			array(
				'label'     => esc_html__( 'Add Cover Image', 'powerpack' ),
				'type'      => Controls_Manager::MEDIA,
				'dynamic'   => array(
					'active' => true,
				),
				'default'   => array(
					'url' => Utils::get_placeholder_image_src(),
				),
				'condition' => array(
					'trigger'          => 'cover',
					'album_cover_type' => 'custom_img',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'      => 'album_cover',
				'default'   => 'full',
				'separator' => 'none',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'album_height',
			array(
				'label'      => esc_html__( 'Album Cover Height', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => 300,
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'min'  => 50,
						'max'  => 1000,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'vh', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-cover-wrap' => 'height: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_text',
			array(
				'label'     => esc_html__( 'Button Text', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => esc_html__( 'View Album', 'powerpack' ),
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'select_album_trigger_button_icon',
			array(
				'label'            => esc_html__( 'Button Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'album_trigger_button_icon',
				'condition'        => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_icon_position',
			array(
				'label'     => esc_html__( 'Icon Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'after',
				'options'   => array(
					'after'  => esc_html__( 'After', 'powerpack' ),
					'before' => esc_html__( 'Before', 'powerpack' ),
				),
				'condition' => array(
					'trigger'                    => 'button',
					'album_trigger_button_text!' => '',
					'select_album_trigger_button_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'album_trigger_button_icon_spacing',
			array(
				'label'      => esc_html__( 'Icon Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => 8,
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 50,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-trigger-icon-before .pp-button-icon' => 'margin-right: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .pp-album-trigger-icon-after .pp-button-icon' => 'margin-left: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'trigger'                    => 'button',
					'album_trigger_button_text!' => '',
					'select_album_trigger_button_icon[value]!' => '',
				),
			)
		);

		$this->end_controls_section();

		/**
		 * Content Tab: Album Cover Content
		 */
		$this->start_controls_section(
			'section_album_content',
			array(
				'label'     => esc_html__( 'Album Cover Content', 'powerpack' ),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'select_album_icon',
			array(
				'label'            => esc_html__( 'Album Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'album_icon',
				'condition'        => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_title',
			array(
				'label'     => esc_html__( 'Title', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '',
				'dynamic'   => array(
					'active' => true,
				),
				'separator' => 'before',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_title_html_tag',
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
					'trigger'      => 'cover',
					'album_title!' => '',
				),
			)
		);

		$this->add_control(
			'album_subtitle',
			array(
				'label'     => esc_html__( 'Subtitle', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => '',
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_subtitle_html_tag',
			array(
				'label'     => esc_html__( 'Subtitle HTML Tag', 'powerpack' ),
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
					'trigger'         => 'cover',
					'album_subtitle!' => '',
				),
			)
		);

		$this->add_control(
			'album_cover_button',
			array(
				'label'        => esc_html__( 'Show Button', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'return_value' => 'yes',
				'separator'    => 'before',
				'condition'    => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_button_text',
			array(
				'label'     => esc_html__( 'Button Text', 'powerpack' ),
				'type'      => Controls_Manager::TEXT,
				'default'   => esc_html__( 'View More', 'powerpack' ),
				'dynamic'   => array(
					'active' => true,
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'select_album_cover_button_icon',
			array(
				'label'            => esc_html__( 'Button Icon', 'powerpack' ),
				'type'             => Controls_Manager::ICONS,
				'fa4compatibility' => 'album_cover_button_icon',
				'condition'        => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_icon_position',
			array(
				'label'     => esc_html__( 'Icon Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'after',
				'options'   => array(
					'after'  => esc_html__( 'After', 'powerpack' ),
					'before' => esc_html__( 'Before', 'powerpack' ),
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
					'select_album_cover_button_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'album_cover_button_position',
			array(
				'label'        => esc_html__( 'Button Position', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'bottom',
				'options'      => array(
					'inline' => esc_html__( 'Inline', 'powerpack' ),
					'bottom' => esc_html__( 'Below Title', 'powerpack' ),
				),
				'prefix_class' => 'pp-album-cover-button%s-position-',
				'conditions'   => array(
					'relation' => 'and',
					'terms'    => array(
						array(
							'name'     => 'trigger',
							'operator' => '==',
							'value'    => 'cover',
						),
						array(
							'name'     => 'album_cover_button',
							'operator' => '==',
							'value'    => 'yes',
						),
						array(
							'relation' => 'or',
							'terms'    => array(
								array(
									'name'     => 'album_title',
									'operator' => '!=',
									'value'    => '',
								),
								array(
									'name'     => 'album_subtitle',
									'operator' => '!=',
									'value'    => '',
								),
							),
						),
					),
				),
			)
		);

		$this->end_controls_section();

		/**
		 * Content Tab: Settings
		 */
		$this->start_controls_section(
			'section_general_settings',
			array(
				'label' => esc_html__( 'Settings', 'powerpack' ),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name'    => 'image',
				'label'   => esc_html__( 'Image Size', 'powerpack' ),
				'default' => 'full',
				'exclude' => array( 'custom' ),
			)
		);

		$this->add_control(
			'lightbox_library',
			array(
				'label'              => esc_html__( 'Lightbox Library', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => '',
				'options'            => array(
					''         => esc_html__( 'Elementor', 'powerpack' ),
					'fancybox' => esc_html__( 'Fancybox', 'powerpack' ),
				),
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'lightbox_options_heading',
			array(
				'type'      => Controls_Manager::HEADING,
				'label'     => esc_html__( 'Lightbox Options', 'powerpack' ),
				'separator' => 'before',
			)
		);

		$this->add_control(
			'lightbox_caption',
			array(
				'type'    => Controls_Manager::SELECT,
				'label'   => esc_html__( 'Lightbox Title', 'powerpack' ),
				'default' => '',
				'options' => array(
					''            => esc_html__( 'None', 'powerpack' ),
					'caption'     => esc_html__( 'Caption', 'powerpack' ),
					'title'       => esc_html__( 'Title', 'powerpack' ),
					'description' => esc_html__( 'Description', 'powerpack' ),
				),
			)
		);

		$this->add_control(
			'lightbox_description',
			array(
				'type'      => Controls_Manager::SELECT,
				'label'     => esc_html__( 'Lightbox Description', 'powerpack' ),
				'default'   => '',
				'options'   => array(
					''            => esc_html__( 'None', 'powerpack' ),
					'caption'     => esc_html__( 'Caption', 'powerpack' ),
					'title'       => esc_html__( 'Title', 'powerpack' ),
					'description' => esc_html__( 'Description', 'powerpack' ),
				),
				'condition' => array(
					'lightbox_library!' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'loop',
			array(
				'label'              => esc_html__( 'Loop', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'arrows',
			array(
				'label'              => esc_html__( 'Arrows', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'slides_counter',
			array(
				'label'              => esc_html__( 'Slides Counter', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'keyboard',
			array(
				'label'              => esc_html__( 'Keyboard Navigation', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'toolbar',
			array(
				'label'              => esc_html__( 'Toolbar', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => 'yes',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'toolbar_buttons',
			array(
				'label'              => esc_html__( 'Toolbar Buttons', 'powerpack' ),
				'type'               => Controls_Manager::SELECT2,
				'label_block'        => true,
				'default'            => array( 'zoom', 'slideShow', 'thumbs', 'close' ),
				'options'            => array(
					'zoom'       => esc_html__( 'Zoom', 'powerpack' ),
					'share'      => esc_html__( 'Share', 'powerpack' ),
					'slideShow'  => esc_html__( 'SlideShow', 'powerpack' ),
					'fullScreen' => esc_html__( 'Full Screen', 'powerpack' ),
					'download'   => esc_html__( 'Download', 'powerpack' ),
					'thumbs'     => esc_html__( 'Thumbs', 'powerpack' ),
					'close'      => esc_html__( 'Close', 'powerpack' ),
				),
				'multiple'           => true,
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
					'toolbar'          => 'yes',
				),
			)
		);

		$this->add_control(
			'thumbs_auto_start',
			array(
				'label'              => esc_html__( 'Thumbs Auto Start', 'powerpack' ),
				'description'        => esc_html__( 'Display thumbnails on lightbox opening', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'thumbs_position',
			array(
				'label'              => esc_html__( 'Thumbs Position', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => '',
				'options'            => array(
					''       => esc_html__( 'Default', 'powerpack' ),
					'bottom' => esc_html__( 'Bottom', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'lightbox_animation',
			array(
				'label'              => esc_html__( 'Animation', 'powerpack' ),
				'description'        => esc_html__( 'Open/Close animation', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'zoom',
				'options'            => array(
					''            => esc_html__( 'None', 'powerpack' ),
					'fade'        => esc_html__( 'Fade', 'powerpack' ),
					'zoom'        => esc_html__( 'Zoom', 'powerpack' ),
					'zoom-in-out' => esc_html__( 'Zoom in Out', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->add_control(
			'transition_effect',
			array(
				'label'              => esc_html__( 'Transition Effect', 'powerpack' ),
				'description'        => esc_html__( 'Transition effect between slides', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'fade',
				'options'            => array(
					''            => esc_html__( 'None', 'powerpack' ),
					'fade'        => esc_html__( 'Fade', 'powerpack' ),
					'slide'       => esc_html__( 'Slide', 'powerpack' ),
					'circular'    => esc_html__( 'Circular', 'powerpack' ),
					'tube'        => esc_html__( 'Tube', 'powerpack' ),
					'zoom-in-out' => esc_html__( 'Zoom in Out', 'powerpack' ),
					'rotate'      => esc_html__( 'Rotate', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'lightbox_library' => 'fancybox',
				),
			)
		);

		$this->end_controls_section();

		/**
		 * Style Tab: Album Cover
		 */
		$this->start_controls_section(
			'section_cover_style',
			array(
				'label'     => esc_html__( 'Album Cover', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_album_cover_style' );

		$this->start_controls_tab(
			'tab_album_cover_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'album_cover_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-album-cover',
				'condition'   => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-cover' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_image_scale',
			array(
				'label'     => esc_html__( 'Image Scale', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => array(
					'size' => 1,
				),
				'range'     => array(
					'px' => array(
						'min'  => 1,
						'max'  => 2,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover img' => 'transform: scale({{SIZE}});',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'album_cover_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-album-cover',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name'      => 'album_cover_css_filters',
				'selector'  => '{{WRAPPER}} .pp-album-cover img',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_image_filter',
			array(
				'label'        => esc_html__( 'Image Filter', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'normal',
				'options'      => Module::get_image_filters(),
				'prefix_class' => 'pp-ins-',
				'condition'    => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_album_cover_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_image_scale_hover',
			array(
				'label'     => esc_html__( 'Image Scale', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => array(
					'size' => 1,
				),
				'range'     => array(
					'px' => array(
						'min'  => 1,
						'max'  => 2,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover:hover img' => 'transform: scale({{SIZE}});',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'album_cover_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-album-cover:hover',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name'      => 'album_cover_css_filters_hover',
				'selector'  => '{{WRAPPER}} .pp-album-cover:hover img',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_cover_image_filter_hover',
			array(
				'label'        => esc_html__( 'Image Filter', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'normal',
				'options'      => Module::get_image_filters(),
				'prefix_class' => 'pp-ins-hover-',
				'condition'    => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->add_control(
			'album_cover_overlay_style_heading',
			array(
				'label'     => esc_html__( 'Cover Overlay', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_album_cover_overlay_style' );

		$this->start_controls_tab(
			'tab_album_cover_overlay_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'album_cover_overlay_background',
				'types'     => array( 'classic', 'gradient' ),
				'selector'  => '{{WRAPPER}} .pp-album-cover-overlay',
				'exclude'   => array(
					'image',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'overlay_margin',
			array(
				'label'      => esc_html__( 'Margin', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-cover-overlay' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_album_cover_overlay_hover',
			array(
				'label' => esc_html__( 'Hover', 'powerpack' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'album_cover_overlay_background_hover',
				'types'     => array( 'classic', 'gradient' ),
				'selector'  => '{{WRAPPER}} .pp-album-cover:hover .pp-album-cover-overlay',
				'exclude'   => array(
					'image',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		/**
		 * Style Tab: Album Cover Content
		 */
		$this->start_controls_section(
			'section_cover_content_style',
			array(
				'label'     => esc_html__( 'Album Cover Content', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'cover_content_vertical_align',
			array(
				'label'                => esc_html__( 'Vertical Align', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
				'options'              => array(
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
				'default'              => 'middle',
				'selectors'            => array(
					'{{WRAPPER}} .pp-album-content-wrap' => 'justify-content: {{VALUE}};',
					'{{WRAPPER}}.pp-album-cover-button-position-inline .pp-album-content' => 'align-items: {{VALUE}};',
				),
				'selectors_dictionary' => array(
					'top'    => 'flex-start',
					'bottom' => 'flex-end',
					'middle' => 'center',
				),
				'condition'            => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'cover_content_horizontal_align',
			array(
				'label'                => esc_html__( 'Horizontal Align', 'powerpack' ),
				'type'                 => Controls_Manager::CHOOSE,
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
				'selectors'            => array(
					'{{WRAPPER}} .pp-album-content-wrap' => 'align-items: {{VALUE}};',
				),
				'selectors_dictionary' => array(
					'left'    => 'flex-start',
					'right'   => 'flex-end',
					'center'  => 'center',
					'justify' => 'stretch',
				),
				'condition'            => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'cover_content_text_align',
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
				'default'   => 'center',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-content' => 'text-align: {{VALUE}};',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'cover_content_margin',
			array(
				'label'      => esc_html__( 'Margin', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-content' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'separator'  => 'before',
				'condition'  => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_responsive_control(
			'cover_content_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_cover_content_style' );

		$this->start_controls_tab(
			'tab_cover_content_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'cover_content_background',
				'types'     => array( 'classic', 'gradient' ),
				'selector'  => '{{WRAPPER}} .pp-album-content',
				'exclude'   => array(
					'image',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'cover_content_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-album-content',
				'condition'   => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'cover_content_border_radius_normal',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-content' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_icon_style_heading',
			array(
				'label'     => esc_html__( 'Icon', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'trigger'                   => 'cover',
					'select_album_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'album_icon_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-icon'     => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-album-icon svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'trigger'                   => 'cover',
					'select_album_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'album_icon_size',
			array(
				'label'      => esc_html__( 'Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => '',
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'min'  => 1,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-icon' => 'font-size: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'trigger'                   => 'cover',
					'select_album_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'icon_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => '',
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-icon' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'trigger'                   => 'cover',
					'select_album_icon[value]!' => '',
				),
			)
		);

		$this->add_control(
			'album_title_style_heading',
			array(
				'label'     => esc_html__( 'Title', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'trigger'      => 'cover',
					'album_title!' => '',
				),
			)
		);

		$this->add_control(
			'album_title_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-title' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'      => 'cover',
					'album_title!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'album_title_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector'  => '{{WRAPPER}} .pp-album-title',
				'condition' => array(
					'trigger'      => 'cover',
					'album_title!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'title_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => '',
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-title' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'trigger'      => 'cover',
					'album_title!' => '',
				),
			)
		);

		$this->add_control(
			'album_subtitle_style_heading',
			array(
				'label'     => esc_html__( 'Subtitle', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'trigger'         => 'cover',
					'album_subtitle!' => '',
				),
			)
		);

		$this->add_control(
			'album_subtitle_text_color',
			array(
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-subtitle' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'         => 'cover',
					'album_subtitle!' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'album_subtitle_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector'  => '{{WRAPPER}} .pp-album-subtitle',
				'condition' => array(
					'trigger'         => 'cover',
					'album_subtitle!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'subtitle_spacing',
			array(
				'label'      => esc_html__( 'Spacing', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => array(
					'size' => '',
					'unit' => 'px',
				),
				'range'      => array(
					'px' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-subtitle' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				),
				'condition'  => array(
					'trigger'         => 'cover',
					'album_subtitle!' => '',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_cover_content_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name'      => 'cover_content_background_hover',
				'types'     => array( 'classic', 'gradient' ),
				'selector'  => '{{WRAPPER}} .pp-album-cover:hover .pp-album-content',
				'exclude'   => array(
					'image',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->add_control(
			'album_icon_color_hover',
			array(
				'label'     => esc_html__( 'Icon Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover:hover .pp-album-icon' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'     => 'cover',
					'album_icon!' => '',
				),
			)
		);

		$this->add_control(
			'album_title_color_hover',
			array(
				'label'     => esc_html__( 'Title Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover:hover .pp-album-title' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'      => 'cover',
					'album_title!' => '',
				),
			)
		);

		$this->add_control(
			'album_subtitle_color_hover',
			array(
				'label'     => esc_html__( 'Subtitle Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover:hover .pp-album-subtitle' => 'color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'         => 'cover',
					'album_subtitle!' => '',
				),
			)
		);

		$this->add_control(
			'cover_content_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover:hover .pp-album-content' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'cover_content_blend_mode',
			array(
				'label'     => esc_html__( 'Blend Mode', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => array(
					''            => esc_html__( 'Normal', 'powerpack' ),
					'multiply'    => 'Multiply',
					'screen'      => 'Screen',
					'overlay'     => 'Overlay',
					'darken'      => 'Darken',
					'lighten'     => 'Lighten',
					'color-dodge' => 'Color Dodge',
					'saturation'  => 'Saturation',
					'color'       => 'Color',
					'difference'  => 'Difference',
					'exclusion'   => 'Exclusion',
					'hue'         => 'Hue',
					'luminosity'  => 'Luminosity',
				),
				'selectors' => array(
					'{{WRAPPER}} .pp-album-content' => 'mix-blend-mode: {{VALUE}}',
				),
				'separator' => 'before',
				'condition' => array(
					'trigger' => 'cover',
				),
			)
		);

		$this->end_controls_section();

		/**
		 * Style Tab: Album Cover Button
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_album_cover_button_style',
			array(
				'label'     => esc_html__( 'Album Cover Button', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_size',
			array(
				'label'     => esc_html__( 'Size', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'xs',
				'options'   => array(
					'xs' => esc_html__( 'Extra Small', 'powerpack' ),
					'sm' => esc_html__( 'Small', 'powerpack' ),
					'md' => esc_html__( 'Medium', 'powerpack' ),
					'lg' => esc_html__( 'Large', 'powerpack' ),
					'xl' => esc_html__( 'Extra Large', 'powerpack' ),
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_album_cover_button_style' );

		$this->start_controls_tab(
			'tab_album_cover_button_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_text_color_normal',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover-button' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-album-cover-button svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover-button' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'album_cover_button_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-album-cover-button',
				'condition'   => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-cover-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'album_cover_button_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-album-cover-button',
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_responsive_control(
			'album_cover_button_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-cover-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'album_cover_button_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-album-cover-button',
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_icon_heading',
			array(
				'label'     => esc_html__( 'Button Icon', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
					'select_album_cover_button_icon[value]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'album_cover_button_icon_margin',
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
					'{{WRAPPER}} .pp-album-cover-button .pp-button-icon' => 'margin-top: {{TOP}}{{UNIT}}; margin-left: {{LEFT}}{{UNIT}}; margin-right: {{RIGHT}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
				),
				'condition'   => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
					'select_album_cover_button_icon[value]!' => '',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_album_cover_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_text_color_hover',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover-button:hover' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-album-cover-button:hover svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_bg_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover-button:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-cover-button:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_control(
			'album_cover_button_animation',
			array(
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::HOVER_ANIMATION,
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'album_cover_button_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-album-cover-button:hover',
				'condition' => array(
					'trigger'            => 'cover',
					'album_cover_button' => 'yes',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();

		/**
		 * Style Tab: Album Trigger Button
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_album_trigger_button_style',
			array(
				'label'     => esc_html__( 'Album Trigger Button', 'powerpack' ),
				'tab'       => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_size',
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
					'trigger' => 'button',
				),
			)
		);

		$this->add_responsive_control(
			'album_trigger_button_alignment',
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
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-trigger-button-wrap' => 'text-align: {{VALUE}};',
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->start_controls_tabs( 'tabs_album_trigger_button_style' );

		$this->start_controls_tab(
			'tab_album_trigger_button_normal',
			array(
				'label'     => esc_html__( 'Normal', 'powerpack' ),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_text_color_normal',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-trigger-button' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-album-trigger-button svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_bg_color_normal',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'global'    => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-trigger-button' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'album_trigger_button_border_normal',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '{{WRAPPER}} .pp-album-trigger-button',
				'condition'   => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-trigger-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'album_trigger_button_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '{{WRAPPER}} .pp-album-trigger-button',
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_responsive_control(
			'album_trigger_button_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'{{WRAPPER}} .pp-album-trigger-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition'  => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'album_trigger_button_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-album-trigger-button',
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_album_trigger_button_hover',
			array(
				'label'     => esc_html__( 'Hover', 'powerpack' ),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_text_color_hover',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-trigger-button:hover' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-album-trigger-button:hover svg' => 'fill: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_bg_color_hover',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-trigger-button:hover' => 'background-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_border_color_hover',
			array(
				'label'     => esc_html__( 'Border Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .pp-album-trigger-button:hover' => 'border-color: {{VALUE}}',
				),
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_control(
			'album_trigger_button_animation',
			array(
				'label'     => esc_html__( 'Animation', 'powerpack' ),
				'type'      => Controls_Manager::HOVER_ANIMATION,
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'album_trigger_button_box_shadow_hover',
				'selector'  => '{{WRAPPER}} .pp-album-trigger-button:hover',
				'condition' => array(
					'trigger' => 'button',
				),
			)
		);

		$this->end_controls_tab();
		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute(
			'album',
			array(
				'class'   => 'pp-album',
				'data-id' => 'pp-album-' . esc_attr( $this->get_id() ) . '-' . esc_attr( get_the_ID() ),
			)
		);

		if ( 'cover' === $settings['trigger'] ) {
			$this->add_render_attribute( 'album', 'class', array( 'pp-album-cover-wrap', 'pp-ins-filter-hover' ) );
		}

		if ( 'fancybox' === $settings['lightbox_library'] ) {
			if ( 'bottom' === $settings['thumbs_position'] ) {
				$this->add_render_attribute(
					'album',
					array(
						'data-fancybox-class' => 'pp-fancybox-thumbs-x',
						'data-fancybox-axis'  => 'x',
					)
				);
			} else {
				$this->add_render_attribute(
					'album',
					array(
						'data-fancybox-class' => 'pp-fancybox-thumbs-y',
						'data-fancybox-axis'  => 'y',
					)
				);
			}
		}

		$this->add_render_attribute( 'album-gallery', 'class', 'pp-album-gallery pp-hidden' );
		?>
		<div class="pp-album-container">
			<?php if ( ! empty( $settings['album_images'] ) ) { ?>
			<div <?php $this->print_render_attribute_string( 'album' ); ?>>
				<?php
				if ( 'cover' === $settings['trigger'] ) {
					// Album Cover
					$this->render_album_cover();
				} else {
					// Album Trigger Button
					echo $this->get_album_trigger_button(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
				?>
				<div <?php $this->print_render_attribute_string( 'album-gallery' ); ?>>
					<?php
						$this->render_album_images();
					?>
				</div>
			</div>
				<?php
			} else {
				$placeholder = esc_html__( 'Choose some images for album in widget settings.', 'powerpack' );

				echo $this->render_editor_placeholder(
					array(
						'title' => esc_html__( 'Album is empty!', 'powerpack' ),
						'body'  => $placeholder,
					)
				);
			}
			?>
		</div>
		<?php
	}

	protected function render_album_images() {
		$settings = $this->get_settings_for_display();
		$gallery  = $settings['album_images'];
		$is_first = true;
		foreach ( $gallery as $index => $item ) {
			if ( $is_first ) {
				$is_first = false;
				continue;
			}

			$image_key = $this->get_repeater_setting_key( 'image', 'album_images', $index );

			$image_url = Group_Control_Image_Size::get_attachment_image_src( $item['id'], 'image', $settings );

			$thumbs_url = wp_get_attachment_image_src( $item['id'], 'thumbnail' );

			$this->add_render_attribute(
				$image_key,
				array(
					'class' => 'pp-album-image',
				)
			);

			$this->get_lightbox_atts( $image_key, $item, $image_url, $index );

			$thumbs_html = '';

			$settings['toolbar_buttons'] = isset( $settings['toolbar_buttons'] ) ? $settings['toolbar_buttons'] : [];

			if ( 'fancybox' === $settings['lightbox_library'] ) {
				if ( in_array( 'thumbs', $settings['toolbar_buttons'] ) || 'yes' === $settings['thumbs_auto_start'] ) {
					$thumbs_html = '<img src="' . $thumbs_url[0] . '">';
				}
			}

			echo '<a ' . wp_kses_post( $this->get_render_attribute_string( $image_key ) ) . '>' . wp_kses_post( $thumbs_html ) . '</a>';
		}
	}

	protected function render_album_cover() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute(
			'album-cover',
			array(
				'class' => array( 'pp-album-cover', 'pp-ins-filter-target' ),
			)
		);

		$link_key = 'album-cover-link';

		$album = $settings['album_images'];

		if ( ! empty( $album ) ) {
			$album_first_item = $album[0];
			$album_image_url  = Group_Control_Image_Size::get_attachment_image_src( $album_first_item['id'], 'image', $settings );

			$this->get_lightbox_atts( $link_key, $album_first_item, $album_image_url );
			?>
			<a <?php $this->print_render_attribute_string( $link_key ); ?>>
				<div <?php $this->print_render_attribute_string( 'album-cover' ); ?>>
				<?php
				if ( 'custom_img' === $settings['album_cover_type'] ) {
					$image_html = Group_Control_Image_Size::get_attachment_image_html( $settings, 'album_cover', 'album_cover' );
				} else {
					$cover_image_id  = $album_first_item['id'];
					$cover_image_url = Group_Control_Image_Size::get_attachment_image_src( $cover_image_id, 'album_cover', $settings );

					$image_html = '<img src="' . $cover_image_url . '" alt="' . esc_attr( Control_Media::get_image_alt( $album_first_item ) ) . '"/>';
				}

					$image_html .= $this->render_image_overlay();

					$image_html .= $this->get_album_content();

					echo wp_kses_post( $image_html );
				?>
				</div>
			</a>
			<?php
		}
	}

	protected function get_album_content() {
		$settings = $this->get_settings_for_display();

		ob_start();
		if ( ! isset( $settings['album_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['album_icon'] = '';
		}

		$has_icon = ! empty( $settings['album_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['album_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_icon && ! empty( $settings['select_album_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_album_icon'] );
		$is_new   = ! isset( $settings['album_icon'] ) && Icons_Manager::is_migration_allowed();

		$content_html = '';
		$is_icon      = '';

		if ( $has_icon || $settings['album_title'] || $settings['album_subtitle'] || 'yes' === $settings['album_cover_button'] ) {
			?>
			<div class="pp-album-content-wrap pp-media-content">
				<div class="pp-album-content">
					<div class="pp-album-content-inner">
						<?php if ( $has_icon ) { ?>
							<div class="pp-icon pp-album-icon">
								<?php
								if ( $is_new || $migrated ) {
									Icons_Manager::render_icon( $settings['select_album_icon'], array( 'aria-hidden' => 'true' ) );
								} elseif ( ! empty( $settings['album_icon'] ) ) {
									?>
									<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
									<?php
								}
								?>
							</div>
						<?php } ?>
						<?php
						if ( $settings['album_title'] ) {
							echo wp_kses_post( $this->get_album_title() );
						}

						if ( $settings['album_subtitle'] ) {
							echo wp_kses_post( $this->get_album_subtitle() );
						}
						?>
					</div>
					<?php
					if ( 'yes' === $settings['album_cover_button'] ) {
						echo wp_kses_post( $this->get_album_cover_button() );
					}
					?>
				</div>
			</div>
			<?php
		}

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	protected function get_album_title() {
		$settings = $this->get_settings_for_display();

		$title_html = '';

		$this->add_render_attribute( 'album_title', 'class', 'pp-album-title' );

		$title_html     .= sprintf( '<%1$s %2$s>', $settings['album_title_html_tag'], $this->get_render_attribute_string( 'album_title' ) );
			$title_html .= $settings['album_title'];
		$title_html     .= sprintf( '</%1$s>', $settings['album_title_html_tag'] );

		return $title_html;
	}

	protected function get_album_subtitle() {
		$settings = $this->get_settings_for_display();

		$subtitle_html = '';

		$this->add_render_attribute( 'album_subtitle', 'class', 'pp-album-subtitle' );

		$subtitle_html     .= sprintf( '<%1$s %2$s>', $settings['album_subtitle_html_tag'], $this->get_render_attribute_string( 'album_subtitle' ) );
			$subtitle_html .= $settings['album_subtitle'];
		$subtitle_html     .= sprintf( '</%1$s>', $settings['album_subtitle_html_tag'] );

		return $subtitle_html;
	}

	protected function get_album_cover_button() {
		$settings = $this->get_settings_for_display();
		ob_start();

		$this->add_render_attribute(
			'cover-button',
			'class',
			array(
				'pp-album-cover-button',
				'elementor-button',
				'elementor-size-' . $settings['album_cover_button_size'],
			)
		);

		if ( $settings['album_cover_button_animation'] ) {
			$this->add_render_attribute( 'cover-button', 'class', 'elementor-animation-' . $settings['album_cover_button_animation'] );
		}

		if ( ! isset( $settings['album_cover_button_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['album_cover_button_icon'] = '';
		}

		$has_icon = ! empty( $settings['album_cover_button_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['album_cover_button_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		$icon_attributes = $this->get_render_attribute_string( 'album_cover_button_icon' );

		if ( ! $has_icon && ! empty( $settings['select_album_cover_button_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_album_cover_button_icon'] );
		$is_new   = ! isset( $settings['album_cover_button_icon'] ) && Icons_Manager::is_migration_allowed();
		?>
		<div class="pp-album-cover-button-wrap">
			<div <?php $this->print_render_attribute_string( 'cover-button' ); ?>>
				<?php if ( ! empty( $settings['album_cover_button_icon'] ) || ( ! empty( $settings['select_album_cover_button_icon']['value'] ) && $is_new ) ) { ?>
					<?php if ( 'before' === $settings['album_cover_button_icon_position'] ) { ?>
					<span class="pp-button-icon pp-icon pp-no-trans">
						<?php
						if ( $is_new || $migrated ) {
							Icons_Manager::render_icon( $settings['select_album_cover_button_icon'], array( 'aria-hidden' => 'true' ) );
						} elseif ( ! empty( $settings['album_cover_button_icon'] ) ) {
							?>
							<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
							<?php
						}
						?>
					</span>
				<?php } ?>
				<?php } ?>
				<?php if ( ! empty( $settings['album_cover_button_text'] ) ) { ?>
					<span <?php $this->print_render_attribute_string( 'album_cover_button_text' ); ?>>
						<?php echo esc_attr( $settings['album_cover_button_text'] ); ?>
					</span>
				<?php } ?>
				<?php if ( ! empty( $settings['album_cover_button_icon'] ) || ( ! empty( $settings['select_album_cover_button_icon']['value'] ) && $is_new ) ) { ?>
					<?php if ( 'after' === $settings['album_cover_button_icon_position'] ) { ?>
					<span class="pp-button-icon pp-icon pp-no-trans">
						<?php
						if ( $is_new || $migrated ) {
							Icons_Manager::render_icon( $settings['select_album_cover_button_icon'], array( 'aria-hidden' => 'true' ) );
						} elseif ( ! empty( $settings['album_cover_button_icon'] ) ) {
							?>
							<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
							<?php
						}
						?>
					</span>
				<?php } ?>
				<?php } ?>
			</div>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	protected function get_album_trigger_button() {
		$settings = $this->get_settings_for_display();
		ob_start();

		$this->add_render_attribute(
			'trigger-button',
			'class',
			array(
				'pp-album-trigger-button',
				'elementor-button',
				'elementor-size-' . $settings['album_trigger_button_size'],
			)
		);

		if ( $settings['album_cover_button_animation'] ) {
			$this->add_render_attribute( 'trigger-button', 'class', 'elementor-animation-' . $settings['album_cover_button_animation'] );
		}

		$album            = $settings['album_images'];
		$album_first_item = $album[0];
		$album_image_url  = Group_Control_Image_Size::get_attachment_image_src( $album_first_item['id'], 'image', $settings );

		$this->get_lightbox_atts( 'trigger-button', $album_first_item, $album_image_url );

		$this->add_render_attribute( 'trigger-button-content', 'class', 'pp-album-button-content' );

		if ( ! isset( $settings['album_trigger_button_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['album_trigger_button_icon'] = 'fa fa-star';
		}

		$has_icon = ! empty( $settings['album_trigger_button_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['album_trigger_button_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		$icon_attributes = $this->get_render_attribute_string( 'album_trigger_button_icon' );

		if ( ! $has_icon && ! empty( $settings['select_album_trigger_button_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_album_trigger_button_icon'] );
		$is_new   = ! isset( $settings['album_trigger_button_icon'] ) && Icons_Manager::is_migration_allowed();

		if ( ! empty( $settings['album_trigger_button_icon'] ) || ( ! empty( $settings['select_album_trigger_button_icon']['value'] ) && $is_new ) ) {
			$this->add_render_attribute( 'trigger-button', 'class', 'pp-album-trigger-icon-' . $settings['album_trigger_button_icon_position'] );
		}
		?>
		<div class="pp-album-trigger-button-wrap">
			<a <?php $this->print_render_attribute_string( 'trigger-button' ); ?>>
				<span <?php $this->print_render_attribute_string( 'trigger-button-content' ); ?>>
					<?php if ( ! empty( $settings['album_trigger_button_text'] ) ) { ?>
						<span <?php $this->print_render_attribute_string( 'album_trigger_button_text' ); ?>>
							<?php echo esc_attr( $settings['album_trigger_button_text'] ); ?>
						</span>
					<?php } ?>
					<?php if ( ! empty( $settings['album_trigger_button_icon'] ) || ( ! empty( $settings['select_album_trigger_button_icon']['value'] ) && $is_new ) ) { ?>
						<span class="pp-button-icon pp-icon">
						<?php
						if ( $is_new || $migrated ) {
							Icons_Manager::render_icon( $settings['select_album_trigger_button_icon'], array( 'aria-hidden' => 'true' ) );
						} elseif ( ! empty( $settings['album_trigger_button_icon'] ) ) {
							?>
							<i <?php $this->print_render_attribute_string( 'i' ); ?>></i>
							<?php
						}
						?>
						</span>
					<?php } ?>
				</span>
			</a>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	protected function get_lightbox_atts( $key = '', $item = '', $link = '', $index = 0 ) {
		$settings = $this->get_settings_for_display();

		if ( 'fancybox' === $settings['lightbox_library'] ) {
			$this->add_render_attribute(
				$key,
				array(
					'data-elementor-open-lightbox' => 'no',
					'data-fancybox'                => 'pp-album-' . esc_attr( $this->get_id() ) . '-' . esc_attr( get_the_ID() ),
				)
			);

			if ( $settings['lightbox_caption'] ) {
				$caption = Module::get_image_caption( $item['id'], $settings['lightbox_caption'] );

				$this->add_render_attribute( $key, 'data-caption', $caption );
			}

			$this->add_render_attribute( $key, 'data-src', esc_url( $link ) );
		} else {
			$this->add_lightbox_data_attributes( $key, $item['id'], 'yes', $this->get_id() );

			if ( $settings['lightbox_caption'] ) {
				$caption = Module::get_image_caption( $item['id'], $settings['lightbox_caption'] );

				$this->add_render_attribute( $key, 'data-elementor-lightbox-title', $caption );
			}

			if ( $settings['lightbox_description'] ) {
				$description = Module::get_image_caption( $item['id'], $settings['lightbox_description'] );

				$this->add_render_attribute( $key, 'data-elementor-lightbox-description', $description );
			}

			$this->add_render_attribute(
				$key,
				array(
					'href'  => esc_url( $link ),
					'class' => 'elementor-clickable',
				)
			);
		}
	}

	protected function render_image_overlay() {
		return '<div class="pp-album-cover-overlay pp-media-overlay"></div>';
	}
}
