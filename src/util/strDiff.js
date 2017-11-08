export default function (strA, strB) {
  let objA = {
    point: !!~strA.indexOf('.'),
    arr: splitStr(strA),
    mark: []
  }
  let objB = {
    point: !!~strB.indexOf('.'),
    arr: splitStr(strB),
    mark: []
  }
  if (!objA.point) {
    objA.arr.splice(1, 0, null, null)
  }
  if (!objB.point) {
    objB.arr.splice(1, 0, null, null)
  }
  let maxlength = objA.arr.length > objB.arr.length ? objA.arr.length : objB.arr.length

  let arr = Array.apply(null, new Array(maxlength))
  arr.map((elem, index) => index).forEach((item, index) => {
    if (objA.arr[index] === objB.arr[index]) {
      objA.mark[index] = true
      objB.mark[index] = true
    } else {
      objA.mark[index] = false
      objB.mark[index] = false
    }
  })
  objA.mark.length = objA.arr.length
  objB.mark.length = objB.arr.length
  if (!objA.point) {
    objA.arr.splice(1, 2)
    objA.mark.splice(1, 2)
  }
  if (!objB.point) {
    objB.arr.splice(1, 2)
    objB.mark.splice(1, 2)
  }
  return {
    objA,
    objB
  }
}

function splitStr (str) {
  let strArr = []
  str.split('.').forEach((item, index) => {
    let indexOfFirstZh = null
    if (index === 1) {
      strArr.push('.')
    }
    item.split('').forEach((char, charIndex) => {
      if (/^[\u4e00-\u9fa5]$|%/.test(char) && indexOfFirstZh === null) {
        indexOfFirstZh = charIndex
      }
    })
    if (indexOfFirstZh !== null) {
      strArr.push(item.substring(0, indexOfFirstZh))
      strArr.push(item.substring(indexOfFirstZh))
    } else {
      strArr.push(item)
    }
  })
  return strArr
}