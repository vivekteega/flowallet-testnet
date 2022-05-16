(function(EXPORTS) { //floTokenAPI v1.0.1
    /* Token Operator to send/receive tokens via blockchain using API calls*/
    'use strict';
    const tokenAPI = EXPORTS;

    const fetch_api = tokenAPI.fetch = function(apicall) {
        return new Promise((resolve, reject) => {
            console.log(floGlobals.tokenURL + apicall);
            fetch(floGlobals.tokenURL + apicall).then(response => {
                if (response.ok)
                    response.json().then(data => resolve(data));
                else
                    reject(response)
            }).catch(error => reject(error))
        })
    }

    const getBalance = tokenAPI.getBalance = function(floID, token = floGlobals.currency) {
        return new Promise((resolve, reject) => {
            fetch_api(`api/v1.0/getFloAddressBalance?token=${token}&floAddress=${floID}`)
                .then(result => resolve(result.balance || 0))
                .catch(error => reject(error))
        })
    }

    tokenAPI.getTx = function(txID) {
        return new Promise((resolve, reject) => {
            fetch_api(`api/v1.0/getTransactionDetails/${txID}`).then(res => {
                if (res.result === "error")
                    reject(res.description);
                else if (!res.parsedFloData)
                    reject("Data piece (parsedFloData) missing");
                else if (!res.transactionDetails)
                    reject("Data piece (transactionDetails) missing");
                else
                    resolve(res);
            }).catch(error => reject(error))
        })
    }

    tokenAPI.sendToken = function(privKey, amount, receiverID, message = "", token = floGlobals.currency, options = {}) {
        return new Promise((resolve, reject) => {
            let senderID = floCrypto.getFloID(privKey);
            if (typeof amount !== "number" || amount <= 0)
                return reject("Invalid amount");
            getBalance(senderID, token).then(bal => {
                if (amount > bal)
                    return reject(`Insufficient ${token}# balance`);
                floBlockchainAPI.writeData(senderID, `send ${amount} ${token}# ${message}`, privKey, receiverID, options)
                    .then(txid => resolve(txid))
                    .catch(error => reject(error))
            }).catch(error => reject(error))
        });
    }

})('object' === typeof module ? module.exports : window.floTokenAPI = {});