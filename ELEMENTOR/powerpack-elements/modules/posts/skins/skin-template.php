<?php
namespace PowerpackElements\Modules\Posts\Skins;

// Elementor Classes
use Elementor\Widget_Base;
use PowerpackElements\Modules\TemplatesContent\Module as TemplatesContent;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Portfolio Skin for Posts widget
 */
class Skin_Template extends Skin_Base {

	/**
	 * Retrieve Skin ID.
	 *
	 * @access public
	 *
	 * @return string Skin ID.
	 */
	public function get_id() {
		return 'template';
	}

	/**
	 * Retrieve Skin title.
	 *
	 * @access public
	 *
	 * @return string Skin title.
	 */
	public function get_title() {
		return esc_html__( 'Saved Template', 'powerpack' );
	}

	/**
	 * Register Control Actions.
	 *
	 * @access protected
	 */
	protected function _register_controls_actions() { // phpcs:ignore PSR2.Methods.MethodDeclaration.Underscore 
		// parent::_register_controls_actions();

		add_action( 'elementor/element/pp-posts/section_skin_field/before_section_end', array( $this, 'register_layout_controls' ) );
		add_action( 'elementor/element/pp-posts/section_query/after_section_end', array( $this, 'register_template_controls' ) );
	}

	public function register_template_controls( Widget_Base $widget ) {
		$this->parent = $widget;

		$this->register_slider_controls();
		$this->register_filter_section_controls();
		$this->register_search_controls();
		$this->register_pagination_controls();
		$this->register_content_help_docs();

		$this->register_style_layout_controls();
		$this->register_style_box_controls();
		$this->register_style_filter_controls();
		$this->register_style_search_controls();
		$this->register_style_pagination_controls();
		$this->register_style_arrows_controls();
		$this->register_style_dots_controls();
	}

	/**
	 * Render post body output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render_post_body() {
		$settings = $this->parent->get_settings_for_display();

		do_action( 'ppe_before_single_post_wrap', get_the_ID(), $settings );
		?>
		<div <?php post_class( $this->get_item_wrap_classes() ); ?>>
			<?php do_action( 'ppe_before_single_post', get_the_ID(), $settings ); ?>
			<div class="<?php echo esc_attr( $this->get_item_classes() ); ?>">
				<?php
				if ( ! empty( $settings['templates'] ) ) {
					$template_id = $settings['templates'];

					TemplatesContent::render_template_content( $template_id, $this->parent, true );

				} else {
					$placeholder = esc_html__( 'Choose a post template that you want to use as post skin in widget settings.', 'powerpack' );

					echo wp_kses_post( $this->parent->render_editor_placeholder(
						array(
							'title' => esc_html__( 'No template selected!', 'powerpack' ),
							'body'  => $placeholder,
						)
					) );
				}
				?>
			</div>
			<?php do_action( 'ppe_after_single_post', get_the_ID(), $settings ); ?>
		</div>
		<?php
		do_action( 'ppe_after_single_post_wrap', get_the_ID(), $settings );
	}
}
