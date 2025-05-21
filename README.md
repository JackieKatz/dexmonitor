# Jupiter DEX Monitor

监控 Jupiter DEX 上特定代币的交易活动。

## 功能特性

- 🔄 实时监控 Jupiter DEX 交易
- 🪙 支持监控特定代币或所有代币
- 📊 显示交易详情包括金额变化
- ⚡ 高效的交易缓存机制
- 🛡️ 错误处理和自动重连

## 安装

```bash
npm install
```

## 配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件设置要监控的代币：
```bash
# 监控特定代币 (例如 USDC)
TARGET_TOKEN=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# 或留空监控所有代币
TARGET_TOKEN=
```

## 运行

### 监控所有代币交易
```bash
npm start
```

### 监控特定代币
```bash
TARGET_TOKEN=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v npm start
```

### 常用代币地址

- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- **BONK**: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`

## 输出示例

```
🚀 Starting Jupiter DEX Monitor...
📊 Monitoring trades for token: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

🔄 Jupiter Trade Detected:
📅 Time: 2025-01-15T10:30:45.123Z
🔗 Signature: 5KJh7n2...xyz123
📦 Slot: 12345678
💰 SOL Change: -0.045000 SOL
🪙 Token: USDC (EPjFWdd5...)
📊 Amount: +100.500000
────────────────────────────────────────────────────────
```

## 停止监控

按 `Ctrl+C` 停止监控程序。