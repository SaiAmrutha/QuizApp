//existing DOM elements selections
const infoBox = document.querySelector(".info_box");
const quizBox = document.querySelector(".quiz_box");
const resultBox = document.querySelector(".result_box");
const startBtn = document.querySelector(".start_btn button");
const exitBtn = document.querySelector(".info_box .quit");
const continueBtn = document.querySelector(".info_box .restart");
const nextQuesBtn = document.querySelector(".quiz_box .next_btn");
const replayBtn = document.querySelector(".result_box .restart");
const quitBtn = document.querySelector(".result_box .quit");
const questionText = document.querySelector(".que_text span");
const optionList = document.querySelector(".option_list");
const timerDisplay = document.querySelector(".timer_sec");
const scoreDisplay = document.querySelector(".score_text .score");
const questionCounter = document.querySelector(".total_que span");

//variables for quiz functionality
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let totalQuestions = 5;
let isAnswered = null;

//fetching questions from the json file
fetch("./questions.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load Json file");
    }
    return response.json();
  })
  .then((data) => {
    questions = data.questions
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);
  })
  .catch((error) => {
    console.error("Error fetching questions:", error);
  });

function show(element) {
  element.style.display = "block";
  element.style.pointerEvents = "auto";
  element.style.opacity = "1";
}

function hide(element) {
  element.style.display = "none";
  element.style.pointerEvents = "none";
  element.style.opacity = "0";
}

//Start quiz
startBtn.addEventListener("click", () => {
  hide(document.querySelector(".start_btn"));
  show(infoBox);
});

//exit quiz
exitBtn.addEventListener("click", () => {
  hide(infoBox);
  show(document.querySelector(".start_btn"));
});

//continue
continueBtn.addEventListener("click", () => {
  hide(infoBox);
  show(quizBox);
  initializeQuiz();
  startTimer();
});

function initializeQuiz() {
  fetch("./questions.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load JSON file");
      }
      return response.json();
    })
    .then((data) => {
      questions = data.questions
        .sort(() => Math.random() - 0.5)
        .slice(0, totalQuestions);
      currentQuestionIndex = 0;
      score = 0;
      loadQuestion();
    })
    .catch((error) => {
      console.error("Error initializing quiz", error);
    });
}

//load question and options
function loadQuestion() {
  if (currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex];
    console.log("Loading Question:", question.question);
    console.log("Options:", question.options);
    console.log("Correct Answer:", question.answer);

    questionText.textContent = question.question;
    optionList.innerHTML = "";

    question.options.forEach((option) => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "option";
      optionDiv.textContent = option;

      optionDiv.addEventListener("click", () => {
        console.log("Option Clicked:", option);
        selectOption(option, question.answer);
      });
      optionList.appendChild(optionDiv);
    });
    updateQuestionCounter();
  } else {
    endQuiz();
  }
}

function selectOption(selectedOption, correctAnswer) {
  if (isAnswered) return;
  isAnswered = true;

  //for making sure there is no minor formatting issues like extra spaces or capitalization
  const selOpt = selectedOption.trim().toLowerCase();
  const corAns = correctAnswer.trim().toLowerCase();

  const options = optionList.children;

  for (let option of options) {
    if (option.textContent.trim().toLowerCase() === corAns) {
      option.classList.add("correct");
      option.innerHTML +=
        '<div class="icon tick"><i class="fas fa-check"></i></div>';
    }
    if (
      option.textContent.trim().toLowerCase() === selOpt &&
      selOpt !== corAns
    ) {
      option.classList.add("incorrect");
      option.innerHTML +=
        '<div class="icon cross"><i class="fas fa-times"></i></div>';
    }
    option.classList.add("disabled");
  }

  if (selOpt === corAns) {
    score++;
  }

  clearInterval(timer);
  nextQuesBtn.classList.remove("disabled");
}

function updateQuestionCounter() {
  questionCounter.innerHTML = `<p>${
    currentQuestionIndex + 1
  }</p> of <p>${totalQuestions}</p> Questions`;
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timerDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      markTimeout();
    }
  }, 1000);
}

function markTimeout() {
  isAnswered = true;
  const question = questions[currentQuestionIndex];
  for (let option of optionList.children) {
    if (option.textContent === question.answer) {
      option.classList.add("correct");
    } else {
      option.classList.add("incorrect");
    }
  }
  nextQuesBtn.classList.remove("disabled");
}

nextQuesBtn.addEventListener("click", () => {
  if (!nextQuesBtn.classList.contains("disabled")) {
    currentQuestionIndex++;
    resetState();
    loadQuestion();
    startTimer();
  }
});

function resetState() {
  isAnswered = false;
  nextQuesBtn.classList.add("disabled");
  optionList.innerHTML = "";
}

function endQuiz() {
  console.log("Final Score:", score);
  clearInterval(timer);
  hide(quizBox);
  show(resultBox);
  scoreDisplay.textContent = `${score} out of ${questions.length}`;
}

//replayQuiz
replayBtn.addEventListener("click", () => {
  hide(resultBox);
  show(infoBox);
  resetQuiz();
});

function resetQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  isAnswered = false;
  questions.sort(() => Math.random() - 0.5).slice(0, totalQuestions);
}

//quitQuiz
quitBtn.addEventListener("click", () => {
  hide(resultBox);
  show(document.querySelector(".start_btn"));
  resetQuiz();
});
