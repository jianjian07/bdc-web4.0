/**
 * 楼盘表可勾选校验 - 规则注册表架构
 *
 * 设计思路:
 * 1. 每种 4 位登记类型注册一条"原子规则"(required / forbidden / custom / produces)
 * 2. 任意组合 = 所有原子规则求 AND,并自动处理:
 *    - produces 豁免: A 产出的状态可满足 B 的 required
 *    - required 优先: 若某字段同时出现在 required 和 forbidden 中,required 胜出
 * 3. 已知特殊组合可通过 COMBO_OVERRIDES 精确覆盖默认行为
 * 4. 未覆盖的组合走默认 AND 逻辑(保守安全)
 */
import { findNode, getDictItemsByCode, getTreeDictItemsByCode } from "/@/views/online/utils/commonUtils"

// ======================== 类型定义 ========================

/** 原子规则:描述某种登记类型对房屋状态的要求 */
interface AtomicRule {
  /** 已办状态必须为真(如 cqzt=1 表示已有产权) */
  required?: string[]
  /** 状态必须为假(含已办和在办,如 zbcqzt=1 表示有在办产权则不可选) */
  forbidden?: string[]
  /** 自定义校验(处理 required/forbidden 无法表达的复杂逻辑) */
  custom?: (fw: any, regType: string) => boolean
  /** 本操作完成后会产出的已办状态(用于组合时豁免其他类型的 required) */
  produces?: string[]
}

/** 组合覆盖规则:对已知特殊组合精确指定 required/forbidden */
interface ComboOverride {
  required?: string[]
  forbidden?: string[]
  custom?: (fw: any, regType: string) => boolean
}

// ======================== 原子规则注册表 ========================

/**
 * 按 4 位登记小类注册原子规则
 *
 * 字段说明:
 * - required:  房屋必须已具备的已办状态
 * - forbidden: 房屋不能具备的状态(已办或在办)
 * - produces:  本操作完成后会新增的已办状态
 * - custom:    无法用 required/forbidden 表达的特殊校验
 *
 * 扩展方式: 新增登记类型只需在此添加一行,无需修改任何函数
 */
const RULE_REGISTRY: Record<string, AtomicRule> = {
  // ---- 产权类 01xx ----
  '0101': { // 产权首次(实测)
    required: [],
    forbidden: ['zbcqzt', 'cqzt'],
    produces: ['cqzt'],
    custom: (fw) => fw.chzt == '1', // 必须实测
  },
  '0102': { // 产权转移
    required: ['cqzt'],
    forbidden: ['zbcqzt', 'dyzt', 'zbdyzt'],
    // 注: 预查封/续查封可走转移,cfzt/zbcfzt 不在此禁止(走后端业务约束)
  },
  '0103': { // 产权变更
    required: ['cqzt'],
    forbidden: ['zbcqzt', 'dyzt', 'zbdyzt', 'cfzt', 'zbcfzt'],
  },
  '0104': { // 产权注销
    required: ['cqzt'],
    forbidden: ['zbcqzt', 'dyzt', 'cfzt', 'zbcfzt'],
  },
  '0105': { // 产权更正
    required: ['cqzt'],
    forbidden: ['zbcqzt', 'dyzt', 'zbdyzt', 'cfzt', 'zbcfzt'],
  },

  // ---- 现楼抵押 020x ----
  '0201': { // 抵押首次
    required: ['cqzt'],
    forbidden: ['cfzt', 'zbcfzt'],
    produces: ['dyzt'],
    custom: (fw) => !['40', '41', '42'].includes(fw.fwyt), // 限制房屋用途
  },
  '0202': { // 抵押变更
    required: ['cqzt', 'dyzt'],
    forbidden: ['cfzt', 'zbcfzt'],
  },
  '0203': { // 抵押转移
    required: ['cqzt', 'dyzt'],
    forbidden: ['cfzt', 'zbcfzt'],
  },
  '0204': { // 抵押注销
    required: ['cqzt', 'dyzt'],
    forbidden: ['cfzt', 'zbcfzt'],
  },

  // ---- 在建抵押 021x ----
  '0211': { // 在建抵押首次
    required: [],
    forbidden: ['cqzt', 'cfzt', 'zbcfzt'],
    produces: ['dyzt'],
  },
  '0213': { // 在建抵押变更
    required: ['dyzt'],
    forbidden: ['cqzt', 'cfzt', 'zbcfzt', 'dyzt'],
  },
  '0214': { // 在建转现
    required: ['dyzt'],
    forbidden: ['cqzt', 'zbcqzt', 'cfzt', 'zbcfzt'],
    produces: ['cqzt'],
  },
  '0215': { // 在建抵押注销
    required: ['dyzt'],
    forbidden: ['cqzt', 'cfzt', 'zbcfzt', 'dyzt'],
  },

  // ---- 预告产权 030x ----
  '0301': { // 预告首次
    required: [],
    forbidden: ['zbygzt', 'cqzt', 'cfzt', 'zbcfzt', 'dyzt', 'zbdyzt', 'ygzt'],
    produces: ['ygzt'],
  },
  '0302': { // 预告变更
    required: ['ygzt'],
    forbidden: ['zbygzt', 'cqzt', 'cfzt', 'zbcfzt', 'dyzt', 'zbdyzt'],
  },
  '0303': { // 预告转移
    required: ['ygzt'],
    forbidden: ['zbygzt', 'cqzt', 'cfzt', 'zbcfzt', 'dyzt', 'zbdyzt'],
  },

  // ---- 预告抵押 031x ----
  '0311': { // 预抵首次
    required: ['ygzt'],
    forbidden: ['cqzt', 'cfzt', 'zbcfzt'],
    produces: ['dyzt'],
  },
  '0312': { // 预抵变更
    required: ['ygzt', 'dyzt'],
    forbidden: ['cqzt', 'cfzt', 'zbcfzt'],
  },
  '0313': { // 预抵转移
    required: ['ygzt', 'dyzt'],
    forbidden: ['zbygzt', 'zbdyzt', 'cqzt', 'zbcqzt', 'cfzt', 'zbcfzt'],
  },

  // ---- 查封类 04xx ----
  '0400': { // 预查封(放开,走后端业务约束)
    custom: () => true,
  },
  '0401': { // 正式查封(放开)
    custom: (fw) => !!fw,
  },
  '0402': { // 续查封
    required: ['cfzt'],
    forbidden: [],
  },
  '0403': { // 轮候查封
    required: ['cfzt'],
    forbidden: ['zbcfzt'],
  },
  '0404': { // 解封
    required: ['cfzt'],
    forbidden: [],
  },
}

// ======================== 组合覆盖表 ========================

/**
 * 已知特殊组合的精确规则(覆盖默认 AND 逻辑)
 *
 * key 格式: 按登记大类组合(排序后逗号分隔),如 '01,02' 表示产权+抵押
 * 或按精确类型组合,如 '0301,0311'
 * 字段说明:
 * - required:  房屋必须已具备的已办状态
 * - forbidden: 房屋不能具备的状态(已办或在办)
 * - produces:  本操作完成后会新增的已办状态
 * - custom:    无法用 required/forbidden 表达的特殊校验
 *
 * 扩展方式: 如果某个新组合的默认 AND 结果不满足业务需求,在此添加一条覆盖即可
 */
const COMBO_OVERRIDES: Record<string, ComboOverride> = {
  // 预告首次 + 预抵首次
  '0301,0311': {
    required: [],
    forbidden: ['ygzt', 'zbygzt', 'cqzt', 'cfzt', 'zbcfzt', 'dyzt', 'zbdyzt'],
  },
  // 预告转移 + 预抵转移(变更)
  '0303,0313': {
    required: ['ygzt', 'dyzt'],
    forbidden: ['zbygzt', 'zbdyzt', 'cqzt', 'zbcqzt', 'cfzt', 'zbcfzt'],
  },
  // 在建转现组合
  '0214,0101,0201': {
    required: ['dyzt'],
    forbidden: ['cqzt', 'zbcqzt', 'cfzt', 'zbcfzt'],
  },
}

/**
 * 按登记大类组合的覆盖(当精确匹配未命中时,尝试大类匹配)
 * key: 大类排序后逗号分隔,如 '01,02'
 */
const CATEGORY_COMBO_OVERRIDES: Record<string, ComboOverride> = {
  // 产权 + 产权(转移/变更/更正组合)
  '01,01': {
    required: ['cqzt'],
    forbidden: ['zbcqzt', 'cfzt', 'zbcfzt', 'dyzt', 'zbdyzt'],
  },
  // 产权 + 抵押(转移抵押)
  '01,02': {
    required: ['cqzt'],
    forbidden: ['dyzt', 'zbcqzt', 'cfzt', 'zbcfzt'],
  },
  // 产权 + 查封
  '01,04': {
    required: ['cqzt'],
    forbidden: ['zbcqzt'],
  },
  // 预告 + 预告(预告非首次 + 预抵首次)
  '03,03': {
    required: ['ygzt'],
    forbidden: ['zbygzt', 'cqzt', 'cfzt', 'zbcfzt', 'dyzt', 'zbdyzt'],
  },
}

// ======================== 组合求值引擎 ========================

/**
 * 获取某登记类型的原子规则(支持降级到按大类通用规则)
 */
function getRule(regType: string): AtomicRule | null {
  // 精确匹配 4 位
  if (RULE_REGISTRY[regType]) return RULE_REGISTRY[regType]

  // 降级: 按前 3 位匹配(如 020x 系列共用)
  const prefix3 = regType.slice(0, 3)
  const candidates = Object.keys(RULE_REGISTRY).filter(k => k.startsWith(prefix3))
  if (candidates.length === 1) return RULE_REGISTRY[candidates[0]]

  // 降级: 按大类生成通用规则
  return getCategoryRule(regType)
}

/**
 * 按登记大类(前 2 位)生成通用宽松规则
 * 用于未注册的新类型,保证"保守安全"(不允许可疑选择)
 */
function getCategoryRule(regType: string): AtomicRule | null {
  const djdl = regType.slice(0, 2)
  switch (djdl) {
    case '01': // 产权类通用: 必须有产权且无在办
      return { required: ['cqzt'], forbidden: ['zbcqzt'] }
    case '02': // 抵押类通用: 必须有产权且无查封
      return { required: ['cqzt'], forbidden: ['cfzt', 'zbcfzt'] }
    case '03': // 预告类通用: 无产权无在办预告
      return { required: [], forbidden: ['zbygzt', 'cqzt', 'cfzt', 'zbcfzt'] }
    case '04': // 查封类通用: 放开
      return { custom: () => true }
    default:
      return null
  }
}

/**
 * 校验单条原子规则
 */
function checkAtomicRule(rule: AtomicRule, fw: any, regType: string): boolean {
  if (rule.required) {
    for (const key of rule.required) {
      if (!fw[key]) return false
    }
  }
  if (rule.forbidden) {
    for (const key of rule.forbidden) {
      if (fw[key]) return false
    }
  }
  if (rule.custom && !rule.custom(fw, regType)) {
    return false
  }
  return true
}

/**
 * 默认组合求值:AND 所有原子规则 + produces 豁免 + required 优先
 */
function evaluateComboDefault(types: string[], fw: any): boolean {
  // 1. 收集所有类型的 produces(组合完成后会新增的状态)
  const producedSet = new Set<string>()
  const rules: Array<{ type: string; rule: AtomicRule }> = []

  for (const t of types) {
    const rule = getRule(t)
    if (!rule) return false // 未知类型且无法降级 → 保守拒绝
    rules.push({ type: t, rule })
    rule.produces?.forEach(p => producedSet.add(p))
  }

  // 2. 收集所有 required(豁免由组合内其他类型 produces 的字段)
  const finalRequired = new Set<string>()
  for (const { rule } of rules) {
    if (rule.required) {
      for (const key of rule.required) {
        // 如果该状态由组合中其他类型产出,则不要求当前已存在
        if (!producedSet.has(key)) {
          finalRequired.add(key)
        }
      }
    }
  }

  // 3. 收集所有 forbidden(去除与 finalRequired 冲突的字段:required 优先)
  const finalForbidden = new Set<string>()
  for (const { rule } of rules) {
    if (rule.forbidden) {
      for (const key of rule.forbidden) {
        if (!finalRequired.has(key)) {
          finalForbidden.add(key)
        }
      }
    }
  }

  // 4. 执行校验
  for (const key of finalRequired) {
    if (!fw[key]) return false
  }
  for (const key of finalForbidden) {
    if (fw[key]) return false
  }

  // 5. 执行所有 custom 校验
  for (const { type, rule } of rules) {
    if (rule.custom && !rule.custom(fw, type)) return false
  }

  return true
}

/**
 * 查找组合覆盖规则
 * 优先精确匹配(排序后的类型串),其次大类匹配
 */
function findComboOverride(types: string[]): ComboOverride | null {
  // 精确匹配: 按原始顺序
  const exactKey = types.join(',')
  if (COMBO_OVERRIDES[exactKey]) return COMBO_OVERRIDES[exactKey]

  // 精确匹配: 排序后
  const sortedKey = [...types].sort().join(',')
  if (COMBO_OVERRIDES[sortedKey]) return COMBO_OVERRIDES[sortedKey]

  // 大类匹配
  const categories = [...new Set(types.map(t => t.slice(0, 2)))].sort()
  const catKey = categories.join(',')
  if (CATEGORY_COMBO_OVERRIDES[catKey]) return CATEGORY_COMBO_OVERRIDES[catKey]

  return null
}

// ======================== 统一入口 ========================

/**
 * 楼盘表可勾选校验(统一入口,支持任意组合)
 *
 * @param regType 登记类型,单个如 '0102',组合如 '0102,0201'
 * @param fwInfo  房屋状态对象
 * @returns 是否可勾选
 *
 * @example
 * checkShowLpb('0101', fw)           // 产权首次
 * checkShowLpb('0102,0201', fw)      // 转移+抵押首次
 * checkShowLpb('0301,0311,0401', fw) // 预告+预抵+查封(任意组合)
 */
export function checkShowLpb(regType: string, fwInfo: any): boolean {
  // 前置校验
  if (!regType || !fwInfo || !fwInfo.shbw) return false

  // 全局硬性限制
  if (fwInfo.xzdj == 1) return false                          // 限制登记一律不可选
  if (fwInfo.ggbw == 1 && !regType.includes('0101')) return false  // 公共部位仅产权首次

  const types = regType.split(',').map(t => t.trim()).filter(Boolean)
  if (types.length === 0) return false

  // 单类型: 直接走原子规则
  if (types.length === 1) {
    const rule = getRule(types[0])
    if (!rule) return false
    return checkAtomicRule(rule, fwInfo, types[0])
  }

  // 多类型组合: 优先查覆盖表,未命中则走默认 AND 逻辑
  const override = findComboOverride(types)
  if (override) {
    // 使用覆盖规则
    if (override.required) {
      for (const key of override.required) {
        if (!fwInfo[key]) return false
      }
    }
    if (override.forbidden) {
      for (const key of override.forbidden) {
        if (fwInfo[key]) return false
      }
    }
    if (override.custom && !override.custom(fwInfo, regType)) return false
    return true
  }

  // 默认: AND 求值引擎
  return evaluateComboDefault(types, fwInfo)
}

// ======================== 兼容旧接口(deprecated) ========================

/**
 * @deprecated 请使用 checkShowLpb 替代
 * 保留仅为向后兼容,内部已转发到新引擎
 */
export function checkShowForSingle(regType: string, fwInfo: any): boolean {
  return checkShowLpb(regType, fwInfo)
}

/**
 * @deprecated 请使用 checkShowLpb 替代
 * 保留仅为向后兼容,内部已转发到新引擎
 */
export function checkShowForZh(regType: string, fwInfo: any): boolean {
  return checkShowLpb(regType, fwInfo)
}

// ======================== 状态色块配置 ========================

/**
 * 状态色块统一配置(图例 + 单元格在办 + 单元格已办 共用一份数据源)
 * - label:  图例显示文字
 * - color:  色块颜色
 * - zbKey:  在办状态字段名
 * - ybKey:  已办状态字段名
 * - showZb: 是否在单元格上半区(在办)展示
 */
export const ZT_CONFIG = [
  { label: '合同备案', color: '#FE9E38', zbKey: 'zbhtbazt', ybKey: 'htbazt', showZb: true },
  { label: '拆迁限制', color: '#75FBD4', zbKey: 'zbcqxzzt', ybKey: 'cqxzzt', showZb: true },
  { label: '地役权', color: '#50A68D', zbKey: 'zbdyqzt', ybKey: 'dyqzt', showZb: true },
  { label: '抵押权', color: '#0000FF', zbKey: 'zbdyzt', ybKey: 'dyzt', showZb: true },
  { label: '公共部位', color: '#805B23', zbKey: 'zbggbwzt', ybKey: 'ggbw', showZb: false },
  { label: '居住权', color: '#A5D147', zbKey: 'zbjzqzt', ybKey: 'jzqzt', showZb: true },
  { label: '合同签约', color: '#FCFC60', zbKey: 'zbhtqyzt', ybKey: 'htqyzt', showZb: true },
  { label: '不动产权', color: '#FF0000', zbKey: 'zbcqzt', ybKey: 'cqzt', showZb: true },
  { label: '限制登记', color: '#BF6B97', zbKey: 'zbxzdjzt', ybKey: 'xzdj', showZb: false },
  { label: '查封(其他限制)', color: '#C0C0C0', zbKey: 'zbcfzt', ybKey: 'cfzt', showZb: true },
  { label: '预告', color: '#9900FF', zbKey: 'zbygzt', ybKey: 'ygzt', showZb: true },
  { label: '异议', color: '#9A992F', zbKey: 'zbyyzt', ybKey: 'yyzt', showZb: true }
]

/** 单元格上半区(在办)使用的子集:公共部位/限制登记不展示在办态 */
export const ZT_CONFIG_ZB = ZT_CONFIG.filter(i => i.showZb)

// ======================== 字典与展示工具 ========================

export function getYwStr(type: string, item: any): string {
  const statusMap: Record<string, Record<string, string>> = {
    yb: { cqzt: '不动产权', ygzt: '预告', dyzt: '抵押', cfzt: '查封', jzqzt: '居住权', yyzt: '异议' },
    zb: { zbcqzt: '不动产权', zbygzt: '预告', zbdyzt: '抵押', zbcfzt: '查封', zbjzqzt: '居住权', zbyyzt: '异议' }
  }

  const mapping = statusMap[type]
  if (!mapping) return ''

  let result: string[] = []
  for (let key in mapping) {
    if (item[key]) {
      // 临时处理预告预抵合并办理
      if (mapping[key] == '预告') {
        let ywblqkStr = String(item.ywblqk ?? '')
        let ywblqkArr = ywblqkStr.replace(/,+$/, '').split(',')
        for (let i = 0; i < ywblqkArr.length; i++) {
          if (ywblqkArr[i].includes('YGZT')) {
            result.push(mapping[key])
          }
        }
      } else {
        result.push(mapping[key])
      }
    }
  }
  return result.join(',')
}

export function getDictStr(dict: string, value: any): string {
  let arr = getDictItemsByCode(dict)
  if (arr) {
    return arr.find((f: any) => f.value == value)?.label ?? ''
  }
  return ''
}

export function getTreeDictStr(dict: string, value: any): string {
  let arr = getTreeDictItemsByCode(dict)
  if (arr) {
    return findNode(arr, value)?.label ?? ''
  }
  return ''
}
