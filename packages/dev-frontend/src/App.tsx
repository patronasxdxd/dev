import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseModule from '@web3-onboard/coinbase'
import tahoModule from '@web3-onboard/taho'
import { Flex, Spinner, Heading, ThemeProvider} from "theme-ui";

import { getConfig } from "./config";
import theme from "./theme";

import { DisposableWalletProvider } from "./testUtils/DisposableWalletProvider";
import { ThresholdFrontend } from "./ThresholdFrontend";

const injected = injectedModule();
const coinbase = coinbaseModule();
const walletConnect = walletConnectModule();
const taho = tahoModule();

const wallets = [
  injected,
  taho,
  coinbase,
  walletConnect
]

const chains = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: getRpcUrl('0x1')
  },
  {
    id: '0x5',
    token: 'ETH',
    label: 'Goerli',
    rpcUrl: getRpcUrl('0x5')
  },
  {
    id: '0xaa36a7',
    token: 'ETH',
    label: 'Sepolia',
    rpcUrl: getRpcUrl('0xaa36a7')
  },
]

const appMetadata = {
  name: 'Connect Wallet Example',
  icon: '<svg>My App Icon</svg>',
  description: 'Example showcasing how to connect a wallet.',
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
  ]
}

const accountCenter = {
  enabled: false
}

const accountCenterOptions = {
  desktop: accountCenter,
  mobile: accountCenter
}

const web3Onboard = init({
  wallets,
  chains,
  appMetadata,
  accountCenter: accountCenterOptions
})

if (window.ethereum) {
  // Silence MetaMask warning in console
  Object.assign(window.ethereum, { autoRefreshOnNetworkChange: false });
}

function getRpcUrl(chainIdHex: '0x1' | '0x5' | '0xaa36a7') {
  const publicRpcUrls = {
    '0x1': 'https://mainnet.eth.aragon.network/',
    '0x5': 'https://goerli.eth.aragon.network/',
    '0xaa36a7': 'https://sepolia.eth.aragon.network/'
  };

  if (process.env.REACT_APP_INFURA_ID) {
    return `https://${chainIdHex === '0x1' ? 'mainnet' : chainIdHex === '0x5' ? 'goerli' : 'sepolia'}.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`;
  } else {
    return publicRpcUrls[chainIdHex];
  }
}

try {
  if (process.env.REACT_APP_DEMO_MODE === "true") {
    const ethereum = new DisposableWalletProvider(
      `http://${window.location.hostname}:8545`,
      "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
    );

    Object.assign(window, { ethereum });
  }
} catch (e) {}

// Start pre-fetching the config
getConfig().then(config => {
  // console.log("Frontend config:");
  // console.log(config);
  Object.assign(window, { config });
});

type EthersWeb3ReactProviderProps = {
  children: JSX.Element;
}

const OnboardProvider= ({ children }: EthersWeb3ReactProviderProps): JSX.Element => {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {children}
    </Web3OnboardProvider>
  );
};

const App = () => {
  const loader = (
    <Flex sx={{ alignItems: "center", justifyContent: "center", height: "75vh",  }}>
      <Spinner sx={{ m: 2, color: "text" }} size="32px" />
      <Heading>Loading...</Heading>
    </Flex>
  );
  return (
    <OnboardProvider>
      <ThemeProvider theme={theme}>
        <ThresholdFrontend loader={loader} />
      </ThemeProvider>
    </OnboardProvider>
  );
};

export default App;
