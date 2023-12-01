// Batch upload
function isValidFile(file) {
  const allowedExtensions = ["txt"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

// Read batches
fileInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];

  if (selectedFile && isValidFile(selectedFile)) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileContent = e.target.result;
      processFileContent(fileContent);
    };

    reader.readAsText(selectedFile);
  } else {
    Toast("Please select a valid .txt file.");
    fileInput.value = "";
    disableButtons();
  }
});

function processFileContent(content) {
  const sentences = content.split(/\n/);
  const nonEmptySentences = sentences.filter(
    (sentence) => sentence.trim() !== ""
  );

  nonEmptySentences.forEach((sentence, index) => {
    setTimeout(() => {
      inputText.value = sentence.trim();

      const inputTextValue = inputText.value.trim();
      const wordCount = inputTextValue.split(/\s+/).filter(Boolean).length;


      if (inputTextValue !== "" && wordCount >= 3 && wordCount <= 280) {
        showAnalyzingState();
        fetchLabelsForBatches();
        clearBtn.disabled = false;
      } else {
        Toast("Some sentences not analyzed! Please review the word count.");
        disableButtons();
        fileInput.value = "";
      }

      if (index === nonEmptySentences.length - 0) {
        inputText.value = "";
      }
    }, index * 2000);
  });
}

function fetchLabelsForBatches() {
  fetch(`http://127.0.0.1:5000/labels?input=${inputText.value}`)
    .then((response) => response.json())
    .then((data) => {
      currentPost = data;
      saveBtn.disabled = false;

      console.log(data);

      let labels = data.labels;
      let resultLabelProbabilityHTML = "";
      let probabilities = [];

      for (let label of labels) {
        const probability = parseFloat(label.probability).toFixed(2);
        probabilities.push(probability);

        resultLabelProbabilityHTML += `<span class="all-labels"> ${label.name} - ${probability}%  </span>`;
      }

      updateResultTable(inputText.value, resultLabelProbabilityHTML);
      hideLabelsInitially();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Update table
function updateResultTable(sentence, probabilitiesHTML) {
    const resultTableBody = document.querySelector("#table-container tbody");
  
    const row = resultTableBody.insertRow();
  
    const postCell = row.insertCell(0);
    const probabilitiesCell = row.insertCell(1);
  
    postCell.textContent = sentence;
    probabilitiesCell.innerHTML = probabilitiesHTML; 
}
  
// Reset
function resetTable() {
    const existingTableBody = document.querySelector("#table-container tbody");

    if (existingTableBody) {
        existingTableBody.remove();
    }

    const newTableBody = document.createElement("tbody");
    tableContainer.appendChild(newTableBody);
}
