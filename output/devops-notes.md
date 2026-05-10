# DevOps Notes

## 2026-05-10

- Branch: `wanman/header-nav-public-links`
- Verification:
  - `npm run coverage` in `website/` passed.
  - `npm run build` in `website/` passed.
- Coverage:
  - 18 test files passed.
  - 241 tests passed.
  - Reported coverage: statements 47.59%, branches 46.08%, functions 39.19%, lines 47.94%.
- Build notes:
  - Next.js emitted existing Edge-runtime warnings for `src/lib/frameworks.ts` using `fs`, `path`, and `process.cwd`.
  - Static generation logged a missing `POSTGRES_URL` warning while building `/sitemap.xml`, but the build completed successfully.
- Recommendation:
  - Keep the framework preview image route stack published as-is; follow-up runtime cleanup for Edge-runtime access should be handled in a separate ops or architecture task.
