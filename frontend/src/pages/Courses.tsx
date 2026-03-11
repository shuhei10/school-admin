import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, CardActionArea, Button, Stack, Chip, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

export default function Courses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const isInstructor = user?.role === "admin" || user?.role === "instructor";

    const load = async () => {
        try {
            const r = await apiFetch<any>("/api/courses");
            setCourses(r.courses);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreate = async () => {
        try {
            await apiFetch("/api/courses", {
                method: "POST",
                body: JSON.stringify({ title, description, is_published: true })
            });
            setOpen(false);
            setTitle("");
            setDescription("");
            load();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800} fontFamily="Outfit, sans-serif" color="text.primary">
                        コース管理
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        公開中のコースとコンテンツを管理します。
                    </Typography>
                </Box>
                {isInstructor && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                        コース作成
                    </Button>
                )}
            </Stack>

            <Grid container spacing={3}>
                {courses.map((course) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                        <Card>
                            <CardActionArea onClick={() => navigate(`/courses/${course.id}`)}>
                                <CardContent sx={{ p: 3 }}>
                                    <Chip
                                        label={course.is_published ? "公開中" : "下書き"}
                                        size="small"
                                        color={course.is_published ? "success" : "default"}
                                        sx={{ mb: 1.5, fontWeight: 700 }}
                                    />
                                    <Typography variant="h6" fontWeight={700} mb={1}>
                                        {course.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mb={2} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "3em" }}>
                                        {course.description || "説明はありません"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        登録日: {new Date(course.created_at).toLocaleDateString("ja-JP")}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ... Modal ... */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>新しいコースを作成</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="コース名"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="コース説明"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>キャンセル</Button>
                    <Button onClick={handleCreate} variant="contained">作成</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
