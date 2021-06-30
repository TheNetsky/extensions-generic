(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
var entities_json_1 = __importDefault(require("./maps/entities.json"));
var legacy_json_1 = __importDefault(require("./maps/legacy.json"));
var xml_json_1 = __importDefault(require("./maps/xml.json"));
var decode_codepoint_1 = __importDefault(require("./decode_codepoint"));
var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
exports.decodeXML = getStrictDecoder(xml_json_1.default);
exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
function getStrictDecoder(map) {
    var replace = getReplacer(map);
    return function (str) { return String(str).replace(strictEntityRe, replace); };
}
var sorter = function (a, b) { return (a < b ? 1 : -1); };
exports.decodeHTML = (function () {
    var legacy = Object.keys(legacy_json_1.default).sort(sorter);
    var keys = Object.keys(entities_json_1.default).sort(sorter);
    for (var i = 0, j = 0; i < keys.length; i++) {
        if (legacy[j] === keys[i]) {
            keys[i] += ";?";
            j++;
        }
        else {
            keys[i] += ";";
        }
    }
    var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
    var replace = getReplacer(entities_json_1.default);
    function replacer(str) {
        if (str.substr(-1) !== ";")
            str += ";";
        return replace(str);
    }
    // TODO consider creating a merged map
    return function (str) { return String(str).replace(re, replacer); };
})();
function getReplacer(map) {
    return function replace(str) {
        if (str.charAt(1) === "#") {
            var secondChar = str.charAt(2);
            if (secondChar === "X" || secondChar === "x") {
                return decode_codepoint_1.default(parseInt(str.substr(3), 16));
            }
            return decode_codepoint_1.default(parseInt(str.substr(2), 10));
        }
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return map[str.slice(1, -1)] || str;
    };
}

},{"./decode_codepoint":3,"./maps/entities.json":7,"./maps/legacy.json":8,"./maps/xml.json":9}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var decode_json_1 = __importDefault(require("./maps/decode.json"));
// Adapted from https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
var fromCodePoint = 
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.fromCodePoint ||
    function (codePoint) {
        var output = "";
        if (codePoint > 0xffff) {
            codePoint -= 0x10000;
            output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
            codePoint = 0xdc00 | (codePoint & 0x3ff);
        }
        output += String.fromCharCode(codePoint);
        return output;
    };
function decodeCodePoint(codePoint) {
    if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
        return "\uFFFD";
    }
    if (codePoint in decode_json_1.default) {
        codePoint = decode_json_1.default[codePoint];
    }
    return fromCodePoint(codePoint);
}
exports.default = decodeCodePoint;

},{"./maps/decode.json":6}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = void 0;
var xml_json_1 = __importDefault(require("./maps/xml.json"));
var inverseXML = getInverseObj(xml_json_1.default);
var xmlReplacer = getInverseReplacer(inverseXML);
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using XML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
exports.encodeXML = getASCIIEncoder(inverseXML);
var entities_json_1 = __importDefault(require("./maps/entities.json"));
var inverseHTML = getInverseObj(entities_json_1.default);
var htmlReplacer = getInverseReplacer(inverseHTML);
/**
 * Encodes all entities and non-ASCII characters in the input.
 *
 * This includes characters that are valid ASCII characters in HTML documents.
 * For example `#` will be encoded as `&num;`. To get a more compact output,
 * consider using the `encodeNonAsciiHTML` function.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
/**
 * Encodes all non-ASCII characters, as well as characters not valid in HTML
 * documents using HTML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
exports.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
function getInverseObj(obj) {
    return Object.keys(obj)
        .sort()
        .reduce(function (inverse, name) {
        inverse[obj[name]] = "&" + name + ";";
        return inverse;
    }, {});
}
function getInverseReplacer(inverse) {
    var single = [];
    var multiple = [];
    for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
        var k = _a[_i];
        if (k.length === 1) {
            // Add value to single array
            single.push("\\" + k);
        }
        else {
            // Add value to multiple array
            multiple.push(k);
        }
    }
    // Add ranges to single characters.
    single.sort();
    for (var start = 0; start < single.length - 1; start++) {
        // Find the end of a run of characters
        var end = start;
        while (end < single.length - 1 &&
            single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
            end += 1;
        }
        var count = 1 + end - start;
        // We want to replace at least three characters
        if (count < 3)
            continue;
        single.splice(start, count, single[start] + "-" + single[end]);
    }
    multiple.unshift("[" + single.join("") + "]");
    return new RegExp(multiple.join("|"), "g");
}
// /[^\0-\x7F]/gu
var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
var getCodePoint = 
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.prototype.codePointAt != null
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        function (str) { return str.codePointAt(0); }
    : // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        function (c) {
            return (c.charCodeAt(0) - 0xd800) * 0x400 +
                c.charCodeAt(1) -
                0xdc00 +
                0x10000;
        };
function singleCharReplacer(c) {
    return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0))
        .toString(16)
        .toUpperCase() + ";";
}
function getInverse(inverse, re) {
    return function (data) {
        return data
            .replace(re, function (name) { return inverse[name]; })
            .replace(reNonASCII, singleCharReplacer);
    };
}
var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using numeric hexadecimal reference (eg. `&#xfc;`).
 *
 * Have a look at `escapeUTF8` if you want a more concise output at the expense
 * of reduced transportability.
 *
 * @param data String to escape.
 */
function escape(data) {
    return data.replace(reEscapeChars, singleCharReplacer);
}
exports.escape = escape;
/**
 * Encodes all characters not valid in XML documents using numeric hexadecimal
 * reference (eg. `&#xfc;`).
 *
 * Note that the output will be character-set dependent.
 *
 * @param data String to escape.
 */
function escapeUTF8(data) {
    return data.replace(xmlReplacer, singleCharReplacer);
}
exports.escapeUTF8 = escapeUTF8;
function getASCIIEncoder(obj) {
    return function (data) {
        return data.replace(reEscapeChars, function (c) { return obj[c] || singleCharReplacer(c); });
    };
}

},{"./maps/entities.json":7,"./maps/xml.json":9}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
var decode_1 = require("./decode");
var encode_1 = require("./encode");
/**
 * Decodes a string with entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `decodeXML` or `decodeHTML` directly.
 */
function decode(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
}
exports.decode = decode;
/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `decodeHTMLStrict` or `decodeXML` directly.
 */
function decodeStrict(data, level) {
    return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
}
exports.decodeStrict = decodeStrict;
/**
 * Encodes a string with entities.
 *
 * @param data String to encode.
 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
 * @deprecated Use `encodeHTML`, `encodeXML` or `encodeNonAsciiHTML` directly.
 */
function encode(data, level) {
    return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
}
exports.encode = encode;
var encode_2 = require("./encode");
Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return encode_2.encodeXML; } });
Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function () { return encode_2.encodeNonAsciiHTML; } });
Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return encode_2.escape; } });
Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function () { return encode_2.escapeUTF8; } });
// Legacy aliases (deprecated)
Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
var decode_2 = require("./decode");
Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_2.decodeXML; } });
Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
// Legacy aliases (deprecated)
Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_2.decodeXML; } });

},{"./decode":2,"./encode":4}],6:[function(require,module,exports){
module.exports={"0":65533,"128":8364,"130":8218,"131":402,"132":8222,"133":8230,"134":8224,"135":8225,"136":710,"137":8240,"138":352,"139":8249,"140":338,"142":381,"145":8216,"146":8217,"147":8220,"148":8221,"149":8226,"150":8211,"151":8212,"152":732,"153":8482,"154":353,"155":8250,"156":339,"158":382,"159":376}

},{}],7:[function(require,module,exports){
module.exports={"Aacute":"Á","aacute":"á","Abreve":"Ă","abreve":"ă","ac":"∾","acd":"∿","acE":"∾̳","Acirc":"Â","acirc":"â","acute":"´","Acy":"А","acy":"а","AElig":"Æ","aelig":"æ","af":"⁡","Afr":"𝔄","afr":"𝔞","Agrave":"À","agrave":"à","alefsym":"ℵ","aleph":"ℵ","Alpha":"Α","alpha":"α","Amacr":"Ā","amacr":"ā","amalg":"⨿","amp":"&","AMP":"&","andand":"⩕","And":"⩓","and":"∧","andd":"⩜","andslope":"⩘","andv":"⩚","ang":"∠","ange":"⦤","angle":"∠","angmsdaa":"⦨","angmsdab":"⦩","angmsdac":"⦪","angmsdad":"⦫","angmsdae":"⦬","angmsdaf":"⦭","angmsdag":"⦮","angmsdah":"⦯","angmsd":"∡","angrt":"∟","angrtvb":"⊾","angrtvbd":"⦝","angsph":"∢","angst":"Å","angzarr":"⍼","Aogon":"Ą","aogon":"ą","Aopf":"𝔸","aopf":"𝕒","apacir":"⩯","ap":"≈","apE":"⩰","ape":"≊","apid":"≋","apos":"'","ApplyFunction":"⁡","approx":"≈","approxeq":"≊","Aring":"Å","aring":"å","Ascr":"𝒜","ascr":"𝒶","Assign":"≔","ast":"*","asymp":"≈","asympeq":"≍","Atilde":"Ã","atilde":"ã","Auml":"Ä","auml":"ä","awconint":"∳","awint":"⨑","backcong":"≌","backepsilon":"϶","backprime":"‵","backsim":"∽","backsimeq":"⋍","Backslash":"∖","Barv":"⫧","barvee":"⊽","barwed":"⌅","Barwed":"⌆","barwedge":"⌅","bbrk":"⎵","bbrktbrk":"⎶","bcong":"≌","Bcy":"Б","bcy":"б","bdquo":"„","becaus":"∵","because":"∵","Because":"∵","bemptyv":"⦰","bepsi":"϶","bernou":"ℬ","Bernoullis":"ℬ","Beta":"Β","beta":"β","beth":"ℶ","between":"≬","Bfr":"𝔅","bfr":"𝔟","bigcap":"⋂","bigcirc":"◯","bigcup":"⋃","bigodot":"⨀","bigoplus":"⨁","bigotimes":"⨂","bigsqcup":"⨆","bigstar":"★","bigtriangledown":"▽","bigtriangleup":"△","biguplus":"⨄","bigvee":"⋁","bigwedge":"⋀","bkarow":"⤍","blacklozenge":"⧫","blacksquare":"▪","blacktriangle":"▴","blacktriangledown":"▾","blacktriangleleft":"◂","blacktriangleright":"▸","blank":"␣","blk12":"▒","blk14":"░","blk34":"▓","block":"█","bne":"=⃥","bnequiv":"≡⃥","bNot":"⫭","bnot":"⌐","Bopf":"𝔹","bopf":"𝕓","bot":"⊥","bottom":"⊥","bowtie":"⋈","boxbox":"⧉","boxdl":"┐","boxdL":"╕","boxDl":"╖","boxDL":"╗","boxdr":"┌","boxdR":"╒","boxDr":"╓","boxDR":"╔","boxh":"─","boxH":"═","boxhd":"┬","boxHd":"╤","boxhD":"╥","boxHD":"╦","boxhu":"┴","boxHu":"╧","boxhU":"╨","boxHU":"╩","boxminus":"⊟","boxplus":"⊞","boxtimes":"⊠","boxul":"┘","boxuL":"╛","boxUl":"╜","boxUL":"╝","boxur":"└","boxuR":"╘","boxUr":"╙","boxUR":"╚","boxv":"│","boxV":"║","boxvh":"┼","boxvH":"╪","boxVh":"╫","boxVH":"╬","boxvl":"┤","boxvL":"╡","boxVl":"╢","boxVL":"╣","boxvr":"├","boxvR":"╞","boxVr":"╟","boxVR":"╠","bprime":"‵","breve":"˘","Breve":"˘","brvbar":"¦","bscr":"𝒷","Bscr":"ℬ","bsemi":"⁏","bsim":"∽","bsime":"⋍","bsolb":"⧅","bsol":"\\","bsolhsub":"⟈","bull":"•","bullet":"•","bump":"≎","bumpE":"⪮","bumpe":"≏","Bumpeq":"≎","bumpeq":"≏","Cacute":"Ć","cacute":"ć","capand":"⩄","capbrcup":"⩉","capcap":"⩋","cap":"∩","Cap":"⋒","capcup":"⩇","capdot":"⩀","CapitalDifferentialD":"ⅅ","caps":"∩︀","caret":"⁁","caron":"ˇ","Cayleys":"ℭ","ccaps":"⩍","Ccaron":"Č","ccaron":"č","Ccedil":"Ç","ccedil":"ç","Ccirc":"Ĉ","ccirc":"ĉ","Cconint":"∰","ccups":"⩌","ccupssm":"⩐","Cdot":"Ċ","cdot":"ċ","cedil":"¸","Cedilla":"¸","cemptyv":"⦲","cent":"¢","centerdot":"·","CenterDot":"·","cfr":"𝔠","Cfr":"ℭ","CHcy":"Ч","chcy":"ч","check":"✓","checkmark":"✓","Chi":"Χ","chi":"χ","circ":"ˆ","circeq":"≗","circlearrowleft":"↺","circlearrowright":"↻","circledast":"⊛","circledcirc":"⊚","circleddash":"⊝","CircleDot":"⊙","circledR":"®","circledS":"Ⓢ","CircleMinus":"⊖","CirclePlus":"⊕","CircleTimes":"⊗","cir":"○","cirE":"⧃","cire":"≗","cirfnint":"⨐","cirmid":"⫯","cirscir":"⧂","ClockwiseContourIntegral":"∲","CloseCurlyDoubleQuote":"”","CloseCurlyQuote":"’","clubs":"♣","clubsuit":"♣","colon":":","Colon":"∷","Colone":"⩴","colone":"≔","coloneq":"≔","comma":",","commat":"@","comp":"∁","compfn":"∘","complement":"∁","complexes":"ℂ","cong":"≅","congdot":"⩭","Congruent":"≡","conint":"∮","Conint":"∯","ContourIntegral":"∮","copf":"𝕔","Copf":"ℂ","coprod":"∐","Coproduct":"∐","copy":"©","COPY":"©","copysr":"℗","CounterClockwiseContourIntegral":"∳","crarr":"↵","cross":"✗","Cross":"⨯","Cscr":"𝒞","cscr":"𝒸","csub":"⫏","csube":"⫑","csup":"⫐","csupe":"⫒","ctdot":"⋯","cudarrl":"⤸","cudarrr":"⤵","cuepr":"⋞","cuesc":"⋟","cularr":"↶","cularrp":"⤽","cupbrcap":"⩈","cupcap":"⩆","CupCap":"≍","cup":"∪","Cup":"⋓","cupcup":"⩊","cupdot":"⊍","cupor":"⩅","cups":"∪︀","curarr":"↷","curarrm":"⤼","curlyeqprec":"⋞","curlyeqsucc":"⋟","curlyvee":"⋎","curlywedge":"⋏","curren":"¤","curvearrowleft":"↶","curvearrowright":"↷","cuvee":"⋎","cuwed":"⋏","cwconint":"∲","cwint":"∱","cylcty":"⌭","dagger":"†","Dagger":"‡","daleth":"ℸ","darr":"↓","Darr":"↡","dArr":"⇓","dash":"‐","Dashv":"⫤","dashv":"⊣","dbkarow":"⤏","dblac":"˝","Dcaron":"Ď","dcaron":"ď","Dcy":"Д","dcy":"д","ddagger":"‡","ddarr":"⇊","DD":"ⅅ","dd":"ⅆ","DDotrahd":"⤑","ddotseq":"⩷","deg":"°","Del":"∇","Delta":"Δ","delta":"δ","demptyv":"⦱","dfisht":"⥿","Dfr":"𝔇","dfr":"𝔡","dHar":"⥥","dharl":"⇃","dharr":"⇂","DiacriticalAcute":"´","DiacriticalDot":"˙","DiacriticalDoubleAcute":"˝","DiacriticalGrave":"`","DiacriticalTilde":"˜","diam":"⋄","diamond":"⋄","Diamond":"⋄","diamondsuit":"♦","diams":"♦","die":"¨","DifferentialD":"ⅆ","digamma":"ϝ","disin":"⋲","div":"÷","divide":"÷","divideontimes":"⋇","divonx":"⋇","DJcy":"Ђ","djcy":"ђ","dlcorn":"⌞","dlcrop":"⌍","dollar":"$","Dopf":"𝔻","dopf":"𝕕","Dot":"¨","dot":"˙","DotDot":"⃜","doteq":"≐","doteqdot":"≑","DotEqual":"≐","dotminus":"∸","dotplus":"∔","dotsquare":"⊡","doublebarwedge":"⌆","DoubleContourIntegral":"∯","DoubleDot":"¨","DoubleDownArrow":"⇓","DoubleLeftArrow":"⇐","DoubleLeftRightArrow":"⇔","DoubleLeftTee":"⫤","DoubleLongLeftArrow":"⟸","DoubleLongLeftRightArrow":"⟺","DoubleLongRightArrow":"⟹","DoubleRightArrow":"⇒","DoubleRightTee":"⊨","DoubleUpArrow":"⇑","DoubleUpDownArrow":"⇕","DoubleVerticalBar":"∥","DownArrowBar":"⤓","downarrow":"↓","DownArrow":"↓","Downarrow":"⇓","DownArrowUpArrow":"⇵","DownBreve":"̑","downdownarrows":"⇊","downharpoonleft":"⇃","downharpoonright":"⇂","DownLeftRightVector":"⥐","DownLeftTeeVector":"⥞","DownLeftVectorBar":"⥖","DownLeftVector":"↽","DownRightTeeVector":"⥟","DownRightVectorBar":"⥗","DownRightVector":"⇁","DownTeeArrow":"↧","DownTee":"⊤","drbkarow":"⤐","drcorn":"⌟","drcrop":"⌌","Dscr":"𝒟","dscr":"𝒹","DScy":"Ѕ","dscy":"ѕ","dsol":"⧶","Dstrok":"Đ","dstrok":"đ","dtdot":"⋱","dtri":"▿","dtrif":"▾","duarr":"⇵","duhar":"⥯","dwangle":"⦦","DZcy":"Џ","dzcy":"џ","dzigrarr":"⟿","Eacute":"É","eacute":"é","easter":"⩮","Ecaron":"Ě","ecaron":"ě","Ecirc":"Ê","ecirc":"ê","ecir":"≖","ecolon":"≕","Ecy":"Э","ecy":"э","eDDot":"⩷","Edot":"Ė","edot":"ė","eDot":"≑","ee":"ⅇ","efDot":"≒","Efr":"𝔈","efr":"𝔢","eg":"⪚","Egrave":"È","egrave":"è","egs":"⪖","egsdot":"⪘","el":"⪙","Element":"∈","elinters":"⏧","ell":"ℓ","els":"⪕","elsdot":"⪗","Emacr":"Ē","emacr":"ē","empty":"∅","emptyset":"∅","EmptySmallSquare":"◻","emptyv":"∅","EmptyVerySmallSquare":"▫","emsp13":" ","emsp14":" ","emsp":" ","ENG":"Ŋ","eng":"ŋ","ensp":" ","Eogon":"Ę","eogon":"ę","Eopf":"𝔼","eopf":"𝕖","epar":"⋕","eparsl":"⧣","eplus":"⩱","epsi":"ε","Epsilon":"Ε","epsilon":"ε","epsiv":"ϵ","eqcirc":"≖","eqcolon":"≕","eqsim":"≂","eqslantgtr":"⪖","eqslantless":"⪕","Equal":"⩵","equals":"=","EqualTilde":"≂","equest":"≟","Equilibrium":"⇌","equiv":"≡","equivDD":"⩸","eqvparsl":"⧥","erarr":"⥱","erDot":"≓","escr":"ℯ","Escr":"ℰ","esdot":"≐","Esim":"⩳","esim":"≂","Eta":"Η","eta":"η","ETH":"Ð","eth":"ð","Euml":"Ë","euml":"ë","euro":"€","excl":"!","exist":"∃","Exists":"∃","expectation":"ℰ","exponentiale":"ⅇ","ExponentialE":"ⅇ","fallingdotseq":"≒","Fcy":"Ф","fcy":"ф","female":"♀","ffilig":"ﬃ","fflig":"ﬀ","ffllig":"ﬄ","Ffr":"𝔉","ffr":"𝔣","filig":"ﬁ","FilledSmallSquare":"◼","FilledVerySmallSquare":"▪","fjlig":"fj","flat":"♭","fllig":"ﬂ","fltns":"▱","fnof":"ƒ","Fopf":"𝔽","fopf":"𝕗","forall":"∀","ForAll":"∀","fork":"⋔","forkv":"⫙","Fouriertrf":"ℱ","fpartint":"⨍","frac12":"½","frac13":"⅓","frac14":"¼","frac15":"⅕","frac16":"⅙","frac18":"⅛","frac23":"⅔","frac25":"⅖","frac34":"¾","frac35":"⅗","frac38":"⅜","frac45":"⅘","frac56":"⅚","frac58":"⅝","frac78":"⅞","frasl":"⁄","frown":"⌢","fscr":"𝒻","Fscr":"ℱ","gacute":"ǵ","Gamma":"Γ","gamma":"γ","Gammad":"Ϝ","gammad":"ϝ","gap":"⪆","Gbreve":"Ğ","gbreve":"ğ","Gcedil":"Ģ","Gcirc":"Ĝ","gcirc":"ĝ","Gcy":"Г","gcy":"г","Gdot":"Ġ","gdot":"ġ","ge":"≥","gE":"≧","gEl":"⪌","gel":"⋛","geq":"≥","geqq":"≧","geqslant":"⩾","gescc":"⪩","ges":"⩾","gesdot":"⪀","gesdoto":"⪂","gesdotol":"⪄","gesl":"⋛︀","gesles":"⪔","Gfr":"𝔊","gfr":"𝔤","gg":"≫","Gg":"⋙","ggg":"⋙","gimel":"ℷ","GJcy":"Ѓ","gjcy":"ѓ","gla":"⪥","gl":"≷","glE":"⪒","glj":"⪤","gnap":"⪊","gnapprox":"⪊","gne":"⪈","gnE":"≩","gneq":"⪈","gneqq":"≩","gnsim":"⋧","Gopf":"𝔾","gopf":"𝕘","grave":"`","GreaterEqual":"≥","GreaterEqualLess":"⋛","GreaterFullEqual":"≧","GreaterGreater":"⪢","GreaterLess":"≷","GreaterSlantEqual":"⩾","GreaterTilde":"≳","Gscr":"𝒢","gscr":"ℊ","gsim":"≳","gsime":"⪎","gsiml":"⪐","gtcc":"⪧","gtcir":"⩺","gt":">","GT":">","Gt":"≫","gtdot":"⋗","gtlPar":"⦕","gtquest":"⩼","gtrapprox":"⪆","gtrarr":"⥸","gtrdot":"⋗","gtreqless":"⋛","gtreqqless":"⪌","gtrless":"≷","gtrsim":"≳","gvertneqq":"≩︀","gvnE":"≩︀","Hacek":"ˇ","hairsp":" ","half":"½","hamilt":"ℋ","HARDcy":"Ъ","hardcy":"ъ","harrcir":"⥈","harr":"↔","hArr":"⇔","harrw":"↭","Hat":"^","hbar":"ℏ","Hcirc":"Ĥ","hcirc":"ĥ","hearts":"♥","heartsuit":"♥","hellip":"…","hercon":"⊹","hfr":"𝔥","Hfr":"ℌ","HilbertSpace":"ℋ","hksearow":"⤥","hkswarow":"⤦","hoarr":"⇿","homtht":"∻","hookleftarrow":"↩","hookrightarrow":"↪","hopf":"𝕙","Hopf":"ℍ","horbar":"―","HorizontalLine":"─","hscr":"𝒽","Hscr":"ℋ","hslash":"ℏ","Hstrok":"Ħ","hstrok":"ħ","HumpDownHump":"≎","HumpEqual":"≏","hybull":"⁃","hyphen":"‐","Iacute":"Í","iacute":"í","ic":"⁣","Icirc":"Î","icirc":"î","Icy":"И","icy":"и","Idot":"İ","IEcy":"Е","iecy":"е","iexcl":"¡","iff":"⇔","ifr":"𝔦","Ifr":"ℑ","Igrave":"Ì","igrave":"ì","ii":"ⅈ","iiiint":"⨌","iiint":"∭","iinfin":"⧜","iiota":"℩","IJlig":"Ĳ","ijlig":"ĳ","Imacr":"Ī","imacr":"ī","image":"ℑ","ImaginaryI":"ⅈ","imagline":"ℐ","imagpart":"ℑ","imath":"ı","Im":"ℑ","imof":"⊷","imped":"Ƶ","Implies":"⇒","incare":"℅","in":"∈","infin":"∞","infintie":"⧝","inodot":"ı","intcal":"⊺","int":"∫","Int":"∬","integers":"ℤ","Integral":"∫","intercal":"⊺","Intersection":"⋂","intlarhk":"⨗","intprod":"⨼","InvisibleComma":"⁣","InvisibleTimes":"⁢","IOcy":"Ё","iocy":"ё","Iogon":"Į","iogon":"į","Iopf":"𝕀","iopf":"𝕚","Iota":"Ι","iota":"ι","iprod":"⨼","iquest":"¿","iscr":"𝒾","Iscr":"ℐ","isin":"∈","isindot":"⋵","isinE":"⋹","isins":"⋴","isinsv":"⋳","isinv":"∈","it":"⁢","Itilde":"Ĩ","itilde":"ĩ","Iukcy":"І","iukcy":"і","Iuml":"Ï","iuml":"ï","Jcirc":"Ĵ","jcirc":"ĵ","Jcy":"Й","jcy":"й","Jfr":"𝔍","jfr":"𝔧","jmath":"ȷ","Jopf":"𝕁","jopf":"𝕛","Jscr":"𝒥","jscr":"𝒿","Jsercy":"Ј","jsercy":"ј","Jukcy":"Є","jukcy":"є","Kappa":"Κ","kappa":"κ","kappav":"ϰ","Kcedil":"Ķ","kcedil":"ķ","Kcy":"К","kcy":"к","Kfr":"𝔎","kfr":"𝔨","kgreen":"ĸ","KHcy":"Х","khcy":"х","KJcy":"Ќ","kjcy":"ќ","Kopf":"𝕂","kopf":"𝕜","Kscr":"𝒦","kscr":"𝓀","lAarr":"⇚","Lacute":"Ĺ","lacute":"ĺ","laemptyv":"⦴","lagran":"ℒ","Lambda":"Λ","lambda":"λ","lang":"⟨","Lang":"⟪","langd":"⦑","langle":"⟨","lap":"⪅","Laplacetrf":"ℒ","laquo":"«","larrb":"⇤","larrbfs":"⤟","larr":"←","Larr":"↞","lArr":"⇐","larrfs":"⤝","larrhk":"↩","larrlp":"↫","larrpl":"⤹","larrsim":"⥳","larrtl":"↢","latail":"⤙","lAtail":"⤛","lat":"⪫","late":"⪭","lates":"⪭︀","lbarr":"⤌","lBarr":"⤎","lbbrk":"❲","lbrace":"{","lbrack":"[","lbrke":"⦋","lbrksld":"⦏","lbrkslu":"⦍","Lcaron":"Ľ","lcaron":"ľ","Lcedil":"Ļ","lcedil":"ļ","lceil":"⌈","lcub":"{","Lcy":"Л","lcy":"л","ldca":"⤶","ldquo":"“","ldquor":"„","ldrdhar":"⥧","ldrushar":"⥋","ldsh":"↲","le":"≤","lE":"≦","LeftAngleBracket":"⟨","LeftArrowBar":"⇤","leftarrow":"←","LeftArrow":"←","Leftarrow":"⇐","LeftArrowRightArrow":"⇆","leftarrowtail":"↢","LeftCeiling":"⌈","LeftDoubleBracket":"⟦","LeftDownTeeVector":"⥡","LeftDownVectorBar":"⥙","LeftDownVector":"⇃","LeftFloor":"⌊","leftharpoondown":"↽","leftharpoonup":"↼","leftleftarrows":"⇇","leftrightarrow":"↔","LeftRightArrow":"↔","Leftrightarrow":"⇔","leftrightarrows":"⇆","leftrightharpoons":"⇋","leftrightsquigarrow":"↭","LeftRightVector":"⥎","LeftTeeArrow":"↤","LeftTee":"⊣","LeftTeeVector":"⥚","leftthreetimes":"⋋","LeftTriangleBar":"⧏","LeftTriangle":"⊲","LeftTriangleEqual":"⊴","LeftUpDownVector":"⥑","LeftUpTeeVector":"⥠","LeftUpVectorBar":"⥘","LeftUpVector":"↿","LeftVectorBar":"⥒","LeftVector":"↼","lEg":"⪋","leg":"⋚","leq":"≤","leqq":"≦","leqslant":"⩽","lescc":"⪨","les":"⩽","lesdot":"⩿","lesdoto":"⪁","lesdotor":"⪃","lesg":"⋚︀","lesges":"⪓","lessapprox":"⪅","lessdot":"⋖","lesseqgtr":"⋚","lesseqqgtr":"⪋","LessEqualGreater":"⋚","LessFullEqual":"≦","LessGreater":"≶","lessgtr":"≶","LessLess":"⪡","lesssim":"≲","LessSlantEqual":"⩽","LessTilde":"≲","lfisht":"⥼","lfloor":"⌊","Lfr":"𝔏","lfr":"𝔩","lg":"≶","lgE":"⪑","lHar":"⥢","lhard":"↽","lharu":"↼","lharul":"⥪","lhblk":"▄","LJcy":"Љ","ljcy":"љ","llarr":"⇇","ll":"≪","Ll":"⋘","llcorner":"⌞","Lleftarrow":"⇚","llhard":"⥫","lltri":"◺","Lmidot":"Ŀ","lmidot":"ŀ","lmoustache":"⎰","lmoust":"⎰","lnap":"⪉","lnapprox":"⪉","lne":"⪇","lnE":"≨","lneq":"⪇","lneqq":"≨","lnsim":"⋦","loang":"⟬","loarr":"⇽","lobrk":"⟦","longleftarrow":"⟵","LongLeftArrow":"⟵","Longleftarrow":"⟸","longleftrightarrow":"⟷","LongLeftRightArrow":"⟷","Longleftrightarrow":"⟺","longmapsto":"⟼","longrightarrow":"⟶","LongRightArrow":"⟶","Longrightarrow":"⟹","looparrowleft":"↫","looparrowright":"↬","lopar":"⦅","Lopf":"𝕃","lopf":"𝕝","loplus":"⨭","lotimes":"⨴","lowast":"∗","lowbar":"_","LowerLeftArrow":"↙","LowerRightArrow":"↘","loz":"◊","lozenge":"◊","lozf":"⧫","lpar":"(","lparlt":"⦓","lrarr":"⇆","lrcorner":"⌟","lrhar":"⇋","lrhard":"⥭","lrm":"‎","lrtri":"⊿","lsaquo":"‹","lscr":"𝓁","Lscr":"ℒ","lsh":"↰","Lsh":"↰","lsim":"≲","lsime":"⪍","lsimg":"⪏","lsqb":"[","lsquo":"‘","lsquor":"‚","Lstrok":"Ł","lstrok":"ł","ltcc":"⪦","ltcir":"⩹","lt":"<","LT":"<","Lt":"≪","ltdot":"⋖","lthree":"⋋","ltimes":"⋉","ltlarr":"⥶","ltquest":"⩻","ltri":"◃","ltrie":"⊴","ltrif":"◂","ltrPar":"⦖","lurdshar":"⥊","luruhar":"⥦","lvertneqq":"≨︀","lvnE":"≨︀","macr":"¯","male":"♂","malt":"✠","maltese":"✠","Map":"⤅","map":"↦","mapsto":"↦","mapstodown":"↧","mapstoleft":"↤","mapstoup":"↥","marker":"▮","mcomma":"⨩","Mcy":"М","mcy":"м","mdash":"—","mDDot":"∺","measuredangle":"∡","MediumSpace":" ","Mellintrf":"ℳ","Mfr":"𝔐","mfr":"𝔪","mho":"℧","micro":"µ","midast":"*","midcir":"⫰","mid":"∣","middot":"·","minusb":"⊟","minus":"−","minusd":"∸","minusdu":"⨪","MinusPlus":"∓","mlcp":"⫛","mldr":"…","mnplus":"∓","models":"⊧","Mopf":"𝕄","mopf":"𝕞","mp":"∓","mscr":"𝓂","Mscr":"ℳ","mstpos":"∾","Mu":"Μ","mu":"μ","multimap":"⊸","mumap":"⊸","nabla":"∇","Nacute":"Ń","nacute":"ń","nang":"∠⃒","nap":"≉","napE":"⩰̸","napid":"≋̸","napos":"ŉ","napprox":"≉","natural":"♮","naturals":"ℕ","natur":"♮","nbsp":" ","nbump":"≎̸","nbumpe":"≏̸","ncap":"⩃","Ncaron":"Ň","ncaron":"ň","Ncedil":"Ņ","ncedil":"ņ","ncong":"≇","ncongdot":"⩭̸","ncup":"⩂","Ncy":"Н","ncy":"н","ndash":"–","nearhk":"⤤","nearr":"↗","neArr":"⇗","nearrow":"↗","ne":"≠","nedot":"≐̸","NegativeMediumSpace":"​","NegativeThickSpace":"​","NegativeThinSpace":"​","NegativeVeryThinSpace":"​","nequiv":"≢","nesear":"⤨","nesim":"≂̸","NestedGreaterGreater":"≫","NestedLessLess":"≪","NewLine":"\n","nexist":"∄","nexists":"∄","Nfr":"𝔑","nfr":"𝔫","ngE":"≧̸","nge":"≱","ngeq":"≱","ngeqq":"≧̸","ngeqslant":"⩾̸","nges":"⩾̸","nGg":"⋙̸","ngsim":"≵","nGt":"≫⃒","ngt":"≯","ngtr":"≯","nGtv":"≫̸","nharr":"↮","nhArr":"⇎","nhpar":"⫲","ni":"∋","nis":"⋼","nisd":"⋺","niv":"∋","NJcy":"Њ","njcy":"њ","nlarr":"↚","nlArr":"⇍","nldr":"‥","nlE":"≦̸","nle":"≰","nleftarrow":"↚","nLeftarrow":"⇍","nleftrightarrow":"↮","nLeftrightarrow":"⇎","nleq":"≰","nleqq":"≦̸","nleqslant":"⩽̸","nles":"⩽̸","nless":"≮","nLl":"⋘̸","nlsim":"≴","nLt":"≪⃒","nlt":"≮","nltri":"⋪","nltrie":"⋬","nLtv":"≪̸","nmid":"∤","NoBreak":"⁠","NonBreakingSpace":" ","nopf":"𝕟","Nopf":"ℕ","Not":"⫬","not":"¬","NotCongruent":"≢","NotCupCap":"≭","NotDoubleVerticalBar":"∦","NotElement":"∉","NotEqual":"≠","NotEqualTilde":"≂̸","NotExists":"∄","NotGreater":"≯","NotGreaterEqual":"≱","NotGreaterFullEqual":"≧̸","NotGreaterGreater":"≫̸","NotGreaterLess":"≹","NotGreaterSlantEqual":"⩾̸","NotGreaterTilde":"≵","NotHumpDownHump":"≎̸","NotHumpEqual":"≏̸","notin":"∉","notindot":"⋵̸","notinE":"⋹̸","notinva":"∉","notinvb":"⋷","notinvc":"⋶","NotLeftTriangleBar":"⧏̸","NotLeftTriangle":"⋪","NotLeftTriangleEqual":"⋬","NotLess":"≮","NotLessEqual":"≰","NotLessGreater":"≸","NotLessLess":"≪̸","NotLessSlantEqual":"⩽̸","NotLessTilde":"≴","NotNestedGreaterGreater":"⪢̸","NotNestedLessLess":"⪡̸","notni":"∌","notniva":"∌","notnivb":"⋾","notnivc":"⋽","NotPrecedes":"⊀","NotPrecedesEqual":"⪯̸","NotPrecedesSlantEqual":"⋠","NotReverseElement":"∌","NotRightTriangleBar":"⧐̸","NotRightTriangle":"⋫","NotRightTriangleEqual":"⋭","NotSquareSubset":"⊏̸","NotSquareSubsetEqual":"⋢","NotSquareSuperset":"⊐̸","NotSquareSupersetEqual":"⋣","NotSubset":"⊂⃒","NotSubsetEqual":"⊈","NotSucceeds":"⊁","NotSucceedsEqual":"⪰̸","NotSucceedsSlantEqual":"⋡","NotSucceedsTilde":"≿̸","NotSuperset":"⊃⃒","NotSupersetEqual":"⊉","NotTilde":"≁","NotTildeEqual":"≄","NotTildeFullEqual":"≇","NotTildeTilde":"≉","NotVerticalBar":"∤","nparallel":"∦","npar":"∦","nparsl":"⫽⃥","npart":"∂̸","npolint":"⨔","npr":"⊀","nprcue":"⋠","nprec":"⊀","npreceq":"⪯̸","npre":"⪯̸","nrarrc":"⤳̸","nrarr":"↛","nrArr":"⇏","nrarrw":"↝̸","nrightarrow":"↛","nRightarrow":"⇏","nrtri":"⋫","nrtrie":"⋭","nsc":"⊁","nsccue":"⋡","nsce":"⪰̸","Nscr":"𝒩","nscr":"𝓃","nshortmid":"∤","nshortparallel":"∦","nsim":"≁","nsime":"≄","nsimeq":"≄","nsmid":"∤","nspar":"∦","nsqsube":"⋢","nsqsupe":"⋣","nsub":"⊄","nsubE":"⫅̸","nsube":"⊈","nsubset":"⊂⃒","nsubseteq":"⊈","nsubseteqq":"⫅̸","nsucc":"⊁","nsucceq":"⪰̸","nsup":"⊅","nsupE":"⫆̸","nsupe":"⊉","nsupset":"⊃⃒","nsupseteq":"⊉","nsupseteqq":"⫆̸","ntgl":"≹","Ntilde":"Ñ","ntilde":"ñ","ntlg":"≸","ntriangleleft":"⋪","ntrianglelefteq":"⋬","ntriangleright":"⋫","ntrianglerighteq":"⋭","Nu":"Ν","nu":"ν","num":"#","numero":"№","numsp":" ","nvap":"≍⃒","nvdash":"⊬","nvDash":"⊭","nVdash":"⊮","nVDash":"⊯","nvge":"≥⃒","nvgt":">⃒","nvHarr":"⤄","nvinfin":"⧞","nvlArr":"⤂","nvle":"≤⃒","nvlt":"<⃒","nvltrie":"⊴⃒","nvrArr":"⤃","nvrtrie":"⊵⃒","nvsim":"∼⃒","nwarhk":"⤣","nwarr":"↖","nwArr":"⇖","nwarrow":"↖","nwnear":"⤧","Oacute":"Ó","oacute":"ó","oast":"⊛","Ocirc":"Ô","ocirc":"ô","ocir":"⊚","Ocy":"О","ocy":"о","odash":"⊝","Odblac":"Ő","odblac":"ő","odiv":"⨸","odot":"⊙","odsold":"⦼","OElig":"Œ","oelig":"œ","ofcir":"⦿","Ofr":"𝔒","ofr":"𝔬","ogon":"˛","Ograve":"Ò","ograve":"ò","ogt":"⧁","ohbar":"⦵","ohm":"Ω","oint":"∮","olarr":"↺","olcir":"⦾","olcross":"⦻","oline":"‾","olt":"⧀","Omacr":"Ō","omacr":"ō","Omega":"Ω","omega":"ω","Omicron":"Ο","omicron":"ο","omid":"⦶","ominus":"⊖","Oopf":"𝕆","oopf":"𝕠","opar":"⦷","OpenCurlyDoubleQuote":"“","OpenCurlyQuote":"‘","operp":"⦹","oplus":"⊕","orarr":"↻","Or":"⩔","or":"∨","ord":"⩝","order":"ℴ","orderof":"ℴ","ordf":"ª","ordm":"º","origof":"⊶","oror":"⩖","orslope":"⩗","orv":"⩛","oS":"Ⓢ","Oscr":"𝒪","oscr":"ℴ","Oslash":"Ø","oslash":"ø","osol":"⊘","Otilde":"Õ","otilde":"õ","otimesas":"⨶","Otimes":"⨷","otimes":"⊗","Ouml":"Ö","ouml":"ö","ovbar":"⌽","OverBar":"‾","OverBrace":"⏞","OverBracket":"⎴","OverParenthesis":"⏜","para":"¶","parallel":"∥","par":"∥","parsim":"⫳","parsl":"⫽","part":"∂","PartialD":"∂","Pcy":"П","pcy":"п","percnt":"%","period":".","permil":"‰","perp":"⊥","pertenk":"‱","Pfr":"𝔓","pfr":"𝔭","Phi":"Φ","phi":"φ","phiv":"ϕ","phmmat":"ℳ","phone":"☎","Pi":"Π","pi":"π","pitchfork":"⋔","piv":"ϖ","planck":"ℏ","planckh":"ℎ","plankv":"ℏ","plusacir":"⨣","plusb":"⊞","pluscir":"⨢","plus":"+","plusdo":"∔","plusdu":"⨥","pluse":"⩲","PlusMinus":"±","plusmn":"±","plussim":"⨦","plustwo":"⨧","pm":"±","Poincareplane":"ℌ","pointint":"⨕","popf":"𝕡","Popf":"ℙ","pound":"£","prap":"⪷","Pr":"⪻","pr":"≺","prcue":"≼","precapprox":"⪷","prec":"≺","preccurlyeq":"≼","Precedes":"≺","PrecedesEqual":"⪯","PrecedesSlantEqual":"≼","PrecedesTilde":"≾","preceq":"⪯","precnapprox":"⪹","precneqq":"⪵","precnsim":"⋨","pre":"⪯","prE":"⪳","precsim":"≾","prime":"′","Prime":"″","primes":"ℙ","prnap":"⪹","prnE":"⪵","prnsim":"⋨","prod":"∏","Product":"∏","profalar":"⌮","profline":"⌒","profsurf":"⌓","prop":"∝","Proportional":"∝","Proportion":"∷","propto":"∝","prsim":"≾","prurel":"⊰","Pscr":"𝒫","pscr":"𝓅","Psi":"Ψ","psi":"ψ","puncsp":" ","Qfr":"𝔔","qfr":"𝔮","qint":"⨌","qopf":"𝕢","Qopf":"ℚ","qprime":"⁗","Qscr":"𝒬","qscr":"𝓆","quaternions":"ℍ","quatint":"⨖","quest":"?","questeq":"≟","quot":"\"","QUOT":"\"","rAarr":"⇛","race":"∽̱","Racute":"Ŕ","racute":"ŕ","radic":"√","raemptyv":"⦳","rang":"⟩","Rang":"⟫","rangd":"⦒","range":"⦥","rangle":"⟩","raquo":"»","rarrap":"⥵","rarrb":"⇥","rarrbfs":"⤠","rarrc":"⤳","rarr":"→","Rarr":"↠","rArr":"⇒","rarrfs":"⤞","rarrhk":"↪","rarrlp":"↬","rarrpl":"⥅","rarrsim":"⥴","Rarrtl":"⤖","rarrtl":"↣","rarrw":"↝","ratail":"⤚","rAtail":"⤜","ratio":"∶","rationals":"ℚ","rbarr":"⤍","rBarr":"⤏","RBarr":"⤐","rbbrk":"❳","rbrace":"}","rbrack":"]","rbrke":"⦌","rbrksld":"⦎","rbrkslu":"⦐","Rcaron":"Ř","rcaron":"ř","Rcedil":"Ŗ","rcedil":"ŗ","rceil":"⌉","rcub":"}","Rcy":"Р","rcy":"р","rdca":"⤷","rdldhar":"⥩","rdquo":"”","rdquor":"”","rdsh":"↳","real":"ℜ","realine":"ℛ","realpart":"ℜ","reals":"ℝ","Re":"ℜ","rect":"▭","reg":"®","REG":"®","ReverseElement":"∋","ReverseEquilibrium":"⇋","ReverseUpEquilibrium":"⥯","rfisht":"⥽","rfloor":"⌋","rfr":"𝔯","Rfr":"ℜ","rHar":"⥤","rhard":"⇁","rharu":"⇀","rharul":"⥬","Rho":"Ρ","rho":"ρ","rhov":"ϱ","RightAngleBracket":"⟩","RightArrowBar":"⇥","rightarrow":"→","RightArrow":"→","Rightarrow":"⇒","RightArrowLeftArrow":"⇄","rightarrowtail":"↣","RightCeiling":"⌉","RightDoubleBracket":"⟧","RightDownTeeVector":"⥝","RightDownVectorBar":"⥕","RightDownVector":"⇂","RightFloor":"⌋","rightharpoondown":"⇁","rightharpoonup":"⇀","rightleftarrows":"⇄","rightleftharpoons":"⇌","rightrightarrows":"⇉","rightsquigarrow":"↝","RightTeeArrow":"↦","RightTee":"⊢","RightTeeVector":"⥛","rightthreetimes":"⋌","RightTriangleBar":"⧐","RightTriangle":"⊳","RightTriangleEqual":"⊵","RightUpDownVector":"⥏","RightUpTeeVector":"⥜","RightUpVectorBar":"⥔","RightUpVector":"↾","RightVectorBar":"⥓","RightVector":"⇀","ring":"˚","risingdotseq":"≓","rlarr":"⇄","rlhar":"⇌","rlm":"‏","rmoustache":"⎱","rmoust":"⎱","rnmid":"⫮","roang":"⟭","roarr":"⇾","robrk":"⟧","ropar":"⦆","ropf":"𝕣","Ropf":"ℝ","roplus":"⨮","rotimes":"⨵","RoundImplies":"⥰","rpar":")","rpargt":"⦔","rppolint":"⨒","rrarr":"⇉","Rrightarrow":"⇛","rsaquo":"›","rscr":"𝓇","Rscr":"ℛ","rsh":"↱","Rsh":"↱","rsqb":"]","rsquo":"’","rsquor":"’","rthree":"⋌","rtimes":"⋊","rtri":"▹","rtrie":"⊵","rtrif":"▸","rtriltri":"⧎","RuleDelayed":"⧴","ruluhar":"⥨","rx":"℞","Sacute":"Ś","sacute":"ś","sbquo":"‚","scap":"⪸","Scaron":"Š","scaron":"š","Sc":"⪼","sc":"≻","sccue":"≽","sce":"⪰","scE":"⪴","Scedil":"Ş","scedil":"ş","Scirc":"Ŝ","scirc":"ŝ","scnap":"⪺","scnE":"⪶","scnsim":"⋩","scpolint":"⨓","scsim":"≿","Scy":"С","scy":"с","sdotb":"⊡","sdot":"⋅","sdote":"⩦","searhk":"⤥","searr":"↘","seArr":"⇘","searrow":"↘","sect":"§","semi":";","seswar":"⤩","setminus":"∖","setmn":"∖","sext":"✶","Sfr":"𝔖","sfr":"𝔰","sfrown":"⌢","sharp":"♯","SHCHcy":"Щ","shchcy":"щ","SHcy":"Ш","shcy":"ш","ShortDownArrow":"↓","ShortLeftArrow":"←","shortmid":"∣","shortparallel":"∥","ShortRightArrow":"→","ShortUpArrow":"↑","shy":"­","Sigma":"Σ","sigma":"σ","sigmaf":"ς","sigmav":"ς","sim":"∼","simdot":"⩪","sime":"≃","simeq":"≃","simg":"⪞","simgE":"⪠","siml":"⪝","simlE":"⪟","simne":"≆","simplus":"⨤","simrarr":"⥲","slarr":"←","SmallCircle":"∘","smallsetminus":"∖","smashp":"⨳","smeparsl":"⧤","smid":"∣","smile":"⌣","smt":"⪪","smte":"⪬","smtes":"⪬︀","SOFTcy":"Ь","softcy":"ь","solbar":"⌿","solb":"⧄","sol":"/","Sopf":"𝕊","sopf":"𝕤","spades":"♠","spadesuit":"♠","spar":"∥","sqcap":"⊓","sqcaps":"⊓︀","sqcup":"⊔","sqcups":"⊔︀","Sqrt":"√","sqsub":"⊏","sqsube":"⊑","sqsubset":"⊏","sqsubseteq":"⊑","sqsup":"⊐","sqsupe":"⊒","sqsupset":"⊐","sqsupseteq":"⊒","square":"□","Square":"□","SquareIntersection":"⊓","SquareSubset":"⊏","SquareSubsetEqual":"⊑","SquareSuperset":"⊐","SquareSupersetEqual":"⊒","SquareUnion":"⊔","squarf":"▪","squ":"□","squf":"▪","srarr":"→","Sscr":"𝒮","sscr":"𝓈","ssetmn":"∖","ssmile":"⌣","sstarf":"⋆","Star":"⋆","star":"☆","starf":"★","straightepsilon":"ϵ","straightphi":"ϕ","strns":"¯","sub":"⊂","Sub":"⋐","subdot":"⪽","subE":"⫅","sube":"⊆","subedot":"⫃","submult":"⫁","subnE":"⫋","subne":"⊊","subplus":"⪿","subrarr":"⥹","subset":"⊂","Subset":"⋐","subseteq":"⊆","subseteqq":"⫅","SubsetEqual":"⊆","subsetneq":"⊊","subsetneqq":"⫋","subsim":"⫇","subsub":"⫕","subsup":"⫓","succapprox":"⪸","succ":"≻","succcurlyeq":"≽","Succeeds":"≻","SucceedsEqual":"⪰","SucceedsSlantEqual":"≽","SucceedsTilde":"≿","succeq":"⪰","succnapprox":"⪺","succneqq":"⪶","succnsim":"⋩","succsim":"≿","SuchThat":"∋","sum":"∑","Sum":"∑","sung":"♪","sup1":"¹","sup2":"²","sup3":"³","sup":"⊃","Sup":"⋑","supdot":"⪾","supdsub":"⫘","supE":"⫆","supe":"⊇","supedot":"⫄","Superset":"⊃","SupersetEqual":"⊇","suphsol":"⟉","suphsub":"⫗","suplarr":"⥻","supmult":"⫂","supnE":"⫌","supne":"⊋","supplus":"⫀","supset":"⊃","Supset":"⋑","supseteq":"⊇","supseteqq":"⫆","supsetneq":"⊋","supsetneqq":"⫌","supsim":"⫈","supsub":"⫔","supsup":"⫖","swarhk":"⤦","swarr":"↙","swArr":"⇙","swarrow":"↙","swnwar":"⤪","szlig":"ß","Tab":"\t","target":"⌖","Tau":"Τ","tau":"τ","tbrk":"⎴","Tcaron":"Ť","tcaron":"ť","Tcedil":"Ţ","tcedil":"ţ","Tcy":"Т","tcy":"т","tdot":"⃛","telrec":"⌕","Tfr":"𝔗","tfr":"𝔱","there4":"∴","therefore":"∴","Therefore":"∴","Theta":"Θ","theta":"θ","thetasym":"ϑ","thetav":"ϑ","thickapprox":"≈","thicksim":"∼","ThickSpace":"  ","ThinSpace":" ","thinsp":" ","thkap":"≈","thksim":"∼","THORN":"Þ","thorn":"þ","tilde":"˜","Tilde":"∼","TildeEqual":"≃","TildeFullEqual":"≅","TildeTilde":"≈","timesbar":"⨱","timesb":"⊠","times":"×","timesd":"⨰","tint":"∭","toea":"⤨","topbot":"⌶","topcir":"⫱","top":"⊤","Topf":"𝕋","topf":"𝕥","topfork":"⫚","tosa":"⤩","tprime":"‴","trade":"™","TRADE":"™","triangle":"▵","triangledown":"▿","triangleleft":"◃","trianglelefteq":"⊴","triangleq":"≜","triangleright":"▹","trianglerighteq":"⊵","tridot":"◬","trie":"≜","triminus":"⨺","TripleDot":"⃛","triplus":"⨹","trisb":"⧍","tritime":"⨻","trpezium":"⏢","Tscr":"𝒯","tscr":"𝓉","TScy":"Ц","tscy":"ц","TSHcy":"Ћ","tshcy":"ћ","Tstrok":"Ŧ","tstrok":"ŧ","twixt":"≬","twoheadleftarrow":"↞","twoheadrightarrow":"↠","Uacute":"Ú","uacute":"ú","uarr":"↑","Uarr":"↟","uArr":"⇑","Uarrocir":"⥉","Ubrcy":"Ў","ubrcy":"ў","Ubreve":"Ŭ","ubreve":"ŭ","Ucirc":"Û","ucirc":"û","Ucy":"У","ucy":"у","udarr":"⇅","Udblac":"Ű","udblac":"ű","udhar":"⥮","ufisht":"⥾","Ufr":"𝔘","ufr":"𝔲","Ugrave":"Ù","ugrave":"ù","uHar":"⥣","uharl":"↿","uharr":"↾","uhblk":"▀","ulcorn":"⌜","ulcorner":"⌜","ulcrop":"⌏","ultri":"◸","Umacr":"Ū","umacr":"ū","uml":"¨","UnderBar":"_","UnderBrace":"⏟","UnderBracket":"⎵","UnderParenthesis":"⏝","Union":"⋃","UnionPlus":"⊎","Uogon":"Ų","uogon":"ų","Uopf":"𝕌","uopf":"𝕦","UpArrowBar":"⤒","uparrow":"↑","UpArrow":"↑","Uparrow":"⇑","UpArrowDownArrow":"⇅","updownarrow":"↕","UpDownArrow":"↕","Updownarrow":"⇕","UpEquilibrium":"⥮","upharpoonleft":"↿","upharpoonright":"↾","uplus":"⊎","UpperLeftArrow":"↖","UpperRightArrow":"↗","upsi":"υ","Upsi":"ϒ","upsih":"ϒ","Upsilon":"Υ","upsilon":"υ","UpTeeArrow":"↥","UpTee":"⊥","upuparrows":"⇈","urcorn":"⌝","urcorner":"⌝","urcrop":"⌎","Uring":"Ů","uring":"ů","urtri":"◹","Uscr":"𝒰","uscr":"𝓊","utdot":"⋰","Utilde":"Ũ","utilde":"ũ","utri":"▵","utrif":"▴","uuarr":"⇈","Uuml":"Ü","uuml":"ü","uwangle":"⦧","vangrt":"⦜","varepsilon":"ϵ","varkappa":"ϰ","varnothing":"∅","varphi":"ϕ","varpi":"ϖ","varpropto":"∝","varr":"↕","vArr":"⇕","varrho":"ϱ","varsigma":"ς","varsubsetneq":"⊊︀","varsubsetneqq":"⫋︀","varsupsetneq":"⊋︀","varsupsetneqq":"⫌︀","vartheta":"ϑ","vartriangleleft":"⊲","vartriangleright":"⊳","vBar":"⫨","Vbar":"⫫","vBarv":"⫩","Vcy":"В","vcy":"в","vdash":"⊢","vDash":"⊨","Vdash":"⊩","VDash":"⊫","Vdashl":"⫦","veebar":"⊻","vee":"∨","Vee":"⋁","veeeq":"≚","vellip":"⋮","verbar":"|","Verbar":"‖","vert":"|","Vert":"‖","VerticalBar":"∣","VerticalLine":"|","VerticalSeparator":"❘","VerticalTilde":"≀","VeryThinSpace":" ","Vfr":"𝔙","vfr":"𝔳","vltri":"⊲","vnsub":"⊂⃒","vnsup":"⊃⃒","Vopf":"𝕍","vopf":"𝕧","vprop":"∝","vrtri":"⊳","Vscr":"𝒱","vscr":"𝓋","vsubnE":"⫋︀","vsubne":"⊊︀","vsupnE":"⫌︀","vsupne":"⊋︀","Vvdash":"⊪","vzigzag":"⦚","Wcirc":"Ŵ","wcirc":"ŵ","wedbar":"⩟","wedge":"∧","Wedge":"⋀","wedgeq":"≙","weierp":"℘","Wfr":"𝔚","wfr":"𝔴","Wopf":"𝕎","wopf":"𝕨","wp":"℘","wr":"≀","wreath":"≀","Wscr":"𝒲","wscr":"𝓌","xcap":"⋂","xcirc":"◯","xcup":"⋃","xdtri":"▽","Xfr":"𝔛","xfr":"𝔵","xharr":"⟷","xhArr":"⟺","Xi":"Ξ","xi":"ξ","xlarr":"⟵","xlArr":"⟸","xmap":"⟼","xnis":"⋻","xodot":"⨀","Xopf":"𝕏","xopf":"𝕩","xoplus":"⨁","xotime":"⨂","xrarr":"⟶","xrArr":"⟹","Xscr":"𝒳","xscr":"𝓍","xsqcup":"⨆","xuplus":"⨄","xutri":"△","xvee":"⋁","xwedge":"⋀","Yacute":"Ý","yacute":"ý","YAcy":"Я","yacy":"я","Ycirc":"Ŷ","ycirc":"ŷ","Ycy":"Ы","ycy":"ы","yen":"¥","Yfr":"𝔜","yfr":"𝔶","YIcy":"Ї","yicy":"ї","Yopf":"𝕐","yopf":"𝕪","Yscr":"𝒴","yscr":"𝓎","YUcy":"Ю","yucy":"ю","yuml":"ÿ","Yuml":"Ÿ","Zacute":"Ź","zacute":"ź","Zcaron":"Ž","zcaron":"ž","Zcy":"З","zcy":"з","Zdot":"Ż","zdot":"ż","zeetrf":"ℨ","ZeroWidthSpace":"​","Zeta":"Ζ","zeta":"ζ","zfr":"𝔷","Zfr":"ℨ","ZHcy":"Ж","zhcy":"ж","zigrarr":"⇝","zopf":"𝕫","Zopf":"ℤ","Zscr":"𝒵","zscr":"𝓏","zwj":"‍","zwnj":"‌"}

},{}],8:[function(require,module,exports){
module.exports={"Aacute":"Á","aacute":"á","Acirc":"Â","acirc":"â","acute":"´","AElig":"Æ","aelig":"æ","Agrave":"À","agrave":"à","amp":"&","AMP":"&","Aring":"Å","aring":"å","Atilde":"Ã","atilde":"ã","Auml":"Ä","auml":"ä","brvbar":"¦","Ccedil":"Ç","ccedil":"ç","cedil":"¸","cent":"¢","copy":"©","COPY":"©","curren":"¤","deg":"°","divide":"÷","Eacute":"É","eacute":"é","Ecirc":"Ê","ecirc":"ê","Egrave":"È","egrave":"è","ETH":"Ð","eth":"ð","Euml":"Ë","euml":"ë","frac12":"½","frac14":"¼","frac34":"¾","gt":">","GT":">","Iacute":"Í","iacute":"í","Icirc":"Î","icirc":"î","iexcl":"¡","Igrave":"Ì","igrave":"ì","iquest":"¿","Iuml":"Ï","iuml":"ï","laquo":"«","lt":"<","LT":"<","macr":"¯","micro":"µ","middot":"·","nbsp":" ","not":"¬","Ntilde":"Ñ","ntilde":"ñ","Oacute":"Ó","oacute":"ó","Ocirc":"Ô","ocirc":"ô","Ograve":"Ò","ograve":"ò","ordf":"ª","ordm":"º","Oslash":"Ø","oslash":"ø","Otilde":"Õ","otilde":"õ","Ouml":"Ö","ouml":"ö","para":"¶","plusmn":"±","pound":"£","quot":"\"","QUOT":"\"","raquo":"»","reg":"®","REG":"®","sect":"§","shy":"­","sup1":"¹","sup2":"²","sup3":"³","szlig":"ß","THORN":"Þ","thorn":"þ","times":"×","Uacute":"Ú","uacute":"ú","Ucirc":"Û","ucirc":"û","Ugrave":"Ù","ugrave":"ù","uml":"¨","Uuml":"Ü","uuml":"ü","Yacute":"Ý","yacute":"ý","yen":"¥","yuml":"ÿ"}

},{}],9:[function(require,module,exports){
module.exports={"amp":"&","apos":"'","gt":">","lt":"<","quot":"\""}

},{}],10:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    var _a;
    let time;
    let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],11:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);

},{"./Source":10}],12:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./APIWrapper"), exports);

},{"./APIWrapper":1,"./base":11,"./models":49}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],15:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],16:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],17:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],18:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],19:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],20:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],21:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],22:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],23:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],24:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],25:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],26:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],27:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],28:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],29:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],30:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);

},{"./Button":16,"./Form":17,"./FormRow":18,"./Header":19,"./InputField":20,"./Label":21,"./Link":22,"./MultilineLabel":23,"./NavigationButton":24,"./OAuthButton":25,"./Section":26,"./Select":27,"./Switch":28,"./WebViewButton":29}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],34:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],35:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],36:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],37:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],38:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],39:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],40:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],41:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],42:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],43:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],45:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],47:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],48:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],49:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./TrackObject"), exports);
__exportStar(require("./OAuth"), exports);
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./DynamicUI"), exports);

},{"./Chapter":13,"./ChapterDetails":14,"./Constants":15,"./DynamicUI":30,"./HomeSection":31,"./Languages":32,"./Manga":33,"./MangaTile":34,"./MangaUpdate":35,"./OAuth":36,"./PagedResults":37,"./RequestHeaders":38,"./RequestInterceptor":39,"./RequestManager":40,"./RequestObject":41,"./ResponseObject":42,"./SearchRequest":43,"./SourceInfo":44,"./SourceStateManager":45,"./SourceTag":46,"./TagSection":47,"./TrackObject":48}],50:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaDex = exports.MangaDexInfo = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
var paperback_extensions_common_1 = require("paperback-extensions-common");
var entities_1 = __importDefault(require("entities"));
var tag_json_1 = __importDefault(require("./external/tag.json"));
var MANGADEX_DOMAIN = 'https://mangadex.org';
var MANGADEX_API = 'https://api.mangadex.org';
var COVER_BASE_URL = 'https://uploads.mangadex.org/covers';
exports.MangaDexInfo = {
    author: 'nar1n',
    description: 'Extension that pulls manga from MangaDex',
    icon: 'icon.png',
    name: 'MangaDex',
    version: '1.1.0',
    authorWebsite: 'https://github.com/nar1n',
    websiteBaseURL: MANGADEX_DOMAIN,
    contentRating: paperback_extensions_common_1.ContentRating.MATURE,
    language: paperback_extensions_common_1.LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: 'Recommended',
            type: paperback_extensions_common_1.TagType.BLUE,
        },
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        }
    ],
};
var MangaDex = /** @class */ (function (_super) {
    __extends(MangaDex, _super);
    function MangaDex() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.languageMapping = {
            'en': 'gb',
            'pt-br': 'pt',
            'ru': 'ru',
            'fr': 'fr',
            'es-la': 'es',
            'pl': 'pl',
            'tr': 'tr',
            'it': 'it',
            'es': 'es',
            'id': 'id',
            'vi': 'vn',
            'hu': 'hu',
            'zh': 'cn',
            'ar': 'sa',
            'de': 'de',
            'zh-hk': 'hk',
            'ca': 'es',
            'th': 'th',
            'bg': 'bg',
            'fa': 'ir',
            'uk': 'ua',
            'mn': 'mn',
            'he': 'il',
            'ro': 'ro',
            'ms': 'my',
            'tl': 'ph',
            'ja': 'jp',
            'ko': 'kr',
            'hi': 'in',
            'my': 'my',
            'cs': 'cz',
            'pt': 'pt',
            'nl': 'nl',
            'sv': 'se',
            'bn': 'bd',
            'no': 'no',
            'lt': 'lt',
            'sr': 'rs',
            'da': 'dk',
            'fi': 'fi',
        };
        _this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 15000,
        });
        return _this;
    }
    MangaDex.prototype.getMangaShareUrl = function (mangaId) {
        return MANGADEX_DOMAIN + "/title/" + mangaId;
    };
    MangaDex.prototype.globalRequestHeaders = function () {
        return {
            referer: MANGADEX_DOMAIN + "/"
        };
    };
    MangaDex.prototype.getTags = function () {
        var _a;
        var sections = {};
        for (var _i = 0, tagJSON_1 = tag_json_1.default; _i < tagJSON_1.length; _i++) {
            var tag = tagJSON_1[_i];
            var group = tag.data.attributes.group;
            if (sections[group] == null) {
                sections[group] = createTagSection({
                    id: group,
                    label: group.charAt(0).toUpperCase() + group.slice(1),
                    tags: []
                });
            }
            (_a = sections[group]) === null || _a === void 0 ? void 0 : _a.tags.push(createTag({ id: tag.data.id, label: tag.data.attributes.name.en }));
        }
        return Promise.resolve(Object.values(sections));
    };
    MangaDex.prototype.getMangaUUIDs = function (numericIds) {
        return __awaiter(this, void 0, void 0, function () {
            var length, offset, UUIDsDict, request, response, json, _i, json_1, mapping;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        length = numericIds.length;
                        offset = 0;
                        UUIDsDict = {};
                        _a.label = 1;
                    case 1:
                        if (!(offset < length)) return [3 /*break*/, 3];
                        request = createRequestObject({
                            url: MANGADEX_API + "/legacy/mapping",
                            method: 'POST',
                            headers: { 'content-type': 'application/json' },
                            data: {
                                'type': 'manga',
                                'ids': numericIds.slice(offset, offset + 500).map(function (x) { return Number(x); })
                            }
                        });
                        offset += 500;
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 2:
                        response = _a.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        for (_i = 0, json_1 = json; _i < json_1.length; _i++) {
                            mapping = json_1[_i];
                            UUIDsDict[mapping.data.attributes.legacyId] = mapping.data.attributes.newId;
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, UUIDsDict];
                }
            });
        });
    };
    MangaDex.prototype.convertLegacyIdToUUID = function (legacyId) {
        return __awaiter(this, void 0, void 0, function () {
            var uuid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMangaUUIDs([legacyId])];
                    case 1:
                        uuid = (_a.sent())[legacyId];
                        if (uuid != null) {
                            return [2 /*return*/, uuid];
                        }
                        else {
                            throw new Error('Could not convert mangaId to UUID');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MangaDex.prototype.getMDHNodeURL = function (chapterId) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = createRequestObject({
                            url: MANGADEX_API + "/at-home/server/" + chapterId,
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 1:
                        response = _a.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        return [2 /*return*/, json.baseUrl];
                }
            });
        });
    };
    MangaDex.prototype.getCustomListRequestURL = function (listId) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = createRequestObject({
                            url: MANGADEX_API + "/list/" + listId,
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 1:
                        response = _a.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        return [2 /*return*/, MANGADEX_API + "/manga?limit=100&contentRating[]=none&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art&ids[]=" + json.relationships.filter(function (x) { return x.type == 'manga'; }).map(function (x) { return x.id; }).join('&ids[]=')];
                }
            });
        });
    };
    MangaDex.prototype.getMangaDetails = function (mangaId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var newMangaId, request, response, json, mangaDetails, titles, desc, status, tags, _loop_1, _i, _b, tag, author, artist, coverFileName, image;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!mangaId.includes('-')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.convertLegacyIdToUUID(mangaId)];
                    case 1:
                        // Legacy Id
                        newMangaId = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        newMangaId = mangaId;
                        _c.label = 3;
                    case 3:
                        request = createRequestObject({
                            url: MANGADEX_API + "/manga/" + newMangaId + "?includes[]=author&includes[]=artist&includes[]=cover_art",
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 4:
                        response = _c.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        mangaDetails = json.data.attributes;
                        titles = __spreadArray(__spreadArray([], Object.values(mangaDetails.title)), mangaDetails.altTitles.flatMap(function (x) { return Object.values(x); })).map(function (x) { return _this.decodeHTMLEntity(x); });
                        desc = this.decodeHTMLEntity(mangaDetails.description.en).replace(/\[\/{0,1}[bus]\]/g, '') // Get rid of BBcode tags
                        ;
                        status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                        if (mangaDetails.status == 'ongoing') {
                            status = paperback_extensions_common_1.MangaStatus.ONGOING;
                        }
                        tags = [];
                        _loop_1 = function (tag) {
                            var tagName = tag.attributes.name;
                            tags.push(createTag({
                                id: tag.id,
                                label: (_a = Object.keys(tagName).map(function (keys) { return tagName[keys]; })[0]) !== null && _a !== void 0 ? _a : 'Unknown'
                            }));
                        };
                        for (_i = 0, _b = mangaDetails.tags; _i < _b.length; _i++) {
                            tag = _b[_i];
                            _loop_1(tag);
                        }
                        author = json.relationships.filter(function (x) { return x.type == 'author'; }).map(function (x) { return x.attributes.name; }).join(', ');
                        artist = json.relationships.filter(function (x) { return x.type == 'artist'; }).map(function (x) { return x.attributes.name; }).join(', ');
                        coverFileName = json.relationships.filter(function (x) { return x.type == 'cover_art'; }).map(function (x) { var _a; return (_a = x.attributes) === null || _a === void 0 ? void 0 : _a.fileName; })[0];
                        if (coverFileName) {
                            image = COVER_BASE_URL + "/" + newMangaId + "/" + coverFileName;
                        }
                        else {
                            image = 'https://i.imgur.com/6TrIues.jpg';
                        }
                        return [2 /*return*/, createManga({
                                id: mangaId,
                                titles: titles,
                                image: image,
                                author: author,
                                artist: artist,
                                desc: desc,
                                rating: 5,
                                status: status,
                                tags: [createTagSection({
                                        id: 'tags',
                                        label: 'Tags',
                                        tags: tags
                                    })]
                            })];
                }
            });
        });
    };
    MangaDex.prototype.getChapters = function (mangaId) {
        return __awaiter(this, void 0, void 0, function () {
            var newMangaId, chapters, offset, hasResults, request, response, json, _i, _a, chapter, chapterId, chapterDetails, name_1, chapNum, volume, langCode, time, group;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!mangaId.includes('-')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.convertLegacyIdToUUID(mangaId)];
                    case 1:
                        // Legacy Id
                        newMangaId = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        newMangaId = mangaId;
                        _b.label = 3;
                    case 3:
                        chapters = [];
                        offset = 0;
                        hasResults = true;
                        _b.label = 4;
                    case 4:
                        if (!hasResults) return [3 /*break*/, 6];
                        request = createRequestObject({
                            url: MANGADEX_API + "/manga/" + newMangaId + "/feed?limit=500&offset=" + offset + "&includes[]=scanlation_group",
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 5:
                        response = _b.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        offset += 500;
                        if (json.results === undefined)
                            throw new Error("Failed to parse json results for " + newMangaId);
                        for (_i = 0, _a = json.results; _i < _a.length; _i++) {
                            chapter = _a[_i];
                            chapterId = chapter.data.id;
                            chapterDetails = chapter.data.attributes;
                            name_1 = this.decodeHTMLEntity(chapterDetails.title);
                            chapNum = Number(chapterDetails === null || chapterDetails === void 0 ? void 0 : chapterDetails.chapter);
                            volume = Number(chapterDetails === null || chapterDetails === void 0 ? void 0 : chapterDetails.volume);
                            langCode = chapterDetails.translatedLanguage;
                            if (Object.keys(this.languageMapping).includes(langCode)) {
                                langCode = this.languageMapping[chapterDetails.translatedLanguage];
                            }
                            else {
                                langCode = '_unknown';
                            }
                            time = new Date(chapterDetails.publishAt);
                            group = chapter.relationships.filter(function (x) { return x.type == 'scanlation_group'; }).map(function (x) { return x.attributes.name; }).join(', ');
                            chapters.push(createChapter({
                                id: chapterId,
                                mangaId: mangaId,
                                name: name_1,
                                chapNum: chapNum,
                                volume: volume,
                                langCode: langCode,
                                group: group,
                                time: time
                            }));
                        }
                        if (json.total <= offset) {
                            hasResults = false;
                        }
                        return [3 /*break*/, 4];
                    case 6: return [2 /*return*/, chapters];
                }
            });
        });
    };
    MangaDex.prototype.getChapterDetails = function (mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function () {
            var serverUrl, request, response, json, chapterDetails, pages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!chapterId.includes('-')) {
                            // Numeric ID
                            throw new Error('OLD ID: PLEASE REFRESH AND CLEAR ORPHANED CHAPTERS');
                        }
                        return [4 /*yield*/, this.getMDHNodeURL(chapterId)];
                    case 1:
                        serverUrl = _a.sent();
                        request = createRequestObject({
                            url: MANGADEX_API + "/chapter/" + chapterId,
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 2:
                        response = _a.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        chapterDetails = json.data.attributes;
                        pages = chapterDetails.data.map(function (x) { return serverUrl + "/data/" + chapterDetails.hash + "/" + x; });
                        return [2 /*return*/, createChapterDetails({
                                id: chapterId,
                                mangaId: mangaId,
                                pages: pages,
                                longStrip: false
                            })];
                }
            });
        });
    };
    MangaDex.prototype.searchRequest = function (query, metadata) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var offset, results, request, response, json, _i, _c, manga, mangaId, mangaDetails, title, coverFileName, image;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        offset = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.offset) !== null && _a !== void 0 ? _a : 0;
                        results = [];
                        request = createRequestObject({
                            url: MANGADEX_API + "/manga?title=" + encodeURIComponent((_b = query.title) !== null && _b !== void 0 ? _b : '') + "&limit=100&offset=" + offset + "&contentRating[]=none&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art",
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 1:
                        response = _d.sent();
                        if (response.status != 200) {
                            return [2 /*return*/, createPagedResults({ results: results })];
                        }
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        if (json.results === undefined) {
                            throw new Error('Failed to parse json for the given search');
                        }
                        for (_i = 0, _c = json.results; _i < _c.length; _i++) {
                            manga = _c[_i];
                            mangaId = manga.data.id;
                            mangaDetails = manga.data.attributes;
                            title = this.decodeHTMLEntity(Object.values(mangaDetails.title)[0]);
                            coverFileName = manga.relationships.filter(function (x) { return x.type == 'cover_art'; }).map(function (x) { var _a; return (_a = x.attributes) === null || _a === void 0 ? void 0 : _a.fileName; })[0];
                            image = void 0;
                            if (coverFileName) {
                                image = COVER_BASE_URL + "/" + mangaId + "/" + coverFileName + ".256.jpg";
                            }
                            else {
                                image = 'https://i.imgur.com/6TrIues.jpg';
                            }
                            results.push(createMangaTile({
                                id: mangaId,
                                title: createIconText({ text: title }),
                                image: image
                            }));
                        }
                        return [2 /*return*/, createPagedResults({
                                results: results,
                                metadata: { offset: offset + 100 }
                            })];
                }
            });
        });
    };
    MangaDex.prototype.getHomePageSections = function (sectionCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var sections, _a, promises, _loop_2, this_1, _i, sections_1, section;
            var _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = {};
                        _a = createRequestObject;
                        _c = {};
                        return [4 /*yield*/, this.getCustomListRequestURL('8018a70b-1492-4f91-a584-7451d7787f7a')];
                    case 1:
                        sections = [
                            (_b.request = _a.apply(void 0, [(_c.url = _d.sent(),
                                    _c.method = 'GET',
                                    _c)]),
                                _b.section = createHomeSection({
                                    id: 'featured',
                                    title: 'FEATURED TITLES',
                                    view_more: true,
                                }),
                                _b),
                            {
                                request: createRequestObject({
                                    url: MANGADEX_API + "/manga?limit=20&contentRating[]=none&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art",
                                    method: 'GET',
                                }),
                                section: createHomeSection({
                                    id: 'popular',
                                    title: 'POPULAR TITLES',
                                    view_more: true,
                                }),
                            },
                            {
                                request: createRequestObject({
                                    url: MANGADEX_API + "/manga?limit=20&contentRating[]=none&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art&order[updatedAt]=desc",
                                    method: 'GET',
                                }),
                                section: createHomeSection({
                                    id: 'recently_updated',
                                    title: 'RECENTLY UPDATED TITLES',
                                    view_more: true,
                                }),
                            }
                        ];
                        promises = [];
                        _loop_2 = function (section) {
                            // Let the app load empty sections
                            sectionCallback(section.section);
                            // Get the section data
                            promises.push(this_1.requestManager.schedule(section.request, 1).then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                                var json, results, _i, _a, manga, mangaId, mangaDetails, title, coverFileName, image;
                                return __generator(this, function (_b) {
                                    json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                                    results = [];
                                    if (json.results === undefined)
                                        throw new Error("Failed to parse json results for section " + section.section.title);
                                    for (_i = 0, _a = json.results; _i < _a.length; _i++) {
                                        manga = _a[_i];
                                        mangaId = manga.data.id;
                                        mangaDetails = manga.data.attributes;
                                        title = this.decodeHTMLEntity(Object.values(mangaDetails.title)[0]);
                                        coverFileName = manga.relationships.filter(function (x) { return x.type == 'cover_art'; }).map(function (x) { var _a; return (_a = x.attributes) === null || _a === void 0 ? void 0 : _a.fileName; })[0];
                                        image = void 0;
                                        if (coverFileName) {
                                            image = COVER_BASE_URL + "/" + mangaId + "/" + coverFileName + ".256.jpg";
                                        }
                                        else {
                                            image = 'https://i.imgur.com/6TrIues.jpg';
                                        }
                                        results.push(createMangaTile({
                                            id: mangaId,
                                            title: createIconText({ text: title }),
                                            image: image
                                        }));
                                    }
                                    section.section.items = results;
                                    sectionCallback(section.section);
                                    return [2 /*return*/];
                                });
                            }); }));
                        };
                        this_1 = this;
                        for (_i = 0, sections_1 = sections; _i < sections_1.length; _i++) {
                            section = sections_1[_i];
                            _loop_2(section);
                        }
                        // Make sure the function completes
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        // Make sure the function completes
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MangaDex.prototype.getViewMoreItems = function (homepageSectionId, metadata) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var offset, collectedIds, results, url, _c, request, response, json, _i, _d, manga, mangaId, mangaDetails, title, coverFileName, image;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        offset = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.offset) !== null && _a !== void 0 ? _a : 0;
                        collectedIds = (_b = metadata === null || metadata === void 0 ? void 0 : metadata.collectedIds) !== null && _b !== void 0 ? _b : [];
                        results = [];
                        url = '';
                        _c = homepageSectionId;
                        switch (_c) {
                            case 'featured': return [3 /*break*/, 1];
                            case 'popular': return [3 /*break*/, 3];
                            case 'recently_updated': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.getCustomListRequestURL('8018a70b-1492-4f91-a584-7451d7787f7a')];
                    case 2:
                        url = _e.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        {
                            url = MANGADEX_API + "/manga?limit=100&offset=" + offset + "&contentRating[]=none&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art";
                            return [3 /*break*/, 5];
                        }
                        _e.label = 4;
                    case 4:
                        {
                            url = MANGADEX_API + "/manga?limit=100&offset=" + offset + "&contentRating[]=none&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=cover_art&order[updatedAt]=desc";
                            return [3 /*break*/, 5];
                        }
                        _e.label = 5;
                    case 5:
                        request = createRequestObject({
                            url: url,
                            method: 'GET',
                        });
                        return [4 /*yield*/, this.requestManager.schedule(request, 1)];
                    case 6:
                        response = _e.sent();
                        json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                        if (json.results === undefined)
                            throw new Error('Failed to parse json results for getViewMoreItems');
                        for (_i = 0, _d = json.results; _i < _d.length; _i++) {
                            manga = _d[_i];
                            mangaId = manga.data.id;
                            mangaDetails = manga.data.attributes;
                            title = this.decodeHTMLEntity(Object.values(mangaDetails.title)[0]);
                            coverFileName = manga.relationships.filter(function (x) { return x.type == 'cover_art'; }).map(function (x) { var _a; return (_a = x.attributes) === null || _a === void 0 ? void 0 : _a.fileName; })[0];
                            image = void 0;
                            if (coverFileName) {
                                image = COVER_BASE_URL + "/" + mangaId + "/" + coverFileName + ".256.jpg";
                            }
                            else {
                                image = 'https://i.imgur.com/6TrIues.jpg';
                            }
                            if (!collectedIds.includes(mangaId)) {
                                results.push(createMangaTile({
                                    id: mangaId,
                                    title: createIconText({ text: title }),
                                    image: image
                                }));
                                collectedIds.push(mangaId);
                            }
                        }
                        return [2 /*return*/, createPagedResults({
                                results: results,
                                metadata: { offset: offset + 100, collectedIds: collectedIds }
                            })];
                }
            });
        });
    };
    // async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
    //   let legacyIds: string[] = ids.filter(x => !x.includes('-'))
    //   let conversionDict: {[id: string]: string} = {}
    //   if (legacyIds.length != 0 ) {
    //     conversionDict = await this.getMangaUUIDs(legacyIds)
    //     for (const key of Object.keys(conversionDict)) {
    //       conversionDict[conversionDict[key]] = key
    //     }
    //   }
    //   let offset = 0
    //   let loadNextPage = true
    //   let updatedManga: string[] = []
    //   while (loadNextPage) {
    //     const updatedAt = time.toISOString().substr(0, time.toISOString().length - 5) // They support a weirdly truncated version of an ISO timestamp. A magic number of '5' seems to be always valid
    //     const request = createRequestObject({
    //       url: `${MANGADEX_API}/manga?limit=100&offset=${offset}&updatedAtSince=${updatedAt}`,
    //       method: 'GET',
    //     })
    //     const response = await this.requestManager.schedule(request, 1)
    //     // If we have no content, there are no updates available
    //     if(response.status == 204) {
    //       return
    //     }
    //     const json = typeof response.data === "string" ? JSON.parse(response.data) : response.data
    //     if(json.results === undefined) {
    //       // Log this, no need to throw.
    //       console.log(`Failed to parse JSON results for filterUpdatedManga using the date ${updatedAt} and the offset ${offset}`)
    //       return
    //     }
    //     for (const manga of json.results) {
    //       const mangaId = manga.data.id
    //       const mangaTime = new Date(manga.data.attributes.updatedAt)
    //       if (mangaTime <= time) {
    //         loadNextPage = false
    //       } else if (ids.includes(mangaId)) {
    //         updatedManga.push(mangaId)
    //       } else if (ids.includes(conversionDict[mangaId])) {
    //         updatedManga.push(conversionDict[mangaId])
    //       }
    //     }
    //     if (loadNextPage) {
    //       offset = offset + 100
    //     }
    //   }
    //   if (updatedManga.length > 0) {
    //     mangaUpdatesFoundCallback(createMangaUpdates({
    //         ids: updatedManga
    //     }))
    //   }
    // }
    MangaDex.prototype.decodeHTMLEntity = function (str) {
        return entities_1.default.decodeHTML(str);
    };
    return MangaDex;
}(paperback_extensions_common_1.Source));
exports.MangaDex = MangaDex;

},{"./external/tag.json":51,"entities":5,"paperback-extensions-common":12}],51:[function(require,module,exports){
module.exports=[{"result":"ok","data":{"id":"0234a31e-a729-4e28-9d6a-3f87c4966b9e","type":"tag","attributes":{"name":{"en":"Oneshot"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"07251805-a27e-4d59-b488-f0bfbec15168","type":"tag","attributes":{"name":{"en":"Thriller"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"0a39b5a1-b235-4886-a747-1d05d216532d","type":"tag","attributes":{"name":{"en":"Award Winning"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"0bc90acb-ccc1-44ca-a34a-b9f3a73259d0","type":"tag","attributes":{"name":{"en":"Reincarnation"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"256c8bd9-4904-4360-bf4f-508a76d67183","type":"tag","attributes":{"name":{"en":"Sci-Fi"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"292e862b-2d17-4062-90a2-0356caa4ae27","type":"tag","attributes":{"name":{"en":"Time Travel"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"2bd2e8d0-f146-434a-9b51-fc9ff2c5fe6a","type":"tag","attributes":{"name":{"en":"Genderswap"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"2d1f5d56-a1e5-4d0d-a961-2193588b08ec","type":"tag","attributes":{"name":{"en":"Loli"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"31932a7e-5b8e-49a6-9f12-2afa39dc544c","type":"tag","attributes":{"name":{"en":"Traditional Games"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"320831a8-4026-470b-94f6-8353740e6f04","type":"tag","attributes":{"name":{"en":"Official Colored"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"33771934-028e-4cb3-8744-691e866a923e","type":"tag","attributes":{"name":{"en":"Historical"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"36fd93ea-e8b8-445e-b836-358f02b3d33d","type":"tag","attributes":{"name":{"en":"Monsters"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"391b0423-d847-456f-aff0-8b0cfc03066b","type":"tag","attributes":{"name":{"en":"Action"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"39730448-9a5f-48a2-85b0-a70db87b1233","type":"tag","attributes":{"name":{"en":"Demons"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"3b60b75c-a2d7-4860-ab56-05f391bb889c","type":"tag","attributes":{"name":{"en":"Psychological"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"3bb26d85-09d5-4d2e-880c-c34b974339e9","type":"tag","attributes":{"name":{"en":"Ghosts"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"3de8c75d-8ee3-48ff-98ee-e20a65c86451","type":"tag","attributes":{"name":{"en":"Animals"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"3e2b8dae-350e-4ab8-a8ce-016e844b9f0d","type":"tag","attributes":{"name":{"en":"Long Strip"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"423e2eae-a7a2-4a8b-ac03-a8351462d71d","type":"tag","attributes":{"name":{"en":"Romance"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"489dd859-9b61-4c37-af75-5b18e88daafc","type":"tag","attributes":{"name":{"en":"Ninja"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"4d32cc48-9f00-4cca-9b5a-a839f0764984","type":"tag","attributes":{"name":{"en":"Comedy"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"50880a9d-5440-4732-9afb-8f457127e836","type":"tag","attributes":{"name":{"en":"Mecha"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"51d83883-4103-437c-b4b1-731cb73d786c","type":"tag","attributes":{"name":{"en":"Anthology"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"5920b825-4181-4a17-beeb-9918b0ff7a30","type":"tag","attributes":{"name":{"en":"Boys\u0027 Love"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"5bd0e105-4481-44ca-b6e7-7544da56b1a3","type":"tag","attributes":{"name":{"en":"Incest"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"5ca48985-9a9d-4bd8-be29-80dc0303db72","type":"tag","attributes":{"name":{"en":"Crime"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"5fff9cde-849c-4d78-aab0-0d52b2ee1d25","type":"tag","attributes":{"name":{"en":"Survival"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"631ef465-9aba-4afb-b0fc-ea10efe274a8","type":"tag","attributes":{"name":{"en":"Zombies"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"65761a2a-415e-47f3-bef2-a9dababba7a6","type":"tag","attributes":{"name":{"en":"Reverse Harem"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"69964a64-2f90-4d33-beeb-f3ed2875eb4c","type":"tag","attributes":{"name":{"en":"Sports"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"7064a261-a137-4d3a-8848-2d385de3a99c","type":"tag","attributes":{"name":{"en":"Superhero"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"799c202e-7daa-44eb-9cf7-8a3c0441531e","type":"tag","attributes":{"name":{"en":"Martial Arts"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"7b2ce280-79ef-4c09-9b58-12b7c23a9b78","type":"tag","attributes":{"name":{"en":"Fan Colored"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"81183756-1453-4c81-aa9e-f6e1b63be016","type":"tag","attributes":{"name":{"en":"Samurai"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"81c836c9-914a-4eca-981a-560dad663e73","type":"tag","attributes":{"name":{"en":"Magical Girls"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"85daba54-a71c-4554-8a28-9901a8b0afad","type":"tag","attributes":{"name":{"en":"Mafia"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"87cc87cd-a395-47af-b27a-93258283bbc6","type":"tag","attributes":{"name":{"en":"Adventure"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"891cf039-b895-47f0-9229-bef4c96eccd4","type":"tag","attributes":{"name":{"en":"User Created"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"8c86611e-fab7-4986-9dec-d1a2f44acdd5","type":"tag","attributes":{"name":{"en":"Virtual Reality"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"92d6d951-ca5e-429c-ac78-451071cbf064","type":"tag","attributes":{"name":{"en":"Office Workers"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"9438db5a-7e2a-4ac0-b39e-e0d95a34b8a8","type":"tag","attributes":{"name":{"en":"Video Games"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"9467335a-1b83-4497-9231-765337a00b96","type":"tag","attributes":{"name":{"en":"Post-Apocalyptic"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"97893a4c-12af-4dac-b6be-0dffb353568e","type":"tag","attributes":{"name":{"en":"Sexual Violence"},"description":[],"group":"content","version":1}},"relationships":[]},{"result":"ok","data":{"id":"9ab53f92-3eed-4e9b-903a-917c86035ee3","type":"tag","attributes":{"name":{"en":"Crossdressing"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"a1f53773-c69a-4ce5-8cab-fffcd90b1565","type":"tag","attributes":{"name":{"en":"Magic"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"a3c67850-4684-404e-9b7f-c69850ee5da6","type":"tag","attributes":{"name":{"en":"Girls\u0027 Love"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"aafb99c1-7f60-43fa-b75f-fc9502ce29c7","type":"tag","attributes":{"name":{"en":"Harem"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"ac72833b-c4e9-4878-b9db-6c8a4a99444a","type":"tag","attributes":{"name":{"en":"Military"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"acc803a4-c95a-4c22-86fc-eb6b582d82a2","type":"tag","attributes":{"name":{"en":"Wuxia"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"ace04997-f6bd-436e-b261-779182193d3d","type":"tag","attributes":{"name":{"en":"Isekai"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"b11fda93-8f1d-4bef-b2ed-8803d3733170","type":"tag","attributes":{"name":{"en":"4-Koma"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"b13b2a48-c720-44a9-9c77-39c9979373fb","type":"tag","attributes":{"name":{"en":"Doujinshi"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"b1e97889-25b4-4258-b28b-cd7f4d28ea9b","type":"tag","attributes":{"name":{"en":"Philosophical"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"b29d6a3d-1569-4e7a-8caf-7557bc92cd5d","type":"tag","attributes":{"name":{"en":"Gore"},"description":[],"group":"content","version":1}},"relationships":[]},{"result":"ok","data":{"id":"b9af3a63-f058-46de-a9a0-e0c13906197a","type":"tag","attributes":{"name":{"en":"Drama"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"c8cbe35b-1b2b-4a3f-9c37-db84c4514856","type":"tag","attributes":{"name":{"en":"Medical"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"caaa44eb-cd40-4177-b930-79d3ef2afe87","type":"tag","attributes":{"name":{"en":"School Life"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"cdad7e68-1419-41dd-bdce-27753074a640","type":"tag","attributes":{"name":{"en":"Horror"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"cdc58593-87dd-415e-bbc0-2ec27bf404cc","type":"tag","attributes":{"name":{"en":"Fantasy"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"d14322ac-4d6f-4e9b-afd9-629d5f4d8a41","type":"tag","attributes":{"name":{"en":"Villainess"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"d7d1730f-6eb0-4ba6-9437-602cac38664c","type":"tag","attributes":{"name":{"en":"Vampires"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"da2d50ca-3018-4cc0-ac7a-6b7d472a29ea","type":"tag","attributes":{"name":{"en":"Delinquents"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"dd1f77c5-dea9-4e2b-97ae-224af09caf99","type":"tag","attributes":{"name":{"en":"Monster Girls"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"ddefd648-5140-4e5f-ba18-4eca4071d19b","type":"tag","attributes":{"name":{"en":"Shota"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"df33b754-73a3-4c54-80e6-1a74a8058539","type":"tag","attributes":{"name":{"en":"Police"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"e197df38-d0e7-43b5-9b09-2842d0c326dd","type":"tag","attributes":{"name":{"en":"Web Comic"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"e5301a23-ebd9-49dd-a0cb-2add944c7fe9","type":"tag","attributes":{"name":{"en":"Slice of Life"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"e64f6742-c834-471d-8d72-dd51fc02b835","type":"tag","attributes":{"name":{"en":"Aliens"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"ea2bc92d-1c26-4930-9b7c-d5c0dc1b6869","type":"tag","attributes":{"name":{"en":"Cooking"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"eabc5b4c-6aff-42f3-b657-3e90cbd00b75","type":"tag","attributes":{"name":{"en":"Supernatural"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"ee968100-4191-4968-93d3-f82d72be7e46","type":"tag","attributes":{"name":{"en":"Mystery"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"f4122d1c-3b44-44d0-9936-ff7502c39ad3","type":"tag","attributes":{"name":{"en":"Adaptation"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"f42fbf9e-188a-447b-9fdc-f19dc1e4d685","type":"tag","attributes":{"name":{"en":"Music"},"description":[],"group":"theme","version":1}},"relationships":[]},{"result":"ok","data":{"id":"f5ba408b-0e7a-484d-8d49-4e9125ac96de","type":"tag","attributes":{"name":{"en":"Full Color"},"description":[],"group":"format","version":1}},"relationships":[]},{"result":"ok","data":{"id":"f8f62932-27da-4fe4-8ee1-6779a8c5edba","type":"tag","attributes":{"name":{"en":"Tragedy"},"description":[],"group":"genre","version":1}},"relationships":[]},{"result":"ok","data":{"id":"fad12b5e-68ba-460e-b933-9ae8318f5b65","type":"tag","attributes":{"name":{"en":"Gyaru"},"description":[],"group":"theme","version":1}},"relationships":[]}]
},{}]},{},[50])(50)
});
