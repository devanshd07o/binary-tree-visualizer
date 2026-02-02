/* ================================
   APP ENTRY POINT
   Responsible for:
   - Initial setup
   - Input mode switching
================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       ELEMENT REFERENCES
    ================================ */

    const body = document.body;

    const inputModeRadios = document.querySelectorAll(
        'input[name="inputMode"]'
    );

    /* ================================
       INITIAL STATE
       Default: Array Input Mode
    ================================ */

    body.classList.add("input-mode-array");

    /* ================================
       INPUT MODE CHANGE HANDLER
    ================================ */

    inputModeRadios.forEach((radio) => {
        radio.addEventListener("change", (event) => {
            const selectedMode = event.target.value;

            // Remove both modes first (safe reset)
            body.classList.remove("input-mode-array");
            body.classList.remove("input-mode-visual");

            // Apply selected mode
            if (selectedMode === "array") {
                body.classList.add("input-mode-array");
            } else if (selectedMode === "visual") {
                body.classList.add("input-mode-visual");
            }
        });
    });

});
(function () {
    const incBtn = document.getElementById("fontInc");
    const decBtn = document.getElementById("fontDec");

    let fontScale = 1; // default

    function applyFontScale() {
        document.documentElement.style.fontSize = fontScale + "rem";
    }

    incBtn.addEventListener("click", () => {
        if (fontScale < 1.4) {
            fontScale += 0.1;
            applyFontScale();
        }
    });

    decBtn.addEventListener("click", () => {
        if (fontScale > 0.8) {
            fontScale -= 0.1;
            applyFontScale();
        }
    });
})();
(function () {
    const title = document.getElementById("appTitle");
    if (!title) return;

    title.addEventListener("click", () => {
        window.location.reload();
    });
})();
const industryToggle = document.getElementById("industryModeToggle");

if (industryToggle) {
    industryToggle.addEventListener("change", () => {
        document.body.classList.toggle(
            "industry-mode",
            industryToggle.checked
        );
    });
}

