<?php
namespace PowerpackElements\Modules\DisplayConditions\Conditions;

// Powerpack Elements Classes
use PowerpackElements\Base\Condition;
use PowerpackElements\Classes\PP_Helper;

// Elementor Classes
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Woo_Last_Purchase extends Woo_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_name() {
		return 'woo_last_purchase';
	}

	/**
	 * Get Title
	 *
	 * Get the title of the module
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'Last Purchased', 'powerpack' );
	}

	/**
	 * Get Value Control
	 *
	 * Get the settings for the value control
	 *
	 * @since 2.10.0
	 * @return array
	 */
	public function get_value_control() {
		return [
			'type'           => \Elementor\Controls_Manager::DATE_TIME,
			'picker_options' => array(
				'format'     => 'Y-m-d',
				'enableTime' => false,
			),
			'label_block'   => true,
			'default'       => gmdate( 'Y/m/d' ),
		];
	}

	/**
	 * Check condition
	 *
	 * @since 2.10.0
	 *
	 * @access public
	 *
	 * @param string    $name       The control name to check
	 * @param string    $operator   Comparison operator
	 * @param mixed     $value      The control value to check
	 */
	public function check( $name, $operator, $value ) {
		$show = false;

		$args = array(
			'customer_id' => get_current_user_id(),
			'status'      => array( 'wc-completed' ),
			'limit'       => 1,
			'orderby'     => 'date_completed',
			'order'       => 'DESC',
		);

		$order = wc_get_orders( $args );

		$date_completed = $order && $order[0] ? date( 'Y-m-d', strtotime( $order[0]->get_Date_completed() ) ) : false;

		//$show = $value >= $date_completed ? true : false;

		return PP_Helper::compare( $date_completed, $value, $operator );
	}
}
