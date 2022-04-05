import { Theme, ThemeUIStyleObject } from "theme-ui";

const baseColors = {
  blue: "#1542cd",
  purple: "#7C08F9",
  cyan: "#2eb6ea",
  green: "#28c081",
  yellow: "#fd9d28",
  red: "#dc2c10",
  lightRed: "#ff755f",
  grey: "#e8eef3"
};

const colors = {
  primary: baseColors.purple,
  secondary: baseColors.blue,
  accent: baseColors.cyan,

  success: baseColors.green,
  warning: baseColors.yellow,
  danger: baseColors.red,
  dangerHover: baseColors.lightRed,
  info: baseColors.blue,
  border: baseColors.grey,
  invalid: "pink",

  menu: "#939393",
  text: "#293147",
  heading: "#6A7793",
  background: "white",
  muted: "#eaebed"
};

const buttonBase: ThemeUIStyleObject = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  ":enabled": { cursor: "pointer" }
};

const button: ThemeUIStyleObject = {
  ...buttonBase,

  px: "32px",
  py: "12px",

  color: "white",
  border: 1,

  fontWeight: "bold",

  ":disabled": {
    opacity: 0.5
  }
};

const buttonOutline = (color: string, hoverColor: string): ThemeUIStyleObject => ({
  color,
  borderColor: color,
  background: "none",

  ":enabled:hover": {
    color: "background",
    bg: hoverColor,
    borderColor: hoverColor
  }
});

const iconButton: ThemeUIStyleObject = {
  ...buttonBase,

  padding: 0,
  width: "40px",
  height: "40px",
  stroke: "#000",
  ":hover": {
    stroke: "#7C08F9",
  },

  background: "none",

  ":disabled": {
    color: "text",
    opacity: 0.25
  }
};

const cardHeadingFontSize = 18.7167;

const cardGapX = [0, 3, 4];
const cardGapY = [3, 3, 4];

const card: ThemeUIStyleObject = {
  position: "relative",
  mt: cardGapY,
  boxShadow: [1, null, 1]
};

const infoCard: ThemeUIStyleObject = {
  ...card,

  padding: 3,

  borderColor: "rgba(122,199,240,0.4)",
  background: "linear-gradient(200deg, #d4d9fc, #cae9f9)",

  h2: {
    mb: 2,
    fontSize: cardHeadingFontSize
  }
};

const formBase: ThemeUIStyleObject = {
  display: "block",
  width: "auto",
  flexShrink: 0,
  padding: 2,
  fontSize: 3
};

const formCell: ThemeUIStyleObject = {
  ...formBase,

  bg: "background",
  border: 1,
  borderColor: "muted",
  borderRadius: 0,
  boxShadow: [1, 2]
};

const overlay: ThemeUIStyleObject = {
  position: "absolute",

  left: 0,
  top: 0,
  width: "100%",
  height: "100%"
};

const modalOverlay: ThemeUIStyleObject = {
  position: "fixed",

  left: 0,
  top: 0,
  height: "100vh"
};

const columns: ThemeUIStyleObject = {
  display: "flex",
  flexWrap: "wrap",
  justifyItems: "center"
};

const headerGradient: ThemeUIStyleObject = {
  background: `linear-gradient(90deg, ${colors.background}, ${colors.muted})`
};

const theme: Theme = {
  breakpoints: ["45em", "80em", "140em"],

  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],

  fonts: {
    body: [
      "Roboto",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "sans-serif"
    ].join(", "),
    heading: "inherit",
    monospace: "Menlo, monospace"
  },

  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],

  fontWeights: {
    body: 400,
    heading: 600,

    light: 200,
    medium: 500,
    bold: 600,
    extrabold: 700,
  },

  lineHeights: {
    body: 1.5,
    heading: 1.25
  },

  colors,

  borders: [0, "1px solid", "2px solid"],

  shadows: ["0", "0px 4px 8px rgba(41, 49, 71, 0.1)", "0px 8px 16px rgba(41, 49, 71, 0.1)"],

  text: {
    address: {
      fontFamily: "monospace",
      fontSize: 1
    }
  },

  buttons: {
    primary: {
      ...button,

      bg: "primary",
      borderColor: "primary",

      ":enabled:hover": {
        bg: "secondary",
        borderColor: "secondary"
      }
    },

    outline: {
      ...button,
      ...buttonOutline("primary", "secondary")
    },

    cancel: {
      ...button,
      ...buttonOutline("text", "text"),

      opacity: 0.8
    },

    danger: {
      ...button,

      bg: "danger",
      borderColor: "danger",

      ":enabled:hover": {
        bg: "dangerHover",
        borderColor: "dangerHover"
      }
    },

    icon: {
      ...iconButton,
      color: "primary",
    },

    dangerIcon: {
      ...iconButton,
      color: "danger",
      ":enabled:hover": { color: "dangerHover" }
    },

    titleIcon: {
      ...iconButton,
      color: "text",
      ":enabled:hover": { color: "success" }
    }
  },

  cards: {
    primary: {
      ...card,

      padding: 0,

      borderColor: "muted",
      bg: "background",

      "> h2": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",

        height: "56px",

        pl: 3,
        py: 2,
        pr: 2,

        bg: "muted",

        fontSize: cardHeadingFontSize
      }
    },

    info: {
      ...infoCard,

      display: "block"
    },

    mainCards: {
      ...card,

      color: "heading",
      fontWeight: "medium",


      py: "2.3em",
      px: "1em",
      backgroundColor: "background",
      borderRadius: "12px",
      display: "block"
    },

    infoPopup: {
      ...infoCard,

      position: "fixed",
      top: 0,
      right: 3,
      left: 3,
      mt: "72px",
      height: "80%",
      overflowY: "scroll",
      bg: "white"
    },

    tooltip: {
      padding: 2,

      border: 1,
      borderColor: "muted",
      borderRadius: "4px",
      bg: "background",
      boxShadow: 2,

      fontSize: 1,
      color: "heading",
      fontWeight: "body",
      zIndex: 1
    }
  },

  forms: {
    label: {
      ...formBase
    },

    unit: {
      ...formCell,

      textAlign: "center",
      bg: "muted"
    },

    input: {
      ...formCell,

      flex: 1
    },

    editor: {}
  },

  layout: {

    userAccount: {
      display: "flex",
      alignItems: "center", 
      bg: "black",
      px: "1em",
      py: ".5em",
      gap: "1em",
      backgroundColor: "#EDF2F7",
      borderRadius: ".5em"
    },
    
    account: {
      display: "flex",
      px: "1em",
      py: ".1em", 
      bg:"white", 
      justifyContent: "center",
      backgroundColor: "#CBD5E0",
      borderRadius: ".4em"
    },

    header: {
      
      display: "flex",
      justifyContent: "space-between",
      alignItems: "stretch",

      position: "fixed",
      width: "100vw",
      top: 0,
      zIndex: 1,

      px: ["1.5em", "2.5em"],
      py: "19px",

      borderBottom: 1,
      borderColor: "border",
      background: "white"
    },

    sideBar: {
      display: ["none", "flex"],
      justifyContent: "space-between",
      alignItems: "stretch",

      position: "fixed",
      height: "100%",
      width: [0, "15em", "19em"],
      top: 0,
      zIndex: 0,
      borderRight: 1,
      borderColor: "border",
      background: "white",
      pt: "7em",
    },

    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      mt: cardGapY,
      px: 3,
      minHeight: "72px",

      bg: "muted"
    },

    wrapper: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      backgroundColor: "#F7FAFC"
    },

    main: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      maxWidth: ["728px","1640px"],
      mx: ["auto"],
      mt: ["100px", "100px", "80px"],
      mb: ["40px", "40px"],
      pl: [0, "17.5em", "22em"],
      px: ["1.5em",]
    },

    columns: {
      ...columns
    },

    pageColumns: {
      ...columns,
      maxWidth: "1100px"      
    },

    left: {
      pr: cardGapX,
      width: ["100%", "50%", "33%"]
    },

    middle: {
      pr: cardGapX,
      width: ["100%", "50%", "33%"]
    },

    right: {
      pr: cardGapX,
      width: ["100%", "100%", "33%"]
    },

    firstHalf: {
      pr: cardGapX,
      width: ["100%", "100%", "50%"]
    },

    secondHalf: {
      pr: cardGapX,
      width: ["100%", "100%", "50%"]
    },

    actions: {
      justifyContent: "flex-end",
      mt: 2,

      button: {
        ml: 2
      }
    },

    disabledOverlay: {
      ...overlay,

      bg: "rgba(255, 255, 255, 0.5)"
    },

    modalOverlay: {
      ...modalOverlay,

      bg: "white",

      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },

    modal: {
      padding: 3,
      width: ["100%", "40em"]
    },

    infoOverlay: {
      ...modalOverlay,

      display: ["block", "none"],
    },

    infoMessage: {
      display: "flex",
      justifyContent: "center",
      m: 3,
      alignItems: "center",
      minWidth: "128px"
    },

    sidenav: {
      display: "flex",
      mt: "5em",
      pt: "1em",
      height: "100%",
      width: "17em",
      position: "absolute",
      borderLeft: 1,
      borderColor: "border",
      bg: "white",
      right: 0,
    },

    badge: {
      border: 0,
      borderRadius: 3,
      p: 1,
      px: 2,
      backgroundColor: "muted",
      color: "slate",
      fontSize: 1,
      fontWeight: "body"
    },

  },

  styles: {
    root: {
      position: "relative",

      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",

      width: "100%",
      height: "100%",

      "#root": {
        height: "100%"
      }
    },

    a: {
      color: "primary",
      ":hover": { color: "accent" },
      textDecoration: "none",
      fontWeight: "bold"
    },
  },

  links: {
    nav: {
      display: "flex",
      alignItems: "center", 
      mb: 2,
      px: 2,
      py: 1,
      pl: "3em",
      fontWeight: "semibold",
      fontSize: ".9rem",
      textTransform: "capitalize",
      mt: [3],
      color: "menu",
      gap: "1em",
      textDecoration: "none",
      ":hover, :enabled": {
        color: "primary",
      },
    },
    socialIcons: {
      display: "flex",
      mx: 3,
      mt: 4,
      mb: ["6em", "2em"],
      color: "primary",
      ":hover, :enabled": {
        color: "primary",
      },
    },
    logo: {
      display: "flex",
      alignItems: "center",
      color: "black",
      ":visited": {
        color: "black",
      },
    },
  }
};

export default theme;
