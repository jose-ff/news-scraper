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

function App() {
  const [websites, setWebsites] = React.useState([""]);

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

        <div style={styles.result}>
          {results.some((result) => result.isLoading)
            ? "Loading..."
            : results.map((value, index) =>
                value.data?.firstP ||
                value.data?.subtitle ||
                value.data?.title ? (
                  <div key={index}>
                    <a
                      style={styles.resultTitle}
                      href={value.data.url}
                      target="_blank"
                    >
                      {value.data.title ?? value.data.url}
                    </a>
                    {value.data?.subtitle && (
                      <p style={styles.resultText}>{value.data.subtitle}</p>
                    )}
                    {value.data?.firstP && (
                      <p style={styles.resultText}>{value.data.firstP}</p>
                    )}
                  </div>
                ) : (
                  <React.Fragment key={index} />
                )
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
  result: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 0,
  },
  resultText: {
    margin: 0,
  },
} satisfies StyleObject;

export default App;
