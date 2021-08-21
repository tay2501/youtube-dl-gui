const log = window.api.electron_log;

// 初期設定
const init = async () => {
  // docker-compose-fullpath
  const docker_compose_fullpath = document.getElementById(
    "docker-compose-fullpath"
  );
  const docker_compose_fullpath_value =
    await window.api.get_docker_compose_fullpath();
  if (docker_compose_fullpath_value) {
    docker_compose_fullpath.value = await docker_compose_fullpath_value;
  }

  // options.env.PATH
  const env_path = document.getElementById("env_path");
  const get_env_path_value = await window.api.get_env_path();
  if (get_env_path_value) {
    env_path.value = await get_env_path_value;
  }

  // youtube-id
  const youtube_id = document.getElementById("youtube-id");
  const youtube_id_value = await window.api.get_youtube_id();
  if (youtube_id_value) {
    youtube_id.value = await youtube_id_value;
  }

  // youtube-password
  const youtube_password = document.getElementById("youtube-password");
  const youtube_password_value = await window.api.get_youtube_password();
  if (youtube_password_value) {
    youtube_password.value = await youtube_password_value;
  }

  // cookiesファイルフルパス
  const cookies = document.getElementById("cookies");
  const cookies_value = await window.api.get_cookies();
  if (cookies_value) {
    cookies.value = await cookies_value;
  }

  // デバッグモード
  const debug_flg = document.getElementById("debug-flg");
  const debug_flg_value = await window.api.get_debug_flg();
  if (debug_flg_value) {
    debug_flg.checked = await debug_flg_value;
  }

  // save-buttonクリック
  const save_button = document.getElementById("save-button");
  save_button.addEventListener("click", async () => {
    const result = await window.api.save_setting(
      docker_compose_fullpath.value,
      env_path.value,
      youtube_id.value,
      youtube_password.value,
      cookies.value,
      debug_flg.checked,
    );
    log.debug("save-buttonクリック", result);
    window.api.show_message_box(
      "info",
      "設定",
      "保存完了",
      "設定の保存が完了しました。"
    );
  });
};

init();
