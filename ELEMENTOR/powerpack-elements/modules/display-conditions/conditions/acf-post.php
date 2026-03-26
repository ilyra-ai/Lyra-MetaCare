<?php
namespace PowerpackElements\Modules\DisplayConditions\Conditions;

// Powerpack Elements Classes
use PowerpackElements\Base\Condition;
use PowerpackElements\Modules\DisplayConditions\Module;

// Elementor Classes
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Acf_Post extends Acf_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since  1.4.15
	 * @return string
	 */
	public function get_name() {
		return 'acf_post';
	}

	/**
	 * Get Title
	 *
	 * Get the title of the module
	 *
	 * @since  1.4.15
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'ACF Post', 'powerpack' );
	}

	/**
	 * Get Name Control
	 *
	 * Get the settings for the name control
	 *
	 * @since  1.4.15
	 * @return array
	 */
	public function get_name_control() {
		return wp_parse_args( [
			'description'   => esc_html__( 'Search ACF "Post Object" and "Relationship" fields by label.', 'powerpack' ),
			'placeholder'   => esc_html__( 'Search Fields', 'powerpack' ),
			'query_options' => [
				'field_type'    => [
					'post',
				],
				'show_field_type' => true,
			],
		], $this->name_control_defaults );
	}

	/**
	 * Get Value Control
	 *
	 * Get the settings for the value control
	 *
	 * @since  1.4.15
	 * @return array
	 */
	public function get_value_control() {
		return [
			'type'          => 'pp-query',
			'default'       => '',
			'placeholder'   => esc_html__( 'Search Posts', 'powerpack' ),
			'description'   => esc_html__( 'Select multiple posts to match for any of them.', 'powerpack' ),
			'label_block'   => true,
			'multiple'      => true,
			'query_type'    => 'posts',
			'object_type'   => 'any',
		];
	}

	/**
	 * Check condition
	 *
	 * @since 1.4.15
	 *
	 * @access public
	 *
	 * @param string    $name       The control name to check
	 * @param string    $operator   Comparison operator
	 * @param mixed     $value      The control value to check
	 */
	public function check( $key, $operator, $values ) {
		$show = false;

		global $post;

		$post_id     = $this->get_object_id( $key, $post->ID );
		$field_value = get_field( $key, $post_id );

		if ( is_archive() ) {
			if ( ! $field_value ) {
				$term = get_queried_object();

				if ( is_object( $term ) ) {
					if ( get_class( $term ) === 'WP_Term' ) {
						$field_value = get_field( $key, $term );
					}
				}
			}
		}

		if ( $field_value ) {
			$field_post_ids = $this->parse_field_values( $field_value );
			$value_post_ids = array_map( 'intval', $values );

			$show = ! empty( array_intersect( $field_post_ids, $value_post_ids ) );
		}

		return $this->compare( $show, true, $operator );
	}

	/**
	 * Parse field values
	 *
	 * Depending on the type of field and return formats
	 * this function returns an array with the post IDs set in
	 * the field settings
	 *
	 * @since 1.4.15
	 *
	 * @access public
	 *
	 * @param   string      $posts              The posts saved in the field
	 * @return  array       $return_values      The array of post IDs
	 */
	public function parse_field_values( $posts ) {
		$return_values = [];

		if ( is_array( $posts ) ) {
			foreach ( $posts as $post ) {
				$return_values[] = ( is_a( $post, 'WP_Post' ) ) ? $post->ID : $post;
			}
		} else {
			$return_values[] = ( is_a( $posts, 'WP_Post' ) ) ? $posts->ID : $posts;
		}

		return $return_values;
	}
}
