import taggingWordsForHTML from './taggingWordsForHTML.js'
import taggingWordsForHTMLTable from './taggingWordsForHTMLTable.js'

export {
  taggingWordsForHTML
}
export {
  taggingWordsForHTMLTable
}
export function getSearch(href) {
  href = href || window.location.search;
  var data = {}, reg = new RegExp("([^?=&]+)(=([^&]*))?", "g");
  href && href.replace(reg, function ($0, $1, $2, $3) {
    data[$1] = $3;
  });
  return data;
}
export function setCookie(name, value, hours, path) {
  var exp = new Date();
  exp.setTime(exp.getTime() + hours * 60 * 60 * 1000);
  if (!path) {
    path = '/'
  }
  document.cookie = name + "=" + value + ";expires=" + exp.toGMTString() + ";path=" + path;
}
export function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}
export function delCookie(name, path) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = 'null';
  if (!path) {
    path = '/'
  }
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=" + path;
}
export function dateTimeFormatter(date, format) {
  // 时间格式化辅助函数 date:毫秒数 format:'yyyy-MM-dd hh:mm:ss'
  if (!date || date == "") {
    return "";
  } else if (date.toString().length < 13) {
    date = date * 1000;
  }

  if (typeof date === "string") {
    var mts = date.match(/(\/Date\((\d+)\)\/)/);
    if (mts && mts.length >= 3) {
      date = parseInt(mts[2]);
    }
  }

  date = new Date(date);
  if (!date || date.toUTCString() == "Invalid Date") {
    return "";
  }

  var map = {
    "M": date.getMonth() + 1, //月份
    "d": date.getDate(), //日
    "h": date.getHours(), //小时
    "m": date.getMinutes(), //分
    "s": date.getSeconds(), //秒
    "q": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds() //毫秒
  };

  format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
    var v = map[t];
    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v;
        v = v.substr(v.length - 2);
      }
      return v;
    }
    else if (t === 'y') {
      return (date.getFullYear() + '').substr(4 - all.length);
    }
    return all;
  });

  return format;
}
export function isEmpty(obj) {
  if (obj == null || obj == '' || obj == 'undefined' || obj == 'null') {
    return true;
  }
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}
export function uniqueArr (arr, key) {
  if (arr.length === 0) {
    return arr
  }
  var n = [arr[0]];
  for (var i = 1; i < arr.length; i++) {
    if (key === undefined) {
      if (n.indexOf(arr[i]) == -1) n.push(arr[i]);
    } else {
      inner: {
        var has = false;
        for (var j = 0; j < n.length; j++) {
            if (arr[i][key] == n[j][key]) {
                has = true;
                break inner;
            }
        }
      }
      if (!has) {
        n.push(arr[i]);
      }
    }
  }
  return n;
}
export function removeEmptyItem(arr) {
  let result = []
  arr.forEach((item) => {
    if (item == undefined || item == '') {

    } else {
      result.push(item)
    }
  })
  return result
}
export function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

// 函数防抖
/*
  func: 要防抖的函数
  wait: 等待时间
  immediate: 首次触发是否执行
*/
export function _debounce(func, wait, immediate = false) {
  let _timestamp, _timer;
  if (immediate !== true) {
    return function () {
      let now = Date.now();
      if (_timestamp && ((now - _timestamp) < wait)) {
        clearTimeout(_timer);
      }
      _timestamp = now;
      _timer = setTimeout(func.bind(this, ...arguments), wait)
    }
  } else {
    return function () {
      let now = Date.now();
      if (_timestamp && ((now - _timestamp) < wait)) {
        _timestamp = now;
        return;
      }
      _timestamp = now;
      func.apply(this, arguments)
    }
  }
}
// 添加事件的监听与取消监听
export const on = (elem, type, listener, useCapture = false) => {
  elem.addEventListener(type, listener, useCapture)
}

export const off = (elem, type, listener, useCapture = false) => {
  elem.removeEventListener(type, listener, useCapture)
}
// 判断一个元素是否为数组
export const isArray = value => Array.isArray(value)
// 判断一个元素是否为对象
export const isObject = value => value !== null && typeof value === 'object'
// 判断一个元素是否为数字
export const isNumber = value => typeof value === 'number'
// 扁平化数组
export const steamroller = arr => arr.reduce((a, b) => a.concat(isArray(b) ? steamroller(b) : b), [])

// 寻找节点以上的thead
export function findTheadNode (node) {
  let target = null
  if (node.nodeName === '#document') {
    return null
  }
  if (node.nodeName === 'TBODY') {
    return node.previousElementSibling
  }
  if (node.nodeName === 'THEAD') {
    return node
  } else {
    target = node.parentNode
    return findTheadNode(target)
  }
}
// 寻找节点以上的td
export function findTdNode (node) {
  let target = null
  if (node.nodeName === '#document') {
    return null
  }
  if (node.nodeName === 'TD') {
    return node
  } else {
    target = node.parentNode
    return findTdNode(target)
  }
}
// 寻找节点以上的tr
export function findTrNode (node) {
  let target = null
  if (node.nodeName === '#document') {
    return null
  }
  if (node.nodeName === 'TR') {
    return node
  } else {
    target = node.parentNode
    return findTrNode(target)
  }
}
// 计算当前节点之前同级有几个节点
export function previousSiblingNum (node) {
  let num = 0
  if (!node) {
    return num
  }
  if (!node.previousElementSibling) {
    return num
  } else {
    previous(node)
    return num
  }

  function previous (node) {
    if (node.previousElementSibling) {
      if (node.previousElementSibling.colSpan) {
        num += node.previousElementSibling.colSpan
      } else {
        num++
      }
      return previous(node.previousElementSibling)
    }
  }
}
