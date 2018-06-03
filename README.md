# WeatherBot

### WeatherBot はスラック上で天気予報を教えてくれるBotです
### 使い方

    //プログラムのダウンロード
    % git clone
    
- OpenWeatherMapのapiキーを取得して下さい。無料で取得できます。
[OpenWeatherMap](https://openweathermap.org/)
- 取得したapiキーを環境変数に登録して下さい。
```
    % export OPENWEATHERMAPAPIKEY='あなたのOpenWeatherMapのapiキー'
```
- slackにhubotアプリをインストールした後、

- 初回起動時は、依存ライブラリのインストールが必要です。
`% npm install`


```
    %  ./bin/hubot --adapter slack
```

You'll see some start up output and a prompt:

    [Sat Feb 28 2015 12:38:27 GMT+0000 (GMT)] INFO Using default redis on localhost:6379
    lcabot>

Then you can interact with lcabot by typing `lcabot help`.

    lcabot> lcabot help
    lcabot animate me <query> - The same thing as `image me`, except adds [snip]
    lcabot help - Displays all of the help commands that lcabot knows about.
    ...

### Configuration
