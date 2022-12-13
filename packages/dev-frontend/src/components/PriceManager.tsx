import React, { useState, useEffect } from "react";
import { Card, Box, Heading, Flex, Button, Label, Input } from "theme-ui";

import { Decimal, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";

import { Icon } from "./Icon";
import { Transaction } from "./Transaction";

const selectPrice = ({ price }: ThresholdStoreState) => price;

export const PriceManager = () => {
  const { threshold } = useThreshold();
  // TODO
  const price = useThresholdSelector(1, selectPrice);
  const [editedPrice, setEditedPrice] = useState(price.toString(2));

  useEffect(() => {
    setEditedPrice(price.toString(2));
  }, [price]);

  threshold.map((thresholdInstance) => {
    const { send: threshold, connection: { _priceFeedIsTestnet: canSetPrice } } = thresholdInstance
    
    return (
      <Card>
        <Heading>Price feed</Heading>

        <Box sx={{ p: [2, 3] }}>
          <Flex sx={{ alignItems: "stretch" }}>
            <Label>ETH</Label>

            <Label variant="unit">$</Label>

            <Input
              type={canSetPrice ? "number" : "text"}
              step="any"
              value={editedPrice}
              onChange={e => setEditedPrice(e.target.value)}
              disabled={!canSetPrice}
            />

            {canSetPrice && (
              <Flex sx={{ ml: 2, alignItems: "center" }}>
                <Transaction
                  id="set-price"
                  tooltip="Set"
                  tooltipPlacement="bottom"
                  send={overrides => {
                    if (!editedPrice) {
                      throw new Error("Invalid price");
                    }
                    return threshold.setPrice(Decimal.from(editedPrice), overrides);
                  }}
                >
                  <Button variant="icon">
                    <Icon name="chart-line" size="lg" />
                  </Button>
                </Transaction>
              </Flex>
            )}
          </Flex>
        </Box>
      </Card>
    );
  });
};
