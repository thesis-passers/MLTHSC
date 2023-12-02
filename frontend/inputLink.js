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
        Toast("Extracted text does not satisfy the word limit.", "failed");
      } else {
        Toast("Text successfully extracted!", "success");
      }
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
