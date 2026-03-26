<?php
namespace PowerpackElements\Modules\Video;

use PowerpackElements\Base\Module_Base;
use PowerpackElements\Classes\PP_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {
	/**
	 * Video Gallery Data
	 *
	 * @var video_schema_data
	 */
	private $video_schema_data = [];

	private $video_gallery_widgets = [];

	private $widget_ids = [];

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
		add_filter( 'elementor/frontend/builder_content_data', [ $this, 'grab_video_gallery_data' ], 10, 2 );
		add_action( 'wp_footer', [ $this, 'print_video_gallery_schema' ] );
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
		return 'pp-video';
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
		return [
			'Video',
			'Video_Gallery',
		];
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-pp-video',
			$this->get_css_assets_url( 'widget-video', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);

		wp_register_style(
			'widget-pp-video-gallery',
			$this->get_css_assets_url( 'widget-video-gallery', null, true, true ),
			[],
			POWERPACK_ELEMENTS_VER
		);
	}

	public function grab_video_gallery_data( $data ) {
		PP_Helper::elementor()->db->iterate_data( $data, function ( $element ) use ( &$widgets ) {
			$type = PP_Helper::get_widget_type( $element );

			if ( 'pp-video-gallery' === $type ) {
				$this->video_gallery_widgets[] = $element;
			}

			return $element;
		} );

		return $data;
	}

	public function print_video_gallery_schema() {
		if ( ! empty( $this->video_gallery_widgets ) ) {
			$video_count = 1;

			foreach ( $this->video_gallery_widgets as $widget_data ) {
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

				if ( isset( $_SERVER['HTTP_HOST'] ) && isset( $_SERVER['REQUEST_URI'] ) ) {
					$item_url = ( 'on' === isset( $_SERVER['HTTPS'] ) && sanitize_text_field( $_SERVER['HTTPS'] ) ) ? 'https' : 'http://' . sanitize_text_field( $_SERVER['HTTP_HOST'] ) . esc_url_raw( $_SERVER['REQUEST_URI'] );
				}

				$settings = $widget->get_settings();
				$enable_schema = $settings['enable_schema'];

				if ( ! empty( $settings['gallery_videos'] ) && 'yes' === $enable_schema ) {
					$video_url = [];
					$schema_thumb = '';

					foreach ( $settings['gallery_videos'] as $video ) {
						$has_schema_data = true;

						$video_source = $video['video_source'];

						switch ( $video_source ) {
							case 'youtube':
								$video_url = $video['youtube_url'];
								break;

							case 'vimeo':
								$video_url = $video['vimeo_url'];
								break;

							case 'dailymotion':
								$video_url = $video['dailymotion_url'];
								break;

							case 'hosted':
								if ( ! empty( $video['hosted_url'] ) ) {
									$video_url = $video['hosted_url']['url'];
								}
								break;
						}

						$is_custom_thumb = ( 'yes' === $video['custom_thumbnail'] ) ? true : false;

						if ( $is_custom_thumb ) {
							$custom_image = $video['custom_image'];

							if ( ! empty( $custom_image ) && is_array( $custom_image ) ) {
								$schema_thumb = $custom_image['url'];
							}
						} else {
							$schema_image = $video['video_schema_image'];

							if ( ! empty( $schema_image ) && is_array( $schema_image ) ) {
								$schema_thumb = $schema_image['url'];
							}
						}

						$video_schema_title = $video['video_schema_title'];
						$video_schema_description = $video['video_schema_description'];
						$upload_date = new \DateTime( $video['video_schema_upload_date'] );

						if ( '' === $video_schema_title || '' === $video_schema_description || empty( $upload_date ) ) {
							$has_schema_data = false;
						}

						if ( $has_schema_data ) {
							$video_gallery_data    = array(
								'@type'        => 'VideoObject',
								'url'          => $item_url . '#pp-video-gallery-item-' . ( $video_count ),
								'position'     => $video_count,
								'name'         => $video_schema_title,
								'description'  => $video_schema_description,
								'thumbnailUrl' => $schema_thumb,
								'uploadDate'   => $upload_date->format( 'Y-m-d\TH:i:s\Z' ),
								'contentUrl'   => $video_url,
								'embedUrl'     => $video_url,
							);

							$this->video_schema_data[] = $video_gallery_data;
						}

						$video_count++;
					}
				}
			}
		}

		$videos_data = $this->video_schema_data;

		if ( $videos_data ) {
			$schema_data = array(
				'@context'        => 'https://schema.org',
				'@type'           => 'ItemList',
				'itemListElement' => $videos_data,
			);

			PP_Helper::print_json_schema( $schema_data );
		}

		$this->video_schema_data = [];
	}
}
