// 設定ファイルよりスプレッドシートIDを取得
var SPREAD_SHEET_ID = getSpreadSheetId();

// 設定ファイルよりシート名を取得
var SHEET_NAME = getSheetName();

//設定ファイルよりチャンネルアクセストークンを取得
var CHANNEL_ACCESS_TOKEN = getChannelAccessToken();


// LINEから送られた予定をスプレッドシートに登録する
function doPost(e) {

  // Messaging API から Webhook で送信された情報を取得
  var webhookData = JSON.parse(e.postData.contents);
  var replyToken= webhookData.events[0].replyToken;
  var message = webhookData.events[0].message.text;

  // 「<日付> <予定> 登録」の形式
  var matchResult = message.match(/[0-9]+\/[0-9]+ .* 登録/);

  var messageForUser = '';

  if(matchResult){
    // 受け取ったメッセージを半角空白で区切る
    var splitedMessage = message.split(' ');

    // 日付
    var date = splitedMessage[0];

    // 予定
    var plan = splitedMessage[1];

    // ユーザーに返すメッセージ
    messageForUser = date + 'の予定に「' + plan + '」を登録しました';

    // Messaging API から送信された情報からユーザIDを取得
    var userId = webhookData.events[0].source.userId;

    // スプレッドシートを取得する
    var spreadsheet = SpreadsheetApp.openById(SPREAD_SHEET_ID);
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // シートの最終行を取得する
    var lastrow = (sheet.getLastRow()+1).toString();

    // 日付と予定、ユーザーIDを記録するセルを取得
    var cellUserId = 'A'+lastrow;
    var cellPlanDate = 'B'+lastrow;
    var cellPlan = 'C'+lastrow;

    // スプレッドシートにユーザID、日付、予定を保存 
    sheet.getRange(cellUserId).setValue(userId);
    sheet.getRange(cellPlanDate).setValue(date);
    sheet.getRange(cellPlan).setValue(plan);

  }else {
    // ユーザーに返すメッセージ
    messageForUser = '『<日付> <予定> 登録』の形式でメッセージを送信してください。';
  }
  


  // Messaging API の reply をリクエストしてユーザに返信 
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8', 
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken, 
      'messages': [{
        'type': 'text',
        'text': messageForUser,
        }
      ],
    }), 
  });
}