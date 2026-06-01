/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatBillingCurrencyFromUSD } from '@/lib/currency'
import { useSystemConfigStore } from '@/stores/system-config-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import {
  Play,
  Copy,
} from 'lucide-react'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { getPricing } from '@/features/pricing/api'
import { QUOTA_TYPE_VALUES } from '@/features/pricing/constants'
import type { PricingModel } from '@/features/pricing/types'
import { modelPricingConfig, pricingNoticeConfig, pricingHeaderConfig } from './model-pricing-config'

interface ModelPricingRow {
  name: string
  inputPrice: string
  outputPrice: string
  officialInput: string
  officialOutput: string
  discount: string
  cacheHit: string
}

interface HomePricingResponse {
  data?: PricingModel[]
  group_ratio?: Record<string, number>
  usable_group?: Record<string, { desc: string; ratio: number }>
}

function hasNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatPrice(value: number | null | undefined): string {
  if (!hasNumber(value) || value <= 0) return '-'
  return formatBillingCurrencyFromUSD(value, {
    digitsLarge: 4,
    digitsSmall: 6,
    abbreviate: false,
  })
}

function getModelUsableGroupRatios(
  model: PricingModel,
  groupRatios: Record<string, number>,
  usableGroups: Record<string, { desc: string; ratio: number }>
): number[] {
  const groups = Array.isArray(model.enable_groups) ? model.enable_groups : []
  const usableRatios: number[] = []

  for (const group of groups) {
    if (!(group in usableGroups)) continue
    const ratio = groupRatios[group]
    if (hasNumber(ratio) && ratio > 0) {
      usableRatios.push(ratio)
    }
  }

  return usableRatios.length > 0 ? usableRatios : [1]
}

function getPriceRangeUSD(
  model: PricingModel,
  groupRatios: Record<string, number>,
  usableGroups: Record<string, { desc: string; ratio: number }>,
  getValue: (base: number, pricingModel: PricingModel) => number
): { min: number; max: number } | null {
  if (model.quota_type !== QUOTA_TYPE_VALUES.TOKEN) return null
  const ranges = getModelUsableGroupRatios(model, groupRatios, usableGroups)
    .map((ratio) => {
      const base = model.model_ratio * 2 * ratio
      return getValue(base, model)
    })
    .filter((value) => Number.isFinite(value) && value > 0)

  if (ranges.length === 0) return null

  return {
    min: Math.min(...ranges),
    max: Math.max(...ranges),
  }
}

function getInputPriceRangeUSD(
  model: PricingModel,
  groupRatios: Record<string, number>,
  usableGroups: Record<string, { desc: string; ratio: number }>
): { min: number; max: number } | null {
  return getPriceRangeUSD(model, groupRatios, usableGroups, (base) => base)
}

function getOutputPriceRangeUSD(
  model: PricingModel,
  groupRatios: Record<string, number>,
  usableGroups: Record<string, { desc: string; ratio: number }>
): { min: number; max: number } | null {
  return getPriceRangeUSD(
    model,
    groupRatios,
    usableGroups,
    (base, pricingModel) => base * pricingModel.completion_ratio
  )
}

function formatPriceRange(
  range: { min: number; max: number } | null
): string {
  if (!range) return '-'
  if (Math.abs(range.min - range.max) < 0.000001) {
    return formatPrice(range.min)
  }
  return `${formatPrice(range.min)}~${formatPrice(range.max)}`
}

function getDiscountPercent(actual: number, official: number): number | null {
  if (!hasNumber(actual) || !hasNumber(official) || official <= 0) return null
  return (1 - actual / official) * 100
}

function formatDiscountPercent(value: number | null): string {
  if (!hasNumber(value)) return '-'
  const rounded = Math.round(value)
  if (rounded > 0) return `-${rounded}%`
  if (rounded < 0) return `+${Math.abs(rounded)}%`
  return '0%'
}

function formatUnsignedDiscountPercent(value: number | null): string {
  if (!hasNumber(value)) return '-'
  return `${Math.abs(Math.round(value))}%`
}

function formatDiscountRange(
  inputRange: { min: number; max: number } | null,
  officialInput: number | null | undefined
): string {
  const values = [
    inputRange && hasNumber(officialInput)
      ? getDiscountPercent(inputRange.min, officialInput)
      : null,
    inputRange && hasNumber(officialInput)
      ? getDiscountPercent(inputRange.max, officialInput)
      : null,
  ].filter(hasNumber)

  if (values.length === 0) return '-'

  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  if (Math.abs(minValue - maxValue) < 0.001) {
    return formatDiscountPercent(maxValue)
  }

  const first = formatDiscountPercent(maxValue)
  const second = formatUnsignedDiscountPercent(minValue)
  return `${first}~${second}`
}

export function Home() {
  const { t, i18n } = useTranslation()
  const { config } = useSystemConfigStore()
  const [homePageContent, setHomePageContent] = useState('')
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false)
  const isChinese = i18n.language.startsWith('zh')
  const isDemoSiteMode = config.demoSiteEnabled || false
  const serverAddress = config.serverAddress || (typeof window !== 'undefined' ? window.location.origin : '')
  const { data: pricingData } = useQuery<HomePricingResponse>({
    queryKey: ['home-pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const modelPricingRows = useMemo<ModelPricingRow[]>(() => {
    const pricingModels = pricingData?.data || []
    const groupRatios = pricingData?.group_ratio || {}
    const usableGroups = pricingData?.usable_group || {}
    const modelMap = new Map(pricingModels.map((model) => [model.model_name, model]))

    return modelPricingConfig
      .map((configItem) => {
        const model = modelMap.get(configItem.name)
        if (!model || model.quota_type !== QUOTA_TYPE_VALUES.TOKEN) {
          return null
        }

        const inputPriceRange = getInputPriceRangeUSD(
          model,
          groupRatios,
          usableGroups
        )
        const outputPriceRange = getOutputPriceRangeUSD(
          model,
          groupRatios,
          usableGroups
        )

        return {
          name: configItem.name,
          inputPrice: formatPriceRange(inputPriceRange),
          outputPrice: formatPriceRange(outputPriceRange),
          officialInput: formatPrice(configItem.officialInput),
          officialOutput: formatPrice(configItem.officialOutput),
          discount: formatDiscountRange(
            inputPriceRange,
            configItem.officialInput
          ),
          cacheHit: configItem.cacheHit || '-',
        }
      })
      .filter((item): item is ModelPricingRow => item !== null)
  }, [pricingData])

  const displayHomePageContent = async () => {
    const cached = localStorage.getItem('home_page_content') || ''
    setHomePageContent(cached)
    try {
      const res = await api.get('/api/home_page_content')
      const { success, data } = res.data
      if (success) {
        setHomePageContent(data)
        localStorage.setItem('home_page_content', data)
      }
    } catch (error) {
      console.error('加载首页内容失败:', error)
    }
    setHomePageContentLoaded(true)
  }

  const handleCopyBaseURL = async () => {
    try {
      await navigator.clipboard.writeText(serverAddress)
      toast.success(t('已复制到剪切板'))
    } catch {
      toast.error(t('复制失败'))
    }
  }

  useEffect(() => {
    displayHomePageContent()
  }, [])

  if (!homePageContentLoaded) {
    return (
      <PublicLayout showMainContainer={false}>
        <main className='flex min-h-screen items-center justify-center'>
          <div className='text-muted-foreground'>{t('Loading...')}</div>
        </main>
      </PublicLayout>
    )
  }

  if (homePageContent) {
    return (
      <PublicLayout showMainContainer={false}>
        <main className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
              title={t('Custom Home Page')}
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </main>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='w-full overflow-x-hidden'>
        <div className='home-claude w-full overflow-x-hidden'>
          {/* Banner 部分 */}
          <div className='w-full border-b min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative overflow-x-hidden'>
            {/* 背景模糊晕染球 */}
            <div className='blur-ball blur-ball-indigo' />
            <div className='blur-ball blur-ball-teal' />
            <div className='flex items-center justify-center h-full px-4 py-20 md:py-24 lg:py-32 mt-10'>
              {/* 居中内容区 */}
              <div className='flex flex-col items-center justify-center text-center max-w-4xl mx-auto'>
                <div className='flex flex-col items-center justify-center mb-6 md:mb-8'>

                  <h1
                    className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight ${isChinese ? 'tracking-wide md:tracking-wider' : ''}`}
                  >
                    {t('直连官方的')}
                    <br />
                    <span className='shine-text bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                      {t('极致性价比接口网关')}
                    </span>
                  </h1>
                  <p className='text-base md:text-lg lg:text-xl text-muted-foreground mt-4 md:mt-6 max-w-xl'>
                    {t('还有更多低价渠道，稳定流畅，只需要将BaseUrl替换为：')}
                  </p>
                  {/* BASE URL */}
                  <div className='flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-4 md:mt-6 max-w-md'>
                    <div className="relative flex-1 w-full">
                      <Input
                        readOnly
                        value={serverAddress}
                        className='pr-24 rounded-full'
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={handleCopyBaseURL}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='flex flex-row gap-4 justify-center items-center'>
                  <Link to='/console'>
                    <Button size='lg' className='rounded-full px-8'>
                      <Play className="mr-2 h-4 w-4" />
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  {isDemoSiteMode && (
                    <Button
                      variant="outline"
                      size='lg'
                      className='rounded-full px-6'
                      onClick={() =>
                        window.open(
                          'https://github.com/QuantumNous/new-api',
                          '_blank',
                        )
                      }
                    >
                      <GitHubLogoIcon className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  )}

                </div>

                {/* 价格对比卡片 */}
                <div className="mt-12 w-full max-w-5xl">
                  <h2 className="text-xl md:text-2xl font-semibold text-center mb-6">{t('模型价格对比')}</h2>
                  <div className="rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-md overflow-hidden" style={{ border: 'none', boxShadow: 'none' }}>
                    {/* 表头 */}
                    <div className='grid grid-cols-3 px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider md:grid-cols-6'>
                      <span className="min-w-[140px] md:min-w-[180px] text-left">{pricingHeaderConfig.model}</span>
                      <span className='hidden text-center md:block'>{pricingHeaderConfig.input}</span>
                      <span className='hidden text-center md:block'>{pricingHeaderConfig.output}</span>
                      <span className='text-center'>{pricingHeaderConfig.official}</span>
                      <span className='text-center'>{pricingHeaderConfig.discount}</span>
                      <span className='text-center'>{pricingHeaderConfig.cacheHit}</span>
                    </div>

                    {/* 分隔线 */}
                    <div className="mx-5 h-px bg-border/40" />

                    {/* 数据行 */}
                    {modelPricingRows.length === 0 ? (
                      <div className='px-5 py-6 text-sm text-muted-foreground'>
                        {t('暂无价格数据')}
                      </div>
                    ) : (
                      modelPricingRows.map((item) => (
                        <div
                          key={item.name}
                          className='grid grid-cols-3 items-center px-5 py-3.5 text-sm md:grid-cols-6 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                        >
                          <span className='truncate pr-2 text-left font-medium text-foreground min-w-[140px] md:min-w-[180px]' title={item.name}>
                            {item.name}
                          </span>
                          <span className='hidden text-center font-mono text-muted-foreground md:block'>
                            {item.inputPrice}
                          </span>
                          <span className='hidden text-center font-mono text-muted-foreground md:block'>
                            {item.outputPrice}
                          </span>
                          <span className='text-center font-mono text-muted-foreground'>
                            {item.officialInput} / {item.officialOutput}
                          </span>
                          <span className='text-center font-mono font-semibold text-amber-600 dark:text-amber-400'>
                            {item.discount}
                          </span>
                          <span className='text-center font-mono font-semibold text-green-600 dark:text-green-400'>
                            {item.cacheHit}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {pricingNoticeConfig.enabled && (
                  <div className='mt-4 w-full max-w-5xl rounded-2xl border bg-amber-50/95 px-4 py-2 text-center text-sm text-amber-900 backdrop-blur-sm dark:bg-amber-900/30 dark:text-amber-200 md:px-5'>
                    {pricingNoticeConfig.text}
                    {pricingNoticeConfig.linkText && pricingNoticeConfig.linkUrl ? (
                      <>
                        {' '}
                        <a
                          href={pricingNoticeConfig.linkUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='font-semibold underline underline-offset-4'
                        >
                          {pricingNoticeConfig.linkText}
                        </a>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PublicLayout>
  )
}
