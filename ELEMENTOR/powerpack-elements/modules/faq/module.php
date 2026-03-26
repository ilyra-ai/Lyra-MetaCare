<?php
namespace PowerpackElements\Modules\Faq;

use PowerpackElements\Base\Module_Base;
use PowerpackElements\Classes\PP_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {
	/**
	 * FAQ Data
	 *
	 * @var faq_schema_data
	 */
	private $faq_schema_data = [];

	private $faq_widgets = [];

	private $widget_ids = [];

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
		add_filter( 'elementor/frontend/builder_content_data', [ $this, 'grab_faq_data' ], 10, 2 );
		add_action( 'wp_footer', [ $this, 'print_faq_schema' ] );
	}

	public function get_name() {
		return 'pp-faq';
	}

	public function get_widgets() {
		return [
			'Faq',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-advanced-accordion',
			$this->get_css_assets_url( 'widget-advanced-accordion', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}

	public function grab_faq_data( $data ) {
		PP_Helper::elementor()->db->iterate_data( $data, function ( $element ) use ( &$widgets ) {
			$type = PP_Helper::get_widget_type( $element );

			if ( 'pp-faq' === $type ) {
				$this->faq_widgets[] = $element;
			}

			return $element;
		} );

		return $data;
	}

	public function print_faq_schema() {
		if ( ! empty( $this->faq_widgets ) ) {
			foreach ( $this->faq_widgets as $widget_data ) {
				if ( in_array( $widget_data['id'], $this->widget_ids ) ) {
					continue;
				} else {
					$this->widget_ids[] = $widget_data['id'];
				}

				$widget = PP_Helper::elementor()->elements_manager->create_element_instance( $widget_data );

				if ( isset( $widget_data['templateID'] ) ) {
					$type = PP_Helper::get_global_widget_type( $widget_data['templateID'], 1 );
					$element_class = $type->get_class_name();
					try {
						$widget = new $element_class( $widget_data, [] );
					} catch ( \Exception $e ) {
						return null;
					}
				}

				$settings = $widget->get_settings();
				$enable_schema = $settings['enable_schema'];
				$faq_items = $widget->get_faq_items();

				if ( ! empty( $faq_items ) && 'yes' === $enable_schema ) {
					foreach ( $faq_items as $faqs ) {
						$faq_data = array(
							'@type'          => 'Question',
							'name'           => wp_strip_all_tags( $faqs['question'] ),
							'acceptedAnswer' =>
							array(
								'@type' => 'Answer',
								'text'  => $widget->pp_parse_text_editor( $faqs['answer'] ),
							),
						);

						$this->faq_schema_data[] = $faq_data;
					}
				}
			}
		}

		$faqs_data = $this->faq_schema_data;

		if ( $faqs_data ) {
			$schema_data = array(
				'@context'   => 'https://schema.org',
				'@type'      => 'FAQPage',
				'mainEntity' => $faqs_data,
			);

			PP_Helper::print_json_schema( $schema_data );
		}

		$this->faq_schema_data = [];
	}
}
