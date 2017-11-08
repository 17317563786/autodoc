/*
 * 前端错误上报
 * Data: 20170727
 * Author: geoffzhu1992@gmail.com
 *
 * Useage:
 * import ErrorReporter from './util/error-report'
 *
 * ErrorReporter.config({
 *  reportUrl: "http://sd.bondowner.cn/newbug",  //错误上报地址
 *  reportPrefix: 'Houdu_front',    //错误上报msg前缀，一般用于标识业务类型
 *  otherReport: {}           //需要上报的其他信息
 * })
 *
 */

var ErrorReporter = {}
ErrorReporter.settings = {
  reportUrl: null,
  reportPrefix: '',
  reportKey: 'qun',
  otherReport: null
}

ErrorReporter.config = function(config){
  for(var i in config){
    if(config.hasOwnProperty(i)){
      ErrorReporter.settings[i] = config[i]
    }
  }
}

window.onerror = function(msg, url, line, col, error) {
  var options = ErrorReporter.settings
  var src
  // 如不存在reportUrl，则直接打印错误
  if (options.reportUrl) {
    // 如不存在具体错误信息，直接发送script error
    if (msg.toLowerCase().indexOf('script error') > -1) {
      console.error('Script Error: See Browser Console for Detail')
    } else {
      // 存在错误，将错误信息和文件行号列号拼接成url
      src = options.reportUrl + '?'
            + options.reportKey + '='+options.reportPrefix
            + '&msg=' + msg
            + '&line=' + line
            + '&col=' + col
            + '&t='+new Date().getTime()

      if (url &&
          url != '' &&
          url != 'undefined' &&
          /\.js/.test(url)){
        src = src + '&file=' + url.split('.js')[0] + '.js'
      } else {
        // 如果拿不到具体那个js出错，默认为app.md5.js出错，因为所有的业务逻辑都是写在app.js中的
        let scripts = [...document.scripts]
        scripts.forEach(script => {
          if (/app.*\.js/.test(script.src)) {
            src = src + '&file=' + script.src
          }
        })
      }

      if(options.otherReport) {
        for (var i in options.otherReport) {
          if (options.otherReport.hasOwnProperty(i)) {
            src += '&' + i + '=' + ss.otherReport[i]
          }
        }
      }
      new Image().src = src
    }
  } else {
    console.error(error)
  }
}

export default ErrorReporter
