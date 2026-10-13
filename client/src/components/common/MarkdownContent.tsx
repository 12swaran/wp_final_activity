import Markdown from 'react-markdown';
export function MarkdownContent({ children }: { children: string }) {
  return (
    <Markdown
      skipHtml
      components={{
        h1: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-5 mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="my-3 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
        a: ({ node, ...props }) => (
          <a className="underline text-primary" rel="noreferrer" {...props} />
        ),
      }}
    >
      {children}
    </Markdown>
  );
}
