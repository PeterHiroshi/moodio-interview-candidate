# 画布交互练习

[English](README.en.md) | 简体中文

## 背景

这是一个简化的图片画布。用户可以查看画布中的图片卡片，并通过 **Copy** 创建一张副本。画布数据由远程 API 保存，每位候选人使用独立的临时会话。

目前复制卡片时，界面要过一段时间才显示结果，用户难以判断操作是否生效。你的任务是改善这段交互，并保持画布与服务端数据一致。

建议用时约 **20 分钟**。面试官会提供临时 token；它从签发时开始计时，约 20 分钟后过期。如果启动时 token 已经失效，请联系面试官。

## 启动项目

需要 Node.js 20 或更高版本，不需要安装依赖。

```bash
git clone https://github.com/PeterHiroshi/moodio-interview-candidate.git
cd moodio-interview-candidate
node serve.mjs
```

在浏览器打开 **http://localhost:4173**，然后：

1. 在 **API address** 中输入 `https://moodio-interview-api.vercel.app`。
2. 在 **Interview token** 中输入面试官提供的 token。
3. 点击 **Connect**；连接成功后，画布会显示三张初始卡片。
4. 点击任意卡片的 **Copy**，观察现有交互，然后开始修改。

请使用 `localhost:4173`，不要改为 `127.0.0.1` 或其他端口：后端当前只允许该前端地址跨域访问。关闭终端或按 `Ctrl+C` 可以停止本地前端服务。

## 任务要求

改善复制卡片时的用户体验。可以修改本仓库内的文件，不需要修改后端，也不限定实现方式。

请考虑以下场景：

- 用户点击复制后能否及时得到反馈。
- 请求成功或失败时，页面是否清晰且与服务端状态一致。
- 用户快速连续复制同一张卡片或不同卡片时，结果是否正确。
- 请求结束后刷新页面，再使用同一个未过期 token 连接，画布是否与服务端一致。

完成后，请向面试官讲解你的方案、取舍，以及没有来得及处理或验证的情况。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `public/index.html` | 页面结构和连接表单 |
| `public/app.js` | 前端请求、状态与卡片交互 |
| `public/style.css` | 页面样式 |
| `public/images/` | 示例图片 |
| `serve.mjs` | 本地静态文件服务 |

## API 说明

所有请求都需要在请求头中携带 `Authorization: Bearer <token>`；响应为 JSON。

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

每次成功复制都会生成一个新的服务端 ID。副本保存在当前会话中，并会在后续 `GET /api/cards` 中返回。

失败时返回非 2xx 状态及 `{ "error": "..." }`。token 无效或过期时返回 `401`，卡片不存在时返回 `404`；服务暂时不可用时可能返回 `503`。如果 token 已过期，向面试官申请新的 token；新 token 对应独立画布，不会继承旧会话的数据。
