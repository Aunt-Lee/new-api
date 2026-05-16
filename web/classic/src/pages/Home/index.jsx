/*
Copyright (C) 2025 QuantumNous

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

import React, { useContext, useEffect, useState } from 'react';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Play,
  Github,
  FileText,
  Copy,
  ChevronDown,
} from 'lucide-react';

const REQUEST_QUOTA_TYPE = 1;
const LEGACY_SITE_URL = 'https://abc.com';

const getMinGroupRatio = (enableGroups = [], groupRatio = {}) => {
  if (!Array.isArray(enableGroups) || enableGroups.length === 0) return 1;
  let minRatio = Number.POSITIVE_INFINITY;
  enableGroups.forEach((group) => {
    const ratio = groupRatio[group];
    if (typeof ratio === 'number' && ratio < minRatio) {
      minRatio = ratio;
    }
  });
  if (minRatio === Number.POSITIVE_INFINITY) return 1;
  return minRatio;
};

const formatUSD = (value) => {
  const n = Number(value || 0);
  if (n <= 0) return '-';
  return `$${n
    .toFixed(n >= 1 ? 3 : 5)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1')}`;
};

const formatDiscount = (officialInput, officialOutput, inputPrice, outputPrice) => {
  const officialTotal = Number(officialInput || 0) + Number(officialOutput || 0);
  const currentTotal = Number(inputPrice || 0) + Number(outputPrice || 0);
  if (officialTotal <= 0) return '-';
  const discount = Math.max(
    0,
    ((officialTotal - currentTotal) / officialTotal) * 100,
  );
  return `${discount.toFixed(1)}%`;
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const [modelPricingRows, setModelPricingRows] = useState([]);
  const [modelPricingLoading, setModelPricingLoading] = useState(false);
  const isChinese = i18n.language.startsWith('zh');

  const fetchModelPricing = async () => {
    setModelPricingLoading(true);
    try {
      const res = await API.get('/api/pricing');
      const { success, data, group_ratio: groupRatio } = res.data;
      if (!success || !Array.isArray(data)) {
        setModelPricingRows([]);
        return;
      }

      const rows = data
        .map((model) => {
          const minRatio = getMinGroupRatio(
            model.enable_groups,
            model.group_ratio || groupRatio || {},
          );
          const isPerRequest = model.quota_type === REQUEST_QUOTA_TYPE;
          const officialInput = isPerRequest
            ? Number(model.model_price || 0)
            : Number(model.model_ratio || 0) * 2;
          const officialOutput = isPerRequest
            ? Number(model.model_price || 0)
            : Number(model.completion_ratio || model.model_ratio || 0) * 2;
          const inputPrice = officialInput * minRatio;
          const outputPrice = officialOutput * minRatio;

          return {
            name: model.model_name,
            inputPrice,
            outputPrice,
            officialInput,
            officialOutput,
            discount: formatDiscount(
              officialInput,
              officialOutput,
              inputPrice,
              outputPrice,
            ),
          };
        })
        .filter((item) => item.officialInput > 0 || item.officialOutput > 0)
        .sort(
          (a, b) =>
            a.inputPrice + a.outputPrice - (b.inputPrice + b.outputPrice),
        )
        .slice(0, 12);

      setModelPricingRows(rows);
    } catch (error) {
      console.error('获取模型价格失败:', error);
      setModelPricingRows([]);
    } finally {
      setModelPricingLoading(false);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    fetchModelPricing().then();
  }, [i18n.language]);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='home-claude w-full overflow-x-hidden'>
          {/* Banner 部分 */}
          <div className='w-full border-b min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative overflow-x-hidden bg-gradient-to-b from-background to-muted/20'>
            {/* 背景模糊晕染球 */}
            <div className='blur-ball blur-ball-indigo' />
            <div className='blur-ball blur-ball-teal' />
            <div className='flex items-center justify-center h-full px-4 py-20 md:py-24 lg:py-32 mt-10'>
              {/* 居中内容区 */}
              <div className='flex flex-col items-center justify-center text-center max-w-4xl mx-auto'>
                <div className='flex flex-col items-center justify-center mb-6 md:mb-8'>
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20">
                      Classic Theme
                    </span>
                  </div>
                  <h1
                    className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight ${isChinese ? 'tracking-wide md:tracking-wider' : ''}`}
                  >
                    <>
                      {t('统一的')}
                      <br />
                      <span className='shine-text bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>{t('大模型接口网关')}</span>
                    </>
                  </h1>
                  <p className='text-base md:text-lg lg:text-xl text-muted-foreground mt-4 md:mt-6 max-w-xl'>
                    {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
                  </p>
                  {/* BASE URL 与端点选择 */}
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
                    <Button
                      size={isMobile ? 'default' : 'lg'}
                      className='rounded-full px-8'
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t('获取密钥')}
                    </Button>
                  </Link>
                  {isDemoSiteMode && statusState?.status?.version ? (
                    <Button
                      variant="outline"
                      size={isMobile ? 'default' : 'lg'}
                      className='rounded-full px-6'
                      onClick={() =>
                        window.open(
                          'https://github.com/QuantumNous/new-api',
                          '_blank',
                        )
                      }
                    >
                      <Github className="mr-2 h-4 w-4" />
                      {statusState.status.version}
                    </Button>
                  ) : (
                    docsLink && (
                      <Button
                        variant="outline"
                        size={isMobile ? 'default' : 'lg'}
                        className='rounded-full px-6'
                        onClick={() => window.open(docsLink, '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {t('文档')}
                      </Button>
                    )
                  )}
                </div>

                {/* 价格对比卡片 */}
                <Card className="mt-12 w-full max-w-5xl rounded-3xl shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl md:text-2xl">{t('模型价格对比')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='overflow-hidden rounded-2xl border'>
                      <div className='grid grid-cols-3 bg-muted/50 px-4 py-3 text-xs font-semibold tracking-wide md:grid-cols-6 md:px-5'>
                        <span>{t('模型')}</span>
                        <span className='hidden text-right md:block'>{t('输入')}</span>
                        <span className='hidden text-right md:block'>{t('输出')}</span>
                        <span className='text-right'>{t('官方输入')}</span>
                        <span className='text-right'>{t('官方输出')}</span>
                        <span className='text-right'>{t('折扣')}</span>
                      </div>

                      {modelPricingLoading ? (
                        <div className='px-4 py-5 text-sm text-muted-foreground md:px-5'>
                          {t('加载中...')}
                        </div>
                      ) : modelPricingRows.length === 0 ? (
                        <div className='px-4 py-5 text-sm text-muted-foreground md:px-5'>
                          {t('暂无价格数据')}
                        </div>
                      ) : (
                        modelPricingRows.map((item) => (
                          <div
                            key={item.name}
                            className='grid grid-cols-3 items-center border-t px-4 py-3 text-sm md:grid-cols-6 md:px-5 hover:bg-muted/30 transition-colors'
                          >
                            <span className='truncate pr-2 text-left font-medium'>
                              {item.name}
                            </span>
                            <span className='hidden text-right font-mono md:block'>
                              {formatUSD(item.inputPrice)}
                            </span>
                            <span className='hidden text-right font-mono md:block'>
                              {formatUSD(item.outputPrice)}
                            </span>
                            <span className='text-right font-mono'>
                              {formatUSD(item.officialInput)}
                            </span>
                            <span className='text-right font-mono'>
                              {formatUSD(item.officialOutput)}
                            </span>
                            <span className='text-right font-mono text-amber-600 dark:text-amber-400'>
                              {item.discount}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className='mt-4 w-full max-w-5xl rounded-2xl border bg-amber-50/95 px-4 py-2 text-center text-sm text-amber-900 backdrop-blur-sm dark:bg-amber-900/30 dark:text-amber-200 md:px-5'>
                  {t('这是新版网站，返回旧版网站请访问')}{' '}
                  <a
                    href={LEGACY_SITE_URL}
                    target='_blank'
                    rel='noreferrer'
                    className='font-semibold underline underline-offset-4'
                  >
                    {LEGACY_SITE_URL}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
