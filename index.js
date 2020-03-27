require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const got = require('got');
//着信に対して応答を返すVoice用TwiMLを作成するクラス
const VoiceResponse = require('twilio').twiml.VoiceResponse;;

const app = express();
const VOICE_FOLDER_NAME = 'voice_files';
app.use(bodyParser.urlencoded({ extended: true }));
// 生成したファイルを保存しておくフォルダを設定
app.use(express.static(path.join(__dirname, VOICE_FOLDER_NAME)));

// Twilioから着信リクエストを受け取るAPI
app.post('/incoming', async (req, res) => {

    // 音声合成するテキストを設定。実際はAIエンジンなどから生成される。
    const text = '今日はお電話ありがとう！エーアイトークとTwilioを連携した音声合成デモだよ！ あなたの電話番号は' + req.body.From + 'だよね？ぜひ、両方のサービスを試してみてね。';

    // AiTalk Web API用のパラメーターを作成
    // AiTalk Web APIでは最低限ユーザー名、パスワード、合成文字列、話者名が必要
    // このサンプルではのぞみ（感情対応）、最大限の喜びを抑揚をつけてmp3で出力
    const aiTalkOptions = {
        'username' : process.env.AI_TALK_USERNAME,
        'password' : process.env.AI_TALK_PASSWORD,
        'text' : text,
        'speaker_name' : 'nozomi_emo',
        'style' : { 'j': '1.0'},
        'range' : 2.00,
        'ext' : 'mp3'
    }

    try {
        // リクエストオプション
        const options = {
            method: 'POST',
            form: aiTalkOptions,
            encoding: 'binary'
        };

        //AiTalk Web APIにリクエスト
        const response = await got(process.env.AI_TALK_API_URL, options);

        if (response.statusCode === 200 ) {
            //現在のCallSidから出力ファイル名を生成
            const outputFileName = req.body.CallSid + '.mp3';
            // mp3ファイルを保存
            await fs.promises.writeFile(
                path.join(VOICE_FOLDER_NAME, outputFileName), response.body, 'binary');
    
            // TwiMLを初期化
            const twiml = new VoiceResponse();
            // 生成した音声を再生させる。
            twiml.play(path.join(outputFileName));
            //ヘッダを設定し、作成したTwiMLをレスポンスとして送信
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
        }
    } catch (error) {
            console.dir(error);
    }
});  

app.post('/statuschanged', async(req, res) => {
    // 通話が完了した段階で該当ファイルを削除
    if (req.body.CallStatus === "completed")
    {
        var filePath = 'voice_files/' + req.body.CallSid + '.mp3';
        fs.exists(filePath, (result) =>{
            if (result)
            {
                fs.unlink(filePath, (err)=>{
                if (err) throw err;
                console.log(filePath + 'を削除しました。');
                });
            }
        });
    }
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end('OK');
});

app.listen(3000, () => console.log('Listening on port 3000'));

