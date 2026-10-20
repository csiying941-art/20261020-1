// p5.js 食物分辨拖曳測驗系統 - sketch.js

let questions = [];          // 宣告全域變數：儲存 6 個食物題目資料
let options = [];            // 宣告全域變數：儲存下方文字選項物件陣列
let dropZones = [];          // 宣告全域變數：儲存上方圖片目標放置區物件陣列
let submitButton;            // 宣告全域變數：交卷看成績按鈕
let resultText = "";         // 宣告全域變數：儲存結算成績的顯示文字
let showResult = false;      // 宣告全域變數：判斷是否已經按下交卷看成績的旗標
let confettiParticles = [];  // 宣告全域變數：儲存彩帶慶祝特效的粒子陣列
let isPassed = false;        // 宣告全域變數：判斷總成績是否高於 60% 的旗標

function setup() {
  // 建立全螢幕響應式畫布，自動填滿瀏覽器視窗寬高
  createCanvas(windowWidth, windowHeight);
  
  // 初始化食物測驗題目資料
  initQuestions();
  
  // 初始化排版、上方放置區與下方選項物件座標
  initLayout();
  
  // 建立「交卷看成績」按鈕並設定其外觀與事件
  submitButton = createButton('交卷看成績');
  styleSubmitButton();
  submitButton.mousePressed(checkAnswers);
}

function draw() {
  // 設定畫布背景顏色為柔和的淺灰色
  background(240, 243, 246);
  
  // 繪製頂端標題與操作說明文字
  drawHeader();
  
  // 繪製上方 6 個食物圖片目標放置區
  drawDropZones();
  
  // 繪製下方 6 個可供滑鼠拖曳的文字選項
  drawOptions();
  
  // 如果使用者已經點擊交卷按鈕，則顯示成績面板
  if (showResult) {
    displayResultPanel();
    
    // 如果成績高於 60%，在畫布播放彩帶慶祝特效
    if (isPassed) {
      handleConfetti();
    }
  }
}

// 初始化 6 個食物分辨測驗題目
function initQuestions() {
  questions = [
    { id: 0, title: "新鮮水果類", gifName: "apple", answer: "紅蘋果" },
    { id: 1, title: "綠色蔬菜類", gifName: "broccoli", answer: "綠花椰菜" },
    { id: 2, title: "主食澱粉類", gifName: "rice", answer: "白米飯" },
    { id: 3, title: "優質蛋白質", gifName: "salmon", answer: "鮭魚排" },
    { id: 4, title: "乳製品與鈣質", gifName: "milk", answer: "鮮乳" },
    { id: 5, title: "健康堅果類", gifName: "almond", answer: "杏仁果" }
  ];
}

// 初始化版面配置與座標（確保格子與選項大小完全一致）
function initLayout() {
  dropZones = []; // 清空放置區陣列
  options = [];   // 清空選項陣列
  
  let cols = 3;   // 設定每列放置 3 個項目
  let zoneWidth = width / 3.6;   // 計算每個放置區的寬度
  let zoneHeight = height * 0.22; // 計算每個放置區的高度
  let startX = width * 0.08;     // 版面左側起始邊距
  let startY = height * 0.12;    // 版面上方起始邊距
  
  // 計算統一的選項與放置格子大小（兩者尺寸完全相同）
  let itemWidth = zoneWidth * 0.85;
  let itemHeight = height * 0.048;
  
  // 迴圈建立上方 6 個食物目標放置區
  for (let i = 0; i < questions.length; i++) {
    let col = i % cols;          // 計算當前行索引
    let row = floor(i / cols);   // 計算當前列索引
    let x = startX + col * (zoneWidth + width * 0.03); // 計算 X 座標
    let y = startY + row * (zoneHeight + height * 0.04); // 計算 Y 座標
    
    dropZones.push({
      x: x,                      // 放置區外框 X
      y: y,                      // 放置區外框 Y
      w: zoneWidth,              // 放置區外框寬
      h: zoneHeight,             // 放置區外框高
      boxW: itemWidth,           // 內部文字放置框寬
      boxH: itemHeight,          // 內部文字放置框高
      question: questions[i],    // 對應的題目資料
      currentOption: null        // 目前放入此區的選項物件（初始為空）
    });
  }
  
  // 取得所有正確答案文字，並透過 shuffle() 隨機打亂順序增加挑戰性
  let shuffledAnswers = questions.map(q => q.answer);
  shuffledAnswers = shuffle(shuffledAnswers);
  
  let optStartX = width * 0.12;   // 下方選項群組左側起始邊距
  let optStartY = height * 0.53;  // 下方選項群組上方起始邊距
  
  // 迴圈建立下方 6 個文字選項物件
  for (let i = 0; i < shuffledAnswers.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = optStartX + col * (itemWidth + width * 0.06);
    let y = optStartY + row * (itemHeight + height * 0.02);
    
    options.push({
      text: shuffledAnswers[i],  // 選項文字內容
      x: x,                      // 當前 X 座標
      y: y,                      // 當前 Y 座標
      w: itemWidth,              // 寬度（與上方格子相同）
      h: itemHeight,             // 高度（與上方格子相同）
      originalX: x,              // 記錄初始 X 座標（用於放回原位）
      originalY: y,              // 記錄初始 Y 座標
      isDragging: false,         // 是否正在被滑鼠拖曳中
      assignedZone: null         // 目前被分配到的放置區
    });
  }
}

// 繪製頂端標題與說明文字
function drawHeader() {
  push(); // 儲存繪圖樣式狀態
  textAlign(CENTER, CENTER); // 文字置中對齊
  fill(30, 41, 59);          // 設定深色文字顏色
  textSize(Math.min(width * 0.022, 24)); // 響應式字體大小
  textStyle(BOLD);           // 粗體
  text("健康飲食大挑戰 - 食物分類拖曳測驗系統", width / 2, height * 0.045);
  
  textSize(Math.min(width * 0.012, 14));
  fill(100, 116, 139);       // 設定副標題灰色
  text("請將下方的正確食物名稱拖曳至上方對應的圖片題目格子中", width / 2, height * 0.085);
  pop(); // 恢復繪圖樣式狀態
}

// 繪製上方 6 個食物題目與目標格子
function drawDropZones() {
  for (let i = 0; i < dropZones.length; i++) {
    let dz = dropZones[i];
    
    push();
    // 繪製每個放置區的白色外框背景卡片
    fill(255);
    stroke(203, 213, 225);
    strokeWeight(2);
    rectMode(CORNER);
    rect(dz.x, dz.y, dz.w, dz.h, 12);
    
    // 繪製上方模擬動態 GIF 的區塊背景
    fill(226, 232, 240);
    noStroke();
    rect(dz.x + 10, dz.y + 10, dz.w - 20, dz.h * 0.40, 8);
    
    // 顯示動畫 GIF 提示文字
    fill(71, 85, 105);
    textSize(Math.min(width * 0.011, 12));
    textAlign(CENTER, CENTER);
    text(`[ 動畫 GIF: ${dz.question.gifName} ]`, dz.x + dz.w / 2, dz.y + dz.h * 0.20);
    
    // 顯示題目名稱說明
    textSize(Math.min(width * 0.011, 13));
    textStyle(BOLD);
    fill(15, 23, 42);
    text(dz.question.title, dz.x + dz.w / 2, dz.y + dz.h * 0.52);
    
    // 計算並繪製放置選項的目標格子（尺寸與下方選項完全一樣）
    let boxX = dz.x + (dz.w - dz.boxW) / 2;
    let boxY = dz.y + dz.h * 0.62;
    fill(248, 250, 252);
    stroke(148, 163, 184);
    strokeWeight(1.5);
    rect(boxX, boxY, dz.boxW, dz.boxH, 6);
    
    // 如果此格子內已經放入選項，則在格子內繪製該選項文字
    if (dz.currentOption) {
      fill(37, 99, 235);     // 藍色文字
      noStroke();
      textSize(Math.min(width * 0.011, 13));
      textStyle(BOLD);
      text(dz.currentOption.text, boxX + dz.boxW / 2, boxY + dz.boxH / 2);
    } else {
      // 若尚未放入，顯示提示文字
      fill(148, 163, 184);
      noStroke();
      textSize(Math.min(width * 0.01, 11));
      textStyle(NORMAL);
      text("拖曳選項至此", boxX + dz.boxW / 2, boxY + dz.boxH / 2);
    }
    pop();
  }
}

// 繪製下方可供拖曳的文字選項
function drawOptions() {
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    
    push();
    // 如果選項正在被滑鼠拖曳中，讓它的座標跟隨滑鼠移動
    if (opt.isDragging) {
      opt.x = mouseX - opt.w / 2;
      opt.y = mouseY - opt.h / 2;
    }
    
    // 繪製選項按鈕外觀（大小與上方格子完全一致）
    fill(59, 130, 246);
    stroke(29, 78, 216);
    strokeWeight(2);
    rectMode(CORNER);
    rect(opt.x, opt.y, opt.w, opt.h, 6);
    
    // 繪製選項內的白色文字
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(Math.min(width * 0.011, 13));
    textStyle(BOLD);
    text(opt.text, opt.x + opt.w / 2, opt.y + opt.h / 2);
    pop();
  }
}

// 滑鼠按下事件：檢查是否點擊到下方文字選項以開始拖曳
function mousePressed() {
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    // 判斷滑鼠是否落在選項範圍內
    if (mouseX >= opt.x && mouseX <= opt.x + opt.w &&
        mouseY >= opt.y && mouseY <= opt.y + opt.h) {
      
      // 如果該選項原本已經放在某個放置區內，先將該放置區清空
      if (opt.assignedZone) {
        opt.assignedZone.currentOption = null;
        opt.assignedZone = null;
      }
      
      opt.isDragging = true; // 設定為拖曳狀態
      break; // 每次只抓取一個選項
    }
  }
}

// 滑鼠放開事件：檢查是否將選項放置到上方的目標格子中
function mouseReleased() {
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    if (opt.isDragging) {
      opt.isDragging = false; // 結束拖曳狀態
      let droppedInZone = false;
      
      // 檢查是否放置在任一個上方放置區範圍內
      for (let j = 0; j < dropZones.length; j++) {
        let dz = dropZones[j];
        let boxX = dz.x + (dz.w - dz.boxW) / 2;
        let boxY = dz.y + dz.h * 0.62;
        
        // 判斷滑鼠是否放開在目標格子範圍內
        if (mouseX >= boxX && mouseX <= boxX + dz.boxW &&
            mouseY >= boxY && mouseY <= boxY + dz.boxH) {
          
          // 如果該格子已經有其他選項，先將舊選項退回其初始位置
          if (dz.currentOption) {
            dz.currentOption.assignedZone = null;
            dz.currentOption.x = dz.currentOption.originalX;
            dz.currentOption.y = dz.currentOption.originalY;
          }
          
          // 將新選項放入此放置區
          dz.currentOption = opt;
          opt.assignedZone = dz;
          
          // 精準貼齊到該格子的正中央位置
          opt.x = boxX;
          opt.y = boxY;
          
          droppedInZone = true;
          break;
        }
      }
      
      // 如果沒有放在任何合法放置區內，則讓選項歸回到原本的初始位置
      if (!droppedInZone) {
        opt.x = opt.originalX;
        opt.y = opt.originalY;
      }
      break;
    }
  }
}

// 點擊「交卷看成績」按鈕後執行的成績計算函式
function checkAnswers() {
  let correctCount = 0;
  let totalQuestions = questions.length;
  
  // 檢查每一個放置區內的選項是否正確對應答案
  for (let i = 0; i < dropZones.length; i++) {
    let dz = dropZones[i];
    if (dz.currentOption) {
      if (dz.currentOption.text === dz.question.answer) {
        correctCount++; // 答對題數加一
      }
    }
  }
  
  // 計算百分比成績
  let percentage = (correctCount / totalQuestions) * 100;
  isPassed = percentage > 60; // 判斷是否大於 60%
  
  // 組合結算顯示文字
  resultText = `測驗完成！答對題數：${correctCount} / ${totalQuestions} (${percentage.toFixed(0)}%)`;
  showResult = true; // 開啟成績顯示旗標
  
  // 若成績高於 60%，初始化彩帶粒子特效
  if (isPassed) {
    initConfetti();
  }
}

// 繪製成績結算面板
function displayResultPanel() {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  // 繪製半透明結算白色背景卡片（位於畫布中下方）
  fill(255, 255, 255, 248);
  stroke(203, 213, 225);
  strokeWeight(2);
  rect(width / 2, height * 0.72, width * 0.5, height * 0.11, 14);
  
  // 顯示分數結果文字
  fill(isPassed ? 22 : 220, isPassed ? 163 : 38, isPassed ? 74 : 38);
  textSize(Math.min(width * 0.014, 16));
  textStyle(BOLD);
  text(resultText, width / 2, height * 0.70);
  
  // 顯示及格與否的評語
  textSize(Math.min(width * 0.01, 12));
  fill(71, 85, 105);
  let statusMsg = isPassed ? "🎉 太棒了！成績超過 60%，獲得彩帶慶祝！" : "💪 哎呀！再加油試試看，分數需大於 60% 喔！";
  text(statusMsg, width / 2, height * 0.745);
  pop();
}

// 初始化彩帶慶祝特效的粒子陣列
function initConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: random(width),                  // 隨機水平位置
      y: random(-height, 0),             // 畫布上方隨機高度落下
      size: random(8, 15),               // 彩帶大小
      color: color(random(255), random(255), random(255)), // 隨機彩帶顏色
      speedY: random(2, 6),              // 下落速度
      speedX: random(-2, 2),             // 左右飄動速度
      rotation: random(TWO_PI),          // 旋轉角度
      rotationSpeed: random(-0.05, 0.05) // 旋轉速度
    });
  }
}

// 處理彩帶粒子動畫與繪製
function handleConfetti() {
  push();
  for (let i = 0; i < confettiParticles.length; i++) {
    let p = confettiParticles[i];
    
    fill(p.color);
    noStroke();
    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    rectMode(CENTER);
    rect(0, 0, p.size, p.size * 0.6, 2);
    pop();
    
    // 更新粒子物理座標
    p.y += p.speedY;
    p.x += p.speedX + sin(frameCount * 0.05); // 增加自然擺動感
    p.rotation += p.rotationSpeed;
    
    // 如果粒子掉出畫布下方，重新回到畫布上方循環落下
    if (p.y > height) {
      p.y = random(-50, 0);
      p.x = random(width);
    }
  }
  pop();
}

// 設定「交卷看成績」按鈕樣式，並精準固定在畫布最下方
function styleSubmitButton() {
  let btnWidth = 200;
  let btnHeight = 45;
  submitButton.position((width - btnWidth) / 2, height - btnHeight - 15);
  submitButton.size(btnWidth, btnHeight);
  submitButton.style('background-color', '#10b981'); // 翠綠色按鈕
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '8px');
  submitButton.style('font-size', '16px');
  submitButton.style('font-weight', 'bold');
  submitButton.style('cursor', 'pointer');
  submitButton.style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
}

// 視窗大小改變時自動重新調整畫布與按鈕位置，維持完美響應式
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLayout();
  let btnWidth = 200;
  let btnHeight = 45;
  submitButton.position((width - btnWidth) / 2, height - btnHeight - 15);
}