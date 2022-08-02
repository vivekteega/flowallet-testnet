(function(EXPORTS) { //btcOperator v1.0.7
    /* BTC Crypto and API Operator */
    const btcOperator = EXPORTS;

    //This library uses API provided by chain.so (https://chain.so/)
    const URL = "https://chain.so/api/v2/";

    const fetch_api = btcOperator.fetch = function(api) {
        return new Promise((resolve, reject) => {
            console.debug(URL + api);
            fetch(URL + api).then(response => {
                response.json()
                    .then(result => result.status === "success" ? resolve(result) : reject(result))
                    .catch(error => reject(error))
            }).catch(error => reject(error))
        })
    };

    const broadcast = btcOperator.broadcast = rawtx => new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: URL + "send_tx/BTC/",
            data: {
                "tx_hex": rawtx
            },
            dataType: "json",
            error: e => reject(e.responseJSON),
            success: r => r.status === "success" ? resolve(r.data) : reject(r)
        })
    });

    Object.defineProperties(btcOperator, {
        newKeys: {
            get: () => {
                let r = coinjs.newKeys();
                r.segwitAddress = coinjs.segwitAddress(r.pubkey).address;
                r.bech32Address = coinjs.bech32Address(r.pubkey).address;
                return r;
            }
        },
        pubkey: {
            value: key => key.length >= 66 ? key : (key.length == 64 ? coinjs.newPubkey(key) : coinjs.wif2pubkey(key).pubkey)
        },
        address: {
            value: (key, prefix = undefined) => coinjs.pubkey2address(btcOperator.pubkey(key), prefix)
        },
        segwitAddress: {
            value: key => coinjs.segwitAddress(btcOperator.pubkey(key)).address
        },
        bech32Address: {
            value: key => coinjs.bech32Address(btcOperator.pubkey(key)).address
        }
    });

    coinjs.compressed = true;

    const verifyKey = btcOperator.verifyKey = function(addr, key) {
        if (!addr || !key)
            return undefined;
        switch (coinjs.addressDecode(addr).type) {
            case "standard":
                return btcOperator.address(key) === addr;
            case "multisig":
                return btcOperator.segwitAddress(key) === addr;
            case "bech32":
                return btcOperator.bech32Address(key) === addr;
            default:
                return null;
        }
    }

    const validateAddress = btcOperator.validateAddress = function(addr) {
        if (!addr)
            return undefined;
        let type = coinjs.addressDecode(addr).type;
        if (["standard", "multisig", "bech32"].includes(type))
            return type;
        else
            return false;
    }

    //convert from one blockchain to another blockchain (target version)
    btcOperator.convert = {};

    btcOperator.convert.wif = function(source_wif, target_version = coinjs.priv) {
        let keyHex = decodeLegacy(source_wif).hex;
        if (!keyHex || keyHex.length < 66 || !/01$/.test(keyHex))
            return null;
        else
            return encodeLegacy(keyHex, target_version);
    }

    btcOperator.convert.legacy2legacy = function(source_addr, target_version = coinjs.pub) {
        let rawHex = decodeLegacy(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeLegacy(rawHex, target_version);
    }

    btcOperator.convert.legacy2bech = function(source_addr, target_version = coinjs.bech32.version, target_hrp = coinjs.bech32.hrp) {
        let rawHex = decodeLegacy(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeBech32(rawHex, target_version, target_hrp);
    }

    btcOperator.convert.bech2bech = function(source_addr, target_version = coinjs.bech32.version, target_hrp = coinjs.bech32.hrp) {
        let rawHex = decodeBech32(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeBech32(rawHex, target_version, target_hrp);
    }

    btcOperator.convert.bech2legacy = function(source_addr, target_version = coinjs.pub) {
        let rawHex = decodeBech32(source_addr).hex;
        if (!rawHex)
            return null;
        else
            return encodeLegacy(rawHex, target_version);
    }

    function decodeLegacy(source) {
        var decode = coinjs.base58decode(source);
        var raw = decode.slice(0, decode.length - 4),
            checksum = decode.slice(decode.length - 4);
        var hash = Crypto.SHA256(Crypto.SHA256(raw, {
            asBytes: true
        }), {
            asBytes: true
        });
        if (hash[0] != checksum[0] || hash[1] != checksum[1] || hash[2] != checksum[2] || hash[3] != checksum[3])
            return null;
        let version = raw.shift();
        return {
            version: version,
            hex: Crypto.util.bytesToHex(raw)
        }
    }

    function encodeLegacy(hex, version) {
        var bytes = Crypto.util.hexToBytes(hex);
        bytes.unshift(version);
        var hash = Crypto.SHA256(Crypto.SHA256(bytes, {
            asBytes: true
        }), {
            asBytes: true
        });
        var checksum = hash.slice(0, 4);
        return coinjs.base58encode(bytes.concat(checksum));
    }

    function decodeBech32(source) {
        let decode = coinjs.bech32_decode(source);
        if (!decode)
            return null;
        var raw = decode.data;
        let version = raw.shift();
        raw = coinjs.bech32_convert(raw, 5, 8, false);
        return {
            hrp: decode.hrp,
            version: version,
            hex: Crypto.util.bytesToHex(raw)
        }
    }

    function encodeBech32(hex, version, hrp) {
        var bytes = Crypto.util.hexToBytes(hex);
        bytes = coinjs.bech32_convert(bytes, 8, 5, true);
        bytes.unshift(version)
        return coinjs.bech32_encode(hrp, bytes);
    }

    //BTC blockchain APIs

    btcOperator.getBalance = addr => new Promise((resolve, reject) => {
        fetch_api(`get_address_balance/BTC/${addr}`)
            .then(result => resolve(parseFloat(result.data.confirmed_balance)))
            .catch(error => reject(error))
    });

    function _redeemScript(addr, key) {
        let decode = coinjs.addressDecode(addr);
        switch (decode.type) {
            case "standard":
                return false;
            case "multisig":
                return key ? coinjs.segwitAddress(btcOperator.pubkey(key)).redeemscript : null;
            case "bech32":
                return decode.redeemscript;
            default:
                return null;
        }
    }

    function validateTxParameters(parameters) {
        let invalids = [];
        //sender-ids
        if (parameters.senders) {
            if (!Array.isArray(parameters.senders))
                parameters.senders = [parameters.senders];
            parameters.senders.forEach(id => !validateAddress(id) ? invalids.push(id) : null);
            if (invalids.length)
                throw "Invalid senders:" + invalids;
        }
        if (parameters.privkeys) {
            if (!Array.isArray(parameters.privkeys))
                parameters.privkeys = [parameters.privkeys];
            if (parameters.senders.length != parameters.privkeys.length)
                throw "Array length for senders and privkeys should be equal";
            parameters.senders.forEach((id, i) => {
                let key = parameters.privkeys[i];
                if (!verifyKey(id, key)) //verify private-key
                    invalids.push(id);
                if (key.length === 64) //convert Hex to WIF if needed
                    parameters.privkeys[i] = coinjs.privkey2wif(key);
            });
            if (invalids.length)
                throw "Invalid keys:" + invalids;
        }
        //receiver-ids (and change-id)
        if (!Array.isArray(parameters.receivers))
            parameters.receivers = [parameters.receivers];
        parameters.receivers.forEach(id => !validateAddress(id) ? invalids.push(id) : null);
        if (invalids.length)
            throw "Invalid receivers:" + invalids;
        if (parameters.change_addr && !validateAddress(parameters.change_addr))
            throw "Invalid change_address:" + parameters.change_addr;
        //fee and amounts
        if (typeof parameters.fee !== "number" || parameters.fee <= 0)
            throw "Invalid fee:" + parameters.fee;
        if (!Array.isArray(parameters.amounts))
            parameters.amounts = [parameters.amounts];
        if (parameters.receivers.length != parameters.amounts.length)
            throw "Array length for receivers and amounts should be equal";
        parameters.amounts.forEach(a => typeof a !== "number" || a <= 0 ? invalids.push(a) : null);
        if (invalids.length)
            throw "Invalid amounts:" + invalids;
        //return
        return parameters;
    }

    function addUTXOs(tx, senders, redeemScripts, required_amount, n = 0) {
        return new Promise((resolve, reject) => {
            required_amount = parseFloat(required_amount.toFixed(8));
            if (required_amount <= 0 || n >= senders.length)
                return resolve(required_amount);
            let addr = senders[n],
                rs = redeemScripts[n];
            fetch_api(`get_tx_unspent/BTC/${addr}`).then(result => {
                let utxos = result.data.txs;
                console.debug("add-utxo", addr, rs, required_amount, utxos);
                for (let i = 0; i < utxos.length && required_amount > 0; i++) {
                    if (!utxos[i].confirmations) //ignore unconfirmed utxo
                        continue;
                    required_amount -= parseFloat(utxos[i].value);
                    var script;
                    if (rs) { //redeemScript for segwit/bech32
                        let s = coinjs.script();
                        s.writeBytes(Crypto.util.hexToBytes(rs));
                        s.writeOp(0);
                        s.writeBytes(coinjs.numToBytes((utxos[i].value * 100000000).toFixed(0), 8));
                        script = Crypto.util.bytesToHex(s.buffer);
                    } else //legacy script
                        script = utxos[i].script_hex;
                    tx.addinput(utxos[i].txid, utxos[i].output_no, script, 0xfffffffd /*sequence*/ ); //0xfffffffd for Replace-by-fee
                }
                addUTXOs(tx, senders, redeemScripts, required_amount, n + 1)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            }).catch(error => reject(error))
        })
    }

    function addOutputs(tx, receivers, amounts, change, change_addr) {
        for (let i in receivers)
            tx.addoutput(receivers[i], amounts[i]);
        if (parseFloat(change.toFixed(8)) > 0)
            tx.addoutput(change_addr || senders[0], change);
    }

    btcOperator.sendTx = function(senders, privkeys, receivers, amounts, fee, change_addr = null) {
        return new Promise((resolve, reject) => {
            try {
                ({
                    senders,
                    receivers,
                    amounts
                } = validateTxParameters({
                    senders,
                    privkeys,
                    receivers,
                    amounts,
                    fee,
                    change_addr
                }));
            } catch (e) {
                return reject(e)
            }
            let total_amount = parseFloat(amounts.reduce((t, a) => t + a, 0).toFixed(8)),
                redeemScripts = [],
                wif_keys = [];
            for (let i in senders) {
                let rs = _redeemScript(senders[i], privkeys[i]); //get redeem-script (segwit/bech32)
                redeemScripts.push(rs);
                rs === false ? wif_keys.unshift(privkeys[i]) : wif_keys.push(privkeys[i]); //sorting private-keys (wif)
            }
            if (redeemScripts.includes(null)) //TODO: segwit
                return reject("Unable to get redeem-script");

            //create transaction
            const tx = coinjs.transaction();
            addUTXOs(tx, senders, redeemScripts, total_amount + fee).then(result => {
                if (result > 0)
                    return reject("Insufficient Balance");
                addOutputs(tx, receivers, amounts, Math.abs(result), change_addr || senders[0])
                console.debug("Unsigned:", tx.serialize());
                new Set(wif_keys).forEach(key => console.debug("Signing key:", key, tx.sign(key, 1 /*sighashtype*/ ))); //Sign the tx using private key WIF

                console.debug("Signed:", tx.serialize());
                debugger;
                broadcast(tx.serialize())
                    .then(result => resolve(result))
                    .catch(error => reject(error));
            });
        })
    }

    btcOperator.createTx = function(senders, receivers, amounts, fee, change_addr = null) {
        return new Promise((resolve, reject) => {
            try {
                ({
                    senders,
                    receivers,
                    amounts
                } = validateTxParameters({
                    senders,
                    receivers,
                    amounts,
                    fee,
                    change_addr
                }));
            } catch (e) {
                return reject(e)
            }
            let total_amount = parseFloat(amounts.reduce((t, a) => t + a, 0).toFixed(8)),
                redeemScripts = senders.map(id => _redeemScript(id));
            if (redeemScripts.includes(null)) //TODO: segwit
                return reject("Unable to get redeem-script");

            //create transaction
            const tx = coinjs.transaction();
            addUTXOs(tx, senders, redeemScripts, total_amount + fee).then(result => {
                if (result > 0)
                    return reject("Insufficient Balance");
                addOutputs(tx, receivers, amounts, Math.abs(result), change_addr || senders[0])
                resolve(tx.serialize());
            })
        })
    }

    btcOperator.createMultiSigTx = function(sender, redeemScript, receivers, amounts, fee) {
        return new Promise((resolve, reject) => {

            //validate tx parameters
            if (validateAddress(sender) !== "multisig")
                return reject("Invalid sender (multisig):" + sender);
            else {
                let script = coinjs.script();
                let decode = script.decodeRedeemScript(redeemScript);
                if (!decode || decode.address !== sender)
                    return reject("Invalid redeem-script");
            }
            try {
                ({
                    receivers,
                    amounts
                } = validateTxParameters({
                    receivers,
                    amounts,
                    fee,
                    change_addr
                }));
            } catch (e) {
                return reject(e)
            }
            let total_amount = parseFloat(amounts.reduce((t, a) => t + a, 0).toFixed(8))

            //create transaction
            const tx = coinjs.transaction();
            addUTXOs(tx, senders, redeemScript, total_amount + fee).then(result => {
                if (result > 0)
                    return reject("Insufficient Balance");
                addOutputs(tx, receivers, amounts, Math.abs(result), sender);
                resolve(tx.serialize());
            })
        })
    }

    btcOperator.getTx = txid => new Promise((resolve, reject) => {
        fetch_api(`get_tx/BTC/${txid}`)
            .then(result => resolve(result.data))
            .catch(error => reject(error))
    });

    btcOperator.getAddressData = addr => new Promise((resolve, reject) => {
        fetch_api(`address/BTC/${addr}`)
            .then(result => resolve(result.data))
            .catch(error => reject(error))
    });

    btcOperator.getBlock = block => new Promise((resolve, reject) => {
        fetch_api(`get_block/BTC/${block}`)
            .then(result => resolve(result.data))
            .catch(error => reject(error))
    });

})('object' === typeof module ? module.exports : window.btcOperator = {});