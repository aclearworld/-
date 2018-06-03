const CronJob = require('cron').CronJob;
const SuperAgent = require('superagent');
const Moment = require('moment');
const _ = require('underscore')
const Config = require('../weatherBot.config')

const APIKEY = process.env.OPENWEATHERMAPAPIKEY

module.exports = robot => {
  //とりあえず止まらない
  robot.hear(/.*止まる|とまる+.*/, res => {
    res.send("止まるんじゃねえそ....")
  })
  //毎日１７時に明日の天気をつぶやく
  const EveryDayWeatherInfoJob = new CronJob('1 00 17 * * *', () => {
    const callback = apiRes => {
      const greeting = '１７時になりました、今日も一日お疲れ様でした！　早く家に帰ってゆっくり休んで下さい ついでに明日の天気をお知らせします♪'
      const infoMsg = CreateTomorrowWeatherInfo(apiRes)
      robot.send({
        room: 'random'
      }, greeting + '\n' + infoMsg)
    }

    try {
      GetWeather(callback)
    }
    catch (e) {
    }
  })
  EveryDayWeatherInfoJob.start();

  //天気について聞かれたら調べてあげる
  robot.respond(/.*天気.*/i, (res) => {
    res.send('明日の天気についてしらべるよ！！')

    const callback = (apiRes) => {
      const infoMsg = CreateTomorrowWeatherInfo(apiRes)
      res.send(infoMsg)
    }
    try {
      GetWeather(callback)
    }
    catch (e) {
      res.send(e.toString())
    }
  })
}

/**
 * 気象情報取得
 * @param {function(apiResponse)} callback
 * @returns {Object} apiRes
 * @exception {Error}
 */
function GetWeather(callback) {
  const place = Config.Place || 'Fukuoka-shi'
  if (!APIKEY) throw new Error('openweathermap.orgのAPIKEYが環境変数 OPENWEATHERMAPAPIKEY に登録されていません')
  SuperAgent.get(`http://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${APIKEY}&lang=ja`).end((err, data) => {
    if (err) throw  new Error('天気情報の取得に失敗しました　原因は次の中にあるかもしれません ' + err.toString())
    if (!data.body) throw  new Error('天気情報の取得に失敗しました')

    apiRes = data.body;
    if (!(apiRes) && apiRes.cod !== "200") {
      throw  new Error('天気情報の取得に失敗しましたサーバーが正しいレスポンスを返しませんでした')
    } else {
      callback(apiRes)
    }
  })
}

/**
 * openweathermap.org apiレスポンスから明日の天気情報を生成
 * @param {Object} apiResponse
 * @returns {string}
 */
function CreateTomorrowWeatherInfo(apiResponse) {
  if (!apiResponse.list) return ''
  let tomorrowWeatherList, tomorrow;
  tomorrow = Moment().add(1, "Day").format("YYYY-MM-DD");
  tomorrowWeatherList = apiResponse.list.filter(thank => {
    return thank.dt_txt.includes(tomorrow);
  });

  const mainList = tomorrowWeatherList.map(thank => thank.weather[0].main)
  const mainCount = _.countBy(mainList, main => main)
  let most = {
    weather: '',
    count: 0
  }
  Object.keys(mainCount).forEach(key => {
    if (mainCount[key] >= most.count) {
      most.weather = key
      most.count = mainCount[key]
    }
  })
  const emoji = emojis[most.weather]
  let infoMsg = "明日の天気は..."
  if (emoji) infoMsg += emoji
  infoMsg += '\n'
  tomorrowWeatherList.forEach((thank) => {
    let hour = Moment(thank.dt_txt, 'YYYY-MM-DD hh:mm:ss').hour()
    infoMsg += " " + hour + "時 : " + thank.weather[0].description + " \n";
  });

  if (most.weather === 'Rain') {
    infoMsg += '明日は☂が降るみたいだから、傘を忘れずにね！！'
  }
  return infoMsg;
};

/**
 * 天気と絵文字の対応
 * @type {{Rain: string, Clear: string, Clouds: string, Snow: string}}
 */
const emojis = {
  Rain: '☂',
  Clear: '☀',
  Clouds: '☁',
  Snow: '☃'
}
