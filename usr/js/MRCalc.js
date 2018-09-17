var MRCalc = function(dataPath){
	// jsonデータから取得できる全素材データ
	this.resourceData = [];
	// 要求量（階層）データ
	this.requiredResources = [];
	// 要求量（総量）データ
	this.totalRequiredResources = [];
	// 利用素材データ
	this.usingProducts = [];
	// コンストラクト
	this.__constract(dataPath);
}

// jsonでデータを取得する
MRCalc.prototype.__constract = function(dataPath){
	var root = this;
	var date = new Date();
	$.ajax({
		async: false,
		cache: false,
		dataType: "json",
		url: dataPath + "?" + date.getTime(),
		data: {}
	})
	.done(
		function(data){
			root.resourceData = data;
		}
	).always(
		function(){

		}
	);
}

// accessor
MRCalc.prototype.getRequired = function(){
	return this.requiredResources;
}
MRCalc.prototype.getTotalRequired = function(){
	return this.totalRequiredResources;
}
MRCalc.prototype.getUsingProducts = function(){
	return this.usingProducts;
}

// 指定タイプのみ取得
MRCalc.prototype.getProductsByType = function(targetType){
	var retArr = [];
	for (var i = 0; i < this.resourceData.length; i++){
		if (this.resourceData[i]["type"] == targetType){
			retArr.push(this.resourceData[i]);
		}
	}
	return retArr;
}

/**
 * 素材計算
 * @param {*} productId 
 * @param {*} quantity 
 */
MRCalc.prototype.calc = function(productId, quantity){

	// リセット
	this.requiredResources = [];
	this.totalRequiredResources = [];

	// 最初の階層を取得
	this._firstCalc(productId, quantity);

	// 第２階層設定
	var layer = 1;
	// 再帰計算
	for (;;){
		var isNested = false;
		// 再帰的に素材の取得
		for (var i = 0; i < this.requiredResources.length; i++){
			var res = this.requiredResources[i];
			if (res["layer"] == layer -1){
				var childResources = this._getRequired(res["material"], res["total"], res["pos"], layer);
				// 終点のみ総量データの検索と配置
				if (childResources.length == 0){
					this.requiredResources[i]["terminate"] = 1;
					this._setTotalRequired(res);
				}
				// 階層データの追加
				for (var j = 0; j < childResources.length; j++){
					// 階層データ
					// 途中の配列から順番に追加するため「j」での加算が必要
					this.requiredResources.splice(i+j+1, 0, childResources[j]);
					isNested = true;
				}
			}
		}
		if (!isNested){
			break;
		}
		layer++;
	}
}

/**
 * 逆引き検索
 * @param {*} productId 
 */
MRCalc.prototype.reverseSearch = function(productId){

	// リセット
	this.usingProducts = [];
	
	for (var i = 0; i < this.resourceData.length; i++){
		var material = this.resourceData[i]["material"];
		for (var j = 0; j < material.length; j++){
			if (material[j]["id"] == productId){
				var retArr = {
					"id": this.resourceData[i]["id"], 
					"type": this.resourceData[i]["type"], 
					"name": this.resourceData[i]["name"],
					"quantity": material[j]["quantity"]
				};
				this.usingProducts.push(retArr);
			}
		}
	}
}

// 材料取得計算
MRCalc.prototype._firstCalc = function(productId, quantity){
	var retArr = [];
	for (var i = 0; i < this.resourceData.length; i++){
		if (this.resourceData[i]["id"] == productId){
			retArr = this._getRequired(this.resourceData[i]["material"], quantity, 0, 0);
			this.requiredResources = retArr;
		}
	}
}

// 各材料の総数を取得
MRCalc.prototype._getRequired = function(material, number, pos, layer){
	var retArr = [];
	for (var i = 0; i < material.length; i++){
		var id = material[i]["id"];
		var quantity = material[i]["quantity"];
		// リセット
		var name = "Unknown";
		var submaterial = {};
		// 付帯情報の取得
		var mtObj = this._getRequiredMaterial(material[i]["id"]);
		if (JSON.stringify(mtObj) !== JSON.stringify({})){
			name = mtObj["name"];
			submaterial = mtObj["material"];
		}
		retArr.push(
			{
				"id": id,
				"name": name,
				"pos": id + "_" + pos + "_" + layer,
				"parentPos": pos,
				"quantity": quantity,
				"total": quantity * number,
				"layer": layer,
				"material": submaterial,
				"terminate": 0
			}
		);
	}
	return retArr;
}

// idから要求素材の取得
MRCalc.prototype._getRequiredMaterial = function(id){
	var retObj = {};
	for (var i = 0; i < this.resourceData.length; i++){
		if (this.resourceData[i]["id"] == id){
			retObj = this.resourceData[i];
		}
	}
	return retObj;
}

// 総量計算
MRCalc.prototype._setTotalRequired = function(resource){
	for (var i = 0; i < this.totalRequiredResources.length; i++){
		if (this.totalRequiredResources[i]["id"] == resource["id"]){
			this.totalRequiredResources[i]["total"] += parseInt(resource["total"]);
			return;
		}
	}
	var arr = {"id": resource["id"], "name": resource["name"], "total": resource["total"]};
	this.totalRequiredResources.push(arr);

}