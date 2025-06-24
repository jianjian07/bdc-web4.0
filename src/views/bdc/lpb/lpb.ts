// 单个非组合流程
import { findNode, getDictItemsByCode, getTreeDictItemsByCode } from "/@/views/online/utils/commonUtils"

export function checkShowForSingle(regType, fwInfo) {
  let djdl = regType.substr(0, 2)
  switch (djdl) {
    case '01':
      // 实测楼盘表
      if (fwInfo && fwInfo.chzt != '1') {
        return false
      }
      return checkShowForCq(regType, fwInfo)
    case '02':
      let dydj = regType.substr(0, 3)
      if (dydj === '020') {
        return checkShowForDy(regType, fwInfo)
      } else {
        return checkShowForZjDy(regType, fwInfo)
      }
    case '03':
      // 预测楼盘表
      if (fwInfo && fwInfo.chzt != '2') {
        return false
      }
      let ygdj = regType.substr(0, 3)
      if (ygdj === '030') {
        return checkShowForYgCq(regType, fwInfo)
      } else {
        return checkShowForYgDy(regType, fwInfo)
      }
    case '04':
      return checkShowForCf(regType, fwInfo)
  }
}

// 组合流程
export function checkShowForZh(regType, fwInfo) {
  switch (regType) {
    case '0301,0311':
      return checkShowForYgYd(regType, fwInfo)
    case '0303,0313':
      return checkShowForYgYdBG(regType, fwInfo)
    case '0102,0102':
    case '0103,0102':
    case '0105,0102':
      return checkShowForCqZh(regType, fwInfo)
    case '0103,0203':
      return checkShowForCqDyFsc(regType, fwInfo)
    case '0102,0201':
      return checkShowForCqDySc(regType, fwInfo)
    default:
      return checkShowZhFree(regType, fwInfo)
  }
}

// 自由组合类登记可选
function checkShowZhFree(regType, fwInfo) {
  // 所有与首次组合的流程都允许勾选楼盘表
  let firstdjdl = regType.substring(0, 4)
  if (firstdjdl === '0101') {
    return true
  }
  let djlxs = regType.split(',')
  let djdls = ''
  djlxs.forEach(function(value, index, array) {
    let djdl = value.substring(0, 2)
    djdls = djdls + ',' + djdl
  })
  switch (djdls) {
    case ',01,01':
      return checkShowForCqZh(regType, fwInfo)
    case ',01,02':
      return checkShowForCqDySc(regType, fwInfo)
    case ',03,03':
      return checkShowForYgYdSc(regType, fwInfo)
    case ',01,04':
      return checkShowForCqCf(regType, fwInfo)
    default:
      return false
  }
}

// 产权
function checkShowForCq(regType, fwInfo) {
  let cqxl = regType.substr(2, 2)
  if (fwInfo === null) {
    if (cqxl === '01') {
      return true
    } else {
      return false
    }
  } else {
    // 预查封、预查封续查封、预查封轮候查封可以走产权首次、转移
    // 无法判断续查封是否为预查封，放开楼盘表勾选限制，走业务约束
    if ((fwInfo.cfzt || fwInfo.zbcfzt) && (cqxl != '01' && cqxl != '02')) {
      return false
    }
    switch (cqxl) {
      case '01' :
        return !fwInfo || !(fwInfo.zbcqzt || fwInfo.cqzt)
      default:
        return fwInfo.cqzt && !fwInfo.zbcqzt && !fwInfo.dyzt && !fwInfo.zbdyzt
    }
  }
}

// 抵押
function checkShowForDy(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (!fwInfo.cqzt || fwInfo.cfzt || fwInfo.zbcfzt) {
    return false
  } else {
    let djxl = regType.substr(2, 2)
    switch (djxl) {
      case '01' :
        // 抵押首次限制房屋用途
        return !['40', '41', '42'].includes(fwInfo.fwyt)
      default:
        return fwInfo.dyzt
    }
  }
}

// 在建抵押
function checkShowForZjDy(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (fwInfo.cqzt || fwInfo.cfzt || fwInfo.zbcfzt) {
    return false
  } else {
    let djxl = regType.substr(2, 2)
    switch (djxl) {
      case '11' :
        return true
      case '13':
      case '15':
        return !fwInfo.dyzt
      default:
        return false
    }
  }
}

// 预告产权
function checkShowForYgCq(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (fwInfo.zbygzt || fwInfo.cqzt || fwInfo.cfzt || fwInfo.zbcfzt || fwInfo.dyzt || fwInfo.zbdyzt) {
    return false
  } else {
    let djxl = regType.substr(2, 2)
    switch (djxl) {
      case '01' :
        return !fwInfo.ygzt
      default:
        return fwInfo.ygzt
    }
  }
}

// 预告抵押
function checkShowForYgDy(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (!fwInfo.ygzt || fwInfo.cqzt || fwInfo.cfzt || fwInfo.zbcfzt) {
    return false
  } else {
    let djxl = regType.substr(2, 2)
    switch (djxl) {
      case '11' :
        return true
      default:
        return fwInfo.ygzt && fwInfo.dyzt
    }
  }
}
// 查封类
function checkShowForCf(regType, fwInfo) {
  switch (regType) {
    case '0401':
      return checkShowForCfdj(regType, fwInfo);
    case '0400':
      // 预测楼盘表
      if (fwInfo && fwInfo.chzt != '2') {
        return false
      }
      return checkShowForYcfdj(regType, fwInfo);
      // case '0403':
      //   return checkShowForLhcfdj(regType, fwInfo);
    default:
      return checkShowForJcfdj(regType, fwInfo);
  }
}

// 正式查封 
function checkShowForCfdj(regType, fwInfo) {
  // 0225 放开都允许
  return !!fwInfo
  // if (fwInfo.cqzt && !fwInfo.zbcfzt) {
  //   return true
  // } else {
  //   return false
  // }
}
// 预查封
function checkShowForYcfdj(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (fwInfo.chzt == '2' && (fwInfo.ygzt || (!fwInfo.cqzt && !fwInfo.zbcqzt)) && !fwInfo.zbygzt && !fwInfo.cfzt && !fwInfo.zbcfzt) {
    return true
  } else {
    return false
  }
}

// 轮候查封
function checkShowForLhcfdj(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (((fwInfo.ygzt && !fwInfo.zbygzt) || (!fwInfo.cqzt && !fwInfo.zbcqzt && !fwInfo.zbygzt)) && fwInfo.cfzt && !fwInfo.zbcfzt) {
    return true
  } else {
    return false
  }
}

// 续查封、解查封
function checkShowForJcfdj(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (fwInfo.cfzt) {
    return true
  } else {
    return false
  }
}

// 产权非首次+查封合并办理
function checkShowForCqCf(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (!fwInfo.cqzt || fwInfo.zbcqzt) {
    return false
  } else {
    return true
  }
}

// 预告非首次+预抵首次合并办理
function checkShowForYgYdSc(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (!fwInfo.ygzt || fwInfo.zbygzt || fwInfo.cqzt || fwInfo.cfzt || fwInfo.zbcfzt || fwInfo.dyzt || fwInfo.zbdyzt) {
    return false
  } else {
    return true
  }
}

// 预告预抵合并办理
function checkShowForYgYd(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (fwInfo.ygzt || fwInfo.zbygzt || fwInfo.cqzt || fwInfo.cfzt || fwInfo.zbcfzt || fwInfo.dyzt || fwInfo.zbdyzt) {
    return false
  } else {
    return true
  }
}

// 预告预抵变更合并办理
function checkShowForYgYdBG(regType, fwInfo) {
  if (fwInfo === null) {
    return true
  } else if (fwInfo.ygzt && fwInfo.dyzt && (!fwInfo.zbygzt && !fwInfo.zbdyzt && !fwInfo.cqzt && !fwInfo.zbcqzt && !fwInfo.cfzt && !fwInfo.zbcfzt)) {
    return true
  } else {
    return false
  }
}

//  产权抵押更正 产权抵押变更 产权抵押非首次组合业务
function checkShowForCqDyFsc(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (!fwInfo.cqzt || fwInfo.zbcqzt || fwInfo.cfzt || fwInfo.zbcfzt || !fwInfo.dyzt) {
    return false
  } else {
    return true
  }
}

// 转移抵押 产权+抵押首次组合业务
function checkShowForCqDySc(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (!fwInfo.cqzt || fwInfo.dyzt || fwInfo.zbcqzt || fwInfo.cfzt || fwInfo.zbcfzt) {
    return false
  } else {
    return true
  }
}

// 适用于产权变更转移 产权更正转移 继承转移 产权类组合业务
function checkShowForCqZh(regType, fwInfo) {
  if (fwInfo === null) {
    return false
  } else if (!fwInfo.cqzt || fwInfo.zbcqzt || fwInfo.cfzt || fwInfo.zbcfzt || fwInfo.dyzt || fwInfo.zbdyzt) {
    return false
  } else {
    return true
  }
}

export function getYwStr(type, item) {
  const statusMap = {
    yb: { cqzt: '不动产权', ygzt: '预告', dyzt: '抵押', cfzt: '查封', jzqzt: '居住权' },
    zb: { zbcqzt: '不动产权', zbygzt: '预告', zbdyzt: '抵押', zbcfzt: '查封', zbjzqzt: '居住权' }
  };

  const mapping = statusMap[type];
  if (!mapping) return ''; 

  let result = [];
  for (let key in mapping) {
    if (item[key]) {
      // 临时处理预告预抵合并办理
      if (mapping[key] == '预告') {
        let ywblqkArr = item.ywblqk.replace(/,+$/, '').split(',');
        for (let i = 0; i < ywblqkArr.length; i++) {
            result.push(mapping[key])
        }
      } else {
         result.push(mapping[key]);
      }
    }
  }
  return result.join(',');                 
}

export function getDictStr(dict, value) {
  let arr = getDictItemsByCode(dict)
  if (arr) {
    return arr.find(f => f.value == value)?.label
  }
  return ''
}

export function getTreeDictStr(dict, value) {
  let arr = getTreeDictItemsByCode(dict)
  if (arr) {
    return findNode(arr, value)?.label
  }
  return ''
}