import { Card } from "theme-ui";
import { Percent, LiquityStoreState, Decimal} from "@threshold-usd/lib-base";
import { useThresholdSelector } from "@threshold-usd/lib-react";

import { TopCard } from "./TopCard";

import { useCallback, useEffect, useState } from "react";
import { fetchCoinGeckoPrice } from "./Chart/context/fetchCoinGeckoPrice";

type SystemStatsProps = {
  variant?: string;
};

type mintListApproved = {
  version: string;
  collateral: string;
  price: Decimal;
  amountOfCollateral: Decimal;
  mintList: boolean;
}

const coingeckoIdsBySymbol = {
  eth: "ethereum",
  tbtc: "tbtc"
}

const selector = ({
  mintList,
  price,
  total
}: LiquityStoreState) => ({
  mintList,
  price,
  amountOfCollateral: total.collateral,
});

export const TVL = ({ variant = "mainCards" }: SystemStatsProps): JSX.Element => {
  const thresholdSelectorStores = useThresholdSelector(selector)
  const [tvl, setTvl] = useState(Decimal.from(0))
  const [mintList, setMintList] = useState<mintListApproved[]>([])
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    if (!isMounted) {
      return
    }
    for (const thresholdSelectorStore of thresholdSelectorStores) {
      if (thresholdSelectorStore.store.mintList === true) {
        setMintList(prev => [...prev, {
          version: thresholdSelectorStore.version,
          collateral: thresholdSelectorStore.collateral,
          price: thresholdSelectorStore.store.price, 
          amountOfCollateral: thresholdSelectorStore.store.amountOfCollateral,
          mintList: true, 
        }])
      }
    }
    return () => {
      setIsMounted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const calculateTvl = useCallback(async (mintList: mintListApproved[]) => { 
    let tvl = Decimal.from(0)
    for (const collateral of mintList) {
      const coingeckoId = coingeckoIdsBySymbol[collateral.collateral as keyof typeof coingeckoIdsBySymbol]
      const { tokenPriceUSD } = await fetchCoinGeckoPrice(coingeckoId);
      const collateralTvl = tokenPriceUSD.mul(collateral.amountOfCollateral);
      tvl = tvl.add(collateralTvl)
    }
    return tvl;
  }, [mintList])
  
  useEffect(() => {
    if(mintList.length === 0) return
    calculateTvl(mintList).then((tvl) => {
      setTvl(tvl)
    })
  }, [mintList])

  return (
    <Card {...{ variant }} sx={{ width:"100%"}}>
      <TopCard 
        name="TVL"
        tooltip="The ratio of the Dollar value of the entire system collateral at the current collateral : USD price, to the entire system debt." 
        imgSrc="./icons/opened-vaults.svg"
      >
        {tvl.shorten()} USD
      </TopCard>
    </Card>
  );
};
