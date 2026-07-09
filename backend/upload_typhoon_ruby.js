const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const knowledgeData = [
  {"category": "台風", "title": "台風が多く来る季節", "content": "台風は1年中来ることもありますが、特に6月から11月にたくさん来ます。特に9月が一番危ない時です。地域によって台風の影響が違うので、自分の住んでいる場所の<ruby>情<rt>じょう</rt></ruby><ruby>報<rt>ほう</rt></ruby>をチェックしておくことが大切です。"},
  {"category": "台風", "title": "強さを表す風速という言い方", "content": "台風の強さは「最大風速」という数字で表します。風速33m以上を「強い台風」、54m以上を「非常に強い台風」と言います。風が強いほど、物が飛ばされたり、家が壊れたりする<ruby>危<rt>き</rt></ruby><ruby>険<rt>けん</rt></ruby>が高まります。ニュースで台風の強さが<ruby>発<rt>はっ</rt></ruby><ruby>表<rt>ぴょう</rt></ruby>されたら、その数字がどのくらい危ないのか理解することが大切です。"},
  {"category": "台風", "title": "台風の進路は毎日変わる理由", "content": "台風の進路（どっちに進むか）は、水の温度や空気の圧力で変わります。だから毎日、新しい情報で進路が変わります。最新の進路<ruby>予<rt>よ</rt></ruby><ruby>報<rt>ほう</rt></ruby>を確認して、どこに来そうなのか知ることが大切です。"},
  {"category": "台風", "title": "台風が来ると分かったら早めに準備", "content": "台風が来ると分かったら、到着を待つのではなく、すぐに準備を始めてください。家の周りの物を片付けたり、雨戸を閉めたり、懐中電灯や食べ物を用意したり、できることはいっぱいあります。ぎりぎりになると危ない目に遭うかもしれません。"},
  {"category": "台風", "title": "飛ぶ物への対策が重要", "content": "強い風が吹くと、庭の鉢植えやゴミ箱、ハンガーなど、軽い物がいっぱい飛びます。これらが他の家の窓に当たったり、人に当たったりするとけがになります。台風が来る前に、庭やベランダをきれいに片付けて、飛ぶ可能性のあるものを全て片付けましょう。"},
  {"category": "台風", "title": "停電に備える方法", "content": "台風で強い風が吹くと、電柱が倒れたり、電線が壊れたりして停電になります。停電になった時に困らないよう、懐中電灯と電池をいっぱい用意しておきましょう。手回し式の懐中電灯も便利です。冷蔵庫の中身が温まらないよう、停電中は開け閉めを控えましょう。"},
  {"category": "台風", "title": "大雨にも注意が必要", "content": "台風は風だけでなく、大雨をもたらします。気象庁が「大雨注意報」を出したら、土砂が崩れたり、川が溢れたりすることに注意してください。ハザードマップで自分の家の周りの<ruby>リ<rt>り</rt></ruby><ruby>ス<rt>す</rt></ruby><ruby>ク<rt>く</rt></ruby>を確認しておきましょう。"},
  {"category": "台風", "title": "水を用意しておこう", "content": "台風で水道が止まることもあります。1人1日3リットルの水が必要とされているので、3日分なら9リットル、1週間分なら21リットルを用意しておくといいです。水を買うのが難しければ、風呂のお湯を張っておいて、トイレに使うこともできます。"},
  {"category": "台風", "title": "台風の時は外に出ないようにしよう", "content": "台風が接近している時に、買い物や移動のために外に出るのは非常に危ないです。強い風に飛ばされたり、雨で見えなくなったり、飛んでくる物に当たったりする可能性があります。台風が去るまでは、できるだけ家にいて、必要のない外出は控えましょう。"},
  {"category": "台風", "title": "逃げる場所を事前に確認しよう", "content": "台風で浸水や土砂が崩れる<ruby>危<rt>き</rt></ruby><ruby>険<rt>けん</rt></ruby>がある地域の人は、事前に逃げる場所を確認しておきましょう。逃げるように言われたら、すぐに動けるよう、荷物をあらかじめ用意し、どうやって逃げるかを決めておくことが大切です。"},
  {"category": "台風", "title": "天気予報アプリを活用しよう", "content": "気象庁の「台風情報」や市から出される「逃げる指示」などを、常にチェックしましょう。スマホアプリやメール配信に登録しておくと、最新の情報がすぐに届きます。情報を正しく入手することが、安全な判断につながります。"},
  {"category": "台風", "title": "強い風で家が壊れる仕組み", "content": "台風の強い風で、屋根の一部や看板が飛ぶことがあります。風の力で建物全体が動いて、窓が割れたり、雨が入ってきたりすることもあります。古い建物は特に危ないので、事前に確認しておくといいですね。"},
  {"category": "台風", "title": "車での移動はやめましょう", "content": "台風が接近している時に車で移動するのは非常に危ないです。強い風で車が横転したり、大雨で見えなくなったり、冠水した道に入ったりする<ruby>危<rt>き</rt></ruby><ruby>険<rt>けん</rt></ruby>があります。台風警報が出ている時は、できるだけ車を使わず、移動を控えましょう。"},
  {"category": "台風", "title": "台風が過ぎた後も危ない", "content": "台風が過ぎた後も、倒れた木や電柱、壊れた建物などが危ない状態のままです。また、道路が冠水していたり、土砂が崩れていたりすることもあります。台風が去ったからといって、すぐに外を歩き回るのは危ないです。市からの指示を待ってから動きましょう。"},
  {"category": "台風", "title": "ペットの安全も考えよう", "content": "台風が来る時は、ペットの安全も考える必要があります。屋外飼いのペットは室内に入れ、逃げる時はペットも一緒に連れていけるよう準備をしましょう。ペット用の食べ物や医療グッズも用意しておくといいですね。"}
];

async function updateData() {
  try {
    console.log('📊 台風データ（ruby形式）更新開始...\n');
    const { error: deleteError } = await supabase.from('knowledge').delete().eq('category', '台風');
    if (deleteError) console.error('❌ 削除エラー:', deleteError);
    else console.log('✅ 既存データを削除しました');

    console.log('\n📚 ruby形式のデータを挿入中...');
    const { error: insertError } = await supabase.from('knowledge').insert(knowledgeData);
    if (insertError) console.error('❌ 挿入エラー:', insertError);
    else console.log(`✅ 知識データ ${knowledgeData.length} 件を挿入しました！`);

    console.log('📊 台風データ（ruby形式）更新完了');
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

updateData();
