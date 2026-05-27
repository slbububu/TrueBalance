# TrueBalance

TrueBalance is a free, open-source personal finance tracking web app that helps you understand exactly where your money goes. Track all your recurring expenses — subscriptions, rent, utilities, and more — and instantly see your true monthly and yearly spending broken down by category.

---

## Features

- 📊 **Dashboard** — visual overview of your spending with a donut chart and bar chart broken down by category
- 💸 **Expense tracking** — add recurring expenses with a name, amount, frequency (monthly or yearly), and category
- 🗂️ **Categories** — organize expenses with built-in presets or create your own custom categories
- 🔄 **Monthly / Yearly toggle** — switch between monthly and yearly totals at any time
- 🗑️ **Delete expenses and categories** — remove individual expenses or entire categories with all their associated expenses when you don't need them
- 🔐 **Authentication** — sign in with Email/Password or your Google account via Firebase Auth
- 📱 **Responsive design** — fully usable on mobile with a collapsible sidebar and a sticky top navbar

---

## Tech Stack

- **Framework** — [Next.js](https://nextjs.org/) (App Router)
- **Language** — TypeScript
- **Styling** — [Tailwind CSS](https://tailwindcss.com/)
- **User Authentication** — [Firebase](https://firebase.google.com/)
- **Charts** — [Recharts](https://recharts.org/)
- **Icons** — [Lucide React](https://lucide.dev/)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com/) project with:
  - **Authentication** enabled (Email/Password + Google)

### Installation

1. **Clone the repository**

```bash
git clone -b cloud https://github.com/slbububu/TrueBalance.git
cd truebalance
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the project root and fill in your Firebase config values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

You can find these values in the Firebase console under **Project settings > Your apps**.

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
truebalance/
├── api/                    # Backend / API services
├── cloudbuild_api.yaml     # CI/CD config for API
├── cloudbuild_frontend.yaml# CI/CD config for Frontend
├── frontend/               # Next.js web application
│   ├── app/                # App Router
│   │   ├── app/            # Main dashboard folder
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx        # Homepage (landing)
│   ├── lib/
│   │   └── firebase.ts
│   ├── public/
│   └── .env.production
└── README.md
```

---

## Deployment

TrueBalance is designed to be deployed on **Google Cloud**. You can use [Firebase Hosting](https://firebase.google.com/docs/hosting) or [Cloud Run](https://cloud.google.com/run) for deployment.

### Build for production

```bash
npm run build
```

---

## Which features we'd like to add next

We are currently considering adding these features:

1. **Implement database** - the ability to save your added expenses through different sessions and link them to your TrueBalance account

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
