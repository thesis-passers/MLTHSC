// For buttons
linkInput.addEventListener("input", () => {
  const link = linkInput.value;
  clearBtn.disabled = link === "";
  extractBtn.disabled = !isValidLink(link);
});

function isValidLink(link) {
  return link.startsWith("https://www.reddit.com/r/");
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

async function extractFromLink() {
  const loadingToast = Toast("Extracting text please wait!", "loading", true);

  const link = linkInput.value;

  try {
    const response = await fetch("http://127.0.0.1:5000/extract-link-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Reddit Post Title:", data.postTitle);
      console.log("Reddit Post Content:", data.postContent);

      // Check if word count is within limits
      const wordCount = countWords(data.postContent);
      if (wordCount < 3 || wordCount > 280) {
        loadingToast.remove();
        Toast(
          "Extracted text does not satisfy the word limit.",
          "failed",
          false
        );
      } else {
        loadingToast.remove();
        Toast("Text successfully extracted!", "success", false);

        extractedTextbox.style.display = "block";
        extractedTextbox.value = data.postContent;

        showAnalyzingState();
        setTimeout(() => {
          fetchLabelsandDisplayForLink();
        }, 1000);
      }
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function fetchLabelsandDisplayForLink() {
  fetchLabelsLink()
    .then((data) => {
      currentPost = data;
      saveBtn.disabled = false;
      updateHTML(data.labels);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function fetchLabelsLink() {
  const response = await fetch(
    `http://127.0.0.1:5000/labels?input=${extractedTextbox.value}`
  );
  console.log("checking; " + extractedTextbox.value);
  const data = await response.json();
  console.log(data); // if fetch is successful, log the data
  return data;
}
