<input type="checkbox" <?php $this->print_render_attribute_string( $field_key ); ?> value="1"<?php echo 'yes' == $field['default_checked'] ? ' checked="checked"' : ''; ?> />
<label for="<?php echo 'field-' . esc_attr( $field['_id'] ); ?>" class="pp-rf-field-label"><?php echo esc_html( $field['field_label'] ); ?></label>
