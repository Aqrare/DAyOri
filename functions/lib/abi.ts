export const abi = [
  {
    inputs: [
      {
        internalType: "contract DAORegistry",
        name: "_registry",
        type: "address",
      },
      {
        internalType: "contract PluginSetupProcessor",
        name: "_pluginSetupProcessor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "NoPluginProvided", type: "error" },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "trustedForwarder",
            type: "address",
          },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "bytes", name: "metadata", type: "bytes" },
        ],
        internalType: "struct DAOFactory.DAOSettings",
        name: "_daoSettings",
        type: "tuple",
      },
      {
        components: [
          { internalType: "address", name: "pluginSetup", type: "address" },
          {
            internalType: "contract PluginRepo",
            name: "pluginSetupRepo",
            type: "address",
          },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        internalType: "struct DAOFactory.PluginSettings[]",
        name: "_pluginSettings",
        type: "tuple[]",
      },
    ],
    name: "createDao",
    outputs: [
      { internalType: "contract DAO", name: "createdDao", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "daoBase",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "daoRegistry",
    outputs: [
      { internalType: "contract DAORegistry", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pluginSetupProcessor",
    outputs: [
      {
        internalType: "contract PluginSetupProcessor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
