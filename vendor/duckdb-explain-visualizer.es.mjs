import { useSlots as Zb, ref as qe, computed as $e, watch as Zt, onMounted as ci, onBeforeUnmount as Fc, createBlock as an, provide as on, openBlock as q, resolveDynamicComponent as Qb, inject as ft, getCurrentInstance as wg, createElementBlock as re, normalizeStyle as ii, unref as S, renderSlot as xo, nextTick as Oi, h as oi, shallowRef as eO, onUnmounted as tO, isRef as bi, isReactive as Dh, isVNode as nO, createApp as Qf, defineComponent as Lt, reactive as Tr, createElementVNode as D, createTextVNode as B, withDirectives as Bn, normalizeClass as Xe, createVNode as We, createCommentVNode as Le, Fragment as Et, renderList as er, toDisplayString as He, onBeforeMount as lo, withModifiers as hn, withCtx as Pt } from "vue";
var Qs = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Yu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ia = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var rO = Ia.exports, Ph;
function iO() {
  return Ph || (Ph = 1, function(e, t) {
    (function() {
      var n, o = "4.17.21", a = 200, s = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", l = "Expected a function", f = "Invalid `variable` option passed into `_.template`", c = "__lodash_hash_undefined__", p = 500, h = "__lodash_placeholder__", v = 1, E = 2, b = 4, R = 1, T = 2, x = 1, I = 2, F = 4, P = 8, g = 16, H = 32, $ = 64, U = 128, _ = 256, A = 512, Z = 30, G = "...", _e = 800, ye = 16, z = 1, fe = 2, j = 3, se = 1 / 0, ue = 9007199254740991, Te = 17976931348623157e292, Ie = NaN, Me = 4294967295, he = Me - 1, Ee = Me >>> 1, le = [
        ["ary", U],
        ["bind", x],
        ["bindKey", I],
        ["curry", P],
        ["curryRight", g],
        ["flip", A],
        ["partial", H],
        ["partialRight", $],
        ["rearg", _]
      ], de = "[object Arguments]", V = "[object Array]", O = "[object AsyncFunction]", W = "[object Boolean]", J = "[object Date]", Q = "[object DOMException]", ie = "[object Error]", Ae = "[object Function]", Fe = "[object GeneratorFunction]", Ye = "[object Map]", pt = "[object Number]", zt = "[object Null]", ht = "[object Object]", Yt = "[object Promise]", gn = "[object Proxy]", At = "[object RegExp]", vt = "[object Set]", Vt = "[object String]", Mt = "[object Symbol]", Ft = "[object Undefined]", Qt = "[object WeakMap]", en = "[object WeakSet]", Wt = "[object ArrayBuffer]", jt = "[object DataView]", zr = "[object Float32Array]", Wr = "[object Float64Array]", Xr = "[object Int8Array]", Yr = "[object Int16Array]", Vr = "[object Int32Array]", C = "[object Uint8Array]", ee = "[object Uint8ClampedArray]", pe = "[object Uint16Array]", xe = "[object Uint32Array]", Se = /\b__p \+= '';/g, at = /\b(__p \+=) '' \+/g, _t = /(__e\(.*?\)|\b__t\)) \+\n'';/g, tn = /&(?:amp|lt|gt|quot|#39);/g, sr = /[&<>"']/g, xt = RegExp(tn.source), M = RegExp(sr.source), te = /<%-([\s\S]+?)%>/g, ve = /<%([\s\S]+?)%>/g, Ge = /<%=([\s\S]+?)%>/g, gt = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ct = /^\w*$/, Ce = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Re = /[\\^$.*+?()[\]{}|]/g, Je = RegExp(Re.source), Ut = /^\s+/, $t = /\s/, xi = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, ea = /\{\n\/\* \[wrapped with (.+)\] \*/, ta = /,? & /, ll = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, na = /[()=,{}\[\]\/\s]/, fl = /\\(\\)?/g, cl = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, os = /\w*$/, as = /^[-+]0x[0-9a-f]+$/i, fo = /^0b[01]+$/i, dl = /^\[object .+?Constructor\]$/, pl = /^0o[0-7]+$/i, hl = /^(?:0|[1-9]\d*)$/, Nr = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Ci = /($^)/, ss = /['\n\r\u2028\u2029\\]/g, co = "\\ud800-\\udfff", vl = "\\u0300-\\u036f", gl = "\\ufe20-\\ufe2f", po = "\\u20d0-\\u20ff", us = vl + gl + po, ge = "\\u2700-\\u27bf", Ue = "a-z\\xdf-\\xf6\\xf8-\\xff", it = "\\xac\\xb1\\xd7\\xf7", bt = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Bt = "\\u2000-\\u206f", Cn = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", ur = "A-Z\\xc0-\\xd6\\xd8-\\xde", Li = "\\ufe0e\\ufe0f", ln = it + bt + Bt + Cn, yn = "['’]", ls = "[" + co + "]", ra = "[" + ln + "]", Mi = "[" + us + "]", fs = "\\d+", ml = "[" + ge + "]", cs = "[" + Ue + "]", ds = "[^" + co + ln + fs + ge + Ue + ur + "]", pi = "\\ud83c[\\udffb-\\udfff]", ps = "(?:" + Mi + "|" + pi + ")", Ln = "[^" + co + "]", ia = "(?:\\ud83c[\\udde6-\\uddff]){2}", Di = "[\\ud800-\\udbff][\\udc00-\\udfff]", Ve = "[" + ur + "]", oa = "\\u200d", Xt = "(?:" + cs + "|" + ds + ")", Ot = "(?:" + Ve + "|" + ds + ")", Pi = "(?:" + yn + "(?:d|ll|m|re|s|t|ve))?", Sr = "(?:" + yn + "(?:D|LL|M|RE|S|T|VE))?", ho = ps + "?", vo = "[" + Li + "]?", Oe = "(?:" + oa + "(?:" + [Ln, ia, Di].join("|") + ")" + vo + ho + ")*", Pe = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", et = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", dt = vo + ho + Oe, nn = "(?:" + [ml, ia, Di].join("|") + ")" + dt, lr = "(?:" + [Ln + Mi + "?", Mi, ia, Di, ls].join("|") + ")", El = RegExp(yn, "g"), _l = RegExp(Mi, "g"), yl = RegExp(pi + "(?=" + pi + ")|" + lr + dt, "g"), lE = RegExp([
        Ve + "?" + cs + "+" + Pi + "(?=" + [ra, Ve, "$"].join("|") + ")",
        Ot + "+" + Sr + "(?=" + [ra, Ve + Xt, "$"].join("|") + ")",
        Ve + "?" + Xt + "+" + Pi,
        Ve + "+" + Sr,
        et,
        Pe,
        fs,
        nn
      ].join("|"), "g"), fE = RegExp("[" + oa + co + us + Li + "]"), cE = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, dE = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ], pE = -1, Rt = {};
      Rt[zr] = Rt[Wr] = Rt[Xr] = Rt[Yr] = Rt[Vr] = Rt[C] = Rt[ee] = Rt[pe] = Rt[xe] = !0, Rt[de] = Rt[V] = Rt[Wt] = Rt[W] = Rt[jt] = Rt[J] = Rt[ie] = Rt[Ae] = Rt[Ye] = Rt[pt] = Rt[ht] = Rt[At] = Rt[vt] = Rt[Vt] = Rt[Qt] = !1;
      var It = {};
      It[de] = It[V] = It[Wt] = It[jt] = It[W] = It[J] = It[zr] = It[Wr] = It[Xr] = It[Yr] = It[Vr] = It[Ye] = It[pt] = It[ht] = It[At] = It[vt] = It[Vt] = It[Mt] = It[C] = It[ee] = It[pe] = It[xe] = !0, It[ie] = It[Ae] = It[Qt] = !1;
      var hE = {
        // Latin-1 Supplement block.
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        Ç: "C",
        ç: "c",
        Ð: "D",
        ð: "d",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        Ñ: "N",
        ñ: "n",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ø: "O",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        Ý: "Y",
        ý: "y",
        ÿ: "y",
        Æ: "Ae",
        æ: "ae",
        Þ: "Th",
        þ: "th",
        ß: "ss",
        // Latin Extended-A block.
        Ā: "A",
        Ă: "A",
        Ą: "A",
        ā: "a",
        ă: "a",
        ą: "a",
        Ć: "C",
        Ĉ: "C",
        Ċ: "C",
        Č: "C",
        ć: "c",
        ĉ: "c",
        ċ: "c",
        č: "c",
        Ď: "D",
        Đ: "D",
        ď: "d",
        đ: "d",
        Ē: "E",
        Ĕ: "E",
        Ė: "E",
        Ę: "E",
        Ě: "E",
        ē: "e",
        ĕ: "e",
        ė: "e",
        ę: "e",
        ě: "e",
        Ĝ: "G",
        Ğ: "G",
        Ġ: "G",
        Ģ: "G",
        ĝ: "g",
        ğ: "g",
        ġ: "g",
        ģ: "g",
        Ĥ: "H",
        Ħ: "H",
        ĥ: "h",
        ħ: "h",
        Ĩ: "I",
        Ī: "I",
        Ĭ: "I",
        Į: "I",
        İ: "I",
        ĩ: "i",
        ī: "i",
        ĭ: "i",
        į: "i",
        ı: "i",
        Ĵ: "J",
        ĵ: "j",
        Ķ: "K",
        ķ: "k",
        ĸ: "k",
        Ĺ: "L",
        Ļ: "L",
        Ľ: "L",
        Ŀ: "L",
        Ł: "L",
        ĺ: "l",
        ļ: "l",
        ľ: "l",
        ŀ: "l",
        ł: "l",
        Ń: "N",
        Ņ: "N",
        Ň: "N",
        Ŋ: "N",
        ń: "n",
        ņ: "n",
        ň: "n",
        ŋ: "n",
        Ō: "O",
        Ŏ: "O",
        Ő: "O",
        ō: "o",
        ŏ: "o",
        ő: "o",
        Ŕ: "R",
        Ŗ: "R",
        Ř: "R",
        ŕ: "r",
        ŗ: "r",
        ř: "r",
        Ś: "S",
        Ŝ: "S",
        Ş: "S",
        Š: "S",
        ś: "s",
        ŝ: "s",
        ş: "s",
        š: "s",
        Ţ: "T",
        Ť: "T",
        Ŧ: "T",
        ţ: "t",
        ť: "t",
        ŧ: "t",
        Ũ: "U",
        Ū: "U",
        Ŭ: "U",
        Ů: "U",
        Ű: "U",
        Ų: "U",
        ũ: "u",
        ū: "u",
        ŭ: "u",
        ů: "u",
        ű: "u",
        ų: "u",
        Ŵ: "W",
        ŵ: "w",
        Ŷ: "Y",
        ŷ: "y",
        Ÿ: "Y",
        Ź: "Z",
        Ż: "Z",
        Ž: "Z",
        ź: "z",
        ż: "z",
        ž: "z",
        Ĳ: "IJ",
        ĳ: "ij",
        Œ: "Oe",
        œ: "oe",
        ŉ: "'n",
        ſ: "s"
      }, vE = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, gE = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, mE = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, EE = parseFloat, _E = parseInt, Id = typeof Qs == "object" && Qs && Qs.Object === Object && Qs, yE = typeof self == "object" && self && self.Object === Object && self, sn = Id || yE || Function("return this")(), Tl = t && !t.nodeType && t, Ui = Tl && !0 && e && !e.nodeType && e, Rd = Ui && Ui.exports === Tl, Al = Rd && Id.process, Xn = function() {
        try {
          var X = Ui && Ui.require && Ui.require("util").types;
          return X || Al && Al.binding && Al.binding("util");
        } catch {
        }
      }(), wd = Xn && Xn.isArrayBuffer, xd = Xn && Xn.isDate, Cd = Xn && Xn.isMap, Ld = Xn && Xn.isRegExp, Md = Xn && Xn.isSet, Dd = Xn && Xn.isTypedArray;
      function Mn(X, ne, K) {
        switch (K.length) {
          case 0:
            return X.call(ne);
          case 1:
            return X.call(ne, K[0]);
          case 2:
            return X.call(ne, K[0], K[1]);
          case 3:
            return X.call(ne, K[0], K[1], K[2]);
        }
        return X.apply(ne, K);
      }
      function TE(X, ne, K, we) {
        for (var Ze = -1, mt = X == null ? 0 : X.length; ++Ze < mt; ) {
          var Kt = X[Ze];
          ne(we, Kt, K(Kt), X);
        }
        return we;
      }
      function Yn(X, ne) {
        for (var K = -1, we = X == null ? 0 : X.length; ++K < we && ne(X[K], K, X) !== !1; )
          ;
        return X;
      }
      function AE(X, ne) {
        for (var K = X == null ? 0 : X.length; K-- && ne(X[K], K, X) !== !1; )
          ;
        return X;
      }
      function Pd(X, ne) {
        for (var K = -1, we = X == null ? 0 : X.length; ++K < we; )
          if (!ne(X[K], K, X))
            return !1;
        return !0;
      }
      function hi(X, ne) {
        for (var K = -1, we = X == null ? 0 : X.length, Ze = 0, mt = []; ++K < we; ) {
          var Kt = X[K];
          ne(Kt, K, X) && (mt[Ze++] = Kt);
        }
        return mt;
      }
      function hs(X, ne) {
        var K = X == null ? 0 : X.length;
        return !!K && go(X, ne, 0) > -1;
      }
      function bl(X, ne, K) {
        for (var we = -1, Ze = X == null ? 0 : X.length; ++we < Ze; )
          if (K(ne, X[we]))
            return !0;
        return !1;
      }
      function Ct(X, ne) {
        for (var K = -1, we = X == null ? 0 : X.length, Ze = Array(we); ++K < we; )
          Ze[K] = ne(X[K], K, X);
        return Ze;
      }
      function vi(X, ne) {
        for (var K = -1, we = ne.length, Ze = X.length; ++K < we; )
          X[Ze + K] = ne[K];
        return X;
      }
      function Ol(X, ne, K, we) {
        var Ze = -1, mt = X == null ? 0 : X.length;
        for (we && mt && (K = X[++Ze]); ++Ze < mt; )
          K = ne(K, X[Ze], Ze, X);
        return K;
      }
      function bE(X, ne, K, we) {
        var Ze = X == null ? 0 : X.length;
        for (we && Ze && (K = X[--Ze]); Ze--; )
          K = ne(K, X[Ze], Ze, X);
        return K;
      }
      function Nl(X, ne) {
        for (var K = -1, we = X == null ? 0 : X.length; ++K < we; )
          if (ne(X[K], K, X))
            return !0;
        return !1;
      }
      var OE = Sl("length");
      function NE(X) {
        return X.split("");
      }
      function SE(X) {
        return X.match(ll) || [];
      }
      function Ud(X, ne, K) {
        var we;
        return K(X, function(Ze, mt, Kt) {
          if (ne(Ze, mt, Kt))
            return we = mt, !1;
        }), we;
      }
      function vs(X, ne, K, we) {
        for (var Ze = X.length, mt = K + (we ? 1 : -1); we ? mt-- : ++mt < Ze; )
          if (ne(X[mt], mt, X))
            return mt;
        return -1;
      }
      function go(X, ne, K) {
        return ne === ne ? kE(X, ne, K) : vs(X, $d, K);
      }
      function IE(X, ne, K, we) {
        for (var Ze = K - 1, mt = X.length; ++Ze < mt; )
          if (we(X[Ze], ne))
            return Ze;
        return -1;
      }
      function $d(X) {
        return X !== X;
      }
      function kd(X, ne) {
        var K = X == null ? 0 : X.length;
        return K ? Rl(X, ne) / K : Ie;
      }
      function Sl(X) {
        return function(ne) {
          return ne == null ? n : ne[X];
        };
      }
      function Il(X) {
        return function(ne) {
          return X == null ? n : X[ne];
        };
      }
      function Fd(X, ne, K, we, Ze) {
        return Ze(X, function(mt, Kt, Nt) {
          K = we ? (we = !1, mt) : ne(K, mt, Kt, Nt);
        }), K;
      }
      function RE(X, ne) {
        var K = X.length;
        for (X.sort(ne); K--; )
          X[K] = X[K].value;
        return X;
      }
      function Rl(X, ne) {
        for (var K, we = -1, Ze = X.length; ++we < Ze; ) {
          var mt = ne(X[we]);
          mt !== n && (K = K === n ? mt : K + mt);
        }
        return K;
      }
      function wl(X, ne) {
        for (var K = -1, we = Array(X); ++K < X; )
          we[K] = ne(K);
        return we;
      }
      function wE(X, ne) {
        return Ct(ne, function(K) {
          return [K, X[K]];
        });
      }
      function Bd(X) {
        return X && X.slice(0, Wd(X) + 1).replace(Ut, "");
      }
      function Dn(X) {
        return function(ne) {
          return X(ne);
        };
      }
      function xl(X, ne) {
        return Ct(ne, function(K) {
          return X[K];
        });
      }
      function aa(X, ne) {
        return X.has(ne);
      }
      function Hd(X, ne) {
        for (var K = -1, we = X.length; ++K < we && go(ne, X[K], 0) > -1; )
          ;
        return K;
      }
      function Gd(X, ne) {
        for (var K = X.length; K-- && go(ne, X[K], 0) > -1; )
          ;
        return K;
      }
      function xE(X, ne) {
        for (var K = X.length, we = 0; K--; )
          X[K] === ne && ++we;
        return we;
      }
      var CE = Il(hE), LE = Il(vE);
      function ME(X) {
        return "\\" + mE[X];
      }
      function DE(X, ne) {
        return X == null ? n : X[ne];
      }
      function mo(X) {
        return fE.test(X);
      }
      function PE(X) {
        return cE.test(X);
      }
      function UE(X) {
        for (var ne, K = []; !(ne = X.next()).done; )
          K.push(ne.value);
        return K;
      }
      function Cl(X) {
        var ne = -1, K = Array(X.size);
        return X.forEach(function(we, Ze) {
          K[++ne] = [Ze, we];
        }), K;
      }
      function zd(X, ne) {
        return function(K) {
          return X(ne(K));
        };
      }
      function gi(X, ne) {
        for (var K = -1, we = X.length, Ze = 0, mt = []; ++K < we; ) {
          var Kt = X[K];
          (Kt === ne || Kt === h) && (X[K] = h, mt[Ze++] = K);
        }
        return mt;
      }
      function gs(X) {
        var ne = -1, K = Array(X.size);
        return X.forEach(function(we) {
          K[++ne] = we;
        }), K;
      }
      function $E(X) {
        var ne = -1, K = Array(X.size);
        return X.forEach(function(we) {
          K[++ne] = [we, we];
        }), K;
      }
      function kE(X, ne, K) {
        for (var we = K - 1, Ze = X.length; ++we < Ze; )
          if (X[we] === ne)
            return we;
        return -1;
      }
      function FE(X, ne, K) {
        for (var we = K + 1; we--; )
          if (X[we] === ne)
            return we;
        return we;
      }
      function Eo(X) {
        return mo(X) ? HE(X) : OE(X);
      }
      function fr(X) {
        return mo(X) ? GE(X) : NE(X);
      }
      function Wd(X) {
        for (var ne = X.length; ne-- && $t.test(X.charAt(ne)); )
          ;
        return ne;
      }
      var BE = Il(gE);
      function HE(X) {
        for (var ne = yl.lastIndex = 0; yl.test(X); )
          ++ne;
        return ne;
      }
      function GE(X) {
        return X.match(yl) || [];
      }
      function zE(X) {
        return X.match(lE) || [];
      }
      var WE = function X(ne) {
        ne = ne == null ? sn : _o.defaults(sn.Object(), ne, _o.pick(sn, dE));
        var K = ne.Array, we = ne.Date, Ze = ne.Error, mt = ne.Function, Kt = ne.Math, Nt = ne.Object, Ll = ne.RegExp, XE = ne.String, Vn = ne.TypeError, ms = K.prototype, YE = mt.prototype, yo = Nt.prototype, Es = ne["__core-js_shared__"], _s = YE.toString, Tt = yo.hasOwnProperty, VE = 0, Xd = function() {
          var r = /[^.]+$/.exec(Es && Es.keys && Es.keys.IE_PROTO || "");
          return r ? "Symbol(src)_1." + r : "";
        }(), ys = yo.toString, jE = _s.call(Nt), KE = sn._, qE = Ll(
          "^" + _s.call(Tt).replace(Re, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), Ts = Rd ? ne.Buffer : n, mi = ne.Symbol, As = ne.Uint8Array, Yd = Ts ? Ts.allocUnsafe : n, bs = zd(Nt.getPrototypeOf, Nt), Vd = Nt.create, jd = yo.propertyIsEnumerable, Os = ms.splice, Kd = mi ? mi.isConcatSpreadable : n, sa = mi ? mi.iterator : n, $i = mi ? mi.toStringTag : n, Ns = function() {
          try {
            var r = Gi(Nt, "defineProperty");
            return r({}, "", {}), r;
          } catch {
          }
        }(), JE = ne.clearTimeout !== sn.clearTimeout && ne.clearTimeout, ZE = we && we.now !== sn.Date.now && we.now, QE = ne.setTimeout !== sn.setTimeout && ne.setTimeout, Ss = Kt.ceil, Is = Kt.floor, Ml = Nt.getOwnPropertySymbols, e1 = Ts ? Ts.isBuffer : n, qd = ne.isFinite, t1 = ms.join, n1 = zd(Nt.keys, Nt), qt = Kt.max, fn = Kt.min, r1 = we.now, i1 = ne.parseInt, Jd = Kt.random, o1 = ms.reverse, Dl = Gi(ne, "DataView"), ua = Gi(ne, "Map"), Pl = Gi(ne, "Promise"), To = Gi(ne, "Set"), la = Gi(ne, "WeakMap"), fa = Gi(Nt, "create"), Rs = la && new la(), Ao = {}, a1 = zi(Dl), s1 = zi(ua), u1 = zi(Pl), l1 = zi(To), f1 = zi(la), ws = mi ? mi.prototype : n, ca = ws ? ws.valueOf : n, Zd = ws ? ws.toString : n;
        function y(r) {
          if (kt(r) && !Qe(r) && !(r instanceof st)) {
            if (r instanceof jn)
              return r;
            if (Tt.call(r, "__wrapped__"))
              return Qp(r);
          }
          return new jn(r);
        }
        var bo = /* @__PURE__ */ function() {
          function r() {
          }
          return function(i) {
            if (!Dt(i))
              return {};
            if (Vd)
              return Vd(i);
            r.prototype = i;
            var u = new r();
            return r.prototype = n, u;
          };
        }();
        function xs() {
        }
        function jn(r, i) {
          this.__wrapped__ = r, this.__actions__ = [], this.__chain__ = !!i, this.__index__ = 0, this.__values__ = n;
        }
        y.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: te,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: ve,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Ge,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          variable: "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          imports: {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            _: y
          }
        }, y.prototype = xs.prototype, y.prototype.constructor = y, jn.prototype = bo(xs.prototype), jn.prototype.constructor = jn;
        function st(r) {
          this.__wrapped__ = r, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = Me, this.__views__ = [];
        }
        function c1() {
          var r = new st(this.__wrapped__);
          return r.__actions__ = Tn(this.__actions__), r.__dir__ = this.__dir__, r.__filtered__ = this.__filtered__, r.__iteratees__ = Tn(this.__iteratees__), r.__takeCount__ = this.__takeCount__, r.__views__ = Tn(this.__views__), r;
        }
        function d1() {
          if (this.__filtered__) {
            var r = new st(this);
            r.__dir__ = -1, r.__filtered__ = !0;
          } else
            r = this.clone(), r.__dir__ *= -1;
          return r;
        }
        function p1() {
          var r = this.__wrapped__.value(), i = this.__dir__, u = Qe(r), d = i < 0, m = u ? r.length : 0, N = N_(0, m, this.__views__), L = N.start, k = N.end, Y = k - L, oe = d ? k : L - 1, ae = this.__iteratees__, ce = ae.length, Ne = 0, De = fn(Y, this.__takeCount__);
          if (!u || !d && m == Y && De == Y)
            return Ap(r, this.__actions__);
          var je = [];
          e:
            for (; Y-- && Ne < De; ) {
              oe += i;
              for (var nt = -1, Ke = r[oe]; ++nt < ce; ) {
                var ot = ae[nt], ut = ot.iteratee, $n = ot.type, _n = ut(Ke);
                if ($n == fe)
                  Ke = _n;
                else if (!_n) {
                  if ($n == z)
                    continue e;
                  break e;
                }
              }
              je[Ne++] = Ke;
            }
          return je;
        }
        st.prototype = bo(xs.prototype), st.prototype.constructor = st;
        function ki(r) {
          var i = -1, u = r == null ? 0 : r.length;
          for (this.clear(); ++i < u; ) {
            var d = r[i];
            this.set(d[0], d[1]);
          }
        }
        function h1() {
          this.__data__ = fa ? fa(null) : {}, this.size = 0;
        }
        function v1(r) {
          var i = this.has(r) && delete this.__data__[r];
          return this.size -= i ? 1 : 0, i;
        }
        function g1(r) {
          var i = this.__data__;
          if (fa) {
            var u = i[r];
            return u === c ? n : u;
          }
          return Tt.call(i, r) ? i[r] : n;
        }
        function m1(r) {
          var i = this.__data__;
          return fa ? i[r] !== n : Tt.call(i, r);
        }
        function E1(r, i) {
          var u = this.__data__;
          return this.size += this.has(r) ? 0 : 1, u[r] = fa && i === n ? c : i, this;
        }
        ki.prototype.clear = h1, ki.prototype.delete = v1, ki.prototype.get = g1, ki.prototype.has = m1, ki.prototype.set = E1;
        function jr(r) {
          var i = -1, u = r == null ? 0 : r.length;
          for (this.clear(); ++i < u; ) {
            var d = r[i];
            this.set(d[0], d[1]);
          }
        }
        function _1() {
          this.__data__ = [], this.size = 0;
        }
        function y1(r) {
          var i = this.__data__, u = Cs(i, r);
          if (u < 0)
            return !1;
          var d = i.length - 1;
          return u == d ? i.pop() : Os.call(i, u, 1), --this.size, !0;
        }
        function T1(r) {
          var i = this.__data__, u = Cs(i, r);
          return u < 0 ? n : i[u][1];
        }
        function A1(r) {
          return Cs(this.__data__, r) > -1;
        }
        function b1(r, i) {
          var u = this.__data__, d = Cs(u, r);
          return d < 0 ? (++this.size, u.push([r, i])) : u[d][1] = i, this;
        }
        jr.prototype.clear = _1, jr.prototype.delete = y1, jr.prototype.get = T1, jr.prototype.has = A1, jr.prototype.set = b1;
        function Kr(r) {
          var i = -1, u = r == null ? 0 : r.length;
          for (this.clear(); ++i < u; ) {
            var d = r[i];
            this.set(d[0], d[1]);
          }
        }
        function O1() {
          this.size = 0, this.__data__ = {
            hash: new ki(),
            map: new (ua || jr)(),
            string: new ki()
          };
        }
        function N1(r) {
          var i = zs(this, r).delete(r);
          return this.size -= i ? 1 : 0, i;
        }
        function S1(r) {
          return zs(this, r).get(r);
        }
        function I1(r) {
          return zs(this, r).has(r);
        }
        function R1(r, i) {
          var u = zs(this, r), d = u.size;
          return u.set(r, i), this.size += u.size == d ? 0 : 1, this;
        }
        Kr.prototype.clear = O1, Kr.prototype.delete = N1, Kr.prototype.get = S1, Kr.prototype.has = I1, Kr.prototype.set = R1;
        function Fi(r) {
          var i = -1, u = r == null ? 0 : r.length;
          for (this.__data__ = new Kr(); ++i < u; )
            this.add(r[i]);
        }
        function w1(r) {
          return this.__data__.set(r, c), this;
        }
        function x1(r) {
          return this.__data__.has(r);
        }
        Fi.prototype.add = Fi.prototype.push = w1, Fi.prototype.has = x1;
        function cr(r) {
          var i = this.__data__ = new jr(r);
          this.size = i.size;
        }
        function C1() {
          this.__data__ = new jr(), this.size = 0;
        }
        function L1(r) {
          var i = this.__data__, u = i.delete(r);
          return this.size = i.size, u;
        }
        function M1(r) {
          return this.__data__.get(r);
        }
        function D1(r) {
          return this.__data__.has(r);
        }
        function P1(r, i) {
          var u = this.__data__;
          if (u instanceof jr) {
            var d = u.__data__;
            if (!ua || d.length < a - 1)
              return d.push([r, i]), this.size = ++u.size, this;
            u = this.__data__ = new Kr(d);
          }
          return u.set(r, i), this.size = u.size, this;
        }
        cr.prototype.clear = C1, cr.prototype.delete = L1, cr.prototype.get = M1, cr.prototype.has = D1, cr.prototype.set = P1;
        function Qd(r, i) {
          var u = Qe(r), d = !u && Wi(r), m = !u && !d && Ai(r), N = !u && !d && !m && Io(r), L = u || d || m || N, k = L ? wl(r.length, XE) : [], Y = k.length;
          for (var oe in r)
            (i || Tt.call(r, oe)) && !(L && // Safari 9 has enumerable `arguments.length` in strict mode.
            (oe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            m && (oe == "offset" || oe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            N && (oe == "buffer" || oe == "byteLength" || oe == "byteOffset") || // Skip index properties.
            Qr(oe, Y))) && k.push(oe);
          return k;
        }
        function ep(r) {
          var i = r.length;
          return i ? r[Yl(0, i - 1)] : n;
        }
        function U1(r, i) {
          return Ws(Tn(r), Bi(i, 0, r.length));
        }
        function $1(r) {
          return Ws(Tn(r));
        }
        function Ul(r, i, u) {
          (u !== n && !dr(r[i], u) || u === n && !(i in r)) && qr(r, i, u);
        }
        function da(r, i, u) {
          var d = r[i];
          (!(Tt.call(r, i) && dr(d, u)) || u === n && !(i in r)) && qr(r, i, u);
        }
        function Cs(r, i) {
          for (var u = r.length; u--; )
            if (dr(r[u][0], i))
              return u;
          return -1;
        }
        function k1(r, i, u, d) {
          return Ei(r, function(m, N, L) {
            i(d, m, u(m), L);
          }), d;
        }
        function tp(r, i) {
          return r && Rr(i, rn(i), r);
        }
        function F1(r, i) {
          return r && Rr(i, bn(i), r);
        }
        function qr(r, i, u) {
          i == "__proto__" && Ns ? Ns(r, i, {
            configurable: !0,
            enumerable: !0,
            value: u,
            writable: !0
          }) : r[i] = u;
        }
        function $l(r, i) {
          for (var u = -1, d = i.length, m = K(d), N = r == null; ++u < d; )
            m[u] = N ? n : Ef(r, i[u]);
          return m;
        }
        function Bi(r, i, u) {
          return r === r && (u !== n && (r = r <= u ? r : u), i !== n && (r = r >= i ? r : i)), r;
        }
        function Kn(r, i, u, d, m, N) {
          var L, k = i & v, Y = i & E, oe = i & b;
          if (u && (L = m ? u(r, d, m, N) : u(r)), L !== n)
            return L;
          if (!Dt(r))
            return r;
          var ae = Qe(r);
          if (ae) {
            if (L = I_(r), !k)
              return Tn(r, L);
          } else {
            var ce = cn(r), Ne = ce == Ae || ce == Fe;
            if (Ai(r))
              return Np(r, k);
            if (ce == ht || ce == de || Ne && !m) {
              if (L = Y || Ne ? {} : Wp(r), !k)
                return Y ? g_(r, F1(L, r)) : v_(r, tp(L, r));
            } else {
              if (!It[ce])
                return m ? r : {};
              L = R_(r, ce, k);
            }
          }
          N || (N = new cr());
          var De = N.get(r);
          if (De)
            return De;
          N.set(r, L), _h(r) ? r.forEach(function(Ke) {
            L.add(Kn(Ke, i, u, Ke, r, N));
          }) : mh(r) && r.forEach(function(Ke, ot) {
            L.set(ot, Kn(Ke, i, u, ot, r, N));
          });
          var je = oe ? Y ? rf : nf : Y ? bn : rn, nt = ae ? n : je(r);
          return Yn(nt || r, function(Ke, ot) {
            nt && (ot = Ke, Ke = r[ot]), da(L, ot, Kn(Ke, i, u, ot, r, N));
          }), L;
        }
        function B1(r) {
          var i = rn(r);
          return function(u) {
            return np(u, r, i);
          };
        }
        function np(r, i, u) {
          var d = u.length;
          if (r == null)
            return !d;
          for (r = Nt(r); d--; ) {
            var m = u[d], N = i[m], L = r[m];
            if (L === n && !(m in r) || !N(L))
              return !1;
          }
          return !0;
        }
        function rp(r, i, u) {
          if (typeof r != "function")
            throw new Vn(l);
          return _a(function() {
            r.apply(n, u);
          }, i);
        }
        function pa(r, i, u, d) {
          var m = -1, N = hs, L = !0, k = r.length, Y = [], oe = i.length;
          if (!k)
            return Y;
          u && (i = Ct(i, Dn(u))), d ? (N = bl, L = !1) : i.length >= a && (N = aa, L = !1, i = new Fi(i));
          e:
            for (; ++m < k; ) {
              var ae = r[m], ce = u == null ? ae : u(ae);
              if (ae = d || ae !== 0 ? ae : 0, L && ce === ce) {
                for (var Ne = oe; Ne--; )
                  if (i[Ne] === ce)
                    continue e;
                Y.push(ae);
              } else N(i, ce, d) || Y.push(ae);
            }
          return Y;
        }
        var Ei = xp(Ir), ip = xp(Fl, !0);
        function H1(r, i) {
          var u = !0;
          return Ei(r, function(d, m, N) {
            return u = !!i(d, m, N), u;
          }), u;
        }
        function Ls(r, i, u) {
          for (var d = -1, m = r.length; ++d < m; ) {
            var N = r[d], L = i(N);
            if (L != null && (k === n ? L === L && !Un(L) : u(L, k)))
              var k = L, Y = N;
          }
          return Y;
        }
        function G1(r, i, u, d) {
          var m = r.length;
          for (u = tt(u), u < 0 && (u = -u > m ? 0 : m + u), d = d === n || d > m ? m : tt(d), d < 0 && (d += m), d = u > d ? 0 : Th(d); u < d; )
            r[u++] = i;
          return r;
        }
        function op(r, i) {
          var u = [];
          return Ei(r, function(d, m, N) {
            i(d, m, N) && u.push(d);
          }), u;
        }
        function un(r, i, u, d, m) {
          var N = -1, L = r.length;
          for (u || (u = x_), m || (m = []); ++N < L; ) {
            var k = r[N];
            i > 0 && u(k) ? i > 1 ? un(k, i - 1, u, d, m) : vi(m, k) : d || (m[m.length] = k);
          }
          return m;
        }
        var kl = Cp(), ap = Cp(!0);
        function Ir(r, i) {
          return r && kl(r, i, rn);
        }
        function Fl(r, i) {
          return r && ap(r, i, rn);
        }
        function Ms(r, i) {
          return hi(i, function(u) {
            return ei(r[u]);
          });
        }
        function Hi(r, i) {
          i = yi(i, r);
          for (var u = 0, d = i.length; r != null && u < d; )
            r = r[wr(i[u++])];
          return u && u == d ? r : n;
        }
        function sp(r, i, u) {
          var d = i(r);
          return Qe(r) ? d : vi(d, u(r));
        }
        function mn(r) {
          return r == null ? r === n ? Ft : zt : $i && $i in Nt(r) ? O_(r) : $_(r);
        }
        function Bl(r, i) {
          return r > i;
        }
        function z1(r, i) {
          return r != null && Tt.call(r, i);
        }
        function W1(r, i) {
          return r != null && i in Nt(r);
        }
        function X1(r, i, u) {
          return r >= fn(i, u) && r < qt(i, u);
        }
        function Hl(r, i, u) {
          for (var d = u ? bl : hs, m = r[0].length, N = r.length, L = N, k = K(N), Y = 1 / 0, oe = []; L--; ) {
            var ae = r[L];
            L && i && (ae = Ct(ae, Dn(i))), Y = fn(ae.length, Y), k[L] = !u && (i || m >= 120 && ae.length >= 120) ? new Fi(L && ae) : n;
          }
          ae = r[0];
          var ce = -1, Ne = k[0];
          e:
            for (; ++ce < m && oe.length < Y; ) {
              var De = ae[ce], je = i ? i(De) : De;
              if (De = u || De !== 0 ? De : 0, !(Ne ? aa(Ne, je) : d(oe, je, u))) {
                for (L = N; --L; ) {
                  var nt = k[L];
                  if (!(nt ? aa(nt, je) : d(r[L], je, u)))
                    continue e;
                }
                Ne && Ne.push(je), oe.push(De);
              }
            }
          return oe;
        }
        function Y1(r, i, u, d) {
          return Ir(r, function(m, N, L) {
            i(d, u(m), N, L);
          }), d;
        }
        function ha(r, i, u) {
          i = yi(i, r), r = jp(r, i);
          var d = r == null ? r : r[wr(Jn(i))];
          return d == null ? n : Mn(d, r, u);
        }
        function up(r) {
          return kt(r) && mn(r) == de;
        }
        function V1(r) {
          return kt(r) && mn(r) == Wt;
        }
        function j1(r) {
          return kt(r) && mn(r) == J;
        }
        function va(r, i, u, d, m) {
          return r === i ? !0 : r == null || i == null || !kt(r) && !kt(i) ? r !== r && i !== i : K1(r, i, u, d, va, m);
        }
        function K1(r, i, u, d, m, N) {
          var L = Qe(r), k = Qe(i), Y = L ? V : cn(r), oe = k ? V : cn(i);
          Y = Y == de ? ht : Y, oe = oe == de ? ht : oe;
          var ae = Y == ht, ce = oe == ht, Ne = Y == oe;
          if (Ne && Ai(r)) {
            if (!Ai(i))
              return !1;
            L = !0, ae = !1;
          }
          if (Ne && !ae)
            return N || (N = new cr()), L || Io(r) ? Hp(r, i, u, d, m, N) : A_(r, i, Y, u, d, m, N);
          if (!(u & R)) {
            var De = ae && Tt.call(r, "__wrapped__"), je = ce && Tt.call(i, "__wrapped__");
            if (De || je) {
              var nt = De ? r.value() : r, Ke = je ? i.value() : i;
              return N || (N = new cr()), m(nt, Ke, u, d, N);
            }
          }
          return Ne ? (N || (N = new cr()), b_(r, i, u, d, m, N)) : !1;
        }
        function q1(r) {
          return kt(r) && cn(r) == Ye;
        }
        function Gl(r, i, u, d) {
          var m = u.length, N = m, L = !d;
          if (r == null)
            return !N;
          for (r = Nt(r); m--; ) {
            var k = u[m];
            if (L && k[2] ? k[1] !== r[k[0]] : !(k[0] in r))
              return !1;
          }
          for (; ++m < N; ) {
            k = u[m];
            var Y = k[0], oe = r[Y], ae = k[1];
            if (L && k[2]) {
              if (oe === n && !(Y in r))
                return !1;
            } else {
              var ce = new cr();
              if (d)
                var Ne = d(oe, ae, Y, r, i, ce);
              if (!(Ne === n ? va(ae, oe, R | T, d, ce) : Ne))
                return !1;
            }
          }
          return !0;
        }
        function lp(r) {
          if (!Dt(r) || L_(r))
            return !1;
          var i = ei(r) ? qE : dl;
          return i.test(zi(r));
        }
        function J1(r) {
          return kt(r) && mn(r) == At;
        }
        function Z1(r) {
          return kt(r) && cn(r) == vt;
        }
        function Q1(r) {
          return kt(r) && qs(r.length) && !!Rt[mn(r)];
        }
        function fp(r) {
          return typeof r == "function" ? r : r == null ? On : typeof r == "object" ? Qe(r) ? pp(r[0], r[1]) : dp(r) : Lh(r);
        }
        function zl(r) {
          if (!Ea(r))
            return n1(r);
          var i = [];
          for (var u in Nt(r))
            Tt.call(r, u) && u != "constructor" && i.push(u);
          return i;
        }
        function e_(r) {
          if (!Dt(r))
            return U_(r);
          var i = Ea(r), u = [];
          for (var d in r)
            d == "constructor" && (i || !Tt.call(r, d)) || u.push(d);
          return u;
        }
        function Wl(r, i) {
          return r < i;
        }
        function cp(r, i) {
          var u = -1, d = An(r) ? K(r.length) : [];
          return Ei(r, function(m, N, L) {
            d[++u] = i(m, N, L);
          }), d;
        }
        function dp(r) {
          var i = af(r);
          return i.length == 1 && i[0][2] ? Yp(i[0][0], i[0][1]) : function(u) {
            return u === r || Gl(u, r, i);
          };
        }
        function pp(r, i) {
          return uf(r) && Xp(i) ? Yp(wr(r), i) : function(u) {
            var d = Ef(u, r);
            return d === n && d === i ? _f(u, r) : va(i, d, R | T);
          };
        }
        function Ds(r, i, u, d, m) {
          r !== i && kl(i, function(N, L) {
            if (m || (m = new cr()), Dt(N))
              t_(r, i, L, u, Ds, d, m);
            else {
              var k = d ? d(ff(r, L), N, L + "", r, i, m) : n;
              k === n && (k = N), Ul(r, L, k);
            }
          }, bn);
        }
        function t_(r, i, u, d, m, N, L) {
          var k = ff(r, u), Y = ff(i, u), oe = L.get(Y);
          if (oe) {
            Ul(r, u, oe);
            return;
          }
          var ae = N ? N(k, Y, u + "", r, i, L) : n, ce = ae === n;
          if (ce) {
            var Ne = Qe(Y), De = !Ne && Ai(Y), je = !Ne && !De && Io(Y);
            ae = Y, Ne || De || je ? Qe(k) ? ae = k : Ht(k) ? ae = Tn(k) : De ? (ce = !1, ae = Np(Y, !0)) : je ? (ce = !1, ae = Sp(Y, !0)) : ae = [] : ya(Y) || Wi(Y) ? (ae = k, Wi(k) ? ae = Ah(k) : (!Dt(k) || ei(k)) && (ae = Wp(Y))) : ce = !1;
          }
          ce && (L.set(Y, ae), m(ae, Y, d, N, L), L.delete(Y)), Ul(r, u, ae);
        }
        function hp(r, i) {
          var u = r.length;
          if (u)
            return i += i < 0 ? u : 0, Qr(i, u) ? r[i] : n;
        }
        function vp(r, i, u) {
          i.length ? i = Ct(i, function(N) {
            return Qe(N) ? function(L) {
              return Hi(L, N.length === 1 ? N[0] : N);
            } : N;
          }) : i = [On];
          var d = -1;
          i = Ct(i, Dn(ze()));
          var m = cp(r, function(N, L, k) {
            var Y = Ct(i, function(oe) {
              return oe(N);
            });
            return { criteria: Y, index: ++d, value: N };
          });
          return RE(m, function(N, L) {
            return h_(N, L, u);
          });
        }
        function n_(r, i) {
          return gp(r, i, function(u, d) {
            return _f(r, d);
          });
        }
        function gp(r, i, u) {
          for (var d = -1, m = i.length, N = {}; ++d < m; ) {
            var L = i[d], k = Hi(r, L);
            u(k, L) && ga(N, yi(L, r), k);
          }
          return N;
        }
        function r_(r) {
          return function(i) {
            return Hi(i, r);
          };
        }
        function Xl(r, i, u, d) {
          var m = d ? IE : go, N = -1, L = i.length, k = r;
          for (r === i && (i = Tn(i)), u && (k = Ct(r, Dn(u))); ++N < L; )
            for (var Y = 0, oe = i[N], ae = u ? u(oe) : oe; (Y = m(k, ae, Y, d)) > -1; )
              k !== r && Os.call(k, Y, 1), Os.call(r, Y, 1);
          return r;
        }
        function mp(r, i) {
          for (var u = r ? i.length : 0, d = u - 1; u--; ) {
            var m = i[u];
            if (u == d || m !== N) {
              var N = m;
              Qr(m) ? Os.call(r, m, 1) : Kl(r, m);
            }
          }
          return r;
        }
        function Yl(r, i) {
          return r + Is(Jd() * (i - r + 1));
        }
        function i_(r, i, u, d) {
          for (var m = -1, N = qt(Ss((i - r) / (u || 1)), 0), L = K(N); N--; )
            L[d ? N : ++m] = r, r += u;
          return L;
        }
        function Vl(r, i) {
          var u = "";
          if (!r || i < 1 || i > ue)
            return u;
          do
            i % 2 && (u += r), i = Is(i / 2), i && (r += r);
          while (i);
          return u;
        }
        function rt(r, i) {
          return cf(Vp(r, i, On), r + "");
        }
        function o_(r) {
          return ep(Ro(r));
        }
        function a_(r, i) {
          var u = Ro(r);
          return Ws(u, Bi(i, 0, u.length));
        }
        function ga(r, i, u, d) {
          if (!Dt(r))
            return r;
          i = yi(i, r);
          for (var m = -1, N = i.length, L = N - 1, k = r; k != null && ++m < N; ) {
            var Y = wr(i[m]), oe = u;
            if (Y === "__proto__" || Y === "constructor" || Y === "prototype")
              return r;
            if (m != L) {
              var ae = k[Y];
              oe = d ? d(ae, Y, k) : n, oe === n && (oe = Dt(ae) ? ae : Qr(i[m + 1]) ? [] : {});
            }
            da(k, Y, oe), k = k[Y];
          }
          return r;
        }
        var Ep = Rs ? function(r, i) {
          return Rs.set(r, i), r;
        } : On, s_ = Ns ? function(r, i) {
          return Ns(r, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Tf(i),
            writable: !0
          });
        } : On;
        function u_(r) {
          return Ws(Ro(r));
        }
        function qn(r, i, u) {
          var d = -1, m = r.length;
          i < 0 && (i = -i > m ? 0 : m + i), u = u > m ? m : u, u < 0 && (u += m), m = i > u ? 0 : u - i >>> 0, i >>>= 0;
          for (var N = K(m); ++d < m; )
            N[d] = r[d + i];
          return N;
        }
        function l_(r, i) {
          var u;
          return Ei(r, function(d, m, N) {
            return u = i(d, m, N), !u;
          }), !!u;
        }
        function Ps(r, i, u) {
          var d = 0, m = r == null ? d : r.length;
          if (typeof i == "number" && i === i && m <= Ee) {
            for (; d < m; ) {
              var N = d + m >>> 1, L = r[N];
              L !== null && !Un(L) && (u ? L <= i : L < i) ? d = N + 1 : m = N;
            }
            return m;
          }
          return jl(r, i, On, u);
        }
        function jl(r, i, u, d) {
          var m = 0, N = r == null ? 0 : r.length;
          if (N === 0)
            return 0;
          i = u(i);
          for (var L = i !== i, k = i === null, Y = Un(i), oe = i === n; m < N; ) {
            var ae = Is((m + N) / 2), ce = u(r[ae]), Ne = ce !== n, De = ce === null, je = ce === ce, nt = Un(ce);
            if (L)
              var Ke = d || je;
            else oe ? Ke = je && (d || Ne) : k ? Ke = je && Ne && (d || !De) : Y ? Ke = je && Ne && !De && (d || !nt) : De || nt ? Ke = !1 : Ke = d ? ce <= i : ce < i;
            Ke ? m = ae + 1 : N = ae;
          }
          return fn(N, he);
        }
        function _p(r, i) {
          for (var u = -1, d = r.length, m = 0, N = []; ++u < d; ) {
            var L = r[u], k = i ? i(L) : L;
            if (!u || !dr(k, Y)) {
              var Y = k;
              N[m++] = L === 0 ? 0 : L;
            }
          }
          return N;
        }
        function yp(r) {
          return typeof r == "number" ? r : Un(r) ? Ie : +r;
        }
        function Pn(r) {
          if (typeof r == "string")
            return r;
          if (Qe(r))
            return Ct(r, Pn) + "";
          if (Un(r))
            return Zd ? Zd.call(r) : "";
          var i = r + "";
          return i == "0" && 1 / r == -se ? "-0" : i;
        }
        function _i(r, i, u) {
          var d = -1, m = hs, N = r.length, L = !0, k = [], Y = k;
          if (u)
            L = !1, m = bl;
          else if (N >= a) {
            var oe = i ? null : y_(r);
            if (oe)
              return gs(oe);
            L = !1, m = aa, Y = new Fi();
          } else
            Y = i ? [] : k;
          e:
            for (; ++d < N; ) {
              var ae = r[d], ce = i ? i(ae) : ae;
              if (ae = u || ae !== 0 ? ae : 0, L && ce === ce) {
                for (var Ne = Y.length; Ne--; )
                  if (Y[Ne] === ce)
                    continue e;
                i && Y.push(ce), k.push(ae);
              } else m(Y, ce, u) || (Y !== k && Y.push(ce), k.push(ae));
            }
          return k;
        }
        function Kl(r, i) {
          return i = yi(i, r), r = jp(r, i), r == null || delete r[wr(Jn(i))];
        }
        function Tp(r, i, u, d) {
          return ga(r, i, u(Hi(r, i)), d);
        }
        function Us(r, i, u, d) {
          for (var m = r.length, N = d ? m : -1; (d ? N-- : ++N < m) && i(r[N], N, r); )
            ;
          return u ? qn(r, d ? 0 : N, d ? N + 1 : m) : qn(r, d ? N + 1 : 0, d ? m : N);
        }
        function Ap(r, i) {
          var u = r;
          return u instanceof st && (u = u.value()), Ol(i, function(d, m) {
            return m.func.apply(m.thisArg, vi([d], m.args));
          }, u);
        }
        function ql(r, i, u) {
          var d = r.length;
          if (d < 2)
            return d ? _i(r[0]) : [];
          for (var m = -1, N = K(d); ++m < d; )
            for (var L = r[m], k = -1; ++k < d; )
              k != m && (N[m] = pa(N[m] || L, r[k], i, u));
          return _i(un(N, 1), i, u);
        }
        function bp(r, i, u) {
          for (var d = -1, m = r.length, N = i.length, L = {}; ++d < m; ) {
            var k = d < N ? i[d] : n;
            u(L, r[d], k);
          }
          return L;
        }
        function Jl(r) {
          return Ht(r) ? r : [];
        }
        function Zl(r) {
          return typeof r == "function" ? r : On;
        }
        function yi(r, i) {
          return Qe(r) ? r : uf(r, i) ? [r] : Zp(yt(r));
        }
        var f_ = rt;
        function Ti(r, i, u) {
          var d = r.length;
          return u = u === n ? d : u, !i && u >= d ? r : qn(r, i, u);
        }
        var Op = JE || function(r) {
          return sn.clearTimeout(r);
        };
        function Np(r, i) {
          if (i)
            return r.slice();
          var u = r.length, d = Yd ? Yd(u) : new r.constructor(u);
          return r.copy(d), d;
        }
        function Ql(r) {
          var i = new r.constructor(r.byteLength);
          return new As(i).set(new As(r)), i;
        }
        function c_(r, i) {
          var u = i ? Ql(r.buffer) : r.buffer;
          return new r.constructor(u, r.byteOffset, r.byteLength);
        }
        function d_(r) {
          var i = new r.constructor(r.source, os.exec(r));
          return i.lastIndex = r.lastIndex, i;
        }
        function p_(r) {
          return ca ? Nt(ca.call(r)) : {};
        }
        function Sp(r, i) {
          var u = i ? Ql(r.buffer) : r.buffer;
          return new r.constructor(u, r.byteOffset, r.length);
        }
        function Ip(r, i) {
          if (r !== i) {
            var u = r !== n, d = r === null, m = r === r, N = Un(r), L = i !== n, k = i === null, Y = i === i, oe = Un(i);
            if (!k && !oe && !N && r > i || N && L && Y && !k && !oe || d && L && Y || !u && Y || !m)
              return 1;
            if (!d && !N && !oe && r < i || oe && u && m && !d && !N || k && u && m || !L && m || !Y)
              return -1;
          }
          return 0;
        }
        function h_(r, i, u) {
          for (var d = -1, m = r.criteria, N = i.criteria, L = m.length, k = u.length; ++d < L; ) {
            var Y = Ip(m[d], N[d]);
            if (Y) {
              if (d >= k)
                return Y;
              var oe = u[d];
              return Y * (oe == "desc" ? -1 : 1);
            }
          }
          return r.index - i.index;
        }
        function Rp(r, i, u, d) {
          for (var m = -1, N = r.length, L = u.length, k = -1, Y = i.length, oe = qt(N - L, 0), ae = K(Y + oe), ce = !d; ++k < Y; )
            ae[k] = i[k];
          for (; ++m < L; )
            (ce || m < N) && (ae[u[m]] = r[m]);
          for (; oe--; )
            ae[k++] = r[m++];
          return ae;
        }
        function wp(r, i, u, d) {
          for (var m = -1, N = r.length, L = -1, k = u.length, Y = -1, oe = i.length, ae = qt(N - k, 0), ce = K(ae + oe), Ne = !d; ++m < ae; )
            ce[m] = r[m];
          for (var De = m; ++Y < oe; )
            ce[De + Y] = i[Y];
          for (; ++L < k; )
            (Ne || m < N) && (ce[De + u[L]] = r[m++]);
          return ce;
        }
        function Tn(r, i) {
          var u = -1, d = r.length;
          for (i || (i = K(d)); ++u < d; )
            i[u] = r[u];
          return i;
        }
        function Rr(r, i, u, d) {
          var m = !u;
          u || (u = {});
          for (var N = -1, L = i.length; ++N < L; ) {
            var k = i[N], Y = d ? d(u[k], r[k], k, u, r) : n;
            Y === n && (Y = r[k]), m ? qr(u, k, Y) : da(u, k, Y);
          }
          return u;
        }
        function v_(r, i) {
          return Rr(r, sf(r), i);
        }
        function g_(r, i) {
          return Rr(r, Gp(r), i);
        }
        function $s(r, i) {
          return function(u, d) {
            var m = Qe(u) ? TE : k1, N = i ? i() : {};
            return m(u, r, ze(d, 2), N);
          };
        }
        function Oo(r) {
          return rt(function(i, u) {
            var d = -1, m = u.length, N = m > 1 ? u[m - 1] : n, L = m > 2 ? u[2] : n;
            for (N = r.length > 3 && typeof N == "function" ? (m--, N) : n, L && En(u[0], u[1], L) && (N = m < 3 ? n : N, m = 1), i = Nt(i); ++d < m; ) {
              var k = u[d];
              k && r(i, k, d, N);
            }
            return i;
          });
        }
        function xp(r, i) {
          return function(u, d) {
            if (u == null)
              return u;
            if (!An(u))
              return r(u, d);
            for (var m = u.length, N = i ? m : -1, L = Nt(u); (i ? N-- : ++N < m) && d(L[N], N, L) !== !1; )
              ;
            return u;
          };
        }
        function Cp(r) {
          return function(i, u, d) {
            for (var m = -1, N = Nt(i), L = d(i), k = L.length; k--; ) {
              var Y = L[r ? k : ++m];
              if (u(N[Y], Y, N) === !1)
                break;
            }
            return i;
          };
        }
        function m_(r, i, u) {
          var d = i & x, m = ma(r);
          function N() {
            var L = this && this !== sn && this instanceof N ? m : r;
            return L.apply(d ? u : this, arguments);
          }
          return N;
        }
        function Lp(r) {
          return function(i) {
            i = yt(i);
            var u = mo(i) ? fr(i) : n, d = u ? u[0] : i.charAt(0), m = u ? Ti(u, 1).join("") : i.slice(1);
            return d[r]() + m;
          };
        }
        function No(r) {
          return function(i) {
            return Ol(xh(wh(i).replace(El, "")), r, "");
          };
        }
        function ma(r) {
          return function() {
            var i = arguments;
            switch (i.length) {
              case 0:
                return new r();
              case 1:
                return new r(i[0]);
              case 2:
                return new r(i[0], i[1]);
              case 3:
                return new r(i[0], i[1], i[2]);
              case 4:
                return new r(i[0], i[1], i[2], i[3]);
              case 5:
                return new r(i[0], i[1], i[2], i[3], i[4]);
              case 6:
                return new r(i[0], i[1], i[2], i[3], i[4], i[5]);
              case 7:
                return new r(i[0], i[1], i[2], i[3], i[4], i[5], i[6]);
            }
            var u = bo(r.prototype), d = r.apply(u, i);
            return Dt(d) ? d : u;
          };
        }
        function E_(r, i, u) {
          var d = ma(r);
          function m() {
            for (var N = arguments.length, L = K(N), k = N, Y = So(m); k--; )
              L[k] = arguments[k];
            var oe = N < 3 && L[0] !== Y && L[N - 1] !== Y ? [] : gi(L, Y);
            if (N -= oe.length, N < u)
              return $p(
                r,
                i,
                ks,
                m.placeholder,
                n,
                L,
                oe,
                n,
                n,
                u - N
              );
            var ae = this && this !== sn && this instanceof m ? d : r;
            return Mn(ae, this, L);
          }
          return m;
        }
        function Mp(r) {
          return function(i, u, d) {
            var m = Nt(i);
            if (!An(i)) {
              var N = ze(u, 3);
              i = rn(i), u = function(k) {
                return N(m[k], k, m);
              };
            }
            var L = r(i, u, d);
            return L > -1 ? m[N ? i[L] : L] : n;
          };
        }
        function Dp(r) {
          return Zr(function(i) {
            var u = i.length, d = u, m = jn.prototype.thru;
            for (r && i.reverse(); d--; ) {
              var N = i[d];
              if (typeof N != "function")
                throw new Vn(l);
              if (m && !L && Gs(N) == "wrapper")
                var L = new jn([], !0);
            }
            for (d = L ? d : u; ++d < u; ) {
              N = i[d];
              var k = Gs(N), Y = k == "wrapper" ? of(N) : n;
              Y && lf(Y[0]) && Y[1] == (U | P | H | _) && !Y[4].length && Y[9] == 1 ? L = L[Gs(Y[0])].apply(L, Y[3]) : L = N.length == 1 && lf(N) ? L[k]() : L.thru(N);
            }
            return function() {
              var oe = arguments, ae = oe[0];
              if (L && oe.length == 1 && Qe(ae))
                return L.plant(ae).value();
              for (var ce = 0, Ne = u ? i[ce].apply(this, oe) : ae; ++ce < u; )
                Ne = i[ce].call(this, Ne);
              return Ne;
            };
          });
        }
        function ks(r, i, u, d, m, N, L, k, Y, oe) {
          var ae = i & U, ce = i & x, Ne = i & I, De = i & (P | g), je = i & A, nt = Ne ? n : ma(r);
          function Ke() {
            for (var ot = arguments.length, ut = K(ot), $n = ot; $n--; )
              ut[$n] = arguments[$n];
            if (De)
              var _n = So(Ke), kn = xE(ut, _n);
            if (d && (ut = Rp(ut, d, m, De)), N && (ut = wp(ut, N, L, De)), ot -= kn, De && ot < oe) {
              var Gt = gi(ut, _n);
              return $p(
                r,
                i,
                ks,
                Ke.placeholder,
                u,
                ut,
                Gt,
                k,
                Y,
                oe - ot
              );
            }
            var pr = ce ? u : this, ni = Ne ? pr[r] : r;
            return ot = ut.length, k ? ut = k_(ut, k) : je && ot > 1 && ut.reverse(), ae && Y < ot && (ut.length = Y), this && this !== sn && this instanceof Ke && (ni = nt || ma(ni)), ni.apply(pr, ut);
          }
          return Ke;
        }
        function Pp(r, i) {
          return function(u, d) {
            return Y1(u, r, i(d), {});
          };
        }
        function Fs(r, i) {
          return function(u, d) {
            var m;
            if (u === n && d === n)
              return i;
            if (u !== n && (m = u), d !== n) {
              if (m === n)
                return d;
              typeof u == "string" || typeof d == "string" ? (u = Pn(u), d = Pn(d)) : (u = yp(u), d = yp(d)), m = r(u, d);
            }
            return m;
          };
        }
        function ef(r) {
          return Zr(function(i) {
            return i = Ct(i, Dn(ze())), rt(function(u) {
              var d = this;
              return r(i, function(m) {
                return Mn(m, d, u);
              });
            });
          });
        }
        function Bs(r, i) {
          i = i === n ? " " : Pn(i);
          var u = i.length;
          if (u < 2)
            return u ? Vl(i, r) : i;
          var d = Vl(i, Ss(r / Eo(i)));
          return mo(i) ? Ti(fr(d), 0, r).join("") : d.slice(0, r);
        }
        function __(r, i, u, d) {
          var m = i & x, N = ma(r);
          function L() {
            for (var k = -1, Y = arguments.length, oe = -1, ae = d.length, ce = K(ae + Y), Ne = this && this !== sn && this instanceof L ? N : r; ++oe < ae; )
              ce[oe] = d[oe];
            for (; Y--; )
              ce[oe++] = arguments[++k];
            return Mn(Ne, m ? u : this, ce);
          }
          return L;
        }
        function Up(r) {
          return function(i, u, d) {
            return d && typeof d != "number" && En(i, u, d) && (u = d = n), i = ti(i), u === n ? (u = i, i = 0) : u = ti(u), d = d === n ? i < u ? 1 : -1 : ti(d), i_(i, u, d, r);
          };
        }
        function Hs(r) {
          return function(i, u) {
            return typeof i == "string" && typeof u == "string" || (i = Zn(i), u = Zn(u)), r(i, u);
          };
        }
        function $p(r, i, u, d, m, N, L, k, Y, oe) {
          var ae = i & P, ce = ae ? L : n, Ne = ae ? n : L, De = ae ? N : n, je = ae ? n : N;
          i |= ae ? H : $, i &= ~(ae ? $ : H), i & F || (i &= -4);
          var nt = [
            r,
            i,
            m,
            De,
            ce,
            je,
            Ne,
            k,
            Y,
            oe
          ], Ke = u.apply(n, nt);
          return lf(r) && Kp(Ke, nt), Ke.placeholder = d, qp(Ke, r, i);
        }
        function tf(r) {
          var i = Kt[r];
          return function(u, d) {
            if (u = Zn(u), d = d == null ? 0 : fn(tt(d), 292), d && qd(u)) {
              var m = (yt(u) + "e").split("e"), N = i(m[0] + "e" + (+m[1] + d));
              return m = (yt(N) + "e").split("e"), +(m[0] + "e" + (+m[1] - d));
            }
            return i(u);
          };
        }
        var y_ = To && 1 / gs(new To([, -0]))[1] == se ? function(r) {
          return new To(r);
        } : Of;
        function kp(r) {
          return function(i) {
            var u = cn(i);
            return u == Ye ? Cl(i) : u == vt ? $E(i) : wE(i, r(i));
          };
        }
        function Jr(r, i, u, d, m, N, L, k) {
          var Y = i & I;
          if (!Y && typeof r != "function")
            throw new Vn(l);
          var oe = d ? d.length : 0;
          if (oe || (i &= -97, d = m = n), L = L === n ? L : qt(tt(L), 0), k = k === n ? k : tt(k), oe -= m ? m.length : 0, i & $) {
            var ae = d, ce = m;
            d = m = n;
          }
          var Ne = Y ? n : of(r), De = [
            r,
            i,
            u,
            d,
            m,
            ae,
            ce,
            N,
            L,
            k
          ];
          if (Ne && P_(De, Ne), r = De[0], i = De[1], u = De[2], d = De[3], m = De[4], k = De[9] = De[9] === n ? Y ? 0 : r.length : qt(De[9] - oe, 0), !k && i & (P | g) && (i &= -25), !i || i == x)
            var je = m_(r, i, u);
          else i == P || i == g ? je = E_(r, i, k) : (i == H || i == (x | H)) && !m.length ? je = __(r, i, u, d) : je = ks.apply(n, De);
          var nt = Ne ? Ep : Kp;
          return qp(nt(je, De), r, i);
        }
        function Fp(r, i, u, d) {
          return r === n || dr(r, yo[u]) && !Tt.call(d, u) ? i : r;
        }
        function Bp(r, i, u, d, m, N) {
          return Dt(r) && Dt(i) && (N.set(i, r), Ds(r, i, n, Bp, N), N.delete(i)), r;
        }
        function T_(r) {
          return ya(r) ? n : r;
        }
        function Hp(r, i, u, d, m, N) {
          var L = u & R, k = r.length, Y = i.length;
          if (k != Y && !(L && Y > k))
            return !1;
          var oe = N.get(r), ae = N.get(i);
          if (oe && ae)
            return oe == i && ae == r;
          var ce = -1, Ne = !0, De = u & T ? new Fi() : n;
          for (N.set(r, i), N.set(i, r); ++ce < k; ) {
            var je = r[ce], nt = i[ce];
            if (d)
              var Ke = L ? d(nt, je, ce, i, r, N) : d(je, nt, ce, r, i, N);
            if (Ke !== n) {
              if (Ke)
                continue;
              Ne = !1;
              break;
            }
            if (De) {
              if (!Nl(i, function(ot, ut) {
                if (!aa(De, ut) && (je === ot || m(je, ot, u, d, N)))
                  return De.push(ut);
              })) {
                Ne = !1;
                break;
              }
            } else if (!(je === nt || m(je, nt, u, d, N))) {
              Ne = !1;
              break;
            }
          }
          return N.delete(r), N.delete(i), Ne;
        }
        function A_(r, i, u, d, m, N, L) {
          switch (u) {
            case jt:
              if (r.byteLength != i.byteLength || r.byteOffset != i.byteOffset)
                return !1;
              r = r.buffer, i = i.buffer;
            case Wt:
              return !(r.byteLength != i.byteLength || !N(new As(r), new As(i)));
            case W:
            case J:
            case pt:
              return dr(+r, +i);
            case ie:
              return r.name == i.name && r.message == i.message;
            case At:
            case Vt:
              return r == i + "";
            case Ye:
              var k = Cl;
            case vt:
              var Y = d & R;
              if (k || (k = gs), r.size != i.size && !Y)
                return !1;
              var oe = L.get(r);
              if (oe)
                return oe == i;
              d |= T, L.set(r, i);
              var ae = Hp(k(r), k(i), d, m, N, L);
              return L.delete(r), ae;
            case Mt:
              if (ca)
                return ca.call(r) == ca.call(i);
          }
          return !1;
        }
        function b_(r, i, u, d, m, N) {
          var L = u & R, k = nf(r), Y = k.length, oe = nf(i), ae = oe.length;
          if (Y != ae && !L)
            return !1;
          for (var ce = Y; ce--; ) {
            var Ne = k[ce];
            if (!(L ? Ne in i : Tt.call(i, Ne)))
              return !1;
          }
          var De = N.get(r), je = N.get(i);
          if (De && je)
            return De == i && je == r;
          var nt = !0;
          N.set(r, i), N.set(i, r);
          for (var Ke = L; ++ce < Y; ) {
            Ne = k[ce];
            var ot = r[Ne], ut = i[Ne];
            if (d)
              var $n = L ? d(ut, ot, Ne, i, r, N) : d(ot, ut, Ne, r, i, N);
            if (!($n === n ? ot === ut || m(ot, ut, u, d, N) : $n)) {
              nt = !1;
              break;
            }
            Ke || (Ke = Ne == "constructor");
          }
          if (nt && !Ke) {
            var _n = r.constructor, kn = i.constructor;
            _n != kn && "constructor" in r && "constructor" in i && !(typeof _n == "function" && _n instanceof _n && typeof kn == "function" && kn instanceof kn) && (nt = !1);
          }
          return N.delete(r), N.delete(i), nt;
        }
        function Zr(r) {
          return cf(Vp(r, n, nh), r + "");
        }
        function nf(r) {
          return sp(r, rn, sf);
        }
        function rf(r) {
          return sp(r, bn, Gp);
        }
        var of = Rs ? function(r) {
          return Rs.get(r);
        } : Of;
        function Gs(r) {
          for (var i = r.name + "", u = Ao[i], d = Tt.call(Ao, i) ? u.length : 0; d--; ) {
            var m = u[d], N = m.func;
            if (N == null || N == r)
              return m.name;
          }
          return i;
        }
        function So(r) {
          var i = Tt.call(y, "placeholder") ? y : r;
          return i.placeholder;
        }
        function ze() {
          var r = y.iteratee || Af;
          return r = r === Af ? fp : r, arguments.length ? r(arguments[0], arguments[1]) : r;
        }
        function zs(r, i) {
          var u = r.__data__;
          return C_(i) ? u[typeof i == "string" ? "string" : "hash"] : u.map;
        }
        function af(r) {
          for (var i = rn(r), u = i.length; u--; ) {
            var d = i[u], m = r[d];
            i[u] = [d, m, Xp(m)];
          }
          return i;
        }
        function Gi(r, i) {
          var u = DE(r, i);
          return lp(u) ? u : n;
        }
        function O_(r) {
          var i = Tt.call(r, $i), u = r[$i];
          try {
            r[$i] = n;
            var d = !0;
          } catch {
          }
          var m = ys.call(r);
          return d && (i ? r[$i] = u : delete r[$i]), m;
        }
        var sf = Ml ? function(r) {
          return r == null ? [] : (r = Nt(r), hi(Ml(r), function(i) {
            return jd.call(r, i);
          }));
        } : Nf, Gp = Ml ? function(r) {
          for (var i = []; r; )
            vi(i, sf(r)), r = bs(r);
          return i;
        } : Nf, cn = mn;
        (Dl && cn(new Dl(new ArrayBuffer(1))) != jt || ua && cn(new ua()) != Ye || Pl && cn(Pl.resolve()) != Yt || To && cn(new To()) != vt || la && cn(new la()) != Qt) && (cn = function(r) {
          var i = mn(r), u = i == ht ? r.constructor : n, d = u ? zi(u) : "";
          if (d)
            switch (d) {
              case a1:
                return jt;
              case s1:
                return Ye;
              case u1:
                return Yt;
              case l1:
                return vt;
              case f1:
                return Qt;
            }
          return i;
        });
        function N_(r, i, u) {
          for (var d = -1, m = u.length; ++d < m; ) {
            var N = u[d], L = N.size;
            switch (N.type) {
              case "drop":
                r += L;
                break;
              case "dropRight":
                i -= L;
                break;
              case "take":
                i = fn(i, r + L);
                break;
              case "takeRight":
                r = qt(r, i - L);
                break;
            }
          }
          return { start: r, end: i };
        }
        function S_(r) {
          var i = r.match(ea);
          return i ? i[1].split(ta) : [];
        }
        function zp(r, i, u) {
          i = yi(i, r);
          for (var d = -1, m = i.length, N = !1; ++d < m; ) {
            var L = wr(i[d]);
            if (!(N = r != null && u(r, L)))
              break;
            r = r[L];
          }
          return N || ++d != m ? N : (m = r == null ? 0 : r.length, !!m && qs(m) && Qr(L, m) && (Qe(r) || Wi(r)));
        }
        function I_(r) {
          var i = r.length, u = new r.constructor(i);
          return i && typeof r[0] == "string" && Tt.call(r, "index") && (u.index = r.index, u.input = r.input), u;
        }
        function Wp(r) {
          return typeof r.constructor == "function" && !Ea(r) ? bo(bs(r)) : {};
        }
        function R_(r, i, u) {
          var d = r.constructor;
          switch (i) {
            case Wt:
              return Ql(r);
            case W:
            case J:
              return new d(+r);
            case jt:
              return c_(r, u);
            case zr:
            case Wr:
            case Xr:
            case Yr:
            case Vr:
            case C:
            case ee:
            case pe:
            case xe:
              return Sp(r, u);
            case Ye:
              return new d();
            case pt:
            case Vt:
              return new d(r);
            case At:
              return d_(r);
            case vt:
              return new d();
            case Mt:
              return p_(r);
          }
        }
        function w_(r, i) {
          var u = i.length;
          if (!u)
            return r;
          var d = u - 1;
          return i[d] = (u > 1 ? "& " : "") + i[d], i = i.join(u > 2 ? ", " : " "), r.replace(xi, `{
/* [wrapped with ` + i + `] */
`);
        }
        function x_(r) {
          return Qe(r) || Wi(r) || !!(Kd && r && r[Kd]);
        }
        function Qr(r, i) {
          var u = typeof r;
          return i = i ?? ue, !!i && (u == "number" || u != "symbol" && hl.test(r)) && r > -1 && r % 1 == 0 && r < i;
        }
        function En(r, i, u) {
          if (!Dt(u))
            return !1;
          var d = typeof i;
          return (d == "number" ? An(u) && Qr(i, u.length) : d == "string" && i in u) ? dr(u[i], r) : !1;
        }
        function uf(r, i) {
          if (Qe(r))
            return !1;
          var u = typeof r;
          return u == "number" || u == "symbol" || u == "boolean" || r == null || Un(r) ? !0 : ct.test(r) || !gt.test(r) || i != null && r in Nt(i);
        }
        function C_(r) {
          var i = typeof r;
          return i == "string" || i == "number" || i == "symbol" || i == "boolean" ? r !== "__proto__" : r === null;
        }
        function lf(r) {
          var i = Gs(r), u = y[i];
          if (typeof u != "function" || !(i in st.prototype))
            return !1;
          if (r === u)
            return !0;
          var d = of(u);
          return !!d && r === d[0];
        }
        function L_(r) {
          return !!Xd && Xd in r;
        }
        var M_ = Es ? ei : Sf;
        function Ea(r) {
          var i = r && r.constructor, u = typeof i == "function" && i.prototype || yo;
          return r === u;
        }
        function Xp(r) {
          return r === r && !Dt(r);
        }
        function Yp(r, i) {
          return function(u) {
            return u == null ? !1 : u[r] === i && (i !== n || r in Nt(u));
          };
        }
        function D_(r) {
          var i = js(r, function(d) {
            return u.size === p && u.clear(), d;
          }), u = i.cache;
          return i;
        }
        function P_(r, i) {
          var u = r[1], d = i[1], m = u | d, N = m < (x | I | U), L = d == U && u == P || d == U && u == _ && r[7].length <= i[8] || d == (U | _) && i[7].length <= i[8] && u == P;
          if (!(N || L))
            return r;
          d & x && (r[2] = i[2], m |= u & x ? 0 : F);
          var k = i[3];
          if (k) {
            var Y = r[3];
            r[3] = Y ? Rp(Y, k, i[4]) : k, r[4] = Y ? gi(r[3], h) : i[4];
          }
          return k = i[5], k && (Y = r[5], r[5] = Y ? wp(Y, k, i[6]) : k, r[6] = Y ? gi(r[5], h) : i[6]), k = i[7], k && (r[7] = k), d & U && (r[8] = r[8] == null ? i[8] : fn(r[8], i[8])), r[9] == null && (r[9] = i[9]), r[0] = i[0], r[1] = m, r;
        }
        function U_(r) {
          var i = [];
          if (r != null)
            for (var u in Nt(r))
              i.push(u);
          return i;
        }
        function $_(r) {
          return ys.call(r);
        }
        function Vp(r, i, u) {
          return i = qt(i === n ? r.length - 1 : i, 0), function() {
            for (var d = arguments, m = -1, N = qt(d.length - i, 0), L = K(N); ++m < N; )
              L[m] = d[i + m];
            m = -1;
            for (var k = K(i + 1); ++m < i; )
              k[m] = d[m];
            return k[i] = u(L), Mn(r, this, k);
          };
        }
        function jp(r, i) {
          return i.length < 2 ? r : Hi(r, qn(i, 0, -1));
        }
        function k_(r, i) {
          for (var u = r.length, d = fn(i.length, u), m = Tn(r); d--; ) {
            var N = i[d];
            r[d] = Qr(N, u) ? m[N] : n;
          }
          return r;
        }
        function ff(r, i) {
          if (!(i === "constructor" && typeof r[i] == "function") && i != "__proto__")
            return r[i];
        }
        var Kp = Jp(Ep), _a = QE || function(r, i) {
          return sn.setTimeout(r, i);
        }, cf = Jp(s_);
        function qp(r, i, u) {
          var d = i + "";
          return cf(r, w_(d, F_(S_(d), u)));
        }
        function Jp(r) {
          var i = 0, u = 0;
          return function() {
            var d = r1(), m = ye - (d - u);
            if (u = d, m > 0) {
              if (++i >= _e)
                return arguments[0];
            } else
              i = 0;
            return r.apply(n, arguments);
          };
        }
        function Ws(r, i) {
          var u = -1, d = r.length, m = d - 1;
          for (i = i === n ? d : i; ++u < i; ) {
            var N = Yl(u, m), L = r[N];
            r[N] = r[u], r[u] = L;
          }
          return r.length = i, r;
        }
        var Zp = D_(function(r) {
          var i = [];
          return r.charCodeAt(0) === 46 && i.push(""), r.replace(Ce, function(u, d, m, N) {
            i.push(m ? N.replace(fl, "$1") : d || u);
          }), i;
        });
        function wr(r) {
          if (typeof r == "string" || Un(r))
            return r;
          var i = r + "";
          return i == "0" && 1 / r == -se ? "-0" : i;
        }
        function zi(r) {
          if (r != null) {
            try {
              return _s.call(r);
            } catch {
            }
            try {
              return r + "";
            } catch {
            }
          }
          return "";
        }
        function F_(r, i) {
          return Yn(le, function(u) {
            var d = "_." + u[0];
            i & u[1] && !hs(r, d) && r.push(d);
          }), r.sort();
        }
        function Qp(r) {
          if (r instanceof st)
            return r.clone();
          var i = new jn(r.__wrapped__, r.__chain__);
          return i.__actions__ = Tn(r.__actions__), i.__index__ = r.__index__, i.__values__ = r.__values__, i;
        }
        function B_(r, i, u) {
          (u ? En(r, i, u) : i === n) ? i = 1 : i = qt(tt(i), 0);
          var d = r == null ? 0 : r.length;
          if (!d || i < 1)
            return [];
          for (var m = 0, N = 0, L = K(Ss(d / i)); m < d; )
            L[N++] = qn(r, m, m += i);
          return L;
        }
        function H_(r) {
          for (var i = -1, u = r == null ? 0 : r.length, d = 0, m = []; ++i < u; ) {
            var N = r[i];
            N && (m[d++] = N);
          }
          return m;
        }
        function G_() {
          var r = arguments.length;
          if (!r)
            return [];
          for (var i = K(r - 1), u = arguments[0], d = r; d--; )
            i[d - 1] = arguments[d];
          return vi(Qe(u) ? Tn(u) : [u], un(i, 1));
        }
        var z_ = rt(function(r, i) {
          return Ht(r) ? pa(r, un(i, 1, Ht, !0)) : [];
        }), W_ = rt(function(r, i) {
          var u = Jn(i);
          return Ht(u) && (u = n), Ht(r) ? pa(r, un(i, 1, Ht, !0), ze(u, 2)) : [];
        }), X_ = rt(function(r, i) {
          var u = Jn(i);
          return Ht(u) && (u = n), Ht(r) ? pa(r, un(i, 1, Ht, !0), n, u) : [];
        });
        function Y_(r, i, u) {
          var d = r == null ? 0 : r.length;
          return d ? (i = u || i === n ? 1 : tt(i), qn(r, i < 0 ? 0 : i, d)) : [];
        }
        function V_(r, i, u) {
          var d = r == null ? 0 : r.length;
          return d ? (i = u || i === n ? 1 : tt(i), i = d - i, qn(r, 0, i < 0 ? 0 : i)) : [];
        }
        function j_(r, i) {
          return r && r.length ? Us(r, ze(i, 3), !0, !0) : [];
        }
        function K_(r, i) {
          return r && r.length ? Us(r, ze(i, 3), !0) : [];
        }
        function q_(r, i, u, d) {
          var m = r == null ? 0 : r.length;
          return m ? (u && typeof u != "number" && En(r, i, u) && (u = 0, d = m), G1(r, i, u, d)) : [];
        }
        function eh(r, i, u) {
          var d = r == null ? 0 : r.length;
          if (!d)
            return -1;
          var m = u == null ? 0 : tt(u);
          return m < 0 && (m = qt(d + m, 0)), vs(r, ze(i, 3), m);
        }
        function th(r, i, u) {
          var d = r == null ? 0 : r.length;
          if (!d)
            return -1;
          var m = d - 1;
          return u !== n && (m = tt(u), m = u < 0 ? qt(d + m, 0) : fn(m, d - 1)), vs(r, ze(i, 3), m, !0);
        }
        function nh(r) {
          var i = r == null ? 0 : r.length;
          return i ? un(r, 1) : [];
        }
        function J_(r) {
          var i = r == null ? 0 : r.length;
          return i ? un(r, se) : [];
        }
        function Z_(r, i) {
          var u = r == null ? 0 : r.length;
          return u ? (i = i === n ? 1 : tt(i), un(r, i)) : [];
        }
        function Q_(r) {
          for (var i = -1, u = r == null ? 0 : r.length, d = {}; ++i < u; ) {
            var m = r[i];
            d[m[0]] = m[1];
          }
          return d;
        }
        function rh(r) {
          return r && r.length ? r[0] : n;
        }
        function ey(r, i, u) {
          var d = r == null ? 0 : r.length;
          if (!d)
            return -1;
          var m = u == null ? 0 : tt(u);
          return m < 0 && (m = qt(d + m, 0)), go(r, i, m);
        }
        function ty(r) {
          var i = r == null ? 0 : r.length;
          return i ? qn(r, 0, -1) : [];
        }
        var ny = rt(function(r) {
          var i = Ct(r, Jl);
          return i.length && i[0] === r[0] ? Hl(i) : [];
        }), ry = rt(function(r) {
          var i = Jn(r), u = Ct(r, Jl);
          return i === Jn(u) ? i = n : u.pop(), u.length && u[0] === r[0] ? Hl(u, ze(i, 2)) : [];
        }), iy = rt(function(r) {
          var i = Jn(r), u = Ct(r, Jl);
          return i = typeof i == "function" ? i : n, i && u.pop(), u.length && u[0] === r[0] ? Hl(u, n, i) : [];
        });
        function oy(r, i) {
          return r == null ? "" : t1.call(r, i);
        }
        function Jn(r) {
          var i = r == null ? 0 : r.length;
          return i ? r[i - 1] : n;
        }
        function ay(r, i, u) {
          var d = r == null ? 0 : r.length;
          if (!d)
            return -1;
          var m = d;
          return u !== n && (m = tt(u), m = m < 0 ? qt(d + m, 0) : fn(m, d - 1)), i === i ? FE(r, i, m) : vs(r, $d, m, !0);
        }
        function sy(r, i) {
          return r && r.length ? hp(r, tt(i)) : n;
        }
        var uy = rt(ih);
        function ih(r, i) {
          return r && r.length && i && i.length ? Xl(r, i) : r;
        }
        function ly(r, i, u) {
          return r && r.length && i && i.length ? Xl(r, i, ze(u, 2)) : r;
        }
        function fy(r, i, u) {
          return r && r.length && i && i.length ? Xl(r, i, n, u) : r;
        }
        var cy = Zr(function(r, i) {
          var u = r == null ? 0 : r.length, d = $l(r, i);
          return mp(r, Ct(i, function(m) {
            return Qr(m, u) ? +m : m;
          }).sort(Ip)), d;
        });
        function dy(r, i) {
          var u = [];
          if (!(r && r.length))
            return u;
          var d = -1, m = [], N = r.length;
          for (i = ze(i, 3); ++d < N; ) {
            var L = r[d];
            i(L, d, r) && (u.push(L), m.push(d));
          }
          return mp(r, m), u;
        }
        function df(r) {
          return r == null ? r : o1.call(r);
        }
        function py(r, i, u) {
          var d = r == null ? 0 : r.length;
          return d ? (u && typeof u != "number" && En(r, i, u) ? (i = 0, u = d) : (i = i == null ? 0 : tt(i), u = u === n ? d : tt(u)), qn(r, i, u)) : [];
        }
        function hy(r, i) {
          return Ps(r, i);
        }
        function vy(r, i, u) {
          return jl(r, i, ze(u, 2));
        }
        function gy(r, i) {
          var u = r == null ? 0 : r.length;
          if (u) {
            var d = Ps(r, i);
            if (d < u && dr(r[d], i))
              return d;
          }
          return -1;
        }
        function my(r, i) {
          return Ps(r, i, !0);
        }
        function Ey(r, i, u) {
          return jl(r, i, ze(u, 2), !0);
        }
        function _y(r, i) {
          var u = r == null ? 0 : r.length;
          if (u) {
            var d = Ps(r, i, !0) - 1;
            if (dr(r[d], i))
              return d;
          }
          return -1;
        }
        function yy(r) {
          return r && r.length ? _p(r) : [];
        }
        function Ty(r, i) {
          return r && r.length ? _p(r, ze(i, 2)) : [];
        }
        function Ay(r) {
          var i = r == null ? 0 : r.length;
          return i ? qn(r, 1, i) : [];
        }
        function by(r, i, u) {
          return r && r.length ? (i = u || i === n ? 1 : tt(i), qn(r, 0, i < 0 ? 0 : i)) : [];
        }
        function Oy(r, i, u) {
          var d = r == null ? 0 : r.length;
          return d ? (i = u || i === n ? 1 : tt(i), i = d - i, qn(r, i < 0 ? 0 : i, d)) : [];
        }
        function Ny(r, i) {
          return r && r.length ? Us(r, ze(i, 3), !1, !0) : [];
        }
        function Sy(r, i) {
          return r && r.length ? Us(r, ze(i, 3)) : [];
        }
        var Iy = rt(function(r) {
          return _i(un(r, 1, Ht, !0));
        }), Ry = rt(function(r) {
          var i = Jn(r);
          return Ht(i) && (i = n), _i(un(r, 1, Ht, !0), ze(i, 2));
        }), wy = rt(function(r) {
          var i = Jn(r);
          return i = typeof i == "function" ? i : n, _i(un(r, 1, Ht, !0), n, i);
        });
        function xy(r) {
          return r && r.length ? _i(r) : [];
        }
        function Cy(r, i) {
          return r && r.length ? _i(r, ze(i, 2)) : [];
        }
        function Ly(r, i) {
          return i = typeof i == "function" ? i : n, r && r.length ? _i(r, n, i) : [];
        }
        function pf(r) {
          if (!(r && r.length))
            return [];
          var i = 0;
          return r = hi(r, function(u) {
            if (Ht(u))
              return i = qt(u.length, i), !0;
          }), wl(i, function(u) {
            return Ct(r, Sl(u));
          });
        }
        function oh(r, i) {
          if (!(r && r.length))
            return [];
          var u = pf(r);
          return i == null ? u : Ct(u, function(d) {
            return Mn(i, n, d);
          });
        }
        var My = rt(function(r, i) {
          return Ht(r) ? pa(r, i) : [];
        }), Dy = rt(function(r) {
          return ql(hi(r, Ht));
        }), Py = rt(function(r) {
          var i = Jn(r);
          return Ht(i) && (i = n), ql(hi(r, Ht), ze(i, 2));
        }), Uy = rt(function(r) {
          var i = Jn(r);
          return i = typeof i == "function" ? i : n, ql(hi(r, Ht), n, i);
        }), $y = rt(pf);
        function ky(r, i) {
          return bp(r || [], i || [], da);
        }
        function Fy(r, i) {
          return bp(r || [], i || [], ga);
        }
        var By = rt(function(r) {
          var i = r.length, u = i > 1 ? r[i - 1] : n;
          return u = typeof u == "function" ? (r.pop(), u) : n, oh(r, u);
        });
        function ah(r) {
          var i = y(r);
          return i.__chain__ = !0, i;
        }
        function Hy(r, i) {
          return i(r), r;
        }
        function Xs(r, i) {
          return i(r);
        }
        var Gy = Zr(function(r) {
          var i = r.length, u = i ? r[0] : 0, d = this.__wrapped__, m = function(N) {
            return $l(N, r);
          };
          return i > 1 || this.__actions__.length || !(d instanceof st) || !Qr(u) ? this.thru(m) : (d = d.slice(u, +u + (i ? 1 : 0)), d.__actions__.push({
            func: Xs,
            args: [m],
            thisArg: n
          }), new jn(d, this.__chain__).thru(function(N) {
            return i && !N.length && N.push(n), N;
          }));
        });
        function zy() {
          return ah(this);
        }
        function Wy() {
          return new jn(this.value(), this.__chain__);
        }
        function Xy() {
          this.__values__ === n && (this.__values__ = yh(this.value()));
          var r = this.__index__ >= this.__values__.length, i = r ? n : this.__values__[this.__index__++];
          return { done: r, value: i };
        }
        function Yy() {
          return this;
        }
        function Vy(r) {
          for (var i, u = this; u instanceof xs; ) {
            var d = Qp(u);
            d.__index__ = 0, d.__values__ = n, i ? m.__wrapped__ = d : i = d;
            var m = d;
            u = u.__wrapped__;
          }
          return m.__wrapped__ = r, i;
        }
        function jy() {
          var r = this.__wrapped__;
          if (r instanceof st) {
            var i = r;
            return this.__actions__.length && (i = new st(this)), i = i.reverse(), i.__actions__.push({
              func: Xs,
              args: [df],
              thisArg: n
            }), new jn(i, this.__chain__);
          }
          return this.thru(df);
        }
        function Ky() {
          return Ap(this.__wrapped__, this.__actions__);
        }
        var qy = $s(function(r, i, u) {
          Tt.call(r, u) ? ++r[u] : qr(r, u, 1);
        });
        function Jy(r, i, u) {
          var d = Qe(r) ? Pd : H1;
          return u && En(r, i, u) && (i = n), d(r, ze(i, 3));
        }
        function Zy(r, i) {
          var u = Qe(r) ? hi : op;
          return u(r, ze(i, 3));
        }
        var Qy = Mp(eh), eT = Mp(th);
        function tT(r, i) {
          return un(Ys(r, i), 1);
        }
        function nT(r, i) {
          return un(Ys(r, i), se);
        }
        function rT(r, i, u) {
          return u = u === n ? 1 : tt(u), un(Ys(r, i), u);
        }
        function sh(r, i) {
          var u = Qe(r) ? Yn : Ei;
          return u(r, ze(i, 3));
        }
        function uh(r, i) {
          var u = Qe(r) ? AE : ip;
          return u(r, ze(i, 3));
        }
        var iT = $s(function(r, i, u) {
          Tt.call(r, u) ? r[u].push(i) : qr(r, u, [i]);
        });
        function oT(r, i, u, d) {
          r = An(r) ? r : Ro(r), u = u && !d ? tt(u) : 0;
          var m = r.length;
          return u < 0 && (u = qt(m + u, 0)), Js(r) ? u <= m && r.indexOf(i, u) > -1 : !!m && go(r, i, u) > -1;
        }
        var aT = rt(function(r, i, u) {
          var d = -1, m = typeof i == "function", N = An(r) ? K(r.length) : [];
          return Ei(r, function(L) {
            N[++d] = m ? Mn(i, L, u) : ha(L, i, u);
          }), N;
        }), sT = $s(function(r, i, u) {
          qr(r, u, i);
        });
        function Ys(r, i) {
          var u = Qe(r) ? Ct : cp;
          return u(r, ze(i, 3));
        }
        function uT(r, i, u, d) {
          return r == null ? [] : (Qe(i) || (i = i == null ? [] : [i]), u = d ? n : u, Qe(u) || (u = u == null ? [] : [u]), vp(r, i, u));
        }
        var lT = $s(function(r, i, u) {
          r[u ? 0 : 1].push(i);
        }, function() {
          return [[], []];
        });
        function fT(r, i, u) {
          var d = Qe(r) ? Ol : Fd, m = arguments.length < 3;
          return d(r, ze(i, 4), u, m, Ei);
        }
        function cT(r, i, u) {
          var d = Qe(r) ? bE : Fd, m = arguments.length < 3;
          return d(r, ze(i, 4), u, m, ip);
        }
        function dT(r, i) {
          var u = Qe(r) ? hi : op;
          return u(r, Ks(ze(i, 3)));
        }
        function pT(r) {
          var i = Qe(r) ? ep : o_;
          return i(r);
        }
        function hT(r, i, u) {
          (u ? En(r, i, u) : i === n) ? i = 1 : i = tt(i);
          var d = Qe(r) ? U1 : a_;
          return d(r, i);
        }
        function vT(r) {
          var i = Qe(r) ? $1 : u_;
          return i(r);
        }
        function gT(r) {
          if (r == null)
            return 0;
          if (An(r))
            return Js(r) ? Eo(r) : r.length;
          var i = cn(r);
          return i == Ye || i == vt ? r.size : zl(r).length;
        }
        function mT(r, i, u) {
          var d = Qe(r) ? Nl : l_;
          return u && En(r, i, u) && (i = n), d(r, ze(i, 3));
        }
        var ET = rt(function(r, i) {
          if (r == null)
            return [];
          var u = i.length;
          return u > 1 && En(r, i[0], i[1]) ? i = [] : u > 2 && En(i[0], i[1], i[2]) && (i = [i[0]]), vp(r, un(i, 1), []);
        }), Vs = ZE || function() {
          return sn.Date.now();
        };
        function _T(r, i) {
          if (typeof i != "function")
            throw new Vn(l);
          return r = tt(r), function() {
            if (--r < 1)
              return i.apply(this, arguments);
          };
        }
        function lh(r, i, u) {
          return i = u ? n : i, i = r && i == null ? r.length : i, Jr(r, U, n, n, n, n, i);
        }
        function fh(r, i) {
          var u;
          if (typeof i != "function")
            throw new Vn(l);
          return r = tt(r), function() {
            return --r > 0 && (u = i.apply(this, arguments)), r <= 1 && (i = n), u;
          };
        }
        var hf = rt(function(r, i, u) {
          var d = x;
          if (u.length) {
            var m = gi(u, So(hf));
            d |= H;
          }
          return Jr(r, d, i, u, m);
        }), ch = rt(function(r, i, u) {
          var d = x | I;
          if (u.length) {
            var m = gi(u, So(ch));
            d |= H;
          }
          return Jr(i, d, r, u, m);
        });
        function dh(r, i, u) {
          i = u ? n : i;
          var d = Jr(r, P, n, n, n, n, n, i);
          return d.placeholder = dh.placeholder, d;
        }
        function ph(r, i, u) {
          i = u ? n : i;
          var d = Jr(r, g, n, n, n, n, n, i);
          return d.placeholder = ph.placeholder, d;
        }
        function hh(r, i, u) {
          var d, m, N, L, k, Y, oe = 0, ae = !1, ce = !1, Ne = !0;
          if (typeof r != "function")
            throw new Vn(l);
          i = Zn(i) || 0, Dt(u) && (ae = !!u.leading, ce = "maxWait" in u, N = ce ? qt(Zn(u.maxWait) || 0, i) : N, Ne = "trailing" in u ? !!u.trailing : Ne);
          function De(Gt) {
            var pr = d, ni = m;
            return d = m = n, oe = Gt, L = r.apply(ni, pr), L;
          }
          function je(Gt) {
            return oe = Gt, k = _a(ot, i), ae ? De(Gt) : L;
          }
          function nt(Gt) {
            var pr = Gt - Y, ni = Gt - oe, Mh = i - pr;
            return ce ? fn(Mh, N - ni) : Mh;
          }
          function Ke(Gt) {
            var pr = Gt - Y, ni = Gt - oe;
            return Y === n || pr >= i || pr < 0 || ce && ni >= N;
          }
          function ot() {
            var Gt = Vs();
            if (Ke(Gt))
              return ut(Gt);
            k = _a(ot, nt(Gt));
          }
          function ut(Gt) {
            return k = n, Ne && d ? De(Gt) : (d = m = n, L);
          }
          function $n() {
            k !== n && Op(k), oe = 0, d = Y = m = k = n;
          }
          function _n() {
            return k === n ? L : ut(Vs());
          }
          function kn() {
            var Gt = Vs(), pr = Ke(Gt);
            if (d = arguments, m = this, Y = Gt, pr) {
              if (k === n)
                return je(Y);
              if (ce)
                return Op(k), k = _a(ot, i), De(Y);
            }
            return k === n && (k = _a(ot, i)), L;
          }
          return kn.cancel = $n, kn.flush = _n, kn;
        }
        var yT = rt(function(r, i) {
          return rp(r, 1, i);
        }), TT = rt(function(r, i, u) {
          return rp(r, Zn(i) || 0, u);
        });
        function AT(r) {
          return Jr(r, A);
        }
        function js(r, i) {
          if (typeof r != "function" || i != null && typeof i != "function")
            throw new Vn(l);
          var u = function() {
            var d = arguments, m = i ? i.apply(this, d) : d[0], N = u.cache;
            if (N.has(m))
              return N.get(m);
            var L = r.apply(this, d);
            return u.cache = N.set(m, L) || N, L;
          };
          return u.cache = new (js.Cache || Kr)(), u;
        }
        js.Cache = Kr;
        function Ks(r) {
          if (typeof r != "function")
            throw new Vn(l);
          return function() {
            var i = arguments;
            switch (i.length) {
              case 0:
                return !r.call(this);
              case 1:
                return !r.call(this, i[0]);
              case 2:
                return !r.call(this, i[0], i[1]);
              case 3:
                return !r.call(this, i[0], i[1], i[2]);
            }
            return !r.apply(this, i);
          };
        }
        function bT(r) {
          return fh(2, r);
        }
        var OT = f_(function(r, i) {
          i = i.length == 1 && Qe(i[0]) ? Ct(i[0], Dn(ze())) : Ct(un(i, 1), Dn(ze()));
          var u = i.length;
          return rt(function(d) {
            for (var m = -1, N = fn(d.length, u); ++m < N; )
              d[m] = i[m].call(this, d[m]);
            return Mn(r, this, d);
          });
        }), vf = rt(function(r, i) {
          var u = gi(i, So(vf));
          return Jr(r, H, n, i, u);
        }), vh = rt(function(r, i) {
          var u = gi(i, So(vh));
          return Jr(r, $, n, i, u);
        }), NT = Zr(function(r, i) {
          return Jr(r, _, n, n, n, i);
        });
        function ST(r, i) {
          if (typeof r != "function")
            throw new Vn(l);
          return i = i === n ? i : tt(i), rt(r, i);
        }
        function IT(r, i) {
          if (typeof r != "function")
            throw new Vn(l);
          return i = i == null ? 0 : qt(tt(i), 0), rt(function(u) {
            var d = u[i], m = Ti(u, 0, i);
            return d && vi(m, d), Mn(r, this, m);
          });
        }
        function RT(r, i, u) {
          var d = !0, m = !0;
          if (typeof r != "function")
            throw new Vn(l);
          return Dt(u) && (d = "leading" in u ? !!u.leading : d, m = "trailing" in u ? !!u.trailing : m), hh(r, i, {
            leading: d,
            maxWait: i,
            trailing: m
          });
        }
        function wT(r) {
          return lh(r, 1);
        }
        function xT(r, i) {
          return vf(Zl(i), r);
        }
        function CT() {
          if (!arguments.length)
            return [];
          var r = arguments[0];
          return Qe(r) ? r : [r];
        }
        function LT(r) {
          return Kn(r, b);
        }
        function MT(r, i) {
          return i = typeof i == "function" ? i : n, Kn(r, b, i);
        }
        function DT(r) {
          return Kn(r, v | b);
        }
        function PT(r, i) {
          return i = typeof i == "function" ? i : n, Kn(r, v | b, i);
        }
        function UT(r, i) {
          return i == null || np(r, i, rn(i));
        }
        function dr(r, i) {
          return r === i || r !== r && i !== i;
        }
        var $T = Hs(Bl), kT = Hs(function(r, i) {
          return r >= i;
        }), Wi = up(/* @__PURE__ */ function() {
          return arguments;
        }()) ? up : function(r) {
          return kt(r) && Tt.call(r, "callee") && !jd.call(r, "callee");
        }, Qe = K.isArray, FT = wd ? Dn(wd) : V1;
        function An(r) {
          return r != null && qs(r.length) && !ei(r);
        }
        function Ht(r) {
          return kt(r) && An(r);
        }
        function BT(r) {
          return r === !0 || r === !1 || kt(r) && mn(r) == W;
        }
        var Ai = e1 || Sf, HT = xd ? Dn(xd) : j1;
        function GT(r) {
          return kt(r) && r.nodeType === 1 && !ya(r);
        }
        function zT(r) {
          if (r == null)
            return !0;
          if (An(r) && (Qe(r) || typeof r == "string" || typeof r.splice == "function" || Ai(r) || Io(r) || Wi(r)))
            return !r.length;
          var i = cn(r);
          if (i == Ye || i == vt)
            return !r.size;
          if (Ea(r))
            return !zl(r).length;
          for (var u in r)
            if (Tt.call(r, u))
              return !1;
          return !0;
        }
        function WT(r, i) {
          return va(r, i);
        }
        function XT(r, i, u) {
          u = typeof u == "function" ? u : n;
          var d = u ? u(r, i) : n;
          return d === n ? va(r, i, n, u) : !!d;
        }
        function gf(r) {
          if (!kt(r))
            return !1;
          var i = mn(r);
          return i == ie || i == Q || typeof r.message == "string" && typeof r.name == "string" && !ya(r);
        }
        function YT(r) {
          return typeof r == "number" && qd(r);
        }
        function ei(r) {
          if (!Dt(r))
            return !1;
          var i = mn(r);
          return i == Ae || i == Fe || i == O || i == gn;
        }
        function gh(r) {
          return typeof r == "number" && r == tt(r);
        }
        function qs(r) {
          return typeof r == "number" && r > -1 && r % 1 == 0 && r <= ue;
        }
        function Dt(r) {
          var i = typeof r;
          return r != null && (i == "object" || i == "function");
        }
        function kt(r) {
          return r != null && typeof r == "object";
        }
        var mh = Cd ? Dn(Cd) : q1;
        function VT(r, i) {
          return r === i || Gl(r, i, af(i));
        }
        function jT(r, i, u) {
          return u = typeof u == "function" ? u : n, Gl(r, i, af(i), u);
        }
        function KT(r) {
          return Eh(r) && r != +r;
        }
        function qT(r) {
          if (M_(r))
            throw new Ze(s);
          return lp(r);
        }
        function JT(r) {
          return r === null;
        }
        function ZT(r) {
          return r == null;
        }
        function Eh(r) {
          return typeof r == "number" || kt(r) && mn(r) == pt;
        }
        function ya(r) {
          if (!kt(r) || mn(r) != ht)
            return !1;
          var i = bs(r);
          if (i === null)
            return !0;
          var u = Tt.call(i, "constructor") && i.constructor;
          return typeof u == "function" && u instanceof u && _s.call(u) == jE;
        }
        var mf = Ld ? Dn(Ld) : J1;
        function QT(r) {
          return gh(r) && r >= -ue && r <= ue;
        }
        var _h = Md ? Dn(Md) : Z1;
        function Js(r) {
          return typeof r == "string" || !Qe(r) && kt(r) && mn(r) == Vt;
        }
        function Un(r) {
          return typeof r == "symbol" || kt(r) && mn(r) == Mt;
        }
        var Io = Dd ? Dn(Dd) : Q1;
        function eA(r) {
          return r === n;
        }
        function tA(r) {
          return kt(r) && cn(r) == Qt;
        }
        function nA(r) {
          return kt(r) && mn(r) == en;
        }
        var rA = Hs(Wl), iA = Hs(function(r, i) {
          return r <= i;
        });
        function yh(r) {
          if (!r)
            return [];
          if (An(r))
            return Js(r) ? fr(r) : Tn(r);
          if (sa && r[sa])
            return UE(r[sa]());
          var i = cn(r), u = i == Ye ? Cl : i == vt ? gs : Ro;
          return u(r);
        }
        function ti(r) {
          if (!r)
            return r === 0 ? r : 0;
          if (r = Zn(r), r === se || r === -se) {
            var i = r < 0 ? -1 : 1;
            return i * Te;
          }
          return r === r ? r : 0;
        }
        function tt(r) {
          var i = ti(r), u = i % 1;
          return i === i ? u ? i - u : i : 0;
        }
        function Th(r) {
          return r ? Bi(tt(r), 0, Me) : 0;
        }
        function Zn(r) {
          if (typeof r == "number")
            return r;
          if (Un(r))
            return Ie;
          if (Dt(r)) {
            var i = typeof r.valueOf == "function" ? r.valueOf() : r;
            r = Dt(i) ? i + "" : i;
          }
          if (typeof r != "string")
            return r === 0 ? r : +r;
          r = Bd(r);
          var u = fo.test(r);
          return u || pl.test(r) ? _E(r.slice(2), u ? 2 : 8) : as.test(r) ? Ie : +r;
        }
        function Ah(r) {
          return Rr(r, bn(r));
        }
        function oA(r) {
          return r ? Bi(tt(r), -ue, ue) : r === 0 ? r : 0;
        }
        function yt(r) {
          return r == null ? "" : Pn(r);
        }
        var aA = Oo(function(r, i) {
          if (Ea(i) || An(i)) {
            Rr(i, rn(i), r);
            return;
          }
          for (var u in i)
            Tt.call(i, u) && da(r, u, i[u]);
        }), bh = Oo(function(r, i) {
          Rr(i, bn(i), r);
        }), Zs = Oo(function(r, i, u, d) {
          Rr(i, bn(i), r, d);
        }), sA = Oo(function(r, i, u, d) {
          Rr(i, rn(i), r, d);
        }), uA = Zr($l);
        function lA(r, i) {
          var u = bo(r);
          return i == null ? u : tp(u, i);
        }
        var fA = rt(function(r, i) {
          r = Nt(r);
          var u = -1, d = i.length, m = d > 2 ? i[2] : n;
          for (m && En(i[0], i[1], m) && (d = 1); ++u < d; )
            for (var N = i[u], L = bn(N), k = -1, Y = L.length; ++k < Y; ) {
              var oe = L[k], ae = r[oe];
              (ae === n || dr(ae, yo[oe]) && !Tt.call(r, oe)) && (r[oe] = N[oe]);
            }
          return r;
        }), cA = rt(function(r) {
          return r.push(n, Bp), Mn(Oh, n, r);
        });
        function dA(r, i) {
          return Ud(r, ze(i, 3), Ir);
        }
        function pA(r, i) {
          return Ud(r, ze(i, 3), Fl);
        }
        function hA(r, i) {
          return r == null ? r : kl(r, ze(i, 3), bn);
        }
        function vA(r, i) {
          return r == null ? r : ap(r, ze(i, 3), bn);
        }
        function gA(r, i) {
          return r && Ir(r, ze(i, 3));
        }
        function mA(r, i) {
          return r && Fl(r, ze(i, 3));
        }
        function EA(r) {
          return r == null ? [] : Ms(r, rn(r));
        }
        function _A(r) {
          return r == null ? [] : Ms(r, bn(r));
        }
        function Ef(r, i, u) {
          var d = r == null ? n : Hi(r, i);
          return d === n ? u : d;
        }
        function yA(r, i) {
          return r != null && zp(r, i, z1);
        }
        function _f(r, i) {
          return r != null && zp(r, i, W1);
        }
        var TA = Pp(function(r, i, u) {
          i != null && typeof i.toString != "function" && (i = ys.call(i)), r[i] = u;
        }, Tf(On)), AA = Pp(function(r, i, u) {
          i != null && typeof i.toString != "function" && (i = ys.call(i)), Tt.call(r, i) ? r[i].push(u) : r[i] = [u];
        }, ze), bA = rt(ha);
        function rn(r) {
          return An(r) ? Qd(r) : zl(r);
        }
        function bn(r) {
          return An(r) ? Qd(r, !0) : e_(r);
        }
        function OA(r, i) {
          var u = {};
          return i = ze(i, 3), Ir(r, function(d, m, N) {
            qr(u, i(d, m, N), d);
          }), u;
        }
        function NA(r, i) {
          var u = {};
          return i = ze(i, 3), Ir(r, function(d, m, N) {
            qr(u, m, i(d, m, N));
          }), u;
        }
        var SA = Oo(function(r, i, u) {
          Ds(r, i, u);
        }), Oh = Oo(function(r, i, u, d) {
          Ds(r, i, u, d);
        }), IA = Zr(function(r, i) {
          var u = {};
          if (r == null)
            return u;
          var d = !1;
          i = Ct(i, function(N) {
            return N = yi(N, r), d || (d = N.length > 1), N;
          }), Rr(r, rf(r), u), d && (u = Kn(u, v | E | b, T_));
          for (var m = i.length; m--; )
            Kl(u, i[m]);
          return u;
        });
        function RA(r, i) {
          return Nh(r, Ks(ze(i)));
        }
        var wA = Zr(function(r, i) {
          return r == null ? {} : n_(r, i);
        });
        function Nh(r, i) {
          if (r == null)
            return {};
          var u = Ct(rf(r), function(d) {
            return [d];
          });
          return i = ze(i), gp(r, u, function(d, m) {
            return i(d, m[0]);
          });
        }
        function xA(r, i, u) {
          i = yi(i, r);
          var d = -1, m = i.length;
          for (m || (m = 1, r = n); ++d < m; ) {
            var N = r == null ? n : r[wr(i[d])];
            N === n && (d = m, N = u), r = ei(N) ? N.call(r) : N;
          }
          return r;
        }
        function CA(r, i, u) {
          return r == null ? r : ga(r, i, u);
        }
        function LA(r, i, u, d) {
          return d = typeof d == "function" ? d : n, r == null ? r : ga(r, i, u, d);
        }
        var Sh = kp(rn), Ih = kp(bn);
        function MA(r, i, u) {
          var d = Qe(r), m = d || Ai(r) || Io(r);
          if (i = ze(i, 4), u == null) {
            var N = r && r.constructor;
            m ? u = d ? new N() : [] : Dt(r) ? u = ei(N) ? bo(bs(r)) : {} : u = {};
          }
          return (m ? Yn : Ir)(r, function(L, k, Y) {
            return i(u, L, k, Y);
          }), u;
        }
        function DA(r, i) {
          return r == null ? !0 : Kl(r, i);
        }
        function PA(r, i, u) {
          return r == null ? r : Tp(r, i, Zl(u));
        }
        function UA(r, i, u, d) {
          return d = typeof d == "function" ? d : n, r == null ? r : Tp(r, i, Zl(u), d);
        }
        function Ro(r) {
          return r == null ? [] : xl(r, rn(r));
        }
        function $A(r) {
          return r == null ? [] : xl(r, bn(r));
        }
        function kA(r, i, u) {
          return u === n && (u = i, i = n), u !== n && (u = Zn(u), u = u === u ? u : 0), i !== n && (i = Zn(i), i = i === i ? i : 0), Bi(Zn(r), i, u);
        }
        function FA(r, i, u) {
          return i = ti(i), u === n ? (u = i, i = 0) : u = ti(u), r = Zn(r), X1(r, i, u);
        }
        function BA(r, i, u) {
          if (u && typeof u != "boolean" && En(r, i, u) && (i = u = n), u === n && (typeof i == "boolean" ? (u = i, i = n) : typeof r == "boolean" && (u = r, r = n)), r === n && i === n ? (r = 0, i = 1) : (r = ti(r), i === n ? (i = r, r = 0) : i = ti(i)), r > i) {
            var d = r;
            r = i, i = d;
          }
          if (u || r % 1 || i % 1) {
            var m = Jd();
            return fn(r + m * (i - r + EE("1e-" + ((m + "").length - 1))), i);
          }
          return Yl(r, i);
        }
        var HA = No(function(r, i, u) {
          return i = i.toLowerCase(), r + (u ? Rh(i) : i);
        });
        function Rh(r) {
          return yf(yt(r).toLowerCase());
        }
        function wh(r) {
          return r = yt(r), r && r.replace(Nr, CE).replace(_l, "");
        }
        function GA(r, i, u) {
          r = yt(r), i = Pn(i);
          var d = r.length;
          u = u === n ? d : Bi(tt(u), 0, d);
          var m = u;
          return u -= i.length, u >= 0 && r.slice(u, m) == i;
        }
        function zA(r) {
          return r = yt(r), r && M.test(r) ? r.replace(sr, LE) : r;
        }
        function WA(r) {
          return r = yt(r), r && Je.test(r) ? r.replace(Re, "\\$&") : r;
        }
        var XA = No(function(r, i, u) {
          return r + (u ? "-" : "") + i.toLowerCase();
        }), YA = No(function(r, i, u) {
          return r + (u ? " " : "") + i.toLowerCase();
        }), VA = Lp("toLowerCase");
        function jA(r, i, u) {
          r = yt(r), i = tt(i);
          var d = i ? Eo(r) : 0;
          if (!i || d >= i)
            return r;
          var m = (i - d) / 2;
          return Bs(Is(m), u) + r + Bs(Ss(m), u);
        }
        function KA(r, i, u) {
          r = yt(r), i = tt(i);
          var d = i ? Eo(r) : 0;
          return i && d < i ? r + Bs(i - d, u) : r;
        }
        function qA(r, i, u) {
          r = yt(r), i = tt(i);
          var d = i ? Eo(r) : 0;
          return i && d < i ? Bs(i - d, u) + r : r;
        }
        function JA(r, i, u) {
          return u || i == null ? i = 0 : i && (i = +i), i1(yt(r).replace(Ut, ""), i || 0);
        }
        function ZA(r, i, u) {
          return (u ? En(r, i, u) : i === n) ? i = 1 : i = tt(i), Vl(yt(r), i);
        }
        function QA() {
          var r = arguments, i = yt(r[0]);
          return r.length < 3 ? i : i.replace(r[1], r[2]);
        }
        var eb = No(function(r, i, u) {
          return r + (u ? "_" : "") + i.toLowerCase();
        });
        function tb(r, i, u) {
          return u && typeof u != "number" && En(r, i, u) && (i = u = n), u = u === n ? Me : u >>> 0, u ? (r = yt(r), r && (typeof i == "string" || i != null && !mf(i)) && (i = Pn(i), !i && mo(r)) ? Ti(fr(r), 0, u) : r.split(i, u)) : [];
        }
        var nb = No(function(r, i, u) {
          return r + (u ? " " : "") + yf(i);
        });
        function rb(r, i, u) {
          return r = yt(r), u = u == null ? 0 : Bi(tt(u), 0, r.length), i = Pn(i), r.slice(u, u + i.length) == i;
        }
        function ib(r, i, u) {
          var d = y.templateSettings;
          u && En(r, i, u) && (i = n), r = yt(r), i = Zs({}, i, d, Fp);
          var m = Zs({}, i.imports, d.imports, Fp), N = rn(m), L = xl(m, N), k, Y, oe = 0, ae = i.interpolate || Ci, ce = "__p += '", Ne = Ll(
            (i.escape || Ci).source + "|" + ae.source + "|" + (ae === Ge ? cl : Ci).source + "|" + (i.evaluate || Ci).source + "|$",
            "g"
          ), De = "//# sourceURL=" + (Tt.call(i, "sourceURL") ? (i.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++pE + "]") + `
`;
          r.replace(Ne, function(Ke, ot, ut, $n, _n, kn) {
            return ut || (ut = $n), ce += r.slice(oe, kn).replace(ss, ME), ot && (k = !0, ce += `' +
__e(` + ot + `) +
'`), _n && (Y = !0, ce += `';
` + _n + `;
__p += '`), ut && (ce += `' +
((__t = (` + ut + `)) == null ? '' : __t) +
'`), oe = kn + Ke.length, Ke;
          }), ce += `';
`;
          var je = Tt.call(i, "variable") && i.variable;
          if (!je)
            ce = `with (obj) {
` + ce + `
}
`;
          else if (na.test(je))
            throw new Ze(f);
          ce = (Y ? ce.replace(Se, "") : ce).replace(at, "$1").replace(_t, "$1;"), ce = "function(" + (je || "obj") + `) {
` + (je ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (k ? ", __e = _.escape" : "") + (Y ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + ce + `return __p
}`;
          var nt = Ch(function() {
            return mt(N, De + "return " + ce).apply(n, L);
          });
          if (nt.source = ce, gf(nt))
            throw nt;
          return nt;
        }
        function ob(r) {
          return yt(r).toLowerCase();
        }
        function ab(r) {
          return yt(r).toUpperCase();
        }
        function sb(r, i, u) {
          if (r = yt(r), r && (u || i === n))
            return Bd(r);
          if (!r || !(i = Pn(i)))
            return r;
          var d = fr(r), m = fr(i), N = Hd(d, m), L = Gd(d, m) + 1;
          return Ti(d, N, L).join("");
        }
        function ub(r, i, u) {
          if (r = yt(r), r && (u || i === n))
            return r.slice(0, Wd(r) + 1);
          if (!r || !(i = Pn(i)))
            return r;
          var d = fr(r), m = Gd(d, fr(i)) + 1;
          return Ti(d, 0, m).join("");
        }
        function lb(r, i, u) {
          if (r = yt(r), r && (u || i === n))
            return r.replace(Ut, "");
          if (!r || !(i = Pn(i)))
            return r;
          var d = fr(r), m = Hd(d, fr(i));
          return Ti(d, m).join("");
        }
        function fb(r, i) {
          var u = Z, d = G;
          if (Dt(i)) {
            var m = "separator" in i ? i.separator : m;
            u = "length" in i ? tt(i.length) : u, d = "omission" in i ? Pn(i.omission) : d;
          }
          r = yt(r);
          var N = r.length;
          if (mo(r)) {
            var L = fr(r);
            N = L.length;
          }
          if (u >= N)
            return r;
          var k = u - Eo(d);
          if (k < 1)
            return d;
          var Y = L ? Ti(L, 0, k).join("") : r.slice(0, k);
          if (m === n)
            return Y + d;
          if (L && (k += Y.length - k), mf(m)) {
            if (r.slice(k).search(m)) {
              var oe, ae = Y;
              for (m.global || (m = Ll(m.source, yt(os.exec(m)) + "g")), m.lastIndex = 0; oe = m.exec(ae); )
                var ce = oe.index;
              Y = Y.slice(0, ce === n ? k : ce);
            }
          } else if (r.indexOf(Pn(m), k) != k) {
            var Ne = Y.lastIndexOf(m);
            Ne > -1 && (Y = Y.slice(0, Ne));
          }
          return Y + d;
        }
        function cb(r) {
          return r = yt(r), r && xt.test(r) ? r.replace(tn, BE) : r;
        }
        var db = No(function(r, i, u) {
          return r + (u ? " " : "") + i.toUpperCase();
        }), yf = Lp("toUpperCase");
        function xh(r, i, u) {
          return r = yt(r), i = u ? n : i, i === n ? PE(r) ? zE(r) : SE(r) : r.match(i) || [];
        }
        var Ch = rt(function(r, i) {
          try {
            return Mn(r, n, i);
          } catch (u) {
            return gf(u) ? u : new Ze(u);
          }
        }), pb = Zr(function(r, i) {
          return Yn(i, function(u) {
            u = wr(u), qr(r, u, hf(r[u], r));
          }), r;
        });
        function hb(r) {
          var i = r == null ? 0 : r.length, u = ze();
          return r = i ? Ct(r, function(d) {
            if (typeof d[1] != "function")
              throw new Vn(l);
            return [u(d[0]), d[1]];
          }) : [], rt(function(d) {
            for (var m = -1; ++m < i; ) {
              var N = r[m];
              if (Mn(N[0], this, d))
                return Mn(N[1], this, d);
            }
          });
        }
        function vb(r) {
          return B1(Kn(r, v));
        }
        function Tf(r) {
          return function() {
            return r;
          };
        }
        function gb(r, i) {
          return r == null || r !== r ? i : r;
        }
        var mb = Dp(), Eb = Dp(!0);
        function On(r) {
          return r;
        }
        function Af(r) {
          return fp(typeof r == "function" ? r : Kn(r, v));
        }
        function _b(r) {
          return dp(Kn(r, v));
        }
        function yb(r, i) {
          return pp(r, Kn(i, v));
        }
        var Tb = rt(function(r, i) {
          return function(u) {
            return ha(u, r, i);
          };
        }), Ab = rt(function(r, i) {
          return function(u) {
            return ha(r, u, i);
          };
        });
        function bf(r, i, u) {
          var d = rn(i), m = Ms(i, d);
          u == null && !(Dt(i) && (m.length || !d.length)) && (u = i, i = r, r = this, m = Ms(i, rn(i)));
          var N = !(Dt(u) && "chain" in u) || !!u.chain, L = ei(r);
          return Yn(m, function(k) {
            var Y = i[k];
            r[k] = Y, L && (r.prototype[k] = function() {
              var oe = this.__chain__;
              if (N || oe) {
                var ae = r(this.__wrapped__), ce = ae.__actions__ = Tn(this.__actions__);
                return ce.push({ func: Y, args: arguments, thisArg: r }), ae.__chain__ = oe, ae;
              }
              return Y.apply(r, vi([this.value()], arguments));
            });
          }), r;
        }
        function bb() {
          return sn._ === this && (sn._ = KE), this;
        }
        function Of() {
        }
        function Ob(r) {
          return r = tt(r), rt(function(i) {
            return hp(i, r);
          });
        }
        var Nb = ef(Ct), Sb = ef(Pd), Ib = ef(Nl);
        function Lh(r) {
          return uf(r) ? Sl(wr(r)) : r_(r);
        }
        function Rb(r) {
          return function(i) {
            return r == null ? n : Hi(r, i);
          };
        }
        var wb = Up(), xb = Up(!0);
        function Nf() {
          return [];
        }
        function Sf() {
          return !1;
        }
        function Cb() {
          return {};
        }
        function Lb() {
          return "";
        }
        function Mb() {
          return !0;
        }
        function Db(r, i) {
          if (r = tt(r), r < 1 || r > ue)
            return [];
          var u = Me, d = fn(r, Me);
          i = ze(i), r -= Me;
          for (var m = wl(d, i); ++u < r; )
            i(u);
          return m;
        }
        function Pb(r) {
          return Qe(r) ? Ct(r, wr) : Un(r) ? [r] : Tn(Zp(yt(r)));
        }
        function Ub(r) {
          var i = ++VE;
          return yt(r) + i;
        }
        var $b = Fs(function(r, i) {
          return r + i;
        }, 0), kb = tf("ceil"), Fb = Fs(function(r, i) {
          return r / i;
        }, 1), Bb = tf("floor");
        function Hb(r) {
          return r && r.length ? Ls(r, On, Bl) : n;
        }
        function Gb(r, i) {
          return r && r.length ? Ls(r, ze(i, 2), Bl) : n;
        }
        function zb(r) {
          return kd(r, On);
        }
        function Wb(r, i) {
          return kd(r, ze(i, 2));
        }
        function Xb(r) {
          return r && r.length ? Ls(r, On, Wl) : n;
        }
        function Yb(r, i) {
          return r && r.length ? Ls(r, ze(i, 2), Wl) : n;
        }
        var Vb = Fs(function(r, i) {
          return r * i;
        }, 1), jb = tf("round"), Kb = Fs(function(r, i) {
          return r - i;
        }, 0);
        function qb(r) {
          return r && r.length ? Rl(r, On) : 0;
        }
        function Jb(r, i) {
          return r && r.length ? Rl(r, ze(i, 2)) : 0;
        }
        return y.after = _T, y.ary = lh, y.assign = aA, y.assignIn = bh, y.assignInWith = Zs, y.assignWith = sA, y.at = uA, y.before = fh, y.bind = hf, y.bindAll = pb, y.bindKey = ch, y.castArray = CT, y.chain = ah, y.chunk = B_, y.compact = H_, y.concat = G_, y.cond = hb, y.conforms = vb, y.constant = Tf, y.countBy = qy, y.create = lA, y.curry = dh, y.curryRight = ph, y.debounce = hh, y.defaults = fA, y.defaultsDeep = cA, y.defer = yT, y.delay = TT, y.difference = z_, y.differenceBy = W_, y.differenceWith = X_, y.drop = Y_, y.dropRight = V_, y.dropRightWhile = j_, y.dropWhile = K_, y.fill = q_, y.filter = Zy, y.flatMap = tT, y.flatMapDeep = nT, y.flatMapDepth = rT, y.flatten = nh, y.flattenDeep = J_, y.flattenDepth = Z_, y.flip = AT, y.flow = mb, y.flowRight = Eb, y.fromPairs = Q_, y.functions = EA, y.functionsIn = _A, y.groupBy = iT, y.initial = ty, y.intersection = ny, y.intersectionBy = ry, y.intersectionWith = iy, y.invert = TA, y.invertBy = AA, y.invokeMap = aT, y.iteratee = Af, y.keyBy = sT, y.keys = rn, y.keysIn = bn, y.map = Ys, y.mapKeys = OA, y.mapValues = NA, y.matches = _b, y.matchesProperty = yb, y.memoize = js, y.merge = SA, y.mergeWith = Oh, y.method = Tb, y.methodOf = Ab, y.mixin = bf, y.negate = Ks, y.nthArg = Ob, y.omit = IA, y.omitBy = RA, y.once = bT, y.orderBy = uT, y.over = Nb, y.overArgs = OT, y.overEvery = Sb, y.overSome = Ib, y.partial = vf, y.partialRight = vh, y.partition = lT, y.pick = wA, y.pickBy = Nh, y.property = Lh, y.propertyOf = Rb, y.pull = uy, y.pullAll = ih, y.pullAllBy = ly, y.pullAllWith = fy, y.pullAt = cy, y.range = wb, y.rangeRight = xb, y.rearg = NT, y.reject = dT, y.remove = dy, y.rest = ST, y.reverse = df, y.sampleSize = hT, y.set = CA, y.setWith = LA, y.shuffle = vT, y.slice = py, y.sortBy = ET, y.sortedUniq = yy, y.sortedUniqBy = Ty, y.split = tb, y.spread = IT, y.tail = Ay, y.take = by, y.takeRight = Oy, y.takeRightWhile = Ny, y.takeWhile = Sy, y.tap = Hy, y.throttle = RT, y.thru = Xs, y.toArray = yh, y.toPairs = Sh, y.toPairsIn = Ih, y.toPath = Pb, y.toPlainObject = Ah, y.transform = MA, y.unary = wT, y.union = Iy, y.unionBy = Ry, y.unionWith = wy, y.uniq = xy, y.uniqBy = Cy, y.uniqWith = Ly, y.unset = DA, y.unzip = pf, y.unzipWith = oh, y.update = PA, y.updateWith = UA, y.values = Ro, y.valuesIn = $A, y.without = My, y.words = xh, y.wrap = xT, y.xor = Dy, y.xorBy = Py, y.xorWith = Uy, y.zip = $y, y.zipObject = ky, y.zipObjectDeep = Fy, y.zipWith = By, y.entries = Sh, y.entriesIn = Ih, y.extend = bh, y.extendWith = Zs, bf(y, y), y.add = $b, y.attempt = Ch, y.camelCase = HA, y.capitalize = Rh, y.ceil = kb, y.clamp = kA, y.clone = LT, y.cloneDeep = DT, y.cloneDeepWith = PT, y.cloneWith = MT, y.conformsTo = UT, y.deburr = wh, y.defaultTo = gb, y.divide = Fb, y.endsWith = GA, y.eq = dr, y.escape = zA, y.escapeRegExp = WA, y.every = Jy, y.find = Qy, y.findIndex = eh, y.findKey = dA, y.findLast = eT, y.findLastIndex = th, y.findLastKey = pA, y.floor = Bb, y.forEach = sh, y.forEachRight = uh, y.forIn = hA, y.forInRight = vA, y.forOwn = gA, y.forOwnRight = mA, y.get = Ef, y.gt = $T, y.gte = kT, y.has = yA, y.hasIn = _f, y.head = rh, y.identity = On, y.includes = oT, y.indexOf = ey, y.inRange = FA, y.invoke = bA, y.isArguments = Wi, y.isArray = Qe, y.isArrayBuffer = FT, y.isArrayLike = An, y.isArrayLikeObject = Ht, y.isBoolean = BT, y.isBuffer = Ai, y.isDate = HT, y.isElement = GT, y.isEmpty = zT, y.isEqual = WT, y.isEqualWith = XT, y.isError = gf, y.isFinite = YT, y.isFunction = ei, y.isInteger = gh, y.isLength = qs, y.isMap = mh, y.isMatch = VT, y.isMatchWith = jT, y.isNaN = KT, y.isNative = qT, y.isNil = ZT, y.isNull = JT, y.isNumber = Eh, y.isObject = Dt, y.isObjectLike = kt, y.isPlainObject = ya, y.isRegExp = mf, y.isSafeInteger = QT, y.isSet = _h, y.isString = Js, y.isSymbol = Un, y.isTypedArray = Io, y.isUndefined = eA, y.isWeakMap = tA, y.isWeakSet = nA, y.join = oy, y.kebabCase = XA, y.last = Jn, y.lastIndexOf = ay, y.lowerCase = YA, y.lowerFirst = VA, y.lt = rA, y.lte = iA, y.max = Hb, y.maxBy = Gb, y.mean = zb, y.meanBy = Wb, y.min = Xb, y.minBy = Yb, y.stubArray = Nf, y.stubFalse = Sf, y.stubObject = Cb, y.stubString = Lb, y.stubTrue = Mb, y.multiply = Vb, y.nth = sy, y.noConflict = bb, y.noop = Of, y.now = Vs, y.pad = jA, y.padEnd = KA, y.padStart = qA, y.parseInt = JA, y.random = BA, y.reduce = fT, y.reduceRight = cT, y.repeat = ZA, y.replace = QA, y.result = xA, y.round = jb, y.runInContext = X, y.sample = pT, y.size = gT, y.snakeCase = eb, y.some = mT, y.sortedIndex = hy, y.sortedIndexBy = vy, y.sortedIndexOf = gy, y.sortedLastIndex = my, y.sortedLastIndexBy = Ey, y.sortedLastIndexOf = _y, y.startCase = nb, y.startsWith = rb, y.subtract = Kb, y.sum = qb, y.sumBy = Jb, y.template = ib, y.times = Db, y.toFinite = ti, y.toInteger = tt, y.toLength = Th, y.toLower = ob, y.toNumber = Zn, y.toSafeInteger = oA, y.toString = yt, y.toUpper = ab, y.trim = sb, y.trimEnd = ub, y.trimStart = lb, y.truncate = fb, y.unescape = cb, y.uniqueId = Ub, y.upperCase = db, y.upperFirst = yf, y.each = sh, y.eachRight = uh, y.first = rh, bf(y, function() {
          var r = {};
          return Ir(y, function(i, u) {
            Tt.call(y.prototype, u) || (r[u] = i);
          }), r;
        }(), { chain: !1 }), y.VERSION = o, Yn(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(r) {
          y[r].placeholder = y;
        }), Yn(["drop", "take"], function(r, i) {
          st.prototype[r] = function(u) {
            u = u === n ? 1 : qt(tt(u), 0);
            var d = this.__filtered__ && !i ? new st(this) : this.clone();
            return d.__filtered__ ? d.__takeCount__ = fn(u, d.__takeCount__) : d.__views__.push({
              size: fn(u, Me),
              type: r + (d.__dir__ < 0 ? "Right" : "")
            }), d;
          }, st.prototype[r + "Right"] = function(u) {
            return this.reverse()[r](u).reverse();
          };
        }), Yn(["filter", "map", "takeWhile"], function(r, i) {
          var u = i + 1, d = u == z || u == j;
          st.prototype[r] = function(m) {
            var N = this.clone();
            return N.__iteratees__.push({
              iteratee: ze(m, 3),
              type: u
            }), N.__filtered__ = N.__filtered__ || d, N;
          };
        }), Yn(["head", "last"], function(r, i) {
          var u = "take" + (i ? "Right" : "");
          st.prototype[r] = function() {
            return this[u](1).value()[0];
          };
        }), Yn(["initial", "tail"], function(r, i) {
          var u = "drop" + (i ? "" : "Right");
          st.prototype[r] = function() {
            return this.__filtered__ ? new st(this) : this[u](1);
          };
        }), st.prototype.compact = function() {
          return this.filter(On);
        }, st.prototype.find = function(r) {
          return this.filter(r).head();
        }, st.prototype.findLast = function(r) {
          return this.reverse().find(r);
        }, st.prototype.invokeMap = rt(function(r, i) {
          return typeof r == "function" ? new st(this) : this.map(function(u) {
            return ha(u, r, i);
          });
        }), st.prototype.reject = function(r) {
          return this.filter(Ks(ze(r)));
        }, st.prototype.slice = function(r, i) {
          r = tt(r);
          var u = this;
          return u.__filtered__ && (r > 0 || i < 0) ? new st(u) : (r < 0 ? u = u.takeRight(-r) : r && (u = u.drop(r)), i !== n && (i = tt(i), u = i < 0 ? u.dropRight(-i) : u.take(i - r)), u);
        }, st.prototype.takeRightWhile = function(r) {
          return this.reverse().takeWhile(r).reverse();
        }, st.prototype.toArray = function() {
          return this.take(Me);
        }, Ir(st.prototype, function(r, i) {
          var u = /^(?:filter|find|map|reject)|While$/.test(i), d = /^(?:head|last)$/.test(i), m = y[d ? "take" + (i == "last" ? "Right" : "") : i], N = d || /^find/.test(i);
          m && (y.prototype[i] = function() {
            var L = this.__wrapped__, k = d ? [1] : arguments, Y = L instanceof st, oe = k[0], ae = Y || Qe(L), ce = function(ot) {
              var ut = m.apply(y, vi([ot], k));
              return d && Ne ? ut[0] : ut;
            };
            ae && u && typeof oe == "function" && oe.length != 1 && (Y = ae = !1);
            var Ne = this.__chain__, De = !!this.__actions__.length, je = N && !Ne, nt = Y && !De;
            if (!N && ae) {
              L = nt ? L : new st(this);
              var Ke = r.apply(L, k);
              return Ke.__actions__.push({ func: Xs, args: [ce], thisArg: n }), new jn(Ke, Ne);
            }
            return je && nt ? r.apply(this, k) : (Ke = this.thru(ce), je ? d ? Ke.value()[0] : Ke.value() : Ke);
          });
        }), Yn(["pop", "push", "shift", "sort", "splice", "unshift"], function(r) {
          var i = ms[r], u = /^(?:push|sort|unshift)$/.test(r) ? "tap" : "thru", d = /^(?:pop|shift)$/.test(r);
          y.prototype[r] = function() {
            var m = arguments;
            if (d && !this.__chain__) {
              var N = this.value();
              return i.apply(Qe(N) ? N : [], m);
            }
            return this[u](function(L) {
              return i.apply(Qe(L) ? L : [], m);
            });
          };
        }), Ir(st.prototype, function(r, i) {
          var u = y[i];
          if (u) {
            var d = u.name + "";
            Tt.call(Ao, d) || (Ao[d] = []), Ao[d].push({ name: i, func: u });
          }
        }), Ao[ks(n, I).name] = [{
          name: "wrapper",
          func: n
        }], st.prototype.clone = c1, st.prototype.reverse = d1, st.prototype.value = p1, y.prototype.at = Gy, y.prototype.chain = zy, y.prototype.commit = Wy, y.prototype.next = Xy, y.prototype.plant = Vy, y.prototype.reverse = jy, y.prototype.toJSON = y.prototype.valueOf = y.prototype.value = Ky, y.prototype.first = y.prototype.head, sa && (y.prototype[sa] = Yy), y;
      }, _o = WE();
      Ui ? ((Ui.exports = _o)._ = _o, Tl._ = _o) : sn._ = _o;
    }).call(rO);
  }(Ia, Ia.exports)), Ia.exports;
}
var oO = iO();
const be = /* @__PURE__ */ Yu(oO), aO = {
  __name: "splitpanes",
  props: {
    horizontal: { type: Boolean, default: !1 },
    pushOtherPanes: { type: Boolean, default: !0 },
    maximizePanes: { type: Boolean, default: !0 },
    // Maximize pane on splitter double click/tap.
    rtl: { type: Boolean, default: !1 },
    // Right to left direction.
    firstSplitter: { type: Boolean, default: !1 }
  },
  emits: [
    "ready",
    "resize",
    "resized",
    "pane-click",
    "pane-maximize",
    "pane-add",
    "pane-remove",
    "splitter-click",
    "splitter-dblclick"
  ],
  setup(e, { emit: t }) {
    const n = t, o = e, a = Zb(), s = qe([]), l = $e(() => s.value.reduce((O, W) => (O[~~W.id] = W) && O, {})), f = $e(() => s.value.length), c = qe(null), p = qe(!1), h = qe({
      mouseDown: !1,
      dragging: !1,
      activeSplitter: null,
      cursorOffset: 0
      // Cursor offset within the splitter.
    }), v = qe({
      // Used to detect double click on touch devices.
      splitter: null,
      timeoutId: null
    }), E = $e(() => ({
      [`splitpanes splitpanes--${o.horizontal ? "horizontal" : "vertical"}`]: !0,
      "splitpanes--dragging": h.value.dragging
    })), b = () => {
      document.addEventListener("mousemove", x, { passive: !1 }), document.addEventListener("mouseup", I), "ontouchstart" in window && (document.addEventListener("touchmove", x, { passive: !1 }), document.addEventListener("touchend", I));
    }, R = () => {
      document.removeEventListener("mousemove", x, { passive: !1 }), document.removeEventListener("mouseup", I), "ontouchstart" in window && (document.removeEventListener("touchmove", x, { passive: !1 }), document.removeEventListener("touchend", I));
    }, T = (O, W) => {
      const J = O.target.closest(".splitpanes__splitter");
      if (J) {
        const { left: Q, top: ie } = J.getBoundingClientRect(), { clientX: Ae, clientY: Fe } = "ontouchstart" in window && O.touches ? O.touches[0] : O;
        h.value.cursorOffset = o.horizontal ? Fe - ie : Ae - Q;
      }
      b(), h.value.mouseDown = !0, h.value.activeSplitter = W;
    }, x = (O) => {
      h.value.mouseDown && (O.preventDefault(), h.value.dragging = !0, requestAnimationFrame(() => {
        U(H(O)), de("resize", { event: O }, !0);
      }));
    }, I = (O) => {
      h.value.dragging && (window.getSelection().removeAllRanges(), de("resized", { event: O }, !0)), h.value.mouseDown = !1, h.value.activeSplitter = null, setTimeout(() => {
        h.value.dragging = !1, R();
      }, 100);
    }, F = (O, W) => {
      "ontouchstart" in window && (O.preventDefault(), v.value.splitter === W ? (clearTimeout(v.value.timeoutId), v.value.timeoutId = null, P(O, W), v.value.splitter = null) : (v.value.splitter = W, v.value.timeoutId = setTimeout(() => v.value.splitter = null, 500))), h.value.dragging || de("splitter-click", { event: O, index: W }, !0);
    }, P = (O, W) => {
      if (de("splitter-dblclick", { event: O, index: W }, !0), o.maximizePanes) {
        let J = 0;
        s.value = s.value.map((Q, ie) => (Q.size = ie === W ? Q.max : Q.min, ie !== W && (J += Q.min), Q)), s.value[W].size -= J, de("pane-maximize", { event: O, index: W, pane: s.value[W] }), de("resized", { event: O, index: W }, !0);
      }
    }, g = (O, W) => {
      de("pane-click", {
        event: O,
        index: l.value[W].index,
        pane: l.value[W]
      });
    }, H = (O) => {
      const W = c.value.getBoundingClientRect(), { clientX: J, clientY: Q } = "ontouchstart" in window && O.touches ? O.touches[0] : O;
      return {
        x: J - (o.horizontal ? 0 : h.value.cursorOffset) - W.left,
        y: Q - (o.horizontal ? h.value.cursorOffset : 0) - W.top
      };
    }, $ = (O) => {
      O = O[o.horizontal ? "y" : "x"];
      const W = c.value[o.horizontal ? "clientHeight" : "clientWidth"];
      return o.rtl && !o.horizontal && (O = W - O), O * 100 / W;
    }, U = (O) => {
      const W = h.value.activeSplitter;
      let J = {
        prevPanesSize: A(W),
        nextPanesSize: Z(W),
        prevReachedMinPanes: 0,
        nextReachedMinPanes: 0
      };
      const Q = 0 + (o.pushOtherPanes ? 0 : J.prevPanesSize), ie = 100 - (o.pushOtherPanes ? 0 : J.nextPanesSize), Ae = Math.max(Math.min($(O), ie), Q);
      let Fe = [W, W + 1], Ye = s.value[Fe[0]] || null, pt = s.value[Fe[1]] || null;
      const zt = Ye.max < 100 && Ae >= Ye.max + J.prevPanesSize, ht = pt.max < 100 && Ae <= 100 - (pt.max + Z(W + 1));
      if (zt || ht) {
        zt ? (Ye.size = Ye.max, pt.size = Math.max(100 - Ye.max - J.prevPanesSize - J.nextPanesSize, 0)) : (Ye.size = Math.max(100 - pt.max - J.prevPanesSize - Z(W + 1), 0), pt.size = pt.max);
        return;
      }
      if (o.pushOtherPanes) {
        const Yt = _(J, Ae);
        if (!Yt) return;
        ({ sums: J, panesToResize: Fe } = Yt), Ye = s.value[Fe[0]] || null, pt = s.value[Fe[1]] || null;
      }
      Ye !== null && (Ye.size = Math.min(Math.max(Ae - J.prevPanesSize - J.prevReachedMinPanes, Ye.min), Ye.max)), pt !== null && (pt.size = Math.min(Math.max(100 - Ae - J.nextPanesSize - J.nextReachedMinPanes, pt.min), pt.max));
    }, _ = (O, W) => {
      const J = h.value.activeSplitter, Q = [J, J + 1];
      return W < O.prevPanesSize + s.value[Q[0]].min && (Q[0] = G(J).index, O.prevReachedMinPanes = 0, Q[0] < J && s.value.forEach((ie, Ae) => {
        Ae > Q[0] && Ae <= J && (ie.size = ie.min, O.prevReachedMinPanes += ie.min);
      }), O.prevPanesSize = A(Q[0]), Q[0] === void 0) ? (O.prevReachedMinPanes = 0, s.value[0].size = s.value[0].min, s.value.forEach((ie, Ae) => {
        Ae > 0 && Ae <= J && (ie.size = ie.min, O.prevReachedMinPanes += ie.min);
      }), s.value[Q[1]].size = 100 - O.prevReachedMinPanes - s.value[0].min - O.prevPanesSize - O.nextPanesSize, null) : W > 100 - O.nextPanesSize - s.value[Q[1]].min && (Q[1] = _e(J).index, O.nextReachedMinPanes = 0, Q[1] > J + 1 && s.value.forEach((ie, Ae) => {
        Ae > J && Ae < Q[1] && (ie.size = ie.min, O.nextReachedMinPanes += ie.min);
      }), O.nextPanesSize = Z(Q[1] - 1), Q[1] === void 0) ? (O.nextReachedMinPanes = 0, s.value.forEach((ie, Ae) => {
        Ae < f.value - 1 && Ae >= J + 1 && (ie.size = ie.min, O.nextReachedMinPanes += ie.min);
      }), s.value[Q[0]].size = 100 - O.prevPanesSize - Z(Q[0] - 1), null) : { sums: O, panesToResize: Q };
    }, A = (O) => s.value.reduce((W, J, Q) => W + (Q < O ? J.size : 0), 0), Z = (O) => s.value.reduce((W, J, Q) => W + (Q > O + 1 ? J.size : 0), 0), G = (O) => [...s.value].reverse().find((W) => W.index < O && W.size > W.min) || {}, _e = (O) => s.value.find((W) => W.index > O + 1 && W.size > W.min) || {}, ye = () => {
      var O;
      const W = Array.from(((O = c.value) == null ? void 0 : O.children) || []);
      for (const J of W) {
        const Q = J.classList.contains("splitpanes__pane"), ie = J.classList.contains("splitpanes__splitter");
        !Q && !ie && (J.remove(), console.warn("Splitpanes: Only <pane> elements are allowed at the root of <splitpanes>. One of your DOM nodes was removed."));
      }
    }, z = (O, W, J = !1) => {
      const Q = O - 1, ie = document.createElement("div");
      ie.classList.add("splitpanes__splitter"), J || (ie.onmousedown = (Ae) => T(Ae, Q), typeof window < "u" && "ontouchstart" in window && (ie.ontouchstart = (Ae) => T(Ae, Q)), ie.onclick = (Ae) => F(Ae, Q + 1)), ie.ondblclick = (Ae) => P(Ae, Q + 1), W.parentNode.insertBefore(ie, W);
    }, fe = (O) => {
      O.onmousedown = void 0, O.onclick = void 0, O.ondblclick = void 0, O.remove();
    }, j = () => {
      var O;
      const W = Array.from(((O = c.value) == null ? void 0 : O.children) || []);
      for (const Q of W)
        Q.className.includes("splitpanes__splitter") && fe(Q);
      let J = 0;
      for (const Q of W)
        Q.className.includes("splitpanes__pane") && (!J && o.firstSplitter ? z(J, Q, !0) : J && z(J, Q), J++);
    }, se = ({ uid: O, ...W }) => {
      const J = l.value[O];
      for (const [Q, ie] of Object.entries(W)) J[Q] = ie;
    }, ue = (O) => {
      var W;
      let J = -1;
      Array.from(((W = c.value) == null ? void 0 : W.children) || []).some((Q) => (Q.className.includes("splitpanes__pane") && J++, Q.isSameNode(O.el))), s.value.splice(J, 0, { ...O, index: J }), s.value.forEach((Q, ie) => Q.index = ie), p.value && Oi(() => {
        j(), Ie({ addedPane: s.value[J] }), de("pane-add", { pane: s.value[J] });
      });
    }, Te = (O) => {
      const W = s.value.findIndex((Q) => Q.id === O);
      s.value[W].el = null;
      const J = s.value.splice(W, 1)[0];
      s.value.forEach((Q, ie) => Q.index = ie), Oi(() => {
        j(), de("pane-remove", { pane: J }), Ie({ removedPane: { ...J } });
      });
    }, Ie = (O = {}) => {
      !O.addedPane && !O.removedPane ? he() : s.value.some((W) => W.givenSize !== null || W.min || W.max < 100) ? Ee(O) : Me(), p.value && de("resized");
    }, Me = () => {
      const O = 100 / f.value;
      let W = 0;
      const J = [], Q = [];
      for (const ie of s.value)
        ie.size = Math.max(Math.min(O, ie.max), ie.min), W -= ie.size, ie.size >= ie.max && J.push(ie.id), ie.size <= ie.min && Q.push(ie.id);
      W > 0.1 && le(W, J, Q);
    }, he = () => {
      let O = 100;
      const W = [], J = [];
      let Q = 0;
      for (const Ae of s.value)
        O -= Ae.size, Ae.givenSize !== null && Q++, Ae.size >= Ae.max && W.push(Ae.id), Ae.size <= Ae.min && J.push(Ae.id);
      let ie = 100;
      if (O > 0.1) {
        for (const Ae of s.value)
          Ae.givenSize === null && (Ae.size = Math.max(Math.min(O / (f.value - Q), Ae.max), Ae.min)), ie -= Ae.size;
        ie > 0.1 && le(ie, W, J);
      }
    }, Ee = ({ addedPane: O, removedPane: W } = {}) => {
      let J = 100 / f.value, Q = 0;
      const ie = [], Ae = [];
      (O?.givenSize ?? null) !== null && (J = (100 - O.givenSize) / (f.value - 1));
      for (const Fe of s.value)
        Q -= Fe.size, Fe.size >= Fe.max && ie.push(Fe.id), Fe.size <= Fe.min && Ae.push(Fe.id);
      if (!(Math.abs(Q) < 0.1)) {
        for (const Fe of s.value)
          O?.givenSize !== null && O?.id === Fe.id || (Fe.size = Math.max(Math.min(J, Fe.max), Fe.min)), Q -= Fe.size, Fe.size >= Fe.max && ie.push(Fe.id), Fe.size <= Fe.min && Ae.push(Fe.id);
        Q > 0.1 && le(Q, ie, Ae);
      }
    }, le = (O, W, J) => {
      let Q;
      O > 0 ? Q = O / (f.value - W.length) : Q = O / (f.value - J.length), s.value.forEach((ie, Ae) => {
        if (O > 0 && !W.includes(ie.id)) {
          const Fe = Math.max(Math.min(ie.size + Q, ie.max), ie.min), Ye = Fe - ie.size;
          O -= Ye, ie.size = Fe;
        } else if (!J.includes(ie.id)) {
          const Fe = Math.max(Math.min(ie.size + Q, ie.max), ie.min), Ye = Fe - ie.size;
          O -= Ye, ie.size = Fe;
        }
      }), Math.abs(O) > 0.1 && Oi(() => {
        p.value && console.warn("Splitpanes: Could not resize panes correctly due to their constraints.");
      });
    }, de = (O, W = void 0, J = !1) => {
      const Q = W?.index ?? h.value.activeSplitter ?? null;
      n(O, {
        ...W,
        ...Q !== null && { index: Q },
        ...J && Q !== null && {
          prevPane: s.value[Q - (o.firstSplitter ? 1 : 0)],
          nextPane: s.value[Q + (o.firstSplitter ? 0 : 1)]
        },
        panes: s.value.map((ie) => ({ min: ie.min, max: ie.max, size: ie.size }))
      });
    };
    Zt(() => o.firstSplitter, () => j()), ci(() => {
      ye(), j(), Ie(), de("ready"), p.value = !0;
    }), Fc(() => p.value = !1);
    const V = () => {
      var O;
      return oi(
        "div",
        { ref: c, class: E.value },
        (O = a.default) == null ? void 0 : O.call(a)
      );
    };
    return on("panes", s), on("indexedPanes", l), on("horizontal", $e(() => o.horizontal)), on("requestUpdate", se), on("onPaneAdd", ue), on("onPaneRemove", Te), on("onPaneClick", g), (O, W) => (q(), an(Qb(V)));
  }
}, Uh = {
  __name: "pane",
  props: {
    size: { type: [Number, String] },
    minSize: { type: [Number, String], default: 0 },
    maxSize: { type: [Number, String], default: 100 }
  },
  setup(e) {
    var t;
    const n = e, o = ft("requestUpdate"), a = ft("onPaneAdd"), s = ft("horizontal"), l = ft("onPaneRemove"), f = ft("onPaneClick"), c = (t = wg()) == null ? void 0 : t.uid, p = ft("indexedPanes"), h = $e(() => p.value[c]), v = qe(null), E = $e(() => {
      const x = isNaN(n.size) || n.size === void 0 ? 0 : parseFloat(n.size);
      return Math.max(Math.min(x, R.value), b.value);
    }), b = $e(() => {
      const x = parseFloat(n.minSize);
      return isNaN(x) ? 0 : x;
    }), R = $e(() => {
      const x = parseFloat(n.maxSize);
      return isNaN(x) ? 100 : x;
    }), T = $e(() => {
      var x;
      return `${s.value ? "height" : "width"}: ${(x = h.value) == null ? void 0 : x.size}%`;
    });
    return Zt(() => E.value, (x) => o({ uid: c, size: x })), Zt(() => b.value, (x) => o({ uid: c, min: x })), Zt(() => R.value, (x) => o({ uid: c, max: x })), ci(() => {
      a({
        id: c,
        el: v.value,
        min: b.value,
        max: R.value,
        // The given size (useful to know the user intention).
        givenSize: n.size === void 0 ? null : E.value,
        size: E.value
        // The computed current size at any time.
      });
    }), Fc(() => l(c)), (x, I) => (q(), re("div", {
      ref_key: "paneEl",
      ref: v,
      class: "splitpanes__pane",
      onClick: I[0] || (I[0] = (F) => S(f)(F, x._.uid)),
      style: ii(T.value)
    }, [
      xo(x.$slots, "default")
    ], 4));
  }
}, Nu = Symbol("selectedNodeId"), Vu = Symbol("highlightedNodeId"), ro = Symbol("selectNode"), Jo = Symbol("viewOptions"), Hr = Symbol("plan");
var hu = { exports: {} };
/*!
 * clipboard.js v2.0.11
 * https://clipboardjs.com/
 *
 * Licensed MIT © Zeno Rocha
 */
var sO = hu.exports, $h;
function uO() {
  return $h || ($h = 1, function(e, t) {
    (function(o, a) {
      e.exports = a();
    })(sO, function() {
      return (
        /******/
        function() {
          var n = {
            /***/
            686: (
              /***/
              function(s, l, f) {
                f.d(l, {
                  default: function() {
                    return (
                      /* binding */
                      Me
                    );
                  }
                });
                var c = f(279), p = /* @__PURE__ */ f.n(c), h = f(370), v = /* @__PURE__ */ f.n(h), E = f(817), b = /* @__PURE__ */ f.n(E);
                function R(he) {
                  try {
                    return document.execCommand(he);
                  } catch {
                    return !1;
                  }
                }
                var T = function(Ee) {
                  var le = b()(Ee);
                  return R("cut"), le;
                }, x = T;
                function I(he) {
                  var Ee = document.documentElement.getAttribute("dir") === "rtl", le = document.createElement("textarea");
                  le.style.fontSize = "12pt", le.style.border = "0", le.style.padding = "0", le.style.margin = "0", le.style.position = "absolute", le.style[Ee ? "right" : "left"] = "-9999px";
                  var de = window.pageYOffset || document.documentElement.scrollTop;
                  return le.style.top = "".concat(de, "px"), le.setAttribute("readonly", ""), le.value = he, le;
                }
                var F = function(Ee, le) {
                  var de = I(Ee);
                  le.container.appendChild(de);
                  var V = b()(de);
                  return R("copy"), de.remove(), V;
                }, P = function(Ee) {
                  var le = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                    container: document.body
                  }, de = "";
                  return typeof Ee == "string" ? de = F(Ee, le) : Ee instanceof HTMLInputElement && !["text", "search", "url", "tel", "password"].includes(Ee?.type) ? de = F(Ee.value, le) : (de = b()(Ee), R("copy")), de;
                }, g = P;
                function H(he) {
                  "@babel/helpers - typeof";
                  return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? H = function(le) {
                    return typeof le;
                  } : H = function(le) {
                    return le && typeof Symbol == "function" && le.constructor === Symbol && le !== Symbol.prototype ? "symbol" : typeof le;
                  }, H(he);
                }
                var $ = function() {
                  var Ee = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, le = Ee.action, de = le === void 0 ? "copy" : le, V = Ee.container, O = Ee.target, W = Ee.text;
                  if (de !== "copy" && de !== "cut")
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                  if (O !== void 0)
                    if (O && H(O) === "object" && O.nodeType === 1) {
                      if (de === "copy" && O.hasAttribute("disabled"))
                        throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                      if (de === "cut" && (O.hasAttribute("readonly") || O.hasAttribute("disabled")))
                        throw new Error(`Invalid "target" attribute. You can't cut text from elements with "readonly" or "disabled" attributes`);
                    } else
                      throw new Error('Invalid "target" value, use a valid Element');
                  if (W)
                    return g(W, {
                      container: V
                    });
                  if (O)
                    return de === "cut" ? x(O) : g(O, {
                      container: V
                    });
                }, U = $;
                function _(he) {
                  "@babel/helpers - typeof";
                  return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? _ = function(le) {
                    return typeof le;
                  } : _ = function(le) {
                    return le && typeof Symbol == "function" && le.constructor === Symbol && le !== Symbol.prototype ? "symbol" : typeof le;
                  }, _(he);
                }
                function A(he, Ee) {
                  if (!(he instanceof Ee))
                    throw new TypeError("Cannot call a class as a function");
                }
                function Z(he, Ee) {
                  for (var le = 0; le < Ee.length; le++) {
                    var de = Ee[le];
                    de.enumerable = de.enumerable || !1, de.configurable = !0, "value" in de && (de.writable = !0), Object.defineProperty(he, de.key, de);
                  }
                }
                function G(he, Ee, le) {
                  return Ee && Z(he.prototype, Ee), le && Z(he, le), he;
                }
                function _e(he, Ee) {
                  if (typeof Ee != "function" && Ee !== null)
                    throw new TypeError("Super expression must either be null or a function");
                  he.prototype = Object.create(Ee && Ee.prototype, { constructor: { value: he, writable: !0, configurable: !0 } }), Ee && ye(he, Ee);
                }
                function ye(he, Ee) {
                  return ye = Object.setPrototypeOf || function(de, V) {
                    return de.__proto__ = V, de;
                  }, ye(he, Ee);
                }
                function z(he) {
                  var Ee = se();
                  return function() {
                    var de = ue(he), V;
                    if (Ee) {
                      var O = ue(this).constructor;
                      V = Reflect.construct(de, arguments, O);
                    } else
                      V = de.apply(this, arguments);
                    return fe(this, V);
                  };
                }
                function fe(he, Ee) {
                  return Ee && (_(Ee) === "object" || typeof Ee == "function") ? Ee : j(he);
                }
                function j(he) {
                  if (he === void 0)
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  return he;
                }
                function se() {
                  if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
                  if (typeof Proxy == "function") return !0;
                  try {
                    return Date.prototype.toString.call(Reflect.construct(Date, [], function() {
                    })), !0;
                  } catch {
                    return !1;
                  }
                }
                function ue(he) {
                  return ue = Object.setPrototypeOf ? Object.getPrototypeOf : function(le) {
                    return le.__proto__ || Object.getPrototypeOf(le);
                  }, ue(he);
                }
                function Te(he, Ee) {
                  var le = "data-clipboard-".concat(he);
                  if (Ee.hasAttribute(le))
                    return Ee.getAttribute(le);
                }
                var Ie = /* @__PURE__ */ function(he) {
                  _e(le, he);
                  var Ee = z(le);
                  function le(de, V) {
                    var O;
                    return A(this, le), O = Ee.call(this), O.resolveOptions(V), O.listenClick(de), O;
                  }
                  return G(le, [{
                    key: "resolveOptions",
                    value: function() {
                      var V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                      this.action = typeof V.action == "function" ? V.action : this.defaultAction, this.target = typeof V.target == "function" ? V.target : this.defaultTarget, this.text = typeof V.text == "function" ? V.text : this.defaultText, this.container = _(V.container) === "object" ? V.container : document.body;
                    }
                    /**
                     * Adds a click event listener to the passed trigger.
                     * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
                     */
                  }, {
                    key: "listenClick",
                    value: function(V) {
                      var O = this;
                      this.listener = v()(V, "click", function(W) {
                        return O.onClick(W);
                      });
                    }
                    /**
                     * Defines a new `ClipboardAction` on each click event.
                     * @param {Event} e
                     */
                  }, {
                    key: "onClick",
                    value: function(V) {
                      var O = V.delegateTarget || V.currentTarget, W = this.action(O) || "copy", J = U({
                        action: W,
                        container: this.container,
                        target: this.target(O),
                        text: this.text(O)
                      });
                      this.emit(J ? "success" : "error", {
                        action: W,
                        text: J,
                        trigger: O,
                        clearSelection: function() {
                          O && O.focus(), window.getSelection().removeAllRanges();
                        }
                      });
                    }
                    /**
                     * Default `action` lookup function.
                     * @param {Element} trigger
                     */
                  }, {
                    key: "defaultAction",
                    value: function(V) {
                      return Te("action", V);
                    }
                    /**
                     * Default `target` lookup function.
                     * @param {Element} trigger
                     */
                  }, {
                    key: "defaultTarget",
                    value: function(V) {
                      var O = Te("target", V);
                      if (O)
                        return document.querySelector(O);
                    }
                    /**
                     * Allow fire programmatically a copy action
                     * @param {String|HTMLElement} target
                     * @param {Object} options
                     * @returns Text copied.
                     */
                  }, {
                    key: "defaultText",
                    /**
                     * Default `text` lookup function.
                     * @param {Element} trigger
                     */
                    value: function(V) {
                      return Te("text", V);
                    }
                    /**
                     * Destroy lifecycle.
                     */
                  }, {
                    key: "destroy",
                    value: function() {
                      this.listener.destroy();
                    }
                  }], [{
                    key: "copy",
                    value: function(V) {
                      var O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                        container: document.body
                      };
                      return g(V, O);
                    }
                    /**
                     * Allow fire programmatically a cut action
                     * @param {String|HTMLElement} target
                     * @returns Text cutted.
                     */
                  }, {
                    key: "cut",
                    value: function(V) {
                      return x(V);
                    }
                    /**
                     * Returns the support of the given action, or all actions if no action is
                     * given.
                     * @param {String} [action]
                     */
                  }, {
                    key: "isSupported",
                    value: function() {
                      var V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ["copy", "cut"], O = typeof V == "string" ? [V] : V, W = !!document.queryCommandSupported;
                      return O.forEach(function(J) {
                        W = W && !!document.queryCommandSupported(J);
                      }), W;
                    }
                  }]), le;
                }(p()), Me = Ie;
              }
            ),
            /***/
            828: (
              /***/
              function(s) {
                var l = 9;
                if (typeof Element < "u" && !Element.prototype.matches) {
                  var f = Element.prototype;
                  f.matches = f.matchesSelector || f.mozMatchesSelector || f.msMatchesSelector || f.oMatchesSelector || f.webkitMatchesSelector;
                }
                function c(p, h) {
                  for (; p && p.nodeType !== l; ) {
                    if (typeof p.matches == "function" && p.matches(h))
                      return p;
                    p = p.parentNode;
                  }
                }
                s.exports = c;
              }
            ),
            /***/
            438: (
              /***/
              function(s, l, f) {
                var c = f(828);
                function p(E, b, R, T, x) {
                  var I = v.apply(this, arguments);
                  return E.addEventListener(R, I, x), {
                    destroy: function() {
                      E.removeEventListener(R, I, x);
                    }
                  };
                }
                function h(E, b, R, T, x) {
                  return typeof E.addEventListener == "function" ? p.apply(null, arguments) : typeof R == "function" ? p.bind(null, document).apply(null, arguments) : (typeof E == "string" && (E = document.querySelectorAll(E)), Array.prototype.map.call(E, function(I) {
                    return p(I, b, R, T, x);
                  }));
                }
                function v(E, b, R, T) {
                  return function(x) {
                    x.delegateTarget = c(x.target, b), x.delegateTarget && T.call(E, x);
                  };
                }
                s.exports = h;
              }
            ),
            /***/
            879: (
              /***/
              function(s, l) {
                l.node = function(f) {
                  return f !== void 0 && f instanceof HTMLElement && f.nodeType === 1;
                }, l.nodeList = function(f) {
                  var c = Object.prototype.toString.call(f);
                  return f !== void 0 && (c === "[object NodeList]" || c === "[object HTMLCollection]") && "length" in f && (f.length === 0 || l.node(f[0]));
                }, l.string = function(f) {
                  return typeof f == "string" || f instanceof String;
                }, l.fn = function(f) {
                  var c = Object.prototype.toString.call(f);
                  return c === "[object Function]";
                };
              }
            ),
            /***/
            370: (
              /***/
              function(s, l, f) {
                var c = f(879), p = f(438);
                function h(R, T, x) {
                  if (!R && !T && !x)
                    throw new Error("Missing required arguments");
                  if (!c.string(T))
                    throw new TypeError("Second argument must be a String");
                  if (!c.fn(x))
                    throw new TypeError("Third argument must be a Function");
                  if (c.node(R))
                    return v(R, T, x);
                  if (c.nodeList(R))
                    return E(R, T, x);
                  if (c.string(R))
                    return b(R, T, x);
                  throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList");
                }
                function v(R, T, x) {
                  return R.addEventListener(T, x), {
                    destroy: function() {
                      R.removeEventListener(T, x);
                    }
                  };
                }
                function E(R, T, x) {
                  return Array.prototype.forEach.call(R, function(I) {
                    I.addEventListener(T, x);
                  }), {
                    destroy: function() {
                      Array.prototype.forEach.call(R, function(I) {
                        I.removeEventListener(T, x);
                      });
                    }
                  };
                }
                function b(R, T, x) {
                  return p(document.body, R, T, x);
                }
                s.exports = h;
              }
            ),
            /***/
            817: (
              /***/
              function(s) {
                function l(f) {
                  var c;
                  if (f.nodeName === "SELECT")
                    f.focus(), c = f.value;
                  else if (f.nodeName === "INPUT" || f.nodeName === "TEXTAREA") {
                    var p = f.hasAttribute("readonly");
                    p || f.setAttribute("readonly", ""), f.select(), f.setSelectionRange(0, f.value.length), p || f.removeAttribute("readonly"), c = f.value;
                  } else {
                    f.hasAttribute("contenteditable") && f.focus();
                    var h = window.getSelection(), v = document.createRange();
                    v.selectNodeContents(f), h.removeAllRanges(), h.addRange(v), c = h.toString();
                  }
                  return c;
                }
                s.exports = l;
              }
            ),
            /***/
            279: (
              /***/
              function(s) {
                function l() {
                }
                l.prototype = {
                  on: function(f, c, p) {
                    var h = this.e || (this.e = {});
                    return (h[f] || (h[f] = [])).push({
                      fn: c,
                      ctx: p
                    }), this;
                  },
                  once: function(f, c, p) {
                    var h = this;
                    function v() {
                      h.off(f, v), c.apply(p, arguments);
                    }
                    return v._ = c, this.on(f, v, p);
                  },
                  emit: function(f) {
                    var c = [].slice.call(arguments, 1), p = ((this.e || (this.e = {}))[f] || []).slice(), h = 0, v = p.length;
                    for (h; h < v; h++)
                      p[h].fn.apply(p[h].ctx, c);
                    return this;
                  },
                  off: function(f, c) {
                    var p = this.e || (this.e = {}), h = p[f], v = [];
                    if (h && c)
                      for (var E = 0, b = h.length; E < b; E++)
                        h[E].fn !== c && h[E].fn._ !== c && v.push(h[E]);
                    return v.length ? p[f] = v : delete p[f], this;
                  }
                }, s.exports = l, s.exports.TinyEmitter = l;
              }
            )
            /******/
          }, o = {};
          function a(s) {
            if (o[s])
              return o[s].exports;
            var l = o[s] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            return n[s](l, l.exports, a), l.exports;
          }
          return function() {
            a.n = function(s) {
              var l = s && s.__esModule ? (
                /******/
                function() {
                  return s.default;
                }
              ) : (
                /******/
                function() {
                  return s;
                }
              );
              return a.d(l, { a: l }), l;
            };
          }(), function() {
            a.d = function(s, l) {
              for (var f in l)
                a.o(l, f) && !a.o(s, f) && Object.defineProperty(s, f, { enumerable: !0, get: l[f] });
            };
          }(), function() {
            a.o = function(s, l) {
              return Object.prototype.hasOwnProperty.call(s, l);
            };
          }(), a(686);
        }().default
      );
    });
  }(hu)), hu.exports;
}
var lO = uO();
const fO = /* @__PURE__ */ Yu(lO), cO = (e) => ({
  toClipboard(t, n) {
    return new Promise((o, a) => {
      const s = document.createElement("button"), l = new fO(s, {
        text: () => t,
        action: () => "copy",
        container: n !== void 0 ? n : document.body
      });
      l.on("success", (f) => {
        l.destroy(), o(f);
      }), l.on("error", (f) => {
        l.destroy(), a(f);
      }), document.body.appendChild(s), s.click(), document.body.removeChild(s);
    });
  }
});
/*!
  * vue-tippy v6.7.1
  * (c) 2025 
  * @license MIT
  */
var In = "top", rr = "bottom", ir = "right", Rn = "left", Bc = "auto", Ka = [In, rr, ir, Rn], $o = "start", Ba = "end", dO = "clippingParents", xg = "viewport", Ta = "popper", pO = "reference", kh = /* @__PURE__ */ Ka.reduce(function(e, t) {
  return e.concat([t + "-" + $o, t + "-" + Ba]);
}, []), Cg = /* @__PURE__ */ [].concat(Ka, [Bc]).reduce(function(e, t) {
  return e.concat([t, t + "-" + $o, t + "-" + Ba]);
}, []), hO = "beforeRead", vO = "read", gO = "afterRead", mO = "beforeMain", EO = "main", _O = "afterMain", yO = "beforeWrite", TO = "write", AO = "afterWrite", bO = [hO, vO, gO, mO, EO, _O, yO, TO, AO];
function kr(e) {
  return e ? (e.nodeName || "").toLowerCase() : null;
}
function br(e) {
  if (e == null)
    return window;
  if (e.toString() !== "[object Window]") {
    var t = e.ownerDocument;
    return t && t.defaultView || window;
  }
  return e;
}
function ko(e) {
  var t = br(e).Element;
  return e instanceof t || e instanceof Element;
}
function tr(e) {
  var t = br(e).HTMLElement;
  return e instanceof t || e instanceof HTMLElement;
}
function Lg(e) {
  if (typeof ShadowRoot > "u")
    return !1;
  var t = br(e).ShadowRoot;
  return e instanceof t || e instanceof ShadowRoot;
}
function OO(e) {
  var t = e.state;
  Object.keys(t.elements).forEach(function(n) {
    var o = t.styles[n] || {}, a = t.attributes[n] || {}, s = t.elements[n];
    !tr(s) || !kr(s) || (Object.assign(s.style, o), Object.keys(a).forEach(function(l) {
      var f = a[l];
      f === !1 ? s.removeAttribute(l) : s.setAttribute(l, f === !0 ? "" : f);
    }));
  });
}
function NO(e) {
  var t = e.state, n = {
    popper: {
      position: t.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  return Object.assign(t.elements.popper.style, n.popper), t.styles = n, t.elements.arrow && Object.assign(t.elements.arrow.style, n.arrow), function() {
    Object.keys(t.elements).forEach(function(o) {
      var a = t.elements[o], s = t.attributes[o] || {}, l = Object.keys(t.styles.hasOwnProperty(o) ? t.styles[o] : n[o]), f = l.reduce(function(c, p) {
        return c[p] = "", c;
      }, {});
      !tr(a) || !kr(a) || (Object.assign(a.style, f), Object.keys(s).forEach(function(c) {
        a.removeAttribute(c);
      }));
    });
  };
}
var Mg = {
  name: "applyStyles",
  enabled: !0,
  phase: "write",
  fn: OO,
  effect: NO,
  requires: ["computeStyles"]
};
function Pr(e) {
  return e.split("-")[0];
}
var Qi = Math.max, Su = Math.min, Fo = Math.round;
function Bo(e, t) {
  t === void 0 && (t = !1);
  var n = e.getBoundingClientRect(), o = 1, a = 1;
  if (tr(e) && t) {
    var s = e.offsetHeight, l = e.offsetWidth;
    l > 0 && (o = Fo(n.width) / l || 1), s > 0 && (a = Fo(n.height) / s || 1);
  }
  return {
    width: n.width / o,
    height: n.height / a,
    top: n.top / a,
    right: n.right / o,
    bottom: n.bottom / a,
    left: n.left / o,
    x: n.left / o,
    y: n.top / a
  };
}
function Hc(e) {
  var t = Bo(e), n = e.offsetWidth, o = e.offsetHeight;
  return Math.abs(t.width - n) <= 1 && (n = t.width), Math.abs(t.height - o) <= 1 && (o = t.height), {
    x: e.offsetLeft,
    y: e.offsetTop,
    width: n,
    height: o
  };
}
function Dg(e, t) {
  var n = t.getRootNode && t.getRootNode();
  if (e.contains(t))
    return !0;
  if (n && Lg(n)) {
    var o = t;
    do {
      if (o && e.isSameNode(o))
        return !0;
      o = o.parentNode || o.host;
    } while (o);
  }
  return !1;
}
function Fr(e) {
  return br(e).getComputedStyle(e);
}
function SO(e) {
  return ["table", "td", "th"].indexOf(kr(e)) >= 0;
}
function Ri(e) {
  return ((ko(e) ? e.ownerDocument : (
    // $FlowFixMe[prop-missing]
    e.document
  )) || window.document).documentElement;
}
function ju(e) {
  return kr(e) === "html" ? e : (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    e.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    e.parentNode || // DOM Element detected
    (Lg(e) ? e.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    Ri(e)
  );
}
function Fh(e) {
  return !tr(e) || // https://github.com/popperjs/popper-core/issues/837
  Fr(e).position === "fixed" ? null : e.offsetParent;
}
function IO(e) {
  var t = navigator.userAgent.toLowerCase().indexOf("firefox") !== -1, n = navigator.userAgent.indexOf("Trident") !== -1;
  if (n && tr(e)) {
    var o = Fr(e);
    if (o.position === "fixed")
      return null;
  }
  for (var a = ju(e); tr(a) && ["html", "body"].indexOf(kr(a)) < 0; ) {
    var s = Fr(a);
    if (s.transform !== "none" || s.perspective !== "none" || s.contain === "paint" || ["transform", "perspective"].indexOf(s.willChange) !== -1 || t && s.willChange === "filter" || t && s.filter && s.filter !== "none")
      return a;
    a = a.parentNode;
  }
  return null;
}
function qa(e) {
  for (var t = br(e), n = Fh(e); n && SO(n) && Fr(n).position === "static"; )
    n = Fh(n);
  return n && (kr(n) === "html" || kr(n) === "body" && Fr(n).position === "static") ? t : n || IO(e) || t;
}
function Gc(e) {
  return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
}
function La(e, t, n) {
  return Qi(e, Su(t, n));
}
function RO(e, t, n) {
  var o = La(e, t, n);
  return o > n ? n : o;
}
function Pg() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}
function Ug(e) {
  return Object.assign({}, Pg(), e);
}
function $g(e, t) {
  return t.reduce(function(n, o) {
    return n[o] = e, n;
  }, {});
}
var wO = function(t, n) {
  return t = typeof t == "function" ? t(Object.assign({}, n.rects, {
    placement: n.placement
  })) : t, Ug(typeof t != "number" ? t : $g(t, Ka));
};
function xO(e) {
  var t, n = e.state, o = e.name, a = e.options, s = n.elements.arrow, l = n.modifiersData.popperOffsets, f = Pr(n.placement), c = Gc(f), p = [Rn, ir].indexOf(f) >= 0, h = p ? "height" : "width";
  if (!(!s || !l)) {
    var v = wO(a.padding, n), E = Hc(s), b = c === "y" ? In : Rn, R = c === "y" ? rr : ir, T = n.rects.reference[h] + n.rects.reference[c] - l[c] - n.rects.popper[h], x = l[c] - n.rects.reference[c], I = qa(s), F = I ? c === "y" ? I.clientHeight || 0 : I.clientWidth || 0 : 0, P = T / 2 - x / 2, g = v[b], H = F - E[h] - v[R], $ = F / 2 - E[h] / 2 + P, U = La(g, $, H), _ = c;
    n.modifiersData[o] = (t = {}, t[_] = U, t.centerOffset = U - $, t);
  }
}
function CO(e) {
  var t = e.state, n = e.options, o = n.element, a = o === void 0 ? "[data-popper-arrow]" : o;
  a != null && (typeof a == "string" && (a = t.elements.popper.querySelector(a), !a) || Dg(t.elements.popper, a) && (t.elements.arrow = a));
}
var LO = {
  name: "arrow",
  enabled: !0,
  phase: "main",
  fn: xO,
  effect: CO,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};
function Ho(e) {
  return e.split("-")[1];
}
var MO = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function DO(e) {
  var t = e.x, n = e.y, o = window, a = o.devicePixelRatio || 1;
  return {
    x: Fo(t * a) / a || 0,
    y: Fo(n * a) / a || 0
  };
}
function Bh(e) {
  var t, n = e.popper, o = e.popperRect, a = e.placement, s = e.variation, l = e.offsets, f = e.position, c = e.gpuAcceleration, p = e.adaptive, h = e.roundOffsets, v = e.isFixed, E = h === !0 ? DO(l) : typeof h == "function" ? h(l) : l, b = E.x, R = b === void 0 ? 0 : b, T = E.y, x = T === void 0 ? 0 : T, I = l.hasOwnProperty("x"), F = l.hasOwnProperty("y"), P = Rn, g = In, H = window;
  if (p) {
    var $ = qa(n), U = "clientHeight", _ = "clientWidth";
    if ($ === br(n) && ($ = Ri(n), Fr($).position !== "static" && f === "absolute" && (U = "scrollHeight", _ = "scrollWidth")), $ = $, a === In || (a === Rn || a === ir) && s === Ba) {
      g = rr;
      var A = v && H.visualViewport ? H.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        $[U]
      );
      x -= A - o.height, x *= c ? 1 : -1;
    }
    if (a === Rn || (a === In || a === rr) && s === Ba) {
      P = ir;
      var Z = v && H.visualViewport ? H.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        $[_]
      );
      R -= Z - o.width, R *= c ? 1 : -1;
    }
  }
  var G = Object.assign({
    position: f
  }, p && MO);
  if (c) {
    var _e;
    return Object.assign({}, G, (_e = {}, _e[g] = F ? "0" : "", _e[P] = I ? "0" : "", _e.transform = (H.devicePixelRatio || 1) <= 1 ? "translate(" + R + "px, " + x + "px)" : "translate3d(" + R + "px, " + x + "px, 0)", _e));
  }
  return Object.assign({}, G, (t = {}, t[g] = F ? x + "px" : "", t[P] = I ? R + "px" : "", t.transform = "", t));
}
function PO(e) {
  var t = e.state, n = e.options, o = n.gpuAcceleration, a = o === void 0 ? !0 : o, s = n.adaptive, l = s === void 0 ? !0 : s, f = n.roundOffsets, c = f === void 0 ? !0 : f, p = {
    placement: Pr(t.placement),
    variation: Ho(t.placement),
    popper: t.elements.popper,
    popperRect: t.rects.popper,
    gpuAcceleration: a,
    isFixed: t.options.strategy === "fixed"
  };
  t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, Bh(Object.assign({}, p, {
    offsets: t.modifiersData.popperOffsets,
    position: t.options.strategy,
    adaptive: l,
    roundOffsets: c
  })))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, Bh(Object.assign({}, p, {
    offsets: t.modifiersData.arrow,
    position: "absolute",
    adaptive: !1,
    roundOffsets: c
  })))), t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-placement": t.placement
  });
}
var UO = {
  name: "computeStyles",
  enabled: !0,
  phase: "beforeWrite",
  fn: PO,
  data: {}
}, eu = {
  passive: !0
};
function $O(e) {
  var t = e.state, n = e.instance, o = e.options, a = o.scroll, s = a === void 0 ? !0 : a, l = o.resize, f = l === void 0 ? !0 : l, c = br(t.elements.popper), p = [].concat(t.scrollParents.reference, t.scrollParents.popper);
  return s && p.forEach(function(h) {
    h.addEventListener("scroll", n.update, eu);
  }), f && c.addEventListener("resize", n.update, eu), function() {
    s && p.forEach(function(h) {
      h.removeEventListener("scroll", n.update, eu);
    }), f && c.removeEventListener("resize", n.update, eu);
  };
}
var kO = {
  name: "eventListeners",
  enabled: !0,
  phase: "write",
  fn: function() {
  },
  effect: $O,
  data: {}
}, FO = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function vu(e) {
  return e.replace(/left|right|bottom|top/g, function(t) {
    return FO[t];
  });
}
var BO = {
  start: "end",
  end: "start"
};
function Hh(e) {
  return e.replace(/start|end/g, function(t) {
    return BO[t];
  });
}
function zc(e) {
  var t = br(e), n = t.pageXOffset, o = t.pageYOffset;
  return {
    scrollLeft: n,
    scrollTop: o
  };
}
function Wc(e) {
  return Bo(Ri(e)).left + zc(e).scrollLeft;
}
function HO(e) {
  var t = br(e), n = Ri(e), o = t.visualViewport, a = n.clientWidth, s = n.clientHeight, l = 0, f = 0;
  return o && (a = o.width, s = o.height, /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (l = o.offsetLeft, f = o.offsetTop)), {
    width: a,
    height: s,
    x: l + Wc(e),
    y: f
  };
}
function GO(e) {
  var t, n = Ri(e), o = zc(e), a = (t = e.ownerDocument) == null ? void 0 : t.body, s = Qi(n.scrollWidth, n.clientWidth, a ? a.scrollWidth : 0, a ? a.clientWidth : 0), l = Qi(n.scrollHeight, n.clientHeight, a ? a.scrollHeight : 0, a ? a.clientHeight : 0), f = -o.scrollLeft + Wc(e), c = -o.scrollTop;
  return Fr(a || n).direction === "rtl" && (f += Qi(n.clientWidth, a ? a.clientWidth : 0) - s), {
    width: s,
    height: l,
    x: f,
    y: c
  };
}
function Xc(e) {
  var t = Fr(e), n = t.overflow, o = t.overflowX, a = t.overflowY;
  return /auto|scroll|overlay|hidden/.test(n + a + o);
}
function kg(e) {
  return ["html", "body", "#document"].indexOf(kr(e)) >= 0 ? e.ownerDocument.body : tr(e) && Xc(e) ? e : kg(ju(e));
}
function Ma(e, t) {
  var n;
  t === void 0 && (t = []);
  var o = kg(e), a = o === ((n = e.ownerDocument) == null ? void 0 : n.body), s = br(o), l = a ? [s].concat(s.visualViewport || [], Xc(o) ? o : []) : o, f = t.concat(l);
  return a ? f : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    f.concat(Ma(ju(l)))
  );
}
function ec(e) {
  return Object.assign({}, e, {
    left: e.x,
    top: e.y,
    right: e.x + e.width,
    bottom: e.y + e.height
  });
}
function zO(e) {
  var t = Bo(e);
  return t.top = t.top + e.clientTop, t.left = t.left + e.clientLeft, t.bottom = t.top + e.clientHeight, t.right = t.left + e.clientWidth, t.width = e.clientWidth, t.height = e.clientHeight, t.x = t.left, t.y = t.top, t;
}
function Gh(e, t) {
  return t === xg ? ec(HO(e)) : ko(t) ? zO(t) : ec(GO(Ri(e)));
}
function WO(e) {
  var t = Ma(ju(e)), n = ["absolute", "fixed"].indexOf(Fr(e).position) >= 0, o = n && tr(e) ? qa(e) : e;
  return ko(o) ? t.filter(function(a) {
    return ko(a) && Dg(a, o) && kr(a) !== "body" && (n ? Fr(a).position !== "static" : !0);
  }) : [];
}
function XO(e, t, n) {
  var o = t === "clippingParents" ? WO(e) : [].concat(t), a = [].concat(o, [n]), s = a[0], l = a.reduce(function(f, c) {
    var p = Gh(e, c);
    return f.top = Qi(p.top, f.top), f.right = Su(p.right, f.right), f.bottom = Su(p.bottom, f.bottom), f.left = Qi(p.left, f.left), f;
  }, Gh(e, s));
  return l.width = l.right - l.left, l.height = l.bottom - l.top, l.x = l.left, l.y = l.top, l;
}
function Fg(e) {
  var t = e.reference, n = e.element, o = e.placement, a = o ? Pr(o) : null, s = o ? Ho(o) : null, l = t.x + t.width / 2 - n.width / 2, f = t.y + t.height / 2 - n.height / 2, c;
  switch (a) {
    case In:
      c = {
        x: l,
        y: t.y - n.height
      };
      break;
    case rr:
      c = {
        x: l,
        y: t.y + t.height
      };
      break;
    case ir:
      c = {
        x: t.x + t.width,
        y: f
      };
      break;
    case Rn:
      c = {
        x: t.x - n.width,
        y: f
      };
      break;
    default:
      c = {
        x: t.x,
        y: t.y
      };
  }
  var p = a ? Gc(a) : null;
  if (p != null) {
    var h = p === "y" ? "height" : "width";
    switch (s) {
      case $o:
        c[p] = c[p] - (t[h] / 2 - n[h] / 2);
        break;
      case Ba:
        c[p] = c[p] + (t[h] / 2 - n[h] / 2);
        break;
    }
  }
  return c;
}
function Ha(e, t) {
  t === void 0 && (t = {});
  var n = t, o = n.placement, a = o === void 0 ? e.placement : o, s = n.boundary, l = s === void 0 ? dO : s, f = n.rootBoundary, c = f === void 0 ? xg : f, p = n.elementContext, h = p === void 0 ? Ta : p, v = n.altBoundary, E = v === void 0 ? !1 : v, b = n.padding, R = b === void 0 ? 0 : b, T = Ug(typeof R != "number" ? R : $g(R, Ka)), x = h === Ta ? pO : Ta, I = e.rects.popper, F = e.elements[E ? x : h], P = XO(ko(F) ? F : F.contextElement || Ri(e.elements.popper), l, c), g = Bo(e.elements.reference), H = Fg({
    reference: g,
    element: I,
    placement: a
  }), $ = ec(Object.assign({}, I, H)), U = h === Ta ? $ : g, _ = {
    top: P.top - U.top + T.top,
    bottom: U.bottom - P.bottom + T.bottom,
    left: P.left - U.left + T.left,
    right: U.right - P.right + T.right
  }, A = e.modifiersData.offset;
  if (h === Ta && A) {
    var Z = A[a];
    Object.keys(_).forEach(function(G) {
      var _e = [ir, rr].indexOf(G) >= 0 ? 1 : -1, ye = [In, rr].indexOf(G) >= 0 ? "y" : "x";
      _[G] += Z[ye] * _e;
    });
  }
  return _;
}
function YO(e, t) {
  t === void 0 && (t = {});
  var n = t, o = n.placement, a = n.boundary, s = n.rootBoundary, l = n.padding, f = n.flipVariations, c = n.allowedAutoPlacements, p = c === void 0 ? Cg : c, h = Ho(o), v = h ? f ? kh : kh.filter(function(R) {
    return Ho(R) === h;
  }) : Ka, E = v.filter(function(R) {
    return p.indexOf(R) >= 0;
  });
  E.length === 0 && (E = v);
  var b = E.reduce(function(R, T) {
    return R[T] = Ha(e, {
      placement: T,
      boundary: a,
      rootBoundary: s,
      padding: l
    })[Pr(T)], R;
  }, {});
  return Object.keys(b).sort(function(R, T) {
    return b[R] - b[T];
  });
}
function VO(e) {
  if (Pr(e) === Bc)
    return [];
  var t = vu(e);
  return [Hh(e), t, Hh(t)];
}
function jO(e) {
  var t = e.state, n = e.options, o = e.name;
  if (!t.modifiersData[o]._skip) {
    for (var a = n.mainAxis, s = a === void 0 ? !0 : a, l = n.altAxis, f = l === void 0 ? !0 : l, c = n.fallbackPlacements, p = n.padding, h = n.boundary, v = n.rootBoundary, E = n.altBoundary, b = n.flipVariations, R = b === void 0 ? !0 : b, T = n.allowedAutoPlacements, x = t.options.placement, I = Pr(x), F = I === x, P = c || (F || !R ? [vu(x)] : VO(x)), g = [x].concat(P).reduce(function(le, de) {
      return le.concat(Pr(de) === Bc ? YO(t, {
        placement: de,
        boundary: h,
        rootBoundary: v,
        padding: p,
        flipVariations: R,
        allowedAutoPlacements: T
      }) : de);
    }, []), H = t.rects.reference, $ = t.rects.popper, U = /* @__PURE__ */ new Map(), _ = !0, A = g[0], Z = 0; Z < g.length; Z++) {
      var G = g[Z], _e = Pr(G), ye = Ho(G) === $o, z = [In, rr].indexOf(_e) >= 0, fe = z ? "width" : "height", j = Ha(t, {
        placement: G,
        boundary: h,
        rootBoundary: v,
        altBoundary: E,
        padding: p
      }), se = z ? ye ? ir : Rn : ye ? rr : In;
      H[fe] > $[fe] && (se = vu(se));
      var ue = vu(se), Te = [];
      if (s && Te.push(j[_e] <= 0), f && Te.push(j[se] <= 0, j[ue] <= 0), Te.every(function(le) {
        return le;
      })) {
        A = G, _ = !1;
        break;
      }
      U.set(G, Te);
    }
    if (_)
      for (var Ie = R ? 3 : 1, Me = function(de) {
        var V = g.find(function(O) {
          var W = U.get(O);
          if (W)
            return W.slice(0, de).every(function(J) {
              return J;
            });
        });
        if (V)
          return A = V, "break";
      }, he = Ie; he > 0; he--) {
        var Ee = Me(he);
        if (Ee === "break") break;
      }
    t.placement !== A && (t.modifiersData[o]._skip = !0, t.placement = A, t.reset = !0);
  }
}
var KO = {
  name: "flip",
  enabled: !0,
  phase: "main",
  fn: jO,
  requiresIfExists: ["offset"],
  data: {
    _skip: !1
  }
};
function zh(e, t, n) {
  return n === void 0 && (n = {
    x: 0,
    y: 0
  }), {
    top: e.top - t.height - n.y,
    right: e.right - t.width + n.x,
    bottom: e.bottom - t.height + n.y,
    left: e.left - t.width - n.x
  };
}
function Wh(e) {
  return [In, ir, rr, Rn].some(function(t) {
    return e[t] >= 0;
  });
}
function qO(e) {
  var t = e.state, n = e.name, o = t.rects.reference, a = t.rects.popper, s = t.modifiersData.preventOverflow, l = Ha(t, {
    elementContext: "reference"
  }), f = Ha(t, {
    altBoundary: !0
  }), c = zh(l, o), p = zh(f, a, s), h = Wh(c), v = Wh(p);
  t.modifiersData[n] = {
    referenceClippingOffsets: c,
    popperEscapeOffsets: p,
    isReferenceHidden: h,
    hasPopperEscaped: v
  }, t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-reference-hidden": h,
    "data-popper-escaped": v
  });
}
var JO = {
  name: "hide",
  enabled: !0,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: qO
};
function ZO(e, t, n) {
  var o = Pr(e), a = [Rn, In].indexOf(o) >= 0 ? -1 : 1, s = typeof n == "function" ? n(Object.assign({}, t, {
    placement: e
  })) : n, l = s[0], f = s[1];
  return l = l || 0, f = (f || 0) * a, [Rn, ir].indexOf(o) >= 0 ? {
    x: f,
    y: l
  } : {
    x: l,
    y: f
  };
}
function QO(e) {
  var t = e.state, n = e.options, o = e.name, a = n.offset, s = a === void 0 ? [0, 0] : a, l = Cg.reduce(function(h, v) {
    return h[v] = ZO(v, t.rects, s), h;
  }, {}), f = l[t.placement], c = f.x, p = f.y;
  t.modifiersData.popperOffsets != null && (t.modifiersData.popperOffsets.x += c, t.modifiersData.popperOffsets.y += p), t.modifiersData[o] = l;
}
var eN = {
  name: "offset",
  enabled: !0,
  phase: "main",
  requires: ["popperOffsets"],
  fn: QO
};
function tN(e) {
  var t = e.state, n = e.name;
  t.modifiersData[n] = Fg({
    reference: t.rects.reference,
    element: t.rects.popper,
    placement: t.placement
  });
}
var nN = {
  name: "popperOffsets",
  enabled: !0,
  phase: "read",
  fn: tN,
  data: {}
};
function rN(e) {
  return e === "x" ? "y" : "x";
}
function iN(e) {
  var t = e.state, n = e.options, o = e.name, a = n.mainAxis, s = a === void 0 ? !0 : a, l = n.altAxis, f = l === void 0 ? !1 : l, c = n.boundary, p = n.rootBoundary, h = n.altBoundary, v = n.padding, E = n.tether, b = E === void 0 ? !0 : E, R = n.tetherOffset, T = R === void 0 ? 0 : R, x = Ha(t, {
    boundary: c,
    rootBoundary: p,
    padding: v,
    altBoundary: h
  }), I = Pr(t.placement), F = Ho(t.placement), P = !F, g = Gc(I), H = rN(g), $ = t.modifiersData.popperOffsets, U = t.rects.reference, _ = t.rects.popper, A = typeof T == "function" ? T(Object.assign({}, t.rects, {
    placement: t.placement
  })) : T, Z = typeof A == "number" ? {
    mainAxis: A,
    altAxis: A
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, A), G = t.modifiersData.offset ? t.modifiersData.offset[t.placement] : null, _e = {
    x: 0,
    y: 0
  };
  if ($) {
    if (s) {
      var ye, z = g === "y" ? In : Rn, fe = g === "y" ? rr : ir, j = g === "y" ? "height" : "width", se = $[g], ue = se + x[z], Te = se - x[fe], Ie = b ? -_[j] / 2 : 0, Me = F === $o ? U[j] : _[j], he = F === $o ? -_[j] : -U[j], Ee = t.elements.arrow, le = b && Ee ? Hc(Ee) : {
        width: 0,
        height: 0
      }, de = t.modifiersData["arrow#persistent"] ? t.modifiersData["arrow#persistent"].padding : Pg(), V = de[z], O = de[fe], W = La(0, U[j], le[j]), J = P ? U[j] / 2 - Ie - W - V - Z.mainAxis : Me - W - V - Z.mainAxis, Q = P ? -U[j] / 2 + Ie + W + O + Z.mainAxis : he + W + O + Z.mainAxis, ie = t.elements.arrow && qa(t.elements.arrow), Ae = ie ? g === "y" ? ie.clientTop || 0 : ie.clientLeft || 0 : 0, Fe = (ye = G?.[g]) != null ? ye : 0, Ye = se + J - Fe - Ae, pt = se + Q - Fe, zt = La(b ? Su(ue, Ye) : ue, se, b ? Qi(Te, pt) : Te);
      $[g] = zt, _e[g] = zt - se;
    }
    if (f) {
      var ht, Yt = g === "x" ? In : Rn, gn = g === "x" ? rr : ir, At = $[H], vt = H === "y" ? "height" : "width", Vt = At + x[Yt], Mt = At - x[gn], Ft = [In, Rn].indexOf(I) !== -1, Qt = (ht = G?.[H]) != null ? ht : 0, en = Ft ? Vt : At - U[vt] - _[vt] - Qt + Z.altAxis, Wt = Ft ? At + U[vt] + _[vt] - Qt - Z.altAxis : Mt, jt = b && Ft ? RO(en, At, Wt) : La(b ? en : Vt, At, b ? Wt : Mt);
      $[H] = jt, _e[H] = jt - At;
    }
    t.modifiersData[o] = _e;
  }
}
var oN = {
  name: "preventOverflow",
  enabled: !0,
  phase: "main",
  fn: iN,
  requiresIfExists: ["offset"]
};
function aN(e) {
  return {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  };
}
function sN(e) {
  return e === br(e) || !tr(e) ? zc(e) : aN(e);
}
function uN(e) {
  var t = e.getBoundingClientRect(), n = Fo(t.width) / e.offsetWidth || 1, o = Fo(t.height) / e.offsetHeight || 1;
  return n !== 1 || o !== 1;
}
function lN(e, t, n) {
  n === void 0 && (n = !1);
  var o = tr(t), a = tr(t) && uN(t), s = Ri(t), l = Bo(e, a), f = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = {
    x: 0,
    y: 0
  };
  return (o || !o && !n) && ((kr(t) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
  Xc(s)) && (f = sN(t)), tr(t) ? (c = Bo(t, !0), c.x += t.clientLeft, c.y += t.clientTop) : s && (c.x = Wc(s))), {
    x: l.left + f.scrollLeft - c.x,
    y: l.top + f.scrollTop - c.y,
    width: l.width,
    height: l.height
  };
}
function fN(e) {
  var t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), o = [];
  e.forEach(function(s) {
    t.set(s.name, s);
  });
  function a(s) {
    n.add(s.name);
    var l = [].concat(s.requires || [], s.requiresIfExists || []);
    l.forEach(function(f) {
      if (!n.has(f)) {
        var c = t.get(f);
        c && a(c);
      }
    }), o.push(s);
  }
  return e.forEach(function(s) {
    n.has(s.name) || a(s);
  }), o;
}
function cN(e) {
  var t = fN(e);
  return bO.reduce(function(n, o) {
    return n.concat(t.filter(function(a) {
      return a.phase === o;
    }));
  }, []);
}
function dN(e) {
  var t;
  return function() {
    return t || (t = new Promise(function(n) {
      Promise.resolve().then(function() {
        t = void 0, n(e());
      });
    })), t;
  };
}
function pN(e) {
  var t = e.reduce(function(n, o) {
    var a = n[o.name];
    return n[o.name] = a ? Object.assign({}, a, o, {
      options: Object.assign({}, a.options, o.options),
      data: Object.assign({}, a.data, o.data)
    }) : o, n;
  }, {});
  return Object.keys(t).map(function(n) {
    return t[n];
  });
}
var Xh = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function Yh() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return !t.some(function(o) {
    return !(o && typeof o.getBoundingClientRect == "function");
  });
}
function hN(e) {
  e === void 0 && (e = {});
  var t = e, n = t.defaultModifiers, o = n === void 0 ? [] : n, a = t.defaultOptions, s = a === void 0 ? Xh : a;
  return function(f, c, p) {
    p === void 0 && (p = s);
    var h = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, Xh, s),
      modifiersData: {},
      elements: {
        reference: f,
        popper: c
      },
      attributes: {},
      styles: {}
    }, v = [], E = !1, b = {
      state: h,
      setOptions: function(I) {
        var F = typeof I == "function" ? I(h.options) : I;
        T(), h.options = Object.assign({}, s, h.options, F), h.scrollParents = {
          reference: ko(f) ? Ma(f) : f.contextElement ? Ma(f.contextElement) : [],
          popper: Ma(c)
        };
        var P = cN(pN([].concat(o, h.options.modifiers)));
        return h.orderedModifiers = P.filter(function(g) {
          return g.enabled;
        }), R(), b.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function() {
        if (!E) {
          var I = h.elements, F = I.reference, P = I.popper;
          if (Yh(F, P)) {
            h.rects = {
              reference: lN(F, qa(P), h.options.strategy === "fixed"),
              popper: Hc(P)
            }, h.reset = !1, h.placement = h.options.placement, h.orderedModifiers.forEach(function(Z) {
              return h.modifiersData[Z.name] = Object.assign({}, Z.data);
            });
            for (var g = 0; g < h.orderedModifiers.length; g++) {
              if (h.reset === !0) {
                h.reset = !1, g = -1;
                continue;
              }
              var H = h.orderedModifiers[g], $ = H.fn, U = H.options, _ = U === void 0 ? {} : U, A = H.name;
              typeof $ == "function" && (h = $({
                state: h,
                options: _,
                name: A,
                instance: b
              }) || h);
            }
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: dN(function() {
        return new Promise(function(x) {
          b.forceUpdate(), x(h);
        });
      }),
      destroy: function() {
        T(), E = !0;
      }
    };
    if (!Yh(f, c))
      return b;
    b.setOptions(p).then(function(x) {
      !E && p.onFirstUpdate && p.onFirstUpdate(x);
    });
    function R() {
      h.orderedModifiers.forEach(function(x) {
        var I = x.name, F = x.options, P = F === void 0 ? {} : F, g = x.effect;
        if (typeof g == "function") {
          var H = g({
            state: h,
            name: I,
            instance: b,
            options: P
          }), $ = function() {
          };
          v.push(H || $);
        }
      });
    }
    function T() {
      v.forEach(function(x) {
        return x();
      }), v = [];
    }
    return b;
  };
}
var vN = [kO, nN, UO, Mg, eN, KO, oN, LO, JO], gN = /* @__PURE__ */ hN({
  defaultModifiers: vN
}), mN = "tippy-box", Bg = "tippy-content", Hg = "tippy-backdrop", Gg = "tippy-arrow", zg = "tippy-svg-arrow", Yi = {
  passive: !0,
  capture: !0
}, Wg = function() {
  return document.body;
};
function If(e, t, n) {
  if (Array.isArray(e)) {
    var o = e[t];
    return o ?? (Array.isArray(n) ? n[t] : n);
  }
  return e;
}
function Yc(e, t) {
  var n = {}.toString.call(e);
  return n.indexOf("[object") === 0 && n.indexOf(t + "]") > -1;
}
function Xg(e, t) {
  return typeof e == "function" ? e.apply(void 0, t) : e;
}
function Vh(e, t) {
  if (t === 0)
    return e;
  var n;
  return function(o) {
    clearTimeout(n), n = setTimeout(function() {
      e(o);
    }, t);
  };
}
function EN(e, t) {
  var n = Object.assign({}, e);
  return t.forEach(function(o) {
    delete n[o];
  }), n;
}
function _N(e) {
  return e.split(/\s+/).filter(Boolean);
}
function Ki(e) {
  return [].concat(e);
}
function jh(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function yN(e) {
  return e.filter(function(t, n) {
    return e.indexOf(t) === n;
  });
}
function Yg(e) {
  return e.split("-")[0];
}
function Go(e) {
  return [].slice.call(e);
}
function Kh(e) {
  return Object.keys(e).reduce(function(t, n) {
    return e[n] !== void 0 && (t[n] = e[n]), t;
  }, {});
}
function eo() {
  return document.createElement("div");
}
function Ku(e) {
  return ["Element", "Fragment"].some(function(t) {
    return Yc(e, t);
  });
}
function TN(e) {
  return Yc(e, "NodeList");
}
function Vc(e) {
  return Yc(e, "MouseEvent");
}
function AN(e) {
  return !!(e && e._tippy && e._tippy.reference === e);
}
function bN(e) {
  return Ku(e) ? [e] : TN(e) ? Go(e) : Array.isArray(e) ? e : Go(document.querySelectorAll(e));
}
function Rf(e, t) {
  e.forEach(function(n) {
    n && (n.style.transitionDuration = t + "ms");
  });
}
function Ga(e, t) {
  e.forEach(function(n) {
    n && n.setAttribute("data-state", t);
  });
}
function Vg(e) {
  var t, n = Ki(e), o = n[0];
  return o != null && (t = o.ownerDocument) != null && t.body ? o.ownerDocument : document;
}
function ON(e, t) {
  var n = t.clientX, o = t.clientY;
  return e.every(function(a) {
    var s = a.popperRect, l = a.popperState, f = a.props, c = f.interactiveBorder, p = Yg(l.placement), h = l.modifiersData.offset;
    if (!h)
      return !0;
    var v = p === "bottom" ? h.top.y : 0, E = p === "top" ? h.bottom.y : 0, b = p === "right" ? h.left.x : 0, R = p === "left" ? h.right.x : 0, T = s.top - o + v > c, x = o - s.bottom - E > c, I = s.left - n + b > c, F = n - s.right - R > c;
    return T || x || I || F;
  });
}
function wf(e, t, n) {
  var o = t + "EventListener";
  ["transitionend", "webkitTransitionEnd"].forEach(function(a) {
    e[o](a, n);
  });
}
function qh(e, t) {
  for (var n = t; n; ) {
    var o;
    if (e.contains(n))
      return !0;
    n = n.getRootNode == null || (o = n.getRootNode()) == null ? void 0 : o.host;
  }
  return !1;
}
var xr = {
  isTouch: !1
}, Jh = 0;
function NN() {
  xr.isTouch || (xr.isTouch = !0, window.performance && document.addEventListener("mousemove", jg));
}
function jg() {
  var e = performance.now();
  e - Jh < 20 && (xr.isTouch = !1, document.removeEventListener("mousemove", jg)), Jh = e;
}
function SN() {
  var e = document.activeElement;
  if (AN(e)) {
    var t = e._tippy;
    e.blur && !t.state.isVisible && e.blur();
  }
}
function IN() {
  document.addEventListener("touchstart", NN, Yi), window.addEventListener("blur", SN);
}
var RN = typeof window < "u" && typeof document < "u", wN = RN ? (
  // @ts-ignore
  !!window.msCrypto
) : !1, xN = {
  animateFill: !1,
  followCursor: !1,
  inlinePositioning: !1,
  sticky: !1
}, CN = {
  allowHTML: !1,
  animation: "fade",
  arrow: !0,
  content: "",
  inertia: !1,
  maxWidth: 350,
  role: "tooltip",
  theme: "",
  zIndex: 9999
}, mr = Object.assign({
  appendTo: Wg,
  aria: {
    content: "auto",
    expanded: "auto"
  },
  delay: 0,
  duration: [300, 250],
  getReferenceClientRect: null,
  hideOnClick: !0,
  ignoreAttributes: !1,
  interactive: !1,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  moveTransition: "",
  offset: [0, 10],
  onAfterUpdate: function() {
  },
  onBeforeUpdate: function() {
  },
  onCreate: function() {
  },
  onDestroy: function() {
  },
  onHidden: function() {
  },
  onHide: function() {
  },
  onMount: function() {
  },
  onShow: function() {
  },
  onShown: function() {
  },
  onTrigger: function() {
  },
  onUntrigger: function() {
  },
  onClickOutside: function() {
  },
  placement: "top",
  plugins: [],
  popperOptions: {},
  render: null,
  showOnCreate: !1,
  touch: !0,
  trigger: "mouseenter focus",
  triggerTarget: null
}, xN, CN), LN = Object.keys(mr), MN = function(t) {
  var n = Object.keys(t);
  n.forEach(function(o) {
    mr[o] = t[o];
  });
};
function Kg(e) {
  var t = e.plugins || [], n = t.reduce(function(o, a) {
    var s = a.name, l = a.defaultValue;
    if (s) {
      var f;
      o[s] = e[s] !== void 0 ? e[s] : (f = mr[s]) != null ? f : l;
    }
    return o;
  }, {});
  return Object.assign({}, e, n);
}
function DN(e, t) {
  var n = t ? Object.keys(Kg(Object.assign({}, mr, {
    plugins: t
  }))) : LN, o = n.reduce(function(a, s) {
    var l = (e.getAttribute("data-tippy-" + s) || "").trim();
    if (!l)
      return a;
    if (s === "content")
      a[s] = l;
    else
      try {
        a[s] = JSON.parse(l);
      } catch {
        a[s] = l;
      }
    return a;
  }, {});
  return o;
}
function Zh(e, t) {
  var n = Object.assign({}, t, {
    content: Xg(t.content, [e])
  }, t.ignoreAttributes ? {} : DN(e, t.plugins));
  return n.aria = Object.assign({}, mr.aria, n.aria), n.aria = {
    expanded: n.aria.expanded === "auto" ? t.interactive : n.aria.expanded,
    content: n.aria.content === "auto" ? t.interactive ? null : "describedby" : n.aria.content
  }, n;
}
var PN = function() {
  return "innerHTML";
};
function tc(e, t) {
  e[PN()] = t;
}
function Qh(e) {
  var t = eo();
  return e === !0 ? t.className = Gg : (t.className = zg, Ku(e) ? t.appendChild(e) : tc(t, e)), t;
}
function ev(e, t) {
  Ku(t.content) ? (tc(e, ""), e.appendChild(t.content)) : typeof t.content != "function" && (t.allowHTML ? tc(e, t.content) : e.textContent = t.content);
}
function Iu(e) {
  var t = e.firstElementChild, n = Go(t.children);
  return {
    box: t,
    content: n.find(function(o) {
      return o.classList.contains(Bg);
    }),
    arrow: n.find(function(o) {
      return o.classList.contains(Gg) || o.classList.contains(zg);
    }),
    backdrop: n.find(function(o) {
      return o.classList.contains(Hg);
    })
  };
}
function qg(e) {
  var t = eo(), n = eo();
  n.className = mN, n.setAttribute("data-state", "hidden"), n.setAttribute("tabindex", "-1");
  var o = eo();
  o.className = Bg, o.setAttribute("data-state", "hidden"), ev(o, e.props), t.appendChild(n), n.appendChild(o), a(e.props, e.props);
  function a(s, l) {
    var f = Iu(t), c = f.box, p = f.content, h = f.arrow;
    l.theme ? c.setAttribute("data-theme", l.theme) : c.removeAttribute("data-theme"), typeof l.animation == "string" ? c.setAttribute("data-animation", l.animation) : c.removeAttribute("data-animation"), l.inertia ? c.setAttribute("data-inertia", "") : c.removeAttribute("data-inertia"), c.style.maxWidth = typeof l.maxWidth == "number" ? l.maxWidth + "px" : l.maxWidth, l.role ? c.setAttribute("role", l.role) : c.removeAttribute("role"), (s.content !== l.content || s.allowHTML !== l.allowHTML) && ev(p, e.props), l.arrow ? h ? s.arrow !== l.arrow && (c.removeChild(h), c.appendChild(Qh(l.arrow))) : c.appendChild(Qh(l.arrow)) : h && c.removeChild(h);
  }
  return {
    popper: t,
    onUpdate: a
  };
}
qg.$$tippy = !0;
var UN = 1, tu = [], xf = [];
function $N(e, t) {
  var n = Zh(e, Object.assign({}, mr, Kg(Kh(t)))), o, a, s, l = !1, f = !1, c = !1, p = !1, h, v, E, b = [], R = Vh(Ye, n.interactiveDebounce), T, x = UN++, I = null, F = yN(n.plugins), P = {
    // Is the instance currently enabled?
    isEnabled: !0,
    // Is the tippy currently showing and not transitioning out?
    isVisible: !1,
    // Has the instance been destroyed?
    isDestroyed: !1,
    // Is the tippy currently mounted to the DOM?
    isMounted: !1,
    // Has the tippy finished transitioning in?
    isShown: !1
  }, g = {
    // properties
    id: x,
    reference: e,
    popper: eo(),
    popperInstance: I,
    props: n,
    state: P,
    plugins: F,
    // methods
    clearDelayTimeouts: en,
    setProps: Wt,
    setContent: jt,
    show: zr,
    hide: Wr,
    hideWithInteractivity: Xr,
    enable: Ft,
    disable: Qt,
    unmount: Yr,
    destroy: Vr
  };
  if (!n.render)
    return g;
  var H = n.render(g), $ = H.popper, U = H.onUpdate;
  $.setAttribute("data-tippy-root", ""), $.id = "tippy-" + g.id, g.popper = $, e._tippy = g, $._tippy = g;
  var _ = F.map(function(C) {
    return C.fn(g);
  }), A = e.hasAttribute("aria-expanded");
  return ie(), Ie(), se(), ue("onCreate", [g]), n.showOnCreate && Vt(), $.addEventListener("mouseenter", function() {
    g.props.interactive && g.state.isVisible && g.clearDelayTimeouts();
  }), $.addEventListener("mouseleave", function() {
    g.props.interactive && g.props.trigger.indexOf("mouseenter") >= 0 && z().addEventListener("mousemove", R);
  }), g;
  function Z() {
    var C = g.props.touch;
    return Array.isArray(C) ? C : [C, 0];
  }
  function G() {
    return Z()[0] === "hold";
  }
  function _e() {
    var C;
    return !!((C = g.props.render) != null && C.$$tippy);
  }
  function ye() {
    return T || e;
  }
  function z() {
    var C = ye().parentNode;
    return C ? Vg(C) : document;
  }
  function fe() {
    return Iu($);
  }
  function j(C) {
    return g.state.isMounted && !g.state.isVisible || xr.isTouch || h && h.type === "focus" ? 0 : If(g.props.delay, C ? 0 : 1, mr.delay);
  }
  function se(C) {
    C === void 0 && (C = !1), $.style.pointerEvents = g.props.interactive && !C ? "" : "none", $.style.zIndex = "" + g.props.zIndex;
  }
  function ue(C, ee, pe) {
    if (pe === void 0 && (pe = !0), _.forEach(function(Se) {
      Se[C] && Se[C].apply(Se, ee);
    }), pe) {
      var xe;
      (xe = g.props)[C].apply(xe, ee);
    }
  }
  function Te() {
    var C = g.props.aria;
    if (C.content) {
      var ee = "aria-" + C.content, pe = $.id, xe = Ki(g.props.triggerTarget || e);
      xe.forEach(function(Se) {
        var at = Se.getAttribute(ee);
        if (g.state.isVisible)
          Se.setAttribute(ee, at ? at + " " + pe : pe);
        else {
          var _t = at && at.replace(pe, "").trim();
          _t ? Se.setAttribute(ee, _t) : Se.removeAttribute(ee);
        }
      });
    }
  }
  function Ie() {
    if (!(A || !g.props.aria.expanded)) {
      var C = Ki(g.props.triggerTarget || e);
      C.forEach(function(ee) {
        g.props.interactive ? ee.setAttribute("aria-expanded", g.state.isVisible && ee === ye() ? "true" : "false") : ee.removeAttribute("aria-expanded");
      });
    }
  }
  function Me() {
    z().removeEventListener("mousemove", R), tu = tu.filter(function(C) {
      return C !== R;
    });
  }
  function he(C) {
    if (!(xr.isTouch && (c || C.type === "mousedown"))) {
      var ee = C.composedPath && C.composedPath()[0] || C.target;
      if (!(g.props.interactive && qh($, ee))) {
        if (Ki(g.props.triggerTarget || e).some(function(pe) {
          return qh(pe, ee);
        })) {
          if (xr.isTouch || g.state.isVisible && g.props.trigger.indexOf("click") >= 0)
            return;
        } else
          ue("onClickOutside", [g, C]);
        g.props.hideOnClick === !0 && (g.clearDelayTimeouts(), g.hide(), f = !0, setTimeout(function() {
          f = !1;
        }), g.state.isMounted || V());
      }
    }
  }
  function Ee() {
    c = !0;
  }
  function le() {
    c = !1;
  }
  function de() {
    var C = z();
    C.addEventListener("mousedown", he, !0), C.addEventListener("touchend", he, Yi), C.addEventListener("touchstart", le, Yi), C.addEventListener("touchmove", Ee, Yi);
  }
  function V() {
    var C = z();
    C.removeEventListener("mousedown", he, !0), C.removeEventListener("touchend", he, Yi), C.removeEventListener("touchstart", le, Yi), C.removeEventListener("touchmove", Ee, Yi);
  }
  function O(C, ee) {
    J(C, function() {
      !g.state.isVisible && $.parentNode && $.parentNode.contains($) && ee();
    });
  }
  function W(C, ee) {
    J(C, ee);
  }
  function J(C, ee) {
    var pe = fe().box;
    function xe(Se) {
      Se.target === pe && (wf(pe, "remove", xe), ee());
    }
    if (C === 0)
      return ee();
    wf(pe, "remove", v), wf(pe, "add", xe), v = xe;
  }
  function Q(C, ee, pe) {
    pe === void 0 && (pe = !1);
    var xe = Ki(g.props.triggerTarget || e);
    xe.forEach(function(Se) {
      Se.addEventListener(C, ee, pe), b.push({
        node: Se,
        eventType: C,
        handler: ee,
        options: pe
      });
    });
  }
  function ie() {
    G() && (Q("touchstart", Fe, {
      passive: !0
    }), Q("touchend", pt, {
      passive: !0
    })), _N(g.props.trigger).forEach(function(C) {
      if (C !== "manual")
        switch (Q(C, Fe), C) {
          case "mouseenter":
            Q("mouseleave", pt);
            break;
          case "focus":
            Q(wN ? "focusout" : "blur", zt);
            break;
          case "focusin":
            Q("focusout", zt);
            break;
        }
    });
  }
  function Ae() {
    b.forEach(function(C) {
      var ee = C.node, pe = C.eventType, xe = C.handler, Se = C.options;
      ee.removeEventListener(pe, xe, Se);
    }), b = [];
  }
  function Fe(C) {
    var ee, pe = !1;
    if (!(!g.state.isEnabled || ht(C) || f)) {
      var xe = ((ee = h) == null ? void 0 : ee.type) === "focus";
      h = C, T = C.currentTarget, Ie(), !g.state.isVisible && Vc(C) && tu.forEach(function(Se) {
        return Se(C);
      }), C.type === "click" && (g.props.trigger.indexOf("mouseenter") < 0 || l) && g.props.hideOnClick !== !1 && g.state.isVisible ? pe = !0 : Vt(C), C.type === "click" && (l = !pe), pe && !xe && Mt(C);
    }
  }
  function Ye(C) {
    var ee = C.target, pe = ye().contains(ee) || $.contains(ee);
    if (!(C.type === "mousemove" && pe)) {
      var xe = vt().concat($).map(function(Se) {
        var at, _t = Se._tippy, tn = (at = _t.popperInstance) == null ? void 0 : at.state;
        return tn ? {
          popperRect: Se.getBoundingClientRect(),
          popperState: tn,
          props: n
        } : null;
      }).filter(Boolean);
      ON(xe, C) && (Me(), Mt(C));
    }
  }
  function pt(C) {
    var ee = ht(C) || g.props.trigger.indexOf("click") >= 0 && l;
    if (!ee) {
      if (g.props.interactive) {
        g.hideWithInteractivity(C);
        return;
      }
      Mt(C);
    }
  }
  function zt(C) {
    g.props.trigger.indexOf("focusin") < 0 && C.target !== ye() || g.props.interactive && C.relatedTarget && $.contains(C.relatedTarget) || Mt(C);
  }
  function ht(C) {
    return xr.isTouch ? G() !== C.type.indexOf("touch") >= 0 : !1;
  }
  function Yt() {
    gn();
    var C = g.props, ee = C.popperOptions, pe = C.placement, xe = C.offset, Se = C.getReferenceClientRect, at = C.moveTransition, _t = _e() ? Iu($).arrow : null, tn = Se ? {
      getBoundingClientRect: Se,
      contextElement: Se.contextElement || ye()
    } : e, sr = {
      name: "$$tippy",
      enabled: !0,
      phase: "beforeWrite",
      requires: ["computeStyles"],
      fn: function(te) {
        var ve = te.state;
        if (_e()) {
          var Ge = fe(), gt = Ge.box;
          ["placement", "reference-hidden", "escaped"].forEach(function(ct) {
            ct === "placement" ? gt.setAttribute("data-placement", ve.placement) : ve.attributes.popper["data-popper-" + ct] ? gt.setAttribute("data-" + ct, "") : gt.removeAttribute("data-" + ct);
          }), ve.attributes.popper = {};
        }
      }
    }, xt = [{
      name: "offset",
      options: {
        offset: xe
      }
    }, {
      name: "preventOverflow",
      options: {
        padding: {
          top: 2,
          bottom: 2,
          left: 5,
          right: 5
        }
      }
    }, {
      name: "flip",
      options: {
        padding: 5
      }
    }, {
      name: "computeStyles",
      options: {
        adaptive: !at
      }
    }, sr];
    _e() && _t && xt.push({
      name: "arrow",
      options: {
        element: _t,
        padding: 3
      }
    }), xt.push.apply(xt, ee?.modifiers || []), g.popperInstance = gN(tn, $, Object.assign({}, ee, {
      placement: pe,
      onFirstUpdate: E,
      modifiers: xt
    }));
  }
  function gn() {
    g.popperInstance && (g.popperInstance.destroy(), g.popperInstance = null);
  }
  function At() {
    var C = g.props.appendTo, ee, pe = ye();
    g.props.interactive && C === Wg || C === "parent" ? ee = pe.parentNode : ee = Xg(C, [pe]), ee.contains($) || ee.appendChild($), g.state.isMounted = !0, Yt();
  }
  function vt() {
    return Go($.querySelectorAll("[data-tippy-root]"));
  }
  function Vt(C) {
    g.clearDelayTimeouts(), C && ue("onTrigger", [g, C]), de();
    var ee = j(!0), pe = Z(), xe = pe[0], Se = pe[1];
    xr.isTouch && xe === "hold" && Se && (ee = Se), ee ? o = setTimeout(function() {
      g.show();
    }, ee) : g.show();
  }
  function Mt(C) {
    if (g.clearDelayTimeouts(), ue("onUntrigger", [g, C]), !g.state.isVisible) {
      V();
      return;
    }
    if (!(g.props.trigger.indexOf("mouseenter") >= 0 && g.props.trigger.indexOf("click") >= 0 && ["mouseleave", "mousemove"].indexOf(C.type) >= 0 && l)) {
      var ee = j(!1);
      ee ? a = setTimeout(function() {
        g.state.isVisible && g.hide();
      }, ee) : s = requestAnimationFrame(function() {
        g.hide();
      });
    }
  }
  function Ft() {
    g.state.isEnabled = !0;
  }
  function Qt() {
    g.hide(), g.state.isEnabled = !1;
  }
  function en() {
    clearTimeout(o), clearTimeout(a), cancelAnimationFrame(s);
  }
  function Wt(C) {
    if (!g.state.isDestroyed) {
      ue("onBeforeUpdate", [g, C]), Ae();
      var ee = g.props, pe = Zh(e, Object.assign({}, ee, Kh(C), {
        ignoreAttributes: !0
      }));
      g.props = pe, ie(), ee.interactiveDebounce !== pe.interactiveDebounce && (Me(), R = Vh(Ye, pe.interactiveDebounce)), ee.triggerTarget && !pe.triggerTarget ? Ki(ee.triggerTarget).forEach(function(xe) {
        xe.removeAttribute("aria-expanded");
      }) : pe.triggerTarget && e.removeAttribute("aria-expanded"), Ie(), se(), U && U(ee, pe), g.popperInstance && (Yt(), vt().forEach(function(xe) {
        requestAnimationFrame(xe._tippy.popperInstance.forceUpdate);
      })), ue("onAfterUpdate", [g, C]);
    }
  }
  function jt(C) {
    g.setProps({
      content: C
    });
  }
  function zr() {
    var C = g.state.isVisible, ee = g.state.isDestroyed, pe = !g.state.isEnabled, xe = xr.isTouch && !g.props.touch, Se = If(g.props.duration, 0, mr.duration);
    if (!(C || ee || pe || xe) && !ye().hasAttribute("disabled") && (ue("onShow", [g], !1), g.props.onShow(g) !== !1)) {
      if (g.state.isVisible = !0, _e() && ($.style.visibility = "visible"), se(), de(), g.state.isMounted || ($.style.transition = "none"), _e()) {
        var at = fe(), _t = at.box, tn = at.content;
        Rf([_t, tn], 0);
      }
      E = function() {
        var xt;
        if (!(!g.state.isVisible || p)) {
          if (p = !0, $.offsetHeight, $.style.transition = g.props.moveTransition, _e() && g.props.animation) {
            var M = fe(), te = M.box, ve = M.content;
            Rf([te, ve], Se), Ga([te, ve], "visible");
          }
          Te(), Ie(), jh(xf, g), (xt = g.popperInstance) == null || xt.forceUpdate(), ue("onMount", [g]), g.props.animation && _e() && W(Se, function() {
            g.state.isShown = !0, ue("onShown", [g]);
          });
        }
      }, At();
    }
  }
  function Wr() {
    var C = !g.state.isVisible, ee = g.state.isDestroyed, pe = !g.state.isEnabled, xe = If(g.props.duration, 1, mr.duration);
    if (!(C || ee || pe) && (ue("onHide", [g], !1), g.props.onHide(g) !== !1)) {
      if (g.state.isVisible = !1, g.state.isShown = !1, p = !1, l = !1, _e() && ($.style.visibility = "hidden"), Me(), V(), se(!0), _e()) {
        var Se = fe(), at = Se.box, _t = Se.content;
        g.props.animation && (Rf([at, _t], xe), Ga([at, _t], "hidden"));
      }
      Te(), Ie(), g.props.animation ? _e() && O(xe, g.unmount) : g.unmount();
    }
  }
  function Xr(C) {
    z().addEventListener("mousemove", R), jh(tu, R), R(C);
  }
  function Yr() {
    g.state.isVisible && g.hide(), g.state.isMounted && (gn(), vt().forEach(function(C) {
      C._tippy.unmount();
    }), $.parentNode && $.parentNode.removeChild($), xf = xf.filter(function(C) {
      return C !== g;
    }), g.state.isMounted = !1, ue("onHidden", [g]));
  }
  function Vr() {
    g.state.isDestroyed || (g.clearDelayTimeouts(), g.unmount(), Ae(), delete e._tippy, g.state.isDestroyed = !0, ue("onDestroy", [g]));
  }
}
function ke(e, t) {
  t === void 0 && (t = {});
  var n = mr.plugins.concat(t.plugins || []);
  IN();
  var o = Object.assign({}, t, {
    plugins: n
  }), a = bN(e), s = a.reduce(function(l, f) {
    var c = f && $N(f, o);
    return c && l.push(c), l;
  }, []);
  return Ku(e) ? s[0] : s;
}
ke.defaultProps = mr;
ke.setDefaultProps = MN;
ke.currentInput = xr;
var kN = Object.assign({}, Mg, {
  effect: function(t) {
    var n = t.state, o = {
      popper: {
        position: n.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(n.elements.popper.style, o.popper), n.styles = o, n.elements.arrow && Object.assign(n.elements.arrow.style, o.arrow);
  }
}), FN = function(t, n) {
  var o;
  n === void 0 && (n = {});
  var a = t, s = [], l = [], f, c = n.overrides, p = [], h = !1;
  function v() {
    l = a.map(function(g) {
      return Ki(g.props.triggerTarget || g.reference);
    }).reduce(function(g, H) {
      return g.concat(H);
    }, []);
  }
  function E() {
    s = a.map(function(g) {
      return g.reference;
    });
  }
  function b(g) {
    a.forEach(function(H) {
      g ? H.enable() : H.disable();
    });
  }
  function R(g) {
    return a.map(function(H) {
      var $ = H.setProps;
      return H.setProps = function(U) {
        $(U), H.reference === f && g.setProps(U);
      }, function() {
        H.setProps = $;
      };
    });
  }
  function T(g, H) {
    var $ = l.indexOf(H);
    if (H !== f) {
      f = H;
      var U = (c || []).concat("content").reduce(function(_, A) {
        return _[A] = a[$].props[A], _;
      }, {});
      g.setProps(Object.assign({}, U, {
        getReferenceClientRect: typeof U.getReferenceClientRect == "function" ? U.getReferenceClientRect : function() {
          var _;
          return (_ = s[$]) == null ? void 0 : _.getBoundingClientRect();
        }
      }));
    }
  }
  b(!1), E(), v();
  var x = {
    fn: function() {
      return {
        onDestroy: function() {
          b(!0);
        },
        onHidden: function() {
          f = null;
        },
        onClickOutside: function($) {
          $.props.showOnCreate && !h && (h = !0, f = null);
        },
        onShow: function($) {
          $.props.showOnCreate && !h && (h = !0, T($, s[0]));
        },
        onTrigger: function($, U) {
          T($, U.currentTarget);
        }
      };
    }
  }, I = ke(eo(), Object.assign({}, EN(n, ["overrides"]), {
    plugins: [x].concat(n.plugins || []),
    triggerTarget: l,
    popperOptions: Object.assign({}, n.popperOptions, {
      modifiers: [].concat(((o = n.popperOptions) == null ? void 0 : o.modifiers) || [], [kN])
    })
  })), F = I.show;
  I.show = function(g) {
    if (F(), !f && g == null)
      return T(I, s[0]);
    if (!(f && g == null)) {
      if (typeof g == "number")
        return s[g] && T(I, s[g]);
      if (a.indexOf(g) >= 0) {
        var H = g.reference;
        return T(I, H);
      }
      if (s.indexOf(g) >= 0)
        return T(I, g);
    }
  }, I.showNext = function() {
    var g = s[0];
    if (!f)
      return I.show(0);
    var H = s.indexOf(f);
    I.show(s[H + 1] || g);
  }, I.showPrevious = function() {
    var g = s[s.length - 1];
    if (!f)
      return I.show(g);
    var H = s.indexOf(f), $ = s[H - 1] || g;
    I.show($);
  };
  var P = I.setProps;
  return I.setProps = function(g) {
    c = g.overrides || c, P(g);
  }, I.setInstances = function(g) {
    b(!0), p.forEach(function(H) {
      return H();
    }), a = g, b(!1), E(), v(), p = R(I), I.setProps({
      triggerTarget: l
    });
  }, p = R(I), I;
}, BN = {
  name: "animateFill",
  defaultValue: !1,
  fn: function(t) {
    var n;
    if (!((n = t.props.render) != null && n.$$tippy))
      return {};
    var o = Iu(t.popper), a = o.box, s = o.content, l = t.props.animateFill ? HN() : null;
    return {
      onCreate: function() {
        l && (a.insertBefore(l, a.firstElementChild), a.setAttribute("data-animatefill", ""), a.style.overflow = "hidden", t.setProps({
          arrow: !1,
          animation: "shift-away"
        }));
      },
      onMount: function() {
        if (l) {
          var c = a.style.transitionDuration, p = Number(c.replace("ms", ""));
          s.style.transitionDelay = Math.round(p / 10) + "ms", l.style.transitionDuration = c, Ga([l], "visible");
        }
      },
      onShow: function() {
        l && (l.style.transitionDuration = "0ms");
      },
      onHide: function() {
        l && Ga([l], "hidden");
      }
    };
  }
};
function HN() {
  var e = eo();
  return e.className = Hg, Ga([e], "hidden"), e;
}
var nc = {
  clientX: 0,
  clientY: 0
}, nu = [];
function Jg(e) {
  var t = e.clientX, n = e.clientY;
  nc = {
    clientX: t,
    clientY: n
  };
}
function GN(e) {
  e.addEventListener("mousemove", Jg);
}
function zN(e) {
  e.removeEventListener("mousemove", Jg);
}
var WN = {
  name: "followCursor",
  defaultValue: !1,
  fn: function(t) {
    var n = t.reference, o = Vg(t.props.triggerTarget || n), a = !1, s = !1, l = !0, f = t.props;
    function c() {
      return t.props.followCursor === "initial" && t.state.isVisible;
    }
    function p() {
      o.addEventListener("mousemove", E);
    }
    function h() {
      o.removeEventListener("mousemove", E);
    }
    function v() {
      a = !0, t.setProps({
        getReferenceClientRect: null
      }), a = !1;
    }
    function E(T) {
      var x = T.target ? n.contains(T.target) : !0, I = t.props.followCursor, F = T.clientX, P = T.clientY, g = n.getBoundingClientRect(), H = F - g.left, $ = P - g.top;
      (x || !t.props.interactive) && t.setProps({
        // @ts-ignore - unneeded DOMRect properties
        getReferenceClientRect: function() {
          var _ = n.getBoundingClientRect(), A = F, Z = P;
          I === "initial" && (A = _.left + H, Z = _.top + $);
          var G = I === "horizontal" ? _.top : Z, _e = I === "vertical" ? _.right : A, ye = I === "horizontal" ? _.bottom : Z, z = I === "vertical" ? _.left : A;
          return {
            width: _e - z,
            height: ye - G,
            top: G,
            right: _e,
            bottom: ye,
            left: z
          };
        }
      });
    }
    function b() {
      t.props.followCursor && (nu.push({
        instance: t,
        doc: o
      }), GN(o));
    }
    function R() {
      nu = nu.filter(function(T) {
        return T.instance !== t;
      }), nu.filter(function(T) {
        return T.doc === o;
      }).length === 0 && zN(o);
    }
    return {
      onCreate: b,
      onDestroy: R,
      onBeforeUpdate: function() {
        f = t.props;
      },
      onAfterUpdate: function(x, I) {
        var F = I.followCursor;
        a || F !== void 0 && f.followCursor !== F && (R(), F ? (b(), t.state.isMounted && !s && !c() && p()) : (h(), v()));
      },
      onMount: function() {
        t.props.followCursor && !s && (l && (E(nc), l = !1), c() || p());
      },
      onTrigger: function(x, I) {
        Vc(I) && (nc = {
          clientX: I.clientX,
          clientY: I.clientY
        }), s = I.type === "focus";
      },
      onHidden: function() {
        t.props.followCursor && (v(), h(), l = !0);
      }
    };
  }
};
function XN(e, t) {
  var n;
  return {
    popperOptions: Object.assign({}, e.popperOptions, {
      modifiers: [].concat((((n = e.popperOptions) == null ? void 0 : n.modifiers) || []).filter(function(o) {
        var a = o.name;
        return a !== t.name;
      }), [t])
    })
  };
}
var YN = {
  name: "inlinePositioning",
  defaultValue: !1,
  fn: function(t) {
    var n = t.reference;
    function o() {
      return !!t.props.inlinePositioning;
    }
    var a, s = -1, l = !1, f = [], c = {
      name: "tippyInlinePositioning",
      enabled: !0,
      phase: "afterWrite",
      fn: function(b) {
        var R = b.state;
        o() && (f.indexOf(R.placement) !== -1 && (f = []), a !== R.placement && f.indexOf(R.placement) === -1 && (f.push(R.placement), t.setProps({
          // @ts-ignore - unneeded DOMRect properties
          getReferenceClientRect: function() {
            return p(R.placement);
          }
        })), a = R.placement);
      }
    };
    function p(E) {
      return VN(Yg(E), n.getBoundingClientRect(), Go(n.getClientRects()), s);
    }
    function h(E) {
      l = !0, t.setProps(E), l = !1;
    }
    function v() {
      l || h(XN(t.props, c));
    }
    return {
      onCreate: v,
      onAfterUpdate: v,
      onTrigger: function(b, R) {
        if (Vc(R)) {
          var T = Go(t.reference.getClientRects()), x = T.find(function(F) {
            return F.left - 2 <= R.clientX && F.right + 2 >= R.clientX && F.top - 2 <= R.clientY && F.bottom + 2 >= R.clientY;
          }), I = T.indexOf(x);
          s = I > -1 ? I : s;
        }
      },
      onHidden: function() {
        s = -1;
      }
    };
  }
};
function VN(e, t, n, o) {
  if (n.length < 2 || e === null)
    return t;
  if (n.length === 2 && o >= 0 && n[0].left > n[1].right)
    return n[o] || t;
  switch (e) {
    case "top":
    case "bottom": {
      var a = n[0], s = n[n.length - 1], l = e === "top", f = a.top, c = s.bottom, p = l ? a.left : s.left, h = l ? a.right : s.right, v = h - p, E = c - f;
      return {
        top: f,
        bottom: c,
        left: p,
        right: h,
        width: v,
        height: E
      };
    }
    case "left":
    case "right": {
      var b = Math.min.apply(Math, n.map(function($) {
        return $.left;
      })), R = Math.max.apply(Math, n.map(function($) {
        return $.right;
      })), T = n.filter(function($) {
        return e === "left" ? $.left === b : $.right === R;
      }), x = T[0].top, I = T[T.length - 1].bottom, F = b, P = R, g = P - F, H = I - x;
      return {
        top: x,
        bottom: I,
        left: F,
        right: P,
        width: g,
        height: H
      };
    }
    default:
      return t;
  }
}
var jN = {
  name: "sticky",
  defaultValue: !1,
  fn: function(t) {
    var n = t.reference, o = t.popper;
    function a() {
      return t.popperInstance ? t.popperInstance.state.elements.reference : n;
    }
    function s(p) {
      return t.props.sticky === !0 || t.props.sticky === p;
    }
    var l = null, f = null;
    function c() {
      var p = s("reference") ? a().getBoundingClientRect() : null, h = s("popper") ? o.getBoundingClientRect() : null;
      (p && tv(l, p) || h && tv(f, h)) && t.popperInstance && t.popperInstance.update(), l = p, f = h, t.state.isMounted && requestAnimationFrame(c);
    }
    return {
      onMount: function() {
        t.props.sticky && c();
      }
    };
  }
};
function tv(e, t) {
  return e && t ? e.top !== t.top || e.right !== t.right || e.bottom !== t.bottom || e.left !== t.left : !0;
}
ke.setDefaultProps({
  render: qg
});
ke.setDefaultProps({
  //@ts-ignore
  onShow: (e) => {
    if (!e.props.content)
      return !1;
  }
});
const KN = (e) => e instanceof Object && "$" in e && "$el" in e;
function Zg(e, t = {}, n = { mount: !0, appName: "Tippy" }) {
  n = Object.assign({ mount: !0, appName: "Tippy" }, n);
  const o = wg(), a = qe(), s = qe({
    isEnabled: !1,
    isVisible: !1,
    isDestroyed: !1,
    isMounted: !1,
    isShown: !1
  }), l = eO();
  let f = null;
  const c = () => f || (f = document.createDocumentFragment(), f), p = (U) => {
    let _, A = bi(U) ? U.value : U;
    return nO(A) ? (l.value || (l.value = Qf({
      name: n.appName,
      setup: () => () => bi(U) ? U.value : U
    }), o && Object.assign(l.value._context, o.appContext), l.value.mount(c())), _ = () => c()) : typeof A == "object" ? (l.value || (l.value = Qf({
      name: n.appName,
      setup: () => () => oi(bi(U) ? U.value : U)
    }), o && Object.assign(l.value._context, o.appContext), l.value.mount(c())), _ = () => c()) : _ = A, _;
  }, h = (U) => {
    let _ = {};
    return bi(U) ? _ = U.value || {} : Dh(U) ? _ = { ...U } : _ = { ...U }, _.content && (_.content = p(_.content)), _.triggerTarget && (_.triggerTarget = bi(_.triggerTarget) ? _.triggerTarget.value : _.triggerTarget), (!_.plugins || !Array.isArray(_.plugins)) && (_.plugins = []), _.plugins = _.plugins.filter((A) => A.name !== "vueTippyReactiveState"), _.plugins.push({
      name: "vueTippyReactiveState",
      fn: () => ({
        onCreate() {
          s.value.isEnabled = !0;
        },
        onMount() {
          s.value.isMounted = !0;
        },
        onShow() {
          s.value.isMounted = !0, s.value.isVisible = !0;
        },
        onShown() {
          s.value.isShown = !0;
        },
        onHide() {
          s.value.isMounted = !1, s.value.isVisible = !1;
        },
        onHidden() {
          s.value.isShown = !1;
        },
        onUnmounted() {
          s.value.isMounted = !1;
        },
        onDestroy() {
          s.value.isDestroyed = !0;
        }
      })
    }), _;
  }, v = () => {
    a.value && a.value.setProps(h(t));
  }, E = () => {
    !a.value || !t.content || a.value.setContent(p(t.content));
  }, b = (U) => {
    var _;
    (_ = a.value) === null || _ === void 0 || _.setContent(p(U));
  }, R = (U) => {
    var _;
    (_ = a.value) === null || _ === void 0 || _.setProps(h(U));
  }, T = () => {
    var U;
    a.value && (a.value.destroy(), a.value = void 0), f = null, (U = l.value) === null || U === void 0 || U.unmount(), l.value = void 0;
  }, x = () => {
    var U;
    (U = a.value) === null || U === void 0 || U.show();
  }, I = () => {
    var U;
    (U = a.value) === null || U === void 0 || U.hide();
  }, F = () => {
    var U;
    (U = a.value) === null || U === void 0 || U.disable(), s.value.isEnabled = !1;
  }, P = () => {
    var U;
    (U = a.value) === null || U === void 0 || U.enable(), s.value.isEnabled = !0;
  }, g = () => {
    var U;
    (U = a.value) === null || U === void 0 || U.unmount();
  }, H = () => {
    if (!e)
      return;
    let U = bi(e) ? e.value : e;
    typeof U == "function" && (U = U()), KN(U) && (U = U.$el), U && (a.value = ke(U, h(t)), U.$tippy = $);
  }, $ = {
    tippy: a,
    refresh: v,
    refreshContent: E,
    setContent: b,
    setProps: R,
    destroy: T,
    hide: I,
    show: x,
    disable: F,
    enable: P,
    unmount: g,
    mount: H,
    state: s
  };
  return n.mount && (o ? o.isMounted ? H() : ci(H) : H()), o && tO(() => {
    T();
  }), bi(t) || Dh(t) ? Zt(t, v, { immediate: !1 }) : bi(t.content) && Zt(t.content, E, { immediate: !1 }), $;
}
function qN(e, t) {
  const n = qe();
  return ci(() => {
    const a = (Array.isArray(e) ? e.map((s) => s.value) : typeof e == "function" ? e() : e.value).map((s) => s instanceof Element ? s._tippy : s).filter(Boolean);
    n.value = FN(a, t ? { allowHTML: !0, ...t } : { allowHTML: !0 });
  }), {
    singleton: n
  };
}
function JN(e) {
  return typeof e == "function" ? e() : S(e);
}
function ZN(e) {
  var t, n;
  const o = JN(e);
  return (n = (t = o) === null || t === void 0 ? void 0 : t.$el) !== null && n !== void 0 ? n : o;
}
Lt({
  props: {
    to: {
      type: [String, Function]
    },
    tag: {
      type: [String, Object],
      default: "span"
    },
    contentTag: {
      type: [String, Object],
      default: "span"
    },
    contentClass: {
      type: String,
      default: null
    },
    appendTo: { default: () => ke.defaultProps.appendTo },
    aria: { default: () => ke.defaultProps.aria },
    delay: { default: () => ke.defaultProps.delay },
    duration: { default: () => ke.defaultProps.duration },
    getReferenceClientRect: { default: () => ke.defaultProps.getReferenceClientRect },
    hideOnClick: { type: [Boolean, String], default: () => ke.defaultProps.hideOnClick },
    ignoreAttributes: { type: Boolean, default: () => ke.defaultProps.ignoreAttributes },
    interactive: { type: Boolean, default: () => ke.defaultProps.interactive },
    interactiveBorder: { default: () => ke.defaultProps.interactiveBorder },
    interactiveDebounce: { default: () => ke.defaultProps.interactiveDebounce },
    moveTransition: { default: () => ke.defaultProps.moveTransition },
    offset: { default: () => ke.defaultProps.offset },
    onAfterUpdate: { default: () => ke.defaultProps.onAfterUpdate },
    onBeforeUpdate: { default: () => ke.defaultProps.onBeforeUpdate },
    onCreate: { default: () => ke.defaultProps.onCreate },
    onDestroy: { default: () => ke.defaultProps.onDestroy },
    onHidden: { default: () => ke.defaultProps.onHidden },
    onHide: { default: () => ke.defaultProps.onHide },
    onMount: { default: () => ke.defaultProps.onMount },
    onShow: { default: () => ke.defaultProps.onShow },
    onShown: { default: () => ke.defaultProps.onShown },
    onTrigger: { default: () => ke.defaultProps.onTrigger },
    onUntrigger: { default: () => ke.defaultProps.onUntrigger },
    onClickOutside: { default: () => ke.defaultProps.onClickOutside },
    placement: { default: () => ke.defaultProps.placement },
    plugins: { default: () => ke.defaultProps.plugins },
    popperOptions: { default: () => ke.defaultProps.popperOptions },
    render: { default: () => ke.defaultProps.render },
    showOnCreate: { type: Boolean, default: () => ke.defaultProps.showOnCreate },
    touch: { type: [Boolean, String, Array], default: () => ke.defaultProps.touch },
    trigger: { default: () => ke.defaultProps.trigger },
    triggerTarget: { default: () => ke.defaultProps.triggerTarget },
    animateFill: { type: Boolean, default: () => ke.defaultProps.animateFill },
    followCursor: { type: [Boolean, String], default: () => ke.defaultProps.followCursor },
    inlinePositioning: { type: Boolean, default: () => ke.defaultProps.inlinePositioning },
    sticky: { type: [Boolean, String], default: () => ke.defaultProps.sticky },
    allowHTML: { type: Boolean, default: () => ke.defaultProps.allowHTML },
    animation: { default: () => ke.defaultProps.animation },
    arrow: { default: () => ke.defaultProps.arrow },
    content: { default: () => ke.defaultProps.content },
    inertia: { default: () => ke.defaultProps.inertia },
    maxWidth: { default: () => ke.defaultProps.maxWidth },
    role: { default: () => ke.defaultProps.role },
    theme: { default: () => ke.defaultProps.theme },
    zIndex: { default: () => ke.defaultProps.zIndex }
  },
  emits: ["state"],
  setup(e, { slots: t, emit: n, expose: o }) {
    const a = qe(), s = qe(), l = qe(), f = qe(!1), c = () => {
      let b = { ...e };
      for (const R of ["to", "tag", "contentTag", "contentClass"])
        b.hasOwnProperty(R) && delete b[R];
      return b;
    };
    let p = () => ZN(a);
    e.to && (typeof Element < "u" && e.to instanceof Element ? p = () => e.to : e.to === "parent" ? p = () => {
      let b = a.value;
      return b || (b = a.value = s.value.parentElement), b;
    } : (typeof e.to == "string" || e.to instanceof String) && (p = () => document.querySelector(e.to)));
    const h = Zg(p, c());
    let v = t.content;
    !v && e.to === "parent" && (v = t.default), ci(() => {
      f.value = !0, Oi(() => {
        v && h.setContent(() => l.value);
      });
    }), Zt(h.state, () => {
      n("state", S(h.state));
    }, { immediate: !0, deep: !0 }), Zt(() => e, () => {
      h.setProps(c()), v && h.setContent(() => l.value);
    }, { deep: !0 });
    let E = Tr({
      elem: a,
      contentElem: l,
      mounted: f,
      ...h
    });
    return o(E), () => {
      const b = (typeof e.contentTag == "string", e.contentTag), R = v ? oi(b, {
        ref: l,
        style: { display: f.value ? "inherit" : "none" },
        class: e.contentClass
      }, v(E)) : null;
      if (e.to === "parent") {
        const I = [];
        if (!a.value) {
          const F = oi("span", {
            ref: s,
            "data-v-tippy": "",
            style: { display: "none" }
          });
          I.push(F);
        }
        return R && I.push(R), I;
      }
      const T = t.default ? t.default(E) : [];
      if (!e.tag) {
        const I = oi(T[0], {
          ref: a,
          "data-v-tippy": ""
        });
        return R ? [I, R] : I;
      }
      const x = (typeof e.tag == "string", e.tag);
      return oi(x, { ref: a, "data-v-tippy": "" }, R ? [T, R] : T);
    };
  }
});
const QN = [
  "a11y",
  "allowHTML",
  "arrow",
  "flip",
  "flipOnUpdate",
  "hideOnClick",
  "ignoreAttributes",
  "inertia",
  "interactive",
  "lazy",
  "multiple",
  "showOnInit",
  "touch",
  "touchHold"
];
let rc = {};
Object.keys(ke.defaultProps).forEach((e) => {
  QN.includes(e) ? rc[e] = {
    type: Boolean,
    default: function() {
      return ke.defaultProps[e];
    }
  } : rc[e] = {
    default: function() {
      return ke.defaultProps[e];
    }
  };
});
Lt({
  props: rc,
  setup(e) {
    const t = qe([]), { singleton: n } = qN(t, e);
    return { instances: t, singleton: n };
  },
  mounted() {
    var e;
    const n = this.$el.parentElement.querySelectorAll("[data-v-tippy]");
    this.instances = Array.from(n).map((o) => o._tippy).filter(Boolean), (e = this.singleton) === null || e === void 0 || e.setInstances(this.instances);
  },
  render() {
    let e = this.$slots.default ? this.$slots.default() : [];
    return oi(() => e);
  }
});
const Hn = {
  mounted(e, t, n) {
    const o = typeof t.value == "string" ? { content: t.value } : t.value || {}, a = Object.keys(t.modifiers || {}), s = a.find((f) => f !== "arrow"), l = a.findIndex((f) => f === "arrow") !== -1;
    s && (o.placement = o.placement || s), l && (o.arrow = o.arrow !== void 0 ? o.arrow : !0), n.props && n.props.onTippyShow && (o.onShow = function(...f) {
      var c;
      return (c = n.props) === null || c === void 0 ? void 0 : c.onTippyShow(...f);
    }), n.props && n.props.onTippyShown && (o.onShown = function(...f) {
      var c;
      return (c = n.props) === null || c === void 0 ? void 0 : c.onTippyShown(...f);
    }), n.props && n.props.onTippyHidden && (o.onHidden = function(...f) {
      var c;
      return (c = n.props) === null || c === void 0 ? void 0 : c.onTippyHidden(...f);
    }), n.props && n.props.onTippyHide && (o.onHide = function(...f) {
      var c;
      return (c = n.props) === null || c === void 0 ? void 0 : c.onTippyHide(...f);
    }), n.props && n.props.onTippyMount && (o.onMount = function(...f) {
      var c;
      return (c = n.props) === null || c === void 0 ? void 0 : c.onTippyMount(...f);
    }), e.getAttribute("title") && !o.content && (o.content = e.getAttribute("title"), e.removeAttribute("title")), e.getAttribute("content") && !o.content && (o.content = e.getAttribute("content")), Zg(e, o);
  },
  unmounted(e) {
    e.$tippy ? e.$tippy.destroy() : e._tippy && e._tippy.destroy();
  },
  updated(e, t) {
    const n = typeof t.value == "string" ? { content: t.value } : t.value || {};
    n.content || (n.content = null), e.getAttribute("title") && !n.content && (n.content = e.getAttribute("title"), e.removeAttribute("title")), e.getAttribute("content") && !n.content && (n.content = e.getAttribute("content")), e.$tippy ? e.$tippy.setProps(n || {}) : e._tippy && e._tippy.setProps(n || {});
  }
}, eS = ke.setDefaultProps;
eS({
  ignoreAttributes: !0,
  plugins: [jN, YN, WN, BN]
});
/*!
 * Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2025 Fonticons, Inc.
 */
function ic(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function tS(e) {
  if (Array.isArray(e)) return e;
}
function nS(e) {
  if (Array.isArray(e)) return ic(e);
}
function rS(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function iS(e, t) {
  for (var n = 0; n < t.length; n++) {
    var o = t[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, Qg(o.key), o);
  }
}
function oS(e, t, n) {
  return t && iS(e.prototype, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function gu(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = jc(e)) || t) {
      n && (e = n);
      var o = 0, a = function() {
      };
      return {
        s: a,
        n: function() {
          return o >= e.length ? {
            done: !0
          } : {
            done: !1,
            value: e[o++]
          };
        },
        e: function(c) {
          throw c;
        },
        f: a
      };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s, l = !0, f = !1;
  return {
    s: function() {
      n = n.call(e);
    },
    n: function() {
      var c = n.next();
      return l = c.done, c;
    },
    e: function(c) {
      f = !0, s = c;
    },
    f: function() {
      try {
        l || n.return == null || n.return();
      } finally {
        if (f) throw s;
      }
    }
  };
}
function lt(e, t, n) {
  return (t = Qg(t)) in e ? Object.defineProperty(e, t, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = n, e;
}
function aS(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function sS(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, a, s, l, f = [], c = !0, p = !1;
    try {
      if (s = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        c = !1;
      } else for (; !(c = (o = s.call(n)).done) && (f.push(o.value), f.length !== t); c = !0) ;
    } catch (h) {
      p = !0, a = h;
    } finally {
      try {
        if (!c && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (p) throw a;
      }
    }
    return f;
  }
}
function uS() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function lS() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nv(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function me(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? nv(Object(n), !0).forEach(function(o) {
      lt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : nv(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function qu(e, t) {
  return tS(e) || sS(e, t) || jc(e, t) || uS();
}
function Ar(e) {
  return nS(e) || aS(e) || jc(e) || lS();
}
function fS(e, t) {
  if (typeof e != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (typeof o != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Qg(e) {
  var t = fS(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function Ru(e) {
  "@babel/helpers - typeof";
  return Ru = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ru(e);
}
function jc(e, t) {
  if (e) {
    if (typeof e == "string") return ic(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ic(e, t) : void 0;
  }
}
var rv = function() {
}, Kc = {}, em = {}, tm = null, nm = {
  mark: rv,
  measure: rv
};
try {
  typeof window < "u" && (Kc = window), typeof document < "u" && (em = document), typeof MutationObserver < "u" && (tm = MutationObserver), typeof performance < "u" && (nm = performance);
} catch {
}
var cS = Kc.navigator || {}, iv = cS.userAgent, ov = iv === void 0 ? "" : iv, Ni = Kc, wt = em, av = tm, ru = nm;
Ni.document;
var di = !!wt.documentElement && !!wt.head && typeof wt.addEventListener == "function" && typeof wt.createElement == "function", rm = ~ov.indexOf("MSIE") || ~ov.indexOf("Trident/"), Cf, dS = /fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|jr|jfr|jdr|cr|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/, pS = /Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Slab Press|Slab|Whiteboard)?.*/i, im = {
  classic: {
    fa: "solid",
    fas: "solid",
    "fa-solid": "solid",
    far: "regular",
    "fa-regular": "regular",
    fal: "light",
    "fa-light": "light",
    fat: "thin",
    "fa-thin": "thin",
    fab: "brands",
    "fa-brands": "brands"
  },
  duotone: {
    fa: "solid",
    fad: "solid",
    "fa-solid": "solid",
    "fa-duotone": "solid",
    fadr: "regular",
    "fa-regular": "regular",
    fadl: "light",
    "fa-light": "light",
    fadt: "thin",
    "fa-thin": "thin"
  },
  sharp: {
    fa: "solid",
    fass: "solid",
    "fa-solid": "solid",
    fasr: "regular",
    "fa-regular": "regular",
    fasl: "light",
    "fa-light": "light",
    fast: "thin",
    "fa-thin": "thin"
  },
  "sharp-duotone": {
    fa: "solid",
    fasds: "solid",
    "fa-solid": "solid",
    fasdr: "regular",
    "fa-regular": "regular",
    fasdl: "light",
    "fa-light": "light",
    fasdt: "thin",
    "fa-thin": "thin"
  },
  slab: {
    "fa-regular": "regular",
    faslr: "regular"
  },
  "slab-press": {
    "fa-regular": "regular",
    faslpr: "regular"
  },
  thumbprint: {
    "fa-light": "light",
    fatl: "light"
  },
  whiteboard: {
    "fa-semibold": "semibold",
    fawsb: "semibold"
  },
  notdog: {
    "fa-solid": "solid",
    fans: "solid"
  },
  "notdog-duo": {
    "fa-solid": "solid",
    fands: "solid"
  },
  etch: {
    "fa-solid": "solid",
    faes: "solid"
  },
  jelly: {
    "fa-regular": "regular",
    fajr: "regular"
  },
  "jelly-fill": {
    "fa-regular": "regular",
    fajfr: "regular"
  },
  "jelly-duo": {
    "fa-regular": "regular",
    fajdr: "regular"
  },
  chisel: {
    "fa-regular": "regular",
    facr: "regular"
  }
}, hS = {
  GROUP: "duotone-group",
  PRIMARY: "primary",
  SECONDARY: "secondary"
}, om = ["fa-classic", "fa-duotone", "fa-sharp", "fa-sharp-duotone", "fa-thumbprint", "fa-whiteboard", "fa-notdog", "fa-notdog-duo", "fa-chisel", "fa-etch", "fa-jelly", "fa-jelly-fill", "fa-jelly-duo", "fa-slab", "fa-slab-press"], vn = "classic", Ja = "duotone", am = "sharp", sm = "sharp-duotone", um = "chisel", lm = "etch", fm = "jelly", cm = "jelly-duo", dm = "jelly-fill", pm = "notdog", hm = "notdog-duo", vm = "slab", gm = "slab-press", mm = "thumbprint", Em = "whiteboard", vS = "Classic", gS = "Duotone", mS = "Sharp", ES = "Sharp Duotone", _S = "Chisel", yS = "Etch", TS = "Jelly", AS = "Jelly Duo", bS = "Jelly Fill", OS = "Notdog", NS = "Notdog Duo", SS = "Slab", IS = "Slab Press", RS = "Thumbprint", wS = "Whiteboard", _m = [vn, Ja, am, sm, um, lm, fm, cm, dm, pm, hm, vm, gm, mm, Em];
Cf = {}, lt(lt(lt(lt(lt(lt(lt(lt(lt(lt(Cf, vn, vS), Ja, gS), am, mS), sm, ES), um, _S), lm, yS), fm, TS), cm, AS), dm, bS), pm, OS), lt(lt(lt(lt(lt(Cf, hm, NS), vm, SS), gm, IS), mm, RS), Em, wS);
var xS = {
  classic: {
    900: "fas",
    400: "far",
    normal: "far",
    300: "fal",
    100: "fat"
  },
  duotone: {
    900: "fad",
    400: "fadr",
    300: "fadl",
    100: "fadt"
  },
  sharp: {
    900: "fass",
    400: "fasr",
    300: "fasl",
    100: "fast"
  },
  "sharp-duotone": {
    900: "fasds",
    400: "fasdr",
    300: "fasdl",
    100: "fasdt"
  },
  slab: {
    400: "faslr"
  },
  "slab-press": {
    400: "faslpr"
  },
  whiteboard: {
    600: "fawsb"
  },
  thumbprint: {
    300: "fatl"
  },
  notdog: {
    900: "fans"
  },
  "notdog-duo": {
    900: "fands"
  },
  etch: {
    900: "faes"
  },
  chisel: {
    400: "facr"
  },
  jelly: {
    400: "fajr"
  },
  "jelly-fill": {
    400: "fajfr"
  },
  "jelly-duo": {
    400: "fajdr"
  }
}, CS = {
  "Font Awesome 7 Free": {
    900: "fas",
    400: "far"
  },
  "Font Awesome 7 Pro": {
    900: "fas",
    400: "far",
    normal: "far",
    300: "fal",
    100: "fat"
  },
  "Font Awesome 7 Brands": {
    400: "fab",
    normal: "fab"
  },
  "Font Awesome 7 Duotone": {
    900: "fad",
    400: "fadr",
    normal: "fadr",
    300: "fadl",
    100: "fadt"
  },
  "Font Awesome 7 Sharp": {
    900: "fass",
    400: "fasr",
    normal: "fasr",
    300: "fasl",
    100: "fast"
  },
  "Font Awesome 7 Sharp Duotone": {
    900: "fasds",
    400: "fasdr",
    normal: "fasdr",
    300: "fasdl",
    100: "fasdt"
  },
  "Font Awesome 7 Jelly": {
    400: "fajr",
    normal: "fajr"
  },
  "Font Awesome 7 Jelly Fill": {
    400: "fajfr",
    normal: "fajfr"
  },
  "Font Awesome 7 Jelly Duo": {
    400: "fajdr",
    normal: "fajdr"
  },
  "Font Awesome 7 Slab": {
    400: "faslr",
    normal: "faslr"
  },
  "Font Awesome 7 Slab Press": {
    400: "faslpr",
    normal: "faslpr"
  },
  "Font Awesome 7 Thumbprint": {
    300: "fatl",
    normal: "fatl"
  },
  "Font Awesome 7 Notdog": {
    900: "fans",
    normal: "fans"
  },
  "Font Awesome 7 Notdog Duo": {
    900: "fands",
    normal: "fands"
  },
  "Font Awesome 7 Etch": {
    900: "faes",
    normal: "faes"
  },
  "Font Awesome 7 Chisel": {
    400: "facr",
    normal: "facr"
  },
  "Font Awesome 7 Whiteboard": {
    600: "fawsb",
    normal: "fawsb"
  }
}, LS = /* @__PURE__ */ new Map([["classic", {
  defaultShortPrefixId: "fas",
  defaultStyleId: "solid",
  styleIds: ["solid", "regular", "light", "thin", "brands"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["duotone", {
  defaultShortPrefixId: "fad",
  defaultStyleId: "solid",
  styleIds: ["solid", "regular", "light", "thin"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["sharp", {
  defaultShortPrefixId: "fass",
  defaultStyleId: "solid",
  styleIds: ["solid", "regular", "light", "thin"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["sharp-duotone", {
  defaultShortPrefixId: "fasds",
  defaultStyleId: "solid",
  styleIds: ["solid", "regular", "light", "thin"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["chisel", {
  defaultShortPrefixId: "facr",
  defaultStyleId: "regular",
  styleIds: ["regular"],
  futureStyleIds: [],
  defaultFontWeight: 400
}], ["etch", {
  defaultShortPrefixId: "faes",
  defaultStyleId: "solid",
  styleIds: ["solid"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["jelly", {
  defaultShortPrefixId: "fajr",
  defaultStyleId: "regular",
  styleIds: ["regular"],
  futureStyleIds: [],
  defaultFontWeight: 400
}], ["jelly-duo", {
  defaultShortPrefixId: "fajdr",
  defaultStyleId: "regular",
  styleIds: ["regular"],
  futureStyleIds: [],
  defaultFontWeight: 400
}], ["jelly-fill", {
  defaultShortPrefixId: "fajfr",
  defaultStyleId: "regular",
  styleIds: ["regular"],
  futureStyleIds: [],
  defaultFontWeight: 400
}], ["notdog", {
  defaultShortPrefixId: "fans",
  defaultStyleId: "solid",
  styleIds: ["solid"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["notdog-duo", {
  defaultShortPrefixId: "fands",
  defaultStyleId: "solid",
  styleIds: ["solid"],
  futureStyleIds: [],
  defaultFontWeight: 900
}], ["slab", {
  defaultShortPrefixId: "faslr",
  defaultStyleId: "regular",
  styleIds: ["regular"],
  futureStyleIds: [],
  defaultFontWeight: 400
}], ["slab-press", {
  defaultShortPrefixId: "faslpr",
  defaultStyleId: "regular",
  styleIds: ["regular"],
  futureStyleIds: [],
  defaultFontWeight: 400
}], ["thumbprint", {
  defaultShortPrefixId: "fatl",
  defaultStyleId: "light",
  styleIds: ["light"],
  futureStyleIds: [],
  defaultFontWeight: 300
}], ["whiteboard", {
  defaultShortPrefixId: "fawsb",
  defaultStyleId: "semibold",
  styleIds: ["semibold"],
  futureStyleIds: [],
  defaultFontWeight: 600
}]]), MS = {
  chisel: {
    regular: "facr"
  },
  classic: {
    brands: "fab",
    light: "fal",
    regular: "far",
    solid: "fas",
    thin: "fat"
  },
  duotone: {
    light: "fadl",
    regular: "fadr",
    solid: "fad",
    thin: "fadt"
  },
  etch: {
    solid: "faes"
  },
  jelly: {
    regular: "fajr"
  },
  "jelly-duo": {
    regular: "fajdr"
  },
  "jelly-fill": {
    regular: "fajfr"
  },
  notdog: {
    solid: "fans"
  },
  "notdog-duo": {
    solid: "fands"
  },
  sharp: {
    light: "fasl",
    regular: "fasr",
    solid: "fass",
    thin: "fast"
  },
  "sharp-duotone": {
    light: "fasdl",
    regular: "fasdr",
    solid: "fasds",
    thin: "fasdt"
  },
  slab: {
    regular: "faslr"
  },
  "slab-press": {
    regular: "faslpr"
  },
  thumbprint: {
    light: "fatl"
  },
  whiteboard: {
    semibold: "fawsb"
  }
}, ym = ["fak", "fa-kit", "fakd", "fa-kit-duotone"], sv = {
  kit: {
    fak: "kit",
    "fa-kit": "kit"
  },
  "kit-duotone": {
    fakd: "kit-duotone",
    "fa-kit-duotone": "kit-duotone"
  }
}, DS = ["kit"], PS = "kit", US = "kit-duotone", $S = "Kit", kS = "Kit Duotone";
lt(lt({}, PS, $S), US, kS);
var FS = {
  kit: {
    "fa-kit": "fak"
  }
}, BS = {
  "Font Awesome Kit": {
    400: "fak",
    normal: "fak"
  },
  "Font Awesome Kit Duotone": {
    400: "fakd",
    normal: "fakd"
  }
}, HS = {
  kit: {
    fak: "fa-kit"
  }
}, uv = {
  kit: {
    kit: "fak"
  },
  "kit-duotone": {
    "kit-duotone": "fakd"
  }
}, Lf, iu = {
  GROUP: "duotone-group",
  SWAP_OPACITY: "swap-opacity",
  PRIMARY: "primary",
  SECONDARY: "secondary"
}, GS = ["fa-classic", "fa-duotone", "fa-sharp", "fa-sharp-duotone", "fa-thumbprint", "fa-whiteboard", "fa-notdog", "fa-notdog-duo", "fa-chisel", "fa-etch", "fa-jelly", "fa-jelly-fill", "fa-jelly-duo", "fa-slab", "fa-slab-press"], zS = "classic", WS = "duotone", XS = "sharp", YS = "sharp-duotone", VS = "chisel", jS = "etch", KS = "jelly", qS = "jelly-duo", JS = "jelly-fill", ZS = "notdog", QS = "notdog-duo", eI = "slab", tI = "slab-press", nI = "thumbprint", rI = "whiteboard", iI = "Classic", oI = "Duotone", aI = "Sharp", sI = "Sharp Duotone", uI = "Chisel", lI = "Etch", fI = "Jelly", cI = "Jelly Duo", dI = "Jelly Fill", pI = "Notdog", hI = "Notdog Duo", vI = "Slab", gI = "Slab Press", mI = "Thumbprint", EI = "Whiteboard";
Lf = {}, lt(lt(lt(lt(lt(lt(lt(lt(lt(lt(Lf, zS, iI), WS, oI), XS, aI), YS, sI), VS, uI), jS, lI), KS, fI), qS, cI), JS, dI), ZS, pI), lt(lt(lt(lt(lt(Lf, QS, hI), eI, vI), tI, gI), nI, mI), rI, EI);
var _I = "kit", yI = "kit-duotone", TI = "Kit", AI = "Kit Duotone";
lt(lt({}, _I, TI), yI, AI);
var bI = {
  classic: {
    "fa-brands": "fab",
    "fa-duotone": "fad",
    "fa-light": "fal",
    "fa-regular": "far",
    "fa-solid": "fas",
    "fa-thin": "fat"
  },
  duotone: {
    "fa-regular": "fadr",
    "fa-light": "fadl",
    "fa-thin": "fadt"
  },
  sharp: {
    "fa-solid": "fass",
    "fa-regular": "fasr",
    "fa-light": "fasl",
    "fa-thin": "fast"
  },
  "sharp-duotone": {
    "fa-solid": "fasds",
    "fa-regular": "fasdr",
    "fa-light": "fasdl",
    "fa-thin": "fasdt"
  },
  slab: {
    "fa-regular": "faslr"
  },
  "slab-press": {
    "fa-regular": "faslpr"
  },
  whiteboard: {
    "fa-semibold": "fawsb"
  },
  thumbprint: {
    "fa-light": "fatl"
  },
  notdog: {
    "fa-solid": "fans"
  },
  "notdog-duo": {
    "fa-solid": "fands"
  },
  etch: {
    "fa-solid": "faes"
  },
  jelly: {
    "fa-regular": "fajr"
  },
  "jelly-fill": {
    "fa-regular": "fajfr"
  },
  "jelly-duo": {
    "fa-regular": "fajdr"
  },
  chisel: {
    "fa-regular": "facr"
  }
}, OI = {
  classic: ["fas", "far", "fal", "fat", "fad"],
  duotone: ["fadr", "fadl", "fadt"],
  sharp: ["fass", "fasr", "fasl", "fast"],
  "sharp-duotone": ["fasds", "fasdr", "fasdl", "fasdt"],
  slab: ["faslr"],
  "slab-press": ["faslpr"],
  whiteboard: ["fawsb"],
  thumbprint: ["fatl"],
  notdog: ["fans"],
  "notdog-duo": ["fands"],
  etch: ["faes"],
  jelly: ["fajr"],
  "jelly-fill": ["fajfr"],
  "jelly-duo": ["fajdr"],
  chisel: ["facr"]
}, oc = {
  classic: {
    fab: "fa-brands",
    fad: "fa-duotone",
    fal: "fa-light",
    far: "fa-regular",
    fas: "fa-solid",
    fat: "fa-thin"
  },
  duotone: {
    fadr: "fa-regular",
    fadl: "fa-light",
    fadt: "fa-thin"
  },
  sharp: {
    fass: "fa-solid",
    fasr: "fa-regular",
    fasl: "fa-light",
    fast: "fa-thin"
  },
  "sharp-duotone": {
    fasds: "fa-solid",
    fasdr: "fa-regular",
    fasdl: "fa-light",
    fasdt: "fa-thin"
  },
  slab: {
    faslr: "fa-regular"
  },
  "slab-press": {
    faslpr: "fa-regular"
  },
  whiteboard: {
    fawsb: "fa-semibold"
  },
  thumbprint: {
    fatl: "fa-light"
  },
  notdog: {
    fans: "fa-solid"
  },
  "notdog-duo": {
    fands: "fa-solid"
  },
  etch: {
    faes: "fa-solid"
  },
  jelly: {
    fajr: "fa-regular"
  },
  "jelly-fill": {
    fajfr: "fa-regular"
  },
  "jelly-duo": {
    fajdr: "fa-regular"
  },
  chisel: {
    facr: "fa-regular"
  }
}, NI = ["fa-solid", "fa-regular", "fa-light", "fa-thin", "fa-duotone", "fa-brands", "fa-semibold"], Tm = ["fa", "fas", "far", "fal", "fat", "fad", "fadr", "fadl", "fadt", "fab", "fass", "fasr", "fasl", "fast", "fasds", "fasdr", "fasdl", "fasdt", "faslr", "faslpr", "fawsb", "fatl", "fans", "fands", "faes", "fajr", "fajfr", "fajdr", "facr"].concat(GS, NI), SI = ["solid", "regular", "light", "thin", "duotone", "brands", "semibold"], Am = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], II = Am.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]), RI = ["aw", "fw", "pull-left", "pull-right"], wI = [].concat(Ar(Object.keys(OI)), SI, RI, ["2xs", "xs", "sm", "lg", "xl", "2xl", "beat", "border", "fade", "beat-fade", "bounce", "flip-both", "flip-horizontal", "flip-vertical", "flip", "inverse", "layers", "layers-bottom-left", "layers-bottom-right", "layers-counter", "layers-text", "layers-top-left", "layers-top-right", "li", "pull-end", "pull-start", "pulse", "rotate-180", "rotate-270", "rotate-90", "rotate-by", "shake", "spin-pulse", "spin-reverse", "spin", "stack-1x", "stack-2x", "stack", "ul", "width-auto", "width-fixed", iu.GROUP, iu.SWAP_OPACITY, iu.PRIMARY, iu.SECONDARY]).concat(Am.map(function(e) {
  return "".concat(e, "x");
})).concat(II.map(function(e) {
  return "w-".concat(e);
})), xI = {
  "Font Awesome 5 Free": {
    900: "fas",
    400: "far"
  },
  "Font Awesome 5 Pro": {
    900: "fas",
    400: "far",
    normal: "far",
    300: "fal"
  },
  "Font Awesome 5 Brands": {
    400: "fab",
    normal: "fab"
  },
  "Font Awesome 5 Duotone": {
    900: "fad"
  }
}, si = "___FONT_AWESOME___", ac = 16, bm = "fa", Om = "svg-inline--fa", io = "data-fa-i2svg", sc = "data-fa-pseudo-element", CI = "data-fa-pseudo-element-pending", qc = "data-prefix", Jc = "data-icon", lv = "fontawesome-i2svg", LI = "async", MI = ["HTML", "HEAD", "STYLE", "SCRIPT"], Nm = ["::before", "::after", ":before", ":after"], Sm = function() {
  try {
    return !0;
  } catch {
    return !1;
  }
}();
function Za(e) {
  return new Proxy(e, {
    get: function(n, o) {
      return o in n ? n[o] : n[vn];
    }
  });
}
var Im = me({}, im);
Im[vn] = me(me(me(me({}, {
  "fa-duotone": "duotone"
}), im[vn]), sv.kit), sv["kit-duotone"]);
var DI = Za(Im), uc = me({}, MS);
uc[vn] = me(me(me(me({}, {
  duotone: "fad"
}), uc[vn]), uv.kit), uv["kit-duotone"]);
var fv = Za(uc), lc = me({}, oc);
lc[vn] = me(me({}, lc[vn]), HS.kit);
var Rm = Za(lc), fc = me({}, bI);
fc[vn] = me(me({}, fc[vn]), FS.kit);
Za(fc);
var PI = dS, wm = "fa-layers-text", UI = pS, $I = me({}, xS);
Za($I);
var kI = ["class", "data-prefix", "data-icon", "data-fa-transform", "data-fa-mask"], Mf = hS, FI = [].concat(Ar(DS), Ar(wI)), Da = Ni.FontAwesomeConfig || {};
function BI(e) {
  var t = wt.querySelector("script[" + e + "]");
  if (t)
    return t.getAttribute(e);
}
function HI(e) {
  return e === "" ? !0 : e === "false" ? !1 : e === "true" ? !0 : e;
}
if (wt && typeof wt.querySelector == "function") {
  var GI = [["data-family-prefix", "familyPrefix"], ["data-css-prefix", "cssPrefix"], ["data-family-default", "familyDefault"], ["data-style-default", "styleDefault"], ["data-replacement-class", "replacementClass"], ["data-auto-replace-svg", "autoReplaceSvg"], ["data-auto-add-css", "autoAddCss"], ["data-search-pseudo-elements", "searchPseudoElements"], ["data-search-pseudo-elements-warnings", "searchPseudoElementsWarnings"], ["data-search-pseudo-elements-full-scan", "searchPseudoElementsFullScan"], ["data-observe-mutations", "observeMutations"], ["data-mutate-approach", "mutateApproach"], ["data-keep-original-source", "keepOriginalSource"], ["data-measure-performance", "measurePerformance"], ["data-show-missing-icons", "showMissingIcons"]];
  GI.forEach(function(e) {
    var t = qu(e, 2), n = t[0], o = t[1], a = HI(BI(n));
    a != null && (Da[o] = a);
  });
}
var xm = {
  styleDefault: "solid",
  familyDefault: vn,
  cssPrefix: bm,
  replacementClass: Om,
  autoReplaceSvg: !0,
  autoAddCss: !0,
  searchPseudoElements: !1,
  searchPseudoElementsWarnings: !0,
  searchPseudoElementsFullScan: !1,
  observeMutations: !0,
  mutateApproach: "async",
  keepOriginalSource: !0,
  measurePerformance: !1,
  showMissingIcons: !0
};
Da.familyPrefix && (Da.cssPrefix = Da.familyPrefix);
var zo = me(me({}, xm), Da);
zo.autoReplaceSvg || (zo.observeMutations = !1);
var Be = {};
Object.keys(xm).forEach(function(e) {
  Object.defineProperty(Be, e, {
    enumerable: !0,
    set: function(n) {
      zo[e] = n, Pa.forEach(function(o) {
        return o(Be);
      });
    },
    get: function() {
      return zo[e];
    }
  });
});
Object.defineProperty(Be, "familyPrefix", {
  enumerable: !0,
  set: function(t) {
    zo.cssPrefix = t, Pa.forEach(function(n) {
      return n(Be);
    });
  },
  get: function() {
    return zo.cssPrefix;
  }
});
Ni.FontAwesomeConfig = Be;
var Pa = [];
function zI(e) {
  return Pa.push(e), function() {
    Pa.splice(Pa.indexOf(e), 1);
  };
}
var wo = ac, Mr = {
  size: 16,
  x: 0,
  y: 0,
  rotate: 0,
  flipX: !1,
  flipY: !1
};
function WI(e) {
  if (!(!e || !di)) {
    var t = wt.createElement("style");
    t.setAttribute("type", "text/css"), t.innerHTML = e;
    for (var n = wt.head.childNodes, o = null, a = n.length - 1; a > -1; a--) {
      var s = n[a], l = (s.tagName || "").toUpperCase();
      ["STYLE", "LINK"].indexOf(l) > -1 && (o = s);
    }
    return wt.head.insertBefore(t, o), e;
  }
}
var XI = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function cv() {
  for (var e = 12, t = ""; e-- > 0; )
    t += XI[Math.random() * 62 | 0];
  return t;
}
function Zo(e) {
  for (var t = [], n = (e || []).length >>> 0; n--; )
    t[n] = e[n];
  return t;
}
function Zc(e) {
  return e.classList ? Zo(e.classList) : (e.getAttribute("class") || "").split(" ").filter(function(t) {
    return t;
  });
}
function Cm(e) {
  return "".concat(e).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function YI(e) {
  return Object.keys(e || {}).reduce(function(t, n) {
    return t + "".concat(n, '="').concat(Cm(e[n]), '" ');
  }, "").trim();
}
function Ju(e) {
  return Object.keys(e || {}).reduce(function(t, n) {
    return t + "".concat(n, ": ").concat(e[n].trim(), ";");
  }, "");
}
function Qc(e) {
  return e.size !== Mr.size || e.x !== Mr.x || e.y !== Mr.y || e.rotate !== Mr.rotate || e.flipX || e.flipY;
}
function VI(e) {
  var t = e.transform, n = e.containerWidth, o = e.iconWidth, a = {
    transform: "translate(".concat(n / 2, " 256)")
  }, s = "translate(".concat(t.x * 32, ", ").concat(t.y * 32, ") "), l = "scale(".concat(t.size / 16 * (t.flipX ? -1 : 1), ", ").concat(t.size / 16 * (t.flipY ? -1 : 1), ") "), f = "rotate(".concat(t.rotate, " 0 0)"), c = {
    transform: "".concat(s, " ").concat(l, " ").concat(f)
  }, p = {
    transform: "translate(".concat(o / 2 * -1, " -256)")
  };
  return {
    outer: a,
    inner: c,
    path: p
  };
}
function jI(e) {
  var t = e.transform, n = e.width, o = n === void 0 ? ac : n, a = e.height, s = a === void 0 ? ac : a, l = "";
  return rm ? l += "translate(".concat(t.x / wo - o / 2, "em, ").concat(t.y / wo - s / 2, "em) ") : l += "translate(calc(-50% + ".concat(t.x / wo, "em), calc(-50% + ").concat(t.y / wo, "em)) "), l += "scale(".concat(t.size / wo * (t.flipX ? -1 : 1), ", ").concat(t.size / wo * (t.flipY ? -1 : 1), ") "), l += "rotate(".concat(t.rotate, "deg) "), l;
}
var KI = `:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 7 Free";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 7 Free";
  --fa-font-light: normal 300 1em/1 "Font Awesome 7 Pro";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 7 Pro";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-regular: normal 400 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-light: normal 300 1em/1 "Font Awesome 7 Duotone";
  --fa-font-duotone-thin: normal 100 1em/1 "Font Awesome 7 Duotone";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 7 Brands";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 7 Sharp";
  --fa-font-sharp-duotone-solid: normal 900 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-regular: normal 400 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-light: normal 300 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-sharp-duotone-thin: normal 100 1em/1 "Font Awesome 7 Sharp Duotone";
  --fa-font-slab-regular: normal 400 1em/1 "Font Awesome 7 Slab";
  --fa-font-slab-press-regular: normal 400 1em/1 "Font Awesome 7 Slab Press";
  --fa-font-whiteboard-semibold: normal 600 1em/1 "Font Awesome 7 Whiteboard";
  --fa-font-thumbprint-light: normal 300 1em/1 "Font Awesome 7 Thumbprint";
  --fa-font-notdog-solid: normal 900 1em/1 "Font Awesome 7 Notdog";
  --fa-font-notdog-duo-solid: normal 900 1em/1 "Font Awesome 7 Notdog Duo";
  --fa-font-etch-solid: normal 900 1em/1 "Font Awesome 7 Etch";
  --fa-font-jelly-regular: normal 400 1em/1 "Font Awesome 7 Jelly";
  --fa-font-jelly-fill-regular: normal 400 1em/1 "Font Awesome 7 Jelly Fill";
  --fa-font-jelly-duo-regular: normal 400 1em/1 "Font Awesome 7 Jelly Duo";
  --fa-font-chisel-regular: normal 400 1em/1 "Font Awesome 7 Chisel";
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}`;
function Lm() {
  var e = bm, t = Om, n = Be.cssPrefix, o = Be.replacementClass, a = KI;
  if (n !== e || o !== t) {
    var s = new RegExp("\\.".concat(e, "\\-"), "g"), l = new RegExp("\\--".concat(e, "\\-"), "g"), f = new RegExp("\\.".concat(t), "g");
    a = a.replace(s, ".".concat(n, "-")).replace(l, "--".concat(n, "-")).replace(f, ".".concat(o));
  }
  return a;
}
var dv = !1;
function Df() {
  Be.autoAddCss && !dv && (WI(Lm()), dv = !0);
}
var qI = {
  mixout: function() {
    return {
      dom: {
        css: Lm,
        insertCss: Df
      }
    };
  },
  hooks: function() {
    return {
      beforeDOMElementCreation: function() {
        Df();
      },
      beforeI2svg: function() {
        Df();
      }
    };
  }
}, ui = Ni || {};
ui[si] || (ui[si] = {});
ui[si].styles || (ui[si].styles = {});
ui[si].hooks || (ui[si].hooks = {});
ui[si].shims || (ui[si].shims = []);
var Er = ui[si], Mm = [], Dm = function() {
  wt.removeEventListener("DOMContentLoaded", Dm), wu = 1, Mm.map(function(t) {
    return t();
  });
}, wu = !1;
di && (wu = (wt.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(wt.readyState), wu || wt.addEventListener("DOMContentLoaded", Dm));
function JI(e) {
  di && (wu ? setTimeout(e, 0) : Mm.push(e));
}
function Qa(e) {
  var t = e.tag, n = e.attributes, o = n === void 0 ? {} : n, a = e.children, s = a === void 0 ? [] : a;
  return typeof e == "string" ? Cm(e) : "<".concat(t, " ").concat(YI(o), ">").concat(s.map(Qa).join(""), "</").concat(t, ">");
}
function pv(e, t, n) {
  if (e && e[t] && e[t][n])
    return {
      prefix: t,
      iconName: n,
      icon: e[t][n]
    };
}
var Pf = function(t, n, o, a) {
  var s = Object.keys(t), l = s.length, f = n, c, p, h;
  for (o === void 0 ? (c = 1, h = t[s[0]]) : (c = 0, h = o); c < l; c++)
    p = s[c], h = f(h, t[p], p, t);
  return h;
};
function Pm(e) {
  return Ar(e).length !== 1 ? null : e.codePointAt(0).toString(16);
}
function hv(e) {
  return Object.keys(e).reduce(function(t, n) {
    var o = e[n], a = !!o.icon;
    return a ? t[o.iconName] = o.icon : t[n] = o, t;
  }, {});
}
function Um(e, t) {
  var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = n.skipHooks, a = o === void 0 ? !1 : o, s = hv(t);
  typeof Er.hooks.addPack == "function" && !a ? Er.hooks.addPack(e, hv(t)) : Er.styles[e] = me(me({}, Er.styles[e] || {}), s), e === "fas" && Um("fa", t);
}
var za = Er.styles, ZI = Er.shims, $m = Object.keys(Rm), QI = $m.reduce(function(e, t) {
  return e[t] = Object.keys(Rm[t]), e;
}, {}), ed = null, km = {}, Fm = {}, Bm = {}, Hm = {}, Gm = {};
function eR(e) {
  return ~FI.indexOf(e);
}
function tR(e, t) {
  var n = t.split("-"), o = n[0], a = n.slice(1).join("-");
  return o === e && a !== "" && !eR(a) ? a : null;
}
var zm = function() {
  var t = function(s) {
    return Pf(za, function(l, f, c) {
      return l[c] = Pf(f, s, {}), l;
    }, {});
  };
  km = t(function(a, s, l) {
    if (s[3] && (a[s[3]] = l), s[2]) {
      var f = s[2].filter(function(c) {
        return typeof c == "number";
      });
      f.forEach(function(c) {
        a[c.toString(16)] = l;
      });
    }
    return a;
  }), Fm = t(function(a, s, l) {
    if (a[l] = l, s[2]) {
      var f = s[2].filter(function(c) {
        return typeof c == "string";
      });
      f.forEach(function(c) {
        a[c] = l;
      });
    }
    return a;
  }), Gm = t(function(a, s, l) {
    var f = s[2];
    return a[l] = l, f.forEach(function(c) {
      a[c] = l;
    }), a;
  });
  var n = "far" in za || Be.autoFetchSvg, o = Pf(ZI, function(a, s) {
    var l = s[0], f = s[1], c = s[2];
    return f === "far" && !n && (f = "fas"), typeof l == "string" && (a.names[l] = {
      prefix: f,
      iconName: c
    }), typeof l == "number" && (a.unicodes[l.toString(16)] = {
      prefix: f,
      iconName: c
    }), a;
  }, {
    names: {},
    unicodes: {}
  });
  Bm = o.names, Hm = o.unicodes, ed = Zu(Be.styleDefault, {
    family: Be.familyDefault
  });
};
zI(function(e) {
  ed = Zu(e.styleDefault, {
    family: Be.familyDefault
  });
});
zm();
function td(e, t) {
  return (km[e] || {})[t];
}
function nR(e, t) {
  return (Fm[e] || {})[t];
}
function Ji(e, t) {
  return (Gm[e] || {})[t];
}
function Wm(e) {
  return Bm[e] || {
    prefix: null,
    iconName: null
  };
}
function rR(e) {
  var t = Hm[e], n = td("fas", e);
  return t || (n ? {
    prefix: "fas",
    iconName: n
  } : null) || {
    prefix: null,
    iconName: null
  };
}
function Si() {
  return ed;
}
var Xm = function() {
  return {
    prefix: null,
    iconName: null,
    rest: []
  };
};
function iR(e) {
  var t = vn, n = $m.reduce(function(o, a) {
    return o[a] = "".concat(Be.cssPrefix, "-").concat(a), o;
  }, {});
  return _m.forEach(function(o) {
    (e.includes(n[o]) || e.some(function(a) {
      return QI[o].includes(a);
    })) && (t = o);
  }), t;
}
function Zu(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = t.family, o = n === void 0 ? vn : n, a = DI[o][e];
  if (o === Ja && !e)
    return "fad";
  var s = fv[o][e] || fv[o][a], l = e in Er.styles ? e : null, f = s || l || null;
  return f;
}
function oR(e) {
  var t = [], n = null;
  return e.forEach(function(o) {
    var a = tR(Be.cssPrefix, o);
    a ? n = a : o && t.push(o);
  }), {
    iconName: n,
    rest: t
  };
}
function vv(e) {
  return e.sort().filter(function(t, n, o) {
    return o.indexOf(t) === n;
  });
}
var gv = Tm.concat(ym);
function Qu(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = t.skipLookups, o = n === void 0 ? !1 : n, a = null, s = vv(e.filter(function(b) {
    return gv.includes(b);
  })), l = vv(e.filter(function(b) {
    return !gv.includes(b);
  })), f = s.filter(function(b) {
    return a = b, !om.includes(b);
  }), c = qu(f, 1), p = c[0], h = p === void 0 ? null : p, v = iR(s), E = me(me({}, oR(l)), {}, {
    prefix: Zu(h, {
      family: v
    })
  });
  return me(me(me({}, E), lR({
    values: e,
    family: v,
    styles: za,
    config: Be,
    canonical: E,
    givenPrefix: a
  })), aR(o, a, E));
}
function aR(e, t, n) {
  var o = n.prefix, a = n.iconName;
  if (e || !o || !a)
    return {
      prefix: o,
      iconName: a
    };
  var s = t === "fa" ? Wm(a) : {}, l = Ji(o, a);
  return a = s.iconName || l || a, o = s.prefix || o, o === "far" && !za.far && za.fas && !Be.autoFetchSvg && (o = "fas"), {
    prefix: o,
    iconName: a
  };
}
var sR = _m.filter(function(e) {
  return e !== vn || e !== Ja;
}), uR = Object.keys(oc).filter(function(e) {
  return e !== vn;
}).map(function(e) {
  return Object.keys(oc[e]);
}).flat();
function lR(e) {
  var t = e.values, n = e.family, o = e.canonical, a = e.givenPrefix, s = a === void 0 ? "" : a, l = e.styles, f = l === void 0 ? {} : l, c = e.config, p = c === void 0 ? {} : c, h = n === Ja, v = t.includes("fa-duotone") || t.includes("fad"), E = p.familyDefault === "duotone", b = o.prefix === "fad" || o.prefix === "fa-duotone";
  if (!h && (v || E || b) && (o.prefix = "fad"), (t.includes("fa-brands") || t.includes("fab")) && (o.prefix = "fab"), !o.prefix && sR.includes(n)) {
    var R = Object.keys(f).find(function(x) {
      return uR.includes(x);
    });
    if (R || p.autoFetchSvg) {
      var T = LS.get(n).defaultShortPrefixId;
      o.prefix = T, o.iconName = Ji(o.prefix, o.iconName) || o.iconName;
    }
  }
  return (o.prefix === "fa" || s === "fa") && (o.prefix = Si() || "fas"), o;
}
var fR = /* @__PURE__ */ function() {
  function e() {
    rS(this, e), this.definitions = {};
  }
  return oS(e, [{
    key: "add",
    value: function() {
      for (var n = this, o = arguments.length, a = new Array(o), s = 0; s < o; s++)
        a[s] = arguments[s];
      var l = a.reduce(this._pullDefinitions, {});
      Object.keys(l).forEach(function(f) {
        n.definitions[f] = me(me({}, n.definitions[f] || {}), l[f]), Um(f, l[f]), zm();
      });
    }
  }, {
    key: "reset",
    value: function() {
      this.definitions = {};
    }
  }, {
    key: "_pullDefinitions",
    value: function(n, o) {
      var a = o.prefix && o.iconName && o.icon ? {
        0: o
      } : o;
      return Object.keys(a).map(function(s) {
        var l = a[s], f = l.prefix, c = l.iconName, p = l.icon, h = p[2];
        n[f] || (n[f] = {}), h.length > 0 && h.forEach(function(v) {
          typeof v == "string" && (n[f][v] = p);
        }), n[f][c] = p;
      }), n;
    }
  }]);
}(), mv = [], Co = {}, Do = {}, cR = Object.keys(Do);
function dR(e, t) {
  var n = t.mixoutsTo;
  return mv = e, Co = {}, Object.keys(Do).forEach(function(o) {
    cR.indexOf(o) === -1 && delete Do[o];
  }), mv.forEach(function(o) {
    var a = o.mixout ? o.mixout() : {};
    if (Object.keys(a).forEach(function(l) {
      typeof a[l] == "function" && (n[l] = a[l]), Ru(a[l]) === "object" && Object.keys(a[l]).forEach(function(f) {
        n[l] || (n[l] = {}), n[l][f] = a[l][f];
      });
    }), o.hooks) {
      var s = o.hooks();
      Object.keys(s).forEach(function(l) {
        Co[l] || (Co[l] = []), Co[l].push(s[l]);
      });
    }
    o.provides && o.provides(Do);
  }), n;
}
function cc(e, t) {
  for (var n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
    o[a - 2] = arguments[a];
  var s = Co[e] || [];
  return s.forEach(function(l) {
    t = l.apply(null, [t].concat(o));
  }), t;
}
function oo(e) {
  for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++)
    n[o - 1] = arguments[o];
  var a = Co[e] || [];
  a.forEach(function(s) {
    s.apply(null, n);
  });
}
function Ii() {
  var e = arguments[0], t = Array.prototype.slice.call(arguments, 1);
  return Do[e] ? Do[e].apply(null, t) : void 0;
}
function dc(e) {
  e.prefix === "fa" && (e.prefix = "fas");
  var t = e.iconName, n = e.prefix || Si();
  if (t)
    return t = Ji(n, t) || t, pv(Ym.definitions, n, t) || pv(Er.styles, n, t);
}
var Ym = new fR(), pR = function() {
  Be.autoReplaceSvg = !1, Be.observeMutations = !1, oo("noAuto");
}, hR = {
  i2svg: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return di ? (oo("beforeI2svg", t), Ii("pseudoElements2svg", t), Ii("i2svg", t)) : Promise.reject(new Error("Operation requires a DOM of some kind."));
  },
  watch: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = t.autoReplaceSvgRoot;
    Be.autoReplaceSvg === !1 && (Be.autoReplaceSvg = !0), Be.observeMutations = !0, JI(function() {
      gR({
        autoReplaceSvgRoot: n
      }), oo("watch", t);
    });
  }
}, vR = {
  icon: function(t) {
    if (t === null)
      return null;
    if (Ru(t) === "object" && t.prefix && t.iconName)
      return {
        prefix: t.prefix,
        iconName: Ji(t.prefix, t.iconName) || t.iconName
      };
    if (Array.isArray(t) && t.length === 2) {
      var n = t[1].indexOf("fa-") === 0 ? t[1].slice(3) : t[1], o = Zu(t[0]);
      return {
        prefix: o,
        iconName: Ji(o, n) || n
      };
    }
    if (typeof t == "string" && (t.indexOf("".concat(Be.cssPrefix, "-")) > -1 || t.match(PI))) {
      var a = Qu(t.split(" "), {
        skipLookups: !0
      });
      return {
        prefix: a.prefix || Si(),
        iconName: Ji(a.prefix, a.iconName) || a.iconName
      };
    }
    if (typeof t == "string") {
      var s = Si();
      return {
        prefix: s,
        iconName: Ji(s, t) || t
      };
    }
  }
}, Wn = {
  noAuto: pR,
  config: Be,
  dom: hR,
  parse: vR,
  library: Ym,
  findIconDefinition: dc,
  toHtml: Qa
}, gR = function() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = t.autoReplaceSvgRoot, o = n === void 0 ? wt : n;
  (Object.keys(Er.styles).length > 0 || Be.autoFetchSvg) && di && Be.autoReplaceSvg && Wn.dom.i2svg({
    node: o
  });
};
function el(e, t) {
  return Object.defineProperty(e, "abstract", {
    get: t
  }), Object.defineProperty(e, "html", {
    get: function() {
      return e.abstract.map(function(o) {
        return Qa(o);
      });
    }
  }), Object.defineProperty(e, "node", {
    get: function() {
      if (di) {
        var o = wt.createElement("div");
        return o.innerHTML = e.html, o.children;
      }
    }
  }), e;
}
function mR(e) {
  var t = e.children, n = e.main, o = e.mask, a = e.attributes, s = e.styles, l = e.transform;
  if (Qc(l) && n.found && !o.found) {
    var f = n.width, c = n.height, p = {
      x: f / c / 2,
      y: 0.5
    };
    a.style = Ju(me(me({}, s), {}, {
      "transform-origin": "".concat(p.x + l.x / 16, "em ").concat(p.y + l.y / 16, "em")
    }));
  }
  return [{
    tag: "svg",
    attributes: a,
    children: t
  }];
}
function ER(e) {
  var t = e.prefix, n = e.iconName, o = e.children, a = e.attributes, s = e.symbol, l = s === !0 ? "".concat(t, "-").concat(Be.cssPrefix, "-").concat(n) : s;
  return [{
    tag: "svg",
    attributes: {
      style: "display: none;"
    },
    children: [{
      tag: "symbol",
      attributes: me(me({}, a), {}, {
        id: l
      }),
      children: o
    }]
  }];
}
function _R(e) {
  var t = ["aria-label", "aria-labelledby", "title", "role"];
  return t.some(function(n) {
    return n in e;
  });
}
function nd(e) {
  var t = e.icons, n = t.main, o = t.mask, a = e.prefix, s = e.iconName, l = e.transform, f = e.symbol, c = e.maskId, p = e.extra, h = e.watchable, v = h === void 0 ? !1 : h, E = o.found ? o : n, b = E.width, R = E.height, T = [Be.replacementClass, s ? "".concat(Be.cssPrefix, "-").concat(s) : ""].filter(function(H) {
    return p.classes.indexOf(H) === -1;
  }).filter(function(H) {
    return H !== "" || !!H;
  }).concat(p.classes).join(" "), x = {
    children: [],
    attributes: me(me({}, p.attributes), {}, {
      "data-prefix": a,
      "data-icon": s,
      class: T,
      role: p.attributes.role || "img",
      viewBox: "0 0 ".concat(b, " ").concat(R)
    })
  };
  !_R(p.attributes) && !p.attributes["aria-hidden"] && (x.attributes["aria-hidden"] = "true"), v && (x.attributes[io] = "");
  var I = me(me({}, x), {}, {
    prefix: a,
    iconName: s,
    main: n,
    mask: o,
    maskId: c,
    transform: l,
    symbol: f,
    styles: me({}, p.styles)
  }), F = o.found && n.found ? Ii("generateAbstractMask", I) || {
    children: [],
    attributes: {}
  } : Ii("generateAbstractIcon", I) || {
    children: [],
    attributes: {}
  }, P = F.children, g = F.attributes;
  return I.children = P, I.attributes = g, f ? ER(I) : mR(I);
}
function Ev(e) {
  var t = e.content, n = e.width, o = e.height, a = e.transform, s = e.extra, l = e.watchable, f = l === void 0 ? !1 : l, c = me(me({}, s.attributes), {}, {
    class: s.classes.join(" ")
  });
  f && (c[io] = "");
  var p = me({}, s.styles);
  Qc(a) && (p.transform = jI({
    transform: a,
    width: n,
    height: o
  }), p["-webkit-transform"] = p.transform);
  var h = Ju(p);
  h.length > 0 && (c.style = h);
  var v = [];
  return v.push({
    tag: "span",
    attributes: c,
    children: [t]
  }), v;
}
function yR(e) {
  var t = e.content, n = e.extra, o = me(me({}, n.attributes), {}, {
    class: n.classes.join(" ")
  }), a = Ju(n.styles);
  a.length > 0 && (o.style = a);
  var s = [];
  return s.push({
    tag: "span",
    attributes: o,
    children: [t]
  }), s;
}
var Uf = Er.styles;
function pc(e) {
  var t = e[0], n = e[1], o = e.slice(4), a = qu(o, 1), s = a[0], l = null;
  return Array.isArray(s) ? l = {
    tag: "g",
    attributes: {
      class: "".concat(Be.cssPrefix, "-").concat(Mf.GROUP)
    },
    children: [{
      tag: "path",
      attributes: {
        class: "".concat(Be.cssPrefix, "-").concat(Mf.SECONDARY),
        fill: "currentColor",
        d: s[0]
      }
    }, {
      tag: "path",
      attributes: {
        class: "".concat(Be.cssPrefix, "-").concat(Mf.PRIMARY),
        fill: "currentColor",
        d: s[1]
      }
    }]
  } : l = {
    tag: "path",
    attributes: {
      fill: "currentColor",
      d: s
    }
  }, {
    found: !0,
    width: t,
    height: n,
    icon: l
  };
}
var TR = {
  found: !1,
  width: 512,
  height: 512
};
function AR(e, t) {
  !Sm && !Be.showMissingIcons && e && console.error('Icon with name "'.concat(e, '" and prefix "').concat(t, '" is missing.'));
}
function hc(e, t) {
  var n = t;
  return t === "fa" && Be.styleDefault !== null && (t = Si()), new Promise(function(o, a) {
    if (n === "fa") {
      var s = Wm(e) || {};
      e = s.iconName || e, t = s.prefix || t;
    }
    if (e && t && Uf[t] && Uf[t][e]) {
      var l = Uf[t][e];
      return o(pc(l));
    }
    AR(e, t), o(me(me({}, TR), {}, {
      icon: Be.showMissingIcons && e ? Ii("missingIconAbstract") || {} : {}
    }));
  });
}
var _v = function() {
}, vc = Be.measurePerformance && ru && ru.mark && ru.measure ? ru : {
  mark: _v,
  measure: _v
}, Ra = 'FA "7.0.0"', bR = function(t) {
  return vc.mark("".concat(Ra, " ").concat(t, " begins")), function() {
    return Vm(t);
  };
}, Vm = function(t) {
  vc.mark("".concat(Ra, " ").concat(t, " ends")), vc.measure("".concat(Ra, " ").concat(t), "".concat(Ra, " ").concat(t, " begins"), "".concat(Ra, " ").concat(t, " ends"));
}, rd = {
  begin: bR,
  end: Vm
}, mu = function() {
};
function yv(e) {
  var t = e.getAttribute ? e.getAttribute(io) : null;
  return typeof t == "string";
}
function OR(e) {
  var t = e.getAttribute ? e.getAttribute(qc) : null, n = e.getAttribute ? e.getAttribute(Jc) : null;
  return t && n;
}
function NR(e) {
  return e && e.classList && e.classList.contains && e.classList.contains(Be.replacementClass);
}
function SR() {
  if (Be.autoReplaceSvg === !0)
    return Eu.replace;
  var e = Eu[Be.autoReplaceSvg];
  return e || Eu.replace;
}
function IR(e) {
  return wt.createElementNS("http://www.w3.org/2000/svg", e);
}
function RR(e) {
  return wt.createElement(e);
}
function jm(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = t.ceFn, o = n === void 0 ? e.tag === "svg" ? IR : RR : n;
  if (typeof e == "string")
    return wt.createTextNode(e);
  var a = o(e.tag);
  Object.keys(e.attributes || []).forEach(function(l) {
    a.setAttribute(l, e.attributes[l]);
  });
  var s = e.children || [];
  return s.forEach(function(l) {
    a.appendChild(jm(l, {
      ceFn: o
    }));
  }), a;
}
function wR(e) {
  var t = " ".concat(e.outerHTML, " ");
  return t = "".concat(t, "Font Awesome fontawesome.com "), t;
}
var Eu = {
  replace: function(t) {
    var n = t[0];
    if (n.parentNode)
      if (t[1].forEach(function(a) {
        n.parentNode.insertBefore(jm(a), n);
      }), n.getAttribute(io) === null && Be.keepOriginalSource) {
        var o = wt.createComment(wR(n));
        n.parentNode.replaceChild(o, n);
      } else
        n.remove();
  },
  nest: function(t) {
    var n = t[0], o = t[1];
    if (~Zc(n).indexOf(Be.replacementClass))
      return Eu.replace(t);
    var a = new RegExp("".concat(Be.cssPrefix, "-.*"));
    if (delete o[0].attributes.id, o[0].attributes.class) {
      var s = o[0].attributes.class.split(" ").reduce(function(f, c) {
        return c === Be.replacementClass || c.match(a) ? f.toSvg.push(c) : f.toNode.push(c), f;
      }, {
        toNode: [],
        toSvg: []
      });
      o[0].attributes.class = s.toSvg.join(" "), s.toNode.length === 0 ? n.removeAttribute("class") : n.setAttribute("class", s.toNode.join(" "));
    }
    var l = o.map(function(f) {
      return Qa(f);
    }).join(`
`);
    n.setAttribute(io, ""), n.innerHTML = l;
  }
};
function Tv(e) {
  e();
}
function Km(e, t) {
  var n = typeof t == "function" ? t : mu;
  if (e.length === 0)
    n();
  else {
    var o = Tv;
    Be.mutateApproach === LI && (o = Ni.requestAnimationFrame || Tv), o(function() {
      var a = SR(), s = rd.begin("mutate");
      e.map(a), s(), n();
    });
  }
}
var id = !1;
function qm() {
  id = !0;
}
function gc() {
  id = !1;
}
var xu = null;
function Av(e) {
  if (av && Be.observeMutations) {
    var t = e.treeCallback, n = t === void 0 ? mu : t, o = e.nodeCallback, a = o === void 0 ? mu : o, s = e.pseudoElementsCallback, l = s === void 0 ? mu : s, f = e.observeMutationsRoot, c = f === void 0 ? wt : f;
    xu = new av(function(p) {
      if (!id) {
        var h = Si();
        Zo(p).forEach(function(v) {
          if (v.type === "childList" && v.addedNodes.length > 0 && !yv(v.addedNodes[0]) && (Be.searchPseudoElements && l(v.target), n(v.target)), v.type === "attributes" && v.target.parentNode && Be.searchPseudoElements && l([v.target], !0), v.type === "attributes" && yv(v.target) && ~kI.indexOf(v.attributeName))
            if (v.attributeName === "class" && OR(v.target)) {
              var E = Qu(Zc(v.target)), b = E.prefix, R = E.iconName;
              v.target.setAttribute(qc, b || h), R && v.target.setAttribute(Jc, R);
            } else NR(v.target) && a(v.target);
        });
      }
    }), di && xu.observe(c, {
      childList: !0,
      attributes: !0,
      characterData: !0,
      subtree: !0
    });
  }
}
function xR() {
  xu && xu.disconnect();
}
function CR(e) {
  var t = e.getAttribute("style"), n = [];
  return t && (n = t.split(";").reduce(function(o, a) {
    var s = a.split(":"), l = s[0], f = s.slice(1);
    return l && f.length > 0 && (o[l] = f.join(":").trim()), o;
  }, {})), n;
}
function LR(e) {
  var t = e.getAttribute("data-prefix"), n = e.getAttribute("data-icon"), o = e.innerText !== void 0 ? e.innerText.trim() : "", a = Qu(Zc(e));
  return a.prefix || (a.prefix = Si()), t && n && (a.prefix = t, a.iconName = n), a.iconName && a.prefix || (a.prefix && o.length > 0 && (a.iconName = nR(a.prefix, e.innerText) || td(a.prefix, Pm(e.innerText))), !a.iconName && Be.autoFetchSvg && e.firstChild && e.firstChild.nodeType === Node.TEXT_NODE && (a.iconName = e.firstChild.data)), a;
}
function MR(e) {
  var t = Zo(e.attributes).reduce(function(n, o) {
    return n.name !== "class" && n.name !== "style" && (n[o.name] = o.value), n;
  }, {});
  return t;
}
function DR() {
  return {
    iconName: null,
    prefix: null,
    transform: Mr,
    symbol: !1,
    mask: {
      iconName: null,
      prefix: null,
      rest: []
    },
    maskId: null,
    extra: {
      classes: [],
      styles: {},
      attributes: {}
    }
  };
}
function bv(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
    styleParser: !0
  }, n = LR(e), o = n.iconName, a = n.prefix, s = n.rest, l = MR(e), f = cc("parseNodeAttributes", {}, e), c = t.styleParser ? CR(e) : [];
  return me({
    iconName: o,
    prefix: a,
    transform: Mr,
    mask: {
      iconName: null,
      prefix: null,
      rest: []
    },
    maskId: null,
    symbol: !1,
    extra: {
      classes: s,
      styles: c,
      attributes: l
    }
  }, f);
}
var PR = Er.styles;
function Jm(e) {
  var t = Be.autoReplaceSvg === "nest" ? bv(e, {
    styleParser: !1
  }) : bv(e);
  return ~t.extra.classes.indexOf(wm) ? Ii("generateLayersText", e, t) : Ii("generateSvgReplacementMutation", e, t);
}
function UR() {
  return [].concat(Ar(ym), Ar(Tm));
}
function Ov(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
  if (!di) return Promise.resolve();
  var n = wt.documentElement.classList, o = function(v) {
    return n.add("".concat(lv, "-").concat(v));
  }, a = function(v) {
    return n.remove("".concat(lv, "-").concat(v));
  }, s = Be.autoFetchSvg ? UR() : om.concat(Object.keys(PR));
  s.includes("fa") || s.push("fa");
  var l = [".".concat(wm, ":not([").concat(io, "])")].concat(s.map(function(h) {
    return ".".concat(h, ":not([").concat(io, "])");
  })).join(", ");
  if (l.length === 0)
    return Promise.resolve();
  var f = [];
  try {
    f = Zo(e.querySelectorAll(l));
  } catch {
  }
  if (f.length > 0)
    o("pending"), a("complete");
  else
    return Promise.resolve();
  var c = rd.begin("onTree"), p = f.reduce(function(h, v) {
    try {
      var E = Jm(v);
      E && h.push(E);
    } catch (b) {
      Sm || b.name === "MissingIcon" && console.error(b);
    }
    return h;
  }, []);
  return new Promise(function(h, v) {
    Promise.all(p).then(function(E) {
      Km(E, function() {
        o("active"), o("complete"), a("pending"), typeof t == "function" && t(), c(), h();
      });
    }).catch(function(E) {
      c(), v(E);
    });
  });
}
function $R(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
  Jm(e).then(function(n) {
    n && Km([n], t);
  });
}
function kR(e) {
  return function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = (t || {}).icon ? t : dc(t || {}), a = n.mask;
    return a && (a = (a || {}).icon ? a : dc(a || {})), e(o, me(me({}, n), {}, {
      mask: a
    }));
  };
}
var FR = function(t) {
  var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = n.transform, a = o === void 0 ? Mr : o, s = n.symbol, l = s === void 0 ? !1 : s, f = n.mask, c = f === void 0 ? null : f, p = n.maskId, h = p === void 0 ? null : p, v = n.classes, E = v === void 0 ? [] : v, b = n.attributes, R = b === void 0 ? {} : b, T = n.styles, x = T === void 0 ? {} : T;
  if (t) {
    var I = t.prefix, F = t.iconName, P = t.icon;
    return el(me({
      type: "icon"
    }, t), function() {
      return oo("beforeDOMElementCreation", {
        iconDefinition: t,
        params: n
      }), nd({
        icons: {
          main: pc(P),
          mask: c ? pc(c.icon) : {
            found: !1,
            width: null,
            height: null,
            icon: {}
          }
        },
        prefix: I,
        iconName: F,
        transform: me(me({}, Mr), a),
        symbol: l,
        maskId: h,
        extra: {
          attributes: R,
          styles: x,
          classes: E
        }
      });
    });
  }
}, BR = {
  mixout: function() {
    return {
      icon: kR(FR)
    };
  },
  hooks: function() {
    return {
      mutationObserverCallbacks: function(n) {
        return n.treeCallback = Ov, n.nodeCallback = $R, n;
      }
    };
  },
  provides: function(t) {
    t.i2svg = function(n) {
      var o = n.node, a = o === void 0 ? wt : o, s = n.callback, l = s === void 0 ? function() {
      } : s;
      return Ov(a, l);
    }, t.generateSvgReplacementMutation = function(n, o) {
      var a = o.iconName, s = o.prefix, l = o.transform, f = o.symbol, c = o.mask, p = o.maskId, h = o.extra;
      return new Promise(function(v, E) {
        Promise.all([hc(a, s), c.iconName ? hc(c.iconName, c.prefix) : Promise.resolve({
          found: !1,
          width: 512,
          height: 512,
          icon: {}
        })]).then(function(b) {
          var R = qu(b, 2), T = R[0], x = R[1];
          v([n, nd({
            icons: {
              main: T,
              mask: x
            },
            prefix: s,
            iconName: a,
            transform: l,
            symbol: f,
            maskId: p,
            extra: h,
            watchable: !0
          })]);
        }).catch(E);
      });
    }, t.generateAbstractIcon = function(n) {
      var o = n.children, a = n.attributes, s = n.main, l = n.transform, f = n.styles, c = Ju(f);
      c.length > 0 && (a.style = c);
      var p;
      return Qc(l) && (p = Ii("generateAbstractTransformGrouping", {
        main: s,
        transform: l,
        containerWidth: s.width,
        iconWidth: s.width
      })), o.push(p || s.icon), {
        children: o,
        attributes: a
      };
    };
  }
}, HR = {
  mixout: function() {
    return {
      layer: function(n) {
        var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = o.classes, s = a === void 0 ? [] : a;
        return el({
          type: "layer"
        }, function() {
          oo("beforeDOMElementCreation", {
            assembler: n,
            params: o
          });
          var l = [];
          return n(function(f) {
            Array.isArray(f) ? f.map(function(c) {
              l = l.concat(c.abstract);
            }) : l = l.concat(f.abstract);
          }), [{
            tag: "span",
            attributes: {
              class: ["".concat(Be.cssPrefix, "-layers")].concat(Ar(s)).join(" ")
            },
            children: l
          }];
        });
      }
    };
  }
}, GR = {
  mixout: function() {
    return {
      counter: function(n) {
        var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        o.title;
        var a = o.classes, s = a === void 0 ? [] : a, l = o.attributes, f = l === void 0 ? {} : l, c = o.styles, p = c === void 0 ? {} : c;
        return el({
          type: "counter",
          content: n
        }, function() {
          return oo("beforeDOMElementCreation", {
            content: n,
            params: o
          }), yR({
            content: n.toString(),
            extra: {
              attributes: f,
              styles: p,
              classes: ["".concat(Be.cssPrefix, "-layers-counter")].concat(Ar(s))
            }
          });
        });
      }
    };
  }
}, zR = {
  mixout: function() {
    return {
      text: function(n) {
        var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = o.transform, s = a === void 0 ? Mr : a, l = o.classes, f = l === void 0 ? [] : l, c = o.attributes, p = c === void 0 ? {} : c, h = o.styles, v = h === void 0 ? {} : h;
        return el({
          type: "text",
          content: n
        }, function() {
          return oo("beforeDOMElementCreation", {
            content: n,
            params: o
          }), Ev({
            content: n,
            transform: me(me({}, Mr), s),
            extra: {
              attributes: p,
              styles: v,
              classes: ["".concat(Be.cssPrefix, "-layers-text")].concat(Ar(f))
            }
          });
        });
      }
    };
  },
  provides: function(t) {
    t.generateLayersText = function(n, o) {
      var a = o.transform, s = o.extra, l = null, f = null;
      if (rm) {
        var c = parseInt(getComputedStyle(n).fontSize, 10), p = n.getBoundingClientRect();
        l = p.width / c, f = p.height / c;
      }
      return Promise.resolve([n, Ev({
        content: n.innerHTML,
        width: l,
        height: f,
        transform: a,
        extra: s,
        watchable: !0
      })]);
    };
  }
}, Zm = new RegExp('"', "ug"), Nv = [1105920, 1112319], Sv = me(me(me(me({}, {
  FontAwesome: {
    normal: "fas",
    400: "fas"
  }
}), CS), xI), BS), mc = Object.keys(Sv).reduce(function(e, t) {
  return e[t.toLowerCase()] = Sv[t], e;
}, {}), WR = Object.keys(mc).reduce(function(e, t) {
  var n = mc[t];
  return e[t] = n[900] || Ar(Object.entries(n))[0][1], e;
}, {});
function XR(e) {
  var t = e.replace(Zm, "");
  return Pm(Ar(t)[0] || "");
}
function YR(e) {
  var t = e.getPropertyValue("font-feature-settings").includes("ss01"), n = e.getPropertyValue("content"), o = n.replace(Zm, ""), a = o.codePointAt(0), s = a >= Nv[0] && a <= Nv[1], l = o.length === 2 ? o[0] === o[1] : !1;
  return s || l || t;
}
function VR(e, t) {
  var n = e.replace(/^['"]|['"]$/g, "").toLowerCase(), o = parseInt(t), a = isNaN(o) ? "normal" : o;
  return (mc[n] || {})[a] || WR[n];
}
function Iv(e, t) {
  var n = "".concat(CI).concat(t.replace(":", "-"));
  return new Promise(function(o, a) {
    if (e.getAttribute(n) !== null)
      return o();
    var s = Zo(e.children), l = s.filter(function($) {
      return $.getAttribute(sc) === t;
    })[0], f = Ni.getComputedStyle(e, t), c = f.getPropertyValue("font-family"), p = c.match(UI), h = f.getPropertyValue("font-weight"), v = f.getPropertyValue("content");
    if (l && !p)
      return e.removeChild(l), o();
    if (p && v !== "none" && v !== "") {
      var E = f.getPropertyValue("content"), b = VR(c, h), R = XR(E), T = p[0].startsWith("FontAwesome"), x = YR(f), I = td(b, R), F = I;
      if (T) {
        var P = rR(R);
        P.iconName && P.prefix && (I = P.iconName, b = P.prefix);
      }
      if (I && !x && (!l || l.getAttribute(qc) !== b || l.getAttribute(Jc) !== F)) {
        e.setAttribute(n, F), l && e.removeChild(l);
        var g = DR(), H = g.extra;
        H.attributes[sc] = t, hc(I, b).then(function($) {
          var U = nd(me(me({}, g), {}, {
            icons: {
              main: $,
              mask: Xm()
            },
            prefix: b,
            iconName: F,
            extra: H,
            watchable: !0
          })), _ = wt.createElementNS("http://www.w3.org/2000/svg", "svg");
          t === "::before" ? e.insertBefore(_, e.firstChild) : e.appendChild(_), _.outerHTML = U.map(function(A) {
            return Qa(A);
          }).join(`
`), e.removeAttribute(n), o();
        }).catch(a);
      } else
        o();
    } else
      o();
  });
}
function jR(e) {
  return Promise.all([Iv(e, "::before"), Iv(e, "::after")]);
}
function KR(e) {
  return e.parentNode !== document.head && !~MI.indexOf(e.tagName.toUpperCase()) && !e.getAttribute(sc) && (!e.parentNode || e.parentNode.tagName !== "svg");
}
var qR = function(t) {
  return !!t && Nm.some(function(n) {
    return t.includes(n);
  });
}, JR = function(t) {
  if (!t) return [];
  for (var n = /* @__PURE__ */ new Set(), o = [t], a = [/(?=\s:)/, new RegExp("(?<=\\)\\)?[^,]*,)")], s = function() {
    var b = f[l];
    o = o.flatMap(function(R) {
      return R.split(b).map(function(T) {
        return T.replace(/,\s*$/, "").trim();
      });
    });
  }, l = 0, f = a; l < f.length; l++)
    s();
  o = o.flatMap(function(E) {
    return E.includes("(") ? E : E.split(",").map(function(b) {
      return b.trim();
    });
  });
  var c = gu(o), p;
  try {
    for (c.s(); !(p = c.n()).done; ) {
      var h = p.value;
      if (qR(h)) {
        var v = Nm.reduce(function(E, b) {
          return E.replace(b, "");
        }, h);
        v !== "" && v !== "*" && n.add(v);
      }
    }
  } catch (E) {
    c.e(E);
  } finally {
    c.f();
  }
  return n;
};
function Rv(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
  if (di) {
    var n;
    if (t)
      n = e;
    else if (Be.searchPseudoElementsFullScan)
      n = e.querySelectorAll("*");
    else {
      var o = /* @__PURE__ */ new Set(), a = gu(document.styleSheets), s;
      try {
        for (a.s(); !(s = a.n()).done; ) {
          var l = s.value;
          try {
            var f = gu(l.cssRules), c;
            try {
              for (f.s(); !(c = f.n()).done; ) {
                var p = c.value, h = JR(p.selectorText), v = gu(h), E;
                try {
                  for (v.s(); !(E = v.n()).done; ) {
                    var b = E.value;
                    o.add(b);
                  }
                } catch (T) {
                  v.e(T);
                } finally {
                  v.f();
                }
              }
            } catch (T) {
              f.e(T);
            } finally {
              f.f();
            }
          } catch (T) {
            Be.searchPseudoElementsWarnings && console.warn("Font Awesome: cannot parse stylesheet: ".concat(l.href, " (").concat(T.message, `)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`));
          }
        }
      } catch (T) {
        a.e(T);
      } finally {
        a.f();
      }
      if (!o.size) return;
      var R = Array.from(o).join(", ");
      try {
        n = e.querySelectorAll(R);
      } catch {
      }
    }
    return new Promise(function(T, x) {
      var I = Zo(n).filter(KR).map(jR), F = rd.begin("searchPseudoElements");
      qm(), Promise.all(I).then(function() {
        F(), gc(), T();
      }).catch(function() {
        F(), gc(), x();
      });
    });
  }
}
var ZR = {
  hooks: function() {
    return {
      mutationObserverCallbacks: function(n) {
        return n.pseudoElementsCallback = Rv, n;
      }
    };
  },
  provides: function(t) {
    t.pseudoElements2svg = function(n) {
      var o = n.node, a = o === void 0 ? wt : o;
      Be.searchPseudoElements && Rv(a);
    };
  }
}, wv = !1, QR = {
  mixout: function() {
    return {
      dom: {
        unwatch: function() {
          qm(), wv = !0;
        }
      }
    };
  },
  hooks: function() {
    return {
      bootstrap: function() {
        Av(cc("mutationObserverCallbacks", {}));
      },
      noAuto: function() {
        xR();
      },
      watch: function(n) {
        var o = n.observeMutationsRoot;
        wv ? gc() : Av(cc("mutationObserverCallbacks", {
          observeMutationsRoot: o
        }));
      }
    };
  }
}, xv = function(t) {
  var n = {
    size: 16,
    x: 0,
    y: 0,
    flipX: !1,
    flipY: !1,
    rotate: 0
  };
  return t.toLowerCase().split(" ").reduce(function(o, a) {
    var s = a.toLowerCase().split("-"), l = s[0], f = s.slice(1).join("-");
    if (l && f === "h")
      return o.flipX = !0, o;
    if (l && f === "v")
      return o.flipY = !0, o;
    if (f = parseFloat(f), isNaN(f))
      return o;
    switch (l) {
      case "grow":
        o.size = o.size + f;
        break;
      case "shrink":
        o.size = o.size - f;
        break;
      case "left":
        o.x = o.x - f;
        break;
      case "right":
        o.x = o.x + f;
        break;
      case "up":
        o.y = o.y - f;
        break;
      case "down":
        o.y = o.y + f;
        break;
      case "rotate":
        o.rotate = o.rotate + f;
        break;
    }
    return o;
  }, n);
}, ew = {
  mixout: function() {
    return {
      parse: {
        transform: function(n) {
          return xv(n);
        }
      }
    };
  },
  hooks: function() {
    return {
      parseNodeAttributes: function(n, o) {
        var a = o.getAttribute("data-fa-transform");
        return a && (n.transform = xv(a)), n;
      }
    };
  },
  provides: function(t) {
    t.generateAbstractTransformGrouping = function(n) {
      var o = n.main, a = n.transform, s = n.containerWidth, l = n.iconWidth, f = {
        transform: "translate(".concat(s / 2, " 256)")
      }, c = "translate(".concat(a.x * 32, ", ").concat(a.y * 32, ") "), p = "scale(".concat(a.size / 16 * (a.flipX ? -1 : 1), ", ").concat(a.size / 16 * (a.flipY ? -1 : 1), ") "), h = "rotate(".concat(a.rotate, " 0 0)"), v = {
        transform: "".concat(c, " ").concat(p, " ").concat(h)
      }, E = {
        transform: "translate(".concat(l / 2 * -1, " -256)")
      }, b = {
        outer: f,
        inner: v,
        path: E
      };
      return {
        tag: "g",
        attributes: me({}, b.outer),
        children: [{
          tag: "g",
          attributes: me({}, b.inner),
          children: [{
            tag: o.icon.tag,
            children: o.icon.children,
            attributes: me(me({}, o.icon.attributes), b.path)
          }]
        }]
      };
    };
  }
}, $f = {
  x: 0,
  y: 0,
  width: "100%",
  height: "100%"
};
function Cv(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  return e.attributes && (e.attributes.fill || t) && (e.attributes.fill = "black"), e;
}
function tw(e) {
  return e.tag === "g" ? e.children : [e];
}
var nw = {
  hooks: function() {
    return {
      parseNodeAttributes: function(n, o) {
        var a = o.getAttribute("data-fa-mask"), s = a ? Qu(a.split(" ").map(function(l) {
          return l.trim();
        })) : Xm();
        return s.prefix || (s.prefix = Si()), n.mask = s, n.maskId = o.getAttribute("data-fa-mask-id"), n;
      }
    };
  },
  provides: function(t) {
    t.generateAbstractMask = function(n) {
      var o = n.children, a = n.attributes, s = n.main, l = n.mask, f = n.maskId, c = n.transform, p = s.width, h = s.icon, v = l.width, E = l.icon, b = VI({
        transform: c,
        containerWidth: v,
        iconWidth: p
      }), R = {
        tag: "rect",
        attributes: me(me({}, $f), {}, {
          fill: "white"
        })
      }, T = h.children ? {
        children: h.children.map(Cv)
      } : {}, x = {
        tag: "g",
        attributes: me({}, b.inner),
        children: [Cv(me({
          tag: h.tag,
          attributes: me(me({}, h.attributes), b.path)
        }, T))]
      }, I = {
        tag: "g",
        attributes: me({}, b.outer),
        children: [x]
      }, F = "mask-".concat(f || cv()), P = "clip-".concat(f || cv()), g = {
        tag: "mask",
        attributes: me(me({}, $f), {}, {
          id: F,
          maskUnits: "userSpaceOnUse",
          maskContentUnits: "userSpaceOnUse"
        }),
        children: [R, I]
      }, H = {
        tag: "defs",
        children: [{
          tag: "clipPath",
          attributes: {
            id: P
          },
          children: tw(E)
        }, g]
      };
      return o.push(H, {
        tag: "rect",
        attributes: me({
          fill: "currentColor",
          "clip-path": "url(#".concat(P, ")"),
          mask: "url(#".concat(F, ")")
        }, $f)
      }), {
        children: o,
        attributes: a
      };
    };
  }
}, rw = {
  provides: function(t) {
    var n = !1;
    Ni.matchMedia && (n = Ni.matchMedia("(prefers-reduced-motion: reduce)").matches), t.missingIconAbstract = function() {
      var o = [], a = {
        fill: "currentColor"
      }, s = {
        attributeType: "XML",
        repeatCount: "indefinite",
        dur: "2s"
      };
      o.push({
        tag: "path",
        attributes: me(me({}, a), {}, {
          d: "M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"
        })
      });
      var l = me(me({}, s), {}, {
        attributeName: "opacity"
      }), f = {
        tag: "circle",
        attributes: me(me({}, a), {}, {
          cx: "256",
          cy: "364",
          r: "28"
        }),
        children: []
      };
      return n || f.children.push({
        tag: "animate",
        attributes: me(me({}, s), {}, {
          attributeName: "r",
          values: "28;14;28;28;14;28;"
        })
      }, {
        tag: "animate",
        attributes: me(me({}, l), {}, {
          values: "1;0;1;1;0;1;"
        })
      }), o.push(f), o.push({
        tag: "path",
        attributes: me(me({}, a), {}, {
          opacity: "1",
          d: "M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"
        }),
        children: n ? [] : [{
          tag: "animate",
          attributes: me(me({}, l), {}, {
            values: "1;0;0;0;0;1;"
          })
        }]
      }), n || o.push({
        tag: "path",
        attributes: me(me({}, a), {}, {
          opacity: "0",
          d: "M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"
        }),
        children: [{
          tag: "animate",
          attributes: me(me({}, l), {}, {
            values: "0;0;1;1;0;0;"
          })
        }]
      }), {
        tag: "g",
        attributes: {
          class: "missing"
        },
        children: o
      };
    };
  }
}, iw = {
  hooks: function() {
    return {
      parseNodeAttributes: function(n, o) {
        var a = o.getAttribute("data-fa-symbol"), s = a === null ? !1 : a === "" ? !0 : a;
        return n.symbol = s, n;
      }
    };
  }
}, ow = [qI, BR, HR, GR, zR, ZR, QR, ew, nw, rw, iw];
dR(ow, {
  mixoutsTo: Wn
});
Wn.noAuto;
var Qm = Wn.config;
Wn.library;
Wn.dom;
var Cu = Wn.parse;
Wn.findIconDefinition;
Wn.toHtml;
var aw = Wn.icon;
Wn.layer;
var sw = Wn.text;
Wn.counter;
function Ec(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function uw(e) {
  if (Array.isArray(e)) return Ec(e);
}
function dn(e, t, n) {
  return (t = hw(t)) in e ? Object.defineProperty(e, t, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = n, e;
}
function lw(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fw() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Lv(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function vr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Lv(Object(n), !0).forEach(function(o) {
      dn(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Lv(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function cw(e, t) {
  if (e == null) return {};
  var n, o, a = dw(e, t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (o = 0; o < s.length; o++) n = s[o], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (a[n] = e[n]);
  }
  return a;
}
function dw(e, t) {
  if (e == null) return {};
  var n = {};
  for (var o in e) if ({}.hasOwnProperty.call(e, o)) {
    if (t.indexOf(o) !== -1) continue;
    n[o] = e[o];
  }
  return n;
}
function _c(e) {
  return uw(e) || lw(e) || vw(e) || fw();
}
function pw(e, t) {
  if (typeof e != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (typeof o != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function hw(e) {
  var t = pw(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function Lu(e) {
  "@babel/helpers - typeof";
  return Lu = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Lu(e);
}
function vw(e, t) {
  if (e) {
    if (typeof e == "string") return Ec(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ec(e, t) : void 0;
  }
}
function Ua(e, t) {
  return Array.isArray(t) && t.length > 0 || !Array.isArray(t) && t ? dn({}, e, t) : {};
}
function gw(e) {
  var t, n = (t = {
    "fa-spin": e.spin,
    "fa-pulse": e.pulse,
    // the fixedWidth property has been deprecated as of version 7.0.0
    "fa-fw": e.fixedWidth,
    "fa-border": e.border,
    "fa-li": e.listItem,
    "fa-inverse": e.inverse,
    "fa-flip": e.flip === !0,
    "fa-flip-horizontal": e.flip === "horizontal" || e.flip === "both",
    "fa-flip-vertical": e.flip === "vertical" || e.flip === "both"
  }, dn(dn(dn(dn(dn(dn(dn(dn(dn(dn(t, "fa-".concat(e.size), e.size !== null), "fa-rotate-".concat(e.rotation), e.rotation !== null), "fa-rotate-by", e.rotateBy), "fa-pull-".concat(e.pull), e.pull !== null), "fa-swap-opacity", e.swapOpacity), "fa-bounce", e.bounce), "fa-shake", e.shake), "fa-beat", e.beat), "fa-fade", e.fade), "fa-beat-fade", e.beatFade), dn(dn(dn(dn(t, "fa-flash", e.flash), "fa-spin-pulse", e.spinPulse), "fa-spin-reverse", e.spinReverse), "fa-width-auto", e.widthAuto));
  return Object.keys(n).map(function(o) {
    return n[o] ? o : null;
  }).filter(function(o) {
    return o;
  });
}
var mw = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, e0 = { exports: {} };
(function(e) {
  (function(t) {
    var n = function(I, F, P) {
      if (!p(F) || v(F) || E(F) || b(F) || c(F))
        return F;
      var g, H = 0, $ = 0;
      if (h(F))
        for (g = [], $ = F.length; H < $; H++)
          g.push(n(I, F[H], P));
      else {
        g = {};
        for (var U in F)
          Object.prototype.hasOwnProperty.call(F, U) && (g[I(U, P)] = n(I, F[U], P));
      }
      return g;
    }, o = function(I, F) {
      F = F || {};
      var P = F.separator || "_", g = F.split || /(?=[A-Z])/;
      return I.split(g).join(P);
    }, a = function(I) {
      return R(I) ? I : (I = I.replace(/[\-_\s]+(.)?/g, function(F, P) {
        return P ? P.toUpperCase() : "";
      }), I.substr(0, 1).toLowerCase() + I.substr(1));
    }, s = function(I) {
      var F = a(I);
      return F.substr(0, 1).toUpperCase() + F.substr(1);
    }, l = function(I, F) {
      return o(I, F).toLowerCase();
    }, f = Object.prototype.toString, c = function(I) {
      return typeof I == "function";
    }, p = function(I) {
      return I === Object(I);
    }, h = function(I) {
      return f.call(I) == "[object Array]";
    }, v = function(I) {
      return f.call(I) == "[object Date]";
    }, E = function(I) {
      return f.call(I) == "[object RegExp]";
    }, b = function(I) {
      return f.call(I) == "[object Boolean]";
    }, R = function(I) {
      return I = I - 0, I === I;
    }, T = function(I, F) {
      var P = F && "process" in F ? F.process : F;
      return typeof P != "function" ? I : function(g, H) {
        return P(g, I, H);
      };
    }, x = {
      camelize: a,
      decamelize: l,
      pascalize: s,
      depascalize: l,
      camelizeKeys: function(I, F) {
        return n(T(a, F), I);
      },
      decamelizeKeys: function(I, F) {
        return n(T(l, F), I, F);
      },
      pascalizeKeys: function(I, F) {
        return n(T(s, F), I);
      },
      depascalizeKeys: function() {
        return this.decamelizeKeys.apply(this, arguments);
      }
    };
    e.exports ? e.exports = x : t.humps = x;
  })(mw);
})(e0);
var Ew = e0.exports, _w = ["class", "style"];
function yw(e) {
  return e.split(";").map(function(t) {
    return t.trim();
  }).filter(function(t) {
    return t;
  }).reduce(function(t, n) {
    var o = n.indexOf(":"), a = Ew.camelize(n.slice(0, o)), s = n.slice(o + 1).trim();
    return t[a] = s, t;
  }, {});
}
function Tw(e) {
  return e.split(/\s+/).reduce(function(t, n) {
    return t[n] = !0, t;
  }, {});
}
function od(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
  if (typeof e == "string")
    return e;
  var o = (e.children || []).map(function(c) {
    return od(c);
  }), a = Object.keys(e.attributes || {}).reduce(function(c, p) {
    var h = e.attributes[p];
    switch (p) {
      case "class":
        c.class = Tw(h);
        break;
      case "style":
        c.style = yw(h);
        break;
      default:
        c.attrs[p] = h;
    }
    return c;
  }, {
    attrs: {},
    class: {},
    style: {}
  });
  n.class;
  var s = n.style, l = s === void 0 ? {} : s, f = cw(n, _w);
  return oi(e.tag, vr(vr(vr({}, t), {}, {
    class: a.class,
    style: vr(vr({}, a.style), l)
  }, a.attrs), f), o);
}
var t0 = !1;
try {
  t0 = !0;
} catch {
}
function Aw() {
  if (!t0 && console && typeof console.error == "function") {
    var e;
    (e = console).error.apply(e, arguments);
  }
}
function Mv(e) {
  if (e && Lu(e) === "object" && e.prefix && e.iconName && e.icon)
    return e;
  if (Cu.icon)
    return Cu.icon(e);
  if (e === null)
    return null;
  if (Lu(e) === "object" && e.prefix && e.iconName)
    return e;
  if (Array.isArray(e) && e.length === 2)
    return {
      prefix: e[0],
      iconName: e[1]
    };
  if (typeof e == "string")
    return {
      prefix: "fas",
      iconName: e
    };
}
var Jt = Lt({
  name: "FontAwesomeIcon",
  props: {
    border: {
      type: Boolean,
      default: !1
    },
    // the fixedWidth property has been deprecated as of version 7
    fixedWidth: {
      type: Boolean,
      default: !1
    },
    flip: {
      type: [Boolean, String],
      default: !1,
      validator: function(t) {
        return [!0, !1, "horizontal", "vertical", "both"].indexOf(t) > -1;
      }
    },
    icon: {
      type: [Object, Array, String],
      required: !0
    },
    mask: {
      type: [Object, Array, String],
      default: null
    },
    maskId: {
      type: String,
      default: null
    },
    listItem: {
      type: Boolean,
      default: !1
    },
    pull: {
      type: String,
      default: null,
      validator: function(t) {
        return ["right", "left"].indexOf(t) > -1;
      }
    },
    pulse: {
      type: Boolean,
      default: !1
    },
    rotation: {
      type: [String, Number],
      default: null,
      validator: function(t) {
        return [90, 180, 270].indexOf(Number.parseInt(t, 10)) > -1;
      }
    },
    // the rotateBy property is only supported in version 7.0.0 and later
    rotateBy: {
      type: Boolean,
      default: !1
    },
    swapOpacity: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null,
      validator: function(t) {
        return ["2xs", "xs", "sm", "lg", "xl", "2xl", "1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x", "10x"].indexOf(t) > -1;
      }
    },
    spin: {
      type: Boolean,
      default: !1
    },
    transform: {
      type: [String, Object],
      default: null
    },
    symbol: {
      type: [Boolean, String],
      default: !1
    },
    title: {
      type: String,
      default: null
    },
    titleId: {
      type: String,
      default: null
    },
    inverse: {
      type: Boolean,
      default: !1
    },
    bounce: {
      type: Boolean,
      default: !1
    },
    shake: {
      type: Boolean,
      default: !1
    },
    beat: {
      type: Boolean,
      default: !1
    },
    fade: {
      type: Boolean,
      default: !1
    },
    beatFade: {
      type: Boolean,
      default: !1
    },
    flash: {
      type: Boolean,
      default: !1
    },
    spinPulse: {
      type: Boolean,
      default: !1
    },
    spinReverse: {
      type: Boolean,
      default: !1
    },
    // the widthAuto property is only supported in version 7.0.0 and later
    widthAuto: {
      type: Boolean,
      default: !1
    }
  },
  setup: function(t, n) {
    var o = n.attrs, a = $e(function() {
      return Mv(t.icon);
    }), s = $e(function() {
      return Ua("classes", gw(t));
    }), l = $e(function() {
      return Ua("transform", typeof t.transform == "string" ? Cu.transform(t.transform) : t.transform);
    }), f = $e(function() {
      return Ua("mask", Mv(t.mask));
    }), c = $e(function() {
      var h = vr(vr(vr(vr({}, s.value), l.value), f.value), {}, {
        symbol: t.symbol,
        maskId: t.maskId
      });
      return h.title = t.title, h.titleId = t.titleId, aw(a.value, h);
    });
    Zt(c, function(h) {
      if (!h)
        return Aw("Could not find one or more icon(s)", a.value, f.value);
    }, {
      immediate: !0
    });
    var p = $e(function() {
      return c.value ? od(c.value.abstract[0], {}, o) : null;
    });
    return function() {
      return p.value;
    };
  }
});
Lt({
  name: "FontAwesomeLayers",
  props: {
    fixedWidth: {
      type: Boolean,
      default: !1
    }
  },
  setup: function(t, n) {
    var o = n.slots, a = Qm.familyPrefix, s = $e(function() {
      return ["".concat(a, "-layers")].concat(_c(t.fixedWidth ? ["".concat(a, "-fw")] : []));
    });
    return function() {
      return oi("div", {
        class: s.value
      }, o.default ? o.default() : []);
    };
  }
});
Lt({
  name: "FontAwesomeLayersText",
  props: {
    value: {
      type: [String, Number],
      default: ""
    },
    transform: {
      type: [String, Object],
      default: null
    },
    counter: {
      type: Boolean,
      default: !1
    },
    position: {
      type: String,
      default: null,
      validator: function(t) {
        return ["bottom-left", "bottom-right", "top-left", "top-right"].indexOf(t) > -1;
      }
    }
  },
  setup: function(t, n) {
    var o = n.attrs, a = Qm.familyPrefix, s = $e(function() {
      return Ua("classes", [].concat(_c(t.counter ? ["".concat(a, "-layers-counter")] : []), _c(t.position ? ["".concat(a, "-layers-").concat(t.position)] : [])));
    }), l = $e(function() {
      return Ua("transform", typeof t.transform == "string" ? Cu.transform(t.transform) : t.transform);
    }), f = $e(function() {
      var p = sw(t.value.toString(), vr(vr({}, l.value), s.value)), h = p.abstract;
      return t.counter && (h[0].attributes.class = h[0].attributes.class.replace("fa-layers-text", "")), h[0];
    }), c = $e(function() {
      return od(f.value, {}, o);
    });
    return function() {
      return c.value;
    };
  }
});
/*!
 * Font Awesome Free 7.0.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
 * Copyright 2025 Fonticons, Inc.
 */
var bw = {
  prefix: "fas",
  iconName: "align-justify",
  icon: [448, 512, [], "f039", "M448 64c0-17.7-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32zm0 256c0-17.7-14.3-32-32-32L32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32zM0 192c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160c-17.7 0-32 14.3-32 32zM448 448c0-17.7-14.3-32-32-32L32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32z"]
}, Ow = {
  prefix: "fas",
  iconName: "memory",
  icon: [512, 512, [], "f538", "M64 64C28.7 64 0 92.7 0 128l0 7.4C0 142.2 4.4 148 10.1 151.7 23.3 160.3 32 175.1 32 192s-8.7 31.7-21.9 40.3C4.4 236 0 241.8 0 248.6l0 55.4 512 0 0-55.4c0-6.8-4.4-12.6-10.1-16.3-13.2-8.6-21.9-23.4-21.9-40.3s8.7-31.7 21.9-40.3c5.7-3.7 10.1-9.5 10.1-16.3l0-7.4c0-35.3-28.7-64-64-64L64 64zM512 416l0-64-512 0 0 64c0 17.7 14.3 32 32 32l64 0 0-24c0-13.3 10.7-24 24-24s24 10.7 24 24l0 24 88 0 0-24c0-13.3 10.7-24 24-24s24 10.7 24 24l0 24 88 0 0-24c0-13.3 10.7-24 24-24s24 10.7 24 24l0 24 64 0c17.7 0 32-14.3 32-32zM160 160l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32zm128 0l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32zm128 0l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32z"]
}, Nw = {
  prefix: "fas",
  iconName: "magnifying-glass",
  icon: [512, 512, [128269, "search"], "f002", "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"]
}, Sw = Nw, Iw = {
  prefix: "fas",
  iconName: "chevron-up",
  icon: [448, 512, [], "f077", "M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"]
}, n0 = {
  prefix: "fas",
  iconName: "clock",
  icon: [512, 512, [128339, "clock-four"], "f017", "M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"]
}, Rw = {
  prefix: "fas",
  iconName: "chevron-right",
  icon: [320, 512, [9002], "f054", "M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"]
}, ww = {
  prefix: "fas",
  iconName: "clipboard",
  icon: [384, 512, [128203], "f328", "M320 32l-8.6 0C300.4 12.9 279.7 0 256 0L128 0C104.3 0 83.6 12.9 72.6 32L64 32C28.7 32 0 60.7 0 96L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-352c0-35.3-28.7-64-64-64zM136 112c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-112 0z"]
}, xw = {
  prefix: "fas",
  iconName: "thumbs-down",
  icon: [512, 512, [128078, 61576], "f165", "M384 32c26.5 0 48 21.5 48 48 0 6.3-1.3 12.2-3.4 17.7 20.4 5.5 35.4 24.1 35.4 46.3 0 9.1-2.6 17.6-7 24.9 22.2 4.2 39 23.7 39 47.1 0 19.7-11.9 36.6-28.9 44 17 7.4 28.9 24.3 28.9 44 0 26.5-21.5 48-48 48l-160 0 28.2 70.4c2.5 6.3 3.8 13.1 3.8 19.9l0 4.2c0 27.3-22.1 49.4-49.4 49.4-18.7 0-35.8-10.6-44.2-27.3L170.1 356.3c-6.7-13.3-10.1-28-10.1-42.9l0-186.6c0-19.4 8.9-37.8 24-50l12.2-9.7C224.6 44.4 259.8 32 296.1 32L384 32zM80 96c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-48 0c-17.7 0-32-14.3-32-32L0 128c0-17.7 14.3-32 32-32l48 0z"]
}, Cw = {
  prefix: "fas",
  iconName: "check",
  icon: [448, 512, [10003, 10004], "f00c", "M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"]
}, r0 = {
  prefix: "fas",
  iconName: "chevron-down",
  icon: [448, 512, [], "f078", "M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"]
}, Lw = {
  prefix: "fas",
  iconName: "arrow-down-short-wide",
  icon: [576, 512, ["sort-amount-desc", "sort-amount-down-alt"], "f884", "M246.6 374.6l-96 96c-12.5 12.5-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L96 370.7 96 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 306.7 41.4-41.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3zM320 32l32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"]
}, Mw = {
  prefix: "fas",
  iconName: "arrow-down-wide-short",
  icon: [576, 512, ["sort-amount-asc", "sort-amount-down"], "f160", "M246.6 374.6l-96 96c-12.5 12.5-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L96 370.7 96 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 306.7 41.4-41.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3zM320 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0zm0-128c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0zm0-128c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0zm0-128c-17.7 0-32-14.3-32-32s14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L320 96z"]
}, Dw = {
  prefix: "fas",
  iconName: "circle-info",
  icon: [512, 512, ["info-circle"], "f05a", "M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"]
}, Aa = Dw;
const Pw = {
  class: "copy position-absolute",
  style: { top: "0", right: "0" }
}, kf = /* @__PURE__ */ Lt({
  __name: "Copy",
  props: {
    content: {}
  },
  setup(e) {
    const t = e, n = qe(!1);
    function o() {
      const { toClipboard: a } = cO();
      a(t.content), n.value = !0, window.setTimeout(() => {
        n.value = !1;
      }, 2e3);
    }
    return (a, s) => (q(), re("div", Pw, [
      D("button", {
        name: "copyRawButton",
        class: Xe(["btn btn-outline-secondary bg-light btn-sm m-2", n.value ? "d-none" : "d-block"]),
        onClick: o
      }, [
        We(S(Jt), {
          "fixed-width": "",
          icon: S(ww)
        }, null, 8, ["icon"])
      ], 2),
      s[0] || (s[0] = B()),
      Bn((q(), re("button", {
        class: Xe(["btn btn-outline-secondary bg-light btn-sm m-2", n.value ? "d-block" : "d-none"]),
        onClick: o
      }, [
        We(S(Jt), {
          "fixed-width": "",
          icon: S(Cw),
          class: "text-success"
        }, null, 8, ["icon"])
      ], 2)), [
        [S(Hn), { placement: "left", arrow: !0, content: "copied" }]
      ])
    ]));
  }
});
var Nn = /* @__PURE__ */ ((e) => (e[e.time = 0] = "time", e[e.rows = 1] = "rows", e[e.result = 2] = "result", e))(Nn || {}), i0 = /* @__PURE__ */ ((e) => (e.shared = "Shared", e.temp = "Temp", e.local = "Local", e))(i0 || {});
class Fn {
  static NONE = "none";
  static DURATION = "duration";
  static ROWS = "rows";
  static RESULT = "result";
}
var Dr = /* @__PURE__ */ ((e) => (e.asc = "asc", e.desc = "desc", e))(Dr || {}), yc = /* @__PURE__ */ ((e) => (e[e.over = 1] = "over", e[e.under = 2] = "under", e[e.none = 3] = "none", e))(yc || {}), w = /* @__PURE__ */ ((e) => (e.QUERY = "query_name", e.NODE_TYPE = "operator_type", e.NODE_TYPE_EXPLAIN = "name", e.ACTUAL_ROWS = "operator_cardinality", e.ACTUAL_TIME = "operator_timing", e.BLOCKED_THREAD_TIME = "blocked_thread_time", e.PLANS = "children", e.CPU_TIME = "cpu_time", e.CUMULATIVE_CARDINALITY = "cumulative_cardinality", e.CUMULATIVE_ROWS_SCANNED = "cumulative_rows_scanned", e.OPERATOR_ROWS_SCANNED = "operator_rows_scanned", e.RESULT_SET_SIZE = "result_set_size", e.LATENCY = "latency", e.ROWS_RETURNED = "rows_returned", e.EXTRA_INFO = "extra_info", e.RELATION_NAME = "Table", e.PROJECTIONS = "Projections", e.ESTIMATED_ROWS = "Estimated Cardinality", e.AGGREGATES = "Aggregates", e.CTE_NAME = "CTE Name", e.TABLE_INDEX = "Table Index", e.GROUPS = "Groups", e.JOIN_TYPE = "Join Type", e.CONDITIONS = "Conditions", e.CTE_INDEX = "CTE Index", e.FILTER = "Expression", e.DELIM_INDEX = "Delim Index", e.FUNCTION = "Function", e.FUNCTION_NAME = "Name", e.NODE_ID = "nodeId", e.DEV_PLAN_TAG = "plan_", e))(w || {}), pn = /* @__PURE__ */ ((e) => (e[e.blocks = 0] = "blocks", e[e.boolean = 1] = "boolean", e[e.bytes = 2] = "bytes", e[e.cost = 3] = "cost", e[e.duration = 4] = "duration", e[e.estimateDirection = 5] = "estimateDirection", e[e.factor = 6] = "factor", e[e.increment = 7] = "increment", e[e.json = 8] = "json", e[e.kilobytes = 9] = "kilobytes", e[e.list = 10] = "list", e[e.loops = 11] = "loops", e[e.rows = 12] = "rows", e[e.sortGroups = 13] = "sortGroups", e[e.transferRate = 14] = "transferRate", e))(pn || {});
const St = {};
St.operator_cardinality = 12;
St.cumulative_cardinality = 12;
St.cumulative_rows_scanned = 12;
St.operator_rows_scanned = 12;
St.cpu_time = 4;
St.blocked_thread_time = 4;
St.result_set_size = 2;
St.operator_timing = 4;
St.latency = 4;
St.rows_returned = 12;
class Uw {
  // plan property keys
  static WORKER_NUMBER = "Worker Number";
}
St[Uw.WORKER_NUMBER] = 7;
class tl {
  nodeId = 0;
  getNodeTypeDescription(t) {
    return $w[t.toUpperCase()];
  }
  getHelpMessage(t) {
    return kw[t.toUpperCase()];
  }
}
const $w = {
  NESTED_LOOP_JOIN: "Joins two tables using a nested loop.",
  MERGE_JOIN: "Performs a join by first sorting both tables on the join key and then merging them efficiently.",
  HASH_JOIN: "Performs a join by building a hash table on one of the input tables for fast lookups.",
  HASH_GROUP_BY: "Is a group-by and aggregate implementation that uses a hash table to perform the grouping.",
  FILTER: "It removes non-matching tuples from the result. Note that it does not physically change the data, it only adds a selection vector to the chunk.",
  PROJECTION: "Computes expressions and selects specific columns from the input dataset.",
  TABLE_SCAN: "Reads rows from a base table.",
  // "INDEX_SCAN": `Uses an index to quickly locate matching rows instead of scanning the entire table.`,
  // "INDEX_JOIN": `Uses an index lookup to efficiently join two tables.`,
  // "COLUMN_SCAN": `Reads data from the columnar storage format, optimizing access for analytical queries.`,
  // "TABLE_FUNCTION": `Executes a table-producing function, often used for reading external data formats.`,
  UNNEST: "Unnests an array or stuct into a table.",
  WINDOW: "Performs window function computations over a specified partition of data.",
  STREAMING_WINDOW: "Computes window functions in a streaming fashion without materializing the entire result set.",
  CTE: "Materialized CTEs hold a temporary table defined within the scope of a query that can be referenced multiple times.",
  CTE_SCAN: "Scans the <code>result table</code> of a materialized CTE.",
  RECURSIVE_CTE: "Defines a recursive Common Table Expression (CTE) that enables iterative query processing.",
  RECURSIVE_CTE_SCAN: "Scans the <code>working table</code> of a <code>RECURSIVE_CTE</code>.",
  CROSS_PRODUCT: "Performs a Cartesian product between two tables.",
  UNION: "Combines the results of two tables.",
  UNGROUPED_AGGREGATE: "Computes aggregate functions over the entire input table without grouping.",
  READ_CSV_AUTO: "Reads and parses CSV files, inferring column types and delimiters without explicit user specification.",
  DUMMY_SCAN: "Generates a single-row, zero-column result, typically used for queries without an explicit table source (e.g., <code>SELECT 1</code>).",
  DELIM_SCAN: "A <code>DELIM_SCAN</code> works in conjunction with a <code>DELIM_JOIN</code> and reads the set of correlated values.",
  INOUT_FUNCTION: "Represents a table in-out function that can accepts a table as input and returns a table.",
  RIGHT_DELIM_JOIN: "A <code>DELIM_JOIN</code> is used when DuckDB detects (and eliminates) a correlated subquery.",
  LEFT_DELIM_JOIN: "A <code>DELIM_JOIN</code> is used when DuckDB detects (and eliminates) a correlated subquery.",
  INSERT: "Inserts new rows into a table by consuming input data from its child node.",
  UPDATE: "Updates rows in a table.",
  DELETE: "Deletes rows of a table."
}, kw = {
  "MISSING EXECUTION TIME": `Execution time (or Total runtime) not available for this plan. Make sure you
    use ANALYZE.`,
  "MISSING BLOCKED THREAD TIME": `Blocked thread time not available for this plan. Make sure you
    use ANALYZE.`,
  "MISSING LATENCY": `Latency not available for this plan. Make sure you
    use ANALYZE.`,
  "MISSING ROWS RETURNED": `Rows returned not available for this plan. Make sure you
    use ANALYZE.`,
  "MISSING RESULT SIZE": `Result size not available for this plan. Make sure you
    use ANALYZE.`
};
function Fw(e, t, n, o) {
  if (!t)
    return;
  const a = e.getBoundingClientRect(), s = t.getBoundingClientRect();
  let l = e.scrollLeft;
  const f = s.left >= a.left && s.left <= a.right && s.right <= a.right;
  let c = e.scrollTop;
  const p = s.top >= a.top && s.top <= a.bottom && s.bottom <= a.bottom;
  (!f || !p) && (l = s.left + e.scrollLeft - a.left - a.width / 2 + s.width / 2, c = s.top + e.scrollTop - a.top - a.height / 2 + s.height / 2, Bw({
    element: e,
    to: { scrollTop: c, scrollLeft: l },
    duration: 400,
    done: o
  }));
}
const Dv = ({
  currentTime: e,
  start: t,
  change: n,
  duration: o
}) => {
  let a = e;
  return a /= o / 2, a < 1 ? n / 2 * a * a + t : (a -= 1, -n / 2 * (a * (a - 2) - 1) + t);
};
function Bw({
  duration: e,
  element: t,
  to: n,
  done: o
}) {
  const a = t.scrollTop, s = t.scrollLeft, l = n.scrollTop - a, f = n.scrollLeft - s, c = (/* @__PURE__ */ new Date()).getTime(), p = () => {
    const v = (/* @__PURE__ */ new Date()).getTime() - c;
    t.scrollTop = Dv({
      currentTime: v,
      start: a,
      change: l,
      duration: e
    }), t.scrollLeft = Dv({
      currentTime: v,
      start: s,
      change: f,
      duration: e
    }), v < e ? requestAnimationFrame(p) : (t.scrollTop = n.scrollTop, t.scrollLeft = n.scrollLeft);
  };
  p();
}
function Hw(e, t) {
  let n;
  const o = e.content[w.PLANS][0];
  return o.nodeId == t ? o : (o && o[w.PLANS] && o[w.PLANS]?.some(function a(s) {
    return s.nodeId === t ? (n = s, !0) : s[w.PLANS] && s[w.PLANS].some(a);
  }), n);
}
const Gw = [
  w.NODE_TYPE,
  w.NODE_TYPE_EXPLAIN,
  w.EXTRA_INFO,
  w.ACTUAL_TIME,
  w.ACTUAL_ROWS,
  w.OPERATOR_ROWS_SCANNED,
  w.ESTIMATED_ROWS,
  w.CTE_NAME,
  w.JOIN_TYPE,
  w.NODE_ID,
  "size",
  // Manually added to use FlexTree
  w.RELATION_NAME,
  w.FUNCTION_NAME,
  w.PROJECTIONS,
  w.CONDITIONS,
  w.FILTER
];
function zw(e, t) {
  return (!!t || St[e] === pn.increment || e === w.ACTUAL_ROWS) && Gw.indexOf(e) === -1;
}
const Ww = { class: "tree-lines" }, ad = /* @__PURE__ */ Lt({
  __name: "LevelDivider",
  props: {
    level: {},
    isSubplan: { type: Boolean },
    isNode: { type: Boolean },
    isLastChild: { type: Boolean },
    branches: {},
    index: {},
    dense: { type: Boolean, default: !1 }
  },
  setup(e) {
    const n = e.dense ? "" : " ";
    return (o, a) => (q(), re("span", Ww, [
      (q(!0), re(Et, null, er(S(be).range(o.level), (s) => (q(), re(Et, null, [
        S(be).indexOf(o.branches, s) != -1 ? (q(), re(Et, { key: 0 }, [
          B(He(S(n)) + "│", 1)
        ], 64)) : s !== 0 ? (q(), re(Et, { key: 1 }, [
          B(He(S(n)) + " ", 1)
        ], 64)) : Le("", !0)
      ], 64))), 256)),
      o.index !== 0 ? (q(), re(Et, { key: 0 }, [
        o.isSubplan && o.isNode ? (q(), re(Et, { key: 1 }, [
          o.isLastChild ? (q(), re(Et, { key: 1 }, [
            B(He(S(n)) + " ", 1)
          ], 64)) : (q(), re(Et, { key: 0 }, [
            B(He(S(n)) + "│", 1)
          ], 64))
        ], 64)) : (q(), re(Et, { key: 0 }, [
          B(He(S(n)) + He(o.isLastChild ? "└" : "├"), 1)
        ], 64))
      ], 64)) : Le("", !0)
    ]));
  }
}), Xw = { class: "table-borderless" }, Yw = { class: "text-nowrap p-0" }, Vw = { class: "p-0 ps-1" }, jw = { class: "table-borderless" }, Kw = { class: "p-0 ps-1" }, qw = /* @__PURE__ */ Lt({
  __name: "SortGroup",
  props: {
    sortGroup: {}
  },
  setup(e) {
    return (t, n) => (q(), re("div", null, [
      B(`
    Count: ` + He(t.sortGroup["Group Count"]) + " ", 1),
      n[6] || (n[6] = D("br", null, null, -1)),
      n[7] || (n[7] = B()),
      D("table", Xw, [
        D("tr", null, [
          D("td", Yw, [
            n[0] || (n[0] = B(`
          Sort Method`, -1)),
            t.sortGroup["Sort Methods Used"].length > 1 ? (q(), re(Et, { key: 0 }, [
              B("s")
            ], 64)) : Le("", !0),
            n[1] || (n[1] = B(`:
        `, -1))
          ]),
          n[2] || (n[2] = B()),
          D("td", Vw, He(S(wa)(t.sortGroup["Sort Methods Used"])), 1)
        ])
      ]),
      n[8] || (n[8] = B()),
      D("table", jw, [
        D("tr", null, [
          n[4] || (n[4] = D("td", { class: "p-0" }, "Memory:", -1)),
          n[5] || (n[5] = B()),
          D("td", Kw, [
            B(`
          Average:
          ` + He(S(Tc)(t.sortGroup["Sort Space Memory"]["Average Sort Space Used"])) + " ", 1),
            n[3] || (n[3] = D("br", null, null, -1)),
            B(`
          Peak:
          ` + He(S(Tc)(t.sortGroup["Sort Space Memory"]["Peak Sort Space Used"])), 1)
          ])
        ])
      ])
    ]));
  }
});
var Ff, Pv;
function Jw() {
  if (Pv) return Ff;
  Pv = 1;
  function e(M) {
    return M instanceof Map ? M.clear = M.delete = M.set = function() {
      throw new Error("map is read-only");
    } : M instanceof Set && (M.add = M.clear = M.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(M), Object.getOwnPropertyNames(M).forEach((te) => {
      const ve = M[te], Ge = typeof ve;
      (Ge === "object" || Ge === "function") && !Object.isFrozen(ve) && e(ve);
    }), M;
  }
  class t {
    /**
     * @param {CompiledMode} mode
     */
    constructor(te) {
      te.data === void 0 && (te.data = {}), this.data = te.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function n(M) {
    return M.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function o(M, ...te) {
    const ve = /* @__PURE__ */ Object.create(null);
    for (const Ge in M)
      ve[Ge] = M[Ge];
    return te.forEach(function(Ge) {
      for (const gt in Ge)
        ve[gt] = Ge[gt];
    }), /** @type {T} */
    ve;
  }
  const a = "</span>", s = (M) => !!M.scope, l = (M, { prefix: te }) => {
    if (M.startsWith("language:"))
      return M.replace("language:", "language-");
    if (M.includes(".")) {
      const ve = M.split(".");
      return [
        `${te}${ve.shift()}`,
        ...ve.map((Ge, gt) => `${Ge}${"_".repeat(gt + 1)}`)
      ].join(" ");
    }
    return `${te}${M}`;
  };
  class f {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(te, ve) {
      this.buffer = "", this.classPrefix = ve.classPrefix, te.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(te) {
      this.buffer += n(te);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(te) {
      if (!s(te)) return;
      const ve = l(
        te.scope,
        { prefix: this.classPrefix }
      );
      this.span(ve);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(te) {
      s(te) && (this.buffer += a);
    }
    /**
     * returns the accumulated buffer
    */
    value() {
      return this.buffer;
    }
    // helpers
    /**
     * Builds a span element
     *
     * @param {string} className */
    span(te) {
      this.buffer += `<span class="${te}">`;
    }
  }
  const c = (M = {}) => {
    const te = { children: [] };
    return Object.assign(te, M), te;
  };
  class p {
    constructor() {
      this.rootNode = c(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(te) {
      this.top.children.push(te);
    }
    /** @param {string} scope */
    openNode(te) {
      const ve = c({ scope: te });
      this.add(ve), this.stack.push(ve);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); ) ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    /**
     * @typedef { import("./html_renderer").Renderer } Renderer
     * @param {Renderer} builder
     */
    walk(te) {
      return this.constructor._walk(te, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(te, ve) {
      return typeof ve == "string" ? te.addText(ve) : ve.children && (te.openNode(ve), ve.children.forEach((Ge) => this._walk(te, Ge)), te.closeNode(ve)), te;
    }
    /**
     * @param {Node} node
     */
    static _collapse(te) {
      typeof te != "string" && te.children && (te.children.every((ve) => typeof ve == "string") ? te.children = [te.children.join("")] : te.children.forEach((ve) => {
        p._collapse(ve);
      }));
    }
  }
  class h extends p {
    /**
     * @param {*} options
     */
    constructor(te) {
      super(), this.options = te;
    }
    /**
     * @param {string} text
     */
    addText(te) {
      te !== "" && this.add(te);
    }
    /** @param {string} scope */
    startScope(te) {
      this.openNode(te);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(te, ve) {
      const Ge = te.root;
      ve && (Ge.scope = `language:${ve}`), this.add(Ge);
    }
    toHTML() {
      return new f(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function v(M) {
    return M ? typeof M == "string" ? M : M.source : null;
  }
  function E(M) {
    return T("(?=", M, ")");
  }
  function b(M) {
    return T("(?:", M, ")*");
  }
  function R(M) {
    return T("(?:", M, ")?");
  }
  function T(...M) {
    return M.map((ve) => v(ve)).join("");
  }
  function x(M) {
    const te = M[M.length - 1];
    return typeof te == "object" && te.constructor === Object ? (M.splice(M.length - 1, 1), te) : {};
  }
  function I(...M) {
    return "(" + (x(M).capture ? "" : "?:") + M.map((Ge) => v(Ge)).join("|") + ")";
  }
  function F(M) {
    return new RegExp(M.toString() + "|").exec("").length - 1;
  }
  function P(M, te) {
    const ve = M && M.exec(te);
    return ve && ve.index === 0;
  }
  const g = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function H(M, { joinWith: te }) {
    let ve = 0;
    return M.map((Ge) => {
      ve += 1;
      const gt = ve;
      let ct = v(Ge), Ce = "";
      for (; ct.length > 0; ) {
        const Re = g.exec(ct);
        if (!Re) {
          Ce += ct;
          break;
        }
        Ce += ct.substring(0, Re.index), ct = ct.substring(Re.index + Re[0].length), Re[0][0] === "\\" && Re[1] ? Ce += "\\" + String(Number(Re[1]) + gt) : (Ce += Re[0], Re[0] === "(" && ve++);
      }
      return Ce;
    }).map((Ge) => `(${Ge})`).join(te);
  }
  const $ = /\b\B/, U = "[a-zA-Z]\\w*", _ = "[a-zA-Z_]\\w*", A = "\\b\\d+(\\.\\d+)?", Z = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", G = "\\b(0b[01]+)", _e = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", ye = (M = {}) => {
    const te = /^#![ ]*\//;
    return M.binary && (M.begin = T(
      te,
      /.*\b/,
      M.binary,
      /\b.*/
    )), o({
      scope: "meta",
      begin: te,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (ve, Ge) => {
        ve.index !== 0 && Ge.ignoreMatch();
      }
    }, M);
  }, z = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, fe = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [z]
  }, j = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [z]
  }, se = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, ue = function(M, te, ve = {}) {
    const Ge = o(
      {
        scope: "comment",
        begin: M,
        end: te,
        contains: []
      },
      ve
    );
    Ge.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const gt = I(
      // list of common 1 and 2 letter words in English
      "I",
      "a",
      "is",
      "so",
      "us",
      "to",
      "at",
      "if",
      "in",
      "it",
      "on",
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
      // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/,
      // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/
      // allow capitalized words at beginning of sentences
    );
    return Ge.contains.push(
      {
        // TODO: how to include ", (, ) without breaking grammars that use these for
        // comment delimiters?
        // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
        // ---
        // this tries to find sequences of 3 english words in a row (without any
        // "programming" type syntax) this gives us a strong signal that we've
        // TRULY found a comment - vs perhaps scanning with the wrong language.
        // It's possible to find something that LOOKS like the start of the
        // comment - but then if there is no readable text - good chance it is a
        // false match and not a comment.
        //
        // for a visual example please see:
        // https://github.com/highlightjs/highlight.js/issues/2827
        begin: T(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          gt,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), Ge;
  }, Te = ue("//", "$"), Ie = ue("/\\*", "\\*/"), Me = ue("#", "$"), he = {
    scope: "number",
    begin: A,
    relevance: 0
  }, Ee = {
    scope: "number",
    begin: Z,
    relevance: 0
  }, le = {
    scope: "number",
    begin: G,
    relevance: 0
  }, de = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      z,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [z]
      }
    ]
  }, V = {
    scope: "title",
    begin: U,
    relevance: 0
  }, O = {
    scope: "title",
    begin: _,
    relevance: 0
  }, W = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + _,
    relevance: 0
  };
  var Q = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: fe,
    BACKSLASH_ESCAPE: z,
    BINARY_NUMBER_MODE: le,
    BINARY_NUMBER_RE: G,
    COMMENT: ue,
    C_BLOCK_COMMENT_MODE: Ie,
    C_LINE_COMMENT_MODE: Te,
    C_NUMBER_MODE: Ee,
    C_NUMBER_RE: Z,
    END_SAME_AS_BEGIN: function(M) {
      return Object.assign(
        M,
        {
          /** @type {ModeCallback} */
          "on:begin": (te, ve) => {
            ve.data._beginMatch = te[1];
          },
          /** @type {ModeCallback} */
          "on:end": (te, ve) => {
            ve.data._beginMatch !== te[1] && ve.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: Me,
    IDENT_RE: U,
    MATCH_NOTHING_RE: $,
    METHOD_GUARD: W,
    NUMBER_MODE: he,
    NUMBER_RE: A,
    PHRASAL_WORDS_MODE: se,
    QUOTE_STRING_MODE: j,
    REGEXP_MODE: de,
    RE_STARTERS_RE: _e,
    SHEBANG: ye,
    TITLE_MODE: V,
    UNDERSCORE_IDENT_RE: _,
    UNDERSCORE_TITLE_MODE: O
  });
  function ie(M, te) {
    M.input[M.index - 1] === "." && te.ignoreMatch();
  }
  function Ae(M, te) {
    M.className !== void 0 && (M.scope = M.className, delete M.className);
  }
  function Fe(M, te) {
    te && M.beginKeywords && (M.begin = "\\b(" + M.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", M.__beforeBegin = ie, M.keywords = M.keywords || M.beginKeywords, delete M.beginKeywords, M.relevance === void 0 && (M.relevance = 0));
  }
  function Ye(M, te) {
    Array.isArray(M.illegal) && (M.illegal = I(...M.illegal));
  }
  function pt(M, te) {
    if (M.match) {
      if (M.begin || M.end) throw new Error("begin & end are not supported with match");
      M.begin = M.match, delete M.match;
    }
  }
  function zt(M, te) {
    M.relevance === void 0 && (M.relevance = 1);
  }
  const ht = (M, te) => {
    if (!M.beforeMatch) return;
    if (M.starts) throw new Error("beforeMatch cannot be used with starts");
    const ve = Object.assign({}, M);
    Object.keys(M).forEach((Ge) => {
      delete M[Ge];
    }), M.keywords = ve.keywords, M.begin = T(ve.beforeMatch, E(ve.begin)), M.starts = {
      relevance: 0,
      contains: [
        Object.assign(ve, { endsParent: !0 })
      ]
    }, M.relevance = 0, delete ve.beforeMatch;
  }, Yt = [
    "of",
    "and",
    "for",
    "in",
    "not",
    "or",
    "if",
    "then",
    "parent",
    // common variable name
    "list",
    // common variable name
    "value"
    // common variable name
  ], gn = "keyword";
  function At(M, te, ve = gn) {
    const Ge = /* @__PURE__ */ Object.create(null);
    return typeof M == "string" ? gt(ve, M.split(" ")) : Array.isArray(M) ? gt(ve, M) : Object.keys(M).forEach(function(ct) {
      Object.assign(
        Ge,
        At(M[ct], te, ct)
      );
    }), Ge;
    function gt(ct, Ce) {
      te && (Ce = Ce.map((Re) => Re.toLowerCase())), Ce.forEach(function(Re) {
        const Je = Re.split("|");
        Ge[Je[0]] = [ct, vt(Je[0], Je[1])];
      });
    }
  }
  function vt(M, te) {
    return te ? Number(te) : Vt(M) ? 0 : 1;
  }
  function Vt(M) {
    return Yt.includes(M.toLowerCase());
  }
  const Mt = {}, Ft = (M) => {
    console.error(M);
  }, Qt = (M, ...te) => {
    console.log(`WARN: ${M}`, ...te);
  }, en = (M, te) => {
    Mt[`${M}/${te}`] || (console.log(`Deprecated as of ${M}. ${te}`), Mt[`${M}/${te}`] = !0);
  }, Wt = new Error();
  function jt(M, te, { key: ve }) {
    let Ge = 0;
    const gt = M[ve], ct = {}, Ce = {};
    for (let Re = 1; Re <= te.length; Re++)
      Ce[Re + Ge] = gt[Re], ct[Re + Ge] = !0, Ge += F(te[Re - 1]);
    M[ve] = Ce, M[ve]._emit = ct, M[ve]._multi = !0;
  }
  function zr(M) {
    if (Array.isArray(M.begin)) {
      if (M.skip || M.excludeBegin || M.returnBegin)
        throw Ft("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), Wt;
      if (typeof M.beginScope != "object" || M.beginScope === null)
        throw Ft("beginScope must be object"), Wt;
      jt(M, M.begin, { key: "beginScope" }), M.begin = H(M.begin, { joinWith: "" });
    }
  }
  function Wr(M) {
    if (Array.isArray(M.end)) {
      if (M.skip || M.excludeEnd || M.returnEnd)
        throw Ft("skip, excludeEnd, returnEnd not compatible with endScope: {}"), Wt;
      if (typeof M.endScope != "object" || M.endScope === null)
        throw Ft("endScope must be object"), Wt;
      jt(M, M.end, { key: "endScope" }), M.end = H(M.end, { joinWith: "" });
    }
  }
  function Xr(M) {
    M.scope && typeof M.scope == "object" && M.scope !== null && (M.beginScope = M.scope, delete M.scope);
  }
  function Yr(M) {
    Xr(M), typeof M.beginScope == "string" && (M.beginScope = { _wrap: M.beginScope }), typeof M.endScope == "string" && (M.endScope = { _wrap: M.endScope }), zr(M), Wr(M);
  }
  function Vr(M) {
    function te(Ce, Re) {
      return new RegExp(
        v(Ce),
        "m" + (M.case_insensitive ? "i" : "") + (M.unicodeRegex ? "u" : "") + (Re ? "g" : "")
      );
    }
    class ve {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(Re, Je) {
        Je.position = this.position++, this.matchIndexes[this.matchAt] = Je, this.regexes.push([Je, Re]), this.matchAt += F(Re) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const Re = this.regexes.map((Je) => Je[1]);
        this.matcherRe = te(H(Re, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(Re) {
        this.matcherRe.lastIndex = this.lastIndex;
        const Je = this.matcherRe.exec(Re);
        if (!Je)
          return null;
        const Ut = Je.findIndex((xi, ea) => ea > 0 && xi !== void 0), $t = this.matchIndexes[Ut];
        return Je.splice(0, Ut), Object.assign(Je, $t);
      }
    }
    class Ge {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(Re) {
        if (this.multiRegexes[Re]) return this.multiRegexes[Re];
        const Je = new ve();
        return this.rules.slice(Re).forEach(([Ut, $t]) => Je.addRule(Ut, $t)), Je.compile(), this.multiRegexes[Re] = Je, Je;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(Re, Je) {
        this.rules.push([Re, Je]), Je.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(Re) {
        const Je = this.getMatcher(this.regexIndex);
        Je.lastIndex = this.lastIndex;
        let Ut = Je.exec(Re);
        if (this.resumingScanAtSamePosition() && !(Ut && Ut.index === this.lastIndex)) {
          const $t = this.getMatcher(0);
          $t.lastIndex = this.lastIndex + 1, Ut = $t.exec(Re);
        }
        return Ut && (this.regexIndex += Ut.position + 1, this.regexIndex === this.count && this.considerAll()), Ut;
      }
    }
    function gt(Ce) {
      const Re = new Ge();
      return Ce.contains.forEach((Je) => Re.addRule(Je.begin, { rule: Je, type: "begin" })), Ce.terminatorEnd && Re.addRule(Ce.terminatorEnd, { type: "end" }), Ce.illegal && Re.addRule(Ce.illegal, { type: "illegal" }), Re;
    }
    function ct(Ce, Re) {
      const Je = (
        /** @type CompiledMode */
        Ce
      );
      if (Ce.isCompiled) return Je;
      [
        Ae,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        pt,
        Yr,
        ht
      ].forEach(($t) => $t(Ce, Re)), M.compilerExtensions.forEach(($t) => $t(Ce, Re)), Ce.__beforeBegin = null, [
        Fe,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        Ye,
        // default to 1 relevance if not specified
        zt
      ].forEach(($t) => $t(Ce, Re)), Ce.isCompiled = !0;
      let Ut = null;
      return typeof Ce.keywords == "object" && Ce.keywords.$pattern && (Ce.keywords = Object.assign({}, Ce.keywords), Ut = Ce.keywords.$pattern, delete Ce.keywords.$pattern), Ut = Ut || /\w+/, Ce.keywords && (Ce.keywords = At(Ce.keywords, M.case_insensitive)), Je.keywordPatternRe = te(Ut, !0), Re && (Ce.begin || (Ce.begin = /\B|\b/), Je.beginRe = te(Je.begin), !Ce.end && !Ce.endsWithParent && (Ce.end = /\B|\b/), Ce.end && (Je.endRe = te(Je.end)), Je.terminatorEnd = v(Je.end) || "", Ce.endsWithParent && Re.terminatorEnd && (Je.terminatorEnd += (Ce.end ? "|" : "") + Re.terminatorEnd)), Ce.illegal && (Je.illegalRe = te(
        /** @type {RegExp | string} */
        Ce.illegal
      )), Ce.contains || (Ce.contains = []), Ce.contains = [].concat(...Ce.contains.map(function($t) {
        return ee($t === "self" ? Ce : $t);
      })), Ce.contains.forEach(function($t) {
        ct(
          /** @type Mode */
          $t,
          Je
        );
      }), Ce.starts && ct(Ce.starts, Re), Je.matcher = gt(Je), Je;
    }
    if (M.compilerExtensions || (M.compilerExtensions = []), M.contains && M.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return M.classNameAliases = o(M.classNameAliases || {}), ct(
      /** @type Mode */
      M
    );
  }
  function C(M) {
    return M ? M.endsWithParent || C(M.starts) : !1;
  }
  function ee(M) {
    return M.variants && !M.cachedVariants && (M.cachedVariants = M.variants.map(function(te) {
      return o(M, { variants: null }, te);
    })), M.cachedVariants ? M.cachedVariants : C(M) ? o(M, { starts: M.starts ? o(M.starts) : null }) : Object.isFrozen(M) ? o(M) : M;
  }
  var pe = "11.11.1";
  class xe extends Error {
    constructor(te, ve) {
      super(te), this.name = "HTMLInjectionError", this.html = ve;
    }
  }
  const Se = n, at = o, _t = Symbol("nomatch"), tn = 7, sr = function(M) {
    const te = /* @__PURE__ */ Object.create(null), ve = /* @__PURE__ */ Object.create(null), Ge = [];
    let gt = !0;
    const ct = "Could not find the language '{}', did you forget to load/include a language module?", Ce = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let Re = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: h
    };
    function Je(ge) {
      return Re.noHighlightRe.test(ge);
    }
    function Ut(ge) {
      let Ue = ge.className + " ";
      Ue += ge.parentNode ? ge.parentNode.className : "";
      const it = Re.languageDetectRe.exec(Ue);
      if (it) {
        const bt = Nr(it[1]);
        return bt || (Qt(ct.replace("{}", it[1])), Qt("Falling back to no-highlight mode for this block.", ge)), bt ? it[1] : "no-highlight";
      }
      return Ue.split(/\s+/).find((bt) => Je(bt) || Nr(bt));
    }
    function $t(ge, Ue, it) {
      let bt = "", Bt = "";
      typeof Ue == "object" ? (bt = ge, it = Ue.ignoreIllegals, Bt = Ue.language) : (en("10.7.0", "highlight(lang, code, ...args) has been deprecated."), en("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), Bt = ge, bt = Ue), it === void 0 && (it = !0);
      const Cn = {
        code: bt,
        language: Bt
      };
      po("before:highlight", Cn);
      const ur = Cn.result ? Cn.result : xi(Cn.language, Cn.code, it);
      return ur.code = Cn.code, po("after:highlight", ur), ur;
    }
    function xi(ge, Ue, it, bt) {
      const Bt = /* @__PURE__ */ Object.create(null);
      function Cn(Oe, Pe) {
        return Oe.keywords[Pe];
      }
      function ur() {
        if (!Ve.keywords) {
          Xt.addText(Ot);
          return;
        }
        let Oe = 0;
        Ve.keywordPatternRe.lastIndex = 0;
        let Pe = Ve.keywordPatternRe.exec(Ot), et = "";
        for (; Pe; ) {
          et += Ot.substring(Oe, Pe.index);
          const dt = Ln.case_insensitive ? Pe[0].toLowerCase() : Pe[0], nn = Cn(Ve, dt);
          if (nn) {
            const [lr, El] = nn;
            if (Xt.addText(et), et = "", Bt[dt] = (Bt[dt] || 0) + 1, Bt[dt] <= tn && (Pi += El), lr.startsWith("_"))
              et += Pe[0];
            else {
              const _l = Ln.classNameAliases[lr] || lr;
              yn(Pe[0], _l);
            }
          } else
            et += Pe[0];
          Oe = Ve.keywordPatternRe.lastIndex, Pe = Ve.keywordPatternRe.exec(Ot);
        }
        et += Ot.substring(Oe), Xt.addText(et);
      }
      function Li() {
        if (Ot === "") return;
        let Oe = null;
        if (typeof Ve.subLanguage == "string") {
          if (!te[Ve.subLanguage]) {
            Xt.addText(Ot);
            return;
          }
          Oe = xi(Ve.subLanguage, Ot, !0, oa[Ve.subLanguage]), oa[Ve.subLanguage] = /** @type {CompiledMode} */
          Oe._top;
        } else
          Oe = ta(Ot, Ve.subLanguage.length ? Ve.subLanguage : null);
        Ve.relevance > 0 && (Pi += Oe.relevance), Xt.__addSublanguage(Oe._emitter, Oe.language);
      }
      function ln() {
        Ve.subLanguage != null ? Li() : ur(), Ot = "";
      }
      function yn(Oe, Pe) {
        Oe !== "" && (Xt.startScope(Pe), Xt.addText(Oe), Xt.endScope());
      }
      function ls(Oe, Pe) {
        let et = 1;
        const dt = Pe.length - 1;
        for (; et <= dt; ) {
          if (!Oe._emit[et]) {
            et++;
            continue;
          }
          const nn = Ln.classNameAliases[Oe[et]] || Oe[et], lr = Pe[et];
          nn ? yn(lr, nn) : (Ot = lr, ur(), Ot = ""), et++;
        }
      }
      function ra(Oe, Pe) {
        return Oe.scope && typeof Oe.scope == "string" && Xt.openNode(Ln.classNameAliases[Oe.scope] || Oe.scope), Oe.beginScope && (Oe.beginScope._wrap ? (yn(Ot, Ln.classNameAliases[Oe.beginScope._wrap] || Oe.beginScope._wrap), Ot = "") : Oe.beginScope._multi && (ls(Oe.beginScope, Pe), Ot = "")), Ve = Object.create(Oe, { parent: { value: Ve } }), Ve;
      }
      function Mi(Oe, Pe, et) {
        let dt = P(Oe.endRe, et);
        if (dt) {
          if (Oe["on:end"]) {
            const nn = new t(Oe);
            Oe["on:end"](Pe, nn), nn.isMatchIgnored && (dt = !1);
          }
          if (dt) {
            for (; Oe.endsParent && Oe.parent; )
              Oe = Oe.parent;
            return Oe;
          }
        }
        if (Oe.endsWithParent)
          return Mi(Oe.parent, Pe, et);
      }
      function fs(Oe) {
        return Ve.matcher.regexIndex === 0 ? (Ot += Oe[0], 1) : (vo = !0, 0);
      }
      function ml(Oe) {
        const Pe = Oe[0], et = Oe.rule, dt = new t(et), nn = [et.__beforeBegin, et["on:begin"]];
        for (const lr of nn)
          if (lr && (lr(Oe, dt), dt.isMatchIgnored))
            return fs(Pe);
        return et.skip ? Ot += Pe : (et.excludeBegin && (Ot += Pe), ln(), !et.returnBegin && !et.excludeBegin && (Ot = Pe)), ra(et, Oe), et.returnBegin ? 0 : Pe.length;
      }
      function cs(Oe) {
        const Pe = Oe[0], et = Ue.substring(Oe.index), dt = Mi(Ve, Oe, et);
        if (!dt)
          return _t;
        const nn = Ve;
        Ve.endScope && Ve.endScope._wrap ? (ln(), yn(Pe, Ve.endScope._wrap)) : Ve.endScope && Ve.endScope._multi ? (ln(), ls(Ve.endScope, Oe)) : nn.skip ? Ot += Pe : (nn.returnEnd || nn.excludeEnd || (Ot += Pe), ln(), nn.excludeEnd && (Ot = Pe));
        do
          Ve.scope && Xt.closeNode(), !Ve.skip && !Ve.subLanguage && (Pi += Ve.relevance), Ve = Ve.parent;
        while (Ve !== dt.parent);
        return dt.starts && ra(dt.starts, Oe), nn.returnEnd ? 0 : Pe.length;
      }
      function ds() {
        const Oe = [];
        for (let Pe = Ve; Pe !== Ln; Pe = Pe.parent)
          Pe.scope && Oe.unshift(Pe.scope);
        Oe.forEach((Pe) => Xt.openNode(Pe));
      }
      let pi = {};
      function ps(Oe, Pe) {
        const et = Pe && Pe[0];
        if (Ot += Oe, et == null)
          return ln(), 0;
        if (pi.type === "begin" && Pe.type === "end" && pi.index === Pe.index && et === "") {
          if (Ot += Ue.slice(Pe.index, Pe.index + 1), !gt) {
            const dt = new Error(`0 width match regex (${ge})`);
            throw dt.languageName = ge, dt.badRule = pi.rule, dt;
          }
          return 1;
        }
        if (pi = Pe, Pe.type === "begin")
          return ml(Pe);
        if (Pe.type === "illegal" && !it) {
          const dt = new Error('Illegal lexeme "' + et + '" for mode "' + (Ve.scope || "<unnamed>") + '"');
          throw dt.mode = Ve, dt;
        } else if (Pe.type === "end") {
          const dt = cs(Pe);
          if (dt !== _t)
            return dt;
        }
        if (Pe.type === "illegal" && et === "")
          return Ot += `
`, 1;
        if (ho > 1e5 && ho > Pe.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return Ot += et, et.length;
      }
      const Ln = Nr(ge);
      if (!Ln)
        throw Ft(ct.replace("{}", ge)), new Error('Unknown language: "' + ge + '"');
      const ia = Vr(Ln);
      let Di = "", Ve = bt || ia;
      const oa = {}, Xt = new Re.__emitter(Re);
      ds();
      let Ot = "", Pi = 0, Sr = 0, ho = 0, vo = !1;
      try {
        if (Ln.__emitTokens)
          Ln.__emitTokens(Ue, Xt);
        else {
          for (Ve.matcher.considerAll(); ; ) {
            ho++, vo ? vo = !1 : Ve.matcher.considerAll(), Ve.matcher.lastIndex = Sr;
            const Oe = Ve.matcher.exec(Ue);
            if (!Oe) break;
            const Pe = Ue.substring(Sr, Oe.index), et = ps(Pe, Oe);
            Sr = Oe.index + et;
          }
          ps(Ue.substring(Sr));
        }
        return Xt.finalize(), Di = Xt.toHTML(), {
          language: ge,
          value: Di,
          relevance: Pi,
          illegal: !1,
          _emitter: Xt,
          _top: Ve
        };
      } catch (Oe) {
        if (Oe.message && Oe.message.includes("Illegal"))
          return {
            language: ge,
            value: Se(Ue),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: Oe.message,
              index: Sr,
              context: Ue.slice(Sr - 100, Sr + 100),
              mode: Oe.mode,
              resultSoFar: Di
            },
            _emitter: Xt
          };
        if (gt)
          return {
            language: ge,
            value: Se(Ue),
            illegal: !1,
            relevance: 0,
            errorRaised: Oe,
            _emitter: Xt,
            _top: Ve
          };
        throw Oe;
      }
    }
    function ea(ge) {
      const Ue = {
        value: Se(ge),
        illegal: !1,
        relevance: 0,
        _top: Ce,
        _emitter: new Re.__emitter(Re)
      };
      return Ue._emitter.addText(ge), Ue;
    }
    function ta(ge, Ue) {
      Ue = Ue || Re.languages || Object.keys(te);
      const it = ea(ge), bt = Ue.filter(Nr).filter(ss).map(
        (ln) => xi(ln, ge, !1)
      );
      bt.unshift(it);
      const Bt = bt.sort((ln, yn) => {
        if (ln.relevance !== yn.relevance) return yn.relevance - ln.relevance;
        if (ln.language && yn.language) {
          if (Nr(ln.language).supersetOf === yn.language)
            return 1;
          if (Nr(yn.language).supersetOf === ln.language)
            return -1;
        }
        return 0;
      }), [Cn, ur] = Bt, Li = Cn;
      return Li.secondBest = ur, Li;
    }
    function ll(ge, Ue, it) {
      const bt = Ue && ve[Ue] || it;
      ge.classList.add("hljs"), ge.classList.add(`language-${bt}`);
    }
    function na(ge) {
      let Ue = null;
      const it = Ut(ge);
      if (Je(it)) return;
      if (po(
        "before:highlightElement",
        { el: ge, language: it }
      ), ge.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", ge);
        return;
      }
      if (ge.children.length > 0 && (Re.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(ge)), Re.throwUnescapedHTML))
        throw new xe(
          "One of your code blocks includes unescaped HTML.",
          ge.innerHTML
        );
      Ue = ge;
      const bt = Ue.textContent, Bt = it ? $t(bt, { language: it, ignoreIllegals: !0 }) : ta(bt);
      ge.innerHTML = Bt.value, ge.dataset.highlighted = "yes", ll(ge, it, Bt.language), ge.result = {
        language: Bt.language,
        // TODO: remove with version 11.0
        re: Bt.relevance,
        relevance: Bt.relevance
      }, Bt.secondBest && (ge.secondBest = {
        language: Bt.secondBest.language,
        relevance: Bt.secondBest.relevance
      }), po("after:highlightElement", { el: ge, result: Bt, text: bt });
    }
    function fl(ge) {
      Re = at(Re, ge);
    }
    const cl = () => {
      fo(), en("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function os() {
      fo(), en("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let as = !1;
    function fo() {
      function ge() {
        fo();
      }
      if (document.readyState === "loading") {
        as || window.addEventListener("DOMContentLoaded", ge, !1), as = !0;
        return;
      }
      document.querySelectorAll(Re.cssSelector).forEach(na);
    }
    function dl(ge, Ue) {
      let it = null;
      try {
        it = Ue(M);
      } catch (bt) {
        if (Ft("Language definition for '{}' could not be registered.".replace("{}", ge)), gt)
          Ft(bt);
        else
          throw bt;
        it = Ce;
      }
      it.name || (it.name = ge), te[ge] = it, it.rawDefinition = Ue.bind(null, M), it.aliases && Ci(it.aliases, { languageName: ge });
    }
    function pl(ge) {
      delete te[ge];
      for (const Ue of Object.keys(ve))
        ve[Ue] === ge && delete ve[Ue];
    }
    function hl() {
      return Object.keys(te);
    }
    function Nr(ge) {
      return ge = (ge || "").toLowerCase(), te[ge] || te[ve[ge]];
    }
    function Ci(ge, { languageName: Ue }) {
      typeof ge == "string" && (ge = [ge]), ge.forEach((it) => {
        ve[it.toLowerCase()] = Ue;
      });
    }
    function ss(ge) {
      const Ue = Nr(ge);
      return Ue && !Ue.disableAutodetect;
    }
    function co(ge) {
      ge["before:highlightBlock"] && !ge["before:highlightElement"] && (ge["before:highlightElement"] = (Ue) => {
        ge["before:highlightBlock"](
          Object.assign({ block: Ue.el }, Ue)
        );
      }), ge["after:highlightBlock"] && !ge["after:highlightElement"] && (ge["after:highlightElement"] = (Ue) => {
        ge["after:highlightBlock"](
          Object.assign({ block: Ue.el }, Ue)
        );
      });
    }
    function vl(ge) {
      co(ge), Ge.push(ge);
    }
    function gl(ge) {
      const Ue = Ge.indexOf(ge);
      Ue !== -1 && Ge.splice(Ue, 1);
    }
    function po(ge, Ue) {
      const it = ge;
      Ge.forEach(function(bt) {
        bt[it] && bt[it](Ue);
      });
    }
    function us(ge) {
      return en("10.7.0", "highlightBlock will be removed entirely in v12.0"), en("10.7.0", "Please use highlightElement now."), na(ge);
    }
    Object.assign(M, {
      highlight: $t,
      highlightAuto: ta,
      highlightAll: fo,
      highlightElement: na,
      // TODO: Remove with v12 API
      highlightBlock: us,
      configure: fl,
      initHighlighting: cl,
      initHighlightingOnLoad: os,
      registerLanguage: dl,
      unregisterLanguage: pl,
      listLanguages: hl,
      getLanguage: Nr,
      registerAliases: Ci,
      autoDetection: ss,
      inherit: at,
      addPlugin: vl,
      removePlugin: gl
    }), M.debugMode = function() {
      gt = !1;
    }, M.safeMode = function() {
      gt = !0;
    }, M.versionString = pe, M.regex = {
      concat: T,
      lookahead: E,
      either: I,
      optional: R,
      anyNumberOfTimes: b
    };
    for (const ge in Q)
      typeof Q[ge] == "object" && e(Q[ge]);
    return Object.assign(M, Q), M;
  }, xt = sr({});
  return xt.newInstance = () => sr({}), Ff = xt, xt.HighlightJS = xt, xt.default = xt, Ff;
}
var Zw = /* @__PURE__ */ Jw();
const nl = /* @__PURE__ */ Yu(Zw);
function Qw(e) {
  const t = e.COMMENT("--", "$"), n = "[a-zA-Z_][a-zA-Z_0-9$]*", o = "\\$([a-zA-Z_]?|[a-zA-Z_][a-zA-Z_0-9]*)\\$", a = "<<\\s*" + n + "\\s*>>", s = (
    // https://www.postgresql.org/docs/11/static/sql-keywords-appendix.html
    // https://www.postgresql.org/docs/11/static/sql-commands.html
    // SQL commands (starting words)
    "ABORT ALTER ANALYZE BEGIN CALL CHECKPOINT|10 CLOSE CLUSTER COMMENT COMMIT COPY CREATE DEALLOCATE DECLARE DELETE DISCARD DO DROP END EXECUTE EXPLAIN FETCH GRANT IMPORT INSERT LISTEN LOAD LOCK MOVE NOTIFY PREPARE REASSIGN|10 REFRESH REINDEX RELEASE RESET REVOKE ROLLBACK SAVEPOINT SECURITY SELECT SET SHOW START TRUNCATE UNLISTEN|10 UPDATE VACUUM|10 VALUES AGGREGATE COLLATION CONVERSION|10 DATABASE DEFAULT PRIVILEGES DOMAIN TRIGGER EXTENSION FOREIGN WRAPPER|10 TABLE FUNCTION GROUP LANGUAGE LARGE OBJECT MATERIALIZED VIEW OPERATOR CLASS FAMILY POLICY PUBLICATION|10 ROLE RULE SCHEMA SEQUENCE SERVER STATISTICS SUBSCRIPTION SYSTEM TABLESPACE CONFIGURATION DICTIONARY PARSER TEMPLATE TYPE USER MAPPING PREPARED ACCESS METHOD CAST AS TRANSFORM TRANSACTION OWNED TO INTO SESSION AUTHORIZATION INDEX PROCEDURE ASSERTION ALL ANALYSE AND ANY ARRAY ASC ASYMMETRIC|10 BOTH CASE CHECK COLLATE COLUMN CONCURRENTLY|10 CONSTRAINT CROSS DEFERRABLE RANGE DESC DISTINCT ELSE EXCEPT FOR FREEZE|10 FROM FULL HAVING ILIKE IN INITIALLY INNER INTERSECT IS ISNULL JOIN LATERAL LEADING LIKE LIMIT NATURAL NOT NOTNULL NULL OFFSET ON ONLY OR ORDER OUTER OVERLAPS PLACING PRIMARY REFERENCES RETURNING SIMILAR SOME SYMMETRIC TABLESAMPLE THEN TRAILING UNION UNIQUE USING VARIADIC|10 VERBOSE WHEN WHERE WINDOW WITH BY RETURNS INOUT OUT SETOF|10 IF STRICT CURRENT CONTINUE OWNER LOCATION OVER PARTITION WITHIN BETWEEN ESCAPE EXTERNAL INVOKER DEFINER WORK RENAME VERSION CONNECTION CONNECT TABLES TEMP TEMPORARY FUNCTIONS SEQUENCES TYPES SCHEMAS OPTION CASCADE RESTRICT ADD ADMIN EXISTS VALID VALIDATE ENABLE DISABLE REPLICA|10 ALWAYS PASSING COLUMNS PATH REF VALUE OVERRIDING IMMUTABLE STABLE VOLATILE BEFORE AFTER EACH ROW PROCEDURAL ROUTINE NO HANDLER VALIDATOR OPTIONS STORAGE OIDS|10 WITHOUT INHERIT DEPENDS CALLED INPUT LEAKPROOF|10 COST ROWS NOWAIT SEARCH UNTIL ENCRYPTED|10 PASSWORD CONFLICT|10 INSTEAD INHERITS CHARACTERISTICS WRITE CURSOR ALSO STATEMENT SHARE EXCLUSIVE INLINE ISOLATION REPEATABLE READ COMMITTED SERIALIZABLE UNCOMMITTED LOCAL GLOBAL SQL PROCEDURES RECURSIVE SNAPSHOT ROLLUP CUBE TRUSTED|10 INCLUDE FOLLOWING PRECEDING UNBOUNDED RANGE GROUPS UNENCRYPTED|10 SYSID FORMAT DELIMITER HEADER QUOTE ENCODING FILTER OFF FORCE_QUOTE FORCE_NOT_NULL FORCE_NULL COSTS BUFFERS TIMING SUMMARY DISABLE_PAGE_SKIPPING RESTART CYCLE GENERATED IDENTITY DEFERRED IMMEDIATE LEVEL LOGGED UNLOGGED OF NOTHING NONE EXCLUDE ATTRIBUTE USAGE ROUTINES TRUE FALSE NAN INFINITY "
  ), l = (
    // only those not in keywrods already
    "SUPERUSER NOSUPERUSER CREATEDB NOCREATEDB CREATEROLE NOCREATEROLE INHERIT NOINHERIT LOGIN NOLOGIN REPLICATION NOREPLICATION BYPASSRLS NOBYPASSRLS "
  ), f = "ALIAS BEGIN CONSTANT DECLARE END EXCEPTION RETURN PERFORM|10 RAISE GET DIAGNOSTICS STACKED|10 FOREACH LOOP ELSIF EXIT WHILE REVERSE SLICE DEBUG LOG INFO NOTICE WARNING ASSERT OPEN ", c = (
    // https://www.postgresql.org/docs/11/static/datatype.html
    "BIGINT INT8 BIGSERIAL SERIAL8 BIT VARYING VARBIT BOOLEAN BOOL BOX BYTEA CHARACTER CHAR VARCHAR CIDR CIRCLE DATE DOUBLE PRECISION FLOAT8 FLOAT INET INTEGER INT INT4 INTERVAL JSON JSONB LINE LSEG|10 MACADDR MACADDR8 MONEY NUMERIC DEC DECIMAL PATH POINT POLYGON REAL FLOAT4 SMALLINT INT2 SMALLSERIAL|10 SERIAL2|10 SERIAL|10 SERIAL4|10 TEXT TIME ZONE TIMETZ|10 TIMESTAMP TIMESTAMPTZ|10 TSQUERY|10 TSVECTOR|10 TXID_SNAPSHOT|10 UUID XML NATIONAL NCHAR INT4RANGE|10 INT8RANGE|10 NUMRANGE|10 TSRANGE|10 TSTZRANGE|10 DATERANGE|10 ANYELEMENT ANYARRAY ANYNONARRAY ANYENUM ANYRANGE CSTRING INTERNAL RECORD PG_DDL_COMMAND VOID UNKNOWN OPAQUE REFCURSOR NAME OID REGPROC|10 REGPROCEDURE|10 REGOPER|10 REGOPERATOR|10 REGCLASS|10 REGTYPE|10 REGROLE|10 REGNAMESPACE|10 REGCONFIG|10 REGDICTIONARY|10 "
  ), p = c.trim().split(" ").map(function(T) {
    return T.split("|")[0];
  }).join("|"), h = "CURRENT_TIME CURRENT_TIMESTAMP CURRENT_USER CURRENT_CATALOG|10 CURRENT_DATE LOCALTIME LOCALTIMESTAMP CURRENT_ROLE|10 CURRENT_SCHEMA|10 SESSION_USER PUBLIC ", v = "FOUND NEW OLD TG_NAME|10 TG_WHEN|10 TG_LEVEL|10 TG_OP|10 TG_RELID|10 TG_RELNAME|10 TG_TABLE_NAME|10 TG_TABLE_SCHEMA|10 TG_NARGS|10 TG_ARGV|10 TG_EVENT|10 TG_TAG|10 ROW_COUNT RESULT_OID|10 PG_CONTEXT|10 RETURNED_SQLSTATE COLUMN_NAME CONSTRAINT_NAME PG_DATATYPE_NAME|10 MESSAGE_TEXT TABLE_NAME SCHEMA_NAME PG_EXCEPTION_DETAIL|10 PG_EXCEPTION_HINT|10 PG_EXCEPTION_CONTEXT|10 ", E = (
    // exceptions https://www.postgresql.org/docs/current/static/errcodes-appendix.html
    "SQLSTATE SQLERRM|10 SUCCESSFUL_COMPLETION WARNING DYNAMIC_RESULT_SETS_RETURNED IMPLICIT_ZERO_BIT_PADDING NULL_VALUE_ELIMINATED_IN_SET_FUNCTION PRIVILEGE_NOT_GRANTED PRIVILEGE_NOT_REVOKED STRING_DATA_RIGHT_TRUNCATION DEPRECATED_FEATURE NO_DATA NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED SQL_STATEMENT_NOT_YET_COMPLETE CONNECTION_EXCEPTION CONNECTION_DOES_NOT_EXIST CONNECTION_FAILURE SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION TRANSACTION_RESOLUTION_UNKNOWN PROTOCOL_VIOLATION TRIGGERED_ACTION_EXCEPTION FEATURE_NOT_SUPPORTED INVALID_TRANSACTION_INITIATION LOCATOR_EXCEPTION INVALID_LOCATOR_SPECIFICATION INVALID_GRANTOR INVALID_GRANT_OPERATION INVALID_ROLE_SPECIFICATION DIAGNOSTICS_EXCEPTION STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER CASE_NOT_FOUND CARDINALITY_VIOLATION DATA_EXCEPTION ARRAY_SUBSCRIPT_ERROR CHARACTER_NOT_IN_REPERTOIRE DATETIME_FIELD_OVERFLOW DIVISION_BY_ZERO ERROR_IN_ASSIGNMENT ESCAPE_CHARACTER_CONFLICT INDICATOR_OVERFLOW INTERVAL_FIELD_OVERFLOW INVALID_ARGUMENT_FOR_LOGARITHM INVALID_ARGUMENT_FOR_NTILE_FUNCTION INVALID_ARGUMENT_FOR_NTH_VALUE_FUNCTION INVALID_ARGUMENT_FOR_POWER_FUNCTION INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION INVALID_CHARACTER_VALUE_FOR_CAST INVALID_DATETIME_FORMAT INVALID_ESCAPE_CHARACTER INVALID_ESCAPE_OCTET INVALID_ESCAPE_SEQUENCE NONSTANDARD_USE_OF_ESCAPE_CHARACTER INVALID_INDICATOR_PARAMETER_VALUE INVALID_PARAMETER_VALUE INVALID_REGULAR_EXPRESSION INVALID_ROW_COUNT_IN_LIMIT_CLAUSE INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE INVALID_TABLESAMPLE_ARGUMENT INVALID_TABLESAMPLE_REPEAT INVALID_TIME_ZONE_DISPLACEMENT_VALUE INVALID_USE_OF_ESCAPE_CHARACTER MOST_SPECIFIC_TYPE_MISMATCH NULL_VALUE_NOT_ALLOWED NULL_VALUE_NO_INDICATOR_PARAMETER NUMERIC_VALUE_OUT_OF_RANGE SEQUENCE_GENERATOR_LIMIT_EXCEEDED STRING_DATA_LENGTH_MISMATCH STRING_DATA_RIGHT_TRUNCATION SUBSTRING_ERROR TRIM_ERROR UNTERMINATED_C_STRING ZERO_LENGTH_CHARACTER_STRING FLOATING_POINT_EXCEPTION INVALID_TEXT_REPRESENTATION INVALID_BINARY_REPRESENTATION BAD_COPY_FILE_FORMAT UNTRANSLATABLE_CHARACTER NOT_AN_XML_DOCUMENT INVALID_XML_DOCUMENT INVALID_XML_CONTENT INVALID_XML_COMMENT INVALID_XML_PROCESSING_INSTRUCTION INTEGRITY_CONSTRAINT_VIOLATION RESTRICT_VIOLATION NOT_NULL_VIOLATION FOREIGN_KEY_VIOLATION UNIQUE_VIOLATION CHECK_VIOLATION EXCLUSION_VIOLATION INVALID_CURSOR_STATE INVALID_TRANSACTION_STATE ACTIVE_SQL_TRANSACTION BRANCH_TRANSACTION_ALREADY_ACTIVE HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION READ_ONLY_SQL_TRANSACTION SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED NO_ACTIVE_SQL_TRANSACTION IN_FAILED_SQL_TRANSACTION IDLE_IN_TRANSACTION_SESSION_TIMEOUT INVALID_SQL_STATEMENT_NAME TRIGGERED_DATA_CHANGE_VIOLATION INVALID_AUTHORIZATION_SPECIFICATION INVALID_PASSWORD DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST DEPENDENT_OBJECTS_STILL_EXIST INVALID_TRANSACTION_TERMINATION SQL_ROUTINE_EXCEPTION FUNCTION_EXECUTED_NO_RETURN_STATEMENT MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED INVALID_CURSOR_NAME EXTERNAL_ROUTINE_EXCEPTION CONTAINING_SQL_NOT_PERMITTED MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED EXTERNAL_ROUTINE_INVOCATION_EXCEPTION INVALID_SQLSTATE_RETURNED NULL_VALUE_NOT_ALLOWED TRIGGER_PROTOCOL_VIOLATED SRF_PROTOCOL_VIOLATED EVENT_TRIGGER_PROTOCOL_VIOLATED SAVEPOINT_EXCEPTION INVALID_SAVEPOINT_SPECIFICATION INVALID_CATALOG_NAME INVALID_SCHEMA_NAME TRANSACTION_ROLLBACK TRANSACTION_INTEGRITY_CONSTRAINT_VIOLATION SERIALIZATION_FAILURE STATEMENT_COMPLETION_UNKNOWN DEADLOCK_DETECTED SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION SYNTAX_ERROR INSUFFICIENT_PRIVILEGE CANNOT_COERCE GROUPING_ERROR WINDOWING_ERROR INVALID_RECURSION INVALID_FOREIGN_KEY INVALID_NAME NAME_TOO_LONG RESERVED_NAME DATATYPE_MISMATCH INDETERMINATE_DATATYPE COLLATION_MISMATCH INDETERMINATE_COLLATION WRONG_OBJECT_TYPE GENERATED_ALWAYS UNDEFINED_COLUMN UNDEFINED_FUNCTION UNDEFINED_TABLE UNDEFINED_PARAMETER UNDEFINED_OBJECT DUPLICATE_COLUMN DUPLICATE_CURSOR DUPLICATE_DATABASE DUPLICATE_FUNCTION DUPLICATE_PREPARED_STATEMENT DUPLICATE_SCHEMA DUPLICATE_TABLE DUPLICATE_ALIAS DUPLICATE_OBJECT AMBIGUOUS_COLUMN AMBIGUOUS_FUNCTION AMBIGUOUS_PARAMETER AMBIGUOUS_ALIAS INVALID_COLUMN_REFERENCE INVALID_COLUMN_DEFINITION INVALID_CURSOR_DEFINITION INVALID_DATABASE_DEFINITION INVALID_FUNCTION_DEFINITION INVALID_PREPARED_STATEMENT_DEFINITION INVALID_SCHEMA_DEFINITION INVALID_TABLE_DEFINITION INVALID_OBJECT_DEFINITION WITH_CHECK_OPTION_VIOLATION INSUFFICIENT_RESOURCES DISK_FULL OUT_OF_MEMORY TOO_MANY_CONNECTIONS CONFIGURATION_LIMIT_EXCEEDED PROGRAM_LIMIT_EXCEEDED STATEMENT_TOO_COMPLEX TOO_MANY_COLUMNS TOO_MANY_ARGUMENTS OBJECT_NOT_IN_PREREQUISITE_STATE OBJECT_IN_USE CANT_CHANGE_RUNTIME_PARAM LOCK_NOT_AVAILABLE OPERATOR_INTERVENTION QUERY_CANCELED ADMIN_SHUTDOWN CRASH_SHUTDOWN CANNOT_CONNECT_NOW DATABASE_DROPPED SYSTEM_ERROR IO_ERROR UNDEFINED_FILE DUPLICATE_FILE SNAPSHOT_TOO_OLD CONFIG_FILE_ERROR LOCK_FILE_EXISTS FDW_ERROR FDW_COLUMN_NAME_NOT_FOUND FDW_DYNAMIC_PARAMETER_VALUE_NEEDED FDW_FUNCTION_SEQUENCE_ERROR FDW_INCONSISTENT_DESCRIPTOR_INFORMATION FDW_INVALID_ATTRIBUTE_VALUE FDW_INVALID_COLUMN_NAME FDW_INVALID_COLUMN_NUMBER FDW_INVALID_DATA_TYPE FDW_INVALID_DATA_TYPE_DESCRIPTORS FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER FDW_INVALID_HANDLE FDW_INVALID_OPTION_INDEX FDW_INVALID_OPTION_NAME FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH FDW_INVALID_STRING_FORMAT FDW_INVALID_USE_OF_NULL_POINTER FDW_TOO_MANY_HANDLES FDW_OUT_OF_MEMORY FDW_NO_SCHEMAS FDW_OPTION_NAME_NOT_FOUND FDW_REPLY_HANDLE FDW_SCHEMA_NOT_FOUND FDW_TABLE_NOT_FOUND FDW_UNABLE_TO_CREATE_EXECUTION FDW_UNABLE_TO_CREATE_REPLY FDW_UNABLE_TO_ESTABLISH_CONNECTION PLPGSQL_ERROR RAISE_EXCEPTION NO_DATA_FOUND TOO_MANY_ROWS ASSERT_FAILURE INTERNAL_ERROR DATA_CORRUPTED INDEX_CORRUPTED "
  ), R = /* https://www.postgresql.org/docs/11/static/functions-aggregate.html */ "ARRAY_AGG AVG BIT_AND BIT_OR BOOL_AND BOOL_OR COUNT EVERY JSON_AGG JSONB_AGG JSON_OBJECT_AGG JSONB_OBJECT_AGG MAX MIN MODE STRING_AGG SUM XMLAGG CORR COVAR_POP COVAR_SAMP REGR_AVGX REGR_AVGY REGR_COUNT REGR_INTERCEPT REGR_R2 REGR_SLOPE REGR_SXX REGR_SXY REGR_SYY STDDEV STDDEV_POP STDDEV_SAMP VARIANCE VAR_POP VAR_SAMP PERCENTILE_CONT PERCENTILE_DISC ROW_NUMBER RANK DENSE_RANK PERCENT_RANK CUME_DIST NTILE LAG LEAD FIRST_VALUE LAST_VALUE NTH_VALUE NUM_NONNULLS NUM_NULLS ABS CBRT CEIL CEILING DEGREES DIV EXP FLOOR LN LOG MOD PI POWER RADIANS ROUND SCALE SIGN SQRT TRUNC WIDTH_BUCKET RANDOM SETSEED ACOS ACOSD ASIN ASIND ATAN ATAND ATAN2 ATAN2D COS COSD COT COTD SIN SIND TAN TAND BIT_LENGTH CHAR_LENGTH CHARACTER_LENGTH LOWER OCTET_LENGTH OVERLAY POSITION SUBSTRING TREAT TRIM UPPER ASCII BTRIM CHR CONCAT CONCAT_WS CONVERT CONVERT_FROM CONVERT_TO DECODE ENCODE INITCAP LEFT LENGTH LPAD LTRIM MD5 PARSE_IDENT PG_CLIENT_ENCODING QUOTE_IDENT|10 QUOTE_LITERAL|10 QUOTE_NULLABLE|10 REGEXP_MATCH REGEXP_MATCHES REGEXP_REPLACE REGEXP_SPLIT_TO_ARRAY REGEXP_SPLIT_TO_TABLE REPEAT REPLACE REVERSE RIGHT RPAD RTRIM SPLIT_PART STRPOS SUBSTR TO_ASCII TO_HEX TRANSLATE OCTET_LENGTH GET_BIT GET_BYTE SET_BIT SET_BYTE TO_CHAR TO_DATE TO_NUMBER TO_TIMESTAMP AGE CLOCK_TIMESTAMP|10 DATE_PART DATE_TRUNC ISFINITE JUSTIFY_DAYS JUSTIFY_HOURS JUSTIFY_INTERVAL MAKE_DATE MAKE_INTERVAL|10 MAKE_TIME MAKE_TIMESTAMP|10 MAKE_TIMESTAMPTZ|10 NOW STATEMENT_TIMESTAMP|10 TIMEOFDAY TRANSACTION_TIMESTAMP|10 ENUM_FIRST ENUM_LAST ENUM_RANGE AREA CENTER DIAMETER HEIGHT ISCLOSED ISOPEN NPOINTS PCLOSE POPEN RADIUS WIDTH BOX BOUND_BOX CIRCLE LINE LSEG PATH POLYGON ABBREV BROADCAST HOST HOSTMASK MASKLEN NETMASK NETWORK SET_MASKLEN TEXT INET_SAME_FAMILY INET_MERGE MACADDR8_SET7BIT ARRAY_TO_TSVECTOR GET_CURRENT_TS_CONFIG NUMNODE PLAINTO_TSQUERY PHRASETO_TSQUERY WEBSEARCH_TO_TSQUERY QUERYTREE SETWEIGHT STRIP TO_TSQUERY TO_TSVECTOR JSON_TO_TSVECTOR JSONB_TO_TSVECTOR TS_DELETE TS_FILTER TS_HEADLINE TS_RANK TS_RANK_CD TS_REWRITE TSQUERY_PHRASE TSVECTOR_TO_ARRAY TSVECTOR_UPDATE_TRIGGER TSVECTOR_UPDATE_TRIGGER_COLUMN XMLCOMMENT XMLCONCAT XMLELEMENT XMLFOREST XMLPI XMLROOT XMLEXISTS XML_IS_WELL_FORMED XML_IS_WELL_FORMED_DOCUMENT XML_IS_WELL_FORMED_CONTENT XPATH XPATH_EXISTS XMLTABLE XMLNAMESPACES TABLE_TO_XML TABLE_TO_XMLSCHEMA TABLE_TO_XML_AND_XMLSCHEMA QUERY_TO_XML QUERY_TO_XMLSCHEMA QUERY_TO_XML_AND_XMLSCHEMA CURSOR_TO_XML CURSOR_TO_XMLSCHEMA SCHEMA_TO_XML SCHEMA_TO_XMLSCHEMA SCHEMA_TO_XML_AND_XMLSCHEMA DATABASE_TO_XML DATABASE_TO_XMLSCHEMA DATABASE_TO_XML_AND_XMLSCHEMA XMLATTRIBUTES TO_JSON TO_JSONB ARRAY_TO_JSON ROW_TO_JSON JSON_BUILD_ARRAY JSONB_BUILD_ARRAY JSON_BUILD_OBJECT JSONB_BUILD_OBJECT JSON_OBJECT JSONB_OBJECT JSON_ARRAY_LENGTH JSONB_ARRAY_LENGTH JSON_EACH JSONB_EACH JSON_EACH_TEXT JSONB_EACH_TEXT JSON_EXTRACT_PATH JSONB_EXTRACT_PATH JSON_OBJECT_KEYS JSONB_OBJECT_KEYS JSON_POPULATE_RECORD JSONB_POPULATE_RECORD JSON_POPULATE_RECORDSET JSONB_POPULATE_RECORDSET JSON_ARRAY_ELEMENTS JSONB_ARRAY_ELEMENTS JSON_ARRAY_ELEMENTS_TEXT JSONB_ARRAY_ELEMENTS_TEXT JSON_TYPEOF JSONB_TYPEOF JSON_TO_RECORD JSONB_TO_RECORD JSON_TO_RECORDSET JSONB_TO_RECORDSET JSON_STRIP_NULLS JSONB_STRIP_NULLS JSONB_SET JSONB_INSERT JSONB_PRETTY CURRVAL LASTVAL NEXTVAL SETVAL COALESCE NULLIF GREATEST LEAST ARRAY_APPEND ARRAY_CAT ARRAY_NDIMS ARRAY_DIMS ARRAY_FILL ARRAY_LENGTH ARRAY_LOWER ARRAY_POSITION ARRAY_POSITIONS ARRAY_PREPEND ARRAY_REMOVE ARRAY_REPLACE ARRAY_TO_STRING ARRAY_UPPER CARDINALITY STRING_TO_ARRAY UNNEST ISEMPTY LOWER_INC UPPER_INC LOWER_INF UPPER_INF RANGE_MERGE GENERATE_SERIES GENERATE_SUBSCRIPTS CURRENT_DATABASE CURRENT_QUERY CURRENT_SCHEMA|10 CURRENT_SCHEMAS|10 INET_CLIENT_ADDR INET_CLIENT_PORT INET_SERVER_ADDR INET_SERVER_PORT ROW_SECURITY_ACTIVE FORMAT_TYPE TO_REGCLASS TO_REGPROC TO_REGPROCEDURE TO_REGOPER TO_REGOPERATOR TO_REGTYPE TO_REGNAMESPACE TO_REGROLE COL_DESCRIPTION OBJ_DESCRIPTION SHOBJ_DESCRIPTION TXID_CURRENT TXID_CURRENT_IF_ASSIGNED TXID_CURRENT_SNAPSHOT TXID_SNAPSHOT_XIP TXID_SNAPSHOT_XMAX TXID_SNAPSHOT_XMIN TXID_VISIBLE_IN_SNAPSHOT TXID_STATUS CURRENT_SETTING SET_CONFIG BRIN_SUMMARIZE_NEW_VALUES BRIN_SUMMARIZE_RANGE BRIN_DESUMMARIZE_RANGE GIN_CLEAN_PENDING_LIST SUPPRESS_REDUNDANT_UPDATES_TRIGGER LO_FROM_BYTEA LO_PUT LO_GET LO_CREAT LO_CREATE LO_UNLINK LO_IMPORT LO_EXPORT LOREAD LOWRITE GROUPING CAST ".trim().split(" ").map(function(T) {
    return T.split("|")[0];
  }).join("|");
  return {
    name: "PostgreSQL",
    aliases: [
      "postgres",
      "postgresql"
    ],
    supersetOf: "sql",
    case_insensitive: !0,
    keywords: {
      keyword: s + f + l,
      built_in: h + v + E
    },
    // Forbid some cunstructs from other languages to improve autodetect. In fact
    // "[a-z]:" is legal (as part of array slice), but improbabal.
    illegal: /:==|\W\s*\(\*|(^|\s)\$[a-z]|\{\{|[a-z]:\s*$|\.\.\.|TO:|DO:/,
    contains: [
      // special handling of some words, which are reserved only in some contexts
      {
        className: "keyword",
        variants: [
          { begin: /\bTEXT\s*SEARCH\b/ },
          { begin: /\b(PRIMARY|FOREIGN|FOR(\s+NO)?)\s+KEY\b/ },
          { begin: /\bPARALLEL\s+(UNSAFE|RESTRICTED|SAFE)\b/ },
          { begin: /\bSTORAGE\s+(PLAIN|EXTERNAL|EXTENDED|MAIN)\b/ },
          { begin: /\bMATCH\s+(FULL|PARTIAL|SIMPLE)\b/ },
          { begin: /\bNULLS\s+(FIRST|LAST)\b/ },
          { begin: /\bEVENT\s+TRIGGER\b/ },
          { begin: /\b(MAPPING|OR)\s+REPLACE\b/ },
          { begin: /\b(FROM|TO)\s+(PROGRAM|STDIN|STDOUT)\b/ },
          { begin: /\b(SHARE|EXCLUSIVE)\s+MODE\b/ },
          { begin: /\b(LEFT|RIGHT)\s+(OUTER\s+)?JOIN\b/ },
          { begin: /\b(FETCH|MOVE)\s+(NEXT|PRIOR|FIRST|LAST|ABSOLUTE|RELATIVE|FORWARD|BACKWARD)\b/ },
          { begin: /\bPRESERVE\s+ROWS\b/ },
          { begin: /\bDISCARD\s+PLANS\b/ },
          { begin: /\bREFERENCING\s+(OLD|NEW)\b/ },
          { begin: /\bSKIP\s+LOCKED\b/ },
          { begin: /\bGROUPING\s+SETS\b/ },
          { begin: /\b(BINARY|INSENSITIVE|SCROLL|NO\s+SCROLL)\s+(CURSOR|FOR)\b/ },
          { begin: /\b(WITH|WITHOUT)\s+HOLD\b/ },
          { begin: /\bWITH\s+(CASCADED|LOCAL)\s+CHECK\s+OPTION\b/ },
          { begin: /\bEXCLUDE\s+(TIES|NO\s+OTHERS)\b/ },
          { begin: /\bFORMAT\s+(TEXT|XML|JSON|YAML)\b/ },
          { begin: /\bSET\s+((SESSION|LOCAL)\s+)?NAMES\b/ },
          { begin: /\bIS\s+(NOT\s+)?UNKNOWN\b/ },
          { begin: /\bSECURITY\s+LABEL\b/ },
          { begin: /\bSTANDALONE\s+(YES|NO|NO\s+VALUE)\b/ },
          { begin: /\bWITH\s+(NO\s+)?DATA\b/ },
          { begin: /\b(FOREIGN|SET)\s+DATA\b/ },
          { begin: /\bSET\s+(CATALOG|CONSTRAINTS)\b/ },
          { begin: /\b(WITH|FOR)\s+ORDINALITY\b/ },
          { begin: /\bIS\s+(NOT\s+)?DOCUMENT\b/ },
          { begin: /\bXML\s+OPTION\s+(DOCUMENT|CONTENT)\b/ },
          { begin: /\b(STRIP|PRESERVE)\s+WHITESPACE\b/ },
          { begin: /\bNO\s+(ACTION|MAXVALUE|MINVALUE)\b/ },
          { begin: /\bPARTITION\s+BY\s+(RANGE|LIST|HASH)\b/ },
          { begin: /\bAT\s+TIME\s+ZONE\b/ },
          { begin: /\bGRANTED\s+BY\b/ },
          { begin: /\bRETURN\s+(QUERY|NEXT)\b/ },
          { begin: /\b(ATTACH|DETACH)\s+PARTITION\b/ },
          { begin: /\bFORCE\s+ROW\s+LEVEL\s+SECURITY\b/ },
          { begin: /\b(INCLUDING|EXCLUDING)\s+(COMMENTS|CONSTRAINTS|DEFAULTS|IDENTITY|INDEXES|STATISTICS|STORAGE|ALL)\b/ },
          { begin: /\bAS\s+(ASSIGNMENT|IMPLICIT|PERMISSIVE|RESTRICTIVE|ENUM|RANGE)\b/ }
        ]
      },
      // functions named as keywords, followed by '('
      {
        begin: /\b(FORMAT|FAMILY|VERSION)\s*\(/
        // keywords: { built_in: 'FORMAT FAMILY VERSION' }
      },
      // INCLUDE ( ... ) in index_parameters in CREATE TABLE
      {
        begin: /\bINCLUDE\s*\(/,
        keywords: "INCLUDE"
      },
      // not highlight RANGE if not in frame_clause (not 100% correct, but seems satisfactory)
      { begin: /\bRANGE(?!\s*(BETWEEN|UNBOUNDED|CURRENT|[-0-9]+))/ },
      // disable highlighting in commands CREATE AGGREGATE/COLLATION/DATABASE/OPERTOR/TEXT SEARCH .../TYPE
      // and in PL/pgSQL RAISE ... USING
      { begin: /\b(VERSION|OWNER|TEMPLATE|TABLESPACE|CONNECTION\s+LIMIT|PROCEDURE|RESTRICT|JOIN|PARSER|COPY|START|END|COLLATION|INPUT|ANALYZE|STORAGE|LIKE|DEFAULT|DELIMITER|ENCODING|COLUMN|CONSTRAINT|TABLE|SCHEMA)\s*=/ },
      // PG_smth; HAS_some_PRIVILEGE
      {
        // className: 'built_in',
        begin: /\b(PG_\w+?|HAS_[A-Z_]+_PRIVILEGE)\b/,
        relevance: 10
      },
      // extract
      {
        begin: /\bEXTRACT\s*\(/,
        end: /\bFROM\b/,
        returnEnd: !0,
        keywords: {
          // built_in: 'EXTRACT',
          type: "CENTURY DAY DECADE DOW DOY EPOCH HOUR ISODOW ISOYEAR MICROSECONDS MILLENNIUM MILLISECONDS MINUTE MONTH QUARTER SECOND TIMEZONE TIMEZONE_HOUR TIMEZONE_MINUTE WEEK YEAR"
        }
      },
      // xmlelement, xmlpi - special NAME
      {
        begin: /\b(XMLELEMENT|XMLPI)\s*\(\s*NAME/,
        keywords: {
          // built_in: 'XMLELEMENT XMLPI',
          keyword: "NAME"
        }
      },
      // xmlparse, xmlserialize
      {
        begin: /\b(XMLPARSE|XMLSERIALIZE)\s*\(\s*(DOCUMENT|CONTENT)/,
        keywords: {
          // built_in: 'XMLPARSE XMLSERIALIZE',
          keyword: "DOCUMENT CONTENT"
        }
      },
      // Sequences. We actually skip everything between CACHE|INCREMENT|MAXVALUE|MINVALUE and
      // nearest following numeric constant. Without with trick we find a lot of "keywords"
      // in 'avrasm' autodetection test...
      {
        beginKeywords: "CACHE INCREMENT MAXVALUE MINVALUE",
        end: e.C_NUMBER_RE,
        returnEnd: !0,
        keywords: "BY CACHE INCREMENT MAXVALUE MINVALUE"
      },
      // WITH|WITHOUT TIME ZONE as part of datatype
      {
        className: "type",
        begin: /\b(WITH|WITHOUT)\s+TIME\s+ZONE\b/
      },
      // INTERVAL optional fields
      {
        className: "type",
        begin: /\bINTERVAL\s+(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)(\s+TO\s+(MONTH|HOUR|MINUTE|SECOND))?\b/
      },
      // Pseudo-types which allowed only as return type
      {
        begin: /\bRETURNS\s+(LANGUAGE_HANDLER|TRIGGER|EVENT_TRIGGER|FDW_HANDLER|INDEX_AM_HANDLER|TSM_HANDLER)\b/,
        keywords: {
          keyword: "RETURNS",
          type: "LANGUAGE_HANDLER TRIGGER EVENT_TRIGGER FDW_HANDLER INDEX_AM_HANDLER TSM_HANDLER"
        }
      },
      // Known functions - only when followed by '('
      {
        begin: "\\b(" + R + ")\\s*\\("
        // keywords: { built_in: FUNCTIONS }
      },
      // Types
      {
        begin: "\\.(" + p + ")\\b"
        // prevent highlight as type, say, 'oid' in 'pgclass.oid'
      },
      {
        begin: "\\b(" + p + ")\\s+PATH\\b",
        // in XMLTABLE
        keywords: {
          keyword: "PATH",
          // hopefully no one would use PATH type in XMLTABLE...
          type: c.replace("PATH ", "")
        }
      },
      {
        className: "type",
        begin: "\\b(" + p + ")\\b"
      },
      // Strings, see https://www.postgresql.org/docs/11/static/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
      {
        className: "string",
        begin: "'",
        end: "'",
        contains: [{ begin: "''" }]
      },
      {
        className: "string",
        begin: "(e|E|u&|U&)'",
        end: "'",
        contains: [{ begin: "\\\\." }],
        relevance: 10
      },
      e.END_SAME_AS_BEGIN({
        begin: o,
        end: o,
        contains: [
          {
            // actually we want them all except SQL; listed are those with known implementations
            // and XML + JSON just in case
            subLanguage: [
              "pgsql",
              "perl",
              "python",
              "tcl",
              "r",
              "lua",
              "java",
              "php",
              "ruby",
              "bash",
              "scheme",
              "xml",
              "json"
            ],
            endsWithParent: !0
          }
        ]
      }),
      // identifiers in quotes
      {
        begin: '"',
        end: '"',
        contains: [{ begin: '""' }]
      },
      // numbers
      e.C_NUMBER_MODE,
      // comments
      e.C_BLOCK_COMMENT_MODE,
      t,
      // PL/pgSQL staff
      // %ROWTYPE, %TYPE, $n
      {
        className: "meta",
        variants: [
          {
            // %TYPE, %ROWTYPE
            begin: "%(ROW)?TYPE",
            relevance: 10
          },
          {
            // $n
            begin: "\\$\\d+"
          },
          {
            // #compiler option
            begin: "^#\\w",
            end: "$"
          }
        ]
      },
      // <<labeles>>
      {
        className: "symbol",
        begin: a,
        relevance: 10
      }
    ]
  };
}
function ex(e) {
  const t = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, n = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, o = [
    "true",
    "false",
    "null"
  ], a = {
    scope: "literal",
    beginKeywords: o.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: o
    },
    contains: [
      t,
      n,
      e.QUOTE_STRING_MODE,
      a,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
nl.registerLanguage("pgsql", Qw);
nl.registerLanguage("json", ex);
function yr(e) {
  if (e === void 0)
    return "N/A";
  const t = [];
  let n = 3600 * 24;
  const o = Math.floor(e / n);
  o && t.push(o + "d");
  let a = e % n;
  n /= 24;
  const s = Math.floor(a / n);
  s && t.push(s + "h"), a = a % n, n /= 60;
  const l = Math.floor(a / n);
  if (l && t.push(l + "m"), a = a % n, a >= 1) {
    const f = parseFloat(a.toFixed(2));
    t.push(f.toLocaleString() + "s");
  } else {
    const f = parseFloat((a * 1e3).toFixed(2));
    t.push(f.toLocaleString() + "ms");
  }
  return t.slice(0, 2).join(" ");
}
function sd(e) {
  return e === void 0 ? "N/A" : (e = parseFloat(e.toPrecision(3)), e.toLocaleString());
}
function Lo(e) {
  return e === void 0 && e != 0 ? "N/A" : e.toLocaleString();
}
function tx(e) {
  return e === void 0 ? "N/A" : e.toLocaleString();
}
function nx(e) {
  const t = parseFloat(e.toPrecision(2)).toLocaleString();
  return be.template("${f}&nbsp;&times;")({ f: t });
}
function wa(e) {
  return (Array.isArray(e) ? e : [e]).map((n) => n.replace(/^'|'$/g, "")).join(", ");
}
function Tc(e) {
  return rl(e * 1024);
}
function o0(e) {
  return rl(e);
}
function rl(e, t = 2) {
  const o = t < 0 ? 0 : t, a = ["Bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], s = Math.floor(Math.log(e) / Math.log(1024)), l = be.template("${value} ${unit}"), f = parseFloat(
    (e / Math.pow(1024, s)).toPrecision(o)
  ).toLocaleString();
  return l({ value: f, unit: a[s] });
}
function rx(e) {
  return e ? rl(e * 8 * 1024) : "";
}
function ix(e, t = !1) {
  if (t = !!t, !e)
    return "";
  let n = e.toLocaleString();
  return t && (n += `<br><small>${rx(e)}</small>`), n;
}
function Uv(e) {
  return isNaN(e) ? "-" : be.round(e * 100) + "%";
}
function ox(e) {
  return typeof e == "string" && (e = e.split(/\s*,\s*/)), '<ul class="list-unstyled mb-0">' + be.template(
    "<% _.forEach(lines, function(line) { %><li><%= line %></li><% }); %>"
  )({ lines: e }) + "</ul>";
}
function ax(e) {
  return Qf(qw, { sortGroup: e }).mount(
    document.createElement("div")
  ).$el.outerHTML;
}
function sx(e) {
  return e ? rl(e * 8 * 1024) + "/s" : "";
}
function a0(e, t) {
  if (be.has(St, e)) {
    if (St[e] === pn.duration)
      return yr(t);
    if (St[e] === pn.boolean)
      return t ? "yes" : "no";
    if (St[e] === pn.cost)
      return sd(t);
    if (St[e] === pn.rows)
      return Lo(t);
    if (St[e] === pn.loops)
      return tx(t);
    if (St[e] === pn.factor)
      return nx(t);
    if (St[e] === pn.estimateDirection)
      switch (t) {
        case yc.over:
          return '<i class="fa fa-arrow-up"></i> over';
        case yc.under:
          return '<i class="fa fa-arrow-down"></i> under';
        default:
          return "-";
      }
    else {
      if (St[e] === pn.json)
        return JSON.stringify(t, null, 2);
      if (St[e] === pn.bytes)
        return o0(t);
      if (St[e] === pn.kilobytes)
        return Tc(t);
      if (St[e] === pn.blocks)
        return ix(t, !0);
      if (St[e] === pn.list)
        return ox(t);
      if (St[e] === pn.sortGroups)
        return ax(t);
      if (St[e] === pn.transferRate)
        return sx(t);
    }
  }
  return be.escape(t);
}
function ux(e) {
  let t;
  return e > 90 ? t = 4 : e > 40 ? t = 3 : e > 10 && (t = 2), t ? "c-" + t : "";
}
function lx(e) {
  return nl.highlight(e, { language: "pgsql" }).value;
}
function fx(e) {
  return nl.highlight(e, { language: "json" }).value;
}
function cx(e, t, n) {
  let o, a, s;
  {
    const l = n * (1 + t), f = 2 * n - l;
    o = Bf(f, l, e + 1 / 3), a = Bf(f, l, e), s = Bf(f, l, e - 1 / 3);
  }
  return [Math.floor(o * 255), Math.floor(a * 255), Math.floor(s * 255)];
}
function dx(e) {
  const t = (100 - e) * 1.2 / 360, n = cx(t, 0.9, 0.4);
  return "rgb(" + n[0] + "," + n[1] + "," + n[2] + ")";
}
function Bf(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function es(e, t, n) {
  const o = qe(NaN), a = qe(NaN), s = qe(NaN), l = qe(NaN), f = qe(0), c = qe(null);
  lo(() => {
    p(), E(), b(), R();
  }), Zt(() => n.highlightType, p);
  function p() {
    let _;
    switch (n.highlightType) {
      case Fn.DURATION:
        if (_ = t[w.ACTUAL_TIME], _ === void 0) {
          c.value = null;
          break;
        }
        f.value = Math.round(
          _ / e.value.planStats.maxDuration * 100
        ), c.value = yr(_);
        break;
      case Fn.ROWS:
        if (_ = t[w.ACTUAL_ROWS], _ === void 0) {
          c.value = null;
          break;
        }
        f.value = Math.round(
          _ / e.value.planStats.maxRows * 100
        ) || 0, c.value = Lo(_);
        break;
      case Fn.RESULT:
        if (_ = t[w.RESULT_SET_SIZE], _ === void 0) {
          c.value = null;
          break;
        }
        f.value = Math.round(
          _ / e.value.planStats.maxResult * 100
        ), c.value = sd(_);
        break;
    }
  }
  const h = $e(() => dx(f.value)), v = $e(() => {
    let _ = "";
    return _ += t[w.NODE_TYPE] ?? t[w.NODE_TYPE_EXPLAIN], _;
  });
  function E() {
    const _ = e.value.planStats.executionTime || e.value.content?.[w.CPU_TIME], A = t[w.ACTUAL_TIME];
    o.value = be.round(A / _ * 100);
  }
  function b() {
    const _ = e.value.content.maxResult, A = t[w.RESULT_SET_SIZE];
    a.value = be.round(A / _ * 100);
  }
  function R() {
    const _ = e.value.content.maxRows, A = t[w.ACTUAL_ROWS];
    s.value = be.round(A / _ * 100);
  }
  const T = $e(() => {
    let _;
    const A = o.value;
    return A > 90 ? _ = 4 : A > 50 && (_ = 3), _ ? "c-" + _ : !1;
  }), x = $e(() => {
    let _;
    const A = s.value;
    return A > 90 ? _ = 4 : A > 50 && (_ = 3), _ ? "c-" + _ : !1;
  }), I = $e(() => {
    let _;
    const A = a.value;
    return A > 90 ? _ = 4 : A > 50 && (_ = 3), _ ? "c-" + _ : !1;
  }), F = $e(() => {
    let _;
    const A = l.value;
    return A > 90 ? _ = 4 : A > 50 && (_ = 3), _ ? "c-" + _ : !1;
  }), P = $e(() => !!e.value.planStats.executionTime && !t[w.ACTUAL_TIME] && !t[w.ACTUAL_ROWS]), g = $e(() => [
    "Duration: <br>Actual Time: ",
    yr(t[w.ACTUAL_TIME]),
    ", CPU Time: ",
    yr(t[w.CPU_TIME])
  ].join("")), H = $e(() => ["Rows: ", Lo(t[w.ACTUAL_ROWS])].join("")), $ = $e(() => ["Result: ", Lo(t[w.RESULT_SET_SIZE])].join("")), U = $e(() => [
    "Estimated: ",
    Lo(
      t[w.EXTRA_INFO][w.ESTIMATED_ROWS]
    )
  ].join(""));
  return {
    barColor: h,
    barWidth: f,
    resultClass: I,
    resultTooltip: $,
    durationClass: T,
    rowsClass: x,
    estimationClass: F,
    executionTimePercent: o,
    highlightValue: c,
    isNeverExecuted: P,
    nodeName: v,
    rowsTooltip: H,
    timeTooltip: g,
    estimationTooltip: U
  };
}
const px = ["data-tippy-content"], hx = { class: "node-index" }, vx = { class: "fw-normal small" }, gx = { key: 0 }, mx = {
  key: 0,
  class: "progress rounded-0 align-items-center bg-transparent",
  style: { height: "5px" }
}, Ex = {
  key: 1,
  class: "progress rounded-0 align-items-center bg-transparent",
  style: { height: "5px" }
}, _x = {
  key: 2,
  class: "progress rounded-0 align-items-center bg-transparent",
  style: { height: "5px" }
}, yx = { key: 1 }, Tx = /* @__PURE__ */ Lt({
  __name: "DiagramRow",
  props: {
    node: {},
    level: {},
    isSubplan: { type: Boolean },
    isLastChild: { type: Boolean },
    branches: {},
    index: {},
    viewOptions: {}
  },
  setup(e) {
    const t = e, n = Tr(t.node), o = Tr(t.viewOptions), a = qe(null), s = ft(Hr), l = ft(Nu), f = ft(ro);
    if (!f)
      throw new Error(`Could not resolve ${ro.description}`);
    const c = ft(Vu), p = ft(Jo), { resultTooltip: h, nodeName: v, rowsTooltip: E, timeTooltip: b } = es(
      s,
      n,
      p
    ), R = $e(() => {
      if (typeof n[w.CPU_TIME] != "number" || typeof n[w.ACTUAL_TIME] != "number")
        return 0;
      const $ = s.value.planStats.executionTime ?? s.value.content[w.ACTUAL_TIME] ?? 1;
      return Math.round((n[w.CPU_TIME] - n[w.ACTUAL_TIME]) / $ * 100);
    }), T = $e(() => typeof n[w.CPU_TIME] == "number" || typeof n[w.ACTUAL_TIME] == "number"), x = $e(() => typeof n[w.ACTUAL_ROWS] != "number" || !s.value.planStats.maxRows ? 0 : Math.round(n[w.ACTUAL_ROWS] / s.value.planStats.maxRows * 100)), I = $e(() => typeof n[w.ACTUAL_ROWS] == "number"), F = $e(() => typeof n[w.RESULT_SET_SIZE] != "number" || !s.value.planStats.maxResult ? 0 : Math.round(n[w.RESULT_SET_SIZE] / s.value.planStats.maxResult * 100)), P = $e(() => typeof n[w.RESULT_SET_SIZE] == "number" && n[w.RESULT_SET_SIZE] > 0);
    function g($) {
      let U = "";
      switch (o.metric) {
        case Nn.time:
          U += b.value;
          break;
        case Nn.rows:
          U += E.value;
          break;
        case Nn.result:
          U += h.value;
          break;
      }
      return $[w.EXTRA_INFO][w.CTE_NAME] && (U += "<br><em>CTE " + $[w.EXTRA_INFO][w.CTE_NAME] + "</em>"), U;
    }
    const H = ft("scrollTo");
    return Zt(
      () => l?.value,
      ($) => {
        $ == n.nodeId && a.value && H?.(a.value);
      }
    ), ($, U) => (q(), re("tr", {
      class: Xe(["no-focus-outline node", {
        selected: n.nodeId === S(l),
        highlight: n.nodeId === S(c)
      }]),
      "data-tippy-content": g(n),
      onMouseenter: U[0] || (U[0] = (_) => c.value = n.nodeId),
      onMouseleave: U[1] || (U[1] = (_) => c.value = void 0),
      onClick: U[2] || (U[2] = hn((_) => S(f)(n.nodeId, !0), ["prevent"])),
      ref_key: "rootEl",
      ref: a
    }, [
      D("td", hx, [
        D("span", vx, "#" + He(n.nodeId), 1)
      ]),
      U[4] || (U[4] = B()),
      D("td", {
        class: "node-type pe-2",
        style: ii(T.value || I.value || P.value ? {} : { width: "100%" })
      }, [
        We(ad, {
          isSubplan: !!n[S(w).EXTRA_INFO][S(w).CTE_NAME],
          isLastChild: !!$.isLastChild,
          level: $.level,
          branches: $.branches,
          index: $.index,
          dense: ""
        }, null, 8, ["isSubplan", "isLastChild", "level", "branches", "index"]),
        B(" " + He(S(v)), 1)
      ], 4),
      U[5] || (U[5] = B()),
      T.value || I.value || P.value ? (q(), re("td", gx, [
        o.metric == S(Nn).time ? (q(), re("div", mx, [
          D("div", {
            class: Xe(["progress-bar border-secondary bg-secondary", {
              "border-start": n[S(w).ACTUAL_TIME] > 0
            }]),
            role: "progressbar",
            style: ii([{ height: "5px" }, {
              width: n[S(w).ACTUAL_TIME] / (S(s).planStats.executionTime || S(s).content[S(w).ACTUAL_TIME]) * 100 + "%"
            }]),
            "aria-valuenow": "15",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
          }, null, 6),
          U[3] || (U[3] = B()),
          D("div", {
            class: "progress-bar bg-secondary-light",
            role: "progressbar",
            style: ii([{ height: "5px" }, {
              width: R.value + "%"
            }]),
            "aria-valuenow": "15",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
          }, null, 4)
        ])) : o.metric == S(Nn).rows ? (q(), re("div", Ex, [
          D("div", {
            class: "bg-secondary",
            role: "progressbar",
            style: ii([{ height: "5px" }, {
              width: x.value + "%"
            }]),
            "aria-valuenow": "15",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
          }, null, 4)
        ])) : o.metric == S(Nn).result ? (q(), re("div", _x, [
          D("div", {
            class: Xe(["bg-secondary", {
              "border-secondary border-start": P.value
            }]),
            role: "progressbar",
            style: ii([{ height: "5px" }, {
              width: F.value + "%"
            }]),
            "aria-valuenow": "15",
            "aria-valuemin": "0",
            "aria-valuemax": "100"
          }, null, 6)
        ])) : Le("", !0)
      ])) : (q(), re("td", yx))
    ], 42, px));
  }
});
var wn = "top", or = "bottom", ar = "right", xn = "left", ud = "auto", ts = [wn, or, ar, xn], Wo = "start", Wa = "end", Ax = "clippingParents", s0 = "viewport", ba = "popper", bx = "reference", $v = /* @__PURE__ */ ts.reduce(function(e, t) {
  return e.concat([t + "-" + Wo, t + "-" + Wa]);
}, []), u0 = /* @__PURE__ */ [].concat(ts, [ud]).reduce(function(e, t) {
  return e.concat([t, t + "-" + Wo, t + "-" + Wa]);
}, []), Ox = "beforeRead", Nx = "read", Sx = "afterRead", Ix = "beforeMain", Rx = "main", wx = "afterMain", xx = "beforeWrite", Cx = "write", Lx = "afterWrite", Mx = [Ox, Nx, Sx, Ix, Rx, wx, xx, Cx, Lx];
function Br(e) {
  return e ? (e.nodeName || "").toLowerCase() : null;
}
function Gn(e) {
  if (e == null)
    return window;
  if (e.toString() !== "[object Window]") {
    var t = e.ownerDocument;
    return t && t.defaultView || window;
  }
  return e;
}
function ao(e) {
  var t = Gn(e).Element;
  return e instanceof t || e instanceof Element;
}
function nr(e) {
  var t = Gn(e).HTMLElement;
  return e instanceof t || e instanceof HTMLElement;
}
function ld(e) {
  if (typeof ShadowRoot > "u")
    return !1;
  var t = Gn(e).ShadowRoot;
  return e instanceof t || e instanceof ShadowRoot;
}
function Dx(e) {
  var t = e.state;
  Object.keys(t.elements).forEach(function(n) {
    var o = t.styles[n] || {}, a = t.attributes[n] || {}, s = t.elements[n];
    !nr(s) || !Br(s) || (Object.assign(s.style, o), Object.keys(a).forEach(function(l) {
      var f = a[l];
      f === !1 ? s.removeAttribute(l) : s.setAttribute(l, f === !0 ? "" : f);
    }));
  });
}
function Px(e) {
  var t = e.state, n = {
    popper: {
      position: t.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  return Object.assign(t.elements.popper.style, n.popper), t.styles = n, t.elements.arrow && Object.assign(t.elements.arrow.style, n.arrow), function() {
    Object.keys(t.elements).forEach(function(o) {
      var a = t.elements[o], s = t.attributes[o] || {}, l = Object.keys(t.styles.hasOwnProperty(o) ? t.styles[o] : n[o]), f = l.reduce(function(c, p) {
        return c[p] = "", c;
      }, {});
      !nr(a) || !Br(a) || (Object.assign(a.style, f), Object.keys(s).forEach(function(c) {
        a.removeAttribute(c);
      }));
    });
  };
}
const l0 = {
  name: "applyStyles",
  enabled: !0,
  phase: "write",
  fn: Dx,
  effect: Px,
  requires: ["computeStyles"]
};
function Ur(e) {
  return e.split("-")[0];
}
var to = Math.max, Mu = Math.min, Xo = Math.round;
function Ac() {
  var e = navigator.userAgentData;
  return e != null && e.brands && Array.isArray(e.brands) ? e.brands.map(function(t) {
    return t.brand + "/" + t.version;
  }).join(" ") : navigator.userAgent;
}
function f0() {
  return !/^((?!chrome|android).)*safari/i.test(Ac());
}
function Yo(e, t, n) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  var o = e.getBoundingClientRect(), a = 1, s = 1;
  t && nr(e) && (a = e.offsetWidth > 0 && Xo(o.width) / e.offsetWidth || 1, s = e.offsetHeight > 0 && Xo(o.height) / e.offsetHeight || 1);
  var l = ao(e) ? Gn(e) : window, f = l.visualViewport, c = !f0() && n, p = (o.left + (c && f ? f.offsetLeft : 0)) / a, h = (o.top + (c && f ? f.offsetTop : 0)) / s, v = o.width / a, E = o.height / s;
  return {
    width: v,
    height: E,
    top: h,
    right: p + v,
    bottom: h + E,
    left: p,
    x: p,
    y: h
  };
}
function fd(e) {
  var t = Yo(e), n = e.offsetWidth, o = e.offsetHeight;
  return Math.abs(t.width - n) <= 1 && (n = t.width), Math.abs(t.height - o) <= 1 && (o = t.height), {
    x: e.offsetLeft,
    y: e.offsetTop,
    width: n,
    height: o
  };
}
function c0(e, t) {
  var n = t.getRootNode && t.getRootNode();
  if (e.contains(t))
    return !0;
  if (n && ld(n)) {
    var o = t;
    do {
      if (o && e.isSameNode(o))
        return !0;
      o = o.parentNode || o.host;
    } while (o);
  }
  return !1;
}
function li(e) {
  return Gn(e).getComputedStyle(e);
}
function Ux(e) {
  return ["table", "td", "th"].indexOf(Br(e)) >= 0;
}
function wi(e) {
  return ((ao(e) ? e.ownerDocument : (
    // $FlowFixMe[prop-missing]
    e.document
  )) || window.document).documentElement;
}
function il(e) {
  return Br(e) === "html" ? e : (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    e.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    e.parentNode || // DOM Element detected
    (ld(e) ? e.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    wi(e)
  );
}
function kv(e) {
  return !nr(e) || // https://github.com/popperjs/popper-core/issues/837
  li(e).position === "fixed" ? null : e.offsetParent;
}
function $x(e) {
  var t = /firefox/i.test(Ac()), n = /Trident/i.test(Ac());
  if (n && nr(e)) {
    var o = li(e);
    if (o.position === "fixed")
      return null;
  }
  var a = il(e);
  for (ld(a) && (a = a.host); nr(a) && ["html", "body"].indexOf(Br(a)) < 0; ) {
    var s = li(a);
    if (s.transform !== "none" || s.perspective !== "none" || s.contain === "paint" || ["transform", "perspective"].indexOf(s.willChange) !== -1 || t && s.willChange === "filter" || t && s.filter && s.filter !== "none")
      return a;
    a = a.parentNode;
  }
  return null;
}
function ns(e) {
  for (var t = Gn(e), n = kv(e); n && Ux(n) && li(n).position === "static"; )
    n = kv(n);
  return n && (Br(n) === "html" || Br(n) === "body" && li(n).position === "static") ? t : n || $x(e) || t;
}
function cd(e) {
  return ["top", "bottom"].indexOf(e) >= 0 ? "x" : "y";
}
function $a(e, t, n) {
  return to(e, Mu(t, n));
}
function kx(e, t, n) {
  var o = $a(e, t, n);
  return o > n ? n : o;
}
function d0() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}
function p0(e) {
  return Object.assign({}, d0(), e);
}
function h0(e, t) {
  return t.reduce(function(n, o) {
    return n[o] = e, n;
  }, {});
}
var Fx = function(t, n) {
  return t = typeof t == "function" ? t(Object.assign({}, n.rects, {
    placement: n.placement
  })) : t, p0(typeof t != "number" ? t : h0(t, ts));
};
function Bx(e) {
  var t, n = e.state, o = e.name, a = e.options, s = n.elements.arrow, l = n.modifiersData.popperOffsets, f = Ur(n.placement), c = cd(f), p = [xn, ar].indexOf(f) >= 0, h = p ? "height" : "width";
  if (!(!s || !l)) {
    var v = Fx(a.padding, n), E = fd(s), b = c === "y" ? wn : xn, R = c === "y" ? or : ar, T = n.rects.reference[h] + n.rects.reference[c] - l[c] - n.rects.popper[h], x = l[c] - n.rects.reference[c], I = ns(s), F = I ? c === "y" ? I.clientHeight || 0 : I.clientWidth || 0 : 0, P = T / 2 - x / 2, g = v[b], H = F - E[h] - v[R], $ = F / 2 - E[h] / 2 + P, U = $a(g, $, H), _ = c;
    n.modifiersData[o] = (t = {}, t[_] = U, t.centerOffset = U - $, t);
  }
}
function Hx(e) {
  var t = e.state, n = e.options, o = n.element, a = o === void 0 ? "[data-popper-arrow]" : o;
  a != null && (typeof a == "string" && (a = t.elements.popper.querySelector(a), !a) || c0(t.elements.popper, a) && (t.elements.arrow = a));
}
const Gx = {
  name: "arrow",
  enabled: !0,
  phase: "main",
  fn: Bx,
  effect: Hx,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};
function Vo(e) {
  return e.split("-")[1];
}
var zx = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function Wx(e, t) {
  var n = e.x, o = e.y, a = t.devicePixelRatio || 1;
  return {
    x: Xo(n * a) / a || 0,
    y: Xo(o * a) / a || 0
  };
}
function Fv(e) {
  var t, n = e.popper, o = e.popperRect, a = e.placement, s = e.variation, l = e.offsets, f = e.position, c = e.gpuAcceleration, p = e.adaptive, h = e.roundOffsets, v = e.isFixed, E = l.x, b = E === void 0 ? 0 : E, R = l.y, T = R === void 0 ? 0 : R, x = typeof h == "function" ? h({
    x: b,
    y: T
  }) : {
    x: b,
    y: T
  };
  b = x.x, T = x.y;
  var I = l.hasOwnProperty("x"), F = l.hasOwnProperty("y"), P = xn, g = wn, H = window;
  if (p) {
    var $ = ns(n), U = "clientHeight", _ = "clientWidth";
    if ($ === Gn(n) && ($ = wi(n), li($).position !== "static" && f === "absolute" && (U = "scrollHeight", _ = "scrollWidth")), $ = $, a === wn || (a === xn || a === ar) && s === Wa) {
      g = or;
      var A = v && $ === H && H.visualViewport ? H.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        $[U]
      );
      T -= A - o.height, T *= c ? 1 : -1;
    }
    if (a === xn || (a === wn || a === or) && s === Wa) {
      P = ar;
      var Z = v && $ === H && H.visualViewport ? H.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        $[_]
      );
      b -= Z - o.width, b *= c ? 1 : -1;
    }
  }
  var G = Object.assign({
    position: f
  }, p && zx), _e = h === !0 ? Wx({
    x: b,
    y: T
  }, Gn(n)) : {
    x: b,
    y: T
  };
  if (b = _e.x, T = _e.y, c) {
    var ye;
    return Object.assign({}, G, (ye = {}, ye[g] = F ? "0" : "", ye[P] = I ? "0" : "", ye.transform = (H.devicePixelRatio || 1) <= 1 ? "translate(" + b + "px, " + T + "px)" : "translate3d(" + b + "px, " + T + "px, 0)", ye));
  }
  return Object.assign({}, G, (t = {}, t[g] = F ? T + "px" : "", t[P] = I ? b + "px" : "", t.transform = "", t));
}
function Xx(e) {
  var t = e.state, n = e.options, o = n.gpuAcceleration, a = o === void 0 ? !0 : o, s = n.adaptive, l = s === void 0 ? !0 : s, f = n.roundOffsets, c = f === void 0 ? !0 : f, p = {
    placement: Ur(t.placement),
    variation: Vo(t.placement),
    popper: t.elements.popper,
    popperRect: t.rects.popper,
    gpuAcceleration: a,
    isFixed: t.options.strategy === "fixed"
  };
  t.modifiersData.popperOffsets != null && (t.styles.popper = Object.assign({}, t.styles.popper, Fv(Object.assign({}, p, {
    offsets: t.modifiersData.popperOffsets,
    position: t.options.strategy,
    adaptive: l,
    roundOffsets: c
  })))), t.modifiersData.arrow != null && (t.styles.arrow = Object.assign({}, t.styles.arrow, Fv(Object.assign({}, p, {
    offsets: t.modifiersData.arrow,
    position: "absolute",
    adaptive: !1,
    roundOffsets: c
  })))), t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-placement": t.placement
  });
}
const Yx = {
  name: "computeStyles",
  enabled: !0,
  phase: "beforeWrite",
  fn: Xx,
  data: {}
};
var ou = {
  passive: !0
};
function Vx(e) {
  var t = e.state, n = e.instance, o = e.options, a = o.scroll, s = a === void 0 ? !0 : a, l = o.resize, f = l === void 0 ? !0 : l, c = Gn(t.elements.popper), p = [].concat(t.scrollParents.reference, t.scrollParents.popper);
  return s && p.forEach(function(h) {
    h.addEventListener("scroll", n.update, ou);
  }), f && c.addEventListener("resize", n.update, ou), function() {
    s && p.forEach(function(h) {
      h.removeEventListener("scroll", n.update, ou);
    }), f && c.removeEventListener("resize", n.update, ou);
  };
}
const jx = {
  name: "eventListeners",
  enabled: !0,
  phase: "write",
  fn: function() {
  },
  effect: Vx,
  data: {}
};
var Kx = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function _u(e) {
  return e.replace(/left|right|bottom|top/g, function(t) {
    return Kx[t];
  });
}
var qx = {
  start: "end",
  end: "start"
};
function Bv(e) {
  return e.replace(/start|end/g, function(t) {
    return qx[t];
  });
}
function dd(e) {
  var t = Gn(e), n = t.pageXOffset, o = t.pageYOffset;
  return {
    scrollLeft: n,
    scrollTop: o
  };
}
function pd(e) {
  return Yo(wi(e)).left + dd(e).scrollLeft;
}
function Jx(e, t) {
  var n = Gn(e), o = wi(e), a = n.visualViewport, s = o.clientWidth, l = o.clientHeight, f = 0, c = 0;
  if (a) {
    s = a.width, l = a.height;
    var p = f0();
    (p || !p && t === "fixed") && (f = a.offsetLeft, c = a.offsetTop);
  }
  return {
    width: s,
    height: l,
    x: f + pd(e),
    y: c
  };
}
function Zx(e) {
  var t, n = wi(e), o = dd(e), a = (t = e.ownerDocument) == null ? void 0 : t.body, s = to(n.scrollWidth, n.clientWidth, a ? a.scrollWidth : 0, a ? a.clientWidth : 0), l = to(n.scrollHeight, n.clientHeight, a ? a.scrollHeight : 0, a ? a.clientHeight : 0), f = -o.scrollLeft + pd(e), c = -o.scrollTop;
  return li(a || n).direction === "rtl" && (f += to(n.clientWidth, a ? a.clientWidth : 0) - s), {
    width: s,
    height: l,
    x: f,
    y: c
  };
}
function hd(e) {
  var t = li(e), n = t.overflow, o = t.overflowX, a = t.overflowY;
  return /auto|scroll|overlay|hidden/.test(n + a + o);
}
function v0(e) {
  return ["html", "body", "#document"].indexOf(Br(e)) >= 0 ? e.ownerDocument.body : nr(e) && hd(e) ? e : v0(il(e));
}
function ka(e, t) {
  var n;
  t === void 0 && (t = []);
  var o = v0(e), a = o === ((n = e.ownerDocument) == null ? void 0 : n.body), s = Gn(o), l = a ? [s].concat(s.visualViewport || [], hd(o) ? o : []) : o, f = t.concat(l);
  return a ? f : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    f.concat(ka(il(l)))
  );
}
function bc(e) {
  return Object.assign({}, e, {
    left: e.x,
    top: e.y,
    right: e.x + e.width,
    bottom: e.y + e.height
  });
}
function Qx(e, t) {
  var n = Yo(e, !1, t === "fixed");
  return n.top = n.top + e.clientTop, n.left = n.left + e.clientLeft, n.bottom = n.top + e.clientHeight, n.right = n.left + e.clientWidth, n.width = e.clientWidth, n.height = e.clientHeight, n.x = n.left, n.y = n.top, n;
}
function Hv(e, t, n) {
  return t === s0 ? bc(Jx(e, n)) : ao(t) ? Qx(t, n) : bc(Zx(wi(e)));
}
function eC(e) {
  var t = ka(il(e)), n = ["absolute", "fixed"].indexOf(li(e).position) >= 0, o = n && nr(e) ? ns(e) : e;
  return ao(o) ? t.filter(function(a) {
    return ao(a) && c0(a, o) && Br(a) !== "body";
  }) : [];
}
function tC(e, t, n, o) {
  var a = t === "clippingParents" ? eC(e) : [].concat(t), s = [].concat(a, [n]), l = s[0], f = s.reduce(function(c, p) {
    var h = Hv(e, p, o);
    return c.top = to(h.top, c.top), c.right = Mu(h.right, c.right), c.bottom = Mu(h.bottom, c.bottom), c.left = to(h.left, c.left), c;
  }, Hv(e, l, o));
  return f.width = f.right - f.left, f.height = f.bottom - f.top, f.x = f.left, f.y = f.top, f;
}
function g0(e) {
  var t = e.reference, n = e.element, o = e.placement, a = o ? Ur(o) : null, s = o ? Vo(o) : null, l = t.x + t.width / 2 - n.width / 2, f = t.y + t.height / 2 - n.height / 2, c;
  switch (a) {
    case wn:
      c = {
        x: l,
        y: t.y - n.height
      };
      break;
    case or:
      c = {
        x: l,
        y: t.y + t.height
      };
      break;
    case ar:
      c = {
        x: t.x + t.width,
        y: f
      };
      break;
    case xn:
      c = {
        x: t.x - n.width,
        y: f
      };
      break;
    default:
      c = {
        x: t.x,
        y: t.y
      };
  }
  var p = a ? cd(a) : null;
  if (p != null) {
    var h = p === "y" ? "height" : "width";
    switch (s) {
      case Wo:
        c[p] = c[p] - (t[h] / 2 - n[h] / 2);
        break;
      case Wa:
        c[p] = c[p] + (t[h] / 2 - n[h] / 2);
        break;
    }
  }
  return c;
}
function Xa(e, t) {
  t === void 0 && (t = {});
  var n = t, o = n.placement, a = o === void 0 ? e.placement : o, s = n.strategy, l = s === void 0 ? e.strategy : s, f = n.boundary, c = f === void 0 ? Ax : f, p = n.rootBoundary, h = p === void 0 ? s0 : p, v = n.elementContext, E = v === void 0 ? ba : v, b = n.altBoundary, R = b === void 0 ? !1 : b, T = n.padding, x = T === void 0 ? 0 : T, I = p0(typeof x != "number" ? x : h0(x, ts)), F = E === ba ? bx : ba, P = e.rects.popper, g = e.elements[R ? F : E], H = tC(ao(g) ? g : g.contextElement || wi(e.elements.popper), c, h, l), $ = Yo(e.elements.reference), U = g0({
    reference: $,
    element: P,
    placement: a
  }), _ = bc(Object.assign({}, P, U)), A = E === ba ? _ : $, Z = {
    top: H.top - A.top + I.top,
    bottom: A.bottom - H.bottom + I.bottom,
    left: H.left - A.left + I.left,
    right: A.right - H.right + I.right
  }, G = e.modifiersData.offset;
  if (E === ba && G) {
    var _e = G[a];
    Object.keys(Z).forEach(function(ye) {
      var z = [ar, or].indexOf(ye) >= 0 ? 1 : -1, fe = [wn, or].indexOf(ye) >= 0 ? "y" : "x";
      Z[ye] += _e[fe] * z;
    });
  }
  return Z;
}
function nC(e, t) {
  t === void 0 && (t = {});
  var n = t, o = n.placement, a = n.boundary, s = n.rootBoundary, l = n.padding, f = n.flipVariations, c = n.allowedAutoPlacements, p = c === void 0 ? u0 : c, h = Vo(o), v = h ? f ? $v : $v.filter(function(R) {
    return Vo(R) === h;
  }) : ts, E = v.filter(function(R) {
    return p.indexOf(R) >= 0;
  });
  E.length === 0 && (E = v);
  var b = E.reduce(function(R, T) {
    return R[T] = Xa(e, {
      placement: T,
      boundary: a,
      rootBoundary: s,
      padding: l
    })[Ur(T)], R;
  }, {});
  return Object.keys(b).sort(function(R, T) {
    return b[R] - b[T];
  });
}
function rC(e) {
  if (Ur(e) === ud)
    return [];
  var t = _u(e);
  return [Bv(e), t, Bv(t)];
}
function iC(e) {
  var t = e.state, n = e.options, o = e.name;
  if (!t.modifiersData[o]._skip) {
    for (var a = n.mainAxis, s = a === void 0 ? !0 : a, l = n.altAxis, f = l === void 0 ? !0 : l, c = n.fallbackPlacements, p = n.padding, h = n.boundary, v = n.rootBoundary, E = n.altBoundary, b = n.flipVariations, R = b === void 0 ? !0 : b, T = n.allowedAutoPlacements, x = t.options.placement, I = Ur(x), F = I === x, P = c || (F || !R ? [_u(x)] : rC(x)), g = [x].concat(P).reduce(function(le, de) {
      return le.concat(Ur(de) === ud ? nC(t, {
        placement: de,
        boundary: h,
        rootBoundary: v,
        padding: p,
        flipVariations: R,
        allowedAutoPlacements: T
      }) : de);
    }, []), H = t.rects.reference, $ = t.rects.popper, U = /* @__PURE__ */ new Map(), _ = !0, A = g[0], Z = 0; Z < g.length; Z++) {
      var G = g[Z], _e = Ur(G), ye = Vo(G) === Wo, z = [wn, or].indexOf(_e) >= 0, fe = z ? "width" : "height", j = Xa(t, {
        placement: G,
        boundary: h,
        rootBoundary: v,
        altBoundary: E,
        padding: p
      }), se = z ? ye ? ar : xn : ye ? or : wn;
      H[fe] > $[fe] && (se = _u(se));
      var ue = _u(se), Te = [];
      if (s && Te.push(j[_e] <= 0), f && Te.push(j[se] <= 0, j[ue] <= 0), Te.every(function(le) {
        return le;
      })) {
        A = G, _ = !1;
        break;
      }
      U.set(G, Te);
    }
    if (_)
      for (var Ie = R ? 3 : 1, Me = function(de) {
        var V = g.find(function(O) {
          var W = U.get(O);
          if (W)
            return W.slice(0, de).every(function(J) {
              return J;
            });
        });
        if (V)
          return A = V, "break";
      }, he = Ie; he > 0; he--) {
        var Ee = Me(he);
        if (Ee === "break") break;
      }
    t.placement !== A && (t.modifiersData[o]._skip = !0, t.placement = A, t.reset = !0);
  }
}
const oC = {
  name: "flip",
  enabled: !0,
  phase: "main",
  fn: iC,
  requiresIfExists: ["offset"],
  data: {
    _skip: !1
  }
};
function Gv(e, t, n) {
  return n === void 0 && (n = {
    x: 0,
    y: 0
  }), {
    top: e.top - t.height - n.y,
    right: e.right - t.width + n.x,
    bottom: e.bottom - t.height + n.y,
    left: e.left - t.width - n.x
  };
}
function zv(e) {
  return [wn, ar, or, xn].some(function(t) {
    return e[t] >= 0;
  });
}
function aC(e) {
  var t = e.state, n = e.name, o = t.rects.reference, a = t.rects.popper, s = t.modifiersData.preventOverflow, l = Xa(t, {
    elementContext: "reference"
  }), f = Xa(t, {
    altBoundary: !0
  }), c = Gv(l, o), p = Gv(f, a, s), h = zv(c), v = zv(p);
  t.modifiersData[n] = {
    referenceClippingOffsets: c,
    popperEscapeOffsets: p,
    isReferenceHidden: h,
    hasPopperEscaped: v
  }, t.attributes.popper = Object.assign({}, t.attributes.popper, {
    "data-popper-reference-hidden": h,
    "data-popper-escaped": v
  });
}
const sC = {
  name: "hide",
  enabled: !0,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: aC
};
function uC(e, t, n) {
  var o = Ur(e), a = [xn, wn].indexOf(o) >= 0 ? -1 : 1, s = typeof n == "function" ? n(Object.assign({}, t, {
    placement: e
  })) : n, l = s[0], f = s[1];
  return l = l || 0, f = (f || 0) * a, [xn, ar].indexOf(o) >= 0 ? {
    x: f,
    y: l
  } : {
    x: l,
    y: f
  };
}
function lC(e) {
  var t = e.state, n = e.options, o = e.name, a = n.offset, s = a === void 0 ? [0, 0] : a, l = u0.reduce(function(h, v) {
    return h[v] = uC(v, t.rects, s), h;
  }, {}), f = l[t.placement], c = f.x, p = f.y;
  t.modifiersData.popperOffsets != null && (t.modifiersData.popperOffsets.x += c, t.modifiersData.popperOffsets.y += p), t.modifiersData[o] = l;
}
const fC = {
  name: "offset",
  enabled: !0,
  phase: "main",
  requires: ["popperOffsets"],
  fn: lC
};
function cC(e) {
  var t = e.state, n = e.name;
  t.modifiersData[n] = g0({
    reference: t.rects.reference,
    element: t.rects.popper,
    placement: t.placement
  });
}
const dC = {
  name: "popperOffsets",
  enabled: !0,
  phase: "read",
  fn: cC,
  data: {}
};
function pC(e) {
  return e === "x" ? "y" : "x";
}
function hC(e) {
  var t = e.state, n = e.options, o = e.name, a = n.mainAxis, s = a === void 0 ? !0 : a, l = n.altAxis, f = l === void 0 ? !1 : l, c = n.boundary, p = n.rootBoundary, h = n.altBoundary, v = n.padding, E = n.tether, b = E === void 0 ? !0 : E, R = n.tetherOffset, T = R === void 0 ? 0 : R, x = Xa(t, {
    boundary: c,
    rootBoundary: p,
    padding: v,
    altBoundary: h
  }), I = Ur(t.placement), F = Vo(t.placement), P = !F, g = cd(I), H = pC(g), $ = t.modifiersData.popperOffsets, U = t.rects.reference, _ = t.rects.popper, A = typeof T == "function" ? T(Object.assign({}, t.rects, {
    placement: t.placement
  })) : T, Z = typeof A == "number" ? {
    mainAxis: A,
    altAxis: A
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, A), G = t.modifiersData.offset ? t.modifiersData.offset[t.placement] : null, _e = {
    x: 0,
    y: 0
  };
  if ($) {
    if (s) {
      var ye, z = g === "y" ? wn : xn, fe = g === "y" ? or : ar, j = g === "y" ? "height" : "width", se = $[g], ue = se + x[z], Te = se - x[fe], Ie = b ? -_[j] / 2 : 0, Me = F === Wo ? U[j] : _[j], he = F === Wo ? -_[j] : -U[j], Ee = t.elements.arrow, le = b && Ee ? fd(Ee) : {
        width: 0,
        height: 0
      }, de = t.modifiersData["arrow#persistent"] ? t.modifiersData["arrow#persistent"].padding : d0(), V = de[z], O = de[fe], W = $a(0, U[j], le[j]), J = P ? U[j] / 2 - Ie - W - V - Z.mainAxis : Me - W - V - Z.mainAxis, Q = P ? -U[j] / 2 + Ie + W + O + Z.mainAxis : he + W + O + Z.mainAxis, ie = t.elements.arrow && ns(t.elements.arrow), Ae = ie ? g === "y" ? ie.clientTop || 0 : ie.clientLeft || 0 : 0, Fe = (ye = G?.[g]) != null ? ye : 0, Ye = se + J - Fe - Ae, pt = se + Q - Fe, zt = $a(b ? Mu(ue, Ye) : ue, se, b ? to(Te, pt) : Te);
      $[g] = zt, _e[g] = zt - se;
    }
    if (f) {
      var ht, Yt = g === "x" ? wn : xn, gn = g === "x" ? or : ar, At = $[H], vt = H === "y" ? "height" : "width", Vt = At + x[Yt], Mt = At - x[gn], Ft = [wn, xn].indexOf(I) !== -1, Qt = (ht = G?.[H]) != null ? ht : 0, en = Ft ? Vt : At - U[vt] - _[vt] - Qt + Z.altAxis, Wt = Ft ? At + U[vt] + _[vt] - Qt - Z.altAxis : Mt, jt = b && Ft ? kx(en, At, Wt) : $a(b ? en : Vt, At, b ? Wt : Mt);
      $[H] = jt, _e[H] = jt - At;
    }
    t.modifiersData[o] = _e;
  }
}
const vC = {
  name: "preventOverflow",
  enabled: !0,
  phase: "main",
  fn: hC,
  requiresIfExists: ["offset"]
};
function gC(e) {
  return {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  };
}
function mC(e) {
  return e === Gn(e) || !nr(e) ? dd(e) : gC(e);
}
function EC(e) {
  var t = e.getBoundingClientRect(), n = Xo(t.width) / e.offsetWidth || 1, o = Xo(t.height) / e.offsetHeight || 1;
  return n !== 1 || o !== 1;
}
function _C(e, t, n) {
  n === void 0 && (n = !1);
  var o = nr(t), a = nr(t) && EC(t), s = wi(t), l = Yo(e, a, n), f = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = {
    x: 0,
    y: 0
  };
  return (o || !o && !n) && ((Br(t) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
  hd(s)) && (f = mC(t)), nr(t) ? (c = Yo(t, !0), c.x += t.clientLeft, c.y += t.clientTop) : s && (c.x = pd(s))), {
    x: l.left + f.scrollLeft - c.x,
    y: l.top + f.scrollTop - c.y,
    width: l.width,
    height: l.height
  };
}
function yC(e) {
  var t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), o = [];
  e.forEach(function(s) {
    t.set(s.name, s);
  });
  function a(s) {
    n.add(s.name);
    var l = [].concat(s.requires || [], s.requiresIfExists || []);
    l.forEach(function(f) {
      if (!n.has(f)) {
        var c = t.get(f);
        c && a(c);
      }
    }), o.push(s);
  }
  return e.forEach(function(s) {
    n.has(s.name) || a(s);
  }), o;
}
function TC(e) {
  var t = yC(e);
  return Mx.reduce(function(n, o) {
    return n.concat(t.filter(function(a) {
      return a.phase === o;
    }));
  }, []);
}
function AC(e) {
  var t;
  return function() {
    return t || (t = new Promise(function(n) {
      Promise.resolve().then(function() {
        t = void 0, n(e());
      });
    })), t;
  };
}
function bC(e) {
  var t = e.reduce(function(n, o) {
    var a = n[o.name];
    return n[o.name] = a ? Object.assign({}, a, o, {
      options: Object.assign({}, a.options, o.options),
      data: Object.assign({}, a.data, o.data)
    }) : o, n;
  }, {});
  return Object.keys(t).map(function(n) {
    return t[n];
  });
}
var Wv = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function Xv() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return !t.some(function(o) {
    return !(o && typeof o.getBoundingClientRect == "function");
  });
}
function OC(e) {
  e === void 0 && (e = {});
  var t = e, n = t.defaultModifiers, o = n === void 0 ? [] : n, a = t.defaultOptions, s = a === void 0 ? Wv : a;
  return function(f, c, p) {
    p === void 0 && (p = s);
    var h = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, Wv, s),
      modifiersData: {},
      elements: {
        reference: f,
        popper: c
      },
      attributes: {},
      styles: {}
    }, v = [], E = !1, b = {
      state: h,
      setOptions: function(I) {
        var F = typeof I == "function" ? I(h.options) : I;
        T(), h.options = Object.assign({}, s, h.options, F), h.scrollParents = {
          reference: ao(f) ? ka(f) : f.contextElement ? ka(f.contextElement) : [],
          popper: ka(c)
        };
        var P = TC(bC([].concat(o, h.options.modifiers)));
        return h.orderedModifiers = P.filter(function(g) {
          return g.enabled;
        }), R(), b.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function() {
        if (!E) {
          var I = h.elements, F = I.reference, P = I.popper;
          if (Xv(F, P)) {
            h.rects = {
              reference: _C(F, ns(P), h.options.strategy === "fixed"),
              popper: fd(P)
            }, h.reset = !1, h.placement = h.options.placement, h.orderedModifiers.forEach(function(Z) {
              return h.modifiersData[Z.name] = Object.assign({}, Z.data);
            });
            for (var g = 0; g < h.orderedModifiers.length; g++) {
              if (h.reset === !0) {
                h.reset = !1, g = -1;
                continue;
              }
              var H = h.orderedModifiers[g], $ = H.fn, U = H.options, _ = U === void 0 ? {} : U, A = H.name;
              typeof $ == "function" && (h = $({
                state: h,
                options: _,
                name: A,
                instance: b
              }) || h);
            }
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: AC(function() {
        return new Promise(function(x) {
          b.forceUpdate(), x(h);
        });
      }),
      destroy: function() {
        T(), E = !0;
      }
    };
    if (!Xv(f, c))
      return b;
    b.setOptions(p).then(function(x) {
      !E && p.onFirstUpdate && p.onFirstUpdate(x);
    });
    function R() {
      h.orderedModifiers.forEach(function(x) {
        var I = x.name, F = x.options, P = F === void 0 ? {} : F, g = x.effect;
        if (typeof g == "function") {
          var H = g({
            state: h,
            name: I,
            instance: b,
            options: P
          }), $ = function() {
          };
          v.push(H || $);
        }
      });
    }
    function T() {
      v.forEach(function(x) {
        return x();
      }), v = [];
    }
    return b;
  };
}
var NC = [jx, dC, Yx, l0, fC, oC, vC, Gx, sC], SC = /* @__PURE__ */ OC({
  defaultModifiers: NC
}), IC = "tippy-box", m0 = "tippy-content", RC = "tippy-backdrop", E0 = "tippy-arrow", _0 = "tippy-svg-arrow", Vi = {
  passive: !0,
  capture: !0
}, y0 = function() {
  return document.body;
};
function Hf(e, t, n) {
  if (Array.isArray(e)) {
    var o = e[t];
    return o ?? (Array.isArray(n) ? n[t] : n);
  }
  return e;
}
function vd(e, t) {
  var n = {}.toString.call(e);
  return n.indexOf("[object") === 0 && n.indexOf(t + "]") > -1;
}
function T0(e, t) {
  return typeof e == "function" ? e.apply(void 0, t) : e;
}
function Yv(e, t) {
  if (t === 0)
    return e;
  var n;
  return function(o) {
    clearTimeout(n), n = setTimeout(function() {
      e(o);
    }, t);
  };
}
function wC(e, t) {
  var n = Object.assign({}, e);
  return t.forEach(function(o) {
    delete n[o];
  }), n;
}
function xC(e) {
  return e.split(/\s+/).filter(Boolean);
}
function qi(e) {
  return [].concat(e);
}
function Vv(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function CC(e) {
  return e.filter(function(t, n) {
    return e.indexOf(t) === n;
  });
}
function LC(e) {
  return e.split("-")[0];
}
function Du(e) {
  return [].slice.call(e);
}
function jv(e) {
  return Object.keys(e).reduce(function(t, n) {
    return e[n] !== void 0 && (t[n] = e[n]), t;
  }, {});
}
function Po() {
  return document.createElement("div");
}
function ol(e) {
  return ["Element", "Fragment"].some(function(t) {
    return vd(e, t);
  });
}
function MC(e) {
  return vd(e, "NodeList");
}
function DC(e) {
  return vd(e, "MouseEvent");
}
function PC(e) {
  return !!(e && e._tippy && e._tippy.reference === e);
}
function UC(e) {
  return ol(e) ? [e] : MC(e) ? Du(e) : Array.isArray(e) ? e : Du(document.querySelectorAll(e));
}
function Gf(e, t) {
  e.forEach(function(n) {
    n && (n.style.transitionDuration = t + "ms");
  });
}
function Kv(e, t) {
  e.forEach(function(n) {
    n && n.setAttribute("data-state", t);
  });
}
function $C(e) {
  var t, n = qi(e), o = n[0];
  return o != null && (t = o.ownerDocument) != null && t.body ? o.ownerDocument : document;
}
function kC(e, t) {
  var n = t.clientX, o = t.clientY;
  return e.every(function(a) {
    var s = a.popperRect, l = a.popperState, f = a.props, c = f.interactiveBorder, p = LC(l.placement), h = l.modifiersData.offset;
    if (!h)
      return !0;
    var v = p === "bottom" ? h.top.y : 0, E = p === "top" ? h.bottom.y : 0, b = p === "right" ? h.left.x : 0, R = p === "left" ? h.right.x : 0, T = s.top - o + v > c, x = o - s.bottom - E > c, I = s.left - n + b > c, F = n - s.right - R > c;
    return T || x || I || F;
  });
}
function zf(e, t, n) {
  var o = t + "EventListener";
  ["transitionend", "webkitTransitionEnd"].forEach(function(a) {
    e[o](a, n);
  });
}
function qv(e, t) {
  for (var n = t; n; ) {
    var o;
    if (e.contains(n))
      return !0;
    n = n.getRootNode == null || (o = n.getRootNode()) == null ? void 0 : o.host;
  }
  return !1;
}
var Cr = {
  isTouch: !1
}, Jv = 0;
function FC() {
  Cr.isTouch || (Cr.isTouch = !0, window.performance && document.addEventListener("mousemove", A0));
}
function A0() {
  var e = performance.now();
  e - Jv < 20 && (Cr.isTouch = !1, document.removeEventListener("mousemove", A0)), Jv = e;
}
function BC() {
  var e = document.activeElement;
  if (PC(e)) {
    var t = e._tippy;
    e.blur && !t.state.isVisible && e.blur();
  }
}
function HC() {
  document.addEventListener("touchstart", FC, Vi), window.addEventListener("blur", BC);
}
var GC = typeof window < "u" && typeof document < "u", zC = GC ? (
  // @ts-ignore
  !!window.msCrypto
) : !1, WC = {
  animateFill: !1,
  followCursor: !1,
  inlinePositioning: !1,
  sticky: !1
}, XC = {
  allowHTML: !1,
  animation: "fade",
  arrow: !0,
  content: "",
  inertia: !1,
  maxWidth: 350,
  role: "tooltip",
  theme: "",
  zIndex: 9999
}, _r = Object.assign({
  appendTo: y0,
  aria: {
    content: "auto",
    expanded: "auto"
  },
  delay: 0,
  duration: [300, 250],
  getReferenceClientRect: null,
  hideOnClick: !0,
  ignoreAttributes: !1,
  interactive: !1,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  moveTransition: "",
  offset: [0, 10],
  onAfterUpdate: function() {
  },
  onBeforeUpdate: function() {
  },
  onCreate: function() {
  },
  onDestroy: function() {
  },
  onHidden: function() {
  },
  onHide: function() {
  },
  onMount: function() {
  },
  onShow: function() {
  },
  onShown: function() {
  },
  onTrigger: function() {
  },
  onUntrigger: function() {
  },
  onClickOutside: function() {
  },
  placement: "top",
  plugins: [],
  popperOptions: {},
  render: null,
  showOnCreate: !1,
  touch: !0,
  trigger: "mouseenter focus",
  triggerTarget: null
}, WC, XC), YC = Object.keys(_r), VC = function(t) {
  var n = Object.keys(t);
  n.forEach(function(o) {
    _r[o] = t[o];
  });
};
function b0(e) {
  var t = e.plugins || [], n = t.reduce(function(o, a) {
    var s = a.name, l = a.defaultValue;
    if (s) {
      var f;
      o[s] = e[s] !== void 0 ? e[s] : (f = _r[s]) != null ? f : l;
    }
    return o;
  }, {});
  return Object.assign({}, e, n);
}
function jC(e, t) {
  var n = t ? Object.keys(b0(Object.assign({}, _r, {
    plugins: t
  }))) : YC, o = n.reduce(function(a, s) {
    var l = (e.getAttribute("data-tippy-" + s) || "").trim();
    if (!l)
      return a;
    if (s === "content")
      a[s] = l;
    else
      try {
        a[s] = JSON.parse(l);
      } catch {
        a[s] = l;
      }
    return a;
  }, {});
  return o;
}
function Zv(e, t) {
  var n = Object.assign({}, t, {
    content: T0(t.content, [e])
  }, t.ignoreAttributes ? {} : jC(e, t.plugins));
  return n.aria = Object.assign({}, _r.aria, n.aria), n.aria = {
    expanded: n.aria.expanded === "auto" ? t.interactive : n.aria.expanded,
    content: n.aria.content === "auto" ? t.interactive ? null : "describedby" : n.aria.content
  }, n;
}
var KC = function() {
  return "innerHTML";
};
function Oc(e, t) {
  e[KC()] = t;
}
function Qv(e) {
  var t = Po();
  return e === !0 ? t.className = E0 : (t.className = _0, ol(e) ? t.appendChild(e) : Oc(t, e)), t;
}
function eg(e, t) {
  ol(t.content) ? (Oc(e, ""), e.appendChild(t.content)) : typeof t.content != "function" && (t.allowHTML ? Oc(e, t.content) : e.textContent = t.content);
}
function Nc(e) {
  var t = e.firstElementChild, n = Du(t.children);
  return {
    box: t,
    content: n.find(function(o) {
      return o.classList.contains(m0);
    }),
    arrow: n.find(function(o) {
      return o.classList.contains(E0) || o.classList.contains(_0);
    }),
    backdrop: n.find(function(o) {
      return o.classList.contains(RC);
    })
  };
}
function O0(e) {
  var t = Po(), n = Po();
  n.className = IC, n.setAttribute("data-state", "hidden"), n.setAttribute("tabindex", "-1");
  var o = Po();
  o.className = m0, o.setAttribute("data-state", "hidden"), eg(o, e.props), t.appendChild(n), n.appendChild(o), a(e.props, e.props);
  function a(s, l) {
    var f = Nc(t), c = f.box, p = f.content, h = f.arrow;
    l.theme ? c.setAttribute("data-theme", l.theme) : c.removeAttribute("data-theme"), typeof l.animation == "string" ? c.setAttribute("data-animation", l.animation) : c.removeAttribute("data-animation"), l.inertia ? c.setAttribute("data-inertia", "") : c.removeAttribute("data-inertia"), c.style.maxWidth = typeof l.maxWidth == "number" ? l.maxWidth + "px" : l.maxWidth, l.role ? c.setAttribute("role", l.role) : c.removeAttribute("role"), (s.content !== l.content || s.allowHTML !== l.allowHTML) && eg(p, e.props), l.arrow ? h ? s.arrow !== l.arrow && (c.removeChild(h), c.appendChild(Qv(l.arrow))) : c.appendChild(Qv(l.arrow)) : h && c.removeChild(h);
  }
  return {
    popper: t,
    onUpdate: a
  };
}
O0.$$tippy = !0;
var qC = 1, au = [], Wf = [];
function JC(e, t) {
  var n = Zv(e, Object.assign({}, _r, b0(jv(t)))), o, a, s, l = !1, f = !1, c = !1, p = !1, h, v, E, b = [], R = Yv(Ye, n.interactiveDebounce), T, x = qC++, I = null, F = CC(n.plugins), P = {
    // Is the instance currently enabled?
    isEnabled: !0,
    // Is the tippy currently showing and not transitioning out?
    isVisible: !1,
    // Has the instance been destroyed?
    isDestroyed: !1,
    // Is the tippy currently mounted to the DOM?
    isMounted: !1,
    // Has the tippy finished transitioning in?
    isShown: !1
  }, g = {
    // properties
    id: x,
    reference: e,
    popper: Po(),
    popperInstance: I,
    props: n,
    state: P,
    plugins: F,
    // methods
    clearDelayTimeouts: en,
    setProps: Wt,
    setContent: jt,
    show: zr,
    hide: Wr,
    hideWithInteractivity: Xr,
    enable: Ft,
    disable: Qt,
    unmount: Yr,
    destroy: Vr
  };
  if (!n.render)
    return g;
  var H = n.render(g), $ = H.popper, U = H.onUpdate;
  $.setAttribute("data-tippy-root", ""), $.id = "tippy-" + g.id, g.popper = $, e._tippy = g, $._tippy = g;
  var _ = F.map(function(C) {
    return C.fn(g);
  }), A = e.hasAttribute("aria-expanded");
  return ie(), Ie(), se(), ue("onCreate", [g]), n.showOnCreate && Vt(), $.addEventListener("mouseenter", function() {
    g.props.interactive && g.state.isVisible && g.clearDelayTimeouts();
  }), $.addEventListener("mouseleave", function() {
    g.props.interactive && g.props.trigger.indexOf("mouseenter") >= 0 && z().addEventListener("mousemove", R);
  }), g;
  function Z() {
    var C = g.props.touch;
    return Array.isArray(C) ? C : [C, 0];
  }
  function G() {
    return Z()[0] === "hold";
  }
  function _e() {
    var C;
    return !!((C = g.props.render) != null && C.$$tippy);
  }
  function ye() {
    return T || e;
  }
  function z() {
    var C = ye().parentNode;
    return C ? $C(C) : document;
  }
  function fe() {
    return Nc($);
  }
  function j(C) {
    return g.state.isMounted && !g.state.isVisible || Cr.isTouch || h && h.type === "focus" ? 0 : Hf(g.props.delay, C ? 0 : 1, _r.delay);
  }
  function se(C) {
    C === void 0 && (C = !1), $.style.pointerEvents = g.props.interactive && !C ? "" : "none", $.style.zIndex = "" + g.props.zIndex;
  }
  function ue(C, ee, pe) {
    if (pe === void 0 && (pe = !0), _.forEach(function(Se) {
      Se[C] && Se[C].apply(Se, ee);
    }), pe) {
      var xe;
      (xe = g.props)[C].apply(xe, ee);
    }
  }
  function Te() {
    var C = g.props.aria;
    if (C.content) {
      var ee = "aria-" + C.content, pe = $.id, xe = qi(g.props.triggerTarget || e);
      xe.forEach(function(Se) {
        var at = Se.getAttribute(ee);
        if (g.state.isVisible)
          Se.setAttribute(ee, at ? at + " " + pe : pe);
        else {
          var _t = at && at.replace(pe, "").trim();
          _t ? Se.setAttribute(ee, _t) : Se.removeAttribute(ee);
        }
      });
    }
  }
  function Ie() {
    if (!(A || !g.props.aria.expanded)) {
      var C = qi(g.props.triggerTarget || e);
      C.forEach(function(ee) {
        g.props.interactive ? ee.setAttribute("aria-expanded", g.state.isVisible && ee === ye() ? "true" : "false") : ee.removeAttribute("aria-expanded");
      });
    }
  }
  function Me() {
    z().removeEventListener("mousemove", R), au = au.filter(function(C) {
      return C !== R;
    });
  }
  function he(C) {
    if (!(Cr.isTouch && (c || C.type === "mousedown"))) {
      var ee = C.composedPath && C.composedPath()[0] || C.target;
      if (!(g.props.interactive && qv($, ee))) {
        if (qi(g.props.triggerTarget || e).some(function(pe) {
          return qv(pe, ee);
        })) {
          if (Cr.isTouch || g.state.isVisible && g.props.trigger.indexOf("click") >= 0)
            return;
        } else
          ue("onClickOutside", [g, C]);
        g.props.hideOnClick === !0 && (g.clearDelayTimeouts(), g.hide(), f = !0, setTimeout(function() {
          f = !1;
        }), g.state.isMounted || V());
      }
    }
  }
  function Ee() {
    c = !0;
  }
  function le() {
    c = !1;
  }
  function de() {
    var C = z();
    C.addEventListener("mousedown", he, !0), C.addEventListener("touchend", he, Vi), C.addEventListener("touchstart", le, Vi), C.addEventListener("touchmove", Ee, Vi);
  }
  function V() {
    var C = z();
    C.removeEventListener("mousedown", he, !0), C.removeEventListener("touchend", he, Vi), C.removeEventListener("touchstart", le, Vi), C.removeEventListener("touchmove", Ee, Vi);
  }
  function O(C, ee) {
    J(C, function() {
      !g.state.isVisible && $.parentNode && $.parentNode.contains($) && ee();
    });
  }
  function W(C, ee) {
    J(C, ee);
  }
  function J(C, ee) {
    var pe = fe().box;
    function xe(Se) {
      Se.target === pe && (zf(pe, "remove", xe), ee());
    }
    if (C === 0)
      return ee();
    zf(pe, "remove", v), zf(pe, "add", xe), v = xe;
  }
  function Q(C, ee, pe) {
    pe === void 0 && (pe = !1);
    var xe = qi(g.props.triggerTarget || e);
    xe.forEach(function(Se) {
      Se.addEventListener(C, ee, pe), b.push({
        node: Se,
        eventType: C,
        handler: ee,
        options: pe
      });
    });
  }
  function ie() {
    G() && (Q("touchstart", Fe, {
      passive: !0
    }), Q("touchend", pt, {
      passive: !0
    })), xC(g.props.trigger).forEach(function(C) {
      if (C !== "manual")
        switch (Q(C, Fe), C) {
          case "mouseenter":
            Q("mouseleave", pt);
            break;
          case "focus":
            Q(zC ? "focusout" : "blur", zt);
            break;
          case "focusin":
            Q("focusout", zt);
            break;
        }
    });
  }
  function Ae() {
    b.forEach(function(C) {
      var ee = C.node, pe = C.eventType, xe = C.handler, Se = C.options;
      ee.removeEventListener(pe, xe, Se);
    }), b = [];
  }
  function Fe(C) {
    var ee, pe = !1;
    if (!(!g.state.isEnabled || ht(C) || f)) {
      var xe = ((ee = h) == null ? void 0 : ee.type) === "focus";
      h = C, T = C.currentTarget, Ie(), !g.state.isVisible && DC(C) && au.forEach(function(Se) {
        return Se(C);
      }), C.type === "click" && (g.props.trigger.indexOf("mouseenter") < 0 || l) && g.props.hideOnClick !== !1 && g.state.isVisible ? pe = !0 : Vt(C), C.type === "click" && (l = !pe), pe && !xe && Mt(C);
    }
  }
  function Ye(C) {
    var ee = C.target, pe = ye().contains(ee) || $.contains(ee);
    if (!(C.type === "mousemove" && pe)) {
      var xe = vt().concat($).map(function(Se) {
        var at, _t = Se._tippy, tn = (at = _t.popperInstance) == null ? void 0 : at.state;
        return tn ? {
          popperRect: Se.getBoundingClientRect(),
          popperState: tn,
          props: n
        } : null;
      }).filter(Boolean);
      kC(xe, C) && (Me(), Mt(C));
    }
  }
  function pt(C) {
    var ee = ht(C) || g.props.trigger.indexOf("click") >= 0 && l;
    if (!ee) {
      if (g.props.interactive) {
        g.hideWithInteractivity(C);
        return;
      }
      Mt(C);
    }
  }
  function zt(C) {
    g.props.trigger.indexOf("focusin") < 0 && C.target !== ye() || g.props.interactive && C.relatedTarget && $.contains(C.relatedTarget) || Mt(C);
  }
  function ht(C) {
    return Cr.isTouch ? G() !== C.type.indexOf("touch") >= 0 : !1;
  }
  function Yt() {
    gn();
    var C = g.props, ee = C.popperOptions, pe = C.placement, xe = C.offset, Se = C.getReferenceClientRect, at = C.moveTransition, _t = _e() ? Nc($).arrow : null, tn = Se ? {
      getBoundingClientRect: Se,
      contextElement: Se.contextElement || ye()
    } : e, sr = {
      name: "$$tippy",
      enabled: !0,
      phase: "beforeWrite",
      requires: ["computeStyles"],
      fn: function(te) {
        var ve = te.state;
        if (_e()) {
          var Ge = fe(), gt = Ge.box;
          ["placement", "reference-hidden", "escaped"].forEach(function(ct) {
            ct === "placement" ? gt.setAttribute("data-placement", ve.placement) : ve.attributes.popper["data-popper-" + ct] ? gt.setAttribute("data-" + ct, "") : gt.removeAttribute("data-" + ct);
          }), ve.attributes.popper = {};
        }
      }
    }, xt = [{
      name: "offset",
      options: {
        offset: xe
      }
    }, {
      name: "preventOverflow",
      options: {
        padding: {
          top: 2,
          bottom: 2,
          left: 5,
          right: 5
        }
      }
    }, {
      name: "flip",
      options: {
        padding: 5
      }
    }, {
      name: "computeStyles",
      options: {
        adaptive: !at
      }
    }, sr];
    _e() && _t && xt.push({
      name: "arrow",
      options: {
        element: _t,
        padding: 3
      }
    }), xt.push.apply(xt, ee?.modifiers || []), g.popperInstance = SC(tn, $, Object.assign({}, ee, {
      placement: pe,
      onFirstUpdate: E,
      modifiers: xt
    }));
  }
  function gn() {
    g.popperInstance && (g.popperInstance.destroy(), g.popperInstance = null);
  }
  function At() {
    var C = g.props.appendTo, ee, pe = ye();
    g.props.interactive && C === y0 || C === "parent" ? ee = pe.parentNode : ee = T0(C, [pe]), ee.contains($) || ee.appendChild($), g.state.isMounted = !0, Yt();
  }
  function vt() {
    return Du($.querySelectorAll("[data-tippy-root]"));
  }
  function Vt(C) {
    g.clearDelayTimeouts(), C && ue("onTrigger", [g, C]), de();
    var ee = j(!0), pe = Z(), xe = pe[0], Se = pe[1];
    Cr.isTouch && xe === "hold" && Se && (ee = Se), ee ? o = setTimeout(function() {
      g.show();
    }, ee) : g.show();
  }
  function Mt(C) {
    if (g.clearDelayTimeouts(), ue("onUntrigger", [g, C]), !g.state.isVisible) {
      V();
      return;
    }
    if (!(g.props.trigger.indexOf("mouseenter") >= 0 && g.props.trigger.indexOf("click") >= 0 && ["mouseleave", "mousemove"].indexOf(C.type) >= 0 && l)) {
      var ee = j(!1);
      ee ? a = setTimeout(function() {
        g.state.isVisible && g.hide();
      }, ee) : s = requestAnimationFrame(function() {
        g.hide();
      });
    }
  }
  function Ft() {
    g.state.isEnabled = !0;
  }
  function Qt() {
    g.hide(), g.state.isEnabled = !1;
  }
  function en() {
    clearTimeout(o), clearTimeout(a), cancelAnimationFrame(s);
  }
  function Wt(C) {
    if (!g.state.isDestroyed) {
      ue("onBeforeUpdate", [g, C]), Ae();
      var ee = g.props, pe = Zv(e, Object.assign({}, ee, jv(C), {
        ignoreAttributes: !0
      }));
      g.props = pe, ie(), ee.interactiveDebounce !== pe.interactiveDebounce && (Me(), R = Yv(Ye, pe.interactiveDebounce)), ee.triggerTarget && !pe.triggerTarget ? qi(ee.triggerTarget).forEach(function(xe) {
        xe.removeAttribute("aria-expanded");
      }) : pe.triggerTarget && e.removeAttribute("aria-expanded"), Ie(), se(), U && U(ee, pe), g.popperInstance && (Yt(), vt().forEach(function(xe) {
        requestAnimationFrame(xe._tippy.popperInstance.forceUpdate);
      })), ue("onAfterUpdate", [g, C]);
    }
  }
  function jt(C) {
    g.setProps({
      content: C
    });
  }
  function zr() {
    var C = g.state.isVisible, ee = g.state.isDestroyed, pe = !g.state.isEnabled, xe = Cr.isTouch && !g.props.touch, Se = Hf(g.props.duration, 0, _r.duration);
    if (!(C || ee || pe || xe) && !ye().hasAttribute("disabled") && (ue("onShow", [g], !1), g.props.onShow(g) !== !1)) {
      if (g.state.isVisible = !0, _e() && ($.style.visibility = "visible"), se(), de(), g.state.isMounted || ($.style.transition = "none"), _e()) {
        var at = fe(), _t = at.box, tn = at.content;
        Gf([_t, tn], 0);
      }
      E = function() {
        var xt;
        if (!(!g.state.isVisible || p)) {
          if (p = !0, $.offsetHeight, $.style.transition = g.props.moveTransition, _e() && g.props.animation) {
            var M = fe(), te = M.box, ve = M.content;
            Gf([te, ve], Se), Kv([te, ve], "visible");
          }
          Te(), Ie(), Vv(Wf, g), (xt = g.popperInstance) == null || xt.forceUpdate(), ue("onMount", [g]), g.props.animation && _e() && W(Se, function() {
            g.state.isShown = !0, ue("onShown", [g]);
          });
        }
      }, At();
    }
  }
  function Wr() {
    var C = !g.state.isVisible, ee = g.state.isDestroyed, pe = !g.state.isEnabled, xe = Hf(g.props.duration, 1, _r.duration);
    if (!(C || ee || pe) && (ue("onHide", [g], !1), g.props.onHide(g) !== !1)) {
      if (g.state.isVisible = !1, g.state.isShown = !1, p = !1, l = !1, _e() && ($.style.visibility = "hidden"), Me(), V(), se(!0), _e()) {
        var Se = fe(), at = Se.box, _t = Se.content;
        g.props.animation && (Gf([at, _t], xe), Kv([at, _t], "hidden"));
      }
      Te(), Ie(), g.props.animation ? _e() && O(xe, g.unmount) : g.unmount();
    }
  }
  function Xr(C) {
    z().addEventListener("mousemove", R), Vv(au, R), R(C);
  }
  function Yr() {
    g.state.isVisible && g.hide(), g.state.isMounted && (gn(), vt().forEach(function(C) {
      C._tippy.unmount();
    }), $.parentNode && $.parentNode.removeChild($), Wf = Wf.filter(function(C) {
      return C !== g;
    }), g.state.isMounted = !1, ue("onHidden", [g]));
  }
  function Vr() {
    g.state.isDestroyed || (g.clearDelayTimeouts(), g.unmount(), Ae(), delete e._tippy, g.state.isDestroyed = !0, ue("onDestroy", [g]));
  }
}
function Qo(e, t) {
  t === void 0 && (t = {});
  var n = _r.plugins.concat(t.plugins || []);
  HC();
  var o = Object.assign({}, t, {
    plugins: n
  }), a = UC(e), s = a.reduce(function(l, f) {
    var c = f && JC(f, o);
    return c && l.push(c), l;
  }, []);
  return ol(e) ? s[0] : s;
}
Qo.defaultProps = _r;
Qo.setDefaultProps = VC;
Qo.currentInput = Cr;
var ZC = Object.assign({}, l0, {
  effect: function(t) {
    var n = t.state, o = {
      popper: {
        position: n.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(n.elements.popper.style, o.popper), n.styles = o, n.elements.arrow && Object.assign(n.elements.arrow.style, o.arrow);
  }
}), QC = function(t, n) {
  var o;
  n === void 0 && (n = {});
  var a = t, s = [], l = [], f, c = n.overrides, p = [], h = !1;
  function v() {
    l = a.map(function(g) {
      return qi(g.props.triggerTarget || g.reference);
    }).reduce(function(g, H) {
      return g.concat(H);
    }, []);
  }
  function E() {
    s = a.map(function(g) {
      return g.reference;
    });
  }
  function b(g) {
    a.forEach(function(H) {
      g ? H.enable() : H.disable();
    });
  }
  function R(g) {
    return a.map(function(H) {
      var $ = H.setProps;
      return H.setProps = function(U) {
        $(U), H.reference === f && g.setProps(U);
      }, function() {
        H.setProps = $;
      };
    });
  }
  function T(g, H) {
    var $ = l.indexOf(H);
    if (H !== f) {
      f = H;
      var U = (c || []).concat("content").reduce(function(_, A) {
        return _[A] = a[$].props[A], _;
      }, {});
      g.setProps(Object.assign({}, U, {
        getReferenceClientRect: typeof U.getReferenceClientRect == "function" ? U.getReferenceClientRect : function() {
          var _;
          return (_ = s[$]) == null ? void 0 : _.getBoundingClientRect();
        }
      }));
    }
  }
  b(!1), E(), v();
  var x = {
    fn: function() {
      return {
        onDestroy: function() {
          b(!0);
        },
        onHidden: function() {
          f = null;
        },
        onClickOutside: function($) {
          $.props.showOnCreate && !h && (h = !0, f = null);
        },
        onShow: function($) {
          $.props.showOnCreate && !h && (h = !0, T($, s[0]));
        },
        onTrigger: function($, U) {
          T($, U.currentTarget);
        }
      };
    }
  }, I = Qo(Po(), Object.assign({}, wC(n, ["overrides"]), {
    plugins: [x].concat(n.plugins || []),
    triggerTarget: l,
    popperOptions: Object.assign({}, n.popperOptions, {
      modifiers: [].concat(((o = n.popperOptions) == null ? void 0 : o.modifiers) || [], [ZC])
    })
  })), F = I.show;
  I.show = function(g) {
    if (F(), !f && g == null)
      return T(I, s[0]);
    if (!(f && g == null)) {
      if (typeof g == "number")
        return s[g] && T(I, s[g]);
      if (a.indexOf(g) >= 0) {
        var H = g.reference;
        return T(I, H);
      }
      if (s.indexOf(g) >= 0)
        return T(I, g);
    }
  }, I.showNext = function() {
    var g = s[0];
    if (!f)
      return I.show(0);
    var H = s.indexOf(f);
    I.show(s[H + 1] || g);
  }, I.showPrevious = function() {
    var g = s[s.length - 1];
    if (!f)
      return I.show(g);
    var H = s.indexOf(f), $ = s[H - 1] || g;
    I.show($);
  };
  var P = I.setProps;
  return I.setProps = function(g) {
    c = g.overrides || c, P(g);
  }, I.setInstances = function(g) {
    b(!0), p.forEach(function(H) {
      return H();
    }), a = g, b(!1), E(), v(), p = R(I), I.setProps({
      triggerTarget: l
    });
  }, p = R(I), I;
};
Qo.setDefaultProps({
  render: O0
});
const eL = { class: "diagram" }, tL = { class: "flex-shrink-0" }, nL = { class: "text-center my-1" }, rL = { class: "btn-group btn-group-xs" }, iL = { key: 0 }, oL = /* @__PURE__ */ Lt({
  __name: "Diagram",
  setup(e) {
    new tl().getHelpMessage;
    const n = ft(Hr), o = qe(null);
    if (!ft(ro))
      throw new Error(`Could not resolve ${ro.description}`);
    const s = ft(Vu);
    let l = [[]], f = [], c;
    const p = Tr({
      metric: Nn.time,
      buffersMetric: i0.shared
    });
    lo(() => {
      const R = localStorage.getItem("diagramViewOptions");
      R && be.assignIn(p, JSON.parse(R)), n.value.content[w.CPU_TIME] !== void 0 ? E(l[0], 0, n.value.content[w.PLANS][0], !0, []) : E(l[0], 0, n.value.content, !0, []);
    }), ci(() => {
      v();
    }), Zt(p, h);
    function h() {
      localStorage.setItem("diagramViewOptions", JSON.stringify(p)), Oi(v);
    }
    function v() {
      c && c.destroy(), be.each(f, (R) => {
        R.destroy();
      }), f = Qo(".diagram tr.node"), c = QC(f, {
        delay: 100,
        allowHTML: !0
      });
    }
    function E(R, T, x, I, F) {
      R.push([T, x, I, be.concat([], F)]), I || F.push(T), be.each(x[w.PLANS], (P) => {
        E(
          R,
          T + 1,
          P,
          P === be.last(x[w.PLANS]),
          F
        );
      }), I || F.pop();
    }
    function b(R) {
      o.value && Fw(o.value, R);
    }
    return on("scrollTo", b), (R, T) => (q(), re("div", eL, [
      D("div", tL, [
        D("div", nL, [
          D("div", rL, [
            D("button", {
              class: Xe(["btn btn-outline-secondary", { active: p.metric === S(Nn).time }]),
              onClick: T[0] || (T[0] = (x) => p.metric = S(Nn).time)
            }, `
            time
          `, 2),
            T[3] || (T[3] = B()),
            D("button", {
              class: Xe(["btn btn-outline-secondary", { active: p.metric === S(Nn).rows }]),
              onClick: T[1] || (T[1] = (x) => p.metric = S(Nn).rows)
            }, `
            rows
          `, 2),
            T[4] || (T[4] = B()),
            D("button", {
              class: Xe(["btn btn-outline-secondary", { active: p.metric === S(Nn).result }]),
              onClick: T[2] || (T[2] = (x) => p.metric = S(Nn).result)
            }, `
            result
          `, 2)
          ])
        ])
      ]),
      T[8] || (T[8] = B()),
      D("div", {
        class: "overflow-auto flex-grow-1",
        ref_key: "container",
        ref: o
      }, [
        (q(), re("table", {
          key: 0,
          class: Xe(["m-1", { highlight: !!S(s) }])
        }, [
          (q(!0), re(Et, null, er(S(l), (x, I) => (q(), re("tbody", { key: I }, [
            I === 0 && S(l).length > 1 ? (q(), re("tr", iL, T[5] || (T[5] = [
              D("th", {
                colspan: "3",
                class: "subplan"
              }, "Main Query Plan", -1)
            ]))) : Le("", !0),
            T[6] || (T[6] = B()),
            (q(!0), re(Et, null, er(x, (F, P) => (q(), an(Tx, {
              key: P,
              node: F[1],
              isSubplan: !1,
              isLastChild: !!F[2],
              level: F[0],
              branches: F[3],
              index: P,
              viewOptions: p
            }, null, 8, ["node", "isLastChild", "level", "branches", "index", "viewOptions"]))), 128))
          ]))), 128))
        ], 2))
      ], 512)
    ]));
  }
}), aL = { class: "grid-progress progress rounded-0 bg-transparent" }, Xf = /* @__PURE__ */ Lt({
  __name: "GridProgressBar",
  props: {
    percentage: {},
    percentage2: {}
  },
  setup(e) {
    return (t, n) => (q(), re("div", aL, [
      D("div", {
        class: Xe(["bg-secondary border-secondary opacity-50", {
          "border-start": t.percentage > 0
        }]),
        style: ii({
          width: t.percentage + "%"
        })
      }, null, 6),
      n[0] || (n[0] = B()),
      t.percentage2 ? (q(), re("div", {
        key: 0,
        class: Xe(["bg-secondary border-secondary opacity-20", {
          "border-start": t.percentage2 > 0
        }]),
        style: ii({
          width: t.percentage2 + "%"
        })
      }, null, 6)) : Le("", !0)
    ]));
  }
}), sL = { class: "table table-sm prop-list mb-0" }, uL = { key: 0 }, lL = { width: "40%" }, fL = ["innerHTML"], N0 = /* @__PURE__ */ Lt({
  __name: "MiscDetail",
  props: {
    node: {}
  },
  setup(e) {
    const t = qe(), o = Tr(e.node);
    lo(() => {
      a();
    });
    function a() {
      t.value = be.chain(o).omit(w.PLANS).map((s, l) => ({ key: l, value: s })).value();
    }
    return (s, l) => (q(), re("table", sL, [
      (q(!0), re(Et, null, er(t.value, (f, c) => (q(), re(Et, { key: c }, [
        S(zw)(f.key, f.value) ? (q(), re("tr", uL, [
          D("td", lL, He(f.key), 1),
          l[0] || (l[0] = B()),
          D("td", {
            innerHTML: S(a0)(f.key, f.value)
          }, null, 8, fL)
        ])) : Le("", !0)
      ], 64))), 128))
    ]));
  }
}), cL = {
  height: "1em",
  width: "1em",
  viewBox: "0 0 20 20",
  class: "me-1",
  style: { "margin-left": "-8px" }
}, Yf = /* @__PURE__ */ Lt({
  __name: "SeverityBullet",
  props: ["severity"],
  setup(e) {
    return (t, n) => (q(), re("svg", cL, [
      D("circle", {
        r: "7",
        cx: "10",
        cy: "10",
        class: Xe(e.severity),
        stroke: "white",
        "stroke-width": "1"
      }, null, 2)
    ]));
  }
}), dL = { class: "node-index text-secondary" }, pL = ["href"], hL = { class: "font-weight-normal small" }, vL = {
  key: 0,
  class: "text-end grid-progress-cell text-nowrap"
}, gL = { class: "position-relative d-flex" }, mL = { class: "flex-grow-1" }, EL = {
  key: 0,
  class: "small text-body-secondary"
}, _L = {
  key: 1,
  class: "text-end grid-progress-cell text-nowrap"
}, yL = { class: "position-relative" }, TL = {
  key: 2,
  class: "text-end grid-progress-cell text-nowrap"
}, AL = { key: 0 }, bL = {
  key: 0,
  class: "position-relative d-flex"
}, OL = { class: "flex-grow-1" }, NL = ["innerHTML"], SL = { key: 0 }, IL = { key: 1 }, RL = {
  key: 3,
  class: "text-end grid-progress-cell text-nowrap"
}, wL = { class: "position-relative d-flex" }, xL = { class: "flex-grow-1" }, CL = {
  key: 4,
  class: "text-end grid-progress-cell text-nowrap"
}, LL = { class: "d-inline" }, ML = {
  class: "border border-secondary px-1 bg-light",
  style: { "--bs-border-opacity": "0.5" }
}, DL = { class: "text-body-secondary" }, PL = {
  key: 1,
  class: "text-reset"
}, UL = { class: "text-wrap" }, $L = {
  key: 0,
  class: "node-description mt-1"
}, kL = { class: "node-type" }, FL = ["innerHTML"], BL = { class: "nav nav-tabs mt-1" }, HL = { class: "nav-item" }, GL = { class: "nav-item" }, zL = { class: "tab-content bg-white" }, WL = ["innerHTML"], XL = /* @__PURE__ */ Lt({
  __name: "GridRow",
  props: {
    node: {},
    level: {},
    isSubplan: { type: Boolean },
    isLastChild: { type: Boolean },
    branches: {},
    index: {},
    columns: {}
  },
  setup(e) {
    const n = new tl().getNodeTypeDescription, a = Tr(e.node), s = ft(Hr), l = ft(Jo), f = qe("misc"), {
      resultClass: c,
      durationClass: p,
      estimationClass: h,
      executionTimePercent: v,
      nodeName: E,
      rowsTooltip: b,
      timeTooltip: R,
      resultTooltip: T,
      estimationTooltip: x
    } = es(s, a, l), I = qe(!1), F = $e(() => {
      const U = a[w.ACTUAL_TIME], _ = s.value.planStats.executionTime || s.value.content[w.ACTUAL_TIME];
      return typeof U != "number" || !_ ? 0 : U / _ * 100;
    }), P = $e(() => {
      const U = a[w.CPU_TIME], _ = a[w.ACTUAL_TIME], A = s.value.planStats.executionTime || s.value.content[w.ACTUAL_TIME];
      return typeof U != "number" || typeof _ != "number" || !A ? 0 : (U - _) / A * 100;
    }), g = $e(() => {
      const U = a[w.ACTUAL_ROWS];
      return typeof U != "number" || !s.value.planStats.maxRows ? 0 : U / s.value.planStats.maxRows * 100;
    }), H = $e(() => {
      const U = a[w.RESULT_SET_SIZE];
      return typeof U != "number" || !s.value.planStats.maxResult ? 0 : Math.round(U / s.value.planStats.maxResult * 100);
    }), $ = $e(() => {
      const U = a[w.RESULT_SET_SIZE];
      return sd(typeof U == "number" ? U : 0);
    });
    return (U, _) => (q(), re("tr", {
      onClick: _[5] || (_[5] = (A) => I.value = !I.value),
      class: "node"
    }, [
      D("td", dL, [
        D("a", {
          href: `#plan/node/${a.nodeId}`,
          onClick: _[0] || (_[0] = hn(() => {
          }, ["stop"]))
        }, [
          D("span", hL, "#" + He(a.nodeId), 1)
        ], 8, pL)
      ]),
      _[34] || (_[34] = B()),
      U.columns.includes("time") ? (q(), re("td", vL, [
        We(Xf, {
          percentage: F.value,
          percentage2: P.value
        }, null, 8, ["percentage", "percentage2"]),
        _[9] || (_[9] = B()),
        Bn((q(), re("div", gL, [
          S(p) ? (q(), an(Yf, {
            key: 0,
            severity: S(p)
          }, null, 8, ["severity"])) : Le("", !0),
          _[6] || (_[6] = B()),
          D("span", mL, He(S(yr)(a[S(w).ACTUAL_TIME])), 1)
        ])), [
          [S(Hn), { content: S(R), allowHTML: !0 }]
        ]),
        _[10] || (_[10] = B()),
        I.value ? (q(), re("div", EL, [
          B(He(S(yr)(a[S(w).ACTUAL_TIME])) + " ", 1),
          _[7] || (_[7] = D("br", null, null, -1)),
          _[8] || (_[8] = B()),
          S(v) !== 1 / 0 ? (q(), re(Et, { key: 0 }, [
            B(He(S(v)) + `%
        `, 1)
          ], 64)) : Le("", !0)
        ])) : Le("", !0)
      ])) : Le("", !0),
      _[35] || (_[35] = B()),
      U.columns.includes("rows") ? (q(), re("td", _L, [
        We(Xf, {
          percentage: g.value
        }, null, 8, ["percentage"]),
        _[11] || (_[11] = B()),
        Bn((q(), re("div", yL, [
          B(He(a[S(w).ACTUAL_ROWS]?.toLocaleString()), 1)
        ])), [
          [S(Hn), { content: S(b), allowHTML: !0 }]
        ])
      ])) : Le("", !0),
      _[36] || (_[36] = B()),
      U.columns.includes("estimation") ? (q(), re("td", TL, [
        a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS] != null ? Bn((q(), re("div", AL, [
          a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS] != a[S(w).ACTUAL_ROWS] ? (q(), re("div", bL, [
            S(h) ? (q(), an(Yf, {
              key: 0,
              severity: S(h)
            }, null, 8, ["severity"])) : Le("", !0),
            _[14] || (_[14] = B()),
            D("span", OL, [
              D("span", {
                innerHTML: a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS] || 0
              }, null, 8, NL),
              _[12] || (_[12] = B()),
              a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS] < a[S(w).ACTUAL_ROWS] ? (q(), re("span", SL, `
              ▾
            `)) : Le("", !0),
              _[13] || (_[13] = B()),
              a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS] > a[S(w).ACTUAL_ROWS] ? (q(), re("span", IL, `
              ▴
            `)) : Le("", !0)
            ])
          ])) : Le("", !0)
        ])), [
          [S(Hn), { content: S(x), allowHTML: !0 }]
        ]) : Le("", !0)
      ])) : Le("", !0),
      _[37] || (_[37] = B()),
      U.columns.includes("result") ? (q(), re("td", RL, [
        We(Xf, {
          percentage: H.value
        }, null, 8, ["percentage"]),
        _[16] || (_[16] = B()),
        Bn((q(), re("div", wL, [
          S(c) ? (q(), an(Yf, {
            key: 0,
            severity: S(c)
          }, null, 8, ["severity"])) : Le("", !0),
          _[15] || (_[15] = B()),
          D("span", xL, He($.value), 1)
        ])), [
          [S(Hn), { content: S(T), allowHTML: !0 }]
        ])
      ])) : Le("", !0),
      _[38] || (_[38] = B()),
      U.columns.includes("filter") ? (q(), re("td", CL)) : Le("", !0),
      _[39] || (_[39] = B()),
      D("td", {
        class: Xe(["node-type", I.value ? "" : "text-nowrap text-truncate overflow-hidden"]),
        style: { "max-width": "0" }
      }, [
        We(ad, {
          isSubplan: U.isSubplan,
          isNode: "",
          isLastChild: U.isLastChild,
          level: U.level,
          branches: U.branches,
          index: U.index
        }, null, 8, ["isSubplan", "isLastChild", "level", "branches", "index"]),
        _[30] || (_[30] = B()),
        D("div", LL, [
          D("b", ML, He(S(E)), 1),
          _[24] || (_[24] = B()),
          D("span", DL, [
            a[S(w).EXTRA_INFO][S(w).RELATION_NAME] || a[S(w).EXTRA_INFO][S(w).FUNCTION_NAME] ? (q(), re(Et, { key: 0 }, [
              _[17] || (_[17] = D("span", { class: "text-secondary" }, "on", -1)),
              B(" " + He(a[S(w).EXTRA_INFO][S(w).RELATION_NAME]) + He(a[S(w).EXTRA_INFO][S(w).FUNCTION_NAME]), 1)
            ], 64)) : Le("", !0),
            _[21] || (_[21] = B()),
            a[S(w).CTE_NAME] ? (q(), re("span", PL, [
              _[18] || (_[18] = D("span", { class: "text-secondary" }, "CTE", -1)),
              B(" " + He(a[S(w).CTE_NAME]), 1)
            ])) : Le("", !0),
            _[22] || (_[22] = B()),
            a[S(w).JOIN_TYPE] ? (q(), re(Et, { key: 2 }, [
              B(He(a[S(w).JOIN_TYPE]) + " ", 1),
              _[19] || (_[19] = D("span", { class: "text-secondary" }, "join", -1))
            ], 64)) : Le("", !0),
            _[23] || (_[23] = B()),
            a[S(w).EXTRA_INFO][S(w).TABLE_INDEX] || a[S(w).EXTRA_INFO][S(w).CTE_INDEX] || a[S(w).EXTRA_INFO][S(w).DELIM_INDEX] ? (q(), re(Et, { key: 3 }, [
              _[20] || (_[20] = D("span", { class: "text-secondary" }, "using", -1)),
              B(" " + He(a[S(w).EXTRA_INFO][S(w).TABLE_INDEX]) + " " + He(a[S(w).EXTRA_INFO][S(w).CTE_INDEX]) + " " + He(a[S(w).EXTRA_INFO][S(w).DELIM_INDEX]), 1)
            ], 64)) : Le("", !0)
          ])
        ]),
        _[31] || (_[31] = B()),
        _[32] || (_[32] = D("br", null, null, -1)),
        _[33] || (_[33] = B()),
        I.value ? (q(), re("div", {
          key: 0,
          class: "plan-node position-relative detailed",
          style: { width: "100%" },
          onClick: _[4] || (_[4] = hn(() => {
          }, ["stop"]))
        }, [
          D("div", UL, [
            a[S(w).NODE_TYPE] && S(n)(a[S(w).NODE_TYPE]) ? (q(), re("div", $L, [
              D("span", kL, He(a[S(w).NODE_TYPE]) + " Node", 1),
              _[25] || (_[25] = B()),
              a[S(w).NODE_TYPE] ? (q(), re("span", {
                key: 0,
                innerHTML: S(n)(a[S(w).NODE_TYPE])
              }, null, 8, FL)) : Le("", !0)
            ])) : Le("", !0),
            _[28] || (_[28] = B()),
            D("ul", BL, [
              D("li", HL, [
                D("a", {
                  class: Xe(["nav-link px-2 py-1", { active: f.value === "misc" }]),
                  onClick: _[1] || (_[1] = hn((A) => f.value = "misc", ["prevent", "stop"])),
                  href: ""
                }, "Misc", 2)
              ]),
              _[26] || (_[26] = B()),
              D("li", GL, [
                D("a", {
                  class: Xe(["nav-link px-2 py-1", {
                    active: f.value === "output",
                    disabled: !a[S(w).EXTRA_INFO][S(w).PROJECTIONS] && !a[S(w).EXTRA_INFO][S(w).AGGREGATES]
                  }]),
                  onClick: _[2] || (_[2] = hn((A) => f.value = "output", ["prevent", "stop"])),
                  href: ""
                }, "Output", 2)
              ])
            ]),
            _[29] || (_[29] = B()),
            D("div", zL, [
              D("div", {
                class: Xe(["tab-pane p-1 border border-top-0", { "show active": f.value === "misc" }])
              }, [
                We(N0, { node: a }, null, 8, ["node"])
              ], 2),
              _[27] || (_[27] = B()),
              D("div", {
                class: Xe(["tab-pane p-1 border border-top-0 overflow-auto font-monospace", { "show active": f.value === "output" }]),
                innerHTML: a[S(w).EXTRA_INFO][S(w).PROJECTIONS] || a[S(w).EXTRA_INFO][S(w).AGGREGATES],
                style: { "max-height": "200px" },
                onMousewheel: _[3] || (_[3] = hn(() => {
                }, ["stop"]))
              }, null, 42, WL)
            ])
          ])
        ])) : Le("", !0)
      ], 2)
    ]));
  }
}), YL = { class: "table table-sm table-hover" }, VL = {
  class: "table-secondary sticky-top",
  style: { "z-index": "2" }
}, jL = {
  key: 0,
  class: "text-center"
}, KL = {
  key: 1,
  class: "text-center"
}, qL = {
  key: 2,
  class: "text-center"
}, JL = {
  key: 3,
  class: "text-center"
}, ZL = {
  key: 4,
  class: "text-center"
}, QL = { key: 0 }, e2 = ["colspan"], t2 = ["colspan"], n2 = { class: "fst-italic text-reset" }, r2 = /* @__PURE__ */ Lt({
  __name: "Grid",
  setup(e) {
    const t = ft(Hr);
    let n = [[]];
    lo(() => {
      t.value.content[w.CPU_TIME] !== void 0 ? o(n[0], 0, t.value.content[w.PLANS][0], !0, []) : o(n[0], 0, t.value.content, !0, []);
    }), ci(() => {
      localStorage.setItem("gridIsNotNew", "true");
    });
    function o(v, E, b, R, T) {
      v.push([E, b, R, be.concat([], T)]), R || T.push(E), be.each(b[w.PLANS], (x) => {
        o(
          v,
          E + 1,
          x,
          x === be.last(b[w.PLANS]),
          T
        );
      }), R || T.pop();
    }
    function a(v) {
      return be.startsWith(v[w.EXTRA_INFO][w.CTE_NAME], "CTE");
    }
    const s = $e(() => be.some(n, (v) => be.some(v, (E) => E[1][w.ACTUAL_TIME] || !1))), l = $e(() => be.some(n, (v) => be.some(v, (E) => E[1][w.ACTUAL_ROWS] || !1))), f = $e(() => be.some(n, (v) => be.some(v, (E) => E[1][w.EXTRA_INFO][w.ESTIMATED_ROWS] || !1))), c = $e(() => be.some(n, (v) => be.some(v, (E) => {
      const b = E[1][w.RESULT_SET_SIZE];
      return typeof b == "number" && b > 1;
    }))), p = $e(() => be.some(n, (v) => be.some(v, (E) => E[1][w.NODE_TYPE]?.includes("FILTER")))), h = $e(() => {
      const v = [];
      return s.value && v.push("time"), l.value && v.push("rows"), f.value && v.push("estimation"), c.value && v.push("result"), p.value && v.push("filter"), v;
    });
    return (v, E) => (q(), re("div", null, [
      D("table", YL, [
        D("thead", VL, [
          D("tr", null, [
            E[0] || (E[0] = D("th", { class: "text-center" }, null, -1)),
            E[1] || (E[1] = B()),
            s.value ? (q(), re("th", jL, "time")) : Le("", !0),
            E[2] || (E[2] = B()),
            l.value ? (q(), re("th", KL, "rows")) : Le("", !0),
            E[3] || (E[3] = B()),
            f.value ? (q(), re("th", qL, "estim")) : Le("", !0),
            E[4] || (E[4] = B()),
            c.value ? (q(), re("th", JL, "result")) : Le("", !0),
            E[5] || (E[5] = B()),
            p.value ? (q(), re("th", ZL, "filter")) : Le("", !0),
            E[6] || (E[6] = B()),
            E[7] || (E[7] = D("th", { style: { width: "100%" } }, null, -1))
          ])
        ]),
        E[11] || (E[11] = B()),
        (q(!0), re(Et, null, er(S(n), (b, R) => (q(), re("tbody", { key: R }, [
          (q(!0), re(Et, null, er(b, (T, x) => (q(), re(Et, { key: x }, [
            T[1][S(w).EXTRA_INFO][S(w).CTE_NAME] ? (q(), re("tr", QL, [
              D("td", {
                class: "bg-light",
                colspan: 1 + h.value.length
              }, null, 8, e2),
              E[9] || (E[9] = B()),
              D("td", {
                class: Xe(["plan pr-2 bg-light", { "font-weight-bold": a(T[1]) }]),
                colspan: h.value.length
              }, [
                We(ad, {
                  isSubplan: !!T[1][S(w).EXTRA_INFO][S(w).CTE_NAME],
                  isLastChild: !!T[2],
                  level: T[0],
                  branches: T[3],
                  index: x
                }, null, 8, ["isSubplan", "isLastChild", "level", "branches", "index"]),
                E[8] || (E[8] = B()),
                D("b", n2, He(T[1][S(w).EXTRA_INFO][S(w).CTE_NAME]), 1)
              ], 10, t2)
            ])) : Le("", !0),
            E[10] || (E[10] = B()),
            We(XL, {
              node: T[1],
              isSubplan: !!T[1][S(w).EXTRA_INFO][S(w).CTE_NAME],
              isLastChild: !!T[2],
              level: T[0],
              branches: T[3],
              index: x,
              columns: h.value
            }, null, 8, ["node", "isSubplan", "isLastChild", "level", "branches", "index", "columns"])
          ], 64))), 128))
        ]))), 128))
      ])
    ]));
  }
}), i2 = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [o, a] of t)
    n[o] = a;
  return n;
}, o2 = {}, a2 = {
  src: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDUwMCA1MDAiPgogIDxkZWZzPgogICAgPHN0eWxlPgogICAgICAuY2xzLTEgewogICAgICAgIGZpbGw6ICNmZmYxMDA7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyOC43LjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiAxLjIuMCBCdWlsZCAxNDIpICAtLT4KICA8Zz4KICAgIDxnIGlkPSJMYXllcl8xIj4KICAgICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTI1MCw0NzVoMGMtMTI0LjUsMC0yMjUtMTAwLjUtMjI1LTIyNWgwQzI1LDEyNS41LDEyNS41LDI1LDI1MCwyNWgwYzEyNC41LDAsMjI1LDEwMC41LDIyNSwyMjVoMGMwLDEyNC4zLTEwMC41LDIyNS0yMjUsMjI1WiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTM3MC4zLDIxNi40aC00NC4xdjY2LjZoNDQuMWMxOC40LDAsMzMuNS0xNS4yLDMzLjUtMzMuNXMtMTUuMS0zMy4xLTMzLjUtMzMuMSIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEwOS45LDI0OS45YzAsNTEuNCw0MS45LDkzLjMsOTMuMyw5My4zczkzLjMtNDEuOSw5My4zLTkzLjMtNDEuOS05My4zLTkzLjMtOTMuMy05My4zLDQxLjktOTMuMyw5My4zaDAiLz4KICAgICAgPC9nPgogICAgPC9nPgogIDwvZz4KPC9zdmc+",
  alt: "DEV",
  style: { width: "20px", height: "20px" }
};
function s2(e, t) {
  return q(), re("img", a2);
}
const tg = /* @__PURE__ */ i2(o2, [["render", s2]]), u2 = { class: "card-header border-top" }, l2 = {
  key: 0,
  class: "node-description"
}, f2 = { class: "node-type" }, c2 = ["innerHTML"], d2 = { class: "nav nav-tabs card-header-tabs" }, p2 = { class: "nav-item" }, h2 = { class: "nav-item" }, v2 = { class: "nav-item" }, g2 = { class: "card-body tab-content" }, m2 = { key: 0 }, E2 = ["innerHTML"], _2 = { class: "px-1" }, y2 = {
  key: 0,
  class: "text-secondary"
}, T2 = { class: "text-secondary" }, A2 = ["innerHTML"], b2 = /* @__PURE__ */ Lt({
  __name: "PlanNodeDetail",
  props: {
    node: {}
  },
  setup(e) {
    const t = ft(Jo), n = e, o = ft("updateSize"), a = Tr(n.node), s = ft(Hr), l = qe(), f = qe("general"), p = new tl().getNodeTypeDescription, {
      durationClass: h,
      // estimationClass,
      executionTimePercent: v
    } = es(s, a, t);
    lo(() => {
      E();
    });
    function E() {
      l.value = be.chain(a).omit(w.PLANS).map((R, T) => ({ key: T, value: R })).value();
    }
    function b(R) {
      const T = w[R], x = a[T];
      return a0(T, x);
    }
    return Zt(f, () => {
      window.setTimeout(() => o && o(a), 1);
    }), (R, T) => (q(), re(Et, null, [
      D("div", u2, [
        S(p)(a[S(w).NODE_TYPE] ?? a[S(w).NODE_TYPE_EXPLAIN]) ? (q(), re("div", l2, [
          D("span", f2, He(a[S(w).NODE_TYPE] ?? a[S(w).NODE_TYPE_EXPLAIN]) + " Node", 1),
          T[4] || (T[4] = B()),
          D("span", {
            innerHTML: S(p)(a[S(w).NODE_TYPE] ?? a[S(w).NODE_TYPE_EXPLAIN])
          }, null, 8, c2)
        ])) : Le("", !0),
        T[7] || (T[7] = B()),
        D("ul", d2, [
          D("li", p2, [
            D("a", {
              class: Xe(["nav-link", { active: f.value === "general" }]),
              onClick: T[0] || (T[0] = hn((x) => f.value = "general", ["prevent", "stop"])),
              href: ""
            }, "General", 2)
          ]),
          T[5] || (T[5] = B()),
          D("li", h2, [
            D("a", {
              class: Xe(["nav-link", {
                active: f.value === "output",
                disabled: !a[S(w).EXTRA_INFO][S(w).PROJECTIONS] && !a[S(w).EXTRA_INFO][S(w).AGGREGATES]
              }]),
              onClick: T[1] || (T[1] = hn((x) => f.value = "output", ["prevent", "stop"])),
              href: ""
            }, "Output", 2)
          ]),
          T[6] || (T[6] = B()),
          D("li", v2, [
            D("a", {
              class: Xe(["nav-link", { active: f.value === "misc" }]),
              onClick: T[2] || (T[2] = hn((x) => f.value = "misc", ["prevent", "stop"])),
              href: ""
            }, "Misc", 2)
          ])
        ])
      ]),
      T[22] || (T[22] = B()),
      D("div", g2, [
        D("div", {
          class: Xe(["tab-pane", { "show active": f.value === "general" }])
        }, [
          (q(), re("div", m2, [
            We(S(Jt), {
              "fixed-width": "",
              icon: S(n0),
              class: "text-secondary"
            }, null, 8, ["icon"]),
            T[10] || (T[10] = B()),
            T[11] || (T[11] = D("b", null, "Timing:", -1)),
            T[12] || (T[12] = B()),
            D("span", {
              class: Xe(["p-0 px-1 rounded alert", S(h)]),
              innerHTML: b("ACTUAL_TIME")
            }, null, 10, E2),
            T[13] || (T[13] = B()),
            S(v) !== 1 / 0 ? (q(), re(Et, { key: 0 }, [
              T[8] || (T[8] = B(`
          |
          `, -1)),
              D("strong", null, He(S(v)), 1),
              T[9] || (T[9] = D("span", { class: "text-secondary" }, "%", -1))
            ], 64)) : Le("", !0)
          ])),
          T[19] || (T[19] = B()),
          D("div", null, [
            We(S(Jt), {
              "fixed-width": "",
              icon: S(bw),
              class: "text-secondary"
            }, null, 8, ["icon"]),
            T[14] || (T[14] = B()),
            T[15] || (T[15] = D("b", null, "Rows:", -1)),
            T[16] || (T[16] = B()),
            D("span", _2, He(b("ACTUAL_ROWS")), 1),
            T[17] || (T[17] = B()),
            a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS] ? (q(), re("span", y2, "(Estimated: " + He(a[S(w).EXTRA_INFO][S(w).ESTIMATED_ROWS]) + ")", 1)) : Le("", !0),
            T[18] || (T[18] = B()),
            D("span", T2, "(Scanned: " + He(b("OPERATOR_ROWS_SCANNED")) + ")", 1)
          ])
        ], 2),
        T[20] || (T[20] = B()),
        D("div", {
          class: Xe(["tab-pane overflow-auto font-monospace", { "show active": f.value === "output" }]),
          innerHTML: a[S(w).EXTRA_INFO][S(w).PROJECTIONS] || a[S(w).EXTRA_INFO][S(w).AGGREGATES],
          style: { "max-height": "200px" },
          onMousewheel: T[3] || (T[3] = hn(() => {
          }, ["stop"]))
        }, null, 42, A2),
        T[21] || (T[21] = B()),
        D("div", {
          class: Xe(["tab-pane", { "show active": f.value === "misc" }])
        }, [
          We(N0, { node: a }, null, 8, ["node"])
        ], 2)
      ])
    ], 64));
  }
}), O2 = /* @__PURE__ */ Lt({
  __name: "NodeBadges",
  props: {
    node: {}
  },
  setup(e) {
    const n = Tr(e.node), o = ft(Hr), a = ft(Jo), {
      resultClass: s,
      durationClass: l,
      rowsClass: f
    } = es(o, n, a);
    return (c, p) => (q(), re(Et, null, [
      S(l) ? Bn((q(), re("span", {
        key: 0,
        class: Xe("p-0  d-inline-block mb-0 ms-1 text-nowrap alert " + S(l))
      }, [
        We(S(Jt), {
          "fixed-width": "",
          icon: S(n0)
        }, null, 8, ["icon"])
      ], 2)), [
        [S(Hn), "Slow"]
      ]) : Le("", !0),
      p[0] || (p[0] = B()),
      S(s) ? Bn((q(), re("span", {
        key: 1,
        class: Xe("p-0  d-inline-block mb-0 ms-1 text-nowrap alert " + S(s))
      }, [
        We(S(Jt), {
          "fixed-width": "",
          icon: S(Ow)
        }, null, 8, ["icon"])
      ], 2)), [
        [S(Hn), "Result is big"]
      ]) : Le("", !0),
      p[1] || (p[1] = B()),
      S(f) ? Bn((q(), re("span", {
        key: 2,
        class: Xe(
          "p-0  d-inline-block mb-0 ms-1 text-nowrap alert " + S(f)
        )
      }, [
        We(S(Jt), {
          "fixed-width": "",
          icon: S(xw)
        }, null, 8, ["icon"])
      ], 2)), [
        [S(Hn), "Many rows"]
      ]) : Le("", !0)
    ], 64));
  }
}), N2 = { class: "card-body header no-focus-outline" }, S2 = { class: "mb-0 d-flex justify-content-between" }, I2 = { class: "text-secondary" }, R2 = { class: "text-nowrap" }, w2 = { class: "text-start font-monospace" }, x2 = ["innerHTML"], C2 = { key: 3 }, L2 = { key: 5 }, M2 = ["innerHTML"], D2 = ["innerHTML"], P2 = { key: 8 }, U2 = { key: 0 }, $2 = {
  class: "progress node-bar-container",
  style: { height: "5px" }
}, k2 = { class: "node-bar-label" }, F2 = { class: "text-secondary" }, B2 = ["innerHTML"], H2 = /* @__PURE__ */ Lt({
  __name: "PlanNode",
  props: {
    node: {}
  },
  setup(e) {
    const t = qe(null), n = ft(Nu);
    if (!n)
      throw new Error(`Could not resolve ${Nu.description}`);
    const o = ft(Vu), a = ft(ro);
    if (!a)
      throw new Error(`Could not resolve ${ro.description}`);
    const s = ft(Jo), l = e, f = qe(!1), c = Tr(l.node), p = ft(Hr), h = ft("updateNodeSize"), {
      nodeName: v,
      barWidth: E,
      barColor: b,
      highlightValue: R,
      isNeverExecuted: T
    } = es(p, c, s);
    ci(async () => {
      x(c);
    });
    function x(F) {
      const P = t.value?.getBoundingClientRect();
      P && h?.(F, [P.width, P.height]);
    }
    on("updateSize", x), Zt(f, () => {
      window.setTimeout(() => x(c), 1);
    }), Zt(s, () => {
      Oi(() => {
        x(c);
      });
    }), Zt(n, () => {
      n.value == c.nodeId && (f.value = !0);
    });
    function I() {
      const F = (p.value, c[w.EXTRA_INFO][w.CTE_NAME], void 0);
      F && a?.(F.nodeId, !0);
    }
    return (F, P) => (q(), re("div", {
      ref_key: "outerEl",
      ref: t,
      onMousedown: P[4] || (P[4] = hn(() => {
      }, ["stop"]))
    }, [
      D("div", {
        class: Xe([
          "text-start plan-node",
          {
            detailed: f.value,
            "never-executed": S(T),
            selected: S(n) == c.nodeId,
            highlight: S(o) == c.nodeId
          }
        ])
      }, [
        D("div", {
          class: "plan-node-body card",
          onMouseenter: P[2] || (P[2] = (g) => o.value = c.nodeId),
          onMouseleave: P[3] || (P[3] = (g) => o.value = void 0)
        }, [
          D("div", N2, [
            D("header", S2, [
              D("h4", {
                class: "text-body overflow-hidden btn btn-light text-start py-0 px-1",
                onClick: P[0] || (P[0] = hn((g) => f.value = !f.value, ["prevent", "stop"]))
              }, [
                D("span", I2, [
                  f.value ? (q(), an(S(Jt), {
                    key: 0,
                    "fixed-width": "",
                    icon: S(Iw)
                  }, null, 8, ["icon"])) : (q(), an(S(Jt), {
                    key: 1,
                    "fixed-width": "",
                    icon: S(r0)
                  }, null, 8, ["icon"]))
                ]),
                B(" " + He(S(v)), 1)
              ]),
              P[6] || (P[6] = B()),
              D("div", R2, [
                We(O2, { node: c }, null, 8, ["node"]),
                P[5] || (P[5] = B()),
                D("a", {
                  class: "fw-normal small ms-1",
                  href: "",
                  onClick: P[1] || (P[1] = hn((g) => S(a)(c.nodeId, !0), ["prevent", "stop"]))
                }, `
                #` + He(c.nodeId), 1)
              ])
            ]),
            P[29] || (P[29] = B()),
            D("div", w2, [
              c[S(w).EXTRA_INFO][S(w).RELATION_NAME] ? (q(), re("div", {
                key: 0,
                class: Xe({ "line-clamp-2": !f.value })
              }, [
                P[7] || (P[7] = D("span", { class: "text-secondary" }, "on ", -1)),
                B(" " + He(c[S(w).EXTRA_INFO][S(w).RELATION_NAME]), 1)
              ], 2)) : Le("", !0),
              P[19] || (P[19] = B()),
              c[S(w).EXTRA_INFO][S(w).FUNCTION] ? (q(), re("div", {
                key: 1,
                class: Xe({ "line-clamp-2": !f.value })
              }, [
                P[8] || (P[8] = D("span", { class: "text-secondary" }, "with ", -1)),
                B(" " + He(c[S(w).EXTRA_INFO][S(w).FUNCTION]), 1)
              ], 2)) : Le("", !0),
              P[20] || (P[20] = B()),
              c[S(w).EXTRA_INFO][S(w).GROUPS] ? (q(), re("div", {
                key: 2,
                class: Xe({ "line-clamp-2": !f.value })
              }, [
                P[9] || (P[9] = D("span", { class: "text-secondary" }, "group by", -1)),
                P[10] || (P[10] = B()),
                D("span", {
                  innerHTML: S(wa)(c[S(w).EXTRA_INFO][S(w).GROUPS])
                }, null, 8, x2)
              ], 2)) : Le("", !0),
              P[21] || (P[21] = B()),
              c[S(w).EXTRA_INFO][S(w).JOIN_TYPE] ? (q(), re("div", C2, [
                B(He(c[S(w).EXTRA_INFO][S(w).JOIN_TYPE]) + " ", 1),
                P[11] || (P[11] = D("span", { class: "text-secondary" }, "join", -1))
              ])) : Le("", !0),
              P[22] || (P[22] = B()),
              c[S(w).EXTRA_INFO][S(w).PROJECTIONS] ? (q(), re("div", {
                key: 4,
                class: Xe({ "line-clamp-2": !f.value })
              }, [
                P[12] || (P[12] = D("span", { class: "text-secondary" }, "projects", -1)),
                B(" " + He(S(wa)(c[S(w).EXTRA_INFO][S(w).PROJECTIONS])), 1)
              ], 2)) : Le("", !0),
              P[23] || (P[23] = B()),
              c[S(w).EXTRA_INFO][S(w).FUNCTION_NAME] ? (q(), re("div", L2, He(c[S(w).EXTRA_INFO][S(w).FUNCTION_NAME]), 1)) : Le("", !0),
              P[24] || (P[24] = B()),
              c[S(w).EXTRA_INFO][S(w).CONDITIONS] ? (q(), re("div", {
                key: 6,
                class: Xe({ "line-clamp-2": !f.value })
              }, [
                P[13] || (P[13] = D("span", { class: "text-secondary" }, "on", -1)),
                P[14] || (P[14] = B()),
                D("span", {
                  innerHTML: S(wa)(c[S(w).EXTRA_INFO][S(w).CONDITIONS])
                }, null, 8, M2)
              ], 2)) : Le("", !0),
              P[25] || (P[25] = B()),
              c[S(w).EXTRA_INFO][S(w).FILTER] ? (q(), re("div", {
                key: 7,
                class: Xe({ "line-clamp-2": !f.value })
              }, [
                P[15] || (P[15] = D("span", { class: "text-secondary" }, "on", -1)),
                P[16] || (P[16] = B()),
                D("span", {
                  innerHTML: S(wa)(c[S(w).EXTRA_INFO][S(w).FILTER])
                }, null, 8, D2)
              ], 2)) : Le("", !0),
              P[26] || (P[26] = B()),
              c[S(w).EXTRA_INFO][S(w).CTE_NAME] ? (q(), re("div", P2, [
                D("a", {
                  class: "text-reset",
                  href: "",
                  onClick: hn(I, ["prevent", "stop"])
                }, [
                  We(S(Jt), {
                    icon: S(Sw),
                    class: "text-secondary"
                  }, null, 8, ["icon"]),
                  P[17] || (P[17] = B()),
                  P[18] || (P[18] = D("span", { class: "text-secondary" }, "CTE", -1)),
                  B(" " + He(c[S(w).EXTRA_INFO][S(w).CTE_NAME]), 1)
                ])
              ])) : Le("", !0)
            ]),
            P[30] || (P[30] = B()),
            S(s).highlightType !== S(Fn).NONE && S(R) !== null ? (q(), re("div", U2, [
              D("div", $2, [
                D("div", {
                  class: "progress-bar",
                  role: "progressbar",
                  style: ii({
                    width: S(E) + "%",
                    "background-color": S(b)
                  }),
                  "aria-valuenow": "0",
                  "aria-valuemin": "0",
                  "aria-valuemax": "100"
                }, null, 4)
              ]),
              P[28] || (P[28] = B()),
              D("span", k2, [
                D("span", F2, He(S(s).highlightType) + ":", 1),
                P[27] || (P[27] = B()),
                D("span", { innerHTML: S(R) }, null, 8, B2)
              ])
            ])) : Le("", !0)
          ]),
          P[31] || (P[31] = B()),
          f.value ? (q(), an(b2, {
            key: 0,
            node: c
          }, null, 8, ["node"])) : Le("", !0)
        ], 32)
      ], 2)
    ], 544));
  }
}), G2 = {
  key: 0,
  class: "plan-stats flex-shrink-0 d-flex border-bottom border-top align-items-center"
}, z2 = { class: "d-inline-block px-2" }, W2 = {
  key: 0,
  class: "text-secondary"
}, X2 = ["innerHTML"], Y2 = { class: "d-inline-block px-2" }, V2 = {
  key: 0,
  class: "text-secondary"
}, j2 = ["innerHTML"], K2 = { class: "d-inline-block px-2" }, q2 = {
  key: 0,
  class: "text-secondary"
}, J2 = ["innerHTML"], Z2 = { class: "d-inline-block px-2" }, Q2 = {
  key: 0,
  class: "text-secondary"
}, eM = ["innerHTML"], tM = { class: "d-inline-block px-2" }, nM = {
  key: 0,
  class: "text-secondary"
}, rM = ["innerHTML"], ng = /* @__PURE__ */ Lt({
  __name: "PlanStats",
  setup(e) {
    const n = new tl().getHelpMessage, o = ft(Hr);
    return (a, s) => S(o) ? (q(), re("div", G2, [
      D("div", z2, [
        s[1] || (s[1] = B(`
      Execution time:
      `, -1)),
        S(o).planStats.executionTime ? (q(), re("span", {
          key: 1,
          class: "stat-value",
          innerHTML: S(yr)(S(o).planStats.executionTime)
        }, null, 8, X2)) : (q(), re("span", W2, [
          s[0] || (s[0] = B(`
          N/A
          `, -1)),
          Bn(We(S(Jt), {
            icon: S(Aa),
            class: "cursor-help"
          }, null, 8, ["icon"]), [
            [S(Hn), S(n)("missing execution time")]
          ])
        ]))
      ]),
      s[10] || (s[10] = B()),
      D("div", Y2, [
        s[3] || (s[3] = B(`
      Blocked Thread Time:
      `, -1)),
        S(o).planStats.blockedThreadTime ? (q(), re("span", {
          key: 1,
          class: "stat-value",
          innerHTML: S(yr)(S(o).planStats.blockedThreadTime)
        }, null, 8, j2)) : (q(), re("span", V2, [
          s[2] || (s[2] = B(`
          N/A
          `, -1)),
          Bn(We(S(Jt), {
            icon: S(Aa),
            class: "cursor-help"
          }, null, 8, ["icon"]), [
            [S(Hn), S(n)("missing blocked thread time")]
          ])
        ]))
      ]),
      s[11] || (s[11] = B()),
      D("div", K2, [
        s[5] || (s[5] = B(`
      Latency:
      `, -1)),
        S(o).planStats.latency ? (q(), re("span", {
          key: 1,
          class: "stat-value",
          innerHTML: S(yr)(S(o).planStats.latency)
        }, null, 8, J2)) : (q(), re("span", q2, [
          s[4] || (s[4] = B(`
          N/A
          `, -1)),
          Bn(We(S(Jt), {
            icon: S(Aa),
            class: "cursor-help"
          }, null, 8, ["icon"]), [
            [S(Hn), S(n)("missing latency")]
          ])
        ]))
      ]),
      s[12] || (s[12] = B()),
      D("div", Z2, [
        s[7] || (s[7] = B(`
      Rows returned:
      `, -1)),
        S(o).planStats.rowsReturned ? (q(), re("span", {
          key: 1,
          class: "stat-value",
          innerHTML: S(Lo)(S(o).planStats.rowsReturned)
        }, null, 8, eM)) : (q(), re("span", Q2, [
          s[6] || (s[6] = B(`
          N/A
          `, -1)),
          Bn(We(S(Jt), {
            icon: S(Aa),
            class: "cursor-help"
          }, null, 8, ["icon"]), [
            [S(Hn), S(n)("missing rows returned")]
          ])
        ]))
      ]),
      s[13] || (s[13] = B()),
      D("div", tM, [
        s[9] || (s[9] = B(`
      Result size:
      `, -1)),
        S(o).planStats.resultSize ? (q(), re("span", {
          key: 1,
          class: "stat-value",
          innerHTML: S(o0)(S(o).planStats.resultSize)
        }, null, 8, rM)) : (q(), re("span", nM, [
          s[8] || (s[8] = B(`
          N/A
          `, -1)),
          Bn(We(S(Jt), {
            icon: S(Aa),
            class: "cursor-help"
          }, null, 8, ["icon"]), [
            [S(Hn), S(n)("missing result size")]
          ])
        ]))
      ])
    ])) : Le("", !0);
  }
}), iM = { class: "table" }, su = /* @__PURE__ */ Lt({
  __name: "SortedTable",
  props: {
    values: {},
    sort: {},
    dir: {}
  },
  setup(e) {
    const t = e, n = qe(t.sort), o = qe(t.dir);
    on("sort", n), on("dir", o), on("sortBy", s);
    const a = $e(() => be.orderBy(t.values, n.value, o.value));
    function s(l) {
      l === n.value && (o.value = o.value === Dr.asc ? Dr.desc : Dr.asc), n.value = l;
    }
    return (l, f) => (q(), re("table", iM, [
      xo(l.$slots, "default"),
      f[0] || (f[0] = B()),
      xo(l.$slots, "head"),
      f[1] || (f[1] = B()),
      xo(l.$slots, "body", { values: a.value }),
      f[2] || (f[2] = B()),
      xo(l.$slots, "foot")
    ]));
  }
}), Qn = /* @__PURE__ */ Lt({
  __name: "SortLink",
  props: {
    name: {}
  },
  setup(e) {
    const t = ft("dir"), n = ft("sort"), o = ft("sortBy");
    return (a, s) => (q(), re("a", {
      href: "#",
      onClick: s[0] || (s[0] = hn((l) => S(o) && S(o)(a.name), ["prevent"]))
    }, [
      xo(a.$slots, "default", {}, () => [
        B(He(a.name), 1)
      ]),
      s[1] || (s[1] = B()),
      S(n) == a.name && S(t) == S(Dr).asc ? (q(), an(S(Jt), {
        key: 0,
        "fixed-width": "",
        icon: S(Lw)
      }, null, 8, ["icon"])) : S(n) == a.name && S(t) == S(Dr).desc ? (q(), an(S(Jt), {
        key: 1,
        "fixed-width": "",
        icon: S(Mw)
      }, null, 8, ["icon"])) : Le("", !0)
    ]));
  }
}), oM = { class: "thead-light" }, aM = { class: "text-end" }, sM = { class: "text-end" }, uM = { class: "text-end" }, lM = { class: "ps-3" }, fM = ["href"], cM = { class: "text-end" }, dM = { class: "px-1" }, pM = { class: "text-end" }, uu = /* @__PURE__ */ Lt({
  __name: "StatsTableItem",
  props: {
    value: {},
    executionTime: {}
  },
  setup(e) {
    const t = e, n = qe(!1);
    function o(a) {
      return a[w.ACTUAL_TIME] / t.executionTime;
    }
    return (a, s) => (q(), re(Et, null, [
      D("thead", oM, [
        D("tr", {
          onClick: s[0] || (s[0] = hn((l) => n.value = !n.value, ["prevent"])),
          role: "button"
        }, [
          D("th", null, [
            n.value ? (q(), an(S(Jt), {
              key: 0,
              "fixed-width": "",
              icon: S(r0)
            }, null, 8, ["icon"])) : (q(), an(S(Jt), {
              key: 1,
              "fixed-width": "",
              icon: S(Rw)
            }, null, 8, ["icon"])),
            B(" " + He(t.value.name), 1)
          ]),
          s[1] || (s[1] = B()),
          D("th", aM, He(t.value.count), 1),
          s[2] || (s[2] = B()),
          D("th", sM, [
            D("span", {
              class: Xe(["alert p-0 px-1", S(ux)(t.value.timePercent * 100)])
            }, He(S(yr)(t.value.time)), 3)
          ]),
          s[3] || (s[3] = B()),
          D("th", uM, He(S(Uv)(t.value.timePercent)), 1)
        ])
      ]),
      s[8] || (s[8] = B()),
      D("tbody", {
        class: Xe(n.value ? "" : "d-none")
      }, [
        (q(!0), re(Et, null, er(S(be).reverse(
          S(be).sortBy(t.value.nodes, S(w).ACTUAL_TIME)
        ), (l) => (q(), re("tr", {
          key: l.nodeId,
          style: { "font-size": "smaller" }
        }, [
          D("td", lM, [
            D("a", {
              href: `#plan/node/${l.nodeId}`,
              class: "me-1"
            }, "#" + He(l.nodeId), 9, fM),
            B(" " + He(l[S(w).NODE_TYPE]), 1)
          ]),
          s[4] || (s[4] = B()),
          s[5] || (s[5] = D("td", { class: "text-end" }, null, -1)),
          s[6] || (s[6] = B()),
          D("td", cM, [
            D("span", dM, He(S(yr)(l[S(w).ACTUAL_TIME])), 1)
          ]),
          s[7] || (s[7] = B()),
          D("td", pM, He(S(Uv)(o(l))), 1)
        ]))), 128))
      ], 2)
    ], 64));
  }
}), hM = { class: "small stats container-fluid mt-2" }, vM = { class: "row row-cols-1 row-cols-lg-2 row-cols-xxl-3 g-4" }, gM = { class: "col" }, mM = { class: "card" }, EM = { class: "card-body" }, _M = { class: "table-secondary" }, yM = { scope: "col" }, TM = {
  scope: "col",
  class: "text-end"
}, AM = {
  scope: "col",
  colspan: "2",
  class: "text-end"
}, bM = { key: 0 }, OM = { class: "col" }, NM = { class: "card" }, SM = { class: "card-body" }, IM = { class: "table-secondary" }, RM = { scope: "col" }, wM = {
  scope: "col",
  class: "text-end"
}, xM = {
  scope: "col",
  colspan: "2",
  class: "text-end"
}, CM = { key: 0 }, LM = { class: "col" }, MM = { class: "card" }, DM = { class: "card-body" }, PM = { class: "table-secondary" }, UM = { scope: "col" }, $M = {
  scope: "col",
  class: "text-end"
}, kM = {
  scope: "col",
  colspan: "2",
  class: "text-end"
}, FM = { class: "col" }, BM = { class: "card" }, HM = { class: "card-body" }, GM = { class: "table-secondary" }, zM = { scope: "col" }, WM = {
  scope: "col",
  class: "text-end"
}, XM = {
  scope: "col",
  colspan: "2",
  class: "text-end"
}, YM = { key: 0 }, VM = /* @__PURE__ */ Lt({
  __name: "Stats",
  setup(e) {
    const t = [], n = qe(0), o = ft(Hr);
    lo(() => {
      n.value = o.value.planStats.executionTime || o.value.content?.[w.ACTUAL_TIME], o.value.content && (o.value.content[w.CPU_TIME] !== void 0 ? a(t, o.value.content[w.PLANS][0]) : a(t, o.value.content));
    });
    function a(h, v) {
      var E = v;
      for (const b in v[w.EXTRA_INFO])
        E[b] = v[w.EXTRA_INFO][b];
      h.push(E), be.each(v[w.PLANS], (b) => {
        a(h, b);
      });
    }
    function s(h) {
      return be.sumBy(h, w.ACTUAL_TIME) / n.value;
    }
    const l = $e(() => {
      const h = be.groupBy(
        be.filter(t, (E) => E[w.RELATION_NAME] !== void 0),
        w.RELATION_NAME
      ), v = [];
      return be.each(h, (E, b) => {
        v.push({
          name: b,
          count: E.length,
          time: be.sumBy(E, w.ACTUAL_TIME),
          timePercent: s(E),
          nodes: E
        });
      }), v;
    }), f = $e(() => {
      const h = be.groupBy(
        be.filter(t, (E) => E[w.FUNCTION_NAME] !== void 0),
        w.FUNCTION_NAME
      ), v = [];
      return be.each(h, (E, b) => {
        v.push({
          name: b,
          count: E.length,
          time: be.sumBy(E, w.ACTUAL_TIME),
          timePercent: s(E),
          nodes: E
        });
      }), v;
    }), c = $e(() => {
      let h = w.NODE_TYPE;
      for (const b in t)
        if (t[b][h] === void 0) {
          h = w.NODE_TYPE_EXPLAIN;
          break;
        }
      const v = be.groupBy(t, h), E = [];
      return be.each(v, (b, R) => {
        E.push({
          name: R,
          count: b.length,
          time: be.sumBy(b, w.ACTUAL_TIME),
          timePercent: s(b),
          nodes: b
        });
      }), E;
    }), p = $e(() => {
      const h = be.groupBy(
        be.filter(t, (E) => E[w.CTE_NAME] !== void 0),
        w.CTE_NAME
      ), v = [];
      return be.each(h, (E, b) => {
        v.push({
          name: b,
          count: E.length,
          time: be.sumBy(E, w.ACTUAL_TIME),
          timePercent: s(E),
          nodes: E
        });
      }), v;
    });
    return (h, v) => (q(), re("div", hM, [
      D("div", vM, [
        D("div", gM, [
          D("div", mM, [
            D("div", EM, [
              We(su, {
                class: "table table-sm mb-0",
                values: l.value,
                sort: "time",
                dir: S(Dr).desc
              }, {
                body: Pt((E) => [
                  (q(!0), re(Et, null, er(E.values, (b) => (q(), an(uu, {
                    key: b,
                    value: b,
                    executionTime: n.value
                  }, null, 8, ["value", "executionTime"]))), 128))
                ]),
                default: Pt(() => [
                  D("thead", _M, [
                    D("tr", null, [
                      D("th", yM, [
                        We(Qn, { name: "name" }, {
                          default: Pt(() => v[0] || (v[0] = [
                            B("Table", -1)
                          ])),
                          _: 1,
                          __: [0]
                        })
                      ]),
                      v[3] || (v[3] = B()),
                      D("th", TM, [
                        We(Qn, { name: "count" }, {
                          default: Pt(() => v[1] || (v[1] = [
                            B("Count", -1)
                          ])),
                          _: 1,
                          __: [1]
                        })
                      ]),
                      v[4] || (v[4] = B()),
                      D("th", AM, [
                        We(Qn, { name: "time" }, {
                          default: Pt(() => v[2] || (v[2] = [
                            B("Time", -1)
                          ])),
                          _: 1,
                          __: [2]
                        })
                      ])
                    ])
                  ]),
                  v[6] || (v[6] = B()),
                  v[7] || (v[7] = B()),
                  l.value.length ? Le("", !0) : (q(), re("tbody", bM, v[5] || (v[5] = [
                    D("tr", null, [
                      D("td", {
                        colspan: "3",
                        class: "text-center fst-italic"
                      }, `
                    No tables used
                  `)
                    ], -1)
                  ])))
                ]),
                _: 1,
                __: [6, 7]
              }, 8, ["values", "dir"])
            ])
          ])
        ]),
        v[30] || (v[30] = B()),
        D("div", OM, [
          D("div", NM, [
            D("div", SM, [
              We(su, {
                class: "table table-sm mb-0",
                values: f.value,
                sort: "time",
                dir: S(Dr).desc
              }, {
                body: Pt((E) => [
                  (q(!0), re(Et, null, er(E.values, (b) => (q(), an(uu, {
                    key: b,
                    value: b,
                    executionTime: n.value
                  }, null, 8, ["value", "executionTime"]))), 128))
                ]),
                default: Pt(() => [
                  D("thead", IM, [
                    D("tr", null, [
                      D("th", RM, [
                        We(Qn, { name: "name" }, {
                          default: Pt(() => v[8] || (v[8] = [
                            B("Function", -1)
                          ])),
                          _: 1,
                          __: [8]
                        })
                      ]),
                      v[11] || (v[11] = B()),
                      D("th", wM, [
                        We(Qn, { name: "count" }, {
                          default: Pt(() => v[9] || (v[9] = [
                            B("Count", -1)
                          ])),
                          _: 1,
                          __: [9]
                        })
                      ]),
                      v[12] || (v[12] = B()),
                      D("th", xM, [
                        We(Qn, { name: "time" }, {
                          default: Pt(() => v[10] || (v[10] = [
                            B("Time", -1)
                          ])),
                          _: 1,
                          __: [10]
                        })
                      ])
                    ])
                  ]),
                  v[14] || (v[14] = B()),
                  v[15] || (v[15] = B()),
                  f.value.length ? Le("", !0) : (q(), re("tbody", CM, v[13] || (v[13] = [
                    D("tr", null, [
                      D("td", {
                        colspan: "3",
                        class: "text-center fst-italic"
                      }, `
                    No function used
                  `)
                    ], -1)
                  ])))
                ]),
                _: 1,
                __: [14, 15]
              }, 8, ["values", "dir"])
            ])
          ])
        ]),
        v[31] || (v[31] = B()),
        D("div", LM, [
          D("div", MM, [
            D("div", DM, [
              We(su, {
                class: "table table-sm mb-0",
                values: c.value,
                sort: "time",
                dir: S(Dr).desc
              }, {
                body: Pt((E) => [
                  (q(!0), re(Et, null, er(E.values, (b) => (q(), an(uu, {
                    key: b,
                    value: b,
                    executionTime: n.value
                  }, null, 8, ["value", "executionTime"]))), 128))
                ]),
                default: Pt(() => [
                  D("thead", PM, [
                    D("tr", null, [
                      D("th", UM, [
                        We(Qn, { name: "name" }, {
                          default: Pt(() => v[16] || (v[16] = [
                            B("Node Type", -1)
                          ])),
                          _: 1,
                          __: [16]
                        })
                      ]),
                      v[19] || (v[19] = B()),
                      D("th", $M, [
                        We(Qn, { name: "count" }, {
                          default: Pt(() => v[17] || (v[17] = [
                            B("Count", -1)
                          ])),
                          _: 1,
                          __: [17]
                        })
                      ]),
                      v[20] || (v[20] = B()),
                      D("th", kM, [
                        We(Qn, { name: "time" }, {
                          default: Pt(() => v[18] || (v[18] = [
                            B("Time", -1)
                          ])),
                          _: 1,
                          __: [18]
                        })
                      ])
                    ])
                  ]),
                  v[21] || (v[21] = B())
                ]),
                _: 1,
                __: [21]
              }, 8, ["values", "dir"])
            ])
          ])
        ]),
        v[32] || (v[32] = B()),
        D("div", FM, [
          D("div", BM, [
            D("div", HM, [
              We(su, {
                class: "table table-sm mb-0",
                values: p.value,
                sort: "time",
                dir: S(Dr).desc
              }, {
                body: Pt((E) => [
                  (q(!0), re(Et, null, er(E.values, (b) => (q(), an(uu, {
                    key: b,
                    value: b,
                    executionTime: n.value
                  }, null, 8, ["value", "executionTime"]))), 128))
                ]),
                default: Pt(() => [
                  D("thead", GM, [
                    D("tr", null, [
                      D("th", zM, [
                        We(Qn, { name: "name" }, {
                          default: Pt(() => v[22] || (v[22] = [
                            B("CTE", -1)
                          ])),
                          _: 1,
                          __: [22]
                        })
                      ]),
                      v[25] || (v[25] = B()),
                      D("th", WM, [
                        We(Qn, { name: "count" }, {
                          default: Pt(() => v[23] || (v[23] = [
                            B("Count", -1)
                          ])),
                          _: 1,
                          __: [23]
                        })
                      ]),
                      v[26] || (v[26] = B()),
                      D("th", XM, [
                        We(Qn, { name: "time" }, {
                          default: Pt(() => v[24] || (v[24] = [
                            B("Time", -1)
                          ])),
                          _: 1,
                          __: [24]
                        })
                      ])
                    ])
                  ]),
                  v[28] || (v[28] = B()),
                  v[29] || (v[29] = B()),
                  p.value.length ? Le("", !0) : (q(), re("tbody", YM, v[27] || (v[27] = [
                    D("tr", null, [
                      D("td", {
                        colspan: "3",
                        class: "text-center fst-italic"
                      }, `
                    No CTE used
                  `)
                    ], -1)
                  ])))
                ]),
                _: 1,
                __: [28, 29]
              }, 8, ["values", "dir"])
            ])
          ])
        ])
      ])
    ]));
  }
});
var Vf = {}, jf = { exports: {} }, rg;
function jM() {
  return rg || (rg = 1, function(e) {
    function t(o) {
      if (o)
        return n(o);
      this._callbacks = /* @__PURE__ */ new Map();
    }
    function n(o) {
      return Object.assign(o, t.prototype), o._callbacks = /* @__PURE__ */ new Map(), o;
    }
    t.prototype.on = function(o, a) {
      const s = this._callbacks.get(o) ?? [];
      return s.push(a), this._callbacks.set(o, s), this;
    }, t.prototype.once = function(o, a) {
      const s = (...l) => {
        this.off(o, s), a.apply(this, l);
      };
      return s.fn = a, this.on(o, s), this;
    }, t.prototype.off = function(o, a) {
      if (o === void 0 && a === void 0)
        return this._callbacks.clear(), this;
      if (a === void 0)
        return this._callbacks.delete(o), this;
      const s = this._callbacks.get(o);
      if (s) {
        for (const [l, f] of s.entries())
          if (f === a || f.fn === a) {
            s.splice(l, 1);
            break;
          }
        s.length === 0 ? this._callbacks.delete(o) : this._callbacks.set(o, s);
      }
      return this;
    }, t.prototype.emit = function(o, ...a) {
      const s = this._callbacks.get(o);
      if (s) {
        const l = [...s];
        for (const f of l)
          f.apply(this, a);
      }
      return this;
    }, t.prototype.listeners = function(o) {
      return this._callbacks.get(o) ?? [];
    }, t.prototype.listenerCount = function(o) {
      if (o)
        return this.listeners(o).length;
      let a = 0;
      for (const s of this._callbacks.values())
        a += s.length;
      return a;
    }, t.prototype.hasListeners = function(o) {
      return this.listenerCount(o) > 0;
    }, t.prototype.addEventListener = t.prototype.on, t.prototype.removeListener = t.prototype.off, t.prototype.removeEventListener = t.prototype.off, t.prototype.removeAllListeners = t.prototype.off, e.exports = t;
  }(jf)), jf.exports;
}
var Kf, ig;
function KM() {
  if (ig) return Kf;
  ig = 1;
  var e = /* @__PURE__ */ jM();
  function t() {
    e.call(this);
  }
  return t.prototype = new e(), Kf = t, t.Stream = t, t.prototype.pipe = function(n, o) {
    var a = this;
    function s(E) {
      n.writable && n.write(E) === !1 && a.pause && a.pause();
    }
    a.on("data", s);
    function l() {
      a.readable && a.resume && a.resume();
    }
    n.on("drain", l), !n._isStdio && (!o || o.end !== !1) && (a.on("end", c), a.on("close", p));
    var f = !1;
    function c() {
      f || (f = !0, n.end());
    }
    function p() {
      f || (f = !0, typeof n.destroy == "function" && n.destroy());
    }
    function h(E) {
      if (v(), !this.hasListeners("error"))
        throw E;
    }
    a.on("error", h), n.on("error", h);
    function v() {
      a.off("data", s), n.off("drain", l), a.off("end", c), a.off("close", p), a.off("error", h), n.off("error", h), a.off("end", v), a.off("close", v), n.off("end", v), n.off("close", v);
    }
    return a.on("end", v), a.on("close", v), n.on("end", v), n.on("close", v), n.emit("pipe", a), n;
  }, Kf;
}
var og;
function qM() {
  return og || (og = 1, function(e) {
    (function(t) {
      var n = typeof process == "object" && process.env ? process.env : self;
      t.parser = function(_) {
        return new E(_);
      }, t.CParser = E, t.CStream = R, t.createStream = b, t.MAX_BUFFER_LENGTH = 64 * 1024, t.DEBUG = n.CDEBUG === "debug", t.INFO = n.CDEBUG === "debug" || n.CDEBUG === "info", t.EVENTS = [
        "value",
        "string",
        "key",
        "openobject",
        "closeobject",
        "openarray",
        "closearray",
        "error",
        "end",
        "ready"
      ];
      var o = {
        textNode: void 0,
        numberNode: ""
      }, a = t.EVENTS.filter(function(_) {
        return _ !== "error" && _ !== "end";
      }), s = 0, l;
      t.STATE = {
        BEGIN: s++,
        VALUE: s++,
        OPEN_OBJECT: s++,
        CLOSE_OBJECT: s++,
        OPEN_ARRAY: s++,
        CLOSE_ARRAY: s++,
        TEXT_ESCAPE: s++,
        STRING: s++,
        BACKSLASH: s++,
        END: s++,
        OPEN_KEY: s++,
        CLOSE_KEY: s++,
        TRUE: s++,
        TRUE2: s++,
        TRUE3: s++,
        FALSE: s++,
        FALSE2: s++,
        FALSE3: s++,
        FALSE4: s++,
        NULL: s++,
        NULL2: s++,
        NULL3: s++,
        NUMBER_DECIMAL_POINT: s++,
        NUMBER_DIGIT: s++
        // [0-9]
      };
      for (var f in t.STATE) t.STATE[t.STATE[f]] = f;
      s = t.STATE;
      const c = {
        tab: 9,
        // \t
        lineFeed: 10,
        // \n
        carriageReturn: 13,
        // \r
        space: 32,
        // " "
        doubleQuote: 34,
        // "
        plus: 43,
        // +
        comma: 44,
        // ,
        minus: 45,
        // -
        period: 46,
        // .
        _0: 48,
        // 0
        _9: 57,
        // 9
        colon: 58,
        // :
        E: 69,
        // E
        openBracket: 91,
        // [
        backslash: 92,
        // \
        closeBracket: 93,
        // ]
        a: 97,
        // a
        b: 98,
        // b
        e: 101,
        // e 
        f: 102,
        // f
        l: 108,
        // l
        n: 110,
        // n
        r: 114,
        // r
        s: 115,
        // s
        t: 116,
        // t
        u: 117,
        // u
        openBrace: 123,
        // {
        closeBrace: 125
        // }
      };
      Object.create || (Object.create = function(_) {
        function A() {
          this.__proto__ = _;
        }
        return A.prototype = _, new A();
      }), Object.getPrototypeOf || (Object.getPrototypeOf = function(_) {
        return _.__proto__;
      }), Object.keys || (Object.keys = function(_) {
        var A = [];
        for (var Z in _) _.hasOwnProperty(Z) && A.push(Z);
        return A;
      });
      function p(_) {
        var A = Math.max(t.MAX_BUFFER_LENGTH, 10), Z = 0;
        for (var G in o) {
          var _e = _[G] === void 0 ? 0 : _[G].length;
          if (_e > A)
            switch (G) {
              case "text":
                closeText(_);
                break;
              default:
                g(_, "Max buffer length exceeded: " + G);
            }
          Z = Math.max(Z, _e);
        }
        _.bufferCheckPosition = t.MAX_BUFFER_LENGTH - Z + _.position;
      }
      function h(_) {
        for (var A in o)
          _[A] = o[A];
      }
      var v = /[\\"\n]/g;
      function E(_) {
        if (!(this instanceof E)) return new E(_);
        var A = this;
        h(A), A.bufferCheckPosition = t.MAX_BUFFER_LENGTH, A.q = A.c = A.p = "", A.opt = _ || {}, A.closed = A.closedRoot = A.sawRoot = !1, A.tag = A.error = null, A.state = s.BEGIN, A.stack = new Array(), A.position = A.column = 0, A.line = 1, A.slashed = !1, A.unicodeI = 0, A.unicodeS = null, A.depth = 0, T(A, "onready");
      }
      E.prototype = {
        end: function() {
          H(this);
        },
        write: U,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        }
      };
      try {
        l = KM().Stream;
      } catch {
        l = function() {
        };
      }
      function b(_) {
        return new R(_);
      }
      function R(_) {
        if (!(this instanceof R)) return new R(_);
        this._parser = new E(_), this.writable = !0, this.readable = !0, this.bytes_remaining = 0, this.bytes_in_sequence = 0, this.temp_buffs = { 2: new Buffer(2), 3: new Buffer(3), 4: new Buffer(4) }, this.string = "";
        var A = this;
        l.apply(A), this._parser.onend = function() {
          A.emit("end");
        }, this._parser.onerror = function(Z) {
          A.emit("error", Z), A._parser.error = null;
        }, a.forEach(function(Z) {
          Object.defineProperty(
            A,
            "on" + Z,
            {
              get: function() {
                return A._parser["on" + Z];
              },
              set: function(G) {
                if (!G)
                  return A.removeAllListeners(Z), A._parser["on" + Z] = G, G;
                A.on(Z, G);
              },
              enumerable: !0,
              configurable: !1
            }
          );
        });
      }
      R.prototype = Object.create(
        l.prototype,
        { constructor: { value: R } }
      ), R.prototype.write = function(_) {
        _ = new Buffer(_);
        for (var A = 0; A < _.length; A++) {
          var Z = _[A];
          if (this.bytes_remaining > 0) {
            for (var G = 0; G < this.bytes_remaining; G++)
              this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + G] = _[G];
            this.string = this.temp_buffs[this.bytes_in_sequence].toString(), this.bytes_in_sequence = this.bytes_remaining = 0, A = A + G - 1, this._parser.write(this.string), this.emit("data", this.string);
            continue;
          }
          if (this.bytes_remaining === 0 && Z >= 128)
            if (Z >= 194 && Z <= 223 && (this.bytes_in_sequence = 2), Z >= 224 && Z <= 239 && (this.bytes_in_sequence = 3), Z >= 240 && Z <= 244 && (this.bytes_in_sequence = 4), this.bytes_in_sequence + A > _.length) {
              for (var _e = 0; _e <= _.length - 1 - A; _e++)
                this.temp_buffs[this.bytes_in_sequence][_e] = _[A + _e];
              return this.bytes_remaining = A + this.bytes_in_sequence - _.length, !0;
            } else {
              this.string = _.slice(A, A + this.bytes_in_sequence).toString(), A = A + this.bytes_in_sequence - 1, this._parser.write(this.string), this.emit("data", this.string);
              continue;
            }
          for (var ye = A; ye < _.length && !(_[ye] >= 128); ye++)
            ;
          this.string = _.slice(A, ye).toString(), this._parser.write(this.string), this.emit("data", this.string), A = ye - 1;
        }
      }, R.prototype.end = function(_) {
        return _ && _.length && this._parser.write(_.toString()), this._parser.end(), !0;
      }, R.prototype.on = function(_, A) {
        var Z = this;
        return !Z._parser["on" + _] && a.indexOf(_) !== -1 && (Z._parser["on" + _] = function() {
          var G = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          G.splice(0, 0, _), Z.emit.apply(Z, G);
        }), l.prototype.on.call(Z, _, A);
      }, R.prototype.destroy = function() {
        h(this._parser), this.emit("close");
      };
      function T(_, A, Z) {
        t.INFO && console.log("-- emit", A, Z), _[A] && _[A](Z);
      }
      function x(_, A, Z) {
        I(_), T(_, A, Z);
      }
      function I(_, A) {
        _.textNode = P(_.opt, _.textNode), _.textNode !== void 0 && T(_, A || "onvalue", _.textNode), _.textNode = void 0;
      }
      function F(_) {
        _.numberNode && T(_, "onvalue", parseFloat(_.numberNode)), _.numberNode = "";
      }
      function P(_, A) {
        return A === void 0 || (_.trim && (A = A.trim()), _.normalize && (A = A.replace(/\s+/g, " "))), A;
      }
      function g(_, A) {
        return I(_), A += `
Line: ` + _.line + `
Column: ` + _.column + `
Char: ` + _.c, A = new Error(A), _.error = A, T(_, "onerror", A), _;
      }
      function H(_) {
        return (_.state !== s.VALUE || _.depth !== 0) && g(_, "Unexpected end"), I(_), _.c = "", _.closed = !0, T(_, "onend"), E.call(_, _.opt), _;
      }
      function $(_) {
        return _ === c.carriageReturn || _ === c.lineFeed || _ === c.space || _ === c.tab;
      }
      function U(_) {
        var A = this;
        if (this.error) throw this.error;
        if (A.closed) return g(
          A,
          "Cannot write after close. Assign an onready handler."
        );
        if (_ === null) return H(A);
        var Z = 0, G = _.charCodeAt(0), _e = A.p, ye = !1;
        for (t.DEBUG && console.log("write -> [" + _ + "]"); G && (_e = G, A.c = G = _.charCodeAt(Z++), _e !== G ? A.p = _e : _e = A.p, !!G); )
          switch (t.DEBUG && console.log(Z, G, t.STATE[A.state]), ye ? ye = !1 : (A.position++, G === c.lineFeed ? (A.line++, A.column = 0) : A.column++), A.state) {
            case s.BEGIN:
              G === c.openBrace ? A.state = s.OPEN_OBJECT : G === c.openBracket ? A.state = s.OPEN_ARRAY : $(G) || g(A, "Non-whitespace before {[.");
              continue;
            case s.OPEN_KEY:
            case s.OPEN_OBJECT:
              if ($(G)) continue;
              if (A.state === s.OPEN_KEY) A.stack.push(s.CLOSE_KEY);
              else if (G === c.closeBrace) {
                T(A, "onopenobject"), this.depth++, T(A, "oncloseobject"), this.depth--, A.state = A.stack.pop() || s.VALUE;
                continue;
              } else A.stack.push(s.CLOSE_OBJECT);
              G === c.doubleQuote ? A.state = s.STRING : g(A, 'Malformed object key should start with "');
              continue;
            case s.CLOSE_KEY:
            case s.CLOSE_OBJECT:
              if ($(G)) continue;
              A.state, s.CLOSE_KEY, G === c.colon ? (A.state === s.CLOSE_OBJECT ? (A.stack.push(s.CLOSE_OBJECT), I(A, "onopenobject"), this.depth++) : I(A, "onkey"), A.state = s.VALUE) : G === c.closeBrace ? (x(A, "oncloseobject"), this.depth--, A.state = A.stack.pop() || s.VALUE) : G === c.comma ? (A.state === s.CLOSE_OBJECT && A.stack.push(s.CLOSE_OBJECT), I(A), A.state = s.OPEN_KEY) : g(A, "Bad object");
              continue;
            case s.OPEN_ARRAY:
            // after an array there always a value
            case s.VALUE:
              if ($(G)) continue;
              if (A.state === s.OPEN_ARRAY)
                if (T(A, "onopenarray"), this.depth++, A.state = s.VALUE, G === c.closeBracket) {
                  T(A, "onclosearray"), this.depth--, A.state = A.stack.pop() || s.VALUE;
                  continue;
                } else
                  A.stack.push(s.CLOSE_ARRAY);
              G === c.doubleQuote ? A.state = s.STRING : G === c.openBrace ? A.state = s.OPEN_OBJECT : G === c.openBracket ? A.state = s.OPEN_ARRAY : G === c.t ? A.state = s.TRUE : G === c.f ? A.state = s.FALSE : G === c.n ? A.state = s.NULL : G === c.minus ? A.numberNode += "-" : c._0 <= G && G <= c._9 ? (A.numberNode += String.fromCharCode(G), A.state = s.NUMBER_DIGIT) : g(A, "Bad value");
              continue;
            case s.CLOSE_ARRAY:
              if (G === c.comma)
                A.stack.push(s.CLOSE_ARRAY), I(A, "onvalue"), A.state = s.VALUE;
              else if (G === c.closeBracket)
                x(A, "onclosearray"), this.depth--, A.state = A.stack.pop() || s.VALUE;
              else {
                if ($(G))
                  continue;
                g(A, "Bad array");
              }
              continue;
            case s.STRING:
              A.textNode === void 0 && (A.textNode = "");
              var z = Z - 1, fe = A.slashed, j = A.unicodeI;
              e: for (; ; ) {
                for (t.DEBUG && console.log(
                  Z,
                  G,
                  t.STATE[A.state],
                  fe
                ); j > 0; )
                  if (A.unicodeS += String.fromCharCode(G), G = _.charCodeAt(Z++), A.position++, j === 4 ? (A.textNode += String.fromCharCode(parseInt(A.unicodeS, 16)), j = 0, z = Z - 1) : j++, !G) break e;
                if (G === c.doubleQuote && !fe) {
                  A.state = A.stack.pop() || s.VALUE, A.textNode += _.substring(z, Z - 1), A.position += Z - 1 - z;
                  break;
                }
                if (G === c.backslash && !fe && (fe = !0, A.textNode += _.substring(z, Z - 1), A.position += Z - 1 - z, G = _.charCodeAt(Z++), A.position++, !G))
                  break;
                if (fe) {
                  if (fe = !1, G === c.n ? A.textNode += `
` : G === c.r ? A.textNode += "\r" : G === c.t ? A.textNode += "	" : G === c.f ? A.textNode += "\f" : G === c.b ? A.textNode += "\b" : G === c.u ? (j = 1, A.unicodeS = "") : A.textNode += String.fromCharCode(G), G = _.charCodeAt(Z++), A.position++, z = Z - 1, G) continue;
                  break;
                }
                v.lastIndex = Z;
                var se = v.exec(_);
                if (se === null) {
                  Z = _.length + 1, A.textNode += _.substring(z, Z - 1), A.position += Z - 1 - z;
                  break;
                }
                if (Z = se.index + 1, G = _.charCodeAt(se.index), !G) {
                  A.textNode += _.substring(z, Z - 1), A.position += Z - 1 - z;
                  break;
                }
              }
              A.slashed = fe, A.unicodeI = j;
              continue;
            case s.TRUE:
              G === c.r ? A.state = s.TRUE2 : g(A, "Invalid true started with t" + G);
              continue;
            case s.TRUE2:
              G === c.u ? A.state = s.TRUE3 : g(A, "Invalid true started with tr" + G);
              continue;
            case s.TRUE3:
              G === c.e ? (T(A, "onvalue", !0), A.state = A.stack.pop() || s.VALUE) : g(A, "Invalid true started with tru" + G);
              continue;
            case s.FALSE:
              G === c.a ? A.state = s.FALSE2 : g(A, "Invalid false started with f" + G);
              continue;
            case s.FALSE2:
              G === c.l ? A.state = s.FALSE3 : g(A, "Invalid false started with fa" + G);
              continue;
            case s.FALSE3:
              G === c.s ? A.state = s.FALSE4 : g(A, "Invalid false started with fal" + G);
              continue;
            case s.FALSE4:
              G === c.e ? (T(A, "onvalue", !1), A.state = A.stack.pop() || s.VALUE) : g(A, "Invalid false started with fals" + G);
              continue;
            case s.NULL:
              G === c.u ? A.state = s.NULL2 : g(A, "Invalid null started with n" + G);
              continue;
            case s.NULL2:
              G === c.l ? A.state = s.NULL3 : g(A, "Invalid null started with nu" + G);
              continue;
            case s.NULL3:
              G === c.l ? (T(A, "onvalue", null), A.state = A.stack.pop() || s.VALUE) : g(A, "Invalid null started with nul" + G);
              continue;
            case s.NUMBER_DECIMAL_POINT:
              G === c.period ? (A.numberNode += ".", A.state = s.NUMBER_DIGIT) : g(A, "Leading zero not followed by .");
              continue;
            case s.NUMBER_DIGIT:
              c._0 <= G && G <= c._9 ? A.numberNode += String.fromCharCode(G) : G === c.period ? (A.numberNode.indexOf(".") !== -1 && g(A, "Invalid number has two dots"), A.numberNode += ".") : G === c.e || G === c.E ? ((A.numberNode.indexOf("e") !== -1 || A.numberNode.indexOf("E") !== -1) && g(A, "Invalid number has two exponential"), A.numberNode += "e") : G === c.plus || G === c.minus ? (_e === c.e || _e === c.E || g(A, "Invalid symbol in number"), A.numberNode += String.fromCharCode(G)) : (F(A), Z--, ye = !0, A.state = A.stack.pop() || s.VALUE);
              continue;
            default:
              g(A, "Unknown state: " + A.state);
          }
        return A.position >= A.bufferCheckPosition && p(A), A;
      }
    })(e);
  }(Vf)), Vf;
}
var JM = qM();
const ZM = /* @__PURE__ */ Yu(JM);
class QM {
  static instance;
  nodeId = 0;
  createPlan(t, n, o) {
    if (o = o.replace(/(\S)(?!$)(\s{2,})/gm, "$1 "), n) {
      const a = {
        id: w.DEV_PLAN_TAG + (/* @__PURE__ */ new Date()).getTime().toString(),
        name: t || "plan created on " + (/* @__PURE__ */ new Date()).toDateString(),
        createdOn: /* @__PURE__ */ new Date(),
        content: n,
        query: o,
        planStats: {}
      };
      return this.nodeId = 1, n[w.CPU_TIME] !== void 0 ? this.processNode(n[w.PLANS][0], a) : this.processNode(n, a), this.calculateMaximums(a), a;
    } else
      throw new Error("Invalid plan");
  }
  // recursively walk down the plan to compute various metrics
  processNode(t, n) {
    t.nodeId = this.nodeId++, be.each(t[w.PLANS], (o) => {
      this.processNode(o, n);
    });
  }
  calculateMaximums(t) {
    function n(p) {
      return be.map(p, (h) => [h, n(h[w.PLANS])]);
    }
    let o = [];
    o = o.concat(be.flattenDeep(n(t.content[w.PLANS])));
    const a = be.maxBy(o, w.ACTUAL_ROWS);
    t.content.maxRows = a && a[w.ACTUAL_ROWS] !== void 0 ? a[w.ACTUAL_ROWS] : 0;
    const s = be.maxBy(o, w.OPERATOR_ROWS_SCANNED);
    t.content.maxRowsScanned = s && s[w.OPERATOR_ROWS_SCANNED] !== void 0 ? s[w.OPERATOR_ROWS_SCANNED] : 0;
    const l = be.maxBy(o, w.RESULT_SET_SIZE);
    t.content.maxResult = l && l[w.RESULT_SET_SIZE] !== void 0 ? l[w.RESULT_SET_SIZE] : 0;
    const f = be.maxBy(o, function(p) {
      const h = p[w.EXTRA_INFO][w.ESTIMATED_ROWS];
      return h ? parseInt(h, 10) : 0;
    });
    t.content.maxEstimatedRows = f && f[w.EXTRA_INFO][w.ESTIMATED_ROWS] ? parseInt(f[w.EXTRA_INFO][w.ESTIMATED_ROWS], 10) : 0;
    const c = be.maxBy(o, w.ACTUAL_TIME);
    t.content.maxDuration = c && c[w.ACTUAL_TIME] !== void 0 ? c[w.ACTUAL_TIME] : 0;
  }
  cleanupSource(t) {
    return t = t.replace(/^(\||║|│)(.*)\1\r?\n/gm, `$2
`), t = t.replace(/^\+-+\+\r?\n/gm, ""), t = t.replace(/^(-|─|═)\1+\r?\n/gm, ""), t = t.replace(/^(├|╟|╠|╞)(─|═)\2*(┤|╢|╣|╡)\r?\n/gm, ""), t = t.replace(/^\+-+\+\r?\n/gm, ""), t = t.replace(/^└(─)+┘\r?\n/gm, ""), t = t.replace(/^╚(═)+╝\r?\n/gm, ""), t = t.replace(/^┌(─)+┐\r?\n/gm, ""), t = t.replace(/^╔(═)+╗\r?\n/gm, ""), t = t.replace(/^(["'])(.*)\1\r?/gm, "$2"), t = t.replace(/↵\r?/gm, `
`), t = t.replace(/^\s*QUERY PLAN\s*\r?\n/m, ""), t = t.replace(/^\(\d+\s+[a-z]*s?\)(\r?\n|$)/gm, `
`), t;
  }
  fromSource(t) {
    return t = this.cleanupSource(t), this.parseJson(t);
  }
  fromJson(t) {
    const n = t.split(/[\r\n]+/);
    let o = "", a = 0;
    be.each(n, (f, c) => {
      const p = /^(\s*)(\[|\{)\s*$/.exec(f);
      if (p)
        return o = p[1], a = c, !1;
    });
    let s = 0;
    be.each(n, (f, c) => {
      if (new RegExp("^" + o + "(]|})s*$").exec(f))
        return s = c, !1;
    });
    const l = n.slice(a, s + 1).join(`
`).replace(/""/gm, '"');
    return this.parseJson(l);
  }
  // Stream parse JSON as it can contain duplicate keys (workers)
  parseJson(t) {
    const n = ZM.parser(), o = [];
    let a = null, s = null;
    return n.onvalue = (l) => {
      const f = o[o.length - 1];
      if (be.isArray(f))
        f.push(l);
      else {
        const c = Object.keys(f), p = c[c.length - 1];
        f[p] = l;
      }
    }, n.onopenobject = (l) => {
      const f = {};
      f[l] = null, o.push(f);
    }, n.onkey = (l) => {
      const f = o[o.length - 1];
      Object.keys(f).indexOf(l) !== -1 ? s = [o.length - 1, f[l]] : f[l] = null;
    }, n.onopenarray = () => {
      o.push([]);
    }, n.oncloseobject = n.onclosearray = () => {
      const l = o.pop();
      if (!o.length)
        a = l;
      else {
        const f = o[o.length - 1];
        if (s && s[0] === o.length - 1)
          be.merge(s[1], l), s = null;
        else if (be.isArray(f))
          f.push(l);
        else {
          const c = Object.keys(f), p = c[c.length - 1];
          f[p] = l;
        }
      }
    }, n.write(t).close(), Array.isArray(a) && (a = a[0]), a;
  }
  splitIntoLines(t) {
    const n = [], o = t.split(/\r?\n/), a = (f, c) => (f.match(c) || []).length, s = (f) => {
      const c = f.indexOf(")"), p = f.indexOf("(");
      return c != -1 && c < p;
    }, l = (f, c) => f.search(/\S/) == c.search(/\S/);
    return be.each(o, (f) => {
      a(f, /\)/g) > a(f, /\(/g) ? n[n.length - 1] += f : f.match(
        /^(?:Total\s+runtime|Planning\s+time|Execution\s+time|Time|Filter|Output|JIT)/i
      ) ? n.push(f) : f.match(/^\S/) || // doesn't start with a blank space (allowed only for the first node)
      f.match(/^\s*\(/) || // first non-blank character is an opening parenthesis
      s(f) ? 0 < n.length ? n[n.length - 1] += f : n.push(f) : 0 < n.length && n[n.length - 1].match(/^\s*Output/i) && !l(n[n.length - 1], f) ? n[n.length - 1] += f : n.push(f);
    }), n;
  }
}
function yu(e, t) {
  return e == null || t == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function eD(e, t) {
  return e == null || t == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function S0(e) {
  let t, n, o;
  e.length !== 2 ? (t = yu, n = (f, c) => yu(e(f), c), o = (f, c) => e(f) - c) : (t = e === yu || e === eD ? e : tD, n = e, o = e);
  function a(f, c, p = 0, h = f.length) {
    if (p < h) {
      if (t(c, c) !== 0) return h;
      do {
        const v = p + h >>> 1;
        n(f[v], c) < 0 ? p = v + 1 : h = v;
      } while (p < h);
    }
    return p;
  }
  function s(f, c, p = 0, h = f.length) {
    if (p < h) {
      if (t(c, c) !== 0) return h;
      do {
        const v = p + h >>> 1;
        n(f[v], c) <= 0 ? p = v + 1 : h = v;
      } while (p < h);
    }
    return p;
  }
  function l(f, c, p = 0, h = f.length) {
    const v = a(f, c, p, h - 1);
    return v > p && o(f[v - 1], c) > -o(f[v], c) ? v - 1 : v;
  }
  return { left: a, center: l, right: s };
}
function tD() {
  return 0;
}
function nD(e) {
  return e === null ? NaN : +e;
}
const rD = S0(yu), iD = rD.right;
S0(nD).center;
const oD = Math.sqrt(50), aD = Math.sqrt(10), sD = Math.sqrt(2);
function Pu(e, t, n) {
  const o = (t - e) / Math.max(0, n), a = Math.floor(Math.log10(o)), s = o / Math.pow(10, a), l = s >= oD ? 10 : s >= aD ? 5 : s >= sD ? 2 : 1;
  let f, c, p;
  return a < 0 ? (p = Math.pow(10, -a) / l, f = Math.round(e * p), c = Math.round(t * p), f / p < e && ++f, c / p > t && --c, p = -p) : (p = Math.pow(10, a) * l, f = Math.round(e / p), c = Math.round(t / p), f * p < e && ++f, c * p > t && --c), c < f && 0.5 <= n && n < 2 ? Pu(e, t, n * 2) : [f, c, p];
}
function uD(e, t, n) {
  if (t = +t, e = +e, n = +n, !(n > 0)) return [];
  if (e === t) return [e];
  const o = t < e, [a, s, l] = o ? Pu(t, e, n) : Pu(e, t, n);
  if (!(s >= a)) return [];
  const f = s - a + 1, c = new Array(f);
  if (o)
    if (l < 0) for (let p = 0; p < f; ++p) c[p] = (s - p) / -l;
    else for (let p = 0; p < f; ++p) c[p] = (s - p) * l;
  else if (l < 0) for (let p = 0; p < f; ++p) c[p] = (a + p) / -l;
  else for (let p = 0; p < f; ++p) c[p] = (a + p) * l;
  return c;
}
function Sc(e, t, n) {
  return t = +t, e = +e, n = +n, Pu(e, t, n)[2];
}
function lD(e, t, n) {
  t = +t, e = +e, n = +n;
  const o = t < e, a = o ? Sc(t, e, n) : Sc(e, t, n);
  return (o ? -1 : 1) * (a < 0 ? 1 / -a : a);
}
var fD = { value: () => {
} };
function gd() {
  for (var e = 0, t = arguments.length, n = {}, o; e < t; ++e) {
    if (!(o = arguments[e] + "") || o in n || /[\s.]/.test(o)) throw new Error("illegal type: " + o);
    n[o] = [];
  }
  return new Tu(n);
}
function Tu(e) {
  this._ = e;
}
function cD(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var o = "", a = n.indexOf(".");
    if (a >= 0 && (o = n.slice(a + 1), n = n.slice(0, a)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: o };
  });
}
Tu.prototype = gd.prototype = {
  constructor: Tu,
  on: function(e, t) {
    var n = this._, o = cD(e + "", n), a, s = -1, l = o.length;
    if (arguments.length < 2) {
      for (; ++s < l; ) if ((a = (e = o[s]).type) && (a = dD(n[a], e.name))) return a;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++s < l; )
      if (a = (e = o[s]).type) n[a] = ag(n[a], e.name, t);
      else if (t == null) for (a in n) n[a] = ag(n[a], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new Tu(e);
  },
  call: function(e, t) {
    if ((a = arguments.length - 2) > 0) for (var n = new Array(a), o = 0, a, s; o < a; ++o) n[o] = arguments[o + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (s = this._[e], o = 0, a = s.length; o < a; ++o) s[o].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var o = this._[e], a = 0, s = o.length; a < s; ++a) o[a].value.apply(t, n);
  }
};
function dD(e, t) {
  for (var n = 0, o = e.length, a; n < o; ++n)
    if ((a = e[n]).name === t)
      return a.value;
}
function ag(e, t, n) {
  for (var o = 0, a = e.length; o < a; ++o)
    if (e[o].name === t) {
      e[o] = fD, e = e.slice(0, o).concat(e.slice(o + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Ic = "http://www.w3.org/1999/xhtml";
const sg = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Ic,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function al(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), sg.hasOwnProperty(t) ? { space: sg[t], local: e } : e;
}
function pD(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === Ic && t.documentElement.namespaceURI === Ic ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function hD(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function I0(e) {
  var t = al(e);
  return (t.local ? hD : pD)(t);
}
function vD() {
}
function md(e) {
  return e == null ? vD : function() {
    return this.querySelector(e);
  };
}
function gD(e) {
  typeof e != "function" && (e = md(e));
  for (var t = this._groups, n = t.length, o = new Array(n), a = 0; a < n; ++a)
    for (var s = t[a], l = s.length, f = o[a] = new Array(l), c, p, h = 0; h < l; ++h)
      (c = s[h]) && (p = e.call(c, c.__data__, h, s)) && ("__data__" in c && (p.__data__ = c.__data__), f[h] = p);
  return new zn(o, this._parents);
}
function mD(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function ED() {
  return [];
}
function R0(e) {
  return e == null ? ED : function() {
    return this.querySelectorAll(e);
  };
}
function _D(e) {
  return function() {
    return mD(e.apply(this, arguments));
  };
}
function yD(e) {
  typeof e == "function" ? e = _D(e) : e = R0(e);
  for (var t = this._groups, n = t.length, o = [], a = [], s = 0; s < n; ++s)
    for (var l = t[s], f = l.length, c, p = 0; p < f; ++p)
      (c = l[p]) && (o.push(e.call(c, c.__data__, p, l)), a.push(c));
  return new zn(o, a);
}
function w0(e) {
  return function() {
    return this.matches(e);
  };
}
function x0(e) {
  return function(t) {
    return t.matches(e);
  };
}
var TD = Array.prototype.find;
function AD(e) {
  return function() {
    return TD.call(this.children, e);
  };
}
function bD() {
  return this.firstElementChild;
}
function OD(e) {
  return this.select(e == null ? bD : AD(typeof e == "function" ? e : x0(e)));
}
var ND = Array.prototype.filter;
function SD() {
  return Array.from(this.children);
}
function ID(e) {
  return function() {
    return ND.call(this.children, e);
  };
}
function RD(e) {
  return this.selectAll(e == null ? SD : ID(typeof e == "function" ? e : x0(e)));
}
function wD(e) {
  typeof e != "function" && (e = w0(e));
  for (var t = this._groups, n = t.length, o = new Array(n), a = 0; a < n; ++a)
    for (var s = t[a], l = s.length, f = o[a] = [], c, p = 0; p < l; ++p)
      (c = s[p]) && e.call(c, c.__data__, p, s) && f.push(c);
  return new zn(o, this._parents);
}
function C0(e) {
  return new Array(e.length);
}
function xD() {
  return new zn(this._enter || this._groups.map(C0), this._parents);
}
function Uu(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Uu.prototype = {
  constructor: Uu,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function CD(e) {
  return function() {
    return e;
  };
}
function LD(e, t, n, o, a, s) {
  for (var l = 0, f, c = t.length, p = s.length; l < p; ++l)
    (f = t[l]) ? (f.__data__ = s[l], o[l] = f) : n[l] = new Uu(e, s[l]);
  for (; l < c; ++l)
    (f = t[l]) && (a[l] = f);
}
function MD(e, t, n, o, a, s, l) {
  var f, c, p = /* @__PURE__ */ new Map(), h = t.length, v = s.length, E = new Array(h), b;
  for (f = 0; f < h; ++f)
    (c = t[f]) && (E[f] = b = l.call(c, c.__data__, f, t) + "", p.has(b) ? a[f] = c : p.set(b, c));
  for (f = 0; f < v; ++f)
    b = l.call(e, s[f], f, s) + "", (c = p.get(b)) ? (o[f] = c, c.__data__ = s[f], p.delete(b)) : n[f] = new Uu(e, s[f]);
  for (f = 0; f < h; ++f)
    (c = t[f]) && p.get(E[f]) === c && (a[f] = c);
}
function DD(e) {
  return e.__data__;
}
function PD(e, t) {
  if (!arguments.length) return Array.from(this, DD);
  var n = t ? MD : LD, o = this._parents, a = this._groups;
  typeof e != "function" && (e = CD(e));
  for (var s = a.length, l = new Array(s), f = new Array(s), c = new Array(s), p = 0; p < s; ++p) {
    var h = o[p], v = a[p], E = v.length, b = UD(e.call(h, h && h.__data__, p, o)), R = b.length, T = f[p] = new Array(R), x = l[p] = new Array(R), I = c[p] = new Array(E);
    n(h, v, T, x, I, b, t);
    for (var F = 0, P = 0, g, H; F < R; ++F)
      if (g = T[F]) {
        for (F >= P && (P = F + 1); !(H = x[P]) && ++P < R; ) ;
        g._next = H || null;
      }
  }
  return l = new zn(l, o), l._enter = f, l._exit = c, l;
}
function UD(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function $D() {
  return new zn(this._exit || this._groups.map(C0), this._parents);
}
function kD(e, t, n) {
  var o = this.enter(), a = this, s = this.exit();
  return typeof e == "function" ? (o = e(o), o && (o = o.selection())) : o = o.append(e + ""), t != null && (a = t(a), a && (a = a.selection())), n == null ? s.remove() : n(s), o && a ? o.merge(a).order() : a;
}
function FD(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, o = t._groups, a = n.length, s = o.length, l = Math.min(a, s), f = new Array(a), c = 0; c < l; ++c)
    for (var p = n[c], h = o[c], v = p.length, E = f[c] = new Array(v), b, R = 0; R < v; ++R)
      (b = p[R] || h[R]) && (E[R] = b);
  for (; c < a; ++c)
    f[c] = n[c];
  return new zn(f, this._parents);
}
function BD() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var o = e[t], a = o.length - 1, s = o[a], l; --a >= 0; )
      (l = o[a]) && (s && l.compareDocumentPosition(s) ^ 4 && s.parentNode.insertBefore(l, s), s = l);
  return this;
}
function HD(e) {
  e || (e = GD);
  function t(v, E) {
    return v && E ? e(v.__data__, E.__data__) : !v - !E;
  }
  for (var n = this._groups, o = n.length, a = new Array(o), s = 0; s < o; ++s) {
    for (var l = n[s], f = l.length, c = a[s] = new Array(f), p, h = 0; h < f; ++h)
      (p = l[h]) && (c[h] = p);
    c.sort(t);
  }
  return new zn(a, this._parents).order();
}
function GD(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function zD() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function WD() {
  return Array.from(this);
}
function XD() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], a = 0, s = o.length; a < s; ++a) {
      var l = o[a];
      if (l) return l;
    }
  return null;
}
function YD() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function VD() {
  return !this.node();
}
function jD(e) {
  for (var t = this._groups, n = 0, o = t.length; n < o; ++n)
    for (var a = t[n], s = 0, l = a.length, f; s < l; ++s)
      (f = a[s]) && e.call(f, f.__data__, s, a);
  return this;
}
function KD(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function qD(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function JD(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function ZD(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function QD(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function eP(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function tP(e, t) {
  var n = al(e);
  if (arguments.length < 2) {
    var o = this.node();
    return n.local ? o.getAttributeNS(n.space, n.local) : o.getAttribute(n);
  }
  return this.each((t == null ? n.local ? qD : KD : typeof t == "function" ? n.local ? eP : QD : n.local ? ZD : JD)(n, t));
}
function L0(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function nP(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function rP(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function iP(e, t, n) {
  return function() {
    var o = t.apply(this, arguments);
    o == null ? this.style.removeProperty(e) : this.style.setProperty(e, o, n);
  };
}
function oP(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? nP : typeof t == "function" ? iP : rP)(e, t, n ?? "")) : jo(this.node(), e);
}
function jo(e, t) {
  return e.style.getPropertyValue(t) || L0(e).getComputedStyle(e, null).getPropertyValue(t);
}
function aP(e) {
  return function() {
    delete this[e];
  };
}
function sP(e, t) {
  return function() {
    this[e] = t;
  };
}
function uP(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function lP(e, t) {
  return arguments.length > 1 ? this.each((t == null ? aP : typeof t == "function" ? uP : sP)(e, t)) : this.node()[e];
}
function M0(e) {
  return e.trim().split(/^|\s+/);
}
function Ed(e) {
  return e.classList || new D0(e);
}
function D0(e) {
  this._node = e, this._names = M0(e.getAttribute("class") || "");
}
D0.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function P0(e, t) {
  for (var n = Ed(e), o = -1, a = t.length; ++o < a; ) n.add(t[o]);
}
function U0(e, t) {
  for (var n = Ed(e), o = -1, a = t.length; ++o < a; ) n.remove(t[o]);
}
function fP(e) {
  return function() {
    P0(this, e);
  };
}
function cP(e) {
  return function() {
    U0(this, e);
  };
}
function dP(e, t) {
  return function() {
    (t.apply(this, arguments) ? P0 : U0)(this, e);
  };
}
function pP(e, t) {
  var n = M0(e + "");
  if (arguments.length < 2) {
    for (var o = Ed(this.node()), a = -1, s = n.length; ++a < s; ) if (!o.contains(n[a])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? dP : t ? fP : cP)(n, t));
}
function hP() {
  this.textContent = "";
}
function vP(e) {
  return function() {
    this.textContent = e;
  };
}
function gP(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function mP(e) {
  return arguments.length ? this.each(e == null ? hP : (typeof e == "function" ? gP : vP)(e)) : this.node().textContent;
}
function EP() {
  this.innerHTML = "";
}
function _P(e) {
  return function() {
    this.innerHTML = e;
  };
}
function yP(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function TP(e) {
  return arguments.length ? this.each(e == null ? EP : (typeof e == "function" ? yP : _P)(e)) : this.node().innerHTML;
}
function AP() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function bP() {
  return this.each(AP);
}
function OP() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function NP() {
  return this.each(OP);
}
function SP(e) {
  var t = typeof e == "function" ? e : I0(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function IP() {
  return null;
}
function RP(e, t) {
  var n = typeof e == "function" ? e : I0(e), o = t == null ? IP : typeof t == "function" ? t : md(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), o.apply(this, arguments) || null);
  });
}
function wP() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function xP() {
  return this.each(wP);
}
function CP() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function LP() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function MP(e) {
  return this.select(e ? LP : CP);
}
function DP(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function PP(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function UP(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", o = t.indexOf(".");
    return o >= 0 && (n = t.slice(o + 1), t = t.slice(0, o)), { type: t, name: n };
  });
}
function $P(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, o = -1, a = t.length, s; n < a; ++n)
        s = t[n], (!e.type || s.type === e.type) && s.name === e.name ? this.removeEventListener(s.type, s.listener, s.options) : t[++o] = s;
      ++o ? t.length = o : delete this.__on;
    }
  };
}
function kP(e, t, n) {
  return function() {
    var o = this.__on, a, s = PP(t);
    if (o) {
      for (var l = 0, f = o.length; l < f; ++l)
        if ((a = o[l]).type === e.type && a.name === e.name) {
          this.removeEventListener(a.type, a.listener, a.options), this.addEventListener(a.type, a.listener = s, a.options = n), a.value = t;
          return;
        }
    }
    this.addEventListener(e.type, s, n), a = { type: e.type, name: e.name, value: t, listener: s, options: n }, o ? o.push(a) : this.__on = [a];
  };
}
function FP(e, t, n) {
  var o = UP(e + ""), a, s = o.length, l;
  if (arguments.length < 2) {
    var f = this.node().__on;
    if (f) {
      for (var c = 0, p = f.length, h; c < p; ++c)
        for (a = 0, h = f[c]; a < s; ++a)
          if ((l = o[a]).type === h.type && l.name === h.name)
            return h.value;
    }
    return;
  }
  for (f = t ? kP : $P, a = 0; a < s; ++a) this.each(f(o[a], t, n));
  return this;
}
function $0(e, t, n) {
  var o = L0(e), a = o.CustomEvent;
  typeof a == "function" ? a = new a(t, n) : (a = o.document.createEvent("Event"), n ? (a.initEvent(t, n.bubbles, n.cancelable), a.detail = n.detail) : a.initEvent(t, !1, !1)), e.dispatchEvent(a);
}
function BP(e, t) {
  return function() {
    return $0(this, e, t);
  };
}
function HP(e, t) {
  return function() {
    return $0(this, e, t.apply(this, arguments));
  };
}
function GP(e, t) {
  return this.each((typeof t == "function" ? HP : BP)(e, t));
}
function* zP() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var o = e[t], a = 0, s = o.length, l; a < s; ++a)
      (l = o[a]) && (yield l);
}
var k0 = [null];
function zn(e, t) {
  this._groups = e, this._parents = t;
}
function rs() {
  return new zn([[document.documentElement]], k0);
}
function WP() {
  return this;
}
zn.prototype = rs.prototype = {
  constructor: zn,
  select: gD,
  selectAll: yD,
  selectChild: OD,
  selectChildren: RD,
  filter: wD,
  data: PD,
  enter: xD,
  exit: $D,
  join: kD,
  merge: FD,
  selection: WP,
  order: BD,
  sort: HD,
  call: zD,
  nodes: WD,
  node: XD,
  size: YD,
  empty: VD,
  each: jD,
  attr: tP,
  style: oP,
  property: lP,
  classed: pP,
  text: mP,
  html: TP,
  raise: bP,
  lower: NP,
  append: SP,
  insert: RP,
  remove: xP,
  clone: MP,
  datum: DP,
  on: FP,
  dispatch: GP,
  [Symbol.iterator]: zP
};
function Lr(e) {
  return typeof e == "string" ? new zn([[document.querySelector(e)]], [document.documentElement]) : new zn([[e]], k0);
}
function XP(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Xi(e, t) {
  if (e = XP(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var o = n.createSVGPoint();
      return o.x = e.clientX, o.y = e.clientY, o = o.matrixTransform(t.getScreenCTM().inverse()), [o.x, o.y];
    }
    if (t.getBoundingClientRect) {
      var a = t.getBoundingClientRect();
      return [e.clientX - a.left - t.clientLeft, e.clientY - a.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const Rc = { capture: !0, passive: !1 };
function wc(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function YP(e) {
  var t = e.document.documentElement, n = Lr(e).on("dragstart.drag", wc, Rc);
  "onselectstart" in t ? n.on("selectstart.drag", wc, Rc) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function VP(e, t) {
  var n = e.document.documentElement, o = Lr(e).on("dragstart.drag", null);
  t && (o.on("click.drag", wc, Rc), setTimeout(function() {
    o.on("click.drag", null);
  }, 0)), "onselectstart" in n ? o.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
function _d(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function F0(e, t) {
  var n = Object.create(e.prototype);
  for (var o in t) n[o] = t[o];
  return n;
}
function is() {
}
var Ya = 0.7, $u = 1 / Ya, Uo = "\\s*([+-]?\\d+)\\s*", Va = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", $r = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", jP = /^#([0-9a-f]{3,8})$/, KP = new RegExp(`^rgb\\(${Uo},${Uo},${Uo}\\)$`), qP = new RegExp(`^rgb\\(${$r},${$r},${$r}\\)$`), JP = new RegExp(`^rgba\\(${Uo},${Uo},${Uo},${Va}\\)$`), ZP = new RegExp(`^rgba\\(${$r},${$r},${$r},${Va}\\)$`), QP = new RegExp(`^hsl\\(${Va},${$r},${$r}\\)$`), e3 = new RegExp(`^hsla\\(${Va},${$r},${$r},${Va}\\)$`), ug = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
_d(is, so, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: lg,
  // Deprecated! Use color.formatHex.
  formatHex: lg,
  formatHex8: t3,
  formatHsl: n3,
  formatRgb: fg,
  toString: fg
});
function lg() {
  return this.rgb().formatHex();
}
function t3() {
  return this.rgb().formatHex8();
}
function n3() {
  return B0(this).formatHsl();
}
function fg() {
  return this.rgb().formatRgb();
}
function so(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = jP.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? cg(t) : n === 3 ? new Sn(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? lu(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? lu(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = KP.exec(e)) ? new Sn(t[1], t[2], t[3], 1) : (t = qP.exec(e)) ? new Sn(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = JP.exec(e)) ? lu(t[1], t[2], t[3], t[4]) : (t = ZP.exec(e)) ? lu(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = QP.exec(e)) ? hg(t[1], t[2] / 100, t[3] / 100, 1) : (t = e3.exec(e)) ? hg(t[1], t[2] / 100, t[3] / 100, t[4]) : ug.hasOwnProperty(e) ? cg(ug[e]) : e === "transparent" ? new Sn(NaN, NaN, NaN, 0) : null;
}
function cg(e) {
  return new Sn(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function lu(e, t, n, o) {
  return o <= 0 && (e = t = n = NaN), new Sn(e, t, n, o);
}
function r3(e) {
  return e instanceof is || (e = so(e)), e ? (e = e.rgb(), new Sn(e.r, e.g, e.b, e.opacity)) : new Sn();
}
function xc(e, t, n, o) {
  return arguments.length === 1 ? r3(e) : new Sn(e, t, n, o ?? 1);
}
function Sn(e, t, n, o) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +o;
}
_d(Sn, xc, F0(is, {
  brighter(e) {
    return e = e == null ? $u : Math.pow($u, e), new Sn(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Ya : Math.pow(Ya, e), new Sn(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Sn(no(this.r), no(this.g), no(this.b), ku(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: dg,
  // Deprecated! Use color.formatHex.
  formatHex: dg,
  formatHex8: i3,
  formatRgb: pg,
  toString: pg
}));
function dg() {
  return `#${Zi(this.r)}${Zi(this.g)}${Zi(this.b)}`;
}
function i3() {
  return `#${Zi(this.r)}${Zi(this.g)}${Zi(this.b)}${Zi((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function pg() {
  const e = ku(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${no(this.r)}, ${no(this.g)}, ${no(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function ku(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function no(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Zi(e) {
  return e = no(e), (e < 16 ? "0" : "") + e.toString(16);
}
function hg(e, t, n, o) {
  return o <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new gr(e, t, n, o);
}
function B0(e) {
  if (e instanceof gr) return new gr(e.h, e.s, e.l, e.opacity);
  if (e instanceof is || (e = so(e)), !e) return new gr();
  if (e instanceof gr) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, o = e.b / 255, a = Math.min(t, n, o), s = Math.max(t, n, o), l = NaN, f = s - a, c = (s + a) / 2;
  return f ? (t === s ? l = (n - o) / f + (n < o) * 6 : n === s ? l = (o - t) / f + 2 : l = (t - n) / f + 4, f /= c < 0.5 ? s + a : 2 - s - a, l *= 60) : f = c > 0 && c < 1 ? 0 : l, new gr(l, f, c, e.opacity);
}
function o3(e, t, n, o) {
  return arguments.length === 1 ? B0(e) : new gr(e, t, n, o ?? 1);
}
function gr(e, t, n, o) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +o;
}
_d(gr, o3, F0(is, {
  brighter(e) {
    return e = e == null ? $u : Math.pow($u, e), new gr(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? Ya : Math.pow(Ya, e), new gr(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, o = n + (n < 0.5 ? n : 1 - n) * t, a = 2 * n - o;
    return new Sn(
      qf(e >= 240 ? e - 240 : e + 120, a, o),
      qf(e, a, o),
      qf(e < 120 ? e + 240 : e - 120, a, o),
      this.opacity
    );
  },
  clamp() {
    return new gr(vg(this.h), fu(this.s), fu(this.l), ku(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = ku(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${vg(this.h)}, ${fu(this.s) * 100}%, ${fu(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function vg(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function fu(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function qf(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const yd = (e) => () => e;
function a3(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function s3(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(o) {
    return Math.pow(e + o * t, n);
  };
}
function u3(e) {
  return (e = +e) == 1 ? H0 : function(t, n) {
    return n - t ? s3(t, n, e) : yd(isNaN(t) ? n : t);
  };
}
function H0(e, t) {
  var n = t - e;
  return n ? a3(e, n) : yd(isNaN(e) ? t : e);
}
const Fu = function e(t) {
  var n = u3(t);
  function o(a, s) {
    var l = n((a = xc(a)).r, (s = xc(s)).r), f = n(a.g, s.g), c = n(a.b, s.b), p = H0(a.opacity, s.opacity);
    return function(h) {
      return a.r = l(h), a.g = f(h), a.b = c(h), a.opacity = p(h), a + "";
    };
  }
  return o.gamma = e, o;
}(1);
function l3(e, t) {
  t || (t = []);
  var n = e ? Math.min(t.length, e.length) : 0, o = t.slice(), a;
  return function(s) {
    for (a = 0; a < n; ++a) o[a] = e[a] * (1 - s) + t[a] * s;
    return o;
  };
}
function f3(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function c3(e, t) {
  var n = t ? t.length : 0, o = e ? Math.min(n, e.length) : 0, a = new Array(o), s = new Array(n), l;
  for (l = 0; l < o; ++l) a[l] = Td(e[l], t[l]);
  for (; l < n; ++l) s[l] = t[l];
  return function(f) {
    for (l = 0; l < o; ++l) s[l] = a[l](f);
    return s;
  };
}
function d3(e, t) {
  var n = /* @__PURE__ */ new Date();
  return e = +e, t = +t, function(o) {
    return n.setTime(e * (1 - o) + t * o), n;
  };
}
function hr(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
function p3(e, t) {
  var n = {}, o = {}, a;
  (e === null || typeof e != "object") && (e = {}), (t === null || typeof t != "object") && (t = {});
  for (a in t)
    a in e ? n[a] = Td(e[a], t[a]) : o[a] = t[a];
  return function(s) {
    for (a in n) o[a] = n[a](s);
    return o;
  };
}
var Cc = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Jf = new RegExp(Cc.source, "g");
function h3(e) {
  return function() {
    return e;
  };
}
function v3(e) {
  return function(t) {
    return e(t) + "";
  };
}
function G0(e, t) {
  var n = Cc.lastIndex = Jf.lastIndex = 0, o, a, s, l = -1, f = [], c = [];
  for (e = e + "", t = t + ""; (o = Cc.exec(e)) && (a = Jf.exec(t)); )
    (s = a.index) > n && (s = t.slice(n, s), f[l] ? f[l] += s : f[++l] = s), (o = o[0]) === (a = a[0]) ? f[l] ? f[l] += a : f[++l] = a : (f[++l] = null, c.push({ i: l, x: hr(o, a) })), n = Jf.lastIndex;
  return n < t.length && (s = t.slice(n), f[l] ? f[l] += s : f[++l] = s), f.length < 2 ? c[0] ? v3(c[0].x) : h3(t) : (t = c.length, function(p) {
    for (var h = 0, v; h < t; ++h) f[(v = c[h]).i] = v.x(p);
    return f.join("");
  });
}
function Td(e, t) {
  var n = typeof t, o;
  return t == null || n === "boolean" ? yd(t) : (n === "number" ? hr : n === "string" ? (o = so(t)) ? (t = o, Fu) : G0 : t instanceof so ? Fu : t instanceof Date ? d3 : f3(t) ? l3 : Array.isArray(t) ? c3 : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? p3 : hr)(e, t);
}
function g3(e, t) {
  return e = +e, t = +t, function(n) {
    return Math.round(e * (1 - n) + t * n);
  };
}
var gg = 180 / Math.PI, Lc = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function z0(e, t, n, o, a, s) {
  var l, f, c;
  return (l = Math.sqrt(e * e + t * t)) && (e /= l, t /= l), (c = e * n + t * o) && (n -= e * c, o -= t * c), (f = Math.sqrt(n * n + o * o)) && (n /= f, o /= f, c /= f), e * o < t * n && (e = -e, t = -t, c = -c, l = -l), {
    translateX: a,
    translateY: s,
    rotate: Math.atan2(t, e) * gg,
    skewX: Math.atan(c) * gg,
    scaleX: l,
    scaleY: f
  };
}
var cu;
function m3(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? Lc : z0(t.a, t.b, t.c, t.d, t.e, t.f);
}
function E3(e) {
  return e == null || (cu || (cu = document.createElementNS("http://www.w3.org/2000/svg", "g")), cu.setAttribute("transform", e), !(e = cu.transform.baseVal.consolidate())) ? Lc : (e = e.matrix, z0(e.a, e.b, e.c, e.d, e.e, e.f));
}
function W0(e, t, n, o) {
  function a(p) {
    return p.length ? p.pop() + " " : "";
  }
  function s(p, h, v, E, b, R) {
    if (p !== v || h !== E) {
      var T = b.push("translate(", null, t, null, n);
      R.push({ i: T - 4, x: hr(p, v) }, { i: T - 2, x: hr(h, E) });
    } else (v || E) && b.push("translate(" + v + t + E + n);
  }
  function l(p, h, v, E) {
    p !== h ? (p - h > 180 ? h += 360 : h - p > 180 && (p += 360), E.push({ i: v.push(a(v) + "rotate(", null, o) - 2, x: hr(p, h) })) : h && v.push(a(v) + "rotate(" + h + o);
  }
  function f(p, h, v, E) {
    p !== h ? E.push({ i: v.push(a(v) + "skewX(", null, o) - 2, x: hr(p, h) }) : h && v.push(a(v) + "skewX(" + h + o);
  }
  function c(p, h, v, E, b, R) {
    if (p !== v || h !== E) {
      var T = b.push(a(b) + "scale(", null, ",", null, ")");
      R.push({ i: T - 4, x: hr(p, v) }, { i: T - 2, x: hr(h, E) });
    } else (v !== 1 || E !== 1) && b.push(a(b) + "scale(" + v + "," + E + ")");
  }
  return function(p, h) {
    var v = [], E = [];
    return p = e(p), h = e(h), s(p.translateX, p.translateY, h.translateX, h.translateY, v, E), l(p.rotate, h.rotate, v, E), f(p.skewX, h.skewX, v, E), c(p.scaleX, p.scaleY, h.scaleX, h.scaleY, v, E), p = h = null, function(b) {
      for (var R = -1, T = E.length, x; ++R < T; ) v[(x = E[R]).i] = x.x(b);
      return v.join("");
    };
  };
}
var _3 = W0(m3, "px, ", "px)", "deg)"), y3 = W0(E3, ", ", ")", ")"), T3 = 1e-12;
function mg(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function A3(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function b3(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const O3 = function e(t, n, o) {
  function a(s, l) {
    var f = s[0], c = s[1], p = s[2], h = l[0], v = l[1], E = l[2], b = h - f, R = v - c, T = b * b + R * R, x, I;
    if (T < T3)
      I = Math.log(E / p) / t, x = function(U) {
        return [
          f + U * b,
          c + U * R,
          p * Math.exp(t * U * I)
        ];
      };
    else {
      var F = Math.sqrt(T), P = (E * E - p * p + o * T) / (2 * p * n * F), g = (E * E - p * p - o * T) / (2 * E * n * F), H = Math.log(Math.sqrt(P * P + 1) - P), $ = Math.log(Math.sqrt(g * g + 1) - g);
      I = ($ - H) / t, x = function(U) {
        var _ = U * I, A = mg(H), Z = p / (n * F) * (A * b3(t * _ + H) - A3(H));
        return [
          f + Z * b,
          c + Z * R,
          p * A / mg(t * _ + H)
        ];
      };
    }
    return x.duration = I * 1e3 * t / Math.SQRT2, x;
  }
  return a.rho = function(s) {
    var l = Math.max(1e-3, +s), f = l * l, c = f * f;
    return e(l, f, c);
  }, a;
}(Math.SQRT2, 2, 4);
var Ko = 0, xa = 0, Oa = 0, X0 = 1e3, Bu, Ca, Hu = 0, uo = 0, sl = 0, ja = typeof performance == "object" && performance.now ? performance : Date, Y0 = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Ad() {
  return uo || (Y0(N3), uo = ja.now() + sl);
}
function N3() {
  uo = 0;
}
function Gu() {
  this._call = this._time = this._next = null;
}
Gu.prototype = V0.prototype = {
  constructor: Gu,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? Ad() : +n) + (t == null ? 0 : +t), !this._next && Ca !== this && (Ca ? Ca._next = this : Bu = this, Ca = this), this._call = e, this._time = n, Mc();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Mc());
  }
};
function V0(e, t, n) {
  var o = new Gu();
  return o.restart(e, t, n), o;
}
function S3() {
  Ad(), ++Ko;
  for (var e = Bu, t; e; )
    (t = uo - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Ko;
}
function Eg() {
  uo = (Hu = ja.now()) + sl, Ko = xa = 0;
  try {
    S3();
  } finally {
    Ko = 0, R3(), uo = 0;
  }
}
function I3() {
  var e = ja.now(), t = e - Hu;
  t > X0 && (sl -= t, Hu = e);
}
function R3() {
  for (var e, t = Bu, n, o = 1 / 0; t; )
    t._call ? (o > t._time && (o = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Bu = n);
  Ca = e, Mc(o);
}
function Mc(e) {
  if (!Ko) {
    xa && (xa = clearTimeout(xa));
    var t = e - uo;
    t > 24 ? (e < 1 / 0 && (xa = setTimeout(Eg, e - ja.now() - sl)), Oa && (Oa = clearInterval(Oa))) : (Oa || (Hu = ja.now(), Oa = setInterval(I3, X0)), Ko = 1, Y0(Eg));
  }
}
function _g(e, t, n) {
  var o = new Gu();
  return t = t == null ? 0 : +t, o.restart((a) => {
    o.stop(), e(a + t);
  }, t, n), o;
}
var w3 = gd("start", "end", "cancel", "interrupt"), x3 = [], j0 = 0, yg = 1, Dc = 2, Au = 3, Tg = 4, Pc = 5, bu = 6;
function ul(e, t, n, o, a, s) {
  var l = e.__transition;
  if (!l) e.__transition = {};
  else if (n in l) return;
  C3(e, n, {
    name: t,
    index: o,
    // For context during callback.
    group: a,
    // For context during callback.
    on: w3,
    tween: x3,
    time: s.time,
    delay: s.delay,
    duration: s.duration,
    ease: s.ease,
    timer: null,
    state: j0
  });
}
function bd(e, t) {
  var n = Or(e, t);
  if (n.state > j0) throw new Error("too late; already scheduled");
  return n;
}
function Gr(e, t) {
  var n = Or(e, t);
  if (n.state > Au) throw new Error("too late; already running");
  return n;
}
function Or(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function C3(e, t, n) {
  var o = e.__transition, a;
  o[t] = n, n.timer = V0(s, 0, n.time);
  function s(p) {
    n.state = yg, n.timer.restart(l, n.delay, n.time), n.delay <= p && l(p - n.delay);
  }
  function l(p) {
    var h, v, E, b;
    if (n.state !== yg) return c();
    for (h in o)
      if (b = o[h], b.name === n.name) {
        if (b.state === Au) return _g(l);
        b.state === Tg ? (b.state = bu, b.timer.stop(), b.on.call("interrupt", e, e.__data__, b.index, b.group), delete o[h]) : +h < t && (b.state = bu, b.timer.stop(), b.on.call("cancel", e, e.__data__, b.index, b.group), delete o[h]);
      }
    if (_g(function() {
      n.state === Au && (n.state = Tg, n.timer.restart(f, n.delay, n.time), f(p));
    }), n.state = Dc, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Dc) {
      for (n.state = Au, a = new Array(E = n.tween.length), h = 0, v = -1; h < E; ++h)
        (b = n.tween[h].value.call(e, e.__data__, n.index, n.group)) && (a[++v] = b);
      a.length = v + 1;
    }
  }
  function f(p) {
    for (var h = p < n.duration ? n.ease.call(null, p / n.duration) : (n.timer.restart(c), n.state = Pc, 1), v = -1, E = a.length; ++v < E; )
      a[v].call(e, h);
    n.state === Pc && (n.on.call("end", e, e.__data__, n.index, n.group), c());
  }
  function c() {
    n.state = bu, n.timer.stop(), delete o[t];
    for (var p in o) return;
    delete e.__transition;
  }
}
function Ou(e, t) {
  var n = e.__transition, o, a, s = !0, l;
  if (n) {
    t = t == null ? null : t + "";
    for (l in n) {
      if ((o = n[l]).name !== t) {
        s = !1;
        continue;
      }
      a = o.state > Dc && o.state < Pc, o.state = bu, o.timer.stop(), o.on.call(a ? "interrupt" : "cancel", e, e.__data__, o.index, o.group), delete n[l];
    }
    s && delete e.__transition;
  }
}
function L3(e) {
  return this.each(function() {
    Ou(this, e);
  });
}
function M3(e, t) {
  var n, o;
  return function() {
    var a = Gr(this, e), s = a.tween;
    if (s !== n) {
      o = n = s;
      for (var l = 0, f = o.length; l < f; ++l)
        if (o[l].name === t) {
          o = o.slice(), o.splice(l, 1);
          break;
        }
    }
    a.tween = o;
  };
}
function D3(e, t, n) {
  var o, a;
  if (typeof n != "function") throw new Error();
  return function() {
    var s = Gr(this, e), l = s.tween;
    if (l !== o) {
      a = (o = l).slice();
      for (var f = { name: t, value: n }, c = 0, p = a.length; c < p; ++c)
        if (a[c].name === t) {
          a[c] = f;
          break;
        }
      c === p && a.push(f);
    }
    s.tween = a;
  };
}
function P3(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var o = Or(this.node(), n).tween, a = 0, s = o.length, l; a < s; ++a)
      if ((l = o[a]).name === e)
        return l.value;
    return null;
  }
  return this.each((t == null ? M3 : D3)(n, e, t));
}
function Od(e, t, n) {
  var o = e._id;
  return e.each(function() {
    var a = Gr(this, o);
    (a.value || (a.value = {}))[t] = n.apply(this, arguments);
  }), function(a) {
    return Or(a, o).value[t];
  };
}
function K0(e, t) {
  var n;
  return (typeof t == "number" ? hr : t instanceof so ? Fu : (n = so(t)) ? (t = n, Fu) : G0)(e, t);
}
function U3(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function $3(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function k3(e, t, n) {
  var o, a = n + "", s;
  return function() {
    var l = this.getAttribute(e);
    return l === a ? null : l === o ? s : s = t(o = l, n);
  };
}
function F3(e, t, n) {
  var o, a = n + "", s;
  return function() {
    var l = this.getAttributeNS(e.space, e.local);
    return l === a ? null : l === o ? s : s = t(o = l, n);
  };
}
function B3(e, t, n) {
  var o, a, s;
  return function() {
    var l, f = n(this), c;
    return f == null ? void this.removeAttribute(e) : (l = this.getAttribute(e), c = f + "", l === c ? null : l === o && c === a ? s : (a = c, s = t(o = l, f)));
  };
}
function H3(e, t, n) {
  var o, a, s;
  return function() {
    var l, f = n(this), c;
    return f == null ? void this.removeAttributeNS(e.space, e.local) : (l = this.getAttributeNS(e.space, e.local), c = f + "", l === c ? null : l === o && c === a ? s : (a = c, s = t(o = l, f)));
  };
}
function G3(e, t) {
  var n = al(e), o = n === "transform" ? y3 : K0;
  return this.attrTween(e, typeof t == "function" ? (n.local ? H3 : B3)(n, o, Od(this, "attr." + e, t)) : t == null ? (n.local ? $3 : U3)(n) : (n.local ? F3 : k3)(n, o, t));
}
function z3(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function W3(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function X3(e, t) {
  var n, o;
  function a() {
    var s = t.apply(this, arguments);
    return s !== o && (n = (o = s) && W3(e, s)), n;
  }
  return a._value = t, a;
}
function Y3(e, t) {
  var n, o;
  function a() {
    var s = t.apply(this, arguments);
    return s !== o && (n = (o = s) && z3(e, s)), n;
  }
  return a._value = t, a;
}
function V3(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var o = al(e);
  return this.tween(n, (o.local ? X3 : Y3)(o, t));
}
function j3(e, t) {
  return function() {
    bd(this, e).delay = +t.apply(this, arguments);
  };
}
function K3(e, t) {
  return t = +t, function() {
    bd(this, e).delay = t;
  };
}
function q3(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? j3 : K3)(t, e)) : Or(this.node(), t).delay;
}
function J3(e, t) {
  return function() {
    Gr(this, e).duration = +t.apply(this, arguments);
  };
}
function Z3(e, t) {
  return t = +t, function() {
    Gr(this, e).duration = t;
  };
}
function Q3(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? J3 : Z3)(t, e)) : Or(this.node(), t).duration;
}
function eU(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Gr(this, e).ease = t;
  };
}
function tU(e) {
  var t = this._id;
  return arguments.length ? this.each(eU(t, e)) : Or(this.node(), t).ease;
}
function nU(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Gr(this, e).ease = n;
  };
}
function rU(e) {
  if (typeof e != "function") throw new Error();
  return this.each(nU(this._id, e));
}
function iU(e) {
  typeof e != "function" && (e = w0(e));
  for (var t = this._groups, n = t.length, o = new Array(n), a = 0; a < n; ++a)
    for (var s = t[a], l = s.length, f = o[a] = [], c, p = 0; p < l; ++p)
      (c = s[p]) && e.call(c, c.__data__, p, s) && f.push(c);
  return new fi(o, this._parents, this._name, this._id);
}
function oU(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, o = t.length, a = n.length, s = Math.min(o, a), l = new Array(o), f = 0; f < s; ++f)
    for (var c = t[f], p = n[f], h = c.length, v = l[f] = new Array(h), E, b = 0; b < h; ++b)
      (E = c[b] || p[b]) && (v[b] = E);
  for (; f < o; ++f)
    l[f] = t[f];
  return new fi(l, this._parents, this._name, this._id);
}
function aU(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function sU(e, t, n) {
  var o, a, s = aU(t) ? bd : Gr;
  return function() {
    var l = s(this, e), f = l.on;
    f !== o && (a = (o = f).copy()).on(t, n), l.on = a;
  };
}
function uU(e, t) {
  var n = this._id;
  return arguments.length < 2 ? Or(this.node(), n).on.on(e) : this.each(sU(n, e, t));
}
function lU(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function fU() {
  return this.on("end.remove", lU(this._id));
}
function cU(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = md(e));
  for (var o = this._groups, a = o.length, s = new Array(a), l = 0; l < a; ++l)
    for (var f = o[l], c = f.length, p = s[l] = new Array(c), h, v, E = 0; E < c; ++E)
      (h = f[E]) && (v = e.call(h, h.__data__, E, f)) && ("__data__" in h && (v.__data__ = h.__data__), p[E] = v, ul(p[E], t, n, E, p, Or(h, n)));
  return new fi(s, this._parents, t, n);
}
function dU(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = R0(e));
  for (var o = this._groups, a = o.length, s = [], l = [], f = 0; f < a; ++f)
    for (var c = o[f], p = c.length, h, v = 0; v < p; ++v)
      if (h = c[v]) {
        for (var E = e.call(h, h.__data__, v, c), b, R = Or(h, n), T = 0, x = E.length; T < x; ++T)
          (b = E[T]) && ul(b, t, n, T, E, R);
        s.push(E), l.push(h);
      }
  return new fi(s, l, t, n);
}
var pU = rs.prototype.constructor;
function hU() {
  return new pU(this._groups, this._parents);
}
function vU(e, t) {
  var n, o, a;
  return function() {
    var s = jo(this, e), l = (this.style.removeProperty(e), jo(this, e));
    return s === l ? null : s === n && l === o ? a : a = t(n = s, o = l);
  };
}
function q0(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function gU(e, t, n) {
  var o, a = n + "", s;
  return function() {
    var l = jo(this, e);
    return l === a ? null : l === o ? s : s = t(o = l, n);
  };
}
function mU(e, t, n) {
  var o, a, s;
  return function() {
    var l = jo(this, e), f = n(this), c = f + "";
    return f == null && (c = f = (this.style.removeProperty(e), jo(this, e))), l === c ? null : l === o && c === a ? s : (a = c, s = t(o = l, f));
  };
}
function EU(e, t) {
  var n, o, a, s = "style." + t, l = "end." + s, f;
  return function() {
    var c = Gr(this, e), p = c.on, h = c.value[s] == null ? f || (f = q0(t)) : void 0;
    (p !== n || a !== h) && (o = (n = p).copy()).on(l, a = h), c.on = o;
  };
}
function _U(e, t, n) {
  var o = (e += "") == "transform" ? _3 : K0;
  return t == null ? this.styleTween(e, vU(e, o)).on("end.style." + e, q0(e)) : typeof t == "function" ? this.styleTween(e, mU(e, o, Od(this, "style." + e, t))).each(EU(this._id, e)) : this.styleTween(e, gU(e, o, t), n).on("end.style." + e, null);
}
function yU(e, t, n) {
  return function(o) {
    this.style.setProperty(e, t.call(this, o), n);
  };
}
function TU(e, t, n) {
  var o, a;
  function s() {
    var l = t.apply(this, arguments);
    return l !== a && (o = (a = l) && yU(e, l, n)), o;
  }
  return s._value = t, s;
}
function AU(e, t, n) {
  var o = "style." + (e += "");
  if (arguments.length < 2) return (o = this.tween(o)) && o._value;
  if (t == null) return this.tween(o, null);
  if (typeof t != "function") throw new Error();
  return this.tween(o, TU(e, t, n ?? ""));
}
function bU(e) {
  return function() {
    this.textContent = e;
  };
}
function OU(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function NU(e) {
  return this.tween("text", typeof e == "function" ? OU(Od(this, "text", e)) : bU(e == null ? "" : e + ""));
}
function SU(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function IU(e) {
  var t, n;
  function o() {
    var a = e.apply(this, arguments);
    return a !== n && (t = (n = a) && SU(a)), t;
  }
  return o._value = e, o;
}
function RU(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, IU(e));
}
function wU() {
  for (var e = this._name, t = this._id, n = J0(), o = this._groups, a = o.length, s = 0; s < a; ++s)
    for (var l = o[s], f = l.length, c, p = 0; p < f; ++p)
      if (c = l[p]) {
        var h = Or(c, t);
        ul(c, e, n, p, l, {
          time: h.time + h.delay + h.duration,
          delay: 0,
          duration: h.duration,
          ease: h.ease
        });
      }
  return new fi(o, this._parents, e, n);
}
function xU() {
  var e, t, n = this, o = n._id, a = n.size();
  return new Promise(function(s, l) {
    var f = { value: l }, c = { value: function() {
      --a === 0 && s();
    } };
    n.each(function() {
      var p = Gr(this, o), h = p.on;
      h !== e && (t = (e = h).copy(), t._.cancel.push(f), t._.interrupt.push(f), t._.end.push(c)), p.on = t;
    }), a === 0 && s();
  });
}
var CU = 0;
function fi(e, t, n, o) {
  this._groups = e, this._parents = t, this._name = n, this._id = o;
}
function J0() {
  return ++CU;
}
var ri = rs.prototype;
fi.prototype = {
  constructor: fi,
  select: cU,
  selectAll: dU,
  selectChild: ri.selectChild,
  selectChildren: ri.selectChildren,
  filter: iU,
  merge: oU,
  selection: hU,
  transition: wU,
  call: ri.call,
  nodes: ri.nodes,
  node: ri.node,
  size: ri.size,
  empty: ri.empty,
  each: ri.each,
  on: uU,
  attr: G3,
  attrTween: V3,
  style: _U,
  styleTween: AU,
  text: NU,
  textTween: RU,
  remove: fU,
  tween: P3,
  delay: q3,
  duration: Q3,
  ease: tU,
  easeVarying: rU,
  end: xU,
  [Symbol.iterator]: ri[Symbol.iterator]
};
function LU(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var MU = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: LU
};
function DU(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function PU(e) {
  var t, n;
  e instanceof fi ? (t = e._id, e = e._name) : (t = J0(), (n = MU).time = Ad(), e = e == null ? null : e + "");
  for (var o = this._groups, a = o.length, s = 0; s < a; ++s)
    for (var l = o[s], f = l.length, c, p = 0; p < f; ++p)
      (c = l[p]) && ul(c, e, t, p, l, n || DU(c, t));
  return new fi(o, this._parents, e, t);
}
rs.prototype.interrupt = L3;
rs.prototype.transition = PU;
const Uc = Math.PI, $c = 2 * Uc, ji = 1e-6, UU = $c - ji;
function Z0(e) {
  this._ += e[0];
  for (let t = 1, n = e.length; t < n; ++t)
    this._ += arguments[t] + e[t];
}
function $U(e) {
  let t = Math.floor(e);
  if (!(t >= 0)) throw new Error(`invalid digits: ${e}`);
  if (t > 15) return Z0;
  const n = 10 ** t;
  return function(o) {
    this._ += o[0];
    for (let a = 1, s = o.length; a < s; ++a)
      this._ += Math.round(arguments[a] * n) / n + o[a];
  };
}
class Q0 {
  constructor(t) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null, this._ = "", this._append = t == null ? Z0 : $U(t);
  }
  moveTo(t, n) {
    this._append`M${this._x0 = this._x1 = +t},${this._y0 = this._y1 = +n}`;
  }
  closePath() {
    this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
  }
  lineTo(t, n) {
    this._append`L${this._x1 = +t},${this._y1 = +n}`;
  }
  quadraticCurveTo(t, n, o, a) {
    this._append`Q${+t},${+n},${this._x1 = +o},${this._y1 = +a}`;
  }
  bezierCurveTo(t, n, o, a, s, l) {
    this._append`C${+t},${+n},${+o},${+a},${this._x1 = +s},${this._y1 = +l}`;
  }
  arcTo(t, n, o, a, s) {
    if (t = +t, n = +n, o = +o, a = +a, s = +s, s < 0) throw new Error(`negative radius: ${s}`);
    let l = this._x1, f = this._y1, c = o - t, p = a - n, h = l - t, v = f - n, E = h * h + v * v;
    if (this._x1 === null)
      this._append`M${this._x1 = t},${this._y1 = n}`;
    else if (E > ji) if (!(Math.abs(v * c - p * h) > ji) || !s)
      this._append`L${this._x1 = t},${this._y1 = n}`;
    else {
      let b = o - l, R = a - f, T = c * c + p * p, x = b * b + R * R, I = Math.sqrt(T), F = Math.sqrt(E), P = s * Math.tan((Uc - Math.acos((T + E - x) / (2 * I * F))) / 2), g = P / F, H = P / I;
      Math.abs(g - 1) > ji && this._append`L${t + g * h},${n + g * v}`, this._append`A${s},${s},0,0,${+(v * b > h * R)},${this._x1 = t + H * c},${this._y1 = n + H * p}`;
    }
  }
  arc(t, n, o, a, s, l) {
    if (t = +t, n = +n, o = +o, l = !!l, o < 0) throw new Error(`negative radius: ${o}`);
    let f = o * Math.cos(a), c = o * Math.sin(a), p = t + f, h = n + c, v = 1 ^ l, E = l ? a - s : s - a;
    this._x1 === null ? this._append`M${p},${h}` : (Math.abs(this._x1 - p) > ji || Math.abs(this._y1 - h) > ji) && this._append`L${p},${h}`, o && (E < 0 && (E = E % $c + $c), E > UU ? this._append`A${o},${o},0,1,${v},${t - f},${n - c}A${o},${o},0,1,${v},${this._x1 = p},${this._y1 = h}` : E > ji && this._append`A${o},${o},0,${+(E >= Uc)},${v},${this._x1 = t + o * Math.cos(s)},${this._y1 = n + o * Math.sin(s)}`);
  }
  rect(t, n, o, a) {
    this._append`M${this._x0 = this._x1 = +t},${this._y0 = this._y1 = +n}h${o = +o}v${+a}h${-o}Z`;
  }
  toString() {
    return this._;
  }
}
function eE() {
  return new Q0();
}
eE.prototype = Q0.prototype;
function kU(e) {
  return Math.abs(e = Math.round(e)) >= 1e21 ? e.toLocaleString("en").replace(/,/g, "") : e.toString(10);
}
function zu(e, t) {
  if ((n = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf("e")) < 0) return null;
  var n, o = e.slice(0, n);
  return [
    o.length > 1 ? o[0] + o.slice(2) : o,
    +e.slice(n + 1)
  ];
}
function qo(e) {
  return e = zu(Math.abs(e)), e ? e[1] : NaN;
}
function FU(e, t) {
  return function(n, o) {
    for (var a = n.length, s = [], l = 0, f = e[0], c = 0; a > 0 && f > 0 && (c + f + 1 > o && (f = Math.max(1, o - c)), s.push(n.substring(a -= f, a + f)), !((c += f + 1) > o)); )
      f = e[l = (l + 1) % e.length];
    return s.reverse().join(t);
  };
}
function BU(e) {
  return function(t) {
    return t.replace(/[0-9]/g, function(n) {
      return e[+n];
    });
  };
}
var HU = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function Wu(e) {
  if (!(t = HU.exec(e))) throw new Error("invalid format: " + e);
  var t;
  return new Nd({
    fill: t[1],
    align: t[2],
    sign: t[3],
    symbol: t[4],
    zero: t[5],
    width: t[6],
    comma: t[7],
    precision: t[8] && t[8].slice(1),
    trim: t[9],
    type: t[10]
  });
}
Wu.prototype = Nd.prototype;
function Nd(e) {
  this.fill = e.fill === void 0 ? " " : e.fill + "", this.align = e.align === void 0 ? ">" : e.align + "", this.sign = e.sign === void 0 ? "-" : e.sign + "", this.symbol = e.symbol === void 0 ? "" : e.symbol + "", this.zero = !!e.zero, this.width = e.width === void 0 ? void 0 : +e.width, this.comma = !!e.comma, this.precision = e.precision === void 0 ? void 0 : +e.precision, this.trim = !!e.trim, this.type = e.type === void 0 ? "" : e.type + "";
}
Nd.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function GU(e) {
  e: for (var t = e.length, n = 1, o = -1, a; n < t; ++n)
    switch (e[n]) {
      case ".":
        o = a = n;
        break;
      case "0":
        o === 0 && (o = n), a = n;
        break;
      default:
        if (!+e[n]) break e;
        o > 0 && (o = 0);
        break;
    }
  return o > 0 ? e.slice(0, o) + e.slice(a + 1) : e;
}
var tE;
function zU(e, t) {
  var n = zu(e, t);
  if (!n) return e + "";
  var o = n[0], a = n[1], s = a - (tE = Math.max(-8, Math.min(8, Math.floor(a / 3))) * 3) + 1, l = o.length;
  return s === l ? o : s > l ? o + new Array(s - l + 1).join("0") : s > 0 ? o.slice(0, s) + "." + o.slice(s) : "0." + new Array(1 - s).join("0") + zu(e, Math.max(0, t + s - 1))[0];
}
function Ag(e, t) {
  var n = zu(e, t);
  if (!n) return e + "";
  var o = n[0], a = n[1];
  return a < 0 ? "0." + new Array(-a).join("0") + o : o.length > a + 1 ? o.slice(0, a + 1) + "." + o.slice(a + 1) : o + new Array(a - o.length + 2).join("0");
}
const bg = {
  "%": (e, t) => (e * 100).toFixed(t),
  b: (e) => Math.round(e).toString(2),
  c: (e) => e + "",
  d: kU,
  e: (e, t) => e.toExponential(t),
  f: (e, t) => e.toFixed(t),
  g: (e, t) => e.toPrecision(t),
  o: (e) => Math.round(e).toString(8),
  p: (e, t) => Ag(e * 100, t),
  r: Ag,
  s: zU,
  X: (e) => Math.round(e).toString(16).toUpperCase(),
  x: (e) => Math.round(e).toString(16)
};
function Og(e) {
  return e;
}
var Ng = Array.prototype.map, Sg = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function WU(e) {
  var t = e.grouping === void 0 || e.thousands === void 0 ? Og : FU(Ng.call(e.grouping, Number), e.thousands + ""), n = e.currency === void 0 ? "" : e.currency[0] + "", o = e.currency === void 0 ? "" : e.currency[1] + "", a = e.decimal === void 0 ? "." : e.decimal + "", s = e.numerals === void 0 ? Og : BU(Ng.call(e.numerals, String)), l = e.percent === void 0 ? "%" : e.percent + "", f = e.minus === void 0 ? "−" : e.minus + "", c = e.nan === void 0 ? "NaN" : e.nan + "";
  function p(v) {
    v = Wu(v);
    var E = v.fill, b = v.align, R = v.sign, T = v.symbol, x = v.zero, I = v.width, F = v.comma, P = v.precision, g = v.trim, H = v.type;
    H === "n" ? (F = !0, H = "g") : bg[H] || (P === void 0 && (P = 12), g = !0, H = "g"), (x || E === "0" && b === "=") && (x = !0, E = "0", b = "=");
    var $ = T === "$" ? n : T === "#" && /[boxX]/.test(H) ? "0" + H.toLowerCase() : "", U = T === "$" ? o : /[%p]/.test(H) ? l : "", _ = bg[H], A = /[defgprs%]/.test(H);
    P = P === void 0 ? 6 : /[gprs]/.test(H) ? Math.max(1, Math.min(21, P)) : Math.max(0, Math.min(20, P));
    function Z(G) {
      var _e = $, ye = U, z, fe, j;
      if (H === "c")
        ye = _(G) + ye, G = "";
      else {
        G = +G;
        var se = G < 0 || 1 / G < 0;
        if (G = isNaN(G) ? c : _(Math.abs(G), P), g && (G = GU(G)), se && +G == 0 && R !== "+" && (se = !1), _e = (se ? R === "(" ? R : f : R === "-" || R === "(" ? "" : R) + _e, ye = (H === "s" ? Sg[8 + tE / 3] : "") + ye + (se && R === "(" ? ")" : ""), A) {
          for (z = -1, fe = G.length; ++z < fe; )
            if (j = G.charCodeAt(z), 48 > j || j > 57) {
              ye = (j === 46 ? a + G.slice(z + 1) : G.slice(z)) + ye, G = G.slice(0, z);
              break;
            }
        }
      }
      F && !x && (G = t(G, 1 / 0));
      var ue = _e.length + G.length + ye.length, Te = ue < I ? new Array(I - ue + 1).join(E) : "";
      switch (F && x && (G = t(Te + G, Te.length ? I - ye.length : 1 / 0), Te = ""), b) {
        case "<":
          G = _e + G + ye + Te;
          break;
        case "=":
          G = _e + Te + G + ye;
          break;
        case "^":
          G = Te.slice(0, ue = Te.length >> 1) + _e + G + ye + Te.slice(ue);
          break;
        default:
          G = Te + _e + G + ye;
          break;
      }
      return s(G);
    }
    return Z.toString = function() {
      return v + "";
    }, Z;
  }
  function h(v, E) {
    var b = p((v = Wu(v), v.type = "f", v)), R = Math.max(-8, Math.min(8, Math.floor(qo(E) / 3))) * 3, T = Math.pow(10, -R), x = Sg[8 + R / 3];
    return function(I) {
      return b(T * I) + x;
    };
  }
  return {
    format: p,
    formatPrefix: h
  };
}
var du, nE, rE;
XU({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function XU(e) {
  return du = WU(e), nE = du.format, rE = du.formatPrefix, du;
}
function YU(e) {
  return Math.max(0, -qo(Math.abs(e)));
}
function VU(e, t) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(qo(t) / 3))) * 3 - qo(Math.abs(e)));
}
function jU(e, t) {
  return e = Math.abs(e), t = Math.abs(t) - e, Math.max(0, qo(t) - qo(e)) + 1;
}
function KU(e, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(e);
      break;
    default:
      this.range(t).domain(e);
      break;
  }
  return this;
}
function qU(e) {
  return function() {
    return e;
  };
}
function JU(e) {
  return +e;
}
var Ig = [0, 1];
function Mo(e) {
  return e;
}
function kc(e, t) {
  return (t -= e = +e) ? function(n) {
    return (n - e) / t;
  } : qU(isNaN(t) ? NaN : 0.5);
}
function ZU(e, t) {
  var n;
  return e > t && (n = e, e = t, t = n), function(o) {
    return Math.max(e, Math.min(t, o));
  };
}
function QU(e, t, n) {
  var o = e[0], a = e[1], s = t[0], l = t[1];
  return a < o ? (o = kc(a, o), s = n(l, s)) : (o = kc(o, a), s = n(s, l)), function(f) {
    return s(o(f));
  };
}
function e$(e, t, n) {
  var o = Math.min(e.length, t.length) - 1, a = new Array(o), s = new Array(o), l = -1;
  for (e[o] < e[0] && (e = e.slice().reverse(), t = t.slice().reverse()); ++l < o; )
    a[l] = kc(e[l], e[l + 1]), s[l] = n(t[l], t[l + 1]);
  return function(f) {
    var c = iD(e, f, 1, o) - 1;
    return s[c](a[c](f));
  };
}
function t$(e, t) {
  return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());
}
function n$() {
  var e = Ig, t = Ig, n = Td, o, a, s, l = Mo, f, c, p;
  function h() {
    var E = Math.min(e.length, t.length);
    return l !== Mo && (l = ZU(e[0], e[E - 1])), f = E > 2 ? e$ : QU, c = p = null, v;
  }
  function v(E) {
    return E == null || isNaN(E = +E) ? s : (c || (c = f(e.map(o), t, n)))(o(l(E)));
  }
  return v.invert = function(E) {
    return l(a((p || (p = f(t, e.map(o), hr)))(E)));
  }, v.domain = function(E) {
    return arguments.length ? (e = Array.from(E, JU), h()) : e.slice();
  }, v.range = function(E) {
    return arguments.length ? (t = Array.from(E), h()) : t.slice();
  }, v.rangeRound = function(E) {
    return t = Array.from(E), n = g3, h();
  }, v.clamp = function(E) {
    return arguments.length ? (l = E ? !0 : Mo, h()) : l !== Mo;
  }, v.interpolate = function(E) {
    return arguments.length ? (n = E, h()) : n;
  }, v.unknown = function(E) {
    return arguments.length ? (s = E, v) : s;
  }, function(E, b) {
    return o = E, a = b, h();
  };
}
function r$() {
  return n$()(Mo, Mo);
}
function i$(e, t, n, o) {
  var a = lD(e, t, n), s;
  switch (o = Wu(o ?? ",f"), o.type) {
    case "s": {
      var l = Math.max(Math.abs(e), Math.abs(t));
      return o.precision == null && !isNaN(s = VU(a, l)) && (o.precision = s), rE(o, l);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      o.precision == null && !isNaN(s = jU(a, Math.max(Math.abs(e), Math.abs(t)))) && (o.precision = s - (o.type === "e"));
      break;
    }
    case "f":
    case "%": {
      o.precision == null && !isNaN(s = YU(a)) && (o.precision = s - (o.type === "%") * 2);
      break;
    }
  }
  return nE(o);
}
function o$(e) {
  var t = e.domain;
  return e.ticks = function(n) {
    var o = t();
    return uD(o[0], o[o.length - 1], n ?? 10);
  }, e.tickFormat = function(n, o) {
    var a = t();
    return i$(a[0], a[a.length - 1], n ?? 10, o);
  }, e.nice = function(n) {
    n == null && (n = 10);
    var o = t(), a = 0, s = o.length - 1, l = o[a], f = o[s], c, p, h = 10;
    for (f < l && (p = l, l = f, f = p, p = a, a = s, s = p); h-- > 0; ) {
      if (p = Sc(l, f, n), p === c)
        return o[a] = l, o[s] = f, t(o);
      if (p > 0)
        l = Math.floor(l / p) * p, f = Math.ceil(f / p) * p;
      else if (p < 0)
        l = Math.ceil(l * p) / p, f = Math.floor(f * p) / p;
      else
        break;
      c = p;
    }
    return e;
  }, e;
}
function iE() {
  var e = r$();
  return e.copy = function() {
    return t$(e, iE());
  }, KU.apply(e, arguments), o$(e);
}
const pu = (e) => () => e;
function a$(e, {
  sourceEvent: t,
  target: n,
  transform: o,
  dispatch: a
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: o, enumerable: !0, configurable: !0 },
    _: { value: a }
  });
}
function ai(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
ai.prototype = {
  constructor: ai,
  scale: function(e) {
    return e === 1 ? this : new ai(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new ai(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var Fa = new ai(1, 0, 0);
ai.prototype;
function Zf(e) {
  e.stopImmediatePropagation();
}
function Na(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function s$(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function u$() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function Rg() {
  return this.__zoom || Fa;
}
function l$(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function f$() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function c$(e, t, n) {
  var o = e.invertX(t[0][0]) - n[0][0], a = e.invertX(t[1][0]) - n[1][0], s = e.invertY(t[0][1]) - n[0][1], l = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    a > o ? (o + a) / 2 : Math.min(0, o) || Math.max(0, a),
    l > s ? (s + l) / 2 : Math.min(0, s) || Math.max(0, l)
  );
}
function d$() {
  var e = s$, t = u$, n = c$, o = l$, a = f$, s = [0, 1 / 0], l = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], f = 250, c = O3, p = gd("start", "zoom", "end"), h, v, E, b = 500, R = 150, T = 0, x = 10;
  function I(z) {
    z.property("__zoom", Rg).on("wheel.zoom", _, { passive: !1 }).on("mousedown.zoom", A).on("dblclick.zoom", Z).filter(a).on("touchstart.zoom", G).on("touchmove.zoom", _e).on("touchend.zoom touchcancel.zoom", ye).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  I.transform = function(z, fe, j, se) {
    var ue = z.selection ? z.selection() : z;
    ue.property("__zoom", Rg), z !== ue ? H(z, fe, j, se) : ue.interrupt().each(function() {
      $(this, arguments).event(se).start().zoom(null, typeof fe == "function" ? fe.apply(this, arguments) : fe).end();
    });
  }, I.scaleBy = function(z, fe, j, se) {
    I.scaleTo(z, function() {
      var ue = this.__zoom.k, Te = typeof fe == "function" ? fe.apply(this, arguments) : fe;
      return ue * Te;
    }, j, se);
  }, I.scaleTo = function(z, fe, j, se) {
    I.transform(z, function() {
      var ue = t.apply(this, arguments), Te = this.__zoom, Ie = j == null ? g(ue) : typeof j == "function" ? j.apply(this, arguments) : j, Me = Te.invert(Ie), he = typeof fe == "function" ? fe.apply(this, arguments) : fe;
      return n(P(F(Te, he), Ie, Me), ue, l);
    }, j, se);
  }, I.translateBy = function(z, fe, j, se) {
    I.transform(z, function() {
      return n(this.__zoom.translate(
        typeof fe == "function" ? fe.apply(this, arguments) : fe,
        typeof j == "function" ? j.apply(this, arguments) : j
      ), t.apply(this, arguments), l);
    }, null, se);
  }, I.translateTo = function(z, fe, j, se, ue) {
    I.transform(z, function() {
      var Te = t.apply(this, arguments), Ie = this.__zoom, Me = se == null ? g(Te) : typeof se == "function" ? se.apply(this, arguments) : se;
      return n(Fa.translate(Me[0], Me[1]).scale(Ie.k).translate(
        typeof fe == "function" ? -fe.apply(this, arguments) : -fe,
        typeof j == "function" ? -j.apply(this, arguments) : -j
      ), Te, l);
    }, se, ue);
  };
  function F(z, fe) {
    return fe = Math.max(s[0], Math.min(s[1], fe)), fe === z.k ? z : new ai(fe, z.x, z.y);
  }
  function P(z, fe, j) {
    var se = fe[0] - j[0] * z.k, ue = fe[1] - j[1] * z.k;
    return se === z.x && ue === z.y ? z : new ai(z.k, se, ue);
  }
  function g(z) {
    return [(+z[0][0] + +z[1][0]) / 2, (+z[0][1] + +z[1][1]) / 2];
  }
  function H(z, fe, j, se) {
    z.on("start.zoom", function() {
      $(this, arguments).event(se).start();
    }).on("interrupt.zoom end.zoom", function() {
      $(this, arguments).event(se).end();
    }).tween("zoom", function() {
      var ue = this, Te = arguments, Ie = $(ue, Te).event(se), Me = t.apply(ue, Te), he = j == null ? g(Me) : typeof j == "function" ? j.apply(ue, Te) : j, Ee = Math.max(Me[1][0] - Me[0][0], Me[1][1] - Me[0][1]), le = ue.__zoom, de = typeof fe == "function" ? fe.apply(ue, Te) : fe, V = c(le.invert(he).concat(Ee / le.k), de.invert(he).concat(Ee / de.k));
      return function(O) {
        if (O === 1) O = de;
        else {
          var W = V(O), J = Ee / W[2];
          O = new ai(J, he[0] - W[0] * J, he[1] - W[1] * J);
        }
        Ie.zoom(null, O);
      };
    });
  }
  function $(z, fe, j) {
    return !j && z.__zooming || new U(z, fe);
  }
  function U(z, fe) {
    this.that = z, this.args = fe, this.active = 0, this.sourceEvent = null, this.extent = t.apply(z, fe), this.taps = 0;
  }
  U.prototype = {
    event: function(z) {
      return z && (this.sourceEvent = z), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(z, fe) {
      return this.mouse && z !== "mouse" && (this.mouse[1] = fe.invert(this.mouse[0])), this.touch0 && z !== "touch" && (this.touch0[1] = fe.invert(this.touch0[0])), this.touch1 && z !== "touch" && (this.touch1[1] = fe.invert(this.touch1[0])), this.that.__zoom = fe, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(z) {
      var fe = Lr(this.that).datum();
      p.call(
        z,
        this.that,
        new a$(z, {
          sourceEvent: this.sourceEvent,
          target: I,
          transform: this.that.__zoom,
          dispatch: p
        }),
        fe
      );
    }
  };
  function _(z, ...fe) {
    if (!e.apply(this, arguments)) return;
    var j = $(this, fe).event(z), se = this.__zoom, ue = Math.max(s[0], Math.min(s[1], se.k * Math.pow(2, o.apply(this, arguments)))), Te = Xi(z);
    if (j.wheel)
      (j.mouse[0][0] !== Te[0] || j.mouse[0][1] !== Te[1]) && (j.mouse[1] = se.invert(j.mouse[0] = Te)), clearTimeout(j.wheel);
    else {
      if (se.k === ue) return;
      j.mouse = [Te, se.invert(Te)], Ou(this), j.start();
    }
    Na(z), j.wheel = setTimeout(Ie, R), j.zoom("mouse", n(P(F(se, ue), j.mouse[0], j.mouse[1]), j.extent, l));
    function Ie() {
      j.wheel = null, j.end();
    }
  }
  function A(z, ...fe) {
    if (E || !e.apply(this, arguments)) return;
    var j = z.currentTarget, se = $(this, fe, !0).event(z), ue = Lr(z.view).on("mousemove.zoom", he, !0).on("mouseup.zoom", Ee, !0), Te = Xi(z, j), Ie = z.clientX, Me = z.clientY;
    YP(z.view), Zf(z), se.mouse = [Te, this.__zoom.invert(Te)], Ou(this), se.start();
    function he(le) {
      if (Na(le), !se.moved) {
        var de = le.clientX - Ie, V = le.clientY - Me;
        se.moved = de * de + V * V > T;
      }
      se.event(le).zoom("mouse", n(P(se.that.__zoom, se.mouse[0] = Xi(le, j), se.mouse[1]), se.extent, l));
    }
    function Ee(le) {
      ue.on("mousemove.zoom mouseup.zoom", null), VP(le.view, se.moved), Na(le), se.event(le).end();
    }
  }
  function Z(z, ...fe) {
    if (e.apply(this, arguments)) {
      var j = this.__zoom, se = Xi(z.changedTouches ? z.changedTouches[0] : z, this), ue = j.invert(se), Te = j.k * (z.shiftKey ? 0.5 : 2), Ie = n(P(F(j, Te), se, ue), t.apply(this, fe), l);
      Na(z), f > 0 ? Lr(this).transition().duration(f).call(H, Ie, se, z) : Lr(this).call(I.transform, Ie, se, z);
    }
  }
  function G(z, ...fe) {
    if (e.apply(this, arguments)) {
      var j = z.touches, se = j.length, ue = $(this, fe, z.changedTouches.length === se).event(z), Te, Ie, Me, he;
      for (Zf(z), Ie = 0; Ie < se; ++Ie)
        Me = j[Ie], he = Xi(Me, this), he = [he, this.__zoom.invert(he), Me.identifier], ue.touch0 ? !ue.touch1 && ue.touch0[2] !== he[2] && (ue.touch1 = he, ue.taps = 0) : (ue.touch0 = he, Te = !0, ue.taps = 1 + !!h);
      h && (h = clearTimeout(h)), Te && (ue.taps < 2 && (v = he[0], h = setTimeout(function() {
        h = null;
      }, b)), Ou(this), ue.start());
    }
  }
  function _e(z, ...fe) {
    if (this.__zooming) {
      var j = $(this, fe).event(z), se = z.changedTouches, ue = se.length, Te, Ie, Me, he;
      for (Na(z), Te = 0; Te < ue; ++Te)
        Ie = se[Te], Me = Xi(Ie, this), j.touch0 && j.touch0[2] === Ie.identifier ? j.touch0[0] = Me : j.touch1 && j.touch1[2] === Ie.identifier && (j.touch1[0] = Me);
      if (Ie = j.that.__zoom, j.touch1) {
        var Ee = j.touch0[0], le = j.touch0[1], de = j.touch1[0], V = j.touch1[1], O = (O = de[0] - Ee[0]) * O + (O = de[1] - Ee[1]) * O, W = (W = V[0] - le[0]) * W + (W = V[1] - le[1]) * W;
        Ie = F(Ie, Math.sqrt(O / W)), Me = [(Ee[0] + de[0]) / 2, (Ee[1] + de[1]) / 2], he = [(le[0] + V[0]) / 2, (le[1] + V[1]) / 2];
      } else if (j.touch0) Me = j.touch0[0], he = j.touch0[1];
      else return;
      j.zoom("touch", n(P(Ie, Me, he), j.extent, l));
    }
  }
  function ye(z, ...fe) {
    if (this.__zooming) {
      var j = $(this, fe).event(z), se = z.changedTouches, ue = se.length, Te, Ie;
      for (Zf(z), E && clearTimeout(E), E = setTimeout(function() {
        E = null;
      }, b), Te = 0; Te < ue; ++Te)
        Ie = se[Te], j.touch0 && j.touch0[2] === Ie.identifier ? delete j.touch0 : j.touch1 && j.touch1[2] === Ie.identifier && delete j.touch1;
      if (j.touch1 && !j.touch0 && (j.touch0 = j.touch1, delete j.touch1), j.touch0) j.touch0[1] = this.__zoom.invert(j.touch0[0]);
      else if (j.end(), j.taps === 2 && (Ie = Xi(Ie, this), Math.hypot(v[0] - Ie[0], v[1] - Ie[1]) < x)) {
        var Me = Lr(this).on("dblclick.zoom");
        Me && Me.apply(this, arguments);
      }
    }
  }
  return I.wheelDelta = function(z) {
    return arguments.length ? (o = typeof z == "function" ? z : pu(+z), I) : o;
  }, I.filter = function(z) {
    return arguments.length ? (e = typeof z == "function" ? z : pu(!!z), I) : e;
  }, I.touchable = function(z) {
    return arguments.length ? (a = typeof z == "function" ? z : pu(!!z), I) : a;
  }, I.extent = function(z) {
    return arguments.length ? (t = typeof z == "function" ? z : pu([[+z[0][0], +z[0][1]], [+z[1][0], +z[1][1]]]), I) : t;
  }, I.scaleExtent = function(z) {
    return arguments.length ? (s[0] = +z[0], s[1] = +z[1], I) : [s[0], s[1]];
  }, I.translateExtent = function(z) {
    return arguments.length ? (l[0][0] = +z[0][0], l[1][0] = +z[1][0], l[0][1] = +z[0][1], l[1][1] = +z[1][1], I) : [[l[0][0], l[0][1]], [l[1][0], l[1][1]]];
  }, I.constrain = function(z) {
    return arguments.length ? (n = z, I) : n;
  }, I.duration = function(z) {
    return arguments.length ? (f = +z, I) : f;
  }, I.interpolate = function(z) {
    return arguments.length ? (c = z, I) : c;
  }, I.on = function() {
    var z = p.on.apply(p, arguments);
    return z === p ? I : z;
  }, I.clickDistance = function(z) {
    return arguments.length ? (T = (z = +z) * z, I) : Math.sqrt(T);
  }, I.tapDistance = function(z) {
    return arguments.length ? (x = +z, I) : x;
  }, I;
}
function p$(e) {
  var t = 0, n = e.children, o = n && n.length;
  if (!o) t = 1;
  else for (; --o >= 0; ) t += n[o].value;
  e.value = t;
}
function h$() {
  return this.eachAfter(p$);
}
function v$(e) {
  var t = this, n, o = [t], a, s, l;
  do
    for (n = o.reverse(), o = []; t = n.pop(); )
      if (e(t), a = t.children, a) for (s = 0, l = a.length; s < l; ++s)
        o.push(a[s]);
  while (o.length);
  return this;
}
function g$(e) {
  for (var t = this, n = [t], o, a; t = n.pop(); )
    if (e(t), o = t.children, o) for (a = o.length - 1; a >= 0; --a)
      n.push(o[a]);
  return this;
}
function m$(e) {
  for (var t = this, n = [t], o = [], a, s, l; t = n.pop(); )
    if (o.push(t), a = t.children, a) for (s = 0, l = a.length; s < l; ++s)
      n.push(a[s]);
  for (; t = o.pop(); )
    e(t);
  return this;
}
function E$(e) {
  return this.eachAfter(function(t) {
    for (var n = +e(t.data) || 0, o = t.children, a = o && o.length; --a >= 0; ) n += o[a].value;
    t.value = n;
  });
}
function _$(e) {
  return this.eachBefore(function(t) {
    t.children && t.children.sort(e);
  });
}
function y$(e) {
  for (var t = this, n = T$(t, e), o = [t]; t !== n; )
    t = t.parent, o.push(t);
  for (var a = o.length; e !== n; )
    o.splice(a, 0, e), e = e.parent;
  return o;
}
function T$(e, t) {
  if (e === t) return e;
  var n = e.ancestors(), o = t.ancestors(), a = null;
  for (e = n.pop(), t = o.pop(); e === t; )
    a = e, e = n.pop(), t = o.pop();
  return a;
}
function A$() {
  for (var e = this, t = [e]; e = e.parent; )
    t.push(e);
  return t;
}
function b$() {
  var e = [];
  return this.each(function(t) {
    e.push(t);
  }), e;
}
function O$() {
  var e = [];
  return this.eachBefore(function(t) {
    t.children || e.push(t);
  }), e;
}
function N$() {
  var e = this, t = [];
  return e.each(function(n) {
    n !== e && t.push({ source: n.parent, target: n });
  }), t;
}
function Sd(e, t) {
  var n = new Xu(e), o = +e.value && (n.value = e.value), a, s = [n], l, f, c, p;
  for (t == null && (t = I$); a = s.pop(); )
    if (o && (a.value = +a.data.value), (f = t(a.data)) && (p = f.length))
      for (a.children = new Array(p), c = p - 1; c >= 0; --c)
        s.push(l = a.children[c] = new Xu(f[c])), l.parent = a, l.depth = a.depth + 1;
  return n.eachBefore(w$);
}
function S$() {
  return Sd(this).eachBefore(R$);
}
function I$(e) {
  return e.children;
}
function R$(e) {
  e.data = e.data.data;
}
function w$(e) {
  var t = 0;
  do
    e.height = t;
  while ((e = e.parent) && e.height < ++t);
}
function Xu(e) {
  this.data = e, this.depth = this.height = 0, this.parent = null;
}
Xu.prototype = Sd.prototype = {
  constructor: Xu,
  count: h$,
  each: v$,
  eachAfter: m$,
  eachBefore: g$,
  sum: E$,
  sort: _$,
  path: y$,
  ancestors: A$,
  descendants: b$,
  leaves: O$,
  links: N$,
  copy: S$
};
const x$ = "2.1.2", C$ = {
  version: x$
}, { version: L$ } = C$, M$ = Object.freeze({
  children: (e) => e.children,
  nodeSize: (e) => e.data.size,
  spacing: 0
});
function aE(e) {
  const t = Object.assign({}, M$, e);
  function n(f) {
    const c = t[f];
    return typeof c == "function" ? c : () => c;
  }
  function o(f) {
    const c = l(s(), f, (p) => p.children);
    return c.update(), c.data;
  }
  function a() {
    const f = n("nodeSize"), c = n("spacing");
    return class oE extends Sd.prototype.constructor {
      constructor(h) {
        super(h);
      }
      copy() {
        const h = l(this.constructor, this, (v) => v.children);
        return h.each((v) => v.data = v.data.data), h;
      }
      get size() {
        return f(this);
      }
      spacing(h) {
        return c(this, h);
      }
      get nodes() {
        return this.descendants();
      }
      get xSize() {
        return this.size[0];
      }
      get ySize() {
        return this.size[1];
      }
      get top() {
        return this.y;
      }
      get bottom() {
        return this.y + this.ySize;
      }
      get left() {
        return this.x - this.xSize / 2;
      }
      get right() {
        return this.x + this.xSize / 2;
      }
      get root() {
        const h = this.ancestors();
        return h[h.length - 1];
      }
      get numChildren() {
        return this.hasChildren ? this.children.length : 0;
      }
      get hasChildren() {
        return !this.noChildren;
      }
      get noChildren() {
        return this.children === null;
      }
      get firstChild() {
        return this.hasChildren ? this.children[0] : null;
      }
      get lastChild() {
        return this.hasChildren ? this.children[this.numChildren - 1] : null;
      }
      get extents() {
        return (this.children || []).reduce(
          (h, v) => oE.maxExtents(h, v.extents),
          this.nodeExtents
        );
      }
      get nodeExtents() {
        return {
          top: this.top,
          bottom: this.bottom,
          left: this.left,
          right: this.right
        };
      }
      static maxExtents(h, v) {
        return {
          top: Math.min(h.top, v.top),
          bottom: Math.max(h.bottom, v.bottom),
          left: Math.min(h.left, v.left),
          right: Math.max(h.right, v.right)
        };
      }
    };
  }
  function s() {
    const f = a(), c = n("nodeSize"), p = n("spacing");
    return class extends f {
      constructor(h) {
        super(h), Object.assign(this, {
          x: 0,
          y: 0,
          relX: 0,
          prelim: 0,
          shift: 0,
          change: 0,
          lExt: this,
          lExtRelX: 0,
          lThr: null,
          rExt: this,
          rExtRelX: 0,
          rThr: null
        });
      }
      get size() {
        return c(this.data);
      }
      spacing(h) {
        return p(this.data, h.data);
      }
      get x() {
        return this.data.x;
      }
      set x(h) {
        this.data.x = h;
      }
      get y() {
        return this.data.y;
      }
      set y(h) {
        this.data.y = h;
      }
      update() {
        return sE(this), uE(this), this;
      }
    };
  }
  function l(f, c, p) {
    const h = (v, E) => {
      const b = new f(v);
      Object.assign(b, {
        parent: E,
        depth: E === null ? 0 : E.depth + 1,
        height: 0,
        length: 1
      });
      const R = p(v) || [];
      return b.children = R.length === 0 ? null : R.map((T) => h(T, b)), b.children && Object.assign(b, b.children.reduce(
        (T, x) => ({
          height: Math.max(T.height, x.height + 1),
          length: T.length + x.length
        }),
        b
      )), b;
    };
    return h(c, null);
  }
  return Object.assign(o, {
    nodeSize(f) {
      return arguments.length ? (t.nodeSize = f, o) : t.nodeSize;
    },
    spacing(f) {
      return arguments.length ? (t.spacing = f, o) : t.spacing;
    },
    children(f) {
      return arguments.length ? (t.children = f, o) : t.children;
    },
    hierarchy(f, c) {
      const p = typeof c > "u" ? t.children : c;
      return l(a(), f, p);
    },
    dump(f) {
      const c = n("nodeSize"), p = (h) => (v) => {
        const E = h + "  ", b = h + "    ", { x: R, y: T } = v, x = c(v), I = v.children || [], F = I.length === 0 ? " " : `,${E}children: [${b}${I.map(p(b)).join(b)}${E}],${h}`;
        return `{ size: [${x.join(", ")}],${E}x: ${R}, y: ${T}${F}},`;
      };
      return p(`
`)(f);
    }
  }), o;
}
aE.version = L$;
const sE = (e, t = 0) => (e.y = t, (e.children || []).reduce((n, o) => {
  const [a, s] = n;
  sE(o, e.y + e.ySize);
  const l = (a === 0 ? o.lExt : o.rExt).bottom;
  a !== 0 && P$(e, a, s);
  const f = z$(l, a, s);
  return [a + 1, f];
}, [0, null]), D$(e), G$(e), e), uE = (e, t, n) => {
  typeof t > "u" && (t = -e.relX - e.prelim, n = 0);
  const o = t + e.relX;
  return e.relX = o + e.prelim - n, e.prelim = 0, e.x = n + e.relX, (e.children || []).forEach((a) => uE(a, o, e.x)), e;
}, D$ = (e) => {
  (e.children || []).reduce((t, n) => {
    const [o, a] = t, s = o + n.shift, l = a + s + n.change;
    return n.relX += l, [s, l];
  }, [0, 0]);
}, P$ = (e, t, n) => {
  const o = e.children[t - 1], a = e.children[t];
  let s = o, l = o.relX, f = a, c = a.relX, p = !0;
  for (; s && f; ) {
    s.bottom > n.lowY && (n = n.next);
    const h = l + s.prelim - (c + f.prelim) + s.xSize / 2 + f.xSize / 2 + s.spacing(f);
    (h > 0 || h < 0 && p) && (c += h, U$(a, h), $$(e, t, n.index, h)), p = !1;
    const v = s.bottom, E = f.bottom;
    v <= E && (s = F$(s), s && (l += s.relX)), v >= E && (f = k$(f), f && (c += f.relX));
  }
  !s && f ? B$(e, t, f, c) : s && !f && H$(e, t, s, l);
}, U$ = (e, t) => {
  e.relX += t, e.lExtRelX += t, e.rExtRelX += t;
}, $$ = (e, t, n, o) => {
  const a = e.children[t], s = t - n;
  if (s > 1) {
    const l = o / s;
    e.children[n + 1].shift += l, a.shift -= l, a.change -= o - l;
  }
}, k$ = (e) => e.hasChildren ? e.firstChild : e.lThr, F$ = (e) => e.hasChildren ? e.lastChild : e.rThr, B$ = (e, t, n, o) => {
  const a = e.firstChild, s = a.lExt, l = e.children[t];
  s.lThr = n;
  const f = o - n.relX - a.lExtRelX;
  s.relX += f, s.prelim -= f, a.lExt = l.lExt, a.lExtRelX = l.lExtRelX;
}, H$ = (e, t, n, o) => {
  const a = e.children[t], s = a.rExt, l = e.children[t - 1];
  s.rThr = n;
  const f = o - n.relX - a.rExtRelX;
  s.relX += f, s.prelim -= f, a.rExt = l.rExt, a.rExtRelX = l.rExtRelX;
}, G$ = (e) => {
  if (e.hasChildren) {
    const t = e.firstChild, n = e.lastChild, o = (t.prelim + t.relX - t.xSize / 2 + n.relX + n.prelim + n.xSize / 2) / 2;
    Object.assign(e, {
      prelim: o,
      lExt: t.lExt,
      lExtRelX: t.lExtRelX,
      rExt: n.rExt,
      rExtRelX: n.rExtRelX
    });
  }
}, z$ = (e, t, n) => {
  for (; n !== null && e >= n.lowY; )
    n = n.next;
  return {
    lowY: e,
    index: t,
    next: n
  };
}, W$ = {
  key: 0,
  class: "flex-grow-1 d-flex justify-content-center"
}, X$ = { class: "card align-self-center border-danger w-50" }, Y$ = { class: "card-body" }, V$ = { class: "overflow-hidden d-flex w-100 h-100 position-relative mb-3" }, j$ = { class: "overflow-auto flex-grow-1" }, K$ = {
  class: "small p-2 mb-0",
  style: { "max-height": "200px" }
}, q$ = ["innerHTML"], J$ = { class: "d-flex align-items-center" }, Z$ = { class: "text-secondary" }, Q$ = { class: "d-flex align-items-center" }, e4 = { class: "nav nav-pills" }, t4 = { class: "nav-item p-1" }, n4 = { class: "nav-item p-1" }, r4 = {
  key: 0,
  class: "badge bg-info",
  style: { "font-size": "0.6em" }
}, i4 = { class: "nav-item p-1" }, o4 = { class: "nav-item p-1" }, a4 = { class: "nav-item p-1" }, s4 = { class: "ms-auto me-2 small" }, u4 = {
  href: "https://github.com/DBatUTuebingen/duckdb-explain-visualizer",
  target: "_blank"
}, l4 = { class: "tab-content flex-grow-1 d-flex overflow-hidden" }, f4 = { class: "d-flex flex-column flex-grow-1 overflow-hidden" }, c4 = { class: "flex-grow-1 d-flex overflow-hidden" }, d4 = { class: "flex-grow-1 overflow-hidden" }, p4 = {
  key: 0,
  class: "position-absolute m-1 p-1 bottom-0 end-0 rounded bg-white d-flex"
}, h4 = {
  class: "btn-group btn-group-xs",
  style: { "z-index": "1", background: "white" }
}, v4 = ["disabled"], g4 = ["disabled"], m4 = ["id"], E4 = { class: "overflow-hidden d-flex w-100 h-100 flex-column" }, _4 = { class: "overflow-hidden d-flex w-100 h-100" }, y4 = { class: "overflow-auto flex-grow-1" }, T4 = { class: "small p-2 mb-0" }, A4 = ["innerHTML"], b4 = { class: "overflow-hidden d-flex w-100 h-100" }, O4 = { class: "overflow-auto flex-grow-1" }, N4 = { class: "small p-2 mb-0" }, S4 = ["innerHTML"], Sa = 40, I4 = 0.2, w4 = /* @__PURE__ */ Lt({
  __name: "Plan",
  props: {
    planSource: {},
    planQuery: {}
  },
  setup(e) {
    const t = e, n = "1.1.4", o = qe(null), a = qe(""), s = qe(""), l = qe(!1), f = qe(), c = qe(), p = qe(null), h = Tr({}), v = $e(() => f.value.content[w.CPU_TIME] !== void 0 ? f.value && f.value.content[w.PLANS][0] : f.value && f.value.content), E = qe(NaN), b = qe(void 0), R = qe(NaN), T = localStorage.getItem("gridIsNotNew"), x = Tr({
      showHighlightBar: !1,
      showPlanStats: !0,
      highlightType: Fn.NONE,
      diagramWidth: 20
    }), I = new QM(), F = qe(Fa), P = qe(1), g = $e(() => iE().domain([0, Math.max(1, h.maxRows)]).range([1, Sa / 1.5])), H = d$().scaleExtent([I4, 3]).on("zoom", function(V) {
      F.value = V.transform, P.value = V.transform.k, z();
    });
    function $(V) {
      const O = p.value;
      if (!O) return;
      const W = new WheelEvent("wheel", {
        deltaY: V.deltaY,
        deltaMode: V.deltaMode,
        clientX: V.clientX,
        clientY: V.clientY,
        screenX: V.screenX,
        screenY: V.screenY,
        ctrlKey: V.ctrlKey,
        altKey: V.altKey,
        shiftKey: V.shiftKey,
        metaKey: V.metaKey
      });
      O.dispatchEvent(W);
    }
    const U = qe(null), _ = qe([]), A = aE({
      nodeSize: (V) => V.data.size ? [V.data.size[0], V.data.size[1] + Sa] : [0, 0],
      spacing: (V, O) => Math.pow(V.path(O).length, 1.5)
    }), Z = qe(A.hierarchy({}));
    lo(() => {
      const V = localStorage.getItem("viewOptions");
      V && be.assignIn(x, JSON.parse(V));
      let O;
      try {
        O = I.fromSource(
          t.planSource
        ), l.value = !0, he("plan");
      } catch {
        l.value = !1, f.value = void 0;
        return;
      }
      s.value = O[w.QUERY] || t.planQuery, f.value = I.createPlan("", O, s.value);
      const W = f.value.content;
      h.blockedThreadTime = O[w.BLOCKED_THREAD_TIME] ?? NaN, h.executionTime = O[w.CPU_TIME] ?? 0, h.latency = O[w.LATENCY] ?? NaN, h.rowsReturned = O[w.ROWS_RETURNED] ?? NaN, h.resultSize = O[w.RESULT_SET_SIZE] ?? NaN, h.maxRows = W.maxRows ?? NaN, h.maxRowsScanned = W.maxRowsScanned ?? NaN, h.maxResult = W.maxResult ?? NaN, h.maxEstimatedRows = W.maxEstimatedRows ?? NaN, h.maxDuration = W.maxDuration ?? NaN, f.value.planStats = h, Oi(() => {
        ue();
      }), window.addEventListener("hashchange", ue), v.value && (Z.value = A.hierarchy(
        v.value,
        (J) => J[w.PLANS]
      )), ye();
    });
    function G(V, O) {
      let W = null;
      return (...J) => {
        W && clearTimeout(W), W = setTimeout(() => V(...J), O);
      };
    }
    function _e() {
      U.value = A(Z.value), z();
    }
    const ye = G(_e, 0);
    ci(() => {
      if (!c.value) return;
      const V = p.value;
      if (!V) return;
      function O(Q, ie) {
        let Ae = null;
        return (...Fe) => {
          Ae && clearTimeout(Ae), Ae = setTimeout(() => Q(...Fe), ie);
        };
      }
      const W = O((Q) => {
        const { width: ie, height: Ae } = Q[0].contentRect, Fe = window.devicePixelRatio || 1;
        if (V.width = ie * Fe, V.height = Ae * Fe, V.style.width = ie + "px", V.style.height = Ae + "px", U.value) {
          const Ye = Ee(U.value), pt = ie / (Ye[1] - Ye[0] + 100), zt = Ae / (Ye[3] - Ye[2] + 100), ht = Math.min(1, Math.min(pt, zt)), Yt = (ie - (Ye[1] - Ye[0]) * ht) / 2 - Ye[0] * ht, gn = (Ae - (Ye[3] - Ye[2]) * ht) / 2 - Ye[2] * ht;
          Lr(V).call(
            H.transform,
            Fa.translate(Yt, gn).scale(ht)
          );
        }
      }, 50), J = new ResizeObserver(W);
      return J.observe(c.value.$el), Lr(V).call(H), () => J.disconnect();
    });
    function z() {
      const V = p.value;
      if (!V) return;
      const O = V.getContext("2d", { alpha: !1 });
      if (!O) return;
      const W = window.devicePixelRatio || 1;
      O.fillStyle = "#efefef", O.fillRect(0, 0, V.width, V.height), O.setTransform(1, 0, 0, 1, 0, 0), O.imageSmoothingEnabled = !0, O.imageSmoothingQuality = "high", O.scale(W, W), O.translate(F.value.x, F.value.y), O.scale(F.value.k, F.value.k), U.value?.links().forEach((J) => {
        O.beginPath(), O.strokeStyle = le(J.target.data) ? "lightgrey" : "grey", O.lineCap = "round", O.setLineDash(le(J.target.data) ? [10, 10] : []), O.lineWidth = g.value(
          J.target.data[w.ACTUAL_ROWS] ?? 0
        );
        const Q = new Path2D(se.value(J));
        O.stroke(Q);
      }), O.setTransform(1, 0, 0, 1, 0, 0), U.value?.descendants().forEach((J) => {
        const Q = J.x - J.xSize / 2, ie = J.y, Ae = document.getElementById(`node-${J.data.nodeId}`);
        Ae && (Ae.style.transform = `translate(${Q * F.value.k + F.value.x}px, ${ie * F.value.k + F.value.y}px) scale(${F.value.k})`);
      });
    }
    Fc(() => {
      window.removeEventListener("hashchange", ue);
    }), Zt(x, fe);
    function fe() {
      localStorage.setItem("viewOptions", JSON.stringify(x));
    }
    Zt(E, j);
    function j(V) {
      window.location.hash = V ? "plan/node/" + V : "", f.value && V && (b.value = Hw(f.value, V));
    }
    const se = $e(() => function(V) {
      const O = V.source, W = V.target, J = Math.abs(W.y - (O.y + O.ySize) - Sa), Q = eE();
      return Q.moveTo(O.x, O.y + O.ySize / 2), Q.lineTo(O.x, O.y + O.ySize - Sa), Q.bezierCurveTo(
        O.x,
        O.y + O.ySize - Sa + J / 2,
        W.x,
        W.y - J / 2,
        W.x,
        W.y
      ), Q.toString();
    });
    function ue() {
      const O = /#([a-zA-Z]*)(\/node\/([0-9]*))*/.exec(window.location.hash);
      if (O) {
        const W = O[1] || "plan";
        he(W);
        const J = parseInt(O[3], 0);
        W == "plan" && J !== void 0 && J != E.value && setTimeout(() => {
          Te(J, !0);
        }, 1);
      }
    }
    on(Nu, E), on(Vu, R), on("updateNodeSize", de);
    function Te(V, O) {
      O = !!O, E.value = V, O && Ie(V);
    }
    on(ro, Te), on(Jo, x), on(Hr, $e(() => f.value ?? {
      id: "",
      name: "",
      content: {
        _: {},
        [w.PLANS]: [],
        maxRows: 0,
        maxRowsScanned: 0,
        maxEstimatedRows: 0,
        maxResult: 0,
        maxDuration: 0
      },
      query: "",
      createdOn: /* @__PURE__ */ new Date(),
      planStats: {
        maxRows: 0,
        maxRowsScanned: 0,
        maxEstimatedRows: 0,
        maxResult: 0,
        maxDuration: 0
      }
    }));
    function Ie(V) {
      const O = c.value.$el.getBoundingClientRect(), W = Me(V);
      if (!W)
        return;
      let J = -W.x, Q = -W.y;
      const ie = P.value;
      J = J * ie + O.width / 2, Q = Q * ie + O.height / 2;
      const Ae = p.value;
      Ae && Lr(Ae).transition().duration(500).call(
        H.transform,
        Fa.translate(J, Q).scale(ie)
      );
    }
    function Me(V) {
      const O = [U.value].concat(_.value);
      let W;
      return be.each(O, (J) => (W = be.find(J?.descendants(), (Q) => Q.data.nodeId == V), !W)), W;
    }
    const he = (V) => {
      a.value = V;
    };
    function Ee(V) {
      const O = be.min(
        be.map(V.descendants(), (ie) => ie.x - ie.xSize / 2)
      ) || 0, W = be.max(
        be.map(V.descendants(), (ie) => ie.x + ie.xSize / 2)
      ) || 0, J = be.min(
        be.map(V.descendants(), (ie) => ie.y)
      ) || 0, Q = be.max(
        be.map(V.descendants(), (ie) => ie.y + ie.ySize)
      ) || 0;
      return [O, W, J, Q];
    }
    function le(V) {
      return !!h.executionTime && !V[w.ACTUAL_TIME] && !V[w.ACTUAL_ROWS];
    }
    Zt(
      () => {
        const V = [];
        return V.concat(
          Z.value.descendants().map((O) => O.data.size)
        ), be.each(_.value, (O) => {
          V.concat(
            O.descendants().map((W) => W.data.size)
          );
        }), V;
      },
      () => {
        ye();
      },
      { deep: !0 }
    );
    function de(V, O) {
      V.size = [O[0] / P.value, O[1] / P.value], Oi(() => ye());
    }
    return (V, O) => l.value ? (q(), re("div", {
      key: 1,
      ref_key: "rootEl",
      ref: o,
      class: "plan-container d-flex flex-column overflow-hidden flex-grow-1 bg-light"
    }, [
      D("div", Q$, [
        D("ul", e4, [
          D("li", t4, [
            D("a", {
              class: Xe(["nav-link px-2 py-0", { active: a.value === "plan" }]),
              href: "#plan"
            }, "Plan", 2)
          ]),
          O[17] || (O[17] = B()),
          D("li", n4, [
            D("a", {
              class: Xe(["nav-link px-2 py-0 position-relative", { active: a.value === "grid" }]),
              href: "#grid"
            }, [
              O[16] || (O[16] = B(`Grid
            `, -1)),
              S(T) ? Le("", !0) : (q(), re("span", r4, `
              new
            `))
            ], 2)
          ]),
          O[18] || (O[18] = B()),
          D("li", i4, [
            D("a", {
              class: Xe(["nav-link px-2 py-0", { active: a.value === "raw" }]),
              href: "#raw"
            }, "Raw", 2)
          ]),
          O[19] || (O[19] = B()),
          D("li", o4, [
            D("a", {
              class: Xe(["nav-link px-2 py-0", { active: a.value === "query", disabled: !s.value }]),
              href: "#query"
            }, "Query", 2)
          ]),
          O[20] || (O[20] = B()),
          D("li", a4, [
            D("a", {
              class: Xe(["nav-link px-2 py-0", { active: a.value === "stats" }]),
              href: "#stats"
            }, "Stats", 2)
          ])
        ]),
        O[21] || (O[21] = B()),
        D("div", s4, [
          D("a", u4, [
            We(tg),
            B(`
          duckdb-explain-visualizer
          ` + He(S(n)), 1)
          ])
        ])
      ]),
      O[36] || (O[36] = B()),
      D("div", l4, [
        D("div", {
          class: Xe(["tab-pane flex-grow-1 overflow-hidden", { "show active d-flex": a.value === "plan" }])
        }, [
          D("div", f4, [
            We(ng),
            O[28] || (O[28] = B()),
            D("div", c4, [
              D("div", d4, [
                We(S(aO), {
                  class: "default-theme",
                  onResize: O[4] || (O[4] = (W) => x.diagramWidth = W[0] && W[0].size !== void 0 ? W[0].size : x.diagramWidth)
                }, {
                  default: Pt(() => [
                    f.value ? (q(), an(S(Uh), {
                      key: 0,
                      size: x.diagramWidth,
                      class: "d-flex flex-column"
                    }, {
                      default: Pt(() => [
                        We(oL, {
                          ref: "diagram",
                          class: "d-flex flex-column flex-grow-1 overflow-hidden plan-diagram"
                        }, null, 512)
                      ]),
                      _: 1
                    }, 8, ["size"])) : Le("", !0),
                    O[27] || (O[27] = B()),
                    We(S(Uh), {
                      ref_key: "planEl",
                      ref: c,
                      class: "plan grab-bing position-relative"
                    }, {
                      default: Pt(() => [
                        f.value ? (q(), re("div", p4, [
                          D("div", h4, [
                            D("button", {
                              class: Xe(["btn btn-outline-secondary", {
                                active: x.highlightType === S(Fn).NONE
                              }]),
                              onClick: O[0] || (O[0] = (W) => x.highlightType = S(Fn).NONE)
                            }, `
                        none
                      `, 2),
                            O[22] || (O[22] = B()),
                            D("button", {
                              class: Xe(["btn btn-outline-secondary", {
                                active: x.highlightType === S(Fn).DURATION
                              }]),
                              disabled: !1,
                              onClick: O[1] || (O[1] = (W) => x.highlightType = S(Fn).DURATION)
                            }, `
                        duration
                      `, 2),
                            O[23] || (O[23] = B()),
                            D("button", {
                              class: Xe(["btn btn-outline-secondary", {
                                active: x.highlightType === S(Fn).ROWS
                              }]),
                              disabled: !v.value || v.value[S(w).CPU_TIME] === void 0,
                              onClick: O[2] || (O[2] = (W) => x.highlightType = S(Fn).ROWS)
                            }, `
                        rows
                      `, 10, v4),
                            O[24] || (O[24] = B()),
                            D("button", {
                              class: Xe(["btn btn-outline-secondary", {
                                active: x.highlightType === S(Fn).RESULT
                              }]),
                              disabled: !v.value || v.value[S(w).CPU_TIME] === void 0,
                              onClick: O[3] || (O[3] = (W) => x.highlightType = S(Fn).RESULT)
                            }, `
                        result
                      `, 10, g4)
                          ])
                        ])) : Le("", !0),
                        O[25] || (O[25] = B()),
                        D("canvas", {
                          ref_key: "canvasRef",
                          ref: p,
                          style: { width: "100%", height: "100%" }
                        }, null, 512),
                        O[26] || (O[26] = B()),
                        D("div", {
                          class: "node-overlay",
                          onWheel: $
                        }, [
                          (q(!0), re(Et, null, er(U.value?.descendants(), (W) => (q(), re("div", {
                            id: `node-${W.data.nodeId}`,
                            key: W.data.nodeId,
                            class: "absolute-node"
                          }, [
                            We(H2, {
                              node: W.data
                            }, null, 8, ["node"])
                          ], 8, m4))), 128))
                        ], 32)
                      ]),
                      _: 1,
                      __: [25, 26]
                    }, 512)
                  ]),
                  _: 1,
                  __: [27]
                })
              ])
            ])
          ])
        ], 2),
        O[32] || (O[32] = B()),
        a.value === "grid" ? (q(), re("div", {
          key: 0,
          class: Xe(["tab-pane flex-grow-1 overflow-hidden position-relative", { "show active": a.value === "grid" }])
        }, [
          D("div", E4, [
            We(ng),
            O[29] || (O[29] = B()),
            We(r2, { class: "flex-grow-1 overflow-auto plan-grid" })
          ])
        ], 2)) : Le("", !0),
        O[33] || (O[33] = B()),
        D("div", {
          class: Xe(["tab-pane flex-grow-1 overflow-hidden position-relative", { "show active": a.value === "raw" }])
        }, [
          D("div", _4, [
            D("div", y4, [
              D("pre", T4, [
                D("code", {
                  innerHTML: S(fx)(V.planSource)
                }, null, 8, A4)
              ])
            ]),
            O[30] || (O[30] = B()),
            We(kf, { content: V.planSource }, null, 8, ["content"])
          ])
        ], 2),
        O[34] || (O[34] = B()),
        s.value ? (q(), re("div", {
          key: 1,
          class: Xe(["tab-pane flex-grow-1 overflow-hidden position-relative", { "show active": a.value === "query" }])
        }, [
          D("div", b4, [
            D("div", O4, [
              D("pre", N4, [
                D("code", {
                  innerHTML: S(lx)(s.value)
                }, null, 8, S4)
              ])
            ])
          ]),
          O[31] || (O[31] = B()),
          We(kf, { content: s.value }, null, 8, ["content"])
        ], 2)) : Le("", !0),
        O[35] || (O[35] = B()),
        D("div", {
          class: Xe(["tab-pane flex-grow-1 overflow-auto", { "show active": a.value === "stats" }])
        }, [
          f.value ? (q(), an(VM, { key: 0 })) : Le("", !0)
        ], 2)
      ])
    ], 512)) : (q(), re("div", W$, [
      D("div", X$, [
        D("div", Y$, [
          O[9] || (O[9] = D("h5", { class: "card-title text-danger" }, `
          Couldn't parse plan
        `, -1)),
          O[10] || (O[10] = B()),
          O[11] || (O[11] = D("h6", { class: "card-subtitle mb-2 text-body-secondary" }, `
          An error occured while parsing the plan
        `, -1)),
          O[12] || (O[12] = B()),
          D("div", V$, [
            D("div", j$, [
              D("pre", K$, [
                D("code", { innerHTML: V.planSource }, null, 8, q$)
              ])
            ]),
            O[5] || (O[5] = B()),
            We(kf, { content: V.planSource }, null, 8, ["content"])
          ]),
          O[13] || (O[13] = B()),
          O[14] || (O[14] = D("p", { class: "card-text text-body-dark" }, `
          The plan you submited couldn't be parsed. This may be a bug. You can
          help us fix it by opening a new issue.
        `, -1)),
          O[15] || (O[15] = B()),
          D("div", J$, [
            D("span", Z$, [
              We(tg),
              O[6] || (O[6] = B(`
            DEV `, -1)),
              D("i", null, "version " + He(S(n)), 1)
            ]),
            O[7] || (O[7] = B()),
            O[8] || (O[8] = D("a", {
              href: "https://github.com/DBatUTuebingen/pev2/issues",
              target: "_blank",
              class: "btn btn-primary ms-auto"
            }, "Open an issue on Github", -1))
          ])
        ])
      ])
    ]));
  }
});
export {
  w4 as Plan
};
