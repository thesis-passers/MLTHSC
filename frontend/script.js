// Elements
const inputText = document.getElementById("input-text");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");
const labelsContainer = document.getElementById("labels-container");
const tableContainer = document.getElementById("table-container");
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
const labelSection = document.getElementById("label-section");
const batchSection = document.getElementById("batch-section");

// Instructions
const inputDesc = document.getElementById("input-post-description");
const linkDesc = document.getElementById("input-link-description");
const fileDesc = document.getElementById("upload-file-description");
const imageDesc = document.getElementById("upload-image-description");

// Initialization

const freqContainer = document.getElementById("frequency-container");

// Initialization

let allLabelsBelow50 = true;
updateSavedPostsDisplay();

// Tab handling
function showTabUI(selectedTab) {
  // Define all UI sections
  const sections = {
    input: inputSection,
    link: linkSection,
    upload: uploadSection,
    image: imageSection,
  };

  // Hide all sections and reset common elements
  Object.values(sections).forEach(
    (section) => (section.style.display = "none")
  );
  resetLabels();
  resetTable();
  fileInput.value = "";
  inputText.value = "";
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";
  document.getElementById("sample-hate-speech").selectedIndex = 0;

  // Show the selected section
  if (sections[selectedTab]) {
    sections[selectedTab].style.display = "block";
    updateInstructions(selectedTab);
    labelSection.style.display = "block";
    batchSection.style.display = "none";
    if (selectedTab === "upload") {
      fileInput.style.display = "block"; // Show file input for upload tab
      batchSection.style.display = "block";
      labelSection.style.display = "none";
    }
  }
}

// Event listener for tab button clicks
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".tab").forEach((tabBtn) => {
    tabBtn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab")
        .forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const selectedTab = this.getAttribute("data-tab");
      showTabUI(selectedTab);

      resetTable();

      if (selectedTab != "upload") {
        analyzeBtn.style.display = "block";
        clearBtn.style.width = "50%";
      }
    });
  });
});

// disable buttons
function disableButtons() {
  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
  saveBtn.disabled = true;
  saveBatchBtn.disabled = true;

  const uploadSection = document.querySelector(".upload-section");
  const pElement = uploadSection.querySelector("p");
  const uploadIcon1 = document.getElementById("upload-icon1");
  const uploadIcon2 = document.getElementById("upload-icon2");
  pElement.textContent = "Drag your files here or click in this area.";
  uploadSection.style.backgroundColor = "";
  uploadIcon1.style.display = "block";
  uploadIcon2.style.display = "none";
}

// remove analyze button on upload tab
uploadTabBtn.addEventListener("click", function () {
  analyzeBtn.style.display = "none";
  clearBtn.style.width = "100%";
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

    // Scroll down
    // const elementPosition =
    //   labelsContainer.getBoundingClientRect().top + window.scrollY;
    // const offset = 400;
    // window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
  }, 500);
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
  resetTable();
  updateWordCount();
  hideLabelsContainer.style.display = "none";
  noLabelsContainer.style.display = "none";

  fileInput.value = "";
  saveBtn.disabled = true;
});

// Analyze Button
analyzeBtn.addEventListener("click", () => {
  console.log("Input Text: " + inputText.value);
  showAnalyzingState();
  setTimeout(() => {
    fetchLabelsAndDisplay();
  }, 1000);
});

function fetchLabelsAndDisplay() {
  fetchLabels()
    .then((data) => {
      currentPost = data;
      saveBtn.disabled = false;
      updateHTML(data.labels);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function fetchLabels() {
  const response = await fetch(
    `http://127.0.0.1:5000/labels?input=${inputText.value}`
  );
  const data = await response.json();
  console.log(data); // if fetch is successful, log the data
  return data;
}

function updateHTML(labels) {
  let resultHTML = "";

  for (let label of labels) {
    const probability = parseFloat(label.probability).toFixed(2);
    const labelClass = `label-${label.name.toLowerCase()}`;
    const labelPercentClass = `label-percent-${label.name.toLowerCase()}`;

    resultHTML += `
            <div class="label-container result-fade-in">
                <div class="label ${labelClass} border-none" style="width: ${probability}%;">
                    <span class="label-percent ${labelPercentClass}">${probability}%</span>&nbsp;&nbsp;${label.name}
                </div>
            </div>`;
  }

  labelsContainer.innerHTML = resultHTML;
  hideLabelsInitially();
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

// Toast
const Toast = (message, type) => {
  const toastContainer = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.classList.add("toast");

  if (type === "success") {
    toast.classList.add("success");
    toast.innerHTML = '<i class="bx bxs-check-circle"></i>' + message; // Use a success icon
  } else if (type === "failed") {
    toast.classList.add("failed");
    toast.innerHTML = '<i class="bx bxs-x-circle"></i>' + message; // Use a failed icon
  }

  toastContainer.appendChild(toast);

  toast.offsetHeight;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

// Instructions
function updateInstructions(selectedTab) {
  console.log("tab" + selectedTab);
  inputDesc.style.display = "none";
  linkDesc.style.display = "none";
  fileDesc.style.display = "none";
  imageDesc.style.display = "none";

  switch (selectedTab) {
    case "input":
      inputDesc.style.display = "block";
      break;
    case "link":
      linkDesc.style.display = "block";
      break;
    case "upload":
      fileDesc.style.display = "block";
      break;
    case "image":
      imageDesc.style.display = "block";
      break;
  }
}
