<?php
namespace PowerpackElements\Modules\Gallery;

use PowerpackElements\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends Module_Base {

	public function __construct() {
		parent::__construct();

		// Gallery module - load more componenet.
		add_action( 'wp', array( $this, 'gallery_get_images' ) );

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
	}

	/**
	 * Module is active or not.
	 *
	 * @since 1.3.3
	 *
	 * @access public
	 *
	 * @return bool true|false.
	 */
	public static function is_active() {
		return true;
	}

	/**
	 * Get Module Name.
	 *
	 * @since 1.3.3
	 *
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'pp-gallery';
	}

	/**
	 * Get Widgets.
	 *
	 * @since 1.3.3
	 *
	 * @access public
	 *
	 * @return array Widgets.
	 */
	public function get_widgets() {
		return array(
			'Image_Gallery',
			'Image_Slider',
		);
	}

	/**
	 * Get Image Caption.
	 *
	 * @since 1.3.3
	 *
	 * @access public
	 *
	 * @return string image caption.
	 */
	public static function get_image_caption( $id, $caption_type = 'caption' ) {

		$attachment = get_post( $id );

		$attachment_caption = '';

		if ( 'title' === $caption_type ) {
			$attachment_caption = $attachment->post_title;
		} elseif ( 'caption' === $caption_type ) {
			$attachment_caption = wp_get_attachment_caption( $id );
		} elseif ( 'alt' === $caption_type ) {
			$attachment_caption = get_post_meta( $id, '_wp_attachment_image_alt', true );
		} elseif ( 'description' === $caption_type ) {
			$attachment_caption = $attachment->post_content;
		}

		return $attachment_caption;

	}

	/**
	 * Get Image Filters.
	 *
	 * @since 1.3.3
	 *
	 * @access public
	 *
	 * @return array image filters.
	 */
	public static function get_image_filters() {

		$pp_image_filters = array(
			'normal'           => esc_html__( 'Normal', 'powerpack' ),
			'filter-1977'      => esc_html__( '1977', 'powerpack' ),
			'filter-aden'      => esc_html__( 'Aden', 'powerpack' ),
			'filter-amaro'     => esc_html__( 'Amaro', 'powerpack' ),
			'filter-ashby'     => esc_html__( 'Ashby', 'powerpack' ),
			'filter-brannan'   => esc_html__( 'Brannan', 'powerpack' ),
			'filter-brooklyn'  => esc_html__( 'Brooklyn', 'powerpack' ),
			'filter-charmes'   => esc_html__( 'Charmes', 'powerpack' ),
			'filter-clarendon' => esc_html__( 'Clarendon', 'powerpack' ),
			'filter-crema'     => esc_html__( 'Crema', 'powerpack' ),
			'filter-dogpatch'  => esc_html__( 'Dogpatch', 'powerpack' ),
			'filter-earlybird' => esc_html__( 'Earlybird', 'powerpack' ),
			'filter-gingham'   => esc_html__( 'Gingham', 'powerpack' ),
			'filter-ginza'     => esc_html__( 'Ginza', 'powerpack' ),
			'filter-hefe'      => esc_html__( 'Hefe', 'powerpack' ),
			'filter-helena'    => esc_html__( 'Helena', 'powerpack' ),
			'filter-hudson'    => esc_html__( 'Hudson', 'powerpack' ),
			'filter-inkwell'   => esc_html__( 'Inkwell', 'powerpack' ),
			'filter-juno'      => esc_html__( 'Juno', 'powerpack' ),
			'filter-kelvin'    => esc_html__( 'Kelvin', 'powerpack' ),
			'filter-lark'      => esc_html__( 'Lark', 'powerpack' ),
			'filter-lofi'      => esc_html__( 'Lofi', 'powerpack' ),
			'filter-ludwig'    => esc_html__( 'Ludwig', 'powerpack' ),
			'filter-maven'     => esc_html__( 'Maven', 'powerpack' ),
			'filter-mayfair'   => esc_html__( 'Mayfair', 'powerpack' ),
			'filter-moon'      => esc_html__( 'Moon', 'powerpack' ),
		);

		return $pp_image_filters;
	}

	/**
	 * Get gallery images
	 *
	 * @access public
	 */
	public function gallery_get_images() {
		if ( ! isset( $_POST['pp_action'] ) || 'pp_gallery_get_images' !== $_POST['pp_action'] ) {
			return;
		}

		if ( ! isset( $_POST['settings'] ) || empty( $_POST['settings'] ) ) {
			return;
		}

		// Tell WordPress this is an AJAX request.
		if ( ! defined( 'DOING_AJAX' ) ) {
			define( 'DOING_AJAX', true );
		}

		$settings    = $_POST['settings'];
		$gallery_id  = $settings['widget_id'];
		$post_id     = $settings['post_id'];
		$template_id = $settings['template_id'];
		if ( $template_id !== $post_id ) {
			$post_id = $template_id;
		}

		$elementor = \Elementor\Plugin::$instance;
		$meta      = $elementor->documents->get( $post_id )->get_elements_data();
		$gallery   = $this->find_element_recursive( $meta, $gallery_id );

		if ( isset( $gallery['templateID'] ) ) {
			$template_data = \Elementor\Plugin::$instance->templates_manager->get_template_data( [
				'source'        => 'local',
				'template_id'   => $gallery['templateID'],
			] );

			if ( is_array( $template_data ) && isset( $template_data['content'] ) ) {
				$gallery = $template_data['content'][0];
			}
		}

		if ( ! $gallery ) {
			wp_send_json_error();
		}

		// Restore default values.
		$widget = $elementor->elements_manager->create_element_instance( $gallery );
		$photos = $widget->ajax_get_images();

		wp_send_json_success( array( 'items' => $photos ) );
	}

	/**
	 * Get Widget Setting data.
	 *
	 * @since 1.3.3
	 * @access public
	 * @param array  $elements Element array.
	 * @param string $widget_id Element ID.
	 * @return Boolean True/False.
	 */
	public function find_element_recursive( $elements, $widget_id ) {
		foreach ( $elements as $element ) {
			if ( $widget_id === $element['id'] ) {
				return $element;
			}

			if ( ! empty( $element['elements'] ) ) {
				$element = $this->find_element_recursive( $element['elements'], $widget_id );

				if ( $element ) {
					return $element;
				}
			}
		}

		return false;
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-image-gallery',
			$this->get_css_assets_url( 'widget-image-gallery', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);

		wp_register_style(
			'widget-pp-image-slider',
			$this->get_css_assets_url( 'widget-image-slider', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}
}
