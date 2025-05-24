import { useRef, useState, useEffect } from "react";

const usePollinations = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobUrlsRef = useRef([]);

  const generateImages = async ({
    prompt,
    model,
    width,
    height,
    seed,
    noLogo,
  }) => {
    setLoading(true);
    setError(null);

    // Clean up previous images
    blobUrlsRef.current.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    blobUrlsRef.current = [];
    setImages([]);

    const fetchPromises = Array.from({ length: 9 }).map(async (_, i) => {
      const currentSeed =
        (seed ? parseInt(seed, 10) : Math.floor(Math.random() * 1000000000)) +
        i;

      const params = new URLSearchParams({
        model: model || "playground-v2.5",
        width: String(width),
        height: String(height),
        seed: String(currentSeed),
        nologo: String(noLogo),
      });

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
      console.log(`👉 Fetching image ${i + 1}/9:`, url);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const contentType = res.headers.get("Content-Type");

        if (!res.ok || !contentType || !contentType.startsWith("image/")) {
          console.warn(
            `❌ Invalid response for image ${i + 1}. Status: ${res.status}, Content-Type: ${contentType}`,
          );
          throw new Error(`Invalid image response (status ${res.status})`);
        }

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.push(objectUrl);
      } catch (err) {
        console.warn(`❌ Failed to fetch image ${i + 1}:`, err.message);
        blobUrlsRef.current.push(null);
      }
    });

    await Promise.all(fetchPromises);
    setImages([...blobUrlsRef.current]);
    setLoading(false);
  };

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  return { generateImages, images, loading, error };
};

export default usePollinations;
