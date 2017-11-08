export function dateTimeFormatter (date ,format) {
  if (!date || date == "") {
      return "";
  }else if(date.toString().length < 13){
      date = date*1000;
  }

  // 时间格式化辅助函数 yyyy-MM-dd hh:mm:ss
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

  format = format.replace(/([yMdhmsqS])+/g, function(all, t){
      var v = map[t];
      if(v !== undefined){
          if(all.length > 1){
              v = '0' + v;
              v = v.substr(v.length-2);
          }
          return v;
      }
      else if(t === 'y'){
          return (date.getFullYear() + '').substr(4 - all.length);
      }
      return all;
  });

  return format;
}
export function fileStatusText (status) {
  if (0 < status && status <= 15) {
    return '步骤2 数据提取中'
  } else if (15 < status && status <= 20) {
    return '步骤3 需确认文档中的最近一年和最近一期'
  } else if (20 < status && status <= 44) {
    return '步骤3 数据分析中'
  } else if (44 < status && status <= 45) {
    return '步骤4 数据待修订'
  } else if (45 < status && status <= 48) {
    return '步骤5 数据修订中'
  } else if (48 < status && status <= 50) {
    return '步骤5 修订已确认，文档生成中'
  } else if (50 < status && status <= 60) {
    return '步骤6 标注完成，文档已生成'
  } else {
    return '状态未知'
  }
}
export function toFixed (number) {
  return Math.floor(number * 100) / 100
}
export function lastMonth (number) {
  if (number === 1) {
    return '无最近一期'
  }
  return '1月-' + number + '月'
}
export function fileStatusTextUser (status) {
  if (0 < status && status <= 12) {
    return '文档分析中，预计用时：15分钟'
  } else if (12 < status && status <= 20) {
    return '需确认文档中的最近一年和最近一期'
  } else if (20 < status && status <= 44) {
    return '文档分析中，预计用时：15分钟'
  } else if (44 < status && status <= 45) {
    return '可查看分析结果，生成文档'
  } else if (45 < status && status <= 48) {
    return '可查看分析结果，生成文档'
  } else if (48 < status && status <= 50) {
    return '文档生成中，预计用时：5分钟'
  } else if (50 < status && status <= 60) {
    return '已完成'
  } else {
    return '状态未知'
  }
}
export function totalNum (array) {
  let total = 0
  array.forEach((item) => {
    total += item.count
  })
  return total
}