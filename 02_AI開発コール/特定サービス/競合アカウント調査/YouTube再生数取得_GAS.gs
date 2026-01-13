/**
 * YouTube Data API v3 を使って、入力された動画URL一覧の統計（再生数など）を取得し、
 * スプレッドシートに一覧出力します。任意でチャンネルの総再生数も取得します。
 *
 * 事前準備:
 * - Google Cloud で YouTube Data API v3 を有効化
 * - APIキーを取得し、スクリプトプロパティ YOUTUBE_API_KEY に保存
 *
 * 使い方:
 * - シート「Input」A列に動画URLを貼る（A2以降）
 * - Input!B1 にチャンネルURL（またはチャンネルID、または @handle）を入れる（任意）
 * - メニュー「YouTube」→「再生数取得（一覧出力）」を実行
 */

const SHEET_INPUT = "Input";
const SHEET_OUTPUT = "Output";
const SHEET_SUMMARY = "Summary";

const PROP_API_KEY = "YOUTUBE_API_KEY";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("YouTube")
    .addItem("初期シート作成/整形", "setupSheets")
    .addItem("チャンネル動画URLを取得（Inputへ）", "fetchChannelVideoUrlsToInput")
    .addSeparator()
    .addItem("再生数取得（一覧出力）", "fetchYouTubeStats")
    .addToUi();
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const input = getOrCreateSheet_(ss, SHEET_INPUT);
  const output = getOrCreateSheet_(ss, SHEET_OUTPUT);
  const summary = getOrCreateSheet_(ss, SHEET_SUMMARY);

  // Input
  input.clear();
  input.getRange("A1").setValue("動画URL（A2以降に貼り付け）");
  input.getRange("B1").setValue("チャンネルURL / チャンネルID / @handle（任意）");
  input.getRange("B2").setValue("チャンネル動画URL 自動取得の最大件数（任意・例: 200）");
  input.getRange("C2").setValue(200);
  input.getRange("B3").setValue("（任意）既存のA列を消してから自動取得する: TRUE/FALSE");
  input.getRange("C3").setValue("TRUE");
  input.getRange("A2").setValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  input.getRange("A3").setValue("https://youtu.be/dQw4w9WgXcQ");
  input.setColumnWidths(1, 3, 520);

  // Output
  output.clear();
  output.getRange(1, 1, 1, 9).setValues([[
    "入力URL",
    "動画ID",
    "タイトル",
    "公開日",
    "再生数",
    "高評価",
    "コメント",
    "チャンネル名",
    "チャンネルID",
  ]]);
  output.setFrozenRows(1);
  output.setColumnWidths(1, 1, 520);
  output.setColumnWidths(2, 8, 180);

  // Summary
  summary.clear();
  summary.getRange("A1").setValue("チャンネル入力");
  summary.getRange("B1").setValue("Input!B1 の値");
  summary.getRange("A2").setValue("チャンネル名");
  summary.getRange("A3").setValue("チャンネルID");
  summary.getRange("A4").setValue("チャンネル総再生数（all time）");
  summary.getRange("A5").setValue("登録者数（公開されている場合）");
  summary.getRange("A6").setValue("動画数");
  summary.getRange("A8").setValue("入力した動画URLの合計再生数（Outputの合計）");
  summary.setColumnWidths(1, 2, 380);

  SpreadsheetApp.flush();
}

function fetchYouTubeStats() {
  const apiKey = getApiKey_();
  if (!apiKey) {
    throw new Error(
      `APIキーが未設定です。スクリプトプロパティ「${PROP_API_KEY}」にAPIキーを保存してください。`
    );
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const input = getOrCreateSheet_(ss, SHEET_INPUT);
  const output = getOrCreateSheet_(ss, SHEET_OUTPUT);
  const summary = getOrCreateSheet_(ss, SHEET_SUMMARY);

  // 1) 入力URL読み込み
  const lastRow = input.getLastRow();
  const urlValues = lastRow >= 2 ? input.getRange(2, 1, lastRow - 1, 1).getValues() : [];
  const urls = urlValues
    .map((r) => String(r[0] || "").trim())
    .filter((u) => u.length > 0);

  if (urls.length === 0) {
    throw new Error("InputシートのA2以降に動画URLを入力してください。");
  }

  // 2) 動画ID抽出
  const videoIds = [];
  const urlById = {};
  const badUrls = [];
  urls.forEach((u) => {
    const id = extractVideoId_(u);
    if (!id) {
      badUrls.push(u);
      return;
    }
    if (!urlById[id]) {
      videoIds.push(id);
      urlById[id] = u;
    }
  });

  if (videoIds.length === 0) {
    throw new Error(
      "動画URLから動画IDを抽出できませんでした。watch?v=xxxx または youtu.be/xxxx の形式か確認してください。"
    );
  }

  // 3) videos.list を50件ずつバッチ取得
  const idChunks = chunk_(videoIds, 50);
  const items = [];

  idChunks.forEach((chunkIds) => {
    const endpoint =
      "https://www.googleapis.com/youtube/v3/videos" +
      `?part=snippet,statistics&id=${encodeURIComponent(chunkIds.join(","))}` +
      `&key=${encodeURIComponent(apiKey)}`;

    const res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
    const code = res.getResponseCode();
    const text = res.getContentText();

    if (code >= 400) {
      throw new Error(`YouTube API エラー: HTTP ${code}\n${text}`);
    }

    const json = JSON.parse(text);
    if (json.error) {
      throw new Error(`YouTube API エラー: ${JSON.stringify(json.error)}`);
    }
    (json.items || []).forEach((it) => items.push(it));
  });

  // 4) Output整形して書き込み
  // 既存データ（ヘッダー除く）をクリア
  if (output.getLastRow() >= 2) {
    output.getRange(2, 1, output.getLastRow() - 1, output.getMaxColumns()).clearContent();
  }

  const rows = items.map((it) => {
    const id = it.id || "";
    const snippet = it.snippet || {};
    const stats = it.statistics || {};
    const title = snippet.title || "";
    const publishedAt = snippet.publishedAt || "";
    const channelTitle = snippet.channelTitle || "";
    const channelId = snippet.channelId || "";
    const viewCount = toNumber_(stats.viewCount);
    const likeCount = toNumber_(stats.likeCount);
    const commentCount = toNumber_(stats.commentCount);
    const inputUrl = urlById[id] || `https://www.youtube.com/watch?v=${id}`;

    return [
      inputUrl,
      id,
      title,
      publishedAt,
      viewCount,
      likeCount,
      commentCount,
      channelTitle,
      channelId,
    ];
  });

  // 入力順をなるべく維持（videoIds順）したいので並び替え
  const itemById = {};
  rows.forEach((r) => (itemById[r[1]] = r));
  const sortedRows = videoIds
    .map((id) => itemById[id])
    .filter(Boolean);

  if (sortedRows.length > 0) {
    output.getRange(2, 1, sortedRows.length, sortedRows[0].length).setValues(sortedRows);
  }

  // URL抽出できなかったものもOutput末尾にメモ
  if (badUrls.length > 0) {
    const start = output.getLastRow() + 2;
    output.getRange(start, 1).setValue("※動画IDを抽出できなかったURL（確認してください）");
    output.getRange(start + 1, 1, badUrls.length, 1).setValues(badUrls.map((u) => [u]));
  }

  // 5) 合計（入力した動画の合計再生数）をSummaryに反映
  const totalViews = sortedRows.reduce((sum, r) => sum + (Number(r[4]) || 0), 0);
  summary.getRange("B8").setValue(totalViews);

  // 6) 任意: チャンネル統計（channels.list）
  const channelInput = String(input.getRange("B1").getValue() || "").trim();
  summary.getRange("B1").setValue(channelInput);

  if (channelInput) {
    const channelInfo = fetchChannelStats_(channelInput, apiKey);
    if (channelInfo) {
      summary.getRange("B2").setValue(channelInfo.title || "");
      summary.getRange("B3").setValue(channelInfo.channelId || "");
      summary.getRange("B4").setValue(channelInfo.viewCount ?? "");
      summary.getRange("B5").setValue(channelInfo.subscriberCount ?? "");
      summary.getRange("B6").setValue(channelInfo.videoCount ?? "");
    } else {
      summary.getRange("B2").setValue("（チャンネルが見つかりませんでした。URL/ID/@handleを確認）");
      summary.getRange("B3:B6").clearContent();
    }
  } else {
    summary.getRange("B2").setValue("（未入力）");
    summary.getRange("B3:B6").clearContent();
  }
}

/**
 * Input!B1 のチャンネル指定から、そのチャンネルの「アップロード済み動画」一覧を取得して
 * Input!A2以降に https://www.youtube.com/watch?v=... の形で書き込みます。
 *
 * 設定:
 * - Input!C2: 最大取得件数（未入力なら 200）
 * - Input!C3: TRUEなら A列の既存値を消してから書き込む
 */
function fetchChannelVideoUrlsToInput() {
  const apiKey = getApiKey_();
  if (!apiKey) {
    throw new Error(
      `APIキーが未設定です。スクリプトプロパティ「${PROP_API_KEY}」にAPIキーを保存してください。`
    );
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const input = getOrCreateSheet_(ss, SHEET_INPUT);

  const channelInput = String(input.getRange("B1").getValue() || "").trim();
  if (!channelInput) {
    throw new Error("InputシートのB1にチャンネルURL / チャンネルID / @handle を入力してください。");
  }

  const maxCountRaw = input.getRange("C2").getValue();
  const maxCount = normalizeMaxCount_(maxCountRaw, 200);

  const clearFirstRaw = String(input.getRange("C3").getValue() || "").trim().toUpperCase();
  const clearFirst = clearFirstRaw === "TRUE" || clearFirstRaw === "1" || clearFirstRaw === "YES";

  const channel = fetchChannelDetailsWithUploads_(channelInput, apiKey);
  if (!channel || !channel.uploadsPlaylistId) {
    throw new Error(
      "チャンネルが見つからないか、アップロード一覧(uploads)を取得できませんでした。チャンネル指定（/channel/UC... / @handle / /user/）を確認してください。"
    );
  }

  const videoIds = fetchAllVideoIdsFromUploads_(channel.uploadsPlaylistId, apiKey, maxCount);
  if (videoIds.length === 0) {
    throw new Error("動画IDを取得できませんでした（アップロード動画が無い/取得できない可能性）。");
  }

  const urls = videoIds.map((id) => `https://www.youtube.com/watch?v=${id}`);

  if (clearFirst) {
    const lastRow = input.getLastRow();
    if (lastRow >= 2) input.getRange(2, 1, lastRow - 1, 1).clearContent();
  }

  input.getRange(2, 1, urls.length, 1).setValues(urls.map((u) => [u]));

  SpreadsheetApp.getUi().alert(
    `完了: チャンネル「${channel.title || channel.channelId}」の動画URLを ${urls.length} 件、Input!A2以降へ書き込みました。`
  );
}

function fetchChannelStats_(channelInput, apiKey) {
  // channelInput は URL / channelId / @handle を想定
  // - URLで /channel/UCxxxx を含むなら channelId 取得
  // - /@handle または "@handle" なら forHandle を使う
  // - それ以外は "チャンネルID" とみなして id= で問い合わせ

  const trimmed = String(channelInput || "").trim();
  if (!trimmed) return null;

  let query = "";

  const channelId = extractChannelIdFromUrl_(trimmed);
  const handle = extractHandle_(trimmed);

  if (channelId) {
    query = `id=${encodeURIComponent(channelId)}`;
  } else if (handle) {
    query = `forHandle=${encodeURIComponent(handle)}`;
  } else if (/^UC[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    query = `id=${encodeURIComponent(trimmed)}`;
  } else if (/^@[\w.\-]{2,}$/.test(trimmed)) {
    query = `forHandle=${encodeURIComponent(trimmed.replace(/^@/, ""))}`;
  } else {
    // どうしても判別できない場合は id として試す
    query = `id=${encodeURIComponent(trimmed)}`;
  }

  const endpoint =
    "https://www.googleapis.com/youtube/v3/channels" +
    `?part=snippet,statistics&${query}` +
    `&key=${encodeURIComponent(apiKey)}`;

  const res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
  const code = res.getResponseCode();
  const text = res.getContentText();
  if (code >= 400) throw new Error(`YouTube API エラー(channels): HTTP ${code}\n${text}`);

  const json = JSON.parse(text);
  const it = (json.items || [])[0];
  if (!it) return null;

  const snippet = it.snippet || {};
  const stats = it.statistics || {};

  return {
    channelId: it.id || "",
    title: snippet.title || "",
    viewCount: toNumber_(stats.viewCount),
    subscriberCount: stats.hiddenSubscriberCount ? "" : toNumber_(stats.subscriberCount),
    videoCount: toNumber_(stats.videoCount),
  };
}

function fetchChannelDetailsWithUploads_(channelInput, apiKey) {
  // channels.list で uploads playlistId まで取得する
  const trimmed = String(channelInput || "").trim();
  if (!trimmed) return null;

  // 1) channelId / handle / username の判定
  const channelId = extractChannelIdFromUrl_(trimmed);
  const handle = extractHandle_(trimmed);
  const username = extractUsernameFromUrl_(trimmed);

  let query = "";
  if (channelId) query = `id=${encodeURIComponent(channelId)}`;
  else if (handle) query = `forHandle=${encodeURIComponent(handle)}`;
  else if (username) query = `forUsername=${encodeURIComponent(username)}`;
  else if (/^UC[a-zA-Z0-9_-]{10,}$/.test(trimmed)) query = `id=${encodeURIComponent(trimmed)}`;
  else if (/^@[\w.\-]{2,}$/.test(trimmed)) query = `forHandle=${encodeURIComponent(trimmed.replace(/^@/, ""))}`;
  else query = `id=${encodeURIComponent(trimmed)}`;

  // contentDetails で uploads playlist を取る
  let endpoint =
    "https://www.googleapis.com/youtube/v3/channels" +
    `?part=snippet,contentDetails,statistics&${query}` +
    `&key=${encodeURIComponent(apiKey)}`;

  let res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
  let code = res.getResponseCode();
  let text = res.getContentText();
  if (code >= 400) throw new Error(`YouTube API エラー(channels): HTTP ${code}\n${text}`);
  let json = JSON.parse(text);
  let it = (json.items || [])[0];

  // 2) もし /c/ やカスタムURLなどで引けなかった場合、search.listでベストエフォート
  if (!it) {
    const q = extractCustomPathFromUrl_(trimmed);
    if (q) {
      endpoint =
        "https://www.googleapis.com/youtube/v3/search" +
        `?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q)}` +
        `&key=${encodeURIComponent(apiKey)}`;
      res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
      code = res.getResponseCode();
      text = res.getContentText();
      if (code >= 400) throw new Error(`YouTube API エラー(search): HTTP ${code}\n${text}`);
      json = JSON.parse(text);
      const chId = (((json.items || [])[0] || {}).id || {}).channelId;
      if (chId) {
        endpoint =
          "https://www.googleapis.com/youtube/v3/channels" +
          `?part=snippet,contentDetails,statistics&id=${encodeURIComponent(chId)}` +
          `&key=${encodeURIComponent(apiKey)}`;
        res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
        code = res.getResponseCode();
        text = res.getContentText();
        if (code >= 400) throw new Error(`YouTube API エラー(channels): HTTP ${code}\n${text}`);
        json = JSON.parse(text);
        it = (json.items || [])[0];
      }
    }
  }

  if (!it) return null;

  const snippet = it.snippet || {};
  const stats = it.statistics || {};
  const cd = it.contentDetails || {};
  const uploadsPlaylistId =
    ((cd.relatedPlaylists || {}).uploads) ? cd.relatedPlaylists.uploads : "";

  return {
    channelId: it.id || "",
    title: snippet.title || "",
    uploadsPlaylistId,
    viewCount: toNumber_(stats.viewCount),
    subscriberCount: stats.hiddenSubscriberCount ? "" : toNumber_(stats.subscriberCount),
    videoCount: toNumber_(stats.videoCount),
  };
}

function fetchAllVideoIdsFromUploads_(uploadsPlaylistId, apiKey, maxCount) {
  const ids = [];
  let pageToken = "";
  let loopGuard = 0;

  while (ids.length < maxCount) {
    loopGuard++;
    if (loopGuard > 200) break; // 異常ループ保険

    const remaining = maxCount - ids.length;
    const maxResults = Math.min(50, remaining);

    const endpoint =
      "https://www.googleapis.com/youtube/v3/playlistItems" +
      `?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}` +
      `&maxResults=${encodeURIComponent(maxResults)}` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "") +
      `&key=${encodeURIComponent(apiKey)}`;

    const res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
    const code = res.getResponseCode();
    const text = res.getContentText();
    if (code >= 400) throw new Error(`YouTube API エラー(playlistItems): HTTP ${code}\n${text}`);

    const json = JSON.parse(text);
    const items = json.items || [];
    items.forEach((it) => {
      const vid = (((it.snippet || {}).resourceId || {}).videoId) || "";
      if (vid) ids.push(vid);
    });

    pageToken = json.nextPageToken || "";
    if (!pageToken) break;
  }

  // 念のため重複除去（古い動画でたまに重複するケース対策）
  const seen = {};
  return ids.filter((id) => (seen[id] ? false : (seen[id] = true)));
}

function normalizeMaxCount_(raw, defaultValue) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return defaultValue;
  return Math.min(Math.floor(n), 5000); // 安全上限（実行時間・クォータ対策）
}

function getApiKey_() {
  return PropertiesService.getScriptProperties().getProperty(PROP_API_KEY);
}

function chunk_(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function toNumber_(v) {
  if (v === undefined || v === null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function extractVideoId_(url) {
  const u = String(url || "").trim();
  if (!u) return null;

  // youtu.be/<id>
  let m = u.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];

  // youtube.com/watch?v=<id>
  m = u.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];

  // /shorts/<id>
  m = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];

  // /live/<id>
  m = u.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];

  // /embed/<id>
  m = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];

  return null;
}

function extractChannelIdFromUrl_(input) {
  const u = String(input || "").trim();
  // https://www.youtube.com/channel/UCxxxx
  const m = u.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{10,})/);
  return m ? m[1] : null;
}

function extractHandle_(input) {
  const u = String(input || "").trim();
  // https://www.youtube.com/@handle
  let m = u.match(/youtube\.com\/@([\w.\-]{2,})/);
  if (m) return m[1];
  // @handle
  m = u.match(/^@([\w.\-]{2,})$/);
  if (m) return m[1];
  return null;
}

function extractUsernameFromUrl_(input) {
  const u = String(input || "").trim();
  // https://www.youtube.com/user/Username
  const m = u.match(/youtube\.com\/user\/([\w.\-]{2,})/);
  return m ? m[1] : null;
}

function extractCustomPathFromUrl_(input) {
  // /c/NAME や /NAME 形式を search.list の q に使う（ベストエフォート）
  const u = String(input || "").trim();
  let m = u.match(/youtube\.com\/c\/([\w.\-]{2,})/);
  if (m) return m[1];
  m = u.match(/youtube\.com\/([\w.\-]{2,})$/);
  if (m) {
    const p = m[1];
    if (p !== "channel" && p !== "user" && p !== "@" && p !== "watch" && p !== "shorts") return p;
  }
  return null;
}
