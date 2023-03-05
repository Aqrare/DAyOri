import * as functions from "firebase-functions";
import {ethers} from "ethers";
import Moralis from "moralis";
import {
  getLogFromMoralis,
  sendEmail,
  sendEmailWithTime,
  getContractAddressList,
  getEmailList,
  getDaoName,
  changeBigintUNIXToDate,
  getDaoFromGoveror,
  ensResolve,
} from "../utils";

export const scheduledNotifyProposalCreated = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const result = await task();
    console.log(result);
  });

const POCKET_ID = functions.config().pocket.id || process.env.POCKET_ID;
const provider = new ethers.providers.JsonRpcProvider(
  `https://eth-goerli.gateway.pokt.network/v1/lb/${POCKET_ID}`
);

const topics: string[] = [
  "0xa6c1f8f4276dc3f243459e13b557c84e8f4e90b2e09070bad5f6909cee687c92",
  "0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0",
];
const templateId = "d-f24c1e30aaa44203afce57f084c37e53";

const eventName = "proposal_created";
let executedAt = "";

const task = async () => {
  if (!executedAt) {
    executedAt = (await provider.getBlockNumber()).toString();
  }
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: functions.config().moralis.key || process.env.MORALIS_API_KEY,
    });
  }
  const contractAddressLists = await getContractAddressList();
  contractAddressLists.forEach(async (contractAddress: string) => {
    console.log(contractAddress);
    topics.forEach(async (topic, topicsIndex) => {
      console.log(topic);
      const daoName = await getDaoName(contractAddress);
      console.log(daoName);
      const logs = await getLogFromMoralis(contractAddress, topic, executedAt);
      logs.forEach(async (log) => {
        const emails = await getEmailList(contractAddress, eventName);
        console.log(emails);
        console.log(topicsIndex, "topicsIndex");
        if (topicsIndex == 0) {
          console.log(log.topics);
          const proposalCreator = log.topics[2];
          const [proposer, ens] = await ensResolve(
            proposalCreator || "",
            provider
          );
          const startDate = getStartDate(log.data);
          const endDate = getEndData(log.data);
          const daoContractAddress = await getDaoFromGoveror(contractAddress);
          const url = `https://app.aragon.org/#/daos/goerli/${daoContractAddress}/dashboard`;
          emails.forEach((email) => {
            sendEmailWithTime(
              daoName,
              email,
              ens || proposer,
              startDate.toString(),
              endDate.toString(),
              url
            );
          });
        } else {
          emails.forEach((email) => {
            sendEmail(daoName, email, templateId, contractAddress);
          });
        }
      });
    });
  });
  executedAt = (await provider.getBlockNumber()).toString();
  return;
};

export const testtesttask = async () => {
  if (!executedAt) {
    executedAt = (await provider.getBlockNumber()).toString();
  }
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: functions.config().moralis.key || process.env.MORALIS_API_KEY,
    });
  }
  const contractAddressLists = await getContractAddressList();
  contractAddressLists.forEach(async (contractAddress: string) => {
    console.log(contractAddress);
    topics.forEach(async (topic, topicsIndex) => {
      console.log(topic);
      const daoName = await getDaoName(contractAddress);
      console.log(daoName);
      const logs = await getLogFromMoralis(contractAddress, topic, executedAt);
      logs.forEach(async (log) => {
        const emails = await getEmailList(contractAddress, eventName);
        console.log(emails);
        console.log(topicsIndex, "topicsIndex");
        if (topicsIndex == 0) {
          console.log(log.topics);
          const proposalCreator = log.topics[2];
          const startDate = getStartDate(log.data);
          const endDate = getEndData(log.data);
          const url = `https://app.aragon.org/#/daos/goerli/${contractAddress}/dashboard`;
          emails.forEach((email) => {
            sendEmailWithTime(
              daoName,
              email,
              proposalCreator,
              startDate.toString(),
              endDate.toString(),
              url
            );
          });
        } else {
          emails.forEach((email) => {
            sendEmail(daoName, email, templateId, contractAddress);
          });
        }
      });
    });
  });
  executedAt = (await provider.getBlockNumber()).toString();
  return;
};

const getStartDate = (data: string) => {
  const configuredData = data.substring(2);
  const startAtByte = configuredData.substring(0, 64);
  console.log(startAtByte, "startBytes");
  return changeBigintUNIXToDate(startAtByte);
};
const getEndData = (data: string) => {
  const configuredData = data.substring(2);
  console.log(configuredData, "enddata");
  const endAtByte = configuredData.slice(64, 128);
  console.log(endAtByte, "endAtByte");
  return changeBigintUNIXToDate(endAtByte);
};
