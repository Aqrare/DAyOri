// src/context/AragonSDK.tsx

import { createContext, useEffect, useContext, useState } from "react";

import { useSigner } from "wagmi";
import { Context, ContextParams } from "@aragon/sdk-client";

const AragonSDKContext = createContext({});

export function AragonSDKWrapper({ children }: any): JSX.Element {
  const [context, setContext] = useState<Context | undefined>(undefined);
  const signer = useSigner().data || undefined;

  useEffect(() => {
    const POCKET_ID = process.env.NEXT_PUBLIC_POCKET_ID;
    const IPFS_API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY || "";
    const aragonSDKContextParams: ContextParams = {
      network: "goerli", // mainnet, mumbai, etc
      signer,
      daoFactoryAddress: "0x16B6c6674fEf5d29C9a49EA68A19944f5a8471D3",
      web3Providers: [
        `https://eth-goerli.gateway.pokt.network/v1/lb/${POCKET_ID}`,
      ],
      ipfsNodes: [
        {
          url: "https://testing-ipfs-0.aragon.network/api/v0", // you should set up your own IPFS node locally
          headers: {
            "X-API-KEY": IPFS_API_KEY,
          },
        },
      ],
      graphqlNodes: [
        {
          url: "https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.0.0/api", // this will change based on the chain you're using
        },
      ],
    };
    setContext(new Context(aragonSDKContextParams));
  }, [signer]);

  return (
    <AragonSDKContext.Provider value={{ context }}>
      {children}
    </AragonSDKContext.Provider>
  );
}

export function useAragonSDKContext(): any {
  return useContext(AragonSDKContext);
}
