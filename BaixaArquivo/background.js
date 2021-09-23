//Variéveis de identificação do download e da fila de links a serem baixados
var downloadIds = [];
var queue = [];

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.message == "addToQueue") {
			queue = queue.concat(request.urls);
			processQueue();
		}
	}
);

function processQueue() {
	while (queue.length > 0) {
		var url = queue.pop();
		chrome.downloads.download({ "url": url }, function (downloadId) {
			downloadIds.push(downloadId);
			});
		}
	}
