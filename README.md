# Bill Tracker

Personal bill tracker for Chad & Eric. Shows all monthly bills with due dates, urgency indicators, payment links, and login details.

## Features
- Monthly summary cards (total, Chad's share, Eric's share, due soon count)
- Filter by category or owner
- Color-coded urgency badges (red = 3 days or less, orange = 7 days, green = safe)
- Click the pencil icon to save payment URLs, usernames, passwords, and notes
- All login/payment info stored in your browser's local storage (never leaves your device)
- Dark mode support (follows system setting)

## How to Host (GitHub Pages — free)

1. Create a **private** repo on github.com (keeps your bill info out of search engines)
2. Push these three files to the repo:
   ```
   git init
   git add .
   git commit -m "Initial bill tracker"
   git remote add origin https://github.com/YOUR_USERNAME/bill-tracker.git
   git push -u origin main
   ```
3. Go to repo **Settings → Pages → Source** → select `main` branch, root folder
4. Your site will be live at `https://YOUR_USERNAME.github.io/bill-tracker/`

> Note: Even with a private repo, GitHub Pages sites are publicly accessible by URL. The payment URLs and login info you add via the UI are stored in your browser only (localStorage) — they are NOT in the HTML/JS files and won't be exposed.

## How to Edit Bills

Open `app.js` and edit the `BILLS` array at the top. Each bill looks like:

```js
{ id: 32, name: "New Bill", amount: 50, due: 15, owner: "Solo", split: null, chad: 50, eric: 0, category: "Essentials" }
```

- **Add a bill**: Copy a line, change the values, increment the `id`
- **Remove a bill**: Delete its line
- **Change amount/date**: Edit the number directly
- **Add a new category**: Just type it — filters generate automatically

## Files
- `index.html` — page structure (rarely needs editing)
- `style.css` — all styling (colors, layout, dark mode)
- `app.js` — bill data + all logic (this is where you edit bills)

## Privacy
Payment URLs, usernames, and passwords are stored in **localStorage** (your browser, your device). They never leave your machine and are not part of the source files. If you clear browser data, you'll need to re-enter them.

