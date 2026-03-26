<?php
namespace PowerpackElements\Modules\AuthorList;

use PowerpackElements\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Module extends Module_Base {

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
	}

	public function get_name() {
		return 'pp-author-list';
	}

	public function get_widgets() {
		return [
			'Author_List',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-author-list',
			$this->get_css_assets_url( 'widget-author-list', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}
}
