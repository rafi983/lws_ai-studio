import { useState } from "react";

const usePollinations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImages = async ({
    prompt,
    width,
    height,
    model,
    seed,
    noLogo,
  }) => {
    setLoading(true);
    setError(null);

    const imagePromises = [];
    const encodedPrompt = encodeURIComponent(prompt);
    const baseSeed = seed
      ? parseInt(seed, 10)
      : Math.floor(Math.random() * 1000000000);

    for (let i = 0; i < 9; i++) {
      const currentSeed = baseSeed + i;

      let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${currentSeed}&model=${model}`;
      if (noLogo) {
        url += "&nologo=true";
      }

      const promise = new Promise((resolve, reject) => {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error("Request timed out after 60 seconds"));
        }, 60000); // 60 সেকেন্ড পর্যন্ত অপেক্ষা করবে

        fetch(url, { signal })
          .then((response) => {
            clearTimeout(timeoutId);
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            resolve({ imageBlob: blob, prompt });
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            if (err.name === "AbortError") {
              reject(new Error("Image generation timed out."));
            } else {
              reject(err);
            }
          });
      });
      imagePromises.push(promise);
    }

    try {
      const results = await Promise.allSettled(imagePromises);
      setLoading(false);
      return results;
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred while generating images.");
      console.error(err);
      return [];
    }
  };

  return { loading, error, generateImages };
};

export default usePollinations;
