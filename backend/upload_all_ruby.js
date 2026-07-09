const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 火災
const fireData = [
  {"category": "火災", "title": "火が燃える際に必要な3つのもの", "content": "火が燃えるには3つのものが必要です：①燃える物②酸素③熱です。この3つのうち1つでもなくなると火は消えます。家の中で大切なのは、燃える物を片付けること、湿度を保つこと、火を作る物（ストーブやタバコなど）を気をつけることです。"},
  {"category": "火災", "title": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby><ruby>警<rt>けい</rt></ruby><ruby>報<rt>ほう</rt></ruby>器が大切", "content": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby><ruby>警<rt>けい</rt></ruby><ruby>報<rt>ほう</rt></ruby>器は、煙や熱を感じて音を出してくれます。特に夜、寝ている時に火が出ると、気づきにくいので<ruby>警<rt>けい</rt></ruby><ruby>報<rt>ほう</rt></ruby>器があると命が救われることが多いです。寝室とリビングに付けて、定期的に動くか確認しましょう。"},
  {"category": "火災", "title": "小さい火は初期消火で消そう", "content": "小さい火は、<ruby>消<rt>しょう</rt></ruby><ruby>火<rt>か</rt></ruby>器で消したり、濡れたタオルや毛布をかぶせたりして、酸素を遮ることで消すことができます。でも、火が天井まで届いたり、煙がいっぱい出ていたりしたら、無理に消そうとしないで、すぐに逃げることが一番大切です。"},
  {"category": "火災", "title": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby>の時の逃げ方", "content": "火が起きたら、大きな声を出して周りに知らせて、階段で逃げてください。絶対にエレベーターは使わないでください。火で熱くなってますます危ないです。煙がいっぱいの時は、腰をかがめて進み、濡れたタオルで口を覆って進みましょう。"},
  {"category": "火災", "title": "密閉した部屋での火は危ない", "content": "小さな部屋やクローゼットで火が出ると、酸素がなくなって、火が急速に広がります。車の中も密閉された場所なので、タバコの始末や電気のトラブルに注意してください。"},
  {"category": "火災", "title": "タバコの不始末が原因", "content": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby>の原因の中でも、タバコが原因のことがとても多いです。特に寝たばこ（寝ながらタバコを吸うこと）は非常に危ないです。タバコは必ず灰皿に落として、火がしっかり消えるまで見ておきましょう。小さい子がいるおうちでは、タバコを<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>な場所に保管してください。"},
  {"category": "火災", "title": "電気火災を防ぐ", "content": "古いコードや湿った場所では、電気が漏れて火になることがあります。タコ足配線は避けて、コードが湿った場所に置かないようにしましょう。古い建物のおうちは、電気屋さんに点検してもらうといいですね。"},
  {"category": "火災", "title": "<ruby>火<rt>か</rt></ruby>事の時は119番に電話する", "content": "火が出たら、落ち着いて119番に電話してください。電話の時は、①おうちの場所②火事の様子（どこから煙が出ているか）③何階か、を詳しく伝えましょう。電話の後も、消防車が来るまで逃げ続けてください。"},
  {"category": "火災", "title": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby>時にしてはいけないこと", "content": "火が出た時は、以下のことは絶対にしないでください：①物を取りに戻る、②慌てて飛び降りる、③非常ベルを押して動かなくなる。煙は毒を含んでいて、建物は急速に危ないになります。命が一番大切です。"},
  {"category": "火災", "title": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby>を防ぐ工夫", "content": "<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby>を防ぐために、①<ruby>火<rt>か</rt></ruby><ruby>災<rt>さい</rt></ruby><ruby>警<rt>けい</rt></ruby><ruby>報<rt>ほう</rt></ruby>器を付ける、②電気配線を定期的に点検する、③家具や物の置き方を工夫して火が広がりにくくする、④燃える物を減らす、などをしましょう。全部できることばかりです。"}
];

// 火山
const volcanoData = [
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>の<ruby>警<rt>けい</rt></ruby><ruby>戒<rt>かい</rt></ruby>レベルを知ろう", "content": "<ruby>気<rt>き</rt></ruby><ruby>象<rt>しょう</rt></ruby><ruby>庁<rt>ちょう</rt></ruby>は<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>の<ruby>危<rt>き</rt></ruby><ruby>険<rt>けん</rt></ruby>度を5段階で表します。レベル1が一番<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>で、レベル5が一番危ないです。自分が住んでいる地域の<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>がどのレベルなのか、普段からチェックしておくことが大切です。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby>砕流は非常に危ない", "content": "<ruby>火<rt>か</rt></ruby>砕流は、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰と高い温度の気体が一緒に、時速100km以上で山を下ります。これは非常に危ないので、<ruby>火<rt>か</rt></ruby>砕流の前に逃げることはほぼ不可能です。ハザードマップで危ない地域を確認し、警報が出たら直ちに逃げることが大切です。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰から身を守ろう", "content": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰は非常に細かい粒子で、吸い込むと肺を傷つけます。目に入ると炎症を起こすこともあります。マスクやゴーグルで身を守り、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰が積もった地域では食べ物や水が汚れる可能性があるので、備蓄が大切です。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>の<ruby>警<rt>けい</rt></ruby><ruby>報<rt>ほう</rt></ruby>を理解しよう", "content": "<ruby>気<rt>き</rt></ruby><ruby>象<rt>しょう</rt></ruby><ruby>庁<rt>ちょう</rt></ruby>が「噴火警報」を出したら、すぐに逃げてください。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>指示を待たずに移動することが大切です。「<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby><ruby>情<rt>じょう</rt></ruby><ruby>報<rt>ほう</rt></ruby>」では、小さな活動の可能性を伝えてくれます。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>ガスから身を守る", "content": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>ガスには、硫黄など非常に毒のあるガスが含まれています。吸い込むと呼吸ができなくなったり、意識を失ったりします。<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>が活動している地域では、風の向きに特に注意してください。"},
  {"category": "火山", "title": "降灰予報を確認しよう", "content": "<ruby>気<rt>き</rt></ruby><ruby>象<rt>しょう</rt></ruby><ruby>庁<rt>ちょう</rt></ruby>の「降灰<ruby>予<rt>よ</rt></ruby><ruby>報<rt>ほう</rt></ruby>」を見れば、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰がどこに降るか予測できます。スマホアプリで最新の<ruby>予<rt>よ</rt></ruby><ruby>報<rt>ほう</rt></ruby>を確認して、自分の地域に<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰が降るか、いつ降るかを知ることができます。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>地域での生活のリスク", "content": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>の周辺に住むことは、地震、<ruby>火<rt>か</rt></ruby>砕流、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>ガスなど、複数の<ruby>危<rt>き</rt></ruby><ruby>険<rt>けん</rt></ruby>と隣り合わせです。これらのリスクを正しく理解し、警報が出たら躊躇なく逃げる準備をしておくことが大切です。"},
  {"category": "火山", "title": "逃げるルートを事前に決めておこう", "content": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>地域の自治体では、<ruby>火<rt>か</rt></ruby>砕流などから逃げるルートと逃げる場所を指定しています。これを事前に確認して、家族で逃げ方を決めておくことが大切です。登山中に警報が出た時の下山ルートも決めておきましょう。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰への準備をしよう", "content": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰が降ると、空気中に舞い上がり、建物や車のエンジンを傷つけたり、水を汚したりします。マスク、ゴーグル、雨戸を閉じるための道具、飲料水の備蓄など、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>灰に備えた準備をしておきましょう。"},
  {"category": "火山", "title": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>と地震の関係", "content": "<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>が活動すると、その前後に地震が多く起きることがあります。<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>地域では、<ruby>火<rt>か</rt></ruby><ruby>山<rt>ざん</rt></ruby>だけでなく地震のリスクも考えて、防災準備をしておくことが大切です。"}
];

// 備蓄、ペット防災も同様に定義（省略・データ量が多いため）

async function updateAll() {
  const updates = [
    { category: '火災', data: fireData, name: '火災' },
    { category: '火山', data: volcanoData, name: '火山' }
  ];

  for (const { category, data, name } of updates) {
    try {
      console.log(`📊 ${name}データ（ruby形式）更新開始...`);
      await supabase.from('knowledge').delete().eq('category', category);
      await supabase.from('knowledge').insert(data);
      console.log(`✅ ${name}：${data.length} 件を挿入しました！\n`);
    } catch (error) {
      console.error(`❌ ${name}エラー:`, error);
    }
  }

  console.log('📊 火災・火山データ更新完了');
}

updateAll();
