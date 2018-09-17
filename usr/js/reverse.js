$(function(){
	// param
	var QS_KEY_PRODUCT_ID = "id";

	// chrome向けurl取得
	var currentPath = location.pathname;

	var utils = new Utils();
	var mRConfig = new MRConfig();
	var categories = mRConfig.getReverseCategories();
	var copyright = mRConfig.getCopyright();
	var dataPath = mRConfig.getDataPath();
	var mRCalc = new MRCalc(dataPath);

	// footer設定
	$("footer").find(".text-muted").text(copyright);

	// タブの作成
	for (var i = 0; i < categories.length; i++){
		// タブ
		$("#CategoryTab_-1")
			.clone(true)
			.insertAfter("#CategoryTab_" + parseInt(i-1))
			.prop("id", "CategoryTab_" + i);
		if (i == 0){
			$("#CategoryTab_" + i).find("a").addClass("active");
		}
		$("#CategoryTab_" + i).find("a").prop("href", "#" + "TabContent_" + i);
		$("#CategoryTab_" + i).find("a").text(categories[i]["name"]);
		$("#CategoryTab_" + i).show();

		// コンテンツの出力
		getCategoryContents(categories[i]["id"], i);

		$("#tabContent_" + i).show();
	}

	// 計算イベントの設置
	$("div[id^=SelectedProduct_] button.search").on(
		"click",
		function(){
			var productId = $(this).parent().find(".productId").val();
			// url変更処理
			history.pushState(
				{}, 
				null, 
				"?" 
				+ QS_KEY_PRODUCT_ID + "=" + productId
			);
			// 計算処理を実行
			calcEvent();
		}
	);

	// onLoadでURI解析
	$(document).ready(
		function(){
			calcEvent();
		}
	);

	// モーダル設定
	$("#RequiredModal").on(
		"hide.bs.modal",
		function(e){
			window.history.replaceState(
				null, 
				null, 
				currentPath + "?"
			);
		}
	);

	/**
	 * 計算処理
	 * @param {*} productId 
	 */
	function calcEvent(productId){
		// urlからパラメータを取得
		var u = $(location).prop("href");
		var params = utils.getQueryString(u);
		// パラメータの取得
		var productId = params[QS_KEY_PRODUCT_ID];
		// idがない場合は処理を行わない
		if (!(QS_KEY_PRODUCT_ID in params)){
			return;
		}
		// idから名称を取得
		var productName = $("input.productId[value=" + productId + "]")
							.parent().parent().parent().find("div.productName").text();

		// 属するタブを取得してアクティブにする
		var tabContentId = $("input.productId[value=" + productId + "]")
							.parent().parent().parent().parent().parent().parent()
							.attr("id");
		// タブコンテンツのid名をタブのidに置き換える
		var tabId = tabContentId.replace(/^TabContent\_/g, "CategoryTab_");
		// bootstrapのタブ機能で表示を変える
		$("#" + tabId + " a").tab("show");

		// 計算処理を実行
		calcMaterial(productId);

		// modalの展開
		$("#ModalTitle").text(productName);
		$("#RequiredModal").modal("show");
	}

	/**
	 * カテゴリータブの表示とタブ内コンテンツの出力
	 * @param {*} targetType 
	 * @param {*} num 
	 */
	function getCategoryContents(targetType, num){
		// 内容の領域を作成
		$("#TabContent_-1")
			.clone(true)
			.insertAfter("#TabContent_" + parseInt(num-1))
			.prop("id", "TabContent_" + num);
		$("#TabContent_" + num + " .selectedProduct").prop("id", "SelectedProduct_" + num + "_" + "-1");

		// active設定
		if (num == 0){
			$("#TabContent_" + num).addClass("active");
		}
		
		// 内容の出力
		var products = mRCalc.getProductsByType(targetType);
		for (var i = 0; i < products.length; i++){
			$("#SelectedProduct_" + num + "_-1")
				.clone(true)
				.insertAfter("#SelectedProduct_" + num + "_" + parseInt(i-1))
				.prop("id", "SelectedProduct_" + num + "_" + i);
			$("#SelectedProduct_" + num + "_" + i).find(".productName").text(products[i]["name"]);
			$("#SelectedProduct_" + num + "_" + i).find(".productId").val(products[i]["id"]);
			$("#SelectedProduct_" + num + "_" + i).show();
		}

		// 領域の表示
		$("#TabContent_" + num).css("display", "");
	}
	
	/**
	 * 素材計算
	 * @param {*} productId 
	 * @param {*} productQuantity 
	 */
	function calcMaterial(productId){
		// リセット
		$("li[id^=TotalResource_]").not("#TotalResource_-1").each(
			function(){
				$(this).remove();
			}
		);
		// 素材の取得
		mRCalc.reverseSearch(productId);
		var retArr = mRCalc.getUsingProducts();
		// 出力
		for (var i = 0; i < retArr.length; i++){
			copyResult(retArr[i], i);
		}
		$("#TotalRequired").show();
	}

	/**
	 * 取得した素材（総量）の転記
	 */
	function copyResult(resource, incount){
		$("#TotalResource_-1").clone(true).insertAfter("#TotalResource_" + parseInt(incount-1)).prop("id", "TotalResource_" + incount);
		// 結果の投入
		$("#TotalResource_" + incount).find("span.resourceId").text(resource["id"]);
		$("#TotalResource_" + incount).find("span.resourceType").text(resource["type"]);
		$("#TotalResource_" + incount).find("span.resourceName").text(resource["name"]);
		$("#TotalResource_" + incount).find("span.resourceQuantity").text(resource["quantity"]);

		$("#TotalResource_" + incount).show();
	}
});