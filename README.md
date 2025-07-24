if (!currentHolding) {
      for (const signal of signals) {
        const tokenSymbol = signal.pairName.split('/')[0];
        const tokenAddress = signal.pairAddress;

        if (signal.signal !== 'Buy' || tradedTokens.has(tokenSymbol)) continue;

        console.log(`Processing buy signal for ${tokenSymbol}...`);

        // Add token to local map if not known
        if (!tokenMap[tokenSymbol]) {
          tokenMap[tokenSymbol] = tokenAddress;
          console.log(`📝 Added ${tokenSymbol} to local tokenMap.`);
        }

        // Add to allowed tokens
        try {
          await sendTransaction(
            contractInstance.addNewAsset(tokenSymbol, tokenAddress),
            `Adding asset: ${tokenSymbol}`
          );
        } catch (err) {
          console.error(`❌ Failed to add ${tokenSymbol}:`, err.message);
          continue;
        }

        // Set approval
        try {
          await sendTransaction(
            contractInstance.setAssets(tokenAddress),
            `Approving: ${tokenSymbol}`
          );
        } catch (err) {
          console.error(`❌ Failed to approve ${tokenSymbol}:`, err.message);
          continue;
        }

        // Execute buy
        const depositBalance = await contractInstance.getDepositBalance(BASE_TOKEN_ADDRESS);
        if (depositBalance > 0n) {
          const deadline = Math.floor(Date.now() / 1000) + 300;
          const minAmountOut = await getMinAmountOut(BASE_TOKEN_ADDRESS, tokenAddress, depositBalance, 0.5);

          const buySuccess = await sendTransaction(
            contractInstance.buyASSET(
              BASE_TOKEN_ADDRESS,
              depositBalance,
              tokenAddress,
              minAmountOut,
              deadline
            ),
            `Buying ${tokenSymbol}`
          );

          if (buySuccess) {
            boughtPrice = await getTokenPrice(tokenAddress, BASE_TOKEN_ADDRESS);
            currentHolding = tokenSymbol;
            console.log(`✅ Bought ${tokenSymbol} at ${boughtPrice}`);
            await saveBotState();
            break;
          }
        } else {
          console.log(`ℹ️ Buy attempt for ${tokenSymbol} failed. Adding to tradedTokens for this session.`);
            tradedTokens.add(tokenSymbol); // Mark as tried and failed for this session
            await saveBotState();
        }
      }
    }