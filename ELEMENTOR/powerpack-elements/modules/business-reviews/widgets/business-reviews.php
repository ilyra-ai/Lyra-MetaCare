<?php
namespace PowerpackElements\Modules\BusinessReviews\Widgets;

use PowerpackElements\Base\Powerpack_Widget;
use PowerpackElements\Classes\PP_Helper;

use PowerpackElements\Modules\BusinessReviews\Skins;

// Elementor Classes
use Elementor\Controls_Manager;
use Elementor\Icons_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Business Reviews Widget
 */
class Business_Reviews extends Powerpack_Widget {

	/**
	 * Has Template content
	 *
	 * @var _has_template_content
	 */
	protected $_has_template_content = false; // phpcs:ignore PSR2.Classes.PropertyDeclaration.Underscore

	/**
	 * Retrieve business reviews widget name.
	 *
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return parent::get_widget_name( 'Business_Reviews' );
	}

	/**
	 * Retrieve business reviews widget title.
	 *
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return parent::get_widget_title( 'Business_Reviews' );
	}

	/**
	 * Retrieve business reviews widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return parent::get_widget_icon( 'Business_Reviews' );
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
		return parent::get_widget_keywords( 'Business_Reviews' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Retrieve the list of styles the business reviews widget depended on.
	 *
	 * Used to set style dependencies required to run the widget.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_style_depends() {
		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() || \Elementor\Plugin::$instance->preview->is_preview_mode() ) {
			return array(
				'e-swiper',
				'pp-swiper',
				'widget-pp-business-reviews'
			);
		}

		$settings = $this->get_settings_for_display();
		$styles = [ 'widget-pp-business-reviews' ];

		if ( 'carousel' === $settings['layout'] ) {
			array_push( $styles, 'e-swiper', 'pp-swiper' );
		}

		if ( Icons_Manager::is_migration_allowed() ) {
			array_push( $styles, 'elementor-icons-fa-solid' );
		}

		return $styles;
	}

	/**
	 * Retrieve the list of scripts the widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @since 1.13.0
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return array(
			'swiper',
			'pp-carousel',
		);
	}

	public function has_widget_inner_wrapper(): bool {
		return ! PP_Helper::is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register Skins.
	 *
	 * @access protected
	 */
	protected function register_skins() {
		$this->add_skin( new Skins\Skin_Classic( $this ) );
		$this->add_skin( new Skins\Skin_Card( $this ) );
	}

	/**
	 * Register widget controls
	 *
	 * @since 2.8.0
	 * @access public
	 */
	public function register_controls() {

		$this->register_content_business_reviews_controls();
		$this->register_content_layout_controls();
		$this->register_content_carousel_controls();
		$this->register_content_filters_controls();
	}

	/**
	 * Register Business Reviews Controls.
	 *
	 * @since 2.8.0
	 * @access protected
	 */
	protected function register_content_business_reviews_controls() {
		$this->start_controls_section(
			'section_business_reviews',
			array(
				'label' => esc_html__( 'Business Reviews', 'powerpack' ),
			)
		);

		$admin_link = '';
		if ( ! $this->get_google_places_api() ) {
			$this->add_control(
				'google_erorr_msg',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						/* translators: 1: Link opening tag, 2: Link closing tag. */
						esc_html__( 'To display Google Places reviews, you must have a Google Maps API key. %1$sClick here%2$s to setup your Google Maps API key.', 'powerpack' ),
						sprintf( '<a href="%s" target="_blank">', $admin_link ),
						'</a>'
					),
					'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
					'condition'       => array(
						'reviews_source!' => 'yelp',
					),
				)
			);
		}

		if ( ! $this->get_yelp_api() ) {
			$this->add_control(
				'yelp_erorr_msg',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						/* translators: 1: Link opening tag, 2: Link closing tag. */
						esc_html__( 'To display Yelp reviews, you must have a Yelp API key. %1$sClick here%2$s to setup your Yelp API key.', 'powerpack' ),
						sprintf( '<a href="%s" target="_blank">', $admin_link ),
						'</a>'
					),
					'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
					'condition'       => array(
						'reviews_source!' => 'google',
					),
				)
			);
		}

		$this->add_control(
			'reviews_source',
			array(
				'label'        => esc_html__( 'Reviews Source', 'powerpack' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'google',
				'options'      => array(
					'google' => esc_html__( 'Google Places', 'powerpack' ),
					'yelp'   => esc_html__( 'Yelp', 'powerpack' ),
					'all'    => esc_html__( 'Google + Yelp', 'powerpack' ),
				),
				'render_type'  => 'template',
				'prefix_class' => 'pp-social-reviews-',
			)
		);

			$this->add_control(
				'google_place_id',
				array(
					'label'       => esc_html__( 'Google Place ID', 'powerpack' ),
					'description' => sprintf( esc_html__( 'Click %1$s here %2$s to get your Google Place ID.', 'powerpack' ), '<a href="https://developers.google.com/places/place-id/" target="_blank" rel="noopener">', '</a>' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => true,
					'dynamic'     => array(
						'active' => true,
					),
					'default'     => esc_html__( 'ChIJw____96GhYARCVVwg5cT7c0', 'powerpack' ),
					'ai'          => [
						'active' => false,
					],
					'condition'   => array(
						'reviews_source!' => 'yelp',
					),
				)
			);

			$this->add_control(
				'language_id',
				array(
					'label'       => esc_html__( 'Language Code', 'powerpack' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => true,
					'dynamic'     => array(
						'active' => true,
					),
					'ai'          => [
						'active' => false,
					],
					'condition'   => array(
						'reviews_source!' => 'yelp',
					),
				)
			);

			$this->add_control(
				'language_code_doc',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					/* translators: %s admin link */
					'raw'             => sprintf( esc_html__( 'Click %1$s here %2$s to check your Language code.', 'powerpack' ), '<a href="https://developers.google.com/admin-sdk/directory/v1/languages" target="_blank" rel="noopener">', '</a>' ),
					'content_classes' => 'pp-editor-info',
					'condition'       => array(
						'reviews_source!' => 'yelp',
					),
				)
			);

			$this->add_control(
				'all_separator',
				array(
					'type'      => Controls_Manager::DIVIDER,
					'condition' => array(
						'reviews_source' => 'all',
					),
				)
			);

			$this->add_control(
				'yelp_business_id',
				array(
					'label'       => esc_html__( 'Yelp Business ID', 'powerpack' ),
					'description' => sprintf( esc_html__( 'Click %1$s here %2$s to get your Yelp Business ID.', 'powerpack' ), '<a href="#" target="_blank" rel="noopener">', '</a>' ),
					'type'        => Controls_Manager::TEXT,
					'label_block' => true,
					'dynamic'     => array(
						'active' => true,
					),
					'default'     => 'golden-gate-bridge-san-francisco',
					'ai'          => [
						'active' => false,
					],
					'condition'   => array(
						'reviews_source!' => 'google',
					),
				)
			);

			$this->add_control(
				'reviews_refresh_time',
				array(
					'label'   => esc_html__( 'Refresh Reviews after', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'day',
					'options' => array(
						'hour'  => esc_html__( 'Hour', 'powerpack' ),
						'day'   => esc_html__( 'Day', 'powerpack' ),
						'week'  => esc_html__( 'Week', 'powerpack' ),
						'month' => esc_html__( 'Month', 'powerpack' ),
						'year'  => esc_html__( 'Year', 'powerpack' ),
					),
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Register Business Reviews Layout Controls.
	 *
	 * @since 2.8.0
	 * @access protected
	 */
	protected function register_content_layout_controls() {
		$this->start_controls_section(
			'section_content_layout',
			array(
				'label' => esc_html__( 'Layout', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

			$this->add_control(
				'layout',
				array(
					'label'   => esc_html__( 'Layout', 'powerpack' ),
					'type'    => Controls_Manager::SELECT,
					'default' => 'normal',
					'options' => array(
						'normal'   => esc_html__( 'Grid', 'powerpack' ),
						'carousel' => esc_html__( 'Carousel', 'powerpack' ),
					),
				)
			);

			$this->add_control(
				'google_reviews_count',
				array(
					'label'     => esc_html__( 'Number of Reviews', 'powerpack' ),
					'type'      => Controls_Manager::NUMBER,
					'default'   => 3,
					'min'       => 1,
					'max'       => 5,
					'condition' => array(
						'reviews_source' => 'google',
					),
				)
			);

			$this->add_control(
				'google_max_reviews',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						/* translators: 1: Link opening tag, 2: Link closing tag. */
						esc_html__( 'Google allows maximum 5 reviews. Click %1$here%2$s to know more.', 'powerpack' ),
						sprintf( '<a href="%s" target="_blank">', '#' ),
						'</a>'
					),
					'content_classes' => 'pp-editor-info',
					'condition'       => array(
						'reviews_source' => 'google',
					),
				)
			);

			$this->add_control(
				'yelp_reviews_count',
				array(
					'label'     => esc_html__( 'Number of Reviews', 'powerpack' ),
					'type'      => Controls_Manager::NUMBER,
					'default'   => 3,
					'min'       => 1,
					'max'       => 3,
					'condition' => array(
						'reviews_source' => 'yelp',
					),
				)
			);

			$this->add_control(
				'yelp_max_reviews',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						/* translators: 1: Link opening tag, 2: Link closing tag. */
						esc_html__( 'Yelp allows maximum 5 reviews. Click %1$here%2$s to know more.', 'powerpack' ),
						sprintf( '<a href="%s" target="_blank">', '#' ),
						'</a>'
					),
					'content_classes' => 'pp-editor-info',
					'condition'       => array(
						'reviews_source' => 'yelp',
					),
				)
			);
		
			$this->add_control(
				'reviews_count',
				array(
					'label'     => esc_html__( 'Number of Reviews', 'powerpack' ),
					'type'      => Controls_Manager::NUMBER,
					'default'   => 3,
					'min'       => 1,
					'max'       => 8,
					'condition' => array(
						'reviews_source' => 'all',
					),
				)
			);

			$this->add_control(
				'all_review_length_doc',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => sprintf(
						/* translators: 1: Link opening tag, 2: Link closing tag. */
						esc_html__( 'We can fetch only up to 5 Google and 3 Yelp Reviews. So, a maximum of 8 reviews can be displayed. Click %1$here%2$s to know more.', 'powerpack' ),
						sprintf( '<a href="%s" target="_blank">', '#' ),
						'</a>'
					),
					'content_classes' => 'pp-editor-info',
					'condition'       => array(
						'reviews_source' => 'all',
					),
				)
			);

			$this->add_responsive_control(
				'columns',
				array(
					'label'          => esc_html__( 'Columns', 'powerpack' ),
					'type'           => Controls_Manager::SELECT,
					'default'        => '3',
					'tablet_default' => '2',
					'mobile_default' => '1',
					'options'        => array(
						'1' => '1',
						'2' => '2',
						'3' => '3',
						'4' => '4',
						'5' => '5',
					),
					'prefix_class'   => 'elementor-grid%s-',
					'render_type'    => 'template',
				)
			);

			$this->add_control(
				'equal_height',
				array(
					'label'              => esc_html__( 'Equal Height', 'powerpack' ),
					'type'               => Controls_Manager::SWITCHER,
					'return_value'       => 'yes',
					'default'            => 'no',
					'prefix_class'       => 'pp-reviews-equal-height-',
					'render_type'        => 'template',
					'frontend_available' => true,
				)
			);

			$this->add_control(
				'help_doc_equal_height',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => esc_html__( 'Note: This option sets an equal height for all the reviews content boxes. It takes the height of the longest review and applies it to the other reviews.', 'powerpack' ),
					'content_classes' => 'pp-editor-info',
					'condition'       => array(
						'_skin'        => 'bubble',
						'equal_height' => 'yes',
					),
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Register Business Reviews carousel controls.
	 *
	 * @since 2.8.0
	 * @access protected
	 */
	protected function register_content_carousel_controls() {

		$this->start_controls_section(
			'section_slider_settings',
			array(
				'label'     => esc_html__( 'Carousel Settings', 'powerpack' ),
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'slider_speed',
			[
				'label'       => esc_html__( 'Transition Duration', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 500,
				'condition'   => array(
					'layout' => 'carousel',
				),
			]
		);

		$this->add_control(
			'autoplay',
			array(
				'label'        => esc_html__( 'Autoplay', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'separator'    => 'before',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'autoplay_speed',
			[
				'label'       => esc_html__( 'Autoplay Speed', 'powerpack' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 3000,
				'condition'   => array(
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				),
			]
		);

		$this->add_control(
			'pause_on_hover',
			array(
				'label'                 => esc_html__( 'Pause on Hover', 'powerpack' ),
				'description'           => '',
				'type'                  => Controls_Manager::SWITCHER,
				'default'               => '',
				'label_on'              => esc_html__( 'Yes', 'powerpack' ),
				'label_off'             => esc_html__( 'No', 'powerpack' ),
				'return_value'          => 'yes',
				'frontend_available'    => true,
				'condition'             => array(
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'pause_on_interaction',
			array(
				'label'              => esc_html__( 'Pause on Interaction', 'powerpack' ),
				'description'        => esc_html__( 'Disables autoplay completely on first interaction with the carousel.', 'powerpack' ),
				'type'               => Controls_Manager::SWITCHER,
				'default'            => '',
				'label_on'           => esc_html__( 'Yes', 'powerpack' ),
				'label_off'          => esc_html__( 'No', 'powerpack' ),
				'return_value'       => 'yes',
				'frontend_available' => true,
				'condition'          => array(
					'layout'   => 'carousel',
					'autoplay' => 'yes',
				),
			)
		);

		$this->add_control(
			'infinite_loop',
			array(
				'label'        => esc_html__( 'Infinite Loop', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'name_navigation_heading',
			array(
				'label'     => esc_html__( 'Navigation', 'powerpack' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'arrows',
			array(
				'label'        => esc_html__( 'Arrows', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'pagination',
			array(
				'label'        => esc_html__( 'Pagination', 'powerpack' ),
				'type'         => Controls_Manager::SWITCHER,
				'default'      => 'yes',
				'label_on'     => esc_html__( 'Yes', 'powerpack' ),
				'label_off'    => esc_html__( 'No', 'powerpack' ),
				'return_value' => 'yes',
				'condition'    => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->add_control(
			'pagination_type',
			array(
				'label'     => esc_html__( 'Pagination Type', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'bullets',
				'options'   => array(
					'bullets'  => esc_html__( 'Dots', 'powerpack' ),
					'fraction' => esc_html__( 'Fraction', 'powerpack' ),
				),
				'condition' => array(
					'layout'     => 'carousel',
					'pagination' => 'yes',
				),
			)
		);

		$this->add_control(
			'direction',
			array(
				'label'     => esc_html__( 'Direction', 'powerpack' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'left',
				'options'   => [
					'auto'  => esc_html__( 'Auto', 'powerpack' ),
					'left'  => esc_html__( 'Left', 'powerpack' ),
					'right' => esc_html__( 'Right', 'powerpack' ),
				],
				'separator' => 'before',
				'condition' => array(
					'layout' => 'carousel',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register Business Reviews filters.
	 *
	 * @since 2.8.0
	 * @access protected
	 */
	protected function register_content_filters_controls() {
		$this->start_controls_section(
			'section_filters_controls',
			array(
				'label' => esc_html__( 'Filters', 'powerpack' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

			$this->add_control(
				'reviews_filter_by',
				array(
					'label'       => esc_html__( 'Filter By', 'powerpack' ),
					'type'        => Controls_Manager::SELECT,
					'label_block' => false,
					'default'     => 'rating',
					'options'     => array(
						'default' => 'None',
						'rating'  => 'Minimum Rating',
						'date'    => 'Review Date',
					),
				)
			);

			$this->add_control(
				'reviews_min_rating',
				array(
					'label'       => esc_html__( 'Minimum Rating', 'powerpack' ),
					'type'        => Controls_Manager::SELECT,
					'label_block' => false,
					'default'     => 'no',
					'options'     => array(
						'no' => 'No Minimum Rating',
						'2'  => '2 star',
						'3'  => '3 star',
						'4'  => '4 star',
						'5'  => '5 star',
					),
				)
			);

			$this->add_control(
				'reviews_min_rating_doc',
				array(
					'type'            => Controls_Manager::RAW_HTML,
					'raw'             => esc_html__( 'Display reviews of ratings greater than or equal to minimum rating. For example, choosing 3 star will skip the reviews with less than 3 rating from displaying.', 'powerpack' ),
					'content_classes' => 'pp-editor-info',
				)
			);

		$this->end_controls_section();
	}

	/**
	 * Get Google Places API from PowerPack options.
	 *
	 * @since 2.8.0
	 * @return string
	 */
	public function get_google_places_api() {
		return \PowerpackElements\Classes\PP_Admin_Settings::get_option( 'pp_google_places_api_key' );
	}

	/**
	 * Get Yelp API from PowerPack options.
	 *
	 * @since 2.8.0
	 * @return string
	 */
	public function get_yelp_api() {
		return \PowerpackElements\Classes\PP_Admin_Settings::get_option( 'pp_yelp_api_key' );
	}
}
