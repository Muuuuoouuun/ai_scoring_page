import type {Tool} from './catalog';
import {documentedCapabilities} from './tool-similarity';
export const genreLabels:Record<string,string>={all:'전체 장르',research:'리서치',writing:'문서·글쓰기',image:'디자인·이미지',development:'개발',productivity:'생산성','project-management':'프로젝트 관리',collaboration:'협업',video:'영상',audio:'음성·음악',automation:'자동화'};
const capabilityGenres:Record<string,string[]>={writing:['writing'],research:['research'],summary:['productivity'],coding:['development'],'image-generation':['image'],'image-editing':['image'],'video-generation':['video'],'voice-generation':['audio'],transcription:['audio'],projects:['project-management'],database:['productivity'],'team-messaging':['collaboration'],meetings:['collaboration'],workflow:['automation'],prototyping:['image'],whiteboard:['collaboration']};
/** A tool may serve several genres; only documented, supported or conditional features add genres. */
export function toolGenres(tool:Tool):string[]{
 return [...new Set([tool.category,...documentedCapabilities(tool).flatMap(c=>capabilityGenres[c.id]||[])])].filter(id=>id!=='all'&&Object.hasOwn(genreLabels,id));
}
