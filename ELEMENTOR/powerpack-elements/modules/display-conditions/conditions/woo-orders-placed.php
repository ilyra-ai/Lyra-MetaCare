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

class Woo_Orders_Placed extends Woo_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_name() {
		return 'woo_orders_placed';
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
		return esc_html__( 'Orders Placed', 'powerpack' );
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
			'type'          => Controls_Manager::NUMBER,
			'min'           => 0,
			'label_block'   => true,
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
		if ( '' !== $value ) {
			$args = array(
				'customer_id' => get_current_user_id(),
				'status'      => array( 'wc-completed' ),
			);

			$items_count = count( wc_get_orders( $args ) );

			return PP_Helper::compare( $items_count, $value, $operator );
		}

		return false;
	}
}
