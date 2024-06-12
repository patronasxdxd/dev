import { supportedNetworks } from "../hooks/ThresholdContext";

export type ThresholdSourceConfig = {
  testnetOnly?: boolean;
} & {
    [key: string]: {
      blocksApiUrl?: string;
      thresholdUsdApiUrl?: string;
    };
  };

export type ThresholdConfig = {
  testnetOnly?: boolean;
  blocksApiUrl?: string;
  thresholdUsdApiUrl?: string;
  isUnsupportedNetwork?: boolean;
};

const defaultConfig: ThresholdConfig = {
};

function hasKey<K extends string>(o: object, k: K): o is Record<K, unknown> {
  return k in o;
}

const parseConfig = (json: unknown, chainId?: number): ThresholdConfig => {
  const config = { ...defaultConfig };

  if (typeof json === "object" && json !== null) {
    if (hasKey(json, "testnetOnly")) {
      const { testnetOnly } = json;

      if (typeof testnetOnly === "boolean") {
        config.testnetOnly = testnetOnly;
      } else {
        console.error("Malformed testnetOnly:");
        console.log(testnetOnly);
      }
    }

    if (!chainId || !hasKey(json, supportedNetworks[chainId.toString()])) {
      config.isUnsupportedNetwork = true;
      return config;
    }

    const network = supportedNetworks[chainId.toString()];
    const chartSubgraphInfo = json[network];

    if (typeof chartSubgraphInfo === "object" && chartSubgraphInfo !== null) {
      if (hasKey(chartSubgraphInfo, "blocksApiUrl") && chartSubgraphInfo.blocksApiUrl !== "") {
        const { blocksApiUrl } = chartSubgraphInfo;
        if (typeof blocksApiUrl === "string") {
          config.blocksApiUrl = blocksApiUrl;
        } else {
          console.error("Malformed blocksApiUrl:");
          console.log(blocksApiUrl);
        }
      }

      if (hasKey(chartSubgraphInfo, "thresholdUsdApiUrl") && chartSubgraphInfo.thresholdUsdApiUrl !== "") {
        const { thresholdUsdApiUrl } = chartSubgraphInfo;

        if (typeof thresholdUsdApiUrl === "string") {
          config.thresholdUsdApiUrl = thresholdUsdApiUrl;
        } else {
          console.error("Malformed thresholdUsdApiUrl:");
          console.log(thresholdUsdApiUrl);
        }
      }
    }
  } else {
    console.error("Malformed config:");
    console.log(json);
  }

  config.isUnsupportedNetwork = false
  return config;
};

let configPromise: Promise<ThresholdConfig> | undefined = undefined;

const fetchConfig = async (chainid?: number) => {
  try {
    const response = await fetch("config.json");

    if (!response.ok) {
      throw new Error(`Failed to fetch config.json (status ${response.status})`);
    }

    return parseConfig(await response.json(), chainid);
  } catch (err) {
    console.error(err);
    return { ...defaultConfig };
  }
};

export const getConfig = (chainid?: number): Promise<ThresholdConfig> => {
  configPromise = fetchConfig(chainid);
  return configPromise;
};
