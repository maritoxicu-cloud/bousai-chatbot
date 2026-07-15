
データ更新時↓



1．新しい CSV を Supabaseの「shelters\_temp」 テーブルにインポート

2．下の SQL をSupabaseのSQL　Editorで実行

3．ペット対応情報を手動で追加



SQL

\-- Step 1: 新規データをテンポラリテーブルに一時的にインポート

\-- （CSVインポート後、shelters\_temp というテーブルに新データが入っている前提）



\-- Step 2: 差分データを既存テーブルにマージ（重複除去）

INSERT INTO shelters (

&#x20; NO, 共通ID, 施設・場所名, 住所, 洪水, 崖崩れ、土石流及び地滑り, 高潮, 地震, 津波, 

&#x20; 大規模な火事, 内水氾濫, 火山現象, 指定避難所との住所同一, 緯度, 経度, 備考

)

SELECT 

&#x20; t.NO, t.共通ID, t.施設・場所名, t.住所, t.洪水, t.崖崩れ、土石流及び地滑り, t.高潮, 

&#x20; t.地震, t.津波, t.大規模な火事, t.内水氾濫, t.火山現象, t.指定避難所との住所同一, 

&#x20; t.緯度, t.経度, t.備考

FROM shelters\_temp t

WHERE NOT EXISTS (

&#x20; SELECT 1 FROM shelters s

&#x20; WHERE s.施設・場所名 = t.施設・場所名

&#x20; AND s.住所 = t.住所

);



\-- Step 3: テンポラリテーブルを削除

DROP TABLE shelters\_temp;



\-- Step 4: 確認（挿入された件数を確認）

SELECT COUNT(\*) as "新規追加件数" FROM shelters;

