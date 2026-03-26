<?php
namespace PowerpackElements\Modules\Toggle\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\Classes\PP_Helper;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Utils;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Image_Size;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Toggle Widget
 */
class Toggle extends Powerpack_Widget {

	/**
	 * Retrieve toggle widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Toggle' );
	}

	/**
	 * Retrieve toggle widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Toggle' );
	}

	/**
	 * Retrieve toggle widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Toggle' );
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
		return parent::get_widget_keywords( 'Toggle' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the toggle widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'pp-toggle',
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
			'widget-pp-toggle'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register toggle widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		/* Content Tab */
		$this->register_content_primary_controls();
		$this->register_content_secondary_controls();
		$this->register_content_settings_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_toggle_switch_controls();
		$this->register_style_labels_controls();
		$this->register_style_content_controls();
	}

	/*-----------------------------------------------------------------------------------*/
	/*	CONTENT TAB
	/*-----------------------------------------------------------------------------------*/

	protected function register_content_primary_controls() {
		/**
		 * Content Tab: Primary
		 */
		$this->start_controls_section(
			'section_primary',
			[
				'label'                 => esc_html__( 'Primary', 'powerpack' ),
			]
		);

		$this->add_control(
			'primary_label',
			[
				'label'                 => esc_html__( 'Label', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => esc_html__( 'Annual', 'powerpack' ),
			]
		);

		$this->add_control(
			'primary_content_type',
			[
				'label'                 => esc_html__( 'Content Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'image'         => esc_html__( 'Image', 'powerpack' ),
					'content'       => esc_html__( 'Content', 'powerpack' ),
					'template'      => esc_html__( 'Saved Templates', 'powerpack' ),
				],
				'default'               => 'content',
			]
		);

		$this->add_control(
			'primary_templates',
			[
				'label'                 => esc_html__( 'Choose Template', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-all',
				'condition'             => [
					'primary_content_type' => 'template',
				],
			]
		);

		$this->add_control(
			'primary_content',
			[
				'label'                 => esc_html__( 'Content', 'powerpack' ),
				'type'                  => Controls_Manager::WYSIWYG,
				'default'               => esc_html__( 'Primary Content', 'powerpack' ),
				'condition'             => [
					'primary_content_type'      => 'content',
				],
			]
		);

		$this->add_control(
			'primary_image',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'condition'             => [
					'primary_content_type'      => 'image',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'primary_image',
				'default'               => 'full',
				'separator'             => 'none',
				'condition'             => [
					'primary_content_type'      => 'image',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_secondary_controls() {
		/**
		 * Content Tab: Secondary
		 */
		$this->start_controls_section(
			'section_secondary',
			[
				'label'                 => esc_html__( 'Secondary', 'powerpack' ),
			]
		);

		$this->add_control(
			'secondary_label',
			[
				'label'                 => esc_html__( 'Label', 'powerpack' ),
				'type'                  => Controls_Manager::TEXT,
				'default'               => esc_html__( 'Lifetime', 'powerpack' ),
			]
		);

		$this->add_control(
			'secondary_content_type',
			[
				'label'                 => esc_html__( 'Content Type', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'image'         => esc_html__( 'Image', 'powerpack' ),
					'content'       => esc_html__( 'Content', 'powerpack' ),
					'template'      => esc_html__( 'Saved Templates', 'powerpack' ),
				],
				'default'               => 'content',
			]
		);

		$this->add_control(
			'secondary_templates',
			[
				'label'                 => esc_html__( 'Choose Template', 'powerpack' ),
				'type'                  => 'pp-query',
				'label_block'           => false,
				'multiple'              => false,
				'query_type'            => 'templates-all',
				'condition'             => [
					'secondary_content_type' => 'template',
				],
			]
		);

		$this->add_control(
			'secondary_content',
			[
				'label'                 => esc_html__( 'Content', 'powerpack' ),
				'type'                  => Controls_Manager::WYSIWYG,
				'default'               => esc_html__( 'Secondary Content', 'powerpack' ),
				'condition'             => [
					'secondary_content_type' => 'content',
				],
			]
		);

		$this->add_control(
			'secondary_image',
			[
				'label'                 => esc_html__( 'Image', 'powerpack' ),
				'type'                  => Controls_Manager::MEDIA,
				'default'               => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'condition'             => [
					'secondary_content_type' => 'image',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name'                  => 'secondary_image',
				'default'               => 'full',
				'separator'             => 'none',
				'condition'             => [
					'secondary_content_type' => 'image',
				],
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

		$this->add_control(
			'default_display',
			[
				'label'                 => esc_html__( 'Default Display', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'primary'       => esc_html__( 'Primary', 'powerpack' ),
					'secondary'     => esc_html__( 'Secondary', 'powerpack' ),
				],
				'default'               => 'primary',
			]
		);

		$this->add_control(
			'switch_style',
			[
				'label'                 => esc_html__( 'Switch Style', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'round'         => esc_html__( 'Round', 'powerpack' ),
					'rectangle'     => esc_html__( 'Rectangle', 'powerpack' ),
				],
				'default'               => 'round',
			]
		);

		$this->add_control(
			'toggle_position',
			[
				'label'                 => esc_html__( 'Toggle Position', 'powerpack' ),
				'type'                  => Controls_Manager::SELECT,
				'options'               => [
					'before'        => esc_html__( 'Before', 'powerpack' ),
					'after'         => esc_html__( 'After', 'powerpack' ),
					'before-after'  => esc_html__( 'Before', 'powerpack' ) . ' + ' . esc_html__( 'After', 'powerpack' ),
				],
				'default'               => 'before',
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Toggle' );

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

	protected function register_style_toggle_switch_controls() {
		/**
		 * Style Tab: Switch
		 */
		$this->start_controls_section(
			'section_toggle_switch_style',
			[
				'label'             => esc_html__( 'Switch', 'powerpack' ),
				'tab'               => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'toggle_switch_alignment',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'default'               => 'center',
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
				'prefix_class'          => 'pp-toggle-',
			]
		);

		$this->add_responsive_control(
			'toggle_switch_size',
			[
				'label'                 => esc_html__( 'Switch Size', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 26,
					'unit' => 'px',
				],
				'range'                 => [
					'px'   => [
						'min' => 15,
						'max' => 60,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-switch-container' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'toggle_switch_spacing',
			[
				'label'                 => esc_html__( 'Labels Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 15,
					'unit' => 'px',
				],
				'range'                 => [
					'px'   => [
						'max' => 80,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-switch-container' => 'margin-left: {{SIZE}}{{UNIT}}; margin-right: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'toggle_switch_gap',
			[
				'label'                 => esc_html__( 'Spacing', 'powerpack' ),
				'type'                  => Controls_Manager::SLIDER,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'               => [
					'size' => 20,
					'unit' => 'px',
				],
				'range'                 => [
					'px'   => [
						'max' => 80,
					],
				],
				'tablet_default'        => [
					'unit' => 'px',
				],
				'mobile_default'        => [
					'unit' => 'px',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-switch-before' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-toggle-switch-after' => 'margin-top: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_switch' );

		$this->start_controls_tab(
			'tab_switch_primary',
			[
				'label'             => esc_html__( 'Primary', 'powerpack' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'              => 'toggle_switch_primary_background',
				'types'             => [ 'classic', 'gradient' ],
				'selector'          => '{{WRAPPER}} .pp-toggle-slider',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'toggle_switch_primary_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-toggle-switch-container',
			]
		);

		$this->add_control(
			'toggle_switch_primary_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-switch-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_switch_secondary',
			[
				'label'             => esc_html__( 'Secondary', 'powerpack' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'              => 'toggle_switch_secondary_background',
				'types'             => [ 'classic', 'gradient' ],
				'selector'          => '{{WRAPPER}} .pp-toggle-switch-on .pp-toggle-slider, {{WRAPPER}} .pp-toggle-switch:checked + .pp-toggle-slider',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'toggle_switch_secondary_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-toggle-switch-on.pp-toggle-switch-container',
			]
		);

		$this->add_control(
			'toggle_switch_secondary_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-switch-on.pp-toggle-switch-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_control(
			'switch_controller_heading',
			[
				'label'                 => esc_html__( 'Controller', 'powerpack' ),
				'type'                  => Controls_Manager::HEADING,
				'separator'             => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'              => 'toggle_controller_background',
				'types'             => [ 'classic', 'gradient' ],
				'selector'          => '{{WRAPPER}} .pp-toggle-slider::before',
			]
		);

		$this->add_control(
			'toggle_controller_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-slider::before' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_labels_controls() {
		/**
		 * Style Tab: Labels
		 */
		$this->start_controls_section(
			'section_label_style',
			[
				'label'             => esc_html__( 'Labels', 'powerpack' ),
				'tab'               => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'label_horizontal_position',
			[
				'label'                 => esc_html__( 'Position', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'label_block'           => false,
				'default'               => 'middle',
				'options'               => [
					'top'          => [
						'title'    => esc_html__( 'Top', 'powerpack' ),
						'icon'     => 'eicon-v-align-top',
					],
					'middle'       => [
						'title'    => esc_html__( 'Middle', 'powerpack' ),
						'icon'     => 'eicon-v-align-middle',
					],
					'bottom'       => [
						'title'    => esc_html__( 'Bottom', 'powerpack' ),
						'icon'     => 'eicon-v-align-bottom',
					],
				],
				'selectors_dictionary'  => [
					'top'      => 'flex-start',
					'middle'   => 'center',
					'bottom'   => 'flex-end',
				],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-switch-inner' => 'align-items: {{VALUE}}',
				],
			]
		);

		$this->start_controls_tabs( 'tabs_label_style' );

		$this->start_controls_tab(
			'tab_label_primary',
			[
				'label'             => esc_html__( 'Primary', 'powerpack' ),
			]
		);

		$this->add_control(
			'label_text_color_primary',
			[
				'label'             => esc_html__( 'Text Color', 'powerpack' ),
				'type'              => Controls_Manager::COLOR,
				'default'           => '',
				'selectors'         => [
					'{{WRAPPER}} .pp-primary-toggle-label' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'label_active_text_color_primary',
			[
				'label'             => esc_html__( 'Active Text Color', 'powerpack' ),
				'type'              => Controls_Manager::COLOR,
				'default'           => '',
				'selectors'         => [
					'{{WRAPPER}} .pp-primary-toggle-label.pp-toggle-active' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'              => 'label_typography_primary',
				'label'             => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'          => '{{WRAPPER}} .pp-primary-toggle-label',
				'separator'         => 'before',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_label_secondary',
			[
				'label'             => esc_html__( 'Secondary', 'powerpack' ),
			]
		);

		$this->add_control(
			'label_text_color_secondary',
			[
				'label'             => esc_html__( 'Text Color', 'powerpack' ),
				'type'              => Controls_Manager::COLOR,
				'default'           => '',
				'selectors'         => [
					'{{WRAPPER}} .pp-secondary-toggle-label' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'label_active_text_color_secondary',
			[
				'label'             => esc_html__( 'Active Text Color', 'powerpack' ),
				'type'              => Controls_Manager::COLOR,
				'default'           => '',
				'selectors'         => [
					'{{WRAPPER}} .pp-secondary-toggle-label.pp-toggle-active' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'              => 'label_typography_secondary',
				'label'             => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'          => '{{WRAPPER}} .pp-secondary-toggle-label',
				'separator'         => 'before',
			]
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
			'section_content_style',
			[
				'label'             => esc_html__( 'Content', 'powerpack' ),
				'tab'               => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'content_alignment',
			[
				'label'                 => esc_html__( 'Alignment', 'powerpack' ),
				'type'                  => Controls_Manager::CHOOSE,
				'default'               => 'center',
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
				'selectors'         => [
					'{{WRAPPER}} .pp-toggle-content-wrap' => 'text-align: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'              => 'content_typography',
				'label'             => esc_html__( 'Typography', 'powerpack' ),
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'          => '{{WRAPPER}} .pp-toggle-content-wrap',
			]
		);

		$this->add_control(
			'content_text_color',
			[
				'label'             => esc_html__( 'Text Color', 'powerpack' ),
				'type'              => Controls_Manager::COLOR,
				'default'           => '',
				'selectors'         => [
					'{{WRAPPER}} .pp-toggle-content-wrap' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'              => 'content_background',
				'types'             => [ 'classic', 'gradient' ],
				'selector'          => '{{WRAPPER}} .pp-toggle-content-wrap',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'content_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'placeholder'           => '1px',
				'default'               => '1px',
				'selector'              => '{{WRAPPER}} .pp-toggle-content-wrap',
			]
		);

		$this->add_responsive_control(
			'content_border_radius',
			[
				'label'                 => esc_html__( 'Border Radius', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-content-wrap' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'content_padding',
			[
				'label'                 => esc_html__( 'Padding', 'powerpack' ),
				'type'                  => Controls_Manager::DIMENSIONS,
				'size_units'            => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'             => [
					'{{WRAPPER}} .pp-toggle-content-wrap' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render toggle switch output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_toggle( $toggle_position = 'before' ) {
		$settings = $this->get_settings();

		$this->add_render_attribute([
			'toggle-switch-wrap' => [
				'class' => [
					'pp-toggle-switch-wrap',
					'pp-toggle-switch-' . $toggle_position,
				],
			],
			'toggle-switch-container' => [
				'class' => [
					'pp-toggle-switch-container',
					'pp-toggle-switch-' . $settings['switch_style'],
				],
			],
			'primary-label' => [
				'class' => 'pp-primary-toggle-label',
			],
			'secondary-label' => [
				'class' => 'pp-secondary-toggle-label',
			],
		]);

		if ( 'secondary' === $settings['default_display'] ) {
			$this->add_render_attribute( 'toggle-switch-container', 'class', 'pp-toggle-switch-on' );
			$this->add_render_attribute( 'secondary-label', 'class', 'pp-toggle-active' );
		} else {
			$this->add_render_attribute( 'primary-label', 'class', 'pp-toggle-active' );
		}

		$is_checked = ( 'secondary' === $settings['default_display'] ) ? 'checked' : '';
		?>
		<div <?php $this->print_render_attribute_string( 'toggle-switch-wrap' ); ?>>
			<div class="pp-toggle-switch-inner">
				<?php if ( $settings['primary_label'] ) { ?>
					<div <?php $this->print_render_attribute_string( 'primary-label' ); ?>>
						<?php echo esc_attr( $settings['primary_label'] ); ?>
					</div>
				<?php } ?>
				<div <?php $this->print_render_attribute_string( 'toggle-switch-container' ); ?>>
					<label class="pp-toggle-switch-label">
						<input class="pp-toggle-switch" type="checkbox" <?php echo wp_kses_post( $is_checked ); ?>>
						<span class="pp-toggle-slider"></span>
					</label>
				</div>
				<?php if ( $settings['secondary_label'] ) { ?>
					<div <?php $this->print_render_attribute_string( 'secondary-label' ); ?>>
						<?php echo esc_attr( $settings['secondary_label'] ); ?>
					</div>
				<?php } ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render toggle widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings();

		$this->add_render_attribute([
			'toggle-container' => [
				'class' => 'pp-toggle-container',
				'id'    => 'pp-toggle-container-' . esc_attr( $this->get_id() ),
			],
			'toggle-content-wrap' => [
				'class' => 'pp-toggle-content-wrap',
			],
			'toggle-section-primary' => [
				'class' => [ 'pp-toggle-section', 'pp-toggle-section-primary' ],
			],
			'toggle-section-secondary' => [
				'class' => [ 'pp-toggle-section', 'pp-toggle-section-secondary' ],
			],
		]);

		if ( 'secondary' === $settings['default_display'] ) {
			$this->add_render_attribute( 'toggle-section-primary', 'style', 'display: none;' );
		} else {
			$this->add_render_attribute( 'toggle-section-secondary', 'style', 'display: none;' );
		}
		?>
		<div <?php $this->print_render_attribute_string( 'toggle-container' ); ?>>
			<?php
			if ( 'before' === $settings['toggle_position'] || 'before-after' === $settings['toggle_position'] ) {
				$this->render_toggle( 'before' );
			}
			?>
			<div <?php $this->print_render_attribute_string( 'toggle-content-wrap' ); ?>>
				<div <?php $this->print_render_attribute_string( 'toggle-section-primary' ); ?>>
					<?php
					if ( 'content' === $settings['primary_content_type'] ) {
						echo $this->parse_text_editor( $settings['primary_content'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					} elseif ( 'image' === $settings['primary_content_type'] ) {
						echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'primary_image', 'primary_image' ) );
					} elseif ( 'template' === $settings['primary_content_type'] ) {
						if ( ! empty( $settings['primary_templates'] ) ) {
							$primary_template_id = $settings['primary_templates'];

							if ( 'publish' === get_post_status( $primary_template_id ) ) {
								echo PP_Helper::elementor()->frontend->get_builder_content_for_display( $primary_template_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							}
						}
					}
					?>
				</div>
				<div <?php $this->print_render_attribute_string( 'toggle-section-secondary' ); ?>>
					<?php
					if ( 'content' === $settings['secondary_content_type'] ) {

						echo $this->parse_text_editor( $settings['secondary_content'] ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

					} elseif ( 'image' === $settings['secondary_content_type'] ) {

						echo wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'secondary_image', 'secondary_image' ) );

					} elseif ( 'template' === $settings['secondary_content_type'] ) {
						if ( ! empty( $settings['secondary_templates'] ) ) {
							$secondary_template_id = $settings['secondary_templates'];

							if ( 'publish' === get_post_status( $secondary_template_id ) ) {
								echo PP_Helper::elementor()->frontend->get_builder_content_for_display( $secondary_template_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							}
						}
					}
					?>
				</div>
			</div>
			<?php
			if ( 'after' === $settings['toggle_position'] || 'before-after' === $settings['toggle_position'] ) {
				$this->render_toggle( 'after' );
			}
			?>
		</div>
		<?php
	}
}
