import * as React from "react";

declare global {
  interface Window {
    electronAPI: {
      scrapeWebsite: (url: string) => Promise<string[]>;
    };
  }
}

type StyleObject = Record<string, React.CSSProperties>;

const scrape = async () => {
  const data = await window.electronAPI.scrapeWebsite(
    "https://www.bbc.com/mundo/noticias-america-latina-55698861"
  );
  console.log("BREAKPOINT answer", data);
};

function App() {
  const [webSites, setWebSites] = React.useState([""]);

  const addWebSite = () => {
    setWebSites((prev) => [...prev, ""]);
  };

  const removeWebSite = (index: number) => {
    return () => {
      if (webSites.length === 1) {
        setWebSites((prev) => {
          const newWebSites = [...prev];
          newWebSites[0] = "";
          return newWebSites;
        });
        return;
      }
      setWebSites((prev) => {
        const newWebSites = [...prev];
        newWebSites.splice(index, 1);
        return newWebSites;
      });
    };
  };

  const editWebSite = (index: number) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setWebSites((prev) => {
        const newWebSites = [...prev];
        newWebSites[index] = event.target.value;
        return newWebSites;
      });
    };
  };

  return (
    <div style={styles.root}>
      <h1>News Scraper</h1>

      <div style={styles.grid}>
        <div style={styles.inputs}>
          {webSites.map((value, index) => (
            <div style={styles.inputContainer}>
              <input key={index} value={value} onChange={editWebSite(index)} />
              <button style={styles.button} onClick={removeWebSite(index)}>
                -
              </button>
            </div>
          ))}
          <button style={styles.button} onClick={addWebSite}>
            +
          </button>
        </div>

        <div>Result?</div>
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
    gap: "2rem",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  button: {
    width: "40px",
  },
} satisfies StyleObject;

export default App;
