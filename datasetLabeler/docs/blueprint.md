# **App Name**: LabelFlow

## Core Features:

- User Authentication: Authenticate users (admin/user) via NextAuth.js, verifying credentials against a Google Sheet.
- Data Fetching: Fetch unlabeled files from the 'ALL' folder in Google Drive using the Google Drive API.
- Labeling Interface: A custom audio player that will include waveform visualizations with wavesurfer.js
- File Renaming & Moving: Rename files based on the selected label and move them to the appropriate labeled folder within Google Drive, by accessing the Google Drive API.
- Transaction Logging: Log all labeling transactions (user, timestamp, file, label) to a Google Sheet, including file movements and renaming actions.
- Admin Dashboard: Aggregate data from Google Sheets to display labeling progress via charts and metrics.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and authority.
- Background color: Light gray (#F0F2F5), a desaturated tint of the primary, for a clean and professional feel.
- Accent color: Green (#4CAF50) to highlight actions, labels, and progress indicators.
- Body and headline font: 'Inter', a sans-serif, provides a modern and neutral look, which supports readability and data presentation.
- Lucide React Icons: Concise icons to represent actions and file states within the interface.
- A clean, data-focused layout, which places waveform visualization centrally.
- Subtle transitions for file loading and labeling actions, offering a polished feel.