const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xaqhiexouefcwphjeaao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// （ふりがな）形式を <ruby> タグに変換する関数
function convertToRubyFormat(text) {
  return text.replace(/([^\s()]+)\(([あ-ん]+)\)/g, (match, kanji, ruby) => {
    return `<ruby>${kanji}<rt>${ruby}</rt></ruby>`;
  });
}

// 洪水・台風 知識データ 14項目（ruby形式）
const knowledgeData = [
  {"category": "洪水・台風", "title": "<ruby>警<rt>けい</rt></ruby><ruby>戒<rt>かい</rt></ruby>レベル4は全員逃げる！", "content": "市役所から<ruby>警<rt>けい</rt></ruby><ruby>戒<rt>かい</rt></ruby>レベル4が出たら、危ない場所にいる人は全員、すぐに逃げてください。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>場所に行きましょう。レベル5はもう<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>が起きている時なので、レベル4のうちに逃げることが大切です。自分と家族の命を守ることが一番です。"},
  {"category": "洪水・台風", "title": "お年寄りと小さい子は早めに逃げる", "content": "おじいさんやおばあさん、小さい赤ちゃんがいるおうちは、<ruby>警<rt>けい</rt></ruby><ruby>戒<rt>かい</rt></ruby>レベル3が出たら逃げ始めてください。逃げるのに時間がかかるからです。周りが明るく<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>な時に逃げましょう。近所の人にも声をかけて、一緒に逃げるといいですね。"},
  {"category": "洪水・台風", "title": "外は危ない時は2階に逃げよう", "content": "外が水でいっぱいになっていて逃げるのが危ない時は、無理に外に出ず、おうちの2階以上に逃げてください。これを「<ruby>垂<rt>すい</rt></ruby><ruby>直<rt>ちょく</rt></ruby><ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>」といいます。ただし、がけの近くなど危ない場所では、がけから離れた部屋に移動してください。"},
  {"category": "洪水・台風", "title": "スマホで危ない場所を<ruby>確<rt>かく</rt></ruby><ruby>認<rt>にん</rt></ruby>しよう", "content": "<ruby>気<rt>き</rt></ruby><ruby>象<rt>しょう</rt></ruby><ruby>庁<rt>ちょう</rt></ruby>の「キキクル」というアプリをスマホで見ると、今いる場所がどのくらい危いかが色で分かります。赤い色ほど危ないということです。ニュースを見たり、アプリで<ruby>情<rt>じょう</rt></ruby><ruby>報<rt>ほう</rt></ruby>をチェックして、空が変わってないか見ておきましょう。"},
  {"category": "洪水・台風", "title": "逃げる場所は学校だけじゃない", "content": "逃げる場所は学校や公民館だけではありません。<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>な場所にいるおじさんやおばさんのおうちや、ホテルなど、色々な場所に逃げることができます。これを「<ruby>分<rt>ぶん</rt></ruby><ruby>散<rt>さん</rt></ruby><ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>」といいます。自分に合った逃げ場を見つけておくといいですね。"},
  {"category": "洪水・台風", "title": "道路の低い場所は危ない", "content": "線路の下をくぐるような低い道は、雨水がどんどん流れ込んで非常に危ないです。もし車で走っている時にこんな場所に入ると、車が動かなくなって逃げられなくなることもあります。大雨の日は、地図で<ruby>確<rt>かく</rt></ruby><ruby>認<rt>にん</rt></ruby>して、低い道を通らないようにしましょう。"},
  {"category": "洪水・台風", "title": "5日前から<ruby>気<rt>き</rt></ruby><ruby>象<rt>しょう</rt></ruby><ruby>庁<rt>ちょう</rt></ruby>が教えてくれる", "content": "<ruby>気<rt>き</rt></ruby><ruby>象<rt>しょう</rt></ruby><ruby>庁<rt>ちょう</rt></ruby>は、大きな台風や大雨が来ることを5日前から教えてくれます。これを知れば、食べ物を用意したり、庭の物を片付けたり、逃げる準備ができます。急いでしなくていいので、準備がしやすいです。"},
  {"category": "洪水・台風", "title": "水がどのくらい来るか調べておこう", "content": "ハザードマップというのを見ると、自分のおうちに水がどのくらい来るか分かります。例えば「3メートル」と書いてあれば、1階は全部水の中になってしまいます。もし深い水が来そうなら、早めに逃げましょう。"},
  {"category": "洪水・台風", "title": "<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>の種類で逃げる場所が違う", "content": "<ruby>洪<rt>こう</rt></ruby><ruby>水<rt>すい</rt></ruby>が来そうな時は、水が来ない高い場所に逃げます。地震の時は、丈夫な建物に逃げます。逃げる場所が違うので、市から教えてもらった「<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>場所」がどの<ruby>災<rt>さい</rt></ruby><ruby>害<rt>がい</rt></ruby>に対応しているか調べておくといいですね。"},
  {"category": "洪水・台風", "title": "川の水の高さをチェックしよう", "content": "川が<ruby>氾<rt>はん</rt></ruby><ruby>濫<rt>らん</rt></ruby>（水が溢れる）する前に、水の高さを調べることができます。市から配信されるメールなどで、最新の<ruby>情<rt>じょう</rt></ruby><ruby>報<rt>ほう</rt></ruby>がすぐに分かります。こまめにチェックして、逃げるタイミング（時間）を考えておきましょう。"},
  {"category": "洪水・台風", "title": "家に残るか逃げるか判断しよう", "content": "ハザードマップと、自分のおうちの様子を見て、外に逃げるか、おうちの上に逃げるかを決めます。2階が水より高くて、水と食べ物がたくさんあれば、おうちにいてもいい場合もあります。でも、おうちが壊れそうなら逃げましょう。"},
  {"category": "洪水・台風", "title": "水だけでなく強い風にも気をつけよう", "content": "台風の時は、水だけじゃなくて強い風も危ないです。<ruby>避<rt>ひ</rt></ruby><ruby>難<rt>なん</rt></ruby>所でテントを使うと、風で飛ばされてけがをすることもあります。外で飼っているペットも、強い風や水で流されないように、早めに家の中に入れてあげてください。"},
  {"category": "洪水・台風", "title": "自分に合った逃げ場を見つけておこう", "content": "逃げるというのは「危ないから<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby>な場所に移動する」ということです。学校だけが逃げ場ではありません。<ruby>親<rt>しん</rt></ruby><ruby>戚<rt>せき</rt></ruby>のおうちや、ホテルなど、自分に合った逃げ場を見つけておくといいですね。"},
  {"category": "洪水・台風", "title": "水が来ている時はトイレに注意", "content": "<ruby>洪<rt>こう</rt></ruby><ruby>水<rt>すい</rt></ruby>で周りが水でいっぱいになっている時は、トイレを流してはいけません。下の方の下水道が故障していたり、汚い水が逆流したりするからです。普段から携帯トイレを用意しておくといいですね。"}
];

async function updateData() {
  try {
    console.log('📊 洪水データ（ruby形式）更新開始...\n');

    const { error: deleteError } = await supabase
      .from('knowledge')
      .delete()
      .eq('category', '洪水・台風');

    if (deleteError) {
      console.error('❌ 削除エラー:', deleteError);
    } else {
      console.log('✅ 既存データを削除しました');
    }

    console.log('\n📚 ruby形式の知識データを挿入中...');
    const { error: insertError } = await supabase
      .from('knowledge')
      .insert(knowledgeData);

    if (insertError) {
      console.error('❌ 挿入エラー:', insertError);
    } else {
      console.log(`✅ 知識データ ${knowledgeData.length} 件を Supabase に挿入しました！`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 洪水データ（ruby形式）更新完了');
    console.log(`  知識: ${knowledgeData.length} 項目`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

updateData();
