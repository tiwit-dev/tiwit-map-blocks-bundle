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
	// Styles.
	wp_enqueue_style(
		'tiwit_map_blocks_bundle-style',
		plugins_url( 'dist/blocks.style.build.css', dirname( __FILE__ ) ),
		array( 'wp-blocks' ),
		'1.0'
	);

	wp_enqueue_style(
		'tiwit-leaflet-css',
		'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
		array(),
		'1.0'
	);

	if( ! is_admin() ){

		wp_enqueue_script( 'tiwit-leaflet-js',
			'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
			array(),
			'1.3.1'
		);
	}

}

add_filter('script_loader_tag', 'tiwit_map_js_add_attributes', 10, 2);

function tiwit_map_js_add_attributes( $tag, $handle ) {

	if( $handle == 'tiwit-leaflet-js'){

		$tag = str_replace(' src=', ' integrity="sha512-/Nsx9X4HebavoBvEBuyp3I7od5tA0UzAxs+j83KgC8PU0kgB4XiK4Lfe4y4cgBtaRJQEIFCW+oC506aPT2L1zw==" crossorigin="" src=', $tag);
	}

	return $tag;
}

add_filter( 'style_loader_tag', 'tiwit_map_css_add_attributes', 10, 2);

function tiwit_map_css_add_attributes( $tag, $handle ){

	if( $handle == 'tiwit-leaflet-css'){

		$tag = str_replace(' href=', 'integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ==" crossorigin="" href=', $tag);
	}

	return $tag;
}

// Hook: Frontend assets.

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
		'tiwit_map_blocks_bundle-cgb-block-js', // Handle.
		plugins_url( '/dist/blocks.build.js', dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
		array( 'wp-blocks', 'wp-i18n', 'wp-element' ) // Dependencies, defined above.
		// filemtime( plugin_dir_path( __FILE__ ) . 'block.js' ) // Version: filemtime — Gets file modification time.
	);

	// Styles.
	wp_enqueue_style(
		'tiwit_map_blocks_bundle-cgb-block-editor-css', // Handle.
		plugins_url( 'dist/blocks.editor.build.css', dirname( __FILE__ ) ), // Block editor CSS.
		array( 'wp-edit-blocks' ) // Dependency to include the CSS after it.
		// filemtime( plugin_dir_path( __FILE__ ) . 'editor.css' ) // Version: filemtime — Gets file modification time.
	);
} // End function tiwit_map_blocks_bundle_cgb_editor_assets().

// Hook: Editor assets.
add_action( 'enqueue_block_editor_assets', 'tiwit_map_blocks_bundle_cgb_editor_assets' );
