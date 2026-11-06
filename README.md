# 画布交互练习

[English](README.en.md) | 简体中文

## 背景

这是一个简化的图片画布。用户可以查看画布中的图片卡片，并通过 **Copy** 创建一张副本。画布数据由远程 API 保存，每位候选人使用独立的临时会话。

目前复制卡片时，界面要过一段时间才显示结果，用户难以判断操作是否生效。你的任务是改善这段交互，并保持画布与服务端数据一致。

建议用时约 **20 分钟**。面试官会提供临时 token，其有效期由面试官签发时设置，默认 20 分钟。页面会显示剩余时间；如果启动时 token 已经失效，请联系面试官。

## 启动项目

需要 Node.js 20.19+、22.13+（Node 22）或 24 及以上版本。建议在面试计时开始前安装依赖。

```bash
git clone https://github.com/PeterHiroshi/moodio-interview-candidate.git
cd moodio-interview-candidate
npm ci
npm run dev
```

在浏览器打开 **http://localhost:4173**，然后：

1. 确认 **API address** 为 `https://moodio-interview-api.vercel.app`（默认已填入）。
2. 在 **Interview token** 中输入面试官提供的 token。
3. 点击 **Connect**；连接成功后，画布会显示三张初始卡片及 token 剩余时间。刷新当前标签页后会自动恢复连接；倒计时仅供参考，到期仍由后端判断。
4. 点击任意卡片的 **Copy**，观察现有交互，然后开始修改。

请使用 `localhost:4173`，不要改为 `127.0.0.1` 或其他端口：后端当前只允许该前端地址跨域访问。关闭终端或按 `Ctrl+C` 可以停止本地前端服务。

## 任务要求

改善复制卡片时的用户体验。可以修改本仓库内的文件，不需要修改后端，也不限定实现方式。

请考虑以下场景：

- 用户点击复制后能否及时得到反馈。
- 请求成功或失败时，页面是否清晰且与服务端状态一致。
- 用户快速连续复制同一张卡片或不同卡片时，结果是否正确。
- 请求结束后刷新页面，再使用同一个未过期 token 连接，画布是否与服务端一致。

完成后，请向面试官讲解你的方案、取舍，以及没有来得及处理或验证的情况。项目提供 `npm test`、`npm run typecheck` 和 `npm run lint` 供检查。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `app/` | Next.js 路由、布局和全局样式 |
| `components/canvas/` | 画布和卡片的 React 组件 |
| `lib/redux/services/canvasApi.ts` | RTK Query API 定义 |
| `lib/redux/` | Redux store 和 Provider |
| `public/images/` | 示例图片 |
| `tests/` | API 服务的基础测试 |

## API 说明

画布相关请求都需要在请求头中携带 `Authorization: Bearer <token>`；响应为 JSON。健康检查不需要 token。

### 健康检查

`GET /api/health` 无需 token；服务正常响应时返回 `200` 和 `{ "status": "ok" }`。该接口只检查服务存活，不检查画布存储。

### 读取画布

`GET /api/cards`

成功时返回 `200`，例如：

```json
{
  "cards": [
    { "id": "scene-1", "title": "Quiet morning", "image": "/images/morning.svg" }
  ]
}
```

### 复制卡片

`POST /api/cards/:id/copy`

成功时返回 `201`，包含服务端保存的副本，例如：

```json
{
  "card": { "id": "<服务端生成的 ID>", "title": "Quiet morning copy", "image": "/images/morning.svg" }
}
```

每次新的复制操作都会生成一个服务端 ID。副本保存在当前会话中，并会在后续 `GET /api/cards` 中返回。

请求可以选择携带 `Idempotency-Key: <key>`。每次用户发起新的复制操作时使用新键；同一次操作重试时使用同一个键。同一会话中，同一键复制同一张源卡片会返回同一个副本（包括并发重试）；同一个键用于不同源卡片会返回 `409`。不同会话的键互不影响。不带该请求头时，每次请求都会创建新副本。

键由 1–128 个 ASCII 字母、数字或 `.`、`_`、`~`、`-` 组成，例如 `crypto.randomUUID()` 的结果；格式无效时返回 `400`。网络错误或 `503` 不一定表示服务端没有保存：若首次请求使用了键，可在 token 仍有效时用同一个键重试。幂等记录与会话数据一起保留到面试官清理会话为止；新 token 是新会话。

失败时返回非 2xx 状态及 `{ "error": "..." }`。token 无效或过期时返回 `401`，卡片不存在时返回 `404`；服务暂时不可用时可能返回 `503`。如果 token 已过期，向面试官申请新的 token；新 token 对应独立画布，不会继承旧会话的数据。
