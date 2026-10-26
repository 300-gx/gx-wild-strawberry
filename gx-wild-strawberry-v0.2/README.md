# GX：野草莓之地 — 项目基础版 v0.2

面向游戏王 GX 同人圈的创作档案网站。当前交付以现有前端原型为基础，准备了 GitHub Pages 自动部署、作品/作者内容样例、内容校验脚本和中文部署指南。

## 目录

- `site/`：可部署的前端原型（HTML/CSS/JS）。
- `content/works/`：Markdown 作品样例。
- `content/authors/`：作者资料样例。
- `scripts/validate-content.mjs`：检查作品元数据必填字段。
- `.github/workflows/pages.yml`：部署前校验并发布 GitHub Pages。
- `docs/GITHUB-SETUP.md`：从注册账号到发布网站的步骤。
- `docs/CONTENT-MODEL.md`：内容字段与权限边界。
- `docs/ROADMAP.md`：已完成与待开发项目。

## 本地检查

需要 Node.js 18 或更新版本：

```sh
npm run check:content
```

本地预览前端时，打开 `site/index.html` 即可。为了体验现代 CSS/JavaScript，请使用受支持的 Edge、Chrome、Firefox 或 Safari，而不是 Internet Explorer。

## 当前边界

这是可部署的静态基础版，不是已上线的完整平台。CMS/身份认证、作者级权限、评论数据库、真实点赞收藏、服务端图片水印、RSS 生成、每周邮件和备份尚未接入。具体状态见 `docs/ROADMAP.md`。
