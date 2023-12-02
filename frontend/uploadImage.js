async function processImage() {
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image");
    return;
  }

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

      const outputArea = document.getElementById("outputArea");
      outputArea.innerHTML = `<strong>Hate Speech:</strong><br>${data.hateSpeech}`;
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
