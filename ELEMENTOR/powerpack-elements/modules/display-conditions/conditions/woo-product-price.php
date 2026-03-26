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

class Woo_Product_Price extends Woo_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_name() {
		return 'woo_product_price';
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
		return esc_html__( 'Product Price', 'powerpack' );
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
		$type = get_post_type();

		if ( 'product' === $type ) {
			$product_id    = get_queried_object_id();
			$product       = wc_get_product( $product_id );
			$product_price = $product->get_price();

			return PP_Helper::compare( $product_price, $value, $operator );
		}

		return false;
	}
}
