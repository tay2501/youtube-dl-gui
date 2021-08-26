const electron = require("electron");
const { app, BrowserWindow, ipcMain, Tray, nativeTheme, Menu, dialog } =
  electron;
const path = require("path");
const log = require("electron-log");
const keytar = require("keytar");
const Store = require("electron-store");
const store = new Store();

const keytar_id = "youtube-dl-gui";
const default_docker_image = "uchikoma/youtube-dl:1.0";

const is_windows = process.platform === "win32";
const is_mac = process.platform === "darwin";
const is_linux = process.platform === "linux";

// アイコン
const init_tray_icon = async () => {
  log.info("index.js開始");
  let imgFilePath;
  if (is_windows) {
    // Windows
    log.debug("Windows");
    imgFilePath = path.join(
      __dirname,
      "images/tray-icon/white/dog_footprint.png"
    );
  } else if (is_mac) {
    // macOS
    log.debug("macOS");
    imgFilePath = path.join(
      __dirname,
      "images/tray-icon/white/dog_footprint.png"
    );
    // macOSのダークモード対応
    if (nativeTheme.shouldUseDarkColors === true) {
      log.debug("ダークモード");
      isDarkTheme = true;
      imgFilePath = path.join(
        __dirname,
        "images/tray-icon/black/dog_footprint.png"
      );
    }
  }
  const contextMenu = Menu.buildFromTemplate([{ label: "終了", role: "quit" }]);
  // トレイアイコンを生成する
  let tray = null;
  tray = new Tray(imgFilePath);
  tray.setToolTip(app.name);
  tray.setContextMenu(contextMenu);
};

// 終了処理
process.on("exit", () => {
  log.info("exit");
});

// 予期せぬエラー
process.on("uncaughtException", (err) => {
  log.error("uncaughtException", err);
  app.quit(); // アプリを終了する
  throw err;
});

app.on("quit", () => {
  log.debug("quit");
});

app.on("window-all-closed", () => {
  log.debug("window-all-closed");
});

// ウインドウ
let homeWindow;
let settingWindow;

// homeウインドウ
app.on("ready", () => {
  init_tray_icon();
  homeWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, "images/icon/dog_footprint.icns"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  homeWindow.loadFile("home/home.html");
  homeWindow.on("closed", () => app.quit());
});

// 設定ウインドウ
function createSettingWindow() {
  settingWindow = new BrowserWindow({
    width: 860,
    height: 600,
    icon: path.join(__dirname, "images/icon/dog_footprint.icns"),
    parent: homeWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  settingWindow.loadFile("setting/setting.html");
  settingWindow.on("closed", () => (settingWindow = null));
  settingWindow.once('ready-to-show', () => {
    settingWindow.show();
  })
}

/**
 * IPC通信
 */
// 設定ウインドウ
ipcMain.handle("settingWindow:create", (event) => {
  log.debug("settingWindow:create");
  createSettingWindow();
});

// URLを開く
ipcMain.handle("open:url", async (event, url) => {
  log.debug("open:url", url);
  if (url) {
    const { shell } = require("electron");
    shell.openExternal(url);
  }
});

// フォルダを開く
ipcMain.handle("open:folder", async (event, filePaht) => {
  log.debug("open:folder", filePaht);
  if (filePaht) {
    const { shell } = require("electron");
    shell.openPath(filePaht);
  }
});

// store読み込み
ipcMain.handle("get:setting", async (event, key) => {
  let result = "";
  if (store.has("setting")) {
    result = await store.get("setting")[key];
  }
  log.debug("get:setting", " key:", key, "result:", result);
  return result;
});

// youtube_password読み取り
ipcMain.handle("get:youtube_password", async (event) => {
  log.debug("get:youtube_password");
  const youtube_id = store.get("setting")["youtube_id"];
  let result = "";
  if (store.has("setting") && youtube_id) {
    result = await keytar.getPassword(
      keytar_id,
      store.get("setting")["youtube_id"]
    );
  }
  return result;
});

// 設定保存
ipcMain.handle(
  "save:setting",
  async (
    event,
    download_directory,
    env_path,
    docker_image,
    youtube_id,
    youtube_password,
    cookies,
    debug_flg,
    high_quality_flg,
    aria2c_j,
    aria2c_x,
    aria2c_k
  ) => {
    if (youtube_id) {
      if (youtube_password) {
        log.debug("savePassword");
        keytar.setPassword(keytar_id, youtube_id, youtube_password);
      } else {
        log.debug("deletePassword");
        if (keytar.deletePassword(keytar_id, youtube_id)) {
          log.debug("パスワード削除しました。", keytar_id, youtube_id);
        } else {
          log.warn("パスワード削除に失敗しました。", keytar_id, youtube_id);
        }
      }
    }

    const value = {
      download_directory: download_directory,
      docker_image: docker_image,
      env_path: env_path,
      youtube_id: youtube_id,
      cookies: cookies,
      debug_flg: debug_flg,
      high_quality_flg: high_quality_flg,
      aria2c_j: aria2c_j,
      aria2c_x: aria2c_x,
      aria2c_k: aria2c_k,
    };
    log.debug("save:setting", value);
    store.set("setting", value);
  }
);

// 設定画面の閉じるボタン
ipcMain.handle("close:setting", async () => {
  log.debug("close:setting");
  settingWindow.close();
});

// 環境変数
ipcMain.handle("get:process_env_path", (event) => {
  log.debug("get:process_env_path:", process.env.PATH);
  return process.env.PATH;
});

// メッセージダイアログ
ipcMain.handle("show:messagebox", (event, type, title, msg, detail) => {
  log.debug("show:messagebox", type, title, msg, detail);
  const options = {
    type: type,
    title: title,
    message: msg,
    detail: detail,
  };
  dialog.showMessageBox(options);
});

// ダウンロード
ipcMain.handle("do:download", async (event, url, rownum) => {
  log.debug("do:download", url, rownum);
  const env_path = await store.get("setting.env_path");
  const spawn_option = {
    env: {
      PATH: env_path ? process.env.PATH + ":" + env_path : process.env.PATH,
    },
  };

  const youtube_id = store.get("setting.youtube_id");

  const cmd_option = get_spawn_option(
    await store.get("setting.download_directory"),
    await youtube_id,
    (await youtube_id)
      ? keytar.getPassword(keytar_id, store.get("setting")["youtube_id"])
      : "",
    await store.get("setting.cookies"),
    url
  );
  return do_spawn(
    "docker",
    cmd_option,
    spawn_option,
    store.get("setting.debug_flg"),
    rownum
  );
});

// ダウンロード処理
function do_spawn(exeFile, args, option, isDebug, rownum) {
  log.debug("ダウンロード開始", exeFile, option, isDebug);
  if (isDebug) {
    homeWindow.webContents.send("download:status", {
      status: "debug mode!",
      rownum: rownum,
    });
    return "debug mode!";
  }

  const cp = require("child_process");
  const child = cp.spawn(exeFile, args, option);
  log.debug("child pid:", child.pid);
  child.stdout.on("data", (data) => {
    log.debug("child.stdout:", data.toString());
    const send_data = {
      status: data.toString(),
      rownum: rownum,
    };
    homeWindow.webContents.send("download:status", send_data);
    return send_data;
  });
  child.stderr.on("data", (data) => {
    log.debug("child.stderr", data.toString());
    const send_data = {
      status: data.toString(),
      rownum: rownum,
    };
    homeWindow.webContents.send("download:status", send_data);
    return send_data;
  });
  child.on("close", (code) => {
    log.debug("child close : ", code);
    const send_data = {
      status: code,
      rownum: rownum,
    };
    homeWindow.webContents.send("download:status", send_data);
    return send_data;
  });
  child.on("exit", (data) => {
    log.debug("child exit : ", data.toString());
    const send_data = {
      status: data.toString(),
      rownum: rownum,
    };
    homeWindow.webContents.send("download:status", send_data);
    return send_data;
  });
  child.on("error", (err) => {
    log.error("child error : ", err);
    throw err;
  });
}

/**
 * child_processのspawnのコマンド引数取得する
 * @param {String} download_directory
 * @param {String} youtube_id
 * @param {String} youtube_password
 * @param {String} cookies file path of cookies.
 * @param {String} url
 * @returns child_processのspawnのコマンド引数文字列
 */
function get_spawn_option(
  download_directory,
  youtube_id,
  youtube_password,
  cookies,
  url
) {
  // コマンドオプション組立
  let external_downloader_args = "--continue";
  const aria2c_j = store.get("setting.aria2c_j");
  if (aria2c_j) {
    external_downloader_args =
      external_downloader_args + " --max-concurrent-downloads " + aria2c_j;
  }

  const aria2c_x = store.get("setting.aria2c_x");
  if (aria2c_x) {
    external_downloader_args =
      external_downloader_args + " --max-connection-per-server " + aria2c_x;
  }

  const aria2c_k = store.get("setting.aria2c_k");
  if (aria2c_k) {
    external_downloader_args =
      external_downloader_args + " --min-split-size " + aria2c_k;
  }

  const cmd_opt = [
    "run",
    "--rm",
    "-v",
    download_directory + ":/data_folder",
    // Dockerイメージの設定(未設定の場合はデフォルトイメージを使用)
    store.get("setting.docker_image")
      ? store.get("setting.docker_image")
      : default_docker_image,
    "--external-downloader",
    "aria2c",
    "--external-downloader-args",
    external_downloader_args,
    "--geo-bypass",
    "--add-metadata",
    "--no-overwrites",
  ];

  if (store.get("setting.high_quality_flg")) {
    // 高画質モード
    cmd_opt.push("--format");
    cmd_opt.push("bestvideo+bestaudio");
    cmd_opt.push("--merge-output-format");
    cmd_opt.push("mp4");
  } else {
    cmd_opt.push("--format");
    cmd_opt.push("mp4");
  }

  log.debug("cmd_opt", cmd_opt);

  if (youtube_id && youtube_password) {
    // youtube idとpasswordの設定がある時のみ設定
    cmd_opt.push("-u");
    cmd_opt.push(youtube_id);
    cmd_opt.push("-p");
    cmd_opt.push(youtube_password);
  }

  if (cookies) {
    cmd_opt.push("--cookies");
    cmd_opt.push(cookies);
  }

  cmd_opt.push(url);
  return cmd_opt;
}
