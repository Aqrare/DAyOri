import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { ReactNode } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import {
  Box,
  Button,
  Divider,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
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
import { useAccount } from "wagmi";
import { firebaseConfig } from "../utils/firebase";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [resisterdEmail, setResisterdEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [user, setUser] = useState({});
  const [contracts, setContracts] = useState<string[]>([]);
  const [daoContractAddress, setDaoContractAddress] = useState("");
  const [dao, setDao] = useState<DaoDetails>();
  const { address, isConnecting, isDisconnected } = useAccount();
  const router = useRouter();
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  console.log(user, "user");
  console.log(walletAddress, "walletAddress");
  console.log(contracts, "contracts");
  console.log(address, "address");

  const { context } = useAragonSDKContext();
  useEffect(() => {
    async function getUserInformation() {
      if (address) {
        setWalletAddress(address);
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${address}/email`))
          .then((snapshot) => {
            const data = snapshot.val();
            setResisterdEmail(data);
          })
          .catch((error) => {
            console.error(error);
          });
        await get(child(dbRef, `users/${address}/contracts`))
          .then((snapshot) => {
            const data = snapshot.val();
            console.log(data, "data");
            setUser(data);
            const keysArray = Object.keys(data);
            setContracts(keysArray);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        setWalletAddress("");
        console.log("no");
      }
    }
    getUserInformation();
  }, [address]);
  useEffect(() => {
    async function getDaoMembers() {
      console.log(context);
      if (context) {
        const client = new Client(context); // general purpose client allowing us to call getDao
        const daoAddressOrEns: string =
          "0x9f119c1ad06a49216d2dc6a16506fac76e9d9a58"; // or my-dao.dao.eth

        const dao: DaoDetails | null = await client.methods.getDao(
          daoAddressOrEns
        ); // returns details about our DAO
        setDao(dao);
      }
    }
    getDaoMembers();
  }, [context]);

  // データベースの参照を作成

  // Initialize Firebase

  const seeDB = () => {
    console.log(database);
  };

  const handleEmailChange = (e: any) => {
    const inputValue = e.target.value;
    setEmail(inputValue);
  };
  const handleDaoNameChange = (e: any) => {
    const inputValue = e.target.value;
    setDaoContractAddress(inputValue);
  };

  const getDAO = async () => {
    console.log(dao);
  };

  const resister = async () => {
    // TODO : Get contract address from Aragon DAO API
    // Resister email to Contract address table
    // TODO : Check same pair of dao and email are not resistered
    try {
      console.log("hello");
      const postData = {
        email,
      };
      const newPostKey = push(
        child(ref(database), "daos/" + daoContractAddress + "emails")
      ).key;
      console.log(newPostKey);

      set(
        ref(database, "daos/" + daoContractAddress + "/emails/" + newPostKey),
        postData
      );

      console.log("finish");
    } catch {
      console.log("error");
    }
  };

  const retrieve = async () => {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const HandleClick = (contractAddress: string) => {
    console.log(contractAddress, "handle contract");
    console.log(walletAddress, "handle address");
    router.push({
      pathname: "/setting",
      query: { contractAddress, address },
    });
  };
  const HandleClickAdd = () => {
    console.log(walletAddress, "walletAddresshandle");
    router.push({
      pathname: "/add",
      query: { address },
    });
  };

  const TestimonialContent = ({ children }: { children: ReactNode }) => {
    return (
      <Stack
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"lg"}
        m={5}
        p={8}
        rounded={"xl"}
        align={"center"}
        pos={"relative"}
        _hover={{
          border: "solid",
          borderColor: "purple",
        }}
        _after={{
          content: `""`,
          w: 0,
          h: 0,
          borderLeft: "solid transparent",
          borderLeftWidth: 16,
          borderRight: "solid transparent",
          borderRightWidth: 16,
          borderTop: "solid",
          // borderTopWidth: 16,
          borderTopColor: useColorModeValue("white", "gray.800"),
          pos: "absolute",
          // bottom: "-16px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {children}
      </Stack>
    );
  };
  const TestimonialHeading = ({ children }: { children: ReactNode }) => {
    return (
      <Heading as={"h3"} fontSize={"xl"}>
        {children}
      </Heading>
    );
  };
  const TestimonialText = ({ children }: { children: ReactNode }) => {
    return (
      <Text
        textAlign={"center"}
        color={useColorModeValue("gray.600", "gray.400")}
        fontSize={"sm"}
      >
        {children}
      </Text>
    );
  };

  const resisterEmail = () => {
    const postData = {
      email,
    };

    set(ref(database, `users/${walletAddress}/`), postData);
    window.location.reload();
  };

  const helloooo = () => {
    const hexString =
      "0000000000000000000000000000000000000000000000000000000063fe86f8";
    const number = BigInt("0x" + hexString);
    const date = new Date(Number(number) * 1000);
    console.log(date);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>RainbowKit App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <ConnectButton />
      </header>

      <main className={styles.main}>
        {walletAddress ? (
          <>
            {user && contracts && (
              <>
                <Heading>Your DAO list</Heading>
                {contracts.map((contractAddress) => {
                  console.log(contractAddress, "hey");
                  return (
                    <Box
                      key={contractAddress}
                      onClick={() => {
                        HandleClick(contractAddress);
                      }}
                    >
                      <TestimonialContent>
                        <TestimonialHeading>
                          {contractAddress}
                        </TestimonialHeading>
                        {/* <TestimonialText>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Auctor neque sed imperdiet nibh lectus feugiat nunc sem.
                    </TestimonialText> */}
                      </TestimonialContent>
                    </Box>
                  );
                })}
              </>
            )}
            {!resisterdEmail ? (
              <>
                <Text>Welcom to the DAyOri</Text>
                <Text>
                  Input your email address and get notification from DAO
                </Text>
                <Input
                  placeholder="email address"
                  size="md"
                  onChange={handleEmailChange}
                />
                <Button onClick={resisterEmail}>Resister</Button>
              </>
            ) : (
              <>
                <Divider m={10} />
                <Button onClick={HandleClickAdd}>Add DAO</Button>
              </>
            )}
            {/* <Input
              placeholder="dao name"
              size="md"
              onChange={handleDaoNameChange}
            />
            <Input
              placeholder="email address"
              size="md"
              onChange={handleEmailChange}
            />
            <Button onClick={resister}></Button>
            <Button onClick={seeDB}>DB</Button>
            <Button onClick={retrieve}>get</Button> */}
            {/* <Button onClick={getDAO}>DAO</Button> */}
          </>
        ) : (
          <>
            <Text>Hello</Text>
          </>
        )}
        {/* <Button onClick={helloooo}></Button> */}
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" target="_blank" rel="noopener noreferrer">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
