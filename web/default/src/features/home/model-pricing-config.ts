/**
 * 首页模型价格对比配置
 * 您可以在这里自定义显示的模型、价格和公告信息
 */

export interface ModelPricingConfig {
  name: string
  inputPrice: number
  outputPrice: number
  officialInput: number
  officialOutput: number
  discount: string
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
 * 配置模型价格对比数据
 * - name: 模型名称（最多12个汉字）
 * - inputPrice: 输入价格
 * - outputPrice: 输出价格
 * - officialInput: 官方输入价格
 * - officialOutput: 官方输出价格
 * - discount: 折扣显示文本（如 "50%"、"免费" 等）
 */
export const modelPricingConfig: ModelPricingConfig[] = [
  {
    name: '满血claude-opus-4-7',
    inputPrice: 10,
    outputPrice: 50,
    officialInput: 35,
    officialOutput: 175,
    discount: '32%',
  },
  {
    name: '满血claude-opus-4-6',
    inputPrice: 10,
    outputPrice: 50,
    officialInput: 35,
    officialOutput: 175,
    discount: '32%',
  },
  {
    name: '满血claude-sonnet-4-6',
    inputPrice: 6,
    outputPrice: 30,
    officialInput: 21,
    officialOutput: 105,
    discount: '32%',
  },
  {
    name: '满血claude-haiku-4-5',
    inputPrice: 2,
    outputPrice: 10,
    officialInput: 7,
    officialOutput: 35,
    discount: '17%',
  },
  {
    name: '满血gpt-5.5',
    inputPrice: 5,
    outputPrice: 30,
    officialInput: 35,
    officialOutput: 210,
    discount: '17%',
  },
  {
    name: '满血gpt-5.4',
    inputPrice: 2.5,
    outputPrice: 15,
    officialInput: 17.5,
    officialOutput: 105,
    discount: '17%',
  },
  {
    name: '满血gpt-5.3-codex',
    inputPrice: 1.8,
    outputPrice: 14,
    officialInput: 12.25,
    officialOutput: 98,
    discount: '17%',
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


