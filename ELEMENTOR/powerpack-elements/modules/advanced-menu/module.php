<?php
namespace PowerpackElements\Modules\AdvancedMenu;

use PowerpackElements\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Module extends Module_Base {

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
	}

	public function get_name() {
		return 'pp-advanced-menu';
	}

	public function get_widgets() {
		return [
			'Advanced_Menu',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-advanced-menu',
			$this->get_css_assets_url( 'widget-advanced-menu', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}
}
