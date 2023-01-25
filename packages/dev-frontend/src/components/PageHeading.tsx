import { Box, Card, Paragraph, Link, Heading } from "theme-ui";
import { InfoMessage } from "./InfoMessage";

type PageHeadingProps = {
  heading: string
  descriptionTitle?: string
  description: string | JSX.Element
  link: string
}

export const PageHeading = ({ heading, descriptionTitle, description, link }: PageHeadingProps): JSX.Element => {
  return <>
    <Heading as="h2" sx={{ ml: "1em", mt: "2.5em", fontWeight: "semibold" }}>
      {heading}
    </Heading>
    <Card sx={{ mr: [0, "2em"] }}>
      <Box sx={{ px: "2.5em", py: "1.5em" }}>
        <InfoMessage title={descriptionTitle || "About this functionality"}>
          <Paragraph sx={{ mb: "0.5em" }}>
            {description}
          </Paragraph>
          <Link variant="infoLink" href={link} target="_blank">
            Read more
          </Link>
        </InfoMessage>
      </Box>
    </Card>
  </>
};
