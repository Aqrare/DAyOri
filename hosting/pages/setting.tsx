import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { initializeApp } from "firebase/app";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spacer,
  Stack,
  Switch,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  push,
  update,
} from "firebase/database";
import { firebaseConfig } from "../utils/firebase";
import { createObjectFromKeysValues } from "../utils/utils";

interface SettingsProps {
  contractAddress: string;
  address: string;
}

const Settings: NextPage<SettingsProps> = ({ contractAddress, address }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [notificationConfig, setNotificationConfig] = useState({});
  const [notificationKeys, setotificationKeys] = useState<string[]>([]);
  const [notificationList, setNotificationList] = useState([]);

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  console.log(contractAddress, "setting, contractaddress");
  console.log(address, "setting, address");

  useEffect(() => {
    async function getUserNotification() {
      if (address && contractAddress) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${address}/email`))
          .then((snapshot) => {
            const data = snapshot.val();
            setEmail(data);
          })
          .catch((error) => {
            console.error(error);
          });
        await get(child(dbRef, `users/${address}/contracts/${contractAddress}`))
          .then((snapshot) => {
            const data = snapshot.val();
            setNotificationConfig(data);
            const obj = Object.values(data);
            setNotificationList(obj);
            const keys = Object.keys(data);
            setotificationKeys(keys);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        console.log("no");
      }
    }
    getUserNotification();
  }, [address, contractAddress]);

  console.log(notificationList);

  const handleChange = (index) => {
    const array = [...notificationList];
    array[index] = !array[index];
    setNotificationList(array);
  };

  const save = async () => {
    try {
      const obj = createObjectFromKeysValues(
        notificationKeys,
        notificationList
      );
      const updates = {};
      updates[`users/${address}/contracts/${contractAddress}/`] = obj;
      notificationKeys.forEach(async (key) => {
        updates[`daos/${contractAddress}/${key}/${address}`] = email;
      });
      console.log(obj);
      await update(ref(database), updates);
      console.log("finish");
    } catch {
      console.log("error");
    }
    // updates[`daos/`]
  };

  return (
    <div className={styles.container}>
      <header>
        <ConnectButton />
      </header>
      <main className={styles.main}>
        <Heading>{contractAddress}</Heading>
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
        <Flex m={5}>
          <Button m={2} onClick={() => router.push("/")}>
            Back
          </Button>
          <Spacer />
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

Settings.getInitialProps = ({ query }: NextPageContext): SettingsProps => {
  const { contractAddress, address } = query;
  return {
    contractAddress:
      typeof contractAddress === "string"
        ? contractAddress
        : contractAddress[0],
    address: typeof address === "string" ? address : address[0],
  };
};

export default Settings;
