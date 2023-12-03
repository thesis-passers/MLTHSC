imageInput.addEventListener("change", () => {
  if (imageInput.files.length === 0) {
    Toast("Please select an image file.", "failed", false);
    return;
  }

  const file = imageInput.files[0];
  const fileName = file.name;

  fileNameElement.textContent = fileName;
  uploadedImage.src = URL.createObjectURL(file);
  uploadedImage.style.display = "block";

  const imageIcon = document.getElementById("image-icon");
  imageIcon.style.display = "none";

  imageBtn.disabled = false;
  clearBtn.disabled = false;
});

async function processImage() {
  const loadingToast = Toast("Extracting text please wait!", "loading", true);

  const file = imageInput.files[0];

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("http://127.0.0.1:8080/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Hate Speech:", data.hateSpeech);

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
        extractedTextbox.value = data.hateSpeech;

        showAnalyzingState();
        setTimeout(() => {
          fetchLabelsandDisplay2();
        }, 1000);
      }
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
