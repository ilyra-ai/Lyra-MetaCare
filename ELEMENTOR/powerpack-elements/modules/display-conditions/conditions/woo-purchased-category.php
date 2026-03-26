<?php
namespace PowerpackElements\Modules\DisplayConditions\Conditions;

// Powerpack Elements Classes
use PowerpackElements\Base\Condition;

// Elementor Classes
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Woo_Purchased_Category extends Woo_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_name() {
		return 'woo_purchased_category';
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
		return esc_html__( 'Purchased Items Categories', 'powerpack' );
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
			'description'   => esc_html__( 'Leave blank or select all for any category.', 'powerpack' ),
			'type'          => 'pp-query',
			'post_type'     => '',
			'options'       => [],
			'label_block'   => true,
			'multiple'      => true,
			'query_type'    => 'terms',
			'object_type'   => 'product_cat',
			'include_type'  => true,
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

		$cart = WC()->cart;

		$product_cats = [];

		$args = array(
			'numberposts' => -1,
			'meta_key'    => '_customer_user',
			'meta_value'  => get_current_user_id(),
			'post_type'   => wc_get_order_types(),
			'post_status' => array_keys( wc_get_is_paid_statuses() ),
		);

		$customer_orders = get_posts( $args );

		$product_ids = array();

		foreach ( $customer_orders as $order ) {

			$order = wc_get_order( $order->ID );
			$items = $order->get_items();
			foreach ( $items as $item ) {
				$product_id    = $item->get_product_id();
				$product_ids[] = $product_id;
			}
		}

		foreach ( $product_ids as $id ) {
			$product = wc_get_product( $id );

			if ( $product->is_type( 'variation' ) ) {
				$product = wc_get_product( $product->get_parent_id() );
			}

			$product_cats = array_merge( $product_cats, $product->get_category_ids() );
		}

		$show = ! empty( array_intersect( (array) $value, $product_cats ) ) ? true : false;

		return $this->compare( $show, true, $operator );
	}
}
