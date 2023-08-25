const
	visible = document.getElementById("canvas")
;

const hidden = visible.transferControlToOffscreen();
const worker = new Worker("myBlueNoiseworker.js");

worker.postMessage({ canvas: hidden, W: 32, H: 32  }, [hidden]);