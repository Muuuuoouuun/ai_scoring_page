import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * 로그인 없이 "이 사람이 아까 그 사람"을 성립시키는 최소 장치.
 *
 * 익명 커뮤니티에서 대화가 굴러가려면 신원까지는 아니어도 연속성은 있어야 합니다.
 * 연속성이 있어야 본인 글 수정·삭제와 90일 뒤 유효성 재확인이 가능해집니다.
 *
 * 토큰은 HttpOnly 쿠키에만 둡니다. localStorage에 두면 XSS 한 번으로
 * 신원 자체가 무의미해집니다.
 *
 * 나중에 이메일/OAuth를 붙일 때는 여기서 만든 handle을 계정에 연결만 하면 되고,
 * 그때까지 쌓인 기여가 하나도 버려지지 않습니다.
 */
const COOKIE = "ais_author";
const MAX_AGE = 60 * 60 * 24 * 365 * 2;

const devSecretStore = globalThis as unknown as { __aisDevSecret?: string; __aisSecretWarned?: boolean };

const secret = () => {
  const configured = process.env.AIS_AUTHOR_SECRET;
  if (configured) return configured;

  /*
   * 미설정이면 프로세스마다 다른 임시 키를 씁니다.
   * 서버가 재시작되면 모든 사용자의 서명이 무효가 되어 신원이 끊기고,
   * 본인이 남긴 기록을 더 이상 수정할 수 없게 됩니다.
   * 조용히 넘어가면 운영에서 나중에 발견하게 되므로 한 번 경고합니다.
   */
  if (process.env.NODE_ENV === "production" && !devSecretStore.__aisSecretWarned) {
    devSecretStore.__aisSecretWarned = true;
    console.warn(
      "[community] AIS_AUTHOR_SECRET이 없어 임시 키를 씁니다. " +
        "재시작하면 기여자 신원이 끊겨 본인 기록을 수정할 수 없게 됩니다."
    );
  }

  return (devSecretStore.__aisDevSecret ??= randomBytes(32).toString("hex"));
};

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

const verify = (value: string, signature: string) => {
  const expected = sign(value);
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
};

const ADJECTIVES = [
  "조용한", "성실한", "느긋한", "꼼꼼한", "단단한", "담백한",
  "차분한", "부지런한", "예민한", "무던한", "날카로운", "너그러운"
];
const NOUNS = [
  "분석가", "기획자", "운영자", "설계자", "관찰자", "정리자",
  "실무자", "검토자", "조율자", "기록자", "탐색자", "결정자"
];

/** 토큰에서 결정론적으로 표시 이름을 만듭니다. 같은 토큰이면 항상 같은 이름이 나옵니다. */
export const handleFromToken = (token: string): string => {
  const digest = createHmac("sha256", "handle").update(token).digest();
  const adjective = ADJECTIVES[digest[0] % ADJECTIVES.length];
  const noun = NOUNS[digest[1] % NOUNS.length];
  const suffix = digest.subarray(2, 4).toString("hex");
  return `${adjective}-${noun}-${suffix}`;
};

type AuthorCookie = { token: string; handle: string; tokenHash: string; isNew: boolean };

/** 저장소에는 토큰 원본이 아니라 이 해시만 들어갑니다. */
export const hashToken = (token: string) =>
  createHmac("sha256", "token-store").update(token).digest("hex");

const parse = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const [token, signature] = raw.split(".");
  if (!token || !signature) return null;
  return verify(token, signature) ? token : null;
};

/** 요청에서 저자를 읽습니다. 없으면 새로 만들되, 쿠키 설정은 호출부가 응답에 실어야 합니다. */
export const resolveAuthor = (): AuthorCookie => {
  const existing = parse(cookies().get(COOKIE)?.value);
  if (existing) {
    return {
      token: existing,
      handle: handleFromToken(existing),
      tokenHash: hashToken(existing),
      isNew: false
    };
  }
  const token = randomBytes(24).toString("hex");
  return { token, handle: handleFromToken(token), tokenHash: hashToken(token), isNew: true };
};

export const authorCookieHeader = (token: string) => {
  const value = `${token}.${sign(token)}`;
  const parts = [
    `${COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE}`
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
};
