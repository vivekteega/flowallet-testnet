(function (EXPORTS) {
    /*FLO Web Wallet operations*/
    'use strict';
    const floWebWallet = EXPORTS;

    //generate a new Address triplet : resolves Object(floID,pubKey,privKey)
    floWebWallet.generateNewAddr = function () {
        return new Promise((resolve, reject) => {
            try {
                var triplet = floCrypto.generateNewID();
                resolve(triplet);
            } catch (error) {
                reject(error);
            }
        })
    }

    //recover triplet from given privKey : resolves Object(floID,pubKey,privKey)
    floWebWallet.recoverAddr = function (privKey) {
        return new Promise((resolve, reject) => {
            try {
                var triplet = {}
                triplet.privKey = privKey;
                triplet.pubKey = floCrypto.getPubKeyHex(triplet.privKey);
                triplet.floID = floCrypto.getFloID(triplet.pubKey);
                resolve(triplet);
            } catch (error) {
                reject(error);
            }
        })
    }

    //get balance of addr using API : resolves (balance)
    floWebWallet.getBalance = function (addr) {
        return new Promise((resolve, reject) => {
            floBlockchainAPI.getBalance(addr)
                .then(txid => resolve(txid))
                .catch(error => reject(error))
        })
    }

    //send transaction to the blockchain using API : resolves (txid)
    floWebWallet.sendTransaction = function (sender, receiver, amount, floData, privKey) {
        return new Promise((resolve, reject) => {
            floBlockchainAPI.sendTx(sender, receiver, amount, privKey, floData)
                .then(txid => resolve(txid))
                .catch(error => reject(error))
        })
    }

    //sync new transactions from blockchain using API and stores in IDB : resolves Array(newItems)
    floWebWallet.syncTransactions = function (addr) {
        return new Promise((resolve, reject) => {
            compactIDB.readData('lastSync', addr).then(lastSync => {
                lastSync = lastSync | 0;
                getNewTxs(addr, lastSync).then(APIresult => {
                    compactIDB.readData('transactions', addr).then(IDBresult => {
                        if (IDBresult === undefined)
                            var promise1 = compactIDB.addData('transactions', APIresult.items, addr)
                        else
                            var promise1 = compactIDB.writeData('transactions', IDBresult.concat(APIresult.items), addr)
                        var promise2 = compactIDB.writeData('lastSync', APIresult.totalItems, addr)
                        Promise.all([promise1, promise2]).then(values => resolve(APIresult.items))
                    })
                })
            }).catch(error => reject(error))
        })
    }

    //Get new Tx in blockchain since last sync using API
    async function getNewTxs(addr, ignoreOld) {
        try {
            const { totalItems } = await floBlockchainAPI.readTxs(addr, 0, 1);
            const newItems = totalItems - ignoreOld;
            if (newItems > 0) {
                const { items: newTxs } = await floBlockchainAPI.readTxs(addr, 0, newItems * 2);
                const filteredData = []
                newTxs
                    .slice(0, newItems)
                    .forEach(({ time, txid, floData, isCoinBase, vin, vout }) => {
                        const sender = isCoinBase ? `(mined)${vin[0].coinbase}` : vin[0].addr;
                        const receiver = isCoinBase ? addr : vout[0].scriptPubKey.addresses[0];
                        filteredData.unshift({ time, txid, floData, sender, receiver });
                    })
                return { totalItems, items: filteredData };
            } else {
                return { totalItems, items: [] };
            }
        } catch (error) {
            throw new Error(`Failed to get new transactions for ${addr}: ${error.message}`);
        }
    }


    //read transactions stored in IDB : resolves Array(storedItems)
    floWebWallet.readTransactions = function (addr) {
        return new Promise((resolve, reject) => {
            compactIDB.readData('transactions', addr)
                .then(IDBresult => resolve(IDBresult))
                .catch(error => reject(error))
        })
    }

    //get address-label pairs from IDB : resolves Object(addr:label)
    floWebWallet.getLabels = function () {
        return new Promise((resolve, reject) => {
            compactIDB.readAllData('labels')
                .then(IDBresult => resolve(IDBresult))
                .catch(error => reject(error))
        })
    }

    function waitForConfirmation(txid, max_retry = -1, retry_timeout = 20) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                floBlockchainAPI.getTx(txid).then(tx => {
                    if (!tx)
                        return reject("Transaction not found");
                    if (tx.confirmations)
                        return resolve(tx);
                    else if (max_retry === 0)    //no more retries
                        return reject(false);
                    else {
                        max_retry = max_retry < 0 ? -1 : max_retry - 1; //decrease retry count (unless infinite retries)
                        waitForConfirmation(txid, max_retry, retry_timeout)
                            .then(result => resolve(result))
                            .catch(error => reject(error))
                    }
                }).catch(error => reject(error))
            }, retry_timeout * 1000)
        })
    }

    function sendRawTransaction(receiver, utxo, vout, scriptPubKey, data, wif) {
        var trx = bitjs.transaction();
        trx.addinput(utxo, vout, scriptPubKey)
        trx.addoutput(receiver, floBlockchainAPI.sendAmt);
        trx.addflodata(data);
        var signedTxHash = trx.sign(wif, 1);
        return floBlockchainAPI.broadcastTx(signedTxHash);
    }

    function sendTokens_raw(privKey, receiverID, token, amount, utxo, vout, scriptPubKey) {
        return new Promise((resolve, reject) => {
            sendRawTransaction(receiverID, utxo, vout, scriptPubKey, `send ${amount} ${token}#`, privKey)
                .then(txid => resolve([receiverID, txid]))
                .catch(error => reject([receiverID, error]))
        })
    }

    //bulk transfer tokens
    floWebWallet.bunkTransferTokens = function (sender, privKey, token, receivers) {
        return new Promise((resolve, reject) => {
            if (typeof receivers !== 'object')
                return reject("receivers must be object in format {receiver1: amount1, receiver2:amount2...}")

            let receiver_list = Object.keys(receivers), amount_list = Object.values(receivers);
            let invalidReceivers = receiver_list.filter(id => !floCrypto.validateFloID(id));
            let invalidAmount = amount_list.filter(val => typeof val !== 'number' || val <= 0);
            if (invalidReceivers.length)
                return reject(`Invalid receivers: ${invalidReceivers}`);
            else if (invalidAmount.length)
                return reject(`Invalid amounts: ${invalidAmount}`);

            //check for token balance
            floTokenAPI.getBalance(sender, token).then(token_balance => {
                let total_token_amout = amount_list.reduce((a, e) => a + e, 0);
                if (total_token_amout > token_balance)
                    return reject(`Insufficient ${token}# balance`);

                //split utxos
                floBlockchainAPI.splitUTXOs(sender, privKey, receiver_list.length).then(split_txid => {
                    //wait for the split utxo to get confirmation
                    waitForConfirmation(split_txid).then(split_tx => {
                        //send tokens using the split-utxo
                        var scriptPubKey = split_tx.vout[0].scriptPubKey.hex;
                        let promises = [];
                        for (let i in receiver_list)
                            promises.push(sendTokens_raw(privKey, receiver_list[i], token, amount_list[i], split_txid, i, scriptPubKey));
                        Promise.allSettled(promises).then(results => {
                            let success = Object.fromEntries(results.filter(r => r.status == 'fulfilled').map(r => r.value));
                            let failed = Object.fromEntries(results.filter(r => r.status == 'rejected').map(r => r.reason));
                            resolve(success, failed);
                        })
                    }).catch(error => reject(error))
                }).catch(error => reject(error))

            }).catch(error => reject(error))


        })
    }

})(window.floWebWallet = {});