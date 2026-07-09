const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const knowledgeData = [
  {"category": "火山", "title": "火山の警戒(けいかい)レベルを知ろう", "content": "気象庁（きしょうちょう）は火山の危険度を5段階で表します。レベル1が一番安全で、レベル5が一番危ないです。自分が住んでいる地域の火山がどのレベルなのか、普段からチェックしておくことが大切(たいせつ)です。"},
  {"category": "火山", "title": "火砕流(かさいりゅう)は非常に危ない", "content": "火砕流は、火山灰（かざんばい）と高い温度の気体が一緒に、時速100km以上で山を下ります。これは非常に危ないので、火砕流の前に逃げることはほぼ不可能(ふかのう)です。ハザードマップで危ない地域を確認(かくにん)し、警報が出たら直ちに逃げることが大切(たいせつ)です。"},
  {"category": "火山", "title": "火山灰(かざんばい)から身を守ろう", "content": "火山灰は非常に細かい粒子（りゅうし）で、吸い込むと肺（はい）を傷つけます。目に入ると炎症（えんしょう）を起こすこともあります。マスクやゴーグルで身を守り、火山灰が積もった地域では食べ物や水が汚（よご）れる可能性があるので、備蓄（びちく）が大切です。"},
  {"category": "火山", "title": "火山の警報（けいほう）を理解（りかい）しよう", "content": "気象庁が「噴火（ふんか）警報」を出したら、すぐに逃げてください。避難指示（さしじ）を待たずに移動（いどう）することが大切(たいせつ)です。「火山情報（じょうほう）」では、小さな活動の可能（かのう）性を伝えてくれます。"},
  {"category": "火山", "title": "火山ガスから身を守る", "content": "火山ガスには、硫黄（いおう）など非常に毒（どく）のあるガスが含まれています。吸い込むと呼吸（こきゅう）ができなくなったり、意識を失ったりします。火山が活動（かつどう）している地域では、風の向き（ほうこう）に特に注意(ちゅうい)してください。"},
  {"category": "火山", "title": "降灰予報（こうはいよほう）を確認(かくにん)しよう", "content": "気象庁の「降灰予報」を見れば、火山灰がどこに降るか予測（よそく）できます。スマホアプリで最新の予報を確認して、自分の地域に火山灰が降るか、いつ降るかを知ることができます。"},
  {"category": "火山", "title": "火山地域での生活のリスク", "content": "火山の周辺に住むことは、地震、火砕流、火山灰、火山ガスなど、複数の危険（きけん）と隣り合わせです。これらのリスクを正しく理解（りかい）し、警報が出たら躊躇（ちゅうちょ）なく逃げる準備をしておくことが大切(たいせつ)です。"},
  {"category": "火山", "title": "逃げるルートを事前に決めておこう", "content": "火山地域の自治体（じちたい）では、火砕流などから逃げるルートと逃げる場所を指定（してい）しています。これを事前に確認して、家族で逃げ方を決めておくことが大切(たいせつ)です。登山中に警報が出た時の下山（げざん）ルートも決めておきましょう。"},
  {"category": "火山", "title": "火山灰への準備をしよう", "content": "火山灰が降ると、空気中に舞（ま）い上がり、建物（たてもの）や車のエンジンを傷つけたり、水を汚したりします。マスク、ゴーグル、雨戸を閉じるための道具、飲料水（いんりょうすい）の備蓄など、火山灰に備えた準備（じゅんび）をしておきましょう。"},
  {"category": "火山", "title": "火山と地震の関係（かんけい）", "content": "火山が活動（かつどう）すると、その前後に地震（じしん）が多く起きることがあります。火山地域では、火山だけでなく地震のリスクも考えて、防災（ぼうさい）準備をしておくことが大切(たいせつ)です。"}
];

async function updateData() {
  try {
    console.log('📊 火山データ更新開始...\n');
    const { error: deleteError } = await supabase.from('knowledge').delete().eq('category', '火山');
    if (deleteError) console.error('❌ 削除エラー:', deleteError);
    else console.log('✅ 既存データを削除しました');

    console.log('\n📚 新しい知識データを挿入中...');
    const { error: insertError } = await supabase.from('knowledge').insert(knowledgeData);
    if (insertError) console.error('❌ 挿入エラー:', insertError);
    else console.log(`✅ 知識データ ${knowledgeData.length} 件を挿入しました！`);

    console.log('📊 火山データ更新完了');
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

updateData();
