let isFileUploaded = false;

// Batch upload
function isValidFile(file) {
  const allowedExtensions = ["txt"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

// Read batches
fileInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];
  isFileUploaded = true;

  if (isFileUploaded) {
    isFileUploaded = false;
    resetTable();
  }

  if (selectedFile && isValidFile(selectedFile)) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileContent = e.target.result;
      processFileContent(fileContent);
    };

    reader.readAsText(selectedFile);

    const uploadSection = document.querySelector(".upload-section");
    const pElement = uploadSection.querySelector("p");
    const uploadIcon1 = document.getElementById("upload-icon1");
    const uploadIcon2 = document.getElementById("upload-icon2");
    pElement.textContent = `Uploaded File: ${selectedFile.name}`;
    uploadSection.style.backgroundColor = "#80808040";
    uploadIcon1.style.display = "none";
    uploadIcon2.style.display = "block";

    Toast("File successfully uploaded!", "success", false);
  } else {
    Toast("Please select a valid .txt file.", "failed", false);
    fileInput.value = "";
  }
});

function processFileContent(content) {
  const loadingToast = Toast("Extracting text please wait!", "loading", true);
  const sentences = content.split(/\n/);
  const nonEmptySentences = sentences.filter(
    (sentence) => sentence.trim() !== ""
  );

  clearBtn.disabled = true;

  nonEmptySentences.forEach((sentence, index) => {
    setTimeout(() => {
      inputText.value = sentence.trim();

      const inputTextValue = inputText.value.trim();
      const wordCount = inputTextValue.split(/\s+/).filter(Boolean).length;

      if (inputTextValue !== "" && wordCount >= 3 && wordCount <= 280) {
        showAnalyzingState();
        fetchLabelsForBatches(index, nonEmptySentences.length);
      } else {
        Toast(
          "Current line does not follow the prescribed word count. Skipping sentence.....",
          "failed",
          false
        );
        fileInput.value = "";
      }

      if (index === nonEmptySentences.length - 0) {
        inputText.value = "";
      }

      if (index === nonEmptySentences.length - 1) {
        clearBtn.disabled = false; // Re-enable clear button after processing is complete
        loadingToast.remove();
      }
    }, index * 2000);
  });

  saveBatchBtn.disabled = false;
}

function fetchLabelsForBatches(currentIndex, totalSentences) {
  fetch(`http://127.0.0.1:8080/labels?input=${inputText.value}`)
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
        const labelColor = getLabelColor(label.name);

        resultLabelProbabilityHTML += `<span class="all-labels" style="background-color: ${labelColor};">${probability}% ${label.name}</span>`;
      }

      updateResultTable(inputText.value, resultLabelProbabilityHTML);
      hideLabelsInitially();

      batchPosts.push(currentPost);

      if (currentIndex === totalSentences - 1) {
        clearBtn.disabled = false;

        saveBatchBtn.disabled = false;
        Toast("Done analyzing file", "success", false);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      clearBtn.disabled = false;
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

// label color
function getLabelColor(labelName) {
  const colors = {
    age: "#dc2626",
    gender: "#ea580c",
    physical: "#c9ae02",
    race: "#16a38b",
    religion: "#0f3a97",
    others: "#3f3b3b",
  };
  return colors[labelName.toLowerCase()] || "#ffffff"; // Default color if no match found
}
