from supabase import create_client, Client
import json

# Supabase 接続設定
SUPABASE_URL = "https://xaqhiexouefcwphjeaao.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcWhpZXhvdWVmY3dwaGplYWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTQ2ODcsImV4cCI6MjA5ODE5MDY4N30.vyOzAvKodoLl5Pcja2a4uKc_aVSVuh1Z-ucqVQ-R6bQ"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# テスト用の防災知識データ（5個）
knowledge_data = [
    {
        "category": "地震",
        "title": "家具の固定でケガを防ぐ",
        "content": "地震でケガをする人の約3割から5割は、家具が倒れたり物が落ちたりしたことが原因です。タンスや棚はL型金具などで壁の柱にしっかり固定しましょう。",
        "tips": "ネジ留めが最も効果が高い"
    },
    {
        "category": "洪水",
        "title": "警戒レベル4で全員避難",
        "content": "市区町村から警戒レベル4「避難指示」が出されたら、危険な場所にいる人は全員、速やかに避難場所へ移動してください。",
        "tips": "レベル5はすでに災害が発生している状況"
    },
    {
        "category": "火災",
        "title": "住宅用火災警報器の設置",
        "content": "火災をいち早く知らせてくれる「住宅用火災警報器」を必ず設置しましょう。火事の死因で最も多いのは、煙に気づくのが遅れた「逃げ遅れ」です。",
        "tips": "警報器を付けていれば、寝ている間も大きな音で知らせてくれる"
    },
    {
        "category": "火山",
        "title": "事前の避難計画が重要",
        "content": "火山の噴火で発生する「大きな噴石」や「火砕流」は、噴火とほぼ同時にやってくるため、発生してから逃げる時間はほとんどありません。",
        "tips": "噴火予報や警報が出た段階で、あらかじめ決めていた安全な避難場所へ早めに移動"
    },
    {
        "category": "備蓄",
        "title": "命を支える水の量",
        "content": "人間が生きるために必要な飲料水は、1人1日3リットルが目安です。大人2人が1週間過ごすなら、2リットルのペットボトルが24本必要になります。",
        "tips": "水は飲むだけでなく、手を洗ったり、簡易トイレに使ったりと多用途"
    }
]

# テスト用のクイズデータ（5問）
quiz_data = [
    {
        "category": "地震",
        "question": "地震のケガで「家具の転倒や落下」が原因の人はどれくらい？",
        "options": ["約1割", "約3割から5割", "ほぼ全員"],
        "correct": 1,
        "difficulty": "medium"
    },
    {
        "category": "洪水",
        "question": "警戒レベル「4」が出たらどうする？",
        "options": ["準備を始める", "全員避難する", "様子を見る"],
        "correct": 1,
        "difficulty": "easy"
    },
    {
        "category": "火災",
        "question": "住宅火災で亡くなる原因として一番多いのは？",
        "options": ["ストーブ", "コンロ", "たばこ"],
        "correct": 2,
        "difficulty": "medium"
    },
    {
        "category": "火山",
        "question": "火山の恐ろしい現象で、噴火とほぼ同時にやってくるものはどれ？",
        "options": ["溶岩流", "大きな噴石や火砕流", "火山灰"],
        "correct": 1,
        "difficulty": "hard"
    },
    {
        "category": "備蓄",
        "question": "人間1人が1日に必要な水の量は？",
        "options": ["1リットル", "3リットル", "10リットル"],
        "correct": 1,
        "difficulty": "easy"
    }
]

# Supabase に投入
print("防災知識を投入中...")
for item in knowledge_data:
    supabase.table("knowledge").insert(item).execute()
print(f"✅ {len(knowledge_data)} 件の防災知識を投入しました")

print("クイズを投入中...")
for item in quiz_data:
    supabase.table("quizzes").insert(item).execute()
print(f"✅ {len(quiz_data)} 件のクイズを投入しました")

print("\n🎉 完了！")