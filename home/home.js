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

  const download_directory = await window.api.get_download_directory();

  if (!download_directory) {
    // ダウンロード先が未設定の場合
    window.api.show_message_box(
      "warning",
      "ホーム",
      "初期設定をしてください。",
      "設定画面でダウンロード先を設定してください。"
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
  const rownum = (await tbl.rows.length) - 1;
  // 行の背景色を設定
  newRow.id = "tbl_" + rownum;
  newRow.className = "table-primary";

  // 行数
  const td1 = document.createElement("th");
  td1.id = "tbl_" + rownum + "_1";
  const noTextNode = document.createTextNode(rownum);
  cell1.appendChild(noTextNode);

  // URL
  const cell2 = newRow.insertCell();
  cell2.id = "tbl_" + rownum + "_2";
  const urlTextNode = document.createTextNode(u);
  cell2.addEventListener("dblclick", async () => {
    log.debug("open:url", u);
    window.api.open_url(u);
  });
  cell2.appendChild(urlTextNode);

  // status
  const cell3 = newRow.insertCell();
  cell3.id = "tbl_" + rownum + "_3";
  const statusTextArea = document.createElement("textarea");
  statusTextArea.id = "tbl_" + rownum + "_3_textarea";
  statusTextArea.value = "downloading...";
  statusTextArea.className = "form-control";
  statusTextArea.rows = 2;
  cell3.appendChild(statusTextArea);

  // Directory
  const cell4 = newRow.insertCell();
  cell4.id = "tbl_" + rownum + "_4";
  const directoryNode = document.createTextNode(download_directory);
  cell4.appendChild(directoryNode);
  cell4.addEventListener("dblclick", async () => {
    log.debug("open:folder", download_directory);
    window.api.open_folder(download_directory);
  });

  // ダウンロード処理開始
  log.debug("ダウンロード処理開始");
  window.api.do_download(u, rownum);
  log.debug("ダウンロード処理完了");
  url.value = "";
});

// ダウンロード進捗
window.api.on("download:status", async (arg) => {
  const rownum = await arg.rownum;
  const isError = await arg.isError;
  const arg_status = await arg.status;

  const isFinished = (await arg_status) == 0;

  const tr = document.getElementById("tbl_" + rownum);
  if (isFinished) tr.className = "table-success";
  if (isError) tr.className = "table-danger";

  const status = document.getElementById("tbl_" + rownum + "_3_textarea");
  // ステータス出力文字列
  status.value = isFinished ? "Finished." : (status.value += arg_status);

  status.scrollTop = status.scrollHeight;
  log.debug("download:status", status.value);
});
