<?php
namespace PowerpackElements\Modules\Posts\Widgets;

use PowerpackElements\Classes\PP_Helper;
use PowerpackElements\Modules\Posts\Skins;

// Elementor Classes
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Posts Grid Widget
 */
class Posts extends Posts_Base {

	/**
	 * Retrieve posts grid widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Posts' );
	}

	/**
	 * Retrieve posts grid widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Posts' );
	}

	/**
	 * Retrieve posts grid widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Posts' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return parent::get_widget_keywords( 'Posts' );
	}

	public function get_script_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return [
				'isotope',
				'imagesloaded',
				'swiper',
				'powerpack-pp-posts',
			];
		}

		$settings = $this->get_settings_for_display();
		$scripts  = [];

		if ( $this->check_settings_for_scripts( $settings, 'layout', 'carousel' ) ) {
			$scripts = array_merge( $scripts, [ 'swiper', 'powerpack-pp-posts' ] );
		}

		if ( $this->check_settings_for_scripts( $settings, 'layout', 'masonry' ) || $this->check_settings_for_scripts( $settings, 'show_filters', 'yes' ) ) {
			$scripts = array_merge( $scripts, [ 'isotope', 'imagesloaded', 'powerpack-pp-posts' ] );
		}

		if ( $this->check_settings_for_scripts( $settings, 'show_ajax_search_form', 'yes' ) || $this->check_settings_for_scripts( $settings, 'pagination_type', 'none', '!=' ) ) {
			$scripts = array_merge( $scripts, [ 'powerpack-pp-posts' ] );
		}

		return array_unique( $scripts );
	}

	/**
	 * Retrieve the list of styles the offcanvas content widget depended on.
	 *
	 * Used to set styles dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget styles dependencies.
	 */
	public function get_style_depends() {
		if ( PP_Helper::is_edit_mode() || PP_Helper::is_preview_mode() ) {
			return [ 'e-swiper', 'pp-swiper', 'pp-elementor-grid', 'widget-pp-posts' ];
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'widget-pp-posts' ];

		if ( $this->check_settings_for_scripts( $settings, 'layout', 'carousel' ) ) {
			array_push( $styles, 'e-swiper', 'pp-swiper' );
		} else {
			array_push( $styles, 'pp-elementor-grid' );
		}

		return $styles;
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Skins.
	 *
	 * @since 2.2.7
	 * @access protected
	 */
	protected function register_skins() {
		$this->add_skin( new Skins\Skin_Classic( $this ) );
		$this->add_skin( new Skins\Skin_Card( $this ) );
		$this->add_skin( new Skins\Skin_Checkerboard( $this ) );
		$this->add_skin( new Skins\Skin_Creative( $this ) );
		$this->add_skin( new Skins\Skin_Event( $this ) );
		$this->add_skin( new Skins\Skin_News( $this ) );
		$this->add_skin( new Skins\Skin_Overlap( $this ) );
		$this->add_skin( new Skins\Skin_Portfolio( $this ) );
		$this->add_skin( new Skins\Skin_Template( $this ) );
	}

	/**
	 * Register posts widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 2.0.3
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_skin_field',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
			)
		);

		$this->add_control(
			'templates',
			array(
				'label'       => esc_html__( 'Choose Template', 'powerpack' ),
				'type'        => 'pp-query',
				'label_block' => false,
				'multiple'    => false,
				'query_type'  => 'templates-all',
				'condition'   => array(
					'_skin' => 'template',
				),
			)
		);

		$this->add_control(
			'posts_per_page',
			array(
				'label'     => esc_html__( 'Posts Per Page', 'powerpack' ),
				'type'      => Controls_Manager::NUMBER,
				'default'   => 6,
				'condition' => array(
					'query_type' => 'custom',
				),
			)
		);

		$this->end_controls_section();

		$this->register_query_section_controls( array(), 'posts', '', 'yes' );
	}

	/**
	 * Check if a specific value exists in settings for a given prefix, with optional comparison operator.
	 *
	 * @since 2.11.8
	 *
	 * @param array  $settings The widget settings.
	 * @param string $setting The setting to match (e.g., 'layout', 'show_filters').
	 * @param string $value The value to check (e.g., 'carousel', 'masonry', 'yes').
	 * @param string $operator Comparison operator (e.g., '==', '!=').
	 * @return bool True if any matching key satisfies the condition.
	 */
	protected function check_settings_for_scripts( $settings, $setting, $value, $operator = '==' ) {
		$prefixes = [
			'classic',
			'card',
			'checkerboard',
			'creative',
			'event',
			'news',
			'overlap',
			'portfolio',
			'template',
		];

		foreach ( $prefixes as $prefix ) {
			$key = "{$prefix}_{$setting}";

			if ( isset( $settings[ $key ] ) ) {
				if ( $operator === '==' && $settings[ $key ] === $value ) {
					return true;
				}

				if ( $operator === '!=' && $settings[ $key ] !== $value ) {
					return true;
				}
			}
		}

		return false;
	}
}
