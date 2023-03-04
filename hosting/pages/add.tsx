import type { NextPage, NextPageContext } from "next";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { abi } from "../../functions/lib/abi";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/evm-utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createObjectFromKeysValues } from "../utils/utils";
import { firebaseConfig } from "../utils/firebase";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  push,
  update,
} from "firebase/database";
import { Client, DaoDetails } from "@aragon/sdk-client";
import { useAragonSDKContext } from "../context/AragonSDK";

interface AddProps {
  address: string;
}

const Add: NextPage<AddProps> = ({ address }) => {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState("");
  const [email, setEmail] = useState("");
  const [dao, setDao] = useState<DaoDetails>();
  const [notificationList, setNotificationList] = useState([
    false,
    false,
    false,
    false,
  ]);
  const notificationKeys = [
    "member_added",
    "proposal_created",
    "proposal_executed",
    "vote_cast",
  ];
  const handleChange = (index) => {
    const array = [...notificationList];
    array[index] = !array[index];
    setNotificationList(array);
  };
  const handleContractAddressChange = (e: any) => {
    const inputValue = e.target.value;
    setContractAddress(inputValue);
  };
  console.log(email, "email");

  useEffect(() => {
    async function getUserEmail() {
      if (address) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${address}/email`))
          .then((snapshot) => {
            const data = snapshot.val();
            setEmail(data);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        console.log("no");
      }
    }
    getUserEmail();
  }, [address]);

  const { context } = useAragonSDKContext();
  useEffect(() => {
    async function getDaoInfo() {
      console.log(context);
      if (context || contractAddress) {
        const client = new Client(context); // general purpose client allowing us to call getDao
        const daoAddressOrEns: string = contractAddress;

        const dao: DaoDetails | null = await client.methods.getDao(
          daoAddressOrEns
        ); // returns details about our DAO
        setDao(dao);
      }
    }
    getDaoInfo();
  }, [context, contractAddress]);

  console.log(dao);

  const save = async () => {
    const obj = createObjectFromKeysValues(notificationKeys, notificationList);
    if (dao.plugins[0]) {
      const governanceContract = dao.plugins[0].instanceAddress;
      notificationKeys.forEach(async (key) => {
        await set(
          ref(database, `daos/${governanceContract}/${key}/${address}`),
          email
        );
      });
      await set(
        ref(database, `users/${address}/contracts/${governanceContract}/`),
        obj
      );
      await set(
        ref(database, `daos/${governanceContract}/name`),
        dao.metadata.name
      );
    }
    notificationKeys.forEach(async (key) => {
      await set(
        ref(database, `daos/${contractAddress}/${key}/${address}`),
        email
      );
    });
    await set(
      ref(database, `users/${address}/contracts/${contractAddress}/`),
      obj
    );
    await set(
      ref(database, `daos/${contractAddress}/name}`),
      dao.metadata.name
    );

    console.log("finish");
  };

  return (
    <div className={styles.container}>
      <header>
        <ConnectButton />
      </header>
      <main className={styles.main}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Input DAO contract address here
        </Text>
        <Input w={"40%"} onChange={handleContractAddressChange}></Input>
        <Heading mt={10} fontSize="3xl">
          Notification Setting
        </Heading>
        <Stack spacing={4} m={"5"}>
          {notificationList.map((n, index) => {
            return (
              <FormControl
                key={notificationKeys[index]}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <FormLabel htmlFor={notificationKeys[index]} mb="0">
                  {notificationKeys[index]}
                </FormLabel>
                <Switch
                  id={notificationKeys[index]}
                  onChange={() => {
                    handleChange(index);
                  }}
                  isChecked={notificationList[index]}
                />
              </FormControl>
            );
          })}
        </Stack>
        <Flex>
          <Button m={2} onClick={() => router.push("/")}>
            Back
          </Button>
          <Button
            m={2}
            onClick={() => {
              save();
              router.push("/");
            }}
          >
            Save
          </Button>
        </Flex>
      </main>
    </div>
  );
};

Add.getInitialProps = ({ query }: NextPageContext): AddProps => {
  const { address } = query;
  console.log(address, "address initial");
  return {
    address: typeof address === "string" ? address : address[0],
  };
};

export default Add;
