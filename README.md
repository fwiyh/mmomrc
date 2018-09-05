# mmomrc

## 概要
MMO Material Requirements Calculator。  
MMOやソシャゲにありがちな生産コンテンツで、何かを作るために原料がどれだけ必要化を表示する仕組み。

## 対応環境
bootstrap 4, jqurey 3.3.1, jquery-ui 1.12を利用している。  
最も要件の厳しい[jQuery UIのドキュメント](https://jqueryui.com/browser-support/)から

```
Current Active Support

jQuery UI 1.12.x supports the following browsers:

    Chrome: (Current - 1) or Current
    Firefox: (Current - 1) or Current
    Safari: (Current - 1) or Current
    Opera: (Current - 1) or Current
    IE: 11
    Edge: (Current - 1) or Current

Any problem with jQuery UI in the above browsers should be reported as a bug in jQuery UI.

(Current - 1) or Current denotes that we support the current stable version of the browser and the version that preceded it. For example, if the current version of a browser is 24.x, we support the 24.x and 23.x versions.
```
と記載されており、最新のブラウザで動く。


## 使い方
mmomrc直下にある、
  - index.html
  - lib
  - usr
をウェブサイトかローカルPCに設置して、index.htmlをブラウザで開くだけ。  
データがあれば数量を入力して計算ボタンをクリックすると必要な数量が表示される。

## 表示結果の見方
モーダルウィンドウのタイトル部分に選択した生産物と入力した数量が表示される。  
その下に素材必要量が表示される。これは完成品を作成するための原料の総量。  
素材ツリーは、生産物を作るための前提になる中間生成物のツリー表示。  
数量に対して括弧書きしているものはツリーの上位の材料を作るために必要となる数量。

## データ構造
usr/dataにあるjsonファイルを利用する。  
形式は以下のオブジェクトを配列で保持する。

  1. id --- すべてのデータに対して一意になる値
  1. type --- カテゴリー。タブでグルーピングして表示する
  1. name --- 生産物の名前
  1. material --- この生産物を作るために必要な材料と数量を配列で保持

materialに入るデータは以下

  1. id --- データの中に必ず存在する一意の素材
  1. quantity --- 数量

## 各種設定
設定情報はcommon.jsに統合している。  
各タイトルで区別する場合は以下の修正が必要。  

### this.copyrightプロパティ
copyright表示をページフッターで行う。  
複数の運営や開発会社の表記が必要になることも考慮し、配列で保持。

### this.resourcePathプロパティ
材料データのjsonファイルのパス。
ブラウザの機能として別のドメインを参照できない。

### this.categoriesプロパティ
生産物を表示するカテゴリーを配列で保持する。  
画面上では各カテゴリーがタブで表示される。
配列は以下のオブジェクトにより構成される。

  1. id --- データで定義されている「カテゴリー」の値をそのまま利用する
  1. name --- カテゴリーの表記名

## 参考情報

### MRCalcの実装
MRCalcで素材総量と素材ツリーの計算を行う。  

素材ツリーは階層毎に下位のツリーが存在するか確認を行っている。  
オブジェクトで構成される一次元配列を持っており、各オブジェクトに親がどの素材であるかを保持している。  
親の情報を下に、index.jsでリストタグのどこに設定するかを判断している。

### index.html周り
基本的にbootstrapのリストを利用している。  
htmlソース内に「<!-- template -->」と記載されたブロック要素がある。  
この中のリストをcloneして素材ツリーの出力を行っている。  
素材総量の表示は「id="TotalResource_-1"」のリストを用いて、これをcloneして表示している。  
何らかのカスタマイズが必要な場合はこのあたりの修正が必要になる。