<?php
/**
 * Override Default Header file
 * 
 * The following file overrides the default header file to load the Header in a similar way
 * Elementor does.
 *
 * @since 1.5.1
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php do_action( 'wp_body_open' ); ?>
<div id="page" class="hfeed site">
<?php 
    // Custom action to hook custom header template to header.php file
    do_action( 'pp_header' );
?>