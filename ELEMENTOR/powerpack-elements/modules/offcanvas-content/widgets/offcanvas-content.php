<?php
namespace PowerpackElements\Modules\OffcanvasContent\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Icons_Manager;
use Elementor\Repeater;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Offcanvas Content Widget
 */
class Offcanvas_Content extends Powerpack_Widget {

	/**
	 * Retrieve offcanvas content widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Offcanvas_Content' );
	}

	/**
	 * Retrieve offcanvas content widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Offcanvas_Content' );
	}

	/**
	 * Retrieve offcanvas content widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Offcanvas_Content' );
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
		return parent::get_widget_keywords( 'Offcanvas_Content' );
	}

	protected function is_dynamic_content(): bool {
		return true;
	}

	/**
	 * Retrieve the list of scripts the offcanvas content widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'pp-offcanvas-content',
		];
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
			'pp-hamburgers',
			'widget-pp-offcanvas-content'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register offcanvas content widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_offcanvas_controls();
		$this->register_content_toggle_controls();
		$this->register_content_settings_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_offcanvas_controls();
		$this->register_style_content_controls();
		$this->register_style_toggle_controls();
		$this->register_style_close_button_controls();
		$this->register_style_overlay_controls();
	}

	/*-----------------------------------------------------------------------------------*/
	/*	CONTENT TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_content_offcanvas_controls() {

		/**
		 * Content Tab: Offcanvas Content
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_offcanvas_content',
			[
				'label' => esc_html__( 'Offcanvas Content', 'powerpack' ),
			]
		);

		$this->add_control(
			'content_type',
			[
				'label'                 => esc_html__( 'Content Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'sidebar'   => esc_html__( 'Sidebar', 'powerpack' ),
					'custom'    => esc_html__( 'Custom Content', 'powerpack' ),
					'section'   => esc_html__( 'Saved Section', 'powerpack' ),
					'widget'    => esc_html__( 'Saved Widget', 'powerpack' ),
					'template'  => esc_html__( 'Saved Page Template', 'powerpack' ),
				],
				'default'               => 'custom',
			]
		);

		global $wp_registered_sidebars;

		$options = [];

		if ( ! $wp_registered_sidebars ) {
			$options[''] = esc_html__( 'No sidebars were found', 'powerpack' );
		} else {
			$options[''] = esc_html__( 'Choose Sidebar', 'powerpack' );

			foreach ( $wp_registered_sidebars as $sidebar_id => $sidebar ) {
				$options[ $sidebar_id ] = $sidebar['name'];
			}
		}

		$default_key = array_keys( $options );
		$default_key = array_shift( $default_key );

		$this->add_control(
			'sidebar',
			[
				'label'                 => esc_html__( 'Choose Sidebar', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => $default_key,
				'options'               => $options,
				'condition'             => [
					'content_type' => 'sidebar',
				],
			]
		);

		$this->add_control(
			'saved_widget',
			[
				'label'                 => esc_html__( 'Choose Widget', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-widget',
				'condition'             => [
					'content_type'    => 'widget',
				],
			]
		);

		$this->add_control(
			'saved_section',
			[
				'label'                 => esc_html__( 'Choose Section', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-section',
				'condition'             => [
					'content_type'    => 'section',
				],
			]
		);

		$this->add_control(
			'templates',
			[
				'label'                 => esc_html__( 'Choose Template', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-page',
				'condition'             => [
					'content_type'    => 'template',
				],
			]
		);

		$this->add_control(
			'custom_content',
			[
				'label'                 => '',
				'type'                  => Controls_Manager::REPEATER,
				'default'               => [
					[
						'title'       => esc_html__( 'Box 1', 'powerpack' ),
						'description' => esc_html__( 'Text box description goes here', 'powerpack' ),
					],
					[
						'title'       => esc_html__( 'Box 2', 'powerpack' ),
						'description' => esc_html__( 'Text box description goes here', 'powerpack' ),
					],
				],
				'fields'                => [
					[
						'name'              => 'title',
						'label'             => esc_html__( 'Title', 'powerpack' ),
						'type'              => Controls_Manager::TEXT,
						'dynamic'           => [
							'active'   => true,
						],
						'default'           => esc_html__( 'Title', 'powerpack' ),
					],
					[
						'name'              => 'description',
						'label'             => esc_html__( 'Description', 'powerpack' ),
						'type'              => Controls_Manager::WYSIWYG,
						'dynamic'           => [
							'active'   => true,
						],
						'default'           => '',
					],
				],
				'title_field'           => '{{{ title }}}',
				'condition'             => [
					'content_type'  => 'custom',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_toggle_controls() {

		/**
		 * Content Tab: Toggle
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_button_settings',
			[
				'label'                 => esc_html__( 'Toggle', 'powerpack' ),
			]
		);

		$this->add_control(
			'toggle_source',
			[
				'label'                 => esc_html__( 'Toggle Source', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'burger',
				'options'               => [
					'button'        => esc_html__( 'Button', 'powerpack' ),
					'burger'        => esc_html__( 'Burger Icon', 'powerpack' ),
					'element-class' => esc_html__( 'Element Class', 'powerpack' ),
					'element-id'    => esc_html__( 'Element ID', 'powerpack' ),
				],
			]
		);

		$this->add_control(
			'toggle_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'inline',
				'options'               => [
					'inline'        => esc_html__( 'Inline', 'powerpack' ),
					'floating'      => esc_html__( 'Floating', 'powerpack' ),
				],
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
				],
			]
		);

		$this->add_control(
			'floating_toggle_placement',
			[
				'label'                 => esc_html__( 'Placement', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'middle-right',
				'options'               => [
					'top-left'      => esc_html__( 'Top Left', 'powerpack' ),
					'top-center'    => esc_html__( 'Top Center', 'powerpack' ),
					'top-right'     => esc_html__( 'Top Right', 'powerpack' ),
					'middle-left'   => esc_html__( 'Middle Left', 'powerpack' ),
					'middle-right'  => esc_html__( 'Middle Right', 'powerpack' ),
					'bottom-right'  => esc_html__( 'Bottom Right', 'powerpack' ),
					'bottom-center' => esc_html__( 'Bottom Center', 'powerpack' ),
					'bottom-left'   => esc_html__( 'Bottom Left', 'powerpack' ),
				],
				'prefix_class'          => 'pp-floating-element-align-',
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
					'toggle_position'   => 'floating',
				],
			]
		);

		$this->add_control(
			'toggle_zindex',
			[
				'label'                 => esc_html__( 'Z-Index', 'powerpack' ),
				'description'           => esc_html__( 'Adjust the z-index of the floating toggle. Defaults to 999', 'powerpack' ),
				'type'                  => Controls_Manager::NUMBER,
				'default'               => '999',
				'min'                   => 0,
				'step'                  => 1,
				'selectors'             => [
					'{{WRAPPER}} .pp-floating-element' => 'z-index: {{SIZE}};',
				],
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
					'toggle_position'   => 'floating',
				],
			]
		);

		$this->add_control(
			'toggle_class',
			[
				'label'                 => esc_html__( 'Toggle CSS Class', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'   => true,
				],
				'ai'                    => [
					'active' => false,
				],
				'default'               => '',
				'condition'             => [
					'toggle_source'     => 'element-class',
				],
			]
		);

		$this->add_control(
			'toggle_id',
			[
				'label'                 => esc_html__( 'Toggle CSS ID', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'   => true,
				],
				'ai'                    => [
					'active' => false,
				],
				'default'               => '',
				'condition'             => [
					'toggle_source'     => 'element-id',
				],
			]
		);

		$this->add_control(
			'button_text',
			[
				'label'                 => esc_html__( 'Button Text', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'   => true,
				],
				'default'               => esc_html__( 'Click Here', 'powerpack' ),
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'select_button_icon',
			[
				'label'                 => esc_html__( 'Button Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'fa4compatibility'      => 'button_icon',
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->add_control(
			'button_icon_position',
			[
				'label'                 => esc_html__( 'Icon Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'before',
				'options'               => [
					'before'    => esc_html__( 'Before', 'powerpack' ),
					'after'     => esc_html__( 'After', 'powerpack' ),
				],
				'prefix_class'          => 'pp-offcanvas-icon-',
				'condition'             => [
					'toggle_source'     => 'button',
					'select_button_icon[value]!'    => '',
				],
			]
		);

		$this->add_responsive_control(
			'button_icon_spacing',
			[
				'label'                 => esc_html__( 'Icon Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'      => 5,
					'unit'      => 'px',
				],
				'range'                 => [
					'px'        => [
						'min'   => 0,
						'max'   => 50,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}}.pp-offcanvas-icon-before .pp-offcanvas-toggle-icon' => 'margin-right: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}}.pp-offcanvas-icon-after .pp-offcanvas-toggle-icon' => 'margin-left: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'toggle_source'     => 'button',
					'select_button_icon[value]!'    => '',
				],
			]
		);

		$this->add_control(
			'toggle_effect',
			[
				'label'                 => esc_html__( 'Animation', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'arrow',
				'options'               => [
					''              => esc_html__( 'None', 'powerpack' ),
					'arrow'         => esc_html__( 'Arrow Left', 'powerpack' ),
					'arrow-r'       => esc_html__( 'Arrow Right', 'powerpack' ),
					'arrowalt'      => esc_html__( 'Arrow Alt Left', 'powerpack' ),
					'arrowalt-r'    => esc_html__( 'Arrow Alt Right', 'powerpack' ),
					'arrowturn'     => esc_html__( 'Arrow Turn Left', 'powerpack' ),
					'arrowturn-r'   => esc_html__( 'Arrow Turn Right', 'powerpack' ),
					'boring'        => esc_html__( 'Boring', 'powerpack' ),
					'collapse'      => esc_html__( 'Collapse Left', 'powerpack' ),
					'collapse-r'    => esc_html__( 'Collapse Right', 'powerpack' ),
					'elastic'       => esc_html__( 'Elastic Left', 'powerpack' ),
					'elastic-r'     => esc_html__( 'Elastic Right', 'powerpack' ),
					'emphatic'      => esc_html__( 'Emphatic Left', 'powerpack' ),
					'emphatic-r'    => esc_html__( 'Emphatic Right', 'powerpack' ),
					'minus'         => esc_html__( 'Minus', 'powerpack' ),
					'slider'        => esc_html__( 'Slider Left', 'powerpack' ),
					'slider-r'      => esc_html__( 'Slider Right', 'powerpack' ),
					'spin'          => esc_html__( 'Spin Left', 'powerpack' ),
					'spin-r'        => esc_html__( 'Spin Right', 'powerpack' ),
					'spring'        => esc_html__( 'Spring Left', 'powerpack' ),
					'spring-r'      => esc_html__( 'Spring Right', 'powerpack' ),
					'squeeze'       => esc_html__( 'Squeeze', 'powerpack' ),
					'stand'         => esc_html__( 'Stand Left', 'powerpack' ),
					'stand-r'       => esc_html__( 'Stand Right', 'powerpack' ),
					'vortex'        => esc_html__( 'Vortex Left', 'powerpack' ),
					'vortex-r'      => esc_html__( 'Vortex Right', 'powerpack' ),
					'3dx'           => esc_html__( '3DX', 'powerpack' ),
					'3dy'           => esc_html__( '3DY', 'powerpack' ),
					'3dxy'          => esc_html__( '3DXY', 'powerpack' ),
				],
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'burger',
				],
			]
		);

		$this->add_control(
			'burger_label',
			[
				'label'                 => esc_html__( 'Label', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'dynamic'               => [
					'active'   => true,
				],
				'default'               => esc_html__( 'Menu', 'powerpack' ),
				'condition'             => [
					'toggle_source'     => 'burger',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_settings_controls() {

		/**
		 * Content Tab: Settings
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_settings',
			[
				'label'                 => esc_html__( 'Settings', 'powerpack' ),
			]
		);

		$this->add_control(
			'direction',
			[
				'label'                 => esc_html__( 'Direction', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'toggle'                => false,
				'default'               => 'left',
				'options'               => [
					'left'          => [
						'title'     => esc_html__( 'Left', 'powerpack' ),
						'icon'      => 'eicon-h-align-left',
					],
					'right'         => [
						'title'     => esc_html__( 'Right', 'powerpack' ),
						'icon'      => 'eicon-h-align-right',
					],
					'top'         => [
						'title'     => esc_html__( 'Top', 'powerpack' ),
						'icon'      => 'eicon-v-align-top',
					],
					'bottom'         => [
						'title'     => esc_html__( 'Bottom', 'powerpack' ),
						'icon'      => 'eicon-v-align-bottom',
					],
				],
			]
		);

		$this->add_control(
			'content_transition',
			[
				'label'                 => esc_html__( 'Content Transition', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'slide',
				'options'               => [
					'slide'                 => esc_html__( 'Slide', 'powerpack' ),
					'reveal'                => esc_html__( 'Reveal', 'powerpack' ),
					'push'                  => esc_html__( 'Push', 'powerpack' ),
					'slide-along'           => esc_html__( 'Slide Along', 'powerpack' ),
				],
				'separator'             => 'before',
			]
		);

		$this->add_control(
			'close_button',
			[
				'label'             => esc_html__( 'Show Close Button', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => 'yes',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
				'separator'         => 'before',
			]
		);

		$this->add_control(
			'esc_close',
			[
				'label'             => esc_html__( 'Esc to Close', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => 'yes',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
			]
		);

		$this->add_control(
			'body_click_close',
			[
				'label'             => esc_html__( 'Click anywhere to Close', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => 'yes',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
			]
		);

		$this->add_control(
			'links_click_close',
			[
				'label'             => esc_html__( 'Click links to Close', 'powerpack' ),
				'description'       => esc_html__( 'Click on links inside offcanvas body to close the offcanvas bar', 'powerpack' ),
				'type'              => Controls_Manager::SWITCHER,
				'default'           => '',
				'label_on'          => esc_html__( 'Yes', 'powerpack' ),
				'label_off'         => esc_html__( 'No', 'powerpack' ),
				'return_value'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Offcanvas_Content' );

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

	protected function register_style_offcanvas_controls() {
		/**
		 * Style Tab: Offcanvas Bar
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_offcanvas_bar_style',
			[
				'label'                 => esc_html__( 'Offcanvas Bar', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'offcanvas_bar_width',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ],
				'default'               => [
					'size'      => 300,
					'unit'      => 'px',
				],
				'range'                 => [
					'px'        => [
						'min'   => 100,
						'max'   => 1000,
						'step'  => 1,
					],
					'%'         => [
						'min'   => 1,
						'max'   => 100,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'#pp-offcanvas-{{ID}}' => 'width: {{SIZE}}{{UNIT}}',
					'#pp-offcanvas-{{ID}}.pp-offcanvas-top, #pp-offcanvas-{{ID}}.pp-offcanvas-bottom' => 'width: 100%; height: {{SIZE}}{{UNIT}}',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-left .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-left .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-left .pp-offcanvas-container' => 'transform: translate3d({{SIZE}}{{UNIT}}, 0, 0)',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-right .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-right .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-right .pp-offcanvas-container' => 'transform: translate3d(-{{SIZE}}{{UNIT}}, 0, 0)',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-top .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-top .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-top .pp-offcanvas-container' => 'transform: translate3d(0, {{SIZE}}{{UNIT}}, 0)',

					'.pp-offcanvas-content-reveal.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-bottom .pp-offcanvas-container,
                    .pp-offcanvas-content-push.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-bottom .pp-offcanvas-container,
                    .pp-offcanvas-content-slide-along.pp-offcanvas-open.pp-offcanvas-{{ID}}-open.pp-offcanvas-bottom .pp-offcanvas-container' => 'transform: translate3d(0, -{{SIZE}}{{UNIT}}, 0)',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'                  => 'offcanvas_bar_bg',
				'label'                 => esc_html__( 'Background', 'powerpack' ),
				'types'                 => [ 'classic', 'gradient' ],
				'selector'              => '.pp-offcanvas-content.pp-offcanvas-{{ID}}',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'offcanvas_bar_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}}',
			]
		);

		$this->add_control(
			'offcanvas_bar_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}}' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'offcanvas_bar_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-body' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'offcanvas_bar_box_shadow',
				'selector'              => '.pp-offcanvas-{{ID}}',
				'separator'             => 'before',
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_content_controls() {

		/**
		 * Style Tab: Content
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_popup_content_style',
			[
				'label'                 => esc_html__( 'Content', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_responsive_control(
			'content_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
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
					'justify'   => [
						'title' => esc_html__( 'Justified', 'powerpack' ),
						'icon'  => 'eicon-text-align-justify',
					],
				],
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-body'   => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'widget_heading',
			[
				'label'                 => esc_html__( 'Box', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'widgets_bg_color',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-custom-widget, .pp-offcanvas-{{ID}} .widget' => 'background-color: {{VALUE}}',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'widgets_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-custom-widget, .pp-offcanvas-{{ID}} .widget',
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'widgets_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-custom-widget, .pp-offcanvas-{{ID}} .widget' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_responsive_control(
			'widgets_bottom_spacing',
			[
				'label'                 => esc_html__( 'Bottom Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'      => '20',
					'unit'      => 'px',
				],
				'range'                 => [
					'px'        => [
						'min'   => 0,
						'max'   => 60,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-custom-widget, .pp-offcanvas-{{ID}} .widget' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_responsive_control(
			'widgets_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-custom-widget, .pp-offcanvas-{{ID}} .widget' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'text_heading',
			[
				'label'                 => esc_html__( 'Text', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'content_text_color',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-body, .pp-offcanvas-{{ID}} .pp-offcanvas-body *:not(a):not(.fa):not(.eicon)' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'text_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-body, .pp-offcanvas-{{ID}} .pp-offcanvas-body *:not(a):not(.fa):not(.eicon)',
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'links_heading',
			[
				'label'                 => esc_html__( 'Links', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->start_controls_tabs( 'tabs_links_style' );

		$this->start_controls_tab(
			'tab_links_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'content_links_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-body a' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'links_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '.pp-offcanvas-{{ID}} .pp-offcanvas-body a',
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_links_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->add_control(
			'content_links_color_hover',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-body a:hover' => 'color: {{VALUE}}',
				],
				'condition'             => [
					'content_type'      => [ 'sidebar', 'custom' ],
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_toggle_controls() {

		/**
		 * Style Tab: Toggle
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_toggle_button_style',
			[
				'label'                 => esc_html__( 'Toggle', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'button_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
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
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle-wrap'   => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'button_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'default'               => 'md',
				'options'               => [
					'xs' => esc_html__( 'Extra Small', 'powerpack' ),
					'sm' => esc_html__( 'Small', 'powerpack' ),
					'md' => esc_html__( 'Medium', 'powerpack' ),
					'lg' => esc_html__( 'Large', 'powerpack' ),
					'xl' => esc_html__( 'Extra Large', 'powerpack' ),
				],
				'condition'             => [
					'toggle_source'     => 'button',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_button_style' );

		$this->start_controls_tab(
			'tab_button_normal',
			[
				'label'                 => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'button_bg_color_normal',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'button_text_color_normal',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-offcanvas-toggle svg' => 'fill: {{VALUE}}',
					'{{WRAPPER}} .pp-hamburger-inner, {{WRAPPER}} .pp-hamburger-inner::before, {{WRAPPER}} .pp-hamburger-inner::after' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'button_border_normal',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-offcanvas-toggle',
			]
		);

		$this->add_control(
			'button_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'button_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'button_box_shadow',
				'selector'              => '{{WRAPPER}} .pp-offcanvas-toggle',
			]
		);

		$this->add_control(
			'toggle_icon_heading',
			[
				'label'                 => esc_html__( 'Icon', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'burger',
				],
			]
		);

		$this->add_responsive_control(
			'toggle_icon_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'      => 1,
				],
				'range'                 => [
					'px'        => [
						'min'   => 0.1,
						'max'   => 3,
						'step'  => 0.01,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-hamburger-box' => 'font-size: {{SIZE}}em',
				],
				'condition'             => [
					'toggle_source'     => 'burger',
				],
			]
		);

		$this->add_control(
			'toggle_label_heading',
			[
				'label'                 => esc_html__( 'Label', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
				'condition'             => [
					'toggle_source'     => 'burger',
					'burger_label!'     => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'                  => 'button_typography',
				'label'                 => esc_html__( 'Typography', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-offcanvas-toggle',
				'condition'             => [
					'toggle_source'     => [ 'button', 'burger' ],
					'burger_label!'     => '',
				],
			]
		);

		$this->add_responsive_control(
			'toggle_label_spacing',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'      => '',
				],
				'range'                 => [
					'px'        => [
						'min'   => 0,
						'max'   => 30,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-hamburger-label' => 'margin-left: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'toggle_source'     => 'burger',
					'burger_label!'     => '',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			[
				'label'                 => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'button_bg_color_hover',
			[
				'label'                 => esc_html__( 'Background Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle:hover' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'button_text_color_hover',
			[
				'label'                 => esc_html__( 'Text Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle:hover' => 'color: {{VALUE}}',
					'{{WRAPPER}} .pp-offcanvas-toggle:hover svg' => 'fill: {{VALUE}}',
					'{{WRAPPER}} .pp-offcanvas-toggle:hover .pp-hamburger-inner' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-offcanvas-toggle:hover .pp-hamburger-inner:before' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .pp-offcanvas-toggle:hover .pp-hamburger-inner:after' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'button_border_color_hover',
			[
				'label'                 => esc_html__( 'Border Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'{{WRAPPER}} .pp-offcanvas-toggle:hover' => 'border-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'button_animation',
			[
				'label'                 => esc_html__( 'Animation', 'powerpack' ),
				'type'                  => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'                  => 'button_box_shadow_hover',
				'selector'              => '{{WRAPPER}} .pp-offcanvas-toggle:hover',
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function register_style_close_button_controls() {

		/**
		 * Style Tab: Close Button
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_close_button_style',
			[
				'label'                 => esc_html__( 'Close Button', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
				'condition'             => [
					'close_button' => 'yes',
				],
			]
		);

		$this->add_control(
			'close_button_align',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
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
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-header'   => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'select_close_button_icon',
			[
				'label'                 => esc_html__( 'Button Icon', 'powerpack' ),
				'type'                  => Controls_Manager::ICONS,
				'label_block'           => false,
				'fa4compatibility'      => 'close_button_icon',
				'default'               => [
					'value'     => 'fas fa-times',
					'library'   => 'fa-solid',
				],
				'recommended'           => [
					'fa-regular' => [
						'times-circle',
					],
					'fa-solid' => [
						'times',
						'times-circle',
					],
				],
				'skin'                  => 'inline',
				'condition'             => [
					'close_button' => 'yes',
				],
			]
		);

		$this->add_control(
			'close_button_text_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-close-{{ID}}' => 'color: {{VALUE}}',
					'.pp-offcanvas-close-{{ID}} svg' => 'fill: {{VALUE}}',
				],
				'condition'             => [
					'close_button' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'close_button_size',
			[
				'label'                 => esc_html__( 'Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size'      => '28',
					'unit'      => 'px',
				],
				'range'                 => [
					'px'        => [
						'min'   => 10,
						'max'   => 80,
						'step'  => 1,
					],
				],
				'selectors'             => [
					'.pp-offcanvas-{{ID}} .pp-offcanvas-close-{{ID}}' => 'font-size: {{SIZE}}{{UNIT}}',
				],
				'condition'             => [
					'close_button' => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_overlay_controls() {

		/**
		 * Style Tab: Overlay
		 * -------------------------------------------------
		 */
		$this->start_controls_section(
			'section_overlay_style',
			[
				'label'                 => esc_html__( 'Overlay', 'powerpack' ),
				'tab'                   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'overlay_bg_color',
			[
				'label'                 => esc_html__( 'Color', 'powerpack' ),
				'type'                  => Controls_Manager::COLOR,
				'default'               => '',
				'selectors'             => [
					'.pp-offcanvas-{{ID}}-open .pp-offcanvas-container:after' => 'background: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'overlay_opacity',
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
					'.pp-offcanvas-{{ID}}-open .pp-offcanvas-container:after' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->end_controls_section();

	}

	/**
	 * Render offcanvas content widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$settings_attr = array(
			'toggle_source'     => esc_attr( $settings['toggle_source'] ),
			'toggle_id'         => esc_attr( $settings['toggle_id'] ),
			'toggle_class'      => esc_attr( $settings['toggle_class'] ),
			'content_id'        => esc_attr( $this->get_id() ),
			'transition'        => esc_attr( $settings['content_transition'] ),
			'direction'         => esc_attr( $settings['direction'] ),
			'esc_close'         => esc_attr( $settings['esc_close'] ),
			'body_click_close'  => esc_attr( $settings['body_click_close'] ),
			'links_click_close' => esc_attr( $settings['links_click_close'] ),
		);

		$this->add_render_attribute( 'content-wrap', 'class', 'pp-offcanvas-content-wrap' );

		$this->add_render_attribute( 'content-wrap', 'data-settings', htmlspecialchars( wp_json_encode( $settings_attr ) ) );

		$this->add_render_attribute( 'content', [
			'id' => [
				'pp-offcanvas-' . $this->get_id(),
			],
			'class' => [
				'pp-offcanvas-content',
				'pp-offcanvas-hide',
				'pp-offcanvas-' . $this->get_id(),
				'pp-offcanvas-' . $settings_attr['transition'],
				'pp-offcanvas-' . $settings['direction'],
				'elementor-element-' . $this->get_id(),
			],
			'style' => [
				'display: none;',
			],
		] );

		$this->add_render_attribute( 'toggle-button', 'class', [
			'pp-offcanvas-toggle',
			'pp-offcanvas-toggle-' . esc_attr( $this->get_id() ),
			'elementor-button',
			'elementor-size-' . $settings['button_size'],
		] );

		if ( $settings['button_animation'] ) {
			$this->add_render_attribute( 'toggle-button', 'class', 'elementor-animation-' . $settings['button_animation'] );
		}

		$this->add_render_attribute( 'hamburger', 'class', [
			'pp-offcanvas-toggle',
			'pp-offcanvas-toggle-' . esc_attr( $this->get_id() ),
			'pp-button',
			'pp-hamburger',
			'pp-hamburger--' . $settings['toggle_effect'],
		] );
		?>
		<div <?php $this->print_render_attribute_string( 'content-wrap' ); ?>>
			<?php
			$has_placeholder = true;
			$placeholder = '';

			if ( 'button' === $settings['toggle_source'] || 'burger' === $settings['toggle_source'] ) {
				if ( 'floating' === $settings['toggle_position'] ) {
					$has_placeholder = true;
					$placeholder .= esc_html__( 'Offcanvas toggle is floating.', 'powerpack' );
				} else {
					$has_placeholder = false;
				}

				// Toggle
				$this->render_toggle();
			} else {
				$has_placeholder = true;
				$placeholder .= esc_html__( 'You have selected to open offcanvas bar using another element.', 'powerpack' );
			}

			if ( $has_placeholder ) {
				$placeholder .= ' ' . esc_html__( 'This placeholder will not be shown on the live page.', 'powerpack' );

				echo wp_kses_post( $this->render_editor_placeholder( [
					'body' => $placeholder,
				] ) );
			}
			?>
			<div <?php $this->print_render_attribute_string( 'content' ); ?>>
				<?php $this->render_close_button(); ?>
				<div class="pp-offcanvas-body">
				<?php
				if ( 'sidebar' === $settings['content_type'] ) {

					$this->render_sidebar();

				} elseif ( 'custom' === $settings['content_type'] ) {

					$this->render_custom_content();

				} elseif ( 'section' === $settings['content_type'] && ! empty( $settings['saved_section'] ) ) {

					if ( 'publish' === get_post_status( $settings['saved_section'] ) ) {
						echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $settings['saved_section'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

				} elseif ( 'template' === $settings['content_type'] && ! empty( $settings['templates'] ) ) {

					if ( 'publish' === get_post_status( $settings['templates'] ) ) {
						echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $settings['templates'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

				} elseif ( 'widget' === $settings['content_type'] && ! empty( $settings['saved_widget'] ) ) {

					if ( 'publish' === get_post_status( $settings['saved_widget'] ) ) {
						echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $settings['saved_widget'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

				}
				?>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Render toggle output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_toggle() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'toggle-wrap', 'class', 'pp-offcanvas-toggle-wrap' );

		if ( 'floating' === $settings['toggle_position'] ) {
			$this->add_render_attribute( 'toggle-wrap', 'class', 'pp-floating-element' );
		}

		if ( ! isset( $settings['button_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['button_icon'] = '';
		}

		$has_icon = ! empty( $settings['button_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['button_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_icon && ! empty( $settings['select_button_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_button_icon'] );
		$is_new = ! isset( $settings['button_icon'] ) && Icons_Manager::is_migration_allowed();

		if ( 'button' === $settings['toggle_source'] ) {
			if ( $settings['button_text'] || $has_icon ) { ?>
				<div <?php $this->print_render_attribute_string( 'toggle-wrap' ); ?>>
					<div <?php $this->print_render_attribute_string( 'toggle-button' ); ?>>
						<?php if ( $has_icon ) { ?>
							<span class="pp-offcanvas-toggle-icon pp-icon pp-no-trans">
								<?php
								if ( $is_new || $migrated ) {
									Icons_Manager::render_icon( $settings['select_button_icon'], [ 'aria-hidden' => 'true' ] );
								} elseif ( ! empty( $settings['button_icon'] ) ) {
									?><i <?php $this->print_render_attribute_string( 'i' ); ?>></i><?php
								}
								?>
							</span>
						<?php } ?>
						<span class="pp-offcanvas-toggle-text">
							<?php echo wp_kses_post( $settings['button_text'] ); ?>
						</span>
					</div>
				</div>
				<?php
			}
		} elseif ( 'burger' === $settings['toggle_source'] ) { ?>
			<div <?php $this->print_render_attribute_string( 'toggle-wrap' ); ?>>
				<div <?php $this->print_render_attribute_string( 'hamburger' ); ?>>
					<span class="pp-hamburger-box">
						<span class="pp-hamburger-inner"></span>
					</span>
						<?php if ( $settings['burger_label'] ) { ?>
						<span class="pp-hamburger-label">
							<?php echo wp_kses_post( $settings['burger_label'] ); ?>
						</span>
					<?php } ?>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * Render sidebar content output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_close_button() {
		$settings = $this->get_settings_for_display();

		if ( 'yes' !== $settings['close_button'] ) {
			return;
		}

		if ( ! isset( $settings['close_button_icon'] ) && ! Icons_Manager::is_migration_allowed() ) {
			// add old default
			$settings['close_button_icon'] = '';
		}

		$has_icon = ! empty( $settings['close_button_icon'] );

		if ( $has_icon ) {
			$this->add_render_attribute( 'i', 'class', $settings['close_button_icon'] );
			$this->add_render_attribute( 'i', 'aria-hidden', 'true' );
		}

		if ( ! $has_icon && ! empty( $settings['select_close_button_icon']['value'] ) ) {
			$has_icon = true;
		}
		$migrated = isset( $settings['__fa4_migrated']['select_close_button_icon'] );
		$is_new = ! isset( $settings['close_button_icon'] ) && Icons_Manager::is_migration_allowed();

		$this->add_render_attribute( 'close-button', 'class',
			[
				'pp-icon',
				'pp-offcanvas-close',
				'pp-offcanvas-close-' . $this->get_id(),
			]
		);

		$this->add_render_attribute( 'close-button', 'role', 'button' );
		?>
		<div class="pp-offcanvas-header">
			<div <?php $this->print_render_attribute_string( 'close-button' ); ?>>
				<?php
				if ( $is_new || $migrated ) {
					Icons_Manager::render_icon( $settings['select_close_button_icon'], [ 'aria-hidden' => 'true' ] );
				} elseif ( ! empty( $settings['close_button_icon'] ) ) {
					?><i <?php $this->print_render_attribute_string( 'i' ); ?>></i><?php
				}
				?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render sidebar content output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_sidebar() {
		$settings = $this->get_settings_for_display();

		$sidebar = $settings['sidebar'];

		if ( empty( $sidebar ) ) {
			return;
		}

		dynamic_sidebar( $sidebar );
	}

	/**
	 * Render saved template output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_custom_content() {
		$settings = $this->get_settings_for_display();

		foreach ( $settings['custom_content'] as $index => $item ) :
			?>
			<div class="pp-offcanvas-custom-widget">
				<h3 class="pp-offcanvas-widget-title">
					<?php echo wp_kses_post( $item['title'] ); ?>
				</h3>
				<div class="pp-offcanvas-widget-content">
					<?php echo $this->parse_text_editor( $item['description'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			</div>
			<?php
		endforeach;
	}

	/**
	 * Render saved template output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_saved_template() {
		$settings = $this->get_settings_for_display();

		if ( 'section' === $settings['content_type'] && ! empty( $settings['saved_section'] ) ) {

			echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $settings['saved_section'] );//phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		} elseif ( 'template' === $settings['content_type'] && ! empty( $settings['templates'] ) ) {

			echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $settings['templates'] );//phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		} elseif ( 'widget' === $settings['content_type'] && ! empty( $settings['saved_widget'] ) ) {

			echo \Elementor\Plugin::$instance->frontend->get_builder_content_for_display( $settings['saved_widget'] );//phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		}
	}

	/**
	 *  Get Saved Widgets
	 *
	 *  @param string $type Type.
	 *
	 *  @return string
	 */
	public function get_page_template_options( $type = '' ) {

		$page_templates = pp_get_page_templates( $type );

		$options[-1]   = esc_html__( 'Select', 'powerpack' );

		if ( count( $page_templates ) ) {
			foreach ( $page_templates as $id => $name ) {
				$options[ $id ] = $name;
			}
		} else {
			$options['no_template'] = esc_html__( 'No saved templates found!', 'powerpack' );
		}

		return $options;
	}

}
