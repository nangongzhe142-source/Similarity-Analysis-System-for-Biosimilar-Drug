import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 工具可行性验证目录：内含 Python 虚拟环境，其第三方包自带的 JS 文件
    // 不属于本项目源码，不应参与 lint。
    "tools-poc/**",
  ]),
]);

export default eslintConfig;
