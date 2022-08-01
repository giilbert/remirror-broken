import "remirror/styles/all.css";
import jsx from "refractor/lang/jsx.js";
import typescript from "refractor/lang/typescript.js";
import {
  OnChangeJSON,
  PlaceholderExtension,
  Remirror,
  TableExtension,
  useEditorEvent,
  useHelpers,
  useRemirror,
} from "@remirror/react";
import { useCallback, useState } from "react";
import { ExtensionPriority, RemirrorJSON } from "remirror";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
  TrailingNodeExtension,
} from "remirror/extensions";
import { useMutation } from "@tanstack/react-query";

const STORAGE_KEY = "remirror-editor-content";

let pin: any | null = null;

const Editor: React.FC = () => {
  const mutation = useMutation((data: RemirrorJSON) => {
    return fetch("/api/hello", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

  const [initialContent] = useState<RemirrorJSON | undefined>(() => {
    // Retrieve the JSON from localStorage (or undefined if not found)
    const content = window.localStorage.getItem(STORAGE_KEY);
    return content ? JSON.parse(content) : undefined;
  });

  if (!pin) pin = (x: any) => mutation.mutate(x);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEditorChange = useCallback(
    (() => {
      // check to see whenever the callback is generated
      let id = Math.floor(Math.random() * 100000);

      return (json: RemirrorJSON) => {
        // Store the JSON in localStorage
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
        console.log("change", id);

        pin(json);
      };
    })(),
    []
  );

  return (
    <CoreEditor onChange={handleEditorChange} initialContent={initialContent} />
  );
};

interface MyEditorProps {
  onChange: (json: RemirrorJSON) => void;
  initialContent?: RemirrorJSON;
}

const OnBlurJSON: React.FC<{ handler: any }> = ({ handler }) => {
  const { getJSON } = useHelpers();

  useEditorEvent("blur", (inp) => {
    console.log("GETTING JSON");
    const json = getJSON();
    handler(json);
  });

  return null;
};

const CoreEditor: React.FC<MyEditorProps> = ({ onChange, initialContent }) => {
  const extensions = useCallback(
    () => [
      new LinkExtension({ autoLink: true }),
      new BoldExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      new LinkExtension(),
      new BlockquoteExtension(),
      new BulletListExtension({ enableSpine: true }),
      new OrderedListExtension(),
      new ListItemExtension({
        priority: ExtensionPriority.High,
        enableCollapsible: true,
      }),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),
      new TableExtension(),
      new MarkdownExtension({ copyAsMarkdown: false }),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
    ],
    []
  );

  const { manager } = useRemirror({
    extensions,
  });
  return (
    <div style={{ width: "100%", maxWidth: "500px" }}>
      <Remirror
        placeholder="Enter text..."
        manager={manager}
        autoRender={true}
        initialContent={initialContent}
      >
        <OnChangeJSON onChange={onChange} />
        {/* <OnBlurJSON handler={onChange} /> */}
      </Remirror>
    </div>
  );
};

export default Editor;
