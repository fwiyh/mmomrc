$(function(){
	// param
	var QS_KEY_PRODUCT_ID = "id";
	var QS_KEY_QUANTITY = "q";

	// chrome向けurl取得
	var currentPath = location.pathname;
	
	var utils = new Utils();
	var mRConfig = new MRConfig();
	var categories = mRConfig.getCategories();
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

	// スピナーの設置
	$("div[id^=SelectedProduct_] input[name=productQuantity]").each(
		function(){
			var spinner = $(this).spinner({
				min: 1
			});
		}
	);

	// 計算イベントの設置
	$("div[id^=SelectedProduct_] button.calc").on(
		"click",
		function(){
			var productId = $(this).parent().find(".productId").val();
			var productQuantity = $(this).parent().find("input[name=productQuantity]").val();
			// url変更処理
			history.pushState(
				{}, 
				null, 
				"?" 
				+ QS_KEY_PRODUCT_ID + "=" + productId
				+ "&"
				+ QS_KEY_QUANTITY + "=" + productQuantity
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
	 * @param {*} productQuantity 
	 */
	function calcEvent(productId, productQuantity){
		// urlからパラメータを取得
		var u = $(location).prop("href");
		var params = utils.getQueryString(u);
		// パラメータの取得
		var productId = params[QS_KEY_PRODUCT_ID];
		var productQuantity = params[QS_KEY_QUANTITY];
		// idがない場合は処理を行わない
		if (!(QS_KEY_PRODUCT_ID in params)){
			return;
		}
		// 有限値でなければ1とみなす
		if (!isFinite(productQuantity)){
			productQuantity = 1;
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
		calcMaterial(productId, productQuantity);

		// modalの展開
		$("#ModalTitle").text(productName + "(数量：" + productQuantity + ")");
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
	function calcMaterial(productId, productQuantity){
		// リセット
		$("ul[id=Resource_0] li").each(
			function(){
				$(this).remove();
			}
		);
		$("li[id^=TotalResource_]").not("#TotalResource_-1").each(
			function(){
				$(this).remove();
			}
		);
		// 素材の取得
		mRCalc.calc(productId, productQuantity);
		var retArr = mRCalc.getRequired();
		// 出力
		for (var i = 0; i < retArr.length; i++){
			copyResult(retArr[i]);
		}
		$("#MaterialTree").show();
		$("#Resource_0 li").show();

		// TODO イベントの設置
		$("ul li a").on(
			"click",
			function(){
				$(this).parent().children("ul").toggle();
			}
		);

		// 総量の取得
		var totalArr = mRCalc.getTotalRequired();
		for (var i = 0; i < totalArr.length; i++){
			copyTotalResult(totalArr[i], i);
		}
		$("#TotalRequired").show();
	}

	/**
	 * 取得した素材（階層構造）の転記
	 * @param {*} resource 
	 */
	function copyResult(resource){
		// 合計値表示
		var total = resource["quantity"];
		if (resource["quantity"] != resource["total"]){
			total += "(" + resource["total"] + ")";
		}

		if (resource["terminate"] == 1){
			$("#TreeTemplate .singleList")
				.clone(true)
				.appendTo("#Resource_" + resource["parentPos"])
				.prop("id", "Resource_" + resource["pos"]);
		}else {
			$("#TreeTemplate .childrenList")
				.clone(true)
				.appendTo("#Resource_" + resource["parentPos"])
				.prop("id", "ParentList_" + resource["pos"]);
			// ulにidを付与
			$("#ParentList_" + resource["pos"] + " ul").prop("id", "Resource_" + resource["pos"]);
		}

		// 結果の投入
		$("#Resource_" + resource["pos"]).find(".resourceName").text(resource["name"]);
		$("#Resource_" + resource["pos"]).find(".resourceQuantity").text(total);
		$("#ParentList_" + resource["pos"]).find(".resourceName").text(resource["name"]);
		$("#ParentList_" + resource["pos"]).find(".resourceQuantity").text(total);
	}

	/**
	 * 取得した素材（総量）の転記
	 */
	function copyTotalResult(resource, incount){
		$("#TotalResource_-1").clone(true).insertAfter("#TotalResource_" + parseInt(incount-1)).prop("id", "TotalResource_" + incount);
		// 結果の投入
		$("#TotalResource_" + incount).find("span.resourceId").text(resource["id"]);
		$("#TotalResource_" + incount).find("span.resourceName").text(resource["name"]);
		$("#TotalResource_" + incount).find("span.resourceQuantity").text(resource["total"]);

		$("#TotalResource_" + incount).show();
	}
});