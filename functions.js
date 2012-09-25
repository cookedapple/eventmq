module.exports = {
/*
'ascii' - for 7 bit ASCII data only. This encoding method is very fast, and will strip the high bit if set.
'utf8' - Multi byte encoded Unicode characters. Many web pages and other document formats use UTF-8.
'ucs2' - 2-bytes, little endian encoded Unicode characters. It can encode only BMP(Basic Multilingual Plane, U+0000 - U+FFFF).
'base64' - Base64 string encoding.
'binary' - A way of encoding raw binary data into strings by using only the first 8 bits of each character. This encoding method is deprecated and should be avoided in favor of Buffer objects where possible. This encoding will be removed in future versions of Node.
*/


	// - Functions
	toLower:  function (v) { return v.toLowerCase(); },

	// - Fundamental functions
	htmlEntities: function (str) {return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');},

	testprint: function () {
		return "Test print from functions.js";
	},
	
	toStrToBase64: function (str) {
		return new Buffer(str).toString('base64');
	},

	toBase64ToStr: function (base64) {
		return new Buffer(base64,'base64').toString('ascii');
	}


}