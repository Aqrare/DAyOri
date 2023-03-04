import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sgMail from "@sendgrid/mail";
// import { ethers } from "ethers";
import Moralis from "moralis";
import {EvmChain} from "@moralisweb3/common-evm-utils";
import * as nodemailer from "nodemailer";
// import { Wallet } from "@ethersproject/wallet";
// import {
//   Context,
//   ContextParams,
//   // ContextPlugin,
//   // MultisigClient,
//   // MultisigProposal,
//   Client,
//   DaoDetails,
// } from "@aragon/sdk-client";

admin.initializeApp(functions.config().firebase);
export const database = admin.database();

export const getLogFromMoralis = async (
  contractAddress: string,
  topic: string,
  executedAt: string
) => {
  const chain = EvmChain.GOERLI;
  const response = await Moralis.EvmApi.events.getContractLogs({
    address: contractAddress,
    chain,
    fromBlock: executedAt,
    topic0: topic,
  });
  return response?.result;
};

export const getContractAddressList = async () => {
  const daosRef = admin.database().ref("daos");
  const daosSnapshot = await daosRef.once("value");
  const daos = daosSnapshot.val();
  const daoKeys = Object.keys(daos);
  return daoKeys;
};

export const getDaoName = async (contractAddress: string) => {
  const ref = admin.database().ref(`daos/${contractAddress}`);
  const snapshot = await ref.once("value");
  const daoName = snapshot.child("name").val();
  return daoName;
};

export const getEmailList = async (
  contractAddress: string,
  eventName: string
) => {
  const emails: string[] = [];
  const ref = admin.database().ref(`daos/${contractAddress}/${eventName}`);
  const snapshot = await ref.once("value");
  const data = snapshot.val();
  const walletAddresses = Object.keys(data);
  walletAddresses.forEach((walletAddress) => {
    const email = snapshot.child(walletAddress).val();
    emails.push(email);
  });
  return emails;
};

const gmailEmail =
  functions.config().gmail.address || process.env.GMAIL_ADDRESS;
const mailTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: gmailEmail,
    pass: functions.config().gmail.password || process.env.GMAIL_PASSWORD,
  },
});

export const sendEmail = async (
  name: string,
  to: string,
  templateId: string,
  contractAddress: string
) => {
  const displayName = ""; // ユーザの表示名
  // const text = getMailText();
  console.log(templateId, contractAddress);

  const mailOptions = {
    from: `Your Name <${gmailEmail}>`,
    to,
    subject: `New proposal at ${name}`,
    text: `Hello ${
      displayName || ""
    }! Welcome to My App. I hope you will enjoy using our service.`,
  };

  return await mailTransport.sendMail(mailOptions).then(() => {
    console.log(`New welcome email sent to: ${to}`);
  });
};

export const sendEmailWithTime = async (
  name: string,
  to: string,
  templateId: string,
  contractAddress: string,
  proposalCreator: string | null,
  startDate: string,
  endDate: string,
  url: string
) => {
  const displayName = ""; // ユーザの表示名
  // const text = getMailText();
  console.log(templateId, contractAddress);

  const mailOptions = {
    from: `Your Name <${gmailEmail}>`,
    to,
    subject: `New proposal at ${name}`,
    text: `Hello ${displayName || ""}! 
    New proposal is created from ${proposalCreator}
    Proposal Duration : 
    ${startDate} ~ ${endDate}
    
    Go to the Aragon App and see the proposal
    ${url}`,
  };

  return await mailTransport.sendMail(mailOptions).then(() => {
    console.log(`New welcome email sent to: ${to}`);
  });
};

export const dataConvert = (data: string) => {
  const configuredData = data.substring(2);
  const startAtByte = configuredData.substring(0, 64);
  const startDate = changeBigintUNIXToDate(startAtByte);
  const endAtByte = configuredData.substring(64, 64);
  console.log(endAtByte, "endAtByte");
  const endDate = changeBigintUNIXToDate(endAtByte);
  return [startDate, endDate];
};

export const changeBigintUNIXToDate = (hexString: string) => {
  const number = BigInt("0x" + hexString);
  const date = new Date(Number(number) * 1000);
  return date;
};

// export const getDao = functions.https.onRequest(async (req, res) => {
//   const aragonSDKContextParams: ContextParams = {
//     network: "goerli",
//     signer: new Wallet(
//       "35046882a8e35435b3e0620580c6d40e86ae85f96c0b95bc8f8360e5d4a0be52"
//     ),
//     daoFactoryAddress: "0x16B6c6674fEf5d29C9a49EA68A19944f5a8471D3",
//     web3Providers: [
//       "https://eth-goerli.gateway.pokt.network/v1/lb/db7489ea80908cbd824a05ac",
//     ],
//     ipfsNodes: [
//       {
//         url: "https://testing-ipfs-0.aragon.network/api/v0",
//         headers: {
//           "X-API-KEY": "b477RhECf8s8sdM7XrkLBs2wHc4kCMwpbcFC55Kt" || "",
//         },
//       },
//     ],
//     graphqlNodes: [
//       {
//         url: "https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.0.0/api",
//       },
//     ],
//   };
//   const context = new Context(aragonSDKContextParams);
//   const client = new Client(context);
//   const daoAddressOrEns = "0x9f119c1ad06a49216d2dc6a16506fac76e9d9a58";

//   const dao: DaoDetails | null =
// await client.methods.getDao(daoAddressOrEns);
//   console.log(dao);
// });
