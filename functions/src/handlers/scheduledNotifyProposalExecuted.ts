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

export const scheduledNotifyProposalExecuted = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const result = await task();
    console.log(result);
  });

const provider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/b31925c3f00146d2a2a3b0c55986fbf3"
);

let executedAt = "";

const signature = "ProposalExecuted(uint256)";
const topic0 = ethers.utils.solidityKeccak256(["string"], [signature]);

const topics: string[] = [topic0];
const templateId = "d-f24c1e30aaa44203afce57f084c37e53";
const eventName = "proposal_executed";

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
