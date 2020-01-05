# Standard_Operations
 Standard operations required for FLO Crypto, Blockchain API, Supernode WS, IndexedDB 

This template contains standard operations that can be used for the following:
1. FLO Globals
2. FLO Crypto  Operations 
3. FLO Blockchain API Operations
4. FLO SuperNode Websocket Operations
5. compact IndexedDB Operations

## FLO Globals 
`floGlobals` object contains the global variables and constants required for the operations.  Make sure to add this object before any other scripts.
`floGlobals` contains the following properties :
1. `blockchain` : Indicates the blockchain (`"FLO"` or `"FLO_TEST"`).
2. `apiURL` : Indicates the URL for blockchain API calls. 
3. `adminID` : Indicates the master admin FLO ID for the project.
4. `sendAmt` :  Indicates the default flo amount to be sent while sending transactions into the blockchain
5. `fee` : Indicates the default fee amount to be deduced while sending transactions into the blockchain
6. `supernodes` : Holder for the supernode list. Can be updated in runtime while retriving data from blockchain using API. Stored in the Object format,

		{
			<supernodeFLOID> : {
				uri : <supernodeURI>
				...(otherProperties)
				}
			...(Other Supernodes)
		}

## FLO Crypto Operations
`floCrypto` operations can be used to perform blockchain-cryptography methods. `floCrypto` operations are synchronized and return a value. Contains the following Operations.
#### Generate New FLO ID pair
	floCrypto.generateNewID()
 `generateNewID`  generates a new flo ID and returns private-key, public-key and floID

#### 	Calculate Public Key Hex
`getPubKeyHex` returns public-key from given private-key
	 floCrypto.getPubKeyHex(privateKey)
1. privateKey - private key in WIF format (Hex) 

#### 	Calculate FLO ID
	 floCrypto.getFloIDfromPubkeyHex(publicKey)
`getFloIDfromPubkeyHex` returns flo-ID from public-key
1. publicKey - public key hex value 

#### 	Verify Private Key
	 floCrypto.verifyPrivKey(privateKey, pubKey_floID, *isfloID)
`verifyPrivKey` verify the private-key for the given public-key or flo-ID
1. privateKey - private key in WIF format (Hex) 
2. pubKey_floID - public Key or flo ID
3. isfloID - boolean value (true - compare as flo ID, false - compare as public key) (optional, default is true)

#### 	Validate FLO ID
	 floCrypto.validateAddr(floID)
`validateAddr` check if the given Address is valid or not
1. floID - flo ID to validate 

#### 	Data Encryption
	 floCrypto.encryptData(data, publicKey)
`encryptData` encrypts the given data using public-key
1. data - data to encrypt
2. publicKey - public key of the recipient

#### 	Data Decryption
	 floCrypto.decryptData(data, privateKey)
`decryptData` decrypts the given data using private-key
1. data - encrypted data to decrypt (Object that was returned from encryptData)
2. privateKey - private key of the recipient

#### 	Sign Data
	 floCrypto.signData(data, privateKey)
`signData` signs the data using the private key
1. data - data to sign
2. privateKey - private key of the signer

####  Verify Signature
	 floCrypto.verifySign(data, signature, publicKey)
`verifySign` verifies signatue of the data using public-key
1. data - data of the given signature
2. signature - signature of the data
3. publicKey - public key of the signer

## FLO Blockchain API Operations
`floBlockchainAPI` object method can be used to send/recieve data to/from blockchain.These functions are asynchronous and return a promise. Contains the following functions.

#### promisedAJAX
	floBlockchainAPI.promisedAJAX(method, uri)
`promisedAJAX` resolves a responce from server on success or rejects the responce on failure.
1. method - GET/POST
   - GET - Requests data from a specified resource.
   - POST - Submits data to be processed to a specified resource.
2. uri(Uniform Resource Identifier) - identifier for AJAX resource. It is used to create URL(Uniform Resource Locator) for further operations.

#### getBalalnce
	floBlockchainAPI.getBalance(addr)
`getBalance` resolves balance for specified FLO address.
1. addr - FLO address for which balance has to be retrieved.

#### writeData
	floBlockchainAPI.writeData(senderAddr, Data, PrivKey, receiverAddr = floGlobals.adminID)
`writeData` writes data into blockchain.
1. senderAddr - FLO address from which the data and amount has to be sent.
2. Data - Actual FLO data that will be sent as string of 1040 characters.
3. receiverAddr - FLO address to which has to be sent. Default is specified in floGlobals.adminID.
4. PrivKey - Private key of sender to verify sender.

#### sendTx 
	floBlockchainAPI.sendTx(senderAddr, receiverAddr, sendAmt, PrivKey, floData = '')
`sendTx` sends a transaction to blockchain, resolves transaction id if the transacation was succsessful. 
1. senderAddr - FLO address from which the data and amount has to be sent.
2. receiverAddr - FLO address to which has to be sent.
3. sendAmt - Amount of FLO coins to be sent to receiver.
4. PrivKey - Private key of sender to verify sender.
5. floData - Actual FLO data that will be sent as string of 1040 characters.

#### readTxs 
	floBlockchainAPI.readTxs(addr, from, to)
`readTxs` reads transactions of specified address between from and to.
1. addr - FLO address for which the transactions has to be read.
2. from - Reading transactions starts from 'from'.
3. to - Reading transactions ends on 'to'.

#### readAllTxs 
	floBlockchainAPI.readTxs(addr)
`readAllTxs` reads all transactions of specified address(newest first).
1. addr - FLO address for which the transactions has to be read.

#### readData
	floBlockchainAPI.readData(addr, options = {})
`readData` reads FLO data from transactions of specified address
1. addr - FLO address for which the transactions data has to be read.
2. options - Contains options for filter data from transactions.
   - limit       : maximum number of filtered data (default = 1000, negative  = no limit)
   - ignoreOld   : ignore old transactions (default = 0)
   - sentOnly    : filters only sent data
   - pattern     : filters data that starts with a pattern
   - contains    : filters data that contains a string
   - filter      : custom filter funtion for floData (eg . filter: d => {return d[0] == '$'})

## Compact IndexedDB operations
`compactIDB` operations can be used to perform basic IndexedDB operations such as add, read/write, modify and remove.Contains following operations.

#### setDefaultDB 
	compactIDB.setDefaultDB(dbName)
`setDefaultDB` sets the database on which further operations will be performed.
1. dbName - This is the name of default database to be used.

#### initDB
	compactIDB.initDB(dbName, objectStores = {})
`initDB` initializes new IndexedDB.
1. dbName - Specifies database to be initialized.
2. objectStores - This is an object containing various objectStores to be initiazed when creating an IDB.

#### openDB
	compactIDB.openDB(dbName)
`openDB` returns a promise that resolves to a default database object.

#### deleteDB
	compactIDB.deleteDB(dbName)
`deleteDB` deletes the specified database.

#### writeData 
	compactIDB.writeData(obsName, data)
`writeData` writes specified data into the database if data doesn't exists or replaces it when data is already present.
1. obsName - object store name in which the data is to be written.
2. data  - data that has to be written in specified object store.

#### addData
	compactIDB.addData(obsName, data)
`addData` writes new data into object store. If data already exists, it will return an error.
1. obsName  - Object store name in which has to be stored.
2. data - The data which has to be added to obeject store.

#### removeData
	compactDB.removeData(obsName, key)
`removeData` deletes data from specified object store using primary key.
1. obsName - Name of object store from which the data has to be removed.
2. key - Primary key of the specified object store.

#### readData 
	compactDB.readData(obsName, key)
`readData` reads the data from object store associated with specified key.
1. obsName - Name of object store from which the data has to be retrieved.
2. key - 2.key - Primary key of the specified object store.

#### readAllData 
	compactDB.readAllData(obsName)
`readAllData` reads all the data from specified object store using IndexedDB openCursor method.
1. obsName - Name of object store from which the data has to be retrieved.
`signData` signs the data using the private key
1. data - data to sign
2. privateKey - private key of the signer

