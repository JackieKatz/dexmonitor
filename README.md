# Jupiter DEX Monitor

Real-time monitoring of cryptocurrency trading activity on Jupiter DEX.

## Features

- 🔄 Real-time Jupiter DEX transaction monitoring
- 🪙 Monitor specific tokens or all token trades
- 📊 Display trade details including balance changes
- ⚡ Efficient transaction caching mechanism
- 🛡️ Error handling and automatic reconnection

## Installation

```bash
npm install
```

## Configuration

1. Copy the environment variables file:
```bash
cp .env.example .env
```

2. Edit the `.env` file to set the token you want to monitor:
```bash
# Monitor specific token (e.g., USDC)
TARGET_TOKEN=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Or leave empty to monitor all tokens
TARGET_TOKEN=
```

## Usage

### Monitor all token trades
```bash
npm start
```

### Monitor specific token trades
```bash
TARGET_TOKEN=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v npm start
```

### Common Token Addresses

- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- **BONK**: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`

## Sample Output

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

## Stopping the Monitor

Press `Ctrl+C` to stop the monitoring program.