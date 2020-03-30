'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fsp = require('fs').promises;
const got = require('got');
//着信に対して応答を返すVoice用TwiMLを作成するクラス
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();
const VOICE_FOLDER_NAME = 'voice_files';
app.use(bodyParser.urlencoded({ extended: true }));
// 生成したファイルを保存しておくフォルダを設定
app.use(express.static(path.join(__dirname, VOICE_FOLDER_NAME)));

// Twilioから着信リクエストを受け取るAPI
app.post('/incoming', async (req, res, next) => {

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
            const outputFileName = `${req.body.CallSid}.mp3`;
            // mp3ファイルを保存
            await fsp.writeFile(
                path.join(VOICE_FOLDER_NAME, outputFileName), response.body, 'binary');

            // TwiMLを初期化
            const twiml = new VoiceResponse();
            // 生成した音声を再生させる。
            twiml.play(path.join(outputFileName));
            //作成したTwiMLをレスポンスとして送信
            res.status(200).send(twiml.toString());
        }
    } catch (error) {
            console.error(error);
            next(error);
    }
});  

app.post('/statuschanged', async(req, res, next) => {
    try {
        // 通話が完了したかどうかを確認
        if (req.body.CallStatus === "completed")
        {
            // CallSidからファイルパスを構築し、削除
            const filePath = path.join(VOICE_FOLDER_NAME, `${req.body.CallSid}.mp3`);
            await fsp.unlink(filePath);
            console.info(`${filePath}を削除しました`);
        }
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        next (error);
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));

