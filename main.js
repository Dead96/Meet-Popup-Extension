console.log("Meet Presentation Extension loaded");

function main() {
  const videos = Array.from(document.querySelectorAll("video").values())
    .filter((v) => !isHidden(v) && isVideoRunning(v));
  const unlistened = videos.filter((v) => !v.hasAttribute("data-listened"));
  unlistened.forEach((v) => v.setAttribute("data-listened", "true"));
  unlistened.length > 0 && console.log("New videos found: ", unlistened.length);
  unlistened
    .map((v) => ({ video: v, parent: getVideoParent(v) }))
    .map((e) => ({ video: e.video, parent: e.parent, more_options_button: getMoreVertButton(e.parent) }))
    .forEach((e) => {
      try { listenButtonEvent(e); }
      catch (err) {
        e.video.removeAttribute("data-listened");
      }
    });
  setTimeout(main, 1000);
}

function getVideoParent(elem) {
  return elem.parentNode.getAttribute("data-participant-id") ? elem.parentNode : getVideoParent(elem.parentNode);
}

function isHidden(elem) {
  return elem.offsetParent === null || window.getComputedStyle(elem).display === "none";
}

function isVideoRunning(video) {
  return !video.paused;
}

function getMoreVertButton(e) {
  return Array.from(e.querySelectorAll("button").values()).find(
    (b) => b.querySelector("i")?.textContent === "more_vert"
  );
}

function listenButtonEvent(e) {
  e.more_options_button.addEventListener("click", () => {
    setTimeout(() => loadOpenButton(e));
  });
}

function loadOpenButton(e) {
  const li = Array.from(document.querySelectorAll("ul li").values()).reverse()[0];
  const newLi = document.createElement("li");
  newLi.classList = li.classList;
  for (var child of li.childNodes.values()) {
    const newChild = child.cloneNode();
    for(const innerChild of child.childNodes.values()) {
      const newInnerChild = innerChild.cloneNode(true);
      if(newInnerChild.tagName === 'I') {
        newInnerChild.innerText = e.dialog ? 'open_in_new_off' : 'open_in_new';
      } else if(newInnerChild.tagName === 'SPAN') {
        newInnerChild.innerText = e.dialog ? 'Close external window' : 'Open in a new window';
      }
      newChild.appendChild(newInnerChild);
    }
    newLi.appendChild(newChild);
  }
  li.parentNode.insertBefore(newLi, li.nextSibling);
  newLi.addEventListener("click", () => {
    if(!e.dialog) {
      e.dialog = openPresentation(e);
    } else {
      e.dialog.close();
    }
    e.more_options_button.click();
  });
}

function openPresentation(e) {
  let params = ["height=" + screen.height, "width=" + screen.width].join(",");
  let presentationPopup = window.open("", "popup_window", params);
  let doc = presentationPopup.document;
  let html = doc.createElement("html");

  let style = doc.createElement("style");
  style.innerText =
    "body { margin: 0 !important; background: black; } video { width: 100vw !important; height: 100vh !important }";
  let head = doc.createElement("head");
  head.appendChild(style);

  let body = doc.createElement("body");

  let title = doc.createElement("title");
  title.textContent = document.title + " - Presentation";
  head.appendChild(title);
  html.appendChild(head);
  html.appendChild(body);
  doc.replaceChild(html, doc.documentElement);

  let presentation = e.video;
  if (presentation) {
    let parent = presentation.parentElement;
    doc.body.appendChild(presentation);
    presentationPopup.addEventListener("beforeunload", () => {
      parent.appendChild(presentation);
      e.dialog = null;
    });
    return presentationPopup;
  }
}

main();