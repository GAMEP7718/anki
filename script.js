    let wordMap = {};
    let currentWord = null;
    let currentSubject = "数学";
    let correctCount = 0;
    let totalCount = 0;

    function saveToStorage() {
      localStorage.setItem('wordMap', JSON.stringify(wordMap));
    }

    function loadFromStorage() {
      const data = localStorage.getItem('wordMap');
      if (data) {
        try {
          wordMap = JSON.parse(data);
        } catch (e) {
          console.error('localStorageデータの解析エラー:', e);
        }
      }
    }

    window.onload = () => {
      loadFromStorage();
      changeSubject();
    };

    function saveWord() {
      const subject = document.getElementById('subject').value;
      const word = document.getElementById('word').value;
      const meaning = document.getElementById('meaning').value;
      if (!word || !meaning) return alert("単語と意味を入力してください");

      if (!wordMap[subject]) wordMap[subject] = [];
      wordMap[subject].push({ word, meaning });

      saveToStorage();

      alert("保存しました");
      document.getElementById('word').value = '';
      document.getElementById('meaning').value = '';
      if (subject === currentSubject) {
        nextQuiz();
        displayWordList();
      }
    }

    function changeSubject() {
      currentSubject = document.getElementById('quiz-subject').value;
      correctCount = 0;
      totalCount = 0;
      nextQuiz();
      displayWordList();
    }

    function nextQuiz() {
      const list = wordMap[currentSubject] || [];
      if (list.length === 0) {
        document.getElementById('quiz').textContent = '単語が登録されていません';
        return;
      }
      currentWord = list[Math.floor(Math.random() * list.length)];
      document.getElementById('quiz').textContent = currentWord.meaning;
      document.getElementById('answer').value = '';
      document.getElementById('result').textContent = '';
      document.getElementById('score').textContent = `正解数: ${correctCount} / 回答数: ${totalCount}`;
    }

    function checkAnswer() {
      const ans = document.getElementById('answer').value.trim();
      const resultEl = document.getElementById('result');
      totalCount++;
      if (ans === currentWord.word) {
        resultEl.textContent = '正解！';
        resultEl.className = 'correct';
        correctCount++;
      } else {
        resultEl.textContent = `不正解... 正解は「${currentWord.word}」`;
        resultEl.className = 'incorrect';
      }
      document.getElementById('score').textContent = `正解数: ${correctCount} / 回答数: ${totalCount}`;
      setTimeout(nextQuiz, 2000);
    }

    function displayWordList() {
      const list = wordMap[currentSubject] || [];
      const container = document.getElementById('word-list');
      if (list.length === 0) {
        container.innerHTML = '<p>登録された単語はありません。</p>';
        return;
      }
      let html = '<table><tr><th>単語</th><th>意味</th><th>操作</th></tr>';
      list.forEach((entry, index) => {
        html += `<tr>
          <td><input value="${entry.word}" onchange="editWord(${index}, 'word', this.value)"></td>
          <td><input value="${entry.meaning}" onchange="editWord(${index}, 'meaning', this.value)"></td>
          <td><button onclick="deleteWord(${index})">削除</button></td>
        </tr>`;
      });
      html += '</table>';
      container.innerHTML = html;
    }

    function deleteWord(index) {
      wordMap[currentSubject].splice(index, 1);
      saveToStorage();
      displayWordList();
      nextQuiz();
    }

    function editWord(index, key, value) {
      wordMap[currentSubject][index][key] = value;
      saveToStorage();
    }

    function downloadWords() {
      const blob = new Blob([JSON.stringify(wordMap, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'wordmap.json';
      link.click();
    }

    function uploadWords(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirm('現在の単語データを上書きしてもよろしいですか？')) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      wordMap = JSON.parse(e.target.result);
      saveToStorage();
      changeSubject();
      alert('単語データを読み込みました');
    } catch (err) {
      alert('ファイルの読み込みに失敗しました');
    }
  };
  reader.readAsText(file);
    }