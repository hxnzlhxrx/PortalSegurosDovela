/* Presentation-only state for asynchronous inbox tables. */
(function () {
  "use strict";
  const requests = new Map();

  function announce(id, text) {
    const status = document.getElementById(id + "-status");
    if (status) status.textContent = text;
  }
  function busy(id, value) {
    const body = document.getElementById(id);
    if (body) (body.closest("table") || body).setAttribute("aria-busy", String(value));
  }
  function message(id, columns, text, retry) {
    const body = document.getElementById(id);
    if (!body) return;
    const row = document.createElement("tr");
    row.setAttribute("data-table-state", retry ? "error" : "empty");
    const cell = document.createElement("td");
    cell.colSpan = columns;
    cell.className = "table-message";
    const label = document.createElement("p");
    label.textContent = text;
    cell.appendChild(label);
    if (retry) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost btn-sm";
      button.textContent = "Reintentar";
      button.addEventListener("click", retry);
      cell.appendChild(button);
    }
    row.appendChild(cell);
    body.replaceChildren(row);
  }
  window.PortalTableState = {
    begin(id, columns, label) {
      const token = Symbol(id);
      requests.set(id, { token, phase: "loading" });
      busy(id, true);
      announce(id, label);
      const body = document.getElementById(id);
      if (body) {
        const cells = Array.from({ length: columns }, () =>
          '<td><span class="table-skeleton"></span></td>'
        ).join("");
        body.innerHTML = Array.from({ length: 5 }, () =>
          '<tr data-table-state="loading" aria-hidden="true">' + cells + '</tr>'
        ).join("");
      }
      return token;
    },
    current(id, token) { return requests.get(id)?.token === token; },
    blocked(id) {
      const phase = requests.get(id)?.phase;
      return phase === "loading" || phase === "error";
    },
    end(id, token) {
      if (!this.current(id, token)) return;
      requests.get(id).phase = "ready";
      busy(id, false);
      announce(id, "");
    },
    error(id, token, columns, text, retry) {
      if (!this.current(id, token)) return;
      requests.get(id).phase = "error";
      busy(id, false);
      message(id, columns, text, retry);
      announce(id, text);
    },
    empty(id, columns, text) { message(id, columns, text); }
  };
})();
