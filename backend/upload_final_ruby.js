const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const stockpileData = [
  {"category": "備蓄", "title": "非常食の基本", "content": "非常食は、最低3日分、できれば1週間分の用意が大切です。1人が1日3食食べることを考えて、<ruby>栄<rt>えい</rt></ruby><ruby>養<rt>よう</rt></ruby>がバランスよく取れた食べ物を選びましょう。加熱が不要な缶詰やアルファ米など、すぐに食べられるものを選ぶといいですね。"},
  {"category": "備蓄", "title": "飲料水は必須", "content": "1人が1日3リットルの水が必要です。3日分なら9リットル、1週間分なら21リットルです。ペットボトルの水を定期的に買い足して、缶詰のジュースや<ruby>経<rt>けい</rt></ruby><ruby>口<rt>こう</rt></ruby><ruby>補<rt>ほ</rt></ruby><ruby>水<rt>すい</rt></ruby><ruby>液<rt>えき</rt></ruby>など、色々な飲み物を用意しておくといいですね。"},
  {"category": "備蓄", "title": "加熱しなくても食べられる食べ物", "content": "<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>時は電気やガスが使えなくなります。だから、加熱しなくても食べられる缶詰、レトルト食品、チョコレート、ドライフルーツなどを中心に用意しましょう。スプーンも缶詰に付いているものを選ぶといいですね。"},
  {"category": "備蓄", "title": "電池と懐中電灯", "content": "停電に備えて、懐中電灯と単三電池をたくさん用意しておきましょう。夜に停電すると、電気がないと何もできません。手回し式の懐中電灯や、太陽で充電できるタイプもあると便利です。"},
  {"category": "備蓄", "title": "医療用品の用意", "content": "包帯、ガーゼ、消毒液、風邪薬、痛み止めなどをキットにして用意しておきましょう。家族が医者から<ruby>処<rt>しょ</rt></ruby><ruby>方<rt>ほう</rt></ruby>されている薬がある場合は、最低2週間分の余分を用意しておきましょう。"},
  {"category": "備蓄", "title": "携帯電話の充電対策", "content": "携帯電話は、連絡や<ruby>情<rt>じょう</rt></ruby><ruby>報<rt>ほう</rt></ruby>の源です。モバイルバッテリーを複数個用意して、常に充電しておきましょう。充電ケーブルも、家族の全員のスマホに対応できるよう、複数種類用意しておくといいですね。"},
  {"category": "備蓄", "title": "トイレの備蓄", "content": "水道が止まると、トイレが使えなくなります。携帯トイレや簡易トイレを備蓄しておきましょう。1人が1日5回使うことを考えると、3日分なら15個以上が目安です。ゴミ袋や新聞紙も一緒に用意してください。"},
  {"category": "備蓄", "title": "<ruby>衛<rt>えい</rt></ruby><ruby>生<rt>せい</rt></ruby>用品も大切", "content": "ティッシュペーパー、トイレットペーパー、ウェットティッシュ、<ruby>生<rt>せい</rt></ruby><ruby>理<rt>り</rt></ruby>用品、おむつなど、人数に応じた<ruby>衛<rt>えい</rt></ruby><ruby>生<rt>せい</rt></ruby>用品をたくさん用意しておきましょう。<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>時は買えなくなるので、余裕を持った備蓄が大切です。"},
  {"category": "備蓄", "title": "防災グッズの置き場所", "content": "用意した物は、家族みんなが知っている場所に、すぐに取り出せる状態で置いておくことが大切です。押し入れの奥など不便な場所では意味がありません。リビングの一角など、すぐに取れる場所に置いておきましょう。"},
  {"category": "備蓄", "title": "賞味期限の管理", "content": "非常食や医療用品、電池には期限があります。定期的にチェックして、古いものから食べたり、新しいものに買い換えたりしましょう。リストを作って管理すると、無駄がなくなります。"},
  {"category": "備蓄", "title": "子ども向けの工夫", "content": "子どもは非常食を食べたがらないことがあります。子どもの好きなお菓子やジュースも含めて備蓄しましょう。<ruby>栄<rt>えい</rt></ruby><ruby>養<rt>よう</rt></ruby>だけでなく、心の支えになることも大切です。子どもにも、何が必要なのかを教えておくといいですね。"},
  {"category": "備蓄", "title": "ペット用の備蓄", "content": "ペットがいる場合は、ペット用の食べ物、水、医療用品も備蓄が必要です。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所でペットが受け入れられるか確認しておきましょう。"},
  {"category": "備蓄", "title": "家族の緊急連絡先", "content": "<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>で家族がバラバラになることもあります。連絡先を紙に書いて、子どもにも持たせ、防災バッグに入れておきましょう。スマホが使えなくなることを考えて、遠く離れた<ruby>親<rt>しん</rt></ruby><ruby>戚<rt>せき</rt></ruby>の家を集合場所にしておくのも良いですね。"},
  {"category": "備蓄", "title": "<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所での快適性", "content": "<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所での生活は、ストレスが大きいものです。アイマスク、耳栓、枕、毛布、着替えの下着など、快適さを保つものも備蓄するといいですね。特に子どもやお年寄りのいるおうちは、心身の負担を減らすための工夫が大切です。"},
  {"category": "備蓄", "title": "防災バッグの定期的な確認", "content": "防災バッグは、玄関などすぐに持ち出せる場所に置いて、定期的に確認しましょう。季節に合わせて、夏は虫除け、冬は防寒用品を追加するなど、柔軟に対応することが大切です。"}
];

const petData = [
  {"category": "ペット防災", "title": "ペットも家族の一員", "content": "ペットは飼い主にとって大切な家族です。<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>が起きた時に、ペットを置き去りにすることはできません。ペット用の防災グッズの用意、<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>場所の確認、迷子対策など、ペットの<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>を守るための準備をしておくことが大切です。"},
  {"category": "ペット防災", "title": "ペット用フードと水の備蓄", "content": "ペットが食べられるフードと水を、最低3日分から1週間分備蓄しておきましょう。ペット用フードの期限を定期的にチェックして、古いものから食べ、新しいものに買い換えることが大切です。いつも食べているフードを保管しておくと、ストレスなく食べられます。"},
  {"category": "ペット防災", "title": "ペットの医療情報", "content": "ペットの予防接種証明書や医療記録を、防災バッグに入れて保管しておきましょう。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所でペットが受け入れられるか確認する時に必要になることもあります。常用している薬の情報も一緒に保管しておきましょう。"},
  {"category": "ペット防災", "title": "ペットの身分証明", "content": "<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>時にペットが迷子になることがあります。マイクロチップの装着や首輪に身分証をつけて、飼い主の名前と連絡先を書いておきましょう。最新の写真も何枚か保管しておくと、迷子になった時に探しやすくなります。"},
  {"category": "ペット防災", "title": "ケージやキャリーバッグの準備", "content": "<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>する時に、ペットをすぐに移動させるためのケージやキャリーバッグを事前に準備しておきましょう。ペットがケージに慣れておくことも大切です。普段からケージでの移動に慣れさせておくと、<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>時に素早く<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>できます。"},
  {"category": "ペット防災", "title": "屋外飼いペットの対策", "content": "台風や地震の際に、屋外飼いのペットはすぐに室内に入れ、<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>な場所に<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>させることが必要です。普段から、<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>が来たらどうするかを想定しておき、屋外飼いのペットを室内に移動できる環境を整えておきましょう。"},
  {"category": "ペット防災", "title": "<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所でペットが受け入れられるか確認", "content": "全ての<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所がペットの受け入れに対応しているわけではありません。事前に、自分が<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>する予定の場所がペットを受け入れているか確認しておくことが大切です。対応していない場合は、<ruby>親<rt>しん</rt></ruby><ruby>戚<rt>せき</rt></ruby>や知人の家など、別の<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>先を見つけておきましょう。"},
  {"category": "ペット防災", "title": "ペット用トイレの準備", "content": "ペットがトイレに困らないよう、ペット用トイレシーツや砂を多めに備蓄しておきましょう。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所では、ペットのトイレの場所が限定されるので、携帯用のトイレシーツなども用意しておくと便利です。"},
  {"category": "ペット防災", "title": "ペットのストレス対策", "content": "<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所は、ペットにとって大きなストレスの場所になります。好きなおもちゃやタオルなど、ペットが<ruby>安<rt>あん</rt></ruby><ruby>心<rt>しん</rt></ruby>できるものを防災バッグに入れておくと、ストレスが減ります。普段から<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>場所に近い場所で慣れさせておくのも良いですね。"},
  {"category": "ペット防災", "title": "複数のペットがいる場合", "content": "複数のペットを飼っている場合、全てのペットを移動させるのが大変になります。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>時に、それぞれのペットを<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>に移動させるためのルートや方法をあらかじめ決めておくことが大切です。ケージやキャリーバッグも複数個用意しておきましょう。"},
  {"category": "ペット防災", "title": "ペットの記録を保管しておこう", "content": "ペットの種類、年齢、特徴（色、模様、しるしなど）、予防接種の記録、医療履歴などを記録して、防災バッグに保管しておきましょう。迷子になった時や、<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所で医療ケアが必要な時に、この<ruby>情<rt>じょう</rt></ruby><ruby>報<rt>ほう</rt></ruby>が役に立ちます。"},
  {"category": "ペット防災", "title": "ペット用防災グッズのリスト", "content": "ペット用フード、トイレシーツ、医療用品、首輪、リード、ケージ、キャリーバッグ、おもちゃなど、必要なものをリストアップしておくと、紛失を防げます。定期的にチェックして、古いものを新しいものに換えましょう。"},
  {"category": "ペット防災", "title": "ペット用の飲料水も忘れずに", "content": "ペット用の飲料水も備蓄が必要です。人間の飲料水だけでなく、ペットが飲める水をあらかじめ用意しておくと<ruby>安<rt>あん</rt></ruby><ruby>心<rt>しん</rt></ruby>です。ペットの大きさに応じて、必要な水の量を計算して備蓄しましょう。"},
  {"category": "ペット防災", "title": "ペットとの<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>訓練", "content": "年に1回から2回、ペットと一緒に<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby><ruby>訓<rt>くん</rt></ruby><ruby>練<rt>れん</rt></ruby>をすることをお勧めします。ケージへの出し入れ、移動などを練習しておくと、実際の<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>時に落ち着いて行動できます。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>ルートをペットと一緒に歩いて確認しておくのも良いですね。"},
  {"category": "ペット防災", "title": "ペットの種類別の対策", "content": "犬と猫では防災対策が違います。犬は散歩が必要ですし、猫はトイレの位置が大事です。ウサギやハムスターなどの小動物、<ruby>爬<rt>は</rt></ruby><ruby>虫<rt>ちゅう</rt></ruby><ruby>類<rt>るい</rt></ruby>など、ペットの種類に応じた対策を考える必要があります。"}
];

async function updateFinal() {
  try {
    console.log('📊 最終更新開始...\n');

    await supabase.from('knowledge').delete().eq('category', '備蓄');
    await supabase.from('knowledge').insert(stockpileData);
    console.log(`✅ 備蓄：${stockpileData.length} 件を挿入しました！`);

    await supabase.from('knowledge').delete().eq('category', 'ペット防災');
    await supabase.from('knowledge').insert(petData);
    console.log(`✅ ペット防災：${petData.length} 件を挿入しました！`);

    console.log('\n🎉 すべてのjデータ（ruby形式）更新完了！');
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

updateFinal();
