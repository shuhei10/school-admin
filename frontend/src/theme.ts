import { createTheme } from "@mui/material/styles";
import type { } from "@mui/x-data-grid/themeAugmentation";
import { jaJP } from "@mui/material/locale";
import { jaJP as dataGridJaJP } from "@mui/x-data-grid/locales";

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  palette: {
    primary: {
      main: "#4F46E5", // Indigo-500
      light: "#818CF8",
      dark: "#3730A3",
    },
    secondary: {
      main: "#10B981", // Emerald-500
      light: "#34D399",
      dark: "#059669",
    },
    background: {
      default: "#F8FAFC", // Slate-50
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A", // Slate-900
      secondary: "#64748B", // Slate-500
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 24px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
            transform: "translateY(-1px)",
          },
        },
        containedSecondary: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        },
        elevation2: {
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4F46E5",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #F1F5F9",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8FAFC",
            borderBottom: "2px solid #E2E8F0",
            color: "#64748B",
            fontWeight: 600,
          },
          "& .MuiDataGrid-row": {
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "#F8FAFC !important",
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #E2E8F0",
          },
        },
      },
    },
  },
}, jaJP, dataGridJaJP);
