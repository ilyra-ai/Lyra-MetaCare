<?php

use Essential_Addons_Elementor\Classes\Helper as HelperClass;
use Essential_Addons_Elementor\Pro\Classes\Helper;
?>
<div class="eael-learn-dash-course eael-course-default-layout <?php echo !empty($tags_as_string) ? esc_attr($tags_as_string) : ' '; ?>  <?php echo !empty($cats_as_string) ? esc_attr($cats_as_string) : ' '; ?> <?php echo esc_attr( $pagination_class ) ?> ">
    <div class="eael-learn-dash-course-inner">

<!--        --><?php //if($image && $settings['show_thumbnail'] === 'true') : ?>
        <?php if($settings['show_thumbnail'] === 'true') : ?>
            <?php if ( ! empty( $ribbon_atts['ribbon_text'] ) ) : ?>
                <div class="<?php echo !empty( $ribbon_atts['class'] ) ? esc_attr( $ribbon_atts['class'] ) : ''; ?>">
                    <?php echo wp_kses_post( $ribbon_atts['ribbon_text'] ); ?>
                </div>
            <?php endif; ?>
            
            <a href="<?php echo esc_url(get_permalink($course->ID)); ?>" class="eael-learn-dash-course-thumbnail">
                <?php if( 1 == $ld_course_grid_enable_video_preview && ! empty( $ld_course_grid_video_embed_code ) ) : ?>
                    <!-- .ld_course_grid_video_embed helps to load default css and js from learndash -->
                    <div class="ld_course_grid_video_embed">
                        <?php echo wp_kses( $ld_course_grid_video_embed_code, HelperClass::eael_allowed_tags() ); ?>
                    </div>
                <?php elseif( $image ) :?>
                <img src="<?php echo esc_url($image[0]); ?>" alt="<?php echo esc_attr( $image_alt ); ?>" />
                <?php else : ?>
                    <img alt="" src="<?php echo esc_url( \Elementor\Utils::get_placeholder_image_src() ); ?>"/>
                <?php endif; ?>

                <?php if($settings['show_price'] == 'true') : ?>
                <div class="card-price">
                    <?php
                    if( isset( $legacy_meta['sfwd-courses_course_price'] ) ){
                        echo esc_html( $legacy_meta['sfwd-courses_course_price'] );
                    } elseif($settings['change_free_price_text'] == 'true' && !empty($settings['free_price_text'])) {
                        echo wp_kses( $settings['free_price_text'], HelperClass::eael_allowed_tags() );
                    } else {
                        echo esc_html__('Free', 'essential-addons-elementor');
                    }
                    ?>
                </div>
                <?php endif; ?>
            </a>
        <?php endif; ?>

        <div class="eael-learn-deash-course-content-card">
            <?php
                $title_tag = Helper::eael_pro_validate_html_tag( $settings['title_tag'] );
                printf( '<%1$s class="course-card-title"><a href="%2$s">%3$s</a></%1$s>', esc_attr( $title_tag ), esc_url( get_permalink( $course->ID ) ), wp_kses( $course->post_title, HelperClass::eael_allowed_tags() ) );
            ?>

            <?php if($settings['show_course_duration'] === 'true') : ?>
                <?php if( !empty( $duration_hours ) || !empty( $duration_minutes ) ) : ?>
                <div class="course-author-meta-inline course-duration-meta-inline">
                    <p><span><?php esc_html_e($duration_hours . 'Hrs ' . $duration_minutes . 'Mins', 'essential-addons-elementor'); ?></span></p>
                </div>
                <?php endif; ?>
            <?php endif; ?>
            
            <?php if($settings['show_author_meta'] === 'true') : ?>
            <div class="course-author-meta-inline">
                <img src="<?php echo esc_url( get_avatar_url( $course->post_author ) ); ?>" alt="<?php echo esc_attr(get_the_author_meta('display_name', $course->post_author)); ?>-image" />
                <span><?php esc_html_e('By', 'essential-addons-elementor'); ?></span> 
                <a href="<?php echo esc_url($author_courses); ?>">
                <?php echo esc_attr(get_the_author_meta('display_name', $course->post_author)); ?></a>
                <span><?php esc_html_e('in', 'essential-addons-elementor'); ?></span> 
                <?php if (!is_wp_error($cats) && !empty($cats)) : ?>
                <a href="<?php echo esc_url_raw( $author_courses_from_cat ); ?>"><?php echo esc_attr(ucfirst($cats[0]->name)); ?></a>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php $this->_generate_tags($tags); ?>

            <?php if($settings['show_content'] === 'true' && !empty($short_desc)) : ?> 
            <div class="eael-learn-dash-course-short-desc">
                <?php 
                // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                $short_desc_render = $this->get_controlled_short_desc($short_desc, $excerpt_length, $excerpt_shortcode_support);
                echo wpautop( 'true' === $excerpt_shortcode_support ? do_shortcode($short_desc_render) : $short_desc_render ); 
                ?>
            </div><?php endif; ?>

            <?php if ( ! empty( $settings['eael_show_additional_info'] ) && 'yes' === $settings['eael_show_additional_info'] && ! empty( $settings['eael_additional_info_content'] ) ) : ?>
                <div class="eael-learn-dash-course-additional-info">
                    <?php 
                    // Set up post context for shortcodes
                    global $post;
                    $original_post = $post;
                    $post = $course;
                    setup_postdata( $post );
                    
                    // Get the content
                    $content = $settings['eael_additional_info_content'];
                    
                    // Manually process ACF shortcodes with correct post context
                    if ( function_exists( 'get_field' ) && strpos( $content, '[acf' ) !== false ) {
                        // Replace [acf field="field_name"] with actual field values
                        $content = preg_replace_callback(
                            '/\[acf\s+field="([^"]+)"[^\]]*\]/i',
                            function( $matches ) use ( $course ) {
                                $field_name = $matches[1];
                                $field_value = get_field( $field_name, $course->ID );
                                return $field_value ? $field_value : '';
                            },
                            $content
                        );
                    }
                    
                    // Process other shortcodes
                    $additional_info = do_shortcode( $content );
                    
                    // Output the content
                    if ( ! empty( $additional_info ) ) {
                        echo wp_kses_post( $additional_info );
                    }
                    
                    // Restore original post context
                    $post = $original_post;
                    if ( $post ) {
                        setup_postdata( $post );
                    } else {
                        wp_reset_postdata();
                    }
                    ?>
                </div>
            <?php endif; ?>

            <?php
                if($settings['show_progress_bar'] === 'true') {
                    echo do_shortcode( '[learndash_course_progress course_id="' . $course->ID . '" user_id="' . get_current_user_id() . '"]' );
                }
            ?>

            <?php if($settings['show_button'] === 'true') : ?>
                <div class="layout-button-wrap">
                    <a href="<?php echo esc_url(get_permalink($course->ID)); ?>" class="eael-course-button">
                        <?php
                        if($settings['change_button_text'] === 'true' && !empty($settings['button_text'])) {
                            echo wp_kses( $settings['button_text'], HelperClass::eael_allowed_tags() );
                        } else {
                            echo empty( $button_text ) ? esc_html__( 'See More', 'essential-addons-elementor' ) : wp_kses( $button_text, HelperClass::eael_allowed_tags() );
                        }
                        ?>
                    </a>
                </div>
            <?php endif; ?>

        </div>

    </div>
</div>
