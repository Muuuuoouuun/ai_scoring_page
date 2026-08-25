import { MemoryCommunityStore, type CommunityStore } from "@/lib/community/store";
import { PostgresCommunityStore, getPool } from "@/lib/community/postgres-store";

/**
 * 어느 저장소를 쓸지는 여기서만 결정합니다.
 *
 * DATABASE_URL 이 있으면 Postgres, 없으면 메모리입니다.
 * 화면과 API는 어느 쪽이 붙었는지 모릅니다.
 *
 * 메모리 어댑터는 서버 재시작 시 데이터가 사라지므로 개발용입니다.
 * 운영에서 DATABASE_URL 을 빠뜨리면 조용히 데이터를 잃게 되므로,
 * 프로덕션 빌드에서는 경고를 남깁니다.
 */
const globalStore = globalThis as unknown as { __g2CommunityStore?: CommunityStore };

const createStore = (): CommunityStore => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[community] DATABASE_URL이 없어 메모리 저장소를 씁니다. " +
          "재시작하면 사용자 기여가 전부 사라집니다."
      );
    }
    return new MemoryCommunityStore();
  }

  return new PostgresCommunityStore(getPool(url));
};

export const communityStore: CommunityStore =
  globalStore.__g2CommunityStore ?? (globalStore.__g2CommunityStore = createStore());

export type { CommunityStore };
