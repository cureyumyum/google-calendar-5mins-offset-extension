// デバッグ用のログ出力（不要なら false に）
const DEBUG = true;

function log(message) {
  if (DEBUG) {
    console.log("[GCal Offset]: " + message);
  }
}

log("コンテントスクリプトが読み込まれました。");

/**
 * 渡された入力フィールドの時間を5分ずらす
 * @param {HTMLInputElement} inputElement - 時間が入力されたInput要素
 */
function offsetTime(inputElement) {
  // inputElement.value は "12:00" や "午後1:30" のような形式
  const timeStr = inputElement.value;
  
  // "12:00" または "12:30" のようなXX:00, XX:30の形式を探す
  const regex = /(\d{1,2}):(00|30)/;
  
  if (regex.test(timeStr)) {
    log(`処理対象の時刻を発見: ${timeStr}`);
    
    // 元の時刻をパース
    const [_, hour, minute] = timeStr.match(regex);
    
    // 5分ずらす（例: "12:00" -> "12:05", "12:30" -> "12:35"）
    const newMinute = (minute === "00") ? "05" : "35";
    
    // 元の文字列の "XX:00" または "XX:30" の部分だけを置換
    const newTimeStr = timeStr.replace(regex, `${hour}:${newMinute}`);

    log(`変更後の時刻: ${newTimeStr}`);

    // --- ここが最重要 ---
    // 1. input要素の値を直接書き換える
    inputElement.value = newTimeStr;
    
    // 2. Googleカレンダー(React)に「値が変わった」と認識させるため、
    //    強制的に 'input' イベントを発火させる
    const event = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(event);
    
    // 3. （念のため）'change' イベントも発火させる
    const changeEvent = new Event('change', { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
    
    return true; // 処理成功
  }
  
  return false; // 処理対象外
}


/**
 * ミニポップアップ（ダイアログ）を監視する
 * @param {HTMLElement} dialog - ポップアップのDOM要素
 */
function observeDialog(dialog) {
  // 処理の重複を防ぐ
  if (dialog.dataset.offsetDone) {
    return;
  }
  dialog.dataset.offsetDone = 'true';
  log("新しいミニポップアップを発見。");

  // 「開始時間」 (日本語) または "Start time" (英語) の入力欄を探す
  const startTimeInput = dialog.querySelector('input[aria-label="開始時間"], input[aria-label="Start time"]');
  

  if (startTimeInput) {
    log("「開始時間」の入力欄を発見。");
    
    // input要素の初期値が設定されるのを少し待つ
    setTimeout(() => {
      offsetTime(startTimeInput);
    }, 200); // 待機時間 200ms

  } else {
    log("警告: 「開始時間」の入力欄が見つかりませんでした。 (v5)");
  }
}

// --- メインの処理 (DOM監視) ---
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // role="dialog" を持つ要素か、その子要素を探す
          const dialog = node.matches('div[role="dialog"]') ? node : node.querySelector('div[role="dialog"]');
          if (dialog) {
            observeDialog(dialog);
          }
        }
      });
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });