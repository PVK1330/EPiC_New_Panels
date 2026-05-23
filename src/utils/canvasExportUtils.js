/**
 * html2canvas / html-to-image cannot parse modern CSS color functions (oklab, oklch)
 * used by Tailwind CSS v4. Inline resolved computed styles on a clone before capture.
 */

const UNSUPPORTED_COLOR_RE = /oklab|oklch|color-mix|\blab\(|\blch\(/i;

export function stripStylesheetsFromClone(clonedDoc) {
  clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
    node.remove();
  });
}

export function applyInlineComputedStyles(sourceRoot, cloneRoot) {
  if (!sourceRoot || !cloneRoot) return;

  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll("*")];
  const cloneNodes = [cloneRoot, ...cloneRoot.querySelectorAll("*")];
  const count = Math.min(sourceNodes.length, cloneNodes.length);

  for (let i = 0; i < count; i += 1) {
    const source = sourceNodes[i];
    const clone = cloneNodes[i];
    if (!(source instanceof Element) || !(clone instanceof Element)) continue;

    const computed = window.getComputedStyle(source);
    for (let j = 0; j < computed.length; j += 1) {
      const prop = computed[j];
      let value;
      try {
        value = computed.getPropertyValue(prop);
      } catch {
        continue;
      }
      if (!value || UNSUPPORTED_COLOR_RE.test(value)) continue;
      try {
        clone.style.setProperty(prop, value, computed.getPropertyPriority(prop));
      } catch {
        // Some properties are invalid on certain elements (e.g. SVG internals).
      }
    }
  }
}

/** html2canvas `onclone` — remove global stylesheets and inline resolved RGB styles. */
export function createHtml2CanvasOnCloneHandler(sourceElement) {
  return (clonedDoc) => {
    stripStylesheetsFromClone(clonedDoc);
    const cloneRoot =
      (sourceElement?.id && clonedDoc.getElementById(sourceElement.id)) ||
      clonedDoc.body?.firstElementChild;
    if (cloneRoot && sourceElement) {
      applyInlineComputedStyles(sourceElement, cloneRoot);
    }
  };
}

/** Detached clone with inline styles for html-to-image and similar libraries. */
export function cloneWithResolvedStyles(sourceElement) {
  const clone = sourceElement.cloneNode(true);
  applyInlineComputedStyles(sourceElement, clone);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:max-content;max-width:none;z-index:-1;pointer-events:none;background:#ffffff;";
  host.appendChild(clone);
  document.body.appendChild(host);

  return { clone, host };
}

export function removeCloneHost(host) {
  host?.parentNode?.removeChild(host);
}
