/**
 * スプレッドシートが開かれたときに実行される関数
 * メニューを作成します
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('カスタム機能') // メニュー名
    .addItem('サイドバーを表示', 'showSidebar') // サイドバー表示
    .addSeparator()
    .addItem('デモデータを挿入', 'insertDemoData') // デモデータ機能
    .addItem('分析用フォーマット整形', 'formatAnalysisSheet') // 整形機能
    .addSeparator()
    .addItem('ヘルプ', 'showHelp') // ヘルプ機能
    .addToUi();
}

/**
 * サイドバーを表示する関数
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('分析ツールバー'); // サイドバーのタイトル
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * ヘルプを表示する関数
 */
function showHelp() {
  const ui = SpreadsheetApp.getUi();
  const msg = "【使い方】\n" +
              "1. 「デモデータを挿入」でテスト用の売上データを作成します。\n" +
              "2. 「分析用フォーマット整形」で表のデザインを整えます。\n" +
              "3. サイドバーからその他の操作も可能です。";
  ui.alert('ヘルプ', msg, ui.ButtonSet.OK);
}

/**
 * デモデータを挿入する関数
 * 現在のシートをクリアし、サンプルデータを入力します
 */
function insertDemoData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear(); // シートをクリア
  
  // ヘッダーとデータ
  const data = [
    ["日付", "商品名", "カテゴリー", "単価", "数量", "売上金額"], // ヘッダー
    ["2024/01/01", "商品A", "食品", 1000, 5, 5000],
    ["2024/01/02", "商品B", "家電", 15000, 1, 15000],
    ["2024/01/03", "商品C", "書籍", 1500, 3, 4500],
    ["2024/01/04", "商品A", "食品", 1000, 10, 10000],
    ["2024/01/05", "商品D", "雑貨", 500, 20, 10000]
  ];
  
  // データの書き込み
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  SpreadsheetApp.getUi().alert('デモデータを挿入しました。');
}

/**
 * 分析データの整形を行う関数
 * 罫線、背景色、太字などを適用します
 */
function formatAnalysisSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 1 || lastCol < 1) {
    SpreadsheetApp.getUi().alert('データがありません。');
    return;
  }
  
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  
  // スタイルの適用
  range.setBorder(true, true, true, true, true, true); // 全体に罫線
  range.setFontFamily("Arial");
  
  // ヘッダーのスタイル
  headerRange.setBackground("#4c8bf5"); // 青色背景
  headerRange.setFontColor("white");    // 白文字
  headerRange.setFontWeight("bold");    // 太字
  headerRange.setHorizontalAlignment("center");
  
  // 列幅の自動調整
  sheet.autoResizeColumns(1, lastCol);
  
  SpreadsheetApp.getUi().alert('フォーマットを整形しました。');
}