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

This page allows user to send FLO data and transactions to the blockchain.To send any data you have to check your balance first, to make sure you have enough balance as each transaction requires 0.0005 FLOs to be valid.

1. Enter the sender's address
2. Click check balance.
3. Balance of the respective address will be displayed
4. Enter the Receiver's address
5. Enter amount 
6. Enter FLO data (if required)
7. Click Send
8. Enter the private key for the address in the prompt
9. The transaction will be sent to the blockchain and returns the txid (returns error if any).

Note : Transcation fee is set to 0.0005

### FLO address generation/recovery page
This page can be used to generate or recover FLO address and private key pairs.This page has two buttons 
#### generate new address
As the name implies this button when clicked/tapped generates new FLO address and private key pair.Also there is an one click/tap option that allows user to copy FLO address or private key.

#### recover FLO address 
This button when click/tapped opens a popup, which prompts user to enter private key associated with the FLO address that has to be recovered. Once correct private key is entered corresponding FLO address is displayed again.

Note : Do not share your private key with anyone and keep it safe. Once lost a private key can't be recovered.

### Settings page

This page contains settings and information about webapp.

#### Dark mode setting

This section allows user to set color scheme (light/dark) with two options, either automatic or manual.
 1. Automatic - If this toggle is turned on, Dark mode is enabled automatically from 6pm to 6am(Custom timing will be added in future versions).
 
 2. Manual - Turning this toggle on/off changes color scheme and stayes in that mode unless changed by user again.

#### CLear all local data

This option clears all the data stored in IndexedDB databases from browser. This is same as clearing browser data and cache.After deleting data, it may take more time to load transactions as they are now fetched again from blockchain. Also you have to add addresses to start monitoring again.

#### About 
This section contains information about version and underlying technologies.


Note : For reducing API calls and processing time , monitored data are stored in local browser. While monitoring the same address, the data from browser database (IndexedDB) is used and only the new transactions are obtained using API.
