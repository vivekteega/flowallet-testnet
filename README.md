# FLO_webWallet
FLO Web Wallet

These are client side scripts that can generate FLO addresses, send FLO transactions to the blockchain and monitor FLO data from the blockchain

NOTE : Use respective file for mainnet and testnet

## Instructions to use 

Note : Web wallet uses IndedxedDB for storing data, which means data is stored in respective browser you used to open web wallet.Data stored by one browser can't be accessed by other browser.

There are 4 pages in this web app :
----------------------

### Monitor FLO Data
This apge allows user to view the transactions done by the given address/es.
1. Click/Tap on the '+' floating button at bottom-right hand side, which opens a popup window.
2. Enter the FLO address that you want to monitor, You can also specify a label to that address which will be displayed as name for that address.If you left label field empty, the default label will be 'Unknown'.
3. Click/Tap on 'Ok' and the address you added will be displayed on monitoring page as a card.This address is also added to your local database.Once you add an address/label pair, It will stay there untill you clear data(Option available in Settings page).
4. When you hover mouse pointer on a monitoring card, three dots will appear. clicking on this allows user to edit or remove that address from monitoring list.(On mobile devices this option is always visible)
5. To see transactions done by any address, click/Tap on respective address card.It will open an follow up window, which displays transactions in messege format. consisting of data sent/received to/from, date of transaction and FLO data. Arrows on messege body indicate direction of transaction i.e. Data is sent or received.On the top of window we have option to go back to monitoring page or refresh the transaction history.

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

### Address Generator
This function can generate new FLO address and secret key pair (or) recover FLO address from given secret key.
1. Click on the 'Generate New Address' button to generate FLO address and secret key pair.

(or)
1. Click on the 'Recover FLO Address' button 
2. Enter the secret key in the prompt to recover the FLO address. 

### Settings page

Note : For reducing API calls and processing time , monitored data are stored in local browser. While monitoring the same address, the data from browser database (IndexedDB) is used and only the new transactions are obtained using API.
The local data can be cleared by clicking the 'Clear Local Data' button.
