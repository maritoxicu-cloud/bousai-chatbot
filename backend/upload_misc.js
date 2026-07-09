const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// その他 クイズデータ 20問
const quizData = [
  {"category": "その他", "question": "災害(さいがい)が起きたときに最初(さいしょ)にすべきことは？", "options": ["TV をつける", "荷物(にもつ)を用意(ようい)する", "身の安全(あんぜん)を確保(かくほ)する"], "correct_answer": 2, "explanation": "どんな状況(じょうきょう)でも、まず自分と家族(かぞく)の身の安全(あんぜん)が最優先（さいゆうせん）です。", "difficulty": "easy"},
  {"category": "その他", "question": "警戒(けいかい)レベル2はどんな状態(じょうたい)？", "options": ["大雨が降り始めた", "非常(ひじょう)に警戒(けいかい)する状態", "気象(きしょう)に注意(ちゅうい)が必要(ひつよう)な状態"], "correct_answer": 2, "explanation": "レベル2は気象情報に注意(ちゅうい)を払う段階(だんかい)です。準備(じゅんび)を始める合図（あいず）です。", "difficulty": "medium"},
  {"category": "その他", "question": "地震の揺れが大きい時、家の中にいたらどうする？", "options": ["窓から逃げる", "丈夫（じょうぶ）な机の下に隠れる", "玄関を開ける"], "correct_answer": 1, "explanation": "家の中では机やテーブルの下に隠れて、落下物(らっかぶつ)から身を守ることが大切(たいせつ)です。", "difficulty": "easy"},
  {"category": "その他", "question": "避難(ひなん)所にペットを連れて行く前にするべきことは？", "options": ["何もしない", "避難(ひなん)所がペットを受け入れるか確認(かくにん)する", "直接(ちょくせつ)連れて行く"], "correct_answer": 1, "explanation": "全ての避難所がペットを受け入れているわけではないので、事前(じぜん)に確認(かくにん)が必要(ひつよう)です。", "difficulty": "medium"},
  {"category": "その他", "question": "子どもと防災(ぼうさい)について話し合う時、何が大切(たいせつ)？", "options": ["難しい言葉を使う", "子どもが理解(りかい)できるように、わかりやすく説明（せつめい）する", "怖いことだけを教える"], "correct_answer": 1, "explanation": "子どもの年齢に合わせて、わかりやすく防災知識を伝(つた)えることが重要(じゅうよう)です。", "difficulty": "easy"},
  {"category": "その他", "question": "災害(さいがい)時に情報(じょうほう)を得るために最も信頼(しんらい)できるのは？", "options": ["SNS", "テレビやラジオ、自治体(じちたい)からの公式情報(こうしきじょうほう)", "友人(ゆうじん)のメール"], "correct_answer": 1, "explanation": "公式情報(こうしきじょうほう)が最も正確（せいかく）で信頼(しんらい)できます。SNS は誤（あやま）った情報(じょうほう)が広まることもあります。", "difficulty": "medium"},
  {"category": "その他", "question": "火災(かさい)が起きたときに最初(さいしょ)に通報(つうほう)すべき番号は？", "options": ["110番", "119番", "118番"], "correct_answer": 1, "explanation": "火災(かさい)・救急(きゅうきゅう)は119番です。", "difficulty": "easy"},
  {"category": "その他", "question": "防災(ぼうさい)バッグを用意(ようい)するときの優先(ゆうせん)順位(じゅんい)は？", "options": ["金銭(きんせん)と貴重品(きちょうひん)", "飲料水(いんりょうすい)と食料(しょくりょう)", "衣類(いるい)と下着(したぎ)"], "correct_answer": 1, "explanation": "命を守るための飲料水と食料が最優先（さいゆうせん）です。", "difficulty": "medium"},
  {"category": "その他", "question": "避難(ひなん)指示が出た時に最も重要(じゅうよう)な行動(こうどう)は？", "options": ["詳しく指示(しじ)を読む", "躊躇(ちゅうちょ)せず直ちに避難(ひなん)する", "隣（となり）の人に聞く"], "correct_answer": 1, "explanation": "指示(しじ)が出たら、時間を無駄（むだ）にせず、直ちに避難(ひなん)することが大切(たいせつ)です。", "difficulty": "easy"},
  {"category": "その他", "question": "地域(ちいき)のハザードマップを確認(かくにん)するのはいつ？", "options": ["災害(さいがい)が起きてから", "普段(ふだん)から、事前(じぜん)に確認(かくにん)しておく", "避難(ひなん)する時"], "correct_answer": 1, "explanation": "事前(じぜん)にハザードマップで自分の地域(ちいき)のリスクを知ることが、備えの第一歩です。", "difficulty": "easy"},
  {"category": "その他", "question": "家族(かぞく)の防災(ぼうさい)訓練（くんれん）はどのくらいの頻度(ひんど)で行うべき？", "options": ["5年に1回", "1年に1～2回", "10年に1回"], "correct_answer": 1, "explanation": "定期的（ていきてき）に訓練することで、いざという時に落ち着いて行動(こうどう)できます。", "difficulty": "medium"},
  {"category": "その他", "question": "災害時に高齢者（こうれいしゃ）を支援(しえん)する時に大切(たいせつ)なことは？", "options": ["一人で助けに行く", "複数人（ふくすうにん）で、安全(あんぜん)を確認(かくにん)しながら助ける", "急いで走って助ける"], "correct_answer": 1, "explanation": "自分の安全(あんぜん)を確認(かくにん)しながら、複数人で支援(しえん)することが重要(じゅうよう)です。", "difficulty": "medium"},
  {"category": "その他", "question": "地震で家が崩壊(ほうかい)した場合、生き埋め状態で対応(たいおう)すべきことは？", "options": ["動きまわる", "声を出す、懐中電灯(かいちゅうでんとう)で信号を送る、救助者(きゅうじょしゃ)の呼びかけに応(おう)じる"], "correct_answer": 1, "explanation": "冷静(れいせい）に行動(こうどう)し、救助者との連絡(れんらく)を取ることが大切(たいせつ)です。", "difficulty": "hard"},
  {"category": "その他", "question": "避難(ひなん)所での生活(せいかつ)で最も気をつけるべきことは？", "options": ["周りに気を遣（つか）わない", "衛生管理(えいせいかんり)と感染(かんせん)症対策(しょうたいさく)", "自分の事だけ考える"], "correct_answer": 1, "explanation": "多くの人が集まる避難所では、衛生管理と感染症対策が命に関わります。", "difficulty": "medium"},
  {"category": "その他", "question": "災害(さいがい)後の二次(にじ)被害(ひがい)とは？", "options": ["最初の被害(ひがい)", "最初の災害(さいがい)後に起きる倒木(とうぼく)や停電などの被害(ひがい)", "全く関係ない被害"], "correct_answer": 1, "explanation": "倒木、感電、冠水(かんすい)した道への転落（てんらく）など、二次(にじ)被害に注意(ちゅうい)が必要(ひつよう)です。", "difficulty": "hard"},
  {"category": "その他", "question": "警報（けいほう）と注意(ちゅうい)報(ほう)の違(ちが)いは？", "options": ["同じ意味(いみ)である", "警報はより危険(きけん)な状態で、早期(そうき)の避難(ひなん)が必要である", "警報の方が軽い"], "correct_answer": 1, "explanation": "警報は注意報より危険度が高く、直ちに避難(ひなん)などの行動(こうどう)が必要（ひつよう）です。", "difficulty": "medium"},
  {"category": "その他", "question": "子どもが一人で家にいる時に地震が起きたら？", "options": ["すぐに外に逃げる", "丈夫な机の下に隠れて、余震(よしん)を待つ", "親に電話する"], "correct_answer": 1, "explanation": "大きな揺れが収(おさ)まるまで、家の中の丈夫な机の下が最も安全(あんぜん)です。", "difficulty": "medium"},
  {"category": "その他", "question": "避難（ひなん）の判断（はんだん）で最も大切(たいせつ)なことは？", "options": ["周りの人を待つ", "指示(しじ)を待たずに危険と判断したら即座に避難する", "テレビで情報(じょうほう)を待つ"], "correct_answer": 1, "explanation": "自分の命を守るため、危険(きけん)を感じたら躊躇（ちゅうちょ）なく避難（ひなん）することが重要(じゅうよう)です。", "difficulty": "medium"},
  {"category": "その他", "question": "防災(ぼうさい)について学ぶ最適(さいてき)な場所(ばしこ)は？", "options": ["テレビだけ", "自治体(じちたい)の防災訓練（くんれん）や防災講座、このチャットボット", "特に学ぶ必要はない"], "correct_answer": 1, "explanation": "多くの機会(きかい)と情報源(じょうほうげん)から学ぶことが、防災知識を深めるコツです。", "difficulty": "easy"}
];

async function uploadData() {
  try {
    console.log('📊 その他クイズデータ挿入開始...\n');

    // クイズデータを挿入
    console.log('🎯 クイズデータを挿入中...');
    const { error: quizError } = await supabase
      .from('quizzes')
      .insert(quizData);

    if (quizError) {
      console.error('❌ クイズデータ挿入エラー:', quizError);
    } else {
      console.log(`✅ クイズデータ ${quizData.length} 件を Supabase に挿入しました！`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 その他クイズデータ インポート完了');
    console.log(`  クイズ: ${quizData.length} 問（解説付き）`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

uploadData();
