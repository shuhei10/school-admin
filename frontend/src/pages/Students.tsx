import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Box, Typography, Button, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  MenuItem, IconButton, Tooltip, Snackbar, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

// ===== 型（any卒業） =====
type StudentStatus = "active" | "inactive";

type Student = {
  id: number;
  name: string;
  email: string;
  status: StudentStatus;
  goal: "side_hustle" | "career_change" | "skill_up";
  skill_level: "beginner" | "intermediate" | "advanced";
  created_at: string;
};

type GetStudentsRes = { ok: true; students: Student[] };
type OneStudentRes = { ok: true; student: Student };

type StudentInput = {
  name: string;
  email: string;
  status: StudentStatus;
  goal: "side_hustle" | "career_change" | "skill_up";
  skill_level: "beginner" | "intermediate" | "advanced";
};

function getErrorMessage(e: any) {
  return e?.message ?? "失敗しました";
}

// ===== モーダル（新規/編集 共通） =====
function StudentFormDialog(props: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Student | null;
  onClose: () => void;
  onSubmit: (input: StudentInput) => Promise<void>;
}) {
  const { open, mode, initial, onClose, onSubmit } = props;

  const initialValue: StudentInput = useMemo(
    () =>
      mode === "edit" && initial
        ? { name: initial.name, email: initial.email, status: initial.status, goal: initial.goal, skill_level: initial.skill_level }
        : { name: "", email: "", status: "active", goal: "skill_up", skill_level: "beginner" },
    [mode, initial]
  );

  const [v, setV] = useState<StudentInput>(initialValue);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setV(initialValue);
      setErr(null);
      setSaving(false);
    }
  }, [open, initialValue]);

  const dirty = JSON.stringify(v) !== JSON.stringify(initialValue);

  const handleClose = () => {
    if (saving) return;
    if (dirty) {
      const ok = window.confirm("未保存の変更があります。破棄して閉じますか？");
      if (!ok) return;
    }
    onClose();
  };

  const validate = () => {
    if (!v.name.trim()) return "名前は必須です";
    if (!v.email.trim()) return "メールは必須です";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) return "メール形式が正しくありません";
    return null;
  };

  const handleSubmit = async () => {
    const m = validate();
    if (m) return setErr(m);

    setSaving(true);
    setErr(null);
    try {
      await onSubmit({
        name: v.name.trim(),
        email: v.email.trim(),
        status: v.status,
        goal: v.goal,
        skill_level: v.skill_level,
      });
      onClose();
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "学生を追加" : "学生を編集"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {err && <Alert severity="error">{err}</Alert>}

          <TextField
            label="名前"
            value={v.name}
            onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))}
            fullWidth
            autoFocus
          />
          <TextField
            label="メールアドレス"
            value={v.email}
            onChange={(e) => setV((p) => ({ ...p, email: e.target.value }))}
            fullWidth
          />
          <TextField
            label="ステータス"
            select
            value={v.status}
            onChange={(e) => setV((p) => ({ ...p, status: e.target.value as StudentStatus }))}
            fullWidth
          >
            <MenuItem value="active">有効</MenuItem>
            <MenuItem value="inactive">無効</MenuItem>
          </TextField>

          <TextField
            label="学習目的"
            select
            value={v.goal}
            onChange={(e) => setV((p) => ({ ...p, goal: e.target.value as any }))}
            fullWidth
          >
            <MenuItem value="side_hustle">副業開始</MenuItem>
            <MenuItem value="career_change">転職希望</MenuItem>
            <MenuItem value="skill_up">スキルアップ / 子育て両立</MenuItem>
          </TextField>

          <TextField
            label="経験レベル"
            select
            value={v.skill_level}
            onChange={(e) => setV((p) => ({ ...p, skill_level: e.target.value as any }))}
            fullWidth
          >
            <MenuItem value="beginner">未経験</MenuItem>
            <MenuItem value="intermediate">外部経験あり</MenuItem>
            <MenuItem value="advanced">プロレベル</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving} variant="outlined">
          キャンセル
        </Button>
        <Button onClick={handleSubmit} disabled={saving} variant="contained">
          {mode === "create" ? "追加" : "保存"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Students() {
  const [rows, setRows] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const isInstructor = user?.role === "admin" || user?.role === "instructor";

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Student | null>(null);

  const [delTarget, setDelTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Progress dialog states
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressTarget, setProgressTarget] = useState<Student | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState<{ studentId: number, courseId: number, title: string } | null>(null);
  const [snackMsg, setSnackMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // search対応してないAPIなら、いったん無視してOK
      const r = await apiFetch<GetStudentsRes>("/api/students");
      const items = r.students;

      const filtered =
        search.trim() === ""
          ? items
          : items.filter((s) => {
            const q = search.trim().toLowerCase();
            return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
          });

      setRows(filtered);
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo<GridColDef<Student>[]>(() => {
    const base: GridColDef<Student>[] = [
      { field: "id", headerName: "ID", width: 90 },
      { field: "name", headerName: "名前", width: 200, flex: 1, minWidth: 160 },
      { field: "email", headerName: "メールアドレス", width: 250, flex: 1, minWidth: 220 },
      {
        field: "status",
        headerName: "ステータス",
        width: 140,
        renderCell: (p) => {
          const isActive = p.value === "active";
          return (
            <Chip
              label={isActive ? "有効" : "無効"}
              size="small"
              sx={{
                bgcolor: isActive ? "secondary.light" : "action.disabledBackground",
                color: isActive ? "secondary.dark" : "text.secondary",
                fontWeight: 600,
                textTransform: "capitalize",
                px: 1,
              }}
            />
          );
        }
      },
      {
        field: "goal",
        headerName: "学習目的",
        width: 180,
        renderCell: (p) => {
          const map: any = {
            side_hustle: "副業開始",
            career_change: "転職希望",
            skill_up: "スキルアップ",
          };
          return map[p.value] || p.value;
        }
      },
      {
        field: "skill_level",
        headerName: "経験",
        width: 130,
        renderCell: (p) => {
          const map: any = {
            beginner: "未経験",
            intermediate: "中級",
            advanced: "上級",
          };
          return <Chip label={map[p.value] || p.value} size="small" variant="outlined" />;
        }
      },
      { field: "created_at", headerName: "登録日", width: 140, renderCell: (p) => new Date(p.value).toLocaleDateString() },
    ];

    if (!isInstructor) return base;

    const fetchProgress = async (student: Student) => {
      setProgressTarget(student);
      setProgressOpen(true);
      setProgressLoading(true);
      try {
         const r = await apiFetch<any>(`/api/students/${student.id}/progress`);
         setProgressData(r.progress || []);
      } catch (e) {
         console.error(e);
      } finally {
         setProgressLoading(false);
      }
    };

    return [
      ...base,
      {
        field: "actions",
        headerName: "",
        width: 120,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (p) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ width: "100%" }}>
            <Tooltip title="進捗確認">
              <IconButton
                size="small"
                onClick={() => fetchProgress(p.row)}
                sx={{ color: "success.main", bgcolor: "success.50", "&:hover": { bgcolor: "success.100" } }}
              >
                <TrendingUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="編集">
              <IconButton
                size="small"
                onClick={() => {
                  setFormMode("edit");
                  setEditing(p.row);
                  setFormOpen(true);
                }}
                sx={{ color: "primary.main", bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="削除">
              <IconButton
                size="small"
                onClick={() => setDelTarget(p.row)}
                sx={{ color: "error.main", bgcolor: "error.50", "&:hover": { bgcolor: "error.100" } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  }, [isInstructor]);

  const openCreate = () => {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  };

  const submitForm = async (input: StudentInput) => {
    if (!isInstructor) throw new Error("権限がありません（Instructorのみ）");

    if (formMode === "create") {
      // POST /api/students → { ok:true, student }
      const r = await apiFetch<OneStudentRes>("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setRows((prev) => [r.student, ...prev]);
      return;
    }

    // edit
    if (!editing) throw new Error("編集対象がありません");
    const r = await apiFetch<OneStudentRes>(`/api/students/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    setRows((prev) => prev.map((s) => (s.id === r.student.id ? r.student : s)));
  };

  const confirmDelete = async () => {
    if (!isInstructor) return;
    if (!delTarget) return;

    setDeleting(true);
    setErr(null);
    try {
      await apiFetch(`/api/students/${delTarget.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((s) => s.id !== delTarget.id));
      setDelTarget(null);
    } catch (e: any) {
      setErr(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            学生管理
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {isInstructor ? "管理者モード: 編集・削除可能" : "閲覧モード: 閲覧のみ"}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            label="検索 (名前/メール)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            更新
          </Button>
          {isInstructor && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              追加
            </Button>
          )}
        </Stack>
      </Stack>

      {err && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {err}
        </Alert>
      )}

      <Box sx={{ height: 560, mt: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 3,
            "& .MuiDataGrid-row:hover": { cursor: "default" },
          }}
        />
      </Box>

      <StudentFormDialog
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <Dialog open={!!delTarget} onClose={() => (deleting ? null : setDelTarget(null))}>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {delTarget ? (
              <>
                <b>{delTarget.name}</b>（{delTarget.email}）を削除します。よろしいですか？
              </>
            ) : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelTarget(null)} disabled={deleting} variant="outlined">
            キャンセル
          </Button>
          <Button onClick={confirmDelete} disabled={deleting} variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={progressOpen} onClose={() => setProgressOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{progressTarget?.name} さんの進捗状況</DialogTitle>
        <DialogContent dividers>
          {progressLoading ? (
             <Typography>読み込み中...</Typography>
          ) : progressData.length === 0 ? (
             <Typography color="text.secondary">受講中のコースがありません。</Typography>
          ) : (
             <Stack spacing={2}>
               {progressData.map((prog, idx) => {
                  const percentage = prog.total_lessons > 0 
                     ? Math.round((prog.completed_lessons / prog.total_lessons) * 100) 
                     : 0;
                  return (
                    <Box key={idx} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {prog.course_title}
                        </Typography>
                        <Tooltip title="受講解除">
                          <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setUnenrollTarget({ studentId: progressTarget!.id, courseId: prog.course_id, title: prog.course_title })}
                          >
                            <RemoveCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ flexGrow: 1, bgcolor: 'grey.300', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                           <Box sx={{ width: `${percentage}%`, bgcolor: percentage === 100 ? 'success.main' : 'primary.main', height: '100%' }} />
                        </Box>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 40, textAlign: 'right' }}>
                          {percentage}%
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        完了: {prog.completed_lessons} / {prog.total_lessons} レッスン
                      </Typography>
                    </Box>
                  )
               })}
             </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!unenrollTarget} onClose={() => setUnenrollTarget(null)}>
        <DialogTitle>受講解除の確認</DialogTitle>
        <DialogContent>
          <Typography>{unenrollTarget?.title} の受講を解除しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnenrollTarget(null)}>キャンセル</Button>
          <Button
            onClick={async () => {
              if (!unenrollTarget) return;
              try {
                await apiFetch(`/api/students/${unenrollTarget.studentId}/courses/${unenrollTarget.courseId}/unenroll`, { method: "DELETE" });
                setUnenrollTarget(null);
                setSnackMsg("受講を解除しました");
                const r = await apiFetch<any>(`/api/students/${unenrollTarget.studentId}/progress`);
                setProgressData(r.progress || []);
              } catch (e: any) {
                console.error(e);
                alert("解除に失敗しました");
              }
            }}
            variant="contained"
            color="error"
          >
            解除する
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackMsg} autoHideDuration={3000} onClose={() => setSnackMsg("")}>
        <Alert onClose={() => setSnackMsg("")} severity="success" sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}