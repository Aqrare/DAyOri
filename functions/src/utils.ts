import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Moralis from "moralis";
import {EvmChain} from "@moralisweb3/common-evm-utils";
import * as nodemailer from "nodemailer";

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
  console.log(templateId, contractAddress);

  const mailOptions = {
    from: `DAyOri <${gmailEmail}>`,
    to,
    subject: `New proposal at ${name}`,
    text: "New proposal is created",
  };

  return await mailTransport.sendMail(mailOptions).then(() => {
    console.log(`New welcome email sent to: ${to}`);
  });
};

export const sendEmailWithTime = async (
  name: string,
  to: string,
  proposalCreator: string | null,
  startDate: string,
  endDate: string,
  url: string
) => {
  const mailOptions = {
    from: `DAyOri <${gmailEmail}>`,
    to,
    subject: `New proposal at ${name}`,
    text: `Hello
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

export const sendEmailMemberAdded = async (
  name: string,
  to: string,
  members: string[],
  url: string
) => {
  const mailOptions = {
    from: `DAyOri <${gmailEmail}>`,
    to,
    subject: `New members added at ${name}`,
    text: `Hello 
    New members are joined to our DAO ! 

    New members:
    ${members},

    Go to the Aragon App and say hello to them!
    ${url}`,
  };

  return await mailTransport.sendMail(mailOptions).then(() => {
    console.log(`New welcome email sent to: ${to}`);
  });
};

export const sendEmailProposalExecuted = async (
  name: string,
  to: string,
  url: string
) => {
  const mailOptions = {
    from: `DAyOri <${gmailEmail}>`,
    to,
    subject: `Proposal is executed at ${name}`,
    text: `Hello 
    The proposal is executed!

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

export const getDaoFromGoveror = async (governerContract: string) => {
  const ref = admin.database().ref(`daos/${governerContract}`);
  const snapshot = await ref.once("value");
  const daoContractAddress = snapshot.child("dao").val();
  return daoContractAddress;
};

export const ensResolve = async (hexString: string, provider: any) => {
  const bigIntValue = await BigInt(hexString);
  const result = "0x" + bigIntValue.toString(16).toLowerCase();
  const ens: string = await provider.lookupAddress(result);
  return [result, ens];
};
