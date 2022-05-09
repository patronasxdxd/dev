import { Card, Flex, Paragraph, Text } from "theme-ui";

import { InfoMessage } from "../InfoMessage";

type DisabledRedemptionProps = {
  disabledDays: number;
  unlockDate: Date;
};

export const DisabledRedemption: React.FC<DisabledRedemptionProps> = ({
  disabledDays,
  unlockDate
}) => (
  <Card variant="mainCards">
    <Card variant="layout.columns">
      <Flex sx={{
        width: "100%",
        gap: 1,
        pb: "1em",
        borderBottom: 1, 
        borderColor: "border"
      }}>
        Redeem
      </Flex>

      <Flex sx={{
          width: "100%",
          flexDirection: "column",
          px: ["1em", 0, "1.6em"],
          gap: "1em",
          my: 4
      }}>
        <InfoMessage
          title="Redemption is not enabled yet."
        >
          <Paragraph>
            LUSD redemption is disabled for the first {disabledDays} days after launch.
          </Paragraph>

          <Paragraph sx={{ mt: 3 }}>
            It will be unlocked at{" "}
            <Text sx={{ fontWeight: "medium" }}>{unlockDate.toLocaleString()}</Text>.
          </Paragraph>
        </InfoMessage>
      </Flex>
    </Card>
  </Card>
);
