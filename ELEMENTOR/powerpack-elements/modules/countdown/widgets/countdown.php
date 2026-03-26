<?php
namespace PowerpackElements\Modules\Countdown\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Classes\PP_Config;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Typography;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Countdown Widget
 */
class Countdown extends Powerpack_Widget {

	/**
	 * Retrieve Countdown widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Countdown' );
	}

	/**
	 * Retrieve Countdown widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Countdown' );
	}

	/**
	 * Retrieve Countdown widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Countdown' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the Countdown widget belongs to.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Countdown' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of scripts the Countdown widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [
			'pp-jquery-plugin',
			'pp-countdown-plugin',
			'jquery-cookie',
			'pp-countdown',
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
		return [ 'widget-pp-countdown' ];
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	* Get Counter Years
	*
	* @return array $options
	*/
	protected function get_normal_years() {
		$options = array( '0' => esc_html__( 'Year', 'powerpack' ) );

		$years = gmdate( 'Y' );

		for ( $i = $years; $i < $years + 6; $i++ ) {
			$options[ $i ] = $i;
		}

		return $options;
	}

	/**
	 * Get Counter Month
	 *
	 * @return array $options
	 */
	protected function get_normal_month() {
		$months = array(
			'1'  => esc_html__( 'Jan', 'powerpack' ),
			'2'  => esc_html__( 'Feb', 'powerpack' ),
			'3'  => esc_html__( 'Mar', 'powerpack' ),
			'4'  => esc_html__( 'Apr', 'powerpack' ),
			'5'  => esc_html__( 'May', 'powerpack' ),
			'6'  => esc_html__( 'Jun', 'powerpack' ),
			'7'  => esc_html__( 'Jul', 'powerpack' ),
			'8'  => esc_html__( 'Aug', 'powerpack' ),
			'9'  => esc_html__( 'Sep', 'powerpack' ),
			'10' => esc_html__( 'Oct', 'powerpack' ),
			'11' => esc_html__( 'Nov', 'powerpack' ),
			'12' => esc_html__( 'Dec', 'powerpack' ),
		);

		$options = array( '0' => esc_html__( 'Month', 'powerpack' ) );

		for ( $i = 1; $i <= 12; $i++ ) {
			$options[ $i ] = $months[ $i ];
		}

		return $options;
	}

	/**
	 * Get Counter Date
	 *
	 * @return array
	 */
	protected function get_normal_date() {
		$options = array( '0' => esc_html__( 'Date', 'powerpack' ) );

		for ( $i = 1; $i <= 31; $i++ ) {
			$options[ $i ] = $i;
		}

		return $options;
	}

	/**
	 * Get Counter Hours
	 *
	 * @return array
	 */
	protected function get_normal_hour() {
		$options = array( '0' => esc_html__( 'Hour', 'powerpack' ) );

		for ( $i = 0; $i < 24; $i++ ) {
			$options[ $i ] = $i;
		}

		return $options;
	}

	/**
	 * Get Counter Minutes
	 *
	 * @return array
	 */
	protected function get_normal_minutes() {
		$options = array( '0' => esc_html__( 'Minute', 'powerpack' ) );

		for ( $i = 0; $i < 60; $i++ ) {
			$options[ $i ] = $i;
		}

		return $options;
	}

	/**
	 * Get Counter Seconds
	 *
	 * @return array
	 */
	protected function get_normal_seconds() {
		$options = array( '0' => esc_html__( 'Seconds', 'powerpack' ) );

		for ( $i = 0; $i < 60; $i++ ) {
			$options[ $i ] = $i;
		}

		return $options;
	}

	/**
	 * Register Countdown widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {

		$this->register_presets_control( 'Countdown', $this );

		/* Content Tab */
		$this->register_content_countdown_controls();
		$this->register_content_action_controls();
		$this->register_content_structure_controls();
		$this->register_content_help_docs_controls();

		/* Style Tab */
		$this->register_style_general_controls();
		$this->register_style_separator_controls();
		$this->register_style_box_controls();
		$this->register_style_labels_controls();
		$this->register_style_typography_controls();
	}

	protected function register_content_countdown_controls() {
		/**
		 * Content Tab: Countdown
		 */
		$this->start_controls_section(
			'section_countdown',
			[
				'label' => esc_html__( 'Countdown', 'powerpack' ),
			]
		);

		$this->add_control(
			'timer_type',
			[
				'label'   => esc_html__( 'Timer Type', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'fixed',
				'options' => [
					'fixed'     => esc_html__( 'Fixed', 'powerpack' ),
					'evergreen' => esc_html__( 'Evergreen', 'powerpack' ),
				],
			]
		);

		$source_options = array(
			'custom' => esc_html__( 'Custom', 'powerpack' ),
		);

		if ( class_exists( 'acf' ) ) {
			$source_options['acf'] = esc_html__( 'ACF', 'powerpack' );
		}

		$this->add_control(
			'source',
			[
				'label'     => esc_html__( 'Source', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => $source_options,
				'default'   => 'custom',
				'condition' => [
					'timer_type' => 'fixed',
				],
			]
		);

		$this->add_control(
			'acf_field_name',
			array(
				'label'         => esc_html__( 'ACF Field Name', 'powerpack' ),
				'type'          => 'pp-query',
				'label_block'   => false,
				'multiple'      => false,
				'query_type'    => 'acf',
				'query_options' => [
					'show_type'       => false,
					'field_type'      => [
						'date',
					],
					'show_field_type' => true,
				],
				'condition'     => [
					'timer_type' => 'fixed',
					'source'     => 'acf',
				],
			)
		);

		$this->add_control(
			'years',
			[
				'label'     => esc_html__( 'Years', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => $this->get_normal_years(),
				'default'   => gmdate( 'Y', strtotime( '+1 month' ) ),
				'condition' => [
					'timer_type' => 'fixed',
					'source'     => 'custom',
				],
			]
		);

		$this->add_control(
			'months',
			[
				'label'     => esc_html__( 'Months', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => $this->get_normal_month(),
				'default'   => gmdate( 'n', strtotime( '+1 month' ) ),
				'condition' => [
					'timer_type' => 'fixed',
					'source'     => 'custom',
				],
			]
		);

		$this->add_control(
			'days',
			[
				'label'      => esc_html__( 'Days', 'powerpack' ),
				'type'       => Controls_Manager::SELECT,
				'options'    => $this->get_normal_date(),
				'default'    => '9',
				'conditions' => [
					'relation' => 'or',
					'terms'    => [
						[
							'name'     => 'timer_type',
							'operator' => '==',
							'value'    => 'evergreen',
						],
						[
							'relation' => 'and',
							'terms'    => [
								[
									'name'     => 'timer_type',
									'operator' => '==',
									'value'    => 'fixed',
								],
								[
									'name'     => 'source',
									'operator' => '==',
									'value'    => 'custom',
								],
							],
						],
					],
				],
			]
		);

		$this->add_control(
			'hours',
			[
				'label'      => esc_html__( 'Hours', 'powerpack' ),
				'type'       => Controls_Manager::SELECT,
				'options'    => $this->get_normal_hour(),
				'default'    => '7',
				'conditions' => [
					'relation' => 'or',
					'terms'    => [
						[
							'name'     => 'timer_type',
							'operator' => '==',
							'value'    => 'evergreen',
						],
						[
							'relation' => 'and',
							'terms'    => [
								[
									'name'     => 'timer_type',
									'operator' => '==',
									'value'    => 'fixed',
								],
								[
									'name'     => 'source',
									'operator' => '==',
									'value'    => 'custom',
								],
							],
						],
					],
				],
			]
		);

		$this->add_control(
			'minutes',
			[
				'label'      => esc_html__( 'Minutes', 'powerpack' ),
				'type'       => Controls_Manager::SELECT,
				'options'    => $this->get_normal_minutes(),
				'default'    => '10',
				'conditions' => [
					'relation' => 'or',
					'terms'    => [
						[
							'name'     => 'timer_type',
							'operator' => '==',
							'value'    => 'evergreen',
						],
						[
							'relation' => 'and',
							'terms'    => [
								[
									'name'     => 'timer_type',
									'operator' => '==',
									'value'    => 'fixed',
								],
								[
									'name'     => 'source',
									'operator' => '==',
									'value'    => 'custom',
								],
							],
						],
					],
				],
			]
		);

		$this->add_control(
			'seconds',
			[
				'label'     => esc_html__( 'Seconds', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => $this->get_normal_seconds(),
				'default'   => '20',
				'condition' => [
					'timer_type' => 'evergreen',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_action_controls() {
		/**
		 * Content Tab: Action
		 */
		$this->start_controls_section(
			'section_counter_fixed_action',
			[
				'label'     => esc_html__( 'Action', 'powerpack' ),
				'condition' => [
					'timer_type' => 'fixed',
				],
			]
		);

		$this->add_control(
			'fixed_timer_action',
			[
				'label'     => esc_html__( 'Action After Timer Expires', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'none'     => esc_html__( 'None', 'powerpack' ),
					'hide'     => esc_html__( 'Hide Timer', 'powerpack' ),
					'msg'      => esc_html__( 'Display Message', 'powerpack' ),
					'redirect' => esc_html__( 'Redirect to URL', 'powerpack' ),
				],
				'default'   => 'none',
				'condition' => [
					'timer_type' => 'fixed',
				],
			]
		);

		$this->add_control(
			'fixed_expire_message',
			[
				'label'     => esc_html__( 'Expiry Message', 'powerpack' ),
				'type'      => Controls_Manager::TEXTAREA,
				'condition' => [
					'fixed_timer_action'    => 'msg',
				],
			]
		);

		$this->add_control(
			'fixed_redirect_link',
			[
				'label'       => esc_html__( 'Link', 'powerpack' ),
				'type'        => Controls_Manager::URL,
				'dynamic'     => [
					'active'  => true,
				],
				'placeholder' => '',
				'default'     => [
					'url' => '#',
				],
				'condition'   => [
					'fixed_timer_action'    => 'redirect',
				],
			]
		);

		$this->add_control(
			'fixed_redirect_link_target',
			[
				'label'     => esc_html__( 'Link Target', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'_self'  => esc_html__( 'Same Window', 'powerpack' ),
					'_blank' => esc_html__( 'New Window', 'powerpack' ),
				],
				'default'   => '_self',
				'condition' => [
					'fixed_timer_action'    => 'redirect',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_counter_evergreen_action',
			[
				'label' => esc_html__( 'Action', 'powerpack' ),
				'condition' => [
					'timer_type'    => 'evergreen',
				],
			]
		);

		$this->add_control(
			'evergreen_timer_action',
			[
				'label'     => esc_html__( 'Action After Timer Expires', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'none'     => esc_html__( 'None', 'powerpack' ),
					'hide'     => esc_html__( 'Hide Timer', 'powerpack' ),
					'reset'    => esc_html__( 'Reset Timer', 'powerpack' ),
					'msg'      => esc_html__( 'Display Message', 'powerpack' ),
					'redirect' => esc_html__( 'Redirect to URL', 'powerpack' ),
				],
				'default'   => 'none',
				'condition' => [
					'timer_type' => 'evergreen',
				],
			]
		);

		$this->add_control(
			'evergreen_expire_message',
			[
				'label'     => esc_html__( 'Expiry Message', 'powerpack' ),
				'type'      => Controls_Manager::TEXTAREA,
				'condition' => [
					'evergreen_timer_action' => 'msg',
				],
			]
		);

		$this->add_control(
			'evergreen_redirect_link',
			[
				'label'       => esc_html__( 'Link', 'powerpack' ),
				'type'        => Controls_Manager::URL,
				'dynamic'     => [
					'active'  => true,
				],
				'placeholder' => '',
				'default'     => [
					'url' => '#',
				],
				'condition'   => [
					'evergreen_timer_action' => 'redirect',
				],
			]
		);

		$this->add_control(
			'evergreen_redirect_link_target',
			[
				'label'     => esc_html__( 'Link Target', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'_self'  => esc_html__( 'Same Window', 'powerpack' ),
					'_blank' => esc_html__( 'New Window', 'powerpack' ),
				],
				'default'   => '_self',
				'condition' => [
					'evergreen_timer_action' => 'redirect',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_structure_controls() {
		/**
		 * Content Tab: Structure
		 */
		$this->start_controls_section(
			'section_structure',
			[
				'label' => esc_html__( 'Structure', 'powerpack' ),
			]
		);

		$this->add_control(
			'show_labels',
			[
				'label' => esc_html__( 'Show Labels', 'powerpack' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'powerpack' ),
				'label_off' => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->add_control(
			'show_years',
			[
				'label'        => esc_html__( 'Show Years', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->add_control(
			'label_years_plural',
			[
				'label'       => esc_html__( 'Label in Plural', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Years', 'powerpack' ),
				'placeholder' => esc_html__( 'Years', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_years'   => 'yes',
				],
			]
		);

		$this->add_control(
			'label_years_singular',
			[
				'label'       => esc_html__( 'Label in Singular', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Year', 'powerpack' ),
				'placeholder' => esc_html__( 'Year', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_years'   => 'yes',
				],
			]
		);

		$this->add_control(
			'show_months',
			[
				'label'        => esc_html__( 'Show Months', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->add_control(
			'label_months_plural',
			[
				'label'       => esc_html__( 'Label in Plural', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Months', 'powerpack' ),
				'placeholder' => esc_html__( 'Months', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_months' => 'yes',
				],
			]
		);

		$this->add_control(
			'label_months_singular',
			[
				'label'       => esc_html__( 'Label in Singular', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Month', 'powerpack' ),
				'placeholder' => esc_html__( 'Month', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_months'  => 'yes',
				],
			]
		);

		$this->add_control(
			'show_days',
			[
				'label'        => esc_html__( 'Show Days', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->add_control(
			'label_days_plural',
			[
				'label'       => esc_html__( 'Label in Plural', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Days', 'powerpack' ),
				'placeholder' => esc_html__( 'Days', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_days'    => 'yes',
				],
			]
		);

		$this->add_control(
			'label_days_singular',
			[
				'label'       => esc_html__( 'Label in Singular', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Day', 'powerpack' ),
				'placeholder' => esc_html__( 'Day', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_days'    => 'yes',
				],
			]
		);

		$this->add_control(
			'show_hours',
			[
				'label'        => esc_html__( 'Show Hours', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->add_control(
			'label_hours_plural',
			[
				'label'       => esc_html__( 'Label in Plural', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Hours', 'powerpack' ),
				'placeholder' => esc_html__( 'Hours', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_hours'   => 'yes',
				],
			]
		);

		$this->add_control(
			'label_hours_singular',
			[
				'label'       => esc_html__( 'Label in Singular', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Hour', 'powerpack' ),
				'placeholder' => esc_html__( 'Hour', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_hours'   => 'yes',
				],
			]
		);

		$this->add_control(
			'show_minutes',
			[
				'label'        => esc_html__( 'Show Minutes', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->add_control(
			'label_minutes_plural',
			[
				'label'       => esc_html__( 'Label in Plural', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Minutes', 'powerpack' ),
				'placeholder' => esc_html__( 'Minutes', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_minutes' => 'yes',
				],
			]
		);

		$this->add_control(
			'label_minutes_singular',
			[
				'label'       => esc_html__( 'Label in Singular', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Minute', 'powerpack' ),
				'placeholder' => esc_html__( 'Minute', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_minutes' => 'yes',
				],
			]
		);

		$this->add_control(
			'show_seconds',
			[
				'label'        => esc_html__( 'Show Seconds', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->add_control(
			'label_seconds_plural',
			[
				'label'       => esc_html__( 'Label in Plural', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Seconds', 'powerpack' ),
				'placeholder' => esc_html__( 'Seconds', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_seconds' => 'yes',
				],
			]
		);

		$this->add_control(
			'label_seconds_singular',
			[
				'label'       => esc_html__( 'Label in Singular', 'powerpack' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => esc_html__( 'Second', 'powerpack' ),
				'placeholder' => esc_html__( 'Second', 'powerpack' ),
				'condition'   => [
					'show_labels!' => '',
					'show_seconds' => 'yes',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_content_help_docs_controls() {

		$help_docs = PP_Config::get_widget_help_links( 'Countdown' );

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

	protected function register_style_general_controls() {
		/**
		 * Style Tab: General
		 */
		$this->start_controls_section(
			'section_general_style',
			[
				'label' => esc_html__( 'General', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'counter_alignment',
			[
				'label'     => esc_html__( 'Alignment', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'left'   => esc_html__( 'Left', 'powerpack' ),
					'center' => esc_html__( 'Center', 'powerpack' ),
					'right'  => esc_html__( 'Right', 'powerpack' ),
				],
				'default'   => 'center',
				'selectors' => [
					'{{WRAPPER}} .pp-countdown-wrapper' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'digit_label_spacing',
			[
				'label'      => esc_html__( 'Space between label & digit', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'default'    => [
					'size' => 10,
				],
				'range'      => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-out_below .pp-countdown-item .pp-countdown-digit-wrapper' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-out_above .pp-countdown-item .pp-countdown-digit-wrapper' => 'margin-top: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-out_right .pp-countdown-item .pp-countdown-digit-wrapper' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-out_left .pp-countdown-item .pp-countdown-digit-wrapper' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-in_below .pp-countdown-item .pp-countdown-digit' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-in_above .pp-countdown-item .pp-countdown-digit' => 'margin-top: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-normal_below .pp-countdown-item .pp-countdown-digit' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-label-pos-normal_above .pp-countdown-item .pp-countdown-digit' => 'margin-top: {{SIZE}}{{UNIT}};',
				],
				'condition'  => [
					'show_labels' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'block_spacing',
			[
				'label'      => esc_html__( 'Space between blocks', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default'    => [
					'size' => 20,
				],
				'range'      => [
					'px' => [
						'min' => -20,
						'max' => 100,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-align-right .pp-countdown-item' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-align-left .pp-countdown-item' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-align-center .pp-countdown-item' => 'margin-left: calc( {{SIZE}}{{UNIT}}/2 ); margin-right: calc( {{SIZE}}{{UNIT}}/2 );',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-line .pp-countdown-item' => 'padding-left: calc( {{SIZE}}{{UNIT}}/2 ); padding-right: calc( {{SIZE}}{{UNIT}}/2 );',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-colon .pp-countdown-item .pp-countdown-digit-wrapper' => 'padding-left: calc( {{SIZE}}{{UNIT}}/2 ); padding-right: calc( {{SIZE}}{{UNIT}}/2 );',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-colon.pp-countdown-style-default .pp-countdown-item .pp-countdown-digit-wrapper' => 'padding: 0 {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-line.pp-countdown-style-default .pp-countdown-item' => 'padding: 0 {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-colon .pp-countdown-item .pp-countdown-digit-wrapper:after' => 'right: calc( -{{SIZE}}{{UNIT}} / 2 + -5{{UNIT}} );',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-line .pp-countdown-item:after' => 'right: calc( -{{SIZE}}{{UNIT}} / 2 + 5{{UNIT}} );',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_separator_controls() {
		/**
		 * Style Tab: Separator
		 */
		$this->start_controls_section(
			'section_separator_style',
			[
				'label' => esc_html__( 'Separator', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'separator_type',
			[
				'label'   => esc_html__( 'Show Separator', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => [
					'none'  => esc_html__( 'None', 'powerpack' ),
					'colon' => esc_html__( 'Colon', 'powerpack' ),
					'line'  => esc_html__( 'Line', 'powerpack' ),
				],
				'default' => 'none',
			]
		);

		$this->add_control(
			'separator_color',
			[
				'label'     => esc_html__( 'Separator Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => [
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-line .pp-countdown-item:after' => 'border-color: {{VALUE}};',
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-colon .pp-countdown-item .pp-countdown-digit-wrapper:after' => 'color: {{VALUE}};',
				],
				'condition' => [
					'separator_type!' => 'none',
				],
			]
		);

		$this->add_responsive_control(
			'separator_size',
			[
				'label'      => esc_html__( 'Separator Size', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'default'    => [
					'size' => 10,
				],
				'range'      => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper.pp-countdown-separator-colon .pp-countdown-item .pp-countdown-digit-wrapper:after' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition'  => [
					'separator_type' => 'colon',
				],
			]
		);

		$this->add_control(
			'hide_separator',
			[
				'label'        => esc_html__( 'Hide on mobile', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_box_controls() {
		/**
		 * Style Tab: Boxes
		 */
		$this->start_controls_section(
			'section_box_style',
			[
				'label' => esc_html__( 'Boxes', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'block_style',
			[
				'label'   => esc_html__( 'Style', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => [
					'default' => esc_html__( 'Default', 'powerpack' ),
					'circle'  => esc_html__( 'Circle', 'powerpack' ),
					'square'  => esc_html__( 'Square', 'powerpack' ),
				],
				'default' => 'default',
			]
		);

		$this->add_responsive_control(
			'block_width',
			[
				'label'      => esc_html__( 'Width', 'powerpack' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'default'    => [
					'size' => 100,
				],
				'range'      => [
					'px' => [
						'min' => 10,
						'max' => 500,
					],
				],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit-wrapper' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				],
				'condition'  => [
					'block_style!' => 'default',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'      => 'toggle_switch_background',
				'types'     => [ 'none', 'classic', 'gradient' ],
				'selector'  => '{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit-wrapper',
				'condition' => [
					'block_style!' => 'default',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name'      => 'box_border',
				'selector'  => '{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit-wrapper',
				'separator' => 'before',
				'condition' => [
					'block_style!' => 'default',
				],
			]
		);

		$this->add_control(
			'box_border_radius',
			[
				'label'      => esc_html__( 'Border Radius', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit-wrapper' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'  => [
					'block_style' => 'square',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name'      => 'block_box_shadow',
				'selector'  => '{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit-wrapper',
				'separator' => 'before',
				'condition' => [
					'block_style!' => 'default',
				],
			]
		);

		$this->add_responsive_control(
			'block_padding',
			[
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit-wrapper' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition'  => [
					'block_style!' => 'default',
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
				'label' => esc_html__( 'Labels', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'label_position',
			[
				'label'   => esc_html__( 'Label Position', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'options' => [
					'inside'  => esc_html__( 'Inside Digit Container', 'powerpack' ),
					'outside' => esc_html__( 'Outside Digit Container', 'powerpack' ),
				],
				'default' => 'outside',
			]
		);

		$this->add_control(
			'label_inside_position',
			[
				'label'     => esc_html__( 'Label Inside Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'in_below' => esc_html__( 'Below Digit', 'powerpack' ),
					'in_above' => esc_html__( 'Above Digit', 'powerpack' ),
				],
				'default'   => 'in_below',
				'condition' => [
					'label_position' => 'inside',
				],
			]
		);

		$this->add_control(
			'label_outside_position',
			[
				'label'     => esc_html__( 'Label Outside Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'out_below' => esc_html__( 'Below Digit', 'powerpack' ),
					'out_above' => esc_html__( 'Above Digit', 'powerpack' ),
					'out_right' => esc_html__( 'Right Side of Digit', 'powerpack' ),
					'out_left'  => esc_html__( 'Left Side of Digit', 'powerpack' ),
				],
				'default'   => 'out_below',
				'condition' => [
					'label_position' => 'outside',
				],
			]
		);

		$this->add_control(
			'default_position',
			[
				'label'     => esc_html__( 'Select Position', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'options'   => [
					'normal_below' => esc_html__( 'Below Digit', 'powerpack' ),
					'normal_above' => esc_html__( 'Above Digit', 'powerpack' ),
				],
				'default'   => 'normal_below',
				'condition' => [
					'block_style' => 'default',
				],
			]
		);

		$this->add_control(
			'label_bg_color',
			[
				'label'     => esc_html__( 'Background Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-label' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'label_padding',
			[
				'label'      => esc_html__( 'Padding', 'powerpack' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors'  => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-label' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function register_style_typography_controls() {
		/**
		 * Style Tab: Typography
		 */
		$this->start_controls_section(
			'section_typography',
			[
				'label' => esc_html__( 'Typography', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'heading_digits',
			[
				'label' => esc_html__( 'Digits', 'powerpack' ),
				'type'  => Controls_Manager::HEADING,
			]
		);

		$this->add_control(
			'digit_color',
			[
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'digit_tag',
			[
				'label'   => esc_html__( 'Tag', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'h3',
				'options' => [
					'h1'  => 'h1',
					'h2'  => 'h2',
					'h3'  => 'h3',
					'h4'  => 'h4',
					'h5'  => 'h5',
					'h6'  => 'h6',
					'div' => 'div',
					'p'   => 'p',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'digit_typography',
				'selector' => '{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-digit',
				'global'   => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
			]
		);

		$this->add_control(
			'heading_label',
			[
				'label'     => esc_html__( 'Label', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'label_color',
			[
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-label' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'label_tag',
			[
				'label'   => esc_html__( 'Tag', 'powerpack' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'p',
				'options' => [
					'h1'  => 'h1',
					'h2'  => 'h2',
					'h3'  => 'h3',
					'h4'  => 'h4',
					'h5'  => 'h5',
					'h6'  => 'h6',
					'div' => 'div',
					'p'   => 'p',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'label_typography',
				'selector' => '{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-item .pp-countdown-label',
				'global'   => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
			]
		);

		$this->add_control(
			'heading_message',
			[
				'label' => esc_html__( 'Expiry Message', 'powerpack' ),
				'type'  => Controls_Manager::HEADING,
			]
		);

		$this->add_control(
			'message_color',
			[
				'label'     => esc_html__( 'Color', 'powerpack' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-expire-message' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'message_typography',
				'selector' => '{{WRAPPER}} .pp-countdown-wrapper .pp-countdown-expire-message',
				'global'   => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
			]
		);

		$this->end_controls_section();
	}

	public function get_gmt_difference() {
		$timezone = get_option( 'timezone_string' );

		if ( ! empty( $timezone ) ) {

			$time_zone_kolkata = new \DateTimeZone( 'Asia/Kolkata' );
			$time_zone = new \DateTimeZone( $timezone );

			$time_kolkata = new \DateTime( 'now', $time_zone_kolkata );

			$time_offset = $time_zone->getOffset( $time_kolkata );

			return $time_offset / 3600;
		} else {
			return 'NULL';
		}

	}

	private function labels_check( $label ) { // phpcs:ignore PSR2.Methods.MethodDeclaration.Underscore
		$settings  = $this->get_settings_for_display();

		return ( 'yes' === $settings['show_labels'] && 'yes' === $settings[$label] );
	}

	private function _get_settings() { // phpcs:ignore PSR2.Methods.MethodDeclaration.Underscore
		$instance  = $this->get_settings_for_display();

		$keys = array(
			'timer_type',
			'years',
			'months',
			'days',
			'hours',
			'minutes',
			'seconds',
			'show_labels',
			'show_years',
			'show_months',
			'show_days',
			'show_hours',
			'show_minutes',
			'show_seconds',
			'label_years_plural',
			'label_years_singular',
			'label_months_plural',
			'label_months_singular',
			'label_days_plural',
			'label_days_singular',
			'label_hours_plural',
			'label_hours_singular',
			'label_minutes_plural',
			'label_minutes_singular',
			'label_seconds_plural',
			'label_seconds_singular',
			'block_style',
			'label_position',
			'label_position_inside',
			'label_position_outside',
			'evergreen_timer_action',
			'fixed_timer_action',
		);

		$defaults = array(
			'label_years_plural'        => esc_html__( 'Years', 'powerpack' ),
			'label_years_singular'      => esc_html__( 'Year', 'powerpack' ),
			'label_months_plural'       => esc_html__( 'Months', 'powerpack' ),
			'label_months_singular'     => esc_html__( 'Month', 'powerpack' ),
			'label_days_plural'         => esc_html__( 'Days', 'powerpack' ),
			'label_days_singular'       => esc_html__( 'Day', 'powerpack' ),
			'label_hours_plural'        => esc_html__( 'Hours', 'powerpack' ),
			'label_hours_singular'      => esc_html__( 'Hour', 'powerpack' ),
			'label_minutes_plural'      => esc_html__( 'Minutes', 'powerpack' ),
			'label_minutes_singular'    => esc_html__( 'Minute', 'powerpack' ),
			'label_seconds_plural'      => esc_html__( 'Seconds', 'powerpack' ),
			'label_seconds_singular'    => esc_html__( 'Second', 'powerpack' ),
		);

		$settings = array();

		if ( 'acf' === $instance['source'] && class_exists( '\acf' ) ) {
			if ( $instance['acf_field_name'] ) {
				$date_string = get_field( $instance['acf_field_name'] );

				$field_settings = get_field_object( $instance['acf_field_name'] );

				$field_format   = $field_settings['return_format'];
				$field_db_value = acf_get_metadata( get_the_ID(), $field_settings['name'] );

				// ACF saves values in these formats in the database
				// We use the db values to bypass days and months translations
				// not supported by PHP's DateTime
				$field_db_format = 'date_time_picker' === $field_settings['type'] ? 'Y-m-d H:i:s' : 'Ymd';

				$date = \DateTime::createFromFormat( $field_db_format, $field_db_value );

				if ( $date ) {
					$years = $date->format( 'Y' );
					$months = $date->format( 'm' );
					$days = $date->format( 'd' );
					$hours = $date->format( 'H' );
					$minutes = $date->format( 'i' );

					$settings['years'] = $years;
					$settings['months'] = $months;
					$settings['days'] = $days;
					$settings['hours'] = $hours;
					$settings['minutes'] = $minutes;
				}
			}
		}

		foreach ( $keys as $key ) {
			if ( ! isset( $instance[ $key ] ) ) {
				continue;
			}

			if ( empty( $instance[ $key ] ) && in_array( $key, $defaults, true ) ) {
				$settings[ $key ] = $defaults[ $key ];
			} else {
				$settings[ $key ] = $instance[ $key ];
			}
		}

		/***********************************
		 * Build layout
		 ***********************************/

		// default block style.
		if ( 'default' === $instance['block_style'] ) {
			if ( 'normal_below' === $instance['default_position'] ) {
				$layout = '';
				if ( 'evergreen' !== $instance['timer_type'] ) {
					$layout .= "{y<} {$this->render_normal_countdown( '{ynn}', '{yl}' )} {y>}";
				}
				$layout .= "
					{o<} {$this->render_normal_countdown( '{onn}', '{ol}' )} {o>}
					{d<} {$this->render_normal_countdown( '{dnn}', '{dl}' )} {d>}
					{h<} {$this->render_normal_countdown( '{hnn}', '{hl}' )} {h>}
					{m<} {$this->render_normal_countdown( '{mnn}', '{ml}' )} {m>}
					{s<} {$this->render_normal_countdown( '{snn}', '{sl}' )} {s>}
				";

				$settings['timer_layout'] = "{$layout}";
			}

			if ( 'normal_above' === $instance['default_position'] ) {
				$layout = '';
				if ( 'evergreen' !== $instance['timer_type'] ) {
					$layout .= "{y<} {$this->render_normal_above_countdown( '{ynn}', '{yl}', '{y>}' )}";
				}
				$layout .= "
					{o<} {$this->render_normal_above_countdown( '{onn}', '{ol}', '{o>}' )}
					{d<} {$this->render_normal_above_countdown( '{dnn}', '{dl}', '{d>}' )}
					{h<} {$this->render_normal_above_countdown( '{hnn}', '{hl}', '{h>}' )}
					{m<} {$this->render_normal_above_countdown( '{mnn}', '{ml}', '{m>}' )}
					{s<} {$this->render_normal_above_countdown( '{snn}', '{sl}', '{s>}' )}
				";

				$settings['timer_layout'] = "{$layout}";
			}
		}

		// label position outside.
		if ( 'outside' === $instance['label_position'] ) {
			if ( 'out_below' === $instance['label_outside_position'] ) {
				$layout = '';
				if ( 'evergreen' !== $instance['timer_type'] ) {
					$layout .= "{y<} {$this->render_normal_countdown( '{ynn}', '{yl}' )} {y>}";
				}
				$layout .= "
					{o<} {$this->render_normal_countdown( '{onn}', '{ol}' )} {o>}
					{d<} {$this->render_normal_countdown( '{dnn}', '{dl}' )} {d>}
					{h<} {$this->render_normal_countdown( '{hnn}', '{hl}' )} {h>}
					{m<} {$this->render_normal_countdown( '{mnn}', '{ml}' )} {m>}
					{s<} {$this->render_normal_countdown( '{snn}', '{sl}' )} {s>}
				";

				$settings['timer_layout'] = "{$layout}";
			}

			if ( 'out_above' === $instance['label_outside_position'] || 'out_right' === $instance['label_outside_position'] || 'out_left' === $instance['label_outside_position'] ) {
				$layout = '';
				if ( 'evergreen' !== $instance['timer_type'] ) {
					$layout .= "{y<} {$this->render_outside_countdown( '{ynn}', '{yl}', '{y>}' )}";
				}
				$layout .= "
					{o<} {$this->render_outside_countdown( '{onn}', '{ol}', '{o>}' )}
					{d<} {$this->render_outside_countdown( '{dnn}', '{dl}', '{d>}' )}
					{h<} {$this->render_outside_countdown( '{hnn}', '{hl}', '{h>}' )}
					{m<} {$this->render_outside_countdown( '{mnn}', '{ml}', '{m>}' )}
					{s<} {$this->render_outside_countdown( '{snn}', '{sl}', '{s>}' )}
				";

				$settings['timer_layout'] = "{$layout}";
			}
		}

		// label position inside.
		if ( 'inside' === $instance['label_position'] ) {
			if ( 'in_below' === $instance['label_inside_position'] ) {
				$layout = '';
				if ( 'evergreen' !== $instance['timer_type'] ) {
					$layout .= "{y<} {$this->render_inside_below_countdown( '{ynn}', '{yl}', '{y>}' )}";
				}
				$layout .= "
					{o<} {$this->render_inside_below_countdown( '{onn}', '{ol}', '{o>}' )}
					{d<} {$this->render_inside_below_countdown( '{dnn}', '{dl}', '{d>}' )}
					{h<} {$this->render_inside_below_countdown( '{hnn}', '{hl}', '{h>}' )}
					{m<} {$this->render_inside_below_countdown( '{mnn}', '{ml}', '{m>}' )}
					{s<} {$this->render_inside_below_countdown( '{snn}', '{sl}', '{s>}' )}
				";

				$settings['timer_layout'] = "{$layout}";
			}

			if ( 'in_above' === $instance['label_inside_position'] ) {
				$layout = '';
				if ( 'evergreen' !== $instance['timer_type'] ) {
					$layout .= "{y<} {$this->render_inside_above_countdown( '{ynn}', '{yl}', '{y>}' )}";
				}
				$layout .= "
					{o<} {$this->render_inside_above_countdown( '{onn}', '{ol}', '{o>}' )}
					{d<} {$this->render_inside_above_countdown( '{dnn}', '{dl}', '{d>}' )}
					{h<} {$this->render_inside_above_countdown( '{hnn}', '{hl}', '{h>}' )}
					{m<} {$this->render_inside_above_countdown( '{mnn}', '{ml}', '{m>}' )}
					{s<} {$this->render_inside_above_countdown( '{snn}', '{sl}', '{s>}' )}
				";

				$settings['timer_layout'] = "{$layout}";
			}
		}

		/***********************************
		 * Timer format
		 ***********************************/
		$settings['timer_format'] = '';

		if ( $settings['show_years'] ) {
			$settings['timer_format'] .= 'Y';
		}
		if ( $settings['show_months'] ) {
			$settings['timer_format'] .= 'O';
		}
		if ( $settings['show_days'] ) {
			$settings['timer_format'] .= 'D';
		}
		if ( $settings['show_hours'] ) {
			$settings['timer_format'] .= 'H';
		}
		if ( $settings['show_minutes'] ) {
			$settings['timer_format'] .= 'M';
		}
		if ( $settings['show_seconds'] ) {
			$settings['timer_format'] .= 'S';
		}

		/***********************************
		 * Timer labels
		 ***********************************/
		$label_years_plural = ( $this->labels_check('show_years') ) ? $settings['label_years_plural'] : esc_html__( 'Years', 'powerpack' );
		$label_years_singular = ( $this->labels_check('show_years') ) ? $settings['label_years_singular'] : esc_html__( 'Year', 'powerpack' );
		$label_months_plural = ( $this->labels_check('show_months') ) ? $settings['label_months_plural'] : esc_html__( 'Months', 'powerpack' );
		$label_months_singular = ( $this->labels_check('show_months') ) ? $settings['label_months_singular'] : esc_html__( 'Month', 'powerpack' );
		$label_days_plural = ( $this->labels_check('show_days') ) ? $settings['label_days_plural'] : esc_html__( 'Days', 'powerpack' );
		$label_days_singular = ( $this->labels_check('show_days') ) ? $settings['label_days_singular'] : esc_html__( 'Day', 'powerpack' );
		$label_hours_plural = ( $this->labels_check('show_hours') ) ? $settings['label_hours_plural'] : esc_html__( 'Hours', 'powerpack' );
		$label_hours_singular = ( $this->labels_check('show_hours') ) ? $settings['label_hours_singular'] : esc_html__( 'Hour', 'powerpack' );
		$label_minutes_plural = ( $this->labels_check('show_minutes') ) ? $settings['label_minutes_plural'] : esc_html__( 'Minutes', 'powerpack' );
		$label_minutes_singular = ( $this->labels_check('show_minutes') ) ? $settings['label_minutes_singular'] : esc_html__( 'Minute', 'powerpack' );
		$label_seconds_plural = ( $this->labels_check('show_seconds') ) ? $settings['label_seconds_plural'] : esc_html__( 'Seconds', 'powerpack' );
		$label_seconds_singular = ( $this->labels_check('show_seconds') ) ? $settings['label_seconds_singular'] : esc_html__( 'Second', 'powerpack' );

		$settings['timer_labels'] = "{$label_years_plural},{$label_months_plural},,{$label_days_plural},{$label_hours_plural},{$label_minutes_plural},{$label_seconds_plural}";
		$settings['timer_labels_singular'] = "{$label_years_singular},{$label_months_singular},,{$label_days_singular},{$label_hours_singular},{$label_minutes_singular},{$label_seconds_singular}";

		/***********************************
		 * Timezone difference
		 ***********************************/
		$settings['time_zone'] = "{$this->get_gmt_difference()}";

		$settings['timer_exp_text'] = '';

		/***********************************
		 * Redirect link and expire message
		 ***********************************/
		if ( 'evergreen' === $instance['timer_type'] ) {
			$settings['redirect_link']          = ! empty( $instance['evergreen_redirect_link'] ) ? $instance['evergreen_redirect_link'] : '';
			$settings['redirect_link_target']   = ! empty( $instance['evergreen_redirect_link_target'] ) ? $instance['evergreen_redirect_link_target'] : '';
			$settings['expire_message']         = ! empty( $instance['evergreen_expire_message'] ) ? preg_replace( '/\s+/', ' ', $instance['evergreen_expire_message'] ) : '';
		}
		if ( 'fixed' === $instance['timer_type'] ) {
			$settings['redirect_link']          = ! empty( $instance['fixed_redirect_link'] ) ? $instance['fixed_redirect_link'] : '';
			$settings['redirect_link_target']   = ! empty( $instance['fixed_redirect_link_target'] ) ? $instance['fixed_redirect_link_target'] : '';
			$settings['expire_message']         = ! empty( $instance['fixed_expire_message'] ) ? preg_replace( '/\s+/', ' ', $instance['fixed_expire_message'] ) : '';
			$settings['timer_exp_text']         = '<div class="pp-countdown-expire-message">' . $settings['expire_message'] . '</div>';
		}

		return $settings;
	}

	public function render_normal_countdown( $str1, $str2 ) {
		$settings = $this->get_settings();
		ob_start();

		$digit_tag = PP_Helper::validate_html_tag( $settings['digit_tag'] );
		$label_tag = PP_Helper::validate_html_tag( $settings['label_tag'] );
		?>
		<div class="pp-countdown-item">
			<div class="pp-countdown-digit-wrapper">
				<<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?> class="pp-countdown-digit">
					<?php echo esc_attr( $str1 ); ?>
				</<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?>>
			</div>
			<?php if ( 'yes' === $settings['show_labels'] ) { ?>
				<div class="pp-countdown-label-wrapper">
					<<?php PP_Helper::print_validated_html_tag( $label_tag ); ?> class="pp-countdown-label">
						<?php echo esc_attr( $str2 ); ?>
					</<?php PP_Helper::print_validated_html_tag( $label_tag ); ?>>
				</div>
			<?php } ?>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	public function render_normal_above_countdown( $str1, $str2, $str3 ) {
		$settings = $this->get_settings();
		ob_start();

		$digit_tag = PP_Helper::validate_html_tag( $settings['digit_tag'] );
		$label_tag = PP_Helper::validate_html_tag( $settings['label_tag'] );
		?>
		<div class="pp-countdown-item">
			<div class="pp-countdown-digit-wrapper">
				<?php if ( 'yes' === $settings['show_labels'] ) { ?>
					<div class="pp-countdown-label-wrapper">
						<<?php PP_Helper::print_validated_html_tag( $label_tag ); ?> class="pp-countdown-label">
							<?php echo esc_attr( $str2 ); ?>
						</<?php PP_Helper::print_validated_html_tag( $label_tag ); ?>>
					</div>
				<?php } ?>
				<<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?> class="pp-countdown-digit">
					<?php echo esc_attr( $str1 ); ?>
				</<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?>>
			</div>
			<?php echo esc_attr( $str3 ); ?>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	public function render_inside_below_countdown( $str1, $str2, $str3 ) {
		$settings = $this->get_settings();
		ob_start();

		$digit_tag = PP_Helper::validate_html_tag( $settings['digit_tag'] );
		$label_tag = PP_Helper::validate_html_tag( $settings['label_tag'] );
		?>
		<div class="pp-countdown-item">
			<div class="pp-countdown-digit-wrapper">
				<div class="pp-countdown-digit-content">
					<<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?> class="pp-countdown-digit">
						<?php echo esc_attr( $str1 ); ?>
					</<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?>>
				</div>
				<?php if ( 'yes' === $settings['show_labels'] ) { ?>
				<div class="pp-countdown-label-wrapper">
					<<?php PP_Helper::print_validated_html_tag( $label_tag ); ?> class="pp-countdown-label">
						<?php echo esc_attr( $str2 ); ?>
					</<?php PP_Helper::print_validated_html_tag( $label_tag ); ?>>
				</div>
				<?php } ?>
			</div>
			<?php echo esc_attr( $str3 ); ?>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	public function render_inside_above_countdown( $str1, $str2, $str3 ) {
		$settings = $this->get_settings();
		ob_start();

		$digit_tag = PP_Helper::validate_html_tag( $settings['digit_tag'] );
		$label_tag = PP_Helper::validate_html_tag( $settings['label_tag'] );
		?>
		<div class="pp-countdown-item">
			<div class="pp-countdown-digit-wrapper">
				<?php if ( 'yes' === $settings['show_labels'] ) { ?>
				<div class="pp-countdown-label-wrapper">
					<<?php PP_Helper::print_validated_html_tag( $label_tag ); ?> class="pp-countdown-label">
						<?php echo esc_attr( $str2 ); ?>
					</<?php PP_Helper::print_validated_html_tag( $label_tag ); ?>>
				</div>
				<?php } ?>
				<<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?> class="pp-countdown-digit">
					<?php echo esc_attr( $str1 ); ?>
				</<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?>>
			</div>
			<?php echo esc_attr( $str3 ); ?>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	public function render_outside_countdown( $str1, $str2, $str3 ) {
		$settings = $this->get_settings();
		ob_start();

		$digit_tag = PP_Helper::validate_html_tag( $settings['digit_tag'] );
		$label_tag = PP_Helper::validate_html_tag( $settings['label_tag'] );
		?>
		<div class="pp-countdown-item">
			<?php if ( 'yes' === $settings['show_labels'] ) { ?>
			<div class="pp-countdown-label-wrapper">
				<<?php PP_Helper::print_validated_html_tag( $label_tag ); ?> class="pp-countdown-label">
					<?php echo esc_attr( $str2 ); ?>
				</<?php PP_Helper::print_validated_html_tag( $label_tag ); ?>>
			</div>
			<?php } ?>
			<div class="pp-countdown-digit-wrapper">
				<<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?> class="pp-countdown-digit">
					<?php echo esc_attr( $str1 ); ?>
				</<?php PP_Helper::print_validated_html_tag( $digit_tag ); ?>>
			</div>
			<?php echo esc_attr( $str3 ); ?>
		</div>
		<?php

		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	protected function render() {
		$instance  = $this->get_settings_for_display();
		$class = array(
			'pp-countdown-wrapper',
		);

		if ( 'default' !== $instance['block_style'] ) {
			$class[] = 'pp-countdown-label-' . $instance['label_position'];

			if ( 'inside' === $instance['label_position'] ) {
				$class[] = 'pp-countdown-label-pos-' . $instance['label_inside_position'];
			}
			if ( 'outside' === $instance['label_position'] ) {
				$class[] = 'pp-countdown-label-pos-' . $instance['label_outside_position'];
			}
		} else {
			$class[] = 'pp-countdown-label-pos-' . $instance['default_position'];
		}

		if ( 'none' !== $instance['separator_type'] ) {
			$class[] = 'pp-countdown-separator-' . $instance['separator_type'];
		}

		if ( 'yes' === $instance['hide_separator'] ) {
			$class[] = 'pp-countdown-separator-hide-mobile';
		}

		// $class[] = 'pp-countdown-align-' . $instance['counter_alignment'];
		$class[] = 'pp-countdown-style-' . $instance['block_style'];

		$this->add_render_attribute( 'pp-countdown', 'class', $class );
		?>
		<div <?php $this->print_render_attribute_string( 'pp-countdown' ); ?>></div>
		<textarea name="pp-countdown-settings" style="display: none;"><?php echo esc_attr( wp_json_encode( $this->_get_settings() ) ); ?></textarea>
		<?php
	}
}
