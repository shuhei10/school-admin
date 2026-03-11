import { useState } from "react";
import { Box, Button, Paper, TextField, Typography, useTheme, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const nav = useNavigate();
  const theme = useTheme();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      nav("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "ログインに失敗しました。認証情報を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        background: theme.palette.background.default,
      }}
    >
      {/* Left Side: Visual / Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          bgcolor: theme.palette.primary.dark,
          // Using a subtle CSS gradient as default. 
          // Realistically you might put a nice school/university photo here.
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "150%",
            height: "150%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)",
            top: "-25%",
            left: "-25%",
            animation: "pulse 15s infinite alternate",
            "@keyframes pulse": {
              from: { transform: "scale(1)" },
              to: { transform: "scale(1.2)" },
            },
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1, p: 6, color: "white", textAlign: "center", maxWidth: 600 }}>
          <Typography variant="h2" mb={2} fontFamily="Outfit, sans-serif" fontWeight={700}>
            WAVE STUDIO
          </Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9, lineHeight: 1.6 }}>
            クリエイティブな学び。確かな成果。<br />
            管理者から受講生まで、効率的なスクールライフをここで。
          </Typography>
        </Box>
      </Box>

      {/* Right Side: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 4, md: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            width: "100%",
            maxWidth: 480,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          }}
        >
          <Box mb={4}>
            <Typography variant="h4" fontWeight={700} color="text.primary" fontFamily="Outfit, sans-serif" mb={1}>
              ログイン
            </Typography>
            <Typography variant="body1" color="text.secondary">
              アカウント情報を入力してログインしてください。
            </Typography>
          </Box>

          <form onSubmit={handleLogin} noValidate>
            <TextField
              fullWidth
              label="メールアドレス"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="パスワード"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="パスワードの表示を切り替える"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Box
                sx={{
                  backgroundColor: "error.light",
                  color: "error.contrastText",
                  p: 1.5,
                  borderRadius: 2,
                  mb: 3,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {error}
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                textTransform: "none",
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}