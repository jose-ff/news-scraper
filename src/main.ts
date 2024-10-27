import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import puppeteer from "puppeteer";
// @ts-expect-error
import started from "electron-squirrel-startup";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string | undefined;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

function registerIpcHandlers() {
  ipcMain.handle("scrape-website", async (_, url) => {
    try {
      const browser = await puppeteer.launch({
        executablePath: puppeteer.executablePath(),
      });

      const page = await browser.newPage();
      await page.setJavaScriptEnabled(false);
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      const h1Element = await page.$("h1");

      const title = await page.evaluate((el) => el?.innerText, h1Element);

      const subtitle = await page.evaluate(() => {
        const element = document.querySelector("h2");
        return element?.textContent;
      });

      const firstP = await page.evaluate((h1) => {
        let element = h1?.parentElement;

        const getText = (p: HTMLParagraphElement) =>
          p.textContent?.trim().replace(/\s+/g, " ");

        while (element) {
          const ps = Array.from(element.querySelectorAll("p"));
          const goodP = ps.find((p) => {
            if ((getText(p)?.split(" ").length ?? 0) > 9) {
              return true;
            }
            return false;
          });

          if (goodP) {
            return getText(goodP);
          }

          element = element.parentElement;
        }
        return null;
      }, h1Element);

      await browser.close();
      return {
        title: title ?? null,
        subtitle: subtitle ?? null,
        firstP: firstP ?? null,
        url,
      };
    } catch (error) {
      console.error("Scraping error:", error);
      throw error;
    }
  });
}
const initApp = async () => {
  try {
    await app.whenReady();
    registerIpcHandlers();
    createWindow();

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error("Error initializing app:", error);
  }
};

// Start the app
initApp();

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
