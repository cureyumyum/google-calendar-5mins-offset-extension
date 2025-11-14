/*
 * Google Calendar 5-Minute Start Offset
 */

/**
 * * (React
 * @param {HTMLInputElement} inputElement - 
 * @param {string} newTimeStr - 
 */
function setTime(inputElement, newTimeStr) {
    inputElement.value = newTimeStr;
    const event = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(event);
    const changeEvent = new Event('change', { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
}

/**
 * * (mousedown, mouseup, click)
 * @param {HTMLElement} element - 
 */
function simulateRealClick(element) {
    // 1. mousedown
    const mouseDownEvent = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(mouseDownEvent);

    // 2. mouseup
    const mouseUpEvent = new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(mouseUpEvent);

    // 3. click
    const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(clickEvent);
}


/**
 * * @param {HTMLElement} dialog - 
 */
function observeDialog(dialog) {
  
  if (dialog.dataset.offsetDone) {
    return;
  }
  dialog.dataset.offsetDone = 'true';

  const startTimeSelector = 'input[aria-label="開始時間"], input[aria-label="Start time"]';
  const endTimeSelector = 'input[aria-label="終了時間"], input[aria-label="End time"]';
  const titleSelector = 'input[aria-label="タイトルを追加"], input[aria-label="Add title"]';

  const startTimeInput = dialog.querySelector(startTimeSelector);

  if (startTimeInput) {
    
    setTimeout(() => {
      let originalEndTime = null;
      
      const endTimeInput_forSave = dialog.querySelector(endTimeSelector);
      const titleInput_forSave = dialog.querySelector(titleSelector);
      
      if (endTimeInput_forSave) {
        originalEndTime = endTimeInput_forSave.value;
      }

      // 1. 
      const timeStr = startTimeInput.value;
      const regex = /(\d{1,2}):(00|30)/;
      
      if (regex.test(timeStr)) {
        
        const [_, hour, minute] = timeStr.match(regex);
        const newMinute = (minute === "00") ? "05" : "35";
        const newTimeStr = timeStr.replace(regex, `${hour}:${newMinute}`);

        // 
        setTime(startTimeInput, newTimeStr);
        
        // 
        if (titleInput_forSave) {
            titleInput_forSave.focus();
        }
        
        // 2. 
        if (endTimeInput_forSave && originalEndTime) {
          
          setTimeout(() => {
            // 
            const endTimeInput_forRestore = dialog.querySelector(endTimeSelector);
            const titleInput_forRestore = dialog.querySelector(titleSelector);

            if (endTimeInput_forRestore && titleInput_forRestore) {
                
                // 
                setTime(endTimeInput_forRestore, originalEndTime);
                
                // 
                simulateRealClick(titleInput_forRestore);
            }
          }, 200); // 
        }
      }
    }, 200); // 

  }
}

// --- 
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const dialog = node.matches('div[role="dialog"]') ? node : node.querySelector('div[role="dialog"]');
          if (dialog) {
            observeDialog(dialog);
          }
        }
      });
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });