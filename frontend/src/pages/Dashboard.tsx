import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, Button, Stack } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdminOrInstructor = user?.role === "admin" || user?.role === "instructor";

  useEffect(() => {
    if (isAdminOrInstructor) {
      apiFetch<{ ok: true; kpi: any }>("/api/dashboard/kpi")
        .then((r) => {
          setData(r.kpi);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    } else {
      apiFetch<{ ok: true; enrolled_courses: any[] }>("/api/dashboard/student")
        .then((r) => {
          setData(r.enrolled_courses);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    }
  }, [isAdminOrInstructor]);

  if (loading) return <Box p={4}><Typography color="text.secondary">データを読み込み中...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
          color: "white",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          boxShadow: "0 10px 20px rgba(79, 70, 229, 0.2)"
        }}
      >
        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
          {isAdminOrInstructor ? <HandshakeIcon sx={{ fontSize: 32 }} /> : <Avatar src="/path-to-user-avatar.jpg" alt={user?.name} />}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800} fontFamily="Outfit, sans-serif">
            おかえりなさい、{user?.name || "ゲスト"}さん
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {isAdminOrInstructor
              ? "今日もスクールの状況を確認して、教育環境を最適化しましょう。"
              : "学習を再開して、目標達成に一歩近づきましょう！"}
          </Typography>
        </Box>
      </Paper>

      {isAdminOrInstructor ? (
        <>
          <Box mb={4}>
            <Typography variant="h5" fontWeight={700} fontFamily="Outfit, sans-serif" color="text.primary" gutterBottom>
              クイック統計
            </Typography>
          </Box>

          <Grid container spacing={3} mb={6}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={() => navigate("/students")}
                sx={{ cursor: "pointer", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 20px rgba(0,0,0,0.1)" }, transition: "all 0.2s" }}
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1} gutterBottom>
                        総学生数
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="text.primary">
                        {data?.students_total || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "primary.light", color: "white", display: "flex", opacity: 0.9 }}>
                      <PeopleAltOutlinedIcon fontSize="medium" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={() => navigate("/courses")}
                sx={{ cursor: "pointer", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 20px rgba(0,0,0,0.1)" }, transition: "all 0.2s" }}
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1} gutterBottom>
                        公開中のコース
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="text.primary">
                        {data?.courses_published || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "secondary.light", color: "white", display: "flex", opacity: 0.9 }}>
                      <MenuBookOutlinedIcon fontSize="medium" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ opacity: 0.8 }}>
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1} gutterBottom>
                        アクティブな受講
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="text.primary">
                        {data?.enrollments_active || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "warning.main", color: "white", display: "flex", opacity: 0.9 }}>
                      <ClassOutlinedIcon fontSize="medium" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" fontWeight={700} fontFamily="Outfit, sans-serif" color="text.primary" mb={3}>
            最近登録された学生
          </Typography>
          <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
            <List sx={{ p: 0 }}>
              {data?.recent_students?.map((student: any, index: number) => (
                <Box key={student.id}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "grey.100", color: "primary.main", fontWeight: 700 }}>
                        {student.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={600}>{student.name}</Typography>}
                      secondary={student.email}
                    />
                    <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(student.created_at).toLocaleDateString("ja-JP")}
                      </Typography>
                      <Chip
                        size="small"
                        label={student.status === "active" ? "有効" : "無効"}
                        sx={{
                          mt: 0.5,
                          bgcolor: student.status === "active" ? "secondary.light" : "grey.100",
                          color: student.status === "active" ? "secondary.dark" : "text.secondary",
                          fontWeight: 700
                        }}
                      />
                    </Box>
                  </ListItem>
                  {index < data.recent_students.length - 1 && <Divider component="li" />}
                </Box>
              ))}
              {(!data?.recent_students || data.recent_students.length === 0) && (
                <ListItem sx={{ py: 4, textAlign: "center" }}>
                  <ListItemText secondary="学生はまだ登録されていません" />
                </ListItem>
              )}
            </List>
          </Card>
        </>
      ) : (
        <>
          <Typography variant="h5" fontWeight={700} fontFamily="Outfit, sans-serif" color="text.primary" mb={3}>
            受講中のコース
          </Typography>
          <Grid container spacing={3}>
            {data && data.length > 0 ? (
              data.map((course: any) => {
                const percentage = course.total_lessons > 0 
                  ? Math.round((course.completed_lessons / course.total_lessons) * 100) 
                  : 0;

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={course.course_id}>
                    <Card sx={{ borderRadius: 4, overflow: "hidden", position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
                      <Box sx={{ height: 160, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PlayCircleOutlineIcon sx={{ fontSize: 64, color: "grey.300" }} />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {course.course_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3} sx={{ flexGrow: 1 }}>
                          {course.course_description || "コースの説明はありません"}
                        </Typography>
                        
                        <Box mb={2}>
                           <Stack direction="row" justifyContent="space-between" mb={0.5}>
                             <Typography variant="caption" color="text.secondary">進捗</Typography>
                             <Typography variant="caption" fontWeight={600} color="primary.main">{percentage}%</Typography>
                           </Stack>
                           <Box sx={{ width: '100%', bgcolor: 'grey.200', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                             <Box sx={{ width: `${percentage}%`, bgcolor: percentage === 100 ? 'success.main' : 'primary.main', height: '100%' }} />
                           </Box>
                           <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                             完了: {course.completed_lessons} / {course.total_lessons} レッスン
                           </Typography>
                        </Box>

                        <Button variant="contained" size="small" fullWidth onClick={() => navigate(`/courses/${course.course_id}`)}>
                          学習を再開
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 4, bgcolor: "rgba(79, 70, 229, 0.05)", border: "2px dashed rgba(79, 70, 229, 0.2)", p: 4, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    現在受講中のコースはありません。興味のあるコースを探してみましょう！
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => navigate("/courses")}>
                    コース一覧を見る
                  </Button>
                </Card>
              </Grid>
            )}
            
            {/* 常に表示するコース検索への誘導 (受講コースがすでにある場合のみ横や下に出すのもあり) */}
            {data && data.length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 4, bgcolor: "rgba(79, 70, 229, 0.05)", border: "2px dashed rgba(79, 70, 229, 0.2)", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4 }}>
                  <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
                    他にも興味のあるコースを探してみましょう
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => navigate("/courses")}>
                    コース一覧を見る
                  </Button>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
}