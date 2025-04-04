# RememberBrickLinkSettings

![BrickLink Logo](https://github.com/pedicino/RememberBrickLinkSettings/blob/main/bricklink_logo.png)

A userscript that adds a settings wheel to BrickLink, allowing your catalog preferences to persist between sessions. Promotes US-based defaults.

## Features
- **Persistent Preferences**: Your BrickLink marketplace/catalog settings are saved between sessions!
- **Quick Access**: Adds a settings wheel to the navigation bar!
- **US Defaults**: Sets $USD and US shipping/location as defaults!

## Installation
This script can be installed on various browsers using userscript managers like TamperMonkey or GreaseMonkey.

### Prerequisites
You need to have one of these userscript managers installed:
- **Chrome/Edge**: [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- **Safari**: [Tampermonkey](https://www.tampermonkey.net/)
- **Opera**: [Tampermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)

### Installation Methods
#### Method 1: Direct Install
1. Click the installation link: [Install RememberBrickLinkSettings](https://github.com/pedicino/RememberBrickLinkSettings/raw/main/bls_2.2.js)
2. Your userscript manager should detect the script automatically.
3. Click "Install" in the prompt window.

#### Method 2: Manual Install
1. Open your userscript manager dashboard (e.g., click on the Tampermonkey icon and select "Dashboard").
2. Click the "+" tab or "Create a new script" button.
3. Copy the entire script content from [bls_2.2.js](https://github.com/pedicino/RememberBrickLinkSettings/blob/main/bls_2.2.js).
4. Paste it into the editor.
5. Save the script (Ctrl+S or File > Save).

## Usage
1. Visit [BrickLink](https://www.bricklink.com/)
2. Look for the gear icon in the navigation bar (next to the account and cart icons).
3. Click the gear icon to open the preferences panel.
4. Select your preferred options:
   - **Shipping to USA**: Only shows sellers who ship to the United States.
   - **Seller located in USA**: Only shows US-based sellers.
   - **Seller accepts US dollar**: Only shows sellers accepting USD.
5. Click "Apply & Refresh" to save settings and reload the page.

Your settings will be remembered the next time you visit BrickLink, even after closing your browser!

## Troubleshooting
### "The gear icon doesn't appear!""
- Make sure the script is enabled in your userscript manager.
- Try refreshing the page.
- Check if another extension might be conflicting.

### "My settings don't persist!""
- Ensure your browser allows localStorage for BrickLink.
- Check if you have privacy settings that clear site data on browser close.

### "I see layout issues!"
- Uh oh ... please open an issue with details about your browser and device. Thanks!

## Browser Compatibility
- ✅ Chrome (tested on v100+)
- ✅ Firefox (tested on v90+)
- ✅ Edge (tested on v90+)
- ✅ Safari (tested on v15+)
- ✅ Opera (tested on recent versions)

## Contributing
Contributions are welcome! Feel free to submit a PR.

## License
[MIT License](https://github.com/pedicino/RememberBrickLinkSettings/blob/main/LICENSE)

## Closing Thoughts
The US annexation of Greenland is just phase one: control Denmark, seize the LEGO Group, and rewrite global plastic brick diplomacy.
