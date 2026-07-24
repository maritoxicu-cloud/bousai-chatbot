import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBot.css';

const API_BASE_URL = 'https://bousai-chatbot-production.up.railway.app';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'こんにちは！防災について何でも聞いてね。クイズ、知識、避難所の検索ができるよ。', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentKnowledge, setCurrentKnowledge] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [mode, setMode] = useState('main'); // main, category_select, quiz, knowledge
  const [selectedType, setSelectedType] = useState(null); // quiz or knowledge
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    let id = localStorage.getItem('quiz_session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('quiz_session_id', id);
    }
    return id;
  });
  const [userScore, setUserScore] = useState({ total: 0, correct: 0 });
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [currentShelterType, setCurrentShelterType] = useState(null);

  // スプラッシュスクリーン表示・自動進む（毎回表示）
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000); // 5秒後に進む
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const handleResetScore = () => {
    // スコアをリセット
    setUserScore({ total: 0, correct: 0 });
    // 新しいセッション ID を生成
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem('quiz_session_id', newSessionId);
    // リセット完了メッセージを表示
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: 'スコアがリセットされました。新しいセッションを開始しています。',
      sender: 'bot'
    }]);
  };

  // (ふりがな) を <ruby> に変換する関数
  // 『』が含まれる場合はテキストのまま、含まれない場合はrubyタグに変換
  const convertFuriganaToRuby = (text) => {
    // 『』が含まれる場合は（ふりがな）形式のまま返す（全角かぎかっこを確認）
    if (text.includes('「') || text.includes('」')) {
      return text;
    }

    // 改行で分割して、行ごとに処理してから復元
    const lines = text.split('\n');
    let globalKey = 0;

    const processLine = (line) => {
      let result = [];
      let i = 0;

      while (i < line.length) {
        const openParen = line.indexOf('(', i);

        if (openParen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const closeParen = line.indexOf(')', openParen);
        if (closeParen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const ruby = line.substring(openParen + 1, closeParen);
        let j = openParen - 1;
        while (j >= 0 && /[一-鿿]/.test(line[j])) {
          j--;
        }
        j++;

        const kanji = line.substring(j, openParen);

        if (kanji && /^[ぁ-ん]+$/.test(ruby)) {
          const beforeText = line.substring(i, j);
          if (beforeText) result.push(beforeText);
          result.push(
            <ruby key={`ruby-${globalKey++}`}>{kanji}<rt>{ruby}</rt></ruby>
          );
          i = closeParen + 1;
        } else {
          result.push(line.substring(i, openParen + 1));
          i = openParen + 1;
        }
      }
      return result;
    };

    const allResults = [];
    lines.forEach((line, idx) => {
      allResults.push(...processLine(line));
      if (idx < lines.length - 1) {
        allResults.push(<br key={`br-${globalKey++}`} />);
      }
    });

    return allResults.length > 0 ? allResults : text;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const quizCategories = ['地震', '洪水', '台風', '火災', '火山', '備蓄', 'その他'];
  const knowledgeCategories = ['地震', '洪水', '台風', '火災', '火山', '備蓄', 'ペット防災', 'その他'];
  const categoryEmojis = {
    '地震': '🌍',
    '洪水': '💧',
    '台風': '🌪️',
    '火災': '🔥',
    '火山': '🌋',
    '備蓄': '📦',
    'ペット防災': '🐾',
    'その他': '❓'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ページロード時に SessionStorage から避難所情報と防災ラボ情報を復元
  useEffect(() => {
    const savedShelterState = sessionStorage.getItem('shelterState');
    if (savedShelterState) {
      try {
        const state = JSON.parse(savedShelterState);
        setMessages(prev => [...prev, state.message]);
        if (state.currentPosition) {
          setCurrentPosition(state.currentPosition);
        }
        sessionStorage.removeItem('shelterState');
      } catch (error) {
        console.error('Error restoring shelter state:', error);
      }
    }

    const savedBousaiLabState = sessionStorage.getItem('bousaiLabState');
    if (savedBousaiLabState) {
      try {
        const state = JSON.parse(savedBousaiLabState);
        setMessages(prev => [...prev, state.message]);
        sessionStorage.removeItem('bousaiLabState');
      } catch (error) {
        console.error('Error restoring bousai lab state:', error);
      }
    }
  }, []);

  const getRandomItem = (data) => {
    return data[Math.floor(Math.random() * data.length)];
  };

  const displayQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentKnowledge(null);
    setAnswered(false);
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: `【${quiz.category}クイズ】\n\n${quiz.question}`,
      sender: 'bot',
      quiz: quiz,
      processAllContent: true
    }]);
  };

  // URL をリンク化する関数
  const convertUrlsToLinks = (text) => {
    // URL パターンを検出して <a> タグに変換
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);
    let globalKey = 0;

    return parts.flatMap((part, idx) => {
      if (!part) return [];

      if (part.match(urlPattern)) {
        // URL をリンク化
        return (
          <a
            key={`url-${globalKey++}`}
            href={part}
            target="_self"
            style={{
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {part}
          </a>
        );
      }

      // テキスト部分を改行で分割して <br> を挿入
      const lines = part.split('\n');
      return lines.flatMap((line, lineIdx) => {
        if (!line && lineIdx < lines.length - 1) {
          // 空の行の場合、<br> だけ返す
          return <br key={`br-${globalKey++}`} />;
        }

        const elements = [line];
        if (lineIdx < lines.length - 1) {
          elements.push(<br key={`br-${globalKey++}`} />);
        }
        return elements;
      });
    });
  };

  // contentのふりがなをrubyタグに変換（『』チェックなし、改行対応）
  const processContentRuby = (text) => {
    const lines = text.split('\n');
    let globalKey = 0;

    const processLine = (line) => {
      let result = [];
      let i = 0;

      while (i < line.length) {
        const openParen = line.indexOf('(', i);
        if (openParen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const closeParen = line.indexOf(')', openParen);
        if (closeParen === -1) {
          const remaining = line.substring(i);
          if (remaining) result.push(remaining);
          break;
        }

        const ruby = line.substring(openParen + 1, closeParen);
        let j = openParen - 1;
        while (j >= 0 && /[一-鿿]/.test(line[j])) {
          j--;
        }
        j++;

        const kanji = line.substring(j, openParen);

        if (kanji && /^[ぁ-ん]+$/.test(ruby)) {
          const beforeText = line.substring(i, j);
          if (beforeText) result.push(beforeText);
          result.push(
            <ruby key={`content-${globalKey++}`}>{kanji}<rt>{ruby}</rt></ruby>
          );
          i = closeParen + 1;
        } else {
          result.push(line.substring(i, openParen + 1));
          i = openParen + 1;
        }
      }
      return result;
    };

    const allResults = [];
    lines.forEach((line, idx) => {
      allResults.push(...processLine(line));
      if (idx < lines.length - 1) {
        allResults.push(<br key={`br-${globalKey++}`} />);
      }
    });

    return allResults.length > 0 ? allResults : text;
  };

  const displayKnowledge = (knowledge) => {
    setCurrentQuiz(null);
    setCurrentKnowledge(knowledge);
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: `【${knowledge.category}】\n\n━━━━━━━━━━━━\n${knowledge.title}\n━━━━━━━━━━━━\n\n${knowledge.content}`,
      sender: 'bot',
      processAllContent: true  // contentのみrubyタグ処理フラグ
    }]);
    setShowNavigation(true);
  };

  const handleCategorySelect = async (category) => {
    setCurrentCategory(category);
    setLoading(true);
    setMode('quiz');

    try {
      if (selectedType === 'quiz') {
        const response = await axios.get(`${API_BASE_URL}/api/quizzes?category=${category}`);
        if (response.data.data.length > 0) {
          const quiz = getRandomItem(response.data.data);
          displayQuiz(quiz);
        }
      } else if (selectedType === 'knowledge') {
        setMode('knowledge');
        const response = await axios.get(`${API_BASE_URL}/api/knowledge?category=${category}`);
        if (response.data.data.length > 0) {
          const knowledge = getRandomItem(response.data.data);
          displayKnowledge(knowledge);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'エラーが発生しました。',
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNextSameCategory = async () => {
    setLoading(true);
    setAnswered(false);

    try {
      if (selectedType === 'quiz') {
        const response = await axios.get(`${API_BASE_URL}/api/quizzes?category=${currentCategory}`);
        if (response.data.data.length > 0) {
          const quiz = getRandomItem(response.data.data);
          displayQuiz(quiz);
        }
      } else if (selectedType === 'knowledge') {
        const response = await axios.get(`${API_BASE_URL}/api/knowledge?category=${currentCategory}`);
        if (response.data.data.length > 0) {
          const knowledge = getRandomItem(response.data.data);
          displayKnowledge(knowledge);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCategory = () => {
    setCurrentQuiz(null);
    setCurrentKnowledge(null);
    setShowNavigation(false);
    setMode('category_select');
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: selectedType === 'quiz' ? 'クイズのジャンルを選んでください！' : '防災知識のジャンルを選んでください！',
      sender: 'bot'
    }]);
  };

  const handleQuizSelect = () => {
    setSelectedType('quiz');
    setMode('category_select');
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: 'クイズのジャンルを選んでください！',
      sender: 'bot'
    }]);
  };

  const handleKnowledgeSelect = () => {
    setSelectedType('knowledge');
    setMode('category_select');
    setShowNavigation(false);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: '防災知識のジャンルを選んでください！',
      sender: 'bot'
    }]);
  };

  // キーワードからカテゴリを検出して知識を表示
  const handleKnowledgeByKeyword = async (keyword) => {
    const categoryMap = {
      '地震': '地震',
      '洪水': '洪水',
      '水害': '洪水',
      '台風': '台風',
      '火災': '火災',
      '火山': '火山',
      '備蓄': '備蓄',
      'ペット': 'ペット災害'
    };

    let detectedCategory = null;
    for (const [key, category] of Object.entries(categoryMap)) {
      if (keyword.includes(key)) {
        detectedCategory = category;
        break;
      }
    }

    if (detectedCategory) {
      setCurrentCategory(detectedCategory);
      setSelectedType('knowledge');
      setMode('knowledge');
      setShowNavigation(false);
      setLoading(true);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/knowledge`, {
          params: { category: detectedCategory }
        });

        if (response.data.data && response.data.data.length > 0) {
          setCurrentKnowledge(response.data.data);
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: `「${detectedCategory}」についての知識を表示します！`,
            sender: 'bot'
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: `申し訳ありません。「${detectedCategory}」の知識が見つかりませんでした。`,
            sender: 'bot'
          }]);
        }
      } catch (error) {
        console.error('Error fetching knowledge:', error);
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: '知識の取得に失敗しました。もう一度お試しください。',
          sender: 'bot'
        }]);
      }
    } else {
      handleKnowledgeSelect();
    }
    setLoading(false);
  };

  const handleShelterSelect = async () => {
    setCurrentQuiz(null);
    setCurrentKnowledge(null);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: '現在地を取得中...',
      sender: 'bot'
    }]);

    try {
      setLoading(true);

      // Geolocation API で現在地を取得
      if (!navigator.geolocation) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: 'お使いのブラウザは位置情報に対応していません。',
          sender: 'bot'
        }]);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // バックエンドに位置情報を送信
            const response = await axios.post(`${API_BASE_URL}/api/shelters/nearby`, {
              latitude,
              longitude,
              max_distance: 5,  // 5km以内
              limit: 10  // 最大10件
            });

            if (response.data.data.length > 0) {
              // 避難所リストをまとめて表示
              const shelterType = response.data.data[0]?.shelter_type || '緊急';
              const shelterTypeLabel = shelterType === '緊急' ? '緊急避難所' : '指定避難所';
              let shelterList = '📍 現在地から ' + response.data.count + ' 件の' + shelterTypeLabel + 'が見つかりました!\n\n';

              response.data.data.forEach((shelter, idx) => {
                let eq, ts, fl, ht, ls, pet;
                console.log('Shelter type:', shelter.shelter_type, 'Shelter name:', shelter['施設・場所名']);
                if (shelter.shelter_type === '指定') {
                  console.log('⭐ Designated shelter - setting all to ○ and pet to ？');
                  eq = ts = fl = ht = ls = '○';
                  pet = '？';
                } else {
                  eq = shelter['地震'] ? '○' : '❌';
                  ts = shelter['津波'] ? '○' : '❌';
                  fl = shelter['洪水'] ? '○' : '❌';
                  ht = shelter['高潮'] ? '○' : '❌';
                  ls = shelter['崖崩れ、土石流及び地滑り'] ? '○' : '❌';
                  pet = shelter['ペット対応'] ? '○' : '❌';
                }
                const mapsUrl = 'https://www.google.com/maps/dir/' + latitude + ',' + longitude + '/' + shelter['緯度'] + ',' + shelter['経度'];

                const typeLabel = shelter.shelter_type === '緊急' ? '' : ' （指定避難所）';

                shelterList += '【' + (idx + 1) + '】【距離:' + shelter.distance + 'km】\n';
                shelterList += shelter['施設・場所名'] + typeLabel + ' ℹ️\n';
                shelterList += shelter['住所'] + '\n';
                // 指定避難所の場合は災害対応情報を表示しない
                if (shelter.shelter_type !== '指定') {
                  shelterList += '対応:地震' + eq + ' 津波' + ts + ' 洪水' + fl + ' 高潮' + ht + ' 土砂' + ls + ' ペット' + pet + '\n';
                }
                shelterList += '地図：\n' + mapsUrl + '\n\n';
              });

              // 注意書きと出典情報を追加
              shelterList += '\n【注意】\n';
              shelterList += '・ペット対応情報は随時更新中です。対応の有無は各施設に直接ご確認ください。\n';
              shelterList += '・避難所情報は変更される可能性があります。最新情報は各施設にお問い合わせください。\n';
              shelterList += '【出典】国土地理院（hinanmap.gsi.go.jp）\n';

              const shelterMessage = {
                id: Date.now(),
                text: shelterList,
                sender: 'bot',
                isUrl: true,
                isShelterInfo: true
              };

              // SessionStorage に避難所情報を保存
              sessionStorage.setItem('shelterState', JSON.stringify({
                message: shelterMessage,
                currentPosition: { latitude, longitude }
              }));

              setMessages(prev => [...prev, shelterMessage]);
            } else {
              setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: '申し訳ありません。近くに避難所が見つかりませんでした。',
                sender: 'bot'
              }]);
            }
          } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, {
              id: prev.length + 1,
              text: '避難所の検索に失敗しました。',
              sender: 'bot'
            }]);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          // 位置情報取得エラー
          console.error('Geolocation Error:', error);
          let errorMessage = '位置情報を取得できませんでした。';

          if (error.code === 1) {
            errorMessage = 'ブラウザの位置情報許可が拒否されています。設定を確認してください。';
          } else if (error.code === 2) {
            errorMessage = '位置情報の取得に失敗しました。しばらく待ってからお試しください。';
          } else if (error.code === 3) {
            errorMessage = '位置情報の取得がタイムアウトしました。';
          }

          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: errorMessage,
            sender: 'bot'
          }]);

          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'エラーが発生しました。',
        sender: 'bot'
      }]);
      setLoading(false);
    }
  };

  const handlePoliceTipsSelect = async () => {
    setCurrentQuiz(null);
    setCurrentKnowledge(null);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: '防災ラボ呼び出し中...',
      sender: 'bot'
    }]);

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/police-tips`);
      if (response.data.data && response.data.data.length > 0) {
        let bousaiLabList = '防災ラボ\n\n';

        response.data.data.forEach((tip, idx) => {
          bousaiLabList += '【' + tip.category + '】\n';
          bousaiLabList += tip.title + '\n';
          bousaiLabList += tip.content + '\n';
          bousaiLabList += 'リンク：' + tip.url + '\n\n';
        });

        const bousaiLabMessage = {
          id: Date.now(),
          text: bousaiLabList,
          sender: 'bot',
          isUrl: true
        };

        // SessionStorage に防災ラボ情報を保存
        sessionStorage.setItem('bousaiLabState', JSON.stringify({
          message: bousaiLabMessage
        }));

        setMessages(prev => [...prev, bousaiLabMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: '防災ラボの取得に失敗しました。',
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerOption = async (optionIndex) => {
    const selectedAnswer = currentQuiz.options[optionIndex];

    try {
      console.log('Quiz:', currentQuiz);
      console.log('Sending answer:', {
        session_id: sessionId,
        quiz_id: currentQuiz.id,
        user_answer: selectedAnswer,
        category: currentQuiz.category
      });

      // 本来のエンドポイントに送信（quiz_idを文字列に変換）
      const response = await axios.post(`${API_BASE_URL}/api/quiz-answer`, {
        session_id: sessionId,
        quiz_id: String(currentQuiz.id),
        user_answer: selectedAnswer,
        category: currentQuiz.category
      });

      const { is_correct, correct_answer, message } = response.data;

      // スコアを更新
      setUserScore(prev => ({
        total: prev.total + 1,
        correct: prev.correct + (is_correct ? 1 : 0)
      }));

      // 結果メッセージを表示
      const resultText = is_correct
        ? `◯ ${message}`
        : `✖ ${message}`;

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: resultText,
        sender: 'bot'
      }]);

      // 解説を表示
      if (currentQuiz.explanation) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: '解説：\n' + currentQuiz.explanation,
            sender: 'bot',
            processAllContent: true
          }]);
        }, 500);
      }

      setAnswered(true);
      setShowNavigation(true);
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'エラーが発生しました。もう一度お試しください。',
        sender: 'bot'
      }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.toLowerCase();
    setMessages([...messages, { id: messages.length + 1, text: input, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      if (userInput.includes('クイズ')) {
        handleQuizSelect();
      } else if (userInput.includes('地震') || userInput.includes('洪水') || userInput.includes('水害') ||
                 userInput.includes('台風') || userInput.includes('火災') || userInput.includes('火山') ||
                 userInput.includes('備蓄') || userInput.includes('ペット')) {
        await handleKnowledgeByKeyword(userInput);
      } else if (userInput.includes('知識') || userInput.includes('防災知識')) {
        handleKnowledgeSelect();
      } else if (userInput.includes('避難')) {
        await handleShelterSelect();
      } else if (userInput.includes('便利技') || userInput.includes('便利')) {
        await handlePoliceTipsSelect();
      } else {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: 'クイズ、防災知識、避難所検索、便利技のいずれかを選んでください！',
          sender: 'bot'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-icon">
            <img src={`${process.env.PUBLIC_URL}/icon-512.png`} alt="防災コンシェルジュ" />
          </div>
          <div className="splash-message">
            <p>防災は『正解』がひとつではありません。</p>
            <p>学んだ知識を基に、あなたの環境・状況に合わせた対策を考えてみてください。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>防災コンシェルジュ</h1>
        {userScore.total > 0 && (
          <div className="score-display">
            <div className="score-info">
              スコア: <strong>{userScore.correct}/{userScore.total}</strong>
              {userScore.total > 0 && (
                <span className="accuracy">
                  ({Math.round((userScore.correct / userScore.total) * 100)}%)
                </span>
              )}
            </div>
            <button onClick={handleResetScore} className="reset-button">
              リセット
            </button>
          </div>
        )}
        <p>こんなことが聞けます：</p>
        <div className="quick-buttons">
          <button onClick={handleQuizSelect}>
            防災クイズ
          </button>
          <button onClick={handleKnowledgeSelect}>
            防災知識
          </button>
          <button onClick={handleShelterSelect}>
            📍 避難所を探す
          </button>
          <button onClick={handlePoliceTipsSelect}>
            防災ラボ
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            <div className={`message ${msg.sender}`}>
              <div className="message-content">
                {msg.isShelterInfo ? (
                  <>
                    {convertUrlsToLinks(msg.text).map((element, idx) => {
                      if (typeof element === 'string') {
                        const parts = element.split(/(i|ℹ️)/);
                        return (
                          <span key={idx}>
                            {parts.map((part, pidx) =>
                              part === 'i' || part === 'ℹ️' ? (
                                <button
                                  key={`info-${pidx}`}
                                  onClick={() => setShowShelterModal(true)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: '0',
                                    fontSize: 'inherit',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  {part}
                                </button>
                              ) : part
                            )}
                          </span>
                        );
                      }
                      return element;
                    })}
                  </>
                ) : (
                  msg.isUrl ? convertUrlsToLinks(msg.text) : (msg.processAllContent ? processContentRuby(msg.text) : convertFuriganaToRuby(msg.text))
                )}
              </div>
            </div>
            
            {mode === 'category_select' && idx === messages.length - 1 && (
              <div className="category-buttons">
                {(selectedType === 'quiz' ? quizCategories : knowledgeCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="category-button"
                  >
                    {categoryEmojis[cat]} {cat}
                  </button>
                ))}
              </div>
            )}

            {msg.quiz && (
              <div className="quiz-options">
                {msg.quiz.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerOption(optIdx)}
                    disabled={answered}
                    className="option-button"
                  >
                    {String.fromCharCode(65 + optIdx)}) {convertFuriganaToRuby(option)}
                  </button>
                ))}
              </div>
            )}

            {showNavigation && currentQuiz && idx === messages.length - 1 && (
              <div className="navigation-buttons">
                <button onClick={handleNextSameCategory} className="nav-button next">
                  ➡️ 次へ
                </button>
                <button onClick={handleChangeCategory} className="nav-button change">
                  他のジャンルを選ぶ
                </button>
              </div>
            )}

            {currentKnowledge && showNavigation && idx === messages.length - 1 && msg.sender === 'bot' && (
              <div className="navigation-buttons">
               <button onClick={handleNextSameCategory} className="nav-button next">
                  ➡️ 次へ
                </button>
                <button onClick={handleChangeCategory} className="nav-button change">
                   他のジャンルを選ぶ
                </button>
               </div>
            )}
          </div>
        ))}
        {loading && <div className="message bot"><div className="message-content">入力中...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      {showShelterModal && (
        <div className="shelter-modal-overlay" onClick={() => setShowShelterModal(false)}>
          <div className="shelter-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShelterModal(false)}>✕</button>
            <h3>避難所について</h3>
            <div className="modal-content">
              <p><strong>🔹指定緊急避難所</strong></p>
              <p>命を守るための一時的避難場所</p>
              <p style={{ marginTop: '16px' }}><strong>🔹指定避難所</strong></p>
              <p>災害後に生活するための施設</p>
            </div>
          </div>
        </div>
      )}

      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="何か聞いてみよう..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>送信</button>
      </form>

      <footer className="credits">
        <p>
          <strong>クイズ・防災知識の参考引用元：</strong><br />
          内閣府（防災担当）、総務省消防庁、東京消防庁、気象庁、環境省、農林水産省、厚生労働省、東京都、警視庁、空飛ぶ捜索医療団"ARROWS"、Yahoo!天気・災害、ALSOK
        </p>
      </footer>
    </div>
  );
};

export default ChatBot;