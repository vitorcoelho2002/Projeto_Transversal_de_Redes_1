//Espera a página toda carregar primeiro
$(document).ready(function() {

	//Pegar os links da página atual
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, {"message": "getLinks"});
	});

	//Evento de clicar no botão de download
	$('#download-btn').click(function () {
		//Número de arquivos é o número de checkboxes selecionadas da listTable
		var numberOfFiles = $('#listTable input.checkbox:checked').length;
		//Se o número de arquivos for maior que 5
		if(numberOfFiles > 5){
			//Abre um alert para verificar se o usúario deseja prosseguir o download dos arquivos
			var resposta = window.confirm("Tem certeza que deseja baixar muitos arquivos?");
				//Se prosseguir, envia os links selecionados para uma fila para serem baixados
				if (resposta) {
					var urls = [];
					$('#listTable input.checkbox:checked').parent().parent().find('td.url').each(function (i, el) {
						urls.push($(el).attr('title'));
					});
					chrome.runtime.sendMessage({ "message": "addToQueue", "urls": urls });
					}
				//Se não prosseguir, os downloads são cancelados
				else {
					alert("Downloads cancelados")
				}
			}
		//Se o número de arquivos for menor que 5, envia os links selecionados para uma fila para serem baixados
		else{
			var urls = [];
			$('#listTable input.checkbox:checked').parent().parent().find('td.url').each(function (i, el) {
				urls.push($(el).attr('title'));
			});
			
			chrome.runtime.sendMessage({ "message": "addToQueue", "urls": urls });
		}
	});

});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.message == "links") {

    	$('#listTable').html('');

    	if (request.links.length > 0) {
	    	$(request.links).each(function (i, val) {
	    		var row = $('<tr class="link"><td class="checkbox"><input type="checkbox" class="checkbox"></td><td class="url"><span class="part1"></span><span class="part2"></span><span class="part3"></span></td><td class="description"></td></tr>');
	    		//Pegar a descrição de cada URL
				row.find('td.description').text(val.description);
	    		
		    	var match;
		    	if (match = val.url.match(/^(.*\/)?([^\/\?]+)(\?.*)$/)) {
	    			row.find('td.url span.part2').text(match[2]);
	    			row.find('td.url span.part3').text(match[3]);
		    	}

		    	else if (match = val.url.match(/^(.*\/)?([^\/\?]+)$/)) {
	    			row.find('td.url span.part2').text(match[2]);
		    	}

		    	else {
	    			row.find('td.url span.part1').text(val.url);
		    	}

	    		row.find('td.url').attr('title', val.url);
	    		$('#listTable').append(row);
	    	});
	    }
		else {
			$('#listTable').html('<tr><td class="checkbox"></td><td class="url"><span class="part3">Links não encontrados.</span></span></td><td class="Description"></td></tr>');
		}	   

		//Checkbox de selecionar todos os links
		$("#toggle_all").change(function(){
			var status = this.checked; 
			$('#listTable input.checkbox').each(function(){
				//Muda cada uma das células da tabela para "selecionada"
				this.checked = status; 
				//Muda a cor da célula selecionada para azul
				if ($(this).is(':checked')) {
					$(this).parent().parent().addClass('blue');
				}
				else {
					$(this).parent().parent().removeClass('blue');
				}
			});
			//Número de arquivos é o número de checkboxes selecionadas da listTable
    		var numberOfFiles = $('#listTable input.checkbox:checked').length;
    		$('#download-btn').text('Iniciar download (' + numberOfFiles + ' arquivo' + (numberOfFiles == 1 ? '' : 's') + ')')
    		//Altera a propriedade do botão de download
			if (numberOfFiles > 0) {
    			$('#download-btn').prop('disabled', false);
    		}
    		else {
    			$('#download-btn').prop('disabled', true);
    		}
		});
		
 		//Muda cada célula da tabela para "selecionada" individualmente
    	$('#listTable input.checkbox').change(function () {
    		if ($(this).is(':checked')) {
    			$(this).parent().parent().addClass('blue');
    		}
    		else {
    			$(this).parent().parent().removeClass('blue');
    		}
    		var numberOfFiles = $('#listTable input.checkbox:checked').length;
    		$('#download-btn').text('Iniciar download (' + numberOfFiles + ' arquivo' + (numberOfFiles == 1 ? '' : 's') + ')')
    		if (numberOfFiles > 0) {
    			$('#download-btn').prop('disabled', false);
    		}
    		else {
    			$('#download-btn').prop('disabled', true);
    		}
    	});

		$('#listTable tr.link').mousedown(function () {
			if (!shift) {
				selectStart = $(this).index();
				selectEnd = selectStart;
			}
			else {
				selectEnd = $(this).index();
			}
			selecting = true;
			drawSelection();
		});

		
		$('#listTable tr.link').mouseover(function () {
			if (selecting) {
				selectEnd = $(this).index();
				drawSelection();
			}
		});

		$(document).mouseup(function () {
			selecting = false;
			drawSelection();
		});

		drawSelection();

    }

});

//Variáveis de seleção
var selecting = false;
var selectStart = 0;
var selectEnd = 0;

function drawSelection() {
	$('#listTable tr.link').each(function (i, el) {
		if (i >= Math.min(selectStart, selectEnd) && i <= Math.max(selectStart, selectEnd)) {
			$(el).addClass('selected');
		}
		else {
			$(el).removeClass('selected');
		}
	});
}

var shift = false;
$(document).on('keyup keydown', function(e) {
	shift = e.shiftKey
});

function globStringToRegex(str) {
    return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');
}

function preg_quote (str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}