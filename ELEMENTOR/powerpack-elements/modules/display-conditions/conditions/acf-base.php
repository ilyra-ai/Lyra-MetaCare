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

class Acf_Base extends Condition {

	public $name_control_defaults = [
		'type'          => 'pp-query',
		'post_type'     => '',
		'options'       => [],
		'query_type'    => 'acf',
		'label_block'   => true,
		'multiple'      => false,
		'query_options' => [
			'show_type' => false,
			'show_field_type' => true,
		],
	];

	/**
	 * Checks if current condition is supported
	 *
	 * @since  1.4.15
	 * @return bool
	 */
	public static function is_supported() {
		return class_exists( '\acf' );
	}

	/**
	 * Get Group
	 *
	 * Get the group of the condition
	 *
	 * @since  1.4.15
	 * @return string
	 */
	public function get_group() {
		return 'acf';
	}

	/**
	 * Get ACF Fields
	 *
	 * Retrieve all the ACF fields
	 *
	 * @since  2.10.7
	 * @return array
	 */
	public function get_fields() {
		if ( ! function_exists( 'acf_get_field_groups' ) || ! function_exists( 'acf_get_fields' ) || ! function_exists( 'get_field' ) ) {
			return [];
		}

		$groups = acf_get_field_groups();

		if ( empty( $groups ) || ! is_array( $groups ) ) {
			return [];
		}

		$acf_fields = [];

		foreach ( $groups as $group ) {
			// Group fields
			$fields = acf_get_fields( $group );

			if ( ! is_array( $fields ) ) {
				continue;
			}

			$locations = $this->get_fields_locations( $group );

			if ( ! empty( $locations ) ) {
				foreach ( $fields as $field ) {
					$field['_pp_locations'] = $locations; // Save the field with a PowerPack attribute
					$acf_fields[]           = $field;
				}

			} else {
				$acf_fields = array_merge( $acf_fields, $fields );
			}
		}

		return $acf_fields;
	}

	/**
	 * Get ACF tags
	 *
	 * @since  2.10.7
	 * @return array
	 */
	public function get_acf_tags() {
		$acf_tags = [];
		$fields   = $this->get_fields();

		if ( is_array( $fields ) ) {
			foreach ( $fields as $field ) {
				$acf_tags[$field['key']] = $field;
			}
		}

		return $acf_tags;
	}

	/**
	 * Get ACF fields locations
	 *
	 * @since  2.10.7
	 * @param array $group
	 */
	public function get_fields_locations( $group ) {
		if ( ! isset( $group['location'] ) || ! is_array( $group['location'] ) ) {
			return [];
		}

		$locations = [];

		foreach ( $group['location'] as $conditions ) {
			foreach ( $conditions as $condition ) {
				if ( ! isset( $condition['param'] ) ) {
					continue;
				}

				if ( $condition['param'] === 'options_page' ) {
					$locations['option'] = 1;
				}

				if ( in_array( $condition['param'], [ 'user_role', 'current_user', 'current_user_role', 'user_form' ] ) ) {
					$locations['user'] = 1;
				}

				if ( $condition['param'] === 'taxonomy' ) {
					$locations['term'] = 1;
				}

				if ( $condition['param'] === 'post_type' ) {
					$locations['post'] = 1;
				}
			}
		}

		return array_keys( $locations );
	}

	/**
	 * Get the object ID for fetching the ACF field value
	 *
	 * @since  2.10.7
	 * @param string $key
	 * @param int   $post_id
	 */
	public function get_object_id( $key, $post_id ) {
		$acf_tags = $this->get_acf_tags();
		$field    = [];

		if ( is_array( $acf_tags ) && ! empty( $acf_tags ) ) {
			$field = $this->get_acf_tags()[$key];
		}

		$locations = isset( $field['_pp_locations'] ) ? $field['_pp_locations'] : [];

		// This field belongs to a Options page
		if ( in_array( 'option', $locations ) ) {
			return 'option';
		}

		if ( in_array( 'term', $locations ) ) {
			$term = get_queried_object();

			if ( is_object( $term ) ) {
				if ( get_class( $term ) === 'WP_Term' ) {
					$taxonomy = $term->taxonomy;
					$term_id  = $term->term_id;

					return $taxonomy . '_' . $term_id;
				}
			}
		}

		if ( in_array( 'user', $locations ) ) {
			if ( count( $locations ) == 1 ) {
				return 'user_' . get_current_user_id();
			}
		}

		// Default
		return $post_id;
	}

	/**
	 * Get Field Post
	 *
	 * Retrieve the ACF field post object by id
	 *
	 * @since  1.4.15
	 * @return string
	 */
	public function get_field_post( $post_id ) {
		global $post;

		$field_post = get_posts( [
			'post__in'      => [ $post_id ],
			'post_type'     => 'acf-field',
			'post_status'   => 'publish',
			'numberposts'   => 1,
		] );

		if ( $field_post[0] ) {
			return $field_post;
		}

		return false;
	}

	/**
	 * Get Name Control Defaults
	 *
	 * Get the settings for the name control
	 *
	 * @since  1.4.15
	 * @return array
	 */
	public function get_name_control_defaults() {
		return;
	}
}
