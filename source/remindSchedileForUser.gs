// 設定ファイルよりスプレッドシートIDを取得
var SPREAD_SHEET_ID = getSpreadSheetId();

// 設定ファイルよりシート名を取得
var SHEET_NAME = getSheetName();

//設定ファイルよりチャンネルアクセストークンを取得
var CHANNEL_ACCESS_TOKEN = getChannelAccessToken();


function remindSchedule() {

  // スプレッドシートからユーザIDとメッセージ内容を参照
  var spreadsheet = SpreadsheetApp.openById(SPREAD_SHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  // 実行時の日時を取得
  var today = new Date();

  // 明日の日付の月
  var month = today.getMonth()+1;

  // 明日の日付の日
  var day = today.getDate()+1;
  
  // 明日の日付
  var tomorrow = month+'/'+day;

 // 送信対象ユーザー
  var sendto = '';
  
  // 明日の予定
  var schedules = [];
  for(var i=1; i<sheet.getLastRow()+1; i++) {

    // 何行目かを記録する
    var currentRow = i.toString();
    
    // ユーザーID
    var userId = sheet.getRange('A'+currentRow).getValue();

    // 日付
    var date = sheet.getRange('B'+currentRow).getValue();
    var date_m = date.getMonth()+1;
    var date_d = date.getDate();
    var cellDate = date_m+'/'+date_d;

    // 予定
    var plan = sheet.getRange('C'+currentRow).getValue();

    // 明日の日付とシートの日付が一致したら、ユーザーごとに明日の予定に追加していく
    if(cellDate == tomorrow){

      if(!schedules[userId]) {
        schedules[userId] = [];
        schedules[userId][0] = plan;
      } else {
        schedules[userId][schedules[userId].length] = plan;
      }
      // schedules.push(plan);
      // console.log(schedules);
      sendto = userId;
    }
  }

  // ユーザーごとに通知をする
  for (let userId in schedules) {
  
    // 明日の予定をお知らせするメッセージを作成
    if(schedules[userId]){
      var message = '明日の予定は\n';
      schedules[userId].forEach(function(element){
        message += '　・'+element+'\n';
      });
      message += 'です'; 
    }

    // ユーザーに通知する
    if(message != '') {
      // Messaging API の push を使ってユーザに送信
      var url = 'https://api.line.me/v2/bot/message/push'; 
      UrlFetchApp.fetch(url, {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8', 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'to': userId, 
          'messages': [{
            'type': 'text',
            'text': message,
          }],
        }), 
      });
    }
  }

}