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

### 通用约定

- **地址**：`https://moodio-interview-api.vercel.app`
- **格式**：请求和响应使用 HTTPS；接口响应为 JSON，字符集为 UTF-8。
- **认证**：除健康检查外，所有画布请求需要 `Authorization: Bearer <token>`。Token 由面试官提供，不要写入仓库或分享给其他候选人。
- **会话**：每个 token 对应独立画布。服务端在请求进入时检查有效期；到期前已接收的请求可能在到期后返回。新 token 对应新画布，不继承旧会话的数据。
- **浏览器跨域**：画布接口允许来自 `http://localhost:4173` 的请求，预检允许 `GET`、`POST`、`OPTIONS` 和 `Authorization`、`Content-Type`、`Idempotency-Key` 请求头。

下面的命令在终端运行。先设置地址并输入面试官提供的 token；`read` 输入不会作为命令写入 shell 历史，但输入时会显示在终端。

```bash
API_URL="https://moodio-interview-api.vercel.app"
read -r INTERVIEW_TOKEN
```

### 健康检查

`GET /api/health` 不需要 token，用于检查服务是否响应，不检查画布存储。

```bash
curl -sS "$API_URL/api/health"
```

成功返回 `200`：

```json
{ "status": "ok" }
```

健康检查只支持 GET；其他方法返回 `405` 和 `{ "error": "Method not allowed." }`。

### 读取画布

`GET /api/cards` 不需要请求体，返回当前会话的卡片。

```bash
curl -sS "$API_URL/api/cards" \
  -H "Authorization: Bearer $INTERVIEW_TOKEN"
```

成功返回 `200`；下面是返回结构的示例：

```json
{
  "cards": [
    { "id": "scene-1", "title": "Quiet morning", "image": "/images/morning.svg" }
  ]
}
```

`cards` 是卡片数组，包含初始卡片及当前会话保存的副本；`id` 是卡片标识，`title` 是标题，`image` 是前端图片路径。

### 复制卡片

`POST /api/cards/:id/copy` 中的 `:id` 是当前会话中的源卡片 ID，例如 `scene-1` 或之前返回的副本 ID。请求不需要请求体。

```bash
curl -sS -X POST "$API_URL/api/cards/scene-1/copy" \
  -H "Authorization: Bearer $INTERVIEW_TOKEN"
```

成功返回 `201`，`card` 是服务端保存的副本：

```json
{
  "card": { "id": "<服务端生成的 ID>", "title": "Quiet morning copy", "image": "/images/morning.svg" }
}
```

每次新的复制操作生成一个服务端 ID。副本属于当前会话，后续 `GET /api/cards` 会返回它。

#### 可选请求头

`Idempotency-Key`：1–128 个 ASCII 字母、数字或 `.`、`_`、`~`、`-`。在同一会话内，相同键和源卡片返回相同副本；同一个键用于不同源卡片返回 `409`。不带该请求头时，每次请求创建新的副本。幂等记录保留至会话数据被清理。

### 错误响应

画布接口的错误响应为 `{ "error": "..." }`：

| 状态码 | 含义 | 示例 |
| --- | --- | --- |
| `400` | 幂等键格式无效 | `{ "error": "Invalid idempotency key." }` |
| `401` | token 缺失、无效或过期 | `{ "error": "Token is invalid or expired." }` |
| `404` | 源卡片不存在 | `{ "error": "Card not found." }` |
| `409` | 同一会话中的幂等键已用于另一张源卡片 | `{ "error": "Idempotency key was used for another card." }` |
| `503` | 画布服务或存储暂时不可用 | `{ "error": "The canvas is temporarily unavailable." }` |

如果 token 过期，请向面试官申请新 token。预检来自不允许的来源时返回 `403`，其他不匹配的画布请求可能返回 `404`。
