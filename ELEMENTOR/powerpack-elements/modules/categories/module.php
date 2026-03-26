<?php
namespace PowerpackElements\Modules\Categories;

use PowerpackElements\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );

		// Pagination ajax
		add_action( 'wp_ajax_pp_get_categories', [ $this, 'pp_get_categories' ] );
		add_action( 'wp_ajax_nopriv_pp_get_categories', [ $this, 'pp_get_categories' ] );
	}

	public function get_name() {
		return 'pp-categories';
	}

	public function get_widgets() {
		return [
			'Categories',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-categories',
			$this->get_css_assets_url( 'widget-categories', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}

	/**
	 * Get Widget Setting data.
	 *
	 * @since 1.7.0
	 * @access public
	 * @param array  $elements Element array.
	 * @param string $form_id Element ID.
	 * @return Boolean True/False.
	 */
	public function find_element_recursive( $elements, $form_id ) {

		foreach ( $elements as $element ) {
			if ( $form_id === $element['id'] ) {
				return $element;
			}

			if ( ! empty( $element['elements'] ) ) {
				$element = $this->find_element_recursive( $element['elements'], $form_id );

				if ( $element ) {
					return $element;
				}
			}
		}

		return false;
	}

	/**
	 * Get Categories Data via AJAX call.
	 *
	 * @since 2.11.1
	 * @access public
	 */
	public function pp_get_categories() {
		check_ajax_referer( 'pp-categories-widget-nonce', 'nonce' );

		$post_id   = $_POST['page_id'];
		$widget_id = $_POST['widget_id'];

		$elementor = \Elementor\Plugin::$instance;
		$meta      = $elementor->documents->get( $post_id )->get_elements_data();

		$widget_data = $this->find_element_recursive( $meta, $widget_id );

		if ( isset( $widget_data['templateID'] ) ) {
			$template_data = \Elementor\Plugin::$instance->templates_manager->get_template_data( [
				'source'        => 'local',
				'template_id'   => $widget_data['templateID'],
			] );

			if ( is_array( $template_data ) && isset( $template_data['content'] ) ) {
				$widget_data = $template_data['content'][0];
			}
		}

		$data = array(
			'message'    => __( 'Saved', 'powerpack' ),
			'ID'         => '',
			'html'       => '',
			'not_found'  => '',
			'pagination' => '',
		);

		if ( null !== $widget_data ) {
			// Restore default values.
			$widget     = $elementor->elements_manager->create_element_instance( $widget_data );
			$skin_body  = $widget->render_ajax_category_body();
			$not_found  = '';
			$pagination = $widget->render_ajax_pagination();

			$data['ID']         = $widget->get_id();
			$data['html']       = $skin_body;
			$data['not_found']  = $not_found;
			$data['pagination'] = $pagination;
		}
		wp_send_json_success( $data );
	}
}
