<?php
namespace PowerpackElements\Modules\OffcanvasContent;

use PowerpackElements\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
	}

	public function get_name() {
		return 'pp-offcanvas-content';
	}

	public function get_widgets() {
		return [
			'Offcanvas_Content',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-offcanvas-content',
			$this->get_css_assets_url( 'widget-offcanvas-content', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}
}
