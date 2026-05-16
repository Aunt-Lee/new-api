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
  symbol: '$',
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
    name: 'GPT-4o',
    inputPrice: 2.5,
    outputPrice: 10,
    officialInput: 5,
    officialOutput: 15,
    discount: '50%',
  },
  {
    name: 'GPT-4o-mini',
    inputPrice: 0.15,
    outputPrice: 0.6,
    officialInput: 0.15,
    officialOutput: 0.6,
    discount: '0%',
  },
  {
    name: 'Claude 3.5 Sonnet',
    inputPrice: 3,
    outputPrice: 15,
    officialInput: 3,
    officialOutput: 15,
    discount: '0%',
  },
  {
    name: 'Claude 3 Opus',
    inputPrice: 15,
    outputPrice: 75,
    officialInput: 15,
    officialOutput: 75,
    discount: '0%',
  },
  {
    name: 'Gemini 1.5 Pro',
    inputPrice: 3.5,
    outputPrice: 10.5,
    officialInput: 3.5,
    officialOutput: 10.5,
    discount: '0%',
  },
  {
    name: 'Gemini 1.5 Flash',
    inputPrice: 0.35,
    outputPrice: 0.53,
    officialInput: 0.35,
    officialOutput: 0.53,
    discount: '0%',
  },
]

/**
 * 公告文字配置
 * 您可以自定义价格对比下方的公告内容
 * 支持 HTML 标签（如 <a> 链接）
 */
export const pricingNoticeConfig = {
  // 公告文字内容
  text: '这是新版网站，返回旧版网站请访问',
  // 链接文字
  linkText: 'https://abc.com',
  // 链接地址
  linkUrl: 'https://abc.com',
  // 是否显示公告
  enabled: true,
}


