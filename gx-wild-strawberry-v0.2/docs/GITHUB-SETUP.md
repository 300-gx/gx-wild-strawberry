# 从零发布网站（手机也可以操作）

本项目按低维护路线准备为 GitHub Pages 静态站。你不需要先在本地安装 Node.js；GitHub Actions 会在云端检查内容并发布 `site/` 文件夹。

## A. 注册 GitHub
1. 打开 https://github.com/ ，选择 Sign up。
2. 使用你可以长期收取邮件的邮箱注册，并完成邮箱验证。
3. 开启两步验证；不要把密码、恢复码或访问令牌发给任何人（包括协作者）。
4. 如果电脑上的 IE 无法打开 GitHub，请优先用手机浏览器注册；旧版 IE 不适合后续管理仓库。

## B. 创建仓库
1. 登录后打开 https://github.com/new 。
2. Repository name 填 `gx-wild-strawberry`。
3. 选择 Public（GitHub Free 的公开仓库可使用 GitHub Pages；公开仓库中的网站文件和作品内容也会公开）。
4. 勾选 Add a README file，然后创建仓库。
5. 将本项目 ZIP 解压后，把项目内的文件和文件夹上传到仓库根目录，不能把整个外层文件夹再套一层。根目录应能直接看到 `site`、`content`、`docs`、`scripts`、`.github`、`package.json`。

## C. 开启自动部署
1. 打开仓库的 Settings → Pages。
2. 在 Build and deployment 的 Source 中选择 GitHub Actions。
3. 打开 Actions 标签页，查看 `Deploy static site to GitHub Pages` 工作流。
4. 当 `main` 分支收到提交后，工作流会运行内容校验，并把 `site/` 发布到 Pages。
5. 成功后，Settings → Pages 会显示网站地址，通常形如 `https://你的用户名.github.io/gx-wild-strawberry/`。

## D. 重要限制
- 当前自动部署只发布 `site/` 中的前端原型。`content/works/` 中的 Markdown 样例已纳入字段校验，但本版本还不会自动把 Markdown 生成作品网页。
- 点赞、收藏、评论和订阅仍是演示交互，不会写入数据库或发送邮件。
- 不要将未获授权的原作截图、画师原图、订阅邮箱、密钥或私人资料放进公开仓库。
- 如果上传 ZIP 不方便，可在电脑端 GitHub 仓库使用 Add file → Upload files；但必须上传解压后的文件夹内容，而不是只上传 ZIP 文件。
