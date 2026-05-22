/**
 * 首页模型价格对比配置
 * 您可以在这里自定义显示的模型、价格和公告信息
 */

export interface ModelPricingConfig {
  name: string
  inputPrice: string
  outputPrice: string
  cacheRead: string
  cacheWrite: string
  officialInput: string
  officialOutput: string
  discount: string
  cacheHit: string
}

/**
 * 货币单位配置
 * currency: 'USD' | 'CNY' - 美元或人民币
 * symbol: 显示符号，如 '$' 或 '¥'
 */
export const pricingCurrencyConfig = {
  // 货币类型：'USD' 或 'CNY'
  currency: 'USD' as 'USD' | 'CNY',
  // 显示符号
  symbol: '¥',
}

/**
 * 表头标题配置
 * 可自定义各列的显示标题
 */
export const pricingHeaderConfig = {
  model: '模型',
  input: '输入(1M)',
  output: '输出(1M)',
  official: '官方输入/输出(1M)',
  discount: '折扣',
  cacheHit: '缓存命中',
}

/**
 * 配置模型价格对比数据
 * - name: 模型名称（最多12个汉字）
 * - inputPrice: 输入价格
 * - outputPrice: 输出价格
 * - cacheRead: 缓存读价格
 * - cacheWrite: 缓存写价格
 * - officialInput: 官方输入价格
 * - officialOutput: 官方输出价格
 * - discount: 折扣显示文本
 * - cacheHit: 缓存命中显示文本
 */
export const modelPricingConfig: ModelPricingConfig[] = [
  {
    name: 'claude-opus-4-7',
    inputPrice: '4～10',
    outputPrice: '20～50',
    cacheRead: '0.4～1',
    cacheWrite: '5～12.5',
    officialInput: '35',
    officialOutput: '175',
    discount: '-89%～72%',
    cacheHit: '>90%',
  },
  {
    name: 'claude-opus-4-6',
    inputPrice: '4~10',
    outputPrice: '20~50',
    cacheRead: '0.4~1',
    cacheWrite: '0.4~12.5',
    officialInput: '35',
    officialOutput: '175',
    discount: '-89%～72%',
    cacheHit: '>90%',
  },
  {
    name: 'claude-sonnet-4-6',
    inputPrice: '2.4~6',
    outputPrice: '12~30',
    cacheRead: '0.24~0.6',
    cacheWrite: '3~7.5',
    officialInput: '21',
    officialOutput: '105',
    discount: '-89%～72%',
    cacheHit: '>90%',
  },
  {
    name: 'claude-haiku-4-5',
    inputPrice: '0.8~2',
    outputPrice: '4~10',
    cacheRead: '0.08~0.2',
    cacheWrite: '1~2.5',
    officialInput: '7',
    officialOutput: '35',
    discount: '-89%～72%',
    cacheHit: '>90%',
  },
  {
    name: 'gpt-5.5',
    inputPrice: '0.75~5',
    outputPrice: '4.5~30',
    cacheRead: '0.075~0.5',
    cacheWrite: '0.75~5',
    officialInput: '35',
    officialOutput: '210',
    discount: '-98%~83%',
    cacheHit: '>90%',
  },
  {
    name: 'gpt-5.4',
    inputPrice: '0.375~2.5',
    outputPrice: '2.25~15',
    cacheRead: '0.045~0.3',
    cacheWrite: '0.48~3.2',
    officialInput: '17.5',
    officialOutput: '105',
    discount: '-98%~83%',
    cacheHit: '>90%',
  },
  {
    name: 'gpt-5.3-codex',
    inputPrice: '0.27~1.8',
    outputPrice: '2.16~14',
    cacheRead: '0.03~0.2',
    cacheWrite: '0.33~2.2',
    officialInput: '12.25',
    officialOutput: '98',
    discount: '-98%~83%',
    cacheHit: '>90%',
  },
]

/**
 * 公告文字配置
 * 您可以自定义价格对比下方的公告内容
 * 支持 HTML 标签（如 <a> 链接）
 */
export const pricingNoticeConfig = {
  // 公告文字内容
  text: '新网站和通过验证的官方号池合作，注册送2元试用，旧网站请点击',
  // 链接文字
  linkText: 'https://newtonrouter.top',
  // 链接地址
  linkUrl: 'https://newtonrouter.top',
  // 是否显示公告
  enabled: true,
}
