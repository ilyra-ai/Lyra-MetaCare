<?php
namespace PowerpackElements\Modules\GoogleMaps\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Google Maps Widget
 */
class Google_Maps extends Powerpack_Widget {

	/**
	 * Retrieve Google Maps widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Google_Maps' );
	}

	/**
	 * Retrieve Google Maps widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Google_Maps' );
	}

	/**
	 * Retrieve Google Maps widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Google_Maps' );
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
		return parent::get_widget_keywords( 'Google_Maps' );
	}

	protected function is_dynamic_content(): bool {
		return false;
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
		return [ 'widget-pp-google-maps' ];
	}

	/**
	 * Retrieve the list of scripts the Google Maps widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'pp-google-maps-lib',
			'pp-google-maps',
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Google Maps widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_map_addresses_controls();
		$this->register_content_map_settings_controls();
		$this->register_content_map_controls_controls();
		$this->register_content_map_style_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_map_controls();
		$this->register_style_info_window_controls();
	}

	protected function register_content_map_addresses_controls() {
		/**
		 * Content Tab: Addresses
		 */
		$this->start_controls_section(
			'section_map_addresses',
			[
				'label' => esc_html__( 'Addresses', 'powerpack' ),
			]
		);

		$this->add_control(
			'map_source',
			[
				'label'   => esc_html__( 'Map Source', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'custom',
				'options' => [
					'custom' => esc_html__( 'Custom', 'powerpack' ),
					'acf'    => esc_html__( 'ACF Google Map Field', 'powerpack' ),
				],
			]
		);

		if ( class_exists( 'acf' ) ) {
			$this->add_control(
				'acf_map_field',
				array(
					'label'         => esc_html__( 'ACF Map Field', 'powerpack' ),
					'type'          => 'pp-query',
					'post_type'     => '',
					'options'       => [],
					'query_type'    => 'acf',
					'label_block'   => true,
					'multiple'      => false,
					'query_options' => [
						'show_type'       => false,
						'field_type'      => [
							'googlemap',
						],
						'show_field_type' => true,
					],
					'condition'      => [
						'map_source' => 'acf',
					],
				)
			);

			$this->add_control(
				'acf_map_marker_icon_type',
				[
					'label'     => esc_html__( 'Marker Icon', 'powerpack' ),
					'type'      => Controls_Manager::SELECT,
					'default'   => 'default',
					'options'   => [
						'default' => esc_html__( 'Default', 'powerpack' ),
						'custom'  => esc_html__( 'Custom', 'powerpack' ),
						'acf'     => esc_html__( 'ACF Image Field', 'powerpack' ),
					],
					'condition' => [
						'map_source' => 'acf',
					],
				]
			);
	
			$this->add_control(
				'acf_map_marker_icon',
				[
					'label'     => esc_html__( 'Custom Marker Icon', 'powerpack' ),
					'type'      => Controls_Manager::MEDIA,
					'dynamic'   => [
						'active'   => true,
					],
					'condition' => [
						'map_source' => 'acf',
						'acf_map_marker_icon_type' => 'custom',
					],
				]
			);

			$this->add_control(
				'acf_map_marker_image',
				array(
					'label'         => esc_html__( 'ACF Map Marker Field', 'powerpack' ),
					'type'          => 'pp-query',
					'post_type'     => '',
					'options'       => [],
					'query_type'    => 'acf',
					'label_block'   => true,
					'multiple'      => false,
					'query_options' => [
						'show_type'       => false,
						'field_type'      => [
							'media',
						],
						'show_field_type' => true,
					],
					'condition'      => [
						'map_source' => 'acf',
						'acf_map_marker_icon_type' => 'acf',
					],
				)
			);

			$this->add_control(
				'acf_map_custom_marker_size',
				[
					'label'     => esc_html__( 'Size', 'powerpack' ),
					'type'      => Controls_Manager::NUMBER,
					'default'   => 30,
					'min'       => 5,
					'max'       => 100,
					'step'      => 1,
					'condition' => [
						'map_source' => 'acf',
						'acf_map_marker_icon_type' => ['custom', 'acf'],
					],
				]
			);
		} else {
			$this->add_control(
				'acf_map_field_note',
				[
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => esc_html__( 'Make sure Advanced Custom Fields plugin is installed and activated.', 'powerpack' ),
					'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
					'condition'       => [
						'map_source' => 'acf',
					],
				]
			);
		}

		$repeater = new Repeater();

		$repeater->add_control(
			'map_latitude',
			[
				'label'           => esc_html__( 'Latitude', 'powerpack' ),
				'description'     => sprintf( '<a href="https://www.latlong.net/" target="_blank">%1$s</a> %2$s', esc_html__( 'Click here', 'powerpack' ), esc_html__( 'to find Latitude and Longitude of your location', 'powerpack' ) ),
				'type'            => Controls_Manager::TEXT,
				'label_block'     => true,
				'dynamic'         => [
					'active'   => true,
				],
			]
		);

		$repeater->add_control(
			'map_longitude',
			[
				'label'           => esc_html__( 'Longitude', 'powerpack' ),
				'description'     => sprintf( '<a href="https://www.latlong.net/" target="_blank">%1$s</a> %2$s', esc_html__( 'Click here', 'powerpack' ), esc_html__( 'to find Latitude and Longitude of your location', 'powerpack' ) ),
				'type'            => Controls_Manager::TEXT,
				'label_block'     => true,
				'dynamic'         => [
					'active'   => true,
				],
			]
		);

		$repeater->add_control(
			'map_title',
			[
				'label'           => esc_html__( 'Address Title', 'powerpack' ),
				'type'            => Controls_Manager::TEXT,
				'label_block'     => true,
				'dynamic'         => [
					'active'   => true,
				],
			]
		);

		$repeater->add_control(
			'map_marker_infowindow',
			[
				'label'           => esc_html__( 'Info Window', 'powerpack' ),
				'type'            => Controls_Manager::SWITCHER,
				'default'         => 'no',
				'label_on'        => esc_html__( 'On', 'powerpack' ),
				'label_off'       => esc_html__( 'Off', 'powerpack' ),
				'return_value'    => 'yes',
			]
		);

		$repeater->add_control(
			'map_info_window_open',
			[
				'label'           => esc_html__( 'Open Info Window on Load', 'powerpack' ),
				'type'            => Controls_Manager::SWITCHER,
				'default'         => 'yes',
				'condition'      => [
					'map_marker_infowindow' => 'yes',
				],
			]
		);

		$repeater->add_control(
			'map_description',
			[
				'label'           => esc_html__( 'Address Description', 'powerpack' ),
				'type'            => Controls_Manager::TEXTAREA,
				'label_block'     => true,
				'dynamic'         => [
					'active'   => true,
				],
				'condition'      => [
					'map_marker_infowindow' => 'yes',
				],
			]
		);

		$repeater->add_control(
			'map_marker_icon_type',
			[
				'label'           => esc_html__( 'Marker Icon', 'powerpack' ),
				'type'            => Controls_Manager::SELECT,
				'default'         => 'default',
				'options'         => [
					'default'     => esc_html__( 'Default', 'powerpack' ),
					'custom'      => esc_html__( 'Custom', 'powerpack' ),
				],
			]
		);

		$repeater->add_control(
			'map_marker_icon',
			[
				'label'           => esc_html__( 'Custom Marker Icon', 'powerpack' ),
				'type'            => Controls_Manager::MEDIA,
				'dynamic'         => [
					'active'   => true,
				],
				'condition'      => [
					'map_marker_icon_type' => 'custom',
				],
			]
		);

		$repeater->add_control(
			'map_custom_marker_size',
			[
				'label'           => esc_html__( 'Size', 'powerpack' ),
				'type'            => Controls_Manager::NUMBER,
				'default'         => 30,
				'min'             => 5,
				'max'             => 100,
				'step'            => 1,
				'condition'      => [
					'map_marker_icon_type' => 'custom',
				],
			]
		);

		$this->add_control(
			'pp_map_addresses',
			[
				'label'       => '',
				'type'        => Controls_Manager::REPEATER,
				'default'     => [
					[
						'map_latitude'    => 24.553311,
						'map_longitude'   => 73.694076,
						'map_title'       => esc_html__( 'IdeaBox Creations', 'powerpack' ),
						'map_description' => esc_html__( 'Add description to your map pins', 'powerpack' ),
					],
				],
				'fields'      => $repeater->get_controls(),
				'title_field' => '<i class="fa fa-map-marker"></i> {{{ map_title }}}',
				'condition'   => [
					'map_source!' => 'acf',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_map_settings_controls() {
		/**
		 * Content Tab: Settings
		 */
		$this->start_controls_section(
			'section_map_settings',
			[
				'label'                 => esc_html__( 'Settings', 'powerpack' ),
			]
		);

		$this->add_control(
			'zoom_type',
			[
				'label'              => esc_html__( 'Zoom Type', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'custom',
				'options'            => [
					'auto'   => esc_html__( 'Auto', 'powerpack' ),
					'custom' => esc_html__( 'Custom', 'powerpack' ),
				],
			]
		);
		$this->add_control(
			'map_zoom',
			[
				'label'     => esc_html__( 'Map Zoom', 'powerpack' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => [
					'size' => 12,
				],
				'range'     => [
					'px' => [
						'min' => 0,
						'max' => 22,
					],
				],
				'condition' => [
					'zoom_type' => 'custom',
				],
			]
		);

		$this->add_control(
			'map_type',
			[
				'label'                 => esc_html__( 'Map Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'roadmap',
				'options'               => [
					'roadmap'      => esc_html__( 'Road Map', 'powerpack' ),
					'satellite'    => esc_html__( 'Satellite', 'powerpack' ),
					'hybrid'       => esc_html__( 'Hybrid', 'powerpack' ),
					'terrain'      => esc_html__( 'Terrain', 'powerpack' ),
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'marker_animation',
			[
				'label'                 => esc_html__( 'Marker Animation', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => '',
				'options'               => [
					''         => esc_html__( 'None', 'powerpack' ),
					'drop'     => esc_html__( 'Drop', 'powerpack' ),
					'bounce'   => esc_html__( 'Bounce', 'powerpack' ),
				],
				'frontend_available'    => true,
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_map_controls_controls() {
		/**
		 * Content Tab: Controls
		 */
		$this->start_controls_section(
			'section_map_controls',
			[
				'label'                 => esc_html__( 'Controls', 'powerpack' ),
			]
		);

		$this->add_control(
			'map_option_streeview',
			[
				'label'                 => esc_html__( 'Street View Controls', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'On', 'powerpack' ),
				'label_off'             => esc_html__( 'Off', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'map_type_control',
			[
				'label'                 => esc_html__( 'Map Type Control', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'On', 'powerpack' ),
				'label_off'             => esc_html__( 'Off', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'zoom_control',
			[
				'label'                 => esc_html__( 'Zoom Control', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'On', 'powerpack' ),
				'label_off'             => esc_html__( 'Off', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'fullscreen_control',
			[
				'label'                 => esc_html__( 'Fullscreen Control', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'On', 'powerpack' ),
				'label_off'             => esc_html__( 'Off', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'map_scroll_zoom',
			[
				'label'                 => esc_html__( 'Scroll Wheel Zoom', 'powerpack' ),
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => 'yes',
				'label_on'              => esc_html__( 'On', 'powerpack' ),
				'label_off'             => esc_html__( 'Off', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_map_style_controls() {
		/**
		 * Content Tab: Map Style
		 */
		$this->start_controls_section(
			'section_map_theme',
			[
				'label'                 => esc_html__( 'Map Style', 'powerpack' ),
			]
		);

		$this->add_control(
			'map_theme',
			[
				'label'                 => esc_html__( 'Map Theme', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'standard',
				'options'               => [
					'standard'     => esc_html__( 'Standard', 'powerpack' ),
					'silver'       => esc_html__( 'Silver', 'powerpack' ),
					'retro'        => esc_html__( 'Retro', 'powerpack' ),
					'dark'         => esc_html__( 'Dark', 'powerpack' ),
					'night'        => esc_html__( 'Night', 'powerpack' ),
					'aubergine'    => esc_html__( 'Aubergine', 'powerpack' ),
					'custom'       => esc_html__( 'Custom', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'map_custom_style',
			[
				'label'                 => esc_html__( 'Custom Style', 'powerpack' ),
				'description'           => sprintf(
					/* translators: 1: Link opening tag, 2: Link opening tag, 3: Link closing tag. */
					esc_html__( 'Get JSON style code from %1$sSnazzy Maps%3$s or %2$sMap Style%3$s to style your map', 'powerpack' ),
					sprintf( '<a href="%s" target="_blank">', 'https://snazzymaps.com/' ),
					sprintf( '<a href="%s" target="_blank">', 'https://mapstyle.withgoogle.com/' ),
					'</a>'
				),
				'type'                  => Controls_Manager::TEXTAREA,
				'dynamic'               => [
					'active'   => true,
				],
				'ai'                    => [
					'active' => false,
				],
				'condition'             => [
					'map_theme'     => 'custom',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Google_Maps' );

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

	protected function register_style_map_controls() {
		/**
		 * Style Tab: Map
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_map_style',
			[
				'label'                 => esc_html__( 'Map', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'map_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'options'               => [
					'left'        => [
						'title'   => esc_html__( 'Left', 'powerpack' ),
						'icon'    => 'eicon-h-align-left',
					],
					'center'      => [
						'title'   => esc_html__( 'Center', 'powerpack' ),
						'icon'    => 'eicon-h-align-center',
					],
					'right'       => [
						'title'   => esc_html__( 'Right', 'powerpack' ),
						'icon'    => 'eicon-h-align-right',
					],
				],
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-google-map-container' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'map_width',
			[
				'label'                 => esc_html__( 'Width', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'default'               => [
					'size' => 100,
					'unit' => '%',
				],
				'range'                 => [
					'px' => [
						'min' => 100,
						'max' => 1920,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-map-height' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'map_height',
			[
				'label'                 => esc_html__( 'Height', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'vh', 'custom' ],
				'default'               => [
					'size' => 500,
					'unit' => 'px',
				],
				'range'                 => [
					'px' => [
						'min' => 80,
						'max' => 1200,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-map-height' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_info_window_controls() {
		/**
		 * Style Tab: Info Window
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_info_window_style',
			[
				'label'                 => esc_html__( 'Info Window', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'iw_max_width',
			[
				'label'                 => esc_html__( 'Info Window Max Width', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'default'               => [
					'size'      => 240,
				],
				'range'                 => [
					'px'        => [
						'min'   => 40,
						'max'   => 500,
						'step'  => 1,
					],
				],
			]
		);

		$this->add_responsive_control(
			'info_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .gm-style .pp-infowindow-content' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
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
				'selectors'             => [
					'{{WRAPPER}} .gm-style .pp-infowindow-title' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'title_spacing',
			[
				'label'                 => esc_html__( 'Bottom Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'range'                 => [
					'px'        => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .gm-style .pp-infowindow-title' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'title_typography',
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector'              => '{{WRAPPER}} .gm-style .pp-infowindow-title',
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
				'selectors'             => [
					'{{WRAPPER}} .gm-style .pp-infowindow-description' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'description_typography',
				'selector'              => '{{WRAPPER}} .gm-style .pp-infowindow-description',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Get map styles.
	 *
	 * @access protected
	 */
	protected function get_map_styles() {
		$pp_map_themes = array(
			'silver' => '[{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}]',
			'retro' => '[{"elementType":"geometry","stylers":[{"color":"#ebe3cd"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#523735"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f1e6"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#c9b2a6"}]},{"featureType":"administrative.land_parcel","elementType":"geometry.stroke","stylers":[{"color":"#dcd2be"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#ae9e90"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#93817c"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#a5b076"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#447530"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#f5f1e6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#fdfcf8"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#f8c967"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#e9bc62"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#e98d58"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.stroke","stylers":[{"color":"#db8555"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#806b63"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"transit.line","elementType":"labels.text.fill","stylers":[{"color":"#8f7d77"}]},{"featureType":"transit.line","elementType":"labels.text.stroke","stylers":[{"color":"#ebe3cd"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#dfd2ae"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#b9d3c2"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#92998d"}]}]',
			'dark' => '[{"elementType":"geometry","stylers":[{"color":"#212121"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#212121"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#757575"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#2c2c2c"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#373737"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#3c3c3c"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#4e4e4e"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#3d3d3d"}]}]',
			'night' => '[{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}]',
			'aubergine' => '[{"elementType":"geometry","stylers":[{"color":"#1d2c4d"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#8ec3b9"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#1a3646"}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#64779e"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"color":"#4b6878"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#334e87"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#023e58"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#283d6a"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#6f9ba5"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#023e58"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#3C7680"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#304a7d"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2c6675"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#255763"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#b0d5ce"}]},{"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"color":"#023e58"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#98a5be"}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"color":"#1d2c4d"}]},{"featureType":"transit.line","elementType":"geometry.fill","stylers":[{"color":"#283d6a"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#3a4762"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#0e1626"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#4e6d70"}]}]',
		);

		return $pp_map_themes;
	}

	/**
	 * Render google maps widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$map_styles = $this->get_map_styles();

		$i = 1;

		$this->add_render_attribute( 'google-map',
			[
				'id'            => 'pp-google-map-' . esc_attr( $this->get_id() ),
				'class'         => [ 'pp-google-map', 'pp-map-height' ],
			]
		);

		if ( 'custom' === $settings['zoom_type'] ) {
			if ( ! empty( $settings['map_zoom']['size'] ) ) {
				$this->add_render_attribute( 'google-map', 'data-zoom', $settings['map_zoom']['size'] );
				$this->add_render_attribute( 'google-map', 'data-zoomtype', $settings['zoom_type'] );
			}
		} else {
			$this->add_render_attribute( 'google-map', 'data-zoomtype', $settings['zoom_type'] );
		}

		if ( $settings['iw_max_width']['size'] ) {
			$this->add_render_attribute( 'google-map', 'data-iw-max-width', $settings['iw_max_width']['size'] );
		}

		if ( 'standard' !== $settings['map_theme'] ) {
			if ( 'custom' !== $settings['map_theme'] ) {
				$this->add_render_attribute( 'google-map', 'data-custom-style', $map_styles[ $settings['map_theme'] ] );
			} elseif ( ! empty( $settings['map_custom_style'] ) ) {
				$this->add_render_attribute( 'google-map', 'data-custom-style', $settings['map_custom_style'] );
			}
		}

		$map_locations = array();

		if ( 'acf' === $settings['map_source'] && class_exists( 'acf' ) ) {
			$acf_map_location = \get_field($settings['acf_map_field'], get_the_ID());

			if ( empty( $acf_map_location ) ) {
				return;
			}

			$map_location = array(
				'lat'  => $acf_map_location['lat'],
				'lang' => $acf_map_location['lng'],
			);

			if ( 'custom' === $settings['acf_map_marker_icon_type'] && '' !== $settings['acf_map_marker_icon']['url'] ) {
				$map_location['marker_type'] = 'custom';
				$map_location['icon_url']    = $settings['acf_map_marker_icon']['url'];
				$map_location['icon_size']   = $settings['acf_map_custom_marker_size'];
			} elseif ( 'acf' === $settings['acf_map_marker_icon_type'] && '' !== $settings['acf_map_marker_image'] ) {
				$marker_image = get_field( $settings['acf_map_marker_image'] );
				$map_location['marker_type'] = 'custom';
				$map_location['icon_url']    = ( $marker_image ) ? $marker_image['url'] : '';
				$map_location['icon_size']   = $settings['acf_map_custom_marker_size'];
			} else {
				$map_location['marker_type'] = '';
				$map_location['icon_url']    = '';
				$map_location['icon_size']   = '';
			}
	
			$map_locations[] = $map_location;
		} else {
			foreach ( $settings['pp_map_addresses'] as $index => $item ) {

				$map_location = array(
					'lat'  => $item['map_latitude'],
					'lang' => $item['map_longitude'],
				);

				if ( 'yes' === $item['map_marker_infowindow'] ) {
					$map_location['infowindow'] = 'yes';
				} else {
					$map_location['infowindow'] = '';
				}

				$map_location['title'] = $item['map_title'];
				$map_location['description'] = $item['map_description'];

				if ( 'custom' === $item['map_marker_icon_type'] && '' !== $item['map_marker_icon']['url'] ) {
					$map_location['marker_type'] = 'custom';
					$map_location['icon_url']    = $item['map_marker_icon']['url'];
					$map_location['icon_size']   = $item['map_custom_marker_size'];
				} else {
					$map_location['marker_type'] = '';
					$map_location['icon_url']    = '';
					$map_location['icon_size']   = '';
				}

				if ( 'yes' === $item['map_info_window_open'] ) {
					$map_location['iw_open'] = 'iw_open';
				} else {
					$map_location['iw_open'] = '';
				}

				$map_locations[] = $map_location;
			}
		}

		$this->add_render_attribute( 'google-map', 'data-locations', wp_json_encode( $map_locations ) );
		?>
		<div class="pp-google-map-container">
			<div <?php $this->print_render_attribute_string( 'google-map' ); ?>></div>
		</div>
		<?php
	}
}
