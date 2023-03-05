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
} from "firebase/database";
import { Client, DaoDetails } from "@aragon/sdk-client";
import { useAragonSDKContext } from "../context/AragonSDK";
import { useAccount } from "wagmi";
import { firebaseConfig } from "../utils/firebase";
import CaptionCarousel from "../components/Top";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [resisterdEmail, setResisterdEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [user, setUser] = useState({});
  const [contracts, setContracts] = useState<string[]>([]);
  const [dao, setDao] = useState<DaoDetails>();
  const { address,} = useAccount();
  const router = useRouter();
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

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
        const client = new Client(context);
        const daoAddressOrEns: string =
          "0x9f119c1ad06a49216d2dc6a16506fac76e9d9a58"; 

        const dao: DaoDetails | null = await client.methods.getDao(
          daoAddressOrEns
        ); 
        setDao(dao);
      }
    }
    getDaoMembers();
  }, [context]);

  const handleEmailChange = (e: any) => {
    const inputValue = e.target.value;
    setEmail(inputValue);
  };

  const getDAO = async () => {
    console.log(dao);
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

  const resisterEmail = () => {
    const postData = {
      email,
    };

    set(ref(database, `users/${walletAddress}/`), postData);
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>DAyOri</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <ConnectButton />
      </header>

      {/* <Stack> */}
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
            <CaptionCarousel></CaptionCarousel>
          </>
        )}
        {/* <Button onClick={helloooo}></Button> */}
      </main>
      {/* </Stack> */}

      <footer className={styles.footer}>
        <a href="https://rainbow.me" target="_blank" rel="noopener noreferrer">
          💖 DAyOri.org 2023 💖
        </a>
      </footer>
    </div>
  );
};

export default Home;
