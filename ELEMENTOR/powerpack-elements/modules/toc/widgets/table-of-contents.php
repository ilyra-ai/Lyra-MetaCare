<?php
namespace PowerpackElements\Modules\Toc\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;
use PowerpackElements\GROUP_CONTROL_TRANSITION;
use PowerpackElements\GROUP_CONTROL_TOC;

// Elementor Classes
use Elementor\Plugin;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Icons_Manager;

/**
 * Exit if accessed directly
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class for Table of Contents Widget which extends Powerpack_Widget class
 *
 * @since 1.4.15
 */

class Table_Of_Contents extends Powerpack_Widget {
	/**
	 *  Retrieve Table of Contents widget name.
	 *
	 *  @since 1.4.15
	 *  @access public
	 *
	 *  @return string Widget Name.
	 */

	public function get_name() {
		return parent::get_widget_name( 'Table_Of_Contents' );
	}

	/**
	 *  Retrieve Table of Contents widget title.
	 *
	 *  Title is displayed in the Elementor Editor, in PowerPack Settings and other places in frontend.
	 *
	 *  @since 1.4.15
	 *  @access public
	 *
	 *  @return string Widget Label.
	 */

	public function get_title() {
		return parent::get_widget_title( 'Table_Of_Contents' );
	}

	/**
	 * Retrieve Table of Contents widget icon.
	 *
	 * @since 1.4.15
	 * @access public
	 *
	 * @return string Icon Classes.
	 */

	public function get_icon() {
		return parent::get_widget_icon( 'Table_Of_Contents' );
	}

	/**
	 * Get the the keywords for the Table of Contents widget.
	 *
	 * @since 1.4.15
	 * @access public
	 *
	 * @return array Array of script identifiers.
	 */

	public function get_keywords() {
		return parent::get_widget_keywords( 'Table_Of_Contents' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the Table of Contents widget depended on.
	 *
	 * @since 1.4.15
	 * @access public
	 *
	 * @return array Array of script identifiers.
	 */

	public function get_script_depends() {
		return array(
			'pp-toc',
		);
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
			'widget-pp-toc'
		];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Get Frontend Settings
	 *
	 * In the TOC widget, this implementation is used to pass a pre-rendered version of the icon to the front end,
	 * which is required in case the FontAwesome SVG experiment is active.
	 *
	 * @since 2.10.22
	 *
	 * @return array
	 */
	public function get_frontend_settings() {
		$frontend_settings = parent::get_frontend_settings();

		if ( PP_Helper::is_feature_active( 'e_font_icon_svg' ) && ! empty( $frontend_settings['icon']['value'] ) ) {
			$frontend_settings['icon']['rendered_tag'] = Icons_Manager::render_font_icon( $frontend_settings['icon'] );
		}

		return $frontend_settings;
	}

	/**
	 * Register Table of Contents widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.4.15
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'table_of_contents',
			[
				'label' => esc_html__( 'Table of Contents', 'powerpack' ),
			]
		);

		$this->add_control(
			'title',
			[
				'label'       => esc_html__( 'Title', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'default'     => esc_html__( 'Table of Contents', 'powerpack' ),
			]
		);

		$this->add_control(
			'html_tag',
			[
				'label' => esc_html__( 'HTML Tag', 'powerpack' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
					'h5' => 'H5',
					'h6' => 'H6',
					'div' => 'div',
				],
				'default' => 'h4',
			]
		);

		$this->start_controls_tabs( 'include_exclude_tags', [ 'separator' => 'before' ] );

		$this->start_controls_tab(
			'include',
			[
				'label' => esc_html__( 'Include', 'powerpack' ),
			]
		);

		$this->add_control(
			'headings_by_tags',
			[
				'label'              => esc_html__( 'Anchors By Tags', 'powerpack' ),
				'type'               => Controls_Manager::SELECT2,
				'multiple'           => true,
				'default'            => [ 'h2', 'h3', 'h4', 'h5', 'h6' ],
				'options'            => [
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
					'h5' => 'H5',
					'h6' => 'H6',
				],
				'label_block'        => true,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'container',
			[
				'label'              => esc_html__( 'Container', 'powerpack' ),
				'type'               => Controls_Manager::TEXT,
				'label_block'        => true,
				'description'        => esc_html__( 'This control confines the Table of Contents to heading elements under the provided CSS selector.', 'powerpack' ),
				'frontend_available' => true,
				'ai'                 => [
					'active' => false,
				],
			]
		);

		$this->end_controls_tab(); // include

		$this->start_controls_tab(
			'exclude',
			[
				'label' => esc_html__( 'Exclude', 'powerpack' ),
			]
		);

		$this->add_control(
			'exclude_headings_by_selector',
			[
				'label'              => esc_html__( 'Anchors By Selector', 'powerpack' ),
				'type'               => Controls_Manager::TEXT,
				'description'        => esc_html__( 'CSS selectors, in a comma-separated list', 'powerpack' ),
				'default'            => [],
				'label_block'        => true,
				'frontend_available' => true,
				'ai'                 => [
					'active' => false,
				],
			]
		);

		$this->end_controls_tab(); // exclude

		$this->end_controls_tabs(); // include_exclude_tags

		$this->add_control(
			'marker_view',
			[
				'label' => esc_html__( 'List Style', 'powerpack' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'numbers',
				'options' => [
					'none'    => esc_html__( 'None', 'powerpack' ),
					'numbers' => esc_html__( 'Numbers', 'powerpack' ),
					'bullets' => esc_html__( 'Bullets', 'powerpack' ),
				],
				'separator' => 'before',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'icon',
			[
				'label' => esc_html__( 'Icon', 'powerpack' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-circle',
					'library' => 'fa-solid',
				],
				'recommended' => [
					'fa-solid' => [
						'circle',
						'dot-circle',
						'square-full',
					],
					'fa-regular' => [
						'circle',
						'dot-circle',
						'square-full',
					],
				],
				'condition' => [
					'marker_view' => 'bullets',
				],
				'skin' => 'inline',
				'label_block' => false,
				'exclude_inline_options' => [ 'svg' ],
				'frontend_available' => true,
			]
		);

		$this->end_controls_section(); // table_of_contents

		$this->start_controls_section(
			'additional_options',
			[
				'label' => esc_html__( 'Additional Options', 'powerpack' ),
			]
		);

		$this->add_control(
			'word_wrap',
			[
				'label' => esc_html__( 'Word Wrap', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'return_value' => 'ellipsis',
				'prefix_class' => 'pp-toc--content-',
			]
		);

		$this->add_control(
			'minimize_box',
			[
				'label' => esc_html__( 'Collapsable TOC', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'description' => esc_html__( 'Enable to make TOC collapsble on click.', 'powerpack' ),
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'expand_icon',
			[
				'label' => esc_html__( 'Icon', 'powerpack' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-chevron-down',
					'library' => 'fa-solid',
				],
				'recommended' => [
					'fa-solid' => [
						'chevron-down',
						'angle-down',
						'angle-double-down',
						'caret-down',
						'caret-square-down',
					],
					'fa-regular' => [
						'caret-square-down',
					],
				],
				'skin' => 'inline',
				'label_block' => false,
				'condition' => [
					'minimize_box' => 'yes',
				],
			]
		);

		$this->add_control(
			'collapse_icon',
			[
				'label' => esc_html__( 'Minimize Icon', 'powerpack' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-chevron-up',
					'library' => 'fa-solid',
				],
				'recommended' => [
					'fa-solid' => [
						'chevron-up',
						'angle-up',
						'angle-double-up',
						'caret-up',
						'caret-square-up',
					],
					'fa-regular' => [
						'caret-square-up',
					],
				],
				'skin' => 'inline',
				'label_block' => false,
				'condition' => [
					'minimize_box' => 'yes',
				],
			]
		);

		$breakpoints = PP_Helper::elementor()->breakpoints->get_active_breakpoints();

		$minimized_on_options = [];

		foreach ( $breakpoints as $breakpoint_key => $breakpoint ) {
			// This feature is meant for mobile screens.
			if ( 'widescreen' === $breakpoint_key ) {
				continue;
			}

			$minimized_on_options[ $breakpoint_key ] = sprintf(
				/* translators: 1: `<` character, 2: Breakpoint value. */
				esc_html__( '%1$s (%2$s %3$dpx)', 'powerpack' ),
				$breakpoint->get_label(),
				'<',
				$breakpoint->get_value()
			);
		}

		$minimized_on_options['desktop'] = esc_html__( 'Desktop (or smaller)', 'powerpack' );

		$this->add_control(
			'minimized_on',
			[
				'label' => esc_html__( 'Collapse On', 'powerpack' ),
				'type' => Controls_Manager::SELECT2,
				'description' => esc_html__( 'Collapse TOC on the selected devices on page load.', 'powerpack' ),
				'multiple' => true,
				'default' => 'tablet',
				'options' => $minimized_on_options,
				//'prefix_class' => 'pp-toc--minimized-on-',
				'condition' => [
					'minimize_box!' => '',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'hierarchical_view',
			[
				'label' => esc_html__( 'Hierarchical View', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'collapse_subitems',
			[
				'label' => esc_html__( 'Collapse Sub Headings', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'description' => esc_html__( 'The "Collapse" option should only be used if the Table of Contents is made sticky', 'powerpack' ),
				'condition' => [
					'hierarchical_view' => 'yes',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'sticky_toc_toggle',
			[
				'label' => esc_html__( 'Sticky TOC on Scroll', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'scroll_to_top_toggle',
			[
				'label' => esc_html__( 'Scroll to Top', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'description' => esc_html__( 'Add scroll to top button.', 'powerpack' ),
				'frontend_available' => true,
			]
		);

		$this->add_responsive_control(
			'scroll_offset',
			[
				'label' => esc_html__( 'Scroll Offset', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'frontend_available' => true,
				'responsive' => true,
			]
		);

		$this->end_controls_section(); // settings

		/**
		 *  Section - Sticky ToC
		 *  Tab - Content
		 *  Condition - Content > Sticky TOC is Enabled
		 */

		$this->start_controls_section(
			'sticky_toc',
			[
				'label' => esc_html__( 'Sticky TOC', 'powerpack' ),
				'description'   => esc_html__( 'Scroll the page a bit to see the Sticky Toc in order to adjust its position.', 'powerpack' ),
				'condition' => [
					'sticky_toc_toggle' => 'yes',
				],
			]
		);

		$this->add_control(
			'sticky_toc_disable_on',
			[
				'label' => esc_html__( 'Disabled On', 'powerpack' ),
				'type' => Controls_Manager::SELECT2,
				'default' => 'none',
				'multiple' => true,
				'options' => $minimized_on_options,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'sticky_toc_type',
			[
				'label' => esc_html__( 'Sticky Type', 'powerpack' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'custom-position',
				'options' => [
					'in-place' => esc_html__( 'Sticky In Place', 'powerpack' ),
					'custom-position' => esc_html__( 'Custom Position', 'powerpack' ),
				],
				'prefix_class' => 'sticky-',
				'frontend_available' => true,
			]
		);

		$this->add_responsive_control(
			'sticky_toc_position_x',
			[
				'label' => esc_html__( 'Horizontal Position', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 50,
				],
				'responsive'    => true,
				'selectors' => [
					'{{WRAPPER}}' => '--toc-position-x: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'sticky_toc_type' => 'custom-position',
				],
			]
		);

		$this->add_responsive_control(
			'sticky_toc_position_y',
			[
				'label' => esc_html__( 'Vertical Position', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 50,
				],
				'responsive'    => true,
				'selectors' => [
					'{{WRAPPER}}' => '--toc-position-y: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'sticky_toc_type' => 'custom-position',
				],
			]
		);

		$this->add_responsive_control(
			'sticky_toc_entrance_animation',
			[
				'label' => esc_html__( 'Entrance Animation', 'powerpack' ),
				'type' => Controls_Manager::ANIMATION,
				'default' => 'fadeIn',
				'frontend_available' => true,
			]
		);

		$this->add_responsive_control(
			'sticky_toc_exit_animation',
			[
				'label' => esc_html__( 'Exit Animation', 'powerpack' ),
				'default' => 'fadeIn',
				'type' => Controls_Manager::EXIT_ANIMATION,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'sticky_toc_animation_duration',
			[
				'label' => esc_html__( 'Animation Duration', 'powerpack' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'slow' => esc_html__( 'Slow', 'powerpack' ),
					'' => esc_html__( 'Normal', 'powerpack' ),
					'fast' => esc_html__( 'Fast', 'powerpack' ),
				],
				'prefix_class' => 'animated-',
				'conditions'    => [
					'relation'  => 'or',
					'terms' => [
						[
							'name'  => 'sticky_toc_entrance_animation',
							'operator'  => '!==',
							'value' => '',
						],
						[
							'name'  => 'sticky_toc_exit_animation',
							'operator'  => '!==',
							'value' => '',
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'sticky_toc_top_offset',
			[
				'label' => esc_html__( 'Offset', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 50,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc.floating-toc' => 'top: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'sticky_toc_type' => 'in-place',
				],
			]
		);

		$this->add_responsive_control(
			'sticky_toc_z_index',
			[
				'label' => esc_html__( 'Z-Index', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 999,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc.floating-toc' => 'z-index: {{SIZE}}',
				],
			]
		);

		$this->end_controls_section();

		/**
		 *  Section - Scroll to Top
		 *  Tab - Content
		 *  Toggle - Additional Options > Scroll to Top
		 */

		$this->start_controls_section(
			'scroll_to_top_section',
			[
				'label' => esc_html__( 'Scroll to Top', 'powerpack' ),
				'condition' => [
					'scroll_to_top_toggle' => 'yes',
				],
			]
		);

		$this->add_control(
			'scroll_to_top_option',
			[
				'label'     => esc_html__( 'Scroll To', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'window_top',
				'options'   => [
					'window_top'    => esc_html__( 'Window Top', 'powerpack' ),
					'toc'           => esc_html__( 'Table of Contents', 'powerpack' ),
				],
				'frontend_available'    => true,
			]
		);

		$this->add_control(
			'scroll_to_top_icon',
			[
				'label' => esc_html__( 'Icon', 'powerpack' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-chevron-up',
					'library' => 'fa-solid',
				],
				'recommended' => [
					'fa-solid' => [
						'chevron-up',
						'angle-up',
						'arrow-alt-circle-up',
						'arrow-circle-up',
						'caret-up',
						'chevron-circle-up',
						'hand-point-up',
					],
					'fa-regular' => [
						'arrow-alt-circle-up',
						'caret-square-up',
						'square-full',
					],
				],
				'condition' => [
					'scroll_to_top_toggle' => 'yes',
				],
				'skin' => 'inline',
				'label_block' => false,
				'exclude_inline_options' => [ 'svg' ],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'scroll_to_top_align',
			[
				'label' => esc_html__( 'Alignment', 'powerpack' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'pp-toc__scroll-to-top--align-left' => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon' => 'eicon-h-align-left',
					],
					'pp-toc__scroll-to-top--align-right' => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'default' => 'pp-toc__scroll-to-top--align-right',
				'toggle' => true,
			]
		);

		$this->add_responsive_control(
			'scroll_to_top_position_x',
			[
				'label' => esc_html__( 'Horizontal Position', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 50,
				],
				'responsive'    => true,
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--container' => '--toc-scroll-top-position-x: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'scroll_to_top_position_y',
			[
				'label' => esc_html__( 'Vertical Position', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 50,
				],
				'responsive'    => true,
				'selectors' => [
					'{{WRAPPER}}' => '--toc-scroll-top-position-y: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'scroll_to_top_z_index',
			[
				'label' => esc_html__( 'Z-Index', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 999,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--container' => 'z-index: {{SIZE}}',
				],
			]
		);

		$this->end_controls_section(); // Scroll Top

		$help_docs = PP_Config::get_widget_help_links( 'Table_Of_Contents' );
		if ( ! empty( $help_docs ) ) {
			/**
			 * Content Tab: Docs Links
			 *
			 * @since 1.4.15
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

		/**
		 * Section - Box Style
		 * Tab - Style
		 */

		$this->start_controls_section(
			'box_style',
			[
				'label' => esc_html__( 'Box', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'background_color',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--box-background-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'  => 'border',
				'label' => esc_html__( 'Border', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-toc',
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'powerpack' ),
				'type' => Controls_Manager::DIMENSIONS,
				'selectors' => [
					'{{WRAPPER}}' => '--box-border-radius: {{TOP}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}} {{RIGHT}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'min_height',
			[
				'label' => esc_html__( 'Min Height', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'vh', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--box-min-height: {{SIZE}}{{UNIT}}',
				],
				'frontend_available' => true,
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'selector' => '{{WRAPPER}} .pp-toc',
			]
		);

		$this->end_controls_section(); // box_style

		$this->start_controls_section(
			'header_style',
			[
				'label' => esc_html__( 'Header', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'header_align',
			[
				'label' => esc_html__( 'Alignment', 'powerpack' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => esc_html__( 'Left', 'powerpack' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'powerpack' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'powerpack' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--toc-header-title-align: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'header_padding',
			[
				'label' => esc_html__( 'Padding', 'powerpack' ),
				'type' => Controls_Manager::DIMENSIONS,
				'selectors' => [
					'{{WRAPPER}}' => '--toc-header-box-padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'header_background_color',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--header-background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'header_text_color',
			[
				'label' => esc_html__( 'Text Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'global'                => [
					'default' => Global_Colors::COLOR_SECONDARY,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--header-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'header_typography',
				'selector' => '{{WRAPPER}} .pp-toc__header, {{WRAPPER}} .pp-toc__header-title',
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
			]
		);

		$this->add_control(
			'toggle_button_color',
			[
				'label' => esc_html__( 'Icon Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'condition' => [
					'minimize_box' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}}' => '--toggle-button-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'header_separator_width',
			[
				'label' => esc_html__( 'Separator Width', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--separator-width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'header_separator_color',
			[
				'label' => esc_html__( 'Separator Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--separator-color: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section(); // header_style

		$this->start_controls_section(
			'list_style',
			[
				'label' => esc_html__( 'List', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'list_padding',
			[
				'label' => esc_html__( 'Padding', 'powerpack' ),
				'type' => Controls_Manager::DIMENSIONS,
				'selectors' => [
					'{{WRAPPER}}' => '--toc-list-box-padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'list_typography',
				'selector' => '{{WRAPPER}} .pp-toc__list-item',
				'global'                => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Toc::get_type(),
			[
				'name' => 'heading_level_font_size',
				'selector' => '{{WRAPPER}}',
			]
		);

		$this->add_control(
			'list_indent',
			[
				'label' => esc_html__( 'Indent', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'default' => [
					'unit' => 'em',
				],
				'selectors' => [
					'{{WRAPPER}}' => '--nested-list-indent: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->start_controls_tabs( 'item_text_style' );

		$this->start_controls_tab(
			'normal',
			[
				'label' => esc_html__( 'Normal', 'powerpack' ),
			]
		);

		$this->add_control(
			'item_text_color_normal',
			[
				'label' => esc_html__( 'Text Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'global'                => [
					'default' => Global_Colors::COLOR_TEXT,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--item-text-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'item_text_underline_normal',
			[
				'label' => esc_html__( 'Underline', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'selectors' => [
					'{{WRAPPER}}' => '--item-text-decoration: underline',
				],
			]
		);

		$this->end_controls_tab(); // normal

		$this->start_controls_tab(
			'hover',
			[
				'label' => esc_html__( 'Hover', 'powerpack' ),
			]
		);

		$this->add_control(
			'item_text_color_hover',
			[
				'label' => esc_html__( 'Text Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'global'                => [
					'default' => Global_Colors::COLOR_ACCENT,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--item-text-hover-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'item_text_underline_hover',
			[
				'label' => esc_html__( 'Underline', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'selectors' => [
					'{{WRAPPER}}' => '--item-text-hover-decoration: underline',
				],
			]
		);

		$this->end_controls_tab(); // hover

		$this->start_controls_tab(
			'active',
			[
				'label' => esc_html__( 'Active', 'powerpack' ),
			]
		);

		$this->add_control(
			'item_text_color_active',
			[
				'label' => esc_html__( 'Text Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--item-text-active-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'item_text_underline_active',
			[
				'label' => esc_html__( 'Underline', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'selectors' => [
					'{{WRAPPER}}' => '--item-text-active-decoration: underline',
				],
			]
		);

		$this->end_controls_tab(); // active

		$this->end_controls_tabs(); // item_text_style

		$this->add_control(
			'heading_marker',
			[
				'label' => esc_html__( 'Marker', 'powerpack' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'marker_color',
			[
				'label' => esc_html__( 'Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'global'                => [
					'default' => Global_Colors::COLOR_TEXT,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--marker-color: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'marker_size',
			[
				'label' => esc_html__( 'Size', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--marker-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section(); // list_style

		/**
		 * Section - Sticky ToC
		 * Tab - Style
		 * Condition - Content > Sticky ToC Toggle - Enabled
		 */

		$this->start_controls_section(
			'sticky_toc_style_section',
			[
				'label' => esc_html__( 'Sticky TOC', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'sticky_toc_toggle' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'sticky_toc_box_width',
			[
				'label' => esc_html__( 'Width', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 600,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc.floating-toc' => 'width: {{SIZE}}{{UNIT}};',
				],
				'responsive' => true,
				'condition' => [
					'sticky_toc_type' => 'custom-position',
				],
			]
		);

		$this->add_control(
			'sticky_toc_box_background_color_opacity',
			[
				'label' => esc_html__( 'Background Opacity', 'powerpack' ),
				'type'  => Controls_Manager::SLIDER,
				'range' => [
					'px'    => [
						'min'   => 0,
						'max'   => 1,
						'step'  => 0.10,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 0.5,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc.floating-toc' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'sticky_toc_box_shadow',
				'label' => esc_html__( 'Box Shadow', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-toc.floating-toc',
			]
		);

		$this->end_controls_section(); //Sticky ToC

		/**
		 * Section - Scroll to Top
		 * Tab - Style
		 * Condition - Content > Scroll to Top Toggle - Enabled
		 */

		$this->start_controls_section(
			'scroll_to_top_style_section',
			[
				'label' => esc_html__( 'Scroll to Top', 'powerpack' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'scroll_to_top_toggle' => 'yes',
				],
			]
		);

		$this->add_control(
			'scroll_to_top_icon_size',
			[
				'label' => esc_html__( 'Icon Size', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
						'step' => 5,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 20,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--icon i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'responsive' => true,
			]
		);

		$this->add_control(
			'scroll_to_top_box_padding',
			[
				'label' => esc_html__( 'Padding', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
						'step' => 5,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 20,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--container' => 'padding: {{SIZE}}{{UNIT}};',
				],
				'responsive' => true,
			]
		);

		$this->add_control(
			'scroll_to_top_icon_color',
			[
				'label' => esc_html__( 'Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--icon i' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'scroll_to_top_box_background_color',
			[
				'label' => esc_html__( 'Background Color', 'powerpack' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--container' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'                  => 'scroll_to_top_box_border',
				'label'                 => esc_html__( 'Border', 'powerpack' ),
				'selector'              => '{{WRAPPER}} .pp-toc__scroll-to-top--container',
			]
		);

		$this->add_control(
			'scroll_to_top_box_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'powerpack' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
						'step' => 5,
					],
					'%' => [
						'min'   => 0,
						'max'   => 100,
						'step'  => 5,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 20,
				],
				'selectors' => [
					'{{WRAPPER}} .pp-toc__scroll-to-top--container' => 'border-radius: {{SIZE}}{{UNIT}};',
				],
				'responsive' => true,
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'scroll_to_top_box_shadow',
				'label' => esc_html__( 'Box Shadow', 'powerpack' ),
				'selector' => '{{WRAPPER}} .pp-toc__scroll-to-top--container',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render Table of Contents widget template
	 *
	 * @since 1.4.15
	 * @access protected
	 */

	protected function render() {
		$types = Plugin::$instance->elements_manager->get_categories();
		$widgets = Plugin::$instance->widgets_manager->get_widget_types();

		$settings = $this->get_settings_for_display();

		if ( $settings['minimized_on'] ) {

			$minimized_on = $settings['minimized_on'];

			if ( ! is_array( $minimized_on ) ) {
				$minimized_on = [ $settings['minimized_on'] ];
			}

			foreach ( $minimized_on as $m ) {

				$this->add_render_attribute( '_wrapper', 'class', 'pp-toc--minimized-on-' . $m );
			}
		}

		$this->add_render_attribute(
			'header',
			[
				'class' => 'pp-toc__header',
				'aria-controls' => 'pp-toc__body',
			]
		);

		$this->add_render_attribute(
			'body',
			[
				'class' => 'pp-toc__body',
				'aria-expanded' => 'true',
			]
		);

		if ( $settings['collapse_subitems'] ) {
			$this->add_render_attribute( 'body', 'class', 'pp-toc__list-items--collapsible' );
		}

		if ( 'yes' === $settings['minimize_box'] ) {
			$this->add_render_attribute(
				'expand-button',
				[
					'class' => 'pp-toc__toggle-button pp-toc__toggle-button--expand',
					'role' => 'button',
					'tabindex' => '0',
					'aria-label' => esc_html__( 'Open table of contents', 'powerpack' ),
				]
			);
			$this->add_render_attribute(
				'collapse-button',
				[
					'class' => 'pp-toc__toggle-button pp-toc__toggle-button--collapse',
					'role' => 'button',
					'tabindex' => '0',
					'aria-label' => esc_html__( 'Close table of contents', 'powerpack' ),
				]
			);
		}

		$html_tag = PP_Helper::validate_html_tag( $settings['html_tag'] );
		?>
		<div id="<?php echo 'pp-toc-' . esc_attr( $this->get_id() ); ?>" class="pp-toc">
			<div <?php $this->print_render_attribute_string( 'header' ); ?>>
				<div class="pp-toc__header-title-wrapper">
					<<?php PP_Helper::print_validated_html_tag( $html_tag ); ?> class="pp-toc__header-title">
						<?php $this->print_unescaped_setting( 'title' ); ?>
					</<?php PP_Helper::print_validated_html_tag( $html_tag ); ?>>
				</div>

				<?php if ( 'yes' === $settings['minimize_box'] ) : ?>
					<div <?php $this->print_render_attribute_string( 'expand-button' ); ?>><?php Icons_Manager::render_icon( $settings['expand_icon'], [ 'aria-hidden' => 'true' ] ); ?></div>
					<div <?php $this->print_render_attribute_string( 'collapse-button' ); ?>><?php Icons_Manager::render_icon( $settings['collapse_icon'], [ 'aria-hidden' => 'true' ] ); ?></div>
				<?php endif; ?>
			</div>
			<div <?php $this->print_render_attribute_string( 'body' ); ?>>
				<div class="pp-toc__spinner-container">
					<i class="pp-toc__spinner eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</div>
			</div>
		</div>

		<?php if ( $settings['scroll_to_top_toggle'] ) { ?>

			<div class="pp-toc__scroll-to-top--container <?php echo esc_attr( $settings['scroll_to_top_align'] ); ?>">
				<div class="pp-toc__scroll-to-top--icon pp-icon"><?php Icons_Manager::render_icon( $settings['scroll_to_top_icon'] ); ?></div>
			</div>

			<?php
		}
	}
}
