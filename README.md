# Habit & Hour Tracker

A clean, mobile-first web application for tracking daily habits and logging hours. Build streaks and monitor your progress with an intuitive interface.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Mobile-first)
- **Database:** SQLite with Prisma ORM
- **Date handling:** date-fns

## Features

### ✅ Core Features

1. **Dashboard (Home View)**
   - List of active habits
   - Each card shows:
     - Habit name and current streak count
     - Progress bar for today's hours vs. daily goal
     - Quick add buttons (+15m, +1h) to log time
   - Color-coded progress bars based on habit color

2. **Calendar & Detail View**
   - Monthly calendar with activity heatmap
   - Darker colors indicate more hours logged
   - Current streak and longest streak statistics
   - Click any date to edit/override hours for that day

3. **Streak Logic**
   - Streaks count consecutive days where hours > 0
   - Current streak updates automatically
   - Longest streak tracks your best performance

4. **Settings**
   - Export all data as JSON
   - Backup and migration support

5. **Mobile Responsive**
   - Single column layout on mobile
   - Large touch targets for easy interaction
   - Optimized for mobile-first usage

## Project Structure

```
habit-tracker/
├── prisma/
│   └── schema.prisma          # Database schema (Habit & HabitLog models)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── habits/
│   │   │   │   ├── route.ts           # GET/POST habits
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts       # GET/PATCH/DELETE habit
│   │   │   │       └── log/
│   │   │   │           └── route.ts   # POST log time
│   │   │   ├── logs/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # PATCH/DELETE log entry
│   │   │   └── export/
│   │   │       └── route.ts           # GET export data
│   │   ├── habits/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Habit detail page with calendar
│   │   ├── settings/
│   │   │   └── page.tsx               # Settings page
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Dashboard/home page
│   │   └── globals.css                # Global styles
│   ├── components/
│   │   ├── Calendar.tsx               # Monthly calendar component
│   │   ├── EditLogModal.tsx           # Modal for editing log entries
│   │   ├── HabitCard.tsx              # Individual habit card
│   │   └── NewHabitModal.tsx          # Modal for creating habits
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── streaks.ts                 # Streak calculation logic
│   │   └── utils.ts                   # Utility functions
│   └── types/
│       └── index.ts                   # TypeScript type definitions
├── .env                               # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Create and migrate the database
   npm run prisma:push
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Optional: View Database

You can inspect your database using Prisma Studio:
```bash
npm run prisma:studio
```

## API Routes

### Habits

- `GET /api/habits` - Get all habits with logs
- `POST /api/habits` - Create a new habit
  ```json
  {
    "name": "Reading",
    "dailyGoalHours": 2,
    "color": "#3B82F6"
  }
  ```
- `GET /api/habits/[id]` - Get single habit with logs
- `PATCH /api/habits/[id]` - Update habit details
- `DELETE /api/habits/[id]` - Delete habit

### Logging Time

- `POST /api/habits/[id]/log` - Log time for a habit
  ```json
  {
    "hoursToAdd": 1,
    "date": "2024-02-14T00:00:00.000Z" // optional, defaults to today
  }
  ```

### Log Management

- `PATCH /api/logs/[id]` - Update a log entry
  ```json
  {
    "hoursLogged": 2.5
  }
  ```
- `DELETE /api/logs/[id]` - Delete a log entry

### Export

- `GET /api/export` - Export all data as JSON

## Database Schema

### Habit Model
```prisma
model Habit {
  id              Int         @id @default(autoincrement())
  name            String
  dailyGoalHours  Float
  color           String      // Hex color code
  createdAt       DateTime    @default(now())
  logs            HabitLog[]
}
```

### HabitLog Model
```prisma
model HabitLog {
  id           Int      @id @default(autoincrement())
  habitId      Int
  date         DateTime // Date component (normalized to start of day)
  hoursLogged  Float
  habit        Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@unique([habitId, date])
}
```

## Usage Guide

### Creating a Habit

1. Click "Add New Habit" on the dashboard
2. Enter habit name (e.g., "Reading", "Exercise")
3. Set daily goal in hours
4. Choose a color
5. Click "Create"

### Logging Time

**Quick Add (Dashboard):**
- Click "+15m" to add 15 minutes
- Click "+1h" to add 1 hour

**Manual Edit (Calendar View):**
1. Click on the habit card to open detail view
2. Click any date in the calendar
3. Enter the exact hours logged
4. Click "Save"

### Viewing Progress

- **Dashboard:** See today's progress and current streak for each habit
- **Detail View:** See full calendar and longest streak
- **Calendar Colors:** Darker shades = more hours logged

### Exporting Data

1. Click the settings icon (⚙️) in the top right
2. Click "Export Data as JSON"
3. Save the file for backup or migration

## Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Lint code
npm run lint

# Prisma commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
```

## Mobile Optimization

The app is built mobile-first with:
- Single column layout on small screens
- Large, easy-to-tap buttons (48px minimum)
- Touch-friendly calendar interface
- Optimized font sizes and spacing
- Responsive navigation

## Future Enhancements

Potential features to add:
- Import data from JSON
- Multiple habit categories/tags
- Weekly/monthly statistics
- Habit templates
- Dark mode
- Notifications/reminders
- Data visualization charts

## License

MIT

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
