import ReactDOM from "react-dom/client";
import FeedbackWidget from "./components/widget/FeedbackWidget";

const normalizeAttribute = (attribute: string): string => {
  return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

class WidgetWebComponent extends HTMLElement {
  private root: ReactDOM.Root | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const props = this.getPropsFromAttributes();
    if (this.shadowRoot) {
      this.root = ReactDOM.createRoot(this.shadowRoot);
      this.root.render(<FeedbackWidget {...props} />);
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }

  private getPropsFromAttributes(): Record<string, string> {
    const props: Record<string, string> = {};
    for (const { name, value } of this.attributes) {
      props[normalizeAttribute(name)] = value;
    }
    return props;
  }
}

export default WidgetWebComponent;

// Register the Web Component
customElements.define("feedback-widget", WidgetWebComponent);
