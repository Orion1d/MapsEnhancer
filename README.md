# Maps Enhancer

A Chrome extension that automatically enhances Google Maps satellite imagery quality by optimizing URL parameters.

## Features

- **Automatic Detection**: Automatically detects when you're viewing Google Maps satellite imagery
- **Real-time Enhancement**: Instantly optimizes URLs for better image quality
- **Seamless Experience**: Works in the background without manual intervention
- **Language Preservation**: Maintains your current language settings
- **Manual Override**: Optional toolbar button for manual URL fixing

## Installation

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store
2. Search for "Maps Enhancer"
3. Click "Add to Chrome"
4. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## How It Works

Maps Enhancer monitors your Google Maps usage and automatically detects satellite view URLs. When it finds a satellite view, it adds the `gl=es` parameter to enhance image quality without affecting your language preferences.

### Example
**Before**: `https://www.google.com/maps/@41.0076552,28.9782774,352m/data=!3m1!1e3`
**After**: `https://www.google.com/maps/@41.0076552,28.9782774,352m/data=!3m1!1e3?gl=es`

## Usage

1. **Install the extension**
2. **Visit Google Maps** and switch to satellite view
3. **That's it!** The extension works automatically

The extension will show a status indicator when it's enhancing your maps, and you'll see improved satellite image quality immediately.

## Why This Extension?

Many countries experience lower quality satellite imagery in Google Maps due to regional restrictions. Maps Enhancer bypasses these limitations by using optimized URL parameters, giving you access to the highest quality satellite images available.

## Privacy

- **No Data Collection**: The extension doesn't collect or store any personal information
- **Local Processing**: All URL modifications happen locally in your browser
- **Google Maps Only**: Only affects Google Maps URLs, no other websites
- **No Tracking**: Doesn't track your browsing history or location

## Technical Details

- **Manifest Version**: 3 (Latest Chrome extension standard)
- **Permissions**: Minimal permissions required for URL detection and modification
- **Compatibility**: Chrome 88+ (Manifest V3 support)
- **Performance**: Lightweight with minimal impact on browser performance

## Troubleshooting

### Extension Not Working?
1. Ensure you're on a Google Maps satellite view page
2. Check that the extension is enabled in `chrome://extensions/`
3. Try refreshing the page
4. Check the browser console for any error messages

### Still Having Issues?
1. Disable and re-enable the extension
2. Clear your browser cache and cookies
3. Restart your browser
4. Check for any conflicting extensions

## Contributing

This is an open-source project. Feel free to submit issues, feature requests, or pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This extension enhances Google Maps satellite imagery quality by optimizing URL parameters. It's designed to work with Google Maps and may not function with other mapping services.
