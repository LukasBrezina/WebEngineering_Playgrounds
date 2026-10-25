import React, {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';

export function Highlight({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [params] = useSearchParams(); // reads search term from url
  const term = params.get('q') ?? '';
  if (term === '') return <>{children}</>;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex special characters
  return <>{walk(children, new RegExp(`(${escaped})`, 'gi'))}</>; // gi = all matches, ignore upper/lower cases
}

// split one tring in text parts and mark parts, marks always sit at odd indexes
function mark(text: string, regex: RegExp): ReactNode[] {
  // on every uneven
  return text.split(regex).map((part, i) =>
    i % 2 === 1 ? (
      <mark className="highlight" key={i}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// recursively walk through the JSX tree and highlight every found string
// only works on text and native HTML elements (p, h2, b, etc.)
function walk(node: ReactNode, regex: RegExp): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === 'string') return mark(child, regex);
    if (child instanceof Promise) return null; // do not handle promises
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      typeof child.type === 'string'
    ) {
      return cloneElement(child, undefined, walk(child.props.children, regex));
    }
    return child;
  });
}
