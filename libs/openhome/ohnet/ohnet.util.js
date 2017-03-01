
/**
* The ohnet object is the single global object used by ohnet Services to
* facilitate actions and subscriptions. 
* @module ohnet
* @title ohnet
*/

if (typeof ohnet == "undefined" || !ohnet) {
    /**
    * The ohnet global namespace object.  If ohnet is already defined, the
    * existing ohnet object will not be overwritten so that defined
    * namespaces are preserved.
    * @class ohnet
    * @static
    */
    var ohnet = {};
}
if (typeof ohnet.util == "undefined" || !ohnet.util) {
    ohnet.util = {};
}



/**
* Contains useful common functions
* @namespace ohnet
* @class util
*/


/**
* A helper method to generate a GUID as a client id
* @method generateGUID
*/
ohnet.util.generateGUID = function () {
	var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);;
    });
	return guid;
};

/**
 * 获取 节点内容，兼容ie8+
 * @param node
 * @param ns
 * @param tagName
 * @returns
 */
ohnet.util.getElementsByTagNameNS = function(node, tagName){
	if (node.getElementsByTagNameNS) {
		 return node.getElementsByTagNameNS('*', tagName);
	}
	tagName = tagName.toLowerCase();
	var _reg = new RegExp(':' + tagName + '$', 'gi');
	// 递归获取 tagName
	var _t;
	var _redGetByTagName = function(node, rs){
		_t = node.nodeName.toLowerCase();
		if(_reg.test(_t) || _t == tagName){
			rs.push(node);
		}
		if(node.childNodes.length > 0){
			for(var i = 0;i < node.childNodes.length;i ++){
				_redGetByTagName(node.childNodes[i], rs);
			}
		}
	};
	var _rs = [];
	_redGetByTagName(node, _rs);
	return _rs;
};

/**
 * 获取 节点文本值
 * @param node
 * @returns
 */
ohnet.util.getElementText = function(node){
	if(node == null){
		return '';
	}
	var _v = node.textContent ? node.textContent : node.text;
	return _v == undefined ? '' : _v;
};

/**
 * 获取节点 tag 名称
 * @param node
 * @returns
 */
ohnet.util.getElementNodeName = function(node){
	if(node == null){
		return '';
	}
	return node.tagName ? node.tagName : node.nodeName;
};

/**
 * 解析 idarray
 * @param str
 * @returns {Array}
 */
ohnet.util.parseIdArrays = function(str){
	if(str == null || str.length == 0){
		return [];
	}
	var bytes = ohnet.util.stringToBytes(str);
	var l = bytes.length / 4;
	var rs = [];
	for(var i = 0;i < l ;i ++){
		rs.push(ohnet.util.swapEndian32(bytes.slice(i * 4, (i + 1) * 4)));
	}
	return rs;
};

ohnet.util.swapEndian32 = function(bytes){
	var l = 0;
	var step = 1;
	var t;
	// 没4个byte作为一个数字数字处理
	for(var i = bytes.length - 1;i >= 0;i --){
		t = bytes[i] & 0x0FF;
		l += t * step;
		// 左移8位
		step *= (1 << 8);
	}
	return l;
} 

/**
 * 将 字符串转换成 bytes
 */
ohnet.util.stringToBytes = function( str ) {  
  var ch, st, re = [];  
  for (var i = 0; i < str.length; i++ ) {  
    ch = str.charCodeAt(i);  // get char   
    st = [];                 // set up "stack"  
    do {  
      st.push( ch & 0xFF );  // push byte to stack  
      ch = ch >> 8;          // shift value down by 1 byte  
    }    
    while ( ch );  
    // add stack contents to result  
    // done because chars have "wrong" endianness  
    re = re.concat( st.reverse() );  
  }  
  // return an array of bytes  
  return re;  
}




/**
* A helper method to merge options
* @method extend
* @param {Object} defaults Collection that contains default options
* @param {Object} options Collection that contains user defined options
*/
ohnet.util.mergeOptions = function (defaults,options) {
	var newoptions = {};
	for (var attrname in defaults) { newoptions[attrname] = defaults[attrname]; }
	for (var attrname in options) { newoptions[attrname] = options[attrname]; }
	return newoptions;
};
