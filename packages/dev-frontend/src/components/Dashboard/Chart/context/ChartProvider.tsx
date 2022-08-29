import React, { useState, useEffect } from "react";

import { createClient } from "urql";
import { ChartContext } from "./ChartContext";

export type BlockObject = {
  number?: string, 
  __typename?: string
}

export type tvlData = {
  totalCollateral: number, 
  blockNumber: number
}

const BLOCKS_API_URL = "https://api.thegraph.com/subgraphs/name/blocklytics/goerli-blocks";
const THRESHOLD_USD_API_URL = "https://api.thegraph.com/subgraphs/name/evandrosaturnino/thresholdusd"

const fetchBlockByTimestamp = (timestamp: number) => {
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
  }
`
  return fetchData(BLOCKS_API_URL, query)
};

const fetchTvlByBlock = (blockNumber: number) => {
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
  return fetchData(THRESHOLD_USD_API_URL, query)
};

export const createListOfTimestamps = (): Array<number> => {
  const currentDate = Math.floor((Date.now() / 1000) - 120) // Get a date object for the current time;
  
  const deltaPerPeriod = 86400; // Every 24 hours (in secs)
  const numberOfPeriods = 30; // For 14 days
  const startingTimestamp = currentDate - (deltaPerPeriod * numberOfPeriods); // Set it 14 days ago (in secs)

  const timestamps: Array<number> = [];

  for (let i = 0; i < numberOfPeriods + 1; i++) {
    timestamps.push(startingTimestamp + i * deltaPerPeriod); // [1590969600, 1591056000, ...]
  }; // iterating the period of time to build up an array with the timestamp for each day (in secs)

  return timestamps;
};

export const queryBlocksByTimestamps = async (timestamps: Array<number>): Promise<Array<BlockObject>> => {
  const blocks: Array<BlockObject> = [];

  for (const timestamp of timestamps) {
    const blocksData = await fetchBlockByTimestamp(timestamp);
    const block: BlockObject = blocksData.data.blocks[0];
    blocks.push(block);
  }; // iterating the timestamps array to query one block for each day

  return blocks;
};

export const queryTvlByBlocks = async (blocks: Array<BlockObject>): Promise<Array<tvlData>> => {
  const tvl: Array<tvlData> = [];

  for (const block of blocks) {
    const blockNumber: number = Number(block.number);
    const tvlData = await fetchTvlByBlock(blockNumber);
    const tvlValue: tvlData = tvlData.data ? {
      totalCollateral: Number(tvlData.data.systemStates[0].totalCollateral), 
      blockNumber: blockNumber
    } : {
        totalCollateral: 0, 
        blockNumber: blockNumber
      };
    tvl.push(tvlValue);
  }; // iterating the blocks array to query the tvl of each day

  return tvl;
};

export const queryTVL = async ():  Promise<Array<tvlData>> => {
  const timestamps: Array<number> = createListOfTimestamps();
  const blocks: Array<BlockObject> = await queryBlocksByTimestamps(timestamps);
  const tvl: Array<tvlData> = await queryTvlByBlocks(blocks);
  return tvl;
}

async function fetchData(API_URL: string, query: string) {
  const client = createClient({
    url: API_URL
  });

  const response = await client.query(query).toPromise();
  return response;
}

export const ChartProvider: React.FC = props => {
  const { children } = props;
  const timestamps: Array<number> = createListOfTimestamps();
  const [tvl, setTvl] = useState<Array<tvlData>>([]);
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (isMounted) {
      queryTVL().then(
        (result) => {
          if (!isMounted) return null
          return setTvl(result);
        }
      );
    }
    return () => { 
      setIsMounted(false);
    };
  }, [isMounted, tvl]);

  const provider = {
    tvl,
    timestamps
  };
  return <ChartContext.Provider value={provider}>{children}</ChartContext.Provider>;
};
