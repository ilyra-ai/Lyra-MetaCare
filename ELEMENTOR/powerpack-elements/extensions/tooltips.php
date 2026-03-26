<?php
namespace PowerpackElements\Extensions;

// Powerpack Elements classes
use PowerpackElements\Base\Extension_Base;

// Elementor classes
use Elementor\Controls_Manager;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
} // Exit if accessed directly

/**
 * Tooltips Extension
 *
 * Adds tooltip on widgets
 *
 * @since 2.9.0
 */
class Extension_Tooltips extends Extension_Base {

	/**
	 * Is Common Extension
	 *
	 * Defines if the current extension is common for all element types or not
	 *
	 * @since 2.9.0
	 * @access protected
	 *
	 * @var bool
	 */
	protected $is_common = true;

	/**
	 * A list of scripts that the extension is depended in
	 *
	 * @since 2.9.0
	 **/
	public function get_script_depends() {
		return array(
			'pp-tooltipster',
			'pp-elements-tooltip',
		);
	}

	/**
	 * A list of styles that the extension is depended in
	 *
	 * @since 2.11.5
	 **/
	public function get_style_depends() {
		return array(
			'pp-tooltip',
		);
	}

	/**
	 * The description of the current extension
	 *
	 * @since 2.9.0
	 **/
	public static function get_description() {
		return esc_html__( 'Adds tooltip on widgets.', 'powerpack' );
	}

	/**
	 * Is disabled by default
	 *
	 * Return wether or not the extension should be disabled by default,
	 * prior to user actually saving a value in the admin page
	 *
	 * @access public
	 * @since 2.9.0
	 * @return bool
	 */
	public static function is_default_disabled() {
		return true;
	}

	/**
	 * Add common sections
	 *
	 * @since 2.9.0
	 *
	 * @access protected
	 */
	protected function add_common_sections_actions() {

		// Activate sections for widgets
		add_action( 'elementor/element/common/section_custom_css/after_section_end', function( $element, $args ) {

			$this->add_common_sections( $element, $args );

		}, 10, 2 );

		// Activate sections for widgets if elementor pro
		add_action( 'elementor/element/common/section_custom_css_pro/after_section_end', function( $element, $args ) {

			$this->add_common_sections( $element, $args );

		}, 10, 2 );
	}

	/**
	 * Add Controls
	 *
	 * @since 2.9.0
	 *
	 * @access private
	 */
	private function add_controls( $element, $args ) {
		$element_type = $element->get_type();

		$element->add_control(
			'pp_elements_tooltip_enable',
			array(
				'label'        => esc_html__( 'Tooltip', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => '',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'separator'    => 'before',
				'frontend_available' => true,
			)
		);

		$element->start_controls_tabs( 'pp_elements_tooltip_tabs', [
			'condition' => [
				'pp_elements_tooltip_enable!' => '',
			],
		] );

		$element->start_controls_tab( 'pp_elements_tooltip_settings', [
			'label'     => esc_html__( 'Settings', 'powerpack' ),
			'condition' => [
				'pp_elements_tooltip_enable!' => '',
			],
		] );

		$element->add_control(
			'pp_elements_tooltip_content',
			array(
				'label'       => esc_html__( 'Tooltip Content', 'powerpack' ),
				'type'        => Controls_Manager::TEXTAREA,
				'default'     => esc_html__( 'Tooltip Content', 'powerpack' ),
				'label_block' => true,
				'rows'        => 3,
				'condition'   => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_control(
			'pp_elements_tooltip_target',
			array(
				'label'              => esc_html__( 'Target', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'current',
				'options'            => array(
					'current' => esc_html__( 'Current Element', 'powerpack' ),
					'custom'  => esc_html__( 'Custom Selector', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'pp_elements_tooltip_enable!' => '',
				),
			)
		);

		$element->add_control(
			'pp_elements_tooltip_selector',
			array(
				'label'              => esc_html__( 'CSS Selector', 'powerpack' ),
				'description'        => esc_html__( 'Use a CSS selector for any html element within this element.', 'powerpack' ),
				'type'               => Controls_Manager::TEXT,
				'default'            => '',
				'label_block'        => false,
				'frontend_available' => true,
				'ai'                 => [
					'active' => false,
				],
				'condition'          => [
					'pp_elements_tooltip_enable!' => '',
					'pp_elements_tooltip_target'  => 'custom',
				],
			)
		);

		$element->add_control(
			'pp_elements_tooltip_trigger',
			array(
				'label'              => esc_html__( 'Trigger', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'hover',
				'options'            => array(
					'hover' => esc_html__( 'Hover', 'powerpack' ),
					'click' => esc_html__( 'Click', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'pp_elements_tooltip_enable!' => '',
				),
			)
		);

		$element->add_control(
			'pp_elements_tooltip_position',
			array(
				'label'              => esc_html__( 'Tooltip Position', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'top',
				'options'            => array(
					'top'    => esc_html__( 'Top', 'powerpack' ),
					'bottom' => esc_html__( 'Bottom', 'powerpack' ),
					'left'   => esc_html__( 'Left', 'powerpack' ),
					'right'  => esc_html__( 'Right', 'powerpack' ),
				),
				'frontend_available' => true,
			)
		);

		$element->add_control(
			'pp_elements_tooltip_arrow',
			array(
				'label'              => esc_html__( 'Show Arrow', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'yes',
				'options' => array(
					'yes' => esc_html__( 'Yes', 'powerpack' ),
					'no'  => esc_html__( 'No', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'pp_elements_tooltip_enable!' => '',
				),
			)
		);

		$element->add_control(
			'pp_elements_tooltip_animation',
			array(
				'label'              => esc_html__( 'Animation', 'powerpack' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'fade',
				'options'            => array(
					'fade'  => esc_html__( 'Fade', 'powerpack' ),
					'fall'  => esc_html__( 'Fall', 'powerpack' ),
					'grow'  => esc_html__( 'Grow', 'powerpack' ),
					'slide' => esc_html__( 'Slide', 'powerpack' ),
					'swing' => esc_html__( 'Swing', 'powerpack' ),
				),
				'frontend_available' => true,
				'condition'          => array(
					'pp_elements_tooltip_enable!' => '',
				),
			)
		);

		$element->add_control(
			'pp_elements_tooltip_distance',
			array(
				'label'              => esc_html__( 'Distance', 'powerpack' ),
				'description'        => esc_html__( 'The distance between the hotspot and the tooltip.', 'powerpack' ),
				'type'               => Controls_Manager::SLIDER,
				'default'            => array(
					'size' => '',
				),
				'range'              => array(
					'px' => array(
						'min' => 0,
						'max' => 100,
					),
				),
				'frontend_available' => true,
				'condition'          => array(
					'pp_elements_tooltip_enable!' => '',
				),
			)
		);

		$element->add_control(
			'pp_elements_tooltip_zindex',
			array(
				'label'              => esc_html__( 'Z-Index', 'powerpack' ),
				'description'        => esc_html__( 'Increase the z-index value if you are unable to see the tooltip. For example: 99, 999, 9999 ', 'powerpack' ),
				'type'               => Controls_Manager::NUMBER,
				'default'            => 99,
				'min'                => -9999999,
				'step'               => 1,
				'frontend_available' => true,
				'condition'          => array(
					'pp_elements_tooltip_enable!' => '',
				),
			)
		);

		$element->end_controls_tab();

		$element->start_controls_tab( 'pp_elements_tooltip_style', [
			'label'     => esc_html__( 'Style', 'powerpack' ),
			'condition' => [
				'pp_elements_tooltip_enable!' => '',
			],
		] );

		$element->add_control(
			'pp_elements_tooltip_bg_color',
			array(
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'.pp-tooltip.pp-tooltip-{{ID}} .tooltipster-box' => 'background-color: {{VALUE}};',
					'.pp-tooltip.pp-tooltip-{{ID}}.tooltipster-top .tooltipster-arrow-background' => 'border-top-color: {{VALUE}};',
					'.pp-tooltip.pp-tooltip-{{ID}}.tooltipster-bottom .tooltipster-arrow-background' => 'border-bottom-color: {{VALUE}};',
					'.pp-tooltip.pp-tooltip-{{ID}}.tooltipster-left .tooltipster-arrow-background' => 'border-left-color: {{VALUE}};',
					'.pp-tooltip.pp-tooltip-{{ID}}.tooltipster-right .tooltipster-arrow-background' => 'border-right-color: {{VALUE}};',
				),
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_control(
			'pp_elements_tooltip_color',
			array(
				'label'     => esc_html__( 'Text Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'.pp-tooltip.pp-tooltip-{{ID}} .pp-tooltip-content' => 'color: {{VALUE}};',
				),
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name'      => 'pp_elements_tooltip_typography',
				'label'     => esc_html__( 'Typography', 'powerpack' ),
				'global'    => [
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				],
				'selector'  => '.pp-tooltip.pp-tooltip-{{ID}} .pp-tooltip-content',
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name'      => 'pp_elements_tooltip_box_shadow',
				'selector'  => '.pp-tooltip.pp-tooltip-{{ID}} .tooltipster-box',
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name'        => 'pp_elements_tooltip_border',
				'label'       => esc_html__( 'Border', 'powerpack' ),
				'placeholder' => '1px',
				'default'     => '1px',
				'selector'    => '.pp-tooltip.pp-tooltip-{{ID}} .tooltipster-box',
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_control(
			'pp_elements_tooltip_border_radius',
			array(
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors'  => array(
					'.pp-tooltip.pp-tooltip-{{ID}} .tooltipster-box' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_responsive_control(
			'pp_elements_tooltip_padding',
			array(
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors'  => array(
					'.pp-tooltip.pp-tooltip-{{ID}} .tooltipster-box' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition' => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->add_control(
			'pp_elements_tooltip_width',
			array(
				'label'              => esc_html__( 'Width', 'powerpack' ),
				'type'               => Controls_Manager::SLIDER,
				'range'              => array(
					'px' => array(
						'min'  => 100,
						'max'  => 400,
						'step' => 1,
					),
				),
				'frontend_available' => true,
				'condition'          => [
					'pp_elements_tooltip_enable!' => '',
				],
			)
		);

		$element->end_controls_tab();

		$element->end_controls_tabs();
	}

	protected function render() {
		$settings = $element->get_settings();
	}

	/**
	 * Add Actions
	 *
	 * @since 2.9.0
	 *
	 * @access protected
	 */
	protected function add_actions() {

		// Activate controls for widgets
		add_action( 'elementor/element/common/section_powerpack_elements_advanced/before_section_end', function( $element, $args ) {
			$this->add_controls( $element, $args );
		}, 10, 2 );

		// Conditions for sections
		add_action( 'elementor/widget/before_render_content', function( $element ) {
			$settings       = $element->get_settings_for_display();
			$tooltip_enable = isset( $settings['pp_elements_tooltip_enable'] ) ? $settings['pp_elements_tooltip_enable'] : '';

			if ( 'yes' !== $tooltip_enable ) {
				return;
			}

			$tooltip_settings = array(
				'target'      => isset( $settings['pp_elements_tooltip_target'] ) ? $settings['pp_elements_tooltip_target'] : 'current',
				'selector'    => isset( $settings['pp_elements_tooltip_selector'] ) ? $settings['pp_elements_tooltip_selector'] : '',
				'trigger'     => isset( $settings['pp_elements_tooltip_trigger'] ) ? $settings['pp_elements_tooltip_trigger'] : 'hover',
				'distance'    => isset( $settings['pp_elements_tooltip_distance'] ) ? $settings['pp_elements_tooltip_distance']['size'] : '',
				'arrow'       => isset( $settings['pp_elements_tooltip_arrow'] ) ? esc_html( $settings['pp_elements_tooltip_arrow'] ) : 'yes',
				'animation'   => isset( $settings['pp_elements_tooltip_animation'] ) ? esc_html( $settings['pp_elements_tooltip_animation'] ) : 'fade',
				'zindex'      => isset( $settings['pp_elements_tooltip_zindex'] ) ? $settings['pp_elements_tooltip_zindex'] : 99,
				'width'       => isset( $settings['pp_elements_tooltip_width']['size'] ) ? $settings['pp_elements_tooltip_width']['size'] : '',
			);

			$element->add_render_attribute(
				'pp-tooltip', [
					'class' => 'pp-tooltip-content',
					'id'    => 'pp-tooltip-content-' . $element->get_id(),
				]
			);
		}, 10, 1 );

		add_action( 'elementor/widget/render_content', [ $this, 'render_content' ], 10, 2 );
		add_action( 'elementor/widget/print_template', [ $this, 'print_template' ], 10, 2 );
	}

	public function render_content( $content, $widget ) {
		$settings       = $widget->get_settings_for_display();
		$tooltip_enable = isset( $settings['pp_elements_tooltip_enable'] ) ? $settings['pp_elements_tooltip_enable'] : '';

		if ( 'yes' !== $tooltip_enable ) {
			return $content;
		}

		ob_start();
		?>
		<div class="pp-tooltip-container"><div <?php $widget->print_render_attribute_string( 'pp-tooltip' ); ?>>
			<?php echo $this->parse_text_editor( $settings['pp_elements_tooltip_content'], $widget ); ?>
		</div></div>
		<?php
		$content .= ob_get_clean();

		return $content;
	}

	public function print_template( $template, $widget ) {
		if ( ! $template ) {
			return;
		}

		ob_start();
		?><#
		if ( 'yes' === settings.pp_elements_tooltip_enable ) {

			view.addRenderAttribute( 'pp-tooltip', {
				'class': 'pp-tooltip-content',
				'id':    'pp-tooltip-content-' + view.$el.data('id'),
			} );
			#>
			<div class="pp-tooltip-container">
			<div {{{ view.getRenderAttributeString( 'pp-tooltip' ) }}}>
				{{{ settings.pp_elements_tooltip_content }}}
			</div>
			</div>

		<# } #><?php

		$template .= ob_get_clean();

		return $template;
	}

	/**
	 * Parse text editor.
	 *
	 * Parses the content from rich text editor with shortcodes, oEmbed and
	 * filtered data.
	 *
	 * @since 2.9.0
	 * @access protected
	 *
	 * @param string $content Text editor content.
	 *
	 * @return string Parsed content.
	 */
	protected function parse_text_editor( $content, $widget ) {
		/** This filter is documented in wp-includes/widgets/class-wp-widget-text.php */
		$content = apply_filters( 'widget_text', $content, $widget->get_settings() );

		$content = shortcode_unautop( $content );
		$content = do_shortcode( $content );
		$content = wptexturize( $content );

		if ( $GLOBALS['wp_embed'] instanceof \WP_Embed ) {
			$content = $GLOBALS['wp_embed']->autoembed( $content );
		}

		return $content;
	}
}
