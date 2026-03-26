<?php
	$value = ! empty( $field['default_value'] ) ? $field['default_value'] : '';
?>
<input type="hidden" <?php $this->print_render_attribute_string( $field_key ); ?> value="<?php echo esc_attr( $value ); ?>" placeholder="<?php echo esc_attr( $field['placeholder'] ); ?>" />
