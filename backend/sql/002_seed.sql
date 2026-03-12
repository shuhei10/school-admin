-- 初期ユーザーの追加 (パスワード: pass1234)
INSERT INTO users (email, password_hash, name, role, status)
VALUES (
  'admin@example.com',
  '$2b$10$7R/0l5V5zKz.kO3W6G5NlO/HkXGv4v4v4v4v4v4v4v4v4v4v4v4v',
  '管理者ユーザー',
  'admin',
  'active'
);

-- サンプル講師
INSERT INTO users (email, password_hash, name, role, status)
VALUES (
  'instructor@example.com',
  '$2b$10$7R/0l5V5zKz.kO3W6G5NlO/HkXGv4v4v4v4v4v4v4v4v4v4v4v4v',
  '講師太郎',
  'instructor',
  'active'
);

-- サンプルコース
INSERT INTO courses (title, description, is_published)
VALUES (
  'はじめてのプログラミング',
  'プログラミングの基礎を学ぶコースです。',
  1
);

INSERT INTO courses (title, description, is_published)
VALUES (
  'Web制作実践',
  'HTML/CSS/JSを使ってサイトを制作します。',
  0
);
