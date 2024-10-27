import { useQueries } from "@tanstack/react-query";
import * as React from "react";

declare global {
  interface Window {
    electronAPI: {
      scrapeWebsite: (url: string) => Promise<{
        firstP: string | null;
        title: string | null;
        subtitle: string | null;
        url: string;
      }>;
    };
  }
}

type StyleObject = Record<string, React.CSSProperties>;

const scrapeWebsite = async (url: string) => {
  try {
    new URL(url);
  } catch {
    return null;
  }

  return window.electronAPI.scrapeWebsite(url);
};

const getText = (text?: string | null) =>
  text?.endsWith(".") ? text : `${text}.`;

function App() {
  const [websites, setWebsites] = React.useState([""]);
  const textRef = React.useRef<HTMLUListElement>(null);

  const results = useQueries({
    queries: websites.map((website) => ({
      queryKey: ["websites", website],
      queryFn: () => scrapeWebsite(website),
      staleTime: Infinity,
    })),
  });

  const addWebsite = () => {
    setWebsites((prev) => [...prev, ""]);
  };

  const removeWebsite = (index: number) => {
    return () => {
      if (websites.length === 1) {
        setWebsites((prev) => {
          const newWebsites = [...prev];
          newWebsites[0] = "";
          return newWebsites;
        });
        return;
      }
      setWebsites((prev) => {
        const newWebsites = [...prev];
        newWebsites.splice(index, 1);
        return newWebsites;
      });
    };
  };

  const editWebsite = (index: number) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setWebsites((prev) => {
        const newWebsites = [...prev];
        newWebsites[index] = event.target.value;
        return newWebsites;
      });
    };
  };

  const handleCopy = async () => {
    const htmlToCopy = textRef.current?.innerHTML;

    if (!htmlToCopy) {
      alert("Error copying the text");
      return;
    }

    const blob = new Blob([htmlToCopy], { type: "text/html" });
    const clipboardItem = new ClipboardItem({ "text/html": blob });

    try {
      await navigator.clipboard.write([clipboardItem]);
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy formatted text: ", err);
    }
  };

  return (
    <div style={styles.root}>
      <h1>News Scraper</h1>

      <div style={styles.grid}>
        <div style={styles.inputs}>
          {websites.map((value, index) => (
            <div key={index} style={styles.inputContainer}>
              <input
                value={value}
                onChange={editWebsite(index)}
                style={styles.input}
              />
              <button style={styles.button} onClick={removeWebsite(index)}>
                -
              </button>
            </div>
          ))}
          <button style={styles.button} onClick={addWebsite}>
            +
          </button>
        </div>

        <div style={styles.resultContainer}>
          {results.some((result) => result.isLoading) ? (
            "Loading..."
          ) : (
            <>
              {results.length && results[0].data?.url && (
                <button onClick={handleCopy}>Copy text</button>
              )}
              <ul ref={textRef} style={styles.result}>
                {results.map((value, index) =>
                  value.data?.firstP ||
                  value.data?.subtitle ||
                  value.data?.title ? (
                    <li key={index}>
                      <p style={styles.resultText}>
                        <span style={styles.resultTitle}>
                          {getText(value.data?.title)}
                        </span>
                        {` ${getText(value.data.subtitle)} ${getText(
                          value.data.firstP
                        )}`}
                        <br />
                        <a href={value.data.url}>{value.data.url}</a>
                      </p>
                    </li>
                  ) : (
                    <React.Fragment key={index} />
                  )
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    padding: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "1rem",
    width: "100%",
  },
  inputs: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "5px",
  },
  input: {
    flex: 1,
  },
  button: {
    width: "40px",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  result: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  resultTitle: {
    fontWeight: "bold",
  },
  resultText: {
    margin: 0,
  },
} satisfies StyleObject;

export default App;
