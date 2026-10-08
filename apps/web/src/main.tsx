import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { missingConfig } from "./supabaseClient";
import "./index.css";

function SetupNeeded() {
  return (
    <div className="app" style={{ justifyContent: "center" }}>
      <main className="app-body" style={{ flex: "none", gap: 14 }}>
        <p className="kicker">Setup needed</p>
        <h1 className="title title-l">
          Not
          <br />
          <span className="outline">Connected</span>
        </h1>
        <p className="dim">
          This build of Bar Raiser was made without its database settings, so the game can't load.
        </p>
        <div className="list">
          {missingConfig.map((name) => (
            <div key={name} className="list-row">
              <span className="mono" style={{ fontSize: 13 }}>{name}</span>
              <span className="meta">missing</span>
            </div>
          ))}
        </div>
        <p className="dim" style={{ fontSize: 14 }}>
          Fix: in Cloudflare Pages, open pole-vault-trivia, then Settings, then Variables and Secrets. Add
          the missing names to both Production and Preview, then retry the deployment.
        </p>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{missingConfig.length ? <SetupNeeded /> : <App />}</React.StrictMode>
);
