import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  },
  test: {
    environment: "node",
    // 루트 Next 앱의 테스트만 실행합니다. site/ 는 자체 툴체인(node --test)을 씁니다.
    include: ["tests/**/*.test.ts"]
  }
});
