<?php
namespace PowerpackElements\Modules\Toggle;

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
		return 'pp-toggle';
	}

	public function get_widgets() {
		return [
			'Toggle',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-toggle',
			$this->get_css_assets_url( 'widget-toggle', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}
}
