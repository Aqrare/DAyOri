# DAyOri

DAyOri is a all-in-one notification platform for DAO.
Users can receive the notification via emails when some important action is happened in the DAO like new proposal is created or new member is added.
DAyOri aim to support all DAO related contracts from the governor contract to treasury contract. All needed things for DAO notification is gathered here, and user don't have to monitor a lot of DAO dashboard.

DAyOri means letters in Japanese.

## 【How it works】

- We monitors all events data emitted from the resisterd DAO contract, and read the event data and translate it to the human readable language, then notify that via email.
- We use opt-in model and users can set which notifications they receive from our application
- We can support all DAO related contract not only specialized contract, and plan to expand more.


## 【Problems】
- Poor UI & UX
- Low voter turnout
- Difficulty understanding the DAO status

## 【How can we solve】
- Easy to use interface
- Assessing the voting situation
- Receiving notification

## 【Supported Contract】
- Aragon DAO contract
- Aragon resistory contract
- OpenZeppelin governor contracts

## 【Supported Chain】
Currently, DAyOri supports only Goerli chain but we will support other network soon.

## 【Future Plan】
- Integrate other SNSs like Telegram or Discord and add opition for the users.
- We're also interested in the messaging solution between the wallet addresses, integrate DAyOri to those and would like to improve the UX in the DAO space.

## 【Receivable Notifications】
- Proposal Created
  - Get notification when someone created new projects
  - Address of the creator and proposal duration is displayed in the email.
  - In case of the contract is made from Aragon, there is URL for the contract dashboard page
- MembersAdded
  - Get notification when proposal for adding new members are executed.
  - Address of the new members are displayed in the email
  - In case of the contract is made from Aragon, there is URL for the contract dashboard page
- ProposalExecuted
  - Get notification when proposals are executed.
- VoteCase
  - Get notification when someone vote for the proposal
