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
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { QUOTA_TYPE_VALUES } from '@/features/pricing/constants'
import { usePricingData } from '@/features/pricing/hooks'

interface ModelPricingProps {
  className?: string
}

interface ModelPrice {
  name: string
  officialPrice: number
  currentPrice: number
  quotaType: number
}

function getMinGroupRatio(
  enableGroups: string[],
  groupRatio: Record<string, number>
): number {
  if (enableGroups.length === 0) return 1
  let minRatio = Number.POSITIVE_INFINITY
  for (const group of enableGroups) {
    const ratio = groupRatio[group]
    if (ratio !== undefined && ratio < minRatio) {
      minRatio = ratio
    }
  }
  return minRatio === Number.POSITIVE_INFINITY ? 1 : minRatio
}

function formatUSD(value: number): string {
  return `$${value.toFixed(value >= 1 ? 3 : 5).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')}`
}

function formatDiscount(officialPrice: number, currentPrice: number): string {
  if (officialPrice <= 0) return '-'
  const discount = Math.max(0, ((officialPrice - currentPrice) / officialPrice) * 100)
  return `${discount.toFixed(1)}%`
}

export function ModelPricing(_props: ModelPricingProps) {
  const { t } = useTranslation()
  const { models, isLoading } = usePricingData()

  const rows: ModelPrice[] = models
    .map((model) => {
      const enableGroups = Array.isArray(model.enable_groups)
        ? model.enable_groups
        : []
      const minRatio = getMinGroupRatio(enableGroups, model.group_ratio || {})

      if (model.quota_type === QUOTA_TYPE_VALUES.REQUEST) {
        const officialPrice = Number(model.model_price || 0)
        const currentPrice = officialPrice * minRatio
        return {
          name: model.model_name,
          officialPrice,
          currentPrice,
          quotaType: model.quota_type,
        }
      }

      const officialPrice = Number(model.model_ratio || 0) * 2
      const currentPrice = officialPrice * minRatio
      return {
        name: model.model_name,
        officialPrice,
        currentPrice,
        quotaType: model.quota_type,
      }
    })
    .filter((item) => item.officialPrice > 0)
    .sort((a, b) => a.currentPrice - b.currentPrice)
    .slice(0, 12)

  return (
    <section className='relative z-10 px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-10 max-w-xl'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-[0.2em] uppercase'>
            {t('Model Pricing')}
          </p>
          <h2 className='text-2xl leading-tight font-semibold tracking-tight md:text-3xl'>
            {t('Mainstream model prices at a glance')}
          </h2>
          <p className='text-muted-foreground mt-3 text-sm'>
            {t('Official price, current price, and discount are dynamically calculated from backend pricing configuration.')}
          </p>
        </AnimateInView>

        <div className='border-border/70 bg-card/80 overflow-hidden rounded-2xl border shadow-[0_24px_60px_-44px_color-mix(in_oklch,var(--foreground)_28%,transparent)] backdrop-blur-sm'>
          <div className='bg-muted/55 grid grid-cols-5 px-5 py-3 text-xs font-semibold tracking-wide uppercase md:px-6'>
            <span>{t('Model')}</span>
            <span className='text-right'>{t('Type')}</span>
            <span className='text-right'>{t('Official Price')}</span>
            <span className='text-right'>{t('Model Price')}</span>
            <span className='text-right'>{t('Discount Ratio')}</span>
          </div>
          <div>
            {isLoading && (
              <div className='text-muted-foreground px-5 py-6 text-sm md:px-6'>
                {t('Loading...')}
              </div>
            )}
            {!isLoading &&
              rows.map((item) => (
                <div
                  key={item.name}
                  className='border-border/45 grid grid-cols-5 items-center border-t px-5 py-3 text-sm md:px-6'
                >
                  <span className='font-medium'>{item.name}</span>
                  <span className='text-muted-foreground text-right text-xs'>
                    {item.quotaType === QUOTA_TYPE_VALUES.REQUEST
                      ? t('Per Request')
                      : t('Per 1M Tokens')}
                  </span>
                  <span className='text-right font-mono'>
                    {formatUSD(item.officialPrice)}
                  </span>
                  <span className='text-right font-mono'>
                    {formatUSD(item.currentPrice)}
                  </span>
                  <span className='text-right font-mono text-amber-700 dark:text-amber-300'>
                    {formatDiscount(item.officialPrice, item.currentPrice)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
