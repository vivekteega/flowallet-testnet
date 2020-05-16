# Standard_Operations
 Standard operations required for FLO Crypto, Blockchain API, Supernode WS, IndexedDB 

This template contains standard operations that can be used for the following:
1. FLO Globals
2. FLO Crypto  Operations 
3. FLO Blockchain API Operations
4. FLO SuperNode Websocket Operations
5. Compact IndexedDB Operations
6. FLO Cloud API Operations
7. FLO Decentralized app (Dapp) module

## FLO Globals 
`floGlobals` object contains the global variables and constants required for the operations.  Make sure to add this object before any other scripts.
`floGlobals` contains the following properties :
1. `blockchain` : Indicates the blockchain (`"FLO"` or `"FLO_TEST"`).
2. `apiURL` : Indicates the URL for blockchain API calls. 
3. `adminID` : Indicates the master admin FLO ID for the project/application.
4. `application`: Name of the project/application.
5. `sendAmt` :  Indicates the default flo amount to be sent while sending transactions into the blockchain.
6. `fee` : Indicates the default fee amount to be deduced while sending transactions into the blockchain.
7. `SNStorageID`* : SuperNode Storage adminID.
8.  `supernodes`⁺ : List of supernodes.
9. `subAdmins`⁺ : subAdmins of the application.
10. `appData`⁺ : Application data for the app (data sent by subAdmins).
11. `generalData`⁺: General Data for the app (data sent by any user).
12. `vectorClock`⁺ and `generalVC`⁺ : vectorclocks for application data and general data respectively.

\* Values that shoult NOT be edited.
⁺ Values that updates in runtime.
1-8 : Required for all applications.
9-12: Required for applications based on floClouldAPI and floDapps module.

## FLO Crypto Operations
`floCrypto` operations can be used to perform blockchain-cryptography methods. `floCrypto` operations are synchronized and return a value. Contains the following Operations.

#### Generate New FLO ID pair
	floCrypto.generateNewID()
 `generateNewID`  generates a new flo ID and returns private-key, public-key and floID 
 * Returns :  Object { privKey , pubKey, floID }

#### 	Calculate Public Key Hex
	floCrypto.getPubKeyHex(privateKey)
`getPubKeyHex` returns public-key from given private-key
1. privateKey - private key in WIF format (Hex) 
 * Returns : pubKey (string)

#### 	Calculate FLO ID
	 floCrypto.getFloIDfromPubkeyHex(publicKey)
`getFloIDfromPubkeyHex` returns flo-ID from public-key
1. publicKey - public key hex value 
* Returns : floID (string)

#### 	Verify Private Key
	 floCrypto.verifyPrivKey(privateKey, pubKey_floID, *isfloID)
`verifyPrivKey` verify the private-key for the given public-key or flo-ID
1. privateKey - private key in WIF format (Hex) 
2. pubKey_floID - public Key or flo ID
3. isfloID - boolean value (true: compare as flo ID, false: compare as public key) (optional, default is true)
* Returns : boolen (true or false)

#### 	Validate FLO ID
	 floCrypto.validateAddr(floID)
`validateAddr` check if the given Address is valid or not
1. floID - flo ID to validate 
* Returns : boolen (true or false)

#### 	Data Encryption
	 floCrypto.encryptData(data, publicKey)
`encryptData` encrypts the given data using public-key
1. data - data to encrypt (String)
2. publicKey - public key of the recipient
* Returns : Encrypted data (Object)

#### 	Data Decryption
	 floCrypto.decryptData(data, privateKey)
`decryptData` decrypts the given data using private-key
1. data - encrypted data to decrypt (Object that was returned from encryptData)
2. privateKey - private key of the recipient
* Returns : Decrypted Data (String)

#### 	Sign Data
	 floCrypto.signData(data, privateKey)
`signData` signs the data using the private key
1. data - data to sign
2. privateKey - private key of the signer
* Returns : signature (String)

####  Verify Signature
	 floCrypto.verifySign(data, signature, publicKey)
`verifySign` verifies signatue of the data using public-key
1. data - data of the given signature
2. signature - signature of the data
3. publicKey - public key of the signer
* Returns : boolen (true or false)

####  Generate Random Interger
	 floCrypto.randInt(min, max)
`randInt` returns a randomly generated interger in a given range.
1. min - minimum value of the range
2. max - maximum value of the range
* Returns : randomNum (Interger)

####  Generate Random String
	 floCrypto.randString(length, alphaNumeric)
`randString` returns a randomly generated string of given length.
1. length - length of the string to be generated
2. alphaNumeric - boolean (true: generated string will only contain alphabets and digits, false: generated string will also have symbols) (optional, default value is false)
* Returns : randomString (String)

####  Create Shamir's Secret shares
	 floCrypto.createShamirsSecretShares(str, total_shares, threshold_limit)
`createShamirsSecretShares` splits the str into shares using shamir's secret.
1. str - string to be split
2. total_shares - total number of shares to be split into
3. threshold_limit - minimum number of shares required to reconstruct the secret str
* Returns : Shares (Array of string)

####  Retrieve Shamir's Secret
	 floCrypto.retrieveShamirSecret(sharesArray)
`retrieveShamirSecret` reconstructs the secret from the shares.
1. sharesArray - Array of shares
* Returns : retrivedData (String)

####  Verify Shamir's Secret
	 floCrypto.verifyShamirsSecret(sharesArray, str)
`verifyShamirsSecret` verfies the validity of the created shares.
1. sharesArray - Array of shares
2. str - originalData (string).
* Returns : boolen (true or false)

## FLO Blockchain API Operations
`floBlockchainAPI` object method can be used to send/recieve data to/from blockchain. These functions are asynchronous and return a promise. Contains the following functions.

#### promisedAJAX
	floBlockchainAPI.promisedAJAX(method, uri)
`promisedAJAX` requests data using API
1. method - GET/POST
   - GET - Requests data from a specified resource.
   - POST - Submits data to be processed to a specified resource.
2. uri(Uniform Resource Identifier) - identifier for AJAX resource. It is used to create URL(Uniform Resource Locator) for further operations.
* Resolves: responseData from the API

#### getBalance
	floBlockchainAPI.getBalance(addr)
`getBalance` requests balance for specified FLO address.
1. addr - FLO address for which balance has to be retrieved
* Resolves: balance (Number)

#### writeData
	floBlockchainAPI.writeData(senderAddr, Data, PrivKey, receiverAddr = floGlobals.adminID)
`writeData` writes data into blockchain, resolves transaction id if the transacation was succsessful. 
1. senderAddr - FLO address from which the data and amount has to be sent.
2. Data - FLO data (string, max 1040 characters)
3. receiverAddr - FLO address to which has to be sent. (Default is specified in floGlobals.adminID)
4. PrivKey - Private key of sender
* Resolves: TransactionID (String)

#### writeDataMultiple
	floBlockchainAPI.writeDataMultiple(senderPrivKeys, data, receivers = [floGlobals.adminID], preserveRatio = true)
`writeDataMultiple` writes data into blockchain from multiple floIDs to multiple floIDs, resolves transaction id if the transacation was succsessful. 
1. senderPrivKeys - Array of Private keys of the senders.
2. Data - FLO data (string, max 1040 characters)
3. receivers - Array of receiver FLO Addresses. (Default is specified in floGlobals.adminID)
4. preserveRatio - boolean (true: preserves the ratio of the balance of senders, false: all senders contribute equal amount to the transaction) (optional, default is true)
* Resolves: TransactionID (String)

#### sendTx 
	floBlockchainAPI.sendTx(senderAddr, receiverAddr, sendAmt, PrivKey, floData = '')
`sendTx` sends a transaction to blockchain, resolves transaction id if the transacation was succsessful. 
1. senderAddr - FLO address from which the data and amount has to be sent.
2. receiverAddr - FLO address to which has to be sent.
3. sendAmt - Amount of FLO coins to be sent to receiver.
4. PrivKey - Private key of sender to verify sender.
5. floData - FLO data (string, max 1040 characters) (optional, default value is empty string)
* Resolves: TransactionID (String)

#### sendTxMultiple
	floBlockchainAPI.sendTxMultiple(senderPrivKeys, receivers, floData = '')
`sendTxMultiple` sends a transaction to blockchain from multiple floIDs to multiple floIDs, resolves transaction id if the transacation was succsessful. 
1. senderPrivKeys - Array of Private keys of the senders (or) Object of private keys with sendAmount for each floID (eg: { privateKey1: sendAmt1, privateKey2: sendAmt2...}) .
Note: If passed as Array, then ratio of the balance of the senders are preserved. If passed as Object uses the amount given.
3. receivers - Object of receiver floIDs with receive amount (eg: {receiverID1: receiveAmt1, receiver2: receiveAmt2...})
4. floData - FLO data (string, max 1040 characters) (optional, default value is empty string)
* Resolves: TransactionID (String)

#### mergeUTXOs
	floBlockchainAPI.mergeUTXOs(floID, privKey, floData = '')
`mergeUTXOs` sends a transaction to blockchain that merges all utxos of the given floID. 
1. floID - FLO address of which the utxos should be merged.
2. privKey - private key of the floID.
3.  floData - FLO data (string, max 1040 characters) (optional, default value is empty string)
* Resolves: TransactionID (String)

#### readTxs 
	floBlockchainAPI.readTxs(addr, from, to)
`readTxs` reads transactions of specified address between from and to.
1. addr - FLO address for which the transactions has to be read.
2. from - Reading transactions starts from 'from'.
3. to - Reading transactions ends on 'to'.
* Resolves: TransactionData (Object)

#### readAllTxs 
	floBlockchainAPI.readTxs(addr)
`readAllTxs` reads all transactions of specified address(newest first).
1. addr - FLO address for which the transactions has to be read.
* Resolves: TransactionData (Object)

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
* Resolves: Object {totalTxs, floData (Array)}

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
	compactIDB.openDB(dbName = this.defaultDB)
`openDB` returns a promise that resolves to a default database object.
1. dbName - Name of the database (optional, uses defaultDB if not specified)

#### deleteDB
	compactIDB.deleteDB(dbName = this.defaultDB)
`deleteDB` deletes the specified database.
1. dbName - Name of the database (optional, uses defaultDB if not specified)

#### writeData 
	compactIDB.writeData(obsName, data, key = false, dbName = this.defaultDB)
`writeData` writes specified data into the database if data doesn't exists or replaces it when data is already present.
1. obsName - object store name in which the data is to be written.
2. data  - data that has to be written in specified object store.
3. key - Primary key of the data (optional, false indicates key is autoincremented or passed in data)
4. dbName - Name of the database (optional, uses defaultDB if not specified)

#### addData
	compactIDB.addData(obsName, data, key = false, dbName = this.defaultDB)
`addData` writes new data into object store. If data already exists, it will return an error.
1. obsName  - Object store name in which has to be stored.
2. data - The data which has to be added to obeject store.
3.  key - Primary key of the data (optional, false indicates key is autoincremented or passed in data)
4. dbName - Name of the database (optional, uses defaultDB if not specified)

#### removeData
	compactDB.removeData(obsName, key, dbName = this.defaultDB)
`removeData` deletes data from specified object store using primary key.
1. obsName - Name of object store from which the data has to be removed.
2. key - Primary key of the data.
3. dbName - Name of the database (optional, uses defaultDB if not specified)

#### clearData
	compactDB.clearData(obsName, dbName = this.defaultDB)
`clearData` clears all data in the objectStore.
1. obsName - Name of object store from which the data has to be removed.
2. dbName - Name of the database (optional, uses defaultDB if not specified)

#### readData 
	compactDB.readData(obsName, key, dbName = this.defaultDB)
`readData` reads the data from object store associated with specified key.
1. obsName - Name of object store from which the data has to be retrieved.
2. key - Primary key of the data to read.
3. dbName - Name of the database (optional, uses defaultDB if not specified)

#### readAllData 
	compactDB.readAllData(obsName, dbName = this.defaultDB)
`readAllData` reads all the data from specified object store using IndexedDB openCursor method.
1. obsName - Name of object store from which the data has to be retrieved.
2. dbName - Name of the database (optional, uses defaultDB if not specified)

## FLO Supernode module
This module contains functions that interact with the supernode to send and retrive data in the backend. Use floClouldAPI operations to send and receive data for application.

## FLO Cloud API operations
`floCloudAPI` operations can interact with floSupernode cloud to send and retrive data for applications. floCloudAPI uses floSupernode module for backend interactions.

#### sendApplicationData
	floCloudAPI.sendApplicationData(message, type, options = {})
`sendApplicationData` sends application data to the cloud.
1. message - data to be sent
2. type - type of the data
3. options - (optional, options detailed at end of module)

#### requestApplicationData
	floCloudAPI.requestApplicationData(options = {})
`requestApplicationData` requests application data from the cloud.
1. options - (optional, options detailed at end of module)

#### sendGeneralData
	floCloudAPI.sendGeneralData(message, type, options = {})
`sendGeneralData` sends general data to the cloud.
1. message - data to be sent
2. type - type of the data
3. options - (optional, options detailed at end of module)

#### requestGeneralData
	floCloudAPI.requestGeneralData(type, options = {})
`requestGeneralData` requests application data from the cloud.
1. type - type of the data
2. options - (optional, options detailed at end of module)

#### resetObjectData
	floCloudAPI.resetObjectData(objectName, options = {})
`resetObjectData` resets the objectData to cloud.
1. objectName - Name of the objectData to be reset
2. options - (optional, options detailed at end of module)
Note: value of objectData is taken from floGlobals

#### updateObjectData
	floCloudAPI.updateObjectData(objectName, options = {})
`updateObjectData` updates the objectData to cloud.
1. objectName - Name of the objectData to be updated
2. options - (optional, options detailed at end of module)
Note: value of objectData is taken from floGlobals

#### requestObjectData
	floCloudAPI.requestObjectData(objectName, options = {})
`requestObjectData` requests application data from the cloud.
1. objectName - Name of the objectData to be requested
2. options - (optional, options detailed at end of module)

#### options:
* send options:
	* receiverID - received of the data
	* application - application of the data 
	* comment - comment of the data

* request options
	* receiverID - received of the data
	* senderIDs - array of senderIDs
	* application - application of the data
	* type - type of the data
	* comment - comment of the data
	* lowerVectorClock - VC from which the data is to be requested
	* upperVectorClock - VC till which the data is to be requested
	* atVectorClock - VC at which the data is to requested
	* mostRecent - boolean (true: request only the recent data matching the pattern)

## FLO Decentralised Applications (Dapps)
`floDapps` module contains methods for basic Dapp. floDapps uses all of the above modules.

#### addStartUpFunction
	floDapps.addStartUpFunction(fname, fn)
`addStartUpFunction` adds a startup funtion to the Dapp
1. fname - Name of the startup function
2. fn - body of the function
Note: startup funtions are called in parallel. Therefore only add custom startup funtion only if it can run in parallel with other startup functions. (default startup funtions are read supernode list and subAdmin list from blockchain API, load data from indexedDB, get login credentials)

#### setCustomPrivKeyInput
	floDapps.setCustomPrivKeyInput(customFn)
`setCustomPrivKeyInput` adds a startup funtion to the Dapp
1. customFn - custom function to get login credentials (privateKey)

#### setAppObjectStores
	floDapps.setAppObjectStores(appObs)
`setAppObjectStores` adds additionals objectstores for the app
1. appObs - additionals objects for the app

#### manageSubAdmins
	floDapps.manageSubAdmins(adminPrivKey, addList, rmList)
`manageSubAdmins` adds and/or removes subAdmins by sending transaction to blockchain.
1. adminPrivKey - private key of the adminID
2. addList - Array of subAdmins to add
3. rmList - Array of subAdmins to remove

#### clearCredentials
	floDapps.clearCredentials()
`clearCredentials` removes the login credentials stored in IDB.

#### securePrivKey
	floDapps.securePrivKey(pwd)
`securePrivKey` replaces the stored private key with an encrypted variant
1. pwd - password for the encryption
Note: if securePrivKey is used, then password must be requested during customPrivKeyInput (in setCustomPrivKeyInput).

#### objectDataMapper
	floDapps.objectDataMapper(object, path, data)
`objectDataMapper` maps the object and data via path
1. object - object to be mapped
2. path - end path for the data holder
3. data - data to be pushed in map

#### getNextGeneralData
	floDapps.getNextGeneralData(type, vectorClock, options = {})
`getNextGeneralData` return the next generaldata
1. type - type of the general data
2. vectorClock - current known VC, from which next data to be retrived
3. options - (optional, {comment, application} of the data)

#### launchStartUp
	floDapps.launchStartUp()
`launchStartUp` launchs the Dapp startup functions

#####  reactorEvents
* startUpSuccessLog - called when a startup funtion is successfully completed
* startUpErrorLog - called when a startup funtion encounters an error

##### onLoadStartUp 
Sample startup is defined in onLoadStartUp function


# Basic Concepts of RanchiMall Blockchain Cloud for developers

## 1. Data fields stored in each of decentralised servers

vectorClock, senderID, receiverID, pubKey, message, sign, application, type, comment

   * `vectorClock`: Unique time stamp and sender FLO ID attached to every message
   * `senderID`: FLO ID of the sender
   * `receiverID`: FLO ID of the receiver
   * `pubKey`: Public Key of the sender 
   * `message`: The actual user data
   * `sign`: Digital signature of the entire data
   * `application`: The name of the application sending the data
   * `type`: What internal type of data the application is sending 
   * `comment`: A free field for additional data

## 2. Concept of Vector Clock
Decentralized cloud servers attach a unique time based ID to every message sent to the cloud, and store it alongside the message fields. 

It is stored in the form EpochTime_SenderFLOID

Vector Clock field is unique for every message stored in cloud

It allows the clients to retrieve messages before and after a certain time, and also help us identify who sent the message easily

#### Example of Vector Clock
* `1580484792246_FP97cbzsgTjHn7eyBtKSVcbkSSxZ5jWYHM`

   - `1580484792246` Epoch time is GMT: Friday, January 31, 2020 3:33:12.246 PM in common time
   - `FP97cbzsgTjHn7eyBtKSVcbkSSxZ5jWYHM` is the FLO ID of sender

## 3. Data Types supported by the cloud

### User Data Types
 * `General Data`: Message field can be in any user form. 
 * `Object Data`: Message field can only be a JavaScript Object

### System Data Type 
* `Application Data`: Application data is the base on which General Data system and Object Data system has been created. The formats for  General Data and Application Data are exactly the same. Users will never need to use Application Data. So we have deprecated Application Data. 
 
Note:
 * `General Data:` Type field is mandatory
 * `Object Data:` Type field has been consumed to create object functionality


## 4. General Data

### SEND DATA
Parameters while sending

 * `Message`: Actual Message to be sent
 * `Type`: User defined type (anything that user wants to classify as type) 

#### Options
 * `receiverID` - receiver of the data 
 * `application` - application using the data
 * `comment` - user comment of the data

### REQUEST DATA

#### request options
 * `receiverID` - receiver of the data
 * `type` - type of the data ( a free user field)
 * `senderIDs` - array of senderIDs
 * `application` - application of the data
 * `comment` - comment of the data
 * `lowerVectorClock` - VC from which the data is to be requested
 * `upperVectorClock` - VC till which the data is to be requested
 * `atVectorClock` - VC at which the data is to requested
 * `mostRecent` - boolean (true: request only the recent data matching the pattern)

## 5. ObjectData

### RESET or UPDATE operations 
Parameters while resetting or updating
 * `Object Data`

#### Options
 * `receiverID` - receiver of the data 
 * `application` - application using the data
 * `comment` - comment of the data

### REQUEST DATA

#### request options
 * `receiverID` - receiver of the data
 * `senderIDs` - array of senderIDs
 * `application` - application of the data
 * `comment` - comment of the data
 * `lowerVectorClock` - VC from which the data is to be requested
 * `upperVectorClock` - VC till which the data is to be requested
 * `atVectorClock` - VC at which the data is to requested
 * `mostRecent` - boolean (true: request only the recent data matching the pattern)

## 5. Application Data

### DEPRECATED

Application data system is a legacy data field without vector clock support in options. In our development process, General Data was created by adding vector clock support to application data at user level. So SEND and REQUEST options in Application Data are exactly the same as General data without vector clock options
