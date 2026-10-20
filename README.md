# HTML & CSS ITS Certification Exam Reviewer

A browser-based practice tool for the HTML and CSS ITS (Certiport) exam. It has 40 questions in the same formats as the real exam: drop-downs, drag-and-drop, true/false, multiple choice, and click-the-error-line.

> The questions are reconstructed from a student review PDF of last year's exam. They are for study only, and there is no guarantee they will appear on any real exam.

## Features
- Practice mode with instant checking, and exam mode with a score report
- Filter by question type, wrong answers, or marked-for-review
- Progress saved in your browser (`localStorage`)
- Optional AI tutor using the Gemini API (you enter your own key in the browser; it is never stored in the code)

## Project structure
```
project/
├── index.html        page structure
├── css/
│   └── style.css     custom styles
├── js/
│   ├── questions.js  the 40 questions (edit this to fix or add questions)
│   └── app.js        quiz logic and AI tutor
├── assets/           images, fonts, icons (empty for now)
├── README.md
└── .gitignore
```

## Run locally
Open `index.html` in a browser. No build step or server is needed.

The page loads Tailwind CSS and Google Fonts from a CDN, so you need an internet connection for it to look right.

## Publish on GitHub Pages
1. Push this folder to a GitHub repo (keep `index.html` at the repo root).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Editing questions
All questions live in `js/questions.js` in the `QUESTIONS` array. Each question has a `type` (`mcq`, `multi-select`, `dropdown-code`, `dropdown-qa`, `drag-code`, `drag-match`, `drag-sequence`, `true-false`, `line-select`), a `prompt`, its answer data, and an `explanation`.

Keep `questions.js` loading before `app.js` in `index.html`.

## Notes
- Scripts are plain `<script>` tags (not ES modules) so the page also works when opened directly from disk.
- Progress is stored per browser and does not sync between devices.
