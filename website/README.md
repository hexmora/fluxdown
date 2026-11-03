# Fluxdown 文档站

[文档站](https://fluxdown.dev/zh/) | [Playground](https://fluxdown.dev/zh/playground.html)

先在仓库根目录运行 `pnpm install --frozen-lockfile`，再进入 `website/` 执行：

```sh
pnpm dev     # 本地开发
pnpm build   # 构建静态站点
pnpm preview # 预览构建结果
pnpm check   # 类型检查、代码检查和构建
```

`main` 更新后自动部署到 GitHub Pages。

生产站点使用 `https://fluxdown.dev/`，由 GitHub Pages 托管、Cloudflare 管理 DNS：

- GitHub Pages 的 Custom domain 设置为 `fluxdown.dev`，启用 Enforce HTTPS。
- 根域名和 `www` 的 CNAME 均指向 `hexmora.github.io`，使用 DNS only；Cloudflare 自动扁平化根域名的 CNAME。GitHub Pages 将 `www` 重定向到根域名。
- 保留 `_github-pages-challenge-hexmora` TXT 记录，维持 GitHub 账号的域名所有权验证。
- 本站通过 GitHub Actions 发布，域名绑定在仓库 Pages 设置中管理，不依赖 `CNAME` 文件。

修改域名时，需要同步更新站点的 `siteOrigin`、`base`、语言切换路径、SEO 检查、package homepage 和文档链接，并在部署后检查 HTTPS、重定向、sitemap 及静态资源。
