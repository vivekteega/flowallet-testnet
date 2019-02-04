# FLO_webWallet
FLO Web Wallet

These are client side scripts that can generate FLO addresses, send FLO transactions to the blockchain and monitor FLO data from the blockchain

NOTE : Use respective file for mainnet and testnet

## Instructions to use 

Note : open the respective html file in browser

Choose the function you require. (Click button)

There are 3 functions :
----------------------

### Address Generator
This function can generate new FLO address and secret key pair (or) recover FLO address from given secret key.
1. Click on the 'Generate New Address' button to generate FLO address and secret key pair.

(or)
1. Click on the 'Recover FLO Address' button 
2. Enter the secret key in the prompt to recover the FLO address. 

### Send FLO Data
This function can send FLO data and transactions to the blockchain.
1. Enter the sender's address (for multiple address use comma `,`)
2. Click get balance.
3. Balance of the respective address(es) will be displayed
4. Select the address from which you want to send
5. Enter the Receiver's address
6. Enter amount 
7. Enter FLO data (if required)
8. Click Send
9. Enter the private key for the address in the prompt
10. The transaction will be sent to the blockchain and returns the txid (returns error if any).

Note : Transcation fee is set to 0.0005

### Monitor FLO Data
This function views the FLO data sent and received by the given address(es).
1. Enter the address to monitor (for multiple address use comma `,`)
2. Click Monitor Data
3. FloData sent and received by the address(es) will be displayed
4. Each address data will be displayed in seperate table.
5. Add/Edit Label using Edit button of Label input field.
6. Refresh and Remove data from view using refresh and remove buttons respectively.

Note : For reducing API calls and processing time , monitored data are stored in local browser. While monitoring the same address, the data from browser database (IndexedDB) is used and only the new transactions are obtained using API.
The local data can be cleared by clicking the 'Clear Local Data' button.
