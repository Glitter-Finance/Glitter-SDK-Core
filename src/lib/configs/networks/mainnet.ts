import { BridgeNetworks } from "../../common/networks/networks";
import { GlitterBridgeConfig } from "../config";

export const BridgeMainnet: GlitterBridgeConfig = {
  name: "mainnet",
  algorand: {
    name: "mainnet",
    serverUrl: "https://node.algoexplorerapi.io",
    serverPort: "",
    indexerUrl: "https://algoindexer.algoexplorerapi.io",
    indexerPort: "",
    nativeToken: "",
    appProgramId: 813301700,
    accounts: {
      asaOwner: "A3OSGEZJVBXWNXHZREDBB5Y77HSUKA2VS7Y3BWHWRBDOWZ5N4CWXPVOHZE",
      algoOwner: "5TFPIJ5AJLFL5IBOO2H7QXYLDNJNSQYTZJOKISGLT67JF6OYZS42TRHRJ4",
      bridgeOwner: "HUPQIOAF3JZWHW553PGBKWXYSODFYUG5MF6V246TIBW66WVGOAEB7R6XAE",
      feeReceiver: "A2GPNMIWXZDD3O3MP5UFQL6TKAZPBJEDZYHMFFITIAJZXLQH37SJZUWSZQ",
      multiSig1: "JPDV3CKFABIXDVH36E7ZBVJ2NC2EQJIBEHCKYTWVC4RDDOHHOPSBWH3QFY",
      multiSig2: "DFFTYAB6MWMRTZGHL2GAP7TMK7OUGHDD2AACSO7LXSZ7SY2VLO3OEOJBQU",
      usdcReceiver: "GUSN5SEZQTM77WE2RMNHXRAKP2ELDM7GRLOEE3GJWNS5BMACRK7JVS3PLE",
      usdcDeposit: "O7MYJZR3JQS5RYFJVMW4SMXEBXNBPQCEHDAOKMXJCOUSH3ZRIBNRYNMJBQ",
      bridge: "XJQ25THCV734QIUZARPZGG3NPRFZXTIIU77JSJBT23TJMGL3FXJWVR57OQ",
      asaVault: "U4A3YARBVMT7PORTC3OWXNC75BMGF6TCHFOQY4ZSIIECC5RW25SVKNKV3U",
      algoVault: "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ",
    },
    tokens: [
      {
        network: "algorand",
        symbol: "ALGO",
        address: "",
        decimals: 6,
        min_transfer: 5,
        fee_divisor: 200,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "algorand",
        symbol: "USDC",
        address: 31566704,
        decimals: 6,
        min_transfer: 5,
        fee_divisor: 200,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "algorand",
        symbol: "xSOL",
        address: 792313023,
        decimals: 9,
        min_transfer: 0.05,
        fee_divisor: 200,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "algorand",
        symbol: "xGLI",
        address: 607591690,
        decimals: 6,
        min_transfer: undefined,
        fee_divisor: undefined,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
    ],
  },
  solana: {
    name: "mainnet-beta",
    server: "https://api.mainnet-beta.solana.com",
    accounts: {
      bridgeProgram: "GLittnj1E7PtSF5thj6nYgjtMvobyBuZZMuoemXpnv3G",
      vestingProgram: "EMkD74T2spV3A71qfY5PNqVNrNrpbFcdwMF2TerRMr9n",
      owner: "hY5PXHYm58H5KtJW4GrtegxXnpMruoX3LLP6CufHoHj",
      usdcReceiver: "GUsVsb8R4pF4T7Bo83dkzhKeY5nGd1vdpK4Hw36ECbdK",
      usdcReceiverTokenAccount: "HAtNq1ArsG9pyNCUn7HRMJWgdqCDGLYGPwyknPkbMDbZ",
      usdcDeposit: "9i8vhhLTARBCd7No8MPWqJLKCs3SEhrWKJ9buAjQn6EM",
      usdcDepositTokenAccount: "",
      memoProgram: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
      solVault: "7xCU4nvqu3Nz3BBQckKzibp3kBav4xbkuqQ3WM9CBHdJ",
    },
    tokens: [
      {
        network: "solana",
        symbol: "SOL",
        address: "11111111111111111111111111111111",
        decimals: 9,
        min_transfer: 0.05,
        fee_divisor: 200,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "solana",
        symbol: "xALGO",
        address: "xALGoH1zUfRmpCriy94qbfoMXHtK6NDnMKzT4Xdvgms",
        decimals: 6,
        min_transfer: 5,
        fee_divisor: 200,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "solana",
        symbol: "USDC",
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        decimals: 6,
        min_transfer: 1,
        fee_divisor: 200,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "solana",
        symbol: "xGLI",
        address: "FsPncBfeDV3Uv9g6yyx1NnKidvUeCaAiT2NtBAPy17xg",
        decimals: 6,
        min_transfer: undefined,
        fee_divisor: undefined,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      },
      {
        network: "solana",
        symbol: "RAY",
        address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        decimals: 6,
        min_transfer: undefined,
        fee_divisor: undefined,
        name: undefined,
        max_transfer: undefined,
        total_supply: undefined,
      }
    ],
  },
  evm: {
    [BridgeNetworks.Avalanche]: {
      chainId: 43114,
      bridge: "0x19a230a99d520687d9858e427523e5d76342ad54",
      rpcUrl: "https://rpc.ankr.com/avalanche",
      tokens: [
        {
          network: "avalanche",
          address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
          symbol: "USDC",
          decimals: 6,
          name: "USD Coin",
        },
      ],
      depositWallet: "0xa89a90a11e20b61814da283ba906f30742a99492",
      releaseWallet: "0xfdc25702b67201107ab4aFDb4DC87E3F8F50a7b8",
    },
    [BridgeNetworks.Ethereum]: {
      chainId: 1,
      bridge: "0x8b1B445749B14a6a01B062271EB28Cd119ce9a98",
      rpcUrl: "https://rpc.ankr.com/eth",
      tokens: [
        {
          network: "ethereum",
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          symbol: "USDC",
          decimals: 6,
          name: "USD Coin",
        },
      ],
      depositWallet: "0xa89a90a11e20b61814da283ba906f30742a99492",
      releaseWallet: "0xfdc027af59e3D118a19B8D1E754a090c95587438",
    },
    [BridgeNetworks.Polygon]: {
      chainId: 137,
      bridge: "0x3C649eed903d9770A5abDBA49C754AdfD1ed4172",
      rpcUrl: "https://rpc.ankr.com/polygon",
      tokens: [
        {
          network: "polygon",
          address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          symbol: "USDC",
          decimals: 6,
          name: "USD Coin",
        },
      ],
      depositWallet: "0xa89a90a11e20b61814da283ba906f30742a99492",
      releaseWallet: "0xfdc9Af7852F9b2d234b96B1F53804BC781Ce26b3",
    },
  },
  stellar: {
    accounts: {
      usdcDepositAddress: "GAFK7XFZHMLSNV7OJTBO7BAIZA66X6QIBV5RMZZYXK4Q7ZSO52J5C3WQ",
      usdcDepositTag: "5794940577887230301",
      usdcReceiverAddress: "",
      usdcReceiverTag: ""
    }
  },
  hedera: {
    accounts: {
      usdcDepositAddress: "0.0.439415",
      usdcDepositTag: "6461445716",
      usdcReceiverAddress: "",
      usdcReceiverTag: ""
    }
  },
  tron: {
    tokens: [
      {
        address: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6
      }
    ],
    fullNode: "https://api.trongrid.io",
    solidityNode: "https://api.trongrid.io",
    eventServer: "https://api.trongrid.io",
    addresses: {
      bridge: "TQh7hLbfhjj2tcx7ehBKGkTnSn2tUChESw",
      depositWallet: "TAG83nhpF82P3r9XhFTwNamgv1BsjTcz6v",
      releaseWallet: "TGUSL4VtESnWQfy2G6RmCNJT6eqqfcR6om"
    }
  },
  flow: {
    accounts: {
      usdcDeposit: "0x1fafdb9e814dfe06",
      usdcReceiver: "",
    }
  }
};
