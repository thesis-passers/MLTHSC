// Elements
const inputText = document.getElementById("input-text");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");
const labelsContainer = document.getElementById("labels-container");
const wordCountElement = document.getElementById("word-count");
const toggleLabelsBtn = document.getElementById("toggle-labels-btn");
const hideLabelsContainer = document.getElementById("hide-labels-container");
const noLabelsContainer = document.getElementById("no-labels-container");
const fileInput = document.getElementById("file-input");

// Tab Buttons
const inputTabBtn = document.getElementById("input-tab");
const uploadTabBtn = document.getElementById("upload-tab");
const linkTabBtn = document.getElementById("link-tab");
const imageTabBtn = document.getElementById("image-tab");

// Tab Content Sections
const inputSection = document.getElementById("input-section");
const uploadSection = document.getElementById("upload-section");
const linkSection = document.getElementById("link-section");
const imageSection = document.getElementById("image-section");

// Initialization
let allLabelsBelow50 = true;
updateSavedPostsDisplay();

// Tab handling
inputTabBtn.addEventListener("click", function () {
  showInputUI();
});

linkTabBtn.addEventListener("click", function () {
  showLinkUI();
});

uploadTabBtn.addEventListener("click", function () {
  showUploadUI();
});

imageTabBtn.addEventListener("click", function () {
  showImageUI();
});

function showInputUI() {
  fileInput.style.display = "none";
  document.getElementById("input-textbox").style.display = "block";
  linkSection.style.display = "none";
  imageSection.style.display = "none";
  resetLabels();
  fileInput.value = "";
  inputText.value = "";
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";
  document.getElementById("sample-hate-speech").selectedIndex = 0;
}

function showLinkUI() {
  fileInput.style.display = "none";
  document.getElementById("input-textbox").style.display = "none";
  linkSection.style.display = "block";
  imageSection.style.display = "none";
  resetLabels();
  fileInput.value = "";
  inputText.value = "";
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";
  document.getElementById("sample-hate-speech").selectedIndex = 0;
}

function showUploadUI() {
  fileInput.style.display = "block";
  document.getElementById("input-textbox").style.display = "none";
  linkSection.style.display = "none";
  imageSection.style.display = "none";
  resetLabels();
  fileInput.value = "";
  inputText.value = "";
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";
  document.getElementById("sample-hate-speech").selectedIndex = 0;
}

function showImageUI() {
  fileInput.style.display = "none";
  document.getElementById("input-textbox").style.display = "none";
  linkSection.style.display = "none";
  imageSection.style.display = "block";
  resetLabels();
  fileInput.value = "";
  inputText.value = "";
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";
  document.getElementById("sample-hate-speech").selectedIndex = 0;
}

document.addEventListener("DOMContentLoaded", function () {
  inputTabBtn.addEventListener("click", function () {
    inputTabBtn.classList.add("active");
    uploadTabBtn.classList.remove("active");
    linkTabBtn.classList.remove("active");
    imageTabBtn.classList.remove("active");

    inputSection.style.display = "block";
    uploadSection.style.display = "none";
    linkSection.style.display = "none";
    imageSection.style.display = "none";
  });

  uploadTabBtn.addEventListener("click", function () {
    uploadTabBtn.classList.add("active");
    inputTabBtn.classList.remove("active");
    linkTabBtn.classList.remove("active");
    imageTabBtn.classList.remove("active");

    uploadSection.style.display = "block";
    inputSection.style.display = "none";
    linkSection.style.display = "none";
    imageSection.style.display = "none";
  });

  linkTabBtn.addEventListener("click", function () {
    linkTabBtn.classList.add("active");
    inputTabBtn.classList.remove("active");
    uploadTabBtn.classList.remove("active");
    imageTabBtn.classList.remove("active");

    linkSection.style.display = "block";
    inputSection.style.display = "none";
    uploadSection.style.display = "none";
    imageSection.style.display = "none";
  });

  imageTabBtn.addEventListener("click", function () {
    imageTabBtn.classList.add("active");
    linkTabBtn.classList.remove("active");
    inputTabBtn.classList.remove("active");
    uploadTabBtn.classList.remove("active");

    imageSection.style.display = "block";
    linkSection.style.display = "none";
    inputSection.style.display = "none";
    uploadSection.style.display = "none";
  });
});

// Batch upload
function isValidFile(file) {
  const allowedExtensions = ["txt"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

fileInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];

  if (selectedFile && isValidFile(selectedFile)) {
    console.log("Selected file:", selectedFile);
    analyzeBtn.disabled = false;
    clearBtn.disabled = false;
  } else {
    alert("Please select a valid .txt file.");
    fileInput.value = "";
    disableButtons();
  }
});

// disable buttons
function disableButtons() {
  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
}

// Analyze Button
analyzeBtn.addEventListener("click", () => {
  console.log("Input Text: " + inputText.value);
  showAnalyzingState();
  setTimeout(() => {
    fetchLabels();
  }, 1000);
});

// Loading screen
function showAnalyzingState() {
  labelsContainer.classList.add("fade-out");
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";
  allLabelsBelow50 = true;
  toggleLabelsBtn.innerHTML =
    'Show Labels below 50% <i class="bx bx-chevron-down"></i>';

  setTimeout(() => {
    labelsContainer.innerHTML = `
      <div class="analyze_container">
          <p>Analyzing</p>
          <span class="loading-spinner"></span>
      </div>
  `;
    labelsContainer.classList.remove("fade-out");
  }, 500);

  // Scroll down to the labels container
  labelsContainer.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Labels Button below 50%
toggleLabelsBtn.addEventListener("click", () => {
  const labelElements = document.querySelectorAll(".label-container");

  labelElements.forEach((label) => {
    const labelPercent = label.querySelector(".label-percent");
    const percentValue = parseFloat(labelPercent.textContent);

    if (percentValue < 50 || label.style.display === "none") {
      label.style.display = label.style.display === "none" ? "block" : "none";
    }
  });

  if (allLabelsBelow50) {
    noLabelsContainer.style.display =
      noLabelsContainer.style.display === "none" ? "block" : "none";
  }

  const buttonText = toggleLabelsBtn.innerHTML.trim();
  toggleLabelsBtn.innerHTML =
    buttonText === 'Show Labels below 50% <i class="bx bx-chevron-down"></i>'
      ? 'Hide Labels below 50% <i class="bx bx-chevron-up"></i>'
      : 'Show Labels below 50% <i class="bx bx-chevron-down"></i>';
});

// Hide Labels below 50%
function hideLabelsInitially() {
  const labelElements = document.querySelectorAll(".label-container");

  labelElements.forEach((label) => {
    const labelPercent = label.querySelector(".label-percent");
    const percentValue = parseFloat(labelPercent.textContent);

    label.style.display = percentValue < 50 ? "none" : "block";
    hideLabelsContainer.style.display = "block";

    if (percentValue >= 50) {
      allLabelsBelow50 = false;
    }
  });

  if (allLabelsBelow50) {
    labelElements.forEach((label) => {
      label.style.display = "none";
    });

    noLabelsContainer.style.display = "block";
  }
}

// Clear Button
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  document.getElementById("sample-hate-speech").selectedIndex = 0;
  resetLabels();
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";

  fileInput.value = "";
});

// Model
function fetchLabels() {
  fetch(`http://127.0.0.1:5000/labels?input=${inputText.value}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // if fetch is successful, log the data

      let labels = data.labels;

      let resultHTML = "";

      for (let label of labels) {
        const probability = parseFloat(label.probability);

        resultHTML += `
          <div class="label-container result-fade-in">
            <div class="label label-${label.name} border-none" style="width: ${probability}%;">
              <span class="label-percent label-percent-${label.name}">${label.probability}</span>&nbsp;&nbsp;${label.name}
            </div>
          </div>`;
      }

      labelsContainer.innerHTML = resultHTML;
      hideLabelsInitially();

      /* After fetching, save to localstorage */
      saveToLocalStorage(data);
      updateSavedPostsDisplay();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// function pushData(data) {
//     savedPosts.push(data)
// }

// function executeFunctionNTimes(func, n, ...params) {
//     for (let i = 0; i < n; i++) {
//         func(...params);
//     }
//   }

// function resetLabels() {
//     const labelNames = ['Age', 'Gender', 'Physical', 'Race', 'Religion', 'Others'];
//     labelsContainer.innerHTML = '';

//     for (const labelName of labelNames) {
//       const labelContainer = document.createElement('div');
//       labelContainer.classList.add('label-container');

//       const labelElement = document.createElement('div');
//       labelElement.classList.add('label', 'border-none');
//       labelElement.innerHTML = `<span class="label-percent">0.00%</span>&nbsp;&nbsp;${labelName}`;

//       labelContainer.appendChild(labelElement);
//       labelsContainer.appendChild(labelContainer);
//     }
//   }

// Reset
function resetLabels() {
  labelsContainer.innerHTML = `
        <div class="label-container">
            <div class="label border-none">
                <span class="label-percent">0.00%</span>&nbsp;&nbsp;Age
            </div>
        </div>
        <div class="label-container">
            <div class="label border-none">
                <span class="label-percent">0.00%</span>&nbsp;&nbsp;Gender
            </div>
        </div>
        <div class="label-container">
            <div class="label border-none">
                <span class="label-percent">0.00%</span>&nbsp;&nbsp;Physical
            </div>
        </div>
        <div class="label-container">
            <div class="label border-none">
                <span class="label-percent">0.00%</span>&nbsp;&nbsp;Race
            </div>
        </div>
        <div class="label-container">
            <div class="label border-none">
                <span class="label-percent">0.00%</span>&nbsp;&nbsp;Religion
            </div>
        </div>
        <div class="label-container">
            <div class="label border-none">
                <span class="label-percent">0.00%</span>&nbsp;&nbsp;Others
            </div>
        </div>
    `;

  disableButtons();
}

// Word Count
document.addEventListener("DOMContentLoaded", function () {
  const inputElement = document.getElementById("input-text");

  inputElement.addEventListener("input", updateWordCount);
  updateWordCount();
});

function updateTextArea() {
  var selectedOption = document.getElementById("sample-hate-speech");
  var textArea = document.getElementById("input-text");
  textArea.value = selectedOption.value;
  updateWordCount();
}

function updateWordCount() {
  const wordCount = inputText.value.trim().split(/\s+/).filter(Boolean).length;
  wordCountElement.textContent = wordCount;

  clearBtn.disabled = wordCount === 0;

  if (wordCount < 3 || wordCount > 280) {
    wordCountElement.style.color = "red";
    analyzeBtn.disabled = true;
  } else {
    wordCountElement.style.color = "black";
    analyzeBtn.disabled = false;
  }
}

// dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  const selectedOption =
    document.getElementById("sample-hate-speech").options.selectedIndex;
  const textarea = document.getElementById("input-text");

  textarea.style.color = isDarkMode ? "white" : "black";
  /*document.getElementById("sample-hate-speech").options[selectedOption].style.backgroundColor = isDarkMode ? '#333' : 'white';*/
}
