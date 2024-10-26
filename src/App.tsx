import * as React from "react";

declare global {
  interface Window {
    electronAPI: {
      scrapeWebsite: (url: string) => Promise<string[]>;
    };
  }
}

const scrape = async () => {
  const data = await window.electronAPI.scrapeWebsite(
    "https://www.bbc.com/mundo/noticias-america-latina-55698861"
  );
  console.log("BREAKPOINT answer", data);
};

function App() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    void scrape();
  }, []);

  return (
    <>
      <div>
        <h1>💖 Hello World!</h1>
        <p>Welcome to your Electron application.</p>
      </div>
      <hr />
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}?
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
