# Window Space Auction

A fun, interactive web application for auctioning off window space. Users can place bids, view current bids, and see the winner when the auction ends.

## Features

- Real-time countdown timer for the auction
- Interactive bid form with validation
- Sortable list of current bids
- Animated winner announcement with confetti
- Responsive design for all devices
- Admin panel to manage auction end time
- Persistent bids across all users with Vercel Blob

## Technologies Used

- Next.js 14
- React 18
- Framer Motion for animations
- CSS Modules for styling
- Confetti-JS for winner celebration
- Twitter (X) embed API
- Vercel Blob for data persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Vercel Blob token: `BLOB_READ_WRITE_TOKEN="your_token_here"`
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Setting Up Vercel Blob

For persistent data storage across all users, you need to set up Vercel Blob:

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project to Vercel:
   ```bash
   vercel link
   ```

3. Create a new Vercel Blob store:
   ```bash
   vercel blob create
   ```

4. Add the Blob token to your environment variables:
   ```bash
   # In .env.local
   BLOB_READ_WRITE_TOKEN="your_blob_token_here"
   ```

5. When deploying to Vercel, add the Blob token as an environment variable in the Vercel dashboard

## How It Works

- The auction runs for a set time period (default: 3 days from when the application starts)
- Users can place bids with their X username and bid amount
- The highest bidder at the end of the auction wins
- The winner is prompted to complete payment via Venmo
- Admins can change the auction end time through the admin panel
- All bids are stored in Vercel Blob and shared across all users

## Admin Access

1. Navigate to `/admin` or click the "Admin Panel" link at the bottom of the main page
2. Login with:
   - Username: `admin`
   - Password: `windowspace`
3. Once logged in, you can view and update the auction end time, clear bids, or reset the entire auction

## Deploying to Vercel

This project is ready to be deployed on Vercel. Follow these steps:

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/window-space-auction.git
   git push -u origin main
   ```

2. Import your repository on Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New..." and select "Project"
   - Select your repository
   - In the "Environment Variables" section, add your Vercel Blob token:
     ```
     BLOB_READ_WRITE_TOKEN=your_blob_token_here
     ```
   - Click "Deploy"

3. Your site will be deployed and available at a Vercel URL

## Customization

You can customize the auction by modifying:
- The auction duration in `app/page.js`
- The embedded tweet in `app/page.js` (replace the URL)
- The styling in the various CSS module files

## License

MIT 