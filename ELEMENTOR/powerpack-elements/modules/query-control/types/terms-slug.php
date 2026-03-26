<?php
namespace PowerpackElements\Modules\QueryControl\Types;

use PowerpackElements\Modules\QueryControl\Types\Type_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * \Modules\QueryControl\Types\Terms_Slug
 *
 * @since  2.10.3
 */
class Terms_Slug extends Type_Base {

	/**
	 * Get Name
	 *
	 * Get the name of the module
	 *
	 * @since  2.10.3
	 * @return string
	 */
	public function get_name() {
		return 'terms-slug';
	}

	/**
	 * Gets autocomplete values
	 *
	 * @since  2.10.3
	 * @return array
	 */
	public function get_autocomplete_values( array $data ) {
		$results = [];

		$taxonomies = get_object_taxonomies( '' );

		$query_params = [
			'taxonomy'      => ( isset( $data['object_type'] ) && $data['object_type'] ) ? $data['object_type'] : $taxonomies,
			'search'        => $data['q'],
			'hide_empty'    => false,
		];

		$terms = get_terms( $query_params );

		foreach ( $terms as $term ) {
			$taxonomy = get_taxonomy( $term->taxonomy );

			$results[] = [
				'id'    => $term->slug,
				'text'  => $taxonomy->labels->singular_name . ': ' . $term->name,
			];
		}

		return $results;
	}

	/**
	 * Gets control values titles
	 *
	 * @since  2.10.3
	 * @return array
	 */
	public function get_value_titles( array $request ) {
		$ids = (array) $request['id'];
		$results = [];

		$query_params = [
			'include'       => $ids,
		];

		$terms = get_terms( $query_params );

		foreach ( $terms as $term ) {
			$results[ $term->slug ] = $term->name;
		}

		return $results;
	}
}
