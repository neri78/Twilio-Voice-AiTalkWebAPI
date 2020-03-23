# Twilio-Voice-AiTalkWebAPI
Twilio Programmable Voiceと、AiTalk Web APIを連携させるサンプルプログラムです。

## サンプルの実行方法

サンプルの実行には、[AiTalk WebAPI](https://www.ai-j.jp/cloud/webapi/)の[アカウント](https://aitalk-webapi-trial.aitalk.jp/)と[Twilio](https://www.twilio.com/ja)の[アカウント]()が必要です。  

それぞれのアカウントを作成後<code>.env.sample</code>ファイルをコピーし<code>.env</code>とリネームします。<code>.env</code>ファイルにはAiTalk Web APIのエンドポイントやユーザー名、パスワード、このサンプルをホストするURLそれぞれの値を設定してください。

```.envファイル
AI_TALK_API_URL=AiTalk Web APIのエンドポイント（例 - https://api.example.com）
AI_TALK_USERNAME=AiTalk Web APIのユーザー名（例 - username）
AI_TALK_PASSWORD=AiTalk Web APIのパスワード（例 - password）
```

続けて、下記のコマンドを実行し、サンプルプログラムを起動します。

```プロジェクトの実行方法
npm install
npm start
```

ローカル環境でホストする場合は、[ngrok](https://ngrok.com/)などのツールを使い、生成されたURLを記録しておきます。（例 - https://daizen.ngrok.io)  
このURLを[Twilioコンソール](https://jp.twilio.com/console)で取得した電話番号のWebhookに指定します。 __（例: https://daizen.ngrok.io<code>/incoming</code>）__
![Twilio Voice Console](https://neri78.github.io/images/twilio-console/Twilio-Console-Voice.png)

これで準備は完了です。Webhookを設定した番号に電話をかけてみましょう！