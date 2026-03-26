<?php

namespace Essential_Addons_Elementor\Pro\Traits;

if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

trait Dynamic_Filterable_Gallery
{
    public static function get_dynamic_gallery_item_classes($show_category_child_items = 0, $show_product_cat_child_items = 0)
    {
        $classes = [];
        $post_id = get_the_ID();
        $post_type = get_post_type( $post_id );

        // Check if this is an attachment and we have parent taxonomy mapping from ACF gallery
        global $eael_dfg_attachment_taxonomy_map;
        if ( 'attachment' === $post_type && ! empty( $eael_dfg_attachment_taxonomy_map ) && isset( $eael_dfg_attachment_taxonomy_map[ $post_id ] ) ) {
            // Use the parent post's taxonomy classes for this attachment
            return $eael_dfg_attachment_taxonomy_map[ $post_id ];
        }

        // collect post class
        $get_object_taxonomies = get_object_taxonomies( $post_type );

        $taxonomies = wp_get_object_terms( $post_id, $get_object_taxonomies, array( "fields" => "slugs" ) );

        if ( $taxonomies && ! is_wp_error( $taxonomies ) ) {
            foreach ( $taxonomies as $taxonomy ) {
                $classes[] = $taxonomy;
            }
        }

        $category_or_product_cat = '';
        if(1 === $show_category_child_items && !empty($get_object_taxonomies) && in_array('category', $get_object_taxonomies)) {
            $category_or_product_cat = 'category';
        }

        if(1 === $show_product_cat_child_items && !empty($get_object_taxonomies) && in_array('product_cat', $get_object_taxonomies)){
            $category_or_product_cat = 'product_cat';
        }

        if($category_or_product_cat){
            $terms = get_the_terms( $post_id , $category_or_product_cat);
            if($terms && ! is_wp_error( $terms )) {
                foreach( $terms as $term ) {
                    $parent_list = get_term_parents_list($term->term_id, $category_or_product_cat, array( "format" => "slug", 'separator' => '/', "link" => 0, "inclusive" => 0 ) );
                    $parent_list = explode( '/', $parent_list );
                    $classes = array_merge($classes, array_filter( $parent_list ));
                }
            }
        }

        if ($categories = get_the_category($post_id)) {
            foreach ($categories as $category) {
                $classes[] = $category->slug;
            }
        }

        if ($tags = get_the_tags()) {
            foreach ($tags as $tag) {
                $classes[] = $tag->slug;
            }
        }

        if ($product_cats = get_the_terms($post_id, 'product_cat')) {
            if ( ! is_wp_error( $product_cats ) ) {
                foreach ($product_cats as $cat) {
                    if(is_object($cat)) {
                        $classes[] = $cat->slug;
                    }
                }
            }
        }

        return array_unique( array_filter( $classes ) );
    }
}
