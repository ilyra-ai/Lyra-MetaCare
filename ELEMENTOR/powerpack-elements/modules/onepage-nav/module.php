<?php
namespace PowerpackElements\Modules\OnepageNav;

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
		return 'pp-one-page-nav';
	}

	public function get_widgets() {
		return [
			'Onepage_Nav',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-one-page-nav',
			$this->get_css_assets_url( 'widget-one-page-nav', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}
}
