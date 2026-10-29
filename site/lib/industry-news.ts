import newsData from '@/data/industry-news.json';

export const industryTopics = {
  all: '전체',
  agents: '에이전트·SaaS',
  cloud: '모델·클라우드',
  adoption: '기업 도입',
  governance: '검증·거버넌스',
} as const;

export type IndustryTopic = Exclude<keyof typeof industryTopics, 'all'>;
export type IndustryNews = {
  id: string;
  title: string;
  topic: IndustryTopic;
  summary: string;
  takeaway: string;
  sourceName: string;
  sourceTitle: string;
  sourceUrl: string;
  publishedAt: string;
  sourceCheckedAt: string;
};

export const industryNews = (newsData as IndustryNews[]).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function normalizeIndustryTopic(topic = 'all'): keyof typeof industryTopics {
  return Object.hasOwn(industryTopics, topic) ? topic as keyof typeof industryTopics : 'all';
}

export function filterIndustryNews(topic = 'all'): IndustryNews[] {
  const selected = normalizeIndustryTopic(topic);
  return selected === 'all' ? industryNews : industryNews.filter(item => item.topic === selected);
}
