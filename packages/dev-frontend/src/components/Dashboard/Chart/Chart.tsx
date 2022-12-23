import React from "react";
import { Card } from "theme-ui";

import { LineChart } from "./LineChart";

type ChartCardProps = {
  variant?: string;
};

export const Chart = ({ variant = "mainCards" }: ChartCardProps): JSX.Element => {
  return (
    <Card {...{ variant }}>
      <LineChart />
    </Card>
  );
};
