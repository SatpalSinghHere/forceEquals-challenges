
(() => {
  const jsonData = {
    companyName: "TechCorp",
    matchScore: 86,
    accountStatus: "Target"
  };
  chrome.storage.sync.set({ widgetVisible: true });
  const createWidget = () => {

    console.log("Entry function")
    // Check storage

    let isVisible = true; // default to true
    // if (typeof result.widgetVisible !== "undefined") {
    //   isVisible = result.widgetVisible;
    // }
    console.log("isVisible", isVisible)

    let widget = document.createElement("div");
    widget.id = "profile-enhancer-widget";
    widget.innerHTML = `
        <div class="header">
          <strong>${jsonData.companyName}</strong>
          <button id="toggle-btn">×</button>
        </div>
        <div class="score">
          <span>Match Score: ${jsonData.matchScore}%</span>
          <div class="progress">
            <div class="progress-bar" style="width: ${jsonData.matchScore}%"></div>
          </div>
        </div>
        <div class="status ${jsonData.accountStatus.toLowerCase()}">${jsonData.accountStatus}</div>
      `;


    if (!isVisible) widget.style.display = "none";
    document.body.appendChild(widget);

    console.log("widget appended")

    document.getElementById("toggle-btn").addEventListener("click", () => {
      const isNowVisible = widget.style.display !== "none";
      widget.remove()
      jsonData = null
      chrome.storage.sync.set({ widgetVisible: false });
    });

  };

  setTimeout(() => {
    chrome.storage.sync.get(["widgetVisible"], (result) => {
      console.log('result', result)
      if (result.widgetVisible !== false){
        createWidget();
      }
    })
  }, 1000)

})()
