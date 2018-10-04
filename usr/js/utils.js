var Utils = function(){
}

Utils.prototype.getQueryString = function(url){
	var ret = {};
	// #の除去
	var urlNoHash = url.split("#");
	var urlQs = urlNoHash[0].split("?");
	if (urlQs.length > 1){
		// パラメータ単位で配列に渡す
		var params = urlQs[1].split("&");
		for (var i = 0; i < params.length; i++){
			var param = params[i].split("=");
			var key = param[0];
			var value = null;
			if (param.length > 0){
				value = param[1];
			}
			ret[key] = value;
		}
	}
	return ret;
}
