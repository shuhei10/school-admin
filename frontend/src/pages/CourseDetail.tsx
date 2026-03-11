import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Typography, Button, Stack, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Accordion, AccordionSummary, AccordionDetails, Divider, Chip, Checkbox
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [completedLessons, setCompletedLessons] = useState<number[]>([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);

    // dialog states
    const [openChapterDialog, setOpenChapterDialog] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");

    const [openLessonDialog, setOpenLessonDialog] = useState(false);
    const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonContent, setNewLessonContent] = useState("");
    const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");

    const isInstructor = user?.role === "admin" || user?.role === "instructor";

    const loadData = async () => {
        try {
            const data = await apiFetch<any>(`/api/courses/${id}/contents`);
            setCourse(data.course);
            setChapters(data.chapters || []);
            setLessons(data.lessons || []);
            setCompletedLessons(data.completed_lessons || []);
            setIsEnrolled(data.is_enrolled || false);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleCreateChapter = async () => {
        if (!newChapterTitle) return;
        try {
            await apiFetch(`/api/courses/${id}/chapters`, {
                method: "POST",
                body: JSON.stringify({ title: newChapterTitle, order_index: chapters.length })
            });
            setOpenChapterDialog(false);
            setNewChapterTitle("");
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenLessonDialog = (chapterId: number) => {
        setActiveChapterId(chapterId);
        setNewLessonTitle("");
        setNewLessonContent("");
        setNewLessonVideoUrl("");
        setOpenLessonDialog(true);
    };

    const handleCreateLesson = async () => {
        if (!activeChapterId || !newLessonTitle) return;
        try {
            const chapterLessons = lessons.filter(l => l.chapter_id === activeChapterId);
            await apiFetch(`/api/courses/${id}/chapters/${activeChapterId}/lessons`, {
                method: "POST",
                body: JSON.stringify({
                    title: newLessonTitle,
                    content: newLessonContent,
                    video_url: newLessonVideoUrl,
                    order_index: chapterLessons.length
                })
            });
            setOpenLessonDialog(false);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleComplete = async (lessonId: number) => {
        if (!isEnrolled) return;
        try {
            const r = await apiFetch<any>(`/api/courses/${id}/lessons/${lessonId}/toggle-completion`, {
                method: "POST"
            });
            if (r.completed) {
                setCompletedLessons([...completedLessons, lessonId]);
            } else {
                setCompletedLessons(completedLessons.filter(l => l !== lessonId));
            }
        } catch(e) {
            console.error(e);
        }
    };

    const handleEnroll = async () => {
        setEnrollLoading(true);
        try {
            await apiFetch(`/api/courses/${id}/enroll`, { method: "POST" });
            setIsEnrolled(true);
        } catch (e) {
            console.error(e);
        } finally {
            setEnrollLoading(false);
        }
    };

    if (!course) return <Box p={4}><Typography>Loading...</Typography></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/courses")} sx={{ mb: 2 }}>
                コース一覧に戻る
            </Button>

            <Box mb={4}>
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2} mb={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h3" fontWeight={800} fontFamily="Outfit, sans-serif" color="text.primary">
                            {course.title}
                        </Typography>
                        <Chip
                            label={course.is_published ? "公開中" : "下書き"}
                            size="small"
                            color={course.is_published ? "success" : "default"}
                            sx={{ fontWeight: 700 }}
                        />
                    </Stack>
                    
                    {!isInstructor && !isEnrolled && (
                        <Button 
                            variant="contained" 
                            size="large" 
                            color="primary" 
                            startIcon={<RocketLaunchIcon />}
                            onClick={handleEnroll}
                            disabled={enrollLoading}
                            sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 700, boxShadow: "0 8px 16px rgba(79, 70, 229, 0.3)" }}
                        >
                            {enrollLoading ? "登録中..." : "このコースを受講する"}
                        </Button>
                    )}
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {course.description}
                </Typography>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700}>カリキュラム</Typography>
                {isInstructor && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenChapterDialog(true)}>
                        章を追加
                    </Button>
                )}
            </Stack>

            {chapters.length === 0 ? (
                <Card sx={{ bgcolor: "background.default", textAlign: "center", py: 5 }}>
                    <Typography color="text.secondary">まだカリキュラムがありません。</Typography>
                </Card>
            ) : (
                chapters.map((chapter, index) => {
                    const chapterLessons = lessons.filter(l => l.chapter_id === chapter.id);
                    return (
                        <Accordion key={chapter.id} defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    第{index + 1}章: {chapter.title}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <Divider />
                                <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                                    {chapterLessons.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                            レッスンがありません。
                                        </Typography>
                                    ) : (
                                        <Stack spacing={1}>
                                            {chapterLessons.map((lesson, lIndex) => {
                                                const isUnlocked = isInstructor || isEnrolled;
                                                const isCompleted = completedLessons.includes(lesson.id);

                                                return (
                                                <Card key={lesson.id} variant="outlined" sx={{ 
                                                    '&:hover': { borderColor: isUnlocked ? 'primary.main' : 'inherit', cursor: isUnlocked ? 'pointer' : 'default' }, 
                                                    bgcolor: isCompleted ? "honeydew" : (isUnlocked ? "inherit" : "grey.50"),
                                                    opacity: isUnlocked ? 1 : 0.7
                                                }}>
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                {!isUnlocked ? (
                                                                    <LockOutlinedIcon color="disabled" />
                                                                ) : lesson.video_url ? (
                                                                    <PlayCircleOutlineIcon color="primary" />
                                                                ) : (
                                                                    <ArticleOutlinedIcon color="action" />
                                                                )}
                                                                
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight={600} sx={{ 
                                                                        textDecoration: isCompleted ? "line-through" : "none", 
                                                                        color: isCompleted ? "text.secondary" : (isUnlocked ? "text.primary" : "text.disabled") 
                                                                    }}>
                                                                        {lIndex + 1}. {lesson.title}
                                                                    </Typography>
                                                                    {isUnlocked && lesson.content && (
                                                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 500 }}>
                                                                            {lesson.content}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Stack>
                                                            
                                                            {isUnlocked && !isInstructor && (
                                                                <Box onClick={(e) => { e.stopPropagation(); }}>
                                                                    <Checkbox
                                                                        icon={<RadioButtonUncheckedIcon />}
                                                                        checkedIcon={<CheckCircleIcon color="success" />}
                                                                        checked={isCompleted}
                                                                        onChange={() => handleToggleComplete(lesson.id)}
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                                );
                                            })}
                                        </Stack>
                                    )}

                                    {isInstructor && (
                                        <Button
                                            startIcon={<AddIcon />}
                                            sx={{ mt: 2 }}
                                            onClick={() => handleOpenLessonDialog(chapter.id)}
                                        >
                                            レッスンを追加
                                        </Button>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            )}

            {/* Chapter Dialog */}
            <Dialog open={openChapterDialog} onClose={() => setOpenChapterDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>新しい章を作成</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="章のタイトル"
                        fullWidth
                        variant="outlined"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenChapterDialog(false)}>キャンセル</Button>
                    <Button onClick={handleCreateChapter} variant="contained" disabled={!newChapterTitle}>作成</Button>
                </DialogActions>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog open={openLessonDialog} onClose={() => setOpenLessonDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>新しいレッスンを作成</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="レッスンのタイトル"
                        fullWidth
                        variant="outlined"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="動画URL (任意)"
                        fullWidth
                        variant="outlined"
                        value={newLessonVideoUrl}
                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="https://example.com/video.mp4"
                    />
                    <TextField
                        margin="dense"
                        label="テキストコンテンツ (任意)"
                        fullWidth
                        multiline
                        rows={5}
                        variant="outlined"
                        value={newLessonContent}
                        onChange={(e) => setNewLessonContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenLessonDialog(false)}>キャンセル</Button>
                    <Button onClick={handleCreateLesson} variant="contained" disabled={!newLessonTitle}>作成</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
