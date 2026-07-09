const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const knowledgeData = [
  {"category": "火災", "title": "火が燃(も)えるために必要(ひつよう)な3つのもの", "content": "火が燃えるには3つのものが必要(ひつよう)です：①燃える物②酸素（さんそ）③熱です。この3つのうち1つでもなくなると火は消(け)えます。家の中で大切(たいせつ)なのは、燃える物を片付けること、湿度(しつど)を保つこと、火を作る物（ストーブやタバコなど）を気をつけることです。"},
  {"category": "火災", "title": "火災警報器(かさいけいほうき)が大切(たいせつ)", "content": "火災警報器は、煙（けむり）や熱を感（かん）じて音を出してくれます。特に夜、寝ている時に火が出ると、気づきにくいので警報器があると命が救われることが多いです。寝室（しんしつ）とリビングに付けて、定期的（ていきてき）に動くか確認（かくにん）しましょう。"},
  {"category": "火災", "title": "小さい火は初期(しょき)消火で消そう", "content": "小さい火は、消火器（しょうかき）で消したり、濡(ぬ)れたタオルや毛布をかぶせたりして、酸素を遮（さえぎ）ることで消すことができます。でも、火が天井(てんじょう)まで届（とど）いたり、煙がいっぱい出ていたりしたら、無理に消そうとしないで、すぐに逃げることが一番大切(たいせつ)です。"},
  {"category": "火災", "title": "火災の時の逃げ方", "content": "火が起きたら、大きな声を出して周りに知らせて、階段（かいだん）で逃げてください。絶対にエレベーターは使わないでください。火で熱くなってますます危ないです。煙がいっぱいの時は、腰をかがめて進み、濡れたタオルで口を覆（おお）って進みましょう。"},
  {"category": "火災", "title": "密閉(みっぺい)した部屋での火は危ない", "content": "小さな部屋やクローゼットで火が出ると、酸素がなくなって、火が急速（きゅうそく）に広がります。車の中も密閉された場所なので、タバコの始末（しまつ）や電気（でんき）のトラブルに注意(ちゅうい)してください。"},
  {"category": "火災", "title": "タバコの不始末（ふしまつ）が原因（げんいん）", "content": "火災の原因の中でも、タバコが原因のことがとても多いです。特に寝（ね）たばこ（寝ながらタバコを吸うこと）は非常に危ないです。タバコは必ず灰皿（はいざら）に落として、火がしっかり消えるまで見ておきましょう。小さい子がいるおうちでは、タバコを安全（あんぜん）な場所に保管（ほかん）してください。"},
  {"category": "火災", "title": "電気火災を防(ふせ)ぐ", "content": "古いコードや湿った場所では、電気（でんき）が漏（も）れて火になることがあります。タコ足配線（足りない分をいっぱい繋（つな）ぐこと）は避（さ）けて、コードが湿った場所に置かないようにしましょう。古い建物のおうちは、電気屋さんに点検（てんけん）してもらうといいですね。"},
  {"category": "火災", "title": "火事の時は119番に電話する", "content": "火が出たら、落ち着いて119番に電話してください。電話の時は、①おうちの場所（ばしょ）②火事の様子（どこから煙が出ているか）③何階か、を詳しく伝(つた)えましょう。電話の後も、消防車が来るまで逃げ続けてください。"},
  {"category": "火災", "title": "火災時にしてはいけないこと", "content": "火が出た時は、以下のことは絶対にしないでください：①物を取りに戻る、②慌(あわ)てて飛び降りる、③非常(ひじょう)ベルを押して動かなくなる。煙は毒（どく）を含（ふく）んでいて、建物は急速（きゅうそく）に危ないになります。命が一番大切です。"},
  {"category": "火災", "title": "火災を防ぐ工夫(くふう)", "content": "火災を防ぐために、①火災警報器を付ける、②電気配線を定期的に点検する、③家具（かぐ）や物の置き方を工夫して火が広がりにくくする、④燃える物を減らす、などをしましょう。全部できることばかりです。"}
];

async function updateData() {
  try {
    console.log('📊 火災データ更新開始...\n');
    const { error: deleteError } = await supabase.from('knowledge').delete().eq('category', '火災');
    if (deleteError) console.error('❌ 削除エラー:', deleteError);
    else console.log('✅ 既存データを削除しました');

    console.log('\n📚 新しい知識データを挿入中...');
    const { error: insertError } = await supabase.from('knowledge').insert(knowledgeData);
    if (insertError) console.error('❌ 挿入エラー:', insertError);
    else console.log(`✅ 知識データ ${knowledgeData.length} 件を挿入しました！`);

    console.log('📊 火災データ更新完了');
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

updateData();
