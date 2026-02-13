# How to update the True Harvest Android Icon

To replace the Capacitor logo with the True Harvest logo on your phone's home screen, follow these steps:

## 1. Get your Source Image
You no longer need external design tools! 
1. Log in to your app as an Admin (`trueharverst@gmail.com`).
2. Open the **Admin Dashboard**.
3. Go to the **Asset Studio** tab.
4. Click **"Download 1024px icon-only.png"**.

## 2. Prepare for Generation
1. Create a folder named `assets` in your project root folder (next to `package.json`).
2. Move the downloaded `icon-only.png` into that `assets` folder.

## 3. Run the Automation Command
Open your terminal in this project folder and run:

```bash
# Install the asset tool (if not already installed)
npm install @capacitor/assets -D

# Generate all Android icons automatically
npx capacitor-assets generate --android
```

This command will automatically go into all the `mipmap-` folders in your Android project and replace the default Capacitor logos with the True Harvest logo you generated.

## 4. Deploy to Phone
After running the command:
1. Run `npx cap sync android`.
2. In **Android Studio**, click the "Stop" button then the "Run" button.
3. The new logo will now appear on your phone's home screen!
