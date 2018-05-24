const cronJob = require('cron').CronJob;
const superagent = require('superagent');
const moment = require('moment');
const _ = require('underscore')

const api_key = process.env.OPENWEATHERMAPAPIKEY

module.exports = robot => {
  //毎日１７時に明日の天気をつぶやく
  const EveryDayWeatherInfoJob = new cronJob('1 10 22 * * *', () => {
    let tomorrowWeatherInfo
    try {
      tomorrowWeatherInfo = CreateTomorrowWeatherInfo(GetWeather())
    }
    catch (e) {
      robot.send(e.toString())
    }
    robot.send({
      room: 'random'
    }, tomorrowWeatherInfo);
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
  superagent.get(`http://api.openweathermap.org/data/2.5/forecast?q=Fukuoka-shi&appid=${api_key}&lang=ja`).end((err, data) => {
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
  var tommorwWeatherList, tomorrow;
  tomorrow = moment().add(1, "Day").format("YYYY-MM-DD");
  tommorwWeatherList = apiResponse.list.filter(thank => {
    return thank.dt_txt.includes(tomorrow);
  });

  const mainList = tommorwWeatherList.map(thank => thank.weather[0].main)
  const mainCount = _.countBy(mainList, main => main)
  let most = {
    weather: '',
    count: 0
  }
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
