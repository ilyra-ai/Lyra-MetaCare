<?php
class WPML_PP_Table_Header extends WPML_Elementor_Module_With_Items {

	/**
	 * @return string
	 */
	public function get_items_field() {
		return 'table_headers';
	}

	public function get_fields() {
		return array(
			'table_header_col',
			'tooltip_content',
		);
	}

	protected function get_title( $field ) {
		switch ( $field ) {
			case 'table_header_col':
				return esc_html__( 'Table - Header Cell Text', 'powerpack' );
			case 'tooltip_content':
				return esc_html__( 'Table - Header Cell Tooltip Content', 'powerpack' );
			default:
				return '';
		}
	}

	protected function get_editor_type( $field ) {
		switch ( $field ) {
			case 'table_header_col':
				return 'LINE';
			case 'tooltip_content':
				return 'VISUAL';
			default:
				return '';
		}
	}

}

class WPML_PP_Table_Body extends WPML_Elementor_Module_With_Items {

	/**
	 * @return string
	 */
	public function get_items_field() {
		return 'table_body_content';
	}

	public function get_fields() {
		return array(
			'cell_text',
			'tooltip_content',
			'link' => array( 'url' ),
		);
	}

	protected function get_title( $field ) {
		switch ( $field ) {
			case 'cell_text':
				return esc_html__( 'Table - Body Cell Text', 'powerpack' );
			case 'tooltip_content':
				return esc_html__( 'Table - Body Cell Tooltip Content', 'powerpack' );
			case 'url':
				return esc_html__( 'Table - Body Cell Link', 'powerpack' );
			default:
				return '';
		}
	}

	protected function get_editor_type( $field ) {
		switch ( $field ) {
			case 'cell_text':
				return 'AREA';
			case 'tooltip_content':
				return 'VISUAL';
			case 'url':
				return 'LINK';
			default:
				return '';
		}
	}

}

class WPML_PP_Table_Footer extends WPML_Elementor_Module_With_Items {

	/**
	 * @return string
	 */
	public function get_items_field() {
		return 'table_footer_content';
	}

	public function get_fields() {
		return array(
			'cell_text',
			'tooltip_content',
			'link' => array( 'url' ),
		);
	}

	protected function get_title( $field ) {
		switch ( $field ) {
			case 'cell_text':
				return esc_html__( 'Table - Footer Cell Text', 'powerpack' );
			case 'tooltip_content':
				return esc_html__( 'Table - Footer Cell Tooltip Content', 'powerpack' );
			case 'url':
				return esc_html__( 'Table - Footer Cell Link', 'powerpack' );
			default:
				return '';
		}
	}

	protected function get_editor_type( $field ) {
		switch ( $field ) {
			case 'cell_text':
				return 'AREA';
			case 'tooltip_content':
				return 'VISUAL';
			case 'url':
				return 'LINK';
			default:
				return '';
		}
	}

}
