import type {Tool} from './catalog';
import {toolGenres} from './tool-genres';

export const discoveryTopics = {
  ai: 'AI', image: '디자인·이미지', collaboration: '협업', development: '개발',
  productivity: '생산성', research: '리서치', writing: '문서·글쓰기',
  'project-management': '프로젝트 관리', video: '영상', audio: '음성·음악', automation: '자동화',
};
export type DiscoveryTopic = keyof typeof discoveryTopics;
export const defaultTopics: DiscoveryTopic[] = ['ai', 'image', 'collaboration', 'development'];
export const discoveryStorageKey = 'ais-discovery-topics-v1';
export function normalizeTopics(value: unknown): DiscoveryTopic[] {
  if (!Array.isArray(value)) return [...defaultTopics];
  const valid = [...new Set(value.filter((v): v is DiscoveryTopic => typeof v === 'string' && Object.hasOwn(discoveryTopics, v)))].slice(0, 6);
  return valid.length ? valid : [...defaultTopics];
}
export function topicHref(topic: DiscoveryTopic) {
  return topic === 'ai' ? '/explore?kind=ai-app' : '/explore?genre=' + topic;
}
export function toolsForTopic(tools: Tool[], topic: DiscoveryTopic): Tool[] {
  return tools.filter(tool => topic === 'ai' ? tool.kind === 'ai-app' : toolGenres(tool).includes(topic))
    .sort((a,b) => Number(b.category === topic) - Number(a.category === topic));
}
