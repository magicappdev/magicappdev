import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});

const win = dom.window as unknown as Window & typeof globalThis;

function assign<K extends keyof typeof globalThis>(key: K, value: unknown) {
  try {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  } catch {
    // some globals may already be configured; ignore
  }
}

assign("window", win);
assign("document", win.document);
assign("navigator", win.navigator);
assign("HTMLElement", win.HTMLElement);
assign("HTMLInputElement", win.HTMLInputElement);
assign("Node", win.Node);
assign("Event", win.Event);
assign("CustomEvent", win.CustomEvent);
assign("MouseEvent", win.MouseEvent);
assign("Element", win.Element);
assign("Document", win.Document);
assign("NodeList", win.NodeList);
assign("HTMLCollection", win.HTMLCollection);

export {};
