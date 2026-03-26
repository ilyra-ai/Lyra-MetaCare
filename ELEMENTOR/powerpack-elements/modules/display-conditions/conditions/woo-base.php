<?php
namespace PowerpackElements\Modules\DisplayConditions\Conditions;

// Powerpack Elements Classes
use PowerpackElements\Base\Condition;

// Elementor Classes
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Woo_Base extends Condition {

	public $name_control_defaults = [
		'type'          => 'pp-query',
		'post_type'     => '',
		'options'       => [],
		'query_type'    => 'woo',
		'label_block'   => true,
		'multiple'      => false,
		'query_options' => [
			'show_type'       => false,
			'show_field_type' => true,
		],
	];

	/**
	 * Checks if current condition is supported
	 *
	 * @since 2.10.0
	 * @return bool
	 */
	public static function is_supported() {
		return class_exists( '\WooCommerce' );
	}

	/**
	 * Get Group
	 *
	 * Get the group of the condition
	 *
	 * @since 2.10.0
	 * @return string
	 */
	public function get_group() {
		return 'woo';
	}

	/**
	 * Get Name Control Defaults
	 *
	 * Get the settings for the name control
	 *
	 * @since 2.10.0
	 * @return array
	 */
	public function get_name_control_defaults() {
		return;
	}
}
