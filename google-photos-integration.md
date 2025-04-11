# Google Photos Integration Implementation

This document outlines the implementation of Google Photos integration into the personal website. This feature allows displaying photos from your Google Photos account as background images and in a photo gallery on the site.

## Overview

The implementation consists of:
1. A configuration system to store photo IDs
2. A script to fetch photos from Google Photos API
3. Frontend code to display the photos
4. GitHub Actions workflow for automation

## Implementation Steps

### 1. Photo Configuration System

Created a `photos-config.json` file to store selected photo IDs:

```json
{
  "backgroundPhotos": [
    "EXAMPLE_PHOTO_ID_1",
    "EXAMPLE_PHOTO_ID_2"
  ],
  "galleryPhotos": [
    "EXAMPLE_PHOTO_ID_3",
    "EXAMPLE_PHOTO_ID_4",
    "EXAMPLE_PHOTO_ID_5"
  ],
  "lastUpdated": "2025-04-11T00:00:00Z"
}
```

### 2. Photo Integration Script

Created a Node.js script (`scripts/update-photos.js`) to:
- Connect to Google Photos API
- Search for photos by categories
- Update the configuration file

Key features:
- Authentication with OAuth 2.0
- Search for photos by content categories (landscapes, cityscapes, etc.)
- Store selection of photos by ID in the configuration file
- Support for running both locally and in automated workflows

### 3. Frontend Integration

Modified `hub.js` to:
- Load photos from the configuration file
- Display random background photos in the header
- Create an interactive photo gallery section

Added CSS styles for:
- Header background image handling
- Responsive photo gallery grid
- Visual effects (hover states, transitions)

### 4. GitHub Actions Workflow

Created `.github/workflows/update-photos.yml` for automatic updates:
- Runs weekly on a schedule
- Can be triggered manually
- Authenticates with Google Photos API
- Updates the photo configuration
- Commits and pushes changes to the repository

## Technical Details

### Google Photos API Integration

The script uses the official Google Photos Library API to:
1. Authenticate using OAuth 2.0
2. Search for photos based on content categories
3. Retrieve photo IDs for embedding

Authentication requires:
- Google Cloud project with Photos Library API enabled
- OAuth 2.0 credentials
- Access token with proper scope

### Photo Display Implementation

Photos are displayed using the public Google Photos URL format:
```
https://lh3.googleusercontent.com/p/{PHOTO_ID}=w{WIDTH}-h{HEIGHT}
```

Features:
- Random selection of background images
- Responsive image loading with appropriate sizes
- Click-to-enlarge functionality in the gallery

## Setup Instructions

### 1. Google Cloud Setup

1. Create a Google Cloud project
2. Enable the Google Photos Library API
3. Create OAuth 2.0 credentials
4. Download and save credentials as `config/google-credentials.json`

### 2. Local Setup

1. Install required Node.js packages:
   ```
   npm install googleapis
   ```

2. Generate an access token:
   ```
   node scripts/update-photos.js --generate-token
   ```
   - Follow the authorization prompt
   - This will create `config/google-token.json`

3. Run the script to update photos:
   ```
   node scripts/update-photos.js
   ```

### 3. GitHub Actions Setup

1. Add these secrets to your GitHub repository:
   - `GOOGLE_CREDENTIALS`: Contents of your google-credentials.json
   - `GOOGLE_TOKEN`: Contents of your google-token.json

2. The workflow will run:
   - Weekly on Sundays at 01:00 UTC
   - When manually triggered via the Actions tab

## Customization

You can customize the script by modifying:
- Photo categories to search for
- Number of photos to retrieve
- Display options (size, layout, etc.)

## Privacy Considerations

This implementation:
- Only accesses photos you've authorized
- Uses photos' public access URLs
- Does not expose private photos or albums