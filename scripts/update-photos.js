const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration
const SCOPES = ['https://www.googleapis.com/auth/photoslibrary.readonly'];
const TOKEN_PATH = path.join(__dirname, '../config/google-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../config/google-credentials.json');
const CONFIG_PATH = path.join(__dirname, '../photos-config.json');

// Categories to search for
const BACKGROUND_CATEGORIES = ['LANDSCAPES', 'CITYSCAPES'];
const GALLERY_CATEGORIES = ['TRAVEL', 'LANDMARKS'];
const MAX_RESULTS = { background: 5, gallery: 10 };

/**
 * Get and store authentication token
 */
async function authorize() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    }

    console.error('No token found - you need to generate one first.');
    console.error('Run this script with --generate-token to create one.');
    process.exit(1);
  } catch (error) {
    console.error('Error loading client secret file:', error);
    process.exit(1);
  }
}

/**
 * Generate and save a new token
 */
async function generateToken() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    
    console.log('Authorize this app by visiting this url:', authUrl);
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        // Store the token to disk for later program executions
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('Token stored to', TOKEN_PATH);
        
        return oAuth2Client;
      } catch (err) {
        console.error('Error retrieving access token', err);
        return;
      }
    });
  } catch (error) {
    console.error('Error loading client secret file:', error);
  }
}

/**
 * Search for photos by content category
 */
async function searchPhotosByCategory(auth, categories, maxResults = 10) {
  const photosLibrary = google.photoslibrary({ version: 'v1', auth });
  
  try {
    const res = await photosLibrary.mediaItems.search({
      requestBody: {
        filters: {
          contentFilter: {
            includedContentCategories: categories
          },
          mediaTypeFilter: {
            mediaTypes: ['PHOTO']
          }
        },
        pageSize: maxResults
      }
    });
    
    if (res.data.mediaItems) {
      return res.data.mediaItems.map(item => item.id);
    }
    return [];
  } catch (error) {
    console.error('Error searching photos:', error);
    return [];
  }
}

/**
 * Update the photos configuration file
 */
async function updatePhotosConfig() {
  try {
    // Get authorization
    const auth = await authorize();
    
    // Search for background and gallery photos
    const backgroundPhotos = await searchPhotosByCategory(auth, BACKGROUND_CATEGORIES, MAX_RESULTS.background);
    const galleryPhotos = await searchPhotosByCategory(auth, GALLERY_CATEGORIES, MAX_RESULTS.gallery);
    
    // Create the new configuration
    const config = {
      backgroundPhotos,
      galleryPhotos,
      lastUpdated: new Date().toISOString()
    };
    
    // Write the configuration to file
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('Photos configuration updated successfully!');
  } catch (error) {
    console.error('Error updating photos config:', error);
  }
}

/**
 * Main execution
 */
if (process.argv.includes('--generate-token')) {
  generateToken();
} else {
  updatePhotosConfig();
}