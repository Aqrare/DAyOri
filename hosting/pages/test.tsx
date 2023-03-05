import type { NextPage } from "next";
import { Button, Input, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { abi } from "../../functions/lib/abi";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/evm-utils";

const Test: NextPage = () => {
  const getEventTopic = async (contractAddress: string, eventName: string) => {
    // イーサリアムノードに接続するプロバイダーを作成
    const provider = new ethers.providers.JsonRpcProvider(
      "https://goerli.infura.io/v3/b31925c3f00146d2a2a3b0c55986fbf3"
    );

    // コントラクトの過去のトランザクションを検索して、トピックを取得
    const logs = await provider.getLogs({
      fromBlock: 0,
      toBlock: "latest",
      address: contractAddress,
      topics: [ethers.utils.id(eventName)],
    });
    console.log(logs)

    // トピックを取得
    return logs;
  };

  const getTopic = async () => {
    const message = "MembersAdded(address[])";
    // const hash = ethers.utils.keccak256(message);
    const signature =
      "ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)";
    const signature2 = "VoteCast(uint256,address,uint8,uint256)";
    // const topic0 = ethers.utils.id(signature);
    const topic0 = ethers.utils.solidityKeccak256(["string"], [message]);
    console.log(topic0);

  };

  const provider = new ethers.providers.JsonRpcProvider(
    `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
  );

  const bytesss = async() => {
    const hexString =
      "0x00000000000000000000000065150B5FA861481651225EF4412136DCBF696232";
    const bigIntValue = BigInt(hexString);
    const result = "0x" + bigIntValue.toString(16).toLowerCase();
    const ens = await provider.lookupAddress(result);
    console.log(ens);
  }

  const getLogs = async() => {
    try {
      const address = "0x19c72037e9867e769c870cb12e7366be03111463";

      const chain = EvmChain.GOERLI;
      const topic0 = "0xa6c1f8f4276dc3f243459e13b557c84e8f4e90b2e09070bad5f6909cee687c92";

      await Moralis.start({
        apiKey:
          "ttEEPScCZsLGrCSxf5q8M2Y8n3ASPL85WIjNYubSggmjg4cxtfnIIP9aitDI6Bdh",
        // ...and any other configuration
      });

      const response = await Moralis.EvmApi.events.getContractLogs({
        address,
        chain,
        topic0,
      });

      console.log(response?.result);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          getEventTopic(
            "0x19c72037e9867e769c870cb12e7366be03111463",
            "ProposalCreated"
          );
        }}
      >
        Get
      </Button>
      <Button onClick={getTopic}></Button>
      <Button onClick={getLogs}>Get Logs</Button>
      <Button onClick={bytesss}>ByteAddressconvert</Button>
    </>
  );
};

export default Test;
