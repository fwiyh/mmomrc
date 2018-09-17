$(function(){
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
			var productName = $(this).parent().parent().parent().find(".productName").text();
			var productId = $(this).parent().find(".productId").val();
			calcMaterial(productId);

			// modalの展開
			$("#ModalTitle").text(productName);
			$("#RequiredModal").modal("show");
		}
	);

	// コンテンツの出力
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