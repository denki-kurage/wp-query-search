<?php
/**
 * Plugin Name:       Query Search
 * Description:       This is a developer-only plugin. Create a REST API query and display the results in a DataGrid.
 * Requires at least: 6.7.1
 * Requires PHP:      8.0.30
 * Version:           0.1.1
 * Author:            Kurage Worker
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       query-search
 *
 * @package CreateBlock
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
add_action('init', function()
{
	$handle = register_block_type( plugin_dir_path(__FILE__) . '/build' );

	// echo join(', ', $handle->editor_script_handles);
	
	wp_set_script_translations(
		'query-search-result-view-editor-script',
		'query-search',
		plugin_dir_path(__FILE__) . 'languages'
	);

	$blocksPath = plugin_dir_path(__FILE__) . '/build/blocks';
	$blockNames = [
		'array-form',
		'boolean-form',
		'datetime-form',
		'enum-form',
		'hash-form',
		'multi-form',
		'number-form',
		'object-form',
		'string-form',
		'options-form',
	];

	foreach($blockNames as $name)
	{
		$path = $blocksPath . '/' . $name;
		register_block_type($path);
	}

});




add_action('after_setup_theme', function(){
	add_theme_support('align-wide');			
});


// .mo の場所
load_plugin_textdomain('query-search', false, 'query-search/languages');

// カテゴリ追加
add_filter('block_categories_all', function($categories)
{
	$categories[] = ['slug' => 'query-search', 'title' => __('Query Search', 'query-search'), 'icon' => null ];
	return $categories;
});







add_filter('query_vars', function($vars){
	$vars[] = 'kurage_meta_includes';
	return $vars;
});




/**
 * in the development stages
 */ 

 //$dispatch_result = apply_filters( 'rest_dispatch_request', null, $request, $route, $handler );

// add_filter('rest_dispatch_request', function($r, $request, $route, $handler)









add_action('rest_api_init', function()
{
	global $wpdb;


	$nonce1 = isset($_REQUEST['_wpnonce']) ? sanitize_text_field(wp_unslash($_REQUEST['_wpnonce'])) : null;
	$nonce2 = isset($_SERVER['HTTP_X_WP_NONCE']) ? sanitize_text_field(wp_unslash(($_SERVER['HTTP_X_WP_NONCE']))) : null;
	$nonce = $nonce1 ?? $nonce2 ?? '';

	if(!wp_verify_nonce( $nonce, 'wp_rest' ))
	{
		return new WP_Error( 'rest_cookie_invalid_nonce', 'nonce error!', array( 'status' => 403 ) );
	}

	$isOptionsHttpMethod = 
		isset($_SERVER['REQUEST_METHOD']) &&
		is_string($_SERVER['REQUEST_METHOD']) &&
		'OPTIONS' === sanitize_text_field(wp_unslash($_SERVER['REQUEST_METHOD']));
		
	$metaIncludes =
		isset($_GET['kurage_meta_includes']) &&
		is_array($_GET['kurage_meta_includes']) ?
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		rest_sanitize_object(wp_unslash($_GET['kurage_meta_includes'])) : [];

	if(!($isOptionsHttpMethod || $metaIncludes))
	{
		return;
	}

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$results = $wpdb->get_results(
		"SELECT post_type, pm.meta_key FROM {$wpdb->prefix}posts AS p ".
		"INNER JOIN {$wpdb->prefix}postmeta AS pm ON p.ID = pm.post_id ".
		"GROUP BY p.post_type, pm.meta_key"
	);

	$map = array_reduce(
		$results,
		function($pre, $r)
		{
			$pre[$r->post_type] = $pre[$r->post_type] ?? [];
			$pre[$r->post_type][] = $r->meta_key;
			return $pre;
		},
		[]
	);

	// レコードが一つもないタイプは拾えないので注意。
	$postTypes = array_keys($map);



	/**
	 * すべての投稿タイプにスキーマを適用する。
	 */
	if($isOptionsHttpMethod)
	{
		foreach($postTypes as $type)
		{
			$metas = $map[$type] ?? [];

			// メタ数が「３００」を超える場合は無視します。
			if(count($metas) > 300)
			{
				continue;
			}

			// WP_REST_Posts_Controller#get_collection_params()にクエリパラメータを追加します。
			add_filter("rest_{$type}_collection_params", function($qp, $type) use($metas){
				$metalist = [
					'type' => 'array',
					'description' => __('List of meta keys', 'query-search'),
					'items' => [
						'type' => 'string',
						'enum' => $metas
					],
					'default' => []
				];
				$includesMode = [
					'type' => 'array',
					'description' => __('Check mode.', 'query-search'),
					'items' => [
						'type' => 'string',
						'enum' => ['all', 'none', 'some']
					],
					'default' => ['none', 'some']
				];
				$obj = [
					'type' => 'object',
					'description' => __('Check the meta keys', 'query-search'),
					'properties' =>
					[
						'meta_list' => $metalist,
						'meta_mode' => $includesMode
					]
				];
				$qp['kurage_meta_includes'] = $obj;
				return $qp;
			}, 10, 2);
		}

		return;
	}



	// リクエストにmeta_includesがあればクエリ処理とメタフィールドの追加
	if($metaIncludes)
	{
		add_filter('rest_dispatch_request', function($r, $request, $route, $handler) use($wpdb, $postTypes, $metaIncludes)
		{
			$metas = array_map(fn($v) => sanitize_key($v), rest_sanitize_array($metaIncludes['meta_list'] ?? []));
			$mode = array_filter(rest_sanitize_array($metaIncludes['meta_mode'] ?? []), fn($v) => in_array($v, ['none', 'some', 'all'], true));
			$len = count($metas);
			
			$in = in_array('none', $mode) ? [0] : [];
			if(in_array('some', $mode))
			{
				for($i = 1; $i < $len; $i++)
				{
					$in[] = $i;
				}

				if($len === 1)
				{
					$in[] = 1;
				}
			}
			$in = in_array('all', $mode) ? [...$in, $len] : $in;
			$in = array_unique($in);
			$pf = join(', ', array_map(fn() => '%s', $metas));
			// phpcs:ignore 	WordPress.DB.PreparedSQL.NotPrepared
			$metasPrapare = $wpdb->prepare($pf, $metas);

			$range = join(', ', $in);

			if(!count($in) || !count($metas))
			{
				return null;
			}

			add_filter('posts_where', function(string $where, WP_Query $query) use($metasPrapare, $range, $wpdb){

				$where .= "
				AND ID IN (
					SELECT ID FROM
						(SELECT ID, IFNULL(meta_count, 0) as meta_count FROM {$wpdb->prefix}posts
							LEFT JOIN (
								SELECT post_id, COUNT(DISTINCT meta_key) AS meta_count
									FROM {$wpdb->prefix}postmeta
									WHERE meta_key IN ({$metasPrapare}) AND meta_value IS NOT NULL
									GROUP BY post_id
							) AS pm ON pm.post_id = ID
						)
						AS ids
						WHERE ids.meta_count IN ({$range})
				)
				";

				return $where;
			}, 10, 2);


			
			/**
			 * 取得用メタ情報の追加
			 */
			register_meta('post', '__KURAGE__', [
				'type' => 'object',
				'description' => 'list of meta keys.',
				'show_in_rest' =>
				[
					'schema' =>
					[
						'type' => 'object',
						'additionalProperties' =>
						[
							'type' => 'array',
							'items' => ['string', 'integer', 'null', 'boolean', 'number', 'array', 'object']
						]
					],
				],
				'single' => !false
			]);



			/**
			 * レスポンスのメタ情報に、条件一致するメタ項目を追加
			 */
			foreach($postTypes as $type)
			{
				add_filter("get_{$type}_metadata", function($value, $object_id, $meta_key, $single, $meta_type) use($type, $metas){
					if($meta_key === '__KURAGE__')
					{
						$caches = update_meta_cache($type, [$object_id]);
						$cache = $caches[$object_id] ?? [];
						$arr = array_reduce($metas, fn($pre, $cur) => array_merge($pre, [$cur => $cache[$cur] ?? []]), []);
						return [$arr];
					}
					return $value;
				}, 10, 5);
			}

			return null;

		}, 10, 4);
	}



});
