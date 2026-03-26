<?php
namespace PowerpackElements\Modules\DisplayConditions\Conditions;

// Powerpack Elements Classes
use PowerpackElements\Base\Condition;

// Elementor Classes
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Woo_Product_Type extends Woo_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_name() {
		return 'woo_product_type';
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
		return esc_html__( 'Product Type', 'powerpack' );
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
			'type'        => Controls_Manager::SELECT,
			'default'     => 'simple',
			'label_block' => true,
			'options'     => array(
				'simple'   => esc_html__( 'Simple', 'powerpack' ),
				'grouped'  => esc_html__( 'Grouped', 'powerpack' ),
				'variable' => esc_html__( 'Variable', 'powerpack' ),
				'external' => esc_html__( 'External / Affiliate', 'powerpack' ),
			),
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

		if ( 'product' !== get_post_type( get_the_ID() ) ) {
			return false;
		}

		$product_id = get_queried_object_id();

		$type = get_post_type();
		
		if ( 'product' === $type ) {
			$product = wc_get_product( $product_id );

			$product_type = $product->get_type();

			$show = ( $value == $product_type ) ? true : false;
		}

		return $this->compare( $show, true, $operator );
	}
}
