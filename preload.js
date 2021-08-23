const { contextBridge, ipcRenderer } = require("electron");
const electron_log = require("electron-log");

contextBridge.exposeInMainWorld("api", {
  ipcRenderer: ipcRenderer,
  path: require("path"),
  electron_log: electron_log,
  show_message_box: async (type, title, msg, detail) =>
    await ipcRenderer.invoke("show:messagebox", type, title, msg, detail),
  get_download_directory: async () =>
    await ipcRenderer.invoke("get:setting", "download_directory"),
  get_docker_image: async () =>
    await ipcRenderer.invoke("get:setting", "docker_image"),
  get_env_path: async () => await ipcRenderer.invoke("get:setting", "env_path"),
  get_youtube_id: async () =>
    await ipcRenderer.invoke("get:setting", "youtube_id"),
  get_youtube_password: async () =>
    await ipcRenderer.invoke("get:youtube_password"),
  get_cookies: async () => await ipcRenderer.invoke("get:setting", "cookies"),
  get_debug_flg: async () =>
    await ipcRenderer.invoke("get:setting", "debug_flg"),
  save_setting: async (
    download_directory,
    env_path,
    docker_image,
    youtube_id,
    youtube_password,
    cookies,
    debug_flg
  ) =>
    await ipcRenderer.invoke(
      "save:setting",
      download_directory,
      env_path,
      docker_image,
      youtube_id,
      youtube_password,
      cookies,
      debug_flg
    ),
  open_setting_window: async () =>
    await ipcRenderer.invoke("settingWindow:create"),
  open_folder: async (folder) =>
    await ipcRenderer.invoke("open:folder", folder),
  open_url: async (url) => await ipcRenderer.invoke("open:url", url),
  do_download: (url, rownum) => ipcRenderer.invoke("do:download", url, rownum),
  on: (channel, func) => {
    //rendererでの受信用, funcはコールバック関数
    electron_log.debug("preload on", "channel:", channel, "func:", func);
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
