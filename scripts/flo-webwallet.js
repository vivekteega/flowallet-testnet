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

    //get balance of address using API : resolves (balance)
    floWebWallet.getBalance = function (address) {
        return new Promise((resolve, reject) => {
            floBlockchainAPI.getBalance(address)
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

    function listTransactions_raw(address, options = {}) {
        return new Promise((resolve, reject) => {
            options.latest = true;
            floBlockchainAPI.readTxs(address, options).then(response => {
                const result = {}
                result.items = response.items.map(({ time, txid, floData, isCoinBase, vin, vout }) => ({
                    time, txid, floData, isCoinBase,
                    sender: isCoinBase ? `(mined)${vin[0].coinbase}` : vin[0].addr,
                    receiver: isCoinBase ? address : vout[0].scriptPubKey.addresses[0]
                }));
                result.lastItem = response.lastItem;
                result.initItem = response.initItem;
                resolve(result);
            }).catch(error => reject(error))
        })
    }


    floWebWallet.listTransactions = function (address) {
        return new Promise((resolve, reject) => {
            listTransactions_raw(address)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    }


    floWebWallet.listTransactions.syncNew = function (address, lastItem) {
        return new Promise((resolve, reject) => {
            listTransactions_raw(address, { after: lastItem }).then(result => {
                delete result.initItem;
                resolve(result);
            }).catch(error => reject(error))
        })
    }

    floWebWallet.listTransactions.syncOld = function (address, initItem) {
        return new Promise((resolve, reject) => {
            listTransactions_raw(address, { before: initItem }).then(result => {
                delete result.lastItem;
                resolve(result);
            }).catch(error => reject(error))
        })
    }

    //get address-label pairs from IDB : resolves Object(floID:label)
    floWebWallet.getLabels = function () {
        return new Promise((resolve, reject) => {
            compactIDB.readAllData('labels')
                .then(IDBresult => resolve(IDBresult))
                .catch(error => reject(error))
        })
    }

    //bulk transfer tokens
    floWebWallet.bulkTransferTokens = function (sender, privKey, token, receivers) {
        return new Promise((resolve, reject) => {
            floTokenAPI.bulkTransferTokens(sender, privKey, token, receivers)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    }

})(window.floWebWallet = {});