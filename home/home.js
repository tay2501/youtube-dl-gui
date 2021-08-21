const log = window.api.electron_log;
const path = window.api.path;

const url = document.getElementById("url");
const dl_btn = document.getElementById("download-button");
const clear = document.getElementById("clear-button");
const setting = document.getElementById("setting-button");
const tbl = document.getElementById("data-table");
const drop_area = document.getElementById("drop-area");

// 設定画面を開く
setting.addEventListener("click", (event) => {
  log.debug("settingWindow:create");
  window.api.open_setting_window();
});

// URLクリア
clear.addEventListener("click", async (event) => {
  log.debug("Clear URL");
  url.value = "";
});

// ダウンロード処理
dl_btn.addEventListener("click", async (event) => {
  log.debug("ダウンロード開始");

  const docker_compose_fullpath =
    await window.api.get_docker_compose_fullpath();

  if (!docker_compose_fullpath) {
    // Docker-composeが未設定の場合
    window.api.show_message_box(
      "warning",
      "ホーム",
      "初期設定をしてください。",
      "設定画面でdocker-compose格納先を設定してください。"
    );
    return;
  }

  const u = await url.value.trim();
  if (u === "") {
    // URLが未設定の場合
    window.api.show_message_box(
      "warning",
      "ホーム",
      "URL未入力",
      "URLを入力してください。"
    );
    return;
  }

  const tblBody = document.getElementById("data-tbody");
  const newRow = tblBody.insertRow(-1);
  const cell1 = newRow.insertCell();
  const rownum = tbl.rows.length - 1;

  // 行数
  const td1 = document.createElement("th");
  td1.id = "tbl_" + rownum + "_1";
  const noTextNode = document.createTextNode(rownum);
  td1.appendChild(noTextNode);
  cell1.appendChild(td1);

  // URL
  const cell2 = newRow.insertCell();
  const td2 = document.createElement("td");
  td2.id = "tbl_" + rownum + "_2";
  const urlTextNode = document.createTextNode(u);
  td2.appendChild(urlTextNode);
  td2.addEventListener("dblclick", async () => {
    log.debug("open:url", u);
    window.api.open_url(u);
  });
  cell2.appendChild(td2);

  // status
  const cell3 = newRow.insertCell();
  const td3 = document.createElement("td");
  td3.id = "tbl_" + rownum + "_3";
  const statusTextArea = document.createElement("textarea");
  statusTextArea.id = "tbl_" + rownum + "_3_textarea";
  statusTextArea.value = "downloading...";
  statusTextArea.className = "form-control";
  statusTextArea.rows = 2;
  td3.appendChild(statusTextArea);
  cell3.appendChild(td3);

  // Directory
  const cell4 = newRow.insertCell();
  const td4 = document.createElement("td");
  td4.id = "tbl_" + rownum + "_4";
  const folder_path = path.dirname(docker_compose_fullpath);
  const directoryNode = document.createTextNode(folder_path);
  td4.appendChild(directoryNode);
  cell4.appendChild(td4);
  td4.addEventListener("dblclick", async () => {
    log.debug("open:folder", folder_path);
    window.api.open_folder(folder_path);
  });

  // ダウンロード処理開始
  log.debug("ダウンロード処理開始");
  const dl_result = await window.api.do_download(u, rownum);
  log.debug("ダウンロード処理完了");
  url.value = "";
});

// ダウンロード進捗
window.api.on("download:status", async (arg) => {
  const status = document.getElementById("tbl_" + arg.rownum + "_3_textarea");
  const status_value = await (arg.status) === 0 ? "finished." : arg.status.trim();
  log.debug("download:status", status_value);
  status.value = status_value;
});
