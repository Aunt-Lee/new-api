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
    name: 'claude-opus-4-8',
    inputPrice: '2～8.5',
    outputPrice: '10～42.5',
    cacheRead: '0.2～0.85',
    cacheWrite: '2.5～10.6',
    officialInput: '35',
    officialOutput: '175',
    discount: '-89%～72%',
    cacheHit: '>93%',
  },
  {
    name: 'claude-opus-4-7',
    inputPrice: '2～8.5',
    outputPrice: '10～42.5',
    cacheRead: '0.2～0.85',
    cacheWrite: '2.5～10.6',
    officialInput: '35',
    officialOutput: '175',
    discount: '-89%～72%',
    cacheHit: '>93%',
  },
  {
    name: 'claude-opus-4-6',
    inputPrice: '2~8.5',
    outputPrice: '10~42.5',
    cacheRead: '0.2~0.85',
    cacheWrite: '2.5~10.6',
    officialInput: '35',
    officialOutput: '175',
    discount: '-89%～72%',
    cacheHit: '>93%',
  },
  {
    name: 'claude-sonnet-4-6',
    inputPrice: '1.2~5.1',
    outputPrice: '6~25.5',
    cacheRead: '0.12~0.51',
    cacheWrite: '1.5~6.3',
    officialInput: '21',
    officialOutput: '105',
    discount: '-89%～72%',
    cacheHit: '>93%',
  },
  {
    name: 'claude-haiku-4-5',
    inputPrice: '0.4~1.7',
    outputPrice: '2~8.5',
    cacheRead: '0.04~0.0.17',
    cacheWrite: '0.5~2.1',
    officialInput: '7',
    officialOutput: '35',
    discount: '-89%～72%',
    cacheHit: '>93%',
  },
  {
    name: 'gpt-5.5',
    inputPrice: '0.75~4',
    outputPrice: '4.5~24',
    cacheRead: '0.075~0.5',
    cacheWrite: '0.75~4',
    officialInput: '35',
    officialOutput: '210',
    discount: '-98%~83%',
    cacheHit: '>93%',
  },
  {
    name: 'gpt-5.4',
    inputPrice: '0.375~2',
    outputPrice: '2.25~12',
    cacheRead: '0.037~0.2',
    cacheWrite: '0.37~2',
    officialInput: '17.5',
    officialOutput: '105',
    discount: '-98%~83%',
    cacheHit: '>93%',
  },
  {
    name: 'gpt-5.3-codex',
    inputPrice: '0.26~1.4',
    outputPrice: '2.1~11.2',
    cacheRead: '0.026~0.14',
    cacheWrite: '0.26~1.4',
    officialInput: '12.25',
    officialOutput: '98',
    discount: '-98%~83%',
    cacheHit: '>93%',
  },
]

/**
 * 公告文字配置
 * 您可以自定义价格对比下方的公告内容
 * 支持 HTML 标签（如 <a> 链接）
 */
export const pricingNoticeConfig = {
  // 公告文字内容
  text: '新用户可以0.01元购买2元试用套餐，7天有效',
  // 链接文字
  //linkText: 'https://newtonrouter.top',
  // 链接地址
  //linkUrl: 'https://newtonrouter.top',
  // 是否显示公告
  enabled: true,
}
