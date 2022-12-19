import React, { useState, useEffect } from "react";
import { Card, Box, Heading, Flex, Button, Label, Input } from "theme-ui";

import { Decimal, LiquityStoreState as ThresholdStoreState } from "@liquity/lib-base";
import { useLiquitySelector as useThresholdSelector } from "@liquity/lib-react";

import { useThreshold } from "../hooks/ThresholdContext";

import { Icon } from "./Icon";
import { Transaction } from "./Transaction";

const select = ({
  price
}: ThresholdStoreState) => ({
  price
});

export const PriceManager = () => {
  const { threshold } = useThreshold();
  const thresholdSelector = useThresholdSelector(select);
  const [editedPrice, setEditedPrice] = useState<string>();

  useEffect(() => {
    if (thresholdSelector) {
      // TODO needs to set dynamic versioning
      setEditedPrice(thresholdSelector.v1.price.toString(2));
    }
  }, [thresholdSelector]);

  return (
    <Card>
      <Heading>Price feed</Heading>
      <Box sx={{ p: [2, 3] }}>
        <Flex sx={{ alignItems: "stretch" }}>
          <Label>ETH</Label>

          <Label variant="unit">$</Label>
          {(editedPrice && threshold) &&
            <Input
              // TODO needs to set dynamic versioning
              type={threshold.v1.connection._priceFeedIsTestnet ? "number" : "text"}
              step="any"
              value={editedPrice}
              onChange={e => setEditedPrice(e.target.value)}
              disabled={!threshold.v1.connection._priceFeedIsTestnet}
            />
          }
          {threshold.v1.connection._priceFeedIsTestnet && (
            <Flex sx={{ ml: 2, alignItems: "center" }}>
              <Transaction
                id="set-price"
                tooltip="Set"
                tooltipPlacement="bottom"
                send={overrides => {
                  if (!editedPrice) {
                    throw new Error("Invalid price");
                  }
                  // TODO needs to set dynamic versioning
                  return threshold.v1.send.setPrice(Decimal.from(editedPrice), overrides);
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
};
