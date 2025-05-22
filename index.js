const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const WebSocket = require('ws');

class JupiterMonitor {
    constructor(config = {}) {
        this.connection = new Connection(
            config.rpcEndpoint || 'https://api.mainnet-beta.solana.com',
            'confirmed'
        );
        this.targetToken = config.targetToken;
        this.jupiterProgramId = new PublicKey('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4');
        this.isRunning = false;
        this.transactionCache = new Set();
    }

    async start() {
        console.log('🚀 Starting Jupiter DEX Monitor...');
        if (this.targetToken) {
            console.log(`📊 Monitoring trades for token: ${this.targetToken}`);
        } else {
            console.log('📊 Monitoring all Jupiter trades');
        }
        
        this.isRunning = true;
        await this.monitorTransactions();
    }

    stop() {
        console.log('⏹️  Stopping Jupiter DEX Monitor...');
        this.isRunning = false;
    }

    async monitorTransactions() {
        while (this.isRunning) {
            try {
                const signatures = await this.connection.getSignaturesForAddress(
                    this.jupiterProgramId,
                    { limit: 10 }
                );

                for (const sigInfo of signatures) {
                    if (this.transactionCache.has(sigInfo.signature)) {
                        continue;
                    }

                    this.transactionCache.add(sigInfo.signature);
                    
                    if (this.transactionCache.size > 1000) {
                        const oldestEntries = Array.from(this.transactionCache).slice(0, 100);
                        oldestEntries.forEach(sig => this.transactionCache.delete(sig));
                    }

                    await this.processTransaction(sigInfo.signature);
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error('❌ Error monitoring transactions:', error.message);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    async processTransaction(signature) {
        try {
            const transaction = await this.connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0
            });

            if (!transaction) return;

            const tradeData = await this.extractTradeData(transaction);
            if (tradeData) {
                this.logTrade(tradeData, signature);
            }
        } catch (error) {
            console.error(`❌ Error processing transaction ${signature}:`, error.message);
        }
    }

    async extractTradeData(transaction) {
        const preBalances = transaction.meta.preBalances;
        const postBalances = transaction.meta.postBalances;
        const accountKeys = transaction.transaction.message.accountKeys;
        
        let tradeFound = false;
        const trades = [];

        for (let i = 0; i < preBalances.length; i++) {
            const balanceChange = postBalances[i] - preBalances[i];
            if (Math.abs(balanceChange) > 1000) {
                const account = accountKeys[i];
                if (account) {
                    trades.push({
                        account: account.toBase58(),
                        balanceChange: balanceChange / 1e9,
                        isSOL: true
                    });
                    tradeFound = true;
                }
            }
        }

        if (transaction.meta.preTokenBalances && transaction.meta.postTokenBalances) {
            const tokenChanges = this.calculateTokenChanges(
                transaction.meta.preTokenBalances,
                transaction.meta.postTokenBalances
            );

            for (const change of tokenChanges) {
                if (this.targetToken && change.mint !== this.targetToken) {
                    continue;
                }

                trades.push({
                    account: change.owner,
                    mint: change.mint,
                    balanceChange: change.change,
                    decimals: change.decimals,
                    isSOL: false
                });
                tradeFound = true;
            }
        }

        return tradeFound ? {
            trades,
            blockTime: transaction.blockTime,
            slot: transaction.slot
        } : null;
    }

    calculateTokenChanges(preTokenBalances, postTokenBalances) {
        const changes = [];
        const accountMap = new Map();

        preTokenBalances.forEach(balance => {
            const key = `${balance.owner}-${balance.mint}`;
            accountMap.set(key, { 
                pre: parseFloat(balance.uiTokenAmount.uiAmountString || '0'),
                decimals: balance.uiTokenAmount.decimals,
                mint: balance.mint,
                owner: balance.owner
            });
        });

        postTokenBalances.forEach(balance => {
            const key = `${balance.owner}-${balance.mint}`;
            const existing = accountMap.get(key) || { 
                pre: 0, 
                decimals: balance.uiTokenAmount.decimals,
                mint: balance.mint,
                owner: balance.owner
            };
            
            const post = parseFloat(balance.uiTokenAmount.uiAmountString || '0');
            const change = post - existing.pre;
            
            if (Math.abs(change) > 0.0001) {
                changes.push({
                    owner: balance.owner,
                    mint: balance.mint,
                    change: change,
                    decimals: balance.uiTokenAmount.decimals
                });
            }
        });

        return changes;
    }

    logTrade(tradeData, signature) {
        const timestamp = tradeData.blockTime ? new Date(tradeData.blockTime * 1000).toISOString() : 'Unknown';
        
        console.log('\n🔄 Jupiter Trade Detected:');
        console.log(`📅 Time: ${timestamp}`);
        console.log(`🔗 Signature: ${signature}`);
        console.log(`📦 Slot: ${tradeData.slot}`);
        
        tradeData.trades.forEach((trade, index) => {
            if (trade.isSOL) {
                console.log(`💰 SOL Change: ${trade.balanceChange.toFixed(6)} SOL`);
            } else {
                const tokenSymbol = this.getTokenSymbol(trade.mint);
                console.log(`🪙 Token: ${tokenSymbol} (${trade.mint.slice(0, 8)}...)`);
                console.log(`📊 Amount: ${trade.balanceChange.toFixed(6)}`);
            }
        });
        
        console.log('─'.repeat(60));
    }

    getTokenSymbol(mint) {
        const knownTokens = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
            'So11111111111111111111111111111111111111112': 'SOL',
            'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK'
        };
        return knownTokens[mint] || 'Unknown';
    }

    async getTokenInfo(mint) {
        try {
            const response = await axios.get(`https://api.jup.ag/price/v2?ids=${mint}`);
            return response.data.data[mint];
        } catch (error) {
            return null;
        }
    }
}

if (require.main === module) {
    const readline = require('readline');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('🚀 Jupiter DEX Monitor');
    console.log('Enter token contract address to monitor (or press Enter to monitor all tokens):');
    
    rl.question('Token Contract: ', (tokenContract) => {
        rl.close();
        
        const config = {
            targetToken: tokenContract.trim() || process.env.TARGET_TOKEN || null,
            rpcEndpoint: process.env.RPC_ENDPOINT || null
        };

        const monitor = new JupiterMonitor(config);
        
        process.on('SIGINT', () => {
            monitor.stop();
            process.exit(0);
        });
        
        monitor.start().catch(console.error);
    });
}

module.exports = JupiterMonitor;