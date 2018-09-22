<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since 	1.0.0
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'enqueue_block_assets', 'tiwit_map_blocks_bundle_cgb_block_assets' );

/**
 * Enqueue Gutenberg block assets for both frontend + backend.
 *
 * `wp-blocks`: includes block type registration and related functions.
 *
 * @since 1.0.0
 */
function tiwit_map_blocks_bundle_cgb_block_assets() {

	wp_enqueue_style(
		'tiwit-leaflet-css',
		'https://unpkg.com/leaflet@1.3.4/dist/leaflet.css',
		array(),
		'1.3.4'
	);

	if( ! is_admin() ){

		wp_enqueue_script( 'tiwit-leaflet-js',
			'https://unpkg.com/leaflet@1.3.4/dist/leaflet.js',
			array(),
			'1.3.4',
			true
		);

		wp_enqueue_script( 'tiwit-front-simple-map',
			plugins_url( '/src/simple-map/front-simple-map.js', dirname( __FILE__ ) ),
			array( 'tiwit-leaflet-js' ),
			'1.0',
			true
		);
	}

}


add_filter('script_loader_tag', 'tiwit_map_js_add_attributes', 10, 2);

function tiwit_map_js_add_attributes( $tag, $handle ) {

	if( $handle == 'tiwit-leaflet-js'){

		$tag = str_replace(' src=', ' integrity="sha512-nMMmRyTVoLYqjP9hrbed9S+FzjZHW5gY1TWCHA5ckwXZBadntCNs8kEqAWdrb9O7rxbCaA4lKTIWjDXZxflOcA==" crossorigin="" src=', $tag);
	}

	return $tag;
}


add_filter( 'style_loader_tag', 'tiwit_map_css_add_attributes', 10, 2);

function tiwit_map_css_add_attributes( $tag, $handle ){

	if( $handle == 'tiwit-leaflet-css'){

		$tag = str_replace(' href=', ' integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA==" crossorigin="" href=', $tag);
	}

	return $tag;
}


add_action( 'enqueue_block_editor_assets', 'tiwit_map_blocks_bundle_cgb_editor_assets' );

/**
 * Enqueue Gutenberg block assets for backend editor.
 *
 * `wp-blocks`: includes block type registration and related functions.
 * `wp-element`: includes the WordPress Element abstraction for describing the structure of your blocks.
 * `wp-i18n`: To internationalize the block's text.
 *
 * @since 1.0.0
 */
function tiwit_map_blocks_bundle_cgb_editor_assets() {
	// Scripts.
	wp_enqueue_script(
		'tiwit_map_blocks_bundle-cgb-block-js',
		plugins_url( '/dist/blocks.build.js', dirname( __FILE__ ) ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element' ),
		'1.0'
	);

}

