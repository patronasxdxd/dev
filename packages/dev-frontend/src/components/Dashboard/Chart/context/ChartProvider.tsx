import React, { useState, useEffect } from "react";

import { createClient } from "urql";
import { ChartContext } from "./ChartContext";

import { useLiquity } from "../../../../hooks/LiquityContext";

export type TimestampsObject = {
  universalTimestamp: number, 
  localTimestamp: number
}
export type BlockObject = {
  number?: string, 
  __typename?: string
};
export type tvlData = {
  totalCollateral: number, 
  blockNumber: number
};
export type FunctionalPanelProps = {
  loader?: React.ReactNode;
};

const fetchBlockByTimestamp = (timestamp: number, BlocksApiUrl: string) => {
  const query = `
  query {
    blocks(
      first: 1
      orderBy: number, 
      orderDirection: desc, 
      where: {
        timestamp_gte: "${timestamp - 600}", 
        timestamp_lt: "${timestamp}"
      }
    ){
      number
    }
  }`
  return fetchData(BlocksApiUrl, query);
};

const fetchTvlByBlock = (blockNumber: number, ThresholdUsdApiUrl: string) => {
  const query = `
  query {
    systemStates(
      first: 1
      orderBy: sequenceNumber
      orderDirection: desc
      block: {
        number: ${blockNumber}
      }
    ) {
      totalCollateral
    }
  }`
  return fetchData(ThresholdUsdApiUrl, query);
};

export const createListOfTimestamps = (): Array<TimestampsObject> => {
  const currentTimeZoneOffsetInSeconds  = new Date().getTimezoneOffset() * 90;
  const currentDate = Math.floor((Date.now() / 1000) - 60) // Get a date object for the current time;
  const deltaPerPeriod = 86400; // Every 24 hours (in secs)
  const numberOfPeriods = 30; // Period of 30 days
  const startingTimestamp = currentDate - (deltaPerPeriod * numberOfPeriods); // Set it 30 days ago (in secs)
  const timestamps: Array<TimestampsObject> = [];

  for (let i = 0; i < numberOfPeriods + 1; i++) {
    timestamps.push({universalTimestamp: startingTimestamp + i * deltaPerPeriod, localTimestamp: (startingTimestamp + i * deltaPerPeriod) - currentTimeZoneOffsetInSeconds}); // [1590969600, 1591056000, ...]
  }; // iterating the period of time to build up an array with the timestamp for each day (in secs)
  return timestamps;
};

export const queryBlocksByTimestamps = async (timestamps: Array<TimestampsObject>, BlocksApiUrl: string): Promise<Array<BlockObject>> => {
  const Blocks = timestamps.map(async (timestamp): Promise<BlockObject> => {
    const blocksData = await fetchBlockByTimestamp(timestamp.universalTimestamp, BlocksApiUrl);
    return blocksData.data.blocks[0];
  })
  return Promise.all(Blocks);
};

export const queryTvlByBlocks = async (blocks: Array<BlockObject>, ThresholdUsdApiUrl: string): Promise<Array<tvlData>> => {
  const tvlData: Array<Promise<tvlData>> = blocks.map(async (block) => {
    const blockNumber: number = Number(block.number);
    return fetchTvlByBlock(blockNumber, ThresholdUsdApiUrl).then((result) => {
      const tvlValue: tvlData = result.data ? {
        totalCollateral: Number(result.data.systemStates[0].totalCollateral), 
        blockNumber: blockNumber
      } : {
        totalCollateral: 0, 
        blockNumber: blockNumber
      };
      return tvlValue;
    });
  });
  return Promise.all(tvlData);
};

export const queryTvl = async (BlocksApiUrl: string, ThresholdUsdApiUrl: string):  Promise<Array<tvlData>> => {
  const timestamps: Array<TimestampsObject> = createListOfTimestamps();
  return queryBlocksByTimestamps(timestamps, BlocksApiUrl).then(
    async (blocks) => {
      const tvl = await queryTvlByBlocks(blocks, ThresholdUsdApiUrl);
      return tvl;
    }
  );
};

async function fetchData(API_URL: string, query: string) {
  const client = createClient({
    url: API_URL
  });
  const response = await client.query(query).toPromise();
  return response;
};

export const ChartProvider: React.FC<FunctionalPanelProps> = ({ children, loader })  => {
  const timestamps: Array<TimestampsObject> = createListOfTimestamps();
  const [ isTVLDataAvailable , SetisTVLDataAvailable ] = useState<boolean>(true);
  const [ tvl, setTvl ] = useState<Array<tvlData>>();
  const [ isMounted, setIsMounted ] = useState<boolean>(true);
  const { config, provider } = useLiquity();
  const { BlocksApiUrl, ThresholdUsdApiUrl } = config;

  const getTVLData = () => {
    return provider.getNetwork()
    .then((network) => {
      const networkName = network.name === 'homestead' ? 'ethereum' : network.name;
      const BlocksUrlByNetwork = `https://${BlocksApiUrl}/${networkName}-blocks`;
      const ThresholdUrlByNetwork = `https://${ThresholdUsdApiUrl}/${networkName}-thresholdusd`;
      return queryTvl(BlocksUrlByNetwork, ThresholdUrlByNetwork)
        .then((result) => setTvl(result));
    })
    .catch((error) => {
      SetisTVLDataAvailable(false);
      console.error('failed to fetch tvl: ', error);
    });
  }
  
  useEffect(() => {
    if (isMounted) {
      getTVLData();
      setInterval(() => {
        getTVLData();
      }, 90000); //Fetch TVL every 90 seconds
    };
    return () => {
      setIsMounted(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  if (!BlocksApiUrl || !ThresholdUsdApiUrl) {
    console.error(`You must add a config.json file into the public source folder.`)
    return <>{children}</>
  };

  if (!isTVLDataAvailable) {
    return <>{children}</>
  };

  if (!timestamps || !tvl) {
    return <>{loader}</>
  };

  const chartProvider = {
    tvl,
    timestamps
  };
  return <ChartContext.Provider value={chartProvider}>{children}</ChartContext.Provider>;
};
