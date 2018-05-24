const cronJob = require('cron').CronJob;
const superagent = require('superagent');
const moment = require('moment');
const fs = require('fs')
const _ = require('underscore')


module.exports = robot => {
  robot.respond(/.*hey.*/i, function (msg) {
    msg.reply(" ❤ ☂　☁　☀　☁　☃　Mother fucker!!!!");
    return console.log("Mother fucker!!!!");
  });
  //毎日１７時に明日の天気をつぶやく
  const EveryDayWeatherInfoJob = new cronJob('1 10 22 * * *', () => {
    robot.send({
      room: 'random'
    }, '定期定期定期定期');
    console.log('定期定期定期定期');
  })
  EveryDayWeatherInfoJob.start();
  robot.respond(/.*私(.*)/i, function (res) {
    var name;
    name = res.match[1];
    console.log(name);
    console.log(name.match(/(一週間)/))
    console.log(/[!-\/:-@\[-`\{-\~]+/.test(name));
    if (/[!-\/:-@\[-`\{-\~]+/.test(name) || name === "") {
      res.reply("え？なんだって？");
      return console.log("え？なんだって？");
    } else if (name) {
      res.reply("こんにちは " + name + " さん");
      return console.log("こんにちは " + name + " さん");
    }
  });
  robot.respond(/.*like.*/i, function (res) {
    return res.emote("makes a freshly baked pie");
  });
  robot.enter(function (res) {
    return res.reply("おかえりなさい！！　ここたま！！（ここたま：「ここがあなたの魂の場所のよ！！」の略）");
  });
  robot.leave(function (res) {
    return res.reply("いってらっしゃい！！");
  });
  robot.respond(/.*天気.*/i, (res) => {
    SendWeatherInfo(res);
  })
}


/**
 * 気象情報送信
 * @param res　ユーザーのつぶやき
 */
function SendWeatherInfo(res) {
// TODO 東京 一週間　対応
  const api_key = process.env.OPENWEATHERMAPAPIKEY
  superagent.get(`http://api.openweathermap.org/data/2.5/forecast?q=Fukuoka-shi&appid=${api_key}&lang=ja`).end((err, data) => {
    if (err) {
      console.log(err);
      res.send("天気情報の取得に失敗しました　原因は次の中にあるかもしれません  " + err.toString());
      return
    }
    if (!data.body) return
    const apiRes = data.body;
    if ((apiRes) && apiRes.cod !== "200") {
      return res.send("天気情報の取得に失敗しましたサーバーが正しいレスポンスを返しませんでした");
    } else {
      // fs.writeFile('api.json' ,  JSON.stringify( apiRes.list, null, '  '))
      const infoMsg = CreateWeatherInfo(apiRes);
      res.send(infoMsg);
      console.log(infoMsg);
    }
  })
}

/**
 * openweathermap.org のapiパーサー
 * @param apiResponse
 * @returns {string}
 */
const CreateWeatherInfo = apiResponse => {
  if (!apiResponse.list) return ''
  var tommorwWeatherList, tomorrow;
  tomorrow = moment().add(1, "Day").format("YYYY-MM-DD");
  console.log(tomorrow);
  tommorwWeatherList = apiResponse.list.filter(thank => {
    return thank.dt_txt.includes(tomorrow);
  });

  const mainList = tommorwWeatherList.map(thank => thank.weather[0].main)
  const mainCount = _.countBy(mainList, main => main)
  let most = {
    weather: '',
    count: 0
  }
  console.log(mainCount)
  Object.keys(mainCount).forEach(key => {
    if (mainCount[key] >= most.count) {
      most.weather = most.weather = key
      most.count = mainCount[key]
    }
  })
  const emoji = emojis[most.weather]

  let infoMsg = "明日の天気は..."
  if (emoji) infoMsg += emoji
   infoMsg += '\n'
  tommorwWeatherList.forEach((thank) => {
    let hour = moment(thank.dt_txt, 'YYYY-MM-DD hh:mm:ss').hour()
    infoMsg += " " + hour + "時 : " + thank.weather[0].description + " \n";
  });

  if(most.weather === 'Rain'){
    infoMsg += '明日は☂が降るみたいだから、傘を忘れずにね！！'
  }
  return infoMsg;
};

const emojis = {
  Rain: '☂',
  Clear: '☀',
  Clouds: '☁',
  Snow: '☃'
}
