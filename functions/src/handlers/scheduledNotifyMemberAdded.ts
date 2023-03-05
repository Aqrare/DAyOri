import * as functions from "firebase-functions";
import {ethers} from "ethers";
import Moralis from "moralis";
import {
  getLogFromMoralis,
  sendEmail,
  sendEmailMemberAdded,
  getContractAddressList,
  getEmailList,
  getDaoName,
  getDaoFromGoveror,
  // ensResolve,
} from "../utils";

export const scheduledNotifyMemberAdded = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const result = await task();
    console.log(result);
  });

const provider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/b31925c3f00146d2a2a3b0c55986fbf3"
);
let executedAt = "";

const signature = "MembersAdded(address[])";
const topic0 = ethers.utils.solidityKeccak256(["string"], [signature]);
const eventName = "member_added";

const topics: string[] = [topic0];
const templateId = "d-f24c1e30aaa44203afce57f084c37e53";

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
          const members = await getAddressList(log.data);
          console.log(members, "members");
          const daoContractAddress = await getDaoFromGoveror(contractAddress);
          const url = `https://app.aragon.org/#/daos/goerli/${daoContractAddress}/dashboard`;
          emails.forEach((email) => {
            sendEmailMemberAdded(daoName, email, members, url);
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

const getAddressList = (data: string) => {
  const configuredData = data.substring(2);
  console.log(configuredData, "configuredData");
  const dataArray = [];
  for (let i = 0; i < configuredData.length; i += 64) {
    dataArray.push("0x" + configuredData.slice(i, i + 64));
  }
  const addresses = dataArray.slice(2);
  console.log(addresses, "addresses");
  const members: any[] = [];
  addresses.forEach(async (address) => {
    const wallet = "0x" + address.slice(2).replace(/^0+/, "");
    members.push(wallet);
  });
  return members;
};
