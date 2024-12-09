
REST API のクエリ結果確認用です。
GutenbergのEntity Dataを使用し結果をデータグリッドに表示します。

このプラグインは「非公開の投稿orページ」でのみ使用してください。
開発練習用に作ったもので開発者専用となってます。



例として「投稿」にクエリを投げてみます。
以下は使い方です。



## 結果ビュー

まずは「結果ビュー(query-search/result-view)」を追加します。
REST API 結果をDataGrid表示するブロックです。

![](./wp-add-result-view.png)


結果ビューの表示名(適当でいい)を付けます。

![](./wp-result-view.png)


次にエンティティを選びます。
「投稿」は`postType`で`post`です。

![](wp-entity.png)




## エンティティ

エンティティは「kind」と「name」からなります。
一般的なのは以下の通りです(他にもありますが省略します)。

| entity     | kind     | name        |
|------------|----------|-------------|
| 投稿       | postType | post        |
| 固定ページ | postType | page        |
| メディア   | postType | attachement |
| カテゴリ   | taxonomy | category    |
| タグ       | taxonomy | post_tag    |


エンティティを選択すると、DataGridに一覧が表示されます。

![](wp-entity-column-view.png)

REST APIの結果から表示するカラムを選択できます。
「エンティティ決定」ボタンを押せば完了です。


## クエリ・フォーム

クエリフォームを使うとクエリを追加することができます。

    /wp/v2/posts?search=kurage

例えばテキスト検索する場合は「search」を追加します。
詳しくは公式ドキュメントを読んでください。

https://developer.wordpress.org/rest-api/reference/posts/

以下のようにクエリフォームを追加します。
「文字列 クエリ」を選択し、
「追加」ボタンを押します。

![](wp-add-query-form.png)


そしたら「文字列 クエリ」の入力ブロックが追加されます。
クエリパラメータの名前(フィールド名)の「search」を入力して決定ボタンをおします。

![](wp-entity-search.png)


パラメータの値を入力します。「kurage」を入力します。

![](wp-query-search-input.png)


これでクエリパラメータが完成します。

    search=kurage

ただそのままではフィルターでは無効になっています。

![](wp-query-filter.png)


フィルター(search: kurage)をチェックします。

![](wp-query-filter-check.png)


チェックを入れると以下のURLが完成します。

    /wp/v2/posts?search=kurage


**結果ビューに即反映されます**

重要なことなのでもう一度書きます。

**結果ビューに即反映されます**

今回は「文字列」を指定するクエリフォームを使いましたが、他に「DateTime」や「配列」もあります。

DateTimeは「after」や「before」に使用します。
配列は「categories」や「include」「exclude」に使います。

これら「after, before, include, exclude」などはクエリパラメータとして使えるものです。
しかし、いちいちドキュメントを見るのも面倒です。
そこでエンドポイントを活用します。


## エンドポイントからの追加


これらクリエパラメータの情報はHTTPメソッドを「OPTIONS」に指定することで得ることができます。

```js
await wp.apiFetch({ path: '/wp/v2/posts', method: 'OPTIONS' })
```

![](wp-api.png)

このJSONスキーマを解析し、自動的にクエリフォームを構築するのがこの機能です。
試しに「after」を追加します。

![](wp-endpoint-after.png)



「追加」ボタンを押すとDateTime型のクエリフォームが追加されます。
その際フィールド名(after)も設定された状態になります。

![](wp-endpoint-after-add.png)



時刻を設定し、フィルターをチェックするとクエリパラメータにafterか追加されます。

![](wp-endpoint-after-check.png)



## 隠し内部ブロック

これらクエリフォームの正体はブロックです。
これらは「結果ビューブロック」の隠しブロックに自動的に追加されます。

ツールバーの目のボタンを押すと「表示」「非表示」を切り替えることができます。


![](wp-hidden-blocks.png)

そしてインスペクターのフォームと連動してます。


## クエリ フォーム ブロック

直接ブロックとして追加することもできます。
「文字列 クエリ」 を追加してみましょう。

![](wp-string-query-form.png)



クエリ名を入力(search)

![](wp-string-query-form-add.png)



クエリフォームは結果ビューに属します。
どの結果ビューにも属してないと警告が出ます。
属する結果ビューを選択します。

![](wp-string-query-form-result-view.png)



クエリフォームが完成しました。

![](wp-string-query-form-new.png)


ただクエリ名(search)が二つ存在してます。
こちらのほうには値(hello)を入力します。

![](wp-string-query-form-select.png)


クエリ フィルタを見ると、「search」がラジオボタンになっています。
同じクエリパラメータの名前が複数あると、そのうちどれかを選ぶ必要があります。
searchの値「kurage」と「hello」を切り分ることができます。

![](wp-string-query-form-select-check.png)


## IDチェック

クエリパラメータの「categories」は、カテゴリを絞る検索です。
指定したカテゴリに属する投稿だけを検索します。

投稿のカテゴリの指定の仕方は２通りあります。


* カテゴリIDの配列を指定(categories)
* オブジェクトで指定(terms, include_children, operator)

設定の仕方はちょっと特殊です。


新たに結果ビューを追加します。
エンティティは「カテゴリ(taxonomy/category)」です。

![](wp-category-result-view.png)


DataGridにカテゴリ一覧が表示されます。
それぞれチェックできるので、適当にチェックします。

![](wp-category-ids.png)



## マルチ クエリ

投稿の結果ビューに戻ります。
エンドポイントから「categories」を追加します。

![](wp-category-endpoint.png)


選択項目があります。
「配列 クエリ」と「オブジェクト クエリ」です。

![](wp-category-endpoint-select.png)


* 配列 クエリ

![](wp-category-endpoint-select-array.png)

* オブジェクト クエリ

![](wp-category-endpoint-select-object.png)


まずは「配列 クエリ」についてです。
「結果ビューから取得」ボタンを押します。

![](wp-category-endpoint-select-array-rv.png)


カテゴリ 結果ビューを選択します。

![](wp-category-endpoint-select-array-rv-c.png)


リストを上書きします。

![](wp-category-endpoint-select-array-rv-c-rew.png)


クエリ フィルタを見るとチェック項目がクエリパラメータに指定されていることが確認できます。

![](wp-category-endpoint-items.png)


結果ビューを見ると、特定のカテゴリに属する投稿に絞り込まれています。
わかりやすいようにカテゴリＩＤのカラムを追加しています。

![](wp-category-endpoint-result-view.png)


ちなみに「オブジェクト クエリ」はもっと複雑です。

* terms タームのリスト(未確認だがカテゴリ以外のタームも含むのかも？)
* include_children 子タームも含めるか
* operator すべてのタームに属するなら「AND」、一部なら「OR」

これらをまとめて設定できます。
クエリパラメーターはとても複雑になってます。

![](wp-category-endpoint-object.png)


## メタチェック

スキーマ(kurage_meta_includes)で投稿にメタが設定されているか調べます。

![](wp-qs-1.png)

またメタがいくつそろっているかを調べます。

not: 一つもメタが含まれない
all: すべてのメタが含まれる
some: それらの間。

例えば３つのメタがあると、
not: 0
all: 3
some: 1, 2


この例では座標の値 lat, lng　があります。

`none`は座標が一切設定されていない投稿を、
`all`は両方設定されている投稿、
`some`は片方だけ設定されている投稿を
それぞれ「OR」の条件で取得します。

## その他

インスペクターから「隠しブロックへ移動」ボタンを押すことで移動できます。

![](wp-string-query-form-inspector.png)


結果ビューのボーダーの色や高さを変更できます

![](wp-setting.png)


## 開発中で使用非推奨なもの

開発中の機能は無効になってます。
以下のボタンをクリックするとその機能が使えます。

![](wp-dev.png)


アイコンの意味は、

ページや編集ページへのリンクへ移動、または編集や削除ができます。

![](wp-dev-icons.png)


こちらもJSONスキーマを解析することで編集フォームを自動的に作成してます。

プラスのアイコンを押すと投稿(Entity)の「新規追加」ができます。

![](wp-edit-add.png)


ペンのアイコンを押すと投稿(Entity)の「更新」ができます。

![](wp-edit-update.png)


これらは開発中なので動作は不安定です。



